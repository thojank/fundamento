// Nachlese 8 ③: the Gvidanto answers in German with lingvo "de" — get_ero, get_sxablono,
// suggest_ero and explain_regulo — and as before in English without it.

import { defaultModeloSource, loadModelo } from "@fundamento/modelo";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import {
  type Connected,
  closeClients,
  connect,
  EKZEMPLO_CONFIG,
  output,
  preload,
} from "../test-doubles/client.js";

const { modelo } = loadModelo(defaultModeloSource());
if (modelo === undefined) throw new Error("the repo Modelo must load");
const de = modelo.tradukoj?.de ?? {};
const uzoOf = (name: string) => modelo.eroj.find((entry) => entry.ero.name === name)?.uzo;

afterAll(closeClients);
preload({ config: EKZEMPLO_CONFIG });

let client: Connected["client"];
beforeAll(async () => {
  ({ client } = await connect({ config: EKZEMPLO_CONFIG }));
});

describe("lingvo de (Nachlese 8 ③)", () => {
  it("get_ero: German with lingvo de, English without", async () => {
    type Answer = { uzo?: { purpose: string } };
    const deutsch = await output<Answer>(client, "get_ero", { name: "kampo", lingvo: "de" });
    const english = await output<Answer>(client, "get_ero", { name: "kampo" });
    expect(deutsch.uzo?.purpose).toBe(de[`${uzoOf("kampo")?.id}/purpose`]);
    expect(english.uzo?.purpose).toBe(uzoOf("kampo")?.purpose);
  });

  it("explain_regulo and get_sxablono take lingvo de", async () => {
    const regulo = modelo.reguloj.find((entry) => entry.name === "touch-target-min");
    const explained = await output<{ statement: string }>(client, "explain_regulo", {
      name: "touch-target-min",
      lingvo: "de",
    });
    expect(explained.statement).toBe(de[`${regulo?.id}/statement`]);
    const sxelo = modelo.sxablonoj?.find((entry) => entry.sxablono.name === "sxelo")?.uzo;
    const shell = await output<{ uzo?: { purpose: string } }>(client, "get_sxablono", {
      name: "sxelo",
      lingvo: "de",
    });
    expect(shell.uzo?.purpose).toBe(de[`${sxelo?.id}/purpose`]);
  });
});

// Befund F-17 (Nachlese 8 ③): get_ero of the kampo and the avizo broke the output schema since
// Spec 009 and Spec 011 ③ — content.of and when.props were missing from it, and clients such as
// the SDK's validate structuredContent against it. Every Ero with a Uzo passes now.
describe("get_ero answers every Ero within its output schema (F-17)", () => {
  it.each(modelo.eroj.filter((entry) => entry.uzo !== undefined).map((entry) => entry.ero.name))(
    "%s",
    async (name) => {
      await output(client, "get_ero", { name });
      await output(client, "get_ero", { name, lingvo: "de" });
    },
  );
});
