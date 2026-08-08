# As 3 ultimas especificacoes dela (automatico; a mais nova por ultimo)
# Na retomada: ler as 3, conectar com PROGRESSO.md e git, declarar e seguir.

## 07/08/2026 21:51
Vou validar apenas o representante da Família 3 (desafio-supermercado).
Não inicie a Família 4 até minha aprovação.
Quero validar se a mecânica "memorizar conjunto → selecionar (sem ordem)" realmente ficou equivalente ao padrão aprovado do Span.
Vou observar principalmente:
demonstração completa;
sincronismo entre áudio e visual;
ritmo;
cursor;
clique;
tentativa guiada;
textos;
transições;
encerramento;
possibilidade de rever o tutorial.
Se eu aprovar o representante, considere toda a Família 3 aprovada e só então prossiga para a Família 4.

## 07/08/2026 22:02
Quero acrescentar uma decisão arquitetural da T1.
Nem todo exercício precisa obrigatoriamente possuir uma demonstração animada.
O objetivo da T1 é ensinar a mecânica da atividade, não obrigatoriamente mostrar uma animação.
Portanto, o framework passa a suportar três modos oficiais:
Modo 1 — Demonstração completa
O sistema executa toda a atividade antes da tentativa guiada.
Modo 2 — Demonstração contínua
O sistema demonstra quando agir e quando não agir em tarefas temporizadas.
Modo 3 — Tutorial explicativo
Não existe demonstração animada.
Existe apenas uma explicação clara da regra da atividade, seguida da tentativa guiada.
A tentativa guiada continua obrigatória.
O restante do framework permanece exatamente igual:
preparação;
identidade visual;
transições;
textos;
tutorial concluído;
possibilidade de rever o tutorial.
Não quero forçar demonstração animada onde ela não melhora o aprendizado. O objetivo é ensinar a atividade da forma mais clara possível.

## 07/08/2026 22:08
Antes de implementar a Família 4, quero apenas uma mudança na classificação dos modos.
Não quero que o modo seja definido apenas pela dificuldade de explicar a regra.
Quero que o critério seja:
"A demonstração realmente ajuda o paciente a compreender a mecânica?"
Se a resposta for sim, prefiro demonstração.
Se a resposta for não, prefiro tutorial explicativo.
Por isso, revise especialmente:
N-Back
Dual Task
Antes de convertê-los para o modo explicativo.
Não quero reduzir demonstrações onde elas agregam aprendizado. O modo explicativo deve ser reservado apenas para exercícios em que a animação realmente não acrescenta compreensão.
