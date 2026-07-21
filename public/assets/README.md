# public/assets — Biblioteca de Assets (servida em /assets)

Tudo aqui é servido estaticamente pelo Next em `/assets/...`. As imagens são
produzidas pelo pipeline `scripts/assets-gen/` (ver o README de lá). Esta pasta
começa **vazia** — a Etapa 4 entrega a infraestrutura, não as imagens.

## Estrutura produzida pelo pipeline

```
assets/
  characters/
    children/   child_001.png … child_030.png
    teens/      teen_001.png  … teen_020.png
    adults/     adult_001.png … adult_020.png
    elders/     elder_001.png … elder_010.png
  expressions/  <code>_<expr>.png     (ex.: child_001_happy.png)
  poses/        <code>_<pose>.png      (ex.: child_001_standing.png)
  objects/      <slug>.png             (ex.: backpack.png)
  environments/ <slug>.png             (cenários, SEM personagens)
  animals/      <slug>.png
  vehicles/     <slug>.png
  icons/        <slug>.png
  metadata/     metadata.json          (índice agregado gerado pelo runner)
```

- **Direção de Arte:** cartoon 2D premium, cores suaves, contornos uniformes,
  iluminação frontal, sem texto/marca. 2048×2048 PNG.
- **Fundo transparente** para personagens/expressões/poses/objetos/animais/veículos/ícones.
- **Cenários** são PNG opacos (sem personagens).

## Como o app consome

Duas camadas complementares (ver `lib/assets/` e `data/assets/`):

1. **Resolução por convenção** — a URL sai direto do ID (`resolveAssetUrl(id)`),
   sem precisar de índice. Basta a imagem existir no caminho convencional.
2. **Manifesto/registry** — `npm run assets:manifest` agrega os metadados para
   listagem/consulta rica no app.

> Nota de estrutura: o pipeline gera o layout "flat" acima. O loader do app
> (`lib/assets/paths.ts`) centraliza a convenção de caminho — se a estrutura mudar,
> ajusta-se em um único lugar.
