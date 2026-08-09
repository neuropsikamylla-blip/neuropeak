import { describe, expect, it } from "vitest";
import { LimitedImagePreloader } from "./image-loader";

function controlledLoader() {
  const started: string[] = [];
  const pending = new Map<string, () => void>();
  const load = (src: string) => new Promise<void>((resolve) => {
    started.push(src);
    pending.set(src, resolve);
  });

  return { started, pending, load };
}

async function flushLoader() {
  await Promise.resolve();
  await Promise.resolve();
}

describe("preload de imagens do Focus Agentes", () => {
  it("limita 144 pedidos a seis downloads simultâneos e conclui todos", async () => {
    const network = controlledLoader();
    const preloader = new LimitedImagePreloader(6, network.load);
    const sources = Array.from({ length: 144 }, (_, index) => `agent-${index}`);

    preloader.requestMany(sources);
    expect(network.started).toHaveLength(6);
    expect(preloader.inFlight).toBeLessThanOrEqual(6);

    for (const source of sources) {
      expect(preloader.inFlight).toBeLessThanOrEqual(6);
      network.pending.get(source)?.();
      await flushLoader();
    }

    await preloader.idle();
    expect(network.started).toHaveLength(144);
    expect(preloader.inFlight).toBe(0);
  });

  it("não baixa duas vezes a mesma imagem", async () => {
    const network = controlledLoader();
    const preloader = new LimitedImagePreloader(6, network.load);

    preloader.request("agent-azul");
    preloader.request("agent-azul");
    expect(network.started).toEqual(["agent-azul"]);

    network.pending.get("agent-azul")?.();
    await preloader.idle();
    expect(network.started).toEqual(["agent-azul"]);
  });

  it("coloca a rodada prioritária antes do restante do roster em espera", async () => {
    const network = controlledLoader();
    const preloader = new LimitedImagePreloader(2, network.load);

    preloader.requestMany(["background-1", "background-2", "background-3", "background-4"]);
    preloader.requestMany(["current-round", "next-round"], true);

    network.pending.get("background-1")?.();
    await flushLoader();
    network.pending.get("background-2")?.();
    await flushLoader();

    expect(network.started.slice(2)).toEqual(["current-round", "next-round"]);
  });

  it("promove uma imagem que já aguardava em segundo plano", async () => {
    const network = controlledLoader();
    const preloader = new LimitedImagePreloader(2, network.load);

    preloader.requestMany(["background-1", "background-2", "next-round", "background-3"]);
    preloader.request("next-round", true);

    network.pending.get("background-1")?.();
    await flushLoader();
    network.pending.get("background-2")?.();
    await flushLoader();

    expect(network.started.slice(2)).toEqual(["next-round", "background-3"]);
  });
});
