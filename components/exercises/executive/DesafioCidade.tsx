"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { calculateExerciseScore } from "@/lib/scoring";
import { useTimedProgress } from "@/components/exercises/useExerciseEngine";
import { ExerciseProgressBar } from "@/components/exercises/ExerciseProgressBar";
import type { ExerciseResult, Theme } from "@/types";

// ─── Tipos ────────────────────────────────────────────────────────────────────

type EnvId = "cinema" | "restaurante" | "farmacia";
type Phase = "briefing" | "mission" | "result";

// ─── Paleta por tema ──────────────────────────────────────────────────────────

function pal(theme: Theme) {
  const isGamified = theme === "GAMIFIED";
  const isColorful = theme === "COLORFUL";
  if (isGamified) return {
    bg: "bg-transparent",
    wrap: "border border-white/15",
    card: "border border-white/15",
    cardHover: "hover:border-white/30",
    title: "text-white",
    sub: "text-white/70",
    text: "text-white/90",
    muted: "text-white/60",
    accent: "text-cyan-300",
    badge: "bg-cyan-900/60 text-cyan-300",
    btn: "text-white",
    sel: "border-cyan-400 bg-cyan-900/40",
    unsel: "border-white/20 bg-white/10 hover:border-white/30",
    correct: "border-green-500 bg-green-900/30",
    wrong: "border-red-500 bg-red-900/30",
    bar: "bg-white/10",
    draggable: "border-white/20 bg-white/10",
    story: "bg-white/10 border border-white/20",
    storyLabel: "text-cyan-300",
    storyBody: "text-white/80",
  };
  if (isColorful) return {
    bg: "bg-transparent",
    wrap: "bg-white border border-[rgba(26,39,68,0.08)]",
    card: "bg-white border border-[rgba(26,39,68,0.08)]",
    cardHover: "hover:border-purple-300 hover:shadow-md",
    title: "text-[#1a2744]",
    sub: "text-[#8a7a6a]",
    text: "text-gray-800",
    muted: "text-[#8a7a6a]",
    accent: "text-purple-600",
    badge: "bg-purple-100 text-purple-700",
    btn: "text-white",
    sel: "border-purple-500 bg-purple-50",
    unsel: "border-[rgba(26,39,68,0.08)] bg-white hover:border-purple-300",
    correct: "border-green-400 bg-green-50",
    wrong: "border-red-400 bg-red-50",
    bar: "bg-purple-100",
    draggable: "border-[rgba(26,39,68,0.08)] bg-white",
    story: "bg-purple-50 border border-purple-200",
    storyLabel: "text-purple-600",
    storyBody: "text-purple-900",
  };
  return {
    bg: "bg-transparent",
    wrap: "bg-white border border-[rgba(26,39,68,0.08)]",
    card: "bg-white border border-[rgba(26,39,68,0.08)]",
    cardHover: "hover:border-blue-300 hover:shadow-md",
    title: "text-[#1a2744]",
    sub: "text-[#8a7a6a]",
    text: "text-gray-800",
    muted: "text-[#8a7a6a]",
    accent: "text-blue-700",
    badge: "bg-blue-50 text-blue-700",
    btn: "text-white",
    sel: "border-blue-500 bg-blue-50",
    unsel: "border-[rgba(26,39,68,0.08)] bg-white hover:border-blue-300",
    correct: "border-green-400 bg-green-50",
    wrong: "border-red-300 bg-red-50",
    bar: "bg-slate-200",
    draggable: "border-[rgba(26,39,68,0.08)] bg-white",
    story: "bg-blue-50 border border-blue-200",
    storyLabel: "text-blue-700",
    storyBody: "text-blue-900",
  };
}

function palBtnStyle(theme: Theme): React.CSSProperties {
  if (theme === "GAMIFIED") return { background: "linear-gradient(135deg, #0891b2, #0e7490)", borderRadius: 9999, color: "white", boxShadow: "0 4px 16px rgba(8,145,178,0.4)" };
  if (theme === "COLORFUL") return { background: "linear-gradient(135deg, #7c3aed, #db2777)", borderRadius: 9999, color: "white", boxShadow: "0 4px 20px rgba(124,58,237,0.35)" };
  return { background: "linear-gradient(135deg, #1a2744, #2a4a8a)", borderRadius: 9999, color: "white", boxShadow: "0 4px 16px rgba(26,39,68,0.35)" };
}

function palCardStyle(theme: Theme): React.CSSProperties {
  if (theme === "GAMIFIED") return { background: "rgba(255,255,255,0.08)", backdropFilter: "blur(16px)", border: "1.5px solid rgba(255,255,255,0.15)", borderRadius: 20, boxShadow: "0 8px 40px rgba(0,0,0,0.5)" };
  return { background: "#ffffff", border: "1.5px solid rgba(26,39,68,0.08)", borderRadius: 20, boxShadow: "0 4px 20px rgba(26,39,68,0.08)" };
}

function palRootBg(theme: Theme): React.CSSProperties {
  if (theme === "GAMIFIED") return { background: "linear-gradient(145deg, #0a1628 0%, #0d2244 45%, #132a52 70%, #081020 100%)" };
  if (theme === "COLORFUL") return { background: "linear-gradient(135deg, #f0e6ff 0%, #fce4f0 55%, #ffe8e0 100%)" };
  return { background: "linear-gradient(160deg, #ede8df 0%, #e4ddd0 55%, #dbd4c5 100%)" };
}

function parseHour(h: string): number {
  const parts = h.split("h").map(Number);
  return parts[0] * 60 + (parts[1] || 0);
}

function parseDuration(d: string): number {
  const parts = d.split("h").map(Number);
  return parts[0] * 60 + (parts[1] || 0);
}

// ─── CINEMA ───────────────────────────────────────────────────────────────────

const FILMES = [
  { id: "acao", title: "A Grande Fuga", genre: "Ação", duration: "2h10", rating: "14" },
  { id: "drama", title: "O Último Verão", genre: "Drama", duration: "1h55", rating: "12" },
  { id: "comedia", title: "Caos Total", genre: "Comédia", duration: "1h40", rating: "L" },
  { id: "thriller", title: "Código Sombra", genre: "Thriller", duration: "2h20", rating: "16" },
  { id: "doc", title: "Oceanos Vivos", genre: "Documentário", duration: "1h30", rating: "L" },
  { id: "ani", title: "Mundo Mágico", genre: "Animação", duration: "1h45", rating: "L" },
];

const INGRESSOS = [
  { id: "meia", label: "Meia-entrada", price: 14, note: "Estudante / Professor / Idoso (60+)" },
  { id: "inteira", label: "Inteira", price: 28, note: "Padrão" },
  { id: "vip", label: "VIP Poltrona", price: 42, note: "Reclinável + serviço" },
];

const HORARIOS = ["13h30", "15h45", "18h00", "20h15", "22h30"];

