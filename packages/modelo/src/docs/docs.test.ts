// Document assertions for the Spec-Kit artifacts and the README (FUND-5.2; S1, FR-19, AK-08,
// AK-09, AK-11). Read-only: nothing here writes into the repo.

import { createHash } from "node:crypto";
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import {
  findBrandValues,
  repoFingerprintIndex,
  repoFingerprints,
} from "../checks/clean-room/marko-spuro.js";

const repoRoot = fileURLToPath(new URL("../../../../", import.meta.url));
const specDir = `${repoRoot}specs/000-fundamento-repo/`;

/**
 * SHA-256 and byte length of the approved product spec (German, "Freigegeben für Build",
 * revised 2026-09-19). The source lives outside this repository, so the sync is pinned by
 * checksum: if the approved spec changes, copy it verbatim to `spec.md` and update both values.
 */
const APPROVED_SPEC_SHA256 = "40785cb6e9b99abc11e439f2d6bdf87ad31565ea10a6269e6f0660a824686d26";
const APPROVED_SPEC_BYTES = 28549;

/** Constitution v1.2 article numerals, in order. */
const ARTICLES = [
  "I",
  "II",
  "III",
  "IV",
  "V",
  "VI",
  "VII",
  "VIII",
  "IX",
  "X",
  "XI",
  "XII",
  "XIII",
] as const;

