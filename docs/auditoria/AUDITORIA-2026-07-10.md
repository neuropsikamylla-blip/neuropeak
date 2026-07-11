# Auditoria completa — NeuroPeak

**Data:** 2026-07-10 · **Versão auditada:** 2.11.1 (`package.json:3`, commit `3a16474`) · **Escopo:** todo o código-fonte da pasta do projeto (exclui `node_modules`, `.next`, binários de `public/`).

**Método:** reconhecimento por 3 agentes de leitura → auditoria em 5 dimensões independentes (Correção, Segurança, Arquitetura, Performance, Geral) em agentes Opus read-only, cada dimensão com formato de finding padronizado → verificação adversarial de todo P1 por refutadores independentes (ordem: derrubar) → consolidação. Nenhum arquivo de código foi modificado nesta auditoria. Toda afirmação abaixo tem evidência `arquivo:linha`; contagens e estados foram medidos por comando nesta sessão (ver Apêndice B).

> **Natureza das correções:** este relatório **propõe**; nada foi corrigido. As correções aguardam decisão humana e ficam para sessão posterior.

---

## 1. Resumo executivo

### 1.1 Contagem por severidade (após verificação adversarial)

| Severidade | Qtde | Definição |
|---|---|---|
| **P0** — explorável / perda de dados / quebra certa | **0** | — |
| **P1** — bug real de impacto alto | **1** | SEC-001 (brute-force de PIN) |
| **P2** — defeito médio ou dívida relevante | **27** | — |
| **P3** — menor | **26** | — |
| **Total ativo** | **54** | (+1 finding consolidado: GER-003 → CORR-004) |

### 1.2 Findings por dimensão

| Dimensão | Total | P1 | P2 | P3 |
|---|---|---|---|---|
| Correção (CORR) | 19 | 0 | 12 | 7 |
| Segurança (SEC) | 8 | 1 | 2 | 5 |
| Arquitetura (ARQ) | 9 | 0 | 3 | 6 |
| Geral (GER) | 11 | 0 | 6 | 5 |
| Performance (PERF) | 6 | 0 | 2 | 4 |

_(As contagens por dimensão refletem a severidade verificada e a fusão GER-003→CORR-004. A dimensão Correção soma as duas passadas: a principal e a suplementar sobre os exercícios não lidos na primeira.)_

### 1.3 Os 5 mais críticos

1. **SEC-001 (P1) — Sem rate limiting na autenticação de paciente.** `lib/auth.ts:52-64`. O login por PIN faz `bcrypt.compare` sem qualquer lockout; o espaço é enumerável (código `COG#####` ~90 mil × PIN de 6 dígitos ~900 mil). Credencial de dado clínico (LGPD) força-brutável por POST repetido. Único P1 confirmado. **Mitigador parcial:** a Vercel amortece rajadas e a base é pequena, mas não há defesa na aplicação.
2. **SEC-002 (P2) — Paciente grava anotações clínicas do terapeuta.** `app/api/therapeutic-sessions/[id]/route.ts`. O `PATCH` aceita `therapistNotes`/`status` de um paciente sobre a própria sessão (a leitura esconde essas notas, mas a escrita não é barrada por papel). Controle de acesso a nível de campo quebrado (CWE-639).
3. **SEC-003 (P2) — Hash do PIN devolvido ao cliente.** `app/api/patients/route.ts:35`. Leituras de `Patient` sem `select` mandam o hash bcrypt do PIN no JSON; abre brute-force offline se o browser for comprometido.
4. **CORR-001 (P2) — Progressão rebaixa quem chega ao topo do Supermercado.** `lib/adaptive.ts:94` capa em 10, mas o exercício usa níveis 11–12; o servidor grava 10 e o paciente de elite é rebaixado silenciosamente, sem nunca consolidar 11–12.
5. **CORR-004+GER-003 (P2) — Enxurrada de alertas PERFORMANCE_DROP.** `app/api/sessions/route.ts:231-247`. Sem deduplicação (ao contrário de CYCLE_COMPLETE) e cruzando exercícios diferentes: cada sessão em queda cria um alerta novo, com mensagem que culpa o exercício errado.

### 1.4 Avaliação geral honesta

O NeuroPeak está **estruturalmente saudável e em bom estado de engenharia de base**: compila sem erros (`tsc --noEmit` exit 0), passa nos 24 testes, faz build de produção, o isolamento multi-inquilino por `therapistId`/`patientId` é **consistente rota a rota**, e o baseline de segurança da auditoria de 2026-05-30 (CSP/headers, comparação de segredos em tempo constante, CSPRNG para PINs, gate de CRP no servidor) **continua aplicado**. A versão instalada do Next (`15.5.18`, não o `15.3.9` declarado) já traz a correção do CVE-2025-29927 — o bypass de middleware **não** se aplica.

Dito isso, a auditoria — que cobriu ~13 mil linhas nunca antes revisadas, já que o código quase dobrou desde maio — revela **dois eixos de fragilidade que merecem atenção**:

- **Fidelidade da métrica clínica (o mais importante para este produto).** Vários exercícios corrompem score/progressão em casos de borda reais: empates marcados como erro e comparação de unidades incompatíveis no Caça Informação (CORR-014/015), dupla contagem de erros no DeductiveGrid (CORR-013), falso-alarme contado múltiplas vezes na Vigilância (CORR-009), seleção lida vazia no timeout da Compra Multifuncional (CORR-008), progressão defasada ou rebaixada (CORR-001/005/011). Nenhum quebra o app, mas **este é um instrumento de avaliação neuropsicológica** — um escore distorcido tem peso clínico. Esta é a área que mais recompensa correção.
- **Um gap de segurança real (SEC-001) e dois de robustez de acesso (SEC-002/003)**, todos endereçáveis sem redesenho.

No plano de manutenção, há **dívida arquitetural crescente**: três fontes de verdade divergentes para metadados de exercício (ARQ-001), estado de gamificação (pet/skill tree) só em `localStorage` — perdido ao trocar de aparelho (ARQ-002), exercícios órfãos/fantasmas (`desafio-cidade`, `atencao-dividida` — ARQ-003/004), god files que só crescem (ARQ-007), e higiene de supply chain (`db:seed` quebrado por `ts-node` ausente do lockfile — GER-001; dependências não usadas — GER-002).

**Conclusão:** nada aqui é uma emergência de produção. É uma lista de trabalho saudável, liderada por **um P1 de segurança** e por um conjunto de **correções de fidelidade clínica** que, para uma ferramenta de neuropsicologia, valem mais do que a severidade "P2" sugere. Recomenda-se tratar SEC-001/002/003 e o bloco de correção dos exercícios antes de novas funcionalidades.

---

## 2. Tabela completa de findings

