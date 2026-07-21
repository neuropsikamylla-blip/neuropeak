# Geração de Assets em Lote (Etapa 4)

Pipeline automatizado para produzir a biblioteca gráfica do app: personagens,
expressões, poses, objetos, cenários, animais, veículos e ícones — todos no mesmo
estilo (Direção de Arte oficial), nomeados e organizados em pastas, com metadata e ZIPs.

## ⚠️ Antes de gerar de verdade

- **Volume:** o catálogo completo tem **~2.900 imagens** (80 personagens × 15 expressões
  × 17 poses + 200 objetos + 50 cenários + animais/veículos/ícones). Rode `npm run assets:plan`
  para ver a contagem exata e a **estimativa de custo**.
- **Custo:** cada imagem é uma chamada paga à API escolhida. A ~US$ 0,04/imagem, o lote
  inteiro fica em torno de **US$ 115+** (varia MUITO por provedor e resolução 2048²).
- **Consistência:** manter a MESMA identidade de um personagem em 15 expressões + 17 poses
  é difícil só com texto. Para qualidade comercial, o ideal é gerar a base do personagem e
  condicionar as variações a ela (imagem de referência) — ajuste no provedor.
- **Chave de API:** a geração real exige uma chave via variável de ambiente (não versionada).

## Comandos

```bash
npm run assets:plan        # DRY-RUN (padrão): escreve prompts + plano + metadata, custo ZERO
npm run assets:generate    # GERA de verdade (precisa de --provider com chave; ver abaixo)
npm run assets:zip         # empacota cada categoria em dist/assets/assets_<cat>.zip
npm run assets:manifest    # (infra) gera data/assets/manifest.json para o app ler
```

Flags do runner (`scripts/assets-gen/generate.mjs`):

```bash
node scripts/assets-gen/generate.mjs --run --provider=gemini            # tudo
node scripts/assets-gen/generate.mjs --run --provider=openai --only=object   # só objetos
node scripts/assets-gen/generate.mjs --run --provider=gemini --limit=20      # piloto de 20
node scripts/assets-gen/generate.mjs --run --provider=gemini --force         # regera existentes
```

- `--only=<kind>`: character | expression | pose | object | environment | animal | vehicle | icon
- `--limit=N`: gera só os N primeiros (ótimo para **piloto** antes de rodar tudo)
- `--force`: regenera mesmo se o arquivo já existir
- `--concurrency=N`: chamadas em paralelo (padrão 3)

## Retomada (não duplica)

O runner **pula** qualquer asset cujo arquivo já exista em `public/assets/…` e registra o
progresso em `.state.json`. Pode parar e retomar quando quiser: rode o mesmo comando de novo
que ele continua de onde parou. Use `--force` só para refazer.

## Provedor de imagem

Escolha via `--provider=` ou `ASSETS_GEN_PROVIDER`:

| provider | chave (env) | observação |
|---|---|---|
| `mock` (padrão) | — | não chama API; escreve um PNG placeholder transparente (testa o pipeline) |
| `gemini` | `GEMINI_API_KEY` | Google Gemini / Nano Banana Image — ajuste modelo em `GEMINI_IMAGE_MODEL` |
| `openai` | `OPENAI_API_KEY` | OpenAI Images (gpt-image-1). **Gera até 1536²**, não 2048² — para 2048² faça upscale depois (`OPENAI_IMAGE_SIZE`, `OPENAI_IMAGE_QUALITY`) |

Os adapters ficam isolados em `providers.mjs` — o endpoint/params podem precisar de ajuste
fino à API que você contratar. Nenhum roda sem a respectiva chave.

## Estilo e estrutura

- Estilo travado em `config.mjs` (`STYLE` / `NEGATIVE`) — cartoon 2D premium, cores suaves,
  contornos uniformes, iluminação frontal, sem texto/marca, fundo transparente p/ móveis,
  cenário opaco. Resolução 2048².
- Layout de saída em `config.mjs` (`LAYOUT`) — mudar a estrutura de pastas é editar 1 lugar.

## Arquivos

| arquivo | papel |
|---|---|
| `config.mjs` | estilo, custo, provedor, resolução, layout de pastas |
| `catalog.mjs` | enumera TODOS os assets (fonte da verdade) |
| `prompts.mjs` | monta o prompt (estilo travado) de cada asset |
| `providers.mjs` | adapters de API (mock / gemini / openai) |
| `generate.mjs` | runner (dry-run, geração, retomada, retry, metadata) |
| `package-zips.mjs` | empacota categorias em ZIP |
