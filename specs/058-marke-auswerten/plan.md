# Technische Spec 058 – Marke beschreiben, mit KI auswerten, ansprechend zeigen

**Gehört zu:** `product-spec.md` im selben Ordner · **Basis:** `main` (`0f9ada50`) · **Stand:** 2026-11-16

Diese Spec hält fest, was der Code heute hergibt, und legt Daten, Routen und Schnitt fest. Namen neuer Dateien und Funktionen sind Vorschläge; der Plan (`specs/058-marke-auswerten/plan.md`) darf sie ändern, die Verträge nicht. Zeilennummern gelten für `0f9ada50`. Pfade ohne Paket beziehen sich auf `packages/metiejo/src/`.

## Overview

- Der Server hält das Sprachmodell; der Browser sieht nie einen Schlüssel. Alle drei KI-Aufrufe sind neue Routen in `servilo.ts`, die `chatCompletion` aus `asistanto/ki.ts` nur aufrufen.
- Alles Rechnen ohne Modell liegt in reinen Funktionen, die Server und Leinwand teilen (wie `leinwand-enhavo.ts`): Übersicht, „veraltet“, Zuordnung Merkmale → Aufbau, Auftrag an das Modell, Lesen der Antwort.
- Die Leinwand-Datei wächst nur additiv. `version` bleibt `1`. Kein Agordo-Schema, kein Modelo.
- Vorhandene Routen und reine Funktionen bleiben ohne neuen Schalter byte-gleich (`testing.md`, „Extending tested pure functions“). Neues Verhalten kommt über neue Routen, neue Kennungen oder einen Opt-in-Parameter.

## Befunde aus dem Code

| # | Befund | Stelle | Folge |
|---|---|---|---|
| B-1 | Die Ansicht Gestalten hat **keine Seitenspalte**. `Flanko` gehört zu „Verstehen“. | `packages/nodredaktilo/src/flanko.tsx`; Gestalten zeigt Auswahl nur als Ring (`gestalten/sxelo.tsx` l.116–144) | Neue Seitenspalte in `gestalten/` |
| B-2 | Gestalten ordnet nicht mit dagre. `arangxi` wird nur von „Verstehen“ benutzt; Gestalten nimmt feste Plätze. | `packages/nodredaktilo/src/arangxo.ts`; `grafeo-gestalten-sicht.ts` `ARANGXO_055` (l.794), `ARANGXO_056` (l.844), `poziciojKun` (l.906) | „Anordnen“ ruft dagre neu für Gestalten |
| B-3 | **Kein Ero zeigt den Akzent.** Akzent ist Palette `sekundo`; Rollen `color.sekundo.surface`, `.illustration`, `.badge.fill`, `.badge.text`, `.chart`. Ohne Zweitfarbe zeigen sie auf Neutral. Regel `sekundo-not-action` verbietet Aktion, Link, Fokus. | `vortaro/sets/core.json`; `modelo/data/reguloj.json` l.974; `fm-insigno intent` nur neutral/info/success/warning/danger | Akzent-Stellen sind eigenes Markup der Vorschau mit `--fm-color-sekundo-*` |
| B-4 | Der Modellzugang hat **noch nie ein Bild** geschickt. `ChatMessage.content` ist `string`; der Anfragekörper ist aber `Record<string, unknown>`. | `asistanto/ki.ts` l.111–117, l.175 | Bildteile gehen im Körper, ohne `ki.ts` zu ändern |
| B-5 | `ago` der Kroniko ist ein **geschlossenes Enum** im Modelo: `kreo, propono, sxangxo, akcepto, liberigo, remalfermo, fremda, konfirmo, averto, babilo, eksporto`. | `modelo/schema/modelo.schema.json` l.4994 | Kein neuer `ago`-Wert; siehe „Kosten und Protokoll“ |
| B-6 | Die Schätzung des Assistenten (`taksi`) rechnet je `Zugo`; `Zugo` ist eine geschlossene Union. `mezurojOf` nimmt nur Einträge mit `ago === "babilo"`. | `takso/takso.ts` l.18, l.91, l.208 | Eigene Schätzung für die Leinwand; `takso/**` nur aufrufen (`kostoOf`, `dollarsOf`) |
| B-7 | Es gibt **kein JSON-Zeichen** „kein Modell eingerichtet“. Modell-Routen antworten 503 `{satz: kiSatz()}`. | `servilo.ts` l.1237 | Neue Route `GET /api/marko/:name/ki` |
| B-8 | Die Markenliste gibt es nur als HTML der Startseite. | `marken-liste.ts` l.93; `servilo.ts` l.862, l.1787 | Neue Route `GET /api/marken` |
| B-9 | `POST /marko` nimmt ein Formular, leitet nach `/marko/:name/grafeo` um und zeigt Fehler als Startseite (HTML). `etikedoj.marko` wird nur gesetzt, wenn der Name von der Kennung abweicht. | `servilo.ts` l.2295–2352; `ident.ts` | „Neue Marke“ schickt ein Formular; Doppelte prüft die Kopfleiste vorher |
| B-10 | Der Schreibweg der Leinwand kennt genau einen Schlüssel je Anfrage: `farbe`, `toenung`, `stufe`, `neutral`, `schrift`, `regler`. **Kein Name.** | `grafeo-skribo.ts` l.329, l.418 | Neuer Schlüssel `name` |
| B-11 | Stände: `POST /api/marko/:name/staende {name?}` → 201 `{id, name, zeit}`. Keine Grenze für Zahl oder Namen. Ein Stand hält `agordo` und `leinwand`. | `servilo.ts` l.1972–2050; `staende.ts` | Stand vor Übernahme ist ein gewöhnlicher Aufruf |
| B-12 | `leinwand.json`: `{version: 1, knoten[], kabloj, geloest?}`. Unbekannte Knoten-Kennungen und Felder fallen beim Lesen still weg; unbekannte Felder der obersten Ebene werden nicht behalten. Der Browser schreibt immer den ganzen Zustand (`PUT /api/marko/:name/leinwand-stato`). | `leinwand-stato.ts` `parseLeinwandStato`; `leinwand-enhavo.ts` `enhavoDe` l.217; `grafeo-gestalten-sicht.ts` l.514–524 | Neue Daten hängen an Knoten, nicht an der obersten Ebene |
| B-13 | Beispiele: PNG, JPG, WebP, SVG, PDF; 24 MiB je Datei; **keine** Grenze für die Zahl. Ablage `<workdir>/<name>/materialo/` mit `.gitignore` `*`. Der Export liest `materialo/` nie. | `beispiele-vojoj.ts`; `servilo.ts` l.421–429; `enportilo/materialo.ts` l.103 | Layout-Beispiel und Pinterest-Bilder liegen dort |
| B-14 | Ein PDF wird nur gelesen (Farb-Operatoren, Schriftnamen), **nie gerastert**. JPG und WebP werden über Playwright-Chromium auf höchstens 1024 px gelesen (`SenBrowser` ohne Browser). | `enportilo/pdf.ts` l.35; `enportilo/bildilo.ts` | „Aufbau erkennen“ nur für PNG, JPG, WebP |
| B-15 | Ein Link in „Beispiele“ wird schon abgerufen (`credentials: "omit"`, Weiterleitungen folgen, 15 s, 24 MiB). Ist die Antwort kein Bild, wird er Verweis. Eine direkte Bildadresse wird geladen und ausgewertet. Keine Prüfung auf private Adressen an dieser Stelle (die gibt es als `permesataAdreso` in `esploro/esploro.ts` l.73). | `beispiele-vojoj.ts` `legiAdreson`, `estasPinterest` l.137 | Pinterest-Vorschau erweitert `legiAdreson`; „nehmen“ ist der vorhandene Aufruf mit der Bildadresse |
| B-16 | Schrift-Katalog: `data/tiparoj.json`, `readTiparoj()`; Einträge `{id, family, …}`. Der Schreibweg prüft die `id`. | `tiparoj.ts` l.299; `grafeo-skribo.ts` l.440 | Familienname des Modells → `id` über den Katalog |
| B-17 | Die Vorschau der Leinwand ist ein per Skript erzeugter Rahmen auf `/marko/:name/vorschau?sxtupo=vorschau&breite=mittel&scheme=…&rev=…[&kabloj=…]`. Der Inhalt kommt aus `previewBody("vorschau", …)`. | `nodoj/vorschau.tsx`; `grafeo-gestalten-sicht.ts` `vorschauHref` l.1214; `servilo.ts` l.3409; `vorschau-korpo.ts` l.108 | Neue Kennungen `marke` und `komponenten`; `vorschau` bleibt byte-gleich |
| B-18 | Kein Browser-Test unter `packages/eroj/test` öffnet die Leinwand. Die Vorschau der Metiejo öffnen: `buehne-036.spec.ts`, `buehne-navigation-042.spec.ts`, `form-036.spec.ts`, `wackler-040.spec.ts`, `zweitfarbe-036.spec.ts` (Helfer `geladen-042.ts`). | `packages/eroj/test/` | Diese fünf laufen vor dem Push lokal in Chromium |

