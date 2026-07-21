# Compra Multifuncional — Missões Matemáticas Progressivas (spec da Kamylla, 20/jul/2026)

> Transforma a Compra Multifuncional num treino de OPERAÇÕES em situação de compra,
> mantendo a mecânica funcional (escolher itens / calcular) mas SEM resolver a conta
> pelo paciente. Unifica a reforma cognitiva pendente ("não resolver pela pessoa;
> feedback só após confirmar") com o treino progressivo de matemática.

## Princípio central

Durante a tentativa, o jogo NÃO faz as contas pelo jogador. O app **não mostra**:
soma dos preços, soma dos pesos, dinheiro restante, peso restante, resultado da
multiplicação/divisão, resposta correta, combinação ideal, nem se a compra já está
correta/errada. O jogador analisa e calcula sozinho. A verificação e a explicação
acontecem **só depois de confirmar**.

O painel PODE mostrar o que não resolve a conta: quantidade de itens selecionados,
nomes/categorias já selecionadas, as regras da missão, botões de confirmar/retirar.

## Estrutura de uma missão

História contínua (uma personagem, uma situação), com etapas que continuam a mesma
história e aumentam a dificuldade UM conceito por vez. Escada pedagógica:
1. soma (2 preços) → 2. soma (3 preços) → 3. subtração/troco → 4. orçamento (soma +
comparação, seleção de itens) → 5. multiplicação/tabuada (N unidades × preço) →
6. divisão (repartir igualmente) → 7. soma de pesos → 8. subtração de peso disponível →
9. escolha por peso (seleção) → 10. preço E peso simultâneos (seleção) → 11. missão
multifuncional completa (todas as restrições).

Cada etapa tem: história curta, objetivo matemático, itens mostrados, instrução exata,
regras visíveis, informações ocultas, validação interna, solução(ões) possível(is),
feedback de acerto, e dicas em 3 níveis.

## Dois modos de resposta

- **Digitar resultado** (numeric): o jogador informa um número (total, troco, quantos
  cabem, peso). Etapas de conta pura.
- **Selecionar itens** (select): o jogador escolhe itens respeitando as regras (quantidade,
  categoria, orçamento, peso). O painel mostra só status não-calculável.

## Dicas progressivas (após confirmar)

- **1º erro**: informar QUAL regra não foi cumprida (sem revelar a resposta).
- **2º erro**: dizer QUAL operação fazer.
- **3º erro**: mostrar a conta feita com os itens/números escolhidos.
- Após várias tentativas: apresentar uma solução possível (não a única).

## Regras obrigatórias

1. Usar apenas itens que existem no programa (catálogo `data/compra-itens.ts`).
2. História coerente: personagem + situação + objetivo + etapas contínuas.
3. Aumentar só uma dificuldade por vez (ao introduzir peso, aliviar orçamento; etc.).
4. Não revelar cálculos durante a tentativa.
5. Garantir que cada etapa tem ao menos uma solução (validar por força bruta no select).
6. Evitar ambiguidade: quantos itens, categorias obrigatórias, orçamento, limite de peso,
   se é mín/máx/exato, se seleciona itens ou informa resultado, quando termina.
7. Explicar só depois de confirmar.

## Temas (gerados a partir dos itens reais)

Piquenique, praia, frio/neve, alimentos (refeição), frutas/legumes (cestas), objetos
(organizar mochila/mala/caixa). Cada tema tem personagem, história e pool de itens.

## Cronômetro

Sem cronômetro nas primeiras etapas. Só em modo desafio / fases avançadas. Se o tempo
acabar, confirma a seleção atual e explica o que faltou.

## Níveis de dificuldade

- Inicial: 2–3 itens, inteiros, preços pequenos, uma operação, sem cronômetro, feedback
  detalhado, 3 tentativas com dicas.
- Intermediário: 3–6 itens, duas operações, orçamento, quantidade, categorias, mult,
  divisão exata, peso inteiro.
- Avançado: preço e peso juntos, várias categorias, mín/máx/exato, decimais simples,
  múltiplas soluções, planejamento.
- Especialista: múltiplas restrições, troco, melhor custo, cronômetro opcional. Mesmo
  aqui, nunca revelar totais antes de confirmar.

## Configuração do terapeuta

Escolhe o TEMA (ou variado) e o FOCO (missão completa que treina tudo, OU uma operação
específica: soma / subtração / multiplicação / divisão). Dificuldade sobe pelo desempenho.
