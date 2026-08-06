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

function playDigitAudio(digit: number, isCancelled: () => boolean): Promise<void> {
  return new Promise((resolve) => {
    const audio = new Audio(SPAN_AUDIO_SRC(digit));
    let settled = false;

    const finish = () => {
      if (settled) return;
      settled = true;
      window.clearInterval(cancelCheck);
      audio.onended = null;
      audio.onerror = null;
      resolve();
    };

    const cancelCheck = window.setInterval(() => {
      if (!isCancelled()) return;
      audio.pause();
      finish();
    }, 50);

    audio.onended = finish;
    audio.onerror = finish;
    audio.play().catch(finish);
  });
}

export async function playDigitSequence(
  seq: number[],
  hooks: PlaybackHooks,
): Promise<void> {
  await wait(SPAN_INITIAL_DELAY_MS);
  if (hooks.isCancelled()) return;

  const gap = spanGapMs(seq.length);
  for (let index = 0; index < seq.length; index++) {
    if (hooks.isCancelled()) return;

    const digit = seq[index];
    hooks.onDigitStart(digit, index);
    await playDigitAudio(digit, hooks.isCancelled);
    if (hooks.isCancelled()) return;

    hooks.onDigitEnd(digit, index);
    await wait(gap);
  }
}
