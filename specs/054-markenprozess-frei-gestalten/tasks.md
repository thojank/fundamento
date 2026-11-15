# Spec 054 – Aufgaben (MP-1: Frei gestalten auf der Leinwand)

**Spec:** [`spec.md`](spec.md) · **Plan:** [`plan.md`](plan.md) (technische Spec, danach Abschnitt 0 des Implementierungsplans und die Verfeinerungen aus T1) · **Basis:** `main` `aa53d3f4` · **Branch:** `261114-spec054-markenprozess-umsetzen-8584b4`

Acht Tickets, ein Strang (Spec: „höchstens 8 Tickets, ein PR“). Kein Ticket pusht, öffnet einen PR oder startet einen `workflow_dispatch`. Jedes Ticket trägt seine Punkte für den PR-Text, geänderte ältere Tests und Befunde unten ein; MPFG-5.1 fasst sie zusammen.

| Ticket | Spec | Inhalt | Hängt ab von | Stand |
|---|---|---|---|---|
| MPFG-1.1 | T1 | Reine Daten der Ansicht Gestalten: `grafeo-gestalten-sicht.ts`, `grafeo-gestalten.ts`, Alias `@fundamento/metiejo/gestalten`, Spec-Ordner; `grafeo-gestalten-054`, `grafeo-kabloj-054` | – | erledigt |
| MPFG-2.1 | T2 | Einstieg, zwei Ansichten, neutrale Belegung, `/api/leinwand` | 1.1 | erledigt |
| MPFG-2.2 | T3 | Leinwand: Aussehen aus Tokens, Phasen, Anschlüsse, Kanten, Ziehen, „+ Knoten“, Kopfleiste | 1.1 | erledigt |
| MPFG-3.1 | T4 | Schreibweg der Leinwand, Knoten Marke und Farbe | 2.1, 2.2 | erledigt |
| MPFG-3.2 | T5 | Knoten Palette: Basis, Stufe von Hand hell/dunkel, zurück zur Ableitung | 2.1, 2.2 | erledigt |
| MPFG-3.3 | T6 | Zwei Vorschauen (+ weitere), Neuberechnung ohne Neuladen | 2.1, 2.2 | erledigt |
| MPFG-4.1 | T7 | Verbindungen in der Sitzung mit Wirkung auf Palette und Vorschau | 3.1, 3.2, 3.3 | erledigt |
| MPFG-5.1 | T8 | Integrierte Tests, Bilder, Messung, Bericht-Entwurf | 4.1 | erledigt |

## Ausgangsmaß Bündel

Gebaut am unberührten Stand `aa53d3f41c56ab96bf3eae9b3b90e9a8625bd767` (Arbeitsbaum ohne Änderung, vor jeder Änderung an `vite.config.ts`), `pnpm --filter @fundamento/nodredaktilo build` (Vite 8.3.0):

| Datei | roh | gzip (Stufe 6, `gzip -c`) | gzip `-9` | Vite-Anzeige |
|---|---|---|---|---|
| `packages/nodredaktilo/dist/leinwand.js` | 635 947 Byte | 170 082 Byte | 168 656 Byte | 635.94 kB, gzip 171.35 kB |

Nach MPFG-1.1 (nur Alias, noch kein Import im Bündel) ist die Datei unverändert: 635 947 Byte roh, 170 082 Byte gzip.

## MPFG-1.1 im Einzelnen

- [x] Ausgangsmaß des Bündels zuerst gemessen (oben), dann erst `vite.config.ts` angefasst.
- [x] `spec.md`: `cp` der Produkt-Spec (`user-provided-product-spec-markenprozess-frei-gestalten.md`), `cmp` Exit 0, SHA-256 `3468029ed9e23cde4212da2af03e080cd23c50dffe00bb928bbc82df4d2d54ca`. Wird nicht editiert.
- [x] `plan.md`: die ersten 38 238 Byte byte-gleich mit der technischen Spec (`cmp` Exit 0, SHA-256 `5f3b8cce413bbf8cf669da597c847dad2c225b32e4c0c3aa53690697df663af4`), danach Abschnitt 0 des Implementierungsplans wörtlich (D-1 bis D-8) und die Verfeinerungen V-1 bis V-13 aus T1.
- [x] Rote Tests zuerst: `packages/metiejo/src/grafeo-gestalten-054.test.ts` (33 Tests) und `grafeo-kabloj-054.test.ts` (23 Tests). Erster Lauf rot aus dem erwarteten Grund: beide Dateien `Cannot find module './grafeo-gestalten.js'` (Module gab es noch nicht).
- [x] Umsetzung `packages/metiejo/src/grafeo-gestalten-sicht.ts` (ohne Import) und `grafeo-gestalten.ts`.
- [x] Grün: `FM_AUSGABE=knapp pnpm --filter @fundamento/metiejo test grafeo-gestalten-054 grafeo-kabloj-054` → **56 bestanden, 0 rot** (2,9 s).
- [x] Gegenprobe durch Mutation (je eine Änderung, Lauf, zurückgesetzt): `wirksamerAgordo` liest fortlaufend statt aus dem Gespeicherten → 1 rot; `kablojEl` ohne Doppel-Prüfung → 1 rot; Basis auch bei leerer Quelle → 1 rot; `validaLigo` ohne Vorwärts-Regel → 1 rot. Die letzten zwei waren zuerst grün und haben je einen Fall nachgezogen (leerer Akzent an „Warnung“; Palette → Farbknoten ohne vorhandene Kanten).
- [x] Alias `@fundamento/metiejo/gestalten` → `../metiejo/src/grafeo-gestalten-sicht.ts` in `packages/nodredaktilo/vite.config.ts` und `tsconfig.json` (`paths`). Geprüft mit einer Wegwerf-Datei in `src/`, die importiert: `tsc --noEmit` grün, Vite-Bau mit ihr als Einstieg enthält den Satz; die Datei ist wieder entfernt. `pnpm --filter @fundamento/nodredaktilo build` grün.
- [x] `pnpm --filter @fundamento/metiejo lint` grün (Biome 1 Warnung, alt: `src/komponentoj.ts:42` `noUnusedImports`, nicht angefasst); `pnpm --filter @fundamento/nodredaktilo lint` grün.
- [x] Diff-Suche über die neuen Dateien: das Wort aus R-12 und der Name des privaten Schriften-Repos kommen nicht vor (Suche mit zur Laufzeit zusammengesetztem Wort, 0 Treffer).

## Geänderte ältere Tests

- MPFG-1.1: keiner.

## Für den PR-Text

- MPFG-1.1: neue Module `packages/metiejo/src/grafeo-gestalten-sicht.ts` (Typen, `ARANGXO_054`, `poziciojKun`, `validaLigo`, `ligojKun`, `kablojDe`, `kablojTeksto`/`kablojEl`, `vorschauHref`, `KATALOGO_054`/`aldonebloj`, Sätze; ohne Import) und `grafeo-gestalten.ts` (`gestaltenDe`, `wirksamerAgordo`, `paletrojDe`, `serializeBildo`). Tests `grafeo-gestalten-054.test.ts`, `grafeo-kabloj-054.test.ts`.
- MPFG-1.1: `packages/nodredaktilo/vite.config.ts` und `tsconfig.json`: zweiter Alias `@fundamento/metiejo/gestalten` neben `@fundamento/metiejo/grafeo` (047 D-2). Keine neue Abhängigkeit, kein `test`-Skript.
- MPFG-1.1: Abweichungen vom Vertrag der technischen Spec: `plan.md` V-1 bis V-13 (u. a. `rev` in der Eingabe von `gestaltenDe`, `Aldoneblo` statt `Ero`, `LigoSitzung` mit `nodoj`).
- MPFG-1.1: Bündel vorher 635 947 Byte roh, 170 082 Byte gzip (Stand `aa53d3f4`).

## Befunde

- **B-4 (Daten, MPFG-1.1):** Die Basis-Stufe trägt Farbton und Buntheit, nicht die Farbe selbst. Aus dem Bildo (`Vico.fontoHex` neben `Vico.stufoj[basis].hex`), Ableitung am Stand des Branches:

  | Marke (erfunden) | Zeile | Farbe im Knoten | Basis | Wert der Basis |
  |---|---|---|---|---|
  | leer (Startwert) | Primär | `#375479` | 700 | `#375479` |
  | Gelb | Primär | `#f5c400` | 700 | `#665000` |
  | Gelb | Akzent (Limette) | `#c6f135` | 700 | `#475900` |
  | Gelb | Warnung | `#d99a00` | 600 | `#896000` |
  | Blau | Primär | `#2f5bff` | 700 | `#1b3adf` |
  | Blau | Erfolg | `#2e8b57` | 600 | `#007d46` |

  Nur der Startwert steht wörtlich auf seiner Basis; Gelb und Limette landen deutlich dunkler. Fundstelle: `packages/agordilo/src/calibration.ts:34` (`REFERENCE_STEPS`), `packages/agordilo/src/palettes.ts:170` (eine Funktionsfarbe gibt nur den Farbton, die Buntheit kommt aus der Kalibrierung, D-5). Im Bildo: `packages/metiejo/src/grafeo-gestalten.ts:206`. Die Ableitung wird nicht umgebaut; „Farbe aus dem Knoten“ (MPFG-3.2) heftet die genaue Farbe an.
