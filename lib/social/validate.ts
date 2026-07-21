// ─────────────────────────────────────────────────────────────────────────────
// Validação de histórias sociais (invariantes — Etapa 1, §16).
// Puro e sem React. Use ao adicionar arquivos de dados: `validateStory(story)`
// devolve a lista de problemas (vazia = ok). O registry roda isto em dev.
// ─────────────────────────────────────────────────────────────────────────────

import type { SocialStory, SocialQuestion } from "./types";

const CHOICE_FORMATS = new Set(["escolhaUnica", "multiplaSelecao", "escolherExpressao"]);

function validateQuestion(q: SocialQuestion, path: string, errors: string[]) {
  if (!q.id) errors.push(`${path}: pergunta sem id`);
  if (!q.enunciado) errors.push(`${path}(${q.id}): enunciado vazio`);

  const pontuavel = q.gabarito !== undefined; // sem gabarito = discussão mediada
  if (pontuavel && CHOICE_FORMATS.has(q.formato)) {
    if (!q.opcoes?.length) errors.push(`${path}(${q.id}): formato de escolha exige opcoes`);
    const ids = new Set((q.opcoes ?? []).map((o) => o.id));
    const gab = Array.isArray(q.gabarito) ? q.gabarito : [q.gabarito!];
    for (const g of gab) if (!ids.has(g)) errors.push(`${path}(${q.id}): gabarito "${g}" não está nas opcoes`);
  }
  if (q.formato === "classificar") {
    if (!q.baldes?.length) errors.push(`${path}(${q.id}): "classificar" exige baldes`);
    for (const o of q.opcoes ?? [])
      if (o.categoria && q.baldes && !q.baldes.includes(o.categoria))
        errors.push(`${path}(${q.id}): opção "${o.id}" tem categoria fora dos baldes`);
  }
  if (q.formato === "escala" && !q.escala) errors.push(`${path}(${q.id}): "escala" exige config de escala`);
}

/** Devolve a lista de problemas da história (array vazio = válida). */
export function validateStory(story: SocialStory): string[] {
  const e: string[] = [];
  if (!story.id) e.push("história sem id");
  const P = `história "${story.id}"`;
  if (!story.titulo) e.push(`${P}: título vazio`);
  if (![1, 2, 3, 4, 5, 6, 7].includes(story.nivel)) e.push(`${P}: nível fora de 1–7`);
  if (!["crianca", "adolescente", "adulto"].includes(story.faixa)) e.push(`${P}: faixa inválida`);
  if (!story.cenas?.length) e.push(`${P}: precisa de ao menos 1 cena`);

  const charIds = new Set(story.personagens?.map((c) => c.id) ?? []);
  const qIds = new Set<string>();

  story.cenas?.forEach((scene, i) => {
    const sp = `${P} · cena[${i}]`;
    if (!scene.id) e.push(`${sp}: cena sem id`);
    if (!scene.descricao) e.push(`${sp}: descrição vazia`);
    if (!scene.perguntas?.length) e.push(`${sp}: cena sem perguntas`);
    for (const pid of scene.personagens ?? [])
      if (!charIds.has(pid)) e.push(`${sp}: personagem "${pid}" não existe em personagens`);
    scene.perguntas?.forEach((q) => {
      if (qIds.has(q.id)) e.push(`${sp}: id de pergunta duplicado "${q.id}"`);
      qIds.add(q.id);
      validateQuestion(q, sp, e);
    });
  });

  story.reflexao?.forEach((q) => {
    if (qIds.has(q.id)) e.push(`${P} · reflexão: id duplicado "${q.id}"`);
    qIds.add(q.id);
    validateQuestion(q, `${P} · reflexão`, e);
  });

  return e;
}

/** Valida um lote e lança em dev se houver problema (usado pelo registry). */
export function assertStories(stories: SocialStory[]): SocialStory[] {
  const ids = new Set<string>();
  const problems: string[] = [];
  for (const s of stories) {
    if (ids.has(s.id)) problems.push(`id de história duplicado: "${s.id}"`);
    ids.add(s.id);
    problems.push(...validateStory(s));
  }
  if (problems.length && process.env.NODE_ENV !== "production") {
    // eslint-disable-next-line no-console
    console.warn("[social-stories] problemas de validação:\n" + problems.join("\n"));
  }
  return stories;
}
