"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { ArrowLeft, Loader2, Save } from "lucide-react";
import Link from "next/link";
import { Toaster } from "@/components/ui/toaster";

export default function EditarPacientePage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const patientId = params.id as string;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: "",
    birthDate: "",
    education: "",
    medications: "",
    therapeuticGoals: "",
    clinicalNotes: "",
    contact: "",
    guardian: "",
    cid: "",
    diagnosis: "",
    theme: "CLINICAL" as "CLINICAL" | "COLORFUL" | "GAMIFIED",
  });

  useEffect(() => {
    fetch(`/api/patients/${patientId}`)
      .then((r) => r.json())
      .then(({ patient }) => {
        if (!patient) { router.replace("/pacientes"); return; }
        setForm({
          name: patient.name ?? "",
          birthDate: patient.birthDate ? patient.birthDate.split("T")[0] : "",
          education: patient.education ?? "",
          medications: patient.medications ?? "",
          therapeuticGoals: patient.therapeuticGoals ?? "",
          clinicalNotes: patient.clinicalNotes ?? "",
          contact: patient.contact ?? "",
          guardian: patient.guardian ?? "",
          cid: patient.cid ?? "",
          diagnosis: patient.diagnosis ?? "",
          theme: patient.theme ?? "CLINICAL",
        });
      })
      .catch(() => router.replace("/pacientes"))
      .finally(() => setLoading(false));
  }, [patientId, router]);

  function handleChange(field: string, value: string) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim() || !form.birthDate) {
      toast({ title: "Preencha nome e data de nascimento", variant: "destructive" });
      return;
    }
    setSaving(true);
    try {
      const res = await fetch(`/api/patients/${patientId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error();
      toast({ title: "Paciente atualizado!" });
      router.push(`/pacientes/${patientId}`);
    } catch {
      toast({ title: "Erro ao salvar", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  }

  const age = (() => {
    if (!form.birthDate) return null;
    const today = new Date();
    const birth = new Date(form.birthDate);
    let a = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) a--;
    return a >= 0 ? a : null;
  })();

  if (loading) {
    return <div className="p-8 text-center text-gray-400 text-sm animate-pulse">Carregando...</div>;
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6 pb-12">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" asChild>
          <Link href={`/pacientes/${patientId}`}><ArrowLeft className="w-5 h-5" /></Link>
        </Button>
        <div>
          <h1 className="text-xl font-bold text-gray-900">Editar paciente</h1>
          <p className="text-sm text-gray-500">{form.name}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Dados pessoais */}
        <Card>
          <CardHeader><CardTitle className="text-base">Dados Pessoais</CardTitle></CardHeader>
          <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <Label htmlFor="name">Nome completo *</Label>
              <Input id="name" value={form.name} onChange={(e) => handleChange("name", e.target.value)} className="mt-1" required />
            </div>
            <div>
              <Label htmlFor="birthDate">Data de nascimento *</Label>
              <div className="flex items-center gap-2 mt-1">
                <Input id="birthDate" type="date" value={form.birthDate} onChange={(e) => handleChange("birthDate", e.target.value)} required />
                {age !== null && (
                  <span className="text-sm text-gray-500 whitespace-nowrap">{age} anos</span>
                )}
              </div>
            </div>
            <div>
              <Label htmlFor="education">Escolaridade</Label>
              <Input id="education" value={form.education} onChange={(e) => handleChange("education", e.target.value)} placeholder="Ex: Ensino Fundamental" className="mt-1" />
            </div>
            <div>
              <Label htmlFor="contact">Contato</Label>
              <Input id="contact" value={form.contact} onChange={(e) => handleChange("contact", e.target.value)} placeholder="Telefone ou email" className="mt-1" />
            </div>
            <div>
              <Label htmlFor="guardian">Responsável</Label>
              <Input id="guardian" value={form.guardian} onChange={(e) => handleChange("guardian", e.target.value)} placeholder="Nome do responsável" className="mt-1" />
            </div>
          </CardContent>
        </Card>

        {/* Informações clínicas */}
        <Card>
          <CardHeader><CardTitle className="text-base">Informações Clínicas</CardTitle></CardHeader>
          <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="cid">CID</Label>
              <Input id="cid" value={form.cid} onChange={(e) => handleChange("cid", e.target.value)} placeholder="Ex: F84.0" className="mt-1" />
            </div>
            <div>
              <Label htmlFor="diagnosis">Hipótese de trabalho</Label>
              <Input id="diagnosis" value={form.diagnosis} onChange={(e) => handleChange("diagnosis", e.target.value)} placeholder="Ex: TDAH, TEA, dificuldades de aprendizagem" className="mt-1" />
            </div>
            <div className="sm:col-span-2">
              <Label htmlFor="medications">Medicamentos em uso</Label>
              <Textarea id="medications" value={form.medications} onChange={(e) => handleChange("medications", e.target.value)} placeholder="Liste os medicamentos e doses" className="mt-1" rows={2} />
            </div>
            <div className="sm:col-span-2">
              <Label htmlFor="therapeuticGoals">Objetivos do programa</Label>
              <Textarea id="therapeuticGoals" value={form.therapeuticGoals} onChange={(e) => handleChange("therapeuticGoals", e.target.value)} placeholder="Descreva o que se espera alcançar com o programa de treino" className="mt-1" rows={2} />
            </div>
            <div className="sm:col-span-2">
              <Label htmlFor="clinicalNotes">Notas clínicas</Label>
              <Textarea id="clinicalNotes" value={form.clinicalNotes} onChange={(e) => handleChange("clinicalNotes", e.target.value)} placeholder="Observações relevantes" className="mt-1" rows={3} />
            </div>
          </CardContent>
        </Card>

        {/* Tema visual */}
        <Card>
          <CardHeader><CardTitle className="text-base">Tema Visual</CardTitle></CardHeader>
          <CardContent>
            <Select value={form.theme} onValueChange={(v) => handleChange("theme", v)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="CLINICAL">Clínico — interface limpa e profissional</SelectItem>
                <SelectItem value="COLORFUL">Colorido — vibrante, indicado para crianças</SelectItem>
                <SelectItem value="GAMIFIED">Gamificado — escuro e dinâmico, para adolescentes</SelectItem>
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        <Button type="submit" disabled={saving} className="w-full">
          {saving ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Salvando...</> : <><Save className="w-4 h-4 mr-2" />Salvar alterações</>}
        </Button>
      </form>

      <Toaster />
    </div>
  );
}
