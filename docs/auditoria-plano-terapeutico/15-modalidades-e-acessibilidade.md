# 15 — Modalidades × leitura assistiva (auditoria)

> Apenas leitura. Nada implementado. **Os dois conceitos estão misturados hoje** — inclusive na
> auditoria anterior, que contou modo auditivo como exercício separado.

## A distinção, e por que ela é estrutural

| | **Modalidade** | **Leitura assistiva** |
|---|---|---|
| O que é | forma de apresentação da TAREFA | recurso de acessibilidade |
| Muda o construto? | **sim** | **não** |
| Entra na carga? | sim | não |
| Entra na progressão? | sim | não deveria |
| Quem escolhe | terapeuta, na prescrição | paciente, durante a atividade |
| Exemplo | Supermercado só-áudio: a lista **tem** que ser memorizada de ouvido | o botão lê a instrução visível na tela |

## 0. REGRA FECHADA (decisão clínica dela, 02/ago/2026)

O seletor **visual · visual+áudio · só áudio** é exclusivo de **cinco** exercícios:

| # | Exercício | Situação |
|---|---|---|
| 1 | Restaurante | já tem |
| 2 | Supermercado | já tem |
| 3 | Caminhos para a Meta | já tem |
| 4 | **Agentes Focus** | **aprovado — falta implementar** |
| 5 | **Compra Multifuncional** | **aprovado — falta implementar** |

**Nenhum outro exercício recebe o seletor sem nova decisão clínica explícita.**

### Os dois spans NÃO têm modalidade configurável

`span-numerico` e `span-numerico-inverso` são **auditivos por definição** — o áudio é intrínseco e
obrigatório à mecânica. Classificação correta:

| Atributo | Valor |
|---|---|
| Modalidade configurável | **não** |
| Canal sensorial intrínseco | **auditivo** |
| Áudio intrínseco à tarefa | **sim** |
| Leitura assistiva | apenas para textos instrucionais, **separada** do áudio dos números |

Não propor versão visual nem visual+áudio, e **não documentá-los como "só visual"** (erro da versão
anterior deste documento, corrigido).

**Fato técnico levantado no código, para constar:** o número é reproduzido por **áudio gravado**
(`/exercises/audio/numeros/*.m4a`) e, desde o redesign de julho (v2.27), **a tecla correspondente
acende em sincronia com a fala** — um realce visual do estímulo auditivo, aprovado por ela na época.
O áudio segue sendo o canal da tarefa; o realce não mostra o número, só ilumina a tecla. Se a
intenção clínica for retenção auditiva **pura**, esse realce merece uma decisão à parte.

## 1. Modalidade — situação atual

O componente existe: `components/exercises/PresentationConfig.tsx`, com três modos —
`visual` · `visual_audio` · `audio_only` — na tela "Configurar atividade", escolhida **antes** de
iniciar (nunca toca áudio sozinho).

**Quem usa hoje (3):**

| Exercício | Modos | Observação |
|---|---|---|
| Restaurante (`restaurante-ordem`) | visual · visual+áudio · só áudio | confirmado no código |
| Supermercado (`desafio-supermercado`) | visual · visual+áudio · só áudio | confirmado no código |
| Caminhos para a Meta (`antes-depois`) | idem | usa `PresentationConfig`, não aparecia na sua lista |

**Aprovados e ainda não implementados (2):** Agentes Focus e Compra Multifuncional (§0).
Agentes Focus ainda não oferece o seletor — ou seja, a modalidade auditiva aprovada ainda está
ausente na tela.

### Efeito de mudar a modalidade, por exercício

| Exercício | Construto muda? | Carga | Memória operacional | Leitura | Auditivo | Progressão |
|---|---|---|---|---|---|---|
| Restaurante | **sim** — de leitura funcional para retenção auditiva | +1 no só-áudio | sobe muito no só-áudio | some | central | **deveria ser separada por modo** |
| Supermercado | **sim** — idem | +1 no só-áudio | sobe muito | some | central | idem |
| Caminhos para a Meta | parcial — o enunciado é o mesmo, muda o canal | +0/+1 | igual | some no só-áudio | moderado | pode ser compartilhada |
| Agentes Focus (aprovado) | **sim** — comando ouvido exige reter a regra sem apoio visual | +1 | sobe | — | central | **separada** |
| Compra Multifuncional (aprovado) | **sim** — a situação passa a ser ouvida | +1 | sobe | some | central | **separada** |

