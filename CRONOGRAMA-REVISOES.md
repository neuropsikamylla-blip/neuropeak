# NeuroPeak — Cronograma de revisões por fases

> Levantamento e plano feitos em **22/set/2026**, a pedido dela.
> **Como usar:** cada fase tem um **prompt pronto**. Basta dizer *"executa a Fase N"* — ou colar o
> prompt. As fases estão em **ordem sequencial ideal**; executar fora de ordem funciona, mas o
> documento explica o que se perde.

---

## Parte I — O que já foi feito, avaliado

### O tamanho real do programa (medido, não estimado)

| | |
|---|---|
| componentes de exercício | **44** (33 exercícios canônicos + auxiliares) |
| linhas em exercícios | ~24.500 |
| linhas em `lib/` | ~39.800 |
| linhas em `data/` | ~8.100 |
| testes | **97 arquivos · 1.278 testes**, todos passando |
| rotas de API | 25 |
| telas | 26 |
| versão em produção | 3.35.1 |

### O que foi entregue nas últimas semanas

**Ordem da História** — revisão completa em 4 fatias: gabaritos corrigidos por campo no dado,
segunda tentativa sem travar, dificuldade subindo dentro da sessão, embaralhamento que exige 2
trocas. **Oito gabaritos corrigidos** e três histórias de ordem não dedutível retiradas.

**Rastreamento (MOT)** — duração do movimento de 3,5 s para 4,5 s, porque abaixo de ~4 s o paciente
decora as posições em vez de rastrear.

**Informação em Foco** — quatro fatias: operação cognitiva como eixo da seleção (antes era rodízio
fixo), nenhuma operação repetida em rodadas seguidas (eram 53 % das sessões), critérios que precisam
ser necessários (eram 100 % dispensáveis), filtro+comparação que antes o motor não expressava.

### A lição que atravessa tudo isso

**Três dos oito gabaritos e três das quatro ambiguidades foram achados por ela usando o app** — não
pelas minhas varreduras. O motivo é estrutural: eu procuro inconsistência, ela lê como o paciente lê.
**Toda fase abaixo termina com verificação dela em produção**, e nenhuma se declara pronta sem isso.

### 🔴 Os três achados que este levantamento trouxe

1. **27 de 36 exercícios usam o motor de progressão LEGADO.** Só 9 declaram `progressionV2`. Os
   outros caem em `calculateNewDifficulty`, que decide por média das 5 últimas sessões, sem nível
   consolidado e sem regra clínica. **É o achado de maior impacto: a maioria dos pacientes está
   sendo progredida pelo motor antigo.**
2. **13 dos 33 exercícios ainda não têm tutorial no framework T1** — a tela de instruções reaparece
   em toda sessão, como acontecia em Informação em Foco.
3. **2 exercícios fora da dosagem global** (`MatrizEspacialInversa`, `SpanNumericoInverso`).

---

## Parte II — As fases

| fase | tema | tamanho | por que nesta posição |
|---|---|---|---|
| **1** | Fechar Informação em Foco | médio | está no meio; frente aberta custa mais que frente nova |
| **2** | A progressão dos 27 exercícios | **grande** | maior impacto clínico: nível errado afeta todo paciente |
| **3** | Bancos de conteúdo dos outros exercícios | grande | Ordem da História provou que banco tem erro que só o uso revela |
| **4** | Os 4 exercícios gigantes | médio | onde defeito se esconde melhor |
| **5** | Tutoriais T1 restantes | médio | regra dela: "tutorial É o exercício rodando" |
| **6** | Relatório e registro clínico | médio | o que o terapeuta vê; depende dos dados das fases 2 e 3 |
| **7** | API, segurança e dados | pequeno | invisível ao paciente, mas é onde mora risco de perda |
| **8** | Acessibilidade e celular | médio | precisa do olho dela; melhor depois do resto estável |

---

## FASE 1 — Fechar Informação em Foco

**Objetivo:** terminar a reformulação em curso (C5 a C7) e encerrar a frente.

