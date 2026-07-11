"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

// ── Types ──────────────────────────────────────────────────────────────────
export interface CharacterData {
  name: string;
  avatar: string;
  power: string;
  fear: string;
  energyType: string;
}

export interface TherapeuticResponse {
  houseId: string;
  question: string;
  answer: string;
  timestamp: string;
}

export interface TherapeuticSession {
  id: string;
  patientId: string;
  therapistId: string;
  status: "active" | "paused" | "completed";
  phase: "character_creation" | "map" | "board" | "tool_unlock" | "complete";
  characterData: CharacterData;
  currentRegion: string | null;
  currentHouseIndex: number;
  unlockedTools: string[];
  completedRegions: string[];
  responses: TherapeuticResponse[];
  therapistNotes: string;
  updatedAt: string;
  createdAt?: string;
}

interface House {
  id: string;
  type: "question" | "breathing" | "choice" | "tool_unlock";
  icon: string;
  title: string;
  question?: string;
  choices?: string[];
  tool?: string;
  toolEmoji?: string;
  toolDescription?: string;
}

// ── Data ───────────────────────────────────────────────────────────────────
const AVATARS = ["🦁","🐯","🦊","🐺","🦅","🦋","🐉","🧙","🧚","🧜","🦸","🧞","🌟","🌈","⚡","🔥","🌊","🌙","☀️","❄️"];
const POWERS = ["Ser rápido e ágil","Ser forte e resistente","Ser inteligente e criativo","Ser curioso e explorador","Ser gentil e protetor","Ser corajoso e destemido"];
const FEARS = ["Ficar sozinho","Cometer erros","Ser rejeitado","O desconhecido","Decepcionar alguém","Perder o controle"];
const ENERGY_TYPES = [
  { label: "Energia do Sol ☀️", desc: "fica forte quando reconhecido" },
  { label: "Energia da Lua 🌙", desc: "fica forte no silêncio" },
  { label: "Energia do Relâmpago ⚡", desc: "fica forte em ação" },
  { label: "Energia do Mar 🌊", desc: "fica forte com amigos" },
  { label: "Energia da Terra 🌱", desc: "fica forte na natureza" },
  { label: "Energia do Fogo 🔥", desc: "fica forte quando desafiado" },
];

export const REGIONS = [
  { id: "floresta_ansiedade", name: "Floresta da Ansiedade", emoji: "🌲", color: "#059669", bg: "from-emerald-900 to-green-800", desc: "Medo, preocupação, insegurança" },
  { id: "vulcao_raiva", name: "Vulcão da Raiva", emoji: "🌋", color: "#dc2626", bg: "from-red-900 to-orange-800", desc: "Impulsividade, frustração, explosões" },
  { id: "cidade_pensamentos", name: "Cidade dos Pensamentos", emoji: "🏙️", color: "#2563eb", bg: "from-blue-900 to-indigo-800", desc: "Autocrítica, vergonha, comparação" },
  { id: "caverna_silencio", name: "Caverna do Silêncio", emoji: "🌑", color: "#7c3aed", bg: "from-violet-900 to-purple-900", desc: "Tristeza, retraimento, solidão" },
  { id: "ponte_coragem", name: "Ponte da Coragem", emoji: "🌉", color: "#d97706", bg: "from-amber-800 to-yellow-700", desc: "Enfrentamento, autonomia, decisão" },
];

