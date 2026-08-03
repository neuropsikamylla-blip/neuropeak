# Spec — Camada macro: perfil cognitivo associado dos 34 exercícios

**Só documentação e JSON clínico.** Não tocar em código, catálogo, `types/`, `lib/`, banco,
migrations, interface ou engine. Não commitar. **Não iniciar carga cognitiva.**

Fontes: `docs/clinical-architecture/cognitive-matrix.json` (matriz fina, 34 exercícios),
`docs/clinical-architecture/02-exercise-cognitive-profiles.md` (fichas),
`docs/architecture/CANONICAL_EXERCISES.md` (catálogo) e `lib/domain-taxonomy.ts` (domínio e
subdomínio do catálogo — **ler, nunca alterar**).

## Princípio que rege tudo (decisão clínica dela)

**A matriz fina é DESCRITIVA da mecânica real. Não é prescritiva nem aspiracional.**
Quando a finalidade clínica, a categoria do catálogo e a mecânica divergirem, **não alterar a matriz
para fazê-las coincidir** — registrar as três coisas separadamente.

## 1. Quatro campos que convivem

| Campo | O que é | Origem |
|---|---|---|
| `catalogDomain` / `catalogSubdomain` | organizam a **interface**; representam a finalidade clínica escolhida para apresentar o exercício | `lib/domain-taxonomy.ts` — **copiar como está, jamais recalcular** |
| `mechanicalPrimary` | operação cognitiva predominante **exigida pela mecânica atual**; informativo | derivado da matriz fina (o de maior intensidade) |
| `associatedCognitiveProfiles` | macros cognitivos secundários | derivados da matriz (regra §3) |
| `functionalClinicalTags` | aplicação/contexto funcional | §4 |

⚠️ **Divergência entre `catalogSubdomain` e `mechanicalPrimary` NÃO é erro.** Não "corrigir"
nenhum dos dois para coincidir.

## 2. Os 20 macros cognitivos (usar exatamente estes nomes)

**Atenção:** 1 Atenção Seletiva · 2 Atenção Sustentada · 3 Atenção Dividida · 4 Atenção Alternada ·
5 Busca e Rastreamento Visual
**Memória:** 6 Memória Operacional Verbal · 7 Memória Operacional Visuoespacial · 8 Armazenamento de
Curto Prazo · 9 Atualização e Manipulação Mental
**Funções executivas:** 10 Controle Inibitório · 11 Flexibilidade Cognitiva · 12 Planejamento ·
13 Organização e Sequenciamento · 14 Monitoramento Executivo e Manutenção de Meta · 15 Resolução de
Problemas e Tomada de Decisão
**Velocidade e percepção:** 16 Velocidade de Processamento · 17 Tempo de Reação · 18 Percepção e
Processamento Visuoespacial
**Linguagem e raciocínio:** 19 Linguagem, Leitura e Processamento Auditivo · 20 Raciocínio Lógico e
Dedutivo

Cada domínio fino da matriz deve mapear para **exatamente um** macro. Produzir esse mapeamento
explicitamente no documento (tabela `domínio fino → macro`) para ser auditável. Domínio fino que não
encontrar macro deve ser **listado à parte**, não forçado.

## 3. Regra de derivação dos associados

Um macro entra como associado quando:

- agrega **pelo menos um domínio fino com valor 2 ou 3** na matriz;
- **não** é equivalente ao `mechanicalPrimary`;
- representa demanda cognitiva relevante e recorrente;
- **não** é apenas exigência instrumental;
- **não** foi inferido pelo nome, pela duração ou pela categoria do exercício.

Ordenar por: (1) maior intensidade fina · (2) quantidade de domínios finos relevantes dentro do
macro · (3) centralidade na mecânica · (4) persistência ao longo dos níveis.

**Máximo 4 na camada resumida. NÃO forçar 4** — um exercício pode ter 1, 2, 3 ou 4. O JSON detalhado
preserva todos os domínios finos.

## 4. Tags funcionais (estrutura SEPARADA dos macros)

Autonomia Funcional · Cognição Social · Atividades Instrumentais da Vida Diária · Tomada de Decisão
Cotidiana · Organização da Rotina · Uso Funcional de Dinheiro · Compreensão de Situações Sociais.

Não substituem processos cognitivos, **não entram como `mechanicalPrimary`** e descrevem a aplicação
ou o contexto da atividade.

## 5. PROIBIÇÕES EXPLÍCITAS (§9 da decisão dela)

