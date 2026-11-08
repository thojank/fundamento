// An empty or truncated page (Spec 038 Lauf 5, B-4, S038-37c, AK-1, AK-2). Lauf 4's detail of
// `komuna` (round 1) kept a 92-byte fragment of closing tags only after 4 requests and 23 tool
// calls; the raw answer was not saved. The fixture `test/fixtures/b4-leere-seite/` holds the stored
// fragment byte for byte, the stored counts, and a reconstructed answer (the hypothesis): a whole
// page whose fm-markdovido carries Markdown with a fenced block inside the ```html block – the
// extraction of Lauf 4 took the last fenced block, which was the tail after the inner fence.
// Beyond the cause: a page without element content in round 1 gets one fresh conversation with
// the shell as starting point, in round 2 or later a finding for the next round; one that stays
// empty is reported per screen-round; its raw answers are saved cleaned. Doubles only.

import { mkdtempSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import {
  eligoDe,
  eltiriRespondon,
  kuruEkranojn,
  LEERA_PAGXO,
  LEERA_PAGXO_TROVO,
  MAKS_RONDOJ,
  malplenaPagxo,
  PERMESITA_MODELO,
  type RaportoJson,
  REKOMENCO_F,
} from "./index.js";
import {
  ilaRespondo,
  type Peto,
  respondo,
  rondoDePeto,
  SkriptaModelo,
  type Skripto,
  slugDePeto,
} from "./test-doubles/chat.js";
import { planoKun } from "./test-doubles/faktoj.js";
import { CXIUJ_ILOJ, MemoraPonto } from "./test-doubles/iloj.js";
import { neniamVerda } from "./test-doubles/taksilo.js";
import type { ChatRespondo, EkranojDeps, EkranojEnigo, Plano } from "./tipoj.js";

const FIKSAJXOJ = fileURLToPath(new URL("../test/fixtures/b4-leere-seite/", import.meta.url));
const legi = (nomo: string): string => readFileSync(join(FIKSAJXOJ, nomo), "utf8");

/** The stored fragment of Lauf 4 (`rondoj/1/detail.html` between the fragment markers). */
const FRAGMENTO_L4 = legi("fragmento-l4.txt");
/** The reconstructed answer (hypothesis; the raw answer of Lauf 4 is lost). */
const RESPONDO_HIPOTEZO = legi("respondo-hipotezo.txt");
const SPURO = JSON.parse(legi("spuro.json")) as {
  peno: {
    requests: number;
    toolCalls: number;
    inputTokens: number;
    outputTokens: number;
    bytes: number;
  };
  iloj: Record<string, number>;
  mankoj: { key: string; kind: string }[];
};

const PLANO: Plano = planoKun(2); // liste → detail

/** The extraction of Lauf 4 (`eltiriRespondon` at `c61ab3c9`): the last fenced block. */
function eltiroDeLauf4(teksto: string): string {
  const resto = teksto.replace(/```mankoj[^\n]*\n([\s\S]*?)```/gi, "");
  const blokoj = [...resto.matchAll(/```(?:html)?[^\n]*\n([\s\S]*?)```/gi)];
  return (blokoj.at(-1)?.[1] ?? resto).trim();
}

/** A whole page on the shell, with a link to every planned target of `slug`. */
function plenaPagxo(slug: string, rondo: number): string {
  const ligiloj = PLANO.kantoj
    .filter((kanto) => kanto.de === slug)
    .map((kanto) => `<fm-butono href="${kanto.al}.html">Weiter</fm-butono>`)
    .join("");
  return `<fm-sxelo><fm-pagxo><main data-rondo="${rondo}"><fm-karto><h2 slot="heading">Standard A-12</h2></fm-karto><nav>${ligiloj}</nav></main></fm-pagxo></fm-sxelo>`;
}

/** An answer that holds only the stored tail – the page stays empty whatever the extraction. */
const VOSTO = `\`\`\`html\n${FRAGMENTO_L4}\`\`\``;
/** A key the model repeated by mistake: the saved answer must not hold it. */
const SXLOSILO = ["sk", "b4", "0f1e2d3c4b5a6978".repeat(2)].join("-");

const fresxa = (peto: Peto): boolean =>
  peto.messages.some((m) => m.role === "user" && (m.content ?? "").includes(REKOMENCO_F));

/** The number of the request within its conversation: the assistant turns before it. */
const nDe = (peto: Peto): number => peto.messages.filter((m) => m.role === "assistant").length;

/** The four requests of Lauf 4's detail#1 (counts from the fixture), the hypothesis at the end. */
function lauf4Konversacio(n: number): ChatRespondo {
  const tokenoj = [
    { input: 20_000, output: 700 },
    { input: 35_000, output: 300 },
    { input: 50_000, output: 250 },
    { input: 60_247, output: 351 },
  ][n] ?? { input: 0, output: 0 };
  if (n === 0) {
    return ilaRespondo(
      Array.from({ length: SPURO.iloj.get_ero ?? 0 }, () => ({
        name: "get_ero",
        args: { name: "butono" },
      })),
      tokenoj,
    );
  }
  if (n === 1) {
    return ilaRespondo(
      [
        { name: "get_sxablono", args: { name: "pagxo" } },
        ...Array.from({ length: SPURO.iloj.suggest_ero ?? 0 }, () => ({
          name: "suggest_ero",
          args: { goal: "Inhalte anzeigen" },
        })),
      ],
      tokenoj,
    );
  }
  if (n === 2) {
    return ilaRespondo([{ name: "check_markup", args: { fragment: "<main></main>" } }], tokenoj);
  }
  return respondo(RESPONDO_HIPOTEZO, tokenoj);
}

/**
 * Plan requests get the plan; every build a whole page, except the builds `detail` gets from
 * `detail(rondo, fresxa, n)` (undefined = the whole page).
 */
function skriptoDe(
  detail: (rondo: number, fresxa: boolean, n: number) => ChatRespondo | undefined,
): Skripto {
  return (peto) => {
    const slug = slugDePeto(peto);
    if (slug === undefined) return respondo(`\`\`\`json\n${JSON.stringify(PLANO)}\n\`\`\``);
    const rondo = rondoDePeto(peto);
    const speciala = slug === "detail" ? detail(rondo, fresxa(peto), nDe(peto)) : undefined;
    return speciala ?? respondo(`\`\`\`html\n${plenaPagxo(slug, rondo)}\n\`\`\``);
  };
}

const modelo = (skripto: Skripto) => new SkriptaModelo(skripto, { modelo: PERMESITA_MODELO });

function enigoDe(out = "/tmp/s038-logs/nicht-geschrieben"): EkranojEnigo {
  return {
    frazo: "Eine Verwaltung für Standards mit Liste und Detail",
    marko: "komuna",
    out,
    maksTokenoj: 1_000_000,
    plano: PLANO,
  };
}

function depsDe(
  chat: SkriptaModelo,
  e: { eligo?: EkranojDeps["eligo"]; linioj?: string[] } = {},
): EkranojDeps {
  return {
    chat,
    // The shell path (check_markup and list_arangxoj listed), as `komuna` ran in Lauf 4.
    tools: new MemoraPonto({ iloj: CXIUJ_ILOJ }),
    taksilo: neniamVerda(),
    marko: { konstrui: async () => ({ css: [] }) },
    nun: () => new Date("2026-11-08T12:00:00Z"),
    log: (linio) => e.linioj?.push(linio),
    dormi: async () => undefined,
    ...(e.eligo === undefined ? {} : { eligo: e.eligo }),
  };
}

/** The build requests of `detail` in round `rondo`: first conversation and fresh one. */
const detailPetoj = (chat: SkriptaModelo, rondo: number) =>
  chat.petoj.filter((peto) => slugDePeto(peto) === "detail" && rondoDePeto(peto) === rondo);

// --- The cause ------------------------------------------------------------------------------------

describe("the cause of Lauf 4's empty detail page (B-4)", () => {
  it("the fixture is the stored trace: 92 bytes of closing tags, 4 requests, 23 tool calls", () => {
    expect(Buffer.byteLength(FRAGMENTO_L4.trim())).toBe(SPURO.peno.bytes);
    expect(SPURO.peno.bytes).toBe(92);
    expect(FRAGMENTO_L4.trim()).toBe(
      "</fm-teksto>\n        </fm-markdovido>\n      </section>\n    </main>\n  </fm-pagxo>\n</fm-sxelo>",
    );
    expect(SPURO.peno).toMatchObject({
      requests: 4,
      toolCalls: 23,
      inputTokens: 165_247,
      outputTokens: 1_601,
    });
    expect(Object.values(SPURO.iloj).reduce((a, b) => a + b, 0)).toBe(SPURO.peno.toolCalls);
    expect(SPURO.mankoj).toEqual([{ key: "empty page", kind: "render" }]);
  });

  it("the hypothesis reproduces it: Lauf 4's extraction of the reconstructed answer gives exactly the stored bytes", () => {
    expect(eltiroDeLauf4(RESPONDO_HIPOTEZO)).toBe(FRAGMENTO_L4.trim());
  });

  it("takes the whole ```html block when the page carries a fenced Markdown block inside", () => {
    const { fragmento } = eltiriRespondon(RESPONDO_HIPOTEZO, "F");
    expect(fragmento.startsWith("<fm-sxelo>")).toBe(true);
    expect(fragmento.endsWith("</fm-sxelo>")).toBe(true);
    expect(fragmento).toContain("```yaml\nid: A-12\nteam: Nord\n```\n</fm-teksto>");
    expect(malplenaPagxo(fragmento)).toBe(false);
  });

  it("still takes the last block when an answer holds a draft and the final page", () => {
    const teksto = [
      "Entwurf:",
      "```html",
      "<main><p>alt</p></main>",
      "```",
      "Endfassung:",
      "```html",
      "<main><p>neu</p></main>",
      "```",
    ].join("\n");
    expect(eltiriRespondon(teksto, "F").fragmento).toBe("<main><p>neu</p></main>");
  });

  it("keeps a ```json block after the page out of the fragment", () => {
    const teksto = ["```html", "<main><p>x</p></main>", "```", "", "```json", "{}", "```"].join(
      "\n",
    );
    expect(eltiriRespondon(teksto, "F").fragmento).toBe("<main><p>x</p></main>");
  });

  it("detects a page without element content before any scoring (exact predicate)", () => {
    expect(malplenaPagxo(FRAGMENTO_L4)).toBe(true);
    expect(malplenaPagxo("")).toBe(true);
    expect(malplenaPagxo("  \n ")).toBe(true);
    expect(malplenaPagxo("<!-- <main> -->\n</main>")).toBe(true);
    expect(malplenaPagxo("Hier ist der Screen.")).toBe(true);
    expect(malplenaPagxo("<p>x</p>")).toBe(false);
    expect(malplenaPagxo("<fm-sxelo></fm-sxelo>")).toBe(false);
    expect(malplenaPagxo("<!doctype html><html><body></body></html>")).toBe(false);
  });
});

// --- The run ----------------------------------------------------------------------------------------

describe("an empty or truncated page in the run (B-4, AK-1, AK-2)", () => {
  it("builds Lauf 4's trace into a whole page: same requests, tool calls and tokens, no fresh conversation", async () => {
    const chat = modelo(
      skriptoDe((rondo, _f, n) => (rondo === 1 ? lauf4Konversacio(n) : undefined)),
    );
    const rezulto = await kuruEkranojn(enigoDe(), depsDe(chat));
    const detail = rezulto.rondoj[0]?.detail;
    expect(detail?.peno).toMatchObject({
      requests: SPURO.peno.requests,
      toolCalls: SPURO.peno.toolCalls,
      inputTokens: SPURO.peno.inputTokens,
      outputTokens: SPURO.peno.outputTokens,
    });
    expect(detailPetoj(chat, 1).some(fresxa)).toBe(false);
    expect(detail?.fragmento?.startsWith("<fm-sxelo>")).toBe(true);
    expect(detail?.taksado.mankoj.map((m) => m.key)).not.toContain("empty page");
    expect(detail?.malhelpoj).not.toContain(LEERA_PAGXO);
    expect(rezulto.malplenajPagxoj).toBeUndefined();
  });

  it("asks a round-1 page of closing tags only in exactly one fresh conversation from the shell – not a provider error", async () => {
    const dir = mkdtempSync(join(tmpdir(), "s038-37c-"));
    const linioj: string[] = [];
    const chat = modelo(
      skriptoDe((rondo, f) =>
        rondo === 1 && !f ? respondo(`${VOSTO}\nSchlüssel ${SXLOSILO}`) : undefined,
      ),
    );
    const rezulto = await kuruEkranojn(enigoDe(dir), depsDe(chat, { eligo: eligoDe(), linioj }));

    const petoj = detailPetoj(chat, 1);
    expect(petoj.map(fresxa)).toEqual([false, true]);
    const fresxaPeto = petoj[1];
    // A fresh conversation: the system text with the shell, the task with the restart words.
    expect(fresxaPeto?.messages.map((m) => m.role)).toEqual(["system", "user"]);
    expect(fresxaPeto?.messages[0]?.content).toContain("Die Shell von Fundamento");
    expect(fresxaPeto?.messages[1]?.content?.endsWith(REKOMENCO_F)).toBe(true);

    expect(rezulto.anbieterfehleroj).toBeUndefined();
    expect(rezulto.rondoj[0]?.detail?.fragmento).toBe(plenaPagxo("detail", 1));
    expect(rezulto.rondoj[0]?.detail?.malhelpoj).not.toContain(LEERA_PAGXO);
    expect(rezulto.malplenajPagxoj).toEqual([
      {
        ekrano: "detail",
        rondo: 1,
        bytes: 92,
        ago: "nova-konversacio",
        restis: false,
        respondo: "rondoj/1/detail.respondo.txt",
      },
    ]);
    // Later rounds build on the whole page: no further fresh conversation.
    expect(chat.petoj.filter(fresxa)).toHaveLength(1);
    expect(rezulto.faritajRondoj).toBe(MAKS_RONDOJ);

    // The raw answers, cleaned, in the run folder: future traces exist.
    const teksto = readFileSync(join(dir, "rondoj", "1", "detail.respondo.txt"), "utf8");
    expect(teksto).toContain(FRAGMENTO_L4.trim());
    expect(teksto).toContain(plenaPagxo("detail", 1));
    expect(teksto).not.toContain(SXLOSILO);
    expect(teksto).toContain("[entfernt]");
    const json = JSON.parse(readFileSync(join(dir, "raporto.json"), "utf8")) as RaportoJson;
    expect(json.anbieterfehleroj).toBeUndefined();
    expect(json.malplenajPagxoj).toEqual(rezulto.malplenajPagxoj);
    expect(linioj.filter((linio) => /leere Seite/.test(linio))).toEqual([
      "Runde 1: detail – leere Seite (92 Bytes), ein frisches Gespräch mit der Shell als Ausgangspunkt",
    ]);
  });

  it("reports a round-1 page that stays empty after the fresh conversation per screen-round, with the finding for round 2", async () => {
    const dir = mkdtempSync(join(tmpdir(), "s038-37c-"));
    const chat = modelo(skriptoDe((rondo) => (rondo === 1 ? respondo(VOSTO) : undefined)));
    const rezulto = await kuruEkranojn(enigoDe(dir), depsDe(chat, { eligo: eligoDe() }));

    expect(detailPetoj(chat, 1).map(fresxa)).toEqual([false, true]);
    const detail = rezulto.rondoj[0]?.detail;
    expect(detail?.verda).toBe(false);
    expect(detail?.malhelpoj?.[0]).toBe(LEERA_PAGXO);
    expect(detail?.trovoj?.[0]).toEqual({ ...LEERA_PAGXO_TROVO, loko: "detail.html" });
    expect(rezulto.malplenajPagxoj).toEqual([
      {
        ekrano: "detail",
        rondo: 1,
        bytes: 92,
        ago: "nova-konversacio",
        restis: true,
        respondo: "rondoj/1/detail.respondo.txt",
      },
    ]);
    expect(rezulto.notoj).toContain(
      "Runde 1: detail blieb eine leere Seite, auch in einem frischen Gespräch mit der Shell als Ausgangspunkt (AK-2 verletzt).",
    );
    expect(rezulto.anbieterfehleroj).toBeUndefined();
    // Round 2 gets the finding with its instruction.
    const tasko = detailPetoj(chat, 2)[0]?.messages[1]?.content ?? "";
    expect(tasko).toContain(`"regulo": "${LEERA_PAGXO}"`);
    expect(tasko).toContain(LEERA_PAGXO_TROVO.sugesto);

    const teksto = readFileSync(join(dir, "rondoj", "1", "detail.respondo.txt"), "utf8");
    expect(teksto.split(FRAGMENTO_L4.trim())).toHaveLength(3);
    const json = JSON.parse(readFileSync(join(dir, "raporto.json"), "utf8")) as RaportoJson;
    expect(json.malplenajPagxoj).toEqual(rezulto.malplenajPagxoj);
    const md = readFileSync(join(dir, "raporto.md"), "utf8");
    expect(md).toContain("## Leere Seiten (B-4)");
    expect(md).toContain(
      "| detail | 1 | 92 | frisches Gespräch, Shell als Ausgangspunkt | ja (AK-2 verletzt) | rondoj/1/detail.respondo.txt |",
    );
  });

  it("turns an empty page of round 2 into a finding for round 3 – no fresh conversation in round 2", async () => {
    const dir = mkdtempSync(join(tmpdir(), "s038-37c-"));
    const chat = modelo(skriptoDe((rondo) => (rondo === 2 ? respondo(VOSTO) : undefined)));
    const rezulto = await kuruEkranojn(enigoDe(dir), depsDe(chat, { eligo: eligoDe() }));

    expect(detailPetoj(chat, 2)).toHaveLength(1);
    expect(chat.petoj.some(fresxa)).toBe(false);
    const detail = rezulto.rondoj[1]?.detail;
    expect(detail?.malhelpoj?.[0]).toBe(LEERA_PAGXO);
    expect(detail?.trovoj?.[0]).toEqual({ ...LEERA_PAGXO_TROVO, loko: "detail.html" });
    expect(rezulto.malplenajPagxoj).toEqual([
      {
        ekrano: "detail",
        rondo: 2,
        bytes: 92,
        ago: "trovo",
        restis: true,
        respondo: "rondoj/2/detail.respondo.txt",
      },
    ]);
    const tasko = detailPetoj(chat, 3)[0]?.messages[1]?.content ?? "";
    expect(tasko).toContain(LEERA_PAGXO_TROVO.sugesto);
    expect(rezulto.rondoj[2]?.detail?.fragmento).toBe(plenaPagxo("detail", 3));
    expect(readFileSync(join(dir, "rondoj", "2", "detail.respondo.txt"), "utf8")).toContain(
      FRAGMENTO_L4.trim(),
    );
    const md = readFileSync(join(dir, "raporto.md"), "utf8");
    expect(md).toContain(
      "| detail | 2 | 92 | Befund für die nächste Runde | ja (AK-2 verletzt) | rondoj/2/detail.respondo.txt |",
    );
  });

  it("leaves a page empty in the last round as a remaining deviation", async () => {
    const chat = modelo(
      skriptoDe((rondo) => (rondo === MAKS_RONDOJ ? respondo(VOSTO) : undefined)),
    );
    const rezulto = await kuruEkranojn(enigoDe(), depsDe(chat));
    expect(rezulto.restantaj.filter((r) => r.regulo === LEERA_PAGXO)).toEqual([
      {
        ekrano: "detail",
        regulo: LEERA_PAGXO,
        loko: "detail.html",
        kialo: LEERA_PAGXO_TROVO.kialo,
      },
    ]);
    expect(rezulto.malplenajPagxoj?.map((m) => `${m.rondo} ${m.ago} ${m.restis}`)).toEqual([
      `${MAKS_RONDOJ} trovo true`,
    ]);
  });
});
