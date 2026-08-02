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
