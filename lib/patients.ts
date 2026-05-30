import type { Prisma, PrismaClient } from "@prisma/client";
import prisma from "@/lib/db";
import { generatePatientCode } from "@/lib/utils";

/** Client que expõe `patient.findFirst` — o `prisma` global ou um `tx`. */
type PatientReader = Pick<PrismaClient, "patient"> | Prisma.TransactionClient;

/**
 * Gera um `patientCode` (COG#####) garantidamente único, repetindo a geração
 * até não colidir com nenhum existente. Centraliza o loop antes duplicado em
 * patients POST, regenerate-pin e backfill-codes.
 *
 * Aceita um client opcional (ex: um `tx` de $transaction) para que a checagem
 * de unicidade rode na mesma transação quando necessário; por padrão usa o
 * prisma global, preservando o comportamento atual dos 3 chamadores.
 */
export async function generateUniquePatientCode(
  client: PatientReader = prisma
): Promise<string> {
  let patientCode: string;
  let unique = false;
  do {
    patientCode = generatePatientCode();
    const existing = await client.patient.findFirst({
      where: { patientCode },
      select: { id: true },
    });
    unique = !existing;
  } while (!unique);
  return patientCode;
}
