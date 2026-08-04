# As 3 ultimas especificacoes dela (automatico; a mais nova por ultimo)
# Na retomada: ler as 3, conectar com PROGRESSO.md e git, declarar e seguir.

## O QUE NÃO FIZ

Não commitei, não dei push, não rodei build/testes nem re-verifiquei as URLs de produção — os fatos do despacho foram transcritos como recebidos, não reconferidos por mim. Não alterei nenhum outro arquivo nem os textos dos blocos históricos anteriores.

Trecho exato acrescentado no topo (linhas 6–95) e o cabeçalho reescrito:

```markdown

## 🚀 DOSE POR PROTOCOLO ENTREGUE E PUBLICADA (04/ago/2026) — `0873db8`, v2.69.0

Os 8 passos do plano abaixo (1.1 a 1.4 e 2.1 a 2.4) foram executados, provados e publicados.
**Commits:** lote 1 = `b491e92` (núcleo puro) · lote 2 = `6165264` (interface) · release = `0873db8`.

### LOTE 1 — núcleo puro (`b491e92`)

Codex **`gpt-5.6-sol`, esforço xhigh, lab `dose1`**.

- **categorias formais de parâmetro** em `types.ts` e a **dose legada** como kind **`legacyCustom`**;
- **precedência de leitura** em `legacy.ts`: **`dose` &gt; `settings.protocol` &gt; `settings.trials`**;
- **`legacyDoseMinutes`** em `duration.ts` **restrita aos exercícios com taxa por unidade constante
  nos três protocolos** — nos demais não há faixa;
- os **textos dos três protocolos** em `presentation.ts`.

### LOTE 2 — interface (`6165264`)

Codex **`gpt-5.6-sol`, esforço high, lab `dose2b`**.

- **`ProtocolDoseSection`** e **`PrescriptionSection`** novos;
- janela **"Ajustar"** em **cinco seções**, na ordem que ela definiu — **Dose do treino · Modalidade e
  variantes · Assistência · Configurações de nível · Preferências de execução** — **nenhuma recolhida**;
- **`convertLegacyDose`** como **função pura** em `lib/prescription/dose-settings.ts`;
- **`exercise-plan.ts`** grava o protocolo **explicitamente**.

### Três correções que ela pediu — aplicadas

1. **Aviso do protocolo Breve** passou a sair do campo **`clinicalValidity` do catálogo, por exercício**,
   em vez de regra genérica por quantidade de unidades. Texto neutro aprovado por ela:
   *"Treino válido em dose reduzida. O desempenho desta sessão pode não ser suficiente, isoladamente,
   para atualizar o nível adaptativo."*
2. **`protocolLabel` passou a usar a unidade real de cada exercício** — **8 séries** no Span, **5 rodadas**
   no Restaurante e no Supermercado, **5 tentativas** na Informação em Foco, **2 desafios completos** no
   Jogo das Torres — em vez de "blocos" para os 34. O **teste que consagrava o defeito foi corrigido**.
3. **Quarta seção nomeada "Configurações de nível"** e **quinta** com **feedback/`autoAdvance`**.

### Consertos pós-colheita — Claude Opus 5 xhigh (exceção 1 da regra 8)

- **erro de tipagem** em `convertLegacyDose`;
- a marca **"Configuração provisória"** estava **sobrescrevendo o rótulo da dose**: o teste que a expunha
  passou a usar um exercício **não colinear e não provisório** (`jogo-memoria`), e o **caso provisório
  ganhou asserção própria**.

### Evidências executadas (comportamento)

- **a duração da sessão muda por protocolo** — Span + Jogo da Memória: **Breve 6,5–9 min · Padrão
  13,5–16 min · Estendido 20,5–23 min**;
- **plano novo grava** `[{"id":"jogo-memoria","settings":{"protocol":"PADRAO"}}]`;
- **abrir plano legado** com `{trials:15, level:4}` devolve **o mesmo objeto, sem mutação**;
- **conversão explícita** transforma `{trials:15, level:4, allowReplay:true}` em
  `{level:4, allowReplay:true, protocol:"PADRAO"}` — **remove `trials`, preserva o nível**.

### Provas (repositório real)

`npx tsc --noEmit` exit 0 · `npx vitest run` **375/375 em 30 arquivos** (eram **333** antes do lote 1 →
**+42**) · `npm run build` exit 0 · **botão de salvar inalterado** em `disabled={saving || items.length === 0}`.

### ✅ Publicação confirmada por evidência

`https://neuropeak-5jyl.vercel.app/api/version` →
`{"appVersion":"2.69.0","buildId":"dpl_AgCRt8a2faZZxwbmVprskcWg4bBz"}` · `/api/health` → `{"ok":true}` ·
`git merge-base --is-ancestor` confirmou que **`b491e92` e `6165264` estão contidos em `0873db8`**.

### ⚠️ Incidente — lição de operação do Codex

No **primeiro disparo do lote 2** o VP interpretou **CPU baixa do processo `codex` como travamento** e
**matou o processo, removendo o lab e perdendo trabalho em andamento**. O `codex` é **cliente de API** e
fica **ocioso esperando resposta do servidor** — **CPU baixa é comportamento normal, não sinal de
travamento**. Depois, um **disparo em primeiro plano foi morto pelo timeout de 10 minutos da ferramenta**.
**O disparo correto é em segundo plano, aguardando a notificação sem interromper.**

### Limitações que permanecem

- **nível ainda é slider livre** — regra com histórico ficou fora do escopo;
- **Ordem da História** ainda **acrescenta etapas de verdade** com `unlockIntruso`/`unlockFalta`, e a
  interface **declara isso** em vez de fingir que já são variantes;
- **Caminhos para a Meta** segue **provisório**;
- nos **15 exercícios de taxa não constante** a dose legada **não tem faixa** — só o texto
  *"Duração aproximada — configuração anterior"*.

### ⏸️ PRÓXIMO PASSO — PARADO aguardando a validação visual dela; **NÃO iniciar nenhuma nova fase**

Em `https://neuropeak-5jyl.vercel.app`, ela vai olhar: **as cinco seções da janela "Ajustar"** · se
**Breve/Padrão/Estendido** estão claros e equilibrados · se a **duração muda imediatamente** ao trocar o
protocolo · se as **unidades aparecem corretas** (séries, rodadas, tentativas, desafios completos) · se o
**aviso do Breve** está claro **sem fazer o protocolo parecer inadequado** · se o **plano legado preserva a
dose antiga e oferece conversão explícita** · se **Caminhos para a Meta** aparece como **provisório sem
esconder o valor preservado** · se a **janela ficou pesada ou extensa demais** · e se o botão
**"Salvar plano"** continua funcionando.

## (histórico) EM ANDAMENTO — DOSE POR PROTOCOLO: implementação dos passos 1 a 5 da ordem segura

&gt; **Encerrado em 04/ago/2026:** os **8 passos** (1.1 a 1.4 e 2.1 a 2.4) foram entregues, provados e
&gt; publicados em `0873db8` (v2.69.0) — registro no topo. Mantido como registro do fatiamento, das
&gt; decisões de desenho e do roteamento usados. **Diferença entre plano e entrega:** o passo **2.1**
&gt; previa **4 seções** na janela "Ajustar"; ela pediu **5**, com **"Configurações de nível"** própria.
```</result>
<usage><subagent_tokens>34608</subagent_tokens><tool_uses>8</tool_uses><duration_ms>112539</duration_ms></usage>
</task-notification>