## Daten

### Neue Knoten

| Kennung | Art (`speco`) | Anschluss | Fest? | Inhalt (`inhalt`) |
|---|---|---|---|---|
| `teksto-grundlagen` | `teksto` | aus: Text | fest, nicht entfernbar | `{beschreibung?: string}` |
| `ki-namen` | `ki` (neu) | ein: Text, Bild | über „+ Knoten“, höchstens einmal | `{vorschlag?: NamenVorschlag}` |
| `layout-beispiel` | `layout` (neu) | aus: Bild → Vorschauen | fest, in der Startanordnung | `{datei?: BeispielDosiero, merkmale?: Merkmale, worte?: string, abdruck?: string, kosto?: Kosto}` |
| `marko` (vorhanden) | – | – | fest | neu: `inhalt: {profil?: Profil}` |
| `vorschau-*` (vorhanden) | `vorschau` | neu: Eingang Bild `<id>.en.bildo` | – | neu am Knoten: `ansicht?: "marke" \| "komponenten"`, `aufbau?: "auto" \| "titel" \| "raster" \| "liste"` |

- **Name** der Marke liegt nicht in der Leinwand-Datei, sondern in `etikedoj.marko` des Agordo (vorhandenes Feld). Ein Stand hält den Agordo, also auch den Namen.
- Vorgaben beim Lesen: `ansicht` fehlt → `marke`; `aufbau` fehlt → `auto`.
- `enhavoDe` bekommt die drei neuen Kennungen; wie bisher fällt jedes Feld falschen Typs einzeln weg, nie die ganze Datei.

### Typen

```ts
type Kosto = { enigo: number; eligo: number; usd?: number; modelo: string; zeit: string };

type Profil = {
  kernsatz?: string;
  leitgedanken?: { titel: string; text: string }[];   // genau die ersten drei lesbaren
  charakter?: string[];                                // drei bis fünf
  passt?: string[];
  reibt?: string[];
  vorschlag?: {
    primaer?: { hex: string; grund: string };
    akzent?: { hex: string; grund: string };
    neutral?: { hex: string; grund: string };
    schrift?: { display: string; body: string; grund: string };  // Katalog-ids
  };
  verworfen?: string[];        // Namen der Teile, die nicht lesbar waren
  abdruck: string;             // Abdruck der Eingaben zur Zeit der Auswertung
  eingaben: { primaer?: string; akzent?: string; neutral?: string; display?: string; body?: string };
  gesichert?: string;          // id des Stands „vor Übernahme“, sobald angelegt
  kosto: Kosto;
};

type NamenVorschlag = {
  namen: { name: string; grund: string }[];   // sechs bis acht, weniger wenn unlesbar
  beschreibung?: string;
  verworfen?: string[];
  abdruck: string;
  gesichert?: string;
  kosto: Kosto;
};

type Merkmale = {
  titelbild: "gross" | "klein" | "keins";
  inhalt: "karten" | "liste" | "fliesstext";
  dichte: "luftig" | "dicht";
  achse: "mittig" | "links";
  schrift: "gross" | "zurueckhaltend";
};
```

Ein Wert außerhalb der Aufzählung macht dieses eine Merkmal unlesbar, nicht alle.

## Reine Funktionen

Neue Datei neben `leinwand-enhavo.ts` (Vorschlag: `leinwand-auswertung.ts`), nur mit Importen aus dem geteilten Modul, damit das Bündel der Leinwand sie über den vorhandenen Alias nimmt. Kein Takt, kein Zufall, kein Speicher.

