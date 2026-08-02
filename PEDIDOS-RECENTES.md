# As 3 ultimas especificacoes dela (automatico; a mais nova por ultimo)
# Na retomada: ler as 3, conectar com PROGRESSO.md e git, declarar e seguir.

## 02/08/2026 08:49
Estamos no caminho certo. Continue exclusivamente a Fase 1.
Não implemente ainda nenhuma parte visual da Fase 2 e nem a adaptação da Fase 3.
Quero primeiro estabilizar completamente o motor do exercício.
Continue a F1.3 seguindo estas diretrizes:
Conclua todos os geradores de questões utilizando exclusivamente os dados oficiais do catálogo, nunca informações sorteadas ou texto extraído das imagens.
Implemente os seguintes geradores:
Localização direta
Comparação
Duas condições
Três condições
Validade
Conservação
Ingredientes
Alergênicos
Situação do cotidiano (quando os dados do catálogo permitirem)
Importante
Não quero que exista um sistema de pontuação ou pesos fixos de tipos de pergunta.
Este é um treino cognitivo clínico, não um jogo.
O objetivo é treinar funções cognitivas como:
atenção seletiva;
atenção sustentada;
leitura funcional;
velocidade de processamento;
memória de trabalho;
controle inibitório.
A dificuldade deve aumentar apenas pela complexidade cognitiva da tarefa, nunca por um sistema de pontuação.
Exemplo:
Nível inicial:
localizar uma informação.
Nível intermediário:
comparar informações.
Nível avançado:
integrar duas ou três condições simultaneamente.
A função cognitiva treinada permanece a mesma; apenas aumenta a carga cognitiva.
Organização dos geradores
Quero que os geradores sejam independentes da dificuldade.
Cada gerador deve apenas saber construir corretamente uma questão.
A dificuldade será controlada depois por parâmetros como:
quantidade de produtos;
quantidade de campos visíveis;
número de condições;
semelhança entre distratores;
proximidade dos valores;
necessidade de integrar informações.
Não quero um gerador diferente para cada nível.
Quero um único gerador parametrizado.
Validação obrigatória
Antes de qualquer questão ser exibida, validar obrigatoriamente:
os produtos pertencem à categoria correta;
todos os atributos vêm do catálogo;
as unidades são compatíveis;
existe exatamente uma resposta correta;
os distratores são plausíveis;
não há atributos incompatíveis;
a pergunta não foi utilizada recentemente;
a situação do cotidiano corresponde aos produtos apresentados.
Se qualquer validação falhar:
descartar a questão;
gerar outra automaticamente.
Testes
Depois de concluir os geradores, execute pelo menos:
500 sessões simuladas por nível;
milhares de questões geradas automaticamente;
validar que nunca ocorram situações como:
chá com lactose;
lasanha sabor chocolate;
leite em gramas;
azeite em gramas;
duas respostas corretas;
nenhuma resposta correta;
produtos incompatíveis;
repetição excessiva da mesma pergunta.
Antes de iniciar a Fase 2
Quando a F1.3 estiver concluída, me entregue:
arquitetura final do gerador;
tipos de questões implementados;
regras de validação;
cobertura dos testes;
exemplos reais de questões geradas automaticamente;
confirmação de que todo o exercício já utiliza o novo gerador, e não mais o sistema antigo.
Somente depois dessa validação iniciaremos a Fase 2.

## 02/08/2026 09:52
dei uma olhada agora e parece que está ok, não testei ela inteira, mas pare ok! podemos ir para fase 2

## 02/08/2026 14:04
PARE antes de qualquer coisa. O repositório mudou por fora desta sessão, em outra
sessão do Claude Code, enquanto você estava parada. Seu contexto está desatualizado.

PRIMEIRO, sem alterar nada, rode e me mostre:

  git status --porcelain
  git log --oneline -6
  git stash list

Se `git status` mostrar arquivos modificados, NÃO faça pull nem commit ainda — me
mostre o que é primeiro. Pode ser trabalho seu que se perde ou conflita.

SEGUNDO, sincronize:

  git pull --ff-only origin main

Se recusar (não for fast-forward), PARE e me avise em vez de forçar.

O QUE MUDOU (5 commits, de fc08b2d até 4e1b3b4, tudo já em produção):

  e37ddef  v2.65.2  fix: progressão do Focus Agentes entre sessões
  d4734b1  v2.65.3  fix: teto de difficulty vai a 13 no banco e no schema
  a473852  docs: registra a estreia do ciclo Codex
  bd70748  docs: poda das listas de dívida técnica
  4e1b3b4  docs: próximo passo do Focus (CORR-021, ARQ-010)

TRÊS COISAS QUE MUDAM COMO VOCÊ TRABALHA A PARTIR DE AGORA:

1. O BANCO DE PRODUÇÃO FOI ALTERADO. A CHECK `session_difficulty_range` foi ampliada
   de 1-10 para 1-13. O `sessionSchema` em `app/api/sessions/route.ts:18` acompanhou
   (`max(13)`). Esses dois valores TÊM que casar — mexer num sem o outro cria defeito
   silencioso: o código passa nos testes e só quebra com paciente real de alto
   desempenho, que perde a sessão. Detalhes e SQL de reversão em
   `RUNBOOK-OPERACIONAL.md`, seção SCHEMA-02.

2. `docs/DIVIDA-TECNICA.md` FOI PODADO contra o código. Antes ele listava 28 itens já
   resolvidos como se fossem pendentes — isso fez a outra sessão propor duas tarefas
   que já estavam feitas. Agora as listas P1/P2/P3 têm só o que está realmente
   pendente (P1 está vazia), e há uma seção de histórico com os resolvidos e a
   evidência de cada um. AINDA ASSIM: confira no código antes de agir sobre qualquer
   item. A foto envelhece.

3. ARQUIVO NOVO: `lib/focus/progression.ts` (+ teste). É onde vive a conversão entre o
   passo interno do Focus Agentes (0-12) e o nível persistido (1-13), mais a montagem
   do metadata. Se for mexer no Focus, é por aí — não replique essa lógica no
   componente.

DEPOIS DE SINCRONIZAR, confirme que está são:

  npx tsc --noEmit          # espera-se exit 0
  npx vitest run            # espera-se 231 testes / 18 arquivos, todos passando

Se der número diferente de 231/18, me avise antes de continuar.

O QUE ESTÁ EM ABERTO E É CANDIDATO AO PRÓXIMO TRABALHO — está no PROGRESSO.md, na
seção de 02/ago/2026:

  CORR-021 (P2) — o conserto do Focus ficou pela metade. O nível agora é salvo e
  restaurado, mas `calculateFocusProgression` (lib/adaptive.ts:149-151) trava em 9
  enquanto o exercício tem 13 passos: os quatro últimos nunca se consolidam entre
  sessões.

Não comece nada antes de me mostrar a saída dos comandos acima.
