import { Info } from "lucide-react";
import {
  PRESENTATION_TEXTS,
  type PlanPresentation,
  type PresentedAlert,
  type VisualSeverity,
} from "@/lib/prescription/presentation";

const stateClasses: Readonly<Record<PlanPresentation["state"], string>> = {
  ABAIXO: "border-slate-400/25 bg-slate-400/10 text-slate-300",
  DENTRO: "border-emerald-400/25 bg-emerald-400/10 text-emerald-300",
  ACIMA: "border-amber-400/30 bg-amber-400/10 text-amber-200",
  EXCESSO_IMPORTANTE: "border-orange-400/40 bg-orange-400/15 text-orange-200 font-semibold",
};

const groupInfo: Readonly<Record<VisualSeverity, { label: string; classes: string }>> = {
  revisao_plano: {
    label: "Revisão do plano",
    classes: "border-orange-400/25 bg-orange-400/10",
  },
  observacao_clinica: {
    label: "Observações clínicas",
    classes: "border-amber-400/20 bg-amber-400/5",
  },
  informacao: {
    label: "Informações",
    classes: "border-blue-400/20 bg-blue-400/5",
  },
};

function occurrenceLabel(alert: PresentedAlert): string {
  if (alert.code === "OUTSIDE_BEST_POSITION") return "Ver atividades e posições recomendadas";
  if (["HIGH_FATIGUE_ADJACENT", "HIGH_INTERFERENCE_ADJACENT", "PLANNING_WINDOW_ADJACENT"].includes(alert.code)) {
    return "Ver sequências";
  }
  return "Ver pares relacionados";
}

function AlertArticle({ alert }: { alert: PresentedAlert }) {
  return (
    <article className="text-xs">
      <p className="font-semibold text-slate-100">{alert.titulo}</p>
      <p className="mt-0.5 leading-relaxed text-slate-300">{alert.mensagem}</p>
      {!alert.ocorrencias && alert.exercicios.length > 0 && (
        <p className="mt-1 text-slate-400">Exercícios: {alert.exercicios.join(" · ")}</p>
      )}
      {alert.sugestao && <p className="mt-1 leading-relaxed text-slate-400">Sugestão: {alert.sugestao}</p>}
      {alert.ocorrencias && (
        <details className="mt-2 rounded-lg border border-white/10 px-2.5 py-2 text-slate-400">
          <summary className="cursor-pointer font-medium text-slate-300">{occurrenceLabel(alert)}</summary>
          <div className="mt-2 space-y-2 border-t border-white/10 pt-2">
            {alert.ocorrencias.map((occurrence, occurrenceIndex) => (
              <div key={`${occurrence.exercicios.join("-")}-${occurrenceIndex}`}>
                {occurrence.exercicios.length > 0 && (
                  <p className="font-medium text-slate-300">{occurrence.exercicios.join(" · ")}</p>
                )}
                <p className="leading-relaxed">{occurrence.mensagem}</p>
              </div>
            ))}
          </div>
        </details>
      )}
    </article>
  );
}

export function PrescriptionSummary({ presentation }: { presentation: PlanPresentation }) {
  return (
    <div className="space-y-3">
      <div className="rounded-xl bg-white/5 px-3.5 py-3 space-y-2">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs text-slate-400">{presentation.prescribedLabel}</p>
            <p className="text-base font-bold text-slate-100 tabular-nums" title={PRESENTATION_TEXTS.estimateTooltip}>
              {presentation.estimateLabel}
            </p>
          </div>
          <span className={`rounded-full border px-2.5 py-1 text-[11px] ${stateClasses[presentation.state]}`}>
            {presentation.stateLabel}
          </span>
        </div>

        <div title={PRESENTATION_TEXTS.loadTooltip}>
          <p className="text-xs font-medium text-slate-200">{presentation.loadText}</p>
          <p className="mt-0.5 text-[11px] leading-snug text-slate-500">{presentation.loadHelper}</p>
        </div>

        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="rounded-lg border border-white/10 px-2.5 py-2">
            <p className="text-slate-500">Fadiga</p>
            <p className="mt-0.5 text-slate-300">{presentation.fatigueText}</p>
          </div>
          <div className="rounded-lg border border-white/10 px-2.5 py-2">
            <p className="text-slate-500">Interferência</p>
            <p className="mt-0.5 text-slate-300">{presentation.interferenceText}</p>
          </div>
        </div>

        {presentation.legacyMarker && (
          <p className="flex items-center gap-1.5 text-[11px] text-slate-500" title={presentation.legacyMarker.tooltip}>
            <Info className="h-3 w-3 shrink-0" />
            {presentation.legacyMarker.label}
          </p>
        )}
      </div>

      {presentation.empty ? (
        <p className="rounded-xl border border-dashed border-white/15 px-3 py-3 text-xs leading-relaxed text-slate-400">
          {presentation.emptyGuidance}
        </p>
      ) : (
        <div className="space-y-2" title={PRESENTATION_TEXTS.alertsTooltip}>
          {(["revisao_plano", "observacao_clinica", "informacao"] as const).map((severity) => {
            const alerts = presentation.alertGroups[severity];
            if (alerts.length === 0) return null;
            const info = groupInfo[severity];
            return (
              <section key={severity} className={`rounded-xl border p-3 ${info.classes}`}>
                <h4 className="text-[11px] font-bold uppercase tracking-wide text-slate-300">{info.label}</h4>
                <div className="mt-2 space-y-3">
                  {(severity === "observacao_clinica" ? alerts.slice(0, 3) : alerts).map((alert, index) => (
                    <AlertArticle key={`${alert.code}-${index}`} alert={alert} />
                  ))}
                  {severity === "observacao_clinica" && alerts.length > 3 && (
                    <details className="rounded-lg border border-white/10 px-2.5 py-2">
                      <summary className="cursor-pointer text-xs font-semibold text-slate-200">
                        Ver todas as observações
                      </summary>
                      <div className="mt-3 space-y-3 border-t border-white/10 pt-3">
                        {alerts.slice(3).map((alert, index) => (
                          <AlertArticle key={`${alert.code}-extra-${index}`} alert={alert} />
                        ))}
                      </div>
                    </details>
                  )}
                </div>
              </section>
            );
          })}
        </div>
      )}
    </div>
  );
}