| Funktion | Zweck |
|---|---|
| `uebersichtDe(stato, bildo)` | Was der Marken-Knoten ohne KI zeigt: Name, Beschreibung (gekürzt), Kern, Werte, Persönlichkeit, Tonalität (sechs Werte), Farben (Primär, Akzent, Neutral, je gesetzt oder abgeleitet), erkannte Farben aus Beispielen und Layout-Beispiel, Schriften, `offen: EnhavoId[]`. Nur verbundene Eingänge zählen. |
| `eingabenDe(stato, bildo)` | Der gesamte Input als Datenstruktur für den Auftrag, ohne Dateinamen und ohne Adressen von Bildern. |
| `abdruckDe(eingaben)` | Stabiler Abdruck: JSON mit sortierten Schlüsseln, darüber ein Hash, der in Node und im Browser gleich rechnet (ohne neue Abhängigkeit; der Plan nennt die Funktion). Grundlage für „veraltet“. |
| `veraltet(ergebnis, eingabenJetzt)` | `true`, wenn der Abdruck abweicht. Für das Profil gilt eine Farbe oder Schrift, die dem eigenen Vorschlag entspricht, als der Wert zur Zeit der Auswertung (`Profil.eingaben`). So macht das Übernehmen das Profil nicht veraltet. |
| `auftragProfil(eingaben)`, `auftragNamen(eingaben)`, `auftragAufbau()` | Die Nachrichten an das Modell. Deutsch, mit der Bitte um genau ein JSON-Objekt in festem Aufbau. |
| `legiProfil(text)`, `legiNamen(text)`, `legiAufbau(text)` | Lesen der Antwort: Code-Zäune entfernen, JSON lesen, je Feld prüfen. Lesbar ist: Text mit Inhalt; Farbe `#rrggbb`; Schrift, deren Familie im Katalog steht (Vergleich ohne Groß- und Kleinschreibung, dann `id`). Unlesbares landet in `verworfen`. **Keine Regel, kein Kontrast, keine Grenze prüft Werte** (Ä-4). |
| `aufbauDe(merkmale)` | Feste Zuordnung, in dieser Reihenfolge: `inhalt === "karten"` → `raster`; `inhalt === "liste"` oder (`achse === "links"` und `schrift === "zurueckhaltend"` und `titelbild !== "gross"`) → `liste`; `titelbild === "gross"` oder `schrift === "gross"` → `titel`; sonst der erste Aufbau. Gibt `{aufbau, grund}` zurück; der Grund ist ein fertiger deutscher Satz aus den Merkmalen. |
| `schaetzungDe(zweck, auftrag, preise)` | Geschätzte Tokens: Eingang aus der Länge des Auftrags, Ausgang aus dem Median eigener früherer Aufrufe dieses Zwecks in der Kroniko, sonst ein Startwert je Zweck. Das ist ein Schätzwert für die Anzeige, keine Grenze. |
| `pinterestVorschauDe(html, adresse)` | Titel (`og:title`, sonst `<title>`) und bis zu zwölf verschiedene Bilder. Quellen: JSON in `<script id="__PWS_INITIAL_PROPS__">`, `<img src>`, `og:image`. Nur Host `i.pinimg.com`. Größenvarianten desselben Bilds zählen einmal; je Bild eine kleine Adresse für die Vorschau und eine größere zum Nehmen. Leere Liste, wenn nichts lesbar ist. |

`gestaltenDe`, `poziciojKun` und `vorschauHref` bekommen die Neuerungen hinter einer Option (Vorschlag: `{stufe: 58}`): neue feste Knoten, neue Startplätze (`ARANGXO_058`: Grundlagen ganz links, Layout-Beispiel vor den Vorschauen, Vorschauen breiter), neue Parameter der Vorschau-Adresse. Ohne die Option bleibt die Ausgabe byte-gleich, und die Tests von 054 bis 056 bleiben unverändert.

## Routen

### Neu

| Methode und Pfad | Antwort | Bemerkung |
|---|---|---|
| `GET /api/marken` | 200 `{marken: MarkenZeile[]}` | Daten von `markenListeDe`, sortiert wie die Startseite. |
| `GET /api/marko/:name/ki?zweck=profil\|namen\|aufbau` | 200 `{pret: boolean, satz?: string, schaetzung?: {enigo, eligo, usd?, text}}` | `pret: false` mit `satz` („Kein Sprachmodell eingerichtet“), wenn kein Modell. Die Schätzung rechnet der Server aus der gespeicherten Leinwand. Liest nur; Entwurf, `rev` und Kroniko bleiben unverändert (Test). |
| `POST /api/marko/:name/ki/profil` | 200 `{profil: Profil}` | Kein Anfragekörper mit Inhalten: Der Server liest die Eingaben aus `leinwand.json` und dem Entwurf. Der Browser wartet vorher auf sein Schreiben (`skribilo.atendi()`). |
| `POST /api/marko/:name/ki/namen` | 200 `{vorschlag: NamenVorschlag}` | wie oben; Eingaben sind die mit `ki-namen` verbundenen Knoten. |
| `POST /api/marko/:name/ki/aufbau` | 200 `{merkmale, worte, aufbau, grund, kosto}` | Schickt das verkleinerte Bild des Layout-Beispiels. Einzige Route mit Bild. |
| `POST /api/marko/:name/layout-beispiel` | 200 `{datei: {name, art, farben}}`, 422 `{satz}` | Körper `{filename, base64}`. Gleiche Formate und Grenze wie Beispiele (`legiBeispielon`). Ablage `materialo/layout/`. Ersetzt das vorhandene Beispiel. |
| `DELETE /api/marko/:name/layout-beispiel` | 200 `{}` | Entfernt die Datei. |

Fehler der drei KI-Routen, immer mit ruhigem Satz:

| Status | Fall | Körper |
|---|---|---|
| 503 | kein Modell | `{satz: kiSatz()}` |
| 422 | keine Eingabe mit Inhalt; Format ohne Bild (PDF, SVG); kein Browser zum Verkleinern | `{satz}` |
| 502 | Anbieter antwortet nicht, Fehler, Zeitlimit, Kostengrenze | `{satz, kosto?}` |
| 200 mit `verworfen` | Antwort teilweise unlesbar | das Lesbare |
| 422 mit `kosto` | Antwort ganz unlesbar | `{satz, kosto}` |

Jede der drei Routen schreibt ihr Ergebnis selbst in `leinwand.json` (nur das `inhalt` des einen Knotens, alles andere bleibt) und gibt es zurück. So landet es bei der Marke, für die es angefragt wurde, auch wenn die Seite inzwischen geschlossen ist. Der Browser nimmt das Ergebnis in seinen Zustand und schreibt es mit dem nächsten `PUT` wieder mit.

### Erweitert, ohne Schalter byte-gleich

