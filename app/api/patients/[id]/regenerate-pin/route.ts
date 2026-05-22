export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { supabase } from "@/lib/supabase";
import { generatePin, generatePatientCode } from "@/lib/utils";
import bcrypt from "bcryptjs";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = await getServerSession(authOptions);
  if (!session || (session.user as { role?: string }).role !== "THERAPIST") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const therapistId = (session.user as { id: string }).id;

  const { data: patient } = await supabase
    .from("Patient")
    .select("id, patientCode")
    .eq("id", id)
    .eq("therapistId", therapistId)
    .single();

  if (!patient) {
    return NextResponse.json({ error: "Paciente não encontrado" }, { status: 404 });
  }

  const plainPin = generatePin();
  const hashedPin = await bcrypt.hash(plainPin, 10);

  // Generate patientCode if patient doesn't have one yet
  let patientCode: string | null = (patient as { patientCode?: string | null }).patientCode ?? null;
  if (!patientCode) {
    let unique = false;
    do {
      patientCode = generatePatientCode();
      const { data: existing } = await supabase
        .from("Patient")
        .select("id")
        .eq("patientCode", patientCode)
        .maybeSingle();
      unique = !existing;
    } while (!unique);
  }

  await supabase
    .from("Patient")
    .update({ pin: hashedPin, pinPlain: plainPin, patientCode, updatedAt: new Date().toISOString() })
    .eq("id", id);

  return NextResponse.json({ pin: plainPin, patientCode });
}
