// The local server of the Metiejo (Spec 023, K-1, §4.3, M-7): loopback only, the screens, the
// built Eroj and the stylesheet of komuna, the draft and its preview, the check in plain words,
// the link to the Expertenansicht; no value of the .env in any response or log line.

import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { request as httpRequest } from "node:http";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { parseEnv, settingsOf } from "./env.js";
import { MARKEN_DIR } from "./marko.js";
import type { PrivataDeps } from "./privata.js";
import { type Servilo, startServilo } from "./servilo.js";

const scratch = mkdtempSync(join(tmpdir(), "fm-metiejo-servilo-"));
const root = join(scratch, "checkout");
const workdir = join(root, MARKEN_DIR);
mkdirSync(workdir, { recursive: true });
const SECRET = "sk-geheim-123";
const settings = settingsOf(parseEnv(`FM_TIPAROJ_REPO=owner/name\nOPENAI_API_KEY=${SECRET}\n`));
const log: string[] = [];
let servilo: Servilo;

const deps: PrivataDeps = {
  remoteUrl: () => join(scratch, "nenie.git"),
  visibility: async () => "unknown",
  git: () => "",
  cacheDir: join(scratch, "cache"),
  env: {},
};

beforeAll(async () => {
  servilo = await startServilo(
    { port: 0, workdir, root, settings, deps },
    { stderr: (text) => log.push(text) },
  );
});
afterAll(async () => {
  await servilo.close();
  rmSync(scratch, { recursive: true, force: true });
});

const get = (path: string, init: RequestInit = {}) => fetch(`${servilo.url}${path}`, init);

describe("the server (K-1)", () => {
  it("listens on the loopback interface and names its URL with localhost for the person", () => {
    expect(servilo.url).toMatch(/^http:\/\/127\.0\.0\.1:\d+$/);
    expect(servilo.port).toBeGreaterThan(0);
    expect(log.join("")).toContain(`http://localhost:${servilo.port}`);
  });

  it("answers loopback requests only (a foreign Host is refused)", async () => {
    // fetch never sends a foreign Host; node:http does.
    const status = await new Promise<number>((done, fail) => {
      const request = httpRequest(
        { host: "127.0.0.1", port: servilo.port, path: "/", headers: { host: "evil.example:80" } },
        (response) => {
          response.resume();
          done(response.statusCode ?? 0);
        },
      );
      request.on("error", fail);
      request.end();
    });
    expect(status).toBe(403);
  });

  it("serves the start screen, the built Eroj and the stylesheet of komuna", async () => {
    const start = await get("/");
    expect(start.status).toBe(200);
    expect(start.headers.get("content-type")).toContain("text/html");
    const html = await start.text();
    expect(html).toContain("Wie heißt deine Marke?");
    expect(html).toContain('<script type="module" src="/eroj/define.js">');
    const define = await get("/eroj/define.js");
    expect(define.status).toBe(200);
    expect(define.headers.get("content-type")).toContain("javascript");
    const css = await get("/css/fundamento.css");
    expect(css.status).toBe(200);
    expect(await css.text()).toContain("--fm-color-");
    expect((await get("/nenie")).status).toBe(404);
    expect((await get("/eroj/../package.json")).status).toBe(404);
  });
});