| Route | Neu | Schalter |
|---|---|---|
| `POST /api/marko/:name/leinwand` (`grafeo-skribo.ts`) | Schlüssel `{name: string}`: schreibt `etikedoj.marko` über `setDraft(…, "regilo")`. Leer oder gleich der Kennung entfernt das Feld. Kennung und Ordner bleiben. | neuer Schlüssel |
| `POST /api/marko/:name/beispiele` (`beispiele-vojoj.ts`) | Körper `{url, vorschau: true}`: Ist die Adresse von Pinterest und die Antwort eine Seite, kommt `{verweis: {adresse, titel?, bilder: [{vorschau, bild}]}}`. Ohne Bilder bleibt es bei `{verweis: {adresse, satz: PINTEREST_SATZ}}`. | Feld `vorschau` |
| `GET /api/leinwand` | Mit `stufe=58` liefert das Bildo die neuen festen Knoten und Plätze. | Parameter `stufe` |
| `/marko/:name/vorschau` | `sxtupo=marke&aufbau=titel\|raster\|liste&inh=<abdruck>` und `sxtupo=komponenten`. `sxtupo=vorschau` bleibt, wie es ist. | neue Kennungen |

Vor der Änderung werden Prüfsummen der alten Antworten am Basis-Commit genommen und im neuen Test festgehalten: `GET /api/leinwand` ohne `stufe`, `/marko/:name/vorschau?sxtupo=vorschau` in hell und dunkel, `POST …/beispiele {url}` mit einer Pinterest-Adresse ohne `vorschau`.

„Als Beispiel nehmen“ ist der vorhandene Aufruf `POST /api/marko/:name/beispiele {url: <Adresse bei i.pinimg.com>}`; er lädt, prüft und wertet schon aus (B-15).

### Abruf von Pinterest

- Im vorhandenen `legiAdreson`: 15 s (`RETEJO_TEMPOLIMO`), `credentials: "omit"`, keine Cookies, keine Kopfzeilen einer Anmeldung, Weiterleitungen folgen.
- Gelesen wird nur, wenn die **letzte** Adresse nach den Weiterleitungen eine Pinterest-Adresse ist (`estasPinterest`). So löst sich `pin.it/…` auf, und eine Weiterleitung anderswohin wird Verweis.
- Vor dem Abruf `permesataAdreso` aus `esploro/esploro.ts` aufrufen (nur aufrufen), damit keine private Adresse abgerufen wird.
- 403, 429, Anmeldeseite oder leere Liste → Verweis mit dem bisherigen Satz.
- Vorschaubilder lädt der Browser direkt von `i.pinimg.com` (`referrerpolicy="no-referrer"`, `loading="lazy"`). Der Plan prüft, ob eine Content-Security-Policy der Leinwand-Seite das zulässt. Wenn nicht: eine Durchreich-Route nur für Adressen bei `i.pinimg.com`, mit der Grenze je Datei von Beispiele und ohne Ablage.

## KI-Aufrufe

### Verdrahtung

Wie bei `esploro/esploro.ts` l.249:

```ts
chatCompletion(options.ki.provider, { messages, temperature }, new Budget(options.ki?.limo ?? 60_000),
  { fetch: options.ki.fetch, ...gated, log })
  .catch((e) => { throw kostoOnError(e, { enigo: 0, eligo: 0, requests: 0 }, started); });
```

- `provider`, `limo`, `gated` (`Pordisto`) und `log` (mit `redact`) sind die vorhandenen aus `servilo.ts` (l.727–764). Keine Grenze wird geändert.
- Antwortformat: die Bitte um JSON steht im Auftrag; gelesen wird nachsichtig (`legi…`). Kein `response_format`, weil nicht jeder der drei Anbieter und jedes Modell es kennt.
- `temperature`: niedrig für Profil und Aufbau, höher für Namen. Werte im Plan.

### Bild für „Aufbau erkennen“

- Nachricht mit Teilen im Anfragekörper: `content: [{type: "text", text}, {type: "image_url", image_url: {url: "data:image/jpeg;base64,…"}}]`. Der Körper von `chatCompletion` ist `Record<string, unknown>`; `ki.ts` wird nicht geändert. Zwingt der Typ doch dazu, ist das ein Befund mit Zeile im PR-Text.
- Das Bild wird vorher verkleinert (längste Seite höchstens 1024 px, wie `MAX_RANDO` in `bildilo.ts`) und neu kodiert, über den vorhandenen Chromium (Playwright) in einer neuen Datei neben den Routen. `enportilo/**` wird nur aufgerufen. Ohne Browser (`SenBrowser`): 422 mit Satz.
- Im Log steht nie der Körper der Anfrage. Test: Nach dem Aufruf enthält weder `stderr` noch die Kroniko ein Stück der Bilddaten.
- Liest das Modell keine Bilder, antwortet der Anbieter mit einem Fehler → 502 mit „Das eingerichtete Sprachmodell liest keine Bilder.“, sofern die Antwort des Anbieters das erkennen lässt; sonst der allgemeine Satz.

### Was in den Auftrag geht

| Aufruf | Geht ein | Geht nie ein |
|---|---|---|
| Profil | Name, Beschreibung, alle verbundenen Text-Knoten, Tonalität als Wortpaare mit Wert, erkannte Farben (Hex, Anteil, hell/dunkel, bunt/unbunt), Merkmale und Worte des Layout-Beispiels, gesetzte Farben (Primär, Akzent, Neutral), Schriften (Familien) | Bilder, Dateinamen, Adressen von Bildern, Pinterest-Adressen |
| Namen | die mit `ki-namen` verbundenen Knoten; die bisherige Beschreibung | wie oben |
| Aufbau | das eine Bild und eine feste Frage | Texte der Marke |

### Kosten und Protokoll

