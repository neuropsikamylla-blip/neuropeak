import { describe, it, expect } from "vitest";
import {
  parseAssetId, buildCharacterId, buildExpressionId, buildSimpleId, isAssetId,
  deterministicUrl, joinUrl, codeFromSlug,
  parseAssetMetadata, metadataToRecord, recordsFromManifest,
  AssetRegistry, createInMemoryRepository, AssetService,
  type AssetManifest, type CharacterMetadata,
} from "./index";

// ── IDs ─────────────────────────────────────────────────────────────────────────
describe("parseAssetId", () => {
  it("personagem = 3 segmentos", () => {
    expect(parseAssetId("character:children:bento-01")).toMatchObject({ kind: "character", ageGroup: "children", slug: "bento-01" });
  });
  it("expressão/pose = 4 segmentos, deriva o personagem dono", () => {
    expect(parseAssetId("expression:children:bento-01:alegria")).toMatchObject({
      kind: "expression", variant: "alegria", characterId: "character:children:bento-01",
    });
    expect(parseAssetId("pose:adults:ana-02:sentado")?.characterId).toBe("character:adults:ana-02");
  });
  it("simples = 2 segmentos (inclui animal/vehicle)", () => {
    expect(parseAssetId("object:mochila-azul")).toMatchObject({ kind: "object", slug: "mochila-azul" });
    expect(parseAssetId("animal:dog")?.kind).toBe("animal");
    expect(parseAssetId("vehicle:car")?.kind).toBe("vehicle");
  });
  it("rejeita malformados", () => {
    expect(parseAssetId("foo:children:x")).toBeNull();
    expect(parseAssetId("character:marte:x")).toBeNull();
    expect(parseAssetId("character:children:Maiúsculo")).toBeNull();
    expect(parseAssetId("character:children")).toBeNull();
    expect(parseAssetId("object:a:b")).toBeNull();
    expect(isAssetId("")).toBe(false);
  });
  it("construtores produzem ids parseáveis", () => {
    expect(isAssetId(buildCharacterId("teenagers", "luca-03"))).toBe(true);
    expect(parseAssetId(buildExpressionId("children", "bento-01", "raiva"))?.variant).toBe("raiva");
    expect(parseAssetId(buildSimpleId("vehicle", "car"))?.kind).toBe("vehicle");
  });
});

// ── Caminhos (layout FLAT) ────────────────────────────────────────────────────────
describe("resolução de caminhos flat", () => {
  it("joinUrl preserva a barra inicial e limpa duplicadas", () => {
    expect(joinUrl("/assets/expressions", "/child_001_happy.svg")).toBe("/assets/expressions/child_001_happy.svg");
  });
  it("codeFromSlug converte hífen → underscore", () => {
    expect(codeFromSlug("child-001")).toBe("child_001");
  });
  it("deterministicUrl por tipo", () => {
    expect(deterministicUrl(parseAssetId("character:children:child-001")!)).toBe("/assets/characters/children/child_001.svg");
    expect(deterministicUrl(parseAssetId("character:teenagers:teen-002")!)).toBe("/assets/characters/teens/teen_002.svg");
    expect(deterministicUrl(parseAssetId("character:olderAdults:elder-001")!)).toBe("/assets/characters/elders/elder_001.svg");
    expect(deterministicUrl(parseAssetId("expression:children:child-001:happy")!)).toBe("/assets/expressions/child_001_happy.svg");
    expect(deterministicUrl(parseAssetId("pose:children:child-001:standing")!)).toBe("/assets/poses/child_001_standing.svg");
    expect(deterministicUrl(parseAssetId("object:backpack")!)).toBe("/assets/objects/backpack.svg");
    expect(deterministicUrl(parseAssetId("scene:classroom")!)).toBe("/assets/environments/classroom.svg");
    expect(deterministicUrl(parseAssetId("animal:dog")!)).toBe("/assets/animals/dog.svg");
    expect(deterministicUrl(parseAssetId("vehicle:school-bus")!)).toBe("/assets/vehicles/school-bus.svg");
    expect(deterministicUrl(parseAssetId("icon:heart")!)).toBe("/assets/icons/heart.svg");
  });
});

// ── Metadata Loader ───────────────────────────────────────────────────────────────
function charMeta(): CharacterMetadata {
  return {
    id: "character:children:child-001", kind: "character", title: "Personagem 1", ageGroup: "children",
    expressions: [{ id: "happy", label: "Alegre" }, { id: "sad" }],
    poses: [{ id: "standing" }],
    transparentBackground: true,
  };
}

