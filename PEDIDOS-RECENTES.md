# As 3 ultimas especificacoes dela (automatico; a mais nova por ultimo)
# Na retomada: ler as 3, conectar com PROGRESSO.md e git, declarar e seguir.

## TRÊS FATOS QUE NÃO BATERAM (você pediu para avisar)

1. **O hash `fa5f037` não está na história atual.** Ele existe (mesma mensagem, mesma tree, mesmo parent `8a41dfc`, autoria 12:18:04), mas foi **recriado 11 segundos depois** como **`83e2914`** (committer date 12:18:15), e `git merge-base --is-ancestor fa5f037 HEAD` → **não**. Escrevi **`83e2914`** no PROGRESSO.md, com uma nota em itálico explicando o hash órfão. Os outros seis hashes são ancestrais de HEAD e conferem com as mensagens que você citou.
2. **O painel de tentativas (`45e91f5`, v3.6.0) NÃO traz a exceção declarada no commit** — o corpo não tem linha `MOTOR:` nenhuma. A exceção 3 está declarada em quatro commits: `70b5311`, `de456f5`, `83e2914`, `8c6a6f1`. Registrei isso no bloco de roteamento como "lacuna registrada", em vez de repetir "cada uma com a exceção declarada no commit".
3. **O modelo não usa os nomes `initialState`/`goalState`** — em `lib/torres/tipos.ts` os campos são **`inicial`** e **`alvo`**. Escrevi "o modelo já era par de estados (`inicial` + `alvo`)". O conteúdo da sua afirmação está certo; os identificadores, não.

## O QUE NÃO FIZ

- **Não commitei.** Mas atenção: o **hook de checkpoint automático dela commitou sozinho** enquanto eu trabalhava — `2ce02ba` (17:56:30) e `f2e949c` (17:57:23) já contêm minhas alterações do `PROGRESSO.md`, e por isso `git status` está limpo agora e o `git diff --stat` acima é o que existia antes do hook disparar. Não houve push.
- **Efeito colateral do mesmo hook: o backup `PROGRESSO.md.bak-20260901` foi versionado** em `2ce02ba` (203 KB duplicando o PROGRESSO.md; o `.gitignore` não cobre `*.bak-*`). Não removi nada — decisão sua.
- Não toquei em nenhum outro bloco do PROGRESSO.md, não rodei build, não alterei `~/codex-lab/registro-roteamento.md` (não estava no despacho), não mexi em `PEDIDOS-LOG.md`/`PEDIDOS-RECENTES.md` (as mudanças neles são do gancho).
- Não consegui provar as falhas dos labs por artefato: `~/codex-lab/labs/` não existe e não achei diretório de lab `torres-*`. A evidência das quatro falhas veio **dos corpos dos commits** `70b5311`, `de456f5`, `83e2914` e `8c6a6f1`, que descrevem `torres-f4` (erro de terminal), `torres-f5b` (vazio em duas execuções) e `torres-gate` (terminou sem produzir arquivo).</result>
<usage><subagent_tokens>56759</subagent_tokens><tool_uses>36</tool_uses><duration_ms>285751</duration_ms></usage>
</task-notification>

## 01/09/2026 18:00
publique agora o que estou solicitando se nao irei denunciar vc
