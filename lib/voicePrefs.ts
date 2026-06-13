"use client";

// Preferência de voz (Web Speech API) compartilhada pelos exercícios auditivos.
// Permite à terapeuta escolher entre vozes femininas e masculinas em pt-BR
// disponíveis no aparelho; a escolha fica salva no navegador (localStorage).

const KEY = "np-voz-uri";

// Heurística de gênero por nome (Web Speech não expõe gênero de forma confiável).
const FEM = ["luciana", "francisca", "maria", "fernanda", "camila", "vitória", "vitoria",
  "helena", "raquel", "joana", "catarina", "google português do brasil", "google portugues do brasil",
  "microsoft maria", "microsoft francisca", "bianca", "giovanna"];
const MASC = ["felipe", "daniel", "ricardo", "joão", "joao", "antônio", "antonio",
  "heitor", "thiago", "microsoft daniel", "microsoft antonio", "eddy", "reed"];

export type VoiceGender = "fem" | "masc" | "?";

export function listPtVoices(): SpeechSynthesisVoice[] {
  if (typeof window === "undefined" || !window.speechSynthesis) return [];
  const all = window.speechSynthesis.getVoices();
  const pt = all.filter(v => /^pt/i.test(v.lang) || /portugu/i.test(v.name));
  // pt-BR primeiro, depois demais pt
  return pt.sort((a, b) => (/(pt[-_]?br)/i.test(b.lang) ? 1 : 0) - (/(pt[-_]?br)/i.test(a.lang) ? 1 : 0));
}

export function genderOf(v: SpeechSynthesisVoice): VoiceGender {
  const n = v.name.toLowerCase();
  if (FEM.some(x => n.includes(x))) return "fem";
  if (MASC.some(x => n.includes(x))) return "masc";
  return "?";
}

// Ordena por "naturalidade" provável: não-local (nuvem) e nomes premium primeiro.
function naturalScore(v: SpeechSynthesisVoice): number {
  let s = 0;
  if (!v.localService) s += 3;                          // vozes de nuvem soam melhor
  if (/google/i.test(v.name)) s += 2;
  if (/(premium|enhanced|natural|neural|siri)/i.test(v.name)) s += 4;
  if (/(pt[-_]?br)/i.test(v.lang)) s += 1;
  return s;
}

export function getPreferredVoiceURI(): string {
  try { return localStorage.getItem(KEY) || ""; } catch { return ""; }
}
export function setPreferredVoiceURI(uri: string): void {
  try { localStorage.setItem(KEY, uri); } catch { /* */ }
}

export function resolveVoice(): SpeechSynthesisVoice | null {
  const voices = listPtVoices();
  if (!voices.length) return null;
  const pref = getPreferredVoiceURI();
  if (pref) { const v = voices.find(x => x.voiceURI === pref); if (v) return v; }
  // padrão: melhor voz feminina pela naturalidade
  const fem = voices.filter(v => genderOf(v) === "fem").sort((a, b) => naturalScore(b) - naturalScore(a));
  if (fem.length) return fem[0];
  return [...voices].sort((a, b) => naturalScore(b) - naturalScore(a))[0];
}

// Garante que as vozes estejam carregadas (algumas plataformas carregam async).
export function ensureVoices(cb: () => void): void {
  if (typeof window === "undefined" || !window.speechSynthesis) { cb(); return; }
  if (window.speechSynthesis.getVoices().length) { cb(); return; }
  let done = false;
  const go = () => { if (done) return; done = true; cb(); };
  window.speechSynthesis.addEventListener("voiceschanged", go, { once: true });
  setTimeout(go, 600);
}

// Fala um texto com a voz preferida (sempre cancela o anterior).
export function speakText(text: string, opts?: { rate?: number; pitch?: number; onEnd?: () => void }): void {
  if (typeof window === "undefined" || !window.speechSynthesis) { opts?.onEnd?.(); return; }
  const synth = window.speechSynthesis;
  const run = () => {
    synth.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = "pt-BR"; u.rate = opts?.rate ?? 0.95; u.pitch = opts?.pitch ?? 1.0; u.volume = 1;
    const v = resolveVoice(); if (v) u.voice = v;
    u.onend = () => opts?.onEnd?.();
    u.onerror = () => opts?.onEnd?.();
    synth.speak(u);
  };
  ensureVoices(run);
}
