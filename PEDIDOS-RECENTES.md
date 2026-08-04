# As 3 ultimas especificacoes dela (automatico; a mais nova por ultimo)
# Na retomada: ler as 3, conectar com PROGRESSO.md e git, declarar e seguir.

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

## 04/08/2026 16:23
PROPOSTA ARQUITETÔNICA — SESSÃO COMO UNIDADE PRINCIPAL

Não implementar ainda.

Quero primeiro uma análise arquitetônica completa, baseada no código real e nos documentos atuais da prescrição.

A nova direção conceitual é esta:

==================================================
1. PRINCÍPIO CENTRAL
==================================================

A unidade clínica principal da prescrição passa a ser a SESSÃO.

O terapeuta define:

- duração da sessão;
- exercícios;
- ordem;
- protocolo de cada exercício;
- frequência semanal.

O sistema não escolhe automaticamente quais exercícios ficam em Breve, Padrão ou Estendido.

Essa decisão continua sendo do terapeuta, porque depende:

- do objetivo clínico;
- da tolerância do paciente;
- da fadiga observada;
- da evolução;
- da prioridade daquele exercício;
- do julgamento profissional.

O sistema deve:

- calcular;
- resumir;
- alertar;
- mostrar consequências da composição;

mas não substituir a decisão clínica.

==================================================
2. DURAÇÕES DA SESSÃO
==================================================

A duração da sessão passa a funcionar por faixas-alvo.

BREVE

- alvo: 20 minutos;
- faixa esperada: 18–22 minutos.

PADRÃO

- alvo: 35 minutos;
- faixa esperada: 32–38 minutos.

EXTENSO

- alvo: 50 minutos;
- faixa esperada: 46–54 minutos.

Essas faixas representam variação natural entre pacientes.

Não gerar alerta quando a estimativa permanecer dentro da faixa esperada.

Acima da faixa:

- gerar observação ou revisão consultiva;
- nunca bloquear salvamento.

Abaixo da faixa:

- informar discretamente;
- não considerar automaticamente inadequado;
- o terapeuta pode deliberadamente prescrever uma sessão menor.

==================================================
3. PROTOCOLOS DOS EXERCÍCIOS
==================================================

Cada exercício continua possuindo:

- Breve;
- Padrão;
- Estendido.

O terapeuta escolhe manualmente o protocolo de cada exercício.

O sistema não redistribui doses automaticamente.

O sistema não troca protocolos sem ação explícita.

O protocolo Breve precisa continuar sendo uma dose válida de treino.

Ele não pode existir apenas para “fazer caber” a sessão.

Reavaliar, em fase posterior, se as unidades internas de cada Breve realmente constituem dose mínima clinicamente útil.

Não recalibrar agora.

==================================================
4. TEMPO INDIVIDUAL DOS EXERCÍCIOS
==================================================

A duração estimada individual deixa de ocupar a linha principal do card.

Na visualização compacta do exercício, mostrar prioritariamente:

- nome;
- protocolo selecionado;
- carga;
- fadiga;
- Ajustar;
- remover;
- ordem.

A duração individual permanece disponível em:

- “Ver detalhes”;
- janela “Ajustar”;
- cálculo interno da sessão.

Não apagar nem deixar de calcular o tempo individual.

Apenas reduzir sua prioridade visual.

==================================================
5. CABEÇALHO DA SESSÃO
==================================================

O topo do plano deve futuramente comunicar:

SESSÃO PRESCRITA

Tipo: Padrão

Alvo: 35 min

Estimativa atual: aproximadamente 34 min

Estado: Dentro da faixa esperada

Faixa esperada: 32–38 min

Outro exemplo:

SESSÃO PRESCRITA

Tipo: Padrão

Alvo: 35 min

Estimativa atual: aproximadamente 43 min

Estado: Acima da faixa esperada

A interface deve deixar claro que:

- 35 min é alvo;
- 32–38 min é faixa esperada;
- não é necessário fechar exatamente em 35:00.

==================================================
6. AUTONOMIA DO TERAPEUTA
==================================================

O terapeuta pode deliberadamente:

- manter cinco exercícios em 35 minutos;
- aumentar para 50 minutos;
- utilizar uma sessão focal;
- manter exercícios de alta prioridade;
- aceitar uma estimativa um pouco acima;
- reduzir protocolos conforme tolerância;
- aumentar protocolos conforme evolução.

O sistema deve informar:

- duração;
- carga;
- fadiga;
- interferência;
- composição;

mas não deve decidir sozinho quais exercícios reduzir, remover ou ampliar.

Não criar otimizador automático de protocolos.

Não criar recomendação automática de substituição.

