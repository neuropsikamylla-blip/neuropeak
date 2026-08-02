# Spec — Perfil cognitivo, LOTE C: 9 fichas (Executivas, Funcional e Social) + matriz + JSON + perguntas

Fase 1 da arquitetura clínica. **Só análise e documentos.** Não tocar em código, exercícios,
progressão, níveis, duração, carga, banco, migrations, interface, catálogo, modalidades, nomes ou
engine. Não commitar.

Fonte única de verdade dos exercícios: `docs/architecture/CANONICAL_EXERCISES.md`.

## Princípio que rege tudo

**Não classificar pelo nome, pela categoria do catálogo ou pela descrição.** Ler o código real de
cada exercício (componente, `lib/` associada, geração de estímulo, condição de encerramento) e
descrever **o que o paciente realmente faz**.

Proibido assumir: que `stroop-task` treina só inibição; que `cubo-corsi` treina só memória
visuoespacial; que um exercício "de atenção" não recruta memória operacional; que planejamento
implica demanda alta em todos os níveis.

## Escala 0–3 (importância do processo NA MECÂNICA, não dificuldade do exercício)

`0` não é demanda relevante · `1` auxiliar/leve · `2` relevante · `3` central ou muito intensa.

⚠️ **Nesta fase é PROIBIDO** atribuir carga (baixa/moderada/alta), duração, dose, tempo ideal,
limite de sessão, ordem ideal, fadiga ou número máximo por sessão. Pode registrar *fatores que
influenciarão a carga depois* (ex.: "distratores semelhantes aumentam a exigência de discriminação
visual"), nunca a carga em si.

## Distinções obrigatórias em cada ficha

1. **Domínio principal** — o processo que é o alvo da atividade.
2. **Domínios secundários** — necessários para executar, mas não são o alvo.
3. **Demandas instrumentais** — leitura, percepção visual, discriminação auditiva, coordenação/
   velocidade motora, uso de mouse ou toque. **Não são domínio treinado.**
4. **Estratégias possíveis** — repetição subvocal, agrupamento, varredura sistemática, planejamento
   antecipado, eliminação de hipóteses, comparação, categorização, ensaio mental, autorregulação.
5. **Perfil basal** (níveis iniciais/configuração padrão) × **modificadores dinâmicos** (o que sobe
   com nível, velocidade, nº de estímulos, tamanho da sequência, semelhança dos distratores, nº de
   regras, interferência, dupla tarefa). Não fazer uma tabela por nível — só os modificadores que
   alteram o perfil de forma significativa.

## Documento a atualizar: `docs/clinical-architecture/02-exercise-cognitive-profiles.md`

O arquivo **já existe** (lote A). **Acrescentar** as fichas abaixo, sem alterar as existentes.

| Nome oficial | ID | Componente |
|---|---|---|
| Caminhos para a Meta | `antes-depois` | `components/exercises/executive/caminhos-meta/CaminhosMeta.tsx` |
| Jogo das Torres | `torre-hanoi` | `components/exercises/executive/TorreHanoi.tsx` |
| Labirinto | `labirinto` | `components/exercises/executive/Labirinto.tsx` |
| Ordem da História | `ordem-historia` | `components/exercises/executive/OrdemHistoria.tsx` |
| Compra Multifuncional | `compra-multifuncional` | `components/exercises/executive/CompraMultifuncional.tsx` + `lib/compra-missoes.ts` |
| Alternância de Regras | `task-switching` | `components/exercises/executive/TaskSwitching.tsx` |
| Grade Dedutiva | `deductive-grid` | `components/exercises/executive/DeductiveGrid.tsx` |
| Estacionamento Lógico | `estacionamento-logico` | `components/exercises/executive/EstacionamentoLogico.tsx` |
| Investigadores da Situação Social | `investigadores-sociais` | `components/exercises/social/InvestigadoresSociais.tsx` |

### Modalidade — Caminhos para a Meta e Compra Multifuncional TÊM seletor

(Compra: aprovado e **ainda não implementado** — analisar como projeção.) Mesmas exigências dos
outros: perfil comum, o que muda em cada modo, impacto sobre leitura/memória/interferência e
possibilidade de facilitação por redundância.

### Leitura assistiva

Existe hoje em Caminhos para a Meta. Diferenciar leitura de instrução geral × leitura de conteúdo
que faz parte da tarefa × repetição de conteúdo que deveria ser memorizado.

## Documento 3: `docs/clinical-architecture/03-cognitive-matrix.md`

Matriz consolidada dos **34** exercícios (linhas), lendo as fichas dos lotes A e B já presentes no
repositório mais as deste lote. Colunas mínimas: atenção seletiva · sustentada · dividida ·
alternada · controle de distração · busca visual · memória operacional verbal · memória operacional
visuoespacial · armazenamento verbal · armazenamento visuoespacial · atualização · manipulação
mental · controle inibitório · flexibilidade cognitiva · alternância de regra · planejamento ·
organização · monitoramento · resolução de problemas · manutenção de meta · velocidade de
processamento · tempo de reação · rapidez perceptiva · raciocínio lógico · dedutivo ·
visuoespacial · sequenciamento · ordenação temporal · discriminação visual · rotação mental ·
relações espaciais · compreensão verbal · processamento auditivo sequencial · leitura · cognição
social · autonomia funcional.

Valores 0–3. Se ficar larga demais, dividir por macrodomínio **e** gerar a versão consolidada.

## Documento 4: `docs/clinical-architecture/cognitive-matrix.json`

Um objeto por exercício, preservando a separação entre perfil basal, modificadores, modalidade,
confiança e decisões pendentes:

```json
{
  "exerciseId": "focus-agents",
  "officialName": "Agentes Focus",
  "primaryDomains": [],
  "secondaryDomains": [],
  "instrumentalDemands": [],
  "baselineProfile": { "selectiveAttention": 0, "sustainedAttention": 0 },
  "dynamicModifiers": [],
  "modalities": {},
  "confidence": "high",
  "pendingClinicalDecisions": []
}
```

## Documento 5: `docs/clinical-architecture/04-clinical-review-questions.md`

Só o que precisa de decisão clínica humana, organizado **por exercício** e por prioridade:
**bloqueante · importante · refinamento**. Não repetir o conteúdo das fichas.

## Validação de coerência sobre os 34 (obrigatória neste lote)

Rodar as 10 verificações do lote A sobre a matriz inteira e **corrigir** antes de entregar:
exercícios com mesmo perfil têm pontuação justificável? · excesso de 3? · domínio atribuído só pelo
nome? · planejamento sem memória operacional? · tempo de reação simples onde há escolha? · memória
confundida com episódica? · leitura confundida com linguagem-alvo? · motor confundido com
velocidade? · sustentada atribuída só por duração? · executiva genérica sem operação identificável?

### Estrutura obrigatória de cada ficha (20 itens)

1. Nome oficial · 2. ID técnico · 3. Categoria atual · 4. Subdomínio atual · 5. Objetivo funcional
aparente · 6. **Resumo da mecânica real** (lido no código) · 7. Resposta exigida do paciente ·
8. Unidade básica da tarefa · 9. Domínio principal · 10. Domínios secundários · 11. Demandas
instrumentais · 12. Estratégias possíveis · 13. **Perfil basal 0–3** (só os domínios com valor ≥ 1) ·
14. Modificadores nos níveis avançados · 15. Processos pouco ou **não** recrutados · 16. **Risco de
confundir requisito da tarefa com alvo de treino** · 17. Impacto da modalidade (só onde houver) ·
18. Impacto da leitura assistiva (só onde houver) · 19. Confiança: alto/moderado/baixo ·
20. Questões que precisam de decisão clínica humana.

### Modalidade — só Agentes Focus tem, neste lote

Registrar: perfil comum · o que muda em Visual, Visual+áudio e Somente áudio · impacto sobre
leitura, memória auditiva, memória visual, atenção dividida e interferência · **possibilidade de
facilitação por redundância audiovisual**. Não assumir que visual+áudio é sempre mais difícil.
⚠️ O seletor do Agentes Focus foi **aprovado e ainda não implementado** — analisar como projeção.

### Leitura assistiva

Existe hoje em Agentes Focus e Informação em Foco. Não tratar como modalidade. Diferenciar leitura
de **instrução geral** × leitura de **conteúdo que faz parte da tarefa** × **repetição de conteúdo
que deveria ser memorizado** — os três têm efeitos diferentes.

## Validação interna antes de entregar

Conferir e corrigir: excesso de valor 3 · domínio atribuído só porque o nome sugere · planejamento
sem memória operacional · "tempo de reação simples" onde na verdade há escolha · atenção sustentada
atribuída só porque a atividade dura minutos · função executiva genérica sem operação identificável ·
leitura confundida com linguagem como alvo · coordenação motora confundida com velocidade de
processamento.

## Entrega

Os dois documentos no worktree. Não commitar. Ao fim, listar em uma linha por exercício: nome,
domínio principal e confiança.
