"use client";

// ─────────────────────────────────────────────────────────────────────────────
// Caminhos para a Meta — TELA DO PACIENTE (spec §4, §5, §6, §13-§17, §21, §22).
//
// Substitui o antigo "Sequência Temporal" (exerciseId interno segue `antes-depois`).
// Roda uma sessão de atividades: uma por rodada, barra por TEMPO ATIVO. Cada
// atividade usa o MOTOR do Bloco 1 (corrigirResposta / corrigirImprevisto /
// indicadoresDe) para pontuar; a UI só coleta a resposta e monta os registros.
//
// Interação primária = TOCAR-PARA-ORDENAR; drag por pointer events e setas ↑/↓
// são equivalentes (spec §5). Undo/redo por pilha de estados (usePlanState).
// ⚠️ Regra do projeto: nada de whileTap/motion em elemento com transform de
//    POSICIONAMENTO — o fantasma de drag usa <div> estático posicionado.
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useRef, useCallback, useEffect, useMemo } from "react";
import {
  Compass,
  Volume2,
  Lightbulb,
  Undo2,
  Redo2,
  Eraser,
  Check,
  ChevronUp,
  ChevronDown,
  RotateCcw,
  AlertTriangle,
} from "lucide-react";
import { calculateExerciseScore } from "@/lib/scoring";
import { playTTS, cancelTTS } from "@/lib/tts";
import { useTimedProgress } from "@/components/exercises/useExerciseEngine";
import { ExerciseProgressBar } from "@/components/exercises/ExerciseProgressBar";
import { corrigirResposta, corrigirImprevisto } from "@/lib/caminhos-meta";
import {
  CAMINHOS_ATIVIDADES,
  CAMINHOS_CRIANCAS,
  CAMINHOS_ADOLESCENTES,
  CAMINHOS_ADULTOS_IDOSOS,
} from "@/data/caminhos-meta-atividades";
import type {
  CaminhosAtividade,
  CaminhosAcao,
  CaminhosResposta,
  CaminhosResultado,
  CaminhosResultadoImprevisto,
  CaminhosRegistro,
} from "@/types/caminhos-meta";
import { indicadoresDe } from "@/lib/caminhos-meta";
import type { ExerciseResult, Theme } from "@/types";
import { CM, SHADOW_CARD, SHADOW_PANEL } from "./theme";
import { normalizeCaminhosSettings, limitePrioridade } from "./settings";
import { usePlanState, snapshotInicial, type PlanSnapshot } from "./usePlanState";
import { usePointerDrag, type DropTarget } from "./usePointerDrag";
import { salvarProgresso, carregarProgresso, limparProgresso, type SavedProgress } from "./persist";

// ── Props ────────────────────────────────────────────────────────────────────

interface CaminhosMetaProps {
  difficulty: number;
  theme: Theme;
  onComplete: (r: ExerciseResult) => void;
  settings?: Record<string, unknown>;
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function shuffle<T>(a: T[]): T[] {
  const r = [...a];
  for (let i = r.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [r[i], r[j]] = [r[j], r[i]];
  }
  return r;
}

/** Sem prescrição do terapeuta: 1 atividade de nível baixo por biblioteca. */
function padraoSemConfig(): CaminhosAtividade[] {
  const libs = [CAMINHOS_CRIANCAS, CAMINHOS_ADOLESCENTES, CAMINHOS_ADULTOS_IDOSOS];
  return libs
    .map((l) => [...l].filter((a) => a.ativo).sort((x, y) => x.nivel - y.nivel)[0])
    .filter((a): a is CaminhosAtividade => !!a);
}

/** Seleciona as atividades da sessão a partir das settings (catálogo oficial de 90). */
function montarSessao(settings: ReturnType<typeof normalizeCaminhosSettings>): CaminhosAtividade[] {
  const porId = new Map(CAMINHOS_ATIVIDADES.map((a) => [a.id, a]));
  let base: CaminhosAtividade[];
  if (settings.atividadesSelecionadas.length > 0) {
    base = settings.atividadesSelecionadas
      .map((id) => porId.get(id))
      .filter((a): a is CaminhosAtividade => !!a && a.ativo);
    if (base.length === 0) base = padraoSemConfig();
  } else {
    base = padraoSemConfig();
  }
  const ordenada = settings.ordemFixa ? base : shuffle(base);
  // expande por rodadas
  const out: CaminhosAtividade[] = [];
  for (let r = 0; r < Math.max(1, settings.rodadas); r++) out.push(...ordenada);
  return out.length ? out : padraoSemConfig();
}

/** Modos que trabalham com espaços numerados de ordem. */
function usaOrdem(modo: CaminhosAtividade["modo"]): boolean {
  return modo !== "prioridade";
}

/** Modos com fase 2 de imprevisto. */
function temImprevisto(a: CaminhosAtividade): boolean {
  return (
    !!a.imprevisto?.ativo &&
    (a.modo === "problema" || a.modo === "plano_alternativo" || a.modo === "reorganizar")
  );
}

/** Estado inicial do plano por modo. */
function planoInicialDe(a: CaminhosAtividade): PlanSnapshot {
  const n = a.correcao.ordemPrincipal.length;
  if (!usaOrdem(a.modo)) return snapshotInicial(0);
  if (a.modo === "completar") {
    // pré-preenche todas menos uma lacuna (a ação omitida vira opção no pool).
    // A atividade pode fixar QUAL ação é a lacuna (lacunaAcaoId); fallback: penúltima.
    const idxFixado = a.lacunaAcaoId ? a.correcao.ordemPrincipal.indexOf(a.lacunaAcaoId) : -1;
    const gapIdx = idxFixado >= 0 ? idxFixado : Math.max(0, a.correcao.ordemPrincipal.length - 2);
    const plano: (string | null)[] = a.correcao.ordemPrincipal.map((id, i) => (i === gapIdx ? null : id));
    return { plano, descartadas: [], selecionadas: [] };
  }
  if (a.modo === "corrigir") {
    // pré-preenche com a ordem ERRADA fixada pela atividade (ordemInicial);
    // fallback: troca de duas ações adjacentes do meio.
    const correta = a.correcao.ordemPrincipal;
    const fixada = a.ordemInicial;
    if (
      fixada &&
      fixada.length === correta.length &&
      new Set(fixada).size === fixada.length &&
      fixada.every((id) => correta.includes(id))
    ) {
      return { plano: [...fixada], descartadas: [], selecionadas: [] };
    }
    const base = [...correta];
    if (base.length >= 2) {
      const i = Math.floor(base.length / 2) - 1;
      const j = i + 1;
      [base[i], base[j]] = [base[j], base[i]];
    }
    return { plano: base, descartadas: [], selecionadas: [] };
  }
  return snapshotInicial(n);
}

/** Ações disponíveis no pool (embaralhadas), respeitando o modo. */
function poolInicial(a: CaminhosAtividade, planoInicial: PlanSnapshot): string[] {
  const noPlano = new Set(planoInicial.plano.filter((x): x is string => x != null));
  let ids = a.acoes.map((x) => x.id).filter((id) => !noPlano.has(id));
  if (a.modo === "prioridade") ids = a.acoes.map((x) => x.id); // todas selecionáveis
  return shuffle(ids);
}

function acaoDe(a: CaminhosAtividade, id: string): CaminhosAcao | undefined {
  return a.acoes.find((x) => x.id === id);
}

// ── Sub-componente: cartão de ação ────────────────────────────────────────────

type EstadoVisual = "normal" | "foco" | "erro" | "ok" | "parcial" | "desabilitado";

const estadoBorda: Record<EstadoVisual, string> = {
  normal: CM.border,
  foco: CM.accent,
  erro: CM.errBorder,
  ok: CM.okBorder,
  parcial: CM.warnBorder,
  desabilitado: CM.borderSoft,
};
const estadoBg: Record<EstadoVisual, string> = {
  normal: CM.card,
  foco: CM.accentSoft,
  erro: CM.errBg,
  ok: CM.okBg,
  parcial: CM.warnBg,
  desabilitado: CM.cardSoft,
};

function Cartao({
  texto,
  ordem,
  estado = "normal",
  ariaLabel,
  ariaPressed,
  onClick,
  onPointerDown,
  onKeyDown,
  onFalarTexto,
  disabled,
  refEl,
  extra,
}: {
  texto: string;
  ordem?: number;
  estado?: EstadoVisual;
  ariaLabel?: string;
  ariaPressed?: boolean;
  onClick?: () => void;
  onPointerDown?: (e: React.PointerEvent) => void;
  onKeyDown?: (e: React.KeyboardEvent) => void;
  /** Lê o texto do cartão em voz alta (spec §15); botão-falante discreto no cartão. */
  onFalarTexto?: () => void;
  disabled?: boolean;
  refEl?: (el: HTMLDivElement | null) => void;
  extra?: React.ReactNode;
}) {
  return (
    <div
      ref={refEl}
      role="button"
      tabIndex={disabled ? -1 : 0}
      aria-label={ariaLabel ?? texto}
      aria-pressed={ariaPressed}
      aria-disabled={disabled || undefined}
      onClick={disabled ? undefined : onClick}
      onKeyDown={disabled ? undefined : onKeyDown}
      onPointerDown={disabled ? undefined : onPointerDown}
      style={{
        position: "relative",
        display: "flex",
        alignItems: "center",
        gap: 10,
        width: "100%",
        minHeight: 56,
        padding: "12px 14px",
        borderRadius: 16,
        background: estadoBg[estado],
        border: `1.5px solid ${estadoBorda[estado]}`,
        boxShadow: estado === "desabilitado" ? "none" : SHADOW_CARD,
        cursor: disabled ? "default" : "pointer",
        color: CM.ink,
        fontSize: 15,
        fontWeight: 600,
        lineHeight: 1.3,
        textAlign: "left",
        touchAction: "none", // deixa o pointer drag controlar o gesto
        outlineOffset: 2,
        transition: "border-color .15s, background .15s, box-shadow .15s",
      }}
    >
      {ordem != null && (
        <span
          aria-hidden
          style={{
            flexShrink: 0,
            width: 26,
            height: 26,
            borderRadius: "50%",
            background: `linear-gradient(135deg, ${CM.accent}, ${CM.accentDark})`,
            color: "#fff",
            fontSize: 13,
            fontWeight: 800,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 2px 6px rgba(79,143,234,0.4)",
          }}
        >
          {ordem}
        </span>
      )}
      <span style={{ flex: 1, minWidth: 0 }}>{texto}</span>
      {extra}
      {onFalarTexto && (
        <button
          type="button"
          aria-label={`Ouvir: ${texto}`}
          onClick={(e) => {
            e.stopPropagation();
            onFalarTexto();
          }}
          onPointerDown={(e) => e.stopPropagation()}
          onKeyDown={(e) => e.stopPropagation()}
          style={{
            flexShrink: 0,
            width: 28,
            height: 28,
            borderRadius: "50%",
            border: `1.5px solid ${CM.borderSoft}`,
            background: CM.card,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            touchAction: "auto",
          }}
        >
          <Volume2 size={13} color={CM.textMid} strokeWidth={2} />
        </button>
      )}
    </div>
  );
}

// ── Sub-componente: botão de controle ─────────────────────────────────────────

function CtrlBtn({
  icon,
  label,
  onClick,
  disabled,
  primary,
}: {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  disabled?: boolean;
  primary?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 7,
        padding: "10px 14px",
        borderRadius: 14,
        border: primary ? "none" : `1.5px solid ${CM.border}`,
        background: primary
          ? `linear-gradient(135deg, ${CM.accent}, ${CM.accentDark})`
          : disabled
          ? CM.cardSoft
          : CM.card,
        color: primary ? "#fff" : disabled ? CM.textSoft : CM.text,
        fontSize: 13.5,
        fontWeight: 700,
        cursor: disabled ? "default" : "pointer",
        boxShadow: primary ? "0 4px 14px rgba(79,143,234,0.4)" : "0 2px 6px rgba(100,140,180,0.1)",
        opacity: disabled ? 0.65 : 1,
        transition: "opacity .15s",
      }}
    >
      {icon}
      <span>{label}</span>
    </button>
  );
}

