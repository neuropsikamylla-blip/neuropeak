# Historico automatico dos pedidos (gravado no envio; o mais novo por ultimo)

## 01/08/2026 17:15
onde estamos?

## 01/08/2026 17:19
na verdade são 80 imagens, vamos integrar as 80 imagens no informação em foco, lembrando fundo transparente ok?

## 01/08/2026 18:10
essas 3 embalagens de marcas reais sao de que mesmo? e preciso criar algo a mais?

## 01/08/2026 18:14
vou mandar elas aqui ok?

## 01/08/2026 18:14
vou colocar la na pasta entao

## 01/08/2026 18:15
mandei la

## 01/08/2026 23:31
**Pode, mas eu não mandaria exatamente como está.** O comando anterior mistura correção estrutural, situações do cotidiano, aumento das imagens, preços e progresso. Isso pode fazer o Claude/Codex tentar corrigir tudo ao mesmo tempo e deixar a raiz do problema incompleta.

Primeiro envie **somente a correção estrutural do catálogo e do gerador de questões**. Depois de testar, avançamos para historinhas, dificuldade e melhorias visuais.

Use este comando:

```text
Quero realizar uma correção estrutural no exercício existente “Informação em Foco”.

Esta é a FASE 1 da correção.

NÃO implemente novas situações do cotidiano agora.
NÃO crie novas perguntas.
NÃO altere o layout geral.
NÃO substitua as imagens.
NÃO mude a progressão de dificuldade.
NÃO trabalhe ainda em melhorias visuais.

Nesta fase, corrija exclusivamente:

1. o catálogo central de produtos;
2. a coerência dos atributos;
3. as unidades de medida;
4. a correspondência entre produto, imagem e dados;
5. a geração e validação das questões;
6. a repetição indevida de perguntas;
7. o cálculo do progresso.

O exercício já está implementado. Corrija a estrutura atual sem recriá-lo.

==================================================
1. PROBLEMAS ENCONTRADOS
==================================================

O sistema está atribuindo características aleatórias e incompatíveis aos produtos.

Exemplos encontrados:

- chá de camomila aparecendo como “contém lactose”;
- lasanha congelada aparecendo como “sabor chocolate”;
- pão de forma aparecendo como “sabor morango”;
- biscoito aparecendo como “sabor uva”;
- leite líquido apresentado em gramas;
- azeite apresentado em gramas;
- produtos aparecendo com conteúdo diferente do indicado na embalagem;
- o mesmo produto mudando de peso ou volume entre questões;
- a mesma pergunta sendo repetida em questões consecutivas;
- progresso incompatível com a questão atual.

Esses problemas indicam que os atributos fixos dos produtos estão sendo aleatorizados ou gerados sem considerar a categoria.

==================================================
2. FONTE ÚNICA DOS DADOS
==================================================

Crie ou identifique um catálogo central de produtos.

Todos os componentes e todas as questões devem utilizar esse catálogo como fonte oficial.

A imagem é somente uma representação visual.

Não utilizar OCR.

Não extrair automaticamente da imagem:

- peso;
- volume;
- validade;
- lactose;
- glúten;
- sabor;
- ingredientes;
- preço;
- resposta correta.

Os dados oficiais devem vir do catálogo estruturado.

==================================================
3. ATRIBUTOS FIXOS
==================================================

Os seguintes atributos nunca podem ser aleatorizados por questão:

- id;
- nome;
- marca;
- categoria;
- imagem;
- tipo;
- versão;
- sabor;
- recheio;
- peso;
- volume;
- quantidade de unidades;
- quantidade de sachês;
- unidade de medida;
- lactose;
- glúten;
- açúcar;
- ingredientes;
- alergênicos;
- conservação.

Exemplo:

{
  "id": "margarina-01",
  "name": "Margarina cremosa",
  "category": "refrigerados",
  "contentValue": 500,
  "contentUnit": "g",
  "image": "/products/margarina.png"
}

Esse produto nunca pode aparecer com 800 g em outra questão.

==================================================
4. ATRIBUTOS VARIÁVEIS
==================================================

Somente os seguintes dados podem variar quando o exercício exigir:

- preço;
- validade;
- estoque;
- promoção.

Mesmo esses dados devem:

- respeitar faixas plausíveis;
- permanecer estáveis durante toda a sessão;
- não mudar de uma questão para outra.

No início da sessão, crie um snapshot:

sessionProductCatalog

Todas as questões da sessão devem utilizar esse mesmo snapshot.

==================================================
5. MASSA, VOLUME E CONTAGEM
==================================================

Separar corretamente:

MASSA:
- g;
- kg.

VOLUME:
- mL;
- L.

CONTAGEM:
- unidades;
- sachês.

Não comparar dimensões incompatíveis.

Exemplo:

Pergunta:
“Qual produto contém pelo menos 500 g?”

Somente produtos cadastrados em g ou kg podem aparecer.

Não incluir:

- leite;
- suco;
- óleo;
- azeite;
- vinagre;
- shoyu;

quando estiverem cadastrados em mL ou L.

Para líquidos, usar:

- Volume: 500 mL;
- Volume: 1 L.

Para sólidos, usar:

- Peso: 500 g;
- Peso: 1 kg.

Para contagem, usar:

- Quantidade: 12 unidades;
- Quantidade: 10 sachês.

==================================================
6. CORRESPONDÊNCIA ENTRE IMAGEM E CADASTRO
==================================================

O conteúdo do cadastro deve corresponder à embalagem vinculada.

Exemplos:

- embalagem de 500 g → catálogo com 500 g;
- embalagem de 1 kg → catálogo com 1 kg;
- embalagem de 500 mL → catálogo com 500 mL;
- embalagem de 1 L → catálogo com 1 L;
- caixa com 10 sachês → catálogo com 10 sachês.

Quando não for possível confirmar a quantidade:

- não inventar;
- marcar o produto como pendente de revisão;
- impedir temporariamente seu uso em perguntas sobre conteúdo.

==================================================
7. CAMPOS APLICÁVEIS POR CATEGORIA
==================================================

Crie regras de campos aplicáveis.

LEITES:
- tipo;
- lactose;
- volume;
- preço;
- validade;
- conservação.

IOGURTES:
- sabor;
- lactose;
- peso;
- açúcar;
- preço;
- validade.

SUCOS:
- sabor;
- volume;
- açúcar;
- preço;
- validade.

PÃES:
- tipo ou versão;
- peso;
- unidades;
- glúten;
- lactose;
- validade.

LASANHAS E CONGELADOS:
- recheio ou versão;
- peso;
- preço;
- validade;
- conservação;
- lactose;
- glúten.

Não utilizar “sabor chocolate” em lasanha.

CHÁS:
- tipo;
- quantidade de sachês;
- peso;
- preço;
- validade;
- modo de preparo.

Não atribuir lactose ao chá comum.

FARINÁCEOS:
- tipo;
- peso;
- glúten;
- preço;
- validade;
- conservação.

LÍQUIDOS DE COZINHA:
- tipo;
- volume;
- preço;
- validade;
- conservação.

MOLHOS:
- tipo;
- peso ou volume real;
- preço;
- validade;
- ingredientes;
- alergênicos;
- conservação.

Quando um campo não for aplicável, utilizar:

null

Não preencher com um valor aleatório.

==================================================
8. GERAÇÃO DAS QUESTÕES
==================================================

Antes de gerar uma questão:

1. escolher um campo aplicável aos produtos;
2. selecionar produtos com dimensões compatíveis;
3. selecionar produtos semanticamente comparáveis;
4. garantir exatamente uma resposta correta;
5. utilizar dados reais do catálogo;
6. validar se todos os valores são plausíveis;
7. impedir atributos contraditórios;
8. impedir perguntas repetidas recentemente.

Exemplo inadequado:

“Qual produto não contém lactose?”

Opções:
- chá de camomila;
- milho em conserva.

Exemplo adequado:

“Qual produto não contém lactose e possui 1 litro?”

Opções:
- leite integral — 1 L — contém lactose;
- leite sem lactose — 1 L — não contém lactose;
- bebida vegetal — 900 mL — não contém lactose;
- leite desnatado — 500 mL — contém lactose.

==================================================
9. PERGUNTAS SOBRE SABOR
==================================================

Perguntas sobre sabor somente podem usar produtos cujo campo `flavor` seja real e aplicável.

Exemplos adequados:

- iogurte natural;
- iogurte de morango;
- iogurte de baunilha.

Não usar sabor para:

- pão de forma comum;
- lasanha;
- arroz;
- feijão;
- farinha;
- sal;
- óleo;
- milho em conserva.

Não criar sabores aleatórios.

==================================================
10. PERGUNTAS SOBRE LACTOSE
==================================================

Utilizar prioritariamente categorias em que lactose seja uma informação funcionalmente relevante:

- leite;
- iogurte;
- manteiga;
- requeijão;
- queijo;
- creme de leite;
- leite condensado;
- bebidas vegetais;
- produtos industrializados cujo cadastro possua esse campo.

Não utilizar chá, milho, sal, açúcar ou óleo apenas porque normalmente não possuem lactose.

==================================================
11. SELEÇÃO SEMÂNTICA
==================================================

Priorizar grupos coerentes:

- leites e bebidas vegetais;
- iogurtes;
- farináceos;
- biscoitos;
- pães;
- conservas;
- congelados;
- frios;
- refrigerados;
- molhos;
- óleos e vinagres;
- cafés e chás.

Não combinar produtos aleatórios sem contexto.

==================================================
12. PREÇOS PLAUSÍVEIS
==================================================

Criar faixas aproximadas por categoria.

Os preços não precisam acompanhar o mercado em tempo real, mas devem ser plausíveis.

Exemplos:

- azeite de oliva deve normalmente custar mais que óleo de soja;
- leite deve possuir faixa compatível com leite;
- presunto deve possuir faixa compatível com frios;
- margarina deve possuir faixa compatível com margarina.

Não utilizar preços absurdos apenas para produzir uma resposta correta.

==================================================
13. REPETIÇÃO DAS QUESTÕES
==================================================

Nas capturas, a mesma pergunta apareceu nas questões 7, 8 e 9:

“Qual produto contém pelo menos 500 g e custa menos de R$ 8,00?”

Implemente histórico de questões.

Regras:

- não repetir o mesmo texto nas três questões seguintes;
- não repetir a mesma combinação de campos nas três questões seguintes;
- não repetir o mesmo produto correto consecutivamente;
- não repetir excessivamente a mesma categoria;
- não apresentar mais de duas questões idênticas em uma sessão.

==================================================
14. VALIDAÇÃO OBRIGATÓRIA
==================================================

Antes de exibir qualquer questão, validar:

1. se os campos se aplicam aos produtos;
2. se as unidades são compatíveis;
3. se os dados correspondem ao catálogo;
4. se o catálogo corresponde à imagem;
5. se existe exatamente uma resposta correta;
6. se os distratores são plausíveis;
7. se a pergunta não foi repetida recentemente;
8. se não existem atributos absurdos;
9. se o feedback utiliza os mesmos dados da questão;
10. se os produtos são semanticamente comparáveis.

Se a questão falhar:

- não exibir;
- gerar outra;
- registrar o motivo da rejeição em desenvolvimento.

==================================================
15. CORREÇÃO DO PROGRESSO
==================================================

Em uma sessão de 10 questões:

- Questão 1, antes da resposta: 0%;
- Questão 2, antes da resposta: 10%;
- Questão 7, antes da resposta: 60%;
- Questão 8, antes da resposta: 70%;
- Questão 9, antes da resposta: 80%;
- conclusão da Questão 10: 100%.

Mostrar também:

“Questão X de 10”

Verificar se a troca de nível está reinicializando ou alterando incorretamente o progresso.

==================================================
16. AUDITORIA DO CATÁLOGO
==================================================

Revise todos os produtos cadastrados.

Crie um relatório com:

- ID;
- produto;
- categoria;
- imagem;
- conteúdo visível na embalagem;
- conteúdo cadastrado;
- unidade visível;
- unidade cadastrada;
- atributos incompatíveis;
- status;
- correção realizada.

Comece pelos produtos que já apresentaram erro:

- chá de camomila;
- milho em conserva;
- biscoito sem açúcar;
- lasanha congelada;
- pão de forma integral;
- leite semidesnatado;
- leite sem lactose;
- leite integral;
- molho de tomate;
- presunto cozido;
- nuggets de frango;
- açúcar mascavo;
- margarina;
- ervilha em conserva;
- azeite de oliva;
- ketchup;
- aveia em flocos.

==================================================
17. TESTES OBRIGATÓRIOS
==================================================

Crie ou atualize testes para garantir:

- leite nunca aparece em gramas;
- azeite nunca aparece em gramas;
- margarina não muda de 500 g para 800 g;
- açúcar de 1 kg não aparece como 300 g;
- chá comum não recebe lactose aleatória;
- lasanha não recebe sabor chocolate;
- pão comum não recebe sabor morango;
- nenhum produto muda de conteúdo durante a sessão;
- existe exatamente uma resposta correta;
- perguntas repetidas são bloqueadas;
- o progresso está correto;
- uma questão inválida não é exibida.

==================================================
18. CRITÉRIOS DE ACEITAÇÃO
==================================================

A FASE 1 estará concluída quando:

1. existir uma fonte única para os produtos;
2. atributos fixos não forem aleatorizados;
3. massa, volume e contagem estiverem separados;
4. os dados coincidirem com as imagens;
5. nenhum produto possuir atributo incompatível;
6. os preços forem plausíveis;
7. cada questão tiver exatamente uma resposta correta;
8. questões inválidas forem descartadas;
9. a mesma pergunta não aparecer repetidamente;
10. o progresso estiver correto;
11. o catálogo completo tiver sido auditado;
12. os testes estiverem aprovados.

==================================================
19. ENTREGA FINAL
==================================================

Ao concluir, apresente:

1. causa raiz encontrada;
2. arquivos modificados;
3. estrutura do catálogo central;
4. produtos corrigidos;
5. divergências entre imagens e cadastro;
6. regras de unidade implementadas;
7. regras por categoria implementadas;
8. validações implementadas;
9. questões rejeitadas durante os testes;
10. correção do progresso;
11. testes executados;
12. resultado dos testes;
13. pendências que exigem revisão manual.

Não avance para situações do cotidiano ou melhorias visuais nesta fase.

Primeiro estabilize totalmente os dados e a geração das questões.
```

Depois que ele concluir, teste pelo menos uma sessão inteira de 10 questões. **Só depois** envie o comando das situações do cotidiano. Caso contrário, as historinhas apenas reaproveitarão os mesmos dados errados.

## 01/08/2026 23:58
vigilancia percebi que a pipa está mto diferente... atualizei as pipas ALVOS verifica

## 02/08/2026 00:17
adicionei mais 2 pares e atualizei outra das pipas

## 02/08/2026 00:25
isso da rabiola eu que pedi para ser diferente mesmo .... Depois de concluir e testar a correção estrutural, envie este comando como **FASE 2**:

```text
Quero implementar a FASE 2 do exercício existente “Informação em Foco”.

A FASE 1, referente à correção estrutural do catálogo, unidades, atributos, validações e progresso, deve estar concluída antes desta implementação.

O exercício já existe.

NÃO recrie o exercício.
NÃO crie uma segunda versão.
NÃO substitua o catálogo corrigido.
NÃO altere novamente pesos, volumes, marcas, imagens ou atributos fixos.
NÃO use OCR.
NÃO extraia informações automaticamente das embalagens.

Nesta fase, implemente:

1. novo padrão visual dos cartões;
2. quadro funcional de informações;
3. variação dos campos por dificuldade;
4. leitura direta da embalagem com ampliação;
5. situações do cotidiano;
6. novos estilos de perguntas;
7. distribuição equilibrada das questões na sessão.

==================================================
1. OBJETIVO
==================================================

O exercício deve trabalhar:

- leitura funcional;
- atenção seletiva;
- localização de informações;
- comparação;
- manutenção de condições na memória;
- conferência antes da resposta;
- controle da impulsividade;
- compreensão de situações cotidianas.

As imagens dos produtos devem ter função real, mas não podem ser a única fonte das informações.

O formato principal será:

IMAGEM DO PRODUTO
+
QUADRO FUNCIONAL DE INFORMAÇÕES

Em algumas questões específicas, o paciente deverá ler diretamente a embalagem usando a função de ampliação.

==================================================
2. ESTRUTURA VISUAL DO CARTÃO
==================================================

Mantenha o padrão visual geral atual, mas reorganize o cartão nesta ordem:

1. imagem do produto;
2. botão discreto para ampliar a embalagem;
3. nome do produto;
4. marca fictícia;
5. quadro de informações;
6. ação complementar, quando necessária.

Estrutura aproximada:

┌────────────────────────────┐
│                            │
│       [EMBALAGEM]          │
│                            │
│       Ampliar embalagem    │
│                            │
│ Gelatina incolor           │
│ Doce Flora                 │
│ ────────────────────────── │
│ Peso                24 g   │
│ Tipo             Incolor   │
│ Sabor          Sem sabor   │
│ Preço             R$ 6,90  │
└────────────────────────────┘

O cartão inteiro continua sendo a área de resposta.

O botão de ampliação não pode selecionar o cartão.

==================================================
3. ÁREA DA IMAGEM
==================================================

A embalagem está pequena demais na versão atual.

Usar aproximadamente:

- altura da área da imagem: 145 a 175 px;
- altura máxima da embalagem: 135 a 160 px;
- largura máxima: 130 a 155 px;
- object-fit: contain;
- object-position: center;
- fundo branco;
- embalagem inteira visível;
- sem recortar tampa, base ou laterais;
- sem distorção.

A imagem deve ser suficientemente grande para reconhecimento, mas não pode dominar o cartão.

==================================================
4. QUADRO FUNCIONAL DE INFORMAÇÕES
==================================================

O quadro abaixo da imagem deve utilizar os dados oficiais do catálogo.

Não deve depender do texto visível na embalagem.

Exemplos de campos:

- preço;
- peso;
- volume;
- quantidade;
- validade;
- tipo;
- versão;
- sabor;
- lactose;
- glúten;
- açúcar;
- rendimento;
- conservação;
- instrução após abertura;
- porcentagem de cacau;
- quantidade de sachês;
- alergênicos.

Usar rótulos corretos:

- Peso: 500 g;
- Volume: 500 mL;
- Quantidade: 12 unidades;
- Quantidade: 10 sachês;
- Rendimento: 10 copos.

Não utilizar “Peso” para líquidos.

==================================================
5. NÃO REPETIR INFORMAÇÕES DESNECESSARIAMENTE
==================================================

Evite repetir no quadro exatamente o que já aparece no nome.

Exemplo:

Nome:
Gelatina incolor sem sabor

Não precisa mostrar:

Produto: gelatina
Tipo: incolor
Sabor: sem sabor

quando todas essas informações estiverem integralmente no título e a pergunta não exigir localização específica.

Nesse caso, pode mostrar:

Peso: 24 g
Rendimento: 12 porções
Preço: R$ 6,90
Validade: 11/2027

Entretanto, quando a pergunta avaliar “tipo” ou “sabor”, os campos correspondentes podem ser apresentados separadamente.

==================================================
6. CAMPOS VISÍVEIS POR DIFICULDADE
==================================================

Não mostrar todos os campos em todas as questões.

NÍVEL INICIAL:

- 3 produtos;
- 3 campos por cartão;
- 1 condição;
- informação pedida em posição previsível;
- sem dados excessivos.

Exemplo de campos:

Peso
Preço
Validade

NÍVEL FÁCIL:

- 3 produtos;
- 4 campos;
- localização ou comparação de uma informação;
- valores moderadamente próximos.

NÍVEL MÉDIO:

- 3 ou 4 produtos;
- 4 ou 5 campos;
- duas condições;
- informações irrelevantes plausíveis.

NÍVEL DIFÍCIL:

- 4 produtos;
- 5 ou 6 campos;
- duas ou três condições;
- situações do cotidiano;
- validade, conservação, ingredientes ou alergênicos.

Não dificultar por:

- fonte pequena;
- baixo contraste;
- desorganização;
- esconder informações;
- reduzir excessivamente a embalagem.

==================================================
7. POSIÇÃO DOS CAMPOS
==================================================

No nível inicial, manter a posição dos campos relativamente estável para ensinar a estratégia de busca.

Exemplo:

1. conteúdo;
2. preço;
3. validade.

Nos níveis médio e difícil, permitir uma variação controlada da ordem dos campos.

Não alterar aleatoriamente toda a disposição a cada rodada.

A dificuldade deve vir da seleção e comparação das informações, não da desorganização visual.

==================================================
8. MODALIDADE A — LEITURA DO QUADRO FUNCIONAL
==================================================

Esta será a modalidade principal.

Representará aproximadamente 70% das questões.

O paciente deverá localizar e comparar informações apresentadas no quadro abaixo da imagem.

Exemplos:

- Qual produto possui 24 g?
- Qual embalagem contém 10 sachês?
- Qual produto tem o menor preço?
- Qual produto vence primeiro?
- Qual produto possui 500 g e custa menos de R$ 8,00?
- Qual produto não contém lactose e possui 1 litro?
- Qual produto é integral e não possui açúcar adicionado?

As informações necessárias devem estar no quadro funcional.

==================================================
9. MODALIDADE B — LEITURA DIRETA DA EMBALAGEM
==================================================

Representará aproximadamente 10% das questões.

Nessa modalidade, o paciente deverá localizar uma informação diretamente na imagem da embalagem.

Exemplos:

- Na embalagem, qual produto informa “rende até 10 copos”?
- Qual embalagem apresenta “70% cacau”?
- Qual produto informa “10 sachês”?
- Qual embalagem contém a expressão “sem adição de açúcar”?
- Qual produto informa “incolor e sem sabor”?

Regras obrigatórias:

- a informação procurada deve estar realmente legível na imagem;
- a imagem deve estar correta;
- o quadro funcional não pode repetir a informação que está sendo avaliada;
- deve existir botão para ampliar;
- a embalagem ampliada não pode revelar campos adicionais do catálogo;
- não utilizar essa modalidade em imagens com texto imperfeito;
- não utilizar imagens pendentes de revisão.

Adicionar no cadastro:

directPackageReadingEnabled: boolean

Somente produtos com:

directPackageReadingEnabled: true

podem ser utilizados nessa modalidade.

==================================================
10. AMPLIAÇÃO DA EMBALAGEM
==================================================

Ao tocar ou clicar na imagem ou no botão “Ampliar embalagem”:

- abrir modal central;
- mostrar somente a embalagem ampliada;
- preservar proporção;
- fundo neutro ou branco;
- permitir zoom moderado;
- permitir fechar;
- retornar à mesma questão;
- não registrar resposta;
- não avançar a atividade;
- não reiniciar tempo;
- não revelar se o produto está correto.

O modal deve possuir:

- botão fechar;
- fechamento pela tecla Escape;
- foco acessível;
- navegação por teclado;
- descrição da imagem.

No celular, permitir gesto de ampliação quando tecnicamente viável.

==================================================
11. MODALIDADE C — SITUAÇÃO DO COTIDIANO
==================================================

Representará aproximadamente 20% das questões.

Na interface adulta, utilizar o título:

“SITUAÇÃO DO COTIDIANO”

Não utilizar “historinha”.

A situação deve ser curta, objetiva e funcional.

Estrutura:

Situação do cotidiano

[Contexto breve]

Pedido:
[condições resumidas]

Qual produto atende ao pedido?

Exemplo:

Situação do cotidiano

Marina precisa comprar leite para o café da manhã.

Pedido:
1 L · Sem lactose · Até R$ 8,00

Qual produto atende a todas as condições?

==================================================
12. FORMATO VISUAL DA SITUAÇÃO
==================================================

Não criar um bloco excessivamente grande.

Exemplo:

┌─────────────────────────────────────────────┐
│ SITUAÇÃO DO COTIDIANO                       │
│                                             │
│ Marina precisa comprar leite para o café.   │
│                                             │
│ Pedido: 1 L · Sem lactose · Até R$ 8,00     │
│                                             │
│ Qual produto atende a todas as condições?   │
└─────────────────────────────────────────────┘

Destacar discretamente as condições.

Não usar cores excessivas.

Não transformar o enunciado em lista longa.

Usar no máximo:

- duas frases de contexto;
- três condições;
- uma pergunta final.

==================================================
13. ESTILOS DE PERGUNTA
==================================================

Implemente os seguintes tipos:

A. LOCALIZAÇÃO DIRETA

Exemplos:

- Qual produto possui 24 g?
- Qual embalagem contém 10 sachês?
- Qual produto informa “sem sabor”?
- Qual produto possui 500 mL?

B. COMPARAÇÃO

Exemplos:

- Qual produto possui o menor preço?
- Qual produto tem o maior peso?
- Qual produto vence primeiro?
- Qual produto possui a validade mais longa?

C. DUAS CONDIÇÕES

Exemplos:

- Qual produto possui 500 g e custa menos de R$ 8,00?
- Qual produto não contém lactose e possui 1 litro?
- Qual produto contém 10 sachês e custa menos de R$ 9,00?
- Qual produto é integral e não possui açúcar adicionado?

D. TRÊS CONDIÇÕES

Exemplos:

- Qual produto possui 500 g, custa menos de R$ 10,00 e vence depois de outubro?
- Qual chocolate possui 70% de cacau, 80 g e preço de até R$ 10,00?

E. VALIDADE E CONSERVAÇÃO

Exemplos:

- Qual produto vence primeiro?
- Qual produto ainda estará válido em janeiro de 2028?
- Qual produto deve ser mantido refrigerado?
- Qual produto precisa permanecer congelado?
- Qual deve ser consumido em até três dias após aberto?

F. INGREDIENTES E ALERGÊNICOS

Exemplos:

- Qual produto contém amendoim?
- Qual produto deve ser evitado por uma pessoa alérgica a amendoim?
- Qual produto contém leite?
- Qual produto informa “não contém glúten”?

Utilizar somente dados reais e revisados do catálogo.

G. SITUAÇÃO DO COTIDIANO

Exemplos definidos nas seções seguintes.

==================================================
14. EXEMPLOS DE SITUAÇÕES DO COTIDIANO
==================================================

EXEMPLO 1 — GELATINA

Contexto:

“Marina vai preparar uma sobremesa.”

Pedido:

Gelatina incolor · Sem sabor · 24 g

Pergunta:

“Qual produto atende ao pedido?”

EXEMPLO 2 — LEITE EM PÓ

Contexto:

“Carlos precisa comprar leite em pó para uma receita.”

Pedido:

Integral · 400 g

Pergunta:

“Qual produto deve escolher?”

EXEMPLO 3 — FERMENTO

Contexto:

“Ana vai preparar um bolo.”

Pedido:

Fermento químico em pó · 100 g

Pergunta:

“Qual produto corresponde à lista?”

EXEMPLO 4 — PASTA DE AMENDOIM

Contexto:

“Júlia procura uma pasta para o café da manhã.”

Pedido:

Integral · Sem adição de açúcar · 500 g

Pergunta:

“Qual produto atende ao pedido?”

EXEMPLO 5 — GOMA DE TAPIOCA

Contexto:

“Pedro precisa comprar goma de tapioca para o café da manhã.”

Pedido:

Goma hidratada · 500 g · Até R$ 7,00

Pergunta:

“Qual produto atende a todas as condições?”

EXEMPLO 6 — CHOCOLATE

Contexto:

“Fernanda procura um chocolate mais intenso.”

Pedido:

70% cacau · 80 g · Até R$ 10,00

Pergunta:

“Qual opção atende ao pedido?”

EXEMPLO 7 — LEITE SEM LACTOSE

Contexto:

“Roberto não pode consumir lactose.”

Pedido:

Leite · Sem lactose · 1 L

Pergunta:

“Qual produto ele deve escolher?”

EXEMPLO 8 — VALIDADE

Contexto:

“Helena quer comprar um produto que dure mais tempo.”

Pedido:

Validade posterior a dezembro de 2027

Pergunta:

“Qual produto atende ao pedido?”

==================================================
15. DISTRATORES
==================================================

Os distratores devem ser plausíveis e atender parcialmente às condições.

Exemplo:

Pedido:

Sem lactose · 1 L

Produto A:
Sem lactose · 500 mL

Produto B:
Contém lactose · 1 L

Produto C:
Sem lactose · 1 L

Produto D:
Contém lactose · 500 mL

Resposta correta:
Produto C.

Para três condições:

- um produto atende à condição 1;
- outro atende às condições 1 e 2;
- outro atende às condições 2 e 3;
- apenas um atende às três.

Não utilizar alternativas absurdas.

==================================================
16. DISTRIBUIÇÃO EM UMA SESSÃO DE 10 QUESTÕES
==================================================

Sugestão de composição:

1. localização direta;
2. localização de característica;
3. comparação de quantidade;
4. comparação de preço ou validade;
5. duas condições;
6. duas condições diferentes;
7. situação do cotidiano;
8. ingredientes, alergênicos ou conservação;
9. leitura direta da embalagem;
10. situação funcional com duas ou três condições.

Não utilizar uma ordem completamente fixa em todas as sessões.

Variar a ordem mantendo equilíbrio.

==================================================
17. REGRA DE NÃO REPETIÇÃO
==================================================

Não repetir:

- o mesmo texto nas três questões seguintes;
- a mesma combinação de campos nas três questões seguintes;
- a mesma situação;
- o mesmo produto correto consecutivamente;
- a mesma categoria muitas vezes seguidas;
- mais de duas questões do mesmo tipo em sequência.

A sessão precisa exigir mudança de foco atencional.

==================================================
18. DADOS EXIBIDOS E DADOS OCULTOS
==================================================

Cada questão deve declarar quais campos estarão visíveis.

Exemplo:

{
  questionType: "twoConditions",
  requiredFields: ["content", "price"],
  visibleFields: [
    "content",
    "price",
    "expiration",
    "storage"
  ]
}

Os campos necessários precisam estar visíveis.

Os campos distratores devem ser plausíveis.

Não exibir um campo sem finalidade apenas para preencher espaço.

==================================================
19. MODELO DE QUESTÃO
==================================================

Estrutura sugerida:

{
  id: "question-001",
  mode: "functionalCard",
  type: "twoConditions",
  prompt: "Qual produto possui 500 g e custa menos de R$ 8,00?",
  requiredFields: [
    {
      field: "contentValue",
      operator: "greaterThanOrEqual",
      value: 500,
      unit: "g"
    },
    {
      field: "price",
      operator: "lessThan",
      value: 8
    }
  ],
  visibleFields: [
    "content",
    "price",
    "expiration",
    "storage"
  ],
  productIds: [
    "product-a",
    "product-b",
    "product-c",
    "product-d"
  ],
  correctProductId: "product-c",
  explanation: "Este produto possui 500 g e custa menos de R$ 8,00."
}

==================================================
20. MODELO DE SITUAÇÃO
==================================================

{
  id: "scenario-001",
  mode: "dailySituation",
  type: "threeConditions",
  title: "Situação do cotidiano",
  context: "Fernanda procura um chocolate mais intenso.",
  requestLabel: "Pedido",
  requestSummary: "70% cacau · 80 g · Até R$ 10,00",
  prompt: "Qual produto atende a todas as condições?",
  requiredFields: [
    {
      field: "cocoaPercentage",
      operator: "equals",
      value: 70
    },
    {
      field: "contentValue",
      operator: "equals",
      value: 80,
      unit: "g"
    },
    {
      field: "price",
      operator: "lessThanOrEqual",
      value: 10
    }
  ],
  correctProductId: "chocolate-70-80g",
  explanation: "Este chocolate possui 70% de cacau, 80 g e custa até R$ 10,00."
}

==================================================
21. FEEDBACK
==================================================

Em caso de acerto:

“Correto. Este produto possui 500 g e custa R$ 7,49.”

Em caso de erro na primeira tentativa:

Não revelar imediatamente a resposta.

Mostrar pista processual:

“Confira novamente o peso e o preço.”

Ou:

“O produto escolhido atende ao preço, mas não ao peso.”

Em caso de nova tentativa incorreta:

Destacar os campos relevantes da alternativa correta.

O feedback deve explicar quais condições foram atendidas.

Não usar apenas:

“Errado.”

==================================================
22. DESTAQUE APÓS A RESPOSTA
==================================================

Antes da resposta:

- nenhum campo recebe destaque especial;
- todas as opções possuem tratamento visual equivalente.

Depois da resposta:

- destacar discretamente os campos que comprovam a solução;
- usar borda verde para acerto;
- usar indicação adequada para erro;
- não aplicar filtro sobre a imagem;
- não ocultar os demais cartões.

Exemplo após acerto:

Peso: 500 g
Preço: R$ 7,49

Essas duas linhas podem receber destaque leve.

==================================================
23. ACESSIBILIDADE
==================================================

Manter:

- foco visível;
- cartão acessível por teclado;
- ativação por Enter e Espaço;
- modal acessível;
- leitura dos campos por leitor de tela;
- estado correto ou incorreto anunciado;
- tamanho mínimo de fonte legível;
- contraste adequado;
- botões com rótulo.

Não colocar informações importantes apenas por cor.

==================================================
24. VALIDAÇÃO ANTES DA EXIBIÇÃO
==================================================

Antes de exibir qualquer questão, validar:

1. os dados vêm do catálogo;
2. os campos necessários estão visíveis;
3. as unidades são compatíveis;
4. existe exatamente uma resposta correta;
5. os distratores atendem parcialmente às condições;
6. não há contradição com a imagem;
7. o texto da situação corresponde aos dados;
8. a pergunta não foi repetida recentemente;
9. a modalidade de leitura direta está autorizada para as imagens;
10. o feedback corresponde à resposta.

Se falhar:

- não exibir;
- gerar outra;
- registrar o motivo da rejeição.

==================================================
25. NÃO ALTERAR
==================================================

Não alterar nesta fase:

- catálogo estrutural já corrigido;
- atributos fixos;
- identificação das imagens;
- nome do exercício;
- duração da sessão;
- sistema clínico;
- registro de resultados já existente;
- progressão adaptativa, salvo para associar os novos tipos de pergunta.

==================================================
26. CRITÉRIOS DE ACEITAÇÃO
==================================================

A FASE 2 estará concluída quando:

1. cada cartão possuir imagem e quadro funcional;
2. as embalagens estiverem maiores;
3. o quadro utilizar dados oficiais;
4. os campos variarem conforme a dificuldade;
5. não houver excesso de informações no nível inicial;
6. o paciente puder ampliar a embalagem;
7. questões de leitura direta não repetirem a resposta no quadro;
8. existirem situações do cotidiano curtas;
9. os distratores atenderem parcialmente às condições;
10. cada questão tiver exatamente uma resposta correta;
11. não houver repetição excessiva;
12. as unidades forem exibidas corretamente;
13. o feedback explicar as condições;
14. a interface continuar responsiva;
15. a navegação por teclado funcionar;
16. as questões inválidas forem descartadas;
17. a sessão possuir variedade real;
18. a imagem não funcionar apenas como decoração.

==================================================
27. ENTREGA FINAL
==================================================

Ao concluir, apresente:

1. componentes modificados;
2. estrutura do novo ProductCard;
3. estrutura do quadro funcional;
4. modal de ampliação criado;
5. campos por nível;
6. tipos de pergunta implementados;
7. situações do cotidiano adicionadas;
8. distribuição usada nas sessões;
9. regras de não repetição;
10. feedbacks implementados;
11. validações criadas;
12. testes executados;
13. resultado dos testes;
14. capturas ou descrição das telas;
15. pendências encontradas.

Primeiro implemente e teste essa FASE 2 sem modificar novamente a estrutura corrigida na FASE 1.
```

