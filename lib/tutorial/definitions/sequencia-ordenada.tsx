"use client";

import { useEffect, useRef, useState, type ComponentType } from "react";
import { DemoPointer } from "@/components/exercises/tutorial/DemoPointer";
import { compararRespostaDaFamilia } from "@/lib/tutorial/comparadores";
import type { GuidedAttemptProps, TutorialDefinition } from "@/lib/tutorial/types";

export interface SequencePresentationHooks<T> {
  onItemStart: (item: T, index: number) => void;
  onItemEnd: (item: T, index: number) => void;
  isCancelled: () => boolean;
}

export interface BoardProps<T> {
  total: number;
  filled: number;
  activeIndex: number;
  activeChoice?: T;
  interactive: boolean;
  onChoice: (item: T) => void;
  enteredItems: T[];
  pressedChoice?: T;
  highlightedIndex?: number;
  presenting?: boolean;
}

export interface FamiliaSequenciaConfig<T> {
  exerciseId: string;
  version: number;
  guidedInstruction: string;
  retryHint?: string;
  smallestValidUnit: number;
  /** Itens da demonstração e gerador da sequência da guiada. */
  demonstrationItems: T[];
  createGuidedSequence: () => T[];
  /** Como apresentar (áudio pré-gravado no Span; voz sintetizada nos demais). */
  present: (itens: T[], hooks: SequencePresentationHooks<T>) => Promise<void>;
  /** O painel de resposta real do exercício, com o alvo marcado por data-attribute. */
  Board: ComponentType<BoardProps<T>>;
  /** Seletor CSS do alvo, para o DemoPointer encontrar. */
  targetSelectorFor: (item: T) => string;
  /** Transforma a sequência apresentada na resposta que deve ser demonstrada e validada. */
  transformarResposta?: (sequencia: T[]) => T[];
  /**
   * Como comparar a resposta dada com a esperada. O padrão é POSICIONAL — a resposta certa é a
   * mesma sequência, na mesma ordem. Famílias em que a resposta não tem ordem (seleção de um
   * conjunto) fornecem sua própria comparação.
   */
  compararResposta?: (esperada: T[], dada: T[]) => boolean;
}

// Todos os tempos pedagógicos calibrados vivem uma vez só, na fábrica da família.
const POST_LISTENING_PAUSE_MS = 1000;
const POINTER_ENTRY_PULSE_MS = 500;
const POINTER_MOVE_MS = 650;
const POINTER_AIM_MS = 220;
const POINTER_PRESS_MS = 420;
const POINTER_RELEASE_MS = 260;
const BETWEEN_DIGITS_MS = 520;
const FINAL_PAUSE_MS = 800;
const VISUAL_ITEM_ON_MS = 1500;
const VISUAL_ITEM_GAP_MS = 500;
const VISUAL_SETTLE_MS = 1200;

function wait(ms: number, isCancelled: () => boolean): Promise<boolean> {
  return new Promise((resolve) => {
    if (isCancelled()) {
      resolve(false);
      return;
    }

    let settled = false;
    const finish = (completed: boolean) => {
      if (settled) return;
      settled = true;
      window.clearTimeout(timeoutId);
      window.clearInterval(cancelCheck);
      resolve(completed);
    };
    const timeoutId = window.setTimeout(() => finish(!isCancelled()), ms);
    const cancelCheck = window.setInterval(() => {
      if (isCancelled()) finish(false);
    }, 25);
  });
}

function respostaEsperada<T>(
  sequencia: T[],
  transformarResposta?: (sequencia: T[]) => T[],
): T[] {
  const copia = [...sequencia];
  return transformarResposta ? transformarResposta(copia) : copia;
}


/** Apresentação visual compartilhada pelas sequências espaciais. */
export async function presentVisualSequence<T>(
  itens: T[],
  hooks: SequencePresentationHooks<T>,
): Promise<void> {
  for (let index = 0; index < itens.length; index++) {
    if (hooks.isCancelled()) return;
    const item = itens[index];
    hooks.onItemStart(item, index);
    if (!await wait(VISUAL_ITEM_ON_MS, hooks.isCancelled)) return;
    hooks.onItemEnd(item, index);
    if (index < itens.length - 1
      && !await wait(VISUAL_ITEM_GAP_MS, hooks.isCancelled)) return;
  }
  await wait(VISUAL_SETTLE_MS, hooks.isCancelled);
}

