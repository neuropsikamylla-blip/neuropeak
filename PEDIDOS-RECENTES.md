# As 3 ultimas especificacoes dela (automatico; a mais nova por ultimo)
# Na retomada: ler as 3, conectar com PROGRESSO.md e git, declarar e seguir.

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

## 02/08/2026 15:22
relatorio do terapeuta eu acho que pode sim informa onde o paciente trava e onde ele evolui... foco, inibição, flexibilidade etc... Ordem dos degraus: eu dei exemplo, vc pode ver qual a melhor alternativa para o nivel de progressão, lembrando que é um treino, então a progressão precisa ser razoavel nem para ficar dificil demais de cara e nem manter a facilidade pois se nao o paciente perde o engajamento do treino certo? ... chuva orfa acho que pode apagar... E eu estava pensando em colocar o fundo do agente focus mais claro, O melhor seria um branco levemente acinzentado ou azulado, como #F5F7FA ou #F3F6F9, com uma borda cinza-azulada bem discreta. Assim, evita claridade excessiva e mantém a tela elegante. O que vc acha?