A sequência correta é:

**Fase 1:** estabilizar produtos, unidades, dados e perguntas.
**Fase 2:** criar cartões, etiquetas, ampliação e situações do cotidiano.
**Fase 3:** ajustar dificuldade adaptativa após observar sessões completas.

## 02/08/2026 00:27
vigilancia nao é por exercicio... segue a mesma regra do estacionamento, torre (é por tempo e tem a linha de progressao) tem de ter uns 7 a 10 min...

## 02/08/2026 00:45
voltamos

## 02/08/2026 01:02
Quero implementar a FASE 3 do exercício existente “Informação em Foco”.

As fases anteriores devem estar concluídas:

FASE 1:
- catálogo central corrigido;
- atributos coerentes;
- unidades corretas;
- correspondência entre imagens e produtos;
- validação das questões;
- progresso corrigido.

FASE 2:
- cartões com imagem e quadro funcional;
- ampliação das embalagens;
- tipos variados de pergunta;
- situações do cotidiano;
- feedback por tentativa;
- regras contra repetição;
- responsividade e acessibilidade.

A FASE 3 deve implementar:

1. dificuldade adaptativa;
2. progressão e regressão controladas;
3. registro detalhado dos erros;
4. continuidade entre sessões;
5. relatório de desempenho para o profissional;
6. testes completos do mecanismo adaptativo.

NÃO recrie o exercício.
NÃO crie uma segunda versão.
NÃO altere novamente o catálogo dos produtos.
NÃO substitua imagens.
NÃO modifique marcas, pesos, volumes ou atributos fixos.
NÃO altere o padrão visual aprovado na Fase 2.
NÃO transforme o exercício em jogo com pontos, moedas, troféus ou premiações.
NÃO realizar diagnóstico automático.

==================================================
1. OBJETIVO DA FASE 3
==================================================

A dificuldade deve se ajustar ao desempenho do paciente sem provocar mudanças bruscas.

O sistema deve observar:

- acerto ou erro;
- acerto na primeira tentativa;
- quantidade de tentativas;
- tempo de resposta;
- tipo de pergunta;
- quantidade de condições;
- campos envolvidos;
- uso da ampliação da embalagem;
- condição ignorada no erro;
- nível de ajuda necessário;
- sequência recente de desempenho.

A adaptação deve ocorrer pela complexidade cognitiva da tarefa, e não por:

- fonte menor;
- baixo contraste;
- imagens menores;
- excesso de informações desorganizadas;
- alternativas absurdas;
- redução da acessibilidade.

==================================================
2. PRESERVAR A ESTRUTURA EXISTENTE
==================================================

Antes de implementar, identifique:

- sistema atual de níveis;
- armazenamento de progresso;
- estrutura de sessão;
- quantidade de questões por sessão;
- regras atuais de avanço;
- dados já registrados;
- relatórios existentes.

Utilize a estrutura existente sempre que ela for adequada.

Não criar um segundo sistema de níveis concorrente.

Caso existam regras antigas incompatíveis com esta fase, refatore-as de forma centralizada e informe as alterações ao final.

==================================================
3. DIMENSÕES DE DIFICULDADE
==================================================

A dificuldade deve ser controlada por dimensões independentes.

A. QUANTIDADE DE PRODUTOS

Mais fácil:
- 3 produtos.

Mais difícil:
- 4 produtos.

Não aumentar além de 4 sem validação clínica específica, pois o excesso pode prejudicar a legibilidade.

B. QUANTIDADE DE CAMPOS VISÍVEIS

Mais fácil:
- 3 campos.

Intermediário:
- 4 ou 5 campos.

Mais difícil:
- 5 ou 6 campos.

C. QUANTIDADE DE CONDIÇÕES

Mais fácil:
- uma condição.

Intermediário:
- duas condições.

Mais difícil:
- três condições.

D. SEMELHANÇA DOS DISTRATORES

Mais fácil:
- distratores claramente diferentes.

Intermediário:
- um distrator atende parcialmente ao pedido.

Mais difícil:
- todos os distratores atendem a pelo menos uma condição;
- apenas um atende ao conjunto completo.

E. TIPO DE QUESTÃO

Progressão sugerida:

1. localização direta;
2. comparação simples;
3. duas condições;
4. validade ou conservação;
5. situação do cotidiano;
6. ingredientes ou alergênicos;
7. três condições;
8. leitura direta da embalagem.

F. ORGANIZAÇÃO DOS CAMPOS

Mais fácil:
- campos em posições estáveis.

Intermediário:
- pequena variação controlada.

Mais difícil:
- ordem variável, mas ainda organizada.

Não embaralhar os campos de forma caótica.

G. PROXIMIDADE DOS VALORES

Mais fácil:

- 100 g;
- 500 g;
- 1 kg.

Mais difícil:

- 400 g;
- 450 g;
- 500 g;
- 550 g.

Os valores devem continuar plausíveis e compatíveis com os produtos.

H. COMPLEXIDADE DA SITUAÇÃO

Mais fácil:
- contexto curto;
- uma condição.

Intermediário:
- duas condições.

Mais difícil:
- até três condições.

Não dificultar criando textos longos.

==================================================
4. ALTERAR APENAS UMA DIMENSÃO POR VEZ
==================================================

Ao aumentar a dificuldade, não modificar simultaneamente:

- número de produtos;
- número de campos;
- quantidade de condições;
- semelhança dos distratores;
- tipo de pergunta.

Aumentar somente uma dimensão por etapa.

Exemplo correto:

Antes:
- 3 produtos;
- 4 campos;
- uma condição.

Depois:
- 3 produtos;
- 4 campos;
- duas condições.

Exemplo inadequado:

Antes:
- 3 produtos;
- 3 campos;
- uma condição.

Depois:
- 4 produtos;
- 6 campos;
- três condições;
- leitura direta da embalagem.

Mudanças bruscas não permitem identificar qual fator provocou o erro.

==================================================
5. REGRA DE PROGRESSÃO
==================================================

Utilizar como referência principal:

- 3 acertos consecutivos permitem avanço;
- o avanço deve ocorrer em apenas uma dimensão;
- priorizar acertos na primeira tentativa;
- não avançar apenas porque o paciente acertou depois de várias tentativas;
- não avançar quando os acertos forem excessivamente demorados em relação ao próprio padrão recente.

Regra sugerida:

Avançar uma etapa quando houver:

- 3 acertos consecutivos;
- pelo menos 2 desses acertos na primeira tentativa;
- ausência de erro crítico nas últimas 3 questões;
- desempenho estável no nível atual.

Erro crítico:

- selecionar opção que não atende a nenhuma condição;
- ignorar repetidamente a mesma condição;
- responder de forma impulsiva em tempo extremamente curto;
- errar mesmo após o feedback processual.

Não utilizar apenas tempo como critério de avanço.

==================================================
6. REGRA DE REGRESSÃO
==================================================

Reduzir uma dimensão quando houver:

- 2 erros nas últimas 3 questões;
- 3 erros no mesmo bloco;
- repetição do mesmo tipo de erro;
- incapacidade de integrar duas ou três condições;
- necessidade frequente de segunda tentativa.

Ao reduzir:

- alterar somente uma dimensão;
- preservar os demais parâmetros;
- retornar à última configuração estável;
- não reiniciar a sessão;
- não mostrar ao paciente mensagens como “você voltou de nível”.

A interface deve continuar neutra.

==================================================
7. EVITAR OSCILAÇÃO DE NÍVEL
==================================================

Implemente uma regra de estabilidade para evitar:

avança → erra → volta → acerta → avança.

Use histerese adaptativa.

Exemplo:

- após avançar, manter a nova configuração por pelo menos 2 questões válidas;
- não regredir por apenas um erro isolado;
- depois de regressão, exigir nova sequência estável antes de avançar;
- registrar o motivo de cada mudança.

Cada alteração deve gerar um registro semelhante a:

{
  "fromLevel": 3,
  "toLevel": 4,
  "changedDimension": "requiredConditions",
  "previousValue": 1,
  "newValue": 2,
  "reason": "threeConsecutiveCorrect",
  "questionIndex": 6
}

==================================================
8. PERFIL DE DIFICULDADE
==================================================

Não representar dificuldade apenas por um número único.

Criar um perfil semelhante a:

{
  "level": 4,
  "productCount": 4,
  "visibleFieldCount": 5,
  "requiredConditionCount": 2,
  "distractorSimilarity": "moderate",
  "fieldOrderVariation": "controlled",
  "dailySituationEnabled": true,
  "directPackageReadingEnabled": false
}

O número do nível pode permanecer para a interface interna, mas o sistema precisa conhecer quais dimensões estão ativas.

==================================================
9. CONFIGURAÇÃO SUGERIDA DE PROGRESSÃO
==================================================

Utilize esta progressão como referência, adaptando-a ao sistema atual.

NÍVEL 1

- 3 produtos;
- 3 campos;
- uma condição;
- localização direta;
- distratores claramente diferentes;
- campos em posição estável.

NÍVEL 2

- 3 produtos;
- 4 campos;
- uma condição;
- localização e comparação simples;
- valores moderadamente próximos.

NÍVEL 3

- 3 produtos;
- 4 campos;
- duas condições;
- um distrator parcialmente correto.

NÍVEL 4

- 4 produtos;
- 4 ou 5 campos;
- duas condições;
- distratores semanticamente semelhantes.

NÍVEL 5

- 4 produtos;
- 5 campos;
- situações do cotidiano com duas condições;
- variação controlada dos campos.

NÍVEL 6

- 4 produtos;
- 5 ou 6 campos;
- validade, conservação, ingredientes ou alergênicos;
- distratores que atendem parcialmente às condições.

NÍVEL 7

- 4 produtos;
- 5 ou 6 campos;
- três condições;
- situações funcionais;
- valores mais próximos.

NÍVEL 8

- 4 produtos;
- até 6 campos;
- combinação de modalidades;
- leitura direta da embalagem autorizada;
- três condições;
- distratores de alta semelhança.

Não utilizar leitura direta da embalagem como requisito permanente em todas as questões do nível mais alto.

==================================================
10. TEMPO DE RESPOSTA
==================================================

Registrar o tempo de resposta, mas não utilizá-lo isoladamente para determinar desempenho.

Registrar:

- tempo até a primeira seleção;
- tempo total da questão;
- tempo gasto no modal de ampliação;
- tempo após receber feedback;
- mediana de tempo da sessão.

Evitar média simples quando houver valores extremos.

Utilizar preferencialmente:

- mediana;
- faixa interquartil;
- comparação com o próprio histórico do paciente.

Não comparar automaticamente o paciente com outros usuários.

Não considerar resposta muito rápida como desempenho superior sem verificar acerto e impulsividade.

==================================================
11. DETECÇÃO DE RESPOSTA IMPULSIVA
==================================================

Registrar como possível resposta impulsiva quando:

- a seleção ocorre em tempo extremamente curto;
- a questão possui duas ou três condições;
- a alternativa escolhida atende somente à primeira condição;
- o paciente ignora os outros campos.

Não classificar automaticamente o paciente como impulsivo.

Registrar apenas:

possibleImpulsiveResponse: true

O relatório deve usar linguagem descritiva:

“Ocorreram respostas muito rápidas em questões com múltiplas condições.”

Não utilizar linguagem diagnóstica.

==================================================
12. CLASSIFICAÇÃO DOS ERROS
==================================================

Cada erro deve ser classificado conforme o critério ignorado.

Exemplos:

- ignorou preço;
- ignorou peso;
- ignorou volume;
- ignorou validade;
- ignorou lactose;
- ignorou glúten;
- ignorou açúcar;
- ignorou conservação;
- ignorou ingrediente;
- ignorou alergênico;
- confundiu unidade;
- escolheu o maior em vez do menor;
- escolheu opção que atendia apenas parcialmente;
- erro de leitura direta da embalagem;
- resposta extremamente rápida;
- resposta após tempo prolongado.

Exemplo de registro:

{
  "questionId": "q-018",
  "questionType": "twoConditions",
  "requiredFields": [
    "content",
    "price"
  ],
  "correctProductId": "product-55",
  "selectedProductId": "product-56",
  "attempt": 1,
  "ignoredConditions": [
    "productType"
  ],
  "matchedConditions": [
    "content"
  ],
  "errorCategory": "partialConditionMatch",
  "responseTimeMs": 8200,
  "usedPackageZoom": false
}

==================================================
13. PRIMEIRA E SEGUNDA TENTATIVA
==================================================

Registrar separadamente:

- acerto na primeira tentativa;
- acerto após feedback;
- erro após segunda tentativa.

Para adaptação:

- acerto na primeira tentativa tem maior peso;
- acerto após feedback demonstra aprendizagem, mas não deve ser tratado como desempenho idêntico;
- erro após segunda tentativa pode gerar redução de dificuldade.

Não utilizar pontuação visível para o paciente.

==================================================
14. USO DA AMPLIAÇÃO
==================================================

Registrar:

- se abriu a imagem;
- quantas vezes abriu;
- tempo total de ampliação;
- se acertou depois da ampliação;
- se abriu imagens de vários produtos;
- se a questão era de leitura direta ou quadro funcional.

O uso do zoom não deve ser considerado erro.

Em questões de leitura direta da embalagem, utilizar a ampliação pode ser uma estratégia adequada.

Não penalizar automaticamente.

==================================================
15. CONTINUIDADE ENTRE SESSÕES
==================================================

Salvar ao final da sessão:

- nível inicial;
- nível final;
- maior nível alcançado;
- último nível estável;
- perfil de dificuldade final;
- acurácia;
- acertos na primeira tentativa;
- erros após feedback;
- tempo mediano;
- campos com mais erros;
- tipos de pergunta com mais dificuldade;
- quantidade de ampliações;
- data da sessão.

Na sessão seguinte:

- iniciar do último nível estável ou da regra de continuidade já existente;
- não reiniciar automaticamente no nível 1;
- não iniciar diretamente no pico mais alto se ele não foi consolidado;
- preservar as preferências e acessibilidade.

Utilizar uma questão inicial de calibração apenas quando necessário.

==================================================
16. CALIBRAÇÃO NO INÍCIO DA SESSÃO
==================================================

Quando houver histórico recente:

- iniciar no nível estável anterior;
- usar as primeiras 2 questões para confirmar a adequação;
- não apresentar mensagem de “teste de nível” ao paciente.

Quando não houver histórico:

- iniciar no nível inicial definido pelo profissional ou no padrão do exercício.

Quando houver longo intervalo entre sessões:

- permitir uma redução cautelosa de uma dimensão;
- não apagar o histórico;
- não voltar automaticamente ao nível mais baixo.

==================================================
17. DURAÇÃO DA SESSÃO
==================================================

Preservar a duração e a quantidade de questões já configuradas.

Caso o exercício funcione por tempo:

- não interromper uma questão no meio;
- finalizar a questão atual antes de encerrar;
- calcular progresso com base na estrutura existente.

Caso funcione por quantidade:

- preservar a quantidade definida;
- não adicionar questões extras por causa da adaptação.

A adaptação deve ocorrer dentro da sessão existente.

==================================================
18. COMPOSIÇÃO ADAPTATIVA DA SESSÃO
==================================================

Manter variedade.

Mesmo em níveis altos, não usar apenas questões difíceis.

Sugestão para uma sessão:

- aproximadamente 20% de consolidação;
- aproximadamente 60% no nível atual;
- aproximadamente 20% de desafio controlado.

Questões de consolidação:

- mesma habilidade;
- complexidade ligeiramente menor.

Questões de desafio:

- apenas uma dimensão acima.

Não usar desafio quando o paciente apresentar sequência recente de erros.

==================================================
19. RELATÓRIO PARA O PROFISSIONAL
==================================================

Criar ou atualizar uma tela de relatório da sessão.

Apresentar:

- data e duração;
- nível inicial e final;
- maior nível alcançado;
- último nível estável;
- total de questões;
- acertos;
- acertos na primeira tentativa;
- acertos após feedback;
- erros finais;
- precisão geral;
- tempo mediano;
- quantidade de ampliações;
- desempenho por tipo de pergunta;
- desempenho por campo;
- erros mais frequentes;
- mudanças de dificuldade;
- questões descartadas pela validação.

Não mostrar somente uma pontuação geral.

==================================================
20. DESEMPENHO POR CAMPO
==================================================

Apresentar uma tabela semelhante:

| Campo | Questões | Acertos iniciais | Acertos após feedback | Erros |
|------|----------|------------------|------------------------|-------|
| Peso | 5 | 4 | 1 | 0 |
| Preço | 4 | 2 | 1 | 1 |
| Validade | 3 | 1 | 1 | 1 |
| Lactose | 2 | 2 | 0 | 0 |

Também apresentar:

- percentual de acerto;
- tempo mediano;
- quantidade de vezes que o campo foi ignorado.

Não interpretar automaticamente os resultados como déficit cognitivo.

==================================================
21. DESEMPENHO POR TIPO DE QUESTÃO
==================================================

Registrar separadamente:

- localização direta;
- comparação;
- duas condições;
- três condições;
- situação do cotidiano;
- validade;
- conservação;
- ingredientes;
- alergênicos;
- leitura da embalagem.

Exemplo:

{
  "twoConditions": {
    "presented": 5,
    "firstAttemptCorrect": 2,
    "correctAfterFeedback": 2,
    "finalErrors": 1,
    "medianResponseTimeMs": 14300
  }
}

==================================================
22. LINGUAGEM DO RELATÓRIO
==================================================

Usar linguagem descritiva.

Exemplos adequados:

- “Apresentou maior número de erros em questões que combinavam preço e quantidade.”
- “Necessitou de feedback em três questões com duas condições.”
- “O tempo de resposta foi maior em tarefas de validade.”
- “Utilizou a ampliação da embalagem em quatro questões.”

Não utilizar:

- “possui déficit de atenção”;
- “apresenta TDAH”;
- “tem prejuízo executivo”;
- “é impulsivo”;
- “possui transtorno de memória”.

O relatório do exercício não constitui avaliação diagnóstica.

==================================================
23. VISUALIZAÇÃO DO HISTÓRICO
==================================================

Criar histórico longitudinal simples.

Mostrar por sessão:

- data;
- nível estável;
- precisão;
- acerto inicial;
- tempo mediano;
- campos com maior dificuldade.

Evitar gráficos excessivamente complexos.

Não comparar pacientes entre si.

Não utilizar ranking.

==================================================
24. DADOS PARA O PACIENTE
==================================================

Ao paciente, mostrar apenas feedback neutro e funcional.

Pode mostrar:

- sessão concluída;
- quantidade de atividades realizadas;
- mensagem breve de encerramento.

Não mostrar:

- classificação clínica;
- comparação com outros pacientes;
- rótulos de dificuldade;
- “você regrediu”;
- “desempenho ruim”;
- pontuação competitiva;
- moedas;
- troféus;
- estrelas.

==================================================
25. CONTROLE DO PROFISSIONAL
==================================================

Permitir ao profissional:

- definir nível inicial;
- manter adaptação automática ativa ou inativa;
- limitar nível máximo;
- limitar tipos de pergunta;
- habilitar ou desabilitar leitura direta da embalagem;
- selecionar duração ou quantidade, conforme estrutura existente;
- visualizar relatório;
- reiniciar progressão somente por ação explícita.

Não mostrar esses controles ao paciente.

==================================================
26. REGISTRO DAS ALTERAÇÕES ADAPTATIVAS
==================================================

Salvar cada alteração:

{
  "timestamp": "2026-08-02T10:30:00",
  "questionIndex": 6,
  "direction": "increase",
  "dimension": "visibleFieldCount",
  "from": 4,
  "to": 5,
  "reason": "stablePerformance"
}

Registrar também quando uma alteração foi considerada, mas bloqueada:

{
  "direction": "increase",
  "dimension": "requiredConditionCount",
  "blocked": true,
  "reason": "recentLevelChange"
}

==================================================
27. PRIVACIDADE E SEGURANÇA DOS DADOS
==================================================

Não registrar textos desnecessários ou informações pessoais dentro dos eventos de desempenho.

Utilizar IDs internos.

Não incluir nome completo do paciente em logs técnicos.

Respeitar o sistema de autenticação e permissões já existente.

Relatórios individuais devem ser acessíveis somente ao profissional autorizado.

==================================================
28. VALIDAÇÃO DA ADAPTAÇÃO
==================================================

Antes de aplicar uma mudança, validar:

1. se há dados suficientes;
2. se a mudança não ocorreu recentemente;
3. se a questão seguinte possui dados válidos;
4. se apenas uma dimensão será modificada;
5. se a mudança preserva acessibilidade;
6. se existe exatamente uma resposta correta;
7. se os produtos são coerentes;
8. se não haverá repetição;
9. se o novo perfil respeita o limite definido pelo profissional.

Se a validação falhar:

- manter a dificuldade;
- registrar o motivo;
- gerar outra questão.

==================================================
29. TESTES OBRIGATÓRIOS
==================================================

Criar testes para:

- 3 acertos consecutivos causando avanço;
- apenas uma dimensão sendo alterada;
- um erro isolado não causando regressão;
- 2 erros em 3 questões causando regressão;
- bloqueio de oscilação;
- continuidade entre sessões;
- início no último nível estável;
- acerto após feedback registrado separadamente;
- classificação do critério ignorado;
- uso do zoom registrado;
- tempo mediano calculado corretamente;
- resposta rápida não sendo tratada automaticamente como superior;
- limite máximo definido pelo profissional;
- adaptação desativada;
- questão inválida não sendo exibida;
- relatório calculado corretamente;
- ausência de linguagem diagnóstica;
- permissão de acesso ao relatório.

==================================================
30. SIMULAÇÕES AUTOMATIZADAS
==================================================

Crie simulações de perfis de desempenho.

PERFIL A — ALTO DESEMPENHO

- respostas corretas;
- maioria na primeira tentativa;
- tempos estáveis.

Resultado esperado:

- progressão gradual;
- apenas uma dimensão por vez;
- sem saltos.

PERFIL B — DESEMPENHO OSCILANTE

- acertos e erros alternados.

Resultado esperado:

- manutenção do nível;
- ausência de avanço e regressão constantes.

PERFIL C — DIFICULDADE PERSISTENTE

- 2 erros em 3 questões;
- erros no mesmo critério.

Resultado esperado:

- redução de uma dimensão;
- questões de consolidação;
- sem reiniciar a sessão.

PERFIL D — RESPOSTAS MUITO RÁPIDAS E INCORRETAS

Resultado esperado:

- registro de possível resposta impulsiva;
- ausência de diagnóstico;
- manutenção ou redução controlada.

PERFIL E — USO FREQUENTE DE AMPLIAÇÃO

Resultado esperado:

- registro do uso;
- ausência de penalização automática;
- análise separada em leitura direta da embalagem.

==================================================
31. CRITÉRIOS DE ACEITAÇÃO
==================================================

A Fase 3 estará concluída quando:

1. a dificuldade se adaptar ao desempenho;
2. apenas uma dimensão mudar por vez;
3. três acertos estáveis permitirem avanço;
4. dois erros em três questões permitirem regressão controlada;
5. um erro isolado não provocar regressão;
6. não houver oscilação constante;
7. acerto inicial e acerto após feedback forem separados;
8. erros forem classificados por condição;
9. tempo de resposta for registrado corretamente;
10. uso da ampliação for registrado sem penalização;
11. o último nível estável for salvo;
12. a próxima sessão continuar adequadamente;
13. o profissional puder limitar a adaptação;
14. o relatório mostrar desempenho por campo;
15. o relatório mostrar desempenho por tipo;
16. não houver diagnóstico automático;
17. não houver ranking ou gamificação;
18. questões inválidas continuarem bloqueadas;
19. acessibilidade e responsividade forem preservadas;
20. todos os testes e simulações forem aprovados.

==================================================
32. ENTREGA FINAL
==================================================

Ao concluir, apresente:

1. arquivos modificados;
2. mecanismo adaptativo criado;
3. dimensões de dificuldade;
4. regras de avanço;
5. regras de regressão;
6. mecanismo contra oscilação;
7. estrutura de continuidade entre sessões;
8. eventos registrados;
9. classificação dos erros;
10. estrutura do relatório;
11. controles disponíveis ao profissional;
12. testes executados;
13. simulações executadas;
14. resultados dos testes;
15. limitações encontradas;
16. pendências manuais.

Não considere a Fase 3 concluída apenas por criar níveis numerados.

É obrigatório implementar:

- adaptação por dimensão;
- estabilidade;
- classificação dos erros;
- continuidade entre sessões;
- relatório profissional;
- controles clínicos;
- testes e simulações.

## 02/08/2026 08:42
onde paramos?

## 02/08/2026 08:49
Estamos no caminho certo. Continue exclusivamente a Fase 1.
Não implemente ainda nenhuma parte visual da Fase 2 e nem a adaptação da Fase 3.
Quero primeiro estabilizar completamente o motor do exercício.
Continue a F1.3 seguindo estas diretrizes:
Conclua todos os geradores de questões utilizando exclusivamente os dados oficiais do catálogo, nunca informações sorteadas ou texto extraído das imagens.
Implemente os seguintes geradores:
Localização direta
Comparação
Duas condições
Três condições
Validade
Conservação
Ingredientes
Alergênicos
Situação do cotidiano (quando os dados do catálogo permitirem)
Importante
Não quero que exista um sistema de pontuação ou pesos fixos de tipos de pergunta.
Este é um treino cognitivo clínico, não um jogo.
O objetivo é treinar funções cognitivas como:
atenção seletiva;
atenção sustentada;
leitura funcional;
velocidade de processamento;
memória de trabalho;
controle inibitório.
A dificuldade deve aumentar apenas pela complexidade cognitiva da tarefa, nunca por um sistema de pontuação.
Exemplo:
Nível inicial:
localizar uma informação.
Nível intermediário:
comparar informações.
Nível avançado:
integrar duas ou três condições simultaneamente.
A função cognitiva treinada permanece a mesma; apenas aumenta a carga cognitiva.
Organização dos geradores
Quero que os geradores sejam independentes da dificuldade.
Cada gerador deve apenas saber construir corretamente uma questão.
A dificuldade será controlada depois por parâmetros como:
quantidade de produtos;
quantidade de campos visíveis;
número de condições;
semelhança entre distratores;
proximidade dos valores;
necessidade de integrar informações.
Não quero um gerador diferente para cada nível.
Quero um único gerador parametrizado.
Validação obrigatória
Antes de qualquer questão ser exibida, validar obrigatoriamente:
os produtos pertencem à categoria correta;
todos os atributos vêm do catálogo;
as unidades são compatíveis;
existe exatamente uma resposta correta;
os distratores são plausíveis;
não há atributos incompatíveis;
a pergunta não foi utilizada recentemente;
a situação do cotidiano corresponde aos produtos apresentados.
Se qualquer validação falhar:
descartar a questão;
gerar outra automaticamente.
Testes
Depois de concluir os geradores, execute pelo menos:
500 sessões simuladas por nível;
milhares de questões geradas automaticamente;
validar que nunca ocorram situações como:
chá com lactose;
lasanha sabor chocolate;
leite em gramas;
azeite em gramas;
duas respostas corretas;
nenhuma resposta correta;
produtos incompatíveis;
repetição excessiva da mesma pergunta.
Antes de iniciar a Fase 2
Quando a F1.3 estiver concluída, me entregue:
arquitetura final do gerador;
tipos de questões implementados;
regras de validação;
cobertura dos testes;
exemplos reais de questões geradas automaticamente;
confirmação de que todo o exercício já utiliza o novo gerador, e não mais o sistema antigo.
Somente depois dessa validação iniciaremos a Fase 2.

## 02/08/2026 09:11
continue

## 02/08/2026 09:50
e ai onde paramos?

## 02/08/2026 09:52
dei uma olhada agora e parece que está ok, não testei ela inteira, mas pare ok! podemos ir para fase 2

## 02/08/2026 14:04
PARE antes de qualquer coisa. O repositório mudou por fora desta sessão, em outra
sessão do Claude Code, enquanto você estava parada. Seu contexto está desatualizado.

PRIMEIRO, sem alterar nada, rode e me mostre:

  git status --porcelain
  git log --oneline -6
  git stash list

Se `git status` mostrar arquivos modificados, NÃO faça pull nem commit ainda — me
mostre o que é primeiro. Pode ser trabalho seu que se perde ou conflita.

SEGUNDO, sincronize:

  git pull --ff-only origin main

Se recusar (não for fast-forward), PARE e me avise em vez de forçar.

