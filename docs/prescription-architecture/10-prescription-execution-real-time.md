# Prescrição, execução e tempo real

> Decisão arquitetônica dela, 04/ago/2026, a partir da análise do Cogmed. **Nada implementado.**
> Nenhum código, interface, banco, migration ou execução foi tocado.
>
> Documento **novo**: não altera `01`–`09`, que seguem aprovados. O commit `a6b686d` (duração
> contínua) permanece aprovado e não é reaberto aqui.

## 1. A decisão registrada

**A duração escolhida pelo terapeuta é uma META ESTIMADA da sessão, não um cronômetro de
interrupção.** Uma sessão planejada para ~30 min pode ser concluída em 25, 30, 41 ou 45 minutos.
Essa diferença é **dado clínico e operacional**, não erro.

**O paciente deve concluir os exercícios prescritos.** O sistema não pode encerrar a sessão ao
alcançar o tempo-alvo · interromper um exercício · retirar exercícios restantes · reduzir protocolos
durante a execução · bloquear a conclusão por ultrapassar a estimativa.

### Os três tempos, formalmente separados

| | O que é | Quando existe |
|---|---|---|
| **Duração-alvo prescrita** | expectativa aproximada escolhida pelo terapeuta | na prescrição |
| **Duração estimada** | calculada dos exercícios e protocolos prescritos | na montagem, consultiva |
| **Duração real** | tempo efetivamente usado pelo paciente | durante e após a execução |

**Tempo acima ou abaixo da estimativa é dado, não erro.** A interpretação depende de desempenho,
erros, pausas, repetições, velocidade de processamento, estratégias, fadiga relatada e evolução
longitudinal.

Os estados `ABAIXO` · `DENTRO` · `ACIMA` · `EXCESSO_IMPORTANTE` continuam **consultivos** e
descrevem a **composição estimada antes da aplicação**. Não podem bloquear salvamento, impedir
execução, encerrar sessão nem classificar como inválida uma sessão realizada.

**O terapeuta continua soberano.** O sistema informa consequências; não decide por ele.

### Referência, não modelo

Do Cogmed preserva-se o **princípio**: sessão como unidade organizadora · exercícios como
componentes · conclusão do conjunto prescrito · registro do tempo real · variação do tempo como dado
· histórico preservado · evolução individual por exercício. O NeuroPeak acrescenta carga, fadiga,
interferência, composição, métricas específicas e apoio consultivo. **Não se copia o produto.**

## 2. Respostas às sete perguntas — do código real

### 2.1 Existe limite de tempo que interrompe sessão ou exercício?

**No nível da SESSÃO: não existe.** Nenhum corte, em lugar nenhum.

**No nível do EXERCÍCIO: existe, por desenho aprovado.** `useTimedProgress`
(`components/exercises/useExerciseEngine.ts:25`) expõe `isTimeUp()`, e **35 arquivos de exercício**
o consultam.

⚠️ **Mas ele não interrompe no meio.** `isTimeUp()` é uma função **consultada pelo exercício**, não
um temporizador que dispara sozinho. E os exercícios a consultam **entre unidades**:

- `InformacaoEmFoco.tsx:290` — em `proxima()`, **antes** de gerar a próxima questão;
- `MOT.tsx:352` — ao **fim** de uma rodada;
- `DualTask.tsx:321` — ao **fim** de um item.

Isto é exatamente a `terminationPolicy` que ela aprovou na Fase 2: *"ao limite, não inicia outra
série"* e *"se o limite chegar durante a apresentação, conclui a série"*. **A unidade corrente
sempre termina.**

### 2.2 O tempo é usado só para estimativa ou também para encerramento?

**Depende do nível, e a distinção é a chave desta análise:**

| Nível | Uso do tempo |
|---|---|
| **Sessão** (`sessionDuration`, 10–90 min) | **Só estimativa.** Nunca encerra nada. |
| **Exercício** (`useTimedProgress`, ~7 min padrão) | Encerra **o exercício**, entre unidades |

O tempo do exercício é o modelo `CONTINUOUS_TIMED` / `FIXED_HIGH_FATIGUE` da arquitetura — aprovado,
documentado e clinicamente intencional. **Não é o mesmo que cortar a sessão.**

### 2.3 Onde a duração real já é registrada?

`Session.duration Int` (`prisma/schema.prisma:88`), gravada por **`POST /api/sessions`** a cada
exercício concluído. O valor vem de `elapsedSec()` do próprio exercício.

⚠️ **Achado importante — o que está gravado NÃO é tempo de relógio.**
`elapsedSec()` devolve `activeMsRef / 1000` (`useExerciseEngine.ts:71`), e `activeMs` **só acumula
quando houve interação nos últimos 15 segundos** (`IDLE_MS`). É **tempo ativo**, não tempo decorrido.