**O que falta:** exclusão verdadeira na formulação que ela escolheu (*"atende a apenas uma das
exigências"*); contextos novos (cardápio, cinema, viagem, agenda); material visual real, com o botão
"Ampliar" deixando de ser decorativo.

### Prompt

> Executa a Fase 1 do cronograma: fechar Informação em Foco.
> Implemente, em fatias separadas e nesta ordem: (a) a exclusão verdadeira na formulação que eu
> escolhi — "atende a apenas uma das exigências" —, com a regra de que o alvo compartilha cada
> critério com outros produtos, senão vira busca direta; (b) os contextos novos, começando por
> cardápio e cinema, com atributos próprios de cada um e perguntas que usem esses atributos, não só
> troca de nome; (c) o modo de material visual, em que uma informação necessária aparece só na
> imagem, legível e ampliável, sem virar teste de visão.
> Antes de cada fatia, meça a viabilidade sobre o banco real e me mostre o número — não escreva spec
> que o catálogo não sustenta. Cada fatia termina com prova por volume, controle negativo e commit.
> No fim, me diga o que testar em produção.

**Pronto quando:** as 9 operações da minha espec existem de verdade, medidas; pelo menos 3 contextos
rodando na mesma sessão; e eu confirmo jogando.

---

## FASE 2 — A progressão dos 27 exercícios no motor legado

**Objetivo:** levar os exercícios que ainda usam `calculateNewDifficulty` para o motor clínico.

**Por que importa:** o motor legado decide pela média das 5 últimas sessões, sem nível consolidado,
sem regra por tipo de erro e sem distinguir acerto de primeira de acerto após correção. Um paciente
pode ficar preso num nível fácil por um dia ruim, ou subir por sorte.

⚠️ **Esta é a fase de maior risco do cronograma.** Mexe na peça que o CLAUDE.md marca como crítica
("dificuldade calibrada clinicamente"). Tem de ser feita exercício a exercício, com o
comportamento antes e depois medido sobre sessões reais.

### Prompt

> Executa a Fase 2 do cronograma: a progressão dos exercícios no motor legado.
> Primeiro faça a auditoria e me mostre: quais dos 33 exercícios usam `calculateNewDifficulty`, o que
> esse motor decide hoje em cada um, e o que mudaria com o motor clínico — simulando sobre sequências
> de desempenho realistas, não no abstrato. Me mostre os casos em que a decisão MUDA, porque são
> esses que importam.
> Depois proponha a ordem de migração, começando pelos exercícios que mais uso com pacientes, e
> migre um por vez. Cada migração precisa de: teste provando que a decisão nova é a clinicamente
> correta em pelo menos 5 cenários (bom, ruim, oscilante, um dia ruim isolado, melhora consistente),
> e controle negativo mostrando o que o motor antigo decidia.
> NÃO migre em lote. NÃO altere `lib/adaptive.ts` sem me mostrar o diff antes.

**Pronto quando:** todo exercício declara explicitamente qual motor usa e por quê; os que migraram
têm teste de cenário; e nenhum paciente muda de nível por efeito colateral da migração.

---

## FASE 3 — Bancos de conteúdo dos outros exercícios

**Objetivo:** aplicar aos outros bancos o método que achou os 8 gabaritos errados de Ordem da
História.

**Quais têm banco de conteúdo:** Restaurante, Supermercado, Compra Multifuncional, Busca Rápida,
Investigadores Sociais, Caminhos para a Meta, Informação em Foco (já coberto).

### Prompt

> Executa a Fase 3 do cronograma: os bancos de conteúdo.
> Para cada exercício com banco de itens (Restaurante, Supermercado, Compra Multifuncional, Busca
> Rápida, Investigadores Sociais, Caminhos para a Meta), faça a auditoria que fizemos em Ordem da
> História, procurando os DOIS defeitos: (a) resposta certa que não é dedutível do que o paciente vê;
> (b) item cuja resposta se acha ignorando parte do enunciado.
> Meça antes de olhar: use análise para ranquear suspeitas e só então inspecione. Me mostre o que
> achou por exercício, separando o que tem prova dura do que é leitura — e corrija sozinho só o
> primeiro grupo.
> Comece pelo exercício que eu mais uso. Se algum banco não sustentar correção, me diga em vez de
> remendar.

**Pronto quando:** cada banco tem um documento de auditoria com o que foi coberto **e o que ficou
aberto** — sem declarar limpo o que não foi provado.

---

## FASE 4 — Os quatro exercícios gigantes

**Objetivo:** revisar os componentes onde defeito se esconde melhor.

`DesafioCidade` (1.147 linhas) · `Labirinto` (1.085) · `TorreHanoi` (965) · `RestauranteOrdem` (881).

⚠️ **`DesafioCidade` é o caso mais suspeito:** é o maior arquivo do projeto e está **fora do
catálogo** (renderiza mas é filtrado do menu — o "órfão ARQ-003" do CLAUDE.md). Vale decidir se fica
ou sai antes de investir revisão nele.

### Prompt

> Executa a Fase 4 do cronograma: os exercícios gigantes.
> Comece me dizendo se o Desafio Cidade deve continuar existindo — ele é o maior arquivo do projeto,
> não aparece no catálogo e eu não lembro de usá-lo. Se for para aposentar, faça como o N-Back.
> Para os demais (Labirinto, Torre, Restaurante), revise procurando: estado que não se reinicia entre
> rodadas, acurácia que não reflete o desempenho, `accuracy` fixa, temporizador que vaza, lógica de
> acerto duplicada em dois lugares, e trecho que o paciente nunca alcança.
> Cada achado com prova executável e o cenário concreto que o dispara. Sem reescrever tela que está
> aprovada.

**Pronto quando:** cada um tem lista de achados com prova, e os de impacto clínico corrigidos.

---

## FASE 5 — Tutoriais T1 restantes

**Objetivo:** os 13 exercícios cujo tutorial ainda reaparece em toda sessão.

**Regra dela, já congelada:** *"tutorial que não é o exercício SAI DO AR"* — usar as peças reais e a
mesma função de acerto.

### Prompt

> Executa a Fase 5 do cronograma: os tutoriais que faltam.
> Me mostre primeiro quais dos 33 exercícios ainda não estão no framework T1 e como cada um exibe
> instrução hoje. Depois converta por FAMÍLIA, não um a um — exercícios com a mesma mecânica
> compartilham o desenho do tutorial e a validação.
> Cada tutorial usa as peças REAIS do exercício e a mesma função de acerto; nenhum roteiro
> reimplementa a mecânica. O tutorial não conta na dose e não aparece de novo para quem concluiu.
> Teste por família, com prova de que a demonstração executa a tarefa inteira.

**Pronto quando:** os 33 estão no T1, e a tela de instruções repetida não existe mais em lugar nenhum.

---

## FASE 6 — Relatório e registro clínico

**Objetivo:** o que o terapeuta vê. Hoje o registro é agregado por sessão; falta o processo.

**O que existe:** score, acurácia, tempo, nível, alguns campos por exercício.
**O que falta:** registro por rodada na maioria dos exercícios; separação de desempenho por tipo de
demanda; e relatório que mostre **como** o paciente resolveu, não só quanto acertou.

### Prompt

> Executa a Fase 6 do cronograma: relatório e registro clínico.
> Primeiro me mostre, por exercício, o que hoje é gravado por sessão e o que é gravado por rodada.
> Depois proponha o conjunto mínimo de campos por rodada que serve para TODOS os exercícios (tipo da
> tarefa, tempo até responder, acerto de primeira, ajuda usada) mais os específicos de cada um.
> Em seguida, o relatório: quero ver desempenho separado por tipo de demanda, tempo por tipo, e o que
> mudou entre as sessões. Nada de interpretação automática — o relatório apresenta dado, a leitura
> clínica é minha. Nenhuma frase do tipo "déficit de atenção" gerada por regra.
> Cuidado com o tamanho do metadata: me mostre o impacto no banco antes de gravar mais campos.

**Pronto quando:** consigo abrir o relatório de um paciente e ver o processo, não só o placar.

---

## FASE 7 — API, segurança e dados

**Objetivo:** o que não se vê, mas é onde mora risco de perda.

**Pontos conhecidos:** sem rate limiting no login (SEC-001 do CLAUDE.md); Supabase Free **sem backup
automático e sem PITR**; as 3 CHECK de `Session` aplicadas por SQL direto e ausentes do schema —
somem a cada `db push`; `db:seed` quebrado.

### Prompt

> Executa a Fase 7 do cronograma: API, segurança e dados.
> Revise as 25 rotas procurando: rota sem autenticação, rota que confia em dado do cliente sem
> validar, e rota que pode gravar lixo no banco. Me mostre por rota o que protege o quê.
> Depois trate: rate limiting no login, as CHECK de Session que somem a cada db push, e o db:seed
> quebrado.
> ⚠️ Antes de QUALQUER coisa que toque o banco, faça o backup do procedimento e me mostre a prova de
> que ele foi feito e validado — o Supabase Free não tem de onde restaurar.

**Pronto quando:** cada rota tem sua proteção declarada e testada, e o backup é rotina provada.

---

## FASE 8 — Acessibilidade e celular

**Objetivo:** o que só o olho dela decide, depois do resto estável.

**Conhecido:** ela atende por Zoom com o paciente controlando o Mac — nada de fullscreen nativo nem
recarregar por foco. A verificação em celular está pendente em vários exercícios.

### Prompt

> Executa a Fase 8 do cronograma: acessibilidade e celular.
> Meça primeiro, no código: contraste de texto e de elementos interativos, área de toque mínima, e
> exercícios que quebram abaixo de 400 px. Me mostre a lista por exercício, do pior para o melhor.
> Corrija o que for objetivo (contraste abaixo do mínimo, alvo de toque pequeno demais) e me mostre
> capturas do que depende do meu olho.
> Não use fullscreen nativo, não trave viewport e não recarregue por foco — isso quebra o controle
> remoto do Zoom.

**Pronto quando:** nenhum exercício tem contraste ou alvo de toque abaixo do mínimo, e eu aprovei o
que é subjetivo no celular.

---

## Como manter este documento

Cada fase concluída ganha, aqui mesmo, uma linha com a data, a versão publicada e o que ficou aberto.
Fase que termina sem a verificação dela em produção **não conta como concluída** — é a regra que o
histórico recente justifica.
