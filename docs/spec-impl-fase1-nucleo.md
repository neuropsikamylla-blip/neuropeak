# IMPLEMENTAÇÃO — FASE 1: núcleo da prescrição (lógica pura)

Arquitetura **congelada**. Não reabrir discussão conceitual: os documentos
`docs/prescription-architecture/01…06` e `docs/architecture/CANONICAL_EXERCISES.md` são a
especificação — implementar exatamente o que está lá.

## PROIBIÇÕES ABSOLUTAS desta fase

**Não alterar:** páginas · componentes · banco · migrations · APIs · tela do terapeuta · tela do
paciente · comportamento de qualquer exercício · `lib/adaptive.ts` · `types/index.ts` ·
`lib/domain-taxonomy.ts` · `lib/exercise-plan.ts`.

**Nada visual.** Só tipos, estruturas, calculadores, validadores, interpretadores, enums, helpers e
testes, isolados em módulos reutilizáveis que **ninguém ainda importa**.

Não commitar.

## Onde criar

Diretório novo **`lib/prescription/`** — nenhum arquivo fora dele, exceto os testes que ficam ao
lado de cada módulo (`*.test.ts`, padrão do projeto).

Sugestão de módulos (ajustar se fizer sentido, mantendo tudo dentro de `lib/prescription/`):

| Arquivo | Papel |
|---|---|
| `types.ts` | enums e interfaces (modelos de execução, protocolos, estados, alertas, prescrição, composição) |
| `catalog.ts` | os 34 parâmetros vindos de `docs/prescription-architecture/prescription-parameters.json` |
| `duration.ts` | calculador de duração (fórmula + margens) |
| `load.ts` | calculador de carga basal e leitura de fadiga/interferência |
| `validation.ts` | motor dos 18 alertas |
| `interpreter.ts` | recebe um plano e devolve o resumo completo |
| `legacy.ts` | leitura tolerante de planos antigos |

## 1. Enums e tipos

```ts
export type ExecutionModel = "CONTINUOUS_TIMED" | "CLOSED_PROTOCOL" | "PLANNING_WINDOW" | "FIXED_HIGH_FATIGUE";
export type ProtocolName = "BREVE" | "PADRAO" | "ESTENDIDO";
export type FatigueLevel = "BAIXA" | "MODERADA" | "ALTA";
export type InterferenceLevel = "BAIXA" | "MODERADA" | "ALTA";
export type SessionDurationState = "ABAIXO" | "DENTRO" | "ACIMA" | "EXCESSO_IMPORTANTE";
export type AlertSeverity = "informativa" | "atencao";
export type TargetMinutes = 20 | 30 | 40;
```

Todo alerta carrega `blocksSave: false` — **o tipo deve tornar `true` impossível**
(`blocksSave: false` literal, não `boolean`).

## 2. Catálogo dos 34

Portar `docs/prescription-architecture/prescription-parameters.json` para
`lib/prescription/catalog.ts` como constante tipada. **Não inventar valor**: os 34 ids, modelos,
protocolos, carga basal, fadiga, interferência, durações e políticas vêm do JSON.

Se algum campo do JSON estiver em texto livre (ex.: `"~3 min"`, `"3 min"`), converter para número em
minutos no código, preservando o texto original num campo separado quando útil. Documentar a
conversão.

## 3. Calculador de duração — fórmula da Fase 2

Margens de fechamento por modelo (aprovadas por ela):

| Modelo | Fechamento máximo |
|---|---:|
| `CONTINUOUS_TIMED` | 0,5 min |
| `CLOSED_PROTOCOL` | 1 min |
| `PLANNING_WINDOW` | 3 min |
| `FIXED_HIGH_FATIGUE` | 0 min |

```
tempoRealMin = Σ pMinᵢ + 0,5 × max(0, n − 1)
tempoRealMax = Σ pMaxᵢ + 1,0 × max(0, n − 1) + Σ fMaxᵢ
```

Transição: 0,5 min mínimo, 1 min máximo, por troca (`n − 1` trocas).

## 4. Estados da sessão — QUATRO, com as fronteiras dela

| Alvo | ABAIXO | DENTRO | ACIMA | EXCESSO_IMPORTANTE |
|---:|---|---|---|---|
| 20 | < 18 | 18–22 | > 22 até 24 | > 24 |
| 30 | < 27 | 27–33 | > 33 até 36 | > 36 |
| 40 | < 36 | 36–44 | > 44 até 48 | > 48 |

