import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { ENTITY_TYPES, idPatternFor } from "../contracts/index.js";
import { EXIT_DOMAIN_ERROR, EXIT_OK, EXIT_USAGE, type IdsCliEnv, runIdsCli } from "./cli.js";
import { defaultLockPath } from "./lock-file.js";
import { createIdGenerator, fixedUlidSource } from "./ulid-source.js";

const T0 = Date.UTC(2026, 8, 19, 12, 0, 0);

let dir: string;

const EMPTY_LOCK = '{\n  "ids": {}\n}\n';

beforeEach(() => {
  dir = mkdtempSync(join(tmpdir(), "fundamento-ids-"));
  // The CLI never creates a lock, so every lock the tests use exists up front.
  for (const name of ["ids.lock.json", "l.json", "x.json"]) {
    writeFileSync(join(dir, name), EMPTY_LOCK);
  }
  mkdirSync(join(dir, "default"));
  writeFileSync(join(dir, "default", "ids.lock.json"), EMPTY_LOCK);
});

afterEach(() => {
  rmSync(dir, { recursive: true, force: true });
});

interface Captured {
  code: number;
  stdout: string;
  stderr: string;
}

async function run(argv: readonly string[], seed = 1): Promise<Captured> {
  let stdout = "";
  let stderr = "";
  const env: IdsCliEnv = {
    cwd: dir,
    defaultLockPath: join(dir, "default", "ids.lock.json"),
    nextId: createIdGenerator(fixedUlidSource(T0, seed)),
    stdout: (text) => {
      stdout += text;
    },
    stderr: (text) => {
      stderr += text;
    },
  };
  const code = await runIdsCli(argv, env);
  return { code, stdout, stderr };
}

function readLock(path: string): unknown {
  return JSON.parse(readFileSync(path, "utf8"));
}

describe("id new", () => {
  it("appends one active ID to an existing lock and prints it", async () => {
    const out = await run(["new", "token", "--lock", "ids.lock.json"]);
    expect(out.code).toBe(EXIT_OK);
    expect(out.stderr).toBe("");
    const id = out.stdout.trim();
    expect(id).toMatch(idPatternFor("token"));
    expect(out.stdout).toBe(`${id}\n`);
    const text = readFileSync(join(dir, "ids.lock.json"), "utf8");
    expect(text).toBe(
      `{\n  "ids": {\n    "${id}": {\n      "status": "active",\n      "type": "token"\n    }\n  }\n}\n`,
    );
  });

  it("is an error for a mistyped --lock path and creates nothing (exit 1)", async () => {
    const out = await run(["new", "token", "--lock", "typo/ids.lock.jsn"]);
    expect(out.code).toBe(EXIT_DOMAIN_ERROR);
    expect(out.stdout).toBe("");
    expect(out.stderr).toContain("file-missing");
    expect(out.stderr).toContain(join(dir, "typo", "ids.lock.jsn"));
    expect(existsSync(join(dir, "typo"))).toBe(false);
  });

  it("is an error when the default lock is missing and creates nothing (exit 1)", async () => {
    rmSync(join(dir, "default"), { recursive: true });
    const out = await run(["new", "token"]);
    expect(out.code).toBe(EXIT_DOMAIN_ERROR);
    expect(out.stderr).toContain("file-missing");
    expect(existsSync(join(dir, "default"))).toBe(false);
  });

  it("uses the default lock path when --lock is omitted", async () => {
    const out = await run(["new", "dimensio"]);
    expect(out.code).toBe(EXIT_OK);
    const lock = readLock(join(dir, "default", "ids.lock.json"));
    expect(lock).toEqual({ ids: { [out.stdout.trim()]: { type: "dimensio", status: "active" } } });
  });

  it("allocates --count IDs, one per line, sorted", async () => {
    const out = await run(["new", "regulo", "--count", "3", "--lock", "l.json"]);
    expect(out.code).toBe(EXIT_OK);
    const ids = out.stdout.trimEnd().split("\n");
    expect(ids).toHaveLength(3);
    expect([...ids].sort()).toEqual(ids);
    for (const id of ids) {
      expect(id).toMatch(idPatternFor("regulo"));
    }
  });

  it("prints JSON with --json", async () => {
    const out = await run(["new", "jugxo", "--count", "2", "--json", "--lock", "l.json"]);
    expect(out.code).toBe(EXIT_OK);
    const parsed = JSON.parse(out.stdout) as { entityType: string; ids: string[]; lock: string };
    expect(parsed.entityType).toBe("jugxo");
    expect(parsed.ids).toHaveLength(2);
    expect(parsed.lock).toBe(join(dir, "l.json"));
  });

  it("leaves existing entries byte-identical apart from the new IDs", async () => {
    const first = await run(["new", "token", "--count", "2", "--lock", "l.json"], 1);
    const before = readFileSync(join(dir, "l.json"), "utf8");
    const second = await run(["new", "token", "--lock", "l.json"], 2);
    const after = readFileSync(join(dir, "l.json"), "utf8");
    const newId = second.stdout.trim();
    const withoutNew = JSON.parse(after) as { ids: Record<string, unknown> };
    delete withoutNew.ids[newId];
    expect(`${JSON.stringify(withoutNew, null, 2)}\n`).toBe(before);
    expect(first.stdout.trim().split("\n")).not.toContain(newId);
  });

  it("rejects an unknown entity type with the list of valid types (exit 2)", async () => {
    const out = await run(["new", "widget", "--lock", "l.json"]);
    expect(out.code).toBe(EXIT_USAGE);
    expect(out.stdout).toBe("");
    for (const type of ENTITY_TYPES) {
      expect(out.stderr).toContain(type);
    }
    expect(readFileSync(join(dir, "l.json"), "utf8")).toBe(EMPTY_LOCK);
  });

  it.each([["0"], ["-1"], ["abc"], ["1.5"]])("rejects --count %s (exit 2)", async (count) => {
    const out = await run(["new", "token", "--count", count, "--lock", "l.json"]);
    expect(out.code).toBe(EXIT_USAGE);
    expect(out.stderr).toContain("--count");
  });

  it("refuses to write when the existing lock is invalid (exit 1)", async () => {
    writeFileSync(join(dir, "l.json"), '{ "ids": { "bogus": { "type": "token" } } }\n');
    const out = await run(["new", "token", "--lock", "l.json"]);
    expect(out.code).toBe(EXIT_DOMAIN_ERROR);
    expect(out.stderr).toContain("schema-violation");
    expect(readFileSync(join(dir, "l.json"), "utf8")).toBe(
      '{ "ids": { "bogus": { "type": "token" } } }\n',
    );
  });

  it("reports unparseable lock JSON without a stack trace (exit 1)", async () => {
    writeFileSync(join(dir, "l.json"), "{ nope");
    const out = await run(["new", "token", "--lock", "l.json"]);
    expect(out.code).toBe(EXIT_DOMAIN_ERROR);
    expect(out.stderr).toContain("json-syntax");
    expect(out.stderr).not.toMatch(/\n\s+at /);
  });
});