function criarDemonstration<T>(config: FamiliaSequenciaConfig<T>) {
  return function Demonstration({ onDone }: { onDone: () => void }) {
    const containerRef = useRef<HTMLDivElement>(null);
    const [demonstrationPhase, setDemonstrationPhase] = useState<
      "listening" | "answering" | "done"
    >("listening");
    const [pointerPhase, setPointerPhase] = useState<"locating" | "moving" | "pressing">(
      "locating",
    );
    const [targetSelector, setTargetSelector] = useState<string | null>(null);
    const [pressedChoice, setPressedChoice] = useState<T | undefined>(undefined);
    const [activeChoice, setActiveChoice] = useState<T | undefined>(undefined);
    const [activeIndex, setActiveIndex] = useState(-1);
    const [filled, setFilled] = useState(0);
    const [enteredItems, setEnteredItems] = useState<T[]>([]);
    const [highlightedIndex, setHighlightedIndex] = useState(-1);

    const onDoneRef = useRef(onDone);
    onDoneRef.current = onDone;

    useEffect(() => {
      let cancelled = false;

      async function run() {
        await config.present(config.demonstrationItems, {
          isCancelled: () => cancelled,
          onItemStart: (item, index) => {
            setActiveChoice(item);
            setActiveIndex(index);
          },
          onItemEnd: (_item, index) => {
            setActiveChoice(undefined);
            setActiveIndex(-1);
            setFilled(index + 1);
          },
        });
        if (cancelled) return;

        setDemonstrationPhase("answering");
        setFilled(0);
        const ordemDaResposta = respostaEsperada(
          config.demonstrationItems,
          config.transformarResposta,
        );
        if (!await wait(POST_LISTENING_PAUSE_MS, () => cancelled)) return;

        setTargetSelector("[data-demo-pointer-start]");
        setPointerPhase("locating");
        if (!await wait(POINTER_ENTRY_PULSE_MS, () => cancelled)) return;

        for (let index = 0; index < ordemDaResposta.length; index++) {
          if (cancelled) return;
          const item = ordemDaResposta[index];

          setTargetSelector(config.targetSelectorFor(item));
          setPointerPhase("moving");
          if (!await wait(POINTER_MOVE_MS, () => cancelled)) return;
          if (!await wait(POINTER_AIM_MS, () => cancelled)) return;

          setPointerPhase("pressing");
          setPressedChoice(item);
          if (!await wait(POINTER_PRESS_MS, () => cancelled)) return;

          setPressedChoice(undefined);
          setPointerPhase("moving");
          if (!await wait(POINTER_RELEASE_MS, () => cancelled)) return;

          setEnteredItems((current) => [...current, item]);
          setFilled(index + 1);
          setHighlightedIndex(index);
          if (!await wait(BETWEEN_DIGITS_MS, () => cancelled)) return;
          setHighlightedIndex(-1);
        }

        if (!await wait(FINAL_PAUSE_MS, () => cancelled)) return;
        setDemonstrationPhase("done");
        onDoneRef.current();
      }

      void run();
      return () => { cancelled = true; };
    }, []);

    return (
      <div
        ref={containerRef}
        className={`relative ${demonstrationPhase === "answering" ? "pointer-events-none" : ""}`}
      >
        <span
          data-demo-pointer-start
          aria-hidden="true"
          className="pointer-events-none absolute bottom-12 left-12 h-px w-px"
        />
        <config.Board
          total={config.demonstrationItems.length}
          filled={filled}
          activeIndex={activeIndex}
          activeChoice={activeChoice}
          interactive={false}
          onChoice={() => {}}
          enteredItems={enteredItems}
          pressedChoice={pressedChoice}
          highlightedIndex={highlightedIndex}
          presenting={demonstrationPhase === "listening"}
        />
        <DemoPointer
          containerRef={containerRef}
          targetSelector={demonstrationPhase === "answering" ? targetSelector : null}
          phase={pointerPhase}
          moveDurationMs={POINTER_MOVE_MS}
          entryPulseDurationMs={POINTER_ENTRY_PULSE_MS}
        />
      </div>
    );
  };
}

function criarGuidedAttempt<T>(config: FamiliaSequenciaConfig<T>) {
  return function GuidedAttempt({ onOutcome }: GuidedAttemptProps) {
    const sequenceRef = useRef<T[]>(config.createGuidedSequence());
    const enteredRef = useRef<T[]>([]);
    const [enteredItems, setEnteredItems] = useState<T[]>([]);
    const [listening, setListening] = useState(true);
    const [activeChoice, setActiveChoice] = useState<T | undefined>(undefined);
    const [activeIndex, setActiveIndex] = useState(-1);
    const [filled, setFilled] = useState(0);

    useEffect(() => {
      let cancelled = false;
      const sequence = sequenceRef.current;

      async function run() {
        await config.present(sequence, {
          isCancelled: () => cancelled,
          onItemStart: (item, index) => {
            setActiveChoice(item);
            setActiveIndex(index);
          },
          onItemEnd: (_item, index) => {
            setActiveChoice(undefined);
            setActiveIndex(-1);
            setFilled(index + 1);
          },
        });
        if (!cancelled) {
          setFilled(0);
          setListening(false);
        }
      }

      void run();
      return () => { cancelled = true; };
    }, []);

    function handleChoice(item: T) {
      if (listening || enteredRef.current.length >= config.smallestValidUnit) return;

      const next = [...enteredRef.current, item];
      enteredRef.current = next;
      setEnteredItems(next);
      setFilled(next.length);

      if (next.length === config.smallestValidUnit) {
        const expected = respostaEsperada(
          sequenceRef.current,
          config.transformarResposta,
        );
        const isCorrect = compararRespostaDaFamilia(config, expected, next);
        onOutcome(isCorrect ? "correct" : "incorrect");
      }
    }

    return (
      <config.Board
        total={config.smallestValidUnit}
        filled={filled}
        activeIndex={activeIndex}
        activeChoice={activeChoice}
        interactive={!listening}
        onChoice={handleChoice}
        enteredItems={enteredItems}
        presenting={listening}
      />
    );
  };
}

/** Uma única fábrica contém o ritmo, o gesto e o cursor da família inteira. */
export function criarTutorialSequenciaOrdenada<T>(
  config: FamiliaSequenciaConfig<T>,
): TutorialDefinition {
  return {
    exerciseId: config.exerciseId,
    version: config.version,
    Demonstration: criarDemonstration(config),
    GuidedAttempt: criarGuidedAttempt(config),
    retryHint: config.retryHint
      ?? "Ouça novamente e responda quando as opções ficarem disponíveis.",
    guidedInstruction: config.guidedInstruction,
    smallestValidUnit: config.smallestValidUnit,
  };
}
