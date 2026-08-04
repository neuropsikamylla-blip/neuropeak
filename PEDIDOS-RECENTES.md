# As 3 ultimas especificacoes dela (automatico; a mais nova por ultimo)
# Na retomada: ler as 3, conectar com PROGRESSO.md e git, declarar e seguir.

## 🩺 REFINO CLÍNICO E DE UX DA PRESCRIÇÃO ENTREGUE E PUBLICADO (04/ago/2026) — `8b833dc`, v2.70.0

**Commits:** lote A = `0f9bea5` · lote B = `6f1364c` · release = `8b833dc`.

### 🧭 O princípio que ela fixou — governa tudo o que está abaixo

O NeuroPeak é plataforma de **TREINO** cognitivo, **não instrumento de avaliação psicológica**.
Princípios de **contaminação de teste NÃO valem como regra universal de treino**. Dois exercícios podem
trabalhar **o mesmo domínio intencionalmente**; uma sessão pode ser **ampla ou focal**; **concentração num
domínio é decisão clínica legítima**; **sobreposição não é automaticamente combinação ruim**.
**O sistema informa — não corrige nem reprova a escolha do terapeuta.**

### LOTE A — o nível saiu da prescrição rotineira (`0f9bea5`)

Codex **`gpt-5.6-terra`, esforço high, lab `refinoA`**.

- **removidos da janela "Ajustar"**: a seção **"Configurações de nível"**, o **slider** e o texto
  **"revisão futura"**; o **`startLevel` 1–5 do Agentes Focus** saiu **pela mesma regra**;
- a janela ficou com **quatro seções**: **Dose do treino · Modalidade e variantes · Assistência ·
  Preferências de execução**;
- **salvar o plano deixou de enviar `exerciseLevels` à API**;
- **cartões de protocolo com mais respiro**; o **aviso do Breve** trocou a **paleta âmbar de advertência**
  por **informação discreta**, mantendo o texto clínico aprovado;
- **novo texto da assistência:** *"Repetir o áudio reapresenta o conteúdo auditivo. Não altera a dose
  prescrita nem a estimativa atual."*

### ⚠️ Risco antigo que essa mudança corrigiu — registrar como lição

O código anterior **carregava `exerciseLevels` de `patient.exerciseConfigs`** (a **dificuldade real do
banco**) e **reenviava a cada salvamento** com fallback **`?? 1`**. Se o paciente **treinasse e subisse de
nível depois de a tela ser aberta**, **salvar o plano o rebaixava** ao valor carregado na abertura.
A API **só grava quando o campo vem preenchido** (`if (exerciseLevels &amp;&amp; Object.keys(...).length &gt; 0)`),
então **parar de enviar significa não tocar em `currentDifficulty`**. **Exercícios novos não perdem nada:**
o `ExerciseConfig` **nasce na primeira sessão**, pelo **upsert de `/api/sessions`**. **Nenhum dado de nível
foi apagado, migrado ou zerado**, e **há teste provando**.

### LOTE B — taxonomia, linguagem e agrupamento dos alertas (`6f1364c`)

Codex **`gpt-5.6-sol`, esforço high, lab `refinoB`**.

- **três níveis visuais** no lugar do bloco único: **Revisão do plano · Observações clínicas · Informações**;
- **`DECLARED_BAD_COMBINATION` saiu inteiro da revisão** e virou **observação clínica neutra**.
  **A medição que sustenta:** o disparo era **por presença no plano, não por adjacência**; dos **41 pares
  únicos** declarados no catálogo, só **6** têm **fadiga alta bilateral** e **5** **interferência alta
  bilateral**, e esses casos **já são cobertos** por `HIGH_FATIGUE_ADJACENT`, `HIGH_INTERFERENCE_ADJACENT`
  e `HIGH_FATIGUE_COUNT`, **que continuam intactos**. **Nenhum sinal objetivo se perde.**
- as **`reason` do catálogo contêm linguagem proibida** ("contaminação", "reduz a comparabilidade",
  "reduz a validade"); **o catálogo NÃO foi tocado** — a **camada de apresentação** passou a **traduzir ou
  suprimir** essas frases, e **o texto cru não chega mais à tela**;
- **títulos informativos derivados do perfil cognitivo real do par**, no lugar de
  *"Combinação que merece revisão"* repetido;
- **agrupamento por tema**, com **as ocorrências individuais preservadas no núcleo**.

### Conserto pós-colheita — Claude Opus 5 xhigh (exceção 1 da regra 8)

`HIGH_FATIGUE_POSITION` **tinha ficado como observação clínica**; foi **devolvido à revisão do plano**,
porque **fadiga alta no fechamento é a terceira perna da regra de fadiga aprovada na Fase 2**, junto com
**quantidade** e **consecutividade**. **A spec do VP tinha esquecido de listá-la.**

### 📊 Medição antes e depois — plano com os 34 exercícios, protocolo Padrão, alvo de 40 min

