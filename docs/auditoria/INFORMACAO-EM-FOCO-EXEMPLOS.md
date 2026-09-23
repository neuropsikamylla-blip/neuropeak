# Informação em Foco — exemplos gerados automaticamente

Gerado por `lib/informacao-foco-questoes.test.ts` (semente fixa 2026), a partir do catálogo
oficial. ✅ marca a resposta correta. Nenhum valor aqui foi inventado pelo gerador.

### localizacao · nível 1

**Qual produto tem 13 g?**

     **Chá de camomila** (Floravita) — Peso: 10 g · Preço: R$ 7,40 · Validade: 06/2027
  ✅ **Chá verde** (Chá Vital) — Peso: 13 g · Preço: R$ 8,90 · Validade: 03/2028
     **Café solúvel** (Bom Dia) — Peso: 200 g · Preço: R$ 22,90 · Validade: 07/2028

_Explicação:_ Correto. Chá verde (Chá Vital) atende: Peso — 13 g.
_Pista:_ Confira o campo “Peso” em cada produto.

---

### comparacao · nível 1

**Qual produto tem a maior quantidade?**

     **Chia em grãos** (Vida Leve) — Peso: 150 g · Preço: R$ 10,40 · Validade: 05/2028
     **Cereal matinal** (Bom Grão) — Peso: 300 g · Preço: R$ 12,40 · Validade: 02/2027
  ✅ **Aveia em flocos** (Campo Dourado) — Peso: 450 g · Preço: R$ 11,40 · Validade: 03/2028

_Explicação:_ Correto. Aveia em flocos (Campo Dourado) atende: Peso — 450 g.
_Pista:_ Confira o campo “Peso” em cada produto.

---

### filtroComparacao · nível 1

**Entre os produtos que são do tipo tradicional, qual tem a menor quantidade?**

  ✅ **Molho de tomate** (Casa Toscana) — Peso: 300 g · Preço: R$ 3,90 · Tipo: tradicional
     **Molho barbecue** (Churras Sabor) — Peso: 400 g · Preço: R$ 14,40 · Tipo: defumado
     **Maionese** (Vale Sabor) — Peso: 500 g · Preço: R$ 10,90 · Tipo: tradicional

_Explicação:_ Correto. Molho de tomate (Casa Toscana) atende: Tipo — tradicional · Peso — 300 g.
_Pista:_ Confira “Tipo” e “Peso” antes de responder.

---

### duasCondicoes · nível 1

**Qual produto tem pelo menos 400 g e custa até R$ 12,50?**

  ✅ **Sopa congelada de legumes** (Prato Leve) — Peso: 400 g · Preço: R$ 11,40 · Validade: 12/2026
     **Nuggets de frango** (Frango Dourado) — Peso: 300 g · Preço: R$ 12,40 · Validade: 11/2026
     **Lasanha congelada** (Forno da Serra) — Peso: 600 g · Preço: R$ 18,90 · Validade: 02/2027

_Explicação:_ Correto. Sopa congelada de legumes (Prato Leve) atende: Peso — 400 g · Preço — R$ 11,40.
_Pista:_ Confira “Peso” e “Preço” antes de responder.

---

### exclusaoParcial · nível 1

**Precisamos de um produto que contém castanha e vence depois de 02/2028. Qual destes atende a APENAS UMA dessas exigências?**

  ✅ **Semente de linhaça** (Natureza Pura) — Peso: 200 g · Validade: 07/2028 · Alérgenos: Sem alérgenos declarados
     **Granola tradicional** (Terra Viva) — Peso: 500 g · Validade: 03/2028 · Alérgenos: Contém castanha
     **Granola sem açúcar** (Colheita Boa) — Peso: 400 g · Validade: 01/2027 · Alérgenos: Sem alérgenos declarados

_Explicação:_ Correto. Semente de linhaça atende a apenas uma das duas exigências.
_Pista:_ Conte quantas das duas exigências cada produto cumpre.

---

### tresCondicoes · nível 1

**Qual produto é do tipo tradicional, custa até R$ 11,50 e tem pelo menos 400 g?**

     **Molho barbecue** (Churras Sabor) — Peso: 400 g · Preço: R$ 14,40 · Tipo: defumado
     **Molho de tomate** (Casa Toscana) — Peso: 300 g · Preço: R$ 3,90 · Tipo: tradicional
  ✅ **Maionese** (Vale Sabor) — Peso: 500 g · Preço: R$ 10,90 · Tipo: tradicional

_Explicação:_ Correto. Maionese (Vale Sabor) atende: Tipo — tradicional · Preço — R$ 10,90 · Peso — 500 g.
_Pista:_ Confira “Tipo”, “Preço” e “Peso” antes de responder.

