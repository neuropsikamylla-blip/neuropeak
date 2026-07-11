# ADR-005 — Progressão de dificuldade calculada no servidor

- **Status:** registrada retroativamente em 2026-07-10

- **Contexto:** a dificuldade dos exercícios é calibrada clinicamente e
  determina o nível em que o paciente treina. O cliente roda no dispositivo do
  paciente e não é confiável para decidir progressão; a decisão precisa ser
  autoritativa e persistida. Exercícios diferentes têm regras de progressão
  diferentes (engine genérica, Dupla Tarefa, trilha da Ordem da História, Focus
  Agentes), o que exige múltiplos caminhos.

- **Decisão:** o cálculo do próximo nível acontece no servidor, no `POST
  /api/sessions`, a partir do `accuracy`/metadata enviados. A rota seleciona a
  engine por tipo de exercício (`app/api/sessions/route.ts:62-151`):
  - `dual-task` → `calculateDualTaskProgression` (exige as duas tarefas ≥80% para
    subir; mantém "nível consolidado") (`lib/adaptive.ts:184-228`);
  - `ordem-historia` com `progressionV2` → `calculateStoryTrailProgression`
    (estágios 1-10 ordenar, 11 Intruso, 12 Descubra) (`lib/adaptive.ts:144-182`);
  - demais `progressionV2` → `calculateProgression` genérica (sobe ≥0.85, mantém
    0.65-0.85, desce, -2 se <0.45; dimensões precisam ≥0.80)
    (`lib/adaptive.ts:89-127`);
  - `focus-agents` / `focus-agents-auditivo` → `calculateFocusProgression`
    (`lib/adaptive.ts:132-138`);
  - fallback → `calculateNewDifficulty` sobre as últimas sessões
    (`lib/adaptive.ts:7-51`).
  O resultado é persistido em `ExerciseConfig.currentDifficulty` via `upsert`
  (`app/api/sessions/route.ts:184-198`) e devolvido ao cliente no campo
  `adaptive` (`:285`).

- **Alternativas consideradas:** deixar o cliente decidir e persistir o nível.
  Rejeitado por confiabilidade — o cliente não é fonte de verdade da progressão.
  Uma única fórmula de progressão para todos os exercícios: preterida por não
  acomodar regras clínicas distintas (dupla tarefa, trilha, foco).

- **Consequências:**
  - Positivas: nível autoritativo e persistido no servidor; regras clínicas
    ficam num único módulo testável (`lib/adaptive.ts`).
  - Negativas / dívidas observadas: os múltiplos caminhos convivem com
    inconsistências reais — a engine genérica trava em 10, mas o Desafio
    Supermercado usa níveis 11-12 e rebaixa o paciente de alto desempenho
    (CORR-001); `calculateFocusProgression` desconhece o teto 7 do modo Foco e
    pode salvar nível 8/9 (CORR-006); exercícios `progressionV2` sobem o nível no
    cliente e o servidor sobe de novo (CORR-005). O caminho quente executa ~8-11
    round-trips sequenciais ao banco (PERF-002). As novas engines não têm cobertura
    de teste (GER-004).