- **B-1 (MPFG-1.1):** Der Knoten Neutral gibt nur die Tönung weiter (`elir: "mezuro"`, Feld `neutral.toenung`); eine freie Neutralfarbe gibt es nur über Palettenstufen. Ohne Feld ist der Knoten `leer` mit `toenung: 0` (wie `paletteSources`, `packages/agordilo/src/palettes.ts:159`). Sein Farbfeld (Neutral 100 hell) und das des leeren Akzents (Neutral 700) kommen aus der Ableitung des **wirksamen** Agordo, weil `gestaltenDe` nur diese bekommt (`packages/metiejo/src/grafeo-gestalten.ts:137`, `:151`): Mit „Primär gelöst“ oder „Neutral gelöst“ folgt das Farbfeld der wirksamen Sicht, nicht dem gespeicherten Agordo (gehört zu D-5). Der Wert im Feld und die Tönung bleiben die gespeicherten.
- **B-5 / R-1 (MPFG-1.1, neu):** Am Stand `aa53d3f4` leitet die Struktur ihre eigene dunkle Stufe `neutral.950` auf **denselben** Wert wie hell ab (leer, komuna und provo: `#1f1f1f`/`#1f1f1f`, provo `#1e1d22`/`#1e1d22`). Ohne einen dunklen Wert von Hand ist deshalb keine Stufe geteilt (`hexDunkel` fehlt überall). Die Produkt-Spec nimmt an, dass `neutral.950` im Dunkeln eigens abweicht (Edge Case „Stufe für hell gesetzt, für dunkel nicht“, B-5); MPFG-3.2 prüft R-1 an beiden Stylesheets. Fundstelle: `packages/agordilo/src/package.ts:175` (`modeOverrides`), `packages/agordilo/src/palettes.ts:373` (`withFestgelegtSteps`). Der Test `grafeo-gestalten-054.test.ts` deckt beide Zweige ab (gleich → ganz, von Hand → geteilt).
- **Fremd (MPFG-1.1):** Ein versehentlicher Lauf der ganzen Metiejo-Suite (`pnpm … test -- <datei>` reicht den Filter nicht an Vitest weiter) zeigte 3 rote Tests in `packages/metiejo/src/esploro/start-ohne-playwright.test.ts` (`:113`, `:129`, `:135`: „the MCP server ended early“, „fm metiejo ended early“; dazu „Warnung: Sie scheinen ein leeres Repository geklont zu haben.“). Sie berühren keine Datei dieses Laufs; nicht weiter verfolgt. Hinweis für die nächsten Tickets: Datei-Filter ohne `--` übergeben (`pnpm --filter @fundamento/metiejo test grafeo-gestalten-054`).

## MPFG-2.1 (T2): Einstieg, zwei Ansichten, neutrale Belegung, `/api/leinwand`

### MPFG-2.1 im Einzelnen

- [x] Rote Tests zuerst: `packages/metiejo/src/grafeo-einstieg-054.test.ts` (9 Tests) und `grafeo-route-054.test.ts` (8 Tests). Erster Lauf rot aus dem erwarteten Grund: 7 von 9 Einstieg-Tests rot (Block fehlt, `ziel` wird nicht gelesen, Startseite unverändert gegen ihre Prüfsumme), `grafeo-route-054` `Cannot find module './grafeo-gestalten-ekrano.js'`.
- [x] Prüfsummen (SHA-256) aller neun Schritte von `screen(exampleScreenInput(key))` und von `grafeoScreen` für zwei feste Eingaben am unberührten Stand (`sxtupoj.ts`, `html.ts` und alle Abhängigkeiten gleich `aa53d3f4`) genommen, bevor eine Zeile geändert war; die Tests halten sie fest.
- [x] Umsetzung: `sxtupoj.ts` (nur Fall `start`), `servilo.ts` (Routen), neu `grafeo-gestalten-ekrano.ts` (`gestaltenScreen`, `LEINWAND_CSS_HREF`), `html.ts` (ein Opt-in-Feld), neu `packages/nodredaktilo/belegung/leinwand.agordo.json`, `packages/nodredaktilo/scripts/bilder.ts` (047-Skript auf Verstehen).
- [x] Grün: `FM_AUSGABE=knapp pnpm --filter @fundamento/metiejo test grafeo-einstieg-054` → 9/9; `… test grafeo-route-054` → 8/8; `… test grafeo-route-047 sxtupoj.test` → 37/37. Breiter Lauf `… test grafeo sxtupoj servilo studio abhaengigkeiten vorschau stato-04 marko` → 294 bestanden, 1 rot: `grafeo-literale-054.test.ts:71` (Datei von MPFG-2.2, dort in Arbeit, nicht von diesem Ticket). `… test komuna-0-2 lingvo nachlese docs kontrolo` → 41/41.
- [x] Gegenprobe durch Mutation: Gestalten ruft `pruefungOf` → `grafeo-route-054` rot (Zähler am Tor der Prüfung). Der Test war zuerst grün geblieben, weil die Prüfung einer schon geöffneten Marke im Speicher lag; er nutzt jetzt eine Marke, die kein anderer Test öffnet.
- [x] D-1 im echten Browser geprüft (Chromium über das Playwright der nodredaktilo, gebautes `dist/` der Metiejo, Arbeitsordner unter `tmpdir`, danach gelöscht): Klick auf „Auf der Leinwand anlegen“ → `/marko/lumo-test/grafeo` (Wurzel `data-fm-aspekto="leinwand"`, `dark`); Klick mit leerem Namen → bleibt auf `/`, danach „Anlegen“ → `/marko/nubo/farbe` (der Merker fällt nach dem Klick zurück); Enter im Namensfeld → `/marko/vento/farbe`. Hintergrund der Seite hell `rgb(228, 228, 228)`, dunkel `rgb(31, 31, 31)` (aus `leinwand.css`).
- [x] `pnpm --filter @fundamento/metiejo lint`: `tsc` grün; Biome meldet 1 Fehler in `src/grafeo-literale-054.test.ts` (Formatierung, Datei von MPFG-2.2) und die alte Warnung `src/komponentoj.ts:42`. Die Dateien dieses Tickets sind Biome-sauber. `tsc` der nodredaktilo grün.
- [x] Diff-Suche über die neuen Zeilen: das Wort aus R-12 und der Name des privaten Schriften-Repos kommen nicht vor (0 Treffer).

### MPFG-2.1: geänderte Zeilen in `sxtupoj.ts` (`git diff -U0 aa53d3f4 -- packages/metiejo/src/sxtupoj.ts`)

```diff
@@ -332,0 +333,15 @@ function fields(input: ScreenInput): string {
+      // Spec 054 (E-10, D-1): the block „Neue Marke auf der Leinwand“ with its own action, a direct
+      // child of the form (only such a submit button sends it). The form never sends its submitter,
+      // so a classic script, registered while the page is parsed (before the module metiejo.js),
+      // notes a click on this action and adds ziel=leinwand to the values of that one submit.
+      const leinwand = `<fm-titolo level="2">Neue Marke auf der Leinwand</fm-titolo><fm-teksto>Nur mit dem Namen oben: Die Marke beginnt leer und öffnet sich direkt zum freien Gestalten.</fm-teksto><fm-butono type="submit" emphasis="medium" data-mt-ziel="leinwand">Auf der Leinwand anlegen</fm-butono><script>{
+  const form = document.currentScript.parentElement;
+  const action = form.querySelector(":scope > fm-butono[data-mt-ziel]");
+  let ziel = false;
+  action.addEventListener("click", () => { ziel = true; });
+  document.addEventListener("click", () => { ziel = false; });
+  form.addEventListener("submit", (event) => {
+    if (ziel && event.detail && event.detail.values) event.detail.values.ziel = "leinwand";
+    ziel = false;
+  });
+}</script>`;
@@ -337 +352 @@ function fields(input: ScreenInput): string {
-      }</fm-elekto>${open}`;
+      }</fm-elekto>${open}${leinwand}`;
```

Alle Zeilen liegen im Fall `start` von `fields()`; jeder andere Fall ist Byte für Byte gleich (Prüfsummen in `grafeo-einstieg-054.test.ts`). `sxtupoj.test.ts` unverändert und grün.

### MPFG-2.1: geänderte ältere Tests und Skripte (047)

| Datei:Zeile (danach) | vorher | nachher | Grund |
|---|---|---|---|
| `packages/metiejo/src/grafeo-route-047.test.ts:27–31` | `{ pfad: "/marko/provo/grafeo", aspekto: "provo", fonto: "/api/grafeo?marko=provo" },` | `{ pfad: "/marko/provo/grafeo?ansicht=verstehen", aspekto: "provo", fonto: "/api/grafeo?marko=provo" },` (Biome bricht es in fünf Zeilen) | `/marko/:name/grafeo` öffnet jetzt Gestalten; die 047-Ansicht ist Verstehen (AK-8). |
| `grafeo-route-047.test.ts:137` | `mit.anfrage("GET", "/marko/zyklo/grafeo")` | `mit.anfrage("GET", "/marko/zyklo/grafeo?ansicht=verstehen")` | dieselbe Seite (Mount-Punkt `/api/grafeo`, Abzeichen „nicht exportierbar“) liegt jetzt hinter Verstehen. |
| `grafeo-route-047.test.ts:154` | ``const pfad = `${ekrano.pfad}${query}`;`` | ``const pfad = `${ekrano.pfad}${ekrano.pfad.includes("?") ? query.replace("?", "&") : query}`;`` | der Pfad trägt jetzt selbst eine Abfrage; `?scheme=…` wird mit `&` angehängt. |
| `grafeo-route-047.test.ts:191` | `mit.anfrage("GET", "/marko/provo/grafeo")` | `mit.anfrage("GET", "/marko/provo/grafeo?ansicht=verstehen")` | „nicht exportierbar“ gibt es nur in Verstehen (Gestalten ruft keine Prüfung). |
| `packages/nodredaktilo/scripts/bilder.ts:67–72` | `{ marke: "provo", seite: "/marko/provo/grafeo", api: … }` | `seite: "/marko/provo/grafeo?ansicht=verstehen"` (mit Kommentar, Biome bricht in sechs Zeilen) | das 047-Bilder-Skript fotografiert die 047-Ansicht. |
| `packages/nodredaktilo/scripts/bilder.ts:473` | ``const url = `${basis}${marke.seite}?scheme=light`;`` | ``const url = `${basis}${marke.seite}${marke.seite.includes("?") ? "&" : "?"}scheme=light`;`` | wie oben: Abfrage anhängen statt zweites `?`. |

