// Spec 043 / N-8 aus Spec 042: a preview frame whose navigation was cut short is sent again by the
// page's events, never by the clock. The behaviour is proved in the browsers
// (packages/eroj/test/buehne-navigation-042.spec.ts); this pins its shape in the client script.
import { describe, expect, it } from "vitest";
import { CLIENT_SCRIPT } from "./html.js";

const anfang = CLIENT_SCRIPT.indexOf("// Spec 043 / N-8 aus Spec 042");
const block = CLIENT_SCRIPT.slice(anfang, CLIENT_SCRIPT.indexOf("function refreshFrame()", anfang));

describe("preview frame sent again after a cut-short navigation (Spec 043)", () => {
  it("stands once in the client script, before refreshFrame()", () => {
    expect(anfang).toBeGreaterThan(-1);
    expect(CLIENT_SCRIPT.indexOf("// Spec 043 / N-8 aus Spec 042", anfang + 1)).toBe(-1);
    expect(block.length).toBeGreaterThan(0);
  });

  it("follows the frame's load and the page's load and pageshow, and starts no clock", () => {
    expect(block).toContain('element.addEventListener("load"');
    expect(block).toContain(
      'addEventListener("load", () => { for (const element of vorschauRahmen.keys())',
    );
    expect(block).toContain('addEventListener("pageshow"');
    expect(block).not.toMatch(/\bset[A-Z]\w*\(/);
    expect(block).not.toContain("requestAnimationFrame");
  });

  it("is the only way both frames are sent: refreshFrame() and refreshNachher()", () => {
    expect(CLIENT_SCRIPT.match(/\.src = /g)).toHaveLength(1);
    expect(block).toContain("element.src = stand.soll;");
    expect(CLIENT_SCRIPT).toContain("vorschauSenden(frame, url.toString());");
    expect(CLIENT_SCRIPT).toContain("vorschauSenden(nachher, url.toString());");
  });

  it("asks for each expected URL again at most once, and never for a loaded frame", () => {
    expect(block).toContain("if (!stand || stand.nochmal.has(stand.soll)) return;");
    expect(block).toContain(
      'if (doc && doc.URL === stand.soll && doc.readyState === "complete") return;',
    );
    expect(block).toContain("stand.nochmal.add(stand.soll);");
  });
});
