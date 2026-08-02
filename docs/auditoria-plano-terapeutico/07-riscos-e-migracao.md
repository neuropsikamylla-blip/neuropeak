# 07 — Riscos e ordem segura de implementação

## Riscos, do mais grave ao menos

| # | Risco | Por que é real aqui | Mitigação |
|---|---|---|---|
| 1 | **Perder progresso do paciente** | `ExerciseConfig.currentDifficulty` é a única fonte do nível. Qualquer migração que recrie a tabela zera o treino de todos. | Migração só ADITIVA (colunas novas com default). Nunca `DROP`/recriação. Backup do banco antes. |
| 2 | **Exercício que não encerra** | O modelo B ("não iniciar novo desafio, deixar concluir o atual") pode deixar a sessão aberta se o paciente parar no meio de um desafio. | Teto absoluto por exercício (`max` da política) + encerramento forçado ao fim da sessão, registrando `endedBy: "sessionEnded"`. |
| 3 | **Planos salvos quebrarem** | Os planos guardam `settings` livres (`Record<string, unknown>`). Trocar `trials` por `blocks` sem leitura tolerante quebra prescrição existente. | Leitor tolerante: `blocks ?? trials ?? default`. Nunca exigir campo novo em plano antigo. |
| 4 | **Duração incorreta na prática** | A faixa estimada é estimativa. Se o paciente for muito lento, a sessão de 30 vira 45. | Guardar `actualSeconds` por execução e, depois de N sessões, mostrar ao terapeuta a duração real média × prescrita. Não corrigir automaticamente. |
| 5 | **Mudar a progressão sem querer** | Encerrar por blocos em vez de tempo altera quantas tentativas o adaptativo vê — pode mudar a velocidade de subida de nível. | Não tocar em `lib/adaptive.ts` nesta reforma. Se a dose mudar, medir o efeito antes com sessões simuladas. |
| 6 | **Interromper atividade no meio** | Modelos B e D não podem ser cortados. Um encerramento por tempo mal colocado destrói o dado. | `completionPolicy` explícita por exercício, testada. |
| 7 | **Loop** | "Não iniciar novo desafio" + geração que falha = tela parada. | Toda geração já tem fallback; manter e registrar `endedBy`. |
| 8 | **Incompatibilidade de escala de nível** | Card diz 1–10, motores usam 10/12/13. Unificar sem cuidado rebaixa paciente de nível alto (já aconteceu: CORR-001 e CORR-021). | `maxLevel` explícito na definição; teste que impede prescrever acima do teto. |

## O que precisa de migração de dados

**Nenhuma migração obrigatória para começar.** A reforma pode ser feita com:

- campos novos **opcionais** em `ExerciseConfig` (`lastStableLevel`, `highestLevel`);
- `TrainingPlan` continua guardando JSON — a estrutura nova convive com a antiga por leitura tolerante;
- `Session.metadata` já é livre: as métricas do modelo B entram sem alterar schema.

A única mudança de schema realmente necessária é se quisermos **histórico de redefinições de nível**
(`resets`) — e isso pode esperar.

## Feature flag

Recomendo **uma flag por fase**, não uma global:

1. `planDurationV2` — cálculo de duração e alertas (só leitura, risco baixo);
2. `planLoadV2` — exibição de carga;
3. `exerciseDoseV2` — dose por modelo (o único que muda o que o paciente vive).

As duas primeiras podem ir sem flag, na prática: não alteram execução.

## Testes necessários antes de cada fase

- **Duração:** para cada exercício, a faixa estimada bate com a duração real de uma sessão simulada.
- **Encerramento:** cada modelo termina como sua política manda (rodada concluída · desafio concluído
  · tempo fixo · blocos completos), incluindo o caso "tempo acabou durante o desafio".
- **Compatibilidade:** plano salvo no formato antigo abre, roda e salva sem perder configuração.
- **Progresso:** paciente com nível 12/13 não é rebaixado por nenhuma leitura nova.
- **Alertas:** cada regra dispara no cenário previsto e nenhuma bloqueia o salvamento.

## Ordem segura de implementação

1. **Definições e política de duração** (`ExerciseDefinition` com `durationPolicy`), sem mudar nada
   na execução. O card passa a exibir faixa real em vez de "~7 min". *Risco: baixo. Reversível.*
2. **Cálculo e alertas da sessão** (faixa, margem, carga, avisos). Ainda sem tocar em exercício.
   *Risco: baixo.*
3. **Interface do card e do painel** (documento 05). *Risco: baixo, visual.*
4. **Dose por modelo** — trocar `trials` dos spans por `blocks` e prescrever minutos nos contínuos.
   *Risco: médio — é o primeiro que muda o que o paciente vive. Uma fase só para isso.*
5. **Modelo B com métricas próprias** (desafios iniciados/concluídos, eficiência, planejamento).
   *Risco: médio — mexe em 10 exercícios.*
6. **Nível: retomada explícita e redefinição como evento.** *Risco: alto — mexe em progresso. Por último,
   com backup e teste de não-rebaixamento.*

**Nunca fazer 4, 5 e 6 na mesma entrega.**