Unverändert und weiter grün: `grafeo-route-047.test.ts:260–261` (503 ohne Bündel gilt für beide Ansichten), alle 048-Tests, `sxtupoj.test.ts`.

### MPFG-2.1: für den PR-Text

- Routen in `packages/metiejo/src/servilo.ts`: `GET /marko/:name/grafeo` = Gestalten (Vorgabe; jedes `ansicht` außer `verstehen`), `?ansicht=verstehen` = 047-Ansicht mit Umschalter zurück (`:1730`, `:1761`); `GET /nodredaktilo/leinwand.css` vor der statischen Bündel-Route (`:1583`); `GET /api/leinwand?marko=` ohne `kabloj`, je `rev` im Speicher, schreibt nie (`:1607`); `POST /marko` mit `ziel=leinwand` (`:1832`): Grundlage immer `leer`, 303 auf `/marko/:name/grafeo`, Kroniko `kreo` mit `detaloj: { basis: "leer", ziel: "leinwand" }`; `basis=oeffnen` + `ziel=leinwand` antwortet wie ein fehlender Name. Ohne `ziel` Byte für Byte wie vorher.
- Neue Datei `packages/metiejo/src/grafeo-gestalten-ekrano.ts` (`gestaltenScreen`, `LEINWAND_CSS_HREF`). Mount-Punkt: `<div id="nr-leinwand" data-nr-ansicht="gestalten" data-nr-fonto="/api/leinwand?marko=:name" data-nr-marko=":name"></div>`.
- Neutrale Belegung `packages/nodredaktilo/belegung/leinwand.agordo.json` (`name: "leinwand"`, `leitfarbe: "#595959"`, `neutral.toenung: 0`), abgeleitet mit `previewCssInTeilen` (dieselbe Ableitung und `CSS_CELO` wie `vorschau.css`), einmal je Prozess im Speicher. Kein neuer Token: jeder `--fm-*`-Name des Stylesheets steht auch in `komunaCss` (Test).
- 047-Datei berührt (D-2): `packages/metiejo/src/html.ts:942–946` (Feld `gestaltenHref?: string` an `GrafeoScreen`), `:973–976` (Umschalter `<span id="nr-ansicht"><fm-ligilo …>Gestalten</fm-ligilo> | Verstehen</span>`), `:989` (im Kopf eingesetzt). Ohne das Feld Byte für Byte wie vorher (Prüfsumme in `grafeo-route-054.test.ts`). `/aspekto/:label/grafeo` setzt es nicht.
- Geänderte 047-Tests und das 047-Skript: Tabelle oben.

### MPFG-2.1: Befunde

- **D-1 (B-3-Art):** `fm-formularo` sendet seinen Absende-Knopf nicht: `#submit()` sammelt nur benannte Felder (`packages/projekcioj/src/celoj/web-component/sxablono-template.ts:324–344`), und nur ein `fm-butono[type=submit]` als direktes Kind sendet (`:298–305`, `button.parentElement !== this`); `metiejo.js` reicht `event.detail.values` unverändert weiter (`packages/metiejo/src/html.ts:180–183`). Umgangen mit einem kleinen klassischen Skript im Fall `start` (`packages/metiejo/src/sxtupoj.ts:337–347`); im Browser geprüft (oben). `metiejo.js`, Eroj und `screenDocument` unverändert.
- **D-2:** `grafeoScreen` liegt in `html.ts`, nicht in `grafeo-sicht.ts`; dort ein Opt-in-Feld (siehe PR-Text).
- **Neu – 422 von `/api/leinwand` ist ohne `kabloj` nicht erreichbar:** Jeder Entwurf kommt durch `readAgordo` in den Server (`packages/metiejo/src/marko.ts:103–110` liest Dateien so, jede Schreibroute ebenso), also liest ihn `readAgordo` in der Route immer. Der Zweig (`servilo.ts:1624–1635`) bleibt wie bei `/api/grafeo` und wird erst mit `kabloj` (MPFG-4.1, ungültiger wirksamer Agordo) erreichbar; kein Test für ihn in diesem Ticket.
- **Neu – Sättigung der Belegung (Abweichung von der technischen Spec):** Die technische Spec nennt `regler.saettigung` „am unteren Rand der vorhandenen Grenzen“ (Schema: 0). Mit 0 werden auch die Status-Paletten grau (`packages/agordilo/src/palettes.ts:268`, die Sättigung multipliziert die Buntheit jeder Leiter), und damit `--fm-color-syntax-*` und die Zustände – das widerspricht D-8 (Art-Farben aus `syntax.*`) und der Produkt-Spec („Die einzige Farbe auf der Fläche sind die Farben der Marke, die Anschlüsse und die Zustände“). Die Belegung lässt `regler` deshalb weg (Vorgabe 1). Die Leitfarbe ist unbunt, `neutral.toenung: 0`, also bleiben Grund, Linien und Text unbunt; bunt sind nur Status- und Syntax-Rollen.
- **Neu – R-14 geprüft:** Der Selektor des Stylesheets ist `:where(:root[data-fm-aspekto="leinwand"])` (hell) und `…[data-fm-color-scheme="dark"]` (dunkel); die Seite setzt `data-fm-aspekto` aus dem `name` der Belegung (eine Quelle, Test).
- **Hinweis für MPFG-2.2:** Im Browser-Lauf warf das zur Zeit gebaute `dist/leinwand.js` auf der Gestalten-Seite „Cannot read properties of undefined (reading 'map')“ – das alte 047-Bündel liest `/api/leinwand` als Graph, solange die Weiche auf `data-nr-ansicht` nicht gebaut ist. Erwartet bis MPFG-2.2.

## MPFG-2.2 (T3): Leinwand – Aussehen aus Tokens, Phasen, Anschlüsse, Kanten, Ziehen, „+ Knoten“, Kopfleiste

### MPFG-2.2 im Einzelnen

- [x] Roter Test zuerst: `packages/metiejo/src/grafeo-literale-054.test.ts` (3 Fälle: die Dateien der Hülle sind da; kein Hex-, `rgb(`/`rgba(`-, `hsl(`/`hsla(`-, `oklch(`/`oklab(`-, `lab(`/`lch(`/`hwb(`-Literal unter `packages/nodredaktilo/src/gestalten/**`; Selbstprobe der Muster). Mit einer gepflanzten Datei `src/gestalten/kanvaso.tsx` (`"#f5c400"`, `"oklch(0.5 0.1 90)"`) rot aus dem richtigen Grund: 11 fehlende Dateien und `kanvaso.tsx:1: hex #f5c400`, `funktion oklch(`. Pflanze entfernt, dann umgesetzt.
- [x] Grün: `FM_AUSGABE=knapp pnpm --filter @fundamento/metiejo test grafeo-literale-054` → 3/3.
- [x] `pnpm --filter @fundamento/nodredaktilo lint` (tsc + Biome) grün, 28 Dateien.
- [x] Im Browser (Chromium über Playwright, Metiejo aus den Quellen mit den Routen von MPFG-2.1, Marken `provo` leer und eine erfundene Marke mit Primär, Akzent, Warnung, Tönung): dunkel und hell; Schalter „Leinwand hell | dunkel“ ohne Neuladen (`?scheme=light` per `replaceState`); sechs Phasen als Gruppen-Knoten; Knoten am Kopf gezogen (bleibt liegen), Phase 4 am Kopf gezogen (Knoten wandern mit), Zug auf der Fläche einer leeren Phase schwenkt; beim Ziehen **keine** Anfrage; Liste „+ Knoten“ (Funktionsfarbe anlegen → leerer Knoten an seinem Startplatz in der verschobenen Phase, gewählt, Kanten Marke → Knoten → eigene Zeile, gestrichelt; weitere Vorschau → versetzt, mit Kante von der Palette, „×“ entfernt sie; Akzent „setzen“ wählt den Akzent-Knoten; Esc und Klick daneben schließen); Legende unten links; Zoom unten rechts; `?ansicht=verstehen` mountet weiter die 047-Leinwand; keine Konsolenmeldung.
- [x] Bündel `dist/leinwand.js` nach MPFG-2.2: **689 560 Byte roh, 183 304 Byte gzip** (Stufe 6), vorher 635 947 / 170 082.

### MPFG-2.2: für den PR-Text

