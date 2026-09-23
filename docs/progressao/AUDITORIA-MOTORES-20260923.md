# Fase 2 — Auditoria dos motores de progressão

> Feita em 23/set/2026, antes de qualquer migração. **Nada foi alterado.**
> ⚠️ **Este documento inverte a premissa com que a Fase 2 entrou no cronograma.**

## O que eu supunha, e estava errado

O cronograma dizia: *"27 de 36 exercícios usam o motor LEGADO; migrar para o clínico"*, como se o
clínico fosse estritamente melhor. **Não é.** Simulei os dois lado a lado sobre sequências de
desempenho realistas, e em **5 de 8 casos a decisão muda** — em três deles, **para pior**.

## Os dois motores, medidos

| | `calculateNewDifficulty` (legado) | `calculateProgression` (clínico) |
|---|---|---|
| o que olha | **média das 5 últimas sessões** | **só a sessão atual** |
| sobe | média > 85 % | sessão ≥ 85 % |
| desce | média < 60 % → −1 | < 65 % → −1 · **< 45 % → −2** |
| exige histórico | sim (mínimo 2 sessões) | não |
| nível consolidado | não existe | **grava, mas não protege** |

## A simulação — 8 casos

| caso | nível | legado | clínico | muda? |
|---|---|---|---|---|
| melhora consistente (0,90 · 0,88 · 0,86 · 0,84 · 0,82) | 4 | sobe → 5 | sobe → 5 | não |
| **um dia ruim isolado** (0,35 hoje; 0,88-0,92 antes) | 6 | mantém 6 | **desce → 4** | ⚠️ SIM |
| piora consistente (0,40 · 0,45 · 0,50 · 0,60 · 0,70) | 6 | desce → 5 | desce → 4 | SIM |
| **oscilante** (0,95 · 0,40 · 0,95 · 0,40 · 0,95) | 5 | mantém 5 | **sobe → 6** | ⚠️ SIM |
| estável na faixa boa (0,72-0,78) | 5 | mantém 5 | mantém 5 | não |
| primeira sessão ótima (0,95) | 3 | mantém 3 | sobe → 4 | SIM |
| duas sessões ótimas | 3 | sobe → 4 | sobe → 4 | não |
| **desabou hoje, histórico bom** (0,20 hoje; 0,88-0,92 antes) | 7 | mantém 7 | **desce → 5** | ⚠️ SIM |

## 🔴 Os três casos em que o clínico é PIOR

**1. Um dia ruim derruba 2 níveis.** Paciente com 0,88 a 0,92 em quatro sessões faz 0,35 num dia —
cansaço, dor de cabeça, noite mal dormida, briga em casa. O legado mantém o nível (a média
absorve). **O clínico desce dois.** Na sessão seguinte ele treina num nível que já dominava, e
precisa de duas sessões boas para voltar.

**2. Oscilação sobe o paciente.** Quem alterna 0,95 e 0,40 tem desempenho instável — o quadro que
mais pede cautela. O legado mantém. **O clínico sobe**, porque a última sessão calhou de ser boa.

**3. Uma sessão catastrófica apaga o histórico.** 0,20 num dia, com quatro sessões acima de 0,88
antes: o clínico desce 2 e não consulta nada do que veio antes.

**A raiz é uma só:** o clínico **não tem memória**. Olha uma sessão e decide. O legado tem memória
(5 sessões), mas é lento e não distingue *tendência* de *ruído* — só faz média.

### E o "nível consolidado" não resolve

`calculateProgression` calcula `consolidatedLevel` — o maior nível executado com ≥ 80 %. O servidor
grava e lê de volta. **Mas nada o usa para proteger a queda.** É registro, não proteção. Medido:
`app/api/sessions/route.ts` o passa como entrada e guarda a saída; nenhum caminho o usa para impedir
uma descida.

## O que isto significa para a Fase 2

**Migrar os 27 exercícios para o motor clínico como ele está hoje pioraria a experiência de quem tem
um dia ruim — que é todo paciente, em algum momento.** A migração não deve começar.

**O que precisa vir antes é uma decisão clínica dela**, e são três perguntas:

1. **Uma sessão ruim isolada deve mudar o nível?** Clinicamente, variação intraindividual é esperada
   — fadiga, humor, sono. Se a resposta for não, o motor precisa de proteção contra outlier.
2. **Quantas sessões definem uma tendência?** O legado usa 5; o clínico usa 1. A literatura de
   treino cognitivo costuma tratar 2 a 3 sessões consistentes como sinal.
3. **Descer 2 níveis de uma vez é aceitável?** O clínico faz isso abaixo de 45 %.

## Recomendação do VP

**Não migrar. Construir uma terceira regra**, que tem a agilidade do clínico e a memória do legado:

- **subir** exige desempenho bom **na sessão atual E na anterior** — evita subir por sorte e mata o
  caso da oscilação;
- **descer** exige desempenho ruim **em duas sessões seguidas** — um dia ruim não mexe no nível;
- **queda de 2 níveis** só quando as duas últimas forem muito ruins;
- **o nível consolidado passa a proteger**: nunca descer abaixo dele sem três sessões ruins seguidas.

Isso é uma regra nova, com nome próprio, testada contra os 8 casos acima **antes** de tocar em
qualquer exercício. E depois migra-se **um exercício por vez**, com o comportamento antes/depois
medido.

**Nada disso se decide sem ela.** Este documento existe para que ela decida com os números na mão.