// ── Componente principal ──────────────────────────────────────────────────────

export function CaminhosMeta({ difficulty, theme, onComplete, settings }: CaminhosMetaProps) {
  const cfg = useMemo(() => normalizeCaminhosSettings(settings), [settings]);
  const sessao = useMemo(() => montarSessao(cfg), [cfg]);

  const { begin, isTimeUp, elapsedSec, finish, progressPct } = useTimedProgress();

  const [idx, setIdx] = useState(0);
  const atividade = sessao[Math.min(idx, sessao.length - 1)];

  // registros acumulados da sessão (para o metadata final)
  const registrosRef = useRef<CaminhosRegistro[]>([]);
  // momentos das dicas por atividade (spec §16), paralelo a registrosRef.
  const momentosRef = useRef<{ nivel: number; tentativa: number }[][]>([]);
  const startTsRef = useRef<number>(Date.now());
  const beganRef = useRef(false);

  // controla se já perguntamos sobre retomada
  const [retomarDe, setRetomarDe] = useState<SavedProgress | null>(null);
  const [checouRetomada, setChecouRetomada] = useState(false);

  useEffect(() => {
    // ao montar a atividade, verifica autosave (spec §22)
    const salvo = carregarProgresso(atividade.id);
    setRetomarDe(salvo);
    setChecouRetomada(!salvo); // sem salvo = já pode iniciar direto
    startTsRef.current = Date.now();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idx]);

  useEffect(() => () => cancelTTS(), []);

  const finalizarSessao = useCallback(() => {
    finish();
    const registros = registrosRef.current;
    const total = Math.max(1, registros.length);
    const corretas = registros.filter((r) => r.estado === "correta").length;
    const parciais = registros.filter((r) => r.estado === "parcial").length;
    const accuracy = (corretas + parciais * 0.5) / total;
    const nivelMedio = Math.round(
      registros.reduce((s, r) => s + r.nivel, 0) / total
    );
    const tempoMedio =
      registros.length > 0
        ? Math.round((registros.reduce((s, r) => s + r.tempoTotalSeg, 0) / registros.length) * 1000)
        : undefined;
    const indicadores = indicadoresDe(registros);

    // resumo por atividade (spec §18)
    const porAtividade = registros.map((r, i) => ({
      atividadeId: r.atividadeId,
      modo: r.modo,
      nivel: r.nivel,
      estado: r.estado,
      tentativas: r.tentativas,
      dicasUsadas: r.dicasUsadas,
      nivelDicaMax: r.nivelDicaMax,
      momentosDica: momentosRef.current[i] ?? [],
      acertoInicial: r.acertoInicial,
      acertoAposRevisao: r.acertoAposRevisao,
      adaptouAposMudanca: r.adaptouAposMudanca,
      erroPerseveracao: r.erroPerseveracao,
      tempoTotalSeg: r.tempoTotalSeg,
    }));

    onComplete({
      exerciseId: "antes-depois", // id interno preservado (histórico/planos)
      domain: "executive",
      score: calculateExerciseScore("antes-depois", accuracy, tempoMedio, difficulty),
      accuracy: Number(accuracy.toFixed(3)),
      reactionTime: tempoMedio,
      difficulty: nivelMedio || Math.max(1, Math.round(difficulty)),
      duration: elapsedSec(),
      metadata: {
        modulo: "caminhos-meta",
        registros,
        indicadores,
        porAtividade,
        totalAtividades: total,
        corretas,
        parciais,
      },
    });
  }, [finish, elapsedSec, onComplete, difficulty]);

  const proximaAtividade = useCallback(() => {
    limparProgresso(atividade.id);
    if (isTimeUp() || idx + 1 >= sessao.length) {
      finalizarSessao();
      return;
    }
    setIdx((i) => i + 1);
  }, [atividade.id, isTimeUp, idx, sessao.length, finalizarSessao]);

  // registra o desempenho de UMA atividade e avança
  const registrarEavancar = useCallback(
    (registro: CaminhosRegistro, momentosDica: { nivel: number; tentativa: number }[]) => {
      registrosRef.current.push(registro);
      momentosRef.current.push(momentosDica);
      proximaAtividade();
    },
    [proximaAtividade]
  );

  const iniciarAtividade = useCallback(() => {
    if (!beganRef.current) {
      beganRef.current = true;
      begin();
    }
    setChecouRetomada(true);
  }, [begin]);

  // ── Tela de retomada (autosave, spec §22) ──
  if (retomarDe && !checouRetomada) {
    return (
      <Tela>
        <Painel titulo>
          <div style={{ textAlign: "center", padding: "8px 4px 4px" }}>
            <RotateCcw size={40} color={CM.accent} strokeWidth={1.8} style={{ margin: "0 auto 12px" }} />
            <h2 style={{ fontSize: 18, fontWeight: 800, color: CM.text, marginBottom: 6 }}>
              Continuar de onde parou?
            </h2>
            <p style={{ fontSize: 13.5, color: CM.textMid, marginBottom: 18, lineHeight: 1.4 }}>
              Encontramos um plano em andamento nesta atividade.
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <CtrlBtn
                primary
                icon={<Check size={16} />}
                label="Continuar"
                onClick={() => {
                  iniciarAtividade();
                }}
              />
              <CtrlBtn
                icon={<Eraser size={16} />}
                label="Recomeçar esta atividade"
                onClick={() => {
                  limparProgresso(atividade.id);
                  setRetomarDe(null);
                  iniciarAtividade();
                }}
              />
            </div>
          </div>
        </Painel>
      </Tela>
    );
  }

  return (
    <AtividadeRunner
      key={`${atividade.id}-${idx}`}
      atividade={atividade}
      cfg={cfg}
      theme={theme}
      progressPct={progressPct}
      progresso={{ atual: idx + 1, total: sessao.length }}
      retomar={retomarDe ?? undefined}
      startTs={startTsRef.current}
      onIniciar={iniciarAtividade}
      onConcluir={registrarEavancar}
    />
  );
}

