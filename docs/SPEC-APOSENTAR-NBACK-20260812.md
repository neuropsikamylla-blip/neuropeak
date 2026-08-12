# SPEC — Aposentar o N-Back (remoção completa do código)

**Data:** 12/ago/2026 · **Executor previsto:** Codex · **Repositório:** clone descartável
**Não commitar.** Quem revisa, aplica, prova e commita é o Claude.

## A decisão

Ela avaliou o N-Back treinando e decidiu **retirá-lo por inteiro**: *"o exercício em si não está
legal… pode retirar ele totalmente"*. Escolheu a opção **aposentar e apagar o código**.

**Os dados já foram tratados** (fora do seu alcance, e não é seu problema): o N-Back saiu dos 8
planos de treino que o continham, e não havia **nenhuma** sessão registrada — nenhum histórico
clínico se perdeu.

## ⚠️ O QUE NÃO PODE SER TOCADO

1. **`components/exercises/attention/DualTask.tsx` cita "nback" e NÃO É O N-BACK.** O Dual Task tem
   uma sub-tarefa própria do tipo n-back, que é mecânica dele. **Ela disse explicitamente:** *"a
   dual task… você não vai fazer nada"*. Se você tocar nesse arquivo, a entrega é rejeitada inteira.
2. Nenhum outro exercício. Nenhuma mecânica clínica. Nenhuma migração de dados.
3. `prisma/schema.prisma` — o `exerciseId` é texto livre; não há enum a alterar.

## O lab não tem `node_modules`

Você **não conseguirá** rodar `npm test`, `tsc` nem `build`. Escreva os testes assim mesmo e
**declare o que não pôde verificar** — não afirme que rodou nada.

---

## O que remover

Os 16 arquivos que citam `nback`/`NBack` (menos o `DualTask.tsx`). Percorra-os e trate cada caso:

- **`components/exercises/memory/NBack.tsx`** — apagar o arquivo.
- **`lib/tutorial/definitions/estimulo-continuo.tsx`** — a definição `nbackTutorial` e o painel que
  só ela usa. ⚠️ **Não remova o que for compartilhado** com os outros exercícios do arquivo
  (`semaforo`, `tempo-reacao`, `certo-ou-errado`, `dual-task`, que continuam).
- **`app/(patient)/treino/[exercicio]/page.tsx`** — o `import`, o `case` do switch, a entrada do
  mapa de tutoriais, as instruções de preparação e qualquer lista que o cite.
- **`lib/domain-taxonomy.ts`**, **`types/index.ts`**, **`lib/exercise-meta.ts`**,
  **`lib/exercise-icons.ts`**, **`lib/exercise-science.ts`**, **`lib/exercise-functional.ts`**,
  **`lib/tutorial/versions.ts`** — remover a entrada do N-Back.
- **Testes** que o citam (`lib/prescription/*.test.ts`, `lib/tutorial/*.test.ts`) — ajustar ao novo
  conjunto.

## ⚠️ O ponto mais delicado: os 34 viram 33

O projeto trata a lista canônica de exercícios como a **Constituição** da arquitetura clínica, e há
testes que travam o número **34** explicitamente — por exemplo, `lib/tutorial/versions.test.ts`
("cobre exatamente os 34 exercícios canônicos") e provavelmente os de `lib/prescription/`.

Atualize esses testes para **33**, e **em cada ponto onde o número aparece**, deixe um comentário de
uma linha dizendo que o N-Back foi aposentado em 12/ago/2026 por decisão dela. Sem isso, o próximo
que ler vai achar que alguém quebrou a contagem.

⛔ **Não relaxe asserção para fazer passar.** Se um teste protege uma regra, mantenha a regra e
ajuste apenas o conjunto. Um teste que verificava "todos os exercícios têm X" continua verificando
isso — para 33.

## Prova de aceite (escreva ANTES)

1. **Não sobrou referência:** uma busca por `nback`/`NBack` em `app/`, `lib/`, `components/` e
   `types/` retorna **apenas** as ocorrências dentro de `DualTask.tsx`. Escreva isso como teste, com
   a exceção do Dual Task explícita e comentada.
2. **O Dual Task está intacto:** o arquivo dele não aparece no seu diff. Se aparecer, você errou.
3. **A contagem canônica é 33**, e os testes que a verificam continuam existindo — não foram
   apagados para evitar o trabalho de ajustá-los.
4. Nenhum outro exercício sumiu: a lista canônica nova é a antiga **menos** `nback`, e nada mais.
5. O arquivo `components/exercises/memory/NBack.tsx` não existe mais.

## Regras da casa

- **Não commite.** Não altere `PROGRESSO.md`, `CLAUDE.md` nem documento de estado.
- Encontrou contradição entre esta spec e o código? **Pare e relate.**
- Ao terminar, relate: o que fez, quais arquivos apagou, e **o que não conseguiu verificar**. Um
  relatório vazio conta como entrega incompleta.
