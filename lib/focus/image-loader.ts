export type ImageLoader = (src: string) => Promise<void>;

/** Mantém a rede livre para a rodada em curso antes de preencher o cache do roster. */
export class LimitedImagePreloader {
  private readonly queued = new Set<string>();
  private readonly loading = new Set<string>();
  private readonly completed = new Set<string>();
  private readonly priorityQueue: string[] = [];
  private readonly backgroundQueue: string[] = [];
  private readonly idleResolvers = new Set<() => void>();
  private active = 0;

  constructor(private readonly limit: number, private readonly load: ImageLoader) {}

  get inFlight(): number {
    return this.active;
  }

  request(src: string, priority = false): void {
    if (this.completed.has(src)) return;
    if (this.queued.has(src)) {
      if (priority && !this.loading.has(src)) this.promote(src);
      return;
    }

    this.queued.add(src);
    (priority ? this.priorityQueue : this.backgroundQueue).push(src);
    this.startAvailable();
  }

  requestMany(sources: Iterable<string>, priority = false): void {
    for (const src of sources) this.request(src, priority);
  }

  idle(): Promise<void> {
    if (this.active === 0 && this.priorityQueue.length === 0 && this.backgroundQueue.length === 0) {
      return Promise.resolve();
    }
    return new Promise((resolve) => this.idleResolvers.add(resolve));
  }

  private startAvailable(): void {
    while (this.active < this.limit) {
      const src = this.priorityQueue.shift() ?? this.backgroundQueue.shift();
      if (!src) break;

      this.active++;
      this.loading.add(src);
      void this.load(src).catch(() => undefined).finally(() => {
        this.active--;
        this.loading.delete(src);
        this.queued.delete(src);
        this.completed.add(src);
        this.startAvailable();
        this.resolveIdle();
      });
    }
  }

  private promote(src: string): void {
    const index = this.backgroundQueue.indexOf(src);
    if (index === -1) return;
    this.backgroundQueue.splice(index, 1);
    this.priorityQueue.push(src);
  }

  private resolveIdle(): void {
    if (this.active !== 0 || this.priorityQueue.length !== 0 || this.backgroundQueue.length !== 0) return;
    for (const resolve of this.idleResolvers) resolve();
    this.idleResolvers.clear();
  }
}

function loadBrowserImage(src: string): Promise<void> {
  return new Promise((resolve) => {
    const image = new Image();
    image.onload = () => resolve();
    image.onerror = () => resolve();
    image.src = src;
  });
}

/** O cache continua carregando após desmontar o exercício; abortar perderia bytes já transferidos. */
export const focusImagePreloader = new LimitedImagePreloader(6, loadBrowserImage);
