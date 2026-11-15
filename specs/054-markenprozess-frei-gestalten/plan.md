# Spec 054 – Technische Spec: Frei gestalten auf der Leinwand (MP-1)

**Basis:** `main` `aa53d3f4` · **Gehört zu:** `product-spec.md` im selben Ordner
Die Fundstellen unten sind am Stand `aa53d3f4` gelesen. Zeilennummern sind Orientierung, nicht Vertrag.

## Architektur im Überblick

```
Startseite (/)                         ── POST /marko (ziel=leinwand) ──▶  /marko/:name/grafeo
                                                                              │
             ┌────────────────────────────── ansicht? ────────────────────────┤
             ▼ (Vorgabe: gestalten)                                           ▼ ansicht=verstehen
  grafeo-gestalten-ekrano.ts (HTML)                                 grafeoScreen (047/048, unverändert)
  css = neutrale Belegung (nicht die Marke), hell und dunkel
  #nr-leinwand data-nr-ansicht="gestalten"
  data-nr-fonto="/api/leinwand?marko=:name"
             │
             ▼ dist/leinwand.js (nodredaktilo)
  Gestalten (React Flow)  ── GET /api/leinwand?marko=[&kabloj=] ─▶ grafeo-gestalten.ts: wirksamerAgordo → gestaltenDe → Bildo
                          ── POST /api/marko/:name/leinwand ─▶ grafeo-skribo.ts: Schema + Farbe lesen → setDraft
                          ── 2+ × <iframe src="/marko/:name/vorschau?sxtupo=vorschau&scheme=…&rev=…[&kabloj=…]">
  Sitzung (nur React-Zustand): Plätze, Verbindungen, weitere Vorschauen, leere Farbknoten, Schema der Leinwand
```

- **Eine Wahrheit:** der Entwurf in `drafts` (`servilo.ts`, `draftOf`/`setDraft`). Leinwand, Studio und Schnellstart lesen und schreiben ihn.
- **Wirksame Sicht (E-11):** Geänderte Verbindungen ändern den Entwurf nie. Der Client schickt sie als Parameter `kabloj` mit; der Server rechnet daraus für diese eine Antwort einen wirksamen Agordo (`wirksamerAgordo`, rein) und leitet Palette und Vorschau davon ab. `setDraft` wird dafür nicht gerufen.
- **Keine Prüfung in Gestalten:** Weder die Seite noch `/api/leinwand` noch der Schreibweg rufen `pruefungOf`, `pruefungJetzt`, `checkDraft` oder `pruefRechnung` auf.

## Fundstellen (heute)

| Was | Wo |
|---|---|
| Anlegen einer Marke | `servilo.ts` ≈ 1717, `POST /marko`: `createMarko` + `startAgordo`, danach `redirect(…/farbe)` |
| Startseite | `servilo.ts` 1519 → `screen(inputOf("start"))` aus `sxtupoj.ts` 510 (Fall `"start"` ≈ 323) |
| Leinwand einer Marke | `servilo.ts` ≈ 1626, `GET /marko/:name/grafeo` → `grafeoScreen` (`grafeo-sicht.ts`); ruft `pruefungOf` für `neEksportebla` |
| Graph-JSON | `servilo.ts` ≈ 1553, `GET /api/grafeo?marko=|aspekto=` |
| Entwurf ändern ohne Regel | `servilo.ts` ≈ 2518, `POST /api/marko/:name/entwurf`: `patched` → `readAgordo` → `setDraft` |
| Stufe festlegen mit Regel | `servilo.ts` 1145, `festlegen`: 409 bei neuer fester Regel (`fresh`) und bei `sekundo-not-action` (Befund B-2) |
| Felder, die `patched` ändert | `servilo.ts` 304 `PATCHABLE` (u. a. `leitfarbe`, `zusatzfarben`, `neutral`, `zweitfarbe`); `null` entfernt |
| Farbwert lesen | `@fundamento/agordilo` `parseAgordoColor` (Hex 3/6, `oklch(L C H)`); `colourWert` in `servilo.ts` 416 macht aus Hex einen DTCG-Wert |
| Paletten | `@fundamento/agordilo` `derivePalettes` + `withFestgelegtSteps` (Stufen mit `gesetzt: true`); `PALETTES`, `ZWEITFARBE_STEPS` |
| Vorschau | `servilo.ts` ≈ 2786, `GET /marko/:name/vorschau?sxtupo=…&scheme=…`; **`buehne-*` hängt `pruefungHtml` an**, `vorschau` nicht |
| Rollen der Leinwand | `nodredaktilo/src/roloj.ts` `XY_ROLOJ` (`--xy-*` → `--fm-*`) |
| Typen ins Bündel | Alias `@fundamento/metiejo/grafeo` → `metiejo/src/grafeo-sicht.ts` (`nodredaktilo/vite.config.ts`, `tsconfig.json`) |

## Neue und geänderte Dateien

### `packages/metiejo/src/`
| Datei | Neu/geändert | Inhalt |
|---|---|---|
| `grafeo-gestalten.ts` | neu | reine Funktionen `gestaltenDe(agordo, eingaben) → Bildo` und `wirksamerAgordo(agordo, start, kabloj) → Agordo` (T1); Typen browser-sicher in `grafeo-gestalten-sicht.ts` |
| `grafeo-gestalten-sicht.ts` | neu | Typen `Bildo`, `BildoNodo`, `BildoLigo`, `Anschlussart`, `Kabloj`; feste Anordnung `ARANGXO_054`; Platz-Regel `poziciojKun`; Verbindungs-Regeln `validaLigo`, `ligojKun`, `kablojDe`; Katalog `KATALOGO_054` mit `aldonebloj` (browser-sicher, ohne Node-Importe) |
| `grafeo-gestalten-ekrano.ts` | neu | HTML der Ansicht Gestalten (`gestaltenScreen`) |
| `grafeo-skribo.ts` | neu | Schreibweg der Leinwand (`leinwandSchreiben`) |
| `servilo.ts` | geändert | Routen: `ansicht`-Umschaltung, `/api/leinwand` (mit `kabloj`), `POST /api/marko/:name/leinwand`, `ziel=leinwand` in `POST /marko`, Stylesheet der neutralen Belegung; die Vorschau-Routen nehmen wahlweise `kabloj` (ohne den Parameter Byte für Byte wie heute) |
| `sxtupoj.ts` | geändert, **nur Fall `start`** | Block „Neue Marke auf der Leinwand“ (E-10). Jeder andere Fall bleibt Byte für Byte gleich; die geänderten Zeilen stehen im PR-Text |
| `*-054.test.ts` | neu | Tests (siehe unten) |
| `grafeo-sicht.ts` | nur wenn zwingend | Umschalter in `grafeoScreen` für Marken (nicht für Pakete); Liste im PR |

