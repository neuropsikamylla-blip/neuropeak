export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { supabase } from "@/lib/supabase";
import { z } from "zod";
import { generatePin } from "@/lib/utils";
import { randomUUID } from "crypto";

const createPatientSchema = z.object({
  name: z.string().min(2),
  birthDate: z.string(),
  education: z.string().optional(),
  medications: z.string().optional(),
  therapeuticGoals: z.string().optional(),
  clinicalNotes: z.string().optional(),
  contact: z.string().optional(),
  guardian: z.string().optional(),
  cid: z.string().optional(),
  diagnosis: z.string().optional(),
  theme: z.enum(["CLINICAL", "COLORFUL", "GAMIFIED"]).default("CLINICAL"),
});

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as { role?: string }).role !== "THERAPIST") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const therapistId = (session.user as { id: string }).id;

  const { data: patients, error } = await supabase
    .from('Patient')
    .select('id, name, theme, createdAt')
    .eq('therapistId', therapistId)
    .order('name', { ascending: true });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ patients });
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as { role?: string }).role !== "THERAPIST") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const therapistId = (session.user as { id: string }).id;

  const body = await req.json();
  const result = createPatientSchema.safeParse(body);
  if (!result.success) {
    return NextResponse.json({ error: result.error.errors }, { status: 400 });
  }

  const { name, birthDate, theme, ...rest } = result.data;
  const pin = generatePin();

  const insertData = {
    id: randomUUID(),
    name,
    birthDate: new Date(birthDate).toISOString(),
    theme,
    pin,
    therapistId,
    updatedAt: new Date().toISOString(),
    ...Object.fromEntries(
      Object.entries(rest).filter(([, v]) => v !== undefined)
    ),
  };

  const { data: patient, error: insertError } = await supabase
    .from('Patient')
    .insert(insertData)
    .select()
    .single();

  if (insertError) return NextResponse.json({ error: insertError.message }, { status: 500 });

  return NextResponse.json({ patient }, { status: 201 });
}
