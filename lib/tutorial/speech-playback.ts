export interface SpeechPlaybackHooks {
  onItemStart: (texto: string, index: number) => void;
  onItemEnd: (texto: string, index: number) => void;
  isCancelled: () => boolean;
}

export const SPEECH_INITIAL_DELAY_MS = 500;
export const SPEECH_ONSTART_GUARD_MS = 1200;

export function speechGapMs(sequenceLength: number): number {
  return sequenceLength >= 6 ? 1000 : 850;
}

function cancelSpeech(): void {
  if (typeof window !== "undefined" && window.speechSynthesis) {
    window.speechSynthesis.cancel();
  }
}

function wait(ms: number, isCancelled: () => boolean): Promise<boolean> {
  return new Promise((resolve) => {
    if (isCancelled()) {
      cancelSpeech();
      resolve(false);
      return;
    }

    let settled = false;
    const finish = (completed: boolean) => {
      if (settled) return;
      settled = true;
      window.clearTimeout(timeoutId);
      window.clearInterval(cancelCheck);
      resolve(completed);
    };
    const timeoutId = window.setTimeout(() => finish(!isCancelled()), ms);
    const cancelCheck = window.setInterval(() => {
      if (!isCancelled()) return;
      cancelSpeech();
      finish(false);
    }, 25);
  });
}

/**
 * Fala um item e só anuncia o estímulo visual quando a síntese realmente começa.
 * A guarda cobre navegadores que não entregam `onstart`; falha de voz também preserva o visual.
 */
function speakItem(
  texto: string,
  isCancelled: () => boolean,
  onAudibleStart: () => void,
): Promise<void> {
  return new Promise((resolve) => {
    if (isCancelled()) {
      cancelSpeech();
      resolve();
      return;
    }

    if (
      typeof window === "undefined"
      || !window.speechSynthesis
      || typeof SpeechSynthesisUtterance === "undefined"
    ) {
      onAudibleStart();
      resolve();
      return;
    }

    let settled = false;
    let announced = false;
    const utterance = new SpeechSynthesisUtterance(texto);
    let onstartGuard: number | undefined;
    let cancelCheck: number | undefined;

    const announce = () => {
      if (announced || isCancelled()) return;
      announced = true;
      onAudibleStart();
    };

    const finish = () => {
      if (settled) return;
      settled = true;
      if (onstartGuard !== undefined) window.clearTimeout(onstartGuard);
      if (cancelCheck !== undefined) window.clearInterval(cancelCheck);
      utterance.onstart = null;
      utterance.onend = null;
      utterance.onerror = null;
      resolve();
    };

    utterance.lang = "pt-BR";
    utterance.rate = 0.8;
    utterance.onstart = announce;
    utterance.onend = finish;
    utterance.onerror = () => {
      announce();
      finish();
    };

    cancelCheck = window.setInterval(() => {
      if (!isCancelled()) return;
      cancelSpeech();
      finish();
    }, 25);

    // Pedimos a fala antes de qualquer aviso visual. O caminho normal anuncia em `onstart`.
    try {
      window.speechSynthesis.speak(utterance);
      if (settled) {
        // Implementações síncronas degradadas podem encerrar no próprio `speak` sem `onstart`.
        announce();
      } else {
        // Alguns navegadores omitem `onstart`; após o limite, o estímulo visual degrada sem sumir.
        onstartGuard = window.setTimeout(announce, SPEECH_ONSTART_GUARD_MS);
      }
    } catch {
      announce();
      finish();
    }
  });
}

export async function speakSequence(
  itens: string[],
  hooks: SpeechPlaybackHooks,
): Promise<void> {
  if (!await wait(SPEECH_INITIAL_DELAY_MS, hooks.isCancelled)) return;

  const gap = speechGapMs(itens.length);
  for (let index = 0; index < itens.length; index++) {
    if (hooks.isCancelled()) {
      cancelSpeech();
      return;
    }

    const texto = itens[index];
    // O callback visual fica dentro da reprodução e é disparado por `utterance.onstart`.
    await speakItem(texto, hooks.isCancelled, () => {
      hooks.onItemStart(texto, index);
    });
    if (hooks.isCancelled()) {
      cancelSpeech();
      return;
    }

    hooks.onItemEnd(texto, index);
    if (!await wait(gap, hooks.isCancelled)) return;
  }
}
