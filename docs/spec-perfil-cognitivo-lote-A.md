# Spec — Perfil cognitivo, LOTE A: taxonomia + 12 exercícios (Atenção e Velocidade)

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

## Documento 1 a criar: `docs/clinical-architecture/01-cognitive-domain-taxonomy.md`

- Definição de cada domínio das 8 famílias abaixo.
- Critérios da escala 0–3 com exemplo de cada valor.
- Diferença entre domínio principal, secundário e demanda instrumental.
- Diferença entre perfil basal e dinâmico.
- **Limitações da classificação** e aviso explícito de que **não é medida normativa nem
  diagnóstica** — é descrição de desenho de tarefa.

**Famílias e domínios** (usar exatamente estes nomes nas fichas e na matriz):

- **Atenção:** atenção seletiva · sustentada · dividida · alternada · orientação atencional ·
  rastreamento visual · busca visual · controle de distração.
- **Memória:** memória operacional verbal · memória operacional visuoespacial · armazenamento
  verbal de curto prazo · armazenamento visuoespacial de curto prazo · atualização de informação ·
  manipulação mental · memória prospectiva · memória episódica · aprendizagem por repetição.
- **Funções executivas:** controle inibitório · flexibilidade cognitiva · alternância de regra ·
  planejamento · organização · monitoramento · atualização · tomada de decisão · resolução de
  problemas · formação de estratégia · manutenção de meta · autocorreção.
- **Velocidade e resposta:** velocidade de processamento · tempo de reação simples · tempo de
  reação de escolha · rapidez perceptiva · velocidade de busca · pressão temporal · velocidade de
  decisão.
- **Raciocínio:** raciocínio lógico · dedutivo · visuoespacial · sequenciamento · ordenação
  temporal · categorização · comparação · estabelecimento de relações · inferência.
- **Percepção visuoespacial:** discriminação visual · percepção de forma · percepção de posição ·
  rotação mental · relações espaciais · integração visuoespacial · constância perceptiva ·
  figura-fundo · varredura espacial.
- **Linguagem e auditivo:** compreensão verbal · compreensão de instruções · processamento auditivo
  sequencial · discriminação auditiva · acesso lexical · leitura · compreensão textual.
- **Cognição social e funcional:** reconhecimento de emoções · interpretação de intenção · inferência
  social · julgamento social · resolução de situações sociais · autonomia funcional · tomada de
  decisão cotidiana · uso funcional de dinheiro · planejamento de atividades cotidianas.

Se faltar um processo necessário, propor a inclusão **explicando a necessidade**.

## Documento 2 a criar: `docs/clinical-architecture/02-exercise-cognitive-profiles.md`

Neste lote, **apenas estes 12 exercícios** (fichas completas). Criar o arquivo com um cabeçalho
dizendo que os demais entram nos lotes seguintes.

| Nome oficial | ID | Componente |
|---|---|---|
| Agentes Focus | `focus-agents` | `components/exercises/attention/FocusAgents.tsx` + `lib/focus/*` |
| Conecta Números | `trilha-visual` | `components/exercises/attention/TrilhaVisual.tsx` |
| Informação em Foco | `informacao-em-foco` | `components/exercises/attention/InformacaoEmFoco.tsx` + `lib/informacao-foco-questoes.ts` |
| Rastreamento de Objetos | `mot` | `components/exercises/attention/MOT.tsx` |
| Dupla Tarefa | `dual-task` | `components/exercises/attention/DualTask.tsx` |
| Vigilância | `vigilancia` | `components/exercises/attention/Vigilancia.tsx` + `lib/vigilancia*.ts` |
| Tempo de Reação | `tempo-reacao` | `components/exercises/processing/TempoReacao.tsx` |
| Certo ou Errado | `certo-ou-errado` | `components/exercises/processing/CertoOuErrado.tsx` |
| Semáforo | `semaforo` | `components/exercises/processing/Semaforo.tsx` |
| Busca Rápida | `corrida-tempo` | `components/exercises/processing/CorridaContraOTempo.tsx` |
| Identificação de Símbolos | `identificacao-simbolos` | `components/exercises/processing/IdentificacaoSimbolos.tsx` |
| Cores e Palavras | `stroop-task` | `components/exercises/executive/StroopTask.tsx` |

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