// ── Layout base ────────────────────────────────────────────────────────────────

function Tela({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        minHeight: "100vh",
        width: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "flex-start",
        background: CM.bgGradient,
        padding: "16px 14px 28px",
      }}
    >
      {children}
    </div>
  );
}

function Painel({ children, titulo }: { children: React.ReactNode; titulo?: boolean }) {
  return (
    <div
      style={{
        width: "100%",
        maxWidth: titulo ? 460 : 900,
        background: CM.card,
        borderRadius: 24,
        border: `1px solid ${CM.border}`,
        boxShadow: SHADOW_PANEL,
        padding: 20,
        marginTop: titulo ? 40 : 0,
      }}
    >
      {children}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// AtividadeRunner — executa UMA atividade (todos os modos). Estado isolado por key.
// ─────────────────────────────────────────────────────────────────────────────

type Fase = "resolvendo" | "feedback" | "imprevisto" | "feedbackImprevisto";

function AtividadeRunner({
  atividade,
  cfg,
  theme,
  progressPct,
  progresso,
  retomar,
  startTs,
  onIniciar,
  onConcluir,
}: {
  atividade: CaminhosAtividade;
  cfg: ReturnType<typeof normalizeCaminhosSettings>;
  theme: Theme;
  progressPct: number;
  progresso: { atual: number; total: number };
  retomar?: SavedProgress;
  startTs: number;
  onIniciar: () => void;
  onConcluir: (r: CaminhosRegistro, momentosDica: { nivel: number; tentativa: number }[]) => void;
}) {
  const planoInicial = useMemo(() => planoInicialDe(atividade), [atividade]);
  const pool0 = useMemo(() => poolInicial(atividade, planoInicial), [atividade, planoInicial]);
  // Limite do modo prioridade = nº de essenciais DA ATIVIDADE (C16 pede 3, AD16 pede 6…);
  // settings (limiteEscolhas) só sobrepõem se definidas explicitamente pelo terapeuta.
  const limPrio = limitePrioridade(
    cfg as unknown as Record<string, unknown>,
    atividade.correcao.acoesObrigatorias.length || 3
  );
  const modoOrdem = usaOrdem(atividade.modo);
  const modoIntruso = atividade.modo === "intruso";
  const modoPrioridade = atividade.modo === "prioridade";
  const comImprevisto = temImprevisto(atividade);

  const plan = usePlanState(retomar?.snap ?? planoInicial);
  const drag = usePointerDrag((id, target) => aplicarDrop(id, target));

  const [fase, setFase] = useState<Fase>("resolvendo");
  const [resultado, setResultado] = useState<CaminhosResultado | null>(null);
  const [resImprevisto, setResImprevisto] = useState<CaminhosResultadoImprevisto | null>(null);
  const [dicaNivel, setDicaNivel] = useState<0 | 1 | 2 | 3>(retomar?.dicaNivel ?? 0);
  const [aviso, setAviso] = useState<string | null>(null);
  const [escolhaImprevisto, setEscolhaImprevisto] = useState<string[]>([]);

  // ── métricas do registro ──
  const tentativasRef = useRef(retomar?.tentativas ?? 0);
  const acertoInicialRef = useRef<boolean | null>(null);
  const acertoAposRevisaoRef = useRef(false);
  const usouAudioRef = useRef(false);
  const dicasUsadasRef = useRef(0);
  const trocasRef = useRef(0);
  // nível+momento de cada dica pedida (spec §16) — anexado ao metadata da atividade.
  const dicasMomentoRef = useRef<{ nivel: number; tentativa: number }[]>([]);

  // inicia o cronômetro (tempo ativo) ao montar a atividade (spec §22)
  useEffect(() => {
    onIniciar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // autosave a cada mudança (spec §22)
  useEffect(() => {
    if (fase !== "resolvendo") return;
    salvarProgresso({
      atividadeId: atividade.id,
      snap: plan.snap,
      faseImprevisto: false,
      dicaNivel,
      tentativas: tentativasRef.current,
      ts: Date.now(),
    });
  }, [plan.snap, dicaNivel, fase, atividade.id]);

  // ── áudio (spec §15) ──
  const falar = useCallback(
    (texto: string) => {
      if (!cfg.audioHabilitado) return;
      usouAudioRef.current = true;
      playTTS(texto);
    },
    [cfg.audioHabilitado]
  );
  const ouvirInstrucao = useCallback(() => {
    falar(`${atividade.meta}. ${atividade.instrucao}`);
  }, [falar, atividade.meta, atividade.instrucao]);

  // ── drag & drop → aplica no estado do plano ──
  const aplicarDrop = useCallback(
    (id: string, target: DropTarget) => {
      if (fase !== "resolvendo") return;
      trocasRef.current += 1;
      if (!target) return;
      if (target.kind === "slot") {
        plan.colocarNaPosicao(id, target.pos);
      } else if (target.kind === "discard" && modoIntruso) {
        plan.descartar(id);
      } else if (target.kind === "pool") {
        // arrastar de volta ao acervo = remover do plano/descarte
        plan.removerDoPlano(id);
        plan.restaurarDescartada(id);
      }
    },
    [fase, plan, modoIntruso]
  );

  // ── toque-para-ordenar (forma primária) ──
  const tocarNoPool = useCallback(
    (id: string) => {
      if (fase !== "resolvendo") return;
      if (modoPrioridade) {
        plan.toggleSelecionada(id, limPrio);
        return;
      }
      plan.colocarNoProximoLivre(id);
    },
    [fase, modoPrioridade, plan, limPrio]
  );
  const tocarNoPlano = useCallback(
    (id: string) => {
      if (fase !== "resolvendo") return;
      plan.removerDoPlano(id);
    },
    [fase, plan]
  );

  // ── montar resposta e corrigir (spec §8/§9) ──
  // No modo prioridade não há ordem: a escolha é o conjunto `selecionadas`, então
  // ele vira `ordem` para o motor avaliar obrigatórias/opcionais/intrusas selecionadas.
  const respostaAtual = useCallback((): CaminhosResposta => {
    return {
      ordem: modoPrioridade ? plan.snap.selecionadas : plan.noPlano,
      descartadas: plan.snap.descartadas,
      selecionadas: plan.snap.selecionadas,
    };
  }, [modoPrioridade, plan.noPlano, plan.snap]);

  const planoIncompleto = useCallback((): boolean => {
    if (modoPrioridade) return plan.snap.selecionadas.length < limPrio;
    // toda obrigatória precisa estar presente e os espaços preenchidos
    const faltaEspaco = plan.snap.plano.some((x) => x == null);
    return faltaEspaco;
  }, [modoPrioridade, plan.snap, limPrio]);

  const confirmar = useCallback(() => {
    if (fase !== "resolvendo") return;
    if (planoIncompleto()) {
      // aviso, não bloqueio silencioso (spec §13)
      setAviso(
        modoPrioridade
          ? `Escolha ${limPrio} ações antes de confirmar.`
          : "Ainda faltam ações no seu plano. Preencha todos os espaços ou toque em Confirmar de novo para enviar assim mesmo."
      );
      // segundo clique com plano incompleto: envia mesmo assim
      if (!avisouUmaVezRef.current) {
        avisouUmaVezRef.current = true;
        return;
      }
    }
    avisouUmaVezRef.current = false;
    setAviso(null);
    tentativasRef.current += 1;

    const res = corrigirResposta(atividade, respostaAtual());
    setResultado(res);

    const primeira = acertoInicialRef.current === null;
    if (primeira) acertoInicialRef.current = res.estado === "correta";
    else if (res.estado === "correta") acertoAposRevisaoRef.current = true;

    // PARCIAL: não limpar; permitir nova tentativa se maxTentativas permitir (spec §9/§17)
    if (
      res.estado === "parcial" &&
      tentativasRef.current < cfg.maxTentativas &&
      cfg.feedbackImediato
    ) {
      setFase("feedback");
      return;
    }
    // correta/incorreta OU esgotou tentativas → feedback e (se houver) imprevisto
    setFase("feedback");
  }, [fase, planoIncompleto, modoPrioridade, limPrio, atividade, respostaAtual, cfg.maxTentativas, cfg.feedbackImediato]);
  const avisouUmaVezRef = useRef(false);

  // "tentar de novo" a partir do feedback parcial (mantém o plano; spec §9)
  const tentarDeNovo = useCallback(() => {
    setResultado(null);
    setFase("resolvendo");
  }, []);

  // avançar do feedback: se há imprevisto e ainda não foi apresentado, entra na fase 2
  const seguirDoFeedback = useCallback(() => {
    if (comImprevisto && fase === "feedback") {
      setFase("imprevisto");
      return;
    }
    concluirAtividade();
  }, [comImprevisto, fase]);

  // ── fase 2: imprevisto (spec §6 modos 6-8) ──
  const opcoesImprevisto = useMemo(() => {
    if (!comImprevisto || !atividade.imprevisto) return [];
    const imp = atividade.imprevisto;
    // alternativas = solução correta + ações que devem mudar (perseveração) + substitutas/opcionais.
    const ids = new Set<string>([
      ...imp.solucaoCorreta,
      ...imp.acoesQueDevemMudar,
    ]);
    // acrescenta substitutas do acervo que não estejam já listadas
    for (const ac of atividade.acoes) {
      if (ac.tipo === "substituta") ids.add(ac.id);
    }
    return shuffle(Array.from(ids));
  }, [comImprevisto, atividade]);

  // Soluções com MAIS de uma ação (níveis 8: duas mudanças) exigem seleção múltipla
  // + confirmação; solução de 1 ação mantém o toque único (responde na hora).
  const imprevistoMulti = (atividade.imprevisto?.solucaoCorreta.length ?? 1) > 1;

  const escolherImprevisto = useCallback(
    (id: string) => {
      if (fase !== "imprevisto") return;
      if (!imprevistoMulti) {
        setEscolhaImprevisto([id]);
        const res = corrigirImprevisto(atividade, [id]);
        setResImprevisto(res);
        setFase("feedbackImprevisto");
        return;
      }
      setEscolhaImprevisto((prev) =>
        prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
      );
    },
    [fase, atividade, imprevistoMulti]
  );

  const confirmarImprevisto = useCallback(() => {
    if (fase !== "imprevisto" || escolhaImprevisto.length === 0) return;
    const res = corrigirImprevisto(atividade, escolhaImprevisto);
    setResImprevisto(res);
    setFase("feedbackImprevisto");
  }, [fase, atividade, escolhaImprevisto]);

  // ── concluir a atividade: monta o registro (spec §18) ──
  const concluirAtividade = useCallback(() => {
    const res = resultado;
    const c = atividade.correcao;
    const ordem = plan.noPlano;
    const descartadas = plan.snap.descartadas;
    const selecionadas = plan.snap.selecionadas;

    const obrig = new Set(c.acoesObrigatorias);
    const opc = new Set(c.acoesOpcionais);
    const desnec = new Set(c.acoesDesnecessarias);

    const selecionadasSet = modoPrioridade ? selecionadas : ordem;
    const obrigatoriasSelecionadas = selecionadasSet.filter((id) => obrig.has(id)).length;
    const opcionaisSelecionadas = selecionadasSet.filter((id) => opc.has(id)).length;
    const desnecessariasIncluidas = ordem.filter((id) => desnec.has(id)).length;
    const desnecessariasDescartadas = [...desnec].filter(
      (id) => descartadas.includes(id) || !ordem.includes(id)
    ).length;

    const estadoFinal = res?.estado ?? "incorreta";
    const acertoInicial = acertoInicialRef.current === true;
    const acertoAposRevisao = acertoAposRevisaoRef.current;

    // imprevisto
    const mudancaApresentada = comImprevisto;
    const adaptou = resImprevisto?.correto === true;
    const perseverou = resImprevisto?.perseverou === true;
    const problemaResolvido = adaptou;

    // ações substituídas após a mudança: escolha do imprevisto ≠ ação que devia mudar
    const acoesSubstituidasAposMudanca =
      comImprevisto && adaptou ? escolhaImprevisto.length : 0;

    const registro: CaminhosRegistro = {
      atividadeId: atividade.id,
      modo: atividade.modo,
      nivel: atividade.nivel,
      biblioteca: atividade.biblioteca,
      estado: mudancaApresentada
        ? adaptou
          ? "correta"
          : estadoFinal
        : estadoFinal,
      concluida: true,
      abandonou: false,
      obrigatoriasSelecionadas,
      opcionaisSelecionadas,
      desnecessariasDescartadas,
      desnecessariasIncluidas,
      relacoesRespeitadas: res?.relacoesRespeitadas.length ?? 0,
      relacoesVioladas: res?.relacoesVioladas.length ?? 0,
      trocas: trocasRef.current,
      alteracoes: plan.mutacoes,
      tentativas: tentativasRef.current,
      dicasUsadas: dicasUsadasRef.current,
      nivelDicaMax: dicaNivel,
      usouAudio: usouAudioRef.current,
      tempoTotalSeg: Math.max(1, Math.round((Date.now() - startTs) / 1000)),
      acertoInicial,
      acertoAposRevisao,
      respostaParcial: estadoFinal === "parcial",
      mudancaApresentada,
      adaptouAposMudanca: mudancaApresentada ? adaptou : false,
      persistiuEstrategiaAnterior: perseverou,
      erroPerseveracao: perseverou,
      problemaResolvido: mudancaApresentada ? problemaResolvido : false,
      acoesRemovidasAposMudanca: 0,
      acoesAdicionadasAposMudanca: 0,
      acoesSubstituidasAposMudanca,
    };
    onConcluir(registro, [...dicasMomentoRef.current]);
  }, [
    resultado,
    atividade,
    plan.noPlano,
    plan.snap,
    plan.mutacoes,
    modoPrioridade,
    comImprevisto,
    resImprevisto,
    escolhaImprevisto,
    dicaNivel,
    startTs,
    onConcluir,
  ]);

  // ── dica gradual (spec §16) ──
  const pedirDica = useCallback(() => {
    if (!cfg.dicasHabilitadas) return;
    const prox = Math.min(3, dicaNivel + 1) as 1 | 2 | 3;
    if (prox === dicaNivel) return;
    setDicaNivel(prox);
    dicasUsadasRef.current += 1;
    dicasMomentoRef.current.push({ nivel: prox, tentativa: tentativasRef.current + 1 });
    const dica = atividade.dicas.find((d) => d.nivel === prox);
    if (dica && cfg.audioHabilitado) falar(dica.texto);
  }, [cfg.dicasHabilitadas, cfg.audioHabilitado, dicaNivel, atividade.dicas, falar]);

  // ── teclado global: setas/Tab navegam nativamente; Enter confirma (spec §5) ──
  const handleKeyGlobal = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter" && fase === "resolvendo" && (e.target as HTMLElement).tagName !== "BUTTON") {
        confirmar();
      }
    },
    [fase, confirmar]
  );

  const dicaTexto = dicaNivel > 0 ? atividade.dicas.find((d) => d.nivel === dicaNivel)?.texto : null;

  // ── ações fora do lugar/violadas p/ destaque âmbar no parcial (spec §9/§17) ──
  const idsDestaque = useMemo(() => {
    if (!resultado || resultado.estado !== "parcial") return new Set<string>();
    const s = new Set<string>(resultado.acoesForaDoLugar);
    for (const p of resultado.relacoesVioladas) {
      s.add(p.antes);
      s.add(p.depois);
    }
    for (const id of resultado.intrusasIncluidas) s.add(id);
    return s;
  }, [resultado]);

  const podeTentarDeNovo =
    resultado?.estado === "parcial" &&
    tentativasRef.current < cfg.maxTentativas &&
    fase === "feedback";

  // ══════════════════════════════════════════════════════════════════════════
  return (
    <Tela>
      {/* fantasma do drag — <div> ESTÁTICO posicionado (sem motion/whileTap) */}
      {drag.drag && (
        <div
          aria-hidden
          style={{
            position: "fixed",
            left: drag.drag.x,
            top: drag.drag.y,
            transform: "translate(-50%, -50%)",
            zIndex: 60,
            pointerEvents: "none",
            padding: "12px 16px",
            borderRadius: 16,
            background: CM.accentSoft,
            border: `2px solid ${CM.accent}`,
            color: CM.ink,
            fontSize: 15,
            fontWeight: 700,
            boxShadow: "0 12px 30px rgba(79,143,234,0.35)",
            maxWidth: 260,
          }}
        >
          {drag.drag.label}
        </div>
      )}

      <div
        onKeyDown={handleKeyGlobal}
        style={{ width: "100%", maxWidth: 920, display: "flex", flexDirection: "column", gap: 14 }}
      >
        {/* Cabeçalho compacto (spec §13/§21) */}
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: 12,
              background: CM.accentSoft,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <Compass size={22} color={CM.accent} strokeWidth={2} />
          </div>
          <div style={{ minWidth: 0, flex: 1 }}>
            <div style={{ fontSize: 16, fontWeight: 900, color: CM.text, lineHeight: 1.1 }}>
              Caminhos para a Meta
            </div>
            <div style={{ fontSize: 11.5, color: CM.textSoft }}>
              Atividade {progresso.atual} de {progresso.total}
            </div>
          </div>
          <button
            onClick={ouvirInstrucao}
            aria-label="Ouvir a instrução"
            title="Ouvir a instrução"
            style={{
              width: 42,
              height: 42,
              borderRadius: "50%",
              border: `1.5px solid ${CM.border}`,
              background: CM.card,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              flexShrink: 0,
              boxShadow: "0 2px 6px rgba(100,140,180,0.12)",
            }}
          >
            <Volume2 size={18} color={CM.accent} strokeWidth={2} />
          </button>
        </div>

        <ExerciseProgressBar progressPct={progressPct} theme={theme} />

        {/* CARTÃO DA META — sempre visível (spec §13) */}
        <div
          style={{
            background: CM.card,
            borderRadius: 18,
            border: `1px solid ${CM.border}`,
            boxShadow: SHADOW_CARD,
            padding: "14px 16px",
            display: "flex",
            alignItems: "flex-start",
            gap: 10,
          }}
        >
          <div style={{ flex: 1, minWidth: 0 }}>
            <div
              style={{
                fontSize: 11,
                fontWeight: 800,
                letterSpacing: 0.6,
                color: CM.accent,
                textTransform: "uppercase",
                marginBottom: 3,
              }}
            >
              Sua meta
            </div>
            <div style={{ fontSize: 16.5, fontWeight: 700, color: CM.ink, lineHeight: 1.3 }}>
              {atividade.meta}
            </div>
          </div>
          <button
            onClick={() => falar(atividade.meta)}
            aria-label="Ouvir a meta"
            title="Ouvir a meta"
            style={{
              width: 34,
              height: 34,
              borderRadius: "50%",
              border: `1.5px solid ${CM.border}`,
              background: CM.card,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              flexShrink: 0,
            }}
          >
            <Volume2 size={15} color={CM.accent} strokeWidth={2} />
          </button>
        </div>

        {/* Instrução (spec §13/§15) */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "0 2px" }}>
          <p style={{ fontSize: 14.5, fontWeight: 600, color: CM.textMid, flex: 1, lineHeight: 1.35 }}>
            {fase === "imprevisto" || fase === "feedbackImprevisto"
              ? "Algo mudou. Escolha o que fazer para continuar até a meta."
              : atividade.instrucao}
          </p>
        </div>

        {/* Dica revelada (spec §16) */}
        {dicaTexto && (
          <div
            style={{
              display: "flex",
              alignItems: "flex-start",
              gap: 8,
              padding: "10px 14px",
              borderRadius: 12,
              background: CM.accentSoft,
              border: `1px solid ${CM.borderSoft}`,
            }}
          >
            <Lightbulb size={16} color={CM.accent} strokeWidth={2} style={{ flexShrink: 0, marginTop: 1 }} />
            <span style={{ fontSize: 13, color: CM.textMid, lineHeight: 1.4 }}>
              <b style={{ color: CM.accent }}>Dica {dicaNivel}:</b> {dicaTexto}
            </span>
          </div>
        )}

        {/* ── CORPO por fase ── */}
        {(fase === "resolvendo" || fase === "feedback") && (
          <CorpoPlano
            atividade={atividade}
            plan={plan}
            pool0={pool0}
            modoOrdem={modoOrdem}
            modoIntruso={modoIntruso}
            modoPrioridade={modoPrioridade}
            limPrio={limPrio}
            editavel={fase === "resolvendo"}
            resultado={resultado}
            idsDestaque={idsDestaque}
            drag={drag}
            onTocarPool={tocarNoPool}
            onTocarPlano={tocarNoPlano}
            onFalarCartao={falar}
          />
        )}

        {(fase === "imprevisto" || fase === "feedbackImprevisto") && atividade.imprevisto && (
          <ImprevistoBloco
            imprevisto={atividade.imprevisto}
            opcoes={opcoesImprevisto}
            atividade={atividade}
            escolha={escolhaImprevisto}
            resultado={resImprevisto}
            editavel={fase === "imprevisto"}
            multi={imprevistoMulti}
            onEscolher={escolherImprevisto}
            onConfirmar={confirmarImprevisto}
            onFalar={falar}
          />
        )}

        {/* Aviso de plano incompleto */}
        {aviso && (
          <div
            role="alert"
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              padding: "10px 14px",
              borderRadius: 12,
              background: CM.warnBg,
              border: `1px solid ${CM.warnBorder}`,
              color: CM.warn,
              fontSize: 13,
              fontWeight: 600,
            }}
          >
            <AlertTriangle size={16} strokeWidth={2} style={{ flexShrink: 0 }} />
            {aviso}
          </div>
        )}

        {/* Feedback textual (spec §17) */}
        {fase === "feedback" && resultado && (
          <FeedbackBox
            estado={resultado.estado}
            atividade={atividade}
            podeTentarDeNovo={!!podeTentarDeNovo}
            onTentarDeNovo={tentarDeNovo}
            onSeguir={seguirDoFeedback}
            onFalar={falar}
          />
        )}
        {fase === "feedbackImprevisto" && resImprevisto && (
          <FeedbackImprevistoBox
            resultado={resImprevisto}
            atividade={atividade}
            onSeguir={concluirAtividade}
            onFalar={falar}
          />
        )}

        {/* Controles (spec §13) — só na fase de resolução */}
        {fase === "resolvendo" && (
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 2 }}>
            <CtrlBtn icon={<Volume2 size={15} />} label="Ouvir novamente" onClick={ouvirInstrucao} />
            {cfg.dicasHabilitadas && (
              <CtrlBtn
                icon={<Lightbulb size={15} />}
                label={dicaNivel >= 3 ? "Sem mais dicas" : "Pedir dica"}
                onClick={pedirDica}
                disabled={dicaNivel >= 3}
              />
            )}
            {cfg.permitirDesfazer && (
              <>
                <CtrlBtn icon={<Undo2 size={15} />} label="Desfazer" onClick={plan.undo} disabled={!plan.canUndo} />
                <CtrlBtn icon={<Redo2 size={15} />} label="Refazer" onClick={plan.redo} disabled={!plan.canRedo} />
              </>
            )}
            <CtrlBtn icon={<Eraser size={15} />} label="Limpar" onClick={plan.limpar} />
            <div style={{ flex: 1 }} />
            <CtrlBtn primary icon={<Check size={16} />} label="Confirmar" onClick={confirmar} />
          </div>
        )}
      </div>
    </Tela>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// CorpoPlano — 2 colunas (desktop/tablet) / 1 coluna (celular): Ações | Plano.
