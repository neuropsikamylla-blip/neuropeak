export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/db";
import { getSupabase } from "@/lib/supabase";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as { role?: string }).role !== "THERAPIST") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = (session.user as { id: string }).id;
  const formData = await req.formData();
  const crp = (formData.get("crp") as string)?.trim();
  const file = formData.get("document") as File | null;
  const acceptedTerms = formData.get("acceptedTerms") === "true";

  if (!crp) return NextResponse.json({ error: "CRP obrigatório" }, { status: 400 });
  if (!file) return NextResponse.json({ error: "Documento obrigatório" }, { status: 400 });
  if (!acceptedTerms) return NextResponse.json({ error: "Aceite dos termos obrigatório" }, { status: 400 });

  const maxSize = 5 * 1024 * 1024;
  if (file.size > maxSize) return NextResponse.json({ error: "Arquivo muito grande (máx 5MB)" }, { status: 400 });

  const allowed = ["image/jpeg", "image/png", "image/webp", "application/pdf"];
  if (!allowed.includes(file.type)) {
    return NextResponse.json({ error: "Formato inválido. Use JPG, PNG ou PDF" }, { status: 400 });
  }

  let path: string;
  try {
    const supabase = getSupabase();
    const ext = file.name.split(".").pop() ?? "jpg";
    path = `${userId}/crp-${Date.now()}.${ext}`;
    const bytes = await file.arrayBuffer();
    const { error: uploadError } = await supabase.storage
      .from("crp-documents")
      .upload(path, bytes, { contentType: file.type, upsert: true });
    if (uploadError) return NextResponse.json({ error: "Erro ao enviar documento" }, { status: 500 });
  } catch {
    return NextResponse.json({ error: "Armazenamento de documentos indisponível" }, { status: 503 });
  }

  await prisma.user.update({
    where: { id: userId },
    data: { crp, crpDocument: path, crpStatus: "pending", crpAcceptedTerms: true, crpSubmittedAt: new Date() },
  });

  return NextResponse.json({ success: true, status: "pending" });
}

export async function PATCH(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as { role?: string }).role !== "THERAPIST") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const adminEmail = process.env.ADMIN_EMAIL;
  if ((session.user as { email?: string }).email !== adminEmail) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const { userId, status } = await req.json();
  if (!userId || !["verified", "rejected"].includes(status)) {
    return NextResponse.json({ error: "Dados inválidos" }, { status: 400 });
  }

  await prisma.user.update({ where: { id: userId }, data: { crpStatus: status } });

  return NextResponse.json({ success: true });
}

export async function GET(req: NextRequest) {
  void req;
  const session = await getServerSession(authOptions);
  if (!session || (session.user as { role?: string }).role !== "THERAPIST") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const adminEmail = process.env.ADMIN_EMAIL;
  if ((session.user as { email?: string }).email !== adminEmail) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const users = await prisma.user.findMany({
    where: { crpStatus: { not: "unverified" } },
    select: { id: true, name: true, email: true, crp: true, crpStatus: true, crpDocument: true, crpSubmittedAt: true },
    orderBy: { crpSubmittedAt: "desc" },
  });

  return NextResponse.json(users);
}