- MPFG-2.2: `packages/nodredaktilo/src/leinwand.tsx`: Weiche auf `data-nr-ansicht="gestalten"` (+ `data-nr-marko`) → `<Gestalten>`; ohne das Attribut mountet `<Kanvaso>` (047) wie bisher.
- MPFG-2.2: `packages/nodredaktilo/src/fm-elementoj.d.ts`: Typen für `fm-kampo`, `fm-glitilo`, `fm-ligilo`, dazu `type`, `disabled`, `loading`, `full-width`, `label` an `fm-butono` (R-15).
- MPFG-2.2: neu `packages/nodredaktilo/src/gestalten/`: `kanvaso.tsx` (Fläche, Sitzung, Marken `data-nr-preta`/`data-nr-rev`), `kunteksto.ts` (Kontext §2.3), `datumoj.ts` (`sxargi`, `skribi`), `roloj.ts` (Rollen, `--xy-*`, gemeinsame Regeln), `sxelo.tsx` (Rahmen, Kopf, Marke, Art-Zeichen), `anschluss.tsx`, `kanto.tsx`, `kapo.tsx`, `menuo.tsx`, `legendo.tsx` (Legende, Zoom), `nodoj/fazo.tsx` und die Platzhalter `nodoj/marko.tsx`, `farbo.tsx`, `paletro.tsx`, `vorschau.tsx`. Test `packages/metiejo/src/grafeo-literale-054.test.ts`.
- MPFG-2.2: Kanten bleiben in diesem Ticket fest (`nodesConnectable`/`edgesReconnectable` aus, `deleteKeyCode` aus); MPFG-4.1 schaltet sie ein.

### MPFG-2.2: Befunde

- **R-12 / D-8 (Art-Rollen):** Rollen: Marke → `--fm-color-text-default`, Maß → `--fm-color-syntax-string`, Text → `--fm-color-syntax-name`, Schrift → `--fm-color-syntax-number`, Bild → `--fm-color-syntax-keyword`, KI → `--fm-color-text-muted`, Farbe → die Farbe selbst (inline). Gemessen in der neutralen Belegung: **dunkel** `string #95cea0`, `name #8dc5ed`, `number #e6b37a`, `keyword #fca298`, `text-default #eeeeee` auf Grund `#1f1f1f` – unterscheidbar, aber blass (helle Pastelltöne). **Hell** `string #004b1e`, `name #004163`, `number #573400`, `keyword #780008`, `text-default #292929` auf `#e4e4e4` – alle sehr dunkel; an einem 10-px-Quadrat sind Maß, Text und Marke kaum zu trennen. Ergebnis: in dunkel tragfähig, in hell nur knapp; die Arten unterscheiden sich zusätzlich durch gefüllt/hohl und die Legende (Rückfall nach R-12). Kein neuer Token. Fundstelle: `packages/nodredaktilo/src/gestalten/roloj.ts` (`ART_ROLOJ`).
- **Phasen-Fläche schwenkt:** React Flow setzt an jeden ziehbaren Knoten die Klasse `nopan` (`@xyflow/react` 12.12.1, `NodeWrapper`, `[noPanClassName]: isDraggable`), ein Zug auf der Fläche einer Phase würde daher nicht schwenken. Gelöst ohne Umbau: die Phase hat `style.pointerEvents: "none"`, nur ihr Kopf (`dragHandle`) nimmt den Zeiger; die Fläche reicht ihn an die Bühne durch. Folge: die Fläche einer Phase hat keinen eigenen Hover-Rand (der Kopf schon).
- **Rollen der Flächen:** Bühne `background-canvas`, Phase `background-default`, Knoten/Kopfleiste/Liste `background-raised`, Linien `border-subtle`/`border-default`, Text `text-default`/`text-muted`, Punkte `border-subtle`, Ring `focus-ring`, Schatten `elevation-shadow-floating`/`-overlay`. In dunkel liegen Phase (`#292929`) und Knoten (`#3d3d3d`) gut getrennt; in hell sind Phase und Knoten nahe beieinander (beide sehr hell), der Rahmen trägt die Trennung.

## MPFG-3.3 (T6): Zwei Vorschauen (+ weitere), Neuberechnung ohne Neuladen

### MPFG-3.3 im Einzelnen

- [x] Rote Tests zuerst: `packages/metiejo/src/grafeo-vorschau-054.test.ts` (4 Tests). Erster Lauf: 3 grün (die Daten aus MPFG-1.1/2.1 erfüllen sie schon), 1 rot aus dem erwarteten Grund (Platzhalter ohne Rahmen, ohne `vorschauHref`, ohne `data-nr-vorschau-rev`, ohne `NOWHEEL`). Für die drei grünen je eine kurze Mutation in `vorschauHref` (sofort zurückgesetzt, `cmp` geprüft): `sxtupo=buehne-farbe` → alle drei rot; Schema vertauscht → Tests 1 und 2 rot; `rev` fest auf 1 → Test 3 rot. Kontrolle im Test selbst: der Bühnen-Rahmen derselben Marke trägt die Prüfmarken und fragt die Prüfung (Zähler am Prüf-Tor).
- [x] Umsetzung `packages/nodredaktilo/src/gestalten/nodoj/vorschau.tsx` (Platzhalter ersetzt, Name `VorschauNodo` und Anschluss bei 54 bleiben).
- [x] Grün: `grafeo-vorschau-054 grafeo-literale-054 grafeo-gestalten-054 grafeo-route-054` 48/48 (mit `TURBO_HASH=lokal pnpm exec vitest run …`, weil der Vorab-Bau von metiejo zu der Zeit an der halbfertigen `grafeo-skribo.ts` von MPFG-3.1 scheiterte). `pnpm --filter @fundamento/nodredaktilo lint` grün, Build grün.
- [x] Im Browser (Chromium, Metiejo aus den Quellen, eigener Port, Wegwerf-Arbeitsordner) geprüft, siehe Build-Log.

### MPFG-3.3: für den PR-Text

- MPFG-3.3: Knoten Vorschau · Komponenten (`nodoj/vorschau.tsx`): echte Vorschau der Marke ohne Prüfmarken (`sxtupo=vorschau`, AK-10) im Rahmen, je Knoten eigener Schalter hell/dunkel (folgt nicht dem Schalter der Leinwand, AK-23), „×“ nur an weiteren Vorschauen, ohne Eingang `NE_KONEKTITA_SATZ` und kein Laden.
- MPFG-3.3: Doppelpuffer: neuer `rev`, neues `kabloj` oder anderes Schema → neuer Rahmen per Skript, der alte bleibt gedämpft sichtbar bis `load` (kein Rahmen aus dem Parser, testing.md / Spec 051 T3).
- MPFG-3.3: Marken am Mount-Element `#nr-leinwand`: `data-nr-vorschau-rev` (der rev, den alle verbundenen Vorschauen zeigen), `data-nr-vorschau-kabloj`, `data-nr-vorschau-laedt`. Gesetzt aus `vorschau.tsx` per DOM, die Schale bleibt unverändert.
- MPFG-3.3: neuer Test `grafeo-vorschau-054.test.ts` (AK-10, AK-23). Keine älteren Tests geändert.

### MPFG-3.3: Befunde

- **R-11 (erwartet, gemessen erst in MPFG-5.1):** Jede Änderung lädt jeden verbundenen Vorschau-Rahmen neu (zwei feste plus jede weitere; je Rahmen Dokument und `vorschau.css`). Lokal einmal beobachtet: Bildo nach dem Schreiben da, dann ≈ 360 ms bis zum ersten und ≈ 400 ms bis zum zweiten neuen Rahmen (keine Messung, kein Schwellwert).
- Die Vorschau-Dokumente melden bei jedem Laden zwei Konsolen-Warnungen `fm-ikono: name is required …` aus dem vorhandenen Vorschau-Inhalt (nicht aus dieser Änderung); mit mehreren Rahmen je Änderung vervielfacht sich das.

## MPFG-3.2 (T5): Knoten Palette – Basis, Stufe von Hand für hell und dunkel, zurück zur Ableitung

### MPFG-3.2 im Einzelnen

- `packages/nodredaktilo/src/gestalten/nodoj/paletro.tsx` (Platzhalter ersetzt, `PaletroNodo`, Anschlüsse 30/54 unverändert) und neu `nodoj/stufo-kampo.tsx` (das Feld unter der Zeile).
- Test `packages/metiejo/src/grafeo-paletro-054.test.ts` (8 Fälle): R-1-Abgleich jeder Stufe (Bildo `hex`/`hexDunkel`) gegen den hellen Hauptsatz und den dunklen Block der Marke in `vorschau.css` für leer, komuna, provo und nach Werten von Hand; hell/dunkel/beide/Basis; „↺“ je Schema über `POST /api/marko/:name/leinwand`; unlesbarer Wert → 422, nichts geschrieben; Basis/`fontoHex` am echten `/api/leinwand` (AK-25).

### MPFG-3.2: für den PR-Text

- Palette: Basis umrandet, Feld in der Farbe des Knotens und „Basis 700/600“ an der Zeile, Nadeln oben/unten, geteilte Stufen, Feld „hell“/„dunkel“ mit Farbwähler, „↺“, „Übernehmen“, „Farbe aus dem Knoten“, Fußnote mit „N angeheftet: …“. Keine Regel, keine Zahl, kein Rot.
- Die Stufen sind native `<button>` (kein Ero hat eine Farbfläche mit Verlauf); Felder `fm-kampo`, Knöpfe `fm-butono`, Farbwähler natives `<input type="color">`, alle `nodrag`.

### MPFG-3.2: Befunde

