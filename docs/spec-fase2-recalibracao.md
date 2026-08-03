# FASE 2 — recalibração de CARGA BASAL e FADIGA (correção conceitual dela)

Alterar **apenas 2 dos 12 parâmetros** em
`docs/prescription-architecture/01-exercise-prescription-parameters.md` e
`prescription-parameters.json`: `baselineCognitiveLoad` e `fatigue`.

**Os outros 10 permanecem byte a byte idênticos:** `executionModel` · `minimumValidUnit` ·
`terminationPolicy` · `protocols` · `loadModifiers` · `clinicalDuration` · `interference` ·
`resumptionAfterInterruption` · `sessionEligibility` · `modality`.

Não tocar em código, exercícios, banco, interface, catálogo, engine ou nas fontes congeladas da
Fase 1. Não commitar.

## Por que recalibrar

A primeira passada classificou **18 de 34 como carga 3** e **17 como fadiga alta**, usando como
critério a **quantidade de processos recrutados** ("combina memória, busca e controle"). Isso é
erro conceitual: uma escala em que metade do catálogo é "alta" perde poder de discriminar, que é o
único uso dela na composição da sessão.

## CARGA BASAL — o que NÃO é

Não representa: quantidade de domínios recrutados · multidimensionalidade · nº de funções
associadas · importância clínica do exercício · dificuldade máxima que ele pode atingir.

## CARGA BASAL — o que É

Intensidade cognitiva **média por unidade de tempo**, na **configuração inicial ou padrão**.
Considerar: continuidade da demanda · nº de operações simultâneas · necessidade de manter e
manipular informação · interferência · pressão temporal · complexidade da resposta ·
**possibilidade de recuperação entre rodadas**.

Um exercício pode recrutar muitos processos e ainda ser **1 ou 2** quando: as rodadas são curtas ·
há pausas naturais · a resposta é simples · a regra permanece estável · a informação exigida é
pequena · o paciente se recupera entre tentativas.

### Escala

**1 — BAIXA:** demanda leve por minuto, uma ou poucas operações centrais, resposta simples, baixa
interferência, recuperação clara entre rodadas. Frequente: regra simples e estável · pouca
manutenção de informação · pouca ou nenhuma manipulação mental · sem dupla tarefa · baixa pressão
temporal · resposta motora simples · unidades curtas · pausas naturais · poucos estímulos simultâneos.

**2 — MODERADA:** demanda consistente mas administrável. Frequente: duas ou mais operações
relevantes · manutenção de meta · controle de distração · memória operacional moderada · seleção de
resposta · interferência moderada · planejamento ou monitoramento · exigência contínua **com alguma
recuperação**.

**3 — ALTA:** demanda intensa e **sustentada por minuto**. Frequente: dupla tarefa real ·
interferência forte · atualização contínua · manipulação mental intensa · alternância frequente de
regra · pressão temporal alta · **baixa possibilidade de recuperação** · manter vários elementos
simultaneamente · alto custo de erro · demanda contínua na maior parte da atividade.

### Proibições

**Não** classificar como 3 apenas porque o exercício: recruta muitos domínios · está em Funções
Executivas · tem níveis avançados difíceis · exige planejamento · usa memória operacional · dura
vários minutos · mostra vários estímulos visuais.

A dificuldade dos níveis avançados pertence a `loadModifiers` (já escritos, **não alterar**), não à
basal.

**Exemplos conceituais dela, a considerar seriamente:** Cubos pode ser basal 1–2 com dinâmica 3;
Vigilância pode ser 1–2, subindo por duração, velocidade e semelhança; Jogo das Torres pode ser 2,
com 3 só em problemas complexos.

Carga 3 basal é para tarefas cuja **mecânica padrão já sustenta intensidade elevada**. Candidatos
plausíveis, **só se a mecânica confirmar**: Cores e Palavras · Dupla Tarefa · N-Back · Alternância
de Regras · Lista com Distração · outros com interferência, atualização ou simultaneidade
efetivamente altas.

**Não forçar cota por classe** — a distribuição resulta dos critérios. Mas, ao terminar, se **mais
de ~40%** ficar na mesma classe, revisar as justificativas procurando confusão conceitual
remanescente.

## FADIGA — recalibrar SEPARADAMENTE

Fadiga **não é sinônimo de carga**. É a probabilidade de **queda de qualidade, exaustão ou perda de
engajamento ao longo da exposição**.

Considerar: repetitividade · interferência · duração típica · pressão temporal · esforço inibitório ·
esforço de atualização · sobrecarga visual · sobrecarga auditiva · frustração · custo de erro ·
ausência de pausas · **monotonia** · necessidade de planejamento prolongado.

**BAIXA:** tolera exposição longa · pausas naturais · baixa interferência · baixa frustração ·
resposta simples · boa recuperação.
**MODERADA:** redução gradual de desempenho · exige atenção ou memória consistente · tolera duração
intermediária · precisa de limite razoável.
**ALTA:** perde qualidade rapidamente · interferência forte · alternância intensa · dupla tarefa ·
pressão temporal alta · manipulação contínua · risco de frustração · exposição curta ou limitada.

**Não derivar fadiga da carga.** São combinações legítimas: carga 3 + fadiga moderada · carga 2 +
fadiga alta · **carga 1 + fadiga moderada por monotonia**.

## Entrega

Atualizar os dois arquivos (Markdown e JSON **coerentes entre si**) e relatar:

1. Distribuição final da carga basal. 2. Distribuição final da fadiga.
3. Exercícios que **mudaram** de carga (de → para). 4. Que mudaram de fadiga.
5. Justificativa curta de **cada carga 3**. 6. De **cada fadiga alta**.
7. Exercícios com: carga baixa e faixa dinâmica alta · carga moderada e fadiga alta · carga alta e
   fadiga moderada.
8. Confirmação de que multidimensionalidade **não** foi usada como sinônimo de carga.
9. Confirmação de que os outros 10 parâmetros ficaram intactos (comparar com o estado atual).

Não commitar.