const REGION_HOUSES: Record<string, House[]> = {
  floresta_ansiedade: [
    { id:"fa_1", type:"question", icon:"🌊", title:"Tempestade Interior", question:"O que faz o personagem sentir uma tempestade por dentro?" },
    { id:"fa_2", type:"question", icon:"🌑", title:"Sombra Crescente", question:"Quando imagina algo ruim, o que costuma aparecer primeiro na mente do personagem?" },
    { id:"fa_3", type:"breathing", icon:"💨", title:"Vento Mágico", question:"Vamos respirar juntos..." },
    { id:"fa_4", type:"question", icon:"🗺️", title:"Missão Impossível", question:"Qual missão parece impossível para o personagem neste momento?" },
    { id:"fa_5", type:"question", icon:"🔮", title:"Bola de Cristal", question:"O que o personagem mais teme que aconteça?" },
    { id:"fa_6", type:"tool_unlock", icon:"🌱", title:"Raiz da Coragem", tool:"Poção de Respiração", toolEmoji:"🧪", toolDescription:"Use quando sentir a tempestade chegando. Respira fundo três vezes e a tempestade vai diminuindo." },
  ],
  vulcao_raiva: [
    { id:"vr_1", type:"question", icon:"🌋", title:"Vulcão Dormindo", question:"O que faz o vulcão do personagem acordar?" },
    { id:"vr_2", type:"question", icon:"💥", title:"A Explosão", question:"O que acontece ao redor quando o vulcão explode?" },
    { id:"vr_3", type:"question", icon:"🎯", title:"O Gatilho", question:"Qual é a menor faísca que consegue acender o vulcão?" },
    { id:"vr_4", type:"choice", icon:"🔴", title:"Semáforo Interior", question:"Quando o vulcão começa a acordar, o personagem normalmente...", choices:["Para e respira","Explode logo","Foge do lugar","Fica quieto por dentro"] },
    { id:"vr_5", type:"question", icon:"🧯", title:"Extintor Mágico", question:"O que consegue apagar o fogo do vulcão?" },
    { id:"vr_6", type:"tool_unlock", icon:"🛡️", title:"Escudo da Calma", tool:"Escudo da Calma", toolEmoji:"🛡️", toolDescription:"Protege quando a raiva quer explodir. Visualize o escudo e respire antes de agir." },
  ],
  cidade_pensamentos: [
    { id:"cp_1", type:"question", icon:"💭", title:"Pensamentos Invisíveis", question:"Qual pensamento secreto aparece quando algo difícil acontece?" },
    { id:"cp_2", type:"question", icon:"🗣️", title:"Voz Interior", question:"O que a voz de dentro do personagem costuma dizer quando erra?" },
    { id:"cp_3", type:"breathing", icon:"💨", title:"Pausa nos Pensamentos", question:"Hora de pausar e respirar..." },
    { id:"cp_4", type:"question", icon:"👁️", title:"Espelho da Mente", question:"Como o personagem se vê quando está se sentindo mal?" },
    { id:"cp_5", type:"choice", icon:"🌐", title:"Rede de Comparação", question:"Quando o personagem se compara com alguém, o que costuma pensar?", choices:["Sou menos do que o outro","Sou diferente, mas tudo bem","Quero ser como o outro","Não consigo parar de me comparar"] },
    { id:"cp_6", type:"tool_unlock", icon:"🔦", title:"Lanterna dos Pensamentos", tool:"Lanterna dos Pensamentos", toolEmoji:"🔦", toolDescription:"Ilumina pensamentos escuros para ver se são reais ou só medos disfarçados." },
  ],
  caverna_silencio: [
    { id:"cs_1", type:"question", icon:"🌑", title:"Na Escuridão", question:"O que o personagem sente quando fica quieto por dentro?" },
    { id:"cs_2", type:"question", icon:"🚪", title:"Porta Fechada", question:"Quando não quer falar, o que o personagem está guardando?" },
    { id:"cs_3", type:"question", icon:"🎭", title:"Máscara do Dia", question:"Qual emoção o personagem mais esconde dos outros?" },
    { id:"cs_4", type:"breathing", icon:"💨", title:"Luz na Escuridão", question:"Vamos acender uma luz juntos..." },
    { id:"cs_5", type:"question", icon:"🕯️", title:"Vela Acesa", question:"Quem ou o quê consegue trazer um pouquinho de luz para a caverna?" },
    { id:"cs_6", type:"tool_unlock", icon:"🗝️", title:"Chave da Comunicação", tool:"Chave da Comunicação", toolEmoji:"🗝️", toolDescription:"Abre a porta quando as palavras não saem. Mostra o que sente ao invés de esconder." },
  ],
  ponte_coragem: [
    { id:"pc_1", type:"question", icon:"🌉", title:"A Ponte", question:"O que o personagem gostaria de conseguir atravessar sem medo?" },
    { id:"pc_2", type:"question", icon:"⚡", title:"Poder Secreto", question:"Qual é a força escondida que o personagem ainda não usou?" },
    { id:"pc_3", type:"question", icon:"🤝", title:"Aliado da Jornada", question:"Quem ajuda o personagem quando ele está no meio da ponte?" },
    { id:"pc_4", type:"choice", icon:"🎯", title:"Primeiro Passo", question:"Qual é o primeiro passo que o personagem consegue dar hoje?", choices:["Falar com alguém de confiança","Tentar algo que evitava","Pedir ajuda","Respirar e continuar"] },
    { id:"pc_5", type:"question", icon:"🏆", title:"Vitória Interior", question:"O que seria uma grande vitória para o personagem?" },
    { id:"pc_6", type:"tool_unlock", icon:"🧭", title:"Bússola Emocional", tool:"Bússola Emocional", toolEmoji:"🧭", toolDescription:"Aponta o caminho mesmo quando parece que não há saída. Confie no que você sente." },
  ],
};

