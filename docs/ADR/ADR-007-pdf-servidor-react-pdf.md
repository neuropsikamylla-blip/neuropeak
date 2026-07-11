# ADR-007 — Geração de relatórios PDF no servidor com @react-pdf/renderer

- **Status:** registrada retroativamente em 2026-07-10

- **Contexto:** o terapeuta precisa gerar relatórios clínicos em PDF a partir de
  dados do paciente (sessões, scores por domínio, recomendações). O documento
  contém dados sensíveis e depende de escopo de inquilino, então não deve ser
  montado no cliente; e a biblioteca de renderização depende de módulos nativos
  incompatíveis com o bundling padrão do Next para o servidor.

- **Decisão:** gerar o PDF no servidor, na rota `POST /api/reports`
  (`export const dynamic = "force-dynamic"`, `app/api/reports/route.ts:1`). O
  documento é montado com `@react-pdf/renderer` via `createElement(Document, ...)`
  e serializado com `renderToBuffer` (`app/api/reports/route.ts:6-13,228,301`).
  O acesso é escopado ao inquilino: `therapistId` vem da sessão e as consultas
  filtram por ele (`app/api/reports/route.ts:158,172,178`). Para viabilizar o
  bundling no servidor, `@react-pdf/renderer` é listado em
  `serverExternalPackages` do Next, junto de `@prisma/client` e `bcryptjs`
  (`next.config.js:38`), e o webpack desabilita o alias `canvas`
  (`next.config.js:55-58`).

- **Alternativas consideradas:** gerar o PDF no cliente (rejeitado — exporia
  dados e a biblioteca é pesada) ou usar renderização HTML→PDF headless
  (não documentado; não há evidência de tal caminho no código).

- **Consequências:**
  - Positivas: dados sensíveis nunca deixam o servidor até o PDF pronto; escopo
    de inquilino aplicado nas queries; a biblioteca roda sem quebrar o bundle
    graças a `serverExternalPackages` e ao alias `canvas` desabilitado.
  - Negativas / dívidas observadas: como o PDF é síntese de dados agregados,
    surgem bugs de borda no cálculo — `Math.max(...[])` quando não há sessões
    válidas (CORR-020) e mistura de UTC com hora local do servidor no parsing de
    datas (GER-009). O nome do paciente entra no `Content-Disposition` sem
    sanitizar aspas (SEC-007).