interface Snack { id: string; name: string; emoji: string; price: number; }
const SNACKS: Snack[] = [
  { id: "pipoca-p", name: "Pipoca P", emoji: "🍿", price: 10 },
  { id: "pipoca-g", name: "Pipoca G", emoji: "🍿", price: 16 },
  { id: "refri-p", name: "Refrigerante P", emoji: "🥤", price: 8 },
  { id: "refri-g", name: "Refrigerante G", emoji: "🥤", price: 12 },
  { id: "combo", name: "Combo G", emoji: "🍿🥤", price: 22 },
  { id: "agua", name: "Água", emoji: "💧", price: 5 },
  { id: "choc", name: "Chocolate", emoji: "🍫", price: 9 },
  { id: "nachos", name: "Nachos", emoji: "🫔", price: 14 },
];

interface CinemaL1Scenario {
  story: string;
  canMeia: boolean;
  mustReturnBy: number | null; // hora limite em minutos (ex: 20 * 60)
}

const CINEMA_L1_SCENARIOS: CinemaL1Scenario[] = [
  {
    story: "Você tem a carteirinha de estudante na mochila e prometeu à sua mãe que estaria em casa para o jantar — ela serve às 20h em ponto. Não vai conseguir comer se chegar atrasado.",
    canMeia: true,
    mustReturnBy: 20,
  },
  {
    story: "É o aniversário da sua avó Dona Maria, 73 anos. Você vai deixá-la no cinema — ela quer muito ir, mas você precisa voltar ao trabalho. O médico pediu que ela não fique fora de casa depois das 19h por causa da medicação. Compre só o ingresso dela dentro do seu orçamento.",
    canMeia: true,
    mustReturnBy: 19,
  },
  {
    story: "Você e um colega de trabalho combinaram de ir ao cinema direto do expediente. Nenhum de vocês tem documento de estudante ou qualquer outro desconto — são funcionários CLT comuns. Sem pressa para voltar.",
    canMeia: false,
    mustReturnBy: null,
  },
  {
    story: "Você tem 67 anos, está aposentado e ganhou o dia inteiro livre — sem compromissos, sem pressa. O que você escolhe?",
    canMeia: true,
    mustReturnBy: null,
  },
];

// L1 — selecionar ingresso dentro do orçamento
function CinemaL1({ theme, onFinish }: { theme: Theme; onFinish: (ok: boolean) => void }) {
  const p = pal(theme);
  const scenario = useRef(CINEMA_L1_SCENARIOS[Math.floor(Math.random() * CINEMA_L1_SCENARIOS.length)]);
  // Quando canMeia=false o menor ticket válido é inteira (R$28), então o budget mínimo precisa cobri-lo.
  const budget = useRef(
    scenario.current.canMeia
      ? 20 + Math.floor(Math.random() * 12)   // R$20–R$31: meia (R$14) sempre cabe
      : 30 + Math.floor(Math.random() * 12)   // R$30–R$41: inteira (R$28) sempre cabe
  );
  const filme = useRef(FILMES[Math.floor(Math.random() * FILMES.length)]);
  const horarios = useRef((() => {
    const all = [...HORARIOS];
    if (!scenario.current.mustReturnBy) {
      return all.sort(() => Math.random() - 0.5).slice(0, 3);
    }
    const durMin = parseDuration(filme.current.duration);
    const limitMin = scenario.current.mustReturnBy * 60;
    const valid = all.filter(h => parseHour(h) + durMin <= limitMin);
    const invalid = all.filter(h => parseHour(h) + durMin > limitMin);
    const picked: string[] = [];
    if (valid.length > 0) picked.push(valid[Math.floor(Math.random() * valid.length)]);
    const shuffledInvalid = [...invalid].sort(() => Math.random() - 0.5);
    for (let i = 0; i < shuffledInvalid.length && picked.length < 3; i++) picked.push(shuffledInvalid[i]);
    const remaining = all.filter(h => !picked.includes(h)).sort(() => Math.random() - 0.5);
    while (picked.length < 3 && remaining.length > 0) picked.push(remaining.shift()!);
    return picked.sort((a, b) => parseHour(a) - parseHour(b));
  })());
  const [ticket, setTicket] = useState<string | null>(null);
  const [hora, setHora] = useState<string | null>(null);
  const total = INGRESSOS.find(t => t.id === ticket)?.price ?? 0;

  function isValidChoice() {
    if (!ticket || !hora || total > budget.current) return false;
    if (!scenario.current.canMeia && ticket === "meia") return false;
    if (scenario.current.mustReturnBy !== null) {
      const endMin = parseHour(hora) + parseDuration(filme.current.duration);
      if (endMin > scenario.current.mustReturnBy * 60) return false;
    }
    return true;
  }

  return (
    <div className="space-y-4">
      <div className={`rounded-xl p-4 ${p.story}`}>
        <p className={`text-xs font-bold uppercase tracking-wide mb-1 ${p.storyLabel}`}>📖 Cenário</p>
        <p className={`text-sm ${p.storyBody}`}>{scenario.current.story}</p>
      </div>

      <div className={`rounded-xl p-4 ${p.card}`}>
        <p className={`text-xs uppercase tracking-wide font-semibold mb-1 ${p.muted}`}>
          {filme.current.genre} · {filme.current.duration} · {filme.current.rating}+
        </p>
        <p className={`font-bold text-base ${p.title}`}>{filme.current.title}</p>
        <p className={`text-sm font-semibold mt-1 ${p.accent}`}>Orçamento: R$ {budget.current}</p>
      </div>

      <div>
        <p className={`text-xs font-semibold uppercase tracking-wide mb-2 ${p.muted}`}>Tipo de ingresso</p>
        <div className="space-y-2">
          {INGRESSOS.map(t => (
            <button key={t.id} onClick={() => setTicket(t.id)}
              className={`w-full p-3 rounded-xl border-2 flex justify-between items-center transition-all ${ticket === t.id ? p.sel : p.unsel}`}
            >
              <div className="text-left">
                <p className={`text-sm font-semibold ${p.text}`}>{t.label}</p>
                <p className={`text-xs ${p.muted}`}>{t.note}</p>
              </div>
              <span className={`font-bold text-sm ${t.price > budget.current ? "text-red-500" : p.accent}`}>
                R$ {t.price}
              </span>
            </button>
          ))}
        </div>
      </div>

      <div>
        <p className={`text-xs font-semibold uppercase tracking-wide mb-2 ${p.muted}`}>Horário</p>
        <div className="grid grid-cols-3 gap-2">
          {horarios.current.map(h => {
            const endMin = parseHour(h) + parseDuration(filme.current.duration);
            const endH = Math.floor(endMin / 60);
            const endM = endMin % 60;
            const endLabel = `${endH}h${endM.toString().padStart(2, "0")}`;
            return (
              <button key={h} onClick={() => setHora(h)}
                className={`py-2.5 px-1 rounded-xl border-2 text-sm font-bold transition-all ${hora === h ? p.sel : p.unsel} ${p.text}`}
              >
                <span className="block">{h}</span>
                <span className={`block text-xs font-normal ${p.muted}`}>até {endLabel}</span>
              </button>
            );
          })}
        </div>
      </div>

      {ticket && (
        <p className={`text-sm text-center font-medium ${total > budget.current ? "text-red-500" : "text-green-600"}`}>
          Total: R$ {total} {total > budget.current ? "⚠️ Acima do orçamento" : "✓ Dentro do orçamento"}
        </p>
      )}

      <button
        onClick={() => onFinish(isValidChoice())}
        disabled={!ticket || !hora}
        className="w-full h-11 rounded-xl font-bold transition-all disabled:opacity-40"
        style={palBtnStyle(theme)}
      >Comprar ingresso</button>
    </div>
  );
}