---

### validade · nível 1

**Qual produto vence depois de 06/2028?**

  ✅ **Arroz tipo 1** (Sítio Dourado) — Peso: 1 kg · Preço: R$ 7,90 · Validade: 07/2028
     **Espaguete** (Massa Nobre) — Peso: 500 g · Preço: R$ 7,40 · Validade: 02/2027
     **Feijão carioca** (Feijão da Roça) — Peso: 1 kg · Preço: R$ 7,90 · Validade: 05/2027

_Explicação:_ Correto. Arroz tipo 1 (Sítio Dourado) atende: Validade — 07/2028.
_Pista:_ Confira o campo “Validade” em cada produto.

---

### conservacao · nível 1

**Qual produto precisa ser conservado em local seco?**

     **Requeijão cremoso** (Vellano) — Peso: 200 g · Preço: R$ 10,40 · Conservação: Manter refrigerado
     **Margarina cremosa** (Bela Mesa) — Peso: 500 g · Preço: R$ 8,90 · Conservação: Manter refrigerado
  ✅ **Creme de leite** (Vale Sereno) — Peso: 200 g · Preço: R$ 3,90 · Conservação: Conservar em local seco

_Explicação:_ Correto. Creme de leite (Vale Sereno) atende: Conservação — Conservar em local seco.
_Pista:_ Confira o campo “Conservação” em cada produto.

---

### ingredientes · nível 1

**Qual produto não contém lactose?**

     **Requeijão cremoso** (Vellano) — Peso: 200 g · Preço: R$ 10,40 · Lactose: Contém lactose
  ✅ **Margarina cremosa** (Bela Mesa) — Peso: 500 g · Preço: R$ 8,90 · Lactose: Não contém lactose
     **Manteiga com sal** (Vale Dourado) — Peso: 200 g · Preço: R$ 14,40 · Lactose: Contém lactose

_Explicação:_ Correto. Margarina cremosa (Bela Mesa) atende: Lactose — Não contém lactose.
_Pista:_ Confira o campo “Lactose” em cada produto.

---

### alergenicos · nível 1

**Qual produto contém ovo?**

     **Molho barbecue** (Churras Sabor) — Peso: 400 g · Preço: R$ 14,40 · Alérgenos: Sem alérgenos declarados
     **Ketchup** (Saborio) — Peso: 400 g · Preço: R$ 9,90 · Alérgenos: Sem alérgenos declarados
  ✅ **Maionese** (Vale Sabor) — Peso: 500 g · Preço: R$ 10,90 · Alérgenos: Contém ovo

_Explicação:_ Correto. Maionese (Vale Sabor) atende: Alérgenos — Contém ovo.
_Pista:_ Confira o campo “Alérgenos” em cada produto.

---

### situacao · nível 1

> **SITUAÇÃO DO COTIDIANO**
> Fernanda vai adoçar o café.
> Pedido: 40 g

**Qual produto atende ao pedido?**

     **Mel** (Apiário Flor do Campo) — Peso: 500 g · Preço: R$ 27,40 · Validade: 06/2027
     **Açúcar refinado** (Doce Vida) — Peso: 1 kg · Preço: R$ 6,90 · Validade: 08/2027
  ✅ **Adoçante dietético** (Vida Leve) — Peso: 40 g · Preço: R$ 19,90 · Validade: 10/2027

_Explicação:_ Correto. Adoçante dietético (Vida Leve) atende: Peso — 40 g.
_Pista:_ Confira o campo “Peso” em cada produto.

---

### leituraEmbalagem · nível 4

**Olhe as embalagens: qual produto informa “pronto para aquecer” na embalagem?**

  ✅ **Lasanha congelada** (Forno da Serra) — Peso: 600 g · Preço: R$ 18,90 · Validade: 02/2027 · Conservação: Manter congelado
     **Nuggets de frango** (Frango Dourado) — Peso: 300 g · Preço: R$ 12,40 · Validade: 11/2026 · Conservação: Manter congelado
     **Hambúrguer vegetal** (Verde Burger) — Peso: 320 g · Preço: R$ 17,40 · Validade: 10/2026 · Conservação: Manter congelado
     **Sopa congelada de legumes** (Prato Leve) — Peso: 400 g · Preço: R$ 11,40 · Validade: 12/2026 · Conservação: Manter congelado

_Explicação:_ Correto. Lasanha congelada (Forno da Serra) atende: Na embalagem — .
_Pista:_ Confira o campo “Na embalagem” em cada produto.