// No celular a ordem é Plano → Ações (spec §21) — controlado por CSS (order).
// ─────────────────────────────────────────────────────────────────────────────

function CorpoPlano({
  atividade,
  plan,
  pool0,
  modoOrdem,
  modoIntruso,
  modoPrioridade,
  limPrio,
  editavel,
  resultado,
  idsDestaque,
  drag,
  onTocarPool,
  onTocarPlano,
  onFalarCartao,
}: {
  atividade: CaminhosAtividade;
  plan: ReturnType<typeof usePlanState>;
  pool0: string[];
  modoOrdem: boolean;
  modoIntruso: boolean;
  modoPrioridade: boolean;
  limPrio: number;
  editavel: boolean;
  resultado: CaminhosResultado | null;
  idsDestaque: Set<string>;
  drag: ReturnType<typeof usePointerDrag>;
  onTocarPool: (id: string) => void;
  onTocarPlano: (id: string) => void;
  onFalarCartao: (texto: string) => void;
}) {
  const disponiveis = plan.disponiveis(pool0);
  const textoDe = (id: string) => acaoDe(atividade, id)?.texto ?? id;

  const estadoCartaoPlano = (id: string): EstadoVisual => {
    if (resultado && resultado.estado === "correta") return "ok";
    if (idsDestaque.has(id)) return "parcial";
    return "normal";
  };

  const iniciarDrag = (id: string) => (e: React.PointerEvent) => {
    if (!editavel) return;
    drag.startDrag(id, textoDe(id), e);
  };

  const keyMove = (pos: number) => (e: React.KeyboardEvent) => {
    if (!editavel) return;
    if (e.key === "ArrowUp") {
      e.preventDefault();
      plan.moverParaCima(pos);
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      plan.moverParaBaixo(pos);
    } else if (e.key === "Backspace" || e.key === "Delete") {
      e.preventDefault();
      const id = plan.snap.plano[pos];
      if (id) onTocarPlano(id);
    }
  };

  return (
    <div
      className="cm-body"
      style={{
        display: "grid",
        gap: 14,
        gridTemplateColumns: "1fr",
        alignItems: "start",
      }}
    >
      {/* injeta o layout de 2 colunas em telas largas (spec §21) */}
      <style>{`
        @media (min-width: 760px) {
          .cm-body { grid-template-columns: 1fr 1fr; }
          .cm-col-acoes { order: 1; }
          .cm-col-plano { order: 2; }
        }
        @media (max-width: 759px) {
          .cm-col-plano { order: 1; }  /* celular: Plano ANTES das Ações (spec §21) */
          .cm-col-acoes { order: 2; }
        }
      `}</style>

      {/* Coluna AÇÕES DISPONÍVEIS */}
      <div
        className="cm-col-acoes"
        data-cm-drop="pool"
        style={{
          background: CM.cardSoft,
          borderRadius: 18,
          border: `1px solid ${CM.borderSoft}`,
          padding: 14,
          minHeight: 120,
        }}
      >
        <h3 style={{ fontSize: 13, fontWeight: 800, color: CM.text, marginBottom: 10 }}>
          {modoPrioridade ? "Ações (escolha as mais importantes)" : "Ações disponíveis"}
        </h3>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {(modoPrioridade ? pool0 : disponiveis).map((id) => {
            const selecionada = modoPrioridade && plan.snap.selecionadas.includes(id);
            const est: EstadoVisual = selecionada ? "foco" : "normal";
            return (
              <Cartao
                key={id}
                texto={textoDe(id)}
                estado={editavel ? est : "desabilitado"}
                disabled={!editavel}
                ariaLabel={
                  modoPrioridade
                    ? `${textoDe(id)}. ${selecionada ? "Selecionada" : "Toque para selecionar"}`
                    : `${textoDe(id)}. Toque para adicionar ao plano`
                }
                onClick={() => onTocarPool(id)}
                onPointerDown={iniciarDrag(id)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    onTocarPool(id);
                  }
                }}
                onFalarTexto={() => onFalarCartao(textoDe(id))}
                extra={
                  selecionada ? (
                    <Check size={18} color={CM.accent} strokeWidth={2.6} style={{ flexShrink: 0 }} />
                  ) : undefined
                }
              />
            );
          })}
          {!modoPrioridade && disponiveis.length === 0 && (
            <p style={{ fontSize: 12.5, color: CM.textSoft, textAlign: "center", padding: "8px 0" }}>
              Todas as ações foram usadas.
            </p>
          )}
        </div>

        {modoPrioridade && (
          <p style={{ fontSize: 12, color: CM.textSoft, marginTop: 10 }}>
            Selecionadas: {plan.snap.selecionadas.length} de {limPrio}
          </p>
        )}
      </div>

      {/* Coluna SEU PLANO */}
      {modoOrdem && (
        <div className="cm-col-plano" style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div
            style={{
              background: CM.card,
              borderRadius: 18,
              border: `1px solid ${CM.border}`,
              boxShadow: SHADOW_CARD,
              padding: 14,
            }}
          >
            <h3 style={{ fontSize: 13, fontWeight: 800, color: CM.text, marginBottom: 10 }}>Seu plano</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {plan.snap.plano.map((id, pos) => {
                if (id == null) {
                  return (
                    <div
                      key={`slot-${pos}`}
                      data-cm-drop="slot"
                      data-cm-pos={pos}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 10,
                        minHeight: 56,
                        padding: "12px 14px",
                        borderRadius: 16,
                        background: CM.slot,
                        border: `1.5px dashed ${CM.slotBorder}`,
                        color: CM.textSoft,
                        fontSize: 13.5,
                        fontWeight: 600,
                      }}
                    >
                      <span
                        aria-hidden
                        style={{
                          width: 26,
                          height: 26,
                          borderRadius: "50%",
                          background: "rgba(120,160,205,0.18)",
                          color: CM.textSoft,
                          fontSize: 13,
                          fontWeight: 800,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        {pos + 1}
                      </span>
                      Espaço {pos + 1}
                    </div>
                  );
                }
                return (
                  <div
                    key={`filled-${pos}`}
                    data-cm-drop="slot"
                    data-cm-pos={pos}
                    style={{ display: "flex", alignItems: "stretch", gap: 8 }}
                  >
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <Cartao
                        texto={textoDe(id)}
                        ordem={pos + 1}
                        estado={editavel ? estadoCartaoPlano(id) : "desabilitado"}
                        disabled={!editavel}
                        ariaLabel={`Posição ${pos + 1}: ${textoDe(id)}. Setas para cima e para baixo movem; Backspace remove.`}
                        onClick={() => onTocarPlano(id)}
                        onPointerDown={iniciarDrag(id)}
                        onKeyDown={keyMove(pos)}
                        onFalarTexto={() => onFalarCartao(textoDe(id))}
                      />
                    </div>
                    {editavel && (
                      <div style={{ display: "flex", flexDirection: "column", gap: 4, justifyContent: "center" }}>
                        <SetaBtn
                          dir="up"
                          disabled={pos === 0}
                          onClick={() => plan.moverParaCima(pos)}
                          label={`Mover ${textoDe(id)} para cima`}
                        />
                        <SetaBtn
                          dir="down"
                          disabled={pos === plan.snap.plano.length - 1}
                          onClick={() => plan.moverParaBaixo(pos)}
                          label={`Mover ${textoDe(id)} para baixo`}
                        />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Área "Não faz parte do plano" — só quando há intrusas (spec §13) */}
          {modoIntruso && (
            <div
              data-cm-drop="discard"
              style={{
                background: CM.discard,
                borderRadius: 18,
                border: `1.5px dashed ${CM.slotBorder}`,
                padding: 14,
                minHeight: 80,
              }}
            >
              <h3 style={{ fontSize: 13, fontWeight: 800, color: CM.textMid, marginBottom: 10 }}>
                Não faz parte do plano
              </h3>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {plan.snap.descartadas.map((id) => (
                  <Cartao
                    key={`disc-${id}`}
                    texto={textoDe(id)}
                    estado={editavel ? "normal" : "desabilitado"}
                    disabled={!editavel}
                    ariaLabel={`${textoDe(id)}, descartada. Toque para devolver ao acervo.`}
                    onClick={() => plan.restaurarDescartada(id)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        plan.restaurarDescartada(id);
                      }
                    }}
                    onFalarTexto={() => onFalarCartao(textoDe(id))}
                  />
                ))}
                {plan.snap.descartadas.length === 0 && (
                  <p style={{ fontSize: 12.5, color: CM.textSoft }}>
                    Arraste (ou toque) aqui a ação que não pertence ao plano.
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function SetaBtn({
  dir,
  disabled,
  onClick,
  label,
}: {
  dir: "up" | "down";
  disabled?: boolean;
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      style={{
        width: 32,
        height: 26,
        borderRadius: 9,
        border: `1.5px solid ${disabled ? CM.borderSoft : CM.border}`,
        background: disabled ? CM.cardSoft : CM.card,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        cursor: disabled ? "default" : "pointer",
        color: disabled ? CM.textSoft : CM.accent,
        opacity: disabled ? 0.5 : 1,
      }}
    >
      {dir === "up" ? <ChevronUp size={16} strokeWidth={2.4} /> : <ChevronDown size={16} strokeWidth={2.4} />}
    </button>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// ImprevistoBloco — fase 2 dos modos 6-8 (spec §6/§10).
// ─────────────────────────────────────────────────────────────────────────────

function ImprevistoBloco({
  imprevisto,
  opcoes,
  atividade,
  escolha,
  resultado,
  editavel,
  multi,
  onEscolher,
  onConfirmar,
  onFalar,
}: {
  imprevisto: NonNullable<CaminhosAtividade["imprevisto"]>;
  opcoes: string[];
  atividade: CaminhosAtividade;
  escolha: string[];
  resultado: CaminhosResultadoImprevisto | null;
  editavel: boolean;
  multi: boolean;
  onEscolher: (id: string) => void;
  onConfirmar: () => void;
  onFalar: (texto: string) => void;
}) {
  const textoDe = (id: string) => acaoDe(atividade, id)?.texto ?? id;
  const estadoDe = (id: string): EstadoVisual => {
    const marcada = escolha.includes(id);
    if (!resultado) {
      if (marcada && editavel) return "foco";
      return editavel ? "normal" : "desabilitado";
    }
    if (!marcada) return "desabilitado";
    return resultado.correto ? "ok" : "erro";
  };
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      {/* Cartão de MUDANÇA/OBSTÁCULO */}
      <div
        style={{
          background: CM.warnBg,
          borderRadius: 18,
          border: `1.5px solid ${CM.warnBorder}`,
          padding: 16,
          display: "flex",
          alignItems: "flex-start",
          gap: 10,
        }}
      >
        <AlertTriangle size={20} color={CM.warn} strokeWidth={2} style={{ flexShrink: 0, marginTop: 2 }} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: 0.6, color: CM.warn, textTransform: "uppercase", marginBottom: 4 }}>
            O que mudou
          </div>
          <p style={{ fontSize: 15, fontWeight: 700, color: CM.ink, lineHeight: 1.35, marginBottom: 8 }}>
            {imprevisto.descricao}
          </p>
          {imprevisto.recursosDisponiveis.length > 0 && (
            <p style={{ fontSize: 13, color: CM.textMid, marginBottom: 4 }}>
              <b>Você tem:</b> {imprevisto.recursosDisponiveis.join("; ")}
            </p>
          )}
          {imprevisto.restricoes.length > 0 && (
            <p style={{ fontSize: 13, color: CM.textMid }}>
              <b>Atenção:</b> {imprevisto.restricoes.join("; ")}
            </p>
          )}
        </div>
        <button
          onClick={() =>
            onFalar(
              `${imprevisto.descricao}. ${imprevisto.recursosDisponiveis.join(". ")}. ${imprevisto.restricoes.join(
                ". "
              )}`
            )
          }
          aria-label="Ouvir o que mudou"
          style={{
            width: 34,
            height: 34,
            borderRadius: "50%",
            border: `1.5px solid ${CM.warnBorder}`,
            background: CM.card,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            flexShrink: 0,
          }}
        >
          <Volume2 size={15} color={CM.warn} strokeWidth={2} />
        </button>
      </div>

      {/* Alternativas */}
      <div
        style={{
          background: CM.card,
          borderRadius: 18,
          border: `1px solid ${CM.border}`,
          boxShadow: SHADOW_CARD,
          padding: 14,
        }}
      >
        <h3 style={{ fontSize: 13, fontWeight: 800, color: CM.text, marginBottom: 10 }}>
          O que você faz agora?
        </h3>
        {multi && (
          <p style={{ fontSize: 12.5, color: CM.textMid, marginBottom: 10 }}>
            Mais de uma coisa mudou: toque em todas as ações necessárias e depois confirme.
          </p>
        )}
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {opcoes.map((id) => (
            <Cartao
              key={`imp-${id}`}
              texto={textoDe(id)}
              estado={estadoDe(id)}
              disabled={!editavel}
              ariaLabel={`Opção: ${textoDe(id)}`}
              ariaPressed={multi ? escolha.includes(id) : undefined}
              onClick={() => onEscolher(id)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  onEscolher(id);
                }
              }}
              onFalarTexto={() => onFalar(textoDe(id))}
            />
          ))}
        </div>
        {multi && editavel && (
          <button
            onClick={onConfirmar}
            disabled={escolha.length === 0}
            style={{
              marginTop: 12,
              width: "100%",
              padding: "12px 16px",
              borderRadius: 14,
              border: "none",
              background: escolha.length === 0 ? CM.borderSoft : CM.accent,
              color: escolha.length === 0 ? CM.textMid : "#fff",
              fontSize: 15,
              fontWeight: 800,
              cursor: escolha.length === 0 ? "default" : "pointer",
            }}
          >
            Confirmar escolha
          </button>
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Feedback (spec §17)
// ─────────────────────────────────────────────────────────────────────────────

function FeedbackBox({
  estado,
  atividade,
  podeTentarDeNovo,
  onTentarDeNovo,
  onSeguir,
  onFalar,
}: {
  estado: CaminhosResultado["estado"];
  atividade: CaminhosAtividade;
  podeTentarDeNovo: boolean;
  onTentarDeNovo: () => void;
  onSeguir: () => void;
  onFalar: (texto: string) => void;
}) {
  const cor = estado === "correta" ? CM.ok : estado === "parcial" ? CM.warn : CM.err;
  const bg = estado === "correta" ? CM.okBg : estado === "parcial" ? CM.warnBg : CM.errBg;
  const borda = estado === "correta" ? CM.okBorder : estado === "parcial" ? CM.warnBorder : CM.errBorder;
  const msg =
    estado === "correta"
      ? atividade.feedback.correto
      : estado === "parcial"
      ? atividade.feedback.parcial
      : atividade.feedback.incorreto;
  const Icone = estado === "correta" ? Check : estado === "parcial" ? AlertTriangle : RotateCcw;

  return (
    <div
      style={{
        background: bg,
        borderRadius: 18,
        border: `1.5px solid ${borda}`,
        padding: 16,
        display: "flex",
        flexDirection: "column",
        gap: 12,
      }}
    >
      <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
        <Icone size={22} color={cor} strokeWidth={2.4} style={{ flexShrink: 0, marginTop: 1 }} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ fontSize: 15, fontWeight: 700, color: cor, lineHeight: 1.35, marginBottom: 4 }}>{msg}</p>
          {(estado === "correta" || !podeTentarDeNovo) && (
            <p style={{ fontSize: 13, color: CM.textMid, lineHeight: 1.4 }}>{atividade.feedback.explicacao}</p>
          )}
        </div>
        <button
          onClick={() => onFalar(`${msg}. ${estado === "correta" || !podeTentarDeNovo ? atividade.feedback.explicacao : ""}`)}
          aria-label="Ouvir o resultado"
          style={{
            width: 34,
            height: 34,
            borderRadius: "50%",
            border: `1.5px solid ${borda}`,
            background: CM.card,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            flexShrink: 0,
          }}
        >
          <Volume2 size={15} color={cor} strokeWidth={2} />
        </button>
      </div>
      <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
        {podeTentarDeNovo ? (
          <CtrlBtn primary icon={<RotateCcw size={16} />} label="Revisar e tentar de novo" onClick={onTentarDeNovo} />
        ) : (
          <CtrlBtn primary icon={<Check size={16} />} label="Continuar" onClick={onSeguir} />
        )}
      </div>
    </div>
  );
}

function FeedbackImprevistoBox({
  resultado,
  atividade,
  onSeguir,
  onFalar,
}: {
  resultado: CaminhosResultadoImprevisto;
  atividade: CaminhosAtividade;
  onSeguir: () => void;
  onFalar: (texto: string) => void;
}) {
  const cor = resultado.correto ? CM.ok : CM.err;
  const bg = resultado.correto ? CM.okBg : CM.errBg;
  const borda = resultado.correto ? CM.okBorder : CM.errBorder;
  const msg = resultado.correto ? atividade.imprevisto?.explicacao ?? resultado.detalhe : resultado.detalhe;
  const Icone = resultado.correto ? Check : RotateCcw;
  return (
    <div
      style={{
        background: bg,
        borderRadius: 18,
        border: `1.5px solid ${borda}`,
        padding: 16,
        display: "flex",
        flexDirection: "column",
        gap: 12,
      }}
    >
      <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
        <Icone size={22} color={cor} strokeWidth={2.4} style={{ flexShrink: 0, marginTop: 1 }} />
        <p style={{ flex: 1, fontSize: 15, fontWeight: 700, color: cor, lineHeight: 1.35 }}>{msg}</p>
        <button
          onClick={() => onFalar(msg)}
          aria-label="Ouvir o resultado"
          style={{
            width: 34,
            height: 34,
            borderRadius: "50%",
            border: `1.5px solid ${borda}`,
            background: CM.card,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            flexShrink: 0,
          }}
        >
          <Volume2 size={15} color={cor} strokeWidth={2} />
        </button>
      </div>
      <div style={{ display: "flex", justifyContent: "flex-end" }}>
        <CtrlBtn primary icon={<Check size={16} />} label="Continuar" onClick={onSeguir} />
      </div>
    </div>
  );
}