const CINEMA_L2_STORIES = [
  "Recebi meu salário hoje, mas o aluguel levou quase tudo. Sobrou R$ {budget} e quero curtir o cinema com direito a pelo menos um lanche.",
  "Ganhei R$ {budget} numa raspadinha! Hora de comemorar: cinema com bombonière incluída.",
  "É meu aniversário e guardei R$ {budget} especialmente pra isso. Ingresso e algum lanche — tudo que eu quero!",
  "Só tenho R$ {budget} em dinheiro na carteira e precisa dar para o ingresso e alguma coisa pra comer durante o filme.",
];

// L2 — ingresso + lanches com orçamento apertado
function CinemaL2({ theme, onFinish }: { theme: Theme; onFinish: (ok: boolean) => void }) {
  const p = pal(theme);
  const budget = useRef(44 + Math.floor(Math.random() * 16));
  const story = useRef(CINEMA_L2_STORIES[Math.floor(Math.random() * CINEMA_L2_STORIES.length)]);
  const [ticket, setTicket] = useState<string | null>(null);
  const [snacks, setSnacks] = useState<Set<string>>(new Set());

  function toggleSnack(id: string) {
    setSnacks(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });
  }

  const tPrice = INGRESSOS.find(t => t.id === ticket)?.price ?? 0;
  const sTotal = [...snacks].reduce((s, id) => s + (SNACKS.find(x => x.id === id)?.price ?? 0), 0);
  const total = tPrice + sTotal;
  const over = total > budget.current;

  return (
    <div className="space-y-4">
      <div className={`rounded-xl p-4 ${p.story}`}>
        <p className={`text-xs font-bold uppercase tracking-wide mb-1 ${p.storyLabel}`}>📖 Situação</p>
        <p className={`text-sm ${p.storyBody}`}>{story.current.replace("{budget}", String(budget.current))}</p>
      </div>
      <div className={`flex justify-between items-center p-3 rounded-xl ${p.card}`}>
        <p className={`text-sm font-semibold ${p.text}`}>💰 Orçamento: R$ {budget.current}</p>
        <p className={`text-sm font-bold ${over ? "text-red-500" : "text-green-600"}`}>
          Gasto: R$ {total}
        </p>
      </div>

      <div>
        <p className={`text-xs font-semibold uppercase tracking-wide mb-2 ${p.muted}`}>Ingresso</p>
        <div className="grid grid-cols-3 gap-2">
          {INGRESSOS.map(t => (
            <button key={t.id} onClick={() => setTicket(t.id)}
              className={`p-2 rounded-xl border-2 flex flex-col items-center gap-1 transition-all ${ticket === t.id ? p.sel : p.unsel}`}
            >
              <p className={`text-xs font-semibold text-center leading-tight ${p.text}`}>{t.label}</p>
              <p className={`text-xs font-bold ${p.accent}`}>R$ {t.price}</p>
            </button>
          ))}
        </div>
      </div>

      <div>
        <p className={`text-xs font-semibold uppercase tracking-wide mb-2 ${p.muted}`}>Bombonière</p>
        <div className="grid grid-cols-2 gap-2">
          {SNACKS.slice(0, 6).map(s => (
            <button key={s.id} onClick={() => toggleSnack(s.id)}
              className={`p-2 rounded-xl border-2 flex items-center gap-2 transition-all ${snacks.has(s.id) ? p.sel : p.unsel}`}
            >
              <span className="text-xl">{s.emoji}</span>
              <div className="text-left">
                <p className={`text-xs font-semibold ${p.text}`}>{s.name}</p>
                <p className={`text-xs ${p.accent}`}>R$ {s.price}</p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {over && <p className="text-xs text-red-500 text-center">⚠️ Acima do orçamento! Remova algum item.</p>}
      {!over && ticket && snacks.size === 0 && (
        <p className="text-xs text-amber-600 text-center">Adicione pelo menos um item da bombonière.</p>
      )}

      <button
        onClick={() => onFinish(ticket !== null && snacks.size > 0 && !over)}
        disabled={!ticket || snacks.size === 0 || over}
        className={`w-full h-11 rounded-xl font-bold transition-all ${p.btn} disabled:opacity-40`}
      >Confirmar compra · R$ {total}</button>
    </div>
  );
}

// L3 — memorizar pedido da bombonière
function CinemaL3({ theme, onFinish }: { theme: Theme; onFinish: (ok: boolean) => void }) {
  const p = pal(theme);
  const count = useRef(3 + Math.floor(Math.random() * 2));
  const order = useRef([...SNACKS].sort(() => Math.random() - 0.5).slice(0, count.current));
  const [memorizing, setMemorizing] = useState(true);
  const [secs, setSecs] = useState(8);
  const [sel, setSel] = useState<Set<string>>(new Set());
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!memorizing) return;
    timerRef.current = setInterval(() => setSecs(s => s - 1), 1000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [memorizing]);

  useEffect(() => {
    if (!memorizing || secs > 0) return;
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
    setMemorizing(false);
  }, [memorizing, secs]);

  function toggle(id: string) {
    setSel(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });
  }

  function confirm() {
    const ids = new Set(order.current.map(s => s.id));
    onFinish([...ids].every(id => sel.has(id)) && sel.size === ids.size);
  }

  if (memorizing) return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <p className={`font-semibold text-sm ${p.title}`}>Memorize o pedido</p>
        <div className={`text-xs px-2 py-1 rounded-full ${p.badge}`}>{secs}s</div>
      </div>
      <div className={`rounded-xl p-4 space-y-2.5 ${p.card}`}>
        <p className={`text-xs font-bold uppercase tracking-wide mb-1 ${p.muted}`}>
          Pedido — {count.current} itens
        </p>
        {order.current.map((s, i) => (
          <motion.div key={s.id} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.1 }} className="flex items-center gap-3"
          >
            <span className="text-2xl">{s.emoji}</span>
            <span className={`text-sm font-medium ${p.text}`}>{s.name}</span>
          </motion.div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="space-y-4">
      <p className={`font-semibold text-sm ${p.title}`}>Qual era o pedido? ({count.current} itens)</p>
      <div className="grid grid-cols-2 gap-2">
        {SNACKS.map(s => (
          <button key={s.id} onClick={() => toggle(s.id)}
            className={`p-2 rounded-xl border-2 flex items-center gap-2 transition-all ${sel.has(s.id) ? p.sel : p.unsel}`}
          >
            <span className="text-xl">{s.emoji}</span>
            <div className="text-left">
              <p className={`text-xs font-semibold ${p.text}`}>{s.name}</p>
              {sel.has(s.id) && <span className="text-xs text-green-600 font-bold">✓</span>}
            </div>
          </button>
        ))}
      </div>
      <button onClick={confirm} disabled={sel.size === 0}
        className={`w-full h-11 rounded-xl font-bold transition-all ${p.btn} disabled:opacity-40`}
      >Confirmar ({sel.size}/{count.current})</button>
    </div>
  );
}

