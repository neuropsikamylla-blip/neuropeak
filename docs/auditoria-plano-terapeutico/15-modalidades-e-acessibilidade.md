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

**Deveriam ter, por decisão clínica (2):** Focus Agentes e Compra Multifuncional.
Hoje o `focus-agents-auditivo` existe como **id herdado** (alias) mas o exercício **não** oferece o
seletor — ou seja, a modalidade auditiva do Focus está prometida no id e ausente na tela.

### Efeito de mudar a modalidade, por exercício

| Exercício | Construto muda? | Carga | Memória operacional | Leitura | Auditivo | Progressão |
|---|---|---|---|---|---|---|
| Restaurante | **sim** — de leitura funcional para retenção auditiva | +1 no só-áudio | sobe muito no só-áudio | some | central | **deveria ser separada por modo** |
| Supermercado | **sim** — idem | +1 no só-áudio | sobe muito | some | central | idem |
| Caminhos para a Meta | parcial — o enunciado é o mesmo, muda o canal | +0/+1 | igual | some no só-áudio | moderado | pode ser compartilhada |
| Focus Agentes (proposto) | **sim** — comando ouvido exige reter a regra sem apoio visual | +1 | sobe | — | central | **separada** |
| Compra Multifuncional (proposto) | **sim** — a situação passa a ser ouvida | +1 | sobe | some | central | **separada** |

⚠️ **Não tratar "visual + áudio" como automaticamente mais difícil.** Para paciente com dificuldade
de leitura, o áudio **reduz** carga; para paciente com dificuldade auditiva ou distratibilidade, o
áudio **soma** interferência. O modo redundante (visual+áudio) é, para a maioria, o **mais fácil**
dos três — e o só-áudio, o mais difícil.

## 2. Leitura assistiva — situação atual

**Mecanismo:** `lib/tts.ts`. Primeiro tenta **áudio pré-gravado** (`TTS_MANIFEST` →
`/exercises/audio/tts/*.mp3`); se a frase não estiver no manifesto, cai para **Web Speech API**
(`speechSynthesis`). Há `cancelTTS()` que pausa o áudio corrente e chama `speechSynthesis.cancel()`.

**Onde existe hoje (3 exercícios):** Focus Agentes, Informação em Foco, Caminhos para a Meta.

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
2. **Focus e Compra recebem seletor de modalidade?** O id auditivo do Focus já existe e promete algo
   que a tela não entrega.
3. **Leitura assistiva conta como ajuda?** Recomendo registrar e mostrar ao terapeuta, sem afetar
   progressão.
4. **Voz do aparelho ou banco de áudio para tudo?** Hoje é misto; para exercício auditivo de verdade,
   voz gravada é o único caminho reprodutível.
