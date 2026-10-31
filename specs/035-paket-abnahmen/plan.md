# Spec 035 – Paket nach den Abnahmen vom 30.10. – Plan

**Spec:** [`spec.md`](spec.md) (Fassung vom 2026-10-30, 23:00, unverändert kopiert; SHA-256 `472d2c443219a5b0c07945756386bd7d88e6a4d8db55ddd652143146f6be264a`) · **Basis:** `main` `367b7a52` (nach #115, #117–#122, #124; am Ende des Laufs unverändert) · **Regel 0** gilt: der Weg, den das Repo schon geht, sonst die kleinste Änderung mit Eintrag hier. **Keine Budgets und keine Grenzen angehoben. Nichts gemergt.**

**Datum:** 2026-10-31 · **Stand:** Lauf abgeschlossen. Sieben PRs offen, keiner gemergt, keiner Entwurf, alle mergeable; CI auf jedem Code-Head grün (zwei Neustarts nach R-8, beide grün). Alle 25 Befunde der Spec erledigt (die Sichtprüfung im Figma-Plugin bleibt Abnahme des Maintainers); fünf neue Befunde offen. Geprüft gegen AC-1 bis AC-11 (Bericht › Prüfung gegen die Abnahmekriterien): zehn erfüllt, AC-4 teilweise (B-6.1-1). Modellkosten 0,18296 $ von 0,50 $, nur `ministral-14b-2512`. Alle Entscheidungen angewandt und vom Maintainer zu bestätigen. Bericht am Ende.

**Ablage (D-01):** `spec.md`, `plan.md` und `tasks.md` liegen nur auf dem Branch von Teil 1 (#126). Die übrigen PRs verlinken auf diesen plan. Jedes Ticket der Nacht schrieb seinen Beitrag in eine eigene Datei außerhalb des Repos; dieser Doku-Commit führt sie zusammen.

### Branches und PRs

Alle neuen Branches von `367b7a52`, je Branch ein eigener Worktree unter `/tmp/s035-*` (Muster aus Spec 034 D-01). Der unveränderte, gebaute Worktree `/tmp/s035-main` (`367b7a52`) war der Bezug für jede Messung „vorher“.

| Teil | PR | Branch | Basis | Head | Befunde |
|---|---|---|---|---|---|
| 1 | [#125](https://github.com/thojank/fundamento/pull/125) | `261030-ableitung-kalibriert` (neu aufgesetzt) | `main` | `016997b6` | 1.1 |
| 1 | [#126](https://github.com/thojank/fundamento/pull/126) „Spec 035 Teil 1 – Prüfungen verlässlich“ | `261030-spec-035-t1-pruefungen` | `main` | `02fe48e6` (Code) + Doku-Commits | 1.2, 1.3, `specs/035-paket-abnahmen/` |
| 2 | [#123](https://github.com/thojank/fundamento/pull/123) | `261029-spec-029-2b1b-status` (neu aufgesetzt) | `main` | `fe98ef35` | 2.1, 2.2 |
| 2 | [#130](https://github.com/thojank/fundamento/pull/130) „Spec 035 Teil 2 – Figma-Befunde (gestapelt auf #123)“ | `261030-spec-035-t2-figma` | `261029-spec-029-2b1b-status` (D-08) | `58c92a70` | 2.3.1–2.3.4 |
| 3 | [#128](https://github.com/thojank/fundamento/pull/128) „Spec 035 Teil 3 – Studio“ | `261030-spec-035-t3-studio` | `main` | `21580cb4` | 3.1–3.4 |
| 4a | [#127](https://github.com/thojank/fundamento/pull/127) „Spec 035 Teil 4a – Markenassistent: Recherche und Bilder“ | `261030-spec-035-t4a-markenassistent` | `main` | `0516d45a` | 4.1, 4.5.6, Skript 4.7 Weg C |
| 4b | [#129](https://github.com/thojank/fundamento/pull/129) „Spec 035 Teil 4b – Markenassistent: Ablauf und Darstellung“ | `261030-spec-035-t4b-markenassistent` | `main` | `7a52ae0e` | 4.2–4.4, 4.5.1–4.5.5, 4.6 |

Weitere Worktrees (nur gelesen oder gemessen): `/tmp/s035-k` (losgelöst `fe98ef35`, Reihe K), `/tmp/s035-vor122` (losgelöst `013f2e59`, erster Elternteil des Merges von #122, AK-07-Profil „vor #122“).

## Zusammenfassung je Teil

### Teil 1 – Prüfungen verlässlich (#125, #126)

- **1.1 #125:** auf `367b7a52` neu aufgesetzt (rot `0a409843`, grün `4a2fa096`, inhaltlich zeilengleich mit den Originalen). Zwei Kalibrierketten in der CI, 16 Versuche auf einem Head. Klassen nach der Ableitung: 5 schnelle, 5 mittlere, 6 langsame Runner. **Bezugswert 41,5 ms** (Median der Referenz der schnellen Runner, vorher vorläufig 50 ms) aus der committeten Tabelle `packages/eroj/test/ableitung-kalibrierung.tsv`, an einen Test gebunden (rot `fe06ff4f` „Expected 41.5 / Received 50“, grün `016997b6`). Grenze 150 ms unverändert; die Änderung ist für Runner mit Referenz über 41,5 ms lockerer, nirgends strenger. Gegenprobe mit dem neuen Wert rot auf einem langsamen (180,4 ms) und einem schnellen Runner (179,0 ms). Hinweis zur Verteilung des Spielraums: B-5.1-1.
- **1.2 M5 Gegenprobe 2:** Die Kalibrierung misst jeden Stand als Median aus fünf Umschaltungen (eine erste, die neue Elemente auslegt, zählt nicht), gilt erst als gehalten, wenn drei solche Mediane in Folge 80 ms erreichen, und wächst sonst um ein Viertel; feste Obergrenze 1 024 000 Elemente mit Meldung (Elemente, ms, Runner). Rot `0c7a4945` auf zwei nachgespielten Läufern („wie #115“: 16 000 Elemente, 71,8 ms; „CPU gedrosselt ×4“: 2 000 Elemente, 22,9 ms) und mit CDP-Drosselung im echten Chromium; grün `5f9bb4f6`. M5 50 ms, Probe 80 ms, Timeout 300 000 ms unverändert.
- **1.3 AK-07:** Ursache: #122 bringt Daten (Kern-Tokens 1608 → 1664, größere Skemoj und Marken-Sets), keinen neuen langsamen Code; der Start wächst gleichmäßig um 2–4,5 %. Behoben über zwei Kosten, die mit dem Modelo wachsen und die #123 schon behoben hatte (D-06): drei Ajv-Instanzen übersetzten gemeinsame Schema-Teile je neu, und die geteilten Auflösungen der Validierung kopierten jeden Wert (`cloneValue` 1 631 528 → 33 200 Aufrufe je Start). Rot `379c002b`, grün `02fe48e6` (acht Dateien byte-gleich mit `2537e469`, auf #123 neu aufgesetzt `b298aa83`). **In Ruhe: Teil 1 1744 ms gegen `main` 1901 ms, 8 von 8 Paaren schneller, Ziel ≤ 1900 ms erreicht.** Budget 2000 ms unverändert.

### Teil 2 – Felder (#123, #130)

- **2.1 #123 neu aufgesetzt:** die fünf Commits auf `367b7a52` (rot `a5bc2be5`, grün `2314e8b5`, rot `d095cc1e`, Typtests `ce0cb0fb`, grün `b298aa83`), Konflikte zugunsten der Abnahme von #122 gelöst, rote Commits auf neuem Elternteil erneut rot. **Nachtrag 30.10. (Reihenfolge laut `trailing`):** im Feldrand von innen nach außen Status-Icon → Spinner → ✕ → Feld-Icon, in Web und Figma aus dem `trailing` des Skemo erzeugt (rot `2826f1da`, grün `ad0dd6ad`). Kein Bild der Figma-Sets ändert sich (Nachweis im Abschnitt Bildtests). Status-Icon nur am `kampo` (D-47).
- **2.2 Sichtbare Beschriftung:** Die Beschriftungs-Commits von #123 deckten das meiste schon (Skemo `shown`, Browser, Kurzprofil, Ausgabeschema). Drei Lücken geschlossen: check_usage meldete bei `label="…"` neben leerem Elementtext fälschlich `field-label-visible` und `placeholder-not-label`, die Aussage der Regel nannte nur den Slot (rot `35ad207c`, grün `57ab8ba7`); der Prompt des Gvidanto sagte nichts zur Beschriftung (rot `705fd5c8`, grün `c3fae550`); CHANGELOG (rot `3cffb3dd`, grün `fe98ef35`). Kurzprofil `kampo` 740 Tokens (< 750). **D-04:** `label` ist eine additive Prop, keine Bedeutungsänderung einer Prop von 0.2.0. **AC-10:** bestehende Nutzungen pixelgleich, 180/180 und 182/182 PNG byte-gleich. **Reihe K:** F 83,9 gegen 0 33,3 (Bezug K 76,0), K4 0,56 → 0,85.
- **2.3.1–2.3.4 Figma (#130, gestapelt auf #123):** Kalender des `datelektilo` so groß wie der Pfeil des `elektilo` und gefüllt (in Figma war der Glyph ungebunden und der Vektor ohne Füllung); ✕ des `datelektilo` wie das des `kampo`; Kästchen von `markobutono` und `sxaltilo` in Figma links (`elekto` war richtig); schreibgeschützt sieht in allen zwölf Feldern aus wie die Ruhe (V-1, die Fonto ist einheitlich). Je Befund rot und grün in Web und Figma-Double, ein Bildtest-Commit (2.3.1). CI rot an einer Zählung beratender APCA-Hinweise (kein Zeittest), im Branch behoben (`58c92a70`).

### Teil 3 – Studio (#128)

- **3.1** Formular-`POST` an die Studio-Seite (und an Komponentenseiten) geht durch `festlegen`, 303 zurück mit Rückmeldung; Enter, „Übernehmen“ und ein geändertes Bedienelement sind dieselbe Sendung. **3.2** Die Seite kommt nach jeder Änderung vom Server, Zeile und Farbfeld zeigen einen Stand. **3.3** Ablehnung am Feld mit Regel und Vorschlag. **3.4** Abgleich Studio → Assistent über `rev` mit zwei Seiten belegt (grün beim ersten Lauf, keine Codeänderung). Browsertests in Chromium, Firefox, WebKit (24/24).

### Teil 4 – Markenassistent (#127 = 4a, #129 = 4b)

- **4a (4.1, 4.5.6):** Weg C rendert jede gelesene Seite in einem optionalen, erst bei Bedarf geladenen Chromium und misst nach Fläche wie Weg B (Logo 4, erster Bildschirm 2, darunter 1; CSS 10 %). Blockierte Seite → ein Satz, keine Farben; ohne Browser → CSS wie bisher und ein Satz. JPG/JPEG und WebP in Material und Inspiration, dekodiert über denselben Browser. Playwright 1.63.0 als `optionalDependencies` (Abschnitt Abhängigkeiten); der Start des MCP-Servers lädt es nicht (Wächtertest, AK-07 in Ruhe unverändert).
- **4b (4.2–4.4, 4.5.1–4.5.5, 4.6):** Weg A schlägt einen Akzent mit Herkunft vor (nicht gesetzt, D-80); Form „Pille“ über Regler und Chat, Stufen 0 · 0,5 · 1 · 2 · Pille, ehrliche Antwort am Reglerende; „Freigeben“ nach einer Änderung im Chat ohne Neuladen; Vorschläge zeigen Farbfläche, Ausschnitt, Vorher/Nachher in einem Satz; Leiste mit Zustand je Schritt und Umbruch; Markdown sicher über `fm-markdovido`; gleiche Warnungen als eine Meldung; Platzhalter „Quendolin“. Drei Skizzen (4.6) unten.
- **4.7 Messung:** Weg C mit Modell trifft die prägende Farbe der synthetischen Seite (1 402 Tokens, 0,00028 $), Weg A 100 % freigegeben und exportierbar (8 113 Tokens, 0,00162 $).

### Über alle Teile

- CI: sieben PRs, auf jedem Code-Head grün. Zwei R-8-Neustarts (#126, #128, je M5 roh 151,6 bzw. 151,4 ms auf einem langsamen Runner – genau der Fall, den #125 behebt), beide grün. Kein dritter Versuch.
- `main` unverändert (`367b7a52`). Merge-Simulation in der Reihenfolge #125 → #126 → #123 → #130 → #128 → #127 → #129: ein Konflikt, am Dateiende von `packages/eroj/test/vitrino.check.ts` zwischen #123 und #125 (beide Blöcke behalten).
- Modellkosten 0,18296 $ (Reihe K 0,18106 $, Weg A 0,00162 $, Weg C 0,00028 $).

## Entscheidungen, vom Maintainer zu bestätigen

Der Lauf war unbeaufsichtigt (R-1). Wo die Spec offen ließ, galt der Vorschlag. „angewandt“ = so umgesetzt; **zu bestätigen** = von den Tickets ausdrücklich zur Bestätigung gestellt; **zu entscheiden** = neue Frage ohne Umsetzung. Alle Einträge sind vom Maintainer zu bestätigen.

### Vorschläge der Spec (V-1 bis V-3) und des Auftrags (D-01 bis D-14)

| ID | Frage | Vorschlag | Ergebnis im Lauf | Stand |
|---|---|---|---|---|
| V-1 | 2.3.4 Schreibgeschützt: welche Füllung? | Eine Regel für alle Felder: wie die Fonto; ist sie dort uneinheitlich, wie `kampo`. | Die Fonto ist einheitlich: ihre drei Felder mit Schreibschutz zeichnen ihn wie die Ruhe (Fläche, Rand, Schrift, Beschriftung), ihr Datumsfeld hat keinen. Regel „schreibgeschützt = Ruhe“ für alle zwölf Felder (#130 `5da4d081` → `363f881f`, D-61). | angewandt |
| V-2 | 4.1 Wie findet Weg C die Farben einer Marke? | Weg C rendert jede gelesene Seite lokal als Bild (Playwright/Chromium, nur auf dem Rechner des Nutzers) und misst wie Weg B nach Fläche, mit mehr Gewicht für Logo und den oberen Bildschirm; CSS-Werte nur ergänzend. Blockiert eine Seite den Abruf, sagt der Assistent das in einem Satz. | Umgesetzt in #127 (`7cc4740e` → `e892938c`): Ansicht 1280 × 800, höchstens drei Bildschirme, Gewicht Logo 4, erster Bildschirm 2, darunter 1, CSS 10 % (D-73); Erkennung blockierter Seiten (D-74); ohne Browser CSS wie bisher plus ein Satz. | angewandt |
| V-3 | 4.3 Form „ganz rund“ und Stufen | Die Form bekommt für Bedienelemente eine Wahl „Pille“, erreichbar über Regler und Chat; Karten und Flächen bleiben begrenzt. Ein relativer Wunsch ändert sichtbar, mindestens eine Stufe (Größe hier festgelegt). | „Pille“ als Wahl `form.bedienelemente`, gespeichert wie „ganz rund“ des Schnellstarts (D-82); **Stufen 0 · 0,5 · 1 · 2 · Pille**, jede halbiert bzw. verdoppelt den Radius der Bedienelemente (D-83); Werkstatt-Regler einen Schritt über 2 = Pille (D-84); Karten `radius.role.surface` begrenzt. | angewandt |
| D-01 | Wo liegen spec, plan, tasks? | `specs/035-paket-abnahmen/` nur im PR von Teil 1; die übrigen PRs verlinken; Beiträge zuerst je Ticket außerhalb des Repos, ein Doku-Commit führt sie zusammen. | So gemacht: Gerüst `85bc9fef`, Zusammenführung `01d3c2a3` (PAK-5.2); jeder andere PR-Text verlinkt diesen plan. | angewandt |
| D-02 | 4.5.3 Wie zeigt der Chat Antworten des Modells? | Sicher darstellen: ein kleiner Markdown-Teil als Text-Knoten, kein `innerHTML` mit Modellausgabe. | Über das vorhandene Ero `fm-markdovido` (baut nur mit `createElement`/`createTextNode`), nur für Antworten des Assistenten (D-88). | angewandt |
| D-03 | Reihenfolge bei knappem Budget | 4.7 Weg C → 4.7 Weg A → 2.2 Reihe K. | Weg C 00:11 UTC, Weg A 00:12 UTC, Reihe K ab 00:44 UTC; die Reservierungen von 4.7 standen vor K im Ledger. Das Budget wurde nicht knapp. | angewandt |
| D-04 | 2.2 Bedeutung von `label`, Arkitekturo-Vertrag (Props von 0.2.0), Changeset/CHANGELOG | Bevorzugt ohne Bedeutungswandel; sonst Hinweis im CHANGELOG nach dem Verfahren des Repos. | Ermittelt: „## 0.2.0“ entstand in `7aa400a8`; dort hatte kein Feld eine Prop `label`, `a11y.name` war überall nur `slot:label`, ein Attribut `label` hatte an einem Feld keine Wirkung. **Wahl: keine Bedeutungsänderung einer Prop von 0.2.0; `label` ist eine additive Prop.** Kein `.changeset/` im Repo, deshalb wie bei `flags` (#123): roter Doku-Test, dann `CHANGELOG.md` „Unveröffentlicht“ › „Hinweis für Nutzer“ mit dem Satz: „Wer `label` bisher als nicht deklariertes Attribut an ein Feld schrieb (in 0.2.0 ohne Wirkung, in HTML wie in React), sieht diesen Text jetzt als Beschriftung, solange das Element keinen eigenen Text hat; wer das nicht will, entfernt das Attribut.“ (#123 `3cffb3dd` → `fe98ef35`). Bestehende Nutzungen ohne `label` pixelgleich (AC-10: 180/180, 182/182). | angewandt, **zu bestätigen** |
| D-05 | Modellkosten und Umfang von Reihe K | Listenpreis aus `prezoj.json` (0,20 $ je 1 Mio. Tokens ein und aus); Reihe K einmal mit `--varianten F,0 --ripetoj 1`, `--max-tokens` auf den Restbetrag; Läufe von 4.7 zuerst reserviert. | Preis am 31.10. auf docs.mistral.ai bestätigt. Reservierung 0,20 $ → `--max-tokens 1000000`. Lauf `20261031-0044` aus `/tmp/s035-k` (`fe98ef35`): 97 Anfragen, 853 095 / 52 211 Tokens (905 306, die Grenze griff nicht), **0,18106 $**, 5,7 min. Eine Wiederholung; die Streuung von Spec 034 (16,7) gilt. | angewandt |
| D-06 | 1.3 AK-07 und #123 | Ist die Ursache die, die #123 behebt, übernimmt Teil 1 diese Stellen byte-gleich; #123 lässt sie unverändert. | Gleiche Ursache. Acht Dateien aus `2537e469` (auf #123 neu aufgesetzt: `b298aa83`): `packages/modelo/src/contracts/ajv.ts`, `config/read-config.ts`, `ids/lock.ts`, `validate/validate-modelo.ts`, `validate/resolutions.ts`, `resolve/resolve.ts`, `packages/mcp/src/schemas.ts`, `packages/agordilo/src/agordo.ts`. Von PAK-5.2 geprüft: in `02fe48e6` (#126), `b298aa83` und `fe98ef35` (#123) und `58c92a70` (#130) byte-gleich. | angewandt |
| D-07 | `spec.md` wortgleich gegen R-7 und R-12 | AC-1 geht für diese eine Datei vor; alles andere bleibt frei von echten Marken und dem Wort aus R-12, echte Marken heißen „Marke 1“, „Marke 2“. | `pruefen` nimmt nur `specs/035-paket-abnahmen/spec.md` von der Marken- und R-12-Regel aus (nie von der Schlüsselregel); jeder Commit, Push und PR-Text der Nacht wurde damit geprüft. | angewandt |
| D-08 | 2.3 eigener PR oder in #123? | Eigener PR, gestapelt auf #123. | #130, Basis `261029-spec-029-2b1b-status`, vom #123-Stand nach 2.1 (`ad0dd6ad`), vor dem Push auf `fe98ef35` neu aufgesetzt (ohne Konflikt). Erst #123 mergen, dann springt die Basis von #130 auf `main`. | angewandt |
| D-09 | AC-10 Bildgleichheit | Web: Geometrie- und DOM-Tests committet, Pixelgleichheit als reproduzierbarer Vergleich zweier Commits; Figma über den committeten Bildtest; keine PNG-Referenzbilder in der CI. | Vergleich mit Chromium 153.0.8010.12, `cmp` auf PNG (Messungen › AC-10); Figma über `plugin-bauformen-bild.test.ts` und das ganze Bild der Sets (`FM_BILD_BASIS=1`). | angewandt |
| D-10 | Teil 4 in zwei PRs | 4a: 4.1, 4.5.6; 4b: 4.2–4.4, 4.5.1–4.5.5, 4.6. | #127 und #129, keine gemeinsame Zeile; Überschneidung nur in `servilo.ts` und `asistanto/ekrano.ts` (konfliktfrei). | angewandt |
| D-11 | 4.5.6 JPG und WebP dekodieren | Über denselben optionalen Browser; ohne Browser angenommen, gespeichert, ein Satz. | Chromium dekodiert (Canvas → PNG → eigener PNG-Decoder), kein Decoder in JavaScript, keine zweite Abhängigkeit; ohne Browser gespeichert mit einem Satz; Größenlimits unverändert (#127 `4f90b98a` → `e975e337`). | angewandt |
| D-12 | 4.1 Tests von Weg C ohne Browser im Metiejo-Job | Attrappen für Renderer und Lader in der Metiejo; echtes Chromium in der Eroj-Suite. | Metiejo-Vitest mit Renderer- und Decoder-Attrappen und scheiterndem Lader; echtes Chromium in `packages/eroj/test/weg-c.spec.ts` (startet sein Chromium über die Metiejo, kein `test.skip`). | angewandt |
| D-13 | 1.1 Bezugswert von #125 | Aus einer committeten Kalibriertabelle (Median der schnellen Runner), an einen Test gebunden, rot zuerst; Grenze 150 ms bleibt. | `packages/eroj/test/ableitung-kalibrierung.tsv` (16 Versuche), Bezugswert 41,5 ms (rot `fe06ff4f`, grün `016997b6`). Zur Verteilung des Spielraums: B-5.1-1, D-109. | angewandt |
| D-14 | 4.6 Drei Skizzen | Als Beschreibung in diesem plan, keine Vitrino-Seite. | Abschnitt „Drei Skizzen“. | angewandt |

### Entscheidungen aus dem Lauf (D-15 ff.)

Die Tickets vergaben vorläufige IDs `D-<Ticket>-<n>`. Hier sind sie in Ticketreihenfolge (PAK-0.1 → 1.1 → 1.2 → 1.3 → 2.1 → 2.2 → 2.3 → 2.4 → 3.1 → 4.1 → 4.2 → 4.3 → 4.4 → 5.1 → 5.2 → 6.1) als D-15 ff. nummeriert; die Spalte „vorläufig“ ist die Zuordnung. Die Befunde B-5.1-1 bis B-5.1-3 und B-6.1-1 sind Befunde, keine Entscheidungen (Bericht › Neue Befunde).

| ID | vorläufig | Frage | Wahl und Grund | gilt in | Stand |
|---|---|---|---|---|---|
| D-15 | D-PAK-0.1-1 | Fehltreffer der Schlüsselmuster in Code und Prosa | Die Muster gelten in `pruefen` nur an einer Wortgrenze; Platzhalter nach `Bearer` (`${…}`, `$VAR`, `<…>`) sind kein Treffer. `filtern` bleibt streng. Sonst hätte jede Zeile mit einem Bearer-Platzhalter jeden Commit blockiert. | Schutzwerkzeug (außerhalb des Repos) | angewandt |
| D-16 | D-PAK-0.1-2 | Attrappen mit `sk-`-Präfix in bestehenden Metiejo-Tests | In Testdateien (`*.test.ts`, `*.spec.ts`, `*.check.ts`, `test/`, `test-doubles/`, `fixtures/`) ist ein Muster- oder Variablen-Treffer, dessen Wert „geheim“, „test“, „fake“, „dummy“, „attrappe“, „beispiel“ oder „example“ enthält, nur ein Hinweis. Bekannte Werte aus `.env` und `gh auth token` und Produktionscode sind nie ausgenommen. Weicht vom Vertrag des Werkzeugs ab. | Schutzwerkzeug | angewandt, **zu bestätigen** |
| D-17 | D-PAK-0.1-3 | Was ist „Variable mit Wert“? | Die geschützten Namen aus `$M/.env` und jeder Name auf `_KEY`, `_TOKEN`, `_SECRET` sowie `FM_TIPAROJ_REPO`, gefolgt von `=` und einem Wert; leer, `$X`, `<…>` und `…` sind kein Wert. Trifft `.env`-Zeilen und Shell, nicht Konstanten im Code. | Schutzwerkzeug | angewandt |
| D-18 | D-PAK-0.1-4 | Inhalt der lokalen Markenliste | Die echten Marken aus Spec und Befunden und der Messwert der Farbe einer echten Marke (AC-6); nur unter `$M/.fundamento/spec035/marken/namen.txt` (Rechte 600); ein Treffer nennt nur die Zeilennummer. | Schutzwerkzeug | angewandt |
| D-19 | D-PAK-0.1-5 | `pruefen --diff` über das Ergebnis oder je Commit? | Je Commit der Spanne, dazu Pfade und Nachrichten; ein Schlüssel, der kommt und wieder geht, bliebe sonst in der Historie. | Schutzwerkzeug | angewandt |
| D-20 | D-PAK-0.1-6 | Die eingestellte Git-Identität des Maintainers enthält das Wort aus R-12 in der E-Mail-Adresse (wie 904 von 941 Commits auf `main`). | Unverändert; `pruefen` prüft Autor und Committer nicht. Es ist die eigene Identität des Maintainers, keine hinzugefügte Zeile; eine fremde Identität wäre eine Konfigurationsänderung ohne Zustimmung. | alle Commits der Nacht | angewandt, **zu bestätigen** |
| D-21 | D-PAK-0.1-7 | Zählweise des Kosten-Ledgers | Ganze Mikro-Dollar; belegt = gebucht + offen reserviert; eine Buchung ersetzt die Reservierung derselben Lauf-ID; Buchung ohne Reservierung mit Warnung. | `kosten.tsv` | angewandt |
| D-22 | D-PAK-1.1-1 | Der Branch von #125 war in einem alten Worktree ausgecheckt. | Alten Worktree auf `c698cc08` losgelöst (Dateien unverändert), dann `/tmp/s035-125` angelegt; kein Doppel-Checkout mit `--force`. | Arbeitsplatz | angewandt |
| D-23 | D-PAK-1.1-2 | Konflikt am Ende von `vitrino.check.ts` beim Neuaufsetzen von #125 | Beide Seiten behalten: Stand von `367b7a52` zuerst, der Block von #125 dahinter; der rote Commit bleibt zeilengleich mit dem Original. | #125 | angewandt |
| D-24 | D-PAK-1.1-3 | Zehn Versuche trotz `cancel-in-progress` | Zwei Ketten auf demselben Head, je strikt nacheinander: Neustarts des Jobs im PR-Lauf 41140136538 (10 Versuche) und ein `workflow_dispatch`-Lauf 41140304922 (eigene Concurrency-Gruppe, 6 Versuche). | #125 | angewandt |
| D-25 | D-PAK-1.1-4 | Zählen die Kalibrier-Neustarts als R-8? | Nein; sie messen, sie wiederholen keinen roten Zeittest. Nachweis ist die Tabelle. | `r8.tsv` | angewandt |
| D-26 | D-PAK-1.1-5 | Die 11 Versuche auf dem alten Head `c698cc08` | Getrennt ausgelesen; ob sie zählen, entschied PAK-5.1 (D-102: nein). | #125 | angewandt |
| D-27 | D-PAK-1.2-1 | Deterministisches Rot, wenn die CDP-Drosselung allein nur manchmal rot ist (lokal 1 von 6) | Zwei nachgespielte Läufer in der Seite (die Uhr rückt nur beim erzwungenen Layout des Blocks vor): „wie #115“ und „CPU gedrosselt ×4“; die unveränderte Funktion `stilBlockadeEinbauen` läuft darin. Der Lauf mit `Emulation.setCPUThrottlingRate` 4 bleibt zusätzlich. Geprüft wird der Code, der in der CI läuft. | #126 | angewandt |
| D-28 | D-PAK-1.2-2 | Was heißt „gehalten“? | Messung = Median aus fünf Umschaltungen nach einer ungezählten; gehalten = das Minimum aus drei solchen Medianen in Folge ≥ 80 ms; berichtet wird dieses Minimum. | #126 | angewandt |
| D-29 | D-PAK-1.2-3 | Welche Obergrenze? | 1 024 000 Elemente (2 000 × 2⁹); dort Abbruch mit Meldung (Elemente, erreichte ms, Runner). Gebraucht werden 16 000–40 000. Vorher lief die Schleife bis 2 048 000 ohne Meldung. | #126 | angewandt |
| D-30 | D-PAK-1.2-4 | Wo liegt der Code, ohne #125 zu stören? | Kalibrierung bleibt in `packages/eroj/test/m5.ts`; in `vitrino.check.ts` nur die Importzeile, vier Zeilen im Rumpf der Gegenprobe 2 und neue Tests nach „M5 Gegenprobe: …“; `git merge-tree` mit #125 konfliktfrei. | #126 | angewandt |
| D-31 | D-PAK-1.3-1 | Roter Test oder Messung als Beleg? | Zwei rote Tests, weil sich beide Ursachen als Regel sagen lassen: „der Start fragt eine Ajv-Instanz“ (rot: 3) und „die geteilten Auflösungen halten den Wert eines Alias ohne Kopie“. Die +90 ms selbst sind Datenwachstum; ihre Wirkung belegt die Messung. | #126 | angewandt |
| D-32 | D-PAK-1.3-2 | `packages/modelo/src/ids/lock.ts` lag außerhalb der Zone. | Mitgenommen, damit die acht Dateien byte-gleich zu #123 sind (sonst bliebe eine vierte Ajv-Instanz bei `id:new`). | #126 | angewandt |
| D-33 | D-PAK-1.3-3 | Welche SHA von #123 nennt der grüne Commit? | Er nennt `2537e469` (das neu aufgesetzte #123 lag beim Schreiben noch nicht vor). Die endgültige SHA ist `b298aa83` „Spec 029 ②b-1b M-2: Status der Felder (grün)“; hier und im Bericht nachgetragen. | #126, #123 | angewandt |
| D-34 | D-PAK-1.3-4 | Beleg bei Last 12–77 | Zusätzlich exakte Aufrufzahlen (V8-Coverage) und CPU-Zeit je Startphase; maßgeblich die Messung in Ruhe (PAK-5.1). | Messung | angewandt |
| D-35 | D-PAK-2.1-1 | Reihenfolge der fünf Commits von #123 | Die des Branches (der Nachtrag `53d9494c` steht nach dem roten M-2-Commit), nicht die des Tickets. | #123 | angewandt |
| D-36 | D-PAK-2.1-2 | `T2956` doppelt (main: Abnahme rechter Feldrand; #123: Beschriftung) | Die Beschriftung von #123 wird `T2957`; die SHAs in `specs/029-…/tasks.md` zeigen auf die neuen Commits. | #123 | angewandt |
| D-37 | D-PAK-2.1-3 | Feld-Markup im Web beim Neuaufsetzen | Aufbau von #122 (Zeile aus Control und Ende im Feldrand); das Status-Icon von #123 zunächst direkt nach dem Eingabefeld vor dem Ende, ohne Vorgriff. Die Reihenfolge laut `trailing` kam mit D-46 ff. | #123 | angewandt |
| D-38 | D-PAK-2.1-4 | Spinner in den Teil-Listen | Lage von #122 (Ende; bei `markobutono`/`sxaltilo` hinter dem Text über `trailingAfter`); Teil-Listen = `main` plus `status-icon` (kampo) und `message` (alle Felder). | #123 | angewandt |
| D-39 | D-PAK-2.1-5 | Figma: Status-Icon in der festen Reihenfolge von #122 | Nach dem Spinner, vor dem ✕; der eigene Schritt von #123 schreibt es nur noch; ein zweiter Plugin-Lauf schreibt nichts. Die feste Liste ersetzte danach `trailing` (D-49). | #123 | angewandt |
| D-40 | D-PAK-2.1-6 | Skemoj `elektilo`, `kampo`, `kompletigilo` | Bindungen von #122 plus die von #123; `trailing` unverändert. | #123 | angewandt |
| D-41 | D-PAK-2.1-7 | Figma-Bildtest `WANTED` | Vereinigung der Einträge von #122 und #123; `bild-main.json` unverändert (keine neue Bildbasis beim Neuaufsetzen). | #123 | angewandt |
| D-42 | D-PAK-2.1-8 | Abgeleitete Zahlen | Aus Erzeugung und Test übernommen, nicht gerechnet: 1504 Ero-Tokens (1288 + 216), 1880 Tokens der Vitrino, 273 neu seit `main`. | #123 | angewandt |
| D-43 | D-PAK-2.1-9 | `ids.lock.json` | Drei-Wege-Vereinigung als JSON: 220 Einträge zu 2344, nichts umnummeriert oder wiederverwendet. | #123 | angewandt |
| D-44 | D-PAK-2.1-10 | R-12 gegen generierte Ero-Tokens: 225 Treffer, alle der Schlüssel der DTCG-Erweiterung des Repos `"com.<R-12-Wort>.fundamento":` in `packages/vortaro/sets/core.json` | Unverändert gepusht: Format des Repos (jedes Token auf `main` trägt seine ID unter diesem Schlüssel); nichts Neues veröffentlicht (der alte Head hatte dieselben Zeilen). Umbenennen des Schlüssels im ganzen Repo wäre eine eigene Spec. | #123, #130 | angewandt, **zu bestätigen** |
| D-45 | D-PAK-2.1-11 | Neuerzeugen der Artefakte als eigener Commit? | Nein, im neu aufgesetzten grünen Commit `b298aa83`; jeder Commit trägt seine Artefakte. | #123 | angewandt |
| D-46 | D-PAK-2.2-1 | `pruefen` blockierte jeden Scan über #123 (D-44). | Enge Ausnahme: nur das exakte Literal `"com.<R-12-Wort>.fundamento":` in `packages/vortaro/sets/**.json` und `packages/modelo/test/fixtures/**/sets/**.json`; jedes weitere Vorkommen und jede andere Datei bleibt Treffer (Selbsttest 32/32). | Schutzwerkzeug | angewandt |
| D-47 | D-PAK-2.2-2 | „Alle vier Elemente“ bei `kampo`, `elektilo`, `datelektilo` – ein Status-Icon hat nach A-kampo-4 nur der `kampo`, der `kampo` hat kein Feld-Icon. | Jedes Feld zeigt im Test alle Teile, die es hat: `kampo` Status-Icon → Spinner → ✕; `elektilo` Spinner → ✕ → Pfeil; `datelektilo` Spinner → ✕ → Kalender. Kein Status-Icon für weitere Felder (wäre ein neuer Teil mit Tokens, Figma, Uzo je Feld; dann nimmt `trailing` es vorn auf, die Generatoren folgen ohne Änderung). | #123 | angewandt, **zu bestätigen** |
| D-48 | D-PAK-2.2-3 | Vier bestehende Tests hielten den alten Ort fest. | Im roten Commit an die neue Regel angepasst (jede Erwartung rot auf `b298aa83`); der grüne Commit enthält nur Code und Skemo. | #123 | angewandt |
| D-49 | D-PAK-2.2-4 | Wie weit folgen die Generatoren dem Skemo? | Jede feste Reihenfolge am Feldende kommt aus `trailing`: Web `endMarkup` (Feld, Auswahl, Liste) plus `#orderEnd`, Figma `component.trailing`. Markup der übrigen Felder byte-gleich. | #123 | angewandt |
| D-50 | D-PAK-2.2-5 | Das Status-Icon liegt über dem Innenabstand des Eingabefelds. | Es nimmt keinen Zeiger (wie Spinner und Pfeil); ein Klick dort erreicht das Eingabefeld. | #123 | angewandt |
| D-51 | D-PAK-2.2-6 | Bildtest neu für 2.1? | Nein: das ganze Bild aller Figma-Sets ist vor und nach der Änderung byte-gleich (Abschnitt Bildtests). | #123 | angewandt |
| D-52 | D-PAK-2.3-1 | Fehlende Testabdeckung ohne Verhaltenslücke | Belegtests im ersten roten Commit (dort schon grün, die Nachricht sagt es); kein Schein-Rot. | #123 | angewandt |
| D-53 | D-PAK-2.3-2 | Uzo `slots.label.required` trotz `label="…"` | Bleibt: die Beschriftung bleibt Pflicht, der Slot ist ihr erster Weg; das Kurzprofil nennt den zweiten (`props` › `label` mit `shown`). | #123 | angewandt |
| D-54 | D-PAK-2.3-3 | Aussage der Regel `field-label-visible` liegt außerhalb der Zone. | Nur die Aussage geändert (englisch, deutsch), kein Name, keine ID, keine Prüfung; sie wird an jeder Stelle zitiert, die ein Agent liest. | #123 | angewandt |
| D-55 | D-PAK-2.3-4 | Ort des Satzes zur Beschriftung im Prompt | Am Ende von Regel 8, keine neue Regel (Nummern 9–17 bleiben). | #123 | angewandt |
| D-56 | D-PAK-2.3-5 | AC-10 je grünem Commit | `a5bc2be5` gegen `2314e8b5` und `ad0dd6ad` gegen `fe98ef35` (deckt `57ab8ba7`, `c3fae550`, `fe98ef35`, weil die roten Commits nur Tests enthalten). | #123 | angewandt |
| D-57 | D-PAK-2.4-1 | 2.3.1 und 2.3.3 hängen über „✕ so groß wie der Kalender“ zusammen. | 2.3.1 zuerst; der Vergleich ✕ = Kalender in `feldrand.spec.ts` ruht zwischen dem roten Commit von 2.3.1 und dem roten von 2.3.3, danach gilt er wieder. | #130 | angewandt |
| D-58 | D-PAK-2.4-2 | Icon-Größe und Ziel des `datelektilo` | Muster des ✕: `size` ist der Glyph, `width` das Ziel ≥ `size.target.min`; zwei neue Ero-Tokens `trigger.width`, `clear.width`; `trigger.size`/`clear.size` bedeuten jetzt den Glyph. | #130 | angewandt |
| D-59 | D-PAK-2.4-3 | Farbe des Kalenders in Figma | `triggerColor` = Beschriftungsfarbe des `butono` emphasis low (dieselbe Variable wie `clearColor`); ohne Füllung malt der Vektor nichts. | #130 | angewandt |
| D-60 | D-PAK-2.4-4 | Warum stand das Kästchen in Figma rechts, im Double links? | Das Double modelliert `insertChild` für ein Kind desselben Elternknotens wie (vermutet) Figma: der Index zählt vor dem Herausnehmen. Die offizielle Doku sagt dazu nichts. Der Fix verschiebt nur nach vorn und ist unter beiden Lesarten richtig. | #130 | angewandt, **zu bestätigen** (im Plugin messen) |
| D-61 | D-PAK-2.4-5 | V-1: was tut die Fonto? | Einheitlich (siehe V-1); Regel „schreibgeschützt = Ruhe“ im Skemo der vier Felder mit Zustand `readonly`, in komuna für den `datelektilo`, in Fixture-Marken und komuna 0.2. `tekstareo` und `glitilo` zeigen die Ruhe ohnehin, sechs Felder haben keinen Schreibschutz. Werte nur in `deveno.json` unter der Fonto-Ausnahme des Clean Room. | #130 | angewandt |
| D-62 | D-PAK-2.4-6 | Bildtest neu für 2.3.2, 2.3.3, 2.3.4? | Nein: das Bild des Doubles ändert sich nicht (Nachweis im Abschnitt Bildtests); die Datentests prüfen die Änderung. | #130 | angewandt |
| D-63 | D-PAK-2.4-7 | Abgeleitete Agordilo-Fixtures | Nach jeder Änderung an komuna 0.2 mit der Ableitung neu geschrieben, je im grünen Commit desselben Befunds; nie von Hand. | #130 | angewandt |
| D-64 | D-PAK-2.4-8 | Die Monatsknöpfe prev/next im offenen Kalender des `datelektilo` haben in Figma dasselbe Muster wie der Kalender vor 2.3.1 (Glyph ohne Größe, Vektor ohne Füllung). | Neuer Befund, nicht geändert (nicht Teil von 2.3). | – | **zu entscheiden** |
| D-65 | D-PAK-3.1-1 | `fm-formularo` sammelt nur direkte Kinder, die Felder liegen in Gruppen. | Der Client ergänzt bei Studio-Seiten die Felder `[data-mt-festlegen][name]`, nur die seit dem Laden geänderten; das Farbfeld bekommt einen `name`. So überschreibt eine veraltete Seite keine Änderung aus dem Assistenten. | #128 | angewandt |
| D-66 | D-PAK-3.1-2 | Auch die Komponentenseiten mit demselben Formular? | Ja, über dieselbe Funktion (`studioAenderungen`, `studioUebernehmen`). | #128 | angewandt |
| D-67 | D-PAK-3.1-3 | Ein Weg oder zwei für eine Änderung? | Jede Wertänderung geht als Formular-Sendung an die Seite, 303 zurück, die Seite kommt vom Server; Scrollposition wiederhergestellt, abgelehntes Feld im Blick. Eine Quelle des Zustands (3.2). | #128 | angewandt |
| D-68 | D-PAK-3.1-4 | Wie kommt die Rückmeldung über die Weiterleitung? | Am Entwurf (`draft.studio = { n, rueckmeldung }`), die Seite zeigt sie bei `?rueckmeldung=<n>`; keine Meldungstexte in der URL. | #128 | angewandt |
| D-69 | D-PAK-3.1-5 | `festlegen` für API und Formular | Antwort über einen Rückruf; die Ablehnung (409) nennt zusätzlich `rule`. | #128 | angewandt |
| D-70 | D-PAK-3.1-6 | Die `rev`-Abfrage lud in WebKit während einer Sendung neu. | Eine Zeile im gemeinsamen rev-Poll wartet auch bei `studioSendet` (eigene Variable, damit ein Merge mit 4b sichtbar wird). `merge-tree` fand keinen Konflikt – nach dem Merge von #129 die Zeile in `html.ts` ansehen. | #128 | angewandt |
| D-71 | D-PAK-3.1-7 | Freier Port ohne Zufall | 7310–7399 (nie 7301), erster freier je Worker. | #128 | angewandt |
| D-72 | D-PAK-3.1-8 | Entwurf lesen, ohne `rev` zu erhöhen | Aus `entwurf.json` (sonst `agordo.json`), `rev` aus `/api/marko/<m>/stato`. | #128 | angewandt |
| D-73 | D-PAK-4.1-1 | Ansicht und Gewichte von Weg C | 1280 × 800 CSS-px, höchstens drei Bildschirme; Gewicht je Pixel Logo 4, erster Bildschirm 2, darunter 1; CSS trägt 10 % (bei 20–25 % schlug eine sehr bunte Nebenfarbe aus dem CSS die prägende Fläche). | #127 | angewandt |
| D-74 | D-PAK-4.1-2 | Woran erkennt Weg C eine blockierte Seite? | Status 403 oder 429, `cf-mitigated: challenge` oder typische Challenge-Merkmale in den ersten 64 KB; 503 ohne Merkmale bleibt ein gewöhnlicher Fehler. Nicht gerendert, ein Satz. Die Erkennung sitzt im gemeinsamen Seitenleser `retejo.ts`: ein Link in Weg B auf eine Challenge-Seite wird damit ebenfalls abgelehnt. | #127 | angewandt, **zu bestätigen** |
| D-75 | D-PAK-4.1-3 | Renderer und der Schutz privater Adressen (Spec 033 D-15) | Der Renderer zeigt das schon gelesene HTML und holt jede weitere Datei nur über den geprüften Abruf (GET, öffentliche Adressen); strenger als vorher. | #127 | angewandt |
| D-76 | D-PAK-4.1-4 | Typen von Playwright ohne festen Import | Strukturelle Typen, `import()` über eine Variable; je Seite ein Chromium-Start; ein Build ganz ohne optionale Pakete ist nicht getestet. | #127 | angewandt |
| D-77 | D-PAK-4.1-5 | Wo steht die Abhängigkeit? | `THIRD_PARTY_NOTICES.md` (eigener Abschnitt), `optionalDependencies` in `packages/metiejo/package.json`, Lockfile; `check:fontoj`, `check:clean-room`, `docs.test.ts` grün. | #127 | angewandt |
| D-78 | D-PAK-4.1-6 | Satz „ohne Browser“ bei der Inspiration (Weg A) | Hängt an `satz` der Kreilo-Antwort; der Kreilo-Client leitet sofort weiter und zeigt ihn noch nicht (D-95). | #127 | angewandt, Rest offen |
| D-79 | D-PAK-4.1-7 | Test „der Start lädt Playwright nicht“ | `node --import` mit `module.registerHooks`, Protokoll je Prozess; MCP-Server bis zur ersten `describe`-Antwort, `fm --help`, `fm metiejo`; Gegenprobe mit `import("playwright")`. | #127 | angewandt |
| D-80 | D-PAK-4.2-1 | Wohin mit dem Akzent aus der Inspiration? | Vorschlag mit Herkunft (Bild, Anteil) im Schritt „Leitfarbe und Akzente“ und in der Kroniko, **nicht gesetzt**: das Markenmodell hat eine Markenpalette, die Prüfung lehnt einen Wert an `color.brand.fill` ab. Eine zweite Markenpalette wäre eine Strukturänderung (Vortaro, Projekcioj, Prüfungen). | #129 | angewandt, **zu bestätigen** |
| D-81 | D-PAK-4.2-2 | Schwellen „deutlich anders“ und „relevanter Anteil“ | In `packages/metiejo/data/kreilo.json` (`akzent`): Chroma ≥ 0,05; Abstand in der OKLab-Farbebene (ohne Helligkeit) ≥ 0,15; Anteil ≥ 10 %, Töne bis 0,05 zusammen. | #129 | angewandt |
| D-82 | D-PAK-4.2-3 | Speicherung von „Pille“ (V-3) | Wie „ganz rund“ des Schnellstarts: `festgelegt["radius.role.control"] = { alias: "radius.full" }`, Wahl `form.bedienelemente`; keine Schemaänderung, keine Migration. | #129 | angewandt |
| D-83 | D-PAK-4.2-4 | Stufe eines relativen Wunschs (V-3) | Nächste Stufe aus 0 · 0,5 · 1 · 2 · Pille (`packages/agordilo/data/wuensche.json`); „eckiger“ von der Pille nimmt zuerst die Pille zurück. Folge: `propose_agordo` „runder“ von 1 geht auf 2 (vorher 1,4). | #129 | angewandt |
| D-84 | D-PAK-4.2-5 | „Pille“ am Regler | Der Werkstatt-Regler reicht einen Schritt über 2 (Anzeige „Pille“); dafür `packages/projekcioj/src/celoj/vitrino/werkstatt.ts` geändert (außerhalb der Zone). | #129 | angewandt |
| D-85 | D-PAK-4.2-6 | Ehrliche Antwort am Reglerende | `setze_regler` und `bewege` melden `amEnde` und einen Grenzsatz; neues Werkzeug `waehle_form`; eine Antwort „vollständig abgerundet“ ohne Pille wird ersetzt; Systemtext Regel 7. | #129 | angewandt |
| D-86 | D-PAK-4.2-7 | Ursache und Ort von 4.4 | Der Server ließ die Freigabe schon zu; der Client schaltete den Knopf nicht. `stato.ts` liefert `freigebbar`/`freigabeSatz`, `zeigeStato` in `html.ts` schaltet ihn (9 Zeilen). | #129 | angewandt |
| D-87 | D-PAK-4.2-8 | Browsertest 4.4 ohne Modell | Änderung über die Route der Regler; der Chat-Zug selbst ist mit Modell-Attrappe im Servertest belegt. | #129 | angewandt |
| D-88 | D-PAK-4.3-1 | Markdown im Chat (D-02) | Sicher darstellen mit `fm-markdovido`; Server maskiert `source="…"`, Client `setAttribute`; nur Antworten des Assistenten, Eingaben der Person bleiben Text. | #129 | angewandt |
| D-89 | D-PAK-4.3-2 | Abzeichen und Umbruch der Leiste | `fm-navigado` entfernt ein direktes `fm-insigno` ohne `data-count`; Name und Abzeichen stehen je in einem `span`, der Umbruch gilt nur für `.mt-schritte` des Assistenten. Ob Navigationen allgemein umbrechen, ist eine Frage an den Maintainer (Skemo/Uzo des Ero). | #129 | angewandt, **zu bestätigen** |
| D-90 | D-PAK-4.3-3 | Ein Satz je Vorschlag (4.5.1) | `kurzsatzOf` kürzt am Bildschirm (Wert vor dem Doppelpunkt; was nicht geschieht, bleibt); Sätze des Enportilo und Kroniko bleiben vollständig. | #129 | angewandt |
| D-91 | D-PAK-4.3-4 | „Ausschnitt aus dem Material“ | Das hochgeladene Bild selbst als Kachel über die neue Route `GET /marko/<m>/materialo/<datei>` (nur Bildformate, `nosniff`, CSP `sandbox`, `no-store`). Ein Ausschnitt an der Fundstelle braucht Koordinaten aus dem Enportilo (Skizze 3). | #129 | angewandt |
| D-92 | D-PAK-4.3-5 | Vorher/Nachher | Zwei Rahmen „Jetzt“ und „Mit dem Vorschlag“ (`vorschau?…&propono=<schritt>`); der Entwurf bleibt. Der Akzent aus Weg A hat keinen Patch, beide Rahmen sind dann gleich. | #129 | angewandt |
| D-93 | D-PAK-4.3-6 | Zusammenfassen gleicher Warnungen (4.5.4) | Schlüssel: Regel, Vorschlag, fest/anpassbar, Patch; Satz „<Regel> bei <n> Farbstufen.“ mit „Betroffen: …“ und einem Knopf; `meldungenOf` in `asistanto/averto.ts`, angewandt in `klartextHtml` (`sxtupoj.ts`). | #129 | angewandt |
| D-94 | D-PAK-4.3-7 | Erfundener Platzhalter (4.5.5, Art. VI) | „Quendolin“: Websuche mit „Marke“/„brand“ ohne Treffer, lokale Markenliste sauber. Keine Registerrecherche (DPMA/EUIPO) – beim Maintainer, falls der Name über den Platzhalter hinaus gebraucht wird. | #129 | angewandt |
| D-95 | D-PAK-4.3-8 | Satz von 4a vor der Weiterleitung der Einstiegsfragen | Nicht umgesetzt (auf 4b gibt es den Satz noch nicht). Nach dem Merge von #127: im Kreilo-Client `meldung(result.body.satz)`, erst danach weiterleiten. | – | **zu entscheiden** (nach Merge) |
| D-96 | D-PAK-4.3-9 | `ekrano.ts` und `freigabeOf` | Nicht umgestellt: beim ersten Aufbau steht für „offen“ noch der alte Satz, nach einer Zustandsänderung der aus `stato.ts`. Kleine Folgeänderung. | #129 | **zu entscheiden** |
| D-97 | D-PAK-4.4-1 | Kroniko prüfen, obwohl die Skripte ihren Ordner löschen | Ein Preload außerhalb des Repos sichert `kroniko.jsonl` direkt vor dem Löschen; die Skripte bleiben unverändert; `pruefen --datei` auf beide Kopien sauber. | Messung 4.7 | angewandt |
| D-98 | D-PAK-4.4-2 | Tokens ein/aus für Weg A | Aus den `kosto`-Einträgen der gesicherten Kroniko (7 927 + 186 = 8 113 = Zähler). | Messung 4.7 | angewandt |
| D-99 | D-PAK-4.4-3 | Kein Akzent im Lauf von Weg A | Die Skriptbilder liegen 0,058 auseinander (Schwelle 0,15) – richtig nach D-81. Vorschlag: `abnahme-weg-a.ts` bekommt ein Bild mit einer zweiten kräftigen, anderen Farbe. | – | **zu entscheiden** |
| D-100 | D-PAK-4.4-4 | Preis und Reservierung | Preis auf docs.mistral.ai am 31.10. gleich `prezoj.json`; Schätzungen unter den Reservierungen, gebucht gegen `4.7-weg-c` und `4.7-weg-a`; Limit je Zug 30 000 Tokens unverändert. | Kosten | angewandt |
| D-101 | D-PAK-4.4-5 | Dauer im Ledger | Wanduhr des Skripts; Modellzeit getrennt (Weg C 5,8 s, Weg A 10,5 s). | Kosten | angewandt |
| D-102 | D-PAK-5.1-1 | Zählen die 11 Versuche des alten Heads `c698cc08`? | Nein: anderer Code-Stand (Basis `04b68b79`), und der neue Head hat 16 Versuche. Mit ihnen wäre der Bezugswert 39,0 ms (gleiche Richtung). | #125 | angewandt |
| D-103 | D-PAK-5.1-2 | Klassen und Rundung | Nach `ableitung_median_ms`: schnell < 110 ms, mittel 110–130 ms, langsam > 130 ms; Bezugswert = Median der Referenz der schnellen Versuche, auf 0,1 ms. | #125 | angewandt |
| D-104 | D-PAK-5.1-3 | Ort von Daten und Test | `packages/eroj/test/ableitung-kalibrierung.tsv` neben `ableitung.ts`; Parser und Median in `ableitung.ts` (Testcode); drei Tests in `vitrino.check.ts` hinter „the verdict of the derivation“. | #125 | angewandt |
| D-105 | D-PAK-5.1-4 | Gegenprobe je Klasse auf dem neuen Head | Zusätzlich ein `workflow_dispatch`-Lauf (41157585241, kein R-8); so lief je ein schneller und ein langsamer Runner. | #125 | angewandt |
| D-106 | D-PAK-5.1-5 | #130 rot in „Rendered checks (Vitrino)“, kein Zeittest | Der bestehende Test ist auf `363f881f` rot, auf `ebdf4462` grün: rot = `363f881f`, grün = `58c92a70` (Zählung beratender APCA-Hinweise 8586 → 8694 mit Begründung). Kein eigener roter Commit, weil kein neuer Test entsteht; WCAG-Schwellen unverändert. | #130 | angewandt |
| D-107 | D-PAK-5.1-6 | Ergebnis eines Neustarts im R-8-Ledger | Spalte `ergebnis` der beiden Zeilen unter der Sperre nachgetragen. | `r8.tsv` | angewandt |
| D-108 | D-PAK-5.1-7 | Was heißt „in Ruhe“? | Kein anderer Ticket-Prozess (`ps`), Ketten beendet; Grundlast 4–5 von Desktop-Programmen. | Messung | angewandt |
| D-109 | D-PAK-5.1-8 | Bezugswert nach Vorgabe (41,5 ms) oder nach gleichem Spielraum (≈ 45 ms)? | Vorgabe der Spec (D-13). Die Beobachtung steht als B-5.1-1 zur Entscheidung. | #125 | angewandt, **zu bestätigen** (mit B-5.1-1) |
| D-110 | D-PAK-5.1-9 | Folgen für #126/#128, die M5 noch roh gegen 150 ms prüfen | Keine Änderung dort; #125 zuerst mergen nimmt das Rot auf langsamen Runnern aus allen folgenden PRs. | Merge-Reihenfolge | angewandt |
| D-111 | D-PAK-5.2-1 | Nummern in `tasks.md` | Neu vergeben ab T3501 (Teil → A/B/C → Befund), weil die Teile feiner geschnitten wurden als im Gerüst (je Befund rot und grün); die Gerüst-Nummern T3501–T3547 waren vorläufig. | `tasks.md` | angewandt |
| D-112 | D-PAK-5.2-2 | Befunde B-5.1-1 bis B-5.1-3 und Beobachtungen der Messung | Bleiben Befunde (keine Entscheidungen) und stehen im Bericht unter „Neue Befunde“. | plan | angewandt |
| D-113 | D-PAK-5.2-3 | Doku-Commits lösen auf #126 einen neuen CI-Lauf aus. | Gepusht, als kein Lauf von #126 lief; der Bericht nennt den CI-Stand des letzten Code-Heads `02fe48e6`. Ein Lauf auf einem Doku-Head belegt keinen Code. | #126 | angewandt |
| D-114 | D-PAK-5.2-4 | Stand von 2.3.1–2.3.4, solange die Sichtprüfung im Desktop-Plugin aussteht | „erledigt“: Bildtest über das Double, Datentests und Browser wie in der Spec verlangt; die Abnahme im Plugin ist der Schritt des Maintainers (Messanleitung). | Bericht | angewandt |
| D-115 | D-PAK-6.1-1 | Wo steht der Doku-Test von Spec 035 in `packages/modelo/src/docs/docs.test.ts`? | Direkt nach dem Block von Spec 034 (Nachlese 12), nicht am Dateiende: #123 fügt seinen Block zu D-04 vor „Abnahme #122“ am Dateiende ein; so bleiben die beiden Änderungen getrennte Hunks und der Merge konfliktfrei. | #126 | angewandt |
| D-116 | D-PAK-6.1-2 | Rot zuerst bei einem Doku-Test, den der plan schon erfüllt | Die Prüfungen für AC-1, AC-5, AC-8, AC-9 und AC-10 waren am Stand `f668e128` beim ersten Lauf grün (6 von 6; Gegenprobe an einer beschädigten Kopie des plans: 3 rot – fehlende Zeile D-07, fremdes Modell in der Kostentabelle, Befund ohne Stand). Rot ist die neue Forderung, dass der Bericht die Prüfung gegen AC-1 bis AC-11 trägt (`2dbc3fad`, „expected -1 to be greater than -1“); grün ist der Doku-Commit mit diesem Abschnitt. Die 25 Befunde liest der Test aus den Überschriften der Spec, die Summe der Kosten rechnet er aus den Zeilen nach. | #126 | angewandt |
| D-117 | D-PAK-6.1-3 | Zwei lokale Logs des roten Stands 4.5.5 enthielten den alten Platzhalter (eine echte Marke aus `main`, die 4.5.5 entfernt) | In beiden Logs unter `/tmp/s035-logs` (nie im Repo, in keinem Commit oder PR-Text) durch einen Platzhalter ersetzt; danach `pruefen` sauber. Kein Schlüssel betroffen. | lokale Logs | angewandt |
| D-118 | D-PAK-6.1-4 | Treffer der Prüfung AC-4 in #123 (eigene Prüfung des Kurzprofils „≤ 700“ → „< 750“) beheben oder melden? | Melden als B-6.1-1, nicht ändern: die Zeile stammt aus `2537e469` (Spec 029 ②b-1b, vor dieser Nacht), steht im PR-Text von #123, und die verbindliche Grenze 750 (`packages/modelo/src/gvidanto/eroj.test.ts`) bleibt; Code von #123 liegt außerhalb dieses Tickets. | #123 | angewandt, **zu entscheiden** (B-6.1-1) |
| D-119 | D-PAK-6.1-5 | Welche roten Tests werden für AC-3 neu ausgeführt? | Alle Vitest-Paare (22) am roten und am grünen Commit in eigenen losgelösten Worktrees; die Playwright-Paare, die als einzelne Datei oder einzelner Test in Chromium laufen (18), mit sauberem Build (`dist` gelöscht, ohne Cache). Zitiert (Belege der Tickets) bleiben die Werkstatt-Läufe „Ableitung“ und „M5“ von 1.1, 1.2 unter CDP-Drosselung (nicht deterministisch), 3.1 in WebKit (`ad37b345`, zeitabhängig), 3.4 (grün beim ersten Lauf, mit Gegenproben), 4.3 im Werkstatt-Lauf der Vitrino, das ganze Bild der Figma-Sets zu 2.1 und 2.3 und der CI-Fix von #130 (`363f881f` → `58c92a70`, bestehender Test, D-106). | Prüfung | angewandt |

## Entwurfsentscheidungen je Befund

- **1.1** Bezugswert aus Daten statt aus einer Konstante: die Kalibriertabelle liegt im Repo, ein Test bindet `REFERENZ_SCHNELL_MS` an ihren Median der schnellen Runner (D-13, D-103, D-104). Klassen leitet der Test aus der Ableitung ab, die Datei hat keine Klassenspalte.
- **1.2** Die Kalibrierung bleibt Testhilfe in `packages/eroj/test/m5.ts` (`stilBlockadeEinbauen`, neu `StilBlockade`, `stilBlockadeMeldung`); kein Haken im Produktionscode (Spec 034 D-03). Rot über nachgespielte Läufer (D-27), „gehalten“ als Minimum dreier Mediane (D-28), Obergrenze mit Meldung (D-29).
- **1.3** Keine neue Lösung: die zwei Änderungen von #123 byte-gleich (D-06): eine Ajv-Instanz je Prozess (`sharedModeloAjv`) und `resolveCombination(…, { shared: true })` für die nur gelesenen Auflösungen der Validierung. Wer zuerst gemergt wird, macht die Hunks im anderen PR zu einer Nulländerung.
- **2.1** Neuaufsetzen ohne Vorgriff (D-35 bis D-45), dann die Reihenfolge am Feldrand als Regel: `trailing` im Skemo ist die einzige Quelle, Web (`endMarkup`, `ElementNames.trailing`, `#orderEnd`) und Figma (`plan.trailing`) folgen (D-49). `kampo` `trailing` = `status-icon, spinner, clear, decrement, increment`.
- **2.2** Keine Bedeutungsänderung, nur Lücken schließen (check_usage `textOf`, Aussage der Regel, ein Satz im Prompt, CHANGELOG); D-04 additiv.
- **2.3.1/2.3.3** Ein Muster für das Feldende: Glyph-Größe in `size`, Ziel in `width` (D-58), Kalender gefüllt wie das ✕ (D-59). **2.3.2** Das Plugin verschiebt nur zum Anfang hin (D-60). **2.3.4** Eine Regel für alle Felder nach V-1 (D-61).
- **3.1–3.3** Ein Weg für jede Wertänderung im Studio: Formular-Sendung an die Seite, `festlegen` wie die API, 303 und die Seite vom Server (D-65 bis D-69). **3.4** Kein Code; der Abgleich über `rev` war vorhanden und ist jetzt belegt.
- **4.1** Renderer `packages/metiejo/src/enportilo/bildilo.ts` lädt Playwright verzögert; Messung nach Fläche wie Weg B (`rekono.ts` unverändert), Gewichte D-73, Blockiert D-74, Schutz der Adressen D-75. **4.5.6** Dekodieren über denselben Browser (D-11), Byte-Prüfung in `materialo.ts`, `accept` in beiden Upload-Feldern.
- **4.2** Akzent als Vorschlag (D-80, D-81). **4.3** „Pille“ als Wahl neben dem Regler, Stufen als Daten (D-82 bis D-85). **4.4** Zustand nennt `freigebbar`, der Client folgt (D-86).
- **4.5.1** Zeigen statt erklären: Farbfläche, Bild als Kachel, Vorher/Nachher an echten Eroj (D-90 bis D-92). **4.5.2** Abzeichen im eigenen `span`, Umbruch nur im Assistenten (D-89). **4.5.3** `fm-markdovido` (D-88). **4.5.4** `meldungenOf` (D-93). **4.5.5** „Quendolin“ (D-94).
- **4.6** Drei Skizzen als Beschreibung (D-14). **4.7** Skripte unverändert, Kroniko vor dem Löschen gesichert (D-97).

## Bildtests als gewollte Änderung neu gesetzt

Jede Bildabweichung, die nicht in dieser Tabelle steht, ist ein Fehler. Kein Commit zu 2.2 setzt ein Referenzbild neu. Web: keine Referenzbilder im Repo (D-09); die Lage prüfen Geometrie- und Stiltests (`packages/eroj/test/trailing-035.spec.ts`, `feldrand.spec.ts`, `befunde-2-3-035.spec.ts`). Figma: der committete Bildtest `packages/projekcioj/src/celoj/figma/plugin-bauformen-bild.test.ts` mit `test-doubles/bild-main.json` und der Liste `WANTED`; Nachweis „kein Bild geändert“ über das ganze Bild aller 40 Sets (`FM_BILD_BASIS=1`, danach `bild-main.json` zurückgesetzt).

| Befund | Test / Datei | Komponenten und Zustände | Grund | Commit |
|---|---|---|---|---|
| 2.1 (Nachtrag 30.10., Reihenfolge laut `trailing`) | `packages/projekcioj/src/celoj/figma/plugin-bauformen-bild.test.ts`, `test-doubles/bild-main.json` (unverändert); Datentest `packages/projekcioj/src/celoj/figma/trailing-035.test.ts` | Kein Bild ändert sich: ganzes Bild vor und nach der Änderung byte-gleich, SHA-256 `8b41722039aed2fbee9ec8bc2539708103ccaab1cd05160eef400ecc70ab503a`, 40 Sets, 1029 Varianten, Lage gleich. Geändert ist nur die Reihenfolge im Control des `kampo` (`state=warning`, `success`, `invalid`: Status-Icon vor dem Spinner); Spinner und ✕ sind in den Varianten verborgen und malen nichts. | Status-Icon innerhalb des Rands vor dem Spinner (Spec 035 2.1, D-51) | kein Bildtest-Commit (Nachweis an `ad0dd6ad`) |
| 2.3.1 | `plugin-bauformen-bild.test.ts` (`WANTED.datelektilo`), `bild-main.json` unverändert | `datelektilo`: alle 32 Varianten (mode single/range × expanded true/false × rest, hover, focus, disabled, readonly, invalid, warning, success), je ein neuer Eintrag (der gefüllte Kalender-Vektor), Lage gleich. Ganzes Bild `8b417220…` → `80ac81eff0fe2a7346f3868296bb38c232a788a0e92e7db8dacff7b1e6a85cd3`, nur `datelektilo` anders. | Kalender gefüllt (Beschriftungsfarbe des `butono` low), Glyph an `trigger.size` (Größe des Pfeils), Ziel ≥ 24 px | `f94947b6` „Bildtest neu: 2.3.1 …“ |
| 2.3.2 | dieselbe Datei; Datentest `packages/projekcioj/src/celoj/figma/befunde-2-3-035.test.ts` | `markobutono`, `sxaltilo`: kein Unterschied im Bild des Doubles (es zeigte das Kästchen schon links; ganzes Bild nach 2.3.2 byte-gleich `80ac81ef…`). Mit dem neuen Double (Figma-Lesart von `insertChild`) war der rote Stand anders: `markobutono` 30 und `sxaltilo` 24 Varianten. `elekto` richtig. | Kästchen bzw. Spur links wie im Web (D-60, D-62) | kein Bildtest-Commit |
| 2.3.3 | dieselbe Datei; Datentest `befunde-2-3-035.test.ts` (Modelo, Figma) | `datelektilo`: das ✕ ist in allen Varianten verborgen; ganzes Bild byte-gleich `80ac81ef…` | ✕ wie beim `kampo` (D-62) | kein Bildtest-Commit |
| 2.3.4 | dieselbe Datei; Datentest `befunde-2-3-035.test.ts` prüft die Farben | `kampo`, `listelektilo`, `plurelektilo`, `datelektilo` `state=readonly`: das Bild nennt Variablen, nicht Werte; ganzes Bild byte-gleich `80ac81ef…` | schreibgeschützt = Ruhe (V-1, D-62) | kein Bildtest-Commit |

## Messungen

### AK-07 vorher und nachher

Protokoll (PAK-1.3): `pnpm --filter @fundamento/mcp perf`, Zeile „AK-07 start to first describe“, `CI` nicht gesetzt, je vier Läufe im Wechsel A/B, `uptime` je Lauf; A = `/tmp/s035-main` (`367b7a52`), B = PR-Worktree. Mac (10 Kerne), Node 24.21.0, Konfiguration `packages/modelo/test/fixtures/valid/aspekto-ekzemplo/fundamento.config.json`. Budget 2000 ms und Faktor 3 unter CI unverändert.

**In Ruhe (maßgeblich, PAK-5.1, 31.10. 02:42–02:52 Ortszeit):**

| Paar | Läufe je Seite | Median A `main` | Median B | B − A | B schneller | Last (1 min) | Ziel ≤ 1900 ms |
|---|---|---|---|---|---|---|---|
| `main` – Teil 1 (#126, `02fe48e6`) | 8 | 1901 ms (1881–1917) | **1744 ms** (1714–1793) | −157 ms (−8,3 %) | 8 von 8 | 4,15–5,71 | **erreicht** |
| `main` – 4a (#127, `0516d45a`) | 8 | 1907,5 ms (1889–1963) | 1909,5 ms (1888–2014) | +2 ms | 5 von 8 | 4,29–7,78 | wie `main` (4a basiert auf `367b7a52` ohne Teil 1) |
| `main` – 4b (#129, `7a52ae0e`) | 12 | 1890 ms (1880–1938) | 1901,5 ms (1894–1939) | +11,5 ms (+0,6 %) | 5 von 12 | 3,84–7,48 | wie `main` |

**Nach Teil 4, Playwright nicht im Start:** 4a und 4b sind gegen `main` unverändert (innerhalb der Streuung von `main` 1880–1963 ms); der Startpfad von 4a ist unverändert (`git diff 367b7a52..0516d45a -- packages/mcp packages/modelo packages/agordilo` leer). Der Wächtertest `packages/metiejo/src/esploro/start-ohne-playwright.test.ts` (4 Tests, `module.registerHooks`) belegt: MCP-Server bis zur ersten `describe`-Antwort, `fm --help` und `fm metiejo` laden Playwright nicht; Gegenprobe mit `import "playwright"` oben in `bildilo.js` → rot. Ein 4a-Lauf lag bei 2014 ms (lokaler perf-Test rot), auf dem Niveau von `main`.

**Unter Last (PAK-1.3, 31.10. 00:22–00:31, Last 10–25):** A `main` gegen B Teil 1, 4 Runden × 4 Paare.

| Runde | Median A | Median B | B schneller | Last |
|---|---|---|---|---|
| 1 | 2177 | 1966,5 | 4 von 4 | 24,6 → 15,3 |
| 2 | 2453 | 2724 | 2 von 4 | 15,5 → 24,1 (Lastspitzen) |
| 3 | 2391,5 | 2196 | 4 von 4 | 16,0 → 12,3 |
| 4 | 2414 | 2258,5 | 3 von 4 | 9,7 → 10,4 |
| alle 16 Paare | 2369 | 2173,5 | 13 von 16 | |

Weitere Messungen unter Last (nicht maßgeblich): #123 `b298aa83` 1914/1986 ms gegen `main` 1962/2046 ms (Last ~7); 4a 4×A/B bei Last 42–80 (A 11 605, B 9 341 ms); 4b 8×A/B bei Last 6–15 (A 2545, B 2308,5 ms).

**Aufrufzahlen je Start** (V8-Coverage, deterministisch; Laden, Validieren, Export, Server erzeugen):

| Funktion | vor #122 (`013f2e59`) | `main` | Teil 1 |
|---|---:|---:|---:|
| `cloneValue` | 1 597 277 | 1 631 528 | 33 200 |
| `resolveName` | 450 506 | 466 970 | 466 970 |
| `createModeloAjv` | 3 | 3 | 1 |
| `compileSchema` (Ajv) | 318 | 320 | 222 |
| `shouldUseRule` (Ajv-Codegen) | 364 709 | 367 210 | 268 821 |
| `getToken` (JSON-Leser) | 474 187 | 487 239 | 487 239 |

Vor #122 → `main`: Kern-Tokens 1608 → 1664; Auflösen +2,1 bis +4,5 %, JSON-Leser +2,7 bis +3,1 %, Farbregeln +2,5 bis +3,3 %, Ajv +0,7 %; keine Funktion neu oder sprunghaft. CPU-Profile: Validierung 57–65 % des Starts, Auflösen aller 144 Kombinationen etwa ein Fünftel, Übersetzen der Schemas 13–18 %; CPU-Zeit je Start `main` → Teil 1 −10 % (Median).

### Gegenprobe 2 je Runner

Klasse des Runners nach der Ableitung im selben Lauf (schnell < 110 ms, mittel 110–130 ms, langsam > 130 ms; D-103). „neu“ = Kalibrierung aus #126, „alt“ = Stand von `main`.

| Lauf | PR, Head | Kalibrierung | Runner (Ableitung median) | Elemente | Stil und Layout | Ergebnis |
|---|---|---|---|---|---|---|
| 41130783744 (#115, Befund) | #115 | alt | – | 16 000 | 71,8 ms | rot (Befund 1.2) |
| 41140304922 Versuch 3 | #125 `4a2fa096` | alt | langsam (148,9 ms) | – | 76,4 ms | rot (B-5.1-2) |
| 41144058506 Versuch 2 | #126 `02fe48e6` | **neu** | mittel (117,1 ms) | 24 500 | 97,5 ms, gehalten | grün |
| 41144058506 Versuch 2, CDP ×4 | #126 `02fe48e6` | **neu** | gedrosselt | 5 360 | 87,4 ms (nachgemessen 90,5) | grün |
| 41144661915 Versuch 2 | #128 `21580cb4` | alt | langsam (133,2 ms) | 21 438 | 97 ms | grün |
| 41157583649 | #125 `016997b6` | alt | langsam (153,4 ms) | 18 759 | 88 ms | grün |
| 41157585241 | #125 `016997b6` | alt | schnell (94,1 ms) | 28 000 | 88 ms | grün |
| 41158327889 | #130 `58c92a70` | alt | mittel (117,0 ms) | 16 000 | 83 ms | grün |

Lokal (PAK-1.2, Mac, Chromium 1243, Last 7–38):

| Stand | Lauf | Elemente | Stil und Layout | Ergebnis |
|---|---|---|---|---|
| alt | Läufer wie #115 | 16 000 | 71,8 ms (nachgemessen 76,0) | rot |
| alt | Läufer wie gedrosselt ×4 | 2 000 | 22,9 ms | rot |
| alt | echtes Chromium, CPU ×4 (7 Läufe) | 2 000 / 8 000 | 23,4 / 85,1–96,0 ms | 1 rot, 6 grün |
| neu | Läufer wie #115 | 21 438 | 99,8 ms (101,8) | grün |
| neu | Läufer wie gedrosselt ×4 | 8 000 | 93,6 ms | grün |
| neu | Obergrenze (Läufer 20 ms bei 1 024 000) | 1 024 000 | 20,0 ms | `gehalten` false, Meldung |
| neu | echtes Chromium, CPU ×4 (4 Läufe) | 8 000–10 000 | 82,4–110,7 ms | grün |
| neu | Werkstatt (4 Läufe) | 32 000–40 000 | 81,5–97,9 ms | grün, M5 rot wie gewollt (p90 193 ms) |

### Ableitung je Runner (Kalibriertabelle #125)

Head `4a2fa096`, 30.10. 22:46 – 31.10. 00:32 UTC, GitHub `ubuntu-latest`; Ketten `pr` (Lauf 41140136538, 10 Versuche) und `dispatch` (Lauf 41140304922, 6 Versuche). Im Repo: `packages/eroj/test/ableitung-kalibrierung.tsv`. „normiert“ = Ableitung / k mit k = max(1, Referenz / Bezugswert); „rot ab“ = Ableitung roh, ab der das Urteil rot wird.

| Lauf | Versuch | Klasse | Referenz ms | Ableitung median ms | normiert (50) | normiert (41,5) | Gegenprobe normiert, gemessen (50) | rot ab (50) | rot ab (41,5) | Job |
|---|---|---|---|---|---|---|---|---|---|---|
| 41140136538 | 1 | mittel | 51,4 | 117,4 | 114,2 | 94,8 | 197,1 | 154 | 186 | grün |
| 41140304922 | 1 | langsam | 63,9 | 140,9 | 110,3 | 91,5 | 186,5 | 192 | 231 | grün |
| 41140136538 | 2 | langsam | 63,9 | 138,5 | 108,4 | 89,9 | 189,1 | 192 | 231 | grün |
| 41140304922 | 2 | langsam | 64,0 | 145,0 | 113,3 | 94,0 | 197,2 | 192 | 231 | rot (G5, B-5.1-2) |
| 41140304922 | 3 | langsam | 62,6 | 148,9 | 118,9 | 98,7 | 193,8 | 188 | 226 | rot (Gegenprobe 2, B-5.1-2) |
| 41140136538 | 3 | schnell | 46,2 | 103,0 | 103,0 | 92,5 | 184,9 | 150 | 167 | grün |
| 41140304922 | 4 | schnell | 41,5 | 106,2 | 106,2 | 106,2 | 190,7 | 150 | 150 | grün |
| 41140136538 | 4 | mittel | 49,0 | 118,0 | 118,0 | 99,9 | 200,1 | 150 | 177 | grün |
| 41140304922 | 5 | schnell | 39,0 | 103,1 | 103,1 | 103,1 | 186,0 | 150 | 150 | grün |
| 41140136538 | 5 | mittel | 49,6 | 119,1 | 119,1 | 99,7 | 203,7 | 150 | 179 | grün |
| 41140304922 | 6 | mittel | 50,8 | 114,5 | 112,7 | 93,5 | 201,1 | 152 | 184 | grün |
| 41140136538 | 6 | langsam | 64,0 | 146,7 | 114,6 | 95,1 | 192,2 | 192 | 231 | grün |
| 41140136538 | 7 | langsam | 64,0 | 144,2 | 112,7 | 93,5 | 200,9 | 192 | 231 | grün |
| 41140136538 | 8 | schnell | 38,7 | 101,0 | 101,0 | 101,0 | 176,5 | 150 | 150 | grün |
| 41140136538 | 9 | mittel | 58,4 | 120,8 | 103,4 | 85,8 | 196,1 | 175 | 211 | grün |
| 41140136538 | 10 | schnell | 45,6 | 103,5 | 103,5 | 94,2 | 183,7 | 150 | 165 | grün |

| Klasse | n | Referenz min / Median / max ms | Ableitung min / Median / max ms | rot ab (50 ms) | rot ab (41,5 ms) |
|---|---|---|---|---|---|
| schnell (< 110 ms) | 5 | 38,7 / **41,5** / 46,2 | 101,0 / 103,1 / 106,2 | 150 | 150–167 |
| mittel (110–130 ms) | 5 | 49,0 / 50,8 / 58,4 | 114,5 / 118,0 / 120,8 | 150–175 | 177–211 |
| langsam (> 130 ms) | 6 | 62,6 / 63,95 / 64,0 | 138,5 / 144,6 / 148,9 | 188–192 | 226–231 |

**Bezugswert 41,5 ms** (Median der Referenz der fünf schnellen Versuche 38,7; 39,0; 41,5; 45,6; 46,2), vorher vorläufig 50 ms. **Richtung:** für jeden Runner mit Referenz über 41,5 ms lockerer (bis Faktor 1,20), darunter unverändert (k = 1), nirgends strenger; Grenze 150 ms unverändert. **Gegenprobe mit 41,5 ms auf `016997b6` gemessen:** langsam – Lauf 41157583649: Referenz 64,5 ms (k 1,55), Ableitung 280,4 ms, normiert 180,4 ms → rot; schnell – Lauf 41157585241: Referenz 36,5 ms (k 1,00), normiert 179,0 ms → rot. Derselbe langsame Lauf zeigt den Zweck: Ableitung roh 153,4 ms, normiert 100,9 ms – auf `main` wäre M5 dort rot gewesen. Alter Head `c698cc08` (nicht gezählt, D-102): 11 Versuche, Gegenprobe in allen rot.

### Kennzahl K nach 2.2

Lauf `20261031-0044` aus `/tmp/s035-k` (#123 `fe98ef35`), `ministral-14b-2512`, `--varianten F,0 --ripetoj 1 --max-tokens 1000000`, 31.10. 00:44–00:50 UTC; Bericht lokal `$M/.fundamento/nordstelo/20261031-0044/raporto.md`. Neu bewertet mit `pnpm nordstelo restaro`: 40 Ergebnisse, 0 abweichend.

| | Spec 034 „nach der Fonto“ (`20261029-1127`, 3 Wdh.) | nach 2.2 (`20261031-0044`, 1 Wdh.) |
|---|---|---|
| F gegen 0, Gewichtung Nachlese 11 | 76 gegen 33,3 | **83,9 gegen 33,3** |
| F gegen 0, Gewichtung Spec 030 | 74,9 gegen 47,6 | 82,6 gegen 50,7 |
| Streuung F (N11 / 030) | 16,7 / 14,8 | – |
| K1 · K2 · K3 · **K4** · K5 · K6 · Markenfähigkeit (F, N11) | 0,98 · 0,77 · 0,58 · **0,56** · 0,81 · 0,45 · 0,93 | 0,95 · 0,9 · 0,78 · **0,85** · 0,86 · 0,64 · 1 |
| Tokens ein / aus · Anfragen | 2 828 072 / 153 502 · 333 | 853 095 / 52 211 · 97 |

Top-Lücken (F) vorher: `field-label-visible` 28, `placeholder-not-label` 17, a11y `label` 13, erfundenes `kampo.label` 12, `tekstareo.label` 10. Nachher: `uzo-slot-accepts` 6, `uzo-slot-nesting` 3, a11y `aria-allowed-attr` 2; Beschriftungslücken im ganzen Lauf noch `field-label-visible` 1, `placeholder-not-label`, a11y `label`, `kampo.label`, `tekstareo.label` je 0. Vorbehalt: eine Wiederholung (Bewegungen innerhalb der Streuung 16,7 möglich; der Wechsel der Lücken ist das deutlichere Signal); gemessen ist #123 insgesamt (Beschriftung, Status M-2, `trailing`, 2.2), nicht 2.2 allein. **Kurzprofil `kampo`:** 740 von 750 Tokens (unverändert).

### AC-10 (Arkitekturo-Vertrag, D-09)

Chromium 153.0.8010.12 (Playwright 1.63.0), Viewport 1280 × 900, Skalierung 1, `reducedMotion: reduce`, Screenshot je Element mit `animations: "disabled"`, Vergleich mit `cmp` auf die PNG-Bytes. Seiten: Vitrino `#aspekto=komuna` hell und dunkel, jeder oberste Abschnitt mit einem der 12 Felder (15, ab `d095cc1e` mit „Status“ 16) und 75 Markups der 12 Felder ohne `label`-Attribut (63 aus den `*.spec.ts` von `packages/eroj/test` auf `367b7a52`, 12 ergänzt), je hell und dunkel. Skripte außerhalb des Repos (`/tmp/s035-ac10/`).

| Vergleich | Seiten/Zustände | Ergebnis |
|---|---|---|
| `ad0dd6ad` gegen `ad0dd6ad` (Wiederholbarkeit) | 32 Vitrino + 150 Beispiele | 182 von 182 byte-gleich |
| `a5bc2be5` (Code = `367b7a52`) gegen `2314e8b5` (Beschriftung von #123) | 30 Vitrino + 150 Beispiele | **180 von 180 byte-gleich** |
| `ad0dd6ad` (vor 2.2) gegen `fe98ef35` (deckt `57ab8ba7`, `c3fae550`, `fe98ef35`) | 32 Vitrino + 150 Beispiele | **182 von 182 byte-gleich** |

### Recherche vorher und nachher (lokal, Zusammenfassung)

Echte Marken nur lokal unter `/Users/thorstenjankowski/n8n-compose/20260918_fundamento-ds/.fundamento/spec035/marken/` (`ergebnis-4.1.md`); hier nur die Zusammenfassung ohne Bilder und ohne Werte. Vorher `/tmp/s035-main`, nachher `/tmp/s035-t4a` (`0516d45a`), ohne Modell, mit gegebener Adresse.

- **Synthetische Seite A** (im Repo, `packages/metiejo/src/test-doubles/weg-c/seite-a.html`): vorher nennt Weg C die Nebenfarbe aus dem CSS (`#d9480f`), nachher die prägende Farbe der Fläche (`#0b7285`); 2,4 s ohne Modell.
- **Marke 1:** prägend ist unbunt (Schwarz/Weiß auf hellem Grund); als Leitfarbe weder vorher noch nachher getroffen (die Leitfarbe verlangt eine bunte Farbe); die Neutraltöne sind nachher näher (fast unbunt statt getönt). Nicht blockiert.
- **Marke 2:** prägende Farbe vorher nicht getroffen, nachher in der Farbfamilie (etwas dunkler als die Markenfarbe). Nicht blockiert.

### Messung 4.7 (mit Modell)

31.10., Last 5,3, Reihenfolge D-03. **Weg C** (`packages/metiejo/scripts/abnahme-weg-c.ts --mit-modell` auf #127 `0516d45a`): beide Seiten gelesen, Leitfarbe `#0b7285` = prägende Farbe getroffen, keine Hinweise; 3 Anfragen, 1 294 / 108 Tokens, 0,00028 $, 6,2 s (Recherche 5,8 s). Beobachtung: der Schlusssatz des Modells behauptet, die Seiten nennten die Marke nicht – falsch (Titel und `h1` nennen sie); die Farbe ist davon unabhängig. **Weg A** (`abnahme-weg-a.ts --mit-modell` auf #129 `7a52ae0e`): 100 % freigegeben, exportierbar; 5 Anfragen, 7 927 / 186 Tokens, 0,00162 $, 27,2 s; Schätzung/gemessen Tokens 0,97, Dauer 1,46 (in ±50 %). „etwas wärmer“ wirkt; „etwas runder“ ging ans Reglerende, die Behauptung „vollständig abgerundet“ wurde durch den ehrlichen Satz ersetzt (D-85). Kein Akzent vorgeschlagen (Skriptbilder 0,058 auseinander, D-99). „Schlüssel in Kroniko oder Log: nein“, `pruefen --datei` auf Logs und Kroniko-Kopien sauber.

### Modellkosten

Nur `ministral-14b-2512`, zusammen höchstens 0,50 $. Preis 0,20 $ je 1 Mio. Tokens ein und aus (`packages/metiejo/data/prezoj.json`, am 31.10. auf docs.mistral.ai bestätigt; D-05). Ledger `kosten.tsv` der Nacht, offen reserviert 0,00 $.

| Lauf-ID | Zweck | Modell | Anfragen | Tokens ein / aus | Kosten $ | Dauer | Commit |
|---|---|---|---|---|---|---|---|
| `4.7-weg-c` | 4.7 Weg C, synthetische Seite (D-03: zuerst) | `ministral-14b-2512` | 3 | 1 294 / 108 | 0,00028 | 6,2 s | `0516d45a` |
| `4.7-weg-a` | 4.7 Weg A, `abnahme-weg-a.ts --mit-modell` | `ministral-14b-2512` | 5 | 7 927 / 186 | 0,00162 | 27,2 s | `7a52ae0e` |
| `2.2-reihe-k` | Reihe K nach 2.2 (Lauf `20261031-0044`) | `ministral-14b-2512` | 97 | 853 095 / 52 211 | 0,18106 | 5,7 min | `fe98ef35` |
| | **Summe** | nur `ministral-14b-2512` | 105 | 862 316 / 52 505 | **0,18296** | | |

## Abhängigkeiten

| Paket | Version | Lizenz | Art | Grund | Wo festgehalten |
|---|---|---|---|---|---|
| `playwright` | 1.63.0 (veröffentlicht 2026-09-04, `npm view` am 2026-10-30) | Apache-2.0 | `optionalDependencies` von `@fundamento/metiejo`, nur dynamischer `import()` bei Bedarf | Weg C rendert gelesene Seiten lokal und misst nach Fläche (4.1, V-2); JPG/JPEG und WebP werden über denselben Browser dekodiert (4.5.6, D-11). Gleiche Version wie `@playwright/test` in `packages/eroj` (Chromium-Revision 1243 geteilt); lag für die Nordstelo schon im Lockfile. | #127: `THIRD_PARTY_NOTICES.md` (Abschnitt „Playwright (optional runtime dependency, not a Fonto)“), `packages/metiejo/package.json`, `pnpm-lock.yaml` (+4 Zeilen); dieser plan |

Ohne installiertes Chromium misst Weg C nur aus CSS und HTML und sagt das in einem Satz; ein Upload in JPG/WebP wird gespeichert, und der Assistent sagt, dass seine Farben ohne Browser nicht messbar sind. Einmalige Installation: `pnpm --filter @fundamento/eroj exec playwright install chromium`. Der Start des MCP-Servers lädt Playwright nicht (Wächtertest, AC-11).

## Messanleitung

Alles im Checkout des Maintainers `/Users/thorstenjankowski/n8n-compose/20260918_fundamento-ds` (unten ausgeschrieben). Der Checkout steht auf `261029-spec-033-s6-schaetzung`. Wer dort nicht wechseln will, legt je PR einen Worktree an – `git -C /Users/thorstenjankowski/n8n-compose/20260918_fundamento-ds worktree add /tmp/pruefen-035-<teil> origin/<branch>` – und ersetzt in den Befehlen den Pfad des Checkouts durch den des Worktrees (die `file://`-Links unter `.fundamento/` bleiben). Aufräumen: `git -C /Users/thorstenjankowski/n8n-compose/20260918_fundamento-ds worktree remove /tmp/pruefen-035-<teil>`. Für Weg C und JPG/WebP einmalig Chromium (Abschnitt Abhängigkeiten).

### Teil 1 (#125, #126)

```sh
# #125: Bezugswert aus der Tabelle
cd /Users/thorstenjankowski/n8n-compose/20260918_fundamento-ds
git fetch origin && git switch --detach origin/261030-ableitung-kalibriert
pnpm install --frozen-lockfile && pnpm build
cd /Users/thorstenjankowski/n8n-compose/20260918_fundamento-ds/packages/eroj
pnpm exec playwright test --config playwright.vitrino.config.ts --project chromium -g "verdict of the derivation|Bezugswert of the derivation"
VITRINO_PARTO=werkstatt pnpm exec playwright test --config playwright.vitrino.config.ts --project chromium -g "Ableitung|M5"
# rot nachprüfen (Bezugswert noch 50): Expected 41.5 / Received 50
cd /Users/thorstenjankowski/n8n-compose/20260918_fundamento-ds && git switch --detach fe06ff4f
cd /Users/thorstenjankowski/n8n-compose/20260918_fundamento-ds/packages/eroj && pnpm exec playwright test --config playwright.vitrino.config.ts --project chromium -g "Bezugswert of the derivation"

# #126: M5 Gegenprobe 2 und AK-07
cd /Users/thorstenjankowski/n8n-compose/20260918_fundamento-ds
git switch --detach origin/261030-spec-035-t1-pruefungen && pnpm install --frozen-lockfile && pnpm build
cd /Users/thorstenjankowski/n8n-compose/20260918_fundamento-ds/packages/eroj
pnpm exec playwright test --config playwright.vitrino.config.ts -g "M5"
# rot 1.2 nachprüfen: 16000 Elemente, Stil und Layout 71.8 ms
cd /Users/thorstenjankowski/n8n-compose/20260918_fundamento-ds && git switch --detach 0c7a4945
cd /Users/thorstenjankowski/n8n-compose/20260918_fundamento-ds/packages/eroj && pnpm exec playwright test --config playwright.vitrino.config.ts -g "runner like #115"
# rot 1.3 nachprüfen: "expected 3 to be 1" und "Object.is equality"
cd /Users/thorstenjankowski/n8n-compose/20260918_fundamento-ds && git switch --detach 379c002b && pnpm build
cd /Users/thorstenjankowski/n8n-compose/20260918_fundamento-ds/packages/mcp && pnpm exec vitest run --project mcp src/ak07-start.test.ts
cd /Users/thorstenjankowski/n8n-compose/20260918_fundamento-ds/packages/modelo && pnpm exec vitest run --project modelo src/validate/resolutions.test.ts
```

**MCP perf (AK-07), in Ruhe, `main` gegen Teil 1 im Wechsel:**

```sh
git -C /Users/thorstenjankowski/n8n-compose/20260918_fundamento-ds worktree add --detach /tmp/pruefen-035-main 367b7a52
cd /tmp/pruefen-035-main && pnpm install --frozen-lockfile && pnpm build
cd /Users/thorstenjankowski/n8n-compose/20260918_fundamento-ds && git switch --detach origin/261030-spec-035-t1-pruefungen && pnpm build
for i in 1 2 3 4; do for d in /tmp/pruefen-035-main /Users/thorstenjankowski/n8n-compose/20260918_fundamento-ds; do uptime; (cd $d && env -u CI pnpm --filter @fundamento/mcp perf 2>&1 | grep "AK-07 start to first describe"); done; done
```

Erwartet: Teil 1 um 1750 ms, `main` um 1900 ms. Dateien: file:///Users/thorstenjankowski/n8n-compose/20260918_fundamento-ds/packages/eroj/test/ableitung-kalibrierung.tsv · file:///Users/thorstenjankowski/n8n-compose/20260918_fundamento-ds/packages/eroj/test/ableitung.ts · file:///Users/thorstenjankowski/n8n-compose/20260918_fundamento-ds/packages/eroj/test/m5.ts · file:///Users/thorstenjankowski/n8n-compose/20260918_fundamento-ds/packages/modelo/src/contracts/ajv.ts · file:///Users/thorstenjankowski/n8n-compose/20260918_fundamento-ds/packages/mcp/src/ak07-start.test.ts

### Teil 2 (#123, #130)

```sh
cd /Users/thorstenjankowski/n8n-compose/20260918_fundamento-ds
git fetch origin && git switch --detach origin/261030-spec-035-t2-figma     # enthält #123; für #123 allein: origin/261029-spec-029-2b1b-status
pnpm install --frozen-lockfile && pnpm build
rm -rf /Users/thorstenjankowski/n8n-compose/20260918_fundamento-ds/.fundamento/projekcioj-cxiuj
pnpm fm projekcioj build --config packages/modelo/test/fixtures/valid/aspekto-provo-kompakta/fundamento.cxiuj.config.json --out /Users/thorstenjankowski/n8n-compose/20260918_fundamento-ds/.fundamento/projekcioj-cxiuj
PLAYWRIGHT_ENGINES=chromium pnpm --filter @fundamento/eroj exec playwright test test/trailing-035.spec.ts test/befunde-2-3-035.spec.ts test/feldrand.spec.ts
```

**Vitrino:** file:///Users/thorstenjankowski/n8n-compose/20260918_fundamento-ds/.fundamento/projekcioj-cxiuj/vitrino/index.html#aspekto=komuna (dunkel: `#aspekto=komuna&color-scheme=dark`)
- 2.1: Abschnitte „Status der Felder“ und „Löschen“ – das Status-Icon des `kampo` steht im Feld am rechten Rand. Alle Teile zugleich zeigt eine Seite mit `<fm-kampo intent="warning" clearable loading value="Anna">Name</fm-kampo>`: Status-Icon, Spinner, ✕, alles im Rand.
- 2.2: `<fm-kampo label="E-Mail"></fm-kampo>` zeigt „E-Mail“ als Beschriftung, `<fm-kampo label="E-Mail">Name</fm-kampo>` zeigt „Name“. `get_ero` mit `{ "name": "kampo", "brief": true }` nennt `{ "name": "label", "type": "string", "shown": true }`; `check_usage` mit `{ "ero": "kampo", "label": "", "props": { "label": "E-Mail" } }` meldet nichts. Prompt: file:///Users/thorstenjankowski/n8n-compose/20260918_fundamento-ds/packages/mcp/prompts/gvidanto.md (Regel 8, letzter Satz); CHANGELOG: file:///Users/thorstenjankowski/n8n-compose/20260918_fundamento-ds/CHANGELOG.md („Unveröffentlicht“ › „Hinweis für Nutzer“).
- 2.3: Felder mit Wert und `clearable`: Kalender und ✕ des `datelektilo` wie Pfeil und ✕ der übrigen Felder; ein Feld mit `readonly` wie in Ruhe.
- Reihe K: file:///Users/thorstenjankowski/n8n-compose/20260918_fundamento-ds/.fundamento/nordstelo/20261031-0044/raporto.md (neu bewerten: `pnpm nordstelo restaro .fundamento/nordstelo/20261031-0044`).

**Figma-Plugin** (Desktop, nicht automatisierbar): Plugins → Development → Import plugin from manifest: `/Users/thorstenjankowski/n8n-compose/20260918_fundamento-ds/.fundamento/projekcioj-cxiuj/figma/plugin/manifest.json`; in einer neuen Datei laufen lassen, danach ein zweites Mal in derselben Datei.
1. 2.1: Set `kampo`, Variante `state=warning`, eine Instanz mit `loading` und `clearable` an: Text, Status-Icon, Spinner, ✕.
2. 2.3.1: Set `datelektilo`, `mode=single, expanded=false, state=rest` und `state=disabled` (auch `mode=range`): Kalender sichtbar, so groß wie der Pfeil im `elektilo` `size=medium, state=rest`; Ebene `trigger` mindestens 24 × 24; Glyph-Breite an `ero/datelektilo/trigger/size`; der Vektor gefüllt.
3. 2.3.2: Sets `markobutono` und `sxaltilo`, alle Varianten: Kästchen bzw. Spur links, Texte rechts – nach dem ersten und dem zweiten Lauf (bestätigt oder widerlegt D-60). `elekto`: in jeder Option das Kästchen links.
4. 2.3.3: je eine Instanz `datelektilo` und `kampo` (`size=medium`) mit `clearable`: ✕ gleich groß und gleich kräftig, Knopf ≥ 24 × 24.
5. 2.3.4: `kampo`, `datelektilo`, `listelektilo`, `plurelektilo`, je `state=readonly` neben `state=rest`, hell und dunkel: dieselbe Fläche, derselbe Rand, dieselbe Schrift und Beschriftung.
6. D-64: im offenen Kalender des `datelektilo` die Monatsknöpfe ansehen (dort malen sie heute nichts).

### Teil 3 (#128)

```sh
cd /Users/thorstenjankowski/n8n-compose/20260918_fundamento-ds
git fetch origin && git switch --detach origin/261030-spec-035-t3-studio
pnpm install --frozen-lockfile && pnpm build
pnpm --filter @fundamento/eroj exec playwright test --project=chromium test/studio-035.spec.ts
pnpm --filter @fundamento/metiejo exec vitest run src/studio-035.test.ts
pnpm fm metiejo --port 7301 --workdir /Users/thorstenjankowski/n8n-compose/20260918_fundamento-ds/.fundamento/pruefen-035-marken
```

**Studio:** http://localhost:7301/ öffnen, erfundene Marke „Quarzwelle“ (Basis „Leer“) anlegen.
- 3.1: http://localhost:7301/studio/quarzwelle/raum, `spacing.scale.400` = 18, Enter oder „Übernehmen“ → „Wert: 18px“, „gesetzt“, „Übernommen: …“.
- 3.2: http://localhost:7301/studio/quarzwelle/farbe, Farbe bei `color.palette.neutral.500` ändern → Zeile = Farbfeld.
- 3.3: Raum `size.scale.600` = 8, Enter → Feld wieder 32, Ablehnung am Feld (Regel `touch-target-min`, Vorschlag); http://localhost:7301/studio/quarzwelle/semantik, `color.text.default` → `color.palette.neutral.100` → Ablehnung am Feld.
- 3.4: zweites Fenster http://localhost:7301/asistanto/quarzwelle/spaco, im Studio einen Wert übernehmen → der Assistent zeigt ihn innerhalb von 3 s mit neuer `rev`.

### Teil 4 (#127, #129) und 4.7

```sh
# 4a (#127)
cd /Users/thorstenjankowski/n8n-compose/20260918_fundamento-ds
git fetch origin && git switch --detach origin/261030-spec-035-t4a-markenassistent
pnpm install --frozen-lockfile && pnpm build
pnpm --filter @fundamento/eroj exec playwright install chromium
pnpm --filter @fundamento/metiejo exec vitest run src/esploro src/enportilo
PLAYWRIGHT_ENGINES=chromium pnpm --filter @fundamento/eroj exec playwright test test/weg-c.spec.ts
pnpm --filter @fundamento/metiejo exec tsx scripts/abnahme-weg-c.ts                    # ohne Modell, 0 Tokens
pnpm --filter @fundamento/metiejo exec tsx scripts/abnahme-weg-c.ts --mit-modell       # 4.7, liest .env des Checkouts

# 4b (#129)
cd /Users/thorstenjankowski/n8n-compose/20260918_fundamento-ds
git switch --detach origin/261030-spec-035-t4b-markenassistent
pnpm install --frozen-lockfile && pnpm build
pnpm --filter @fundamento/agordilo exec vitest run src/pille.test.ts
pnpm --filter @fundamento/metiejo exec vitest run src/kreilo src/asistanto src/sxtupoj.test.ts src/servilo.test.ts src/ident.test.ts
pnpm --filter @fundamento/eroj exec playwright test test/metiejo.spec.ts              # drei Engines
cd /Users/thorstenjankowski/n8n-compose/20260918_fundamento-ds/packages/eroj && pnpm exec playwright test --config playwright.vitrino.config.ts -g "one step past the end"
cd /Users/thorstenjankowski/n8n-compose/20260918_fundamento-ds
pnpm --filter @fundamento/metiejo exec tsx scripts/abnahme-weg-a.ts --mit-modell       # 4.7, liest .env des Checkouts
pnpm fm projekcioj build --out /Users/thorstenjankowski/n8n-compose/20260918_fundamento-ds/.fundamento/projekcioj
pnpm fm metiejo --port 7301 --workdir /Users/thorstenjankowski/n8n-compose/20260918_fundamento-ds/.fundamento/pruefen-035-marken
```

**Assistent:** http://localhost:7301
- 4.5.5: Platzhalter im Namensfeld „Quendolin“; Name „!!!“ → Meldung mit „zum Beispiel „Quendolin““.
- 4.1/4.5.6 (#127): Assistent einer Marke, Schritt „Leitfarbe“: „Material deiner Marke“ nimmt PNG, SVG, PDF, JPG/JPEG, WebP; ein Link wird gerendert und nach Fläche gemessen (ohne Chromium ein Satz). Testseite: file:///Users/thorstenjankowski/n8n-compose/20260918_fundamento-ds/packages/metiejo/src/test-doubles/weg-c/seite-a.html. Echte Marken lokal: file:///Users/thorstenjankowski/n8n-compose/20260918_fundamento-ds/.fundamento/spec035/marken/ergebnis-4.1.md (Wiederholung: `cd /Users/thorstenjankowski/n8n-compose/20260918_fundamento-ds/.fundamento/spec035/marken && node vergleich.mjs <dist der Metiejo> <url> <name> [nachher]`).
- 4.2 (#129): Einstiegsfragen mit einem Bild aus zwei kräftigen, deutlich anderen Farben → Schritt „Leitfarbe und Akzente“ zeigt den Akzent mit Bild und Anteil als offenen Vorschlag.
- 4.3: Werkstatt file:///Users/thorstenjankowski/n8n-compose/20260918_fundamento-ds/.fundamento/projekcioj/vitrino/index.html#aspekto=komuna&modus=werkstatt – Radius-Regler ganz nach rechts: „Pille“, Knöpfe voll gerundet, Karten nicht. Im Chat „runder“ ab Stufe 1 → 2 → Pille → ehrliche Antwort am Ende.
- 4.4: Im Studio den Radius ändern → im Assistenten wird „Freigeben“ ohne Neuladen aktiv.
- 4.5.1: „Material deiner Marke“ mit einem PNG mit einer kräftigen Farbe, „Material lesen“ → ein Satz, Farbfläche, Ausschnitt, „Herkunft: …“; in der Mitte „Jetzt“ und „Mit dem Vorschlag“. 4.5.2: jedes Abzeichen der Leiste sichtbar, „Schriftfamilien, Schriftskala und Gewichte“ bricht um. 4.5.3: Chat mit Modell – `**fett**` erscheint fett, ohne Sterne. 4.5.4: Schnellstart „Farbe“/„Fertig“ einer Marke mit zu heller Leitfarbe → eine Meldung „… bei <n> Farbstufen.“.
- 4.7 erwartet: Weg C „prägende Farbe #0b7285 getroffen“, etwa 1 400 Tokens; Weg A 100 %, exportierbar, etwa 8 100 Tokens. Dateien: file:///Users/thorstenjankowski/n8n-compose/20260918_fundamento-ds/packages/metiejo/scripts/abnahme-weg-c.ts · file:///Users/thorstenjankowski/n8n-compose/20260918_fundamento-ds/packages/metiejo/scripts/abnahme-weg-a.ts · file:///Users/thorstenjankowski/n8n-compose/20260918_fundamento-ds/packages/metiejo/data/kreilo.json · file:///Users/thorstenjankowski/n8n-compose/20260918_fundamento-ds/packages/agordilo/data/wuensche.json

## Drei Skizzen

Zu 4.6 (D-14): nur Beschreibung, keine umgesetzt; Entscheidung beim Maintainer. Gemeinsamer Ausgangspunkt: Heute erklärt der Assistent in drei schmalen Spalten (Leiste, Vorschau, Chat mit vielen Feldern). Alle drei Skizzen machen die Marke selbst zur größten Fläche und lassen Text nur dort, wo er entscheidet. Jede ist mit den vorhandenen Eroj baubar.

**Skizze 1 – „Bühne“: große Vorschau mit Vorher/Nachher.** Die Vorschau wird zur Bühne und nimmt zwei Drittel der Breite. Sie zeigt eine Seite aus echten Eroj (Kopf, Knöpfe, Karte, Formular, Meldungen, hell und dunkel nebeneinander). Ein senkrechter Schieber teilt die Bühne in „jetzt“ (links) und „mit dem Vorschlag“ (rechts); bei schmalem Fenster wird aus dem Schieber ein Umschalter. Jeder Vorschlag – aus Material, Chat oder Regler – erscheint zuerst nur rechts; „Übernehmen“ zieht ihn nach links. Der Chat schrumpft auf eine Leiste unter der Bühne (Eingabe, letzte Antwort, Sprechen); Material und Recherche wandern in einen Dialog. Die Prüfung markiert direkt auf der Bühne, welche Komponente ein Problem hat (Rahmen in der Warnfarbe, Satz beim Darüberfahren). Gewinn: Jede Änderung ist sichtbar, bevor sie gilt. Aufwand: Layout des Assistenten, Vorschau mit zwei Zuständen (heute schon über `propono` möglich), Markierung der Prüfung je Komponente.

**Skizze 2 – „Markenbild wächst“: Fortschritt als Bild der Marke.** Statt Prozentbalken und Liste steht links ein Markenbild im Hochformat, das aus den zwölf Schritten zusammengesetzt wird: die Leitfarbe als große Fläche, die Neutraltöne als Grund, die Statusfarben als Streifen, der Name in der gewählten Schrift und Skala, die Ecken in der Form, der Rhythmus der Abstände, ein Schatten der Elevation, eine kleine Bewegung, eine Reihe Icons. Ein offener Schritt ist im Bild ein gestrichelter Platzhalter, ein definierter ist farbig, ein freigegebener bekommt ein Häkchen, „Prüfung offen“ ein Warnzeichen genau an seiner Stelle. Ein Klick auf einen Teil des Bildes öffnet den Schritt; die Liste bleibt für Tastatur und Screenreader als zweite Form derselben Navigation. Auf „Fertig“ ist dasselbe Bild das Ergebnis und Teil des Exports. Gewinn: Fortschritt ist nicht „42 %“, sondern sichtbar die eigene Marke. Aufwand: eine neue Sxablono „Markenbild“ aus Eroj und Tokens, Zustände je Schritt als Ebenen.

**Skizze 3 – „Moodboard“: Material als Wand.** Alles, was die Person mitbringt (Screenshots, Logos, PDF-Seiten, Schriftproben, gelesene Webseiten von Weg C), liegt als Wand aus Kacheln in der Mitte. Was der Enportilo misst, steht als Markierung an der Fundstelle: ein Farbpunkt mit Anteil, eine Messlinie am Radius, der Schriftname an der Zeile. Jede Markierung lässt sich auf einen Schritt ziehen („diese Farbe als Leitfarbe“, „dieser Radius für Bedienelemente“); Vorschläge erscheinen als Verbindung von der Kachel zum Schritt, mit Vorher/Nachher klein daneben. Was nicht übernommen wird, bleibt sichtbar auf der Wand – die Person sieht, woraus ihre Marke gemacht ist. Voraussetzung: Die Messung liefert Koordinaten der Fundstellen (heute nur Anteile, `enportilo/`), und Weg C behält seinen Screenshot lokal als Kachel. Gewinn: „Zeigen statt erklären“ für die Herkunft jedes Werts. Aufwand: Koordinaten im Enportilo, Wand mit Ziehen (Tastaturbedienung als Menü „Übernehmen in …“).

Empfehlung zur Reihenfolge, falls der Maintainer mehr als eine will: 1 zuerst (größter Gewinn, baut auf 4.5.1 auf), dann 3 (braucht Koordinaten aus dem Enportilo), 2 zuletzt (neue Sxablono).

## Blockiert

Keine. Kein Teil war blockiert, kein PR ist ein Entwurf, kein Modelllauf entfiel. Beim Maintainer liegen nur Abnahmen, keine Blockaden: die Sichtprüfung im Figma-Plugin (2.3, D-60), die einmalige Installation von Chromium für Weg C und JPG/WebP, und die Entscheidungen mit „zu bestätigen“/„zu entscheiden“.

## Bericht

**Stand 2026-10-31.** Sieben PRs offen, keiner gemergt, keiner Entwurf, alle mergeable. `main` hat sich über Nacht nicht bewegt (`origin/main` = `367b7a52`), kein PR muss gegen ein neues `main` geprüft werden. Keine Budgets und keine Grenzen angehoben. Modellkosten **0,18296 $** von 0,50 $, nur `ministral-14b-2512`. Kein Teil blockiert. Alle 25 Befunde der Spec erledigt; fünf neue Befunde offen. Prüfung gegen AC-1 bis AC-11: zehn erfüllt, AC-4 teilweise (B-6.1-1, eine eigene Testschwelle in #123 aus der Zeit vor der Nacht; die verbindliche Grenze bleibt). Plan: https://github.com/thojank/fundamento/blob/261030-spec-035-t1-pruefungen/specs/035-paket-abnahmen/plan.md

### PRs je Teil

| Teil | PR | Basis | Head | CI-Stand (Lauf) | rot → grün |
|---|---|---|---|---|---|
| 1 | #125 https://github.com/thojank/fundamento/pull/125 | `main` | `016997b6` | grün 14/14: 41157583649 (PR, langsamer Runner), 41157585241 (dispatch, schneller Runner) | 1.1: `0a409843` → `4a2fa096` (neu aufgesetzt von `2c70ff7c` → `c698cc08`); Bezugswert `fe06ff4f` → `016997b6` |
| 1 | #126 https://github.com/thojank/fundamento/pull/126 | `main` | `02fe48e6` (Code), danach nur Doku-Commits | 41144058506: Versuch 1 rot (M5 roh 151,6 ms, bekannter Zeittest), ein R-8-Neustart grün 14/14; Doku-Head `f668e128`: 41160397976 grün 14/14 ohne Neustart | 1.2: `0c7a4945` → `5f9bb4f6`; 1.3: `379c002b` → `02fe48e6`; Doku `85bc9fef` (Gerüst), `01d3c2a3` (plan, tasks, Bericht) und ein Folgecommit mit dieser SHA; Doku-Test rot `2dbc3fad` → grün im Doku-Commit „Prüfung gegen die Abnahmekriterien“ |
| 2 | #123 https://github.com/thojank/fundamento/pull/123 | `main` | `fe98ef35` | grün 14/14: 41151751470 | 2.1 (neu aufgesetzt): `a5bc2be5` → `2314e8b5`; `d095cc1e` → `ce0cb0fb`, `b298aa83`; Nachtrag `2826f1da` → `ad0dd6ad`. 2.2: `35ad207c` → `57ab8ba7`; `705fd5c8` → `c3fae550`; `3cffb3dd` → `fe98ef35` |
| 2 | #130 https://github.com/thojank/fundamento/pull/130 | `261029-spec-029-2b1b-status` (#123) | `58c92a70` | 41156141710 rot (Vitrino: Zählung beratender APCA-Hinweise, kein Zeittest) → Fix, grün 14/14: 41158327889 | 2.3.1: `7695868c` → `c306ba73`, Bildtest neu `f94947b6`; 2.3.3: `62bfa6b6` → `2649550a`; 2.3.2: `d68a2bad` → `ebdf4462`; 2.3.4: `5da4d081` → `363f881f`; CI: `363f881f` → `58c92a70` |
| 3 | #128 https://github.com/thojank/fundamento/pull/128 | `main` | `21580cb4` | 41144661915: Versuch 1 rot (M5 roh 151,4 ms, bekannter Zeittest), ein R-8-Neustart grün 14/14 | 3.1: `cc9ebac5` → `956f87a6` (+ WebKit `ad37b345`); 3.2: `bf2ab85e` → `d9cda543`; 3.3: `efddbdc9` → `bd1bb952`; 3.4: Test `a4883165` (grün beim ersten Lauf); Tests `22e1f1d8`, `21580cb4` |
| 4a | #127 https://github.com/thojank/fundamento/pull/127 | `main` | `0516d45a` | grün 14/14: 41143917177 | 4.1: `7cc4740e` → `e892938c` (+ `c5c0fb6f`, Wächter `53827d66`, Skript `0516d45a`); 4.5.6: `4f90b98a` → `e975e337` |
| 4b | #129 https://github.com/thojank/fundamento/pull/129 | `main` | `7a52ae0e` | grün 14/14: 41148292000 | 4.2: `e9792729` → `ed5defeb`; 4.3: `43227fba` → `56cb9018`; 4.4: `213cce1e` → `d337bcac`; 4.5.5: `05ccc448` → `9f1fa807`; 4.5.4: `5467226b` → `c364e575`; 4.5.2: `27c81b8e` → `20ef4f13`; 4.5.3: `ad5b075c` → `b078f58b`; 4.5.1: `2874d7c3` → `7a52ae0e` |

**Messanleitung je Teil:** im plan, Abschnitt „Messanleitung“ (vollständige Pfade im Checkout `/Users/thorstenjankowski/n8n-compose/20260918_fundamento-ds`, `cd`, `file://`-Links). Einstieg: Vitrino file:///Users/thorstenjankowski/n8n-compose/20260918_fundamento-ds/.fundamento/projekcioj-cxiuj/vitrino/index.html#aspekto=komuna (Teil 2), Figma-Plugin `/Users/thorstenjankowski/n8n-compose/20260918_fundamento-ds/.fundamento/projekcioj-cxiuj/figma/plugin/manifest.json` (Teil 2), Studio und Assistent über `pnpm fm metiejo --port 7301` → http://localhost:7301 (Teil 3, 4), MCP perf `env -u CI pnpm --filter @fundamento/mcp perf` (Teil 1), Modellläufe `pnpm --filter @fundamento/metiejo exec tsx scripts/abnahme-weg-c.ts --mit-modell` und `… abnahme-weg-a.ts --mit-modell` (4.7).

### Befunde

| Befund | Stand | Grund | PR |
|---|---|---|---|
| 1.1 | erledigt | 16 CI-Versuche auf dem neu aufgesetzten Head, Tabelle im Repo, Bezugswert 41,5 ms (Median der schnellen Runner) rot/grün gesetzt, Grenze 150 ms unverändert; Gegenprobe rot auf schnellem (179,0 ms) und langsamem Runner (180,4 ms). Spielraum je Klasse: B-5.1-1. | #125 |
| 1.2 | erledigt | Kalibrierung regelt nach (Median aus fünf Umschaltungen, drei Mediane in Folge ≥ 80 ms, Wachsen um ein Viertel), Obergrenze 1 024 000 Elemente mit Meldung; rot auf nachgespielten Läufern und mit CDP-Drosselung; M5 50 ms und Probe 80 ms unverändert. | #126 |
| 1.3 | erledigt | Ursache Datenwachstum aus #122 in Arbeit, die mit dem Modelo wächst; zwei Kosten entfernt (D-06, byte-gleich mit #123). In Ruhe 1744 ms gegen `main` 1901 ms (Ziel ≤ 1900 ms erreicht), Budget 2000 ms unverändert. | #126 |
| 2.1 | erledigt | #123 auf `367b7a52` neu aufgesetzt, rote Commits erneut rot; Reihenfolge am Feldrand laut `trailing` (Status-Icon → Spinner → ✕ → Feld-Icon, im Rand) in Web und Figma; kein Bild geändert. Status-Icon nur am `kampo` (D-47, zu bestätigen). | #123 |
| 2.2 | erledigt | Einfachste Schreibweise ergibt sichtbare Beschriftung; drei Lücken rot/grün geschlossen; Kurzprofil `kampo` 740 < 750; AC-10 180/180 und 182/182 byte-gleich; D-04 additiv (zu bestätigen); Reihe K F 83,9 gegen K 76,0. | #123 |
| 2.3.1 | erledigt | Kalender des `datelektilo` so groß wie der Pfeil und gefüllt (Figma), 16 statt 24 px (Web); Bildtest neu `f94947b6`. Sichtprüfung im Plugin: Maintainer. | #130 |
| 2.3.2 | erledigt | Kästchen von `markobutono` und `sxaltilo` in Figma links (Plugin verschiebt nur nach vorn), `elekto` war richtig; Lesart von `insertChild` im Plugin zu bestätigen (D-60). | #130 |
| 2.3.3 | erledigt | ✕ des `datelektilo` wie beim `kampo` (16 px, Knopf `small`, Ziel ≥ 24 px) in Web und Figma. | #130 |
| 2.3.4 | erledigt | V-1: die Fonto ist einheitlich → schreibgeschützt = Ruhe für alle zwölf Felder. | #130 |
| 3.1 | erledigt | `POST` an Studio- und Komponentenseiten wird verarbeitet (Entwurf, `rev`, Prüfung, Rückmeldung); Enter und „Übernehmen“ gleich; drei Engines. | #128 |
| 3.2 | erledigt | Seite nach jeder Änderung vom Server: Zeile und Farbfeld zeigen denselben Stand. | #128 |
| 3.3 | erledigt | Ablehnung am Feld mit Regel und Vorschlag, Wert zurückgesetzt. | #128 |
| 3.4 | erledigt | Abgleich über `rev` mit zwei Seiten belegt; grün beim ersten Lauf, keine Codeänderung (Gegenproben rot). | #128 |
| 4.1 | erledigt | Weg C rendert (Chromium optional, verzögert) und misst nach Fläche mit Gewicht für Logo und ersten Bildschirm; blockiert → ein Satz; ohne Browser → CSS + ein Satz; Fixture-Test rot→grün, echtes Chromium im Eroj-Test; synthetische Seite und Marke 2 nachher getroffen, Marke 1 unbunt. | #127 |
| 4.2 | erledigt | Weg A schlägt einen zweiten, deutlich anderen Akzent mit Herkunft vor (Test: 25 % Fläche, Abstand 0,292); gesetzt wird er nicht (D-80, zu bestätigen). Im Lauf 4.7 kein Akzent, weil die Skriptbilder keinen haben (D-99). | #129 |
| 4.3 | erledigt | „Pille“ über Regler und Chat, Karten begrenzt, Stufen 0 · 0,5 · 1 · 2 · Pille, ehrliche Antwort am Reglerende (im Lauf 4.7 gegriffen). | #129 |
| 4.4 | erledigt | Nach einer Änderung im Chat ist der Schritt freigebbar; die Seite schaltet „Freigeben“ ohne Neuladen. | #129 |
| 4.5.1 | erledigt | Vorschlag zeigt Farbfläche, Ausschnitt (das Bild als Kachel) und Vorher/Nachher an echten Eroj, Text ein Satz. | #129 |
| 4.5.2 | erledigt | Zustand je Schritt sichtbar, lange Namen brechen um. | #129 |
| 4.5.3 | erledigt | Kein rohes Markdown (`fm-markdovido`), kein HTML aus dem Modell (Test mit `<img onerror>`/`<script>`). | #129 |
| 4.5.4 | erledigt | Gleiche Warnungen mit gleichem Vorschlag als eine Meldung mit Zahl der Stufen. | #129 |
| 4.5.5 | erledigt | Erfundener Platzhalter „Quendolin“ (Websuche, Markenliste sauber; Registerrecherche beim Maintainer). | #129 |
| 4.5.6 | erledigt | JPG/JPEG und WebP in Material und Inspiration, Bytes geprüft, über den Browser dekodiert; ohne Browser gespeichert und ein Satz. | #127 |
| 4.6 | erledigt | Drei Skizzen im plan (Beschreibung, D-14); Entscheidung beim Maintainer. | plan |
| 4.7 | erledigt | Weg C und Weg A mit `ministral-14b-2512`: Tokens, Kosten, Dauer im plan (0,00028 $ und 0,00162 $). | #127, #129 |

**Zahl:** 25 erledigt, 0 teilweise, 0 offen.

**Neue Befunde aus dem Lauf (offen):**

| Befund | Inhalt | Was der Maintainer tun kann |
|---|---|---|
| B-5.1-1 | Mit 41,5 ms hat ein langsamer Runner mehr Spielraum als ein schneller (rot ab 226–231 ms = ×1,60 seines Medians, schnell ab 150–167 ms = ×1,46); mit 50 ms war es umgekehrt. Gleichen Spielraum gäbe ein Bezugswert um 45 ms. Die Gegenprobe ist mit beiden Werten überall rot. | Formel der Spec bestätigen oder ≈ 45 ms wählen (D-109). |
| B-5.1-2 | Zwei rote Kalibrierversuche in anderen Zeittests: G5 „Skripte blockieren 61 ms in einem Frame (Grenze 50 ms)“ (https://github.com/thojank/fundamento/actions/runs/41140304922/job/124356708815) und Gegenprobe 2 76,4 ms auf dem alten Stand (= Befund 1.2, in #126 behoben). G5 kann auf langsamen Runnern rot werden und steht nicht in R-8. | Entscheiden, ob G5 wie M5 kalibriert wird. |
| B-5.1-3 | Konflikt beim Merge am Dateiende von `packages/eroj/test/vitrino.check.ts` (#125 und #123/#130 hängen beide an). | Beim Merge von #123 beide Blöcke behalten. |
| D-64 | Monatsknöpfe prev/next im offenen Kalender des `datelektilo` in Figma ohne Größe und Füllung. | Eigener Befund für eine Folgerunde. |
| B-6.1-1 | Prüfung AC-4: In #123 misst `packages/modelo/src/data/felder-2b.test.ts` › „the kampo: its flags, and its brief well under 750“ das Kurzprofil des `kampo` jetzt mit „< 750“ statt „≤ 700“ (aus `2537e469`, Spec 029 ②b-1b, vor dieser Nacht; im PR-Text von #123 genannt). Die verbindliche Grenze 750 (`packages/modelo/src/gvidanto/eroj.test.ts` › „every brief stays under 750“) bleibt; gemessen 740. Streng gelesen ist das eine gelockerte eigene Schwelle. | Bestätigen (700 war das Maß von ②b-1 allein) oder in #123 eine engere eigene Schwelle setzen, z. B. „≤ 740“ (D-118). |

Beobachtungen ohne eigenen Befund: der Satz „ohne Browser“ von 4a bei der Inspiration erscheint erst nach einer kleinen Änderung im Kreilo-Client (D-95, nach dem Merge von #127); `ekrano.ts` nutzt `freigabeOf` noch nicht (D-96); das Skript von Weg A zeigt keinen Akzent (D-99); der Schlusssatz des Modells in Weg C behauptete fälschlich, die Seiten nennten die Marke nicht (Farbe unabhängig davon richtig).

### Entscheidungen

V-1, V-2, V-3 und D-01 bis D-14 angewandt; D-15 bis D-119 aus dem Lauf (Tabelle im Abschnitt „Entscheidungen, vom Maintainer zu bestätigen“, mit Zuordnung der vorläufigen IDs). Alle sind zu bestätigen; ausdrücklich zur Bestätigung gestellt: **V-1, V-2, V-3, D-04** (`label` additiv), **D-16** (Attrappen in Testdateien nur Hinweis), **D-20** (Git-Identität mit dem Wort aus R-12), **D-44** (Schlüssel der Token-Erweiterung), **D-47** (Status-Icon nur am `kampo`), **D-60** (Lesart von `insertChild`), **D-74** (Challenge-Erkennung auch für Weg-B-Links), **D-80** (Akzent nur als Vorschlag), **D-89** (Umbruch von `fm-navigado`), **D-109** (Bezugswert mit B-5.1-1). Zu entscheiden: **D-64**, **D-95**, **D-96**, **D-99**, **D-118** (mit B-6.1-1).

### Messungen

- **AK-07 vorher/nachher (in Ruhe):** `main` 1901 ms → Teil 1 **1744 ms** (8 von 8 Paaren schneller, Ziel ≤ 1900 ms erreicht); nach Teil 4: 4a 1909,5 gegen 1907,5 ms, 4b 1901,5 gegen 1890 ms (unverändert), Playwright nicht im Start (Wächtertest). Unter Last (PAK-1.3) Teil 1 in 13 von 16 Paaren schneller.
- **Gegenprobe 2 je Runner:** mit der neuen Kalibrierung in der CI 24 500 Elemente, 97,5 ms gehalten (mittlerer Runner), unter CDP ×4 5 360 Elemente, 87,4 ms; alter Stand einmal 76,4 ms rot (langsamer Runner, B-5.1-2), sonst 83–97 ms; lokal nachgespielt „wie #115“ alt 71,8 ms rot → neu 99,8 ms.
- **Ableitung je Runner:** schnell Referenz 41,5 ms (38,7–46,2), Ableitung 103,1 ms; mittel 50,8 / 118,0 ms; langsam 63,95 / 144,6 ms (16 Versuche). Bezugswert 41,5 ms.
- **Kennzahl K nach 2.2:** F 83,9 gegen 0 33,3 (Nachlese 11; Bezug K 76,0), Spec 030 82,6 gegen 50,7; K4 0,56 → 0,85; eine Wiederholung.
- **Recherche vorher/nachher (lokal):** synthetische Seite vorher Nebenfarbe, nachher prägende Farbe; Marke 1 unbunt, als Leitfarbe weder vorher noch nachher, Neutraltöne nachher näher; Marke 2 vorher nicht, nachher in der Farbfamilie; keine blockiert.
- **Kosten des Pakets:** 0,18296 $ (Reihe K 0,18106 $, Weg A 0,00162 $, Weg C 0,00028 $), nur `ministral-14b-2512`, 105 Anfragen, 862 316 / 52 505 Tokens.

### Neustarts bekannter Zeittests (R-8)

| PR | Head | Job | Lauf | Ergebnis |
|---|---|---|---|---|
| #126 | `02fe48e6` | Rendered checks (Make Kit, Quickstart, Vitrino-Werkstatt) | 41144058506 | Versuch 1 rot: M5 Ableitung median 151,6 ms > 150 (https://github.com/thojank/fundamento/actions/runs/41144058506/job/124364872792); ein Neustart → Versuch 2 grün (M5 117,1 ms; Gegenprobe 2 97,5 ms gehalten) |
| #128 | `21580cb4` | Rendered checks (Make Kit, Quickstart, Vitrino-Werkstatt) | 41144661915 | Versuch 1 rot: M5 Ableitung median 151,4 ms > 150 (https://github.com/thojank/fundamento/actions/runs/41144661915/job/124366836425); ein Neustart → Versuch 2 grün (M5 133,2 ms) |

Kein dritter Versuch. Beide Rote sind der Fall, den #125 behebt (M5 roh gegen 150 ms auf einem langsamen Runner). Die Kalibrierläufe von #125 sind keine R-8-Neustarts (D-25).

### `main`

`origin/main` = `367b7a52` am Ende des Laufs (31.10., nach `git fetch`): **nicht bewegt.** Kein PR hat Konflikte mit einem neuen `main`.

### Prüfung gegen die Abnahmekriterien (PAK-6.1)

Geprüft am 31.10. nach `git fetch`, mit Skripten außerhalb des Repos (`/tmp/s035-werkzeug/audit-*`); Einzelheiten im Beitrag PAK-6.1. Der Doku-Test `packages/modelo/src/docs/docs.test.ts` › „Spec 035 documentation (specs/035-paket-abnahmen)“ prüft AC-1, AC-5, AC-8, AC-9, AC-10 im plan und diesen Abschnitt (rot `2dbc3fad`, grün mit diesem Doku-Commit).

| AC | Ergebnis | Beleg |
|---|---|---|
| AC-1 | erfüllt | SHA-256 von `spec.md` = `472d2c443219a5b0c07945756386bd7d88e6a4d8db55ddd652143146f6be264a`; `plan.md` und `tasks.md` daneben (Doku-Test). |
| AC-2 | erfüllt | Sieben PRs offen, keiner gemergt, kein Entwurf, kein Auto-Merge, alle mergeable; Basis `main`, #130 `261029-spec-029-2b1b-status` (D-08, enthält `fe98ef35`); jeder Branch enthält `367b7a52`; #123 und #125 neu aufgesetzt; `origin/main` = `367b7a52`, nicht bewegt. |
| AC-3 | erfüllt | Jedes rote Commit liegt vor seinem grünen auf dem Branch. Neu ausgeführt: alle 22 Vitest-Paare (rot am roten Commit, grün am grünen, je mit dem dokumentierten Grund) und 18 Playwright-Paare in Chromium (1.1 Urteil und Bezugswert, 1.2 auf nachgespielten Läufern, 2.1 Beschriftung, Status und Reihenfolge laut `trailing`, 2.3.1, 2.3.3, 2.3.4, 3.1, 3.2, 3.3, 4.1, 4.4, 4.5.1, 4.5.2, 4.5.3, 4.5.6). Zitiert aus den Belegen der Tickets: die Werkstatt-Läufe „Ableitung“ und „M5“ von 1.1, 1.2 unter CDP-Drosselung (nicht deterministisch), 3.1 in WebKit (`ad37b345`, zeitabhängig), 3.4 (grün beim ersten Lauf, mit Gegenproben), 4.3 im Werkstatt-Lauf der Vitrino, das ganze Bild der Figma-Sets zu 2.1 und 2.3 und der CI-Fix von #130 (`363f881f` → `58c92a70`, bestehender Test, D-106). |
| AC-4 | teilweise | Alle geänderten Zeilen der sieben Diffs gegen `367b7a52` mit Grenzen, Budgets, Toleranzen, Zeitlimits und Vergleichsargumenten durchgesehen (144 Zeilen, alle im Beitrag PAK-6.1 mit Urteil). Geändert wurde als Bezugswert nur D-13 (#125: 50 → 41,5 ms); die Grenze 150 ms, M5 50 ms, Probe 80 ms, AK-07 2000 ms, Kurzprofil 750, Timeouts und `timeout-minutes` sind unverändert. Die Last der Gegenprobe von #125 (60 → 80 ms × k, im Original von #125) ist die Größe der Probe, keine Grenze; ebenso die Obergrenze der Elemente von Gegenprobe 2 (2 000 000 → 1 024 000). Ein Treffer: B-6.1-1 (#123, aus der Zeit vor der Nacht). |
| AC-5 | erfüllt | 0,18296 $ ≤ 0,50 $, drei Läufe, nur `ministral-14b-2512`, jeder mit Tokens, Kosten, Dauer und Commit; Summe aus den Zeilen nachgerechnet (Doku-Test). |
| AC-6 | erfüllt | `pruefen` über die sieben Diffs gegen `367b7a52` und #130 gegen `fe98ef35` (hinzugefügte Zeilen, Pfade, Commit-Nachrichten) und alle PR-Texte: 0 Treffer; ausgenommen sind nur die wortgleiche `spec.md` (D-07) und der erzeugte Token-ID-Schlüssel (D-46). Lokale Ergebnisse liegen unter `/Users/thorstenjankowski/n8n-compose/20260918_fundamento-ds/.fundamento/spec035/marken/` (11 Dateien: Ergebnis 4.1, je Marke vorher und nachher, Vergleichsskript, Liste). |
| AC-7 | erfüllt | `pruefen` über dieselben Diffs, Nachrichten und PR-Texte, die 19 Beiträge und 624 Dateien unter `/tmp/s035-logs`: kein Schlüssel, keine Variable mit Wert. Zwei lokale Logs hatten den alten Platzhalter aus `main` (eine echte Marke, kein Schlüssel) und sind bereinigt (D-117). Bekannt und akzeptiert: die Git-Identität (D-20). |
| AC-8 | erfüllt | V-1 bis V-3, D-01 bis D-14 und D-15 bis D-119 je mit einer Zeile; jede im plan genannte D hat ihre Zeile; „Blockiert“ vorhanden (Doku-Test). |
| AC-9 | erfüllt | Bericht nach dem Abschnitt „Bericht“ der Spec; alle 25 Befunde mit Stand, je PR ein Link (Doku-Test). |
| AC-10 | erfüllt | Vergleich von PAK-2.3 einmal neu: `ad0dd6ad` gegen `fe98ef35`, beide neu gebaut, Chromium 153.0.8010.12, **182 von 182 PNG byte-gleich**; Bildtests 2.1 und 2.3.1–2.3.4 einzeln mit fünf Angaben, D-04 im plan (Doku-Test). |
| AC-11 | erfüllt | Auf #127 (`0516d45a`): `packages/metiejo/src/esploro/start-ohne-playwright.test.ts` 4 von 4, Rückfall ohne Browser (`weg-c.test.ts` › „the import of Playwright fails …“, „Chromium does not start …“; `jpg-webp.test.ts` › „JPG and WebP without a browser …“) grün, 20 von 20 in den drei Dateien; Abschnitt „Playwright (optional runtime dependency, not a Fonto)“ in `THIRD_PARTY_NOTICES.md`; `pnpm check:fontoj` 0 Fehler; AK-07 in Ruhe 4a 1909,5 gegen 1907,5 ms. |

**Abgleich über plan, tasks, PR-Texte und Bericht:** Stand der Befunde, rote und grüne SHAs je PR und die Zahlen (AK-07 1901 → 1744 ms, K 83,9, Kosten 0,18296 $, Bezugswert 41,5 ms, AC-10 180/180 und 182/182) stimmen überein; jede SHA aus den Bericht-Zeilen steht im PR-Text und in `tasks.md`. Zusätzliche SHAs in den PR-Texten sind die genannten Stände vor dem Neuaufsetzen (#123) und der Doku-Head von #126. Keine Abweichung.

### Was der Maintainer am Morgen tun soll, in Reihenfolge

Die Reihenfolge folgt der Merge-Simulation (`git merge-tree`, nacheinander auf `367b7a52`, nichts gemergt): #125 → #126 → #123 → #130 → #128 → #127 → #129, mit genau einem Konflikt.

1. Bericht lesen; „Blockiert“ ist leer. V-1 bis V-3 und die Entscheidungen oben bestätigen oder ändern (zuerst D-04, D-44, D-47, D-80, D-109 mit B-5.1-1, D-118 mit B-6.1-1).
2. Einmalig Chromium für Weg C und JPG/WebP: `cd /Users/thorstenjankowski/n8n-compose/20260918_fundamento-ds && pnpm --filter @fundamento/eroj exec playwright install chromium`.
3. **#125** abnehmen und mergen (Prüfungen zuerst; nimmt das M5-Rot auf langsamen Runnern aus allen folgenden PRs). B-5.1-1 entscheiden.
4. **#126** abnehmen (AK-07 in Ruhe nachmessen, Messanleitung Teil 1) und mergen. Danach prüfen: `packages/eroj/test/vitrino.check.ts` (mit #125 konfliktfrei). Die acht D-06-Dateien werden in #123 zu Nulländerungen.
5. **#123** abnehmen (Vitrino, Beschriftung, D-04/D-44/D-47) und mergen. **Ein Konflikt** am Dateiende von `packages/eroj/test/vitrino.check.ts`: #125 hängt „the verdict of the derivation“ und „the Bezugswert of the derivation …“ an, #123 „the status of the fields: messages and the kampo's sign, axe-clean“ – beide Blöcke behalten, keine fachliche Entscheidung. Danach springt die Basis von #130 auf `main`.
6. **#130** im Figma-Plugin abnehmen (Messanleitung Teil 2, Punkte 1–6; bestätigt D-60), D-64 entscheiden, mergen. Danach `vitrino.check.ts` erneut ansehen (#130 enthält den Block von #123).
7. **#128** im Studio abnehmen und mergen. Überschneidung mit #127/#129: `packages/metiejo/src/servilo.ts`, `packages/metiejo/src/html.ts` (konfliktfrei in der Simulation).
8. **#127** (4a) abnehmen – Weg C mit einer echten Marke lokal, JPG/WebP – und mergen. Danach prüfen: `servilo.ts`, `packages/metiejo/src/asistanto/ekrano.ts`.
9. **#129** (4b) abnehmen und mergen. Danach prüfen: die Zeile im rev-Poll von `html.ts` (D-70, `studioSendet` aus #128 neben `sending`), D-95 (Satz von 4a vor der Weiterleitung) und D-96; D-80, D-99 und die drei Skizzen (4.6) entscheiden.
10. Nach jedem Merge die übrigen PRs auf Konflikte prüfen. Dateien, die sich überschneiden: `packages/eroj/test/vitrino.check.ts` (#125, #126, #123, #130, #129); die acht D-06-Dateien (#126, #123, byte-gleich); `packages/metiejo/src/servilo.ts` (#127, #128, #129); `packages/metiejo/src/html.ts` (#128, #129); `packages/metiejo/src/asistanto/ekrano.ts` (#127, #129); #130 teilt 29 Dateien mit #123 (gestapelt, ohne Konflikt).
11. Nach dem Merge von #127 und #129 die Messung 4.7 aus `main` wiederholen (Messanleitung Teil 4).
