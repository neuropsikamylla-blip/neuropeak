# As 3 ultimas especificacoes dela (automatico; a mais nova por ultimo)
# Na retomada: ler as 3, conectar com PROGRESSO.md e git, declarar e seguir.

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

## 05/08/2026 21:57
A validação mostrou que a infraestrutura da T1 está funcionando, mas nenhum exercício ainda foi convertido para o novo framework.
O Span Numérico Auditivo Direto e o Span Numérico Auditivo Inverso continuam utilizando apenas a antiga tela de instruções. Isso não será considerado o tutorial da T1.
A partir deste momento vamos mudar a estratégia.
Não vamos converter os 34 exercícios ainda.
Primeiro vamos construir e validar o padrão definitivo do framework utilizando apenas um exercício.
O Span Numérico Auditivo Direto será o exercício de referência da T1.
Quero que ele represente exatamente como deverá funcionar o tutorial de todos os demais exercícios.
O fluxo deverá ser:
Preparação
informações essenciais para iniciar;
apenas explicar a interação;
não ensinar estratégias cognitivas.
↓
Tutorial
demonstração utilizando exatamente a mecânica real;
tentativa guiada;
feedback;
possibilidade de repetir apenas a tentativa guiada em caso de erro;
encerramento do tutorial.
↓
Treino
início da primeira tentativa clínica;
sem qualquer influência do tutorial em Session, currentDifficulty, totalAttempts, lastAttemptAt, pontuação ou qualquer métrica clínica.
Além disso:
a preparação deixa de ser chamada de tutorial;
preparação e tutorial passam a ser duas etapas diferentes;
toda a arquitetura criada para esse exercício deverá ser reutilizada pelos demais.
Ainda não converter o Span Inverso nem qualquer outro exercício.
Quero primeiro validar visualmente e funcionalmente o Span Direto.
Depois de aprovado, ele passa a ser o padrão oficial da T1 e então converteremos os exercícios por grupos de interação (áudio, clique, arrastar, planejamento etc.), reutilizando o mesmo framework.
