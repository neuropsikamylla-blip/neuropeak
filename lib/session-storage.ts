export interface DosePersistida {
  decorridoMs: number;
}

export interface SessaoDiaria {
  total: number;
  completed: string[];
  doses: Record<string, DosePersistida>;
}

export interface StorageLike {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
}

export function chaveSessaoDiaria(date = new Date()): string {
  return `np_session_${date.toLocaleDateString("sv")}`;
}

export function normalizarSessaoDiaria(raw: string | null, total: number): SessaoDiaria {
  try {
    const parsed = raw ? JSON.parse(raw) as Partial<SessaoDiaria> : null;
    if (!parsed || parsed.total !== total || !Array.isArray(parsed.completed)) {
      return { total, completed: [], doses: {} };
    }
    return {
      total,
      completed: parsed.completed.filter((id): id is string => typeof id === "string"),
      doses: parsed.doses && typeof parsed.doses === "object" ? parsed.doses : {},
    };
  } catch {
    return { total, completed: [], doses: {} };
  }
}

export function lerSessaoDiaria(storage: StorageLike, total: number, date = new Date()): SessaoDiaria {
  try {
    return normalizarSessaoDiaria(storage.getItem(chaveSessaoDiaria(date)), total);
  } catch {
    return { total, completed: [], doses: {} };
  }
}

export function gravarSessaoDiaria(storage: StorageLike, session: SessaoDiaria, date = new Date()): void {
  try {
    storage.setItem(chaveSessaoDiaria(date), JSON.stringify(session));
  } catch { /* localStorage pode falhar; o exercício continua */ }
}

function storageDoBrowser(): StorageLike | null {
  try {
    return typeof window === "undefined" ? null : window.localStorage;
  } catch {
    return null;
  }
}

export function lerSessaoDiariaLocal(total: number, date = new Date()): SessaoDiaria {
  const storage = storageDoBrowser();
  return storage ? lerSessaoDiaria(storage, total, date) : { total, completed: [], doses: {} };
}

export function gravarSessaoDiariaLocal(session: SessaoDiaria, date = new Date()): void {
  const storage = storageDoBrowser();
  if (storage) gravarSessaoDiaria(storage, session, date);
}

function lerSessaoExistente(storage: StorageLike, date = new Date()): SessaoDiaria {
  try {
    const raw = storage.getItem(chaveSessaoDiaria(date));
    const parsed = raw ? JSON.parse(raw) as Partial<SessaoDiaria> : null;
    const total = typeof parsed?.total === "number" ? parsed.total : 0;
    return normalizarSessaoDiaria(raw, total);
  } catch {
    return { total: 0, completed: [], doses: {} };
  }
}

export function lerDosePersistida(storage: StorageLike, exerciseId: string, date = new Date()): number {
  const dose = lerSessaoExistente(storage, date).doses[exerciseId]?.decorridoMs;
  return typeof dose === "number" && Number.isFinite(dose) ? Math.max(0, dose) : 0;
}

export function gravarDosePersistida(storage: StorageLike, exerciseId: string, decorridoMs: number, date = new Date()): void {
  const session = lerSessaoExistente(storage, date);
  gravarSessaoDiaria(storage, atualizarDose(session, exerciseId, decorridoMs), date);
}

export function limparDosePersistida(storage: StorageLike, exerciseId: string, date = new Date()): void {
  // Zerar ao concluir diferencia recarregar no meio (retoma) de iniciar outro bloco legítimo.
  gravarDosePersistida(storage, exerciseId, 0, date);
}

export function lerDosePersistidaLocal(exerciseId: string, date = new Date()): number {
  const storage = storageDoBrowser();
  return storage ? lerDosePersistida(storage, exerciseId, date) : 0;
}

export function gravarDosePersistidaLocal(exerciseId: string, decorridoMs: number, date = new Date()): void {
  const storage = storageDoBrowser();
  if (storage) gravarDosePersistida(storage, exerciseId, decorridoMs, date);
}

export function limparDosePersistidaLocal(exerciseId: string, date = new Date()): void {
  const storage = storageDoBrowser();
  if (storage) limparDosePersistida(storage, exerciseId, date);
}

export function atualizarDose(session: SessaoDiaria, exerciseId: string, decorridoMs: number): SessaoDiaria {
  return {
    ...session,
    doses: { ...session.doses, [exerciseId]: { decorridoMs: Math.max(0, decorridoMs) } },
  };
}

export function zerarDose(session: SessaoDiaria, exerciseId: string): SessaoDiaria {
  return atualizarDose(session, exerciseId, 0);
}

export function marcarExercicioConcluido(session: SessaoDiaria, exerciseId: string): SessaoDiaria {
  return session.completed.includes(exerciseId)
    ? session
    : { ...session, completed: [...session.completed, exerciseId] };
}

export function progressoDaSessao(completed: number, total?: number): number {
  return total && total > 0 ? Math.round((completed / total) * 100) : 0;
}
