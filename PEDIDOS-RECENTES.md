# As 3 ultimas especificacoes dela (automatico; a mais nova por ultimo)
# Na retomada: ler as 3, conectar com PROGRESSO.md e git, declarar e seguir.

## COMO PROVEI

- Enumeração: `find components/exercises -name "*.tsx" | wc -l` → **55**; `ls -1 lib/tutorial/definitions/*.tsx` → **10**. **65 arquivos varridos** (mais os `.ts` de `executive/caminhos-meta/` e grep de strings de aviso em `lib/**` e `data/**`, sem ocorrência). Exit 0 em todos os comandos.
- Grep pelas pistas do despacho: **42 arquivos casaram**, **7 têm achado real** após leitura. O critério decisivo foi rastrear quem chama a função que pinta a tela (`grep -n "finishMaze("`, `grep -n "endRound()"`, etc.): se a única origem é `setTimeout`/`setInterval` sem gesto, é aviso passivo.
- Commit modelo lido linha a linha (`git show dee21e1`) e memória `principio-sem-dica-apos-instrucao.md` lida; conferido `git show d4596fa --stat` para saber que Supermercado e Restaurante ficaram de fora por decisão dela.
- Prova de não-alteração: `git status --short` → `?? docs/auditoria-aviso-omissao/` e nada mais, exit 0. Não rodei `tsc` nem testes porque nenhuma linha de código foi tocada — não haveria o que provar.

**Contagem: 5 AVISO PASSIVO, 2 AMBÍGUO, 0 reclassificados como feedback de ação entre os achados.**

Os 3 casos mais claros:

1. **Focus Agentes** `components/exercises/attention/FocusAgents.tsx:323` — faixa vermelha "✗ Acabou o tempo!" **e** o alvo não tocado é ampliado enquanto os demais escurecem. Carimba a omissão e entrega a resposta. O irmão dele na linha 240 diz "✗ Passou! Toque mais rápido.", que ainda dá ordem de estratégia. Em ambos, `omissions` continua no metadata: remover o aviso não perde medida.
2. **Labirinto** `components/exercises/executive/Labirinto.tsx:1013` — "⏰ Tempo!" em vermelho sobre a arena. `finishMaze(false)` tem uma única origem no arquivo, a linha 793 (`elapsed &gt;= timeLimit`); nenhuma ação do paciente leva a essa tela. `solved:false` sobrevive.
3. **Compra Multifuncional** `components/exercises/executive/CompraMultifuncional.tsx:266` — quando o cronômetro zera, o app confirma "o que houver" e mostra "💡 Veja a conta" com a conta resolvida. Se ele não digitou nada, o app corrige uma resposta que ele não deu.

Onde fiquei em dúvida:

- **Semáforo** (`processing/Semaforo.tsx:206`) — classifiquei AMBÍGUO por ser tarefa de TR, mas achei coisa pior que estética: o timeout chama `handleResponse(false, ...)` e `pressedAdvance:false` significa literalmente "apertou PARAR". Com sinal vermelho, **a omissão é contada como acerto e a tela mostra "✓ Certo!"**. Isso infla a acurácia e move a progressão — precisa de decisão dela independentemente do aviso.
- **Tempo de Reação** (`processing/TempoReacao.tsx:233`) — AMBÍGUO. O flash vermelho da tela inteira é o **mesmo** do toque errado (linha 227): hoje o paciente não distingue "errei" de "deixei passar", e o metadata também não distingue.
- **Busca Rápida** (`processing/CorridaContraOTempo.tsx:398`) — classifiquei AVISO PASSIVO, mas o mesmo painel também aparece quando ele coleta tudo antes do tempo, e aí é feedback de ação. Declarei o meio-termo no documento.
- **Zona cinzenta que deixei sem decidir**: a linha "Itens omitidos: N" na tela de resultado final da Busca Rápida (`:420`). É a tela de resultados, não a execução — se a regra dela alcançar a tela final, é o único ponto do app que a violaria.

## O QUE NÃO FIZ

- Não alterei nenhum componente de exercício, nem "de passagem".
- Não commitei nada.
- Não rodei `npm run build` (dev server dela na porta 3000), nem `tsc`/testes — sem alteração de código, não havia o que provar.
- Não decidi a fronteira dos casos AMBÍGUOS (Tempo de Reação e Semáforo): registrei e devolvi a decisão.
- Não investiguei se o bug de acurácia do Semáforo aparece nos relatórios do terapeuta — está fora do despacho.</result>
<usage><subagent_tokens>115868</subagent_tokens><tool_uses>76</tool_uses><duration_ms>516601</duration_ms></usage>
</task-notification>

## 31/08/2026 16:41
<task-notification>
<task-id>bzk1tefa4</task-id>
<tool-use-id>toolu_012KDxKfpneuNVDeG2sat5jG</tool-use-id>
<output-file>/private/tmp/claude-501/-Users-kamyllahonorio-neuropeak/9e4c2936-1fb4-4a9c-a53a-3ad1aad1cf37/tasks/bzk1tefa4.output</output-file>
<status>completed</status>
<summary>Background command "Rodar o Codex" completed (exit code 0)</summary>
</task-notification>
