# Estacionamento Lógico — Progressão de verdade (épico)

> Spec aprovada pela Kamylla em 15/jul/2026 (conversa + respostas às perguntas de decisão).
> Objetivo clínico: treinar PLANEJAMENTO com dificuldade que cresce de fato —
> mais carros, tabuleiro maior, múltiplos alvos — e acabar com a repetição de fases.

## Problemas diagnosticados (código em v2.32.2)

1. **Repetição de fases.** Banco com 36 fases jogáveis, mal distribuídas: mín. 5→8 fases,
   6→8, 7→8, 8→6, 9→3, 10→1, 13→1, 14→1. O jogo evita repetir só as últimas 6 fases
   DENTRO da sessão e não lembra nada entre sessões. Paciente bom vive nos níveis altos,
   onde há 1–3 fases → repete sempre.
2. **Dificuldade rasa.** Tabuleiro fixo 6×6, um alvo só, "dificuldade" = nº mínimo de
   movimentos. Não há crescimento estrutural (mais carros / tabuleiro maior / mais alvos).
3. **Regra avançada entra cedo.** Contar cada quadradinho como movimento ativava em
   mín. ≥ 10 — no meio da escada, não no topo.
4. **Bug latente de persistência.** O componente reporta `difficulty` = mínimo de
   movimentos alcançado (até 14), mas a API de sessões aceita 1–12 (Zod) e o CHECK do
   banco aceita 1–10 → sessão nas fases 13/14 é REJEITADA e perdida.
5. Contagem de movimentos punia "empurrões aos poucos" — **já corrigido** (v2.32.3).

## Decisões fechadas (Kamylla, 15/jul/2026)

- **Contagem:** empurrões seguidos no MESMO carro emendam num movimento só; vai-e-volta
  seguido conta 1 (sem estorno — voltar é erro de planejamento ou necessidade real).
  ✅ Entregue em v2.32.3.
- **Tabuleiro:** cresce até **7×7** (49 células, +36%). Sem 8×8 (carros ficariam pequenos
  demais para o dedo no celular).
- **Dois alvos:** carro vermelho + ambulância/viatura, **cada um com a própria saída**
  (segunda abertura no tabuleiro, em outra fileira). Veículo que sai desaparece e libera
  espaço. Fase termina quando os dois saíram.
- **Escada de 15 níveis** aprovada (abaixo). Regra dos quadradinhos SÓ no nível 15.

## Escada de níveis (1–15)

| Nível | Tabuleiro | Ingrediente | Mín. de movimentos da fase |
|---|---|---|---|
| 1 | 6×6 | densidade básica (≥5 carros) | 5 |
| 2 | 6×6 | | 6 |
| 3 | 6×6 | | 7 |
| 4 | 6×6 | | 8 |
| 5 | 6×6 | | 9 |
| 6 | 6×6 | | 10 |
| 7 | 6×6 | | 11–12 |
| 8 | 7×7* | mais carros (9–12) | 13–14 |
| 9 | 7×7* | | 15–16 |
| 10 | 7×7* | | 17+ |
| 11–14 | 7×7 | **dois alvos**, saídas próprias, remoção ao sair | recalibrar na Etapa 3 |
| 15 | 7×7 | **regra dos quadradinhos** (com aviso na tela) | topo da escada |

\* Na Etapa 1 os níveis 8–10 usam 6×6 bem denso (mín. 13+); a Etapa 2 os recalibra para 7×7.

## Etapas

- **Etapa 0 ✅ (v2.32.3):** contagem emendada de movimentos.
- **Etapa 1 — Gerador + escada 1–10 (6×6):**
  - Script `scripts/generate-parking-levels.mjs`: gera fases aleatórias, resolve por BFS
    (regra carro = 1 movimento), valida (sem sobreposição, alvo na fileira da saída, nenhum
    carro horizontal na fileira da saída, solucionável, mínimo confere), deduplica e grava
    `lib/parking-levels.ts` com dezenas de fases POR NÍVEL, cada uma com `id` estável.
  - Componente passa à escada 1–10: sobe 1 nível por fase ótima, desce 1 após 2 não-ótimas
    (regra atual mantida); começa no nível salvo do paciente (sem o antigo "+3").
  - Variedade entre sessões: `localStorage np-parking-recent` (últimas ~40 fases por id);
    nunca sorteia fase recente enquanto houver inédita no nível.
  - Persistência: `difficulty` gravado = nível 1–10 (mata o bug das fases 13/14);
    nível real também em `metadata.reachedLevel`.
  - Regra dos quadradinhos passa a exigir nível ≥ 15 (portanto desligada até a Etapa 4).
  - Teste vitest que valida o banco inteiro com um solver INDEPENDENTE do gerador.
- **Etapa 2 — Tabuleiro 7×7:** motor com tamanho de grid por fase (constante `GRID` vira
  atributo do nível: solver, arraste, SVG, saída), banco 7×7 para níveis 8–10, recalibração.
- **Etapa 3 — Dois alvos (níveis 11–14):** segunda saída (fileira própria), remoção do
  veículo ao sair, vitória = todos os alvos fora, gerador estendido, tutorial/instrução
  atualizados. Usa os carros ESPECIAIS já reservados em `lib/parking-cars.ts`
  (`car-06`…`car-09`: polícia, ambulância…). Atenção: ambulância (car-07) é pálida no
  tabuleiro escuro — precisa tratamento visual (contorno/sombra) antes de entrar.
- **Etapa 4 — Nível 15:** regra dos quadradinhos como topo da escada + polimento geral.

## Notas técnicas

- Progressão entre sessões continua no caminho legado do servidor (`calculateNewDifficulty`,
  1–10) — consistente com o padrão da casa; o componente continua se autoregulando por fase
  dentro da sessão.
- Migração suave: config antiga do paciente (1–10) vira nível inicial direto; o adaptativo
  corrige em 1–2 fases qualquer diferença da escala antiga.
- `atencao-dividida`/aliases: não afetados. Tutorial atual (2 carros) permanece como está.
