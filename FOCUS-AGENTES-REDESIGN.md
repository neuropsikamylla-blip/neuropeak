# 🎯 Focus Agentes — Redesign (4 Modos × 5 Níveis)

> Documento de design consolidado. Estrutura a visão da Kamylla para transformar o
> Focus Agentes num jogo com **4 modos cognitivos**, **5 níveis por modo**,
> **configuração clínica pelo terapeuta** e **feedback/tempo**.
> Status: **especificação aprovada** (decisões fechadas). Implementação por fases (ver fim).

---

## 1. Decisões fechadas (alinhadas com a Kamylla)

| # | Tema | Decisão |
|---|------|---------|
| D1 | Dificuldade | **Nível inicial + adaptação** — o terapeuta define o nível de partida (1–5); o jogo ainda sobe/desce dentro dos 5 níveis do modo conforme o desempenho. |
| D2 | Onde configura | **Os dois** — o terapeuta configura na **prescrição do plano** e existe uma **tela antes de iniciar**. |
| D3 | Fim da sessão | **Rodadas fixas** (mantém o formato de rodadas de hoje). |
| D4 | Tipo de captura | **Capturar todos da regra** — captura TODOS os que se encaixam (modelo go/no-go contínuo), não mais 1 alvo. |
| D5 | Papel do tempo | **Pressão por rodada nos níveis altos (4–5)** — relógio por rodada só nos níveis avançados; níveis baixos sem relógio. |
| D6 | Paciente edita? | **Só confirmar (read-only)** — a tela editável é do terapeuta; o paciente vê o prescrito e clica "Começar". |
| D7 | Modo 4 | **Visível com aviso de pré-requisito** — aparece para todos, com aviso recomendando dominar os modos 1–3 antes. |

---

## 2. Os 4 modos

Nome visível ao usuário → função cognitiva (interno) → mecânica → base no código atual.

| Nº | Nome no jogo | Função cognitiva | Mecânica central | Código atual |
|----|--------------|------------------|------------------|--------------|
| 1 | **Foco** | Atenção seletiva | Capturar todos que batem com a regra (cor/atributos) | ✅ comandos `single`/`colorAttribute`/`multiAttr` |
| 2 | **Inibição** | Controle inibitório | Capturar os "certos", NÃO tocar nos proibidos (go/no-go) | ✅ comandos `negative` ("exceto") |
| 3 | **Alternância** | Flexibilidade cognitiva | A regra troca durante a rodada ("depois capture…") | 🟡 `sequence` (precisa virar troca-de-regra contínua) |
| 4 | **Desafio Executivo** | Combinação dos 3 | Atenção + inibição + alternância juntas | 🟡 `advanced` (precisa orquestrar os três) |

---

## 3. Os 5 níveis por modo

> Exemplos usam **somente atributos que existem** no jogo: cores (azul, verde, roxo, laranja,
> vermelho, cinza, amarelo, rosa) e acessórios (fone, óculos, óculos-escuros, microfone, capuz,
> mochila, boné, **gorro**, tablet, laço, cesta, skate, raquete, viseira).
> ⚠️ "luva", "bota" e "capacete" dos rascunhos **não existem** — foram trocados por atributos reais.

### Modo 1 — Foco (atenção seletiva)
| Nível | Regra | Agentes | Movimento | Exemplo |
|-------|-------|---------|-----------|---------|
| 1 | 1 atributo | 4–6 | lento | Capture os agentes **amarelos**. |
| 2 | 2 atributos | 6–8 | lento | Capture os **amarelos com gorro**. |
| 3 | 2 atributos + distratores parecidos | 8–10 | médio | Capture os **amarelos com gorro** (há amarelos sem gorro). |
| 4 | 3 atributos | 10–12 | médio | Capture os **azuis com fone e óculos escuros**. |
| 5 | 3 atributos + tempo curto | 12–15 | rápido | Capture todos os **amarelos com gorro** — antes do tempo! |

### Modo 2 — Inibição (controle inibitório)
| Nível | Regra | Proibidos | Exemplo |
|-------|-------|-----------|---------|
| 1 | capturar X, não Y | poucos | Capture os **azuis**. Não capture os **vermelhos**. |
| 2 | alvo + exceção simples | médio | Capture os **amarelos**, exceto os **com gorro**. |
| 3 | alvo + exceção parecida | médio | Capture os **com fone**, exceto os **azuis**. |
| 4 | duas exceções | alto | Capture os **vermelhos**, exceto os **com fone ou óculos**. |
| 5 | exceção + tempo curto | alto | Capture todos os **amarelos**, menos os **com gorro** — antes do tempo! |

### Modo 3 — Alternância (flexibilidade cognitiva)
| Nível | Trocas | Aviso | Exemplo |
|-------|--------|-------|---------|
| 1 | 1 troca | aviso longo | Capture os **amarelos**. Depois: os **azuis**. |
| 2 | 1 troca | aviso curto | Capture os **com gorro**. Depois: os **com fone**. |
| 3 | 2 trocas | aviso curto | **vermelhos** → **com fone** → **amarelos**. |
| 4 | 2–3 trocas | sem pausa longa | **azuis com gorro** → **vermelhos sem fone**. |
| 5 | regra condicional | — (fase 2) | Se o fundo for roxo, capture amarelos; se azul, capture os com viseira. |

