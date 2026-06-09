"use client";

import { Suspense } from "react";
import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { FileText, Download, Loader2 } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

interface Patient {
  id: string;
  name: string;
}

function RelatoriosContent() {
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [selectedPatient, setSelectedPatient] = useState(searchParams.get("patientId") ?? "");
  const [startDate, setStartDate] = useState(() => {
    const d = new Date();
    d.setMonth(d.getMonth() - 3);
    return d.toISOString().split("T")[0];
  });
  const [endDate, setEndDate] = useState(new Date().toISOString().split("T")[0]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch("/api/patients")
      .then((r) => r.json())
      .then((data) => setPatients(data.patients ?? []))
      .catch(() => {});
  }, []);

  async function handleGenerate() {
    if (!selectedPatient) {
      toast({ title: "Selecione um paciente", variant: "destructive" });
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(
        `/api/reports?patientId=${selectedPatient}&start=${startDate}&end=${endDate}`,
        { method: "GET" }
      );

      if (!res.ok) throw new Error("Erro ao gerar relatório");

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `relatorio_${selectedPatient}_${endDate}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
      toast({ title: "Relatório gerado com sucesso!" });
    } catch (err) {
      toast({ title: "Erro ao gerar relatório", description: String(err), variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-100">Relatórios Clínicos</h1>
        <p className="text-slate-400 text-sm mt-1">Gere relatórios em PDF para seus pacientes</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <FileText className="w-5 h-5 text-blue-400" />
            Gerar Relatório PDF
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Paciente</Label>
            <Select value={selectedPatient} onValueChange={setSelectedPatient}>
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Selecione um paciente" />
              </SelectTrigger>
              <SelectContent className="dark">
                {patients.map((p) => (
                  <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Data inicial</Label>
              <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="mt-1" />
            </div>
            <div>
              <Label>Data final</Label>
              <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="mt-1" />
            </div>
          </div>

          <Button className="w-full h-11" onClick={handleGenerate} disabled={loading}>
            {loading ? (
              <><Loader2 className="w-4 h-4 animate-spin mr-2" />Gerando PDF...</>
            ) : (
              <><Download className="w-4 h-4 mr-2" />Gerar e Baixar PDF</>
            )}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base">O relatório inclui:</CardTitle></CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm text-slate-300">
            {[
              "Identificação do paciente e dados clínicos",
              "Resumo do período de treinamento",
              "Pontuação por domínio cognitivo",
              "Gráficos de evolução temporal",
              "Histórico detalhado de sessões",
              "Recomendações baseadas no desempenho",
              "Espaço para assinatura do terapeuta",
            ].map((item, i) => (
              <li key={i} className="flex items-center gap-2">
                <span className="text-green-400">✓</span>
                {item}
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}

export default function RelatoriosPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center h-48"><Loader2 className="w-8 h-8 animate-spin text-blue-400" /></div>}>
      <RelatoriosContent />
    </Suspense>
  );
}
