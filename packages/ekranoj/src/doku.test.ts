// The documents of Spec 037 (S037-13): what AC-1, AC-15 and AC-16 ask of `specs/037-agenten-ekranoj/`
// that a test can check – the spec copied byte for byte, plan and tasks beside it, the sections the
// maintainer needs (decisions to confirm, Blockiert, Lückenliste) and the Bericht with both PR
// links, the merge position and the maintainer's steps in order. Whether the contents are right
// stays the maintainer's review (plan.md „Prüfung gegen die Abnahmekriterien“).

import { createHash } from "node:crypto";
import { existsSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const SPEC_DIR = fileURLToPath(new URL("../../../specs/037-agenten-ekranoj/", import.meta.url));
/** SHA-256 of the source spec (AC-1, implementation spec header). */
const SPEC_SHA256 = "0780c57eb387b9aa34d98ea31bab223fe92f8f3e52af0a3a19b3db877deaed89";

const plan = (): string => readFileSync(`${SPEC_DIR}plan.md`, "utf8");

/** The text of a `## ` section of plan.md (up to the next `## `), "" when it is missing. */
function sekcio(md: string, titolo: string): string {
  const komenco = md.indexOf(`\n## ${titolo}\n`);
  if (komenco === -1) return "";
  const resto = md.slice(komenco + 1);
  const fino = resto.indexOf("\n## ", 3);
  return fino === -1 ? resto : resto.slice(0, fino);
}

describe("the documents of Spec 037", () => {
  it("copies the spec byte for byte and keeps plan and tasks beside it (AC-1)", () => {
    const hash = createHash("sha256")
      .update(readFileSync(`${SPEC_DIR}spec.md`))
      .digest("hex");
    expect(hash).toBe(SPEC_SHA256);
    for (const dosiero of ["plan.md", "tasks.md"]) {
      expect(existsSync(`${SPEC_DIR}${dosiero}`), dosiero).toBe(true);
    }
  });

  it("holds the decisions to confirm, Blockiert and the Lückenliste in plan.md (AC-15)", () => {
    const md = plan();
    const entscheidungen = sekcio(md, "Entscheidungen, vom Maintainer zu bestätigen");
    const ids = [
      ...["V-1", "V-2", "V-3", "V-4"],
      ...Array.from({ length: 13 }, (_, i) => `D-${String(i + 1).padStart(2, "0")}`),
    ];
    expect(ids.filter((id) => !new RegExp(`\\b${id}\\b`).test(entscheidungen))).toEqual([]);
    expect(sekcio(md, "Blockiert")).not.toBe("");
    expect(sekcio(md, "Lückenliste")).toContain(
      "| # | Art | Lücke | Anzahl | Aufgaben | Beispielstelle | Vorschlag | Ziel |",
    );
  });

  it("ends with the Bericht: both PR links, the merge position with the conflict check, the maintainer's steps in order (AC-16)", () => {
    const md = plan();
    const bericht = sekcio(md, "Bericht");
    expect(md.trimEnd().endsWith(bericht.trimEnd())).toBe(true);
    for (const pr of [131, 132]) {
      expect(bericht).toContain(`https://github.com/thojank/fundamento/pull/${pr}`);
    }
    const konflikto = sekcio(md, "Konfliktprüfung und Merge-Position");
    expect(konflikto).toContain("### Merge-Position");
    expect(konflikto).toMatch(/Teil 5/);
    expect(konflikto).toMatch(/Teil 6/);
    const pasxoj = bericht.split("### Was der Maintainer tun soll, in Reihenfolge")[1] ?? "";
    const numeroj = [...pasxoj.matchAll(/^(\d+)\. /gm)].map((m) => Number(m[1]));
    expect(numeroj.length).toBeGreaterThan(3);
    expect(numeroj).toEqual(numeroj.map((_, i) => i + 1));
  });
});
