/**
 * PACIENTE TÉCNICO DE TESTE — validação do tutorial da T1 no Span Direto
 *
 * POR QUE EXISTE
 *   O único par de `span-numerico` no banco está marcado como BACKFILL, então aquele paciente
 *   pula o tutorial — comportamento correto, mas inútil para validar a tela. Este script cria um
 *   paciente exclusivo para teste, sem nenhum ExerciseConfig, para que o tutorial apareça
 *   naturalmente na primeira abertura e seja pulado na segunda.
 *
 * O QUE ELE NÃO FAZ
 *   Não toca em paciente real. Não altera o registro BACKFILL existente. Não cria ExerciseConfig,
 *   Session, plano nem qualquer métrica — o paciente nasce limpo, que é justamente a condição do
 *   teste. Não decrementa licença quando a conta é ilimitada (patientLicenses = -1).
 *
 * IDEMPOTENTE
 *   Rodar duas vezes não cria dois pacientes: se já existir um com o mesmo nome técnico, apenas
 *   informa o estado. Para recomeçar do zero, use --remover.
 *
 * ⚠️ O PIN NUNCA É IMPRESSO AQUI. Ele aparece na ficha do paciente no próprio sistema, como em
 *    qualquer outro paciente — que é o caminho normal e não expõe credencial em log ou terminal.
 *
 * ⛔ DECISÃO CONGELADA DA T1 (05/ago/2026) — NÃO CRIAR PACIENTE TÉCNICO NAS PRÓXIMAS CONVERSÕES
 *    Este script existe para a conversão de referência do Span Direto, e não deve ser reusado
 *    como rotina. Nas conversões seguintes, use um paciente de teste JÁ EXISTENTE. Criar outro
 *    exige autorização explícita dela, pedida na hora — nunca presumida a partir desta.
 *    Por isso a criação exige a confirmação abaixo; sem ela, o script apenas informa o estado.
 *
 * USO
 *   node scripts/diagnostics/paciente-teste-t1.mjs --estado   só consulta, não escreve (padrão)
 *   node scripts/diagnostics/paciente-teste-t1.mjs --criar-com-autorizacao   cria
 *   node scripts/diagnostics/paciente-teste-t1.mjs --corrigir-codigo  conserta só o patientCode
 *   node scripts/diagnostics/paciente-teste-t1.mjs --remover  apaga o paciente de teste
 */
import { readFileSync } from "node:fs";
import { randomInt } from "node:crypto";

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

// Nome genérico de propósito. Antes era "[TESTE T1] Validação Span Direto", herdado da conversão de
// referência de agosto — o que fazia o paciente aparecer na lista dela com o nome de uma validação
// que já terminou, sem relação com a que estivesse em curso. O script identifica o paciente POR
// ESTE NOME (é assim que ele é idempotente), então mudá-lo só é seguro quando não existe nenhum.
const NOME_TECNICO = "[TESTE] Paciente técnico";
const modo = process.argv[2];

const { PrismaClient } = await import("@prisma/client");
const bcrypt = (await import("bcryptjs")).default;

const prisma = new PrismaClient();

/**
 * ⚠️ LIÇÃO DE 05/ago/2026: a primeira versão deste script INVENTOU o formato do código
 * (`COG` + 6 caracteres alfanuméricos) e o paciente técnico ficou impossível de autenticar. O
 * provider `patient-pin` (`lib/auth.ts`) só trata o texto como código quando ele casa
 * `/^COG\d{4,6}$/`; qualquer outro formato é tratado como id (cuid), não encontra ninguém e
 * devolve "ID de paciente ou PIN incorretos" — antes mesmo de olhar o PIN.
 *
 * Estas funções agora replicam FIELMENTE `generatePin` e `generatePatientCode` de `lib/utils.ts`
 * (o script é .mjs e não importa TypeScript), e o código gerado é conferido contra o mesmo regex
 * do login antes de ser usado. Se divergir, o script para em vez de gravar credencial inútil.
 */
const REGEX_DO_LOGIN = /^COG\d{4,6}$/; // cópia literal de lib/auth.ts

/** Igual a generatePin(): CSPRNG, 6 dígitos (100000–999999). */
function gerarPin() {
  return randomInt(100000, 1000000).toString();
}

/** Igual a generatePatientCode(): CSPRNG, 5 dígitos (10000–99999) prefixados com COG. */
function gerarCodigo() {
  return `COG${randomInt(10000, 100000).toString()}`;
}

/** Repete até não colidir. Recusa qualquer código que o login não saberia interpretar. */
async function gerarCodigoUnico() {
  for (let tentativa = 0; tentativa < 40; tentativa++) {
    const codigo = gerarCodigo();
    if (!REGEX_DO_LOGIN.test(codigo)) {
      throw new Error(`código "${codigo}" não casa o regex do login — geração abortada`);
    }
    const existe = await prisma.patient.findUnique({ where: { patientCode: codigo } });
    if (!existe) return codigo;
  }
  throw new Error("não foi possível gerar um código único");
}

async function mostrarEstado(paciente) {
  const configs = await prisma.exerciseConfig.findMany({
    where: { patientId: paciente.id },
    select: { exerciseId: true, tutorialSource: true, tutorialVersion: true, totalAttempts: true },
  });
  const sessoes = await prisma.session.count({ where: { patientId: paciente.id } });

  console.log(`  id ................. ${paciente.id}`);
  console.log(`  código de acesso ... ${paciente.patientCode}`);
  console.log(`  tema ............... ${paciente.theme}`);
  console.log(`  ExerciseConfig ..... ${configs.length}`);
  console.log(`  Session ............ ${sessoes}`);
  const span = configs.find((c) => c.exerciseId === "span-numerico");
  console.log(
    `  span-numerico ...... ${span ? `${span.tutorialSource ?? "sem tutorial"} (v${span.tutorialVersion ?? "—"}, ${span.totalAttempts} tentativas)` : "NENHUM — o tutorial vai aparecer ✅"}`,
  );
  console.log("\n  O PIN está na ficha do paciente, no sistema. Não é impresso aqui.");
}

