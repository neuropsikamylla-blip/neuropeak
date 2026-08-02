# As 3 ultimas especificacoes dela (automatico; a mais nova por ultimo)
# Na retomada: ler as 3, conectar com PROGRESSO.md e git, declarar e seguir.

## 01/08/2026 23:58
vigilancia percebi que a pipa está mto diferente... atualizei as pipas ALVOS verifica

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