### `packages/nodredaktilo/`
| Datei | Neu/geändert | Inhalt |
|---|---|---|
| `src/leinwand.tsx` | geändert | liest `data-nr-ansicht`; `gestalten` mountet `<Gestalten>`, sonst `<Kanvaso>` wie bisher |
| `src/gestalten/kanvaso.tsx` | neu | React-Flow-Fläche der Ansicht Gestalten: Startpositionen aus `ARANGXO_054`; Knoten und Phasen in der Sitzung verschiebbar; Verbindungen in der Sitzung änderbar; hält den Zustand der Sitzung |
| `src/gestalten/nodoj/*.tsx` | neu | `MarkoNodo`, `FarboNodo`, `PaletroNodo`, `VorschauNodo`, `FazoNodo` (Phase als Gruppen-Knoten) |
| `src/gestalten/anschluss.tsx` | neu | eigener `Handle` als Quadrat nach Art (Marke, Farbe, Maß), Farb-Anschluss in der Farbe selbst, gefüllt wenn verbunden |
| `src/gestalten/kanto.tsx` | neu | eigene Kante: rechtwinklig (`getSmoothStepPath`, `borderRadius: 0`), Farbe der Quelle, kräftiger unter dem Zeiger, „×“ in der Mitte wenn gewählt, gestrichelt von leeren oder abgehängten Knoten, Licht-Animation (CSS, `prefers-reduced-motion` aus) |
| `src/gestalten/menuo.tsx` | neu | Liste „+ Knoten“ aus `KATALOGO_054` |
| `src/gestalten/kapo.tsx` | neu | Kopfleiste: „+ Knoten“, Umschalter der Ansicht, Hinweis zu Verbindungen, „gespeichert“, Schalter Leinwand hell/dunkel |
| `src/gestalten/datumoj.ts` | neu | `sxargi` für `/api/leinwand`, `skribi` für den Schreibweg |
| `src/gestalten/roloj.ts` | neu | Rollen der Gestalten-Fläche (nur `var(--fm-*)` der neutralen Belegung und `--xy-*`) |
| `belegung/leinwand.agordo.json` | neu | neutrale Belegung (siehe unten) |
| `vite.config.ts`, `tsconfig.json` | geändert | Alias `@fundamento/metiejo/gestalten` → `../metiejo/src/grafeo-gestalten-sicht.ts` |
| `scripts/bilder-054.ts` | neu | Bilder und Messung (Playwright, vorhanden als devDependency) |

## Neutrale Belegung (T3)

- `packages/nodredaktilo/belegung/leinwand.agordo.json` ist ein gewöhnlicher Agordo: unbunte Leitfarbe, `neutral.toenung: 0`, `regler.saettigung` am unteren Rand der vorhandenen Grenzen. Er kommt ohne neue Felder und ohne neue Tokens aus.
- `servilo.ts` liefert `GET /nodredaktilo/leinwand.css`: das CSS dieses Agordo, abgeleitet wie `vorschau.css` (dieselbe Ableitung, derselbe `CSS_CELO`), einmal je Prozess im Speicher (wie `paketoStiloj`). Das Ergebnis enthält nur vorhandene `--fm-*`-Tokens.
- Die Seite Gestalten lädt **nur** dieses Stylesheet, nicht `vorschau.css` der Marke (AK-14).
- **Hell und dunkel (E-8):** Das Stylesheet trägt beide Schemata der Belegung, wie jedes abgeleitete Fundamento-CSS. Die Seite setzt `data-fm-color-scheme` auf der Wurzel: `dark` als Vorgabe, `light` bei `?scheme=light`. Der Schalter in der Kopfleiste setzt das Attribut im Browser um und schreibt `scheme` mit `history.replaceState` in die Adresse; die Seite lädt nicht neu, der Zustand der Sitzung bleibt. `prefers-color-scheme` wird nicht gelesen.
- **Variablenbasiert:** Jede Farbe, Linie, Rundung und jeder Schatten der Ansicht Gestalten ist ein `var(--fm-*)` der Belegung (oder ein `--xy-*`, das auf eines zeigt). In `src/gestalten/**` steht kein Farbliteral. Weil die Rollen in beiden Schemata dieselben sind, braucht kein Baustein eine Abfrage des Schemas.
- Eroj im Knoten (`fm-butono`, `fm-kampo`, Regler) erscheinen deshalb in der neutralen Belegung und folgen dem Schalter.
- Die Farben der Marke kommen als Werte aus `Bildo` (Hex) und werden inline gesetzt: Farbfelder, Stufen, Farb-Anschlüsse, Kanten. Das sind Inhalte, keine Rollen. Sie sind die einzigen Farbwerte, die nicht aus einem Token kommen.
- Die Art-Farben der Anschlüsse (Marke, Maß, später Text und Schrift) sind ebenfalls Rollen der Belegung. Der Plan nennt, welche vorhandenen Tokens sie tragen; reicht der Vorrat nicht für unterscheidbare Arten, ist das ein Befund und kein neuer Token.
- Ableitung schlägt für die Belegung fehl → 500 beim Start der Tests (rot), nicht still.

> Falls die neutrale Belegung über den Server nicht sauber geht (zum Beispiel weil die Route vor `/nodredaktilo/*` für das Bündel liegen muss), ist die Reihenfolge der Routen anzupassen. Ein neuer Token und ein CSS-Literal sind keine Ausweichwege.

## Datenmodell der Ansicht Gestalten (T1)

`gestaltenDe(agordo: Agordo, e: { start: Agordo; kabloj: Kabloj; palettes: DerivedPalettes | undefined }): Bildo` ist rein: keine Ein-/Ausgabe, keine Zeit, keine Prüfung. `agordo` ist der gespeicherte Entwurf; `palettes` ist die Ableitung des **wirksamen** Agordo (`derivePalettes` + `withFestgelegtSteps`), die der Aufrufer in `servilo.ts` rechnet. Schlägt sie fehl, gibt er `palettes: undefined` und `Bildo.ableitung = "fehlt"`.

```ts
type Anschlussart = "teksto" | "farbo" | "tiparo" | "mezuro" | "marko";

interface Bildo {
  marko: { name: string; etikedo: string; stato: "entwurf-ungepruft" };
  rev: number;
  ableitung: "ok" | "fehlt";
  kabloj: Kabloj;               // die wirksame Sicht dieser Antwort; {} = wie im Agordo
  nodoj: BildoNodo[];           // Phasen zuerst, dann ihre Knoten
  ligoj: BildoLigo[];           // die Verbindungen, die aus dem Agordo folgen (Anfang und „zurücksetzen“)
}

type FazoId = "fazo-1" | "fazo-2" | "fazo-3" | "fazo-4" | "fazo-5" | "fazo-6";

type BildoNodo =
  | { id: FazoId; speco: "fazo"; nr: 1|2|3|4|5|6; titolo: string; malplena: boolean }   // 1,2,3,6 malplena
  | { id: "marko"; speco: "marko"; fazo: "fazo-4" }
  | { id: `farbo-${FarboRolo}`; speco: "farbo"; fazo: "fazo-4"; rolo: FarboRolo;
      wert?: string;            // wie im Agordo (Hex oder oklch-Text); fehlt = leer
      hex: string;              // zum Zeichnen (eigener Wert oder abgeleitet)
      stato: "leer" | "startwert" | "von-hand" | "aus-material";
      elir: "farbo" | "mezuro"; // Art des Ausgangs: neutral gibt die Tönung (Maß)
      toenung?: number }        // nur rolo "neutral"
  | { id: "paletro"; speco: "paletro"; fazo: "fazo-4"; vicoj: Vico[] }
  | { id: "vorschau-hell" | "vorschau-dunkel"; speco: "vorschau"; fazo: "fazo-5";
      schema: "hell" | "dunkel"; href: string };   // ?sxtupo=vorschau&scheme=…&rev=…[&kabloj=…]

interface Vico {                // eine Zeile der Palette; jede hat einen Eingang
  rolo: FarboRolo;              // immer alle sieben, in fester Reihenfolge
  paletro: DerivedPaletteName;
  etikedo: string;
  enir: "farbo" | "mezuro";
  fonto: FarboRolo | null;      // welcher Farbknoten diese Zeile in der wirksamen Sicht speist
  fontoHex?: string;            // dessen Farbe, für das kleine Feld an der Zeile
  basis?: string;               // Stufe, die die Farbe trägt; fehlt bei neutral und ohne fonto
  stufoj: Stufo[];              // leer, wenn die Zeile keine Farbe hat (Akzent)
}
interface Stufo {
  stufo: string; tokeno: string;
  hex: string; gesetzt: boolean;                 // heller Wert (Hauptsatz)
  hexDunkel?: string; gesetztDunkel: boolean;    // nur wenn der dunkle Wert vom hellen abweicht
}

type FarboRolo = "primaer" | "akzent" | "neutral" | "success" | "warning" | "danger" | "info";

interface BildoLigo { id: string; de: string; al: string; art: Anschlussart; hex?: string }
// Anschlüsse: "marko.el", "farbo-<rolo>.en", "farbo-<rolo>.el", "paletro.en.<rolo>", "paletro.el", "vorschau-<id>.en"

/** Je Palettenzeile der Farbknoten, der sie speist, oder null. Nur Abweichungen vom Agordo. */
type Kabloj = Partial<Record<FarboRolo, FarboRolo | null>>;
```

