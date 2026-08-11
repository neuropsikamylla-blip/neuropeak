"use client";

import { useEffect, useRef, useState } from "react";
import { Check, Eye } from "lucide-react";
import { DemoPointer } from "@/components/exercises/tutorial/DemoPointer";
import { gerarRodada, type FocusRound } from "@/lib/focus/commands";
import { STEPS } from "@/lib/focus/progression";
import { charById, COR_HEX, type FocusChar } from "@/lib/focus/roster";
import {
  CHAR_H,
  CHAR_W,
  bobOffset,
  montarCenaEspalhada,
  passoDeriva,
  type LiveChar,
} from "@/lib/focus/scene";
import { RITMO_TUTORIAL_APROVADO } from "@/lib/tutorial/definitions/sequencia-ordenada";
import type { GuidedAttemptProps, TutorialDefinition } from "@/lib/tutorial/types";

const IMG_BASE = "/exercises/agentes-personagens";
const IMG_VERSION = "?v=2";
const SCENE_HEIGHT = 480;
// Fator de encolhimento da cena do tutorial. Ver montarCenaDoTutorial.
const SCENE_SCALE = 0.7;
const MAX_SCENE_ATTEMPTS = 20;
const COMMAND_PAUSE_MS = 1800;
const SCENE_ENTRY_PAUSE_MS = 500;

interface TutorialScene {
  round: FocusRound;
  characters: LiveChar[];
  width: number;
  height: number;
}

function imageSource(id: string): string {
  return `${IMG_BASE}/${id}.png${IMG_VERSION}`;
}

function sharesAttribute(target: FocusChar, distractor: FocusChar): boolean {
  return target.cor === distractor.cor
    || target.acessorios.some((accessory) => distractor.acessorios.includes(accessory))
    || (!!target.objeto && target.objeto === distractor.objeto);
}

function hasSimilarDistractor(round: FocusRound): boolean {
  const target = charById(round.alvoId);
  if (!target) return false;

  return round.personagensIds.some((id) => {
    if (id === round.alvoId) return false;
    const distractor = charById(id);
    return !!distractor && sharesAttribute(target, distractor);
  });
}

function wait(ms: number, isCancelled: () => boolean): Promise<boolean> {
  return new Promise((resolve) => {
    const timer = window.setTimeout(() => resolve(!isCancelled()), ms);
    if (isCancelled()) {
      window.clearTimeout(timer);
      resolve(false);
    }
  });
}

function CommandCard({ round, onConfirm }: { round: FocusRound; onConfirm?: () => void }) {
  const parts = round.texto.split("**");

  // z-10, e não z-30: o cursor da demonstração (z-20) precisa aparecer SOBRE o cartão para
  // demonstrar o clique no OK. Não há conflito — quando o cartão está na tela, a cena ainda não
  // entrou, e quando a cena entra o cartão já saiu.
  return (
    <div className="absolute inset-0 z-10 flex items-center justify-center px-5">
      <div className="w-full max-w-sm rounded-3xl border border-[#DDE3EC] bg-white px-6 py-6 text-center shadow-xl">
        <p className="mb-3 text-xs font-bold uppercase tracking-widest text-[#5b6b82]">
          <Eye aria-hidden className="mr-1 inline h-4 w-4" />
          Encontre
        </p>
        {round.amostraCor && (
          <span
            aria-hidden
            className="mx-auto mb-2 block h-8 w-8 rounded-full border-2 border-[#DDE3EC]"
            style={{ background: COR_HEX[round.amostraCor] }}
          />
        )}
        <p className="text-lg font-black leading-snug text-[#0f2038]">
          {parts.map((part, index) => index % 2 === 1
            ? <span key={index} className="text-red-400">{part}</span>
            : <span key={index}>{part}</span>)}
        </p>
        <p className="mt-3 text-xs text-[#5b6b82]">
          Guarde bem — depois de começar, o alvo não fica na tela.
        </p>
        <button
          type="button"
          data-tutorial-ok
          disabled={!onConfirm}
          onClick={onConfirm}
          className="mt-4 h-11 rounded-full bg-sky-600 px-10 text-base font-black text-white disabled:opacity-100"
        >
          OK
        </button>
      </div>
    </div>
  );
}