describe("parseAssetMetadata", () => {
  it("personagem válido → sem erros", () => {
    const { metadata, errors } = parseAssetMetadata(charMeta());
    expect(errors).toEqual([]);
    expect(metadata?.kind).toBe("character");
  });
  it("aceita expressões como strings", () => {
    const m = { ...charMeta(), expressions: ["happy", "sad"] };
    expect(parseAssetMetadata(m).errors).toEqual([]);
  });
  it("acusa id que não bate com o kind", () => {
    const m = { ...charMeta(), id: "object:child-001" };
    expect(parseAssetMetadata(m).errors.some((e) => e.includes("não corresponde ao kind"))).toBe(true);
  });
  it("asset móvel com fundo não transparente é rejeitado (Direção de Arte)", () => {
    const m = { ...charMeta(), transparentBackground: false };
    expect(parseAssetMetadata(m).errors.some((e) => e.includes("transparente"))).toBe(true);
  });
  it("cenário opaco é aceito (não é móvel)", () => {
    const m = { id: "scene:sala", kind: "scene", title: "Sala", transparentBackground: false };
    expect(parseAssetMetadata(m).errors).toEqual([]);
  });
  it("animal e veículo simples são aceitos", () => {
    expect(parseAssetMetadata({ id: "animal:dog", kind: "animal", title: "Cachorro" }).errors).toEqual([]);
    expect(parseAssetMetadata({ id: "vehicle:car", kind: "vehicle", title: "Carro" }).errors).toEqual([]);
  });
});

describe("recordsFromManifest", () => {
  it("ignora inválidos e deduplica", () => {
    const manifest: AssetManifest = {
      version: 1,
      assets: [charMeta(), charMeta(), { id: "bad", kind: "nope" } as never],
    };
    expect(recordsFromManifest(manifest)).toHaveLength(1);
  });
});

// ── Registry ─────────────────────────────────────────────────────────────────────
describe("AssetRegistry", () => {
  const reg = new AssetRegistry([
    metadataToRecord(charMeta()),
    metadataToRecord({ id: "object:mochila", kind: "object", title: "Mochila" }),
  ]);
  it("get/has/size", () => {
    expect(reg.size()).toBe(2);
    expect(reg.has("character:children:child-001")).toBe(true);
    expect(reg.get("object:mochila")?.title).toBe("Mochila");
  });
  it("filtra por kind e faixa", () => {
    expect(reg.byKind("character")).toHaveLength(1);
    expect(reg.byAgeGroup("children")).toHaveLength(1);
    expect(reg.list({ kind: "object" })).toHaveLength(1);
  });
});

// ── Service ────────────────────────────────────────────────────────────────────────
describe("AssetService", () => {
  const repo = createInMemoryRepository([
    metadataToRecord(charMeta()),
    metadataToRecord({ id: "object:mochila", kind: "object", title: "Mochila azul", category: "escola" }),
    metadataToRecord({ id: "animal:dog", kind: "animal", title: "Cachorro" }),
  ]);
  const svc = new AssetService(repo);

  it("resolveUrl é determinístico por convenção", () => {
    expect(svc.resolveUrl("character:children:child-001")).toBe("/assets/characters/children/child_001.svg");
    expect(svc.resolveUrl("expression:children:child-001:happy")).toBe("/assets/expressions/child_001_happy.svg");
    expect(svc.resolveUrl("object:mochila")).toBe("/assets/objects/mochila.svg");
    expect(svc.resolveUrl("lixo")).toBeNull();
  });
  it("getCharacter resolve URLs e mapeia a faixa social", () => {
    const c = svc.getCharacter("character:children:child-001")!;
    expect(c.name).toBe("Personagem 1");
    expect(c.faixa).toBe("crianca");
    expect(c.baseUrl).toBe("/assets/characters/children/child_001.svg");
    expect(c.expressions[0]).toMatchObject({ id: "happy", label: "Alegre", url: "/assets/expressions/child_001_happy.svg" });
    expect(c.poses[0].url).toBe("/assets/poses/child_001_standing.svg");
  });
  it("listCharactersByFaixa e helpers de expressão/pose", () => {
    expect(svc.listCharactersByFaixa("crianca")).toHaveLength(1);
    expect(svc.getExpressionUrl("character:children:child-001", "sad")).toBe("/assets/expressions/child_001_sad.svg");
    expect(svc.getPoseUrl("character:children:child-001", "standing")).toBe("/assets/poses/child_001_standing.svg");
  });
  it("getObject/getAnimal e stats", () => {
    expect(svc.getObject("object:mochila")?.title).toBe("Mochila azul");
    expect(svc.getAnimal("animal:dog")?.title).toBe("Cachorro");
    expect(svc.getObject("animal:dog")).toBeNull(); // tipo errado
    expect(svc.stats()).toMatchObject({ total: 3, byKind: { character: 1, object: 1, animal: 1 } });
  });
});