| ID | Sev. | Dimensão | Conf. | Local | Título |
|----|------|----------|-------|-------|--------|
| SEC-001 | P1 | SEGURANCA | alta | `lib/auth.ts:52-64` | Sem rate limiting em autenticação — brute-force de PIN de paciente |
| ARQ-002 | P2 | ARQUITETURA | alta | `lib/pet.ts / lib/skilltree.ts:lib/pet.ts:112 loadPet / 130 savePet (localStorage); lib/skilltree.ts:104 loadSkills / 110 saveSkills, 124 saveXp; prisma/schema.prisma sem campos pet/skill` | Progresso de Pet e da Skill Tree persistido só em localStorage — perda silenciosa ao trocar de aparelho |
| ARQ-003 | P2 | ARQUITETURA | alta | `components/exercises/executive/DesafioCidade.tsx:app/(therapist)/pacientes/[id]/plano/page.tsx:54; types/index.ts:298; treino/[exercicio]/page.tsx:613; DesafioCidade.tsx:1146 linhas` | Exercício órfão: desafio-cidade (1.146 linhas) existe, é filtrado de planos e invisível no catálogo |
| ARQ-004 | P2 | ARQUITETURA | alta | `lib/domain-taxonomy.ts / components/exercises/attention/AtencaoDividida.tsx:lib/domain-taxonomy.ts:26; components/exercises/attention/AtencaoDividida.tsx:316 (518 linhas); treino/[exercicio]/page.tsx (sem case)` | Componente e id fantasma atencao-dividida: taxonomia referencia exercício sem definição nem rota |
| CORR-001 | P2 | CORRETUDE | alta | `lib/adaptive.ts:94, 98, 114` | Progressao generica limita a 10, mas Desafio Supermercado usa niveis 11-12 e o paciente de alto desempenho e rebaixado |
| CORR-002 | P2 | CORRETUDE | alta | `components/therapeutic/MundoInterior.tsx:596-606` | Mundo Interior: polling de 8s sobrescreve o update otimista e causa perda de progresso |
| CORR-003 | P2 | CORRETUDE | alta | `app/api/sessions/route.ts:153, 167, 222-229` | Alerta MISSED_SESSION nunca e limpo ao treinar (codigo morto: recentCount jamais e 0) |
| CORR-004 | P2 | CORRETUDE | alta | `app/api/sessions/route.ts:231-247` | PERFORMANCE_DROP sem deduplicacao e cruzando exercicios diferentes gera spam de alertas com mensagem enganosa |
| CORR-005 | P2 | CORRETUDE | media | `app/api/sessions/route.ts:115-140, 184-198` | Dupla progressao: exercicios progressionV2 sobem o nivel no cliente e o servidor sobe de novo |
| CORR-008 | P2 | CORRETUDE-B | media | `components/exercises/executive/CompraMultifuncional.tsx:67-78, 151-155, 182-188` | Compra Multifuncional: timeout da rodada lê seleção VAZIA (stale closure) |
| CORR-009 | P2 | CORRETUDE-B | alta | `components/exercises/attention/Vigilancia.tsx:174-189` | Vigilância: falso-alarme conta múltiplas vezes no mesmo estímulo |
| CORR-011 | P2 | CORRETUDE-B | alta | `components/exercises/memory/LetrasSequencia.tsx:145-161` | Progressão de nível atrasa uma rodada (stale spec) em 4 exercícios v2 |
| CORR-012 | P2 | CORRETUDE-B | baixa | `components/exercises/processing/Semaforo.tsx:291-347` | Semáforo: startRound dentro de handleResponse pode usar closure obsoleto |
| CORR-013 | P2 | CORRETUDE-B | media | `components/exercises/executive/DeductiveGrid.tsx:545-560` | DeductiveGrid: erros do puzzle final contados em dobro na acurácia |
| CORR-014 | P2 | CORRETUDE-B | media | `components/exercises/attention/CacaItemBarato.tsx:182-259` | Caça Informação: empates marcam resposta correta como errada |
| CORR-015 | P2 | CORRETUDE-B | media | `components/exercises/attention/CacaItemBarato.tsx:182-211` | Caça Informação: 'mais conteúdo' compara unidades diferentes (g vs L vs ml) |
| CORR-016 | P2 | CORRETUDE-B | alta | `components/exercises/memory/LetrasSequencia.tsx:97` | LetrasSequencia: número de distratores travado em 2 (Math.min(2,4)) |
| CORR-017 | P2 | CORRETUDE-B | alta | `components/exercises/memory/ListaDistracao.tsx:206-209` | ListaDistracao/PadroesRotacao/etc: cabeçalho mostra startLevel fixo, não o nível atual |
| GER-001 | P2 | GERAL | alta | `package.json:18` | Script db:seed quebrado — ts-node ausente do node_modules e do lockfile |
| GER-002 | P2 | GERAL | alta | `package.json:11` | Dependências declaradas e nunca usadas (@auth/prisma-adapter, pg, date-fns-tz) |
| GER-004 | P2 | GERAL | alta | `lib/adaptive.ts:7` | Cobertura de testes: novas engines de progressão (dual-task, story-trail, focus, genérica) sem teste |
| GER-005 | P2 | GERAL | alta | `app/(patient)/treino/[exercicio]/page.tsx:287` | Timezone divergente: bloqueio/aquecimento diário usa TZ do navegador; streak usa America/Sao_Paulo |
| GER-006 | P2 | GERAL | media | `app/(patient)/treino/[exercicio]/page.tsx:447` | Bloqueio '1x por dia' é só client-side; servidor não valida |
| GER-007 | P2 | GERAL | media | `app/api/auth/redeem-license/route.ts:57` | Resgate de licença rebaixa terapeuta de ilimitado (-1) para número finito |
| PERF-001 | P2 | PERFORMANCE | alta | `app/(therapist)/pacientes/page.tsx:29` | Lista de pacientes carrega TODO o histórico de sessões (sem take) — PERF-02 corrigido só pela metade |
| PERF-002 | P2 | PERFORMANCE | alta | `app/api/sessions/route.ts:153-283` | POST /api/sessions executa ~8-11 round-trips sequenciais ao banco no caminho quente |
| SEC-002 | P2 | SEGURANCA | alta | `app/api/therapeutic-sessions/[id]/route.ts:12-22,56-81` | Paciente pode gravar campos clínicos do terapeuta via PATCH da sessão terapêutica |
| SEC-003 | P2 | SEGURANCA | alta | `app/api/patients/route.ts:35-40 (e patients/[id]/route.ts:92-105)` | Hash do PIN do paciente devolvido ao cliente (findMany/findUnique sem select) |
| ARQ-001 | P3 | ARQUITETURA | alta | `types/index.ts / lib/domain-taxonomy.ts / lib/exercise-meta.ts:types/index.ts:113 (EXERCISE_DEFINITIONS, 39 ids); lib/domain-taxonomy.ts:15 (DOMAIN_SUBDOMAINS, 35 ids); lib/exercise-meta.ts:15 (EXERCISE_META, 27 ids)` | Metadados de exercício triplicados e divergentes entre 3 fontes de verdade |
| ARQ-005 | P3 | ARQUITETURA | alta | `utils/validateCommand.ts / utils/generateCommand.ts / components/characters/AgentGrid.tsx / components/characters/FallingAgentsDemo.tsx:utils/validateCommand.ts (101 l, 0 importadores); utils/generateCommand.ts:595 buildRound (export sem consumidor); AgentGrid.tsx (46 l); FallingAgentsDemo.tsx (110 l); AtencaoDividida.tsx (518 l)` | Dead code: módulo utils/validateCommand.ts, função buildRound e componentes AgentGrid/FallingAgentsDemo/AtencaoDividida |
| ARQ-006 | P3 | ARQUITETURA | media | `app/(patient)/treino/[exercicio]/page.tsx:treino/[exercicio]/page.tsx:60 (EXERCISE_INSTRUCTIONS, 39 entradas), :593 switch (39 cases), :640 HIDE_PROGRESS_WIDGET (Set literal de 37 strings)` | Fluxo central em god file: switch de 39 casos + EXERCISE_INSTRUCTIONS + HIDE_PROGRESS_WIDGET forçam registro do exercício em 6+ lugares |
| ARQ-007 | P3 | ARQUITETURA | media | `components/exercises/attention/FocusAgents.tsx / utils/generateCommand.ts / components/exercises/executive/DesafioCidade.tsx:FocusAgents.tsx 1618 l; utils/generateCommand.ts 1293 l; DesafioCidade.tsx 1146 l; Labirinto.tsx 1072 l; CertoOuErrado.tsx 983 l; DesafioSupermercado.tsx 977 l` | God files crescentes e novos desde a auditoria de 30/05 (ARCH-02 deferido segue piorando) |
| ARQ-008 | P3 | ARQUITETURA | alta | `components/exercises/ExerciseWrapper.tsx (e ~7 outros):ExerciseWrapper.tsx:92-114; também app/(patient)/layout.tsx (12 ocorrências), inicio/page.tsx, progresso/page.tsx, treino/[exercicio]/page.tsx, CertoOuErrado.tsx, Labirinto.tsx, FocusAgents.tsx` | Objeto themeStyles CLINICAL/COLORFUL/GAMIFIED reimplementado por arquivo (DUP-01 deferido segue aberto) |
| ARQ-009 | P3 | ARQUITETURA | alta | `components/reports/ ; app/auth/ ; components/exercises/useExerciseEngine.ts:components/reports/ (vazia); app/auth/ (vazia); useExerciseEngine.ts:86 useAdaptiveLevel` | Pastas vazias e export sem consumidores (useAdaptiveLevel) |
| CORR-006 | P3 | CORRETUDE | media | `lib/adaptive.ts:132-138` | calculateFocusProgression desconhece o teto do modo Foco (7) e pode salvar nivel 8/9 num modo capado em 7 |
| CORR-007 | P3 | CORRETUDE | media | `app/api/sessions/route.ts:51-60, 231-247` | Sessoes abandonadas (score 0) da Ordem da Historia poluem PERFORMANCE_DROP e conquistas de outros exercicios |
| CORR-010 | P3 | CORRETUDE-B | media | `components/exercises/attention/Vigilancia.tsx:117-150` | Vigilância: loop de estímulos sem cleanup — setState após unmount |
| CORR-018 | P3 | CORRETUDE-B | media | `components/exercises/attention/TempoReacao.tsx:45-55, 234-239` | TempoReacao: IDs de balões podem colidir no mesmo lote |
| CORR-019 | P3 | CORRETUDE-B | baixa | `components/exercises/processing/CorridaContraOTempo.tsx:181-207` | CorridaContraOTempo: rodada sem alvos válidos vira inderrotável (imagens quebradas) |
| CORR-020 | P3 | CORRETUDE-B | baixa | `app/api/reports/route.ts:186-192, 255-263` | Reports: divisão por zero evitada, mas Math.max(...[]) quando não há sessões válidas |
| GER-008 | P3 | GERAL | alta | `components/dashboard/AlertsPanel.tsx:61` | AlertsPanel: marcar-como-lido sem checar resposta; markAllRead sem try/catch |
| GER-009 | P3 | GERAL | media | `app/api/reports/route.ts:168` | Parsing de datas do relatório mistura UTC e hora local do servidor |
| GER-010 | P3 | GERAL | media | `package.json:6` | next-lint deprecado; migração para ESLint CLI pendente (Next 16) |
| GER-011 | P3 | GERAL | media | `components/exercises/executive/Labirinto.tsx:783` | 5 warnings de ESLint: exhaustive-deps e ref-cleanup em exercícios |
| GER-012 | P3 | GERAL | media | `prisma/seed.ts:15` | Seed cria credenciais fracas e previsíveis (senha e PINs hardcoded) |
| PERF-003 | P3 | PERFORMANCE | alta | `components/exercises/attention/FocusAgents.tsx:611-622` | FocusAgents pré-carrega e decodifica ~42 PNGs de personagem (~2 MB) no mount |
| PERF-004 | P3 | PERFORMANCE | alta | `components/exercises/memory/DesafioSupermercado.tsx:628-632` | DesafioSupermercado pré-carrega 77 PNGs de produto no mount independentemente do nível |
| PERF-005 | P3 | PERFORMANCE | media | `components/exercises/attention/FocusAgents.tsx:218` | Imagens de exercício servidas como <img> full-res sem otimização (next/image não usado no hot path) |
| PERF-006 | P3 | PERFORMANCE | alta | `components/therapeutic/MundoInterior.tsx:596-600` | Polling do Mundo Interior a cada 8s continua mesmo com a aba em segundo plano |
| SEC-004 | P3 | SEGURANCA | media | `lib/auth.ts:101` | Sem fail-fast se NEXTAUTH_SECRET ausente/fraco |
| SEC-005 | P3 | SEGURANCA | media | `lib/auth.ts:58-63` | Enumeração de código/e-mail por timing (bcrypt só roda se registro existe) |
| SEC-006 | P3 | SEGURANCA | alta | `next.config.js:9-21` | CSP com 'unsafe-inline' e 'unsafe-eval' em script-src |
| SEC-007 | P3 | SEGURANCA | alta | `app/api/reports/route.ts:303-307` | Content-Disposition monta filename com nome do paciente sem sanitizar aspas |
| SEC-008 | P3 | SEGURANCA | alta | `app/preview/bichinho/page.tsx:1-11 (e middleware.ts:50-64)` | /preview/bichinho pública fora do matcher do middleware (superfície, sem PII) |

---

## 3. Findings detalhados

#### SEC-001 — Sem rate limiting em autenticação — brute-force de PIN de paciente

- **Severidade (verificada):** P1
- **Dimensão:** SEGURANCA  ·  **CWE-307**
- **Local:** `lib/auth.ts:52-64`
- **Confiança:** alta
- **Evidência:** bcrypt.compare(credentials.pin, patient.pin) sem lockout; grep rate/throttle/upstash em app+lib+middleware = 0
- **Cenário:** Atacante enumera códigos COG##### (~90k) e testa PIN de 6 dígitos (900k) via POST repetido a /api/auth/callback/credentials, sem limite. Credencial clínica (LGPD) força-brutável.
- **Recomendação:** Rate limit por IP+identificador nos dois providers + lockout progressivo; PIN mais longo.

#### ARQ-002 — Progresso de Pet e da Skill Tree persistido só em localStorage — perda silenciosa ao trocar de aparelho

- **Severidade (verificada):** P2
- **Dimensão:** ARQUITETURA
- **Local:** `lib/pet.ts / lib/skilltree.ts:lib/pet.ts:112 loadPet / 130 savePet (localStorage); lib/skilltree.ts:104 loadSkills / 110 saveSkills, 124 saveXp; prisma/schema.prisma sem campos pet/skill`
- **Confiança:** alta
- **Evidência:** lib/skilltree.ts:104 `loadSkills(patientId){ ... localStorage.getItem(storageKey(patientId)) ... }` e :110 `saveSkills(... localStorage.setItem ...)`. lib/pet.ts:130 `savePet(patientId,state){ ... localStorage.setItem(storageKey(patientId), JSON.stringify(state)) }`. Grep por savePet/loadPet/PetState/np_pet combinado com fetch|api|prisma retorna vazio (nenhuma sincronização com servidor). prisma/schema.prisma não tem nenhum campo pet/skill/care/xp (grep case-insensitive só acerta `expiresAt`). O XP total é reconciliado do servidor (jornada/page.tsx:29 soma score das sessões), MAS a alocação de pontos de habilidade (SkillLevels) e o estado de cuidado/evolução do pet NÃO são derivados de nada no banco — são estado autoral acumulado só no navegador (SkillTree.tsx:77 `setSkills(next); saveSkills(patientId, next)`).
- **Cenário:** Paciente evolui o pet até 'Adulto' e gasta pontos na árvore de habilidades no celular. Depois entra pelo tablet/notebook, ou limpa os dados do navegador, ou o iOS expira o localStorage por pressão de armazenamento. Resultado observável: pet volta a 'Ovo' e a árvore de habilidades zera — toda a gamificação motivacional (que é a proposta clínica de aderência) é perdida sem aviso, embora o histórico de sessões no banco continue intacto. Para paciente de neuropsicologia, isso quebra a motivação de continuidade do tratamento.
- **Recomendação:** Espelhar PetState e SkillLevels no banco (novos campos no model Patient ou tabela dedicada), com endpoint de leitura/gravação; usar localStorage apenas como cache otimista, reconciliando no login como já é feito com o XP. Alternativamente, derivar o estágio do pet e os pontos de skill deterministicamente da contagem de sessões do servidor (como o XP já faz), eliminando o estado autoral no cliente.

#### ARQ-003 — Exercício órfão: desafio-cidade (1.146 linhas) existe, é filtrado de planos e invisível no catálogo