- **Davor:** `GET …/ki?zweck=` liefert die Schätzung; der Knopf zeigt sie als „≈ 0,02 $“ (`kostoOf` aus `takso/prezoj.ts`, Format `dollarsOf`). Kennt die Preisliste das Modell nicht, zeigt der Knopf die geschätzten Tokens.
- **Danach:** Die Antwort trägt `kosto`; der Knoten zeigt den tatsächlichen Preis und die Zeit.
- **Kroniko:** ein Eintrag je Aufruf über den vorhandenen `kroniko(…)`-Helfer, mit `modelo`, `kosto: {enigo, eligo, ms, requests}` und `detaloj: {zweck: "leinwand-profil" | "leinwand-namen" | "leinwand-aufbau"}`. Kein `teksto`, kein Inhalt der Marke. Fehlgeschlagene Aufrufe über `failedTurn`, damit `zaehlilo` sie mitzählt.
- **`ago` (B-5, B-6):** Empfohlen `ago: "propono"`, `fonto: "agento"`. Es ist ein Vorschlag, `zaehlilo` zählt ihn über `kosto` mit, und `mezurojOf` (nur `babilo`) bleibt unberührt, sodass die Schätzungen des Assistenten sich nicht verschieben. **Der Plan liest zuerst alle Stellen, die `propono` auswerten** (Markenprotokoll, Stato). Erwartet eine davon Felder, die hier fehlen (etwa `faceto`), gilt `ago: "babilo"` mit `fonto: "agento"`, und der Bericht nennt die Verschiebung der Schätzung als Befund. Ein eigener `ago`-Wert braucht eine Änderung am Modelo und ist ein Folgeauftrag.
- **Kappe des echten Durchlaufs (0,50 $):** Das Bilder-Skript summiert `kosto` nach jedem Aufruf und bricht ab, bevor die nächste Schätzung die Kappe übersteigt. Die Kappe ist eine Regel des Skripts, keine neue Grenze im Produkt.

## Leinwand

Paket `packages/nodredaktilo`, Ordner `src/gestalten/`.

| Datei | Änderung |
|---|---|
| `kapo.tsx` | Links „Neue Marke“ (Aufklappfeld mit Name und „Anlegen“) und „Marken“ (Liste aus `GET /api/marken`); rechts „Anordnen“ neben „Anordnung zurücksetzen“. |
| `kanvaso.tsx` | `anordnen()`; Seitenspalte; Vorgaben für neue Knoten; Aufruf mit `stufe=58`. |
| `menuo.tsx` | Katalog: „Namen und Beschreibung“ (Zeichen `ki`), sonst unverändert. |
| `nodoj/grundlagen.tsx` (neu) | Zwei Felder; Name schreibt über den Schreibweg (`{name}`), Beschreibung in `inhalt`. |
| `nodoj/ki-namen.tsx` (neu) | Knopf, Preis, Liste, Übernehmen, „veraltet“, Satz zum freien Namen. |
| `nodoj/layout-beispiel.tsx` (neu) | Hochladen, Farben, „Aufbau erkennen“, Merkmale, Satz zum Bild. |
| `nodoj/marko.tsx` | Übersicht aus `uebersichtDe`; Knopf „Marke auswerten“; Profil verdichtet. Gestalt nach dem gewählten Entwurf. |
| `nodoj/vorschau.tsx` | Schalter Ansicht und Aufbau; Adresse mit `sxtupo`, `aufbau`, `inh`; Eingang für das Layout-Beispiel; Zeile mit dem Grund. Der Rahmen bleibt per Skript erzeugt und doppelt gepuffert. Einzelheiten unter „Aufbau im Vorschau-Knoten“. |
| `nodoj/beispiele.tsx` | Vorschau des Pinterest-Links: Titel, Raster, „als Beispiel nehmen“, „alle nehmen“, „Vorschau zeigen“. |
| `flanko.tsx` (neu, in `gestalten/`) | Seitenspalte für den ausgewählten Marken-Knoten: Profil vollständig, Teile einzeln übernehmen. |
| `datumoj.ts` | Aufrufe der neuen Routen. |

### Anordnen

1. Größen aller Knoten aus React Flow (`measured`).
2. Kanten: die sichtbaren Kanten der Sitzung. Für einen Knoten ohne Kante eine gedachte Kante seiner Startverdrahtung, damit er in der Spalte seiner Art landet. Gedachte Kanten werden nicht gezeichnet und nicht gespeichert.
3. dagre von links nach rechts (`@dagrejs/dagre`, wie `src/arangxo.ts`); Knoten und Kanten vorher nach Kennung sortiert, damit das Ergebnis fest ist. Abstände aus den gemessenen Größen, keine neue Längenangabe im Code.
4. Alle Plätze in `verschoben`, dann `skribilo.plani()` (ein `PUT`), dann `fitView(ENPASO)`.

`src/arangxo.ts` wird wiederverwendet oder bekommt eine Schwester in `gestalten/`; die Ansicht „Verstehen“ bleibt unverändert.

### Übernehmen mit Stand (E-2)

1. `await skribilo.atendi()`.
2. Trägt das Ergebnis noch kein `gesichert`: `POST /api/marko/:name/staende {name: "vor Übernahme, HH:MM"}`. Bei Fehler: abbrechen, Satz zeigen, nichts schreiben.
3. Die `id` des Stands als `gesichert` ins Ergebnis.
4. Schreiben über den Schreibweg, ein Aufruf je Teil: `{farbe: {rolle: "primaer", wert}}`, `{farbe: {rolle: "akzent", wert}}`, `{neutral: {farbe}}`, `{schrift: {rolle: "display", tiparo}}`, `{schrift: {rolle: "body", tiparo}}`, `{name}`. Beschreibung in `inhalt` von `teksto-grundlagen`.
5. Lehnt der Schreibweg einen Teil ab (422 mit Satz), steht dieser Satz ruhig an dem Teil; die anderen Teile bleiben übernommen.

Ein neues Ergebnis (neu ausgewertet, „Neu“) hat kein `gesichert`; die nächste Übernahme legt wieder einen Stand an.

### Aufbau im Vorschau-Knoten

Zielbild: `attachments/vorschau-knoten-aufbauten.html`.

