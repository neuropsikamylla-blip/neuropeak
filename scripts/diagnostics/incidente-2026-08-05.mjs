/**
 * AUDITORIA DO INCIDENTE DE 05/ago/2026 — DIAGNÓSTICO SOMENTE LEITURA
 *
 * FINALIDADE
 *   Medir o alcance do incidente em que o `schema.prisma` declarava três campos de tutorial que o
 *   banco não tinha. O Prisma Client, gerado a partir do schema, passou a pedir colunas
 *   inexistentes, e toda consulta a `ExerciseConfig` quebrava com erro 500 — inclusive o `upsert`
 *   que atualiza a progressão ao fim de cada sessão.
 *
 * DATA DO INCIDENTE
 *   Início: v2.73.0 — 04/08/2026 23:46 (Brasília) = 05/08/2026 02:46 UTC
 *   Fim:    v2.75.1 — 05/08/2026 15:51 (Brasília) = 05/08/2026 18:51 UTC
 *   Duração aproximada: 16 horas.
 *
 * CARÁTER SOMENTE LEITURA
 *   Executa apenas SELECT. Não há UPDATE, INSERT, DELETE, ALTER, CREATE, DROP nem TRUNCATE.
 *   A função `exigirSomenteLeitura` recusa qualquer consulta que não comece com SELECT ou WITH,
 *   ou que contenha comando de escrita — é a última barreira antes do banco.
 *
 * COMO EXECUTAR
 *   node scripts/diagnostics/incidente-2026-08-05.mjs
 *
 *   Lê DATABASE_URL de `.env.local` (padrão do projeto) ou de `.env`, com o ambiente como reserva.
 *   Nenhuma credencial é impressa em nenhum momento.
 *
 * ⚠️ SOBRE A SAÍDA
 *   As consultas 2 e 3 imprimem `patientId` e `exerciseId` — identificadores técnicos necessários
 *   para localizar registros a reparar. NÃO compartilhe a saída publicamente, em capturas de tela
 *   ou em canais abertos. Nomes, e-mails e dados clínicos nunca são consultados.
 *
 * RESULTADO DA EXECUÇÃO DE 05/ago/2026
 *   Zero sessões na janela. Nenhum paciente treinou durante o incidente, e `Session` e
 *   `ExerciseConfig` permaneceram sincronizados. Nenhuma reparação foi necessária.
 *   O script fica versionado para auditorias futuras do mesmo tipo.
 */
import { readFileSync } from "node:fs";
import { PrismaClient } from "@prisma/client";

// ── .env: carregado à mão porque o projeto não tem dotenv ────────────────────
// A credencial nunca é impressa.
function carregarEnv() {
  // O projeto usa .env.local (padrão Next.js); .env fica como reserva.
  for (const arquivo of [".env.local", ".env"]) carregarArquivo(arquivo);
}

