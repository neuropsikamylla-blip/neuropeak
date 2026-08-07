export interface SpeechPlaybackHooks {
  onItemStart: (texto: string, index: number) => void;
  onItemEnd: (texto: string, index: number) => void;
  isCancelled: () => boolean;
}

export const SPEECH_INITIAL_DELAY_MS = 500;
/**
 * Tempo com o sintetizador COMPROVADAMENTE parado (`speaking === false`) a partir do qual
 * concluímos que não haverá voz. Não é um prazo para liberar o visual: é o ponto em que a ausência
 * de áudio deixa de ser espera e passa a ser falha. Enquanto a fala puder começar, nada é liberado.
 */
export const SPEECH_SILENCE_TIMEOUT_MS = 2500;

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
 *
 * O resgate para navegadores que não entregam `onstart` observa `speechSynthesis.speaking`, ou
 * seja, o estado real da fala — nunca o tempo decorrido. Falha comprovada de voz ainda preserva o
 * estímulo visual, mas só depois de o silêncio deixar de ser espera.
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
      if (onstartGuard !== undefined) window.clearInterval(onstartGuard);
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
        /*
         * REGRA GLOBAL 3 — o visual NUNCA antecipa o áudio.
         *
         * A versão anterior liberava o estímulo por TEMPO DECORRIDO: se `onstart` não viesse em
         * 1200 ms, o visual aparecia. Isso trocava "a voz começou" por "já esperei bastante" — e
         * numa síntese lenta o visual apareceria ANTES da fala, exatamente o que a regra proíbe.
         *
         * O critério correto é o estado real do sintetizador. `speechSynthesis.speaking` fica
         * verdadeiro assim que a fala é audível, mesmo nos navegadores que omitem `onstart`:
         *
         *   - `speaking === true`  → a voz JÁ saiu. Anunciar é seguro (e é o caminho de resgate).
         *   - `speaking === false` → a fala ainda pode começar. NÃO anunciar, por mais que demore.
         *
         * Só depois de `SPEECH_SILENCE_TIMEOUT_MS` com o sintetizador comprovadamente parado
         * concluímos que não haverá áudio, e aí o visual sai como degradação — nunca antes.
         */
        const inicio = performance.now();
        onstartGuard = window.setInterval(() => {
          if (announced || settled) {
            window.clearInterval(onstartGuard);
            return;
          }
          if (window.speechSynthesis.speaking) {
            announce(); // a voz está audível agora — não estamos antecipando nada
            window.clearInterval(onstartGuard);
            return;
          }
          if (performance.now() - inicio >= SPEECH_SILENCE_TIMEOUT_MS) {
            // Silêncio prolongado com o sintetizador parado: não haverá voz. Degrada para visual.
            announce();
            window.clearInterval(onstartGuard);
          }
        }, 40);
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
