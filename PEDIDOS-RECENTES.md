# As 3 ultimas especificacoes dela (automatico; a mais nova por ultimo)
# Na retomada: ler as 3, conectar com PROGRESSO.md e git, declarar e seguir.

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

## 02/08/2026 14:10
Sim, ataque o CORR-021. Duas coisas antes:

1. Rode `git pull --ff-only origin main` de novo — subiu mais um commit
   (d88df5d), é só o log de pedidos do gancho, mas sincronize para não
   divergir.

2. Esta é a ÚNICA sessão trabalhando no neuropeak agora. A outra saiu do
   caminho, então você não precisa se preocupar com colisão — mas também
   não há ninguém para pegar o que você deixar pela metade. Commite cada
   passo.

Sobre o conserto: o teto tem que virar PARÂMETRO, não constante nova — o
`maxLevel` de `calculateProgression` na mesma `lib/adaptive.ts` é o modelo
a seguir, e já tem teste (`adaptive.test.ts`, procure "maxLevel 12").

E confira se `focusDetectTargetMs` também assume 9 níveis: se assumir, o
critério de velocidade quebra nos passos 10 a 13 e o conserto fica pela
metade de novo.

## 02/08/2026 15:02
Focus Agentes (eu acho que aqui precisamos deixar o modo unitario, sem isso de terapeuta decidir) a progressão de dificuldade, misturar tudo de acordo com a progressão, eu já havia me esquecido das outras propostas extamente por isso o modo tem de ser unico, dentro dele vamos ter o comando "de achar apenas um agente com uma cor" "de achar um agente com uma cor e acessorio" "de acharmos 2 agentes com cores..." depois dois com acessorios... ter a mudança de regra Ache um agente azul, não, o amarelo ... ter a inibição marque todos os agentes vermelhos, menos o com o oculos enfim... isso pode ser inserido de acordo com a progressão de dificuldade o que acha? Me ajude analisar antes de mudar
