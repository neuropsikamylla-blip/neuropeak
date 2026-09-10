# As 3 ultimas especificacoes dela (automatico; a mais nova por ultimo)
# Na retomada: ler as 3, conectar com PROGRESSO.md e git, declarar e seguir.

## O QUE MUDOU

**1. `/Users/kamyllahonorio/codex-lab/registro-roteamento.md`** — quatro linhas novas (#22 a #25) ao final da tabela, no formato das linhas #18-21 (modelo sem crases, data `DD/MM/AAAA`). Nenhuma linha antiga tocada: o diff é `25a26,29`, adição pura. Backup: `registro-roteamento.md.bak-20260910` (20.728 bytes, idêntico ao original).

**2. `/Users/kamyllahonorio/neuropeak/PROGRESSO.md`** — duas edições, `64 insertions(+), 11 deletions(-)`:
- seção nova `### ✅ 09/set — quatro entregas, tudo publicado (v3.20.0)` inserida imediatamente ANTES de `### ✅ 08/set — os seis fechamentos dela`, com as 4 entregas, o portão bloqueante da etapa 4 (três pilotos), os três efeitos visíveis em produção e as quatro perguntas clínicas em aberto;
- `### Estado da plataforma nesta parada` reescrito com os números que eu medi; a medição de 08/set foi preservada na linha de arquivo (`🗄️ Medições anteriores`), não apagada.
- Backup: `PROGRESSO.md.bak-20260910` (227.743 bytes). Os `.bak-*` são ignorados pelo git (`.gitignore:62`), então não sujam o status.

## COMO PROVEI

Medições próprias, exit capturado sem pipe:

| comando | exit | resultado |
|---|---|---|
| `npm run test` | `TEST_EXIT=0` | `Test Files 79 passed (79)` · `Tests 1041 passed (1041)` · vitest 4.1.7, 15,73 s |
| `npx tsc --noEmit` | `TSC_EXIT=0` | saída vazia |
| `grep '"version"' package.json` | 0 | `"version": "3.20.0",` |
| `git status -sb` (início) | 0 | `## main...origin/main` / ` M PEDIDOS-LOG.md` |
| `git log --oneline -12` | 0 | `8737d72` v3.20.0 · `ce120bb` v3.19.0 · `1849783` proposta · `2fac46b` v3.18.0 |
| `git show &lt;c&gt;:package.json` | 0 | 2fac46b=3.18.0 · ce120bb=3.19.0 · 8737d72=3.20.0 · 1849783=3.18.0 (só doc, 113 linhas) |
| `wc -l lib/grade/*.ts` | 0 | 5.660 linhas, 25 arquivos |
| `diff bak atual` (registro) | 1 | somente `25a26,29` |
| `awk` contagem de colunas | 0 | linhas 22-25 com `pipes=8`, igual à #21 |

Confirmei no código os fatos que escrevi sobre a dosagem, em vez de copiar do enunciado: `lib/exercise-dosage.ts` tem `DOSAGEM_PADRAO = dosagemProblemaEstruturado(480)` → 480/600; `dosagemPorTentativas` soma +60 e `dosagemProblemaEstruturado` soma +120 (a tolerância como regra); `semaforo: dosagemPorTentativas(300)` → 300/360; `stroopDosage(difficulty)` devolve o par; e há comentário explícito de 09/set sobre Torre e Estacionamento saírem dos 11 min. `useBlocoDeTreino` aparece em `Semaforo.tsx`, `CuboCorsi.tsx`, `TorreHanoi.tsx` e `lib/grade/sessao.ts` — os três pilotos mais a Grade.

**Fato que mudou durante minha execução, e que você precisa saber:** apareceu o commit `5481e05` ("Spec dos cinco indicadores da Grade: medir sem decidir", `PEDIDOS-LOG.md` + `docs/.../spec-grade-indicadores-20260910.md`) — **não fui eu**, não rodei `git commit`; é do seu gancho/sessão. Por isso o status final é `## main...origin/main [ahead 1]` com ` M PROGRESSO.md`. Reescrevi a frase de status no PROGRESSO.md para refletir isso em vez de deixar uma afirmação que ficaria falsa.

## O QUE NÃO FIZ

- **Não commitei e não dei push.** Ficam pendentes de commit do VP: `PROGRESSO.md` (no repo) e `registro-roteamento.md` (fora do repo, em `~/codex-lab`, sem versionamento — se ele tiver git próprio, é commit separado).
- **Não toquei em código** — nenhum `.ts`/`.tsx`, nenhum `package.json`.
- **Não rodei `npm run build`** (proibido no despacho). Registrei no PROGRESSO.md que o `build exit 0` é de 09/set, herdado do seu relato — **não é medição minha**.
- **Não rodei `npm run lint`** (não estava no despacho); os "lint 0 errors" nas linhas #22-24 são citação do seu texto, não medição minha.
- **Não reescrevi nenhuma linha antiga** do registro nem do PROGRESSO.md fora do parágrafo `Estado da plataforma nesta parada`, que o despacho mandou atualizar.
- **Não verifiquei com os olhos** nada em produção: os três efeitos visíveis ao paciente entraram no texto como relato seu, não como observação minha — continuam DESCONHECIDOS por evidência própria.</result>
<usage><subagent_tokens>60339</subagent_tokens><tool_uses>23</tool_uses><duration_ms>236310</duration_ms></usage>
</task-notification>