O QUE MUDOU (5 commits, de fc08b2d até 4e1b3b4, tudo já em produção):

  e37ddef  v2.65.2  fix: progressão do Focus Agentes entre sessões
  d4734b1  v2.65.3  fix: teto de difficulty vai a 13 no banco e no schema
  a473852  docs: registra a estreia do ciclo Codex
  bd70748  docs: poda das listas de dívida técnica
  4e1b3b4  docs: próximo passo do Focus (CORR-021, ARQ-010)

TRÊS COISAS QUE MUDAM COMO VOCÊ TRABALHA A PARTIR DE AGORA:

1. O BANCO DE PRODUÇÃO FOI ALTERADO. A CHECK `session_difficulty_range` foi ampliada
   de 1-10 para 1-13. O `sessionSchema` em `app/api/sessions/route.ts:18` acompanhou
   (`max(13)`). Esses dois valores TÊM que casar — mexer num sem o outro cria defeito
   silencioso: o código passa nos testes e só quebra com paciente real de alto
   desempenho, que perde a sessão. Detalhes e SQL de reversão em
   `RUNBOOK-OPERACIONAL.md`, seção SCHEMA-02.

2. `docs/DIVIDA-TECNICA.md` FOI PODADO contra o código. Antes ele listava 28 itens já
   resolvidos como se fossem pendentes — isso fez a outra sessão propor duas tarefas
   que já estavam feitas. Agora as listas P1/P2/P3 têm só o que está realmente
   pendente (P1 está vazia), e há uma seção de histórico com os resolvidos e a
   evidência de cada um. AINDA ASSIM: confira no código antes de agir sobre qualquer
   item. A foto envelhece.

3. ARQUIVO NOVO: `lib/focus/progression.ts` (+ teste). É onde vive a conversão entre o
   passo interno do Focus Agentes (0-12) e o nível persistido (1-13), mais a montagem
   do metadata. Se for mexer no Focus, é por aí — não replique essa lógica no
   componente.

DEPOIS DE SINCRONIZAR, confirme que está são:

  npx tsc --noEmit          # espera-se exit 0
  npx vitest run            # espera-se 231 testes / 18 arquivos, todos passando

Se der número diferente de 231/18, me avise antes de continuar.

O QUE ESTÁ EM ABERTO E É CANDIDATO AO PRÓXIMO TRABALHO — está no PROGRESSO.md, na
seção de 02/ago/2026:

  CORR-021 (P2) — o conserto do Focus ficou pela metade. O nível agora é salvo e
  restaurado, mas `calculateFocusProgression` (lib/adaptive.ts:149-151) trava em 9
  enquanto o exercício tem 13 passos: os quatro últimos nunca se consolidam entre
  sessões.

Não comece nada antes de me mostrar a saída dos comandos acima.

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

## 02/08/2026 15:28
perfeito, pode seguir

## 02/08/2026 15:46
<task-notification>
<task-id>bnjwxw7u2</task-id>
<tool-use-id>toolu_01RmG7jD1dzobetVBEb6mmLR</tool-use-id>
<output-file>/private/tmp/claude-501/-Users-kamyllahonorio-neuropeak/3e6ecf11-e4e5-471f-bbf9-4595faa53598/tasks/bnjwxw7u2.output</output-file>
<status>completed</status>
<summary>Background command "Disparar o Codex sol" completed (exit code 0)</summary>
</task-notification>

## 02/08/2026 16:10
onde estamos?

## 02/08/2026 16:12
eu quero que vc faça tudo para quando eu testar, testar tudo pode ser?

## 02/08/2026 17:21
onde paramos?

## 02/08/2026 17:23
Ok! o ideal é esperar isso terminar para prosseguirmos para a proxima etapa?

## 02/08/2026 17:25
eu queria mandar comando de outra coisa do programa! Mas nao sei se esperamos vc concluir isso

## 02/08/2026 17:30
Analise integralmente este projeto antes de modificar qualquer arquivo.

Estamos reorganizando o sistema de criação de planos de treinamento cognitivo da área do terapeuta. Neste primeiro momento, NÃO implemente mudanças, NÃO altere componentes, NÃO faça refatorações e NÃO apague nenhuma lógica existente.

Sua tarefa agora é realizar uma auditoria técnica e funcional completa do sistema atual e produzir uma proposta estruturada para análise conjunta.

CONTEXTO CLÍNICO E FUNCIONAL

O aplicativo possui uma área do terapeuta na qual o profissional cria um plano de treinamento para cada paciente.

O terapeuta define:

1. A duração total prevista de cada sessão:
   - 20 minutos;
   - 30 minutos;
   - 40 minutos.

2. A frequência semanal:
   - 1 vez por semana;
   - 2 vezes por semana;
   - 3 vezes por semana;
   - 4 vezes por semana;
   - 5 vezes por semana.

3. Os exercícios que farão parte do plano.

4. Quando clinicamente necessário, alguns parâmetros específicos de determinados exercícios.

O paciente posteriormente define, junto ao terapeuta, os dias da semana em que realizará o treino. Exemplo:

- duração da sessão: 30 minutos;
- frequência: 3 vezes por semana;
- dias: segunda-feira, quarta-feira e sexta-feira.

O nível dos exercícios é adaptativo. O paciente deve sempre retomar do ponto em que parou ou, quando a regra adaptativa indicar, de um nível imediatamente anterior. Não deve existir para o paciente a escolha entre “continuar” e “recomeçar”.

PROBLEMA ATUAL

Atualmente, alguns exercícios possuem configuração por quantidade de tentativas, como:

- 10 tentativas;
- 15 tentativas;
- 20 tentativas;
- 30 tentativas.

Essa lógica não parece adequada para todos os exercícios.

O número de tentativas não representa uma dose cognitiva equivalente entre pacientes, pois:

- um paciente pode completar 10 tentativas rapidamente;
- outro pode levar muito mais tempo para completar as mesmas 10 tentativas;
- exercícios de planejamento exigem tempo para análise, elaboração de estratégia e execução;
- exercícios rápidos e repetitivos podem gerar muitas tentativas em poucos minutos;
- exercícios intensos, como tarefas semelhantes ao Stroop, podem gerar fadiga se permanecerem ativos por muito tempo.

Precisamos substituir a lógica genérica de “tentativas” por uma arquitetura que considere a natureza de cada exercício.

HIPÓTESE DE NOVA ARQUITETURA

Inicialmente, considere três modelos principais de execução.

MODELO A — EXERCÍCIOS CONTÍNUOS

São exercícios compostos por várias rodadas curtas e que podem ser encerrados entre uma rodada e outra sem prejudicar a atividade.

Possíveis exemplos:

- atenção seletiva;
- atenção sustentada;
- velocidade de processamento;
- memória visual;
- memória operacional;
- vigilância;
- tarefas de busca visual;
- tarefas de comparação rápida;
- spans auditivos, caso a análise técnica e clínica indique que pertencem a esta categoria.

Controle sugerido:

- duração por tempo;
- valores configuráveis dentro de uma faixa segura;
- o exercício não deve encerrar no meio de uma rodada;
- ao atingir o tempo, deve concluir a rodada atual e então finalizar.

MODELO B — EXERCÍCIOS DE RESOLUÇÃO OU PLANEJAMENTO

São exercícios em que o paciente precisa analisar um problema e concluir um desafio completo.

Possíveis exemplos:

- Torre de Hanói;
- Estacionamento Lógico;
- labirintos;
- quebra-cabeças;
- exercícios de planejamento de atividades;
- outros exercícios que não devem ser interrompidos no meio de uma solução.

Controle sugerido:

- janela de execução por tempo, por exemplo 8, 10, 12 ou 15 minutos;
- quando o tempo for atingido, não iniciar um novo desafio;
- permitir que o paciente finalize o desafio em andamento;
- registrar separadamente:
  - tempo total;
  - número de desafios iniciados;
  - número de desafios concluídos;
  - número de movimentos;
  - eficiência;
  - erros;
  - desistências;
  - tempo de planejamento;
  - tempo de execução, quando tecnicamente possível.

MODELO C — EXERCÍCIOS FECHADOS OU DE ALTA FADIGA

São exercícios que devem possuir uma dose fixa ou uma faixa bastante restrita, pois uma duração longa pode gerar fadiga, automatização excessiva ou perda de qualidade.

Possíveis exemplos:

- Cores e Palavras, semelhante ao Stroop;
- exercícios com alternância intensa de regra;
- tarefas de forte interferência;
- outros exercícios com carga elevada por minuto.

Controle sugerido:

- duração fixa definida pelo próprio exercício;
- ou pequena faixa configurável;
- o terapeuta apenas inclui ou não inclui o exercício;
- evitar exposição excessiva.

IMPORTANTE

Essas categorias ainda são hipóteses. Você deve analisar cada exercício existente no código e determinar se essa classificação é adequada.

Não force todos os exercícios em apenas três categorias caso o projeto demonstre a necessidade de uma quarta categoria.

Uma possível quarta categoria seria:

MODELO D — EXERCÍCIOS POR BLOCO OU PROTOCOLO

Exercícios que só fazem sentido quando executados como um conjunto fechado de blocos, listas, sequências ou etapas.

Exemplos possíveis:

- determinados spans;
- tarefas com número mínimo de séries necessário para adaptação;
- exercícios cujo algoritmo depende de um bloco fechado para calcular progressão.

Caso identifique essa necessidade, explique claramente quais exercícios pertencem a essa categoria e por quê.

CARGA COGNITIVA

Também precisamos criar um sistema de classificação da carga cognitiva de cada exercício.

Não use uma classificação arbitrária baseada apenas na aparência do exercício.

Analise, para cada treino:

- domínio cognitivo principal;
- domínios cognitivos secundários;
- intensidade cognitiva por minuto;
- quantidade de interferência;
- demanda de memória operacional;
- demanda atencional;
- velocidade exigida;
- necessidade de planejamento;
- necessidade de inibição;
- necessidade de alternância de regra;
- fadiga provável;
- carga visual;
- carga auditiva;
- carga motora;
- complexidade das instruções;
- possibilidade de frustração;
- tempo esperado para adaptação;
- adequação para uso consecutivo com outros exercícios.

Proponha uma escala de carga simples, compreensível para o sistema e para o terapeuta.

Preferência inicial:

- carga 1: baixa;
- carga 2: moderada;
- carga 3: alta.

Entretanto, analise se uma escala de 1 a 5 seria tecnicamente mais útil. Não escolha cinco níveis apenas para parecer mais detalhado. Escolha a escala que realmente apresentar melhor utilidade clínica e computacional.

A classificação de carga deve poder ajudar o sistema a evitar sessões como:

- três exercícios de alta interferência seguidos;
- dois exercícios auditivos intensos consecutivos;
- excesso de tarefas de velocidade;
- excesso de tarefas longas de planejamento;
- sessão inteira concentrada no mesmo domínio;
- duração total incompatível com a prescrição.

A carga não deve impedir o terapeuta de montar o plano. Ela deve inicialmente:

- informar;
- alertar;
- sugerir redistribuições;
- indicar possíveis excessos;
- nunca substituir automaticamente a decisão clínica sem autorização.

DURAÇÃO DOS EXERCÍCIOS

Analise o “~7 min” atualmente mostrado nos cards dos exercícios.

Não remova automaticamente essa informação.

Determine de onde esse valor é obtido atualmente:

- valor fixo;
- estimativa estática;
- parâmetro do exercício;
- cálculo baseado em tentativas;
- texto hardcoded;
- configuração do terapeuta;
- outro mecanismo.

A proposta futura deverá distinguir:

1. Exercício ainda não configurado:
   - mostrar uma faixa recomendada real, por exemplo “3–6 min”;
   - ou “duração fixa: 4 min”;
   - ou “até 12 min”.

2. Exercício configurado:
   - mostrar a duração efetivamente prescrita, por exemplo “5 min”.

3. Exercício de planejamento:
   - mostrar “até 12 min”;
   - o exercício encerra após a conclusão do desafio em andamento.

4. Exercício fechado:
   - mostrar “duração fixa: 4 min”.

5. Exercício por bloco:
   - mostrar uma estimativa, como “aprox. 5–7 min”, caso o tempo dependa do desempenho.

O tempo total estimado do plano deve ser calculado com base nas configurações reais e não por uma estimativa genérica de 7 minutos para todos os exercícios.

SESSÃO DE 20, 30 OU 40 MINUTOS

Analise como o sistema atualmente lida com o total da sessão.

Precisamos evitar dois problemas:

1. O terapeuta selecionar exercícios cuja soma ultrapasse excessivamente a duração da sessão.

2. O terapeuta selecionar poucos exercícios, deixando uma sessão muito abaixo da duração prescrita.

A proposta deve considerar:

- duração-alvo da sessão;
- tolerância aceitável de diferença;
- exercícios que podem ultrapassar alguns minutos porque o paciente precisa concluir a rodada ou desafio;
- exercícios com tempo fixo;
- exercícios com tempo estimado;
- intervalos ou transições entre exercícios;
- possibilidade de o paciente ser muito rápido ou muito lento;
- limite máximo seguro de duração real.

Avalie se devemos trabalhar com:

- duração-alvo;
- duração mínima estimada;
- duração máxima estimada;
- margem operacional;
- tempo de transição.

Exemplo conceitual:

- sessão prescrita: 30 minutos;
- duração-base dos exercícios: 28 minutos;
- margem operacional: 2 a 4 minutos;
- limite esperado: aproximadamente 30 a 34 minutos.

Não adote esses números sem analisar. Eles são apenas um exemplo.

NÍVEL INICIAL E ADAPTAÇÃO

Na interface atual existe um controle “Nível inicial”, aparentemente de 1 a 10.

Analise:

- como o nível inicial é salvo;
- como o nível atual do paciente é salvo;
- como ocorre subida e descida;
- quais exercícios usam escala de 1 a 10;
- quais possuem outra estrutura;
- se há inconsistências;
- se o terapeuta realmente precisa escolher numericamente o nível;
- se a seleção do nível inicial interfere na retomada posterior.

Princípios que devem ser preservados:

- o paciente não deve escolher reiniciar;
- o paciente retoma automaticamente de onde parou;
- quando a regra adaptativa determinar, pode retomar um nível abaixo;
- o terapeuta pode precisar definir o ponto inicial apenas na primeira prescrição ou após uma reavaliação;
- qualquer redefinição de nível precisa ser uma ação explícita do terapeuta;
- não apagar o histórico do paciente sem confirmação.

Não implemente ainda a sugestão de “muito fácil, fácil, médio, difícil e muito difícil”. Apenas avalie se isso seria melhor do que números e explique as vantagens e limitações.

REPETIÇÃO DE ÁUDIO

Nos exercícios auditivos existe uma opção “Repetir áudio: Sim/Não”.

Analise:

- em quais exercícios essa opção existe;
- como funciona;
- se repetir o áudio altera substancialmente a carga cognitiva;
- se a repetição deve ser uma configuração clínica;
- se deveria existir limite de repetição;
- se a repetição deveria contar como ajuda;
- se deveria interferir na progressão;
- se deveria ser liberada apenas em determinados perfis ou fases;
- se o exercício deixa de medir/treinar o mesmo construto quando há repetição livre.

Não altere essa função ainda. Apresente uma recomendação fundamentada na lógica do treino.

ENTREGÁVEIS OBRIGATÓRIOS

Crie uma pasta de documentação, caso ainda não exista:

docs/auditoria-plano-terapeutico/

Dentro dela, crie os seguintes arquivos, sem alterar o funcionamento do aplicativo:

1. docs/auditoria-plano-terapeutico/01-estado-atual.md

Deve conter:

- localização dos arquivos responsáveis pela tela;
- componentes envolvidos;
- stores, contexts, hooks, services, banco ou estado persistente;
- funcionamento atual da seleção de duração;
- funcionamento atual da frequência semanal;
- funcionamento atual das tentativas;
- funcionamento atual dos níveis;
- funcionamento atual do tempo estimado;
- funcionamento atual do cálculo do total;
- funcionamento atual da progressão e retomada;
- inconsistências encontradas;
- trechos ou referências de código relevantes, sempre com caminho e função.

2. docs/auditoria-plano-terapeutico/02-inventario-exercicios.md

Crie uma tabela completa com TODOS os exercícios encontrados no projeto, contendo no mínimo:

- ID interno;
- nome exibido;
- arquivo principal;
- domínio cognitivo principal;
- domínios secundários;
- duração atualmente exibida;
- como termina atualmente;
- possui tentativas?;
- possui tempo?;
- possui blocos?;
- possui configuração própria?;
- possui progressão adaptativa?;
- possui retomada?;
- possui áudio?;
- permite repetir áudio?;
- métricas registradas atualmente;
- problemas encontrados.

Não omita exercícios.

3. docs/auditoria-plano-terapeutico/03-proposta-classificacao.md

Para cada exercício, proponha:

- modelo de execução:
  - contínuo;
  - resolução/planejamento;
  - fechado/alta fadiga;
  - bloco/protocolo;
  - outro, se necessário;

- justificativa;
- duração mínima recomendada;
- duração padrão recomendada;
- duração máxima recomendada;
- possibilidade de configuração pelo terapeuta;
- comportamento ao atingir o tempo;
- métricas mínimas;
- carga cognitiva sugerida;
- fatores que aumentam ou reduzem a carga;
- exercícios que não deveriam vir imediatamente antes ou depois;
- observações clínicas e técnicas.

4. docs/auditoria-plano-terapeutico/04-proposta-carga-cognitiva.md

Deve conter:

- escala recomendada;
- critérios objetivos;
- fórmula ou sistema de pontuação, se fizer sentido;
- diferença entre carga basal do exercício e carga dinâmica do nível;
- como considerar dificuldade, velocidade e interferência;
- como calcular carga estimada da sessão;
- como gerar alertas sem bloquear a autonomia do terapeuta;
- exemplos de sessões equilibradas;
- exemplos de sessões excessivas;
- limitações da classificação;
- quais decisões ainda exigem validação clínica humana.

Considere que um mesmo exercício pode mudar de carga conforme:

- nível;
- velocidade;
- quantidade de estímulos;
- semelhança entre alvo e distratores;
- tamanho da sequência;
- quantidade de regras;
- presença de dupla tarefa;
- tempo de exposição;
- repetição de áudio;
- limite de resposta.

Portanto, diferencie:

- carga basal do exercício;
- modificadores de carga;
- carga estimada na configuração atual.

5. docs/auditoria-plano-terapeutico/05-proposta-interface.md

Descreva, sem implementar:

- como deveria ficar cada card;
- quais controles devem permanecer;
- quais devem ser removidos;
- quais devem mudar;
- como mostrar duração;
- como mostrar carga;
- como mostrar nível;
- como mostrar retomada automática;
- como mostrar exercícios fixos;
- como mostrar exercícios configuráveis;
- como mostrar exercícios de planejamento;
- como calcular e exibir o total da sessão;
- alertas de sessão curta;
- alertas de sessão excessiva;
- alertas de carga;
- comportamento do botão “Ajustar”;
- como evitar excesso de informações visuais;
- proposta para desktop e responsividade.

A interface deve continuar clínica, discreta e profissional. Não transformar em interface gamificada.

6. docs/auditoria-plano-terapeutico/06-modelo-de-dados.md

Proponha uma estrutura futura de dados, sem implementá-la ainda.

Inclua uma interface TypeScript conceitual para algo semelhante a:

- ExerciseDefinition;
- ExercisePrescription;
- ExerciseExecutionModel;
- ExerciseDurationPolicy;
- CognitiveLoadProfile;
- SessionPrescription;
- PatientExerciseProgress;
- ExerciseCompletionPolicy.

A estrutura deve separar claramente:

- definição global do exercício;
- prescrição feita pelo terapeuta;
- progresso individual do paciente;
- estado da sessão;
- métricas de execução;
- histórico.

Não misture duração padrão do exercício com duração prescrita para um paciente.

7. docs/auditoria-plano-terapeutico/07-riscos-e-migracao.md

Identifique:

- risco de quebrar planos já salvos;
- risco de perder progresso;
- risco de incompatibilidade com dados antigos;
- risco de duração incorreta;
- risco de exercícios não encerrarem;
- risco de loops;
- risco de interromper uma atividade no meio;
- risco de alterações no cálculo de progressão;
- necessidade de migração de dados;
- necessidade de fallback;
- necessidade de feature flag;
- testes necessários;
- ordem segura de implementação.

8. docs/auditoria-plano-terapeutico/08-decisoes-pendentes.md

Liste todas as decisões que precisam ser validadas comigo antes da implementação.

Organize por prioridade:

- bloqueante;
- importante;
- refinamento posterior.

Não tome decisões clínicas silenciosamente.

RELATÓRIO NO TERMINAL

Ao terminar a análise, mostre no terminal um resumo claro contendo:

1. Quantos exercícios foram encontrados.
2. Quantos foram classificados em cada modelo.
3. Quais exercícios ainda ficaram ambíguos.
4. Quais usam tentativas atualmente.
5. Quais usam tempo.
6. Quais possuem duração hardcoded.
7. Quais não possuem encerramento seguro.
8. Quais apresentam risco para retomada automática.
9. Qual escala de carga você recomenda.
10. Quais são as 10 decisões mais importantes que precisamos revisar juntos.

Também mostre uma tabela resumida com as colunas:

- exercício;
- modelo atual;
- modelo recomendado;
- duração recomendada;
- carga basal;
- configuração pelo terapeuta;
- principal problema.

REGRAS DE SEGURANÇA DESTA ETAPA

- Não modificar a aplicação.
- Não alterar banco de dados.
- Não alterar migrations.
- Não remover configurações atuais.
- Não substituir “tentativas” ainda.
- Não alterar os exercícios.
- Não mudar algoritmos adaptativos.
- Não mudar progressão.
- Não mudar retomada.
- Não instalar dependências.
- Não executar comandos destrutivos.
- Não criar commit.
- Não fazer push.
- Apenas analisar e criar os documentos solicitados.

Caso seja necessário executar o projeto para compreender o funcionamento, pode executar apenas comandos não destrutivos.

Se encontrar testes existentes, pode executá-los, mas não corrija nada nesta etapa.

CRITÉRIO DE QUALIDADE

Não faça uma análise superficial baseada apenas nos nomes dos arquivos.

Inspecione:

- componentes;
- rotas;
- configurações;
- definições dos exercícios;
- engines;
- hooks;
- estados;
- persistência;
- banco;
- APIs;
- callbacks de conclusão;
- temporizadores;
- controle de rodadas;
- progressão adaptativa;
- retomada;
- cálculo de duração;
- cálculo do plano.

Ao final, pare e aguarde nossa validação.

Não implemente a proposta até receber uma autorização explícita.

## 02/08/2026 17:44
perfeito! vai me avisando o que esta azendo

## 02/08/2026 17:51
me avisa quando terminar

## 02/08/2026 18:19
ok, continua

## 02/08/2026 18:32
pode continuar tudo que vc precisa fazer

## 02/08/2026 18:42
pronto! agora voltamos para aquele comando que passei depois do focus ne?

## 02/08/2026 18:59
Antes de continuar a auditoria de carga, duração e modelos de execução, precisamos corrigir o inventário real das atividades.

NÃO implemente mudanças ainda.

NÃO altere código, banco, migrations, interface, progressão, duração ou exercícios.

Sua tarefa agora é verificar quais atividades são realmente ativas e disponíveis no aplicativo atualmente, separar aliases e modalidades e corrigir os nomes exibidos.

PROBLEMA IDENTIFICADO

A auditoria anterior encontrou 41 definições em EXERCISE_DEFINITIONS, porém a interface atual do aplicativo mostra 34 atividades clínicas.

Isso indica que as 41 definições podem incluir:

- aliases;
- variantes auditivas;
- IDs técnicos antigos;
- duplicações;
- exercícios inativos;
- exercícios em construção;
- exercícios concluídos, mas não disponíveis;
- nomes técnicos diferentes do nome exibido;
- rotas ou componentes sem entrada real no catálogo.

Antes de analisar carga cognitiva, duração ou protocolo, precisamos estabelecer uma fonte de verdade.

ATIVIDADES QUE APARECEM ATUALMENTE NA INTERFACE

Use esta lista como referência visual inicial, mas confirme tudo no código:

1. Span Numérico Auditivo Direto
2. Cores e Palavras
3. Focus Agents
4. Span Numérico Auditivo Inverso
5. Matriz Espacial
6. Matriz Espacial Inversa
7. Jogo da Memória
8. Conecta Números
9. Caminhos para a Meta
10. Informação em Foco
11. Rastreamento de Objetos
12. Dupla Tarefa
13. Tempo de Reação
14. Certo ou Errado
15. Semáforo
16. Busca Rápida
17. Jogo das Torres
18. Labirinto
19. Ordem da História
20. Compra Multifuncional
21. Task Switching
22. Grade Dedutiva
23. Letras em Sequência
24. Sequência de Itens
25. Matriz com Rotações
26. Lista com Distração
27. Restaurante
28. Supermercado
29. N-Back
30. Cubos
31. Vigilância
32. Identificação de Símbolos
33. Estacionamento Lógico
34. Investigadores da Situação Social

OBJETIVO PRINCIPAL

Descobrir com precisão:

- quais são as atividades clínicas reais;
- quais estão efetivamente ativas;
- quais aparecem para terapeuta;
- quais aparecem para paciente;
- quais são apenas aliases;
- quais são modalidades da mesma atividade;
- quais são componentes antigos;
- quais estão em construção;
- quais estão desativadas;
- quais possuem nomes técnicos diferentes dos nomes exibidos;
- quais definições anteriores não deveriam ter sido contadas como exercícios independentes.

NÃO CONSIDERE ALIAS COMO EXERCÍCIO INDEPENDENTE

Exemplos da auditoria anterior:

- focus-agents-auditivo;
- matriz-espacial-inversa tratada como alias;
- restaurante-ordem-auditivo;
- desafio-supermercado-auditivo;
- informação-em-foco;
- mudança-regras.

Verifique cuidadosamente se cada item é:

1. atividade clínica independente;
2. modalidade de uma atividade;
3. alias de rota;
4. componente reaproveitado;
5. definição antiga;
6. atividade efetivamente separada.

Uma modalidade auditiva ou visual não deve ser automaticamente contabilizada como um exercício novo.

NOMES OFICIAIS

Para cada atividade, identifique:

- ID técnico;
- nome exibido atual;
- nome correto desejado;
- rota;
- componente principal;
- status;
- categoria exibida;
- descrição exibida;
- ícone;
- aliases relacionados.

Não altere os nomes ainda.

Apenas marque divergências como:

- nome técnico diferente, mas aceitável;
- nome exibido incorreto;
- nome antigo;
- duplicação;
- tradução inconsistente;
- nome provisório;
- categoria possivelmente incorreta;
- descrição possivelmente incorreta.

STATUS OBRIGATÓRIOS

Classifique cada definição encontrada como uma destas opções:

- ACTIVE_CLINICAL_EXERCISE
- ACTIVE_EXERCISE_MODE
- ACTIVE_ALIAS
- IN_DEVELOPMENT
- INACTIVE
- LEGACY
- ORPHANED
- UNKNOWN

Definições classificadas como ACTIVE_EXERCISE_MODE ou ACTIVE_ALIAS não entram na contagem de exercícios clínicos.

MODALIDADES VISUAL E AUDITIVA

Precisamos distinguir dois conceitos diferentes.

CONCEITO 1 — MODALIDADE DA ATIVIDADE

A modalidade altera a forma cognitiva de apresentação da tarefa.

Exemplos:

- Visual;
- Visual + áudio;
- Somente áudio.

Atualmente, visualmente confirmamos essa escolha em:

- Restaurante;
- Supermercado.

Também deveria existir, conforme decisão clínica, em:

- Focus Agents;
- Compra Multifuncional.

Audite cada exercício e informe se possui ou deveria possuir:

- somente visual;
- visual + áudio;
- somente áudio;
- nenhuma escolha de modalidade.

Não implemente ainda.

Para cada exercício, explique se mudar a modalidade altera:

- o construto treinado;
- a carga cognitiva;
- a memória operacional;
- a demanda de leitura;
- a demanda auditiva;
- a dificuldade;
- a progressão;
- o registro de desempenho.

Não trate automaticamente “visual + áudio” como mais difícil. Em alguns pacientes, o áudio pode facilitar; em outros, pode aumentar interferência.

CONCEITO 2 — LEITURA ASSISTIVA

Existe um botão de som durante as atividades que pode ler o texto apresentado.

Essa função NÃO é uma modalidade do exercício.

Ela é um recurso de acessibilidade para ler:

- instruções;
- comandos;
- perguntas;
- alternativas;
- textos auxiliares;
- feedback, quando apropriado.

Audite:

- em quais exercícios o botão já existe;
- quais textos ele lê;
- qual mecanismo de voz é usado;
- se utiliza speechSynthesis, áudio gravado ou outro mecanismo;
- se a leitura pode ser repetida;
- se há limitação;
- se o uso é registrado;
- se interfere na progressão;
- se o botão aparece mesmo em exercícios sem texto;
- se a leitura continua quando a tela muda;
- se existe cancelamento da fala;
- se há sobreposição de áudios;
- se o paciente pode clicar várias vezes;
- se o componente é global ou duplicado por exercício.

A leitura assistiva deve ser planejada futuramente para todos os exercícios que contenham texto relevante, sem transformar a atividade em modalidade auditiva.

EXEMPLO DA DIFERENÇA

Supermercado — modo Somente áudio:
- a lista deve ser memorizada auditivamente;
- a modalidade faz parte da tarefa;
- deve afetar classificação, carga e métricas.

Supermercado — botão de leitura assistiva:
- o sistema apenas lê uma instrução ou texto visível;
- é acessibilidade;
- não deve automaticamente transformar o exercício em auditivo.

Essa distinção deve aparecer na arquitetura e no modelo de dados.

AUDITORIA DA LISTA DE 41 DEFINIÇÕES

Para cada uma das 41 definições encontradas anteriormente, mostre:

- ID;
- nome;
- componente;
- rota;
- aparece no catálogo?;
- aparece no plano terapêutico?;
- aparece para o paciente?;
- possui execução funcional?;
- possui histórico?;
- possui progressão?;
- é atividade independente?;
- é alias?;
- é modalidade?;
- status final;
- exercício clínico principal ao qual pertence;
- justificativa.

Depois, apresente a contagem corrigida:

- número de atividades clínicas ativas;
- número de modalidades;
- número de aliases;
- número em desenvolvimento;
- número inativo;
- número legado;
- número órfão;
- número desconhecido.

CONFIRME A LISTA VISUAL DE 34

Compare as 34 atividades fornecidas com o código e responda:

1. Todas as 34 existem e estão ativas?
2. Alguma está apenas visualmente listada, mas sem execução funcional?
3. Alguma atividade ativa não aparece nos prints?
4. Alguma das 41 definições deveria entrar como uma 35ª atividade?
5. Alguma das 34 é apenas modalidade ou alias e não atividade real?
6. Alguma aparece com nome incorreto?
7. Alguma aparece na categoria cognitiva errada?
8. Alguma descrição exibida não corresponde ao exercício real?

ARQUIVOS A CRIAR

Crie:

docs/auditoria-plano-terapeutico/13-inventario-real-atividades.md

Inclua a tabela completa das definições técnicas e seus status.

Crie:

docs/auditoria-plano-terapeutico/14-nomes-oficiais.md

Inclua:

- nome técnico;
- nome atual;
- nome correto recomendado;
- justificativa;
- alteração necessária ou não.

Crie:

docs/auditoria-plano-terapeutico/15-modalidades-e-acessibilidade.md

Inclua:

- modalidades por exercício;
- diferenças entre modalidade e leitura assistiva;
- exercícios com visual;
- exercícios com visual + áudio;
- exercícios com somente áudio;
- exercícios que deveriam receber essas opções;
- presença atual do botão de leitura;
- arquitetura atual;
- proposta futura de componente global de leitura assistiva;
- riscos cognitivos e técnicos;
- decisões clínicas pendentes.

Crie:

docs/auditoria-plano-terapeutico/16-lista-canonica.md

Esse arquivo deve apresentar uma lista canônica provisória das atividades clínicas reais, com:

- canonicalExerciseId;
- nome oficial;
- status;
- categoria;
- modalidades;
- aliases;
- componente;
- rota;
- aparece para terapeuta;
- aparece para paciente.

