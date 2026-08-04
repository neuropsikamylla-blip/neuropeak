# As 3 ultimas especificacoes dela (automatico; a mais nova por ultimo)
# Na retomada: ler as 3, conectar com PROGRESSO.md e git, declarar e seguir.

## COMO PROVEI

- `git log --oneline -3 &amp;&amp; git show e98d069 --stat &amp;&amp; node -p "require('./package.json').version"` → exit 0. Confirma o commit `e98d069` ("feat(prescricao): descrição curta na linha principal + perfil e protocolo nos detalhes (v2.68.0)"), a spec em `8eefc2d`, os **7 arquivos** tocados (os 6 de código/teste + `package.json`) e `package.json` em **2.68.0**. Os fatos do despacho batem com o repositório.
- `git status --porcelain &amp;&amp; git diff --stat` → exit 0. Saída: `M PROGRESSO.md` e `PROGRESSO.md | 59 +++++`, 1 arquivo, 59 inserções, 0 remoções. Nenhum outro arquivo alterado; nada staged, nada commitado.
- Posicionamento verificado pelo próprio diff: bloco inserido antes do cabeçalho da Fase 2, que segue intacto logo abaixo.

## O QUE NÃO FIZ

- Não commitei e não dei push (é do VP).
- Não alterei nenhum outro arquivo — nem código, nem `ESTADO-DO-PROJETO.md`, nem docs, nem memória.
- Não reexecutei `tsc`, `vitest`, `build` nem as chamadas a `/api/version` e `/api/health`: as provas registradas são as que o despacho trouxe do VP, não evidência colhida por mim nesta tarefa. Se o VP quiser reconfirmação independente dessas quatro provas, é um despacho novo.
- Não iniciei nem preparei nada da Fase 3.</result>
<usage><subagent_tokens>26668</subagent_tokens><tool_uses>4</tool_uses><duration_ms>63993</duration_ms></usage>
</task-notification>

## 03/08/2026 23:52
Encontramos uma inconsistência arquitetônica. Os parâmetros ajustáveis (tentativas, repetições, nível inicial etc.) alteram a dose clínica do exercício, mas o painel continua exibindo a duração, carga basal e fadiga do protocolo original. Isso quebra a consistência da prescrição.
Antes de continuar a implementação, precisamos definir uma regra única:
Todo parâmetro ajustável que modifica a dose clínica deve atualizar automaticamente duração estimada, carga basal e fadiga da sessão; ou
Esses parâmetros deixam de ser livres e passam a ser derivados exclusivamente do protocolo (Breve, Padrão ou Estendido).
Não implemente ainda. Faça primeiro uma análise arquitetônica indicando quais parâmetros realmente modificam a dose clínica de cada exercício e quais são apenas configurações que não alteram carga, duração ou fadiga.
