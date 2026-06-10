"use client";

import { signOut, useSession } from "next-auth/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import { LayoutDashboard, Users, FileText, LogOut, Menu, X, Settings, Globe, Brain, ShieldCheck, ChevronLeft, ChevronRight } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { AppUpdateButton } from "@/components/AppUpdateButton";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/pacientes", label: "Pacientes", icon: Users },
  { href: "/treino-cognitivo", label: "Treino Cognitivo", icon: Brain },
  { href: "/mundo-interior", label: "Mundo Interior", icon: Globe },
  { href: "/relatorios", label: "Relatórios", icon: FileText },
  { href: "/configuracoes", label: "Configurações", icon: Settings },
];

export default function TherapistLayout({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession();
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  // Barra lateral recolhível (desktop) — recolhe sozinha na tela de plano para
  // dar mais área ao plano de treino; uma setinha permite reabrir.
  const [collapsed, setCollapsed] = useState(false);
  const isPlano = /\/pacientes\/[^/]+\/plano$/.test(pathname);
  useEffect(() => { setCollapsed(isPlano); }, [isPlano]);

  const user = session?.user as { name?: string; role?: string; clinicName?: string; email?: string } | undefined;
  const isAdmin = user?.email === process.env.NEXT_PUBLIC_ADMIN_EMAIL;
  const initials = user?.name?.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase() ?? "T";

  return (
    <div className="dark np-app-bg min-h-screen flex text-foreground">
      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-64 flex flex-col transform transition-transform duration-300",
          mobileOpen ? "translate-x-0" : "-translate-x-full",
          collapsed ? "lg:-translate-x-full" : "lg:translate-x-0"
        )}
        style={{
          background: "linear-gradient(180deg, #07162D 0%, #050E1F 100%)",
          borderRight: "1px solid rgba(148,163,184,0.14)",
          boxShadow: "2px 0 28px rgba(0,0,0,0.3)",
        }}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 px-6 py-5" style={{ borderBottom: "1px solid rgba(148,163,184,0.12)" }}>
          <Image src="/icon-48.png" alt="NeuroPeak" width={36} height={36} className="rounded-xl" />
          <div>
            <span className="font-bold text-lg" style={{ color: "#F4F7FB" }}>NeuroPeak</span>
            <p className="text-xs" style={{ color: "#6F7F99" }}>Painel Clínico</p>
          </div>
          <button
            onClick={() => setCollapsed(true)}
            className="hidden lg:flex ml-auto items-center justify-center w-7 h-7 rounded-lg text-slate-400 hover:bg-white/10 hover:text-slate-200 transition-colors"
            aria-label="Recolher menu"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-5" style={{ display: "flex", flexDirection: "column", gap: 2 }}>
          {NAV_ITEMS.map((item) => {
            const active = pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all duration-150"
                style={active
                  ? { background: "rgba(96,165,250,0.14)", color: "#60A5FA", fontWeight: 600 }
                  : { color: "#94A3B8", fontWeight: 500 }
                }
                onMouseEnter={(e) => {
                  if (!active) {
                    (e.currentTarget as HTMLElement).style.background = "rgba(148,163,184,0.1)";
                    (e.currentTarget as HTMLElement).style.color = "#DBEAFE";
                  }
                }}
                onMouseLeave={(e) => {
                  if (!active) {
                    (e.currentTarget as HTMLElement).style.background = "transparent";
                    (e.currentTarget as HTMLElement).style.color = "#94A3B8";
                  }
                }}
              >
                <item.icon className="w-5 h-5 flex-shrink-0" style={{ color: active ? "#60A5FA" : "#6F7F99" }} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Admin */}
        {isAdmin && (
          <div className="px-3 pb-2">
            <Link
              href="/admin"
              onClick={() => setMobileOpen(false)}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all duration-150"
              style={pathname === "/admin"
                ? { background: "rgba(96,165,250,0.14)", color: "#60A5FA", fontWeight: 600 }
                : { color: "#94A3B8", fontWeight: 500 }
              }
              onMouseEnter={(e) => {
                if (pathname !== "/admin") {
                  (e.currentTarget as HTMLElement).style.background = "rgba(148,163,184,0.1)";
                  (e.currentTarget as HTMLElement).style.color = "#DBEAFE";
                }
              }}
              onMouseLeave={(e) => {
                if (pathname !== "/admin") {
                  (e.currentTarget as HTMLElement).style.background = "transparent";
                  (e.currentTarget as HTMLElement).style.color = "#94A3B8";
                }
              }}
            >
              <ShieldCheck className="w-5 h-5 flex-shrink-0" style={{ color: pathname === "/admin" ? "#60A5FA" : "#6F7F99" }} />
              Admin CRP
            </Link>
          </div>
        )}

        {/* User */}
        <div className="px-4 py-4" style={{ borderTop: "1px solid rgba(148,163,184,0.12)" }}>
          <div className="flex items-center gap-3 mb-3">
            <Avatar className="w-9 h-9">
              <AvatarFallback
                className="text-sm font-bold"
                style={{ background: "rgba(96,165,250,0.18)", color: "#93C5FD", border: "1.5px solid rgba(147,197,253,0.25)" }}
              >
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold truncate" style={{ color: "#F4F7FB" }}>
                {user?.name ?? "Terapeuta"}
              </p>
              <p className="text-xs truncate" style={{ color: "#6F7F99" }}>
                {user?.clinicName ?? "Clínica"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 mb-1">
            <AppUpdateButton iconClass="w-4 h-4" buttonClass="text-slate-400 hover:bg-white/10" showVersion />
          </div>
          <button
            className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium transition-all duration-150"
            style={{ color: "#F87171" }}
            onClick={() => signOut({ callbackUrl: "/login" })}
            onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "rgba(239,68,68,0.12)"; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "transparent"; }}
          >
            <LogOut className="w-4 h-4" />
            Sair
          </button>
        </div>
      </aside>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 lg:hidden"
          style={{ background: "rgba(2,6,20,0.55)", backdropFilter: "blur(4px)" }}
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Setinha flutuante para reabrir o menu (desktop, quando recolhido) */}
      {collapsed && (
        <button
          onClick={() => setCollapsed(false)}
          className="hidden lg:flex fixed left-0 top-1/2 -translate-y-1/2 z-50 items-center justify-center w-6 h-16 rounded-r-xl bg-[#07162D] border border-l-0 border-white/10 shadow-md text-slate-400 hover:text-blue-300 hover:w-7 transition-all"
          aria-label="Expandir menu"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      )}

      {/* Main content */}
      <div
        className={cn(
          "flex-1 flex flex-col min-h-screen transition-[margin] duration-300",
          collapsed ? "lg:ml-0" : "lg:ml-64"
        )}
        style={{ position: "relative", zIndex: 1 }}
      >
        {/* Mobile header */}
        <header
          className="lg:hidden px-4 py-3 flex items-center justify-between sticky top-0 z-30"
          style={{
            background: "rgba(11,26,56,0.96)",
            backdropFilter: "blur(12px)",
            borderBottom: "1px solid rgba(148,163,184,0.14)",
          }}
        >
          <div className="flex items-center gap-2">
            <Image src="/icon-48.png" alt="NeuroPeak" width={28} height={28} className="rounded-lg" />
            <span className="font-bold" style={{ color: "#F4F7FB" }}>NeuroPeak</span>
          </div>
          <div className="flex items-center gap-2">
            <AppUpdateButton iconClass="w-4 h-4" buttonClass="text-slate-400" />
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label={mobileOpen ? "Fechar menu" : "Abrir menu"}
              aria-expanded={mobileOpen}
              className="p-2 rounded-lg"
              style={{ color: "#94A3B8" }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "rgba(148,163,184,0.14)"; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "transparent"; }}
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </header>

        <main className="flex-1 p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
