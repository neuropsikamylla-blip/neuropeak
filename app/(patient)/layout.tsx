"use client";

import { signOut, useSession } from "next-auth/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import { Home, TrendingUp, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";
import { AppUpdateButton } from "@/components/AppUpdateButton";

const NAV_ITEMS = [
  { href: "/inicio", label: "Início", icon: Home },
  { href: "/progresso", label: "Progresso", icon: TrendingUp },
];

export default function PatientLayout({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession();
  const pathname = usePathname();
  const user = session?.user as { name?: string; theme?: string } | undefined;
  const theme = (user?.theme ?? "CLINICAL") as "CLINICAL" | "COLORFUL" | "GAMIFIED";

  const bgStyles = {
    CLINICAL: "bg-gray-50",
    COLORFUL: "bg-gradient-to-br from-purple-50 to-pink-50",
    GAMIFIED: "bg-gray-950",
  };

  const navStyles = {
    CLINICAL: "bg-white border-t border-gray-200",
    COLORFUL: "bg-white border-t border-purple-200",
    GAMIFIED: "bg-gray-900 border-t border-gray-700",
  };

  const textStyles = {
    CLINICAL: "text-gray-600",
    COLORFUL: "text-purple-600",
    GAMIFIED: "text-gray-400",
  };

  const activeStyles = {
    CLINICAL: "text-blue-600",
    COLORFUL: "text-purple-700",
    GAMIFIED: "text-cyan-400",
  };

  // Don't show nav on exercise pages
  const showNav = !pathname.startsWith("/treino/");

  return (
    <div className={`min-h-screen ${bgStyles[theme]} flex flex-col`}>
      {/* Header */}
      {showNav && (
        <header className={`sticky top-0 z-30 px-4 py-3 flex items-center justify-between ${navStyles[theme]}`}>
          <div className="flex items-center gap-2">
            <Image src="/icon-48.png" alt="NeuroPeak" width={28} height={28} className="rounded-lg" />
            <span className={`font-bold ${theme === "GAMIFIED" ? "text-white" : "text-gray-900"}`}>
              NeuroPeak
            </span>
          </div>
          <div className="flex items-center gap-3">
            <span className={`text-sm ${theme === "GAMIFIED" ? "text-gray-300" : "text-gray-600"}`}>
              {user?.name?.split(" ")[0]}
            </span>
            <AppUpdateButton iconClass="w-4 h-4" buttonClass={textStyles[theme]} />
            <button
              onClick={() => signOut({ callbackUrl: "/login" })}
              className={`p-1.5 rounded-lg hover:opacity-80 ${textStyles[theme]}`}
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </header>
      )}

      {/* Content */}
      <main className="flex-1 pb-20">
        {children}
      </main>

      {/* Bottom nav */}
      {showNav && (
        <nav className={`fixed bottom-0 left-0 right-0 ${navStyles[theme]} flex`}>
          {NAV_ITEMS.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex-1 flex flex-col items-center py-3 gap-1 text-xs font-medium transition-colors",
                  active ? activeStyles[theme] : textStyles[theme]
                )}
              >
                <item.icon className="w-5 h-5" />
                {item.label}
              </Link>
            );
          })}
        </nav>
      )}
    </div>
  );
}
