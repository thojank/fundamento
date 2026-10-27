# Nachlese 11 – Aufgaben

**Briefing:** [`briefing.md`](briefing.md) · **Plan:** [`plan.md`](plan.md) · **Branch:** `261024-nachlese-11-fehler-und-gewicht-d66050` (gestapelt auf #112, `721743f`). Aufgaben ab T3101.

### A – Rot zuerst
- [x] **T3101 Tests** in acht Dateien:
  - Browser `packages/eroj/test/nachlese-11.spec.ts`, in Chromium, Firefox und WebKit:
    - B-7: Tabelle ohne Slot, der gemessene Fall, zwei Tabellen mit Warnung
    - B-2: `slot="label"` am `kampo`, `butono` und `sxaltilo`, auch nachträglich
    - B-6: Kontrast ohne eigene Fläche in jeder Marke und jedem Modus; Fläche und Textfarbe an der Wurzel
  - Projekcioj `src/nachlese-11.test.ts`:
    - Konformität von Skemo, Web Component und React für 45
    - Slots der Guidelines, `defaultSlot` in `get_ero`
    - Seitenfläche in jeder Stylesheet-Datei, `setup.md`, `Guidelines.md`
  - MCP `src/nachlese-11-anbieter.test.ts`: 23 Werkzeuge gegen die Einschränkungen von Anthropic, OpenAI und Mistral; die Alternativen weiter abgelehnt.
  - Nordstelo `src/nachlese-11.test.ts`:
    - Gewichte, Tor, beide Gewichtungen
    - Bericht mit beiden
  - Nordstelo `src/rescore.test.ts`: Die Fixtures geben in der alten Gewichtung ihre Zahl wieder.
  - Metiejo `src/nordstelo.test.ts`: Spalte „Spec 030“.
  - Doku-Test (`specs/031-nachlese-11`, README-Quickstart).

  Rot in `a371f70`:
  - Browser: 21 von 21 (7 × 3 Engines)
  - Projekcioj: 252 (Inventare fehlen)
  - MCP: 3 (Wurzel mit `oneOf`/`anyOf`); grün war schon „Alternativen abgelehnt“, der Test bleibt als Wache
  - Nordstelo: 2 Dateien
  - Metiejo: 1
  - Doku: 2

### B – Grün
- [x] **T3102 B-3** (D-04): `bundleSchema` mit einem Objekt an der Wurzel und dem Satz der Alternativen. Die Beschreibung des Werkzeugs nimmt dieselben Wörter. `flattenSchema` in `nordstelo` entfernt, sein Test ersetzt („Schema unverändert angeboten“).
- [x] **T3103 ②** (D-06–D-08):
  - Schema `NordsteloFile` mit `pezojAntauxaj` und `multmarkeco`, Typen neu erzeugt
  - Katalog mit den neuen Gewichten
  - `multmarkeco`, `scoreBoth`
  - Bericht mit beiden Gewichtungen, Mittel je Kriterium, Markenfähigkeit
  - `restaro --skribi`
  - `kennzahlAntauxa` in Verlauf und Metiejo
- [x] **T3104 B-6** (D-05): `PAGE_SURFACE` im CSS-Celo; `setup.md`, `Guidelines.md`, README.
- [x] **T3105 B-7 und B-2** (D-01–D-03):
  - `#adoptContent` und `#slotText` ohne Tabellen
  - `DEFAULT_SLOT` und `#adoptDefault`
  - abgelöster Ersatz-Slot für `ikono`, `avataro`, `apartigilo`; `data-fm-own` am `markdovido`
  - `defaultSlot` in `get_ero` und seinem Ausgabeschema
  - Slot-Tabelle der Guidelines aus dem Skemo, mit Satz und Markierung
  - Inventare `elementEvents`, `reactInventory`, `guidelineSlots`
  - Ereignisse in 15 Skemoj und der `formularo`; `events` im Schema `SxablonoSkemo`

  Den roten Konformitätstest umgebaut (Abweichung 1): Slots und Props misst jetzt `packages/eroj/test/nachlese-11-konformeco.spec.ts` am Element im Browser. Der Unit-Test behält Ereignisse, React, Guidelines und Gvidanto. Gegenprobe mit erfundenem Slot und falschem Standard-Slot: rot.
- [x] **T3106 Nachgezogene Tests** (Abweichung 2):
  - Make Kit Nachlese 7 ① A-3 (`slot="tabs"`, `slot="items"` als derselbe Slot)
  - Make Kit Nachlese 7 ② B-3 (Zeile mit „(default slot)“)
  - `get_ero` mit `defaultSlot` (`eroj.test.ts`)
  - Warnung des `tabelo` ohne Text zwischen Tags (`ero-hardcoded-string`)

### C – Messung und Abschluss
- [x] **T3107 Ausgangslinie neu bewertet:** `pnpm nordstelo restaro .fundamento/nordstelo/20261024-0825 --skribi`, 120 Ergebnisse, 0 abweichend.
  - Nachlese 11: F 74,8 gegen 0 38
  - Spec 030: F 71 gegen 0 74,3
- [x] **T3108 Messpunkt nach den Korrekturen:** Lauf `20261024-1201` auf `39a0391`, `gpt-4.1-mini`.
  - Nachlese 11: F 79,6 gegen 0 35,2
  - Spec 030: F 75,6 gegen 0 71,4
  - 1 902 461 Tokens; `restaro` 0 abweichend
  - kein Schlüssel in einer Datei des Laufs oder im Log
- [x] **T3112 Reihen O und K** (Nachtrag des Maintainers vom 24.10.):
  - Stand von #112 (`721743f`) in einem eigenen Worktree gebaut; Proben mit einer Aufgabe nach `/tmp`
  - Ausgangslinie K `20261024-1233`, K nach den Korrekturen `20261024-1248`
  - Ausgangslinie O `20261024-1422` mit 1 Wiederholung (Entscheidung des Maintainers, der erste Versuch mit 3 Wiederholungen angehalten und aus dem Verlauf genommen)
  - alle mit `restaro --skribi` in beiden Gewichtungen, je 0 abweichend; kein Schlüssel in Dateien oder Logs
- [x] **T3114 Abschnitt ④ des Briefings** unverändert übernommen (Datei vom 24.10., 18:40; die Übertragung um 13:11 war fehlgeschlagen). Doku-Test mit neuem SHA und den drei Reihen.
- [x] **T3115 Rot für ④ und O-6** in `df6d911`, `nordstelo/src/nachlese-11-reihen.test.ts` (Datei lädt nicht, `limoj.js` fehlt) und Doku 1:
  - Bereiche einer Sxablono
  - Grenzen je Anbieter, Pforte je Sekunde und Tag
  - 429 ohne Abbruch
  - Schätzung
  - Pause und Fortsetzen
- [x] **T3116 Grün:**
  - O-6 in `score.ts` (D-14)
  - `limoj.ts` (D-10, D-13)
  - Agent mit Pforte, `requests` und wachsendem Abstand (D-11)
  - `run.ts` mit `stato.json`, Pause und Fortsetzen (D-12)
  - Bericht mit Anfragen
  - CLI mit `--anfragen-sekunde`, `--anfragen-tag` und `anfragoj.json`
- [x] **T3117 Neu bewertet nach O-6:** `restaro --skribi` für `20261024-0825`, `-1201`, `-1233`, `-1248`, `-1422`. Abweichend 7, 8, 27, 32, 5, genau die von B-8 betroffenen Ergebnisse.
- [x] **T3118 Ausgangslinie O wiederholt** am 27.10., Worktree auf `721743f`: `20261027-1500`.
  - 19 von 40 ohne Seite, Nachlese 11 F 0 gegen 0 33,3, Spec 030 F 0 gegen 0 50
  - 520 Anfragen geschätzt und ins Tagesbuch eingetragen
- [x] **T3113 O nach den Korrekturen** am 27.10. auf `56c7266`: `20261027-1535`.
  - Nachlese 11 F 89 gegen 0 16,7, Spec 030 F 86,8 gegen 0 21,5
  - 459 Anfragen, keine Pause
  - 10 von 40 ohne Seite (Zeitüberschreitung in 0); `restaro` 0 abweichend; kein Schlüssel in Dateien oder Logs
- [x] **T3119 B-9:** Zeitüberschreitung beim Lesen der Antwort gehört zum Versuch. Rot in einem eigenen Commit, grün im Folgecommit.
- [ ] **T3109 Messpunkt nach der Fonto:** nach dem Merge von Spec 029 ① (Sitzung A oder Maintainer), Messanleitung Schritt 4.
- [x] **T3110 Doku:**
  - plan: Zusammenfassung, Ursachen, D-01–D-09, Messpunkte, Abweichungen 1–5, B-1–B-7, O-1–O-5, Messanleitung
  - tasks, Vojmapo, README
- [x] **T3111 Messungen:** unten; Bericht im PR.

### Messungen

| Was | Wert |
|---|---|
| Commits | rot `a371f70`, Umsetzung `39a0391` (Commit des Messpunkts), grün im Folgecommit (Hash im PR) |
| Rot gemessen | Browser 21, Projekcioj 252, MCP 3, Nordstelo 2 Dateien, Metiejo 1, Doku 2 |
| Grün gemessen | Modelo 176 Dateien / 3 823 Tests; Projekcioj 41 / 1 123; MCP 46 / 442; Metiejo 17 / 189; CLI 7 / 76; Agordilo 14 / 110; Nordstelo 6 / 49; Browser Chromium 340, Firefox und WebKit 678 (2 übersprungen wie bisher); Alirebleco der Eroj 633; Make Kit 5; Vitrino-Check 56; Quickstart 14,2 s; `check:parity` 40 / 0 Differenzen / 659 freigegeben; `check:vortaro-lint`, `check:regularo`, `check:mankoj`, `check:alirebleco`, `check:clean-room`, `check:ikonaro`, `check:tiparoj` sauber; Lint sauber |
| Ausgangslinie neu bewertet | 120 Ergebnisse, 0 abweichend; Nachlese 11 F 74,8 / 0 38; Spec 030 F 71 / 0 74,3 |
| Nach den Korrekturen | `20261024-1201`: Nachlese 11 F 79,6 / 0 35,2; Spec 030 F 75,6 / 0 71,4; Streuung 8,6 / 0 (9,5 / 9,6); 1 838 103 Tokens ein, 64 358 aus |