- **R-1 / B-5 bestätigt:** Ohne Wert von Hand ist in leer, komuna und provo keine Stufe geteilt; beide Schemata tragen in `vorschau.css` denselben Wert (der dunkle Block der Marke setzt `neutral.950` eigens, aber gleich hell; agordilo `package.ts:175`, `palettes.ts:373`). Ein heller Wert von Hand gilt in beiden Schemata – außer an `neutral.950`: dort bleibt der dunkle Wert der Ableitung (der alte helle Wert) stehen, die Stufe ist danach geteilt (Test „a light value on neutral.950 …“). Das entspricht der Randfall-Zeile der Produkt-Spec; die Annahme „im Dunkeln setzt die Ableitung einzelne Stufen eigens“ trifft nur insofern zu, als der Wert sichtbar wird, sobald hell von Hand abweicht.
- **B-4 (am echten `/api/leinwand`):** Gelb `#f5c400` → Basis accent 700 `#665000`; Limette `#c6f135` → Basis sekundo 700 `#475900`; Warnung `#d99a00` → Basis warning 600 `#896000`. Funktionsfarben übernehmen nur den Farbton, die Buntheit kommt aus der Kalibrierung (D-5, agordilo `palettes.ts` ≈ 171–177, `calibration.ts:34`). „Farbe aus dem Knoten“ heftet die genaue Farbe an (im Browser geprüft: accent.700 danach `#f5c400`, Nadel oben, weiter Basis).
- **B-3:** nicht beobachtet – keine von Hand gesetzte Stufe wurde von der Ableitung überschrieben (hell, dunkel, beide, Basis, `neutral.950`).
- Funktionsfarben ohne Wert haben heute `fonto: null` (nicht ihre eigene Rolle); die Zeile zeigt „abgeleitet“ wie im Mockup.
- Jedes Öffnen des Feldes erzeugt zwei Konsolen-Warnungen `fm-ikono: name is required …` aus der Schattenvorlage von `fm-kampo` (Eroj, nicht geändert).

## MPFG-3.1 (T4): Schreibweg der Leinwand, Knoten Marke und Farbe

### MPFG-3.1 im Einzelnen

- [x] Roter Test zuerst: `packages/metiejo/src/grafeo-skribo-054.test.ts` (19 Tests). Erster Lauf rot aus dem erwarteten Grund: `Cannot find module '/src/grafeo-skribo.js'`.
- [x] Umsetzung: neu `packages/metiejo/src/grafeo-skribo.ts` (rein: `leinwandSchreiben`, `sxangxoEl`, `feldDe`, `farboHex`, `dtcgDe`, `paletroStufojDe`, Sätze), in `servilo.ts` ein eigener Block `POST /api/marko/:name/leinwand` (eigene Regex, direkt nach `GET /api/leinwand`) und eine Importzeile. `festlegen`, `entwurf`, `PATCHABLE` und die vorhandene `api`-Regex unverändert.
- [x] Grün: `FM_AUSGABE=knapp pnpm --filter @fundamento/metiejo test grafeo-skribo-054` → 19/19. Mit den Nachbarn `… test grafeo-skribo-054 grafeo-route-054 grafeo-route-047 grafeo-einstieg-054 studio servilo` → 140/140. `grafeo-literale-054` → 3/3 mit den neuen Knoten.
- [x] Gegenprobe durch Mutation: die Route ruft `checkDraft` vor `setDraft` → `grafeo-skribo-054` rot (Zähler über `vi.mock("./vorschau.js")`); zurückgesetzt.
- [x] Knoten `nodoj/marko.tsx` und `nodoj/farbo.tsx` ersetzen die Platzhalter (Namen `MarkoNodo`, `FarboNodo`, `FARBO_ANSCHLUSS_SUPRO {granda: 57, kompakta: 42}` und die Anschlusshöhen unverändert). `pnpm --filter @fundamento/nodredaktilo build` und `lint` grün; `pnpm --filter @fundamento/metiejo lint` grün (nur die alte Warnung `komponentoj.ts:42`).
- [x] Im Browser (Chromium aus der nodredaktilo, gebautes `dist/` der Metiejo auf eigenem Port, Arbeitsordner unter `tmpdir`): Marke über „Auf der Leinwand anlegen“; Primär `#f5c400` + Enter → „gespeichert HH:MM“, Marke „von Hand“, kein Neuladen; `blau` → ruhiger Satz unter dem Feld in `--fm-color-text-muted` (berechnete Farbe gleich), Eingabe bleibt, `rev` gleich, Knoten angehoben (zIndex 10); Akzent setzen und mit „×“ entfernen; Regler „Tönung“ gezogen → geschrieben erst beim Loslassen, Knoten bewegt sich nicht; Funktionsfarbe über „+ Knoten“, Feld hat den Fokus, Wert gesetzt, „↺“ entfernt sie; „↺“ an einem leeren Knoten aus der Sitzung entfernt ihn ohne Schreiben; „Akzent setzen“ setzt den Fokus; Farbwähler schreibt bei `change`; Leinwand hell.

### MPFG-3.1: für den PR-Text

- MPFG-3.1: neuer Schreibweg der Leinwand `POST /api/marko/:name/leinwand` (`packages/metiejo/src/grafeo-skribo.ts`, Block in `servilo.ts` nach `GET /api/leinwand`): genau eine Änderung `{farbe}`, `{toenung}` oder `{stufe}` (hell/dunkel); 200 `{rev, gespeichert}`, 422 `{feld, satz}` nur für einen unlesbaren Wert oder einen ungültigen Agordo, 400 wie `/api/marko/*` (`json-invalid`, neu `sxangxo-invalid` für einen Körper ohne genau eine bekannte Änderung), 404 wie `/api/marko/*`. Keine Prüfung, kein `checkDraft`, kein 409, kein `probleme`/`betroffen`. Kroniko über `setDraft(…, "regilo")` wie der Schnellstart.
- MPFG-3.1: Stufenwerte (Hex 3/6, `oklch(L C H)`) werden als DTCG-`srgb`-Wert (`#rrggbb`) gespeichert (D-4); Farben der Knoten bleiben als Text, wie eingegeben (getrimmt).
- MPFG-3.1: Knoten Marke und Farbe (Primär, Akzent, Neutral, Funktionsfarben) in `packages/nodredaktilo/src/gestalten/nodoj/marko.tsx`, `farbo.tsx`. Bedienelemente: `fm-kampo`, `fm-butono`, `fm-glitilo`, dazu der native Farbwähler unter „Farbwähler“; alles `nodrag`, nur `--fm-*`-Rollen.
- MPFG-3.1: Bündel nach diesem Ticket (mit den Arbeitsständen von 3.2/3.3 im selben Baum): `dist/leinwand.js` 721,78 kB roh, 191,50 kB gzip (Vite-Anzeige).

### MPFG-3.1: Befunde

- **B-2 `festlegen` urteilt:** `POST /api/marko/:name/festlegen` antwortet 409 (1) bei `sekundo-not-action`: am Stand `aa53d3f4` `packages/metiejo/src/servilo.ts:1244–1255` (`aktionsWortOf` + `istZweitfarbe`, `reply(…, 409)` in Zeile 1253), im Arbeitsbaum `:1282–1293`; (2) bei einer neu verletzten festen Regel (`fresh`): am Stand `aa53d3f4` `servilo.ts:1295–1314` (`const refused = fresh[0]`, `reply(…, 409)` in Zeile 1313), im Arbeitsbaum `:1333–1352`. `festlegen` beginnt am Stand `aa53d3f4` in Zeile 1145. Der Schreibweg der Leinwand umgeht beides (Test: Stufe `color.palette.accent.700` = `#f5c400` → 200); Studio und `festlegen` unverändert.
- **B-1 Neutral:** Der Knoten schreibt nur `neutral.toenung` (`{toenung}`); eine bestimmte Neutralfarbe nur über Palettenstufen. Hinweis am Knoten: „Eine bestimmte Neutralfarbe setzt du in der Palette.“
- **B-3 nicht setzbare Stufen:** Der Schreibweg lehnt Stufen ab, die keine Ableitung je liest (422, „Diese Stufe gibt es in der Palette nicht.“): für die Zweitfarbe `sekundo.25`, `.850`, `.975` (`packages/agordilo/src/palettes.ts:61` `ZWEITFARBE_STEPS`, `:311`), außerdem jede Stufe außerhalb der Kalibrierung und jeder Token, der keine Palettenstufe ist. Eine `sekundo`-Stufe lässt sich ohne Zweitfarbe setzen, wirkt aber erst mit einer (`withFestgelegtSteps` findet ohne Ableitung der Palette keine Stufe, `palettes.ts:389–391`); nach „Akzent entfernen“ bleiben solche Einträge im Agordo (R-3, Test).
- **D-5:** Eine Funktionsfarbe gibt der Palette nur ihren Farbton (`palettes.ts:170`), die Neutralpalette folgt der Buntheit von Primär (`palettes.ts:159`); der Schreibweg ändert daran nichts.
- **Neu (D-4):** Ein `oklch(…)`-Wert außerhalb von sRGB wird je Kanal abgeschnitten, bevor er als Stufe gespeichert wird (`hexOf`, `packages/metiejo/src/sxtupoj.ts:196`); der gespeicherte Wert ist dann nicht genau der eingegebene.
- **Neu (Primär leer):** `{farbe: {rolle: "primaer", wert: null}}` → 422 „Primär braucht einen Farbwert.“ (der Agordo verlangt `leitfarbe`); im Knoten setzt ein leeres Primär-Feld nur den gespeicherten Wert zurück.
- **Neu (Eroj, nicht geändert):** `fm-kampo` meldet in der Konsole je Feld „fm-ikono: name is required … using add.“ (sein inneres Statuszeichen ohne Namen); auch auf der Startseite. Das native Eingabefeld im Schatten des `fm-kampo` behält in einer Flex-Zeile seine Eigenbreite (`size` 20); `farbo.tsx` gibt ihm über `::part(control)` `min-inline-size: 0`.
- **Neu (Leinwand-Hülle, nicht geändert):** `kanvaso.tsx` behält einen Funktionsfarben-Knoten aus „+ Knoten“ in `sesio.nodoj`, auch wenn der `Bildo` ihn längst trägt (er wird nur ausgeblendet). Nach „↺“ käme er leer zurück. `farbo.tsx` ruft deshalb vor dem Schreiben von `null` `forigi(id)`, das den verborgenen Eintrag löscht.

