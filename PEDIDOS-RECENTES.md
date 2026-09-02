# As 3 ultimas especificacoes dela (automatico; a mais nova por ultimo)
# Na retomada: ler as 3, conectar com PROGRESSO.md e git, declarar e seguir.

## 01/09/2026 18:29
obrigada, me desculpa pelo estresse, hoje estou no dia dificil

## 01/09/2026 18:29
tem algo ainda para fazer? antes de eu mandar o proximo comando

## 02/09/2026 14:44
vamos melhorar cada exercicio... nesse momento quero ir um por um... torre vc já fechou certo? vamos para o proximo: Quero REFORMULAR COMPLETAMENTE o exercício atual “GRADE DEDUTIVA”.

IMPORTANTE:

Não quero simplesmente acrescentar mais pistas ao exercício existente.

Quero mudar a ARQUITETURA COGNITIVA do exercício para que ele deixe de ser uma atividade simples de associação e passe a ser um treino real de raciocínio lógico, resolução de problemas e funções executivas.

Antes de alterar qualquer coisa:

1. Leia toda a implementação atual da Grade Dedutiva.
2. Identifique:
   - arquivos;
   - componentes;
   - estados;
   - banco de problemas;
   - lógica de dificuldade;
   - progressão;
   - persistência;
   - relatórios;
   - eventos;
   - Supabase;
   - tutorial.
3. Me mostre o que pode ser reaproveitado.
4. Não mexa em outros exercícios.
5. Não faça migration no banco sem me mostrar antes.
6. Se precisar alterar Supabase:
   - separar essa etapa;
   - fazer backup antes;
   - seguir o procedimento de segurança já utilizado no projeto.
7. Implementar em etapas pequenas.
8. Cada etapa deve terminar com:
   - teste;
   - evidência;
   - commit próprio.
9. Não simplifique silenciosamente nenhuma regra desta especificação.
10. Se algo for tecnicamente inviável ou desproporcional, explique antes de substituir por outra solução.

==================================================
1. OBJETIVO COGNITIVO
==================================================

Este exercício é um TREINO COGNITIVO.

Quero trabalhar principalmente:

1. raciocínio lógico-dedutivo;
2. resolução de problemas;
3. planejamento;
4. memória operacional;
5. controle inibitório;
6. monitoramento de erros;
7. flexibilidade cognitiva.

A memória operacional deve ser trabalhada principalmente por:

- manter relações simultaneamente;
- integrar informações;
- acompanhar hipóteses;
- sustentar consequências lógicas;
- combinar pistas.

NÃO quero esconder pistas para obrigar memorização.

O foco não é memória episódica nem decorar frases.

==================================================
2. O PROBLEMA DO EXERCÍCIO ATUAL
==================================================

O exercício atual está cognitivamente muito simples.

Exemplos como:

“Bruno tem a casa verde.”

“Ana não tem a casa azul.”

e uma grade com:

Ana
Bruno
Carla

×

Azul
Verde
Amarela

exigem principalmente:

- associação direta;
- eliminação simples;
- pouca integração;
- pouca resolução de problemas.

Isso pode continuar existindo SOMENTE no tutorial.

O tutorial serve para ensinar:

“como usar a interface”.

Ele NÃO deve ser considerado exercício real de treino.

==================================================
3. CONCEITO DO NOVO EXERCÍCIO
==================================================

Quero problemas inspirados na lógica dos clássicos “logic grid puzzles”, mas com:

- conteúdo próprio;
- estrutura própria;
- identidade própria;
- sem copiar problemas de terceiros.

Cada desafio terá:

- N posições;
- múltiplas categorias;
- N elementos diferentes em cada categoria;
- várias pistas;
- exatamente UMA solução correta.

Exemplo:

POSIÇÕES

1 | 2 | 3 | 4

CATEGORIAS

Pessoa
Projeto
Bebida
Cor da pasta

O paciente precisa descobrir a única organização possível.

==================================================
4. NÚCLEO DO RACIOCÍNIO
==================================================

O exercício deve exigir este processo:

ANALISAR AS PISTAS
↓
IDENTIFICAR POSSIBILIDADES
↓
ELIMINAR O IMPOSSÍVEL
↓
INTEGRAR RELAÇÕES
↓
FORMULAR HIPÓTESES
↓
TESTAR CONSEQUÊNCIAS
↓
IDENTIFICAR CONTRADIÇÕES
↓
REVISAR
↓
REPLANEJAR
↓
DEDUZIR A SOLUÇÃO

Não quero:

“leu uma frase → marcou a resposta”.

Quero dependência real entre pistas.

==================================================
5. PRINCÍPIO IMPORTANTE
==================================================

A maioria das conclusões dos problemas reais NÃO deve ser determinada por uma única pista.

Exemplo ruim:

“Bruno está com a pasta verde.”

→ resposta direta.

Pode existir ocasionalmente.

Mas a maior parte da solução deve exigir integração.

Exemplo:

“Bruno está à direita de Ana.”

“Ana está exatamente ao lado da pessoa da pasta azul.”

“A pessoa da pasta azul não está na posição 1.”

A conclusão surge do conjunto.

==================================================
6. TUTORIAL
==================================================

O tutorial pode continuar extremamente simples.

Exemplo:

3 pessoas × 3 atributos.

Poucas pistas.

Objetivo:

ensinar:

- como marcar;
- como excluir;
- como usar hipótese;
- como confirmar.

IMPORTANTE:

Tutorial:

- não entra na análise;
- não entra na progressão clínica;
- não influencia o motor adaptativo;
- não gera interpretação de desempenho.

==================================================
7. ESTADOS DE CADA POSSIBILIDADE
==================================================

Quero quatro estados:

VAZIO

× IMPOSSÍVEL

? HIPÓTESE

✓ CONFIRMADO

Essa diferença é FUNDAMENTAL.

“?” significa:

“eu considero essa possibilidade.”

“✓” significa:

“eu concluí que isso é verdadeiro.”

Não quero tratar hipótese falsa da mesma forma que conclusão falsa.

==================================================
8. POR QUE EXISTE “HIPÓTESE”
==================================================

Quero conseguir distinguir:

A)

Paciente pensa:

“Talvez Ana esteja na posição 3.”

e marca:

?

Isso é exploração de hipótese.