Regeln:
- **Farbknoten:** `primaer` ← `leitfarbe`; `akzent` ← `zweitfarbe.farbe` (`aus-material`, wenn `herkunft` gesetzt); `neutral` ← `neutral.toenung`, `hex` = Stufe 100 der abgeleiteten Neutralpalette (hell, wie im Zielbild); Funktionsfarben nur, wenn in `zusatzfarben`. `startwert`, wenn `leitfarbe === start.leitfarbe` (`start` = `startAgordo(name, "leer")`).
- **Palette:** immer sieben Zeilen in der Reihenfolge Neutral, Primär (`accent`), Akzent (`sekundo`), Erfolg, Warnung, Fehler, Hinweis. Ohne `zweitfarbe` in der wirksamen Sicht hat die Akzent-Zeile keine Stufen. `tokeno = color.palette.<paletro>.<stufo>`.
  - **Hell:** `hex` und `gesetzt` aus `DerivedPalettes.steps` (`DerivedStep.gesetzt`).
  - **Dunkel:** `hexDunkel` und `gesetztDunkel` aus `DerivedPalettes.overrides` mit `mode: "dark"` (eigens gesetzte Stufen der Struktur, etwa `neutral.950`, und von Hand gesetzte dunkle Werte). Gibt es keinen Eintrag oder ist er gleich dem hellen, fehlt `hexDunkel`.
  - **Basis (E-14):** `basis` ist die Stufe aus `REFERENCE_STEPS` der Ableitung (`accent` 700, Funktionsfarben 600). Für `sekundo` nennt der Plan die Stufe mit Fundstelle in `palettes.ts`; die Zeile nimmt die Ziele der Akzent-Leiter. Neutral hat keine Basis. Ohne `fonto` fehlt `basis`.
- **Kanten aus dem Agordo (`ligoj`):** `marko.el → farbo-*.en` (art `marko`); `farbo-<rolo>.el → paletro.en.<rolo>` (art `farbo`, `hex` der Farbe; für neutral art `mezuro`); `paletro.el → vorschau-*.en` (art `marko`). Sie sind der Anfang jeder Sitzung und das Ziel von „zurücksetzen“.
- **Phasen:** Die sechs Phasen sind Knoten (`speco: "fazo"`). Jeder andere Knoten nennt seine Phase in `fazo`.
- **Startpositionen:** `ARANGXO_054` in `grafeo-gestalten-sicht.ts` legt Platz und Größe der Phasen fest und die Startplätze der Knoten **relativ zu ihrer Phase**: feste Plätze für Marke, Primär, Akzent, Neutral, Palette und die zwei Vorschauen; die vorhandenen Funktionsfarben belegen der Reihe nach (Erfolg, Warnung, Fehler, Hinweis) die Plätze unter Neutral; weitere Vorschauen stehen leicht versetzt über den festen. Die Plätze werden nicht aus dem Graphen berechnet (kein dagre) und nicht gespeichert.
- **Platz-Regel (E-9):** `poziciojKun(verschoben: ReadonlyMap<string, Pozicio>, nodoj: readonly { id: string; fazo?: FazoId }[]): Map<string, Pozicio>` ist rein. Ein Knoten oder eine Phase, deren `id` in `verschoben` steht, behält diesen Platz; alles andere bekommt den Startplatz aus `ARANGXO_054` für die aktuellen Knoten. Einträge für Knoten, die es nicht mehr gibt, fallen weg. Weil Plätze relativ zur Phase sind, wandern Knoten mit ihrer Phase. `verschoben` lebt nur im React-Zustand der Seite.

### Verbindungen der Sitzung (E-11)
Alle drei Funktionen stehen in `grafeo-gestalten-sicht.ts`, sind rein und laufen im Browser und im Test.

- **`validaLigo(ligoj, de, al): boolean`** – gilt, wenn `de` ein Ausgang und `al` ein Eingang ist, beide dieselbe `Anschlussart` haben und die Kante keinen Kreis schließt. Heute heißt das: `paletro.el` nie auf `farbo-*.en`.
- **`ligojKun(sitzung, bildo): BildoLigo[]`** – die Kanten der Sitzung nach einem neuen `Bildo`. Die Sitzung merkt sich, welche Kanten aus dem Agordo sie gelöst und welche sie gezogen hat; beides wird auf `bildo.ligoj` angewandt. Ein Eingang trägt höchstens eine Kante (die gezogene gewinnt). Kanten an Knoten, die es nicht mehr gibt, fallen weg.
- **`kablojDe(ligoj, nodoj): Kabloj`** – je Palettenzeile der speisende Farbknoten: die Quelle an `paletro.en.<rolo>`, sofern dieser Farbknoten an `marko.el` hängt und nicht leer ist; sonst `null`. Zurück kommen nur die Zeilen, die vom Agordo abweichen. `{}` heißt: nichts geändert.

Was nicht in `Kabloj` steht, bleibt im Browser: Eine Vorschau ohne Eingang zeigt ihren Leerzustand und lädt nichts; ein abgehängter Farbknoten ist nur gedämpft.

### Wirksamer Agordo
`wirksamerAgordo(agordo: Agordo, start: Agordo, kabloj: Kabloj): Agordo` ist rein und schreibt nie. Je Eintrag `ziel → quelle`:

| Ziel | `quelle` ist ein Farbknoten mit Wert | `quelle` ist `null` |
|---|---|---|
| `primaer` | `leitfarbe` = Wert der Quelle | `leitfarbe` = `start.leitfarbe` |
| `akzent` | `zweitfarbe` = `{ farbe: Wert }` (ohne `herkunft`) | `zweitfarbe` fällt weg |
| `success`, `warning`, `danger`, `info` | `zusatzfarben[ziel]` = Wert | Feld fällt weg |
| `neutral` | nur `neutral` selbst ist erlaubt (Art Maß): unverändert | `neutral.toenung` fällt weg |

Der Wert einer Quelle ist ihr Feld im **gespeicherten** Agordo (`leitfarbe`, `zweitfarbe.farbe`, `zusatzfarben[…]`). `festgelegt` und alle anderen Felder bleiben, wie sie sind. Ergibt das keinen gültigen Agordo, antwortet die Route mit 422 wie bei einem ungültigen Entwurf. Die Farbknoten im `Bildo` kommen immer aus dem gespeicherten Agordo, nur `paletro` und die Vorschauen aus dem wirksamen.