Não altere ainda EXERCISE_DEFINITIONS.

RELATÓRIO NO TERMINAL

Ao final, mostre:

1. Quantidade corrigida de exercícios clínicos ativos.
2. Lista completa dos nomes oficiais.
3. Quais das 41 definições não são exercícios independentes.
4. Quais exercícios aparecem nos prints, mas possuem problema técnico.
5. Quais exercícios ativos estavam ausentes dos prints.
6. Quais nomes estão incorretos.
7. Quais categorias estão incorretas.
8. Quais descrições estão incorretas.
9. Quais possuem seleção real de modalidade.
10. Quais deveriam possuir seleção de modalidade.
11. Quais possuem leitura assistiva.
12. Quais não possuem, mas contêm texto que deveria poder ser lido.
13. Diferenças entre a contagem anterior de 41 e a contagem clínica real.

REGRAS

- Não implementar.
- Não corrigir nomes.
- Não mudar catálogo.
- Não mudar rotas.
- Não remover aliases.
- Não adicionar áudio.
- Não alterar progressão.
- Não alterar banco.
- Não criar migration.
- Não instalar dependências.
- Não fazer commit.
- Não fazer push.
- Apenas analisar, documentar e relatar.

Ao terminar, pare e aguarde nossa validação.

## 02/08/2026 19:13
manda aqui tudo

## 02/08/2026 19:18
salve tudo pois irei trocar de conta para continuarmos desse mesmo lugar

## 02/08/2026 19:22
continuando então

## 02/08/2026 19:23
Confirmando a decisão clínica:

Os exercícios Span Numérico Auditivo Direto e Span Numérico Auditivo Inverso já são auditivos por definição. O áudio é intrínseco e obrigatório na mecânica desses exercícios.

Portanto:

- não criar seletor de modalidade para os spans;
- não propor versão visual;
- não propor versão visual + áudio;
- não tratá-los como “só visual” na documentação.

Classificação correta dos dois spans:

- modalidade configurável: não;
- canal sensorial intrínseco: auditivo;
- áudio intrínseco à tarefa: sim;
- leitura assistiva: apenas para textos instrucionais, separada do áudio dos números.

A seleção Visual / Visual + áudio / Somente áudio continua restrita exclusivamente a:

1. Restaurante;
2. Supermercado;
3. Caminhos para a Meta;
4. Agentes Focus;
5. Compra Multifuncional.

Nenhum outro exercício deverá receber esse seletor sem nova decisão clínica explícita.

Corrija somente a documentação e prossiga com a auditoria considerando essa regra.

## 02/08/2026 19:29
Vamos consolidar definitivamente o catálogo de exercícios antes de iniciar a implementação da nova arquitetura.

A partir deste momento, considere como fonte única de verdade apenas os exercícios clínicos ativos.

DECISÕES DEFINITIVAS

1. O catálogo oficial possui exatamente 34 exercícios clínicos.

2. Remova do catálogo canônico qualquer:
- alias;
- modo separado;
- definição histórica;
- exercício órfão;
- exercício legado;
- exercício descontinuado.

3. O exercício `desafio-cidade` NÃO fará mais parte da arquitetura atual.

Ele será completamente reformulado futuramente como um novo exercício.

Portanto:

- remover da lista canônica;
- remover das contagens;
- remover da documentação da auditoria;
- não utilizá-lo na classificação de carga;
- não utilizá-lo na classificação de duração;
- não utilizá-lo na engine de prescrição;
- não utilizá-lo em exemplos.

Caso exista código relacionado, apenas documente sua localização.

NÃO o remova do código nesta etapa.

Marque-o apenas como:

REMOVED_FROM_CURRENT_CATALOG

Ele será tratado futuramente como um exercício novo.

4. Os aliases antigos também não fazem mais parte da arquitetura conceitual.

Mantenha apenas uma referência técnica, caso ainda existam no código.

Não devem aparecer em:

- inventário;
- documentação clínica;
- classificação;
- tabelas;
- relatórios.

5. A partir deste momento, toda a documentação deverá utilizar exclusivamente os 34 exercícios ativos.

6. Atualize todos os documentos criados anteriormente para remover referências a:

- aliases;
- modos contabilizados como exercícios;
- desafio-cidade;
- exercícios legados.

7. Gere uma lista canônica definitiva contendo apenas:

- ID técnico;
- nome oficial;
- categoria cognitiva;
- domínio principal;
- modalidades (quando existirem);
- status = ACTIVE.

Nenhum outro exercício deve aparecer.

Ao final, apresente apenas:

- lista final dos 34 exercícios;
- confirmação de que não existem mais exercícios legados na documentação;
- confirmação de que todas as próximas análises utilizarão exclusivamente essa lista.

Não implemente alterações no código.
Não remova arquivos do projeto.
Não faça commits.
Apenas limpe a documentação e a arquitetura conceitual. 8. A lista canônica deve manter exatamente os nomes oficiais abaixo.

Esses passam a ser a nomenclatura padrão do projeto.

Qualquer alias, tradução antiga ou nome técnico diferente deverá permanecer apenas internamente quando necessário para compatibilidade, nunca na interface nem na documentação clínica.

Lista oficial:

1. Span Numérico Auditivo Direto
2. Cores e Palavras
3. Agentes Focus
4. Span Numérico Auditivo Inverso
5. Matriz Espacial
6. Matriz Espacial Inversa
7. Jogo da Memória
8. Conecta Números
9. Caminhos para a Meta
10. Informação em Foco
11. Rastreamento de Objetos
12. Dupla Tarefa
13. Tempo de Reação
14. Certo ou Errado
15. Semáforo
16. Busca Rápida
17. Jogo das Torres
18. Labirinto
19. Ordem da História
20. Compra Multifuncional
21. Alternância de Regras
22. Grade Dedutiva
23. Letras em Sequência
24. Sequência de Itens
25. Matriz com Rotações
26. Lista com Distração
27. Restaurante
28. Supermercado
29. N-Back
30. Cubos
31. Vigilância
32. Identificação de Símbolos
33. Estacionamento Lógico
34. Investigadores da Situação Social

9. Atualize toda a documentação criada durante a auditoria para utilizar exclusivamente esses nomes oficiais.

10. Caso algum ID técnico utilize outro nome, mantenha o ID apenas por compatibilidade interna, mas utilize sempre o nome oficial em:

- documentação;
- relatórios;
- tabelas;
- classificação;
- carga cognitiva;
- duração;
- interface planejada;
- engine de prescrição.

11. Gere ao final uma tabela de correspondência contendo:

- ID técnico;
- Nome oficial;
- Alias antigos (se existirem);
- Status (ACTIVE).

Essa tabela passa a ser a referência oficial do projeto para todos os desenvolvimentos futuros. Dos 34 nomes, só vejo dois que ainda valem uma reflexão antes de "congelar":
Agentes Focus — eu gosto mais do que "Focus Agentes", porque soa natural em português e preserva a marca "Focus".
Alternância de Regras — eu ainda prefiro esse nome a "Task Switching". Na sua mecânica, o paciente alterna regras de resposta (cor, forma, número etc.), não tarefas completamente distintas. Para um paciente, "Alternância de Regras" comunica melhor o que acontece no exercício.
Os outros nomes eu manteria exatamente como estão. E vc está fazendo tudo isso com o opus? vc deveria estar usando o codex nao? pois minha janela caiu de 100% para 69%

## 02/08/2026 19:44
Eu faria apenas um último "cleanup" antes de seguirmos para a arquitetura de carga cognitiva. Esse comando encerra definitivamente a organização do catálogo, padroniza os nomes, remove o legado da documentação clínica e cria um documento canônico que será a referência oficial do projeto.

```text
Estamos encerrando a fase de organização do catálogo de exercícios.

Esta é a última etapa de limpeza antes de iniciarmos a arquitetura de carga cognitiva, duração e engine de prescrição.

NÃO implemente funcionalidades novas.

NÃO altere algoritmos.

NÃO altere progressão.

NÃO altere banco de dados.

NÃO faça migrations.

NÃO altere a interface.

NÃO faça commits automáticos.

Apenas consolide definitivamente a arquitetura documental do catálogo.

==========================================================
1. FONTE ÚNICA DE VERDADE
==========================================================

A partir deste momento existe apenas UMA lista oficial de exercícios.

Ela contém exatamente 34 exercícios clínicos ativos.

Qualquer documentação futura deverá utilizar exclusivamente essa lista.

Não utilizar:

- aliases;
- modos como exercícios;
- exercícios órfãos;
- exercícios legados;
- nomes antigos;
- nomes provisórios.

Esses poderão aparecer apenas em documentação técnica de compatibilidade.

Nunca na documentação clínica.

==========================================================
2. LISTA OFICIAL
==========================================================

Utilize exatamente estes nomes:

1. Span Numérico Auditivo Direto
2. Cores e Palavras
3. Agentes Focus
4. Span Numérico Auditivo Inverso
5. Matriz Espacial
6. Matriz Espacial Inversa
7. Jogo da Memória
8. Conecta Números
9. Caminhos para a Meta
10. Informação em Foco
11. Rastreamento de Objetos
12. Dupla Tarefa
13. Tempo de Reação
14. Certo ou Errado
15. Semáforo
16. Busca Rápida
17. Jogo das Torres
18. Labirinto
19. Ordem da História
20. Compra Multifuncional
21. Alternância de Regras
22. Grade Dedutiva
23. Letras em Sequência
24. Sequência de Itens
25. Matriz com Rotações
26. Lista com Distração
27. Restaurante
28. Supermercado
29. N-Back
30. Cubos
31. Vigilância
32. Identificação de Símbolos
33. Estacionamento Lógico
34. Investigadores da Situação Social

==========================================================
3. PADRONIZAÇÃO DOS NOMES
==========================================================

Substitua em toda a documentação:

Focus Agentes
Focus Agents
→ Agentes Focus

Task Switching
→ Alternância de Regras

Nunca utilizar nomes antigos novamente.

Os IDs técnicos podem permanecer inalterados.

==========================================================
4. JUSTIFICATIVAS DOS NOMES
==========================================================

Crie um documento explicando por que alguns nomes diferem dos IDs internos.

Registrar obrigatoriamente:

Cubos

- ID técnico permanece cubo-corsi.
- O nome exibido é Cubos.
- Não utilizamos "Corsi" porque é o nome de um teste neuropsicológico padronizado.
- O aplicativo é de treinamento cognitivo.

Cores e Palavras

- ID técnico permanece stroop-task.
- O nome exibido é Cores e Palavras.
- Não utilizamos "Stroop" porque esse é o nome de um teste neuropsicológico.

Alternância de Regras

- ID técnico permanece task-switching.
- O paradigma científico é Task Switching.
- O exercício executado pelo paciente consiste na alternância das regras de resposta.
- Portanto "Alternância de Regras" representa melhor o treino.

Agentes Focus

- Mantemos "Focus" como identidade do exercício.
- A nomenclatura oficial passa a ser Agentes Focus.

==========================================================
5. DESAFIO DA CIDADE
==========================================================

O exercício desafio-cidade deixa oficialmente de fazer parte da arquitetura atual.

Não pertence mais ao catálogo.

Não pertence mais à documentação clínica.

Não pertence mais às análises de:

- carga;
- duração;
- prescrição;
- categorias.

Não removê-lo do código.

Apenas classificá-lo como:

REMOVED_FROM_CURRENT_CATALOG

Ele será reconstruído futuramente como um novo exercício.

==========================================================
6. MODALIDADES
==========================================================

Somente estes cinco exercícios possuem modalidade configurável:

- Restaurante
- Supermercado
- Caminhos para a Meta
- Agentes Focus
- Compra Multifuncional

As modalidades possíveis são:

- Visual
- Visual + áudio
- Somente áudio

Nenhum outro exercício poderá receber esse seletor sem nova decisão clínica.

Span Numérico Auditivo Direto e Inverso permanecem:

- auditivos por definição;
- sem seletor de modalidade.

==========================================================
7. LEITURA ASSISTIVA
==========================================================

Registrar definitivamente que:

Leitura assistiva

≠

Modalidade do exercício.

Leitura assistiva é acessibilidade.

Modalidade altera a forma cognitiva de apresentação da tarefa.

Essa distinção deverá permanecer em toda a arquitetura.

==========================================================
8. LEGACY IDS
==========================================================

Substitua o termo "Alias" por:

Legacy IDs

Criar uma única tabela contendo:

- ID técnico;
- Nome oficial;
- Legacy IDs;
- Status.

Os Legacy IDs existirão apenas para compatibilidade.

Nunca deverão aparecer para terapeuta nem paciente.

==========================================================
9. DOCUMENTO CANÔNICO
==========================================================

Criar um novo documento fora da pasta de auditoria:

docs/architecture/CANONICAL_EXERCISES.md

Esse documento passa a ser a Constituição dos exercícios do projeto.

Deve conter:

OBJETIVO

Este documento é a única fonte oficial de exercícios do sistema.

Todos os novos exercícios deverão ser registrados aqui.

Não utilizar nomes técnicos na interface.

Não utilizar Legacy IDs na documentação clínica.

Os IDs técnicos permanecem apenas para compatibilidade.

Qualquer alteração de nome deverá ser aprovada antes da implementação.

Depois incluir a tabela completa contendo:

- ID técnico;
- Nome oficial;
- Categoria;
- Domínio cognitivo principal;
- Modalidade configurável (sim/não);
- Status ACTIVE.

==========================================================
10. LIMPEZA DA DOCUMENTAÇÃO
==========================================================

Atualizar todos os documentos criados anteriormente para utilizar exclusivamente:

- os 34 exercícios oficiais;
- os nomes oficiais;
- a nomenclatura Agentes Focus;
- a nomenclatura Alternância de Regras;
- Legacy IDs em vez de Alias.

Remover da documentação clínica:

- exercícios antigos;
- exercícios órfãos;
- aliases;
- modos tratados como exercícios;
- referências ao desafio-cidade.

==========================================================
11. RELATÓRIO FINAL
==========================================================

Ao terminar apresentar:

1. Confirmação de que existem exatamente 34 exercícios ACTIVE.

2. Confirmação de que toda a documentação utiliza apenas os nomes oficiais.

3. Confirmação de que Focus Agentes, Focus Agents e Task Switching não aparecem mais na documentação clínica.

4. Confirmação de que desafio-cidade foi removido da arquitetura clínica e permanece apenas documentado como REMOVED_FROM_CURRENT_CATALOG.

5. Confirmação de que somente cinco exercícios possuem modalidade configurável.

6. Confirmação de que Legacy IDs aparecem apenas na tabela de compatibilidade.

7. Confirmação de que CANONICAL_EXERCISES.md passa a ser a única fonte oficial do catálogo.

Após isso, considerar encerrada definitivamente a fase de organização do catálogo e aguardar autorização para iniciar a arquitetura de carga cognitiva, duração dos exercícios e engine de prescrição.
```

Esse comando deixa o projeto com uma base arquitetural limpa e consistente antes de partir para a próxima etapa.

## 02/08/2026 20:14
falta muito?

## 02/08/2026 20:50
Pode concluir os três lotes normalmente.
Ao final, antes de qualquer commit ou implementação, apresente a documentação consolidada e um relatório único.
Depois faremos uma revisão clínica global dos 34 exercícios antes de iniciar a fase de carga cognitiva.

## 02/08/2026 21:08
<task-notification>
<task-id>bu3nvlndd</task-id>
<tool-use-id>toolu_01LaHfxvRDmzo5sDvApePqo6</tool-use-id>
<output-file>/private/tmp/claude-501/-Users-kamyllahonorio-neuropeak/3e6ecf11-e4e5-471f-bbf9-4595faa53598/tasks/bu3nvlndd.output</output-file>
<status>completed</status>
<summary>Background command "Aguardar o lote B" completed (exit code 0)</summary>
</task-notification>

## 02/08/2026 22:15
e ai?

## 02/08/2026 22:30
Revendo a Fase 1, acredito que a estrutura principal está correta.

Minha decisão clínica é manter cada exercício organizado pelo seu DOMÍNIO e SUBDOMÍNIO PRINCIPAL, exatamente como está hoje.

Entretanto, reconheço que praticamente todos os exercícios treinam processos cognitivos secundários.

Portanto, não quero mover exercícios entre categorias.

Quero acrescentar um PERFIL COGNITIVO ASSOCIADO para cada exercício.

Exemplo:

- Caminhos para a Meta:
  Principal: Planejamento.
  Associados: Flexibilidade Cognitiva, Memória Operacional e Organização Sequencial.

- Compra Multifuncional:
  Principal: Autonomia.
  Associados: Funções Executivas, Atenção Seletiva, Memória Operacional e Velocidade de Processamento.

- Restaurante:
  Principal: Memória Operacional.
  Associados: Atenção Sustentada, Controle Inibitório e Flexibilidade Cognitiva.

O domínio principal continua sendo o responsável pela organização visual do catálogo.

Os perfis associados servirão para a futura engine de prescrição, cálculo de carga cognitiva e recomendações clínicas.

Ou seja, não quero reorganizar o catálogo. Quero enriquecer o perfil cognitivo de cada exercício.

## 02/08/2026 22:33
Decisões clínicas para aplicar o perfil associado aos 34 exercícios:

==================================================
1. CATALOG DOMAIN × MECHANICAL PRIMARY
==================================================

Aceito a separação entre o domínio usado para organizar o catálogo e o processo predominante identificado na mecânica real.

Manter conceitualmente:

- catalogDomain
- catalogSubdomain
- mechanicalPrimary
- associatedCognitiveProfiles

O catálogo permanece exatamente como está visualmente.

catalogDomain e catalogSubdomain:

- organizam a interface;
- representam a finalidade clínica escolhida para apresentar o exercício;
- não devem ser alterados automaticamente pela análise mecânica.

mechanicalPrimary:

- representa a operação cognitiva predominante exigida pela mecânica atual;
- é informativo;
- deve ser derivado do código real;
- será utilizado como uma das bases da futura análise de carga, duração e prescrição.

Entretanto, a engine não deve utilizar apenas mechanicalPrimary.

Ela deverá futuramente considerar o perfil completo:

- mechanicalPrimary;
- domínios associados;
- intensidade dos domínios finos;
- modificadores do nível;
- modalidade;
- duração;
- interferência;
- pressão temporal.

Portanto, o fato de o terapeuta visualizar um exercício em determinada categoria não obriga a mecânica a ter exatamente o mesmo processo como predominante.

Essa diferença não deve ser tratada como erro por si só.

==================================================
2. CAMINHOS PARA A META
==================================================

Não corrigir artificialmente a matriz atual para incluir Flexibilidade Cognitiva.

A análise atual descreve corretamente a versão que existe hoje:

- organização;
- sequenciamento;
- ordenação temporal;
- monitoramento.

O exercício será reformulado para se tornar um treino efetivo de Planejamento.

Portanto, registrar:

profileStatus: PROVISIONAL_PROFILE

catalogSubdomain:
- Planejamento e Flexibilidade

mechanicalPrimary atual:
- Organização

associatedCognitiveProfiles atuais:
- Organização Sequencial;
- Ordenação Temporal;
- Monitoramento Executivo;
- Memória Operacional, caso sustentado pela matriz.

Não incluir Flexibilidade Cognitiva como associada apenas porque ela está no nome do subdomínio do catálogo.

Flexibilidade Cognitiva só deverá entrar quando a nova mecânica realmente exigir, por exemplo:

- mudança de estratégia;
- revisão do plano após nova informação;
- existência de mais de uma rota possível;
- adaptação diante de impedimentos;
- troca entre critérios;
- abandono de uma estratégia ineficiente;
- replanejamento.

Depois da reformulação, o perfil cognitivo de Caminhos para a Meta deverá ser reavaliado integralmente.

Até lá:

- não utilizar seu mechanicalPrimary atual como definição definitiva;
- não utilizar sua carga futura como definitiva;
- não utilizá-lo como exercício-modelo para a engine de prescrição.

==================================================
3. RESTAURANTE
==================================================

Não corrigir a matriz apenas para incluir Atenção Sustentada ou Flexibilidade Cognitiva.

Manter o que a mecânica atual sustenta.

MechanicalPrimary:

- Memória Operacional Verbal, ou o equivalente fino já definido na matriz.

Perfis associados devem derivar dos processos realmente encontrados, como:

- Atenção Seletiva;
- Controle de Distração;
- Controle Inibitório;
- Sequenciamento;
- Manipulação Mental;
- Monitoramento;

conforme as pontuações reais da matriz.

Não incluir Atenção Sustentada apenas porque o exercício dura vários minutos.

Atenção Sustentada só deve entrar como associada se a mecânica exigir manutenção estável de vigilância ou prontidão ao longo do tempo, e não apenas execução sucessiva de rodadas.

Não incluir Flexibilidade Cognitiva apenas porque existem ordens:

- direta;
- inversa;
- com exclusão.

Essas condições podem aumentar:

- manipulação mental;
- atualização;
- controle inibitório;
- manutenção de regra.

Elas só representam Flexibilidade Cognitiva se o paciente precisar alternar, adaptar ou trocar ativamente entre regras ou estratégias durante a execução.

Portanto, para Restaurante, manter a análise atual e não ampliar os rótulos de forma artificial.

==================================================
4. REGRA PARA DIVERGÊNCIAS
==================================================

Quando houver divergência entre:

- finalidade clínica desejada;
- categoria do catálogo;
- mecânica atual;

não alterar a matriz para fazê-las coincidir.

Registrar separadamente:

- o que o exercício pretende treinar;
- o que sua versão atual realmente exige;
- o que ainda depende de reformulação.

A matriz deve continuar sendo descritiva da mecânica real.

Não deve ser prescritiva nem aspiracional.

==================================================
5. VOCABULÁRIO MACRO
==================================================

A proposta de criar uma camada macro derivada dos aproximadamente 60 domínios finos está aprovada.

Entretanto, não misturar processos cognitivos com finalidade funcional na mesma lista.

Separar em duas estruturas:

A. cognitiveMacroProfiles
B. functionalClinicalTags

==================================================
6. COGNITIVE MACRO PROFILES
==================================================

Utilizar os seguintes macros cognitivos:

ATENÇÃO

1. Atenção Seletiva
2. Atenção Sustentada
3. Atenção Dividida
4. Atenção Alternada
5. Busca e Rastreamento Visual

MEMÓRIA

6. Memória Operacional Verbal
7. Memória Operacional Visuoespacial
8. Armazenamento de Curto Prazo
9. Atualização e Manipulação Mental

FUNÇÕES EXECUTIVAS

10. Controle Inibitório
11. Flexibilidade Cognitiva
12. Planejamento
13. Organização e Sequenciamento
14. Monitoramento Executivo e Manutenção de Meta
15. Resolução de Problemas e Tomada de Decisão

VELOCIDADE E PERCEPÇÃO

16. Velocidade de Processamento
17. Tempo de Reação
18. Percepção e Processamento Visuoespacial

LINGUAGEM E RACIOCÍNIO

19. Linguagem, Leitura e Processamento Auditivo
20. Raciocínio Lógico e Dedutivo

Esses macros são usados para:

- perfil cognitivo associado;
- cálculo futuro de sobreposição;
- sequenciamento;
- balanceamento;
- engine de prescrição.

==================================================
7. FUNCTIONAL CLINICAL TAGS
==================================================

Manter separadamente marcadores clínico-funcionais:

- Autonomia Funcional;
- Cognição Social;
- Atividades Instrumentais da Vida Diária;
- Tomada de Decisão Cotidiana;
- Organização da Rotina;
- Uso Funcional de Dinheiro;
- Compreensão de Situações Sociais.

Esses marcadores:

- não substituem os processos cognitivos;
- não entram automaticamente como mechanicalPrimary;
- descrevem a aplicação funcional ou o contexto da atividade;
- podem ser utilizados pela futura engine para selecionar exercícios conforme o objetivo terapêutico.

Exemplo:

Compra Multifuncional

catalogDomain:
- Desenvolvimento Funcional

functionalClinicalTags:
- Autonomia Funcional;
- Uso Funcional de Dinheiro;
- Tomada de Decisão Cotidiana.

mechanicalPrimary:
- Resolução de Problemas, conforme a análise atual.

associatedCognitiveProfiles:
- Memória Operacional;
- Atenção Seletiva;
- Controle Inibitório;
- Planejamento;
- Velocidade de Processamento;

somente quando sustentados pela matriz.

==================================================
8. REGRA DE DERIVAÇÃO DOS ASSOCIADOS
==================================================

Um macro cognitivo poderá entrar como associado quando:

- agregar pelo menos um domínio fino com valor 2 ou 3;
- não for equivalente ao mechanicalPrimary;
- representar uma demanda cognitiva relevante e recorrente;
- não for apenas uma exigência instrumental;
- não tiver sido inferido apenas pelo nome, duração ou categoria do exercício.

Ordenar os associados por:

1. maior intensidade fina;
2. quantidade de domínios finos relevantes dentro do macro;
3. centralidade na mecânica;
4. persistência ao longo dos níveis.

Mostrar no máximo quatro perfis cognitivos associados por exercício na camada resumida.

A estrutura detalhada pode preservar todos os domínios finos no JSON.

Não forçar quatro associados.

Um exercício poderá ter:

- um;
- dois;
- três;
- quatro;

conforme a mecânica real.

==================================================
9. NÃO USAR RÓTULOS AMPLOS PARA ESCONDER DIVERGÊNCIAS
==================================================

Não utilizar um rótulo macro mais amplo apenas para incluir um processo que a matriz não encontrou.

Exemplos:

- não converter sequenciamento automaticamente em Flexibilidade Cognitiva;
- não converter duração em Atenção Sustentada;
- não converter ordem inversa automaticamente em Flexibilidade;
- não converter leitura em Linguagem como alvo de treino;
- não converter movimentos rápidos em Velocidade de Processamento;
- não converter atividade cotidiana automaticamente em Autonomia Funcional como processo cognitivo.

O macro deve resumir os domínios finos, não substituí-los.

==================================================
10. CAMADA RESUMIDA POR EXERCÍCIO
==================================================

Para cada exercício, criar conceitualmente:

{
  "catalogDomain": "",
  "catalogSubdomain": "",
  "mechanicalPrimary": "",
  "associatedCognitiveProfiles": [],
  "functionalClinicalTags": [],
  "instrumentalDemands": [],
  "profileStatus": "FINALIZED_PROFILE | PROVISIONAL_PROFILE"
}

Não alterar código nesta etapa.

Aplicar essa estrutura apenas na documentação e no JSON clínico.

==================================================
11. STATUS DOS PERFIS
==================================================

Neste momento:

Caminhos para a Meta:
- PROVISIONAL_PROFILE

Demais exercícios:
- FINALIZED_PROFILE

Isso poderá ser revisto quando eu informar que outro exercício passará por reformulação estrutural.

==================================================
12. APLICAÇÃO AOS 34
==================================================

Pode despachar ao Codex e aplicar a camada macro aos 34 exercícios com as regras acima.

Antes de concluir, verificar:

- nenhum exercício foi movido de lugar no catálogo;
- nenhum mechanicalPrimary foi alterado para coincidir artificialmente com o catálogo;
- Caminhos para a Meta permanece provisório;
- Restaurante não ganhou Atenção Sustentada ou Flexibilidade sem sustentação mecânica;
- Autonomia Funcional e Cognição Social ficaram separadas dos macros cognitivos;
- nenhum exercício recebeu obrigatoriamente quatro associados;
- a matriz fina original foi preservada;
- a nova camada macro foi derivada da matriz e não a substituiu.

Ao final, apresentar:

1. Tabela dos 34 com:
   - catalogDomain;
   - catalogSubdomain;
   - mechanicalPrimary;
   - associados;
   - tags funcionais;
   - status.

2. Exercícios em que catalogSubdomain e mechanicalPrimary não coincidem.

3. Exercícios com menos de dois perfis associados.

4. Exercícios com quatro perfis associados.

5. Exercícios provisórios.

6. Qualquer macro que não tenha sido utilizado.

7. Qualquer domínio fino que não tenha encontrado macro correspondente.

Não iniciar carga cognitiva ainda.

Após aplicar e revisar, pare e aguarde validação clínica.

## 02/08/2026 22:54
Decisão clínica sobre Investigadores da Situação Social:

Escolho a opção (a), com uma correção conceitual.

Cognição Social não deve ser tratada apenas como tag funcional. Ela também é um domínio cognitivo legítimo e constitui o processo central do exercício Investigadores da Situação Social.

Portanto, acrescente um 21º macro cognitivo:

COGNIÇÃO SOCIAL E INFERÊNCIA SOCIAL

Esse macro deverá agregar processos finos como:

- reconhecimento de emoções;
- interpretação de intenções;
- teoria da mente;
- tomada de perspectiva;
- inferência social;
- compreensão de pistas sociais;
- julgamento social;
- compreensão de regras sociais;
- seleção de resposta social adequada.

Para Investigadores da Situação Social, registrar:

- mechanicalPrimary: Cognição Social e Inferência Social;
- associatedCognitiveProfiles: apenas os macros realmente sustentados pela matriz, como Linguagem/Compreensão Verbal, Raciocínio e Tomada de Decisão, se atingirem os critérios definidos;
- functionalClinicalTags:
  - Cognição Social;
  - Compreensão de Situações Sociais;
  - Resolução de Situações Sociais;
  - Habilidades Sociais.

Não transformar o mechanicalPrimary em Raciocínio Lógico e Dedutivo.

A inferência feita nesse exercício é social e contextual, não lógica formal. O raciocínio pode aparecer como processo associado, mas não substitui o domínio central.

CORREÇÃO DA ARQUITETURA

A estrutura passa a diferenciar:

1. CognitiveMacroProfiles
   - processos cognitivos efetivamente recrutados;
   - inclui Cognição Social e Inferência Social.

2. FunctionalClinicalTags
   - contexto funcional ou aplicação clínica;
   - exemplos:
     - Autonomia Funcional;
     - Atividades Instrumentais da Vida Diária;
     - Uso Funcional de Dinheiro;
     - Organização da Rotina;
     - Compreensão de Situações Sociais;
     - Habilidades Sociais.

O mesmo conceito pode aparecer em níveis diferentes sem duplicação indevida:

- macro cognitivo: Cognição Social e Inferência Social;
- tag funcional: Habilidades Sociais ou Compreensão de Situações Sociais.

O macro descreve o processo mental.
A tag descreve a aplicação clínica e funcional.

Atualize:

- docs/clinical-architecture/05-associated-cognitive-profiles.md;
- docs/clinical-architecture/associated-profiles.json;
- mapeamento fino → macro;
- tabela dos 34 exercícios.

Preserve:

- matriz fina original intacta;
- catalogDomain e catalogSubdomain;
- demais mechanicalPrimary;
- Caminhos para a Meta como PROVISIONAL_PROFILE.

Depois execute novamente as verificações e apresente:

1. mechanicalPrimary final de Investigadores;
2. associados finais;
3. tags funcionais;
4. confirmação de que nenhum exercício ficou sem mechanicalPrimary;
5. confirmação de que os 21 macros foram utilizados ou indicação dos não utilizados;
6. confirmação de que leitura não foi tratada como alvo principal de Investigadores.

Pode então concluir e commitar somente esses documentos, sem iniciar a fase de carga cognitiva.

## 02/08/2026 22:58
Perfeito. Vamos encerrar esta etapa aqui. Não inicie ainda a Fase 2. Considere toda a Fase 1 concluída e congelada até nova solicitação

## 03/08/2026 09:28
otimo, daria para continuarmos?

## 03/08/2026 09:35
então os exercicios, eu vou verificar depois. agora vou iniciar a fase 2  : FASE 2 — ARQUITETURA DE PRESCRIÇÃO CLÍNICA

A Fase 1 está oficialmente encerrada.

Todos os documentos da arquitetura clínica passam a ser considerados congelados e servirão como base para esta etapa.

NÃO revisar novamente:

- taxonomia;
- perfis cognitivos;
- mechanicalPrimary;
- associatedProfiles;
- categorias;
- catálogo;
- nomenclatura;
- documentação da Fase 1.

Essas informações passam a ser consideradas válidas.

==========================================================
OBJETIVO
==========================================================