B)

Paciente pensa:

“Ana está na posição 3.”

sem evidência suficiente

e marca:

✓

Isso é uma confirmação ainda não sustentada.

Esses comportamentos precisam ser registrados separadamente.

==================================================
9. INTERAÇÃO
==================================================

A interação precisa ser simples em:

- computador;
- tablet;
- celular.

Pode ser:

clique sucessivo

VAZIO → × → ? → ✓ → VAZIO

OU

um pequeno menu contextual.

Mas antes de fechar:

testar qual solução fica mais natural no mobile.

Não quero uma interface complicada apenas porque existem quatro estados.

==================================================
10. INTERFACE GERAL
==================================================

Quero visual:

- adulto;
- limpo;
- elegante;
- pouco gamificado;
- cognitivamente organizado.

Não quero:

- estrelas;
- moedas;
- medalhas;
- personagens infantis;
- excesso de cores;
- aparência escolar;
- aparência de planilha crua.

Estrutura conceitual:

DESAFIO X

[Título/contexto]

PISTAS

1.
2.
3.
4.
...

ÁREA DE RACIOCÍNIO / GRADE

Legenda:

× impossível
? hipótese
✓ confirmado

[VERIFICAR RACIOCÍNIO]

[CONCLUIR]

==================================================
11. DESKTOP
==================================================

Quando houver largura suficiente:

pistas e grade podem ficar lado a lado.

Exemplo:

┌───────────────┬─────────────────────────┐
│ PISTAS        │ GRADE                   │
│               │                         │
│ 1...          │                         │
│ 2...          │                         │
│ 3...          │                         │
└───────────────┴─────────────────────────┘

Não deixar conteúdo perdido num card minúsculo no meio de uma tela enorme.

A tela deve usar bem o espaço disponível.

==================================================
12. MOBILE
==================================================

No celular:

- conteúdo deve reorganizar verticalmente;
- pistas podem ser recolhíveis se necessário;
- grade precisa continuar legível;
- cabeçalhos precisam permanecer identificáveis;
- não obrigar zoom;
- não criar células minúsculas;
- área de toque adequada;
- scroll horizontal LOCAL da grade pode ser usado se realmente necessário.

==================================================
13. PISTAS PERMANECEM VISÍVEIS
==================================================

Não esconder as pistas para criar “dificuldade”.

O paciente deve poder consultá-las durante todo o problema.

Se houver painel recolhível no celular, isso é apenas questão de espaço.

Não deve haver obrigação de memorizá-las.

==================================================
14. NÃO CORRIGIR CADA ERRO IMEDIATAMENTE
==================================================

ESSENCIAL.

Quando o paciente cria uma conclusão inconsistente:

NÃO mostrar automaticamente:

“ERRADO.”

NÃO piscar vermelho.

NÃO revelar qual célula está errada.

NÃO corrigir pelo paciente.

Se o sistema denuncia imediatamente toda inconsistência, o monitoramento de erro passa a ser feito pelo software.

Quero dar ao paciente oportunidade para:

- continuar;
- perceber a contradição;
- revisar;
- autocorrigir.

==================================================
15. VERIFICAR RACIOCÍNIO
==================================================

Pode existir:

VERIFICAR RACIOCÍNIO

Esse botão não entrega a solução.

Nos níveis iniciais:

“Existe uma incompatibilidade no seu raciocínio. Revise suas conclusões.”

Eventualmente:

“Existe uma incompatibilidade relacionada às posições.”

Mas sem indicar a célula.

Níveis intermediários:

“Existe pelo menos uma incompatibilidade. Revise antes de continuar.”

Níveis avançados:

reduzir ajuda.

Podemos eventualmente retirar a verificação nos problemas mais avançados.

==================================================
16. REGISTRAR VERIFICAÇÕES
==================================================

Registrar:

- número de verificações;
- momento;
- tempo;
- estado lógico naquele momento;
- se existia contradição;
- se corrigiu depois;
- quantas ações demorou para corrigir.

==================================================
17. CONCLUIR
==================================================

Ao pressionar:

CONCLUIR

Se correto:

“Desafio concluído.”

[PRÓXIMO]

Se incorreto:

“Sua organização ainda contém incompatibilidades. Revise antes de concluir.”

NÃO revelar automaticamente a solução.

==================================================
18. TIPOS DE PISTAS
==================================================

Cada pista precisa existir como:

A) texto para o paciente;

B) regra computável pelo sistema.

Criar inicialmente:

T1 — ASSOCIAÇÃO DIRETA

“Ana está com a pasta azul.”

T2 — EXCLUSÃO

“Ana não está com a pasta azul.”

T3 — POSIÇÃO ABSOLUTA

“Bruno está na quarta posição.”

T4 — ORDEM RELATIVA

“Ana está em algum lugar à esquerda de Bruno.”

T5 — ADJACÊNCIA

“Ana está ao lado de Bruno.”

T6 — DIREÇÃO + ADJACÊNCIA

“Ana está exatamente à esquerda de Bruno.”

T7 — ENTRE

“Carla está em algum lugar entre Ana e Bruno, nessa ordem.”

T8 — ASSOCIAÇÃO CRUZADA

“A pessoa que bebe Café apresenta o projeto Robô.”

T9 — CONDICIONAL

“Se Carla estiver com a pasta Verde, então Bruno apresenta Ponte.”

T10 — ALTERNATIVA EXCLUSIVA

“Ou Ana está com a pasta Azul ou Bruno está com ela, mas não ambos.”

T11 — RELAÇÃO COMPOSTA

“O responsável pelo projeto Solar está em algum lugar à esquerda da pessoa que bebe Água.”

A arquitetura deve permitir adicionar novos operadores depois.

==================================================
19. CADA PISTA PRECISA TER METADADOS
==================================================

Exemplo conceitual:

{
  id,
  text,
  type,
  operands,
  constraint,
  skillTags,
  difficulty,
  restrictivePower
}

==================================================
20. PROFUNDIDADE INFERENCIAL
==================================================

Não medir dificuldade apenas pela quantidade de pistas.

Quero classificar a profundidade necessária para chegar a determinadas conclusões.

PROFUNDIDADE 1

uma única relação permite concluir.

PROFUNDIDADE 2

integração de duas relações.

PROFUNDIDADE 3

