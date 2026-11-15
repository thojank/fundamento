# Spec 055 – Bericht (MP-1b: Leinwand ohne Rahmen, Neutral frei, Speichern)

Stand 2026-11-15, Entwurf aus LNS-4.1 (T7); LNS-5.1 (T8) füllt die Platzhalter. Ein PR, ein Push, genau ein `workflow_dispatch`. Quellen: [`spec.md`](spec.md), [`plan.md`](plan.md), [`tasks.md`](tasks.md) (dort der **PR-Text-Entwurf**, alle geänderten älteren Tests mit Zeilen, die Diff-Suche und die gepflanzten Fehler). Bilder außerhalb des Repos unter `/Users/thorstenjankowski/n8n-compose/20260918_fundamento-ds/.fundamento/spec055/bilder/`.

## 1. PR, Commit, CI

- PR: **⟨PLATZHALTER: PR-Link⟩** · Commit: **⟨PLATZHALTER: Hash⟩** · Dispatch-Lauf (genau einer): **⟨PLATZHALTER: Lauf-Link, Ergebnis⟩**

| Job | PR-Lauf | Dispatch | Notiz |
|---|---|---|---|
| Affected packages (betroffen) | ⟨offen⟩ | ⟨offen⟩ | |
| Build, lint and Modelo checks | ⟨offen⟩ | ⟨offen⟩ | Schema: ein neues Feld |
| Unit tests (metiejo) | ⟨offen⟩ | ⟨offen⟩ | alle `*-055`, `grafeo-*-054`, 047/048 |
| Unit tests (modelo) | ⟨offen⟩ | ⟨offen⟩ | |
| Unit tests (cli · ekranoj · nordstelo · agordilo · mcp) | ⟨offen⟩ | ⟨offen⟩ | `kontrakto-038` lokal grün (Abschnitt 4) |
| Unit tests (Projekcioj, Shards) | ⟨offen⟩ | ⟨offen⟩ | |
| Timing checks | ⟨offen⟩ | ⟨offen⟩ | lokal nicht beurteilt |
| Rendered Eroj / Alirebleco / Vitrino / Make Kit / Quickstart | ⟨offen⟩ | ⟨offen⟩ | nichts unter `packages/eroj/**` geändert |

## 2. Bilder (Chromium 153, 2100×1250)

`pnpm build`, dann `pnpm --filter @fundamento/nodredaktilo exec tsx scripts/bilder-055.ts --ziel /Users/thorstenjankowski/n8n-compose/20260918_fundamento-ds/.fundamento/spec055/bilder` (Marke `lumeto` über die Startseite, Temp-Arbeitsordner, freier Port; 41 Prüfungen, Abbruch beim ersten Fehler, 0 Seiten- und Konsolenfehler).

