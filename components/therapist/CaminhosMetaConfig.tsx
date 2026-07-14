"use client";

// ─────────────────────────────────────────────────────────────────────────────
// Painel de configuração do "Caminhos para a Meta" (exerciseId antes-depois) na
// prescrição do terapeuta (spec §7, §12). Catálogo com busca/filtros + preview +
// seleção/sequência + opções da sessão. Persiste no mesmo mecanismo do plano
// (exerciseSettings["antes-depois"] via onSetting), com as CHAVES EXATAS que a
// tela do paciente consome (settings.ts / normalizeCaminhosSettings).
//
// Etapa 1: 3 atividades [EXEMPLO]; estruturado para escalar às 90 (lê do array).
// ─────────────────────────────────────────────────────────────────────────────

import { useMemo, useState } from "react";
import { Search, ChevronDown, ChevronUp, X, Check, Info } from "lucide-react";
import { CAMINHOS_ATIVIDADES } from "@/data/caminhos-meta-atividades";
import { DEFAULT_CAMINHOS_SETTINGS } from "@/components/exercises/executive/caminhos-meta/settings";
import type {
  CaminhosAtividade,
  CaminhosBiblioteca,
  CaminhosCategoria,
  CaminhosModo,
  CaminhosNivel,
} from "@/types/caminhos-meta";

// ── Rótulos (pt-BR) — apenas painel do terapeuta (spec §3, §6, §11) ──────────
const BIBLIOTECA_LABEL: Record<CaminhosBiblioteca, string> = {
  criancas: "Crianças",
  adolescentes: "Adolescentes",
  adultos_idosos: "Adultos e idosos",
};
const MODO_LABEL: Record<CaminhosModo, string> = {
  ordenar: "Organizar etapas",
  intruso: "Ação desnecessária",
  prioridade: "Prioridades",
  completar: "Completar o plano",
  corrigir: "Corrigir a ordem",
  reorganizar: "Reorganizar após mudança",
  problema: "Resolver imprevisto",
  plano_alternativo: "Plano alternativo",
};
const CATEGORIA_LABEL: Record<CaminhosCategoria, string> = {
  rotina: "Rotina",
  escola: "Escola",
  comunidade: "Comunidade",
  trabalho: "Trabalho",
  organizacao: "Organização",
  planejamento: "Planejamento",
  autonomia: "Autonomia",
};
const ACAO_TIPO_LABEL: Record<CaminhosAtividade["acoes"][number]["tipo"], string> = {
  obrigatoria: "Obrigatória",
  opcional: "Opcional",
  desnecessaria: "Desnecessária",
  substituta: "Substituta",
};

const ALL_BIBLIOTECAS: CaminhosBiblioteca[] = ["criancas", "adolescentes", "adultos_idosos"];
const ALL_NIVEIS: CaminhosNivel[] = [1, 2, 3, 4, 5, 6, 7, 8];

/** Config atual da prescrição (subconjunto conhecido de exerciseSettings). */
type Cfg = Record<string, unknown>;

interface CaminhosMetaConfigProps {
  /** Config atual do exercício (exerciseSettings["antes-depois"]). */
  cfg?: Cfg;
  /** Setter genérico do plano: grava exerciseSettings[id][key] = value. */
  onSetting: (id: string, key: string, value: unknown) => void;
}

const EX_ID = "antes-depois";

// Filtros locais (não persistem — só organizam o catálogo).
type ModoFiltro = CaminhosModo | "todos";
type BibFiltro = CaminhosBiblioteca | "todas";
type NivelFiltro = CaminhosNivel | "todos";
type CatFiltro = CaminhosCategoria | "todas";

