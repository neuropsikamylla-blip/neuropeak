"""
Gera todos os áudios TTS possíveis do exercício FocusAgents
usando a voz pt-BR-FranciscaNeural (Microsoft Neural - gratuita via edge-tts).

Execução:
  uv run --with edge-tts python scripts/generate_tts.py
"""

import asyncio
import hashlib
import json
import os

import edge_tts

VOICE      = "pt-BR-FranciscaNeural"
RATE       = "-8%"    # ligeiramente mais lento para clareza clínica
OUTPUT_DIR = "public/exercises/audio/tts"
MANIFEST   = "data/tts-manifest.ts"

# ── Dados espelhados de data/agents.ts ───────────────────────────────────────

AGENTS = [
    {"id": "neo",    "cor": "azul",      "acessorio": "fone de ouvido", "isRobot": False,
     "variants": ["com fone de ouvido", "sem acessório", "com fone, óculos escuros e relógio"]},
    {"id": "nexo",   "cor": "azul",      "acessorio": "boné",           "isRobot": False,
     "variants": ["com boné vermelho", "com microfone", "com boné, mochila e microfone"]},
    {"id": "mindra", "cor": "roxo",      "acessorio": "óculos",         "isRobot": False,
     "variants": ["com óculos", "sem acessório", "com óculos, fone e tablet"]},
    {"id": "fokus",  "cor": "verde",     "acessorio": "fone de ouvido", "isRobot": False,
     "variants": ["com fone de ouvido", "com capuz", "com fone e cesta"]},
    {"id": "ignite", "cor": "laranja",   "acessorio": "capuz",          "isRobot": False,
     "variants": ["com capuz", "com capuz e mochila", "com capuz, gravata e relógio"]},
    {"id": "redex",  "cor": "vermelho",  "acessorio": "capuz",          "isRobot": False,
     "variants": ["com capuz", "com capuz e mochila", "com capuz e fone azul"]},
    {"id": "axon",   "cor": "cinza",     "acessorio": "capacete",       "isRobot": True,
     "variants": ["de uniforme cinza", "de uniforme rosa", "de uniforme laranja"]},
    {"id": "lumen",  "cor": "amarelo",   "acessorio": "touca",          "isRobot": False,
     "variants": ["com touca", "sem touca", "com touca, fone e óculos escuros"]},
]

PREFIXES = {
    "CLINICAL": "Clique no agente",
    "COLORFUL": "Clique na criaturinha",
    "GAMIFIED": "Clique no avatar",
}

COLORS = ["azul", "verde", "roxo", "laranja", "vermelho", "cinza", "amarelo"]

# ── Geração dos textos ────────────────────────────────────────────────────────

def all_commands():
    texts = set()

    for theme, prefix in PREFIXES.items():
        # D1-3: cor simples
        for cor in COLORS:
            texts.add(f"{prefix} {cor}")

        # D4-7: cor + acessório
        for agent in AGENTS:
            texts.add(f"{prefix} {agent['cor']} com {agent['acessorio']}")

        # D8-10: variantes
        for agent in AGENTS:
            for label in agent["variants"]:
                if agent["isRobot"]:
                    texts.add(f"Clique no robô {label}")
                else:
                    texts.add(f"{prefix} {agent['cor']} {label}")

    return sorted(texts)

# ── Geração dos arquivos ──────────────────────────────────────────────────────

async def generate_one(text: str, path: str):
    communicate = edge_tts.Communicate(text, VOICE, rate=RATE)
    await communicate.save(path)

async def main():
    os.makedirs(OUTPUT_DIR, exist_ok=True)
    commands = all_commands()

    manifest: dict[str, str] = {}
    tasks = []

    for text in commands:
        slug = hashlib.md5(text.encode()).hexdigest()[:10]
        filename = f"{slug}.mp3"
        filepath = os.path.join(OUTPUT_DIR, filename)
        manifest[text] = filename
        if not os.path.exists(filepath):
            tasks.append((text, filepath))

    if not tasks:
        print("✓ Todos os áudios já existem — nada a gerar.")
    else:
        # Gera em lotes de 8 para não sobrecarregar a API
        for i in range(0, len(tasks), 8):
            batch = tasks[i:i+8]
            await asyncio.gather(*[generate_one(t, p) for t, p in batch])
            for t, _ in batch:
                print(f"  ✓ {t}")

    # Salva o manifesto como TS
    manifest_ts = (
        "// Gerado automaticamente por scripts/generate_tts.py — não editar manualmente\n"
        "export const TTS_MANIFEST: Record<string, string> = "
        + json.dumps(manifest, ensure_ascii=False, indent=2)
        + ";\n"
    )
    with open(MANIFEST, "w", encoding="utf-8") as f:
        f.write(manifest_ts)

    print(f"\n✓ {len(manifest)} comandos mapeados → {MANIFEST}")
    print(f"✓ Áudios em {OUTPUT_DIR}/")

asyncio.run(main())