### Katalog „+ Knoten“ (E-13)
`KATALOGO_054` ist eine feste Liste in `grafeo-gestalten-sicht.ts`: je Eintrag Gruppe (Eingabe, Vorschlag, Probe, Gestalt, Vorschau, Ausgabe, Ordnung), Name, `Anschlussart` für das Zeichen und der Lauf, mit dem der Knoten kommt (`MP-1` bis `MP-5`), nach dem Katalog im Konzept, Abschnitt 9.3. `aldonebloj(katalogo, nodoj): Ero[]` ist rein und gibt je Eintrag einen von fünf Zuständen: `anlegen` (Funktionsfarbe, die nicht auf der Leinwand liegt), `setzen` (Akzent, solange leer), `weitere` (Vorschau · Komponenten), `da` (liegt auf der Leinwand und kommt nur einmal vor), `spaeter` (Lauf nach MP-1).
- **Kein Feld aus der Prüfung:** `Bildo` enthält keine Regel, keinen Bericht und keine Problemzahl. Ein Test sucht im serialisierten `Bildo` nach Regelnamen aus `modeloOf().reguloj` (AK-9).

## API-Verträge

### `GET /marko/:name/grafeo[?ansicht=gestalten|verstehen][&scheme=…]`
- Ohne `ansicht` oder mit `gestalten` → `gestaltenScreen`: HTML mit `#nr-leinwand[data-nr-ansicht="gestalten"][data-nr-fonto="/api/leinwand?marko=:name"][data-nr-marko=":name"]`, Stylesheet `/nodredaktilo/leinwand.css`, `data-fm-color-scheme="dark"` (Vorgabe) oder `"light"` bei `scheme=light`. **Kein** `pruefungOf`.
- `verstehen` → wie heute `grafeoScreen` (mit `pruefungOf` für `neEksportebla`, unverändert) plus Umschalter zurück.
- 404, wenn die Marke fehlt; 503 `LEINWAND_NICHT_GEBAUT` ohne Bündel (wie heute).
- `/aspekto/:label/grafeo` unverändert, ohne Umschalter.

### `GET /api/leinwand?marko=:name[&kabloj=…]`
- 200 `application/json`: `Bildo` (kanonisch serialisiert). Ohne `kabloj` im Speicher je `rev` (wie `markoGrafeoj`); mit `kabloj` wird je Anfrage gerechnet und nichts gehalten.
- `kabloj` ist die wirksame Sicht als Text: `ziel:quelle` mit Komma getrennt, `-` für „nicht verbunden“, zum Beispiel `kabloj=akzent:-,warning:primaer`. Ziel und Quelle sind Werte von `FarboRolo`. Unbekannte Namen, doppelte Ziele, eine Farbe auf `neutral` oder `neutral` auf einer Farbzeile → 400.
- 404 ohne Marke. 422 nur, wenn der Entwurf oder der wirksame Agordo kein gültiger Agordo ist (`{ eraroj }` wie `/api/grafeo`).
- Die Route schreibt nie: kein `setDraft`, kein Eintrag im Kroniko, `rev` bleibt.

### Vorschau mit wirksamer Sicht: `GET /marko/:name/vorschau[.css]?…&kabloj=…`
- Die vorhandenen Routen der Vorschau (Seite und Stylesheet, `servilo.ts` ≈ 2776 und ≈ 2786) nehmen wahlweise denselben Parameter `kabloj`. Mit ihm leiten sie vom wirksamen Agordo ab statt vom Entwurf, so wie sie es heute mit `propono` für einen offenen Vorschlag tun.
- Im Speicher der Stylesheets (`cssSpeicher.css(name, rev, schluessel, agordo, …)`) geht `kabloj` in den Schlüssel ein, neben `propono`.
- **Ohne `kabloj` antworten beide Routen Byte für Byte wie vor dem Lauf** (Test). `buehne-*` nimmt den Parameter nicht.
- Fehlerhafte `kabloj` → 400.

### `POST /api/marko/:name/leinwand` (Schreibweg der Leinwand, T4/T5)
Body (JSON), genau eine Änderung:

```jsonc
{ "farbe": { "rolle": "primaer|akzent|success|warning|danger|info", "wert": "#f5c400" | "oklch(…)" | null } }
{ "toenung": 0.35 }
{ "stufe": { "token": "color.palette.accent.500", "wert": "#d7263d" | "oklch(…)" | null, "schema": "hell" | "dunkel" } }   // schema fehlt = hell
```

Ablauf (`grafeo-skribo.ts`):
1. Marke laden (`draftOf`); 404 wie `/api/marko/*`.
2. Body lesen; kein JSON oder kein Objekt → 400 `json-invalid` (wie heute).
3. Farbwert (nicht `null`) mit `parseAgordoColor` lesen. Unlesbar → **422** `{ feld, satz }`. `feld` ist `"farbe.primaer"`, `"toenung"` oder `"stufe.color.palette.accent.500"`, `satz` ist „Diesen Farbwert kann Fundamento nicht lesen. Schreibe ihn als #RRGGBB oder oklch(L C H).“ Der Entwurf bleibt unverändert.
4. Änderung abbilden:
   - `primaer` → `patched(a, { leitfarbe })`
   - `akzent` → `patched(a, { zweitfarbe: wert === null ? null : { farbe: wert } })`
   - Funktionsfarbe → `patched(a, { zusatzfarben: { [rolle]: wert } })`; `null` entfernt
   - `toenung` → Zahl in den vorhandenen Grenzen von `neutral.toenung` (aus dem Schema, nicht neu festgelegt), sonst 422; `patched(a, { neutral: { toenung } })`
   - `stufe` → `token` muss `color.palette.<DERIVED_PALETTES>.<stufe>` sein.
     - `schema: "hell"` (Vorgabe): `wert` → `festgelegt[token] = { …rest, wert: colourWert(wert) }`, `modoj` bleibt; `null` → `wert` und `alias` des Eintrags entfernen, `modoj` und `schreibweise` bleiben; ist der Eintrag danach leer, fällt er weg (wie `festlegen` mit `zurueck`).
     - `schema: "dunkel"`: `wert` → `festgelegt[token].modoj["color-scheme=dark"] = { wert: colourWert(wert) }`; `null` → diesen Eintrag in `modoj` entfernen (wie `festlegen` mit `zurueck` und `modus`); leere `modoj` und leere Einträge fallen weg.
     - Ein anderes `schema` → 422.
   - Der Schreibweg kennt `kabloj` nicht: Geschrieben wird immer in den gespeicherten Agordo, nie die wirksame Sicht.
5. `readAgordo(next)`; ungültig → 422 `{ feld, satz }` (Satz aus dem ersten Issue, auf Deutsch).
6. `setDraft(name, draft, agordo, "regilo")` → Entwurf auf Platte, `rev++`, Kroniko wie Schnellstart.
7. 200 `{ rev, gespeichert: "<ISO-Zeit>" }`. **Keine** Prüfung, **kein** `probleme`, **kein** `betroffen`.

`entwurf`, `festlegen`, Studio und Schnellstart bleiben Byte für Byte gleich.

### `POST /marko` mit `ziel=leinwand`
- Gleiches Verhalten wie heute (Name → Kennung, `basis` erzwungen `leer`, `createMarko`, Kroniko `kreo`). Am Ende `redirect` nach `/marko/:name/grafeo` statt `/farbe`.
- Fehler wie heute auf der Startseite.