- **Severidade (verificada):** P2
- **Dimensão:** ARQUITETURA
- **Local:** `components/exercises/executive/DesafioCidade.tsx:app/(therapist)/pacientes/[id]/plano/page.tsx:54; types/index.ts:298; treino/[exercicio]/page.tsx:613; DesafioCidade.tsx:1146 linhas`
- **Confiança:** alta
- **Evidência:** app/(therapist)/pacientes/[id]/plano/page.tsx:54 `setSelectedExercises(parsed.map(e => e.id).filter((id) => id !== "desafio-cidade"))` — o carregamento do plano REMOVE explicitamente desafio-cidade. Ao mesmo tempo o exercício continua: em EXERCISE_DEFINITIONS (types/index.ts:298-305, domain:'executive'), com case de render ativo (treino/[exercicio]/page.tsx:613 `case "desafio-cidade": return <DesafioCidade {...props} />`), instruções (page.tsx:175) e componente completo de 1.146 linhas. Porém está AUSENTE de DOMAIN_SUBDOMAINS, logo o catálogo (treino-cognitivo/page.tsx:96 `.map(EXERCISE_DEFINITIONS[id]).filter(Boolean)`) nunca o lista — a terapeuta não consegue prescrevê-lo.
- **Cenário:** Um dos maiores componentes do projeto (1.146 linhas) está em estado ambíguo permanente: não pode ser adicionado a um plano (não aparece no catálogo) e é ativamente removido se já estava salvo, mas todo o código de render, instruções e metadados permanece carregado e compilado. Manutenção futura tratará desafio-cidade como exercício vivo (ele tem entrada em EXERCISE_DEFINITIONS) e desperdiçará esforço; um dev pode 'consertar' a listagem e reativar por engano um exercício que a terapeuta decidiu esconder.
- **Recomendação:** Decidir e formalizar: se aposentado, mover o id para EXERCISE_ALIASES/lista de aposentados e remover de EXERCISE_DEFINITIONS + deletar o componente (ou movê-lo para uma pasta _deprecated). Se ainda em desenvolvimento, marcar com flag explícita `hidden: true` em EXERCISE_DEFINITIONS em vez do filtro hardcoded por string espalhado na página de plano.

#### ARQ-004 — Componente e id fantasma atencao-dividida: taxonomia referencia exercício sem definição nem rota

- **Severidade (verificada):** P2
- **Dimensão:** ARQUITETURA
- **Local:** `lib/domain-taxonomy.ts / components/exercises/attention/AtencaoDividida.tsx:lib/domain-taxonomy.ts:26; components/exercises/attention/AtencaoDividida.tsx:316 (518 linhas); treino/[exercicio]/page.tsx (sem case)`
- **Confiança:** alta
- **Evidência:** lib/domain-taxonomy.ts:26 lista `atencao-dividida` no subdomínio 'dividida'. Mas `atencao-dividida` NÃO está em EXERCISE_DEFINITIONS (grep vazio em types/index.ts) e NÃO tem case no switch de treino/[exercicio]/page.tsx (grep confirma: só aparece na string do Set HIDE_PROGRESS_WIDGET, linha 641). O componente AtencaoDividida.tsx (518 linhas) existe, reporta `exerciseId: "atencao-dividida"` (linha 316/318) mas não é importado em lugar nenhum (grep -rln AtencaoDividida excluindo o próprio arquivo → vazio).
- **Cenário:** No catálogo, o subdomínio 'Atenção Dividida' tenta renderizar atencao-dividida via EXERCISE_DEFINITIONS[id], recebe undefined e é descartado por .filter(Boolean) — some silenciosamente, distorcendo a contagem do subdomínio. Se algum plano legado tiver salvo 'atencao-dividida' e o paciente clicar para treinar, o switch cai no `default: <div>Exercício em desenvolvimento</div>` (page.tsx:634). Enquanto isso, 518 linhas de AtencaoDividida.tsx ficam mortas no bundle, aparentando um exercício vivo.
- **Recomendação:** Resolver a inconsistência de nome: ou o exercício de atenção dividida real é dual-task/mot (então remover 'atencao-dividida' da taxonomia e deletar AtencaoDividida.tsx), ou o componente deve ser ligado (adicionar id em EXERCISE_DEFINITIONS + case no switch + import). Manter os Record tipados como Record<ExerciseId,...> impediria o id fantasma de compilar.

#### CORR-001 — Progressao generica limita a 10, mas Desafio Supermercado usa niveis 11-12 e o paciente de alto desempenho e rebaixado

- **Severidade (verificada):** P2  _(auditor propôs P1; rebaixado na verificação adversarial)_
- **Dimensão:** CORRETUDE  ·  **CWE-682**
- **Local:** `lib/adaptive.ts:94, 98, 114`
- **Confiança:** alta
- **Evidência:** calculateProgression faz lvl = Math.min(10, Math.max(1, Math.round(currentLevel))) e nextLevel = Math.min(10, lvl + 1). DesafioSupermercado.tsx L178 define MAX_LEVEL = 12 e L715-738 sobe ate 12 enviando difficulty=nextLevel (ate 12) com progressionV2 true. sessions/route.ts L18 aceita difficulty min 1 max 12.
- **Cenário:** Paciente atinge nivel 11 ou 12 no Supermercado com accTotal>=0.85 e envia difficulty 12. No servidor (sessions/route.ts L127) calculateProgression(12) faz lvl=min(10,12)=10 e nextLevel=min(10,11)=10. O ExerciseConfig grava 10, rebaixando de 12 para 10; na sessao seguinte o aquecimento -2 parte de 8. Quem chega ao topo e silenciosamente rebaixado e nunca consolida 11-12.
- **Recomendação:** Parametrizar o teto de calculateProgression (maxLevel default 10) e chamar com 12 para desafio-supermercado, ou dar branch dedicada como dual-task/ordem-historia.

#### CORR-002 — Mundo Interior: polling de 8s sobrescreve o update otimista e causa perda de progresso

- **Severidade (verificada):** P2  _(auditor propôs P1; rebaixado na verificação adversarial)_
- **Dimensão:** CORRETUDE  ·  **CWE-362**
- **Local:** `components/therapeutic/MundoInterior.tsx:596-606`
- **Confiança:** alta
- **Evidência:** pollRef.current = setInterval(loadSession, 8000) e updateSession faz setSession(optimistic) e depois await patchSession. loadSession faz setSession(data) do servidor; o PATCH sobrescreve arrays inteiros sem merge; nao ha ref de escrita-em-voo bloqueando o poll.
- **Cenário:** Ao responder uma casa (handleHouseDone chama updateSession), o setSession otimista atualiza responses e currentHouseIndex. Se o setInterval de 8s dispara com o PATCH em voo (ou lento/perdido), loadSession busca o estado antigo e faz setSession(data), revertendo a resposta na tela. Em conexao instavel a resposta pode se perder se o poll reverter antes do PATCH persistir.
- **Recomendação:** Suprimir o poll durante escrita pendente (ref writeInFlight), pausar o intervalo em updateSession e retomar apos o PATCH, e/ou reconciliar por updatedAt.

#### CORR-003 — Alerta MISSED_SESSION nunca e limpo ao treinar (codigo morto: recentCount jamais e 0)

- **Severidade (verificada):** P2
- **Dimensão:** CORRETUDE  ·  **CWE-561**
- **Local:** `app/api/sessions/route.ts:153, 167, 222-229`
- **Confiança:** alta
- **Evidência:** A sessao e criada em L153 antes do findMany em L167 (take 20 desc). Em L222-229, recentCount conta sessoes da ultima semana e so faz alert.deleteMany de MISSED_SESSION se recentCount for 0. Como a sessao recem-criada (completedAt agora) esta em recentSessions e cai na ultima semana, recentCount e sempre >=1.
- **Cenário:** Paciente recebe MISSED_SESSION pelo cron e volta a treinar. Esperava-se auto-remocao do alerta ao concluir a sessao, mas como recentCount nunca e 0 o deleteMany nunca executa; o alerta persiste no dashboard ate leitura manual.
- **Recomendação:** Buscar recentSessions antes de criar a nova sessao, ou excluir a recem-criada da contagem, ou sempre remover MISSED_SESSION ao registrar sessao valida.

#### CORR-004 — PERFORMANCE_DROP sem deduplicacao e cruzando exercicios diferentes gera spam de alertas com mensagem enganosa

- **Severidade (verificada):** P2
- **Dimensão:** CORRETUDE  ·  **CWE-670**
- **Local:** `app/api/sessions/route.ts:231-247`
- **Confiança:** alta  ·  _consolida GER-003_
- **Evidência:** last5 = recentSessions.slice(0,5) e prev5 = slice(5,10); se avgPrev-avgLast>15 cria alerta PERFORMANCE_DROP citando data.exerciseId. recentSessions inclui todos os exercicios (nao filtra por exerciseId) e nao ha checagem de alerta existente, ao contrario de CYCLE_COMPLETE em L261.
- **Cenário:** Queda de score (ultimas 5 sessoes, quaisquer exercicios) 15+ pontos abaixo das 5 anteriores gera PERFORMANCE_DROP. Sem dedup, cada nova sessao enquanto a condicao persistir cria outro alerta identico. A mensagem cita o ultimo exercicio feito, mas a media mistura exercicios de dominios diferentes, podendo culpar um exercicio sem relacao com a queda.
- **Recomendação:** Checar alerta PERFORMANCE_DROP nao lido recente antes de criar (dedup como CYCLE_COMPLETE) e/ou comparar medias filtrando por exerciseId.

#### CORR-005 — Dupla progressao: exercicios progressionV2 sobem o nivel no cliente e o servidor sobe de novo

- **Severidade (verificada):** P2
- **Dimensão:** CORRETUDE  ·  **CWE-682**
- **Local:** `app/api/sessions/route.ts:115-140, 184-198`
- **Confiança:** media
- **Evidência:** No servidor genericProg = calculateProgression(data.difficulty, {accTotal}, prevConsolidated) e grava currentDifficulty=genericProg.nextLevel. O cliente ja envia o nivel elevado: SequenciaItens L129 difficulty=reachedRef.current, PadroesRotacao L263, ListaDistracao L129, LetrasSequencia L127 (todos com progressionV2) e DesafioSupermercado L736 difficulty=nextLevel. Compare AntesDepois L315 que envia o startLevel.
- **Cenário:** Paciente sobe dentro da sessao (reachedRef de 4 para 6) e envia difficulty 6 com accTotal>=0.85. O servidor faz calculateProgression(6) e retorna nextLevel 7, gravando 7. O avanco intra-sessao (+2) soma mais +1 do servidor: pula para um nivel acima do dominado, podendo frustrar na sessao seguinte.
- **Recomendação:** Definir autoridade unica: cliente envia nivel de partida (como AntesDepois) e o servidor decide, ou cliente envia o alcancado e o servidor nao reaplica calculateProgression.

#### CORR-008 — Compra Multifuncional: timeout da rodada lê seleção VAZIA (stale closure)

- **Severidade (verificada):** P2  _(auditor propôs P1; rebaixado na verificação adversarial)_
- **Dimensão:** CORRETUDE-B
- **Local:** `components/exercises/executive/CompraMultifuncional.tsx:67-78, 151-155, 182-188`
- **Confiança:** media
- **Evidência:** useEffect do cronômetro tem deps [phase,showTutorial,round]; o setInterval captura onTimeUp()->concludeRound()->selItems(selected). 'selected' não está nas deps, então o closure fixa o Set do início da rodada (vazio).
- **Cenário:** Paciente seleciona 3 itens corretos mas demora e o tempo esgota. onTimeUp dispara concludeRound(false,true) que avalia checkRound com selected=∅ (valor do início da rodada). O painel mostrou tudo ✓, mas o relatório de acerto/erro e as regras cumpridas saem com seleção vazia — resultado e pontuação incorretos.
- **Recomendação:** Guardar a seleção atual num ref (selectedRef.current=selected) e usar selItems(selectedRef.current) em onTimeUp/concludeRound, ou incluir selected nas deps do efeito do timer.

#### CORR-009 — Vigilância: falso-alarme conta múltiplas vezes no mesmo estímulo

- **Severidade (verificada):** P2  _(auditor propôs P1; rebaixado na verificação adversarial)_
- **Dimensão:** CORRETUDE-B
- **Local:** `components/exercises/attention/Vigilancia.tsx:174-189`
- **Confiança:** alta
- **Evidência:** handleTap: no ramo 'else if (!isTarget)' faz setFalseAlarms((f)=>f+1) e setFeedback('false') SEM marcar responded.current=true. Só o ramo de acerto (isTarget) seta responded.current.
- **Cenário:** Aparece um distrator (não-alvo). O paciente toca 3x rápido na área. Cada toque incrementa falseAlarms → 3 falsos-alarmes registrados para um único estímulo. A acurácia final = hits/(hits+misses+falseAlarms) despenca artificialmente, distorcendo o escore clínico de vigilância.
- **Recomendação:** Marcar responded.current=true também no ramo de falso-alarme (ou usar um guard por índice de estímulo) para contabilizar no máximo 1 resposta por item.

