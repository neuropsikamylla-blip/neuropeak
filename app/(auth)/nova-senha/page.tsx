"use client";

import { useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Brain, Loader2, Eye, EyeOff, CheckCircle } from "lucide-react";

function NovaSenhaForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token") ?? "";

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  if (!token) {
    return (
      <div className="text-center space-y-4">
        <p className="text-red-600">Link inválido ou ausente.</p>
        <Link href="/recuperar-senha" className="text-blue-600 hover:underline text-sm">
          Solicitar novo link
        </Link>
      </div>
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (password !== confirm) {
      setError("As senhas não coincidem");
      return;
    }
    if (password.length < 8) {
      setError("A senha deve ter pelo menos 8 caracteres");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, newPassword: password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Erro ao redefinir senha");
        return;
      }
      setSuccess(true);
      setTimeout(() => router.push("/login"), 3000);
    } catch {
      setError("Erro de conexão. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return (
      <div className="text-center space-y-4">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
          <CheckCircle className="w-8 h-8 text-green-600" />
        </div>
        <p className="text-sm text-gray-700 font-medium">Senha redefinida com sucesso!</p>
        <p className="text-xs text-gray-500">Você será redirecionado para o login em instantes...</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="password">Nova senha</Label>
        <div className="relative mt-1">
          <Input
            id="password"
            type={showPassword ? "text" : "password"}
            placeholder="Mínimo 8 caracteres"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="pr-10"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
      </div>
      <div>
        <Label htmlFor="confirm">Confirmar nova senha</Label>
        <Input
          id="confirm"
          type="password"
          placeholder="Repita a senha"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          required
          className="mt-1"
        />
      </div>
      {error && (
        <p className="text-sm text-red-600 bg-red-50 p-3 rounded-lg">{error}</p>
      )}
      <Button type="submit" className="w-full h-11 bg-blue-600 hover:bg-blue-700" disabled={loading}>
        {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
        Redefinir senha
      </Button>
    </form>
  );
}

export default function NovaSenhaPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-teal-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-blue-600 mb-4">
            <Brain className="w-9 h-9 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Cognitex</h1>
        </div>

        <Card className="shadow-xl border-0">
          <CardHeader>
            <CardTitle className="text-lg">Nova senha</CardTitle>
            <CardDescription>Crie uma senha forte para sua conta</CardDescription>
          </CardHeader>
          <CardContent>
            <Suspense fallback={<p className="text-sm text-gray-500">Carregando...</p>}>
              <NovaSenhaForm />
            </Suspense>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