Não criar IA prescritor.

==================================================
7. RELAÇÃO COM O HISTÓRICO DO PACIENTE
==================================================

A arquitetura futura poderá usar dados do paciente para informar o terapeuta, por exemplo:

- queda de desempenho após determinado tempo;
- fadiga relatada;
- aumento de erros no final da sessão;
- estabilidade em sessões mais longas;
- adesão;
- interrupções;
- tempo real de execução.

Mas essas informações devem ser consultivas.

Não implementar isso agora.

A decisão permanece com o profissional.

==================================================
8. ALERTAS
==================================================

Reavaliar os estados de duração atuais considerando as novas faixas:

Breve:
- dentro: 18–22 min.

Padrão:
- dentro: 32–38 min.

Extenso:
- dentro: 46–54 min.

Antes de propor novos limites de atenção ou excesso importante, analisar o impacto sobre:

- SESSION_BELOW_TARGET;
- SESSION_ABOVE_TARGET;
- SESSION_RANGE_PARTIAL;
- SESSION_SAFE_MAX_EXCEEDED;
- tetos de carga;
- mensagens visíveis;
- testes existentes.

Não alterar ainda.

Apenas documentar quais regras precisarão ser revistas.

==================================================
9. COMPATIBILIDADE
==================================================

Preservar:

- planos antigos de 20, 30 e 40 minutos;
- protocolos já salvos;
- doses legadas;
- níveis;
- progresso;
- histórico;
- frequência;
- exercícios;
- ordem;
- modalidade;
- parâmetros assistivos.

Não migrar automaticamente planos antigos para 20/35/50.

A análise deve propor como diferenciar:

- plano legado com duração anterior;
- nova sessão Breve/Padrão/Extenso;
- sessão personalizada, caso necessário.

Não implementar migração.

==================================================
10. ANÁLISE OBRIGATÓRIA
==================================================

Antes de qualquer código, responder:

1. Quais módulos atuais tratam 20/30/40 como duração da sessão.

2. Quais tipos, fórmulas, alertas e testes dependem dessas três durações.

3. Quais partes podem ser reutilizadas sem alteração.

4. Quais partes precisariam ser modificadas para 20/35/50.

5. Como preservar planos antigos sem conversão silenciosa.

6. Como diferenciar protocolo da sessão e protocolo do exercício sem confundir a interface nem os tipos.

7. Se os nomes Breve/Padrão/Extenso em ambos os níveis geram ambiguidade.

8. Se recomenda nomes diferentes para:
   - duração da sessão;
   - dose do exercício.

9. Como o cabeçalho da sessão deveria ser estruturado.

10. Como ocultar a duração individual da linha principal sem perder transparência clínica.

11. Quais arquivos seriam alterados numa futura implementação.

12. Qual seria a ordem segura de implementação.

13. Quais decisões clínicas ainda precisam ser validadas antes do código.

==================================================
11. PONTO CRÍTICO DE NOMENCLATURA
==================================================

Avaliar com atenção se usar:

- Breve / Padrão / Extenso para a sessão;

e simultaneamente:

- Breve / Padrão / Estendido para cada exercício;

pode confundir o terapeuta.

Não renomear ainda.

Apresentar opções claras de nomenclatura.

Exemplo possível:

SESSÃO
- 20 min;
- 35 min;
- 50 min.

DOSE DO EXERCÍCIO
- Breve;
- Padrão;
- Estendida.

Ou outra solução mais clara.

Quero recomendação justificada, não alteração automática.

==================================================
12. BASE DOCUMENTAL
==================================================

Use como referência os documentos atuais da arquitetura de prescrição e o código real.

Não reabra:

- taxonomia cognitiva;
- classificação dos 34 exercícios;
- carga basal;
- fadiga;
- interferência;
- modalidades;
- compatibilidade legada;
- progressão adaptativa.

Esta análise deve se limitar à relação entre:

- duração da sessão;
- dose dos exercícios;
- apresentação do tempo;
- alertas de duração;
- compatibilidade.

==================================================
13. ENTREGA
==================================================

Criar um documento arquitetônico novo, sem alterar os documentos aprovados anteriores.

O documento deve conter:

- diagnóstico do modelo atual;
- nova proposta;
- diferenças entre sessão e exercício;
- alternativas de nomenclatura;
- impacto técnico;
- impacto clínico;
- impacto de UX;
- compatibilidade;
- riscos;
- decisões pendentes;
- ordem segura de implementação.

Não alterar código.

Não alterar interface.

Não alterar banco.

Não criar migration.

Não publicar.

Não iniciar implementação.

Ao final, pare e apresente a análise para validação.
