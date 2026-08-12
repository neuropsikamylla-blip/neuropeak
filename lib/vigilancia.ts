// ─────────────────────────────────────────────────────────────────────────────
// Vigilância — motor PURO (adaptativo + espacial). Reestruturação (spec da
// Kamylla, 01/ago/2026): 8 pipas (7 distratoras + 1 alvo), resposta por REGIÃO
// espacial, exposição adaptativa por degraus, blocos de 12, sem pausa/reinício.
//
// Este módulo NÃO conhece as imagens — só a lógica. Os pares de pipas e fundos
// vêm dos manifestos (montados quando os assets forem fornecidos). Testável.
// NÃO é avaliação/diagnóstico — mede só o desempenho na atividade.
// ─────────────────────────────────────────────────────────────────────────────

// ── §17 Escada de exposição (ms) — do mais lento (fácil) ao mais rápido ──────
export const EXPO_STEPS = [1800, 1600, 1400, 1250, 1100, 960, 840, 730, 630, 540, 460, 390, 330, 280, 240];
export const DEGRAU_CONFORTAVEL = 4;
export const clampDegrau = (d: number) => Math.max(0, Math.min(EXPO_STEPS.length - 1, d));
export const tempoDoDegrau = (d: number) => EXPO_STEPS[clampDegrau(d)];

// ── §14 As 8 posições, em ordem de anel (topo → horário) ─────────────────────
export type PosNome =
  | "superior" | "superior_direita" | "direita" | "inferior_direita"
  | "inferior" | "inferior_esquerda" | "esquerda" | "superior_esquerda";
export const POSICOES: PosNome[] = [
  "superior", "superior_direita", "direita", "inferior_direita",
  "inferior", "inferior_esquerda", "esquerda", "superior_esquerda",
];
// ângulo em graus (0 = direita; sentido horário porque y cresce para baixo)
const ANGULO: Record<PosNome, number> = {
  direita: 0, inferior_direita: 45, inferior: 90, inferior_esquerda: 135,
  esquerda: 180, superior_esquerda: 225, superior: 270, superior_direita: 315,
};
export const adjacentes = (a: number, b: number) => {
  const d = Math.abs(a - b) % 8;
  return d === 1 || d === 7; // vizinhas no anel de 8
};

// ── §15 Arranjos (raio como fração da menor dimensão da área útil) ───────────
export type Arranjo = "compacto" | "expandido" | "irregular";
export const RAIO_FRAC: Record<Arranjo, number> = { compacto: 0.22, expandido: 0.35, irregular: 0.35 };

export interface Ponto { x: number; y: number }
// Centros das 8 posições numa área W×H. `jitter` (irregular) só desloca levemente,
// preservando a região de cada posição (spec: "sem posicionamento aleatório").
export function gerarCentros(arranjo: Arranjo, w: number, h: number, jitter?: (i: number) => { dr: number; da: number }): Ponto[] {
  const cx = w / 2, cy = h / 2;
  const base = Math.min(w, h) * RAIO_FRAC[arranjo];
  return POSICOES.map((nome, i) => {
    const j = arranjo === "irregular" && jitter ? jitter(i) : { dr: 0, da: 0 };
    const r = base * (1 + j.dr);
    const ang = ((ANGULO[nome] + j.da) * Math.PI) / 180;
    return { x: cx + r * Math.cos(ang), y: cy + r * Math.sin(ang) };
  });
}

// ── §10-12 Classificação do toque por REGIÃO (não por clique exato) ──────────
export type Classificacao = "exata" | "correta_aproximada" | "adjacente" | "distante";
export type Tolerancia = "ampla" | "padrao" | "precisa";
// raio "exato" (fração do raio do anel) por tolerância — só distingue exata de aproximada
const RAIO_EXATO_FRAC: Record<Tolerancia, number> = { ampla: 0.55, padrao: 0.42, precisa: 0.30 };

export interface Resultado { selecionada: number; correto: boolean; classificacao: Classificacao; distancia: number }

