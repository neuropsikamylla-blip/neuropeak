"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RefreshCw, Copy, Check, Eye, EyeOff } from "lucide-react";

interface PatientCredentialsProps {
  patientId: string;
  patientCode?: string | null;
}

export function PatientCredentials({
  patientId,
  patientCode: initialCode,
}: PatientCredentialsProps) {
  const [pin, setPin] = useState<string | null>(null);
  const [code, setCode] = useState<string | null>(initialCode ?? null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState<"code" | "pin" | null>(null);
  const [showPin, setShowPin] = useState(false);

  async function handleGeneratePin() {
    if (!confirm("Gerar um novo PIN vai invalidar o PIN atual do paciente. Continuar?")) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/patients/${patientId}/regenerate-pin`, { method: "POST" });
      const data = await res.json();
      if (res.ok) {
        setPin(data.pin);
        if (data.patientCode) setCode(data.patientCode);
        setShowPin(true);
      }
    } finally {
      setLoading(false);
    }
  }

  function copyText(text: string, type: "code" | "pin") {
    navigator.clipboard.writeText(text);
    setCopied(type);
    setTimeout(() => setCopied(null), 2000);
  }

  return (
    <Card className="col-span-2 lg:col-span-2">
      <CardContent className="p-4">
        <p className="text-xs text-gray-500 mb-2">Credenciais de Acesso do Paciente</p>
        <div className="flex flex-wrap gap-6 items-end">

          {/* Código do paciente */}
          <div>
            <p className="text-xs text-gray-400">Código do Paciente</p>
            {code ? (
              <div className="flex items-center gap-2 mt-1">
                <p className="font-mono font-bold text-blue-700 text-xl tracking-widest">{code}</p>
                <button onClick={() => copyText(code, "code")} aria-label="Copiar código do paciente" className="text-gray-400 hover:text-gray-600">
                  {copied === "code" ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            ) : (
              <p className="font-mono text-sm text-gray-400 mt-1">—</p>
            )}
            <p className="text-xs text-gray-400 mt-1">Informe ao paciente para login</p>
          </div>

          {/* PIN */}
          <div>
            <p className="text-xs text-gray-400">PIN</p>
            {pin ? (
              <div className="flex items-center gap-2 mt-1">
                <p className="font-mono font-bold text-blue-600 text-xl tracking-widest">
                  {showPin ? pin : "••••"}
                </p>
                <button onClick={() => setShowPin(!showPin)} aria-label={showPin ? "Ocultar PIN" : "Mostrar PIN"} className="text-gray-400 hover:text-gray-600">
                  {showPin ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
                <button onClick={() => copyText(pin, "pin")} aria-label="Copiar PIN" className="text-gray-400 hover:text-gray-600">
                  {copied === "pin" ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            ) : (
              <div className="mt-1">
                <p className="font-mono font-bold text-gray-300 text-xl tracking-widest">••••</p>
                <p className="text-xs text-orange-500 mt-0.5">Gere um novo PIN para visualizar</p>
              </div>
            )}
            <p className="text-xs text-gray-400 mt-1">
              {pin ? "Compartilhe com o paciente" : "PIN legado — não visível"}
            </p>
          </div>

          {/* Botão gerar */}
          <div className="ml-auto">
            <Button
              variant="outline"
              size="sm"
              onClick={handleGeneratePin}
              disabled={loading}
              className="text-xs"
            >
              <RefreshCw className={`w-3 h-3 mr-1 ${loading ? "animate-spin" : ""}`} />
              {pin ? "Gerar novo PIN" : "Gerar PIN"}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
