# Compra Multifuncional — Redesign cognitivo (spec)

> Especificação da Kamylla (jul/2026). Objetivo central: **a interface parou de
> resolver a tarefa para o paciente durante a rodada.** O paciente deve pensar,
> monitorar as regras, contar itens e estimar/somar valores por conta própria. O
> sistema calcula tudo internamente, mas só revela o resultado **depois** do
> "Confirmar compra". Métricas detalhadas vão para o terapeuta, não para o paciente.
>
> Status: **PENDENTE** (ainda não implementado). Componente:
> `components/exercises/executive/CompraMultifuncional.tsx`.
> Ver memória [[compra-multifuncional-redesign-cognitivo]] e [[compra-contextual]].

---

## Fluxo desejado do paciente

1. ler a situação;
2. ler as regras;
3. escolher os itens;
4. confirmar;
5. receber apenas **"correto"** ou **"incorreto"** (com subtexto curto opcional);
6. seguir para a próxima rodada.

Funções trabalhadas: função executiva, planejamento, cálculo simples, controle
inibitório e monitoramento de regras.

---

## 1. Reduzir informação durante a rodada

Durante a rodada, mostrar **apenas**:
- título do exercício;
- nível;
- tempo;
- situação;
- regras da compra;
- cards dos produtos;
- botão "Confirmar compra";
- botão de dica (se já existir).

**Não** mostrar validação dinâmica das regras durante a escolha.

**Remover durante a rodada:**
- check verde nas regras;
- X vermelho nas regras;
- contadores "2/2", "3/2";
- total calculado em tempo real;
- "R$ 24,70" ao lado da regra;
- qualquer indicação de regra certa/errada **antes** de confirmar.

Antes (ruim) → depois (certo):
- "Escolha exatamente 2 itens — 3/2" → "Escolha exatamente 2 itens"
- "Total no máximo R$ 20,00 — R$ 24,70" → "Total no máximo R$ 20,00"

## 2. Não somar automaticamente

- calcular total internamente;
- **não** exibir total durante a seleção;
- **não** exibir se passou do orçamento antes de confirmar;
- só avaliar depois do clique em "Confirmar compra".

## 3. Feedback simples ao paciente

Depois de confirmar, mostrar só uma resposta simples:
- acertou → **"Compra correta!"**
- errou → **"Compra incorreta. Revise as regras."**

Opcional: mostrar só a regra que falhou, sem painel de desempenho. Ex.:
- "Compra incorreta. Você escolheu itens demais."
- "Compra incorreta. O total passou do orçamento."

**Remover da tela de feedback do paciente:** tempo, trocas, pontuação, acertos
seguidos, "faltam 2 acertos para subir de nível", nível interno, desempenho detalhado.

## 4. Métricas ficam para o terapeuta

Registrar internamente (metadata da sessão): tempo de resposta, nº de trocas, nº de
confirmações erradas, regra que falhou, orçamento excedido, quantidade incorreta,
categoria incorreta, acertos seguidos, nível de dificuldade interno.

Na tela do paciente, só: compra correta / compra incorreta / próxima rodada. O
relatório detalhado vai para o painel do terapeuta ou resumo final.

## 5. Progressão de regras (7 níveis)

O nível fácil pode continuar simples, mas a progressão aumenta a carga cognitiva.

- **D1 — uma ou duas regras simples:**
  - Compre exatamente 2 itens.
  - Compre até R$ 20,00.
  - Compre 2 itens de farmácia.
- **D2 — quantidade + orçamento:**
  - Compre exatamente 2 itens gastando no máximo R$ 15,00.
  - Compre exatamente 3 itens gastando no máximo R$ 25,00.
- **D3 — quantidade + categoria + orçamento:**
  - Compre exatamente 2 itens de higiene gastando no máximo R$ 20,00.
  - Compre exatamente 3 alimentos gastando no máximo R$ 30,00.
  - Compre 2 itens de farmácia gastando no máximo R$ 25,00.
