# As 3 ultimas especificacoes dela (automatico; a mais nova por ultimo)
# Na retomada: ler as 3, conectar com PROGRESSO.md e git, declarar e seguir.

## Surpresas

1. **O feedback de erro atual acende a célula da solução correta** (`:540-541`, `:547`), não só a errada. Não é apenas "denunciar a inconsistência" (o que as seções 14–15 já proíbem) — chega perto de entregar a resposta.
2. **A sessão só é gravada se o último puzzle for concluído CORRETAMENTE.** O `onComplete` está dentro do bloco de sucesso e a checagem `isTimeUp()` só roda depois de um acerto (`:553-580`). Tempo acabou no meio de um puzzle → **nada é enviado**. Buraco real de registro.
3. **Zero testes do exercício.** Todas as ocorrências de `deductive-grid` em `.test.ts` o usam como id de exemplo em testes de *outros* módulos (prescrição, layout, aposentadoria).
4. **`lib/tutorial/versions.ts:23` declara versão de tutorial, mas o exercício não está no registro `TUTORIAIS_POR_EXERCICIO`** (`page.tsx:56-76`). O framework T1 nunca roda; quem roda é o tutorial legado interno (`:396-462`), que só pede "clique 3 vezes numa célula".
5. **`lib/layout/palco.test.ts:46` trava `width="medio"`** para a Grade Dedutiva — o layout lado a lado da seção 12 vai exigir alterar esse teste existente.
6. `accuracy` é `1 - totalErrors/(puzzles*2)` (`:562`), e `totalErrors` conta *cliques em Confirmar que deram errado*, não erros lógicos. É esse número que alimenta a progressão e o score do domínio.

## O QUE NÃO FIZ

Não alterei nenhum arquivo de código, não commitei, não rodei `npm run build` nem `npm run test`, não executei nem propus migration, não consultei o banco de produção, não escrevi o plano de implementação (é documento separado, conforme a espec), e não medi o desempenho do solver proposto — ele ainda não existe; os números da §11 são do espaço de busca (exatos) e do limite superior da enumeração exaustiva (medido em `scratchpad/bench.js`, fora do repositório).</result>
<usage><subagent_tokens>120861</subagent_tokens><tool_uses>46</tool_uses><duration_ms>618427</duration_ms></usage>
</task-notification>

## 02/09/2026 21:09
então eu irei reformular exercicio por exercicio tirando restaurante e supermercado que não vejo erros, o resto vamos mexer, torre agora também finalizamos
