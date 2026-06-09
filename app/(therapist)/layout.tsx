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

function NeuronBg() {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 0 }}>
      <svg
        className="absolute w-full h-full"
        viewBox="0 0 1440 900"
        preserveAspectRatio="xMidYMid slice"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Top-right neuron cluster */}
        <g strokeLinecap="round" strokeLinejoin="round">
          <circle cx="1190" cy="110" r="24" fill="#2563EB" fillOpacity="0.06" stroke="none" />
          <path d="M1214 110 C1260 92 1320 78 1395 62" stroke="#2563EB" strokeOpacity="0.05" strokeWidth="1.8" fill="none" />
          <path d="M1190 86 C1175 58 1172 28 1184 4" stroke="#2563EB" strokeOpacity="0.045" strokeWidth="1.5" fill="none" />
          <path d="M1190 86 C1155 70 1122 52 1090 38" stroke="#2563EB" strokeOpacity="0.045" strokeWidth="1.5" fill="none" />
          <path d="M1166 110 C1128 120 1095 134 1068 152" stroke="#2563EB" strokeOpacity="0.04" strokeWidth="1.4" fill="none" />
          <path d="M1190 134 C1196 168 1188 202 1168 230" stroke="#2563EB" strokeOpacity="0.04" strokeWidth="1.4" fill="none" />
          <path d="M1210 130 C1252 142 1296 150 1338 144" stroke="#2563EB" strokeOpacity="0.04" strokeWidth="1.2" fill="none" />
          <circle cx="1395" cy="62" r="4" fill="#2563EB" fillOpacity="0.12" stroke="none" />
          <circle cx="1184" cy="4" r="3.5" fill="#2563EB" fillOpacity="0.12" stroke="none" />
          <circle cx="1090" cy="38" r="3" fill="#2563EB" fillOpacity="0.12" stroke="none" />
          <circle cx="1068" cy="152" r="3" fill="#2563EB" fillOpacity="0.1" stroke="none" />
          <circle cx="1168" cy="230" r="3" fill="#2563EB" fillOpacity="0.1" stroke="none" />
          <circle cx="1338" cy="144" r="3.5" fill="#2563EB" fillOpacity="0.1" stroke="none" />
          {/* Secondary soma */}
          <circle cx="1090" cy="260" r="16" fill="#2563EB" fillOpacity="0.05" stroke="none" />
          <path d="M1090 244 C1088 218 1090 194 1098 172" stroke="#2563EB" strokeOpacity="0.04" strokeWidth="1.1" fill="none" />
          <path d="M1074 260 C1044 252 1018 242 996 232" stroke="#2563EB" strokeOpacity="0.04" strokeWidth="1.1" fill="none" />
          <path d="M1090 276 C1086 302 1074 322 1054 336" stroke="#2563EB" strokeOpacity="0.04" strokeWidth="1.1" fill="none" />
          <path d="M1106 268 C1138 276 1166 278 1192 270" stroke="#2563EB" strokeOpacity="0.04" strokeWidth="1.1" fill="none" />
          <circle cx="996" cy="232" r="2.5" fill="#2563EB" fillOpacity="0.1" stroke="none" />
          <circle cx="1054" cy="336" r="2.5" fill="#2563EB" fillOpacity="0.1" stroke="none" />
          <path d="M1090 38 C1090 96 1090 182 1090 244" stroke="#2563EB" strokeOpacity="0.025" strokeWidth="0.8" strokeDasharray="5 4" fill="none" />
        </g>

        {/* Bottom-right neuron cluster */}
        <g strokeLinecap="round" strokeLinejoin="round">
          <circle cx="1275" cy="795" r="28" fill="#2563EB" fillOpacity="0.05" stroke="none" />
          <path d="M1303 795 C1348 775 1398 758 1440 746" stroke="#2563EB" strokeOpacity="0.04" strokeWidth="1.8" fill="none" />
          <path d="M1275 767 C1290 736 1300 705 1290 672" stroke="#2563EB" strokeOpacity="0.04" strokeWidth="1.5" fill="none" />
          <path d="M1247 795 C1210 814 1176 830 1142 848" stroke="#2563EB" strokeOpacity="0.04" strokeWidth="1.5" fill="none" />
          <path d="M1275 823 C1280 856 1272 882 1252 900" stroke="#2563EB" strokeOpacity="0.035" strokeWidth="1.4" fill="none" />
          <path d="M1305 820 C1344 832 1386 838 1424 830" stroke="#2563EB" strokeOpacity="0.035" strokeWidth="1.3" fill="none" />
          <circle cx="1290" cy="672" r="4.5" fill="#2563EB" fillOpacity="0.1" stroke="none" />
          <circle cx="1142" cy="848" r="4" fill="#2563EB" fillOpacity="0.1" stroke="none" />
          <circle cx="1424" cy="830" r="4" fill="#2563EB" fillOpacity="0.1" stroke="none" />
          {/* Minor soma */}
          <circle cx="1155" cy="724" r="16" fill="#2563EB" fillOpacity="0.04" stroke="none" />
          <path d="M1139 724 C1110 712 1084 700 1062 688" stroke="#2563EB" strokeOpacity="0.035" strokeWidth="1.1" fill="none" />
          <path d="M1155 708 C1152 682 1156 658 1170 638" stroke="#2563EB" strokeOpacity="0.035" strokeWidth="1.1" fill="none" />
          <path d="M1171 724 C1200 722 1226 724 1250 732" stroke="#2563EB" strokeOpacity="0.035" strokeWidth="1.1" fill="none" />
          <path d="M1155 740 C1150 764 1138 784 1120 798" stroke="#2563EB" strokeOpacity="0.035" strokeWidth="1.1" fill="none" />
          <circle cx="1062" cy="688" r="2.5" fill="#2563EB" fillOpacity="0.09" stroke="none" />
          <circle cx="1170" cy="638" r="2.5" fill="#2563EB" fillOpacity="0.09" stroke="none" />
          <circle cx="1120" cy="798" r="2.5" fill="#2563EB" fillOpacity="0.09" stroke="none" />
        </g>

        {/* Top-left faint neuron */}
        <g strokeLinecap="round" strokeLinejoin="round">
          <circle cx="80" cy="160" r="14" fill="#2563EB" fillOpacity="0.03" stroke="none" />
          <path d="M80 160 C52 144 28 128 8 118" stroke="#2563EB" strokeOpacity="0.025" strokeWidth="1" fill="none" />
          <path d="M80 160 C96 186 102 214 90 240" stroke="#2563EB" strokeOpacity="0.025" strokeWidth="1" fill="none" />
          <path d="M80 160 C112 154 144 150 172 148" stroke="#2563EB" strokeOpacity="0.025" strokeWidth="1" fill="none" />
          <circle cx="8" cy="118" r="2" fill="#2563EB" fillOpacity="0.07" stroke="none" />
          <circle cx="90" cy="240" r="2" fill="#2563EB" fillOpacity="0.07" stroke="none" />
        </g>
      </svg>
    </div>
  );
}

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
    <div className="min-h-screen flex" style={{ background: "#F8FAFC" }}>
      <NeuronBg />

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-64 flex flex-col transform transition-transform duration-300",
          mobileOpen ? "translate-x-0" : "-translate-x-full",
          collapsed ? "lg:-translate-x-full" : "lg:translate-x-0"
        )}
        style={{
          background: "#FFFFFF",
          borderRight: "1px solid #E2E8F0",
          boxShadow: "2px 0 20px rgba(37,99,235,0.05)",
        }}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 px-6 py-5" style={{ borderBottom: "1px solid #F1F5F9" }}>
          <Image src="/icon-48.png" alt="NeuroPeak" width={36} height={36} className="rounded-xl" />
          <div>
            <span className="font-bold text-lg" style={{ color: "#0F172A" }}>NeuroPeak</span>
            <p className="text-xs" style={{ color: "#94A3B8" }}>Painel Clínico</p>
          </div>
          <button
            onClick={() => setCollapsed(true)}
            className="hidden lg:flex ml-auto items-center justify-center w-7 h-7 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
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
                  ? { background: "#EFF6FF", color: "#2563EB", fontWeight: 600 }
                  : { color: "#64748B", fontWeight: 500 }
                }
                onMouseEnter={(e) => {
                  if (!active) {
                    (e.currentTarget as HTMLElement).style.background = "#F8FAFC";
                    (e.currentTarget as HTMLElement).style.color = "#1E3A5F";
                  }
                }}
                onMouseLeave={(e) => {
                  if (!active) {
                    (e.currentTarget as HTMLElement).style.background = "transparent";
                    (e.currentTarget as HTMLElement).style.color = "#64748B";
                  }
                }}
              >
                <item.icon className="w-5 h-5 flex-shrink-0" style={{ color: active ? "#2563EB" : "#94A3B8" }} />
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
                ? { background: "#EFF6FF", color: "#2563EB", fontWeight: 600 }
                : { color: "#64748B", fontWeight: 500 }
              }
              onMouseEnter={(e) => {
                if (pathname !== "/admin") {
                  (e.currentTarget as HTMLElement).style.background = "#F8FAFC";
                  (e.currentTarget as HTMLElement).style.color = "#1E3A5F";
                }
              }}
              onMouseLeave={(e) => {
                if (pathname !== "/admin") {
                  (e.currentTarget as HTMLElement).style.background = "transparent";
                  (e.currentTarget as HTMLElement).style.color = "#64748B";
                }
              }}
            >
              <ShieldCheck className="w-5 h-5 flex-shrink-0" style={{ color: pathname === "/admin" ? "#2563EB" : "#94A3B8" }} />
              Admin CRP
            </Link>
          </div>
        )}

        {/* User */}
        <div className="px-4 py-4" style={{ borderTop: "1px solid #F1F5F9" }}>
          <div className="flex items-center gap-3 mb-3">
            <Avatar className="w-9 h-9">
              <AvatarFallback
                className="text-sm font-bold"
                style={{ background: "#EFF6FF", color: "#2563EB", border: "1.5px solid #DBEAFE" }}
              >
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold truncate" style={{ color: "#0F172A" }}>
                {user?.name ?? "Terapeuta"}
              </p>
              <p className="text-xs truncate" style={{ color: "#94A3B8" }}>
                {user?.clinicName ?? "Clínica"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 mb-1">
            <AppUpdateButton iconClass="w-4 h-4" buttonClass="text-slate-400 hover:bg-slate-100" showVersion />
          </div>
          <button
            className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium transition-all duration-150"
            style={{ color: "#EF4444" }}
            onClick={() => signOut({ callbackUrl: "/login" })}
            onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "#FEF2F2"; }}
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
          style={{ background: "rgba(15,23,42,0.25)", backdropFilter: "blur(4px)" }}
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Setinha flutuante para reabrir o menu (desktop, quando recolhido) */}
      {collapsed && (
        <button
          onClick={() => setCollapsed(false)}
          className="hidden lg:flex fixed left-0 top-1/2 -translate-y-1/2 z-50 items-center justify-center w-6 h-16 rounded-r-xl bg-white border border-l-0 border-slate-200 shadow-md text-slate-400 hover:text-blue-600 hover:w-7 transition-all"
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
            background: "rgba(248,250,252,0.96)",
            backdropFilter: "blur(12px)",
            borderBottom: "1px solid #E2E8F0",
          }}
        >
          <div className="flex items-center gap-2">
            <Image src="/icon-48.png" alt="NeuroPeak" width={28} height={28} className="rounded-lg" />
            <span className="font-bold" style={{ color: "#0F172A" }}>NeuroPeak</span>
          </div>
          <div className="flex items-center gap-2">
            <AppUpdateButton iconClass="w-4 h-4" buttonClass="text-slate-400" />
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label={mobileOpen ? "Fechar menu" : "Abrir menu"}
              aria-expanded={mobileOpen}
              className="p-2 rounded-lg"
              style={{ color: "#64748B" }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "#F1F5F9"; }}
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
