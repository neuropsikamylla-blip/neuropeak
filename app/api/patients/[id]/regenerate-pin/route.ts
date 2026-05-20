export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { supabase } from "@/lib/supabase";
import { generatePin } from "@/lib/utils";
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

  // Verify patient belongs to this therapist
  const { data: patient } = await supabase
    .from("Patient")
    .select("id")
    .eq("id", id)
    .eq("therapistId", therapistId)
    .single();

  if (!patient) {
    return NextResponse.json({ error: "Paciente não encontrado" }, { status: 404 });
  }

  const plainPin = generatePin();
  const hashedPin = await bcrypt.hash(plainPin, 10);

  await supabase
    .from("Patient")
    .update({ pin: hashedPin, updatedAt: new Date().toISOString() })
    .eq("id", id);

  return NextResponse.json({ pin: plainPin });
}
