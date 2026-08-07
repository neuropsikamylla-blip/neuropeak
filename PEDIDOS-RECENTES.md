# As 3 ultimas especificacoes dela (automatico; a mais nova por ultimo)
# Na retomada: ler as 3, conectar com PROGRESSO.md e git, declarar e seguir.

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

## 07/08/2026 11:17
O aval não é apenas para o Span Inverso.
A garantia de que:
primeira conclusão grava exatamente uma vez;
revisão grava zero vezes;
tutorialCompletedAt não muda na revisão;
tutorialVersion não muda na revisão;
tutorialSource não muda na revisão;
é uma regra global da T1 e deve valer para todos os 34 exercícios, não apenas para o Span.
Portanto:
mantenha completionRecordFor() como regra única do framework;
nenhum exercício pode implementar lógica própria de gravação de tutorial;
todos os 34 devem usar o mesmo caminho do ExerciseWrapper;
adicione um teste global que falhe se qualquer exercício introduzir chamada própria para onTutorialDone, POST de tutorial ou lógica paralela de conclusão;
a revisão de tutorial deve ser sempre somente leitura em todos os exercícios;
a primeira conclusão deve registrar uma única vez em todos os exercícios;
essa regra deve entrar em docs/T1-REGRAS-GLOBAIS.md.
Depois disso, não quero mais parar exercício por exercício para revalidar essa regra.
Pode seguir com a conversão dos demais 33 exercícios por lotes, todos herdando o mesmo framework já aprovado.
Só pare se algum exercício tiver uma incompatibilidade real de mecânica com o framework ou exigir exceção arquitetural.
