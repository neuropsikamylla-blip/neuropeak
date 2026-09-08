import { describe, it } from "vitest";
import { temSolucaoUnica, validarPuzzle } from "./solver";
import { estadoDaAtribuicao, paraMarcacaoParcial } from "./interacao";
import { pistaSimples, type Pista, type Puzzle } from "./tipos";

const POSICOES = 5;
const CATS = ["pessoa", "cor", "fruta", "cidade", "animal", "esporte"];
const VALORES: Record<string, string[]> = {
  pessoa: ["Ana", "Bruno", "Carla", "Davi", "Elis"],
  cor: ["Azul", "Verde", "Rosa", "Ocre", "Cinza"],
  fruta: ["Maçã", "Uva", "Pera", "Figo", "Caju"],
  cidade: ["Recife", "Natal", "Belém", "Bahia", "Cuiabá"],
  animal: ["Gato", "Cão", "Peixe", "Ave", "Tatu"],
  esporte: ["Tênis", "Judô", "Vôlei", "Surfe", "Xadrez"],
};

function embaralhar<T>(itens: T[], semente: number): T[] {
  const copia = [...itens];
  let estado = semente;
  for (let i = copia.length - 1; i > 0; i -= 1) {
    estado = (estado * 1103515245 + 12345) % 2147483648;
    const j = estado % (i + 1);
    [copia[i], copia[j]] = [copia[j], copia[i]];
  }
  return copia;
}

function montar5x6(): Puzzle {
  const solucao: Record<string, string[]> = {};
  CATS.forEach((c, i) => { solucao[c] = embaralhar(VALORES[c], 7919 + i * 31); });

  // Pistas geradas a partir da solução: T1 (associação) e T3 (posição absoluta), acrescentadas
  // até o solver provar unicidade. É instrumento de MEDIÇÃO, não banco — os problemas reais
  // são da fase 5 e passam pela autoria dela.
  const candidatas: Pista[] = [];
  for (let p = 0; p < POSICOES; p += 1) {
    for (let c = 1; c < CATS.length; c += 1) {
      candidatas.push(pistaSimples(`t1-${p}-${c}`, "assoc", { tipo: "T1",
        itemA: { categoria: CATS[0], valor: solucao[CATS[0]][p] },
        itemB: { categoria: CATS[c], valor: solucao[CATS[c]][p] },
      }));
    }
    candidatas.push(pistaSimples(`t3-${p}`, "pos", { tipo: "T3",
      item: { categoria: CATS[0], valor: solucao[CATS[0]][p] }, posicao: p + 1,
    }));
  }

  const base = (pistas: Pista[]): Puzzle => ({
    id: "bench-5x6", titulo: "bench", contexto: "bench", nivel: 5, posicoes: POSICOES,
    categorias: CATS.map((id) => ({ id, label: id, valores: VALORES[id] })),
    pistas, solucao,
    metadata: {
      complexity: 0, inferenceDepthDistribution: {}, skillWeights: {},
      dominantOperations: [], clueTypeDistribution: {}, expectedDifficulty: 5,
      validatedUniqueSolution: true,
    },
  });

  const escolhidas: Pista[] = [];
  for (const pista of embaralhar(candidatas, 4242)) {
    escolhidas.push(pista);
    if (escolhidas.length >= 8 && temSolucaoUnica(base(escolhidas))) break;
  }
  return base(escolhidas);
}

function medir(rodar: () => void, repeticoes: number): number {
  const t0 = performance.now();
  for (let i = 0; i < repeticoes; i += 1) rodar();
  return (performance.now() - t0) / repeticoes;
}

describe("BENCHMARK 5 posições × 6 categorias", () => {
  it("mede o custo real de um clique", () => {
    const puzzle = montar5x6();
    const erro = validarPuzzle(puzzle);
    console.log(`\n== puzzle 5x6: ${puzzle.pistas.length} pistas · validarPuzzle: ${erro ?? "OK (solução única provada)"}`);

    // Pior caso: grade vazia. É o primeiro clique do paciente, com todos os domínios abertos.
    const vazia = paraMarcacaoParcial({});
    const tVazia = medir(() => {
      estadoDaAtribuicao(puzzle, vazia, CATS[3], VALORES[CATS[3]][0], 3);
    }, 30);

    // Meio da resolução: metade das células preenchidas corretamente.
    const meio: Record<string, (string | null)[]> = {};
    CATS.forEach((c, i) => {
      meio[c] = puzzle.solucao[c].map((v, p) => (i < 3 && p < 3 ? v : null));
    });
    const parcialMeio = paraMarcacaoParcial(meio);
    const tMeio = medir(() => {
      estadoDaAtribuicao(puzzle, parcialMeio, CATS[4], VALORES[CATS[4]][1], 2);
    }, 30);

    // Estado contraditório: o ramo que sai por "estado-ja-contraditorio".
    const contra: Record<string, (string | null)[]> = { ...meio };
    contra[CATS[0]] = [VALORES[CATS[0]][0], VALORES[CATS[0]][0], null, null, null];
    const tContra = medir(() => {
      estadoDaAtribuicao(puzzle, paraMarcacaoParcial(contra), CATS[4], VALORES[CATS[4]][1], 2);
    }, 30);

    console.log(`== grade VAZIA (pior caso):      ${tVazia.toFixed(2)} ms por clique`);
    console.log(`== MEIO da resolução:            ${tMeio.toFixed(2)} ms por clique`);
    console.log(`== estado JÁ CONTRADITÓRIO:      ${tContra.toFixed(2)} ms por clique`);
    console.log(`== pior dos três:                ${Math.max(tVazia, tMeio, tContra).toFixed(2)} ms`);

    // TETO honesto: o puzzle acima tem 27 pistas fortes, que fecham os domínios cedo. Um problema
    // real pode ter poucas pistas e mais fracas, e aí a busca trabalha muito mais. Aqui a
    // unicidade é deliberadamente abandonada para medir o custo COMPUTACIONAL máximo do formato.
    for (const quantas of [10, 6, 4, 2]) {
      const magro = { ...puzzle, pistas: puzzle.pistas.slice(0, quantas) };
      const t = medir(() => {
        estadoDaAtribuicao(magro, paraMarcacaoParcial({}), CATS[3], VALORES[CATS[3]][0], 3);
      }, 10);
      console.log(`== TETO com ${String(quantas).padStart(2)} pistas, grade vazia: ${t.toFixed(2)} ms por clique`);
    }
    console.log("");
  });
});