Projetar toda a arquitetura de prescrição clínica do NeuroPeak.

O objetivo desta fase NÃO é implementar.

Também NÃO é alterar exercícios.

O objetivo é definir exatamente como cada exercício deverá funcionar dentro de um plano terapêutico.

Ao final desta fase, quero conseguir montar qualquer protocolo clínico apenas utilizando os parâmetros definidos.

==========================================================
NÃO IMPLEMENTAR
==========================================================

Não alterar:

- código;
- exercícios;
- níveis;
- banco;
- migrations;
- interface;
- catálogo;
- modalidades;
- engine.

Apenas analisar, documentar e definir arquitetura.

==========================================================
PARA CADA UM DOS 34 EXERCÍCIOS
==========================================================

Determinar obrigatoriamente:

1.
Modelo de execução

Escolher apenas um:

- CONTINUOUS_TIMED
- CLOSED_PROTOCOL
- PLANNING_WINDOW
- FIXED_HIGH_FATIGUE

Justificar.

----------------------------------------------------------

2.
Unidade mínima válida

Identificar qual é a menor unidade clinicamente válida.

Exemplos:

- tentativa
- rodada
- série
- bloco
- desafio completo
- fase

Justificar.

----------------------------------------------------------

3.
Política de encerramento

Quando o limite for atingido:

- termina imediatamente?
- termina a rodada?
- termina o bloco?
- termina o desafio?
- não inicia outro?

Definir comportamento.

----------------------------------------------------------

4.
Protocolos

Definir:

BREVE

PADRÃO

ESTENDIDO

Cada protocolo deve informar:

- quantidade de unidades
- duração estimada
- validade clínica

----------------------------------------------------------

5.
Carga Cognitiva Basal

Escala:

1
2
3

Apenas carga basal.

Não calcular ainda carga dinâmica.

Justificar.

----------------------------------------------------------

6.
Modificadores de carga

Identificar tudo o que aumenta carga.

Exemplos:

- velocidade
- memória
- quantidade
- interferência
- dupla tarefa
- mudança de regra
- semelhança
- planejamento
- modalidade

Sem calcular ainda.

----------------------------------------------------------

7.
Duração Clínica

Definir:

mínima útil

padrão

máxima recomendada

Nunca usar o mesmo valor para todos.

Justificar.

----------------------------------------------------------

8.
Fadiga

Classificar:

baixa

moderada

alta

Explicar.

----------------------------------------------------------

9.
Interferência

Classificar:

baixa

moderada

alta

----------------------------------------------------------

10.
Retomada

Como o exercício volta após interrupção?

Retoma:

- exatamente de onde parou?
- início do bloco?
- um nível abaixo?
- outra estratégia?

----------------------------------------------------------

11.
Elegibilidade para sessão

Responder:

Pode abrir uma sessão?

Pode finalizar uma sessão?

Melhor no início?

Melhor no meio?

Melhor no final?

Existe combinação ruim?

----------------------------------------------------------

12.
Modalidade

Somente para:

- Restaurante
- Supermercado
- Caminhos para a Meta
- Agentes Focus
- Compra Multifuncional

Analisar impacto na duração e carga.

==========================================================
DEPOIS DOS 34
==========================================================

Projetar a composição automática das sessões.

Exemplo:

Sessão:

20 minutos

30 minutos

40 minutos

O sistema deve conseguir distribuir automaticamente os exercícios respeitando:

- carga
- fadiga
- duração
- modalidade
- planejamento
- diversidade cognitiva

==========================================================
PLANO TERAPÊUTICO
==========================================================

Projetar a lógica que será usada pelo terapeuta.

O terapeuta escolherá:

- frequência semanal
- duração da sessão
- exercícios

O sistema calculará automaticamente:

- tempo real
- carga
- distribuição
- alertas
- conflitos
- balanceamento

==========================================================
NÃO PROJETAR A ENGINE AINDA
==========================================================

Nesta fase não decidir:

- IA
- sugestões automáticas
- prescrição inteligente

Primeiro quero consolidar toda a arquitetura da sessão.

==========================================================
DOCUMENTOS
==========================================================

Criar documentação organizada desta fase.

Separar claramente:

- arquitetura
- decisões
- dúvidas
- pendências

==========================================================
RELATÓRIO FINAL
==========================================================

Ao terminar, apresentar:

1.
Tabela única dos 34 exercícios.

2.
Modelo de execução.

3.
Carga basal.

4.
Duração.

5.
Fadiga.

6.
Interferência.

7.
Protocolos.

8.
Exercícios que ainda dependem de decisão clínica.

Depois parar.

Não implementar absolutamente nada. Antes de executar, lembre que a janela do Claude é mais escassa: use o Codex para toda codificação que caiba numa spec sobre o ⁠ HEAD ⁠ commitado, deixando o Claude direto apenas para ajuste pós-colheita, integração com contexto vivo ou indisponibilidade comprovada do Codex. No Codex, use ⁠ gpt-5.6-sol ⁠ ⁠ xhigh ⁠ para arquitetura, alto risco ou revisão final; ⁠ gpt-5.6-sol ⁠ ⁠ high ⁠ para conflitos ou código acoplado; ⁠ gpt-5.6-terra ⁠ ⁠ high ⁠ para código comum ou testável; e ⁠ gpt-5.6-luna ⁠ ⁠ high ⁠ para trabalho focalizado, repetível e barato de validar. Antes do primeiro comando, anuncie motor, modelo, esforço e motivo e, se for Codex, localize e use o ⁠ lab.sh ⁠ já instalado, sem presumir caminho nem criar outro.

## 03/08/2026 09:58
<task-notification>
<task-id>b2uutqz8h</task-id>
<tool-use-id>toolu_01PNf9Vz4LnnzGkHWXswgbTx</tool-use-id>
<output-file>/private/tmp/claude-501/-Users-kamyllahonorio-neuropeak/3e6ecf11-e4e5-471f-bbf9-4595faa53598/tasks/b2uutqz8h.output</output-file>
<status>completed</status>
<summary>Background command "Aguardar o lote 1" completed (exit code 0)</summary>
</task-notification>

## 03/08/2026 10:10
<task-notification>
<task-id>b6u09qnjr</task-id>
<tool-use-id>toolu_01MxE8tjXZmNKEVKSAeYDb2k</tool-use-id>
<output-file>/private/tmp/claude-501/-Users-kamyllahonorio-neuropeak/3e6ecf11-e4e5-471f-bbf9-4595faa53598/tasks/b6u09qnjr.output</output-file>
<status>completed</status>
<summary>Background command "Aguardar a reconstrução do lote 1" completed (exit code 0)</summary>
</task-notification>

## 03/08/2026 10:25
Concordo com a opção (a).

Recalibre apenas:

- carga cognitiva basal;
- fadiga.

Mantenha intactos os outros 10 parâmetros já analisados no lote 1.

A correção conceitual é:

CARGA BASAL NÃO REPRESENTA:

- quantidade de domínios recrutados;
- multidimensionalidade;
- quantidade de funções cognitivas associadas;
- importância clínica do exercício;
- dificuldade máxima que ele pode atingir.

CARGA BASAL REPRESENTA:

- intensidade cognitiva média por unidade de tempo;
- esforço necessário na configuração inicial ou padrão;
- continuidade da demanda;
- quantidade de operações simultâneas;
- necessidade de manter/manipular informação;
- interferência;
- pressão temporal;
- complexidade da resposta;
- possibilidade de recuperação entre rodadas.

Um exercício pode recrutar muitos processos e ainda ter carga basal baixa ou moderada quando:

- as rodadas são curtas;
- há pausas naturais;
- a resposta é simples;
- a regra permanece estável;
- a informação exigida é pequena;
- o paciente consegue recuperar-se entre tentativas.

==================================================
CRITÉRIOS DA CARGA BASAL
==================================================

Utilizar escala 1–3:

1 — BAIXA

Demanda leve por minuto, com uma ou poucas operações centrais, resposta simples, baixa interferência e possibilidade clara de recuperação entre rodadas.

Características frequentes:

- regra simples e estável;
- baixa manutenção de informação;
- pouca ou nenhuma manipulação mental;
- ausência de dupla tarefa;
- baixa pressão temporal;
- resposta motora simples;
- unidades curtas;
- pausas naturais;
- poucos estímulos simultâneos.

2 — MODERADA

Demanda cognitiva consistente, mas administrável, com combinação de processos, manutenção de informações, seleção entre alternativas ou planejamento limitado.

Características frequentes:

- duas ou mais operações relevantes;
- manutenção de meta;
- controle de distração;
- memória operacional moderada;
- seleção de resposta;
- interferência moderada;
- planejamento ou monitoramento;
- exigência contínua, mas com alguma recuperação.

3 — ALTA

Demanda intensa e sustentada por minuto, com múltiplas operações simultâneas, forte interferência, manipulação ativa, mudança frequente de regra, dupla tarefa ou pressão temporal elevada.

Características frequentes:

- dupla tarefa real;
- interferência forte;
- atualização contínua;
- manipulação mental intensa;
- alternância frequente de regras;
- pressão temporal alta;
- baixa possibilidade de recuperação;
- necessidade de manter vários elementos simultaneamente;
- alto custo de erro;
- demanda contínua durante a maior parte da atividade.

==================================================
REGRAS IMPORTANTES
==================================================

Não classificar como carga 3 apenas porque o exercício:

- recruta muitos domínios;
- está em Funções Executivas;
- possui níveis avançados difíceis;
- exige planejamento;
- possui memória operacional;
- dura vários minutos;
- envolve vários estímulos visuais.

A carga basal descreve a configuração inicial ou padrão.

A dificuldade dos níveis avançados deverá aparecer em:

- dynamicLoadModifiers;
- faixa dinâmica de carga.

Exemplo conceitual:

Cubos pode ter:

- carga basal 1 ou 2;
- carga dinâmica máxima 3 conforme tamanho da sequência e velocidade.

Vigilância pode ter:

- carga basal 1 ou 2;
- aumento de carga por duração, velocidade, semelhança dos alvos e densidade de estímulos.

Jogo das Torres pode ter:

- carga basal 2;
- carga dinâmica 3 em problemas complexos.

Carga 3 basal deve ser reservada para tarefas cuja própria mecânica padrão já sustenta intensidade elevada.

Possíveis candidatos, apenas se confirmados pela mecânica:

- Cores e Palavras;
- Dupla Tarefa;
- N-Back;
- Alternância de Regras;
- Lista com Distração;
- outros com interferência, atualização ou simultaneidade efetivamente altas.

Não force quantidade mínima ou máxima de exercícios em cada classe.

A distribuição deve resultar dos critérios, não de uma meta estatística.

Entretanto, ao final, avalie se a escala ficou discriminativa.

Se mais de aproximadamente 40% dos exercícios permanecerem na mesma classe, revise as justificativas e verifique se ainda existe confusão conceitual.

==================================================
FADIGA
==================================================

Recalibre fadiga separadamente da carga.

Fadiga não é sinônimo de carga basal.

Fadiga representa a probabilidade de queda de qualidade, exaustão ou perda de engajamento ao longo da exposição.

Considerar:

- repetitividade;
- interferência;
- duração típica;
- pressão temporal;
- esforço inibitório;
- esforço de atualização;
- sobrecarga visual;
- sobrecarga auditiva;
- frustração;
- custo de erro;
- ausência de pausas;
- monotonia;
- necessidade de planejamento prolongado.

Escala:

BAIXA

- tolera exposição relativamente longa;
- possui pausas naturais;
- baixa interferência;
- baixa frustração;
- resposta simples;
- boa possibilidade de recuperação.

MODERADA

- pode gerar redução gradual de desempenho;
- exige atenção ou memória de forma consistente;
- tolera duração intermediária;
- precisa de limite razoável.

ALTA

- perde qualidade rapidamente;
- forte interferência;
- alternância intensa;
- dupla tarefa;
- pressão temporal alta;
- manipulação contínua;
- grande risco de frustração;
- exposição deve ser curta ou rigidamente limitada.

Um exercício pode ter:

- carga basal alta e fadiga moderada;
- carga basal moderada e fadiga alta;
- carga basal baixa e fadiga moderada por monotonia.

Portanto, não derive automaticamente fadiga da carga.

==================================================
ENTREGA DA RECALIBRAÇÃO
==================================================

Recalibre os 34 exercícios e apresente:

1. Distribuição final da carga basal.
2. Distribuição final da fadiga.
3. Lista de exercícios que mudaram de carga.
4. Lista de exercícios que mudaram de fadiga.
5. Justificativa curta para cada carga 3.
6. Justificativa curta para cada fadiga alta.
7. Exercícios com:
   - carga basal baixa e faixa dinâmica alta;
   - carga basal moderada e fadiga alta;
   - carga basal alta e fadiga moderada.
8. Confirmação de que multidimensionalidade não foi usada como sinônimo de carga.
9. Confirmação de que os outros 10 parâmetros do lote 1 permaneceram intactos.

Depois aplique a recalibração aos documentos e JSON do lote 1 e prossiga normalmente para os lotes 2 e 3.

Não interrompa novamente para pedir uma distribuição numérica ideal, salvo se surgir uma inconsistência clínica real.

## 03/08/2026 11:40
e ai?

## 03/08/2026 11:58
vc esta fazendo?

## 03/08/2026 12:50
e ai?

## 03/08/2026 12:55
Excelente.

A arquitetura está seguindo exatamente a direção que eu queria.

Tenho apenas alguns ajustes conceituais antes do lote 3.

1.

O teto de carga basal (7 / 10 / 13) deve permanecer como um alerta heurístico.

Não deve ser tratado como limite absoluto.

A composição da sessão deverá considerar simultaneamente:

- carga basal;
- fadiga;
- interferência;
- modelo de execução;
- modalidade;
- planejamento.

Ou seja, duas sessões com carga total 7 podem ter qualidades muito diferentes.

2.

A margem de fechamento baseada no modelo de execução está aprovada.

Esse conceito permanece.

3.

Adicionar um novo alerta:

PLANNING_WINDOW

Não recomendar dois exercícios classificados como PLANNING_WINDOW consecutivos.

Exemplos:

Jogo das Torres

↓

Estacionamento Lógico

↓

Caminhos para a Meta

O sistema deverá sugerir inserir entre eles um exercício CONTINUOUS_TIMED ou CLOSED_PROTOCOL.

Continua sendo apenas sugestão.

Nunca bloqueio.

4.

Todos os alertas continuam consultivos.

O terapeuta sempre poderá salvar o plano.

Não criar bloqueios.

Com esses ajustes, pode concluir normalmente o lote 3.

## 03/08/2026 14:35
e ai?

## 03/08/2026 14:41
A Fase 2 está validada. Vamos fechar as quatro decisões bloqueantes conforme abaixo.

Não reabrir a análise dos 34 exercícios.

Não alterar os parâmetros individuais já consolidados.

Não implementar ainda nesta etapa. Apenas registrar as decisões finais e preparar a especificação objetiva de implementação.

==================================================
1. FAIXAS DE DURAÇÃO DA SESSÃO
==================================================

Aprovar as seguintes faixas:

Sessão prescrita de 20 minutos:
- faixa esperada: 18–22 min;
- atenção: acima de 22 até 24 min;
- excesso importante: acima de 24 min.

Sessão prescrita de 30 minutos:
- faixa esperada: 27–33 min;
- atenção: acima de 33 até 36 min;
- excesso importante: acima de 36 min.

Sessão prescrita de 40 minutos:
- faixa esperada: 36–44 min;
- atenção: acima de 44 até 48 min;
- excesso importante: acima de 48 min.

Essas faixas são estimativas operacionais, não limites clínicos absolutos.

O terapeuta poderá salvar o plano em qualquer faixa.

O sistema apenas deverá informar:

- abaixo do esperado;
- dentro do esperado;
- acima do esperado;
- excesso importante.

Nenhum desses estados bloqueia salvamento.

==================================================
2. MARGEM DE FECHAMENTO
==================================================

Aprovar:

CONTINUOUS_TIMED:
- até 0,5 minuto para concluir a rodada atual;
- não iniciar nova rodada após atingir o tempo-base.

CLOSED_PROTOCOL:
- até 1 minuto para concluir a série ou unidade atual;
- não iniciar nova série após atingir o limite.

PLANNING_WINDOW:
- até 3 minutos adicionais para concluir o desafio em andamento;
- não iniciar novo desafio após atingir o tempo-base.

FIXED_HIGH_FATIGUE:
- sem margem adicional;
- encerrar no limite definido, respeitando apenas um fechamento técnico mínimo da tela.

Para PLANNING_WINDOW, os 3 minutos são teto de segurança, não obrigação de manter o paciente até o fim.

Caso o desafio não seja concluído dentro da margem:

- encerrar de forma segura;
- registrar como desafio não concluído;
- preservar movimentos, tempo e progresso;
- não considerar como erro automático;
- não iniciar novo desafio.

==================================================
3. TETOS DE CARGA BASAL
==================================================

Aprovar os valores:

- sessão de 20 min: referência 7;
- sessão de 30 min: referência 10;
- sessão de 40 min: referência 13.

Esses valores são exclusivamente heurísticos.

Não significam:

- sessão válida;
- sessão inválida;
- autorização;
- proibição;
- segurança garantida.

A leitura da sessão deverá considerar conjuntamente:

- carga basal;
- fadiga;
- interferência;
- sequência;
- modalidade;
- modelo de execução;
- concentração de tarefas semelhantes;
- presença de planejamento consecutivo.

Duas sessões com a mesma soma de carga podem receber alertas diferentes.

Nenhum teto bloqueia salvamento.

==================================================
4. REGRAS DE FADIGA ALTA
==================================================

Aprovar como recomendação:

Sessão de 20 minutos:
- recomendar no máximo 1 exercício de fadiga alta.

Sessões de 30 e 40 minutos:
- recomendar no máximo 2 exercícios de fadiga alta.

Além disso:

- não recomendar dois exercícios de fadiga alta consecutivos;
- sugerir intercalar com exercício de fadiga baixa ou moderada;
- evitar recomendar exercício de fadiga alta como último da sessão;
- caso o terapeuta mantenha essa posição, permitir normalmente;
- nunca bloquear salvamento.

A regra de “não finalizar com fadiga alta” é consultiva, não absoluta.

==================================================
5. PLANEJAMENTO CONSECUTIVO
==================================================

Manter o alerta PLANNING_WINDOW_ADJACENT.

Não recomendar dois exercícios PLANNING_WINDOW consecutivos.

Sugerir inserir entre eles:

- CONTINUOUS_TIMED;
- ou CLOSED_PROTOCOL.

Nenhum bloqueio.

==================================================
6. CAMINHOS PARA A META
==================================================

Manter:

- PROVISIONAL_PROFILE;
- duração provisória;
- carga provisória;
- modelo provisório.

O exercício será reavaliado depois da reformulação para planejamento.

Não utilizá-lo como referência para calibrar outros exercícios.

==================================================
7. ENCERRAMENTO DA FASE 2
==================================================

Atualize:

- docs/prescription-architecture/04-open-decisions.md;
- docs/prescription-architecture/05-consolidated-report.md;
- documentos de composição da sessão;
- JSON de prescrição, somente quando necessário para registrar essas decisões.

Marque as quatro decisões anteriormente bloqueantes como APROVADAS.

Depois apresente:

1. confirmação de que não restam decisões bloqueantes para iniciar a implementação;
2. decisões importantes que podem ser refinadas depois;
3. lista final dos 18 alertas;
4. confirmação de que todos possuem blocksSave = false;
5. confirmação de que os parâmetros individuais dos 34 exercícios permaneceram intactos;
6. arquivos que a implementação futura precisará alterar;
7. ordem técnica recomendada para implementar a área do terapeuta com segurança.

Não implementar ainda.

Não alterar banco.

Não criar migrations.

Não modificar exercícios.

Não alterar interface.

Apenas concluir a documentação e produzir a especificação de implementação.

Depois pare.

## 03/08/2026 14:54
<task-notification>
<task-id>bxc0di7fc</task-id>
<tool-use-id>toolu_016vk7B42vWpXgd3MByRqRUd</tool-use-id>
<output-file>/private/tmp/claude-501/-Users-kamyllahonorio-neuropeak/3e6ecf11-e4e5-471f-bbf9-4595faa53598/tasks/bxc0di7fc.output</output-file>
<status>completed</status>
<summary>Background command "Aguardar o fechamento" completed (exit code 0)</summary>
</task-notification>

## 03/08/2026 15:11
Excelente.

Considero encerrada a Fase 2 da arquitetura clínica.

A partir deste momento, congelamos toda a arquitetura.

Não quero reabrir discussões conceituais durante a implementação.

Toda alteração arquitetural futura deverá ocorrer apenas se surgir necessidade real durante testes clínicos.

==========================================================
INICIAR IMPLEMENTAÇÃO
==========================================================

Vamos iniciar a implementação da arquitetura.

Seguiremos exatamente a ordem de menor risco para maior risco.

Não pule etapas.

Não implemente duas fases simultaneamente.

Cada fase deverá terminar completamente antes da próxima.

==========================================================
FASE 1
NÚCLEO DA PRESCRIÇÃO
==========================================================

Objetivo:

Implementar toda a lógica pura da arquitetura, sem alterar a interface do terapeuta e sem alterar a experiência do paciente.

Nesta fase implementar apenas:

• tipos
• estruturas
• calculadores
• validadores
• interpretadores
• modelos
• enums
• helpers
• testes

Nada visual.

==========================================================
IMPLEMENTAR
==========================================================

Implementar:

1.

Modelos de execução

- CONTINUOUS_TIMED
- CLOSED_PROTOCOL
- PLANNING_WINDOW
- FIXED_HIGH_FATIGUE

2.

Modelos de duração

3.

Protocolos

BREVE

PADRÃO

ESTENDIDO

4.

Carga basal

5.

Fadiga

6.

Interferência

7.

Margens de fechamento

8.

Estados da sessão

- abaixo
- dentro
- acima
- excesso importante

9.

Calculador de duração

Utilizar toda a fórmula definida na Fase 2.

10.

Calculador de carga

11.

Motor de validação

Gerar os 18 alertas definidos.

12.

Interpretador

Receber um plano terapêutico e devolver:

- duração estimada;
- faixa;
- carga;
- fadiga;
- alertas;
- conflitos;
- estado geral.

==========================================================
IMPORTANTE
==========================================================

Nesta fase:

NÃO alterar:

- páginas;
- componentes;
- banco;
- migrations;
- APIs;
- tela do terapeuta;
- tela do paciente;
- comportamento dos exercícios.

Toda implementação deverá ficar isolada em módulos reutilizáveis.

==========================================================
COMPATIBILIDADE
==========================================================

Todos os planos atuais devem continuar funcionando.

Nada poderá quebrar pacientes existentes.

Nenhum exercício poderá deixar de abrir.

Nenhum plano salvo poderá ficar inválido.

==========================================================
TESTES
==========================================================

Criar testes automáticos para validar:

- cálculo de duração;
- cálculo de carga;
- cálculo de fadiga;
- margens de fechamento;
- 18 alertas;
- estados da sessão;
- compatibilidade com planos antigos.

Não aceitar implementação sem testes.

==========================================================
ENTREGA
==========================================================

Ao terminar apresentar:

1.

Arquivos criados.

2.

Arquivos alterados.

3.

Arquitetura implementada.

4.

Cobertura dos testes.

5.

Exemplos reais:

Sessão de 20 minutos

Sessão de 30 minutos

Sessão de 40 minutos

Mostrando exatamente:

- duração;
- carga;
- fadiga;
- alertas;
- estado.

6.

Confirmação de que:

- nenhum exercício foi alterado;
- nenhuma interface foi alterada;
- nenhum paciente perde compatibilidade;
- nenhum progresso foi modificado.

Não iniciar automaticamente a Fase 2 (interface do terapeuta).

Pare e aguarde minha validação.

## 03/08/2026 15:17
Pode concluir normalmente a Implementação — Fase 1.

Ao terminar, apresente antes de qualquer nova fase:

1. Arquivos criados e alterados.
2. Diff resumido.
3. Confirmação de que somente `lib/prescription/` e arquivos de teste foram tocados.
4. Resultado de todos os testes novos.
5. Resultado da suíte antiga completa.
6. Cobertura dos testes do núcleo de prescrição.
7. Lista dos 18 alertas implementados.
8. Prova de que todos possuem:
   - `blocksSave: false`;
   - `canSave: true`.
9. Resultados das fronteiras de sessão para 20, 30 e 40 minutos.
10. Três exemplos executados de planos:
   - 20 minutos;
   - 30 minutos;
   - 40 minutos;
   mostrando duração estimada, carga, fadiga, estado e alertas.
11. Confirmação de que não foram alterados:
   - interface;
   - páginas;
   - APIs;
   - banco;
   - migrations;
   - progressão;
   - exercícios;
   - dados de pacientes.
12. Limitações ou decisões ainda não implementadas.

Não iniciar automaticamente a próxima fase.

Pare e aguarde minha validação.

## 03/08/2026 15:39
IMPLEMENTAÇÃO — FASE 2
EXIBIÇÃO CONSULTIVA NA ÁREA DO TERAPEUTA

A Implementação — Fase 1 está aprovada.

O núcleo puro em `lib/prescription/` está congelado e deve ser utilizado como fonte para esta etapa.

Objetivo:

Integrar a leitura do núcleo de prescrição à tela atual do plano terapêutico, exibindo informações consultivas ao terapeuta.

Nesta fase:

- ler o formato atual dos planos;
- interpretar o plano usando `lib/prescription/`;
- mostrar duração, carga, fadiga, estado e alertas;
- não alterar ainda o formato salvo;
- não criar migration;
- não modificar a experiência do paciente;
- não alterar o comportamento dos exercícios;
- não implementar ainda os novos controles de dose.

==================================================
PRINCÍPIO DE COMPATIBILIDADE
==================================================

A tela atual deve continuar funcionando com todos os planos existentes.

O sistema deve:

- ler planos antigos;
- calcular a interpretação por meio da camada legada;
- mostrar informações consultivas;
- permitir que o terapeuta continue salvando no formato atual;
- não converter nem reescrever automaticamente os dados antigos;
- não apagar campos existentes;
- não alterar níveis ou progresso.

Nesta fase, a integração é somente de leitura e apresentação.

==================================================
ARQUIVOS PREVISTOS
==================================================

Priorizar alterações apenas em:

- `app/(therapist)/pacientes/[id]/plano/page.tsx`
- `components/plano/PlanBuilderSidebar.tsx`
- `components/plano/ExerciseCard.tsx`
- `components/plano/ExerciseRow.tsx`

Pode criar componentes auxiliares dentro de:

- `components/plano/prescription/`

Não alterar nesta fase:

- APIs;
- banco;
- migrations;
- páginas do paciente;
- `lib/adaptive.ts`;
- comportamento dos exercícios;
- `ExerciseWrapper.tsx`;
- rotas de sessão.

Caso seja tecnicamente necessário tocar em outro arquivo, pare e explique antes.

==================================================
INTEGRAÇÃO COM O NÚCLEO
==================================================

Utilizar:

- catálogo de prescrição;
- interpretador;
- leitor legado;
- calculador de duração;
- resumos de carga, fadiga e interferência;
- validadores dos 18 alertas.

Não duplicar regras nos componentes.

A interface deve apenas consumir o resultado do interpretador.

Nenhum componente deve recalcular manualmente:

- duração;
- carga;
- margens;
- estados;
- alertas.

==================================================
RESUMO DA SESSÃO
==================================================

Na área lateral do plano, substituir a estimativa genérica baseada em “~7 min” por um resumo real.

Exibir:

1. Duração prescrita:
   - 20 min;
   - 30 min;
   - 40 min;
   - ou valor atual do plano, quando legado/personalizado.

2. Faixa estimada real:
   - mínimo;
   - máximo.

Exemplo:

`Estimativa: 27–33 min`

3. Estado da sessão:
   - ABAIXO_DO_ESPERADO;
   - DENTRO_DO_ESPERADO;
   - ACIMA_DO_ESPERADO;
   - EXCESSO_IMPORTANTE.

Usar textos amigáveis na interface:

- Abaixo do esperado;
- Dentro do esperado;
- Acima do esperado;
- Excesso importante.

4. Carga basal total:
   - valor atual;
   - referência heurística para aquela duração.

Exemplo:

`Carga basal: 8 / referência 10`

Não apresentar como pontuação de aprovação.

Adicionar texto curto ou tooltip:

`Referência consultiva; não determina se o plano é válido.`

5. Fadiga:
   - quantidade baixa;
   - moderada;
   - alta.

6. Interferência:
   - quantidade baixa;
   - moderada;
   - alta.

7. Confirmação visível de que o plano pode ser salvo:
   - não usar linguagem de “aprovado”;
   - não usar selo verde de “plano válido”;
   - não ocultar o botão de salvar;
   - não desabilitar salvamento por causa dos alertas.

==================================================
ALERTAS
==================================================

Exibir os alertas retornados pelo núcleo.

Organizar por gravidade visual consultiva:

- informativo;
- atenção;
- revisão recomendada.

A gravidade visual não altera `blocksSave`.

Cada alerta deve apresentar:

- título;
- mensagem;
- exercícios envolvidos, quando houver;
- sugestão de ajuste, quando houver.

Exemplos:

- sessão acima do esperado;
- carga no teto heurístico;
- fadiga alta consecutiva;
- interferência alta consecutiva;
- dois exercícios auditivos seguidos;
- dois PLANNING_WINDOW consecutivos;
- posição de abertura ou encerramento pouco recomendada;
- combinação declarada como ruim.

Não exibir códigos técnicos como:

`HIGH_FATIGUE_ADJACENT`

O código pode existir internamente, mas o terapeuta vê texto em português.

==================================================
CARDS DOS EXERCÍCIOS
==================================================

Nos cards e linhas dos exercícios selecionados, exibir apenas informações consultivas já disponíveis no núcleo:

- modelo de execução em texto amigável;
- duração estimada ou protocolo atual;
- carga basal;
- fadiga;
- modalidade atual, apenas quando aplicável.

Textos amigáveis para modelo:

- CONTINUOUS_TIMED → Por tempo;
- CLOSED_PROTOCOL → Por protocolo;
- PLANNING_WINDOW → Janela de planejamento;
- FIXED_HIGH_FATIGUE → Duração fixa.

Não adicionar ainda controles de alteração desses parâmetros.

Nesta fase o terapeuta apenas visualiza.

==================================================
DESIGN
==================================================

Manter a interface:

- clínica;
- discreta;
- limpa;
- sem gamificação;
- sem excesso de cores;
- sem gráficos decorativos;
- sem transformar carga em “nota”.

Usar destaque visual moderado:

- neutro para dentro do esperado;
- atenção discreta para acima;
- destaque mais evidente, mas não alarmista, para excesso importante;
- alertas agrupados, não espalhados por toda a tela.

Não sobrecarregar cada card com todos os dados.

Prioridade visual:

1. nome do exercício;
2. duração/protocolo;
3. carga e fadiga de forma compacta;
4. detalhes adicionais no botão ou área “Ver detalhes”.

==================================================
ESTADO VAZIO E PLANOS LEGADOS
==================================================

Quando nenhum exercício estiver selecionado:

- mostrar duração estimada 0;
- estado abaixo do esperado;
- não gerar alertas confusos além do necessário;
- orientar que exercícios sejam adicionados.

Para planos antigos:

- interpretar de forma tolerante;
- mostrar um marcador discreto apenas se algum parâmetro não puder ser determinado;
- não mostrar erro técnico ao terapeuta;
- usar fallback documentado;
- não modificar os dados ao abrir a tela.

==================================================
TESTES
==================================================

Criar testes para:

1. Renderização do resumo de sessão.
2. Estado abaixo/dentro/acima/excesso.
3. Exibição de alertas em português.
4. Garantia de que alertas não desabilitam o botão de salvar.
5. Plano legado sendo interpretado.
6. Plano vazio.
7. Cards exibindo modelo, carga e fadiga.
8. Nenhuma regra duplicada fora de `lib/prescription/`.
9. Nenhuma chamada de escrita ou migração.
10. Todos os testes antigos continuando a passar.

