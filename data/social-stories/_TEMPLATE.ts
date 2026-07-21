// ─────────────────────────────────────────────────────────────────────────────
// TEMPLATE de história — COPIE este arquivo para criar uma nova história.
// Preencha os campos, renomeie o arquivo e o export, e registre em index.ts.
// Isto NÃO é uma história (valores são placeholders "TODO"); não está registrado.
//
// Regras de ouro (Biblioteca Clínica + Etapa 1, §16/§17):
//  • Todo item pontuável tem UMA opção correta (correta:true) e distratores
//    plausíveis, cada um com `erroTipo`.
//  • Item SEM `gabarito` = discussão mediada (não pontua; só registra).
//  • Leitura de emoção deve se apoiar em ≥2 pistas descritas na cena.
//  • Personagens citados nas cenas devem existir em `personagens`.
//  • Rode a validação: `validateStory(minhaHistoria)` deve devolver [].
// ─────────────────────────────────────────────────────────────────────────────

import type { SocialStory } from "@/lib/social/types";

export const TEMPLATE_STORY: SocialStory = {
  id: "TODO-id-unico",
  titulo: "TODO título",
  faixa: "crianca",            // "crianca" | "adolescente" | "adulto"
  nivel: 1,                    // 1..7
  objetivoClinico: "TODO objetivo clínico",
  habilidadeTreinada: ["RE"],  // eixos: RE CX TM TP IN JS RS FI RP
  ambiente: { id: "ENV-000", nome: "TODO ambiente" },

  personagens: [
    { id: "p1", nome: "TODO", papel: "TODO", emoji: "🙂" },
  ],

  cenas: [
    {
      id: "c1",
      imagem: undefined,       // ref a asset futuro (ilustração não é criada aqui)
      descricao: "TODO descrição do quadro (o que se vê, literal).",
      contexto: "TODO pista de contexto (ambiente/momento).",
      personagens: ["p1"],
      perguntas: [
        // Exemplo de item PONTUÁVEL (escolha única):
        {
          id: "c1q1",
          tipo: "observacao",
          eixo: "CX",
          enunciado: "TODO pergunta",
          formato: "escolhaUnica",
          opcoes: [
            { id: "a", texto: "TODO correta", correta: true },
            { id: "b", texto: "TODO distrator", erroTipo: "ignorar-contexto" },
          ],
          gabarito: "a",
          dica1: "TODO dica nível 1",
          dica2: "TODO dica nível 2",
        },
        // Exemplo de item de DISCUSSÃO MEDIADA (sem gabarito → não pontua):
        {
          id: "c1q2",
          tipo: "generalizacao",
          eixo: "RP",
          enunciado: "TODO pergunta aberta para o profissional mediar",
          formato: "abertaRegistrada",
          notaProfissional: "TODO orientação de mediação (não exibida ao paciente)",
        },
      ],
    },
  ],

  reflexao: [
    {
      id: "r1",
      tipo: "generalizacao",
      eixo: "RP",
      enunciado: "TODO pergunta de reflexão/generalização",
      formato: "abertaRegistrada",
    },
  ],

  notasProfissional: ["TODO nota para o profissional sobre a história"],

  meta: { versao: 1, contemIronia: false, ordemToM: 0, geradoPorIA: false, revisadoPor: "", aprovadoEm: "" },
};
