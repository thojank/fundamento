// AK-04 / FR-09 / FR-14 (Spec 001, task T007): the Phase-0 IDs survive the move of `neutra` into
// the package `@fundamento/aspekto-komuna`. Compared against the frozen Phase-0 registry (K1);
// no git.

import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { loadModelo } from "../load/load-modelo.js";
import { defaultModeloSource } from "../load/source.js";

type Lock = { ids: Record<string, { status: string; type: string }> };
const readJson = <T>(url: URL | string): T => JSON.parse(readFileSync(url, "utf8")) as T;

const phase0 = readJson<Lock>(new URL("../../test/fixtures/phase0-ids.lock.json", import.meta.url));
const coreLock = readJson<Lock>(new URL("../../data/ids.lock.json", import.meta.url));
const komunaDir = fileURLToPath(
  new URL(".", import.meta.resolve("@fundamento/aspekto-komuna/package.json")),
);
const komunaLock = readJson<Lock>(`${komunaDir}ids.lock.json`);
const komuna = readJson<{ id: string; name: string }>(`${komunaDir}aspekto.json`);

const NEUTRA_ID = "dva_01M2VEEDQEJEE7MR7JA8JRPMJB";

describe("AK-04: Phase-0 IDs after the migration", () => {
  it("keeps every Phase-0 ID active in exactly one of the current registries", () => {
    for (const [id, entry] of Object.entries(phase0.ids)) {
      const holders = [coreLock, komunaLock].filter((lock) => lock.ids[id] !== undefined);
      expect(holders, id).toHaveLength(1);
      expect(holders[0]?.ids[id], id).toEqual(entry);
    }
  });

  it("gives komuna the ID that neutra had, with no new DimensioValoro ID", () => {
    expect(komuna).toMatchObject({ id: NEUTRA_ID, name: "komuna" });
    const dvaIds = Object.keys(komunaLock.ids).filter((id) => id.startsWith("dva_"));
    expect(dvaIds).toEqual([NEUTRA_ID]);
    const newDva = Object.keys(coreLock.ids).filter(
      (id) => id.startsWith("dva_") && phase0.ids[id] === undefined,
    );
    expect(newDva).toEqual([]);
  });

  // FR-14: the migration keeps every Phase-0 ID. Later specs may retire an ID of their own — Spec
  // 004 retired two overlay steps it had minted the same day — but no ID of Phase 0.
  it("has retired no Phase-0 ID (FR-14)", () => {
    for (const lock of [coreLock, komunaLock]) {
      const retired = Object.entries(lock.ids)
        .filter(([, entry]) => entry.status === "retired")
        .map(([id]) => id);
      expect(retired.filter((id) => phase0.ids[id] !== undefined)).toEqual([]);
    }
  });

  it("composes komuna into the repo Modelo under its old ID", () => {
    const { modelo } = loadModelo(defaultModeloSource());
    const aspekto = modelo?.dimensioj.find((dimensio) => dimensio.name === "aspekto");
    expect(aspekto?.valoroj?.map((valoro) => [valoro.name, valoro.id])).toEqual([
      ["komuna", NEUTRA_ID],
    ]);
  });
});