- **Zustand je Knoten**, gespeichert am Knoten in `leinwand.json`: `ansicht` (`marke` | `komponenten`) und `aufbau` (`auto` | `titel` | `raster` | `liste`). Anders als das Schema (hell | dunkel), das heute nur im Knoten lebt, gehen beide in den gespeicherten Zustand. Das gilt auch für weitere Vorschauen (`vorschau-N`).
- **Wirksamer Aufbau:** `aufbau === "auto"` → der Aufbau aus `aufbauDe(merkmale)` des Layout-Beispiels, ohne Merkmale der erste Aufbau; sonst die Wahl von Hand. Reine Funktion `wirksamerAufbau(knoten, layout)` neben `aufbauDe`, damit Server und Leinwand gleich rechnen.
- **Adresse:** `vorschauHref(…, {ansicht, aufbau: <wirksam>, inh})`. Die Adresse trägt immer den wirksamen Aufbau, nie `auto`. Ein anderer Aufbau ist eine andere Adresse; der Knoten lädt sie mit dem vorhandenen doppelt gepufferten Rahmen (neuer Rahmen per Skript, alter bleibt sichtbar bis `load`). Eine Adresse, die sich während des Ladens wieder ändert, ersetzt den ladenden Rahmen, wie heute.
- **Ansicht „Komponenten“:** Adresse mit `sxtupo=komponenten`, ohne `aufbau` und ohne `inh`. Die Knöpfe der Zeile Aufbau sind `disabled`; `aufbau` am Knoten bleibt unverändert.
- **Klick auf einen Aufbau:** setzt `aufbau` auf diesen Wert (auch wenn er dem vom Layout-Beispiel gewählten entspricht, sobald schon von Hand gewählt war). „wie Layout-Beispiel“ setzt `auto`. Jede Änderung geht über `skribilo.plani()` in den gespeicherten Zustand.
- **Marken für Skripte und Tests:** `[data-nr-vorschau-ansicht=<id>]` mit Knöpfen `[data-nr-ansicht-wahl=marke|komponenten]`; `[data-nr-vorschau-aufbau=<id>]` mit Knöpfen `[data-nr-aufbau=titel|raster|liste]`, `data-nr-aktiva`, und `data-nr-auto` am Knopf des Layout-Beispiels; `[data-nr-vorschau-grund=<id>]`; `[data-nr-aufbau-auto=<id>]` für „wie Layout-Beispiel“. Der Rahmen trägt wie heute `data-nr-href`.
- **Registratur der Vorschauen:** `data-nr-vorschau-rev` an `#nr-leinwand` bleibt, wie es ist (alle verbundenen Vorschauen zeigen dieselbe `rev`). Verschiedene Aufbauten in zwei Knoten ändern daran nichts, weil nur `rev` und `kabloj` verglichen werden.
- **Die Seite selbst** trägt `data-mt-aufbau="titel|raster|liste"` am Wurzelelement, damit ein Test am gerenderten Rahmen sieht, welcher Aufbau gezeigt wird.

### Vorschau lädt neu

Die Seite „Marke“ liest ihre Texte beim Abruf aus `leinwand.json`. Die Adresse trägt deshalb `inh`, den Abdruck dessen, was die Seite zeigt (Name, Beschreibung, Werte, Persönlichkeit, Kernsatz, Leitgedanken, Charakter). Der Knoten setzt `inh` erst, nachdem das zugehörige Schreiben bestätigt ist; dann lädt er wie heute einen neuen Rahmen hinter dem gezeigten. Die Adresse enthält nie Text der Marke.

## Vorschau „Marke“

Neue Datei `vorschau-marke.ts` neben `vorschau-korpo.ts`:

```ts
markeKorpo(inhalt: MarkeInhalt, aufbau: "titel" | "raster" | "liste"): string
```

- Rein; jeder Text der Marke geht durch `escapeHtml`.
- Eroj: `fm-titolo`, `fm-teksto`, `fm-butono` (hohe und mittlere Betonung), `fm-karto`, `fm-insigno`, `fm-kampo`, `fm-avizo`, `fm-ligilo`. Anordnung über eigene Klassen der Vorschau (`mt-…`) mit `var(--fm-*)` und logischen Eigenschaften; kein wörtlicher Wert.
- Band in der Primärfarbe über die vorhandene Rolle `color.brand.fill`. Welche vorhandene Textrolle darauf lesbar ist, prüft der Plan im Vortaro; gibt es keine, trägt das Band keinen Text, und der Satz steht daneben. Das ist dann ein Befund.
- Akzent-Stellen tragen `data-mt-akzent="flaeche" | "marke" | "hervorhebung"` und benutzen nur `--fm-color-sekundo-surface`, `--fm-color-sekundo-illustration`, `--fm-color-sekundo-badge-fill`, `--fm-color-sekundo-badge-text`. Nie an `fm-butono`, `fm-ligilo` oder Fokus (`sekundo-not-action`).
- Die Seite passt sich der Breite des Rahmens an (Container-Abfragen); der Vorschau-Knoten wird für die Ansicht „Marke“ breiter und höher als heute (`KADRO_ALTO`), Maße im Plan nach dem Entwurf.
- `sxtupo=komponenten` ist `previewBody("vorschau", …)` plus eine Marke in den Akzent-Rollen.
- Nach `styling.md`: Ein Schritt sammelt alle `var(--fm-…)`-Namen der neuen Quellen und vergleicht sie im Browser mit den berechneten Werten; ein unbekannter Name ist rot (Vorbild `packages/nodredaktilo/scripts/bilder-056.ts`).
- Die Vorschau ist echte Fundamento-Oberfläche: Überschriften in Ordnung, Feld mit Beschriftung, Tastatur, sichtbarer Fokus.

## Tests

Rot zuerst. Ist ein Test beim ersten Lauf grün, weil ein früheres Ticket schon liefert: je Gruppe von Prüfungen einen Fehler pflanzen, rot sehen, zurücknehmen, in `tasks.md` nennen (`testing.md`). Alle Tests ohne Netz und ohne Modell: `startServilo` mit `ki: {provider: new Provider("mistral", "…", SECRET), fetch: fakeFetch}`.