#### CORR-011 — Progressão de nível atrasa uma rodada (stale spec) em 4 exercícios v2

- **Severidade (verificada):** P2
- **Dimensão:** CORRETUDE-B
- **Local:** `components/exercises/memory/LetrasSequencia.tsx:145-161`
- **Confiança:** alta
- **Evidência:** validate/submit chamam setLevel(l=>l+1) e agendam setTimeout(()=>startRound()). startRound tem dep [spec] (derivado de level); o closure de validate fixa o startRound do nível ANTIGO. Mesmo padrão em SequenciaItens.tsx (146-159), ListaDistracao.tsx (146-161), PadroesRotacao.tsx (286-305).
- **Cenário:** Paciente acerta 2 seguidas no nível 3 → setLevel(4). O setTimeout já agendado chama o startRound capturado (spec do nível 3), então a próxima rodada ainda é nível 3; só a rodada seguinte usa nível 4. A dificuldade efetiva fica sempre 1 rodada defasada da progressão pretendida.
- **Recomendação:** Ler o nível/spec de um ref no startRound (levelRef.current) ou passar o próximo nível explicitamente ao startRound(nextLevel), evitando depender do closure.

#### CORR-012 — Semáforo: startRound dentro de handleResponse pode usar closure obsoleto

- **Severidade (verificada):** P2
- **Dimensão:** CORRETUDE-B
- **Local:** `components/exercises/processing/Semaforo.tsx:291-347`
- **Confiança:** baixa
- **Evidência:** startRound (useCallback dep [onMs]) chama handleResponse(false,newRound) no timeout de omissão, mas handleResponse é definido DEPOIS e não está nas deps de startRound (eslint-disable). handleResponse (dep [finishGame,startRound,isTimeUp]) por sua vez chama startRound.
- **Cenário:** Como onMs é constante na sessão o efeito prático é pequeno, mas o par mutuamente recursivo startRound↔handleResponse com deps parciais é frágil: se onMs mudasse (ou em refactor), o timeout de omissão chamaria uma versão antiga de handleResponse, podendo pular rodadas ou avaliar a rodada errada.
- **Recomendação:** Extrair a lógica para refs estáveis ou reordenar/mesclar as callbacks para que ambas vejam sempre a versão corrente uma da outra.

#### CORR-013 — DeductiveGrid: erros do puzzle final contados em dobro na acurácia

- **Severidade (verificada):** P2
- **Dimensão:** CORRETUDE-B
- **Local:** `components/exercises/executive/DeductiveGrid.tsx:545-560`
- **Confiança:** media
- **Evidência:** Em confirm errado: errorsThisPuzzle.current++ E setTotalErrors(e=>e+1) (linhas 547-548). No sucesso com tempo esgotado, accuracy=1-(totalErrors+errorsThisPuzzle.current)/(nextTotal*2) (linha 560) — totalErrors já inclui os erros do puzzle atual, que são somados de novo via errorsThisPuzzle.current.
- **Cenário:** No último puzzle o paciente erra 2 vezes e acerta na 3ª quando o tempo acaba. totalErrors já contabilizou esses 2; a fórmula soma +2 de errorsThisPuzzle → 4 erros no denominador em vez de 2. A acurácia sai menor que a real, subestimando o desempenho no relatório.
- **Recomendação:** Usar apenas totalErrors (que já agrega tudo) OU não incrementar totalErrors nos erros do puzzle corrente; escolher uma única fonte de verdade para a contagem.

#### CORR-014 — Caça Informação: empates marcam resposta correta como errada

- **Severidade (verificada):** P2
- **Dimensão:** CORRETUDE-B
- **Local:** `components/exercises/attention/CacaItemBarato.tsx:182-259`
- **Confiança:** media
- **Evidência:** cheapest: 'cheaper = two[0].priceCents <= two[1].priceCents ? two[0] : two[1]'. most-content: 'heavier = two[0].weight >= two[1].weight ? ...'. best-value (2 e 3 itens): 'perUnit(a) <= perUnit(b)'. Só um id é correctId, mesmo em empate exato.
- **Cenário:** L2 sorteia dois produtos com preços iguais (ex.: dois leites R$ 4,99) para 'qual é mais barato?'. Ambos são igualmente corretos, mas correctId é fixado em two[0]. Se o paciente toca two[1] (igualmente barato), é marcado como ERRO. Idem para pesos/custo-benefício iguais (vários itens têm mesmo peso/preço no catálogo).
- **Recomendação:** Descartar rodadas com empate no critério (regenerar se o valor decisivo empata) ou aceitar qualquer item empatado como correto na validação.

#### CORR-015 — Caça Informação: 'mais conteúdo' compara unidades diferentes (g vs L vs ml)

- **Severidade (verificada):** P2
- **Dimensão:** CORRETUDE-B
- **Local:** `components/exercises/attention/CacaItemBarato.tsx:182-211`
- **Confiança:** media
- **Evidência:** most-content usa 'two[0].weight >= two[1].weight'. Quando catProducts.length<2 há fallback a PRODUCTS de categorias diferentes (linha 187-188). weight é número cru sem normalizar unidade: leite tem weight=1 (unit L), arroz weight=1000 (unit g).
- **Cenário:** Fallback sorteia Leite 1L (weight=1) e Arroz 1kg (weight=1000). A pergunta 'qual tem mais conteúdo?' compara 1 vs 1000 → arroz 'vence' por comparar litro (1) com grama (1000). Comparação cross-unidade é semanticamente inválida e pode dar resposta 'correta' arbitrária/errada.
- **Recomendação:** Restringir most-content a produtos de mesma unidade/categoria, ou normalizar tudo para base (g/ml) antes de comparar; nunca comparar weight bruto entre unidades distintas.

#### CORR-016 — LetrasSequencia: número de distratores travado em 2 (Math.min(2,4))

- **Severidade (verificada):** P2
- **Dimensão:** CORRETUDE-B
- **Local:** `components/exercises/memory/LetrasSequencia.tsx:97`
- **Confiança:** alta
- **Evidência:** const distractors = sample(pool.filter(x=>!seq.includes(x)), Math.min(2, 4)); — Math.min(2,4) é sempre 2, constante, ignorando o nível.
- **Cenário:** Diferente dos irmãos (SequenciaItens/ListaDistracao usam spec.distractors), aqui o teclado sempre recebe exatamente 2 distratores, mesmo nos níveis altos onde deveria haver mais interferência. A dificuldade de reconhecimento não escala como projetado — provável valor colado/errado.
- **Recomendação:** Substituir por um campo de spec (ex.: spec.distractors) ou uma fórmula por nível; remover o Math.min(2,4) sem sentido.

#### CORR-017 — ListaDistracao/PadroesRotacao/etc: cabeçalho mostra startLevel fixo, não o nível atual

- **Severidade (verificada):** P2
- **Dimensão:** CORRETUDE-B
- **Local:** `components/exercises/memory/ListaDistracao.tsx:206-209`
- **Confiança:** alta
- **Evidência:** No header: 'Nível {startLevel} · {spec.count} itens'. startLevel é o nível INICIAL (const, nunca muda); spec vem de level (state). Mesmo padrão em SequenciaItens.tsx (200), LetrasSequencia.tsx (214), PadroesRotacao.tsx (346).
- **Cenário:** Paciente sobe do nível 3 para o 6 durante a sessão. spec.count/itens atualizam (5→6 itens), mas o rótulo 'Nível' continua exibindo 3. A informação de nível fica incoerente com a dificuldade real apresentada, confundindo terapeuta/paciente.
- **Recomendação:** Exibir {level} (state) em vez de {startLevel} no cabeçalho durante o jogo.

#### GER-001 — Script db:seed quebrado — ts-node ausente do node_modules e do lockfile

- **Severidade (verificada):** P2
- **Dimensão:** GERAL
- **Local:** `package.json:18`
- **Confiança:** alta
- **Evidência:** "db:seed": "ts-node --project tsconfig.json prisma/seed.ts". Verificado: node_modules/ts-node ABSENT; grep -c '"ts-node"' package-lock.json = 0. Nenhuma config prisma.seed no package.json.
- **Cenário:** Qualquer pessoa (ou pipeline) que rode `npm run db:seed` num ambiente limpo recebe 'ts-node: command not found' e o banco não é populado. O script está listado no CLAUDE.md como comando essencial, induzindo ao erro.
- **Recomendação:** Migrar seed para `tsx` (ou adicionar ts-node como devDependency), ou compilar o seed. Alinhar CLAUDE.md com a realidade do script.

#### GER-002 — Dependências declaradas e nunca usadas (@auth/prisma-adapter, pg, date-fns-tz)

- **Severidade (verificada):** P2
- **Dimensão:** GERAL
- **Local:** `package.json:11`
- **Confiança:** alta
- **Evidência:** grep em app/lib/prisma: PrismaAdapter/@auth/prisma-adapter = 0 ocorrências; `from 'pg'`/new Pool/new Client = 0; date-fns-tz = 0 imports. Instalados: @auth/prisma-adapter 2.11.2, pg 8.21.0, date-fns-tz 3.2.0.
- **Cenário:** NextAuth usa strategy JWT (sem adapter), Prisma faz todas as queries e date-fns puro cobre datas. As 3 libs inflam bundle/superfície de supply-chain e confundem quem lê o manifesto (parece que há acesso pg direto ou adapter de sessão).
- **Recomendação:** Remover @auth/prisma-adapter, pg, @types/pg e date-fns-tz das deps após confirmar zero uso. Mover @types/nodemailer para devDependencies.

#### GER-004 — Cobertura de testes: novas engines de progressão (dual-task, story-trail, focus, genérica) sem teste

- **Severidade (verificada):** P2
- **Dimensão:** GERAL
- **Local:** `lib/adaptive.ts:7`
- **Confiança:** alta
- **Evidência:** vitest.config include: lib/**/*.test.ts → só adaptive.test.ts e scoring.test.ts. sessions/route importa calculateDualTaskProgression, calculateProgression, calculateStoryTrailProgression, calculateFocusProgression — nenhuma tem teste. 24 testes p/ ~41k linhas.
- **Cenário:** As engines mais novas e complexas (nível consolidado, -2 só se muito ruim, subir só com as duas tarefas boas) são as clinicamente críticas e ficam sem rede de segurança. Uma regressão nelas (ex.: consolidatedLevel calculado errado) passa build+tsc+lint e chega em produção sem teste falhando.
- **Recomendação:** Adicionar testes unitários para as 4 engines de progressão cobrindo subir/manter/-2/consolidado; priorizar por serem função pura e fáceis de testar.

#### GER-005 — Timezone divergente: bloqueio/aquecimento diário usa TZ do navegador; streak usa America/Sao_Paulo

- **Severidade (verificada):** P2
- **Dimensão:** GERAL
- **Local:** `app/(patient)/treino/[exercicio]/page.tsx:287`
- **Confiança:** alta
- **Evidência:** isSameLocalDay usa a.getFullYear/getMonth/getDate (TZ do dispositivo). Já hasConsecutiveDays (lib/adaptive.ts:318) força toLocaleDateString('en-CA',{timeZone:'America/Sao_Paulo'}). Duas noções de 'dia' coexistem.
- **Cenário:** Paciente com aparelho em fuso diferente (ex.: viagem, ou device configurado en-US/UTC): o bloqueio 'já fez hoje' e o aquecimento (-2) seguem o dia do dispositivo, mas a conquista de streak conta o dia de São Paulo. Comportamentos de 'virada de dia' ficam inconsistentes entre bloqueio e streak.
- **Recomendação:** Centralizar a chave de dia em uma única função com timeZone America/Sao_Paulo e usá-la tanto no bloqueio/aquecimento quanto no streak.

#### GER-006 — Bloqueio '1x por dia' é só client-side; servidor não valida

