"use client";

import {
  CuboCorsiBoard,
  CUBO_CORSI_CELL_COUNT,
  CUBO_CORSI_MIN_DIFFICULTY,
  cuboCorsiSequenceLength,
} from "@/components/exercises/memory/CuboCorsi";
import {
  MATRIZ_ESPACIAL_MIN_DIFFICULTY,
  MatrizEspacialGrid,
  matrizEspacialGridSizeFor,
  matrizEspacialSequenceLengthFor,
} from "@/components/exercises/memory/MatrizEspacial";
import {
  PADROES_ROTACAO_MIN_LEVEL,
  PadroesRotacaoGrid,
  padroesRotacaoDegreesForLevel,
  padroesRotacaoGridForLevel,
  padroesRotacaoPositionsForLevel,
  rotatePos,
} from "@/components/exercises/memory/PadroesRotacao";
import {
  criarTutorialSequenciaOrdenada,
  presentVisualSequence,
  type BoardProps,
} from "@/lib/tutorial/definitions/sequencia-ordenada";

const MATRIZ_GRID_SIZE = matrizEspacialGridSizeFor(MATRIZ_ESPACIAL_MIN_DIFFICULTY);
const MATRIZ_SMALLEST_VALID_UNIT = matrizEspacialSequenceLengthFor(
  MATRIZ_ESPACIAL_MIN_DIFFICULTY,
);

function createUniqueSequence(length: number, total: number): number[] {
  const available = Array.from({ length: total }, (_, index) => index);
  for (let index = available.length - 1; index > 0; index--) {
    const target = Math.floor(Math.random() * (index + 1));
    [available[index], available[target]] = [available[target], available[index]];
  }
  return available.slice(0, length);
}

function MatrizBoard({
  activeChoice,
  interactive,
  onChoice,
  enteredItems,
  pressedChoice,
}: BoardProps<number>) {
  return (
    <MatrizEspacialGrid
      gridSize={MATRIZ_GRID_SIZE}
      activeCell={activeChoice ?? null}
      selectedCells={enteredItems}
      interactive={interactive}
      onCellClick={onChoice}
      pressedCell={pressedChoice}
    />
  );
}

function CubosBoard({
  activeChoice,
  interactive,
  onChoice,
  enteredItems,
  pressedChoice,
}: BoardProps<number>) {
  return (
    <CuboCorsiBoard
      activeCell={activeChoice}
      selectedCells={enteredItems}
      interactive={interactive}
      onCellClick={onChoice}
      pressedCell={pressedChoice}
    />
  );
}

const ROTATION_GRID_SIZE = padroesRotacaoGridForLevel(PADROES_ROTACAO_MIN_LEVEL);
const ROTATION_DEGREES = padroesRotacaoDegreesForLevel(PADROES_ROTACAO_MIN_LEVEL)[0];

function cellKey(cell: number): string {
  return `${Math.floor(cell / ROTATION_GRID_SIZE)},${cell % ROTATION_GRID_SIZE}`;
}

function RotacaoBoard({
  activeChoice,
  interactive,
  onChoice,
  enteredItems,
  pressedChoice,
  presenting,
}: BoardProps<number>) {
  return (
    <PadroesRotacaoGrid
      N={ROTATION_GRID_SIZE}
      cellPx={64}
      lit={activeChoice === undefined ? new Set() : new Set([cellKey(activeChoice)])}
      picked={new Set(enteredItems.map(cellKey))}
      expected={new Set()}
      phase={presenting ? "show" : "input"}
      edge={presenting ? "top" : "right"}
      onTap={(row, column) => onChoice(row * ROTATION_GRID_SIZE + column)}
      pressedCell={pressedChoice}
    />
  );
}

/** Comum aos quatro: a apresentação é visual e a célula é sempre um índice numérico. */
const spatialDefaults = {
  version: 1,
  retryHint: "Observe novamente e clique nas posições quando elas ficarem disponíveis.",
  present: presentVisualSequence,
  targetSelectorFor: (cell: number) => `[data-cell="${cell}"]`,
};

const matrizConfig = {
  smallestValidUnit: MATRIZ_SMALLEST_VALID_UNIT,
  demonstrationItems: [4, 12],
  createGuidedSequence: () => createUniqueSequence(
    MATRIZ_SMALLEST_VALID_UNIT,
    MATRIZ_GRID_SIZE * MATRIZ_GRID_SIZE,
  ),
  Board: MatrizBoard,
};

export const matrizEspacialTutorial = criarTutorialSequenciaOrdenada<number>({
  ...spatialDefaults,
  ...matrizConfig,
  exerciseId: "matriz-espacial",
  guidedInstruction: "Observe as posições e clique nelas na mesma ordem.",
});

export const matrizEspacialInversaTutorial = criarTutorialSequenciaOrdenada<number>({
  ...spatialDefaults,
  ...matrizConfig,
  exerciseId: "matriz-espacial-inversa",
  guidedInstruction: "Observe as posições e clique nelas na ordem inversa.",
  transformarResposta: (sequencia) => sequencia.reverse(),
});

const CUBO_CORSI_SMALLEST_VALID_UNIT = cuboCorsiSequenceLength(
  CUBO_CORSI_MIN_DIFFICULTY,
);

export const cuboCorsiTutorial = criarTutorialSequenciaOrdenada<number>({
  ...spatialDefaults,
  exerciseId: "cubo-corsi",
  guidedInstruction: "Observe os cubos e clique neles na mesma ordem.",
  smallestValidUnit: CUBO_CORSI_SMALLEST_VALID_UNIT,
  demonstrationItems: [0, 4],
  createGuidedSequence: () => createUniqueSequence(
    CUBO_CORSI_SMALLEST_VALID_UNIT,
    CUBO_CORSI_CELL_COUNT,
  ),
  Board: CubosBoard,
});

const ROTATION_SMALLEST_VALID_UNIT = padroesRotacaoPositionsForLevel(
  PADROES_ROTACAO_MIN_LEVEL,
);

function transformarRotacao(sequencia: number[]): number[] {
  return sequencia.map((cell) => {
    const row = Math.floor(cell / ROTATION_GRID_SIZE);
    const column = cell % ROTATION_GRID_SIZE;
    const [rotatedRow, rotatedColumn] = rotatePos(
      row,
      column,
      ROTATION_GRID_SIZE,
      ROTATION_DEGREES,
    );
    return rotatedRow * ROTATION_GRID_SIZE + rotatedColumn;
  });
}

export const padroesRotacaoTutorial = criarTutorialSequenciaOrdenada<number>({
  ...spatialDefaults,
  exerciseId: "padroes-rotacao",
  guidedInstruction: "Observe o padrão e clique nas posições após a rotação.",
  smallestValidUnit: ROTATION_SMALLEST_VALID_UNIT,
  demonstrationItems: [0, 5],
  createGuidedSequence: () => createUniqueSequence(
    ROTATION_SMALLEST_VALID_UNIT,
    ROTATION_GRID_SIZE * ROTATION_GRID_SIZE,
  ),
  Board: RotacaoBoard,
  transformarResposta: transformarRotacao,
});
