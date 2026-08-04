# A sessão como unidade principal — análise arquitetônica

> Análise pedida por ela em 04/ago/2026. **Nada implementado.** Nenhum código, interface, banco ou
> migration foi tocado.
>
> Documento **novo**: não altera `01`–`08`, que seguem aprovados. Limita-se à relação entre duração
> da sessão · dose dos exercícios · apresentação do tempo · alertas de duração · compatibilidade.
> **Não reabre** taxonomia cognitiva, classificação dos 34, carga basal, fadiga, interferência,
> modalidades ou progressão adaptativa.

## 1. Diagnóstico do modelo atual

### 1.1 O achado principal: a interface e o núcleo já discordam

O núcleo modela `TargetMinutes = 20 | 30 | 40` (`types.ts:7`) — três valores fechados.
**A interface não oferece esses três valores.** `PlanBuilderSidebar.tsx:70` é um
`<input type="number" min={10} max={90}>`: o terapeuta digita **qualquer** número de 10 a 90, e o
banco guarda `sessionDuration Int @default(30)` (`schema.prisma:70`), sem restrição a três opções.

A ponte entre os dois é `nearestTarget` (`presentation.ts:868`):

```
minutes <= 25 → 20
minutes <= 35 → 30
senão         → 40
```

**Consequência hoje, sem nenhuma mudança:** um terapeuta que prescreve **45 minutos** é avaliado
contra a faixa de **40** (36–44), e o plano é marcado com o aviso de parâmetro não determinado
(`exactTarget === false`). Uma sessão de **26 minutos** é avaliada como se fosse **30**.

Isto **não é** um defeito introduzido pela nova proposta: é dívida já existente. A proposta da
sessão como unidade principal é a oportunidade de resolvê-la.

### 1.2 O que hoje depende dos três valores

| Módulo | O que depende | Natureza |
|---|---|---|
| `types.ts:7` | `TargetMinutes = 20 \| 30 \| 40` | **Tipo literal** — a raiz de tudo |
| `duration.ts:19` | `TARGET_DURATION_BOUNDS` — 3 faixas × 3 fronteiras | Tabela por valor |
| `load.ts:3` | `LOAD_REFERENCE` = 7 / 10 / 13 | Tabela por valor |
| `load.ts:17` | `HIGH_FATIGUE_CAP` = 1 / 2 / 2 | Tabela por valor |
| `load.ts:18` | `PLANNING_WINDOW_CAP` = 1 / 2 / 2 | Tabela por valor |
| `legacy.ts:18` | `isTarget` — aceita só 20, 30, 40 | Validador |
| `presentation.ts:868` | `nearestTarget` — arredonda | **Ponte com perda** |
| `presentation.ts:241` | `expectedRange` — texto da faixa | Apresentação |
| `validation.ts` | 4 alertas de duração + tetos | Regra |

**Testes:** 7 arquivos referenciam esses valores; `duration.test.ts` sozinho tem 26 ocorrências dos
literais, incluindo as **12 fronteiras** (17,9 / 18 / 22 / 22,1 / 24 / 24,1 e equivalentes) que ela
aprovou na Fase 2.

## 2. A nova proposta e o que ela exige

| | Alvo | Faixa esperada |
|---|---:|---|
| Breve | 20 min | 18–22 |
| Padrão | **35** min | **32–38** |
| Extenso | **50** min | **46–54** |

Mudam **dois** dos três alvos e **todas** as larguras de faixa: hoje 20 tem ±2, 30 tem ±3 e 40 tem
±4; na proposta, as três têm **±2, ±3 e ±4** respectivamente — a de 20 permanece ±2, a de 35 fica ±3
e a de 50 ±4. A proporção muda: ±10% em 20, ±8,6% em 35, ±8% em 50.

### 2.1 Reutilizável sem alteração

- **fórmula de duração** (`calculateDuration`) — soma doses + transições + margem de fechamento;
- **margens por modelo de execução** (0,5 · 1 · 3 · 0);
- **catálogo dos 34** e seus protocolos;
- **dose legada** e `legacyDoseMinutes`;
- **carga basal, fadiga, interferência** por exercício;
- **todos os alertas que não são de duração** (fadiga, interferência, planejamento, posição,
  sobreposição);
- **agrupamento e divulgação progressiva** (v2.71.0);
- **os painéis retráteis**.

