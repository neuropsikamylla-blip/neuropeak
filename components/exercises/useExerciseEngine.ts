"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import { useExerciseProgress } from "@/components/exercises/ExerciseWrapper";

// ── Engine de progressão padrão dos exercícios ────────────────────────────────
// Decisões da Kamylla:
//  • a sessão dura ~7 min (faixa 6-8) — controlada pelo TEMPO, não por nº fixo de
//    rodadas (antes terminava em ~2 min mas anunciava mais);
//  • a barra avança pelo tempo decorrido, em SALTOS de 10% (não 1% a 1%, para não
//    parecer cronômetro / dar ansiedade);
//  • a dificuldade sobe +1 a cada 2 ACERTOS SEGUIDOS (erro zera a sequência).

export const DEFAULT_TARGET_MS = 7 * 60 * 1000;

/**
 * Barra por tempo + controle de fim da sessão.
 * - begin(): inicie quando o jogo (pós-tutorial) começar.
 * - isTimeUp(): cheque ao fim de cada rodada para encerrar.
 * - finish(): força a barra a 100% no encerramento.
 */
export function useTimedProgress(targetMs: number = DEFAULT_TARGET_MS) {
  const markProgress = useExerciseProgress();
  const startRef = useRef(0);
  const finishedRef = useRef(false);
  const [progressPct, setProgressPct] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      if (startRef.current === 0 || finishedRef.current) return;
      const el = Date.now() - startRef.current;
      const pct = Math.min(100, Math.round(((el / targetMs) * 100) / 10) * 10); // saltos de 10%
      markProgress(pct);
      setProgressPct(pct);
    }, 400);
    return () => clearInterval(id);
  }, [targetMs, markProgress]);

  const begin = useCallback(() => { if (!startRef.current) startRef.current = Date.now(); }, []);
  const isTimeUp = useCallback(
    () => startRef.current > 0 && Date.now() - startRef.current >= targetMs,
    [targetMs],
  );
  const elapsedSec = useCallback(
    () => (startRef.current ? Math.round((Date.now() - startRef.current) / 1000) : 0),
    [],
  );
  const finish = useCallback(() => {
    finishedRef.current = true;
    markProgress(100);
    setProgressPct(100);
  }, [markProgress]);

  return { begin, isTimeUp, elapsedSec, finish, progressPct };
}

/**
 * Dificuldade adaptativa "de musculação": +1 a cada 2 acertos SEGUIDOS, e −1 a
 * cada 2 erros seguidos (assim o treino fica sempre no ponto — nem fácil demais,
 * nem impossível). Guarda o nível máximo alcançado (para a adaptação entre sessões).
 */
export function useAdaptiveLevel(initial: number, max = 10, min = 1) {
  const curRef = useRef(Math.max(min, initial));
  const streakRef = useRef(0);   // >0 acertos seguidos, <0 erros seguidos
  const reachedRef = useRef(Math.max(min, initial));

  const onResult = useCallback((correct: boolean) => {
    if (correct) {
      streakRef.current = Math.max(0, streakRef.current) + 1;
      if (streakRef.current >= 2) {
        streakRef.current = 0;
        curRef.current = Math.min(max, curRef.current + 1);
        reachedRef.current = Math.max(reachedRef.current, curRef.current);
      }
    } else {
      streakRef.current = Math.min(0, streakRef.current) - 1;
      if (streakRef.current <= -2) {
        streakRef.current = 0;
        curRef.current = Math.max(min, curRef.current - 1);
      }
    }
  }, [max, min]);

  return {
    level: useCallback(() => curRef.current, []),
    reached: useCallback(() => reachedRef.current, []),
    onResult,
  };
}
