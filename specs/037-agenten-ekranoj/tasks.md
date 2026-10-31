# Spec 037 – Aufgaben

**Spec:** [`spec.md`](spec.md) · **Plan:** [`plan.md`](plan.md) · **Basis:** `main` `f2b5a058`. Aufgaben ab T3701, je Teil in „A – Rot zuerst“, „B – Grün“, „C – Messung und Abschluss“, dazu „Abschluss“. Rote Commits enden auf „(rot)“, grüne auf „(grün)“, Doku-Commits beginnen mit „Spec 037:“; Häkchen mit SHAs. In Klammern das Ticket, das die Aufgabe trägt. Die Nummern sind vorläufig (D-S037-01-7).

## Teil 1 – Ablauf „Screens bauen“ (`fm ekranoj`)

**Branch:** `261031-spec-037-ekranoj` (PR A, Worktree `/tmp/s037-a`).

### A – Rot zuerst
- [x] **T3701 1.2, 1.5 (S037-02)** Paket-Gerüst `packages/ekranoj` mit `test`-Skript; Tests `validiPlanon` (6 Screens abgelehnt mit Regel und Pfad, doppelter Slug, Kante zu unbekanntem Slug, gültiger Plan mit 5 Screens), `navigado` (fehlende Kante, toter Verweis, Formel D-28, `kompleta` je Screen), Grün-Entscheidung D-04 (jede Bedingung kippt sie; Variante 0 ohne `check_usage`), Modellwache D-19, Modulgraph AC-10 mit Negativprobe; erwartet rot auch `workflow.test.ts` (ekranoj ohne Platz in der Matrix). – rot `f3137c13`: 20 von 23 Tests rot (`TypeError: validiPlanon is not a function`, `navigado is not a function`, `decidiVerdon is not a function`, `kontroliModelon is not a function`, `expected [ undefined, undefined ] to deeply equal [ 5, 3 ]`), `workflow.test.ts` › „runs the unit tests on one runner per package …“ rot (`expected [ 'agordilo', 'cli', 'ekranoj', …(4) ] to deeply equal [ 'agordilo', 'cli', 'mcp', …(3) ]`). AC-10 zusätzlich an einer lokalen Mutation rot gesehen (`typeof import("../../nordstelo/dist/index.js")` in `navigado.ts` → `"rule": "forbidden-import"`).
- [ ] **T3702 1.2, 1.3, 1.5, 1.7 (S037-03)** Tests auf Attrappen: AC-8 (nie grün → genau 3 Runden, jede Abweichung mit Regel und Kialo; grün nach Runde 2 → Runde 3 fortgeschrieben, D-26), AC-9 (`maksTokenoj` vor der Anfrage erreicht → `haltigo: "max-tokens"`, Teilergebnis), Schätzung vor der ersten Anfrage, keine schreibenden Werkzeuge angeboten, Liste mit 6 Screens ohne Anfrage abgelehnt, D-38, Variante 0 ohne Werkzeuge.
- [ ] **T3703 1.4, 1.6, 1.9 (S037-04)** Ausgabeordner und Bericht 1.6 aus einem Attrappen-Lauf, Determinismus (zweimal byte-gleich bis auf die Lauf-ID), AC-7 rein (komuna und provo: Fragment byte-gleich, kein Farbwert, kein Rohwert einer Marke), Lauf ohne Browser (ein Satz, kein Screen grün); `test:browser`: berechnete Farbe eines Ero-Teils unterscheidet sich zwischen komuna und provo, Übersicht über `file://`.
- [ ] **T3704 1.1, 1.7 (S037-05)** `fm ekranoj`: `--help` mit Untermodus `mankoj`, `fm --help` nennt `ekranoj`, `--ekranoj` mit 6 Namen → Exit 2 ohne Anfrage, ohne Terminal und ohne `--ja` → Schätzung und Exit 2 (D-37), `--max-tokens` mit Teilbericht und Exit 0, `file://`-Links am Ende, anderes Modell → Exit 2 vor jeder Anfrage, Schlüssel nie in der Ausgabe; Adapter in nordstelo: gleiche Fakten → gleiche Bewertung, K6 ohne Kriterien `null`, `Fakto` zuweisbar an `Facts`.

