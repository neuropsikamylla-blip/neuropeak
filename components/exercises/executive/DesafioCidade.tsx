"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence, Reorder } from "framer-motion";
import { calculateExerciseScore } from "@/lib/scoring";
import { useExerciseProgress } from "@/components/exercises/ExerciseWrapper";
import type { ExerciseResult, Theme } from "@/types";

// ─── Tipos ────────────────────────────────────────────────────────────────────

type EnvId = "cinema" | "restaurante" | "farmacia";
type Phase = "hub" | "briefing" | "mission" | "result";

// ─── Paleta por tema ──────────────────────────────────────────────────────────

function pal(theme: Theme) {
  if (theme === "GAMIFIED") return {
    bg: "bg-gray-950",
    wrap: "bg-gray-800 border border-gray-700",
    card: "bg-gray-800 border border-gray-700",
    cardHover: "hover:border-cyan-500",
    title: "text-cyan-400",
    sub: "text-gray-400",
    text: "text-gray-100",
    muted: "text-gray-400",
    accent: "text-cyan-400",
    badge: "bg-cyan-900 text-cyan-300",
    btn: "bg-cyan-600 hover:bg-cyan-700 text-white",
    sel: "border-cyan-400 bg-cyan-900/40",
    unsel: "border-gray-600 bg-gray-700 hover:border-gray-500",
    correct: "border-green-500 bg-green-900/30",
    wrong: "border-red-500 bg-red-900/30",
    bar: "bg-gray-700",
    draggable: "border-gray-600 bg-gray-750",
  };
  if (theme === "COLORFUL") return {
    bg: "bg-gradient-to-br from-violet-50 via-white to-pink-50",
    wrap: "bg-white border-2 border-violet-200 shadow-xl",
    card: "bg-white border-2 border-violet-200 shadow-sm",
    cardHover: "hover:border-violet-400 hover:shadow-md",
    title: "text-violet-700",
    sub: "text-violet-500",
    text: "text-gray-800",
    muted: "text-gray-500",
    accent: "text-violet-600",
    badge: "bg-violet-100 text-violet-700",
    btn: "bg-gradient-to-r from-violet-500 to-pink-500 text-white",
    sel: "border-violet-500 bg-violet-50",
    unsel: "border-violet-200 bg-white hover:border-violet-400",
    correct: "border-green-400 bg-green-50",
    wrong: "border-red-400 bg-red-50",
    bar: "bg-violet-100",
    draggable: "border-violet-200 bg-white",
  };
  return {
    bg: "bg-gradient-to-br from-slate-50 via-white to-indigo-50/30",
    wrap: "bg-white border border-slate-200 shadow-md",
    card: "bg-white border border-slate-200 shadow-sm",
    cardHover: "hover:border-indigo-300 hover:shadow-md",
    title: "text-slate-800",
    sub: "text-slate-500",
    text: "text-gray-800",
    muted: "text-slate-500",
    accent: "text-indigo-600",
    badge: "bg-indigo-50 text-indigo-600",
    btn: "bg-indigo-600 hover:bg-indigo-700 text-white",
    sel: "border-indigo-400 bg-indigo-50",
    unsel: "border-slate-200 bg-white hover:border-slate-300",
    correct: "border-green-400 bg-green-50",
    wrong: "border-red-300 bg-red-50",
    bar: "bg-slate-200",
    draggable: "border-slate-200 bg-white",
  };
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
  { id: "meia", label: "Meia-entrada", price: 14, note: "Estudante / Idoso" },
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

// L1 — selecionar ingresso dentro do orçamento
function CinemaL1({ theme, onFinish }: { theme: Theme; onFinish: (ok: boolean) => void }) {
  const p = pal(theme);
  const budget = useRef(22 + Math.floor(Math.random() * 16));
  const filme = useRef(FILMES[Math.floor(Math.random() * FILMES.length)]);
  const horarios = useRef([...HORARIOS].sort(() => Math.random() - 0.5).slice(0, 3));
  const [ticket, setTicket] = useState<string | null>(null);
  const [hora, setHora] = useState<string | null>(null);
  const total = INGRESSOS.find(t => t.id === ticket)?.price ?? 0;

  return (
    <div className="space-y-4">
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
          {horarios.current.map(h => (
            <button key={h} onClick={() => setHora(h)}
              className={`py-2.5 rounded-xl border-2 text-sm font-bold transition-all ${hora === h ? p.sel : p.unsel} ${p.text}`}
            >{h}</button>
          ))}
        </div>
      </div>

      {ticket && (
        <p className={`text-sm text-center font-medium ${total > budget.current ? "text-red-500" : "text-green-600"}`}>
          Total: R$ {total} {total > budget.current ? "⚠️ Acima do orçamento" : "✓ Dentro do orçamento"}
        </p>
      )}

      <button
        onClick={() => onFinish(ticket !== null && hora !== null && total <= budget.current)}
        disabled={!ticket || !hora}
        className={`w-full h-11 rounded-xl font-bold transition-all ${p.btn} disabled:opacity-40`}
      >Comprar ingresso</button>
    </div>
  );
}

// L2 — ingresso + lanches com orçamento apertado
function CinemaL2({ theme, onFinish }: { theme: Theme; onFinish: (ok: boolean) => void }) {
  const p = pal(theme);
  const budget = useRef(44 + Math.floor(Math.random() * 16));
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

      <button
        onClick={() => onFinish(ticket !== null && !over)}
        disabled={!ticket || over}
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

  useEffect(() => {
    if (!memorizing) return;
    const t = setInterval(() => {
      setSecs(p => { if (p <= 1) { clearInterval(t); setMemorizing(false); return 0; } return p - 1; });
    }, 1000);
    return () => clearInterval(t);
  }, [memorizing]);

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

// L4 — sessão cancelada, imprevisto e adaptação
function CinemaL4({ theme, onFinish }: { theme: Theme; onFinish: (ok: boolean) => void }) {
  const p = pal(theme);
  const filmes = useRef([...FILMES].sort(() => Math.random() - 0.5).slice(0, 3));
  const budget = useRef(28 + Math.floor(Math.random() * 14));
  const [step, setStep] = useState<"choose" | "alert" | "adapt">("choose");
  const [first, setFirst] = useState<string | null>(null);
  const [second, setSecond] = useState<string | null>(null);

  function choose(id: string) {
    setFirst(id); setStep("alert");
    setTimeout(() => setStep("adapt"), 2000);
  }

  function confirm() {
    onFinish(second !== null && second !== first);
  }

  const remaining = filmes.current.filter(f => f.id !== first);

  if (step === "choose") return (
    <div className="space-y-3">
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
        <p className="text-sm font-semibold text-amber-800">⚠️ Sessão cancelada — escolha outra opção</p>
        <p className="text-xs text-amber-700 mt-0.5">Orçamento: R$ {budget.current}</p>
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
  { dishes: ["frango", "suco"], note: "Mesa 3 quer frango grelhado e suco natural." },
  { dishes: ["salada", "file", "agua"], note: "Mesa 1 quer salada Caesar, filé ao molho e água." },
  { dishes: ["massa", "sorvete"], note: "Mesa 5 quer massa ao pesto e sorvete." },
  { dishes: ["risoto", "vinho"], note: "Mesa 2 quer risoto e taça de vinho." },
  { dishes: ["sopa", "frango", "mousse"], note: "Mesa 4 quer sopa, frango grelhado e mousse." },
];

// L1 — memorizar e reproduzir pedido
function RestauranteL1({ theme, onFinish }: { theme: Theme; onFinish: (ok: boolean) => void }) {
  const p = pal(theme);
  const pedido = useRef(PEDIDOS_L1[Math.floor(Math.random() * PEDIDOS_L1.length)]);
  const [mem, setMem] = useState(true);
  const [secs, setSecs] = useState(6);
  const [sel, setSel] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!mem) return;
    const t = setInterval(() => {
      setSecs(p => { if (p <= 1) { clearInterval(t); setMem(false); return 0; } return p - 1; });
    }, 1000);
    return () => clearInterval(t);
  }, [mem]);

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

// L2 — servir em sequência correta (arrastar)
const SEQUENCIAS = [
  { label: "Mesa 7", items: ["bruschetta", "frango", "sorvete"] },
  { label: "Mesa 2", items: ["sopa", "file", "mousse"] },
  { label: "Mesa 5", items: ["salada", "risoto", "pudim"] },
];

function RestauranteL2({ theme, onFinish }: { theme: Theme; onFinish: (ok: boolean) => void }) {
  const p = pal(theme);
  const seq = useRef(SEQUENCIAS[Math.floor(Math.random() * SEQUENCIAS.length)]);
  const [items, setItems] = useState(() =>
    [...seq.current.items].sort(() => Math.random() - 0.5).map(id => CARDAPIO.find(x => x.id === id)!)
  );

  function confirm() {
    onFinish(items.every((item, i) => item.id === seq.current.items[i]));
  }

  return (
    <div className="space-y-4">
      <div className={`p-3 rounded-xl ${p.card}`}>
        <p className={`text-xs font-bold uppercase tracking-wide ${p.muted}`}>{seq.current.label}</p>
        <p className={`text-sm font-medium mt-1 ${p.text}`}>
          Arraste os pratos na ordem de serviço: <span className={p.accent}>entrada → prato → sobremesa</span>
        </p>
      </div>

      <Reorder.Group axis="y" values={items} onReorder={setItems} className="space-y-2">
        {items.map((dish, idx) => (
          <Reorder.Item key={dish.id} value={dish}
            className={`flex items-center gap-3 p-3 rounded-xl border-2 cursor-grab active:cursor-grabbing transition-all select-none ${p.draggable}`}
          >
            <span className={`text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center shrink-0 ${p.badge}`}>
              {idx + 1}
            </span>
            <span className="text-2xl">{dish.emoji}</span>
            <div>
              <p className={`text-sm font-semibold ${p.text}`}>{dish.name}</p>
              <p className={`text-xs capitalize ${p.muted}`}>{dish.cat}</p>
            </div>
            <span className={`ml-auto text-base ${p.muted}`}>⠿</span>
          </Reorder.Item>
        ))}
      </Reorder.Group>

      <button onClick={confirm} className={`w-full h-11 rounded-xl font-bold transition-all ${p.btn}`}>
        Servir nesta ordem
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

  useEffect(() => {
    if (!mem) return;
    const t = setInterval(() => {
      setSecs(p => { if (p <= 1) { clearInterval(t); setMem(false); return 0; } return p - 1; });
    }, 1000);
    return () => clearInterval(t);
  }, [mem]);

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
  const [steps, setSteps] = useState(() =>
    data.current.steps.map((label, i) => ({ id: String(i), label })).sort(() => Math.random() - 0.5)
  );

  return (
    <div className="space-y-4">
      <div className={`p-3 rounded-xl ${p.card}`}>
        <p className={`text-xs font-bold uppercase tracking-wide mb-1 ${p.muted}`}>Tarefa</p>
        <p className={`text-sm font-semibold ${p.text}`}>{data.current.title}</p>
        <p className={`text-xs mt-1 ${p.muted}`}>Arraste as etapas na ordem correta.</p>
      </div>

      <Reorder.Group axis="y" values={steps} onReorder={setSteps} className="space-y-2">
        {steps.map((step, idx) => (
          <Reorder.Item key={step.id} value={step}
            className={`flex items-center gap-3 p-3 rounded-xl border-2 cursor-grab active:cursor-grabbing select-none transition-all ${p.draggable}`}
          >
            <span className={`text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center shrink-0 ${p.badge}`}>
              {idx + 1}
            </span>
            <span className={`text-sm font-medium flex-1 ${p.text}`}>{step.label}</span>
            <span className={`text-base ${p.muted}`}>⠿</span>
          </Reorder.Item>
        ))}
      </Reorder.Group>

      <button
        onClick={() => onFinish(steps.every((s, i) => s.label === data.current.steps[i]))}
        className={`w-full h-11 rounded-xl font-bold transition-all ${p.btn}`}
      >Confirmar ordem</button>
    </div>
  );
}

// ─── Hub da cidade ────────────────────────────────────────────────────────────

const ENV_CFG = {
  cinema:     { emoji: "🎬", name: "Cinema",     desc: "Ingressos, orçamento e imprevistos", color: "indigo" },
  restaurante:{ emoji: "🍽️", name: "Restaurante", desc: "Pedidos, sequências e especiais",    color: "rose"   },
  farmacia:   { emoji: "💊", name: "Farmácia",   desc: "Sequenciar etapas e organizar tarefas", color: "emerald" },
} as const;

function envBorderClass(color: string, theme: Theme) {
  if (theme === "GAMIFIED") {
    return color === "indigo" ? "border-cyan-500/40 hover:border-cyan-400"
      : color === "rose" ? "border-pink-500/40 hover:border-pink-400"
      : "border-emerald-500/40 hover:border-emerald-400";
  }
  return color === "indigo" ? "border-indigo-200 hover:border-indigo-400"
    : color === "rose" ? "border-rose-200 hover:border-rose-400"
    : "border-emerald-200 hover:border-emerald-400";
}

function envAccentClass(color: string, theme: Theme) {
  if (theme === "GAMIFIED") {
    return color === "indigo" ? "text-cyan-400" : color === "rose" ? "text-pink-400" : "text-emerald-400";
  }
  return color === "indigo" ? "text-indigo-600" : color === "rose" ? "text-rose-600" : "text-emerald-600";
}

function CityHub({ theme, levels, done, max, onSelect }: {
  theme: Theme;
  levels: Record<EnvId, number>;
  done: number;
  max: number;
  onSelect: (env: EnvId) => void;
}) {
  const p = pal(theme);

  return (
    <div className="space-y-5">
      <div className="text-center">
        {theme === "COLORFUL" && <p className="text-4xl mb-1">🏙️</p>}
        <h2 className={`font-bold text-lg ${p.title}`}>
          {theme === "GAMIFIED" ? "Selecione a missão" : theme === "COLORFUL" ? "Bem-vindo à Cidade! 🌟" : "Escolha um ambiente"}
        </h2>
        <p className={`text-xs mt-1 ${p.muted}`}>Missão {done + 1} de {max}</p>
      </div>

      <div className="space-y-3">
        {(Object.entries(ENV_CFG) as [EnvId, typeof ENV_CFG[EnvId]][]).map(([envId, cfg]) => (
          <button key={envId} onClick={() => onSelect(envId)}
            className={`w-full p-4 rounded-2xl border-2 text-left transition-all ${p.card} ${envBorderClass(cfg.color, theme)}`}
          >
            <div className="flex items-center gap-3">
              <span className="text-3xl">{cfg.emoji}</span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <p className={`font-bold text-base ${p.title}`}>{cfg.name}</p>
                  <span className={`text-xs font-semibold shrink-0 ${envAccentClass(cfg.color, theme)}`}>
                    Nível {levels[envId]}
                  </span>
                </div>
                <p className={`text-xs mt-0.5 ${p.muted}`}>{cfg.desc}</p>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

// ─── Briefing da missão ───────────────────────────────────────────────────────

const BRIEFINGS: Record<EnvId, Record<number, { title: string; obj: string; rule: string }>> = {
  cinema: {
    1: { title: "Comprar Ingresso",      obj: "Escolha o ingresso e horário dentro do orçamento.",       rule: "Não ultrapasse o valor disponível." },
    2: { title: "Controle de Gastos",    obj: "Combine ingresso e lanches sem estourar o orçamento.",    rule: "O total não pode ultrapassar o limite." },
    3: { title: "Pedido da Bombonière",  obj: "Memorize o pedido e reproduza-o na loja.",                rule: "Você tem 8 segundos para memorizar." },
    4: { title: "Sessão Cancelada",      obj: "A sessão escolhida foi cancelada. Encontre outra.",       rule: "Adapte-se rápido ao imprevisto." },
  },
  restaurante: {
    1: { title: "Anotar Pedido",         obj: "Memorize o pedido e selecione os itens corretos.",        rule: "6 segundos para memorizar." },
    2: { title: "Ordem de Serviço",      obj: "Arranje os pratos na sequência correta.",                 rule: "Entrada → Prato principal → Sobremesa." },
    3: { title: "Pedidos Especiais",     obj: "Memorize as modificações de cada cliente.",               rule: "8 segundos · 3 pedidos com variações." },
  },
  farmacia: {
    1: { title: "Retirar Medicamento",   obj: "Organize as etapas para retirar o medicamento.",          rule: "Arraste na ordem correta." },
    2: { title: "Compra Simples",        obj: "Organize as etapas de uma compra na farmácia.",           rule: "Arraste na ordem correta." },
    3: { title: "Medicamento Controlado", obj: "Siga o protocolo correto para medicamento com receita.", rule: "A ordem importa — cada etapa tem consequência." },
  },
};

function MissionBriefing({ envId, level, theme, onStart }: {
  envId: EnvId; level: number; theme: Theme; onStart: () => void;
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
          <p className={`text-xs font-semibold uppercase tracking-wide ${p.muted}`}>{cfg.name} · Nível {level}</p>
          <p className={`font-bold text-xl ${p.title}`}>{b.title}</p>
        </div>
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

function initialLevel(d: number) { return Math.min(Math.max(1, Math.ceil(d / 3)), 4); }

export function DesafioCidade({ difficulty, theme, onComplete }: {
  difficulty: number; theme: Theme; onComplete: (result: ExerciseResult) => void;
}) {
  const reportProgress = useExerciseProgress();
  const startTime = useRef(Date.now());
  const results = useRef<boolean[]>([]);

  const [phase, setPhase] = useState<Phase>("hub");
  const [env, setEnv] = useState<EnvId | null>(null);
  const [lastOk, setLastOk] = useState(false);
  const [done, setDone] = useState(0);
  const [missionKey, setMissionKey] = useState(0);

  const [levels, setLevels] = useState<Record<EnvId, number>>({
    cinema:      initialLevel(difficulty),
    restaurante: initialLevel(difficulty),
    farmacia:    initialLevel(difficulty),
  });
  const [streaks, setStreaks] = useState<Record<EnvId, number>>({ cinema: 0, restaurante: 0, farmacia: 0 });
  const p = pal(theme);

  function selectEnv(envId: EnvId) {
    setEnv(envId);
    setMissionKey(k => k + 1);
    setPhase("briefing");
  }

  function finishMission(correct: boolean) {
    const e = env!;
    setLastOk(correct);

    const newStreak = correct ? Math.max(streaks[e], 0) + 1 : Math.min(streaks[e], 0) - 1;
    const maxLvl = e === "farmacia" ? FARM_DATA.length : e === "restaurante" ? 3 : 4;
    let delta = 0;
    let reset = false;
    if (newStreak >= 2)  { delta =  1; reset = true; }
    if (newStreak <= -2) { delta = -1; reset = true; }

    setStreaks(prev => ({ ...prev, [e]: reset ? 0 : newStreak }));
    if (delta !== 0) {
      setLevels(prev => ({ ...prev, [e]: Math.min(Math.max(1, prev[e] + delta), maxLvl) }));
    }

    const next = done + 1;
    results.current = [...results.current, correct];
    setDone(next);
    reportProgress(Math.round((next / MAX_MISSIONS) * 100));
    setPhase("result");

    setTimeout(() => {
      if (next >= MAX_MISSIONS) {
        const correctCount = results.current.filter(Boolean).length;
        const accuracy = correctCount / MAX_MISSIONS;
        onComplete({
          exerciseId: "desafio-cidade",
          domain: "executive",
          score: calculateExerciseScore("desafio-cidade", accuracy, undefined, difficulty),
          accuracy,
          difficulty,
          duration: Math.round((Date.now() - startTime.current) / 1000),
          metadata: { missions: MAX_MISSIONS, correct: correctCount },
        });
      } else {
        setEnv(null);
        setPhase("hub");
      }
    }, 2000);
  }

  // Barra de progresso das missões
  const ProgressBar = () => (
    <div className="flex gap-0.5 mb-4">
      {Array.from({ length: MAX_MISSIONS }).map((_, i) => (
        <div key={i} className={`h-1.5 flex-1 rounded-full transition-colors ${
          i < results.current.length
            ? results.current[i] ? "bg-green-500" : "bg-red-400"
            : i === done ? "bg-blue-400 animate-pulse" : p.bar
        }`} />
      ))}
    </div>
  );

  return (
    <div className={`min-h-screen flex flex-col items-center justify-center p-4 ${p.bg}`}>
      <div className={`w-full max-w-md rounded-2xl p-5 ${p.wrap}`}>
        <ProgressBar />

        <AnimatePresence mode="wait">
          {phase === "hub" && (
            <motion.div key="hub" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <CityHub theme={theme} levels={levels} done={done} max={MAX_MISSIONS} onSelect={selectEnv} />
            </motion.div>
          )}

          {phase === "briefing" && env && (
            <motion.div key="briefing" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <MissionBriefing envId={env} level={levels[env]} theme={theme} onStart={() => setPhase("mission")} />
            </motion.div>
          )}

          {phase === "mission" && env && (
            <motion.div key={`mission-${missionKey}`} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <div className="flex items-center gap-2 mb-4">
                <span className="text-xl">{ENV_CFG[env].emoji}</span>
                <p className={`text-xs font-semibold uppercase tracking-wide ${p.muted}`}>
                  {ENV_CFG[env].name} · Nível {levels[env]}
                </p>
              </div>
              {env === "cinema"      && <CinemaMission     level={levels.cinema}      theme={theme} onFinish={finishMission} />}
              {env === "restaurante" && <RestauranteMission level={levels.restaurante} theme={theme} onFinish={finishMission} />}
              {env === "farmacia"    && <FarmaciaMission    level={levels.farmacia}    theme={theme} onFinish={finishMission} />}
            </motion.div>
          )}

          {phase === "result" && (
            <motion.div key="result" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <MissionResult correct={lastOk} theme={theme} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
