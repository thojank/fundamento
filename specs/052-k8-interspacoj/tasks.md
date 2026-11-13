# Spec 052 – Aufgaben (K8 `interspacoj`: Abstände zwischen Geschwistern)

**Spec:** [`spec.md`](spec.md) · **Technische Spec:** [`technische-spec.md`](technische-spec.md) · **Plan:** [`plan.md`](plan.md) · **Basis:** `origin/main` `c439918f` · **Branch:** `261113-k8-interspacoj-abstnde--c719b4`

Sechs Tickets, ein Strang, streng nacheinander (D-052-08): `K8I-001 → K8I-002 → K8I-003 → K8I-004 → K8I-005 → K8I-006`. Commits lokal mit dem Präfix `Spec 052 K8I-00n: …` (Englisch), immer mit expliziten Pfaden. Kein Push, kein Merge, kein PR in den Tickets. Den einen PR öffnet der Orchestrator nach der QA. Jedes Ticket trägt hier seinen Stand ein: Commits mit SHA, Befehle, Ergebnisse.

| Ticket | Phase | Inhalt | hängt ab von | Stand |
|---|---|---|---|---|
| K8I-001 | 1 Grundlage | Start prüfen (052 frei, Basis-Diff), Spec-Ordner, Jugxo D-052-01, Entscheidungen D-052-02 … -09 | – | erledigt 2026-11-13 |
| K8I-002 | 2 Rote Tests | Rote Tests A und B, Fixtures aus M-1 (`anmelden-m1`, `konto-m1`), Gegenproben (a)–(d), 3c; Typ `verteilita` (V-1) | K8I-001 | erledigt 2026-11-13 (rot belegt) |
| K8I-003 | 3 Fixes | Fix A: leere Live-Bereiche im Projektor (`data-fm-leer`), Neubau Eroj, Baselines nach D-052-06 | K8I-002 | erledigt 2026-11-13 (`konto-m1` rot bis K8I-004) |
| K8I-004 | 3 Fixes | Fix B: Flat-Tree-Messung, `verteilita` nach D-052-01, Zwilling, `k8.ts`, Marker D-052-05 | K8I-003 | erledigt 2026-11-13 (`konto-m1`, `anmelden-m1` = 1 in allen 8 Kombinationen); Folge K8I-004b (B-004-4, D-052-13) erledigt 2026-11-13 |
| K8I-005 | 4 Nachweis | Neubewertung M-1 (Kontrolle und gerendert) ohne Modell, `neubewertung.md`, Rest C als Befund | K8I-004 | erledigt 2026-11-13 (Kontrolle 8/8 byte-gleich; gerendert F 4/4 statt erwartet 3/4, F-052-1) |
| K8I-006 | 5 Tests | Test-Ticket: Gesamtstand, AC-Matrix vollständig, Querschnitt | K8I-005 | erledigt 2026-11-13 (AC-Matrix unten, `konto-m1-plena` = 1 in allen 8 Kombinationen) |

## AC-Zuordnung (AC → Ticket → Test)

