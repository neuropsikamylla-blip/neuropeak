"use client";

import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import type React from "react";
import { useEffect, useRef, useState } from "react";
import { ExerciseStage } from "@/components/exercises/ExerciseStage";
import { useTimedProgress } from "@/components/exercises/useExerciseEngine";
import {
  DURACAO_SESSAO_GRADE_MS,
  PROBLEMA_TUTORIAL,
  agregarSessaoGrade,
  admiteSolucao,
  celulasComValorRepetido,
  chavePosicaoGrade,
  consumirVerificacao,
  criarGradeVazia,
  estadoDaAtribuicao,
  gradeEstaCorreta,
  mensagemVerificacao,
  paraMarcacaoParcial,
  pistasEmConflito,
  registrarCorrecaoDasVerificacoes,
  resumirAtribuicoes,
  selecionarProblema,
  verificacaoDisponivel,
  verificacoesPermitidas,
  type EventoPistaGrade,
  type RegistroAtribuicao,
  type RegistroProblemaGrade,
  type RegistroVerificacao,
  type QuantidadeVerificacoes,
  type ValorCelula,
  type Puzzle,
} from "@/lib/grade";
import { calculateExerciseScore } from "@/lib/scoring";
import type { ExerciseResult, Theme } from "@/types";

interface DeductiveGridProps {
  difficulty: number;
  theme: Theme;
  onComplete: (result: ExerciseResult) => void;
}

interface RegistroProblema {
  atribuicoes: RegistroAtribuicao[];
  verificacoes: RegistroVerificacao[];
  eventosPista: EventoPistaGrade[];
  latenciaPrimeiraAcao: number | null;
  totalAcoes: number;
  tentativasConcluirIncorretas: number;
  usosVerificarRaciocinio: number;
}

function novoRegistroProblema(): RegistroProblema {
  return {
    atribuicoes: [],
    verificacoes: [],
    eventosPista: [],
    latenciaPrimeiraAcao: null,
    totalAcoes: 0,
    tentativasConcluirIncorretas: 0,
    usosVerificarRaciocinio: 0,
  };
}

function fundoDoTema(theme: Theme): React.CSSProperties {
  return { background: paleta(theme).fundo };
}

function paleta(theme: Theme) {
  if (theme === "GAMIFIED") {
    return {
      fundo: "linear-gradient(145deg, #101b2d 0%, #17243a 55%, #111827 100%)",
      painel: "border-white/10 bg-slate-900/80",
      titulo: "text-slate-50",
      texto: "text-slate-300",
      textoSuave: "text-slate-400",
      superficie: "bg-slate-950/40",
      divisoria: "border-white/10",
      rotulo: "bg-slate-800 text-slate-200",
      celula: "border-slate-600 bg-slate-800 text-slate-100 hover:border-sky-500",
      primaria: "bg-sky-700 text-white hover:bg-sky-600",
      secundaria: "border-slate-500 bg-transparent text-slate-100 hover:bg-white/5",
      mensagem: "border-slate-600 bg-slate-800 text-slate-100",
    };
  }
  if (theme === "COLORFUL") {
    return {
      fundo: "linear-gradient(145deg, #f5f1ff 0%, #eef5ff 55%, #f7f4ee 100%)",
      painel: "border-violet-100 bg-white/95",
      titulo: "text-slate-900",
      texto: "text-slate-700",
      textoSuave: "text-slate-500",
      superficie: "bg-violet-50/50",
      divisoria: "border-violet-100",
      rotulo: "bg-violet-50 text-slate-700",
      celula: "border-slate-200 bg-white text-slate-800 hover:border-violet-400",
      primaria: "bg-violet-700 text-white hover:bg-violet-600",
      secundaria: "border-violet-300 bg-white text-violet-900 hover:bg-violet-50",
      mensagem: "border-violet-200 bg-violet-50 text-slate-800",
    };
  }
  return {
    fundo: "linear-gradient(155deg, #edf2f4 0%, #e4ecef 55%, #dde5e8 100%)",
    painel: "border-slate-200 bg-white/95",
    titulo: "text-slate-900",
    texto: "text-slate-700",
    textoSuave: "text-slate-500",
    superficie: "bg-slate-50",
    divisoria: "border-slate-200",
    rotulo: "bg-slate-100 text-slate-700",
    celula: "border-slate-300 bg-white text-slate-800 hover:border-sky-600",
    primaria: "bg-slate-800 text-white hover:bg-slate-700",
    secundaria: "border-slate-300 bg-white text-slate-800 hover:bg-slate-50",
    mensagem: "border-slate-300 bg-slate-50 text-slate-800",
  };
}