describe("id retire", () => {
  it("marks an ID retired", async () => {
    const created = await run(["new", "token", "--lock", "l.json"]);
    const id = created.stdout.trim();
    const out = await run(["retire", id, "--lock", "l.json"]);
    expect(out.code).toBe(EXIT_OK);
    expect(out.stdout).toContain(id);
    expect(readLock(join(dir, "l.json"))).toEqual({
      ids: { [id]: { type: "token", status: "retired" } },
    });
  });

  it("is an error for an unknown ID (exit 1)", async () => {
    await run(["new", "token", "--lock", "l.json"]);
    const before = readFileSync(join(dir, "l.json"), "utf8");
    const out = await run(["retire", "tok_01J00000000000000000000009", "--lock", "l.json"]);
    expect(out.code).toBe(EXIT_DOMAIN_ERROR);
    expect(out.stderr).toContain("tok_01J00000000000000000000009");
    expect(readFileSync(join(dir, "l.json"), "utf8")).toBe(before);
  });

  it("is an error when the lock does not exist (exit 1)", async () => {
    const out = await run(["retire", "tok_01J00000000000000000000009", "--lock", "missing.json"]);
    expect(out.code).toBe(EXIT_DOMAIN_ERROR);
    expect(out.stderr).toContain("file-missing");
    expect(existsSync(join(dir, "missing.json"))).toBe(false);
  });

  it("requires exactly one ID (exit 2)", async () => {
    expect((await run(["retire"])).code).toBe(EXIT_USAGE);
    expect((await run(["retire", "a", "b"])).code).toBe(EXIT_USAGE);
  });
});

describe("usage", () => {
  it.each([[["--help"]], [["new", "--help"]], [["retire", "-h"]]])(
    "prints the documentation for %j",
    async (argv) => {
      const out = await run(argv);
      expect(out.code).toBe(EXIT_OK);
      expect(out.stdout).toContain("pnpm id:new <entityType>");
      expect(out.stdout).toContain("pnpm id:retire <id>");
      expect(out.stdout).toContain("--count");
      expect(out.stdout).toContain("packages/modelo/data/ids.lock.json");
      expect(out.stdout).toContain("tok");
    },
  );

  it.each([[[]], [["frobnicate"]], [["new"]], [["new", "token", "--bogus"]]])(
    "exits 2 for %j",
    async (argv) => {
      const out = await run(argv);
      expect(out.code).toBe(EXIT_USAGE);
      expect(out.stderr).toContain("Usage");
    },
  );
});

describe("defaultLockPath", () => {
  it("points at the package's data/ids.lock.json, independent of cwd", () => {
    const path = defaultLockPath();
    expect(path.endsWith(join("packages", "modelo", "data", "ids.lock.json"))).toBe(true);
    expect(existsSync(path)).toBe(true);
  });
});

describe("built CLI entry point", () => {
  const built = fileURLToPath(new URL("../../dist/ids/cli.js", import.meta.url));

  it("allocates into --lock from any cwd and documents itself in --help", () => {
    expect(existsSync(built), `missing ${built}; run the build first`).toBe(true);
    const help = spawnSync(process.execPath, [built, "--help"], { encoding: "utf8", cwd: dir });
    expect(help.status).toBe(EXIT_OK);
    expect(help.stdout).toContain("pnpm id:new");

    const created = spawnSync(
      process.execPath,
      [built, "new", "kontrastParo", "--lock", "x.json"],
      {
        encoding: "utf8",
        cwd: dir,
        // pnpm sets INIT_CWD, which the CLI prefers over cwd; drop it so the lock lands in `dir`.
        env: { ...process.env, INIT_CWD: dir },
      },
    );
    expect(created.status).toBe(EXIT_OK);
    expect(created.stdout.trim()).toMatch(idPatternFor("kontrastParo"));

    const bad = spawnSync(process.execPath, [built, "new", "widget"], {
      encoding: "utf8",
      cwd: dir,
    });
    expect(bad.status).toBe(EXIT_USAGE);
    expect(bad.stderr).not.toMatch(/\n\s+at /);
  });
});
