"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { Theme } from "@/types";

interface TutorialStep {
  instruction: string;
  content: (onStepDone: () => void) => React.ReactNode;
}
interface TutorialBaseProps {
  theme: Theme;
  title: string;
  steps: TutorialStep[];
  onDone: () => void;
}

function TechBg() {
  const nodes: [number, number][] = [
    [8,12],[25,28],[42,15],[60,35],[75,20],[88,45],
    [15,55],[35,70],[55,58],[72,72],[20,85],[50,90],[80,88],
  ];
  const lines: [number,number,number,number][] = [
    [8,12,25,28],[25,28,42,15],[42,15,60,35],[60,35,75,20],[75,20,88,45],
    [8,12,15,55],[15,55,35,70],[35,70,55,58],[55,58,72,72],
    [25,28,35,70],[55,58,88,45],[35,70,20,85],[55,58,50,90],[72,72,80,88],[80,88,88,45],
  ];
  return (
    <div className="absolute inset-0 overflow-hidden">
      <div className="absolute inset-0" style={{
        background: "linear-gradient(145deg, #0a1628 0%, #0d2244 45%, #132a52 70%, #081020 100%)"
      }} />
      <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100"
        preserveAspectRatio="xMidYMid slice" style={{ opacity: 0.22 }}>
        {lines.map(([x1,y1,x2,y2], i) => (
          <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#4a9eda" strokeWidth="0.3" />
        ))}
        {nodes.map(([cx, cy], i) => (
          <circle key={i} cx={cx} cy={cy} r={i % 3 === 0 ? 1.1 : 0.85} fill="#5ba8e0" />
        ))}
        <polygon points="5,40 10,32 20,32 25,40 20,48 10,48" fill="none" stroke="#4a9eda" strokeWidth="0.5" />
        <polygon points="68,3 74,0 80,3 80,9 74,12 68,9" fill="none" stroke="#4a9eda" strokeWidth="0.4" />
        <polygon points="77,65 81,62 85,65 85,71 81,74 77,71" fill="none" stroke="#4a9eda" strokeWidth="0.35" />
        <rect x="0" y="60" width="10" height="10" fill="none" stroke="#5ba8e0" strokeWidth="0.4" />
        <rect x="2" y="58" width="10" height="10" fill="none" stroke="#5ba8e0" strokeWidth="0.3" />
        <line x1="0" y1="60" x2="2" y2="58" stroke="#5ba8e0" strokeWidth="0.3" />
        <line x1="10" y1="60" x2="12" y2="58" stroke="#5ba8e0" strokeWidth="0.3" />
        <line x1="10" y1="70" x2="12" y2="68" stroke="#5ba8e0" strokeWidth="0.3" />
        <circle cx="92" cy="16" r="4" fill="none" stroke="#4a9eda" strokeWidth="0.3" />
        <circle cx="92" cy="16" r="2.5" fill="none" stroke="#4a9eda" strokeWidth="0.3" />
        <rect x="88" y="28" width="3" height="8" fill="rgba(74,158,218,0.15)" stroke="#4a9eda" strokeWidth="0.3" />
        <rect x="91.5" y="30" width="2.5" height="7" fill="rgba(74,158,218,0.1)" stroke="#4a9eda" strokeWidth="0.3" />
        <rect x="94.2" y="27" width="3" height="9" fill="rgba(74,158,218,0.15)" stroke="#4a9eda" strokeWidth="0.3" />
      </svg>
      <div className="absolute top-1/4 right-1/4 w-40 h-40 rounded-full pointer-events-none"
        style={{ background: "radial-gradient(circle, rgba(74,158,218,0.15), transparent)", filter: "blur(20px)" }} />
      <div className="absolute bottom-1/3 left-1/5 w-32 h-32 rounded-full pointer-events-none"
        style={{ background: "radial-gradient(circle, rgba(74,100,200,0.12), transparent)", filter: "blur(16px)" }} />
    </div>
  );
}

function BeigeBg() {
  return (
    <div className="absolute inset-0">
      <div className="absolute inset-0" style={{
        background: "linear-gradient(160deg, #ede8df 0%, #e4ddd0 55%, #dbd4c5 100%)"
      }} />
      <div className="absolute -top-8 -right-8 w-64 h-64 rounded-full pointer-events-none opacity-50"
        style={{ background: "radial-gradient(circle, #c8b89a, transparent)", filter: "blur(20px)" }} />
      <div className="absolute -bottom-12 -left-8 w-80 h-80 rounded-full pointer-events-none opacity-35"
        style={{ background: "radial-gradient(circle, #b8a87a, transparent)", filter: "blur(24px)" }} />
    </div>
  );
}

