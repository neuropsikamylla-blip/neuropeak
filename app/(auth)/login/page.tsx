"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import Image from "next/image";
import { Eye, EyeOff, Loader2 } from "lucide-react";
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
    <div className="min-h-screen bg-gradient-to-br from-[#0a1631] via-[#0d1b3e] to-[#10234d] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <motion.div
            className="inline-block mb-2"
            whileHover={{ scale: 1.05 }}
          >
            <Image
              src="/icon-192.png"
              alt="NeuroPeak"
              width={96}
              height={96}
              className="rounded-3xl mx-auto"
              priority
            />
          </motion.div>
          <h1 className="text-3xl font-bold text-white">NeuroPeak</h1>
          <p className="text-blue-200/70 text-sm mt-1">Plataforma de Treinamento Cognitivo</p>
        </div>

        <Card className="shadow-2xl border border-white/10 bg-[#11213f]/90 backdrop-blur">
          <CardHeader className="pb-4">
            {/* Mode toggle */}
            <div className="flex gap-1 p-1 bg-white/5 rounded-xl mb-4">
              <button
                className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${mode === "therapist" ? "bg-white/15 shadow text-white" : "text-blue-200/60 hover:text-blue-100"}`}
                onClick={() => setMode("therapist")}
              >
                Terapeuta
              </button>
              <button
                className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${mode === "patient" ? "bg-white/15 shadow text-white" : "text-blue-200/60 hover:text-blue-100"}`}
                onClick={() => setMode("patient")}
              >
                Paciente
              </button>
            </div>

            <CardTitle className="text-lg text-white">
              {mode === "therapist" ? "Acesso do Terapeuta" : "Acesso do Paciente"}
            </CardTitle>
            <CardDescription className="text-blue-200/60">
              {mode === "therapist"
                ? "Entre com seu email e senha"
                : "Entre com seu código (ex: COG09834) e PIN"}
            </CardDescription>
          </CardHeader>

          <CardContent>
            {mode === "therapist" ? (
              <form onSubmit={handleTherapistLogin} className="space-y-4">
                <div>
                  <Label htmlFor="email" className="text-blue-100">Email</Label>
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
                <div>
                  <Label htmlFor="password" className="text-blue-100">Senha</Label>
                  <div className="relative mt-1">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="pr-10 bg-white/5 border-white/15 text-white placeholder:text-blue-200/40"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-blue-200/50 hover:text-blue-100"
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
                  <Label htmlFor="patientId" className="text-blue-100">Código do Paciente</Label>
                  <Input
                    id="patientId"
                    type="text"
                    placeholder="Ex: COG09834"
                    value={patientId}
                    onChange={(e) => setPatientId(e.target.value.toUpperCase())}
                    required
                    className="mt-1 font-mono text-lg tracking-widest text-center uppercase bg-white/5 border-white/15 text-white placeholder:text-blue-200/40"
                  />
                </div>
                <div>
                  <Label htmlFor="pin" className="text-blue-100">PIN</Label>
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
                    className="mt-1 text-center text-2xl tracking-widest bg-white/5 border-white/15 text-white placeholder:text-blue-200/40"
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

        <p className="text-center text-xs text-blue-200/50 mt-6">
          É terapeuta?{" "}
          <a href="/cadastro" className="text-blue-300 hover:underline">Criar conta</a>
          {" · "}NeuroPeak © {new Date().getFullYear()}
        </p>
      </motion.div>
    </div>
  );
}