function carregarArquivo(arquivo) {
  try {
    for (const linha of readFileSync(arquivo, "utf8").split("\n")) {
      const limpa = linha.trim();
      if (!limpa || limpa.startsWith("#")) continue;
      const igual = limpa.indexOf("=");
      if (igual < 0) continue;
      const chave = limpa.slice(0, igual).trim();
      const valor = limpa.slice(igual + 1).trim().replace(/^["']|["']$/g, "");
      if (!process.env[chave]) process.env[chave] = valor;
    }
  } catch {
    // Arquivo ausente: seguimos para o próximo, ou para o ambiente.
  }
}
carregarEnv();

if (!process.env.DATABASE_URL) {
  console.error("DATABASE_URL não encontrada (nem no .env, nem no ambiente).");
  process.exit(1);
}

// ── Janela do incidente, em UTC ──────────────────────────────────────────────
// Brasília (-03): 04/08 23:46 → 05/08 15:51   |   UTC: 05/08 02:46 → 05/08 18:51
// O Prisma mapeia DateTime para timestamp(3) SEM fuso e grava em UTC.
const INICIO = "2026-08-05 02:46:00";
const FIM = "2026-08-05 18:51:00";

const CONSULTAS = [
  {
    titulo: "1. VOLUME NA JANELA",
    sql: `
      SELECT count(*)                     AS sessoes_na_janela,
             count(DISTINCT "patientId")  AS pacientes_afetados,
             count(DISTINCT "exerciseId") AS exercicios_afetados,
             min("completedAt")           AS primeira,
             max("completedAt")           AS ultima
      FROM "Session"
      WHERE "completedAt" >= TIMESTAMP '${INICIO}'
        AND "completedAt" <  TIMESTAMP '${FIM}'`,
  },
  {
    titulo: "2. ESTADO ATUAL × VALORES CANDIDATOS",
    sql: `
      SELECT s."patientId",
             s."exerciseId",
             count(*)                                  AS sessoes_na_janela,
             c."totalAttempts"                         AS attempts_atual,
             COALESCE(c."totalAttempts", 0)            AS attempts_base,
             COALESCE(c."totalAttempts", 0) + count(*) AS attempts_proposto,
             c."lastAttemptAt"                         AS ultimo_atual,
             max(s."completedAt")                      AS ultimo_proposto,
             c."currentDifficulty"                     AS dificuldade_atual,
             (c.id IS NULL)                            AS config_ausente
      FROM "Session" s
      LEFT JOIN "ExerciseConfig" c
             ON c."patientId"  = s."patientId"
            AND c."exerciseId" = s."exerciseId"
      WHERE s."completedAt" >= TIMESTAMP '${INICIO}'
        AND s."completedAt" <  TIMESTAMP '${FIM}'
      GROUP BY s."patientId", s."exerciseId",
               c.id, c."totalAttempts", c."lastAttemptAt", c."currentDifficulty"
      ORDER BY s."patientId", s."exerciseId"`,
  },
  {
    titulo: "3. NÍVEL RECUPERÁVEL DO METADATA (última sessão de cada par)",
    sql: `
      WITH ranqueada AS (
        SELECT "patientId", "exerciseId", "completedAt", metadata,
               ROW_NUMBER() OVER (
                 PARTITION BY "patientId", "exerciseId" ORDER BY "completedAt" DESC
               ) AS posicao
        FROM "Session"
        WHERE "completedAt" >= TIMESTAMP '${INICIO}'
          AND "completedAt" <  TIMESTAMP '${FIM}'
      )
      SELECT "patientId",
             "exerciseId",
             "completedAt"                                          AS ultima_sessao,
             substring(metadata from '"endedLevel"\\s*:\\s*([0-9]+)') AS nivel_recuperavel,
             CASE WHEN metadata ~ '"endedLevel"\\s*:\\s*[0-9]+'
                  THEN 'reconstrucao exata'
                  ELSE 'nao reconstruir automaticamente'
             END                                                    AS veredito
      FROM ranqueada
      WHERE posicao = 1
      ORDER BY "exerciseId", "patientId"`,
  },
];

/** Recusa qualquer coisa que não seja leitura. Última barreira antes do banco. */
function exigirSomenteLeitura(sql) {
  const primeiraPalavra = sql.trim().split(/\s+/)[0].toUpperCase();
  if (primeiraPalavra !== "SELECT" && primeiraPalavra !== "WITH") {
    throw new Error(`BLOQUEADO: consulta não é de leitura (começa com "${primeiraPalavra}")`);
  }
  const proibidos = /\b(UPDATE|INSERT|DELETE|ALTER|CREATE|DROP|TRUNCATE|GRANT|REVOKE|COPY)\b/i;
  if (proibidos.test(sql)) {
    throw new Error("BLOQUEADO: consulta contém comando de escrita");
  }
}

/** count(*) do Postgres chega como BigInt e quebra o JSON.stringify. */
function legivel(valor) {
  if (typeof valor === "bigint") return Number(valor);
  if (valor instanceof Date) return valor.toISOString().replace("T", " ").slice(0, 19) + " UTC";
  if (valor === null) return "—";
  return valor;
}

const prisma = new PrismaClient();

try {
  console.log("\nAUDITORIA DO INCIDENTE DE 05/ago/2026 — SOMENTE LEITURA");
  console.log(`Janela (UTC): ${INICIO}  →  ${FIM}`);
  console.log(`Equivalente em Brasília: 04/08 23:46 → 05/08 15:51\n`);

  for (const { titulo, sql } of CONSULTAS) {
    exigirSomenteLeitura(sql);
    const linhas = await prisma.$queryRawUnsafe(sql);
    console.log("─".repeat(78));
    console.log(titulo);
    console.log("─".repeat(78));
    if (linhas.length === 0) {
      console.log("  (nenhuma linha)\n");
      continue;
    }
    const tratadas = linhas.map((linha) =>
      Object.fromEntries(Object.entries(linha).map(([k, v]) => [k, legivel(v)])),
    );
    console.table(tratadas);
    console.log(`  ${tratadas.length} linha(s)\n`);
  }
} catch (erro) {
  console.error("\nFALHA:", erro.message);
  process.exitCode = 1;
} finally {
  await prisma.$disconnect();
}
