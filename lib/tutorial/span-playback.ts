export const SPAN_AUDIO_SRC = (digit: number) =>
  `/exercises/audio/numeros/${digit}.m4a`;

export const SPAN_INITIAL_DELAY_MS = 500;

export function spanGapMs(sequenceLength: number): number {
  return sequenceLength >= 6 ? 1000 : 850;
}

export interface PlaybackHooks {
  onDigitStart: (digit: number, index: number) => void;
  onDigitEnd: (digit: number, index: number) => void;
  isCancelled: () => boolean;
}

function wait(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Prepara o áudio de cada posição da sequência ANTES de a apresentação começar.
 *
 * Sem isto, o primeiro dígito sai atrasado: construir o elemento, buscar o arquivo pela rede e
 * encher o buffer leva tempo, e esse tempo aparecia como a tecla acesa em silêncio. Um elemento
 * por POSIÇÃO (não por dígito) porque a mesma sequência pode repetir um número, e reusar o mesmo
 * elemento exigiria rebobinar no meio da fala.
 */
async function prepareSequenceAudio(seq: number[]): Promise<HTMLAudioElement[]> {
  const elements = seq.map((digit) => {
    const audio = new Audio(SPAN_AUDIO_SRC(digit));
    audio.preload = "auto";
    return audio;
  });

  await Promise.all(
    elements.map(
      (audio) =>
        new Promise<void>((resolve) => {
          if (audio.readyState >= 3 /* HAVE_FUTURE_DATA */) {
            resolve();
            return;
          }
          let settled = false;
          const done = () => {
            if (settled) return;
            settled = true;
            window.clearTimeout(guard);
            audio.oncanplaythrough = null;
            audio.onerror = null;
            resolve();
          };
          // Rede lenta ou arquivo ausente não pode travar a apresentação: seguimos assim mesmo,
          // e o dígito cai no caminho degradado (feedback visual sem voz).
          const guard = window.setTimeout(done, 2500);
          audio.oncanplaythrough = done;
          audio.onerror = done;
          audio.load();
        }),
    ),
  );

  return elements;
}

/**
 * Toca um dígito e avisa no instante em que a VOZ realmente começa — não quando pedimos que
 * começasse. É essa distinção que sincroniza a tecla acesa com a fala.
 */
function playDigitAudio(
  audio: HTMLAudioElement,
  isCancelled: () => boolean,
  onAudibleStart: () => void,
): Promise<void> {
  return new Promise((resolve) => {
    let settled = false;
    let announced = false;

    /** Idempotente: `playing` pode disparar mais de uma vez (ex.: retomada após stall). */
    const announce = () => {
      if (announced) return;
      announced = true;
      onAudibleStart();
    };

    const finish = () => {
      if (settled) return;
      settled = true;
      window.clearInterval(cancelCheck);
      audio.onplaying = null;
      audio.onended = null;
      audio.onerror = null;
      resolve();
    };

    const cancelCheck = window.setInterval(() => {
      if (!isCancelled()) return;
      audio.pause();
      finish();
    }, 50);

    // O sinal certo é `playing` (a reprodução saiu de fato), não `play` (só pedimos que saísse).
    audio.onplaying = announce;
    audio.onended = finish;
    // Sem áudio, o estímulo visual ainda precisa acontecer — melhor degradado que ausente.
    audio.onerror = () => { announce(); finish(); };
    audio.play().catch(() => { announce(); finish(); });
  });
}

/**
 * Apresenta a sequência com áudio e feedback visual como UM ÚNICO evento sincronizado.
 *
 * ATENÇÃO: a ordem aqui é o ponto sensível, e já foi um defeito real: `onDigitStart` era chamado antes
 * de o áudio começar, então a tecla acendia e a voz vinha depois — o paciente via o estímulo antes
 * de ouvi-lo. Agora o áudio é preparado de antemão e o aviso visual sai no evento `playing`, ou
 * seja, no instante em que a fala é audível. NUNCA reintroduza um `onDigitStart` antes do
 * `play()`.
 */
export async function playDigitSequence(
  seq: number[],
  hooks: PlaybackHooks,
): Promise<void> {
  // Preparado ANTES da pausa inicial, para que a espera sirva também de carregamento.
  const audioElements = await prepareSequenceAudio(seq);
  if (hooks.isCancelled()) return;

  await wait(SPAN_INITIAL_DELAY_MS);
  if (hooks.isCancelled()) return;

  const gap = spanGapMs(seq.length);
  for (let index = 0; index < seq.length; index++) {
    if (hooks.isCancelled()) return;

    const digit = seq[index];
    // O visual acende DENTRO desta chamada, quando a voz começa — nunca antes dela.
    await playDigitAudio(audioElements[index], hooks.isCancelled, () => {
      hooks.onDigitStart(digit, index);
    });
    if (hooks.isCancelled()) return;

    hooks.onDigitEnd(digit, index);
    await wait(gap);
  }
}
