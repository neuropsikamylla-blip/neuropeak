# 04 — Proposta de carga cognitiva

> Proposta do VP para discussão. **Nada implementado.**

## Escala recomendada: 1–3, não 1–5

**Recomendo três níveis (1 baixa · 2 moderada · 3 alta).** Motivos, nesta ordem:

1. **Utilidade clínica.** A decisão que a carga precisa apoiar é binária na prática: *"posso pôr
   estes dois seguidos?"*. Três níveis respondem isso; cinco criam distinções que ninguém consegue
   defender ("este é 3 ou 4?").
2. **Confiabilidade.** Não temos dados de fadiga por paciente. Uma escala de 5 fingiria uma precisão
   que a evidência não sustenta — e escala inventada com aparência de precisão é pior que escala
   grosseira honesta.
3. **Computacional.** O que o sistema precisa calcular é soma e vizinhança. Com 1–3 o teto de uma
   sessão de 30 min fica em ~9–10 pontos, uma conta que o terapeuta consegue conferir de cabeça.

**A precisão que falta não vem de mais níveis — vem dos MODIFICADORES** (abaixo). Um exercício de
carga 2 no nível 12, com repetição de áudio desligada e velocidade alta, é mais pesado que um carga 3
no nível 1. É isso que a fórmula precisa capturar, não um dígito mais fino.

## Carga BASAL × modificadores × carga na configuração

Três coisas diferentes, hoje confundidas:

| Conceito | O que é | Onde vive |
|---|---|---|
| **Carga basal** | peso do exercício no seu nível médio, com configuração padrão | `ExerciseDefinition` (global) |
| **Modificadores** | o que a prescrição e o nível do paciente somam ou tiram | calculado |
| **Carga estimada** | basal + modificadores, para ESTE paciente com ESTA prescrição | `ExercisePrescription` (derivado) |

### Critérios objetivos da carga basal

Pontuar cada eixo de 0 a 2 e classificar pela soma (0–4 → 1 · 5–8 → 2 · 9+ → 3):

| Eixo | 0 | 1 | 2 |
|---|---|---|---|
| Interferência (conflito de resposta) | nenhuma | alguma | central (Stroop, alternância) |
| Memória operacional | não retém | retém 1 item | retém série/regra |
| Demanda atencional | foco simples | sustentado | dividido/alternado |
| Velocidade exigida | livre | moderada | crítica |
| Planejamento | nenhum | 1 passo | multi-passo |
| Inibição | nenhuma | ocasional | central |
| Complexidade da instrução | 1 regra | 2 regras | 3+ ou regra que muda |

Eixos que **não** entram na carga basal, mas entram como modificadores: carga visual, auditiva e
motora (dependem do canal e da configuração), e "possibilidade de frustração" (depende do nível do
paciente, não do exercício).

### Modificadores (aplicados sobre a basal)

| Modificador | Efeito |
|---|---|
| Nível do paciente ≥ 70% do teto do exercício | **+1** |
| Repetição de áudio **desligada** em exercício auditivo | **+1** (vira medida de retenção pura) |
| Dupla tarefa ativa | **+1** |
| Distratores de alta semelhança | **+1** |
| Nível do paciente ≤ 25% do teto | **−1** |
| Duração prescrita ≤ 60% do padrão | **−1** |

Carga estimada = `clamp(basal + Σ modificadores, 1, 4)`. O teto 4 existe só para sinalizar
"excepcionalmente pesado" — não é um quarto nível da escala, é um alerta.

## Carga da sessão

```
cargaSessao = Σ (cargaEstimada(exercício) × minutosPrescritos(exercício) / 10)
```

Dividir por 10 mantém o número em escala legível: uma sessão de 30 min equilibrada fica entre
**5 e 9**. Acima de 12, alerta.

## Alertas — informam, nunca bloqueiam

| Situação | Alerta |
|---|---|
| Dois exercícios de carga 3 seguidos | "Dois exercícios pesados em sequência. Considere intercalar um mais leve." |
| Dois auditivos seguidos | "Dois exercícios auditivos seguidos disputam o mesmo canal." |
| Três do mesmo domínio seguidos | "A sessão está concentrada em {domínio}." |
| `cargaSessao > 12` | "Carga total acima do usual para {duração} min." |
| Soma dos exercícios < 70% da duração prescrita | "A sessão está bem abaixo dos {X} min prescritos." |
| Soma > 110% | "A sessão deve ultrapassar os {X} min prescritos." |

Todos **não bloqueantes**, com botão "Ajustar" que sugere uma reordenação — e o terapeuta pode
ignorar. Nenhuma troca automática de exercício sem ação explícita dele.

## Exemplos

**Sessão equilibrada (30 min, carga 7,4):**
`tempo-reacao` (A, carga 1, 5 min) → `cubo-corsi` (D, carga 2, 6 min) → `stroop-task` (C, carga 3,
4 min) → `trilha-visual` (A, carga 1, 5 min) → `torre-hanoi` (B, carga 2, 10 min).
Alterna canal, domínio e intensidade; o C fica no meio, com leves antes e depois.

**Sessão excessiva (30 min, carga 13,2):**
`stroop-task` (3) → `task-switching` (3) → `dual-task` (3) → `nback` (3).
Quatro de carga 3, três deles com interferência central, mesmo domínio predominante. O sistema
alerta três vezes — e ainda assim deixa salvar, se o terapeuta quiser.

## Limitações — o que esta classificação NÃO resolve

- **Não mede fadiga real.** É estimativa de desenho, não medida do paciente. Dois pacientes com o
  mesmo plano podem terminar em estados muito diferentes.
- **Não considera a hora do dia, o histórico da semana nem o estado clínico** — variáveis que o
  terapeuta enxerga e o sistema não.
- **A carga basal é julgamento profissional codificado**, não resultado experimental. Precisa da
  validação dela, exercício por exercício.
- **Ordem importa mais do que a soma**, e a literatura não dá regra fechada para isso. As regras de
  vizinhança propostas são clínicas, não empíricas.

## Decisões que exigem validação humana

1. A tabela de carga basal dos 41 exercícios (documento 03) — é proposta, não medida.
2. Os limiares de alerta (12 para sessão, 70%/110% de duração).
3. Se "repetição de áudio desligada" realmente sobe a carga, ou se muda o construto a ponto de
   virar outro exercício (ver documento 08).
