# Spec 050 – MVP-Probelauf messen – Plan

**Spec:** [`spec.md`](spec.md) (Fassung vom 2026-11-12, 18 885 Bytes, unverändert kopiert; SHA-256 `fc66a82266a15bc5cf76f673d8f1ec55d7d889b4c3cad23a045f91cccf433710`) · **Regel 0** gilt: der Weg, den das Repo schon geht, sonst die kleinste Änderung mit Eintrag hier. **Keine Budgets, Grenzen, Schwellen, Rundenzahlen oder Toleranzen angehoben. Kein Code geändert. Nichts gemergt.**

**Freigabe (Go):** Maintainer, **2026-11-12**, für M-1, M-2 und M-3 (harte Kappe 8,00 $), höchstens einen `wdh-`-Ersatz für ein gestörtes M-2, eine Commit-Serie, einen Push, genau einen PR von `main`, nie mergen.

**Messkopf:** `de931e40caa87884216375c7c3897e5148cbd333` (= `origin/main`, Merge #163 „Spec 049“) · **Branch:** `261112-mvp-probelauf-messen-5--2419fa` (Worktree-Branch; eigene Commits erst in MVP-3.2, nur `specs/050-mvp-probelauf/**`) · **Datum:** 2026-11-12 · **Ticket-Präfix:** `MVP` · **Stand (MVP-3.2, 2026-11-13):** M-1 (Sonnet 5.5) und M-2 (ministral) gelaufen, beide gestört; M-3 entfällt (D-050-23). Ergebnis: **M-1 F komuna 0/4 (gestört)**, M-1 0 0/4, M-2 F 0/4, M-2 0 nicht gebaut. Gebucht 3,99 $ von 8,00 $. Auswertung in [`bericht.md`](bericht.md), Lücken L50-1 bis L50-3 in [`luecken.json`](luecken.json), Gegenprobe `pruefen.mjs` Exit 0. Commits auf dem Branch, kein Push (macht der Orchestrator).

**Ablage (D-050-5):** `spec.md`, `plan.md` und `tasks.md` liegen bis nach dem letzten bezahlten Lauf als Entwurf **außerhalb des Repos** unter `$S/entwurf/specs/050-mvp-probelauf/`. MVP-3.1 kopiert sie nach `specs/050-mvp-probelauf/`. Bis dahin gibt es keinen Commit, also gilt `HEAD = Messkopf`.

## Startbedingung (MVP-1.1)

**Spec-Nummer:** `git fetch origin` (nur lesen) am 2026-11-12 ≈ 18:20Z: `origin/main` = `de931e40caa87884216375c7c3897e5148cbd333`. `specs/` auf `origin/main` endet bei `049-kialoj-komuna`, es gibt kein `specs/050-*`. Offene PRs (`gh pr list --state open`): keine. Kein Remote-Branch nennt 050. **050 ist frei** und gilt in allen Pfaden. Achtung: eine parallele, noch nicht gepushte Spec nutzt lokal ebenfalls 050 (F-050-5).

**Messkopf (AK-2):** `git -C $R rev-parse HEAD` = `de931e40caa87884216375c7c3897e5148cbd333`; `git merge-base --is-ancestor HEAD origin/main` → ja (HEAD = `origin/main`). Der Branch hat keine eigenen Commits.

**Build (AK-2):** `pnpm install --frozen-lockfile` (2026-11-12T18:21:19Z): Exit 0, „Lockfile is up to date … Already up to date“. `pnpm build` (18:21:19Z–18:21:21Z): Exit 0, „Tasks: 10 successful, 10 total · Cached: 10 cached, 10 total · FULL TURBO“ (F-050-1). Danach `git -C $R status --porcelain` leer (0 Zeilen); `packages/nordstelo/dist/cli.js`, `packages/cli/dist/index.js` und `packages/ekranoj/dist/index.js` vorhanden. Log: `$S/logs/mvp-1.1-build.log`.

**Last beim Start:** 18:20Z 12,27 / 10,38 / 8,02 (1/5/15 min, 10 Kerne); 18:21Z 9,13 / 9,83 / 8,01.

**Schlüssel (AK-9, nur Name und Länge):** In `$M/.env` sind `OPENROUTER_API_KEY` (73 Zeichen) und `MISTRAL_API_KEY` (32 Zeichen) vorhanden und nicht leer. Kein Wert wurde gelesen, ausgegeben oder geloggt. Nicht geheim: `FM_KI_ANBIETER=mistral`, `FM_KI_MODELL=ministral-14b-2512`.

## Bezeichner

| Name | Wert |
|---|---|
| `$R` | `/Users/thorstenjankowski/.purple-code/worktrees/fundamento-wt-mwdq37vxoxdotj5v/repos/fundamento` (Messkopf ausgecheckt, kein Commit vor MVP-3.2) |
| `$M` | `/Users/thorstenjankowski/n8n-compose/20260918_fundamento-ds` (dort nie bauen, Branch wechseln oder committen; `.env` nie ausgeben) |
| `$S` | `$M/.fundamento/spec050` (Ledger, Sperre, Laufordner `m1/ m2/ m3/ wdh-m2/`, `entwurf/`, `logs/`, `identitaet`) |
| `$W` | `$S/werkzeug` (Kopie der Werkzeuge von Spec 038), Symlink `/tmp/s050-werkzeug` |
| Logs | `$S/logs`, Symlink `/tmp/s050-logs` |
| `$W38` | `$M/.fundamento/spec038/werkzeug`: nur lesen, nie ändern |
| `$D` | `$R/specs/050-mvp-probelauf/daten` (erst ab MVP-3.1) |

## Preise und Modell-IDs (AK-1, D-050-8)

Öffentliche Modellliste von OpenRouter (`GET https://openrouter.ai/api/v1/models`, ohne Schlüssel, HTTP 200, 469 Modelle) **einmal** am **2026-11-12T18:20:55Z** gelesen. Auszug: `$S/logs/mvp-1.1-openrouter-preise.json`.

| Modell (Lauf) | ID bei OpenRouter | Name | ein je 10⁶ | aus je 10⁶ | erwartet | Ergebnis |
|---|---|---|---|---|---|---|
| Sonnet 5.5 (M-1, M-3) | `anthropic/claude-sonnet-5.5` | Anthropic: Claude Sonnet 5.5 | 2,00 $ (`pricing.prompt` 0.000002) | 10,00 $ (`pricing.completion` 0.00001) | 2 $ / 10 $ | **gleich** |
| ministral (M-2, `wdh-`) | `mistralai/ministral-14b-2512` | Mistral: Ministral 3 14B 2512 | 0,20 $ (0.0000002) | 0,20 $ (0.0000002) | 0,20 $ | **gleich** |

- Sonnet 5.5: Kontext 1 000 000, Ausgabe höchstens 128 000 Tokens; Cache lesen 0,10 $, schreiben 2,50 $ je 10⁶. Daneben steht `anthropic/claude-sonnet-5.5:batch` (1 $ / 5 $): nicht gewählt, nur die genaue ID ist erlaubt (kein Ersatzmodell). In den CLIs heißt das Modell `openrouter/anthropic/claude-sonnet-5.5` (`KONTROLA_MODELO`, `packages/ekranoj/src/gardo.ts:13`).
- ministral läuft in M-2 über die Mistral-API (`FM_KI_ANBIETER=mistral` in der `.env`). Der Preis bei OpenRouter dient nur zum Abgleich. Gebucht wird 0,20 $ je 10⁶ wie in Spec 038.
- Keine ID fehlt, kein Preis ist höher. **Kein Stopp.**

## Flags ohne Kosten (Q-1 bis Q-3)

Quelle gelesen auf `de931e40`; Hilfe und Proben gegen den gebauten Messkopf. Jede Probe nutzt `--env /nonexistent` und endet vor jeder Anfrage. Es wurde nichts gestartet, kein Ordner angelegt (`--out` unter `/tmp/mvp11-work/proben/out` existiert danach nicht). Logs: `$S/logs/mvp-1.1-hilfe-nordstelo-ablauf.txt`, `mvp-1.1-hilfe-fm-ekranoj.txt`, `mvp-1.1-proben-env-nonexistent.log`.

| # | Befehl (gekürzt, `KM` = `openrouter/anthropic/claude-sonnet-5.5`) | Exit | Meldung |
|---|---|---|---|
| H-1 | `pnpm nordstelo --art ablauf --help` | 0 | Optionen: `--taskoj --varianten --ripetoj --max-tokens --lingvo --out --ledger --env --lauf-id --kontroll-modelo --json`; **kein `--modell`**; „`--max-tokens <n>` eine Tokengrenze für die ganze Messung“ |
| H-2 | `pnpm fm ekranoj --help` | 0 | `--config`, `--ekranoj`, `--max-tokens` („Token limit of the whole run“), `--env`, `--ledger`, `--ja`, `--lauf-id … --kontroll-modelo` |
| P-1 | nordstelo `--art ablauf … --lauf-id probe-x --kontroll-modelo KM --env /nonexistent` | **2** | `/lauf-id control-run-id: … die Lauf-ID „probe-x“ beginnt nicht mit kontrolle-.` · „Nichts wurde gestartet.“ |
| P-2 | nordstelo `… --lauf-id kontrolle-probe-x --kontroll-modelo KM --env /nonexistent` | **2** | „Keine .env unter /nonexistent.“ → das Paar ist **akzeptiert** |
| P-3 | nordstelo `… --lauf-id vergleich-x` (ohne `--kontroll-modelo`) `--env /nonexistent` | 2 | „Keine .env unter /nonexistent.“ → eine Lauf-ID ohne `kontrolle-` und ohne Kontrollmodell ist zulässig |
| P-4 | nordstelo `--art ablauf --modell KM --env /nonexistent` | 2 | „Unknown option '--modell'“ |
| P-5 | `fm ekranoj "Satz" --ekranoj anmelden,registrieren,passwort-vergessen,konto --config <ekzemplo> --lauf-id probe-x --kontroll-modelo KM --env /nonexistent …` | **2** | `/lauf-id control-run-id: …` · „Nothing was started.“ |
| P-6 | `fm ekranoj … --config <ekzemplo> --lauf-id kontrolle-probe-x --kontroll-modelo KM --env /nonexistent …` | **2** | „no .env at /nonexistent“ → Paar und `--config` **akzeptiert** |

`<ekzemplo>` = `packages/modelo/test/fixtures/valid/aspekto-ekzemplo/fundamento.config.json` (vorhanden, 95 Bytes, `"aspektoj": ["./aspekto-ekzemplo"]`). `fm ekranoj` leitet den Markennamen aus der Config vor der `.env` ab (`packages/cli/src/commands/ekranoj.ts:511`); ob der Markenbau für einen echten Lauf reicht, zeigt erst MVP-2.3 (Stopp-Regel dort).

**Quellstellen:**

- Q-1: `parseArgs` in `packages/nordstelo/src/ablauf/cli-ablauf.ts:429–447` (ohne `allowPositionals`, unbekannte Option → Exit 2; kein `--modell`); das Baumodell kommt aus der `.env` (`providerOf(settings)`) oder aus `--kontroll-modelo` (`agordojPorKontrolo`, Zeile 518–523).
- Q-2: `kontroliKontrolon` in `packages/ekranoj/src/gardo.ts:36` (Regeln `model-not-allowed`, `control-run-id`, `control-model-option`), aufgerufen vor der `.env` in `cli-ablauf.ts:505` und `packages/cli/src/commands/ekranoj.ts:535`.
- Q-3: `packages/nordstelo/src/ablauf/kuro.ts:416` `const komuna = new Budget(opcioj.maksTokenoj);`: **ein** Budget für alle Abläufe × Varianten × Wiederholungen eines Aufrufs; F läuft vor 0.

Der `celo` von `anmelden-und-konto` (`packages/nordstelo/src/ablauf/katalogo.ts:124–127`, deutsch): „Mitglieder von Team Nord melden sich an, legen ein Konto an, setzen ein vergessenes Passwort zurück und sehen ihr Konto 4711.“ Slugs in Katalogreihenfolge: `anmelden`, `registrieren`, `passwort-vergessen`, `konto`.

## Entscheidungen (D-050-1 bis D-050-26)

| # | Entscheidung | Beleg | Stand |
|---|---|---|---|
| D-050-1 | **M-2 läuft ohne Modellflag.** Der Ablauf-Modus kennt kein `--modell` (P-4). Das Baumodell kommt aus der `.env` (`mistral/ministral-14b-2512`). Der Platzhalter `<modellflag>` der technischen Spec entfällt. | Q-1, H-1, P-3, P-4 | bestätigt (MVP-1.1) |
| D-050-2 | **Sonnet läuft über das Kontrollpaar.** Die Ledger-ID bleibt die der Spec (`probe-sonnet-komuna`, `marke-sonnet-ekzemplo`; Scheiben `probe-`, `marke-`). Die **CLI-Lauf-ID ist `kontrolle-<Ledger-ID>`** (`kontrolle-probe-sonnet-komuna`, `kontrolle-marke-sonnet-ekzemplo`) mit `--kontroll-modelo openrouter/anthropic/claude-sonnet-5.5`. Sonnet ist damit **ohne Code setzbar**; der Stopp-Fall der Spec liegt nicht vor. `mezuri` erzwingt die Zuordnung (Abschnitt „Werkzeuge“). Die IDs `probe-…`/`marke-…` direkt als CLI-Lauf-ID enden mit Exit 2 (P-1, P-5). | Q-2, P-1, P-2, P-5, P-6 | bestätigt (MVP-1.1); Zuordnung kommt in `bericht.md` und `laeufe.tsv` (Spalte `zweck`) |
| D-050-3 | **`--max-tokens` gilt je Aufruf.** Ein `Budget` je Messung (`kuro.ts:416`), Hilfe „eine Tokengrenze für die ganze Messung“. Keine Teilung von M-1/M-2. M-1 **1 666 000**, M-2 **1 250 000**, M-3 **1 500 000**, `wdh-` **750 000**. Risiko R-1 (F verbraucht das Budget, 0 bleibt „nicht gestartet“) wird hingenommen und berichtet. | Q-3, H-1, H-2 | bestätigt (MVP-1.1) |
| D-050-4 | **Die Eingabe von `decidiVerdon` wird für M-1/M-2 offline aus den gespeicherten Fakten abgeleitet** (Ablauf-Modus speichert je Runde kein `malobservoj`, `k8.plena`, `kompleta`) und gegen `stato.verda` geprüft. | Q-4 der Implementierungs-Spec | **umgesetzt und geprobt (MVP-1.2)**: `$W/exportieren.mjs`, `pruefen.mjs`; Abschnitt „Export und Gegenprobe“, D-050-12 bis D-050-18 |
| D-050-5 | **Saubere Arbeitskopie während der Läufe.** `specs/050-mvp-probelauf/` liegt bis nach M-3 als Entwurf in `$S/entwurf/specs/050-mvp-probelauf/`; MVP-3.1 kopiert ihn ins Repo. | AK-2; nordstelo und `fm ekranoj` hängen sonst `-dirty` an den Commit | umgesetzt: `git -C $R status --porcelain` leer |
| D-050-6 | **Streng nacheinander.** Abweichung von `delivery.md` („höchstens 3 Tickets in Folge“), weil die Spec M-1 → M-2 → M-3 einzeln und ohne Last daneben vorschreibt. 7 Tickets ≤ 8. | Messplan der Spec | gilt |
| D-050-7 | **Der Wächter von Spec 038 läuft weiter** (PID 28582, `$M/.fundamento/spec038/werkzeug/gardisto lauf`). Er wird nicht gestoppt; keine Datei von Spec 038 wird geändert. Er setzt seine eigene Sperre während der Läufe von Spec 050 auf „belegt“ – richtig und harmlos. Der Wächter von Spec 050 zählt ihn nicht als Messprozess. | `gardisto einmal` (Abschnitt „Wächter“), `gardisto-selbsttest` Teil 3 und 9 | bestätigt (MVP-1.1) |
| D-050-8 | **Preise.** Sonnet wird immer aus Tokens × 2 $ / 10 $ je 10⁶ gebucht, ministral aus 0,20 $ je 10⁶. Stopp, wenn eine ID in der öffentlichen Liste fehlt oder ein Preis höher ist; ein niedrigerer Preis wird nur festgehalten. | Abschnitt „Preise“ (2026-11-12T18:20:55Z) | bestätigt, beide Preise gleich |

Ergänzend, vom Ingenieur in MVP-1.1 entschieden (Werkzeug, keine Grenze berührt; zur Kenntnis des Maintainers):

| # | Entscheidung | Grund |
|---|---|---|
| D-050-9 | **`kosten vorab` mit Faktor 1,0 für alle Scheiben**, `--max-tokens` = ⌊min(Schätzung, Rest) ÷ p⌋ auf 1 000 (p = p_eff 2,40 $ für Sonnet, 0,20 $ für ministral). Spec 038 nahm × 1,25 für ministral-Scheiben; das hätte `vorab vergleich-… --usd 0.25` mit Exit 3 abgelehnt, obwohl die technische Spec §3 genau ⌊0,25 ÷ 0,20 × 10⁶⌋ = 1 250 000 verlangt. | technische Spec §3; Implementierungs-Spec §2.4 („`kosten vorab <id> --usd <basis>`“) |
| D-050-10 | **Umgebungsvariablen `S050_*`** statt `S038_*` (`S050_S`, `S050_REPO`, `S050_LOGS`, `S050_LAUF_ID` an den Befehl, Testwerte nur außerhalb von `$S`). `listen-erzeugen` und `bildigi-fragmentojn.mjs` nehmen als Bezug standardmäßig `$R` (gebauter Messkopf) statt `/tmp/s038-bezug`. `$S/identitaet` ist eine Kopie von `$M/.fundamento/spec038/identitaet` (für `commit`/`pruefen --diff` in MVP-3.2). | Implementierungs-Spec §2.2 („Umbenennungen entscheidet der Ingenieur“), MVP-3.1 (Bilder gegen `$R`) |
| D-050-11 | **Plan-Marker nur ohne `specs/050-mvp-probelauf/**`** statt ohne `specs/050-*` (§2.2). Grund: eine andere Spec nutzt lokal dieselbe Nummer (F-050-5); deren Marker sollen zählen. Strenger, nicht lockerer. | F-050-5 |

Vom Ingenieur in MVP-1.2 entschieden (Export und Gegenprobe; keine Grenze berührt, kein Code im Repo; Abschnitt „Export und Gegenprobe“):

| # | Entscheidung | Grund |
|---|---|---|
| D-050-12 | **Fakten in `enigo` ohne `renders[].k8`.** Die K8-Sondenfakten je Render (≈ 10 KB je Marke × Schema, ≈ 170 KB je Screen) sind vom Bewerter schon in `taksado.k8` verrechnet; `decidiVerdon` liest von den Renders nur `scheme` und `axe`. Alles andere der Fakten bleibt (`lingvo`, `bytes`, `elements`, `aria`, `console`, Renders ohne `k8`). | Größe von `daten/` (in den Proben 4–15 KB statt ≈ 150–180 KB je `fakto.json`); das Ergebnis von `decidiVerdon` ist gleich |
| D-050-13 | **Bewertete Runde:** grün → `verdaEkde` (Runde der Entscheidung; getragene Runden wiederholen sie, D-26), nicht grün → letzte Runde in `stato`, nie geprüft → `runde`/`enigo` `null` (= „nicht gebaut“, nicht rot). Die Navigation dieser Runde läuft über alle Fakten der Runde, auch die getragenen. | `kontroliRondon` (`rondoj.ts`): getragene Screens werden nicht neu entschieden |
| D-050-14 | **Gvidanto offline = derselbe Server im Prozess:** `connectGvidanto()` aus `packages/nordstelo/dist/gvidanto.js` und `uzKontroliloDe` aus ekranoj, also der Weg von `realaPreparo` und `rondoj.ts` (`check_markup` auf dem Messkopf, sonst `check_usage`). F: Link-Props aus dem Prüfer; 0: Rückfallkarte. Kein eigener Nachbau der Prüfung. | Q-4; gleicher Code wie im Lauf, kein Netz |
| D-050-15 | **`zusatz` der Ablauf-Form** aus `kuro.json` und `rondoj/<n>/<slug>.respondo.txt` (Regeln im Abschnitt „Export und Gegenprobe“, Schritt 5); Reihenfolge wie im Lauf: `leere-seite`, `anbieterfehler`, `leere-antwort`. | `kontroliRondon`, `konstruiKunKapto`, `respondoTeksto` |
| D-050-16 | **ekranoj-Form ohne Neubewertung:** die Eingabe kommt aus `raporto.json` (gespeicherte Werte des Laufs), K8 als `{ kvoto, plena }` mit leeren `kombinacioj`/`mankoj` (mehr hält `raporto.json` nicht; `decidiVerdon` liest nur `plena`). | Q-4 („bei `fm ekranoj` steht alles im `raporto.json`“) |
| D-050-17 | **Block in `bericht.md`:** ein Codeblock mit Info-String `pruefen`, je Zelle und Variante eine Zeile `<zelle> <F\|0> <X>/<n> <grüne Slugs, sortiert, mit Komma \| ->`; `n` = alle Screens des Plans (auch „nicht gebaut“). `pruefen.mjs --abschnitt` druckt ihn. Fehlt `bericht.md` oder der Block, endet `pruefen.mjs` mit Exit 2. | §2.3 („Form wählt der Ingenieur“) |
| D-050-18 | **Zusätzliche Dateien je Zelle:** `lauf.json` (Ablauf-Form, AK-2 Commit), `<V>/kuro.json`, `<V>/plano.json`, unverändert kopiert; `fakto.json` hat zusätzlich `herkunft` (Form, Quelle `…/rondoj/<n>/<slug>`, Prüfweg). `pruefen.mjs` ignoriert beides. Das `raporto.json` der Messung wird ganz kopiert (bei M-1/M-2 nur ein Ablauf). Probe-Zellen heißen frei (`k038-komuna`, `a038-*`); die Daten im PR nur `m1`, `m2`, `m3`, `wdh-m2`. | Rückverfolgbarkeit (AK-2, AK-6) |

Vom Maintainer am 2026-11-13 entschieden (nach M-1 und M-2):

| # | Entscheidung | Folge |
|---|---|---|
| D-050-19 | Die Zielkennzahl M-1 F komuna wird als **0/4** geführt, mit dem Vermerk „gestört (Last, fremde Messung)“. M-1 wird nicht wiederholt. | Zielkennzahl in `bericht.md`: „M-1 F komuna 0/4 (gestört)“. |
| D-050-20 | Der Maintainer pausiert die parallele Session „Wacklige Browser-Tests“ für M-2 und M-3. | M-2 lief ohne fremde Messprozesse (Wächter-Treffer 0). |
| D-050-21 | Die Spec-Nummer bleibt **050**; die andere Spec nimmt die nächste freie Nummer. | F-050-5 erledigt. Pfade bleiben `specs/050-mvp-probelauf/`. |
| D-050-22 | **M-2 (ministral, komuna) gilt als gestört**: Last(1 min) > 10 in 5 Proben des Wächters (max. 11,15), wie bei M-1, obwohl `mezuri` „gestört nein“ gebucht hat. M-2 wird vollständig ausgewertet, exportiert und berichtet, mit Vermerk „gestört“. Keine Wiederholung, kein `wdh-`-Lauf. | Die ganze Wächter-Spur des Laufs zeigt mehr: 61 von 236 Proben > 10, max. 43,37 (F-050-14). Die gebuchte Zeile in `laeufe.tsv` bleibt unverändert („nein“); der Vermerk steht hier und in `bericht.md`. Die Scheibe `wdh-` bleibt unberührt (0,00 $, nie reserviert). |
| D-050-23 | **M-3 entfällt.** M-1 hat schon in allen vier Marken gerendert (komuna, ekzemplo, provo, provo-kompakta), und F scheitert überall nur an K8 `interspacoj` (F-050-13). Ein Sonnet-Lauf mit ekzemplo bringt keine neue Erkenntnis. Die Reservierung `marke-sonnet-ekzemplo` (3,60 $) wird freigegeben und im Ledger vermerkt. | AK-8 wird beantwortet mit „M-3 nicht gelaufen (Entscheidung D-050-23)“, dazu K8 je Marke aus M-1 als Beleg für den Markenwechsel und die Grenze dieses Belegs. |
| D-050-24 | **Abschluss ohne lokale Testläufe**, außer was der Abschluss braucht: Export, `pruefen.mjs`, Schlüssel-Scan, Struktur-Prüfungen, `$W/pruefen`. Kein `pnpm test`, kein `pnpm check`, kein Playwright. | Einziger Browser-Einsatz: die Bilder von M-1 F mit `bildigi-fragmentojn.mjs` (MVP-3.1). |

Vom Ingenieur in MVP-2.2 bis MVP-3.1 entschieden (kein Code im Repo, keine Grenze berührt):

| # | Entscheidung | Grund |
|---|---|---|
| D-050-25 | **Freigabe einer Reservierung im Ledger:** `kosten` kennt keinen Befehl dafür. Eine neue Zeile mit Status `freigegeben` (Betrag 0, Zweck nennt D-050-23) schließt die offene Reservierung; `ledgerStand` in `$W/sperre.mjs` liest `freigegeben` jetzt wie das Ende einer Reservierung (eine Zeile, nur in der Werkzeug-Kopie). Gebuchte Zeilen bleiben unberührt (Vergleich vorher/nachher). | D-050-23; `kosten stand` soll keine offene Reservierung mehr zeigen. Kein `selbsttest` danach (D-050-24). |
| D-050-26 | **Muster von L5-1 bis L5-3 aus den Fragmenten, nicht aus den Fakten.** Die Browser-Fakten (`elements`) zeigen ein ausdrücklich in den Standard-Slot gesetztes Kind ohne `slot`-Attribut (die Ero übernimmt es), deshalb sieht eine Suche über die Fakten das Muster von L5-1 nicht. Gesucht wird über `rondoj/<n>/<slug>.html` (parse5), die Befunde je Runde kommen über denselben Gvidanto-Pfad wie im Export (D-050-14). | AK-7 („gestützt auf die Fragmente“); Logs `$S/logs/mvp-2.2-l5-fragmente.log`, `mvp-2.2-befunde-je-runde.log` |

## Budget und Scheiben (AK-4)

Ledger `$S/kostoj.tsv` (`laeufe.tsv`, `pruefprotokoll.tsv` daneben), Kappe **8,00 $**. Wirksamer Preis Sonnet p_eff = 0,95 × 2 $ + 0,05 × 10 $ = **2,40 $ je 10⁶** (D-S038-31-5), ministral **0,20 $ je 10⁶**. Abgerundet auf volle Tausend. Keine Umbuchung zwischen Scheiben (`kosten umbuchen` endet immer mit Exit 2).

| Scheibe | Ledger-ID | CLI-Lauf-ID | Modell | Basis (hart) | `kosten vorab … --usd <Basis>` | Exit | reserviert (UTC) |
|---|---|---|---|---|---|---|---|
| `probe-` | `probe-sonnet-komuna` | `kontrolle-probe-sonnet-komuna` | `openrouter/anthropic/claude-sonnet-5.5` | 4,00 $ | `--max-tokens 1666000` (⌊4,00 ÷ 2,40 × 10⁶⌋ = 1 666 666) | 0 | 2026-11-12T18:32:19Z, 4,00 $ |
| `vergleich-` | `vergleich-ministral-komuna` | `vergleich-ministral-komuna` | `ministral-14b-2512` | 0,25 $ | `--max-tokens 1250000` | 0 | 2026-11-12T18:32:19Z, 0,25 $ |
| `marke-` | `marke-sonnet-ekzemplo` | `kontrolle-marke-sonnet-ekzemplo` | `openrouter/anthropic/claude-sonnet-5.5` | 3,60 $ | `--max-tokens 1500000` | 0 | 2026-11-12T18:32:19Z, 3,60 $ |
| `wdh-` | `wdh-vergleich-ministral-komuna` (nur bei Bedarf) | gleich | `ministral-14b-2512` | 0,15 $ | `--max-tokens 750000` | 0 | nicht reserviert (erst wenn M-2 gestört ist) |
| **Summe** | | | | **8,00 $** | | | |

`$W/kosten stand` nach dem Reservieren (2026-11-12T18:32Z):

```text
Ledger Spec 050 (~/n8n-compose/20260918_fundamento-ds/.fundamento/spec050/kostoj.tsv): 0.000000 $ von 8.00 $ gebucht, Rest 8.000000 $
  Scheibe         Basis   gebucht      Rest  offen  Modell
  probe-       4.000000  0.000000  4.000000      1  openrouter/anthropic/claude-sonnet-5.5 (hart, Tokens × 2 $/10 $)
  vergleich-   0.250000  0.000000  0.250000      1  ministral-14b-2512
  marke-       3.600000  0.000000  3.600000      1  openrouter/anthropic/claude-sonnet-5.5 (hart, Tokens × 2 $/10 $)
  wdh-         0.150000  0.000000  0.150000      0  ministral-14b-2512
  offene Reservierungen: probe-sonnet-komuna 4.000000 $ (CLI-Lauf-ID kontrolle-probe-sonnet-komuna), vergleich-ministral-komuna 0.250000 $ (CLI-Lauf-ID vergleich-ministral-komuna), marke-sonnet-ekzemplo 3.600000 $ (CLI-Lauf-ID kontrolle-marke-sonnet-ekzemplo)
  keine Umbuchung zwischen Scheiben (Spec 050)
```

**Stand: 0,00 $ von 8,00 $ gebucht.**

## Befehle M-1 bis M-3 (fest, D-050-1 bis D-050-3)

Vor jedem Lauf: `git -C $R status --porcelain` leer, `git -C $R rev-parse HEAD` = Messkopf, `git -C $R diff de931e40..HEAD -- packages` leer, `uptime` notieren, `$W/gardisto stand` zeigt „frei“, `$W/kosten vorab <id> --usd <Basis>`. Die Reservierungen stehen schon (nicht neu reservieren). Dann `mezuri` **im Hintergrund**, Abfrage höchstens alle 5 Minuten. Exit 5 (Sperre belegt) heißt warten (`until grep -q '^frei ' $S/sperre.stato; do sleep 30; done` im Hintergrund) und `mezuri` erneut aufrufen.

```sh
W=/tmp/s050-werkzeug; M=/Users/thorstenjankowski/n8n-compose/20260918_fundamento-ds; S=$M/.fundamento/spec050
R=/Users/thorstenjankowski/.purple-code/worktrees/fundamento-wt-mwdq37vxoxdotj5v/repos/fundamento

# M-1 (Ledger probe-sonnet-komuna, CLI-Lauf-ID kontrolle-probe-sonnet-komuna; Buchung aus dem neuen Laufordner unter $S/m1)
$W/mezuri probe-sonnet-komuna "M-1 Sonnet komuna" --cwd $R -- pnpm nordstelo --art ablauf \
  --taskoj anmelden-und-konto --varianten F,0 --ripetoj 1 --lauf-id kontrolle-probe-sonnet-komuna \
  --kontroll-modelo openrouter/anthropic/claude-sonnet-5.5 --max-tokens 1666000 --out $S/m1 --ledger $S --env $M/.env

# M-2 (Ledger und CLI-Lauf-ID vergleich-ministral-komuna; ohne Modellflag, die .env setzt mistral/ministral-14b-2512)
$W/mezuri vergleich-ministral-komuna "M-2 ministral komuna" --cwd $R -- pnpm nordstelo --art ablauf \
  --taskoj anmelden-und-konto --varianten F,0 --ripetoj 1 --lauf-id vergleich-ministral-komuna \
  --max-tokens 1250000 --out $S/m2 --ledger $S --env $M/.env

# M-3 (Ledger marke-sonnet-ekzemplo, CLI-Lauf-ID kontrolle-marke-sonnet-ekzemplo; Satz = celo von anmelden-und-konto)
$W/mezuri marke-sonnet-ekzemplo "M-3 Sonnet ekzemplo" --cwd $R --raporto $S/m3/raporto.json -- \
  pnpm fm ekranoj "Mitglieder von Team Nord melden sich an, legen ein Konto an, setzen ein vergessenes Passwort zurück und sehen ihr Konto 4711." \
  --ekranoj anmelden,registrieren,passwort-vergessen,konto \
  --config packages/modelo/test/fixtures/valid/aspekto-ekzemplo/fundamento.config.json \
  --lauf-id kontrolle-marke-sonnet-ekzemplo --kontroll-modelo openrouter/anthropic/claude-sonnet-5.5 \
  --max-tokens 1500000 --ja --env $M/.env --ledger $S --out $S/m3

# Nur wenn M-2 gestört ist (MVP-2.2): einmal reservieren, dann derselbe Befehl wie M-2 mit
#   Ledger- und CLI-Lauf-ID wdh-vergleich-ministral-komuna, --max-tokens 750000, --out $S/wdh-m2
$W/kosten reservieren wdh-vergleich-ministral-komuna --zweck "M-2 Ersatz (gestört)" --usd 0.15
```

## Werkzeuge

`$W` = `/tmp/s050-werkzeug` → `$S/werkzeug`, Logs `/tmp/s050-logs` → `$S/logs` (dauerhaft in `$S`, R-5). Kopie von `$W38` (Stand S038-31, `cp -Rp` am 2026-11-12 ≈ 18:22Z, Rechte von `listen/` 700/600 erhalten), umgestellt nach §2.2 der Implementierungs-Spec. `$W/README.md` beschreibt Spec 050, die Unterschiede zu Spec 038, die Befehle und den Abschnitt „Nach einem Neustart“.

**Umgestellt:**

- **Eigener Stand nur `$R`** (`lib.mjs` `R_050`, `sperre.mjs` `REPO_050`, auch Plan-Repo des Wächters). Worktrees von Spec 038 (Lauf 3, 4, 5), `/tmp/s038-bezug` und `/tmp/s038-bezug-prim` sind fremd (`mezuri --cwd` dort → Exit 2).
- **Pfade:** Ledger direkt in `$S` (kein `lauf5/`, kein `umbuchungen.tsv`, kein Ledger Lauf 1–4), Sperre `$S/sperre.{stato,tsv,ablehnung}`, `$S/gardisto.pid`, `$S/mezuri.aktiv/`, Logs `/tmp/s050-logs`. Kein Pfad zeigt zum Schreiben nach `$M/.fundamento/spec038` (Selbsttest Teil 1).
- **Plan-Marker:** ohne `specs/050-mvp-probelauf/**` (D-050-11; eine andere Spec mit Nummer 050 zählt); Refs mit `spec-050`/`s050` im Namen ausgenommen. `specs/038-*` zählt jetzt wie jede andere Spec.
- **Eigene Werkzeuge:** `s050-werkzeug`, `spec050/werkzeug`. `mezuri` und `bildigi-fragmentojn` von Spec 038 sind fremd; der Wächter von Spec 038 ist kein Messprozess.
- **Ledger `LEDGER_050`:** Kappe 8,00 $; `probe-` 4,00 und `marke-` 3,60 (hart, nur `openrouter/anthropic/claude-sonnet-5.5`, gebucht immer Tokens × 2 $ / 10 $ je 10⁶, auch wenn ein Betrag mitgegeben wird; OpenRouter-Gegenprobe `GET /api/v1/key` vorher und nachher, nur lesend); `vergleich-` 0,25 und `wdh-` 0,15 (nur `ministral-14b-2512`, 0,20 $ je 10⁶). Unbekanntes Präfix (auch `kontrolle-`, `abnahme-`, `nachher-`, `vorher-`, `teil1-`) → Exit 2 in `kosten` und `mezuri`. `kosten umbuchen` → immer Exit 2, schreibt nichts. `reservieren` nur mit `--usd`.
- **`kosten vorab`** (D-050-9): druckt `--max-tokens` 1 666 000 / 1 250 000 / 1 500 000 / 750 000 für die Basis der Scheiben.
- **Lauf-ID-Prüfung in `mezuri`** (D-050-2), vor dem Start:

  ```text
  probe-*/marke-*      → --lauf-id kontrolle-<ledger-id> UND --kontroll-modelo openrouter/anthropic/claude-sonnet-5.5
  vergleich-*/wdh-*    → kein --kontroll-modelo; ein --lauf-id muss = <ledger-id> sein
  sonst                → Exit 2 vor dem Start
  ```

- **Buchung und „gestört“** wie Spec 038: aus `--raporto` (ekranoj-Form) oder aus dem neu angelegten Laufordner von `nordstelo --art ablauf --out <o>` (`sumo.tokenoj.{enigo,eligo}`, `lauf.kiModelo`, `lauf.commit`). Gestört laut Werkzeug = fremde Messung oder Last(1 min) vor/nach > Kerne; Anbieterfehler, 429-Abbruch und Exit ≠ 0 ohne Tokengrenze liest MVP-2.x aus dem Lauf.
- **`audit-ac4`:** Diff ohne `specs/050-mvp-probelauf/**`. `pruefen`, `commit`, `filtern` unverändert (Wortlisten `$W/listen/` aus der Kopie, Rechte 600; `listen-erzeugen` mit `$R` als Quelle erzeugt dieselben Listen).

**Selbsttests (2026-11-12; erster Lauf vor dem Start des Wächters, letzter Lauf nach D-050-11 um ≈ 18:48Z):**

| Test | Ergebnis | neu gegenüber Spec 038 | Log |
|---|---|---|---|
| `selbsttest` | **322 OK, 0 Fehler** | Präfixe (10 unbekannte IDs × `reservieren`/`vorab`/`scheibe`/`buchen`), Scheiben 4,00/0,25/3,60/0,15 = Kappe 8,00, Modelle je Scheibe, `vorab` 1 666 000 / 1 250 000 / 1 500 000 / 750 000, Sonnet-Buchung aus Tokens (0,700000 $ statt `--usd 0.01`; 304 170/7 901 → 0,68735 $ wie das 038-Ledger), `umbuchen` → 2 ohne Schreiben, Lauf-ID-Zuordnung (19 Fälle), eigene Stände (nur `$R`), Klassen (038-Wächter kein Treffer, 038-`mezuri`/`bildigi` fremd), `audit-ac4` ohne `specs/050-*`, SHA-256 von Ledger 050 und 26 Dateien von Spec 038 vorher = nachher | `$S/logs/mvp-1.1-selbsttest.log` |
| `gardisto-selbsttest` | **94 OK, 0 Fehler** (56 s; erster Lauf 92/92 vor D-050-11) | Plan-Marker einer anderen Spec mit Nummer 050 zählt (D-050-11); Probe-Prozesse „Wächter von Spec 038“ (kein Treffer, Sperre bleibt frei) und „mezuri von Spec 038“ (Treffer `mezuri-fremd`); Plan-Marker in `specs/050-*` zählt nicht, in `specs/038-*` schon; `marke-` (ekranoj-Form) und `probe-` (Ablauf-Form) gebucht aus Tokens mit Gegenprobe gegen einen lokalen Probe-Server (Δ im Log, Bearer aus der `--env`-Datei, Schlüssel nie in Log/Ledger/Ausgabe); `vergleich-` ohne Gegenprobe; Scheibe `marke-` überschritten → WARNUNG; `probe-` mit ministral im Bericht → Exit 4; Lauf-ID-Ablehnungen vor dem Start; echter 038-Wächter PID 28582 kein Treffer; SHA-256 von Ledger 050 und Spec 038 vorher = nachher | `$S/logs/mvp-1.1-gardisto-selbsttest-final.log` (erster Lauf `mvp-1.1-gardisto-selbsttest.log`) |

**Spec 038 unverändert:** SHA-256 aller 17 Dateien in `$W38` und der Ledger von Spec 038 (`kostoj.tsv`, `laeufe.tsv`, `pruefprotokoll.tsv`, `anfragoj.json`, `identitaet`, `lauf5/*`) vor MVP-1.1 = nach MVP-1.1 (Abschnitt „Prüfungen am Ende von MVP-1.1“). Ausgenommen sind nur `sperre.stato`, `sperre.tsv` und `logs/gardisto.log` von Spec 038: die schreibt der laufende 038-Wächter selbst.

## Wächter (D-050-7)

`$W/gardisto start` am **2026-11-12T18:31:54Z**: PID 83766, eigen = `$R`, Plan-Repo `$R` (kein fetch). Nach D-050-11 mit `gardisto stopp`/`start` neu gestartet am **2026-11-12T18:49:01Z**: PID **7790** (nur der Wächter von Spec 050; der von Spec 038 lief unberührt weiter). Danach `$W/gardisto einmal`: **kein Treffer durch den Wächter von Spec 038** (PID 28582 läuft weiter, Klasse „kein Messprozess“); 0 eigene Messprozesse; 0 Plan-Treffer. Gesehen wurden dagegen fremde Messprozesse: `playwright test test/zweitfarbe-036.spec.ts --workers 2 --repeat-each=30` samt Browsern im Worktree `fundamento-wt-mwdq3cluiyydrirx` (F-050-2). Die Sperre bleibt deshalb „belegt“, bis 300 s ohne Treffer vergangen sind. **Bis zum Ende von MVP-1.1 (≈ 18:55Z) wurde sie nicht „frei“**: die fremden Wiederholungen liefen weiter (letzte Prüfung 18:55:09Z: 14 fremde Prozesse, Last 12,43 / 17,27 / 17,02). Dass der Wächter nach 300 s ohne Treffer „frei“ meldet, belegt `gardisto-selbsttest` Teil 2 und 3 mit Probe-Prozessen. MVP-2.1 startet M-1 erst, wenn `gardisto stand` „frei“ zeigt (Warteschleife im Hintergrund, kein Eingriff in die fremden Läufe).

## Export und Gegenprobe (MVP-1.2, D-050-4)

Stand 2026-11-12 ≈ 19:05Z, 0 $ (kein Modell, kein Netz, kein Browser). Gebaut und geprobt **vor** dem ersten bezahlten Lauf. Gelesen wurde der Quelltext auf `de931e40` (`packages/ekranoj/src/{verda,rondoj,instancoj,navigado,eligo,tipoj}.ts`, `packages/nordstelo/src/ablauf/{kuro,raporto,poentoj,cli-ablauf}.ts`, `packages/nordstelo/src/gvidanto.ts`, `packages/cli/src/commands/ekranoj.ts`). Gerechnet wird mit dem gebauten Code des Messkopfs (`packages/*/dist`, Deep-Imports, kein Paket geändert).

**Werkzeuge:**

| Datei | Ort | Aufgabe |
|---|---|---|
| `exportieren.mjs` | `$W` (nie im Repo) | `node $W/exportieren.mjs <laufordner> <zelle> <ziel> [--tasko <slug>] [--repo <dir>]` schreibt `<ziel>/<zelle>/raporto.json` (unverändert kopiert) und je Variante und Screen `<ziel>/<zelle>/<F\|0>/<slug>/{fakto.json,fragmento.html}` (Form `DatenFakto`, §2.3 der Implementierungs-Spec). Erkennt die Form selbst: `fm ekranoj`-Laufordner (`raporto.json` mit `rondoj`) oder nordstelo-Messung (`lauf.json` im Ordner oder genau ein Laufordner darunter, also auch `--out $S/m1`). Druckt je Screen gespeichert / nachgerechnet / `malhelpoj` und am Ende die Zahl der Abweichungen. Exit 0 geschrieben (auch mit Abweichungen, die zählt `pruefen.mjs`) · 1 Lese-/Ableitungsfehler · 2 Aufruf (auch: Ziel existiert, Ziel in Spec 038, Ziel im Laufordner, mehrere Abläufe ohne `--tasko`). |
| `pruefen.mjs` | Entwurf `$S/entwurf/specs/050-mvp-probelauf/`, ab MVP-3.1 `specs/050-mvp-probelauf/` | `node specs/050-mvp-probelauf/pruefen.mjs` rechnet je `daten/<zelle>/<F\|0>/<slug>/fakto.json` grün ⇔ `decidiVerdon(enigo).verda && zusatz.length === 0` nach (`enigo === null` = „nicht gebaut“), vergleicht mit `gespeichert.verda`, `verdaEkde`/`runde` und dem Block in `bericht.md`. Druckt je Zelle, Variante und Screen grün / nein / nicht gebaut, Runde, `malhelpoj` (Zusatz zuerst). `decidiVerdon` aus `packages/ekranoj/dist/index.js`, Repo-Wurzel zwei Ebenen über dem Skript; `--repo <dir>` oder `PRUEFEN_REPO` für den Entwurf, `--daten`/`--bericht` für Proben, `--ohne-bericht` nur für Proben, `--abschnitt` druckt den Block für `bericht.md`. Exit 0 stimmig · 1 Abweichung · 2 Aufruf, Build fehlt, Datei fehlt oder passt nicht zu `DatenFakto`. |

**Ableitung der Ablauf-Form (M-1, M-2)** – derselbe Weg wie `kontroliRondon` in `rondoj.ts`:

1. Gespeichert: `kuro.json` → `stato[n][slug]`. Bewertete Runde (D-050-13): grün → `verdaEkde` (bzw. die letzte Runde ohne `verdaEkde`), sonst die letzte Runde, in der der Screen in `stato` steht; nie geprüft → `runde`/`enigo` `null`. Ein nicht gestarteter Lauf (`nekomencita`) oder ein Fehlerlauf hat `stato {}` → alle Screens „nicht gebaut“ (Plan dann aus `planoDe` des Katalogs).
2. Taksado: `taksiloPorMezuro({ modelo, katalogo, tasko })` (`packages/nordstelo/dist/ablauf/raporto.js`) auf `rondoj/<n>/<slug>.fakto.json`, Modelo `loadModelo(defaultModeloSource())`, Katalog `legiKatalogon()` – wie `cli-ablauf.ts`.
3. Gvidanto (nur F, D-050-14): `connectGvidanto()` aus `packages/nordstelo/dist/gvidanto.js` (derselbe MCP-Server im Prozess wie `realaPreparo`, In-Memory-Transport, kein Netz), dann `uzKontroliloDe(bridge, await bridge.list())` aus ekranoj: auf dem Messkopf `check_markup` (sonst automatisch `check_usage`). `malobservoj` = `kontrolilo.kontroli({ fakto, fragmento })` mit dem Fragment `rondoj/<n>/<slug>.html`; ein Fehler des Prüfers wird wie im Lauf zu `check-usage-unavailable` (error).
4. Navigation: `navigado(plano, faktoj der Runde n, …)` über **alle** Fakten der Runde (getragene grüne Screens eingeschlossen). F: `ligilaAtributoj` aus `kontrolilo.ligilajAtributoj(faktoj)`; 0: ohne Option (Rückfall `fm-ligilo → to`), wie im Lauf (0 hat keinen Prüfer).
5. `zusatz` (D-050-15) aus `kuro.json` der Runde n: `leere-seite` ⇔ Eintrag in `malplenajPagxoj` mit `restis: true`; `anbieterfehler` ⇔ Eintrag in `anbieterfehleroj` mit `ago` `portita`/`rezigno` und kein `malplenajPagxoj`-Eintrag dieser Screen-Runde; `leere-antwort` ⇔ `rondoj/<n>/<slug>.respondo.txt` beginnt mit `--- Antwort ---` (`respondoTeksto` ohne `kialo`).
6. Zweitprüfung: K1–K6, `total`, K8-Quote und `kompleta` gegen das `raporto.json` der Messung (geschrieben mit dem Code des Laufs), Ausgabe `BEW …` je Abweichung.

**Ableitung der ekranoj-Form (M-3, D-050-16):** `raporto.json` → `rondoj[n].ekranoj[slug]` hält die Eingabe schon: `taksado` = `{ k, total, mankoj, k8: { kvoto, plena } }`, `malobservoj`, `kompleta` = `navigado.kompleta`, Fakten aus `rondoj/<n>/<slug>.fakto.json` (fehlen sie, die `axe`-Felder des Berichts als Renders). Keine Neubewertung. `zusatz` = gespeicherte `malhelpoj` ∩ {`leere-seite`, `anbieterfehler`, `leere-antwort`}. Der Export vergleicht `zusatz + decidiVerdon(…).malhelpoj` mit den gespeicherten `malhelpoj` (Ausgabe `HINW …` bei Unterschied).

**Proben** (Log `$S/logs/mvp-1.2-proben.log`; Daten `$S/proben/mvp-1.2/probe{1,2}/daten`, Probe-Bericht `$S/proben/mvp-1.2/probe1/bericht.md`; `PRUEFEN_REPO=$R`):

| Probe | Befehl (gekürzt) | Ergebnis | Exit |
|---|---|---|---|
| 1 ekranoj-Form | `exportieren.mjs $M/.fundamento/spec038/kontrolle-l5/komuna k038-komuna $P/probe1/daten` | 2 Screens, gebaut 2, **grün 2/2** (`liste` Runde 1, `detail` Runde 2 = `verdaEkde 2`), Abweichungen zu gespeichert 0, gespeicherte `malhelpoj` = nachgerechnet (kein `HINW`) | 0 |
| 1 `pruefen.mjs` | `pruefen.mjs --daten $P/probe1/daten --bericht $P/probe1/bericht.md` | `k038-komuna F 2/2 detail,liste`, Abweichungen 0, Struktur 0, `bericht.md` stimmt | **0** |
| 2 Ablauf-Form | `exportieren.mjs $M/.fundamento/spec038/ablauf/nachher a038-nachher … --tasko anmelden-und-konto` (Laufordner `20261107-1146`, Commit `bfe19023`, F und 0) | 8 Screens, gebaut 8, grün 0, Abweichungen zu `stato.verda` **0**, Bewertung ≠ `raporto.json` **0**; Prüfweg `check_markup`; F: alle 4 nur `K8`; 0: `K5,K8` (+ `navigado` bei `anmelden`, + `axe-hela,axe-malhela` bei `registrieren`) | 0 |
| 2 zusätzlich | dasselbe für `ablauf/vorher-F` (`20261107-1245`, nur F, Halt an der Tokengrenze in Runde 2) und `ablauf/vorher-0` (`20261107-1221`, nur 0) | vorher-F: 4 Screens, grün 2 (`registrieren`, `passwort-vergessen`, Runde 1), `anmelden`/`konto` nur `navigado`; vorher-0: grün 0, alle `K5` (+ `navigado` bei `anmelden`). Abweichungen zu `stato.verda` 0, Bewertung ≠ `raporto.json` 0 | 0 |
| 2 `pruefen.mjs` | `pruefen.mjs --daten $P/probe2/daten --ohne-bericht` | 16 Screens, 4 Zelle×Variante, Abweichungen 0, Struktur 0 | 0 |
| Negativ | Kopie von `probe1/daten` nach `/tmp/s050-negativ.*`, in `k038-komuna/F/detail/fakto.json` `enigo.taksado.k.K5 = 0`, dann `pruefen.mjs --daten <kopie> --bericht $P/probe1/bericht.md` | `ABWEICHUNG … detail nein … K5 · recomputed not green, stored green` und `bericht.md 2/2 detail,liste, data 1/2 liste`; Abweichungen 2 | **1** |
| Negativ, weitere | Kopien mit `zusatz: ["leere-seite"]`, mit `gespeichert.verda = false` bei grünem Screen, ohne Feld `gespeichert`; falscher Block `k038-komuna F 1/2 liste` in einem Probe-Bericht | Exit 1 / 1 / 2 / 1 | ≠ 0 |
| Synthetisch | Kopie von vorher-F in `/tmp` mit erfundenem `anbieterfehleroj`-, `malplenajPagxoj`-Eintrag, einer `respondo.txt` ohne Markup und einem nicht gestarteten Lauf 0 | `zusatz` `anbieterfehler`, `leere-seite`, `leere-antwort` erkannt; 0 als 4 × „nicht gebaut“; die erfundenen grünen Stände als 2 Abweichungen gemeldet | Export 0, `pruefen` 1 |

Alle Kopien (`/tmp/s050-negativ.*`, `/tmp/s050-synth.*`) sind gelöscht. Spec 038: SHA-256 der 361 gelesenen Dateien (`kontrolle-l5/`, `ablauf/nachher/20261107-1146/`, `ablauf/vorher-F/`, `ablauf/vorher-0/`) vorher = nachher (`$S/logs/mvp-1.2-s038-quellen-{vorher,nachher}.sha256`); der Wächter von Spec 038 (PID 28582) läuft unberührt. `git -C $R status --porcelain` leer, `HEAD` = Messkopf, `diff de931e40..HEAD -- packages` leer. `$W/pruefen --datei` über `exportieren.mjs`, `pruefen.mjs`, Probe-Log und Probe-Bericht: sauber.

**Befehle für MVP-2.x (nach jedem Lauf, nur Lesen, keine Bilder):**

```sh
W=/tmp/s050-werkzeug; M=/Users/thorstenjankowski/n8n-compose/20260918_fundamento-ds; S=$M/.fundamento/spec050
R=/Users/thorstenjankowski/.purple-code/worktrees/fundamento-wt-mwdq37vxoxdotj5v/repos/fundamento
E=$S/entwurf/specs/050-mvp-probelauf; export PRUEFEN_REPO=$R
node $W/exportieren.mjs $S/m1 m1 $E/daten        # M-1 (Ablauf-Form, ein Laufordner unter $S/m1, Ablauf aus lauf.json)
node $W/exportieren.mjs $S/m2 m2 $E/daten        # M-2 (bzw. $S/wdh-m2 wdh-m2)
node $W/exportieren.mjs $S/m3 m3 $E/daten        # M-3 (ekranoj-Form)
node $E/pruefen.mjs --ohne-bericht               # bis bericht.md steht; Exit 1 = Abweichung → Befund F-050-n („unklar“, R-3), keine stille Korrektur
node $E/pruefen.mjs --abschnitt                  # Block ```pruefen für bericht.md
```

**MVP-3.1:** Nach dem Kopieren des Entwurfs ins Repo den Export neu nach `$R/specs/050-mvp-probelauf/daten` schreiben (oder `$E/daten` mitkopieren), den Block von `--abschnitt` in `bericht.md` einsetzen, dann `node specs/050-mvp-probelauf/pruefen.mjs` **ohne** Flags aus `$R` → Exit 0 (AK-5). Ein Export bricht nicht ab, wenn er nachgerechnet etwas anderes findet als gespeichert; ein abgebrochener Export lässt einen Teilordner zurück, der vor dem nächsten Aufruf zu löschen ist (der Export überschreibt nie).

## Läufe und Kosten

Je Lauf Befehl, Commit, `--max-tokens`, Exit, Dauer, Tokens ein/aus, Anfragen, Werkzeugaufrufe, Betrag, Last vor/nach, 429-Wartezeilen, gestört ja/nein, OpenRouter-Δ, danach `kosten stand`. Gelaufen sind M-1 und M-2 je einmal; M-3 entfällt (D-050-23). Beide Läufe sind gestört (D-050-19, D-050-22).

### M-1 `probe-sonnet-komuna` (MVP-2.1, zweiter Versuch) – **gestört**

Gewartet ab 2026-11-12T22:17Z (Frist 12 h, bis 2026-11-13T10:17Z) mit drei Wartern im Hintergrund (je ≤ 115 min, Bedingung: `sperre.stato` beginnt mit „frei“ **und** Last(1 min) ≤ 10). Start automatisch, sobald beides galt. Vor dem Start erneut AK-2 und `kosten vorab` (Log `$S/logs/mvp-2.1-start.log`).

| Feld | Wert |
|---|---|
| Befehl | genau M-1 aus „Befehle M-1 bis M-3“: `$W/mezuri probe-sonnet-komuna "M-1 Sonnet komuna" --cwd $R -- pnpm nordstelo --art ablauf --taskoj anmelden-und-konto --varianten F,0 --ripetoj 1 --lauf-id kontrolle-probe-sonnet-komuna --kontroll-modelo openrouter/anthropic/claude-sonnet-5.5 --max-tokens 1666000 --out $S/m1 --ledger $S --env $M/.env` |
| Vorprüfung 02:42:56Z | `git status --porcelain` leer, HEAD `de931e40caa87884216375c7c3897e5148cbd333`, `diff de931e40..HEAD -- packages` 0 Byte; `uptime` 3,59 / 6,52 / 13,58; `gardisto stand` „frei seit 02:42:49Z“, Prozesse 0, Plan 0, Wächter PID 7790 läuft |
| `kosten vorab probe-sonnet-komuna --usd 4.00` | Exit 0, `--max-tokens 1666000` (wie erwartet) |
| Laufordner | `$S/m1/20261113-0243` (`lauf.json`, `raporto.json`, `raporto.md`, `anmelden-und-konto/{F,0}/1/…`) |
| Start / Ende | 2026-11-13T02:42:57Z / 02:51:45Z, Dauer 528,7 s |
| Commit | `de931e40` (`lauf.json`, `laeufe.tsv`, `kostoj.tsv`) |
| `--max-tokens` | 1 666 000 (eine Grenze für den ganzen Lauf; 0 bekam den Rest 119 556) |
| Exit | 0 (`mezuri` und `nordstelo`) |
| Halt | **Tokengrenze in 0** (`haltigo: max-tokens`): „Kostengrenze von 119556 Tokens erreicht (verbraucht: 83652) in Runde 3 bei konto; Teilergebnis.“ F lief alle 3 Runden. Kein Stopp (Teilergebnis). |
| Tokens ein / aus | 1 569 626 / 60 470 (Summe 1 630 096); F 1 508 026 / 38 418, 0 61 600 / 22 052 |
| Anfragen | 68 (F 57, 0 11) |
| Werkzeugaufrufe | 86 (alle in F; 0 hat keinen Gvidanto) |
| Betrag gebucht | **3,743952 $** (1 569 626 × 2 $ + 60 470 × 10 $ je 10⁶), ≤ Scheibe 4,00 $, keine WARNUNG |
| OpenRouter-Gegenprobe | vorher 30,756841 $, nachher 34,406969 $, **Δ 3,650128 $** (Δ umfasst jede gleichzeitige Nutzung des Schlüssels) |
| Last vor / nach (`mezuri`) | 3,59 6,52 13,58 / 9,30 8,03 10,88 bei 10 Kernen |
| Last(1 min) **während** des Laufs (Wächter-Spur `$S/sperre.tsv`, 44 Proben alle 12 s) | 2,47 bis **11,31**; **9 Proben > 10** (02:46:01Z 11,09; 02:49:49Z 11,08; 02:50:01Z 11,06; 02:50:13Z 10,26; 02:50:25Z 10,59; 02:50:37Z 11,31; 02:50:49Z 11,20; 02:51:01Z 10,22; 02:51:37Z 10,36) |
| Fremde Messung während | ja: ab 02:44:25Z Playwright-Läufe und Browser (Chromium, Firefox, WebKit) mit cwd `/tmp/s050/t3`, ab 02:49:25Z dazu im Worktree `fundamento-wt-mwdq3cluiyydrirx` (`packages/eroj`); 12 der 44 Wächter-Proben mit Treffern (2 bis 14 Prozesse). Nicht eingegriffen. |
| 429-Wartezeilen | 0 |
| Anbieterfehler | keine (`anbieterfehleroj`, `malplenajPagxoj` leer in F und 0; `eraro` null) |
| **gestört** | **ja** – nach technischer Spec §4 wegen Last(1 min) > 10 während des Laufs; das Werkzeug (`laeufe.tsv`) zusätzlich wegen fremder Messung (`playwright-test`, `playwright-browser`). Nicht wiederholt (MVP-2.1: kein zweiter Lauf). |
| Schlüssel-Scan (technische Spec §6) | `mezuri-probe-sonnet-komuna.log`, `mvp-2.1-start.log`, `mvp-2.1-warten-2.log`: sauber |
| Log | `/tmp/s050-logs/mezuri-probe-sonnet-komuna.log` (= `$S/logs/…`), 198 Zeilen |

`$W/kosten stand` nach M-1 (2026-11-13T02:5xZ):

```text
Ledger Spec 050 (~/n8n-compose/20260918_fundamento-ds/.fundamento/spec050/kostoj.tsv): 3.743952 $ von 8.00 $ gebucht, Rest 4.256048 $
  Scheibe         Basis   gebucht      Rest  offen  Modell
  probe-       4.000000  3.743952  0.256048      0  openrouter/anthropic/claude-sonnet-5.5 (hart, Tokens × 2 $/10 $)
  vergleich-   0.250000  0.000000  0.250000      1  ministral-14b-2512
  marke-       3.600000  0.000000  3.600000      1  openrouter/anthropic/claude-sonnet-5.5 (hart, Tokens × 2 $/10 $)
  wdh-         0.150000  0.000000  0.150000      0  ministral-14b-2512
  offene Reservierungen: vergleich-ministral-komuna 0.250000 $ (CLI-Lauf-ID vergleich-ministral-komuna), marke-sonnet-ekzemplo 3.600000 $ (CLI-Lauf-ID kontrolle-marke-sonnet-ekzemplo)
  keine Umbuchung zwischen Scheiben (Spec 050)
```

**Stand: 3,74 $ von 8,00 $ gebucht.**

### M-2 `vergleich-ministral-komuna` (MVP-2.2) – **gestört** (D-050-22)

| Feld | Wert |
|---|---|
| Befehl | genau M-2 aus „Befehle M-1 bis M-3“ (ohne Modellflag, D-050-1): `$W/mezuri vergleich-ministral-komuna "M-2 ministral komuna" --cwd $R -- pnpm nordstelo --art ablauf --taskoj anmelden-und-konto --varianten F,0 --ripetoj 1 --lauf-id vergleich-ministral-komuna --max-tokens 1250000 --out $S/m2 --ledger $S --env $M/.env` |
| Vorprüfung 08:20:40Z | `git status --porcelain` leer, HEAD `de931e40caa87884216375c7c3897e5148cbd333`, `diff de931e40..HEAD -- packages` 0 Byte; `uptime` 8,80 / 16,38 / 23,87; `gardisto stand` „frei seit 08:18:31Z“, Prozesse 0, Plan 0 (Log `$S/logs/mvp-2.2-start.log`) |
| `kosten vorab vergleich-ministral-komuna --usd 0.25` | Exit 0, `--max-tokens 1250000` |
| Laufordner | `$S/m2/20261113-0820` (`lauf.json`, `raporto.json`, `raporto.md`, `anmelden-und-konto/{F,0}/1/…`) |
| Start / Ende | 2026-11-13T08:20:40Z / 09:07:49Z, Dauer 2 828,9 s |
| Commit | `de931e40` (`lauf.json`, `laeufe.tsv`, `kostoj.tsv`); Modell `mistral/ministral-14b-2512` |
| `--max-tokens` | 1 250 000 (eine Grenze für den ganzen Lauf) |
| Exit | 0 (`mezuri` und `nordstelo`) |
| Halt | **Tokengrenze vor 0**: F lief alle 3 Runden und verbrauchte 1 247 299 Tokens; „anmelden-und-konto 0-1: nicht gestartet (Tokengrenze)“ (`haltigo: max-tokens`, `nekomencita`). Kein Stopp (R-1, Teilergebnis). |
| Tokens ein / aus | 1 232 523 / 14 776 (alle in F; 0 nicht gestartet) |
| Anfragen | 239 (alle in F) |
| Werkzeugaufrufe | 175 (F): `get_ero` 93, `get_sxablono` 28, `suggest_ero` 20, `check_usage` 14, `check_markup` 11, `list_arangxoj` 5, `list_eroj` 4 |
| Betrag gebucht | **0,249460 $** (1 247 299 × 0,20 $ je 10⁶), ≤ Scheibe 0,25 $, keine WARNUNG |
| OpenRouter-Gegenprobe | entfällt (ministral über die Mistral-API, Scheibe `vergleich-` ohne Gegenprobe) |
| Last vor / nach (`mezuri`) | 8,80 16,38 23,87 / 5,97 11,02 11,49 bei 10 Kernen (je Last(1 min) ≤ 10) |
| Last(1 min) **während** des Laufs (Wächter-Spur `$S/sperre.tsv`, 236 Proben alle 12 s) | 4,77 bis **43,37**; **61 Proben > 10**. Erste Häufung 08:37:07Z–08:37:55Z (5 Proben, max. 11,15 – die Zahl in D-050-22), weitere 08:41:43Z–08:43:43Z (bis 15,09), 08:48:43Z–08:50:07Z (bis 14,94), 08:59:32Z–09:02:44Z (bis 43,37), 09:03:20Z–09:06:08Z (bis 22,13) |
| Fremde Messung während | nein: 0 Wächter-Proben mit Treffern (D-050-20); die Last kam nicht von erkannten Messprozessen |
| 429-Wartezeilen | **175** Zeilen „Anbieter mistral: antwortet 429, neuer Versuch in n s“, Wartezeit zusammen **1 910 s**; dazu 2 Zeilen „keine Antwort in der Zeit“ (2 s und 64 s). Kein Abbruch; jede Anfrage kam durch. |
| Anbieterfehler | keine (`anbieterfehleroj`, `malplenajPagxoj` leer; `eraro` null). Einmal „Kurzprofil get_ero formularo übersprungen: keine lesbare Antwort“ (`anmelden` Runde 2). |
| **gestört** | **ja** – nach D-050-22 (Last(1 min) > 10 während des Laufs, technische Spec §4); `mezuri` buchte „gestört nein“, weil es die Last nur vorher und nachher prüft. Nicht wiederholt, kein `wdh-`. |
| Schlüssel-Scan (technische Spec §6) | `mezuri-vergleich-ministral-komuna.log`, `mvp-2.2-*.log`: sauber |
| Log | `/tmp/s050-logs/mezuri-vergleich-ministral-komuna.log` (387 Zeilen) |

### M-3 `marke-sonnet-ekzemplo` (MVP-2.3) – **entfällt** (D-050-23)

Kein Lauf, kein `kosten vorab`, kein Ordner `$S/m3`. Die Reservierung wurde am 2026-11-13T12:08:17Z mit einer Ledger-Zeile `freigegeben` geschlossen (D-050-25): `marke-sonnet-ekzemplo · M-3 entfällt (D-050-23): Reservierung 3,60 $ freigegeben, kein Lauf · freigegeben · 0`. Die gebuchten Zeilen von M-1 und M-2 sind unverändert. AK-8 siehe `bericht.md`, Abschnitt „Markenwechsel“.

`$W/kosten stand` nach M-2 und der Freigabe (2026-11-13T12:08Z, Log `$S/logs/mvp-2.3-kosten-stand.log`):

```text
Ledger Spec 050 (~/n8n-compose/20260918_fundamento-ds/.fundamento/spec050/kostoj.tsv): 3.993412 $ von 8.00 $ gebucht, Rest 4.006588 $
  Scheibe         Basis   gebucht      Rest  offen  Modell
  probe-       4.000000  3.743952  0.256048      0  openrouter/anthropic/claude-sonnet-5.5 (hart, Tokens × 2 $/10 $)
  vergleich-   0.250000  0.249460  0.000540      0  ministral-14b-2512
  marke-       3.600000  0.000000  3.600000      0  openrouter/anthropic/claude-sonnet-5.5 (hart, Tokens × 2 $/10 $)
  wdh-         0.150000  0.000000  0.150000      0  ministral-14b-2512
  keine Umbuchung zwischen Scheiben (Spec 050)
```

**Stand: 3,99 $ von 8,00 $ gebucht, keine offene Reservierung.** Jede Scheibe liegt unter ihrer Basis.

## Grün je Screen

### M-1 (Sonnet 5.5, komuna, `anmelden-und-konto`) – gestört (F-050-11)

Aus dem gespeicherten Ergebnis (`kuro.json` → `stato`), nachgerechnet mit `exportieren.mjs` und `pruefen.mjs` (unten). Bewertete Runde nach D-050-13.

| Variante | Screen | grün | Runde | `malhelpoj` | Total R3 | K8-Quote R3 |
|---|---|---|---|---|---|---|
| F | anmelden | nein | 3 | K8 | 100 | 0,9821 |
| F | registrieren | nein | 3 | K8 | 95,8 | 0,9821 |
| F | passwort-vergessen | nein | 3 | K8 | 100 | 0,975 |
| F | konto | nein | 3 | K8 | 100 | 0,9063 |
| 0 | anmelden | nein | 3 | axe-hela, axe-malhela, K5, K8 | 44,4 | 0,1354 |
| 0 | registrieren | nein | 3 | K5, K8 | 44,4 | 0,1875 |
| 0 | passwort-vergessen | nein | 3 | K5, K8 | 44,4 | 0,0834 |
| 0 | konto | nein | 3 (getragen aus Runde 2, F-050-12) | K5, navigado, K8 | 44,4 | 0,132 |

**Zielkennzahl M-1: F 0/4 grün, 0 0/4 grün** (nicht gebaut: keiner; 0 `konto` Runde 3 nicht neu gebaut, Stand von Runde 2 getragen). Kein Screen wurde in einer Runde grün (`verdaEkde` überall null). F: Runde 2 und 3 alle K1–K6 = 1 außer `registrieren` R3 K6 0,75; Navigation und Muster in R3 überall ja – einziger Grund für „nicht grün“ ist K8 (`plena` falsch), F-050-13.

**K8 je Marke** (`raporto.json` → `k8`, Mittel über die 4 Screens; hell = dunkel in jedem Wert, Kontrast Standard):

| Variante | Runde | komuna | ekzemplo | provo | provo-kompakta |
|---|---|---|---|---|---|
| F | 1 | 0,8718 | 0,8718 | 0,8217 | 0,8217 |
| F | 2 | 0,9727 | 0,9727 | 0,931 | 0,9366 |
| F | 3 | **0,9813** | **0,9813** | **0,9384** | **0,9447** |
| 0 | 1 | 0,1416 | 0,0776 | 0,0829 | 0,0829 |
| 0 | 2 | 0,2064 | 0 | 0,0942 | 0,0942 |
| 0 | 3 | **0,2188** | **0** | **0,1493** | **0,1702** |

Merkmal `interspacoj` darin (R3, F / 0): komuna 0,925 / 0,875 · ekzemplo 0,925 / 0 · provo 0,7535 / 0,5973 · provo-kompakta 0,7786 / 0,6806. In F ist `interspacoj` das **einzige** K8-Merkmal unter 1 (`ersatzschrift`, `nativaj`, `sxablono` = 1 in jeder Kombination); in 0 sind alle vier Merkmale unter 1.

**Seitenregel `k8-interspaco` je Screen** (zählt nicht; „mangels Mittel“, `senRimedajDe`: `interspacoj` < 1 **und** `interspacoj` in `k8.mankoj`), bewertete Runde:

| Variante | anmelden | registrieren | passwort-vergessen | konto |
|---|---|---|---|---|
| F | nein | nein | nein | nein |
| 0 | nein | nein | nein | nein |

`k8.mankoj` ist in allen 8 Screens leer: die Modelo hat seit Spec 046 Mittel für Abstände (`fm-stako`, `fm-vico`, `fm-kolumno` mit `interspaco`). Darum zählt ein Abstand außerhalb der Stufen jetzt in K8 und hält den Screen von grün ab (F-050-13). Abweichungen `interspacoj` je Screen in F (R3, hell = dunkel): anmelden provo 0,857, provo-kompakta 0,857 (zuerst `fm-sxelo > fm-stako`, 16 px) · registrieren provo 0,857, provo-kompakta 0,857 · passwort-vergessen provo 0,8, provo-kompakta 0,8 · konto komuna 0,7, ekzemplo 0,7, provo 0,5, provo-kompakta 0,6 (zuerst `fm-sxelo > fm-pagxo`).

**Export und Gegenprobe** (Logs `$S/logs/mvp-2.1-export.log`, `$S/logs/mvp-2.1-pruefen.log`):

- `node $W/exportieren.mjs $S/m1 m1 $E/daten` → Exit 0: Laufordner `20261113-0243`, Commit `de931e40`, Prüfweg `check_markup`; Screens 8, gebaut 8, grün nachgerechnet 0, **Abweichungen zu gespeichert 0**, **Bewertung ≠ `raporto.json` 0**.
- `PRUEFEN_REPO=$R node $E/pruefen.mjs --ohne-bericht` → **Exit 0**: `grün: m1 F 0/4 - · m1 0 0/4 -`; 8 Screens, 2 Zelle×Variante, Abweichungen 0, Struktur 0.
- `malobservoj` (F, `check_markup`): nur `label-names-action` (warning) bei `anmelden` und `konto`; kein Fehler. `zusatz` überall leer.

**`restantajLauxRegulo` der letzten Runde M-1** (`kuro.json`; Zahl = Treffer über Marke × Schema; `k8-interspaco` ist hier die Regel-ID jeder K8-Abweichung `interspacoj`, nicht die Seitenregel D-29): F anmelden `k8-interspaco` 4 · registrieren `criterion` 1, `k8-interspaco` 4 · passwort-vergessen `k8-interspaco` 4 · konto `k8-interspaco` 8. 0 anmelden `axe:target-size` 8, `k8-ersatzschrift` 8, `k8-interspaco` 8, `k8-nativa` 8, `k8-sxablono` 8, `rebuilt-ero` 5 · registrieren `k8-*` 8/2/8/8, `rebuilt-ero` 4 · passwort-vergessen `k8-*` 8/8/8/8, `rebuilt-ero` 4 · konto `k8-*` 8/6/8/8, `navigado-mankanta` 1, `rebuilt-ero` 1.

### M-2 (ministral-14b-2512, komuna, `anmelden-und-konto`) – gestört (D-050-22)

Aus dem gespeicherten Ergebnis (`kuro.json` → `stato`), nachgerechnet mit `exportieren.mjs` und `pruefen.mjs` (unten). Bewertete Runde nach D-050-13.

| Variante | Screen | grün | Runde | `malhelpoj` | Total R3 | K8-Quote R3 |
|---|---|---|---|---|---|---|
| F | anmelden | nein | 3 | K8 | 100 | 0,8819 |
| F | registrieren | nein | 3 | K8 | 95,8 | 0,8989 |
| F | passwort-vergessen | nein | 3 | axe-malhela, K8 | 91,7 | 0,6193 |
| F | konto | nein | 3 | check_usage, K8 | 94,4 | 0,8992 |
| 0 | alle 4 | nicht gebaut | – | nicht gebaut (Tokengrenze vor dem Start, F-050-15) | – | – |

**M-2: F 0/4 grün, 0 0/4 grün (4 nicht gebaut).** Kein Screen wurde in einer Runde grün. F R3: K1, K2, K5 = 1 überall; K3 konto 0,89; K4 passwort-vergessen 0,5; K6 registrieren und konto 0,75. Navigation in R3 überall vollständig (R1 0,67).

**K8 je Marke** (`raporto.json` → `k8`, Mittel über die 4 Screens; hell = dunkel):

| Variante | Runde | komuna | ekzemplo | provo | provo-kompakta |
|---|---|---|---|---|---|
| F | 1 | 0,9356 | 0,9356 | 0,8968 | 0,8968 |
| F | 2 | 0,9377 | 0,9377 | 0,9053 | 0,9053 |
| F | 3 | **0,8384** | **0,8384** | **0,8078** | **0,8147** |
| 0 | – | nicht gebaut | nicht gebaut | nicht gebaut | nicht gebaut |

Merkmal `interspacoj` darin (R3, F): komuna 0,7585 · ekzemplo 0,7585 · provo 0,6359 · provo-kompakta 0,6637. Anders als bei Sonnet sind in R3 auch `ersatzschrift` (alle 4 Screens, zuerst `fm-sxelo > fm-ligilo`) und bei passwort-vergessen `nativaj` (4 von 4 `fm-navigado > fm-vico > a` roh) unter 1.

**Seitenregel `k8-interspaco` je Screen** (zählt nicht; „mangels Mittel“): F nein auf allen 4 Screens (`k8.mankoj` leer); 0 nicht gebaut.

**`restantajLauxRegulo` der letzten Runde M-2** (F; 0 hat keine Runde): anmelden `k8-ersatzschrift` 8, `k8-interspaco` 8 · registrieren `criterion` 1, `k8-ersatzschrift` 8, `k8-interspaco` 8 · passwort-vergessen `axe:color-contrast` 4, `k8-ersatzschrift` 8, `k8-interspaco` 8, `k8-nativa` 8 · konto `criterion` 1, `k8-ersatzschrift` 8, `k8-interspaco` 8, `regulo` 1, `uzo-slot-nesting` 1.

**Export und Gegenprobe** (Logs `$S/logs/mvp-2.2-export.log`, `$S/logs/mvp-2.2-pruefen.log`):

- `node $W/exportieren.mjs $S/m2 m2 $E/daten` → Exit 0: Laufordner `20261113-0820`, Commit `de931e40`, Prüfweg `check_markup`; Screens 8, gebaut 4, grün nachgerechnet 0, **Abweichungen zu gespeichert 0**, **Bewertung ≠ `raporto.json` 0**.
- `PRUEFEN_REPO=$R node $E/pruefen.mjs --ohne-bericht` → **Exit 0**: `grün: m1 F 0/4 - · m1 0 0/4 - · m2 F 0/4 - · m2 0 0/4 -`; 16 Screens, 4 Zelle×Variante, Abweichungen 0, Struktur 0.
- `malobservoj` (F, `check_markup`, R3): konto `uzo-slot-nesting` (error, `fm-karto` mit `<fm-atributlisto slot="content">`) und zweimal `label-names-action` (warning); sonst keine.

### Muster von L5-1 bis L5-3 (M-1 und M-2, D-050-26)

Gesucht in allen Fragmenten `rondoj/<n>/<slug>.html` beider Läufe (F und 0, Runde 1 bis 3); Befunde je Runde über denselben Gvidanto-Pfad wie im Lauf (Logs `$S/logs/mvp-2.2-l5-fragmente.log`, `mvp-2.2-befunde-je-runde.log`).

| Lücke | Auslösendes Muster | geschrieben? | bemängelt? | Urteil |
|---|---|---|---|---|
| L5-1 | Kind mit ausdrücklich benanntem Standard-Slot der Eltern-Ero | **M-1: nein** (keine Runde, F und 0). **M-2 F: ja** – `konto` R2 und R3 `<fm-atributlisto slot="content">` in `fm-karto`; `anmelden` R3 `<a slot="items">` in `fm-navigado`; `passwort-vergessen` R3 `<fm-vico slot="items">` in `fm-navigado` | Kein Fehlbefund mehr für das ausdrücklich gesetzte Kind: `anmelden` R3 ohne Befund, `konto` R3 ohne `uzo-slot-accepts`. Es bleibt `uzo-slot-nesting` bei `konto` (Daten: `karto` `content` nimmt nur `text`/`teksto`, `nesting: 0` – ein echter Befund). Neu: **kein** Befund bei `passwort-vergessen`, obwohl `items` von `fm-navigado` nur Text annimmt (`nesting: 0`) – Folge von F-B3 aus Spec 046 (F-050-17). | **wirkt** (mit der Nebenwirkung F-050-17) |
| L5-2 | zwei „primäre“ Elemente nach der alten Regel (`fm-karto` mit Standard-`emphasis` oder `fm-butono emphasis="high"`) im selben Behälter | nein (M-1, M-2: höchstens eine `fm-karto` und ein `fm-butono` high je Behälter) | – | **nicht ausgelöst** |
| L5-3 | Kind, das nicht zu `accepts` des Slots passt | **M-2 F: ja** – `konto` R2 `<fm-titolo slot="heading">` in `fm-karto` (`heading` nimmt nur Text); M-1: nein | ja, `uzo-slot-accepts` mit Vorschlag „The slot heading holds a <fm-titolo>, and it accepts text: put text in the slot heading instead.“ (nennt das gefundene Kind); ministral schreibt in R3 `<span slot="heading">`, der Befund ist weg | **wirkt** |

L5-4 nur offline (Messweg wie Spec 046 D-38: `get_ero` mit `name: "butono"`, `lingvo: "de"`, `fields: ["brief", "slots", "constraints"]`, Länge der JSON-Antwort ÷ 3 aufgerundet, Gvidanto im Prozess auf `de931e40`): **2 237 Zeichen ≈ 746 Tokens, kein `rest`** (< 750). Log `$S/logs/mvp-3.1-l5-4.log`.

## Auswertung und Lieferung (MVP-3.1)

Stand 2026-11-13 ≈ 12:30Z, 0 $. Der Entwurf liegt ab jetzt im Repo (D-050-5): `spec.md`, `plan.md`, `tasks.md`, `pruefen.mjs` und `daten/m1`, `daten/m2` aus `$S/entwurf/specs/050-mvp-probelauf/` nach `specs/050-mvp-probelauf/` kopiert; `daten/{laeufe,kostoj,pruefprotokoll}.tsv` aus `$S` (Stand nach der Freigabe von D-050-25). Kein `m3`, kein `wdh-m2`. Keine Logs mit Anfragen oder Antworten.

| Schritt | Ergebnis |
|---|---|
| `spec.md` | SHA-256 `fc66a82266a15bc5cf76f673d8f1ec55d7d889b4c3cad23a045f91cccf433710` = Produkt-Spec (byte-gleich) |
| Bilder | Aus den Läufen gab es keine Bilder (Ablauf-Form speichert keine). Gerendert nur M-1 F, Runde 3, komuna, hell und dunkel: `node $W/bildigi-fragmentojn.mjs <ordner> - <out>` gegen `$R` (`de931e40`); die Fragmente dafür in die Marken `<!-- ekranoj:fragmento -->` eingefasst (das Werkzeug erwartet ein Screen-Dokument). 4 Screens, Konsole 0, axe-Knoten 0/0. Abgelegt als `daten/bildoj/m1-F-<slug>-{hela,malhela}.png` (8 Dateien, 192 KB). M-1 0 nicht (das Werkzeug rendert nur F). |
| Größe | `du -sh daten` = 560 KB (≤ 10 MB) |
| `bericht.md` | Punkte 1 bis 9 der Spec, dazu „Empfehlung für die Folge-Spec: K8 `interspacoj`“, Block `pruefen` (`node pruefen.mjs --abschnitt`), Zuordnung Ledger-ID ↔ CLI-Lauf-ID, CI-Tabelle als markierter Platzhalter |
| `luecken.json` | L50-1 (Bewertung K8 `interspacoj`), L50-2 (`fm-sxelo` `notices`), L50-3 (`check_markup` prüft ein ausdrücklich in den Standard-Slot gesetztes Kind nicht gegen `accepts`/`nesting`) |
| `node specs/050-mvp-probelauf/pruefen.mjs` (aus `$R`, ohne Flags) | **Exit 0**: `grün: m1 F 0/4 - · m1 0 0/4 - · m2 F 0/4 - · m2 0 0/4 -`; 16 Screens, Abweichungen 0, Struktur 0, `bericht.md stimmt` |
| Hilfsskripte (außerhalb des Repos) | `$S/werkzeug-mvp3/{l5-fragmente,runden-befunde,k8-abstaende,k8-eltern,l5-4,tabelle,abstand-mittel}.mjs`; Logs `$S/logs/mvp-2.2-*`, `mvp-2.3-*`, `mvp-3.1-*` |

**Lieferliste:** `spec.md` · `plan.md` · `tasks.md` · `bericht.md` · `luecken.json` · `pruefen.mjs` · `daten/` (`laeufe.tsv`, `kostoj.tsv`, `pruefprotokoll.tsv`, `m1/`, `m2/`, `bildoj/`).

## Befunde

| # | Befund | Folge |
|---|---|---|
| F-050-1 | `pnpm build` auf dem Messkopf kam vollständig aus dem lokalen Turbo-Cache (10/10, „FULL TURBO“); die wiedergegebenen Logs nennen den Pfad eines anderen Worktrees (`fundamento-wt-mwccryipy9hehhxi`). `pnpm install` warnte über den fehlenden Bin `fundamento-mcp` (`packages/mcp/dist` fehlte zum Zeitpunkt der Installation). | Harmlos: Turbo stellt `dist` aus dem Inhalts-Hash des Messkopfs her; nach dem Build sind alle `dist` vorhanden und `git status` ist leer. Gilt auch für die Builds vor M-1 bis M-3. |
| F-050-2 | Auf der Maschine liefen bei MVP-1.1 fremde Playwright-Wiederholungen (`zweitfarbe-036`, `--repeat-each=30`, Worktree `fundamento-wt-mwdq3cluiyydrirx`, vermutlich die parallele Spec „Wacklige Browser-Tests“); Last(1 min) bis 18,28 bei 10 Kernen. | Der Wächter von Spec 050 hält die Sperre „belegt“. M-1 startet erst bei „frei“; wäre die Last vor oder nach dem Lauf > 10, gilt er als gestört (R-2). Nicht eingreifen, warten. |
| F-050-3 | Die Proben P-1 bis P-6 und die Probe-Prozesse des `gardisto-selbsttest` sind für den Wächter von Spec 038 fremde Messprozesse; er setzt seine eigene Sperre dann für ≥ 300 s auf „belegt“. | Harmlos (D-050-7). Seine Sperrdateien gehören ihm; sie sind aus dem SHA-256-Vergleich ausgenommen. `gardisto-selbsttest` nie während eines Laufs. |
| F-050-4 | Der Schlüssel-Scan der technischen Spec §6 (ein `grep -rEn` nach Schlüsselmustern: Präfix `sk-` mit mindestens 16 Zeichen, die Namen der zwei Schlüssel aus der `.env`, jeweils direkt gefolgt von einem Gleichheitszeichen, und Bearer-Kopfzeilen) meldet `spec.md:135`: AK-9 nennt dort die Suchmuster selbst, ohne Wert. `spec.md` muss byte-gleich bleiben. `$W/pruefen` (Muster nach Form und Länge, Werte aus der `.env`) meldet `spec.md` sauber. | MVP-3.2: den Treffer als erklärte Zeile im Abschnitt „Prüfungen vor dem Push“ nennen (Datei, Zeile, Grund), nicht `spec.md` ändern. Alle anderen Dateien müssen ohne Treffer sein. Zeile in MVP-3.1 umformuliert (F-050-9). |
| F-050-5 | **Nummernkonflikt in Sicht.** Die parallele Spec „Wacklige Browser-Tests“ (Worktree `fundamento-wt-mwdq3cluiyydrirx`, Branch `261112-wacklige-browser-tests--9197f6`) hat lokal den unversionierten Ordner `specs/050-wacklige-tests-036/` und arbeitet unter `/tmp/s050/`. Sie ist nicht gepusht und hat keinen PR; nach der Regel der Spec (frei auf `origin/main` und in offenen PRs) ist 050 für diese Spec frei. Die Pfade überschneiden sich nicht (`/tmp/s050/` ≠ `/tmp/s050-werkzeug`, `/tmp/s050-logs`). | Der Orchestrator klärt mit dem Maintainer, welche Spec 050 behält; die andere nimmt die nächste freie Nummer. Für Spec 050 hier ist ein Wechsel bis MVP-3.1 billig (nur Entwurf und die Konstante `specs/050-mvp-probelauf` in `sperre.mjs` und `audit-ac4`). D-050-11 sorgt dafür, dass Marker der anderen Spec zählen. **Erledigt:** Spec-Nummer bleibt 050 (D-050-21). |
| F-050-6 | **Probe 2 zeigt keine Abweichung, obwohl der Code seit Spec 038 geändert ist.** Gezählt über drei Messordner von Spec 038 (`anmelden-und-konto`): 16 Screens, Abweichungen zu `stato.verda` **0**; K1–K6, `total`, K8-Quote und `kompleta` der bewerteten Runde gegen das `raporto.json` der Messung ebenfalls **0**. Ursache: (a) In `nachher` (F und 0) scheitert jeder Screen schon an K8 (`plena` falsch, Quote 0,616–0,9208), in 0 dazu an K5; ein anderes Ergebnis von `check_markup` könnte `verda` dort nicht kippen. (b) In `vorher-F` scheitern die zwei nicht grünen Screens nur an `navigado`; die zwei grünen bleiben grün, auch mit der Prüfung des Messkopfs (`check_markup`: 0 Fehler, nur `label-names-action`-Hinweise, über alle 8 F-Screens). (c) Ob `check_markup` in Spec 038 dieselben `malobservoj` gab, ist **nicht prüfbar**: die Ablauf-Form speichert sie nicht (Q-4). | Die Probe belegt den Weg (ohne Absturz, gleich in allem, was gespeichert ist), nicht die Gleichheit der `malobservoj` mit einem alten Lauf. M-1/M-2 laufen auf demselben Messkopf mit demselben Gvidanto und derselben Modelo; eine Abweichung dort ist ein Befund („unklar“, R-3), keine stille Korrektur. |
| F-050-7 | Der 038-Ordner `ablauf/vorher-F/20261107-1245` hielt an der Tokengrenze in Runde 2 bei `anmelden` (`haltigo: max-tokens`, `stato` nur Runde 1). Der Export bewertet dann Runde 1 als letzte Runde; das ist der Fall „Lauf hält an der Tokengrenze“ von MVP-2.x (Teilergebnis, kein Stopp). Ein nicht gestarteter Lauf (`nekomencita`) ergibt „nicht gebaut“ für alle Screens (synthetische Probe). | Für M-1/M-2 erwartbar (R-1); `pruefen.mjs` zählt „nicht gebaut“ nicht als rot. |
| F-050-8 | `raporto.json` von `fm ekranoj` hält K8 je Screen nur als `{ kvoto, plena }` (kein `kombinacioj`, kein `mankoj`); `enigo.taksado.k8` der ekranoj-Form ist daher verkürzt (D-050-16). Für `decidiVerdon` ohne Wirkung; die vollen K8-Werte je Marke stehen für M-1/M-2 im `raporto.json` der Messung, für M-3 nur die Quote. | Im Bericht (MVP-3.1) K8 von M-3 nur als Quote und `plena` zeigen. |
| F-050-9 | Der Schlüssel-Scan der technischen Spec §6 über den Entwurf meldet bei MVP-1.2 außer `spec.md:135` auch die Zeile von **F-050-4 in `plan.md`**: sie zitiert das Suchmuster selbst (Namen mit `=`, kein Wert). `$W/pruefen --datei` meldet `plan.md` sauber. | MVP-3.1/3.2: die Zeile von F-050-4 so umschreiben, dass sie die Muster nicht wörtlich enthält (z. B. „die Namen der zwei Schlüssel, gefolgt von Gleichheitszeichen“), dann zählt nur noch `spec.md:135` als erklärter Treffer. Hier nicht geändert, weil F-050-4 der Text von MVP-1.1 ist. **Erledigt in MVP-3.1:** F-050-4 umformuliert; der Scan meldet nur noch `spec.md:135`. |
| F-050-10 | **M-1 nicht gestartet (MVP-2.1, erster Versuch).** Vorprüfung 2026-11-12T19:10Z grün (`git status --porcelain` leer, HEAD = Messkopf, `diff de931e40..HEAD -- packages` leer; `uptime` 15,12 / 15,76 / 16,33). Die Sperre von Spec 050 war von 18:49:01Z bis zur Frist 22:10Z durchgehend „belegt“ (38 Stichproben alle 5 min in `$S/logs/mvp-2.1-warten.log`, Last(1 min) 6,85 bis 115,84 bei 10 Kernen, um 22:10Z 75,75). Ursache: fremde Messprozesse, (a) die Playwright-Reihen der parallelen Spec „Wacklige Browser-Tests“ (`zweitfarbe-vorher`, `buehne-vorher`, dann `achsen-vorher`, `--repeat-each=30`, Worktree `fundamento-wt-mwdq3cluiyydrirx`), (b) ab ≈ 21:10Z `vitest run && playwright test` in `packages/metiejo` eines weiteren Worktrees (`fundamento-wt-mwdq3k9mtj0jstz2`). Nicht eingegriffen. Kein `kosten vorab`, kein `mezuri`, kein Ordner `$S/m1`, `laeufe.tsv` ohne Zeile, gebucht 0,00 $; die Reservierung `probe-sonnet-komuna` 4,00 $ bleibt offen. | MVP-2.1 erneut starten, wenn die fremden Reihen fertig sind: im Hintergrund `until grep -q '^frei ' $S/sperre.stato; do sleep 30; done`, dann `uptime` (Last(1 min) ≤ 10), `$W/kosten vorab probe-sonnet-komuna --usd 4.00` und der Befehl M-1 aus „Befehle M-1 bis M-3“. Nicht neu reservieren. Der Orchestrator kann die anderen Worktrees bitten, ihre Reihen anzuhalten. **Nachtrag MVP-2.1, zweiter Versuch** (Entscheid des Maintainers 2026-11-12 ≈ 22:15Z: weiter warten, bis 12 h): Vorprüfung 22:17Z grün, `uptime` 53,66 / 59,01 / 56,74. Drei Warter im Hintergrund (je ≤ 115 min), 56 Stichproben alle 5 min in `$S/logs/mvp-2.1-warten-2.log`, Last(1 min) 3,55 bis 100,00; dazwischen Phasen mit Last < 10, aber fremden Treffern (Sperre „belegt“). **„frei“ ab 02:42:49Z, Last(1 min) 3,59 → M-1 gestartet 2026-11-13T02:42:57Z**, nach 7 h 54 min Warten über beide Versuche (Sperre „belegt“ 18:49Z bis 02:42Z). Das Fenster war kurz: ab 02:44:25Z liefen wieder fremde Playwright-Prozesse (F-050-11). | Erledigt (M-1 gelaufen). Für MVP-2.2/2.3 gilt dasselbe Muster; ohne Absprache mit den anderen Worktrees ist ein ungestörter Lauf nicht planbar. |
| F-050-11 | **M-1 gestört.** Rund 90 s nach dem Start (02:44:25Z) begannen fremde Messprozesse: Playwright-Läufe mit Chromium, Firefox und WebKit, cwd `/tmp/s050/t3` (Arbeitsordner der parallelen Spec „Wacklige Browser-Tests“, F-050-5), ab 02:49:25Z auch im Worktree `fundamento-wt-mwdq3cluiyydrirx` (`packages/eroj`). Last(1 min) laut Wächter-Spur in 9 von 44 Proben > 10 (max. 11,31). `mezuri`: `fremde_messung ja`, `gestoert ja`; Last vor 3,59, nach 9,30 (je ≤ 10). Keine Anbieterfehler, kein 429, Exit 0. | Nach technischer Spec §4 gestört (Last > 10 während des Laufs). **Nicht wiederholt** (MVP-2.1). Die Zielkennzahl F 0/4 ist gemessen, steht aber unter dem Vorbehalt „gestört“; Wirkung der Last auf das Ergebnis ist unklar (die Bewertung ist offline und unabhängig von der Last, die Modellantworten nicht messbar). Der Orchestrator legt das dem Maintainer vor; MVP-2.2 erst nach dessen Antwort. |
| F-050-12 | **0 `konto` Runde 3 nicht neu gebaut.** Die Tokengrenze von 0 (Rest 119 556 nach F) griff in Runde 3 bei `konto` (`penoj["3"]` ohne `konto`). Der Lauf trug den Stand von Runde 2 in Runde 3 (`rondoj/3/konto.{html,fakto.json}` byte-gleich mit Runde 2) und schrieb `stato["3"].konto` (nicht grün). Export und `pruefen.mjs` werten ihn nach D-050-13 als „Runde 3“. | Ohne Wirkung auf grün (Runde 2 war auch nicht grün). Im Bericht (MVP-3.1) bei 0 `konto` „Runde 3 = getragen aus Runde 2“ nennen; nicht korrigiert. |
| F-050-13 | **F scheitert in Runde 3 nur an K8, und dort nur am Merkmal `interspacoj`.** K1–K6, Navigation und Muster sind in R3 für alle 4 F-Screens erfüllt (außer `registrieren` K6 0,75, das grün nicht hindert); `ersatzschrift`, `nativaj`, `sxablono` = 1 in allen Kombinationen. `interspacoj` < 1 in provo und provo-kompakta (alle Screens), bei `konto` auch in komuna und ekzemplo. `k8.mankoj` ist leer, also zählt der Abstand in K8 (keine Seitenregel `k8-interspaco`). | Für MVP-3.1 (L50-n, Wirkung 046): Kandidat einer Lücke „Abstände zwischen Geschwistern nicht auf einer Abstandsstufe der Marke“ (zuerst `fm-sxelo > fm-stako`, 16 px, bzw. `fm-sxelo > fm-pagxo`). Ursache Fundamento oder Modell ist hier nicht entschieden. **Eingeordnet in MVP-3.1:** Ursache Fundamento (Bewertung K8 und `fm-sxelo`), F-050-16. |
| F-050-14 | **M-2 gestört, obwohl `mezuri` „nein“ bucht.** `mezuri` prüft Last(1 min) nur vor (8,80) und nach (5,97) dem Lauf. Die Wächter-Spur zeigt während des Laufs 61 von 236 Proben > 10 (max. 43,37 um 08:59:44Z), ohne fremde Messprozesse (Treffer 0). Der Maintainer hat nach den ersten 5 Proben (max. 11,15) entschieden (D-050-22). | M-2 trägt im Bericht den Vermerk „gestört“; `laeufe.tsv` bleibt wie gebucht. Für spätere Messungen: `mezuri` sollte die Wächter-Spur des Laufs auswerten, nicht nur vorher/nachher (Werkzeug, nicht Fundamento). |
| F-050-15 | **M-2 Variante 0 nicht gestartet.** ministral F verbrauchte 1 247 299 von 1 250 000 Tokens (3 Runden, ≈ 103 000 Tokens ein je Screen-Runde); 0 bekam keinen Rest (`nekomencita`, `haltigo: max-tokens`). | Erwartet nach R-1 (ein Budget je Aufruf, D-050-3). F gegen 0 für ministral gibt es nicht; `bericht.md` nennt das, kein Nachlauf. |
| F-050-16 | **K8 `interspacoj` misst Abstände, die eine Sxablono oder Ero selbst setzt.** Über alle Marken × Schemata der Runde 3 liegen die Abstände unter Layoutmitteln und nativen Behältern immer auf einer Stufe (M-1: `fm-navigado` 0/40, `fm-formularo` 0/48, `dl` 0/24 daneben; M-2: `fm-stako` 0/24, `fm-vico` 0/24, `fm-kolumno` 0/8, `fm-navigado` 0/56, `fm-formularo` 0/16). Daneben liegen nur Abstände zwischen Kindern von `fm-sxelo` (M-1 16/32, M-2 56/72), `fm-pagxo` (20/80, 16/48), `fm-atributlisto` (6/8) und `fm-karto` (6/16). Ursachen: (a) `fm-sxelo` blendet den leeren Teil `notices` nicht aus (`HIDEABLE = ["brand", "principal", "nav"]`), also stehen zwischen `nav` und `main` zwei `frame`-Abstände = 2 × `spacing.medium` = 16 px – in komuna (16 = `large`) und ekzemplo (12 = `large`) zufällig eine Stufe, in provo (Stufen 2, 4, 8, 20, 28, 48) und provo-kompakta (2, 4, 8, 12, 20, 32) nicht; (b) `fm-pagxo` setzt `head` mit `justify-content: space-between`, der freie Raum zwischen `subtitle` und `actions` (818–1 055 px) zählt als Abstand; (c) Höhen und Ränder der Teile (Trennlinie 1 px unter `header`: 9 px in komuna, 7 px in ekzemplo bei M-2). Log `$S/logs/mvp-3.1-k8-abstaende.log`. | Kein Modellbefund: Sonnet hat zwischen diesen Kindern nichts gesetzt (die Regel `spacing-owned-by-container` gibt den Abstand dem Behälter). Ursache **Fundamento** (Bewertung K8, mit (a) in den Eroj); L50-1 und L50-2 in `luecken.json`; Empfehlung in `bericht.md`. Ersetzt die offene Einordnung von F-050-13. |
| F-050-17 | **Kein Befund für ein falsches Kind im Standard-Slot.** M-2 `passwort-vergessen` R3: `<fm-vico slot="items">` mit vier `<a>` in `fm-navigado`; `items` nimmt nur Text, `nesting: 0` (`modelo/data/eroj/navigado/uzo.json`). `check_markup` meldet nichts. Folge: die `<a>` sind roh (K8 `nativaj` 4/4, Schrift und Farbe) und fallen in axe dunkel durch (`color-contrast`, 4 Knoten). Spec 046 hat das als F-B3 vorhergesagt („ausdrücklich geslottete Standard-Slot-Kinder werden nicht mehr gegen `accepts` geprüft“). | Ursache **Fundamento** (Gvidanto prüft ein ausdrücklich in den Standard-Slot gesetztes Kind nicht mehr gegen `accepts`/`nesting`); L50-3. Bei `fm-karto` `content` meldet `check_markup` dagegen `uzo-slot-nesting` – uneinheitlich. |
| F-050-18 | **Text von `fm-ligilo` in Ersatzschrift (nur M-2).** ministral schreibt `<fm-ligilo slot="brand" …>Team Nord</fm-ligilo>` (Text im Standard-Slot `label`, erlaubt); ohne `placement` erbt der Text die Schrift der Seite, die keine Markenschrift setzt (`ersatzschrift` 12–34 % der Zeichen, zuerst `fm-sxelo > fm-ligilo`). Sonnet setzt `label="Team Nord"`; dieser Text liegt im Schatten-DOM und wird von K8 nicht gemessen. | Ursache **unklar** (offene Frage in `bericht.md`): Modell (fehlendes `placement`) oder Fundamento (Marke/Sxelo setzt keine Schrift für eingebetteten Linktext, und K8 misst `label`-Text nicht). |
| F-050-19 | **`fm-karto` sagt zweierlei zur Überschrift.** `uzo.composes.with` nennt `titolo` („The heading of a card is a titolo …“), `uzo.slots.heading.accepts` nur `text`. ministral folgte dem ersten und bekam in R2 `uzo-slot-accepts`. | Nicht in der letzten Runde (R3 `<span slot="heading">`), daher keine Zeile in „Verbleibende Befunde“; offene Frage in `bericht.md`. |
| F-050-20 | **Sonnet ruft `list_arangxoj` nie auf** (M-1: `get_ero` 25, `check_markup` 19, `get_sxablono` 18, `suggest_ero` 8, `check_usage` 7, `list_eroj` 4, `explain_regulo` 4, `list_reguloj` 1); ministral fünfmal. Der Hinweis der Runde zu K8 `interspacoj` („Abstände nur über Sxablonoj und Layoutmittel (list_arangxoj)“, `packages/ekranoj/src/rondoj.ts`) kann bei F-050-16 nicht helfen: der Abstand liegt in der Sxablono. | Belegt, dass Runde 2 und 3 den K8-Rest nicht abbauen konnten (M-1 F K8 0,9727 → 0,9813, der Rest bleibt); geht in die Empfehlung zu L50-1 ein. |

## Prüfungen am Ende von MVP-1.1

Stand 2026-11-12 ≈ 18:36Z, nach Selbsttests, Wächterstart und Reservierungen:

| Prüfung | Ergebnis |
|---|---|
| `git -C $R status --porcelain` | leer (0 Zeilen) |
| `git -C $R rev-parse HEAD` | `de931e40caa87884216375c7c3897e5148cbd333` (= Messkopf) |
| `git -C $R diff de931e40..HEAD -- packages` | leer |
| Spec 038 unverändert (SHA-256 aller 1 123 Dateien in `$M/.fundamento/spec038` vor und nach MVP-1.1; Listen `$S/logs/mvp-1.1-s038-{vorher,nachher}.sha256`) | gleich bis auf `sperre.stato`, `sperre.tsv`, `logs/gardisto.log` (schreibt der laufende 038-Wächter selbst, F-050-3). Werkzeuge `$W38` (17 Dateien): Digest der Liste `7220094623ad4590…` vorher = nachher. Ledger (`kostoj/laeufe/pruefprotokoll.tsv`, `anfragoj.json`, `identitaet`, `lauf5/*`): `686e74dd6e79786a…` vorher = nachher. |
| 038-Wächter | PID 28582 läuft weiter (nicht gestoppt, nicht neu gestartet) |
| `selbsttest` nach den Reservierungen (echtes Ledger mit drei offenen Reservierungen) | 322 OK, 0 Fehler (`$S/logs/mvp-1.1-selbsttest-nach-reservierung.log`; nach D-050-11 erneut 322/322, `mvp-1.1-selbsttest-final.log`) |
| `$W/pruefen --datei` über Entwurf, README, alle geänderten Werkzeuge und Logs von MVP-1.1 | sauber (22 Dateien) |
| `$W/gardisto plan-marker` auf `plan.md` und `tasks.md` | 0 Marker |
| Schlüssel-Scan technische Spec §6 über Entwurf und `$S/logs` | nur `spec.md:135` (F-050-4), sonst nichts |
| `$W/kosten stand` | 0,000000 $ von 8,00 $ gebucht; offen: `probe-sonnet-komuna` 4,00, `vergleich-ministral-komuna` 0,25, `marke-sonnet-ekzemplo` 3,60 |
| `$W/gardisto stand` | Wächter PID 7790 läuft; „belegt“ wegen der fremden Playwright-Wiederholungen (F-050-2), Last(1 min) 14,43 bei 10 Kernen |

## Prüfungen vor dem Push (MVP-3.2)

Stand 2026-11-13 ≈ 12:40Z, auf dem Branch vor dem ersten Commit (Arbeitskopie: nur `specs/050-mvp-probelauf/` neu). Keine lokalen Testläufe außer diesen (D-050-24). Hilfsskript der Struktur-Prüfung: `$S/werkzeug-mvp3/struktur.mjs`.

| AK | Prüfung | Ergebnis |
|---|---|---|
| AK-1 | Go 2026-11-12 und Preise 2026-11-12T18:20:55Z (Abschnitt „Preise“) liegen vor dem Start von M-1 2026-11-13T02:42:57Z (`daten/laeufe.tsv`) | ja |
| AK-2 | Commit in jeder Zeile von `daten/laeufe.tsv` und `kostoj.tsv` = `de931e40`, kein `-dirty`; `daten/m1/lauf.json` und `daten/m2/lauf.json` nennen `de931e40`; Vorprüfung vor jedem Lauf (`status --porcelain` leer, `diff de931e40..HEAD -- packages` leer) in „Läufe und Kosten“ | ja |
| AK-3 (angepasst) | `daten/laeufe.tsv` hat genau M-1 und M-2, je einmal; M-3 ist nicht gelaufen (D-050-23); kein `wdh-` (D-050-22). In `laeufe.tsv`/`kostoj.tsv`: Commit, Exit, Dauer, Tokens ein/aus, Anfragen, Betrag, Last vor/nach, gestört (M-2: „nein“ wie gebucht, gilt nach D-050-22 als gestört). Befehl, `--max-tokens`, Werkzeugaufrufe und 429-Wartezeilen haben in den Spalten von Spec 038 keinen Platz; sie stehen in „Läufe und Kosten“ und in `daten/<zelle>/lauf.json` (`maksTokenoj`), `daten/<zelle>/<V>/kuro.json` (`peno.toolCalls`). | ja, mit dieser Abweichung der Ablage |
| AK-4 | `--max-tokens` 1 666 000 und 1 250 000 = berechnete Werte (`lauf.json` `maksTokenoj`); Σ gebucht 3,993412 $ ≤ 8,00 $; `probe-` 3,743952 ≤ 4,00, `vergleich-` 0,249460 ≤ 0,25, `marke-` 0 ≤ 3,60, `wdh-` 0 ≤ 0,15 (`$W/kosten stand`); `$W/audit-ac4 -C $R` (`origin/main..HEAD` ohne `specs/050-mvp-probelauf/**`): geändert 0, neu 0 | ja |
| AK-5 | `node specs/050-mvp-probelauf/pruefen.mjs` in einer frischen Shell (`env -i`, `sandbox-exec` ohne Netz): Exit 0, 16 Screens, Abweichungen 0, `bericht.md stimmt`. Negativprobe: Kopie von `daten/` nach `/tmp/s050-negativ.*`, in `m1/F/anmelden/fakto.json` `gespeichert.verda = true` → `ABWEICHUNG … recomputed not green, stored green`, Exit 1; Kopie gelöscht | ja |
| AK-6 | Struktur-Prüfung über `bericht.md` und `daten/`: jeder der 16 nicht grünen Screens (M-1 F/0, M-2 F/0) hat ≥ 1 Zeile in „Verbleibende Befunde“ mit Ursache (Modell / Fundamento / unklar) und Beleg; jede Fundamento-Zeile nennt einen Eintrag aus `luecken.json` (L50-1 bis L50-3) | ja, 0 Fehler |
| AK-7 | L5-1 **wirkt**, L5-2 **nicht ausgelöst**, L5-3 **wirkt**; gestützt auf die Fragmente (D-050-26); L5-4 offline 746 Tokens ohne `rest` | ja |
| AK-8 (nach D-050-23) | `bericht.md` Abschnitt 5: „M-3 nicht gelaufen (Entscheidung D-050-23)“, K8 je Marke aus M-1 als Beleg, Grenze genannt | ja |
| AK-9 | Grep der technischen Spec §6 über `specs/050-mvp-probelauf` und `/tmp/s050-logs/*` (35 Dateien): **nur `spec.md:135`** (erklärter Treffer: AK-9 nennt die Suchmuster selbst, ohne Wert; F-050-4); `plan.md` nach F-050-9 ohne Treffer. `$W/pruefen --datei` über alle 48 Textdateien: sauber; `$W/pruefen -C $R --staged`: sauber (vor dem Commit) | ja |
| AK-10 (Teil) | `git diff --stat origin/main -- . ':!specs/050-mvp-probelauf'` leer (kein `packages/**`, keine Wurzeldatei, kein `.github/**`); `git check-ignore -v` über alle Dateien von `specs/050-mvp-probelauf/` meldet nichts (Exit 1). Push, PR und CI macht der Orchestrator. | ja (Teil) |
| `spec.md` | SHA-256 `fc66a822…3710` = Produkt-Spec | byte-gleich |
| nach dem Commit | `$W/pruefen -C $R --diff origin/main..HEAD` | Ergebnis im Build-Log der Spec (läuft nach dem Commit) |

## Tatsächlich berührte Dateien

- Im Repo `$R`: **keine** (D-050-5). `git -C $R status --porcelain` leer, `git -C $R diff de931e40..HEAD -- packages` leer.
- Außerhalb: `$S/werkzeug/**` (Kopie), `$S/identitaet` (Kopie), `$S/{kostoj,laeufe,pruefprotokoll}.tsv`, `$S/anfragoj.json`, `$S/sperre.*`, `$S/gardisto.pid`, `$S/logs/**`, `$S/entwurf/specs/050-mvp-probelauf/{spec,plan,tasks}.md`; Symlinks `/tmp/s050-werkzeug`, `/tmp/s050-logs`.
- MVP-1.2, außerhalb: `$S/werkzeug/exportieren.mjs` (neu), `$S/werkzeug/README.md` (Zeile und Abschnitt „Export und Gegenprobe“), `$S/entwurf/specs/050-mvp-probelauf/pruefen.mjs` (neu), `plan.md`, `tasks.md`, `$S/proben/mvp-1.2/**` (Probe-Daten und Probe-Bericht), `$S/logs/mvp-1.2-*`. Spec 038 nur gelesen (SHA-256 gleich).
- MVP-2.1, außerhalb: `$S/m1/20261113-0243/**` (Laufordner, geschrieben von `nordstelo`), `$S/{kostoj,laeufe,pruefprotokoll}.tsv` (Zeilen von `mezuri`), `$S/entwurf/specs/050-mvp-probelauf/daten/m1/**` (Export), `plan.md`, `tasks.md`, `$S/logs/mvp-2.1-{warten-2,start,export,pruefen}.log`, `$S/logs/mvp-2.1-{warten,start}.sh` und `mvp-2.1-k8.mjs` (Warter, Start, K8-Auszug; Kopien aus `/tmp/s050-mvp21`). Im Repo `$R` nichts.
- MVP-2.2 bis MVP-3.1, außerhalb: `$S/kostoj.tsv` (eine Zeile `freigegeben`, D-050-25), `$S/werkzeug/sperre.mjs` (eine Zeile, D-050-25), `$S/entwurf/…/daten/m2/**` (Export), `$S/werkzeug-mvp3/*.mjs` (Hilfsskripte), `$S/logs/mvp-2.2-*`, `mvp-2.3-*`, `mvp-3.1-*`; `/tmp/s050-bilder` (Bilder vor dem Kopieren).
- MVP-3.1 und MVP-3.2, im Repo `$R`: **nur `specs/050-mvp-probelauf/**`** (`spec.md`, `plan.md`, `tasks.md`, `bericht.md`, `luecken.json`, `pruefen.mjs`, `daten/**`).