- **Severidade (verificada):** P2
- **Dimensão:** GERAL
- **Local:** `app/(patient)/treino/[exercicio]/page.tsx:447`
- **Confiança:** media
- **Evidência:** if (lastAttempt && isSameLocalDay(...)) setBlockedToday(true). O POST /api/sessions (app/api/sessions/route.ts) não tem nenhuma checagem de 'já executou hoje' — grava e roda progressão normalmente.
- **Cenário:** Paciente (ou app com estado corrompido) que dispare POST /api/sessions múltiplas vezes no mesmo dia tem todas as sessões contabilizadas: infla totalAttempts, streak, XP e altera a dificuldade adaptativa mais de uma vez/dia, contornando a regra clínica de 1 execução diária.
- **Recomendação:** Se a regra 1x/dia é clínica, aplicá-la também no servidor (rejeitar ou marcar sessão extra sem afetar progressão), não apenas na UI.

#### GER-007 — Resgate de licença rebaixa terapeuta de ilimitado (-1) para número finito

- **Severidade (verificada):** P2
- **Dimensão:** GERAL
- **Local:** `app/api/auth/redeem-license/route.ts:57`
- **Confiança:** media
- **Evidência:** const current = user.patientLicenses ?? -1; const next = current === -1 ? license.licenses : current + license.licenses; Se -1 (ilimitado), next vira license.licenses (finito).
- **Cenário:** Terapeuta com acesso ilimitado (patientLicenses=-1, default do schema) resgata um código de licença. Em vez de manter ilimitado, passa a ter só license.licenses vagas finitas — perde o ilimitado e pode ser bloqueado de criar pacientes depois. Consome ainda um código pago sem benefício.
- **Recomendação:** Se current === -1 (ilimitado), manter -1 e não consumir/creditar (ou tratar -1 explicitamente como estado a preservar). Definir a semântica de -1 vs códigos.

#### PERF-001 — Lista de pacientes carrega TODO o histórico de sessões (sem take) — PERF-02 corrigido só pela metade

- **Severidade (verificada):** P2
- **Dimensão:** PERFORMANCE  ·  **CWE-1049**
- **Local:** `app/(therapist)/pacientes/page.tsx:29`
- **Confiança:** alta
- **Evidência:** prisma.session.findMany({ where: { patientId: { in: patientIds } }, orderBy: { completedAt: "desc" } })  // sem take
...
sessions: allSessions.filter((s) => s.patientId === p.id).slice(0, 30),   // só as 30 primeiras são usadas
- **Cenário:** O AUDITORIA-2026-05-30.md (linha 65, PERF-02) sinalizou ESTE arquivo E o dashboard: 'session.findMany sem take (traz histórico ilimitado p/ .slice)'. O dashboard foi corrigido com window function ROW_NUMBER() PARTITION BY patientId (dashboard/page.tsx:54-63, 4 ocorrências de ROW_NUMBER), mas pacientes/page.tsx NUNCA foi corrigido (0 ocorrências de ROW_NUMBER/take). A query ainda traz o histórico COMPLETO de todas as sessões de todos os pacientes e joga fora tudo além de 30/paciente em memória. Cenário concreto: um paciente treinando 1x/dia há ~1 ano tem ~365 sessões; com 20-30 pacientes ativos, ao abrir /pacientes o servidor lê e serializa ~7.000-10.000 linhas de Session (incluindo o campo metadata, que na FocusAgents guarda rounds_detail: RoundMetric[] — array grande por sessão, ver FocusAgents.tsx:1086) só para exibir cards que usam as últimas 30. O payload e o tempo de resposta crescem linearmente e sem limite com o tempo de uso, enquanto o dashboard (mesma tela conceitual) já paga só o top-20.
- **Recomendação:** Replicar exatamente o fix já aplicado no dashboard: usar o $queryRaw com ROW_NUMBER() OVER (PARTITION BY patientId ORDER BY completedAt DESC) WHERE rn <= 30, ou fazer N queries com take:30 por paciente. Selecionar apenas as colunas usadas por calculateAdherence/Trend/DomainScore (score, accuracy, domain, completedAt) e omitir metadata, que não é lido nesta tela.
- **Volume/contexto:** Cold path (tela do terapeuta, /pacientes). Volume declarado: 1-30 pacientes, 1 sessão/dia/paciente. O problema é o CRESCIMENTO NÃO LIMITADO: o custo por abertura da tela aumenta a cada dia de uso (sessões acumulam para sempre). Em meses/anos com pacientes assíduos vira transferência de dezenas de milhares de linhas com blobs JSON. Baixa frequência de acesso (terapeuta), mas degradação real e evitável — e o fix já existe pronto no dashboard.

#### PERF-002 — POST /api/sessions executa ~8-11 round-trips sequenciais ao banco no caminho quente

- **Severidade (verificada):** P2
- **Dimensão:** PERFORMANCE  ·  **CWE-1049**
- **Local:** `app/api/sessions/route.ts:153-283`
- **Confiança:** alta
- **Evidência:** const newSession = await prisma.session.create({...});          // 1
const recentSessions = await prisma.session.findMany({...take:20}); // 2
await prisma.exerciseConfig.upsert({...});                       // 3
const existingAchievements = await prisma.achievement.findMany({...}); // 4
... await prisma.achievement.createMany(...)  // 5 (condicional)
... await prisma.alert.deleteMany(...) OU alert.create(...)     // 6
const activePlan = await prisma.trainingPlan.findFirst({...});   // 7
const sessionCount = await prisma.session.count({...});          // 8
const existingCycleAlert = await prisma.alert.findFirst({...});  // 9
const patientInfo = await prisma.patient.findUnique({...});      // 10
await prisma.alert.create({...});                                // 11
- **Cenário:** Cada conclusão de exercício (o evento mais frequente do app) dispara este POST. Antes de responder, o handler encadeia de forma estritamente sequencial (cada await depende do anterior só em parte): findFirst de progressão (dual/story/generic), session.create, session.findMany(20), exerciseConfig.upsert, achievement.findMany, e o bloco de plano/ciclo que sozinho faz trainingPlan.findFirst -> session.count -> alert.findFirst -> patient.findUnique -> alert.create. São 8 a 11 idas ao Postgres em série. Em Vercel single-region + Supabase pooled, cada round-trip custa tipicamente 5-30 ms; 10 em série = ~100-300 ms de latência acumulada apenas em I/O de banco, somada por cima do getServerSession e do JSON. Não quebra nada no volume declarado, mas é latência percebida no fim de cada exercício e é largamente reduzível: várias dessas leituras são independentes (achievement.findMany, trainingPlan.findFirst, o bloco de ciclo) e poderiam ir num Promise.all ou numa única $transaction.
- **Recomendação:** Paralelizar as leituras independentes com Promise.all (ex.: recentSessions + existingAchievements + activePlan juntas após o create). Consolidar o bloco de 'ciclo completo' (findFirst plan -> count -> findFirst alert -> findUnique patient -> create) reduzindo idas: buscar patient.name junto do trainingPlan, e checar o alerta existente em paralelo com o count. Idealmente envolver create+upsert+achievements numa única $transaction para 1 round-trip lógico.
- **Volume/contexto:** HOT path (POST /api/sessions — disparado ao concluir cada exercício, é o endpoint de escrita mais chamado). Volume: 1-30 pacientes x ~3-6 exercícios/dia. Baixa concorrência, mas alta sensibilidade a latência percebida (é o clique 'Salvar e Continuar' do paciente). Sem quebra no volume atual — por isso P2, não P1 — mas ~100-300 ms de I/O serial evitável no caminho mais quente.

#### SEC-002 — Paciente pode gravar campos clínicos do terapeuta via PATCH da sessão terapêutica

- **Severidade (verificada):** P2
- **Dimensão:** SEGURANCA  ·  **CWE-639**
- **Local:** `app/api/therapeutic-sessions/[id]/route.ts:12-22,56-81`
- **Confiança:** alta
- **Evidência:** updateSchema inclui therapistNotes e status; canAccess retorna true p/ PATIENT && ts.patientId===user.patientId; update aplica result.data sem gate de campo por role.
- **Cenário:** Paciente faz PATCH na própria sessão com {therapistNotes:...} ou {status:completed}, sobrescrevendo anotações clínicas do terapeuta e encerrando a sessão. GET esconde therapistNotes do paciente, mas o PATCH deixa escrever.
- **Recomendação:** Allowlist por role — therapistNotes/status só THERAPIST dono.

#### SEC-003 — Hash do PIN do paciente devolvido ao cliente (findMany/findUnique sem select)

- **Severidade (verificada):** P2
- **Dimensão:** SEGURANCA  ·  **CWE-522**
- **Local:** `app/api/patients/route.ts:35-40 (e patients/[id]/route.ts:92-105)`
- **Confiança:** alta
- **Evidência:** findMany({where:{therapistId}}) e findUnique sem select → campo pin (bcrypt, schema.prisma:42) vai no JSON de resposta.
- **Cenário:** Hash bcrypt do PIN trafega ao browser em toda listagem/abertura de paciente. Não é cross-tenant, mas XSS/cache/sessão comprometida permite brute-force offline do PIN de 6 dígitos.
- **Recomendação:** select explícito excluindo pin em todas as leituras de Patient que retornam ao cliente.

#### ARQ-001 — Metadados de exercício triplicados e divergentes entre 3 fontes de verdade

- **Severidade (verificada):** P3  _(auditor propôs P1; rebaixado na verificação adversarial)_
- **Dimensão:** ARQUITETURA
- **Local:** `types/index.ts / lib/domain-taxonomy.ts / lib/exercise-meta.ts:types/index.ts:113 (EXERCISE_DEFINITIONS, 39 ids); lib/domain-taxonomy.ts:15 (DOMAIN_SUBDOMAINS, 35 ids); lib/exercise-meta.ts:15 (EXERCISE_META, 27 ids)`
- **Confiança:** alta
- **Evidência:** Três Record<string, ...> independentes catalogam os mesmos exercícios com conjuntos de ids DIFERENTES. Diff confirmado: em EXERCISE_DEFINITIONS mas ausentes na taxonomia → {desafio-cidade, desafio-orcamento, desafio-supermercado-auditivo, focus-agents-auditivo, restaurante-ordem-auditivo}; na taxonomia mas ausente em EXERCISE_DEFINITIONS → {atencao-dividida}; sem entrada em EXERCISE_META (caem no DEFAULT_META silencioso) → {cubo-corsi, desafio-cidade, estacionamento-logico, identificacao-simbolos, letras-sequencia, lista-distracao, nback, padroes-rotacao, restaurante-ordem, restaurante-ordem-auditivo, sequencia-itens, vigilancia}. Todos são maps soltos: lib/exercise-meta.ts:51 `metaOf = (id) => EXERCISE_META[id] ?? DEFAULT_META` e lib/domain-taxonomy.ts:60 `EXERCISE_DOMAIN` sem chave => undefined. `npx tsc --noEmit` sai 0 — o compilador não detecta a divergência.
- **Cenário:** A terapeuta abre o catálogo em /treino-cognitivo. A tela itera DOMAIN_SUBDOMAINS e busca cada id em EXERCISE_DEFINITIONS com `.filter(Boolean)` (treino-cognitivo/page.tsx:94-97). Consequência concreta: (a) cubo-corsi, nback, letras-sequencia, sequencia-itens, lista-distracao, padroes-rotacao, vigilancia etc. aparecem no catálogo mas com badge de TIPO/DIFICULDADE ERRADO — recebem DEFAULT_META {type:'visual', difficulty:'medio'} mesmo sendo auditivos/espaciais/fáceis; (b) na tela de seleção o filtro por tipo 'Auditiva' NÃO retorna esses exercícios auditivos porque foram rotulados 'visual' por omissão. Nenhum erro, nenhum aviso — a informação clínica exibida à terapeuta é simplesmente incorreta.
- **Recomendação:** Unificar numa única fonte de verdade: adicionar type/difficulty/secondary e subdomínio como campos dentro de EXERCISE_DEFINITIONS (ou derivar domain-taxonomy e exercise-meta programaticamente a partir dela). Trocar os Record soltos por `Record<ExerciseId, ...>` para que a omissão de qualquer exercício vire erro de compilação. Enquanto não unificar, adicionar um teste que garanta que os 3 conjuntos de ids são idênticos.

#### ARQ-005 — Dead code: módulo utils/validateCommand.ts, função buildRound e componentes AgentGrid/FallingAgentsDemo/AtencaoDividida

