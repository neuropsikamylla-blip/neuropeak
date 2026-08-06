"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import type { TutorialDefinition, GuidedOutcome } from "@/lib/tutorial/types";
import type { Theme } from "@/types";

type TutorialPhase = "demo" | "guided" | "feedback" | "confirm";

interface TutorialRunnerProps {
  definition: TutorialDefinition;
  theme: Theme;
  onFinish: () => void;
}

const themeStyles: Record<Theme, {
  screen: string;
  card: string;
  heading: string;
  text: string;
  button: string;
}> = {
  CLINICAL: {
    screen: "bg-[#061326]",
    card: "bg-[#0D2547] border border-white/10 shadow-xl",
    heading: "text-slate-100",
    text: "text-slate-300",
    button: "bg-indigo-600 hover:bg-indigo-700 text-white",
  },
  COLORFUL: {
    screen: "bg-gradient-to-br from-teal-50 via-white to-cyan-50",
    card: "bg-white border-2 border-teal-300 shadow-xl",
    heading: "text-teal-800",
    text: "text-slate-700",
    button: "bg-gradient-to-r from-teal-600 to-cyan-600 text-white",
  },
  GAMIFIED: {
    screen: "bg-gray-950",
    card: "bg-gray-800 border border-cyan-500/30 shadow-[0_0_30px_rgba(6,182,212,0.1)]",
    heading: "text-cyan-400 uppercase tracking-wider",
    text: "text-gray-300",
    button: "bg-gradient-to-r from-cyan-500 to-blue-600 text-white",
  },
};

export function TutorialRunner({ definition, theme, onFinish }: TutorialRunnerProps) {
  const [phase, setPhase] = useState<TutorialPhase>("demo");
  const [outcome, setOutcome] = useState<GuidedOutcome | null>(null);
  const [guidedKey, setGuidedKey] = useState(0);
  const styles = themeStyles[theme];

  function handleOutcome(nextOutcome: GuidedOutcome) {
    setOutcome(nextOutcome);
    setPhase("feedback");
  }

  function retryGuidedAttempt() {
    setGuidedKey((key) => key + 1);
    setOutcome(null);
    setPhase("guided");
  }

  return (
    <section className={`${styles.screen} min-h-screen p-4 flex items-center justify-center`}>
      <div className={`${styles.card} w-full max-w-xl rounded-2xl p-6`}>
        {phase === "demo" && (
          <div>
            <h2 className={`${styles.heading} mb-1 text-xl font-bold`}>Veja como funciona</h2>
            <p className={`${styles.text} mb-5 text-sm`}>Observe uma sequência completa.</p>
            <definition.Demonstration onDone={() => setPhase("guided")} />
          </div>
        )}

        {phase === "guided" && (
          <div>
            <h2 className={`${styles.heading} mb-1 text-xl font-bold`}>Agora é sua vez</h2>
            <p className={`${styles.text} mb-5 text-sm`}>Ouça e responda no teclado.</p>
            <definition.GuidedAttempt key={guidedKey} onOutcome={handleOutcome} />
          </div>
        )}

        {phase === "feedback" && outcome === "incorrect" && (
          <div className="text-center">
            <p className="mb-3 text-5xl" aria-hidden>❌</p>
            <h2 className={`${styles.heading} mb-2 text-xl font-bold`}>Vamos tentar mais uma vez</h2>
            <p className={`${styles.text} mb-6 text-sm`}>{definition.retryHint}</p>
            <Button className={`${styles.button} h-12 w-full font-semibold`} onClick={retryGuidedAttempt}>
              Repetir tentativa
            </Button>
          </div>
        )}

        {phase === "feedback" && outcome === "correct" && (
          <div className="text-center">
            <p className="mb-3 text-5xl" aria-hidden>✅</p>
            <h2 className={`${styles.heading} mb-2 text-xl font-bold`}>Muito bem!</h2>
            <p className={`${styles.text} mb-6 text-sm`}>Você concluiu a tentativa guiada.</p>
            <Button className={`${styles.button} h-12 w-full font-semibold`} onClick={() => setPhase("confirm")}>
              Seguir
            </Button>
          </div>
        )}

        {phase === "confirm" && (
          <div className="text-center">
            <p className="mb-3 text-5xl" aria-hidden>🎧</p>
            <h2 className={`${styles.heading} mb-2 text-xl font-bold`}>Tudo pronto</h2>
            <p className={`${styles.text} mb-6 text-sm`}>Confirme para iniciar o treino.</p>
            <Button className={`${styles.button} h-12 w-full font-semibold`} onClick={onFinish}>
              Iniciar treino
            </Button>
          </div>
        )}
      </div>
    </section>
  );
}
