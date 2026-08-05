# A revisão do plano como assistente clínico, não relatório do motor

> Decisão arquitetônica dela, 04/ago/2026. **Nada implementado.** Nenhum código, interface ou banco
> tocado. A **Fase T1 segue aprovada e intacta**.
>
> Documento **novo**. Complementa `11-ordem-sugerida-vs-real.md`; `01`–`11` seguem válidos.

## 1. O princípio

A tela responde **uma** pergunta:

> **"Existe algo neste plano que merece minha atenção antes de salvar?"**

O motor pode calcular dezenas de regras. A interface mostra apenas o que **pode mudar uma decisão
clínica**. Cinco observações úteis valem mais que vinte regras do algoritmo.

## 2. O diagnóstico, medido

Plano com os 34 exercícios, alvo 40 min:

| | |
|---|---:|
| Ocorrências no núcleo | **66** |
| Exercícios citados | 34 |
| **Exercícios citados por MAIS DE UM alerta** | **33** |

**Dual Tarefa e N-Back aparecem 7 vezes cada**, em cinco códigos distintos:

```
dual-task  →  HIGH_FATIGUE_COUNT · HIGH_FATIGUE_ADJACENT · HIGH_INTERFERENCE_ADJACENT
              DECLARED_BAD_COMBINATION · OUTSIDE_BEST_POSITION
```

⚠️ **Cinco alertas para dizer a mesma coisa:** *este exercício é intenso*. O terapeuta lê cinco
cartões e extrai um fato. É exatamente a diluição de importância que ela descreveu — quando tudo
alerta, nada alerta.

## 3. Classificação dos 18 códigos

### 3.1 Fundíveis — falam da mesma característica

**Grupo A — INTENSIDADE GLOBAL** (5 códigos → 1 insight)

`HIGH_FATIGUE_COUNT` · `HIGH_FATIGUE_ADJACENT` · `HIGH_FATIGUE_POSITION` · `LOAD_AT_CAP` ·
`LOAD_OVER_CAP`

Todos medem facetas de **quanto o plano exige**. A fusão que ela propôs:

> **"Plano de intensidade alta"** — 12 dos 34 exercícios têm fadiga alta, e a carga está acima da
> referência para esta duração.

**Grupo B — CONCENTRAÇÃO COGNITIVA** (3 códigos → 1 insight)

`COGNITIVE_CONCENTRATION` · `DECLARED_BAD_COMBINATION` · `AUDITORY_ONLY_ADJACENT`

Todos descrevem **sobreposição de processos**. Hoje `DECLARED_BAD_COMBINATION` sozinho gera **41
ocorrências** — o maior produtor de ruído do sistema.

> **"Concentração em memória operacional verbal"** — 9 pares do plano recrutam processos
> semelhantes.

**Grupo C — DURAÇÃO** (4 códigos → 1 insight)

`SESSION_BELOW_TARGET` · `SESSION_ABOVE_TARGET` · `SESSION_RANGE_PARTIAL` ·
`SESSION_SAFE_MAX_EXCEEDED`

São **um só fato** — a estimativa em relação à meta — repartido em quatro faixas. O terapeuta precisa
de um número e um estado, não de quatro mensagens.

**Grupo D — PLANEJAMENTO** (2 códigos → 1 insight)

`PLANNING_WINDOW_COUNT` · `PLANNING_WINDOW_ADJACENT`

> **"Muitas janelas de planejamento"** — 6 exercícios exigem planejamento prolongado.

### 3.2 Redundantes — não acrescentam fato novo

| Código | Por que |
|---|---|
| `SESSION_RANGE_PARTIAL` | *"a faixa pode terminar dentro ou fora"* — descreve a **incerteza do cálculo**, não a clínica |
| `LOAD_AT_CAP` | "está exatamente na referência" não é diferente de "está perto"; a referência é heurística |
| `HIGH_FATIGUE_ADJACENT` | o par já é contado em `HIGH_FATIGUE_COUNT`; a adjacência **não se concretiza** (ver doc 11) |
| `OUTSIDE_BEST_POSITION` | **13 ocorrências** dizendo que o exercício *"pode permanecer nessa posição"* |

### 3.3 Cálculo interno sem tradução clínica

| Hoje aparece | Problema |
|---|---|
| **"Carga basal: 11 / referência 10"** | escala sem unidade clínica — o terapeuta não sabe o que "11" significa |
| **"Estimativa atravessa a faixa esperada"** | fala do algoritmo, não do paciente |
| **"6 janelas"**, **"9 pares"** como dado principal | contagem sem consequência declarada |
| `OPEN_POSITION_NOT_ELIGIBLE` / `CLOSE_POSITION_NOT_ELIGIBLE` | elegibilidade para posições que o paciente escolhe |

