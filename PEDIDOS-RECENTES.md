# As 3 ultimas especificacoes dela (automatico; a mais nova por ultimo)
# Na retomada: ler as 3, conectar com PROGRESSO.md e git, declarar e seguir.

## 07/08/2026 10:12
Estamos praticamente aprovando o Span Direto como exercício de referência.
Restaram apenas dois ajustes antes de replicarmos o framework para os demais exercícios.
1. Texto da demonstração
Hoje:
“Você vai ver a tarefa sendo feita do início ao fim.”
Substitua por:
“Observe como ouvir a sequência e responder corretamente.”
Manter:
DEMONSTRAÇÃO
Observe como responder
2. Sincronismo entre áudio e estímulo visual
Há um defeito perceptível: a indicação visual da tecla/número acontece antes da voz terminar de falar o dígito.
Isso precisa ser corrigido.
Durante a fase de escuta, para cada dígito, a ordem deve ser:
iniciar o áudio do número;
o feedback visual correspondente deve acompanhar o momento da fala, nunca antecipá-la;
concluir o áudio;
respeitar a pausa da cadência;
somente então avançar para o próximo dígito.
Quero que áudio e feedback visual sejam percebidos como um único evento sincronizado.
Não quero a tecla acendendo antes da voz.
Os demais textos ficam aprovados:
SUA VEZ
Agora é sua vez
“Ouça a sequência e clique nos números na mesma ordem.”
E no encerramento:
Tutorial concluído
“Você respondeu na ordem correta. Agora começa o treino.”
Depois desses dois ajustes:
rode os gates;
publique;
pare para uma última validação do Span Direto.
Se estiver correto, considero o Span Direto oficialmente aprovado como padrão da T1 e autorizo imediatamente a conversão dos outros 33 exercícios para o mesmo framework, adaptando apenas a mecânica específica de cada exercício.
Não iniciar a conversão dos demais antes dessa última validação.

## 07/08/2026 10:48
Além dos ajustes específicos do Span Direto, quero congelar algumas decisões de UX que passam a valer para todos os 34 exercícios.
Estas regras fazem parte do framework da T1 e não apenas do Span.
Regras globais da T1
1. Demonstração
Manter:
DEMONSTRAÇÃO
Observe como responder
Texto padrão:
Observe como funciona a atividade.
(Se algum exercício precisar de uma frase específica por causa da mecânica, ela pode ser adaptada, mas deve seguir exatamente esse padrão de linguagem.)
2. Demonstração sempre completa
A demonstração deve executar a tarefa inteira, do início ao fim.
Ela nunca pode mostrar apenas o estímulo.
Ela precisa demonstrar exatamente como responder.
3. Sincronismo
Sempre que existir áudio e elemento visual:
o visual acompanha o áudio;
nunca pode antecipar o áudio;
ambos devem ser percebidos como um único evento.
Esta passa a ser uma regra global do framework.
4. Tentativa guiada
Título:
SUA VEZ
Subtítulo:
Agora é sua vez
O texto deve sempre orientar utilizando o dispositivo real do paciente.
Exemplos:
clique...
arraste...
selecione...
digite...
responda...
Evitar textos genéricos como:
use o teclado;
toque na tela;
O texto deve ser específico para a mecânica daquele exercício.
5. Encerramento
Sempre utilizar:
Tutorial concluído
Nunca:
Demonstração concluída
Tentativa concluída
O tutorial inteiro acabou.
Mensagem padrão:
Agora começa o treino.
ou
Você já sabe como funciona este exercício. Agora começa o treino.
6. Ritmo
O tutorial nunca deve parecer acelerado.
Entre as etapas deve existir tempo suficiente para o paciente compreender o que acabou de acontecer.
O objetivo do tutorial é ensinar, não economizar tempo.
7. Mesmo padrão visual
Todos os exercícios devem utilizar:
mesma estrutura;
mesma identidade visual;
mesmas transições;
mesmo comportamento dos botões;
mesmo padrão de animação.
A única coisa que muda entre exercícios deve ser a mecânica demonstrada.
8. Tutorial sempre disponível
Após o paciente concluir o tutorial pela primeira vez, ele nunca mais deverá aparecer automaticamente.
Entretanto, antes de iniciar qualquer exercício, a tela de preparação deverá permanecer existindo.
Nela haverá sempre duas opções:
Iniciar treino (ação principal)
Ver tutorial novamente (ação secundária)
Fluxo:
Primeira utilização
Preparação
↓
Tutorial (automático)
↓
Treino
Demais utilizações
Preparação
↓
Escolha:
Iniciar treino
Ver tutorial novamente
Se o paciente escolher Iniciar treino, o exercício começa imediatamente.
Se escolher Ver tutorial novamente, todo o tutorial é executado novamente (demonstração + tentativa guiada) e, ao terminar, o treino inicia normalmente.
Regras
Rever o tutorial nunca poderá:
criar Session;
alterar score;
alterar accuracy;
alterar currentDifficulty;
alterar totalAttempts;
alterar progresso;
alterar estatísticas clínicas;
alterar achievements;
alterar planos;
alterar tutorialCompletedAt;
alterar tutorialVersion;
alterar tutorialSource.
O tutorial deve funcionar como um manual interativo, sempre disponível, mas nunca obrigatório após a primeira conclusão.
9. Objetivo da T1
Quero que qualquer paciente consiga abrir qualquer um dos 34 exercícios e tenha a sensação de estar usando exatamente o mesmo sistema de tutorial.
O paciente deve aprender o funcionamento do framework apenas uma vez.
Depois disso, em qualquer exercício novo, ele apenas aprende a mecânica específica daquela atividade.
 A partir desta aprovação, o Span Numérico Auditivo Direto passa a ser considerado o exercício de referência da T1.
Pode iniciar agora a conversão dos demais exercícios até completar os 34.
Faça a conversão por grupos de interação, reutilizando o máximo possível do framework já validado.
Durante esta etapa:
não alterar a mecânica clínica dos exercícios;
não alterar progressão;
não alterar dificuldade;
não alterar pontuação ou métricas clínicas;
não aproveitar para fazer melhorias individuais nos exercícios;
adaptar apenas o conteúdo da preparação, demonstração e tentativa guiada à mecânica real de cada exercício.
Cada exercício convertido deve cumprir integralmente as 9 regras globais acima.
Se algum exercício tiver uma mecânica que realmente não possa ser representada pelo framework atual sem exceção, não invente solução silenciosamente: registre o caso, explique a incompatibilidade e proponha a adaptação antes de alterar o padrão global.
Faça por lotes de interação, com testes e gates completos ao final de cada lote, até concluir os 34 exercícios.

## 07/08/2026 11:00
function finishTutorial() {
  onTutorialDone?.();

  if (!isTutorialReview) onTutorialDone?.();

  setIsTutorialReview(false);
  setPhase("exercise");
}
