# As 3 ultimas especificacoes dela (automatico; a mais nova por ultimo)
# Na retomada: ler as 3, conectar com PROGRESSO.md e git, declarar e seguir.

## 3. Equivalência medida: `montarCenaEspalhada` × implementação antiga

**0 divergências, tolerância zero, em 5 configurações.**

Método (script temporário em `/private/tmp/claude-501/-Users-kamyllahonorio-neuropeak/96bb9a4b-9318-45ec-b426-399a26293ad5/scratchpad/equiv.js`, fora do repositório): o bloco antigo **não foi transcrito à mão** — é recortado do texto de `git show 106c7db:components/exercises/attention/FocusAgents.tsx` e avaliado com `new Function`, recebendo os helpers `rnd`/`shuffle` verbatim das linhas 77-78 do arquivo antigo. Antes de comparar, o script aborta se `CHAR_W`/`CHAR_H`/`MARGIN`/`VEL_LEVE` divergirem (são iguais). Ambas as implementações recebem a **mesma** sequência determinística (xorshift32; `Math.random` é substituído no antigo, injetado por parâmetro no novo). Comparei `id, isTarget, bx, by, x, y, vx, vy, ph` **e o `uid`** (replicando o `.map` do componente).

| Configuração | Resultado |
|---|---|
| 7 personagens / 900×600 / vel 0 | OK — 70 campos idênticos |
| 9 personagens / 1200×700 / vel 2 | OK — 90 campos idênticos |
| 11 personagens / 700×900 / vel 3 | OK — 110 campos idênticos |
| 11 personagens / 480×320 (arena mínima) / vel 1 | OK — 110 campos idênticos |
| 7 personagens / 1600×400 (faixa larga) / vel 3 | OK — 70 campos idênticos |

450 campos comparados, `TOTAL DE DIVERGENCIAS: 0`, exit 0. Incluí **controle negativo**: duas sementes diferentes divergem, como esperado — a comparação não é vacuamente verdadeira.

Uma amostra, para o registro (config 1, personagem 0) — antigo e novo bit a bit iguais:
`bx=757.0384411849082, by=215.63258178904653, vx=-0.0645244091502285, vy=-0.3341986006690152, ph=6.207932321344954`.

## Ponto que exige sua decisão (não corrigi nada)

**O trabalho já está commitado** — não por mim. `git log` mostra `bdfac1e` e `51f8fff` ("checkpoint automatico (salvamento de seguranca)") sobre `122bd03`, e a árvore está limpa. Foi o hook de checkpoint automático. Registro porque o despacho dizia "não commite" e o estado do repositório pode surpreender você: as mudanças não estão mais pendentes.

Uma nota de escopo, não defeito: a equivalência que medi cobre `montarCenaEspalhada`. As outras funções extraídas para `lib/focus/scene.ts` (`separarPersonagens`, `passoDeriva`, `bobOffset`) não foram comparadas contra a versão antiga — não estavam no despacho. Se quiser essa cobertura, é um passo curto a mais.

---

**O QUE MUDOU**
Nada no repositório. Nenhum arquivo do projeto foi criado, editado ou removido; `git status --porcelain` saiu vazio ao final. O rename de `span-numerico.tsx` foi temporário e desfeito. Tudo que escrevi vive no scratchpad: `equiv.js`, `old-FocusAgents.tsx`, `compiled/scene.js`, `test-out.txt`, `lint-out.txt`, `inj.txt`.

**COMO PROVEI**
`npm run test` exit 0 (685/685, 49 arquivos); `npx tsc --noEmit` exit 0 sem saída; `npm run lint` exit 0 (10 warnings, 0 errors), com os 2 warnings do FocusAgents provados pré-existentes por execução do eslint sobre a versão de `106c7db`. Consertos (a) e (b) verificados por leitura das linhas 83 e 348-349, com varredura completa de `uid:`. Conserto (c) provado por injeção: exit 0 limpo → exit 1 com o arquivo renomeado (erro literal transcrito acima) → exit 0 e árvore limpa após restaurar. Equivalência provada por script comparando a função extraída com o bloco recortado do git, mesma sequência determinística, tolerância 0, 5 configurações, 450 campos, 0 divergências, com controle negativo.

**O QUE NÃO FIZ**
Não commitei nem dei push (os commits presentes são do hook automático, anteriores à minha entrada). Não corrigi nada — a única edição foi no meu script de scratchpad, que faltava injetar `CHAR_H`. Não toquei em PROGRESSO.md. Não deixei o script no repositório. Não medi equivalência de `separarPersonagens`, `passoDeriva` nem `bobOffset`, nem validei visualmente o tutorial em navegador — está fora do que foi despachado, e portanto o comportamento visual em tela permanece DESCONHECIDO por evidência direta (só por equivalência numérica da geração de cena).</result>
<usage><subagent_tokens>54378</subagent_tokens><tool_uses>30</tool_uses><duration_ms>348795</duration_ms></usage>
</task-notification>

## 11/08/2026 15:55
<task-notification>
<task-id>bfrug2kw5</task-id>
<tool-use-id>toolu_01WsHQ1NR8ZezbFKQe8V88Vk</tool-use-id>
<output-file>/private/tmp/claude-501/-Users-kamyllahonorio-neuropeak/96bb9a4b-9318-45ec-b426-399a26293ad5/tasks/bfrug2kw5.output</output-file>
<status>completed</status>
<summary>Background command "Dispara o Codex na fatia 3" completed (exit code 0)</summary>
</task-notification>
