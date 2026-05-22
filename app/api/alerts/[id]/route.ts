export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { supabase } from "@/lib/supabase";

export async function PATCH(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as { role?: string }).role !== "THERAPIST") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const therapistId = (session.user as { id: string }).id;

  // Only allow marking alerts of the therapist's own patients
  const { data: alert } = await supabase
    .from('Alert')
    .select('id, patientId')
    .eq('id', id)
    .single();

  if (!alert) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const { data: patient } = await supabase
    .from('Patient')
    .select('id')
    .eq('id', alert.patientId)
    .eq('therapistId', therapistId)
    .single();

  if (!patient) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  await supabase
    .from('Alert')
    .update({ isRead: true })
    .eq('id', id);

  return NextResponse.json({ ok: true });
}
