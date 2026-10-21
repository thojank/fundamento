// The brand on disk (Spec 023, §3 step 1 and 7, §4.6): one folder per brand in the working
// directory, the Agordo created at the start, the draft between the steps, the save with historio
// (the rules of save_agordo), the uploads in <brand>/fontoj/ and never in the repo.

import { existsSync, mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { readAgordo } from "@fundamento/agordilo";
import { afterAll, describe, expect, it } from "vitest";
import {
  createMarko,
  listMarkoj,
  MARKEN_DIR,
  markoDir,
  readMarko,
  saveMarko,
  storeUpload,
  writeDraft,
} from "./marko.js";
import { CHECKOUT_ROOT } from "./root.js";

const scratch = mkdtempSync(join(tmpdir(), "fm-metiejo-marko-"));
const workdir = join(scratch, MARKEN_DIR);
afterAll(() => rmSync(scratch, { recursive: true, force: true }));

describe("createMarko (step 1)", () => {
  it("writes marken/<name>/agordo.json for an empty start: the name and a lead colour of the structure", () => {
    const result = createMarko(workdir, { name: "leera", basis: "leer" });
    expect(result.issues).toEqual([]);
    const file = join(markoDir(workdir, "leera"), "agordo.json");
    expect(existsSync(file)).toBe(true);
    const { agordo, issues } = readAgordo(JSON.parse(readFileSync(file, "utf8")));
    expect(issues).toEqual([]);
    expect(agordo?.name).toBe("leera");
    expect(agordo?.schriften).toBeUndefined();
  });

  it("copies komuna for the example start: its lead colour and its fonts as the Agordo's", () => {
    const result = createMarko(workdir, { name: "ekzempla", basis: "komuna" });
    expect(result.issues).toEqual([]);
    const marko = readMarko(workdir, "ekzempla");
    expect(marko?.agordo.schriften?.body?.family).toBeDefined();
    expect(marko?.agordo.schriften?.display?.license).toBeDefined();
    expect(marko?.agordo.leitfarbe).toMatch(/^(#|oklch\()/);
  });

  it("refuses a name that is no Name of the Modelo, and writes nothing", () => {
    for (const name of ["Provo Neu", "../x", "", "a/b", "ÄÖ"]) {
      const result = createMarko(workdir, { name, basis: "leer" });
      expect(
        result.issues.map((issue) => issue.rule),
        name,
      ).toEqual(["name-invalid"]);
      expect(result.issues[0]?.suggestion).toBeTruthy();
    }
    expect(existsSync(join(workdir, "Provo Neu"))).toBe(false);
    expect(existsSync(join(scratch, "x"))).toBe(false);
  });

  it("refuses a brand that exists already (open it instead)", () => {
    const result = createMarko(workdir, { name: "leera", basis: "leer" });
    expect(result.issues.map((issue) => issue.rule)).toEqual(["marko-exists"]);
  });
});

describe("the draft and the save (step 7, W-25, W-26)", () => {
  it("keeps the draft in entwurf.json and reads it back as the current state", () => {
    const marko = readMarko(workdir, "leera");
    if (marko === undefined) throw new Error("leera must exist");
    const draft = { ...marko.agordo, regler: { kontrast: 0.2 } };
    writeDraft(workdir, "leera", draft);
    const again = readMarko(workdir, "leera");
    expect(again?.draft.regler?.kontrast).toBe(0.2);
    expect(again?.agordo.regler).toBeUndefined();
    expect(again?.saved).toBe(false);
  });

  it("saves with a historio entry of the movement, and appends nothing when nothing moved", () => {
    const marko = readMarko(workdir, "leera");
    if (marko === undefined) throw new Error("leera must exist");
    const first = saveMarko(workdir, "leera", marko.draft, "2026-10-21");
    expect(first.changed).toBe(true);
    const saved = readMarko(workdir, "leera");
    expect(saved?.agordo.historio).toHaveLength(1);
    expect(saved?.agordo.historio?.[0]).toMatchObject({
      datum: "2026-10-21",
      wunsch: "Hand",
      diff: [{ regler: "regler.kontrast", vorher: 0, nachher: 0.2 }],
    });
    expect(saved?.saved).toBe(true);
    const second = saveMarko(workdir, "leera", marko.draft, "2026-10-22");
    expect(second.changed).toBe(false);
    expect(readMarko(workdir, "leera")?.agordo.historio).toHaveLength(1);
  });

  it("writes only inside the working directory and only an Agordo", () => {
    expect(() =>
      saveMarko(workdir, "../leera", { name: "x", leitfarbe: "#336699" }, "2026-10-21"),
    ).toThrow(/name/i);
    expect(existsSync(join(scratch, "leera"))).toBe(false);
  });

  it("lists the brands of the working directory, sorted", () => {
    expect(listMarkoj(workdir)).toEqual(["ekzempla", "leera"]);
    expect(listMarkoj(join(scratch, "nenie"))).toEqual([]);
  });
});

describe("never inside the checkout (O-3)", () => {
  it("refuses a working directory inside the repository, so no brand, draft, save or export lands in the checkout", () => {
    const inside = join(CHECKOUT_ROOT, "marken");
    expect(() => markoDir(inside, "provo")).toThrow(/checkout/i);
    expect(() => createMarko(inside, { name: "provo", basis: "leer" })).toThrow(/checkout/i);
    expect(() =>
      saveMarko(inside, "provo", { name: "provo", leitfarbe: "#336699" }, "2026-10-22"),
    ).toThrow(/checkout/i);
    expect(existsSync(inside)).toBe(false);
    expect(existsSync(join(CHECKOUT_ROOT, "marken", "provo"))).toBe(false);
  });
});

describe("storeUpload (§4.6)", () => {
  it("puts an uploaded font into <brand>/fontoj/ with a .gitignore, so nothing of it enters the repo", () => {
    const stored = storeUpload(workdir, "leera", {
      filename: "Marke Sans.woff2",
      bytes: Buffer.from("not a font, a test"),
    });
    expect(stored.path).toBe(join(markoDir(workdir, "leera"), "fontoj", "Marke-Sans.woff2"));
    expect(readFileSync(stored.path, "utf8")).toBe("not a font, a test");
    expect(readFileSync(join(markoDir(workdir, "leera"), "fontoj", ".gitignore"), "utf8")).toBe(
      "*\n",
    );
  });

  it("takes only font files", () => {
    expect(() =>
      storeUpload(workdir, "leera", { filename: "evil.sh", bytes: Buffer.from("x") }),
    ).toThrow(/woff2|ttf|otf/);
  });
});