⚠️ **A carga basal é o caso mais claro.** Ela mesma definiu que é heurística consultiva e que *"duas
sessões com a mesma soma podem receber alertas diferentes"*. Exibi-la como número de destaque
contradiz a própria definição — e ainda sugere precisão que ela não tem.

### 3.4 O que ajuda um terapeuta experiente

1. **A sessão vai caber no tempo?** — duração estimada contra a meta;
2. **O plano é intenso demais para este paciente?** — concentração de fadiga alta;
3. **Estou treinando a mesma coisa várias vezes?** — sobreposição de processos;
4. **Estou deixando um domínio de fora?** — ⚠️ **não existe hoje** (ver 3.5);
5. **Há algo que eu não notei?** — combinação que mereça olhar.

### 3.5 ⚠️ A lacuna: ausência de domínios

Ela listou **"ausência de domínios importantes"** entre as prioridades. Verifiquei os 18 códigos:
**nenhum trata disso.** O sistema sabe dizer que há concentração demais, mas **não** que há uma
ausência.

Clinicamente, é a informação mais acionável das cinco: um plano sem nenhum exercício de memória, ou
só de atenção, é decisão que merece confirmação — e o terapeuta pode não perceber montando exercício
a exercício.

**É funcionalidade nova, não reorganização.** Fica registrada como proposta, não como implementação.

## 4. Hierarquia de importância proposta

### Nível 1 — Merece revisão antes de salvar

Condições **objetivas e independentes de ordem**, que podem inviabilizar a sessão na prática:

1. **Duração muito distante da meta** — o paciente não terminará, ou terminará cedo demais;
2. **Intensidade global alta** — fadiga concentrada somada a carga acima da referência;
3. **Ausência de domínio prioritário** *(quando existir)*.

### Nível 2 — Observação clínica

Pode ser intencional; o terapeuta decide:

4. **Concentração cognitiva** — sobreposição de processos, plano focal;
5. **Muitas janelas de planejamento** — exige persistência;
6. **Concentração de modalidade** — ex.: todo o plano auditivo-verbal.

### Nível 3 — Informação

Sem cor de alerta, recolhido por padrão:

7. **Composição por domínio** — quantos exercícios de cada;
8. **Duração dentro da faixa** — confirmação silenciosa de que está tudo bem.

⚠️ **Nada aqui bloqueia salvar.** Segue valendo `blocksSave: false` por tipo e `canSave: true`
literal.

### 4.1 O efeito esperado

| | Hoje | Proposto |
|---|---:|---:|
| Ocorrências no núcleo | 66 | **66** *(inalterado)* |
| Cartões de primeiro nível | 8 | **3 a 5** |
| Dependentes de ordem | 21 | **0** |
| Métricas sem tradução | 3 | **0** |

**Um plano bem composto deveria mostrar zero ou um insight.** Hoje mostra oito — e é aí que a
importância se dilui.

## 5. Princípio de implementação

⚠️ **Fundir na APRESENTAÇÃO, nunca no núcleo.**

`validation.ts` continua emitindo as 66 ocorrências. A fusão é da camada que apresenta. Três razões:

1. **rastreabilidade** — o relatório do terapeuta pode precisar do detalhe;
2. **a futura análise da execução real** precisa dos códigos de ordem (doc 11);
3. **reverter uma decisão de apresentação é barato**; reconstruir dado descartado, não.

## 6. Decisões pendentes

1. **A carga basal sai da tela?** Ela é heurística sem unidade clínica. Some, ou vira texto
   qualitativo?
2. **A ausência de domínios entra?** É funcionalidade nova. Se sim, qual o critério — domínio
   ausente, ou abaixo de um mínimo?
3. **"Intensidade global" precisa de fórmula.** Fundir fadiga e carga num só insight exige definir
   quando disparar. Isso é **decisão clínica dela**, não técnica.
4. **Um plano sem nenhum insight mostra o quê?** Silêncio, ou confirmação explícita de que está
   dentro do esperado?
5. **Os alertas fundidos guardam o detalhe?** Proponho expansão sob demanda, preservando o que hoje
   se vê.

## 7. O que esta análise NÃO faz

Não altera código, interface, núcleo, banco ou testes · não interrompe a T1 · não inicia
implementação.
