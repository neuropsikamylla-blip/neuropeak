# Grade Dedutiva — proposta do banco novo (Fase 5)

Data: 2026-09-08 · Autor: VP · Estado: **PROPOSTA — nenhum problema foi escrito ainda**

Responde ao pedido dela: *"que problemas novos"*. Tudo aqui foi **medido** com o solver e a
ferramenta de triagem (`lib/grade/estrutura.ts`, v3.12.0), não estimado por leitura.

---

## 1. As seis pistas de exemplo dela, medidas

Transcrevi as seis literalmente para os operadores do motor e rodei. O resultado **valida o
desenho dela**:

| | pistas dela | biblioteca atual |
|---|---|---|
| intracategoria | **0** | 8 |
| cross-category | **7** | 0 |
| arestas do grafo | **4 de 6** | 0 de 6 |
| componentes | **1** | 4 |

É exatamente a rede que ela pediu. **Mas ainda não fecham o problema:** deixam **120 soluções**.
Medindo a convergência com pistas do mesmo estilo: 7 pistas → 14 soluções · 8 → 9 · 9 → 2.
**Um 4×4 no estilo dela fecha com cerca de 10 pistas.**

---

## 2. Três achados que mudam o desenho do banco

### 2.1 A pista "Nina não participou de História nem esteve na Sala Pesquisa" são DUAS restrições

Cada `Pista` tem **um** tipo e **um** texto; o motor não tem operador de conjunção. Ou a frase dela
vira **duas** pistas (`Nina ≠ História` · `Nina ≠ Pesquisa`), perdendo a redação, ou entra um
operador novo que aceite uma lista de exclusões sob um texto só. **Decisão dela.**

### 2.2 ⚠️ Horário sequencial é a POSIÇÃO disfarçada

O paciente sabe que 14h < 15h < 16h < 17h. **O motor não sabe** — para ele "Horário" é uma
categoria como qualquer outra.

**Medido:** das 120 soluções que o motor aceita com as pistas dela, **só 4 têm o horário em ordem
cronológica**. As outras **116** o motor aceita e a pessoa **recusaria de saída**.

É por isso que a biblioteca atual tem as pistas 7 e 8 (cadeias `T7` sobre horários): **duas das oito
pistas existem só para ensinar ao motor o que o paciente já sabe**. Trabalho cognitivamente vazio,
que ainda por cima ocupa o lugar de uma pista de verdade.

**Proposta:** o horário deixa de ser linha e vira **rótulo da coluna** (`Posição 1` → `14h`), e a
linha liberada recebe um atributo real. Exige um campo opcional `rotulosPosicao` no tipo `Puzzle` —
**aditivo, não reconstrói a interface**, mas muda o cabeçalho da grade e por isso precisa do aval dela.

### 2.3 Conectado não basta: grau ≥ 2

O museu **passa** em conectividade (3 de 6 arestas, 1 componente) e mesmo assim é uma **cadeia**:
`responsável — obra — sala — horário`, com as pontas de **grau 1**. Quebrado um elo, viram dois
problemas. Nas pistas dela o horário também ficou com **grau 1** — mesmo sintoma.

**Proposta:** acrescentar à triagem a exigência de que **toda categoria tenha ao menos duas
arestas**. É o critério que separa rede de cadeia, e nenhum dos puzzles atuais passa nele.

---

## 3. A escada proposta — 16 problemas + tutorial

| nível | tamanho | quantos | o que entra de novo |
|---|---|---|---|
| 1 | 3×3 | 1 (o tutorial atual) | isento, fica como está |
| 2 | 4 pos × 3 cat | 4 | associação cruzada · exclusão · posição absoluta |
| 3 | 4 × 4 | 4 | ordem relativa · adjacência dirigida ("logo antes de") |
| 4 | 5 × 4 | 4 | "entre, nessa ordem" · adjacência nas pontas |
| 5 | 5 × 5 | 4 | condicional (`T9`) · alternativa exclusiva (`T10`) |

Dentro da faixa dela (12–20) e do princípio *"não quero 100 problemas ruins"*.

**Temas adultos** (seção 64), um por problema: consultas numa clínica · encontros na biblioteca
(refeito) · mostra no museu (refeito) · apresentações num congresso · turnos numa cafeteria ·
sessões de um cineclube · oficinas num centro cultural · entregas num prédio · mesas de um
restaurante · estandes numa feira · salas de coworking · concertos de uma temporada.

---

## 4. A régua de autoria — nenhum problema entra sem passar

1. **solução única**, provada pelo solver (necessária, **não suficiente**);
2. **grafo conectado** — 1 componente *(já implementado, reprova)*;
3. **grau ≥ 2** em toda categoria *(NOVO — mata a cadeia)*;
4. **pistas cross > intracategoria** — *"a maioria das conclusões não deve ser obtida resolvendo
   cada linha separadamente"* *(NOVO)*;
5. **nenhuma categoria isomorfa à posição** — sem horário sequencial como linha *(NOVO)*;
6. **no máximo 1 categoria na ordem declarada** — hoje só reprova quando são **todas** *(apertar)*.

Os itens 3 a 6 ainda **não** estão implementados. São a próxima fatia, e vêm **antes** de escrever
problema nenhum: a régua primeiro, os problemas depois.

---

## 5. O que depende de decisão dela

1. A pista composta (2.1): duas pistas, ou operador novo?
2. O horário como rótulo de coluna (2.2): autoriza o campo `rotulosPosicao`?
3. A escada da seção 3: 16 problemas nessa distribuição?
4. Os três puzzles atuais são **refeitos**, não corrigidos — dois têm o defeito estrutural e os
   três têm o da ordem declarada.