## MPFG-4.1 (T7): Verbindungen in der Sitzung mit Wirkung auf Palette und Vorschau

### MPFG-4.1 im Einzelnen

- [x] Roter Test zuerst: `packages/metiejo/src/grafeo-wirksam-054.test.ts` (8 Tests). Prüfsummen von `vorschau` (hell, dunkel) und `vorschau.css` ohne `kabloj` für zwei über die Startseite angelegte Marken (`leer`, `komuna`, rev 1) aus dem Arbeitsbaum genommen, bevor die Routen angefasst wurden; `git diff aa53d3f4 -- packages/metiejo/src/servilo.ts` zeigte zu dem Zeitpunkt keine Änderung an den Vorschau-Routen (letzter Hunk vor Zeile 1760 am Stand `aa53d3f4`), `html.ts` nur das Opt-in-Feld von `GrafeoScreen`. Erster Lauf: 5 rot aus dem erwarteten Grund (`kabloj` ignoriert: `{}` statt `{akzent: null}`, 200 statt 400/422, Vorschau unverändert), 3 grün (Prüfsummen, „schreibt nichts“, Bühne).
- [x] Server (`servilo.ts`): `kablojParametro` (≈ Z. 452), `KEINE_KABLOJ` (≈ Z. 457); `GET /api/leinwand` (≈ Z. 1630–1687) liest `kabloj` (400 bei fehlerhaftem Wert, nach 400 ohne `marko` und 404), rechnet je Anfrage `wirksamerAgordo` → 422 `{eraroj}`, wenn der wirksame Agordo nicht liest, sonst Bildo mit `kabloj`; der Speicher je rev gilt nur ohne `kabloj`. Vorschau-Routen (≈ Z. 2995–3090): `vorschauKabloj()` je Anfrage, 400/422 vor dem Kopf der Antwort; Schlüssel im `cssSpeicher` `propono` bzw. `` `${propono}|kabloj=${teksto}` `` (ohne `kabloj` der alte Schlüssel); `cssHref` des Dokuments trägt `&kabloj=…`; `buehne-*` ignoriert den Parameter ganz (auch einen fehlerhaften). Kein `setDraft`, kein Kroniko, keine Prüfung.
- [x] Leinwand (`kanvaso.tsx`, `kanto.tsx`, `anschluss.tsx`, `kapo.tsx`): `nodesConnectable`, `edgesReconnectable`, `connectionMode` streng, `isValidConnection` = `validaLigo`, `onConnect`/`onReconnect`/`onReconnectEnd` (Ende im Leeren löst), `deleteKeyCode` Entf/Rücktaste nur für gewählte Kanten (`onBeforeDelete` lässt keinen Knoten zu), „×“ an der gewählten Kante, passende Eingänge leuchten beim Ziehen, die übrigen treten zurück, Hinweis „Verbindungen geändert · gilt nur in dieser Sitzung“ mit „zurücksetzen“. `kunteksto.ts`, `datumoj.ts`, Knotendateien und Datenmodule unverändert.
- [x] Übergabe aus MPFG-3.1: Ein Knoten aus der Sitzung, den der `Bildo` trägt, verlässt die Sitzung (Effekt in `kanvaso.tsx`); „↺“ entfernt Wert und Knoten dauerhaft (im Browser geprüft, auch über ein weiteres Schreiben hinweg).
- [x] Grün: `grafeo-wirksam-054` 8/8; mit `grafeo-gestalten-054 grafeo-kabloj-054 grafeo-einstieg-054 grafeo-route-054 grafeo-route-047 grafeo-literale-054 grafeo-skribo-054 grafeo-paletro-054 grafeo-vorschau-054 studio servilo vorschau` 223/223. Mutation: Bildo mit `kabloj` in den Speicher je rev gelegt → „schreibt nichts“ rot; zurückgesetzt.
- [x] Lint: nodredaktilo grün; metiejo grün bis auf die alte Warnung `komponentoj.ts:42`. Bündel `dist/leinwand.js` 728 704 B roh, 192 065 B gzip (Stufe 6).

### MPFG-4.1: für den PR-Text

- MPFG-4.1: `GET /api/leinwand`, `GET /marko/:name/vorschau` und `GET /marko/:name/vorschau.css` nehmen wahlweise `kabloj=ziel:quelle,…` (`-` = nicht verbunden). Mit ihm rechnen Palette und Vorschau vom wirksamen Agordo dieser einen Antwort; geschrieben wird nichts (Entwurf, `rev`, Kroniko, Studio unverändert, Test). Fehlerhaft → 400 auf allen drei Routen; wirksamer Agordo ungültig → 422. Ohne den Parameter (oder leer) Byte für Byte wie am Stand `aa53d3f4` (festgehaltene Prüfsummen). Die Bühne (`sxtupo=buehne-*`) ignoriert ihn.
- MPFG-4.1: Speicher der Vorschau-Stylesheets: Schlüssel `propono` + `kabloj`; ohne `kabloj` der alte Schlüssel. Der Bildo mit `kabloj` wird nicht gehalten.
- MPFG-4.1: Verbindungen auf der Leinwand: ziehen, umstecken, lösen (ins Leere ziehen, Entf/Rücktaste an der gewählten Kante, „×“), nur gleiche Art und vorwärts, ein Eingang trägt eine Kante; keine Meldung bei einer abgelehnten Verbindung; Knoten lassen sich nicht löschen. Hinweis in der Kopfleiste mit „zurücksetzen“.
- MPFG-4.1: Keine älteren Tests geändert.

### MPFG-4.1: Befunde

- **D-5 (bestätigt):** Die Neutralpalette folgt dem wirksamen Primär: Ihre Buntheit ist `toenung × lead.c × NEUTRAL_SHARE` (`packages/agordilo/src/palettes.ts:159`). „Primär gelöst“ (`kabloj primaer:-`) rechnet mit dem Startwert und ändert damit auch Neutral; eine Funktionsfarbe auf einer anderen Zeile gibt nur ihren Farbton weiter (`palettes.ts:170`).
- **422 von `/api/leinwand` jetzt erreichbar:** über `kabloj`, wenn der Wert einer Quelle im Zielfeld nicht gilt. Beispiel (Test): eine Zweitfarbe `oklch(1.5 0.1 30)` ist als Zweitfarbe gültig (`readAgordo` prüft die Helligkeit nur für `leitfarbe` und `zusatzfarben`, `packages/agordilo/src/agordo.ts` `colourPointers`), auf die Zeile Primär gesteckt (`primaer:akzent`) nicht → 422 `{eraroj:[{path:"agordo.json#/leitfarbe",…}]}`; die Vorschau-Routen antworten dann ebenfalls 422. Der Zweig für einen ungültigen gespeicherten Entwurf (`servilo.ts` ≈ Z. 1654–1665) bleibt wie in MPFG-2.1 ohne Test.
- **Neu (Vorschau beim Schreiben eines abgehängten Knotens):** Der Wert wird gespeichert und Palette und Vorschau-Inhalt bleiben gleich, aber der neue `rev` gibt den Vorschauen eine neue Adresse, sie laden also einmal neu (gleicher Inhalt). Folgt aus `vorschauHref` (rev in der Adresse), kein Fehler.
- **Neu (Palette, nicht geändert):** Die gelöste Akzent-Zeile zeigt „nicht verbunden“ zweimal (an der Beschriftung und an Stelle der Stufen), `nodoj/paletro.tsx`.
- **Neu (React Flow):** Eingänge sind Ziel, kein Start einer Kante (`isConnectableStart` aus); React Flow gibt ihnen dann `pointer-events: none`. Damit man eine Kante an ihrem Eingang greifen kann (Mockup), bekommen belegte Eingänge `pointer-events: all` und reichen den Druck an den Reconnect-Anker der Kante weiter (`anschluss.tsx`). Die Anschlüsse liegen jetzt mit `z-index: 1` über dem Inhalt ihres Knotens (in der Palette deckte die Zeile den Anschluss ab).

## MPFG-5.1 (T8): Integrierte Tests, Bilder, Messung, Bericht-Entwurf

### MPFG-5.1 im Einzelnen

