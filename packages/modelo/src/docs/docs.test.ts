// Document assertions for the Spec-Kit artifacts and the README (FUND-5.2; S1, FR-19, AK-08,
// AK-09, AK-11). Read-only: nothing here writes into the repo.

import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { findBrandValues, repoFingerprints } from "../checks/clean-room/marko-spuro.js";

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
    expect(findBrandValues(file, read(file), repoFingerprints())).toEqual([]);
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
    expect(findBrandValues(file, read(file), repoFingerprints())).toEqual([]);
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

  it("the README names the four Ero tools and counts eighteen", () => {
    for (const tool of ["list_eroj", "get_ero", "suggest_ero", "check_usage"]) {
      expect(mcp, tool).toContain(`\`${tool}\``);
    }
    expect(mcp).toContain("18 tools");
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

  it("the vojmapo records Phase 3 as implemented and awaiting the acceptance", () => {
    const vojmapo = read("docs/vojmapo.md");
    const phase3 = vojmapo.split("\n").find((line) => line.startsWith("| 3 |")) ?? "";
    expect(phase3).toContain("umgesetzt");
    expect(phase3).toContain("Abnahme");
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

describe("Spec 004 documentation (T001, Constitution v1.7)", () => {
  const constitution = read(".specify/memory/constitution.md");
  const BENCHMARK_SENTENCE =
    "Ein fremdes System mit offener, nachgewiesener Lizenz darf als Benchmark-Aspekto importiert werden, um es mit denselben Prüfungen zu messen.";
  const SOURCE_RULE = "Quellmaterial anderer Systeme wird dem Coding-Tool nicht vorgelegt.";

  it("the Constitution header says version 1.7", () => {
    expect(constitution.split("\n")[2]).toMatch(/^Version 1\.7 · /);
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

  it("v1.7 does not yet carry the principle Fluida Marko", () => {
    expect(constitution).not.toContain("Fluida Marko");
  });
});
