"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Brain, Loader2 } from "lucide-react";

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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="text-center pb-2">
          <div className="flex justify-center mb-3">
            <div className="w-14 h-14 bg-blue-600 rounded-2xl flex items-center justify-center">
              <Brain className="w-8 h-8 text-white" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold text-gray-900">Criar conta</CardTitle>
          <CardDescription>NeuroPeak — Plataforma de Treino Cognitivo</CardDescription>
        </CardHeader>

        <CardContent className="pt-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="name">Nome completo</Label>
              <Input
                id="name"
                placeholder="Dra. Maria Silva"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
              />
            </div>

            <div>
              <Label htmlFor="clinicName">Nome da clínica (opcional)</Label>
              <Input
                id="clinicName"
                placeholder="Clínica NeuroPeak"
                value={form.clinicName}
                onChange={(e) => setForm({ ...form, clinicName: e.target.value })}
              />
            </div>

            <div>
              <Label htmlFor="email">Email profissional</Label>
              <Input
                id="email"
                type="email"
                placeholder="terapeuta@clinica.com"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                required
              />
            </div>

            <div>
              <Label htmlFor="password">Senha</Label>
              <Input
                id="password"
                type="password"
                placeholder="Mínimo 8 caracteres"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                required
              />
            </div>

            <div>
              <Label htmlFor="confirmPassword">Confirmar senha</Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="Repita a senha"
                value={form.confirmPassword}
                onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
                required
              />
            </div>

            <div>
              <Label htmlFor="accessCode">Código de acesso</Label>
              <Input
                id="accessCode"
                type="password"
                placeholder="Código fornecido pela NeuroPeak"
                value={form.accessCode}
                onChange={(e) => setForm({ ...form, accessCode: e.target.value })}
                required
              />
              <p className="text-xs text-gray-500 mt-1">Solicite o código de acesso para ativar sua conta.</p>
            </div>

            {error && (
              <p className="text-sm text-red-600 bg-red-50 p-3 rounded-lg">{error}</p>
            )}

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Criando conta...</> : "Criar conta"}
            </Button>

            <p className="text-center text-sm text-gray-600">
              Já tem conta?{" "}
              <Link href="/login" className="text-blue-600 font-medium hover:underline">
                Entrar
              </Link>
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
