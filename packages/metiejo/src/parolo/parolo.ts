// Speech in for the Asistanto (Spec 033 S5): the recording of the browser goes to the local server,
// from there with the key to Voxtral (Mistral, the transcription model by its exact name from the
// account); the text becomes the same chat turn as a written one, with speech as its source. The key
// stays in the Provider; an error never carries it. The Web Speech API of the browser is the
// fallback when no Mistral key is set: the browser sends its own transcript to the chat.

import type { Fetch, Provider } from "../asistanto/ki.js";

/** The transcription model, pinned by its exact name (list of models of the maintainer's account, 2026-10-29). */
export const PAROLO_MODELO = "voxtral-mini-transcribe-3-0";

const EXTENSIONS: Readonly<Record<string, string>> = {
  "audio/wav": "wav",
  "audio/x-wav": "wav",
  "audio/webm": "webm",
  "audio/ogg": "ogg",
  "audio/mpeg": "mp3",
  "audio/mp4": "m4a",
  "audio/aiff": "aiff",
};

export interface Transkribo {
  teksto: string;
  /** Seconds of audio the provider counted, where it says. */
  sekundoj?: number;
  ms: number;
}

/** Transcribes one recording; German is the language of the Metiejo. */
export async function transkribi(
  provider: Provider,
  audio: Buffer,
  mime: string,
  options: { fetch?: Fetch; timeout?: number } = {},
): Promise<Transkribo> {
  const started = Date.now();
  const type = mime.split(";")[0]?.trim() || "audio/webm";
  const form = new FormData();
  form.set("model", provider.model);
  form.set("language", "de");
  form.set(
    "file",
    new Blob([new Uint8Array(audio)], { type }),
    `aufnahme.${EXTENSIONS[type] ?? "webm"}`,
  );
  const request = options.fetch ?? (globalThis.fetch as Fetch);
  let response: Response;
  let text: string;
  try {
    response = await request(`${provider.baseUrl}/audio/transcriptions`, {
      method: "POST",
      headers: { authorization: provider.authorization() },
      body: form,
      signal: AbortSignal.timeout(options.timeout ?? 120_000),
    });
    text = await response.text();
  } catch (error) {
    throw new Error(provider.redact(String(error)));
  }
  if (!response.ok) {
    throw new Error(`Voxtral antwortet ${response.status}: ${provider.redact(text).slice(0, 300)}`);
  }
  const body = JSON.parse(text) as { text?: string; usage?: { prompt_audio_seconds?: number } };
  const seconds = body.usage?.prompt_audio_seconds;
  return {
    teksto: (body.text ?? "").trim(),
    ...(typeof seconds === "number" ? { sekundoj: seconds } : {}),
    ms: Date.now() - started,
  };
}
