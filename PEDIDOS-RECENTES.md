# As 3 ultimas especificacoes dela (automatico; a mais nova por ultimo)
# Na retomada: ler as 3, conectar com PROGRESSO.md e git, declarar e seguir.

## 16/09/2026 16:19
A reformulação melhorou, mas ainda há um problema importante: algumas perguntas estão rotuladas como multi_criteria, porém um único critério já basta para descobrir a resposta.

Exemplo real:

“Qual produto custa até R$ 13,50 e é do tipo não filtrado?”

Entre as três alternativas, apenas uma já é “não filtrado”.

Portanto o paciente pode ignorar completamente:

custa até R$ 13,50

e acertar.

Isso NÃO é integração real de dois critérios.

Quero acrescentar uma validação de necessidade dos critérios.

Para uma questão MULTI_CRITERIA com critérios A e B:

aplicar somente A deve deixar 2 ou mais alternativas possíveis;
aplicar somente B deve deixar 2 ou mais alternativas possíveis;
aplicar A + B deve deixar exatamente 1 resposta correta.

Conceitualmente:

matches(A).length >= 2

matches(B).length >= 2

matches(A AND B).length === 1

Se qualquer critério isoladamente já identificar a resposta, rejeitar essa rodada como multi_criteria.

Exemplo adequado:

Produto    Preço    Tipo
A    R$ 12,90    não filtrado
B    R$ 18,90    não filtrado
C    R$ 11,90    filtrado

Pergunta:

“Qual custa até R$ 13,50 e é não filtrado?”

Aqui:

preço sozinho → A ou C;
tipo sozinho → A ou B;
preço + tipo → somente A.

Agora os DOIS critérios são necessários.

Quero a mesma lógica para 3 critérios futuramente: nenhum critério irrelevante deve ser colocado na pergunta apenas para parecer mais difícil.

==================================================
FILTRAR + COMPARAR TAMBÉM PRECISA SER REAL

Exemplo:

“Entre os produtos que vencem em 2027, qual é o mais barato?”

O filtro vence em 2027 deve deixar pelo menos 2 alternativas.

Só depois a comparação de preço deve determinar uma.

Se apenas um produto vence em 2027, isso virou busca direta disfarçada.

Portanto:

filteredOptions.length >= 2

e o MIN/MAX posterior precisa gerar solução única.

==================================================
EXCLUSÃO VERDADEIRA

Aplicar a mesma regra.

Não chamar de exclusão:

“Qual não é defumado?”

se existir uma única linha dizendo literalmente o contrário.

Uma exclusão real deve exigir avaliar uma condição ou conjunto de condições e descobrir qual alternativa fica de fora.

==================================================
OUTRO PROBLEMA: O CONTEXTO AINDA NÃO MUDOU

Mesmo com perguntas melhores, todas as telas que estou testando continuam sendo supermercado/produtos.

Isso continua dando sensação de repetição.

Quero começar a alternar dentro DA MESMA SESSÃO:

mercado;
cinema;
viagem/transporte;
cardápio;
agenda;
loja/eventos.

Não basta deixar esses contextos cadastrados para níveis futuros. Eles precisam realmente entrar no seletor de sessão conforme o nível permitir.

Por exemplo:

Mercado:
“Qual custa até R$ 10 e possui pelo menos 400 g?”

depois Cinema:
“Entre os filmes depois das 18h, qual dura menos?”

depois Viagem:
“Qual sai antes das 9h e custa menos de R$ 120?”

depois Agenda:
“Qual compromisso começa após as 14h e dura no máximo 1 hora?”

==================================================
MATERIAL VISUAL

Ainda não vi a modalidade que exige observar de fato a imagem.

Hoje o botão Ampliar embalagem continua praticamente decorativo porque as informações necessárias aparecem novamente na ficha.

Quero algumas rodadas VISUAL_SOURCE nas quais um dado necessário esteja no próprio:

rótulo;
ingresso;
cartaz;
cardápio;
passagem;
etiqueta.

A informação deve continuar perfeitamente legível e ampliável.

Não transformar em teste de visão.

==================================================
COMPOSIÇÃO DA SESSÃO

A sessão precisa variar de verdade.

Não quero:

direct → direct → comparison → comparison → multi → multi

apenas porque os textos mudaram.

Quero controlar a sequência para algo como:

comparison
→ multi_criteria
→ novo contexto
→ filter_then_compare
→ direct_lookup
→ visual_source
→ true_exclusion
→ multi_criteria em outro contexto

Não precisa seguir essa ordem fixa.

O princípio é impedir piloto automático.

==================================================
BUSCA DIRETA

Perguntas como:

“Qual produto é do tipo defumado?”

podem continuar existindo.

Mas são DIRECT_LOOKUP.

Quero que sejam minoria a partir dos níveis intermediários.

Elas podem funcionar como pequenas reduções de carga entre operações mais exigentes.

==================================================
DISTRAITORES MAIS BEM CONSTRUÍDOS

Não quero tornar as perguntas pegadinhas, mas as alternativas precisam ser plausíveis.

Para uma pergunta de dois critérios, quero preferencialmente:

uma alternativa que atende somente A;
uma que atende somente B;
uma que atende A+B.

Isso força integração.

Exemplo:

Pergunta:
“Até R$ 5,50 e pelo menos 400 mL.”

Idealmente:

A → volume atende, preço não;

B → volume + preço atendem;

C → preço atende, volume não.

Assim cada distrator representa uma falha de considerar um dos critérios.

Isso também melhora o valor do dado de erro.

==================================================
ANTES DE CRIAR MAIS RODADAS

Acrescente testes que provem:

MULTI_CRITERIA: nenhum critério isolado identifica a resposta;
A+B identifica exatamente uma;
FILTER_THEN_COMPARE: o filtro deixa pelo menos duas opções;
a comparação seguinte seleciona exatamente uma;
TRUE_EXCLUSION exige processamento real da condição;
contextos diferentes aparecem efetivamente dentro da sessão;
VISUAL_SOURCE aparece de acordo com a distribuição configurada;
DIRECT_LOOKUP não domina níveis intermediários e avançados.

Não mexer na interface por enquanto. O problema agora é a qualidade cognitiva e a seleção das rodadas.

## 16/09/2026 16:27
<task-notification>
<task-id>b1xml4u7y</task-id>
<tool-use-id>toolu_01NJovV5pguxZW3UA8dKFkAx</tool-use-id>
<output-file>/private/tmp/claude-501/-Users-kamyllahonorio-neuropeak/2053e0e1-fe44-49ff-87f3-a59ea6001dde/tasks/b1xml4u7y.output</output-file>
<status>completed</status>
<summary>Background command "Disparar o Codex na C3" completed (exit code 0)</summary>
</task-notification>

## 16/09/2026 18:11
<task-notification>
<task-id>bfbc53vb0</task-id>
<tool-use-id>toolu_01F4W15KNvzexPv4yK4zSUDR</tool-use-id>
<output-file>/private/tmp/claude-501/-Users-kamyllahonorio-neuropeak/2053e0e1-fe44-49ff-87f3-a59ea6001dde/tasks/bfbc53vb0.output</output-file>
<status>completed</status>
<summary>Background command "Aguardar o Codex terminar" completed (exit code 0)</summary>
</task-notification>