- **ANTES: 66 cartões** — **50** em "revisão recomendada", **3** em atenção, **13** informativos.
  Por código: **41** `DECLARED_BAD_COMBINATION` · **13** `OUTSIDE_BEST_POSITION` · **4**
  `HIGH_FATIGUE_ADJACENT` · **2** `HIGH_INTERFERENCE_ADJACENT` · **2** `PLANNING_WINDOW_ADJACENT` ·
  **1 cada** de `LOAD_OVER_CAP`, `SESSION_SAFE_MAX_EXCEEDED`, `HIGH_FATIGUE_COUNT` e
  `PLANNING_WINDOW_COUNT`.
- **DEPOIS: 21 cartões** — **7** em Revisão do plano · **13** em Observações clínicas · **1** em
  Informações. **As 66 ocorrências continuam preservadas e rastreáveis**; **o núcleo segue devolvendo 66**.
  As **13 posições preferenciais colapsaram num único cartão expansível**.

### Verificações de linguagem (todos os textos visíveis do plano com 34 exercícios)

**Ausentes:** "combinação desfavorável" · "manter apenas uma" · "contaminação" · "comparabilidade" ·
"reduz a validade" · "Combinação que merece revisão". **Nenhum código técnico**; **nada bloqueia salvar**;
**`canSave` true**.

### 🎯 Prova clínica central

Plano **focal em memória operacional** com **Span Numérico Auditivo Direto, Span Inverso, Letras em
Sequência, Matriz Espacial e Matriz Espacial Inversa** — **exatamente os pares que ela mandou não alertar** —
gera **ZERO revisões** e **três observações neutras**.

### Provas (repositório real)

`npx tsc --noEmit` exit 0 · `npx vitest run` **395/395 em 31 arquivos** (eram **375** antes do lote A →
**+20**) · `npm run build` exit 0 · **botão de salvar inalterado**.

### ✅ Publicação confirmada por evidência

`/api/version` → `{"appVersion":"2.70.0","buildId":"dpl_61ZvV2hDyMy5qPczkTXX5zwQu8JS"}` · `/api/health` →
`{"ok":true}` · `git merge-base` confirmou que **`0f9bea5` e `6f1364c` estão contidos em `8b833dc`**.

### 📌 Funcionalidade futura separada — decidida por ela, **NÃO implementada**

**"REDEFINIR NÍVEL"** — deverá ficar na **área de evolução/histórico do paciente**, **nunca no botão
"Ajustar"**; usada **só em casos específicos**; **mostra nível atual e novo**; **exige confirmação**;
**preserva histórico**; **nunca rebaixa ou reinicia silenciosamente**.

### ⏸️ PRÓXIMO PASSO — PARADO aguardando a validação visual dela; **NÃO iniciar tutoriais nem nova fase**

Em `https://neuropeak-5jyl.vercel.app`, ela vai validar: **exercício nos três protocolos** · **exercício com
modalidade** · **exercício com repetição de áudio** · **plano focal em memória operacional** · **Span Direto
+ Inverso** · **Matriz Direta + Inversa** · **plano com duração excessiva** · **plano com fadiga alta
consecutiva** · **plano com várias posições preferenciais** · e um **plano teste com os 34 exercícios**, no
qual **carga e duração devem continuar alertando**, **o painel não pode virar paredão**, **as observações
semelhantes devem estar agrupadas** e **"Salvar plano" deve continuar disponível**.
```

## COMO PROVEI

- `git status --porcelain` → exit 0, saída ` M PROGRESSO.md` — nenhum outro arquivo tocado, nada criado nem removido.
- `git diff --stat` → `1 file changed, 108 insertions(+)` — **zero deleções**, ou seja, nenhum conteúdo anterior do arquivo foi perdido ou reescrito.
- Leitura das linhas 1–10 pós-edição confirma o bloco novo começando na linha 6, logo após o cabeçalho, e a leitura prévia do arquivo confirma que o bloco `v2.69.0` segue intacto imediatamente abaixo.

## O QUE NÃO FIZ

- **Não commitei e não dei push** — a árvore está suja de propósito, com a mudança pronta para o VP commitar.
- Não alterei nenhum outro arquivo (nem `CLAUDE.md`, nem `ESTADO-DO-PROJETO.md`, nem código, nem docs).
- Não rodei `tsc`, `vitest`, `build` nem consultei `/api/version` — os números do despacho foram transcritos como fato recebido, não re-verificados por mim; se o VP quiser essas provas independentes, é outra tarefa.
- Não conferi no código-fonte as afirmações do despacho (contagem de cartões, códigos de alerta, `exerciseLevels`) — o escopo era registro, não auditoria.
- Não abri nem iniciei nada da funcionalidade futura "REDEFINIR NÍVEL", nem tutoriais, nem nova fase.</result>
<usage><subagent_tokens>29808</subagent_tokens><tool_uses>4</tool_uses><duration_ms>99299</duration_ms></usage>
</task-notification>