function ColorfulBg() {
  return (
    <div className="absolute inset-0">
      <div className="absolute inset-0" style={{
        background: "linear-gradient(135deg, #f0e6ff 0%, #fce4f0 55%, #ffe8e0 100%)"
      }} />
      <div className="absolute top-0 left-1/4 w-64 h-64 rounded-full pointer-events-none opacity-40"
        style={{ background: "radial-gradient(circle, #d4aaff, transparent)", filter: "blur(30px)" }} />
      <div className="absolute bottom-0 right-1/4 w-72 h-72 rounded-full pointer-events-none opacity-35"
        style={{ background: "radial-gradient(circle, #ffaadd, transparent)", filter: "blur(30px)" }} />
    </div>
  );
}

export function TutorialBase({ theme, title, steps, onDone }: TutorialBaseProps) {
  const [stepIdx, setStepIdx] = useState(0);
  const [stepDone, setStepDone] = useState(false);

  function handleStepDone() { setStepDone(true); }
  function advance() {
    if (stepIdx < steps.length - 1) { setStepIdx((i) => i + 1); setStepDone(false); }
    else { onDone(); }
  }

  const step = steps[stepIdx];
  const isLastStep = stepIdx === steps.length - 1;
  const isGamified = theme === "GAMIFIED";
  const isColorful = theme === "COLORFUL";

  const cardStyle: React.CSSProperties = isGamified
    ? { background: "#faf6ef", borderRadius: 20, boxShadow: "0 20px 60px rgba(0,0,0,0.55)", border: "1px solid rgba(200,180,130,0.3)" }
    : { background: "#ffffff", borderRadius: 20, boxShadow: "0 8px 40px rgba(60,40,20,0.18)", border: "1px solid rgba(200,185,160,0.3)" };

  const titleColor = isGamified ? "#1a2d50" : isColorful ? "#7c3aed" : "#1a2744";
  const subColor = isGamified ? "#5a7899" : isColorful ? "#9d71cc" : "#8a7a6a";
  const instructionBg = isGamified ? "#f0ebe0" : isColorful ? "#f8f4ff" : "#f8f4ee";
  const instructionColor = isGamified ? "#2d4060" : isColorful ? "#5b3a8a" : "#3a3028";
  const dotActive = isGamified ? "#2a5fa5" : isColorful ? "#8b5cf6" : "#2a5fa5";
  const dotInactive = isGamified ? "rgba(26,45,80,0.12)" : isColorful ? "rgba(139,92,246,0.12)" : "rgba(26,39,68,0.1)";

  const btnStyle: React.CSSProperties = isGamified
    ? { background: "linear-gradient(135deg, #1a2d50 0%, #2a4a8a 100%)", boxShadow: "0 4px 20px rgba(26,45,80,0.4)" }
    : isColorful
    ? { background: "linear-gradient(135deg, #7c3aed 0%, #db2777 100%)", boxShadow: "0 4px 20px rgba(124,58,237,0.35)" }
    : { background: "linear-gradient(135deg, #1a2744 0%, #2a4a8a 100%)", boxShadow: "0 4px 20px rgba(26,39,68,0.4)" };

  return (
    <div className="relative min-h-screen flex items-center justify-center p-4 overflow-hidden">
      {isGamified ? <TechBg /> : isColorful ? <ColorfulBg /> : <BeigeBg />}
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.3 }}
        style={cardStyle}
        className="w-full max-w-md p-6 relative"
      >
        <div className="mb-5">
          <span className="text-xs font-semibold tracking-widest uppercase" style={{ color: subColor }}>
            Tutorial
          </span>
          <h2 className="text-xl font-black mt-0.5 uppercase tracking-tight" style={{ color: titleColor }}>
            Como jogar: {title}
          </h2>
        </div>

        <div className="flex gap-2 mb-5">
          {steps.map((_, i) => (
            <div key={i} className="h-2 flex-1 rounded-full transition-all duration-300"
              style={{ background: i <= stepIdx ? dotActive : dotInactive }} />
          ))}
        </div>

        <AnimatePresence mode="wait">
          <motion.div key={stepIdx}
            initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.2 }}
          >
            <div className="rounded-xl p-3 mb-4" style={{ background: instructionBg }}>
              <p className="text-sm font-medium leading-relaxed" style={{ color: instructionColor }}>
                {step.instruction}
              </p>
            </div>
            <div className="mb-5">{step.content(handleStepDone)}</div>
          </motion.div>
        </AnimatePresence>

        <AnimatePresence>
          {stepDone && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <button onClick={advance}
                className="w-full h-12 rounded-full font-bold text-white text-base tracking-wide transition-transform active:scale-95"
                style={btnStyle}>
                {isLastStep ? "COMEÇAR! 🚀" : "Próximo →"}
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
