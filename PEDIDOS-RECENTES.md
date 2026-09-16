# As 3 ultimas especificacoes dela (automatico; a mais nova por ultimo)
# Na retomada: ler as 3, conectar com PROGRESSO.md e git, declarar e seguir.

## 15/09/2026 15:28
Informação em Foco
Leia, confira e escolha
Nível 2
Atividade 6 isso ja precisa ser  tirado e o problema dos exercicios permance nada de avisar qts atividades foi feita... O exercício ainda está repetitivo. Você mudou o conteúdo das perguntas, mas NÃO mudou suficientemente o tipo de raciocínio exigido.

Depois de várias atividades, eu ainda estou basicamente fazendo:

`ler pergunta → olhar a mesma linha nos 3 cards → escolher`

Isso NÃO é a reformulação que pedi.

Quero que cada sessão misture DIFERENTES TIPOS DE OPERAÇÃO COGNITIVA.

Os tipos obrigatórios são:

1. BUSCA DIRETA — usar pouco, principalmente níveis iniciais.

Exemplos:
“Qual produto tem 350 g?”
“Qual vence em 05/2027?”

Essa operação pode existir, mas não pode dominar a sessão.

2. COMPARAÇÃO — comparar o mesmo atributo entre opções.

Exemplos:
“Qual tem o menor preço?”
“Qual possui maior quantidade?”
“Qual vence mais tarde?”

3. DOIS CRITÉRIOS SIMULTÂNEOS — precisa manter duas condições ao mesmo tempo.

Exemplos:
“Qual pesa mais de 300 g E custa menos de R$ 10?”
“Qual é integral E tem a maior quantidade?”

4. FILTRAR E DEPOIS COMPARAR — primeiro eliminar opções, depois comparar o que restou.

Exemplos:
“Entre os produtos que vencem em 2027, qual é o mais barato?”
“Entre os itens integrais, qual possui maior peso?”

5. EXCLUSÃO VERDADEIRA / NEGAÇÃO — escolher o que NÃO atende a um critério depois de realmente avaliar as condições.

Exemplos:
“Considerando peso e preço, qual opção NÃO atende aos critérios?”
“Qual produto fica de fora entre os que custam até R$ 15 e pesam pelo menos 400 g?”

IMPORTANTE:
Não considerar como verdadeira exclusão uma pergunta em que a resposta está literalmente escrita em uma única linha.

Exemplo ruim:
“Qual produto não tem açúcar?”

se existir no card uma linha dizendo:
“Sem açúcar”.

Isso continua sendo BUSCA DIRETA com redação negativa.

6. MUDANÇA DE REGRA — a rodada seguinte deve exigir uma operação diferente da anterior.

Exemplo:
primeiro MENOR preço
→ depois MAIOR peso
→ depois NÃO atende
→ depois DOIS critérios.

O objetivo é impedir que o paciente entre em piloto automático.

7. INFORMAÇÃO IRRELEVANTE / DISTRATOR — os cards possuem várias informações, mas a pergunta exige ignorar parte delas.

Exemplos:
“Ignore o preço. Qual produto vence primeiro?”
“Considere apenas peso e validade.”

8. INFORMAÇÃO NO MATERIAL VISUAL — em algumas rodadas, a informação necessária fica na embalagem/cartaz/ingresso/cardápio, e não repetida inteira na ficha abaixo.

O botão “Ampliar” passa a ter função real.

Não usar letra minúscula nem transformar isso em teste de visão.

9. NOVOS CONTEXTOS — não quero passar 6 minutos olhando apenas supermercado.

Alternar também com:

- cardápio;
- cinema;
- viagem/transporte;
- agenda;
- loja;
- eventos;
- serviços.

O contexto deve alterar também os atributos disponíveis.

Exemplos:

CINEMA
atributos:
filme / horário / duração / sala / classificação

Pergunta:
“Entre os filmes depois das 18h, qual tem menor duração?”

VIAGEM
atributos:
destino / saída / duração / plataforma / preço

