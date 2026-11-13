# Spec 050 – Aufgaben

**Spec:** [`spec.md`](spec.md) · **Plan:** [`plan.md`](plan.md) · **Messkopf:** `main` `de931e40` (`de931e40caa87884216375c7c3897e5148cbd333`, Merge #163) · **Go:** Maintainer, 2026-11-12. Tickets `MVP-1.1` bis `MVP-3.2`, **streng nacheinander** (D-050-6). Es ändert sich kein Code; der einzige Repo-Ausstoß ist `specs/050-mvp-probelauf/**`. Bis nach dem letzten bezahlten Lauf lag dieser Ordner als Entwurf in `$S/entwurf/specs/050-mvp-probelauf/` (D-050-5). Häkchen mit Datum und Beleg; Commits erst in MVP-3.2.

| Ticket | Phase | Inhalt | Kosten | hängt ab von | Stand |
|---|---|---|---|---|---|
| MVP-1.1 | 1 Vorbereitung | Messkopf, Preise, Flags (Q-1 bis Q-3), Werkzeug-Kopie `$W`, Wächter, Scheiben, Entwurf `spec/plan/tasks` | 0 $ | – | erledigt 2026-11-12 |
| MVP-1.2 | 1 Vorbereitung | Export und `pruefen.mjs`, geprobt an Spec-038-Daten (D-050-4) | 0 $ | MVP-1.1 | erledigt 2026-11-12 |
| MVP-2.1 | 2 Messung | M-1 `probe-sonnet-komuna` (CLI `kontrolle-probe-sonnet-komuna`), Zielkennzahl X/4 | ≤ 4,00 $ | MVP-1.2 | erledigt, gestört (F 0/4, 0 0/4, 3,74 $) |
| MVP-2.2 | 2 Messung | M-2 `vergleich-ministral-komuna` (+ höchstens ein `wdh-` bei gestört) | ≤ 0,25 $ (+ ≤ 0,15 $) | MVP-2.1 | erledigt, gestört nach D-050-22 (F 0/4, 0 nicht gebaut, 0,25 $), kein `wdh-` |
| MVP-2.3 | 2 Messung | M-3 `marke-sonnet-ekzemplo` (CLI `kontrolle-marke-sonnet-ekzemplo`), `fm ekranoj --config <ekzemplo>` | ≤ 3,60 $ | MVP-2.2 | entfällt (D-050-23), Reservierung freigegeben, 0 $ |
| MVP-3.1 | 3 Auswertung | Entwurf ins Repo, `daten/`, Bilder, `bericht.md`, `luecken.json`, `pruefen.mjs` Exit 0 | 0 $ | MVP-2.3 | erledigt 2026-11-13 |
| MVP-3.2 | 3 Auswertung | AK-Prüfungen und Commit-Serie (kein Push) | 0 $ | MVP-3.1 | erledigt 2026-11-13 |

Push, PR, CI-Auswertung und der lokale CI-Nachtrag macht der Orchestrator nach MVP-3.2 (genau ein Push, ein PR, nie mergen).

## Phase 1 – Vorbereitung (0 $)

- [x] **MVP-1.1** Messkopf, Preise, Flags, Werkzeug-Kopie, Scheiben (2026-11-12):
  - [x] Spec-Nummer 050 frei (`git fetch origin`, `specs/` auf `origin/main` bis 049, keine offenen PRs).
  - [x] Messkopf `de931e40caa87884216375c7c3897e5148cbd333` = `origin/main`; `pnpm install --frozen-lockfile` und `pnpm build` Exit 0 (10/10 aus dem Cache, F-050-1); `git status --porcelain` leer.
  - [x] Preise 2026-11-12T18:20:55Z: `anthropic/claude-sonnet-5.5` 2 $ / 10 $, `mistralai/ministral-14b-2512` 0,20 $ je 10⁶ – wie erwartet, kein Stopp (D-050-8).
  - [x] Schlüssel nur Name und Länge: `OPENROUTER_API_KEY` (73), `MISTRAL_API_KEY` (32); `FM_KI_ANBIETER=mistral`, `FM_KI_MODELL=ministral-14b-2512`.
  - [x] Q-1 bis Q-3 ohne Kosten bestätigt (Hilfe H-1/H-2, Proben P-1 bis P-6 mit `--env /nonexistent`, Quellstellen) → D-050-1, D-050-2, D-050-3.
  - [x] Werkzeug-Kopie `$W` nach §2.2 (D-050-9, D-050-10), README mit „Nach einem Neustart“, Symlinks `/tmp/s050-werkzeug` und `/tmp/s050-logs`; `selbsttest` 322/322, `gardisto-selbsttest` 94/94 (D-050-11); Spec 038 per SHA-256 unverändert.
  - [x] Wächter `gardisto start` (PID 83766, nach D-050-11 neu: PID 7790); `gardisto einmal` ohne Treffer durch den 038-Wächter (D-050-7). Sperre „belegt“ durch fremde Playwright-Läufe (F-050-2).
  - [x] Spec-Nummer: Konflikt mit einer lokalen, ungepushten Spec 050 notiert (F-050-5), Entscheidung beim Maintainer.
  - [x] Scheiben reserviert: `probe-sonnet-komuna` 4,00, `vergleich-ministral-komuna` 0,25, `marke-sonnet-ekzemplo` 3,60; `kosten vorab` 1 666 000 / 1 250 000 / 1 500 000 (`wdh-` 750 000); `kosten stand` 0,00 von 8,00 $.
  - [x] Entwurf `spec.md` (byte-gleich, SHA-256 `fc66a822…3710`), `plan.md`, `tasks.md`.
- [x] **MVP-1.2** Export und `pruefen.mjs` (2026-11-12, 0 $; `plan.md` „Export und Gegenprobe“, Log `$S/logs/mvp-1.2-proben.log`):
  - [x] `$W/exportieren.mjs <laufordner> <zelle> <ziel>` für beide Formen (nordstelo-Messung: `enigo` offline mit dem gebauten Messkopf, `taksiloPorMezuro`, `navigado`, Gvidanto im Prozess `check_markup`/`check_usage`; `fm ekranoj`: aus `raporto.json`), `zusatz` aus `kuro.json` (D-050-12 bis D-050-18).
  - [x] `pruefen.mjs` im Entwurf (grün ⇔ `decidiVerdon(enigo).verda && zusatz.length === 0`, gegen `gespeichert.verda` und den Block ```` ```pruefen ```` in `bericht.md`; Exit 0/1/2).
  - [x] Probe 1 `kontrolle-l5/komuna`: **2/2 grün** (`liste` Runde 1, `detail` Runde 2 = `verdaEkde 2`), `gespeichert` überall gleich, Exit 0.
  - [x] Probe 2 `ablauf/nachher/20261107-1146` (+ `vorher-F`, `vorher-0`), nur `anmelden-und-konto`: ohne Absturz, 16 Screens, Abweichungen zu `stato.verda` 0 und zur Bewertung in `raporto.json` 0 (F-050-6, F-050-7).
  - [x] Negativprobe: Kopie mit `K5 = 0` → Exit 1; Kopie gelöscht. `$R` sauber, Spec 038 per SHA-256 unverändert.

## Phase 2 – Messung (bezahlt, je Ticket genau ein Lauf)

- [x] **MVP-2.1** M-1 `probe-sonnet-komuna` (Befehl in `plan.md`, „Befehle M-1 bis M-3“), gebucht ≤ 4,00 $; X/4 (F) und Y/4 (0) mit Runde, K8 je Marke, `k8-interspaco` getrennt. Erledigt 2026-11-13, gestört (F-050-11): F 0/4, 0 0/4, 3,74 $.
- [x] **MVP-2.2** M-2 `vergleich-ministral-komuna`, gebucht ≤ 0,25 $ (2026-11-13; `plan.md` „Läufe und Kosten“, „Grün je Screen“):
  - [x] Ein Lauf 08:20:40Z–09:07:49Z, Exit 0, 1 232 523 / 14 776 Tokens, 239 Anfragen, 175 Werkzeugaufrufe, **0,249460 $**; 0 nicht gestartet (Tokengrenze, F-050-15).
  - [x] 429: 175 Wartezeilen, zusammen 1 910 s, kein Abbruch. Last während des Laufs aus `$S/sperre.tsv`: 61 von 236 Proben > 10 (max. 43,37), fremde Messung nein.
  - [x] **Gestört nach D-050-22** (Maintainer), nicht wiederholt, kein `wdh-` (F-050-14).
  - [x] Export `m2` (Abweichungen 0) und `pruefen.mjs --ohne-bericht` Exit 0: m2 F 0/4, m2 0 0/4 (4 nicht gebaut).
  - [x] `restantajLauxRegulo`, K8 je Marke, `k8-interspaco` (nein), Muster L5-1 bis L5-3 für M-1 und M-2 aus den Fragmenten (D-050-26). Schlüssel-Scan der Logs sauber.
- [x] **MVP-2.3** M-3 `marke-sonnet-ekzemplo` **entfällt** (D-050-23, 2026-11-13): kein Lauf; Reservierung 3,60 $ mit Ledger-Zeile `freigegeben` geschlossen (D-050-25); `kosten stand` 3,99 $ von 8,00 $, keine offene Reservierung.

## Phase 3 – Auswertung und Abgabe (0 $)

- [x] **MVP-3.1** Entwurf nach `specs/050-mvp-probelauf/` (2026-11-13, 0 $; `plan.md` „Auswertung und Lieferung“):
  - [x] `daten/` mit `m1`, `m2` (kein `m3` nach D-050-23, kein `wdh-m2` nach D-050-22) und den TSV aus `$S`; 560 KB.
  - [x] Bilder nur M-1 F Runde 3, hell und dunkel (`bildigi-fragmentojn.mjs`, 8 Dateien).
  - [x] `bericht.md` (Punkte 1 bis 9, Empfehlung K8 `interspacoj`, Block `pruefen`, Zuordnung Ledger-ID ↔ CLI-Lauf-ID, CI als Platzhalter); `luecken.json` L50-1 bis L50-3.
  - [x] F-050-4 umformuliert (F-050-9); `spec.md` byte-gleich.
  - [x] `node specs/050-mvp-probelauf/pruefen.mjs` Exit 0.
- [x] **MVP-3.2** AK-1 bis AK-10 (Teil) in `plan.md` „Prüfungen vor dem Push“ (AK-3 und AK-8 nach D-050-23), `spec.md` byte-gleich, Schlüssel-Scan nur `spec.md:135`, `$W/pruefen --staged` sauber, `$W/audit-ac4` ohne Zeile; Commit-Serie über `$W/commit` mit `$S/identitaet` (2026-11-13), kein Push.
