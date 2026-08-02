# Informação em Foco — FASE 1: correção estrutural (spec da Kamylla, 01/ago/2026)

> Especificação recebida dela em 01/ago/2026, no fim da janela. **Ainda NÃO executada.**
> Escopo desta fase: só dados + geração de questões. NÃO implementar situações do cotidiano,
> novas perguntas, layout, troca de imagens, progressão de dificuldade ou melhorias visuais.

## 1. Problemas relatados por ela (vistos em sessão real)

- chá de camomila aparecendo como "contém lactose";
- lasanha congelada aparecendo como "sabor chocolate";
- pão de forma aparecendo como "sabor morango";
- biscoito aparecendo como "sabor uva";
- leite líquido apresentado em gramas; azeite apresentado em gramas;
- produtos com conteúdo diferente do que está impresso na embalagem;
- o mesmo produto mudando de peso/volume entre questões;
- a mesma pergunta repetida em questões consecutivas (7, 8 e 9: *"Qual produto contém pelo menos 500 g e custa menos de R$ 8,00?"*);
- progresso incompatível com a questão atual.

**Causa provável (a confirmar no código):** os atributos do produto são sorteados por questão em
vez de virem do cadastro. Hoje `gerarNivel1/2/3/4` (`lib/informacao-foco.ts`) atribui
`peso/volume/unidades/validade/lactose/açúcar/sabor` na hora, sem olhar o produto.
Correção parcial já feita em v2.60.0: "Conteúdo" só em líquido e "Peso" só em sólido — a raiz continua.

## 2. Fonte única dos dados

Catálogo central de produtos como fonte oficial de TODOS os componentes e questões.
A imagem é só representação visual. **Sem OCR** — nada é extraído da imagem
(peso, volume, validade, lactose, glúten, sabor, ingredientes, preço, resposta).

## 3. Atributos FIXOS (nunca aleatorizados por questão)

`id`, `nome`, `marca`, `categoria`, `imagem`, `tipo`, `versão`, `sabor`, `recheio`, `peso`,
`volume`, `unidades`, `sachês`, `unidade de medida`, `lactose`, `glúten`, `açúcar`,
`ingredientes`, `alergênicos`, `conservação`.

```json
{ "id": "margarina-01", "name": "Margarina cremosa", "category": "refrigerados",
  "contentValue": 500, "contentUnit": "g", "image": "/products/margarina.png" }
```
Esse produto nunca pode aparecer com 800 g em outra questão.

## 4. Atributos VARIÁVEIS

Só `preço`, `validade`, `estoque`, `promoção` — em faixas plausíveis, **estáveis durante a sessão
inteira**. No início da sessão, criar snapshot `sessionProductCatalog`; todas as questões usam esse
mesmo snapshot.

## 5. Massa × volume × contagem

- MASSA: g, kg · VOLUME: mL, L · CONTAGEM: unidades, sachês. Nunca comparar dimensões incompatíveis.
- "Qual produto contém pelo menos 500 g?" → só produtos em g/kg (fora leite, suco, óleo, azeite,
  vinagre, shoyu cadastrados em mL/L).
- Rótulos: líquido = "Volume: 500 mL / 1 L"; sólido = "Peso: 500 g / 1 kg"; contagem = "Quantidade:
  12 unidades / 10 sachês".

## 6. Correspondência imagem ↔ cadastro

O cadastro tem que bater com o que está impresso na embalagem (500 g → 500 g; 1 L → 1 L; 10 sachês
→ 10 sachês). Quando não der para confirmar: **não inventar** — marcar `pendente de revisão` e
bloquear o produto em perguntas sobre conteúdo.

## 7. Campos aplicáveis por categoria (o que não se aplica = `null`, nunca valor aleatório)

- **Leites:** tipo, lactose, volume, preço, validade, conservação.
- **Iogurtes:** sabor, lactose, peso, açúcar, preço, validade.
- **Sucos:** sabor, volume, açúcar, preço, validade.
- **Pães:** tipo/versão, peso, unidades, glúten, lactose, validade.
- **Lasanhas e congelados:** recheio/versão, peso, preço, validade, conservação, lactose, glúten. (Nunca "sabor chocolate".)
- **Chás:** tipo, sachês, peso, preço, validade, modo de preparo. (Nunca lactose em chá comum.)
- **Farináceos:** tipo, peso, glúten, preço, validade, conservação.
- **Líquidos de cozinha:** tipo, volume, preço, validade, conservação.
- **Molhos:** tipo, peso ou volume real, preço, validade, ingredientes, alergênicos, conservação.

## 8. Geração das questões

Antes de gerar: escolher campo aplicável → produtos com dimensões compatíveis → produtos
semanticamente comparáveis → exatamente uma resposta correta → dados reais do catálogo → valores
plausíveis → sem atributo contraditório → sem pergunta repetida recentemente.

Ruim: *"Qual produto não contém lactose?"* com chá de camomila e milho em conserva.
Bom: *"Qual produto não contém lactose e possui 1 litro?"* com leite integral 1 L (com lactose),
leite sem lactose 1 L, bebida vegetal 900 mL, leite desnatado 500 mL.

## 9. Sabor

Só com produtos cujo `flavor` seja real e aplicável (iogurtes, sucos). Nunca em pão de forma comum,
lasanha, arroz, feijão, farinha, sal, óleo, milho em conserva. Não criar sabor aleatório.

## 10. Lactose

