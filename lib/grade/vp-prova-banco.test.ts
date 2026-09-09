import { describe, expect, it } from "vitest";
import { PROBLEMAS_NIVEL_2 } from "./problemas/nivel2";
import { avaliarEstrutura } from "./estrutura";
import { temSolucaoUnica, validarPuzzle } from "./solver";
import { itensDaRestricao } from "./motor";
import type { Restricao } from "./tipos";

// Prova do VP escrita ANTES de ver a entrega do gerador. O risco desta fatia não é o solver
// (já provado) nem a régua (já provada): é o TEXTO. Um gerador pode emitir lógica correta com
// frase errada — e aí o paciente lê uma coisa e o motor cobra outra. Isso é indetectável pela
// suíte de lógica e destrói o exercício em silêncio.

describe("banco de nível 2 — a lógica", () => {
  it("são 4 problemas, todos com solução única e gabarito válido", () => {
    expect(PROBLEMAS_NIVEL_2).toHaveLength(4);
    for (const p of PROBLEMAS_NIVEL_2) {
      expect(validarPuzzle(p), `${p.id}`).toBeNull();
      expect(temSolucaoUnica(p), `${p.id}`).toBe(true);
      expect(p.posicoes).toBe(4);
      expect(p.categorias).toHaveLength(3);
    }
  });

  it("todos passam na régua INTEIRA, e o motivo aparece quando não passam", () => {
    for (const p of PROBLEMAS_NIVEL_2) {
      const r = avaliarEstrutura(p);
      expect(r.aprovado, `${p.id} reprovou: ${r.motivos.join(" | ")}`).toBe(true);
    }
  });

  it("nenhum problema repete a solução de outro", () => {
    const chaves = PROBLEMAS_NIVEL_2.map((p) => JSON.stringify(p.solucao));
    expect(new Set(chaves).size).toBe(chaves.length);
  });

  it("o eixo tem rótulos, um por posição", () => {
    for (const p of PROBLEMAS_NIVEL_2) {
      expect(p.rotulosPosicao, `${p.id} sem rótulos de eixo`).toHaveLength(p.posicoes);
    }
  });
});

describe("banco de nível 2 — o TEXTO das pistas", () => {
  const todasAsPistas = PROBLEMAS_NIVEL_2.flatMap((p) =>
    p.pistas.map((pista) => ({ puzzle: p.id, pista }))
  );

  it("nenhuma frase malformada, e nenhum resto de molde", () => {
    for (const { puzzle, pista } of todasAsPistas) {
      const t = pista.texto;
      expect(t, `${puzzle}/${pista.id}: espaço duplo`).not.toMatch(/ {2}/);
      expect(t, `${puzzle}/${pista.id}: espaço antes de pontuação`).not.toMatch(/\s[.,;]/);
      expect(t, `${puzzle}/${pista.id}: não termina em ponto`).toMatch(/\.$/);
      expect(t, `${puzzle}/${pista.id}: não começa com maiúscula`).toMatch(/^[A-ZÁÉÍÓÚÂÊÔÃÕÀÇ]/);
      expect(t, `${puzzle}/${pista.id}: resto de molde`).not.toMatch(/\{|\}|undefined|NaN|null/);
    }
  });

  it("toda pista menciona os valores de TODAS as suas restrições", () => {
    // Se o texto não nomeia um item que a restrição usa, o paciente não tem como deduzir:
    // o motor sabe algo que a frase não disse.
    for (const { puzzle, pista } of todasAsPistas) {
      for (const restricao of pista.restricoes) {
        for (const item of itensDaRestricao(restricao)) {
          expect(pista.texto, `${puzzle}/${restricao.id}: o texto não cita "${item.valor}"`)
            .toContain(item.valor);
        }
      }
    }
  });

  it("nas pistas de ORDEM, a ordem dos nomes na frase bate com a ordem lógica", () => {
    // O defeito silencioso que esta prova existe para pegar: "A vem antes de B" escrito para uma
    // restrição que na verdade diz pos(B) < pos(A). Lógica e leitura divergem, e nenhum teste
    // de solver acusa — o puzzle continua tendo solução única, só que insolúvel pelo enunciado.
    const ordemEsperada = (r: Restricao): number[] | null => {
      switch (r.tipo) {
        case "T4": case "T11": case "T6": return [0, 1];           // A … B
        case "T7": return [1, 0, 2];                               // C … A … B (molde da spec)
        default: return null;                                       // demais não impõem ordem textual
      }
    };
    for (const { puzzle, pista } of todasAsPistas) {
      if (pista.restricoes.length !== 1) continue;   // frase composta tem sintaxe própria
      const restricao = pista.restricoes[0];
      const esperada = ordemEsperada(restricao);
      if (esperada === null) continue;
      const itens = itensDaRestricao(restricao);
      const posicoesNoTexto = esperada.map((i) => pista.texto.indexOf(itens[i].valor));
      const crescente = posicoesNoTexto.every((v, i) => i === 0 || v > posicoesNoTexto[i - 1]);
      expect(crescente, `${puzzle}/${restricao.id} (${restricao.tipo}): a frase "${pista.texto}" apresenta os itens fora da ordem lógica`).toBe(true);
    }
  });

  it("negação só onde há exclusão, e exclusão sempre com negação", () => {
    for (const { puzzle, pista } of todasAsPistas) {
      const temExclusao = pista.restricoes.some((r) => r.tipo === "T2");
      const temNao = /\bnão\b/i.test(pista.texto);
      expect(temNao, `${puzzle}/${pista.id}: "${pista.texto}"`).toBe(temExclusao);
    }
  });

  it("existe pelo menos uma pista composta no banco", () => {
    const compostas = todasAsPistas.filter(({ pista }) => pista.restricoes.length > 1);
    expect(compostas.length).toBeGreaterThan(0);
  });
});