export function CaminhosMetaConfig({ cfg, onSetting }: CaminhosMetaConfigProps) {
  const atividades = CAMINHOS_ATIVIDADES;

  // ── Settings atuais (com defaults) ──
  const d = DEFAULT_CAMINHOS_SETTINGS;
  const selecionadas = (Array.isArray(cfg?.atividadesSelecionadas)
    ? (cfg!.atividadesSelecionadas as unknown[]).filter((x): x is string => typeof x === "string")
    : []) as string[];
  const rodadas = typeof cfg?.rodadas === "number" ? (cfg!.rodadas as number) : d.rodadas;
  const maxTentativas = typeof cfg?.maxTentativas === "number" ? (cfg!.maxTentativas as number) : d.maxTentativas;
  const dicasHabilitadas = typeof cfg?.dicasHabilitadas === "boolean" ? (cfg!.dicasHabilitadas as boolean) : d.dicasHabilitadas;
  const audioHabilitado = typeof cfg?.audioHabilitado === "boolean" ? (cfg!.audioHabilitado as boolean) : d.audioHabilitado;
  const permitirDesfazer = typeof cfg?.permitirDesfazer === "boolean" ? (cfg!.permitirDesfazer as boolean) : d.permitirDesfazer;
  const feedbackImediato = typeof cfg?.feedbackImediato === "boolean" ? (cfg!.feedbackImediato as boolean) : d.feedbackImediato;
  const ordemFixa = typeof cfg?.ordemFixa === "boolean" ? (cfg!.ordemFixa as boolean) : d.ordemFixa;

  // ── Filtros do catálogo ──
  const [query, setQuery] = useState("");
  const [fBib, setFBib] = useState<BibFiltro>("todas");
  const [fNivel, setFNivel] = useState<NivelFiltro>("todos");
  const [fModo, setFModo] = useState<ModoFiltro>("todos");
  const [fCat, setFCat] = useState<CatFiltro>("todas");
  const [expandida, setExpandida] = useState<string | null>(null);

  const categoriasPresentes = useMemo(
    () => Array.from(new Set(atividades.map((a) => a.categoria))),
    [atividades]
  );
  const modosPresentes = useMemo(
    () => Array.from(new Set(atividades.map((a) => a.modo))),
    [atividades]
  );

  const filtradas = useMemo(() => {
    const q = query.trim().toLowerCase();
    return atividades.filter((a) => {
      if (fBib !== "todas" && a.biblioteca !== fBib) return false;
      if (fNivel !== "todos" && a.nivel !== fNivel) return false;
      if (fModo !== "todos" && a.modo !== fModo) return false;
      if (fCat !== "todas" && a.categoria !== fCat) return false;
      if (q) {
        const hay = `${a.titulo} ${a.meta} ${a.instrucao} ${a.habilidades.join(" ")}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [atividades, query, fBib, fNivel, fModo, fCat]);

  // Atividades selecionadas, na ordem salva (para a coluna "sequência").
  const byId = useMemo(() => new Map(atividades.map((a) => [a.id, a])), [atividades]);
  const sequencia = selecionadas.map((id) => byId.get(id)).filter((a): a is CaminhosAtividade => !!a);

  // ── Mutadores de settings (chaves EXATAS do settings.ts do paciente) ──
  function setSel(ids: string[]) {
    onSetting(EX_ID, "atividadesSelecionadas", ids);
  }
  function toggleAtividade(id: string) {
    setSel(selecionadas.includes(id) ? selecionadas.filter((x) => x !== id) : [...selecionadas, id]);
  }
  function moverSequencia(id: string, dir: -1 | 1) {
    const idx = selecionadas.indexOf(id);
    const swap = idx + dir;
    if (idx < 0 || swap < 0 || swap >= selecionadas.length) return;
    const next = [...selecionadas];
    [next[idx], next[swap]] = [next[swap], next[idx]];
    setSel(next);
  }

  // ── Pills reutilizáveis ──
  const Pill = ({ on, onClick, children }: { on: boolean; onClick: () => void; children: React.ReactNode }) => (
    <button
      type="button"
      onClick={onClick}
      className={`px-2.5 py-1 rounded-md text-xs font-semibold border transition-colors ${
        on ? "bg-blue-600 text-white border-blue-600" : "bg-white/5 text-slate-300 border-white/20 hover:border-white/40"
      }`}
    >
      {children}
    </button>
  );

  const Badge = ({ children }: { children: React.ReactNode }) => (
    <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-white/10 text-slate-300">{children}</span>
  );

  return (
    <div className="space-y-4 text-left">
      {/* ── Catálogo: busca + filtros ── */}
      <section className="space-y-2.5">
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar por título, meta ou habilidade…"
            className="w-full pl-8 pr-3 py-2 rounded-lg border border-white/15 bg-white/5 text-slate-100 text-sm placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400"
          />
        </div>

        <div className="flex flex-wrap gap-1.5">
          <Pill on={fBib === "todas"} onClick={() => setFBib("todas")}>Todas</Pill>
          {ALL_BIBLIOTECAS.map((b) => (
            <Pill key={b} on={fBib === b} onClick={() => setFBib(b)}>{BIBLIOTECA_LABEL[b]}</Pill>
          ))}
        </div>
        <div className="flex flex-wrap gap-1.5">
          <Pill on={fNivel === "todos"} onClick={() => setFNivel("todos")}>Nível: todos</Pill>
          {ALL_NIVEIS.map((n) => (
            <Pill key={n} on={fNivel === n} onClick={() => setFNivel(n)}>{n}</Pill>
          ))}
        </div>
        <div className="flex flex-wrap gap-1.5">
          <Pill on={fModo === "todos"} onClick={() => setFModo("todos")}>Modo: todos</Pill>
          {modosPresentes.map((m) => (
            <Pill key={m} on={fModo === m} onClick={() => setFModo(m)}>{MODO_LABEL[m]}</Pill>
          ))}
        </div>
        <div className="flex flex-wrap gap-1.5">
          <Pill on={fCat === "todas"} onClick={() => setFCat("todas")}>Categoria: todas</Pill>
          {categoriasPresentes.map((c) => (
            <Pill key={c} on={fCat === c} onClick={() => setFCat(c)}>{CATEGORIA_LABEL[c]}</Pill>
          ))}
        </div>
      </section>

      {/* ── Lista de atividades ── */}
      <section className="space-y-2">
        <p className="text-[11px] font-bold uppercase tracking-wide text-slate-400">
          Atividades ({filtradas.length})
        </p>
        {filtradas.length === 0 ? (
          <p className="text-sm text-slate-400 py-4 text-center">Nenhuma atividade com esses filtros.</p>
        ) : (
          <ul className="space-y-2">
            {filtradas.map((a) => {
              const sel = selecionadas.includes(a.id);
              const aberta = expandida === a.id;
              const nAcoes = a.acoes.length;
              const temIntrusa = a.correcao.acoesDesnecessarias.length > 0;
              const temImprevisto = !!a.imprevisto?.ativo;
              const temMudanca = a.modo === "reorganizar" || a.modo === "problema" || a.modo === "plano_alternativo";
              const ordensAlt = a.correcao.ordensAlternativasAceitas.length > 0;
              return (
                <li key={a.id} className={`rounded-xl border transition-colors ${sel ? "border-blue-400/50 bg-blue-500/10" : "border-white/10 bg-[#07162D] hover:border-white/20"}`}>
                  <div className="flex items-start gap-2.5 p-2.5">
                    <button
                      type="button"
                      onClick={() => toggleAtividade(a.id)}
                      aria-label={sel ? `Remover ${a.titulo}` : `Adicionar ${a.titulo}`}
                      className={`mt-0.5 flex items-center justify-center w-6 h-6 rounded-md border shrink-0 transition-colors ${
                        sel ? "bg-blue-600 border-blue-600 text-white" : "border-white/25 text-transparent hover:border-white/50"
                      }`}
                    >
                      <Check className="w-4 h-4" />
                    </button>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-slate-100">{a.titulo}</p>
                      <div className="flex flex-wrap items-center gap-1 mt-1">
                        <Badge>{BIBLIOTECA_LABEL[a.biblioteca]}</Badge>
                        <Badge>{CATEGORIA_LABEL[a.categoria]}</Badge>
                        <Badge>Nível {a.nivel}</Badge>
                        <Badge>{MODO_LABEL[a.modo]}</Badge>
                        <Badge>{nAcoes} ações</Badge>
                        <Badge>~{a.duracaoEstimadaMin} min</Badge>
                        {temIntrusa && <Badge>Com intrusa</Badge>}
                        {temImprevisto && <Badge>Com imprevisto</Badge>}
                        {temMudanca && <Badge>Com mudança</Badge>}
                        <Badge>{a.correcao.tipo === "ordem_exata" ? "Ordem exata" : "Por dependências"}</Badge>
                        {ordensAlt && <Badge>Ordens alternativas</Badge>}
                      </div>
                      {a.habilidades.length > 0 && (
                        <p className="text-[11px] text-slate-400 mt-1">Habilidades: {a.habilidades.join(", ")}</p>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => setExpandida(aberta ? null : a.id)}
                      aria-label={aberta ? "Recolher preview" : "Ver preview"}
                      className="flex items-center gap-1 px-2 h-7 rounded-lg border border-white/15 text-slate-400 hover:text-slate-200 hover:bg-white/10 text-xs shrink-0"
                    >
                      <Info className="w-3.5 h-3.5" />
                      {aberta ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                    </button>
                  </div>

                  {/* Preview (read-only) */}
                  {aberta && (
                    <div className="px-3 pb-3 pt-1 border-t border-white/10 space-y-2 text-xs">
                      <div>
                        <span className="font-bold text-slate-400">Meta: </span>
                        <span className="text-slate-200">{a.meta}</span>
                      </div>
                      <div>
                        <span className="font-bold text-slate-400">Instrução: </span>
                        <span className="text-slate-200">{a.instrucao}</span>
                      </div>
                      {a.contexto && (
                        <div>
                          <span className="font-bold text-slate-400">Contexto: </span>
                          <span className="text-slate-200">{a.contexto}</span>
                        </div>
                      )}
                      <div>
                        <p className="font-bold text-slate-400 mb-1">Ações:</p>
                        <ul className="space-y-1">
                          {a.acoes.map((ac) => (
                            <li key={ac.id} className="flex items-center gap-2">
                              <span className="text-slate-500">•</span>
                              <span className="text-slate-200">{ac.texto}</span>
                              <Badge>{ACAO_TIPO_LABEL[ac.tipo]}</Badge>
                            </li>
                          ))}
                        </ul>
                      </div>
                      {a.imprevisto?.ativo && (
                        <div className="rounded-lg bg-white/5 p-2">
                          <p className="font-bold text-slate-400 mb-0.5">Imprevisto</p>
                          <p className="text-slate-200">{a.imprevisto.descricao}</p>
                        </div>
                      )}
                      <div>
                        <p className="font-bold text-slate-400 mb-1">Dicas (3 níveis):</p>
                        <ul className="space-y-0.5">
                          {a.dicas.map((di) => (
                            <li key={di.nivel} className="text-slate-200">
                              <span className="text-slate-500">{di.nivel}.</span> {di.texto}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <p className="font-bold text-slate-400 mb-1">Feedbacks:</p>
                        <p className="text-slate-200"><span className="text-emerald-400">Correto:</span> {a.feedback.correto}</p>
                        <p className="text-slate-200"><span className="text-amber-400">Parcial:</span> {a.feedback.parcial}</p>
                        <p className="text-slate-200"><span className="text-rose-400">Incorreto:</span> {a.feedback.incorreto}</p>
                      </div>
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </section>

      {/* ── Sequência selecionada (ordenar) ── */}
      <section className="space-y-2">
        <p className="text-[11px] font-bold uppercase tracking-wide text-slate-400">
          Sequência do treino ({sequencia.length})
        </p>
        {sequencia.length === 0 ? (
          <p className="text-sm text-slate-400">Marque atividades acima (de qualquer biblioteca) para montar a sequência.</p>
        ) : (
          <ol className="space-y-1.5">
            {sequencia.map((a, i) => (
              <li key={a.id} className="flex items-center gap-2 rounded-lg border border-white/10 bg-[#07162D] p-2">
                <span className="text-xs font-bold tabular-nums text-slate-400 w-5 text-center shrink-0">{i + 1}</span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-slate-100 truncate">{a.titulo}</p>
                  <p className="text-[11px] text-slate-400">{BIBLIOTECA_LABEL[a.biblioteca]} · Nível {a.nivel} · {MODO_LABEL[a.modo]}</p>
                </div>
                <div className="flex flex-col shrink-0">
                  <button type="button" onClick={() => moverSequencia(a.id, -1)} disabled={i === 0}
                    aria-label="Subir na sequência"
                    className="text-slate-500 hover:text-blue-300 disabled:opacity-30 transition-colors">
                    <ChevronUp className="w-4 h-4" />
                  </button>
                  <button type="button" onClick={() => moverSequencia(a.id, 1)} disabled={i === sequencia.length - 1}
                    aria-label="Descer na sequência"
                    className="text-slate-500 hover:text-blue-300 disabled:opacity-30 transition-colors">
                    <ChevronDown className="w-4 h-4" />
                  </button>
                </div>
                <button type="button" onClick={() => toggleAtividade(a.id)}
                  aria-label={`Remover ${a.titulo} da sequência`}
                  className="flex items-center justify-center w-7 h-7 rounded-lg border border-white/15 text-slate-400 hover:text-red-400 hover:border-red-400/40 transition-colors shrink-0">
                  <X className="w-4 h-4" />
                </button>
              </li>
            ))}
          </ol>
        )}
      </section>

      {/* ── Opções da sessão (settings — chaves EXATAS do settings.ts) ── */}
      <section className="space-y-2.5 pt-1 border-t border-white/10">
        <p className="text-[11px] font-bold uppercase tracking-wide text-slate-400 pt-2">Opções da sessão</p>

        <div className="grid grid-cols-2 gap-2">
          <label className="block">
            <span className="text-[11px] font-semibold text-slate-400">Rodadas por atividade</span>
            <input type="number" min={1} max={5} value={rodadas}
              onChange={(e) => onSetting(EX_ID, "rodadas", Math.max(1, Math.floor(Number(e.target.value) || 1)))}
              className="mt-1 w-full px-2.5 py-1.5 rounded-lg border border-white/15 bg-white/5 text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400" />
          </label>
          <label className="block">
            <span className="text-[11px] font-semibold text-slate-400">Máx. de tentativas</span>
            <input type="number" min={1} max={5} value={maxTentativas}
              onChange={(e) => onSetting(EX_ID, "maxTentativas", Math.max(1, Math.floor(Number(e.target.value) || 1)))}
              className="mt-1 w-full px-2.5 py-1.5 rounded-lg border border-white/15 bg-white/5 text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400" />
          </label>
        </div>

        <div className="flex items-center justify-between gap-2">
          <span className="text-xs text-slate-300">Ordem das atividades</span>
          <div className="flex gap-1.5">
            <Pill on={ordemFixa} onClick={() => onSetting(EX_ID, "ordemFixa", true)}>Fixa</Pill>
            <Pill on={!ordemFixa} onClick={() => onSetting(EX_ID, "ordemFixa", false)}>Aleatória</Pill>
          </div>
        </div>
        <div className="flex items-center justify-between gap-2">
          <span className="text-xs text-slate-300">Dicas</span>
          <div className="flex gap-1.5">
            <Pill on={dicasHabilitadas} onClick={() => onSetting(EX_ID, "dicasHabilitadas", true)}>Ligadas</Pill>
            <Pill on={!dicasHabilitadas} onClick={() => onSetting(EX_ID, "dicasHabilitadas", false)}>Desligadas</Pill>
          </div>
        </div>
        <div className="flex items-center justify-between gap-2">
          <span className="text-xs text-slate-300">Áudio</span>
          <div className="flex gap-1.5">
            <Pill on={audioHabilitado} onClick={() => onSetting(EX_ID, "audioHabilitado", true)}>Ligado</Pill>
            <Pill on={!audioHabilitado} onClick={() => onSetting(EX_ID, "audioHabilitado", false)}>Desligado</Pill>
          </div>
        </div>
        <div className="flex items-center justify-between gap-2">
          <span className="text-xs text-slate-300">Permitir desfazer</span>
          <div className="flex gap-1.5">
            <Pill on={permitirDesfazer} onClick={() => onSetting(EX_ID, "permitirDesfazer", true)}>Sim</Pill>
            <Pill on={!permitirDesfazer} onClick={() => onSetting(EX_ID, "permitirDesfazer", false)}>Não</Pill>
          </div>
        </div>
        <div className="flex items-center justify-between gap-2">
          <span className="text-xs text-slate-300">Feedback</span>
          <div className="flex gap-1.5">
            <Pill on={feedbackImediato} onClick={() => onSetting(EX_ID, "feedbackImediato", true)}>Imediato</Pill>
            <Pill on={!feedbackImediato} onClick={() => onSetting(EX_ID, "feedbackImediato", false)}>Ao final</Pill>
          </div>
        </div>
        <p className="text-[11px] text-slate-400">
          Estas opções e a sequência escolhida são enviadas ao paciente junto com o plano. Cada rodada pode repetir as atividades da sequência.
        </p>
      </section>
    </div>
  );
}