### Modo 4 — Desafio Executivo (combinação)
| Nível | Combinação | Exemplo |
|-------|-----------|---------|
| 1 | seletiva + inibição simples | Capture os **amarelos**, exceto os **com gorro**. |
| 2 | seletiva + troca de regra | Capture o **azul com fone**. Depois: o **vermelho com óculos**. |
| 3 | inibição + troca de regra | **amarelos exceto com óculos** → **azuis exceto com gorro**. |
| 4 | os três juntos | **vermelho com fone** → **amarelos exceto com mochila** → **os com skate**. |
| 5 | os três + tempo + distratores | Regra muda a cada ~8s, com exceções e múltiplos distratores. |

---

## 4. Tela de configuração do terapeuta

Aparece na **prescrição do plano** (editável pelo terapeuta) e como **confirmação** antes de iniciar (read-only para o paciente — D6).

```
Exercício: Focus Agentes

Função cognitiva:   ( ) Foco  ( ) Inibição  ( ) Alternância  ( ) Desafio Executivo ⚠️avançado
Nível inicial:      ( ) 1  ( ) 2  ( ) 3  ( ) 4  ( ) 5      (o jogo ainda adapta — D1)
Tempo:              ( ) 1 min  ( ) 3 min  ( ) 5 min        (relógio só nos níveis 4–5 — D5)
Comando visível:    ( ) Sempre  ( ) Some após iniciar  ( ) Botão "ver comando"
Feedback:           ( ) Leve  ( ) Normal  ( ) Intenso
```

**Persistência:** guardar a config dentro do JSON `exercises` do `TrainingPlan` (sem migração de
banco — campo já existe como string JSON). Ex.: `{ "id":"focus-agents", "mode":"foco",
"startLevel":2, "time":3, "command":"fade", "feedback":"normal" }`.

---

## 5. Feedback (configurável: leve / normal / intenso)

| Evento | Leve | Normal | Intenso |
|--------|------|--------|---------|
| **Acerto** | brilho sutil | brilho + som curto + pontos | brilho forte + som + pontos + partícula |
| **Erro** | escurece levemente | vibração visual + som | vibração + flash + penalidade |
| **Penalidade do erro** | só visual | −pontos | −pontos e/ou −tempo (níveis com relógio) |

- Som: arquivos curtos de acerto/erro (a adicionar — hoje só existe TTS).
- Vibração: `navigator.vibrate` (celular).
- Pontos: placar visível durante a sessão.

**Loop do jogo:** comando (verbal/visual) → busca dinâmica na arena → discriminação por atributos →
captura de todos os alvos → feedback → próxima rodada → progressão (adaptação dentro do modo).

---

## 6. O que reaproveita × o que é novo

**Reaproveita (já pronto):**
- Motor de arena (movimento multidirecional, wrap nas bordas) — feito na v1.10.0.
- Personagens sem card + sombra/brilho + tamanho grande — feito.
- Imagens otimizadas — feito.
- Gerador de comandos (`single`, `negative`, `sequence`, `advanced`) — boa base.
- Engine adaptativa.

**Novo (a construir):**
- Conceito de **modo explícito** (4) selecionável + reorganizar o gerador por modo.
- **Capturar todos da categoria** (go/no-go) — hoje é alvo único.
- **5 níveis calibrados** por modo (parâmetros: nº de agentes, velocidade, atributos, exceções, trocas).
- **Tela de config do terapeuta** (na prescrição) + **confirmação do paciente** + persistência no plano.
- **Tempo/pressão por rodada** nos níveis 4–5.
- **Feedback configurável** (leve/normal/intenso) + sons + vibração + placar.
- **Modo 3 N5** — regra condicional por cor de fundo (fase 2).
- **Aviso de pré-requisito** do Modo 4.

---

## 7. Plano de implementação por fases

> Cada fase é um deploy testável. Ordem do menor risco/maior valor para o mais sofisticado.

- **Fase 1 — Fundação dos modos** 🧱
  Reorganizar o gerador de comandos em 4 modos explícitos; implementar "capturar todos da
  categoria"; 5 níveis com parâmetros por modo. (Coração do jogo.)

- **Fase 2 — Configuração clínica** 🩺
  Tela de config na prescrição + persistência no plano; tela de confirmação do paciente
  (read-only); nível inicial + adaptação dentro do modo.

- **Fase 3 — Feedback & tempo** ✨
  Feedback configurável (leve/normal/intenso), sons, vibração, placar visível, relógio por
  rodada nos níveis 4–5.

- **Fase 4 — Avançado** 🧠
  Regra condicional por cor de fundo (Modo 3/4 N5); aviso de pré-requisito do Modo 4.

---

## 8. Pontos em aberto / fase 2

- Sons de acerto/erro: precisam ser escolhidos/gerados (assets).
- Modo "auditivo" atual (`focus-agents-auditivo`): integrar com a opção "Comando visível".
- Calibração fina dos 5 níveis (nº exato de agentes/velocidade) — ajustável após teste clínico.
