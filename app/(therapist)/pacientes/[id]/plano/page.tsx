"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { ArrowLeft, Loader2, Save } from "lucide-react";
import Link from "next/link";
import { EXERCISE_DEFINITIONS, DOMAIN_LABELS, type Domain } from "@/types";
import { ExerciseScienceCard } from "@/components/exercises/ExerciseScienceCard";

const ALL_DOMAINS: Domain[] = ["memory", "attention", "processing", "executive"];

const DOMAIN_EXERCISES: Record<Domain, string[]> = {
  memory: ["span-numerico", "span-numerico-inverso", "matriz-espacial", "matriz-espacial-inversa", "jogo-memoria", "desafio-supermercado"],
  attention: ["trilha-visual", "stroop-task", "antes-depois", "atencao-seletiva", "atencao-alternada", "atencao-dividida", "atencao-sustentada"],
  processing: ["tempo-reacao", "certo-ou-errado", "semaforo"],
  executive: ["torre-hanoi", "sequenciamento", "flexibilidade-cognitiva", "labirinto", "ordem-historia", "desafio-cidade"],
};

export default function PlanoPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const patientId = params.id as string;

  const [loading, setLoading] = useState(false);
  const [selectedDomains, setSelectedDomains] = useState<Domain[]>(["memory", "attention"]);
  const [selectedExercises, setSelectedExercises] = useState<string[]>([
    "span-numerico", "stroop-task",
  ]);
  const [sessionDuration, setSessionDuration] = useState(30);
  const [frequency, setFrequency] = useState(3);

  function toggleDomain(domain: Domain) {
    setSelectedDomains((prev) => {
      if (prev.includes(domain)) {
        const next = prev.filter((d) => d !== domain);
        // Also remove exercises from this domain
        const domainExs = DOMAIN_EXERCISES[domain];
        setSelectedExercises((exs) => exs.filter((e) => !domainExs.includes(e)));
        return next;
      } else {
        return [...prev, domain];
      }
    });
  }

  function toggleExercise(exerciseId: string) {
    setSelectedExercises((prev) =>
      prev.includes(exerciseId) ? prev.filter((e) => e !== exerciseId) : [...prev, exerciseId]
    );
  }

  async function handleSave() {
    if (selectedExercises.length === 0) {
      toast({ title: "Selecione ao menos um exercício", variant: "destructive" });
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`/api/patients/${patientId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          trainingPlan: {
            domains: selectedDomains,
            exercises: selectedExercises,
            sessionDuration,
            frequency,
          },
        }),
      });

      if (!res.ok) throw new Error("Erro ao salvar plano");

      toast({ title: "Plano salvo com sucesso!" });
      router.push(`/pacientes/${patientId}`);
    } catch {
      toast({ title: "Erro ao salvar plano", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" asChild>
          <Link href={`/pacientes/${patientId}`}><ArrowLeft className="w-5 h-5" /></Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Plano de Treinamento</h1>
          <p className="text-sm text-gray-500">Configure os exercícios do paciente</p>
        </div>
      </div>

      {/* Session settings */}
      <Card>
        <CardHeader><CardTitle className="text-base">Configurações de Sessão</CardTitle></CardHeader>
        <CardContent className="grid grid-cols-2 gap-4">
          <div>
            <Label>Duração da sessão (min)</Label>
            <Input
              type="number"
              min={10}
              max={90}
              value={sessionDuration}
              onChange={(e) => setSessionDuration(Number(e.target.value))}
              className="mt-1"
            />
          </div>
          <div>
            <Label>Frequência (sessões/semana)</Label>
            <Input
              type="number"
              min={1}
              max={7}
              value={frequency}
              onChange={(e) => setFrequency(Number(e.target.value))}
              className="mt-1"
            />
          </div>
        </CardContent>
      </Card>

      {/* Domains and exercises */}
      {ALL_DOMAINS.map((domain) => (
        <Card key={domain}>
          <CardHeader className="pb-3">
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id={domain}
                checked={selectedDomains.includes(domain)}
                onChange={() => toggleDomain(domain)}
                className="w-4 h-4 text-blue-600 rounded"
              />
              <CardTitle className="text-base">
                <label htmlFor={domain} className="cursor-pointer">
                  {DOMAIN_LABELS[domain]}
                </label>
              </CardTitle>
            </div>
          </CardHeader>
          {selectedDomains.includes(domain) && (
            <CardContent>
              <div className="grid grid-cols-1 gap-2">
                {DOMAIN_EXERCISES[domain].map((exId) => {
                  const ex = EXERCISE_DEFINITIONS[exId as keyof typeof EXERCISE_DEFINITIONS];
                  if (!ex) return null;
                  return (
                    <div key={exId}>
                      <label
                        className={`flex items-center gap-3 p-3 rounded-lg border-2 cursor-pointer transition-all ${
                          selectedExercises.includes(exId)
                            ? "border-blue-400 bg-blue-50"
                            : "border-gray-200 hover:border-gray-300"
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={selectedExercises.includes(exId)}
                          onChange={() => toggleExercise(exId)}
                          className="w-4 h-4 text-blue-600 rounded"
                        />
                        <span className="text-xl">{ex.icon}</span>
                        <div>
                          <p className="font-medium text-sm text-gray-800">{ex.name}</p>
                          <p className="text-xs text-gray-500">{ex.description} · ~{ex.estimatedMinutes}min</p>
                        </div>
                      </label>
                      <ExerciseScienceCard exerciseId={exId} />
                    </div>
                  );
                })}
              </div>
            </CardContent>
          )}
        </Card>
      ))}

      <div className="flex gap-3">
        <Button variant="outline" asChild className="flex-1">
          <Link href={`/pacientes/${patientId}`}>Cancelar</Link>
        </Button>
        <Button onClick={handleSave} disabled={loading} className="flex-1">
          {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
          Salvar Plano
        </Button>
      </div>
    </div>
  );
}
