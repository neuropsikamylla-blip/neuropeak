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
