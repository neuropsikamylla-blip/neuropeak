// Tipos do Estacionamento Lógico (puzzle tipo Rush Hour).
export interface ParkingCar {
  id: string;
  row: number;
  col: number;
  len: number;
  orientation: "horizontal" | "vertical";
}

export interface Level {
  idealMoves: number;
  cars: ParkingCar[];
}
