"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp, Brain, BookOpen, FlaskConical, Stethoscope } from "lucide-react";
import { EXERCISE_SCIENCE } from "@/lib/exercise-science";

interface ExerciseScienceCardProps {
  exerciseId: string;
}

export function ExerciseScienceCard({ exerciseId }: ExerciseScienceCardProps) {
  const [expanded, setExpanded] = useState(false);
  const data = EXERCISE_SCIENCE[exerciseId];
  if (!data) return null;

  return (
    <div className="mt-2 rounded-lg border border-indigo-100 bg-indigo-50/60 text-sm">
      <button
        onClick={() => setExpanded((v) => !v)}
        className="flex w-full items-center gap-2 px-3 py-2 text-left text-indigo-700 hover:bg-indigo-100/60 rounded-lg transition-colors"
      >
        <Brain className="w-3.5 h-3.5 flex-shrink-0" />
        <span className="font-medium text-xs">Ficha Científica</span>
        <span className="ml-auto">
          {expanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </span>
      </button>

      {expanded && (
        <div className="px-3 pb-3 space-y-3 border-t border-indigo-100">
          <Section icon={<Brain className="w-3 h-3" />} label="Neuroanatomia">
            {data.neuroanatomy}
          </Section>
          <Section icon={<FlaskConical className="w-3 h-3" />} label="Efeitos do Treino">
            {data.trainingEffects}
          </Section>
          <Section icon={<Stethoscope className="w-3 h-3" />} label="Relevância Clínica">
            {data.clinicalRelevance}
          </Section>
          <div>
            <div className="flex items-center gap-1 text-indigo-600 font-medium mb-1 mt-2">
              <BookOpen className="w-3 h-3" />
              <span className="text-xs">Referências (2012–2023)</span>
            </div>
            <ul className="space-y-1">
              {data.references.map((ref, i) => (
                <li key={i} className="text-xs text-indigo-700/70 leading-relaxed pl-2 border-l-2 border-indigo-200">
                  {ref}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}

function Section({ icon, label, children }: { icon: React.ReactNode; label: string; children: string }) {
  return (
    <div className="mt-2">
      <div className="flex items-center gap-1 text-indigo-600 font-medium mb-0.5">
        {icon}
        <span className="text-xs">{label}</span>
      </div>
      <p className="text-xs text-gray-700 leading-relaxed">{children}</p>
    </div>
  );
}