==================================================
PROVA DE ESCOPO
==================================================

Ao final, provar que não foram alterados:

- banco;
- migrations;
- APIs;
- páginas do paciente;
- progressão;
- exercícios;
- formato persistido dos planos;
- comportamento de salvamento.

==================================================
ENTREGA
==================================================

Ao terminar apresentar:

1. Arquivos criados.
2. Arquivos alterados.
3. Diff resumido.
4. Prints ou descrição precisa da nova interface.
5. Exemplo visual de:
   - sessão dentro do esperado;
   - sessão acima do esperado;
   - sessão com fadiga alta consecutiva;
   - sessão com planejamento consecutivo.
6. Resultado dos testes novos.
7. Resultado da suíte completa.
8. Confirmação de que o botão de salvar nunca foi bloqueado pelos alertas.
9. Confirmação de que o formato salvo continua sendo o antigo.
10. Limitações desta fase.

Não iniciar automaticamente a Implementação — Fase 3.

Pare e aguarde minha validação.

## 03/08/2026 15:43
Escolho a opção (b).

Pode seguir com a Implementação — Fase 2 usando uma camada pura de apresentação em:

lib/prescription/presentation.ts

A decisão é:

- não instalar dependências;
- não alterar package.json;
- não alterar vitest.config.ts;
- não adicionar jsdom, happy-dom ou Testing Library nesta fase;
- não criar infraestrutura nova de testes de componente.

OBJETIVO DA CAMADA DE APRESENTAÇÃO

Centralizar em funções puras:

- tradução dos 18 códigos de alerta para português;
- título e mensagem de cada alerta;
- sugestão de ajuste;
- agrupamento por gravidade consultiva;
- rótulos amigáveis dos modelos de execução;
- rótulos dos estados da sessão;
- formatação da faixa de duração;
- formatação da carga basal e referência heurística;
- resumo de fadiga;
- resumo de interferência;
- marcador de plano legado ou parâmetro indefinido;
- textos auxiliares e tooltips.

Os componentes React deverão apenas consumir os objetos já preparados.

Não duplicar regras ou textos clínicos nos componentes.

TESTES AUTOMÁTICOS

Criar testes puros para:

1. tradução dos 18 alertas;
2. títulos e mensagens em português;
3. gravidade consultiva;
4. rótulos dos quatro modelos de execução;
5. rótulos dos quatro estados de duração;
6. formatação das faixas;
7. carga e referência heurística;
8. resumo de fadiga e interferência;
9. plano vazio;
10. plano legado;
11. ausência de códigos técnicos no conteúdo apresentado;
12. garantia de que todos os 18 alertas possuem configuração de apresentação;
13. garantia de que nenhum alerta possui comportamento bloqueante.

PROTEÇÃO DO BOTÃO SALVAR

Como não há infraestrutura de renderização, criar um teste estático em Node que:

- leia os componentes alterados;
- falhe caso o botão de salvar seja desabilitado com base em:
  - alertas;
  - carga;
  - fadiga;
  - interferência;
  - estado da sessão;
  - resultado do interpretador.

O botão poderá continuar sendo desabilitado por razões técnicas já existentes, como:

- ausência de paciente;
- operação de salvamento em andamento;
- dados obrigatórios ausentes;

mas nunca por causa da arquitetura consultiva.

O teste deve procurar padrões reais no código e ter justificativa clara. Não criar um teste superficial que sempre passe.

COMPONENTES

Os componentes podem ser alterados para consumir:

- interpretPrescriptionPlan;
- presentation.ts;
- leitura legada.

Mas não devem conter:

- fórmulas;
- limiares;
- regras dos alertas;
- traduções duplicadas;
- lógica de carga;
- lógica de fadiga;
- lógica de margem;
- decisões de bloqueio.

VALIDAÇÃO VISUAL

Como não haverá teste automatizado de renderização nesta fase, fazer validação manual documentada:

- abrir a tela do plano;
- testar plano vazio;
- testar plano dentro do esperado;
- testar plano acima do esperado;
- testar excesso importante;
- testar fadiga alta consecutiva;
- testar planejamento consecutivo;
- testar plano legado;
- confirmar que salvar permanece disponível.

Apresentar evidências por:

- prints;
- descrição precisa do estado exibido;
- logs apenas se necessários;
- lista dos cenários verificados.

LIMITAÇÃO REGISTRADA

Registrar explicitamente que:

- a lógica de apresentação está coberta por testes;
- a integração visual foi validada manualmente;
- testes React poderão ser adicionados futuramente quando o projeto adotar infraestrutura própria para componentes;
- a ausência de Testing Library nesta fase não deve ser escondida.

Pode prosseguir imediatamente com a opção (b).

Mantenha todas as outras restrições da Implementação — Fase 2.

Não iniciar automaticamente a Fase 3.

## 03/08/2026 19:27
e ai?

## 03/08/2026 22:34
e ai?

## 03/08/2026 22:49
<task-notification>
<task-id>ad020f0f62e8744a5</task-id>
<tool-use-id>toolu_01LAUtKxr9y65WfWVaoPtAMW</tool-use-id>
<output-file>/private/tmp/claude-501/-Users-kamyllahonorio-neuropeak/3e6ecf11-e4e5-471f-bbf9-4595faa53598/tasks/ad020f0f62e8744a5.output</output-file>
<status>completed</status>
<summary>Agent "Atualizar PROGRESSO.md" finished</summary>
<note>A task-notification fires each time this agent stops with no live background children of its own. The user can send it another message and resume it, so the same task-id may notify more than once.</note>
<result>Relatório.

## O QUE MUDOU

Único arquivo tocado: `/Users/kamyllahonorio/neuropeak/PROGRESSO.md` — inserido um bloco novo no topo (logo após o cabeçalho, antes de `## 🧊 FASE 1 CONCLUÍDA E CONGELADA (02/ago/2026)`), 57 linhas, sem remover nada. Nenhum bloco "EM ANDAMENTO" referente a esta implementação existia no arquivo (os três existentes são de outras frentes: Fase 1 da arquitetura clínica, Focus modo único e Informação em Foco), então não houve movimentação para histórico.

Trecho exato escrito:

```markdown
## ✅ FASE 2 DA PRESCRIÇÃO ENTREGUE (03/ago/2026) — exibição consultiva na tela de plano (`a6f61f0`)

**Não mudou dado, API, banco nem comportamento de exercício.** A Fase 1 (núcleo puro em
`lib/prescription/`, 7 módulos) segue aprovada e congelada; a Fase 2 apenas **EXIBE** ao terapeuta,
na área dele, o que o núcleo calcula. O commit não tocou `package.json` — versão segue **2.67.1**.

### O que entrou

| Arquivo criado | Papel |
|---|---|
| `lib/prescription/presentation.ts` (469 l) | camada pura de apresentação — **sem React** |
| `lib/prescription/presentation.test.ts` (144 l) | testes da camada pura |
| `lib/prescription/__tests__/save-button-guard.test.ts` (63 l) | teste **estático**: lê o fonte e garante que o "Salvar plano" não some |
| `lib/prescription/__tests__/library-coverage.test.ts` | regressão criada pelo VP na revisão (ver achado abaixo) |
| `components/plano/prescription/PrescriptionSummary.tsx` (98 l) | resumo da sessão prescrita |
| `components/plano/prescription/ExercisePrescriptionMeta.tsx` (28 l) | metadados de prescrição por exercício |

**Alterados:** `app/(therapist)/pacientes/[id]/plano/page.tsx` · `components/plano/PlanBuilderSidebar.tsx` ·
`components/plano/ExerciseCard.tsx` · `components/plano/ExerciseRow.tsx`.

### Roteamento (regra 8)

Codificação no **Codex `gpt-5.6-sol`, esforço high, lab `impl2b`**. O primeiro disparo (lab `impl2`)
**panicou com bug de Rust em `std::env`** e não produziu nada — lab recriado e redisparado, aí com
sucesso. Dois consertos pequenos pós-colheita foram do **Claude Opus 5 xhigh (exceção 1 da regra 8)**:
tipagem em `presentation.ts` (acesso a propriedade opcional numa união criada por `satisfies`) e a
criação do `library-coverage.test.ts`.

### Provas (repositório real)

`npx tsc --noEmit` exit 0 · `npx vitest run` **330/330 em 28 arquivos** (eram 296 → **+34 testes**) ·
`npm run build` exit 0.

### ⚠️ Achado da revisão do VP — já blindado por teste

A **biblioteca de exercícios da tela de plano** passou a montar cada cartão a partir do catálogo de
prescrição e **descarta com `flatMap` quem não tem entrada**. Hoje a cobertura é total (**34 de 34**),
mas o descarte seria **silencioso** — um exercício sumiria da tela sem erro nenhum.
`library-coverage.test.ts` transforma esse caso em teste vermelho.

### ⏸️ PRÓXIMO PASSO — validação VISUAL dela; **NÃO iniciar a Fase 3**

Ela pediu explicitamente para não começar a Fase 3 automaticamente. Não há teste de renderização,
então estes cenários da tela de plano só se conferem com olho humano: **plano vazio · dentro do
esperado · acima do esperado · excesso importante · fadiga alta consecutiva · planejamento
consecutivo · plano legado** — e, em **todos**, confirmar que o botão **"Salvar plano"** continua
disponível.

### 🔷 Decisões dela pendentes

1. **Paredão de alertas:** numa sessão muito sobrecarregada os alertas chegam a **~21**, com "fadiga
   alta em sequência" e "interferência alta em sequência" repetidos par a par. Decidir se a Fase 3
   agrupa ou limita visualmente.
2. **`ExerciseRow`:** a descrição do exercício saiu da linha principal e foi para dentro de **"Ver
   detalhes"** (fiel à spec, que mandava "o resto atrás de Ver detalhes"). Decidir se fica assim.
```

## COMO PROVEI

- `git show --stat --oneline a6f61f0` — exit 0. Confirma os 6 arquivos criados e os 4 alterados exatamente como descritos no despacho (mais `PEDIDOS-LOG.md`, +3 linhas, que não citei por ser gancho automático), e que `package.json` **não** foi tocado.
- `node -p "require('./package.json').version"` → `2.67.1`; `wc -l lib/prescription/presentation.ts` → 469 linhas; `library-coverage.test.ts` → 29 linhas (o despacho não deu número; registrei sem contagem).
- `npx tsc --noEmit` → `TSC_EXIT=0`. `npx vitest run` → `Test Files 28 passed (28)` / `Tests 330 passed (330)`, comando com exit code 0. Ou seja, reproduzi por conta própria as duas primeiras provas do despacho no repositório real.
- `git status --short` após a edição → apenas ` M PROGRESSO.md`; `git diff --stat` → 1 arquivo, 57 inserções, 0 remoções.

## O QUE NÃO FIZ

- Não commitei nem dei push (o commit é do VP). A árvore está com `PROGRESSO.md` modificado e não staged.
- Não rodei `npm run build` (a prova de build do despacho segue sendo do VP; as outras duas eu reproduzi). Status do build nesta sessão: DESCONHECIDO por evidência própria.
- Não alterei nenhum outro arquivo — nem `ESTADO-DO-PROJETO.md`, nem `CLAUDE.md`, nem o registro de roteamento em outro lugar.
- Não mexi no bloco `## 🚧 EM ANDAMENTO (02/ago/2026) — FASE 1 da arquitetura clínica` (linha ~52 antes da edição). Observação para o VP: ele está marcado como em andamento com os lotes B e C ⬜, mas o bloco de topo declara essa Fase 1 concluída e congelada — é contradição residual dentro do arquivo, fora do escopo deste despacho.
- Não fiz nenhuma verificação visual da tela de plano nem validei os 7 cenários listados.</result>
<usage><subagent_tokens>38988</subagent_tokens><tool_uses>11</tool_uses><duration_ms>132095</duration_ms></usage>
</task-notification>

## 03/08/2026 22:55
A Implementação — Fase 2 está tecnicamente aprovada.

Decisões visuais:

1. DESCRIÇÃO DOS EXERCÍCIOS

Não quero que a descrição do exercício desapareça completamente da visão principal da biblioteca.

Manter em cada ExerciseRow ou card:

- nome oficial;
- descrição curta de uma linha;
- modelo/dose/duração de forma compacta;
- carga e fadiga;
- botão “Ver detalhes”.

A descrição curta deve:

- ajudar o terapeuta a reconhecer rapidamente a finalidade da atividade;
- ter no máximo uma ou duas linhas;
- usar truncamento visual quando necessário;
- não aumentar excessivamente a altura dos cards.

Dentro de “Ver detalhes”, manter:

- descrição completa;
- perfil cognitivo;
- modelo de execução;
- protocolo;
- carga;
- fadiga;
- interferência;
- modalidade;
- demais informações técnicas.

Não reintroduzir excesso de informação na linha principal.

2. AGRUPAMENTO DOS ALERTAS

Sim, o paredão de alertas deve ser tratado na próxima fase.

Não alterar agora o núcleo dos 18 alertas.

Não eliminar alertas.

Não fundir códigos técnicos.

Na futura exibição, agrupar ocorrências repetidas ou relacionadas visualmente.

Exemplos:

- três ocorrências de fadiga alta consecutiva:
  mostrar um grupo “Fadiga alta em sequência” com os pares envolvidos;

- múltiplas interferências altas:
  mostrar um grupo “Interferência elevada entre exercícios”;

- várias posições pouco recomendadas:
  consolidar em um grupo de organização da sessão.

O agrupamento será exclusivamente de apresentação.

O núcleo deve continuar retornando todas as ocorrências individuais para:

- rastreabilidade;
- testes;
- relatórios;
- futuras análises.

3. VALIDAÇÃO VISUAL

Antes de iniciar a Implementação — Fase 3:

- disponibilize esta versão para validação visual;
- faça o bump de versão necessário;
- publique na Vercel;
- não altere banco, APIs ou formato persistido;
- informe a URL ou ambiente implantado;
- confirme que o commit implantado contém a Fase 2.

Depois da publicação, vou validar manualmente:

- plano vazio;
- dentro do esperado;
- acima do esperado;
- excesso importante;
- fadiga alta consecutiva;
- planejamento consecutivo;
- plano legado;
- descrição curta dos exercícios;
- botão Salvar plano disponível nos cenários com alertas.

Não iniciar automaticamente a Fase 3 após publicar.

Pare e aguarde minha validação visual.

## 03/08/2026 23:14
<task-notification>
<task-id>ac2351b6c6335a253</task-id>
<tool-use-id>toolu_01LuqASak1hkUtRPMbM3zaXE</tool-use-id>
<output-file>/private/tmp/claude-501/-Users-kamyllahonorio-neuropeak/3e6ecf11-e4e5-471f-bbf9-4595faa53598/tasks/ac2351b6c6335a253.output</output-file>
<status>completed</status>
<summary>Agent "Registrar publicação v2.68.0" finished</summary>
<note>A task-notification fires each time this agent stops with no live background children of its own. The user can send it another message and resume it, so the same task-id may notify more than once.</note>
<result>## O QUE MUDOU

`/Users/kamyllahonorio/neuropeak/PROGRESSO.md` — inserido um bloco novo de 59 linhas no topo (logo após o cabeçalho, imediatamente ANTES de `## ✅ FASE 2 DA PRESCRIÇÃO ENTREGUE`). Nenhum outro arquivo tocado, nada commitado.

Trecho exato escrito (linhas 6–64 do arquivo):

```markdown
## 🚀 FASE 2b ENTREGUE E PUBLICADA (03/ago/2026) — descrição curta de volta à linha principal (`e98d069`, v2.68.0)

Continuação direta da Fase 2 abaixo. Ela **aprovou tecnicamente a Fase 2** e tomou três decisões:

1. **A descrição do exercício NÃO pode sumir da linha principal** da biblioteca — na Fase 2 ela tinha
   ido inteira para dentro de "Ver detalhes". Volta **curta, em uma linha, truncada**, sem inchar o cartão.
2. **O agrupamento visual dos alertas fica para a FASE 3, explicitamente.** O **núcleo dos 18 alertas
   NÃO muda** e continua devolvendo **todas as ocorrências individuais** — rastreabilidade, testes,
   relatórios e análises futuras dependem disso. O agrupamento será **exclusivamente de apresentação**.
   Exemplos dela: juntar as ocorrências de "fadiga alta em sequência" num grupo só, com os pares
   envolvidos; agrupar as interferências altas; consolidar as posições pouco recomendadas num grupo
   de organização da sessão.
3. **Publicar esta versão** para validação visual dela **antes de qualquer Fase 3**.

### O que entrou

- **Linha principal de cada exercício:** nome oficial · **descrição em uma linha truncada** (texto
  completo no `title` do hover) · modelo/dose/duração · etiquetas de carga e fadiga · "Ver detalhes".
- **Dentro de "Ver detalhes", rotulados:** descrição completa · perfil cognitivo · modelo de execução ·
  protocolo · carga/fadiga/interferência · modalidade quando aplicável.
- **`lib/prescription/presentation.ts`** ganhou dois campos: **`protocolLabel`** e
  **`cognitiveProfileLabel`**, derivados de `protocols.PADRAO`, `mechanicalPrimary` e
  `associatedCognitiveProfiles`.
- **`ExerciseCard`** passou a receber a prop **`description`** (não recebia); **`PlanBuilderSidebar`** a repassa.

### Roteamento (regra 8)

Codificação no **Codex `gpt-5.6-sol`, esforço high, lab `fase2b`**, spec em
`docs/spec-impl-fase2b-descricao.md` (`8eefc2d`). **Escopo respeitado** — só os 6 arquivos permitidos.
Dois consertos pós-colheita do **Claude Opus 5 xhigh (exceção 1 da regra 8)**: removido um dicionário
de reacentuação que era **código morto** (o catálogo já entrega português acentuado, então as chaves
sem acento nunca casavam) e corrigido o **teste sintético** que o sustentava, que usava o identificador
`ATENCAO_SUSTENTADA`, formato inexistente no catálogo real.

### Provas (repositório real)

`npx tsc --noEmit` exit 0 · `npx vitest run` **333/333** (eram 330 → **+3**) · `npm run build` exit 0.

### ✅ Publicação confirmada por evidência

`https://neuropeak-5jyl.vercel.app/api/version` → `{"appVersion":"2.68.0","buildId":"dpl_3qKhboJuMhC9w6tZTqC147b9AjVg"}` ·
`/api/health` → `{"ok":true}` · `git merge-base --is-ancestor a6f61f0 e98d069` confirmou que o commit
da Fase 2 está contido no deploy.

### ⏸️ PRÓXIMO PASSO — PARADO aguardando a validação visual dela; **NÃO iniciar a Fase 3**

Em `https://neuropeak-5jyl.vercel.app`, conferir com olho humano: **plano vazio · dentro do esperado ·
acima do esperado · excesso importante · fadiga alta consecutiva · planejamento consecutivo · plano
legado · descrição curta dos exercícios** — e, em **todos** os cenários com alertas, confirmar que o
botão **"Salvar plano"** continua disponível.

**Dois pontos que o VP quer que ela olhe:**

- **(a)** no **Caminhos para a Meta** o perfil sai como *"Organização · também recruta: organização e
  sequenciamento"* — redundância que vem do **dado congelado da Fase 1**, não da apresentação.
- **(b)** na linha principal aparece *"Por protocolo · Protocolo padrão · 6 min"* — modelo e dose
  **repetem a palavra protocolo**.
