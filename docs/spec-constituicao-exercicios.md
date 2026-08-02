# Spec — Constituição dos exercícios (cleanup final do catálogo)

Escopo: **documentação apenas**. Não tocar em código, `types/`, `lib/`, `components/`, banco,
migrations ou interface. Não commitar.

## 1. Criar `docs/architecture/CANONICAL_EXERCISES.md` (arquivo e pasta novos)

Este documento passa a ser a **Constituição dos exercícios do projeto**. Estrutura:

### Cabeçalho "OBJETIVO", com estas regras textuais

- Este documento é a **única fonte oficial** de exercícios do sistema.
- Todo exercício novo deve ser registrado aqui.
- **Não usar nomes técnicos na interface.**
- **Não usar Legacy IDs na documentação clínica.**
- Os IDs técnicos existem apenas para compatibilidade (planos, sessões, progresso no banco).
- Qualquer alteração de nome exige aprovação antes da implementação.

### Tabela principal — os 34, nesta ordem e com estes nomes

| # | ID técnico | Nome oficial | Categoria | Domínio principal | Modalidade configurável |
|---|---|---|---|---|---|
| 1 | `span-numerico` | Span Numérico Auditivo Direto | Memória | Memória Operacional | não (auditivo intrínseco) |
| 2 | `stroop-task` | Cores e Palavras | Funções Executivas | Controle Inibitório | não |
| 3 | `focus-agents` | Agentes Focus | Atenção | Atenção Sustentada | **sim** |
| 4 | `span-numerico-inverso` | Span Numérico Auditivo Inverso | Memória | Memória Operacional | não (auditivo intrínseco) |
| 5 | `matriz-espacial` | Matriz Espacial | Memória | Memória Visuoespacial | não |
| 6 | `matriz-espacial-inversa` | Matriz Espacial Inversa | Memória | Memória Visuoespacial | não |
| 7 | `jogo-memoria` | Jogo da Memória | Memória | Memória Visuoespacial | não |
| 8 | `trilha-visual` | Conecta Números | Atenção | Atenção Seletiva | não |
| 9 | `antes-depois` | Caminhos para a Meta | Funções Executivas | Planejamento e Flexibilidade | **sim** |
| 10 | `informacao-em-foco` | Informação em Foco | Atenção | Atenção Seletiva | não |
| 11 | `mot` | Rastreamento de Objetos | Atenção | Atenção Dividida | não |
| 12 | `dual-task` | Dupla Tarefa | Atenção | Atenção Dividida | não |
| 13 | `tempo-reacao` | Tempo de Reação | Velocidade de Processamento | Tempo de Reação | não |
| 14 | `certo-ou-errado` | Certo ou Errado | Velocidade de Processamento | Resposta Rápida | não |
| 15 | `semaforo` | Semáforo | Velocidade de Processamento | Tempo de Reação | não |
| 16 | `corrida-tempo` | Busca Rápida | Velocidade de Processamento | Resposta Rápida | não |
| 17 | `torre-hanoi` | Jogo das Torres | Funções Executivas | Planejamento | não |
| 18 | `labirinto` | Labirinto | Funções Executivas | Planejamento | não |
| 19 | `ordem-historia` | Ordem da História | Funções Executivas | Raciocínio Lógico | não |
| 20 | `compra-multifuncional` | Compra Multifuncional | Desenvolvimento Funcional | Autonomia | **sim** |
| 21 | `task-switching` | Alternância de Regras | Funções Executivas | Flexibilidade Cognitiva | não |
| 22 | `deductive-grid` | Grade Dedutiva | Funções Executivas | Raciocínio Lógico | não |
| 23 | `letras-sequencia` | Letras em Sequência | Memória | Memória Operacional | não |
| 24 | `sequencia-itens` | Sequência de Itens | Memória | Memória Operacional | não |
| 25 | `padroes-rotacao` | Matriz com Rotações | Memória | Memória Visuoespacial | não |
| 26 | `lista-distracao` | Lista com Distração | Memória | Memória Operacional | não |
| 27 | `restaurante-ordem` | Restaurante | Memória | Memória Operacional | **sim** |
| 28 | `desafio-supermercado` | Supermercado | Memória | Memória Operacional | **sim** |
| 29 | `nback` | N-Back | Memória | Memória Operacional | não |
| 30 | `cubo-corsi` | Cubos | Memória | Memória Visuoespacial | não |
| 31 | `vigilancia` | Vigilância | Atenção | Atenção Sustentada | não |
| 32 | `identificacao-simbolos` | Identificação de Símbolos | Velocidade de Processamento | Busca Visual Rápida | não |
| 33 | `estacionamento-logico` | Estacionamento Lógico | Funções Executivas | Planejamento | não |
| 34 | `investigadores-sociais` | Investigadores da Situação Social | Desenvolvimento Funcional | Cognição Social | não |