- **D4 — combinação de categorias:**
  - Compre exatamente 3 itens: 1 bebida, 1 alimento e 1 higiene.
  - Compre 2 itens, sendo pelo menos 1 medicamento.
  - Compre 3 itens, sendo exatamente 1 bebida.
- **D5 — exclusão:**
  - Compre 3 itens gastando até R$ 30,00, mas não compre cosméticos.
  - Compre 2 itens de farmácia, mas evite bebidas.
  - Compre 3 itens, mas nenhum pode ser snack.
- **D6 — planejamento mais exigente:**
  - Compre exatamente 4 itens gastando até R$ 40,00, incluindo pelo menos 1 higiene e 1 alimento.
  - Compre 3 itens gastando até R$ 25,00, sem repetir categoria.
  - Compre 4 itens, sendo 2 alimentos e 1 bebida, gastando no máximo R$ 35,00.
- **D7 — maior carga executiva, sem confusão:**
  - Compre exatamente 4 itens, com pelo menos 3 categorias diferentes, gastando até R$ 40,00.
  - Compre 3 itens de categorias diferentes, sem passar de R$ 30,00.
  - Compre 4 itens, incluindo 1 medicamento, mas sem comprar cosmético.

## 6. A rodada precisa exigir escolha real

Evitar rodadas com resposta óbvia. Cada rodada deve ter:
- pelo menos uma combinação correta possível;
- distratores plausíveis;
- itens baratos e caros misturados;
- itens da categoria correta que fazem passar do orçamento;
- itens da categoria errada que cabem no orçamento;
- itens bons isoladamente, mas ruins em combinação.

Exemplo bom — regra "Compre exatamente 2 itens de farmácia gastando no máximo R$ 20,00":
- Pomada — R$ 11,90 — medicamento
- Vitamina C — R$ 9,90 — medicamento
- Água — R$ 2,90 — bebida
- Hidratante — R$ 19,90 — cosmético
- Batom — R$ 14,90 — cosmético
- Perfume — R$ 49,90 — cosmético

O paciente precisa perceber: Pomada + Vitamina C passa de R$ 20,00; Água é barata
mas não é da categoria; Hidratante parece farmácia mas é cosmético; precisa achar a
combinação válida. Melhor do que só clicar em itens "verdes".

## 7. Regras estáticas durante a seleção

Exibição correta (sem check, sem X, sem contagem, sem total automático):

```
SITUAÇÃO
Você precisa comprar itens de farmácia para sintomas leves e higiene.

REGRAS
- Escolha exatamente 2 itens.
- Gaste no máximo R$ 20,00.
- Escolha apenas itens de farmácia.
```

## 8. Dica discreta (cognitiva, não a resposta)

Ao clicar em "Preciso de uma dica", mostrar dica cognitiva. Ex.:
- "Confira primeiro a quantidade de itens."
- "Some os preços antes de confirmar."
- "Veja se todos os itens pertencem à categoria pedida."
- "Cuidado com itens baratos que não seguem a categoria."

**Não** mostrar: quais itens escolher, total já calculado, resposta pronta.

## 9. Resultado da rodada (tela simples)

- Correto: **"Compra correta!"** — subtexto opcional "Você cumpriu todas as regras." — botão "Próxima rodada".
- Incorreto: **"Compra incorreta."** — subtexto opcional "Revise quantidade, categoria e orçamento." ou específico:
  - "Você ultrapassou o orçamento."
  - "Você escolheu itens demais."
  - "Um dos itens não pertence à categoria pedida."

Manter curto. Sem painel de desempenho detalhado nessa tela.

## 10. Resumo do ajuste

**Remover (visível ao paciente):** validação em tempo real; total automático visível;
contagem 2/2 ou 3/2; check/X nas regras durante seleção; painel de desempenho
detalhado; acertos seguidos / subida de nível.

**Manter internamente:** correção automática; cálculo do total; métricas; acertos
seguidos; progressão de dificuldade.
