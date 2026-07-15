// Tipos do Estacionamento Lógico (puzzle tipo Rush Hour).
export interface ParkingCar {
  id: string;
  row: number;
  col: number;
  len: number;
  orientation: "horizontal" | "vertical";
}

export interface Level {
  /** Identificador estável da fase (ex.: "n3-07") — usado para não repetir entre sessões. */
  id?: string;
  idealMoves: number;
  cars: ParkingCar[];
}
