# Auditoria do catálogo — Informação em Foco (2026-08-02)

FASE 1 §16. **73 produtos**, todos com o conteúdo **lido na própria embalagem** (leitura visual,
sem OCR) e conferido contra a imagem em `public/exercises/informacao-foco-produtos/`.

- **Nenhum produto ficou pendente de revisão**: o peso/volume/contagem estava legível em todas as 73.
- Correções estruturais que este catálogo elimina: lactose e sabor sorteados para qualquer produto;
  peso/volume inventados por questão; líquido exibido em gramas.
- Coluna "leitura direta" = produto autorizado na modalidade B da Fase 2 (tem frase legível confirmada).

| ID | Produto | Marca | Categoria | Conteúdo lido | Leitura direta | Atributos fixos | Faixa de preço | Status |
|---|---|---|---|---|---|---|---|---|
| leite-integral | Leite integral | Fazenda Boa | leites | 1 L | sim | tipo=integral; lactose=true; conservacao=seco | R$ 4.5–6.5 | OK |
| leite-semidesnatado | Leite semidesnatado | Vida Leve | leites | 1 L | sim | tipo=semidesnatado; lactose=true; conservacao=seco | R$ 4.5–6.5 | OK |
| leite-desnatado | Leite desnatado | Serra Clara | leites | 1 L | não | tipo=desnatado; lactose=true; conservacao=seco | R$ 4.5–6.5 | OK |
| leite-sem-lactose | Leite sem lactose | LeveMais | leites | 1 L | sim | tipo=sem lactose; lactose=false; conservacao=seco | R$ 6.5–9.5 | OK |
| leite-em-po | Leite em pó integral | Vale do Campo | leites | 400 g | sim | tipo=integral; lactose=true; rendimento=10 copos; conservacao=seco | R$ 16–24 | OK |
| bebida-aveia | Bebida de aveia | Aveia Viva | bebidas-vegetais | 1 L | sim | lactose=false; acucarAdicionado=false; conservacao=seco | R$ 8–13 | OK |
| bebida-amendoas | Bebida de amêndoas | Amêndoa Pura | bebidas-vegetais | 1 L | sim | lactose=false; conservacao=seco | R$ 9–15 | OK |
| suco-laranja | Suco de laranja | Sol da Laranja | sucos | 1 L | sim | sabor=laranja; acucarAdicionado=false; conservacao=seco | R$ 7–12 | OK |
| suco-uva | Suco de uva | Vale da Uva | sucos | 1 L | sim | sabor=uva; acucarAdicionado=false; conservacao=seco | R$ 9–15 | OK |
| iogurte-natural | Iogurte natural | Campo Vivo | iogurtes | 170 g | não | sabor=natural; lactose=true; conservacao=refrigerado | R$ 3–5 | OK |
| iogurte-sem-lactose | Iogurte sem lactose | LeveMais | iogurtes | 170 g | sim | sabor=natural; lactose=false; conservacao=refrigerado | R$ 4–6.5 | OK |
| manteiga | Manteiga com sal | Vale Dourado | laticinios | 200 g | não | tipo=com sal; lactose=true; conservacao=refrigerado | R$ 11–18 | OK |
| margarina | Margarina cremosa | Bela Mesa | laticinios | 500 g | sim | tipo=cremosa; lactose=false; conservacao=refrigerado | R$ 7–12 | OK |
| requeijao | Requeijão cremoso | Vellano | laticinios | 200 g | não | tipo=tradicional; lactose=true; conservacao=refrigerado | R$ 7–12 | OK |
| mucarela | Queijo muçarela fatiado | Villaggio | laticinios | 150 g | não | lactose=true; conservacao=refrigerado | R$ 9–15 | OK |
| creme-leite | Creme de leite | Vale Sereno | laticinios | 200 g | não | lactose=true; conservacao=seco | R$ 3.5–6 | OK |
| leite-condensado | Leite condensado | Doçura | doces | 395 g | sim | lactose=true; gluten=false; acucarAdicionado=true; conservacao=seco | R$ 6–10 | OK |
| presunto | Presunto cozido fatiado | Saboratto | frios | 200 g | não | conservacao=refrigerado | R$ 8–14 | OK |
| ovos | Ovos brancos | Campo Sereno | ovos | 12 unidades | sim | unidades=12; conservacao=refrigerado | R$ 12–20 | OK |
| biscoito-maria | Biscoito Maria | Casa do Trigo | biscoitos | 400 g | não | tipo=tradicional; gluten=true; acucarAdicionado=true; conservacao=seco | R$ 4–7 | OK |
| biscoito-integral | Biscoito integral | Sabor da Vila | biscoitos | 400 g | sim | tipo=integral; gluten=true; acucarAdicionado=true; conservacao=seco | R$ 5–8 | OK |
| biscoito-sem-acucar | Biscoito sem açúcar | Leve Sabor | biscoitos | 350 g | sim | tipo=integral; gluten=true; acucarAdicionado=false; conservacao=seco | R$ 6–10 | OK |
| torrada | Torrada integral | Grão Crocante | biscoitos | 160 g | sim | tipo=integral; gluten=true; conservacao=seco | R$ 5–8 | OK |
| pao-forma | Pão de forma integral | Pão da Vila | paes | 500 g | sim | tipo=integral; gluten=true; conservacao=seco | R$ 7–12 | OK |
| aveia | Aveia em flocos | Campo Dourado | cereais | 450 g | sim | tipo=integral; gluten=true; conservacao=seco | R$ 7–12 | OK |
| granola | Granola tradicional | Terra Viva | cereais | 500 g | sim | tipo=tradicional; acucarAdicionado=true; conservacao=seco | R$ 14–22 | OK |
| granola-sem-acucar | Granola sem açúcar | Colheita Boa | cereais | 400 g | sim | acucarAdicionado=false; conservacao=seco | R$ 16–24 | OK |
| cereal-matinal | Cereal matinal | Bom Grão | cereais | 300 g | sim | tipo=multigrãos; acucarAdicionado=true; conservacao=seco | R$ 9–15 | OK |
| chia | Chia em grãos | Vida Leve | cereais | 150 g | sim | conservacao=seco | R$ 9–16 | OK |
| linhaca | Semente de linhaça | Natureza Pura | cereais | 200 g | sim | tipo=dourada; conservacao=seco | R$ 7–12 | OK |
| arroz | Arroz tipo 1 | Sítio Dourado | graos-e-massas | 1 kg | sim | tipo=tipo 1; gluten=false; conservacao=seco | R$ 5–9 | OK |
| feijao | Feijão carioca | Feijão da Roça | graos-e-massas | 1 kg | sim | tipo=tipo 1; gluten=false; conservacao=seco | R$ 7–12 | OK |
| espaguete | Espaguete | Massa Nobre | graos-e-massas | 500 g | sim | tipo=massa de sêmola; gluten=true; conservacao=seco | R$ 4–8 | OK |
| farinha-trigo | Farinha de trigo | Bom Campo | farinaceos | 1 kg | sim | tipo=tradicional; gluten=true; conservacao=seco | R$ 4.5–8 | OK |
| farinha-mandioca | Farinha de mandioca | Sabor da Terra | farinaceos | 500 g | sim | tipo=torrada; gluten=false; conservacao=seco | R$ 6–10 | OK |
| fuba | Fubá | Campo Novo | farinaceos | 500 g | sim | tipo=farinha de milho fina; gluten=false; conservacao=seco | R$ 3.5–6 | OK |
| polvilho-doce | Polvilho doce | SolVale | farinaceos | 500 g | sim | gluten=false; conservacao=seco | R$ 6–10 | OK |
| goma-tapioca | Goma de tapioca | Tapioka Viva | farinaceos | 500 g | sim | tipo=hidratada; gluten=false; conservacao=seco | R$ 5–9 | OK |
| fermento | Fermento químico em pó | Casa Nobre | farinaceos | 100 g | não | conservacao=seco | R$ 4–7 | OK |
| gelatina | Gelatina incolor | Doce Flora | doces | 24 g | sim | tipo=incolor; sabor=sem sabor; rendimento=12 porções; conservacao=seco | R$ 5–9 | OK |
| milho-conserva | Milho em conserva | Sabor do Campo | conservas | 200 g | sim | gluten=false; conservacao=seco | R$ 3.5–6 | OK |
| ervilha | Ervilha em conserva | Verde Vale | conservas | 200 g | sim | conservacao=seco | R$ 3.5–6 | OK |
| atum | Atum em lata | Mar Azul | conservas | 170 g | sim | tipo=em óleo; conservacao=seco | R$ 7–12 | OK |
| lasanha | Lasanha congelada | Forno da Serra | congelados | 600 g | sim | tipo=à bolonhesa; lactose=true; gluten=true; conservacao=congelado | R$ 18–28 | OK |
| nuggets | Nuggets de frango | Frango Dourado | congelados | 300 g | sim | gluten=true; conservacao=congelado | R$ 12–20 | OK |
| hamburguer-vegetal | Hambúrguer vegetal | Verde Burger | congelados | 320 g | sim | lactose=false; conservacao=congelado | R$ 16–26 | OK |
| sopa-legumes | Sopa congelada de legumes | Prato Leve | congelados | 400 g | sim | conservacao=congelado | R$ 10–17 | OK |
| molho-tomate | Molho de tomate | Casa Toscana | molhos | 300 g | sim | tipo=tradicional; conservacao=seco | R$ 2.5–5 | OK |
| ketchup | Ketchup | Saborio | molhos | 400 g | sim | tipo=tradicional; acucarAdicionado=true; conservacao=seco | R$ 7–12 | OK |
| maionese | Maionese | Vale Sabor | molhos | 500 g | sim | tipo=tradicional; conservacao=seco | R$ 8–14 | OK |
| molho-barbecue | Molho barbecue | Churras Sabor | molhos | 400 g | sim | tipo=defumado; acucarAdicionado=true; conservacao=seco | R$ 10–16 | OK |
| shoyu | Molho shoyu | Sabor Oriental | molhos | 150 mL | sim | tipo=tradicional; gluten=true; conservacao=seco | R$ 7–12 | OK |
| oleo-soja | Óleo de soja | VitaNova | oleos-e-vinagres | 900 mL | não | conservacao=luz | R$ 7–12 | OK |
| azeite | Azeite de oliva | Vale Verde | oleos-e-vinagres | 500 mL | sim | tipo=extra virgem; conservacao=luz | R$ 28–45 | OK |
| vinagre | Vinagre de álcool | Vitáre | oleos-e-vinagres | 750 mL | não | conservacao=seco | R$ 3–6 | OK |
| vinagre-balsamico | Vinagre balsâmico | Villa Romana | oleos-e-vinagres | 250 mL | sim | tipo=de Modena; conservacao=seco | R$ 12–22 | OK |
| vinagre-maca | Vinagre de maçã | Sabor & Vida | oleos-e-vinagres | 500 mL | sim | tipo=não filtrado; conservacao=seco | R$ 8–14 | OK |
| cafe | Café solúvel | Bom Dia | cafes-e-chas | 200 g | sim | tipo=solúvel tradicional; conservacao=seco | R$ 14–24 | OK |
| cafe-torrado | Café torrado e moído | Serra Bonita | cafes-e-chas | 500 g | sim | tipo=torrado e moído; conservacao=seco | R$ 16–28 | OK |
| cha-camomila | Chá de camomila | Floravita | cafes-e-chas | 10 g | sim | tipo=camomila; lactose=null; saches=10; conservacao=seco | R$ 5–9 | OK |
| cha-verde | Chá verde | Chá Vital | cafes-e-chas | 13 g | sim | tipo=chá verde; saches=10; conservacao=seco | R$ 6–10 | OK |
| acucar-refinado | Açúcar refinado | Doce Vida | acucares-e-adocantes | 1 kg | sim | tipo=refinado; acucarAdicionado=true; conservacao=seco | R$ 4–7 | OK |
| acucar-mascavo | Açúcar mascavo | Terra Boa | acucares-e-adocantes | 1 kg | sim | tipo=mascavo; acucarAdicionado=true; conservacao=seco | R$ 8–14 | OK |
| adocante-stevia | Adoçante dietético | Vida Leve | acucares-e-adocantes | 40 g | sim | tipo=com stevia; acucarAdicionado=false; saches=50; conservacao=seco | R$ 12–20 | OK |
| mel | Mel | Apiário Flor do Campo | acucares-e-adocantes | 500 g | não | conservacao=seco | R$ 22–35 | OK |
| achocolatado | Achocolatado em pó | Chocomax | doces | 400 g | sim | lactose=false; acucarAdicionado=true; conservacao=seco | R$ 8–14 | OK |
| chocolate-70 | Chocolate 70% cacau | Cacau Nobre | doces | 80 g | sim | gluten=false; acucarAdicionado=true; conservacao=seco; cacauPct=70 | R$ 8–14 | OK |
| geleia-morango | Geleia de morango | Sabor da Fazenda | doces | 250 g | sim | sabor=morango; acucarAdicionado=true; conservacao=refrigerado | R$ 10–17 | OK |
| pasta-amendoim | Pasta de amendoim | NutriBem | pastas | 500 g | sim | tipo=integral; acucarAdicionado=false; conservacao=seco | R$ 18–30 | OK |
| sal | Sal refinado | Costa | temperos | 1 kg | sim | tipo=iodado; conservacao=seco | R$ 2–4 | OK |
| sal-rosa | Sal rosa do Himalaia | Canto de Minas | temperos | 500 g | sim | tipo=fino; conservacao=seco | R$ 12–20 | OK |
| ervas-finas | Ervas finas | — | temperos | 20 g | sim | conservacao=seco | R$ 7–12 | OK |
| mix-pimentas | Mix de pimentas | Chef's Selection | temperos | 50 g | sim | tipo=moedor; conservacao=seco | R$ 12–20 | OK |

## Divergências encontradas entre imagem e cadastro anterior

O cadastro anterior (`MODELOS` em `lib/informacao-foco.ts`) **não tinha conteúdo**: peso, volume,
unidades e validade eram sorteados na geração da questão. Portanto toda divergência era possível —
não havia dado a comparar. Este relatório é o primeiro cadastro fiel à embalagem.

## Pendências

Nenhuma para conteúdo. Os campos `ingredientes` (lista completa) não foram cadastrados: as
embalagens não trazem tabela de ingredientes legível, e a spec proíbe inventar. As perguntas de
alergênicos usam o campo `alergenicos`, preenchido só quando a embalagem deixa claro (amendoim,
amêndoa, ovo, soja, peixe).
