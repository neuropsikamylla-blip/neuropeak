"use client";

import { useState } from "react";
import { Check, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { TutorialDefinition, GuidedOutcome } from "@/lib/tutorial/types";
import type { Theme } from "@/types";

type TutorialPhase = "intro" | "demo" | "handoff" | "guided" | "feedback" | "confirm";
type TutorialStage = "demonstration" | "guided";

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
  icon: string;
}> = {
  CLINICAL: {
    screen: "bg-[#061326]",
    card: "bg-[#0D2547] border border-white/10 shadow-xl",
    heading: "text-slate-100",
    text: "text-slate-300",
    button: "bg-indigo-600 hover:bg-indigo-700 text-white",
    icon: "text-indigo-300",
  },
  COLORFUL: {
    screen: "bg-gradient-to-br from-teal-50 via-white to-cyan-50",
    card: "bg-white border-2 border-teal-300 shadow-xl",
    heading: "text-teal-800",
    text: "text-slate-700",
    button: "bg-gradient-to-r from-teal-600 to-cyan-600 text-white",
    icon: "text-teal-600",
  },
  GAMIFIED: {
    screen: "bg-gray-950",
    card: "bg-gray-800 border border-cyan-500/30 shadow-[0_0_30px_rgba(6,182,212,0.1)]",
    heading: "text-cyan-400 uppercase tracking-wider",
    text: "text-gray-300",
    button: "bg-gradient-to-r from-cyan-500 to-blue-600 text-white",
    icon: "text-cyan-400",
  },
};

const stageStyles: Record<Theme, Record<TutorialStage, {
  label: "DEMONSTRAÇÃO" | "SUA VEZ";
  border: string;
  accentColor: string;
  rule: string;
  labelText: string;
}>> = {
  CLINICAL: {
    demonstration: {
      label: "DEMONSTRAÇÃO",
      border: "border-t-[#4F8FEA]",
      accentColor: "#4F8FEA",
      rule: "bg-[#4F8FEA]",
      labelText: "text-blue-300",
    },
    guided: {
      label: "SUA VEZ",
      border: "border-t-teal-400",
      accentColor: "#2DD4BF",
      rule: "bg-teal-400",
      labelText: "text-teal-300",
    },
  },
  COLORFUL: {
    demonstration: {
      label: "DEMONSTRAÇÃO",
      border: "border-t-[#4F8FEA]",
      accentColor: "#4F8FEA",
      rule: "bg-[#4F8FEA]",
      labelText: "text-[#356FBE]",
    },
    guided: {
      label: "SUA VEZ",
      border: "border-t-teal-600",
      accentColor: "#0D9488",
      rule: "bg-teal-600",
      labelText: "text-teal-700",
    },
  },
  GAMIFIED: {
    demonstration: {
      label: "DEMONSTRAÇÃO",
      border: "border-t-[#4F8FEA]",
      accentColor: "#4F8FEA",
      rule: "bg-[#4F8FEA]",
      labelText: "text-blue-300",
    },
    guided: {
      label: "SUA VEZ",
      border: "border-t-teal-400",
      accentColor: "#2DD4BF",
      rule: "bg-teal-400",
      labelText: "text-teal-300",
    },
  },
};

function StageLabel({ stage, theme }: { stage: TutorialStage; theme: Theme }) {
  const stageStyle = stageStyles[theme][stage];

  return (
    <div className="mb-4 flex items-center gap-2" aria-label={`Etapa: ${stageStyle.label}`}>
      <span className={`${stageStyle.rule} h-0.5 w-6 rounded-full`} aria-hidden />
      <span className={`${stageStyle.labelText} text-[11px] font-bold tracking-[0.16em]`}>
        {stageStyle.label}
      </span>
    </div>
  );
}

