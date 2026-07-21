// ─────────────────────────────────────────────────────────────────────────────
// Motor puro do Investigadores da Situação Social (Etapa 3).
// Seleção de histórias, verificação de respostas, feedback progressivo e
// montagem do resultado. Sem React — testável. NÃO contém conteúdo de história.
// ─────────────────────────────────────────────────────────────────────────────

import type {
  SocialStory, SocialQuestion, SocialOption, FaixaEtaria, NivelSocial,
  PatientAnswer, SocialSessionResult, EixoSocial,
} from "./types";

// ── Seleção de histórias ──────────────────────────────────────────────────────

export interface SelecaoFiltro {
  faixa?: FaixaEtaria;
  nivel?: NivelSocial;
  foco?: EixoSocial | "todos";
}

export function selecionarHistorias(todas: SocialStory[], f: SelecaoFiltro): SocialStory[] {
  return todas.filter((s) => {
    if (f.faixa && s.faixa !== f.faixa) return false;
    if (f.nivel && s.nivel !== f.nivel) return false;
    if (f.foco && f.foco !== "todos" && !s.habilidadeTreinada.includes(f.foco)) return false;
    return true;
  });
}

/** Escolhe a história de nível mais próximo do alvo, dentro da faixa/foco. */
export function historiaSugerida(
  todas: SocialStory[], faixa: FaixaEtaria, nivelAlvo: number, foco?: EixoSocial | "todos",
): SocialStory | null {
  const pool = selecionarHistorias(todas, { faixa, foco });
  if (!pool.length) return null;
  return [...pool].sort((a, b) => Math.abs(a.nivel - nivelAlvo) - Math.abs(b.nivel - nivelAlvo))[0];
}

// ── Verificação de respostas (só após confirmar) ──────────────────────────────

export function isPontuavel(q: SocialQuestion): boolean {
  return q.gabarito !== undefined;
}

/** Verifica a resposta contra o gabarito. Devolve null se a pergunta é mediada. */
export function verificarResposta(
  q: SocialQuestion, value: PatientAnswer["value"],
): boolean | null {
  if (!isPontuavel(q)) return null;
  const gab = Array.isArray(q.gabarito) ? q.gabarito : [q.gabarito!];

  switch (q.formato) {
    case "escolhaUnica":
    case "escolherExpressao":
      return typeof value === "string" && gab.length === 1 && value === gab[0];
    case "multiplaSelecao": {
      const v = Array.isArray(value) ? [...value].sort() : [];
      const g = [...gab].sort();
      return v.length === g.length && v.every((x, i) => x === g[i]);
    }
    case "ordenar": {
      const v = Array.isArray(value) ? value : [];
      return v.length === gab.length && v.every((x, i) => x === gab[i]);
    }
    case "classificar": {
      // value = { optionId: baldeEscolhido }; correto se bate com opcao.categoria
      if (typeof value !== "object" || Array.isArray(value)) return false;
      const map = value as Record<string, string>;
      return (q.opcoes ?? []).every((o) => !o.categoria || map[o.id] === o.categoria);
    }
    case "escala":
      return typeof value === "number" && gab.map(Number).includes(value);
    default:
      return null; // abertaRegistrada nunca chega aqui (não é pontuável)
  }
}

/** Tipo de erro do distrator escolhido (para relatório), quando aplicável. */
export function erroTipoDaResposta(q: SocialQuestion, value: PatientAnswer["value"]): PatientAnswer["erroTipo"] {
  if ((q.formato === "escolhaUnica" || q.formato === "escolherExpressao") && typeof value === "string") {
    const op = (q.opcoes ?? []).find((o) => o.id === value);
    return op?.erroTipo;
  }
  return undefined;
}

// ── Feedback progressivo (dicas em níveis) ────────────────────────────────────
export interface Feedback { titulo: string; linhas: string[]; }

/** tentativa = nº de erros já cometidos nesta pergunta (0 = acertou). */
export function feedback(q: SocialQuestion, correta: boolean | null, tentativa: number): Feedback {
  if (correta === null) return { titulo: "Resposta registrada", linhas: ["Vamos conversar sobre isso."] };
  if (correta) return { titulo: "Boa observação!", linhas: ["Sua resposta se apoia nas pistas da cena."] };
  if (tentativa <= 1) return { titulo: "Observe de novo", linhas: [q.dica1 ?? "Olhe com calma as pistas da cena antes de decidir."] };
  if (tentativa === 2) return { titulo: "Quase lá", linhas: [q.dica2 ?? "Pense no que cada pista indica em conjunto."] };
  const correctText = correctOptionText(q);
  return { titulo: "Veja a pista", linhas: [correctText ? `Uma leitura apoiada nas pistas: ${correctText}.` : "Reveja as pistas destacadas."] };
}

function correctOptionText(q: SocialQuestion): string | null {
  if (!q.opcoes || q.gabarito === undefined) return null;
  const gab = Array.isArray(q.gabarito) ? q.gabarito : [q.gabarito];
  const texts = q.opcoes.filter((o: SocialOption) => gab.includes(o.id)).map((o) => o.texto);
  return texts.length ? texts.join(", ") : null;
}

// ── Montagem do resultado da sessão ───────────────────────────────────────────

export function montarResultado(
  story: SocialStory, answers: PatientAnswer[], duracaoSeg: number,
): SocialSessionResult {
  const pontuaveis = answers.filter((a) => a.correta !== null);
  const abertos = answers.filter((a) => a.correta === null);
  const acertos = pontuaveis.filter((a) => a.correta).length;

  const porEixo: Partial<Record<EixoSocial, number>> = {};
  const grupos = new Map<EixoSocial, { ok: number; total: number }>();
  for (const a of pontuaveis) {
    const g = grupos.get(a.eixo) ?? { ok: 0, total: 0 };
    g.total += 1; if (a.correta) g.ok += 1;
    grupos.set(a.eixo, g);
  }
  for (const [eixo, g] of grupos) porEixo[eixo] = g.total ? g.ok / g.total : 0;

  return {
    storyId: story.id,
    faixa: story.faixa,
    nivel: story.nivel,
    answers,
    acuraciaPorEixo: porEixo,
    acuraciaGlobal: pontuaveis.length ? acertos / pontuaveis.length : 0,
    itensAbertos: abertos,
    duracaoSeg,
  };
}