- **Severidade (verificada):** P3
- **Dimensão:** ARQUITETURA
- **Local:** `utils/validateCommand.ts / utils/generateCommand.ts / components/characters/AgentGrid.tsx / components/characters/FallingAgentsDemo.tsx:utils/validateCommand.ts (101 l, 0 importadores); utils/generateCommand.ts:595 buildRound (export sem consumidor); AgentGrid.tsx (46 l); FallingAgentsDemo.tsx (110 l); AtencaoDividida.tsx (518 l)`
- **Confiança:** alta
- **Evidência:** grep repo-wide por `from "@/utils/validateCommand"|validateCommand(` fora do próprio arquivo → vazio (o único uso é interno ao próprio validateCommand.ts). utils/generateCommand.ts exporta buildRound (linha 595) mas FocusAgents só importa `buildModeRound, roundSignature` (FocusAgents.tsx:16); buildModeRound chama buildModeRoundOnce, não buildRound (só há menção em comentário na linha 1017). AgentGrid e FallingAgentsDemo: grep -rln retorna apenas os próprios arquivos (não importados por nada exceto entre si). AtencaoDividida.tsx: 0 importadores (ver ARQ-004). Total ~1.275 linhas de código morto no repo.
- **Cenário:** Todo esse código é compilado, mantido e potencialmente confunde manutenção. Ex.: um dev vê validateCommand.ts com 11 funções de validação de comando e assume que o FocusAgents as usa para garantir solvabilidade das rodadas — mas nenhuma é chamada; a lógica real de validação está em buildModeRoundOnce. Refatorações 'preservam' esse código morto por medo, aumentando o custo cognitivo de cada mudança em FocusAgents/generateCommand.
- **Recomendação:** Remover utils/validateCommand.ts, a função buildRound de generateCommand.ts, e os componentes AgentGrid.tsx / FallingAgentsDemo.tsx / AtencaoDividida.tsx (após confirmar ARQ-004). Adicionar knip ou ts-prune ao CI para pegar exports/arquivos órfãos automaticamente.

#### ARQ-006 — Fluxo central em god file: switch de 39 casos + EXERCISE_INSTRUCTIONS + HIDE_PROGRESS_WIDGET forçam registro do exercício em 6+ lugares

- **Severidade (verificada):** P3
- **Dimensão:** ARQUITETURA
- **Local:** `app/(patient)/treino/[exercicio]/page.tsx:treino/[exercicio]/page.tsx:60 (EXERCISE_INSTRUCTIONS, 39 entradas), :593 switch (39 cases), :640 HIDE_PROGRESS_WIDGET (Set literal de 37 strings)`
- **Confiança:** media
- **Evidência:** O mesmo arquivo concentra: EXERCISE_INSTRUCTIONS (dict de ~185 linhas, 39 entradas — grep confirma 39), o switch de render (39 cases, linhas 593-635) e o Set HIDE_PROGRESS_WIDGET escrito à mão como uma única string gigante (linha 641). Somado a EXERCISE_DEFINITIONS (types), DOMAIN_SUBDOMAINS (taxonomy), EXERCISE_META (meta), EXERCISE_ICON_IDS (exercise-icons.ts:3) e exercise-science/functional, cada novo exercício exige edição sincronizada em 6 a 8 locais distintos, nenhum deles ligado por tipos que force a completude.
- **Cenário:** Ao adicionar um exercício, é fácil esquecer um dos pontos e não receber erro: esquecer EXERCISE_META → badge de tipo/dificuldade errado (ARQ-001); esquecer HIDE_PROGRESS_WIDGET → widget de progresso duplicado sobre um exercício que já tem barra própria; esquecer DOMAIN_SUBDOMAINS → invisível no catálogo (ARQ-003). O padrão já produziu as divergências de ARQ-001/003/004 justamente porque nada obriga a consistência.
- **Recomendação:** Migrar o registro de exercícios para um único registry declarativo (por id: componente lazy, instruções, hideProgress, domínio, subdomínio, meta), consumido por catálogo, plano e engine. O switch e os dicts viram derivações de uma tabela. Reduz de ~8 pontos de edição para 1 e permite Record<ExerciseId,...> exaustivo.

#### ARQ-007 — God files crescentes e novos desde a auditoria de 30/05 (ARCH-02 deferido segue piorando)

- **Severidade (verificada):** P3
- **Dimensão:** ARQUITETURA
- **Local:** `components/exercises/attention/FocusAgents.tsx / utils/generateCommand.ts / components/exercises/executive/DesafioCidade.tsx:FocusAgents.tsx 1618 l; utils/generateCommand.ts 1293 l; DesafioCidade.tsx 1146 l; Labirinto.tsx 1072 l; CertoOuErrado.tsx 983 l; DesafioSupermercado.tsx 977 l`
- **Confiança:** media
- **Evidência:** wc -l atual: 6 arquivos >900 linhas. A auditoria AUDITORIA-2026-05-30.md (linha 83) registrou ARCH-02 como '16/37 exercícios > 500 linhas; DesafioCidade 1150' e o deferiu. Desde então FocusAgents cresceu para 1.618 (o maior componente do projeto) e surgiu utils/generateCommand.ts com 1.293 linhas — um novo god file NÃO existente na auditoria anterior, que centraliza toda a geração de rodadas dos 4 modos do FocusAgents. tsc/lint passam, então o tamanho não é barrado por nada.
- **Cenário:** FocusAgents + generateCommand somam ~2.900 linhas fortemente acopladas (o componente delega toda a lógica de rodada ao util, que por sua vez depende de data/agents.ts, data/agentAttributes.ts, data/commandTemplates.ts, utils/selectTargets.ts). Qualquer ajuste no elenco/modo exige navegar 4-5 arquivos densos; foi exatamente esse acoplamento que gerou os fixes repetidos de sobreposição/clique registrados no histórico de commits (v2.10.1). O risco de regressão por mudança é alto e cresce a cada versão.
- **Recomendação:** Priorizar a quebra de FocusAgents/generateCommand: extrair por modo (foco/inibição/alternância/desafio) e separar geração de dados (puro) de render (componente). Estabelecer um teto de linhas no CI (ex.: warning > 600) para conter o crescimento, dado que o deferimento de 30/05 não freou a tendência.

#### ARQ-008 — Objeto themeStyles CLINICAL/COLORFUL/GAMIFIED reimplementado por arquivo (DUP-01 deferido segue aberto)