### B – Grün
- [x] **T3705 1.2, 1.5 (S037-02)** Plan, Navigation, Grün, Modellwache, öffentliche Typen C-1 bis C-6; je ein Wort in `.github/workflows/ci.yml` und `packages/modelo/src/ci/workflow.test.ts` (D-15). Grüner Commit = Basis für Branch B. – grün `999cf1c7` (B-Basis): ekranoj 23/23 Tests grün, `pnpm lint` 18/18 grün, `workflow.test.ts` grün; Modelo-Suite 4146/4147 – rot bleibt `workspace.test.ts` (Befund Tabu, Blockiert im plan).
- [ ] **T3706 1.2, 1.3, 1.5, 1.7 (S037-03)** MCP-Client (D-16), Agent (`ChatModel`, D-18), Instanzen für `check_usage` (D-32), Runden, Kosten (D-20), `kuruEkranojn`.
- [ ] **T3707 1.4, 1.6, 1.9 (S037-04)** Rahmen, Renderer, Bildschirmfotos, Ausgabeordner, Übersicht, Bericht; gewählter Weg für `file://` (D-24).
- [ ] **T3708 1.1, 1.7 (S037-05)** Befehl `fm ekranoj` (zwei Zeilen in `cli.ts`, D-30) und Adapter `nordstelo/src/ekrano-taksilo.ts` (D-31); `score.ts` unverändert.

### C – Messung und Abschluss
- [x] **T3709 Q-1 (S037-01)** Spec byte-gleich (SHA-256 `0780c57e…deaed89`), Gerüst von plan und tasks – Doku-Commit „Spec 037: Spec byte-gleich, plan- und tasks-Gerüst“ `736a17cd`. Arbeitsplatz `/tmp/s037-a` installiert und gebaut, Schutzwerkzeug mit Selbsttest 45/45.
- [ ] **T3710 1.4, 1.9 (S037-04)** `pnpm --filter @fundamento/ekranoj test:browser` lokal grün, Ausgabezeile hier (D-17).
- [ ] **T3711 1.6 (S037-05)** Lokaler Lauf mit Attrappen-Modell über die Befehlsfabrik, Ordner unter `/tmp/s037-logs/smoke/`.
- [ ] **T3712 1.8 (S037-10)** Abnahme-Lauf komuna mit `ministral-14b-2512` (Reservierung `abnahme-komuna`, `--max-tokens 250000`), Last, Prüfprotokoll Messsperre.
- [ ] **T3713 1.8 (S037-10)** Abnahme-Lauf provo, gleicher Satz (Reservierung `abnahme-provo`), Last, Prüfprotokoll; Screens tragen provo, Fragment-Diff leer.

## Teil 3 – Lücken als Rückmeldung

**Branch:** `261031-spec-037-ekranoj` (PR A).

### A – Rot zuerst
- [ ] **T3714 3.1 (S037-06)** Zwei Fixture-Laufordner mit überlappenden Lücken → zusammengeführte Liste (Anzahl summiert, Aufgaben vereinigt, stabile Reihenfolge); Markdown-Tabelle `| # | Art | Lücke | Anzahl | Aufgaben | Beispielstelle | Vorschlag | Ziel |`; `fm ekranoj mankoj` gibt sie aus und schreibt JSON mit `--out`; leere Ordnerliste → Exit 2.

### B – Grün
- [ ] **T3715 3.1 (S037-06)** `packages/ekranoj/src/mankoj.ts` und Untermodus `mankoj` (D-29).

### C – Messung und Abschluss
- [ ] **T3716 3.2 (S037-06)** Mankoj Gvidanto: Werkzeugliste des MCP-Servers (nur gelesen) gegen den Bedarf des Ablaufs, je Lücke ein Befund mit Vorschlag im plan; kein Code in `packages/mcp`.
- [ ] **T3717 (S037-06)** PR A „Spec 037 – Ablauf Screens“ angelegt (Basis `main`, nicht gemergt), Tabu-Suche (AC-3) und Grenzen-Suche (AC-5) sauber, PR-Text mit `pruefen` geprüft; CI-Wächter im Hintergrund.
- [ ] **T3718 3.1 (S037-10, S037-12)** Lückenliste über alle Läufe im plan.