try {
  const existente = await prisma.patient.findFirst({ where: { name: NOME_TECNICO } });

  if (modo === "--remover") {
    if (!existente) {
      console.log("Nada a remover: o paciente de teste não existe.");
    } else {
      // Os filhos de Patient são onDelete: Cascade — configs e sessions do teste vão junto.
      await prisma.patient.delete({ where: { id: existente.id } });
      console.log(`Paciente de teste removido (id ${existente.id}).`);
    }
  } else if (modo === "--corrigir-codigo") {
    // Conserta APENAS o patientCode de um paciente técnico cujo código não casa o regex do login.
    // Não toca em pin, pinPlain, id, nome, tema nem em nada clínico.
    if (!existente) throw new Error("o paciente de teste não existe");
    if (REGEX_DO_LOGIN.test(existente.patientCode ?? "")) {
      console.log(`Nada a corrigir: ${existente.patientCode} já é um código válido.`);
    } else {
      const novo = await gerarCodigoUnico();
      const antes = await prisma.patient.findUnique({ where: { id: existente.id } });
      const depois = await prisma.patient.update({
        where: { id: existente.id },
        data: { patientCode: novo },
      });

      // Prova de que só o código mudou: todo o resto tem de bater campo a campo.
      const intactos = Object.keys(antes).filter((campo) => campo !== "patientCode" && campo !== "updatedAt");
      const divergentes = intactos.filter(
        (campo) => String(antes[campo]) !== String(depois[campo]),
      );

      console.log("PATIENTCODE CORRIGIDO\n");
      console.log(`  id ............ ${depois.id} (inalterado)`);
      console.log(`  código antes .. ${existente.patientCode}  → casa o regex do login: false`);
      console.log(`  código agora .. ${depois.patientCode}  → casa o regex do login: ${REGEX_DO_LOGIN.test(depois.patientCode)}`);
      console.log(`  pin (hash) .... ${antes.pin === depois.pin ? "INALTERADO" : "*** MUDOU ***"}`);
      console.log(`  pinPlain ...... ${antes.pinPlain === depois.pinPlain ? "INALTERADO" : "*** MUDOU ***"}`);
      console.log(`  demais campos . ${divergentes.length === 0 ? "todos inalterados" : `*** DIVERGEM: ${divergentes.join(", ")} ***`}`);
      console.log(`  (updatedAt muda por definição: é carimbo automático do Prisma)`);
      if (divergentes.length > 0) process.exitCode = 1;
    }
  } else if (modo === "--estado") {
    if (!existente) console.log("O paciente de teste ainda não existe.");
    else {
      console.log("PACIENTE DE TESTE — estado atual\n");
      await mostrarEstado(existente);
    }
  } else if (existente) {
    console.log("O paciente de teste JÁ EXISTE — nada foi criado.\n");
    await mostrarEstado(existente);
  } else if (modo !== "--criar-com-autorizacao") {
    console.log("O paciente de teste não existe, e NADA foi criado.\n");
    console.log("  Decisão congelada da T1: não criar paciente técnico nas próximas conversões.");
    console.log("  Use um paciente de teste já existente. Criar outro exige autorização");
    console.log("  explícita dela, pedida na hora — e então rode com --criar-com-autorizacao.");
  } else {
    const terapeuta = await prisma.user.findFirst({ select: { id: true, patientLicenses: true } });
    if (!terapeuta) throw new Error("nenhum terapeuta cadastrado");

    // Hash e código são calculados FORA da transação, como faz a API: bcrypt é deliberadamente
    // lento e a busca por código único faz consultas próprias — juntos estouram os 5 s do
    // Prisma e a transação morre antes do create.
    const pinLimpo = gerarPin();
    const hashDoPin = await bcrypt.hash(pinLimpo, 10);
    const codigo = await gerarCodigoUnico();

    const criado = await prisma.$transaction(async (tx) => {
      // Espelha a regra da API: -1 é ilimitado e não decrementa; 0 bloqueia.
      const licencas = terapeuta.patientLicenses ?? -1;
      if (licencas === 0) throw new Error("sem licença disponível");
      if (licencas > 0) {
        await tx.user.updateMany({
          where: { id: terapeuta.id, patientLicenses: { gt: 0 } },
          data: { patientLicenses: { decrement: 1 } },
        });
      }
      return tx.patient.create({
        data: {
          name: NOME_TECNICO,
          birthDate: new Date("1990-01-01"),
          theme: "CLINICAL",
          pin: hashDoPin,
          pinPlain: pinLimpo,
          patientCode: codigo,
          therapistId: terapeuta.id,
          clinicalNotes:
            "Paciente TÉCNICO, criado para validar o tutorial da T1 no Span Direto. Não é pessoa real. Pode ser removido com --remover.",
        },
      });
    });

    console.log("PACIENTE DE TESTE CRIADO\n");
    await mostrarEstado(criado);
    console.log(`  licenças do terapeuta antes: ${terapeuta.patientLicenses} (-1 = ilimitado, não decrementa)`);
  }
} catch (erro) {
  console.error("FALHA:", erro.message);
  process.exitCode = 1;
} finally {
  await prisma.$disconnect();
}
