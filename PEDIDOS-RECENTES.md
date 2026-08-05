# As 3 ultimas especificacoes dela (automatico; a mais nova por ultimo)
# Na retomada: ler as 3, conectar com PROGRESSO.md e git, declarar e seguir.

## COMO PROVEI

- Integridade do SQL executável: `diff &lt;(git show HEAD:docs/operacao/T1.0-backfill-executado-2026-08-05.sql) &lt;(tail -n +63 docs/operacao/T1.0-backfill-executado-2026-08-05.sql)` → **exit 0**, byte a byte idêntico da linha 63 em diante.
- `git diff --numstat` → `66 0 PROGRESSO.md` e `62 0 docs/operacao/T1.0-backfill-executado-2026-08-05.sql` — **zero deleções nos dois arquivos**.
- `git status --short` → apenas esses dois arquivos modificados. (Os `PEDIDOS-*.md` que apareciam sujos no início já haviam sido recolhidos pelo checkpoint automático `3bc14ba`; o arquivo SQL, que estava `??` no snapshot inicial, já está versionado em HEAD.)

## O QUE NÃO FIZ

- **Não commitei e não dei push** — commit é do VP.
- **Não executei nada no banco**, nem consulta de leitura; todos os números do relatório vieram do despacho.
- **Não alterei o SQL em si**, nem espaçamento — só acrescentei comentários no topo.
- **Não toquei** em `prisma/schema.prisma`, `lib/schema-banco-alinhado.test.ts`, `docs/t1-pausada/` nem em qualquer outro arquivo.
- **Não rodei** `npm run test`, `tsc` ou `build`: a mudança é exclusivamente de documentação e não afeta código; portanto o status desses gates permanece o da última medição registrada, não uma verificação minha desta sessão.
- Não editei o parágrafo antigo "TUDO PARADO, aguardando evidência de backup" (linhas 178-188) — é registro histórico do estado de 04/ago e a seção nova o supera explicitamente. Se o VP preferir uma nota de superação ali, é um ajuste de uma linha.</result>
<usage><subagent_tokens>46806</subagent_tokens><tool_uses>13</tool_uses><duration_ms>154064</duration_ms></usage>
</task-notification>

## 05/08/2026 17:38
Autorizo iniciar a próxima etapa da T1.0: alinhar o código ao banco já preparado.

O banco de produção já possui:

- enum TutorialSource com BACKFILL e PATIENT;
- tutorialCompletedAt;
- tutorialVersion;
- tutorialSource;
- backfill validado em 16 registros.

Agora o objetivo é fazer o código refletir exatamente essa estrutura, sem alterar novamente o banco.

Escopo autorizado:

1. Recolocar no schema.prisma:

enum TutorialSource {
  BACKFILL
  PATIENT
}

No modelo ExerciseConfig:

tutorialCompletedAt DateTime?
tutorialVersion     Int?
tutorialSource      TutorialSource?

2. Restaurar app/api/exercise-tutorial/route.ts a partir da versão preservada em docs/t1-pausada/.

3. Confirmar que a rota:

- grava tutorialCompletedAt;
- grava tutorialVersion;
- grava tutorialSource = PATIENT;
- sobrescreve BACKFILL por PATIENT quando o paciente conclui o tutorial;
- não altera currentDifficulty;
- não altera lastAttemptAt;
- não altera totalAttempts;
- não cria Session;
- não altera progressão;
- não altera achievements;
- não altera alertas;
- não altera métricas clínicas.

4. Atualizar schema-banco-alinhado.test.ts.

O teste não deve mais proibir os campos.

Agora ele deve exigir que o schema contenha exatamente:

- tutorialCompletedAt;
- tutorialVersion;
- tutorialSource;
- enum TutorialSource com BACKFILL e PATIENT.

Também deve continuar protegendo contra novos campos de ExerciseConfig adicionados ao schema sem implantação prévia no banco.

5. Confirmar que o endpoint GET do paciente continua retornando os novos campos por meio do include já existente, sem alterar desnecessariamente a rota.

6. Executar:

- prisma validate;
- prisma generate;
- TypeScript;
- suíte completa;
- build.

7. Testes obrigatórios:

- Prisma Client reconhece os três campos e o enum;
- GET /api/patients/[id]?config=true retorna 200;
- plano do terapeuta continua carregando;
- nível real continua carregando;
- bloqueio diário continua funcionando;
- POST /api/sessions continua atualizando ExerciseConfig;
- rota do tutorial grava PATIENT;
- registro BACKFILL vira PATIENT após conclusão real;
- a rota do tutorial não toca campos clínicos;
- os 16 registros BACKFILL continuam intactos;
- os 66 registros com totalAttempts = 0 continuam sem tutorialCompletedAt;
- nenhum dado do banco é alterado durante os testes locais.

8. Depois dos gates:

- fazer bump de versão;
- publicar na Vercel;
- confirmar appVersion, buildId, health e commit;
- executar smoke test autenticado da leitura do plano e da rota de tutorial;
- registrar no PROGRESSO.md.

Não executar:

- db push;
- SQL;
- novo backfill;
- conversão de exercícios;
- alteração de mecânica;
- publicação parcial.

Se surgir qualquer divergência entre schema e banco, pare antes do deploy.

Ao final, apresente as provas e pare para minha validação.

Depois dessa etapa, iniciaremos a conversão dos tutoriais dos 34 exercícios em lotes.
