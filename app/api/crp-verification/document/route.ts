export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getSupabase } from "@/lib/supabase";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as { role?: string }).role !== "THERAPIST") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const adminEmail = process.env.ADMIN_EMAIL;
  if ((session.user as { email?: string }).email !== adminEmail) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const path = req.nextUrl.searchParams.get("path");
  if (!path) return NextResponse.json({ error: "path required" }, { status: 400 });

  const supabase = getSupabase();
  const { data, error } = await supabase.storage
    .from("crp-documents")
    .createSignedUrl(path, 300); // 5 min

  if (error || !data) return NextResponse.json({ error: "Erro ao gerar URL" }, { status: 500 });

  return NextResponse.json({ url: data.signedUrl });
}
