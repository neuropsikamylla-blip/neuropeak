export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { supabase } from "@/lib/supabase";
import { z } from "zod";
import { randomUUID } from "crypto";

const updateSchema = z.object({
  name: z.string().min(2).optional(),
  birthDate: z.string().optional(),
  education: z.string().optional(),
  contact: z.string().optional(),
  guardian: z.string().optional(),
  cid: z.string().optional(),
  diagnosis: z.string().optional(),
  theme: z.enum(["CLINICAL", "COLORFUL", "GAMIFIED"]).optional(),
  clinicalNotes: z.string().optional(),
  therapeuticGoals: z.string().optional(),
  medications: z.string().optional(),
  trainingPlan: z.object({
    domains: z.array(z.string()),
    exercises: z.array(z.string()),
    sessionDuration: z.number().min(5).max(120),
    frequency: z.number().min(1).max(7),
  }).optional(),
});

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const user = session.user as { role?: string; id?: string; patientId?: string };
  const isTherapist = user.role === "THERAPIST";
  const isPatient = user.role === "PATIENT" && user.patientId === id;

  if (!isTherapist && !isPatient) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const searchParams = req.nextUrl.searchParams;
  const includeConfig = searchParams.get("config") === "true";

  const { data: patient, error: patientError } = await supabase
    .from('Patient')
    .select('*')
    .eq('id', id)
    .single();

  if (patientError || !patient) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (isTherapist && patient.therapistId !== user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const [
    { data: trainingPlans },
    { data: sessions },
    { data: exerciseConfigs },
  ] = await Promise.all([
    supabase
      .from('TrainingPlan')
      .select('*')
      .eq('patientId', id)
      .eq('isActive', true)
      .limit(1),
    supabase
      .from('Session')
      .select('*')
      .eq('patientId', id)
      .order('completedAt', { ascending: false })
      .limit(50),
    includeConfig
      ? supabase.from('ExerciseConfig').select('*').eq('patientId', id)
      : Promise.resolve({ data: [] }),
  ]);

  const patientWithRelations = {
    ...patient,
    trainingPlans: trainingPlans ?? [],
    sessions: sessions ?? [],
    exerciseConfigs: exerciseConfigs ?? [],
  };

  return NextResponse.json({ patient: patientWithRelations });
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = await getServerSession(authOptions);
  if (!session || (session.user as { role?: string }).role !== "THERAPIST") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const therapistId = (session.user as { id: string }).id;

  const { data: existingPatient, error: findError } = await supabase
    .from('Patient')
    .select('id')
    .eq('id', id)
    .eq('therapistId', therapistId)
    .single();

  if (findError || !existingPatient) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const body = await req.json();
  const result = updateSchema.safeParse(body);
  if (!result.success) {
    return NextResponse.json({ error: result.error.errors }, { status: 400 });
  }

  const { trainingPlan, ...patientUpdates } = result.data;

  if (Object.keys(patientUpdates).length > 0) {
    await supabase
      .from('Patient')
      .update(patientUpdates)
      .eq('id', id);
  }

  if (trainingPlan) {
    await supabase
      .from('TrainingPlan')
      .update({ isActive: false })
      .eq('patientId', id);

    await supabase
      .from('TrainingPlan')
      .insert({
        id: randomUUID(),
        patientId: id,
        domains: JSON.stringify(trainingPlan.domains),
        exercises: JSON.stringify(trainingPlan.exercises),
        sessionDuration: trainingPlan.sessionDuration,
        frequency: trainingPlan.frequency,
        isActive: true,
        updatedAt: new Date().toISOString(),
      });
  }

  return NextResponse.json({ success: true });
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = await getServerSession(authOptions);
  if (!session || (session.user as { role?: string }).role !== "THERAPIST") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const therapistId = (session.user as { id: string }).id;

  await supabase
    .from('Patient')
    .delete()
    .eq('id', id)
    .eq('therapistId', therapistId);

  return NextResponse.json({ success: true });
}
