// Fases do Estacionamento Lógico agrupadas por dificuldade (idealMoves), geradas
// e validadas por um solver BFS de Rush Hour. O exercício escolhe a dificuldade
// de forma adaptativa (sobe/desce) e roda fases por ~7 min.
import type { Level } from "@/types/parking";

export const LEVELS_BY_DIFFICULTY: Record<number, Level[]> = {
  2: [
    {idealMoves:2,cars:[{id:"target",row:2,col:3,len:2,orientation:"horizontal"},{id:"A",row:1,col:5,len:2,orientation:"vertical"}]},
  ],
  3: [
    {idealMoves:3,cars:[{id:"target",row:2,col:1,len:2,orientation:"horizontal"},{id:"A",row:0,col:3,len:3,orientation:"vertical"},{id:"B",row:1,col:4,len:2,orientation:"vertical"}]},
  ],
  4: [
    {idealMoves:4,cars:[{id:"target",row:2,col:0,len:2,orientation:"horizontal"},{id:"A",row:0,col:2,len:3,orientation:"vertical"},{id:"B",row:3,col:1,len:2,orientation:"horizontal"},{id:"C",row:1,col:4,len:2,orientation:"vertical"}]},
  ],
  5: [
    {idealMoves:5,cars:[{id:"target",row:2,col:0,len:2,orientation:"horizontal"},{id:"A",row:2,col:4,len:3,orientation:"vertical"},{id:"B",row:5,col:4,len:2,orientation:"horizontal"},{id:"C",row:2,col:2,len:3,orientation:"vertical"},{id:"D",row:2,col:5,len:2,orientation:"vertical"}]},
    {idealMoves:5,cars:[{id:"target",row:2,col:0,len:2,orientation:"horizontal"},{id:"A",row:0,col:4,len:3,orientation:"vertical"},{id:"B",row:3,col:2,len:3,orientation:"vertical"},{id:"C",row:5,col:3,len:2,orientation:"horizontal"},{id:"D",row:0,col:5,len:2,orientation:"vertical"}]},
    {idealMoves:5,cars:[{id:"target",row:2,col:0,len:2,orientation:"horizontal"},{id:"A",row:2,col:4,len:3,orientation:"vertical"},{id:"B",row:3,col:2,len:3,orientation:"vertical"},{id:"C",row:5,col:3,len:2,orientation:"horizontal"},{id:"D",row:0,col:4,len:2,orientation:"vertical"}]},
    {idealMoves:5,cars:[{id:"target",row:2,col:2,len:2,orientation:"horizontal"},{id:"A",row:0,col:4,len:3,orientation:"vertical"},{id:"B",row:3,col:0,len:2,orientation:"horizontal"},{id:"C",row:4,col:2,len:2,orientation:"vertical"},{id:"D",row:4,col:3,len:2,orientation:"horizontal"}]},
    {idealMoves:5,cars:[{id:"target",row:2,col:1,len:2,orientation:"horizontal"},{id:"A",row:1,col:4,len:3,orientation:"vertical"},{id:"B",row:4,col:1,len:3,orientation:"horizontal"},{id:"C",row:5,col:1,len:3,orientation:"horizontal"},{id:"D",row:1,col:3,len:3,orientation:"vertical"}]},
    {idealMoves:5,cars:[{id:"target",row:2,col:0,len:2,orientation:"horizontal"},{id:"A",row:1,col:2,len:3,orientation:"vertical"},{id:"B",row:5,col:0,len:3,orientation:"horizontal"},{id:"C",row:2,col:4,len:2,orientation:"vertical"},{id:"D",row:4,col:4,len:2,orientation:"vertical"}]},
    {idealMoves:5,cars:[{id:"target",row:2,col:2,len:2,orientation:"horizontal"},{id:"A",row:5,col:1,len:3,orientation:"horizontal"},{id:"B",row:3,col:4,len:2,orientation:"horizontal"},{id:"C",row:3,col:3,len:2,orientation:"vertical"},{id:"D",row:0,col:4,len:3,orientation:"vertical"}]},
    {idealMoves:5,cars:[{id:"target",row:2,col:2,len:2,orientation:"horizontal"},{id:"A",row:2,col:4,len:2,orientation:"vertical"},{id:"B",row:0,col:2,len:2,orientation:"vertical"},{id:"C",row:4,col:4,len:2,orientation:"vertical"},{id:"D",row:0,col:4,len:2,orientation:"horizontal"}]},
  ],
  6: [
    {idealMoves:6,cars:[{id:"target",row:2,col:2,len:2,orientation:"horizontal"},{id:"A",row:4,col:3,len:2,orientation:"horizontal"},{id:"B",row:2,col:0,len:2,orientation:"vertical"},{id:"C",row:3,col:2,len:2,orientation:"vertical"},{id:"D",row:1,col:4,len:3,orientation:"vertical"}]},
    {idealMoves:6,cars:[{id:"target",row:2,col:0,len:2,orientation:"horizontal"},{id:"A",row:2,col:2,len:3,orientation:"vertical"},{id:"B",row:1,col:4,len:3,orientation:"vertical"},{id:"C",row:4,col:3,len:2,orientation:"horizontal"},{id:"D",row:5,col:4,len:2,orientation:"horizontal"}]},
    {idealMoves:6,cars:[{id:"target",row:2,col:1,len:2,orientation:"horizontal"},{id:"A",row:0,col:3,len:3,orientation:"vertical"},{id:"B",row:3,col:1,len:3,orientation:"horizontal"},{id:"C",row:4,col:3,len:3,orientation:"horizontal"},{id:"D",row:2,col:5,len:2,orientation:"vertical"},{id:"E",row:5,col:2,len:2,orientation:"horizontal"}]},
    {idealMoves:6,cars:[{id:"target",row:2,col:0,len:2,orientation:"horizontal"},{id:"A",row:5,col:2,len:2,orientation:"horizontal"},{id:"B",row:2,col:2,len:3,orientation:"vertical"},{id:"C",row:2,col:4,len:2,orientation:"vertical"},{id:"D",row:4,col:4,len:2,orientation:"horizontal"},{id:"E",row:0,col:4,len:2,orientation:"vertical"}]},
    {idealMoves:6,cars:[{id:"target",row:2,col:1,len:2,orientation:"horizontal"},{id:"A",row:4,col:3,len:3,orientation:"horizontal"},{id:"B",row:3,col:2,len:2,orientation:"vertical"},{id:"C",row:1,col:5,len:3,orientation:"vertical"},{id:"D",row:0,col:0,len:3,orientation:"vertical"},{id:"E",row:2,col:4,len:2,orientation:"vertical"}]},
    {idealMoves:6,cars:[{id:"target",row:2,col:2,len:2,orientation:"horizontal"},{id:"A",row:3,col:4,len:2,orientation:"horizontal"},{id:"B",row:4,col:5,len:2,orientation:"vertical"},{id:"C",row:1,col:0,len:3,orientation:"vertical"},{id:"D",row:0,col:4,len:3,orientation:"vertical"},{id:"E",row:3,col:3,len:3,orientation:"vertical"}]},
    {idealMoves:6,cars:[{id:"target",row:2,col:1,len:2,orientation:"horizontal"},{id:"A",row:1,col:5,len:2,orientation:"vertical"},{id:"B",row:0,col:4,len:3,orientation:"vertical"},{id:"C",row:3,col:2,len:2,orientation:"horizontal"},{id:"D",row:4,col:2,len:3,orientation:"horizontal"},{id:"E",row:4,col:1,len:2,orientation:"vertical"}]},
    {idealMoves:6,cars:[{id:"target",row:2,col:0,len:2,orientation:"horizontal"},{id:"A",row:4,col:4,len:2,orientation:"horizontal"},{id:"B",row:3,col:1,len:2,orientation:"horizontal"},{id:"C",row:1,col:1,len:3,orientation:"horizontal"},{id:"D",row:4,col:2,len:2,orientation:"vertical"},{id:"E",row:1,col:4,len:3,orientation:"vertical"}]},
  ],
  7: [
    {idealMoves:7,cars:[{id:"target",row:2,col:0,len:2,orientation:"horizontal"},{id:"A",row:0,col:4,len:2,orientation:"horizontal"},{id:"B",row:1,col:2,len:3,orientation:"vertical"},{id:"C",row:1,col:5,len:3,orientation:"vertical"},{id:"D",row:4,col:1,len:3,orientation:"horizontal"}]},
    {idealMoves:7,cars:[{id:"target",row:2,col:1,len:2,orientation:"horizontal"},{id:"A",row:2,col:4,len:2,orientation:"vertical"},{id:"B",row:4,col:4,len:2,orientation:"vertical"},{id:"C",row:0,col:3,len:3,orientation:"horizontal"},{id:"D",row:0,col:1,len:2,orientation:"vertical"},{id:"E",row:0,col:2,len:2,orientation:"vertical"}]},
    {idealMoves:7,cars:[{id:"target",row:2,col:0,len:2,orientation:"horizontal"},{id:"A",row:0,col:2,len:3,orientation:"vertical"},{id:"B",row:5,col:1,len:3,orientation:"horizontal"},{id:"C",row:4,col:4,len:2,orientation:"vertical"},{id:"D",row:4,col:1,len:3,orientation:"horizontal"},{id:"E",row:1,col:4,len:2,orientation:"horizontal"}]},
    {idealMoves:7,cars:[{id:"target",row:2,col:2,len:2,orientation:"horizontal"},{id:"A",row:4,col:2,len:2,orientation:"vertical"},{id:"B",row:2,col:0,len:2,orientation:"vertical"},{id:"C",row:4,col:3,len:2,orientation:"vertical"},{id:"D",row:4,col:4,len:2,orientation:"horizontal"},{id:"E",row:1,col:4,len:3,orientation:"vertical"}]},
    {idealMoves:7,cars:[{id:"target",row:2,col:2,len:2,orientation:"horizontal"},{id:"A",row:3,col:2,len:2,orientation:"vertical"},{id:"B",row:4,col:3,len:3,orientation:"horizontal"},{id:"C",row:0,col:2,len:2,orientation:"horizontal"},{id:"D",row:0,col:1,len:2,orientation:"vertical"},{id:"E",row:0,col:4,len:3,orientation:"vertical"}]},
    {idealMoves:7,cars:[{id:"target",row:2,col:0,len:2,orientation:"horizontal"},{id:"A",row:3,col:3,len:2,orientation:"vertical"},{id:"B",row:0,col:5,len:3,orientation:"vertical"},{id:"C",row:2,col:2,len:3,orientation:"vertical"},{id:"D",row:0,col:2,len:2,orientation:"horizontal"},{id:"E",row:5,col:1,len:3,orientation:"horizontal"},{id:"F",row:1,col:1,len:3,orientation:"horizontal"}]},
    {idealMoves:7,cars:[{id:"target",row:2,col:1,len:2,orientation:"horizontal"},{id:"A",row:0,col:2,len:2,orientation:"horizontal"},{id:"B",row:3,col:0,len:2,orientation:"horizontal"},{id:"C",row:4,col:2,len:3,orientation:"horizontal"},{id:"D",row:4,col:1,len:2,orientation:"vertical"},{id:"E",row:0,col:4,len:2,orientation:"vertical"},{id:"F",row:2,col:4,len:2,orientation:"vertical"},{id:"G",row:2,col:5,len:3,orientation:"vertical"}]},
    {idealMoves:7,cars:[{id:"target",row:2,col:1,len:2,orientation:"horizontal"},{id:"A",row:5,col:3,len:2,orientation:"horizontal"},{id:"B",row:3,col:1,len:2,orientation:"horizontal"},{id:"C",row:0,col:4,len:3,orientation:"vertical"},{id:"D",row:0,col:1,len:3,orientation:"horizontal"},{id:"E",row:3,col:0,len:3,orientation:"vertical"},{id:"F",row:4,col:2,len:3,orientation:"horizontal"},{id:"G",row:4,col:1,len:2,orientation:"vertical"}]},
  ],
  8: [
    {idealMoves:8,cars:[{id:"target",row:2,col:0,len:2,orientation:"horizontal"},{id:"A",row:0,col:2,len:3,orientation:"vertical"},{id:"B",row:1,col:5,len:3,orientation:"vertical"},{id:"C",row:5,col:0,len:3,orientation:"horizontal"},{id:"D",row:3,col:2,len:2,orientation:"horizontal"}]},
    {idealMoves:8,cars:[{id:"target",row:2,col:0,len:2,orientation:"horizontal"},{id:"A",row:4,col:4,len:2,orientation:"horizontal"},{id:"B",row:0,col:2,len:2,orientation:"vertical"},{id:"C",row:4,col:3,len:2,orientation:"vertical"},{id:"D",row:0,col:5,len:3,orientation:"vertical"},{id:"E",row:3,col:1,len:2,orientation:"vertical"},{id:"F",row:0,col:3,len:2,orientation:"vertical"}]},
    {idealMoves:8,cars:[{id:"target",row:2,col:1,len:2,orientation:"horizontal"},{id:"A",row:1,col:1,len:3,orientation:"horizontal"},{id:"B",row:0,col:0,len:2,orientation:"vertical"},{id:"C",row:5,col:1,len:3,orientation:"horizontal"},{id:"D",row:3,col:4,len:2,orientation:"horizontal"},{id:"E",row:0,col:5,len:3,orientation:"vertical"},{id:"F",row:4,col:0,len:2,orientation:"horizontal"},{id:"G",row:2,col:3,len:3,orientation:"vertical"}]},
    {idealMoves:8,cars:[{id:"target",row:2,col:2,len:2,orientation:"horizontal"},{id:"A",row:0,col:1,len:2,orientation:"vertical"},{id:"B",row:0,col:3,len:2,orientation:"vertical"},{id:"C",row:5,col:3,len:3,orientation:"horizontal"},{id:"D",row:4,col:2,len:2,orientation:"vertical"},{id:"E",row:3,col:1,len:3,orientation:"horizontal"},{id:"F",row:3,col:0,len:3,orientation:"vertical"},{id:"G",row:1,col:5,len:3,orientation:"vertical"},{id:"H",row:4,col:3,len:2,orientation:"horizontal"}]},
    {idealMoves:8,cars:[{id:"target",row:2,col:0,len:2,orientation:"horizontal"},{id:"A",row:2,col:5,len:2,orientation:"vertical"},{id:"B",row:1,col:0,len:3,orientation:"horizontal"},{id:"C",row:5,col:4,len:2,orientation:"horizontal"},{id:"D",row:4,col:3,len:2,orientation:"horizontal"},{id:"E",row:4,col:0,len:2,orientation:"vertical"},{id:"F",row:0,col:2,len:3,orientation:"horizontal"},{id:"G",row:4,col:1,len:2,orientation:"horizontal"},{id:"H",row:1,col:4,len:3,orientation:"vertical"}]},
    {idealMoves:8,cars:[{id:"target",row:2,col:0,len:2,orientation:"horizontal"},{id:"A",row:3,col:0,len:2,orientation:"vertical"},{id:"B",row:3,col:4,len:2,orientation:"vertical"},{id:"C",row:4,col:1,len:2,orientation:"horizontal"},{id:"D",row:1,col:2,len:3,orientation:"vertical"},{id:"E",row:0,col:0,len:2,orientation:"horizontal"},{id:"F",row:0,col:3,len:2,orientation:"horizontal"},{id:"G",row:5,col:0,len:3,orientation:"horizontal"},{id:"H",row:4,col:3,len:2,orientation:"vertical"}]},
  ],
  9: [
    {idealMoves:9,cars:[{id:"target",row:2,col:0,len:2,orientation:"horizontal"},{id:"A",row:0,col:2,len:3,orientation:"vertical"},{id:"B",row:2,col:4,len:2,orientation:"vertical"},{id:"C",row:0,col:3,len:2,orientation:"horizontal"},{id:"D",row:5,col:0,len:3,orientation:"horizontal"},{id:"E",row:3,col:5,len:3,orientation:"vertical"}]},
    {idealMoves:9,cars:[{id:"target",row:2,col:0,len:2,orientation:"horizontal"},{id:"A",row:3,col:1,len:3,orientation:"horizontal"},{id:"B",row:0,col:2,len:3,orientation:"vertical"},{id:"C",row:1,col:4,len:2,orientation:"vertical"},{id:"D",row:1,col:5,len:3,orientation:"vertical"},{id:"E",row:4,col:3,len:2,orientation:"horizontal"},{id:"F",row:3,col:0,len:2,orientation:"vertical"}]},
    {idealMoves:9,cars:[{id:"target",row:2,col:0,len:2,orientation:"horizontal"},{id:"A",row:3,col:1,len:3,orientation:"horizontal"},{id:"B",row:3,col:0,len:3,orientation:"vertical"},{id:"C",row:1,col:4,len:3,orientation:"vertical"},{id:"D",row:5,col:4,len:2,orientation:"horizontal"},{id:"E",row:1,col:5,len:2,orientation:"vertical"},{id:"F",row:4,col:1,len:2,orientation:"horizontal"},{id:"G",row:1,col:2,len:2,orientation:"vertical"},{id:"H",row:4,col:3,len:2,orientation:"horizontal"}]},
  ],
  10: [
    {idealMoves:10,cars:[{id:"target",row:2,col:0,len:2,orientation:"horizontal"},{id:"A",row:1,col:3,len:3,orientation:"vertical"},{id:"B",row:0,col:5,len:3,orientation:"vertical"},{id:"C",row:3,col:1,len:2,orientation:"vertical"},{id:"D",row:0,col:1,len:2,orientation:"horizontal"},{id:"E",row:4,col:4,len:2,orientation:"horizontal"}]},
  ],
  13: [
    {idealMoves:13,cars:[{id:"target",row:2,col:0,len:2,orientation:"horizontal"},{id:"A",row:2,col:2,len:3,orientation:"vertical"},{id:"B",row:0,col:3,len:3,orientation:"vertical"},{id:"C",row:0,col:5,len:2,orientation:"vertical"},{id:"D",row:4,col:1,len:2,orientation:"vertical"},{id:"E",row:4,col:3,len:2,orientation:"horizontal"},{id:"F",row:1,col:4,len:3,orientation:"vertical"}]},
  ],
  14: [
    {idealMoves:14,cars:[{id:"target",row:2,col:1,len:2,orientation:"horizontal"},{id:"A",row:0,col:5,len:2,orientation:"vertical"},{id:"B",row:3,col:0,len:3,orientation:"vertical"},{id:"C",row:2,col:3,len:3,orientation:"vertical"},{id:"D",row:3,col:2,len:2,orientation:"vertical"},{id:"E",row:1,col:0,len:3,orientation:"horizontal"},{id:"F",row:2,col:5,len:2,orientation:"vertical"},{id:"G",row:4,col:4,len:2,orientation:"horizontal"}]},
  ],
};

export const DIFFICULTIES = Object.keys(LEVELS_BY_DIFFICULTY).map(Number).sort((a, b) => a - b);
export const MIN_DIFF = DIFFICULTIES[0];
export const MAX_DIFF = DIFFICULTIES[DIFFICULTIES.length - 1];
