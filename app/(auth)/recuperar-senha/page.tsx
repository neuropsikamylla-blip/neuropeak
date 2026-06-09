"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import Image from "next/image";
import { Loader2, ArrowLeft, Mail } from "lucide-react";

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
    <div className="min-h-screen bg-gradient-to-br from-[#0a1631] via-[#0d1b3e] to-[#10234d] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-8">
          <Image src="/icon-96.png" alt="NeuroPeak" width={64} height={64} className="rounded-2xl mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-white">NeuroPeak</h1>
        </div>

        <Card className="shadow-2xl border border-white/10 bg-[#11213f]/90 backdrop-blur">
          <CardHeader>
            <CardTitle className="text-lg text-white">Recuperar senha</CardTitle>
            <CardDescription className="text-blue-200/60">
              {sent
                ? "Verifique seu email"
                : "Informe seu email para receber o link de redefinição"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {sent ? (
              <div className="text-center space-y-4">
                <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto">
                  <Mail className="w-8 h-8 text-green-400" />
                </div>
                <p className="text-sm text-blue-100">
                  Se <strong>{email}</strong> estiver cadastrado, você receberá um email com
                  as instruções para redefinir sua senha.
                </p>
                {process.env.NEXT_PUBLIC_ADMIN_EMAIL && (
                  <p className="text-xs text-blue-200/50">
                    Não recebeu? Verifique a caixa de spam ou entre em contato com{" "}
                    <a
                      href={`mailto:${process.env.NEXT_PUBLIC_ADMIN_EMAIL}`}
                      className="text-blue-300 hover:underline"
                    >
                      {process.env.NEXT_PUBLIC_ADMIN_EMAIL}
                    </a>
                  </p>
                )}
                <Link
                  href="/login"
                  className="inline-flex items-center gap-1 text-sm text-blue-300 hover:underline"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Voltar ao login
                </Link>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="email" className="text-blue-100">Email cadastrado</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="seu@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="mt-1 bg-white/5 border-white/15 text-white placeholder:text-blue-200/40"
                  />
                </div>
                {error && (
                  <p className="text-sm text-red-200 bg-red-500/15 p-3 rounded-lg">{error}</p>
                )}
                <Button type="submit" className="w-full h-11 bg-blue-600 hover:bg-blue-700" disabled={loading}>
                  {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                  Enviar link de redefinição
                </Button>
                <div className="text-center">
                  <Link
                    href="/login"
                    className="inline-flex items-center gap-1 text-sm text-blue-200/60 hover:text-blue-100"
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
