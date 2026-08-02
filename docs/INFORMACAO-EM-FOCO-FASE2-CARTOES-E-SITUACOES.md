# Informação em Foco — FASE 2: cartões, ampliação e situações do cotidiano

> Spec da Kamylla, recebida em 02/ago/2026. **NÃO executar antes da FASE 1**
> (`INFORMACAO-EM-FOCO-FASE1-CORRECAO-ESTRUTURAL.md`) estar concluída **e testada por ela** numa
> sessão inteira de 10 questões. Ordem definida por ela:
> **Fase 1** estabilizar produtos/unidades/dados/perguntas → **Fase 2** cartões, etiquetas,
> ampliação e situações do cotidiano → **Fase 3** ajustar a dificuldade adaptativa depois de
> observar sessões completas.

**Proibido nesta fase:** recriar o exercício · criar segunda versão · substituir o catálogo
corrigido na Fase 1 · alterar de novo pesos, volumes, marcas, imagens ou atributos fixos · OCR ·
extrair informação automaticamente da embalagem.

## 1. Objetivo

Treinar leitura funcional, atenção seletiva, localização, comparação, manutenção de condições na
memória, conferência antes de responder, controle da impulsividade e compreensão de situações
cotidianas. A imagem tem função real, mas **não é a única fonte**. Formato principal:
**imagem do produto + quadro funcional de informações**. Em questões específicas, o paciente lê
direto na embalagem usando a ampliação.

## 2. Estrutura do cartão (mantém o padrão visual atual, muda a ordem)

1. imagem do produto · 2. botão discreto "Ampliar embalagem" · 3. nome · 4. marca fictícia ·
5. quadro de informações · 6. ação complementar quando necessária.

```
┌────────────────────────────┐
│       [EMBALAGEM]          │
│       Ampliar embalagem    │
│ Gelatina incolor           │
│ Doce Flora                 │
│ ────────────────────────── │
│ Peso                24 g   │
│ Tipo             Incolor   │
│ Sabor          Sem sabor   │
│ Preço             R$ 6,90  │
└────────────────────────────┘
```
O cartão inteiro continua sendo a área de resposta; **o botão de ampliar não pode selecionar o cartão**.

## 3. Área da imagem (hoje está pequena demais)

altura da área 145–175 px · embalagem até 135–160 px de altura e 130–155 px de largura ·
`object-fit: contain` · `object-position: center` · fundo branco · embalagem inteira visível ·
sem cortar tampa/base/laterais · sem distorção. Grande para reconhecer, sem dominar o cartão.

## 4. Quadro funcional

Usa os dados **oficiais do catálogo**, nunca o texto visível na embalagem. Campos possíveis: preço,
peso, volume, quantidade, validade, tipo, versão, sabor, lactose, glúten, açúcar, rendimento,
conservação, instrução após abertura, % de cacau, sachês, alergênicos.
Rótulos corretos: `Peso: 500 g` · `Volume: 500 mL` · `Quantidade: 12 unidades` ·
`Quantidade: 10 sachês` · `Rendimento: 10 copos`. **Nunca "Peso" para líquido.**

## 5. Não repetir o que já está no nome

Se o nome é "Gelatina incolor sem sabor", não repetir Produto/Tipo/Sabor no quadro — mostrar
Peso, Rendimento, Preço, Validade. Exceção: quando a pergunta avaliar "tipo" ou "sabor", esses
campos aparecem separados.

## 6. Campos visíveis por dificuldade

| Nível | Produtos | Campos | Condições | Observação |
|---|---|---|---|---|
| Inicial | 3 | 3 | 1 | informação em posição previsível, sem excesso |
| Fácil | 3 | 4 | 1 (localizar ou comparar) | valores moderadamente próximos |
| Médio | 3–4 | 4–5 | 2 | informações irrelevantes plausíveis |
| Difícil | 4 | 5–6 | 2–3 | situações do cotidiano; validade, conservação, ingredientes, alergênicos |

**Nunca dificultar por** fonte pequena, baixo contraste, desorganização, esconder informação ou
encolher a embalagem.

## 7. Posição dos campos

Nível inicial: posição estável (conteúdo → preço → validade) para ensinar a estratégia de busca.
Médio/difícil: variação **controlada** da ordem. Nunca embaralhar tudo a cada rodada — a
dificuldade vem da seleção e comparação, não da desorganização.

## 8. Modalidade A — leitura do quadro funcional (~70%)

Localizar e comparar no quadro. Ex.: "Qual produto possui 24 g?" · "Qual embalagem contém 10
sachês?" · "Qual tem o menor preço?" · "Qual vence primeiro?" · "Qual possui 500 g e custa menos de
R$ 8,00?" · "Qual não contém lactose e possui 1 litro?" · "Qual é integral e não tem açúcar
adicionado?" As informações necessárias estão no quadro.

