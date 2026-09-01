import { BANCO, type Problema } from "./banco";

export type Fase = 1 | 2 | 3 | 4 | 5 | 6;

/**
 * Mapa dificuldade → fase. A dificuldade que chega do `ExerciseConfig` é a escala 1–10 do
 * projeto; as fases são as seis da seção 39 dela. Deliberadamente generoso no começo: a fase 1
 * existe para aprender a regra, e ninguém deve ficar presa nela.
 */
export function faseDaDificuldade(dificuldade: number): Fase {
  const d = Math.round(dificuldade);
  // Corrigido em 01/set/2026, depois de ela abrir o exercício e dizer "não entendi nada".
  // O mapeamento anterior levava a dificuldade 3 — que é onde muita gente está — direto à fase
  // 3, a das configurações embaralhadas e alvos arbitrários. A pessoa caía no meio do épico sem
  // nunca ter visto a torre clássica. Agora sobe de duas em duas, e as fases 1 e 2 (aprender a
  // regra e transferência simples) cobrem toda a faixa inicial.
  if (d <= 2) return 1;
  if (d <= 4) return 2;
  if (d <= 6) return 3;
  if (d <= 7) return 4;
  if (d <= 9) return 5;
  return 6;
}

/**
 * Escolhe o próximo problema da fase.
 *
 * A aleatoriedade é INJETADA (`aleatorio`, no formato de `Math.random`) para o teste poder ser
 * determinístico — regra da casa: nada de configuração sorteada sem validação nem sem prova.
 *
 * Duas regras vêm das seções 40 e 41 dela: não repetir enquanto houver problema novo na fase, e
 * evitar padrão previsível — se os dois últimos foram do mesmo tipo, prefere-se outro tipo
 * quando existir alternativa. Se a fase esgotar, os usados são liberados (a sessão continua),
 * mas nunca se repete o problema imediatamente anterior.
 */
export function proximoProblema(
  fase: Fase,
  jaUsados: readonly string[],
  ultimosTipos: readonly string[],
  aleatorio: () => number = Math.random,
  banco: readonly Problema[] = BANCO
): Problema {
  const daFase = banco.filter((p) => p.fase === fase);
  if (daFase.length === 0) throw new Error(`Nenhum problema cadastrado para a fase ${fase}.`);

  const inedito = daFase.filter((p) => !jaUsados.includes(p.id));
  // Fase esgotada: recomeça, mas nunca serve o problema que acabou de sair.
  const ultimoId = jaUsados[jaUsados.length - 1];
  const disponivel = inedito.length > 0 ? inedito : daFase.filter((p) => p.id !== ultimoId);
  const pool = disponivel.length > 0 ? disponivel : daFase;

  // Anti-previsibilidade: dois do mesmo tipo em sequência pedem um terceiro diferente.
  const doisIguais =
    ultimosTipos.length >= 2 &&
    ultimosTipos[ultimosTipos.length - 1] === ultimosTipos[ultimosTipos.length - 2];
  const variado = doisIguais
    ? pool.filter((p) => p.tipo !== ultimosTipos[ultimosTipos.length - 1])
    : pool;
  const final = variado.length > 0 ? variado : pool;

  return final[Math.min(final.length - 1, Math.floor(aleatorio() * final.length))];
}