| AK | Test (Vorschlag) | Art |
|---|---|---|
| AK-2, AK-16 | `leinwand-auswertung-058.test.ts`: Übersicht, `offen`, Abdruck, veraltet, Übernehmen macht nicht veraltet | Vitest, rein |
| AK-2, AK-4 | `ki-lesen-058.test.ts`: lesbar, teilweise unlesbar, ganz unlesbar; Schrift außerhalb des Katalogs; keine Regel filtert | Vitest, rein |
| AK-18 | `aufbau-058.test.ts`: jede Zeile der Zuordnung, Vorrang, Grundsatz | Vitest, rein |
| AK-6 | `ki-zaehler-058.test.ts`: Zähler am `fakeFetch` ist 0 nach Laden, Schreiben von Inhalten, `GET …/ki`, Anordnen; 1 nach genau einem `POST` | Vitest, Server |
| AK-12 | `ki-koerper-058.test.ts`: Körper von Profil und Namen enthält kein `image_url`, keinen Dateinamen, keine Bildadresse; Aufbau enthält genau ein Bild | Vitest, Server |
| AK-8 | `ki-protokoll-058.test.ts`: `stderr` und Kroniko ohne Schlüssel, ohne Bilddaten, ohne Text der Marke | Vitest, Server |
| AK-7 | `eksporto-058.test.ts`: Export mit Layout-Beispiel und genommenen Pinterest-Bildern; kein Name, keine Bytes (wie `beispiele-eksporto-056.test.ts`) | Vitest |
| AK-11 | `uebernehmen-058.test.ts`: ein Stand je Ergebnis; Öffnen des Stands stellt Agordo und Leinwand wieder her | Vitest, Server |
| AK-14 | `grafeo-skribo-058.test.ts`: `{name}` schreibt `etikedoj.marko`; Kennung und Ordner gleich; leer entfernt | Vitest |
| AK-15 | `pinterest-058.test.ts`: erfundene Seite im Aufbau eines öffentlichen Boards (keine echte Kopie); zwölf Bilder; Anmeldeseite, 403, leere Seite → Verweis; Kurzlink über Weiterleitung; Weiterleitung auf fremden Host → Verweis | Vitest, `esploro.fetch`-Double |
| AK-17 | `leinwand-stato-058.test.ts`: neue Inhalte überstehen Schreiben, Lesen, Stand; falsches Feld fällt einzeln weg | Vitest |
| – | `alt-gleich-058.test.ts`: Prüfsummen der alten Antworten (siehe Routen) | Vitest |
| AK-3 | Bilder-Skript: je Aufbau und Schema mindestens drei sichtbare Elemente mit `data-mt-akzent`, deren berechnete Farbe dem berechneten Wert der jeweiligen `--fm-color-sekundo-*` entspricht | Browser |
| AK-19 | `aufbau-wahl-058.test.ts`: `wirksamerAufbau` für `auto` mit und ohne Merkmale und für jede Wahl von Hand; `vorschauHref` trägt nie `auto`; `ansicht` und `aufbau` überstehen Schreiben, Lesen und Stand, auch an `vorschau-N` | Vitest, rein |
| AK-19 | Bilder-Skript: je Knopf der Zeile Aufbau zeigt der Rahmen `data-mt-aufbau` des Knopfs (Zustand des Rahmens von der haltenden Seite gelesen, `expect.poll`, nie `framenavigated`); Punkt am Aufbau des Layout-Beispiels; „wie Layout-Beispiel“ gibt zurück; in „Komponenten“ sind die Knöpfe `disabled`; zwei Knoten zeigen zwei Aufbauten; nach `location.reload()` dieselbe Wahl | Browser |
| AK-5 | Bilder-Skript: nach „Anordnen“ mit allen wählbaren Knoten überdeckt keine Box eine andere; nach Neuladen dieselben Plätze | Browser |
| AK-1, AK-13 | Bilder-Skript: der Hauptweg der Abnahme mit Doubles; Wechsel über „Marken“ | Browser |
| AK-9 | Diff-Suche als Skript unter `specs/058-marke-auswerten/` | Skript |

**Bilder-Skript** `packages/nodredaktilo/scripts/bilder-058.ts` nach dem Vorbild von `bilder-056.ts`: startet die gebaute `fm metiejo` mit temporärem Arbeitsordner, sperrt alle äußeren Anfragen, schreibt die Bilder nach `.fundamento/spec058/bilder/` (außerhalb des Repos). Der eine echte Durchlauf ist ein eigener Schalter des Skripts und läuft nur mit eingerichtetem Schlüssel.

Bilder: `01-neue-marke`, `02-grundlagen`, `03-uebersicht-ohne-ki`, `04-pinterest-vorschau`, `05-layout-beispiel`, `06-markenprofil`, `07-vorschlag-uebernommen`, `08-marke-titel-hell`, `09-marke-titel-dunkel`, `10-marke-raster`, `11-marke-liste`, `12-komponenten-akzent`, `13-namen-und-beschreibung`, `14-angeordnet`, `15-ohne-schluessel`, `16-zwei-aufbauten-nebeneinander`. Die Bilder 08 bis 11 entstehen durch Umschalten im Knoten, nicht durch eine direkt geöffnete Adresse.

**Vor dem Push**, auf dem letzten Commit:

1. `pnpm --filter @fundamento/nodredaktilo build` (direkt, nicht nur über Turbo).
2. Die fünf Browser-Tests aus B-18 in Chromium, nacheinander.
3. `FM_AUSGABE=knapp pnpm test:betroffen`, `pnpm lint`.

Ein älterer Test wird nur geändert, wo das neue Verhalten es erzwingt; jede Zeile steht in `tasks.md` und im PR-Text.

## Tickets und Dateien

Ein Strang, in dieser Reihenfolge. Jedes Ticket nennt die Dateien, die es anfasst.

| # | Dateien (Schwerpunkt) | Hängt ab von |
|---|---|---|
| T1 | `grafeo-gestalten-sicht.ts` (Typen, Kennungen, `ARANGXO_058`, Option), `leinwand-enhavo.ts`, `leinwand-stato.ts`, `leinwand-auswertung.ts` (neu), Tests | – |
| T2 | `gestalten/kanvaso.tsx`, `gestalten/kapo.tsx`, Anordnung | T1 |
| T3 | `servilo.ts` (`GET /api/marken`), `gestalten/kapo.tsx`, `gestalten/datumoj.ts` | T2 (gleiche Datei `kapo.tsx`) |
| T4 | `grafeo-skribo.ts` (`name`), `nodoj/grundlagen.tsx`, `nodoj/marko.tsx` (Name), `kapo.tsx` (Name) | T1, T3 |
| T5 | `servilo.ts` (`GET …/ki`, `POST …/ki/namen`), `nodoj/ki-namen.tsx`, `menuo.tsx` | T1, T4 |
| T6 | `nodoj/marko.tsx` (Übersicht) | T1, T4 |
| T7 | `servilo.ts` (`POST …/ki/profil`), `nodoj/marko.tsx` (Profil), `gestalten/flanko.tsx` (neu), Übernehmen mit Stand | T5, T6 |
| T8 | `beispiele-vojoj.ts`, `nodoj/beispiele.tsx` | T1 |
| T9 | `servilo.ts` (Layout-Routen, `POST …/ki/aufbau`, Vorschau-Kennungen), `vorschau-marke.ts` (neu), `vorschau-korpo.ts` (nur neue Kennung `komponenten`), `nodoj/layout-beispiel.tsx`, `nodoj/vorschau.tsx` | T1, T7 |
| T10 | `scripts/bilder-058.ts`, `specs/058-marke-auswerten/**`, PR, Dispatch, Bericht | alle |

