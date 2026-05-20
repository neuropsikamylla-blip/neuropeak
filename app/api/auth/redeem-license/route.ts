export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { supabase } from "@/lib/supabase";
import { z } from "zod";

const schema = z.object({
  code: z.string().min(1, "Código obrigatório"),
});

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as { role?: string }).role !== "THERAPIST") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const therapistId = (session.user as { id: string }).id;

  const body = await req.json();
  const result = schema.safeParse(body);
  if (!result.success) {
    return NextResponse.json({ error: result.error.errors[0].message }, { status: 400 });
  }

  const { code } = result.data;

  const { data: license } = await supabase
    .from("LicenseCode")
    .select("id, licenses, usedByTherapistId")
    .eq("code", code.trim().toUpperCase())
    .single();

  if (!license) {
    return NextResponse.json({ error: "Código de licença inválido" }, { status: 404 });
  }

  if (license.usedByTherapistId) {
    return NextResponse.json({ error: "Este código já foi utilizado" }, { status: 409 });
  }

  // Get current license count
  const { data: user } = await supabase
    .from("User")
    .select("patientLicenses")
    .eq("id", therapistId)
    .single();

  if (!user) {
    return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 });
  }

  const currentLicenses = user.patientLicenses ?? -1;
  // If currently unlimited (-1), switch to counted mode
  const newLicenses = currentLicenses === -1 ? license.licenses : currentLicenses + license.licenses;

  await supabase
    .from("LicenseCode")
    .update({ usedByTherapistId: therapistId, usedAt: new Date().toISOString() })
    .eq("id", license.id);

  await supabase
    .from("User")
    .update({ patientLicenses: newLicenses, updatedAt: new Date().toISOString() })
    .eq("id", therapistId);

  return NextResponse.json({ success: true, licenses: newLicenses });
}