- **Severidade (verificada):** P3
- **Dimensão:** ARQUITETURA
- **Local:** `components/exercises/ExerciseWrapper.tsx (e ~7 outros):ExerciseWrapper.tsx:92-114; também app/(patient)/layout.tsx (12 ocorrências), inicio/page.tsx, progresso/page.tsx, treino/[exercicio]/page.tsx, CertoOuErrado.tsx, Labirinto.tsx, FocusAgents.tsx`
- **Confiança:** alta
- **Evidência:** ExerciseWrapper.tsx:92 `const themeStyles = { CLINICAL:{bg,card,title,text,btn}, COLORFUL:{...}, GAMIFIED:{...} }` e :116 `const s = themeStyles[theme]`. Grep por `CLINICAL:` em components+app acha 8 arquivos, cada um com seu próprio objeto de estilos por tema (contagem: layout.tsx 12, CertoOuErrado 6, etc.). Não existe helper compartilhado (grep por themeStyles/getThemeStyles/THEME_STYLES em lib retorna vazio). AUDITORIA-2026-05-30.md:76 já registra DUP-01 'Tokens de tema reimplementados em ~30 exercícios' como architecture e deferido.
- **Cenário:** Trocar uma cor de tema (ex.: o navy #061326 do CLINICAL) exige editar N arquivos manualmente; esquecer algum produz telas com fundos inconsistentes entre wrapper e exercício — exatamente o tipo de deriva visual que a nota de memória 'tema escuro azul marinho' teve de caçar arquivo a arquivo. Continua igual ao estado de 30/05.
- **Recomendação:** Extrair um único `themeStyles` (ou tokens CSS variáveis por tema) em lib/theme.ts e importar em todos os pontos. Como já é dívida conhecida (DUP-01), agendar a consolidação junto da próxima mexida em tema.

#### ARQ-009 — Pastas vazias e export sem consumidores (useAdaptiveLevel)

- **Severidade (verificada):** P3
- **Dimensão:** ARQUITETURA
- **Local:** `components/reports/ ; app/auth/ ; components/exercises/useExerciseEngine.ts:components/reports/ (vazia); app/auth/ (vazia); useExerciseEngine.ts:86 useAdaptiveLevel`
- **Confiança:** alta
- **Evidência:** `ls -la components/reports/` e `app/auth/` retornam apenas . e .. (diretórios vazios); `find components -type d -empty` confirma components/reports; `find app -type d -empty` confirma app/auth. useExerciseEngine.ts:86 `export function useAdaptiveLevel(...)` — grep por useAdaptiveLevel em app+components fora do arquivo de definição retorna vazio (0 importadores), enquanto o hook irmão useExerciseEngine tem 35 importadores.
- **Cenário:** Ruído estrutural de baixo impacto: app/auth/ vazia coexiste com o route group real app/(auth)/, podendo confundir sobre onde ficam as telas de login; useAdaptiveLevel dá a impressão de ser a API padrão de nível adaptativo mas ninguém usa (os exercícios usam useTimedProgress/lógica própria), levando um dev a adotá-la achando que é o caminho canônico.
- **Recomendação:** Remover as pastas vazias components/reports/ e app/auth/. Remover o export useAdaptiveLevel (ou, se for a API pretendida, migrar os exercícios que hoje reimplementam o nível adaptativo para ela e documentar).

#### CORR-006 — calculateFocusProgression desconhece o teto do modo Foco (7) e pode salvar nivel 8/9 num modo capado em 7

- **Severidade (verificada):** P3
- **Dimensão:** CORRETUDE  ·  **CWE-682**
- **Local:** `lib/adaptive.ts:132-138`
- **Confiança:** media
- **Evidência:** calculateFocusProgression faz lvl = Math.min(9, Math.max(1, Math.round(level))) e sobe se accuracy>=0.80 e lvl<9. O servidor (sessions/route.ts L144-150) chama com meta.level=reachedLevel sem saber o modo. FocusAgents.tsx L1035 usa maxLv 7 para foco e 9 para os demais na subida intra-sessao e envia metadata.mode e level.
- **Cenário:** Modo Foco atinge nivel 7 (teto) com accuracy>=0.80. O servidor calcula calculateFocusProgression(7) e retorna 8, gravando meta.nextLevel 8. Depois patients/[id]/route.ts L82-84 devolve focusLevels.foco 8, mas FocusAgents L1234/L1244 re-clampa a Math.min(7, presLevel)=7. O dado persistido/relatado fica inconsistente (nivel 8 num modo que so vai ate 7).
- **Recomendação:** Passar o modo (ou o maxLevel do modo) para calculateFocusProgression e capar nextLevel por modo (Foco 7, demais 9).

#### CORR-007 — Sessoes abandonadas (score 0) da Ordem da Historia poluem PERFORMANCE_DROP e conquistas de outros exercicios

- **Severidade (verificada):** P3
- **Dimensão:** CORRETUDE  ·  **CWE-682**
- **Local:** `app/api/sessions/route.ts:51-60, 231-247`
- **Confiança:** media
- **Evidência:** Abandono grava sessao real com score 0 e accuracy 0 e retorna cedo. Esse score 0 entra depois em recentSessions (L167, todos exercicios) usado em PERFORMANCE_DROP (L235-236) e em checkAchievements (HIGH_PERFORMER exige as ultimas 5 com score>=80, lib/adaptive.ts L287-290). O abandono so e emitido para ordem-historia (treino/[exercicio]/page.tsx L470).
- **Cenário:** Paciente engaja mas sai da Ordem da Historia apos 20s (sendBeacon grava score 0). Nas proximas sessoes de qualquer exercicio esse 0 entra na janela last5/prev5, podendo disparar PERFORMANCE_DROP falso e bloquear a conquista HIGH_PERFORMER.
- **Recomendação:** Excluir sessoes com metadata.abandoned das consultas de recentSessions usadas em PERFORMANCE_DROP e checkAchievements.

#### CORR-010 — Vigilância: loop de estímulos sem cleanup — setState após unmount

- **Severidade (verificada):** P3  _(auditor propôs P1; rebaixado na verificação adversarial)_
- **Dimensão:** CORRETUDE-B
- **Local:** `components/exercises/attention/Vigilancia.tsx:117-150`
- **Confiança:** media
- **Evidência:** O useEffect só limpa o timer inicial: 'const t=setTimeout(showNext,500); return ()=>clearTimeout(t)'. Os timers encadeados internos (setTimeout(showNext,200) e o de 'interval' ms dentro de showNext) não são rastreados nem cancelados no unmount.
- **Cenário:** São 300 itens (TOTAL_ITEMS) e o timer da sessão pode não encerrar antes. Se o paciente sai da tela/desmonta o componente no meio, showNext continua encadeando setTimeouts, chamando setCurrent/setMisses/setDisplayedStimulus em componente desmontado (warnings/vazamento) e a lógica segue rodando invisível.
- **Recomendação:** Rastrear todos os setTimeouts num ref (array) e limpá-los no cleanup, ou usar uma flag cancelled verificada no início de showNext.

#### CORR-018 — TempoReacao: IDs de balões podem colidir no mesmo lote

- **Severidade (verificada):** P3
- **Dimensão:** CORRETUDE-B
- **Local:** `components/exercises/attention/TempoReacao.tsx:45-55, 234-239`
- **Confiança:** media
- **Evidência:** id: Date.now()*1000 + Math.floor(Math.random()*1000). spawnBatch cria numTargets+numDistr balões sincronamente (mesmo Date.now()), então a unicidade depende só do random(0..999).
- **Cenário:** Num lote grande (nível alto: até ~3 alvos + 6 distratores) dois balões podem sortear o mesmo sufixo aleatório no mesmo ms, gerando ids iguais. Como o React usa key=id e resolvedIds/filtros por id, um clique/exit em um balão afeta o duplicado (remoção/contagem errada de um par).
- **Recomendação:** Usar um contador monotônico incremental (useRef) como id, garantindo unicidade determinística.

#### CORR-019 — CorridaContraOTempo: rodada sem alvos válidos vira inderrotável (imagens quebradas)

- **Severidade (verificada):** P3
- **Dimensão:** CORRETUDE-B
- **Local:** `components/exercises/processing/CorridaContraOTempo.tsx:181-207`
- **Confiança:** baixa
- **Evidência:** O while (linha 191) tenta outras categorias enquanto targets==0, mas após pool.length tentativas segue mesmo com 0 alvos: totalRef.current=newItems.filter(isTarget).length pode ser 0.
- **Cenário:** Se as imagens de todas as categorias falharem em validar (pickValid retorna vazio), a grade fica com 0 alvos. A rodada não pode ser vencida por toque; só encerra por tempo, é marcada 'bad' e o nível cai. Depende de falha de assets, mas degrada a sessão em vez de abortar com aviso.
- **Recomendação:** Se após todas as tentativas targets==0, encerrar a sessão com mensagem de erro de assets em vez de iniciar rodada impossível.

#### CORR-020 — Reports: divisão por zero evitada, mas Math.max(...[]) quando não há sessões válidas

- **Severidade (verificada):** P3
- **Dimensão:** CORRETUDE-B
- **Local:** `app/api/reports/route.ts:186-192, 255-263`
- **Confiança:** baixa
- **Evidência:** sessions = sessionRows.filter(não-abandonadas). calculateDomainScore(sessions) e domainScores.map(...) operam sobre o array; se todas as sessões forem abandonadas, sessions=[] e o desempenho por domínio depende do comportamento de calculateDomainScore com entrada vazia.
- **Cenário:** Paciente com só sessões abandonadas (metadata.abandoned=true) no período. sessions fica vazio; Seção 3 (domínios) e '4. Histórico (últimas 10)' ficam vazias. Não quebra, mas o PDF sai sem números e Total de sessões=0 pode ser confuso — vale confirmar que calculateDomainScore([]) não faz Math.max de array vazio (=-Infinity).
- **Recomendação:** Garantir guarda para sessions vazio (mensagem 'sem sessões válidas no período') e verificar em lib/scoring que agregações com [] não produzem -Infinity/NaN.

#### GER-008 — AlertsPanel: marcar-como-lido sem checar resposta; markAllRead sem try/catch

- **Severidade (verificada):** P3
- **Dimensão:** GERAL
- **Local:** `components/dashboard/AlertsPanel.tsx:61`
- **Confiança:** alta
- **Evidência:** markRead: await fetch(`/api/alerts/${id}`,{method:'PATCH'}); depois setAlerts(...isRead:true) sem checar res.ok. markAllRead (linha 71): Promise.all(...fetch...) sem try/catch; se rejeitar, setLoading(null) não roda e estado local diverge do servidor.
- **Cenário:** PATCH retorna 500 (ou rede cai): a UI ainda marca o alerta como lido localmente (some da lista), mas no banco continua não-lido — some da vista sem ter sido resolvido. Em markAllRead, uma falha deixa o botão 'travado' em loading.
- **Recomendação:** Checar res.ok e reverter estado otimista em falha; envolver markAllRead em try/finally para liberar loading.

#### GER-009 — Parsing de datas do relatório mistura UTC e hora local do servidor

- **Severidade (verificada):** P3
- **Dimensão:** GERAL
- **Local:** `app/api/reports/route.ts:168`
- **Confiança:** media
- **Evidência:** const start = new Date(startStr); const end = new Date(endStr + 'T23:59:59'). 'YYYY-MM-DD' é parseado como UTC; 'YYYY-MM-DDT23:59:59' (sem Z) é parseado como local do servidor (Vercel=UTC). Fronteiras assimétricas.
- **Cenário:** Terapeuta gera relatório para um período. Sessões feitas próximas à meia-noite de São Paulo (que em UTC caem no dia seguinte/anterior) podem ser incluídas ou excluídas incorretamente nas bordas do intervalo, distorcendo contagens e médias do PDF clínico.
- **Recomendação:** Interpretar as datas no fuso America/Sao_Paulo de forma consistente (converter início do dia e fim do dia SP para UTC antes do gte/lte).

#### GER-010 — next-lint deprecado; migração para ESLint CLI pendente (Next 16)

- **Severidade (verificada):** P3
- **Dimensão:** GERAL
- **Local:** `package.json:6`
- **Confiança:** media
- **Evidência:** npx next lint imprime: '`next lint` is deprecated and will be removed in Next.js 16. ... migrate to the ESLint CLI'. Script lint atual = 'next lint'. Next instalado 15.5.18.
- **Cenário:** Ao atualizar para Next 16 (já disponível na linha evolutiva), `npm run lint` deixa de existir e a checagem estática do projeto quebra silenciosamente no CI/local até alguém migrar manualmente para a ESLint CLI.
- **Recomendação:** Planejar migração para ESLint CLI (npx @next/codemod next-lint-to-eslint-cli .) antes de subir para Next 16.

#### GER-011 — 5 warnings de ESLint: exhaustive-deps e ref-cleanup em exercícios

- **Severidade (verificada):** P3
- **Dimensão:** GERAL
- **Local:** `components/exercises/executive/Labirinto.tsx:783`
- **Confiança:** media
- **Evidência:** Warnings: Labirinto.tsx:783 useCallback missing 'elapsedSec','finish','isTimeUp'; MatrizEspacial.tsx:260 useEffect missing 'generateSeq','seqLength','showSequence'; CuboCorsi.tsx:206 e PadroesRotacao.tsx:136 ref '.current' pode ter mudado no cleanup; EstacionamentoLogico.tsx:138 <img> em vez de next/image.
- **Cenário:** exhaustive-deps ausente em Labirinto/MatrizEspacial pode gerar stale closures: o efeito/callback captura valores antigos (ex.: seqLength anterior) e a sequência exibida diverge da esperada em transições de nível. Os ref-cleanup podem limpar timers/refs errados no unmount.
- **Recomendação:** Revisar cada warning: corrigir arrays de dependência (ou justificar com eslint-disable pontual) e copiar refs para variável local no cleanup; trocar <img> por next/image.

#### GER-012 — Seed cria credenciais fracas e previsíveis (senha e PINs hardcoded)

- **Severidade (verificada):** P3
- **Dimensão:** GERAL  ·  **CWE-798**
- **Local:** `prisma/seed.ts:15`
- **Confiança:** media
- **Evidência:** bcrypt.hash('neuropeak123',12) para terapeuta; pin: '1234','5678','9012' para pacientes demo; console loga as credenciais. Arquivo versionado no repo.
- **Cenário:** Se o seed for executado por engano contra um banco de produção/staging, cria conta terapeuta@neuropeak.com com senha pública 'neuropeak123' e pacientes com PINs triviais — porta de entrada conhecida. Mesmo em dev, normaliza credenciais fracas.
- **Recomendação:** Guardar o seed atrás de checagem NODE_ENV!=='production', usar credenciais aleatórias/variáveis de ambiente, e não logar segredos.

#### PERF-003 — FocusAgents pré-carrega e decodifica ~42 PNGs de personagem (~2 MB) no mount

- **Severidade (verificada):** P3
- **Dimensão:** PERFORMANCE  ·  **CWE-1050**
- **Local:** `components/exercises/attention/FocusAgents.tsx:611-622`
- **Confiança:** alta
- **Evidência:** useEffect(() => {
  if (typeof window === "undefined") return;
  const warm: HTMLImageElement[] = [];
  agents.forEach(a => a.images.forEach(img => {
    const im = new window.Image();
    im.decoding = "async";
    im.src = img.src + AGENT_V;
    im.decode?.().catch(() => {});   // decodifica adiantado
    warm.push(im);
  }));
  preloadWarmRef.current = warm;
}, []);
- **Cenário:** Ao montar a FocusAgents (exercício de atenção do paciente), o efeito percorre os 42 agentes-base (agents.length = 42, cada um com 1 imagem 512x768) e força download + decode de todos. Medido: public/exercises/agentes-personagens tem PNGs de ~47 KB em média; 42 imagens = ~2 MB baixados e decodificados de uma vez, mesmo que a rodada mostre só 6-18 personagens (numChars/cfg.chars vão de 4 a 18). Em um tablet/celular modesto do paciente em casa (o dispositivo-alvo), decodificar 42 PNGs grandes de forma adiantada consome CPU/memória no início da sessão. Não trava (o decode é async e as falhas são ignoradas), mas é trabalho e banda desproporcionais ao que a primeira rodada usa. Após o 1º load ficam em cache, então só pesa na primeira abertura do dia.
- **Recomendação:** Pré-carregar sob demanda: decodificar apenas os personagens do roster efetivamente sorteado para a rodada atual (e opcionalmente a próxima), não os 42. Alternativamente, servir versões reduzidas (as imagens são exibidas a ~112px mas têm 512x768) via <Image> do Next ou sprites menores, cortando ~4x a banda.
- **Volume/contexto:** HOT path (tela de exercício do paciente; FocusAgents é um dos exercícios de atenção de uso frequente). Volume: 1 paciente por vez, 1 sessão. Impacto real limitado a ~2 MB + decode na primeira abertura (depois cache), em dispositivo doméstico. Por isso P3: perceptível em hardware fraco/rede lenta, mas não quebra e é amortizado por cache.

#### PERF-004 — DesafioSupermercado pré-carrega 77 PNGs de produto no mount independentemente do nível

- **Severidade (verificada):** P3
- **Dimensão:** PERFORMANCE  ·  **CWE-1050**
- **Local:** `components/exercises/memory/DesafioSupermercado.tsx:628-632`
- **Confiança:** alta
- **Evidência:** // pré-carrega TODAS as fotos de produto (corrige o travamento ao abrir as prateleiras)
useEffect(() => {
  if (typeof window === "undefined") return;
  PRODUCTS.forEach(p => { const im = new window.Image(); im.src = `/exercises/produtos/${p.id}.png`; });
}, []);
// PRODUCTS = Object.values(CATEGORIES).flat();  (77 produtos)
- **Cenário:** Ao abrir o Desafio Supermercado (exercício de memória do paciente), o efeito dispara download de todos os 77 produtos de CATEGORIES (PRODUCTS.length = 77; PNGs em public/exercises/produtos com ~24 KB de média = ~1,8 MB), mesmo nos níveis iniciais que usam uma lista pequena. O comentário admite que foi adicionado para 'corrigir o travamento ao abrir as prateleiras' — ou seja, o pré-load em massa é a mitigação escolhida para o custo real de renderizar muitas <img> não otimizadas de uma vez. Em rede doméstica lenta, ~1,8 MB no mount atrasa o início; em bom link é cache warm e imperceptível.
- **Recomendação:** Pré-carregar somente os produtos que podem aparecer no nível/rodada atual (o gerador já sabe quais categorias/itens serão usados), ou servir imagens otimizadas/menores. A causa raiz do 'travamento' é renderizar muitas <img> full-res simultâneas; reduzir a resolução das PNGs resolve tanto o travamento quanto o custo do pré-load.
- **Volume/contexto:** HOT path (tela de exercício do paciente). Volume: 1 paciente/sessão. ~1,8 MB baixados no mount, amortizado por cache após a 1ª vez. P3: custo real só na primeira abertura em rede fraca.

#### PERF-005 — Imagens de exercício servidas como <img> full-res sem otimização (next/image não usado no hot path)

- **Severidade (verificada):** P3
- **Dimensão:** PERFORMANCE  ·  **CWE-1050**
- **Local:** `components/exercises/attention/FocusAgents.tsx:218`
- **Confiança:** media
- **Evidência:** FocusAgents.tsx:218  <img src={src + AGENT_V} alt={gameAgent.agent.name} ... />   // exibido a CHAR_SIZE=112px, fonte 512x768
DesafioSupermercado.tsx:153  <img src={`/exercises/produtos/${id}.png`} alt="" ... />
next.config.js: images.remotePatterns só cobre o host do Supabase; nenhum uso de next/image para os PNGs locais em /exercises.
- **Cenário:** Os exercícios renderizam personagens/produtos com <img> apontando direto para os PNGs em public/exercises (512x768) exibidos a ~112px (CHAR_SIZE=112 na FocusAgents). Como não passam pelo otimizador do Next (<Image>) nem têm srcset, cada dispositivo baixa a imagem em resolução cheia (~4x maior em cada dimensão do que o exibido). Somado ao pré-load em massa (PERF-003/004), o paciente baixa alguns MB de imagens super-dimensionadas por exercício visual. Não quebra e é cacheado, mas desperdiça banda em tablets/celulares domésticos.
- **Recomendação:** Migrar os PNGs de exercício para next/image (com sizes apropriados) ou pré-gerar variantes reduzidas (ex.: 224px @2x) e servi-las. Isso corta a banda e o custo de decode sem mudar o visual.
- **Volume/contexto:** HOT path (exercícios visuais do paciente). Volume: 1 paciente/sessão, dispositivo doméstico. Cacheável após 1ª carga; impacto é banda/decode na primeira visita de cada exercício. P3.

#### PERF-006 — Polling do Mundo Interior a cada 8s continua mesmo com a aba em segundo plano

- **Severidade (verificada):** P3
- **Dimensão:** PERFORMANCE  ·  **CWE-400**
- **Local:** `components/therapeutic/MundoInterior.tsx:596-600`
- **Confiança:** alta
- **Evidência:** useEffect(() => {
  loadSession();
  pollRef.current = setInterval(loadSession, 8000);
  return () => { if (pollRef.current) clearInterval(pollRef.current); };
}, [loadSession]);
// loadSession faz fetch(`/api/therapeutic-sessions/${sessionId}`) — sem guarda de document.hidden/visibilitychange
- **Cenário:** Enquanto o componente MundoInterior está montado, um GET a /api/therapeutic-sessions/[id] roda a cada 8s indefinidamente, inclusive quando a aba está em segundo plano ou o terapeuta deixou a tela aberta e foi fazer outra coisa. Cada GET faz getServerSession + therapeuticSession.findUnique. Não há guarda de document.hidden nem backoff. No volume declarado (terapeuta solo, no máximo 1 sessão de Mundo Interior aberta por vez) isso é ~450 requisições/hora por aba esquecida aberta — desperdício de função serverless e de query, sem risco de quebra. É a definição de polling sem necessidade quando não há mudança.
- **Recomendação:** Pausar o intervalo quando document.hidden (ouvir visibilitychange) e/ou parar o poll quando a sessão estiver em status final. Opcionalmente aumentar o intervalo — mudanças no Mundo Interior são raras.
- **Volume/contexto:** COLD path (ferramenta do terapeuta, feature premium restrita; 1 sessão aberta por vez). Volume mínimo. P3: desperdício de requisições/CPU serverless em aba ociosa, sem impacto funcional nem em escala.

#### SEC-004 — Sem fail-fast se NEXTAUTH_SECRET ausente/fraco

- **Severidade (verificada):** P3
- **Dimensão:** SEGURANCA  ·  **CWE-1188**
- **Local:** `lib/auth.ts:101`
- **Confiança:** media
- **Evidência:** secret: process.env.NEXTAUTH_SECRET, sem validação de presença/força.
- **Cenário:** Secret ausente/fraco permite forjar JWT (toda a authz depende do token); nada impede regressão do valor corrigido em SEC-08.
- **Recomendação:** Assert de boot (throw se ausente ou < 32 bytes).

#### SEC-005 — Enumeração de código/e-mail por timing (bcrypt só roda se registro existe)

- **Severidade (verificada):** P3
- **Dimensão:** SEGURANCA  ·  **CWE-208**
- **Local:** `lib/auth.ts:58-63`
- **Confiança:** media
- **Evidência:** if (!patient) return null; retorna imediato; bcrypt.compare (custo 10) só para código válido. Análogo em therapist-login:30-33.
- **Cenário:** Medir latência distingue 'código inexistente' de 'existe, PIN errado', estreitando o brute-force do SEC-001.
- **Recomendação:** bcrypt.compare contra hash dummy quando o registro não existir.

#### SEC-006 — CSP com 'unsafe-inline' e 'unsafe-eval' em script-src

- **Severidade (verificada):** P3
- **Dimensão:** SEGURANCA  ·  **CWE-1021**
- **Local:** `next.config.js:9-21`
- **Confiança:** alta
- **Evidência:** script-src 'self' 'unsafe-inline' 'unsafe-eval'. Nenhum sink de XSS confirmado hoje (dangerouslySetInnerHTML só com constantes estáticas).
- **Cenário:** Risco latente — a CSP não seria barreira se surgir um XSS. frame-ancestors/object-src 'none' mitigam parte.
- **Recomendação:** CSP com nonce por-request via middleware.

#### SEC-007 — Content-Disposition monta filename com nome do paciente sem sanitizar aspas

- **Severidade (verificada):** P3
- **Dimensão:** SEGURANCA  ·  **CWE-116**
- **Local:** `app/api/reports/route.ts:303-307`
- **Confiança:** alta
- **Evidência:** filename="relatorio_${patient.name.replace(/\s+/g,"_")}_..." — \s neutraliza CR/LF (sem CRLF injection), mas aspas duplas no nome não são removidas.
- **Cenário:** Aspas no nome quebram o valor entre aspas do filename; impacto baixo (nome vem do próprio terapeuta dono).
- **Recomendação:** Sanitizar para [A-Za-z0-9._-] e usar filename*=UTF-8'' (RFC 5987).

#### SEC-008 — /preview/bichinho pública fora do matcher do middleware (superfície, sem PII)

- **Severidade (verificada):** P3
- **Dimensão:** SEGURANCA  ·  **CWE-668**
- **Local:** `app/preview/bichinho/page.tsx:1-11 (e middleware.ts:50-64)`
- **Confiança:** alta
- **Evidência:** Página client sem getServerSession nem fetch — só arte estática, patientId='preview-demo'; matcher não lista /preview.
- **Cenário:** Visitante anônimo acessa a rota; nenhum dado de paciente vaza (zero queries) — é higiene de superfície, não exposição de dados.
- **Recomendação:** Mover para não-produção ou proteger; confirmar que não há outras rotas /preview com fetch de dados.

---

## Apêndice A — Verificação adversarial (Fase 2)

Todos os 8 findings classificados P1 pelos auditores passaram por um refutador independente, com a ordem explícita de **derrubar** a alegação lendo o código real. Resultado: **8 CONFIRMADOS, 0 refutados** — porém 6 tiveram a severidade **rebaixada** porque os refutadores encontraram mitigadores reais (auto-cura, impacto só cosmético, sem crash, volume baixo). A severidade "verificada" usada neste relatório é a do refutador.

| Finding | Severidade do auditor | Veredicto | Severidade verificada | Motivo do ajuste |
|---|---|---|---|---|
| SEC-001 | P1 | CONFIRMADO | **P1** | Mantido: sem lockout algum na aplicação; credencial clínica. |
| CORR-001 | P1 | CONFIRMADO | P2 | Real, mas afeta só quem chega aos níveis 11–12 do Supermercado. |
| CORR-002 | P1 | CONFIRMADO | P2 | Janela de corrida estreita (poll 8s vs PATCH <1s) + auto-cura no próximo poll. |
| CORR-008 | P1 | CONFIRMADO | P2 | Distorce só o feedback visual da rodada; o score/acurácia salvos ficam corretos. |
| CORR-009 | P1 | CONFIRMADO | P2 | Corrompe métrica de vigilância, mas sem crash e só sob multi-toque impulsivo. |
| CORR-010 | P1 | CONFIRMADO | P3 | React 18 descarta `setState` pós-unmount; timers órfãos inócuos por ~minutos. |
| ARQ-001 | P1 | CONFIRMADO | P3 | Divergência real, mas efeito 100% cosmético (badge/contagem no catálogo). |
| CORR-004+GER-003 | P1/P2 | CONFIRMADO | P2 | Consolidados num só finding (mesma raiz: alerta sem deduplicação). |

**Nenhum finding foi refutado.** Não há, portanto, apêndice de refutados nesta rodada — todos os P1 resistiram à tentativa de derrubada; o que mudou foi a calibração de severidade.

---

## Apêndice B — Comandos executados como evidência

Todos rodados em 2026-07-10, na raiz do projeto, read-only:

```text
$ npx tsc --noEmit
exit=0

$ npm run test        # vitest
 Test Files 2 passed (2)
 Tests 24 passed (24)

$ npm run lint        # contagem de linhas Warning/Error
5 avisos (0 errors)

$ next declarado (package.json) vs instalado (node_modules)
declarado: ^15.3.9   instalado: 15.5.18   → CVE-2025-29927 não se aplica

$ find app/api -name route.ts | wc -l
22 rotas de API

$ linhas TS/TSX (components+app+lib+types+data)
40818
```

### Verificações pontuais confirmadas pelo orquestrador (leitura direta)

- **CORR-001:** `lib/adaptive.ts:94` `Math.min(10, ...)` vs `DesafioSupermercado.tsx:178` `MAX_LEVEL = 12` e `:736` `difficulty: nextLevel` — rebaixamento confirmado.
- **CORR-002:** `MundoInterior.tsx:598` `setInterval(loadSession, 8000)` incondicional; `:602-605` update otimista sem guarda de escrita-em-voo.
- **CORR-009:** `Vigilancia.tsx:185-188` ramo `!isTarget` incrementa `falseAlarms` sem `responded.current = true`.
- **SEC-002:** `therapeutic-sessions/[id]/route.ts:32` `canAccess` libera PATIENT; `:12-22` schema inclui `therapistNotes`; `:77-80` aplica `result.data` sem gate por papel.
- **SEC-003:** `patients/route.ts:35` `findMany({ where: { therapistId } })` sem `select` → `pin` no payload.
- **GER-007:** `redeem-license/route.ts:57-58` `current === -1 ? license.licenses : ...`; comentário em `patients/route.ts:66` confirma `-1 = ilimitado`.

---

_Relatório gerado na Fase 2 da auditoria. Rastreabilidade: findings originais preservados com IDs estáveis; severidades ajustadas pela verificação adversarial da Fase 2. Próxima etapa: documentação (Fase 3) — nenhuma correção de código foi feita._
