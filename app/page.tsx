import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export default async function HomePage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  const role = (session.user as { role?: string }).role;

  if (role === "THERAPIST") {
    redirect("/dashboard");
  } else if (role === "PATIENT") {
    redirect("/inicio");
  }

  redirect("/login");
}
