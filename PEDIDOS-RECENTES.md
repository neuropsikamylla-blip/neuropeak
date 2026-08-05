# As 3 ultimas especificacoes dela (automatico; a mais nova por ultimo)
# Na retomada: ler as 3, conectar com PROGRESSO.md e git, declarar e seguir.

## 05/08/2026 12:54
A correção ficou melhor e considero a direção aprovada.
Antes de encerrarmos a Fase 1, quero fazer uma última revisão exclusivamente de UX e linguagem clínica.
Não quero alterar nenhuma regra, cálculo, alerta, fórmula ou lógica do motor.
Quero revisar apenas a forma como essas informações chegam ao terapeuta.
Objetivo
A tela deve responder rapidamente:
"Existe algo neste plano que merece minha atenção?"
Ela não deve parecer um relatório do algoritmo.
Revise toda a nomenclatura procurando termos excessivamente técnicos, por exemplo:
estimativa
calculada
referência
basal
parâmetros
composição
heurística
algoritmo
Sempre que possível, substitua por uma linguagem mais natural para um terapeuta.
Também quero revisar a hierarquia visual.
A informação mais importante deve aparecer primeiro.
O restante deve aparecer apenas quando realmente ajudar a tomada de decisão.
Pergunte continuamente durante a revisão:
"Isso ajuda o terapeuta a decidir algo?"
Se a resposta for não, essa informação deve ir para "Ver detalhes" ou deixar de aparecer.
Faça uma análise completa da camada de apresentação.
Quero que você percorra todas as telas da revisão do plano procurando:
informações redundantes;
informações excessivamente técnicas;
informações que descrevem o funcionamento do sistema em vez de ajudar a decisão clínica;
textos longos;
repetições;
títulos pouco intuitivos;
oportunidades de simplificar.
Não implemente nenhuma funcionalidade nova.
Não altere o núcleo.
Não altere cálculos.
Não altere validações.
Não altere banco.
Não altere API.
Quero apenas uma revisão de UX e linguagem clínica.
Ao final, apresente todas as sugestões antes de implementar qualquer alteração.

## 05/08/2026 12:58
Concordo com a maior parte da análise, mas quero alguns ajustes antes da implementação.
Aprovo
Remover termos excessivamente técnicos quando eles não ajudam na decisão clínica.
Remover descrições do algoritmo da interface.
Simplificar textos longos.
Remover redundâncias.
Confirmar visualmente quando não houver nenhum insight (por exemplo: "Nada a revisar neste plano.").
Não concordo com algumas substituições
Evite trocar precisão clínica por linguagem excessivamente informal.
Por exemplo:
"...é bastante para uma sessão deste tamanho."
Não gosto dessa redação.
Prefiro manter linguagem profissional e objetiva.
Outro exemplo:
"6 exercícios exigem planejamento demorado."
Também não gosto.
"Planejamento prolongado" é um conceito mais técnico e mais correto do que "demorado".
O problema não era o termo "planejamento", e sim "janela de planejamento", que é linguagem interna do sistema.
Sobre os detalhes da estimativa
Também não quero frases muito narrativas.
Em vez de:
"Este plano deve levar entre..."
Prefiro algo mais objetivo, por exemplo:
Tempo previsto para este plano
Faixa esperada para esta meta
Sem transformar isso em um texto explicativo.
Sobre a hierarquia
Concordo em colocar primeiro o estado da sessão.
Também concordo em exibir uma confirmação discreta quando não houver nenhum insight.
Sobre carga e interferência
Quero remover definitivamente da interface qualquer escala interna que não tenha significado clínico direto.
Isso inclui:
carga numérica;
interferência numérica;
qualquer outra métrica interna semelhante.
Se essas informações forem necessárias para o motor, permanecem apenas internamente.
Nos detalhes do exercício quero mostrar apenas informações que realmente auxiliem a interpretação clínica do terapeuta.
Antes de implementar
Revise novamente toda a tela perguntando, para cada informação:
"Se eu remover isto, o terapeuta perde capacidade de tomar alguma decisão clínica?"
Se a resposta for não, essa informação provavelmente não deve aparecer.
Depois implemente todas essas alterações em um único lote, sem alterar o núcleo, apenas a camada de apresentação.

## 05/08/2026 13:01
<task-notification>
<task-id>bha3mg5ec</task-id>
<tool-use-id>toolu_0157VU11btofAqcfZzPDYepU</tool-use-id>
<output-file>/private/tmp/claude-501/-Users-kamyllahonorio-neuropeak/3e6ecf11-e4e5-471f-bbf9-4595faa53598/tasks/bha3mg5ec.output</output-file>
<status>completed</status>
<summary>Background command "Vigiar o disparo" completed (exit code 0)</summary>
</task-notification>