describe("a brand through the steps", () => {
  it("step 1 creates the brand and leads to the colour", async () => {
    const response = await get("/marko", {
      method: "POST",
      headers: { "content-type": "application/x-www-form-urlencoded" },
      body: "name=testa&basis=komuna",
      redirect: "manual",
    });
    expect(response.status).toBe(303);
    expect(response.headers.get("location")).toBe("/marko/testa/farbe");
    const farbe = await (await get("/marko/testa/farbe")).text();
    expect(farbe).toContain("Ist das deine Leitfarbe?");
    expect(farbe).toContain("Schritt 2 von 9");
  });

  it("an invalid name stays on the start screen with the problem named", async () => {
    const response = await get("/marko", {
      method: "POST",
      headers: { "content-type": "application/x-www-form-urlencoded" },
      body: "name=%21%21%21&basis=leer",
      redirect: "manual",
    });
    expect(response.status).toBe(200);
    expect(await response.text()).toMatch(/Kennung/);
  });

  it("the draft takes a value and the preview stylesheet carries the brand", async () => {
    const response = await get("/api/marko/testa/entwurf", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ leitfarbe: "#336699", form: { radius: 1.5 } }),
    });
    expect(response.status).toBe(200);
    const body = (await response.json()) as { rev: number; agordo: { leitfarbe: string } };
    expect(body.rev).toBeGreaterThan(0);
    expect(body.agordo.leitfarbe).toBe("#336699");
    const css = await (await get(`/marko/testa/vorschau.css?rev=${body.rev}`)).text();
    expect(css).toContain('data-fm-aspekto="testa"');
    const preview = await (
      await get("/marko/testa/vorschau?sxtupo=vorschau&breite=mittel&scheme=dark")
    ).text();
    expect(preview).toContain('data-fm-aspekto="testa"');
    expect(preview).toContain('data-fm-color-scheme="dark"');
    for (const sxablono of [
      "fm-sxelo",
      "fm-pagxo",
      "fm-formularo",
      "fm-filtrilo",
      "fm-redaktilo",
    ]) {
      expect(preview, sxablono).toContain(`<${sxablono}`);
    }
  });

  it("rejects a draft value the schema refuses, with path, rule and suggestion", async () => {
    const response = await get("/api/marko/testa/entwurf", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ form: { radius: 9 } }),
    });
    expect(response.status).toBe(422);
    const body = (await response.json()) as {
      issues: { path: string; rule: string; suggestion: string }[];
    };
    expect(body.issues[0]?.path).toContain("form/radius");
    expect(body.issues[0]?.rule).toBeTruthy();
    expect(body.issues[0]?.suggestion).toBeTruthy();
  });

  it("the check answers in plain words with at most one suggestion per problem", async () => {
    const response = await get("/api/marko/testa/pruefung", { method: "POST" });
    expect(response.status).toBe(200);
    const body = (await response.json()) as {
      exportable: boolean;
      gut: string[];
      probleme: { satz: string; vorschlag: string }[];
      html: string;
    };
    expect(typeof body.exportable).toBe("boolean");
    expect(body.gut.length).toBeGreaterThan(0);
    for (const problem of body.probleme) {
      expect(problem.satz).toBeTruthy();
      expect(problem.vorschlag).toBeTruthy();
    }
    expect(body.html).not.toMatch(/\b(Aspekto|Agordo|Regulo)\b/);
  });

  it("the finish screen saves with historio and offers the exports and the Expertenansicht", async () => {
    const fertig = await (await get("/marko/testa/fertig")).text();
    expect(fertig).toContain("Speichern");
    const save = await get("/marko/testa/speichern", { method: "POST", redirect: "manual" });
    expect(save.status).toBe(303);
    const location = save.headers.get("location") ?? "";
    expect(location).toBe("/marko/testa/fertig?gespeichert=1");
    const after = await (await get(location)).text();
    expect(after).toContain("Gespeichert");
    expect(after).toContain("Expertenansicht");
    // Without a built Vitrino the link is a sentence with the build command.
    expect(after).toContain("pnpm fm projekcioj build");
  });

  it("links the Expertenansicht into the Vitrino when one is built, with the Agordo in the fragment", async () => {
    const vitrino = join(root, ".fundamento", "projekcioj", "vitrino");
    mkdirSync(vitrino, { recursive: true });
    writeFileSync(join(vitrino, "index.html"), "<!doctype html><title>Vitrino</title>");
    const html = await (await get("/marko/testa/fertig")).text();
    expect(html).toMatch(
      /to="\/vitrino\/index\.html#aspekto=komuna&amp;modus=werkstatt&amp;agordo=[A-Za-z0-9_-]+"/,
    );
    const served = await get("/vitrino/index.html");
    expect(served.status).toBe(200);
    expect(await served.text()).toContain("Vitrino");
  });
});

describe("the fonts (step 4)", () => {
  it("searches the catalogue and sets a webfont with its licence", async () => {
    const search = await (await get("/marko/testa/schrift?q=inter")).text();
    expect(search).toContain("Inter");
    expect(search).toContain("OFL-1.1");
    const response = await get("/api/marko/testa/schrift", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ tiparo: "inter" }),
    });
    expect(response.status).toBe(200);
    const body = (await response.json()) as {
      agordo: { schriften: { body: { family: string; license: string } } };
    };
    expect(body.agordo.schriften.body).toMatchObject({ family: "Inter", license: "OFL-1.1" });
  });

  it("names the state of the private repository with the variable, never with its name", async () => {
    const html = await (await get("/marko/testa/schrift")).text();
    expect(html).toContain("FM_TIPAROJ_REPO");
    expect(html).not.toContain("owner/name");
  });
});