Ou seja: **a máquina de cálculo não muda.** O que muda é a tabela de referência.

### 2.2 Precisa mudar

1. `TargetMinutes` — de `20 | 30 | 40` para os novos valores;
2. as **quatro tabelas por valor** (`TARGET_DURATION_BOUNDS`, `LOAD_REFERENCE`, `HIGH_FATIGUE_CAP`,
   `PLANNING_WINDOW_CAP`);
3. `isTarget` e `nearestTarget`;
4. os **12 testes de fronteira** e as asserções que citam 30/40;
5. o seletor da interface.

### 2.3 O problema silencioso das tabelas de carga e fadiga

`LOAD_REFERENCE` é 7 (20 min) · 10 (30) · 13 (40) — aproximadamente **0,33 de carga por minuto**.
Mantendo essa proporção, 35 min → **11,7** e 50 min → **16,7**.

⚠️ **Esses números não podem ser calculados por regra de três e adotados em silêncio.** Ela aprovou
7/10/13 como **heurística clínica**, não como função linear. Trocar 30→35 e 40→50 **exige decisão
clínica dela** sobre os novos valores de referência, de teto de fadiga alta e de teto de janelas de
planejamento. Está listado nas decisões pendentes.

## 3. Sessão × exercício: como não confundir

### 3.1 A ambiguidade é real

Hoje o exercício já usa **Breve / Padrão / Estendido**. Chamar a sessão de **Breve / Padrão /
Extenso** cria duas escalas homônimas em níveis diferentes, e a frase *"sessão Padrão com o
Supermercado em Padrão"* passa a existir. Pior: *"sessão Breve"* e *"exercício Breve"* têm
significados clínicos distintos — a primeira é duração total, a segunda é dose de treino.

O risco não é teórico. No código, `PROTOCOL_LABELS` e `PROTOCOL_GUIDANCE_TEXTS` já ocupam o
vocabulário "Breve/Padrão/Estendido", e um `SessionProtocol` com os mesmos rótulos exigiria
desambiguar em cada texto de tela e em cada tipo.

### 3.2 Alternativas de nomenclatura

| Opção | Sessão | Dose do exercício | Avaliação |
|---|---|---|---|
| **A** | **20 / 35 / 50 min** (o número é o nome) | Breve · Padrão · Estendida | Sem homonímia por construção |
| **B** | Curta · Média · Longa | Breve · Padrão · Estendida | Dois vocabulários, ainda paralelos |
| **C** | Breve · Padrão · Extensa | 4 / 8 / 12 unidades (o número é o nome) | Inverte o problema para o exercício |
| **D** | Breve · Padrão · Extensa | Breve · Padrão · Estendida | **Homonímia plena — não recomendada** |

### 3.3 Recomendação justificada: opção A

**A sessão é identificada pelo número; só o exercício usa nome de protocolo.**

Três razões:

1. **O terapeuta já pensa a sessão em minutos.** A interface atual é um campo numérico, e o
   vocabulário clínico natural é "sessão de 35 minutos", não "sessão Padrão". Nomear com adjetivo
   acrescenta um vocabulário que ninguém pediu.
2. **Elimina a ambiguidade por construção, não por disciplina.** Nenhum texto precisa desambiguar,
   nenhum tipo precisa de prefixo, e não há como escrever a frase confusa.
3. **Preserva o significado clínico do Breve.** Ela exigiu que o Breve do exercício seja **dose
   válida de treino**, não recurso para "fazer caber". Se a sessão também se chama Breve, os dois
   sentidos se contaminam na cabeça de quem lê.

**Custo da opção A:** perde-se o rótulo curto para a sessão em espaços estreitos. Mitigação: usar
"Sessão de 35 min" no cabeçalho e "35 min" no seletor.

## 4. Cabeçalho da sessão

Estrutura proposta, com **hierarquia entre alvo e faixa**:

```
SESSÃO PRESCRITA
35 min                             ← alvo, em destaque
Estimativa: aproximadamente 34 min ← dado calculado
Dentro da faixa esperada           ← estado, com cor
Faixa esperada: 32–38 min          ← contexto, discreto
```

Três exigências de redação:

- **"aproximadamente"** antes da estimativa — o cálculo é faixa, não relógio;
- a **faixa esperada sempre visível**, não só quando há problema, para o terapeuta aprender que não
  precisa fechar em 35:00;