integração de três relações/restrições.

PROFUNDIDADE 4+

inferência mais extensa ou encadeada.

==================================================
21. EXEMPLO DE PROFUNDIDADE 2
==================================================

Pista:

“Ana está exatamente à esquerda de Bruno.”

Pista:

“Bruno está na posição 4.”

Conclusão:

“Ana está na posição 3.”

Isso exige duas relações.

==================================================
22. PROFUNDIDADE E MEMÓRIA OPERACIONAL
==================================================

Uma das formas mais interessantes de observar a demanda de integração será comparar o desempenho conforme aumenta a profundidade.

Exemplo de relatório:

1 relação: 96%

2 relações: 89%

3 relações: 68%

4+ relações: 49%

Descrição permitida:

“Observou-se queda de precisão nas situações que exigiam integração de maior número de relações.”

NÃO escrever automaticamente:

“déficit de memória operacional.”

==================================================
23. SOLVER
==================================================

Quero um motor central de restrições.

O problema pode ser modelado como:

CSP — Constraint Satisfaction Problem.

O solver deve conseguir:

1. verificar se um problema é válido;
2. encontrar soluções;
3. contar soluções;
4. provar que existe exatamente uma solução;
5. testar se uma configuração parcial do paciente ainda pode resultar em alguma solução;
6. identificar quando uma marcação torna o problema impossível;
7. identificar quais pistas/regras estão envolvidas na contradição.

==================================================
24. SOLUÇÃO ÚNICA É OBRIGATÓRIA
==================================================

Antes de qualquer problema entrar no banco:

solutions.length === 1

Se:

0 soluções

→ problema inconsistente.

Se:

2 ou mais

→ problema ambíguo.

Não liberar.

==================================================
25. ESTRUTURA DO PUZZLE
==================================================

Exemplo conceitual:

{
  id,
  title,
  context,
  level,
  positions,
  categories,
  clues,
  solution,
  metadata
}

categories:

[
  {
    id: "person",
    label: "Pessoa",
    values: [...]
  },
  {
    id: "project",
    label: "Projeto",
    values: [...]
  }
]

metadata:

{
  complexity,
  inferenceDepthDistribution,
  skillWeights,
  dominantOperations,
  clueTypeDistribution,
  expectedDifficulty,
  validatedUniqueSolution
}

==================================================
26. IDENTIFICAR ONDE O PACIENTE ERROU
==================================================

Quero que o sistema identifique a OPERAÇÃO LÓGICA envolvida no erro sempre que isso puder ser determinado de forma objetiva.

NÃO apenas:

“errou.”

==================================================
27. ERRO A — VIOLAÇÃO DIRETA
==================================================

Pista:

“Bruno não está com a pasta Verde.”

Paciente confirma:

Bruno = Verde.

Registrar:

direct_constraint_violation

Pista envolvida.

==================================================
28. ERRO B — INVERSÃO DE DIREÇÃO
==================================================

Pista:

“Ana está à esquerda de Carla.”

Paciente organiza de forma incompatível:

Carla antes de Ana.

Registrar:

direction_reversal

Não chamar isso de problema de atenção ou qualquer função clínica.

==================================================
29. ERRO C — ADJACÊNCIA
==================================================

Pista:

“Ana está exatamente ao lado de Bruno.”

Paciente coloca:

Ana = posição 1

Bruno = posição 4.

Registrar:

adjacency_violation

==================================================
30. ERRO D — POSIÇÃO RELATIVA
==================================================

Registrar separadamente dificuldades em:

- antes;
- depois;
- esquerda;
- direita;
- exatamente à esquerda;
- exatamente à direita;
- entre.

==================================================
31. ERRO E — EXCLUSIVIDADE
==================================================

Se cada valor só pode ocupar uma posição:

Paciente confirma:

Ana = Verde

Bruno = Verde.

Registrar:

one_to_one_violation

==================================================
32. ERRO F — INTEGRAÇÃO
==================================================

Essa é uma das partes mais importantes.

Uma conclusão pode não contradizer nenhuma pista isoladamente.

Mas pode ser impossível quando combinamos:

Pista 2
+
Pista 5
+
Pista 9.

Nesse caso registrar:

multi_constraint_integration_error

e:

quantas relações eram necessárias para demonstrar a incompatibilidade.

==================================================
33. CONJUNTO MÍNIMO DE CONTRADIÇÃO
==================================================

Se tecnicamente viável, quero identificar o menor conjunto de pistas que torna determinada conclusão impossível.

Pode utilizar:

Minimal Unsatisfiable Subset — MUS

ou abordagem equivalente.

Exemplo:

Conclusão incorreta:

Bruno = posição 2.

Pistas mínimas necessárias para provar que isso é impossível:

Pista 3
Pista 7
Pista 11.

Registrar:

conflictingClues: [3,7,11]

inferenceDepth: 3

Se MUS completo for desproporcional para a primeira versão:

implementar inicialmente:

- detecção segura de inconsistência;
- conjunto de pistas relevantes;

e deixar minimização exata para uma segunda etapa.

Não inventar relações.

==================================================
34. CONFIRMAÇÃO PREMATURA
==================================================

Quero identificar quando o paciente marca:

✓ CONFIRMADO

em uma relação que ainda não está logicamente determinada.

Isto é:

naquele estado do problema ainda existem múltiplas soluções possíveis em que aquela relação varia.

Registrar:

premature_confirmation

IMPORTANTE:

não significa automaticamente “falha de inibição”.

É apenas comportamento observável.

==================================================
35. HIPÓTESE NÃO É ERRO
==================================================

Se o paciente marca:

? HIPÓTESE

e depois percebe que é falsa:

isso NÃO deve ser contado como erro equivalente a uma confirmação falsa.

Pode registrar:

hypothesis_tested
hypothesis_rejected

Isso faz parte da resolução de problemas.

==================================================
36. MONITORAMENTO DE ERROS
==================================================

Quando uma ação cria uma contradição:

registrar imediatamente nos bastidores.

Mas não alertar automaticamente o paciente.

Exemplo:

contradição surgiu:

ação 18

paciente continuou:

19
20
21
22
23

corrigiu:

ação 24

Registrar:

contradictionCreatedAt = 18

contradictionResolvedAt = 24

actionsUntilCorrection = 6