const CINEMA_L4_STORIES = [
  "Você planejou a tarde inteira para ir ao cinema. Comprou pipoca mentalmente, escolheu o assento... mas ao chegar, uma placa avisa: sessão cancelada por problema técnico.",
  "Você veio de longe especialmente para esta sessão. Chegou na hora certa, mas o cinema acabou de anunciar o cancelamento por falta de projecionista. Ainda há outras opções na programação.",
  "Você estava animadíssimo com o filme que escolheu. Mas no display da bilheteria aparece: CANCELADA. Respira fundo — tem outras opções.",
];

// L4 — sessão cancelada, imprevisto e adaptação
function CinemaL4({ theme, onFinish }: { theme: Theme; onFinish: (ok: boolean) => void }) {
  const p = pal(theme);
  const filmes = useRef([...FILMES].sort(() => Math.random() - 0.5).slice(0, 3));
  const cancellationStory = useRef(CINEMA_L4_STORIES[Math.floor(Math.random() * CINEMA_L4_STORIES.length)]);
  const [step, setStep] = useState<"choose" | "alert" | "adapt">("choose");
  const [first, setFirst] = useState<string | null>(null);
  const [second, setSecond] = useState<string | null>(null);
  const alertTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => { if (alertTimerRef.current) clearTimeout(alertTimerRef.current); };
  }, []);

  function choose(id: string) {
    setFirst(id); setStep("alert");
    alertTimerRef.current = setTimeout(() => setStep("adapt"), 2000);
  }

  function confirm() {
    onFinish(second !== null && second !== first);
  }

  const remaining = filmes.current.filter(f => f.id !== first);

  if (step === "choose") return (
    <div className="space-y-3">
      <div className={`rounded-xl p-4 ${p.story}`}>
        <p className={`text-xs font-bold uppercase tracking-wide mb-1 ${p.storyLabel}`}>📖 Situação</p>
        <p className={`text-sm ${p.storyBody}`}>{cancellationStory.current}</p>
      </div>
      <p className={`text-sm font-medium ${p.text}`}>Qual filme você quer assistir?</p>
      {filmes.current.map(f => (
        <button key={f.id} onClick={() => choose(f.id)}
          className={`w-full p-3 rounded-xl border-2 text-left transition-all ${p.unsel} ${p.cardHover}`}
        >
          <p className={`font-semibold text-sm ${p.text}`}>{f.title}</p>
          <p className={`text-xs ${p.muted}`}>{f.genre} · {f.duration}</p>
        </button>
      ))}
    </div>
  );

  if (step === "alert") return (
    <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
      className="text-center space-y-3 py-8"
    >
      <p className="text-5xl">⚠️</p>
      <p className={`font-bold text-lg ${p.title}`}>Sessão cancelada!</p>
      <p className={`text-sm ${p.muted}`}>Escolha outra opção.</p>
    </motion.div>
  );

  return (
    <div className="space-y-3">
      <div className="p-3 rounded-xl border-2 border-amber-400 bg-amber-50">
        <p className="text-sm font-semibold text-amber-800">⚠️ Sessão cancelada — escolha outra opção disponível</p>
      </div>
      {remaining.map(f => (
        <button key={f.id} onClick={() => setSecond(f.id)}
          className={`w-full p-3 rounded-xl border-2 text-left transition-all ${second === f.id ? p.sel : p.unsel}`}
        >
          <p className={`font-semibold text-sm ${p.text}`}>{f.title}</p>
          <p className={`text-xs ${p.muted}`}>{f.genre} · {f.duration}</p>
        </button>
      ))}
      <button onClick={confirm} disabled={!second}
        className={`w-full h-11 rounded-xl font-bold transition-all ${p.btn} disabled:opacity-40`}
      >Confirmar alternativa</button>
    </div>
  );
}

function CinemaMission({ level, theme, onFinish }: { level: number; theme: Theme; onFinish: (ok: boolean) => void }) {
  if (level >= 4) return <CinemaL4 theme={theme} onFinish={onFinish} />;
  if (level >= 3) return <CinemaL3 theme={theme} onFinish={onFinish} />;
  if (level >= 2) return <CinemaL2 theme={theme} onFinish={onFinish} />;
  return <CinemaL1 theme={theme} onFinish={onFinish} />;
}

// ─── RESTAURANTE ──────────────────────────────────────────────────────────────

interface Prato { id: string; name: string; emoji: string; cat: "entrada" | "prato" | "sobremesa" | "bebida"; price: number; }

const CARDAPIO: Prato[] = [
  { id: "salada", name: "Salada Caesar", emoji: "🥗", cat: "entrada", price: 22 },
  { id: "sopa", name: "Sopa do dia", emoji: "🍲", cat: "entrada", price: 18 },
  { id: "bruschetta", name: "Bruschetta", emoji: "🍞", cat: "entrada", price: 16 },
  { id: "file", name: "Filé ao molho", emoji: "🥩", cat: "prato", price: 48 },
  { id: "frango", name: "Frango grelhado", emoji: "🍗", cat: "prato", price: 38 },
  { id: "massa", name: "Massa ao pesto", emoji: "🍝", cat: "prato", price: 34 },
  { id: "risoto", name: "Risoto", emoji: "🍚", cat: "prato", price: 42 },
  { id: "mousse", name: "Mousse chocolate", emoji: "🍫", cat: "sobremesa", price: 18 },
  { id: "sorvete", name: "Sorvete", emoji: "🍨", cat: "sobremesa", price: 14 },
  { id: "pudim", name: "Pudim", emoji: "🍮", cat: "sobremesa", price: 16 },
  { id: "agua", name: "Água", emoji: "💧", cat: "bebida", price: 6 },
  { id: "suco", name: "Suco natural", emoji: "🧃", cat: "bebida", price: 14 },
  { id: "vinho", name: "Taça de vinho", emoji: "🍷", cat: "bebida", price: 22 },
];