- o **estado** nomeado em português, sem cor de erro quando está dentro.

⚠️ Hoje a estimativa é exibida como intervalo (`27–33 min`). A proposta fala em "aproximadamente 34
min", um número único. **São modelos diferentes de apresentação** — decidir se o intervalo vira
ponto médio na linha principal (com o intervalo em "Ver detalhes") ou se o texto passa a ser
"aproximadamente 32–36 min". Está nas decisões pendentes.

## 5. Duração individual: como reduzir prioridade sem perder transparência

O pedido é **ordem de leitura**, não remoção. A duração continua calculada e continua existindo —
some apenas da linha principal do cartão compacto.

| Onde | Duração individual |
|---|---|
| Linha principal do cartão | **sai** |
| "Ver detalhes" | fica |
| Janela "Ajustar" | fica, por opção de protocolo |
| Cálculo da sessão | fica, inalterado |

A linha principal passa a: **nome · protocolo · carga · fadiga · Ajustar · remover · ordem.**

**A transparência se preserva porque o total continua visível no cabeçalho.** O terapeuta sempre
sabe quanto a sessão dura; o que deixa de disputar atenção é o minuto de cada exercício. E como a
janela "Ajustar" mostra a duração de cada protocolo lado a lado, a informação aparece exatamente no
momento em que ela é usada para decidir.

⚠️ Isto já está parcialmente implementado (`CompactExerciseMeta`, v2.71.0). A mudança restante é
tirar a duração de lá — verificar antes se ela não é o único indício visível de que um exercício
está em dose legada.

## 6. Compatibilidade — sem conversão silenciosa

### 6.1 O que preservar

Planos de 20, 30 e 40 min · protocolos salvos · doses legadas · níveis · progresso · histórico ·
frequência · exercícios · ordem · modalidade · parâmetros assistivos.

### 6.2 Como distinguir os três casos

O banco guarda `sessionDuration Int` — **qualquer inteiro**. Não há campo que diga "este plano é
Breve/Padrão/Extenso". Proposta:

| Caso | Como identificar | Comportamento |
|---|---|---|
| **Sessão nova** | `sessionDuration ∈ {20, 35, 50}` | Faixa própria, avaliação normal |
| **Plano legado** | `sessionDuration ∈ {30, 40}` **ou** qualquer outro valor | Mantém o valor, avalia contra faixa própria derivada, marcador discreto |
| **Personalizada** | valor fora de todos os anteriores | Faixa derivada do valor, sem marcador de legado |

⚠️ **30 e 40 são ambíguos:** hoje são alvos oficiais; na proposta, deixam de ser. Um plano salvo com
30 é "legado" ou "personalizado"? **Decisão dela.** A diferença é só o marcador na tela — nenhum
comportamento de cálculo muda.

**Recomendação:** em vez de manter uma tabela fechada de três valores, generalizar
`TARGET_DURATION_BOUNDS` para uma **função** que derive a faixa de qualquer duração (por exemplo,
±10% arredondado, calibrado para reproduzir exatamente 18–22, 32–38 e 46–54 nos três alvos). Isso:

- elimina `nearestTarget` e a distorção de avaliar 45 min como 40;
- faz plano legado e personalizado funcionarem sem caso especial;
- mantém os três alvos como **atalhos da interface**, não como restrição do tipo.

⚠️ Isso **relaxa** `TargetMinutes` de união literal para `number`, e a proteção de compilação que
hoje impede um valor inválido se perde. Mitigação: validar na fronteira (`isTarget` vira faixa
válida 10–90, alinhada ao que a interface já aceita) e manter os três alvos como constantes
nomeadas.

## 7. Impactos

**Clínico.** A sessão de 20 min fica apertada: a mediana do protocolo Padrão é **8 min**, então
2 exercícios em Padrão somam ~17 min (**abaixo** de 18) e 3 somam ~26 (**acima** de 22). Nenhuma
combinação inteira de Padrão fecha na faixa de 20 — a sessão curta **empurra** para o Breve. Isso
colide com a exigência dela de que o Breve não exista para "fazer caber". Em 35 min cabem ~4
exercícios em Padrão (~35 min) e em 50 min, ~6 (~53 min).