## 9. Modalidade B — leitura direta da embalagem (~10%)

Localizar a informação **na imagem**. Ex.: "Na embalagem, qual produto informa 'rende até 10
copos'?" · "Qual apresenta '70% cacau'?" · "Qual informa '10 sachês'?" · "Qual contém 'sem adição
de açúcar'?" · "Qual informa 'incolor e sem sabor'?"

Obrigatório: a informação tem de estar **legível** na imagem · imagem correta · **o quadro não pode
repetir a informação avaliada** · botão de ampliar presente · a ampliação não revela campos extras
do catálogo · não usar imagem com texto imperfeito nem produto pendente de revisão.
Cadastro ganha `directPackageReadingEnabled: boolean` — só `true` entra nesta modalidade.

## 10. Ampliação da embalagem

Ao tocar na imagem ou no botão: modal central, só a embalagem ampliada, proporção preservada, fundo
neutro/branco, zoom moderado, fechar e voltar à mesma questão. **Não** registra resposta, não avança,
não reinicia tempo, não revela se está correto. Modal com botão fechar, Escape, foco acessível,
navegação por teclado e descrição da imagem. No celular, gesto de ampliar quando viável.

## 11–12. Modalidade C — situação do cotidiano (~20%)

Título na interface adulta: **"SITUAÇÃO DO COTIDIANO"** — nunca "historinha". Curta e funcional:
no máximo **duas frases de contexto, três condições e uma pergunta final**.

```
┌─────────────────────────────────────────────┐
│ SITUAÇÃO DO COTIDIANO                       │
│ Marina precisa comprar leite para o café.   │
│ Pedido: 1 L · Sem lactose · Até R$ 8,00     │
│ Qual produto atende a todas as condições?   │
└─────────────────────────────────────────────┘
```
Condições com destaque discreto; sem excesso de cor; sem lista longa.

## 13. Estilos de pergunta

- **A. Localização direta** — "Qual produto possui 24 g?" · "Qual contém 10 sachês?" · "Qual informa 'sem sabor'?" · "Qual possui 500 mL?"
- **B. Comparação** — menor preço · maior peso · vence primeiro · validade mais longa.
- **C. Duas condições** — "500 g e menos de R$ 8,00" · "sem lactose e 1 litro" · "10 sachês e menos de R$ 9,00" · "integral e sem açúcar adicionado".
- **D. Três condições** — "500 g, menos de R$ 10,00 e vence depois de outubro" · "70% cacau, 80 g, até R$ 10,00".
- **E. Validade e conservação** — vence primeiro · ainda válido em jan/2028 · manter refrigerado · permanecer congelado · consumir em até 3 dias após aberto.
- **F. Ingredientes e alergênicos** — contém amendoim · deve ser evitado por alérgico a amendoim · contém leite · informa "não contém glúten". Só com dados reais e revisados.
- **G. Situação do cotidiano.**

## 14. Situações do cotidiano (exemplos dela)

1. **Gelatina** — "Marina vai preparar uma sobremesa." · Pedido: incolor · sem sabor · 24 g.
2. **Leite em pó** — "Carlos precisa comprar leite em pó para uma receita." · Integral · 400 g.
3. **Fermento** — "Ana vai preparar um bolo." · Fermento químico em pó · 100 g.
4. **Pasta de amendoim** — "Júlia procura uma pasta para o café da manhã." · Integral · sem adição de açúcar · 500 g.
5. **Goma de tapioca** — "Pedro precisa comprar goma de tapioca." · Hidratada · 500 g · até R$ 7,00.
6. **Chocolate** — "Fernanda procura um chocolate mais intenso." · 70% cacau · 80 g · até R$ 10,00.
7. **Leite sem lactose** — "Roberto não pode consumir lactose." · Leite · sem lactose · 1 L.
8. **Validade** — "Helena quer um produto que dure mais tempo." · Validade posterior a dez/2027.

## 15. Distratores

Plausíveis, atendendo **parcialmente**. Com duas condições: um atende só a A, outro só a B, outro a
nenhuma. Com três: um atende à 1; outro à 1 e 2; outro à 2 e 3; só um atende às três. Nada de
alternativa absurda.

## 16. Distribuição numa sessão de 10

1 localização direta · 2 localização de característica · 3 comparação de quantidade · 4 comparação
de preço ou validade · 5 duas condições · 6 duas condições diferentes · 7 situação do cotidiano ·
8 ingredientes/alergênicos/conservação · 9 leitura direta da embalagem · 10 situação funcional com
2–3 condições. **Variar a ordem** entre sessões, mantendo o equilíbrio.

