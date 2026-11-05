// Spec 041 (AC-3, AC-5): the one-draft poll of the generated client script asks for the stato every
// 3000 ms (Spec 033 D-05). B-8 changed when it stops, never how often it asks.
import { describe, expect, it } from "vitest";
import { CLIENT_SCRIPT } from "./html.js";

describe("stato poll interval (Spec 041)", () => {
  it("there is one interval in the script, and it is the stato poll", () => {
    expect(CLIENT_SCRIPT.match(/setInterval\(/g)).toHaveLength(1);
  });

  it("the interval that fetches /stato runs every 3000 ms", () => {
    const poll = /setInterval\(async \(\) => \{([\s\S]*?)\n\s*\}, ([\d_]+)\);/.exec(CLIENT_SCRIPT);
    expect(poll?.[1]).toContain('fetch("/api/marko/" + marko + "/stato"');
    expect(poll?.[2]).toBe("3000");
  });
});
