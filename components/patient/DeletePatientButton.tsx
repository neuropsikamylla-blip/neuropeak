"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Trash2, Loader2 } from "lucide-react";

interface DeletePatientButtonProps {
  patientId: string;
  patientName: string;
}

export function DeletePatientButton({ patientId, patientName }: DeletePatientButtonProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleDelete() {
    const confirmed = confirm(
      `Tem certeza que deseja excluir o paciente "${patientName}"?\n\nEsta ação apagará todas as sessões, conquistas e dados clínicos. Não pode ser desfeita.`
    );
    if (!confirmed) return;

    setLoading(true);
    try {
      const res = await fetch(`/api/patients/${patientId}`, { method: "DELETE" });
      if (res.ok) {
        router.push("/pacientes");
        router.refresh();
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleDelete}
      disabled={loading}
      className="text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700"
    >
      {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Trash2 className="w-4 h-4 mr-2" />}
      Excluir Paciente
    </Button>
  );
}