const PEDIDOS_L1 = [
  { dishes: ["frango", "suco"], note: "Mesa 3 — casal com pressa, saem em 30 min. Pedem frango grelhado e suco natural." },
  { dishes: ["salada", "file", "agua"], note: "Mesa 1 — executivo em reunião de negócios. Quer salada Caesar, filé ao molho e água." },
  { dishes: ["massa", "sorvete"], note: "Mesa 5 — mãe com filho pequeno, sem pressa. Pedem massa ao pesto e sorvete." },
  { dishes: ["risoto", "vinho"], note: "Mesa 2 — casal em aniversário de namoro. Escolheram risoto e taça de vinho." },
  { dishes: ["sopa", "frango", "mousse"], note: "Mesa 4 — grupo de amigas. Pediram sopa do dia, frango grelhado e mousse de chocolate." },
];

// L1 — memorizar e reproduzir pedido
function RestauranteL1({ theme, onFinish }: { theme: Theme; onFinish: (ok: boolean) => void }) {
  const p = pal(theme);
  const pedido = useRef(PEDIDOS_L1[Math.floor(Math.random() * PEDIDOS_L1.length)]);
  const [mem, setMem] = useState(true);
  const [secs, setSecs] = useState(6);
  const [sel, setSel] = useState<Set<string>>(new Set());
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!mem) return;
    timerRef.current = setInterval(() => setSecs(s => s - 1), 1000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [mem]);

  useEffect(() => {
    if (!mem || secs > 0) return;
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
    setMem(false);
  }, [mem, secs]);

  function toggle(id: string) {
    setSel(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });
  }

  if (mem) return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <p className={`font-semibold text-sm ${p.title}`}>Memorize o pedido</p>
        <span className={`text-xs px-2 py-1 rounded-full ${p.badge}`}>{secs}s</span>
      </div>
      <div className={`rounded-xl p-4 ${p.card}`}>
        <p className={`text-xs font-bold uppercase tracking-wide mb-2 ${p.muted}`}>Pedido do cliente</p>
        <p className={`text-sm mb-3 ${p.text}`}>{pedido.current.note}</p>
        {pedido.current.dishes.map((id, i) => {
          const d = CARDAPIO.find(x => x.id === id)!;
          return (
            <motion.div key={id} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1 }} className="flex items-center gap-3 mt-2"
            >
              <span className="text-2xl">{d.emoji}</span>
              <span className={`text-sm font-medium ${p.text}`}>{d.name}</span>
            </motion.div>
          );
        })}
      </div>
    </div>
  );

  const allItems = CARDAPIO.filter(d => d.cat !== "bebida" || pedido.current.dishes.includes(d.id));

  return (
    <div className="space-y-4">
      <p className={`font-semibold text-sm ${p.title}`}>Selecione os itens do pedido</p>
      <div className="grid grid-cols-2 gap-2">
        {allItems.map(d => (
          <button key={d.id} onClick={() => toggle(d.id)}
            className={`p-2 rounded-xl border-2 flex items-center gap-2 transition-all ${sel.has(d.id) ? p.sel : p.unsel}`}
          >
            <span className="text-xl">{d.emoji}</span>
            <div className="text-left">
              <p className={`text-xs font-semibold ${p.text}`}>{d.name}</p>
              {sel.has(d.id) && <span className="text-xs text-green-600">✓</span>}
            </div>
          </button>
        ))}
      </div>
      <button
        onClick={() => {
          const ok = pedido.current.dishes.every(id => sel.has(id)) && sel.size === pedido.current.dishes.length;
          onFinish(ok);
        }}
        disabled={sel.size === 0}
        className={`w-full h-11 rounded-xl font-bold transition-all ${p.btn} disabled:opacity-40`}
      >Confirmar pedido</button>
    </div>
  );
}

// L2 — servir em sequência correta (toque na ordem certa)
const SEQUENCIAS = [
  { label: "Mesa 7", items: ["bruschetta", "frango", "sorvete"] },
  { label: "Mesa 2", items: ["sopa", "file", "mousse"] },
  { label: "Mesa 5", items: ["salada", "risoto", "pudim"] },
];