⚠️ **Não tratar "visual + áudio" como automaticamente mais difícil.** Para paciente com dificuldade
de leitura, o áudio **reduz** carga; para paciente com dificuldade auditiva ou distratibilidade, o
áudio **soma** interferência. O modo redundante (visual+áudio) é, para a maioria, o **mais fácil**
dos três — e o só-áudio, o mais difícil.

## 2. Leitura assistiva — situação atual

**Mecanismo:** `lib/tts.ts`. Primeiro tenta **áudio pré-gravado** (`TTS_MANIFEST` →
`/exercises/audio/tts/*.mp3`); se a frase não estiver no manifesto, cai para **Web Speech API**
(`speechSynthesis`). Há `cancelTTS()` que pausa o áudio corrente e chama `speechSynthesis.cancel()`.

**Onde existe hoje (3 exercícios):** Agentes Focus, Informação em Foco, Caminhos para a Meta.

| Pergunta da auditoria | Resposta |
|---|---|
| Que textos lê | o comando/pergunta da rodada — não as instruções nem as alternativas |
| Mecanismo | áudio gravado com fallback para `speechSynthesis` |
| Pode repetir | sim, sem limite |
| Há limitação | **não** |
| Uso é registrado | **não** |
| Interfere na progressão | **não** |
| Aparece em exercício sem texto | não |
| Continua ao trocar de tela | há `cancelTTS()` no desmonte dos três |
| Sobreposição de áudios | `playTTS` para o áudio anterior antes de iniciar; risco baixo |
| Clicar várias vezes | permitido; reinicia a fala |
| Componente global ou duplicado | **duplicado** — cada exercício monta o próprio botão |

### Exercícios com texto relevante e SEM leitura assistiva

Todos os de enunciado escrito: Compra Multifuncional, Ordem da História, Investigadores da Situação
Social, Grade Dedutiva, Certo ou Errado, Lista com Distração, Restaurante e Supermercado (nos modos
com texto), além das telas de instrução de praticamente todos os 34.

## 3. Proposta futura (não implementar agora)

**Componente global de leitura assistiva**, montado pelo `ExerciseWrapper`, com contrato único:

```ts
<LeituraAssistiva textos={{ instrucao, comando, alternativas, feedback }} />
```

- um só botão, sempre no mesmo lugar da tela, em todos os exercícios com texto;
- lê o que estiver visível **no momento**, na ordem em que aparece;
- `cancelTTS()` automático na troca de fase e no desmonte;
- **registrado** como uso de acessibilidade (`assistiveReads`), **fora** do cálculo de progressão;
- nunca disponível quando o exercício está em modo `audio_only` (ali o áudio **é** a tarefa —
  liberar leitura assistiva destruiria a medida).

## 4. Riscos

- **Cognitivo:** transformar leitura assistiva em muleta silenciosa. Se o paciente ouve o enunciado
  toda vez e isso não é registrado, o terapeuta não sabe que a leitura funcional não está sendo
  treinada. Daí registrar sem penalizar.
- **Cognitivo:** liberar leitura assistiva em modo só-áudio anula o exercício.
- **Técnico:** fallback do `speechSynthesis` depende da voz do aparelho — qualidade e velocidade
  variam entre dispositivos, e isso muda a dificuldade de um exercício auditivo sem ninguém saber.
- **Técnico:** botão duplicado em cada exercício significa comportamento divergente (uns cancelam ao
  sair, outros não).

## 5. Decisões clínicas pendentes

1. **Modalidade vira campo de prescrição?** Se sim, `restaurante-ordem` no modo só-áudio e no modo
   visual precisam de **progressão separada** — são construtos diferentes, e hoje compartilham nível.
   ⚠️ Esta é a pergunta que sobra depois da decisão de 02/ago, e vale para os cinco.
2. ✅ ~~Focus e Compra recebem seletor?~~ **DECIDIDO em 02/ago: sim.** Falta implementar.
3. **O realce visual sincronizado dos spans** (tecla que acende com a fala) fica ou sai, se a
   intenção for retenção auditiva pura?
3. **Leitura assistiva conta como ajuda?** Recomendo registrar e mostrar ao terapeuta, sem afetar
   progressão.
4. **Voz do aparelho ou banco de áudio para tudo?** Hoje é misto; para exercício auditivo de verdade,
   voz gravada é o único caminho reprodutível.
