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
  código real.

## [2.11.4] — 2026-07-10

- **Alertas e regras do dia a dia (correções da auditoria):**
  - Alerta "faltou treinar" (MISSED_SESSION) agora é removido quando o paciente volta a
    treinar — antes nunca era limpo automaticamente (CORR-003).
  - Alerta de "queda de desempenho" (PERFORMANCE_DROP) deixa de se repetir a cada sessão:
    só cria um novo se não houver um não lido recente; a mensagem não atribui mais a queda
    a um exercício específico, pois a média cruza exercícios (CORR-004/GER-003).
  - Bloqueio "1x por dia" passa a usar o fuso de Brasília, consistente com a sequência de
    dias — antes usava o fuso do aparelho (GER-005).
  - Resgate de código de licença não rebaixa mais um terapeuta com acesso ilimitado para um
    número finito; o código é preservado com uma mensagem clara (GER-007).

## [2.11.3] — 2026-07-10

- **Fidelidade das pontuações (correções da auditoria):**
  - Vigilância: falso-alarme passa a contar no máximo 1 por estímulo (CORR-009).
  - Caça Informação: empates aceitam qualquer item correto; "mais conteúdo" compara só a
    mesma família de unidade, normalizando kg/L (CORR-014, CORR-015).
  - Compra Multifuncional: fim de tempo avalia a seleção real, não um conjunto vazio (CORR-008).
  - Grade Lógica (DeductiveGrid): erros deixam de ser contados em dobro na acurácia (CORR-013).
  - Desafio Supermercado: níveis 11–12 não são mais rebaixados para 10 (CORR-001).
  - Memória (Letras/Sílabas, Sequência de Itens, Lista com Distração, Padrões com Rotação):
    a subida de nível passa a valer já na rodada seguinte (CORR-011).

## [2.11.2] — 2026-07-10

- **Segurança:** rate limiting no login (terapeuta e paciente) contra força-bruta de PIN,
  por identificador e por IP, com bloqueio temporário (SEC-001).

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