Não usar rótulo macro amplo para incluir processo que a matriz **não** encontrou:

- **não** converter sequenciamento em Flexibilidade Cognitiva;
- **não** converter duração em Atenção Sustentada;
- **não** converter ordem inversa em Flexibilidade Cognitiva;
- **não** converter leitura em Linguagem como alvo de treino;
- **não** converter movimento rápido em Velocidade de Processamento;
- **não** converter atividade cotidiana em Autonomia Funcional como processo cognitivo.

O macro **resume** os domínios finos; não os substitui.

### Dois casos decididos por ela, a respeitar literalmente

**Caminhos para a Meta (`antes-depois`)** — `profileStatus: PROVISIONAL_PROFILE`.
`catalogSubdomain` continua "Planejamento e Flexibilidade"; `mechanicalPrimary` continua
**Organização**. Associados: Organização e Sequenciamento · Monitoramento Executivo e Manutenção de
Meta · Memória Operacional Verbal (se a matriz sustentar). **NÃO incluir Flexibilidade Cognitiva** —
ela só entra quando a mecânica reformulada exigir mudança de estratégia, replanejamento, mais de uma
rota ou abandono de estratégia ineficiente. Registrar em nota que o exercício será reformulado e que
seu perfil atual **não** deve servir de modelo para a engine.

**Restaurante (`restaurante-ordem`)** — `mechanicalPrimary` = Memória Operacional Verbal.
Associados derivados do que a matriz encontrou (atenção seletiva, controle de distração,
armazenamento, etc.). **NÃO incluir Atenção Sustentada** (não é consequência de durar minutos) nem
**Flexibilidade Cognitiva** (ordem direta/inversa/com exclusão aumenta manipulação, atualização,
inibição e manutenção de regra — não é alternância ativa entre regras).

## 6. `profileStatus`

`PROVISIONAL_PROFILE` — só **Caminhos para a Meta**.
`FINALIZED_PROFILE` — os outros 33.

## 7. Entregáveis

### `docs/clinical-architecture/05-associated-cognitive-profiles.md`

- Tabela de mapeamento **domínio fino → macro** (auditável).
- Tabela dos 34: `catalogDomain · catalogSubdomain · mechanicalPrimary · associados · tags
  funcionais · profileStatus`.
- Seção "Divergências entre catálogo e mecânica" — listando os casos, **sem tratá-los como erro**.
- Nota sobre Caminhos para a Meta (provisório) e sobre a decisão do Restaurante.

### `docs/clinical-architecture/associated-profiles.json`

Um objeto por exercício:

```json
{
  "exerciseId": "compra-multifuncional",
  "officialName": "Compra Multifuncional",
  "catalogDomain": "Desenvolvimento Funcional",
  "catalogSubdomain": "Autonomia",
  "mechanicalPrimary": "Resolução de Problemas e Tomada de Decisão",
  "associatedCognitiveProfiles": [],
  "functionalClinicalTags": [],
  "instrumentalDemands": [],
  "profileStatus": "FINALIZED_PROFILE"
}
```

**Não alterar** `cognitive-matrix.json` nem os documentos 01–04 — a camada macro é **derivada**, não
substitui a fina.

## 8. Verificações antes de entregar

1. Nenhum exercício mudou de lugar no catálogo (`catalogDomain`/`catalogSubdomain` idênticos a
   `lib/domain-taxonomy.ts`).
2. Nenhum `mechanicalPrimary` foi alterado para coincidir com o catálogo.
3. Caminhos para a Meta está `PROVISIONAL_PROFILE` e **sem** Flexibilidade Cognitiva.
4. Restaurante **sem** Atenção Sustentada e **sem** Flexibilidade Cognitiva.
5. Autonomia Funcional e Cognição Social estão **só** em `functionalClinicalTags`, nunca nos macros.
6. Nenhum exercício foi forçado a ter 4 associados.
7. `cognitive-matrix.json` intacto (comparar antes/depois).
8. Os 34 exercícios presentes, ids batendo com o canônico.

## 9. Relatório ao fim

1. Tabela dos 34 (os 6 campos). 2. Exercícios em que `catalogSubdomain` ≠ `mechanicalPrimary`.
3. Exercícios com menos de 2 associados. 4. Exercícios com 4 associados. 5. Provisórios.
6. Macros **não utilizados** por nenhum exercício. 7. Domínios finos **sem** macro correspondente.

Entregar no worktree. Não commitar.