describe("M-7: no secret anywhere", () => {
  it("no response and no log line carries the value of a key or the name of the private repository", async () => {
    const texts = [log.join("")];
    for (const path of [
      "/",
      "/marko/testa/farbe",
      "/marko/testa/schrift",
      "/marko/testa/fertig",
      "/css/fundamento.css",
    ]) {
      texts.push(await (await get(path)).text());
    }
    for (const text of texts) {
      expect(text).not.toContain(SECRET);
      expect(text).not.toContain("owner/name");
    }
  });
});

describe("K-1 to K-6 of Spec 024 in the Schnellstart", () => {
  it("K-1: the name is taken as written, the identifier derived and shown small", async () => {
    const response = await get("/marko", {
      method: "POST",
      headers: { "content-type": "application/x-www-form-urlencoded" },
      body: "name=Bluna+Marke&basis=komuna",
      redirect: "manual",
    });
    expect(response.status).toBe(303);
    expect(response.headers.get("location")).toBe("/marko/bluna-marke/farbe");
    const html = await (await get("/marko/bluna-marke/farbe")).text();
    expect(html).toContain("Bluna Marke");
    expect(html).toContain("(bluna-marke)");
    const draft = await (
      await get("/api/marko/bluna-marke/entwurf", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: "{}",
      })
    ).json();
    expect((draft as { agordo: { etikedoj?: { marko?: string } } }).agordo.etikedoj?.marko).toBe(
      "Bluna Marke",
    );
  });

  it("K-3/K-4: the search answers while typing, and says what to do without a hit", async () => {
    const hits = (await (await get("/api/marko/testa/tiparoj?q=inter")).json()) as {
      treffer: { id: string }[];
      satz?: string;
    };
    expect(hits.treffer[0]?.id).toBe("inter");
    expect(hits.satz).toBeUndefined();
    const none = (await (await get("/api/marko/testa/tiparoj?q=zzzz-nenio")).json()) as {
      treffer: unknown[];
      satz?: string;
    };
    expect(none.treffer).toEqual([]);
    expect(none.satz).toMatch(/Keine Schrift/);
    const page = await (await get("/marko/testa/schrift?q=zzzz-nenio")).text();
    expect(page).toMatch(/Keine Schrift/);
  });

  it("K-6: Enter in the search searches; a chosen font is taken over", async () => {
    const search = await get("/marko/testa/schrift", {
      method: "POST",
      headers: { "content-type": "application/x-www-form-urlencoded" },
      body: "q=prata&tiparo=",
      redirect: "manual",
    });
    expect(search.status).toBe(303);
    expect(search.headers.get("location")).toBe("/marko/testa/schrift?q=prata");
    const choose = await get("/marko/testa/schrift", {
      method: "POST",
      headers: { "content-type": "application/x-www-form-urlencoded" },
      body: "q=prata&tiparo=prata",
      redirect: "manual",
    });
    expect(choose.status).toBe(303);
    expect(choose.headers.get("location")).toBe("/marko/testa/form");
    const draft = (await (
      await get("/api/marko/testa/entwurf", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: "{}",
      })
    ).json()) as {
      agordo: { schriften: { body: { family: string }; display: { family: string } } };
    };
    expect(draft.agordo.schriften.body.family).toBe("Prata");
    expect(draft.agordo.schriften.display.family).toBe("Prata");
  });

  it("K-5: the form is a choice; ganz rund makes the controls a pill and keeps surfaces rounded", async () => {
    const pill = await get("/marko/testa/form", {
      method: "POST",
      headers: { "content-type": "application/x-www-form-urlencoded" },
      body: "form.wahl=ganz-rund",
      redirect: "manual",
    });
    expect(pill.status).toBe(303);
    let draft = (await (
      await get("/api/marko/testa/entwurf", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: "{}",
      })
    ).json()) as {
      agordo: { form?: { radius?: number }; festgelegt?: Record<string, { alias?: string }> };
    };
    expect(draft.agordo.form?.radius).toBe(2);
    expect(draft.agordo.festgelegt?.["radius.role.control"]?.alias).toBe("radius.full");
    const css = await (await get("/marko/testa/vorschau.css?rev=99")).text();
    expect(css).toContain("--fm-radius-role-control: var(--fm-radius-full)");
    await get("/marko/testa/form", {
      method: "POST",
      headers: { "content-type": "application/x-www-form-urlencoded" },
      body: "form.wahl=eckig",
      redirect: "manual",
    });
    draft = (await (
      await get("/api/marko/testa/entwurf", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: "{}",
      })
    ).json()) as typeof draft;
    expect(draft.agordo.form?.radius).toBe(0);
    expect(draft.agordo.festgelegt?.["radius.role.control"]).toBeUndefined();
  });
});

