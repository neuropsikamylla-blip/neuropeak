"""Corta uma prancha do formato novo (sem enunciado, sem numero) nas suas cenas.
A grade se acha pelas faixas CLARAS que separam os quadros: linhas inteiras de
pixels quase brancos atravessando a imagem."""
import sys, os
import numpy as np
from PIL import Image

LIMIAR_CLARO = 225      # pixel considerado "separador"
FRACAO = 0.92           # fracao da linha que precisa estar clara

def faixas(perfil):
    """Agrupa indices consecutivos marcados como separador em faixas (inicio, fim)."""
    out, ini = [], None
    for i, v in enumerate(perfil):
        if v and ini is None: ini = i
        elif not v and ini is not None:
            out.append((ini, i - 1)); ini = None
    if ini is not None: out.append((ini, len(perfil) - 1))
    return out

def cortes(perfil, tamanho):
    """Converte faixas separadoras em intervalos de conteudo."""
    seps = [f for f in faixas(perfil) if (f[1] - f[0] + 1) >= 2]
    blocos, pos = [], 0
    for a, b in seps:
        if a - pos > tamanho * 0.08:      # bloco precisa ter largura minima
            blocos.append((pos, a - 1))
        pos = b + 1
    if tamanho - pos > tamanho * 0.08:
        blocos.append((pos, tamanho - 1))
    return blocos

def corta(caminho, destino):
    im = Image.open(caminho).convert("RGB")
    a = np.asarray(im.convert("L"), dtype=np.uint8)
    h, w = a.shape
    linhas = (a > LIMIAR_CLARO).mean(axis=1) >= FRACAO     # horizontais
    colunas = (a > LIMIAR_CLARO).mean(axis=0) >= FRACAO    # verticais
    ys, xs = cortes(linhas, h), cortes(colunas, w)
    os.makedirs(destino, exist_ok=True)
    n = 0
    for (y0, y1) in ys:
        for (x0, x1) in xs:
            n += 1
            im.crop((x0, y0, x1 + 1, y1 + 1)).save(f"{destino}/{n}.png")
    return len(ys), len(xs), n

if __name__ == "__main__":
    ly, lx, n = corta(sys.argv[1], sys.argv[2])
    print(f"grade {ly} linhas x {lx} colunas = {n} cenas -> {sys.argv[2]}")

# ---------------------------------------------------------------------------
# Usado no lote 2 (23/set/2026) para cortar 20 pranchas do formato novo.
# Detectou sozinho as tres grades presentes: 3x2 (6 cenas), 4x2 (8) e 2x2 (4).
#
# O formato novo das pranchas dispensa qualquer limpeza posterior: vem SEM faixa
# de enunciado, SEM plaquinha motivacional e SEM o disco numerado dentro do quadro.
# Nao ha gabarito impresso para apagar. Para pranchas do formato antigo, o numero
# ainda precisa sair -- ver tira-numero-da-cena.py.
# ---------------------------------------------------------------------------
