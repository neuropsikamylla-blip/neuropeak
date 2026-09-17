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

**Qual produto vence primeiro?**

     **Gelatina incolor** (Doce Flora) — Peso: 24 g · Preço: R$ 6,40 · Validade: 07/2028
     **Chocolate 70% cacau** (Cacau Nobre) — Peso: 80 g · Preço: R$ 9,90 · Validade: 01/2027
  ✅ **Leite condensado** (Doçura) — Peso: 395 g · Preço: R$ 9,40 · Validade: 12/2026

_Explicação:_ Correto. Leite condensado (Doçura) atende: Validade — 12/2026.
_Pista:_ Confira o campo “Validade” em cada produto.

---

### filtroComparacao · nível 1

**Entre os produtos que vencem depois de 05/2027, qual tem o menor preço?**

  ✅ **Biscoito sem açúcar** (Leve Sabor) — Peso: 350 g · Preço: R$ 7,40 · Validade: 06/2027
     **Biscoito Maria** (Casa do Trigo) — Peso: 400 g · Preço: R$ 4,90 · Validade: 04/2027
     **Pão de forma integral** (Pão da Vila) — Peso: 500 g · Preço: R$ 9,90 · Validade: 07/2027

_Explicação:_ Correto. Biscoito sem açúcar (Leve Sabor) atende: Validade — 06/2027 · Preço — R$ 7,40.
_Pista:_ Confira “Validade” e “Preço” antes de responder.

---

### duasCondicoes · nível 1

**Qual produto não contém lactose e custa até R$ 9,50?**

  ✅ **Bebida de aveia** (Aveia Viva) — Volume: 1 L · Preço: R$ 8,90 · Lactose: Não contém lactose
     **Bebida de amêndoas** (Amêndoa Pura) — Volume: 1 L · Preço: R$ 10,40 · Lactose: Não contém lactose
     **Leite integral** (Fazenda Boa) — Volume: 1 L · Preço: R$ 4,40 · Lactose: Contém lactose

_Explicação:_ Correto. Bebida de aveia (Aveia Viva) atende: Lactose — Não contém lactose · Preço — R$ 8,90.
_Pista:_ Confira “Lactose” e “Preço” antes de responder.

---

### tresCondicoes · nível 1

**Qual produto custa até R$ 10,50, é do tipo tradicional e tem pelo menos 400 g?**

     **Maionese** (Vale Sabor) — Peso: 500 g · Preço: R$ 10,90 · Tipo: tradicional
     **Molho de tomate** (Casa Toscana) — Peso: 300 g · Preço: R$ 3,90 · Tipo: tradicional
  ✅ **Ketchup** (Saborio) — Peso: 400 g · Preço: R$ 9,90 · Tipo: tradicional

_Explicação:_ Correto. Ketchup (Saborio) atende: Preço — R$ 9,90 · Tipo — tradicional · Peso — 400 g.
_Pista:_ Confira “Preço”, “Tipo” e “Peso” antes de responder.

---

### validade · nível 1

**Qual produto vence depois de 03/2028?**

  ✅ **Creme de leite** (Vale Sereno) — Peso: 200 g · Preço: R$ 3,90 · Validade: 04/2028
     **Manteiga com sal** (Vale Dourado) — Peso: 200 g · Preço: R$ 14,40 · Validade: 10/2026
     **Queijo muçarela fatiado** (Villaggio) — Peso: 150 g · Preço: R$ 13,90 · Validade: 10/2026

_Explicação:_ Correto. Creme de leite (Vale Sereno) atende: Validade — 04/2028.
_Pista:_ Confira o campo “Validade” em cada produto.

---

### conservacao · nível 1

**Qual produto precisa ser mantido refrigerado?**

     **Gelatina incolor** (Doce Flora) — Peso: 24 g · Preço: R$ 6,40 · Conservação: Conservar em local seco
     **Achocolatado em pó** (Chocomax) — Peso: 400 g · Preço: R$ 8,90 · Conservação: Conservar em local seco
  ✅ **Geleia de morango** (Sabor da Fazenda) — Peso: 250 g · Preço: R$ 16,90 · Conservação: Manter refrigerado

_Explicação:_ Correto. Geleia de morango (Sabor da Fazenda) atende: Conservação — Manter refrigerado.
_Pista:_ Confira o campo “Conservação” em cada produto.

---

### ingredientes · nível 1

**Qual produto não contém lactose?**

     **Queijo muçarela fatiado** (Villaggio) — Peso: 150 g · Preço: R$ 13,90 · Lactose: Contém lactose
     **Requeijão cremoso** (Vellano) — Peso: 200 g · Preço: R$ 10,40 · Lactose: Contém lactose
  ✅ **Margarina cremosa** (Bela Mesa) — Peso: 500 g · Preço: R$ 8,90 · Lactose: Não contém lactose

_Explicação:_ Correto. Margarina cremosa (Bela Mesa) atende: Lactose — Não contém lactose.
_Pista:_ Confira o campo “Lactose” em cada produto.

---

### alergenicos · nível 1

**Qual produto contém soja?**

  ✅ **Óleo de soja** (VitaNova) — Volume: 900 mL · Preço: R$ 9,40 · Alérgenos: Contém soja
     **Azeite de oliva** (Vale Verde) — Volume: 500 mL · Preço: R$ 36,90 · Alérgenos: Sem alérgenos declarados
     **Vinagre balsâmico** (Villa Romana) — Volume: 250 mL · Preço: R$ 18,40 · Alérgenos: Sem alérgenos declarados

_Explicação:_ Correto. Óleo de soja (VitaNova) atende: Alérgenos — Contém soja.
_Pista:_ Confira o campo “Alérgenos” em cada produto.

---

### situacao · nível 1

> **SITUAÇÃO DO COTIDIANO**
> Carlos quer um café da manhã reforçado.
> Pedido: 400 g

**Qual produto atende ao pedido?**

     **Chia em grãos** (Vida Leve) — Peso: 150 g · Preço: R$ 10,40 · Validade: 05/2028
     **Granola tradicional** (Terra Viva) — Peso: 500 g · Preço: R$ 15,40 · Validade: 03/2028
  ✅ **Granola sem açúcar** (Colheita Boa) — Peso: 400 g · Preço: R$ 16,40 · Validade: 01/2027

_Explicação:_ Correto. Granola sem açúcar (Colheita Boa) atende: Peso — 400 g.
_Pista:_ Confira o campo “Peso” em cada produto.

---

### leituraEmbalagem · nível 4

**Olhe as embalagens: qual produto informa “fonte de antioxidantes” na embalagem?**

     **Chá de camomila** (Floravita) — Peso: 10 g · Preço: R$ 7,40 · Validade: 06/2027 · Conservação: Conservar em local seco
     **Café torrado e moído** (Serra Bonita) — Peso: 500 g · Preço: R$ 25,40 · Validade: 06/2028 · Conservação: Conservar em local seco
  ✅ **Chá verde** (Chá Vital) — Peso: 13 g · Preço: R$ 8,90 · Validade: 03/2028 · Conservação: Conservar em local seco
     **Café solúvel** (Bom Dia) — Peso: 200 g · Preço: R$ 22,90 · Validade: 07/2028 · Conservação: Conservar em local seco

_Explicação:_ Correto. Chá verde (Chá Vital) atende: Na embalagem — .
_Pista:_ Confira o campo “Na embalagem” em cada produto.