### Startseite `/` (in `sxtupoj.ts`, nur Fall `start`)
Heute baut `screen()` die Startseite als **ein** `fm-formularo` mit `data-action="/marko"`; `fields()` liefert im Fall `start` das Namensfeld (`fm-kampo name="name"` mit `data-mt-kennung`), die Auswahl `basis` und wahlweise `oeffnen`.

- Der Block „Neue Marke auf der Leinwand“ entsteht in den `start`-Zweigen von `sxtupoj.ts` (`fields()`, bei Bedarf der `start`-Zweig von `actions()`). `servilo.ts` setzt nichts in das fertige HTML ein.
- Er ist Teil desselben Formulars und nutzt das vorhandene Namensfeld. Es gibt kein zweites `name="name"` und kein zweites `data-mt-kennung`, und Formulare werden nicht verschachtelt.
- Seine Aktion „Auf der Leinwand anlegen“ sendet dasselbe Formular mit `ziel=leinwand`. Wie der Wert in die Anfrage kommt (Absende-Knopf mit `name`/`value` oder ein Feld, das der Knopf setzt), entscheidet der Plan nach dem, was `fm-formularo` und `metiejo.js` heute können. `metiejo.js` und Eroj werden dafür nicht geändert; geht es ohne das nicht, ist das ein Befund mit Fundstelle.
- Die Aktion ist kein Knopf hoher Betonung: Die Seite behält genau einen Hauptknopf (`screenInventory`).
- Die vorhandenen Tests in `sxtupoj.test.ts` bleiben unverändert grün (unter anderem der wörtliche Anfang des Namensfelds und die Werte `leer`, `komuna`, `oeffnen`).
- `servilo.ts` liest `ziel` in `POST /marko` (siehe oben). `basis=oeffnen` zusammen mit `ziel=leinwand` legt keine Marke an und antwortet wie ein fehlender Name.

## Client (nodredaktilo)

- **Laden:** `sxargi("/api/leinwand?marko=…")` beim Öffnen. Nach jedem erfolgreichen Schreiben und nach jeder Änderung an den Verbindungen, die `kablojDe` ändert, noch einmal, mit dem aktuellen `kabloj` (leer = ohne Parameter). Kein Polling. Kommt eine ältere Antwort nach einer neueren an, wird sie verworfen.
- **Schreiben:** Farbfeld übernimmt bei Enter oder Blur; der Farbwähler (`<input type="color">`) schreibt bei `change`, nicht bei jedem `input`. Der Regler „Tönung“ schreibt beim Loslassen. Während des Schreibens bleibt der alte Stand sichtbar.
- **„+ Knoten“ (E-13):** Die Liste zeichnet `aldonebloj(KATALOGO_054, nodoj)`. „anlegen“ legt einen leeren Funktionsfarben-Knoten an, „weitere“ eine weitere Vorschau, „setzen“ wählt den Akzent-Knoten und setzt die Schreibmarke in sein Feld. Ein frisch angelegter, noch leerer Funktionsfarben-Knoten und jede weitere Vorschau stehen nicht im `Bildo`; sie leben im React-Zustand. Erst das Setzen eines Werts schreibt (`zusatzfarben`), danach kommt der Farbknoten aus dem `Bildo`. Ein neuer Knoten bekommt seine Kanten wie aus dem Agordo (Marke → Knoten → eigene Palettenzeile; Palette → Vorschau).
- **Phasen (E-12):** `FazoNodo` ist ein eigener Knotentyp; seine Knoten tragen `parentId` der Phase und Plätze relativ zu ihr, so wandern sie mit (React-Flow-Standard für Unterflüsse). Die Phase hat `dragHandle` auf ihrem Kopf; ein Zug auf ihrer Fläche schwenkt. Kein `extent: "parent"`: Knoten dürfen über die Grenze hinaus. Phasen haben keine Anschlüsse.
- **Verschieben (E-9):** `nodesDraggable` an. Felder, Knöpfe, Regler, Palettenstufen, das Feld an der Stufe und die Vorschau tragen die React-Flow-Klasse `nodrag` (die Vorschau zusätzlich `nowheel` nur, wenn sie selbst rollt). Beim Ende eines Zugs (`onNodeDragStop`) kommt der Platz in die Map `verschoben`; nach jedem neuen `Bildo` setzt `poziciojKun` die Plätze. Kein `fetch`, kein `localStorage`, kein `sessionStorage`, kein Eintrag in der Adresse.
- **Verbinden (E-11):** `nodesConnectable` an, `edgesReconnectable` an, `connectionMode` streng (nur Ausgang → Eingang). `isValidConnection` ruft `validaLigo`. `onConnect` und `onReconnect` tragen die Kante in die Sitzung ein und lösen eine vorhandene Kante am selben Eingang. Ein Zug, der im Leeren endet (`onReconnectEnd` ohne Ziel), löst die Kante. Entf und Rücktaste lösen die gewählte Kante (`deleteKeyCode` nur für Kanten: `onBeforeDelete` lässt Knoten nicht zu); die eigene Kante zeigt gewählt ein „×“. Beim Ziehen bekommen passende Eingänge eine Klasse, die übrigen treten zurück. Die Kanten der Seite sind immer `ligojKun(sitzung, bildo)`. Ändert sich `kablojDe`, lädt die Leinwand den `Bildo` neu und gibt den Vorschauen das neue `kabloj`. Der Hinweis in der Kopfleiste erscheint, wenn die Kanten der Sitzung von `bildo.ligoj` (samt den Kanten der Knoten aus der Sitzung) abweichen; „zurücksetzen“ leert die Sitzung der Verbindungen.
- **Leinwand hell/dunkel (E-8):** Der Schalter setzt `data-fm-color-scheme` auf der Wurzel und `scheme` in der Adresse (`history.replaceState`). Kein Neuladen, kein `localStorage`.
- **422:** Der Satz steht unter dem Feld in `--fm-color-text-muted`, ohne Rot und ohne Symbol. Die Eingabe bleibt stehen. Der Knoten liegt so lange über seinen Nachbarn (höherer `zIndex`), damit der Satz nicht verdeckt wird.
- **Netzfehler/5xx:** „Nicht gespeichert. Noch einmal versuchen.“ am Feld.
- **Vorschau:** je Knoten ein `<iframe src="/marko/:name/vorschau?sxtupo=vorschau&breite=mittel&scheme=<light|dark>&rev=<rev>[&kabloj=…]">`. Zwei Knoten kommen aus dem `Bildo` (hell, dunkel), weitere aus der Sitzung. Jeder Knoten hält sein Schema selbst; es folgt nicht dem Schalter der Leinwand. Ein neuer `rev` oder ein neues `kabloj` setzt eine neue `src`. Der alte Rahmen bleibt gedämpft sichtbar, bis `load` feuert. Ein Knoten ohne Kante am Eingang lädt nichts und zeigt den Leerzustand. `data-nr-vorschau-rev` auf dem Mount-Element markiert den Stand, den **alle** verbundenen Vorschauen zeigen, für Messung und QA.
- **Palette:** Die Basis-Stufe (`Vico.basis`) ist umrandet; an der Zeile stehen `fontoHex` und die Stufe. Eine Stufe mit `hexDunkel` ist geteilt. Das Feld an der Stufe hat zwei Werte (hell, dunkel) und schreibt je Wert einzeln über den Schreibweg (`schema`). „Farbe aus dem Knoten“ füllt nur das Feld „hell“ mit `fontoHex`; geschrieben wird erst mit „Übernehmen“.
- **Licht:** Bei einem neuen `rev` bekommen die Kanten von der geänderten Farbe zur Vorschau kurz eine Klasse mit CSS-Animation. Unter `prefers-reduced-motion: reduce` gibt es keine.
- **Marken für QA:** `data-nr-preta` nach dem ersten Zeichnen, `data-nr-rev` nach jedem neuen Stand (wie 047).
- **„gespeichert HH:MM“:** aus der Antwort des Schreibwegs, nur in dieser Sitzung.

