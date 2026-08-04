# As 3 ultimas especificacoes dela (automatico; a mais nova por ultimo)
# Na retomada: ler as 3, conectar com PROGRESSO.md e git, declarar e seguir.

## COMO PROVEI

- `git show --stat --oneline a6f61f0` — exit 0. Confirma os 6 arquivos criados e os 4 alterados exatamente como descritos no despacho (mais `PEDIDOS-LOG.md`, +3 linhas, que não citei por ser gancho automático), e que `package.json` **não** foi tocado.
- `node -p "require('./package.json').version"` → `2.67.1`; `wc -l lib/prescription/presentation.ts` → 469 linhas; `library-coverage.test.ts` → 29 linhas (o despacho não deu número; registrei sem contagem).
- `npx tsc --noEmit` → `TSC_EXIT=0`. `npx vitest run` → `Test Files 28 passed (28)` / `Tests 330 passed (330)`, comando com exit code 0. Ou seja, reproduzi por conta própria as duas primeiras provas do despacho no repositório real.
- `git status --short` após a edição → apenas ` M PROGRESSO.md`; `git diff --stat` → 1 arquivo, 57 inserções, 0 remoções.

## O QUE NÃO FIZ

- Não commitei nem dei push (o commit é do VP). A árvore está com `PROGRESSO.md` modificado e não staged.
- Não rodei `npm run build` (a prova de build do despacho segue sendo do VP; as outras duas eu reproduzi). Status do build nesta sessão: DESCONHECIDO por evidência própria.
- Não alterei nenhum outro arquivo — nem `ESTADO-DO-PROJETO.md`, nem `CLAUDE.md`, nem o registro de roteamento em outro lugar.
- Não mexi no bloco `## 🚧 EM ANDAMENTO (02/ago/2026) — FASE 1 da arquitetura clínica` (linha ~52 antes da edição). Observação para o VP: ele está marcado como em andamento com os lotes B e C ⬜, mas o bloco de topo declara essa Fase 1 concluída e congelada — é contradição residual dentro do arquivo, fora do escopo deste despacho.
- Não fiz nenhuma verificação visual da tela de plano nem validei os 7 cenários listados.</result>
<usage><subagent_tokens>38988</subagent_tokens><tool_uses>11</tool_uses><duration_ms>132095</duration_ms></usage>
</task-notification>

## 03/08/2026 22:55
A Implementação — Fase 2 está tecnicamente aprovada.

Decisões visuais:

1. DESCRIÇÃO DOS EXERCÍCIOS

Não quero que a descrição do exercício desapareça completamente da visão principal da biblioteca.

Manter em cada ExerciseRow ou card:

- nome oficial;
- descrição curta de uma linha;
- modelo/dose/duração de forma compacta;
- carga e fadiga;
- botão “Ver detalhes”.

A descrição curta deve:

- ajudar o terapeuta a reconhecer rapidamente a finalidade da atividade;
- ter no máximo uma ou duas linhas;
- usar truncamento visual quando necessário;
- não aumentar excessivamente a altura dos cards.

Dentro de “Ver detalhes”, manter:

- descrição completa;
- perfil cognitivo;
- modelo de execução;
- protocolo;
- carga;
- fadiga;
- interferência;
- modalidade;
- demais informações técnicas.

Não reintroduzir excesso de informação na linha principal.

2. AGRUPAMENTO DOS ALERTAS

Sim, o paredão de alertas deve ser tratado na próxima fase.

Não alterar agora o núcleo dos 18 alertas.

Não eliminar alertas.

Não fundir códigos técnicos.

Na futura exibição, agrupar ocorrências repetidas ou relacionadas visualmente.

Exemplos:

- três ocorrências de fadiga alta consecutiva:
  mostrar um grupo “Fadiga alta em sequência” com os pares envolvidos;

- múltiplas interferências altas:
  mostrar um grupo “Interferência elevada entre exercícios”;

- várias posições pouco recomendadas:
  consolidar em um grupo de organização da sessão.

O agrupamento será exclusivamente de apresentação.

O núcleo deve continuar retornando todas as ocorrências individuais para:

- rastreabilidade;
- testes;
- relatórios;
- futuras análises.

3. VALIDAÇÃO VISUAL

Antes de iniciar a Implementação — Fase 3:

- disponibilize esta versão para validação visual;
- faça o bump de versão necessário;
- publique na Vercel;
- não altere banco, APIs ou formato persistido;
- informe a URL ou ambiente implantado;
- confirme que o commit implantado contém a Fase 2.

Depois da publicação, vou validar manualmente:

- plano vazio;
- dentro do esperado;
- acima do esperado;
- excesso importante;
- fadiga alta consecutiva;
- planejamento consecutivo;
- plano legado;
- descrição curta dos exercícios;
- botão Salvar plano disponível nos cenários com alertas.

Não iniciar automaticamente a Fase 3 após publicar.

Pare e aguarde minha validação visual.
