# 05 — Proposta de interface (sem implementar)

> Proposta do VP para discussão. A interface segue **clínica, discreta e profissional** — sem
> gamificação, sem cor comemorativa, sem ícone decorativo novo.

## Princípio

O card deve responder **três perguntas em um olhar**: quanto tempo isso ocupa, quanto pesa, e o que
está configurado. Tudo o mais fica atrás do "Ajustar".

## Card do exercício — estrutura proposta

```
┌──────────────────────────────────────────────┐
│ 🧠 Cubos                             ⋮  ✕     │
│ Memória · bloco                              │
│                                              │
│ 6 min · carga 2 · 8 séries        [Ajustar]  │
│ Retoma do nível 7 (último do paciente)       │
└──────────────────────────────────────────────┘
```

Linha 1: nome + ações (mover, remover). Linha 2: domínio + **modelo de execução** em texto discreto.
Linha 3: **duração · carga · dose**, e o botão. Linha 4: **retomada** — só quando há progresso.

### Como mostrar a duração (o "~7 min" morre aqui)

| Situação | Texto |
|---|---|
| Contínuo, não configurado | `4–8 min (recomendado 5)` |
| Contínuo, configurado | `5 min` |
| Planejamento | `até 12 min` |
| Fechado/alta fadiga | `duração fixa: 4 min` |
| Bloco/protocolo | `aprox. 5–7 min · 8 séries` |

A diferença entre "recomendado" e "prescrito" precisa ser visível: prescrito em peso normal,
recomendado em cinza.

### Como mostrar a carga

Texto — `carga 2` — e não estrelas, barras ou cor. Cor só no alerta, e mesmo assim discreta
(âmbar para atenção, nunca vermelho de erro). Ao passar o mouse: os eixos que compõem a carga
("interferência alta · memória operacional moderada").

### Como mostrar o nível e a retomada

**Retirar o seletor numérico de "Nível inicial" do fluxo normal.** Ele só faz sentido em duas
situações: primeira prescrição e reavaliação. Proposta:

- Sem histórico → `Começa no nível 1` + link discreto "Definir outro ponto de partida".
- Com histórico → `Retoma do nível 7 (último do paciente)`, sem controle nenhum ao lado.
- Redefinir → ação explícita, com confirmação que diz o que acontece com o histórico
  (**nunca apagar sem confirmação**).

Sobre **rótulos ("muito fácil…muito difícil") no lugar de números**: recomendo **não trocar agora**.
Vantagem: o terapeuta não precisa saber que o Focus vai a 13 e o Supermercado a 12. Limitação séria:
os exercícios têm tetos diferentes (10, 12, 13) e escalas de significado diferentes — "médio" no
Corsi (span 5) não é comparável a "médio" no Stroop. Um rótulo esconde essa diferença e cria falsa
equivalência entre exercícios. **Recomendação: manter número, mas mostrar o teto** (`nível 7 de 13`),
que resolve o problema real (o terapeuta não sabe onde 7 fica na escala).

## Painel da sessão (coluna direita)

```
┌──────────────────────────────────────────────┐
│ Sessão prescrita     [30] min   [3] ×/semana │
│                                              │
│ 5 exercícios · 28–34 min · carga 7,4         │
│ ████████████████████░░  dentro do previsto   │
│                                              │
│ ⚠ Stroop e Alternância ficaram seguidos.     │
│    [Ajustar ordem]                           │
└──────────────────────────────────────────────┘
```

- **Duração vira faixa, não número único**: `28–34 min` = soma das durações prescritas + margem
  operacional (transições + a rodada/desafio que o paciente termina depois do tempo).
- **Barra comparando com o prescrito**, com três estados: abaixo (< 70%), dentro, acima (> 110%).
- **Alertas em lista curta**, no máximo dois visíveis; o resto atrás de "ver todos".

### Duração da sessão e frequência

Trocar os dois campos numéricos livres por **opções clínicas**: 20 / 30 / 40 min e 1 a 5 ×/semana —
que é o que a prática usa. Um campo livre de 10 a 90 convida a prescrições que o sistema não sabe
sustentar.

## Comportamento do "Ajustar"

Abre o painel do exercício **no lugar** (não modal), com só o que se aplica àquele modelo:

- contínuo → duração (dentro da faixa) ;
- planejamento → janela máxima ;
- fechado → nada configurável, só a explicação de por que é fixo ;
- bloco → número de séries.

Fechar volta ao card compacto. **Nenhum exercício mostra controle que não usa** — hoje o card do
Focus mostrava "Modo do treino" que o exercício ignorava.

## Evitar excesso visual

- No máximo **três informações** na linha de resumo (duração, carga, dose).
- Alerta só quando há alerta — sem "tudo certo ✓" ocupando espaço.
- Nada de barra de progresso, medalha, cor de destaque ou emoji novo.

## Desktop e responsividade

- **Desktop (≥1280px):** biblioteca à esquerda, plano à direita, como hoje. Card em duas colunas
  internas (info | ajuste) quando o painel abre.
- **Tablet:** colunas empilhadas, plano primeiro.
- **Celular:** um card por linha, resumo em duas linhas, "Ajustar" abre em folha inferior. O
  terapeuta raramente prescreve no celular, mas revisa — então priorizar leitura, não edição.