==================================================
37. TEMPO ATÉ AUTOCORREÇÃO
==================================================

Registrar também:

contradição:

02:13

correção:

02:29

tempo até autocorreção:

16 segundos.

==================================================
38. AUTOCORREÇÃO
==================================================

Diferenciar:

A)

paciente percebeu e corrigiu sozinho.

B)

paciente pediu VERIFICAR RACIOCÍNIO e depois corrigiu.

C)

paciente tentou concluir e só então soube que havia incompatibilidade.

Essas situações devem ser registradas separadamente.

==================================================
39. REINTRODUÇÃO DE HIPÓTESE INCOMPATÍVEL
==================================================

Exemplo:

Paciente confirma:

Ana = posição 2.

Depois corrige.

Mais tarde volta novamente para:

Ana = posição 2.

Registrar:

repeated_invalid_hypothesis

Isso pode ser interessante para observar perseveração de estratégia.

Não transformar automaticamente em diagnóstico de baixa flexibilidade.

==================================================
40. FLEXIBILIDADE COGNITIVA
==================================================

Não criar agora um número arbitrário como:

“Flexibilidade = 72%”.

Quero registrar indicadores comportamentais.

Exemplos:

- revisão de hipótese;
- abandono de hipótese incompatível;
- reintrodução da mesma hipótese;
- mudança de linha de raciocínio;
- mudança entre categorias;
- adaptação quando a estrutura lógica do problema muda;
- desempenho após treino focalizado;
- transferência para problema misto.

==================================================
41. CONTROLE INIBITÓRIO
==================================================

Não escrever:

“controle inibitório prejudicado.”

Registrar indicadores como:

- confirmações prematuras;
- proporção de confirmações posteriormente revertidas;
- tempo até primeiras confirmações;
- número de confirmações antes de realizar eliminações;
- recorrência dessas confirmações.

Exemplo de relatório:

“Realizou 8 confirmações definitivas posteriormente revistas.”

Isso é dado.

==================================================
42. PLANEJAMENTO
==================================================

Registrar:

- latência até primeira ação;
- primeira pista/categoria explorada;
- sequência inicial de ações;
- quantidade de marcações dispersas;
- quantidade de confirmações precoces;
- uso de pistas com maior poder restritivo.

Não assumir:

“demorou mais = planejou melhor.”

==================================================
43. PODER RESTRITIVO DAS PISTAS
==================================================

Se possível, calcular:

quantas soluções possíveis cada pista elimina no estado inicial.

Isso permite classificar pistas como:

- muito informativas;
- moderadamente informativas;
- pouco informativas.

Pode ser útil para observar por onde o paciente começa.

Não mostrar ao paciente.

==================================================
44. REGISTRO DE CADA AÇÃO
==================================================

Quero conseguir reconstruir o caminho do raciocínio.

Cada ação relevante deve gerar registro.

Estrutura conceitual:

{
  sessionId,
  puzzleId,
  actionIndex,
  timestamp,

  elapsedFromStart,
  elapsedFromPreviousAction,

  category,
  value,
  position,

  previousState,
  newState,

  logicalStatusAtTime,

  contradictionCreated,
  contradictionResolved,

  conflictingClues,
  inferenceDepth,

  wasHypothesis,
  wasConfirmation,

  laterReverted,
  selfCorrected,

  verificationUsed
}

Os nomes podem mudar.

A informação não.

==================================================
45. OPERAÇÕES OBSERVÁVEIS
==================================================

Separar “função cognitiva” de “evento lógico”.

Tags lógicas:

direct_association
exclusion
absolute_position
relative_order
adjacency
directed_adjacency
between
cross_category
conditional
exclusive_or
multi_constraint_integration

Tags comportamentais:

premature_confirmation
contradiction_creation
self_correction
contradiction_persistence
repeated_invalid_hypothesis
verification_request
hypothesis_revision
strategy_shift

==================================================
46. MOTOR ADAPTATIVO
==================================================

ESTA PARTE É CENTRAL.

Como é um TREINO, quero que o sistema possa usar o padrão de desempenho para escolher o próximo problema.

Mas a adaptação deve ser TOTALMENTE INVISÍVEL para o paciente.

==================================================
47. O PACIENTE NÃO DEVE VER
==================================================

Não mostrar:

“Você apresentou dificuldade em ordem relativa.”

“Agora vamos treinar sua memória operacional.”

“Você errou esquerda/direita.”

“Você precisa treinar flexibilidade.”

Para ele:

DESAFIO 1
↓
DESAFIO CONCLUÍDO
↓
PRÓXIMO
↓
DESAFIO 2

O algoritmo escolhe nos bastidores.

==================================================
48. NÃO ADAPTAR POR ERRO ISOLADO
==================================================

Um único erro não basta.

Pode ter sido:

- distração;
- clique errado;
- leitura rápida;
- acaso.

Regra inicial configurável:

considerar padrão específico quando ocorrer pelo menos UMA destas situações:

A)

2 ou mais erros do mesmo tipo dentro de um problema;

OU

B)

desempenho claramente inferior naquele domínio com pelo menos 3 oportunidades;

OU

C)

o mesmo padrão aparece em dois problemas consecutivos;

OU

D)

há reintrodução da mesma hipótese incompatível.

Os thresholds devem ser parâmetros do programa.

Não normas clínicas.

==================================================
49. DIFICULDADE ESPECÍFICA VS SOBRECARGA GLOBAL
==================================================

ESSENCIAL.

Se o paciente vai bem em:

- exclusão;
- associação;
- adjacência;

mas erra repetidamente:

- esquerda/direita;
- antes/depois;
- entre;

isso sugere um padrão específico de desempenho.

Nesse caso:

próximo problema pode focalizar aquela operação.

==================================================
50. SOBRECARGA GLOBAL
==================================================

Se ao mesmo tempo aparecem:

- erros de vários tipos;
- tempo muito elevado;
- muitas reversões;
- muitas verificações;
- dificuldade de concluir;
- várias contradições diferentes;

não selecionar automaticamente uma “fraqueza”.

Provavelmente a complexidade geral da tarefa ficou excessiva.

Nesse caso:

reduzir CARGA GLOBAL.

==================================================
51. REDUZIR CARGA NÃO É INFANTILIZAR
==================================================

Não voltar para:

“Bruno = Verde.”

Podemos reduzir:

5 posições → 4.

5 categorias → 4.

profundidade 4 → 2–3.

Mas manter problema lógico verdadeiro.

==================================================
52. CICLO ADAPTATIVO
==================================================

Quero esta lógica:

PROBLEMA MISTO
↓
ANALISAR DESEMPENHO
↓

SE NÃO HÁ PADRÃO ESPECÍFICO
→ seguir progressão normal.

SE HÁ PADRÃO ESPECÍFICO
→ selecionar problema FOCALIZADO.

SE HÁ SOBRECARGA GLOBAL
→ reduzir carga geral.

Depois de problema focalizado:

PROBLEMA MISTO DE TRANSFERÊNCIA.

==================================================
53. VISUALMENTE
==================================================

O fluxo interno é:

            PROBLEMA MISTO
                   ↓
           ANALISAR PADRÃO
                   ↓
       ┌───────────┼────────────┐
       │           │            │
       ▼           ▼            ▼
   SEM PADRÃO   ESPECÍFICO   SOBRECARGA
       │           │            │
       ▼           ▼            ▼
  PROGRESSÃO    FOCALIZADO   REDUZ CARGA
                   │
                   ▼
               TREINO
                   │
                   ▼
            PROBLEMA MISTO
            DE TRANSFERÊNCIA
                   │
            ┌──────┴──────┐
            │             │
           SIM           NÃO
        MELHOROU      NÃO MELHOROU
            │             │
            ▼             ▼
         PROGREDIR     MAIS UM
                       FOCALIZADO
                       AJUSTADO

==================================================
54. PROBLEMA FOCALIZADO
==================================================

Focalizado NÃO significa tarefa simples.

Exemplo:

Paciente teve dificuldade em:

relative_order.

O próximo problema continua sendo um puzzle completo.

Mas aumenta a proporção de pistas:

- esquerda/direita;
- antes/depois;
- exatamente à esquerda;
- exatamente à direita;
- entre.

E pode reduzir outra carga.

Exemplo:

problema anterior:

5 posições
5 categorias
15 pistas

problema focalizado:

4 posições
4 categorias
9 pistas

5 ou 6 pistas fortemente relacionadas ao alvo.

==================================================
55. TREINO DE INTEGRAÇÃO
==================================================

Se o principal padrão foi:

multi_constraint_integration

o próximo problema pode ter:

menos categorias,

mas maior proporção de conclusões que exigem:

2 → 3 relações.

Depois testar novamente num problema misto.

==================================================
56. TREINO DE TOLERÂNCIA À INCERTEZA / CONFIRMAÇÃO PREMATURA
==================================================

Se houver muitas confirmações prematuras:

o próximo problema pode ser construído para ter:

- várias possibilidades inicialmente plausíveis;
- poucas respostas imediatamente determinadas;
- necessidade de manter hipóteses abertas.

Ou seja:

o paciente precisa usar:

?

antes de:

✓

Não dizer a ele que estamos “treinando inibição”.

==================================================
57. TREINO DE MONITORAMENTO
==================================================

Se há muita persistência após contradição:

o problema seguinte pode continuar permitindo contradições detectáveis pelo próprio paciente.

Sem feedback imediato.

Observar:

- tempo até autocorreção;
- ações até autocorreção.

==================================================
58. TREINO DE FLEXIBILIDADE
==================================================

Para flexibilidade, não basta mudar nomes.

Não adianta:

Problema 1 = cachorros.

Problema 2 = carros.

se ambos usam exatamente a mesma estrutura lógica.

Quero variar a ARQUITETURA das relações.

Exemplo:

Problema A:

predominância de ordem espacial.

Problema B:

predominância de exclusões e condicionais.

Problema C:

integração cruzada entre categorias.

Isso força adaptação de estratégia.

==================================================
59. TRANSFERÊNCIA
==================================================

Depois de um treino focalizado:

sempre que possível apresentar um problema MISTO no qual a operação-alvo reaparece junto com outras.

Quero saber se o paciente:

melhora apenas no treino focalizado

OU

consegue usar a habilidade quando ela volta dentro de um problema mais complexo.

==================================================
60. NÃO FOCALIZAR INDEFINIDAMENTE
==================================================

Não quero:

errou ordem relativa
↓
10 problemas seguidos de ordem relativa.

Regra inicial:

máximo de 1 ou 2 problemas focalizados consecutivos.

Depois:

problema misto / transferência.

==================================================
61. VETOR DE HABILIDADES DO PUZZLE
==================================================

Cada puzzle deve ter algo semelhante a:

{
  exclusion: 1,
  relativeOrder: 3,
  adjacency: 2,
  crossCategory: 1,
  integrationDepth: 2,
  uncertaintyTolerance: 1
}

Escala pode ser:

0–3

ou equivalente.

Além disso:

{
  positions,
  categories,
  clues,
  maxInferenceDepth,
  overallComplexity
}

==================================================
62. PROGRESSÃO DE DIFICULDADE
==================================================

TUTORIAL

3 posições
3 categorias
3–5 pistas

muito simples.

Não entra na análise.

--------------------------------------------------

NÍVEL 1

4 posições
3 categorias
6–8 pistas

profundidade predominante:

1–2.

--------------------------------------------------

NÍVEL 2

4 posições
4 categorias
8–10 pistas

inclui:

- exclusão;
- ordem;
- adjacência;
- associação cruzada.

profundidade:

até 2–3.

--------------------------------------------------

NÍVEL 3

4 posições
5 categorias
10–13 pistas

mais integração.

Poucas conclusões diretas.

--------------------------------------------------

NÍVEL 4

5 posições
5 categorias
13–17 pistas.

Pode incluir:

- entre;
- condicionais;
- relações compostas;
- integração 3+.

--------------------------------------------------

NÍVEL 5

5 posições
5–6 categorias
16–22 pistas.

Profundidade:

3–4+.

Problemas realmente avançados.

==================================================
63. DIFICULDADE NÃO É TAMANHO
==================================================

Não assumir:

5×5 > 4×4.

Um problema 4×4 pode ser cognitivamente mais difícil se tiver:

- mais ambiguidades iniciais;
- relações mais profundas;
- maior branching;
- mais integração.

A dificuldade deve considerar a estrutura lógica.

