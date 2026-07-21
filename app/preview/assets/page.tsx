"use client";

// ─────────────────────────────────────────────────────────────────────────────
// Pré-visualização da Biblioteca de Assets (Etapa 4). Rota pública (sem login):
// /preview/assets. Mostra a estrutura, as contagens planejadas e renderiza cada
// asset por ID — a imagem real aparece assim que for gerada (senão, um placeholder).
// Não altera nenhum exercício; é uma tela de inspeção/QA da infraestrutura.
// ─────────────────────────────────────────────────────────────────────────────

import { useMemo } from "react";
import { AssetImage } from "@/components/assets/AssetImage";
import { assetService } from "@/data/assets";
import { LIBRARY_OVERVIEW, TOTAL_PLANNED, ART_DIRECTION_SUMMARY } from "@/lib/assets/catalog";

export default function AssetsPreviewPage() {
  const stats = useMemo(() => assetService.stats(), []);

  return (
    <div className="min-h-screen text-white" style={{ background: "linear-gradient(160deg,#0a1628 0%,#0d2244 55%,#081020 100%)" }}>
      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* Cabeçalho */}
        <h1 className="text-2xl font-black">🎨 Biblioteca de Assets</h1>
        <p className="text-white/70 text-sm mt-1">
          Pré-visualização da Etapa 4. <b>{TOTAL_PLANNED.toLocaleString("pt-BR")}</b> imagens planejadas.
          As imagens reais aparecem aqui conforme forem geradas.
        </p>

        {/* Status do índice */}
        <div className="mt-4 rounded-2xl p-4 flex flex-wrap gap-x-6 gap-y-1 text-sm"
          style={{ background: "rgba(255,255,255,0.06)", border: "1.5px solid rgba(255,255,255,0.14)" }}>
          <span><b className="text-cyan-300">{stats.total}</b> asset(s) no índice</span>
          {Object.entries(stats.byKind).map(([k, n]) => (
            <span key={k} className="text-white/70">{k}: <b className="text-white">{n}</b></span>
          ))}
          {stats.total === 0 && <span className="text-amber-300">índice vazio — gere as imagens e rode <code>npm run assets:manifest</code></span>}
        </div>

        {/* Direção de arte */}
        <div className="mt-3 rounded-2xl p-4"
          style={{ background: "rgba(255,255,255,0.06)", border: "1.5px solid rgba(255,255,255,0.14)" }}>
          <p className="text-[11px] font-bold uppercase tracking-wide text-white/60 mb-2">Direção de Arte</p>
          <div className="flex flex-wrap gap-2">
            {ART_DIRECTION_SUMMARY.map((t) => (
              <span key={t} className="text-xs px-2.5 py-1 rounded-full"
                style={{ background: "rgba(8,145,178,0.18)", border: "1px solid rgba(8,145,178,0.4)" }}>{t}</span>
            ))}
          </div>
        </div>

        {/* Categorias */}
        {LIBRARY_OVERVIEW.map((cat) => (
          <section key={cat.key} className="mt-7">
            <div className="flex items-baseline justify-between gap-3 mb-2">
              <h2 className="text-lg font-bold">{cat.label}</h2>
              <span className="text-xs text-white/60 font-semibold">{cat.planned.toLocaleString("pt-BR")} planejados</span>
            </div>
            {cat.note && <p className="text-xs text-white/50 mb-3">{cat.note}</p>}
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
              {cat.samples.map((s) => (
                <div key={s.id} className="flex flex-col items-center gap-1.5">
                  <AssetImage
                    id={s.id}
                    alt={s.label}
                    width="100%"
                    height={92}
                    style={{ background: "rgba(255,255,255,0.04)", borderRadius: 14, border: "1px solid rgba(255,255,255,0.10)" }}
                  />
                  <span className="text-[11px] text-white/70 text-center leading-tight">{s.label}</span>
                </div>
              ))}
            </div>
          </section>
        ))}

        <p className="text-xs text-white/40 mt-10 pb-8">
          Tela de inspeção da infraestrutura · rota pública · não faz parte dos exercícios.
        </p>
      </div>
    </div>
  );
}