**Técnico.** A máquina de cálculo não muda; mudam quatro tabelas, um tipo e os testes de fronteira.
O risco concentra-se em `nearestTarget` e nas tabelas de carga/fadiga.

**UX.** Ganha-se um cabeçalho que ensina a diferença entre alvo e faixa. Perde-se pouco: a duração
individual só troca de lugar.

## 8. Riscos

1. **Carga e fadiga por regra de três** — o risco mais sério. `LOAD_REFERENCE` e os tetos são
   heurística clínica dela; interpolar 11,7 e 16,7 e adotar sem validação seria inventar critério.
2. **Perder a proteção de tipo** ao relaxar `TargetMinutes` para `number`.
3. **Reinterpretar planos de 30 e 40** — hoje alvos, amanhã não. Sem decisão explícita, o marcador
   de legado pode aparecer em planos perfeitamente válidos e assustar o terapeuta.
4. **Os 12 testes de fronteira** foram escritos contra valores que deixam de existir; reescrevê-los
   sem cuidado pode perder a cobertura das bordas.
5. **A sessão de 20 min** pressionar o uso do Breve, contrariando a regra clínica dela.

## 9. Decisões pendentes — precisam dela antes de qualquer código

1. **`LOAD_REFERENCE` para 35 e 50 min.** Manter 7 em 20 min e definir os outros dois. A
   interpolação daria 11,7 e 16,7 — **não adotar sem validação**.
2. **`HIGH_FATIGUE_CAP` e `PLANNING_WINDOW_CAP`** para as novas durações (hoje 1/2/2).
3. **Nomenclatura** — confirmar a opção A (sessão pelo número, exercício por nome).
4. **Planos de 30 e 40 min**: legados com marcador, ou personalizados sem marcador?
5. **Faixa fechada ou derivada?** Três valores permitidos, ou função que aceite qualquer duração de
   10 a 90, como a interface já faz?
6. **Estimativa como ponto ou intervalo** no cabeçalho ("aproximadamente 34 min" × "32–36 min").
7. **A sessão de 20 min** — aceitar que ela quase obriga o Breve, ou revisar a faixa?
8. **Estados de duração**: manter os quatro (`ABAIXO`/`DENTRO`/`ACIMA`/`EXCESSO_IMPORTANTE`) e só
   mover as fronteiras, ou rever também os limites de excesso?

## 10. Arquivos de uma futura implementação

| Arquivo | Mudança |
|---|---|
| `lib/prescription/types.ts` | `TargetMinutes` |
| `lib/prescription/duration.ts` | `TARGET_DURATION_BOUNDS`, `durationState` |
| `lib/prescription/load.ts` | `LOAD_REFERENCE`, `HIGH_FATIGUE_CAP`, `PLANNING_WINDOW_CAP` |
| `lib/prescription/legacy.ts` | `isTarget` |
| `lib/prescription/presentation.ts` | `nearestTarget`, `expectedRange`, cabeçalho |
| `components/plano/PlanBuilderSidebar.tsx` | seletor de duração, cabeçalho |
| `components/plano/prescription/CompactExerciseMeta.tsx` | tirar duração da linha principal |
| `components/plano/prescription/PrescriptionSummary.tsx` | cabeçalho da sessão |
| 7 arquivos de teste | fronteiras e asserções |

**Não** precisam mudar: `catalog.ts` · `validation.ts` (as condições) · `interpreter.ts` ·
`dose-settings.ts` · banco · migrations · APIs.

## 11. Ordem segura de implementação

1. **Decisões clínicas da seção 9** — sem elas, os números seriam inventados.
2. **Faixa derivada de função**, ainda com os valores antigos: elimina `nearestTarget` e corrige a
   distorção de 45 min → 40. **Nenhum comportamento visível muda** — é refatoração provada por
   testes.
3. **Novos alvos e faixas** (20/35/50 e as tabelas de carga/fadiga). Aqui o comportamento muda.
4. **Seletor da interface** com os três atalhos.
5. **Cabeçalho da sessão** com alvo, estimativa, estado e faixa.
6. **Duração individual** sai da linha principal.
7. **Marcador de plano legado**, conforme a decisão 4.

O passo 2 é o mais valioso e o mais barato: corrige dívida existente sem mudar nada visível. O
passo 3 é o ponto de virada — depois dele, planos existentes passam a ser avaliados contra faixas
diferentes.
