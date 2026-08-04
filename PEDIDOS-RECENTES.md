# As 3 ultimas especificacoes dela (automatico; a mais nova por ultimo)
# Na retomada: ler as 3, conectar com PROGRESSO.md e git, declarar e seguir.

## ✅ FASE 2 DA PRESCRIÇÃO ENTREGUE (03/ago/2026) — exibição consultiva na tela de plano (`a6f61f0`)

**Não mudou dado, API, banco nem comportamento de exercício.** A Fase 1 (núcleo puro em
`lib/prescription/`, 7 módulos) segue aprovada e congelada; a Fase 2 apenas **EXIBE** ao terapeuta,
na área dele, o que o núcleo calcula. O commit não tocou `package.json` — versão segue **2.67.1**.

### O que entrou

| Arquivo criado | Papel |
|---|---|
| `lib/prescription/presentation.ts` (469 l) | camada pura de apresentação — **sem React** |
| `lib/prescription/presentation.test.ts` (144 l) | testes da camada pura |
| `lib/prescription/__tests__/save-button-guard.test.ts` (63 l) | teste **estático**: lê o fonte e garante que o "Salvar plano" não some |
| `lib/prescription/__tests__/library-coverage.test.ts` | regressão criada pelo VP na revisão (ver achado abaixo) |
| `components/plano/prescription/PrescriptionSummary.tsx` (98 l) | resumo da sessão prescrita |
| `components/plano/prescription/ExercisePrescriptionMeta.tsx` (28 l) | metadados de prescrição por exercício |

**Alterados:** `app/(therapist)/pacientes/[id]/plano/page.tsx` · `components/plano/PlanBuilderSidebar.tsx` ·
`components/plano/ExerciseCard.tsx` · `components/plano/ExerciseRow.tsx`.

### Roteamento (regra 8)

Codificação no **Codex `gpt-5.6-sol`, esforço high, lab `impl2b`**. O primeiro disparo (lab `impl2`)
**panicou com bug de Rust em `std::env`** e não produziu nada — lab recriado e redisparado, aí com
sucesso. Dois consertos pequenos pós-colheita foram do **Claude Opus 5 xhigh (exceção 1 da regra 8)**:
tipagem em `presentation.ts` (acesso a propriedade opcional numa união criada por `satisfies`) e a
criação do `library-coverage.test.ts`.

### Provas (repositório real)

`npx tsc --noEmit` exit 0 · `npx vitest run` **330/330 em 28 arquivos** (eram 296 → **+34 testes**) ·
`npm run build` exit 0.

### ⚠️ Achado da revisão do VP — já blindado por teste

A **biblioteca de exercícios da tela de plano** passou a montar cada cartão a partir do catálogo de
prescrição e **descarta com `flatMap` quem não tem entrada**. Hoje a cobertura é total (**34 de 34**),
mas o descarte seria **silencioso** — um exercício sumiria da tela sem erro nenhum.
`library-coverage.test.ts` transforma esse caso em teste vermelho.

### ⏸️ PRÓXIMO PASSO — validação VISUAL dela; **NÃO iniciar a Fase 3**

Ela pediu explicitamente para não começar a Fase 3 automaticamente. Não há teste de renderização,
então estes cenários da tela de plano só se conferem com olho humano: **plano vazio · dentro do
esperado · acima do esperado · excesso importante · fadiga alta consecutiva · planejamento
consecutivo · plano legado** — e, em **todos**, confirmar que o botão **"Salvar plano"** continua
disponível.

### 🔷 Decisões dela pendentes

1. **Paredão de alertas:** numa sessão muito sobrecarregada os alertas chegam a **~21**, com "fadiga
   alta em sequência" e "interferência alta em sequência" repetidos par a par. Decidir se a Fase 3
   agrupa ou limita visualmente.
2. **`ExerciseRow`:** a descrição do exercício saiu da linha principal e foi para dentro de **"Ver
   detalhes"** (fiel à spec, que mandava "o resto atrás de Ver detalhes"). Decidir se fica assim.
```

## COMO PROVEI

- `git show --stat --oneline a6f61f0` — exit 0. Confirma os 6 arquivos criados e os 4 alterados exatamente como descritos no despacho (mais `PEDIDOS-LOG.md`, +3 linhas, que não citei por ser gancho automático), e que `package.json` **não** foi tocado.
- `node -p "require('./package.json').version"` → `2.67.1`; `wc -l lib/prescription/presentation.ts` → 469 linhas; `library-coverage.test.ts` → 29 linhas (o despacho não deu número; registrei sem contagem).
- `npx tsc --noEmit` → `TSC_EXIT=0`. `npx vitest run` → `Test Files 28 passed (28)` / `Tests 330 passed (330)`, comando com exit code 0. Ou seja, reproduzi por conta própria as duas primeiras provas do despacho no repositório real.
- `git status --short` após a edição → apenas ` M PROGRESSO.md`; `git diff --stat` → 1 arquivo, 57 inserções, 0 remoções.

## O QUE NÃO FIZ

- Não commitei nem dei push (o commit é do VP). A árvore está com `PROGRESSO.md` modificado e não staged.
- Não rodei `npm run build` (a prova de build do despacho segue sendo do VP; as outras duas eu reproduzi). Status do build nesta sessão: DESCONHECIDO por evidência própria.
- Não alterei nenhum outro arquivo — nem `ESTADO-DO-PROJETO.md`, nem `CLAUDE.md`, nem o registro de roteamento em outro lugar.
- Não mexi no bloco `## 🚧 EM ANDAMENTO (02/ago/2026) — FASE 1 da arquitetura clínica` (linha ~52 antes da edição). Observação para o VP: ele está marcado como em andamento com os lotes B e C ⬜, mas o bloco de topo declara essa Fase 1 concluída e congelada — é contradição residual dentro do arquivo, fora do escopo deste despacho.
- Não fiz nenhuma verificação visual da tela de plano nem validei os 7 cenários listados.</result>
<usage><subagent_tokens>38988</subagent_tokens><tool_uses>11</tool_uses><duration_ms>132095</duration_ms></usage>
</task-notification>