## Tests (rot zuerst, `*-054.test.ts`)

| Test | Prüft |
|---|---|
| `grafeo-gestalten-054.test.ts` | `gestaltenDe`: Knoten, Kanten und Zustände für leere Marke, gesetzte Farben, Funktionsfarbe, Zweitfarbe mit `herkunft`, Stufe `gesetzt`; sechs Phasen als Knoten, 1/2/3/6 leer, jeder andere Knoten mit `fazo` (AK-20); zwei Vorschauen, hell und dunkel (AK-23); sieben Palettenzeilen, Akzent ohne Zweitfarbe ohne Stufen; `basis` je Zeile aus `REFERENCE_STEPS`, keine für neutral und ohne `fonto` (AK-25); `hexDunkel` nur wo abweichend, `gesetztDunkel` nach dunklem Wert von Hand (AK-24); keine Regelnamen im serialisierten `Bildo`. `poziciojKun`: ohne Verschieben die Startplätze; ein verschobener Knoten behält seinen Platz über einen neuen `Bildo`; ein neuer Knoten bekommt seinen Startplatz; ein entfernter Knoten fällt aus der Map; Knoten folgen einer verschobenen Phase (AK-15) |
| `grafeo-kabloj-054.test.ts` | `validaLigo`: gleiche Art ja, fremde Art nein, Eingang → Ausgang nein, `paletro.el → farbo-*.en` nein (AK-17). `ligojKun`: gelöste Kante bleibt gelöst über einen neuen `Bildo`, gezogene Kante ersetzt die am selben Eingang, Kanten an fehlenden Knoten fallen weg. `kablojDe`: unverändert `{}`; Akzent gelöst `{akzent: null}`; Primär an Warnung `{warning: "primaer"}`; abgehängter oder leerer Farbknoten speist nichts. `wirksamerAgordo`: jede Zeile der Tabelle; `festgelegt` unberührt; Eingabe-Agordo unverändert (keine Mutation). `aldonebloj`: die fünf Zustände für leere Marke, Marke mit Akzent, Marke mit allen Funktionsfarben (AK-21) |
| `grafeo-skribo-054.test.ts` | Gelb `#f5c400` als Primär → 200, `rev+1`, Entwurf auf Platte (AK-3); `#12`, `blau`, `oklch(x)` → 422 mit `feld`, Entwurf und `rev` gleich (AK-4); Stufe, die einen Kontrast bricht (z. B. `color.palette.accent.700` = Primär-Gelb) → 200 (AK-12); `stufe: null` entfernt aus `festgelegt` (AK-11); `schema: "dunkel"` schreibt nur `modoj["color-scheme=dark"]` und lässt `wert` stehen, `null` entfernt nur den dunklen Wert (AK-24); unbekannter Token → 422 |
| `grafeo-route-054.test.ts` | `/marko/:name/grafeo` = Gestalten, `?ansicht=verstehen` = 047-Ansicht; `/aspekto/*/grafeo` ohne Umschalter; Gestalten-HTML ohne `vorschau.css` der Marke, mit `leinwand.css`, ohne Problemzahl (AK-8, AK-9, AK-14); Wurzel `dark` als Vorgabe, `light` bei `scheme=light`; `leinwand.css` enthält beide Schemata (AK-22); `pruefungOf` wird für Gestalten nicht gerufen (Zähler am Test-Double) |
| `grafeo-wirksam-054.test.ts` | `/api/leinwand?…&kabloj=akzent:-` → Akzent-Zeile ohne Stufen, Farbknoten Akzent weiter mit seinem Wert; `kabloj=warning:primaer` → Zeile Warnung mit `fonto: "primaer"`; danach Entwurf auf der Platte, `rev` und Kroniko unverändert, `/api/leinwand` ohne Parameter wie vorher (AK-18). Vorschau und `vorschau.css` mit `kabloj` unterscheiden sich von denen ohne; **ohne `kabloj` sind beide Byte für Byte wie vor dem Lauf** (festgehaltene Prüfsumme). Fehlerhafte `kabloj` → 400 |
| `grafeo-literale-054.test.ts` | liest die Quellen unter `packages/nodredaktilo/src/gestalten/**` und findet kein Hex-, `rgb(`-, `hsl(`- oder `oklch(`-Literal (AK-22) |
| `grafeo-einstieg-054.test.ts` | `screen(start)` enthält den Block „Neue Marke auf der Leinwand“ mit der Aktion `ziel=leinwand`, genau ein `name="name"`, genau ein Hauptknopf; die übrigen Schritte (`farbe` bis `fertig`) sind für dieselbe Eingabe Byte für Byte wie vor dem Lauf (Vergleich gegen den Stand `aa53d3f4` als festgehaltene Prüfsumme je Schritt); `POST /marko` mit `ziel=leinwand` → 303 auf `/grafeo`; ohne `ziel` weiter `/farbe`; Name vergeben → Satz auf der Startseite (AK-16) |
| `grafeo-vorschau-054.test.ts` | Die `href` beider Vorschau-Knoten nutzen `sxtupo=vorschau`, nie `buehne-`, und tragen ihr Schema (AK-10, AK-23) |
| `grafeo-studio-054.test.ts` | Schreiben über die Leinwand → Studio zeigt denselben Agordo; Studio-Änderung → `/api/leinwand` zeigt sie nach neuem Laden (AK-2) |

Aus 047/048 wird nur geändert, was die zweite Ansicht zwingend berührt. Voraussichtlich zeigen Pfade auf `/marko/provo/grafeo` dann auf `?ansicht=verstehen` (in `grafeo-route-047.test.ts`). Jede geänderte Zeile kommt in die Liste im PR-Text (AK-5).

## Bilder und Messung (T7)

- `packages/nodredaktilo/scripts/bilder-054.ts` (Playwright, schon da) startet die Metiejo mit einem Arbeitsordner unter `tmpdir`, legt eine Marke über die Startseite an und fotografiert die neun Zustände aus der Produkt-Spec nach `.fundamento/spec054/bilder/` außerhalb des Repos.
- Das Skript bedient dabei, was sich nur im Browser zeigt, und bricht mit Fehler ab, wenn etwas davon nicht geht: einen Knoten und eine Phase ziehen, am Regler ziehen (der Knoten bleibt), die Kante Akzent → Palette lösen und „zurücksetzen“, Primär auf die Zeile Warnung stecken, eine Funktionsfarbe und eine weitere Vorschau über „+ Knoten“ anlegen, die Leinwand auf hell stellen, „Farbe aus dem Knoten“ an der Basis.
- **Messung:** fünfmal Primär ändern. Gemessen wird von `fill+Enter` bis `data-nr-vorschau-rev === neuer rev` und `load` beider Vorschauen. Median und Maximum kommen nach `.fundamento/spec054/messung.json`, ebenso die Größe von `dist/leinwand.js` vor dem Lauf (am Stand `aa53d3f4` gebaut) und danach, roh und gzip.
- Keine Schwelle, kein Budget: nur messen und berichten.

## Risiken und offene Punkte

