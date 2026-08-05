# As 3 ultimas especificacoes dela (automatico; a mais nova por ultimo)
# Na retomada: ler as 3, conectar com PROGRESSO.md e git, declarar e seguir.

## 05/08/2026 07:53
Vamos congelar a implementação por enquanto.

Quero validar visualmente a Fase 1 antes de iniciarmos a T1 e qualquer alteração de banco.

Quero revisar principalmente:

- plano pequeno e bem equilibrado;
- plano focal em memória operacional;
- plano focal em planejamento;
- plano com os 34 exercícios;
- sessão muito acima da duração prevista.

Enquanto isso, não implemente nenhuma nova funcionalidade.

Também não quero iniciar ainda a Fase 2 (tutorial/T1).

Aguarde meu retorno após a validação visual da v2.73.0.

Caso eu encontre algum ponto de UX ou linguagem clínica, faremos pequenos ajustes sobre esta versão antes de seguir para o banco.

Fique apenas disponível para correções da Fase 1, se forem necessárias.

## 05/08/2026 11:47
Encontrei um terceiro caminho, que acredito representar melhor a arquitetura que acabamos de aprovar.

Não quero implementar nem a opção (a) nem a (b).

O problema não é apenas a forma de exibir.

O problema é tentar resumir uma estimativa em um único número quando o próprio motor trabalha com uma faixa.

Quero que o cabeçalho reflita a filosofia aprovada.

Em vez de:

Sessão de 40 min
Estimativa: aproximadamente 35 min
Dentro da faixa esperada (36–44)

ou

Sessão de 40 min
Estimativa: aproximadamente 40 min
Dentro da faixa esperada

quero uma proposta de apresentação mais coerente com a arquitetura.

Exemplo de direção:

SESSÃO PRESCRITA

Meta da sessão
40 minutos

Estimativa atual
Dentro da faixa esperada

ou

Estimativa atual
Acima da faixa esperada

ou

Estimativa atual
Abaixo da faixa esperada

Caso o terapeuta queira detalhes, eles podem aparecer em "Ver detalhes", incluindo a faixa calculada pelo motor.

A tela principal não precisa transformar uma estimativa em um número único se isso gerar falsa precisão ou contradição.

Analise essa alternativa.

Se concordar que ela representa melhor a arquitetura aprovada, implemente essa solução em vez das opções (a) ou (b).

Não iniciar nenhuma outra fase.
Continue apenas corrigindo a Fase 1.

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
