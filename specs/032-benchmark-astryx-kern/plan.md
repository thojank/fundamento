# Spec 032 – Benchmark Astryx im Kern, Fingerprint-Regeln, Ursache `perf` – Plan

**Briefing:** [`briefing.md`](briefing.md) (Auftrag Sitzung C vom 2026-10-24, unverändert kopiert; SHA-256 `8ef01979…57d628`) · **Benchmark:** [`research/benchmark-astryx-2026-10.md`](../../research/benchmark-astryx-2026-10.md) (aus `thojank/fundamento-benchmark-astryx`, PR #1, HEAD `a745aea`, Pfad `ergebnis/research/benchmark-astryx-2026-10.md`; unverändert, SHA-256 `ac9c6344…78f064c5`) · **Basis:** `main` `d29a5206` (nach #109) · **Regel 0** gilt: der Weg, den das Repo schon geht, sonst die kleinste Änderung mit Eintrag hier. **Kein Budget angehoben**, keine Tokens, keine Optik geändert, keine Constitution.

**Branch:** `261024-astryx-benchmark-clean-room-pe-7d4571` (von `main` `d29a5206`, nach dem Merge von #111 am 2026-10-28 auf `main` `7d049b5` neu aufgesetzt) · **Datum:** 2026-10-24, Nachtrag 2026-10-28 · **Stand:** gebaut, ② 4 nach E-1 gebaut, Abnahme offen.

**Clean Room (Art. V):** Aus dem Benchmark-Repo wurde nur diese eine Datei gelesen (`gh api …/contents/ergebnis/research/benchmark-astryx-2026-10.md?ref=a745aea`), sonst nichts. Kein fremdes System geöffnet.

### Zusammenfassung

1. **① Datei des Benchmarks:** `research/benchmark-astryx-2026-10.md` steht unverändert neben `research/benchmark-carbon-2026-10.md`, wie die Datei von Carbon in Spec 025: dieselbe Stelle, keine Bearbeitung, der Doku-Test prüft den SHA-256.
2. **② Fingerprints:** `check:clean-room` liest die Listen jeder Benchmark-Datei in `research/` selbst (zwischen `<!-- spuroj-anfang -->` und `<!-- spuroj-ende -->`). In der CI laufen damit Carbon (`benchmark-benko`, 269) und Astryx (`benchmark-astryx-theme-neutral`, 347; `benchmark-astryx-weitere`, 1660) mit, ohne `--spuroj`. Nach den Entscheidungen des Maintainers zählen nicht:
   - Schriftfamilien eines Benchmarks (Art. V: Beobachtung, kein Quellmaterial), für jede Liste außer der eigenen Marke;
   - triviale Werte, als Daten mit Kialo in `packages/modelo/src/checks/clean-room/trivialaj.json`;
   - der Zufallstreffer `color.palette.danger.900`, als Jugxo `jug_01M5PTA0PQY9P362JAVW9VP96G` zu Art. V mit Begründung, verknüpft über `hazardaj-trafoj.json`.

   **Ergebnis auf `main` vor #111: 0 Treffer**, 2278 Fingerprints aus 4 Listen; nicht gezählt: 54 Schriftfamilien eines Benchmarks, 200 triviale Werte (184 ohne die Tests, die Fixture und diesen Plan), 2 Stellen des Zufallstreffers.
3. **② 4 Fonto (E-1, Nachtrag 2026-10-28):** Die Liste `benchmark-astryx-theme-neutral` zählt nicht, solange `packages/modelo/data/fontoj.json` die Fonto Astryx mit Lizenz führt, gleich wo im Repo der Wert steht; die übrigen Themes von Astryx und Carbon zählen weiter (D-07, `fonto-listoj.json`). Nach dem Merge von #111 meldete die Prüfung 83 Treffer, alle aus theme-neutral; jetzt **0 Treffer** auf dem neu aufgesetzten Branch. Der Probe-Merge vom 24.10. (B-1) ist damit erledigt.
4. **③ `perf`:** Ursache des kalten ersten `check_contrast` gefunden und behoben. Der Aufruf ohne Zuweisung baute für jede der 144 Kombinationen die volle Überlagerung aller Tokens aller aktiven Sets (`overlayOf`), obwohl er drei Namen und ihre Alias-Ketten braucht. Im Modus `names` schlägt die Auflösung jetzt nur diese Namen nach. Kalter Aufruf im Prozess: 216 → 17 ms; `pnpm perf` fünf Läufe nacheinander grün (Messungen unten). Budget bleibt 100 ms.

### Ursachen

#### ③ Der kalte erste `check_contrast` (O-1 aus Nachlese 9)

- **Gemessen** im Prozess (Server-Modelo der Perf-Fixture, ekzemplo-Konfiguration: 144 Kombinationen, 15 Sets, 1608 Kern-Tokens), CPU-Profil des ersten Aufrufs mit 100 µs Abtastung:

  | Funktion | Zeit inkl. | davon selbst |
  |---|---|---|
  | `checkContrast` | 139 ms | 1 ms |
  | `resolveCombination` | 132 ms | 4 ms |
  | `overlayOf` (Überlagerung je Kombination, mit Fällen von `textTransform`) | 119 ms | 62 ms |
  | `overlaySets` (Map aller Tokens aller aktiven Sets) | 57 ms | 57 ms |
  | Messung, Farbe, Alias-Bindung zusammen | < 15 ms | |

- **Ursache:** `resolveCombination` cachte die Überlagerung je Folge aktiver Sets (Spec 002 AK-09). Der erste Aufruf ohne Zuweisung musste sie trotzdem für jede der 144 Kombinationen einmal bauen: jedes Token jedes aktiven Sets in eine Map, dazu ein zweiter Durchlauf für `textTransform`. Gebraucht werden drei Namen, die Flächenleiter und ihre Alias-Ketten. Die übrigen Aufrufe waren schnell (≈ 8 ms), weil die Überlagerungen dann im Cache lagen.
- **Kein JIT- und kein Ladeproblem:** Das Modelo ist beim Start geladen (`loadServed`), und der kalte Aufruf in einem frischen Prozess war ohne die Überlagerungen 17 ms (unten). Vorbereitete Daten im Build oder Laden beim Start hätten die 144 Überlagerungen nur verschoben: an den Start, der mit 1,9 bis 2,1 s schon am Budget von 2 s liegt (B-3).
- **Auf `main`** lag der erste Aufruf im Perf-Lauf bei 104 bis 110 ms (drei Läufe auf dieser Maschine), weil `resolve` und `explain` vorher acht der 144 Überlagerungen schon gebaut hatten. Als erster Aufruf eines frischen Servers waren es 216 ms im Prozess.

#### ② Die Treffer des Probelaufs

Der Probelauf nach § 7 der Datei von Astryx (36 Treffer auf `main` `d29a5206`) ist nachgestellt: 29 Schriftfamilien im Schriftkatalog der Werkstatt (`packages/metiejo/data/tiparoj.json`), 5 Grauwerte in Tests und Fixtures (aus theme-neutral) und 2 Stellen eines Zufallstreffers (`packages/vortaro/sets/core.json` und `specs/004-komparo/plan.md`, aus den übrigen Themes). Mit Carbon in der CI kommen 196 Treffer dazu: 25 Schriftfamilien, 165 Weiß-, Schwarz- und Grauwerte, 6 Stellen der linearen Kurve `0, 0, 1, 1` (Abweichung 1).

### Entwurfsentscheidungen

#### D-01 Die Prüfung liest die Benchmark-Datei selbst
Die Datei eines Benchmarks bleibt unverändert (①), also liest `check:clean-room` ihre Listen dort, wo sie stehen: jede Markdown-Datei direkt in `research/` mit `<!-- spuroj-anfang -->`. Eine Liste beginnt mit der Zeile, die ihre Quelle nennt („Quelle (source): …“ bei Carbon, „Quelle `…`“ bei Astryx) und die Zahl ihrer Fingerprints; darunter steht je Zeile ein SHA-256. Stimmt die Zahl nicht, fehlt das Ende oder steht ein Fingerprint vor jeder Quelle, meldet die Prüfung `clean-room-spuroj-invalid` mit Zeile. Eine neue Benchmark-Datei in `research/` läuft damit ohne Codeänderung mit.

Die Reihenfolge entscheidet wie bisher die Herkunft: die eigene Liste, dann die Benchmark-Dateien (nach Pfad), dann `markoSpuroj` der Konfiguration, dann `--spuroj`. Eine Fixture bringt ihre Benchmark-Datei unter `research/` mit wie ihre `marko-spuroj.json`.

Verworfen: eine abgeleitete JSON-Datei je Benchmark im Repo (zweite Quelle für dieselben Hashes) und `--spuroj` im CI-Schritt (eine Benchmark-Datei ohne Eintrag dort liefe nicht mit).

#### D-02 Schriftfamilien eines Benchmarks zählen nicht
Ein Treffer der Art `family` zählt nur, wenn die eigene Liste des Repos ihn kennt. Für jede andere Liste, ob aus `research/`, der Konfiguration oder `--spuroj`, ist der Name einer Schriftfamilie Beobachtung (Art. V, Entscheidung 1). Die Fixture der Spec 004 (`clean-room-fremda-spuro`) meldet deshalb nur noch die Farbe, nicht mehr „Fremda Serif“; Test und `expected-issues.json` sind nachgezogen.

Ein Treffer, der nicht zählt, gibt seine Stelle frei: Kennt ein Benchmark „X“ und die eigene Marke „X Mono“, wird „X Mono“ weiter gemeldet (vorher hätte der erste Treffer an derselben Stelle den zweiten verdeckt).

#### D-03 Triviale Werte als Daten mit Kialo
`trivialaj.json` hält vier Regeln, jede mit Kialo; `trivialaj.ts` liest sie nur:

| Regel | Was | Kialo (kurz) |
|---|---|---|
| `griza` | Hex mit R = G = B: Reinweiß, Reinschwarz, jeder Grauton | kein Farbton, der eine Marke kennzeichnet |
| `nula` | Farbe mit Deckkraft 0 (achtstelliges Hex, `…00`), Kurve `0, 0, 0, 0`, Länge 0 in jeder Einheit | Null-Werte zeichnen nichts (E-3) |
| `lineara-kurbo` | Kurve `0, 0, 1, 1` | CSS `linear`; Abweichung 1 |
| `malgrandaj-longoj` | 0, 1, 2 und 4 px | Längen sind nach K2 keine Kandidaten; die Regel gilt, sobald eine Liste Längen führt |

Die Regeln gelten für jede Liste, auch die eigene; die eigene Liste kennt keinen dieser Werte (geprüft: kein Grau, keine der beiden Kurven unter ihren 9 Fingerprints). Der Scan merkt sich dafür die Deckkraft eines achtstelligen Hex (`alpha`), die der Fingerprint weglässt.

#### D-04 Der Zufallstreffer: Jugxo und Liste mit Hash
`hazardaj-trafoj.json` nennt je Eintrag Fingerprint, Liste, Token und Jugxo, nie den Wert. Ein Eintrag nimmt nur aus, wenn die Jugxo in `data/jugxoj.json` steht und auf Art. V verweist; sonst meldet die Prüfung `clean-room-jugxo-missing`, und der Treffer zählt. Die Ausnahme gilt für Fingerprint und Liste, also an jeder Stelle: Der Wert ist Fundamentos eigener, auch dort, wo ein Plan ihn zitiert.

**Jugxo `jug_01M5PTA0PQY9P362JAVW9VP96G`** (Art. V, `approved`): `color.palette.danger.900` steht seit Spec 004 T006 (2026-09-20) im Kern, einen Monat vor der Messung von Astryx (2026-10-23). Die dunklen Stufen der Gefahrenfarbe liegen außerhalb von sRGB; Grün und Blau fallen auf 0, Rot steht auf zwei Stellen. Ein reiner Rotton hat einen freien Kanal mit rund hundert Werten, und die Liste kennt 1647 Farben.

#### D-05 Was nicht zählt, steht in der Ausgabe
Die Zusammenfassung und die Stats nennen `fingerprints`, `fingerprintSources`, `benchmarkFiles` sowie je Grund `benchmarkFamilies`, `trivialValues` und `randomHits`. Die Ausnahmen sind damit sichtbar und nicht still.

#### D-06 `perf`: nachschlagen statt überlagern
`resolveCombination(…, { names })` baut keine Überlagerung mehr. `namedOverlayOf` schlägt jeden Namen und jedes Glied seiner Alias-Kette in den aktiven Sets von hinten nach vorn nach: Das erste Set, das ihn definiert, gewinnt, wie in der vollen Überlagerung. Für `textTransform` gilt dasselbe. `bindAliases` fragt die Überlagerung nur nach Namen (`OverlayLookup`), die volle Auflösung ohne `names` bleibt unverändert und gecacht.

- Ergebnisse gleich: Der vorhandene Eigenschaftstest (Spec 002 D-18) vergleicht für zufällige Teilmengen und Kombinationen die Teilauflösung mit der vollen.
- Ursache als Test: Ein Proxy zählt jeden Durchlauf über die Tokens eines Sets. Für alle 144 Kombinationen mit drei Namen ist das genau einer, die sortierten Namen des Kerns (vorher: `core` 145-mal und zehn weitere Sets).
- Neuer Perf-Test: ein frischer Server, dessen erster Aufruf `check_contrast` ohne Zuweisung ist, unter 100 ms.

Auch `check:alirebleco` nutzt den Modus `names` (89 Paare); er wird dadurch nicht langsamer (Messungen).

Verworfen: Überlagerungen beim Start bauen (der Start liegt am Budget, B-3) und das Budget anheben (Regel des Maintainers vom 16.10.).

#### D-07 Fonto-Liste: eine Benchmark-Liste, die eine Fonto ist (E-1)
`fonto-listoj.json` ordnet einer Liste ihre Fonto zu, mit Kialo: `benchmark-astryx-theme-neutral` gehört zu `astryx`. `fonto-listoj.ts` liest die Registry (`packages/modelo/data/fontoj.json`, in einer Fixture `data/fontoj.json`). Die Liste zählt nicht, solange ihre Fonto dort mit Lizenz steht: `license` gesetzt, gepinnt (Version und Commit) und das Copyright in den Notices, die sie nennt. Das ist derselbe Nachweis, den Spec 029 ① von einer Fonto verlangt.

- **Unabhängig vom Ort:** Ein Wert der Liste zählt im Plan der Spec 029, in einer Jugxo, im Importskript und in einem Test so wenig wie im Set.
- **Andere Listen zählen weiter:** Kennt eine zweite Liste denselben Fingerprint (die übrigen Themes, Carbon, eine Liste über `--spuroj`), zählt der Treffer. Sonst hinge das Urteil an der Reihenfolge der Listen, denn die Herkunft eines Fingerprints ist die erste Liste, die ihn kennt.
- **Fällt der Eintrag weg** (ohne Lizenz, ungepinnt, andere ID), zählt die Liste wieder; ein Test belegt jeden der drei Fälle.
- **Neben der Ausnahme von #111:** Die Ausnahme über `deveno.json` (Spec 029 ①, je `$value` im Set) bleibt und kommt zuerst. Die Ausgabe nennt beide getrennt: „value(s) with Fonto provenance“ und „value(s) of a Fonto list“ (Stats `fontoValues`, `fontoListValues`).

### Abweichungen

1. **Lineare Kurve als trivialer Wert** (`lineara-kurbo`): Die Entscheidung des Maintainers nennt Weiß, Schwarz, Grau, Null-Werte und 0/1/2/4 px. Mit Carbon in der CI meldet die Prüfung auf `main` außerdem 6 Stellen der linearen Kurve `0, 0, 1, 1`, darunter `easing.curve.linear` im Kern („Linear: no easing“). Sie ist so trivial wie Weiß und Schwarz und steht als eigene Regel mit eigener Kialo in den Daten. Vom Maintainer bestätigt (E-2).
2. **„Null-Werte“ ausgelegt** als Farbe mit Deckkraft 0 und Kurve aus vier Nullen; vom Maintainer bestätigt und um Längen von 0 in jeder Einheit ergänzt (E-3).
3. **Fixture der Spec 004:** `clean-room-fremda-spuro` meldet einen Treffer statt zwei (D-02); das ist die Entscheidung 1, keine aufgeweichte Grenze.

### Befunde / Mankoj

- **B-1 Probe-Merge mit #111 (Fonto, ② 4):** Lokal ist #111 (`261023-spec-029-fonto-astryx-grundlagen`) auf diesen Branch gemergt und `check:clean-room` gelaufen (nicht gepusht). Ergebnis: **139 Treffer**, 136 aus `benchmark-astryx-theme-neutral` und 3 aus `benchmark-astryx-weitere` (Werte, die `deveno.json` als Werte der Fonto nennt). Zwei Gründe:
  1. **Fehler in `fonto.ts` von #111 (53 Treffer):** `fontoExemptions` nimmt als Kern das erste `vortaro/sets/core.json` der Dateiliste. Im Repo ist das eine Fixture (`packages/modelo/test/fixtures/invalid/alirebleco-high-contrast-fail/vortaro/sets/core.json`), nicht `packages/vortaro/sets/core.json`. Die 264 Einträge mit `aro: core` in `packages/aspekto-komuna/deveno.json` greifen deshalb ins Leere. Mit dem richtigen Kern sind es 106 ausgenommene Werte statt 23, und es bleiben 86 Treffer.
  2. **Die Werte stehen auch dort, wo #111 die Fonto dokumentiert (86 Treffer):**
     - `specs/029-fonto-astryx/plan.md`: 35
     - `packages/aspekto-komuna/jugxoj.json`: 33, der Wert der Fonto vor der Anpassung
     - `scripts/fonto-astryx/`: 15, das Skript, das die Werte aus den npm-Paketen schreibt
     - `packages/projekcioj/src/fonto/komuna-fonto.test.ts`: 3

     Die Ausnahme von #111 deckt nur den `$value` eines Tokens in einem Set, nicht diese Stellen. 81 der 86 sind Werte, die `deveno.json` als `fontoValoro` einer gültigen Fonto nennt; die übrigen 5 sind die Kurve der Fonto.

  Entschieden in E-1 (die Liste theme-neutral zählt nicht, solange die Fonto eingetragen ist); unter E-1 blieben von den 139 noch die 3 Treffer aus `benchmark-astryx-weitere` (O-6). Dieser PR wartet auf #111 und setzt danach neu auf.
- **B-2 Last auf der Messmaschine:** Andere Sitzungen ließen während der Arbeit Playwright und Vitest laufen (Load bis 140 auf 10 Kernen); einzelne Perf-Läufe zeigten dann einen Start von 15 s. Gemessen ist unten nur bei ruhiger Maschine, mit Load-Angabe.
- **B-3 Start am Budget:** Auf `main` lag „start to first describe“ in drei Läufen bei 1905, 1926 und 2056 ms (Budget 2000 ms, Load ≈ 7). Der Start ist nicht Teil dieses Auftrags und unverändert; er ist der nächste Kandidat für dieselbe Art Ursachensuche (O-5).

### Entscheidungen des Maintainers (2026-10-24)

- **E-1 Fonto-Ausnahme je Wert (zu O-2, O-3; gebaut am 2026-10-28, D-07):** Fingerprints, die der Benchmark als „aus theme-neutral“ kennzeichnet (Liste `benchmark-astryx-theme-neutral`, § 7.1 der Datei von Astryx), sind erlaubt, solange die Fonto Astryx in `packages/modelo/data/fontoj.json` mit Lizenz eingetragen ist, unabhängig vom Ort im Repo. Werte der übrigen sechs Themes von Astryx (`benchmark-astryx-weitere`) und von Carbon bleiben verboten. Gebaut wird nach dem Merge von #111; dieser PR setzt dann auf `main` neu auf. Ziel: 0 Treffer. Damit entfällt der Teil 2 von O-2 (Ausnahme über `deveno.json`); der Fehler beim Kern-Pfad in `fonto.ts` (B-1, Teil 1) ist für diese Ausnahme ohne Belang, bleibt aber ein Fehler von #111.
- **E-2 Lineare Kurve (zu O-1):** als triviale Regel, so lassen.
- **E-3 Null-Werte (zu O-4):** wie ausgelegt, Deckkraft 0 und Kurve aus vier Nullen, dazu Längen von 0 (in `trivialaj.json` nachgetragen, `nula`).
- **E-4 Start-Budget (zu O-5):** vorgemerkt, jetzt nichts tun.
- **Reihenfolge:** Bis zum Merge von #111 wartet dieser PR.

### Offen (für den Maintainer)

- **O-6 Ein Wert der Fonto in der Liste „weitere“** (zu E-1): Im Probe-Merge kommen 3 der 139 Treffer aus `benchmark-astryx-weitere`, alle derselbe Wert: der helle Wert von `color.background.inverse` der Fonto, wie #111 ihn liest. Er steht in `scripts/fonto-astryx/werte.mjs` (Zeile 104), in einer Jugxo von `packages/aspekto-komuna/jugxoj.json` und in `specs/029-fonto-astryx/plan.md` (Tabelle J-Liste). komuna nutzt ihn nicht (angepasst auf `neutral.950`). Die Datei von Astryx führt ihn nicht unter theme-neutral, sondern unter den übrigen Themes und dem Basis-Satz; vermutlich stammt er aus dem Basis-Satz von `@astryxdesign/core`, der zur Fonto gehört. Nach E-1 bliebe er verboten, und das Ziel 0 Treffer wäre nicht erreicht. Möglichkeiten:
  1. Die drei Stellen in #111 nennen den Wert nicht mehr (nur Token und Stufe).
  2. Eine Jugxo zu Art. V für diesen einen Fingerprint über `hazardaj-trafoj.json`, wie beim Zufallstreffer.
  3. E-1 auf den Basis-Satz der Fonto erweitern; die Datei von Astryx trennt ihn aber nicht von den sechs Themes.

  Vorschlag: 1, weil der Wert in komuna nicht vorkommt und die Stellen ihn nur zitieren.

  **Entschieden (Maintainer, 24.10.):** Möglichkeit 1. Die drei Stellen in #111 nennen nur Token und Stufe, nicht den Wert; das übernimmt Sitzung A in #111. Danach baut dieser PR die Fonto-Ausnahme nach E-1.

### Messungen

Alle auf dieser Maschine (Mac des Maintainers, Apple M1 Max, 10 Kerne), Node 24.21, gemessen bei Load 5 bis 8 (B-2). **`pnpm perf` fünf Läufe nacheinander, alle grün** (mcp 8 von 8, projekcioj 1 von 1):

| Lauf | Start bis `describe` | `check_contrast` (100 Aufrufe) Median / Maximum | kalter erster `check_contrast`, frischer Server | `fm projekcioj build` |
|---|---|---|---|---|
| 1 | 1857 ms | 8,1 / 14,5 ms | 16,8 ms | 3181 / 2488 / 2490 ms |
| 2 | 1952 ms | 8,1 / 13,4 ms | 35,0 ms | 3339 / 2576 / 2588 ms |
| 3 | 1867 ms | 7,9 / 13,2 ms | 15,8 ms | 3253 / 2487 / 2479 ms |
| 4 | 1858 ms | 8,1 / 13,5 ms | 16,1 ms | 3154 / 2468 / 2469 ms |
| 5 | 1895 ms | 8,1 / 13,8 ms | 16,1 ms | 3238 / 2470 / 2503 ms |
| **Median** | **1867 ms** | **8,1 / 13,5 ms** | **16,1 ms** | |
| **Maximum** | **1952 ms** | **8,1 / 14,5 ms** | **35,0 ms** | |

Budgets unverändert: Start 2000 ms, je Aufruf 100 ms, Projektionen 10 000 ms.

**Vorher** (der Stand von `main`, dieselbe Maschine, Load ≈ 8, zwei Läufe): `check_contrast` Maximum 107,8 und 108,8 ms (der erste Aufruf), kalter erster Aufruf im frischen Server 126,9 und 124,5 ms; beide Tests rot. Im Prozess ohne stdio: 216 ms vorher, 17 ms nachher.

**`check:alirebleco`** (89 Paare × 72 Kombinationen, ebenfalls im Modus `names`), je drei Läufe, Gesamtzeit des Prozesses: vorher 1,59 / 1,52 / 1,47 s, nachher 1,24 / 1,17 / 1,19 und 1,11 / 1,12 / 1,14 s.

**Tests:** Modelo 176 Dateien / 3822 Tests (3 rot im ersten Gesamtlauf, weil plan.md während des Laufs entstand; danach die drei Dateien grün, unten), MCP 45 / 436, Lint sauber. `check:clean-room` auf diesem Branch: 0 Fehler, 2278 Fingerprints aus 4 Listen.

### Messanleitung

Alle Befehle im Checkout des Maintainers, nach dem Merge (oder auf dem Branch):

```sh
cd /Users/thorstenjankowski/n8n-compose/20260918_fundamento-ds
git switch main && git pull
pnpm install && pnpm build
```

**1. Datei des Benchmarks (①):** unverändert gegenüber dem Benchmark-Repo.

```sh
cd /Users/thorstenjankowski/n8n-compose/20260918_fundamento-ds
shasum -a 256 research/benchmark-astryx-2026-10.md
open "file:///Users/thorstenjankowski/n8n-compose/20260918_fundamento-ds/research/benchmark-astryx-2026-10.md"
```

Erwartet: `ac9c6344aceffd84d01fcd1de271e9e2c33f9dd62ab71264b0d3291e78f064c5`, wie `ergebnis/research/benchmark-astryx-2026-10.md` im Benchmark-Repo auf `a745aea`.

**2. Clean-Room mit Carbon und Astryx (②):**

```sh
cd /Users/thorstenjankowski/n8n-compose/20260918_fundamento-ds
pnpm check:clean-room
```

Erwartet: `PASS clean-room: …; 2278 fingerprints from 4 list(s), not counted: 106 value(s) with Fonto provenance, 166 value(s) of a Fonto list, 52 benchmark font families, 251 trivial value(s), 2 random hit(s) with Jugxo.`, `0 error(s)`. Die Zahl der Dateien und der nicht gezählten Stellen hängt vom Checkout ab; entscheidend ist `0 error(s)`.

Gegenprobe mit der synthetischen Fixture (ein erfundener Benchmark in ihrem `research/`, keine echten Werte):

```sh
cd /Users/thorstenjankowski/n8n-compose/20260918_fundamento-ds
node packages/modelo/dist/checks/run.js clean-room --fixture packages/modelo/test/fixtures/invalid/clean-room-benchmark-spuroj
```

Erwartet: `FAIL` mit genau zwei Fehlern `clean-room-marko-spuro` in `src/theme.css` (Zeile 4: die Schrift der eigenen Marke der Fixture; Zeile 7: die Farbe, die nur der Benchmark hat) und „not counted: 1 benchmark font family, 4 trivial value(s), 1 random hit(s) with Jugxo“. Grau, Weiß, die durchsichtige Farbe, die lineare Kurve, die Schrift des Benchmarks und der Zufallstreffer mit Jugxo zählen nicht. Die Fixture: `file:///Users/thorstenjankowski/n8n-compose/20260918_fundamento-ds/packages/modelo/test/fixtures/invalid/clean-room-benchmark-spuroj/src/theme.css`.

Die Daten: `file:///Users/thorstenjankowski/n8n-compose/20260918_fundamento-ds/packages/modelo/src/checks/clean-room/trivialaj.json`, `file:///Users/thorstenjankowski/n8n-compose/20260918_fundamento-ds/packages/modelo/src/checks/clean-room/hazardaj-trafoj.json`; die Jugxo `jug_01M5PTA0PQY9P362JAVW9VP96G` am Ende von `file:///Users/thorstenjankowski/n8n-compose/20260918_fundamento-ds/packages/modelo/data/jugxoj.json`.

**3. `perf`, fünf Läufe nacheinander (③):** auf ruhiger Maschine (keine Tests anderer Checkouts nebenher).

```sh
cd /Users/thorstenjankowski/n8n-compose/20260918_fundamento-ds
for i in 1 2 3 4 5; do pnpm perf 2>&1 | grep -E "Spec 032 cold|AK-09 check_contrast|AK-07 start|Tests "; done
```

Erwartet je Lauf: `Tests  8 passed (8)` im Paket mcp, „Spec 032 cold first check_contrast“ deutlich unter 100 ms, `AK-09 check_contrast … max` unter 100 ms.

**Tests:**

```sh
cd /Users/thorstenjankowski/n8n-compose/20260918_fundamento-ds
pnpm --filter @fundamento/modelo exec vitest run src/checks/clean-room src/resolve src/gvidanto/check-contrast.test.ts src/docs/docs.test.ts src/contracts/contracts.test.ts
```

Die Briefing-Datei: `file:///Users/thorstenjankowski/n8n-compose/20260918_fundamento-ds/specs/032-benchmark-astryx-kern/briefing.md`.
