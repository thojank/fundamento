// Spec 019 ③ (G6, Abnahme 2 and 3): the prompt as a control. Two tools, both without a language
// model: propose_agordo (read-only) turns a wish into movements of the sliders from the wish
// vocabulary and answers with the diff, the report in short and a link into the Werkstatt;
// save_agordo writes an Agordo only with confirm, only inside the server's working directory, only
// *.json, never over a file that is no Agordo, and appends a historio entry. The four example
// dialogs of the spec, as an agent would run them.

import { existsSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { inflateRawSync } from "node:zlib";
import { readWuensche } from "@fundamento/agordilo";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { type Connected, closeClients, connect, output, preload } from "../test-doubles/client.js";

const workdir = mkdtempSync(join(tmpdir(), "fm-arbeit-"));
afterAll(async () => {
  await closeClients();
  rmSync(workdir, { recursive: true, force: true });
});
preload({ workdir });

const PROVO = JSON.parse(
  readFileSync(
    new URL("../../../modelo/test/fixtures/valid/aspekto-provo/agordo.json", import.meta.url),
    "utf8",
  ),
) as Record<string, unknown> & { regler: Record<string, number>; form?: Record<string, number> };

type Diff = { path: string; label: string; vorher: number | string; nachher: number | string };
type Proposal = {
  writes: false;
  agordo: Record<string, unknown> & {
    regler?: Record<string, number>;
    form?: Record<string, number>;
    raum?: Record<string, number>;
  };
  diff: Diff[];
  sentence: string;
  kialoj: string[];
  wish?: { text: string; matched: { word: string; kialo: string }[]; unknown: string[] };
  action?: "ask-human";
  known?: string[];
  exportable: boolean;
  summary: { violations: { fixed: number; adjustable: number } };
  link: { fragment: string; file: string };
};
type Saved = {
  writes: boolean;
  path: string;
  exists: boolean;
  agordo: Record<string, unknown> & {
    historio?: { datum: string; wunsch: string; diff: unknown[] }[];
  };
  entry: {
    datum: string;
    wunsch: string;
    diff: { regler: string; vorher: unknown; nachher: unknown }[];
  };
  text: string;
  exportable: boolean;
};
type Envelope = { issues: { rule: string; path: string; message: string; suggestion: string }[] };

/** The JSON of a fragment part as the Werkstatt reads it (deflate-raw, base64url). */
const part = (fragment: string, name: string): unknown => {
  const value = new URLSearchParams(fragment.replace(/^#/, "")).get(name) ?? "";
  return JSON.parse(inflateRawSync(Buffer.from(value, "base64url")).toString("utf8"));
};

let client: Connected["client"];
let calmer: Proposal;
beforeAll(async () => {
  ({ client } = await connect({ workdir }));
  calmer = await output<Proposal>(client, "propose_agordo", { agordo: PROVO, wunsch: "ruhiger" });
}, 120_000);

describe("the tools (G6)", () => {
  it("propose_agordo is read-only; save_agordo writes and says so", async () => {
    const { tools } = await client.listTools();
    const propose = tools.find((tool) => tool.name === "propose_agordo");
    const save = tools.find((tool) => tool.name === "save_agordo");
    expect(propose?.annotations?.readOnlyHint).toBe(true);
    expect(save?.annotations?.readOnlyHint).toBe(false);
    expect(JSON.stringify(save?.inputSchema)).toContain("confirm");
  });
});

describe("„Mach provo ruhiger.“", () => {
  it("lowers saturation and contrast spread and softens the shadows; the diff, the report, the link", () => {
    expect(calmer.writes).toBe(false);
    const moved = Object.fromEntries(calmer.diff.map((entry) => [entry.path, entry]));
    expect(Number(moved["regler.saettigung"]?.nachher)).toBeLessThan(PROVO.regler.saettigung);
    expect(Number(moved["regler.kontrast"]?.nachher)).toBeLessThan(PROVO.regler.kontrast);
    expect(Number(moved["form.schatten"]?.nachher)).toBeLessThan(1);
    expect(calmer.summary.violations.fixed).toBe(0);
    expect(calmer.wish?.matched.map((entry) => entry.word)).toEqual(["ruhiger"]);
    const ruhiger = readWuensche().wuensche.find((entry) => entry.wort === "ruhiger");
    expect(calmer.kialoj).toEqual([ruhiger?.kialo]);
    expect(calmer.sentence).toMatch(/^Vorgeschlagen: ruhiger \(/);
    // The link opens the Werkstatt with the brand as it is and the proposal on top.
    expect(calmer.link.fragment).toMatch(
      /^#aspekto=komuna&modus=werkstatt&agordo=[A-Za-z0-9_-]+&vorschlag=[A-Za-z0-9_-]+$/,
    );
    expect(calmer.link.file).toMatch(/^file:\/\/\/.+\/vitrino\/index\.html#aspekto=komuna/);
    expect(part(calmer.link.fragment, "agordo")).toEqual(PROVO);
    expect(part(calmer.link.fragment, "vorschlag")).toEqual({
      wunsch: "ruhiger",
      agordo: calmer.agordo,
    });
  });
});

describe("„Mach die Marke runder und luftiger.“", () => {
  it("two words, two movements (form.radius ↑, raum.abstand ↑), one diff", async () => {
    const answer = await output<Proposal>(client, "propose_agordo", {
      agordo: { name: "marke", leitfarbe: "#375479" },
      wunsch: "Mach die Marke runder und luftiger.",
    });
    expect(answer.wish?.matched.map((entry) => entry.word)).toEqual(["runder", "luftiger"]);
    expect(answer.diff.map((entry) => entry.path)).toEqual(["form.radius", "raum.abstand"]);
    for (const entry of answer.diff)
      expect(Number(entry.nachher)).toBeGreaterThan(Number(entry.vorher));
    expect(answer.agordo.form?.radius).toBeGreaterThan(1);
    expect(answer.agordo.raum?.abstand).toBeGreaterThan(1);
  }, 120_000);
});

describe("„Mach die Marke moderner.“", () => {
  it("asks back: an unknown wish moves nothing; the answer names the known words", async () => {
    const agordo = { name: "marke", leitfarbe: "#375479" };
    const answer = await output<Proposal>(client, "propose_agordo", {
      agordo,
      wunsch: "Mach die Marke moderner.",
    });
    expect(answer.action).toBe("ask-human");
    expect(answer.diff).toEqual([]);
    expect(answer.agordo).toEqual(agordo);
    expect(answer.wish?.unknown).toEqual(["moderner"]);
    expect(answer.known).toEqual(readWuensche().wuensche.map((entry) => entry.wort));
  }, 120_000);
});

describe("„Speichere das als marken/provo-ruhig.json.“", () => {
  it("without confirm shows what it would write and writes nothing", async () => {
    const answer = await output<Saved>(client, "save_agordo", {
      agordo: calmer.agordo,
      pfad: "marken/provo-ruhig.json",
      wunsch: "ruhiger",
      datum: "2026-10-20",
    });
    expect(answer.writes).toBe(false);
    expect(answer.path).toBe("marken/provo-ruhig.json");
    expect(answer.exists).toBe(false);
    expect(answer.entry).toMatchObject({ datum: "2026-10-20", wunsch: "ruhiger" });
    expect(JSON.parse(answer.text)).toEqual(answer.agordo);
    expect(existsSync(join(workdir, "marken/provo-ruhig.json"))).toBe(false);
  }, 120_000);

  it("with confirm: true writes it and appends a historio entry; a second save appends another", async () => {
    const first = await output<Saved>(client, "save_agordo", {
      agordo: calmer.agordo,
      pfad: "marken/provo-ruhig.json",
      wunsch: "ruhiger",
      datum: "2026-10-20",
      confirm: true,
    });
    expect(first.writes).toBe(true);
    const file = join(workdir, "marken/provo-ruhig.json");
    const written = JSON.parse(readFileSync(file, "utf8"));
    expect(written).toEqual(first.agordo);
    expect(written.historio).toHaveLength(1);
    expect(written.historio[0]).toMatchObject({ datum: "2026-10-20", wunsch: "ruhiger" });
    const second = await output<Saved>(client, "save_agordo", {
      agordo: { ...calmer.agordo, form: { ...calmer.agordo.form, radius: 1.8 } },
      pfad: "marken/provo-ruhig.json",
      datum: "2026-10-21",
      confirm: true,
    });
    expect(second.exists).toBe(true);
    expect(second.entry).toEqual({
      datum: "2026-10-21",
      wunsch: "Hand",
      diff: [{ regler: "form.radius", vorher: calmer.agordo.form?.radius, nachher: 1.8 }],
    });
    expect(JSON.parse(readFileSync(file, "utf8")).historio).toHaveLength(2);
  }, 120_000);

  it.each([
    ["a path outside the working directory", "../provo-ruhig.json"],
    ["an absolute path outside it", join(tmpdir(), "fm-anderswo", "provo.json")],
    ["a file that is no JSON", "marken/provo-ruhig.txt"],
  ])("refuses %s, even with confirm, and writes nothing", async (_label, pfad) => {
    const answer = await output<Envelope>(client, "save_agordo", {
      agordo: calmer.agordo,
      pfad,
      confirm: true,
    });
    expect(answer.issues?.[0]?.rule).toBe("agordo-save-refused");
    expect(existsSync(join(workdir, "..", "provo-ruhig.json"))).toBe(false);
  });

  it("never writes over a file that is no Agordo", async () => {
    writeFileSync(join(workdir, "paket.json"), '{ "name": "@kein/agordo" }\n');
    const answer = await output<Envelope>(client, "save_agordo", {
      agordo: calmer.agordo,
      pfad: "paket.json",
      confirm: true,
    });
    expect(answer.issues?.[0]?.rule).toBe("agordo-save-refused");
    expect(readFileSync(join(workdir, "paket.json"), "utf8")).toBe('{ "name": "@kein/agordo" }\n');
  });

  it("a fixed rule locks the save like the Werkstatt's export", async () => {
    const answer = await output<Envelope>(client, "save_agordo", {
      agordo: { name: "dunkel", leitfarbe: "#375479", regler: { kontrast: -1 } },
      pfad: "marken/dunkel.json",
      confirm: true,
    });
    expect(answer.issues.length).toBeGreaterThan(0);
    expect(existsSync(join(workdir, "marken/dunkel.json"))).toBe(false);
  }, 120_000);
});