export function TutorialRunner({ definition, theme, onFinish }: TutorialRunnerProps) {
  const [phase, setPhase] = useState<TutorialPhase>("intro");
  const [outcome, setOutcome] = useState<GuidedOutcome | null>(null);
  const [guidedKey, setGuidedKey] = useState(0);
  const styles = themeStyles[theme];
  const stage: TutorialStage | null = phase === "intro" || phase === "demo"
    ? "demonstration"
    : phase === "confirm"
      ? null
      : "guided";
  const stageBorder = stage ? stageStyles[theme][stage].border : "border-t-transparent";

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
      <div
        className={`${styles.card} ${stageBorder} w-full max-w-xl rounded-2xl border-t-4 p-6`}
        style={{
          borderTopColor: stage ? stageStyles[theme][stage].accentColor : "transparent",
          borderTopWidth: stage ? 4 : 0,
        }}
      >
        {phase === "intro" && (
          <div>
            <StageLabel stage="demonstration" theme={theme} />
            <h2 className={`${styles.heading} mb-1 text-xl font-bold`}>Observe como responder</h2>
            <p className={`${styles.text} mb-6 text-sm`}>
              Você vai ver a tarefa sendo feita do início ao fim.
            </p>
            <Button
              className={`${styles.button} h-12 w-full font-semibold`}
              onClick={() => setPhase("demo")}
            >
              Ver demonstração
            </Button>
          </div>
        )}

        {phase === "demo" && (
          <div>
            <StageLabel stage="demonstration" theme={theme} />
            <h2 className={`${styles.heading} mb-1 text-xl font-bold`}>Veja como funciona</h2>
            <p className={`${styles.text} mb-5 text-sm`}>Observe uma sequência completa.</p>
            <definition.Demonstration onDone={() => setPhase("handoff")} />
          </div>
        )}

        {phase === "handoff" && (
          <div>
            <StageLabel stage="guided" theme={theme} />
            <h2 className={`${styles.heading} mb-1 text-xl font-bold`}>Agora é sua vez</h2>
            <p className={`${styles.text} mb-6 text-sm`}>
              Ouça a sequência e responda no teclado.
            </p>
            <Button
              className={`${styles.button} h-12 w-full font-semibold`}
              onClick={() => setPhase("guided")}
            >
              Começar
            </Button>
          </div>
        )}

        {phase === "guided" && (
          <div>
            <StageLabel stage="guided" theme={theme} />
            <h2 className={`${styles.heading} mb-1 text-xl font-bold`}>Ouça e responda</h2>
            <p className={`${styles.text} mb-5 text-sm`}>Toque os números na ordem em que ouviu.</p>
            <definition.GuidedAttempt key={guidedKey} onOutcome={handleOutcome} />
          </div>
        )}

        {phase === "feedback" && outcome === "incorrect" && (
          <div className="text-center">
            <StageLabel stage="guided" theme={theme} />
            <RotateCcw className={`${styles.icon} mx-auto mb-3 h-8 w-8`} aria-hidden />
            <h2 className={`${styles.heading} mb-2 text-xl font-bold`}>Vamos repetir a tentativa</h2>
            <p className={`${styles.text} mb-6 text-sm`}>{definition.retryHint}</p>
            <Button className={`${styles.button} h-12 w-full font-semibold`} onClick={retryGuidedAttempt}>
              Repetir tentativa
            </Button>
          </div>
        )}

        {phase === "feedback" && outcome === "correct" && (
          <div className="text-center">
            <StageLabel stage="guided" theme={theme} />
            <Check className={`${styles.icon} mx-auto mb-3 h-8 w-8`} aria-hidden />
            <h2 className={`${styles.heading} mb-2 text-xl font-bold`}>Tentativa concluída</h2>
            <p className={`${styles.text} mb-6 text-sm`}>Você respondeu na ordem correta.</p>
            <Button className={`${styles.button} h-12 w-full font-semibold`} onClick={() => setPhase("confirm")}>
              Seguir
            </Button>
          </div>
        )}

        {phase === "confirm" && (
          <div className="text-center">
            <h2 className={`${styles.heading} mb-2 text-xl font-bold`}>Tutorial concluído</h2>
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
