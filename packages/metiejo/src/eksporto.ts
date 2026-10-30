// The export of a brand (Spec 023, §3 step 7, M-3, M-4): the Aspekto package as `fm agordilo
// derive` writes it, and on top the projections a project needs — the CSS, the Figma plugin —
// built by `fm projekcioj build` over a fundamento.config.json that lists the package. Everything
// lands in <brand>/eksporto/. Before the result stands, the byte check runs over it: a byte of a
// licensed font removes the result (M-4). The same Agordo gives the same bytes (M-3).

import { existsSync, mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { basename, join, relative } from "node:path";
import { type Agordo, writePackage } from "@fundamento/agordilo";
import { projectModeloSource, type ValidationIssue } from "@fundamento/modelo";
import { buildProjekcioj } from "@fundamento/projekcioj";
import { type KnownFont, scanDirs } from "./kontrolo.js";
import { clearExport, type MetiejoIssue, markoDir } from "./marko.js";
import { readTiparoj } from "./tiparoj.js";
import { fetchFontFiles, fontFilesCss, type NpmDeps } from "./tiparoj-npm.js";
import { type Bases, checkDraft } from "./vorschau.js";

export type EksportoCelo = "aspekto" | "css" | "figma";

export const EKSPORTO_CELOJ: readonly EksportoCelo[] = ["aspekto", "css", "figma"];

export interface ExportOptions {
  celoj: readonly EksportoCelo[];
  /** The licensed fonts the byte check knows (the cache of the private repository, the uploads). */
  fonts: readonly KnownFont[];
  /** The state the Figma plugin names; fixed, so two exports give the same bytes. */
  build?: string;
  /** npm for the files of the webfonts (O-4); absent: the brand names them with licence only. */
  npm?: NpmDeps;
}

export interface ExportResult {
  ok: boolean;
  /** `<brand>/eksporto`. */
  dir: string;
  /** Every file written, relative to `dir`. */
  files: string[];
  issues: (ValidationIssue | MetiejoIssue)[];
  /** What was written, one sentence per Celo (German, for the screen). */
  sentences: string[];
  /**
   * Spec 033 S6 (O-10): milliseconds per part of an export that was written – the package with its
   * webfonts, the projections (CSS, Figma), the byte check.
   */
  partoj?: { paket: number; projekcioj: number; pruefung: number };
}

/**
 * The files of every webfont of the brand (O-4): from npm through the cache into
 * `<package>/tiparoj/<id>/` with LICENSE and herkunto.json, and `tiparoj.css` beside the package.
 * A font that cannot be read is a sentence, never a refusal: the brand names it with its licence.
 */
async function webfontFiles(
  dir: string,
  packageName: string,
  agordo: Agordo,
  npm: NpmDeps | undefined,
): Promise<string[]> {
  const sentences: string[] = [];
  const catalogue = readTiparoj();
  const seen = new Set<string>();
  const css: string[] = [];
  for (const font of [agordo.schriften?.display, agordo.schriften?.body, agordo.schriften?.code]) {
    if (font === undefined || !font.redistributable || seen.has(font.family)) continue;
    seen.add(font.family);
    const tiparo = catalogue.tiparoj.find((entry) => entry.family === font.family);
    if (tiparo === undefined) continue;
    if (npm === undefined) {
      sentences.push(
        `Die Webfont ${font.family} (${font.license}) ist mit Lizenz genannt, ohne Schriftdatei (kein npm-Zugang in diesem Lauf).`,
      );
      continue;
    }
    try {
      const files = await fetchFontFiles(tiparo.id, npm);
      const target = join(dir, packageName, "tiparoj", tiparo.id);
      mkdirSync(target, { recursive: true });
      for (const file of [...files.files, "herkunto.json"]) {
        writeFileSync(join(target, file), readFileSync(join(files.dir, file)));
      }
      css.push(fontFilesCss(font.family, files.files, `${packageName}/tiparoj/${tiparo.id}`));
      sentences.push(
        `Die Webfont ${font.family} liegt mit Lizenz (${files.license || font.license}) in eksporto/${packageName}/tiparoj/${tiparo.id} (npm @fontsource/${tiparo.id} ${files.version}${files.cached ? ", aus dem Zwischenspeicher" : ""}).`,
      );
    } catch (error) {
      sentences.push(
        `Die Schriftdatei von ${font.family} wurde nicht geladen (${error instanceof Error ? error.message : String(error)}); die Marke nennt die Schrift weiter mit Lizenz.`,
      );
    }
  }
  if (css.length > 0) writeFileSync(join(dir, "tiparoj.css"), `${css.join("\n")}\n`);
  return sentences;
}

function filesBelow(dir: string): string[] {
  const out: string[] = [];
  const walk = (current: string) => {
    for (const entry of readdirSync(current, { withFileTypes: true })) {
      const path = join(current, entry.name);
      if (entry.isDirectory()) walk(path);
      else out.push(relative(dir, path));
    }
  };
  if (existsSync(dir)) walk(dir);
  return out.sort();
}

/**
 * Exports a brand: refused when the checks refuse the Agordo (nothing written), removed when a
 * byte of a licensed font would ship. Otherwise `<brand>/eksporto/aspekto-<name>/` always, and
 * `projekcioj/css/` and `projekcioj/figma/` as chosen.
 */
export async function exportMarko(
  workdir: string,
  name: string,
  agordo: Agordo,
  bases: Bases,
  options: ExportOptions,
): Promise<ExportResult> {
  let mark = Date.now();
  const lap = () => {
    const now = Date.now();
    const ms = now - mark;
    mark = now;
    return ms;
  };
  const derivation = checkDraft(agordo, bases);
  const dir = join(markoDir(workdir, name), "eksporto");
  if (!derivation.exportable) {
    return { ok: false, dir, files: [], issues: derivation.issues, sentences: [] };
  }
  clearExport(workdir, name);
  mkdirSync(dir, { recursive: true });
  const packageName = `aspekto-${agordo.name}`;
  writePackage(join(dir, packageName), derivation.files);
  const sentences = [
    `Das Paket ${packageName} liegt in eksporto/${packageName} (${Object.keys(derivation.files).length} Dateien).`,
  ];
  sentences.push(...(await webfontFiles(dir, packageName, agordo, options.npm)));
  const paket = lap();
  const projections = options.celoj.filter((celo): celo is "css" | "figma" => celo !== "aspekto");
  if (projections.length > 0) {
    const config = join(dir, "fundamento.config.json");
    writeFileSync(config, `${JSON.stringify({ aspektoj: [`./${packageName}`] }, null, 2)}\n`);
    const built = await buildProjekcioj({
      outDir: join(dir, "projekcioj"),
      source: projectModeloSource(config, "fundamento.config.json"),
      celoj: projections,
      build: options.build ?? "metiejo",
    });
    if (!built.ok) {
      rmSync(dir, { recursive: true, force: true });
      return { ok: false, dir, files: [], issues: built.errors, sentences: [] };
    }
    if (projections.includes("css"))
      sentences.push(
        "Das CSS mit komuna und der Marke liegt in eksporto/projekcioj/css/fundamento.css.",
      );
    if (projections.includes("figma"))
      sentences.push(
        "Das Figma-Plugin liegt in eksporto/projekcioj/figma/plugin (Plugins → Development → Import plugin from manifest).",
      );
  }
  const projekcioj = lap();
  const scan = scanDirs([dir], options.fonts);
  if (!scan.ok) {
    rmSync(dir, { recursive: true, force: true });
    return {
      ok: false,
      dir,
      files: [],
      issues: scan.findings.map(
        (finding): MetiejoIssue => ({
          rule: "tiparo-in-result",
          severity: "error",
          path: relative(dir, finding.file),
          message: `${relative(dir, finding.file)} carries bytes of the licensed font ${basename(finding.source)}; the export was removed.`,
          suggestion:
            "A licensed font never ships: name it in the brand (lizenziert, nicht enthalten) and keep its file in the private repository.",
        }),
      ),
      sentences: [],
    };
  }
  const files = filesBelow(dir);
  return {
    ok: true,
    dir,
    files,
    issues: [],
    sentences,
    partoj: { paket, projekcioj, pruefung: lap() },
  };
}
