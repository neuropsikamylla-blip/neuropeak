# As 3 ultimas especificacoes dela (automatico; a mais nova por ultimo)
# Na retomada: ler as 3, conectar com PROGRESSO.md e git, declarar e seguir.

## 12/09/2026 23:27
Quero alterar SOMENTE o comportamento visual/layout do exercício de estacionamento. Não alterar regras, lógica do jogo, movimentação dos carros, colisões, geração dos desafios ou critérios de progressão.
1. Grade onde ficam os carros
Hoje a área escura onde os carros ficam possui um tamanho muito fixo. Como teremos fases com quantidades diferentes de veículos — 9, 10, 11, 12 e podendo chegar a aproximadamente 20 carros — essa área precisa se adaptar à complexidade de cada puzzle.
A área jogável deve crescer fisicamente conforme o grid lógico da fase aumenta.
Não quero simplesmente reduzir todos os carros para fazê-los caber dentro de um quadrado do mesmo tamanho.
A prioridade deve ser:
aumentar o container/área jogável;
preservar aproximadamente o tamanho visual dos carros;
somente reduzir moderadamente células/carros quando necessário para caber em telas menores.
Não utilizar apenas transform: scale() para aumentar ou diminuir o conjunto inteiro. Quero que largura e altura reais do container/grid sejam adaptativas.
A dimensão da área visual deve ser determinada principalmente pelo grid lógico necessário para aquela fase, e não exclusivamente pela quantidade de carros.
Por exemplo:
fases simples → área compacta;
fases intermediárias → área média;
fases complexas → área maior;
fases muito complexas, chegando a 17–20 carros → utilizar a maior área disponível de forma responsiva.
No desktop, podemos aproveitar bastante o espaço disponível da tela.
No mobile, a área deve crescer até o limite seguro do viewport e, somente depois disso, realizar ajuste proporcional das células/carros para evitar overflow.
O conjunto formado por:
instrução + barra de progresso + estacionamento
deve permanecer centralizado como um único bloco, mesmo quando o tamanho do estacionamento mudar entre as fases.
Não deixar fases pequenas ocupando uma área gigantesca e não deixar fases grandes espremidas em uma área pequena.
2. Fundo do exercício — dia e noite
Teremos dois arquivos de background do estacionamento, mantendo exatamente a mesma composição:
versão clara / manhã-dia;
versão escura / final do dia-noite.
Esses backgrounds são apenas o cenário externo. A área escura atual do jogo onde ficam os carros continua sendo renderizada normalmente pelo próprio exercício por cima do fundo.
Portanto:
não criar outro tabuleiro dentro da imagem;
não colocar carros no background;
não alterar a lógica do grid por causa da imagem;
o background apenas ocupa o fundo da tela.
Quero que o sistema escolha automaticamente qual imagem utilizar com base no horário local do dispositivo do usuário.
Podemos inicialmente usar:
06:00 até 17:59 → fundo de dia
18:00 até 05:59 → fundo de noite
Deixe esses horários em constantes/configuração fácil de alterar futuramente.
Exemplo conceitual:
const DAY_START_HOUR = 6;
const NIGHT_START_HOUR = 18;
E então definir o background a partir da hora local atual.
Não precisa atualizar continuamente a cada minuto. Basta determinar o fundo quando o exercício/tela for carregado.
A troca deve ser automática e não precisa ser comunicada ao paciente. É apenas uma adaptação ambiental sutil conforme o horário em que ele está realizando o treino.
3. Background responsivo
Os dois backgrounds devem seguir exatamente o mesmo comportamento.
Usar algo equivalente a:
background-size: cover;
background-position: center;
background-repeat: no-repeat;
Mas verificar a responsividade para evitar que, principalmente no celular, elementos importantes das laterais fiquem cortados de maneira estranha.
O background não determina o tamanho da área jogável.
A grade dos carros continua sendo um componente independente colocado por cima do cenário e crescendo conforme a fase exigir.
Isso é importante porque teremos uma área preta pequena em fases simples e progressivamente maior em fases mais complexas, enquanto o cenário de estacionamento permanece preenchendo toda a tela.
4. Centralização
Atualmente também precisamos melhorar a centralização.
Quero que a composição seja estruturada aproximadamente assim:
             instrução
         barra de progresso

          [ ÁREA DO JOGO ]
Tudo deve pertencer a um mesmo wrapper central.
O wrapper deve ficar centralizado horizontalmente e aproveitar corretamente a altura disponível do viewport.
Conforme a grade aumentar, o conjunto continua centralizado.
Não utilizar posicionamentos absolutos independentes para cada elemento se isso estiver causando o desalinhamento atual.
5. Tela “Tutorial concluído”
Corrigir também a tela final do tutorial.
Atualmente o conteúdo aparece deslocado para a esquerda.
Centralizar:
“Tutorial concluído”;
texto explicativo;
botão “Começar”.
Tanto horizontal quanto verticalmente dentro da área disponível.
Essa tela também deve usar o background dia ou noite correspondente ao horário atual, mantendo continuidade visual com o exercício.
Importante
Antes de alterar, analise a implementação atual e reaproveite a estrutura existente sempre que possível.
Não mexer em:
regras;
posições válidas;
algoritmo dos puzzles;
movimentação;
colisões;
objetivo;
tutorial;
progressão funcional.
Estamos alterando exclusivamente UI, tamanho adaptativo da área jogável, centralização, responsividade e background contextual dia/noite.

## 12/09/2026 23:43
<task-notification>
<task-id>bbnkb7oi0</task-id>
<tool-use-id>toolu_01TzYjXLrvkhmWoA2CNHcNUw</tool-use-id>
<output-file>/private/tmp/claude-501/-Users-kamyllahonorio-neuropeak/09c0cfb7-2b4d-4a80-949f-11029931c6fe/tasks/bbnkb7oi0.output</output-file>
<status>completed</status>
<summary>Background command "Disparar o Codex no Estacionamento" completed (exit code 0)</summary>
</task-notification>

## 13/09/2026 00:18
[Image #3] consegue deixar o fundo onde estao os carros mais translucido? ou nao ficaria legal?
