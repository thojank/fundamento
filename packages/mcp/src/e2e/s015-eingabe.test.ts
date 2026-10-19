// Spec 015 ② (Gvidanto, Abnahme): the dialogs of the file input against the real MCP server
// (in-memory transport, every answer validated against the tool's output schema), over the served
// Modelo `core + aspekto-ekzemplo`. Every expected text is read from the data.

import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import type { UzoFile } from "@fundamento/modelo";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import {
  type Connected,
  closeClients,
  connect,
  EKZEMPLO_CONFIG,
  output,
  preload,
} from "../test-doubles/client.js";

afterAll(closeClients);
preload({ config: EKZEMPLO_CONFIG });

const DATA = new URL("../../../modelo/data/", import.meta.url);
const read = <T>(path: string): T =>
  JSON.parse(readFileSync(fileURLToPath(new URL(path, DATA)), "utf8")) as T;
const kampo = read<UzoFile>("eroj/kampo/uzo.json").uzo;
const alsxutilo = read<UzoFile>("eroj/alsxutilo/uzo.json").uzo;
const file = kampo.boundary.find((entry) => entry.case === "file");
const camera = alsxutilo.boundary.find((entry) => entry.case === "camera-capture");
if (file === undefined || camera === undefined) throw new Error("cross-links missing");
const reguloj = read<{ reguloj: { name: string; kialo: string }[] }>("reguloj.json").reguloj;
const kialoOf = (name: string) => reguloj.find((regulo) => regulo.name === name)?.kialo ?? "?";

type Suggested = {
  suggestion: { ero: string; props: Record<string, string> } | null;
  boundary?: { ero: string; case: string; action: string; kialo: string };
  action?: string;
  kialo?: string;
};
type Judged = {
  valid: boolean;
  violations: { issue: { rule: string; severity: string; regulo?: { kialo: string } } }[];
};
type Brief = {
  ero: string;
  axes: { name: string; values: string[] }[];
  required: { props: string[]; slots: string[] };
};
type Listed = { eroj: { name: string }[] };

let client: Connected["client"];

beforeAll(async () => {
  ({ client } = await connect({ config: EKZEMPLO_CONFIG }));
});

describe("the input dialogs of the spec (Spec 015 ②)", () => {
  it("'Feld für den Lebenslauf als PDF' → the alsxutilo, citing file-constraints-stated", async () => {
    const answer = await output<Suggested>(client, "suggest_ero", {
      goal: "Feld für den Lebenslauf als PDF",
    });
    expect(answer.suggestion).toEqual({ ero: "alsxutilo", props: {} });
    expect(answer.kialo).toBe(kialoOf("file-constraints-stated"));
  });

  it("with accept, the help 'PDF, höchstens 5 MB' passes; without a help the Slot-Constraint fails; one word fails file-constraints-stated", async () => {
    const instance = (texts: Record<string, string>) => ({
      ero: "alsxutilo",
      props: { accept: ".pdf", "max-size": 5000000 },
      label: "Lebenslauf",
      texts,
      lingvo: "de",
    });
    const clean = await output<Judged>(client, "check_usage", {
      instances: [instance({ help: "PDF, höchstens 5 MB" })],
    });
    expect(clean.valid).toBe(true);
    const missing = await output<Judged>(client, "check_usage", { instances: [instance({})] });
    expect(missing.valid).toBe(false);
    expect(missing.violations.map((violation) => violation.issue.rule)).toEqual([
      "ero-prop-constraint",
    ]);
    const short = await output<Judged>(client, "check_usage", {
      instances: [instance({ help: "Dokument" })],
    });
    expect(short.violations.map((violation) => violation.issue.rule)).toEqual([
      "file-constraints-stated",
    ]);
    expect(short.violations[0]?.issue.regulo?.kialo).toBe(kialoOf("file-constraints-stated"));
  });

  it("'Datei hochladen' → the alsxutilo with the kampo's reason; 'Foto mit der Kamera' stops", async () => {
    const answer = await output<Suggested>(client, "suggest_ero", { goal: "Datei hochladen" });
    expect(answer.suggestion).toEqual({ ero: "alsxutilo", props: {} });
    expect(answer.boundary).toEqual({
      ero: "kampo",
      case: "file",
      action: "use-instead",
      kialo: file.kialo,
    });
    const photo = await output<Suggested>(client, "suggest_ero", {
      goal: "Foto mit der Kamera aufnehmen",
    });
    expect(photo.suggestion).toBeNull();
    expect(photo.boundary).toEqual({
      ero: "alsxutilo",
      case: "camera-capture",
      action: "not-supported",
      kialo: camera.kialo,
    });
  });

  it("lists thirty-two Eroj; the brief of the alsxutilo names its axis and duty", async () => {
    const listed = await output<Listed>(client, "list_eroj", {});
    expect(listed.eroj).toHaveLength(32);
    expect(listed.eroj[0]?.name).toBe("alsxutilo");
    const brief = await output<Brief>(client, "get_ero", { name: "alsxutilo", brief: true });
    expect(brief.axes.map((axis) => axis.name)).toEqual(["dropzone"]);
    expect(brief.required).toEqual({ props: [], slots: ["label"] });
  });
});
