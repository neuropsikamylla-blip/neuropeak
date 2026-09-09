# Grade Dedutiva — o motor adaptativo depois de "uma marcação só"

Data: 2026-09-09 · Autor: VP · Estado: **PROPOSTA. Nada implementado.**

Fecha a pendência aberta em 03/set pelo parecer do gestor de conteúdo:

> *"O próximo ponto que eu examinaria com bastante cuidado é o motor adaptativo: exatamente quais
> dados deste novo formato vão decidir qual problema vem em seguida, porque a mudança para uma
> marcação altera um pouco os indicadores que tínhamos planejado."*

---

## 1. O que a seção 48 pressupunha, e por que caiu

A espec desenhou a adaptação contando com a distinção **hipótese × confirmação**: o paciente
declarava se estava supondo (`?`) ou concluindo (`✓`), e o motor lia a diferença entre *hipótese
falsa* e *conclusão falsa*.

Essa distinção **deixou de existir** quando ela fechou "uma marcação só". Os gatilhos da seção 48
ficaram sem os dados que os alimentavam.

⚠️ E a correção conceitual do gestor de conteúdo continua valendo, e é o limite de tudo aqui:
**não se pode inferir estado mental a partir do clique.** *"Atribuição realizada quando a relação
ainda não era logicamente determinada"* é fato; *"confirmação prematura"* é interpretação, e é
dela, não do software.

---

## 2. O que o sistema realmente registra hoje (medido em `lib/grade/sessao.ts`)

Por problema: `concluido` · `atribuicoes` (cada uma com o estado de informação em que foi feita e
se foi revisada depois) · `verificacoes` (com estado, contradições, se corrigiu depois, ações e
tempo até corrigir) · `eventosPista` (riscar/desriscar, com momento) · `atribuicoesAntesDeDeterminacao`
com `dessasMantidas`/`dessasRevisadas` · `atribuicoesComEstadoJaContraditorio` ·
`latenciaPrimeiraAcao` · `totalAcoes` · `tempoTotal` · `tentativasConcluirIncorretas` ·
`usosVerificarRaciocinio`.

**Isto é bastante — mais do que a maioria dos exercícios da plataforma tem.**

---

## 3. Os cinco indicadores que proponho, e o que cada um substitui

| # | indicador | como se calcula | substitui |
|---|---|---|---|
| **I1** | **Resolveu** | `problemasResolvidos` ÷ problemas iniciados | o eixo de acerto |
| **I2** | **Exploração antes da determinação** | `atribuicoesAntesDeDeterminacao ÷ totalAtribuicoes`, e dentro dela a razão `revisadas ÷ (mantidas+revisadas)` | a distinção hipótese × confirmação |
| **I3** | **Persistência em contradição** | `atribuicoesComEstadoJaContraditorio ÷ totalAtribuicoes` | "conclusão falsa mantida" |
| **I4** | **Autonomia de monitoramento** | verificações usadas ÷ cota; e, das que acusaram incompatibilidade, quantas foram corrigidas depois | o uso da ajuda |
| **I5** | **Método de leitura** | quantas pistas foram riscadas, em que ordem, e quantas voltaram a ser desmarcadas | novo, e só existe porque ela pediu o risco manual |

⚠️ **I2 é o mais delicado.** Explorar antes de estar determinado **não é defeito** — é como se
resolve um problema de restrições. O que discrimina não é o número bruto, e sim **o que aconteceu
depois**: exploração **revisada** é flexibilidade; exploração **mantida** apesar de a contradição
já existir é I3.

---

## 4. As regras de adaptação que proponho

Mantendo os princípios dela (99–103): *não é "errou → mais fácil"; é "qual foi o padrão?"*.

| situação | leitura | ação |
|---|---|---|
| I1 alto **e** I3 baixo **e** I4 baixo | domina, e monitora sozinho | **sobe** de nível |
| I1 alto **e** I4 alto | resolve, mas apoiado na verificação | **mantém** o nível e **reduz a cota** |
| I1 médio **e** I2 revisada alta | explora e corrige — é o processo saudável | **mantém** |
| I3 alto em **dois problemas seguidos** | não percebe a contradição | **mantém** o nível e **reduz o número de categorias**, não a lógica |
| I1 baixo **com** tempo alto e poucas ações | sobrecarga global | **desce** de nível |
| I1 baixo **com** muitas ações e I3 alto | padrão específico de monitoramento | **mantém** e focaliza |

⚠️ **Nunca adaptar por um problema isolado** — regra dela: mínimo de **dois problemas
consecutivos** ou **três oportunidades**.
⚠️ **Máximo de dois blocos focalizados seguidos**, e depois transferência — regra dela.
⚠️ **Não superinterpretar tempo.** Lento pode ser planejamento. O tempo só entra **combinado** com
número de ações, nunca sozinho.

---

## 5. O que isto substitui na prática

Hoje a Grade usa `calculateNewDifficulty` (o caminho legado), que decide **só pela acurácia média
das últimas sessões** — e a acurácia da Grade é hoje `acuraciaDoProblema`, uma fórmula **provisória
minha** baseada apenas em tentativas de concluir incorretas.

Ou seja: **a Grade adapta hoje por um único indicador raso.** Qualquer coisa desta proposta é melhor
— mas "melhor que o atual" não é critério clínico suficiente, e é por isso que isto é proposta.

---

## 6. ⚠️ O que é meu e o que é seu

**Meu (técnico, posso implementar):** de onde vem cada número, como se agregam, a arquitetura da
função pura testável, e a garantia de que nada disso vira texto interpretativo em lugar nenhum.

**Seu (clínico, não posso decidir):**
1. os **cinco indicadores** são os certos? falta algum? sobra algum?
2. os **limiares** de "alto" e "baixo" — proponho começar sem números fixos, comparando o paciente
   **com ele mesmo** nas últimas 3 sessões, em vez de com uma norma que não temos;
3. **reduzir categorias** é a forma certa de reduzir carga sem simplificar a lógica?
4. a **cota de verificação** pode ser mexida pelo motor, ou é só do nível?

## 7. Como proponho seguir

**Fatia 1 — só medir.** Implementar os cinco indicadores como funções puras e **gravá-los**, sem
que decidam nada. Assim, quando você for calibrar, calibra com dados reais dos seus pacientes em
vez de com palpite meu.

**Fatia 2 — decidir.** Ligar as regras, com os limiares que você fechar.

⚠️ **Recomendo fortemente a fatia 1 primeiro.** O erro da acurácia provisória mostrou o custo de
ligar um número ao motor antes de saber o que ele significa: a Torre subiu de nível para sempre por
causa de um `1` fixo, e a Grade quase repetiu.
