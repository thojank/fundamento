# Spec 052 – Aufgaben (K8 `interspacoj`: Abstände zwischen Geschwistern)

**Spec:** [`spec.md`](spec.md) · **Technische Spec:** [`technische-spec.md`](technische-spec.md) · **Plan:** [`plan.md`](plan.md) · **Basis:** `origin/main` `c439918f` · **Branch:** `261113-k8-interspacoj-abstnde--c719b4`

Sechs Tickets, ein Strang, streng nacheinander (D-052-08): `K8I-001 → K8I-002 → K8I-003 → K8I-004 → K8I-005 → K8I-006`. Commits lokal mit dem Präfix `Spec 052 K8I-00n: …` (Englisch), immer mit expliziten Pfaden. Kein Push, kein Merge, kein PR in den Tickets. Den einen PR öffnet der Orchestrator nach der QA. Jedes Ticket trägt hier seinen Stand ein: Commits mit SHA, Befehle, Ergebnisse.

| Ticket | Phase | Inhalt | hängt ab von | Stand |
|---|---|---|---|---|
| K8I-001 | 1 Grundlage | Start prüfen (052 frei, Basis-Diff), Spec-Ordner, Jugxo D-052-01, Entscheidungen D-052-02 … -09 | – | erledigt 2026-11-13 |
| K8I-002 | 2 Rote Tests | Rote Tests A und B, Fixtures aus M-1 (`anmelden-m1`, `konto-m1`), Gegenproben (a)–(d), 3c; Typ `verteilita` (V-1) | K8I-001 | erledigt 2026-11-13 (rot belegt) |
| K8I-003 | 3 Fixes | Fix A: leere Live-Bereiche im Projektor (`data-fm-leer`), Neubau Eroj, Baselines nach D-052-06 | K8I-002 | erledigt 2026-11-13 (`konto-m1` rot bis K8I-004) |
| K8I-004 | 3 Fixes | Fix B: Flat-Tree-Messung, `verteilita` nach D-052-01, Zwilling, `k8.ts`, Marker D-052-05 | K8I-003 | offen |
| K8I-005 | 4 Nachweis | Neubewertung M-1 (Kontrolle und gerendert) ohne Modell, `neubewertung.md`, Rest C als Befund | K8I-004 | offen |
| K8I-006 | 5 Tests | Test-Ticket: Gesamtstand, AC-Matrix vollständig, Querschnitt | K8I-005 | offen |

## AC-Zuordnung (AC → Ticket → Test)

Geplante Belege. Datei- und Testnamen stehen fest, sobald das Ticket sie anlegt; K8I-006 füllt die Matrix mit den echten Namen und Ergebnissen.

