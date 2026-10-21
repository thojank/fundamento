// The settings of the Metiejo (Spec 023, §4.3, §4.5, M-7): read from the `.env` of the checkout
// root only, the names of this spec only, values never shown; `.env` ignored, `.env.example` in the
// repo with the names and empty values.

import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { afterAll, describe, expect, it } from "vitest";
import { ENV_NAMES, envExampleText, parseEnv, readSettings, settingsOf } from "./env.js";

const repoRoot = fileURLToPath(new URL("../../../", import.meta.url));
const scratch = mkdtempSync(join(tmpdir(), "fm-metiejo-env-"));
afterAll(() => rmSync(scratch, { recursive: true, force: true }));

describe("the names of the settings (§4.3)", () => {
  it("are the six of the spec, in its order", () => {
    expect([...ENV_NAMES]).toEqual([
      "FM_TIPAROJ_REPO",
      "FM_KI_ANBIETER",
      "FM_KI_MODELL",
      "MISTRAL_API_KEY",
      "OPENAI_API_KEY",
      "OPENROUTER_API_KEY",
    ]);
  });
});

describe("parseEnv", () => {
  it("reads only the variables of the spec, with quotes stripped, comments and export prefixes aside", () => {
    const values = parseEnv(
      [
        "# the fonts",
        "FM_TIPAROJ_REPO=owner/name",
        "export OPENAI_API_KEY='sk-geheim-123'",
        'FM_KI_MODELL="ein modell"  ',
        "OTHER=1",
        "PATH=/usr/bin",
        "",
        "broken line without equals",
      ].join("\n"),
    );
    expect(values).toEqual({
      FM_TIPAROJ_REPO: "owner/name",
      OPENAI_API_KEY: "sk-geheim-123",
      FM_KI_MODELL: "ein modell",
    });
  });

  it("treats an empty value as absent", () => {
    expect(parseEnv("FM_TIPAROJ_REPO=\nOPENAI_API_KEY=''\n")).toEqual({});
  });
});

describe("settingsOf (M-7)", () => {
  it("exposes the repository name and the names that are set, never the value of a key", () => {
    const settings = settingsOf({
      FM_TIPAROJ_REPO: "owner/name",
      OPENAI_API_KEY: "sk-geheim-123",
    });
    expect(settings).toEqual({
      tiparojRepo: "owner/name",
      present: ["FM_TIPAROJ_REPO", "OPENAI_API_KEY"],
    });
    expect(JSON.stringify(settings)).not.toContain("sk-geheim");
  });

  it("knows no repository when FM_TIPAROJ_REPO is empty or not a owner/name", () => {
    expect(settingsOf({})).toEqual({ present: [] });
    expect(settingsOf({ FM_TIPAROJ_REPO: "nur-ein-wort" })).toEqual({
      present: ["FM_TIPAROJ_REPO"],
    });
  });
});

describe("readSettings", () => {
  it("reads <root>/.env when it exists and nothing else", () => {
    const without = join(scratch, "ohne");
    mkdirSync(without, { recursive: true });
    writeFileSync(join(without, "stray.env"), "FM_TIPAROJ_REPO=x/y\n");
    expect(readSettings(without)).toEqual({ present: [] });
    const withEnv = join(scratch, "mit");
    mkdirSync(withEnv, { recursive: true });
    writeFileSync(join(withEnv, ".env"), "FM_TIPAROJ_REPO=owner/name\nMISTRAL_API_KEY=abc\n");
    expect(readSettings(withEnv)).toEqual({
      tiparojRepo: "owner/name",
      present: ["FM_TIPAROJ_REPO", "MISTRAL_API_KEY"],
    });
  });
});

describe("the files of the checkout (§4.3)", () => {
  it(".env is ignored by git", () => {
    const run = spawnSync("git", ["check-ignore", "-q", ".env"], { cwd: repoRoot });
    expect(run.status).toBe(0);
  });

  it(".env.example is in the repo, not ignored, with the names and empty values, without the repository name", () => {
    const file = join(repoRoot, ".env.example");
    expect(existsSync(file)).toBe(true);
    const run = spawnSync("git", ["check-ignore", "-q", ".env.example"], { cwd: repoRoot });
    expect(run.status, "not ignored").toBe(1);
    const text = readFileSync(file, "utf8");
    expect(text).toBe(envExampleText());
    for (const name of ENV_NAMES) expect(text).toMatch(new RegExp(`^${name}=$`, "m"));
    expect(parseEnv(text)).toEqual({});
  });
});