Só onde é funcionalmente relevante: leite, iogurte, manteiga, requeijão, queijo, creme de leite,
leite condensado, bebidas vegetais e industrializados que tenham o campo. Não usar chá, milho, sal,
açúcar ou óleo só porque normalmente não têm lactose.

## 11. Seleção semântica

Priorizar grupos coerentes: leites e bebidas vegetais · iogurtes · farináceos · biscoitos · pães ·
conservas · congelados · frios · refrigerados · molhos · óleos e vinagres · cafés e chás.

## 12. Preços plausíveis

Faixa por categoria (azeite > óleo de soja; leite na faixa de leite; presunto na faixa de frios).
Nada de preço absurdo só para produzir a resposta.

## 13. Repetição

Histórico de questões: não repetir o mesmo texto nem a mesma combinação de campos nas 3 questões
seguintes; não repetir o produto correto consecutivamente; não repetir demais a mesma categoria;
no máximo 2 questões idênticas por sessão.

## 14. Validação obrigatória (antes de exibir)

campos aplicáveis · unidades compatíveis · dados = catálogo · catálogo = imagem · exatamente 1
resposta correta · distratores plausíveis · sem repetição recente · sem atributo absurdo · feedback
com os mesmos dados · produtos comparáveis. Falhou: não exibe, gera outra, registra o motivo em dev.

## 15. Progresso

Sessão de 10: antes de responder a Q1 = 0%, Q2 = 10%, Q7 = 60%, Q8 = 70%, Q9 = 80%, ao concluir a
Q10 = 100%. Mostrar "Questão X de 10". Verificar se a troca de nível reinicia/altera o progresso
indevidamente.

## 16. Auditoria do catálogo (relatório)

Colunas: ID · produto · categoria · imagem · conteúdo visível na embalagem · conteúdo cadastrado ·
unidade visível · unidade cadastrada · atributos incompatíveis · status · correção realizada.

Começar por: chá de camomila, milho em conserva, biscoito sem açúcar, lasanha congelada, pão de
forma integral, leite semidesnatado, leite sem lactose, leite integral, molho de tomate, presunto
cozido, nuggets de frango, açúcar mascavo, margarina, ervilha em conserva, azeite de oliva,
ketchup, aveia em flocos.

## 17. Testes obrigatórios

leite nunca em gramas · azeite nunca em gramas · margarina não muda de 500 g para 800 g · açúcar de
1 kg não vira 300 g · chá comum sem lactose aleatória · lasanha sem sabor chocolate · pão comum sem
sabor morango · nenhum produto muda de conteúdo na sessão · exatamente 1 resposta correta ·
pergunta repetida bloqueada · progresso correto · questão inválida não é exibida.

## 18. Critérios de aceitação

(1) fonte única (2) atributos fixos não aleatorizados (3) massa/volume/contagem separados (4) dados
batendo com as imagens (5) nenhum atributo incompatível (6) preços plausíveis (7) uma resposta
correta por questão (8) questão inválida descartada (9) sem pergunta repetida (10) progresso correto
(11) catálogo auditado (12) testes aprovados.

## 19. Entrega final (o que apresentar)

causa raiz · arquivos modificados · estrutura do catálogo · produtos corrigidos · divergências
imagem×cadastro · regras de unidade · regras por categoria · validações · questões rejeitadas nos
testes · correção do progresso · testes executados · resultado · pendências de revisão manual.

---

# Plano de execução (fatiamento — cada fatia termina com prova rodada e commit)

Ordem pensada para que um estouro de janela pegue no máximo uma fatia pequena.

**Fatia 1 — Catálogo central com atributos fixos.** Ampliar `Modelo` em `lib/informacao-foco.ts`
com `id`, `conteudo {valor, unidade}`, `sabor`, `lactose`, `gluten`, `acucar`, `alergenicos`,
`conservacao`, `unidades/saches`, `precoFaixa`, `revisar?`. Preencher os 73 produtos **lendo o que
está impresso em cada embalagem** (é trabalho visual meu, ~73 imagens; o que não der para ler vira
`revisar: true` e sai das perguntas de conteúdo). *Prova:* teste de coerência por categoria + relatório
de auditoria (§16) gerado em `docs/auditoria/`.

**Fatia 2 — Campos aplicáveis por categoria (§7) + faixas de preço (§12).** Tabela
`CAMPOS_POR_CATEGORIA` e `FAIXA_PRECO`; campo não aplicável = `null`. *Prova:* testes de §17
(chá sem lactose, lasanha sem sabor, leite nunca em g).

**Fatia 3 — Gerador passa a ler o catálogo (§8, §9, §10, §11).** Nada de atributo sorteado: a
questão escolhe o campo, filtra produtos compatíveis e usa os dados do cadastro. *Prova:* 500×
por nível, sem atributo contraditório, uma resposta correta.

**Fatia 4 — Snapshot de sessão (§4) + histórico anti-repetição (§13).** `sessionProductCatalog`
com preço/validade estáveis; histórico das 3 últimas. *Prova:* teste de estabilidade (mesmo produto,
mesmo conteúdo e preço na sessão) + teste de não repetição.

**Fatia 5 — Progresso (§15) + validação de exibição (§14) + entrega (§19).** *Prova:* teste do
progresso 0/10/…/100 e do "Questão X de 10"; questão inválida nunca exibida.

**Depois desta fase (não agora):** situações do cotidiano/historinhas, dificuldade e melhorias
visuais — só depois dela testar uma sessão inteira de 10 questões.
