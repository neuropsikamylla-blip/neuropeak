"use client";

import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import type { Theme } from "@/types";

interface PreparationScreenProps {
  title: string;
  levelLabel?: string;
  onStart: () => void;
  onHowItWorks: () => void;
}

const themeStyles: Record<Theme, {
  screen: string;
  card: string;
  title: string;
  level: string;
  start: string;
  help: string;
}> = {
  CLINICAL: {
    screen: "bg-[#061326]",
    card: "bg-[#0D2547] border border-white/10 shadow-xl",
    title: "text-slate-100",
    level: "text-slate-300",
    start: "bg-indigo-600 hover:bg-indigo-700 text-white",
    help: "border-indigo-300/40 bg-transparent text-indigo-200 hover:bg-white/5 hover:text-white",
  },
  COLORFUL: {
    screen: "bg-gradient-to-br from-teal-50 via-white to-cyan-50",
    card: "bg-white border-2 border-teal-300 shadow-xl",
    title: "text-teal-800",
    level: "text-slate-600",
    start: "bg-gradient-to-r from-teal-600 to-cyan-600 text-white hover:opacity-90",
    help: "border-teal-300 bg-white text-teal-700 hover:bg-teal-50 hover:text-teal-800",
  },
  GAMIFIED: {
    screen: "bg-gray-950",
    card: "bg-gray-800 border border-cyan-500/30 shadow-[0_0_30px_rgba(6,182,212,0.1)]",
    title: "text-cyan-400 uppercase tracking-wider",
    level: "text-gray-300",
    start: "bg-gradient-to-r from-cyan-500 to-blue-600 text-white hover:opacity-90",
    help: "border-cyan-500/40 bg-transparent text-cyan-300 hover:bg-cyan-950/40 hover:text-cyan-200",
  },
};

export function PreparationScreen({
  title,
  levelLabel,
  onStart,
  onHowItWorks,
}: PreparationScreenProps) {
  const { data: session } = useSession();
  const theme = ((session?.user as { theme?: Theme } | undefined)?.theme ?? "CLINICAL");
  const styles = themeStyles[theme];

  return (
    <section className={`${styles.screen} min-h-screen p-4 flex items-center justify-center`}>
      <div className={`${styles.card} w-full max-w-md rounded-2xl p-8 text-center`}>
        <h1 className={`${styles.title} text-2xl font-bold`}>{title}</h1>
        {levelLabel && <p className={`${styles.level} mt-3 text-sm font-medium`}>{levelLabel}</p>}
        <div className="mt-8 space-y-3">
          <Button className={`${styles.start} h-12 w-full text-base font-semibold`} onClick={onStart}>
            Começar
          </Button>
          <Button
            variant="outline"
            className={`${styles.help} h-12 w-full text-base font-semibold`}
            onClick={onHowItWorks}
          >
            Como funciona
          </Button>
        </div>
      </div>
    </section>
  );
}
