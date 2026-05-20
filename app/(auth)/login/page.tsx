"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Brain, Eye, EyeOff, Loader2 } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

type Mode = "therapist" | "patient";

export default function LoginPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [mode, setMode] = useState<Mode>("therapist");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Therapist form
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Patient form
  const [patientId, setPatientId] = useState("");
  const [pin, setPin] = useState("");

  async function handleTherapistLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const result = await signIn("therapist-login", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        toast({ title: "Erro ao entrar", description: "Email ou senha incorretos.", variant: "destructive" });
      } else {
        router.push("/dashboard");
        router.refresh();
      }
    } finally {
      setLoading(false);
    }
  }

  async function handlePatientLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const result = await signIn("patient-pin", {
        patientId,
        pin,
        redirect: false,
      });

      if (result?.error) {
        toast({ title: "Erro ao entrar", description: "ID de paciente ou PIN incorretos.", variant: "destructive" });
      } else {
        router.push("/inicio");
        router.refresh();
      }
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
        {/* Logo */}
        <div className="text-center mb-8">
          <motion.div
            className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-blue-600 mb-4"
            whileHover={{ rotate: 5, scale: 1.05 }}
          >
            <Brain className="w-9 h-9 text-white" />
          </motion.div>
          <h1 className="text-3xl font-bold text-gray-900">NeuroPeak</h1>
          <p className="text-gray-500 text-sm mt-1">Plataforma de Treinamento Cognitivo</p>
        </div>

        <Card className="shadow-xl border-0">
          <CardHeader className="pb-4">
            {/* Mode toggle */}
            <div className="flex gap-1 p-1 bg-gray-100 rounded-xl mb-4">
              <button
                className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${mode === "therapist" ? "bg-white shadow text-blue-700" : "text-gray-500 hover:text-gray-700"}`}
                onClick={() => setMode("therapist")}
              >
                Terapeuta
              </button>
              <button
                className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${mode === "patient" ? "bg-white shadow text-blue-700" : "text-gray-500 hover:text-gray-700"}`}
                onClick={() => setMode("patient")}
              >
                Paciente
              </button>
            </div>

            <CardTitle className="text-lg">
              {mode === "therapist" ? "Acesso do Terapeuta" : "Acesso do Paciente"}
            </CardTitle>
            <CardDescription>
              {mode === "therapist"
                ? "Entre com seu email e senha"
                : "Entre com seu ID de paciente e PIN"}
            </CardDescription>
          </CardHeader>

          <CardContent>
            {mode === "therapist" ? (
              <form onSubmit={handleTherapistLogin} className="space-y-4">
                <div>
                  <Label htmlFor="email">Email</Label>
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
                <div>
                  <Label htmlFor="password">Senha</Label>
                  <div className="relative mt-1">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
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
                <Button type="submit" className="w-full h-11 bg-blue-600 hover:bg-blue-700" disabled={loading}>
                  {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                  Entrar
                </Button>
              </form>
            ) : (
              <form onSubmit={handlePatientLogin} className="space-y-4">
                <div>
                  <Label htmlFor="patientId">ID do Paciente</Label>
                  <Input
                    id="patientId"
                    type="text"
                    placeholder="ID fornecido pelo terapeuta"
                    value={patientId}
                    onChange={(e) => setPatientId(e.target.value)}
                    required
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="pin">PIN</Label>
                  <Input
                    id="pin"
                    type="password"
                    inputMode="numeric"
                    pattern="[0-9]{4,6}"
                    placeholder="······"
                    maxLength={6}
                    value={pin}
                    onChange={(e) => setPin(e.target.value.replace(/\D/g, ""))}
                    required
                    className="mt-1 text-center text-2xl tracking-widest"
                  />
                </div>
                <Button type="submit" className="w-full h-11 bg-teal-600 hover:bg-teal-700" disabled={loading}>
                  {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                  Iniciar Treinamento
                </Button>
              </form>
            )}
          </CardContent>
        </Card>

        <p className="text-center text-xs text-gray-400 mt-6">
          É terapeuta?{" "}
          <a href="/cadastro" className="text-blue-500 hover:underline">Criar conta</a>
          {" · "}NeuroPeak © {new Date().getFullYear()}
        </p>
      </motion.div>
    </div>
  );
}
