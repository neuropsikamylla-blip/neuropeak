# SPEC — Ritmo, cursor e identidade das etapas no tutorial do Span

> Retorno dela da 1ª validação visual (06/ago/2026): **a arquitetura funciona, a experiência não**.
> O problema não é técnico — é de UX e pedagogia. O Span Direto **não** está aprovado como padrão,
> e nenhum outro exercício deve ser convertido.
>
> ⚠️ Ela validou a **v2.77.1**, que não tem o cursor (ficou em commit local). O trabalho abaixo
> junta a calibração pedida com a demonstração de cliques ainda não publicada.

## 0. Regras inegociáveis

⛔ **NÃO** converter o Span Inverso nem qualquer outro exercício.
⛔ **NÃO** alterar mecânica clínica, progressão, pontuação ou qualquer métrica.
⛔ **NÃO** criar `Session`. **NÃO** tocar no banco.
⛔ **NÃO** exibir a sequência escrita durante a escuta.
⛔ **NÃO** usar emoji (decisão congelada 2). Ícones do `lucide-react`.
⛔ **NÃO** alterar a `GuidedAttempt` na sua lógica de resposta — só o que a spec disser.

## 1. O princípio que governa tudo

**A demonstração deve parecer uma pessoa ensinando** — não uma animação eficiente. Uma pessoa
ensinando pausa antes de começar, move a mão devagar, mira antes de tocar, mantém o dedo na tecla, e
espera o efeito aparecer antes de seguir. Todo valor abaixo vem daí.

## 2. Três etapas com identidade própria (pontos 5 e 6)

O paciente precisa perceber, sem ler nada, em qual etapa está. Cada uma ganha um **cabeçalho de
etapa** no topo do cartão: um selo curto e uma cor própria.

| etapa | selo | cor de acento | quem age |
|---|---|---|---|
| Demonstração | `DEMONSTRAÇÃO` | índigo/azul (o mesmo `#4F8FEA` da família do exercício) | o sistema |
| Tentativa guiada | `SUA VEZ` | teal/verde, distinto do azul | o paciente |
| Treino | *(sem selo — é o exercício)* | — | o paciente |

- O selo é **texto em caixa alta, pequeno, com um traço de cor** — discreto, nunca decorativo.
- O acento aparece também numa **borda superior** do cartão (3-4 px), para que a mudança de etapa
  seja perceptível pela cor mesmo sem ler o selo.
- Nos três temas (CLINICAL, COLORFUL, GAMIFIED), respeitando a paleta já existente.

## 3. Telas de transição (pontos 1 e 5)

Hoje as etapas emendam e o paciente não percebe a troca. Duas telas novas, ambas em `TutorialRunner`:

### 3.1 Antes da demonstração — nova fase `"intro"`

```
selo:      DEMONSTRAÇÃO
título:    Observe como responder
subtítulo: Você vai ver a tarefa sendo feita do início ao fim.
botão:     Ver demonstração
```

- É a **primeira** fase do runner (antes de `"demo"`).
- **Com botão**, não temporizada: quem decide quando começar é o paciente. Isso evita que a
  demonstração comece enquanto ele ainda está lendo — que é exatamente a queixa 1.

### 3.2 Entre demonstração e guiada — nova fase `"handoff"`

```
selo:      SUA VEZ
título:    Agora é sua vez
subtítulo: Ouça a sequência e responda no teclado.
botão:     Começar
```

- Entra **depois** da demonstração terminar e **antes** da `GuidedAttempt` montar.
- Também com botão: o paciente precisa perceber que a responsabilidade passou para ele.
- ⚠️ A `GuidedAttempt` só deve **montar** quando esta tela for confirmada — se montar antes, o áudio
  começa a tocar por trás da tela de transição.

### 3.3 O texto "Agora é sua vez" sai da fase `"guided"`

Hoje ele aparece como subtítulo da guiada e se perde. Passa a ser a tela 3.2. Na fase `"guided"`, o
cabeçalho mostra o selo `SUA VEZ` e uma instrução curta de ação.

## 4. O cursor precisa ser visto (ponto 2)

`DemoPointer` — revisar:

| propriedade | hoje | novo |
|---|---|---|
| tamanho | 28 px | **44 px** |
| cor | `#315F88` | traço escuro (`#1F3D5C`) com **preenchimento branco** e contorno visível |
| sombra | `drop-shadow-md` | sombra mais densa, para destacar sobre o teclado claro |
| halo | não tem | **anel suave** atrás do cursor, ~2× o tamanho, opacidade baixa |
| permanência | some entre alvos | **permanece visível durante toda a fase de resposta** |
| entrada | aparece já movendo | **aparece parado, com um pulso de 600 ms**, para o paciente localizá-lo |

- O cursor **nunca desaparece** entre um dígito e outro: ele desliza de tecla em tecla.
- No `"pressing"`, além de encolher, o **halo contrai junto** — reforça o gesto.
- Continua `aria-hidden` e `pointer-events: none`.
- ⚠️ Deve ser **perceptível sem competir com a tarefa**: o destaque vem de contorno e halo, não de
  cor berrante nem de animação contínua.

## 5. O clique precisa parecer um clique (ponto 3)

Além do `scale(0.95)` que já existe, o momento do toque ganha:

- **Onda de toque (ripple)**: um círculo que nasce no centro da tecla e se expande com opacidade
  decrescente, ~400 ms — o sinal universal de "algo foi tocado aqui".
- **Permanência**: a tecla fica pressionada por um tempo claramente perceptível (§6), não um piscar.
- **Ordem preservada**, agora com respiro entre os passos: desloca → mira → pressiona → permanece →
  solta → **pausa** → a bolinha preenche.
- A bolinha que preenche deve ter um **realce breve** ao acender (leve escala), para que o paciente
  ligue o clique ao seu efeito. É o ponto pedagógico central: **o preenchimento é consequência**.

O ripple pode viver no `DemoPointer` (posicionado no alvo) para não poluir o `NumberPad` — decida
pelo que ficar mais simples, desde que o `NumberPad` do treino não mude de comportamento.

## 6. Calibração dos tempos (ponto 4)

Valores novos, pensados como "pessoa ensinando". **Todos como constantes nomeadas no topo do
arquivo**, nunca espalhados.

| momento | hoje | novo | por quê |
|---|---|---|---|
| pausa após a escuta, antes do cursor | 0 | **1400 ms** | o paciente registra que a fala acabou |
| entrada do cursor (pulso de localização) | 0 | **600 ms** | ele precisa achar o cursor antes de segui-lo |
| deslocamento até a tecla | 450 ms | **800 ms** | movimento de mão, não de máquina |
| mira sobre a tecla, antes de pressionar | 0 | **250 ms** | a pessoa para antes de tocar |
| tempo pressionado | 180 ms | **500 ms** | um toque que se vê |
| após soltar, antes da bolinha | 140 ms | **300 ms** | separa causa de efeito |
| bolinha acesa, antes do próximo | 220 ms | **700 ms** | o paciente vê o resultado |
| pausa após o último clique | 0 | **1200 ms** | fecha a demonstração |

Para 2 dígitos, a fase de resposta passa a durar ~8 s. **É para ser lento** — é uma aula.

## 7. Testes obrigatórios

Vitest `environment: node` — **não importar `.tsx`**; verificação estática do fonte.

1. As constantes de tempo existem com os valores da §6 e são nomeadas.
2. `TutorialRunner` tem as fases `"intro"` e `"handoff"`, nesta ordem no fluxo.
3. A `GuidedAttempt` só é renderizada na fase `"guided"` — nunca durante `"handoff"`.
4. Cada etapa declara selo e cor de acento próprios.
5. `DemoPointer`: tamanho 44, halo presente, sem emoji, `aria-hidden`, `pointer-events: none`.
6. O cursor não é desmontado entre dígitos (o seletor muda, o componente permanece).
7. A ordem do gesto continua estrita, com a pausa nova entre soltar e preencher.
8. `NumberPad` segue sem mudança de comportamento para o treino (props opcionais).
9. Nenhum termo clínico proibido no framework do tutorial.
10. Nenhum emoji em nenhum arquivo do framework.
11. Suíte inteira verde — **560/560 é o piso**.

## 8. Gates

`prisma validate` · `prisma generate` · `npx tsc --noEmit` · `npm run test` · `npm run build` · `lint`
sem warning novo nos arquivos tocados.

## 9. Fora de escopo

Converter exercício · alterar mecânica ou progressão · tocar no banco · declarar o Span como padrão
da T1 (só ela decide, após a 2ª validação visual).