- [x] Neu `packages/metiejo/src/grafeo-studio-054.test.ts` (2 Tests, AK-2): Leinwand schreibt Primär, Akzent, Hinweis, eine helle und eine dunkle Stufe → das Studio (`/studio/:name/farbe`) zeigt denselben rev und jede Palettenstufe mit dem Wert der Leinwand (Wert, dunkler Wert, „gesetzt“), Sweep in ein Array; eine Stufe, die das Studio über sein Formular nimmt (`festlegen`), steht beim nächsten Laden in `/api/leinwand` (rev+1, nur diese Stufe anders).
- [x] Neu `packages/metiejo/src/grafeo-urteil-054.test.ts` (6 Tests, AK-1/3/9/12): ganze Sitzung über HTTP (Anlegen mit `ziel=leinwand`, Seite hell/dunkel, `leinwand.css`, `/api/leinwand`, beide Vorschau-Hrefs und `vorschau.css` nach jedem Schreiben, Primär Gelb, Akzent, Warnung, Tönung, Stufe mit gebrochenem Kontrast, Stufe nur dunkel, drei `kabloj`-Sichten): nur 2xx, `pruefTor` und `checkDraft` 0-mal; 404 für eine fehlende Marke auf Seite (beide Ansichten), Daten, Schreibweg und Vorschauen (13 Pfade); 400 für fehlerhaftes `kabloj` auf allen drei Routen; Schreibweg 200/422/400/404; keine Regel (Name, Id, Aussage, Kialo aus `modeloOf`-Reguloj) und keine Marke des Prüfberichts in irgendeiner Antwort der Datei; Gegenprobe: der Bühnen-Rahmen derselben Marke trägt solche Wörter und fragt die Prüfung.
- [x] Rot gezeigt (je gepflanzt, gelaufen, zurückgesetzt, `cmp` gegen die Sicherung): (1) `/api/leinwand` liefert den Speicher ohne rev-Vergleich → `grafeo-studio-054` Test 2 rot; (2) `gestaltenDe` setzt `gesetzt: false` → beide Studio-Tests rot; (3) Gestalten-HTML trägt „2 Probleme“ und der Schreibweg ruft `pruefungOf` → 3 von 6 `grafeo-urteil-054` rot; (4) `/api/leinwand` prüft `kabloj` vor der Marke und antwortet 422 → 404- und 400-Test rot.
- [x] Neu `packages/nodredaktilo/scripts/bilder-054.ts` (Playwright, gebaute CLI `fm metiejo` auf freiem Port, Arbeitsordner unter `tmpdir`, danach gelöscht; 2100×1250; `--ziel <bilder>`, `--messung <datei>`, Vorgabe `messung.json` neben dem Bilder-Ordner). Bricht mit Exit 1 und „Abgebrochen: <Schritt>: <was>“ ab. Vor jedem Bild ruht der Zeiger auf leerer Bühne und alle endlichen Animationen/Übergänge sind fertig (sonst fing Bild 6 die Eroj mitten im Übergang hell/dunkel und Bild 2/3 das Licht entlang der Kanten).
- [x] Lauf: `pnpm --filter @fundamento/nodredaktilo exec tsx scripts/bilder-054.ts --ziel /Users/thorstenjankowski/n8n-compose/20260918_fundamento-ds/.fundamento/spec054/bilder` → Exit 0, neun Bilder, `messung.json`. Bilder zusätzlich nach `purple/documentation/…/qa-screenshots/` kopiert.
- [x] Messung (allein auf der Maschine, soweit von mir gesteuert): Median 204,8 ms, Max 274,9 ms (274,9 · 204,8 · 265,5 · 191,1 · 163,9). Bündel nachher 728 751 B roh, 192 071 B gzip (`gzip -6 -c`; zlib in Node ergäbe 191 583 B, darum dasselbe Werkzeug wie beim Ausgangsmaß).

### MPFG-5.1: Korrekturen an Dateien früherer Tickets

| Datei:Zeile | was | warum |
|---|---|---|
| `packages/nodredaktilo/src/gestalten/nodoj/paletro.tsx:124–129` (`aldonajxo`) | Eine Zeile ohne Stufen gibt an der Beschriftung `""` zurück; „noch keine Farbe“/„nicht verbunden“ steht nur noch an Stelle der Stufen. | Übergabe aus MPFG-4.1 (doppeltes „nicht verbunden“); Bild 1 zeigte dasselbe für „noch keine Farbe“ beim leeren Akzent. Text an Stelle der Stufen = Produkt-Spec. |
| `paletro.tsx:266` | `vorto === "" ? null : <span>` | leere Beschriftung rendert nichts (sonst stünde ein leeres `span` bzw. das Farbfeld der Basis). |

| `packages/metiejo/src/grafeo-skribo-054.test.ts:36–46` (MPFG-3.1) und ebenso in `grafeo-urteil-054.test.ts` | `vi.mock("./vorschau.js", async (original) => { const echt = await original(); … })` → `(original) => original().then((echt) => ({ … }))` | `packages/modelo/src/ci/test-setup.test.ts:187` („kein `await` in einer Anweisung auf Modulebene“) war rot mit genau diesen zwei Stellen. Zähler geprüft: die Route ruft `checkDraft` → beide Dateien rot (3 Tests), zurückgesetzt. |

`grafeo-paletro-054`, `grafeo-literale-054`, `grafeo-skribo-054` bleiben grün.

### MPFG-5.1: Ergebnisse der Prüfungen

- `FM_AUSGABE=knapp pnpm --filter @fundamento/metiejo test grafeo-studio-054` → 2/2; `grafeo-urteil-054` → 6/6 (mit `grafeo-skribo-054` zusammen 27/27).
- `FM_AUSGABE=knapp pnpm test:betroffen` (6 Pakete, Chromium) → **rot nur in nordstelo**, viermal gelaufen (zwei davon nach Änderungen dieses Tickets): `packages/nordstelo/src/ac8.test.ts:156`, `ablauf/integra.test.ts:131`, `neubewertung-053.test.ts:206` „Hook timed out in 10000ms“ (`connectGvidanto`, In-Memory-MCP). Weil turbo nach dem roten Paket abbricht, derselbe Befehl mit `--continue` (und einmal mit `--force`): metiejo **809/809** grün (alle 047/048- und 054-Tests), ekranoj 301/301, nodredaktilo ohne Tests, modelo 4974/4976 (rot: `ci/turbo-inputs.test.ts` Hook-Zeitlimit = bekannt fremd; im `--force`-Lauf zusätzlich `checks/alirebleco/index.test.ts:51` 30-s-Zeitlimit), cli 119/120 im `--force`-Lauf (`projekcioj.test.ts:86` 10-s-Zeitlimit; ohne `--force` 120/120). Allein: `pnpm --filter @fundamento/nordstelo test` → 379/379, `modelo … turbo-inputs.test.ts` → 8/8, `ci/test-setup.test.ts` → 4/4.
- Gegenprobe am Stand `aa53d3f4` (Wegwerf-Worktree unter `$TMPDIR`, `pnpm install --offline --ignore-scripts`, danach entfernt), derselbe Befehl mit `--force --continue`: nordstelo grün, modelo nur `turbo-inputs` (Zeitlimit) rot. Der Schritt, der in nordstelo ins Limit läuft (`loadServed` von `@fundamento/mcp`), dauert in beiden Bäumen gleich lang (1132 ms hier, 1158 ms am Stand `aa53d3f4`) und nutzt keine Datei dieses Laufs. Urteil: Lastzeit, nicht durch diese Änderung verursacht; lokal nicht beurteilt, kein Limit angehoben. Die CI muss es zeigen.
- `pnpm lint` → grün (22/22; metiejo nur die alte Warnung `src/komponentoj.ts:42`).
- `grep -rn "\.only(\|\.skip(" packages/*/src` → nur das alte `context.skip` in `packages/mcp/src/http.test.ts:97`.

### MPFG-5.1: Diff-Suche (AK-6), Arbeitsbaum gegen `aa53d3f4`

```text
$ git status --short            # 9 geändert (M), Rest neu (??)
 M packages/metiejo/src/grafeo-route-047.test.ts
 M packages/metiejo/src/html.ts
 M packages/metiejo/src/servilo.ts
 M packages/metiejo/src/sxtupoj.ts
 M packages/nodredaktilo/scripts/bilder.ts
 M packages/nodredaktilo/src/fm-elementoj.d.ts
 M packages/nodredaktilo/src/leinwand.tsx
 M packages/nodredaktilo/tsconfig.json
 M packages/nodredaktilo/vite.config.ts
$ git diff aa53d3f4 --stat
 9 files changed, 389 insertions(+), 20 deletions(-)   (servilo.ts +278, fm-elementoj.d.ts +56, sxtupoj.ts 17, leinwand.tsx 14, grafeo-route-047.test.ts 12, html.ts 11, bilder.ts 9, vite.config.ts 9, tsconfig.json 3)
$ git ls-files --others --exclude-standard
 packages/metiejo/src/grafeo-{einstieg,gestalten,kabloj,literale,paletro,route,skribo,studio,urteil,vorschau,wirksam}-054.test.ts
 packages/metiejo/src/grafeo-gestalten-ekrano.ts, grafeo-gestalten-sicht.ts, grafeo-gestalten.ts, grafeo-skribo.ts
 packages/nodredaktilo/belegung/leinwand.agordo.json, scripts/bilder-054.ts, src/gestalten/** (16 Dateien)
 specs/054-markenprozess-frei-gestalten/{spec,plan,tasks,bericht}.md
$ git diff aa53d3f4 --name-only -- packages/modelo packages/agordilo packages/eroj packages/vortaro packages/mcp .github
 (leer; ebenso keine neue Datei dort, keine Root-Datei, kein pnpm-lock.yaml)
$ git diff aa53d3f4 --stat -- '*package.json' pnpm-lock.yaml
 (leer)
$ git diff aa53d3f4 -U0 -- packages | grep '^+' | grep -inE "timeout|retries|threshold|schwelle|toleran|limit|grenze"
 (leer; in neuen Dateien nur `setTimeout as warten` im Bilder-Skript, Takt beim Start wie bilder.ts)
$ grep -rn "\.only(\|\.skip(" packages/*/src
 packages/mcp/src/http.test.ts:97: context.skip(…)   (alt, unverändert)
$ git diff -U0 aa53d3f4 -- packages/metiejo/src/sxtupoj.ts | grep '^@@'
 @@ -332,0 +333,15 @@ function fields(input: ScreenInput): string {
 @@ -337 +352 @@ function fields(input: ScreenInput): string {
 (beide im Fall `start`, Zeilen 323–353; `case "farbe"` beginnt bei 354)
$ grep -rhoE -- "--fm-[a-z0-9-]+" packages/nodredaktilo/src/gestalten | sort -u   # gegen komunaCss(loadBases())
 Kernsatz: 3218 Namen in src/gestalten: 62 nicht im Kernsatz: []
 (leinwand.css: Test in grafeo-route-054, jeder Name in komunaCss)
$ grep -rnEi "#[0-9a-f]{3,8}\b|rgba?\(|hsla?\(|oklch\(|oklab\(" packages/nodredaktilo/src/gestalten   # AK-22
 Treffer: 0
$ pnpm check:privat
 PASS privat: No tracked file names the old names (4507 files scanned, 17 verbatim exceptions). hits=0
```

