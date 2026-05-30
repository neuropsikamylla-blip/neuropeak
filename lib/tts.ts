"use client";

import { TTS_MANIFEST } from "@/data/tts-manifest";

let currentAudio: HTMLAudioElement | null = null;

export function playTTS(text: string): void {
  if (typeof window === "undefined") return;

  // Cancela qualquer áudio em andamento
  if (currentAudio) {
    currentAudio.pause();
    currentAudio.currentTime = 0;
    currentAudio = null;
  }

  const filename = TTS_MANIFEST[text];
  if (filename) {
    const audio = new Audio(`/exercises/audio/tts/${filename}`);
    currentAudio = audio;
    audio.play().catch(() => fallbackSpeak(text));
    return;
  }

  // Fallback para Web Speech API se o comando não estiver no manifesto
  fallbackSpeak(text);
}

export function cancelTTS(): void {
  if (currentAudio) {
    currentAudio.pause();
    currentAudio.currentTime = 0;
    currentAudio = null;
  }
  if (typeof window !== "undefined") {
    window.speechSynthesis?.cancel();
  }
}

function fallbackSpeak(text: string): void {
  if (typeof window === "undefined" || !window.speechSynthesis) return;
  window.speechSynthesis.cancel();

  const doSpeak = () => {
    const voices = window.speechSynthesis.getVoices();
    const ptVoices = voices.filter(v =>
      v.lang === "pt-BR" || v.lang === "pt_BR" || v.lang.startsWith("pt")
    );
    const voice =
      ptVoices.find(v => /francisca/i.test(v.name) && !v.localService) ||
      ptVoices.find(v => /francisca/i.test(v.name)) ||
      ptVoices.find(v => /vitória/i.test(v.name) && !v.localService) ||
      ptVoices.find(v => /luciana/i.test(v.name)) ||
      ptVoices.find(v => !v.localService) ||
      ptVoices[0];

    const u    = new SpeechSynthesisUtterance(text);
    u.lang     = "pt-BR";
    u.rate     = 0.80;
    u.pitch    = 1.05;
    u.volume   = 1;
    if (voice) u.voice = voice;
    window.speechSynthesis.speak(u);
  };

  if (window.speechSynthesis.getVoices().length === 0) {
    window.speechSynthesis.addEventListener("voiceschanged", doSpeak, { once: true });
  } else {
    doSpeak();
  }
}
