// Spec 033 S5: speech in over Voxtral (Mistral, voxtral-mini-transcribe-3-0, the exact name from the
// account), the Web Speech API of the browser as the fallback. The audio goes from the browser to
// the local server, from there with the key to the provider; the key never reaches the browser.

import { describe, expect, it } from "vitest";
import { Provider } from "../asistanto/ki.js";
import { PAROLO_MODELO, transkribi } from "./parolo.js";

const KEY = "sk-voxtral-test";

describe("transcription over Voxtral (Spec 033 S5)", () => {
  it("the model is the exact name from the account", () => {
    expect(PAROLO_MODELO).toBe("voxtral-mini-transcribe-3-0");
  });

  it("sends the audio as multipart with the model to /audio/transcriptions and returns the text", async () => {
    const seen: { url: string; authorization: string; form: FormData }[] = [];
    const fetch = async (url: string, init: RequestInit) => {
      seen.push({
        url,
        authorization: (init.headers as Record<string, string>).authorization ?? "",
        form: init.body as FormData,
      });
      return new Response(
        JSON.stringify({ text: " runder bitte ", usage: { prompt_audio_seconds: 2 } }),
        { status: 200 },
      );
    };
    const result = await transkribi(
      new Provider("mistral", PAROLO_MODELO, KEY),
      Buffer.from("RIFFfake"),
      "audio/wav",
      { fetch },
    );
    expect(result.teksto).toBe("runder bitte");
    expect(result.sekundoj).toBe(2);
    expect(seen[0]?.url).toBe("https://api.mistral.ai/v1/audio/transcriptions");
    expect(seen[0]?.authorization).toBe(`Bearer ${KEY}`);
    expect(seen[0]?.form.get("model")).toBe("voxtral-mini-transcribe-3-0");
    expect(seen[0]?.form.get("file")).toBeInstanceOf(Blob);
  });

  it("an error of the provider never carries the key", async () => {
    const fetch = async () => new Response(`bad key ${KEY}`, { status: 401 });
    const error = await transkribi(
      new Provider("mistral", PAROLO_MODELO, KEY),
      Buffer.from("x"),
      "audio/wav",
      { fetch },
    ).catch((caught: unknown) => caught);
    expect(String(error)).toContain("401");
    expect(String(error)).not.toContain(KEY);
  });
});