1. [01-neue-marke.png](file:///Users/thorstenjankowski/n8n-compose/20260918_fundamento-ds/.fundamento/spec055/bilder/01-neue-marke.png) – ohne Rahmen, sieben Farbknoten, runde Kanten.
2. [02-neutral-abgeleitet.png](file:///Users/thorstenjankowski/n8n-compose/20260918_fundamento-ds/.fundamento/spec055/bilder/02-neutral-abgeleitet.png) – Kante Primär → Neutral, „aus Primär abgeleitet“.
3. [03-neutral-eigene-farbe.png](file:///Users/thorstenjankowski/n8n-compose/20260918_fundamento-ds/.fundamento/spec055/bilder/03-neutral-eigene-farbe.png) – `#e8e2d6`, Kante gelöst, „von Hand“, Tönung 1,00, Palette „eigene Farbe · Tönung 1,00“, Vorschauen auf neuem rev.
4. [04-funktionsfarbe-von-hand.png](file:///Users/thorstenjankowski/n8n-compose/20260918_fundamento-ds/.fundamento/spec055/bilder/04-funktionsfarbe-von-hand.png) – Warnung `#d99a00` „von Hand“ mit „↺“, drei „abgeleitet“.
5. [05-nach-neuladen.png](file:///Users/thorstenjankowski/n8n-compose/20260918_fundamento-ds/.fundamento/spec055/bilder/05-nach-neuladen.png) – Palette verschoben, Akzent → Palette gelöst, weitere Vorschau, nach dem Neuladen.
6. [06-staende.png](file:///Users/thorstenjankowski/n8n-compose/20260918_fundamento-ds/.fundamento/spec055/bilder/06-staende.png) – offene Liste: „vor dem Öffnen von „Blau kühl““ (Rot) über „Blau kühl“.
7. [07-startseite-markenliste.png](file:///Users/thorstenjankowski/n8n-compose/20260918_fundamento-ds/.fundamento/spec055/bilder/07-startseite-markenliste.png) – Startseite mit Karte „lumeto“, 2 Stände.

**AK-1 im Browser (D-19, bindend, nicht in CI):** 11 Knoten paarweise ohne Schnitt; 17 Kanten, alle mit `getPointAtLength` (alle 2 px) abgetastet, kein Punkt in einer fremden Box; 15 Kanten mit Knick, alle mit `Q`; 2 gerade und darum ausgenommen: `farbo-primaer.el>farbo-neutral.en.farbo` (`M432 199L432 247`) und `paletro.el>vorschau-hell.en` (`M1021 79L1131 79`). Höhen (gemessen/Maximum D-2): Marke 64/72, Primär 170/190, Akzent 172/190, Neutral 194/300 (Feld offen 238/300), Erfolg/Warnung/Fehler/Hinweis je 94/96, Palette 470/520, Vorschau hell/dunkel je 466/480. Kein Maximum geändert.

## 3. Gewählter Weg und Dateien

- **Neutral:** ein optionales Feld `Agordo.neutral.farbe` (`$ref AgordoColor`), abgeleitet in `packages/agordilo/src/palettes.ts` (`paletteSources`): mit Feld Farbton und Buntheit aus der Farbe, skaliert mit der Tönung (Vorgabe 1, ohne den Faktor 0,25), `origin: "neutralfarbe"`. Grund: der Weg über rund 26 `festgelegt`-Stufen erschiene im Studio als Handarbeit und ginge beim Wechsel von Primär nicht mit. Ohne das Feld byte-gleich (Prüfsummen von `642ab220` für 8 Agordoj).
- **`marken/<name>/leinwand.json`** (kanonisches JSON, nie im Agordo): `{ "kabloj": { "<rolo>": "<rolo>" | null, … }, "knoten": [ { "id", "x", "y" } | { "id": "vorschau-<n≥3>", "speco": "vorschau", "schema": "hell"|"dunkel", "x"?, "y"?, "inhalt"? } ], "version": 1 }`. Unlesbar → Startanordnung, ruhige Zeile, vor dem nächsten Schreiben gesichert als `leinwand.unlesbar-<UTC ohne Doppelpunkte>.json`.
- **`marken/<name>/staende/<id>.json`** (kanonisch): `{ "agordo": <Entwurf>, "id": "<yyyymmddThhmmssZ>[-<slug>]", "leinwand": <leinwand.json> | null, "name", "version": 1, "zeit": "<ISO>" }`.

## 4. `kontrakto-038`: kein roter Eintrag

`FM_AUSGABE=knapp pnpm --filter @fundamento/mcp test kontrakto-038` → 9/0. Der Vertrag erlaubt neue Schlüssel innerhalb von `properties` (`packages/mcp/src/kontrakto-038.test.ts`, `incompatibilities`); `neutral.properties.farbe` in den Eingabeschemata von `preview_agordo`, `propose_agordo` und `save_agordo` (Fixture `packages/mcp/test/fixtures/kontrakto/input-schemas.json`) ist so ein Schlüssel, und kein Katalogfall nutzt das Feld. Die erwartete Ausnahme aus Abnahme 11 (R-2) tritt lokal nicht ein; Vorrücken nach `9ee8d430` nur, falls CI doch rote Einträge zeigt.

## 5. Befunde (Belege und weitere in `tasks.md`, „Befunde“)

- **R-1 MCP-Ausgabeschema:** `packages/mcp/schema/tools/preview_agordo.output.json:289` kennt `origin: "neutralfarbe"` nicht (`packages/mcp/src/tools.ts:634`); `preview_agordo` mit `neutral.farbe` verletzt sein Ausgabeschema. MCP tabu → Maintainer.
- **Neu: „gilt nur in dieser Sitzung“ stimmt nicht mehr** (`packages/nodredaktilo/src/gestalten/kapo.tsx:105`): gelöste Verbindungen werden seit T4 gespeichert und stehen nach dem Neuladen wieder da (Bild 05). Wortlaut zu entscheiden.
- Kantenradius **8 px** (`--fm-radius-role-surface` in der neutralen Belegung), nicht 12 px wie in D-5 angenommen.
- **D-6 Verstehen:** `packages/metiejo/src/grafeo.ts:653–662` zeigt für `origin: "neutralfarbe"` keine Verweise (unverändert, Abnahme 9). **D-7:** nur `neutral.farbe` geändert → Historie `{ wunsch: "Hand", diff: [] }` (`packages/agordilo/src/regler.ts:155`).
- **D-13:** gespeichert werden nur `kabloj`; ein gelöstes Marke → Farbe-Kabel kommt als „Zeile nicht verbunden“ zurück, ein gelöstes Palette → Vorschau-Kabel gar nicht (beide im Browser nicht durchgespielt). Das Schema hell | dunkel einer weiteren Vorschau wird nicht gespeichert (`nodoj/vorschau.tsx`).
- **D-19 nicht in CI:** AK-1-Geometrie nur in `packages/nodredaktilo/scripts/bilder-055.ts`.
- **Studio** zeigt `neutral.farbe` nicht; Regler und Speichern behalten es (`neutral-studio-055` grün).
- Funktionsfarben: „zurück zur Ableitung“ als „↺“ (96-px-Maximum). Neutral „abbrechen“ per Tastatur: Tab verlässt das Feld, und Verlassen schreibt.
- Startseite: Link „Leinwand von <Name>“ in der Karte statt ganz klickbarer Karte (`fm-karto` ohne Ziel, `sxtupoj.test.ts:50`); Formular 38rem, weil `fm-elekto` nicht umbricht.
- Helligkeit von `neutral.farbe` beim Lesen nicht geprüft (`packages/agordilo/src/agordo.ts`, `colourPointers`); der Schreibweg lehnt solche Werte ab.
- Markenliste zählt jede `*.json` in `staende/`, auch Dateien, die die Stände-Liste nicht zeigt (`packages/metiejo/src/marken-liste.ts`).
- Bündel `dist/leinwand.js`: 728 751 → **746 121** Byte roh, 192 071 → **195 930** gzip -6 (+17 370 / +3 859), keine Schwelle.
- Lokale Last: parallele und sequentielle Gesamtläufe hatten nur Zeitgrenzen-Rote bei Lastmittel 186–308 (fremde Prozesse); einzeln alle grün (Abschnitt 6).

## 6. Prüfungen (lokal)

- Neue Tests `grafeo-urteil-055` 5/5 und `abnahme-055` 6/6; rot gezeigt mit 11 gepflanzten Fehlern (U1–U5, A1–A6 in `tasks.md`), jeweils byte-gleich zurückgesetzt.
- eroj in Chromium, je Datei einzeln: `metiejo` 6, `metiejo-036` 2, `metiejo-036-uebernahme` 2, `form-036` 1, `zweitfarbe-036` 5, `buehne-036` 20, `buehne-navigation-042` 2 – alle grün, ohne Wiederholung.
- `FM_AUSGABE=knapp pnpm test:betroffen`: rot nur zwei eroj-Hooks (10-s-Limit). Nacheinander (`pnpm turbo run test --continue --concurrency=1 …` mit den 10 Paketen): 16/19 grün, rot nur Zeitgrenzen (projekcioj `komuna-fonto.test.ts:182/206/227`, modelo `turbo-inputs.test.ts:679`, eroj `zweitfarbe-036.spec.ts:203` [chromium, webkit], `markobutono.spec.ts:21` [firefox]); jede einzeln wiederholt grün. Nichts angehoben.
- `pnpm lint` 22/22 grün; `pnpm check:privat` PASS; `.only(`/`.skip(` nur das alte `context.skip` in `packages/mcp/src/http.test.ts:97`.
- Diff-Suche gegen `642ab220` (Befehle in `tasks.md`): nichts unter `modelo/data`, `mcp`, `eroj/src`, `vortaro`, `.github`, keine Root-Datei, kein Lockfile, kein `package.json`; Schema genau `neutral.properties.farbe`; kein `--fm-`-Name außerhalb des Kernsatzes; kein Zeitlimit, `retries`, Schwelle; `marko.ts` unberührt; `sxtupoj.ts` nur Start-Pfade; 047/048 unverändert und grün; Wort aus R-12 und Name des privaten Schriften-Repos 0 / 0.

## 7. Was der Maintainer jetzt tut

1. Bilder ansehen: `/Users/thorstenjankowski/n8n-compose/20260918_fundamento-ds/.fundamento/spec055/bilder/01-neue-marke.png` bis `07-startseite-markenliste.png`.
2. Die offenen Punkte der Produkt-Spec bestätigen oder ändern (`specs/055-leinwand-speichern/spec.md`, „Offene Punkte für den Maintainer“): Tönung skaliert die eigene Neutralfarbe ohne den Faktor 0,25 (Vorgabe 1); „Anordnung zurücksetzen“ behält hinzugefügte Knoten; Studio zeigt die eigene Neutralfarbe nicht; Dateinamen `leinwand.json`/`staende/` (D-1 bestätigt). Dazu den Wortlaut „gilt nur in dieser Sitzung“ (Abschnitt 5).
3. CI-Tabelle in der PR-Beschreibung lesen (⟨PLATZHALTER: PR-Link⟩; PR-Lauf und genau ein `workflow_dispatch`). Zeigt `kontrakto-038` doch rote Einträge, sie vor dem Mergen nach dem Verfahren aus `9ee8d430` vorrücken (nur `packages/mcp/test/fixtures/kontrakto/**`).
4. R-1 als Folgeauftrag einplanen: `packages/mcp/schema/tools/preview_agordo.output.json:289` um `"neutralfarbe"` erweitern, samt Fixtures.
5. Abnahme im Browser: `fm metiejo`, auf `/` „Auf der Leinwand anlegen“, Ablauf 2–4; oder erneut `pnpm build && pnpm --filter @fundamento/nodredaktilo exec tsx scripts/bilder-055.ts --ziel <ordner>` im Worktree `/Users/thorstenjankowski/.purple-code/worktrees/fundamento-wt-mwhtv7heoxnupva9/repos/fundamento`.
6. Erst nach einem grünen vollen Lauf mergen.
