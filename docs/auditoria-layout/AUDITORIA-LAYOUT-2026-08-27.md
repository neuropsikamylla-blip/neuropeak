# Auditoria de layout dos exercícios — 27/ago/2026

> Pedido dela: *"queria que a distribuição deles na tela fosse centralizada e espaçada em
> tamanho para ficar algo elegante e bonito"*. Oito capturas anexadas (MOT, Matriz com
> Rotações, Labirinto, Cubo Corsi, Jogo das Torres, Grade Dedutiva).

## Resumo em uma frase

Não são 33 problemas de estética independentes: são **três defeitos estruturais** que se
repetem, mais **um bug funcional no MOT**. A correção é de arquitetura, não de retoque.

---

## Defeito 1 — `min-h-screen` empilhado (a causa da tela colada no topo)

Duas camadas reivindicam a altura da tela inteira ao mesmo tempo:

| camada | arquivo | classe |
|---|---|---|
| wrapper | `components/exercises/ExerciseWrapper.tsx:174` | `min-h-screen p-4 flex items-center justify-center` |
| exercício | cada componente | `min-h-screen ...` (28 dos 35 arquivos) |

O filho já mede 100vh, então o `items-center` do pai **não tem folga para centralizar** —
ele centraliza um bloco que já ocupa tudo. O `p-4` do pai soma 32px por fora, e é por isso
que **toda tela de exercício rola ~32px** e aparece aquela faixa escura no topo das capturas:
é o fundo do tema vazando por baixo do fundo próprio do exercício.

## Defeito 2 — cada exercício inventa a própria largura

Nenhuma escala compartilhada. Doze valores diferentes em uso:

`max-w-xs`(320) · `max-w-sm`(384) · `max-w-md`(448) · `max-w-lg`(512) · `max-w-xl`(576) ·
`max-w-2xl`(672) · `[300px]` · `[380px]` · `[560px]` · `[600px]` · `[760px]` · `[1120px]` ·
`[1180px]` · `[1480px]` — e ainda `maxWidth: 440/460/500/540` em CSS inline.

Numa tela de 1900px, a **Grade Dedutiva** (`max-w-sm`) usa 20% da largura e o
**Estacionamento** (`max-w-xs`) usa 17%. É exatamente a captura 8: um cartãozinho no alto
de um deserto bege.

## Defeito 3 — três dialetos de layout convivendo

| família | quantos | comportamento | exercícios |
|---|---|---|---|
| **A. cola no topo** | 21 | `flex flex-col items-center` sem `justify-center`, ou `overflow-y-auto` + `mx-auto` | MOT, Torre de Hanói, Labirinto, Grade Dedutiva, Trilha Visual, Jogo da Memória, Matriz Espacial, Busca Rápida, Mudança de Regras, Dupla Tarefa, Informação em Foco, Compra Multifuncional, Desafio Cidade, Desafio Orçamento, Task Switching, Investigadores, Vigilância, Certo ou Errado, Semáforo, Tempo de Reação, Caça Item |
| **B. centraliza, mas estreito** | 8 | `items-center justify-center` ✅ com teto de 320–576px | Estacionamento, Stroop, Letras Sequência, Lista c/ Distração, Padrões com Rotação, Sequência de Itens, Span Numérico, Identificação de Símbolos |
| **C. CSS inline próprio** | 6 | `minHeight:"100vh"` + `maxWidth:440..500` em `style=` | Cubo Corsi, Ordem da História, Sequência Temporal, Restaurante, Supermercado, Focus (este usa `fixed inset-0`, caso à parte) |

## Defeito 4 (funcional, não estético) — MOT: as bolas nascem numa arena que já não existe

`components/exercises/attention/MOT.tsx:175-181`

```
useEffect(() => { ...; startRound(0); }, []);   // gera as bolas na montagem
```

`startRound` usa `arenaRef.current`, que é escrito **durante o render**. O
`useLayoutEffect` que mede a tela chama `setDims(...)` — mas isso só agenda um novo render.
Quando `startRound(0)` roda, `dims` ainda é o valor inicial `{w:320}`, e com
`ARENA_SCALE_MIN = 0.55` a arena de nascimento é de **176×116px**. O quadro desenhado na
tela já é o remedido (~1100px).

Resultado exato das capturas 1 e 2: **todas as bolas amontoadas no canto superior esquerdo**
de uma arena enorme e vazia. Não é escolha de design — é uma corrida entre a medição e o
sorteio. Vale para a primeira rodada de toda sessão.

---

## O que NÃO está quebrado (não mexer sem falar com ela)

- **Fundos próprios** de 20 exercícios (bege da Grade Dedutiva, `#020617` da Matriz,
  `#F3F4F6` do Hanói, aquarelas da Compra). Vários foram aprovados por ela em sessões
  anteriores. Unificar tudo ao tema é decisão dela, não consequência técnica.
- **Focus Agentes** (`fixed inset-0`): tela cheia é intencional e funciona.
- **Labirinto**: o tabuleiro já usa a altura disponível; só falta centrar verticalmente.

## Prova de estado

- Levantamento por `grep` sobre os 35 arquivos em `components/exercises/*/`.
- Contagens desta auditoria conferidas em 27/ago/2026, sobre `main` em `113b41f`, v2.90.0.
- ⚠️ **Ainda não rodei nada em navegador.** As capturas são a evidência visual; a leitura de
  código é a evidência da causa. O bug do MOT ainda não tem teste que o trave.

---

