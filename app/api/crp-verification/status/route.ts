export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getSupabase } from "@/lib/supabase";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as { role?: string }).role !== "THERAPIST") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = (session.user as { id: string }).id;
  const supabase = getSupabase();
  const { data } = await supabase
    .from("User")
    .select("crp, crpStatus")
    .eq("id", userId)
    .single();

  return NextResponse.json({
    crp: data?.crp ?? null,
    status: data?.crpStatus ?? "unverified",
  });
}