Todos com **Status: ACTIVE**.

### Seção "Modalidades"

Só os **cinco** marcados acima têm seletor: Restaurante · Supermercado · Caminhos para a Meta ·
Agentes Focus · Compra Multifuncional. Modos possíveis: **Visual · Visual + áudio · Somente áudio**.
Nenhum outro recebe sem nova decisão clínica. Os dois spans são **auditivos por definição, sem seletor**.

### Seção "Leitura assistiva ≠ Modalidade"

Leitura assistiva é **acessibilidade** (lê o texto visível). Modalidade **altera a forma cognitiva de
apresentação da tarefa**. A distinção vale para toda a arquitetura.

### Seção "Legacy IDs — compatibilidade"

Tabela única: `ID técnico · Nome oficial · Legacy IDs · Status`. Existem apenas para compatibilidade
com planos e sessões antigos e **nunca aparecem para terapeuta nem paciente**:

- `informacao-em-foco` ← `caca-item-barato`, `mudanca-regras`
- `compra-multifuncional` ← `desafio-orcamento`
- `focus-agents` ← `focus-agents-auditivo`
- `restaurante-ordem` ← `restaurante-ordem-auditivo`
- `desafio-supermercado` ← `desafio-supermercado-auditivo`

⚠️ Registrar a desambiguação: **"Mudança de Regras"** (`mudanca-regras`) foi exercício
**descontinuado**, fundido em Informação em Foco. **Não** é `task-switching`, cujo nome oficial é
**Alternância de Regras**.

### Seção "Fora do catálogo atual"

`desafio-cidade` — **REMOVED_FROM_CURRENT_CATALOG**. Não pertence ao catálogo, à documentação
clínica, nem às análises de carga, duração, prescrição ou categorias. **O código permanece
intocado** (`types/index.ts` — definição; `app/(patient)/treino/[exercicio]/page.tsx` — case do
switch). Será reconstruído futuramente como exercício novo.

## 2. Criar `docs/architecture/NOMENCLATURA-EXERCICIOS.md`

Explica **por que** alguns nomes diferem do ID interno. Registrar obrigatoriamente:

- **Cubos** — ID `cubo-corsi`. Não usamos "Corsi": é nome de **teste neuropsicológico padronizado**,
  e o aplicativo é de **treinamento** cognitivo, não de avaliação.
- **Cores e Palavras** — ID `stroop-task`. Não usamos "Stroop" pelo mesmo motivo.
- **Alternância de Regras** — ID `task-switching`. O paradigma científico chama-se Task Switching,
  mas o que o paciente executa é a **alternância das regras de resposta** — o nome oficial descreve
  o treino, não o paradigma.
- **Agentes Focus** — mantém "Focus" como identidade do exercício; a nomenclatura oficial é
  **Agentes Focus**.

Acrescentar a regra geral: **nome de teste padronizado nunca aparece para o paciente**, porque
carrega expectativa de medida diagnóstica.

## 3. Limpar `docs/auditoria-plano-terapeutico/*.md`

- Substituir o termo **"Alias"/"aliases"** por **"Legacy IDs"** em todos os documentos.
- Garantir que só aparecem os **34 nomes oficiais**.
- Remover da documentação clínica qualquer menção a exercício órfão, legado ou modo tratado como
  exercício — **exceto** nas seções explicitamente marcadas como referência técnica de
  compatibilidade.
- Nos documentos que citarem a lista canônica, apontar para `docs/architecture/CANONICAL_EXERCISES.md`
  como fonte oficial (o doc 16 passa a ser um espelho da auditoria, não a fonte).

## Prova de aceite

Rodar e conferir:

1. `grep -rn "Focus Agentes\|Focus Agents\|Task Switching" docs/` → **zero**.
2. `grep -rniE "\balias(es)?\b" docs/auditoria-plano-terapeutico/ docs/architecture/` → **zero**
   (substituído por "Legacy IDs").
3. `grep -rn "desafio-cidade" docs/` → só em seções de referência técnica, sempre acompanhado de
   `REMOVED_FROM_CURRENT_CATALOG`.
4. `docs/architecture/CANONICAL_EXERCISES.md` existe, tem **34 linhas** de exercício e os 34 nomes
   oficiais exatamente como na tabela desta spec.
5. `docs/architecture/NOMENCLATURA-EXERCICIOS.md` existe e cobre os 4 casos obrigatórios.
6. Exatamente **5** exercícios marcados com modalidade configurável **sim**.

Entregar o diff no worktree + listar os arquivos novos. Não commitar.