Consequência: um paciente que leve 45 minutos de relógio com pausas longas pode registrar 30 minutos
de tempo ativo. Para a decisão dela — *"o paciente pode concluir em 25, 30, 41 ou 45 minutos, e essa
diferença é dado clínico"* — **o dado que hoje existe responde a outra pergunta**: mede engajamento,
não permanência.

Isso não é defeito: o tempo ativo é o que faz a barra de progresso ser justa com quem pausa. Mas
**pausa, interrupção e tempo de parede não estão registrados em lugar nenhum**, e são exatamente os
itens que ela quer no histórico futuro.

### 2.4 É possível distinguir alvo, estimativa e real hoje?

| | Existe? | Onde |
|---|---|---|
| **Alvo** | sim | `TrainingPlan.sessionDuration` |
| **Estimativa** | sim | calculada em `lib/prescription/duration.ts`, **não persistida** |
| **Real** | **parcialmente** | `Session.duration` por exercício, em tempo **ativo** |

**Três lacunas:**

1. a **estimativa não é persistida** — recalculada a cada abertura, então não há como comparar
   "estimado × realizado" para um plano que mudou depois;
2. a **duração real da sessão não existe como entidade** — há duração por exercício; a soma não é
   registrada, e não há como saber se os exercícios foram feitos na mesma sentada;
3. **não há registro de pausa, interrupção ou conclusão parcial.**

### 2.5 Conflitos com a arquitetura atual

**Conflito real: nenhum.** A decisão dela **já é** o comportamento do sistema no nível da sessão.

| Exigência | Estado |
|---|---|
| Não encerrar a sessão no tempo-alvo | ✅ já é assim — `sessionDuration` **nunca chega ao paciente** |
| Não retirar exercícios restantes | ✅ nada remove exercícios |
| Não reduzir protocolos na execução | ✅ nada altera dose em runtime |
| Não bloquear conclusão por exceder | ✅ nada bloqueia |
| Estados consultivos, sem bloquear salvar | ✅ `blocksSave: false` por tipo; `canSave: true` literal |
| Não interromper um exercício | ⚠️ **ver abaixo** |

**A única tensão — e é de vocabulário, não de comportamento:** *"não interromper um exercício"* pode
ser lido como incompatível com os 35 exercícios que encerram por tempo. Mas:

- o encerramento é do **exercício**, não da sessão;
- ocorre **entre unidades**, nunca no meio;
- é o modelo `CONTINUOUS_TIMED` que **ela aprovou** na Fase 2, com `terminationPolicy` documentada
  por exercício;
- sem ele, exercícios como Vigilância e Informação em Foco — que ela mesma redesenhou para rodar
  **por tempo** — não teriam critério de parada.

**Recomendação:** registrar explicitamente que *"não interromper um exercício"* significa **não
cortar uma unidade em andamento nem encurtar o exercício por causa do relógio da sessão** — e que o
tempo próprio de cada exercício continua válido. Sem essa distinção escrita, uma sessão futura pode
ler a decisão como ordem de remover `isTimeUp()` dos 35 exercícios, o que quebraria o desenho
clínico aprovado.

### 2.6 Documentos que precisam receber referência

| Documento | O que acrescentar |
|---|---|
| `02-session-composition.md` | que a duração-alvo é meta estimada, não cronômetro |
| `04-open-decisions.md` | a distinção entre os três tempos, e a pendência da linguagem de `EXCESSO_IMPORTANTE` |
| `06-implementation-spec.md` | que os estados nunca classificam sessão **realizada** |
| `09-session-as-primary-unit.md` | apontar para este documento |
| `CLAUDE.md` | que `Session.duration` é tempo **ativo**, não de relógio |

Nenhum deles é alterado agora.

### 2.7 Implementações futuras necessárias — nenhuma iniciada

1. **Registrar tempo de parede além do tempo ativo** — sem isso, "concluiu em 45 min" não é
   observável. Exige campo novo; **toca o banco**.
2. **Sessão como entidade de execução** — agrupar os exercícios de uma sentada, com início, fim,
   conclusão integral ou parcial. Hoje só há `Session` por exercício. **Toca o banco.**
3. **Persistir a estimativa** no momento do salvamento do plano, para permitir comparar estimado ×
   realizado.
4. **Registro de pausas e interrupções.**
5. **Histórico de sessões** (item 7B dela) · **evolução por exercício** (7C) · **evolução global**
   (7D).
6. **Reavaliar a linguagem de `EXCESSO_IMPORTANTE`** — traduzir para algo como *"estimativa
   significativamente acima da meta"*. É só texto de apresentação; não mexe em regra.

**Ordem sugerida:** 6 (só texto) → 3 (sem tocar banco) → 1 e 2 (banco) → 4 → 5.

## 3. O que esta análise NÃO faz

- Não altera código, interface, banco, migration ou execução;
- não inicia histórico, relatório ou tutorial;
- não reabre o commit `a6b686d`;
- não altera nenhum documento aprovado.
