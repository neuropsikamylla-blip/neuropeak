import { subdomainColor } from "@/lib/domain-taxonomy";

/** Tag de subdomínio (categoria principal do exercício) — cor suave por subdomínio. */
export function SubdomainTag({ id, label }: { id: string; label: string }) {
  const c = subdomainColor(id);
  return (
    <span
      className="inline-block px-2 py-0.5 rounded-md text-xs font-medium leading-tight"
      style={{ backgroundColor: c.bg, color: c.text }}
    >
      {label}
    </span>
  );
}

/** Habilidades secundárias — chips menores e discretos (não são filtros). */
export function SecondaryChips({ skills }: { skills: string[] }) {
  if (skills.length === 0) return <span className="text-xs text-slate-500">—</span>;
  return (
    <div className="flex flex-wrap gap-1">
      {skills.map((s) => (
        <span key={s} className="inline-block px-1.5 py-0.5 rounded text-[11px] font-medium bg-white/10 text-slate-300">
          {s}
        </span>
      ))}
    </div>
  );
}