## Teil 2 – Messung „ganzer Ablauf“

**Branch:** `261031-spec-037-mezuro` (PR B, gestapelt auf PR A, Worktree `/tmp/s037-b`).

### A – Rot zuerst
- [ ] **T3719 2.1, 2.2 (S037-07)** Katalog: genau 5 Aufgaben mit je 3–5 Screens, Kanten nur zwischen eigenen Screens, jeder Screen mit Kriterium, `validiPlanon` nimmt jeden Plan an; Navigation über ekranoj (fehlende Kante, toter Verweis); Muster D-06 (zwei Screens mit verschiedener Hauptaktion → Anteil < 1); Variante 0 mit nativen Elementen; Determinismus AC-11 gegen erwartetes JSON.
- [ ] **T3720 2.3 (S037-08)** Lauf mit `kuruEkranojn`-Attrappe (2 Aufgaben × 2 Varianten) → Runden 1 und 3, Berichtszeilen je Aufgabe und Screen, Unterschiede F/0 und R1/R3; anderes Modell → Ende vor jeder Anfrage; unbekanntes `--art` → Aufruffehler; bestehender Weg von `pnpm nordstelo` unverändert; Bericht aus gespeicherten Daten gleich.

### B – Grün
- [ ] **T3721 2.1, 2.2 (S037-07)** `nordstelo/src/ablauf/{katalogo,sxablonoj-samaj,poentoj}.ts` (D-22, D-23), Fixtures unter `test/fixtures/ablauf/`.
- [ ] **T3722 2.3 (S037-08)** `nordstelo/src/ablauf/{kuro,raporto}.ts` und Weiche `--art ablauf` in `nordstelo/src/cli.ts` (D-39).

### C – Messung und Abschluss
- [ ] **T3723 2.2 (S037-07, S037-12)** Begründung D-05/D-06 im plan („Entwurf: Bewertung Navigation und Muster“).
- [ ] **T3724 (S037-08)** PR B „Spec 037 – Messung“ angelegt (Basis Branch A, nicht gemergt); CI-Wächter im Hintergrund.
- [ ] **T3725 (S037-09)** Wächter der Messsperre (D-08) und Lastprotokoll (D-09) im Hintergrund, Selbsttest mit Probe-Prozess.
- [ ] **T3726 2.4 (S037-10)** Erster Messpunkt Reihe K: F (Runde 1 und 3), dann 0, je Aufgabe und Screen, mit Last und Prüfprotokoll; Reservierung `messpunkt-…` ≤ 0,40 $; Streuung aus Spec 034 im Bericht.
- [ ] **T3727 2.5 (S037-12)** Wiederholung auf dem dann aktuellen `main` (nur wenn Teil 5 von Spec 036 gemergt ist; lokal, nie gepusht), sonst „Blockiert“ mit Befehl, Pfaden und Schätzung.

## Abschluss

- [ ] **T3728 (S037-11)** CI beider PRs ausgelesen (Lauf-IDs, Ergebnis).
- [ ] **T3729 (S037-11)** Neustarts bekannter Zeittests nach R-8 (höchstens einer je PR, Head und Job) mit Ergebnis.
- [ ] **T3730 Q-2 (S037-11)** Konfliktprüfung gegen die offenen PRs von Spec 036 (überschneidende Dateien, Probemerges, Skript aus Teil 6) und Merge-Position.
- [ ] **T3731 (S037-12)** Prüfungen vor dem letzten Push: AC-1 (Hash), AC-3 (Tabu-Pfade), AC-5 (Grenzen), AC-14 (`pruefen --diff` beider Spannen samt Autor und Committer).
- [ ] **T3732 Q-3 (S037-12)** plan, tasks und Bericht zusammengeführt (Entscheidungen D-40 ff.), Branch B auf den letzten Stand von A neu aufgesetzt (`--force-with-lease`), PR-Texte aktualisiert.
- [ ] **T3733 (S037-13)** Integrierte Testsuite über alle Abnahmekriterien, jede neue Prüfung an einer lokalen Mutation rot gesehen; Abdeckungskarte AC-1 bis AC-16 hier und im Bericht.