function MovingCharacters({
  characters,
  width,
  height,
  interactive,
  hitId,
  onSelect,
}: {
  characters: LiveChar[];
  width: number;
  height: number;
  interactive: boolean;
  hitId: string | null;
  onSelect: (character: LiveChar) => void;
}) {
  const charactersRef = useRef(characters);
  const nodes = useRef<Map<string, HTMLButtonElement>>(new Map());

  useEffect(() => {
    charactersRef.current = characters;
    let frame = 0;
    let animationFrameId: number | null = null;

    const tick = () => {
      frame += 1;
      passoDeriva(charactersRef.current, width, height);
      for (const character of charactersRef.current) {
        const node = nodes.current.get(character.uid);
        if (!node) continue;
        const bob = bobOffset(frame, character.ph);
        node.style.transform = `translate(${character.x - character.bx}px, ${character.y - character.by + bob}px)`;
      }
      animationFrameId = requestAnimationFrame(tick);
    };

    animationFrameId = requestAnimationFrame(tick);
    return () => {
      if (animationFrameId !== null) cancelAnimationFrame(animationFrameId);
    };
  }, [characters, height, width]);

  // A cena é montada numa área ampliada e o conjunto inteiro é encolhido aqui. Escalar por CSS, e
  // não reduzir CHAR_W/CHAR_H, mantém a geometria idêntica à do exercício — posições, distâncias e
  // deriva continuam saindo das mesmas funções, sem uma segunda régua de tamanhos.
  // O cursor fica FORA deste elemento de propósito: ele mede a caixa real do alvo, que já vem
  // escalada, então aponta para o lugar certo sem precisar saber da escala.
  return (
    <div
      className="absolute left-0 top-0"
      style={{
        width,
        height,
        transform: `scale(${SCENE_SCALE})`,
        transformOrigin: "0 0",
      }}
    >
      {characters.map((character) => (
        <button
          key={character.uid}
          ref={(node) => {
            if (node) nodes.current.set(character.uid, node);
            else nodes.current.delete(character.uid);
          }}
          type="button"
          data-focus-character={character.uid}
          aria-label="personagem"
          aria-disabled={!interactive}
          onPointerDown={() => {
            if (interactive) onSelect(character);
          }}
          className="absolute border-0 bg-transparent p-[10px]"
          style={{
            left: character.bx - 10,
            top: character.by - 10,
            width: CHAR_W + 20,
            height: CHAR_H + 20,
            cursor: interactive ? "pointer" : "default",
            touchAction: "manipulation",
            zIndex: hitId === character.id ? 20 : 10,
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={imageSource(character.id)}
            alt=""
            draggable={false}
            decoding="async"
            style={{
              width: CHAR_W,
              height: CHAR_H,
              display: "block",
              userSelect: "none",
              pointerEvents: "none",
              // O acerto acende o personagem com o MESMO brilho verde do exercício. Antes era uma
              // moldura retangular, que no exercício só aparece num caso raro (comando de dois
              // alvos) — o tutorial estava ensinando um sinal que o paciente quase nunca veria.
              filter: hitId === character.id
                ? "drop-shadow(0 0 10px rgba(74,222,128,.95)) drop-shadow(0 0 20px rgba(74,222,128,.8))"
                : "drop-shadow(0 3px 6px rgba(0,0,0,.45))",
            }}
          />
        </button>
      ))}
    </div>
  );
}

function CorrectFeedback({ visible }: { visible: boolean }) {
  if (!visible) return null;
  return (
    <div className="absolute bottom-4 left-1/2 z-30 flex max-w-[90%] -translate-x-1/2 items-center gap-1 rounded-xl bg-green-600/95 px-4 py-2 text-center text-sm font-bold text-white">
      <Check aria-hidden className="h-4 w-4" />
      Correto!
    </div>
  );
}

/**
 * Monta a cena do tutorial dentro da caixa recebida.
 *
 * A caixa do tutorial é bem menor que a tela cheia do exercício. Com o personagem no mesmo tamanho
 * em pixels dos dois lados, ele ocupa uma fatia MAIOR da caixa — foi o que ela viu na validação de
 * 11/ago ("podem ser menores para ficar mais uniforme"). Montar numa área ampliada e encolher o
 * conjunto por CSS preserva a proporção entre personagem e arena, que é o que faz o tutorial
 * parecer o treino em vez de uma versão apertada dele.
 *
 * Vive fora dos componentes para que a demonstração e a tentativa guiada não possam divergir — mas
 * é só CHAMADA lá dentro: gerar cena no escopo do módulo quebraria a hidratação.
 */
function montarCenaDoTutorial(arena: HTMLDivElement): TutorialScene {
  const width = arena.clientWidth / SCENE_SCALE;
  const height = arena.clientHeight / SCENE_SCALE;

  let round = gerarRodada(STEPS[0].etapa, STEPS[0].n, undefined, STEPS[0].semelhantes);
  // Reamostra até haver um distrator que compartilhe atributo com o alvo: é o que faz a
  // demonstração mostrar discriminação, e não um acerto óbvio. Com teto, nunca em laço aberto.
  for (let attempt = 1; attempt < MAX_SCENE_ATTEMPTS && !hasSimilarDistractor(round); attempt++) {
    round = gerarRodada(STEPS[0].etapa, STEPS[0].n, undefined, STEPS[0].semelhantes);
  }

  const characters = montarCenaEspalhada(
    round.personagensIds,
    [round.alvoId],
    width,
    height,
    STEPS[0].vel,
  );
  return { round, characters, width, height };
}

function Demonstration({ onDone }: { onDone: () => void }) {
  const arenaRef = useRef<HTMLDivElement>(null);
  const onDoneRef = useRef(onDone);
  const [scene, setScene] = useState<TutorialScene | null>(null);
  const [showScene, setShowScene] = useState(false);
  const [pointerPhase, setPointerPhase] = useState<"locating" | "moving" | "pressing">(
    "locating",
  );
  const [targetSelector, setTargetSelector] = useState("[data-demo-pointer-start]");
  const [correct, setCorrect] = useState(false);
  onDoneRef.current = onDone;

  useEffect(() => {
    const arena = arenaRef.current;
    if (!arena) return;
    setScene(montarCenaDoTutorial(arena));
  }, []);

  useEffect(() => {
    if (!scene) return;
    let cancelled = false;
    // A cena é capturada aqui de propósito. O `if (!scene) return` acima não vale dentro de `run`:
    // uma declaração de função não herda o estreitamento de tipo do escopo que a cerca, e o
    // compilador continua vendo `scene` como possivelmente nula lá dentro. Capturar também deixa o
    // roteiro imune a uma troca de cena no meio da execução.
    const cena = scene;

    async function run() {
      // O OK é o PRIMEIRO gesto da tarefa real: sem ele a cena não aparece, e a preparação diz ao
      // paciente "leia com calma e toque em OK". A regra 2 da T1 manda demonstrar a tarefa inteira,
      // então o ponteiro pressiona o botão de verdade em vez de o cartão sumir sozinho.
      if (!await wait(COMMAND_PAUSE_MS, () => cancelled)) return;
      setTargetSelector("[data-tutorial-ok]");
      setPointerPhase("moving");
      if (!await wait(RITMO_TUTORIAL_APROVADO.pointerMoveMs, () => cancelled)) return;
      if (!await wait(RITMO_TUTORIAL_APROVADO.pointerAimMs, () => cancelled)) return;
      setPointerPhase("pressing");
      if (!await wait(RITMO_TUTORIAL_APROVADO.pointerPressMs, () => cancelled)) return;
      setShowScene(true);
      setPointerPhase("locating");
      if (!await wait(SCENE_ENTRY_PAUSE_MS, () => cancelled)) return;
      const target = cena.characters.find((character) => character.id === cena.round.alvoId);
      if (!target) return;
      setTargetSelector(`[data-focus-character="${target.uid}"]`);
      setPointerPhase("moving");
      if (!await wait(RITMO_TUTORIAL_APROVADO.pointerMoveMs, () => cancelled)) return;
      if (!await wait(RITMO_TUTORIAL_APROVADO.pointerAimMs, () => cancelled)) return;
      setPointerPhase("pressing");
      if (!await wait(RITMO_TUTORIAL_APROVADO.pointerPressMs, () => cancelled)) return;
      setCorrect(true);
      setPointerPhase("moving");
      if (!await wait(RITMO_TUTORIAL_APROVADO.pointerReleaseMs, () => cancelled)) return;
      if (!await wait(RITMO_TUTORIAL_APROVADO.finalPauseMs, () => cancelled)) return;
      onDoneRef.current();
    }

    void run();
    return () => { cancelled = true; };
  }, [scene]);

  return (
    <div
      ref={arenaRef}
      className="relative w-full overflow-hidden rounded-2xl border border-[#DDE3EC] bg-white"
      style={{ height: SCENE_HEIGHT }}
    >
      {/* Ponto de partida do cursor. Fica na arena, e não dentro da cena, porque o ponteiro entra
          antes dela — o primeiro gesto demonstrado é o OK do cartão. */}
      <span data-demo-pointer-start aria-hidden className="absolute bottom-8 left-8 h-px w-px" />
      {scene && !showScene && <CommandCard round={scene.round} />}
      {scene && showScene && (
        <>
          <MovingCharacters
            characters={scene.characters}
            width={scene.width}
            height={scene.height}
            interactive={false}
            hitId={correct ? scene.round.alvoId : null}
            onSelect={() => {}}
          />
          <CorrectFeedback visible={correct} />
        </>
      )}
      {/* Fora dos dois blocos acima: o mesmo cursor atravessa as duas etapas, do OK ao personagem.
          `trackTarget` fica ligado o tempo todo — sobre o botão parado ele apenas remede o mesmo
          ponto, e é o que faz o cursor acompanhar o personagem, que nunca para de derivar. */}
      {scene && (
        <DemoPointer
          containerRef={arenaRef}
          targetSelector={targetSelector}
          phase={pointerPhase}
          moveDurationMs={RITMO_TUTORIAL_APROVADO.pointerMoveMs}
          entryPulseDurationMs={RITMO_TUTORIAL_APROVADO.pointerEntryPulseMs}
          trackTarget
        />
      )}
    </div>
  );
}

function GuidedAttempt({ onOutcome }: GuidedAttemptProps) {
  const arenaRef = useRef<HTMLDivElement>(null);
  const [scene, setScene] = useState<TutorialScene | null>(null);
  const [showScene, setShowScene] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [answered, setAnswered] = useState(false);

  useEffect(() => {
    const arena = arenaRef.current;
    if (!arena) return;
    setScene(montarCenaDoTutorial(arena));
  }, []);

  function handleSelect(character: LiveChar) {
    if (!scene || answered) return;
    const isCorrect = character.id === scene.round.alvoId;
    setAnswered(true);
    setSelectedId(character.id);
    onOutcome(isCorrect ? "correct" : "incorrect");
  }

  return (
    <div
      ref={arenaRef}
      className="relative w-full overflow-hidden rounded-2xl border border-[#DDE3EC] bg-white"
      style={{ height: SCENE_HEIGHT }}
    >
      {scene && !showScene && (
        <CommandCard round={scene.round} onConfirm={() => setShowScene(true)} />
      )}
      {scene && showScene && (
        <>
          <MovingCharacters
            characters={scene.characters}
            width={scene.width}
            height={scene.height}
            interactive={!answered}
            hitId={selectedId === scene.round.alvoId ? selectedId : null}
            onSelect={handleSelect}
          />
          <CorrectFeedback visible={selectedId === scene.round.alvoId} />
        </>
      )}
    </div>
  );
}

export const focusAgentsTutorial: TutorialDefinition = {
  exerciseId: "focus-agents",
  version: 2,
  Demonstration,
  GuidedAttempt,
  guidedInstruction: "Clique no personagem que corresponde ao comando.",
  retryHint: "Tente novamente e clique no personagem indicado.",
  smallestValidUnit: STEPS[0].n,
};