`servilo.ts`, `kapo.tsx` und `nodoj/marko.tsx` werden von mehreren Tickets berührt. Deshalb ein Strang und keine parallelen Tickets (`delivery.md`).

## Risiken

| # | Risiko | Umgang |
|---|---|---|
| R-1 | Das eingerichtete Modell liest keine Bilder. | Rückfall mit Satz; der Aufbau bleibt wählbar; der Bericht nennt Modell und Ergebnis. |
| R-2 | Pinterest ändert die Seite oder verlangt eine Anmeldung. | Der Verweis ist der feste Rückfall; Tests gegen eine erfundene Seite; der Bericht nennt, was der echte Abruf liefert. |
| R-3 | Ohne Zweitfarbe sind die Akzent-Stellen grau (B-3). | So verlangt („abgeleiteter Stand“); als offener Punkt beim Maintainer. |
| R-4 | Kroniko ohne passenden `ago`-Wert (B-5). | Empfehlung und Rückfall oben; Folgeauftrag für das Modelo. |
| R-5 | Drei Aufbauten in hell und dunkel plus vier Knoten sind viel für T9. | T9 baut zuerst einen Aufbau ganz, dann die zwei weiteren als Varianten derselben Bausteine. Reicht die Zeit nicht, stoppt das Ticket und berichtet (`delivery.md`: 2 Stunden oder 300 Aufrufe). |
| R-6 | Turbo spielt ein altes Bündel der Leinwand zurück, wenn nur Dateien unter `packages/metiejo/src` geändert sind. | Vor jedem Browser-Lauf direkt bauen (`testing.md`). |
| R-7 | Der PR-Lauf prüft nur betroffene Pakete (Lehre aus #168). | Browser-Tests vor dem Push lokal; gemergt wird erst nach dem vollen Lauf. |

## Nachtrag: Entscheidungen der Umsetzung

Bis hierher ist diese Datei byte-gleich mit der technischen Spec (35 953 Byte, SHA-256 `8ed267a92c85b6756ab59222ba4e9dda6596dcf37fd213701f775e0cbf9be35d`). Es folgen die Entscheidungen D-1 bis D-9 des Implementierungsplans wörtlich (Abschnitt 0, „Plan decisions“; Verträge unverändert). Die Verfeinerungen der Verträge aus T1 (MAW-1.1) stehen in `tasks.md`, Abschnitt MAW-1.1.

### Plan decisions (deviations from the technical spec, contracts unchanged)

- **D-1 Shell first, so tickets can run in parallel** (`delivery.md` „Shared UI shell first“). MAW-1.1 also builds the **server shell**:
  - one registration line `VOJOJ_058` with four stub route modules;
  - a `ki` capability on `VojoKunteksto`;
  - the `sxtupo=marke|komponenten` dispatch to stub functions in `vorschau-marke.ts`.

  MAW-2.1 builds the **canvas shell**: context contract, node registry with placeholder components, header slots, side-panel slot, and the session/persistence of all new node data. After MAW-1.1, `servilo.ts` and `grafeo-gestalten-sicht.ts` are **frozen**. After MAW-2.1, `kanvaso.tsx`, `kunteksto.ts`, `stato.ts`, `kapo.tsx`, `menuo.tsx`, `roloj.ts`, `sxelo.tsx` and `gestalten/datumoj.ts` are frozen. If a ticket needs a change in a frozen file, it reports the change to the orchestrator and does not make it.
- **D-2 Dependencies differ from the technical spec's table** (it serialised everything because files were shared; the shell removes the sharing):
  - T4 no longer edits `marko.tsx` or `kapo.tsx`. The shell provides the live name.
  - The Marke node is split into slot files, so T6 (overview) and T7 (profile) own different files. T7 depends on T5 (KI infrastructure), not on T6.
  - T9 depends on T5 (KI infrastructure), not on T7.
  - `pinterestVorschauDe` moves from T1 to T8, which is its only user.
- **D-3 Kroniko `ago`.** Use `ago: "propono"`, `fonto: "agento"`, `detaloj.zweck: "leinwand-profil|leinwand-namen|leinwand-aufbau"`, no `faceto`, no `teksto`. Why this is safe:
  - Readers checked at `0f9ada50`: `servilo.ts:2597` filters `propono` **by `faceto`**; `asistanto/stato.ts:161–169` reads only `kreo`, `sxangxo`, `akcepto`, `liberigo` and `remalfermo`; `takso/takso.ts:94` (`mezurojOf`) reads only `babilo`; `zaehlilo` counts every entry that has a `kosto`.
  - `fonto` enum contains `agento` (`modelo.schema.json:5022`).

  MAW-3.3 re-confirms this before writing. If a reader breaks, use the technical spec's fallback (`babilo`/`agento`) and record it as a finding.
- **D-4 Pinterest thumbnails load directly from `i.pinimg.com`** in the browser (`referrerpolicy="no-referrer"`, `loading="lazy"`). There is no pass-through route: the canvas page sends no CSP. The only CSP is on `/marko/:name/materialo/*` (`servilo.ts:3330`).
- **D-5 Band text role.** The Vortaro has `color.brand.text` beside `color.brand.fill`, so the primary band may carry text. This resolves the technical spec's open check.
- **D-6 Temperatures** (left open by the technical spec): profile 0.2, layout 0.1 (as `esploro`), names 0.8. No `timeout`, budget, retry or limit is passed beyond what `esploro/esploro.ts:249` passes today.
- **D-7 Documentation in the repo:**
  - MAW-1.1 creates `specs/058-marke-auswerten/plan.md` (byte copy of the technical spec plus a „Nachtrag“ listing D-1…D-9) and `tasks.md` (one section per ticket).
  - **Each ticket edits only its own section of `tasks.md`.** That section holds: planted faults, edited older tests (file:line, before/after, reason), PR-text lines, findings.
  - MAW-5.1 creates `spec.md` (`cmp`-equal copy of the product spec) and `bericht.md`.
- **D-8 Layout default and node design:** default layout `titel`. Marken-Knoten = mockup option B („Tafel“: the overview at the top, then the profile, then the „Gestaltungsvorschlag“ with per-part „übernehmen“, „Marke auswerten“ with price, and a side panel „Markenprofil · Einzelheiten“).
- **D-9 Ticket count.** The spec allows 10 tickets in one strand, overriding the 8-ticket cap in `delivery.md`. The longest chain (1.1 → 2.1 → 3.3 → 4.x → 5.1) is five tickets deep, which the spec explicitly allows.
