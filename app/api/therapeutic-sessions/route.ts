export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { supabase } from "@/lib/supabase";
import { randomUUID } from "crypto";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as { role?: string }).role !== "THERAPIST") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const therapistId = (session.user as { id: string }).id;
  const { patientId } = await req.json();
  if (!patientId) return NextResponse.json({ error: "patientId required" }, { status: 400 });

  // Close any existing active sessions for this patient
  await supabase
    .from("TherapeuticSession")
    .update({ status: "paused", updatedAt: new Date().toISOString() })
    .eq("patientId", patientId)
    .eq("status", "active");

  const { data, error } = await supabase
    .from("TherapeuticSession")
    .insert({
      id: randomUUID(),
      patientId,
      therapistId,
      status: "active",
      phase: "character_creation",
      characterData: {},
      currentRegion: null,
      currentHouseIndex: 0,
      unlockedTools: [],
      completedRegions: [],
      responses: [],
      therapistNotes: "",
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const role = (session.user as { role?: string }).role;
  const searchParams = req.nextUrl.searchParams;

  if (role === "THERAPIST") {
    const therapistId = (session.user as { id: string }).id;
    const patientId = searchParams.get("patientId");
    if (patientId) {
      const { data } = await supabase
        .from("TherapeuticSession")
        .select("*")
        .eq("patientId", patientId)
        .order("createdAt", { ascending: false })
        .limit(20);
      return NextResponse.json(data ?? []);
    }
    // No patientId → return all active sessions for this therapist
    const { data } = await supabase
      .from("TherapeuticSession")
      .select("*")
      .eq("therapistId", therapistId)
      .eq("status", "active")
      .order("createdAt", { ascending: false });
    return NextResponse.json(data ?? []);
  }

  if (role === "PATIENT") {
    const patientId = (session.user as { patientId?: string }).patientId;
    if (!patientId) return NextResponse.json({ error: "No patientId" }, { status: 400 });
    const { data } = await supabase
      .from("TherapeuticSession")
      .select("*")
      .eq("patientId", patientId)
      .eq("status", "active")
      .order("createdAt", { ascending: false })
      .limit(1)
      .single();
    return NextResponse.json(data ?? null);
  }

  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}
