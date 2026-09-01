export type TipoProblema = "A" | "B" | "C" | "D" | "E";

/**
 * O tipo E não acrescenta uma quinta geometria. Ele marca o papel sequencial
 * de uma configuração C ou D: aparecer logo após problemas já aprendidos para
 * exigir nova análise. O sequenciador futuro poderá selecioná-lo por `tipo`.
 */
export type TipoGeometrico = Exclude<TipoProblema, "E">;