==================================================
64. TEMAS
==================================================

Criar temas adultos e variados.

Exemplos:

FEIRA DE CIÊNCIAS

Pessoa
Projeto
Pasta
Bebida

VIAGEM

Viajante
Destino
Transporte
Horário

RESTAURANTE

Cliente
Prato
Bebida
Mesa

CINEMA

Pessoa
Filme
Horário
Poltrona

BIBLIOTECA

Leitor
Livro
Gênero
Horário

CORRIDA

Atleta
Equipe
Posição
Camiseta

HOTEL

Hóspede
Quarto
Andar
Horário

CONGRESSO

Participante
Palestra
Sala
Horário

MUSEU

Visitante
Exposição
Guia
Horário

==================================================
65. BANCO DE PROBLEMAS
==================================================

NÃO gerar problemas aleatórios diretamente para o paciente sem validação.

Quero banco previamente validado.

Cada problema precisa ter:

- solução única;
- dificuldade;
- tipos de pistas;
- distribuição de profundidade;
- vetor de habilidades;
- contexto;
- solução;
- metadata.

==================================================
66. BANCO INICIAL
==================================================

Na primeira implementação:

não quero 100 problemas ruins.

Prefiro:

12 a 20 problemas muito bem construídos e matematicamente validados.

Distribuir entre:

- níveis;
- estruturas;
- operações;
- temas.

Depois ampliamos.

==================================================
67. GERADOR DE DESENVOLVIMENTO
==================================================

Se fizer sentido:

construir um gerador apenas para desenvolvimento.

Fluxo:

GERAR SOLUÇÃO
↓
GERAR RESTRIÇÕES
↓
SOLVER
↓
VALIDAR SOLUÇÃO ÚNICA
↓
IDENTIFICAR PISTAS REDUNDANTES
↓
REMOVER REDUNDÂNCIA EXCESSIVA
↓
ESTIMAR DIFICULDADE
↓
ATRIBUIR METADADOS
↓
ADICIONAR AO BANCO

Nunca confiar em IA generativa em tempo real para garantir solução lógica.

==================================================
68. PISTAS REDUNDANTES
==================================================

Alguma redundância pode existir por equilíbrio de dificuldade.

Mas não quero 20 pistas das quais 8 são completamente desnecessárias.

Se possível:

calcular quais pistas são necessárias para unicidade.

Classificar:

- essencial;
- útil;
- redundante.

==================================================
69. PROGRESSO
==================================================

Não usar progresso baseado em:

“quantidade de células preenchidas”.

Isso incentiva:

“encher a grade”.

Se houver indicador:

usar:

Desafio 2 de 5

ou o progresso global da sessão.

Não mostrar:

42% resolvido.

==================================================
70. FEEDBACK
==================================================

Feedback durante a tarefa:

mínimo.

Não mostrar:

número de erros.

Não mostrar:

pontuação.

Não mostrar:

eficiência.

Não ficar elogiando cada clique.

O raciocínio deve ser protagonista.

==================================================
71. AJUDA
==================================================

Na primeira implementação:

pode ficar SEM botão de dica.

Se futuramente existir ajuda:

ela deve ser metacognitiva.

Exemplos:

“Procure uma pista que elimine várias possibilidades.”

“Revise suas relações de posição.”

“Verifique se alguma confirmação depende apenas de uma hipótese.”

Nunca:

“Ana está na posição 3.”

Registrar toda ajuda utilizada.

==================================================
72. RELATÓRIO DO PROFISSIONAL
==================================================

Não quero somente:

ACERTO = 82%.

Quero relatório de PROCESSO.

Exemplo:

GRADE DEDUTIVA

Problemas realizados: 5

Concluídos: 5

Tempo médio: 4min12s

==================================================
73. PRECISÃO POR OPERAÇÃO
==================================================

Exemplo:

Exclusão: 91%

Ordem relativa: 63%

Adjacência: 78%

Associação cruzada: 86%

Integração de múltiplas relações: 59%

==================================================
74. PROFUNDIDADE INFERENCIAL
==================================================

1 relação: 96%

2 relações: 88%

3 relações: 67%

4+ relações: 51%

==================================================
75. MONITORAMENTO
==================================================

Contradições produzidas: 9

Autocorrigidas sem ajuda: 6

Autocorreção espontânea: 67%

Tempo mediano até autocorreção: 14s

Persistência média após contradição: 3,2 ações

Correções após verificação: 2

Contradições não corrigidas espontaneamente: 1

==================================================
76. ESTRATÉGIA
==================================================

Hipóteses criadas: 11

Hipóteses rejeitadas: X

Confirmações posteriormente revertidas: 5

Reintroduções de hipótese incompatível: 2

Verificações solicitadas: 3

==================================================
77. ADAPTAÇÃO
==================================================

Exemplo:

Maior dificuldade inicial:

ordem relativa.

Treino focalizado:

realizado.

Desempenho no treino focalizado:

X.

Desempenho posterior no problema misto:

Y.

==================================================
78. EXEMPLO DE TEXTO ADEQUADO
==================================================

“Apresentou inicialmente maior frequência de erros nas relações de ordem relativa. Após um desafio com maior concentração desse tipo de relação, houve melhora no desempenho. No problema misto subsequente, parte desse ganho foi mantida.”

Isso é aceitável.

==================================================
79. NÃO ESCREVER
==================================================

Não escrever automaticamente:

“Baixa flexibilidade cognitiva.”

“Déficit de memória operacional.”

“Controle inibitório prejudicado.”

“Paciente impulsivo.”

“Déficit executivo.”

“Indica TDAH.”

“Indica transtorno.”

O jogo é TREINO e fornece indicadores comportamentais.

==================================================
80. EXPERIÊNCIA DO PACIENTE
==================================================

Para o paciente:

DESAFIO
↓
RESOLVE
↓
DESAFIO CONCLUÍDO
↓
PRÓXIMO

Ele não precisa saber:

- qual habilidade o algoritmo está enfatizando;
- que houve adaptação;
- que determinado problema foi focalizado;
- qual padrão foi identificado.

==================================================
81. ESTRUTURA DE UMA SESSÃO
==================================================

Não quero número fixo se a plataforma já controla duração.

Dentro da sessão:

tentar organizar:

1. problema misto;
2. análise invisível;
3. focalizado se necessário;
4. problema misto de transferência;
5. novo ajuste;
6. problema misto final quando houver tempo.

==================================================
82. EXEMPLO DE ADAPTAÇÃO
==================================================

DESAFIO 1

problema misto.

Resultado:

exclusão = bom.

adjacência = bom.

ordem relativa = baixo.

3 erros esquerda/direita.

↓

Sistema identifica padrão.

↓

DESAFIO 2

novo contexto.

Mais relações:

- esquerda;
- direita;
- antes;
- depois;
- entre.

Menor carga de outras operações.

↓

DESAFIO 3

problema misto.

Ordem relativa volta a aparecer entre:

- exclusões;
- associações;
- integração.

↓

Sistema verifica transferência.

==================================================
83. EXEMPLO DE SOBRECARGA
==================================================

Paciente apresenta simultaneamente:

ordem ruim.

exclusão ruim.

adjacência ruim.

muitas confirmações revertidas.

tempo muito elevado.

muitas verificações.

↓

NÃO decidir:

“fraqueza = ordem.”

↓

Reduzir:

5 posições → 4

ou:

5 categorias → 4

ou:

profundidade máxima 4 → 2–3.

==================================================
84. EXEMPLO DE PROBLEMA
==================================================

Use apenas como referência estrutural.

Tema:

FEIRA DE CIÊNCIAS.

Quatro estudantes estão lado a lado apresentando projetos diferentes. Cada um possui uma pasta de cor diferente e uma bebida.

PESSOAS

Ana
Bruno
Carla
Diego

PROJETOS

Solar
Ponte
Robô
Vulcão

PASTAS

Verde
Vermelha
Amarela
Azul

BEBIDAS

Café
Água
Chá
Suco

Exemplos de pistas:

1. Ana está exatamente à esquerda de Carla.

2. A pessoa que bebe Água está exatamente à esquerda de quem apresenta Robô.

3. Bruno está em algum lugar à direita da pessoa com a pasta Amarela.

4. Diego não está com as pastas Vermelha nem Azul.

5. O projeto Ponte está exatamente à direita do projeto Solar.

6. Ana não apresenta Solar nem Vulcão.

7. O Café está em algum lugar à esquerda da Água.

8. O Suco está exatamente à direita do Chá.

IMPORTANTE:

NÃO assumir que esse conjunto possui automaticamente solução única.

Passar pelo solver.

Apenas usar se validado.

==================================================
85. ABANDONO
==================================================

Quero distinguir:

problema nunca iniciado

de:

problema iniciado e abandonado.

Se o sistema atual só grava ao concluir, precisamos mudar.

Mas:

se isso exigir Supabase:

PARAR.

Mostrar migration.

Fazer backup.

Executar separadamente.

==================================================
86. MÉTRICAS POR PROBLEMA
==================================================

Registrar:

- iniciado;
- concluído;
- abandonado;
- tempo;
- latência até primeira ação;
- total de ações;
- exclusões;
- hipóteses;
- confirmações;
- reversões;
- contradições;
- autocorreções;
- verificações;
- tentativas de concluir incorretas;
- desempenho por operação;
- desempenho por profundidade;
- sequência de categorias manipuladas.

==================================================
87. NÃO SUPERINTERPRETAR O TEMPO
==================================================

Tempo é dado auxiliar.

Não concluir:

rápido = melhor.

lento = pior.

Uma latência maior antes da primeira ação pode representar planejamento.

Ou dificuldade.

Interpretar apenas junto ao restante do processo.

==================================================
88. NÃO SUPERINTERPRETAR REVISÃO
==================================================

Revisar uma hipótese não é necessariamente ruim.

Pode representar:

monitoramento.

flexibilidade.

teste de estratégia.

Por isso diferenciar:

hipótese revisada

de:

confirmação precipitada repetidamente revertida.

==================================================
89. MUDANÇA ESTRATÉGICA
==================================================

Se possível registrar:

- categorias manipuladas ao longo do tempo;
- mudança de foco;
- retornos;
- sequência de exploração.

Exemplo:

paciente tentou resolver principalmente por cores.

Depois mudou para posição + horário.

Não criar escore automático agora.

Só guardar o processo.

==================================================
90. DESIGN DA GRADE
==================================================

A grade não pode ficar:

- apertada;
- extremamente pequena;
- parecendo Excel;
- com dezenas de selects visíveis simultaneamente como no modelo antigo.

Quero testar uma solução visual mais moderna.

Por exemplo:

cada posição pode funcionar como uma coluna.

Exemplo:

POS. 1 | POS. 2 | POS. 3 | POS. 4

Pessoa
Projeto
Bebida
Cor

Com apoio de marcações:

×
?
✓

Se uma matriz dedutiva auxiliar for necessária, ela pode existir.

Mas não quero um mar de dropdowns.

==================================================
91. GRADE PRINCIPAL VS ÁREA AUXILIAR
==================================================

Avaliar se é melhor separar:

A)

área de dedução/possibilidades;

B)

solução final.

O paciente pode usar a grade para:

- eliminar;
- criar hipótese;
- confirmar.

Quando uma categoria estiver determinada:

a solução final se organiza automaticamente.

Ou pode manter tudo na mesma estrutura se for mais simples.

Antes de fechar o UX:

me mostrar propostas.

==================================================
92. NÃO MUDAR FUNCIONALIDADE SEM MOSTRAR
==================================================

Como a interface será reconstruída:

antes de escolher uma estrutura definitiva:

me mostrar pelo menos:

- proposta desktop;
- proposta mobile.

Não quero chegar ao final e descobrir que a lógica ficou boa mas a grade está impraticável.

==================================================
93. FUNDO / VISUAL
==================================================

O fundo deve ser discreto.

Pode usar:

- geométrico minimalista;
- azul-neblina;
- papel técnico contemporâneo.

Mas:

o conteúdo da lógica precisa continuar protagonista.

Não colocar decoração atravessando a grade.

==================================================
94. ORDEM DE IMPLEMENTAÇÃO
==================================================

FASE 1 — AUDITORIA

- ler exercício atual;
- mapear código;
- mapear banco;
- mapear relatório;
- mapear progressão;
- identificar reaproveitamento;
- NÃO alterar ainda.

--------------------------------------------------

