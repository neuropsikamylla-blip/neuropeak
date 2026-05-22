export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { generatePatientCode } from "@/lib/utils";

// One-time endpoint to assign patientCode to existing patients without one.
// Protected by ADMIN_SECRET env var.
export async function POST(req: NextRequest) {
  const secret = req.headers.get("x-admin-secret");
  if (!secret || secret !== process.env.ADMIN_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: patients, error } = await supabase
    .from("Patient")
    .select("id")
    .is("patientCode", null);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  if (!patients || patients.length === 0) {
    return NextResponse.json({ updated: 0, message: "Todos os pacientes já têm código" });
  }

  let updated = 0;
  for (const patient of patients) {
    let patientCode: string;
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

    await supabase
      .from("Patient")
      .update({ patientCode, updatedAt: new Date().toISOString() })
      .eq("id", patient.id);

    updated++;
  }

  return NextResponse.json({ updated, message: `${updated} paciente(s) atualizado(s) com código` });
}
