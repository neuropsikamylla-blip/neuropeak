"use client";

import { useEffect, useRef, useState } from "react";
import {
  GradeDedutivaBoard,
  VERIFICACOES_TUTORIAL_GRADE,
  alvoCelulaGrade,
  alvoOpcaoGrade,
  celulaComValor,
} from "@/components/exercises/executive/DeductiveGrid";
import { DemoPointer } from "@/components/exercises/tutorial/DemoPointer";
import {
  PROBLEMA_TUTORIAL,
  admiteSolucao,
  criarGradeVazia,
  gradeEstaCorreta,
  mensagemVerificacao,
  paraMarcacaoParcial,
  type ValorCelula,
} from "@/lib/grade";
import { RITMO_TUTORIAL_APROVADO } from "@/lib/tutorial/definitions/sequencia-ordenada";
import type { GuidedAttemptProps, TutorialDefinition } from "@/lib/tutorial/types";

const LEITURA_DA_PISTA_MS = 1300;
const MENU_ABRINDO_MS = 180;
const ENTRE_ATRIBUICOES_MS = 180;

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
      window.clearTimeout(timer);
      window.clearInterval(cancelCheck);
      resolve(completed);
    };
    const timer = window.setTimeout(() => finish(!isCancelled()), ms);
    const cancelCheck = window.setInterval(() => {
      if (isCancelled()) finish(false);
    }, 25);
  });
}

type PointerPhase = "locating" | "moving" | "pressing";

interface AtribuicaoTutorial {
  categoria: string;
  posicao: number;
  valor: string;
}

function atribuicoesDaSolucao(): AtribuicaoTutorial[] {
  const todas = PROBLEMA_TUTORIAL.categorias.flatMap((categoria) =>
    PROBLEMA_TUTORIAL.solucao[categoria.id].map((valor, indice) => ({
      categoria: categoria.id,
      posicao: indice + 1,
      valor,
    })),
  );
  const primeira = todas.find(
    ({ categoria, posicao }) => categoria === "apresentador" && posicao === 2,
  );
  if (!primeira) return todas;
  return [primeira, ...todas.filter((atribuicao) => atribuicao !== primeira)];
}

function Demonstration({ onDone }: { onDone: () => void }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const onDoneRef = useRef(onDone);
  const gradeRef = useRef<Record<string, ValorCelula[]>>(criarGradeVazia(PROBLEMA_TUTORIAL));
  const [grade, setGrade] = useState(gradeRef.current);
  const [pistasRiscadas, setPistasRiscadas] = useState<Set<string>>(() => new Set());
  const [mensagem, setMensagem] = useState<string | null>(null);
  const [concluido, setConcluido] = useState(false);
  const [menuAberto, setMenuAberto] = useState<string | null>(null);
  const [targetSelector, setTargetSelector] = useState("[data-demo-pointer-start]");
  const [pointerPhase, setPointerPhase] = useState<PointerPhase>("locating");
  onDoneRef.current = onDone;

  useEffect(() => {
    let cancelled = false;

    async function apontar(selector: string, pausaMs: number): Promise<boolean> {
      setTargetSelector(selector);
      setPointerPhase("moving");
      if (!await wait(RITMO_TUTORIAL_APROVADO.pointerMoveMs, () => cancelled)) return false;
      if (!await wait(RITMO_TUTORIAL_APROVADO.pointerAimMs, () => cancelled)) return false;
      setPointerPhase("pressing");
      if (!await wait(RITMO_TUTORIAL_APROVADO.pointerPressMs, () => cancelled)) return false;
      setPointerPhase("moving");
      return wait(pausaMs, () => cancelled);
    }

    async function run() {
      if (!await wait(RITMO_TUTORIAL_APROVADO.pointerEntryPulseMs, () => cancelled)) return;

      const primeiraPista = PROBLEMA_TUTORIAL.pistas[0];
      setTargetSelector(`[data-grade-clue="${primeiraPista.id}"]`);
      setPointerPhase("moving");
      if (!await wait(RITMO_TUTORIAL_APROVADO.pointerMoveMs, () => cancelled)) return;
      if (!await wait(LEITURA_DA_PISTA_MS, () => cancelled)) return;

      for (const atribuicao of atribuicoesDaSolucao()) {
        const menuId = alvoCelulaGrade(atribuicao.categoria, atribuicao.posicao);
        if (!await apontar(`[data-grade-cell="${menuId}"]`, MENU_ABRINDO_MS)) return;
        setMenuAberto(menuId);
        if (!await wait(MENU_ABRINDO_MS, () => cancelled)) return;

        const optionId = alvoOpcaoGrade(
          atribuicao.categoria,
          atribuicao.posicao,
          atribuicao.valor,
        );
        if (!await apontar(`[data-grade-option="${optionId}"]`, 0)) return;
        gradeRef.current = celulaComValor(
          gradeRef.current,
          atribuicao.categoria,
          atribuicao.posicao,
          atribuicao.valor,
        );
        setGrade(gradeRef.current);
        setMenuAberto(null);
        if (!await wait(ENTRE_ATRIBUICOES_MS, () => cancelled)) return;
      }

      if (!await apontar(`[data-grade-clue="${primeiraPista.id}"]`, 0)) return;
      setPistasRiscadas(new Set([primeiraPista.id]));
      if (!await wait(RITMO_TUTORIAL_APROVADO.pointerReleaseMs, () => cancelled)) return;

      if (!await apontar("[data-grade-conclude]", 0)) return;
      if (!gradeEstaCorreta(PROBLEMA_TUTORIAL, gradeRef.current)) return;
      setConcluido(true);
      setMensagem("Desafio concluído.");
      if (!await wait(RITMO_TUTORIAL_APROVADO.finalPauseMs, () => cancelled)) return;
      onDoneRef.current();
    }

    void run();
    return () => { cancelled = true; };
  }, []);

  return (
    <div ref={containerRef} className="relative pointer-events-none">
      <span data-demo-pointer-start aria-hidden className="absolute bottom-8 left-8 h-px w-px" />
      <GradeDedutivaBoard
        puzzle={PROBLEMA_TUTORIAL}
        grade={grade}
        pistasRiscadas={pistasRiscadas}
        mensagem={mensagem}
        concluido={concluido}
        verificacoesRestantes={VERIFICACOES_TUTORIAL_GRADE}
        theme="COLORFUL"
        rotuloCabecalho="Tutorial"
        instrucaoTutorial="Toque em uma célula e escolha um valor. Você pode trocar a escolha a qualquer momento."
        onAtribuir={() => {}}
        onLimpar={() => {}}
        alternarPista={() => {}}
        onVerificar={() => {}}
        onConcluir={() => {}}
        menuAberto={menuAberto}
        onMenuAbertoChange={setMenuAberto}
        portalContainer={containerRef.current}
        ponteiroSobreMenu
      />
      <DemoPointer
        containerRef={containerRef}
        targetSelector={targetSelector}
        phase={pointerPhase}
        moveDurationMs={RITMO_TUTORIAL_APROVADO.pointerMoveMs}
        entryPulseDurationMs={RITMO_TUTORIAL_APROVADO.pointerEntryPulseMs}
      />
    </div>
  );
}