FASE 2 — MODELO LÓGICO

- estrutura do puzzle;
- categorias;
- restrições;
- tipos de pista;
- solver;
- solução única;
- testes unitários.

--------------------------------------------------

FASE 3 — PROTÓTIPO DE INTERFACE

- desktop;
- mobile;
- vazio / × / ? / ✓;
- pistas;
- conclusão;
- verificar raciocínio.

Me mostrar antes de avançar.

--------------------------------------------------

FASE 4 — INSTRUMENTAÇÃO

- ações;
- contradições;
- autocorreção;
- reversões;
- confirmação prematura;
- profundidade;
- tipo de erro.

Se precisar Supabase:

PARAR.

--------------------------------------------------

FASE 5 — BANCO INICIAL

Criar aproximadamente:

12–20 problemas.

Todos:

- validados;
- solução única;
- metadata completa.

--------------------------------------------------

FASE 6 — MOTOR ADAPTATIVO

- detectar padrão;
- evitar adaptação por erro isolado;
- separar padrão específico de sobrecarga;
- selecionar focalizado;
- selecionar transferência.

--------------------------------------------------

FASE 7 — RELATÓRIO

- operação lógica;
- profundidade;
- monitoramento;
- estratégia;
- adaptação;
- transferência.

==================================================
95. TESTES OBRIGATÓRIOS DO SOLVER
==================================================

Testar:

1. problema com 0 soluções → rejeitado.

2. problema com 2+ soluções → rejeitado.

3. solução única → aceita.

4. associação direta.

5. exclusão.

6. posição absoluta.

7. ordem relativa.

8. esquerda/direita.

9. adjacência.

10. adjacência nas pontas.

11. exatamente à esquerda/direita.

12. entre.

13. entre com ordem.

14. associação cruzada.

15. condicional.

16. alternativa exclusiva.

17. exclusividade 1:1.

==================================================
96. TESTES DE PROCESSO
==================================================

18. hipótese falsa não vira erro equivalente a confirmação falsa.

19. confirmação impossível gera evento de inconsistência.

20. contradição não aparece automaticamente ao paciente.

21. autocorreção espontânea é registrada.

22. correção após VERIFICAR é diferente de autocorreção.

23. ações após contradição são contadas.

24. tempo até correção é registrado.

25. reintrodução de hipótese incompatível é registrada.

26. conclusão incorreta não entrega solução.

27. conclusão correta encerra.

==================================================
97. TESTES DO MOTOR ADAPTATIVO
==================================================

28. um único erro isolado NÃO dispara focalização.

29. padrão repetido pode disparar focalização.

30. dificuldade de ordem seleciona problema com maior peso em ordem.

31. dificuldade de integração seleciona problema com maior demanda de integração.

32. sobrecarga global NÃO focaliza uma habilidade isolada.

33. sobrecarga reduz carga geral.

34. após focalizado, selecionar transferência.

35. máximo de dois focalizados consecutivos.

36. sem padrão específico → progressão normal.

==================================================
98. TESTES DE INTERFACE
==================================================

37. desktop utilizável.

38. mobile utilizável.

39. pistas legíveis.

40. grade não exige zoom.

41. estados × / ? / ✓ distinguíveis.

42. controles possuem área de toque adequada.

43. não existe feedback imediato entregando erro.

44. progresso não depende de células preenchidas.

==================================================
99. PRINCÍPIO MAIS IMPORTANTE DA ADAPTAÇÃO
==================================================

NÃO quero:

ERROU
↓
DAR ALGO MAIS FÁCIL.

Quero:

QUAL FOI O PADRÃO?

↓

SE ESPECÍFICO:

treinar aquela operação.

SE GLOBAL:

reduzir carga.

SE DOMINOU:

aumentar complexidade.

DEPOIS DE FOCALIZAR:

testar transferência.

==================================================
100. PRINCÍPIO MAIS IMPORTANTE DO EXERCÍCIO
==================================================

O paciente não deve apenas encontrar respostas.

Quero que o sistema consiga observar:

COMO ELE CHEGOU À RESPOSTA.

==================================================
101. ARQUITETURA COGNITIVA FINAL
==================================================

ANALISAR
↓
PLANEJAR
↓
SELECIONAR INFORMAÇÕES
↓
ELIMINAR POSSIBILIDADES
↓
INTEGRAR RELAÇÕES
↓
FORMULAR HIPÓTESES
↓
TESTAR CONSEQUÊNCIAS
↓
MONITORAR
↓
IDENTIFICAR CONTRADIÇÕES
↓
REVISAR
↓
FLEXIBILIZAR
↓
REPLANEJAR
↓
RESOLVER
↓
TRANSFERIR PARA UM PROBLEMA NOVO

==================================================
102. RESULTADO FINAL QUE EU QUERO
==================================================

O exercício deve deixar de ser:

“Leia uma pista e marque a resposta.”

E passar a ser:

“Analise um sistema de relações, elimine possibilidades, formule hipóteses, integre pistas, monitore inconsistências e construa uma solução lógica.”

Ao mesmo tempo, quero que o sistema consiga diferenciar padrões como:

- erro direto;
- inversão de direção;
- falha de adjacência;
- dificuldade de integração;
- confirmação prematura;
- persistência após contradição;
- autocorreção;
- correção após ajuda;
- repetição de hipótese incompatível;
- melhora após treino focalizado;
- transferência para contexto misto.

==================================================
103. O QUE VOCÊ DEVE FAZER AGORA
==================================================

NÃO comece reescrevendo o exercício imediatamente.

Primeiro faça uma AUDITORIA da Grade Dedutiva atual.

Me responda:

1. como ela está modelada hoje;
2. quais arquivos participam;
3. como os problemas são armazenados;
4. como a solução é validada;
5. como dificuldade/progressão funciona;
6. quais dados são salvos;
7. como o relatório funciona;
8. o que pode ser reaproveitado;
9. o que precisa ser substituído;
10. se alguma parte exige alteração no Supabase;
11. qual arquitetura você recomenda para o solver;
12. qual arquitetura recomenda para registrar o caminho do raciocínio;
13. como encaixaria o motor adaptativo sem quebrar a progressão global da plataforma.

Depois me apresente um plano técnico em etapas.

Só após essa revisão começamos a implementação.