| # | Risiko | Umgang |
|---|---|---|
| R-1 | Wie weit ein heller Wert von Hand im Dunkeln gilt, ist nur aus dem Code gelesen: `withFestgelegtSteps` ersetzt die Stufe im Hauptsatz; ein eigener dunkler Wert der Struktur (komuna: `neutral.950`) bleibt daneben stehen | T5 belegt das mit einem Test an beiden Vorschau-Stylesheets; weicht es ab, wird die Zeile „Stufe für hell gesetzt“ in der Produkt-Spec nach dem Befund berichtigt, nicht die Ableitung |
| R-9 | Der Umfang ist seit dem ersten Entwurf deutlich gewachsen (Verbindungen mit Wirkung, Phasen als Knoten, Katalog, hell/dunkel auf drei Ebenen), die Grenze von 8 Tickets bleibt | Reihenfolge aus der Produkt-Spec: T1 bis T6, dann T8, T7 zuletzt; was nicht fertig wird, steht als Befund im Bericht und wird nicht halb ausgeliefert |
| R-10 | Die Vorschau-Routen gehören zum Bestand; `kabloj` berührt sie und den Speicher der Stylesheets | der Parameter ist rein zusätzlich; Test mit festgehaltener Prüfsumme ohne Parameter; `buehne-*` bleibt unberührt |
| R-11 | Zwei bis drei Vorschau-Rahmen laden bei jeder Änderung neu; die Zeit bis zur neuen Vorschau steigt | messen und berichten, keine Schwelle; die Stylesheets teilen sich den Speicher je `rev` und `kabloj` |
| R-12 | Die neutrale Belegung hat zu wenige unterscheidbare Rollen für die Arten der Anschlüsse | Befund; die Arten unterscheiden sich dann zusätzlich durch gefüllt/hohl und die Legende, kein neuer Token |
| R-13 | Unterflüsse in React Flow: Knoten mit `parentId` müssen nach ihrer Phase in der Liste stehen, sonst liegen sie unter ihr | `Bildo.nodoj` liefert Phasen zuerst; Test auf die Reihenfolge |
| R-2 | `withFestgelegtSteps` ignoriert einen `wert`, den `setStep` nicht lesen kann | der Schreibweg lässt nur lesbare Werte durch (Schritt 3) |
| R-3 | Festgelegte Stufen der Zweitfarbe bleiben nach „Akzent entfernen“ im Agordo | nicht automatisch löschen; Befund |
| R-4 | entfällt: Der Einstieg wird in `sxtupoj.ts` im Fall `start` gebaut (E-10), nicht per Anker eingesetzt | – |
| R-8 | Ein Zug beginnt auf einem Bedienelement im Knoten und verschiebt den Knoten statt den Regler | Klasse `nodrag` an jedem Bedienelement; das Bilder-Skript zieht einmal am Regler und einmal am Knotenkopf |
| R-5 | Die Größe des Bündels wächst durch eigene Knoten | keine neue Abhängigkeit; messen und berichten |
| R-6 | Das Turbo-Zeitlimit in `modelo` unter Last | bekannt und „fremd“, nicht anheben; höchstens 30 Wiederholungen je Wackel-Test |
| R-7 | Ableitung der neutralen Belegung (unbunt) trifft Sonderfälle aus Spec 036 (`unbunt.ts`) | im ersten Ticket bauen und prüfen; bei Problemen eine leicht getönte, aber unbunt wirkende Leitfarbe nehmen, keine Regel ändern |

## Abgrenzung (Dateien)

- **Frei:** `packages/nodredaktilo/**`. In `packages/metiejo/src/**` nur `servilo.ts`, `grafeo*.ts`, neue Dateien daneben, Tests `*-054.test.ts` und in `sxtupoj.ts` **allein der Fall `start`** (E-10). Außerdem `specs/054-markenprozess-frei-gestalten/**`.
- **Tabu:** `packages/agordilo/**`, `packages/modelo/**`, `packages/eroj/**`, `packages/mcp/**`, `packages/vortaro/**`, `.github/**`, Root-Dateien samt Lockfile, `packages/metiejo/package.json`, jeder andere Fall in `sxtupoj.ts`, `sxtupoj.test.ts`, `studio.ts`, Assistent und Bühne (nur lesen und einbinden), jede Regel, Grenze und Toleranz.

---

## Nachtrag: Entscheidungen der Umsetzung

Bis hierher ist diese Datei byte-gleich mit der technischen Spec (38 238 Byte, SHA-256 `5f3b8cce413bbf8cf669da597c847dad2c225b32e4c0c3aa53690697df663af4`). Es folgt Abschnitt 0 des Implementierungsplans wörtlich (die Entscheidungen, die der Code am Stand `aa53d3f4` erzwingt), danach die Verfeinerungen der Verträge aus T1.

### Blockers & Questions (decided, no blocker left)

| # | Finding in the codebase | Decision |
|---|---|---|
| D-1 | **The start page cannot send `ziel=leinwand` with today's `fm-formularo`.** `#submit()` in `packages/projekcioj/src/celoj/web-component/sxablono-template.ts` (≈ l. 324–344) collects only *named fields* (children in the default/`fields` slot) and never the submitter. Only a `fm-butono[type=submit]` that is a **direct child** of the formularo submits (`#onClick`, `button.parentElement !== this`). `metiejo.js` (`html.ts` ≈ l. 180) forwards `event.detail.values` verbatim. The start-page tests forbid native `<button>` and every `<input>` except `range`/`color` (`sxtupoj.test.ts` l. 44–47), so a hidden input is out. | The `start` case of `fields()` in `sxtupoj.ts` emits the block text, the action `fm-butono type="submit" emphasis="medium"` (direct child of the formularo, no wrapper) and a **small inline classic `<script>`**. The script notes a click on that button and adds `ziel: "leinwand"` to `event.detail.values` in a `submit` listener on the formularo. That listener is registered during parsing, so it runs before the deferred module `metiejo.js`. `metiejo.js`, Eroj and `html.ts` stay unchanged. Report it as a **Befund** (B-3 class) with the Fundstelle above. If it does not work in the browser, report the Befund and stop. Do not change `metiejo.js` or the Eroj. |
| D-2 | `grafeoScreen` (the 047 screen) lives in **`html.ts`**, not in `grafeo-sicht.ts` as the technical spec assumes. The Verstehen view needs a switch back to Gestalten. | `html.ts` gets one **opt-in** optional field on `GrafeoScreen` (for example `gestaltenHref?: string`). The switch renders only when the field is set. Without it the output stays byte for byte as before (testing.md, "Extending tested pure functions"). This is a 047 file that the second view has to touch. List it in the PR text (AK-5). |
| D-3 | The Basis of the Akzent row (`sekundo`): `paletteSources` (`agordilo/src/palettes.ts` ≈ l. 171–177) takes the Zweitfarbe "like the lead colour, on the accent ramp" (`CALIBRATED_RAMP.sekundo = "accent"`, ≈ l. 70–78). | The Basis of `sekundo` is **700**, the same as `REFERENCE_STEPS.accent` (`calibration.ts` l. 34). 700 is in `ZWEITFARBE_STEPS`. |
| D-4 | `withFestgelegtSteps` reads a step value only as a **DTCG object** (`readDtcgColor`). `colourWert` converts only `#rrggbb`. A step written as `oklch(…)` or `#abc` would be dropped silently (R-2). | The write path normalises every readable step colour (hex 3/6, `oklch(L C H)`) to `#rrggbb` and then runs `colourWert`. A stored step is therefore always a DTCG `srgb` object. |
| D-5 | `paletteSources` takes only the **hue** of a Funktionsfarbe. Its chroma comes from the calibration. The chroma of the Neutral palette is `toenung × lead.c × NEUTRAL_SHARE`, so it depends on the Primär chroma. | No change. Add both to **B-4** (Funktionsfarbe) and **B-1** (Neutral follows Primär, including under „Primär gelöst“) in the report. |
| D-6 | Where the images go. `.fundamento/` is gitignored in both checkouts. The maintainer's `spec.md`/`zielbild.html` sit in `/Users/thorstenjankowski/n8n-compose/20260918_fundamento-ds/.fundamento/spec054/`. | Images go to **`/Users/thorstenjankowski/n8n-compose/20260918_fundamento-ds/.fundamento/spec054/bilder/`** and the measurement to **`…/spec054/messung.json`**. Both are outside the worktree repo tree, next to the Zielbild, and the report links them as `file://`. The script takes the target dir as `--ziel <dir>`. Nothing else in that folder is created or changed. |
| D-7 | `@fundamento/nodredaktilo` must stay **without a `test` script** and with devDependencies only (`abhaengigkeiten-047.test.ts` (0)). | Every automated test lives in `packages/metiejo/src/*-054.test.ts`, as in 047/048. Do not add a script to `nodredaktilo/package.json`. Run the image script with `pnpm --filter @fundamento/nodredaktilo exec tsx scripts/bilder-054.ts --ziel …`. |
| D-8 | Anschluss art colours (R-12). The neutral Belegung (achromatic lead colour) still derives coloured status palettes, and the core aliases `color.syntax.*` on them in both schemes. | Proposed roles (T3 verifies that they can be told apart in both schemes): **Marke** → `--fm-color-text-default`; **Maß** → `--fm-color-syntax-string`; **Text** → `--fm-color-syntax-name`; **Schrift** → `--fm-color-syntax-number`; catalog-only kinds (Bild, KI) → `--fm-color-syntax-keyword` / `--fm-color-text-muted`. **Farbe** is the brand colour itself (inline from data). If they cannot be told apart, report a Befund and fall back to filled/hollow plus the legend. No new token. |

