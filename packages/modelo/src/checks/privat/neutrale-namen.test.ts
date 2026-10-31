// Spec 036 Teil 6 (D-11, D-23, D-24, D-25): the codemod scripts/neutrale-namen/. Every fixture is a
// temporary git repository whose old names are composed at run time (D-23); nothing here names
// them in plain text. Mapping per rule, exceptions untouched, a second run changes nothing, and
// nothing outside the tracked files of the checkout is touched.

import { execFileSync, spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import {
  mkdirSync,
  mkdtempSync,
  readdirSync,
  readFileSync,
  rmSync,
  symlinkSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { Ajv2020 } from "ajv/dist/2020.js";
import addFormats from "ajv-formats";
import { afterEach, describe, expect, it } from "vitest";
import {
  type CodemodIo,
  EXIT_FAIL,
  EXIT_OK,
  EXIT_USAGE,
  main,
  runCodemod,
} from "../../../../../scripts/neutrale-namen/codemod.mjs";
import {
  composedWordExpression,
  EXCEPTIONS_FILE,
  GENERATORS,
  mapIdentifiers,
  mapText,
  NEW_NAMES,
  oldNames,
  RULE_IDS,
  schemaUrn,
} from "../../../../../scripts/neutrale-namen/rules.mjs";

const repoRoot = fileURLToPath(new URL("../../../../../", import.meta.url));
const codemodPath = fileURLToPath(
  new URL("../../../../../scripts/neutrale-namen/codemod.mjs", import.meta.url),
);
const old = oldNames();
const w = old.word;
const sha256 = (data: string | Buffer) => createHash("sha256").update(data).digest("hex");

const tempDirs: string[] = [];
afterEach(() => {
  for (const dir of tempDirs.splice(0)) rmSync(dir, { recursive: true, force: true });
});

function tempDir(prefix: string): string {
  const dir = mkdtempSync(join(tmpdir(), prefix));
  tempDirs.push(dir);
  return dir;
}

function writeFiles(root: string, files: Record<string, string | Buffer>): void {
  for (const [path, content] of Object.entries(files)) {
    mkdirSync(dirname(join(root, path)), { recursive: true });
    writeFileSync(join(root, path), content);
  }
}

/** A temporary git repository with `files` tracked (added to the index, no commit needed). */
function gitRepo(files: Record<string, string | Buffer>): string {
  const root = join(tempDir("fm-neutrale-namen-"), "repo");
  mkdirSync(root);
  execFileSync("git", ["init", "-q"], { cwd: root });
  writeFiles(root, files);
  execFileSync("git", ["add", "-A"], { cwd: root });
  return root;
}

const read = (root: string, path: string) => readFileSync(join(root, path), "utf8");

const EXCEPTION_PATH = "specs/035-ekzemplo/spec.md";
const exceptionsJson = `${JSON.stringify(
  {
    escepoj: [
      { path: EXCEPTION_PATH, sha256: "0".repeat(64), kialo: "Verbatim copy in the fixture." },
      { path: "specs/036-ekzemplo/spec.md", sha256: "1".repeat(64), kialo: "Listed, missing." },
    ],
  },
  null,
  2,
)}\n`;

const constitution = [
  "Version 2.5 · 2026-10-24 · Status: ratifiziert",
  `| **Aspekto** | Markenausprägung | \`aspekto: komuna\` (Referenz, MIT), \`aspekto: ${w}\` (extern, proprietär) |`,
  `mit eigener Lizenz und eigenen Rechten (z. B. \`${w}\`), und werden eingebunden.`,
  `\`fm init\` für ein neues Projekt und \`fm aspekto use ${w}\` für den Markenwechsel.`,
  `| 1 | Vortaro | Aspekto \`komuna\` (Referenz, Geist), externes Aspekto-Paket \`${w}\`, MCP |`,
  "- Änderungshistorie: v2.5 (Spec 033): Kroniko. Migration: keine Änderung an bestehenden Daten.",
  "",
].join("\n");

const vojmapo = [
  `| 1 | 001 | Export je Aspekto, externes Paket \`${w}\` (abgeleitet, privat) | ✅ |`,
  `Prototyp ist die ${w}-Ableitung aus Phase 1. (Befund ${w} sunken)`,
  `abgeleitet (wie ${w}) und vollständig; ab (wie bei ${w}), oder`,
  `| Statusflächen | Abnahme ${w} | Spec 002 FR-07 |`,
  `| \`${old.fontRepoName}\` | privat (\`${old.fontRepoFull}\`) | proprietär |`,
  "",
].join("\n");

/** One file per rule, with the old names composed at run time. */
function fixtureFiles(): Record<string, string | Buffer> {
  return {
    [EXCEPTIONS_FILE]: exceptionsJson,
    "packages/vortaro/sets/core.json": `{ "color": { "$extensions": { "${old.extensionKey}": { "id": "tok_1" } } } }\n`,
    "packages/modelo/src/validate/ext.ts": `${String.raw`const EXT = "/\\$extensions/com\\.${w}\\.fundamento";`}\n`,
    "packages/modelo/schema/modelo.schema.json": `{ "$id": "${old.schemaBase}modelo.schema.json", "$defs": { "Name": { "type": "string" } } }\n`,
    "packages/mcp/schema/common.json": `{ "$id": "${old.schemaBase}mcp/common.json", "$defs": { "Issue": { "$ref": "${old.schemaBase}modelo.schema.json#/$defs/Name" } } }\n`,
    "packages/modelo/schema/ontologio.schema.json":
      `{ "const": "${old.ontologioBase}", "pattern": ` +
      String.raw`"^https://fundamento\\.${w}\\.com/ontologio#[A-Z][A-Za-z-]*$"` +
      ` }\n`,
    "packages/modelo/data/ontologio.json": `{ "uri": "${old.ontologioBase}#Aspekto" }\n`,
    "packages/modelo/data/reguloj.json": `{ "kialo": "(Art. VI, finding from the ${w} acceptance)." }\n`,
    LICENSE: `MIT License\n\nCopyright (c) 2026 Thorsten Jankowski (${w}.com)\n`,
    "README.md": `## License\n\nMIT · Author: Thorsten Jankowski · [${w}.com](https://${w}.com)\n`,
    ".specify/memory/constitution.md": constitution,
    "docs/vojmapo.md": vojmapo,
    "specs/001-ekzemplo/plan.md": `Abnahme ${w}; repo \`${old.fontRepoFull}\`; folder \`../${old.fontRepoName}\`; archive \`${old.fontRepoName}.tar.gz\`; site ${w}.de; **${w.toUpperCase()}**; schema \`${old.schemaBase}…\`.\n`,
    "packages/metiejo/src/ekzemplo.test.ts": `expect(plan).not.toContain("${w}");\nexpect(text).not.toMatch(/\\b${w}\\b/);\nexpect(spec).toContain("**E8** ${w} erscheint nirgends.");\n`,
    [EXCEPTION_PATH]: `Verbatim: ${old.extensionKey} and ${w}.\n`,
    "packages/modelo/src/clean.ts": "export const CLEAN = true;\n",
  };
}

const expected: Record<string, string> = {
  "packages/vortaro/sets/core.json": `{ "color": { "$extensions": { "fundamento": { "id": "tok_1" } } } }\n`,
  "packages/modelo/src/validate/ext.ts": `${String.raw`const EXT = "/\\$extensions/fundamento";`}\n`,
  "packages/modelo/schema/modelo.schema.json": `{ "$id": "urn:fundamento:schema:modelo", "$defs": { "Name": { "type": "string" } } }\n`,
  "packages/mcp/schema/common.json": `{ "$id": "urn:fundamento:schema:mcp:common", "$defs": { "Issue": { "$ref": "urn:fundamento:schema:modelo#/$defs/Name" } } }\n`,
  "packages/modelo/schema/ontologio.schema.json":
    '{ "const": "urn:fundamento:ontologio", "pattern": "^urn:fundamento:ontologio#[A-Z][A-Za-z-]*$" }\n',
  "packages/modelo/data/ontologio.json": `{ "uri": "urn:fundamento:ontologio#Aspekto" }\n`,
  "packages/modelo/data/reguloj.json": `{ "kialo": "(Art. VI, finding from the acceptance of a private Aspekto)." }\n`,
  LICENSE: "MIT License\n\nCopyright (c) 2026 Thorsten Jankowski\n",
  "README.md": "## License\n\nMIT · Author: Thorsten Jankowski\n",
  "docs/vojmapo.md": [
    "| 1 | 001 | Export je Aspekto, externes, privates Aspekto-Paket (abgeleitet) | ✅ |",
    "Prototyp ist die Ableitung des privaten Aspekto-Pakets aus Phase 1. (Befund sunken aus dem privaten Aspekto-Paket)",
    "abgeleitet (wie beim privaten Aspekto-Paket) und vollständig; ab (wie beim privaten Aspekto-Paket), oder",
    "| Statusflächen | Abnahme des privaten Aspekto-Pakets | Spec 002 FR-07 |",
    "| privates Aspekto-Paket | privat (Repo aus `FM_TIPAROJ_REPO`) | proprietär |",
    "",
  ].join("\n"),
  "specs/001-ekzemplo/plan.md":
    "Abnahme privata; repo `$FM_TIPAROJ_REPO`; folder `../fundamento-tiparoj-privataj`; archive `fundamento-tiparoj-privataj.tar.gz`; site privata.example; **privata**; schema `urn:fundamento:schema:…`.\n",
};

const io = (cwd: string) => {
  const out = { stdout: "", stderr: "" };
  const handle: CodemodIo = {
    cwd,
    stdout: (text) => {
      out.stdout += text;
    },
    stderr: (text) => {
      out.stderr += text;
    },
  };
  return { out, handle };
};

describe("the old names of the rule table (D-23)", () => {
  it("are composed at run time and match the hashes check:privat knows", () => {
    expect(sha256(w)).toBe("fc3ef5e45146b121208e44b2d8c7c1f3f6f7e75efa2fde2d1afd072ff26e26eb");
    expect(sha256(old.fontRepoName)).toBe(
      "a34fce80f881d3aba92b597410a051ffa2febb800b3510f09b4f2aa35184b67d",
    );
    expect(old.extensionKey.split(".")).toEqual(["com", w, "fundamento"]);
  });

  it("stand in no file of the script as plain text", () => {
    const dir = fileURLToPath(new URL("../../../../../scripts/neutrale-namen/", import.meta.url));
    for (const name of readdirSync(dir)) {
      expect(readFileSync(join(dir, name), "utf8").toLowerCase(), name).not.toContain(w);
    }
  });

  it("the composed expression of a test evaluates to the word", () => {
    expect(new Function(`return ${composedWordExpression()};`)()).toBe(w);
  });
});

describe("schema IDs and the ontology (D-25)", () => {
  it("maps a schema path to its URN", () => {
    expect(schemaUrn("modelo.schema.json")).toBe("urn:fundamento:schema:modelo");
    expect(schemaUrn("config.schema.json")).toBe("urn:fundamento:schema:config");
    expect(schemaUrn("mcp/common.json")).toBe("urn:fundamento:schema:mcp:common");
    expect(schemaUrn("mcp/get_ero.output.json")).toBe("urn:fundamento:schema:mcp:get_ero.output");
  });

  it("maps only the identifiers for the readers, fragments kept", () => {
    const text = `"${old.extensionKey}" ${old.schemaBase}modelo.schema.json#/$defs/Name ${old.ontologioBase}#Uzo, ${w}`;
    expect(mapIdentifiers(text)).toBe(
      `"fundamento" urn:fundamento:schema:modelo#/$defs/Name urn:fundamento:ontologio#Uzo, ${w}`,
    );
  });

  // Blocker 7: a relative $ref between schema files would not resolve against a URN base.
  it("leaves no schema of the repo with a relative cross-file $ref, and Ajv loads every one", () => {
    const schemaFiles = execFileSync("git", ["-C", repoRoot, "ls-files", "-z"], {
      encoding: "utf8",
    })
      .split("\0")
      .filter((path) => /^packages\/(modelo\/schema\/[^/]+|mcp\/schema\/.+)\.json$/.test(path));
    expect(schemaFiles.length).toBeGreaterThan(40);
    const schemas = schemaFiles.map((path) => {
      const mapped = mapText(readFileSync(join(repoRoot, path), "utf8"), path).text;
      expect(mapped.toLowerCase(), path).not.toContain(w);
      return { path, schema: JSON.parse(mapped) as Record<string, unknown> };
    });
    const refs: string[] = [];
    const collect = (value: unknown): void => {
      if (Array.isArray(value)) value.forEach(collect);
      else if (typeof value === "object" && value !== null) {
        for (const [key, child] of Object.entries(value)) {
          if (key === "$ref" && typeof child === "string") refs.push(child);
          else collect(child);
        }
      }
    };
    for (const { path, schema } of schemas) {
      // A tool schema without an $id is compiled on its own; every $id is a URN.
      if (schema.$id !== undefined) {
        expect(String(schema.$id), path).toMatch(/^urn:fundamento:schema:[a-z0-9_.:-]+$/);
      }
      collect(schema);
    }
    expect(schemas.filter(({ schema }) => schema.$id !== undefined).length).toBeGreaterThan(40);
    expect(refs.length).toBeGreaterThan(100);
    expect(
      refs.filter((ref) => !ref.startsWith("#") && !ref.startsWith(NEW_NAMES.schemaPrefix)),
    ).toEqual([]);

    const ajv = new Ajv2020({ strict: true, allErrors: true });
    addFormats.default(ajv, ["date"]);
    for (const { schema } of schemas) if (schema.$id !== undefined) ajv.addSchema(schema);
    for (const { path, schema } of schemas) {
      const validate = () =>
        schema.$id === undefined ? ajv.compile(schema) : ajv.getSchema(String(schema.$id));
      expect(validate, path).not.toThrow();
      expect(validate(), path).toBeTypeOf("function");
    }
  });
});

describe("the codemod on a fixture repository", () => {
  it("maps every rule, leaves the exceptions alone and lists the files sorted", () => {
    const root = gitRepo(fixtureFiles());
    const exceptionBefore = read(root, EXCEPTION_PATH);
    const report = runCodemod({ root });
    for (const [path, text] of Object.entries(expected)) expect(read(root, path), path).toBe(text);
    expect(read(root, EXCEPTION_PATH)).toBe(exceptionBefore);
    expect(report.skipped.exceptions).toEqual([EXCEPTION_PATH]);
    const paths = report.changed.map((change) => change.path);
    expect(paths).toEqual([...paths].sort());
    expect(paths).not.toContain("packages/modelo/src/clean.ts");
    expect(new Set(report.changed.flatMap((change) => Object.keys(change.counts)))).toEqual(
      new Set(RULE_IDS),
    );
    // Nothing named in plain text is left outside the exception.
    for (const path of paths) expect(read(root, path).toLowerCase(), path).not.toContain(w);
  });

  it("rewrites the constitution as Amendment v2.6 (redaktionell)", () => {
    const root = gitRepo(fixtureFiles());
    runCodemod({ root });
    const text = read(root, ".specify/memory/constitution.md");
    expect(text).toContain("Version 2.6 · 2026-10-31 · Status: ratifiziert");
    expect(text).toContain(
      "`aspekto: komuna` (Referenz, MIT), ein privates Aspekto-Paket (extern, proprietär)",
    );
    expect(text).toContain("(z. B. ein privates Aspekto-Paket)");
    expect(text).toContain("`fm aspekto use <aspekto>`");
    expect(text).toContain("externes, privates Aspekto-Paket, MCP");
    expect(text).toContain("Migration: keine Änderung an bestehenden Daten; v2.6 (Spec 036 Teil 6");
    expect(text.match(/v2\.6 \(Spec 036/g)).toHaveLength(1);
  });

  it("composes the word in the assertions of a test, which still assert the same", () => {
    const root = gitRepo(fixtureFiles());
    runCodemod({ root });
    const text = read(root, "packages/metiejo/src/ekzemplo.test.ts");
    const composed = composedWordExpression();
    expect(text).toContain(`expect(plan).not.toContain(${composed});`);
    expect(text).toContain(`expect(text).not.toMatch(new RegExp(\`\\\\b\${${composed}}\\\\b\`));`);
    // The data the assertion is about is rewritten by the same placeholder.
    expect(text).toContain('expect(spec).toContain("**E8** privata erscheint nirgends.");');
    const pattern = new Function(`return new RegExp(\`\\\\b\${${composed}}\\\\b\`);`)() as RegExp;
    expect(pattern.test(`a ${w} b`)).toBe(true);
    expect(pattern.test(`a x${w} b`)).toBe(false);
  });

  it("changes nothing on a second run (idempotent), and --check agrees", () => {
    const root = gitRepo(fixtureFiles());
    expect(runCodemod({ root }).changed.length).toBeGreaterThan(10);
    const again = runCodemod({ root });
    expect(again.changed).toEqual([]);
    const { out, handle } = io(root);
    expect(main(["--check"], handle)).toBe(EXIT_OK);
    expect(out.stdout).toContain("0 of");
  });

  it("--dry-run lists what the run changes and writes nothing; --check exits 1", () => {
    const root = gitRepo(fixtureFiles());
    const before = Object.fromEntries(
      Object.keys(expected).map((path) => [path, read(root, path)]),
    );
    const dry = runCodemod({ root, dryRun: true });
    for (const [path, text] of Object.entries(before)) expect(read(root, path), path).toBe(text);
    const { out, handle } = io(root);
    expect(main(["--check"], handle)).toBe(EXIT_FAIL);
    expect(out.stdout).toContain(`${dry.changed.length} of`);
    const real = runCodemod({ root });
    expect(real.changed).toEqual(dry.changed);
  });

  it("touches nothing outside the tracked files: untracked, ignored, symlinked, outside", () => {
    const root = gitRepo(fixtureFiles());
    const outside = join(dirname(root), "outside.md");
    writeFileSync(outside, `outside ${w}\n`);
    writeFiles(root, {
      ".gitignore": "ignored.md\n",
      "ignored.md": `ignored ${w}\n`,
    });
    symlinkSync(outside, join(root, "link.md"));
    execFileSync("git", ["add", ".gitignore", "link.md"], { cwd: root });
    writeFiles(root, { "untracked.md": `untracked ${w}\n` });
    const report = runCodemod({ root });
    expect(readFileSync(outside, "utf8")).toBe(`outside ${w}\n`);
    expect(read(root, "ignored.md")).toBe(`ignored ${w}\n`);
    expect(read(root, "untracked.md")).toBe(`untracked ${w}\n`);
    expect(report.skipped.outside).toContain("link.md");
    expect(report.changed.map((change) => change.path)).not.toContain("link.md");
  });

  it("never rewrites a binary file and reports it", () => {
    const root = gitRepo({
      [EXCEPTIONS_FILE]: exceptionsJson,
      "bild.bin": Buffer.concat([Buffer.from([0xff, 0xfe, 0]), Buffer.from(w)]),
    });
    const before = readFileSync(join(root, "bild.bin"));
    const { out, handle } = io(root);
    expect(main([], handle)).toBe(EXIT_FAIL);
    expect(readFileSync(join(root, "bild.bin"))).toEqual(before);
    expect(out.stdout).toContain("ERROR binary file names the old name: bild.bin");
  });

  it("refuses to run without the exception list", () => {
    const root = gitRepo({ "a.md": `${w}\n` });
    const { out, handle } = io(root);
    expect(main([], handle)).toBe(EXIT_USAGE);
    expect(out.stderr).toContain(EXCEPTIONS_FILE);
    expect(read(root, "a.md")).toBe(`${w}\n`);
  });
});

describe("the generators (technical spec, Teil 6)", () => {
  const generatedPath = "packages/modelo/src/generated/modelo-schema.ts";
  const withGenerators = () =>
    gitRepo({
      ...fixtureFiles(),
      "package.json": `${JSON.stringify({ scripts: { build: "x", "vortaro:ero-tokenoj": "x" } })}\n`,
      "packages/modelo/package.json": `${JSON.stringify({ scripts: { "generate:types": "x" } })}\n`,
      [generatedPath]: `// $id ${old.schemaBase}modelo.schema.json\n`,
    });

  it("reruns the generators that exist, in order, instead of rewriting their outputs", () => {
    const root = withGenerators();
    const calls: string[] = [];
    const report = runCodemod({
      root,
      runCommand: (command, cwd) => {
        calls.push(command.join(" "));
        expect(cwd).toBe(root);
        if (command.includes("generate:types")) {
          // The output still holds what the generator wrote last: no text rule touched it.
          expect(read(root, generatedPath)).toContain(old.schemaBase);
          writeFileSync(join(root, generatedPath), "// $id urn:fundamento:schema:modelo\n");
        }
        return 0;
      },
    });
    expect(calls).toEqual(GENERATORS.map((generator) => generator.command.join(" ")));
    expect(report.skipped.generated).toEqual([generatedPath]);
    expect(report.generatedChanges).toEqual([generatedPath]);
    expect(report.left).toEqual([]);
    expect(report.generators.map((generator) => generator.code)).toEqual([0, 0, 0]);
  });

  it("fails when a generator fails, and stops there", () => {
    const root = withGenerators();
    const { out, handle } = io(root);
    handle.runCommand = () => 3;
    expect(main([], handle)).toBe(EXIT_FAIL);
    expect(out.stdout).toContain("Generator schema-types");
    expect(out.stdout).not.toContain("Generator build");
  });

  it("rewrites a generated file as text with --no-generators, and skips absent generators", () => {
    const root = withGenerators();
    const calls: string[] = [];
    runCodemod({
      root,
      generators: false,
      runCommand: () => {
        calls.push("x");
        return 0;
      },
    });
    expect(calls).toEqual([]);
    expect(read(root, generatedPath)).toBe("// $id urn:fundamento:schema:modelo\n");
    const plain = gitRepo(fixtureFiles());
    expect(runCodemod({ root: plain, runCommand: () => 1 }).generators).toEqual([]);
  });
});

describe("the codemod CLI", () => {
  it("is wired as a CLI with a help text", () => {
    const child = spawnSync(process.execPath, [codemodPath, "--help"], { encoding: "utf8" });
    expect(child.status).toBe(EXIT_OK);
    for (const option of [
      "--root",
      "--dry-run",
      "--check",
      "--exceptions",
      "--no-generators",
      "--json",
    ]) {
      expect(child.stdout).toContain(option);
    }
  });

  it("exits 2 for an unknown option", () => {
    const { out, handle } = io(repoRoot);
    expect(main(["--frobnicate"], handle)).toBe(EXIT_USAGE);
    expect(out.stderr).toContain("frobnicate");
  });

  it("prints the report as JSON with the totals per rule", () => {
    const root = gitRepo(fixtureFiles());
    const { out, handle } = io(root);
    expect(main(["--dry-run", "--json"], handle)).toBe(EXIT_OK);
    const report = JSON.parse(out.stdout) as { dryRun: boolean; totals: Record<string, number> };
    expect(report.dryRun).toBe(true);
    expect(Object.keys(report.totals)).toEqual([...RULE_IDS].sort());
  });
});

describe("the codemod over the repository, in memory", () => {
  it("leaves no old name in any tracked text file outside the exceptions", () => {
    const exceptions = new Set(
      (
        JSON.parse(readFileSync(join(repoRoot, EXCEPTIONS_FILE), "utf8")) as {
          escepoj: { path: string }[];
        }
      ).escepoj.map((entry) => entry.path),
    );
    const files = execFileSync("git", ["-C", repoRoot, "ls-files", "-z"], { encoding: "utf8" })
      .split("\0")
      .filter((path) => path !== "" && !exceptions.has(path));
    const left: string[] = [];
    for (const path of files) {
      const text = readFileSync(join(repoRoot, path), "utf8");
      if (mapText(text, path).text.toLowerCase().includes(w)) left.push(path);
    }
    expect(left).toEqual([]);
  });
});