Wort aus R-12 und Name des privaten Schriften-Repos (beide zur Laufzeit aus `scripts/neutrale-namen/rules.mjs` `oldNames()` zusammengesetzt, nie ausgegeben), gesucht ohne Groß/Klein über alle hinzugefügten Zeilen (`git diff aa53d3f4`) und alle neuen Dateien (11 227 Zeilen, nach dem letzten Eintrag in diesen Dateien erneut gelaufen): **0 / 0**, ebenso der Erweiterungsschlüssel 0. Gegenprobe: das Wort steckt in der Domain von 1 985 der 4 084 Autor-/Committer-Adressen der Historie (D-20). Die im Worktree eingestellte `user.email` ist eine noreply-Adresse des Git-Hosters; dessen Name trifft nur `.<Hoster>/**` in `plan.md:306` (Abgrenzungs-Zeile der technischen Spec) – kein Treffer des Wortes.

### MPFG-5.1: Befunde

- **Neu – Studio ohne Zweitfarben-Palette:** Die Seite Farbe des Studios listet `PALETTES` (`packages/agordilo/src/calibration.ts:22`; `packages/metiejo/src/studio.ts:527`) ohne `sekundo`; die Akzent-Zeile der Leinwand (12 Stufen) hat im Studio kein Gegenstück, eine dort von Hand gesetzte Akzent-Stufe sieht das Studio nicht. `grafeo-studio-054` hält das fest; Studio unverändert (E-6).
- **Neu – nordstelo unter Last:** In `turbo run test` mit allen betroffenen Paketen liefen dreimal 2–3 Hooks in `packages/nordstelo/src/ac8.test.ts:156`, `ablauf/integra.test.ts:131`, `neubewertung-053.test.ts:206` in das 10-s-Hook-Limit (`connectGvidanto`, In-Memory-MCP aus `@fundamento/mcp`, das keine Datei dieses Laufs nutzt). Allein: `pnpm --filter @fundamento/nordstelo test` → 379/379 grün. Nichts angehoben.
- **Bild-Hinweis:** Die Vorschau zeigt die echte Vorschau in Knotenbreite (Rahmen 384 px, scrollt); in Bild 4 ist sie unten abgeschnitten, wie im Knoten.

## PR-Text (Entwurf, MPFG-5.1)

> Titel: **Spec 054 MP-1: Frei gestalten auf der Leinwand**

**Was:** `/marko/:name/grafeo` öffnet die neue Ansicht **Gestalten** (React-Flow-Leinwand in einer neutralen Belegung, dunkel als Vorgabe, hell per Schalter): sechs Phasen als Gruppen-Knoten, Knoten Marke, Farbe (Primär, Akzent, Neutral, Funktionsfarben), Palette (Basis, Stufe von Hand getrennt für hell/dunkel, „↺“), zwei Vorschauen (hell, dunkel, + weitere), Verbindungen in der Sitzung mit Wirkung auf Palette und Vorschau, Liste „+ Knoten“ mit dem ganzen Katalog. Speichern über einen eigenen Schreibweg ohne Urteil. Die 047/048-Ansicht bleibt als **Verstehen** (`?ansicht=verstehen`). Startseite: Block „Neue Marke auf der Leinwand“.

**Neue Wege:** `POST /api/marko/:name/leinwand` (`{farbe}` | `{toenung}` | `{stufe}`; 200 `{rev, gespeichert}`, 422 `{feld, satz}`, 400/404 wie `/api/marko/*`; keine Prüfung, kein 409); `GET /api/leinwand?marko=[&kabloj=]`; `GET /nodredaktilo/leinwand.css`; `POST /marko` mit `ziel=leinwand`; `kabloj` optional auf `/marko/:name/vorschau[.css]` (ohne den Parameter Byte für Byte wie vorher, Prüfsummen).

**Geänderte Zeilen in `sxtupoj.ts`** (nur Fall `start`, AK-16): `git diff -U0 aa53d3f4 -- packages/metiejo/src/sxtupoj.ts` → `@@ -332,0 +333,15 @@` (Block, Aktion `fm-butono type="submit" emphasis="medium" data-mt-ziel="leinwand"`, klassisches Inline-Skript, D-1) und `@@ -337 +352 @@` (`${open}` → `${open}${leinwand}`). Wortlaut im Abschnitt MPFG-2.1 oben.

**Berührte 047/048-Dateien (AK-5), Datei:Zeile vorher → nachher:**

| Datei:Zeile (nachher) | vorher | nachher |
|---|---|---|
| `packages/metiejo/src/html.ts:942–946` | – | Opt-in-Feld `gestaltenHref?: string` an `GrafeoScreen` |
| `html.ts:973–976` | – | Umschalter `<span id="nr-ansicht"><fm-ligilo …>Gestalten</fm-ligilo> \| Verstehen</span>`, nur mit dem Feld |
| `html.ts:989` | Kopf ohne Umschalter | Umschalter im Kopf eingesetzt (ohne Feld Byte für Byte gleich, Prüfsumme) |
| `packages/metiejo/src/grafeo-route-047.test.ts:27–31` | `pfad: "/marko/provo/grafeo"` | `pfad: "/marko/provo/grafeo?ansicht=verstehen"` |
| `grafeo-route-047.test.ts:137` | `"/marko/zyklo/grafeo"` | `"/marko/zyklo/grafeo?ansicht=verstehen"` |
| `grafeo-route-047.test.ts:154` | ``${ekrano.pfad}${query}`` | `?` → `&`, wenn der Pfad schon eine Abfrage trägt |
| `grafeo-route-047.test.ts:191` | `"/marko/provo/grafeo"` | `"/marko/provo/grafeo?ansicht=verstehen"` |
| `packages/nodredaktilo/scripts/bilder.ts:67–72` | `seite: "/marko/provo/grafeo"` | `seite: "/marko/provo/grafeo?ansicht=verstehen"` |
| `packages/nodredaktilo/scripts/bilder.ts:473` | ``${marke.seite}?scheme=light`` | `?`/`&` je nach Pfad |
| `packages/nodredaktilo/src/leinwand.tsx` | mountet `<Kanvaso>` | Weiche auf `data-nr-ansicht="gestalten"`; ohne das Attribut `<Kanvaso>` wie bisher |
| `packages/nodredaktilo/vite.config.ts`, `tsconfig.json` | Alias `…/grafeo` | zusätzlich Alias `@fundamento/metiejo/gestalten` |

`sxtupoj.test.ts`, alle 048-Tests, `studio.ts`, `metiejo.js`, Eroj unverändert.

**Neue Dateien:** `packages/metiejo/src/grafeo-gestalten-sicht.ts`, `grafeo-gestalten.ts`, `grafeo-gestalten-ekrano.ts`, `grafeo-skribo.ts`; `packages/nodredaktilo/belegung/leinwand.agordo.json`, `src/gestalten/**`, `scripts/bilder-054.ts`; Tests `packages/metiejo/src/grafeo-{gestalten,kabloj,einstieg,route,literale,skribo,paletro,vorschau,wirksam,studio,urteil}-054.test.ts`; `specs/054-markenprozess-frei-gestalten/`.

**Befunde:** B-1 (Neutral nur Tönung), B-2 (`festlegen` 409: `servilo.ts:1253`, `:1313` am Stand aa53d3f4), B-3 (Zweitfarben-Stufen 25/850/975 nicht setzbar, Akzent-Stufen bleiben nach dem Entfernen), B-4 (Basis ≠ Farbe des Knotens), B-5 (dunkel = hell außer bei Werten von Hand und `neutral.950`), D-1 (Formular sendet den Absende-Knopf nicht; Inline-Skript), D-2 (`html.ts`), D-5 (Funktionsfarbe nur Farbton; Neutral folgt Primär), D-8/R-12 (Art-Rollen in hell knapp), Studio ohne `sekundo`-Palette, nordstelo-Hooks unter Last. Einzelheiten: `specs/054-markenprozess-frei-gestalten/bericht.md`.

**Zu bestätigen:** Bericht Abschnitt 7 (a)–(g).

**Bilder, Messung:** außerhalb des Repos, `/Users/thorstenjankowski/n8n-compose/20260918_fundamento-ds/.fundamento/spec054/` (9 Bilder, `messung.json`: Median 204,8 ms / Max 274,9 ms; Bündel 635 947 → 728 751 B roh, 170 082 → 192 071 B gzip).

**CI (genau ein `workflow_dispatch`):** ⟨PLATZHALTER: Lauf-Link⟩

| Job | Ergebnis | Notiz |
|---|---|---|
| ⟨PLATZHALTER: Tabelle je Job nach dem Dispatch⟩ | | |