### Verfeinerungen der Verträge aus T1 (MPFG-1.1)

Die Verträge stehen in `packages/metiejo/src/grafeo-gestalten-sicht.ts` (ohne Import, Alias `@fundamento/metiejo/gestalten` im Bündel) und `grafeo-gestalten.ts` (Server). Wo T1 von der technischen Spec oben abweicht oder sie genauer fasst:

| # | Stelle | Festlegung |
|---|---|---|
| V-1 | `gestaltenDe(agordo, e)` | `e` = `{ start, kabloj, palettes, rev }`. `rev` ist neu in der Eingabe: `Bildo.rev` und die Vorschau-Adressen brauchen ihn. |
| V-2 | Knotentypen | `BildoFazo`, `BildoMarko`, `BildoFarbo`, `BildoPaletro`, `BildoVorschau` (Union `BildoNodo`). Die Namen `FazoNodo`, `MarkoNodo` … bleiben den React-Bausteinen in `src/gestalten/nodoj/`. |
| V-3 | Katalog | `aldonebloj(katalogo, nodoj): Aldoneblo[]` statt `Ero[]` („Ero“ ist im Repo die Komponente). Eintrag `KatalogoEnskribo = { grupo, nomo, zeichen, lauf, nodo? }`; `nodo` nennt bei MP-1-Einträgen den Knoten (`vorschau` für „weitere“). Zustand `AldonStato`, deutsche Wörter in `ALDON_ETIKEDOJ`. |
| V-4 | `ligojKun(sitzung, bildo)` | `sitzung: LigoSitzung = { geloest: string[] (Ids von bildo.ligoj), gezogen: {de, al}[] (ältere zuerst), nodoj: string[] (Knoten nur der Sitzung) }`. Eine gezogene Kante, die `validaLigo` ablehnt, fällt weg. Soll ein Eingang nach dem Entfernen einer gezogenen Kante leer bleiben, steht die ersetzte Agordo-Kante in `geloest`. |
| V-5 | `kablojDe(ligoj, nodoj)` | `nodoj: { id, stato? }[]` aus Bildo und Sitzung; ein Farbknoten speist nur, wenn er da ist und `stato !== "leer"`. Grundlage („wie im Agordo“): jede Zeile von ihrem eigenen Knoten, wenn er einen Wert hat. Quelle falscher Art zählt als `null`. |
| V-6 | `Vico.fonto` | Der verbundene Farbknoten der wirksamen Sicht, **auch wenn er leer ist** (Akzent ohne Wert: `fonto: "akzent"`, keine Stufen → „noch keine Farbe“; mit `kabloj akzent:-` → `null` → „nicht verbunden“). Ohne `kabloj`-Eintrag ist es der eigene Knoten der Zeile, sofern es ihn im Bildo gibt. `basis` nur, wenn dieser Knoten einen Wert hat und die Zeile die Stufe hat. `fontoHex` = `hex` des Knotens. |
| V-7 | `BildoFarbo.hex` | Leerer Akzent: Neutral-Stufe 700 (ohne Zweitfarbe tragen deren Rollen die Neutralleiter). Neutral: Neutral-Stufe 100 hell. Beides aus der Ableitung des **wirksamen** Agordo; `""` nur, wenn die Ableitung fehlt. |
| V-8 | Neutral-Knoten | `stato: "leer"` ohne `neutral.toenung`, sonst `"von-hand"`; `toenung` immer gesetzt (0 ohne Feld, wie `paletteSources`). |
| V-9 | `wirksamerAgordo` | Werte nur aus dem gespeicherten Agordo (ein Tausch tauscht). Eine Quelle ohne Wert oder falscher Art zählt wie `null`. Leer gewordene `zusatzfarben`/`neutral` fallen weg; `festgelegt` bleibt dasselbe Objekt. |
| V-10 | `validaLigo` | Außer Art und Richtung: Kanten nur vorwärts im Fluss Marke → Farbe → Palette → Vorschau, dazu eine Kreis-Prüfung über `ligoj`. So leuchtet `paletro.el → farbo-*.en` nie auf, auch wenn der Farbknoten gerade nicht an der Palette hängt. |
| V-11 | `ARANGXO_054` | `{ fazoj (absolut, x/y/largxo/alteco), nodoj (fest, relativ), funkcioj {x, y, largxo, dy}, weitereVorschauen {x, y, largxo, dx, dy} }` aus `GRUPPEN`, `PLATZ`, `fnPlatz`, `vorschauPlatz` des Mockups (Phasen y 96, Höhe 1016; Plätze minus Ursprung der Phase). `largxoDe(id)` gibt die Startbreite. `poziciojKun` gibt einem Knoten ohne Startplatz den Ursprung seiner Phase. |
| V-12 | Katalog-Läufe | Nach Konzept Abschnitt 8. „Anteile“, „Überschrift“, „Rahmen“ (im Konzept MP-1) kommen später (MP-3), weil der Auftrag sie nicht baut. „Seite“ MP-3 und „Harte Fälle“ MP-4 sind Annahmen: Das Konzept nennt für sie keinen Lauf. |
| V-13 | Zusätzliche Exporte | `paletrojDe(agordo, bases)` (Ableitung wie die Vorschau, `undefined` bei Fehler), `serializeBildo`, `GestaltenEingaben` (Server); `anschlussDe`, `ligoId`, `largxoDe`, `FARBO_ROLOJ`, `STATUS_ROLOJ`, `ROLO_ETIKEDOJ`, `ROLO_PALETRO`, `FAZOJ`, `Pozicio`, `Platz`, `FazoPlatz`, `Schema`, `FarboStato` (geteilt). |
