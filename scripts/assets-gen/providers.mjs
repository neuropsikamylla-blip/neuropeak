// ─────────────────────────────────────────────────────────────────────────────
// Provedores de imagem — ADAPTER plugável. O runner só conhece a interface:
//     async generate({ prompt, negative, width, height }) -> Buffer (PNG)
//
// 'mock'   → não chama API nenhuma; escreve um PNG placeholder transparente 1x1.
//            Serve para exercitar TODO o pipeline (nomes, pastas, zip, metadata)
//            sem gastar dinheiro.
// 'gemini' / 'openai' → esqueleto de chamada real, PROTEGIDO por variável de
//            ambiente com a chave. NÃO roda sem a chave. Ajuste o endpoint/params
//            à API que você escolher — está isolado aqui de propósito.
// ─────────────────────────────────────────────────────────────────────────────

// PNG 1x1 transparente (base64) — placeholder do provedor mock.
const TRANSPARENT_PNG_1x1 = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==",
  "base64",
);

const mockProvider = {
  name: "mock",
  requiresKey: false,
  async generate() {
    return TRANSPARENT_PNG_1x1;
  },
};

// ── Esqueleto: OpenAI Images (gpt-image-1) ────────────────────────────────────
const openaiProvider = {
  name: "openai",
  requiresKey: true,
  async generate({ prompt, transparent }) {
    const key = process.env.OPENAI_API_KEY;
    if (!key) throw new Error("OPENAI_API_KEY ausente — defina antes de rodar o provedor 'openai'.");
    // gpt-image-1 aceita 1024x1024 | 1024x1536 | 1536x1024 | auto (NÃO 2048²).
    // Para 2048² faça upscale depois. Ajuste via OPENAI_IMAGE_SIZE/QUALITY.
    const res = await fetch("https://api.openai.com/v1/images/generations", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${key}` },
      body: JSON.stringify({
        model: process.env.OPENAI_IMAGE_MODEL || "gpt-image-1",
        prompt,
        size: process.env.OPENAI_IMAGE_SIZE || "1024x1024",
        quality: process.env.OPENAI_IMAGE_QUALITY || "high",
        background: transparent === false ? "opaque" : "transparent",
        n: 1,
      }),
    });
    if (!res.ok) throw new Error(`OpenAI ${res.status}: ${await res.text()}`);
    const json = await res.json();
    const b64 = json?.data?.[0]?.b64_json;
    if (!b64) throw new Error("OpenAI: resposta sem b64_json");
    return Buffer.from(b64, "base64");
  },
};

// ── Esqueleto: Google Gemini / Nano Banana (image) ────────────────────────────
const geminiProvider = {
  name: "gemini",
  requiresKey: true,
  async generate({ prompt }) {
    const key = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
    if (!key) throw new Error("GEMINI_API_KEY ausente — defina antes de rodar o provedor 'gemini'.");
    const model = process.env.GEMINI_IMAGE_MODEL || "gemini-3-pro-image";
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`;
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
    });
    if (!res.ok) throw new Error(`Gemini ${res.status}: ${await res.text()}`);
    const json = await res.json();
    const part = json?.candidates?.[0]?.content?.parts?.find((p) => p.inlineData?.data);
    if (!part) throw new Error("Gemini: resposta sem imagem (inlineData)");
    return Buffer.from(part.inlineData.data, "base64");
  },
};

const PROVIDERS = { mock: mockProvider, openai: openaiProvider, gemini: geminiProvider };

export function getProvider(name) {
  const p = PROVIDERS[name];
  if (!p) throw new Error(`Provedor desconhecido: "${name}". Disponíveis: ${Object.keys(PROVIDERS).join(", ")}.`);
  return p;
}