| AC | Inhalt (kurz) | Ticket | Test bzw. Befehl |
|---|---|---|---|
| AC-A1 | `fm-sxelo`, leeres `notices`: nav → main = `spacing.medium` ± 0,5, 4 Marken × hell/dunkel | K8I-002 (rot), K8I-003 | neue Eroj-Spec in `packages/eroj/test/` (Fall 1), Chromium; K8I-006 auch Firefox und WebKit |
| AC-A2 | Leerer Live-Bereich bleibt im Accessibility-Baum; gefüllt nimmt er Platz ein | K8I-002 (rot), K8I-003 | dieselbe Eroj-Spec (Fälle 2, 3, 4 Sprunglink) |
| AC-A3 | Regel aus `region.live` der Skemo für jede Sxablono mit `live`, kein Name im Element | K8I-002 (rot), K8I-003, K8I-006 | projekcioj-Unit (Liste der Live-Bereiche, Test-Kopie mit `live` an anderem Bereich); Eroj-Spec Fall 5 (`fm-filtrilo`); K8I-006: Menge aus der Modelo abgeleitet |
| AC-A4 | Sxablonoj ohne `live` byte-gleich; betroffene Bilder namentlich, alle anderen pixelgleich | K8I-002 (Guard), K8I-003 | projekcioj-Guard (SHA-256 je Sxablono, auch `inline: true`); Inventur und `cmp`-Vergleich nach D-052-06 in `plan.md` (K8I-003: Bildreferenzen betroffen: keine; 90 Bilder, 40 namentlich geändert – alle mit leerem `notices` –, 50 byte-gleich) |
| AC-B1 | Paare wie bisher, Abstand zwischen Flat-Tree-Kästen unter dem nächsten gemeinsamen Vorfahren | K8I-002 (rot), K8I-004 | nordstelo `src/k8/interspacoj-052.test.ts` (`konto-m1`, `anmelden-m1`); `faktoj.test.ts` |
| AC-B2 | `verteilita` nur für Eroj und Sxablonoj (alle drei Bedingungen von D-052-01) | K8I-002 (rot), K8I-004 | `interspacoj-052.test.ts` Gegenproben (c), (d1), (d2), (3c): kein Paar `verteilita`; `k8.test.ts` (V-2) |
| AC-B3 | Gegenproben (a)–(d) bleiben rot, jede zuerst rot belegt | K8I-002, K8I-004 | `interspacoj-052.test.ts` mit Selbsttest der gelockerten Fakten (K8I-002); Zwischenstand ohne Bedingung 2 und 3 rot (K8I-004, Build-Log) |
| AC-B4 | Jugxo mit Kialo vor dem Code | **K8I-001** | `plan.md` › D-052-01; Commit K8I-001 liegt vor jedem Code-Commit |
| AC-B5 | Zwilling identisch; gespeicherte Fakten ohne Feld wie bisher | K8I-004, K8I-006 | `zwilling.test.ts` (Fall mit `verteilita`), `gegenprobe.test.ts`, `determinismo.test.ts`; `roh`/`sxablono` byte-gleich (`git diff --exit-code`) |
| AC-C1 | Rest C nur Befund, nichts an `fm-atributlisto` oder Inline-Messung | K8I-005 | `neubewertung.md` › Rest C; Diff-Beleg in K8I-006 |
| AC-N1 | Kontrolle: gespeicherte M-1-Fakten byte-gleich, Urteil F 0/4 | K8I-005 | (a) `node specs/050-mvp-probelauf/pruefen.mjs` Exit 0; (b) `k8()` auf den Roh-Fakten = `taksado.k8` (D-052-09) |
| AC-N2 | Gerendert: wie viele der 4 F-Screens grün (erwartet 3) | K8I-005 | `node specs/052-k8-interspacoj/neubewertung.mjs`; `pruefen.mjs --daten specs/052-k8-interspacoj/daten/neubewertung --ohne-bericht` |
| AC-N3 | Fixture vorher rot, nachher grün (`anmelden-m1`, `konto-m1`) | K8I-002 (rot), K8I-003, K8I-004 | `interspacoj-052.test.ts` (CI-Job `unit (nordstelo)`, D-052-03) |
| AC-N4 | Neue Tests zuerst rot; bestehende Suiten grün außer den drei fremden | K8I-002 … K8I-006 | rote Commits je Paket (K8I-002); Paketläufe K8I-006 |
| AC-N5 | Bericht: gespeichert · Kontrolle · gerendert, `verteilita` nach Herkunft, Variante 0 | K8I-005 | `neubewertung.md`; Selbstprüfung von `neubewertung.mjs` (Exit ≠ 0 bei Agenten-Paar oder `verteilita` in Variante 0) |
| AC-N6 | Sauberer Probelauf nur vorbereitet | K8I-005 | `neubewertung.md` › Befehl, Kostenrahmen, Lastbedingung, „nicht gestartet“ |
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

## Geänderte Erwartungen älterer Tests (`testing.md` › „Extending tested pure functions“)

Keine in K8I-001 und K8I-002 (`k8.test.ts` nur um einen `describe` ergänzt, der Typ-Import um `Interspaco` erweitert; keine bestehende Erwartung geändert). Keine in K8I-003: Die sieben bestehenden Eroj-Specs mit `fm-sxelo`/`fm-filtrilo` und alle projekcioj-Tests sind mit dem Fix ohne Änderung grün (keine feste Erwartung hing an der doppelten Lücke nav → main); die neu erzeugten `faktoj.json`/`atendo.json` von `anmelden-m1` und `konto-m1` sind gerenderte Fakten, keine Erwartung eines älteren Tests. K8I-003 und K8I-004 tragen hier jede geänderte Erwartung mit Datei:Zeile, vorher/nachher und Grund ein (z. B. durch den Marker D-052-05 oder die kleinere Lücke von A).

| Datei:Zeile | vorher | nachher | Grund | Ticket |
|---|---|---|---|---|