function RestauranteL2({ theme, onFinish }: { theme: Theme; onFinish: (ok: boolean) => void }) {
  const p = pal(theme);
  const seq = useRef(SEQUENCIAS[Math.floor(Math.random() * SEQUENCIAS.length)]);
  const [shuffledIds] = useState(() => [...seq.current.items].sort(() => Math.random() - 0.5));
  const [ordered, setOrdered] = useState<string[]>([]);

  function tap(id: string) {
    setOrdered(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  }

  const allOrdered = ordered.length === seq.current.items.length;

  function confirm() {
    onFinish(ordered.every((id, i) => id === seq.current.items[i]));
  }

  return (
    <div className="space-y-4">
      <div className={`p-3 rounded-xl ${p.card}`}>
        <p className={`text-xs font-bold uppercase tracking-wide ${p.muted}`}>{seq.current.label}</p>
        <p className={`text-sm font-medium mt-1 ${p.text}`}>
          Toque nos pratos <span className={p.accent}>na ordem de serviço</span>: entrada → prato → sobremesa
        </p>
      </div>

      {/* Sequência montada */}
      {ordered.length > 0 && (
        <div className={`flex flex-wrap gap-2 p-3 rounded-xl min-h-[48px] ${p.story}`}>
          {ordered.map((id, i) => {
            const dish = CARDAPIO.find(x => x.id === id)!;
            return (
              <button key={id} onClick={() => tap(id)}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border-2 text-sm transition-all ${p.sel}`}
              >
                <span className={`text-xs font-bold ${p.storyLabel}`}>{i + 1}.</span>
                <span>{dish.emoji}</span>
                <span className={`text-xs font-medium ${p.text}`}>{dish.name}</span>
              </button>
            );
          })}
        </div>
      )}

      {/* Pratos disponíveis */}
      <div className="space-y-2">
        {shuffledIds.map(id => {
          const dish = CARDAPIO.find(x => x.id === id)!;
          const pos = ordered.indexOf(id);
          const isOrdered = pos !== -1;
          return (
            <button key={id} onClick={() => tap(id)}
              className={`w-full flex items-center gap-3 p-3 rounded-xl border-2 text-left transition-all active:scale-95 ${isOrdered ? p.sel : p.unsel}`}
            >
              <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                isOrdered ? p.badge : (theme === "GAMIFIED" ? "bg-gray-700 text-gray-400" : "bg-slate-100 text-slate-400")
              }`}>
                {isOrdered ? pos + 1 : "?"}
              </span>
              <span className="text-2xl">{dish.emoji}</span>
              <div>
                <p className={`text-sm font-semibold ${p.text}`}>{dish.name}</p>
                <p className={`text-xs capitalize ${p.muted}`}>{dish.cat}</p>
              </div>
              {isOrdered && <span className="ml-auto text-green-500 text-sm">✓</span>}
            </button>
          );
        })}
      </div>

      <button onClick={confirm} disabled={!allOrdered}
        className={`w-full h-11 rounded-xl font-bold transition-all ${p.btn} disabled:opacity-40`}
      >
        {allOrdered ? "Servir nesta ordem ✓" : `Selecione os ${seq.current.items.length} pratos (${ordered.length}/${seq.current.items.length})`}
      </button>
    </div>
  );
}

// L3 — pedidos especiais com modificações
const ESPECIAIS_DATA = [
  { clientes: [
    { nome: "Cliente A", dish: "frango", especial: "sem sal" },
    { nome: "Cliente B", dish: "salada", especial: "molho à parte" },
    { nome: "Cliente C", dish: "massa", especial: "sem glúten" },
  ]},
  { clientes: [
    { nome: "Cliente A", dish: "file", especial: "bem passado" },
    { nome: "Cliente B", dish: "sopa", especial: "bem quente" },
    { nome: "Cliente C", dish: "sorvete", especial: "sem calda" },
  ]},
  { clientes: [
    { nome: "Cliente A", dish: "risoto", especial: "sem cebola" },
    { nome: "Cliente B", dish: "mousse", especial: "pouca porção" },
    { nome: "Cliente C", dish: "frango", especial: "ao ponto" },
  ]},
];

const OPCOES_ESPECIAIS = ["sem sal", "molho à parte", "sem glúten", "bem passado", "bem quente",
  "sem calda", "sem cebola", "pouca porção", "ao ponto", "extra queijo"];

function RestauranteL3({ theme, onFinish }: { theme: Theme; onFinish: (ok: boolean) => void }) {
  const p = pal(theme);
  const scenario = useRef(ESPECIAIS_DATA[Math.floor(Math.random() * ESPECIAIS_DATA.length)]);
  const [mem, setMem] = useState(true);
  const [secs, setSecs] = useState(8);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!mem) return;
    timerRef.current = setInterval(() => setSecs(s => s - 1), 1000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [mem]);

  useEffect(() => {
    if (!mem || secs > 0) return;
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
    setMem(false);
  }, [mem, secs]);

  if (mem) return (
    <div className="space-y-3">
      <div className="flex justify-between items-center">
        <p className={`font-semibold text-sm ${p.title}`}>Pedidos especiais da mesa</p>
        <span className={`text-xs px-2 py-1 rounded-full ${p.badge}`}>{secs}s</span>
      </div>
      {scenario.current.clientes.map((c, i) => {
        const d = CARDAPIO.find(x => x.id === c.dish)!;
        return (
          <motion.div key={c.nome} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.15 }} className={`p-3 rounded-xl border-2 ${p.unsel}`}
          >
            <p className={`text-xs font-bold ${p.muted}`}>{c.nome}</p>
            <p className={`text-sm font-medium ${p.text}`}>{d.emoji} {d.name}</p>
            <p className={`text-sm font-bold ${p.accent}`}>"{c.especial}"</p>
          </motion.div>
        );
      })}
    </div>
  );

  return (
    <div className="space-y-3">
      <p className={`font-semibold text-sm ${p.title}`}>Qual o pedido especial de cada cliente?</p>
      {scenario.current.clientes.map(c => {
        const d = CARDAPIO.find(x => x.id === c.dish)!;
        return (
          <div key={c.nome} className={`p-3 rounded-xl border-2 space-y-2 ${p.unsel}`}>
            <p className={`text-sm font-semibold ${p.text}`}>{c.nome} — {d.emoji} {d.name}</p>
            <div className="flex flex-wrap gap-1.5">
              {OPCOES_ESPECIAIS.map(op => (
                <button key={op}
                  onClick={() => setAnswers(prev => ({ ...prev, [c.nome]: op }))}
                  className={`px-2 py-1 rounded-lg text-xs border-2 transition-all ${answers[c.nome] === op ? p.sel : p.unsel} ${p.text}`}
                >{op}</button>
              ))}
            </div>
          </div>
        );
      })}
      <button
        onClick={() => onFinish(scenario.current.clientes.every(c => answers[c.nome] === c.especial))}
        disabled={scenario.current.clientes.some(c => !answers[c.nome])}
        className={`w-full h-11 rounded-xl font-bold transition-all ${p.btn} disabled:opacity-40`}
      >Confirmar pedidos</button>
    </div>
  );
}

function RestauranteMission({ level, theme, onFinish }: { level: number; theme: Theme; onFinish: (ok: boolean) => void }) {
  if (level >= 3) return <RestauranteL3 theme={theme} onFinish={onFinish} />;
  if (level >= 2) return <RestauranteL2 theme={theme} onFinish={onFinish} />;
  return <RestauranteL1 theme={theme} onFinish={onFinish} />;
}

// ─── FARMÁCIA ─────────────────────────────────────────────────────────────────

const FARM_DATA = [
  { title: "Retirar medicamento", steps: ["Pegar senha", "Aguardar chamada", "Apresentar receita", "Pagar", "Retirar medicamento"] },
  { title: "Compra simples", steps: ["Entrar na farmácia", "Buscar produto na prateleira", "Verificar validade", "Ir ao caixa", "Pagar"] },
  { title: "Medicamento controlado", steps: ["Verificar se tem receita", "Ir à farmácia", "Entregar receita ao farmacêutico", "Aguardar separação", "Receber orientação", "Pagar"] },
  { title: "Trocar medicamento", steps: ["Levar nota fiscal", "Explicar motivo da troca", "Aguardar verificação", "Escolher substituto", "Concluir troca"] },
];

