// Limitador de tentativas de login (defesa contra força-bruta — finding SEC-001).
//
// Janela deslizante simples, EM MEMÓRIA (por instância do servidor). Conta apenas
// tentativas que FALHAM; um login bem-sucedido zera o contador daquele identificador.
// Ao exceder o limite dentro da janela, o identificador fica bloqueado por um tempo.
//
// Limitação honesta: por ser em memória, o estado é por instância serverless e se
// perde num cold start. Para o volume real (terapeuta solo, ~1-30 pacientes) e contra
// o ataque ingênuo de enumerar códigos/PINs isso já eleva muito o custo do ataque, sem
// exigir nenhuma infraestrutura extra. Um reforço futuro seria um store compartilhado
// (ex.: Redis/Upstash) para valer entre instâncias.

export interface LimitRule {
  /** Máximo de falhas dentro da janela antes de bloquear. */
  max: number;
  /** Duração da janela de contagem, em ms. */
  windowMs: number;
  /** Tempo de bloqueio após exceder o limite, em ms. */
  blockMs: number;
}

interface Bucket {
  count: number;
  resetAt: number;      // fim da janela de contagem atual
  blockedUntil: number; // 0 = não bloqueado
}

const store = new Map<string, Bucket>();

// Limpeza best-effort para o Map não crescer sem limite em execuções longas.
function sweep(now: number): void {
  if (store.size < 5000) return;
  for (const [k, b] of store) {
    if (b.resetAt < now && b.blockedUntil < now) store.delete(k);
  }
}

/** true se o identificador PODE tentar agora (não está bloqueado). Não conta a tentativa. */
export function isAllowed(key: string, now: number = Date.now()): boolean {
  const b = store.get(key);
  if (!b) return true;
  return b.blockedUntil <= now;
}

/** Registra uma tentativa que FALHOU; pode transicionar para bloqueado. */
export function registerFailure(key: string, rule: LimitRule, now: number = Date.now()): void {
  sweep(now);
  let b = store.get(key);
  if (!b || b.resetAt < now) {
    b = { count: 0, resetAt: now + rule.windowMs, blockedUntil: 0 };
    store.set(key, b);
  }
  b.count += 1;
  if (b.count >= rule.max) {
    b.blockedUntil = now + rule.blockMs;
  }
}

/** Zera o contador de um identificador (chamar após sucesso). */
export function clearFailures(key: string): void {
  store.delete(key);
}

/** Apenas para testes: limpa todo o estado. */
export function _resetAll(): void {
  store.clear();
}

// Regras padrão. Toleram o paciente errar o PIN algumas vezes, mas cortam a
// enumeração automatizada. Bloqueio temporário (não permanente).
export const IDENTIFIER_RULE: LimitRule = { max: 8, windowMs: 5 * 60_000, blockMs: 10 * 60_000 };
export const IP_RULE: LimitRule = { max: 30, windowMs: 5 * 60_000, blockMs: 10 * 60_000 };

/** Extrai o IP do cliente do request do NextAuth (best-effort). */
export function clientIp(req: { headers?: Record<string, string | string[] | undefined> } | undefined): string | null {
  const xff = req?.headers?.["x-forwarded-for"];
  const raw = Array.isArray(xff) ? xff[0] : xff;
  if (typeof raw === "string" && raw.length > 0) return raw.split(",")[0].trim();
  return null;
}