function celulaComValor(
  grade: Record<string, ValorCelula[]>,
  categoria: string,
  posicao: number,
  valor: ValorCelula
): Record<string, ValorCelula[]> {
  return {
    ...grade,
    [categoria]: grade[categoria].map((atual, indice) => indice === posicao - 1 ? valor : atual),
  };
}

export function DeductiveGrid({ difficulty, theme, onComplete }: DeductiveGridProps) {
  const { begin, isTimeUp, elapsedSec, finish } = useTimedProgress(DURACAO_SESSAO_GRADE_MS);
  const [tutorial, setTutorial] = useState(true);
  const [puzzle, setPuzzle] = useState<Puzzle>(PROBLEMA_TUTORIAL);
  const [grade, setGrade] = useState<Record<string, ValorCelula[]>>(() => criarGradeVazia(PROBLEMA_TUTORIAL));
  const [pistasRiscadas, setPistasRiscadas] = useState<Set<string>>(() => new Set());
  const [mensagem, setMensagem] = useState<string | null>(null);
  const [concluido, setConcluido] = useState(false);
  const [verificacoesRestantes, setVerificacoesRestantes] = useState<QuantidadeVerificacoes>(() =>
    verificacoesPermitidas(PROBLEMA_TUTORIAL.nivel, true)
  );
  const inicioProblema = useRef(Date.now());
  const registro = useRef<RegistroProblema>(novoRegistroProblema());
  const problemas = useRef<RegistroProblemaGrade[]>([]);
  const usados = useRef<string[]>([]);
  const transicao = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pal = paleta(theme);
  const rootBg = fundoDoTema(theme);

  useEffect(() => () => {
    if (transicao.current !== null) clearTimeout(transicao.current);
  }, []);

  const duplicadas = celulasComValorRepetido(grade);

  function registrarAcao(): number {
    const momento = Math.max(0, Date.now() - inicioProblema.current);
    registro.current.totalAcoes += 1;
    if (registro.current.latenciaPrimeiraAcao === null) {
      registro.current.latenciaPrimeiraAcao = momento;
    }
    return momento;
  }

  function marcarAtribuicoesRevisadas(categoria: string, posicao: number): void {
    registro.current.atribuicoes.forEach((atribuicao) => {
      if (atribuicao.categoria === categoria && atribuicao.posicao === posicao) {
        atribuicao.revisadaDepois = true;
      }
    });
  }

  function registrarCorrecaoSeNecessaria(
    proximaGrade: Record<string, ValorCelula[]>,
    momento: number
  ): void {
    if (!admiteSolucao(puzzle, paraMarcacaoParcial(proximaGrade))) return;
    registro.current.verificacoes = registrarCorrecaoDasVerificacoes(
      registro.current.verificacoes,
      puzzle.id,
      registro.current.totalAcoes,
      momento
    );
  }

  function atribuir(categoria: string, posicao: number, valor: string): void {
    if (concluido) return;
    const valorAnterior = grade[categoria][posicao - 1];
    if (valorAnterior === valor) return;
    if (valorAnterior !== null) marcarAtribuicoesRevisadas(categoria, posicao);

    const estado = estadoDaAtribuicao(
      puzzle,
      paraMarcacaoParcial(grade),
      categoria,
      valor,
      posicao
    );
    const momento = registrarAcao();
    registro.current.atribuicoes.push({
      categoria,
      valor,
      posicao,
      momento,
      valorAnterior,
      relacaoJaEstavaLogicamenteDeterminada: estado === "determinada",
      estadoDaAtribuicao: estado,
      revisadaDepois: false,
    });
    const proximaGrade = celulaComValor(grade, categoria, posicao, valor);
    registrarCorrecaoSeNecessaria(proximaGrade, momento);
    setGrade(proximaGrade);
    setMensagem(null);
  }

  function limpar(categoria: string, posicao: number): void {
    if (concluido || grade[categoria][posicao - 1] === null) return;
    marcarAtribuicoesRevisadas(categoria, posicao);
    const momento = registrarAcao();
    const proximaGrade = celulaComValor(grade, categoria, posicao, null);
    registrarCorrecaoSeNecessaria(proximaGrade, momento);
    setGrade(proximaGrade);
    setMensagem(null);
  }

  function alternarPista(pistaId: string): void {
    if (concluido) return;
    const estavaRiscada = pistasRiscadas.has(pistaId);
    const momento = registrarAcao();
    registro.current.eventosPista.push({
      type: estavaRiscada ? "clue_uncrossed" : "clue_crossed",
      pistaId,
      momento,
      timestamp: Date.now(),
    });
    setPistasRiscadas((atuais) => {
      const proximas = new Set(atuais);
      if (estavaRiscada) proximas.delete(pistaId);
      else proximas.add(pistaId);
      return proximas;
    });
    setMensagem(null);
  }

  function verificar(): void {
    if (concluido || !verificacaoDisponivel(verificacoesRestantes)) return;
    const momento = registrarAcao();
    const parcial = paraMarcacaoParcial(grade);
    const temIncompatibilidade = !admiteSolucao(puzzle, parcial);
    const proximasRestantes = consumirVerificacao(verificacoesRestantes);
    const ordemVerificacao = registro.current.usosVerificarRaciocinio + 1;
    registro.current.usosVerificarRaciocinio = ordemVerificacao;
    // `pistasEmConflito` devolve um conjunto seguro de pistas relevantes, não um MUS.
    // A contagem registra somente o que o motor sustenta, sem atribuir minimalidade.
    const quantidadeContradicoes = pistasEmConflito(puzzle, parcial).length;
    registro.current.verificacoes.push({
      puzzleId: puzzle.id,
      numeroAcao: registro.current.totalAcoes,
      tempoDesdeInicio: momento,
      ordemVerificacao,
      verificacoesRestantes: proximasRestantes,
      estado: temIncompatibilidade ? "inconsistente" : "consistente",
      quantidadeContradicoes,
      corrigidaDepois: false,
      acoesAteCorrecao: null,
      tempoAteCorrecao: null,
    });
    setVerificacoesRestantes(proximasRestantes);
    setMensagem(mensagemVerificacao(puzzle.nivel, temIncompatibilidade));
  }

  function iniciarProblema(proximo: Puzzle): void {
    setPuzzle(proximo);
    setGrade(criarGradeVazia(proximo));
    setPistasRiscadas(new Set());
    setMensagem(null);
    setConcluido(false);
    setVerificacoesRestantes(verificacoesPermitidas(proximo.nivel, false));
    registro.current = novoRegistroProblema();
    inicioProblema.current = Date.now();
  }

  function iniciarDesafio(): void {
    const primeiro = selecionarProblema(difficulty, usados.current);
    setTutorial(false);
    iniciarProblema(primeiro);
    begin();
  }

  function finalizarRegistro(
    problemaAtual: Puzzle,
    tempoTotal: number,
    concluidoNoTempo: boolean
  ): RegistroProblemaGrade {
    const atribuicoes = registro.current.atribuicoes.map((atribuicao) => ({ ...atribuicao }));
    const verificacoes = registro.current.verificacoes.map((verificacao) => ({ ...verificacao }));
    const eventosPista = registro.current.eventosPista.map((evento) => ({ ...evento }));
    const resumo = resumirAtribuicoes(atribuicoes);
    return {
      puzzleId: problemaAtual.id,
      nivel: problemaAtual.nivel,
      concluido: concluidoNoTempo,
      atribuicoes,
      verificacoes,
      eventosPista,
      ...resumo,
      latenciaPrimeiraAcao: registro.current.latenciaPrimeiraAcao ?? tempoTotal,
      totalAcoes: registro.current.totalAcoes,
      tempoTotal,
      tentativasConcluirIncorretas: registro.current.tentativasConcluirIncorretas,
      usosVerificarRaciocinio: registro.current.usosVerificarRaciocinio,
    };
  }

  function concluir(): void {
    if (concluido || transicao.current !== null) return;
    registrarAcao();
    if (!gradeEstaCorreta(puzzle, grade)) {
      registro.current.tentativasConcluirIncorretas += 1;
      setMensagem("Sua organização ainda contém incompatibilidades. Revise antes de concluir.");
      return;
    }

    const tempoTotal = Math.max(0, Date.now() - inicioProblema.current);
    setConcluido(true);
    setMensagem("Desafio concluído.");

    if (tutorial) {
      transicao.current = setTimeout(() => {
        transicao.current = null;
        iniciarDesafio();
      }, 700);
      return;
    }

    const tempoEsgotado = isTimeUp();
    // Se o limite foi atingido durante este problema, a pessoa pode terminá-lo sem interrupção,
    // mas o registro preserva que ele ainda não estava concluído dentro do tempo da sessão.
    const registroFinal = finalizarRegistro(puzzle, tempoTotal, !tempoEsgotado);
    const problemasDaSessao = [...problemas.current, registroFinal];
    problemas.current = problemasDaSessao;
    usados.current = [...usados.current, puzzle.id];

    transicao.current = setTimeout(() => {
      transicao.current = null;
      if (!tempoEsgotado) {
        iniciarProblema(selecionarProblema(difficulty, usados.current));
        return;
      }

      finish();
      // A acurácia NÃO pode ser 1 fixo: ela alimenta a engine adaptativa e a Grade subiria de
      // nível para sempre, além de disparar sozinha a conquista de 100%. Ver acuraciaDoProblema.
      const { metadata, acuracia } = agregarSessaoGrade(problemasDaSessao);
      onComplete({
        exerciseId: "deductive-grid",
        domain: "executive",
        score: calculateExerciseScore("deductive-grid", acuracia, undefined, difficulty),
        accuracy: acuracia,
        difficulty,
        duration: elapsedSec(),
        metadata,
      });
    }, 700);
  }

  return (
    <ExerciseStage width="medio" background={rootBg.background as string}>
      <main className="mx-auto w-full max-w-full overflow-x-hidden py-1 sm:py-3">
        <section className={`overflow-hidden rounded-2xl border shadow-sm ${pal.painel}`}>
          <header className={`border-b px-4 py-4 sm:px-6 ${pal.divisoria}`}>
            <p className={`text-xs font-semibold uppercase tracking-[0.16em] ${pal.textoSuave}`}>
              {tutorial ? "Tutorial" : "Desafio de lógica"}
            </p>
            <h1 className={`mt-1 text-xl font-semibold sm:text-2xl ${pal.titulo}`}>{puzzle.titulo}</h1>
            <p className={`mt-2 max-w-3xl text-sm leading-6 ${pal.texto}`}>{puzzle.contexto}</p>
            {tutorial && (
              <p className={`mt-2 text-sm leading-6 ${pal.texto}`}>
                Toque em uma célula e escolha um valor. Você pode trocar a escolha a qualquer momento.
              </p>
            )}
          </header>

          <div className="space-y-5 p-4 sm:p-6">
            <section aria-labelledby="titulo-pistas">
              <div className="mb-3 flex items-baseline justify-between gap-3">
                <h2 id="titulo-pistas" className={`text-sm font-semibold uppercase tracking-[0.12em] ${pal.titulo}`}>
                  Pistas
                </h2>
                <span className={`text-xs ${pal.textoSuave}`}>Toque para riscar ou restaurar</span>
              </div>
              <ol className="columns-1 gap-x-7 sm:columns-2">
                {puzzle.pistas.map((pista, indice) => {
                  const riscada = pistasRiscadas.has(pista.id);
                  return (
                    <li key={pista.id} className="mb-2 break-inside-avoid">
                      <button
                        type="button"
                        aria-pressed={riscada}
                        onClick={() => alternarPista(pista.id)}
                        className={`w-full rounded-lg px-3 py-2 text-left text-sm leading-5 transition-colors hover:bg-black/5 ${pal.texto} ${riscada ? "line-through opacity-50" : ""}`}
                      >
                        <span className="mr-2 font-semibold tabular-nums">{indice + 1}.</span>
                        {pista.texto}
                      </button>
                    </li>
                  );
                })}
              </ol>
            </section>

            <section aria-labelledby="titulo-grade" className="min-w-0">
              <h2 id="titulo-grade" className={`mb-3 text-sm font-semibold uppercase tracking-[0.12em] ${pal.titulo}`}>
                Organização
              </h2>
              <div
                className={`max-w-full overflow-x-auto overscroll-x-contain rounded-xl border ${pal.divisoria} ${pal.superficie}`}
                tabIndex={0}
                aria-label="Grade com rolagem horizontal quando necessária"
              >
                <table className="w-full min-w-[560px] table-fixed border-separate border-spacing-0">
                  <colgroup>
                    <col className="w-[140px]" />
                    {Array.from({ length: puzzle.posicoes }, (_, indice) => <col key={indice} className="w-[105px]" />)}
                  </colgroup>
                  <thead>
                    <tr>
                      <th className={`sticky left-0 z-20 border-b border-r px-3 py-3 text-left text-xs font-semibold uppercase tracking-wide ${pal.divisoria} ${pal.rotulo}`}>
                        Categoria
                      </th>
                      {Array.from({ length: puzzle.posicoes }, (_, indice) => (
                        <th key={indice} className={`border-b px-2 py-3 text-center text-xs font-semibold uppercase tracking-wide ${pal.divisoria} ${pal.textoSuave}`}>
                          {puzzle.rotulosPosicao?.[indice] ?? `Posição ${indice + 1}`}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {puzzle.categorias.map((categoria, indiceCategoria) => (
                      <tr key={categoria.id}>
                        <th
                          scope="row"
                          className={`sticky left-0 z-10 border-r px-3 py-3 text-left text-sm font-semibold ${indiceCategoria < puzzle.categorias.length - 1 ? "border-b" : ""} ${pal.divisoria} ${pal.rotulo}`}
                        >
                          {categoria.label}
                        </th>
                        {Array.from({ length: puzzle.posicoes }, (_, indicePosicao) => {
                          const posicao = indicePosicao + 1;
                          const valorAtual = grade[categoria.id][indicePosicao];
                          const duplicada = duplicadas.has(chavePosicaoGrade(categoria.id, posicao));
                          return (
                            <td
                              key={posicao}
                              className={`px-2 py-2 ${indiceCategoria < puzzle.categorias.length - 1 ? "border-b" : ""} ${pal.divisoria}`}
                            >
                              <DropdownMenu.Root>
                                <DropdownMenu.Trigger asChild>
                                  <button
                                    type="button"
                                    disabled={concluido}
                                    title={duplicada ? "Este item já está sendo usado em outra posição." : undefined}
                                    aria-label={`${categoria.label}, posição ${posicao}: ${valorAtual ?? "vazia"}`}
                                    className={`min-h-12 w-full rounded-lg border px-2 py-2 text-sm font-medium transition-colors disabled:cursor-default ${
                                      duplicada
                                        ? "border-amber-400 bg-amber-50 text-amber-950"
                                        : valorAtual !== null
                                          ? "border-sky-500 bg-sky-50 text-sky-950"
                                          : pal.celula
                                    }`}
                                  >
                                    {valorAtual ?? "Selecionar"}
                                  </button>
                                </DropdownMenu.Trigger>
                                <DropdownMenu.Portal>
                                  <DropdownMenu.Content
                                    sideOffset={6}
                                    collisionPadding={12}
                                    className="z-50 min-w-[210px] max-h-[min(320px,var(--radix-dropdown-menu-content-available-height))] overflow-y-auto rounded-xl border border-slate-200 bg-white p-1.5 text-slate-900 shadow-xl"
                                  >
                                    <DropdownMenu.Label className="px-2 py-1.5 text-xs font-semibold uppercase tracking-wide text-slate-500">
                                      {categoria.label}
                                    </DropdownMenu.Label>
                                    {categoria.valores.map((valor) => {
                                      const atual = valorAtual === valor;
                                      const usadaEmOutraPosicao = grade[categoria.id].some(
                                        (usado, outroIndice) => usado === valor && outroIndice !== indicePosicao
                                      );
                                      return (
                                        <DropdownMenu.Item
                                          key={valor}
                                          onSelect={() => atribuir(categoria.id, posicao, valor)}
                                          className={`cursor-pointer select-none rounded-lg px-3 py-2 text-sm outline-none data-[highlighted]:bg-slate-100 ${
                                            atual ? "bg-sky-50 font-semibold text-sky-950" : ""
                                          } ${usadaEmOutraPosicao ? "line-through text-slate-400" : ""}`}
                                        >
                                          {valor}
                                        </DropdownMenu.Item>
                                      );
                                    })}
                                    {valorAtual !== null && (
                                      <>
                                        <DropdownMenu.Separator className="my-1 h-px bg-slate-200" />
                                        <DropdownMenu.Item
                                          onSelect={() => limpar(categoria.id, posicao)}
                                          className="cursor-pointer select-none rounded-lg px-3 py-2 text-sm font-medium text-slate-700 outline-none data-[highlighted]:bg-slate-100"
                                        >
                                          Limpar
                                        </DropdownMenu.Item>
                                      </>
                                    )}
                                  </DropdownMenu.Content>
                                </DropdownMenu.Portal>
                              </DropdownMenu.Root>
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            {mensagem !== null && (
              <p role="status" aria-live="polite" className={`rounded-lg border px-4 py-3 text-sm ${pal.mensagem}`}>
                {mensagem}
              </p>
            )}

            <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              {verificacaoDisponivel(verificacoesRestantes) && (
                <button
                  type="button"
                  onClick={verificar}
                  disabled={concluido}
                  className={`min-h-11 rounded-lg border px-5 py-2.5 text-sm font-semibold transition-colors disabled:opacity-50 ${pal.secundaria}`}
                >
                  Verificar raciocínio
                  {verificacoesRestantes === "livre" ? "" : ` · ${verificacoesRestantes}`}
                </button>
              )}
              <button
                type="button"
                onClick={concluir}
                disabled={concluido}
                className={`min-h-11 rounded-lg px-6 py-2.5 text-sm font-semibold transition-colors disabled:opacity-60 ${pal.primaria}`}
              >
                Concluir
              </button>
            </div>
          </div>
        </section>
      </main>
    </ExerciseStage>
  );
}