function FarmaciaMission({ level, theme, onFinish }: { level: number; theme: Theme; onFinish: (ok: boolean) => void }) {
  const p = pal(theme);
  const idx = Math.min(level - 1, FARM_DATA.length - 1);
  const data = useRef(FARM_DATA[idx]);
  // Shuffled display order (never changes)
  const [displaySteps] = useState(() =>
    data.current.steps.map((label, i) => ({ id: String(i), label })).sort(() => Math.random() - 0.5)
  );
  // IDs in the order the user tapped them
  const [ordered, setOrdered] = useState<string[]>([]);

  function tap(id: string) {
    setOrdered((prev) => {
      if (prev.includes(id)) return prev.filter((x) => x !== id);
      return [...prev, id];
    });
  }

  function confirm() {
    const orderedLabels = ordered.map((id) => displaySteps.find((s) => s.id === id)!.label);
    onFinish(orderedLabels.every((label, i) => label === data.current.steps[i]));
  }

  const allSelected = ordered.length === displaySteps.length;

  return (
    <div className="space-y-4">
      <div className={`p-3 rounded-xl ${p.card}`}>
        <p className={`text-xs font-bold uppercase tracking-wide mb-1 ${p.muted}`}>Tarefa</p>
        <p className={`text-sm font-semibold ${p.text}`}>{data.current.title}</p>
        <p className={`text-xs mt-1 ${p.muted}`}>
          Toque nas etapas na ordem correta (1ª, 2ª, 3ª…).
        </p>
      </div>

      {/* Sequência montada pelo usuário */}
      {ordered.length > 0 && (
        <div className={`flex flex-wrap gap-1.5 p-2 rounded-xl ${p.story}`}>
          {ordered.map((id, i) => {
            const step = displaySteps.find((s) => s.id === id)!;
            return (
              <span
                key={id}
                className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium ${p.badge}`}
              >
                <span className="font-bold">{i + 1}.</span> {step.label}
              </span>
            );
          })}
        </div>
      )}

      {/* Etapas para tocar */}
      <div className="space-y-2">
        {displaySteps.map((step) => {
          const pos = ordered.indexOf(step.id);
          const isOrdered = pos !== -1;
          return (
            <button
              key={step.id}
              onClick={() => tap(step.id)}
              className={`w-full flex items-center gap-3 p-3 rounded-xl border-2 text-left transition-all active:scale-95 ${
                isOrdered ? p.sel : p.unsel
              }`}
            >
              <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                isOrdered ? p.badge : (theme === "GAMIFIED" ? "bg-gray-700 text-gray-400" : "bg-slate-100 text-slate-400")
              }`}>
                {isOrdered ? pos + 1 : "?"}
              </span>
              <span className={`text-sm font-medium flex-1 ${p.text}`}>{step.label}</span>
              {isOrdered && <span className="text-green-500 text-sm">✓</span>}
            </button>
          );
        })}
      </div>

      <button
        onClick={confirm}
        disabled={!allSelected}
        className={`w-full h-11 rounded-xl font-bold transition-all ${p.btn} disabled:opacity-40`}
      >
        {allSelected ? "Confirmar ordem" : `Selecione todas as etapas (${ordered.length}/${displaySteps.length})`}
      </button>
    </div>
  );
}

// ─── Hub da cidade ────────────────────────────────────────────────────────────

const ENV_CFG = {
  cinema:     { emoji: "🎬", name: "Cinema",     desc: "Ingressos, orçamento e imprevistos", color: "indigo" },
  restaurante:{ emoji: "🍽️", name: "Restaurante", desc: "Pedidos, sequências e especiais",    color: "rose"   },
  farmacia:   { emoji: "💊", name: "Farmácia",   desc: "Sequenciar etapas e organizar tarefas", color: "emerald" },
} as const;

// ─── Briefing da missão ───────────────────────────────────────────────────────

const BRIEFINGS: Record<EnvId, Record<number, { title: string; story: string; obj: string; rule: string }>> = {
  cinema: {
    1: { title: "Comprar Ingresso",      story: "Você tem um orçamento limitado e um compromisso no dia. Quem você é define o desconto disponível — e que horas precisa estar de volta.",                         obj: "Escolha o ingresso e horário dentro do orçamento.", rule: "Não ultrapasse o valor disponível." },
    2: { title: "Controle de Gastos",    story: "Sobrou uma grana na carteira. Dá pra curtir o cinema e ainda comer alguma coisa — se você planejar direito.",                                                    obj: "Combine ingresso e lanches sem estourar o orçamento.", rule: "O total não pode ultrapassar o limite." },
    3: { title: "Pedido da Bombonière",  story: "Seu amigo foi comprar os ingressos enquanto você ficou na fila da bombonière. Ele anotou o que cada um queria — agora é com você.",                              obj: "Memorize o pedido e reproduza-o na loja.", rule: "Você tem 8 segundos para memorizar." },
    4: { title: "Sessão Cancelada",      story: "Você planejou o dia todo para este filme. Ao chegar, a surpresa: sessão cancelada. Mas o cinema ainda está aberto — há outras opções.",                          obj: "A sessão escolhida foi cancelada. Encontre outra.", rule: "Adapte-se rápido ao imprevisto." },
  },
  restaurante: {
    1: { title: "Anotar Pedido",         story: "A casa está cheia e seu bloco de anotações acabou. Você vai ter que guardar o pedido na memória e reproduzi-lo depois.",                                         obj: "Memorize o pedido e selecione os itens corretos.", rule: "6 segundos para memorizar." },
    2: { title: "Ordem de Serviço",      story: "Os pratos saíram da cozinha todos embaralhados e precisam ser servidos na ordem certa. A mesa espera.",                                                          obj: "Arranje os pratos na sequência correta.", rule: "Entrada → Prato principal → Sobremesa." },
    3: { title: "Pedidos Especiais",     story: "Mesa VIP com clientes exigentes — cada um pediu uma modificação diferente no prato. Não misture os pedidos!",                                                    obj: "Memorize as modificações de cada cliente.", rule: "8 segundos · 3 pedidos com variações." },
  },
  farmacia: {
    1: { title: "Retirar Medicamento",    story: "Sua mãe ligou: o remédio dela acabou e ela não pode sair. Você foi buscar — mas precisa seguir os passos certos para retirar com receita.",                     obj: "Organize as etapas para retirar o medicamento.", rule: "Arraste na ordem correta." },
    2: { title: "Compra Simples",         story: "Você entrou na farmácia para pegar um produto rapidinho. Parece fácil, mas sem saber a sequência certa, pode perder tempo à toa.",                               obj: "Organize as etapas de uma compra na farmácia.", rule: "Arraste na ordem correta." },
    3: { title: "Medicamento Controlado", story: "O médico receitou um medicamento de uso controlado. Tem regra para tudo — e se você errar a ordem, vai embora sem o remédio.",                                 obj: "Siga o protocolo correto para medicamento com receita.", rule: "A ordem importa — cada etapa tem consequência." },
    4: { title: "Troca de Medicamento",   story: "Você comprou o remédio errado ontem. Voltou hoje para trocar — mas não basta simplesmente pedir: tem uma sequência de passos que a farmácia exige.",             obj: "Siga os passos corretos para realizar a troca.", rule: "Ordem errada = troca recusada." },
  },
};

function MissionBriefing({ envId, level, theme, missionNum, totalMissions, onStart }: {
  envId: EnvId; level: number; theme: Theme; missionNum: number; totalMissions: number; onStart: () => void;
}) {
  const p = pal(theme);
  const cfg = ENV_CFG[envId];
  const maxLevel = Object.keys(BRIEFINGS[envId]).length;
  const b = BRIEFINGS[envId][Math.min(level, maxLevel)];

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <span className="text-4xl">{cfg.emoji}</span>
        <div>
          <p className={`text-xs font-semibold uppercase tracking-wide ${p.muted}`}>
            {cfg.name} · Missão {missionNum}
          </p>
          <p className={`font-bold text-xl ${p.title}`}>{b.title}</p>
        </div>
      </div>

      <div className={`p-4 rounded-xl ${p.story}`}>
        <p className={`text-xs font-bold uppercase tracking-wide mb-1 ${p.storyLabel}`}>📖 Contexto</p>
        <p className={`text-sm ${p.storyBody}`}>{b.story}</p>
      </div>

      <div className={`p-4 rounded-xl space-y-2 ${p.card}`}>
        <p className={`text-sm font-semibold ${p.text}`}>🎯 {b.obj}</p>
        <p className={`text-xs ${p.muted}`}>📋 {b.rule}</p>
      </div>

      <button onClick={onStart} className={`w-full h-12 rounded-xl font-bold text-base transition-all ${p.btn}`}>
        Começar →
      </button>
    </div>
  );
}

