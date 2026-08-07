# As 3 ultimas especificacoes dela (automatico; a mais nova por ultimo)
# Na retomada: ler as 3, conectar com PROGRESSO.md e git, declarar e seguir.

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

## 07/08/2026 16:11
A direção está correta.
A regra 10 aprovada passa a valer para todos os exercícios e concordo com a estratégia de reutilizar o framework.
Também concordo com a criação de uma fábrica por família de mecânica, em vez de copiar código por exercício.
Porém, quero ajustar o plano de execução.
Não quero mais validação exercício por exercício.
Mas também não quero converter todos os lotes sem checkpoints.
O que quero validar é uma vez por família de mecânica.
Fluxo daqui para frente:
Framework → aprovado ✅
Família Span → aprovada ✅
Próxima família → converter todos os exercícios daquela família → eu valido apenas um representante.
Se aprovada, toda a família fica automaticamente aprovada.
Só então seguir para a próxima família.
Não preciso validar novamente cada exercício quando eles compartilham exatamente a mesma mecânica de tutorial.
Só quero parar se:
surgir uma incompatibilidade arquitetural;
algum exercício exigir exceção ao framework;
ou aparecer uma nova família de interação que ainda não exista.
Se a família utilizar exatamente o mesmo comportamento já aprovado, pode converter todos os exercícios daquela família sem novas aprovações intermediárias.
O objetivo continua sendo exatamente o mesmo:
um único framework, uma única experiência, reutilização máxima e zero divergência entre exercícios.

## 07/08/2026 16:15
Pode seguir exatamente nesse modelo.
Família 1 já está aprovada pelo padrão do Span, então converta os exercícios restantes dessa família sem nova validação.
Depois, para cada nova família:
converta todos os exercícios da família;
escolha um representante;
pare apenas para eu validar esse representante;
se estiver aprovado, considere toda a família aprovada e siga para a próxima.
Não quero checkpoints exercício por exercício.
Só pare fora desse fluxo se surgir:
incompatibilidade real de mecânica;
necessidade de exceção ao framework;
ou alteração arquitetural nova.
Pode seguir.
