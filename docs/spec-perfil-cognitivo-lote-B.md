# Spec — Perfil cognitivo, LOTE B: 13 fichas (Memória)

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
| Span Numérico Auditivo Direto | `span-numerico` | `components/exercises/memory/SpanNumerico.tsx` |
| Span Numérico Auditivo Inverso | `span-numerico-inverso` | `components/exercises/memory/SpanNumerico.tsx` (modo inverso) |
| Matriz Espacial | `matriz-espacial` | `components/exercises/memory/MatrizEspacial.tsx` |
| Matriz Espacial Inversa | `matriz-espacial-inversa` | `components/exercises/memory/MatrizEspacial.tsx` (modo inverso) |
| Jogo da Memória | `jogo-memoria` | `components/exercises/memory/JogoMemoria.tsx` |
| Letras em Sequência | `letras-sequencia` | `components/exercises/memory/LetrasSequencia.tsx` |
| Sequência de Itens | `sequencia-itens` | `components/exercises/memory/SequenciaItens.tsx` |
| Matriz com Rotações | `padroes-rotacao` | `components/exercises/memory/PadroesRotacao.tsx` |
| Lista com Distração | `lista-distracao` | `components/exercises/memory/ListaDistracao.tsx` |
| Restaurante | `restaurante-ordem` | `components/exercises/memory/RestauranteOrdem.tsx` |
| Supermercado | `desafio-supermercado` | `components/exercises/memory/DesafioSupermercado.tsx` |
| N-Back | `nback` | `components/exercises/memory/NBack.tsx` |
| Cubos | `cubo-corsi` | `components/exercises/memory/CuboCorsi.tsx` |

### Modalidade — Restaurante e Supermercado TÊM seletor

Para os dois, registrar: perfil comum · o que muda em Visual, Visual+áudio e Somente áudio ·
impacto sobre leitura, memória auditiva, memória visual, atenção dividida e interferência ·
**possibilidade de facilitação por redundância audiovisual**. Não assumir que visual+áudio é mais
difícil.

### Os dois spans são AUDITIVOS por definição

Sem seletor de modalidade, áudio intrínseco e obrigatório (áudio gravado em
`/exercises/audio/numeros/*.m4a`). ⚠️ Fato a considerar na ficha: **a tecla acende em sincronia com
a fala** (`flashKey`) — é realce visual do estímulo auditivo, e afeta se o construto é retenção
auditiva pura ou audiovisual. Analisar e levantar como questão clínica.

### Inverso × Direto

`span-numerico-inverso` e `matriz-espacial-inversa` exigem **manipulação mental** além do
armazenamento. As fichas devem deixar claro o que os separa dos diretos.

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
