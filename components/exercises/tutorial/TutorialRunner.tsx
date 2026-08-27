"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Check, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ExerciseStage } from "@/components/exercises/ExerciseStage";
import type { TutorialDefinition, GuidedOutcome } from "@/lib/tutorial/types";
import type { Theme } from "@/types";

type TutorialPhase = "intro" | "demo" | "handoff" | "guided" | "feedback";

/**
 * Respiro entre o último clique e a troca de tela. Cada etapa precisa de começo, meio e fim: sem
 * esta pausa a resposta do paciente desaparece no mesmo instante em que é dada.
 */
const GUIDED_SETTLE_MS = 900;
/** Regra 1: usado quando a definição não fornece um texto próprio para a demonstração. */
const DEMONSTRATION_HINT_PADRAO = "Observe como funciona a atividade.";
/**
 * O equivalente para o Fluxo 2. No modo Explicação o paciente LÊ a regra — mandá-lo "observar"
 * descreve uma tela que não existe ali. Corrigido em 09/ago/2026, quando ela viu o Semáforo
 * anunciando "DEMONSTRAÇÃO / Observe como funciona" numa tela que só tinha texto.
 */
const EXPLICACAO_HINT_PADRAO = "Leia como funciona a atividade.";
/** Fade entre telas. Sem ele uma etapa aparece por cima da outra, sem começo nem fim. */
const SCREEN_FADE_S = 0.32;
type TutorialStage = "demonstration" | "explanation" | "guided";

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
  label: "DEMONSTRAÇÃO" | "EXPLICAÇÃO" | "SUA VEZ";
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
    explanation: {
      label: "EXPLICAÇÃO",
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
    explanation: {
      label: "EXPLICAÇÃO",
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
    explanation: {
      label: "EXPLICAÇÃO",
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
  const settleTimer = useRef<number | null>(null);

  // Desmontar no meio do respiro não pode deixar timer órfão trocando fase de um componente morto.
  useEffect(() => () => {
    if (settleTimer.current !== null) window.clearTimeout(settleTimer.current);
  }, []);
  const styles = themeStyles[theme];
  // Regra 11: omitir o modo preserva, sem alteração, o fluxo aprovado das Famílias 1 a 3.
  const modo = definition.modo ?? "completa";
  // O crachá da etapa segue o MODO, não apenas a fase. No Fluxo 2 as fases `intro` e `demo`
  // mostram texto para ler, então anunciá-las como DEMONSTRAÇÃO descreve algo que não acontece.
  const etapaDeAprendizado: TutorialStage = modo === "explicativo" ? "explanation" : "demonstration";
  /** Abertura da etapa de aprendizado, na linguagem do modo: observar (Fluxo 1) ou ler (Fluxo 2). */
  const aberturaDaEtapa = definition.demonstrationHint
    ?? (modo === "explicativo" ? EXPLICACAO_HINT_PADRAO : DEMONSTRATION_HINT_PADRAO);
  const stage: TutorialStage | null = phase === "intro" || phase === "demo"
    ? etapaDeAprendizado
    : "guided";
  const stageBorder = stage ? stageStyles[theme][stage].border : "border-t-transparent";

  // Respiro entre o último clique do paciente e a troca de tela. Sem ele, a resposta some no
  // instante em que é dada e o paciente não chega a ver o que fez — a tela seguinte atropela a
  // anterior. Aqui a tentativa guiada permanece visível, com as marcas preenchidas, antes de sair.
  function handleOutcome(nextOutcome: GuidedOutcome) {
    if (settleTimer.current !== null) return; // ignora respostas repetidas durante o respiro
    settleTimer.current = window.setTimeout(() => {
      settleTimer.current = null;
      setOutcome(nextOutcome);
      setPhase("feedback");
    }, GUIDED_SETTLE_MS);
  }

  function retryGuidedAttempt() {
    if (settleTimer.current !== null) {
      window.clearTimeout(settleTimer.current);
      settleTimer.current = null;
    }
    setGuidedKey((key) => key + 1);
    setOutcome(null);
    setPhase("guided");
  }

  return (
    <ExerciseStage width="compacto" backgroundClassName={styles.screen}>
      <div
        className={`${styles.card} ${stageBorder} w-full rounded-2xl border-t-4 p-6`}
        style={{
          borderTopColor: stage ? stageStyles[theme][stage].accentColor : "transparent",
          borderTopWidth: stage ? 4 : 0,
        }}
      >
        <AnimatePresence mode="wait">
        <motion.div
          key={`${phase}-${outcome ?? ""}`}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: SCREEN_FADE_S, ease: "easeInOut" }}
        >
        {phase === "intro" && (
          <div>
            <StageLabel stage={etapaDeAprendizado} theme={theme} />
            <h2 className={`${styles.heading} mb-1 text-xl font-bold`}>
              {modo === "explicativo" ? "Leia como responder" : "Observe como responder"}
            </h2>
            <p className={`${styles.text} mb-6 text-sm`}>
              {aberturaDaEtapa}
            </p>
            <Button
              className={`${styles.button} h-12 w-full font-semibold`}
              onClick={() => setPhase("demo")}
            >
              {modo === "explicativo" ? "Ver explicação" : "Ver demonstração"}
            </Button>
          </div>
        )}

        {phase === "demo" && (
          <div>
            <StageLabel stage={etapaDeAprendizado} theme={theme} />
            {/* O modo Explicação não tem título próprio: a abertura padrão já cumpre esse papel,
                e um "Veja como funciona" acima dela seria a mesma frase duas vezes. */}
            {modo !== "explicativo" && (
              <h2 className={`${styles.heading} mb-1 text-xl font-bold`}>Veja como funciona</h2>
            )}
            {modo === "explicativo" ? (
              <>
                {/* Abertura padrão (regra 1), as regras da atividade, e o aviso da etapa seguinte. */}
                <p className={`${styles.text} mb-3 text-sm`}>
                  {aberturaDaEtapa}
                </p>
                {(definition.explicacao ?? []).map((linha) => (
                  <p key={linha} className={`${styles.text} mb-2 text-sm`}>{linha}</p>
                ))}
                <p className={`${styles.text} mb-6 mt-4 text-sm`}>
                  Agora começa o treino.
                </p>
                {/*
                  Regra 11 revisada (07/ago/2026): no modo Explicação NÃO há tentativa guiada. Quando
                  a explicação basta para compreender a atividade, a guiada vira complexidade sem
                  retorno — e o treino começa aqui.

                  ATENÇÃO: `onFinish` é o MESMO do encerramento do modo Demonstração, então a conclusão
                  continua sendo registrada uma única vez, pelo caminho único da regra 10. Não
                  chame nada além disto aqui.
                */}
                <Button
                  className={`${styles.button} h-12 w-full font-semibold`}
                  onClick={onFinish}
                >
                  Iniciar treino
                </Button>
              </>
            ) : (
              <>
                <p className={`${styles.text} mb-5 text-sm`}>Observe uma sequência completa.</p>
                <definition.Demonstration onDone={() => setPhase("handoff")} />
              </>
            )}
          </div>
        )}

        {phase === "handoff" && (
          <div>
            <StageLabel stage="guided" theme={theme} />
            <h2 className={`${styles.heading} mb-1 text-xl font-bold`}>Agora é sua vez</h2>
            <p className={`${styles.text} mb-6 text-sm`}>{definition.guidedInstruction}</p>
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
            {/* Regra 4 da T1: o título da tentativa guiada é "Agora é sua vez", para os 34.
                Antes mandava o paciente ESCUTAR — texto herdado do Span Auditivo, que foi o
                exercício de referência do framework. Ao converter os visuais, veio junto, e a
                Vigilância passou a mandar ouvir uma tarefa que só se olha. Ela viu em 11/ago/2026.
                O teste da regra 4 varre este arquivo inteiro: não reintroduza a frase antiga nem
                em comentário. */}
            <h2 className={`${styles.heading} mb-1 text-xl font-bold`}>Agora é sua vez</h2>
            <p className={`${styles.text} mb-5 text-sm`}>{definition.guidedInstruction}</p>
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

        {/*
          Tela ÚNICA de encerramento. Antes eram duas em sequência, com um botão intermediário que
          só levava a uma repetição da mesma informação. E o nome certo é tutorial, não tentativa:
          o paciente ainda não estava treinando — ele acabou de concluir o tutorial.
        */}
        {phase === "feedback" && outcome === "correct" && (
          <div className="text-center">
            <StageLabel stage="guided" theme={theme} />
            <Check className={`${styles.icon} mx-auto mb-3 h-8 w-8`} aria-hidden />
            <h2 className={`${styles.heading} mb-2 text-xl font-bold`}>Tutorial concluído</h2>
            <p className={`${styles.text} mb-6 text-sm`}>
              Você já sabe como funciona este exercício. Agora começa o treino.
            </p>
            <Button className={`${styles.button} h-12 w-full font-semibold`} onClick={onFinish}>
              Iniciar treino
            </Button>
          </div>
        )}
        </motion.div>
        </AnimatePresence>
      </div>
    </ExerciseStage>
  );
}