function read(relative: string): string {
  return readFileSync(`${repoRoot}${relative}`, "utf8");
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

/** Text of the section that starts at the given `##` heading, up to the next `##` heading. */
function section(markdown: string, heading: string): string {
  const lines = markdown.split("\n");
  const start = lines.findIndex((line) => line.trim() === `## ${heading}`);
  if (start < 0) return "";
  const rest = lines.slice(start + 1);
  const end = rest.findIndex((line) => /^## /.test(line));
  return (end < 0 ? rest : rest.slice(0, end)).join("\n");
}

/** Removes fenced code blocks and inline code spans, so only prose remains. */
function proseOnly(markdown: string): string {
  return markdown.replace(/```[\s\S]*?```/g, "").replace(/`[^`\n]*`/g, "");
}

/** Third-party dependency names declared by the root and every workspace package. */
function declaredDependencies(): string[] {
  const manifests = [
    "package.json",
    "packages/modelo/package.json",
    "packages/vortaro/package.json",
    "packages/cli/package.json",
    "packages/mcp/package.json",
    "packages/aspekto-komuna/package.json",
  ];
  const names = new Set<string>();
  for (const manifest of manifests) {
    const parsed: unknown = JSON.parse(read(manifest));
    if (!isRecord(parsed)) continue;
    for (const field of ["dependencies", "devDependencies"]) {
      const deps = parsed[field];
      if (!isRecord(deps)) continue;
      for (const [name, range] of Object.entries(deps)) {
        if (typeof range === "string" && !range.startsWith("workspace:")) names.add(name);
      }
    }
  }
  return [...names].sort();
}

describe("specs/000-fundamento-repo/spec.md (FR-19, AK-09)", () => {
  const spec = readFileSync(`${specDir}spec.md`);
  const text = spec.toString("utf8");

  it("is a byte-for-byte copy of the approved product spec", () => {
    expect(spec.byteLength).toBe(APPROVED_SPEC_BYTES);
    expect(createHash("sha256").update(spec).digest("hex")).toBe(APPROVED_SPEC_SHA256);
  });

  it("contains no open [NEEDS CLARIFICATION] marker outside code spans", () => {
    // The spec's own AK-09 and review checklist quote the marker in backticks; a real marker is
    // bare prose, usually `[NEEDS CLARIFICATION: question]`.
    expect(proseOnly(text)).not.toMatch(/\[NEEDS CLARIFICATION/);
  });

  it("proseOnly still detects a bare marker (guard for the assertion above)", () => {
    expect(proseOnly("Units? [NEEDS CLARIFICATION: rem or px]")).toMatch(/\[NEEDS CLARIFICATION/);
    expect(proseOnly("Keine offenen `[NEEDS CLARIFICATION]`")).not.toMatch(/NEEDS/);
  });
});

describe("specs/000-fundamento-repo/plan.md (FR-19, AK-08)", () => {
  const plan = read("specs/000-fundamento-repo/plan.md");
  const review = section(plan, "Constitutional Compliance Review");

  it("has a Constitutional Compliance Review section", () => {
    expect(review.length).toBeGreaterThan(0);
  });

  it.each(ARTICLES)("reviews Article %s with a verdict", (numeral) => {
    const headings = review
      .split("\n")
      .filter((line) => line.startsWith(`### Article ${numeral} `));
    expect(headings).toHaveLength(1);
    const heading = headings[0] ?? "";
    const body = review.slice(review.indexOf(heading) + heading.length);
    const entry = body.split(/\n### /)[0] ?? "";
    expect(entry).toMatch(/\*\*Verdict:\*\* (conforming|exception)/);
  });

  it("lists the Articles in order", () => {
    const order = [...review.matchAll(/^### Article ([IVX]+) /gm)].map((m) => m[1]);
    expect(order).toEqual([...ARTICLES]);
  });

  it("has a Complexity Tracking section", () => {
    expect(section(plan, "Complexity Tracking")).toMatch(/Turborepo/);
  });

  it("records the px reference-unit interpretation (FR-09a)", () => {
    expect(review).toMatch(/FR-09a/);
    expect(review).toMatch(/reference unit/);
  });

  it("has a Penpot import result section pending maintainer verification (AK-11)", () => {
    expect(section(plan, "Penpot import result")).toMatch(/pending maintainer verification/);
  });

  it("records a reason for every declared third-party dependency", () => {
    // Phase 0 installed the base toolchain; Spec 001 added the MCP SDK and its peer. Each plan's
    // Dependencies table names its own columns, so the reason is found by its header.
    const tables = [
      plan,
      read("specs/001-vortaro-aspektoj-mcp/plan.md"),
      read("specs/002-regularo-gvidanto/plan.md"),
    ].map((text) =>
      section(text, "Dependencies")
        .split("\n")
        .filter((line) => line.startsWith("|")),
    );
    for (const name of declaredDependencies()) {
      const table = tables.find((lines) =>
        lines.some((line) => line.startsWith(`| \`${name}\` |`)),
      );
      expect(table, `dependency ${name} missing from the plans' Dependencies tables`).toBeDefined();
      const cellsOf = (line: string) => line.split("|").map((cell) => cell.trim());
      const reasonIndex = cellsOf(table?.[0] ?? "").indexOf("Reason");
      const row = table?.find((line) => line.startsWith(`| \`${name}\` |`)) ?? "";
      expect(
        cellsOf(row)[reasonIndex]?.length ?? 0,
        `dependency ${name} needs a reason`,
      ).toBeGreaterThan(10);
    }
  });

  it("traces every FR and AK of spec.md to tickets", () => {
    const spec = read("specs/000-fundamento-repo/spec.md");
    const trace = section(plan, "Traceability");
    const ids = new Set([...spec.matchAll(/^- ((?:FR|AK)-\d+[a-z]?):/gm)].map((m) => m[1] ?? ""));
    expect(ids.size).toBeGreaterThanOrEqual(30);
    for (const id of ids) {
      expect(trace, `${id} missing from traceability table`).toMatch(
        new RegExp(`\\|[^|\\n]*\\b${id}\\b(?![a-z])`),
      );
    }
  });
});

describe("README.md (S1, FR-02, AK-11)", () => {
  const readme = read("README.md");

  it.each(["pnpm install", "pnpm build", "pnpm check"])("documents `%s`", (command) => {
    expect(readme).toContain(`\`${command}\``);
  });

  it.each([
    "pnpm fm --version",
    "pnpm fm modelo validate",
    "pnpm id:new",
    "pnpm id:retire",
    "pnpm vortaro:themes",
    "pnpm check:vortaro-lint",
    "pnpm check:parity",
    "pnpm check:regularo",
    "pnpm check:alirebleco",
    "pnpm check:clean-room",
    "pnpm check:ikonaro",
    "pnpm check:fontoj",
    "pnpm -s",
    "--fixture",
    "--json",
  ])("documents %s", (fragment) => {
    expect(readme).toContain(fragment);
  });

  it("names Node 24 as a prerequisite", () => {
    expect(readme).toMatch(/Node(\.js)? 24/);
  });

  it("has a Penpot quickstart that points to plan.md", () => {
    const quickstart = section(readme, "Penpot quickstart");
    expect(quickstart).toContain("packages/vortaro");
    expect(quickstart).toContain("$themes.json");
    expect(quickstart).toContain("specs/000-fundamento-repo/plan.md");
  });

  it("keeps the 'what lives where' overview to ten lines", () => {
    const overview = section(readme, "What lives where");
    const lines = overview.split("\n").filter((line) => line.startsWith("- "));
    expect(lines).toHaveLength(10);
  });
});

describe("Spec 001 documentation (T029)", () => {
  const readme = read("README.md");
  const plan001 = read("specs/001-vortaro-aspektoj-mcp/plan.md");

  it.each([
    "pnpm fm modelo export",
    "pnpm fm modelo validate --config",
    "pnpm fm modelo validate --aspekto",
    "pnpm fm mcp",
    "--http",
    "fundamento-mcp",
    "fundamento.config.json",
    "packages/aspekto-komuna",
    "packages/mcp",
  ])("the README documents %s", (fragment) => {
    expect(readme).toContain(fragment);
  });

  it("the Penpot quickstart imports one folder per Aspekto and points to both plans", () => {
    const quickstart = section(readme, "Penpot quickstart");
    expect(quickstart).toContain("packages/modelo/dist/vortaro/<aspekto>/");
    expect(quickstart).toContain("specs/001-vortaro-aspektoj-mcp/plan.md");
  });

  it("the README names the MCP tools", () => {
    const mcp = section(readme, "MCP server");
    for (const tool of [
      "describe",
      "list_dimensioj",
      "list_aspektoj",
      "search_tokens",
      "get_token",
      "resolve",
      "list_reguloj",
      "list_jugxoj",
      "validate",
      "derive_name",
    ]) {
      expect(mcp).toContain(`\`${tool}\``);
    }
  });

  it("traces every FR and AK of Spec 001 to decisions and task IDs", () => {
    const spec = read("specs/001-vortaro-aspektoj-mcp/spec.md");
    const rows = section(plan001, "Traceability (requirement → decision → tasks)")
      .split("\n")
      .filter((line) => line.startsWith("| ") && !line.startsWith("| Requirement"));
    const ids = new Set([...spec.matchAll(/^- ((?:FR|AK)-\d+[a-z]?):/gm)].map((m) => m[1] ?? ""));
    expect(ids.size).toBe(30);
    for (const id of ids) {
      const row = rows.find((line) =>
        new RegExp(`\\b${id}\\b(?![a-z])`).test(line.split("|")[1] ?? ""),
      );
      expect(row, `${id} missing from the traceability table`).toBeDefined();
      expect(row, `${id} has no task ID`).toMatch(/\bT0\d\db?\b/);
    }
  });

  it("has no open clarification marker in Spec 001 (AK-11)", () => {
    for (const file of ["spec.md", "plan.md", "research.md", "data-model.md", "tasks.md"]) {
      // Mentions in code spans (the AK-11 text itself) are not markers.
      expect(proseOnly(read(`specs/001-vortaro-aspektoj-mcp/${file}`)), file).not.toContain(
        "[NEEDS CLARIFICATION",
      );
    }
  });

  it("leaves the Penpot import result pending maintainer verification", () => {
    expect(section(plan001, "Penpot import result")).toContain("pending maintainer verification");
  });

  it.each([
    "README.md",
    "specs/001-vortaro-aspektoj-mcp/plan.md",
    "specs/001-vortaro-aspektoj-mcp/tasks.md",
    "specs/001-vortaro-aspektoj-mcp/data-model.md",
    "specs/001-vortaro-aspektoj-mcp/quickstart.md",
    "specs/001-vortaro-aspektoj-mcp/contracts/mcp-tools.md",
  ])("%s holds no brand value (AK-08, reuses T022)", (file) => {
    expect(repoFingerprints().size).toBeGreaterThan(0);
    expect(findBrandValues(file, read(file), repoFingerprintIndex())).toEqual([]);
  });
});

describe("Spec 002 documentation (T001, D-20)", () => {
  const whatLivesWhere = section(read("README.md"), "What lives where");
  const lines = whatLivesWhere.split("\n");
  const lineWith = (fragment: string) => lines.find((line) => line.includes(fragment)) ?? "";

  it("links Spec 002 next to the Spec 000 and 001 links", () => {
    const specs = lineWith("(specs/)");
    expect(specs).toContain("(specs/000-fundamento-repo/)");
    expect(specs).toContain("(specs/001-vortaro-aspektoj-mcp/)");
    expect(specs).toContain("(specs/002-regularo-gvidanto/)");
  });

  it("links docs/vizio.md next to the Constitution", () => {
    expect(lineWith("(.specify/memory/constitution.md)")).toContain("(docs/vizio.md)");
  });

  it.each(["specs/002-regularo-gvidanto/spec.md", "docs/vizio.md"])("%s exists", (file) => {
    expect(read(file).length).toBeGreaterThan(0);
  });
});

describe("Spec 002 documentation (T025)", () => {
  const readme = read("README.md");
  const plan002 = read("specs/002-regularo-gvidanto/plan.md");

  it("the README names every MCP tool, the prompt and the Ontologio resource", () => {
    const mcp = section(readme, "MCP server");
    for (const tool of [
      "describe",
      "list_dimensioj",
      "list_aspektoj",
      "search_tokens",
      "get_token",
      "resolve",
      "list_reguloj",
      "list_jugxoj",
      "validate",
      "derive_name",
      "check_contrast",
      "explain",
      "explain_regulo",
      "describe_term",
    ]) {
      expect(mcp).toContain(`\`${tool}\``);
    }
    expect(mcp).toContain("`gvidanto`");
    expect(mcp).toContain("`fundamento://ontologio.json`");
  });

  it("the README says that Alirebleco reports the aux branches and that issues cite their Regulo", () => {
    const checks = section(readme, "Checks");
    expect(checks).toContain("aux");
    expect(checks).toContain("branches");
    expect(readme).toContain("kialo");
  });

  it("traces every FR and AK of Spec 002 to decisions and task IDs", () => {
    const spec = read("specs/002-regularo-gvidanto/spec.md");
    const rows = section(plan002, "Traceability (requirement → decision → tasks)")
      .split("\n")
      .filter((line) => line.startsWith("| ") && !line.startsWith("| Requirement"));
    const ids = new Set([...spec.matchAll(/^- \*\*((?:FR|AK)-\d+)/gm)].map((m) => m[1] ?? ""));
    expect(ids.size).toBe(30);
    for (const id of ids) {
      const row = rows.find((line) => new RegExp(`\\b${id}\\b`).test(line.split("|")[1] ?? ""));
      expect(row, `${id} missing from the traceability table`).toBeDefined();
      expect(row, `${id} has no task ID`).toMatch(/\bT0\d\d\b|done/);
    }
  });

  it("has no open clarification marker in Spec 002 (AK-11)", () => {
    for (const file of ["spec.md", "plan.md", "research.md", "data-model.md", "tasks.md"]) {
      expect(proseOnly(read(`specs/002-regularo-gvidanto/${file}`)), file).not.toContain(
        "[NEEDS CLARIFICATION",
      );
    }
  });

  it.each([
    "specs/002-regularo-gvidanto/plan.md",
    "specs/002-regularo-gvidanto/tasks.md",
    "specs/002-regularo-gvidanto/data-model.md",
    "specs/002-regularo-gvidanto/quickstart.md",
    "specs/002-regularo-gvidanto/contracts/mcp-tools.md",
    "packages/modelo/data/ontologio.json",
    "packages/mcp/prompts/gvidanto.md",
  ])("%s holds no brand value (AK-10, clean room)", (file) => {
    expect(findBrandValues(file, read(file), repoFingerprintIndex())).toEqual([]);
  });
});

describe("Spec 003 documentation (T001, Constitution v1.6)", () => {
  const constitution = read(".specify/memory/constitution.md");
  const TAILWIND_SENTENCE =
    "Tailwind v4: Tokens im `@theme` unter dem Namensraum `fm` (`--color-fm-*` → `bg-fm-*`), nicht per `prefix()`, weil `prefix()` alle Klassen des Projekts umbenennt.";

  it("Art. XII Celo 2 carries the Tailwind naming sentence", () => {
    const article = section(
      constitution,
      "Artikel XII – Interoperebleco (Interoperabilität statt Insel)",
    );
    const celo2 = article.split("\n").find((line) => line.startsWith("2. ")) ?? "";
    expect(celo2).toContain(TAILWIND_SENTENCE);
  });

  it("the change history names v1.6 (Spec 003) with Art. XII", () => {
    const history = section(constitution, "Governance");
    expect(history).toMatch(/v1\.6 \(Spec 003\) Art\. XII/);
  });

  it("Spec 003 lists the v1.6 amendment and the plan header names v1.6", () => {
    const spec = read("specs/003-butono-durchstich/spec.md");
    const amendments = section(spec, "Constitution-Änderungen (v1.4 → v1.5, v1.6)");
    expect(amendments).toContain("v1.6");
    expect(amendments).toContain("prefix()");
    expect(read("specs/003-butono-durchstich/plan.md").split("\n")[2]).toContain("v1.6");
  });
});

describe("Spec 003 documentation (F4: the npm org)", () => {
  const ORG = "https://www.npmjs.com/org/fundamento";

  it("names the npm org at Phase 3 of the vojmapo", () => {
    const vojmapo = read("docs/vojmapo.md");
    const phase3 = vojmapo.split("\n").find((line) => line.startsWith("| 3 |")) ?? "";
    expect(phase3).toContain(ORG);
  });

  it("lists the packages with the npm org in the README", () => {
    const packages = section(read("README.md"), "Packages");
    expect(packages).toContain(ORG);
    for (const name of [
      "@fundamento/modelo",
      "@fundamento/vortaro",
      "@fundamento/mcp",
      "@fundamento/cli",
      "@fundamento/projekcioj",
      "@fundamento/eroj",
      "@fundamento/aspekto-komuna",
    ]) {
      expect(packages, name).toContain(name);
    }
    expect(packages).toContain("make-kit");
  });
});

describe("Spec 003 documentation: the Ero tools (T025)", () => {
  const mcp = section(read("README.md"), "MCP server");

  // Spec 016 ③ added preview_agordo, Spec 019 ③ propose_agordo and save_agordo: 21 tools since.
  it("the README names the four Ero tools and counts twenty-one", () => {
    for (const tool of ["list_eroj", "get_ero", "suggest_ero", "check_usage"]) {
      expect(mcp, tool).toContain(`\`${tool}\``);
    }
    expect(mcp).toContain("21 tools");
  });

  it("the README points at the Phase-3 tool contract", () => {
    expect(mcp).toContain("specs/003-butono-durchstich/contracts/mcp-tools.md");
  });
});

describe("Spec 003 documentation: quickstart, checks and traceability (T027)", () => {
  const readme = read("README.md");
  const plan = read("specs/003-butono-durchstich/plan.md");
  const spec = read("specs/003-butono-durchstich/spec.md");

  it("the README has an Eroj quickstart that switches Aspekto and colour scheme", () => {
    const quickstart = section(readme, "Eroj quickstart");
    for (const part of [
      "fundamento.css",
      "<fm-butono",
      "Butono",
      "data-fm-aspekto",
      "data-fm-color-scheme",
      "fm projekcioj build",
    ]) {
      expect(quickstart, part).toContain(part);
    }
  });

  it("the README names the two rendered checks and the browsers they need", () => {
    const checks = section(readme, "Checks");
    expect(checks).toContain("pnpm check:alirebleco-eroj");
    expect(checks).toContain("pnpm check:make-kit");
    expect(checks).toContain("pnpm check:quickstart");
    expect(checks).toContain("playwright install");
    // Parity is no longer the empty comparator of Phase 0.
    expect(checks).not.toContain("empty inventory in Phase 0");
    expect(checks).toContain("parity/");
  });

  it("the CI workflow runs the four steps the README names", () => {
    const ci = read(".github/workflows/ci.yml");
    for (const step of [
      "Playwright browsers",
      "Check: Alirebleco (Eroj)",
      "Check: Make Kit",
      "Check: Quickstart",
    ]) {
      expect(ci, step).toContain(step);
    }
  });

  it("the plan maps every FR and AK of the spec to the tasks that implement it", () => {
    const required = [...spec.matchAll(/\*\*(FR-\d\d|AK-\d\d)/g)].map(([, id]) => id ?? "");
    expect(required.length).toBeGreaterThan(20);
    const table = section(plan, "Traceability (requirement → design → tasks)");
    for (const id of new Set(required)) {
      const row = table.split("\n").find((line) => new RegExp(`\\|[^|]*\\b${id}\\b`).test(line));
      expect(row, id).toBeDefined();
      // A task, a manual acceptance step, or a recorded reason why neither exists.
      expect(row ?? "", id).toMatch(/T0\d\d|M[1-3]|no task/);
    }
  });

  it("the vojmapo records Phase 3 as accepted after M1–M3", () => {
    const vojmapo = read("docs/vojmapo.md");
    const phase3 = vojmapo.split("\n").find((line) => line.startsWith("| 3 |")) ?? "";
    expect(phase3).toContain("✅ abgenommen 2026-10-09");
    for (const step of ["M1", "M2", "M3"]) {
      expect(phase3, step).toContain(step);
    }
  });
});

describe("Spec 004: the Vitrino check (T012)", () => {
  const readme = read("README.md");

  it("the README names the Vitrino check and where the Vitrino is written", () => {
    const checks = section(readme, "Checks");
    expect(checks).toContain("pnpm check:vitrino");
    expect(checks).toContain("vitrino/index.html");
  });

  it("the CI runs the Vitrino as a step of its own, after the quickstart", () => {
    const ci = read(".github/workflows/ci.yml");
    expect(ci).toContain("Check: Vitrino");
    expect(ci).toContain("pnpm check:vitrino");
    expect(ci.indexOf("Check: Vitrino")).toBeGreaterThan(ci.indexOf("Check: Quickstart"));
  });
});

describe("Spec 004 documentation: Etappe A (T014)", () => {
  const readme = read("README.md");

  it("the README names the Vitrino with its path and its check", () => {
    const checks = section(readme, "Checks");
    expect(checks).toContain("pnpm check:vitrino");
    expect(readme).toContain("vitrino/index.html");
    expect(readme).toContain("Gegenüberstellung");
  });

  it("the README lists the seven structural Reguloj of Etappe A", () => {
    for (const regulo of [
      "contrast-reserve",
      "surface-distinct",
      "palette-even",
      "palette-aligned",
      "srgb-gamut",
      "type-scale",
      "type-rhythm",
    ]) {
      expect(readme, regulo).toContain(regulo);
    }
  });

  it("the README explains Aspiro and Fluida Marko in a sentence each", () => {
    expect(readme).toMatch(/\*\*Aspiro\*\*|`Aspiro`|Aspiro\b/);
    expect(readme).toContain("Fluida Marko");
    // The distinction is the point: a Regulo binds every brand, an Aspiro only its own.
    expect(readme).toMatch(/Aspiro[^.]*\b(Marke|brand)\b/);
  });

  // Etappe A was accepted by the maintainer on 2026-10-12 (M1 at the Vitrino, five findings, none
  // blocking). The documents carry the acceptance, the measurement and the findings as candidates.
  it("the vojmapo records Etappe A as accepted on 2026-10-12 with the findings as candidates", () => {
    const vojmapo = read("docs/vojmapo.md");
    const row = vojmapo.split("\n").find((line) => line.startsWith("| 3b |")) ?? "";
    expect(row).toContain("✅ Etappe A abgenommen 2026-10-12");
    expect(row).toContain("5 Befunde als Kandidaten in tasks.md");
    expect(row).toContain("Etappe B");
    expect(row).not.toContain("Abnahme offen");
  });

  it("the plan carries the measurement of M1 under the results of the manual acceptance", () => {
    const plan = read("specs/004-komparo/plan.md");
    const results = plan.split("## Ergebnisse der manuellen Abnahme")[1] ?? "";
    expect(results).toContain("**Etappe A abgenommen vom Maintainer am 2026-10-12, 19:17.**");
    expect(results).toContain("Stand main 51e9ed9");
    expect(results).not.toContain("**Stand:** offen");
    // The table V1–V9 and the five findings, in the words of the measurement.
    for (const row of ["V1", "V2", "V3", "V4", "V5", "V6", "V7", "V8", "V9"]) {
      expect(results).toMatch(new RegExp(`^\\| ${row} \\|`, "m"));
    }
    expect(results).toContain("state-loading-visible");
    expect(results).toContain("states-pairwise-distinct");
    expect(results).toContain("Knopf „Gegenüberstellung");
    expect(results).toContain("contrast=high");
    expect(results).toContain("NaN");
  });

  it("the tasks close M1 and carry the five findings as candidates, not as work done", () => {
    const tasks = read("specs/004-komparo/tasks.md");
    expect(tasks).toMatch(/- \[x\] \*\*M1 –/);
    expect(tasks).toContain("2026-10-12");
    for (const candidate of [
      "state-loading-visible",
      "Gegenüberstellung",
      "contrast=high",
      "states-pairwise-distinct",
      "NaN",
    ]) {
      expect(tasks).toContain(candidate);
    }
    // Each candidate is open: entered, not implemented.
    const candidates = tasks.split("## Kandidaten aus der Abnahme M1")[1] ?? "";
    expect(candidates).toContain("- [ ] **K1");
    expect(candidates).toContain("- [ ] **K5");
    expect(candidates).not.toContain("- [x]");
  });

  it("the vojmapo carries the Regulo candidate for label text in Phase 4", () => {
    const vojmapo = read("docs/vojmapo.md");
    const row = vojmapo.split("\n").find((line) => line.startsWith("| 4 |")) ?? "";
    expect(row).toContain("Beschriftungstext");
    expect(row).toContain("APCA");
    expect(row).toContain("WCAG");
  });

  it("the plan maps every FR and AK of Etappe A to the tasks that implement it", () => {
    const plan = read("specs/004-komparo/plan.md");
    const table = section(plan, "Nachverfolgbarkeit (Anforderung → Entwurf → Aufgaben)");
    for (const id of ["FR-01", "FR-05", "FR-09", "FR-15", "FR-19", "AK-01", "AK-02"]) {
      const row = table.split("\n").find((line) => new RegExp(`\\|[^|]*\\b${id}\\b`).test(line));
      expect(row, id).toBeDefined();
      expect(row ?? "", id).toMatch(/T0\d\d|M1|keine Aufgabe/);
    }
  });

  it("the quickstart of Spec 004 runs the Vitrino and the checks it names", () => {
    const quickstart = read("specs/004-komparo/quickstart.md");
    expect(quickstart).toContain("pnpm check:vitrino");
    expect(quickstart).toContain("fm projekcioj build");
    expect(quickstart).toContain("--bazo");
  });
});

/** Die Übernahmeregel des Artikels V: von zwei Amendments zitiert, deshalb nur einmal geschrieben. */
const SOURCE_RULE = "Quellmaterial anderer Systeme wird dem Coding-Tool nicht vorgelegt.";

describe("Spec 004 documentation (T001, Art. V Benchmark-Aspekto)", () => {
  const constitution = read(".specify/memory/constitution.md");
  const BENCHMARK_SENTENCE =
    "Ein fremdes System mit offener, nachgewiesener Lizenz darf als Benchmark-Aspekto importiert werden, um es mit denselben Prüfungen zu messen.";

  // Die Nummer folgt der Landung, nicht dem Entwurf: #33 (F41) ging zuerst nach main und nahm die
  // 1.9, dieser Strang war als 1.8 entworfen und landet als 2.0 (Maintainer, 2026-09-24). Eine v1.8
  // hat es damit nie gegeben; die Lücke wird in der Änderungshistorie benannt, nicht geschlossen.
  // 2.0 statt 1.10, weil „Kein Trittbrett" die erste Regel ist, die nicht den Erbauer bindet,
  // sondern den Benutzer. Dieser Test ist der einzige Gegenleser der Nummer — ein Vergleich über
  // einen String, der zwei Amendments unter einer Nummer nie melden würde. Seit Spec 007 (T010)
  // steht hier 2.1: Die Nummer wurde gegen main und die offenen PRs geprüft, keiner beanspruchte sie.
  // Seit F1 (Spec 007, F1-T06) 2.2: bestimmt gegen die Basis des F1-PR, main 51e9ed9 mit v2.1.
  // Seit Spec 024 Runde 2 (Amendment v2.3, freigegeben am 2026-10-21) 2.3: bestimmt gegen main
  // 8915fa6 mit v2.2 und den offenen PR #100 (O-1), der keine Nummer beansprucht.
  // Seit Spec 029 ① (Amendment v2.4, freigegeben am 2026-10-23, 21:56) 2.4: bestimmt gegen main
  // d29a5206 mit v2.3; die Spec nennt die Nummer.
  // Seit Spec 033 S1 (Amendment v2.5, freigegeben am 2026-10-24, 13:41) 2.5: bestimmt gegen main
  // 05f122dc mit v2.4 und ohne offenen PR; die Spec nennt die Nummer.
  it("the Constitution header says version 2.5 and the history names v2.3 with the Ero-Tokens", () => {
    expect(constitution.split("\n")[2]).toMatch(/^Version 2\.5 · /);
    expect(constitution).toContain("v2.3 (Spec 024");
    expect(constitution).toContain("Terminologie **Ero-Tokeno**");
  });

  it("Art. V carries the Benchmark-Aspekto paragraph and keeps the source rule", () => {
    const article = section(constitution, "Artikel V – Pura Cxambro (Clean Room)");
    expect(article).toContain("Benchmark-Aspekto");
    expect(article).toContain(BENCHMARK_SENTENCE);
    expect(article).toContain("in einem eigenen Repo und einer eigenen Coding-Sitzung");
    expect(article).toContain("nur Kennzahlen und Fingerprints");
    expect(article).toContain(SOURCE_RULE);
  });

  it("the terminology table names Aspiro with its field", () => {
    const table = section(constitution, "Terminologio (verbindliches Vokabular)");
    const row = table.split("\n").find((line) => line.startsWith("| **Aspiro**")) ?? "";
    expect(row).toContain("Entwurfsziel");
    expect(row).toContain("`aspekto.json#/aspiroj`");
  });

  it("the change history names v1.7 (Spec 004) with Art. V and Aspiro", () => {
    const history = section(constitution, "Governance");
    expect(history).toMatch(/v1\.7 \(Spec 004\) Art\. V/);
    expect(history).toContain("Aspiro");
  });

  it("the Constitution does not yet carry the principle Fluida Marko", () => {
    expect(constitution).not.toContain("Fluida Marko");
  });
});

// F41: the amendment that makes the register of gaps constitutional. Art. VI now says that a gap is
// kept with its closing condition and that no projection wires an incapability — the attempt is the
// measurement, never a version query.
describe("F41 documentation (Constitution v1.9, Art. VI Manko)", () => {
  const constitution = read(".specify/memory/constitution.md");

  it("Art. VI says gaps are kept, with a mandatory closing condition", () => {
    const article = section(constitution, "Artikel VI – Regularo kun Kialoj (Regeln mit Gründen)");
    expect(article).toContain("Lücken werden geführt");
    expect(article).toContain("Eine Manko ohne Schließbedingung ist ungültig");
    expect(article).toContain("Keine Projektion verdrahtet eine Unfähigkeit");
    expect(article).toContain("der Versuch ist die Messung");
  });

  it("the terminology table names Manko with its file", () => {
    const table = section(constitution, "Terminologio (verbindliches Vokabular)");
    const row = table.split("\n").find((line) => line.startsWith("| **Manko**")) ?? "";
    expect(row).toContain("gemessene Lücke");
    expect(row).toContain("`packages/modelo/data/mankoj.json`");
  });

  it("the change history names v1.9 (Spec 003, F41) with Art. VI and Manko", () => {
    const history = section(constitution, "Governance");
    expect(history).toMatch(/v1\.9 \(Spec 003, F41\) Art\. VI/);
    expect(history).toContain("**Manko**");
  });
});

// F33: drei Ergänzungen, jede in dem Artikel, dessen Gegenstand sie fortschreibt — was gelesen
// werden darf (V), was mit dem Ergebnis geschehen darf (VI) und was mitreisen muss (VII). Keine
// neue Nummerierung: Jeder Verweis auf „Art. VIII" im Repo bliebe sonst stehen und zeigte woanders
// hin. Artikel V verweist auf den ersten Absatz des Artikels VI, deshalb steht „Kein Trittbrett"
// dort vor dem Manko-Absatz.
describe("F33 documentation (Constitution v2.0, Art. V/VI/VII)", () => {
  const constitution = read(".specify/memory/constitution.md");

  it("Art. V says that public appearance is no source", () => {
    const article = section(constitution, "Artikel V – Pura Cxambro (Clean Room)");
    expect(article).toContain("Öffentlich beobachtbare Erscheinung ist kein Quelltext");
    expect(article).toContain("zwischen Beobachtung und Übernahme");
    // Die Klarstellung weitet nichts auf: Die Übernahmeregel steht unverändert daneben.
    expect(article).toContain(SOURCE_RULE);
  });

  it("Art. VI carries Kein Trittbrett, with confusability as the measure", () => {
    const article = section(constitution, "Artikel VI – Regularo kun Kialoj (Regeln mit Gründen)");
    expect(article).toContain("**Kein Trittbrett.**");
    expect(article).toContain("Maßstab ist die Verwechselbarkeit, nicht die Ähnlichkeit");
    expect(article).toContain("eine Jugxo, keine Messung");
    // Und die ältere Regel dieses Artikels bleibt, wo sie war.
    expect(article).toContain("**Befund wird Regel.**");
  });

  it("Art. VII asks every import for its provenance and marks a font that was only read", () => {
    const article = section(
      constitution,
      "Artikel VII – Agenta Dokumentado (agentische Dokumentation)",
    );
    expect(article).toContain("**Herkunftsnachweis.**");
    expect(article).toContain("Ohne Herkunftsnachweis ist ein Import unvollständig");
    expect(article).toContain("Name gelesen, Lizenz ungeklärt");
    expect(article).toContain("Ein Name ist keine Lizenz.");
  });

  it("the change history names v2.0 (Spec 003, F33) and says the v1.8 never existed", () => {
    const history = section(constitution, "Governance");
    expect(history).toMatch(/v2\.0 \(Spec 003, F33\) Art\. V/);
    expect(history).toContain("**Kein Trittbrett**");
    expect(history).toContain("**Herkunftsnachweis**");
    expect(history).toContain("eine v1.8 hat es nie gegeben");
  });
});

// Spec 007 (T010, plan D-11): Die Uzo ist Wissen eigener Art neben der Skemo, also ein Begriff der
// Terminologio. Tabellenzeile, Ontologio-Begriff und Entitätstyp landen in einem Commit, weil die
// Drift-Prüfung jeden Zwischenstand rot machen würde.
describe("Spec 007 documentation (Constitution v2.1, Uzo)", () => {
  const constitution = read(".specify/memory/constitution.md");

  it("the terminology table names Uzo with its file and the two kinds of text rules", () => {
    const table = section(constitution, "Terminologio (verbindliches Vokabular)");
    const row = table.split("\n").find((line) => line.startsWith("| **Uzo**")) ?? "";
    expect(row).toContain("Der Gebrauch eines Ero");
    expect(row).toContain("fest oder anpassbar");
    expect(row).toContain("`data/eroj/<ero>/uzo.json`");
  });

  it("the change history names v2.1 (Spec 007) with both points, in the maintainer's words", () => {
    const history = section(constitution, "Governance");
    expect(history).toContain(
      "v2.1 (Spec 007): Begriff Uzo; Art. XII Punkt 5 und Phase 5: eine Library, ein Kit, Marken als Modi (Zielbild Chamäleon, Maintainer 2026-10-09)",
    );
  });

  // Zweiter Punkt des Amendments (Nachtrag „Zielbild Chamäleon“, Maintainer 2026-10-09): „je
  // Aspekto“ beschrieb den Übergang des Durchstichs und wurde als Ziel gelesen.
  it("Art. XII point 5 asks for one Make Kit for all Aspektoj, one per Aspekto only as a bridge", () => {
    const article = section(
      constitution,
      "Artikel XII – Interoperebleco (Interoperabilität statt Insel)",
    );
    expect(article).toContain(
      "**Figma Make Kit**: ein Kit für alle Aspektoj, umschaltbar zur Laufzeit; bis Make das kann, ein Kit je Aspekto als Übergang. React-Paket, Tailwind-Tokens und aus dem Modelo generierte Guidelines (keine handgeschriebene Zeile, Art. VII)",
    );
    expect(article).not.toContain("**Figma Make Kit** je Aspekto");
  });

  it("the phase table of the Constitution asks for one library with brands as modes in Phase 5", () => {
    const row = constitution.split("\n").find((line) => line.startsWith("| 5 |")) ?? "";
    expect(row).toMatch(
      /\| Eine publizierbare Library, Marken als Modi; Penpot-Paket mit Markenschalter \|$/,
    );
    expect(row).not.toContain("Library je Aspekto");
  });

  it("spec.md carries the second point of the amendment with reason and migration", () => {
    const amendment = section(read("specs/007-skemo-uzo/spec.md"), "Constitution Amendment");
    expect(amendment).toContain("Art. XII Punkt 5 (Make Kit) und Phasentabelle Zeile 5");
    expect(amendment).toContain(
      "Das Zielbild ist das Chamäleon: eine Library, ein Kit, Marken als Modi, Umschaltung zur Laufzeit in Figma, Penpot und Code. ‚Je Aspekto‘ beschrieb den Übergang des Durchstichs und wurde als Ziel gelesen.",
    );
    expect(amendment).toContain(
      "Keine. Die Figma-Projektion erzeugt schon eine Library mit Modi (F27, M1). Die Make Kits bleiben je Aspekto, bis eine Messung zeigt, ob Make ein umschaltbares Kit trägt.",
    );
  });

  it("the vojmapo states the target picture Chamäleon in the maintainer's words", () => {
    const vojmapo = read("docs/vojmapo.md");
    const target = section(vojmapo, "Zielbild in einem Satz");
    expect(target).toContain(
      "daraus entstehen Tokens, Komponenten, eine Figma-Library, Code und Dokumentation, die jede Marke und jede Situation tragen,",
    );
    expect(target).toContain(
      "Fundamento ist ein markenagnostisches Design System, das sich wie ein Chamäleon an jede Marke anpasst. Auch in Figma: Ein Entwurf, in Marke A gebaut und nach Marke B verschoben, sieht aus wie Marke B. Ein Markenschalter stellt einen ganzen Entwurf von A auf B um – in Figma, in Penpot und in jedem Code, zur Laufzeit; wenn es geht, auch in Figma Make. (Maintainer, 2026-10-09)",
    );
    expect(target).not.toContain("Figma-Libraries");
  });

  it("the vojmapo plans Phase 5 as switching, not copying, with the Penpot Manko as its closing", () => {
    const row = read("docs/vojmapo.md")
      .split("\n")
      .find((line) => line.startsWith("| 5 |"));
    // Projection B (Research-Notiz 2026-10-14) stands next to A; A stays preserved.
    expect(row).toBe(
      "| 5 | – | Generatoren in voller Breite: eine generische Figma-Library, Marken als Modi der Sammlung aspekto (F27, gemessen in M1); Penpot mit demselben Anspruch – Umschalten, nicht Kopieren (heute Manko man_01M4AZ8C2AXY2TJ2W9NQWYBKM1: eine Datei je Marke; Schließbedingung ist der Markenschalter in einer Datei); Icons, Fonts, JSON-LD-Projekcio der Ontologio, Laufzeit-Umschaltung aller Dimensioj. Figma-Projektion B „Achsen als Modi“ als Spec mit Vergleichsdatei A gegen B ([Research-Notiz 2026-10-14](../research/projekcio-b-achsen-als-modi-2026-10-14.md)); Projektion A bleibt konserviert | geplant |",
    );
  });

  // Maintainer, 2026-10-14 (Research-Notiz „Projektion B"): the target picture gets a second
  // sentence next to the Chamäleon — Figma is the shop window, the prompt the control plane — and
  // the rule „nichts wegschmeißen" becomes a Constitution candidate, not an amendment.
  it("the vojmapo states Figma as the shop window and the prompt as the control plane (2026-10-14)", () => {
    const vojmapo = read("docs/vojmapo.md");
    const target = section(vojmapo, "Zielbild in einem Satz");
    expect(target).toContain(
      "Figma ist Schaufenster, der Prompt ist die Bedienebene. Ein Entwurf entsteht per Prompt („Login-Screen für Marke XY, nach diesem Vorbild“), Änderungen ebenso; Figma zeigt ihn und lässt ihn nachträglich anfassen – sekundär. (Maintainer, 2026-10-14)",
    );
    // The Chamäleon sentence stays as it was; the new one stands next to it.
    expect(target).toContain("(Maintainer, 2026-10-09)");
  });

  it("the vojmapo carries the Constitution candidate 'ein Konzeptwechsel stellt daneben' as a candidate, not an amendment", () => {
    const vojmapo = read("docs/vojmapo.md");
    const row = vojmapo.split("\n").find((line) => line.startsWith("| **Konservierung**")) ?? "";
    expect(row).toContain(
      "Ein Konzeptwechsel stellt daneben, er ersetzt nicht; der alte Stand bleibt baubar, gemessen und zurückholbar.",
    );
    expect(row).toContain("Art. XI");
    expect(row).toMatch(/\| Kandidat[^|]*\|$/);
    expect(row).not.toContain("Amendment beschlossen");
    const constitution = read(".specify/memory/constitution.md");
    expect(constitution).not.toContain("stellt daneben, er ersetzt nicht");
  });

  it("the research note on Projektion B lies with the research and is listed in the benchmarks", () => {
    const note = read("research/projekcio-b-achsen-als-modi-2026-10-14.md");
    expect(note).toMatch(/^# Research-Notiz: Figma-Projektion B „Achsen als Modi" – 2026-10-14/);
    expect(note).toContain('Regel „Nichts wegschmeißen"');
    const benchmarks = read("research/benchmarks.md");
    expect(benchmarks).toContain("projekcio-b-achsen-als-modi-2026-10-14.md");
  });

  it("the vojmapo names one switchable Make Kit as the goal and the kit per Aspekto as the bridge", () => {
    const row = read("docs/vojmapo.md")
      .split("\n")
      .find((line) => line.startsWith("| **Figma Make Kits** |"));
    expect(row?.split(" | ")[1]).toBe(
      "Durchstich (Spec 003): Kit je Aspekto, weil ein npm-Paket keine Modi kennt. Ziel: ein Kit, das alle Aspektoj trägt und in Make zur Laufzeit umschaltet. Ob Make das mitmacht, ist eine Messung, keine Annahme – offen, nach Spec 007",
    );
  });

  // Der README beschreibt den gemessenen Stand mit Manko-Id, kein Ziel; er bleibt.
  it("the README keeps the measured Penpot state, one file per brand, with its Manko", () => {
    const readme = read("README.md");
    expect(readme).toContain("One file per brand.");
    expect(readme).toContain("Manko `man_01M4AZ8C2AXY2TJ2W9NQWYBKM1`");
  });

  // T017: Plan, Datenmodell, Verträge und Aufgaben liegen seit #45 auf main; „Plan offen“ war falsch.
  // F1-T06: F1 ist umgesetzt; abgenommen in Figma f10b-4 (6 von 6, Messung 2026-10-12).
  // T031: Stufe B ist umgesetzt; die Abnahme (M1 Dialog, M2 Vitrino, T029 Figma) ist offen.
  it("the vojmapo records Stufe A, F1 and Stufe B of Spec 007 as implemented, the acceptance of B open", () => {
    const row = read("docs/vojmapo.md")
      .split("\n")
      .find((line) => line.startsWith("| 3c |"));
    expect(row).toMatch(
      /\| 📝 Spec, Plan und Tasks auf `main` \(#45\); Stufe A umgesetzt \(PR #\d+\); F1 umgesetzt \(PR #\d+, in Figma `f10b-4` abgenommen 2026-10-12\); Stufe B umgesetzt \(PR #\d+\), Abnahme offen \(M1 Dialog, M2 Vitrino, T029 Figma\) \|$/,
    );
    expect(row).not.toContain("Plan offen");
    expect(row).not.toContain("Stufe B offen");
  });

  // T031: a Uzo per Ero is mandatory for every new Ero of Phase 4.
  it("the vojmapo makes a Uzo per Ero mandatory for new Eroj in Phase 4", () => {
    const row = read("docs/vojmapo.md")
      .split("\n")
      .find((line) => line.startsWith("| 4 |"));
    expect(row).toContain(
      "Jedes Ero bekommt neben seiner Skemo eine Uzo (Pflicht für neue Eroj seit Spec 007 Stufe B; `check:regularo` warnt mit `skemo-uzo-missing`)",
    );
  });
});

// F1 (Spec 007, Jugxo jug_01M4DNSD0SV43Y943T21RQF7EM, Entscheidung OP-3): Art. II nannte
// `variant: primary | secondary | tertiary` als Beispiel. Nach F1 heißen die Achsen des butono
// emphasis und intent; das Beispiel folgt als eigenes Amendment mit eigener Nummer (F1-T06).
describe("F1 documentation (Constitution v2.2, Art. II example)", () => {
  const constitution = read(".specify/memory/constitution.md");

  it("Art. II gives the example emphasis: high | medium | low, not variant", () => {
    const article = section(constitution, "Artikel II – Unu Vortaro (ein Vokabular)");
    expect(article).toContain(
      "Ero-Prop `emphasis: high | medium | low` → Figma-Property `emphasis` mit identischen Werten → Code-Prop `emphasis` mit identischem Enum",
    );
    expect(article).not.toContain("variant: primary | secondary | tertiary");
  });

  it("the change history names v2.2 (Spec 007, F1) with the Art. II example", () => {
    const history = section(constitution, "Governance");
    expect(history).toContain(
      "v2.2 (Spec 007, F1) Art. II Beispiel `emphasis: high | medium | low` statt `variant: primary | secondary | tertiary` (Achsen des butono umbenannt, Jugxo `jug_01M4DNSD0SV43Y943T21RQF7EM`)",
    );
  });

  it("spec.md carries the third point of the amendment with reason and migration", () => {
    const amendment = section(read("specs/007-skemo-uzo/spec.md"), "Constitution Amendment");
    expect(amendment).toContain("**Dritter Punkt: Art. II nach F1 (v2.2, F1-T06).**");
    expect(amendment).toContain("Ero-Prop `emphasis: high | medium | low`");
    expect(amendment).toMatch(/\*\*Grund:\*\* Die Achsen des `butono` heißen seit F1 `emphasis`/);
    expect(amendment).toMatch(/\*\*Migration:\*\* Keine Daten; der Bruch ist F1 selbst/);
  });

  it("the vojmapo says the axes are renamed, not to be renamed", () => {
    const row = read("docs/vojmapo.md")
      .split("\n")
      .find((line) => line.startsWith("| 4 |"));
    expect(row).toContain(
      "die Achsen des `butono` heißen seit F1 `emphasis` (high/medium/low) und `intent` (neutral/danger) statt `variant` und `tone` (umbenannt, PR #",
    );
    expect(row).not.toContain("heißen nach F1");
  });

  it("the README shows the butono with emphasis and suggest_ero with the new axes", () => {
    const readme = read("README.md");
    expect(readme).toContain('<fm-butono emphasis="high">Speichern</fm-butono>');
    expect(readme).toContain('<Butono emphasis="high" type="submit">Weiter</Butono>');
    expect(readme).toContain('`suggest_ero` ("Löschen" → `emphasis=high`, `intent=danger`');
    expect(readme).not.toMatch(/variant="primary"|`variant=primary`/);
  });
});

// F23 (Release-Probelauf #1 auf main ac7321e, Maintainer 2026-09-22): "Dry run ekzemplo" scheiterte
// mit `cd: .fundamento/projekcioj/make-kit/ekzemplo: No such file or directory`. `fm projekcioj
// build` ohne --config erzeugt nur make-kit/komuna; ekzemplo existiert nur als Fixture. release.yml
// setzte beide voraus, und der Release-Weg lief nie in der CI. Beide Workflows teilen sich deshalb
// ein Skript, und die CI führt den Probelauf bei jedem PR aus.
describe("F23: the release path runs in the CI, both kits, one script", () => {
  const script = "scripts/release-kits.sh";
  const releaseYml = read(".github/workflows/release.yml");
  const ci = read(".github/workflows/ci.yml");

  it("ships the script, executable, and both workflows call it — release.yml no longer cd's", () => {
    expect(existsSync(join(repoRoot, script)), script).toBe(true);
    expect(statSync(join(repoRoot, script)).mode & 0o111, "executable").not.toBe(0);
    expect(releaseYml).toContain(`${script} dry-run`);
    expect(releaseYml).toContain(`${script} publish`);
    expect(releaseYml).not.toContain("cd .fundamento/projekcioj/make-kit");
    // The CI runs it as a check of its own, through the root script, like every other check.
    expect(ci).toContain("Check: Release");
    expect(ci).toContain("pnpm check:release");
    const scripts = (JSON.parse(read("package.json")) as { scripts: Record<string, string> })
      .scripts;
    expect(scripts["check:release"]).toBe(`${script} pack`);
  });

  it("builds the ekzemplo kit explicitly, from its fixture, and names both kit paths", () => {
    const text = read(script);
    expect(text).toContain(
      "--config packages/modelo/test/fixtures/valid/aspekto-ekzemplo/fundamento.config.json",
    );
    expect(text).toContain("--celo make-kit");
    for (const kit of ["komuna", "ekzemplo"]) expect(text).toContain(`make-kit/${kit}`);
    // A missing kit is an error with its path, not "cd: No such file".
    expect(text).toContain("package.json");
    expect(text).toMatch(/Kit fehlt/);
  });

  // Q2: the ekzemplo kit is MIT; its font ships as a name, never as a file in the package. Since
  // F29 the name is Archivo (OFL-1.1) instead of the invented „Ekzempla Grotesk": a designer has
  // to be able to pick the same family in Figma, where it comes from Google Fonts.
  it("keeps Q2: the ekzemplo fixture is MIT and its font ships as a name only", () => {
    const aspekto = JSON.parse(
      read("packages/modelo/test/fixtures/valid/aspekto-ekzemplo/aspekto-ekzemplo/aspekto.json"),
    ) as { license: string; fonts: { family: string; license: string; source: string }[] };
    expect(aspekto.license).toBe("MIT");
    expect(aspekto.fonts[0]).toMatchObject({ family: "Archivo", license: "OFL-1.1" });
    expect(aspekto.fonts[0]?.source).toContain("Archivo");
    // The script refuses a kit that carries a font file.
    expect(read(script)).toMatch(/woff2?|ttf|otf/);
  });
});

// Spec 008 T025 (A8): the Vojmapo names Spec 008 in Phase 4 and the rule every new Ero follows.
describe("Spec 008 documentation (Vojmapo Phase 4)", () => {
  it("the vojmapo names Spec 008 and the rule that a new Ero closes a boundary of an existing Ero", () => {
    const row = read("docs/vojmapo.md")
      .split("\n")
      .find((line) => line.startsWith("| 4 |"));
    expect(row).toContain("**Spec 008 (`ligilo`");
    expect(row).toContain(
      "Jedes neue Ero schließt, wo es kann, eine Grenze eines bestehenden Ero (Grenze → use-instead).",
    );
    expect(row).toContain("die Grenze `navigation` des `butono` wird `use-instead: ligilo`");
    expect(row).not.toMatch(/\| geplant \|$/);
  });

  it("specs/008-ligilo carries the spec unchanged next to plan and tasks", () => {
    const spec = read("specs/008-ligilo/spec.md");
    expect(spec).toMatch(/^# Spec 008 – Ligilo: der Link/);
    expect(spec).toContain("**E6 – `inline` erbt Typografie.**");
    const plan = read("specs/008-ligilo/plan.md");
    expect(plan).toContain("## Abweichungen von der Spec");
    expect(plan).toContain("### D-03 Bindungs-Schlüsselwörter `inherit` und `none`");
    expect(read("specs/008-ligilo/tasks.md")).toContain("## Messungen");
  });
});

// Spec 009 T016 (A8): the Vojmapo names Spec 009 in Phase 4.
describe("Spec 009 documentation (Vojmapo Phase 4)", () => {
  it("the vojmapo names Spec 009, the composite Ero and the Guidelines sentence", () => {
    const row = read("docs/vojmapo.md")
      .split("\n")
      .find((line) => line.startsWith("| 4 |"));
    expect(row).toContain("**Spec 009 (`kampo`");
    expect(row).toContain("das erste zusammengesetzte Ero");
    expect(row).toContain("Make erfindet kein Eingabefeld mehr");
  });

  it("specs/009-kampo carries the spec unchanged next to plan and tasks", () => {
    const spec = read("specs/009-kampo/spec.md");
    expect(spec).toMatch(/^# Spec 009 – Kampo: das Textfeld/);
    expect(spec).toContain("**E7 – `kind` statt `type`.**");
    expect(read("specs/009-kampo/plan.md")).toContain(
      "### D-03 Der Teil der Eingabe heißt `text`, nicht `input`",
    );
    expect(read("specs/009-kampo/tasks.md")).toContain("## Messungen");
  });
});

// Nachlese der Abnahmen von Spec 008 und 009 (2026-10-13) und der Befunde von Spec 004 (M1): what
// was fixed is in the plans, what stays a candidate is in the Vojmapo, and a check that only
// approximates its Regulo says so in the Regulo's scope (Art. VI: a finding becomes a rule, but
// not a rule that pretends more than it checks).
describe("Nachlese Spec 008/009 and Spec 004 findings (2026-10-13)", () => {
  const reguloj = JSON.parse(read("packages/modelo/data/reguloj.json")) as {
    reguloj: { name: string; scope: string }[];
  };
  const scopeOf = (name: string) =>
    reguloj.reguloj.find((regulo) => regulo.name === name)?.scope ?? "";

  it("the two text Reguloj say in their scope that their check is an approximation (R-1, R-2)", () => {
    // R-1: not-words hits every occurrence, "Mehr zum Datenschutz" too, although it names the goal.
    expect(scopeOf("link-label-names-destination")).toMatch(/approximation/);
    expect(scopeOf("link-label-names-destination")).toMatch(/every occurrence/);
    // R-2: min-words only counts, "Das ist ungültig" passes with three words and no way out.
    expect(scopeOf("error-says-what-to-do")).toMatch(/approximation/);
    expect(scopeOf("error-says-what-to-do")).toMatch(/only counts/);
  });

  it("the vojmapo carries the Regulo candidates in Phase 6 (Lint), not as work done", () => {
    const row =
      read("docs/vojmapo.md")
        .split("\n")
        .find((line) => line.startsWith("| 6 |")) ?? "";
    expect(row).toContain("Regulo-Kandidaten");
    for (const candidate of [
      "state-loading-visible",
      "states-pairwise-distinct",
      "not-only-words",
      "error-says-what-to-do",
    ]) {
      expect(row, candidate).toContain(candidate);
    }
    expect(row).toMatch(/\| geplant \|$/);
  });

  it("the plan of Spec 004 asks the maintainer the open Jugxo question and decides nothing", () => {
    const plan = read("specs/004-komparo/plan.md");
    const question = section(plan, "Offene Jugxo-Frage an den Maintainer (Abnahme M1, Befund 3)");
    expect(question).toContain("contrast=high");
    expect(question).toContain("nicht entschieden");
    expect(question).toMatch(/Absicht .* oder Lücke/);
  });

  it("the plans of Spec 008 and 009 carry the Nachlese with what was done and what stays open", () => {
    const ligilo = section(read("specs/008-ligilo/plan.md"), "Nachlese 2026-10-13");
    // R-11 is a finding of Spec 009 (A11) and stands in that plan.
    for (const item of ["F-1", "F-2", "M-3", "R-9", "R-10", "R-1", "C8"]) {
      expect(ligilo, item).toContain(`**${item}`);
    }
    const kampo = section(read("specs/009-kampo/plan.md"), "Nachlese 2026-10-13");
    for (const item of ["R-10", "R-11", "R-2", "F-1", "F-5", "F-6", "C8"]) {
      expect(kampo, item).toContain(`**${item}`);
    }
    // Make stays open: it needs the kit on npm (next) by the maintainer.
    expect(kampo).toMatch(/Make-Test/);
  });
});

// Spec 010 ① (G7, acceptance 8): the Vojmapo names Spec 010 ① in Phase 4; the folder carries the
// spec unchanged next to plan and tasks with four sections, ① filled.
describe("Spec 010 ① documentation (Vojmapo Phase 4)", () => {
  it("the vojmapo names Spec 010 ①, the switch and the Guidelines sentence", () => {
    const row = read("docs/vojmapo.md")
      .split("\n")
      .find((line) => line.startsWith("| 4 |"));
    expect(row).toContain("**Spec 010 ① (`sxaltilo`");
    expect(row).toContain("hält an/aus und wirkt sofort");
    expect(row).toContain("Make baut kein An/Aus mehr aus einem Button");
    expect(row).toContain("Spec 010 ① umgesetzt");
  });

  it("specs/010-formular-eroj carries the spec unchanged, plan and tasks with ① to ④", () => {
    const spec = read("specs/010-formular-eroj/spec.md");
    expect(spec).toMatch(
      /^# Spec 010 – Formular-Eroj, Runde 1: Sxaltilo, Markobutono, Elekto, Elektilo/,
    );
    const plan = read("specs/010-formular-eroj/plan.md");
    const tasks = read("specs/010-formular-eroj/tasks.md");
    for (const text of [plan, tasks]) {
      for (const section of ["① `sxaltilo`", "② `markobutono`", "③ `elekto`", "④ `elektilo`"]) {
        expect(text).toContain(`## ${section}`);
      }
    }
    for (const heading of [
      "### Entwurfsentscheidungen",
      "### Abweichungen von der Spec",
      "### Befunde / Mankoj",
      "### Offen (für den Maintainer)",
      "#### D-04 Die Lage des Knopfs ist ein Begriff",
    ]) {
      expect(plan).toContain(heading);
    }
    expect(tasks).toContain("### Messungen");
    expect(tasks).toContain("0073212");
  });
});

// Spec 010 ② (G7, acceptance 8): the Vojmapo names Spec 010 ② in Phase 4; plan and tasks carry
// section ② with its decisions, its deviations and the red hashes.
describe("Spec 010 ② documentation (Vojmapo Phase 4)", () => {
  it("the vojmapo names Spec 010 ②, the checkbox and the Guidelines sentence", () => {
    const row = read("docs/vojmapo.md")
      .split("\n")
      .find((line) => line.startsWith("| 4 |"));
    expect(row).toContain("**Spec 010 ② (`markobutono`");
    expect(row).toContain("hält ja/nein und gilt mit dem Formular");
    expect(row).toContain("Make baut jedes Ja/Nein eines Formulars aus dem Kontrollkästchen");
    expect(row).toContain("Spec 010 ② umgesetzt");
  });

  it("plan and tasks carry section ② with decisions, deviations, findings and red hashes", () => {
    const plan = read("specs/010-formular-eroj/plan.md");
    const tasks = read("specs/010-formular-eroj/tasks.md");
    const section = (text: string) =>
      text.slice(text.indexOf("## ② `markobutono`"), text.indexOf("## ③ `elekto`"));
    for (const heading of [
      "### Zusammenfassung",
      "### Entwurfsentscheidungen",
      "### Abweichungen von der Spec",
      "### Befunde / Mankoj",
      "### Offen (für den Maintainer)",
      "#### D-09 Figma: die Bauform `toggle` trägt das Kontrollkästchen",
    ]) {
      expect(section(plan)).toContain(heading);
    }
    expect(section(plan)).not.toContain("Folgt in PR ②.");
    expect(section(tasks)).toContain("### Messungen");
    for (const hash of ["3f4907b", "0a02f66"]) expect(section(tasks)).toContain(hash);
  });
});

// Spec 010 ③ (G7, acceptance 8): the Vojmapo names Spec 010 ③ in Phase 4; plan and tasks carry
// section ③ with its decisions, its deviations and the red hashes. After a rebase the hashes change:
// they stand in one row of tasks.md ③ and in the one loop below.
describe("Spec 010 ③ documentation (Vojmapo Phase 4)", () => {
  it("the vojmapo names Spec 010 ③, the radio group and the Guidelines sentence", () => {
    const row = read("docs/vojmapo.md")
      .split("\n")
      .find((line) => line.startsWith("| 4 |"));
    expect(row).toContain("**Spec 010 ③ (`elekto`");
    expect(row).toContain("hält eine von wenigen sichtbaren Optionen");
    expect(row).toContain(
      "Make baut jede Wahl einer von wenigen sichtbaren Optionen aus der Auswahl",
    );
    expect(row).toContain("Spec 010 ③ umgesetzt");
  });

  it("plan and tasks carry section ③ with decisions, deviations, findings and red hashes", () => {
    const plan = read("specs/010-formular-eroj/plan.md");
    const tasks = read("specs/010-formular-eroj/tasks.md");
    const section = (text: string) =>
      text.slice(text.indexOf("## ③ `elekto`"), text.indexOf("## ④ `elektilo`"));
    for (const heading of [
      "### Zusammenfassung",
      "### Entwurfsentscheidungen",
      "### Abweichungen von der Spec",
      "### Befunde / Mankoj",
      "### Offen (für den Maintainer)",
      "#### D-02 selected ist der Zustand einer Option, nicht der Gruppe",
    ]) {
      expect(section(plan)).toContain(heading);
    }
    expect(section(plan)).not.toContain("Folgt in PR ③.");
    expect(section(tasks)).toContain("### Messungen");
    for (const hash of ["0f3958c", "40b458b", "fccda4f", "87aaa75"]) {
      expect(section(tasks)).toContain(hash);
    }
  });
});

// Spec 010 ④ (G7, acceptance 8): the Vojmapo names Spec 010 ④ in Phase 4 and the family of the four
// Wahl-Eroj as complete; plan and tasks carry section ④ with its decisions, its deviations and the
// red hashes. After a rebase the hashes change: they stand in one row of tasks.md ④ and in the one
// loop below.
describe("Spec 010 ④ documentation (Vojmapo Phase 4)", () => {
  it("the vojmapo names Spec 010 ④, the select, the Guidelines sentence and the family as complete", () => {
    const row = read("docs/vojmapo.md")
      .split("\n")
      .find((line) => line.startsWith("| 4 |"));
    expect(row).toContain("**Spec 010 ④ (`elektilo`");
    expect(row).toContain("hält eine von vielen Optionen");
    expect(row).toContain("Make baut jede Wahl einer von vielen Optionen aus der Auswahlliste");
    expect(row).toContain("Die Familie der Wahl-Eroj ist vollständig");
    expect(row).not.toContain("④ `elektilo` folgt gestapelt.");
    expect(row).toContain("Spec 010 ④ umgesetzt");
  });

  it("plan and tasks carry section ④ with decisions, deviations, findings and red hashes", () => {
    const plan = read("specs/010-formular-eroj/plan.md");
    const tasks = read("specs/010-formular-eroj/tasks.md");
    const section = (text: string) => text.slice(text.indexOf("## ④ `elektilo`"));
    for (const heading of [
      "### Zusammenfassung",
      "### Entwurfsentscheidungen",
      "### Abweichungen von der Spec",
      "### Befunde / Mankoj",
      "### Offen (für den Maintainer)",
      "#### D-02 Die Optionen sind Einträge des Slots `options` wie beim `elekto`",
      "#### D-09 Text-Regeln: `select-placeholder-is-prompt` statt `placeholder-is-example`",
    ]) {
      expect(section(plan)).toContain(heading);
    }
    expect(section(plan)).not.toContain("Folgt in PR ④.");
    expect(section(tasks)).toContain("### Messungen");
    for (const hash of ["61260c2", "d95a7e5", "7c540f7"]) {
      expect(section(tasks)).toContain(hash);
    }
  });
});

// Spec 011 ① (G9, acceptance 8–10): the Vojmapo names Spec 011 ① in Phase 4, the Arkitekturo
// contract (G8) among the cross-cutting themes and the two Regulo candidates of Spec 010 (O-11,
// O-17) in Phase 6; the folder carries the spec unchanged next to plan and tasks with five sections,
// ① filled; the plan of Spec 010 carries the Nachlese 2 with the confirmed points.
describe("Spec 011 ① documentation (Vojmapo Phase 4, Querschnitt, Phase 6)", () => {
  const vojmapo = read("docs/vojmapo.md");
  const row = (start: string) => vojmapo.split("\n").find((line) => line.startsWith(start)) ?? "";

  it("the vojmapo names Spec 011 ①: the e2e runtime, the kampo kinds, the empty option, the contract", () => {
    const phase4 = row("| 4 |");
    expect(phase4).toContain("**Spec 011 ① (Grundlage");
    expect(phase4).toContain("O-21");
    expect(phase4).toContain("`password`");
    expect(phase4).toContain("`empty-label`");
    expect(phase4).toContain("Spec 011 ① umgesetzt");
  });

  it("the vojmapo carries the Arkitekturo contract as a cross-cutting theme (G8)", () => {
    const contract = row("| **Arkitekturo-Vertrag**");
    expect(contract).toContain("observed-usage/arkitekturo.json");
    expect(contract).toContain("101");
    expect(contract).toContain("Jugxo");
    expect(contract).toMatch(/Constitution/);
  });

  it("the vojmapo carries the Regulo candidates of Spec 010 (O-11, O-17) in Phase 6, not as work done", () => {
    const phase6 = row("| 6 |");
    expect(phase6).toContain("Prüfart über Prop und Einträge");
    expect(phase6).toContain("elekto-options-few");
    expect(phase6).toContain("select-placeholder-is-prompt");
    expect(phase6).toMatch(/\| geplant \|$/);
  });

  it("specs/011-eroj-runde-2 carries the spec unchanged, the candidate list, plan and tasks with ① to ⑤", () => {
    expect(read("specs/011-eroj-runde-2/spec.md")).toMatch(
      /^# Spec 011 – Eroj in der Breite, Runde 2: Eingabe, Overlay, Rückmeldung, Daten, Navigation/,
    );
    expect(read("specs/011-eroj-runde-2/arkitekturo-kandidaten.md")).toMatch(
      /^# Kandidaten für Fundamento/,
    );
    const plan = read("specs/011-eroj-runde-2/plan.md");
    const tasks = read("specs/011-eroj-runde-2/tasks.md");
    for (const text of [plan, tasks]) {
      for (const heading of [
        "## ① Grundlage",
        "## ② Eingabe",
        "## ③ Rückmeldung",
        "## ④ Daten",
        "## ⑤ Navigation",
      ]) {
        expect(text).toContain(heading);
      }
    }
    for (const heading of [
      "### Zusammenfassung",
      "### Entwurfsentscheidungen",
      "### Abweichungen von der Spec",
      "### Befunde / Mankoj",
      "### Offen (für den Maintainer)",
      "#### D-01 O-21",
      "#### D-02 G8",
    ]) {
      expect(plan).toContain(heading);
    }
    // The e2e runtime, measured before and after (O-21), and the brief of the kampo.
    expect(plan).toMatch(/vorher/);
    expect(plan).toMatch(/nachher/);
    expect(tasks).toContain("### Messungen");
    for (const hash of ["039d0f0", "763504c", "713593d", "7f87c22"]) {
      expect(tasks).toContain(hash);
    }
  });

  it("the plan of Spec 010 carries the Nachlese 2 with every confirmed point", () => {
    const nachlese = section(read("specs/010-formular-eroj/plan.md"), "Nachlese 2026-10-15");
    for (const point of [
      "O-1",
      "O-3",
      "O-4",
      "O-5",
      "O-6",
      "O-7",
      "O-8",
      "O-9",
      "O-10",
      "O-11",
      "O-12",
      "O-13",
      "O-14",
      "O-15",
      "O-16",
      "O-17",
      "O-18",
      "O-19",
      "O-20",
      "O-21",
    ]) {
      // Every point stands in the bold head of a bullet, alone or with its siblings (O-1, O-5, …).
      expect(nachlese, point).toMatch(new RegExp(`\\*\\*[^*\\n]*\\b${point}\\b`));
    }
    expect(nachlese).toContain("jug_01M50KAWKV5A1PYBARPMX4YKJE");
  });
});

// Spec 011 ② (G9, acceptance 8): the Vojmapo names Spec 011 ② in Phase 4; plan and tasks carry
// section ② with its decisions, deviations, findings, the Arkitekturo coverage and the red hashes.
// After a rebase the hashes change: they stand in one row of tasks.md ② and in the one loop below.
describe("Spec 011 ② documentation (Vojmapo Phase 4)", () => {
  it("the vojmapo names Spec 011 ②, the text area, the dialog and the Guidelines sentences", () => {
    const row = read("docs/vojmapo.md")
      .split("\n")
      .find((line) => line.startsWith("| 4 |"));
    expect(row).toContain("**Spec 011 ② (`tekstareo`, `dialogo`");
    expect(row).toContain("Make baut jeden Text über mehrere Zeilen aus dem Textbereich");
    expect(row).toContain("jede Rückfrage vor einer unumkehrbaren Aktion aus dem Dialog");
    expect(row).toContain("Spec 011 ② umgesetzt");
  });

  it("plan and tasks carry section ② with decisions, deviations, findings, coverage and red hashes", () => {
    const plan = read("specs/011-eroj-runde-2/plan.md");
    const tasks = read("specs/011-eroj-runde-2/tasks.md");
    const section = (text: string) =>
      text.slice(text.indexOf("## ② Eingabe"), text.indexOf("## ③ Rückmeldung"));
    for (const heading of [
      "### Zusammenfassung",
      "### Entwurfsentscheidungen",
      "### Arkitekturo-Abdeckung (E11)",
      "### Abweichungen von der Spec",
      "### Befunde / Mankoj",
      "### Offen (für den Maintainer)",
      "#### D-11 Web Component `fm-tekstareo`",
      "#### D-12 Web Component `fm-dialogo`",
    ]) {
      expect(section(plan)).toContain(heading);
    }
    expect(section(plan)).not.toContain("Folgt in PR ②.");
    expect(section(tasks)).toContain("### Messungen");
    for (const hash of ["1f386e5", "2a2a2f2"]) expect(section(tasks)).toContain(hash);
  });
});

// Spec 011 ③ (G9, acceptance 8): the Vojmapo names Spec 011 ③ in Phase 4; plan and tasks carry
// section ③ with its decisions, deviations, findings, the Arkitekturo coverage and the red hashes.
// After a rebase the hashes change: they stand in one row of tasks.md ③ and in the one loop below.
describe("Spec 011 ③ documentation (Vojmapo Phase 4)", () => {
  it("the vojmapo names Spec 011 ③, the badge, the notice, the state and the Guidelines sentences", () => {
    const row = read("docs/vojmapo.md")
      .split("\n")
      .find((line) => line.startsWith("| 4 |"));
    expect(row).toContain("**Spec 011 ③ (`insigno`, `avizo`, `plenstato`");
    expect(row).toContain("Make baut jeden Status in ein bis drei Wörtern aus dem Statusetikett");
    expect(row).toContain("jede Meldung im Fluss der Seite aus dem Hinweis");
    expect(row).toContain("jede ladende oder leere Fläche aus dem Lade- und Leerzustand");
    expect(row).toContain("Spec 011 ③ umgesetzt");
  });

  it("plan and tasks carry section ③ with decisions, deviations, findings, coverage and red hashes", () => {
    const plan = read("specs/011-eroj-runde-2/plan.md");
    const tasks = read("specs/011-eroj-runde-2/tasks.md");
    const section = (text: string) =>
      text.slice(text.indexOf("## ③ Rückmeldung"), text.indexOf("## ④ Daten"));
    for (const heading of [
      "### Zusammenfassung",
      "### Entwurfsentscheidungen",
      "### Arkitekturo-Abdeckung (E11)",
      "### Abweichungen von der Spec",
      "### Befunde / Mankoj",
      "### Offen (für den Maintainer)",
      "#### D-08 Web Component `fm-insigno`",
      "#### D-09 Web Component `fm-avizo`",
      "#### D-10 Web Component `fm-plenstato`",
    ]) {
      expect(section(plan)).toContain(heading);
    }
    expect(section(plan)).not.toContain("Folgt in PR ③.");
    expect(section(tasks)).toContain("### Messungen");
    for (const hash of ["e655fec", "29cbe9a"]) expect(section(tasks)).toContain(hash);
  });
});

// Spec 011 ④ (G9, acceptance 8): the Vojmapo names Spec 011 ④ in Phase 4; plan and tasks carry
// section ④ with its decisions, deviations, findings, the Arkitekturo coverage and the red hashes.
// After a rebase the hashes change: they stand in one row of tasks.md ④ and in the one loop below.
describe("Spec 011 ④ documentation (Vojmapo Phase 4)", () => {
  it("the vojmapo names Spec 011 ④, the table, the list, the meter and the Guidelines sentences", () => {
    const row = read("docs/vojmapo.md")
      .split("\n")
      .find((line) => line.startsWith("| 4 |"));
    expect(row).toContain("**Spec 011 ④ (`tabelo`, `atributlisto`, `mezurilo`");
    expect(row).toContain("Make baut jede Liste von Datensätzen aus der Datentabelle");
    expect(row).toContain("jeden Datensatz aus der Schlüssel-Wert-Liste");
    expect(row).toContain("jeden Wert in einem Bereich aus dem Messbalken");
    expect(row).toContain("Spec 011 ④ umgesetzt");
  });

  it("plan and tasks carry section ④ with decisions, deviations, findings, coverage and red hashes", () => {
    const plan = read("specs/011-eroj-runde-2/plan.md");
    const tasks = read("specs/011-eroj-runde-2/tasks.md");
    const section = (text: string) =>
      text.slice(text.indexOf("## ④ Daten"), text.indexOf("## ⑤ Navigation"));
    for (const heading of [
      "### Zusammenfassung",
      "### Entwurfsentscheidungen",
      "### Arkitekturo-Abdeckung (E11)",
      "### Abweichungen von der Spec",
      "### Befunde / Mankoj",
      "### Offen (für den Maintainer)",
      "#### D-08 Web Component `fm-mezurilo`",
      "#### D-09 Web Component `fm-tabelo`",
      "#### D-10 Web Component `fm-atributlisto`",
    ]) {
      expect(section(plan)).toContain(heading);
    }
    expect(section(plan)).not.toContain("Folgt in PR ④.");
    expect(section(tasks)).toContain("### Messungen");
    for (const hash of ["461acb0", "0c08f8f"]) expect(section(tasks)).toContain(hash);
  });
});

// Spec 011 ⑤ (G9, acceptance 8): the Vojmapo names Spec 011 ⑤ in Phase 4; plan and tasks carry
// section ⑤ with its decisions, deviations, findings, the Arkitekturo coverage and the red hashes.
// After a rebase the hashes change: they stand in one row of tasks.md ⑤ and in the one loop below.
describe("Spec 011 ⑤ documentation (Vojmapo Phase 4)", () => {
  it("the vojmapo names Spec 011 ⑤, the navigation, the tabs and the Guidelines sentences", () => {
    const row = read("docs/vojmapo.md")
      .split("\n")
      .find((line) => line.startsWith("| 4 |"));
    expect(row).toContain("**Spec 011 ⑤ (`navigado`, `langetaro`");
    expect(row).toContain("Make baut jede Hauptnavigation aus der Navigation um die nativen Links");
    expect(row).toContain("jeden Wechsel zwischen Ansichten derselben Sache aus den Reitern");
    expect(row).toContain("Spec 011 ⑤ umgesetzt");
    expect(row).toContain("Runde 2 der Eroj vollständig");
  });

  it("plan and tasks carry section ⑤ with decisions, deviations, findings, coverage and red hashes", () => {
    const plan = read("specs/011-eroj-runde-2/plan.md");
    const tasks = read("specs/011-eroj-runde-2/tasks.md");
    const section = (text: string) => text.slice(text.indexOf("## ⑤ Navigation"));
    for (const heading of [
      "### Zusammenfassung",
      "### Entwurfsentscheidungen",
      "### Arkitekturo-Abdeckung (E11)",
      "### Abweichungen von der Spec",
      "### Befunde / Mankoj",
      "### Offen (für den Maintainer)",
      "#### D-07 Web Component `fm-navigado`",
      "#### D-08 Web Component `fm-langetaro`",
    ]) {
      expect(section(plan)).toContain(heading);
    }
    expect(section(plan)).not.toContain("Folgt in PR ⑤.");
    expect(section(tasks)).toContain("### Messungen");
    for (const hash of ["f71d5dd", "d870af3"]) expect(section(tasks)).toContain(hash);
  });
});

// Nachlese 3 (Briefing 2026-10-17): specs/012-nachlese-3 carries the briefing unchanged, a plan
// and tasks with the red hashes; the Vojmapo names the Nachlese in Phase 4.
describe("Nachlese 3 documentation (specs/012-nachlese-3)", () => {
  it("the briefing is the one of 2026-10-17, unchanged; plan and tasks carry section ① with decisions, findings and red hashes", () => {
    const briefing = read("specs/012-nachlese-3/briefing.md");
    expect(briefing).toContain("# Briefing P0 – Nachlese 3 (nach Spec 011) – 2026-10-17");
    expect(briefing).toContain("**G1 – O-28: „Navigation“ führt zur navigado.**");
    const plan = read("specs/012-nachlese-3/plan.md");
    const tasks = read("specs/012-nachlese-3/tasks.md");
    const section = (text: string) =>
      text.slice(text.indexOf("## ① Gvidanto"), text.indexOf("## ② Werkzeuge"));
    for (const heading of [
      "### Zusammenfassung",
      "### Entwurfsentscheidungen",
      "#### D-01 G1",
      "#### D-02 G2",
      "#### D-03 G3",
      "#### D-04 G4",
      "### Abweichungen vom Briefing",
      "### Befunde / Mankoj",
      "### Offen (für den Maintainer)",
    ]) {
      expect(section(plan)).toContain(heading);
    }
    expect(section(plan)).toContain("brief");
    expect(section(tasks)).toContain("### Messungen");
    for (const hash of ["e3aeda4"]) expect(section(tasks)).toContain(hash);
    expect(read("docs/vojmapo.md")).toContain("Nachlese 3");
  });

  it("plan and tasks carry section ② with the six tools, the CI measurement and red hashes", () => {
    const plan = read("specs/012-nachlese-3/plan.md");
    const tasks = read("specs/012-nachlese-3/tasks.md");
    const section = (text: string) => text.slice(text.indexOf("## ② Werkzeuge"));
    for (const heading of [
      "### Zusammenfassung",
      "#### D-01 W1",
      "#### D-02 W2",
      "#### D-03 W3",
      "#### D-04 W4",
      "#### D-05 W5",
      "#### D-06 W6",
      "### Abweichungen vom Briefing",
      "### Befunde / Mankoj",
      "### Offen (für den Maintainer)",
    ]) {
      expect(section(plan)).toContain(heading);
    }
    expect(section(plan)).not.toContain("Folgt in PR ②.");
    expect(section(plan)).toMatch(/Run-Nummern|Run \d{11}/);
    expect(section(tasks)).toContain("### Messungen");
    for (const hash of ["ba6a705"]) expect(section(tasks)).toContain(hash);
  });
});

// Spec 014 (Briefing 2026-10-17): specs/014-eroj-runde-3 carries the spec unchanged, a plan and
// tasks with the five sections ① to ⑤; ① carries the overlay measurement as a table, the
// Arkitekturo coverage of the three extensions and the red hashes; the Vojmapo names it in Phase 4.
describe("Spec 014 documentation (specs/014-eroj-runde-3)", () => {
  it("the spec is the one of 2026-10-17, unchanged; plan and tasks carry ① to ⑤", () => {
    const spec = read("specs/014-eroj-runde-3/spec.md");
    expect(spec).toMatch(
      /^# Spec 014 – Eroj in der Breite, Runde 3: Grundbausteine, Typografie, Overlays, Aufklappen/,
    );
    expect(spec).toContain(
      "**E4 Namen:** `ikono`, `apartigilo`, `saltligilo`, `titolo`, `teksto`, `konsileto`, `sxvebilo`, `menuo`, `faldilo`, `kompletigilo`",
    );
    const plan = read("specs/014-eroj-runde-3/plan.md");
    const tasks = read("specs/014-eroj-runde-3/tasks.md");
    for (const text of [plan, tasks]) {
      for (const heading of [
        "## ① Grundlage",
        "## ② Grundbausteine",
        "## ③ Typografie",
        "## ④ Overlays",
        "## ⑤ Aufklappen",
      ]) {
        expect(text).toContain(heading);
      }
    }
  });

  it("plan ① carries the decisions, the overlay measurement, the Ikonaro list, the Arkitekturo coverage, deviations, findings and open points; tasks ① the red hashes", () => {
    const plan = read("specs/014-eroj-runde-3/plan.md");
    const tasks = read("specs/014-eroj-runde-3/tasks.md");
    const section = (text: string) =>
      text.slice(text.indexOf("## ① Grundlage"), text.indexOf("## ② Grundbausteine"));
    for (const heading of [
      "### Zusammenfassung",
      "### Entwurfsentscheidungen",
      "#### D-01",
      "#### D-02",
      "#### D-03",
      "#### D-04",
      "#### D-05",
      "#### D-06",
      "### Overlay-Messung",
      "### Arkitekturo-Abdeckung",
      "### Abweichungen von der Spec",
      "### Befunde / Mankoj",
      "### Offen (für den Maintainer)",
    ]) {
      expect(section(plan), heading).toContain(heading);
    }
    // The measurement of G4: Popover API and anchor positioning in the three engines, as a table.
    expect(section(plan)).toMatch(
      /\| Merkmal \| chromium [\d.]+ \| firefox [\d.]+ \| webkit [\d.]+ \|/,
    );
    expect(section(plan)).toContain("showPopover");
    expect(section(plan)).toContain("anchor-name");
    // The Ikonaro start set is listed in the plan (G3): every name with its need.
    expect(section(plan)).toContain("`chevron-right`");
    expect(section(plan)).toContain("`more`");
    // The three extensions stand on „trägt" in the coverage.
    for (const row of ["Gewicht", "reason-help", "layout"]) expect(section(plan)).toContain(row);
    expect(section(tasks)).toContain("### Messungen");
    expect(section(tasks)).toMatch(/rot `[0-9a-f]{7}`/);
    expect(read("docs/vojmapo.md")).toContain("Spec 014 ①");
  });
});

// Spec 014 ② (Briefing 2026-10-17): plan ② carries the decisions, the Arkitekturo coverage of the
// three Eroj, deviations, findings and open points; tasks ② the red hashes; the Vojmapo names ②.
describe("Spec 014 ② documentation (specs/014-eroj-runde-3)", () => {
  const section = (text: string) =>
    text.slice(text.indexOf("## ② Grundbausteine"), text.indexOf("## ③ Typografie"));

  it("plan ② carries the decisions, the coverage, deviations, findings and open points; tasks ② the red hashes", () => {
    const plan = section(read("specs/014-eroj-runde-3/plan.md"));
    for (const heading of [
      "### Zusammenfassung",
      "### Entwurfsentscheidungen",
      "#### D-01",
      "### Arkitekturo-Abdeckung",
      "### Abweichungen von der Spec",
      "### Befunde / Mankoj",
      "### Offen (für den Maintainer)",
    ]) {
      expect(plan, heading).toContain(heading);
    }
    for (const ero of ["ikono", "apartigilo", "saltligilo"]) expect(plan).toContain(`\`${ero}\``);
    // The spec's `target` is a web term; the Skemo says `to` (Art. VIII) — a deviation on record.
    expect(plan).toContain("`to`");
    // O-3 and O-5 of ① are closed here.
    expect(plan).toContain("O-3");
    expect(plan).toContain("O-5");
    const tasks = section(read("specs/014-eroj-runde-3/tasks.md"));
    expect(tasks).toContain("### Messungen");
    expect(tasks).toMatch(/rot `[0-9a-f]{7}`/);
    expect(read("docs/vojmapo.md")).toContain("Spec 014 ②");
  });
});

// Spec 014 ③ (Briefing 2026-10-17): plan ③ carries the decisions (the name of the rank axis of the
// teksto as a proposal), the Arkitekturo coverage, deviations, findings and open points; tasks ③
// the red hashes; the Vojmapo names ③.
describe("Spec 014 ③ documentation (specs/014-eroj-runde-3)", () => {
  const section = (text: string) =>
    text.slice(text.indexOf("## ③ Typografie"), text.indexOf("## ④ Overlays"));

  it("plan ③ carries the decisions, the coverage, deviations, findings and open points; tasks ③ the red hashes", () => {
    const plan = section(read("specs/014-eroj-runde-3/plan.md"));
    for (const heading of [
      "### Zusammenfassung",
      "### Entwurfsentscheidungen",
      "#### D-01",
      "### Arkitekturo-Abdeckung",
      "### Abweichungen von der Spec",
      "### Befunde / Mankoj",
      "### Offen (für den Maintainer)",
    ]) {
      expect(plan, heading).toContain(heading);
    }
    for (const ero of ["titolo", "teksto"]) expect(plan).toContain(`\`${ero}\``);
    // The name of the rank axis is a proposal the maintainer confirms (E2).
    expect(plan).toContain("`emphasis`");
    const tasks = section(read("specs/014-eroj-runde-3/tasks.md"));
    expect(tasks).toContain("### Messungen");
    expect(tasks).toMatch(/rot `[0-9a-f]{7}`/);
    expect(read("docs/vojmapo.md")).toContain("Spec 014 ③");
  });
});

// Spec 014 ④ (Briefing 2026-10-17): plan ④ carries the decisions (the overlays on the platform,
// the shadows bound in Figma), the Arkitekturo coverage, deviations, findings and open points;
// tasks ④ the red hashes; the Vojmapo names ④ and closes the finding of the unbound shadows.
describe("Spec 014 ④ documentation (specs/014-eroj-runde-3)", () => {
  const section = (text: string) =>
    text.slice(text.indexOf("## ④ Overlays"), text.indexOf("## ⑤ Aufklappen"));

  it("plan ④ carries the decisions, the coverage, deviations, findings and open points; tasks ④ the red hashes", () => {
    const plan = section(read("specs/014-eroj-runde-3/plan.md"));
    for (const heading of [
      "### Zusammenfassung",
      "### Entwurfsentscheidungen",
      "#### D-01",
      "### Arkitekturo-Abdeckung",
      "### Abweichungen von der Spec",
      "### Befunde / Mankoj",
      "### Offen (für den Maintainer)",
    ]) {
      expect(plan, heading).toContain(heading);
    }
    for (const ero of ["konsileto", "sxvebilo", "menuo"]) expect(plan).toContain(`\`${ero}\``);
    expect(plan).toContain("position-area");
    expect(plan).toContain("setBoundVariableForEffect");
    const tasks = section(read("specs/014-eroj-runde-3/tasks.md"));
    expect(tasks).toContain("### Messungen");
    expect(tasks).toMatch(/rot `[0-9a-f]{7}`/);
    const vojmapo = read("docs/vojmapo.md");
    expect(vojmapo).toContain("Spec 014 ④");
    expect(vojmapo).toContain(
      "~~Schattenvariablen in Figma sind angelegt, aber an keinen Effekt gebunden~~",
    );
  });
});

// Spec 014 ⑤ (Briefing 2026-10-17): plan ⑤ carries the decisions, the Arkitekturo coverage,
// deviations, findings and open points; tasks ⑤ the red hashes; the Vojmapo names ⑤.
describe("Spec 014 ⑤ documentation (specs/014-eroj-runde-3)", () => {
  const section = (text: string) => text.slice(text.indexOf("## ⑤ Aufklappen"));

  it("plan ⑤ carries the decisions, the coverage, deviations, findings and open points; tasks ⑤ the red hashes", () => {
    const plan = section(read("specs/014-eroj-runde-3/plan.md"));
    for (const heading of [
      "### Zusammenfassung",
      "### Entwurfsentscheidungen",
      "#### D-01",
      "### Arkitekturo-Abdeckung",
      "### Abweichungen von der Spec",
      "### Befunde / Mankoj",
      "### Offen (für den Maintainer)",
    ]) {
      expect(plan, heading).toContain(heading);
    }
    for (const ero of ["faldilo", "kompletigilo"]) expect(plan).toContain(`\`${ero}\``);
    expect(plan).toContain("aria-activedescendant");
    const tasks = section(read("specs/014-eroj-runde-3/tasks.md"));
    expect(tasks).toContain("### Messungen");
    expect(tasks).toMatch(/rot `[0-9a-f]{7}`/);
    expect(read("docs/vojmapo.md")).toContain("Spec 014 ⑤");
  });
});

// Spec 015 ① (Briefing 2026-10-17): specs/015-eroj-runde-4 carries the spec unchanged, a plan and
// tasks with the three sections ① to ③; plan ① carries the decisions, the Arkitekturo coverage,
// deviations, findings and open points; tasks ① the red hashes; the Vojmapo names ①.
describe("Spec 015 ① documentation (specs/015-eroj-runde-4)", () => {
  it("the spec is the one of 2026-10-17, unchanged; plan and tasks carry ① to ③", () => {
    const spec = read("specs/015-eroj-runde-4/spec.md");
    expect(spec).toMatch(
      /^# Spec 015 – Eroj in der Breite, Runde 4: Blättern, Pfad, Hochladen, Karte, Avatar/,
    );
    expect(spec).toContain("**E4 Namen:** `pagxigilo`, `spuro`, `alsxutilo`, `karto`, `avataro`.");
    const plan = read("specs/015-eroj-runde-4/plan.md");
    const tasks = read("specs/015-eroj-runde-4/tasks.md");
    for (const text of [plan, tasks]) {
      for (const heading of ["## ① Navigation", "## ② Eingabe", "## ③ Inhalt"]) {
        expect(text).toContain(heading);
      }
    }
  });

  it("plan ① carries the decisions, the coverage, deviations, findings and open points; tasks ① the red hashes", () => {
    const section = (text: string) =>
      text.slice(text.indexOf("## ① Navigation"), text.indexOf("## ② Eingabe"));
    const plan = section(read("specs/015-eroj-runde-4/plan.md"));
    for (const heading of [
      "### Zusammenfassung",
      "### Entwurfsentscheidungen",
      "#### D-01",
      "#### D-02",
      "### Arkitekturo-Abdeckung",
      "### Abweichungen von der Spec",
      "### Befunde / Mankoj",
      "### Offen (für den Maintainer)",
    ]) {
      expect(plan, heading).toContain(heading);
    }
    for (const ero of ["pagxigilo", "spuro"]) expect(plan).toContain(`\`${ero}\``);
    // The name of the landmark of the spuro is a proposal (the spec: P0 proposes, the maintainer confirms).
    expect(plan).toContain("Pfad");
    expect(plan).toContain("`chevron-left`");
    const tasks = section(read("specs/015-eroj-runde-4/tasks.md"));
    expect(tasks).toContain("### Messungen");
    expect(tasks).toMatch(/rot `[0-9a-f]{7}`/);
    expect(read("docs/vojmapo.md")).toContain("Spec 015 ①");
  });
});

// Spec 015 ② (Briefing 2026-10-18): plan ② carries the CI split (D-01, D-02) and the alsxutilo —
// its decisions from D-03 on, the Arkitekturo coverage, deviations, findings and open points;
// tasks ② the red hash of the alsxutilo; the Vojmapo names ②; the README counts thirty elements.
describe("Spec 015 ② documentation (specs/015-eroj-runde-4)", () => {
  it("plan ② carries the decisions, the coverage, deviations, findings and open points; tasks ② the red hash of the alsxutilo", () => {
    const section = (text: string) =>
      text.slice(text.indexOf("## ② Eingabe"), text.indexOf("## ③ Inhalt"));
    const plan = section(read("specs/015-eroj-runde-4/plan.md"));
    for (const heading of [
      "### Zusammenfassung",
      "### Entwurfsentscheidungen",
      "#### D-01",
      "#### D-02",
      "#### D-03",
      "### Arkitekturo-Abdeckung",
      "### Abweichungen von der Spec",
      "### Befunde / Mankoj",
      "### Offen (für den Maintainer)",
    ]) {
      expect(plan, heading).toContain(heading);
    }
    for (const word of ["`alsxutilo`", "`file-constraints-stated`", "`upload`", "O-6"]) {
      expect(plan).toContain(word);
    }
    expect(plan).not.toContain("(folgen mit `alsxutilo`)");
    const tasks = section(read("specs/015-eroj-runde-4/tasks.md"));
    expect(tasks).toContain("**T1303");
    expect(tasks).toMatch(/alsxutilo rot `[0-9a-f]{7}`/);
    expect(read("docs/vojmapo.md")).toContain("Spec 015 ②");
    // Spec 015 ③ counts on (thirty-one with the karto, thirty-two with the avataro).
    expect(read("README.md")).toMatch(/thirty(-one|-two|-four|-five|-six)?|forty `fm-\*` elements/);
  });
});

// Spec 015 ③ (Briefing 2026-10-17, Auftrag 2026-10-18): plan ③ carries the card, the avatar and
// the toast as a boundary — its decisions, the Arkitekturo coverage, deviations, findings and open
// points from O-15 on; tasks ③ the red and green hashes of each; the Vojmapo names ③ and closes
// round 4; the README counts thirty-two elements.
describe("Spec 015 ③ documentation (specs/015-eroj-runde-4)", () => {
  it("plan ③ carries the decisions, the coverage, deviations, findings and open points; tasks ③ the hashes", () => {
    const plan = read("specs/015-eroj-runde-4/plan.md");
    const section = plan.slice(plan.indexOf("## ③ Inhalt"));
    for (const heading of [
      "### Zusammenfassung",
      "### Entwurfsentscheidungen",
      "#### D-01",
      "### Arkitekturo-Abdeckung",
      "### Abweichungen von der Spec",
      "### Befunde / Mankoj",
      "### Offen (für den Maintainer)",
    ]) {
      expect(section, heading).toContain(heading);
    }
    for (const word of ["`karto`", "`avataro`", "`avizo.boundary.toast`", "O-15", "E6", "E8"]) {
      expect(section).toContain(word);
    }
    expect(section).not.toContain("Folgt in PR ③.");
    const tasks = read("specs/015-eroj-runde-4/tasks.md");
    const own = tasks.slice(tasks.indexOf("## ③ Inhalt"));
    expect(own).toContain("**T1401");
    expect(own).toMatch(/karto rot `[0-9a-f]{7}`/);
    expect(own).toMatch(/avataro rot `[0-9a-f]{7}`/);
    expect(own).toMatch(/Toast rot `[0-9a-f]{7}`/);
    expect(read("docs/vojmapo.md")).toContain("Spec 015 ③");
    expect(read("docs/vojmapo.md")).toContain("Runde 4 der Eroj vollständig");
    // Spec 020 ③: thirty-four with the kodbloko and the markdovido.
    expect(read("README.md")).toContain("forty `fm-*` elements");
  });
});

// Nachlese 4 (Briefing 2026-10-18): specs/017-nachlese-4 carries the briefing unchanged, a plan
// with a decision per point N-1 to N-9 and the dialogs before/after, and tasks with the red
// hashes; the Vojmapo names the resolution of its Nachlese-4 rows.
describe("Nachlese 4 documentation (specs/017-nachlese-4)", () => {
  it("the briefing is the one of 2026-10-18, unchanged; plan and tasks carry N-1 to N-9", () => {
    const briefing = read("specs/017-nachlese-4/briefing.md");
    expect(briefing).toContain("# Briefing P0 – Nachlese 4 (nach Spec 014/015) – 2026-10-18");
    expect(briefing).toContain("**N-1 (O-18):**");
    const plan = read("specs/017-nachlese-4/plan.md");
    for (const heading of [
      "### Zusammenfassung",
      "### Entwurfsentscheidungen",
      "### Dialoge vorher/nachher",
      "### Abweichungen vom Briefing",
      "### Befunde / Mankoj",
      "### Offen (für den Maintainer)",
      "### In Figma zu messen",
    ]) {
      expect(plan, heading).toContain(heading);
    }
    for (const point of ["N-1", "N-2", "N-3", "N-4", "N-5", "N-6", "N-7", "N-8", "N-9"]) {
      expect(plan, point).toMatch(new RegExp(`#### D-\\d{2} ${point}\\b`));
    }
    const tasks = read("specs/017-nachlese-4/tasks.md");
    expect(tasks).toContain("### Messungen");
    expect(tasks).toMatch(/rot `[0-9a-f]{7}`/);
    expect(read("docs/vojmapo.md")).toContain("Erledigt mit Nachlese 4");
  });
});

// Spec 016 ① (Briefing 2026-10-18): specs/016-agordilo-1 carries the spec unchanged, a plan and
// tasks with the three sections ① to ③; plan ① carries the decisions, the coverage, deviations,
// findings, open points (the names Agordo and Raporto among them) and the measurements M1 and M2;
// tasks ① the red hash; the README names the two Agordilo commands.
describe("Spec 016 ① documentation (specs/016-agordilo-1)", () => {
  it("the spec is the one of 2026-10-17, unchanged; plan and tasks carry ① to ③", () => {
    const spec = read("specs/016-agordilo-1/spec.md");
    expect(spec).toMatch(
      /^# Spec 016 – Agordilo Stufe 1 \(Werkstatt\): Marke aus Farbe und Kontrast/,
    );
    expect(spec).toContain("**E8** ciferecigo erscheint nirgends.");
    const plan = read("specs/016-agordilo-1/plan.md");
    const tasks = read("specs/016-agordilo-1/tasks.md");
    for (const text of [plan, tasks]) {
      for (const heading of ["## ① Bibliothek", "## ② Werkstatt", "## ③ Gvidanto und Doku"]) {
        expect(text).toContain(heading);
      }
    }
  });

  it("plan ① carries decisions, coverage, deviations, findings, open points and M1/M2; tasks ① the red hash", () => {
    const section = (text: string) =>
      text.slice(text.indexOf("## ① Bibliothek"), text.indexOf("## ② Werkstatt"));
    const plan = section(read("specs/016-agordilo-1/plan.md"));
    for (const heading of [
      "### Zusammenfassung",
      "### Entwurfsentscheidungen",
      "#### D-01",
      "#### D-02",
      "### Arkitekturo-Abdeckung",
      "### Abweichungen von der Spec",
      "### Befunde / Mankoj",
      "### Offen (für den Maintainer)",
      "### M1",
      "### M2",
    ]) {
      expect(plan, heading).toContain(heading);
    }
    for (const term of ["Agordo", "Raporto", "`provo`", "kontrastSojloj"]) {
      expect(plan, term).toContain(term);
    }
    const tasks = section(read("specs/016-agordilo-1/tasks.md"));
    expect(tasks).toContain("### Messungen");
    expect(tasks).toMatch(/rot `[0-9a-f]{7}`/);
    const readme = read("README.md");
    expect(readme).toContain("fm agordilo derive");
    expect(readme).toContain("fm agordilo check");
  });
});

// Spec 016 ② (Briefing 2026-10-19): plan ② carries the Werkstatt — its decisions, the coverage,
// deviations, findings, open points and the measurement M3 (median and p95 over 50 changes, in
// the CI browser and as a guide for the maintainer); tasks ② start at T1701 with the red hash.
describe("Spec 016 ② documentation (specs/016-agordilo-1)", () => {
  it("plan ② carries decisions, coverage, deviations, findings, open points and M3; tasks ② the red hash", () => {
    const section = (text: string) =>
      text.slice(text.indexOf("## ② Werkstatt"), text.indexOf("## ③ Gvidanto und Doku"));
    const plan = section(read("specs/016-agordilo-1/plan.md"));
    expect(plan).not.toContain("Folgt in PR ②.");
    for (const heading of [
      "### Zusammenfassung",
      "### Entwurfsentscheidungen",
      "#### D-01",
      "#### D-02",
      "### Arkitekturo-Abdeckung",
      "### Abweichungen von der Spec",
      "### Befunde / Mankoj",
      "### Offen (für den Maintainer)",
      "### M3",
    ]) {
      expect(plan, heading).toContain(heading);
    }
    for (const term of [
      "modus=werkstatt",
      "#agordo=",
      "fm-vitrino-werkstatt",
      "input type=range",
      "ziele",
      "entprellt",
      "Median",
      "p95",
      "Gleichheit",
      "Mac",
    ]) {
      expect(plan, term).toContain(term);
    }
    const tasks = section(read("specs/016-agordilo-1/tasks.md"));
    expect(tasks).not.toContain("Folgt in PR ②.");
    expect(tasks).toContain("**T1701");
    expect(tasks).toContain("### Messungen");
    expect(tasks).toMatch(/rot `[0-9a-f]{7}`/);
    const readme = read("README.md");
    expect(readme).toContain("Werkstatt");
    expect(readme).toContain("#modus=werkstatt");
  });
});

// Spec 016 ③ (Briefing 2026-10-19): plan ③ carries preview_agordo, the Ontologio, the README
// section, Figma with provo and the measuring guide for the acceptance 1–6 with full paths; tasks ③
// start at T1801 with the red hash; the README has "Eine Marke in fünf Minuten" and names
// preview_agordo; the Vojmapo marks stage 1 of the Werkstatt done and keeps the old order.
describe("Spec 016 ③ documentation (specs/016-agordilo-1)", () => {
  it("plan ③ carries decisions, deviations, findings, open points and the measuring guide; tasks ③ the red hash", () => {
    const plan = read("specs/016-agordilo-1/plan.md");
    const third = plan.slice(plan.indexOf("## ③ Gvidanto und Doku"));
    expect(third).not.toContain("Folgt in PR ③.");
    for (const heading of [
      "### Zusammenfassung",
      "### Entwurfsentscheidungen",
      "#### D-01",
      "### Abweichungen von der Spec",
      "### Befunde / Mankoj",
      "### Offen (für den Maintainer)",
      "### Messanleitung (Abnahme 1–6)",
      "### In Figma zu messen",
    ]) {
      expect(third, heading).toContain(heading);
    }
    for (const word of [
      "preview_agordo",
      "#F5C400",
      "fundamento.tri.config.json",
      "pnpm fm projekcioj build --config packages/modelo/test/fixtures/valid/aspekto-provo/fundamento.tri.config.json",
      "pnpm fm agordilo derive",
      "pnpm fm modelo validate --aspekto",
      "pnpm check:alirebleco",
      "pnpm check:parity",
      "#modus=werkstatt",
      "agordo=",
      "Agordo",
      "Raporto",
    ]) {
      expect(third, word).toContain(word);
    }
    const tasks = read("specs/016-agordilo-1/tasks.md");
    const tasksThird = tasks.slice(tasks.indexOf("## ③ Gvidanto und Doku"));
    expect(tasksThird).not.toContain("Folgt in PR ③.");
    expect(tasksThird).toContain("**T1801");
    expect(tasksThird).toContain("### Messungen");
    expect(tasksThird).toMatch(/rot `[0-9a-f]{7}`/);
  });

  it("the README has the section Eine Marke in fünf Minuten with every path and command, and names preview_agordo", () => {
    const readme = read("README.md");
    const five = section(readme, "Eine Marke in fünf Minuten");
    expect(five.length).toBeGreaterThan(400);
    for (const word of [
      "pnpm install",
      "pnpm build",
      "pnpm fm projekcioj build --out .fundamento/projekcioj",
      ".fundamento/projekcioj/vitrino/index.html#modus=werkstatt",
      "Agordo herunterladen",
      "pnpm fm agordilo derive",
      "--out",
      "pnpm fm agordilo check",
      "fundamento.config.json",
      "pnpm fm modelo validate --config",
      "raporto.md",
    ]) {
      expect(five, word).toContain(word);
    }
    expect(section(readme, "MCP server")).toContain("`preview_agordo`");
  });

  it("the Vojmapo marks Werkstatt stage 1 done, gives the new order and keeps the old one", () => {
    const vojmapo = read("docs/vojmapo.md");
    const phase7 = vojmapo.split("\n").find((line) => line.startsWith("| 7 |")) ?? "";
    expect(phase7).toContain("Werkstatt Stufe 1");
    expect(phase7).toContain("[016](../specs/016-agordilo-1/)");
    expect(phase7).toContain("Stand vorher");
    expect(vojmapo).toContain("## Reihenfolge (Stand 2026-10-19)");
    expect(vojmapo).toContain("### Reihenfolge vorher (Stand 2026-10-17, Konservierung)");
    for (const word of ["Spec 019", "8b", "Sxablonoj"]) expect(vojmapo, word).toContain(word);
  });
});

// Nachlese 6 (Spec 019 ④, Briefing 2026-10-20): a branch of its own from main; plan and tasks in
// specs/019-werkstatt-2-3/nachlese-6 (beside the plan of ① to ③, which are stacked). The plan
// carries the four items N6-1 to N6-4, the sizes before and after with every cause named, the
// decisions, deviations, findings and open points; tasks start at T1961 with the red hash; the
// README names check:alirebleco --aspekto.
describe("Nachlese 6 documentation (specs/019-werkstatt-2-3/nachlese-6)", () => {
  it("plan carries N6-1 to N6-4, the sizes with their causes and the open points; tasks the red hash", () => {
    const plan = read("specs/019-werkstatt-2-3/nachlese-6/plan.md");
    for (const heading of [
      "# Spec 019 ④ – Nachlese 6",
      "### Zusammenfassung",
      "### Entwurfsentscheidungen",
      "### Abweichungen von der Spec",
      "### Befunde / Mankoj",
      "### Offen (für den Maintainer)",
      "### Größen",
    ]) {
      expect(plan, heading).toContain(heading);
    }
    for (const term of [
      "N6-1",
      "N6-2",
      "N6-3",
      "N6-4",
      "kind",
      "--aspekto",
      "vorher",
      "nachher",
      "Landkarten",
      "element.cjs",
    ]) {
      expect(plan, term).toContain(term);
    }
    expect(plan).not.toContain("ciferecigo");
    const tasks = read("specs/019-werkstatt-2-3/nachlese-6/tasks.md");
    expect(tasks).toContain("**T1961");
    expect(tasks).toContain("### Messungen");
    expect(tasks).toMatch(/rot `[0-9a-f]{7}`/);
    expect(read("README.md")).toContain("check:alirebleco --aspekto");
  });
});

// Nachlese 5 (Briefing 2026-10-19): specs/018-nachlese-5 carries the briefing unchanged, a plan
// and tasks with ① (the split of plugin.test.ts, the flaky tests) and ② (the findings).
describe("Nachlese 5 documentation (specs/018-nachlese-5)", () => {
  it("the briefing is the one of 2026-10-19, unchanged; plan ① carries the split and the flaky tests", () => {
    const briefing = read("specs/018-nachlese-5/briefing.md");
    expect(briefing).toContain(
      "# Briefing P0 – Nachlese 5 (nach Spec 015, 016 ① und Nachlese 4) – 2026-10-19",
    );
    const plan = read("specs/018-nachlese-5/plan.md");
    for (const heading of [
      "## ① CI",
      "### Zusammenfassung",
      "### Entwurfsentscheidungen",
      "### Abweichungen vom Briefing",
      "### Befunde / Mankoj",
      "### Offen (für den Maintainer)",
      "## ② Befunde",
    ]) {
      expect(plan, heading).toContain(heading);
    }
    for (const word of ["plugin-test-helpers.ts", "sxvebilo.spec.ts:53", "716"]) {
      expect(plan, word).toContain(word);
    }
    const tasks = read("specs/018-nachlese-5/tasks.md");
    expect(tasks).toContain("### Messungen");
    expect(tasks).toMatch(/rot `[0-9a-f]{7}`/);
  });

  it("plan ② carries the findings, the dialogs before and after, and what Figma has to measure; tasks ② start at T1901", () => {
    const plan = read("specs/018-nachlese-5/plan.md");
    const second = plan.slice(plan.indexOf("## ② Befunde"));
    expect(second).not.toContain("Folgt in PR ②.");
    for (const heading of [
      "### Zusammenfassung",
      "### Entwurfsentscheidungen",
      "### Dialoge vorher/nachher",
      "### Abweichungen vom Briefing",
      "### Befunde / Mankoj",
      "### Offen (für den Maintainer)",
      "### In Figma zu messen",
    ]) {
      expect(second, heading).toContain(heading);
    }
    for (const word of [
      "N5-1",
      "N5-2",
      "N5-3",
      "N5-4",
      "N5-5",
      "N5-6",
      "O-10",
      "O-14",
      "O-17",
      "O-39",
      "O-41",
      "**B-3",
      "**O-2",
      "Karte für ein Projekt mit Bild und Titel",
      "Projektkarten",
      "jug_",
    ]) {
      expect(second, word).toContain(word);
    }
    const tasks = read("specs/018-nachlese-5/tasks.md");
    const tasksSecond = tasks.slice(tasks.indexOf("## ② Befunde"));
    expect(tasksSecond).not.toContain("Folgt in PR ②.");
    expect(tasksSecond).toContain("**T1901");
    expect(tasksSecond).toContain("### Messungen");
    expect(tasksSecond).toMatch(/rot `[0-9a-f]{7}`/);
    expect(tasksSecond).toMatch(/grün `[0-9a-f]{7}`/);
  });

  // Nachlese 5 ③ (Auftrag 2026-10-19): the release path for 0.1.0 — a section of this plan, no
  // spec folder of its own.
  it("plan ③ carries the release path for 0.1.0: kitVersion, the dist-tag from the version, what stays open; tasks ③ start at T2001", () => {
    const plan = read("specs/018-nachlese-5/plan.md");
    const third = plan.slice(plan.indexOf("## ③ Release-Weg 0.1.0"));
    expect(third.length).toBeGreaterThan(0);
    for (const heading of [
      "### Zusammenfassung",
      "### Entwurfsentscheidungen",
      "### Abweichungen vom Auftrag",
      "### Befunde / Mankoj",
      "### Offen (für den Maintainer)",
    ]) {
      expect(third, heading).toContain(heading);
    }
    for (const word of [
      "kitVersion",
      "command_for",
      "`latest`",
      "`next`",
      "0.1.0-next.9",
      "0.2.0",
      "0.1.0.1",
      "Trusted Publishing",
      "make-kit-komuna",
      "make-kit-ekzemplo",
    ]) {
      expect(third, word).toContain(word);
    }
    const tasks = read("specs/018-nachlese-5/tasks.md");
    const tasksThird = tasks.slice(tasks.indexOf("## ③ Release-Weg 0.1.0"));
    expect(tasksThird.length).toBeGreaterThan(0);
    expect(tasksThird).toContain("**T2001");
    expect(tasksThird).toContain("### Messungen");
    expect(tasksThird).toMatch(/rot `[0-9a-f]{7}`/);
    expect(tasksThird).toMatch(/grün `[0-9a-f]{7}`/);
  });
});

// Spec 019 ① (Briefing 2026-10-20): specs/019-werkstatt-2-3 carries the spec unchanged, a plan and
// tasks with the four sections ① to ④ (④ is Nachlese 6, a branch of its own from main); plan ①
// carries the decisions, the coverage, deviations, findings, the Regulo candidates (hints instead
// of new Reguloj, E2), open points and the measurement M4; tasks ① start at T1901 with the red
// hash; the README names the fields of stage 2.
describe("Spec 019 ① documentation (specs/019-werkstatt-2-3)", () => {
  const SPEC_019_SHA256 = "15353c7f24f8e681a83be6b2cb9bd0dccebf1bb3c901fd4bcb6e364d37b7333e";
  const HEADINGS = [
    "## ① Bibliothek Stufe 2",
    "## ② Werkstatt Stufe 2",
    "## ③ Prompt (Stufe 3)",
    "## ④ Nachlese 6",
  ];

  it("the spec is the one of 2026-10-20, unchanged; plan and tasks carry ① to ④", () => {
    const spec = read("specs/019-werkstatt-2-3/spec.md");
    expect(createHash("sha256").update(spec).digest("hex")).toBe(SPEC_019_SHA256);
    expect(spec).toMatch(/^# Spec 019 – Werkstatt Stufe 2\+3/);
    for (const file of ["plan.md", "tasks.md"]) {
      const text = read(`specs/019-werkstatt-2-3/${file}`);
      for (const heading of HEADINGS) expect(text, `${file}: ${heading}`).toContain(heading);
    }
  });

  it("plan ① carries decisions, coverage, deviations, findings, Regulo candidates, open points and M4; tasks ① the red hash", () => {
    const section = (text: string) =>
      text.slice(text.indexOf("## ① Bibliothek Stufe 2"), text.indexOf("## ② Werkstatt Stufe 2"));
    const plan = section(read("specs/019-werkstatt-2-3/plan.md"));
    for (const heading of [
      "### Zusammenfassung",
      "### Entwurfsentscheidungen",
      "#### D-01",
      "#### D-02",
      "### Arkitekturo-Abdeckung",
      "### Abweichungen von der Spec",
      "### Befunde / Mankoj",
      "### Regulo-Kandidaten",
      "### Offen (für den Maintainer)",
      "### M4",
    ]) {
      expect(plan, heading).toContain(heading);
    }
    for (const term of [
      "form.radius",
      "raum.abstand",
      "schrift.skala",
      "ikono.gewicht",
      "size.target",
      "bytegleich",
      "`provo-kompakta`",
      "Hinweis",
      "type-scale",
    ]) {
      expect(plan, term).toContain(term);
    }
    expect(plan).not.toContain("ciferecigo");
    const tasks = section(read("specs/019-werkstatt-2-3/tasks.md"));
    expect(tasks).toContain("**T1901");
    expect(tasks).toContain("### Messungen");
    expect(tasks).toMatch(/rot `[0-9a-f]{7}`/);
    const readme = read("README.md");
    for (const field of ["form.radius", "raum.hoehe", "schrift.gewicht", "ikono.gewicht"]) {
      expect(readme, field).toContain(field);
    }
  });
});

// Spec 019 ② (Briefing 2026-10-20): plan ② carries the Werkstatt of stage 2 — the panel G7, the
// check without stalling G5 (a worker or a check in slices), the history, the suggestion bar for
// links of propose_agordo and the measurement M5 (median and p95, the longest block of the main
// thread, in the CI browser and as a guide for the Mac); tasks ② start at T1921 with the red hash.
describe("Spec 019 ② documentation (specs/019-werkstatt-2-3)", () => {
  it("plan ② carries decisions, coverage, deviations, findings, open points and M5; tasks ② the red hash", () => {
    const section = (text: string) =>
      text.slice(text.indexOf("## ② Werkstatt Stufe 2"), text.indexOf("## ③ Prompt (Stufe 3)"));
    const plan = section(read("specs/019-werkstatt-2-3/plan.md"));
    expect(plan).not.toContain("Folgt in PR ②.");
    for (const heading of [
      "### Zusammenfassung",
      "### Entwurfsentscheidungen",
      "#### D-01",
      "### Arkitekturo-Abdeckung",
      "### Abweichungen von der Spec",
      "### Befunde / Mankoj",
      "### Offen (für den Maintainer)",
      "### M5",
    ]) {
      expect(plan, heading).toContain(heading);
    }
    for (const term of [
      "Worker",
      "Long Task",
      "50 ms",
      "Vorschlags-Leiste",
      "vorschlag=",
      "Rückgängig",
      "fm-faldilo",
      "input type=range",
      "Median",
      "p95",
      "Mac",
      "`provo-kompakta`",
    ]) {
      expect(plan, term).toContain(term);
    }
    const tasks = section(read("specs/019-werkstatt-2-3/tasks.md"));
    expect(tasks).not.toContain("Folgt in PR ②.");
    expect(tasks).toContain("**T1921");
    expect(tasks).toContain("### Messungen");
    expect(tasks).toMatch(/rot `[0-9a-f]{7}`/);
    const readme = read("README.md");
    expect(readme).toContain("vorschlag=");
    expect(readme).toContain("Form, Raum, Schrift");
  });
});

// Spec 019 ③ (Briefing 2026-10-20): plan ③ carries the prompt as a control — propose_agordo,
// save_agordo, the wish vocabulary, historio — and the measuring guide for the acceptance with full
// paths in the maintainer's checkout (links always with file://, the Werkstatt links for provo and
// provo-kompakta, the dialog in Claude with the command to connect the server, the CLI, the Figma run
// with both example brands); tasks ③ start at T1941 with the red hash; the README has „Die Marke per
// Prompt formen“; the Vojmapo marks stage 2+3.
describe("Spec 019 ③ documentation (specs/019-werkstatt-2-3)", () => {
  it("plan ③ carries decisions, deviations, findings, open points and the measuring guide; tasks ③ the red hash", () => {
    const plan = read("specs/019-werkstatt-2-3/plan.md");
    const section = plan.slice(
      plan.indexOf("## ③ Prompt (Stufe 3)"),
      plan.indexOf("## ④ Nachlese 6"),
    );
    expect(section).not.toContain("Folgt in PR ③.");
    for (const heading of [
      "### Zusammenfassung",
      "### Entwurfsentscheidungen",
      "#### D-01",
      "### Abweichungen von der Spec",
      "### Befunde / Mankoj",
      "### Offen (für den Maintainer)",
      "### Messanleitung",
      "### In Figma zu messen",
    ]) {
      expect(section, heading).toContain(heading);
    }
    for (const term of [
      "propose_agordo",
      "save_agordo",
      "wuensche.json",
      "historio",
      "ask-human",
      'open "file:///Users/thorstenjankowski/n8n-compose/20260918_fundamento-ds/.fundamento/projekcioj/vitrino/index.html#modus=werkstatt',
      "provo-kompakta",
      "claude mcp add",
      "fundamento.provoj.config.json",
      "Version",
      "wiederherstellen",
      "Deziraro",
    ]) {
      expect(section, term).toContain(term);
    }
    // Links into the Vitrino always with file:// (macOS reads the fragment as part of the name otherwise).
    for (const line of section
      .split("\n")
      .filter((entry) => entry.includes("vitrino/index.html#"))) {
      expect(line, line).toMatch(/file:\/\/\/Users\//);
    }
    expect(section).not.toContain("ciferecigo");
    const tasks = read("specs/019-werkstatt-2-3/tasks.md");
    const own = tasks.slice(
      tasks.indexOf("## ③ Prompt (Stufe 3)"),
      tasks.indexOf("## ④ Nachlese 6"),
    );
    expect(own).toContain("**T1941");
    expect(own).toMatch(/rot `[0-9a-f]{7}`/);
    const readme = read("README.md");
    expect(readme).toContain("Die Marke per Prompt formen");
    expect(readme).toContain("`propose_agordo`");
    expect(readme).toContain("`save_agordo`");
    const vojmapo = read("docs/vojmapo.md");
    expect(vojmapo).toContain("Werkstatt Stufe 2+3");
    expect(vojmapo).toContain("[019](../specs/019-werkstatt-2-3/)");
  });
});

// Nachtrag 20.10. (Entscheidungen des Maintainers, 2026-10-20): one PR from main with the upper
// bound 1.25 of schrift.skala, the step −0.05 of ruhiger on the contrast, the CHANGELOG entry
// „0.2.0 – geplant“ for the Make Kit without CJS and the confirmed names; recorded as a section
// „Nachtrag 20.10.“ in plan ①, plan ③ and nachlese-6/plan.md.
describe("Spec 019 Nachtrag 20.10. documentation", () => {
  it("plan ① and ③ and the plan of Nachlese 6 carry the Nachtrag; the CHANGELOG plans 0.2.0", () => {
    const plan = read("specs/019-werkstatt-2-3/plan.md");
    const first = plan.slice(
      plan.indexOf("## ① Bibliothek Stufe 2"),
      plan.indexOf("## ② Werkstatt Stufe 2"),
    );
    const third = plan.slice(
      plan.indexOf("## ③ Prompt (Stufe 3)"),
      plan.indexOf("## ④ Nachlese 6"),
    );
    for (const [label, text] of [
      ["①", first],
      ["③", third],
    ] as const) {
      expect(text, label).toContain("### Nachtrag 20.10.");
    }
    expect(first).toContain("neu gemessen mit Obergrenze 1,25");
    expect(first).toMatch(/1,125–1,25/);
    expect(third).toMatch(/Kontrast 0,1 → 0,0\b/);
    expect(third).toContain("Kontrast 0,1 → 0,05");
    const n6 = read("specs/019-werkstatt-2-3/nachlese-6/plan.md");
    expect(n6).toContain("### Nachtrag 20.10.");
    const changelog = read("CHANGELOG.md");
    // Nachlese 8 ①: the planned 0.2.0 is the release now (decision a of the maintainer).
    expect(changelog).toContain("## 0.2.0");
    expect(changelog).toContain(
      "Breaking: Das Make Kit liefert nur noch ESM. `require()` braucht Node ≥ 22.12.",
    );
    expect(read("README.md")).not.toMatch(/Kontrast 0,1 → 0,0[^5]/);
  });
});

// Nachlese 7 ① (Briefing 2026-10-20): specs/021-nachlese-7 carries the briefing unchanged, a plan
// and tasks with ① (the faults, 0.1.1) and ② (the additions, 0.2.0); plan ① has the found patterns,
// the measuring guide with full paths and the release steps; the CHANGELOG has 0.1.1 with A-1 to A-7.
describe("Nachlese 7 ① documentation (specs/021-nachlese-7)", () => {
  it("the briefing is copied unchanged; plan ① carries the faults, the patterns and the guide; the CHANGELOG 0.1.1", () => {
    const briefing = read("specs/021-nachlese-7/briefing.md");
    expect(createHash("sha256").update(briefing).digest("hex")).toBe(
      "6fcf096a5146e1e9eb06bb2613ee5fb231249a12cdcbdc4b18720223241cd2be",
    );
    const plan = read("specs/021-nachlese-7/plan.md");
    const tasks = read("specs/021-nachlese-7/tasks.md");
    for (const text of [plan, tasks]) {
      expect(text).toContain("## ① Fehler (0.1.1)");
      expect(text).toContain("## ② Ergänzungen (0.2.0)");
    }
    const first = plan.slice(
      plan.indexOf("## ① Fehler (0.1.1)"),
      plan.indexOf("## ② Ergänzungen (0.2.0)"),
    );
    for (const heading of [
      "### Zusammenfassung",
      "### Entwurfsentscheidungen",
      "### Gefundene Muster",
      "### Abweichungen",
      "### Befunde / Mankoj",
      "### Offen (für den Maintainer)",
      "### Messanleitung",
    ]) {
      expect(first, heading).toContain(heading);
    }
    for (const term of [
      "A-1",
      "A-2",
      "A-3",
      "A-4",
      "A-5",
      "A-6",
      "A-7",
      "0.1.1",
      "release.yml",
      "dry-run",
      "file:///Users/thorstenjankowski/n8n-compose/20260918_fundamento-ds/",
    ]) {
      expect(first, term).toContain(term);
    }
    for (const line of first.split("\n").filter((entry) => entry.includes("vitrino/index.html#"))) {
      expect(line, line).toMatch(/file:\/\/\/Users\//);
    }
    expect(first).not.toContain("ciferecigo");
    const own = tasks.slice(
      tasks.indexOf("## ① Fehler (0.1.1)"),
      tasks.indexOf("## ② Ergänzungen (0.2.0)"),
    );
    expect(own).toContain("**T2101");
    expect(own).toMatch(/rot `[0-9a-f]{7}`/);
    const changelog = read("CHANGELOG.md");
    // Nachlese 8 ① (decision a of the maintainer): 0.1.1 is not published; its section is the
    // part „Fehlerbehebungen“ of 0.2.0.
    expect(changelog).toContain("### Fehlerbehebungen (Nachlese 7 ①");
    const release = changelog.slice(changelog.indexOf("### Fehlerbehebungen (Nachlese 7 ①"));
    for (const id of ["A-1", "A-2", "A-3", "A-4", "A-5", "A-6", "A-7"])
      expect(release, id).toContain(id);
    expect(changelog).toContain("## 0.2.0");
  });
});

describe("Nachlese 7 ② documentation (specs/021-nachlese-7)", () => {
  it("plan ② carries the additions B-1 to B-10, tasks ② start at T2111, plan ① the note for Arkitekturo, the CHANGELOG 0.2.0 the additions", () => {
    const plan = read("specs/021-nachlese-7/plan.md");
    const tasks = read("specs/021-nachlese-7/tasks.md");
    const second = plan.slice(plan.indexOf("## ② Ergänzungen (0.2.0)"));
    for (const heading of [
      "### Zusammenfassung",
      "### Entwurfsentscheidungen",
      "### Arkitekturo-Vertrag",
      "### Abweichungen",
      "### Befunde / Mankoj",
      "### Offen (für den Maintainer)",
    ]) {
      expect(second, heading).toContain(heading);
    }
    for (const id of ["B-1", "B-2", "B-3", "B-4", "B-5", "B-6", "B-7", "B-8", "B-9", "B-10"])
      expect(second, id).toContain(id);
    expect(second).toContain("brand-badge");
    expect(second).not.toContain("ciferecigo");
    const first = plan.slice(
      plan.indexOf("## ① Fehler (0.1.1)"),
      plan.indexOf("## ② Ergänzungen (0.2.0)"),
    );
    expect(first).toContain("### Hinweis für Arkitekturo");
    const note = first.slice(first.indexOf("### Hinweis für Arkitekturo"));
    expect(note).toMatch(/keinen? Codetransfer/);
    const own = tasks.slice(tasks.indexOf("## ② Ergänzungen (0.2.0)"));
    expect(own).toContain("**T2111");
    expect(own).toMatch(/rot `[0-9a-f]{7}`/);
    const changelog = read("CHANGELOG.md");
    // Nachlese 8 ①: the planned 0.2.0 is the release; its additions stand in it.
    const planned = changelog.slice(changelog.indexOf("## 0.2.0"));
    for (const id of ["B-1", "B-2", "B-3", "B-4", "B-5", "B-6", "B-7", "B-8", "B-9", "B-10"])
      expect(planned, id).toContain(id);
    expect(planned).toContain("Breaking: Das Make Kit liefert nur noch ESM.");
  });
});

describe("Spec 020 ① documentation (specs/020-sxablonoj-1)", () => {
  it("the spec is copied unchanged; plan ① carries the decisions, the coverage of Arkitekturo and what the maintainer confirms (E4)", () => {
    const spec = read("specs/020-sxablonoj-1/spec.md");
    expect(createHash("sha256").update(spec).digest("hex")).toBe(
      "ee2a4f8a58de176e6af9ecd41ffe556768b26104eaf5e1028ba088fb3e8ef32a",
    );
    const plan = read("specs/020-sxablonoj-1/plan.md");
    const tasks = read("specs/020-sxablonoj-1/tasks.md");
    for (const text of [plan, tasks]) {
      expect(text).toContain("## ① Grundlage, sxelo und pagxo");
      expect(text).toContain("## ② formularo und filtrilo");
      expect(text).toContain("## ③ Inhalt");
    }
    const first = plan.slice(
      plan.indexOf("## ① Grundlage, sxelo und pagxo"),
      plan.indexOf("## ② formularo und filtrilo"),
    );
    for (const heading of [
      "### Zusammenfassung",
      "### Entwurfsentscheidungen",
      "### Arkitekturo-Abdeckung",
      "### Gekippte Dialoge",
      "### Abweichungen",
      "### Befunde / Mankoj",
      "### Offen (für den Maintainer)",
    ]) {
      expect(first, heading).toContain(heading);
    }
    const coverage = first.slice(first.indexOf("### Arkitekturo-Abdeckung"));
    for (const ark of [
      "ark-shell",
      "ark-page",
      "ark-form",
      "ark-filterbar",
      "ark-query-filters",
      "ark-markdown",
      "ark-markdown-editor",
      "ark-command-hint",
      "ark-source-excerpt",
      "ark-diff",
    ])
      expect(coverage, ark).toContain(`\`${ark}\``);
    expect(first).toContain("E4");
    expect(first).toContain("heading-with-actions");
    expect(first).not.toContain("ciferecigo");
    const own = tasks.slice(
      tasks.indexOf("## ① Grundlage, sxelo und pagxo"),
      tasks.indexOf("## ② formularo und filtrilo"),
    );
    expect(own).toContain("**T2051");
    expect(own).toMatch(/rot `[0-9a-f]{7}`/);
  });
});

describe("Spec 020 ② documentation (specs/020-sxablonoj-1)", () => {
  it("plan ② carries the decisions of formularo and filtrilo; tasks ② start at T2071", () => {
    const plan = read("specs/020-sxablonoj-1/plan.md");
    const tasks = read("specs/020-sxablonoj-1/tasks.md");
    const second = plan.slice(
      plan.indexOf("## ② formularo und filtrilo"),
      plan.indexOf("## ③ Inhalt"),
    );
    for (const heading of [
      "### Zusammenfassung",
      "### Entwurfsentscheidungen",
      "### Arkitekturo-Abdeckung",
      "### Gekippte Dialoge",
      "### Abweichungen",
      "### Befunde / Mankoj",
      "### Offen (für den Maintainer)",
    ]) {
      expect(second, heading).toContain(heading);
    }
    for (const term of ["formularo", "filtrilo", "novalidate", "submit", "search", "long-form"])
      expect(second, term).toContain(term);
    expect(second).not.toContain("ciferecigo");
    const own = tasks.slice(
      tasks.indexOf("## ② formularo und filtrilo"),
      tasks.indexOf("## ③ Inhalt"),
    );
    expect(own).toContain("**T2071");
    expect(own).toMatch(/rot `[0-9a-f]{7}`/);
  });
});

describe("Spec 020 ③ documentation (specs/020-sxablonoj-1)", () => {
  it("plan ③ carries the content, the security test and the guide for the acceptance with full paths; tasks ③ start at T2081", () => {
    const plan = read("specs/020-sxablonoj-1/plan.md");
    const tasks = read("specs/020-sxablonoj-1/tasks.md");
    const third = plan.slice(plan.indexOf("## ③ Inhalt"));
    for (const heading of [
      "### Zusammenfassung",
      "### Entwurfsentscheidungen",
      "### Arkitekturo-Abdeckung",
      "### Gekippte Dialoge",
      "### Abweichungen",
      "### Befunde / Mankoj",
      "### Offen (für den Maintainer)",
      "### Messanleitung",
    ]) {
      expect(third, heading).toContain(heading);
    }
    for (const term of [
      "kodbloko",
      "markdovido",
      "redaktilo",
      "textContent",
      "javascript:",
      "rich-text",
      "file:///Users/thorstenjankowski/n8n-compose/20260918_fundamento-ds/",
      "Version",
      "neu importieren",
      "wiederherstellen",
    ])
      expect(third, term).toContain(term);
    for (const line of third.split("\n").filter((entry) => entry.includes("vitrino/index.html#")))
      expect(line, line).toMatch(/file:\/\/\/Users\//);
    expect(third).not.toContain("ciferecigo");
    const own = tasks.slice(tasks.indexOf("## ③ Inhalt"));
    expect(own).toContain("**T2081");
    expect(own).toMatch(/rot `[0-9a-f]{7}`/);
  });
});

// Nachlese 8 ① (Briefing 2026-10-21): specs/022-nachlese-8 carries the briefing unchanged, a plan
// and tasks with ① (Gvidanto, plugin name, 0.2.0), ② (Figma and Vitrino) and ③ (rule texts in
// German); the acceptance result of Spec 020 lies beside its spec; the CHANGELOG has 0.2.0 with
// the section of 0.1.1 merged into it.
describe("Nachlese 8 ① documentation (specs/022-nachlese-8)", () => {
  it("the briefing and the result are copied unchanged; plan ① carries the findings, the dialogs and the guide; the CHANGELOG 0.2.0", () => {
    const briefing = read("specs/022-nachlese-8/briefing.md");
    expect(createHash("sha256").update(briefing).digest("hex")).toBe(
      "195417d7b580749509155f0366bb043cd09e034d0a59d612754fe906f90ba350",
    );
    const result = read("specs/020-sxablonoj-1/ergebnis-2026-10-21.md");
    expect(createHash("sha256").update(result).digest("hex")).toBe(
      "832fcbfd7e3e44b0eb23aa9d3b2a7e49fff6de6a3c058ede0d1104c1b46d2041",
    );
    const plan = read("specs/022-nachlese-8/plan.md");
    const tasks = read("specs/022-nachlese-8/tasks.md");
    for (const text of [plan, tasks]) {
      expect(text).toContain("## ① Gvidanto, Plugin-Name, 0.2.0");
      expect(text).toContain("## ② Figma und Vitrino");
      expect(text).toContain("## ③ Regeltexte deutsch");
    }
    const first = plan.slice(
      plan.indexOf("## ① Gvidanto, Plugin-Name, 0.2.0"),
      plan.indexOf("## ② Figma und Vitrino"),
    );
    for (const heading of [
      "### Zusammenfassung",
      "### Entwurfsentscheidungen",
      "### Gekippte Dialoge",
      "### Abweichungen",
      "### Befunde / Mankoj",
      "### Offen (für den Maintainer)",
      "### Messanleitung",
    ]) {
      expect(first, heading).toContain(heading);
    }
    for (const term of [
      "G-1",
      "D-11",
      "F-1",
      "F-13",
      "Anmeldung",
      "gvidanto.json",
      "0.2.0",
      "release.yml",
      "dry-run",
      "latest",
      "/Users/thorstenjankowski/n8n-compose/20260918_fundamento-ds/.fundamento/nachlese8/mess/",
      "echo FERTIG",
      "file:///Users/thorstenjankowski/n8n-compose/20260918_fundamento-ds/",
    ]) {
      expect(first, term).toContain(term);
    }
    expect(first).not.toContain("ciferecigo");
    const own = tasks.slice(
      tasks.indexOf("## ① Gvidanto, Plugin-Name, 0.2.0"),
      tasks.indexOf("## ② Figma und Vitrino"),
    );
    expect(own).toContain("**T2201");
    expect(own).toMatch(/rot `[0-9a-f]{7}`/);
    const changelog = read("CHANGELOG.md");
    expect(changelog).not.toContain("## 0.1.1");
    expect(changelog).not.toContain("## 0.2.0 – geplant");
    const release = changelog.slice(changelog.indexOf("## 0.2.0"));
    for (const term of [
      "A-1",
      "A-7",
      "B-1",
      "B-10",
      "sxelo",
      "pagxo",
      "formularo",
      "filtrilo",
      "redaktilo",
      "kodbloko",
      "markdovido",
      "list_sxablonoj",
      "get_sxablono",
      "Spec 019",
      "Nachlese 8",
      "ESM",
    ])
      expect(release, term).toContain(term);
  });
});

// Nachlese 8 ② (Briefing 2026-10-21): plan ② carries Figma and the Vitrino, the cause of M5 with
// its measurements, what happens to f10b-5, and the guide for the acceptance in four Figma steps
// with a table of expected values; tasks ② start at T2221.
describe("Nachlese 8 ② documentation (specs/022-nachlese-8)", () => {
  it("plan ② carries the findings, the cause of M5 and the guide with the four Figma steps; tasks ② start at T2221", () => {
    const plan = read("specs/022-nachlese-8/plan.md");
    const tasks = read("specs/022-nachlese-8/tasks.md");
    const second = plan.slice(
      plan.indexOf("## ② Figma und Vitrino"),
      plan.indexOf("## ③ Regeltexte deutsch"),
    );
    for (const heading of [
      "### Zusammenfassung",
      "### Entwurfsentscheidungen",
      "### Gekippte Dialoge",
      "### Abweichungen",
      "### Befunde / Mankoj",
      "### Offen (für den Maintainer)",
      "### Messanleitung",
    ]) {
      expect(second, heading).toContain(heading);
    }
    for (const term of [
      "F-5",
      "F-6",
      "F-8",
      "F-9",
      "F-10",
      "F-11",
      "F-12",
      "V-1",
      "V-6",
      "N7-F-1",
      "M5",
      "f10b-5",
      "pnpm fm projekcioj build --out .fundamento/projekcioj",
      ".fundamento/projekcioj-provoj",
      "neu importieren",
      "neuen leeren Datei",
      "file:///Users/thorstenjankowski/n8n-compose/20260918_fundamento-ds/",
    ]) {
      expect(second, term).toContain(term);
    }
    expect(second).toMatch(/\| [^|\n]+ \| [^|\n]+ \|/);
    expect(second).not.toContain("ciferecigo");
    const own = tasks.slice(
      tasks.indexOf("## ② Figma und Vitrino"),
      tasks.indexOf("## ③ Regeltexte deutsch"),
    );
    expect(own).toContain("**T2221");
    expect(own).toMatch(/rot `[0-9a-f]{7}`/);
  });
});

// Nachlese 8 ③ (Briefing 2026-10-21, Entscheidung d): plan ③ carries the way of lingvo, the check,
// the size and a sample of 20 texts in English and German side by side for the maintainer; tasks
// ③ start at T2241.
describe("Nachlese 8 ③ documentation (specs/022-nachlese-8)", () => {
  it("plan ③ carries the decisions, the sample of 20 texts and the guide; tasks ③ start at T2241", () => {
    const plan = read("specs/022-nachlese-8/plan.md");
    const tasks = read("specs/022-nachlese-8/tasks.md");
    const third = plan.slice(plan.indexOf("## ③ Regeltexte deutsch"));
    for (const heading of [
      "### Zusammenfassung",
      "### Entwurfsentscheidungen",
      "### Stichprobe",
      "### Abweichungen",
      "### Befunde / Mankoj",
      "### Offen (für den Maintainer)",
      "### Messanleitung",
    ]) {
      expect(third, heading).toContain(heading);
    }
    const sample = third.slice(third.indexOf("### Stichprobe"), third.indexOf("### Abweichungen"));
    const rows = sample.split("\n").filter((line) => /^\| \d+ \|/.test(line));
    expect(rows.length).toBeGreaterThanOrEqual(20);
    for (const term of [
      "tradukoj.json",
      "traduko-missing",
      "lingvo",
      "WCAG",
      "file:///Users/thorstenjankowski/n8n-compose/20260918_fundamento-ds/",
    ])
      expect(third, term).toContain(term);
    expect(third).not.toContain("ciferecigo");
    const own = tasks.slice(tasks.indexOf("## ③ Regeltexte deutsch"));
    expect(own).toContain("**T2241");
    expect(own).toMatch(/rot `[0-9a-f]{7}`/);
  });
});

// Spec 025 ① (Nachtlauf 2026-10-22): specs/025-eroj-runde-5 carries the spec unchanged, the
// benchmark file of Art. V beside it in research/, a plan and tasks with the three sections ① to
// ③; plan ① carries the decisions, the Constitutional Compliance Review, the Arkitekturo coverage,
// deviations, findings, open points, the benchmark figures and the measuring guide; tasks ① the
// red hashes; the Vojmapo names ①.
describe("Spec 025 ① documentation (specs/025-eroj-runde-5)", () => {
  it("the spec is the one of 2026-10-22, unchanged; the benchmark file stands in research/; plan and tasks carry ① to ③", () => {
    const spec = read("specs/025-eroj-runde-5/spec.md");
    expect(spec).toMatch(/^# Spec 025 – Eroj-Runde 5: Eingabe und Auswahl/);
    expect(spec).toContain(
      "**E4 Namen:** `glitilo`, `datelektilo`, `listelektilo`, `plurelektilo`, `signeto`, `lokredaktilo`.",
    );
    const benchmark = read("research/benchmark-carbon-2026-10.md");
    expect(benchmark).toMatch(/^# Benchmark Carbon, Oktober 2026: Kennzahlen, Checklisten, Lücken/);
    expect(benchmark).toContain("<!-- spuroj-anfang -->");
    const plan = read("specs/025-eroj-runde-5/plan.md");
    const tasks = read("specs/025-eroj-runde-5/tasks.md");
    for (const text of [plan, tasks]) {
      for (const heading of ["## ① Eingabe", "## ② Datum", "## ③ Auswahl"]) {
        expect(text).toContain(heading);
      }
    }
  });

  it("plan ① carries the review, the decisions, the coverage, deviations, findings, open points, the benchmark figures and the measuring guide; tasks ① the red hashes", () => {
    const section = (text: string) =>
      text.slice(text.indexOf("## ① Eingabe"), text.indexOf("## ② Datum"));
    const plan = section(read("specs/025-eroj-runde-5/plan.md"));
    for (const heading of [
      "### Zusammenfassung",
      "### Constitutional Compliance Review",
      "### Entwurfsentscheidungen",
      "#### D-01",
      "#### D-02",
      "### Arkitekturo-Abdeckung",
      "### Abweichungen von der Spec",
      "### Befunde / Mankoj",
      "### Offen (für den Maintainer)",
      "### Benchmark-Kennzahlen",
      "### Messanleitung",
    ]) {
      expect(plan, heading).toContain(heading);
    }
    for (const word of ["`glitilo`", "`kampo`", "`range-stated`", "`events`", "`stepper`"]) {
      expect(plan).toContain(word);
    }
    expect(plan).toContain("cd /Users/thorstenjankowski/n8n-compose/20260918_fundamento-ds");
    expect(plan).toContain("file:///Users/thorstenjankowski/n8n-compose/20260918_fundamento-ds/");
    const tasks = section(read("specs/025-eroj-runde-5/tasks.md"));
    expect(tasks).toContain("### Messungen");
    expect(tasks).toMatch(/rot `[0-9a-f]{7}`/);
    expect(read("docs/vojmapo.md")).toContain("Spec 025 ①");
    expect(read("README.md")).toContain("forty `fm-*` elements");
  });
});

// Spec 025 ② (Nachtlauf 2026-10-22): plan ② carries the decisions D-10 to D-13, the review, the
// coverage, deviations, findings, open points, the benchmark figures of 36 Eroj and the measuring
// guide; tasks ② the red hashes; the Vojmapo names ②; the README counts forty elements.
describe("Spec 025 ② documentation (specs/025-eroj-runde-5)", () => {
  it("plan ② carries the review, the decisions, the coverage, deviations, findings, open points, the benchmark figures and the measuring guide; tasks ② the red hashes", () => {
    const section = (text: string) =>
      text.slice(text.indexOf("## ② Datum"), text.indexOf("## ③ Auswahl"));
    const plan = section(read("specs/025-eroj-runde-5/plan.md"));
    for (const heading of [
      "### Zusammenfassung",
      "### Constitutional Compliance Review",
      "### Entwurfsentscheidungen",
      "#### D-10",
      "#### D-11",
      "#### D-12",
      "#### D-13",
      "### Arkitekturo-Abdeckung",
      "### Abweichungen von der Spec",
      "### Befunde / Mankoj",
      "### Offen (für den Maintainer)",
      "### Benchmark-Kennzahlen",
      "### Messanleitung",
    ]) {
      expect(plan, heading).toContain(heading);
    }
    expect(plan).toContain("`datelektilo`");
    expect(plan).toContain("cd /Users/thorstenjankowski/n8n-compose/20260918_fundamento-ds");
    expect(plan).toContain("#fm-vitrino-datelektilo");
    expect(plan).toContain("| Eroj | 79 Komponenten | 35 | 36 (`datelektilo`) |");
    const tasks = section(read("specs/025-eroj-runde-5/tasks.md"));
    expect(tasks).toMatch(/T2531/);
    expect(tasks).toMatch(/rot `[0-9a-f]{7}`/);
    expect(read("docs/vojmapo.md")).toContain("Spec 025 ②");
    expect(read("README.md")).toContain("forty `fm-*` elements");
    expect(read("README.md")).toContain("`fm-datelektilo`");
  });
});

// Spec 025 ③ (Nachtlauf 2026-10-22): plan ③ carries the decisions D-14 to D-19, the review, the
// coverage, deviations, findings, open points, the benchmark figures of 40 Eroj (Abnahme 4 and 5)
// and the measuring guide; tasks ③ the red hashes; the Vojmapo names ③; the README counts forty.
describe("Spec 025 ③ documentation (specs/025-eroj-runde-5)", () => {
  it("plan ③ carries the review, the decisions, the coverage, deviations, findings, open points, the benchmark figures and the measuring guide; tasks ③ the red hashes", () => {
    const plan = read("specs/025-eroj-runde-5/plan.md");
    const section = plan.slice(plan.indexOf("## ③ Auswahl"));
    for (const heading of [
      "### Zusammenfassung",
      "### Constitutional Compliance Review",
      "### Entwurfsentscheidungen",
      "#### D-14",
      "#### D-15",
      "#### D-16",
      "#### D-17",
      "### Arkitekturo-Abdeckung",
      "### Abweichungen von der Spec",
      "### Befunde / Mankoj",
      "### Offen (für den Maintainer)",
      "### Benchmark-Kennzahlen",
      "### Messanleitung",
    ]) {
      expect(section, heading).toContain(heading);
    }
    for (const name of ["signeto", "listelektilo", "plurelektilo", "lokredaktilo"]) {
      expect(section).toContain(`\`${name}\``);
      expect(section).toContain(`#fm-vitrino-${name}`);
    }
    expect(section).toContain("cd /Users/thorstenjankowski/n8n-compose/20260918_fundamento-ds");
    expect(section).toContain("| Eroj | 79 Komponenten | 36 | 40 (");
    expect(section).toMatch(/Gattungen mit Gegenstück \| – \| 29 \| 33/);
    const tasks = read("specs/025-eroj-runde-5/tasks.md");
    const tasks3 = tasks.slice(tasks.indexOf("## ③ Auswahl"));
    expect(tasks3).toMatch(/T2561/);
    expect(tasks3).toMatch(/rot `[0-9a-f]{7}`/);
    expect(read("docs/vojmapo.md")).toContain("Spec 025 ③");
    expect(read("README.md")).toContain("forty `fm-*` elements");
    for (const name of ["signeto", "listelektilo", "plurelektilo", "lokredaktilo"]) {
      expect(read("README.md")).toContain(`\`fm-${name}\``);
    }
  });
});

// Nachlese 9 „Tempo“ (Briefing 2026-10-22): specs/026-nachlese-9 carries the briefing unchanged,
// a plan with the cause of the slow runner (measurements over the CI runs, the process alone and
// under load), O-8 (Ero-Tokens in rezolvoj.json as references) and the export budget of 30 s, and
// tasks with the red commit.
describe("Nachlese 9 documentation (specs/026-nachlese-9)", () => {
  it("the briefing is copied unchanged; plan and tasks carry the cause, O-8, the budgets and the guide", () => {
    const briefing = read("specs/026-nachlese-9/briefing.md");
    expect(createHash("sha256").update(briefing).digest("hex")).toBe(
      "55db051b6e5de91329b1033e53dad3d12f575623abe1602a133bc37b014de6bd",
    );
    const plan = read("specs/026-nachlese-9/plan.md");
    for (const heading of [
      "### Zusammenfassung",
      "### Ursache",
      "### Entwurfsentscheidungen",
      "### Abweichungen",
      "### Befunde / Mankoj",
      "### Offen (für den Maintainer)",
      "### Messanleitung",
    ]) {
      expect(plan, heading).toContain(heading);
    }
    for (const term of ["O-8", "rezolvoj.json", "30 s", "120 s", "ubuntu-latest", "echo FERTIG"]) {
      expect(plan, term).toContain(term);
    }
    const tasks = read("specs/026-nachlese-9/tasks.md");
    expect(tasks).toMatch(/rot `[0-9a-f]{7}`/);
    expect(read("docs/vojmapo.md")).toContain("Nachlese 9");
  });
});

// Spec 026 ① (2026-10-22): specs/026-lingvo carries the spec unchanged, a plan and tasks with the
// sections ① and ②; plan ① carries the causes of the two defects of Spec 025, the build with all
// four example brands (one command, also in the README) and the measuring guide with full paths,
// cd and file:// links; tasks ① the red commit.
const CXIUJ_BUILD =
  "pnpm fm projekcioj build --config packages/modelo/test/fixtures/valid/aspekto-provo-kompakta/fundamento.cxiuj.config.json --out .fundamento/projekcioj-cxiuj";

describe("Spec 026 ① documentation (specs/026-lingvo)", () => {
  it("the spec is the one of 2026-10-22, unchanged; plan and tasks carry ① and ②", () => {
    const spec = read("specs/026-lingvo/spec.md");
    expect(createHash("sha256").update(spec).digest("hex")).toBe(
      "e4c2d20ee3f2564efa59544f12245da11b30e1f9ccdc4d244d2db1325e823841",
    );
    for (const file of ["plan.md", "tasks.md"]) {
      const text = read(`specs/026-lingvo/${file}`);
      expect(text, file).toContain("## ① Fehler und Build");
      expect(text, file).toContain("## ② Lingvo-Schalter");
    }
  });

  it("plan ① carries the causes, the decisions, deviations, findings, open points and the measuring guide; the README the one command; tasks ① the red commit", () => {
    const whole = read("specs/026-lingvo/plan.md");
    const plan = whole.slice(
      whole.indexOf("## ① Fehler und Build"),
      whole.indexOf("## ② Lingvo-Schalter"),
    );
    for (const heading of [
      "### Zusammenfassung",
      "### Ursachen",
      "### Entwurfsentscheidungen",
      "#### D-01",
      "### Abweichungen von der Spec",
      "### Befunde / Mankoj",
      "### Offen (für den Maintainer)",
      "### Messanleitung",
    ]) {
      expect(plan, heading).toContain(heading);
    }
    for (const term of [
      "`datelektilo`",
      "`listelektilo`",
      "Japan",
      "ekzemplo",
      "MODE_LIMIT",
      "F-13",
      "cd /Users/thorstenjankowski/n8n-compose/20260918_fundamento-ds",
      CXIUJ_BUILD,
      'open "file:///Users/thorstenjankowski/n8n-compose/20260918_fundamento-ds/.fundamento/projekcioj-cxiuj/vitrino/index.html#',
      "/Users/thorstenjankowski/n8n-compose/20260918_fundamento-ds/.fundamento/projekcioj-cxiuj/figma/plugin/manifest.json",
    ]) {
      expect(plan, term).toContain(term);
    }
    for (const line of plan.split("\n").filter((entry) => entry.includes("index.html#"))) {
      expect(line, line).toMatch(/file:\/\/\/Users\//);
    }
    expect(whole).not.toContain("ciferecigo");
    expect(read("README.md")).toContain(CXIUJ_BUILD);
    const tasks = read("specs/026-lingvo/tasks.md");
    const own = tasks.slice(
      tasks.indexOf("## ① Fehler und Build"),
      tasks.indexOf("## ② Lingvo-Schalter"),
    );
    expect(own).toMatch(/rot `[0-9a-f]{7}`/);
    expect(read("docs/vojmapo.md")).toContain("Spec 026 ①");
  });
});

// Spec 026 ② (Lingvo-Schalter): plan ② carries the table of every name of the 40 Eroj and the 5
// Sxablonoj in Esperanto, German and English for the maintainer's review — the names of
// data/tradukoj.json, row for row —, the decisions and the measuring guide with the switch in the
// Vitrino (#lingvo=de), the Studio, the Gvidanto and the Figma build with --lingvo de.
describe("Spec 026 ② documentation (specs/026-lingvo)", () => {
  it("plan ② carries the table of all names, the decisions and the measuring guide; tasks ② the red commit", () => {
    const whole = read("specs/026-lingvo/plan.md");
    const plan = whole.slice(whole.indexOf("## ② Lingvo-Schalter"));
    for (const heading of [
      "### Zusammenfassung",
      "### Constitutional Compliance Review",
      "### Entwurfsentscheidungen",
      "#### D-05",
      "### Die Namen zur Prüfung",
      "### Abweichungen von der Spec",
      "### Befunde / Mankoj",
      "### Offen (für den Maintainer)",
      "### Messanleitung",
    ]) {
      expect(plan, heading).toContain(heading);
    }
    const tradukoj = JSON.parse(read("packages/modelo/data/tradukoj.json")).tradukoj as Record<
      string,
      Record<string, string>
    >;
    let rows = 0;
    for (const [kind, key] of [
      ["eroj", "ero"],
      ["sxablonoj", "sxablono"],
    ] as const) {
      const dir = join(repoRoot, "packages/modelo/data", kind);
      for (const name of readdirSync(dir)) {
        if (!existsSync(join(dir, name, "skemo.json"))) continue;
        const entry = JSON.parse(read(`packages/modelo/data/${kind}/${name}/skemo.json`))[key] as {
          id: string;
        };
        const row = `| \`${name}\` | ${tradukoj.de?.[`${entry.id}/name`]} | ${tradukoj.en?.[`${entry.id}/name`]} |`;
        expect(plan, row).toContain(row);
        rows += 1;
      }
    }
    expect(rows).toBe(45);
    for (const term of [
      "cd /Users/thorstenjankowski/n8n-compose/20260918_fundamento-ds",
      'open "file:///Users/thorstenjankowski/n8n-compose/20260918_fundamento-ds/.fundamento/projekcioj-cxiuj/vitrino/index.html#lingvo=de',
      "--lingvo de",
      "Schieberegler",
      "label",
      "localStorage",
      "packages/modelo/data/tradukoj.json",
    ]) {
      expect(plan, term).toContain(term);
    }
    for (const line of plan.split("\n").filter((entry) => entry.includes("index.html#"))) {
      expect(line, line).toMatch(/file:\/\/\/Users\//);
    }
    expect(whole).not.toContain("ciferecigo");
    const tasks = read("specs/026-lingvo/tasks.md");
    expect(tasks.slice(tasks.indexOf("## ② Lingvo-Schalter"))).toMatch(/rot `[0-9a-f]{7}`/);
    expect(read("docs/vojmapo.md")).toContain("Spec 026 ②");
  });
});

// Nachlese 10 (Abnahme Spec 026, 2026-10-23): specs/028-nachlese-10 carries the briefing
// unchanged, a plan with the causes (N-1 to N-8), the decisions, findings, open points and the
// measuring guide with full paths, cd and file:// links, and tasks with the red commit.
describe("Nachlese 10 documentation (specs/028-nachlese-10)", () => {
  it("the briefing is copied unchanged; plan and tasks carry the causes and the guide", () => {
    const briefing = read("specs/028-nachlese-10/briefing.md");
    expect(createHash("sha256").update(briefing).digest("hex")).toBe(
      "85d3d11d9db05af82df9f79366bbf0b6b52357c0436fc6e9fa306f9dc28cb5f5",
    );
    const plan = read("specs/028-nachlese-10/plan.md");
    for (const heading of [
      "### Zusammenfassung",
      "### Ursachen",
      "### Entwurfsentscheidungen",
      "### Abweichungen",
      "### Befunde / Mankoj",
      "### Offen (für den Maintainer)",
      "### Messanleitung",
    ]) {
      expect(plan, heading).toContain(heading);
    }
    for (const term of [
      "Meldung",
      "Listenauswahl",
      "Listbox",
      "Pfadnavigation",
      "N-1",
      "N-2",
      "N-3",
      "N-4",
      "N-5",
      "N-6",
      "N-7",
      "N-8",
      "cd /Users/thorstenjankowski/n8n-compose/20260918_fundamento-ds",
      'open "file:///Users/thorstenjankowski/n8n-compose/20260918_fundamento-ds/',
      "--lingvo de",
    ]) {
      expect(plan, term).toContain(term);
    }
    for (const line of plan.split("\n").filter((entry) => entry.includes("index.html#"))) {
      expect(line, line).toMatch(/file:\/\/\/Users\//);
    }
    expect(plan).not.toContain("ciferecigo");
    expect(read("specs/028-nachlese-10/tasks.md")).toMatch(/rot `[0-9a-f]{7}`/);
    expect(read("docs/vojmapo.md")).toContain("Nachlese 10");
  });
});

// Spec 027 „Figma-Bauformen" (2026-10-23): specs/027-figma-bauformen carries the spec unchanged, a
// plan with the findings B-1 to B-9, the measurements in Figma, the duration of the plugin run and
// the measuring guide with full paths, cd and file:// links (acceptance in a new empty file), and
// tasks with the red commit.
describe("Spec 027 documentation (specs/027-figma-bauformen)", () => {
  it("the spec is copied unchanged; plan and tasks carry the findings, the run and the guide", () => {
    const spec = read("specs/027-figma-bauformen/spec.md");
    expect(createHash("sha256").update(spec).digest("hex")).toBe(
      "dd52d5f96901abe13077f260f69431ea9a7b1e605b2ed339de92b795700d3b41",
    );
    const plan = read("specs/027-figma-bauformen/plan.md");
    for (const heading of [
      "### Zusammenfassung",
      "### Messungen in Figma",
      "### Entwurfsentscheidungen",
      "### Abweichungen",
      "### Befunde / Mankoj",
      "### Offen (für den Maintainer)",
      "### Messanleitung",
    ]) {
      expect(plan, heading).toContain(heading);
    }
    for (const term of [
      "B-1",
      "B-2",
      "B-3",
      "B-4",
      "B-5",
      "B-6",
      "B-7",
      "B-8",
      "B-9",
      "Dauer des Plugin-Laufs",
      "Fundamento Bauformen",
      "neue leere Datei",
      "cd /Users/thorstenjankowski/n8n-compose/20260918_fundamento-ds",
      "file:///Users/thorstenjankowski/n8n-compose/20260918_fundamento-ds/",
    ]) {
      expect(plan, term).toContain(term);
    }
    expect(plan).not.toContain("ciferecigo");
    expect(read("specs/027-figma-bauformen/tasks.md")).toMatch(/rot `[0-9a-f]{7}`/);
    expect(read("docs/vojmapo.md")).toContain("Spec 027");
  });
});

// Spec 029 ① „Fonto Astryx – Grundlagen" (2026-10-23): specs/029-fonto-astryx carries the spec
// unchanged, a plan with the Constitution Amendment v2.4, the pinned Fonto, komuna-0-2, the list
// of the Jugxoj, the deviations and the measuring guide with full paths, cd and file:// links, and
// tasks with the red commit. The Constitution, its Ontologio and the notices follow the amendment.
describe("Spec 029 ① documentation (specs/029-fonto-astryx)", () => {
  it("the spec is copied unchanged; plan and tasks carry the amendment, the Jugxoj and the guide", () => {
    const spec = read("specs/029-fonto-astryx/spec.md");
    expect(createHash("sha256").update(spec).digest("hex")).toBe(
      "36ac8edfd68a57affcce8c309be2c07c51c6c3aacfb5b9c7b33761bfd30a710a",
    );
    const plan = read("specs/029-fonto-astryx/plan.md");
    for (const heading of [
      "### Zusammenfassung",
      "### Constitution Amendment v2.4",
      "### Die Fonto, gepinnt",
      "### Jugxo-Liste",
      "### Entwurfsentscheidungen",
      "### Abweichungen",
      "### Befunde / Mankoj",
      "### Offen (für den Maintainer)",
      "### Constitutional Compliance Review",
      "### Messanleitung",
    ]) {
      expect(plan, heading).toContain(heading);
    }
    for (const term of [
      "704757fd827c6fa00a71af80b06d5da99d155e45",
      "komuna-0-2",
      "pixelgleich",
      "Prata",
      "Fundamento Grundlagen",
      "Dauer des Plugin-Laufs",
      "neue leere Datei",
      "cd /Users/thorstenjankowski/n8n-compose/20260918_fundamento-ds",
      "file:///Users/thorstenjankowski/n8n-compose/20260918_fundamento-ds/",
    ]) {
      expect(plan, term).toContain(term);
    }
    expect(plan).not.toContain("ciferecigo");
    expect(read("specs/029-fonto-astryx/tasks.md")).toMatch(/rot `[0-9a-f]{7}`/);
    expect(read("docs/vojmapo.md")).toContain("Spec 029");
  });

  // #113 O-6 (Maintainer 24.10.): the light value of color.background.inverse of the Fonto is not a
  // value of komuna (rounded to neutral.950) and no theme-neutral value of the benchmark list; the
  // plan, the Jugxo of komuna and the generator name token and step, not the value. The generator
  // reads it from the pinned package. deveno.json records it as provenance (not searched).
  it("plan, Jugxo and generator name color.background.inverse (light) by token and step, not by value", () => {
    for (const file of [
      "specs/029-fonto-astryx/plan.md",
      "packages/aspekto-komuna/jugxoj.json",
      "scripts/fonto-astryx/werte.mjs",
    ]) {
      expect(read(file).toLowerCase(), file).not.toContain("0a1317");
    }
  });

  // Briefing A (Maintainer 24.10., „alles wie empfohlen"): copied unchanged beside the spec; plan
  // and tasks carry ①-6, the headings of provo in 400.
  it("the briefing of 24.10. is copied unchanged; plan and tasks carry ①-6", () => {
    const briefing = read("specs/029-fonto-astryx/briefing-a-2026-10-24.md");
    expect(createHash("sha256").update(briefing).digest("hex")).toBe(
      "b1095dedf2e8caec9dc03268edf3aa339f7e88dc7896de23798df28d286c8626",
    );
    expect(read("specs/029-fonto-astryx/plan.md")).toContain("①-6");
    expect(read("specs/029-fonto-astryx/tasks.md")).toContain("①-6");
  });

  // Briefing A ①b (Maintainer 27.10., Abnahme ① nicht bestanden): copied unchanged; plan and tasks
  // carry ①b with its Jugxoj and the path of the local comparison page.
  it("the briefing ①b of 27.10. is copied unchanged; plan and tasks carry ①b, its Jugxoj and the comparison page", () => {
    const briefing = read("specs/029-fonto-astryx/briefing-a-1b-2026-10-27.md");
    expect(createHash("sha256").update(briefing).digest("hex")).toBe(
      "b4a83e80e05c24addee348bcd8e043191c743ff55d7c77249942ca10c53aa994",
    );
    const plan = read("specs/029-fonto-astryx/plan.md");
    for (const term of [
      "## ①b",
      "### Jugxo-Liste ①b",
      "file:///Users/thorstenjankowski/n8n-compose/20260918_fundamento-ds/.fundamento/vergleich/index.html",
      "node scripts/fonto-astryx/vergleich/vergleich.mjs",
      "node scripts/fonto-astryx/eroj.mjs",
    ]) {
      expect(plan, term).toContain(term);
    }
    expect(read("specs/029-fonto-astryx/tasks.md")).toContain("①b");
  });

  it("the Constitution is v2.4 with the Fonto in Art. V, VII, the terminology and the history", () => {
    const constitution = read(".specify/memory/constitution.md");
    // Since Spec 033 S1 the header says 2.5; v2.4 stands in the history.
    expect(constitution).toContain(
      "v2.4 (Spec 029, freigegeben vom Maintainer am 2026-10-23, 21:56)",
    );
    expect(constitution).toContain("**Fonto (offene Quelle).**");
    expect(constitution).toContain("| **Fonto** |");
    expect(constitution).toContain("die Fonto-ID und den Quellpfad (Datei, Schlüssel)");
    expect(constitution).toContain("v2.4 (Spec 029");
    const ontologio = JSON.parse(read("packages/modelo/data/ontologio.json")) as {
      concepts: { term: string }[];
    };
    expect(ontologio.concepts.map((concept) => concept.term)).toContain("Fonto");
    const notices = read("THIRD_PARTY_NOTICES.md");
    expect(notices).toContain("704757fd827c6fa00a71af80b06d5da99d155e45");
    expect(notices).toContain("Copyright (c) 2026 Meta Platforms, Inc.");
    expect(notices).toContain("MIT License");
  });
});

// Spec 030 „Nordstern-Kennzahl" (2026-10-23): specs/030-nordstern-kennzahl carries the spec
// unchanged, a plan with the decisions, the proposed terms for the Vortaro, the report of the
// first run as the baseline before Spec 029 ① (figure F against 0, value per task, spread, top 10
// of the gaps, tokens) and the measuring guide with full paths, cd and file:// links; tasks with
// the red commit. The run is a command of its own (Art. II), never a step of the CI.
describe("Spec 030 documentation (specs/030-nordstern-kennzahl)", () => {
  it("the spec is copied unchanged; plan and tasks carry the decisions, the first run and the guide", () => {
    const spec = read("specs/030-nordstern-kennzahl/spec.md");
    expect(createHash("sha256").update(spec).digest("hex")).toBe(
      "e17387d04c8fdd1ec8267dc46e14305f2dd84e03aac2b040ff10a893218b769d",
    );
    const plan = read("specs/030-nordstern-kennzahl/plan.md");
    for (const heading of [
      "### Zusammenfassung",
      "### Entwurfsentscheidungen",
      "### Neue Begriffe (Vorschlag)",
      "### Erster Lauf: Ausgangslinie vor Spec 029 ①",
      "### Abweichungen",
      "### Befunde / Mankoj",
      "### Offen (für den Maintainer)",
      "### Messanleitung",
    ]) {
      expect(plan, heading).toContain(heading);
    }
    for (const term of [
      "K1",
      "K2",
      "K3",
      "K4",
      "K5",
      "K6",
      "K7",
      "Kennzahl F",
      "Kennzahl 0",
      "Streuung",
      "Top-10",
      "Tokens",
      "pnpm nordstelo",
      "--max-tokens",
      "nicht in der CI",
      "cd /Users/thorstenjankowski/n8n-compose/20260918_fundamento-ds",
      "file:///Users/thorstenjankowski/n8n-compose/20260918_fundamento-ds/",
    ]) {
      expect(plan, term).toContain(term);
    }
    expect(plan).not.toMatch(/sk-[A-Za-z0-9]{8,}|Bearer [A-Za-z0-9]/);
    expect(plan).not.toContain("ciferecigo");
    expect(read("specs/030-nordstern-kennzahl/tasks.md")).toMatch(/rot `[0-9a-f]{7}`/);
    expect(read("docs/vojmapo.md")).toContain("Spec 030");
    expect(read("README.md")).toContain("pnpm nordstelo");
  });

  it("the run is not a step of the CI; its unit tests are", () => {
    const ci = read(".github/workflows/ci.yml");
    expect(ci).not.toMatch(/pnpm nordstelo(?! )|nordstelo\/dist\/cli/);
    expect(ci).toMatch(/package: \[[^\]]*nordstelo/);
    expect(JSON.parse(read("package.json")).scripts.nordstelo).toBe(
      "node packages/nordstelo/dist/cli.js",
    );
  });
});

// Nachlese 11 (what the north-star measure found, 2026-10-24): specs/031-nachlese-11 carries the
// briefing unchanged, a plan with the causes of B-2, B-3, B-6 and B-7, the decisions, the gate of
// Markenfähigkeit with both weightings, the measuring points side by side (Ausgangslinie, nach den
// Korrekturen, nach der Fonto) and the measuring guide with full paths, cd and file:// links; tasks
// with the red commit. No key in any of them.
describe("Nachlese 11 documentation (specs/031-nachlese-11)", () => {
  it("the briefing is copied unchanged; plan and tasks carry the causes, the measuring points and the guide", () => {
    const briefing = read("specs/031-nachlese-11/briefing.md");
    expect(createHash("sha256").update(briefing).digest("hex")).toBe(
      "16bb1cf349057b96e16280ef075ffdfb01cf5c16ad74ef8efd75f5b21514fa17",
    );
    const plan = read("specs/031-nachlese-11/plan.md");
    for (const heading of [
      "### Zusammenfassung",
      "### Ursachen",
      "### Entwurfsentscheidungen",
      "### Messpunkte",
      "### Abweichungen",
      "### Befunde / Mankoj",
      "### Offen (für den Maintainer)",
      "### Messanleitung",
    ]) {
      expect(plan, heading).toContain(heading);
    }
    for (const term of [
      "B-2",
      "B-3",
      "B-6",
      "B-7",
      "Markenfähigkeit",
      "Gewichtung Spec 030",
      "Gewichtung Nachlese 11",
      "Ausgangslinie",
      "nach den Korrekturen",
      "nach der Fonto",
      "gpt-4.1-mini",
      // ④: three series, each with its own model.
      "Reihe H",
      "Reihe O",
      "Reihe K",
      "nvidia/nemotron-3-ultra-550b-a55b:free",
      "ministral-14b-2512",
      "Anfragen",
      "Streuung",
      "Top-10",
      "Tokens",
      "pnpm nordstelo restaro",
      "cd /Users/thorstenjankowski/n8n-compose/20260918_fundamento-ds",
      "file:///Users/thorstenjankowski/n8n-compose/20260918_fundamento-ds/",
    ]) {
      expect(plan, term).toContain(term);
    }
    const tasks = read("specs/031-nachlese-11/tasks.md");
    for (const text of [plan, tasks]) {
      expect(text).not.toMatch(/sk-[A-Za-z0-9_-]{8,}|Bearer [A-Za-z0-9]/);
      expect(text).not.toContain("ciferecigo");
    }
    expect(tasks).toMatch(/rot `[0-9a-f]{7}`/);
    expect(read("docs/vojmapo.md")).toContain("Nachlese 11");
  });

  it("the Eroj quickstart of the README says that fundamento.css sets the surface of the page (B-6)", () => {
    const readme = read("README.md");
    const quickstart = readme.slice(
      readme.indexOf("## Eroj quickstart"),
      readme.indexOf("## Packages"),
    );
    expect(quickstart).toContain("color.background.canvas");
    expect(quickstart).toContain("color.text.default");
  });
});

// Spec 029 ②a „Fonto Astryx – Abgleichstabelle" (2026-10-23): specs/029-fonto-astryx carries the
// spec unchanged and, as data, the comparison of every one of the 40 Eroj with its counterpart in
// the pinned Fonto (abgleich.json): one row per aspect (axes and values, sizes, states, anatomy and
// slots, behaviour, patterns), each with a proposal – übernehmen, anpassen or behalten – and its
// reason, plus the list of Fonto genera Fundamento lacks. Nothing is built; the maintainer decides
// row by row in the field entscheidung (null until then). The plan shows the same rows; new axes
// keep Fundamento's own names (Art. II, v2.2).
describe("Spec 029 ②a documentation (specs/029-fonto-astryx)", () => {
  type Zeile = {
    id: string;
    aspekt: string;
    fundamento: string;
    fonto: string;
    vorschlag: string;
    begruendung: string;
    entscheidung: string | null;
    auflage?: string;
    achsen?: { name: string; werte: string[]; fonto?: string; neu: boolean }[];
  };
  type Abgleich = {
    stand: string;
    fonto: {
      id: string;
      lizenz: string;
      copyright: string;
      pakoj: { name: string; version: string; integrity: string }[];
      repo: string;
      tag: string;
      commit: string;
    };
    muster: (Zeile & { eroj: string[]; quelle: string[] })[];
    eroj: { ero: string; id: string; fonto: string[]; quelle: string[]; zeilen: Zeile[] }[];
    fehlend: {
      gattung: string;
      fonto: string;
      quelle: string;
      vorschlag: string;
      begruendung: string;
    }[];
  };
  const ASPEKTE = ["achsen", "groessen", "zustaende", "anatomie", "verhalten", "muster"];
  const VORSCHLAEGE = ["übernehmen", "anpassen", "behalten"];
  const abgleich = (): Abgleich =>
    JSON.parse(read("specs/029-fonto-astryx/abgleich.json")) as Abgleich;

  it("the spec is copied unchanged", () => {
    const spec = read("specs/029-fonto-astryx/spec.md");
    expect(createHash("sha256").update(spec).digest("hex")).toBe(
      "36ac8edfd68a57affcce8c309be2c07c51c6c3aacfb5b9c7b33761bfd30a710a",
    );
  });

  it("the Fonto is pinned: core and theme-neutral 0.7.4 with integrity, tag and commit, MIT", () => {
    const { fonto } = abgleich();
    expect(fonto.id).toBe("astryx");
    expect(fonto.lizenz).toBe("MIT");
    expect(fonto.copyright).toContain("Meta Platforms");
    expect(fonto.pakoj.map((pako) => `${pako.name}@${pako.version}`)).toEqual([
      "@astryxdesign/core@0.7.4",
      "@astryxdesign/theme-neutral@0.7.4",
    ]);
    for (const pako of fonto.pakoj) expect(pako.integrity).toMatch(/^sha512-[A-Za-z0-9+/=]{80,}$/);
    expect(fonto.tag).toBe("v0.7.4");
    expect(fonto.commit).toMatch(/^[0-9a-f]{40}$/);
  });

  it("every one of the 40 Eroj has its counterpart and one row per aspect with proposal and reason", () => {
    const data = abgleich();
    const dir = join(repoRoot, "packages/modelo/data/eroj");
    const eroj = readdirSync(dir).filter((name) => existsSync(join(dir, name, "skemo.json")));
    expect(eroj).toHaveLength(40);
    expect(data.eroj.map((entry) => entry.ero).sort()).toEqual([...eroj].sort());
    const ids = new Set<string>();
    for (const entry of data.eroj) {
      const skemo = JSON.parse(read(`packages/modelo/data/eroj/${entry.ero}/skemo.json`)) as {
        ero: { id: string };
      };
      expect(entry.id, entry.ero).toBe(skemo.ero.id);
      expect(entry.fonto.length, entry.ero).toBeGreaterThan(0);
      for (const path of entry.quelle)
        expect(path, entry.ero).toMatch(/^src\/[A-Za-z]+\/[A-Za-z]+\.(doc\.mjs|spec\.md)$/);
      expect(
        entry.zeilen.map((zeile) => zeile.aspekt),
        entry.ero,
      ).toEqual(ASPEKTE);
      for (const zeile of entry.zeilen) {
        expect(VORSCHLAEGE, zeile.id).toContain(zeile.vorschlag);
        expect(zeile.begruendung.length, zeile.id).toBeGreaterThan(20);
        expect(zeile.fundamento.length, zeile.id).toBeGreaterThan(0);
        expect(zeile.fonto.length, zeile.id).toBeGreaterThan(0);
        expect([null, ...VORSCHLAEGE], zeile.id).toContain(zeile.entscheidung);
        expect(ids.has(zeile.id), zeile.id).toBe(false);
        ids.add(zeile.id);
      }
    }
    expect(ids.size).toBe(240);
  });

  it("the patterns of the spec are rows of their own: disabled reason, field status, dialog purpose, adaptive", () => {
    const { muster } = abgleich();
    const themen = muster.map((zeile) => zeile.id);
    for (const id of ["M-1", "M-2", "M-3", "M-4"]) expect(themen).toContain(id);
    for (const zeile of muster) {
      expect(VORSCHLAEGE, zeile.id).toContain(zeile.vorschlag);
      expect(zeile.begruendung.length, zeile.id).toBeGreaterThan(20);
      expect(zeile.eroj.length, zeile.id).toBeGreaterThan(0);
      expect([null, ...VORSCHLAEGE], zeile.id).toContain(zeile.entscheidung);
    }
  });

  it("axes keep Fundamento's names: an existing axis of the Ero, or a new name that is not the Fonto's", () => {
    const data = abgleich();
    const props = (ero: string): string[] =>
      (
        JSON.parse(read(`packages/modelo/data/eroj/${ero}/skemo.json`)) as {
          skemo: { props: { name: string }[] };
        }
      ).skemo.props.map((prop) => prop.name);
    const known = new Set(data.eroj.flatMap((entry) => props(entry.ero)));
    const kebab = (name: string): string => name.replace(/[A-Z]/g, (c) => `-${c.toLowerCase()}`);
    const check = (achse: NonNullable<Zeile["achsen"]>[number], own: Set<string>): void => {
      expect(achse.name).toMatch(/^[a-z]+(-[a-z]+)*$/);
      expect(achse.name).not.toBe("variant");
      for (const wert of achse.werte) expect(wert, achse.name).toMatch(/^[a-z0-9]+(-[a-z0-9]+)*$/);
      if (!achse.neu) expect(own.has(achse.name), achse.name).toBe(true);
      if (!known.has(achse.name) && achse.fonto) {
        expect(achse.name, achse.fonto).not.toBe(kebab(achse.fonto));
      }
    };
    let count = 0;
    for (const entry of data.eroj) {
      const own = new Set(props(entry.ero));
      for (const achse of entry.zeilen.flatMap((zeile) => zeile.achsen ?? [])) {
        check(achse, own);
        count += 1;
      }
    }
    for (const achse of data.muster.flatMap((zeile) => zeile.achsen ?? [])) {
      check(achse, known);
      count += 1;
    }
    expect(count).toBeGreaterThan(10);
  });

  it("the list of missing genera names the Fonto source and is not built here", () => {
    const data = abgleich();
    const mapped = new Set(data.eroj.flatMap((entry) => entry.fonto));
    expect(data.fehlend.length).toBeGreaterThanOrEqual(20);
    for (const gattung of data.fehlend) {
      expect(mapped.has(gattung.fonto), gattung.fonto).toBe(false);
      expect(gattung.quelle).toMatch(/^src\/[A-Za-z]+\/[A-Za-z]+\.doc\.mjs$/);
      expect(gattung.begruendung.length, gattung.fonto).toBeGreaterThan(10);
    }
    const toast = data.fehlend.find((gattung) => gattung.fonto === "Toast");
    expect(toast?.begruendung).toContain("E6");
  });

  it("the data carry no values of the Fonto: no colours, no lengths", () => {
    const text = read("specs/029-fonto-astryx/abgleich.json");
    expect(text).not.toMatch(/#[0-9a-fA-F]{6}\b/);
    expect(text).not.toMatch(/\b\d+(\.\d+)?(px|rem)\b/);
  });

  // Briefing A (Maintainer 24.10., „alles wie empfohlen"): the proposal of every row is its decision
  // (②a-1); the exceptions ②a-2 to ②a-6 stand beside the decision as an auflage of their rows.
  const AUFLAGEN: Record<string, string> = {
    "A-elekto-2": "②a-2",
    "A-markobutono-2": "②a-2",
    "A-sxaltilo-2": "②a-2",
    "M-1": "②a-3",
    "A-datelektilo-1": "②a-3",
    "A-elektilo-4": "②a-3",
    "A-langetaro-4": "②a-3",
    "A-ligilo-6": "②a-3",
    "A-spuro-6": "②a-3",
    "A-tekstareo-1": "②a-3",
    "A-kodbloko-6": "②a-3",
    "A-mezurilo-5": "②a-4",
    "A-plenstato-6": "②a-5",
    "A-tabelo-1": "②a-6",
  };
  const zeilen = (data: Abgleich): Zeile[] => [
    ...data.muster,
    ...data.eroj.flatMap((entry) => entry.zeilen),
  ];

  it("the briefing of 24.10. is copied unchanged", () => {
    const briefing = read("specs/029-fonto-astryx/briefing-a-2026-10-24.md");
    expect(createHash("sha256").update(briefing).digest("hex")).toBe(
      "b1095dedf2e8caec9dc03268edf3aa339f7e88dc7896de23798df28d286c8626",
    );
  });

  it("every row is decided as proposed (②a-1), as of 24.10.", () => {
    const data = abgleich();
    expect(data.stand).toBe("2026-10-24");
    const open = zeilen(data).filter((zeile) => zeile.entscheidung !== zeile.vorschlag);
    expect(open.map((zeile) => zeile.id)).toEqual([]);
    expect(zeilen(data)).toHaveLength(254);
  });

  it("the exceptions ②a-2 to ②a-6 stand as an auflage on their rows, and on no other", () => {
    const data = abgleich();
    const found = Object.fromEntries(
      zeilen(data)
        .filter((zeile) => zeile.auflage !== undefined)
        .map((zeile) => [zeile.id, zeile.auflage ?? ""]),
    );
    expect(Object.keys(found).sort()).toEqual(Object.keys(AUFLAGEN).sort());
    for (const [id, punkt] of Object.entries(AUFLAGEN)) {
      expect(found[id], id).toContain(`(${punkt})`);
      expect(found[id]?.length ?? 0, id).toBeGreaterThan(30);
    }
    for (const id of ["A-elekto-2", "A-markobutono-2", "A-sxaltilo-2"]) {
      expect(found[id], id).toMatch(/`large`.*Alias.*`medium`.*veraltet/);
    }
    expect(found["A-kodbloko-6"]).toContain("②b");
    expect(found["A-mezurilo-5"]).toContain("Eroj-Runde 6");
    expect(found["A-plenstato-6"]).toContain("Eroj-Runde 6");
  });

  it("the axis of the table lines is `lines`, not `rules` (②a-6: Reguloj)", () => {
    const data = abgleich();
    const achsen = [...data.muster, ...data.eroj.flatMap((entry) => entry.zeilen)].flatMap(
      (zeile) => zeile.achsen ?? [],
    );
    expect(achsen.map((achse) => achse.name)).not.toContain("rules");
    const tabelo = data.eroj.find((entry) => entry.ero === "tabelo")?.zeilen[0];
    expect(tabelo?.achsen?.find((achse) => achse.name === "lines")).toEqual({
      name: "lines",
      werte: ["rows", "columns", "grid", "none"],
      fonto: "dividers",
      neu: true,
    });
    const plan = read("specs/029-fonto-astryx/plan.md");
    expect(plan).toContain("### Entscheidungen vom 24.10.");
    expect(plan).toContain("`lines`");
    expect(plan).not.toMatch(/`tone`, `rules`/);
  });

  it("the plan shows every row with its proposal, the patterns, the missing genera and the guide; tasks the red commit", () => {
    const data = abgleich();
    const plan = read("specs/029-fonto-astryx/plan.md");
    for (const heading of [
      "## ②a Abgleichstabelle",
      "### Zusammenfassung",
      "### Fonto (gepinnt)",
      "### Muster",
      "### Abgleich je Ero",
      "### Fehlende Gattungen",
      "### Abweichungen",
      "### Offen (für den Maintainer)",
      "### Messanleitung",
    ]) {
      expect(plan, heading).toContain(heading);
    }
    for (const zeile of [...data.muster, ...data.eroj.flatMap((entry) => entry.zeilen)]) {
      expect(plan, zeile.id).toContain(`| ${zeile.id} |`);
      const line = plan.split("\n").find((entry) => entry.startsWith(`| ${zeile.id} |`));
      expect(line, zeile.id).toContain(`**${zeile.vorschlag}**`);
    }
    for (const gattung of data.fehlend) expect(plan, gattung.fonto).toContain(gattung.fonto);
    for (const term of [
      data.fonto.commit,
      "cd /Users/thorstenjankowski/n8n-compose/20260918_fundamento-ds",
      "file:///Users/thorstenjankowski/n8n-compose/20260918_fundamento-ds/specs/029-fonto-astryx/",
    ]) {
      expect(plan, term).toContain(term);
    }
    expect(plan).not.toContain("ciferecigo");
    expect(read("specs/029-fonto-astryx/tasks.md")).toMatch(/rot `[0-9a-f]{7}`/);
    expect(read("docs/vojmapo.md")).toContain("Spec 029 ②a");
  });
});

// Spec 032 (Sitzung C, 2026-10-24): specs/032-benchmark-astryx-kern carries the briefing unchanged;
// the benchmark file of Astryx stands unchanged in research/ beside the one of Carbon (PR #1 of the
// benchmark repo, a745aea); the plan carries the cause of the cold check_contrast, the decisions on
// the fingerprints, deviations, findings, open points and the measuring guide with full paths, cd
// and file:// links, five perf runs with median and maximum; tasks the red commit.
describe("Spec 032 documentation (specs/032-benchmark-astryx-kern)", () => {
  it("the briefing and the benchmark file of Astryx are copied unchanged", () => {
    const briefing = read("specs/032-benchmark-astryx-kern/briefing.md");
    expect(createHash("sha256").update(briefing).digest("hex")).toBe(
      "8ef0197993e4c8763a9ec5031eb0e73ee37316e866ddfd754e3bc0901457d628",
    );
    const benchmark = read("research/benchmark-astryx-2026-10.md");
    expect(createHash("sha256").update(benchmark).digest("hex")).toBe(
      "ac9c6344aceffd84d01fcd1de271e9e2c33f9dd62ab71264b0d3291e78f064c5",
    );
    expect(benchmark).toMatch(/^# Benchmark Astryx, Oktober 2026: Kennzahlen, Checklisten, Lücken/);
    expect(benchmark).toContain("<!-- spuroj-anfang -->");
  });

  it("plan and tasks carry the cause, the decisions, five perf runs and the guide", () => {
    const plan = read("specs/032-benchmark-astryx-kern/plan.md");
    for (const heading of [
      "### Zusammenfassung",
      "### Ursachen",
      "### Entwurfsentscheidungen",
      "### Abweichungen",
      "### Befunde / Mankoj",
      "### Offen (für den Maintainer)",
      "### Messanleitung",
    ]) {
      expect(plan, heading).toContain(heading);
    }
    for (const term of [
      "overlayOf",
      "fonto-listoj.json",
      "Median",
      "Maximum",
      "fünf Läufe",
      "Jugxo",
      "Kialo",
      "#111",
      "cd /Users/thorstenjankowski/n8n-compose/20260918_fundamento-ds",
      "file:///Users/thorstenjankowski/n8n-compose/20260918_fundamento-ds/",
    ]) {
      expect(plan, term).toContain(term);
    }
    const tasks = read("specs/032-benchmark-astryx-kern/tasks.md");
    for (const text of [plan, tasks]) expect(text).not.toContain("ciferecigo");
    expect(tasks).toMatch(/rot `[0-9a-f]{7}`/);
    expect(read("docs/vojmapo.md")).toContain("Spec 032");
  });
});

// Nachlese 12 (2026-10-29): specs/034-nachlese-12 carries the briefing unchanged, a plan with the
// measuring point "nach der Fonto" in the series H, K and O, Reihe O with one tool over all three
// points, M5 robust without raising the limit (with the Gegenprobe of 80 ms) and the Vitrino with
// its KontrastParoj once; the measuring guide with full paths, cd and file:// links; tasks with the
// red commit. No key in any of them.
describe("Nachlese 12 documentation (specs/034-nachlese-12)", () => {
  it("the briefing is copied unchanged; plan and tasks carry the series, M5, the Vitrino and the guide", () => {
    const briefing = read("specs/034-nachlese-12/briefing.md");
    expect(createHash("sha256").update(briefing).digest("hex")).toBe(
      "d9b851b665200c2e3460132a845c3274741188a4288ff8173cdd815f1e7cdb60",
    );
    const plan = read("specs/034-nachlese-12/plan.md");
    for (const heading of [
      "### Zusammenfassung",
      "### Entwurfsentscheidungen",
      "### Messpunkte",
      "### Abweichungen",
      "### Befunde / Mankoj",
      "### Offen (für den Maintainer)",
      "### Messanleitung",
    ]) {
      expect(plan, heading).toContain(heading);
    }
    for (const term of [
      "Reihe H",
      "Reihe K",
      "Reihe O",
      "Ausgangslinie",
      "nach den Korrekturen",
      "nach der Fonto",
      "Kosten",
      "Anfragen",
      "Top-10",
      "M5",
      "Gegenprobe",
      "80 ms",
      "Vitrino",
      "MB",
      "cd /Users/thorstenjankowski/n8n-compose/20260918_fundamento-ds",
      "file:///Users/thorstenjankowski/n8n-compose/20260918_fundamento-ds/",
    ]) {
      expect(plan, term).toContain(term);
    }
    const tasks = read("specs/034-nachlese-12/tasks.md");
    for (const text of [plan, tasks]) {
      expect(text).not.toMatch(/sk-[A-Za-z0-9_-]{8,}|Bearer [A-Za-z0-9]/);
      expect(text).not.toContain("ciferecigo");
    }
    expect(tasks).toMatch(/rot `[0-9a-f]{7}`/);
    expect(read("docs/vojmapo.md")).toContain("Nachlese 12");
  });
});

// Spec 033 S1 (Markenassistent, 2026-10-29): specs/033-markenassistent carries the spec unchanged;
// Constitution Amendment v2.5 (freigegeben vom Maintainer am 24.10., 13:41): Art. VI „Plattform und
// Herausgeber“ word for word, the terms of the brand's record and of the assistant, the history;
// the plan with the decisions, the measuring guide with full paths, cd and file:// links and the
// tokens, cost and duration of the trial runs; tasks with the red commit.
describe("Spec 033 documentation (specs/033-markenassistent)", () => {
  it("the spec is copied unchanged", () => {
    const spec = read("specs/033-markenassistent/spec.md");
    expect(createHash("sha256").update(spec).digest("hex")).toBe(
      "b940b1fa224ece614c5302d392565c667b51180235356ac684f7edec1379f644",
    );
  });

  it("the Constitution is v2.5 with „Plattform und Herausgeber“ in Art. VI, the new terms and the history", () => {
    const constitution = read(".specify/memory/constitution.md");
    expect(constitution.split("\n")[2]).toMatch(/^Version 2\.5 · 2026-10-24/);
    const article = constitution.slice(
      constitution.indexOf("## Artikel VI"),
      constitution.indexOf("## Artikel VII"),
    );
    for (const sentence of [
      "**Plattform und Herausgeber.** Für Marken, die ein Nutzer mit Fundamentos Werkzeugen anlegt, ist Fundamento Plattform. Die Verantwortung für Marken- und Urheberrechte trägt der Nutzer. Das Werkzeug blockiert nicht. Es tut dreierlei:",
      "1. Es holt eine **Bestätigung** ein, sobald eine Marke auf einer fremden Marke aufbaut (Upload, Link oder Nennung): Der Nutzer hat die Rechte oder übernimmt die Verantwortung.",
      "2. Es zeigt **vor jedem Export und jeder Veröffentlichung** einen sichtbaren Hinweis auf mögliche Verwechselbarkeit.",
      "3. Es hält beides im **Protokoll der Marke** fest, mit Zeitpunkt.",
      "Für alles, was Fundamento selbst herausgibt (Kern-Repo, Vitrino, Beispielmarken, Pakete, Doku), ist Fundamento Herausgeber. Dafür gelten Art. V und „Kein Trittbrett“ unverändert. Testnachbauten fremder Marken bleiben lokal und werden nie veröffentlicht.",
      "Wird Fundamento als Dienst für andere betrieben, gehören Nutzungsbedingungen mit dieser Zusicherung und ein Meldeweg für Beschwerden dazu. Das regelt die Spec zur Delegation.",
    ]) {
      expect(article, sentence.slice(0, 40)).toContain(sentence);
    }
    // After „Kein Trittbrett“, before „Lücken werden geführt“.
    expect(article.indexOf("**Kein Trittbrett.**")).toBeLessThan(
      article.indexOf("**Plattform und Herausgeber.**"),
    );
    expect(article.indexOf("**Plattform und Herausgeber.**")).toBeLessThan(
      article.indexOf("**Lücken werden geführt (Manko).**"),
    );
    expect(constitution).toContain("| **Kroniko** |");
    expect(constitution).toContain("| **Asistanto** |");
    expect(constitution).toContain("v2.5 (Spec 033");
    const ontologio = JSON.parse(read("packages/modelo/data/ontologio.json")) as {
      concepts: { term: string }[];
    };
    const terms = ontologio.concepts.map((concept) => concept.term);
    for (const term of ["Kroniko", "Asistanto", "Faceto"]) expect(terms).toContain(term);
  });

  it("plan and tasks carry the decisions, the trial runs and the guide", () => {
    const plan = read("specs/033-markenassistent/plan.md");
    for (const heading of [
      "### Zusammenfassung",
      "### Constitution Amendment v2.5",
      "### Entwurfsentscheidungen",
      "### Probeläufe",
      "### Abweichungen",
      "### Befunde / Mankoj",
      "### Offen (für den Maintainer)",
      "### Messanleitung",
    ]) {
      expect(plan, heading).toContain(heading);
    }
    for (const term of [
      "Kroniko",
      "Faceto",
      "Asistanto",
      "ministral-14b-2512",
      ":free",
      "Tokens",
      "Kosten",
      "Dauer",
      "cd /Users/thorstenjankowski/n8n-compose/20260918_fundamento-ds",
      "file:///Users/thorstenjankowski/n8n-compose/20260918_fundamento-ds/",
    ]) {
      expect(plan, term).toContain(term);
    }
    const tasks = read("specs/033-markenassistent/tasks.md");
    for (const text of [plan, tasks]) expect(text).not.toContain("ciferecigo");
    expect(tasks).toMatch(/rot `[0-9a-f]{7}`/);
    expect(read("docs/vojmapo.md")).toContain("Spec 033");
  });

  it("S2 (Weg B): the plan names the Enportilo, the provenance, the confirmation and the measuring guide", () => {
    const plan = read("specs/033-markenassistent/plan.md");
    const s2 = plan.slice(plan.indexOf("## S2"));
    for (const term of [
      "Enportilo",
      "Herkunft",
      "Bestätigung",
      "PNG",
      "PDF",
      "CSS",
      "FM_TIPAROJ_REPO",
      "### Messanleitung",
    ]) {
      expect(s2, term).toContain(term);
    }
    expect(read("specs/033-markenassistent/tasks.md")).toContain("## S2");
  });

  it("S3 (Weg A): the plan names the Kreilo, the pairs of opposites, the 15 minutes and the trial run", () => {
    const plan = read("specs/033-markenassistent/plan.md");
    const s3 = plan.slice(plan.indexOf("## S3"));
    for (const term of [
      "Kreilo",
      "Gegensatzpaare",
      "15 Minuten",
      "100 %",
      "Tokens",
      "Kosten",
      "Dauer",
      "### Messanleitung",
    ]) {
      expect(s3, term).toContain(term);
    }
    expect(read("specs/033-markenassistent/tasks.md")).toContain("## S3");
  });

  it("S4 (Weg C): the plan names the research agent, observation, the confirmation, local and the trial run", () => {
    const plan = read("specs/033-markenassistent/plan.md");
    const s4 = plan.slice(plan.indexOf("## S4"));
    for (const term of [
      "Recherche-Agent",
      "Beobachtung",
      "Bestätigung",
      "lokal",
      "Tokens",
      "Kosten",
      "Dauer",
      "### Messanleitung",
    ]) {
      expect(s4, term).toContain(term);
    }
    expect(read("specs/033-markenassistent/tasks.md")).toContain("## S4");
  });

  it("S5 (Sprache): the plan names Voxtral with its exact model, the browser fallback and the trial run", () => {
    const plan = read("specs/033-markenassistent/plan.md");
    const s5 = plan.slice(plan.indexOf("## S5"));
    for (const term of [
      "voxtral-mini-transcribe-3-0",
      "Web Speech API",
      "parolo",
      "Tokens",
      "Kosten",
      "Dauer",
      "### Messanleitung",
    ]) {
      expect(s5, term).toContain(term);
    }
    expect(read("specs/033-markenassistent/tasks.md")).toContain("## S5");
  });

  it("S6 (Schätzung und Zähler): the plan names the price data, the bases and Abnahme 5 with its measurement", () => {
    const plan = read("specs/033-markenassistent/plan.md");
    const s6 = plan.slice(plan.indexOf("## S6"));
    for (const term of [
      "prezoj.json",
      "takso.json",
      "Nordstern",
      "Abnahme 5",
      "±50 %",
      "Tokens",
      "Kosten",
      "Dauer",
      "### Messanleitung",
    ]) {
      expect(s6, term).toContain(term);
    }
    expect(read("specs/033-markenassistent/tasks.md")).toContain("## S6");
  });

  it("the acceptance list stands at the top of the plan: S1 to S6 in order, each with cd, a full path and what to see", () => {
    const plan = read("specs/033-markenassistent/plan.md");
    const start = plan.indexOf("## Abnahmeliste");
    expect(start).toBeGreaterThan(-1);
    expect(start).toBeLessThan(plan.indexOf("## S1"));
    const liste = plan.slice(start, plan.indexOf("\n## ", start + 1));
    let last = -1;
    for (const stufe of ["S1", "S2", "S3", "S4", "S5", "S6"]) {
      const at = liste.indexOf(`### ${stufe}`);
      expect(at, stufe).toBeGreaterThan(last);
      last = at;
    }
    expect(
      liste.match(/cd \/Users\/thorstenjankowski\/n8n-compose\/20260918_fundamento-ds/g)?.length ??
        0,
    ).toBeGreaterThanOrEqual(6);
    expect(liste).toContain("file:///Users/thorstenjankowski/");
    expect(liste.match(/\*\*Sehen:\*\*/g)?.length ?? 0).toBeGreaterThanOrEqual(6);
  });

  it("trial runs go through tsx as a devDependency of the Metiejo, not through npx", () => {
    const pkg = JSON.parse(read("packages/metiejo/package.json")) as {
      devDependencies?: Record<string, string>;
    };
    expect(pkg.devDependencies?.tsx).toBeDefined();
    expect(existsSync(join(repoRoot, "packages/metiejo/scripts/abnahme-weg-a.ts"))).toBe(true);
    const plan = read("specs/033-markenassistent/plan.md");
    expect(plan).toContain("pnpm --filter @fundamento/metiejo exec tsx scripts/abnahme-weg-a.ts");
    expect(plan).not.toMatch(/npx tsx/);
  });

  it("S6 names the cause of B-13 measured per step and the decision on O-9", () => {
    const plan = read("specs/033-markenassistent/plan.md");
    const s6 = plan.slice(plan.indexOf("## S6"));
    expect(s6).toContain("Messung je Schritt");
    expect(s6).toMatch(/B-13[^\n]*Ursache/);
    expect(s6).toMatch(/O-9[^\n]*entschieden/);
  });

  it("S6 names the decision on O-10: export and projections in the Kroniko, the start value as fallback", () => {
    const plan = read("specs/033-markenassistent/plan.md");
    const s6 = plan.slice(plan.indexOf("## S6"));
    expect(s6).toMatch(/O-10[^\n]*entschieden/);
    for (const term of ["ago` `eksporto", "lokal aus dem Protokoll", "Rückfall"]) {
      expect(s6, term).toContain(term);
    }
  });
});

// Spec 029 ②b-1 (Maintainer 29.10.): the brief of get_ero lists the booleans in flags – a change
// for MCP clients, in the CHANGELOG ahead of the next release, with one sentence on the switch.
describe("Spec 029 ②b-1: the CHANGELOG names the flags of the brief for MCP clients", () => {
  it("has the unreleased section with the note for MCP clients", () => {
    const changelog = read("CHANGELOG.md");
    const unreleased = changelog.slice(
      changelog.indexOf("## Unveröffentlicht"),
      changelog.indexOf("## 0.2.0"),
    );
    expect(changelog.indexOf("## Unveröffentlicht")).toBeGreaterThan(-1);
    expect(changelog.indexOf("## Unveröffentlicht")).toBeLessThan(changelog.indexOf("## 0.2.0"));
    expect(unreleased).toContain("### Hinweis für MCP-Clients");
    expect(unreleased).toContain("`get_ero`");
    expect(unreleased).toContain("`flags`");
    expect(unreleased).toContain("`props`");
  });
});

// Spec 035 2.2 (D-04): label is a new prop of the 12 fields, additive (0.2.0 had no label at a
// field; no prop of 0.2.0 changes its meaning). The CHANGELOG says it to users ahead of the next
// release, with one sentence for code that set label as an undeclared attribute.
describe("Spec 035 2.2: the CHANGELOG names label at the fields for users", () => {
  it("has the note for users in the unreleased section, additive, with the sentence on migrating", () => {
    const changelog = read("CHANGELOG.md");
    const unreleased = changelog.slice(
      changelog.indexOf("## Unveröffentlicht"),
      changelog.indexOf("## 0.2.0"),
    );
    expect(unreleased).toContain("### Hinweis für Nutzer");
    const note = unreleased.slice(unreleased.indexOf("### Hinweis für Nutzer"));
    expect(note).toContain('`label="…"`');
    expect(note).toMatch(/sichtbar/);
    expect(note).toMatch(/additiv/);
    expect(note).toMatch(/Arkitekturo-Vertrag/);
    expect(note).toMatch(/Wer `label` bisher als nicht deklariertes Attribut/);
  });
});

// Abnahme #122, 6: the plan said that clearing a field says input and change; the elektilo and the
// listelektilo say change alone, as when a person chooses (their Skemo names change alone). The
// plan says so, with the reason.
describe("Abnahme #122: the plan names the events of clearing as the elements say them", () => {
  it("M-6: input and change where the Skemo names both, change alone at elektilo and listelektilo", () => {
    const plan = read("specs/029-fonto-astryx/plan.md");
    expect(plan).not.toContain("ein Druck leert den Wert, sagt input und change");
    expect(plan).toContain("elektilo und listelektilo sagen beim Leeren nur change");
  });
});