## 17. Não repetição

Não repetir nas 3 questões seguintes: o mesmo texto, a mesma combinação de campos, a mesma
situação, o mesmo produto correto, a mesma categoria em excesso. No máximo 2 questões do mesmo tipo
em sequência. A sessão precisa exigir mudança de foco atencional.

## 18–20. Modelo de dados

Cada questão declara os campos visíveis e os necessários:

```js
{ questionType: "twoConditions",
  requiredFields: ["content", "price"],
  visibleFields: ["content", "price", "expiration", "storage"] }
```

```js
{ id: "question-001", mode: "functionalCard", type: "twoConditions",
  prompt: "Qual produto possui 500 g e custa menos de R$ 8,00?",
  requiredFields: [
    { field: "contentValue", operator: "greaterThanOrEqual", value: 500, unit: "g" },
    { field: "price", operator: "lessThan", value: 8 } ],
  visibleFields: ["content", "price", "expiration", "storage"],
  productIds: ["product-a","product-b","product-c","product-d"],
  correctProductId: "product-c",
  explanation: "Este produto possui 500 g e custa menos de R$ 8,00." }
```

```js
{ id: "scenario-001", mode: "dailySituation", type: "threeConditions",
  title: "Situação do cotidiano",
  context: "Fernanda procura um chocolate mais intenso.",
  requestLabel: "Pedido", requestSummary: "70% cacau · 80 g · Até R$ 10,00",
  prompt: "Qual produto atende a todas as condições?",
  requiredFields: [
    { field: "cocoaPercentage", operator: "equals", value: 70 },
    { field: "contentValue", operator: "equals", value: 80, unit: "g" },
    { field: "price", operator: "lessThanOrEqual", value: 10 } ],
  correctProductId: "chocolate-70-80g",
  explanation: "Este chocolate possui 70% de cacau, 80 g e custa até R$ 10,00." }
```
Campos necessários sempre visíveis; distratores plausíveis; nenhum campo sem finalidade só para
preencher espaço.

## 21. Feedback

Acerto: *"Correto. Este produto possui 500 g e custa R$ 7,49."*
1º erro: **não revelar a resposta** — pista processual (*"Confira novamente o peso e o preço."* ou
*"O produto escolhido atende ao preço, mas não ao peso."*).
2º erro: destacar os campos relevantes da alternativa correta e explicar quais condições foram
atendidas. Nunca só "Errado".

## 22. Destaque depois da resposta

Antes: nenhum campo destacado, todos os cartões iguais. Depois: destaque discreto nos campos que
comprovam a solução; borda verde no acerto; indicação adequada no erro; **sem filtro sobre a
imagem**; sem ocultar os outros cartões.

## 23. Acessibilidade

Foco visível · cartão acessível por teclado · Enter e Espaço ativam · modal acessível · campos lidos
por leitor de tela · estado (correto/incorreto) anunciado · fonte legível · contraste adequado ·
botões rotulados. Nada importante transmitido só por cor.

## 24. Validação antes de exibir

(1) dados vêm do catálogo (2) campos necessários visíveis (3) unidades compatíveis (4) exatamente
uma resposta correta (5) distratores atendem parcialmente (6) sem contradição com a imagem (7) texto
da situação corresponde aos dados (8) pergunta não repetida recentemente (9) leitura direta só em
imagem autorizada (10) feedback corresponde à resposta. Falhou: não exibe, gera outra, registra o motivo.

## 25. Não alterar nesta fase

Catálogo estrutural corrigido · atributos fixos · identificação das imagens · nome do exercício ·
duração da sessão · sistema clínico · registro de resultados · progressão adaptativa (salvo para
associar os novos tipos de pergunta).

## 26. Critérios de aceitação

(1) cartão com imagem + quadro funcional (2) embalagens maiores (3) quadro com dados oficiais
(4) campos variando por dificuldade (5) nível inicial sem excesso (6) ampliação disponível
(7) leitura direta não repete a resposta no quadro (8) situações curtas (9) distratores parciais
(10) uma resposta correta (11) sem repetição excessiva (12) unidades corretas (13) feedback
explicando as condições (14) interface responsiva (15) teclado funcionando (16) questão inválida
descartada (17) variedade real na sessão (18) imagem não é decoração.

## 27. Entrega final (o que apresentar)

componentes modificados · estrutura do novo ProductCard · estrutura do quadro funcional · modal de
ampliação · campos por nível · tipos de pergunta · situações adicionadas · distribuição das sessões ·
regras de não repetição · feedbacks · validações · testes executados · resultado · capturas ou
descrição das telas · pendências.
