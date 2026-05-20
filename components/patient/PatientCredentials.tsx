"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RefreshCw, Copy, Check, Eye, EyeOff } from "lucide-react";

interface PatientCredentialsProps {
  patientId: string;
}

export function PatientCredentials({ patientId }: PatientCredentialsProps) {
  const [pin, setPin] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showPin, setShowPin] = useState(true);

  async function handleGeneratePin() {
    if (!confirm("Gerar um novo PIN vai invalidar o PIN atual do paciente. Continuar?")) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/patients/${patientId}/regenerate-pin`, { method: "POST" });
      const data = await res.json();
      if (res.ok) {
        setPin(data.pin);
        setShowPin(true);
      }
    } finally {
      setLoading(false);
    }
  }

  function copyPin() {
    if (pin) {
      navigator.clipboard.writeText(pin);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  return (
    <Card className="col-span-2 lg:col-span-2">
      <CardContent className="p-4">
        <p className="text-xs text-gray-500 mb-2">Credenciais de Acesso do Paciente</p>
        <div className="flex flex-wrap gap-6 items-end">
          <div>
            <p className="text-xs text-gray-400">ID do Paciente</p>
            <p className="font-mono text-sm text-gray-700 break-all">{patientId}</p>
          </div>
          <div>
            <p className="text-xs text-gray-400">PIN</p>
            {pin ? (
              <div className="flex items-center gap-2 mt-1">
                <p className="font-mono font-bold text-blue-600 text-xl tracking-widest">
                  {showPin ? pin : "••••••"}
                </p>
                <button onClick={() => setShowPin(!showPin)} className="text-gray-400 hover:text-gray-600">
                  {showPin ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
                <button onClick={copyPin} className="text-gray-400 hover:text-gray-600">
                  {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            ) : (
              <p className="font-mono font-bold text-gray-400 text-xl tracking-widest mt-1">••••••</p>
            )}
            <p className="text-xs text-gray-400 mt-1">
              {pin ? "Anote o PIN e compartilhe com o paciente" : "PIN definido no cadastro"}
            </p>
          </div>
          <div className="ml-auto">
            <Button
              variant="outline"
              size="sm"
              onClick={handleGeneratePin}
              disabled={loading}
              className="text-xs"
            >
              <RefreshCw className={`w-3 h-3 mr-1 ${loading ? "animate-spin" : ""}`} />
              {pin ? "Gerar outro PIN" : "Gerar Novo PIN"}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
