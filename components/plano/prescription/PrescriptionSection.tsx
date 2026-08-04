import type { ReactNode } from "react";

interface PrescriptionSectionProps {
  title: string;
  children: ReactNode;
}

export function PrescriptionSection({ title, children }: PrescriptionSectionProps) {
  return (
    <section className="pt-3 first:pt-0 border-t first:border-t-0 border-white/10">
      <h4 className="mb-2 text-[11px] font-bold uppercase tracking-wide text-slate-400">{title}</h4>
      {children}
    </section>
  );
}
