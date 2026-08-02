# Focus Agentes — MODO ÚNICO (decisão da Kamylla, 02/ago/2026)

## O que muda e por quê

O exercício deixa de ter **quatro modos escolhidos pelo terapeuta** (foco · inibição ·
alternância · desafio) e passa a ser **um só**, com os tipos de comando entrando pela
progressão de dificuldade.

**Fato que motivou a decisão (medido no código em 02/ago):** o `mode` já era decorativo.
Em `FocusAgents.tsx` ele aparecia em 4 lugares — lido de `settings.mode`, gravado no metadata e
exibido no relatório — e **não entrava na geração da rodada**. Quem decidia o que aparecia na tela
era a *etapa* do comando. O terapeuta escolhia "Inibição" e o paciente recebia a mesma escada.
Tirar o seletor não remove função: remove uma promessa que a interface fazia e o motor não cumpria.

Nas palavras dela: *"eu já havia me esquecido das outras propostas exatamente por isso o modo tem
de ser único"*.

## A escada (13 passos)

Regra de desenho, a pedido dela (*"é um treino, então a progressão precisa ser razoável, nem
difícil demais de cara nem manter a facilidade, senão o paciente perde o engajamento"*):
**uma variável nova por passo**, e cada tipo de comando dura ~2 passos antes de dar lugar ao
próximo — tempo de consolidar sem virar repetição.

| Passo | Comando | Agentes na cena | Função treinada |
|---|---|---|---|
| 1–2 | uma cor ("ache o agente amarelo") | 7–8 | atenção seletiva |
| 3 | um acessório ("ache o de óculos") | 8 | atenção seletiva (outro atributo) |
| 4–5 | cor **+** acessório ("o azul de boné") | 8–9 | seletiva com 2 pistas |
| 6 | cor + acessório com **distratores semelhantes** | 10 | discriminação fina |
| 7–8 | **dois alvos** ("o azul de boné **e** o vermelho de gorro") | 9–10 | memória de trabalho |
| 9–10 | **mudança de regra** ("ache o azul… não, o amarelo") | 9–10 | flexibilidade |
| 11–13 | **inibição** ("todos os vermelhos, **menos** o de óculos") | 10–12 | controle inibitório |

**Por que flexibilidade antes de inibição:** inibir uma resposta já preparada é mais custoso que
trocar de critério, e a mudança de regra prepara o terreno — o paciente aprende a soltar um
critério antes de precisar suprimir uma ação.

**Lateralidade** ("a bola do lado direito") deixa de ser degrau próprio e vira **variação dentro
dos passos 4+**: é dificuldade perceptiva, não tipo de comando.

## Relatório do profissional

Sai o desempenho **por modo** ("Foco: 82% · Inibição: 61%") e entra o desempenho **por função
cognitiva**, derivado do passo em que cada rodada aconteceu:

```
Atenção seletiva      88%   (passos 1–6)
Memória de trabalho   71%   (passos 7–8)
Flexibilidade         54%   (passos 9–10)   ← travou aqui
Controle inibitório   sem dados ainda
```

Sessões antigas mantêm o `mode` gravado; nada se perde no banco, muda a leitura daqui em diante.

## Fundo da arena

De gradiente **navy escuro** (`#0a1628 → #0d2244 → #081020`) para **`#F3F6F9`** com borda
`#DDE3EC`.

**Motivo medido, não estético:** o agente **azul** (`#2563eb`) contra o marinho quase se camufla.
Num exercício em que a COR é o critério do comando, isso vira viés — "ache o azul" fica
sistematicamente mais difícil que "ache o amarelo" por causa do fundo, não da tarefa. Comparação
visual das 6 cores nos três fundos foi feita antes da decisão: no claro, todas as seis ficam
nítidas (o receio com o amarelo não se confirmou — o boneco tem contorno, cabelo escuro e calça
marinho que sustentam a silhueta).

⚠️ A barra de comando e os textos são brancos sobre escuro: **precisam inverter no mesmo passo**,
senão o comando some.

## Chuva de Agentes — removida

`components/exercises/attention/FocusRain.tsx` (1.056 linhas) estava **órfã**: nenhum arquivo a
importava desde a reformulação de 31/jul. A lógica útil dela — comando com **N sub-regras sem
sobreposição** (nenhum alvo bate a regra de outro, fragmentos distintos, fallback gracioso) — é
aproveitada no gerador atual antes da remoção.
