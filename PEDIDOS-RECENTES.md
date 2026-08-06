# As 3 ultimas especificacoes dela (automatico; a mais nova por ultimo)
# Na retomada: ler as 3, conectar com PROGRESSO.md e git, declarar e seguir.

## COMO PROVEI

- `git status --porcelain` → exit 0, saída ` M PROGRESSO.md` — nenhum outro arquivo tocado.
- `git diff --stat` → `PROGRESSO.md | 79 ++++`, 1 file changed.
- Releitura do arquivo (linhas 30–61 e 108–143): checkboxes 2–5 em `[x]`, 6 em `[ ]` com o texto novo; subseção fechando em 136 e `## ✅ T1.0` intacto em 138.
- **Alerta que preciso registrar:** eu **não** executei nenhum commit, mas o **hook de checkpoint automático do ambiente** commitou a primeira edição sozinho — `git log --oneline -3` mostra `3ce6448 checkpoint automatico (salvamento de seguranca)` acima de `a14724d`. A segunda edição (a subseção inteira) segue **não commitada** na árvore de trabalho. O VP decide se refaz esse commit com mensagem descritiva (`git reset --soft` é destrutivo de histórico e não toquei nisso).

## O QUE NÃO FIZ

- Não commitei nem dei push (o commit `3ce6448` é do hook automático dela, não meu).
- Não rodei gates (`test`, `build`, `tsc`, `lint`), nem os scripts `paciente-teste-t1.mjs` / `isolamento-tutorial.mjs`, nem nada contra o banco — todos os números vieram do despacho e foram transcritos como recebidos, sem verificação independente.
- Não toquei em `CLAUDE.md`, `ESTADO-DO-PROJETO.md`, memória, docs, código ou configuração.
- Não alterei o texto histórico do bloco ("Estado ao abrir o bloco: nenhum passo iniciado" segue como registro da abertura — a nova subseção o supera; se o VP quiser, esse parágrafo pode ser reescrito).</result>
<usage><subagent_tokens>36375</subagent_tokens><tool_uses>9</tool_uses><duration_ms>132410</duration_ms></usage>
</task-notification>

## 05/08/2026 22:45
Ótimo.
Antes da validação visual, quero congelar quatro decisões da T1:
1.
Não criar automaticamente pacientes técnicos nas próximas conversões.
Sempre utilizar um paciente de teste já existente, salvo autorização explícita.
2.
Remover qualquer emoji do framework do tutorial.
Utilizar apenas texto ou ícones discretos da própria interface.
3.
A preparação deve permanecer extremamente objetiva.
Ela explica apenas:
o que acontecerá;
como responder;
como iniciar.
Estratégias cognitivas, dicas de memorização ou orientações terapêuticas não pertencem à preparação.
4.
A tentativa guiada não deve ser definida por um número fixo.
Ela deve utilizar a menor unidade válida da mecânica clínica de cada exercício.
No Span Direto isso corresponde hoje a 2 dígitos, mas o framework deve permanecer genérico.
Depois dessas quatro correções, faço a validação visual do Span Numérico Auditivo Direto.