describe("the Studio (Spec 024, § 4)", () => {
  it("opens at Farbe and renders every page with the number of problems", async () => {
    const entry = await get("/studio/testa", { redirect: "manual" });
    expect(entry.status).toBe(303);
    expect(entry.headers.get("location")).toBe("/studio/testa/farbe");
    for (const page of ["farbe", "schrift", "raum", "form", "tiefe", "bewegung", "semantik"]) {
      const response = await get(`/studio/testa/${page}`);
      expect(response.status, page).toBe(200);
      const html = await response.text();
      expect(html, page).toContain("Prüfung");
      expect(html, page).toContain("<fm-navigado");
    }
    expect((await get("/studio/testa/nenio")).status).toBe(404);
  });

  it("sets a value: the step is gesetzt, the Schnellstart sees it (M-6), and it can be taken back", async () => {
    const set = await get("/api/marko/testa/festlegen", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ token: "color.palette.accent.700", wert: "#2a338f" }),
    });
    expect(set.status).toBe(200);
    const body = (await set.json()) as {
      rev: number;
      herkunft: string;
      probleme: number;
      betroffen: string[];
    };
    expect(body.herkunft).toBe("gesetzt");
    expect(typeof body.probleme).toBe("number");
    const css = await (await get(`/marko/testa/vorschau.css?rev=${body.rev}`)).text();
    expect(css).toContain("#2a338f");
    const page = await (await get("/studio/testa/farbe")).text();
    expect(page).toContain("#2a338f");
    expect(page).toContain("gesetzt");
    const back = await get("/api/marko/testa/festlegen", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ token: "color.palette.accent.700", zurueck: true }),
    });
    expect(((await back.json()) as { herkunft: string }).herkunft).toBe("abgeleitet");
  });

  it("refuses a value that breaks a fixed rule, with one sentence and one suggestion (M-5)", async () => {
    const response = await get("/api/marko/testa/festlegen", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ token: "color.text.default", alias: "color.palette.neutral.100" }),
    });
    expect(response.status).toBe(409);
    const body = (await response.json()) as {
      satz: string;
      vorschlag: string;
      betroffen: string[];
    };
    expect(body.satz).toBeTruthy();
    expect(body.vorschlag).toBeTruthy();
    expect(body.betroffen.length).toBeGreaterThan(0);
    const draft = (await (
      await get("/api/marko/testa/entwurf", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: "{}",
      })
    ).json()) as { agordo: { festgelegt?: Record<string, unknown> } };
    expect(draft.agordo.festgelegt?.["color.text.default"]).toBeUndefined();
  });

  it("re-points a role within the rules, names a palette, sets a size per viewport", async () => {
    const role = await get("/api/marko/testa/festlegen", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ token: "color.text.default", alias: "color.palette.neutral.800" }),
    });
    expect(role.status).toBe(200);
    expect(((await role.json()) as { betroffen: string[] }).betroffen).toEqual(expect.any(Array));
    const name = await get("/api/marko/testa/festlegen", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ token: "color.palette.accent", etikedo: "Ozean" }),
    });
    expect(name.status).toBe(200);
    expect(await (await get("/studio/testa/farbe")).text()).toContain("Ozean");
    const size = await get("/api/marko/testa/festlegen", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        token: "font.size.display.1",
        alias: "font.size.scale.900",
        modus: "viewport=compact",
      }),
    });
    expect(size.status).toBe(200);
    const schrift = await (await get("/studio/testa/schrift?viewport=compact")).text();
    expect(schrift).toContain("font.size.scale.900");
  });

  it("saves from the Studio like the Schnellstart", async () => {
    const save = await get("/studio/testa/speichern", { method: "POST", redirect: "manual" });
    expect(save.status).toBe(303);
    expect(save.headers.get("location")).toBe("/studio/testa/farbe?gespeichert=1");
    expect(await (await get("/studio/testa/farbe?gespeichert=1")).text()).toContain("Gespeichert");
  });
});
