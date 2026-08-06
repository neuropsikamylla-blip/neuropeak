/**
 * PROVA DE ISOLAMENTO CLÍNICO DO TUTORIAL — SOMENTE LEITURA
 *
 * FINALIDADE
 *   Provar que concluir o tutorial da T1 não move nenhuma métrica clínica. Fotografa o estado,
 *   e comparado com uma segunda execução mostra exatamente o que mudou entre as duas.
 *
 *   O que DEVE mudar ao concluir um tutorial:
 *     - tutorialSource do par paciente/exercício: BACKFILL (ou nulo) → PATIENT
 *     - tutorialCompletedAt e tutorialVersion
 *
 *   O que NÃO PODE mudar:
 *     - currentDifficulty · totalAttempts · lastAttemptAt
 *     - contagem de Session · Achievement · Alert
 *     - score e accuracy de qualquer Session
 *
 * COMO USAR
 *   node scripts/diagnostics/isolamento-tutorial.mjs > antes.json
 *   (concluir o tutorial no aparelho)
 *   node scripts/diagnostics/isolamento-tutorial.mjs > depois.json
 *   node scripts/diagnostics/isolamento-tutorial.mjs --comparar antes.json depois.json
 *
 * CARÁTER SOMENTE LEITURA
 *   Só executa `count`, `groupBy`, `aggregate` e `findMany` do Prisma. Não há create, update,
 *   upsert, delete nem SQL cru — não existe caminho de escrita neste arquivo.
 *
 * ⚠️ A saída traz `patientId` e `exerciseId` (identificadores técnicos, necessários para localizar
 *    o par testado). Nenhum nome, e-mail ou dado clínico é consultado. Não publique a saída.
 */
import { readFileSync } from "node:fs";

for (const arquivo of [".env.local", ".env"]) {
  try {
    for (const linha of readFileSync(arquivo, "utf8").split("\n")) {
      const limpa = linha.trim();
      if (!limpa || limpa.startsWith("#")) continue;
      const igual = limpa.indexOf("=");
      if (igual < 0) continue;
      const chave = limpa.slice(0, igual).trim();
      if (!process.env[chave]) {
        process.env[chave] = limpa.slice(igual + 1).trim().replace(/^["']|["']$/g, "");
      }
    }
  } catch {
    // Arquivo ausente: seguimos para o próximo, ou para o ambiente.
  }
}

const [, , modo, arquivoAntes, arquivoDepois] = process.argv;

// ── Modo comparação: não abre conexão nenhuma, só lê os dois JSON ────────────
if (modo === "--comparar") {
  const antes = JSON.parse(readFileSync(arquivoAntes, "utf8"));
  const depois = JSON.parse(readFileSync(arquivoDepois, "utf8"));

  const CLINICO = [
    "totalSession", "totalAchievement", "totalAlert", "totalExerciseConfig",
    "somaCurrentDifficulty", "somaTotalAttempts", "maxLastAttemptAt", "somaScore", "somaAccuracy",
  ];
  const TUTORIAL = ["comBackfill", "comPatient", "comTutorialCompleto"];

  let violacoes = 0;
  console.log("── MÉTRICAS CLÍNICAS (devem ser IDÊNTICAS) ──");
  for (const chave of CLINICO) {
    const igual = String(antes[chave]) === String(depois[chave]);
    if (!igual) violacoes++;
    console.log(
      `  ${igual ? "OK      " : "VIOLADO "} ${chave.padEnd(22)} ${String(antes[chave]).padEnd(26)} → ${depois[chave]}`,
    );
  }

  console.log("\n── ESTADO DO TUTORIAL (aqui a mudança é esperada) ──");
  for (const chave of TUTORIAL) {
    const seta = antes[chave] === depois[chave] ? "=" : "→";
    console.log(`  ${chave.padEnd(22)} ${String(antes[chave]).padEnd(26)} ${seta} ${depois[chave]}`);
  }

  console.log(
    violacoes === 0
      ? "\n✅ ISOLAMENTO PROVADO: nenhuma métrica clínica se moveu."
      : `\n❌ ${violacoes} MÉTRICA(S) CLÍNICA(S) ALTERADA(S) — o tutorial contaminou o treino.`,
  );
  process.exit(violacoes === 0 ? 0 : 1);
}

// ── Modo fotografia ──────────────────────────────────────────────────────────
const { PrismaClient } = await import("@prisma/client");
const prisma = new PrismaClient();

try {
  const configs = await prisma.exerciseConfig.findMany({
    select: {
      patientId: true, exerciseId: true, currentDifficulty: true, totalAttempts: true,
      lastAttemptAt: true, tutorialCompletedAt: true, tutorialVersion: true, tutorialSource: true,
    },
    orderBy: [{ patientId: "asc" }, { exerciseId: "asc" }],
  });
  const somaSession = await prisma.session.aggregate({ _sum: { score: true, accuracy: true } });

  const soma = (campo) => configs.reduce((total, linha) => total + (linha[campo] ?? 0), 0);
  const datas = configs.map((c) => c.lastAttemptAt).filter(Boolean).map((d) => d.getTime());

  console.log(JSON.stringify({
    totalExerciseConfig: configs.length,
    totalSession: await prisma.session.count(),
    totalAchievement: await prisma.achievement.count(),
    totalAlert: await prisma.alert.count(),
    somaCurrentDifficulty: soma("currentDifficulty"),
    somaTotalAttempts: soma("totalAttempts"),
    maxLastAttemptAt: datas.length ? new Date(Math.max(...datas)).toISOString() : null,
    somaScore: somaSession._sum.score ?? 0,
    // Acurácia é fracionária: arredondar evita ruído de ponto flutuante entre execuções.
    somaAccuracy: Number((somaSession._sum.accuracy ?? 0).toFixed(6)),
    comBackfill: configs.filter((c) => c.tutorialSource === "BACKFILL").length,
    comPatient: configs.filter((c) => c.tutorialSource === "PATIENT").length,
    comTutorialCompleto: configs.filter((c) => c.tutorialCompletedAt !== null).length,
    // Detalhe por par, para localizar exatamente qual registro mudou.
    pares: configs.map((c) => ({
      patientId: c.patientId,
      exerciseId: c.exerciseId,
      currentDifficulty: c.currentDifficulty,
      totalAttempts: c.totalAttempts,
      lastAttemptAt: c.lastAttemptAt?.toISOString() ?? null,
      tutorialSource: c.tutorialSource,
      tutorialVersion: c.tutorialVersion,
    })),
  }, null, 2));
} catch (erro) {
  console.error("FALHA:", erro.message);
  process.exitCode = 1;
} finally {
  await prisma.$disconnect();
}
