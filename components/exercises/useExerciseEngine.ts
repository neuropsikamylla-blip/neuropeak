"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import { useExerciseProgress } from "@/components/exercises/ExerciseWrapper";

// ── Engine de progressão padrão dos exercícios ────────────────────────────────
// Decisões da Kamylla:
//  • a sessão dura ~7 min (faixa 6-8) — controlada pelo TEMPO ATIVO;
//  • **TEMPO ATIVO**: o cronômetro (e a barra) só avança quando o paciente está
//    INTERAGINDO. Se ele para de tocar/responder por IDLE_MS, o tempo PAUSA — assim
//    não dá para "deixar a barra completar sozinha" sem fazer o exercício;
//  • a barra avança em SALTOS de 10% (não 1% a 1%, para não parecer cronômetro);
//  • a dificuldade sobe +1 a cada 2 ACERTOS SEGUIDOS (erro zera a sequência).

export const DEFAULT_TARGET_MS = 7 * 60 * 1000;
const IDLE_MS = 15000;   // 15s sem interação → cronômetro pausa (paciente parado/ausente)

/**
 * Barra por TEMPO ATIVO + controle de fim da sessão.
 * - begin(): inicie quando o jogo (pós-tutorial) começar.
 * - isTimeUp(): cheque ao fim de cada rodada para encerrar.
 * - finish(): força a barra a 100% no encerramento.
 * O tempo só corre enquanto houver toque/tecla nos últimos IDLE_MS.
 */
export function useTimedProgress(targetMs: number = DEFAULT_TARGET_MS) {
  const markProgress = useExerciseProgress();
  const activeMsRef = useRef(0);        // tempo ATIVO acumulado (ms)
  const lastActivityRef = useRef(0);    // timestamp do último toque/tecla
  const lastTickRef = useRef(0);        // timestamp do último tick do intervalo
  const startedRef = useRef(false);
  const finishedRef = useRef(false);
  const [progressPct, setProgressPct] = useState(0);

  // Qualquer toque/tecla na tela = paciente engajado → mantém o cronômetro vivo.
  useEffect(() => {
    const onActivity = () => { lastActivityRef.current = Date.now(); };
    window.addEventListener("pointerdown", onActivity, { passive: true });
    window.addEventListener("keydown", onActivity);
    return () => {
      window.removeEventListener("pointerdown", onActivity);
      window.removeEventListener("keydown", onActivity);
    };
  }, []);

  useEffect(() => {
    const id = setInterval(() => {
      if (!startedRef.current || finishedRef.current) return;
      const now = Date.now();
      const dt = now - lastTickRef.current;
      lastTickRef.current = now;
      // só acumula o tempo se houve interação recente (paciente fazendo o exercício)
      if (now - lastActivityRef.current < IDLE_MS) {
        activeMsRef.current = Math.min(targetMs, activeMsRef.current + dt);
      }
      const pct = Math.min(100, Math.round(((activeMsRef.current / targetMs) * 100) / 10) * 10);
      markProgress(pct);
      setProgressPct(pct);
    }, 400);
    return () => clearInterval(id);
  }, [targetMs, markProgress]);

  const begin = useCallback(() => {
    if (!startedRef.current) {
      startedRef.current = true;
      const now = Date.now();
      lastActivityRef.current = now;
      lastTickRef.current = now;
    }
  }, []);
  const isTimeUp = useCallback(() => activeMsRef.current >= targetMs, [targetMs]);
  const elapsedSec = useCallback(() => Math.round(activeMsRef.current / 1000), []);
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
