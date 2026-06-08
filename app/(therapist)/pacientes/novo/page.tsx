"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { ArrowLeft, Loader2, Copy, Check, Package } from "lucide-react";
import Link from "next/link";
import { z } from "zod";

const schema = z.object({
  name: z.string().min(2, "Nome deve ter ao menos 2 caracteres"),
  birthDate: z.string().min(1, "Data de nascimento obrigatória"),
  education: z.string().optional(),
  medications: z.string().optional(),
  therapeuticGoals: z.string().optional(),
  clinicalNotes: z.string().optional(),
  contact: z.string().optional(),
  guardian: z.string().optional(),
  cid: z.string().optional(),
  diagnosis: z.string().optional(),
  theme: z.enum(["CLINICAL", "COLORFUL", "GAMIFIED"]),
});

export default function NovoPacientePage() {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [created, setCreated] = useState<{ id: string; pin: string; name: string; patientCode?: string } | null>(null);
  const [pinCopied, setPinCopied] = useState(false);
  const [needsLicense, setNeedsLicense] = useState(false);
  const [requestingSent, setRequestingSent] = useState(false);
  const [requestingLicense, setRequestingLicense] = useState(false);

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

  const [errors, setErrors] = useState<Record<string, string>>({});

  function handleChange(field: string, value: string) {
    setForm((f) => ({ ...f, [field]: value }));
    if (errors[field]) setErrors((e) => { const n = { ...e }; delete n[field]; return n; });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const result = schema.safeParse(form);
    if (!result.success) {
      const errs: Record<string, string> = {};
      result.error.errors.forEach((err) => {
        if (err.path[0]) errs[String(err.path[0])] = err.message;
      });
      setErrors(errs);
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/patients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error ?? "Erro ao criar paciente");
      }

      if (res.status === 402) {
        setNeedsLicense(true);
        return;
      }

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error ?? "Erro ao criar paciente");
      }

      const data = await res.json();
      setCreated({ id: data.patient.id, pin: data.patient.pin, name: data.patient.name, patientCode: data.patient.patientCode });
    } catch (err) {
      toast({
        title: "Erro",
        description: err instanceof Error ? err.message : "Erro ao criar paciente",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }

  async function handleRequestLicense() {
    setRequestingLicense(true);
    try {
      await fetch("/api/auth/request-license", { method: "POST" });
      setRequestingSent(true);
    } catch {
      // still show sent to avoid confusion
      setRequestingSent(true);
    } finally {
      setRequestingLicense(false);
    }
  }

  function copyPin() {
    if (created) {
      navigator.clipboard.writeText(created.pin);
      setPinCopied(true);
      setTimeout(() => setPinCopied(false), 2000);
    }
  }

  if (needsLicense) {
    return (
      <div className="max-w-lg mx-auto">
        <Card className="border-amber-200 shadow-lg">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Package className="w-5 h-5 text-amber-600" />
              <CardTitle className="text-amber-700">Licença necessária</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {requestingSent ? (
              <div className="bg-green-50 rounded-xl p-4 border border-green-200 text-center space-y-2">
                <p className="text-green-700 font-medium">Solicitação enviada!</p>
                <p className="text-sm text-gray-600">
                  Entraremos em contato em breve com um código de licença para ativar a criação de
                  novos pacientes.
                </p>
                <Button variant="outline" className="mt-2" onClick={() => router.push("/pacientes")}>
                  Voltar aos pacientes
                </Button>
              </div>
            ) : (
              <>
                <p className="text-sm text-gray-700">
                  Você atingiu o limite de pacientes do seu plano atual. Para adicionar um novo
                  paciente, é necessário adquirir uma licença.
                </p>
                <div className="bg-amber-50 rounded-xl p-4 border border-amber-200">
                  <p className="text-xs text-amber-700 font-medium">
                    Ao clicar em &quot;Solicitar licença&quot;, nossa equipe receberá sua solicitação e
                    enviará um código para você resgatar em <strong>Configurações → Licenças</strong>.
                  </p>
                </div>
                <div className="flex gap-3">
                  <Button variant="outline" className="flex-1" onClick={() => setNeedsLicense(false)}>
                    Cancelar
                  </Button>
                  <Button
                    className="flex-1 bg-amber-600 hover:bg-amber-700"
                    onClick={handleRequestLicense}
                    disabled={requestingLicense}
                  >
                    {requestingLicense ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                    Solicitar licença
                  </Button>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  if (created) {
    return (
      <div className="max-w-lg mx-auto">
        <Card className="border-green-200 shadow-lg">
          <CardHeader>
            <CardTitle className="text-green-700">Paciente criado com sucesso!</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-green-50 rounded-xl p-4 border border-green-200">
              <p className="text-sm text-green-700 font-medium mb-3">
                Compartilhe estas informações de acesso com o paciente <strong>{created.name}</strong>:
              </p>
              <div className="space-y-2">
                {created.patientCode && (
                  <div className="flex items-center justify-between bg-white rounded-lg p-3 border">
                    <div>
                      <p className="text-xs text-gray-500">Código do Paciente</p>
                      <p className="font-mono font-bold text-2xl tracking-widest text-blue-700">{created.patientCode}</p>
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => { navigator.clipboard.writeText(created.patientCode!); }}>
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
                )}
                <div className="flex items-center justify-between bg-white rounded-lg p-3 border">
                  <div>
                    <p className="text-xs text-gray-500">PIN de acesso</p>
                    <p className="font-mono font-bold text-2xl tracking-widest text-blue-600">{created.pin}</p>
                  </div>
                  <Button variant="ghost" size="sm" onClick={copyPin}>
                    {pinCopied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                  </Button>
                </div>
              </div>
              <p className="text-xs text-orange-600 mt-3 font-medium">
                ⚠️ Anote o PIN agora — ele não pode ser recuperado depois!
              </p>
            </div>

            <div className="flex gap-3">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => router.push(`/pacientes/${created.id}/plano`)}
              >
                Criar Plano de Treino
              </Button>
              <Button
                className="flex-1"
                onClick={() => router.push(`/pacientes/${created.id}`)}
              >
                Ver Perfil
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/pacientes" aria-label="Voltar"><ArrowLeft className="w-5 h-5" /></Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Novo Paciente</h1>
          <p className="text-sm text-gray-500">Preencha os dados do paciente</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader><CardTitle className="text-base">Informações Básicas</CardTitle></CardHeader>
          <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <Label htmlFor="name">Nome completo *</Label>
              <Input id="name" value={form.name} onChange={(e) => handleChange("name", e.target.value)} placeholder="Nome do paciente" className="mt-1" />
              {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
            </div>
            <div>
              <Label htmlFor="birthDate">Data de nascimento *</Label>
              <div className="flex items-center gap-2 mt-1">
                <Input id="birthDate" type="date" value={form.birthDate} onChange={(e) => handleChange("birthDate", e.target.value)} />
                {form.birthDate && (
                  <span className="text-sm text-gray-500 whitespace-nowrap">
                    {(() => {
                      const today = new Date();
                      const birth = new Date(form.birthDate);
                      let age = today.getFullYear() - birth.getFullYear();
                      const m = today.getMonth() - birth.getMonth();
                      if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
                      return age >= 0 ? `${age} anos` : "";
                    })()}
                  </span>
                )}
              </div>
              {errors.birthDate && <p className="text-red-500 text-xs mt-1">{errors.birthDate}</p>}
            </div>
            <div>
              <Label htmlFor="education">Escolaridade</Label>
              <Input id="education" value={form.education} onChange={(e) => handleChange("education", e.target.value)} placeholder="Ex: Ensino Médio" className="mt-1" />
            </div>
            <div>
              <Label htmlFor="contact">Contato</Label>
              <Input id="contact" value={form.contact} onChange={(e) => handleChange("contact", e.target.value)} placeholder="Telefone ou email" className="mt-1" />
            </div>
            <div>
              <Label htmlFor="guardian">Responsável (se menor)</Label>
              <Input id="guardian" value={form.guardian} onChange={(e) => handleChange("guardian", e.target.value)} placeholder="Nome do responsável" className="mt-1" />
            </div>
          </CardContent>
        </Card>

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

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Tema Visual</CardTitle>
            <p className="text-sm text-gray-500">Escolha a interface que o paciente verá durante o treinamento</p>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-3">
              {[
                { value: "CLINICAL", label: "Clínico", desc: "Adultos e idosos", color: "bg-gray-100 border-gray-300" },
                { value: "COLORFUL", label: "Colorido", desc: "Crianças 4-11", color: "bg-teal-100 border-teal-400" },
                { value: "GAMIFIED", label: "Gamificado", desc: "Adolescentes 12-17", color: "bg-gray-900 border-cyan-500" },
              ].map((t) => (
                <button
                  key={t.value}
                  type="button"
                  onClick={() => handleChange("theme", t.value)}
                  className={`p-4 rounded-xl border-2 text-left transition-all ${
                    form.theme === t.value ? "ring-2 ring-blue-500 ring-offset-2" : ""
                  } ${t.color}`}
                >
                  <p className={`font-semibold text-sm ${t.value === "GAMIFIED" ? "text-cyan-400" : "text-gray-800"}`}>{t.label}</p>
                  <p className={`text-xs mt-1 ${t.value === "GAMIFIED" ? "text-gray-400" : "text-gray-500"}`}>{t.desc}</p>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="flex gap-3">
          <Button variant="outline" type="button" asChild className="flex-1">
            <Link href="/pacientes">Cancelar</Link>
          </Button>
          <Button type="submit" className="flex-1" disabled={loading}>
            {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
            Criar Paciente
          </Button>
        </div>
      </form>
    </div>
  );
}