// ── API helpers ─────────────────────────────────────────────────────────────
async function patchSession(id: string, update: Partial<TherapeuticSession>) {
  await fetch(`/api/therapeutic-sessions/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(update),
  });
}

// ── Breathing mini game ────────────────────────────────────────────────────
const BREATH_PHASES = [
  { label: "Inspire...", duration: 4000, scale: 1.5 },
  { label: "Segure...", duration: 2000, scale: 1.5 },
  { label: "Expire...", duration: 4000, scale: 1.0 },
  { label: "Descanse...", duration: 2000, scale: 1.0 },
];
const TOTAL_CYCLES = 3;

function BreathingGame({ onComplete }: { onComplete: () => void }) {
  const [cycle, setCycle] = useState(0);
  const [phaseIdx, setPhaseIdx] = useState(0);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (done) return;
    const phase = BREATH_PHASES[phaseIdx];
    const t = setTimeout(() => {
      const nextPhase = (phaseIdx + 1) % BREATH_PHASES.length;
      if (nextPhase === 0) {
        const nextCycle = cycle + 1;
        if (nextCycle >= TOTAL_CYCLES) { setDone(true); return; }
        setCycle(nextCycle);
      }
      setPhaseIdx(nextPhase);
    }, phase.duration);
    return () => clearTimeout(t);
  }, [phaseIdx, cycle, done]);

  const phase = BREATH_PHASES[phaseIdx];

  return (
    <div className="flex flex-col items-center gap-6 py-4">
      <div className="flex gap-1.5">
        {Array.from({ length: TOTAL_CYCLES }).map((_, i) => (
          <div key={i} className={`h-1.5 w-8 rounded-full transition-all ${i < cycle ? "bg-cyan-400" : i === cycle ? "bg-cyan-200" : "bg-white/20"}`} />
        ))}
      </div>
      <div className="relative flex items-center justify-center" style={{ width: 180, height: 180 }}>
        <motion.div
          animate={{ scale: phase.scale }}
          transition={{ duration: phase.duration / 1000, ease: "easeInOut" }}
          className="absolute rounded-full"
          style={{ width: 100, height: 100, background: "radial-gradient(circle, rgba(6,182,212,0.6) 0%, rgba(6,182,212,0.1) 70%)", boxShadow: "0 0 40px rgba(6,182,212,0.4)" }}
        />
        <motion.div
          animate={{ scale: phase.scale * 0.6 }}
          transition={{ duration: phase.duration / 1000, ease: "easeInOut" }}
          className="absolute rounded-full bg-cyan-400/40"
          style={{ width: 80, height: 80 }}
        />
      </div>
      <p className="text-2xl font-bold text-cyan-200">{done ? "✨ Muito bem!" : phase.label}</p>
      {!done && (
        <p className="text-sm text-white/50">Ciclo {cycle + 1} de {TOTAL_CYCLES}</p>
      )}
      {done && (
        <motion.button
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          onClick={onComplete}
          className="px-8 py-3 rounded-full bg-cyan-500 text-white font-bold text-lg hover:bg-cyan-400 transition-colors"
        >
          Continuar →
        </motion.button>
      )}
    </div>
  );
}

// ── Character Creator ──────────────────────────────────────────────────────
function CharacterCreator({ sessionId, onDone }: { sessionId: string; onDone: (char: CharacterData) => void }) {
  const [step, setStep] = useState(0);
  const [char, setChar] = useState<CharacterData>({ name: "", avatar: "🦁", power: "", fear: "", energyType: "" });

  function next() {
    if (step < 3) setStep(s => s + 1);
    else { onDone(char); }
  }

  const canNext =
    step === 0 ? char.name.trim().length >= 2 :
    step === 1 ? char.avatar !== "" :
    step === 2 ? char.power !== "" && char.fear !== "" :
    char.energyType !== "";

  const steps = ["Nome", "Avatar", "Essência", "Energia"];

  return (
    <div className="flex flex-col gap-6 max-w-sm mx-auto">
      {/* Progress */}
      <div className="flex gap-2">
        {steps.map((s, i) => (
          <div key={i} className="flex-1 text-center">
            <div className={`h-1.5 rounded-full mb-1 ${i <= step ? "bg-cyan-400" : "bg-white/20"}`} />
            <span className={`text-xs ${i === step ? "text-cyan-300" : "text-white/40"}`}>{s}</span>
          </div>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div key={step} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">

          {step === 0 && (
            <>
              <p className="text-white/70 text-sm">Qual é o nome do seu personagem?</p>
              <input
                value={char.name}
                onChange={e => setChar(c => ({ ...c, name: e.target.value }))}
                placeholder="Ex: Kira, Zephyr, Bolt..."
                maxLength={20}
                className="w-full bg-white/10 border border-white/20 rounded-2xl px-4 py-3 text-white placeholder:text-white/30 focus:outline-none focus:border-cyan-400 text-lg"
              />
              {char.name.trim().length >= 2 && (
                <p className="text-center text-2xl animate-bounce">
                  {char.avatar}
                </p>
              )}
            </>
          )}

          {step === 1 && (
            <>
              <p className="text-white/70 text-sm">Escolha a aparência do personagem:</p>
              <div className="grid grid-cols-5 gap-2">
                {AVATARS.map(a => (
                  <button
                    key={a}
                    onClick={() => setChar(c => ({ ...c, avatar: a }))}
                    className={`text-3xl p-2 rounded-xl transition-all ${char.avatar === a ? "bg-cyan-500/40 scale-110 ring-2 ring-cyan-400" : "bg-white/10 hover:bg-white/20"}`}
                  >
                    {a}
                  </button>
                ))}
              </div>
            </>
          )}

          {step === 2 && (
            <>
              <div>
                <p className="text-white/70 text-sm mb-2">O personagem é bom em...</p>
                <div className="grid grid-cols-2 gap-2">
                  {POWERS.map(p => (
                    <button key={p} onClick={() => setChar(c => ({ ...c, power: p }))}
                      className={`text-left text-xs px-3 py-2.5 rounded-xl transition-all ${char.power === p ? "bg-cyan-500/40 text-cyan-200 ring-1 ring-cyan-400" : "bg-white/10 text-white/70 hover:bg-white/20"}`}>
                      {p}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-white/70 text-sm mb-2">O personagem tende a evitar...</p>
                <div className="grid grid-cols-2 gap-2">
                  {FEARS.map(f => (
                    <button key={f} onClick={() => setChar(c => ({ ...c, fear: f }))}
                      className={`text-left text-xs px-3 py-2.5 rounded-xl transition-all ${char.fear === f ? "bg-violet-500/40 text-violet-200 ring-1 ring-violet-400" : "bg-white/10 text-white/70 hover:bg-white/20"}`}>
                      {f}
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}

          {step === 3 && (
            <>
              <p className="text-white/70 text-sm">O que carrega o personagem?</p>
              <div className="space-y-2">
                {ENERGY_TYPES.map(e => (
                  <button key={e.label} onClick={() => setChar(c => ({ ...c, energyType: e.label }))}
                    className={`w-full text-left px-4 py-3 rounded-xl transition-all ${char.energyType === e.label ? "bg-amber-500/30 text-amber-200 ring-1 ring-amber-400" : "bg-white/10 text-white/70 hover:bg-white/20"}`}>
                    <span className="font-medium text-sm">{e.label}</span>
                    <span className="text-xs text-white/40 block mt-0.5">{e.desc}</span>
                  </button>
                ))}
              </div>
            </>
          )}
        </motion.div>
      </AnimatePresence>

      <button
        disabled={!canNext}
        onClick={next}
        className={`w-full py-3 rounded-2xl font-bold text-lg transition-all ${canNext ? "bg-cyan-500 text-white hover:bg-cyan-400" : "bg-white/10 text-white/30 cursor-not-allowed"}`}
      >
        {step < 3 ? "Continuar →" : `Começar a Jornada de ${char.name}!`}
      </button>
    </div>
  );
}

// ── Emotional Map ──────────────────────────────────────────────────────────
function EmotionalMap({ session, onSelect }: { session: TherapeuticSession; onSelect: (regionId: string) => void }) {
  const char = session.characterData;
  return (
    <div className="space-y-4 max-w-sm mx-auto">
      <div className="text-center">
        <span className="text-5xl">{char.avatar}</span>
        <p className="text-white font-bold mt-2">{char.name}</p>
        <p className="text-white/50 text-xs">Escolha um lugar para explorar</p>
      </div>
      <div className="space-y-3">
        {REGIONS.map(r => {
          const completed = session.completedRegions.includes(r.id);
          const isCurrent = session.currentRegion === r.id;
          return (
            <motion.button
              key={r.id}
              whileHover={!completed ? { scale: 1.02 } : {}}
              whileTap={!completed ? { scale: 0.98 } : {}}
              onClick={() => !completed && onSelect(r.id)}
              className={`w-full text-left p-4 rounded-2xl border transition-all ${
                completed
                  ? "border-white/10 bg-white/5 opacity-50"
                  : isCurrent
                  ? "border-cyan-400/50 bg-white/10"
                  : "border-white/20 bg-white/10 hover:bg-white/15 hover:border-white/30"
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="text-3xl">{r.emoji}</span>
                <div className="flex-1">
                  <p className={`font-bold text-sm ${completed ? "text-white/40" : "text-white"}`}>{r.name}</p>
                  <p className="text-xs text-white/40">{r.desc}</p>
                </div>
                {completed ? (
                  <span className="text-green-400 text-lg">✓</span>
                ) : (
                  <span className="text-white/40">→</span>
                )}
              </div>
            </motion.button>
          );
        })}
      </div>
      {session.completedRegions.length === REGIONS.length && (
        <div className="text-center p-4 rounded-2xl bg-gradient-to-r from-amber-500/20 to-yellow-500/20 border border-amber-400/30">
          <p className="text-amber-200 font-bold">🏆 Jornada completa!</p>
          <p className="text-white/60 text-xs mt-1">Todas as regiões foram exploradas</p>
        </div>
      )}
    </div>
  );
}