```

## COMO PROVEI

- `git log --oneline -3 &amp;&amp; git show e98d069 --stat &amp;&amp; node -p "require('./package.json').version"` → exit 0. Confirma o commit `e98d069` ("feat(prescricao): descrição curta na linha principal + perfil e protocolo nos detalhes (v2.68.0)"), a spec em `8eefc2d`, os **7 arquivos** tocados (os 6 de código/teste + `package.json`) e `package.json` em **2.68.0**. Os fatos do despacho batem com o repositório.
- `git status --porcelain &amp;&amp; git diff --stat` → exit 0. Saída: `M PROGRESSO.md` e `PROGRESSO.md | 59 +++++`, 1 arquivo, 59 inserções, 0 remoções. Nenhum outro arquivo alterado; nada staged, nada commitado.
- Posicionamento verificado pelo próprio diff: bloco inserido antes do cabeçalho da Fase 2, que segue intacto logo abaixo.

## O QUE NÃO FIZ

- Não commitei e não dei push (é do VP).
- Não alterei nenhum outro arquivo — nem código, nem `ESTADO-DO-PROJETO.md`, nem docs, nem memória.
- Não reexecutei `tsc`, `vitest`, `build` nem as chamadas a `/api/version` e `/api/health`: as provas registradas são as que o despacho trouxe do VP, não evidência colhida por mim nesta tarefa. Se o VP quiser reconfirmação independente dessas quatro provas, é um despacho novo.
- Não iniciei nem preparei nada da Fase 3.</result>
<usage><subagent_tokens>26668</subagent_tokens><tool_uses>4</tool_uses><duration_ms>63993</duration_ms></usage>
</task-notification>

## 03/08/2026 23:52
Encontramos uma inconsistência arquitetônica. Os parâmetros ajustáveis (tentativas, repetições, nível inicial etc.) alteram a dose clínica do exercício, mas o painel continua exibindo a duração, carga basal e fadiga do protocolo original. Isso quebra a consistência da prescrição.
Antes de continuar a implementação, precisamos definir uma regra única:
Todo parâmetro ajustável que modifica a dose clínica deve atualizar automaticamente duração estimada, carga basal e fadiga da sessão; ou
Esses parâmetros deixam de ser livres e passam a ser derivados exclusivamente do protocolo (Breve, Padrão ou Estendido).
Não implemente ainda. Faça primeiro uma análise arquitetônica indicando quais parâmetros realmente modificam a dose clínica de cada exercício e quais são apenas configurações que não alteram carga, duração ou fadiga.

## 04/08/2026 00:01
A análise confirmou a inconsistência. Vamos adotar uma terceira via, com as decisões abaixo.

Ainda NÃO implemente.

Primeiro atualize a arquitetura e produza uma especificação objetiva de implementação.

==================================================
1. REGRA CENTRAL DA DOSE
==================================================

Para NOVOS planos, o terapeuta não escolherá diretamente:

- número de tentativas;
- número de séries;
- número de rodadas;
- número de blocos.

Ele escolherá apenas:

- BREVE;
- PADRÃO;
- ESTENDIDO.

Cada protocolo define internamente a quantidade de unidades, conforme o catálogo de prescrição de cada exercício.

A duração exibida deverá sempre corresponder ao protocolo escolhido.

Não oferecer dose personalizada para novos planos nesta etapa.

O objetivo é preservar:

- previsibilidade de duração;
- coerência da sessão;
- consistência entre interface e motor;
- validade mínima da progressão;
- simplicidade para o terapeuta.

==================================================
2. INDICAÇÃO DOS PROTOCOLOS
==================================================

Além do nome, mostrar ao terapeuta uma explicação breve:

BREVE

Indicado para:

- primeiro contato com o exercício;
- baixa tolerância à fadiga;
- necessidade de introdução gradual;
- sessões curtas;
- composição com maior número de exercícios;
- pacientes com dificuldade de permanência;
- retorno após interrupção prolongada.

Aviso:

- em alguns exercícios, o protocolo breve pode produzir treino válido, mas não fornecer unidades suficientes para decisão adaptativa robusta;
- essa limitação deve aparecer quando aplicável.

PADRÃO

Indicado para:

- uso habitual;
- maioria das prescrições;
- treino com dose suficiente para adaptação;
- equilíbrio entre intensidade, duração e variedade;
- acompanhamento regular.

Deve ser a opção selecionada por padrão em novos planos.

ESTENDIDO

Indicado para:

- treino focal de um domínio;
- paciente já familiarizado com o exercício;
- boa tolerância à tarefa;
- sessão mais longa;
- menor quantidade de exercícios na sessão;
- necessidade clínica de maior repetição ou consolidação.

Aviso:

- pode aumentar fadiga;
- deve ser considerado junto à composição total da sessão;
- não significa automaticamente maior eficácia.

Esses textos são orientativos, não diagnósticos e não substituem o julgamento do terapeuta.

==================================================
3. SPANS
==================================================

Eliminar a inconsistência entre:

- painel atual: 10 / 15 / 20 / 30 tentativas;
- arquitetura: 4 / 8 / 12 séries.

Para novos planos, utilizar exclusivamente os valores definidos nos protocolos do catálogo.

O terapeuta vê:

- Breve;
- Padrão;
- Estendido.

Não vê nem altera diretamente o número de tentativas.

A quantidade interna pode aparecer em “Ver detalhes”, por exemplo:

- Breve — 4 séries;
- Padrão — 8 séries;
- Estendido — 12 séries.

Não alterar esses valores nesta etapa sem nova validação clínica.

==================================================
4. PLANOS ANTIGOS COM 10, 15, 20 OU 30 TENTATIVAS
==================================================

Não migrar, arredondar nem substituir automaticamente.

Preservar exatamente o valor salvo.

Classificar internamente como:

LEGACY_CUSTOM_DOSE

Comportamento:

- o plano antigo continua abrindo;
- continua executando com a quantidade original;
- a duração deve ser estimada conforme a dose legada, quando houver regra segura;
- não apagar o valor;
- não converter silenciosamente para Breve, Padrão ou Estendido;
- não alterar progressão nem histórico.

Ao editar um exercício legado, mostrar aviso discreto:

“Este exercício utiliza uma configuração anterior de dose.”

Oferecer ao terapeuta duas ações:

- Manter configuração atual;
- Converter para Breve, Padrão ou Estendido.

A conversão deve ser explícita e nunca automática.

Caso ainda não exista fórmula segura para estimar a duração de uma dose legada, mostrar:

“Duração aproximada — configuração anterior.”

Não inventar precisão.

==================================================
5. NÍVEL INICIAL
==================================================

O nível inicial não é dose.

Entretanto, ele não deve permanecer como um controle livre em toda edição do plano.

Nova regra:

PACIENTE SEM HISTÓRICO NO EXERCÍCIO

- permitir definir o nível inicial;
- utilizar preferencialmente uma recomendação automática;
- o terapeuta pode ajustar manualmente quando necessário.

PACIENTE COM HISTÓRICO

- mostrar o nível atual alcançado;
- informar que haverá retomada automática;
- não mostrar o slider rotineiro de nível inicial;
- não sobrescrever progresso ao salvar o plano.

Caso o terapeuta queira alterar o nível:

- utilizar ação separada “Redefinir nível”;
- mostrar nível atual e novo nível;
- explicar o impacto;
- exigir confirmação;
- preservar o histórico anterior;
- nunca rebaixar silenciosamente.

O nível pode alterar a dificuldade e o tempo por unidade, mas não deve modificar a duração estimada enquanto não houver dados empíricos suficientes para uma fórmula confiável.

Registrar essa limitação explicitamente.

==================================================
6. REPETIÇÃO DE ÁUDIO
==================================================

`allowReplay` não é dose.

Classificar como:

ASSISTIVE_PARAMETER

A repetição:

- não altera a quantidade prescrita;
- não altera automaticamente a duração estimada;
- não altera automaticamente a carga basal;
- deve ser registrada;
- pode alterar a comparabilidade e a demanda de memória.

Diferenciar:

- áudio intrínseco da tarefa;
- leitura assistiva de instrução;
- repetição de conteúdo que deveria ser memorizado.

Não criar fórmula de carga para repetição nesta etapa.

Apenas manter o parâmetro separado e registrar seu uso.

==================================================
7. CAMINHOS PARA A META
==================================================

O exercício permanece PROVISIONAL_PROFILE e será reformulado.

Não utilizar `atividadesSelecionadas` como quantidade livre de dose definitiva.

Na arquitetura futura:

- o protocolo define quantas unidades serão apresentadas;
- o terapeuta poderá escolher quais categorias ou tipos de atividade são elegíveis;
- escolher categorias não deve alterar o número total de unidades do protocolo;
- o motor seleciona as unidades dentro das categorias permitidas.

Exemplo conceitual:

- Breve: poucas unidades;
- Padrão: quantidade habitual;
- Estendido: maior número de unidades.

Os valores exatos serão reavaliados após a reformulação.

Não implementar essa mudança agora.

==================================================
8. ORDEM DA HISTÓRIA
==================================================

`unlockIntruso` e `unlockFalta` não devem controlar livremente a duração total.

Eles devem ser tratados como:

VARIANT_ELIGIBILITY

Ou seja:

- definem quais tipos de desafio podem aparecer;
- não aumentam automaticamente o número total de unidades;
- o protocolo continua definindo a quantidade da sessão;
- quando ativados, os desafios entram na amostragem das unidades prescritas.

Assim:

- Breve, Padrão e Estendido controlam a dose;
- Intruso e Falta controlam a variedade da tarefa.

Caso a mecânica atual não permita essa separação, documentar a alteração necessária, sem implementar ainda.

==================================================
9. OUTROS PARÂMETROS ADMINISTRATIVOS
==================================================

Classificar como administrativos:

- feedback;
- autoAdvance;
- demais preferências de apresentação ou fluxo.

Esses parâmetros:

- não alteram a dose prescrita;
- não alteram duração estimada;
- não alteram carga basal;
- não alteram fadiga no cálculo atual.

Caso algum parâmetro tenha impacto temporal real, registrar como limitação, sem inventar fórmula.

==================================================
10. MODELO CONCEITUAL
==================================================

Separar formalmente:

DOSE_PARAMETERS

- protocol;
- legacyCustomDose, apenas para compatibilidade.

DIFFICULTY_PARAMETERS

- startLevel, somente na primeira prescrição ou redefinição explícita;
- nível adaptativo atual;
- parâmetros internos de dificuldade.

ASSISTIVE_PARAMETERS

- allowReplay;
- leitura assistiva;
- outras ajudas.

VARIANT_PARAMETERS

- categorias elegíveis;
- tipos de desafio;
- modalidade, nos cinco exercícios aplicáveis.

ADMINISTRATIVE_PARAMETERS

- feedback;
- autoAdvance;
- preferências de fluxo.

Um parâmetro só pode pertencer a uma dessas categorias, salvo justificativa explícita.

==================================================
11. INTERFACE FUTURA DO AJUSTE
==================================================

O botão “Ajustar” deverá mostrar prioritariamente:

PROTOCOLO

- Breve;
- Padrão;
- Estendido.

Para cada opção, mostrar:

- indicação clínica resumida;
- quantidade interna de unidades;
- duração estimada;
- observação sobre validade adaptativa, quando necessária.

Depois, mostrar apenas as configurações realmente aplicáveis:

- modalidade, nos cinco exercícios;
- repetição de áudio, quando aplicável;
- variantes clínicas, quando aplicável;
- nível inicial somente se não houver histórico;
- nível atual e retomada automática quando houver histórico.

Remover da prescrição nova:

- tentativas livres;
- séries livres;
- slider de nível inicial indiscriminado.

==================================================
12. CARGA E FADIGA
==================================================

Nesta etapa:

- protocolo altera duração e quantidade de unidades;
- carga basal continua sendo propriedade da mecânica padrão;
- fadiga continua sendo a classificação basal definida;
- não recalcular numericamente carga e fadiga por protocolo ainda.

Mostrar, contudo, que:

- protocolo Estendido aumenta exposição e pode aumentar fadiga;
- protocolo Breve reduz exposição;
- isso é um modificador qualitativo até existir fórmula dinâmica validada.

Não exibir falsa precisão, como alterar carga 2 para 3 automaticamente sem modelo aprovado.

==================================================
13. DOCUMENTAÇÃO
==================================================

Atualize:

docs/prescription-architecture/07-parameter-dose-analysis.md

Crie:

docs/prescription-architecture/08-dose-parameter-decisions.md

Deve conter:

- decisões aprovadas;
- classificação dos parâmetros;
- comportamento dos planos legados;
- indicação de Breve/Padrão/Estendido;
- regras de nível;
- regras de repetição;
- regras das variantes;
- limitações;
- especificação futura da interface.

Produza também uma tabela dos 34 exercícios com:

- exercício;
- protocolo Breve;
- protocolo Padrão;
- protocolo Estendido;
- unidade interna;
- parâmetros de dose antigos;
- parâmetros que permanecerão visíveis;
- parâmetros que serão removidos da prescrição nova;
- impacto no legado.

==================================================
14. RELATÓRIO FINAL
==================================================

Apresente:

1. Quais controles atuais serão removidos.
2. Quais permanecerão.
3. Quais aparecerão apenas em condições específicas.
4. Como os planos antigos serão preservados.
5. Quais exercícios possuem dose legada.
6. Quais exercícios possuem variantes.
7. Quais possuem assistência de áudio.
8. Quais decisões ainda dependem da reformulação do exercício.
9. Arquivos que uma futura implementação precisará alterar.
10. Ordem segura de implementação.

Não implementar.

Não alterar código.

Não alterar banco.

Não criar migration.

Não alterar interface.

Não alterar exercícios.

Depois pare e aguarde validação.

## 04/08/2026 00:15
A análise de parâmetros e dose está validada.

Vamos implementar agora apenas os passos 1 a 5 da ordem segura:

1. Tipos e categorias de parâmetros.
2. Leitura e preservação da dose legada.
3. Gravação real do protocolo no plano.
4. Apresentação dos protocolos, indicações e avisos.
5. Substituição dos controles livres pelo seletor Breve / Padrão / Estendido.

NÃO implementar nesta etapa:

- redefinição de nível;
- leitura de histórico do paciente;
- reformulação de Caminhos para a Meta;
- reformulação de Ordem da História;
- carga dinâmica;
- fórmula de fadiga dinâmica;
- dose personalizada em novos planos;
- mudanças nos exercícios;
- mudanças na progressão adaptativa.

==================================================
1. MODELO DE PARÂMETROS
==================================================

Implementar formalmente as categorias:

- DOSE_PARAMETER
- DIFFICULTY_PARAMETER
- ASSISTIVE_PARAMETER
- VARIANT_PARAMETER
- ADMINISTRATIVE_PARAMETER

Implementar:

- BREVE
- PADRAO
- ESTENDIDO
- LEGACY_CUSTOM_DOSE

Regras:

- protocolo é o único controle de dose para novos planos;
- LEGACY_CUSTOM_DOSE existe somente para compatibilidade;
- variante pode modificar duração quando houver multiplicador explícito no catálogo;
- isso não transforma a variante em parâmetro de dose.

==================================================
2. LEITURA DE PLANOS LEGADOS
==================================================

Atualizar a leitura legada para reconhecer:

- trials;
- séries ou unidades históricas equivalentes;
- quantidade salva nas configurações antigas.

Nos dois spans:

- preservar exatamente 10, 15, 20 ou 30 tentativas;
- classificar como LEGACY_CUSTOM_DOSE;
- não converter automaticamente;
- não arredondar;
- não alterar execução;
- não alterar progressão;
- não apagar o campo antigo.

Para Caminhos para a Meta:

- preservar atividadesSelecionadas;
- marcar como configuração legada/provisória;
- não reinterpretar como protocolo definitivo;
- não alterar a execução atual.

==================================================
3. ESTIMATIVA DE DURAÇÃO LEGADA
==================================================

Não inventar fórmula quando não houver base segura.

Quando a dose legada puder ser estimada de maneira fundamentada:

- calcular a faixa;
- marcar o resultado como aproximado.

Quando não houver regra segura:

mostrar:

“Duração aproximada — configuração anterior.”

A interface deve distinguir:

- duração calculada por protocolo atual;
- duração aproximada de dose legada.

Nenhuma alteração automática no plano ao apenas abrir a tela.

==================================================
4. GRAVAÇÃO DOS NOVOS PLANOS
==================================================

Atualizar `lib/exercise-plan.ts` para gravar explicitamente o protocolo selecionado.

Para novos planos, salvar algo conceitualmente equivalente a:

- dose.protocol = BREVE | PADRAO | ESTENDIDO

Não depender de valores implícitos ou fallback silencioso.

Ao criar um novo exercício no plano:

- selecionar PADRAO por padrão;
- persistir PADRAO explicitamente;
- a duração exibida deve responder imediatamente ao protocolo escolhido.

Garantir que:

- mudar Breve → Padrão → Estendido atualize a duração;
- o resumo da sessão seja recalculado;
- carga basal permaneça igual;
- fadiga basal permaneça igual;
- a exposição maior ou menor apareça apenas como observação qualitativa.

==================================================
5. NOVA INTERFACE DE AJUSTE
==================================================

Remover de novos planos:

- seletor livre de 10 / 15 / 20 / 30 tentativas;
- número livre de séries;
- número livre de blocos;
- slider indiscriminado de nível inicial.

No botão “Ajustar”, mostrar primeiro:

PROTOCOLO DE TREINO

BREVE

Texto orientativo:

“Dose reduzida. Pode ser útil para introdução à atividade, menor tolerância à fadiga, retorno após pausa ou sessões com maior variedade de exercícios.”

PADRÃO

Texto orientativo:

“Dose habitual recomendada para a maioria dos treinos, equilibrando duração, repetição e adaptação.”

ESTENDIDO

Texto orientativo:

“Dose ampliada para treino focal, maior familiaridade com a tarefa ou sessões com menor número de exercícios. Pode aumentar a fadiga.”

Mostrar em cada opção:

- quantidade interna de unidades;
- duração estimada;
- observação sobre progressão adaptativa, quando aplicável.

Exemplo:

Padrão
8 séries
Estimativa: 6–7 min

Não mostrar tentativas ou séries como campo editável.

==================================================
6. PLANOS LEGADOS NA INTERFACE
==================================================

Quando o exercício possuir LEGACY_CUSTOM_DOSE, mostrar:

“Configuração anterior de dose”

Exibir o valor preservado, por exemplo:

“15 tentativas”

Disponibilizar:

- Manter configuração atual;
- Converter para Breve;
- Converter para Padrão;
- Converter para Estendido.

A conversão:

- só ocorre após ação explícita;
- deve mostrar antes o que mudará;
- deve exigir confirmação;
- substitui a dose antiga pelo protocolo escolhido;
- não altera nível, progresso ou histórico.

Apenas abrir ou salvar outro campo não pode converter a dose.

==================================================
7. CONTROLES QUE PERMANECEM
==================================================

Manter, quando aplicável:

- modalidade;
- repetição de áudio;
- feedback;
- autoAdvance;
- variantes clínicas.

Mas separá-los visualmente do protocolo.

Estrutura sugerida:

1. Dose do treino
2. Modalidade e variantes
3. Assistência
4. Preferências de execução

Para modalidade:

- pode modificar duração quando o catálogo possuir durationMultiplier;
- recalcular a faixa automaticamente;
- não alterar carga ou fadiga numericamente nesta etapa.

Para allowReplay:

- não tratar como dose;
- manter registrado;
- explicar que a repetição reapresenta o conteúdo auditivo;
- não recalcular duração, carga ou fadiga.

==================================================
8. NÍVEL
==================================================

Nesta etapa, não implementar a nova regra completa de nível com histórico.

Entretanto:

- remover o slider indiscriminado dos novos ajustes apenas se isso não quebrar planos atuais;
- não apagar valores antigos;
- não sobrescrever nível;
- não redefinir progresso;
- não criar um novo comportamento provisório.

Caso a remoção dependa de acesso ao histórico ainda inexistente:

- manter o controle atual temporariamente;
- marcar visualmente como “Configuração de nível — revisão futura”;
- documentar a dívida técnica;
- não fingir que a regra definitiva já foi implementada.

Prefira preservar comportamento a introduzir uma redefinição incorreta.

==================================================
9. CAMINHOS PARA A META E ORDEM DA HISTÓRIA
==================================================

Não reformular agora.

Caminhos para a Meta:

- manter PROVISIONAL_PROFILE;
- preservar configuração atual;
- não exibir protocolo como se fosse definitivo, caso os valores ainda sejam provisórios;
- indicar discretamente “Configuração provisória”.

Ordem da História:

- preservar unlockIntruso e unlockFalta;
- não fingir que atualmente são apenas variantes se ainda aumentam etapas;
- documentar na interface ou internamente que a separação dose × variedade será feita na reformulação.

==================================================
10. TESTES OBRIGATÓRIOS
==================================================

Criar testes para:

1. Novo plano grava PADRAO explicitamente.
2. Breve, Padrão e Estendido geram durações diferentes.
3. `trials: 10`, `15`, `20` e `30` são preservados.
4. Dose legada não é convertida ao abrir.
5. Dose legada não é convertida ao salvar outro campo.
6. Conversão só ocorre por ação explícita.
7. Modalidade recalcula duração quando possui multiplicador.
8. Modalidade não altera carga basal.
9. allowReplay não altera duração, carga ou fadiga.
10. Nenhum protocolo permite editar livremente a quantidade.
11. Planos antigos continuam abrindo.
12. Os testes existentes continuam passando.
13. Nenhum nível ou progresso é alterado.
14. Caminhos para a Meta e Ordem da História preservam o funcionamento atual.

==================================================
11. VALIDAÇÃO VISUAL
==================================================

Validar manualmente:

- novo Span Direto;
- novo Span Inverso;
- Span legado com 15 tentativas;
- conversão explícita de legado para Padrão;
- exercício comum em Breve/Padrão/Estendido;
- exercício com modalidade;
- exercício com allowReplay;
- Caminhos para a Meta;
- Ordem da História.

Confirmar que a duração da sessão muda imediatamente ao trocar o protocolo.

==================================================
12. ENTREGA
==================================================

Ao final apresentar:

1. Arquivos criados e alterados.
2. Diff resumido.
3. Resultado dos testes.
4. Exemplo real de Breve/Padrão/Estendido.
5. Exemplo real de plano legado preservado.
6. Exemplo de conversão explícita.
7. Prova de que nível e progresso não foram modificados.
8. Controles removidos.
9. Controles mantidos.
10. Limitações restantes.
11. Prints da nova janela “Ajustar”.

Não iniciar a implementação de nível com histórico.

Não reformular exercícios.

Não iniciar nova fase automaticamente.

Pare para validação visual.

## 04/08/2026 00:35
<task-notification>
<task-id>bzne5c4qu</task-id>
<tool-use-id>toolu_01FkAVFd8PxmoJnYrrFXMXbb</tool-use-id>
<output-file>/private/tmp/claude-501/-Users-kamyllahonorio-neuropeak/3e6ecf11-e4e5-471f-bbf9-4595faa53598/tasks/bzne5c4qu.output</output-file>
<status>completed</status>
<summary>Background command "Disparar o lote 1" completed (exit code 0)</summary>
</task-notification>

## 04/08/2026 00:41
Perfeito.

Pode concluir normalmente o Lote 2.

Na validação visual vou observar principalmente:

1. Se a janela "Ajustar" ficou simples e intuitiva para o terapeuta.

2. Se a diferença entre Breve, Padrão e Estendido é compreendida apenas lendo a interface, sem necessidade de documentação externa.

3. Se a troca do protocolo atualiza imediatamente a duração estimada da sessão.

4. Se os planos legados aparecem claramente identificados como configuração anterior, oferecendo apenas:
- Manter configuração atual;
- Converter para Breve;
- Converter para Padrão;
- Converter para Estendido.

Sem conversão automática.

5. Se a organização ficou nesta ordem:

- Dose do treino
- Modalidade e variantes
- Assistência
- Configurações de nível (temporariamente, até a futura revisão)

6. Se a interface continua limpa e não aumentou excessivamente a carga visual.

Depois da entrega vou validar visualmente antes de qualquer nova implementação.

## 04/08/2026 00:43
Perfeito.

Pode concluir normalmente o lote 2.

Apenas uma observação importante.

O aviso sobre validade adaptativa do protocolo Breve não deve aparecer por uma regra genérica do tipo “poucas unidades”.

Ele deve existir apenas quando isso estiver explicitamente documentado para aquele exercício no catálogo de prescrição.

Ou seja, a regra deve ser específica por exercício, não derivada automaticamente da quantidade de unidades.

Se ainda não houver essa informação validada para determinado exercício, prefiro não exibir esse aviso nesta etapa.

Outro ponto: a quantidade interna mostrada ao terapeuta deve utilizar a unidade real de cada exercício, e não a palavra “séries” de forma genérica.

Exemplos:

- Span: séries;
- Restaurante: pedidos, se essa for a unidade definida;
- Supermercado: listas ou rodadas, conforme o catálogo;
- Informação em Foco: rodadas;
- Jogo das Torres: desafios.

Utilize sempre a unidade já registrada no catálogo de prescrição. Não invente nem renomeie unidades nesta etapa.

Sobre a carga visual, concordo com sua decisão.

Não recolha automaticamente nenhuma seção antes da validação visual.

Primeiro quero ver a interface completa.

Depois decidiremos, com a tela aberta, quais seções permanecem expandidas por padrão e quais poderão iniciar recolhidas.

Prefiro tomar essa decisão observando a experiência real de uso, e não antecipadamente.

## 04/08/2026 00:45
Perfeito. Pode aplicar as três correções conforme descrito.

Apenas ajuste a linguagem do aviso do protocolo Breve.

Como os 34 exercícios possuem clinicalValidity indicando quantidade insuficiente para progressão, não quero que a interface apresente apenas “Insuficiente para progressão”, pois isso pode fazer o terapeuta interpretar que o protocolo Breve é inadequado ou que não produz treino útil.

Utilize uma mensagem neutra e clinicamente clara:

“Treino válido em dose reduzida. O desempenho desta sessão pode não ser suficiente, isoladamente, para atualizar o nível adaptativo.”

Essa mensagem deve deixar claro que:

- o protocolo Breve continua sendo uma opção válida de treino;
- ele pode ser indicado para introdução, menor tolerância, retorno após pausa ou maior variedade na sessão;
- a limitação se refere apenas à robustez da decisão adaptativa naquela execução;
- isso não representa erro, contraindicação ou perda do treino realizado.

Mantenha as unidades exatamente como estão registradas no catálogo nesta etapa:

- Span: séries;
- Restaurante: rodadas;
- Informação em Foco: tentativas;
- Supermercado: rodadas;
- Jogo das Torres: desafios completos.

Corrija também o protocolLabel para usar a unidade real de cada exercício, sem “blocos” genéricos.

Mantenha a quarta seção como “Configurações de nível” e feedback/autoAdvance em uma quinta seção.

Não recolha nenhuma seção antes da validação visual.

Pode concluir o lote 2 e parar para eu revisar a tela.

## 04/08/2026 00:50
vc esta fazendo?

## 04/08/2026 05:26
<task-notification>
<task-id>bwv4pav74</task-id>
<tool-use-id>toolu_01EMEmuQqyKWw9s8B7hWCTyJ</tool-use-id>
<output-file>/private/tmp/claude-501/-Users-kamyllahonorio-neuropeak/3e6ecf11-e4e5-471f-bbf9-4595faa53598/tasks/bwv4pav74.output</output-file>
<status>completed</status>
<summary>Background command "Disparar o lote 2 sem interromper" completed (exit code 0)</summary>
</task-notification>

## 04/08/2026 09:06
Pode publicar esta versão para validação visual.

Faça o bump de versão, publique na Vercel e confirme:

- appVersion;
- buildId;
- health check;
- commit publicado;
- que a entrega do Lote 2 está contida no deploy.

Não iniciar nenhuma nova fase.

Depois da publicação, vou validar principalmente:

1. A janela “Ajustar” com as cinco seções:
   - Dose do treino;
   - Modalidade e variantes;
   - Assistência;
   - Configurações de nível;
   - Preferências de execução.

2. Se Breve, Padrão e Estendido estão claros e visualmente equilibrados.

3. Se a duração da sessão muda imediatamente ao trocar o protocolo.

4. Se as unidades aparecem corretamente:
   - séries;
   - rodadas;
   - tentativas;
   - desafios completos.

5. Se o aviso do Breve está claro e não faz o protocolo parecer inadequado.

6. Se o plano legado preserva a dose antiga e oferece conversão explícita.

7. Se Caminhos para a Meta aparece como provisório sem esconder o valor preservado.

8. Se a janela ficou visualmente pesada ou extensa demais.

9. Se o botão Salvar plano continua funcionando normalmente.

Não alterar código durante a publicação, salvo ajuste estritamente necessário para o deploy.

Após publicar, pare e aguarde minha validação visual.

## 04/08/2026 09:12
<task-notification>
<task-id>a964c4d14e3abecfd</task-id>
<tool-use-id>toolu_01QZiCk3VmYVBRmzSdKAkSLn</tool-use-id>
<output-file>/private/tmp/claude-501/-Users-kamyllahonorio-neuropeak/3e6ecf11-e4e5-471f-bbf9-4595faa53598/tasks/a964c4d14e3abecfd.output</output-file>
<status>completed</status>
<summary>Agent "Registrar publicação v2.69.0" finished</summary>
<note>A task-notification fires each time this agent stops with no live background children of its own. The user can send it another message and resume it, so the same task-id may notify more than once.</note>
<result>Feito. Único arquivo tocado: `/Users/kamyllahonorio/neuropeak/PROGRESSO.md`.

## O QUE MUDOU

**(A)** O bloco ativo virou histórico, no padrão que o arquivo já usa (`## (histórico) EM ANDAMENTO — ...` + nota de encerramento em citação, igual ao bloco da Fase 1 na linha 314). Os **8** marcadores `⬜` das duas tabelas viraram `✅`. Registrei também a divergência entre plano e entrega (o passo 2.1 previa 4 seções; ela pediu 5).

**(B)** Novo bloco no topo (linha 6), antes de todos os outros.

## COMO PROVEI

- `git status --porcelain` → `M PROGRESSO.md` apenas — exit 0. Nenhum outro arquivo tocado, nenhum commit.
- `git diff --stat` → `1 file changed, 104 insertions(+), 10 deletions(-)`.
- `grep -n '⬜\|| ✅ |'` → os 8 passos (1.1–1.4, 2.1–2.4) aparecem com `✅`; zero `⬜` restante no arquivo.
- `grep -n '^## '` → o bloco novo é o primeiro (linha 6); o único `🚧` restante no arquivo já era histórico anterior (linha 708).

## O QUE NÃO FIZ

Não commitei, não dei push, não rodei build/testes nem re-verifiquei as URLs de produção — os fatos do despacho foram transcritos como recebidos, não reconferidos por mim. Não alterei nenhum outro arquivo nem os textos dos blocos históricos anteriores.

Trecho exato acrescentado no topo (linhas 6–95) e o cabeçalho reescrito:

```markdown
## 🚀 DOSE POR PROTOCOLO ENTREGUE E PUBLICADA (04/ago/2026) — `0873db8`, v2.69.0

Os 8 passos do plano abaixo (1.1 a 1.4 e 2.1 a 2.4) foram executados, provados e publicados.
**Commits:** lote 1 = `b491e92` (núcleo puro) · lote 2 = `6165264` (interface) · release = `0873db8`.

### LOTE 1 — núcleo puro (`b491e92`)

Codex **`gpt-5.6-sol`, esforço xhigh, lab `dose1`**.

- **categorias formais de parâmetro** em `types.ts` e a **dose legada** como kind **`legacyCustom`**;
- **precedência de leitura** em `legacy.ts`: **`dose` &gt; `settings.protocol` &gt; `settings.trials`**;
- **`legacyDoseMinutes`** em `duration.ts` **restrita aos exercícios com taxa por unidade constante
  nos três protocolos** — nos demais não há faixa;
- os **textos dos três protocolos** em `presentation.ts`.

### LOTE 2 — interface (`6165264`)

Codex **`gpt-5.6-sol`, esforço high, lab `dose2b`**.

- **`ProtocolDoseSection`** e **`PrescriptionSection`** novos;
- janela **"Ajustar"** em **cinco seções**, na ordem que ela definiu — **Dose do treino · Modalidade e
  variantes · Assistência · Configurações de nível · Preferências de execução** — **nenhuma recolhida**;
- **`convertLegacyDose`** como **função pura** em `lib/prescription/dose-settings.ts`;
- **`exercise-plan.ts`** grava o protocolo **explicitamente**.

### Três correções que ela pediu — aplicadas

1. **Aviso do protocolo Breve** passou a sair do campo **`clinicalValidity` do catálogo, por exercício**,
   em vez de regra genérica por quantidade de unidades. Texto neutro aprovado por ela:
   *"Treino válido em dose reduzida. O desempenho desta sessão pode não ser suficiente, isoladamente,
   para atualizar o nível adaptativo."*
2. **`protocolLabel` passou a usar a unidade real de cada exercício** — **8 séries** no Span, **5 rodadas**
   no Restaurante e no Supermercado, **5 tentativas** na Informação em Foco, **2 desafios completos** no
   Jogo das Torres — em vez de "blocos" para os 34. O **teste que consagrava o defeito foi corrigido**.
3. **Quarta seção nomeada "Configurações de nível"** e **quinta** com **feedback/`autoAdvance`**.

### Consertos pós-colheita — Claude Opus 5 xhigh (exceção 1 da regra 8)

- **erro de tipagem** em `convertLegacyDose`;
- a marca **"Configuração provisória"** estava **sobrescrevendo o rótulo da dose**: o teste que a expunha
  passou a usar um exercício **não colinear e não provisório** (`jogo-memoria`), e o **caso provisório
  ganhou asserção própria**.

### Evidências executadas (comportamento)

- **a duração da sessão muda por protocolo** — Span + Jogo da Memória: **Breve 6,5–9 min · Padrão
  13,5–16 min · Estendido 20,5–23 min**;
- **plano novo grava** `[{"id":"jogo-memoria","settings":{"protocol":"PADRAO"}}]`;
- **abrir plano legado** com `{trials:15, level:4}` devolve **o mesmo objeto, sem mutação**;
- **conversão explícita** transforma `{trials:15, level:4, allowReplay:true}` em
  `{level:4, allowReplay:true, protocol:"PADRAO"}` — **remove `trials`, preserva o nível**.

### Provas (repositório real)

`npx tsc --noEmit` exit 0 · `npx vitest run` **375/375 em 30 arquivos** (eram **333** antes do lote 1 →
**+42**) · `npm run build` exit 0 · **botão de salvar inalterado** em `disabled={saving || items.length === 0}`.

### ✅ Publicação confirmada por evidência

`https://neuropeak-5jyl.vercel.app/api/version` →
`{"appVersion":"2.69.0","buildId":"dpl_AgCRt8a2faZZxwbmVprskcWg4bBz"}` · `/api/health` → `{"ok":true}` ·
`git merge-base --is-ancestor` confirmou que **`b491e92` e `6165264` estão contidos em `0873db8`**.

### ⚠️ Incidente — lição de operação do Codex

No **primeiro disparo do lote 2** o VP interpretou **CPU baixa do processo `codex` como travamento** e
**matou o processo, removendo o lab e perdendo trabalho em andamento**. O `codex` é **cliente de API** e
fica **ocioso esperando resposta do servidor** — **CPU baixa é comportamento normal, não sinal de
travamento**. Depois, um **disparo em primeiro plano foi morto pelo timeout de 10 minutos da ferramenta**.
**O disparo correto é em segundo plano, aguardando a notificação sem interromper.**

### Limitações que permanecem

- **nível ainda é slider livre** — regra com histórico ficou fora do escopo;
- **Ordem da História** ainda **acrescenta etapas de verdade** com `unlockIntruso`/`unlockFalta`, e a
  interface **declara isso** em vez de fingir que já são variantes;
- **Caminhos para a Meta** segue **provisório**;
- nos **15 exercícios de taxa não constante** a dose legada **não tem faixa** — só o texto
  *"Duração aproximada — configuração anterior"*.

### ⏸️ PRÓXIMO PASSO — PARADO aguardando a validação visual dela; **NÃO iniciar nenhuma nova fase**

Em `https://neuropeak-5jyl.vercel.app`, ela vai olhar: **as cinco seções da janela "Ajustar"** · se
**Breve/Padrão/Estendido** estão claros e equilibrados · se a **duração muda imediatamente** ao trocar o
protocolo · se as **unidades aparecem corretas** (séries, rodadas, tentativas, desafios completos) · se o
**aviso do Breve** está claro **sem fazer o protocolo parecer inadequado** · se o **plano legado preserva a
dose antiga e oferece conversão explícita** · se **Caminhos para a Meta** aparece como **provisório sem
esconder o valor preservado** · se a **janela ficou pesada ou extensa demais** · e se o botão
**"Salvar plano"** continua funcionando.


## (histórico) EM ANDAMENTO — DOSE POR PROTOCOLO: implementação dos passos 1 a 5 da ordem segura

