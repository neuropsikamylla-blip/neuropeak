# SPEC — Focus Agentes: carregamento de imagens e tutorial da cena parada

**Data:** 09/ago/2026 · **Origem:** validação visual dela · **Executor previsto:** Codex
**Repositório:** clone descartável. Não commitar — quem revisa, aplica e commita é o Claude.

Duas tarefas independentes. Podem ser feitas na ordem que preferir, mas **não misture as duas
num único bloco de mudança**: são áreas diferentes e a prova de cada uma é separada.

---

## Contexto mínimo que você precisa ler antes

- `components/exercises/attention/FocusAgents.tsx` — o exercício (571 linhas)
- `lib/focus/roster.ts` — os 144 personagens e suas tags
- `lib/focus/commands.ts` — geração e validação de rodada (`gerarRodada`, `matches`, `Criterio`)
- `lib/focus/progression.ts` — a escada (`STEPS`), começa com `vel: 0` (cena parada)
- `lib/tutorial/types.ts` — o contrato `TutorialDefinition`
- `lib/tutorial/definitions/conjunto-selecao.tsx` — exemplo do padrão a seguir
- `docs/T1-REGRAS-GLOBAIS.md` — as dez regras. **Leia. Elas mandam.**

---

## TAREFA A — o preload satura a rede

### O defeito

`FocusAgents.tsx:246-249` dispara `new Image()` para **as 144 imagens de uma vez** ao montar.
O navegador abre ~6 conexões por host, então 138 entram em fila e chegam em ondas. São **4,6 MB**
baixados para usar 6 a 10 personagens por rodada. Ela viu e relatou: "algumas ficam visíveis
enquanto outras ainda estão sendo carregadas".

Agravante: a limpeza do efeito faz `im.src = ""`, o que **aborta downloads em andamento**.

### O que fazer

Substituir o preload de tudo-de-uma-vez por carregamento com **concorrência limitada**:

1. Uma fila que mantém no máximo **6 downloads simultâneos**.
2. **Prioridade** para os personagens da rodada atual e da próxima; o resto do roster entra depois,
   em segundo plano, se e quando houver folga.
3. A limpeza **não pode abortar** o que já está em andamento. Cancelar um download pela metade
   desperdiça o que já baixou e faz recomeçar.
4. Idempotente: pedir a mesma imagem duas vezes não dispara dois downloads.

Não mude o formato dos arquivos nem mexa em `public/`. Conversão de PNG é assunto à parte.

### Prova de aceite (escreva o teste ANTES de mudar o componente)

- Teste unitário da fila, isolada do React: com 144 pedidos e limite 6, **nunca** há mais de 6 em
  voo simultâneo; todos completam; pedir a mesma imagem duas vezes resulta em um download só.
- Teste de que a prioridade é respeitada: pedidos prioritários entram na frente da fila de fundo.
- `npm test` verde e `npx tsc --noEmit` limpo.

---

## TAREFA B — tutorial do Focus Agentes (somente cena parada)

### Decisão dela, 09/ago/2026 — leia antes de desenhar

O tutorial cobre **apenas a mecânica da cena parada**: achar e clicar no personagem que satisfaz o
comando. **NÃO demonstre movimento nem queda.**

Motivo: a escada (`progression.ts:69`) começa com `vel: 0` nos cinco primeiros degraus. Na primeira
vez, o paciente encontra a cena parada. A queda só chega no nível 2+, e traz uma regra nova
(omissão por deixar o alvo sair). Isso está registrado em `docs/T1-INCOMPATIBILIDADES.md`, caso 2,
e **aguarda decisão dela**. Não implemente nada a respeito.

### Fluxo: 1 — Demonstração

Regra 11: `modo` não declarado, ou `"completa"`. **Não** use `"explicativo"`.

Justificativa, para o caso de você discordar: a pergunta da regra 11 é *a demonstração aumenta a
compreensão da mecânica?* Aqui aumenta — o comando é composto ("o azul com fone"), o paciente
precisa ver alguém varrer a cena e escolher **um** entre vários semelhantes. Ler "clique no
personagem que corresponde ao comando" não ensina a busca.

### O que construir

Uma `TutorialDefinition` para `exerciseId: "focus-agents"` com:

- **`Demonstration`** — cena parada com o menor conjunto válido. O `DemoPointer` varre e clica no
  alvo. Deve existir pelo menos um distrator que compartilhe um atributo com o alvo, para a
  demonstração mostrar a discriminação, não só o acerto óbvio.
- **`GuidedAttempt`** — mesma cena, o paciente escolhe. Acertou → `correct`; clicou noutro →
  `incorrect`.
- **`guidedInstruction`** — regra 4: verbo do gesto real. É **clique**. Proibido "toque" e
  "teclado" — existe teste que barra (`lib/tutorial/estimulo-continuo.test.ts:139`), e o
  vocabulário é único no projeto.
- **`retryHint`** — uma frase, imperativa, sem estratégia cognitiva.
- **`smallestValidUnit`** — regra: **derivar da mecânica**, nunca número solto. Use o `n` do
  primeiro degrau de `STEPS`, não o literal.
- Registrar em `versions.ts` e no mapa `TUTORIAIS_POR_EXERCICIO` de
  `app/(patient)/treino/[exercicio]/page.tsx`.

### Restrições que o projeto impõe

- **Regra 6:** o tutorial ensina, não mede. **Sem relógio, sem pontuação, sem omissão.** Rever o
  tutorial não pode gravar nada.
- **Regra 10:** conclusão registrada uma única vez.
- Reaproveite `gerarRodada`/`matches` de `lib/focus/commands.ts`. Não duplique lógica de comando.
- Sem emoções como atributo (§1 da reformulação): as imagens de expressão existem no disco mas
  não são usadas.

### Prova de aceite (escreva ANTES)

- A definição declara Fluxo 1 e **não** contém `modo: "explicativo"`.
- A demonstração usa cena **parada**: nenhum `requestAnimationFrame`, nenhuma velocidade, nenhuma
  queda no caminho do tutorial.
- Existe ao menos um distrator compartilhando atributo com o alvo.
- `guidedInstruction` usa "clique" e o arquivo não casa `/teclado|toque/i`.
- `smallestValidUnit` é derivado de `STEPS`, não um literal.
- A guiada devolve `incorrect` ao clicar em não-alvo e `correct` no alvo.
- `npm test` verde e `npx tsc --noEmit` limpo.

---

## Regras da casa

- Não commite. Não altere `PROGRESSO.md` nem outros documentos de estado.
- Comentário explica **por quê**, nunca o que a linha já diz.
- Encontrou contradição entre esta spec e o código? **Pare e relate.** Não escolha sozinho.