## Achado tardio (27/ago, na verificação do lote A) — `TutorialBase` tem o mesmo defeito

`components/exercises/TutorialBase.tsx:123`

```tsx
<div className="relative min-h-screen flex items-center justify-center p-4 overflow-hidden">
```

É o **mesmo `min-h-screen` empilhado** do defeito 1, na tela de tutorial. Como Torre de Hanói
e Grade Dedutiva abrem pelo tutorial, foi por ali que apareceu: ao pedir a tela desses dois,
quem renderiza é o `TutorialBase`, e ele soma uma viewport inteira dentro do wrapper igual
aos exercícios faziam.

Não estava na contagem original porque a auditoria varreu `components/exercises/*/` — e o
`TutorialBase` mora um nível acima, na raiz de `components/exercises/`. **Entra no lote D.**

## Evidência de renderização do lote A (não só de código)

Servidor de desenvolvimento com uma página de preview temporária (não versionada, já
removida), pedindo o HTML de cada exercício:

```
padroes-rotacao   palco=SIM  max-width:960px  background:#020617
cubo-corsi        palco=SIM  max-width:960px  background:#F4F7FB
jogo-memoria      palco=SIM  max-width:960px  background:linear-gradient(160deg, #ede8df…
matriz-espacial   palco=SIM  max-width:960px  background:linear-gradient(160deg, #fbfcff…
torre-hanoi       (abre pelo TutorialBase — ver achado acima)
deductive-grid    (abre pelo TutorialBase — ver achado acima)
```

Árvore renderizada, conferida no HTML:

```html
<div class="absolute inset-0 overflow-auto" style="background:#020617">
  <div class="min-h-full flex items-center justify-center p-4 sm:p-6">
    <div class="w-full" style="max-width:960px"> … </div>
```

Os únicos `min-h-screen` que restam na página vêm do layout raiz do app e do próprio
`ExerciseWrapper` — **nenhum do exercício**. É o estado desejado.

⚠️ **Isto não substitui olhar a tela.** A extensão do Chrome não estava conectada nesta
sessão, então ninguém *viu* as seis telas rodando. O que está provado é a árvore que o
servidor produz, não a aparência final.

---

## Correção da própria auditoria (27/ago, ao preparar o último lote)

Cinco exercícios que a auditoria classificou como "família C — CSS inline próprio" estão, na
verdade, **corretos como estão**. Eles usam `position: fixed; inset: 0` com
`flex: 1; overflow-y: auto` centralizado dentro:

`AntesDepois` · `OrdemHistoria` · `RestauranteOrdem` · `DesafioSupermercado` · `FocusAgents`

`fixed` sai do fluxo, então **não somam altura ao wrapper** — o defeito 1 não os atinge. São
tela cheia por desenho, com o conteúdo já centrado. **Não migrar.** São um segundo padrão
válido, num dialeto diferente do palco, e trocar por trocar só criaria risco de regressão.

Isso reduz o que falta de 14 arquivos para 8.

## Contagem final do trabalho

| situação | quantos |
|---|---|
| migrados ao palco | 19 exercícios (lotes A e D1) |
| já corretos em tela cheia própria, não migrar | 5 |
| telas compartilhadas + fundo dinâmico (lote E) | 6 arquivos |
| restantes (lote F) | 8 arquivos |

---

# Verificação de execução — 28/ago/2026

As 36 telas foram **executadas de verdade** num Chrome headless (o do sistema, dirigido por
`puppeteer-core` instalado fora do projeto), não apenas conferidas por leitura de código.
Cada tela: carregada, esperada assentar 2,6s, e observada quanto a erro de página, erro de
console, requisição falhada, tela vazia e rolagem da página.

```
36/36 sem erro          rolagem vertical: 0px em todas
                        rolagem horizontal: 0px em todas
```

A rolagem zero é a prova direta de que o **defeito 1 morreu**: era exatamente ela — os 32px
de sobra — o sintoma do `min-h-screen` empilhado.

Provas de bancada no mesmo dia: `npx tsc --noEmit` exit 0 · `npm run lint` 0 erros
(9 warnings pré-existentes, nenhum novo) · `npm run test` 749/749 · `npm run build` exit 0.

## Dois achados ADJACENTES — fora do escopo desta tarefa, decisão dela

**1. "Como jogar" sobreviveu em 13 telas.** Em 10/ago/2026 ela pediu a troca por *"Como
realizar o exercício"* — "é atividade clínica, e o título precisa dizer isso ao paciente".
A troca entrou só no `TutorialRunner` (os tutoriais T1). O texto antigo continua em:

- `components/exercises/TutorialBase.tsx:138` — serve **12 exercícios**
- `components/exercises/attention/InformacaoEmFoco.tsx:188`

Correção de duas linhas, mas é mudança de conteúdo, não de layout. **Não fiz sem ela pedir.**

**2. A base dos pinos do tutorial da Torre de Hanói transborda.** Cada base tem `maxW + 16`
= 156px fixos (`TorreHanoi.tsx:73,90`), e três delas não cabem no painel — as bases se
encostam e formam uma faixa marrom contínua que atravessa os dois painéis.

**Não é regressão da migração**, e isto foi medido, não deduzido: forçando o card de volta à
largura antiga (`max-w-md`, 448px) num navegador, o transbordo fica **pior** — os discos
saem dos painéis. O card maior do palco melhorou o sintoma sem curá-lo. A cura é a base
deixar de ser fixa em 156px, e isso é conserto do tutorial do Hanói, não desta tarefa.
