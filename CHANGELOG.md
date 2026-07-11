# Changelog — NeuroPeak

Todas as mudanças notáveis do projeto. Formato inspirado em
[Keep a Changelog](https://keepachangelog.com/pt-BR/); versionamento em `package.json`
(**patch** = fixes/UI, **minor** = novos exercícios/fluxos).

Este changelog foi iniciado a partir do estado atual (2026-07-10, v2.11.1). O
histórico completo anterior está no log do Git (452 commits no total, a partir de `ef99025`).

## [Não lançado]

- Auditoria completa do código (5 dimensões + verificação adversarial) documentada em
  `docs/auditoria/AUDITORIA-2026-07-10.md`; dívida técnica em `docs/DIVIDA-TECNICA.md`.
  Documentação (CLAUDE.md, README.md, ARCHITECTURE.md, ADRs) reescrita a partir do
  código real. **Nenhuma correção de código aplicada** — findings aguardam decisão.

## [2.11.1] — 2026-07-10

- **Busca Rápida:** as 251 imagens de itens normalizadas em quadro quadrado com objeto
  centralizado (~80%) e reotimizadas; cards com imagem menor e padding; validação de
  imagem antes da rodada (item sem foto é trocado, nunca placeholder); tutorial corrigido.

## [2.11.0] — 2026-07

- **Focus Agentes:** redesign cognitivo do modo Foco (ladder de níveis 1–7 por critérios).

## [2.10.x] — 2026-07

- **Focus Agentes:** novo elenco padronizado de 42 personagens; integração do roster
  completo (símbolos + objetos); correções de clique em sobreposição/aglomeração.

## [2.9.x] — 2026

- **Compra Multifuncional:** overhaul cognitivo (progressão + regras variadas); tela de
  jogo enxuta com memória automática. Correções de fundo residual em imagens de produtos.

## [2.8.x] — 2026

- **Busca Rápida:** rebuild do acervo (251 itens, 7 categorias, nova categoria Brinquedos).
- **Performance:** otimização do acervo de imagens (busca 289 MB → 6 MB; produtos 165 MB → 4 MB).

## [2.5.0 – 2.7.0] — 2026

- **Desafio Supermercado:** expansão do catálogo de produtos (+29, depois +34) com fundo
  removido; hortifrúti/higiene/limpeza refeitos; nova categoria lavanderia.

## [2.1.0 – 2.4.1] — 2026

- **Bichinho (pet):** área premium/lúdica, ciclo do dia, cena decorada.
- **Busca Rápida:** reforma cognitiva do ex-"Corrida contra o Tempo" (72 → 251 itens em imagem).

## Marcos anteriores

Versões 1.x cobriram a base da plataforma (autenticação dual, engine de exercícios,
scoring por faixa etária, geração de PDF, Mundo Interior, tema escuro navy) e a auditoria
de 2026-05-30 (`AUDITORIA-2026-05-30.md`), que corrigiu ~40 achados. Em 2026-06-02, ação
separada habilitou Row Level Security nas 10 tabelas do banco de produção (registro em
`PROGRESSO.md`). Detalhes no log do Git e nos documentos de progresso.

> Nota: a plataforma expõe `score`/dificuldade por domínio, mas não há cálculo de percentil
> normativo implementado no código (apenas o tipo `NormativeBenchmark`) — ver `docs/ARCHITECTURE.md`.
