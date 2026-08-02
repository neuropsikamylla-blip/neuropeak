# 08 — Decisões que precisam de você antes da implementação

> Nenhuma decisão clínica foi tomada silenciosamente. As propostas estão nos documentos 03 a 06;
> aqui está o que **não** posso decidir sozinha.

## ✅ JÁ DECIDIDO POR ELA (02/ago/2026)

- **Modalidade (seletor visual · visual+áudio · só áudio): restrito a CINCO** — Restaurante,
  Supermercado, Caminhos para a Meta, **Focus Agentes** e **Compra Multifuncional**. Os dois últimos
  aprovados e ainda não implementados. Nenhum outro sem nova decisão explícita.
- **Os dois spans são auditivos por definição** — áudio intrínseco e obrigatório, sem seletor, sem
  versão visual. Leitura assistiva neles só para textos instrucionais, separada do áudio dos números.

## BLOQUEANTES — sem isso não começo

**B1. A tabela de carga basal dos 41 exercícios.** Está proposta no documento 03, derivada dos sete
eixos do documento 04. É julgamento profissional codificado, não medida. Precisa da sua revisão
exercício por exercício — principalmente os que marquei como carga 3 (`nback`, `lista-distracao`,
`stroop-task`, `task-switching`, `dual-task`, `mudanca-regras`, `deductive-grid`,
`compra-multifuncional`, `investigadores-sociais`, os `*-auditivo`).

**B2. As durações recomendadas por modelo.** Propus: contínuo 4–8 (padrão 5–6) · planejamento até
10–15 · fixo 4 · bloco 5–9. Se um paciente típico seu leva mais que isso na Torre de Hanói, a faixa
está errada e o plano vai estourar sempre.

**B3. Duração da sessão e frequência viram opções fechadas?** Hoje são campos livres (10–90 min,
1–7×). Proponho 20/30/40 e 1–5×, como você descreveu. Isso **invalida planos salvos com valores fora
dessas faixas** — preciso saber se existem, e o que fazer com eles.

**B4. Repetição de áudio: configuração clínica ou parte do construto?** Hoje é Sim/Não sem limite,
sem registro e sem efeito na progressão. Três caminhos possíveis:
   - (a) manter como está — simples, mas o exercício mede coisas diferentes em pacientes diferentes
     e ninguém sabe qual;
   - (b) permitir com **limite e registro** (ex.: até 2 repetições, contadas como ajuda, sem bloquear
     a subida de nível) — minha recomendação;
   - (c) tratar "com repetição" e "sem repetição" como **exercícios diferentes**, com progressão
     separada — mais correto do ponto de vista de medida, mais pesado de manter.
   Enquanto isso não se decide, **não mexo em `allowReplay`**.

**B5. O "nível inicial" prescrito sobrescreve o progresso do paciente?** Hoje o card sugere que sim,
mas o exercício lê o banco. Precisa de regra explícita: o `startLevel` vale **só na primeira
prescrição**, ou toda vez que o terapeuta salva o plano? A segunda opção rebaixaria pacientes sem
querer.

## IMPORTANTES — decidir antes da fase correspondente

**I1. Modelo D é configurado em séries ou em minutos?** Propus séries (é o que faz o span fechar).
Se você preferir minutos, o cálculo de progressão dos exercícios de memória precisa ser revisto.

**I2. Um exercício de carga 3 por sessão, no máximo?** É a regra que eu adotaria, mas ela reduz a
liberdade de montar sessões intensas para pacientes de alto desempenho.

**I3. Os alertas podem sugerir reordenação automática?** Propus botão "Ajustar ordem" que **sugere** —
nunca aplica sozinho. Confirma?

**I4. Rótulos ("fácil/médio/difícil") no lugar dos números de nível?** Recomendo **não**, porque os
tetos são diferentes (10, 12, 13) e "médio" significaria coisas diferentes por exercício. Proponho
mostrar `nível 7 de 13`. Precisa do seu aval.

**I5. Margem operacional da sessão.** Propus transições + a rodada/desafio que extrapola, exibido
como faixa (`28–34 min` para 30 prescritos). Falta você dizer se a faixa é aceitável clinicamente ou
se a sessão precisa terminar **dentro** dos 30.

## REFINAMENTO POSTERIOR

**R1.** Mostrar ao terapeuta a duração **real média** do paciente × a prescrita, depois de N sessões.
**R2.** Histórico de redefinições de nível (`resets`) — auditoria de quem mudou o quê e quando.
**R3.** Sugestão automática de plano a partir do perfil (fora do escopo desta reforma).
**R4.** Carga por sessão ao longo da semana (a frequência semanal hoje não entra em conta nenhuma).

## O que eu decidi sozinha e você pode reverter

- Criar a **quarta categoria** (bloco/protocolo): 15 exercícios de memória não cabem em nenhuma das
  três originais sem quebrar a progressão por série.
- **Escala 1–3** em vez de 1–5, com modificadores fazendo o ajuste fino (documento 04).
- **Lateralidade** deixa de ser eixo de dificuldade própria e vira variação.
- A carga usa **soma ponderada por minutos**, não média — sessão longa pesa mais que curta.