Pergunta:
“Qual sai antes das 9h e dura menos de 3 horas?”

CARDÁPIO
atributos:
prato / preço / tamanho / ingredientes / tempo de preparo

Pergunta:
“Entre as opções vegetarianas, qual é a mais barata?”

AGENDA
atributos:
compromisso / horário / local / duração

Pergunta:
“Qual compromisso começa mais tarde e dura menos de 1 hora?”

==================================================
REGRA DE VARIEDADE
==================================================

Não quero duas ou três rodadas consecutivas do mesmo tipo quando houver alternativa.

Uma sessão NÃO pode ficar:

`menor preço → maior preço → menor peso → maior peso → validade → peso`

Isso continua sendo comparação simples repetitiva.

Quero algo próximo de:

`busca direta → comparação → dois critérios → novo contexto → exclusão verdadeira → filtro+comparação → material visual → mudança de regra`

Não precisa seguir sempre essa ordem.

Pelo contrário:
quero VARIAÇÃO CONTROLADA.

==================================================
ANTI-REPETIÇÃO OBRIGATÓRIA
==================================================

O seletor da próxima rodada deve considerar pelo menos:

- `questionType` anterior;
- atributo principal anterior;
- contexto anterior;
- operação anterior.

Evitar repetição imediata desses elementos.

Se a rodada atual foi:

`MIN(price)`

a próxima NÃO deve ser simplesmente:

`MAX(price)`

ou outra comparação de uma única linha, se houver tipos diferentes disponíveis.

Quero que a engine olhe primeiro para a OPERAÇÃO COGNITIVA e só depois escolha o conteúdo.

==================================================
DISTRIBUIÇÃO
==================================================

Nos níveis iniciais:
busca direta pode aparecer mais.

Conforme o nível aumenta:
ela deve perder espaço para:

- dois critérios;
- filtro + comparação;
- exclusão verdadeira;
- mudança de regra;
- materiais visuais;
- novos contextos.

No nível 2 que estou testando agora, eu já quero VARIAÇÃO.

Não quero seis rodadas consecutivas de busca direta ou comparação simples.

==================================================
VALIDAÇÃO
==================================================

Toda pergunta precisa ter exatamente UMA resposta correta.

Para:
- dois critérios;
- filtro + comparação;
- exclusão;
- comparação;

validar programaticamente antes de servir a rodada.

Não quero perguntas ambíguas.

==================================================
IMPORTANTE
==================================================

Não quero simplesmente um banco maior de frases.

Quero uma ENGINE que selecione TIPOS DIFERENTES DE OPERAÇÃO.

A pergunta central deve ser:

`“O que o paciente precisa FAZER mentalmente nesta rodada?”`

e não apenas:

`“Qual atributo vou perguntar agora?”`

==================================================
AUDITORIA ANTES DE ALTERAR
==================================================

Antes de criar mais conteúdo, me mostre:

- quais `questionTypes` existem hoje;
- como a próxima rodada é escolhida;
- se existe anti-repetição;
- quantas das rodadas atuais são apenas busca direta ou comparação de um único atributo;
- quais dos tipos acima ainda NÃO estão implementados de verdade;
- se algum tipo existe apenas no nome, mas cognitivamente continua funcionando igual;
- qual função escolhe a próxima rodada;
- como pretende garantir variedade dentro da mesma sessão.

Só depois disso corrija o seletor e o banco.

Não quero mais conteúdo novo antes de corrigir a arquitetura de seleção das rodadas.

## 15/09/2026 15:45
<task-notification>
<task-id>b134t8i5k</task-id>
<tool-use-id>toolu_011ukq65oy6zq5YBY3spCUbq</tool-use-id>
<output-file>/private/tmp/claude-501/-Users-kamyllahonorio-neuropeak/2053e0e1-fe44-49ff-87f3-a59ea6001dde/tasks/b134t8i5k.output</output-file>
<status>completed</status>
<summary>Background command "Disparar o Codex na fatia C2" completed (exit code 0)</summary>
</task-notification>

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
