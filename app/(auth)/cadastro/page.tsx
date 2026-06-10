"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import Image from "next/image";
import { Loader2 } from "lucide-react";

const inputDark = "bg-white/5 border-white/15 text-white placeholder:text-blue-200/40";

export default function CadastroPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    name: "",
    email: "",
    clinicName: "",
    password: "",
    confirmPassword: "",
    accessCode: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (form.password !== form.confirmPassword) {
      setError("As senhas não coincidem");
      return;
    }
    if (form.password.length < 8) {
      setError("A senha deve ter pelo menos 8 caracteres");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          clinicName: form.clinicName || undefined,
          password: form.password,
          accessCode: form.accessCode,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Erro ao criar conta");
        return;
      }

      router.push("/login?registered=1");
    } catch {
      setError("Erro de conexão. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#061326] via-[#07162D] to-[#0A1E3A] p-4">
      <Card className="w-full max-w-md shadow-2xl border border-white/10 bg-[#0D2547]/90 backdrop-blur">
        <CardHeader className="text-center pb-2">
          <div className="flex justify-center mb-3">
            <Image src="/icon-96.png" alt="NeuroPeak" width={56} height={56} className="rounded-2xl mx-auto" />
          </div>
          <CardTitle className="text-2xl font-bold text-white">Criar conta</CardTitle>
          <CardDescription className="text-blue-200/60">NeuroPeak — Plataforma de Treino Cognitivo</CardDescription>
        </CardHeader>

        <CardContent className="pt-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="name" className="text-blue-100">Nome completo</Label>
              <Input
                id="name"
                placeholder="Dra. Maria Silva"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
                className={inputDark}
              />
            </div>

            <div>
              <Label htmlFor="clinicName" className="text-blue-100">Nome da clínica (opcional)</Label>
              <Input
                id="clinicName"
                placeholder="Clínica NeuroPeak"
                value={form.clinicName}
                onChange={(e) => setForm({ ...form, clinicName: e.target.value })}
                className={inputDark}
              />
            </div>

            <div>
              <Label htmlFor="email" className="text-blue-100">Email profissional</Label>
              <Input
                id="email"
                type="email"
                placeholder="terapeuta@clinica.com"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                required
                className={inputDark}
              />
            </div>

            <div>
              <Label htmlFor="password" className="text-blue-100">Senha</Label>
              <Input
                id="password"
                type="password"
                placeholder="Mínimo 8 caracteres"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                required
                className={inputDark}
              />
            </div>

            <div>
              <Label htmlFor="confirmPassword" className="text-blue-100">Confirmar senha</Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="Repita a senha"
                value={form.confirmPassword}
                onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
                required
                className={inputDark}
              />
            </div>

            <div>
              <Label htmlFor="accessCode" className="text-blue-100">Código de acesso</Label>
              <Input
                id="accessCode"
                type="password"
                placeholder="Código fornecido pela NeuroPeak"
                value={form.accessCode}
                onChange={(e) => setForm({ ...form, accessCode: e.target.value })}
                required
                className={inputDark}
              />
              <p className="text-xs text-blue-200/50 mt-1">Solicite o código de acesso para ativar sua conta.</p>
            </div>

            {error && (
              <p className="text-sm text-red-200 bg-red-500/15 p-3 rounded-lg">{error}</p>
            )}

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Criando conta...</> : "Criar conta"}
            </Button>

            <p className="text-center text-sm text-blue-200/60">
              Já tem conta?{" "}
              <Link href="/login" className="text-blue-300 font-medium hover:underline">
                Entrar
              </Link>
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