// ── Region Board ───────────────────────────────────────────────────────────
function RegionBoard({
  session,
  onHouseDone,
  onRegionDone,
}: {
  session: TherapeuticSession;
  onHouseDone: (response: TherapeuticResponse) => void;
  onRegionDone: () => void;
}) {
  const regionId = session.currentRegion!;
  const region = REGIONS.find(r => r.id === regionId)!;
  const houses = REGION_HOUSES[regionId] ?? [];
  const currentIdx = session.currentHouseIndex;
  const house = houses[currentIdx];

  const [answer, setAnswer] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [showBreathing, setShowBreathing] = useState(house?.type === "breathing");
  const [showToolUnlock, setShowToolUnlock] = useState(false);
  const submitTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => { if (submitTimerRef.current) clearTimeout(submitTimerRef.current); };
  }, []);

  useEffect(() => {
    setAnswer("");
    setSubmitted(false);
    setShowBreathing(house?.type === "breathing");
    setShowToolUnlock(false);
  }, [currentIdx, house?.type]);

  function handleSubmit(answerText: string) {
    if (!house) return;
    const resp: TherapeuticResponse = {
      houseId: house.id,
      question: house.question ?? house.title,
      answer: answerText,
      timestamp: new Date().toISOString(),
    };
    setSubmitted(true);
    if (house.type === "tool_unlock") { setShowToolUnlock(true); }
    if (submitTimerRef.current) clearTimeout(submitTimerRef.current);
    submitTimerRef.current = setTimeout(() => {
      onHouseDone(resp);
    }, house.type === "tool_unlock" ? 3000 : 1200);
  }

  if (!house) {
    return (
      <div className="text-center space-y-4 max-w-sm mx-auto py-8">
        <span className="text-6xl">{region.emoji}</span>
        <p className="text-white font-bold text-xl">{region.name} explorada!</p>
        <p className="text-white/60 text-sm">Você descobriu muitas coisas aqui.</p>
        <button onClick={onRegionDone} className="px-8 py-3 rounded-2xl bg-cyan-500 text-white font-bold hover:bg-cyan-400 transition-colors">
          Voltar ao Mapa →
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-sm mx-auto space-y-4">
      {/* Region header */}
      <div className="flex items-center gap-2 px-1">
        <span className="text-2xl">{region.emoji}</span>
        <div>
          <p className="text-white font-bold text-sm">{region.name}</p>
          <div className="flex gap-1 mt-1">
            {houses.map((_, i) => (
              <div key={i} className={`h-1.5 flex-1 rounded-full ${i < currentIdx ? "bg-cyan-400" : i === currentIdx ? "bg-white/60" : "bg-white/15"}`} />
            ))}
          </div>
        </div>
      </div>

      {/* House card */}
      <AnimatePresence mode="wait">
        <motion.div
          key={house.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="rounded-3xl p-6 space-y-4"
          style={{ background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.12)" }}
        >
          <div className="flex items-center gap-3">
            <span className="text-3xl">{house.icon}</span>
            <div>
              <p className="text-white font-bold">{house.title}</p>
              <p className="text-xs text-white/40">Casa {currentIdx + 1} de {houses.length}</p>
            </div>
          </div>

          {/* Question */}
          {house.type === "question" && (
            <>
              <p className="text-white/80 text-sm leading-relaxed">{house.question}</p>
              {!submitted ? (
                <>
                  <textarea
                    value={answer}
                    onChange={e => setAnswer(e.target.value)}
                    placeholder="O que o personagem diria..."
                    className="w-full bg-white/10 border border-white/20 rounded-xl px-3 py-2.5 text-white text-sm placeholder:text-white/30 focus:outline-none focus:border-cyan-400 resize-none"
                    rows={3}
                  />
                  <button
                    disabled={answer.trim().length < 2}
                    onClick={() => handleSubmit(answer.trim())}
                    className={`w-full py-2.5 rounded-xl font-semibold text-sm transition-all ${answer.trim().length >= 2 ? "bg-cyan-500 text-white hover:bg-cyan-400" : "bg-white/10 text-white/30 cursor-not-allowed"}`}
                  >
                    Registrar →
                  </button>
                </>
              ) : (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-4">
                  <span className="text-3xl">✨</span>
                  <p className="text-cyan-300 font-semibold mt-2">Registrado!</p>
                </motion.div>
              )}
            </>
          )}

          {/* Choice */}
          {house.type === "choice" && (
            <>
              <p className="text-white/80 text-sm leading-relaxed">{house.question}</p>
              {!submitted ? (
                <div className="space-y-2">
                  {house.choices?.map(c => (
                    <button key={c} onClick={() => { setAnswer(c); handleSubmit(c); }}
                      className="w-full text-left text-sm px-4 py-2.5 rounded-xl bg-white/10 text-white/80 hover:bg-white/20 hover:text-white transition-all border border-white/10 hover:border-white/30">
                      {c}
                    </button>
                  ))}
                </div>
              ) : (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-4">
                  <span className="text-3xl">✨</span>
                  <p className="text-cyan-300 font-semibold mt-2">Registrado!</p>
                </motion.div>
              )}
            </>
          )}

          {/* Breathing */}
          {house.type === "breathing" && (
            showBreathing
              ? <BreathingGame onComplete={() => { setShowBreathing(false); handleSubmit("exercício de respiração concluído"); }} />
              : submitted
                ? <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-4">
                    <span className="text-3xl">✨</span>
                    <p className="text-cyan-300 font-semibold mt-2">Registrado!</p>
                  </motion.div>
                : null
          )}

          {/* Tool unlock */}
          {house.type === "tool_unlock" && (
            <AnimatePresence>
              {!showToolUnlock ? (
                <motion.div key="pre" className="text-center space-y-3">
                  <p className="text-white/70 text-sm">Você está prestes a desbloquear uma ferramenta poderosa!</p>
                  <button onClick={() => handleSubmit("ferramenta desbloqueada")}
                    className="px-8 py-3 rounded-2xl bg-amber-500 text-white font-bold hover:bg-amber-400 transition-colors">
                    Desbloquear {house.toolEmoji}
                  </button>
                </motion.div>
              ) : (
                <motion.div key="post" initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-center space-y-3 py-2">
                  <motion.span animate={{ rotate: [0, -10, 10, -10, 0] }} transition={{ repeat: 2, duration: 0.4 }} className="text-6xl block">{house.toolEmoji}</motion.span>
                  <p className="text-amber-200 font-bold text-lg">{house.tool} desbloqueada!</p>
                  <p className="text-white/60 text-xs leading-relaxed">{house.toolDescription}</p>
                </motion.div>
              )}
            </AnimatePresence>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

// ── Tools display ──────────────────────────────────────────────────────────
function ToolsDisplay({ tools }: { tools: string[] }) {
  if (tools.length === 0) return null;
  const toolMap: Record<string, { emoji: string; desc: string }> = {
    "Poção de Respiração": { emoji: "🧪", desc: "Respira fundo três vezes quando a tempestade chegar." },
    "Escudo da Calma": { emoji: "🛡️", desc: "Visualize o escudo antes de agir na raiva." },
    "Lanterna dos Pensamentos": { emoji: "🔦", desc: "Ilumina pensamentos escuros para ver a realidade." },
    "Chave da Comunicação": { emoji: "🗝️", desc: "Mostra o que sente ao invés de esconder." },
    "Bússola Emocional": { emoji: "🧭", desc: "Aponta o caminho mesmo quando parece não haver saída." },
  };
  return (
    <div className="space-y-2">
      <p className="text-white/50 text-xs uppercase tracking-wider">Ferramentas desbloqueadas</p>
      <div className="flex flex-wrap gap-2">
        {tools.map(t => {
          const info = toolMap[t];
          return info ? (
            <div key={t} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-500/20 border border-amber-400/30">
              <span className="text-sm">{info.emoji}</span>
              <span className="text-amber-200 text-xs font-medium">{t}</span>
            </div>
          ) : null;
        })}
      </div>
    </div>
  );
}

// ── Main component ─────────────────────────────────────────────────────────
export function MundoInterior({ sessionId }: { sessionId: string }) {
  const [session, setSession] = useState<TherapeuticSession | null>(null);
  const [loading, setLoading] = useState(true);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  // Nº de gravações em voo. O polling de 8s NÃO aplica o estado do servidor
  // enquanto há uma escrita pendente — senão reverteria a resposta otimista
  // (e podia perder progresso em conexão instável). Finding CORR-002.
  const writeInFlightRef = useRef(0);

  const loadSession = useCallback(async () => {
    const res = await fetch(`/api/therapeutic-sessions/${sessionId}`);
    if (res.ok) {
      const data = await res.json();
      if (writeInFlightRef.current === 0) setSession(data);
    }
    setLoading(false);
  }, [sessionId]);

  useEffect(() => {
    loadSession();
    pollRef.current = setInterval(loadSession, 8000);
    return () => { if (pollRef.current) clearInterval(pollRef.current); };
  }, [loadSession]);

  async function updateSession(update: Partial<TherapeuticSession>) {
    const optimistic = { ...session!, ...update };
    setSession(optimistic);
    writeInFlightRef.current += 1;
    try {
      await patchSession(sessionId, update);
    } finally {
      writeInFlightRef.current -= 1;
    }
  }

  async function handleCharacterDone(char: CharacterData) {
    await updateSession({ characterData: char, phase: "map" });
  }

  async function handleRegionSelect(regionId: string) {
    await updateSession({ currentRegion: regionId, currentHouseIndex: 0, phase: "board" });
  }

  async function handleHouseDone(response: TherapeuticResponse) {
    if (!session) return;
    const houses = REGION_HOUSES[session.currentRegion!] ?? [];
    const newResponses = [...session.responses, response];
    const nextIdx = session.currentHouseIndex + 1;
    const isLastHouse = nextIdx >= houses.length;

    if (isLastHouse) {
      const house = houses[session.currentHouseIndex];
      const newTools = house?.type === "tool_unlock" && house.tool
        ? [...session.unlockedTools, house.tool]
        : session.unlockedTools;
      const newCompleted = [...session.completedRegions, session.currentRegion!];
      const allComplete = newCompleted.length >= REGIONS.length;
      await updateSession({
        responses: newResponses,
        unlockedTools: newTools,
        completedRegions: newCompleted,
        currentHouseIndex: nextIdx,
        phase: allComplete ? "complete" : "board",
      });
    } else {
      const house = houses[session.currentHouseIndex];
      const newTools = house?.type === "tool_unlock" && house.tool
        ? [...session.unlockedTools, house.tool]
        : session.unlockedTools;
      await updateSession({ responses: newResponses, currentHouseIndex: nextIdx, unlockedTools: newTools });
    }
  }

  async function handleRegionDone() {
    await updateSession({ currentRegion: null, phase: "map" });
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%)" }}>
        <div className="text-white/60 text-sm animate-pulse">Carregando jornada...</div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%)" }}>
        <p className="text-white/60">Sessão não encontrada.</p>
      </div>
    );
  }

  const region = REGIONS.find(r => r.id === session.currentRegion);

  return (
    <div
      className="min-h-screen overflow-y-auto"
      style={{
        background: session.phase === "board" && region
          ? `linear-gradient(135deg, ${region.color}33 0%, #0f0c29 60%)`
          : "linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%)",
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 pt-5 pb-3">
        <div>
          <h1 className="text-white font-bold text-lg">🌌 Mundo Interior</h1>
          {session.characterData.name && (
            <p className="text-white/50 text-xs">
              {session.characterData.avatar} {session.characterData.name}
            </p>
          )}
        </div>
        {session.unlockedTools.length > 0 && (
          <div className="flex gap-1">
            {session.unlockedTools.map((_, i) => <span key={i} className="text-amber-400 text-sm">⭐</span>)}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="px-4 pb-8 my-4">
        <AnimatePresence mode="wait">
          {session.phase === "character_creation" && (
            <motion.div key="char" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <div className="mb-6 text-center">
                <p className="text-white/80 text-base font-semibold">Vamos criar seu personagem</p>
                <p className="text-white/40 text-xs mt-1">Ele vai te acompanhar em toda a jornada</p>
              </div>
              <CharacterCreator sessionId={sessionId} onDone={handleCharacterDone} />
            </motion.div>
          )}

          {session.phase === "map" && (
            <motion.div key="map" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
              {session.unlockedTools.length > 0 && <ToolsDisplay tools={session.unlockedTools} />}
              <EmotionalMap session={session} onSelect={handleRegionSelect} />
            </motion.div>
          )}

          {(session.phase === "board" || session.phase === "tool_unlock") && (
            <motion.div key="board" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <RegionBoard session={session} onHouseDone={handleHouseDone} onRegionDone={handleRegionDone} />
            </motion.div>
          )}

          {session.phase === "complete" && (
            <motion.div key="complete" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center space-y-6 py-12">
              <motion.span animate={{ rotate: [0, 10, -10, 10, 0] }} transition={{ repeat: Infinity, duration: 2 }} className="text-7xl block">🏆</motion.span>
              <div>
                <p className="text-white font-bold text-2xl">Jornada concluída!</p>
                <p className="text-white/60 text-sm mt-2">{session.characterData.name} explorou o Mundo Interior por completo</p>
              </div>
              <ToolsDisplay tools={session.unlockedTools} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
