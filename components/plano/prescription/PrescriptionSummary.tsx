import { ChevronDown, Info } from "lucide-react";
import {
  PRESENTATION_TEXTS,
  limitAlertGroup,
  type PlanPresentation,
  type PresentedAlert,
  type VisualSeverity,
} from "@/lib/prescription/presentation";

const stateClasses: Readonly<Record<PlanPresentation["state"], string>> = {
  ABAIXO: "text-amber-200",
  DENTRO: "text-slate-400",
  ACIMA: "text-amber-200",
  EXCESSO_IMPORTANTE: "text-orange-200 font-semibold",
};

const groupInfo: Readonly<Record<VisualSeverity, { label: string; classes: string }>> = {
  revisao_plano: {
    label: "Revisão do plano",
    classes: "border-orange-400/25 bg-orange-400/[0.07]",
  },
  observacao_clinica: {
    label: "Observações clínicas",
    classes: "border-amber-400/20 bg-amber-400/[0.04]",
  },
  informacao: {
    label: "Informações",
    classes: "border-blue-400/20 bg-blue-400/[0.04]",
  },
};

function AlertArticle({ alert }: { alert: PresentedAlert }) {
  const category = groupInfo[alert.gravidadeVisual].label;

  return (
    <details className="group rounded-xl border border-white/10 bg-[#07162D]/70 open:border-white/20">
      <summary className="cursor-pointer list-none px-3.5 py-3.5 marker:content-none">
        <span className="block text-base font-semibold leading-snug text-slate-100">{alert.titulo}</span>
        <span className="mt-1.5 block text-sm leading-relaxed text-slate-300">{alert.mensagem}</span>
        {alert.sugestao && (
          <span className="mt-1.5 block text-sm italic leading-relaxed text-slate-400">{alert.sugestao}</span>
        )}
        {alert.dadoPrincipal && (
          <span className="mt-2 block text-lg font-bold leading-tight text-white tabular-nums">
            {alert.dadoPrincipal}
          </span>
        )}
        <span className="mt-3 flex items-center justify-between gap-3">
          <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-xs font-medium text-slate-300">
            {category}
          </span>
          <span className="flex items-center gap-1.5 text-sm font-semibold text-blue-300 group-hover:text-blue-200">
            {alert.expansionLabel}
            <ChevronDown className="h-4 w-4 transition-transform group-open:rotate-180" />
          </span>
        </span>
      </summary>

      <div className="space-y-3 border-t border-white/10 px-3.5 py-3.5 text-sm leading-relaxed text-slate-300">
        {alert.exercicios.length > 0 && (
          <div>
            <p className="font-semibold text-slate-100">Exercícios envolvidos</p>
            <ul className="mt-1.5 list-disc space-y-1 pl-5">
              {alert.exercicios.map((exercise) => <li key={exercise}>{exercise}</li>)}
            </ul>
          </div>
        )}
        {alert.ocorrencias && (
          <div>
            <p className="font-semibold text-slate-100">Detalhes ({alert.occurrenceCount})</p>
            <ol className="mt-2 space-y-3">
              {alert.ocorrencias.map((occurrence, occurrenceIndex) => (
                <li
                  key={`${occurrence.exercicios.join("-")}-${occurrenceIndex}`}
                  className="rounded-lg border border-white/10 bg-white/[0.03] p-3"
                >
                  <p className="font-medium text-slate-200">Aspecto {occurrenceIndex + 1}</p>
                  {occurrence.exercicios.length > 0 && (
                    <p className="mt-1 text-slate-300">{occurrence.exercicios.join(" · ")}</p>
                  )}
                  <p className="mt-1 text-slate-400">{occurrence.mensagem}</p>
                  {occurrence.sugestao && <p className="mt-1 text-slate-400">Sugestão: {occurrence.sugestao}</p>}
                </li>
              ))}
            </ol>
          </div>
        )}
      </div>
    </details>
  );
}

function EmptyGroup() {
  return <p className="text-sm text-slate-400">Nada a revisar aqui.</p>;
}

function LimitedGroup({
  severity,
  alerts,
}: {
  severity: "revisao_plano" | "observacao_clinica";
  alerts: readonly PresentedAlert[];
}) {
  const info = groupInfo[severity];
  const limited = limitAlertGroup(alerts, severity);
  const hiddenNoun = severity === "revisao_plano"
    ? limited.hiddenCount === 1 ? "revisão" : "revisões"
    : limited.hiddenCount === 1 ? "observação" : "observações";

  return (
    <section className={`rounded-2xl border p-3.5 ${info.classes}`} aria-labelledby={`alert-group-${severity}`}>
      <h4 id={`alert-group-${severity}`} className="text-sm font-bold uppercase tracking-wide text-slate-200">
        {info.label}
      </h4>
      <div className="mt-3 space-y-2.5">
        {alerts.length === 0 ? <EmptyGroup /> : limited.initial.map((alert, index) => (
          <AlertArticle key={`${alert.code}-${index}`} alert={alert} />
        ))}
        {limited.hiddenCount > 0 && (
          <details className="group/more rounded-xl border border-white/10 bg-white/[0.03] px-3.5 py-3">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-3 text-sm font-semibold text-slate-200 marker:content-none">
              Ver mais {limited.hiddenCount} {hiddenNoun}
              <ChevronDown className="h-4 w-4 transition-transform group-open/more:rotate-180" />
            </summary>
            <div className="mt-3 space-y-2.5 border-t border-white/10 pt-3">
              {limited.hidden.map((alert, index) => (
                <AlertArticle key={`${alert.code}-hidden-${index}`} alert={alert} />
              ))}
            </div>
          </details>
        )}
      </div>
    </section>
  );
}