Definir com precisão **qual extremo da faixa estimada** decide o estado (a arquitetura usa
`tempoRealMax` para o excesso e `tempoRealMax` abaixo do piso para "abaixo" — conferir em
`02-session-composition.md` e seguir o que está escrito lá, sem reinterpretar).

## 5. Carga

`cargaBasalSessao = Σ baselineCognitiveLoad`. Referências heurísticas: **7** (20 min) · **10** (30) ·
**13** (40). **Não** são limite: só disparam `LOAD_AT_CAP` / `LOAD_OVER_CAP`.

**Não implementar carga dinâmica** — é fase posterior. Os modificadores permanecem qualitativos.

## 6. Motor de validação — os 18 alertas

`SESSION_BELOW_TARGET` · `SESSION_ABOVE_TARGET` · `SESSION_RANGE_PARTIAL` ·
`SESSION_SAFE_MAX_EXCEEDED` · `LOAD_AT_CAP` · `LOAD_OVER_CAP` · `HIGH_FATIGUE_COUNT` ·
`HIGH_FATIGUE_POSITION` · `HIGH_FATIGUE_ADJACENT` · `HIGH_INTERFERENCE_ADJACENT` ·
`AUDITORY_ONLY_ADJACENT` · `COGNITIVE_CONCENTRATION` · `PLANNING_WINDOW_COUNT` ·
`PLANNING_WINDOW_ADJACENT` · `OPEN_POSITION_NOT_ELIGIBLE` · `CLOSE_POSITION_NOT_ELIGIBLE` ·
`OUTSIDE_BEST_POSITION` · `DECLARED_BAD_COMBINATION`

Disparo, severidade e mensagem **exatamente** como em `06-implementation-spec.md` (contrato) e
`02-session-composition.md`. Alertas de par adjacente emitem **uma ocorrência por par**.

Regras de fadiga alta: máx. 1 em 20 min, 2 em 30/40 · não consecutivos · não no fechamento — todas
**consultivas**.

## 7. Interpretador

```ts
interpretPlan(plan): {
  durationRange: { min: number; max: number };
  durationState: SessionDurationState;
  baselineLoad: number;
  loadReference: number;
  fatigueSummary: Record<FatigueLevel, number>;
  interferenceSummary: Record<InterferenceLevel, number>;
  alerts: PrescriptionAlert[];
  canSave: true;      // literal — sempre verdadeiro
}
```

## 8. Compatibilidade — requisito duro

`legacy.ts` deve ler planos no formato atual sem quebrar: exercício sem dose prescrita cai para o
**protocolo PADRÃO** do catálogo; id desconhecido é **ignorado com registro**, nunca lança exceção;
`trials` dos spans continua legível. **Nenhum plano salvo pode ficar inválido.**

## Testes — obrigatórios, sem eles não há entrega

Em `lib/prescription/*.test.ts`:

1. **Duração:** a fórmula com 1, 2 e 5 exercícios; margem correta por modelo; `PLANNING_WINDOW`
   somando 3 min ao máximo.
2. **Estados:** as **12 fronteiras** (18/22/24 · 27/33/36 · 36/44/48), testando o valor exato e os
   vizinhos — 17,9 / 18 / 22 / 22,1 / 24 / 24,1 e equivalentes.
3. **Carga:** soma correta; `LOAD_AT_CAP` no valor exato; `LOAD_OVER_CAP` acima.
4. **Fadiga:** contagem por nível; teto por duração; adjacência; posição de fechamento.
5. **Interferência:** par adjacente detectado, uma ocorrência por par.
6. **Os 18 alertas:** cada um tem ao menos um teste que o dispara e um que **não** o dispara.
7. **`blocksSave`:** varredura — nenhum alerta gerado tem `blocksSave` diferente de `false`;
   `canSave` é sempre `true`.
8. **Compatibilidade:** plano no formato antigo é interpretado sem exceção; id desconhecido não
   quebra; ausência de dose usa o PADRÃO.
9. **Catálogo:** os 34 ids do `catalog.ts` batem com `CANONICAL_EXERCISES.md`.

## Provas a rodar

```
npx tsc --noEmit     # exit 0
npx vitest run       # os 250 atuais + os novos, todos passando
```

⚠️ Os **250 testes existentes não podem quebrar** — nenhum arquivo fora de `lib/prescription/` foi
tocado, então qualquer quebra indica violação de escopo.

## Entrega

Listar: arquivos criados · confirmação de que nenhum arquivo fora de `lib/prescription/` foi
alterado · nº de testes novos · e **três exemplos executados** (sessão de 20, 30 e 40 min) mostrando
duração, carga, fadiga, alertas e estado. Não commitar.
