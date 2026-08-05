# As 3 ultimas especificacoes dela (automatico; a mais nova por ultimo)
# Na retomada: ler as 3, conectar com PROGRESSO.md e git, declarar e seguir.

## O QUE MUDOU

Arquivo único: `/Users/kamyllahonorio/neuropeak/PROGRESSO.md` (+90 linhas, −1 linha).

1. **Nova seção no topo** (linha 6, imediatamente após o cabeçalho do arquivo, respeitando a ordem cronológica inversa): `## ✅ T1.0 — CÓDIGO REALINHADO AO BANCO E PUBLICADO (05/ago/2026) — f9b8584, v2.76.0`, com sete subseções `###` no estilo do arquivo:
   - **O que mudou no código — cinco pontos** (schema com enum `TutorialSource` e os três campos nuláveis; rota restaurada byte a byte de `docs/t1-pausada/`; `schema-banco-alinhado.test.ts` invertido mantendo a igualdade exata de `CAMPOS_NO_BANCO` com 12 campos; `contracts.test.ts` invertido; `patients/[id]/route.ts` não tocada por causa do include booleano);
   - **Gates — todos verdes** (517/517 em 41 arquivos, demais exit 0);
   - **Provas de alinhamento schema/banco** (DMMF, o `findFirst` filtrando pelo enum contra produção como prova decisiva, invariantes 16/66/0/82/33, suíte offline);
   - **Deploy e smoke test não destrutivo** (appVersion 2.76.0, buildId, e os seis resultados de status HTTP);
   - **⚠️ O QUE NÃO FOI PROVADO** — os sete itens numerados, com destaque explícito de que os três últimos escrevem em produção e a decisão sobre como prová-los é dela;
   - **🧠 Lição de método** — as duas perdas de tempo (`NEXTAUTH_URL` local e `version` com sufixo de buildId), fechada com a REGRA em negrito sobre usar `appVersion` e a URL `https://neuropeak-5jyl.vercel.app`;
   - **⏭️ PRÓXIMO PASSO** — conversão dos tutoriais dos 34 exercícios em lotes, só após validação dela.
2. **Título da seção antiga ajustado** (agora linha 95): `— CÓDIGO AINDA NÃO` → `— CÓDIGO ALINHADO NA SEÇÃO ACIMA`.

## COMO PROVEI

- `grep -n "^## " PROGRESSO.md | head -4` (exit 0): confirma a nova seção na linha 6, a antiga na 95 com o título ajustado, e a ordem cronológica preservada (incidente 05/ago na 161, fase T1 de 04/ago na 264).
- `git diff --stat PROGRESSO.md` (exit 0): `1 file changed, 90 insertions(+), 1 deletion(-)` — nenhum outro arquivo alterado.
- `git diff -U0 PROGRESSO.md | grep "^-"`: a **única** linha removida é o título antigo. Prova de que o corpo da seção antiga ficou intacto.
- `git status --porcelain`: apenas ` M PROGRESSO.md`.

## O QUE NÃO FIZ

- Não commitei nem dei push — o working tree segue com `PROGRESSO.md` modificado, pronto para o commit do VP.
- Não toquei em nenhum outro arquivo (nem código, nem docs, nem configuração).
- Não executei nada no banco, nem gates, nem `curl` contra produção — todos os números registrados são os medidos pelo VP e foram transcritos sem alteração.
- Não alterei o corpo da seção T1.0 antiga, apenas seu título.
- Não verifiquei de forma independente que o commit `f9b8584` ou a versão 2.76.0 correspondem ao estado real do repositório/deploy: isso está fora do despacho e permanece como fato reportado pelo VP.</result>
<usage><subagent_tokens>32361</subagent_tokens><tool_uses>6</tool_uses><duration_ms>72185</duration_ms></usage>
</task-notification>