// ─── Resultado ────────────────────────────────────────────────────────────────

function MissionResult({ correct, theme }: { correct: boolean; theme: Theme }) {
  const p = pal(theme);
  return (
    <motion.div initial={{ opacity: 0, scale: 0.92 }} animate={{ opacity: 1, scale: 1 }}
      className="text-center space-y-4 py-6"
    >
      <motion.p className="text-6xl" animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 0.4 }}>
        {correct ? "✅" : "❌"}
      </motion.p>
      <div>
        <p className={`font-bold text-xl ${p.title}`}>{correct ? "Missão concluída!" : "Não foi dessa vez"}</p>
        <p className={`text-sm mt-1 ${p.muted}`}>
          {correct ? "Ótimo trabalho! Voltando à cidade..." : "Continue tentando! Voltando à cidade..."}
        </p>
      </div>
    </motion.div>
  );
}

// ─── Componente principal ─────────────────────────────────────────────────────

const MAX_MISSIONS = 8;

// Teto real de níveis por ambiente — cinema tem 4, restaurante só 3, farmácia = nº de datasets.
const MAX_LVL: Record<EnvId, number> = { cinema: 4, restaurante: 3, farmacia: FARM_DATA.length };

function initialLevel(d: number) { return Math.min(Math.max(1, Math.ceil(d / 3)), 4); }

// Gera fila balanceada: cada ambiente aparece em rodízio, nunca repetindo o mesmo consecutivamente
function buildMissionQueue(count: number): EnvId[] {
  const envs: EnvId[] = ["cinema", "restaurante", "farmacia"];
  const queue: EnvId[] = [];
  while (queue.length < count) {
    const shuffled = [...envs].sort(() => Math.random() - 0.5);
    for (const e of shuffled) {
      if (queue.length < count) queue.push(e);
    }
  }
  return queue;
}

export function DesafioCidade({ difficulty, theme, onComplete }: {
  difficulty: number; theme: Theme; onComplete: (result: ExerciseResult) => void;
}) {
  const { begin, isTimeUp, elapsedSec, finish, progressPct } = useTimedProgress();
  const results = useRef<boolean[]>([]);
  const missionQueue = useRef<EnvId[]>(buildMissionQueue(80));
  useEffect(() => { begin(); }, [begin]);

  const [phase, setPhase] = useState<Phase>("briefing");
  const [currentEnv, setCurrentEnv] = useState<EnvId>(missionQueue.current[0]);
  const [done, setDone] = useState(0);
  const [missionKey, setMissionKey] = useState(0);
  const [lastOk, setLastOk] = useState(false);
  const resultTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => { if (resultTimerRef.current) clearTimeout(resultTimerRef.current); };
  }, []);

  const [levels, setLevels] = useState<Record<EnvId, number>>({
    cinema:      Math.min(initialLevel(difficulty), MAX_LVL.cinema),
    restaurante: Math.min(initialLevel(difficulty), MAX_LVL.restaurante),
    farmacia:    Math.min(initialLevel(difficulty), MAX_LVL.farmacia),
  });
  const [streaks, setStreaks] = useState<Record<EnvId, number>>({ cinema: 0, restaurante: 0, farmacia: 0 });
  const p = pal(theme);

  function finishMission(correct: boolean) {
    const e = currentEnv;
    setLastOk(correct);

    const newStreak = correct ? Math.max(streaks[e], 0) + 1 : Math.min(streaks[e], 0) - 1;
    const maxLvl = MAX_LVL[e];
    let delta = 0, reset = false;
    if (newStreak >= 2)  { delta =  1; reset = true; }
    if (newStreak <= -2) { delta = -1; reset = true; }

    setStreaks(prev => ({ ...prev, [e]: reset ? 0 : newStreak }));
    if (delta !== 0) {
      setLevels(prev => ({ ...prev, [e]: Math.min(Math.max(1, prev[e] + delta), maxLvl) }));
    }

    const next = done + 1;
    results.current = [...results.current, correct];
    setDone(next);
    setPhase("result");

    if (resultTimerRef.current) clearTimeout(resultTimerRef.current);
    const timeUp = isTimeUp();
    resultTimerRef.current = setTimeout(() => {
      if (timeUp) {
        finish();
        const correctCount = results.current.filter(Boolean).length;
        const accuracy = correctCount / Math.max(1, next);
        onComplete({
          exerciseId: "desafio-cidade",
          domain: "executive",
          score: calculateExerciseScore("desafio-cidade", accuracy, undefined, difficulty),
          accuracy,
          difficulty,
          duration: elapsedSec(),
          metadata: { missions: next, correct: correctCount },
        });
      } else {
        setCurrentEnv(missionQueue.current[next]);
        setMissionKey(k => k + 1);
        setPhase("briefing");
      }
    }, 2000);
  }

  const ProgressBar = () => (
    <ExerciseProgressBar progressPct={progressPct} theme={theme} />
  );

  return (
    <div className="min-h-screen overflow-y-auto p-4" style={palRootBg(theme)}>
      <div className="w-full max-w-md mx-auto p-5 my-4" style={palCardStyle(theme)}>
        <ProgressBar />

        <AnimatePresence mode="wait">
          {phase === "briefing" && (
            <motion.div key={`briefing-${missionKey}`} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <MissionBriefing
                envId={currentEnv}
                level={levels[currentEnv]}
                theme={theme}
                missionNum={done + 1}
                totalMissions={MAX_MISSIONS}
                onStart={() => setPhase("mission")}
              />
            </motion.div>
          )}

          {phase === "mission" && (
            <motion.div key={`mission-${missionKey}`} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <div className="flex items-center gap-2 mb-4">
                <span className="text-xl">{ENV_CFG[currentEnv].emoji}</span>
                <p className={`text-xs font-semibold uppercase tracking-wide ${p.muted}`}>
                  {ENV_CFG[currentEnv].name} · Nível {levels[currentEnv]}
                </p>
              </div>
              {currentEnv === "cinema"      && <CinemaMission     level={levels.cinema}      theme={theme} onFinish={finishMission} />}
              {currentEnv === "restaurante" && <RestauranteMission level={levels.restaurante} theme={theme} onFinish={finishMission} />}
              {currentEnv === "farmacia"    && <FarmaciaMission    level={levels.farmacia}    theme={theme} onFinish={finishMission} />}
            </motion.div>
          )}

          {phase === "result" && (
            <motion.div key={`result-${done}`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <MissionResult correct={lastOk} theme={theme} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