function InformationGroup({ alerts }: { alerts: readonly PresentedAlert[] }) {
  const info = groupInfo.informacao;
  return (
    <section className={`rounded-2xl border p-3.5 ${info.classes}`} aria-labelledby="alert-group-informacao">
      <h4 id="alert-group-informacao" className="text-sm font-bold uppercase tracking-wide text-slate-200">
        {info.label}
      </h4>
      <div className="mt-3">
        {alerts.length === 0 ? <EmptyGroup /> : (
          <details className="group/info rounded-xl border border-white/10 bg-[#07162D]/60 px-3.5 py-3.5">
            <summary className="cursor-pointer list-none marker:content-none">
              <span className="flex items-center justify-between gap-3">
                <span>
                  <span className="block text-sm text-slate-400">
                    {alerts.length} {alerts.length === 1 ? "item agrupado" : "itens agrupados"}
                  </span>
                </span>
                <span className="flex items-center gap-1.5 text-sm font-semibold text-blue-300">
                  Ver detalhes
                  <ChevronDown className="h-4 w-4 transition-transform group-open/info:rotate-180" />
                </span>
              </span>
            </summary>
            <div className="mt-3 space-y-2.5 border-t border-white/10 pt-3">
              {alerts.map((alert, index) => <AlertArticle key={`${alert.code}-${index}`} alert={alert} />)}
            </div>
          </details>
        )}
      </div>
    </section>
  );
}

export function PrescriptionSummary({ presentation }: { presentation: PlanPresentation }) {
  return (
    <div className="space-y-5">
      <section aria-labelledby="session-summary-title">
        <h4 id="session-summary-title" className="mb-3 text-sm font-bold uppercase tracking-wide text-slate-300">
          Resumo da sessão
        </h4>
        <div className="space-y-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-4">
          <div className="space-y-3">
            <div>
              <p className="text-xs uppercase tracking-wide text-slate-400">Tempo previsto</p>
              <p className={`mt-0.5 text-base font-semibold ${stateClasses[presentation.state]}`}>
                {presentation.stateLabel}
              </p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-slate-400">Meta da sessão</p>
              <p className="mt-0.5 text-lg font-bold text-slate-100 tabular-nums">{presentation.targetLabel}</p>
            </div>
            <details className="text-xs text-slate-400">
              <summary className="w-fit cursor-pointer select-none text-blue-300 hover:text-blue-200">
                Ver tempo detalhado
              </summary>
              <p className="mt-1.5 leading-relaxed">
                {presentation.estimateDetail}
              </p>
            </details>
          </div>

          {presentation.legacyMarker && (
            <p className="flex items-center gap-1.5 text-xs text-slate-400" title={presentation.legacyMarker.tooltip}>
              <Info className="h-3.5 w-3.5 shrink-0" />
              {presentation.legacyMarker.label}
            </p>
          )}
          {presentation.empty && (
            <p className="rounded-xl border border-dashed border-white/15 px-3 py-3 text-sm leading-relaxed text-slate-400">
              {presentation.emptyGuidance}
            </p>
          )}
        </div>
      </section>

      <section className="space-y-3 border-t border-white/10 pt-5" aria-labelledby="plan-analysis-title" title={PRESENTATION_TEXTS.alertsTooltip}>
        <h4 id="plan-analysis-title" className="text-sm font-bold uppercase tracking-wide text-slate-300">
          Análise do plano
        </h4>
        {presentation.alertGroups.revisao_plano.length > 0 && (
          <LimitedGroup severity="revisao_plano" alerts={presentation.alertGroups.revisao_plano} />
        )}
        {presentation.alertGroups.observacao_clinica.length > 0 && (
          <LimitedGroup severity="observacao_clinica" alerts={presentation.alertGroups.observacao_clinica} />
        )}
        {presentation.alertGroups.informacao.length > 0 && (
          <InformationGroup alerts={presentation.alertGroups.informacao} />
        )}
        {presentation.alerts.length === 0 && !presentation.empty && (
          <p className="rounded-xl border border-white/10 bg-white/[0.03] px-3.5 py-3 text-sm text-slate-300">
            Nada a revisar neste plano.
          </p>
        )}
      </section>
    </div>
  );
}