export function classificarToque(
  toque: Ponto, centros: Ponto[], correta: number, arranjo: Arranjo, w: number, h: number, tol: Tolerancia = "padrao"
): Resultado {
  const dists = centros.map((c) => Math.hypot(c.x - toque.x, c.y - toque.y));
  let selecionada = 0;
  for (let i = 1; i < dists.length; i++) if (dists[i] < dists[selecionada]) selecionada = i;
  const correto = selecionada === correta;                       // §12: região mais próxima é a correta
  const raioAnel = Math.min(w, h) * RAIO_FRAC[arranjo];
  const raioExato = raioAnel * RAIO_EXATO_FRAC[tol];
  let classificacao: Classificacao;
  if (correto) classificacao = dists[correta] <= raioExato ? "exata" : "correta_aproximada";
  else classificacao = adjacentes(selecionada, correta) ? "adjacente" : "distante";
  return { selecionada, correto, classificacao, distancia: dists[correta] };
}

// ── §14 Sequência de posições contrabalanceada (12 por bloco) ────────────────
// Usa ciclos completos das 8 posições, embaralhados, sem repetir a posição na
// emenda entre ciclos (dentro de um ciclo já não há repetição consecutiva).
export function gerarSequenciaPosicoes(n: number, embaralhar: (a: number[]) => number[]): number[] {
  const seq: number[] = [];
  while (seq.length < n) {
    const ciclo = embaralhar([0, 1, 2, 3, 4, 5, 6, 7]);
    if (seq.length && ciclo[0] === seq[seq.length - 1]) { [ciclo[0], ciclo[1]] = [ciclo[1], ciclo[0]]; }
    for (const p of ciclo) if (seq.length < n) seq.push(p);
  }
  return seq;
}

// ── §18 Motor adaptativo por acertos/erros ───────────────────────────────────
export interface AdaptState {
  degrau: number;
  acertosConsec: number;
  errosConsec: number;
  ultimoDegrauEstavel: number;
}
export const estadoInicial = (degrau: number): AdaptState => ({
  degrau: clampDegrau(degrau), acertosConsec: 0, errosConsec: 0, ultimoDegrauEstavel: clampDegrau(degrau),
});

export type TipoAdaptacao = "nenhuma" | "aceleracao" | "desaceleracao" | "retorno_estavel";

export function adaptar(st: AdaptState, acertou: boolean): { estado: AdaptState; tipo: TipoAdaptacao } {
  let { degrau, acertosConsec, errosConsec, ultimoDegrauEstavel } = st;
  let tipo: TipoAdaptacao = "nenhuma";
  if (acertou) {
    acertosConsec += 1; errosConsec = 0;
    if (acertosConsec >= 2) {                       // 2 acertos → mais rápido (§18)
      ultimoDegrauEstavel = degrau;                 // consolida a condição atual
      degrau = clampDegrau(degrau + 1);
      acertosConsec = 0;
      tipo = "aceleracao";
    }
  } else {
    acertosConsec = 0;
    errosConsec += 1;
    if (errosConsec >= 3) {                          // 3 erros → volta ao último estável (§18)
      degrau = clampDegrau(ultimoDegrauEstavel);
      errosConsec = 0;
      tipo = "retorno_estavel";
    } else if (errosConsec === 2) {                  // 2 erros → mais lento, mantém contador em 2
      degrau = clampDegrau(degrau - 1);
      tipo = "desaceleracao";
    }
  }
  return { estado: { degrau, acertosConsec, errosConsec, ultimoDegrauEstavel }, tipo };
}

// ── §19 Ponto estável: ≥4 acertos nas últimas 5, sem 2 erros seguidos ────────
export function pontoEstavel(ultimas5: boolean[]): boolean {
  if (ultimas5.length < 5) return false;
  const jan = ultimas5.slice(-5);
  if (jan.filter(Boolean).length < 4) return false;
  for (let i = 1; i < jan.length; i++) if (!jan[i] && !jan[i - 1]) return false;
  return true;
}

// ── §20 Avaliação do bloco (12 tentativas) ───────────────────────────────────
export const BLOCO_TENTATIVAS = 12;
export type DecisaoBloco = "avancar" | "manter" | "reforcar";
export function avaliarBloco(acertos: number): { decisao: DecisaoBloco; precisao: number } {
  const precisao = acertos / BLOCO_TENTATIVAS;
  const decisao: DecisaoBloco = acertos >= 10 ? "avancar" : acertos >= 8 ? "manter" : "reforcar";
  return { decisao, precisao };
}