function GuidedAttempt({ onOutcome }: GuidedAttemptProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [grade, setGrade] = useState<Record<string, ValorCelula[]>>(
    () => criarGradeVazia(PROBLEMA_TUTORIAL),
  );
  const [pistasRiscadas, setPistasRiscadas] = useState<Set<string>>(() => new Set());
  const [mensagem, setMensagem] = useState<string | null>(null);

  function atribuir(categoria: string, posicao: number, valor: string) {
    setGrade((atual) => celulaComValor(atual, categoria, posicao, valor));
    setMensagem(null);
  }

  function limpar(categoria: string, posicao: number) {
    setGrade((atual) => celulaComValor(atual, categoria, posicao, null));
    setMensagem(null);
  }

  function alternarPista(pistaId: string) {
    setPistasRiscadas((atuais) => {
      const proximas = new Set(atuais);
      if (proximas.has(pistaId)) proximas.delete(pistaId);
      else proximas.add(pistaId);
      return proximas;
    });
    setMensagem(null);
  }

  function verificar() {
    const incompatibilidade = !admiteSolucao(PROBLEMA_TUTORIAL, paraMarcacaoParcial(grade));
    setMensagem(mensagemVerificacao(PROBLEMA_TUTORIAL.nivel, incompatibilidade));
  }

  function concluir() {
    onOutcome(gradeEstaCorreta(PROBLEMA_TUTORIAL, grade) ? "correct" : "incorrect");
  }

  return (
    <div ref={containerRef} className="relative">
      <GradeDedutivaBoard
        puzzle={PROBLEMA_TUTORIAL}
        grade={grade}
        pistasRiscadas={pistasRiscadas}
        mensagem={mensagem}
        concluido={false}
        verificacoesRestantes={VERIFICACOES_TUTORIAL_GRADE}
        theme="COLORFUL"
        rotuloCabecalho="Tutorial"
        instrucaoTutorial="Toque em uma célula e escolha um valor. Você pode trocar a escolha a qualquer momento."
        onAtribuir={atribuir}
        onLimpar={limpar}
        alternarPista={alternarPista}
        onVerificar={verificar}
        onConcluir={concluir}
        portalContainer={containerRef.current}
      />
    </div>
  );
}

export const gradeDedutivaTutorial: TutorialDefinition = {
  exerciseId: "deductive-grid",
  version: 2,
  Demonstration,
  GuidedAttempt,
  guidedInstruction: "Toque ou clique em uma célula e escolha um valor na lista. Depois, conclua a organização.",
  retryHint: "Tente novamente: toque ou clique nas células, escolha os valores na lista e conclua.",
  smallestValidUnit: PROBLEMA_TUTORIAL.posicoes,
};