Geplante Belege. Datei- und Testnamen stehen fest, sobald das Ticket sie anlegt; K8I-006 füllt die Matrix mit den echten Namen und Ergebnissen (siehe [AC-Matrix K8I-006](#k8i-006-im-einzelnen-gesamtstand-ac-matrix-querschnitt), dort geprüft).

| AC | Inhalt (kurz) | Ticket | Test bzw. Befehl |
|---|---|---|---|
| AC-A1 | `fm-sxelo`, leeres `notices`: nav → main = `spacing.medium` ± 0,5, 4 Marken × hell/dunkel | K8I-002 (rot), K8I-003 | neue Eroj-Spec in `packages/eroj/test/` (Fall 1), Chromium; K8I-006 auch Firefox und WebKit |
| AC-A2 | Leerer Live-Bereich bleibt im Accessibility-Baum; gefüllt nimmt er Platz ein | K8I-002 (rot), K8I-003 | dieselbe Eroj-Spec (Fälle 2, 3, 4 Sprunglink) |
| AC-A3 | Regel aus `region.live` der Skemo für jede Sxablono mit `live`, kein Name im Element | K8I-002 (rot), K8I-003, K8I-006 | projekcioj-Unit (Liste der Live-Bereiche, Test-Kopie mit `live` an anderem Bereich); Eroj-Spec Fall 5 (`fm-filtrilo`); K8I-006: Menge aus der Modelo abgeleitet |
| AC-A4 | Sxablonoj ohne `live` byte-gleich; betroffene Bilder namentlich, alle anderen pixelgleich | K8I-002 (Guard), K8I-003 | projekcioj-Guard (SHA-256 je Sxablono, auch `inline: true`); Inventur und `cmp`-Vergleich nach D-052-06 in `plan.md` (K8I-003: Bildreferenzen betroffen: keine; 90 Bilder, 40 namentlich geändert – alle mit leerem `notices` –, 50 byte-gleich) |
| AC-B1 | Paare wie bisher, Abstand zwischen Flat-Tree-Kästen unter dem nächsten gemeinsamen Vorfahren | K8I-002 (rot), K8I-004 | nordstelo `src/k8/interspacoj-052.test.ts` (`konto-m1`, `anmelden-m1`); `faktoj.test.ts` |
| AC-B2 | `verteilita` nur für Eroj und Sxablonoj (alle drei Bedingungen von D-052-01) | K8I-002 (rot), K8I-004 | `interspacoj-052.test.ts` Gegenproben (c), (d1), (d2), (3c), (e1)–(e3) (K8I-004b, D-052-13): kein Paar `verteilita`; `k8.test.ts` (V-2) |
| AC-B3 | Gegenproben (a)–(d) bleiben rot, jede zuerst rot belegt | K8I-002, K8I-004 | `interspacoj-052.test.ts` mit Selbsttest der gelockerten Fakten (K8I-002); Zwischenstand ohne Bedingung 2 und 3 rot (K8I-004, Build-Log); (e1)–(e3) rot vor D-052-13 (K8I-004b, `81d51d05`, `906e835b`) |
| AC-B4 | Jugxo mit Kialo vor dem Code | **K8I-001** | `plan.md` › D-052-01; Commit K8I-001 liegt vor jedem Code-Commit |
| AC-B5 | Zwilling identisch; gespeicherte Fakten ohne Feld wie bisher | K8I-004, K8I-006 | `zwilling.test.ts` (Fall mit `verteilita`), `gegenprobe.test.ts`, `determinismo.test.ts`; `roh`/`sxablono` byte-gleich (`git diff --exit-code`) |
| AC-C1 | Rest C nur Befund, nichts an `fm-atributlisto` oder Inline-Messung | K8I-005 | `neubewertung.md` Abschnitt 5 (Werte je Marke × Schema, beide Erklärungen, `NAMED_SLOTS`, Folge-Spec); K8I-005 ändert nur `specs/052-k8-interspacoj/**`; Diff-Beleg in K8I-006 |
| AC-N1 | Kontrolle: gespeicherte M-1-Fakten byte-gleich, Urteil F 0/4 | K8I-005 | (a) `node specs/050-mvp-probelauf/pruefen.mjs` Exit 0, F 0/4, 0 0/4; (b) `neubewertung.mjs --roh <M-1-Lauf> --nur-kontrolle` Exit 0, 8/8 byte-gleich (D-052-09, `daten/neubewertung/kontrolle.json`) |
| AC-N2 | Gerendert: wie viele der 4 F-Screens grün (erwartet 3) | K8I-005 | `node specs/052-k8-interspacoj/neubewertung.mjs --roh <M-1-Lauf>` → **F 4/4**, 0 0/4 (F-052-1); `pruefen.mjs --daten specs/052-k8-interspacoj/daten/neubewertung --ohne-bericht` Exit 0 |
| AC-N3 | Fixture vorher rot, nachher grün (`anmelden-m1`, `konto-m1`) | K8I-002 (rot), K8I-003, K8I-004 | `interspacoj-052.test.ts` (CI-Job `unit (nordstelo)`, D-052-03) |
| AC-N4 | Neue Tests zuerst rot; bestehende Suiten grün außer den drei fremden | K8I-002 … K8I-006 | rote Commits je Paket (K8I-002); Paketläufe K8I-006 |
| AC-N5 | Bericht: gespeichert · Kontrolle · gerendert, `verteilita` nach Herkunft, Variante 0 | K8I-005 | `neubewertung.md` Abschnitte 3, 6, 7; Selbstprüfung `neubewertung.mjs --selbstpruefung` (Exit 5 bei Agenten-Paar oder `verteilita` in Variante 0, belegt an zwei Kopien in `/tmp`) |
| AC-N6 | Sauberer Probelauf nur vorbereitet | K8I-005 | `neubewertung.md` Abschnitt 10: Befehl, `--max-tokens 1562000`, ≈ 3,75 $, Lastbedingung, keine fremde Messung, „nicht gestartet“; Commit als Platzhalter |
| AC-G1 | Keine Schwelle, Toleranz, Grenze, Zeitlimit angehoben | K8I-006 | Test bzw. Diff-Beleg `AUF_STUFO === 0.5`, `k8Plena`; `git diff c439918f -- '**/vitest*.config.ts' '**/playwright*.config.ts' .github turbo.json` |
| AC-G2 | Ein PR vom aktuellen `main`, nichts gemergt | Orchestrator | – |
| AC-G3 | Kein Modell-Lauf | alle | Build-Log je Ticket |
| AC-G4 | PR offen, CI je Job, Bericht, dann Stopp | Orchestrator | – |

## K8I-001 im Einzelnen (Start, Spec-Ordner, Jugxo)

- [x] **Spec-Nummer frei** (2026-11-13): `ls specs/` ohne `052-*`, `gh pr list --state open --json number,title,headRefName` → `[]`, kein Branch mit `052`. Siehe `plan.md` › G-0 Start.
- [x] **Basis:** `HEAD` = `origin/main` = `c439918f96e444004d8d1ed873af899a9ebed8e5`. `git diff --stat de931e40 HEAD -- <fünf Analyse-Dateien>` ist leer. Kein Befund.
- [x] **Kopien mit `cp`:** `spec.md` (20 841 Byte, SHA-256 `707ef74c…f2274`) und `technische-spec.md` (14 904 Byte, SHA-256 `1d18c8bd…4c4cd`), je gleich der Quelle (`cmp` Exit 0). Werden nie editiert.
- [x] **Jugxo D-052-01** (ersetzt D-103 aus `specs/038-gvidanto-agentoj/plan.md`) und D-052-02 bis D-052-09 in `plan.md`.
- [x] Kein Code, kein Test. `specs/038-*` und `packages/modelo/data/jugxoj.json` unverändert.
- [x] `pnpm check:privat` grün (nach `pnpm turbo run build --filter=@fundamento/modelo`, aus dem Turbo-Cache).

### Commits K8I-001

- Spec 052 K8I-001: spec folder, base check and Jugxo D-052-01 (nur `specs/052-k8-interspacoj/{spec,technische-spec,plan,tasks}.md`)

## K8I-002 im Einzelnen (rote Tests, Fixtures, Gegenproben)

Alles auf dem Stand vor jedem Fix (Basis `662ed28f`, Projektor, Browser-Teil und `k8.ts` unverändert). Rote Ausgaben knapp (`FM_AUSGABE=knapp`), vollständig im Build-Log.

### Commits K8I-002

| SHA | Paket | Inhalt |
|---|---|---|
| `9f67d684` | projekcioj | `src/celoj/web-component/live-052.test.ts`: `LIVE` aus `region.live`, `data-fm-leer` in `#render`, Regel `[part][data-fm-leer]` (D-052-04) und `position: relative` am `frame`, Test-Kopie mit `live` an `pagxo.subtitle`, `componentCssIssues`; Guard SHA-256 je Sxablono ohne `live` (Modul, inline, Stylesheet) |
| `f9a757f7` | eroj | `test/interspacoj-052.spec.ts`: `fm-sxelo` Fälle 1–4, `fm-filtrilo` 5.1 und 5.3, je 4 Marken × hell/dunkel; CSS-Celo der cxiuj-Config in der Datei gebaut (`serve.ts` unverändert) |
| `e3b938fb` | ekranoj | `Interspaco.verteilita?: { ero: string }` (nur Typ, V-1) |
| `56267833` | nordstelo | derselbe Typ in `src/facts.ts`; 8 Fixtures (V-5) mit `enigo.html`, `faktoj.json`, `atendo.json`; `generi.mjs` kennt die Namen; `src/k8/interspacoj-052.test.ts`; `src/k8/k8.test.ts` um „interspacoj with verteilita (D-052-01, V-2)“ ergänzt |

### Rot belegt (Fehlzeilen gekürzt)

- **projekcioj** (`vitest run src/celoj/web-component/live-052.test.ts`): 5 bestanden, 4 rot. Rot: `sxelo: LIVE, data-fm-leer …`, `filtrilo: LIVE, data-fm-leer …`, `every Sxablono with a live region gets the rule`, `a test copy with live on another region …`. Grün mit Absicht: Vorbedingung (Live-Bereiche genau `sxelo.notices`, `filtrilo.status`), `componentCssIssues` (heute ohne Befund), „never hidden/display none“, Guard (2 Tests).
- **eroj** (`playwright test test/interspacoj-052.spec.ts --project=chromium`): 8 bestanden, 40 rot. Rot je Kombination: 1 (z. B. komuna `nav → main 16 px, spacing.medium 8 px`, ekzemplo `12 px` / `6 px`), 3 (`data-fm-leer on the empty notices`), 4 (Lücke 2 × medium bei fokussiertem Sprunglink; die Positionen selbst verschieben sich heute schon nicht), 5.1 (`footer 40 px, actions 32 px`: der leere Status bricht in eine zweite Zeile), 5.3 (`data-fm-leer on the empty status`). Grün mit Absicht: Fall 2 (gefüllt im Markup und per Script: Abstände je `spacing.medium`, kein `data-fm-leer`) in allen 8.
- **nordstelo** (`vitest run src/k8/`): 86 bestanden, 9 rot. Rot: `k8.test.ts` 3 (V-2: `expected 0.3333 to be 0.5`, `0.5 to be 1`, `+0 to be 1`); `interspacoj-052.test.ts` `anmelden-m1` (4 Kombinationen: provo, provo-kompakta), `konto-m1` = 1 (alle 8), `konto-m1` kein Paar > 100 px (alle 8), badges → subtitle auf Stufe (6: ekzemplo, provo, provo-kompakta), Selbsttest (a) und (b). Grün: alle sechs Gegenproben-Erwartungen, Selbsttests (c), (d1), (d2), (3c), `k8()` = `atendo.json` für alle 8 neuen Fixtures, „without the field“, `zwilling.test.ts`, `gegenprobe.test.ts`, `determinismo.test.ts`, `faktoj.test.ts`, `soloj.test.ts`.
- **ekranoj**: nur Typ, `pnpm --filter @fundamento/ekranoj lint` grün.
- Lint `nordstelo`, `ekranoj`, `projekcioj`, `eroj` grün. `pnpm check:privat` grün. Keine `.only`/`.skip`. `git check-ignore -v` auf jeden Fixture-Ordner leer.

### Generator und Determinismus

`pnpm turbo run build --filter=@fundamento/nordstelo...`, dann `node packages/nordstelo/test/k8/generi.mjs` (alle 10 Fixtures: 8 Renders mit K8), `cp -r packages/nordstelo/test/fixtures/k8 /tmp/s052-k8-a`, zweiter Lauf, `diff -r /tmp/s052-k8-a packages/nordstelo/test/fixtures/k8` → leer (Exit 0). `git diff --exit-code -- packages/nordstelo/test/fixtures/k8/roh packages/nordstelo/test/fixtures/k8/sxablono` → Exit 0.

### Herkunft der Fixtures (D-95, V-5)

| Fixture | Quelle | SHA-256 der Quelle | Änderung | SHA-256 von `enigo.html` |
|---|---|---|---|---|
| `anmelden-m1` | `specs/050-mvp-probelauf/daten/m1/F/anmelden/fragmento.html` (992 Byte) | `92dea2d4da48ad46dd68c6cc109cd317729bff0c3226623f205186645ad0749e` | keine (`cp`, `cmp` gleich) | `92dea2d4…0749e` |
| `konto-m1` | `specs/050-mvp-probelauf/daten/m1/F/konto/fragmento.html` (781 Byte) | `8ef028ff58ce939c4597e6be0df6cdeabdfd5fd3561e12fdc53579e988cbd618` | genau die Zeile `      <span slot="heading">Kontoangaben</span>` entfernt (Rest C), sonst byte-gleich (734 Byte, ohne Zeilenende am Schluss wie die Quelle) | `2b36246629a1e399a5eeff80358d8334f936739864f4ec4ce74e3b1e9325c2a4` |
| `gegenprobe-a-eigener-abstand` | eigenes Markup | – | `fm-stako`, zweites `fm-teksto` mit `style="margin-block-start: 13px"` | – |
| `gegenprobe-b-doppelte-luecke` | eigenes Markup | – | Spalte `display: flex; flex-direction: column; gap: var(--fm-spacing-medium)`, leeres `<div>` zwischen zwei `fm-teksto` | – |
| `gegenprobe-c-eigener-verteiler` | eigenes Markup | – | `<div style="display:flex; justify-content: space-between">` mit zwei `fm-teksto` | – |
| `gegenprobe-d1-eigene-klasse` | eigenes Markup | – | `<style>.verteiler { display: flex; justify-content: space-between; }</style>`, Klasse am eigenen `div` | – |
| `gegenprobe-d2-part` | eigenes Markup (Kopf wie `konto`) | – | `<style>fm-pagxo::part(head) { justify-content: space-evenly; }</style>`, `fm-pagxo` mit title, badges, subtitle, actions | – |
| `gegenprobe-3c-ero-mit-style` | eigenes Markup | – | `fm-atributlisto` mit eigenem `style="display: flex; justify-content: space-between"`, darin `span[slot=heading]` und `<dl>` (der Host ist im Flat-Tree der gemeinsame Vorfahre) | – |

Werte auf dem roten Stand (`atendo.json`, `interspacoj`): `anmelden-m1` 1 in komuna/ekzemplo, 0,8571 in provo/provo-kompakta (`fm-sxelo > fm-stako` 16 px). `konto-m1` 0,7778 (komuna, ekzemplo), 0,5556 (provo, provo-kompakta). (a) 0 überall (19 bzw. 21 px). (b) 1 in komuna/ekzemplo, 0 in provo/provo-kompakta (16 px). (c), (d1) 0 überall (1 165–1 180 px). (d2) 0,6667 komuna, 0,3333 sonst. (3c) 0,5 überall (970–1 047 px).

### Befunde und Abweichungen K8I-002

- **B-002-1 Selbsttest (a) und (b) rot bis K8I-004.** Die Lockerung des Tickets (jedes Paar `verteilita`) wirkt nur über `k8()`. Das heutige `k8()` kennt `verteilita` nicht, also bleibt die gelockerte Kopie von (a) und (b) heute < 1, und ihr Selbsttest ist rot. (a) und (b) haben nach Ticket keine Klausel „kein Paar `verteilita`“. Bei (c), (d1), (d2), (3c) schlägt die gelockerte Kopie heute schon über diese Klausel fehl (grün). Mit V-2 in K8I-004 werden alle sechs Selbsttests grün, ohne Änderung am Test.
- **B-002-2 konto-m1 badges → subtitle in komuna schon heute auf Stufe** (8 px, Tabelle der Produkt-Spec). Diese Erwartung ist rot in ekzemplo, provo, provo-kompakta (6 von 8 Kombinationen), nicht in allen Marken. `konto-m1` `interspacoj` = 1 ist in allen 8 rot.
- **B-002-3 Form der Erwartungen an den Projektor (für K8I-003).** Der Unit-Test erwartet wörtlich `const LIVE: readonly string[] = <JSON der Liste>;` (wie `HIDEABLE`), eine eigene Schleife `for (const region of LIVE)` in `#render`, darin `toggleAttribute("data-fm-leer", …)` oder `setAttribute`/`removeAttribute`, ohne `.hidden`. Im Stylesheet eine Zeile `[part][data-fm-leer] { … }` mit genau den vier Deklarationen von D-052-04 (Reihenfolge frei) und eine Zeile, die mit `[part="frame"] {` beginnt und `position: relative;` enthält.
- **B-002-4 Fall 5.1 (`fm-filtrilo`, „Punkt 1 sinngemäß“).** Im Fuß mit `space-between` verschiebt ein leerer Status nichts sichtbar. Messbar ist sein Platz, wenn die Leiste genau so schmal ist wie ihre Aktionen: Der Status bricht heute in eine zweite Zeile (Fuß = Aktionen + `gap`). Erwartung: Fuß so hoch wie die Aktionen.
- **B-002-5 Accessibility-Baum (Fall 3).** Playwrights `ariaSnapshot` zeigt das leere `notices` (generisch, ohne Rolle) nicht. Geprüft wird deshalb in Chromium über CDP (`Accessibility.getFullAXTree`: ein nicht ignorierter Knoten mit `live: polite`) und in jeder Engine über die berechneten Zustände (`aria-live`, nicht `hidden`, nicht `display: none`/`contents`, nicht `visibility: hidden`, kein `aria-hidden`). Für `fm-filtrilo` steht `- status` im `ariaSnapshot`.

## K8I-003 im Einzelnen (Fix A, Neubau, Baselines)

### Commits K8I-003

| SHA | Inhalt |
|---|---|
| `71db92e1` | `packages/projekcioj/src/celoj/web-component/sxablono-template.ts`: `LIVE` aus `region.live`, `data-fm-leer` per `toggleAttribute` in `#render` (eigene Schleife nach `HIDEABLE`, nie `.hidden`), Regeln `[part="frame"] { position: relative; }` und `[part][data-fm-leer] { … }` nach D-052-04 – nur für Sxablonoj mit Live-Bereich |
| (dieser Commit) | neu erzeugte `faktoj.json`/`atendo.json` von `anmelden-m1` und `konto-m1`, `plan.md` (Projektionen, Figma-Beleg, AC-A4), `tasks.md` |

### Grün belegt (knapp)

- **projekcioj** `vitest run src/celoj/web-component/`: 181 bestanden, 0 rot (darin `live-052.test.ts` 9 von 9, Guard byte-gleich). Paket `pnpm --filter @fundamento/projekcioj test`: 1 560 bestanden, 1 rot, 1 übersprungen bei Last 35–37 (fremder Lastlauf): rot nur `src/fonto/komuna-fonto.test.ts:182` „Test timed out in 60000ms“ (Auflösung der Marken, ohne Bezug zu Sxablonoj); Einzellauf derselben Datei bei Last 11: 11 bestanden, 0 rot. Lint grün (nur bestehende Warnungen in fremden Dateien).
- **eroj** `playwright test test/interspacoj-052.spec.ts --project=chromium`: **48 bestanden, 0 rot** (K8I-002: 8/40).
- **Bestehende Eroj-Specs**, Chromium, je eine Suite: `sxablonoj` 6/0, `sxablonoj-2` 4/0, `sxablonoj-3` 6/0, `nachlese-8` 6/0, `metiejo` 6/0, `studio-035` 6/0, `buehne-036` 20/0 (bestanden/rot). Keine Erwartung geändert.
- **Make Kit** `pnpm check:make-kit`: 5 bestanden, 0 rot. **Parität** `pnpm check:parity`: `differences=0 items=45`, 0 Fehler. **Vitrino** `check:vitrino`: zweimal 38 bestanden, 1 rot, 50 übersprungen (Last 9–12 bzw. 11–9): rot nur `vitrino.check.ts:1224` „Ableitung Gegenprobe“ (Zeitmessung der Werkstatt, `Ableitung median 150.0 ms, normiert 150.0 ms`, erwartet rot = über der Grenze); `mode: serial` überspringt danach den Rest. Dieselbe Gegenprobe ist auf dem Stand **vor** dem Fix (`sxablono-template.ts` von `c906fabc`, projekcioj neu gebaut) genauso rot (`median 147.5 ms`), also fremd (B-003-4). Der Rest ohne sie (`--grep-invert "Ableitung Gegenprobe"`): **88 bestanden, 0 rot, 0 übersprungen**.
- **Determinismus:** `pnpm --filter @fundamento/eroj build` zweimal, `diff -r` auf `dist/` und `src/generated/` leer.
- **K8-Fixtures:** `pnpm turbo run build --filter=@fundamento/nordstelo...`, `node packages/nordstelo/test/k8/generi.mjs`, `cp -r … /tmp/s052-k8-a`, zweiter Lauf, `diff -r` leer. Geändert nur `anmelden-m1` und `konto-m1` (`faktoj.json`, `atendo.json`); alle Gegenproben, `roh` und `sxablono` byte-gleich (`git diff --exit-code` Exit 0).
  - `anmelden-m1` `interspacoj`: **1 in allen 8 Kombinationen** (vorher 0,8571 in provo, provo-kompakta). AC-N3 Teil 1 erfüllt.
  - `konto-m1` `interspacoj`: 0,7778 in komuna/ekzemplo (unverändert), 0,6667 in provo/provo-kompakta (vorher 0,5556; das Paar nav → main ist jetzt auf Stufe). **Bleibt rot bis K8I-004 (B)**: übrig sind 2 bzw. 3 von 9 Paaren im Kopf von `fm-pagxo` (Kialo z. B. „2 von 9 Geschwisterabständen nicht auf einer Abstandsstufe, zuerst `fm-sxelo > fm-pagxo > fm-butono` (930,05 px)“ bzw. „… `fm-teksto` (11 px)“: subtitle → actions mit `space-between`, badges → subtitle), die erst die Flat-Tree-Messung mit `verteilita` (B) auflöst.
- **nordstelo** `vitest run src/k8/`: 87 bestanden, 8 rot – alle erwartet:
  - `k8.test.ts:357`, `:367`, `:378` (V-2, `verteilita` in `k8.ts`) → K8I-004.
  - `interspacoj-052.test.ts:184` `konto-m1` = 1, `:188` kein Paar > 100 px, `:200` badges → subtitle auf Stufe (6 Kombinationen) → K8I-004 (B).
  - `interspacoj-052.test.ts:232` Selbsttest (a) und (b) → K8I-004 (B-002-1).
  - Grün geworden: `anmelden-m1` = 1 in allen Kombinationen. Gegenproben-Erwartungen und Selbsttests (c), (d1), (d2), (3c) unverändert grün.

### Befunde K8I-003

- **B-003-1 Wiederholbarkeit eines Vitrino-Bilds.** `vitrino-light-redaktilo-mittel` war zwischen zwei Läufen auf demselben Stand nicht byte-gleich (sichtbar gleich). `redaktilo` hat keinen Live-Bereich, sein Code ist im Guard byte-gleich; gegen den zweiten Vorher-Lauf ist das Nachher-Bild byte-gleich.
- **B-003-2 `fm-filtrilo` sichtbar unverändert.** Mit leerem `status` sind beide Bilder in voller Breite byte-gleich; die Wirkung zeigt sich nur in der schmalen Leiste (Fall 5.1 der Eroj-Spec: Fuß eine Zeile).
- **B-003-3 Metiejo-Startseite.** Sie nutzt `fm-sxelo` ohne Meldung in `notices`; ihr Inhalt rückt um ein `spacing.medium` nach oben. Gewollte Wirkung von A, kein Test hängt daran (`metiejo.spec.ts` grün).
- **B-003-4 `vitrino.check.ts:1224` „Ableitung Gegenprobe“ rot, auch vor dem Fix.** Die Gegenprobe verlangsamt die Ableitung der Werkstatt um 80 ms × k und erwartet ein rotes Urteil; auf dieser Maschine landet der Median bei 147,5–150,0 ms, also knapp nicht über der Grenze. Ohne Bezug zu Sxablonoj (die Werkstatt leitet Paletten ab). Nicht angefasst (keine Grenze geändert); Befund für K8I-006/den Maintainer. Lokal mit `--grep-invert` umgangen, in der CI läuft die Vitrino in Teilen (`VITRINO_PARTO`).
- Keine neue Property, `STRUCTURAL_PROPERTIES`, `figma.ts`, `serve.ts`, `turbo.json` unverändert. Kein Handeditieren generierter Ausgabe.

## K8I-004 im Einzelnen (Fix B: Flat-Tree, `verteilita`, Zwilling, `k8.ts`, Marker)

### Commits K8I-004

| SHA | Inhalt |
|---|---|
| `961455e2` | Browser-Teil `aspektoFaktojEnPagxo` (nordstelo `src/k8/faktoj.ts`) nach der Mechanik der technischen Spec und D-052-10 bis D-052-12; `normigiAspektoFaktojn` trägt `verteilita` (Sortier- und Dedupe-Schlüssel); Zwilling `ekranoj/src/aspekto-faktoj.ts` textgleich; Normalisierungsfall `VERTEILITA` (`test-doubles/aspekto-kazoj.ts`), Test in `faktoj.test.ts`, Fallzahl in `zwilling.test.ts` |
| `e6fee974` | `k8.ts` `interspacoj()` nach V-2; Referenzrechnung in `test/k8/generi.mjs` unabhängig dazu |
| `929fa854` | Marker D-052-05: `data-nordstelo` in `render.ts` (`HEAD`, `SONDO_DOKUMENTO`) und `konstruo.ts` (`MEDIO_ATRIBUTO`, Rahmen-Links und Grundschrift-Regel); zwei Erwartungen in `konstruo.test.ts` |
| (dieser Commit) | neu erzeugte Fixtures (`konto-m1`, `gegenprobe-d2-part` geändert, alle anderen byte-gleich), `plan.md` (D-052-01/-05 Stand, D-052-10 bis D-052-12), `tasks.md` |

### Rot belegt: Herkunftsprüfung (AC-B3, Zwischenstand nicht committet)

Zwischenstand: in `faktoj.ts` `const ero = !distribuas(v, akso) ? undefined : v.localName;` (nur Bedingung 1, ohne 2 und 3), nordstelo gebaut, `generi.mjs` gelaufen. `vitest run src/k8/interspacoj-052.test.ts`:

```
✘ interspacoj-052.test.ts:228 › (c) own <div style=display:flex; justify-content: space-between>: interspacoj < 1 in komuna, ekzemplo, provo, provo-kompakta; no pair verteilita
  AssertionError: expected [ …(16) ] to deeply equal []
✘ interspacoj-052.test.ts:228 › (d1) own <style> with a class on an own div: … no pair verteilita
  AssertionError: expected [ …(16) ] to deeply equal []
✘ interspacoj-052.test.ts:228 › (d2) own <style> fm-pagxo::part(head) { justify-content: space-evenly }: … no pair verteilita
  AssertionError: expected [ …(16) ] to deeply equal []
✘ interspacoj-052.test.ts:228 › (3c) an fm-* element with own style justify-content: space-between, itself the container: … no pair verteilita
  AssertionError: expected [ …(16) ] to deeply equal []
20 bestanden, 4 rot, 0 übersprungen, 0 wackelig
```

Die 16 Einträge je Gegenprobe sind 8 × „interspacoj 1, not < 1“ und 8 × „pair … verteilita“, z. B. für (c) `komuna/light: pair 1 → 2 verteilita (div)`. `verteilita` im Zwischenstand: (c) `1→2` (`div`), (d1) `2→3` (`div`), (d2) `4→5` (`div` = `part="head"` im Shadow-Root von `fm-pagxo`), (3c) `1→2` (`fm-atributlisto`), `konto-m1` `8→9` (`div`). Danach der echte Stand (Fakten neu erzeugt, zweimal byte-gleich): grün.

### Grün belegt (knapp)

- `pnpm turbo run build --filter=@fundamento/nordstelo...`, dann `node packages/nordstelo/test/k8/generi.mjs` zweimal, `cp -r … /tmp/s052-k8-a` dazwischen: `diff -r` leer (byte-gleich). Last 6–8.
- `git diff --exit-code -- packages/nordstelo/test/fixtures/k8/roh packages/nordstelo/test/fixtures/k8/sxablono`: leer, `roh` und `sxablono` byte-gleich (AC-B5). Ebenso byte-gleich: `anmelden-m1`, (a), (b), (c), (d1), (3c). Geändert nur `konto-m1` und `gegenprobe-d2-part` (je `faktoj.json`, `atendo.json`; `elements` unverändert).
- nordstelo `vitest run src/k8/`: 96 bestanden, 0 rot (darin `k8.test.ts:357/367/378`, `interspacoj-052.test.ts:184/188/200/232` jetzt grün, ohne Änderung an den Tests). Paket `pnpm --filter @fundamento/nordstelo test`: 299 bestanden, 0 rot. Lint grün.
- ekranoj `pnpm --filter @fundamento/ekranoj test`: 301 bestanden, 0 rot (`rondoj.test.ts:733` in diesem Lauf grün). `test:browser`: 3 bestanden, 0 rot. Lint grün.
- Gespeicherte Fakten ohne Feld: `k8()` von `cfc56aba` und von diesem Stand auf allen `*.json` mit `renders` unter `test/fixtures/ablauf-038/post` (2 Dateien, je 8 Renders mit K8) mit zwei Modelos (cxiuj-Config, Standard) → `stabilaJson` byte-gleich (4 von 4; temporärer Test, nicht committet). `ekranoj/test/fixtures/ac8` trägt keine gespeicherten K8-Fakten (`fall`, `fragment`, `lingvo`, `expected`), dort gibt es nichts zu vergleichen; `ac8.test.ts` ist in der Paketsuite grün.
- `k8.ts`: `git diff -U0 cfc56aba -- packages/nordstelo/src/k8/k8.ts | grep -E "^[-+].*(AUF_STUFO|surStupo|k8Plena|mankoj|MANKO_AL_MERKMAL|distanco)"` → kein Treffer. Die Hunks liegen nur in `interspacoj()` (Z. 190–220).

### Ergebnis je Fixture (`interspacoj`, alle 4 Marken × hell/dunkel)

| Fixture | komuna | ekzemplo | provo | provo-kompakta | `verteilita` (Herkunft) |
|---|---|---|---|---|---|
| `anmelden-m1` | 1 | 1 | 1 | 1 | keins |
| `konto-m1` | 1 | 1 | 1 | 1 | `8→9` subtitle → actions, `x`, 930,05 / 817,5 / 911,58 / 957,14 px – `fm-pagxo` (alle 8) |
| (a) `gegenprobe-a-eigener-abstand` | 0 | 0 | 0 | 0 | keins |
| (b) `gegenprobe-b-doppelte-luecke` | 1 | 1 | 0 | 0 | keins |
| (c) `gegenprobe-c-eigener-verteiler` | 0 | 0 | 0 | 0 | keins |
| (d1) `gegenprobe-d1-eigene-klasse` | 0 | 0 | 0 | 0 | keins |
| (d2) `gegenprobe-d2-part` | 0,6667 | 0,6667 | 0,6667 | 0,6667 | keins (eigenes `<style>`, Bedingung 3) |
| (3c) `gegenprobe-3c-ero-mit-style` | 0,5 | 0,5 | 0,5 | 0,5 | keins (`style` am `fm-*`, Bedingung 2) |
| `roh` | 0,75 | 0,6667 | 0,75 | 0,75 | keins |
| `sxablono` | 1 | 1 | 1 | 1 | keins |

`konto-m1` im Kopf von `fm-pagxo` (light; dunkel gleich), vorher (K8I-003) → nachher: badges → subtitle `7→8` `y` 8 / 11 / 12 / 8,88 → 4 / 3 / 4 / 4 px (gemessen zwischen `part="heading"` und `part="subtitle"` in `part="lead"`, auf Stufe); subtitle → actions `8→9` unverändert im Wert, jetzt `verteilita` (`part="head"`, `space-between`); actions → atributlisto `9→10` `y` 36 / 35,5 / 42 / 31,38 → 24 / 20 / 28 / 20 px (zwischen `part="head"` und `part="sections"`). (d2) badges → subtitle ebenso 8 / 11 / 12 / 8,88 → 4 / 3 / 4 / 4 px, daher 0,3333 → 0,6667; subtitle → actions (323,34 px u. a.) bleibt gewertet.

### Befunde und Abweichungen K8I-004

- **B-004-1 Zwilling und Spread mit Bedingung.** `...(ero === undefined ? {} : { verteilita: { ero } })` im Browser-Teil machte `zwilling.test.ts` (1) rot: tsc behält die Klammern, die Vitest-Transformation lässt sie weg (1722 gegen 1720 Tokens). Die Normalisierung bleibt unverändert (R-6); der Browser-Teil setzt das Feld stattdessen per Zuweisung (`if (ero !== undefined) paro.verteilita = { ero };`), in beiden Zwillingen gleich.
- **B-004-2 Auslegung der Mechanik.** Grid-Achse, Querachse, `writing-mode`, `display: contents` und Dedupe-Schlüssel: D-052-10 und D-052-11 in `plan.md`, jeweils die strengere Lesart.
- **B-004-3 `adoptedStyleSheets` kein Merkmal** (D-052-12): Eroj hängen eigene Folien an das Dokument.
- **B-004-4 Rest-Lücke Bedingung 3 – geschlossen durch K8I-004b (D-052-13).** Erkannt werden `<style>` und `<link rel=stylesheet>` im Dokument. Nicht erkannt würde ein deklaratives Shadow-DOM (`<template shadowrootmode>`) mit eigenem `<style>` **an einem `fm-*`-Element**; dessen Shadow-Root hätte einen `fm-*`-Host. Die Gegenproben decken das nicht ab. Vorschlag für eine Folge-Spec, nicht in diesem Lauf. → Im selben Lauf als K8I-004b geschlossen, siehe unten.
- **B-004-5 Marker an der Grundschrift-Regel von ekranoj.** Auch `<style>body { font-family: var(…) }</style>` des Rahmens setzt die Umgebung ein; ohne Marker wäre auf jedem F-Screen mit `bazaTiparo` kein Paar `verteilita`. Er trägt deshalb ebenfalls `data-nordstelo`.
- **B-004-6 `rondoj.test.ts:733`** war in diesem Lauf grün (nicht angefasst).

## K8I-004b im Einzelnen (Folge zu K8I-004: vom Agenten geschriebene Shadow-Roots, B-004-4)

Bedingung 2 von D-052-01 konnte den Shadow-Root einer Ero nicht von einem unterscheiden, den der Agent per deklarativem Shadow-DOM selbst schreibt. Geschlossen nach D-052-13 (`plan.md`): Herkunft nur bei einem hochgestuften registrierten `fm-*`-Element (`:defined`); dazu zählen `<style>`/`<link>` auch in offenen Shadow-Roots als eigene Stilregeln (Bedingung 3). K8 wird nur strenger.

### Commits K8I-004b

| SHA | Inhalt |
|---|---|
| `81d51d05` | rot: Gegenproben (e1), (e2) mit `enigo.html`, `faktoj.json`, `atendo.json` (Stand `f733d020`), `generi.mjs` kennt die Namen, Tests in `interspacoj-052.test.ts` |
| `906e835b` | rot: Gegenprobe (e3) (Fakten unabhängig vom Teil `:defined`, siehe unten) |
| (dieser Commit) | `estasEro` (`:defined`) in Bedingung 2 und `stilajElementoj` (offene Shadow-Roots) in Bedingung 3, `faktoj.ts` und Zwilling `aspekto-faktoj.ts` textgleich; neu erzeugte Fakten von (e1)–(e3); `plan.md` D-052-13, `tasks.md` |

### Neue Gegenproben

| Fixture | Markup | vorher (rot) | nachher |
|---|---|---|---|
| (e1) `gegenprobe-e1-deklarativa-ombro` | unregistriertes `fm-io` mit `<template shadowrootmode="open">`, darin `<style>div { display: flex; justify-content: space-between; }</style><div><slot></slot></div>`; zwei `fm-teksto` im Light-DOM. Kein `<style>` im Light-Dokument, kein `style`/`class` | 1 in allen 8, Paar `1→2` `x` 1 165,33–1 179,98 px `verteilita` (`fm-io`) | 0 in allen 8, kein Paar `verteilita` |
| (e2) `gegenprobe-e2-fermita-ombro` | registriertes `fm-stako` mit `<template shadowrootmode="closed">`, darin `<style>:host { display: flex !important; justify-content: space-between !important; }</style><slot></slot>`; zwei `fm-teksto` | 1 in allen 8, Paar `1→2` `verteilita` (`fm-stako`) | 0 in allen 8, kein Paar `verteilita` |
| (e3) `gegenprobe-e3-ombro-part` | `div` mit `<template shadowrootmode="open">`, darin `<style>fm-vico::part(control) { justify-content: space-between; }</style><fm-vico><slot></slot></fm-vico>`; zwei `fm-teksto` | 1 in allen 8, Paar `1→2` `verteilita` (`fm-vico`), auch mit `:defined` allein | 0 in allen 8, kein Paar `verteilita` |

Zu (e2): Beim geschlossenen Root liefert `assignedSlot` `null`, der Flat-Tree-Weg endet am Host; `V` ist `fm-stako` im Light-DOM (Zweig „selbst ein `fm-*`-Element“). Ein Root nur mit `div { … }` (wie e1) wäre deshalb schon vorher gemessen worden; `:host` macht den Host selbst zum Verteiler (`!important`, weil `fundamento.css` den Host sonst überschreibt). Die Hochstufung von `fm-stako` schlägt fehl (`attachShadow({ mode: "open" })` wirft), `:defined` passt nicht.

Zu (e3): Nach dem Teil `:defined` allein (Zwischenstand, Browser-Skizze und Fakten von `906e835b`) blieb dieses Paar `verteilita` – der Host von `V` ist die echte, hochgestufte `fm-vico`, nur ihre Verteilung kommt aus dem `<style>` im Root des Agenten. Deshalb die Ergänzung in Bedingung 3.

### Rot belegt (`FM_AUSGABE=knapp`, `vitest run src/k8/interspacoj-052.test.ts`)

Stand `f733d020` + (e1), (e2):

```
✘ packages/nordstelo/src/k8/interspacoj-052.test.ts:242 › … › (e1) own open declarative shadow root on an unregistered fm-io distributing its slot: interspacoj < 1 in komuna, ekzemplo, provo, provo-kompakta; no pair verteilita
  AssertionError: expected [ …(16) ] to deeply equal []
✘ packages/nordstelo/src/k8/interspacoj-052.test.ts:242 › … › (e2) own closed declarative shadow root on fm-stako (upgrade fails), :host distributing: interspacoj < 1 in komuna, ekzemplo, provo, provo-kompakta; no pair verteilita
  AssertionError: expected [ …(16) ] to deeply equal []
28 bestanden, 2 rot, 0 übersprungen, 0 wackelig
```

Zwischenstand nur mit `:defined` + (e3): (e1), (e2) grün, rot nur

```
✘ packages/nordstelo/src/k8/interspacoj-052.test.ts:248 › … › (e3) own open declarative shadow root on a div, its <style> fm-vico::part(control) distributing: interspacoj < 1 in komuna, ekzemplo, provo, provo-kompakta; no pair verteilita
  AssertionError: expected [ …(16) ] to deeply equal []
32 bestanden, 1 rot, 0 übersprungen, 0 wackelig
```

Die 16 Einträge je Gegenprobe: 8 × „interspacoj 1, not < 1“ und 8 × „pair 1 → 2 verteilita (…)“. Die Selbsttests (gelockerte Kopie) der drei sind auf jedem Stand grün.

### Browser-Skizze (nicht eingecheckt, Renderer aus `dist`, ekzemplo hell)

| Markup | Ergebnis mit `:defined` |
|---|---|
| offener Root an registriertem `fm-stako` mit `div { flex; space-between }` bzw. `:host { … !important }` | Root des Agenten von `attachShadow` geleert; Paar in der Spalte von `fm-stako`, `y` 6 px, nicht `verteilita` |
| geschlossener Root an `div`, `::slotted(fm-vico) { display:flex !important; justify-content: space-between !important }` | `V` ist der `control`-Teil von `fm-vico`, `x` 6 px, nicht `verteilita` |
| offener bzw. geschlossener Root an `div`, `::slotted(fm-vico)::part(control) { … }` | wirkt nicht, `x` 6 px |
| geschlossener Root an `div` mit `fm-vico::part(control)` und `<fm-vico><slot></slot></fm-vico>` | Flat-Tree-Weg endet am `div`, gemessen 1 165,33 px, nicht `verteilita` |
| offener Root an `div` (wie e3), auch zweifach geschachtelt (`section` mit eigenem offenen Root darin) | `verteilita` (`fm-vico`) nur mit `:defined`; mit der Ergänzung in Bedingung 3 gemessen |

### Grün belegt (knapp)

- `pnpm turbo run build --filter=@fundamento/nordstelo...`, `node packages/nordstelo/test/k8/generi.mjs` zweimal, `cp -r packages/nordstelo/test/fixtures/k8 /tmp/s052-k8-b` dazwischen: `diff -r` leer. Last 6–10.
- `git diff --exit-code f733d020 --` auf alle 10 anderen Fixture-Ordner (`roh`, `sxablono`, `anmelden-m1`, `konto-m1`, (a), (b), (c), (d1), (d2), (3c)): Exit 0, byte-gleich. `konto-m1` `8→9` weiter `verteilita` (`fm-pagxo`, alle 8).
- nordstelo `vitest run src/k8/`: 105 bestanden, 0 rot (vorher 96; + 3 × 3 Tests). Paket `pnpm --filter @fundamento/nordstelo test`: 308 bestanden, 0 rot. Lint grün.
- ekranoj `pnpm --filter @fundamento/ekranoj test`: 301 bestanden, 0 rot (`rondoj.test.ts:733` grün). `test:browser`: 3 bestanden, 0 rot. Lint grün. `zwilling.test.ts` grün ohne Änderung (keine neue Normalisierung nötig: das Feld `verteilita` bleibt gleich).
- `pnpm check:privat`: grün.

### Befunde K8I-004b

- **B-004b-1 Ergänzung in Bedingung 3 über den Auftrag hinaus.** Der Auftrag nannte Bedingung 2 (`:defined`). (e3) zeigt einen Weg, den `:defined` nicht schließt (Root des Agenten an einem Nicht-`fm-*`-Host färbt eine echte Ero per `::part`). Geschlossen mit dem strengeren Merkmal in Bedingung 3, zuerst rot belegt. Keine Namensliste der Eroj.
- **B-004b-2 Geschlossene Roots an Nicht-`fm-*`-Hosts** sind von außen nicht lesbar; ein `<style>` darin bleibt unerkannt. Sie ergeben aber kein `verteilita`: Ohne `assignedSlot` endet der Flat-Tree-Weg am Light-DOM-Host, und die Wege aus einem solchen Root auf ein Light-DOM-`fm-*`-`V` (`::slotted`, `::slotted()::part()`) wirken im Browser nicht auf die Verteilung (Skizze oben). Kein offener Weg bekannt; bei Änderungen am Flat-Tree-Weg neu prüfen.
- **B-004b-3 Eroj ohne `<style>` im Shadow-Root.** Die Ergänzung setzt voraus, dass keine Ero ein `<style>`/`<link>` in ihren Root schreibt (heute: alle per `adoptedStyleSheets`, kein Treffer in `packages/eroj/src/generated/`). Schriebe eine Ero künftig eines, wäre auf solchen Screens kein Paar mehr `verteilita` (strenger, nicht lockerer).

## K8I-005 im Einzelnen (Neubewertung M-1 ohne Modell)

Bericht: [`neubewertung.md`](neubewertung.md). Kein Modell, kein Netz, keine Änderung außerhalb von `specs/052-k8-interspacoj/**`.

### Commit K8I-005

- Spec 052 K8I-005: M-1 re-evaluation without a model (`neubewertung.mjs`, `neubewertung.md`, `daten/neubewertung/**`, `plan.md`, `tasks.md`)

### Befehle und Ergebnisse (gemessen auf `fe6b80dc`, 10 Kerne)

- [x] `pnpm build`: 10/10 aus dem Cache.
- [x] **AC-N1 (a)** `node specs/050-mvp-probelauf/pruefen.mjs`: Exit 0, `grün: m1 F 0/4 - · m1 0 0/4 - · m2 F 0/4 - · m2 0 0/4 -`, Abweichungen 0, Struktur 0, `bericht.md` stimmt.
- [x] **AC-N1 (b)** `node specs/052-k8-interspacoj/neubewertung.mjs --roh <M-1-Lauf 20261113-0243> --nur-kontrolle`: Exit 0, 8 von 8 `k8()` = gespeichertes `taksado.k8` ohne `plena` (`stabilaJson` byte-gleich, SHA-256 in `daten/neubewertung/kontrolle.json`), Urteil 8 von 8 gleich (nicht grün).
- [x] **AC-N2** `node specs/052-k8-interspacoj/neubewertung.mjs --roh <M-1-Lauf>`: Exit 0, **F 4/4** (anmelden, konto, passwort-vergessen, registrieren), 0 0/4, 8 `verteilita`-Einträge (alle `fm-pagxo`, `konto` `8→9`). Last 5,90 6,14 7,17 → 5,99 6,12 7,11.
- [x] `node specs/050-mvp-probelauf/pruefen.mjs --daten specs/052-k8-interspacoj/daten/neubewertung --ohne-bericht`: Exit 0, `grün: m1 F 4/4 anmelden,konto,passwort-vergessen,registrieren · m1 0 0/4 -`.
- [x] **Determinismus:** zwei weitere Läufe nach `/tmp/s052-neubewertung-2` und `-3` (der dritte nach der Biome-Formatierung des Skripts, mit `--roh`): `diff -r -x last.txt` leer, alle `fakto.json` und `kontrolle.json` byte-gleich.
- [x] **Selbstprüfung belegt:** `--selbstpruefung` auf den echten Daten Exit 0 (8 Paare, 0 Fehler); auf `/tmp/s052-selbst-a` (F/konto `13→14` mit Herkunft `div`) Exit 5 „verteilita without fm-* origin“; auf `/tmp/s052-selbst-b` (0/anmelden `1→4` mit Herkunft `fm-pagxo`) Exit 5 „verteilita in Variante 0“. Wortlaut in `neubewertung.md` Abschnitt 7.
- [x] **Weg wie M-1 (D-052-14):** `bytes`, `elements`, `aria`, axe je Render, K1–K6, `total`, `mankoj` in allen 8 Screens gleich den gespeicherten Werten. Variante 0: `taksado.k8` und alle K8-Fakten gleich M-1 (kein Paar `verteilita`).
- [x] **Rest C** im Browser an einer Kopie von `konto` mit Überschrift (`/tmp/s052-rest-c/`, nicht eingecheckt): Element-Kasten 17 / 14 / 21 / 12,25 px (= M-1), Zeilenkasten und Flat-Tree 16 / 12 / 20 / 12 px (= `spacing.large`).
- [x] Biome `pnpm exec biome check specs/052-k8-interspacoj/neubewertung.mjs`: ohne Befund. `pnpm check:privat`: grün.

### Befunde und Abweichungen K8I-005

- **F-052-1** 4 von 4 statt 3 von 4 grünen F-Screens; Rest C verschwindet durch B (Flat-Tree misst `fm-titolo[part=heading]` → `div[part=list]`). Nicht nachjustiert. Siehe `plan.md` › Befunde K8I-005.
- **F-052-2** `NAMED_SLOTS = ["heading"]` in `fm-atributlisto` (`[]` gilt für `fm-titolo`); Erklärung „Messung“ trifft zu, „Ero“ nicht. Vorschlag Folge-Spec.
- **F-052-3** Ledger von Spec 050 trägt den sauberen Probelauf nicht; `S050_REPO` nötig; Rest für Variante 0 bei `--max-tokens 1562000` knapp.
- **D-052-14** `simplaDokumento` statt `ekranaDokumento` (Weg von M-1), Abweichung vom Wortlaut des Tickets.
- Die gerenderten `fakto.json` tragen die vollständigen K8-Fakten (`renders[].k8`), anders als der Export von Spec 050; damit lassen sich K8 und die Selbstprüfung aus dem Repo nachrechnen (zusammen ≈ 1,5 MB).

## K8I-006 im Einzelnen (Gesamtstand, AC-Matrix, Querschnitt)

Gemessen auf `83462abf` plus den Tests dieses Tickets. Jeder Beleg unten ist nachgesehen (Datei, Testname) bzw. selbst gelaufen, nicht aus den Tickets übernommen. Kein Modell, kein Netz, kein Produkt-Code geändert.

### Commit K8I-006

- Spec 052 K8I-006: tests on the integrated result (nur Testdateien, das neue Fixture `konto-m1-plena`, die Namensliste von `generi.mjs` und diese `tasks.md`)

### Ergänzte Tests

| Datei | Neu | Wozu |
|---|---|---|
| `packages/nordstelo/test/fixtures/k8/konto-m1-plena/` | Fixture (`enigo.html`, `faktoj.json`, `atendo.json`), in `NOMOJ` von `test/k8/generi.mjs` | F-052-1 in der CI festhalten: das volle `konto` aus M-1 (mit Überschrift, Rest C) |
| `packages/nordstelo/src/k8/interspacoj-052.test.ts` | `describe` „Spec 052 F-052-1: the full M-1 konto fragment (with the heading, Rest C) is 1“: „konto-m1-plena (M-1 F konto, unchanged): interspacoj = 1 in all combinations“, „konto-m1-plena: exactly one verteilita pair per combination, from fm-pagxo (subtitle → actions)“, „konto-m1-plena: heading → dl of fm-atributlisto is measured, not verteilita, on a step“; `konto-m1-plena` in `M1` (also auch `k8()` = `atendo.json`) | AC-N2/F-052-1, AC-C1 |
| `packages/nordstelo/src/k8/querschnitt-052.test.ts` (neu) | „the fixture folders are exactly the names the generator renders“ (Ordner = `NOMOJ` aus dem Quelltext von `generi.mjs`), „some fixtures carry verteilita pairs …“, je Fixture „`<name>`: k8() equals atendo.json with the cxiuj-config and the repository Modelo“ (14), „AUF_STUFO is still 0.5 px (D-08)“ | Querschnitt `k8.ts` = Referenzrechnung, AC-G1 |
| `packages/nordstelo/src/k8/determinismo.test.ts` | Fixture-Liste aus dem Ordner abgeleitet statt `["roh", "sxablono"]`; „covers every generated K8 fixture, those with verteilita pairs among them“ | Querschnitt Determinismus: alle 14 Fixtures, je dreimal (gleiche Bytes, permutierte Listen und Renders mit 5 Seeds, eine Kombination je Marke × Schema) |
| `packages/nordstelo/src/k8/zwilling.test.ts` | „(2) both give the same output for the rendered K8 facts with verteilita (Spec 052), a fixed point“ – alle gerenderten K8-Fakten mit `verteilita` aus `test/fixtures/k8` (heute 16: `konto-m1`, `konto-m1-plena`), mit Gegenprobe (ein Normalisierer ohne `verteilita` weicht in jedem Fall ab) | Querschnitt Zwilling mit `verteilita` an echten Renders |
| `packages/eroj/test/interspacoj-052.spec.ts` | „every Sxablono with a live region in the Modelo has its cases in this file“ (Menge aus der cxiuj-Config- und der Repo-Modelo = `{ filtrilo: [status], sxelo: [notices] }`) | Querschnitt Live-Regel: eine neue Sxablono mit `live` macht den Browser-Test rot, bis sie Fälle hat |

### Herkunft `konto-m1-plena` (D-95, V-5)

| Fixture | Quelle | SHA-256 der Quelle | Änderung | Ergebnis |
|---|---|---|---|---|
| `konto-m1-plena` | `specs/050-mvp-probelauf/daten/m1/F/konto/fragmento.html` (781 Byte) | `8ef028ff58ce939c4597e6be0df6cdeabdfd5fd3561e12fdc53579e988cbd618` | keine (`cp`, `cmp` gleich; `enigo.html` hat denselben SHA-256) | `faktoj.json` 160 243 Byte (`b3ab59c2…6af5a0b`), `atendo.json` 5 262 Byte (`c588ef0a…6f5561`) |

Erzeugt mit `pnpm turbo run build --filter=@fundamento/nordstelo...` (aus dem Cache), `node packages/nordstelo/test/k8/generi.mjs` zweimal, `cp -r … /tmp/s052-k8-006` dazwischen: `diff -r` leer. `git diff --exit-code -- packages/nordstelo/test/fixtures/k8`: Exit 0, alle 13 bestehenden Fixtures byte-gleich. Last 6,0–6,1.

**`konto-m1-plena` je Marke (hell und dunkel gleich):**

| Marke | `interspacoj` | `kvoto` | `verteilita` | heading → dl (`11→12`, `y`) |
|---|---|---|---|---|
| komuna | 1 | 1 | genau 1: `8→9` subtitle → actions, `x`, 930,05 px, `fm-pagxo` | 16 px (`spacing.large`) |
| ekzemplo | 1 | 1 | genau 1: `8→9`, 817,5 px, `fm-pagxo` | 12 px |
| provo | 1 | 1 | genau 1: `8→9`, 911,58 px, `fm-pagxo` | 20 px |
| provo-kompakta | 1 | 1 | genau 1: `8→9`, 957,14 px, `fm-pagxo` | 12 px |

Kialo in allen 8: „vollständig, 1 verteilte Abstände nicht gezählt“. Das bestätigt K8I-005 (F-052-1) und die Werte der Probe in `/tmp/s052-rest-c/` (16 / 12 / 20 / 12 px). An `fm-atributlisto` und an der Messung von Inline-Elementen ändert das nichts (AC-C1, Diff-Beleg unten).

### AC-Matrix (geprüft)

| AC | Beleg (Datei › Test bzw. Befehl) | Ergebnis K8I-006 |
|---|---|---|
| AC-A1 | `packages/eroj/test/interspacoj-052.spec.ts` › „Spec 052 A fm-sxelo `<marke>` `<schema>`“ › „1: notices empty – nav to main is one spacing.medium“ (8 Kombinationen, Sollwert aus der Custom Property, Toleranz `AUF_STUFO` 0,5) | Chromium, Firefox, WebKit je 49/0 |
| AC-A2 | dieselbe Datei › „2: notices filled (in the markup and later by script) – a gap on each side“, „3: notices empty – marked, polite, not hidden, in the accessibility tree; fill and empty again“ (Chromium zusätzlich CDP-AX-Baum, B-002-5), „4: the focused skip link moves no gap of the frame“; `fm-filtrilo` „5.3: status empty – marked, polite, not hidden, in the snapshot; fill and empty again“ | grün in allen drei Engines |
| AC-A3 | `packages/projekcioj/src/celoj/web-component/live-052.test.ts` › „every Sxablono with a live region gets the rule (the set from the Modelo)“, „a test copy with live on another region gives that region, without a name list“, „the repo Modelo has live regions exactly in sxelo (notices) and filtrilo (status)“; Eroj „5.1: status empty – takes no room …“ (`fm-filtrilo`); **neu** Eroj „every Sxablono with a live region in the Modelo has its cases in this file“ | grün (projekcioj-Paket, Eroj 3 Engines) |
| AC-A4 | `live-052.test.ts` › „pins exactly the Sxablonoj of the Modelo that have no live region“, „element module, inline element and stylesheet keep their bytes“ (SHA-256 von `662ed28f`); Bild-Inventur und `cmp`-Vergleich `plan.md` › K8I-003 › Baselines (40 namentlich geändert, 50 byte-gleich, Bildreferenzen: keine) | Guard grün; Bildvergleich ist ein dokumentierter Lauf von K8I-003, in K8I-006 nicht wiederholt (kein Referenzbild im Repo betroffen) |
| AC-B1 | `packages/nordstelo/src/k8/interspacoj-052.test.ts` › „konto-m1: badges → subtitle is measured and lies on a step of its combination (lead)“, „konto-m1: no pair over 100 px that is not verteilita“, „anmelden-m1 …“/„konto-m1 …: interspacoj = 1 in all combinations“; `faktoj.test.ts` › „carries verteilita through, as part of the sort and dedupe keys“; `zwilling.test.ts` (1) | grün |
| AC-B2 | `interspacoj-052.test.ts` › „Spec 052 counter-probes of D-052-01 (AC-B2, AC-B3)“: (c), (d1), (d2), (3c), (e1), (e2), (e3) je „…: interspacoj < 1 in komuna, ekzemplo, provo, provo-kompakta; no pair verteilita“; `k8.test.ts` › „k8 – interspacoj with verteilita (D-052-01, V-2)“ (4 Tests, darunter der Kialo-Satz „n verteilte Abstände nicht gezählt“); positiv: `konto-m1`, `konto-m1-plena` nur `fm-pagxo` | grün |
| AC-B3 | dieselben Gegenproben (a)–(d2), (3c), (e1)–(e3) und je „`<name>` self-test: a loosened copy (every pair verteilita) fails the expectation“ (9 Selbsttests); rot belegt in K8I-002 (`56267833`), K8I-004 (Zwischenstand, Build-Log oben), K8I-004b (`81d51d05`, `906e835b`) | grün; rot-Belege in den Commits bzw. oben |
| AC-B4 | `plan.md` › D-052-01; `git log --format=%h c439918f..HEAD`: `662ed28f` (nur `specs/052-*`) ist der erste Commit, vor `9f67d684` und jedem Code-Commit | erfüllt |
| AC-B5 | `zwilling.test.ts` › „(1) %s is the same source in nordstelo and ekranoj“, „(2) both normalisers give the same output for the cases of faktoj.test.ts“ (Fall `VERTEILITA`), **neu** „(2) … rendered K8 facts with verteilita (Spec 052), a fixed point“; `gegenprobe.test.ts` › „both results equal atendo.json byte for byte“ (`roh`, `sxablono` unverändert seit K8I-002); `zwilling.test.ts` › „(2) both give the same output for the stored K8 facts of ablauf-038/post, a fixed point“ (gespeicherte Fakten ohne Feld); `k8.test.ts` › „without the field: the value and the three sentences of today, no count appended“ | grün |
| AC-C1 | `neubewertung.md` Abschnitt 5; Diff-Beleg: `git diff c439918f --stat -- packages/modelo/data packages/eroj/src packages/eroj/scripts packages/projekcioj/src/celoj/web-component/ero-template.ts` leer; `git diff c439918f -- packages/nordstelo/src/k8/faktoj.ts` ohne Sonderfall für Inline-Elemente (die einzigen „inline“-Treffer sind `inline-flex`/`inline-grid` in `distribuas`, Bedingung 1 für Container); **neu** `konto-m1-plena` › „heading → dl … measured, not verteilita, on a step“ | erfüllt |
| AC-N1 | (a) `node specs/050-mvp-probelauf/pruefen.mjs` Exit 0, F 0/4; (b) `neubewertung.mjs --nur-kontrolle` 8/8 byte-gleich (K8I-005, `daten/neubewertung/kontrolle.json`) | in K8I-005 gelaufen (Roh-Fakten außerhalb des Repos), in K8I-006 nicht wiederholt |
| AC-N2 | `neubewertung.md` Abschnitt 4: F 4/4 (F-052-1); `pruefen.mjs --daten specs/052-k8-interspacoj/daten/neubewertung --ohne-bericht` Exit 0 (K8I-005); **neu in CI:** `konto-m1-plena` = 1 in allen 8 Kombinationen (`interspacoj-052.test.ts`) | `konto` grün jetzt auch als CI-Test belegt; `anmelden` als `anmelden-m1`; `registrieren` und `passwort-vergessen` nur durch den Bericht (kein Fixture) |
| AC-N3 | `interspacoj-052.test.ts` › „anmelden-m1 (M-1 F anmelden, unchanged): interspacoj = 1 in all combinations“, „konto-m1 (M-1 F konto without the heading, Rest C): …“; rot belegt in K8I-002 (`anmelden-m1` 0,8571 provo/provo-kompakta; `konto-m1` < 1 überall) | grün |
| AC-N4 | rote Commits `9f67d684`, `f9a757f7`, `56267833`, `81d51d05`, `906e835b` mit Ausgabe oben; Paketläufe unten | grün außer den fremden (unten) |
| AC-N5 | `neubewertung.md` Abschnitte 3, 6, 7; `neubewertung.mjs --selbstpruefung` (K8I-005) | in K8I-005 belegt |
| AC-N6 | `neubewertung.md` Abschnitt 10 („nicht gestartet“) | erfüllt |
| AC-G1 | **neu** `querschnitt-052.test.ts` › „AUF_STUFO is still 0.5 px (D-08)“; `git diff -U0 c439918f -- packages/nordstelo/src/k8/k8.ts \| grep -E "^[-+].*(AUF_STUFO\|surStupo\|k8Plena\|mankoj\|MANKO_AL_MERKMAL\|distanco)"` → kein Treffer (einziger Hunk `@@ -187,22 +187,34 @@`, `interspacoj()`); `git diff --stat c439918f -- packages/ekranoj/src/verda.ts packages/ekranoj/src/rondoj.ts` leer (Grün-Regel `decidiVerdon`); `git diff c439918f --stat -- '**/vitest*.config.ts' '**/playwright*.config.ts' .github turbo.json` leer; `.only(`/`.skip(` in `packages/*/src packages/*/test`: dieselben 3 Treffer wie auf `c439918f` (`mcp/src/http.test.ts:97`, `eroj/test/forced-colors.spec.ts:14`, `eroj/test/quickstart.spec.ts:47`) | erfüllt |
| AC-G2 | PR vom aktuellen `main` | **Orchestrator** |
| AC-G3 | kein Modell-Lauf; K8I-006 hat keinen gestartet | erfüllt (je Ticket im Build-Log) |
| AC-G4 | PR offen, CI je Job, Bericht | **Orchestrator** |

**Nicht voll im CI belegt (bewusst):** AC-A4 (Bildvergleich ist ein dokumentierter Lauf, kein CI-Test; der Code-Guard läuft in CI), AC-N1/AC-N2/AC-N5 (Neubewertung braucht die Roh-Fakten von M-1 außerhalb des Repos; in CI nur `konto-m1-plena` und `anmelden-m1`), AC-G2/AC-G4 (Orchestrator).

### Läufe (nacheinander, `FM_AUSGABE=knapp`, Last vor jedem Lauf < 10)

| Lauf | Ergebnis |
|---|---|
| `pnpm --filter @fundamento/nordstelo exec vitest run src/k8/` | 164 bestanden, 0 rot (vorher 105) |
| `pnpm --filter @fundamento/projekcioj test` | 1 556 bestanden, 1 rot, 6 übersprungen: rot nur `src/celoj/figma/figma-cxiuj.test.ts:32` „Hook timed out in 180000ms“ (`beforeAll`, Build aller Beispielmarken; Last während des Laufs bis 53, eine VM auf der Maschine); die 5 übersprungenen sind die Tests dieser Datei. Ein Rerun (R-8) der Datei: **5 bestanden, 0 rot** in 58,5 s. Ohne Bezug zu Spec 052 (Figma-Celo unverändert) |
| `pnpm --filter @fundamento/nordstelo test` | 367 bestanden, 0 rot (vorher 308) |
| `pnpm --filter @fundamento/ekranoj test` | 301 bestanden, 0 rot (`rondoj.test.ts:733` grün) |
| Eroj `playwright test test/interspacoj-052.spec.ts --project=chromium` | 49 bestanden, 0 rot |
| … `--project=firefox` | 49 bestanden, 0 rot (erster Lauf in Firefox) |
| … `--project=webkit` | 49 bestanden, 0 rot (erster Lauf in WebKit) |
| Eroj Chromium `sxablonoj` / `sxablonoj-2` / `sxablonoj-3` / `nachlese-8` / `metiejo` / `studio-035` / `buehne-036` | 6/0, 4/0, 6/0, 6/0, 6/0, 6/0, 20/0 |
| `pnpm --filter @fundamento/modelo exec vitest run src/ci/turbo-inputs.test.ts` | 8 bestanden, 0 rot (`:679` in diesem Lauf grün) |
| `pnpm --filter @fundamento/modelo exec vitest run src/ci/` (neue Dateien per `git add -N` sichtbar) | 158 bestanden, 0 rot – die neuen Dateien lösen in den CI-Tests nichts aus |
| `pnpm lint` | Exit 0, 22/22 Tasks; nur bestehende Warnungen in fremden Dateien, keine in den Dateien dieses Tickets |
| `pnpm check:parity` | `differences=0 items=45`, 0 Fehler |
| `pnpm check:privat` | 0 Fehler (4 489 Dateien, mit den neuen) |
| `pnpm test:betroffen` (Basis `c439918f`, 7 Pakete: cli, ekranoj, eroj, metiejo, modelo, nordstelo, projekcioj; Engines chromium, firefox, webkit) | Lauf 1: rot nur nordstelo `src/ac8.test.ts:156` und `src/ablauf/integra.test.ts:131` „Hook timed out in 10000ms“; Turbo bricht danach ab. Rerun (R-8): dieselben zwei plus `src/ablauf/raporto.test.ts:70` und `:236` „Test timed out in 5000ms“, Last bis 51 (alle Paket-Suiten parallel). Dieselben Dateien einzeln bei Last 9: 11 bestanden, 0 rot; die nordstelo-Suite allein 367/0. Deshalb derselbe Befehl nacheinander: `turbo run test --concurrency=1 --continue` mit denselben Filtern und `PLAYWRIGHT_ENGINES` (keine Grenze geändert): **cli, ekranoj, metiejo, modelo, nordstelo grün**; projekcioj 1 556/1 rot (`figma-cxiuj.test.ts:32` Hook-Timeout wie oben); eroj Vitest 43/0, Playwright **2 172 bestanden, 1 rot, 2 übersprungen** (Last bis 110): rot `test/metiejo-036.spec.ts:63` [firefox] „page.waitForURL: Target page, context or browser has been closed“ – Rerun (R-8) `metiejo-036.spec.ts --project=firefox`: 2/0. Fremd (Spec 036, kein Bezug zu `fm-sxelo`-Geometrie oder K8) |
| Determinismus: `pnpm build` zweimal (beide aus dem Cache), dann `turbo run build --force` (0 von 10 aus dem Cache) | `dist` aller 10 Pakete vor und nach dem erzwungenen Build `diff -rq` gleich; `git diff --exit-code -- packages/*/dist packages/projekcioj` Exit 0 |

### Befunde K8I-006

- **B-006-1** Kein neuer Befund an Spec 052: Firefox und WebKit sind für `interspacoj-052.spec.ts` grün, `konto-m1-plena` ist in allen 8 Kombinationen 1 mit genau einem `verteilita`-Paar (`fm-pagxo`). K8I-005 (F-052-1) ist damit als CI-Test festgehalten.
- **B-006-2** `projekcioj` `src/celoj/figma/figma-cxiuj.test.ts:32` „Hook timed out in 180000ms“ in **beiden** vollen Paketläufen (Last 50–110 durch die eigenen Worker und eine VM auf der Maschine), einzeln 5/0 in 58,5 s. Spec 052 ändert an Figma nichts (`plan.md` › K8I-003 › Projektionen). Last-Befund, keine Grenze geändert; für die CI beobachten.
- **B-006-4** `pnpm test:betroffen` startet alle betroffenen Paket-Suiten parallel; auf dieser Maschine reißen dabei die kurzen Hook- und Test-Timeouts von nordstelo (10 s bzw. 5 s). Nacheinander ist alles grün bis auf B-006-2 und den fremden Firefox-Abbruch `metiejo-036.spec.ts:63` (Rerun grün).
- **B-006-3** Die Fixture-Liste von `determinismo.test.ts` und `querschnitt-052.test.ts` kommt aus dem Ordner `test/fixtures/k8`; `querschnitt-052.test.ts` hält Ordner und `NOMOJ` von `generi.mjs` gleich. Ein neues Fixture ohne Eintrag im Generator (oder umgekehrt) wird rot.

## Geänderte Erwartungen älterer Tests (`testing.md` › „Extending tested pure functions“)

Keine in K8I-001 und K8I-002 (`k8.test.ts` nur um einen `describe` ergänzt, der Typ-Import um `Interspaco` erweitert; keine bestehende Erwartung geändert). Keine in K8I-003: Die sieben bestehenden Eroj-Specs mit `fm-sxelo`/`fm-filtrilo` und alle projekcioj-Tests sind mit dem Fix ohne Änderung grün (keine feste Erwartung hing an der doppelten Lücke nav → main); die neu erzeugten `faktoj.json`/`atendo.json` von `anmelden-m1` und `konto-m1` sind gerenderte Fakten, keine Erwartung eines älteren Tests. K8I-003 und K8I-004 tragen hier jede geänderte Erwartung mit Datei:Zeile, vorher/nachher und Grund ein (z. B. durch den Marker D-052-05 oder die kleinere Lücke von A).

| Datei:Zeile | vorher | nachher | Grund | Ticket |
|---|---|---|---|---|
| `packages/ekranoj/src/konstruo.test.ts:102` (jetzt 102–104) | `toContain('<link rel="stylesheet" href="../marko/css/fundamento.css">')` | `toContain('<link rel="stylesheet" href="../marko/css/fundamento.css" data-nordstelo>')` | Marker D-052-05 an jedem Rahmen-Link (`MEDIO_ATRIBUTO`) | K8I-004 |
| `packages/ekranoj/src/konstruo.test.ts:150` (jetzt 152–154) | ``toContain(`<style>body { font-family: var(${BAZA_TIPARO}); }</style>`)`` | ``toContain(`<style data-nordstelo>body { font-family: var(${BAZA_TIPARO}); }</style>`)`` | Marker D-052-05 auch an der Grundschrift-Regel des Rahmens (B-004-5) | K8I-004 |
| `packages/nordstelo/src/k8/zwilling.test.ts:211` | `expect(NORMIGAJ_KAZOJ.length).toBe(4)` | `expect(NORMIGAJ_KAZOJ.length).toBe(5)` | neuer Normalisierungsfall `VERTEILITA` (AC: mindestens ein Fall mit `verteilita`); `NORMIGAJ_KAZOJ` in `test-doubles/aspekto-kazoj.ts` um ihn ergänzt, die vier alten Fälle unverändert | K8I-004 |

K8I-006: keine bestehende Erwartung geändert. Erweitert: `packages/nordstelo/src/k8/determinismo.test.ts:28` (vorher Z. 24 `const FIKSAJXOJ = ["roh", "sxablono"] as const;`, nachher alle Ordner unter `test/fixtures/k8`, sortiert) – dieselben drei Erwartungen je Fixture, jetzt für 14 statt 2; `zwilling.test.ts`, `interspacoj-052.test.ts` und `eroj/test/interspacoj-052.spec.ts` nur um neue Tests ergänzt; `generi.mjs` nur um den Namen `konto-m1-plena` in `NOMOJ`.

K8I-004b: keine bestehende Erwartung geändert (keine Fixture- oder Fallzahl ist festgeschrieben; `interspacoj-052.test.ts` nur um drei Einträge in `GEGENPROBOJ` ergänzt, `generi.mjs` um drei Namen in `NOMOJ`).

Ergänzt, keine bestehende Erwartung geändert: `faktoj.test.ts` (ein `it` „carries verteilita through …“, Import um `VERTEILITA`, `ATENDO_VERTEILITA`). `documentOf` (nordstelo) hat keinen Test mit festem `<link>`-Text; `render.ts` `HEAD`/`SONDO_DOKUMENTO` ändern keine Erwartung.