&gt; **Encerrado em 04/ago/2026:** os **8 passos** (1.1 a 1.4 e 2.1 a 2.4) foram entregues, provados e
&gt; publicados em `0873db8` (v2.69.0) — registro no topo. Mantido como registro do fatiamento, das
&gt; decisões de desenho e do roteamento usados. **Diferença entre plano e entrega:** o passo **2.1**
&gt; previa **4 seções** na janela "Ajustar"; ela pediu **5**, com **"Configurações de nível"** própria.
```</result>
<usage><subagent_tokens>34608</subagent_tokens><tool_uses>8</tool_uses><duration_ms>112539</duration_ms></usage>
</task-notification>

## 04/08/2026 09:45
Vamos realizar uma etapa de refinamento clínico e de UX na área de prescrição do terapeuta.

A versão atual da dose por protocolo está aprovada e deve permanecer funcional.

Esta etapa possui três objetivos:

1. retirar o ajuste rotineiro de nível da prescrição;
2. melhorar o espaçamento e a hierarquia visual da janela “Ajustar”;
3. corrigir a filosofia e a apresentação dos alertas clínicos.

Não iniciar tutoriais, modo autoguiado ou qualquer outra fase.

==================================================
PRINCÍPIOS GERAIS
==================================================

O NeuroPeak é uma plataforma de TREINO COGNITIVO.

Não é instrumento de avaliação psicológica.

Não utilizar princípios de contaminação de teste como se fossem regras universais de treino.

Em treino cognitivo:

- dois exercícios podem trabalhar o mesmo domínio intencionalmente;
- uma sessão pode ser ampla ou focal;
- concentração em memória operacional, atenção, planejamento ou outra função pode ser uma decisão clínica legítima;
- sobreposição cognitiva não significa automaticamente combinação ruim;
- o sistema deve informar o terapeuta, não corrigir ou reprovar sua escolha.

Todos os alertas continuam consultivos.

Nunca bloquear salvamento.

==================================================
PARTE 1 — CONFIGURAÇÕES DE NÍVEL
==================================================

Hoje o botão “Ajustar” apresenta:

CONFIGURAÇÕES DE NÍVEL

Configuração de nível — revisão futura

Nível inicial
3 / 10

Essa configuração não deve permanecer como parte rotineira da prescrição.

O nível pertence ao sistema adaptativo e ao histórico de desempenho do paciente, não à dose prescrita pelo terapeuta.

Para o fluxo habitual:

- o paciente inicia no nível inicial definido pela mecânica;
- o exercício progride automaticamente conforme o desempenho;
- o paciente retoma do ponto alcançado;
- o terapeuta acompanha a evolução;
- o terapeuta não precisa escolher um nível toda vez que prescreve ou edita o plano.

Portanto:

1. Remover da janela “Ajustar”:
   - seção “Configurações de nível”;
   - slider de nível inicial;
   - texto “revisão futura”.

2. Não apagar, migrar ou alterar:
   - nível já salvo;
   - progresso existente;
   - histórico;
   - regra adaptativa;
   - startLevel legado;
   - nível atual do paciente.

3. Apenas deixar de expor esse controle no fluxo rotineiro de prescrição.

4. Novos planos não devem redefinir o nível ao serem salvos.

5. Planos antigos com `level` ou `startLevel` devem manter esses campos intactos.

6. Não implementar ainda uma nova tela de redefinição.

Registrar como futura funcionalidade separada:

REDEFINIR NÍVEL

Essa ação futura deverá:

- ficar na área de evolução/histórico do paciente, não no botão “Ajustar”;
- ser utilizada apenas em casos específicos;
- mostrar o nível atual e o novo;
- exigir confirmação;
- preservar o histórico;
- nunca rebaixar ou reiniciar silenciosamente.

Nesta etapa, apenas remover o controle da prescrição e proteger os dados existentes.

==================================================
PARTE 2 — JANELA “AJUSTAR”
==================================================

A estrutura conceitual está aprovada:

1. Dose do treino
2. Modalidade e variantes
3. Assistência
4. Preferências de execução

A seção de nível será removida.

O painel está visualmente comprimido. Refinar sem redesenhar completamente.

Objetivos:

- aumentar o respiro vertical;
- melhorar a leitura;
- manter o painel clínico e discreto;
- evitar textos colados;
- não aumentar excessivamente a altura total.

Nos cartões Breve, Padrão e Estendido:

- manter nome;
- manter unidade real;
- manter estimativa;
- manter descrição;
- manter destaque do selecionado.

Ajustar os espaçamentos aproximadamente assim:

- mais espaço entre nome e quantidade;
- mais espaço entre quantidade e descrição;
- mais espaço antes das observações de exposição;
- mais espaço antes do aviso do Breve;
- padding interno um pouco maior;
- separação mais clara entre os três protocolos.

Não alterar:

- valores de unidades;
- durações;
- protocolos;
- seleção padrão;
- cálculo da sessão;
- dose legada.

Aviso do Breve:

Manter o conteúdo clínico aprovado, mas reduzir o peso visual.

Texto:

“Treino válido em dose reduzida. O desempenho desta sessão pode não ser suficiente, isoladamente, para atualizar o nível adaptativo.”

Apresentar como informação clínica discreta, não como alerta de erro:

- fundo neutro ou azul/cinza discreto;
- menor contraste que um alerta;
- opcionalmente ícone informativo;
- não usar aparência de advertência grave.

Manter as unidades reais do catálogo:

- séries;
- rodadas;
- tentativas;
- desafios completos;
- demais unidades específicas.

Não usar “blocos” genericamente.

Modalidade:

Manter:

- Visual;
- Visual e áudio;
- Somente áudio.

Manter o recálculo de duração quando houver multiplicador definido.

Assistência:

Para repetição de áudio, substituir o texto atual por algo mais claro:

“Repetir o áudio reapresenta o conteúdo auditivo. Não altera a dose prescrita nem a estimativa atual.”

Não chamar automaticamente de acessibilidade quando o áudio repetido for o próprio conteúdo que deveria ser memorizado.

==================================================
PARTE 3 — ANÁLISE E ALERTAS DO PLANO
==================================================

O problema atual é conceitual:

`DECLARED_BAD_COMBINATION` está tratando sobreposição de processos como combinação desfavorável.

Isso é inadequado para treino cognitivo.

A seção atual “REVISÃO RECOMENDADA” mistura:

- problemas objetivos da sessão;
- fadiga;
- duração;
- carga;
- semelhança de exercícios;
- concentração intencional de um domínio;
- posição preferencial;
- simples informações.

Reorganizar em três níveis visuais:

1. REVISÃO DO PLANO
2. OBSERVAÇÕES CLÍNICAS
3. INFORMAÇÕES

Não usar “Revisão recomendada” como bloco único para tudo.

==================================================
3.1 — REVISÃO DO PLANO
==================================================

Manter nesta categoria apenas condições objetivas que realmente justificam revisar a composição:

- duração acima da faixa;
- excesso importante;
- carga basal acima da referência heurística;
- quantidade elevada de atividades de fadiga alta;
- fadiga alta consecutiva;
- interferência alta consecutiva;
- excesso de janelas de planejamento;
- janelas de planejamento consecutivas;
- outras incompatibilidades objetivas já aprovadas na arquitetura.

Essas mensagens devem continuar consultivas.

Exemplos de linguagem:

“Carga elevada para a duração escolhida.”

“Duração estimada acima da sessão prescrita.”

“Há atividades de fadiga alta em sequência.”

Nunca:

- “plano inválido”;
- “combinação errada”;
- “não pode”;
- bloqueio de salvar.

==================================================
3.2 — OBSERVAÇÕES CLÍNICAS
==================================================

Semelhança de processo, modalidade ou estratégia deve ir para esta categoria, quando realmente for útil.

Não classificar como erro.

Não usar:

- “combinação desfavorável”;
- “contaminação”;
- “reduz a comparabilidade”;
- “considere manter apenas uma”;
- “separe obrigatoriamente”.

Usar linguagem neutra, por exemplo:

“Os exercícios recrutam processos cognitivos semelhantes.”

“Há concentração de treino auditivo-verbal nesta sessão.”

“Ambas as atividades utilizam mapeamentos entre cor e resposta.”

“Há alta sobreposição de controle inibitório e alternância de regras.”

Complemento padrão:

“Essa concentração pode ser intencional em um plano focal. Caso o objetivo seja maior variedade, considere intercalar outro tipo de atividade.”

Não recomendar automaticamente retirar um exercício.

==================================================
3.3 — COMBINAÇÕES QUE NÃO DEVEM SER DESFAVORÁVEIS
==================================================

Remover como combinação desfavorável, no mínimo:

- Span Numérico Auditivo Direto + Span Numérico Auditivo Inverso;
- Letras em Sequência + Span Numérico Auditivo Direto;
- N-Back + Span Numérico Auditivo Inverso;
- Matriz Espacial + Matriz Espacial Inversa;
- Matriz Espacial Inversa + Matriz com Rotações;
- Cubos + Matriz Espacial;
- Cubos + Matriz com Rotações;
- Jogo da Memória + Matriz Espacial;
- Cubos + Jogo da Memória;
- Jogo da Memória + Sequência de Itens;
- Letras em Sequência + Lista com Distração;
- Lista com Distração + N-Back;
- Lista com Distração + Restaurante;
- Supermercado + Restaurante;
- Supermercado + Sequência de Itens;
- Supermercado + Informação em Foco;
- Compra Multifuncional + Informação em Foco.

Esses pares podem representar concentração legítima do domínio treinado.

Caso seja útil descrevê-los, usar somente “Observações clínicas”, sem recomendação de exclusão.

==================================================
3.4 — OUTRAS DECLARED_BAD_COMBINATION
==================================================

Auditar todas as regras atuais de `DECLARED_BAD_COMBINATION`.

Aplicar esta regra:

Similaridade ou sobreposição, isoladamente, NÃO pode gerar “Revisão do plano”.

Se a justificativa for apenas:

- dois exercícios treinam a mesma função;
- usam estímulos semelhantes;
- exigem busca visual;
- exigem memória verbal;
- exigem planejamento;
- trabalham controle inibitório;
- usam conteúdo de produtos;
- usam regras diretas/inversas;
- recrutam processos espaciais semelhantes;

então:

- remover como alerta de revisão;
- ou converter em observação clínica neutra;
- nunca sugerir manter apenas uma atividade.

Só manter como revisão quando houver uma justificativa objetiva e clinicamente defensável de:

- fadiga;
- interferência alta;
- impossibilidade temporal;
- sequência operacional problemática;
- risco real de execução;
- incompatibilidade documentada que não seja mera sobreposição.

Não inventar novos riscos clínicos.

==================================================
3.5 — POSIÇÃO PREFERENCIAL
==================================================

“Atividade fora da posição preferencial” deve permanecer apenas como informação discreta.

Não repetir dezenas de cartões extensos.

Agrupar visualmente, por exemplo:

“13 atividades estão fora de sua posição preferencial.”

Permitir expandir para ver:

- exercício;
- posição recomendada;
- justificativa.

Não apresentar como erro.

Não bloquear.

==================================================
3.6 — AGRUPAMENTO E REDUÇÃO DO PAREDÃO
==================================================

O núcleo pode continuar retornando ocorrências individuais para rastreabilidade.

A camada de apresentação deve agrupar ocorrências semelhantes.

Exemplos:

FADIGA ALTA EM SEQUÊNCIA

Em vez de vários cartões repetidos:

“Há 4 sequências de atividades com fadiga alta.”

Ao expandir, listar os pares.

SOBREPOSIÇÃO EXECUTIVA

Agrupar pares relacionados em uma única observação, quando possível.

POSIÇÃO PREFERENCIAL

Agrupar todas as ocorrências num único bloco expansível.

Apresentação inicial:

- mostrar no máximo os alertas mais relevantes;
- usar “Ver todas as observações” quando houver muitas;
- evitar uma coluna interminável;
- não apagar os dados individuais do núcleo.

==================================================
3.7 — TÍTULOS
==================================================

Substituir títulos genéricos repetidos como:

“Combinação que merece revisão”

por títulos informativos:

- “Concentração de treino verbal”
- “Sobreposição executiva”
- “Mapeamento cor–resposta semelhante”
- “Fadiga alta em sequência”
- “Planejamento consecutivo”
- “Carga elevada para a duração”
- “Duração acima da faixa prescrita”

Não exibir códigos técnicos.

==================================================
TESTES
==================================================

Criar ou atualizar testes para provar:

1. Span Direto + Inverso não gera revisão.
2. Matriz Espacial + Inversa não gera revisão.
3. Letras em Sequência + Span Direto não gera revisão.
4. Sessão focal em memória operacional pode ser salva sem mensagens de combinação desfavorável.
5. Sobreposição cognitiva aparece, quando aplicável, como observação neutra.
6. Nenhuma mensagem visível contém “combinação desfavorável”.
7. Nenhuma sugestão visível contém “manter apenas uma”.
8. Duração excessiva continua em revisão.
9. Carga elevada continua em revisão consultiva.
10. Fadiga alta consecutiva continua em revisão.
11. Planejamento consecutivo continua como ponto de atenção/revisão consultiva.
12. Posição preferencial aparece como informação agrupada.
13. Ocorrências individuais continuam disponíveis no resultado do núcleo.
14. Nenhum alerta bloqueia o salvamento.
15. O slider de nível não aparece na janela Ajustar.
16. Abrir e salvar plano antigo não altera level/startLevel.
17. Trocar protocolo continua atualizando a duração.
18. Modalidade continua funcionando.
19. Todos os testes existentes continuam passando.
20. Build e TypeScript sem erros.

==================================================
VALIDAÇÃO VISUAL
==================================================

Validar manualmente:

1. Exercício com Breve/Padrão/Estendido.
2. Exercício com modalidade.
3. Exercício com repetição de áudio.
4. Plano focal em memória operacional.
5. Plano com Span Direto + Inverso.
6. Plano com Matriz Direta + Inversa.
7. Plano com duração excessiva.
8. Plano com fadiga alta consecutiva.
9. Plano com várias posições preferenciais.
10. Plano teste com os 34 exercícios.

Na validação com 34 exercícios:

- carga e duração devem continuar alertando;
- o painel não deve virar um paredão de combinações desfavoráveis;
- observações semelhantes devem estar agrupadas;
- Salvar plano deve continuar disponível.

==================================================
ESCOPO
==================================================

Pode alterar:

- núcleo e apresentação dos alertas;
- componentes do resumo da prescrição;
- componentes da janela Ajustar;
- testes correspondentes.

Não alterar:

- exercícios;
- progressão adaptativa;
- nível atual do paciente;
- banco;
- migrations;
- APIs, salvo necessidade técnica comprovada e previamente explicada;
- protocolos e durações já aprovados;
- formato persistido dos planos;
- modalidade;
- dose legada;
- experiência do paciente.

Antes de implementar, faça uma leitura do código real e apresente:

1. quais regras atuais de combinação serão removidas;
2. quais virarão observações clínicas;
3. quais continuarão como revisão objetiva;
4. quais arquivos serão alterados.

Depois implemente em lotes seguros:

Lote A:
- nível e refinamento visual do Ajustar.

Lote B:
- taxonomia, linguagem e agrupamento dos alertas.

Ao final de cada lote:

- rodar TypeScript;
- rodar suíte completa;
- rodar build;
- revisar o diff;
- confirmar escopo.

Depois publicar para validação visual.

Não iniciar tutoriais.

Não iniciar nova fase.

Pare após a publicação e aguarde minha validação.

## 04/08/2026 09:58
<task-notification>
<task-id>b4vwqd82v</task-id>
<tool-use-id>toolu_011TVKbi8HCpntygb8QctL9N</tool-use-id>
<output-file>/private/tmp/claude-501/-Users-kamyllahonorio-neuropeak/3e6ecf11-e4e5-471f-bbf9-4595faa53598/tasks/b4vwqd82v.output</output-file>
<status>completed</status>
<summary>Background command "Disparar o lote A" completed (exit code 0)</summary>
</task-notification>

## 04/08/2026 12:58
pode seguir  com o lote B

## 04/08/2026 13:01
<task-notification>
<task-id>bpxlkgzv4</task-id>
<tool-use-id>toolu_01WYDK8h5PGtAWhJ1xkpmRyu</tool-use-id>
<output-file>/private/tmp/claude-501/-Users-kamyllahonorio-neuropeak/3e6ecf11-e4e5-471f-bbf9-4595faa53598/tasks/bpxlkgzv4.output</output-file>
<status>completed</status>
<summary>Background command "Disparar o lote B" completed (exit code 0)</summary>
</task-notification>

## 04/08/2026 13:11
<task-notification>
<task-id>a6a28b7630572cee0</task-id>
<tool-use-id>toolu_01VgnuvTcBJSu5diRH6dQDb3</tool-use-id>
<output-file>/private/tmp/claude-501/-Users-kamyllahonorio-neuropeak/3e6ecf11-e4e5-471f-bbf9-4595faa53598/tasks/a6a28b7630572cee0.output</output-file>
<status>completed</status>
<summary>Agent "Registrar refino v2.70.0" finished</summary>
<note>A task-notification fires each time this agent stops with no live background children of its own. The user can send it another message and resume it, so the same task-id may notify more than once.</note>
<result>## O QUE MUDOU

Apenas `/Users/kamyllahonorio/neuropeak/PROGRESSO.md` — inserção de um bloco novo nas linhas 6–113, imediatamente após o cabeçalho (linhas 1–4) e **antes** do bloco anterior (`DOSE POR PROTOCOLO`, v2.69.0, que continua íntegro logo abaixo). Nenhuma linha existente foi removida ou alterada. Estilo seguido do arquivo: cabeçalho `##` com emoji + data + commit + versão, subseções `###`, negrito nos fatos decisivos, `código` em identificadores, separador ` · ` em listas curtas, marcadores `⚠️` para lição, `✅` para publicação, `⏸️` para o próximo passo.

Trecho exato escrito (linhas 6–113 do arquivo):

```markdown
## 🩺 REFINO CLÍNICO E DE UX DA PRESCRIÇÃO ENTREGUE E PUBLICADO (04/ago/2026) — `8b833dc`, v2.70.0

**Commits:** lote A = `0f9bea5` · lote B = `6f1364c` · release = `8b833dc`.

### 🧭 O princípio que ela fixou — governa tudo o que está abaixo

O NeuroPeak é plataforma de **TREINO** cognitivo, **não instrumento de avaliação psicológica**.
Princípios de **contaminação de teste NÃO valem como regra universal de treino**. Dois exercícios podem
trabalhar **o mesmo domínio intencionalmente**; uma sessão pode ser **ampla ou focal**; **concentração num
domínio é decisão clínica legítima**; **sobreposição não é automaticamente combinação ruim**.
**O sistema informa — não corrige nem reprova a escolha do terapeuta.**

### LOTE A — o nível saiu da prescrição rotineira (`0f9bea5`)

Codex **`gpt-5.6-terra`, esforço high, lab `refinoA`**.

- **removidos da janela "Ajustar"**: a seção **"Configurações de nível"**, o **slider** e o texto
  **"revisão futura"**; o **`startLevel` 1–5 do Agentes Focus** saiu **pela mesma regra**;
- a janela ficou com **quatro seções**: **Dose do treino · Modalidade e variantes · Assistência ·
  Preferências de execução**;
- **salvar o plano deixou de enviar `exerciseLevels` à API**;
- **cartões de protocolo com mais respiro**; o **aviso do Breve** trocou a **paleta âmbar de advertência**
  por **informação discreta**, mantendo o texto clínico aprovado;
- **novo texto da assistência:** *"Repetir o áudio reapresenta o conteúdo auditivo. Não altera a dose
  prescrita nem a estimativa atual."*

### ⚠️ Risco antigo que essa mudança corrigiu — registrar como lição

O código anterior **carregava `exerciseLevels` de `patient.exerciseConfigs`** (a **dificuldade real do
banco**) e **reenviava a cada salvamento** com fallback **`?? 1`**. Se o paciente **treinasse e subisse de
nível depois de a tela ser aberta**, **salvar o plano o rebaixava** ao valor carregado na abertura.
A API **só grava quando o campo vem preenchido** (`if (exerciseLevels &amp;&amp; Object.keys(...).length &gt; 0)`),
então **parar de enviar significa não tocar em `currentDifficulty`**. **Exercícios novos não perdem nada:**
o `ExerciseConfig` **nasce na primeira sessão**, pelo **upsert de `/api/sessions`**. **Nenhum dado de nível
foi apagado, migrado ou zerado**, e **há teste provando**.

### LOTE B — taxonomia, linguagem e agrupamento dos alertas (`6f1364c`)

Codex **`gpt-5.6-sol`, esforço high, lab `refinoB`**.

- **três níveis visuais** no lugar do bloco único: **Revisão do plano · Observações clínicas · Informações**;
- **`DECLARED_BAD_COMBINATION` saiu inteiro da revisão** e virou **observação clínica neutra**.
  **A medição que sustenta:** o disparo era **por presença no plano, não por adjacência**; dos **41 pares
  únicos** declarados no catálogo, só **6** têm **fadiga alta bilateral** e **5** **interferência alta
  bilateral**, e esses casos **já são cobertos** por `HIGH_FATIGUE_ADJACENT`, `HIGH_INTERFERENCE_ADJACENT`
  e `HIGH_FATIGUE_COUNT`, **que continuam intactos**. **Nenhum sinal objetivo se perde.**
- as **`reason` do catálogo contêm linguagem proibida** ("contaminação", "reduz a comparabilidade",
  "reduz a validade"); **o catálogo NÃO foi tocado** — a **camada de apresentação** passou a **traduzir ou
  suprimir** essas frases, e **o texto cru não chega mais à tela**;
- **títulos informativos derivados do perfil cognitivo real do par**, no lugar de
  *"Combinação que merece revisão"* repetido;
- **agrupamento por tema**, com **as ocorrências individuais preservadas no núcleo**.

### Conserto pós-colheita — Claude Opus 5 xhigh (exceção 1 da regra 8)

`HIGH_FATIGUE_POSITION` **tinha ficado como observação clínica**; foi **devolvido à revisão do plano**,
porque **fadiga alta no fechamento é a terceira perna da regra de fadiga aprovada na Fase 2**, junto com
**quantidade** e **consecutividade**. **A spec do VP tinha esquecido de listá-la.**

### 📊 Medição antes e depois — plano com os 34 exercícios, protocolo Padrão, alvo de 40 min

- **ANTES: 66 cartões** — **50** em "revisão recomendada", **3** em atenção, **13** informativos.
  Por código: **41** `DECLARED_BAD_COMBINATION` · **13** `OUTSIDE_BEST_POSITION` · **4**
  `HIGH_FATIGUE_ADJACENT` · **2** `HIGH_INTERFERENCE_ADJACENT` · **2** `PLANNING_WINDOW_ADJACENT` ·
  **1 cada** de `LOAD_OVER_CAP`, `SESSION_SAFE_MAX_EXCEEDED`, `HIGH_FATIGUE_COUNT` e
  `PLANNING_WINDOW_COUNT`.
- **DEPOIS: 21 cartões** — **7** em Revisão do plano · **13** em Observações clínicas · **1** em
  Informações. **As 66 ocorrências continuam preservadas e rastreáveis**; **o núcleo segue devolvendo 66**.
  As **13 posições preferenciais colapsaram num único cartão expansível**.

### Verificações de linguagem (todos os textos visíveis do plano com 34 exercícios)

**Ausentes:** "combinação desfavorável" · "manter apenas uma" · "contaminação" · "comparabilidade" ·
"reduz a validade" · "Combinação que merece revisão". **Nenhum código técnico**; **nada bloqueia salvar**;
**`canSave` true**.

### 🎯 Prova clínica central

Plano **focal em memória operacional** com **Span Numérico Auditivo Direto, Span Inverso, Letras em
Sequência, Matriz Espacial e Matriz Espacial Inversa** — **exatamente os pares que ela mandou não alertar** —
gera **ZERO revisões** e **três observações neutras**.

### Provas (repositório real)

`npx tsc --noEmit` exit 0 · `npx vitest run` **395/395 em 31 arquivos** (eram **375** antes do lote A →
**+20**) · `npm run build` exit 0 · **botão de salvar inalterado**.

### ✅ Publicação confirmada por evidência

`/api/version` → `{"appVersion":"2.70.0","buildId":"dpl_61ZvV2hDyMy5qPczkTXX5zwQu8JS"}` · `/api/health` →
`{"ok":true}` · `git merge-base` confirmou que **`0f9bea5` e `6f1364c` estão contidos em `8b833dc`**.

### 📌 Funcionalidade futura separada — decidida por ela, **NÃO implementada**

**"REDEFINIR NÍVEL"** — deverá ficar na **área de evolução/histórico do paciente**, **nunca no botão
"Ajustar"**; usada **só em casos específicos**; **mostra nível atual e novo**; **exige confirmação**;
**preserva histórico**; **nunca rebaixa ou reinicia silenciosamente**.

### ⏸️ PRÓXIMO PASSO — PARADO aguardando a validação visual dela; **NÃO iniciar tutoriais nem nova fase**

Em `https://neuropeak-5jyl.vercel.app`, ela vai validar: **exercício nos três protocolos** · **exercício com
modalidade** · **exercício com repetição de áudio** · **plano focal em memória operacional** · **Span Direto
+ Inverso** · **Matriz Direta + Inversa** · **plano com duração excessiva** · **plano com fadiga alta
consecutiva** · **plano com várias posições preferenciais** · e um **plano teste com os 34 exercícios**, no
qual **carga e duração devem continuar alertando**, **o painel não pode virar paredão**, **as observações
semelhantes devem estar agrupadas** e **"Salvar plano" deve continuar disponível**.
```

## COMO PROVEI

- `git status --porcelain` → exit 0, saída ` M PROGRESSO.md` — nenhum outro arquivo tocado, nada criado nem removido.
- `git diff --stat` → `1 file changed, 108 insertions(+)` — **zero deleções**, ou seja, nenhum conteúdo anterior do arquivo foi perdido ou reescrito.
- Leitura das linhas 1–10 pós-edição confirma o bloco novo começando na linha 6, logo após o cabeçalho, e a leitura prévia do arquivo confirma que o bloco `v2.69.0` segue intacto imediatamente abaixo.

## O QUE NÃO FIZ

- **Não commitei e não dei push** — a árvore está suja de propósito, com a mudança pronta para o VP commitar.
- Não alterei nenhum outro arquivo (nem `CLAUDE.md`, nem `ESTADO-DO-PROJETO.md`, nem código, nem docs).
- Não rodei `tsc`, `vitest`, `build` nem consultei `/api/version` — os números do despacho foram transcritos como fato recebido, não re-verificados por mim; se o VP quiser essas provas independentes, é outra tarefa.
- Não conferi no código-fonte as afirmações do despacho (contagem de cartões, códigos de alerta, `exerciseLevels`) — o escopo era registro, não auditoria.
- Não abri nem iniciei nada da funcionalidade futura "REDEFINIR NÍVEL", nem tutoriais, nem nova fase.</result>
<usage><subagent_tokens>29808</subagent_tokens><tool_uses>4</tool_uses><duration_ms>99299</duration_ms></usage>
</task-notification>

## 04/08/2026 13:28
Vamos iniciar um novo refinamento de UX na tela de montagem do plano do terapeuta.

A arquitetura clínica, os protocolos, os alertas e o núcleo de prescrição já estão aprovados e não devem ser reabertos.

O problema agora é de densidade visual e foco de tarefa.

Hoje a mesma tela tenta exibir simultaneamente:

- biblioteca de exercícios;
- exercícios já incluídos;
- painel de ajuste;
- resumo de duração;
- carga;
- fadiga;
- interferência;
- revisão do plano;
- observações clínicas;
- informações adicionais.

Isso deixa a tela poluída, com textos pequenos e excesso de informação concorrendo pela atenção do terapeuta.

O objetivo desta etapa é criar uma interface com painéis retráteis e informações progressivamente expansíveis, sem alterar regras clínicas.

Não iniciar tutorial, modo autoguiado ou qualquer outra fase.

==================================================
PRINCÍPIO DE UX
==================================================

A tela deve apoiar dois modos de trabalho:

1. MONTAGEM DO PLANO
   - foco na biblioteca e escolha de exercícios;

2. REVISÃO DO PLANO
   - foco no resumo, carga, duração, alertas e exercícios já incluídos.

O terapeuta deve conseguir alternar entre esses focos sem sair da página.

Não mostrar todas as informações detalhadas ao mesmo tempo.

Utilizar divulgação progressiva:

- resumo primeiro;
- detalhes somente quando solicitados.

==================================================
PARTE 1 — PAINÉIS RETRÁTEIS
==================================================

A tela possui duas áreas principais:

A. Área esquerda:
- biblioteca de exercícios;
- categorias;
- subdomínios;
- busca;
- filtros;
- lista de exercícios disponíveis.

B. Área direita:
- plano em construção;
- resumo da sessão;
- revisão do plano;
- observações clínicas;
- exercícios selecionados;
- ajustes.

Implementar recolhimento independente das duas áreas.

==================================================
1.1 — RECOLHER A BIBLIOTECA
==================================================

Criar uma ação discreta para recolher a área esquerda.

Quando recolhida:

- a biblioteca deixa de ocupar a largura principal;
- permanece uma aba/lingueta lateral fina;
- a aba deve indicar “Exercícios”;
- usar seta coerente com a direção de abertura;
- ao clicar, a biblioteca volta;
- o painel do plano expande e utiliza o espaço liberado.

Exemplo conceitual:

[ > Exercícios ]

Não remover conteúdo nem estado dos filtros.

Ao reabrir, preservar:

- categoria selecionada;
- subdomínio;
- busca;
- filtros;
- posição de rolagem, quando tecnicamente viável.

==================================================
1.2 — RECOLHER O PAINEL DO PLANO
==================================================

Criar uma ação discreta para recolher a área direita.

Quando recolhida:

- o painel do plano vira uma aba/lingueta lateral;
- a aba deve indicar “Plano”;
- a biblioteca expande para ocupar o espaço;
- os exercícios já selecionados continuam preservados;
- nenhum cálculo é perdido;
- salvar continua possível após reabrir.

Exemplo conceitual:

[ Plano < ]

==================================================
1.3 — COMPORTAMENTO DOS PAINÉIS
==================================================

Permitir os seguintes estados:

- ambos abertos;
- biblioteca recolhida;
- plano recolhido.

Não permitir que os dois fiquem recolhidos simultaneamente, salvo se houver uma justificativa clara e aprovada antes.

Ao recolher um painel:

- animar de forma curta e discreta;
- sem efeitos chamativos;
- sem perder estado;
- sem recarregar a página.

Persistir a preferência do terapeuta localmente:

- se deixou a biblioteca recolhida, manter assim ao voltar;
- se deixou o plano recolhido, manter assim ao voltar;
- usar armazenamento local, não banco, salvo necessidade técnica comprovada.

Responsividade:

- em telas menores, usar comportamento equivalente a drawer;
- não deixar a interface inutilizável em notebooks;
- manter navegação por teclado e foco acessível.

==================================================
PARTE 2 — RESUMO DO PLANO MAIS LIMPO
==================================================

O painel de revisão continua correto clinicamente, mas mostra detalhes demais de imediato.

Transformar os blocos em resumos escaneáveis.

Hoje um alerta pode exibir:

- título;
- explicação;
- lista completa de exercícios;
- sugestão;
- justificativa.

Na visualização inicial, mostrar apenas:

- título;
- dado principal;
- contagem;
- gravidade/categoria;
- ação “Ver detalhes”.

Exemplos:

CARGA ELEVADA PARA A DURAÇÃO
69 / referência 10
[Ver detalhes]

MUITAS ATIVIDADES DE FADIGA ALTA
12 atividades
[Ver exercícios]

JANELAS DE PLANEJAMENTO
6 atividades
[Ver detalhes]

FADIGA ALTA EM SEQUÊNCIA
4 sequências
[Ver sequências]

Ao expandir, mostrar:

- explicação completa;
- exercícios envolvidos;
- sugestão clínica;
- justificativa;
- ocorrências individuais, quando aplicável.

==================================================
PARTE 3 — AGRUPAMENTO VISUAL
==================================================

Manter a taxonomia atual:

1. Revisão do plano
2. Observações clínicas
3. Informações

Por padrão:

- exibir todos os títulos dos grupos;
- mostrar apenas os itens resumidos;
- não deixar todos os detalhes abertos.

Quando houver muitos itens em um grupo:

- mostrar inicialmente os mais relevantes;
- incluir “Ver todas as observações”;
- preservar acesso a tudo;
- não apagar ocorrências.

Sugestão de limite inicial:

- Revisão do plano: mostrar até 4 itens resumidos;
- Observações clínicas: mostrar até 3 grupos resumidos;
- Informações: mostrar 1 bloco agrupado.

Se houver mais, exibir contagem:

“Ver mais 5 revisões”
“Ver mais 8 observações”

Não tratar esse limite como perda de informação.

==================================================
PARTE 4 — HIERARQUIA DO PAINEL DIREITO
==================================================

Organizar visualmente o painel direito nesta ordem:

1. Cabeçalho “Plano em construção”
2. Duração e frequência
3. Resumo da sessão
4. Revisão do plano
5. Observações clínicas
6. Informações
7. Exercícios selecionados
8. Salvar plano
9. Visualizar plano

Aplicar separação visual clara entre:

- resumo;
- análise;
- exercícios incluídos;
- ações finais.

Evitar que tudo pareça um único bloco contínuo.

==================================================
PARTE 5 — TIPOGRAFIA E DENSIDADE
==================================================

A interface atual força letras pequenas para caber todo o conteúdo.

Não diminuir mais a fonte.

Preferir:

- menos conteúdo visível simultaneamente;
- mais largura quando um painel estiver recolhido;
- textos resumidos;
- detalhes expansíveis.

Garantir legibilidade:

- títulos de alerta claramente maiores que o corpo;
- dados principais destacados;
- listas completas só no estado expandido;
- espaçamento consistente;
- contraste suficiente.

Não transformar a tela em dashboard de métricas.

Manter aparência clínica, sóbria e elegante.

==================================================
PARTE 6 — JANELA “AJUSTAR”
==================================================

A janela “Ajustar” continua aprovada conceitualmente.

Nesta etapa, não redesenhar a dose novamente.

Apenas garantir que:

- ao abrir Ajustar, o cartão tenha espaço suficiente;
- o painel direito possa expandir quando a biblioteca estiver recolhida;
- Breve/Padrão/Estendido permaneçam legíveis;
- detalhes de modalidade, assistência e preferências não comprimam a dose;
- nenhum texto seja cortado de forma inadequada.

Caso o painel direito esteja estreito:

- priorizar expansão do painel;
- não reduzir fonte;
- não esconder dados clínicos essenciais.

==================================================
PARTE 7 — EXERCÍCIOS SELECIONADOS
==================================================

A lista de exercícios já incluídos também deve poder ser compactada visualmente.

Cada exercício, no estado fechado, deve mostrar apenas:

- nome;
- protocolo;
- duração;
- carga;
- fadiga;
- botão Ajustar;
- remover;
- controle de ordem.

Descrição completa, perfil cognitivo, modalidade e demais informações ficam em “Ver detalhes”.

Não abrir ajustes de vários exercícios simultaneamente por padrão.

Ao abrir Ajustar em um exercício:

- fechar automaticamente o ajuste anteriormente aberto, ou
- permitir apenas um ajuste aberto por vez.

Escolher a solução mais simples e consistente com o código atual.

==================================================
PARTE 8 — ESTADO E SEGURANÇA
==================================================

Recolher ou expandir painéis não pode:

- alterar exercícios;
- mudar protocolos;
- mudar ordem;
- recalcular incorretamente;
- salvar automaticamente;
- apagar filtros;
- alterar progresso;
- tocar no nível;
- modificar o formato persistido do plano.

O botão Salvar plano continua habilitado pelas mesmas regras técnicas atuais.

Nenhum painel ou detalhe visual pode bloquear o salvamento.

==================================================
TESTES OBRIGATÓRIOS
==================================================

Criar ou atualizar testes para provar:

1. Biblioteca pode ser recolhida e reaberta.
2. Painel do plano pode ser recolhido e reaberto.
3. Estados dos exercícios selecionados permanecem intactos.
4. Filtros e busca permanecem intactos após recolher/reabrir.
5. Não é possível perder os dois painéis simultaneamente.
6. Preferência local é restaurada.
7. Alertas continuam disponíveis no estado expandido.
8. O resumo exibe contagens corretas.
9. “Ver mais” não apaga ocorrências.
10. Posição preferencial agrupada continua acessível.
11. Um plano com 34 exercícios não renderiza 66 cartões completos.
12. O núcleo continua devolvendo todas as ocorrências.
13. Salvar plano não é bloqueado.
14. Trocar protocolo continua recalculando duração.
15. Abrir Ajustar não altera dose.
16. Apenas um ajuste fica aberto por vez, se essa regra for adotada.
17. Nenhum dado de nível é tocado.
18. TypeScript sem erros.
19. Suíte completa passando.
20. Build passando.

==================================================
VALIDAÇÃO VISUAL
==================================================

Validar manualmente estes estados:

1. Ambos os painéis abertos.
2. Biblioteca recolhida.
3. Plano recolhido.
4. Plano com poucos exercícios.
5. Plano focal em memória operacional.
6. Plano com duração excessiva.
7. Plano com muitos alertas.
8. Plano teste com 34 exercícios.
9. Um exercício com Ajustar aberto.
10. Exercício com modalidade.
11. Exercício com assistência.
12. Notebook com largura intermediária.

Na validação com 34 exercícios:

- a interface deve continuar legível;
- os alertas devem aparecer resumidos;
- detalhes devem abrir sob demanda;
- o painel não pode parecer um artigo contínuo;
- a tipografia não deve precisar ser reduzida;
- Salvar plano deve continuar disponível.

==================================================
ESCOPO
==================================================

Pode alterar:

- layout da página do plano;
- componentes da biblioteca;
- componentes do painel do plano;
- PrescriptionSummary;
- ExerciseCard / ExerciseRow;
- componentes visuais de agrupamento e expansão;
- estado local de UI;
- testes correspondentes.

Não alterar:

- núcleo clínico;
- regras de alerta;
- protocolos;
- durações;
- carga;
- fadiga;
- interferência;
- exercícios;
- progressão;
- nível;
- banco;
- migrations;
- APIs;
- formato persistido;
- modalidade;
- dose legada;
- experiência do paciente.

Antes de implementar, faça uma leitura do código real e informe:

1. quais componentes controlam hoje as duas colunas;
2. onde fica o estado de expansão dos exercícios;
3. como o painel é responsivo;
4. quais arquivos serão alterados;
5. qual estratégia será usada para persistir o estado visual.

Depois implementar em dois lotes:

Lote A:
- painéis retráteis e layout responsivo.

Lote B:
- cartões resumidos, detalhes expansíveis e redução da densidade.

Ao final de cada lote:

- rodar TypeScript;
- rodar suíte completa;
- rodar build;
- revisar diff;
- confirmar que somente UI foi alterada.

Depois publicar para validação visual.

Não iniciar tutoriais.

Não iniciar nova fase.

Pare após publicar e aguarde minha validação.

## 04/08/2026 13:33
Perfeito. Pode seguir conforme planejado.

Não altere a arquitetura clínica nem as regras de prescrição. Conclua o Lote A, rode as provas e depois siga para o Lote B.

Após publicar os dois lotes juntos, pare para minha validação visual.

## 04/08/2026 13:45
Perfeito. Pode seguir conforme planejado.

Não altere a arquitetura clínica nem as regras de prescrição. Conclua o Lote A, rode as provas e depois siga para o Lote B.

Após publicar os dois lotes juntos, pare para minha validação visual.

## 04/08/2026 13:51
me avisa quando terminar
