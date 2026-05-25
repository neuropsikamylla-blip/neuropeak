"use client";

import { useState, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Loader2, Save, User, Lock, Building2, Key, Package, ShieldCheck, Upload, CheckCircle2, Clock, XCircle } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { Toaster } from "@/components/ui/toaster";

export default function ConfiguracoesPage() {
  const { data: session, update } = useSession();
  const { toast } = useToast();
  const user = session?.user as { name?: string; email?: string; clinicName?: string; crp?: string } | undefined;

  const [profileLoading, setProfileLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [licenseCode, setLicenseCode] = useState("");
  const [licenseLoading, setLicenseLoading] = useState(false);

  const [profile, setProfile] = useState({ name: "", email: "", clinicName: "", crp: "" });
  const [passwords, setPasswords] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });

  const [crpStatus, setCrpStatus] = useState<"unverified" | "pending" | "verified" | "rejected">("unverified");
  const [crpForm, setCrpForm] = useState({ crp: "", acceptedTerms: false });
  const [crpFile, setCrpFile] = useState<File | null>(null);
  const [crpLoading, setCrpLoading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (user) {
      setProfile({
        name: user.name ?? "",
        email: user.email ?? "",
        clinicName: user.clinicName ?? "",
        crp: user.crp ?? "",
      });
    }
  }, [user]);

  useEffect(() => {
    fetch("/api/crp-verification/status")
      .then((r) => r.ok ? r.json() : null)
      .then((d) => { if (d?.status) setCrpStatus(d.status); })
      .catch(() => {});
  }, []);

  const handleProfileSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileLoading(true);
    try {
      const res = await fetch("/api/auth/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: profile.name, email: profile.email, clinicName: profile.clinicName, crp: profile.crp }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast({ title: "Erro", description: data.error, variant: "destructive" });
        return;
      }
      await update({ name: profile.name, email: profile.email });
      toast({ title: "Perfil atualizado!", description: "Suas informações foram salvas." });
    } catch {
      toast({ title: "Erro", description: "Não foi possível salvar.", variant: "destructive" });
    } finally {
      setProfileLoading(false);
    }
  };

  const handlePasswordSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwords.newPassword !== passwords.confirmPassword) {
      toast({ title: "Erro", description: "As senhas não coincidem.", variant: "destructive" });
      return;
    }
    if (passwords.newPassword.length < 8) {
      toast({ title: "Erro", description: "A nova senha deve ter pelo menos 8 caracteres.", variant: "destructive" });
      return;
    }
    setPasswordLoading(true);
    try {
      const res = await fetch("/api/auth/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword: passwords.currentPassword, newPassword: passwords.newPassword }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast({ title: "Erro", description: data.error, variant: "destructive" });
        return;
      }
      setPasswords({ currentPassword: "", newPassword: "", confirmPassword: "" });
      toast({ title: "Senha alterada!", description: "Sua senha foi atualizada com sucesso." });
    } catch {
      toast({ title: "Erro", description: "Não foi possível alterar a senha.", variant: "destructive" });
    } finally {
      setPasswordLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Configurações</h1>
        <p className="text-gray-500 text-sm mt-1">Gerencie suas informações e credenciais de acesso</p>
      </div>

      {/* Perfil */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <User className="w-5 h-5 text-blue-600" />
            <CardTitle className="text-base">Dados do Perfil</CardTitle>
          </div>
          <CardDescription>Nome, email e clínica exibidos na plataforma</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleProfileSave} className="space-y-4">
            <div>
              <Label htmlFor="name">Nome completo</Label>
              <Input
                id="name"
                value={profile.name}
                onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                required
              />
            </div>
            <div>
              <Label htmlFor="email">Email de acesso</Label>
              <Input
                id="email"
                type="email"
                value={profile.email}
                onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                required
              />
            </div>
            <div>
              <Label htmlFor="clinicName">
                <Building2 className="w-3 h-3 inline mr-1" />
                Nome da clínica
              </Label>
              <Input
                id="clinicName"
                value={profile.clinicName}
                onChange={(e) => setProfile({ ...profile, clinicName: e.target.value })}
                placeholder="Ex: Clínica NeuroPeak"
              />
            </div>
            <Button type="submit" disabled={profileLoading}>
              {profileLoading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Salvando...</> : <><Save className="w-4 h-4 mr-2" />Salvar perfil</>}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Senha */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Lock className="w-5 h-5 text-blue-600" />
            <CardTitle className="text-base">Alterar Senha</CardTitle>
          </div>
          <CardDescription>Use uma senha forte com pelo menos 8 caracteres</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handlePasswordSave} className="space-y-4">
            <div>
              <Label htmlFor="currentPassword">Senha atual</Label>
              <Input
                id="currentPassword"
                type="password"
                value={passwords.currentPassword}
                onChange={(e) => setPasswords({ ...passwords, currentPassword: e.target.value })}
                required
              />
            </div>
            <div>
              <Label htmlFor="newPassword">Nova senha</Label>
              <Input
                id="newPassword"
                type="password"
                placeholder="Mínimo 8 caracteres"
                value={passwords.newPassword}
                onChange={(e) => setPasswords({ ...passwords, newPassword: e.target.value })}
                required
              />
            </div>
            <div>
              <Label htmlFor="confirmPassword">Confirmar nova senha</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={passwords.confirmPassword}
                onChange={(e) => setPasswords({ ...passwords, confirmPassword: e.target.value })}
                required
              />
            </div>
            <Button type="submit" disabled={passwordLoading}>
              {passwordLoading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Alterando...</> : <><Lock className="w-4 h-4 mr-2" />Alterar senha</>}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Licença */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Package className="w-5 h-5 text-blue-600" />
            <CardTitle className="text-base">Licenças de Pacientes</CardTitle>
          </div>
          <CardDescription>Resgatar um código para adicionar novos pacientes à plataforma</CardDescription>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              if (!licenseCode.trim()) return;
              setLicenseLoading(true);
              try {
                const res = await fetch("/api/auth/redeem-license", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ code: licenseCode }),
                });
                const data = await res.json();
                if (!res.ok) {
                  toast({ title: "Erro", description: data.error, variant: "destructive" });
                  return;
                }
                setLicenseCode("");
                toast({
                  title: "Licença resgatada!",
                  description:
                    data.licenses === -1
                      ? "Pacientes ilimitados ativados."
                      : `Você agora tem ${data.licenses} licença(s) disponível(is).`,
                });
              } catch {
                toast({ title: "Erro", description: "Não foi possível resgatar o código.", variant: "destructive" });
              } finally {
                setLicenseLoading(false);
              }
            }}
            className="space-y-4"
          >
            <div>
              <Label htmlFor="licenseCode">
                <Key className="w-3 h-3 inline mr-1" />
                Código de licença
              </Label>
              <Input
                id="licenseCode"
                placeholder="Ex: NPL-XXXXXXXX"
                value={licenseCode}
                onChange={(e) => setLicenseCode(e.target.value.toUpperCase())}
                className="mt-1 font-mono"
              />
              <p className="text-xs text-gray-500 mt-1">
                O código é fornecido pela NeuroPeak após a compra de licenças.
              </p>
            </div>
            <Button type="submit" disabled={licenseLoading || !licenseCode.trim()}>
              {licenseLoading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Resgatando...</> : "Resgatar licença"}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Verificação CRP */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-blue-600" />
            <CardTitle className="text-base">Verificação de CRP</CardTitle>
          </div>
          <CardDescription>Obrigatório para acessar o módulo Mundo Interior</CardDescription>
        </CardHeader>
        <CardContent>
          {crpStatus === "verified" && (
            <div className="flex items-center gap-2 p-3 rounded-xl bg-green-50 border border-green-200">
              <CheckCircle2 className="w-5 h-5 text-green-600" />
              <div>
                <p className="text-sm font-semibold text-green-800">CRP verificado</p>
                <p className="text-xs text-green-700">Acesso ao Mundo Interior liberado.</p>
              </div>
            </div>
          )}

          {crpStatus === "pending" && (
            <div className="flex items-center gap-2 p-3 rounded-xl bg-yellow-50 border border-yellow-200">
              <Clock className="w-5 h-5 text-yellow-600" />
              <div>
                <p className="text-sm font-semibold text-yellow-800">Em análise</p>
                <p className="text-xs text-yellow-700">Seu documento foi enviado e está aguardando aprovação.</p>
              </div>
            </div>
          )}

          {crpStatus === "rejected" && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 p-3 rounded-xl bg-red-50 border border-red-200">
                <XCircle className="w-5 h-5 text-red-500" />
                <div>
                  <p className="text-sm font-semibold text-red-800">Verificação rejeitada</p>
                  <p className="text-xs text-red-700">Envie um novo documento para solicitar revisão.</p>
                </div>
              </div>
            </div>
          )}

          {(crpStatus === "unverified" || crpStatus === "rejected") && (
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                if (!crpForm.crp.trim() || !crpFile || !crpForm.acceptedTerms) return;
                setCrpLoading(true);
                try {
                  const fd = new FormData();
                  fd.append("crp", crpForm.crp.trim());
                  fd.append("document", crpFile);
                  fd.append("acceptedTerms", "true");
                  const res = await fetch("/api/crp-verification", { method: "POST", body: fd });
                  const data = await res.json();
                  if (!res.ok) { toast({ title: "Erro", description: data.error, variant: "destructive" }); return; }
                  setCrpStatus("pending");
                  toast({ title: "Documento enviado!", description: "Você será notificado após a análise." });
                } catch {
                  toast({ title: "Erro ao enviar", variant: "destructive" });
                } finally {
                  setCrpLoading(false);
                }
              }}
              className="space-y-4 mt-3"
            >
              <div>
                <Label htmlFor="crpNumber">Número do CRP</Label>
                <Input
                  id="crpNumber"
                  value={crpForm.crp}
                  onChange={(e) => setCrpForm({ ...crpForm, crp: e.target.value })}
                  placeholder="Ex: 06/12345"
                  className="mt-1"
                  required
                />
              </div>
              <div>
                <Label>Documento comprobatório</Label>
                <p className="text-xs text-gray-500 mb-2">Foto ou PDF da carteirinha do CRP ou certidão do CFP (máx. 5MB)</p>
                <div
                  className="border-2 border-dashed border-gray-200 rounded-xl p-4 text-center cursor-pointer hover:border-blue-300 transition-colors"
                  onClick={() => fileRef.current?.click()}
                >
                  {crpFile ? (
                    <p className="text-sm text-blue-700 font-medium">{crpFile.name}</p>
                  ) : (
                    <>
                      <Upload className="w-6 h-6 text-gray-400 mx-auto mb-1" />
                      <p className="text-sm text-gray-500">Clique para selecionar</p>
                      <p className="text-xs text-gray-400">JPG, PNG ou PDF</p>
                    </>
                  )}
                </div>
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp,application/pdf"
                  className="hidden"
                  onChange={(e) => setCrpFile(e.target.files?.[0] ?? null)}
                />
              </div>
              <div className="flex items-start gap-2 p-3 rounded-xl bg-gray-50 border border-gray-200">
                <input
                  type="checkbox"
                  id="terms"
                  checked={crpForm.acceptedTerms}
                  onChange={(e) => setCrpForm({ ...crpForm, acceptedTerms: e.target.checked })}
                  className="mt-0.5 flex-shrink-0"
                />
                <label htmlFor="terms" className="text-xs text-gray-700 leading-relaxed cursor-pointer">
                  Declaro ser psicólogo(a) devidamente registrado(a) no CRP e que utilizarei o módulo Mundo Interior exclusivamente em sessões clínicas mediadas por mim. Estou ciente de que a ferramenta é um recurso auxiliar e não substitui psicoterapia, não realiza diagnóstico e não deve ser usada de forma autônoma pelo paciente.
                </label>
              </div>
              <Button
                type="submit"
                disabled={crpLoading || !crpForm.crp.trim() || !crpFile || !crpForm.acceptedTerms}
              >
                {crpLoading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Enviando...</> : <><Upload className="w-4 h-4 mr-2" />Enviar para verificação</>}
              </Button>
            </form>
          )}
        </CardContent>
      </Card>

      {/* Link admin — só aparece para admin */}
      <AdminLink email={user?.email} />

      <Toaster />
    </div>
  );
}

function AdminLink({ email }: { email?: string }) {
  const [isAdmin, setIsAdmin] = useState(false);
  useEffect(() => {
    // verifica se é admin consultando a API (que já sabe o ADMIN_EMAIL)
    fetch("/api/crp-verification")
      .then((r) => { if (r.ok) setIsAdmin(true); })
      .catch(() => {});
  }, [email]);
  if (!isAdmin) return null;
  return (
    <a
      href="/admin"
      className="flex items-center gap-2 text-xs text-gray-400 hover:text-gray-600 transition-colors mt-2"
    >
      <ShieldCheck className="w-3.5 h-3.5" />
      Painel de verificação de CRP
    </a>
  );
}
