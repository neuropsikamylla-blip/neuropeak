# ADR-006 — Banco como fonte da verdade; localStorage como cache otimista

- **Status:** registrada retroativamente em 2026-07-10

- **Contexto:** os exercícios rodam offline-tolerantes no dispositivo do
  paciente e precisam de resposta imediata (nível corrente, estado da sessão em
  andamento) sem esperar a rede. Ao mesmo tempo, os dados clínicos precisam ser
  duráveis e acessíveis pelo terapeuta em qualquer aparelho — portanto a verdade
  tem de morar no servidor.

- **Decisão:** o PostgreSQL (via Prisma, ADR-002) é a fonte da verdade dos dados
  clínicos; o `localStorage` serve como cache otimista no cliente. Na tela de
  treino (`app/(patient)/treino/[exercicio]/page.tsx`, `"use client"`), o config
  do exercício é buscado da API (`:399`) e o estado da sessão é espelhado em
  `localStorage` para leitura/escrita rápida (`:425-429`, `:513-518`); o
  resultado final é enviado ao servidor por `fetch("/api/sessions")` (`:496`) e,
  no descarregamento da página, por `navigator.sendBeacon` para não perder a
  gravação (`:484`). **Exceção conhecida:** o progresso do Pet e da Skill Tree
  vive **apenas** no `localStorage`, chaveado por paciente (`np_pet_<id>`,
  `np_skills_<id>`, `np_xp_<id>`) — `lib/pet.ts:110-133,161-209` e
  `lib/skilltree.ts:102-126`; não há rota de API que persista esses estados no
  banco.

- **Alternativas consideradas:** persistir tudo no servidor a cada interação
  (mais durável, porém sem resiliência offline e com mais latência) ou manter
  tudo só no cliente. O código adota o híbrido para a maioria dos dados; para
  Pet/Skill Tree, não documentado — a persistência ficou só no cliente sem uma
  contrapartida no servidor.

- **Consequências:**
  - Positivas: UI responsiva e tolerante a rede instável; a gravação final por
    `sendBeacon` protege contra perda ao fechar a aba; dados clínicos
    permanecem duráveis no banco.
  - Negativas / dívidas observadas: Pet e Skill Tree só em `localStorage`
    causam perda silenciosa ao trocar de aparelho ou limpar o navegador
    (ARQ-002) — dívida que decorre diretamente desta decisão. O bloqueio "1x por
    dia" é só client-side e não é validado no servidor (GER-006), e o
    aquecimento/streak usa fusos divergentes entre navegador e servidor
    (GER-005). No Mundo Interior o polling de 8s sobrescreve o update otimista e
    perde progresso (CORR-002).
