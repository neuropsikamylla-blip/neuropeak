"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Brain, Loader2, ArrowLeft, Mail } from "lucide-react";

export default function RecuperarSenhaPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Erro ao processar solicitação");
        return;
      }
      setSent(true);
    } catch {
      setError("Erro de conexão. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }

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
          <h1 className="text-3xl font-bold text-gray-900">NeuroPeak</h1>
        </div>

        <Card className="shadow-xl border-0">
          <CardHeader>
            <CardTitle className="text-lg">Recuperar senha</CardTitle>
            <CardDescription>
              {sent
                ? "Verifique seu email"
                : "Informe seu email para receber o link de redefinição"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {sent ? (
              <div className="text-center space-y-4">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                  <Mail className="w-8 h-8 text-green-600" />
                </div>
                <p className="text-sm text-gray-600">
                  Se <strong>{email}</strong> estiver cadastrado, você receberá um email com
                  as instruções para redefinir sua senha.
                </p>
                <p className="text-xs text-gray-500">
                  Não recebeu? Verifique a caixa de spam ou entre em contato com{" "}
                  <a href="mailto:neuropsi.kamylla@gmail.com" className="text-blue-500 hover:underline">
                    neuropsi.kamylla@gmail.com
                  </a>
                </p>
                <Link
                  href="/login"
                  className="inline-flex items-center gap-1 text-sm text-blue-600 hover:underline"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Voltar ao login
                </Link>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="email">Email cadastrado</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="seu@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="mt-1"
                  />
                </div>
                {error && (
                  <p className="text-sm text-red-600 bg-red-50 p-3 rounded-lg">{error}</p>
                )}
                <Button type="submit" className="w-full h-11 bg-blue-600 hover:bg-blue-700" disabled={loading}>
                  {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                  Enviar link de redefinição
                </Button>
                <div className="text-center">
                  <Link
                    href="/login"
                    className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    Voltar ao login
                  </Link>
                </div>
              </form>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
