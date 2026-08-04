# As 3 ultimas especificacoes dela (automatico; a mais nova por ultimo)
# Na retomada: ler as 3, conectar com PROGRESSO.md e git, declarar e seguir.

## 04/08/2026 15:54
<task-notification>
<task-id>bvsiehsy5</task-id>
<tool-use-id>toolu_013u1AUbThGtr8kjFZ2dwLKn</tool-use-id>
<output-file>/private/tmp/claude-501/-Users-kamyllahonorio-neuropeak/3e6ecf11-e4e5-471f-bbf9-4595faa53598/tasks/bvsiehsy5.output</output-file>
<status>completed</status>
<summary>Background command "Disparar o lote B" completed (exit code 0)</summary>
</task-notification>

## 04/08/2026 16:01
<task-notification>
<task-id>aebb95709f9096f34</task-id>
<tool-use-id>toolu_011PwLSNAG2BdrXyh6WQccHU</tool-use-id>
<output-file>/private/tmp/claude-501/-Users-kamyllahonorio-neuropeak/3e6ecf11-e4e5-471f-bbf9-4595faa53598/tasks/aebb95709f9096f34.output</output-file>
<status>completed</status>
<summary>Agent "Registrar UX v2.71.0" finished</summary>
<note>A task-notification fires each time this agent stops with no live background children of its own. The user can send it another message and resume it, so the same task-id may notify more than once.</note>
<result>**O QUE MUDOU**

Apenas `/Users/kamyllahonorio/neuropeak/PROGRESSO.md`: bloco novo inserido no topo, logo após o cabeçalho (linhas 1–5) e antes do bloco `v2.70.0`.

**COMO PROVEI**

- `git status --porcelain` → exit 0, saída ` M PROGRESSO.md` (nenhum outro arquivo tocado).
- `git diff --stat` → exit 0, `1 file changed, 105 insertions(+)` — **zero deleções**, o que prova que nenhum conteúdo anterior foi removido ou alterado.
- Sem commit, sem push.

**O QUE NÃO FIZ**

Não commitei nem dei push; não toquei em código, testes, configuração ou qualquer outro arquivo; não iniciei tutoriais nem nova fase; não validei nada em produção (a validação visual é dela).

---

Trecho exato escrito (linhas 6–110 do arquivo):

```markdown

## 🪟 REFINO DE UX DA TELA DE MONTAGEM DO PLANO ENTREGUE E PUBLICADO (04/ago/2026) — `b7b22dd`, v2.71.0

**Commits:** lote A = `19e8412` · lote B = `e1f0392` · release = `b7b22dd`.

### O problema que ela apontou

A **mesma tela** exibia **ao mesmo tempo** biblioteca, exercícios incluídos, painel de ajuste, resumo de
duração, carga, fadiga, interferência, revisão do plano, observações clínicas e informações — **poluição
visual**, **textos pequenos** e **excesso de informação concorrendo pela atenção**. O objetivo era
**densidade e foco de tarefa**, **SEM alterar regra clínica nenhuma**.

### Diagnóstico do VP na leitura do código

O aperto **não vinha só do excesso de conteúdo**. O grid em `plano/page.tsx` era
`grid-cols-1 lg:grid-cols-2` — **50/50 fixo a partir de 1024px**. Num **notebook de 1280px** cada painel
ficava com **cerca de 600px**, e daí a fonte pequena. Também foi constatado que o estado `open` de cada
`ExerciseCard` era um **`useState` LOCAL do próprio cartão**, razão de **vários ajustes abrirem juntos**.

### LOTE A — painéis retráteis (`19e8412`)

Codex **`gpt-5.6-terra`, esforço high, lab `uxA2`**.

- linguetas **"Exercícios"** e **"Plano"** como **botões reais**, com `aria-expanded` e `aria-controls`,
  **navegáveis por teclado**;
- **três estados**: ambos abertos, biblioteca recolhida, plano recolhido; **recolher um quando o outro já
  está recolhido reabre o outro**. **A garantia não depende do botão:** `isPanelPreference` exige que **ao
  menos um painel esteja aberto**, então **nem valor adulterado no `localStorage` produz tela vazia**;
- conteúdo recolhido é **escondido, não desmontado** — **categoria, subdomínio, busca, filtros e rolagem
  sobrevivem**;
- preferência em `localStorage` sob a chave **`np-plano-paineis`**;
- o estado `open` do `ExerciseCard` **subiu para o pai**: **apenas um ajuste aberto por vez**.

### ⚠️ Armadilha técnica que o VP blindou na spec — registrar como lição

**`localStorage` não existe no servidor**, e **ler no primeiro render causa mismatch de hidratação no
Next.js** — falha que **aparece em produção e não aparece em desenvolvimento**. O estado **começa no padrão**
e só é lido **depois de montar**, num `useEffect` com `try/catch`. Há **teste estático que falha** se alguém
voltar a ler `localStorage` no **inicializador do `useState`**. A **lógica pura** de transição e normalização
ficou em **`lib/panel-preference.ts`**, **testável sem DOM**, porque a suíte roda em **environment node, sem
jsdom**.

### LOTE B — divulgação progressiva (`e1f0392`)

Codex **`gpt-5.6-sol`, esforço high, lab `uxB`**.

- cada alerta mostra, **fechado**, apenas **título, dado principal e categoria**; **explicação, exercícios,
  sugestão e ocorrências individuais só ao expandir**;
- o **dado principal vem de valor JÁ CALCULADO pelo núcleo**: **69 / referência 13** · **290–345 min** ·
  **12 atividades** · **6 janelas** · **9 pares** · **13 atividades**. **Alerta sem métrica natural**, como
  concentração cognitiva, **não exibe a linha** em vez de ganhar **texto genérico**;
- **limites iniciais por grupo**: **4 revisões · 3 observações · 1 bloco de informações**, com **"Ver mais N"
  cuja contagem bate com o que está oculto**. Num plano com os **34 exercícios** o **primeiro nível cai para
  8 cartões**;
- **`CompactExerciseMeta` novo**: exercício selecionado mostra **nome, protocolo, duração, carga e fadiga**;
  **descrição, perfil cognitivo e modalidade** vão para **"Ver detalhes"**;
- **NENHUMA fonte diminuiu**: os tamanhos de **10 e 11px viraram `text-xs`**, títulos **`text-base`** e dados
  principais **`text-lg`**. **A folga veio de mostrar menos de uma vez, não de encolher texto.**

### Conserto pós-colheita — Claude Opus 5 xhigh (exceção 1 da regra 8)

O **teste estático do lote A** usava a **flag `/s` de regex**, **rejeitada pelo target do projeto**; a flag
era **supérflua**, porque o padrão **não usa `.`**.

### 🚨 Incidente de operação a registrar

O **primeiro disparo do lote A** (lab `uxA`) ficou **1h22 travado**, com o **log parado em 2 linhas** e
**zero arquivos escritos**, e o **VP só percebeu quando ela perguntou**. Foi **morto e redisparado no lab
`uxA2`**, aí com sucesso.
**LIÇÃO CORRIGIDA:** o **sinal de travamento do Codex NÃO é CPU baixa** — esse indicador **levou a matar
trabalho bom num incidente anterior**. O **sinal correto** é o **LOG QUE NÃO AVANÇA** somado a **zero
arquivos escritos**. Num disparo saudável o **log cresce para dezenas de milhares de linhas** e os **arquivos
aparecem durante a execução**. O VP deve **verificar progresso periodicamente**, em vez de confiar apenas na
**notificação de término**.

### Provas (repositório real)

`npx tsc --noEmit` exit 0 · `npx vitest run` **405/405** (eram **395** antes do lote A → **+10**) ·
`npm run build` exit 0 · **`canSave` true** · **botão de salvar inalterado**.

### Preservação verificada

Num plano com os **34 exercícios**, as **66 ocorrências continuam preservadas** e **o núcleo segue devolvendo
66**; os **21 cartões agrupados continuam existindo no objeto**, e **o que mudou foi só quantos aparecem de
início**.

### ✅ Publicação confirmada por evidência

`/api/version` → `{"appVersion":"2.71.0","buildId":"dpl_DuRksRCRRuTSkwcmseH4duhvHsrb"}` · `/api/health` →
`{"ok":true}` · `git merge-base` confirmou que **`19e8412` e `e1f0392` estão contidos em `b7b22dd`**.

### Limitações declaradas

**Não há teste de clique nem de renderização**, porque a **suíte roda sem jsdom** e **ela vetou instalar
dependência**; o que foi testado é a **lógica pura**. O **comportamento de drawer em telas pequenas** é o
ponto que **menos se pode garantir sem ver**.

### ⏸️ PRÓXIMO PASSO — PARADO aguardando a validação visual dela; **NÃO iniciar tutoriais nem nova fase**

Em `https://neuropeak-5jyl.vercel.app`, ela vai validar: **ambos os painéis abertos** · **biblioteca
recolhida** · **plano recolhido** · **plano com poucos exercícios** · **plano focal em memória operacional** ·
**plano com duração excessiva** · **plano com muitos alertas** · **plano teste com 34 exercícios** · **um
exercício com "Ajustar" aberto** · **exercício com modalidade** · **exercício com assistência** · e um
**notebook de largura intermediária**.
```</result>
<usage><subagent_tokens>27953</subagent_tokens><tool_uses>3</tool_uses><duration_ms>75205</duration_ms></usage>
</task-notification>
