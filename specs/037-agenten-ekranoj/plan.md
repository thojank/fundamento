# Spec 037 – Agenten bauen Screens (Etappe 11) – Plan

**Spec:** [`spec.md`](spec.md) (Fassung vom 2026-10-31, 7 016 Bytes, unverändert kopiert; SHA-256 `0780c57eb387b9aa34d98ea31bab223fe92f8f3e52af0a3a19b3db877deaed89`) · **Basis:** `main` `f2b5a058` (`f2b5a0585b772dc4cd83eb672a4bd956242610a8`, Merge #129, Spec 035 vollständig; beim Start des Laufs am 2026-10-31 nach `git fetch origin` unverändert) · **Regel 0** gilt: der Weg, den das Repo schon geht, sonst die kleinste Änderung mit Eintrag hier. **Keine Budgets und keine Grenzen angehoben. Nichts gemergt.**

**Datum:** 2026-10-31 · **Stand (S037-13, letztes Ticket):** Teil 1 und Teil 3 in PR A, Teil 2 in PR B, beide offen und nicht gemergt; Modellläufe 1.8 und 2.4 gelaufen (Teilergebnisse, 0,4802 $ von 1,00 $); Wiederholung 2.5 blockiert (Spec 036 Teil 5 nicht auf `main`); Beiträge aller Tickets S037-01 bis S037-12 hier zusammengeführt. S037-13 hat die Befunde S037-10-1, -2, -6 und -7 rot/grün behoben, die integrierte Testsuite ergänzt und die Abdeckungskarte AC-1 bis AC-16 eingetragen (Bericht › „Testabdeckung“). Bericht am Ende.

**Ablage (D-02, D-35):** `spec.md`, `plan.md` und `tasks.md` liegen nur auf Branch A. Jedes Ticket schreibt seinen Beitrag zusätzlich in eine eigene Datei außerhalb des Repos (`s037-beitraege/<Ticket>.md` im Feature-Ordner der Purple-Doku); die Beiträge der Kette B und des Betriebs (S037-07 bis S037-11) hat S037-12 hier zusammengeführt (Entscheidungen mit Zuordnung der vorläufigen IDs, D-176).

### Branches und PRs

| PR | Branch | Basis | Worktree | Inhalt | Kopf | Stand |
|---|---|---|---|---|---|---|
| A „Spec 037 – Ablauf Screens“ | `261031-spec-037-ekranoj` | `main` (`f2b5a058`) | `/tmp/s037-a` | Teil 1, Teil 3, `specs/037-agenten-ekranoj/` | Doku-Commit von S037-13 (Code-Stand `5f184b93`) | [#131](https://github.com/thojank/fundamento/pull/131) offen, kein Entwurf, nicht gemergt |
| B „Spec 037 – Messung“ | `261031-spec-037-mezuro` | Branch A | `/tmp/s037-b` | Teil 2 | auf den Doku-Commit von S037-13 neu aufgesetzt (vorher `1ae9894f`, davor `07585b5e`; aktueller Kopf im PR, D-178, D-194) | [#132](https://github.com/thojank/fundamento/pull/132) offen, kein Entwurf, nicht gemergt, gestapelt auf #131 |

Kein PR aus dem p0-Branch. Commits nur über das Schutzwerkzeug `commit` (Noreply-Identität je Befehl, D-14).

## Abgrenzung zu Spec 036

Bindend (R-5). Bedarf in einer Tabu-Datei wird kein Patch, sondern ein „Befund Tabu“ mit Datei, Grund, Vorschlag und dem Teil von Spec 036, in den er passen würde.

### Tabu für 037

- `packages/metiejo/**` – die Kostenlogik aus Spec 033 S6 wird nur über die bestehenden Exporte von `@fundamento/metiejo` gelesen und aufgerufen.
- `packages/modelo/src/gvidanto/**`, `packages/modelo/src/eroj/**` (Skemoj, Ero-Tokens), `packages/eroj/**`, `packages/vortaro/**`
- `packages/mcp/**` (Schema und Werkzeuge; das ganze Paket gilt als tabu)
- `packages/projekcioj/**` (nur aufrufen, z. B. den Build der Marke)
- Außerdem unberührt: `packages/modelo/**` bis auf das eine Wort in `src/ci/workflow.test.ts` (D-15), insbesondere `packages/modelo/src/nordstelo/katalogo.ts` und `packages/modelo/data/**` (D-01).

### Frei für 037

- PR A: `packages/ekranoj/**` (neu) · `packages/cli/src/commands/ekranoj.ts`, neue Testdateien in `packages/cli/src/`, `packages/cli/src/cli.ts` (zwei Zeilen), `packages/cli/package.json` (Abhängigkeiten) · `packages/nordstelo/src/ekrano-taksilo.ts` (+ Test), `packages/nordstelo/src/index.ts` (eine Zeile), `packages/nordstelo/package.json` (Abhängigkeit) · `specs/037-agenten-ekranoj/**`.
- PR B: `packages/nordstelo/src/ablauf/**`, `packages/nordstelo/test/fixtures/ablauf/**`, `packages/nordstelo/src/cli.ts` (nur die Weiche `--art ablauf`).

### Graubereich (D-01, D-15)

- `pnpm-lock.yaml` (neues Paket), `.github/workflows/ci.yml` (ein Wort in der `unit`-Matrix), `packages/modelo/src/ci/workflow.test.ts` (ein Wort in `UNIT_PACKAGES`).
- `packages/modelo/src/workspace.test.ts` (eine Zeile `ekranoj` in `PACKAGES`, Orchestrator-Entscheidung D-59, D-60).
- Nicht berührt: `CHANGELOG.md` (ekranoj ist privat), `THIRD_PARTY_NOTICES.md` (keine neue fremde Abhängigkeit), Wurzel-`package.json`, `turbo.json`, `pnpm-workspace.yaml` (`packages/*` deckt das neue Paket). Wird eine davon doch nötig: eigene Entscheidung und Eintrag in der Konfliktprüfung.

### Tatsächlich berührte Dateien

| Datei | PR | Art | Commit |
|---|---|---|---|
| `specs/037-agenten-ekranoj/spec.md` | A | frei, neu (byte-gleich) | Gerüst-Commit (S037-01) |
| `specs/037-agenten-ekranoj/plan.md` | A | frei, neu | Gerüst-Commit (S037-01) |
| `specs/037-agenten-ekranoj/tasks.md` | A | frei, neu | Gerüst-Commit (S037-01) |
| `packages/ekranoj/**` (Gerüst, `src/{tipoj,plano,navigado,verda,gardo,index}.ts`, Tests, `src/test-doubles/faktoj.ts`) | A | frei, neu | `f3137c13` (rot), `999cf1c7` (grün) – S037-02 |
| `.github/workflows/ci.yml` | A | Graubereich, ein Wort (`ekranoj` in der `unit`-Matrix, D-15, D-47) | `999cf1c7` – S037-02 |
| `packages/modelo/src/ci/workflow.test.ts` | A | Graubereich, ein Wort (`ekranoj` in `UNIT_PACKAGES`, D-15, D-47) | `999cf1c7` – S037-02 |
| `pnpm-lock.yaml` | A | Graubereich (Importer `packages/ekranoj`, nur `@fundamento/metiejo` und vorhandene Werkzeuge) | `999cf1c7` – S037-02 |
| `packages/modelo/src/workspace.test.ts` | A | Graubereich, eine Zeile (`ekranoj: "@fundamento/ekranoj"` in `PACKAGES`, D-59, D-60) | `d944ff68` – S037-03 |
| `packages/ekranoj/**` (`src/{mcp-kliento,agento,instancoj,rondoj,kostoj,fakto-statika}.ts`, Tests, `src/test-doubles/{chat,iloj,taksilo,bildigilo}.ts`, `tipoj.ts` additiv, `index.ts` additiv, `package.json` mit `@modelcontextprotocol/client` 2.0.0) | A | frei | `f2fa007a` (rot), `795a0b98` (grün) – S037-03 |
| `pnpm-lock.yaml` | A | Graubereich (Importer `packages/ekranoj`: `@modelcontextprotocol/client` 2.0.0, schon im Workspace; 3 Zeilen) | `795a0b98` – S037-03 |
| `packages/ekranoj/**` (`src/{konstruo,bildigilo,eligo}.ts` neu mit Tests, `src/bildigilo.browser.test.ts`, `src/test-doubles/marko.ts`, `vitest.browser.config.ts`, Skript `test:browser`; additiv: `tipoj.ts`, `index.ts`, `navigado.ts`, `instancoj.ts`, `rondoj.ts`, `test-doubles/bildigilo.ts`, `vitest.config.ts`; `package.json` mit `playwright` 1.63.0 und `@axe-core/playwright` 4.13.0) | A | frei | `1a3ab821` (rot), `0680245a` (grün) – S037-04 |
| `pnpm-lock.yaml` | A | Graubereich (Importer `packages/ekranoj`: `playwright` 1.63.0, `@axe-core/playwright` 4.13.0, beide schon im Workspace; 6 Zeilen) | `1a3ab821` – S037-04 |
| `packages/cli/src/commands/ekranoj.ts` (neu), `packages/cli/src/ekranoj.test.ts` (neu), `packages/cli/src/cli.ts` (+2 Zeilen: Import und `ENTRIES`-Eintrag, D-30), `packages/cli/package.json` (`@fundamento/ekranoj`, `@fundamento/nordstelo` als `workspace:*`) | A | frei (Zone S037-05) | `a74125cf` (rot), `aba52f19` (grün) – S037-05 |
| `packages/nordstelo/src/ekrano-taksilo.ts` (neu) + Test, `packages/nordstelo/src/index.ts` (+1 Zeile), `packages/nordstelo/package.json` (`"@fundamento/ekranoj": "workspace:*"` vor `@fundamento/eroj`, gleiche Zeile wie S037-07 auf Branch B) | A | frei (Zone S037-05, D-31); `score.ts` unverändert | `a74125cf` (rot), `aba52f19` (grün) – S037-05 |
| `pnpm-lock.yaml` | A | Graubereich (Importer `packages/cli`: `@fundamento/ekranoj`, `@fundamento/nordstelo`; Importer `packages/nordstelo`: `@fundamento/ekranoj` – dieselben drei Zeilen wie S037-07 auf Branch B; 9 Zeilen, nur Workspace-Links) | `a74125cf` – S037-05 |
| `packages/ekranoj/src/bildigilo.ts` (axe lädt nur Medien vor, Naht `importiAxe`), `src/bildigilo.test.ts`, `src/bildigilo.browser.test.ts`, `src/test-doubles/retumilo.ts` (neu) | A | frei (Zone S037-06, Befund 1 aus S037-05) | `6c256265` (rot), `b5e9b25a` (grün) – S037-06 |
| `packages/ekranoj/src/mankoj.ts` (neu) + `mankoj.test.ts`, `test/fixtures/mankoj/{261031-1000-standards,261031-1100-teams}/{raporto,mankoj}.json` (neu, `git check-ignore -v` ohne Treffer); additiv: `index.ts` (Export), `rondoj.ts` (alle Quellen der Lücken, beobachtende Brücke für `suggest_ero`), `eligo.ts` (Abschnitt „Lücken (Teil 3)“ in `raporto.md`), `eligo.test.ts` (erwartete Abschnitte) | A | frei (Zone S037-06) | `74681016` (rot), `4d7a1b27` (grün) – S037-06 |
| `packages/cli/src/commands/ekranoj.ts` (Rumpf des Untermodus `mankoj`, Hilfe), `packages/cli/src/ekranoj.test.ts` (Untermodus; der Test von S037-05 für „mankoj“ ohne Ordner angepasst) | A | frei (Zone S037-06) | `74681016` (rot), `4d7a1b27` (grün) – S037-06 |
| `packages/nordstelo/src/ablauf/{katalogo,sxablonoj-samaj,poentoj}.ts` + Tests, `src/ablauf/test-doubles/taksilo.ts`, `test/fixtures/ablauf/liste-filter-detail/{F,0}/**` (`plano.json`, `rondoj/<n>/<slug>.fakto.json`, `poentoj.json`; `git check-ignore -v` ohne Treffer) | B | frei | `f460e1ef` (rot), `f7a58882` (grün) – S037-07 (erste SHAs `071d6df1`/`95a2d813` auf `999cf1c7`) |
| `packages/nordstelo/package.json` (`@fundamento/ekranoj`), `pnpm-lock.yaml` (3 Zeilen) | B | Graubereich bzw. Zone S037-07 – gleiche Zeilen wie S037-05 auf A, seit dem Neuaufsetzen auf `5a912063` nicht mehr im Diff von B | – |
| `packages/nordstelo/src/ablauf/{kuro,raporto,cli-ablauf}.ts` + Tests, `src/ablauf/test-doubles/ekranoj.ts`; `packages/nordstelo/src/cli.ts` (+5 Zeilen: Import, zwei Hilfezeilen, Kommentar, Weiche `--art`) | B | frei | `8061cc29` (rot), `53933318` (grün) – S037-08 (erste SHAs `9dd1957c`/`215f00ed`) |
| `packages/nordstelo/src/ablauf/kuro.ts` + Test (`mankoj.json` je Messlauf) | B | frei | `7d0fa453` (rot), `46021ce9` (grün) – S037-08 |
| `packages/nordstelo/src/ablauf/poentoj.test.ts` (Navigation in ekranoj und Messung gleich) | B | frei | `0651b957` (grün, roter Stand = neu aufgesetzter Branch) – S037-08 |
| `packages/nordstelo/src/ablauf/raporto.ts`, Tests, Attrappe `test-doubles/taksilo.ts` verkleinert (Bewertung über `ekranoTaksilo`) | B | frei | `07585b5e` (grün, keine Zahl geändert) – S037-08 |
| `specs/037-agenten-ekranoj/plan.md`, `tasks.md` (Zusammenführung, Bericht) | A | frei | Doku-Commit von S037-12 |

**Zusammen (AC-3):** PR A 63 Dateien gegen `main` (Stand `5a912063`: +10 124 Zeilen, 2 ersetzt – je eine Zeile in `ci.yml` und `workflow.test.ts` mit dem Wort `ekranoj`); PR B 28 Dateien gegen Branch A (+6 504 Zeilen), alle unter `packages/nordstelo/src/ablauf/**`, `packages/nordstelo/test/fixtures/ablauf/**` und `packages/nordstelo/src/cli.ts`. **Graubereich nur in PR A:** `pnpm-lock.yaml` (+34), `.github/workflows/ci.yml` (ein Wort), `packages/modelo/src/ci/workflow.test.ts` (ein Wort), `packages/modelo/src/workspace.test.ts` (eine Zeile, D-59). Kein Tabu-Pfad; `CHANGELOG.md`, `THIRD_PARTY_NOTICES.md`, Wurzel-`package.json`, `turbo.json`, `pnpm-workspace.yaml` unberührt.

## Zusammenfassung je Teil

### Teil 1 – Ablauf „Screens bauen“ (`fm ekranoj`, PR A)

- S037-02: Paket `@fundamento/ekranoj` (privat, ESM, Vitest, ohne Browser) mit den Verträgen C-1 bis C-7 als Typen und den reinen Funktionen `validiPlanon` (V-2), `navigado` (D-05/D-28), `decidiVerdon` (D-04), `kontroliModelon`/`gardiModelon` (D-19); Modulgraph-Test AC-10; CI-Platz (D-15). Rot `f3137c13`, grün `999cf1c7` (= Basis von Branch B).
- S037-03: der Ablauf `kuruEkranojn` ohne Rendern und Ausgabe – Schätzung vor der ersten Anfrage (D-20), Plan gegeben, erfragt oder aus der Namensliste (V-2, D-38), Bau je Screen über einen eingespeisten `ChatModel` mit den zwölf Bauwerkzeugen des Gvidanto (Markenwerkstatt nie), `check_usage` mit Instanzen aus Fakten und `get_ero` (D-32), Navigation und Grün je Runde, höchstens drei Runden mit Befunden als Rückmeldung, früh grüne Screens fortgeschrieben (D-26), Restbefunde mit Regel, Ort und Grund; ein metiejo-`Budget(maksTokenoj)` über den Lauf mit Halt vor der Anfrage und Teilergebnis (AC-9). MCP-Client über stdio (D-16), echter `ChatModel` über `chatCompletion` mit Modellwache (D-19). Naht für S037-04: `EkranojDeps.eligo`. Rot `f2fa007a`, grün `795a0b98`; dazu `d944ff68` (Workspace-Test, D-59).
- S037-04: Screens werden Dateien, die über `file://` öffnen. `konstruo.ts`: Rahmen um das Fragment (`<html lang data-fm-aspekto data-fm-color-scheme>`, Marke relativ aus `marko/`, Eroj als klassisches Skript – D-24, Rücklink zur Übersicht außerhalb des Fragments mit `data-ekranoj-kadro` – D-27; Variante 0 nur mit Rücklink – D-34) und die Übersicht. `bildigilo.ts`: Chromium über `import("playwright")`, hell und dunkel mit axe (WCAG 2.2 A/AA wie nordstelo), Fotos, Fakten nur aus dem Fragment (C-2); ohne Browser kein Renderer, ein Satz im Bericht, kein Screen grün. `eligo.ts`: Ausgabeordner nach §2.4 mit `raporto.md`/`raporto.json` (Abschnitte aus 1.6), `mankoj.json`, `rondoj/<n>/` mit Fakten (D-33), deterministisch. `kuruEkranojn` baut die Marke einmal je Lauf und liest die Link-Ziele von Eroj mit Skemo-Rolle `link` (Befund 1 aus S037-07). AC-6 und AC-7 mit Attrappen bewiesen, AC-7 und `file://` zusätzlich in echtem Chromium (`test:browser`, D-17). Rot `1a3ab821`, grün `0680245a`.

- S037-05: der Befehl `fm ekranoj "<Satz>"` (`--config`, `--ekranoj`, `--out`, `--max-tokens`, `--env`, `--ledger`, `--ja`, `--json`; Untermodus `mankoj` angekündigt, D-29). Reihenfolge: Eingabe (V-2, nichts gestartet) → `.env` → Modellwache (D-19) → Schätzung (D-20) → Bestätigung (D-37) → Gvidanto als Kindprozess `fm mcp`, Bewertung über nordstelo, Markenbau über projekcioj (`css`, `make-kit`), Chromium → Lauf → `file://`-Links auf `superrigardo.html` und `raporto.md`; Exit 0 auch beim Halt an `--max-tokens`, 1 ohne gebauten Screen, 2 Aufruf/Einrichtung. ekranoj und nordstelo nur per dynamischem `import()` (D-30, Wächtertest AC-11 grün). Adapter `ekranoTaksilo` in nordstelo (C-8, D-31): `scoreBoth(…).nova` mit Gewichten und Tor des Katalogs, K6 aus den Kriterien je Slug. Befehl über `ekranojKomando(medio)` mit Attrappen testbar. Rot `a74125cf`, grün `aba52f19`.

- S037-06 (Befund 1 aus S037-05): axe-core lud vor jedem Lauf die Stylesheets per XMLHttpRequest vor; unter `file://` blockiert Chromium das mit einem Konsolenfehler, und jeder echte Screen hatte K1 = 0 (nie grün). Jetzt lädt axe nur die Medien vor (`AXE_ANTAUXSXARGO`, D-104); die Ergebnisse gleichen dem Render von nordstelo, echte Konsolenfehler der Seite bleiben in den Fakten. Rauchtest mit Attrappen-Modell, echtem Gvidanto, echter Bewertung und Chromium: K1 = 1 in jeder Runde, beide Screens ab Runde 2 grün (`/tmp/s037-logs/smoke/261031-s037-06-k1/`). Rot `6c256265`, grün `b5e9b25a`; dazu `25932e8b` (eigener Farbwert im Adapter-Test, Modelo-Clean-Room, D-115).

- S037-13 (Befunde aus S037-10, je rot/grün): **leere Antwort** – eine Antwort ohne Markup (leer oder nur ein `mankoj`-Block) wird einmal in derselben Unterhaltung ohne Werkzeuge nachgefragt (eine Anfrage im bestehenden Budget, keine neue Grenze); bleibt auch die zweite leer, trägt der Screen den Hinderungsgrund `leere-antwort` (nie grün, Befund mit Regel, Ort, Grund), eine Logzeile, die Runde läuft weiter, die Rohantworten liegen redigiert in `rondoj/<n>/<slug>.respondo.txt` (D-184, D-185; rot `d32e62bb`, grün `069ff999`). **Schätzung** – `TOKENOJ_EKRANO_RONDO_F` = 70 000 aus den Abnahme-Läufen statt 40 000 (D-186; rot `73a63449`, grün `b0c6fa28`). **Übernommene Werte und Variante 0** – ein durch einen Halt nicht neu gebauter Screen trägt `portitaEl` und im Bericht „übernommen aus R<n>“; Variante 0 schreibt keine Bewertungslücken in `mankoj.json` (D-187; rot `bca52e70`, grün `54ead00b`). Dazu die integrierte Testsuite (Abschnitt Bericht › „Testabdeckung“).

### Teil 3 – Lücken als Rückmeldung (PR A)

- S037-06, 3.1: `packages/ekranoj/src/mankoj.ts`. Jeder Lauf schreibt in `mankoj.json` (und als Tabelle in `raporto.md`, Abschnitt „Lücken (Teil 3)“) alle Lücken aus vier Quellen (C-7): K5-Lücken der Bewertung im letzten Stand eines Screens (`rebuilt-ero`, `raw-value`), `check_usage`-Fehler im letzten Stand, `suggest_ero`-Aufrufe ohne Treffer (über eine beobachtende Brücke im Lauf erfasst) und die Lücken, die der Agent im ```` ```mankoj ````-Block meldet; gewünschte Werkzeuge, die der Gvidanto schon hat, fallen weg. `kunigiMankojn(ordner)` führt Läufe zusammen (Anzahl summiert, Aufgaben `<Lauf>/<Screen>` vereinigt, sortiert nach Anzahl, dann Name – unabhängig von der Reihenfolge der Ordner), `mankojMarkdown` druckt die Tabelle der Kennzahl, erweitert um Aufgaben, Beispielstelle, Vorschlag und Ziel. Befehl `fm ekranoj mankoj <ordner…> [--out <datei>] [--json]` (D-29): Tabelle, mit `--out` zusätzlich JSON; keine Ordner oder ein fehlender Ordner → Exit 2 mit strukturierter Meldung; Optionen eines Laufs im Untermodus abgelehnt. Regeln für Art, Ziel und Vorschlag: Abschnitt „Lückenliste“. Rot `74681016`, grün `4d7a1b27`.
- S037-06, 3.2: Werkzeugliste des Gvidanto (`TOOL_NAMES`, nur gelesen) gegen den Bedarf des Ablaufs geprüft; sechs Befunde „Manko Gvidanto“ mit Vorschlag (Abschnitt Befunde), kein Code in `packages/mcp`.

### Teil 2 – Messung „ganzer Ablauf“ (PR B)

- S037-07, 2.1/2.2: `packages/nordstelo/src/ablauf/katalogo.ts` – fünf Abläufe in der Reihenfolge der Lieferliste (`anmelden-und-konto` 4 Screens, `liste-filter-detail` 3, `formular-in-schritten` 4, `einstellungen-konto` 3, `uebersicht-kennzahlen` 3; 17 Screens, 26 geplante Kanten), je Screen mindestens ein K6-Kriterium, das auch Variante 0 entscheidet; `validiKatalogon` mit eigenen Regeln (D-121). `sxablonoj-samaj.ts` – Muster D-06 über ARIA-Rollen und Signaturen aus der Skemo (D-123 bis D-126). `poentoj.ts` – Bewertung je Screen (K1–K6 über den Adapter, Navigation über ekranoj `navigado` mit `faktojPorNavigado`, Muster) und je Ablauf (`sumo`: Total über die geplanten Screens, Navigation und Muster als eigene Spalten); Gewichte aus dem Katalog der Modelo gelesen, nicht kopiert. Fixtures `test/fixtures/ablauf/liste-filter-detail/{F,0}/` mit erwartetem `poentoj.json` (AC-11). Rot `f460e1ef`, grün `f7a58882` (Stand auf A `5a912063`).
- S037-08, 2.3: `pnpm nordstelo --art ablauf` (`ablauf/kuro.ts`, `raporto.ts`, `cli-ablauf.ts`, Weiche in `nordstelo/src/cli.ts`, +5 Zeilen). Je Ablauf × Variante (F vor 0) × Wiederholung ein Lauf von `kuruEkranojn` mit dem Plan des Katalogs; eine Tokengrenze für die ganze Messung; Modellwache vor jeder Anfrage; jeder Screen in den vier Repo-Marken × hell/dunkel (D-39); Last vor/nach jedem Lauf; Bericht `raporto.md`/`raporto.json` mit F gegen 0 und Runde 1 gegen Runde 3 je Ablauf und Screen, Streuung Reihe K 16,7 als Maßstab, aus gespeicherten Daten byte-gleich neu baubar. Rot `8061cc29`, grün `53933318`; `mankoj.json` je Messlauf rot `7d0fa453`, grün `46021ce9`; Navigationstest an die Behebung in A angepasst `0651b957`; Bewertung über `ekranoTaksilo` `07585b5e` (keine Zahl geändert).
- S037-10, 2.4: erster Messpunkt auf `07585b5e` – Teilergebnis (3 von 8 Teilläufen, Tokengrenze 2 000 000), ab 13:49:32Z durch eine Messung von Spec 036 gestört (Abschnitt „Messungen“).
- 2.5 (Wiederholung auf dem dann aktuellen `main`): blockiert, Spec 036 Teil 5 ist nicht gemergt (Abschnitt „Blockiert“).

### Über alle Teile

- **Was es gibt:** `fm ekranoj "<Satz>"` baut aus einem Satz und einer Marke bis zu 5 verlinkte Screens, prüft sie selbst (`check_usage`, axe hell/dunkel, K1–K7, Navigation) und verbessert sie bis zu dreimal; Ausgabeordner mit `superrigardo.html` (über `file://`), Fotos, `raporto.md/json`, `mankoj.json`. `fm ekranoj mankoj <ordner…>` führt die Lücken vieler Läufe zusammen. `pnpm nordstelo --art ablauf` misst den Aufgabentyp „ganzer Ablauf“ in der Kennzahl.
- **Wo:** Paket `packages/ekranoj` (PR A), Befehl `packages/cli/src/commands/ekranoj.ts` (PR A), Adapter `packages/nordstelo/src/ekrano-taksilo.ts` (PR A), Messung `packages/nordstelo/src/ablauf/` (PR B).
- **Wie ausführen:** Abschnitt „Messanleitung“ (Befehle im Checkout `/Users/thorstenjankowski/n8n-compose/20260918_fundamento-ds`, `file://`-Links, Kostenschätzung mit den gemessenen Werten).
- **Was die echten Läufe zeigen:** der Ablauf funktioniert von Satz bis Bericht und hält jede Tokengrenze; die Qualität ist noch nicht grün (0 grüne Screens in den Abnahmen, 2 von 4 grün in Variante F von `anmelden-und-konto`), vor allem wegen leerer Antworten des Agenten (Befund S037-10-1) und einer 3–4-fach zu niedrigen Schätzung (Befund S037-10-2), durch die die Scheiben nur Teilergebnisse tragen – beide in S037-13 behoben. Variante F liegt in `anmelden-und-konto` in Runde 3 um 51,5 Punkte über Variante 0 (über der Streuung 16,7). Mit dem echten Gvidanto und dem echten Bewerter ist ein Fragment nur aus Eroj in Runde 1 grün (integrierter Test, Befund S037-13-1): der grüne Weg trägt von Satz bis Bericht.

## Entscheidungen, vom Maintainer zu bestätigen

Der Lauf ist unbeaufsichtigt (R-1). Wo die Quell-Spec offen lässt, gilt der Vorschlag. „angewandt“ = so umgesetzt; **zu bestätigen** = ausdrücklich zur Bestätigung gestellt. Alle Einträge sind vom Maintainer zu bestätigen. Stand nach dem Lauf (S037-12): jede Entscheidung ist umgesetzt; ausdrücklich gestellt sind D-12/D-14, D-27, D-40, D-59/D-60, D-138, D-164, D-174 und D-178.

### Vorschläge der Quell-Spec (V-1 bis V-4)

| ID | Vorschlag | Ergebnis im Lauf | Stand |
|---|---|---|---|
| V-1 | Neues Paket `packages/ekranoj` (Esperanto „Bildschirme“), nutzt die MCP-Werkzeuge als Client. | Paket entsteht ab S037-02. | angewandt |
| V-2 | Der Agent leitet **höchstens 5 Screens** ab (mit Zweck je Screen und Navigation). Eine vom Nutzer übergebene Liste mit mehr als 5 Screens wird abgelehnt (klare Meldung), nicht gekürzt. | `validiPlanon` (S037-02), Ablehnung vor jeder Anfrage (S037-03, S037-05). | angewandt |
| V-3 | **Höchstens drei Runden** Prüfen → Verbessern oder bis grün; danach Abweichungen mit Regel und Grund im Bericht. | `MAKS_RONDOJ = 3` (S037-02), Schleife S037-03. | angewandt |
| V-4 | **Zwei PRs, gestapelt:** PR A „Spec 037 – Ablauf Screens“ (Teil 1 und 3), PR B „Spec 037 – Messung“ (Teil 2) auf PR A. | Branch A `261031-spec-037-ekranoj` von `f2b5a058` angelegt und gepusht (S037-01); Branch B ab S037-07. | angewandt (PR A #131, PR B #132) |

### Entscheidungen des Auftrags (D-01 bis D-13)

| ID | Frage | Vorschlag | Ergebnis im Lauf | Stand |
|---|---|---|---|---|
| D-01 | Graubereich-Dateien | Minimal, nur Anhängen, keine neue fremde Abhängigkeit (Playwright, axe-core und das MCP-SDK sind im Workspace schon vorhanden); `packages/modelo/src/nordstelo/katalogo.ts` wird **nicht** geändert, der Katalog „ganzer Ablauf“ liegt als neue Datei in `packages/nordstelo`. Jede Berührung steht in der Konfliktprüfung. | Liste im Abschnitt „Graubereich“; tatsächliche Berührungen in „Tatsächlich berührte Dateien“. | angewandt |
| D-02 | Ablage von spec, plan, tasks | `specs/037-agenten-ekranoj/` liegt in PR A; plan/tasks werden dort in eigenen Doku-Commits fortgeschrieben; PR B wird am Ende auf den letzten Stand von PR A neu aufgesetzt. | Gerüst-Commit auf Branch A (S037-01). | angewandt |
| D-03 | Abhängigkeitsrichtung | `ekranoj` hängt **nicht** von `nordstelo` ab; die Bewertung (K1–K7) wird über eine Schnittstelle hineingereicht. `nordstelo` (neue Aufgabenart) und `cli` (`fm ekranoj`) verdrahten. So entsteht kein Zyklus. | Schnittstelle `Taksilo` (S037-02), Adapter in nordstelo (S037-05). | angewandt |
| D-04 | Was „grün“ heißt | Ein Screen ist grün, wenn K1 = 1, keine Verstöße von `check_usage` mit Schwere Fehler, axe ohne Befund in hell und dunkel, K5 = 1 und Navigation vollständig. Hinweise (nicht Fehler) beenden die Schleife nicht vorzeitig, stehen aber im Bericht. | Reine Funktion (S037-02). | angewandt |
| D-05 | „Navigation vollständig“ (deterministisch) | Jede im Plan genannte Kante (Screen → Screen) ist als Verweis vorhanden; jeder Verweis zeigt auf einen existierenden Screen; jeder Screen ist von der Übersicht erreichbar. Anteil = vorhandene geplante Kanten / geplante Kanten; tote Verweise ziehen ab. | Formel D-28; in ekranoj (D-22), S037-02. | angewandt |
| D-06 | „Gleiche Muster für gleiche Zwecke“ (deterministisch) | Zwecke werden aus dem Plan und den Fakten des gerenderten Screens bestimmt (Hauptnavigation, Hauptaktion, Formularfeld je Eingabeart, Liste/Tabelle, Statusmeldung, Seitenkopf). Je Zweck muss über alle Screens dasselbe Ero (Tag und prägende Props wie Variante) bzw. dieselbe Sxablono verwendet werden. Anteil = einheitliche Zwecke / vorkommende Zwecke. In Variante 0 werden native Elemente und Klassen statt Eroj verglichen. | In nordstelo `src/ablauf/` (D-22), S037-07. | angewandt |
| D-07 | Variante 0 in der Schleife | Variante 0 (ohne Fundamento) bekommt ebenfalls bis zu drei Runden mit den Prüfungen, die für sie gelten (K1, K4 axe, K5, Navigation, Muster); K2/K3 entfallen wie in Spec 030. Verglichen wird F gegen 0 je Runde 1 und Runde 3. | S037-02 (Grün für Variante 0), S037-03, S037-08. | angewandt |
| D-08 | Messung von Spec 036 erkennen | Vor jedem Messlauf: keine Prozesse der Messwerkzeuge (Kennzahl, Abnahmeskripte, Browser) aus dem Worktree von Spec 036 aktiv, mindestens 5 min am Stück; zusätzlich der jüngste Stand im plan von 036 (lokal lesbar), ob eine Messung läuft. Warten im Hintergrund. | Wächter `gardisto` (S037-09); der plan von 036 wird nur über Git-Refs gelesen, nie aus dessen Worktree. | angewandt |
| D-09 | Last je Messwert | Wie Spec 033 B-13: Lastmittel 1/5/15 min und Zahl der Kerne vor und nach jedem Lauf; fremde Messprozesse (ja/nein) als eigene Spalte. | Spalten `last_vor`, `last_nach`, `kerne`, `fremde_messung` im Kosten-Ledger (S037-01); Erfassung über `mezuri` (S037-09). | angewandt |
| D-10 | Eigenes Ledger | Kosten-Ledger und Anfragen-Zähler unter `.fundamento/spec037/` (nicht im Repo), getrennt von `.fundamento/nordstelo` und von Spec 036. Die Grenzen des Anbieters je Tag bleiben unverändert (Anbieter-weit gültig; ein 429 ist ein Befund, kein Anlass zum Anheben). | `kostoj.tsv`, `r8.tsv` und `identitaet` unter `/Users/thorstenjankowski/n8n-compose/20260918_fundamento-ds/.fundamento/spec037/` (S037-01). | angewandt |
| D-11 | Budget-Aufteilung (Obergrenzen, keine Ziele) | Abnahme-Läufe komuna + provo ≤ 0,10 $; erster Messpunkt Teil 2 ≤ 0,40 $; Wiederholung auf dem dann aktuellen `main` ≤ 0,40 $; Rest Reserve. Bei Knappheit gilt die Reihenfolge: Abnahme-Läufe → Messpunkt F (Runde 1 und 3) → Messpunkt 0 → Wiederholung. | Werkzeug `kosten` lehnt eine Reservierung über die Scheibe oder über 1,00 $ ab (Exit 3); Scheibe über das Präfix der Lauf-ID (D-41). | angewandt |
| D-12 | Commit-Identität | Wie Spec 036 Teil 6: im Checkout dieses Laufs lokal `user.email` auf die Noreply-Adresse von GitHub für `thojank` setzen; Historie bleibt unverändert. | Nicht wörtlich: Alle Worktrees teilen ein Git-Verzeichnis mit der Sitzung von Spec 036, ein `git config` hätte auch deren Identität geändert. Stattdessen D-14. | abgewandelt, **zu bestätigen** |
| D-13 | Inhalt der Screens | Beispielinhalte nur neutral und erfunden (z. B. „Standard A-12“, „Team Nord“); keine echten Marken, Firmen oder Personen. | Gilt für Prompts, Attrappen, Katalogtexte und den Abnahme-Satz; `pruefen` prüft jede Zeile gegen die lokale Markenliste. | angewandt |

### Entscheidungen der Implementierungs-Spec (D-14 bis D-39)

| ID | Frage | Wahl | Ergebnis im Lauf | Stand |
|---|---|---|---|---|
| D-14 | D-12 ohne die gemeinsame Git-Konfiguration anzufassen | Identität je Befehl über das Schutzwerkzeug `commit` (`git -c user.name=… -c user.email=<id>+thojank@users.noreply.github.com`), auch für rebase und cherry-pick; kein Schreiben mit `git config` (das Git-Verzeichnis ist mit Spec 036 geteilt). Prüfung: `git log --format='%ae %ce' origin/main..HEAD` zeigt nur die Noreply-Adresse. | Probe-Commit in einem Probe-Repo unter `/tmp`: Autor und Committer = Noreply-Adresse, keine `user.email` in dessen lokaler Konfiguration; `user.email` im p0-Worktree unverändert (Hash-Vergleich vor/nach). Gerüst-Commit über `commit`. | angewandt |
| D-15 | CI-Platz für das neue Paket | `ekranoj` an `UNIT_PACKAGES` in `packages/modelo/src/ci/workflow.test.ts` und an die `unit`-Matrix in `.github/workflows/ci.yml` anhängen (Graubereich, je ein Wort). | S037-02. | angewandt |
| D-16 | Bibliothek für den MCP-Client | `@modelcontextprotocol/client` 2.0.0 (exakt), Transport `./stdio`; das in der technischen Spec genannte `@modelcontextprotocol/sdk` gibt es im Workspace nicht. | S037-03. | angewandt |
| D-17 | Browser-Tests | Der `test` von ekranoj läuft ohne Browser (Renderer-Attrappe); echtes Chromium (AC-7 berechnete Farben, axe-Rauchtest, Öffnen über `file://`) in `test:browser` (lokal, `vitest.browser.config.ts`); Ergebnisse in tasks.md. Kein Überspringen. | S037-04. | angewandt |
| D-18 | Name der Anbieter-Schnittstelle | `ChatModel` (englisch), nicht `Modelo` – Modelo ist der verbindliche Begriff für das Datenmodell. | S037-02. | angewandt |
| D-19 | Modellwache | `PERMESITA_MODELO = "mistral/ministral-14b-2512"` (verglichen mit `provider.toString()`); `fm ekranoj` und `nordstelo --art ablauf` beenden sich bei jedem anderen Modell mit Exit 2 vor jeder Anfrage. | S037-02 (Funktion), S037-05, S037-08. | angewandt |
| D-20 | Kostenschätzung | Tokens je Screen und Runde als benannte Konstanten mit Quelle (Mediane Reihe K: F ≈ 40 000, 0 ≈ 2 000, Plan-Anfrage ≈ 5 000); $ über `kostoOf`; unbekannter Preis → „Kosten unbekannt“, nie 0. | S037-03. | angewandt |
| D-21 | Anfragen-Ledger | `fm ekranoj --ledger <dir>` (Standard `<baseDir>/.fundamento/ekranoj`) für `anfragoj.json`; alle Messläufe schreiben nur unter `.fundamento/spec037/`; dort führt das Schutzwerkzeug `kosten` die `kostoj.tsv` (Werkzeug, kein Produktcode). | S037-05, S037-10. | angewandt |
| D-22 | Wo D-05 und D-06 liegen | D-05 in ekranoj (D-04 braucht es schon in PR A); die Aufgabenart in nordstelo importiert es (kein `nordstelo/src/ablauf/navigado.ts`). D-06 in `nordstelo/src/ablauf/sxablonoj-samaj.ts` (PR B); der Laufbericht von ekranoj hat keine Muster-Spalte. | S037-02, S037-07. | angewandt |
| D-23 | Identität des Katalogs | Eigener Typ in `nordstelo/src/ablauf/katalogo.ts`; stabile Slugs als IDs (keine ULIDs, nichts in `ids.lock.json` oder `packages/modelo/data/**`); nur im Speicher in die Form `Tasko` für `score()` gebracht. | S037-07. | angewandt |
| D-24 | Screens unter `file://` | Wahl im Ticket (Vorbild: das Vitrino bindet das in sich geschlossene Make-Kit-Bündel der Elemente inline ein); Bedingung: Screens rendern Eroj, wenn sie in Chromium über `file://` geöffnet werden, und das Fragment des Agenten bleibt markenfrei. Gewählter Weg wird festgehalten. | S037-04. | angewandt |
| D-25 | Läufe in die Scheiben einpassen | Jeder Modelllauf: zuerst Schätzung; `--max-tokens` = Scheibe in Tokens (0,20 $ je 1 Mio.): Abnahme je 250 000 (komuna, provo), Messpunkt 2 000 000, Wiederholung 2 000 000. Liegt die Schätzung über der Scheibe, wird vor dem Start verkleinert (Abnahme: `--ekranoj` mit 3 Namen; Messung: Aufgaben in Katalogreihenfolge, F vor 0). Teilergebnis = als Teilergebnis berichtet. | S037-10. | angewandt |
| D-26 | „Runde 3“ eines früh grünen Screens | Sein letzter Stand wird fortgeschrieben und mit „grün seit Runde n“ markiert. | S037-03. | angewandt |
| D-27 | Navigation und Rahmen | Der Agent schreibt die Navigation in sein Fragment; der Rahmen ergänzt nur einen Rückverweis auf die Übersicht (`data-ekranoj-kadro`), der aus den Fakten und aus D-05 ausgenommen ist. Abweichung von der technischen Spec, Grund: D-05 muss den Agenten messen. | S037-04. | angewandt, **zu bestätigen** |
| D-28 | Formel D-05 | `max(0, vorhandene − tote) / geplante`; je Screen „kompleta“ (alle geplanten ausgehenden Kanten vorhanden, kein toter Verweis). | S037-02. | angewandt |
| D-29 | Lücken zusammenführen | `fm ekranoj mankoj <ordner…>` (Untermodus desselben Befehls über das erste Argument; ein Satz, der genau „mankoj“ lautet, gilt als Untermodus – in `--help` beschrieben). | S037-06. | angewandt |
| D-30 | Anmeldung im cli | Eine Import-Zeile und ein Eintrag in `ENTRIES` in `cli.ts`; ekranoj und nordstelo werden per dynamischem `import()` erst in `run` geladen (der Wächtertest AC-11 aus Spec 035 bleibt grün). | S037-05. | angewandt |
| D-31 | Bewertungs-Adapter | `nordstelo/src/ekrano-taksilo.ts` in PR A plus eine Export-Zeile in `nordstelo/src/index.ts`; nordstelo bekommt die Abhängigkeit `@fundamento/ekranoj` in PR A. `score.ts` unverändert. | S037-05. | angewandt |
| D-32 | Instanzen für `check_usage` | In ekranoj aus den Fakten plus `get_ero` (MCP) gebaut; die private Funktion `instancesOf` von nordstelo bleibt privat. Ein Unterschied zwischen `check_usage` über MCP (D-04) und K3 wird gezeigt, nicht versteckt. | S037-03. | angewandt |
| D-33 | Gespeicherte Fakten | `rondoj/<n>/<slug>.fakto.json` und `plano.json` je Lauf → nordstelo bewertet deterministisch neu. | S037-04, S037-07. | angewandt |
| D-34 | Variante 0 in ekranoj | Keine Werkzeuge, kein Fundamento-CSS, keine Eroj; der Agent schreibt je Screen ein ganzes HTML-Dokument (wie `PROMPT_0` in nordstelo); gerendert über Media Features; der Rahmen fügt nur den Rückverweis ein. | S037-03, S037-04. | angewandt |
| D-35 | Wo SHAs stehen | Tickets der Kette A: tasks.md auf Branch A (Doku-Commit) und eigene Beitragsdatei; Kette B und Betrieb: Beitragsdatei, von S037-12 in tasks.md übernommen. | So angelegt (S037-01). | angewandt |
| D-36 | Schutzwerkzeug | Angepasste Kopie von `/tmp/s035-werkzeug` unter `/tmp/s037-werkzeug`; die Obergrenze 1,00 $ gehört Spec 037; Werkzeug und Ledger von Spec 035 bleiben unberührt. | `filtern` unverändert, `pruefen`, `kosten`, `r8`, `audit-ac4`, `README.md` angepasst, `commit` und `selbsttest` neu; Selbsttest 45 von 45 Fällen grün (S037-01). | angewandt |
| D-37 | Bestätigung der Schätzung | Ohne `--ja`: im Terminal Rückfrage (Standard nein); ohne Terminal Exit 2 nach Ausgabe der Schätzung. Messläufe geben `--ja` mit. | S037-05. | angewandt |
| D-38 | Agent plant mehr als 5 Screens | Abgelehnt, einmal mit Hinweis auf die Grenze neu angefragt; zweiter zu langer Plan → die ersten 5 in der Reihenfolge des Agenten, Kanten zu gestrichenen Screens entfernt, im Bericht vermerkt. | S037-03. | angewandt |
| D-39 | Marken in der Messung | „ganzer Ablauf“ rendert jeden Screen in den vier Repo-Marken von `ASPEKTOJ` (Konfiguration cxiuj) × hell/dunkel, Kontrast Standard; `fm ekranoj` rendert seine eine Marke × hell/dunkel. Werte werden nicht 1:1 mit Seitenwerten der Reihe K verglichen (im Bericht gesagt). S037-08 darf das mit festgehaltenem Grund einengen. | S037-08. | angewandt |

### Entscheidungen aus dem Lauf (D-40 bis D-196)

Die Tickets nummerierten vorläufig `D-<Ticket>-<n>`; S037-12 hat sie in Ticket-Reihenfolge (S037-01 bis S037-12) als D-40 bis D-183 vergeben, D-ORCH-1 des Orchestrators als D-59 nach S037-02 (D-175). Im Text von plan und tasks stehen nur noch die neuen Nummern (D-176); die Spalte „vorläufig“ und die Zuordnung führen zu den Beitragsdateien `s037-beitraege/<Ticket>.md`.

| Ticket | vorläufig | D-nn |
|---|---|---|
| S037-01 | D-S037-01-1 … -7 | D-40 … D-46 |
| S037-02 | D-S037-02-1 … -12 | D-47 … D-58 |
| Orchestrator | D-ORCH-1 | D-59 |
| S037-03 | D-S037-03-1 … -16 | D-60 … D-75 |
| S037-04 | D-S037-04-1 … -13 | D-76 … D-88 |
| S037-05 | D-S037-05-1 … -15 | D-89 … D-103 |
| S037-06 | D-S037-06-1 … -15 | D-104 … D-118 |
| S037-07 | D-S037-07-1 … -15 | D-119 … D-133 |
| S037-08 | D-S037-08-1 … -17 | D-134 … D-150 |
| S037-09 | D-S037-09-1 … -9 | D-151 … D-159 |
| S037-10 | D-S037-10-1 … -9 | D-160 … D-168 |
| S037-11 | D-S037-11-1 … -5 | D-169 … D-173 |
| S037-12 | D-S037-12-1 … -10 | D-174 … D-183 |
| S037-13 | D-S037-13-1 … -13 | D-184 … D-196 |

Regel: `D-S037-<tt>-<n>` → D-(Anfang des Tickets + n − 1), z. B. D-S037-06-13 → D-116, D-S037-10-5 → D-164.

| ID | vorläufig | Frage | Wahl und Grund | gilt in | Stand |
|---|---|---|---|---|---|
| D-40 | D-S037-01-1 | Upstream-Einträge des neuen Branches | `git worktree add -b … origin/main` trägt nach der Git-Voreinstellung `branch.261031-spec-037-ekranoj.remote/merge` (auf `origin/main`) in die gemeinsame Konfiguration ein; `git push -u` setzt sie auf den eigenen Remote-Branch. Beides sind vom Auftrag vorgegebene Befehle und betreffen nur den Branch von 037, keine Identität; ein `git config` wurde nicht aufgerufen. | Arbeitsplatz | angewandt, **zu bestätigen** |
| D-41 | D-S037-01-2 | Scheibe einer Reservierung (D-11) | Aus dem Präfix der Lauf-ID: `abnahme-…` 0,10 $, `messpunkt-…` 0,40 $, `wiederholung-…` 0,40 $, `reserve-…` 0,10 $ (Rest bis 1,00 $); ohne Präfix Exit 2. Die vorgegebenen Spalten des Ledgers haben keine Spalte für die Scheibe, und die Lauf-IDs der Abnahme folgen dem Schema schon. | Schutzwerkzeug | angewandt |
| D-42 | D-S037-01-3 | Last im Kosten-Ledger | `kosten buchen` nimmt optional vier weitere Werte (Last vor, Last nach, Kerne, fremde Messung ja/nein), damit `mezuri` (S037-09) die Last mitbucht; die Form mit acht Werten bleibt gültig (Spalten leer). | Schutzwerkzeug | angewandt |
| D-43 | D-S037-01-4 | Identitätsprüfung in `pruefen --diff` | Autor und Committer (Name und E-Mail) werden wie Zeilen geprüft (Schlüssel, Marken, Wort aus R-12); die E-Mail muss genau die Noreply-Adresse aus `.fundamento/spec037/identitaet` sein (ohne diese Datei: die Form `<id>+thojank@users.noreply.github.com`). Gemeldete Orte (Pfade, Identitäten) verdecken das Wort aus R-12 und Markennamen, damit die Ausgabe selbst sauber bleibt. | Schutzwerkzeug | angewandt |
| D-44 | D-S037-01-5 | Selbsttest | Neu geschrieben statt übernommen: Die Fassung von Spec 035 prüfte die Ausnahme für deren spec.md (in 037 gibt es keine) und legte ihre Markenprobe unter dem Ordner von Spec 035 an. Die Markenprobe von 037 liegt nur kurz unter `.fundamento/spec037/` und wird gelöscht. | Schutzwerkzeug | angewandt |
| D-45 | D-S037-01-6 | Grenzen-Suche `audit-ac4` | Läuft in `/tmp/s037-a`, lässt `specs/037-agenten-ekranoj/**` aus und sucht zusätzlich nach den Grenzen von Spec 037 und R-4 (`MAKS_EKRANOJ`, `MAKS_RONDOJ`, `maksTokenoj`, `max-tokens`, `LIMOJ`, `Budget(`, 150, 2000, 1,00 $). S037-06 darf weiter anpassen. | Schutzwerkzeug | angewandt |
| D-46 | D-S037-01-7 | Nummern in tasks.md | T3701 ff. in der Reihenfolge Teil 1, Teil 3, Teil 2, Abschluss, je eine Zeile pro Lieferpunkt der Tickets S037-01 bis S037-13; S037-12 darf feiner schneiden und neu nummerieren (wie Spec 035 D-111). | tasks.md | angewandt |
| D-47 | D-S037-02-1 | Stelle des Worts `ekranoj` in der CI-Matrix (D-15) | Alphabetisch zwischen `cli` und `mcp` eingefügt, in `ci.yml` und `UNIT_PACKAGES` gleich. Der Test vergleicht die **sortierte** Liste der Pakete mit Tests mit `UNIT_PACKAGES` und die Matrix mit `UNIT_PACKAGES`; ein Anhängen am Ende wäre rot. Weiter genau ein Wort je Datei. | `.github/workflows/ci.yml`, `packages/modelo/src/ci/workflow.test.ts` | angewandt |
| D-48 | D-S037-02-2 | Ort der Vertragstypen | Alle Typen von C-1 bis C-7 in `packages/ekranoj/src/tipoj.ts`, `index.ts` reicht sie mit `export type *` weiter; Konstanten und `validiPlanon` in `plano.ts`. Grund: der rote Commit verlangt ein `index.ts` nur mit Typen; ein Typmodul ohne Werte macht das ohne Doppelung möglich (die Namen der Dateien sind laut Spec frei). | ekranoj | angewandt |
| D-49 | D-S037-02-3 | Abhängigkeiten von ekranoj | Vorerst nur `@fundamento/metiejo` (Typen `ChatMessage`, `ToolInfo` für `ChatModel`/`ToolBridge`). `@modelcontextprotocol/client` 2.0.0, `playwright` 1.63.0, `@axe-core/playwright` 4.13.0 kommen mit S037-03/04, wenn sie gebraucht werden. `@fundamento/modelo` nicht nötig: die `check_usage`-Verletzung (`Malobservo`) ist als Zwilling von `ValidationIssue` selbst beschrieben. Über metiejo transitiv geladen (erlaubt, im AC-10-Test genannt): `@fundamento/agordilo`, `@fundamento/eroj`, `@fundamento/modelo`, `@fundamento/projekcioj`. | ekranoj | angewandt |
| D-50 | D-S037-02-4 | Was ein Verweis für D-05 ist | Außerhalb des Ablaufs (übergangen): leer, `#…`, jede URL mit Schema (`https:`, `mailto:` …) oder `//…`, `../superrigardo.html`. Verweis auf einen geplanten Slug (`x.html`, `./x.html`, `../ekranoj/x.html`, Anfrage und Anker abgeschnitten) = Kante; ungeplante Kanten zwischen geplanten Screens sind erlaubt und zählen nicht. Jeder andere relative Verweis (unbekannter Screen, falscher Ordner wie `ekranoj/x.html`, Seite ohne `.html`) ist tot. Tote Verweise zählen einmal je Screen und `href`. Nichts geplant, aber tot → `kvoto` 0. | `navigado.ts` | angewandt |
| D-51 | D-S037-02-5 | Screen ohne Fakten, Erreichbarkeit | Ein Screen ohne Fakten (nicht gebaut) ist nicht `kompleta` und nicht erreichbar. Erreichbar = Einstiege der Übersicht (Vorgabe: jeder gebaute Screen, denn die Übersicht verlinkt jeden) und von dort entlang vorhandener Verweise zwischen gebauten Screens. Optionaler dritter Parameter `{ eniroj }` (additiv zu C-4), damit eine Messung auch einen einzelnen Einstieg prüfen kann. | `navigado.ts` | angewandt |
| D-52 | D-S037-02-6 | Erweiterung von C-4 | `perEkrano[slug]` trägt neben `kompleta` additiv `mankantaj` (fehlende geplante Ziele) und `mortaj` (tote `href`s); Typ `EkranaNavigado`, auch `RondoEkrano.navigado`. Grund: der Bericht und die nächste Runde brauchen die Gründe je Screen. | ekranoj, C-4 | angewandt |
| D-53 | D-S037-02-7 | Grün-Entscheidung (C-5) | `decidiVerdon(enigo) → { verda, malhelpoj, sugestoj }`; `malhelpoj` in der Reihenfolge von D-04: `K1`, `check_usage`, `axe-nekontrolita` (kein Render hell oder kein Render dunkel – ohne Renderer also nie grün), `axe-hela`, `axe-malhela`, `K5` (auch `null`), `navigado`. `sugestoj` = Hinweise (`warning`/`info`) aus `check_usage` für den Bericht, halten nie auf; Variante 0 übergeht `check_usage` ganz. | `verda.ts` | angewandt |
| D-54 | D-S037-02-8 | Modellwache (D-19) | `kontroliModelon(provider) → Problemo[]` (Pfad `FM_KI_MODELL`, Regel `model-not-allowed`) und `gardiModelon(provider)`, das `MalpermesitaModelo` mit dem `problemo` wirft. Vergleich exakt (Groß-/Kleinschreibung zählt) mit `provider.toString()` = `<anbieter>/<modell>` aus metiejo `Provider`; der Schlüssel kommt nie in die Meldung. | `gardo.ts` | angewandt |
| D-55 | D-S037-02-9 | Regeln von `validiPlanon` | `plan-empty`, `plan-too-many-screens` (Pfad `/ekranoj`), `slug-invalid`, `slug-duplicate` (beim zweiten Vorkommen, `/ekranoj/<i>/slug`), `text-empty` (`/celo`, `/ekranoj/<i>/titolo|celo`), `edge-unknown-screen` (`/kantoj/<i>/de|al`), `edge-duplicate` (`/kantoj/<i>`); alle Probleme auf einmal, in Dokumentreihenfolge, Meldungen deutsch. | `plano.ts` | angewandt |
| D-56 | D-S037-02-10 | Prüfung des Modulgraphen (AC-10) | Kommentare werden vor der Suche entfernt (ein Kommentar lädt nichts); ein berechneter Spezifizierer in `import()` ist selbst ein Verstoß; `@fundamento/modelo` nur als `import type`/`export type`; geprüft werden alle Nicht-Test-Dateien unter `src/**` einschließlich `src/test-doubles/**` (strenger als nötig) und alle vier Abhängigkeitsfelder der `package.json`. Negativprobe als Textprobe im Test; zusätzlich lokal an einer Mutation rot gesehen. | `arkitekturo.test.ts` | angewandt |
| D-57 | D-S037-02-11 | Namen der eingespeisten Abhängigkeiten (C-6) | `EkranojDeps = { chat, tools?, taksilo, bildigilo?, marko, nun, log }`; `Bildigilo.render` nimmt ein `EkranaDokumento { slug, html, dosiero? }` statt eines bloßen Texts (S037-04 kann so von der Platte öffnen, D-24). Ergebnis: `Rondo = Record<slug, RondoEkrano>`, `RondoEkrano.verdaEkde?` (D-26), `Restanta { ekrano, regulo, loko, kialo }`, `Peno` mit den Feldnamen von nordstelo `AgentEffort`, `Manko` (C-7) schon jetzt als Typ, `Haltigo`. | ekranoj, C-6 | angewandt |
| D-58 | D-S037-02-12 | Lockfile im roten Commit | Der rote Commit enthält `pnpm-lock.yaml` nicht (wie im Ticket: Lockfile mit dem grünen Commit); lokal war `pnpm install` nötig, um die roten Tests laufen zu lassen. | Commits | angewandt |
| D-59 | D-ORCH-1 | `packages/modelo/src/workspace.test.ts` mit dem neuen Paket rot (Befund S037-02-1) | Orchestrator-Entscheidung nach S037-02: die Datei steht nicht in der Tabu-Liste der Produkt-Spec (dort nur `modelo/src/gvidanto/**`, `modelo/src/eroj/**`); Graubereich wie D-15, genau eine Zeile, umgesetzt von S037-03 (D-60), in der Konfliktprüfung geführt. Abweichung von §2.8 der Implementierungs-Spec („`packages/modelo/**` außer dem einen Wort“). | Graubereich | angewandt, **zu bestätigen** |
| D-60 | D-S037-03-1 | `packages/modelo/src/workspace.test.ts` (D-59) | Eine Zeile `ekranoj: "@fundamento/ekranoj",` in `PACKAGES`, alphabetisch nach `cli`; Graubereich wie D-15 (Orchestrator-Entscheidung, die Datei steht nicht in der Tabu-Liste der Quell-Spec). Kein eigener roter Commit: rot war der Test schon ab `999cf1c7` (Zeile am Kopf `a6558e6a` erneut aufgenommen). Grün `d944ff68`, Modelo 4147/4147. | Graubereich | angewandt, **zu bestätigen** |
| D-61 | D-S037-03-2 | Wem gehört das Budget (AC-9) | `kuruEkranojn` legt **ein** metiejo-`Budget(maksTokenoj)` an und gibt es jeder Anfrage mit: `ChatModel.send(messages, tools?, budget?)` (dritter Parameter additiv). Vor jeder Anfrage `budget.ensure()` (Schätzung = größte Anfrage bisher, metiejo-Semantik), danach wird gebucht, falls das Modell nicht selbst bucht; der echte Adapter reicht das Budget an `chatCompletion`, das prüft und bucht (keine Doppelbuchung). | `kostoj.ts`, `tipoj.ts` | angewandt |
| D-62 | D-S037-03-3 | Modellwache und Preis | `chatModelDe({ provider, gate?, … })` ruft `gardiModelon(provider)` beim Erzeugen – vor jeder möglichen Anfrage; `kuruEkranojn` prüft zusätzlich `chat.modelo`, wenn gesetzt. `ChatModel.modelo` (additiv, `provider.toString()`) liefert den Preis; ohne ihn „Kosten unbekannt“. Gate und Ledger (`Pordisto`, `LIMOJ`, `AnfragoLedger`) baut der Aufrufer (S037-05). | `agento.ts`, `rondoj.ts` | angewandt |
| D-63 | D-S037-03-4 | Werkzeugliste | Genau die zwölf Bauwerkzeuge (`describe`, `list_eroj`, `suggest_ero`, `get_ero`, `list_sxablonoj`, `get_sxablono`, `get_token`, `search_tokens`, `list_reguloj`, `explain_regulo`, `describe_term`, `check_usage`). Nicht angeboten: die Markenwerkstatt (`save_agordo`, `preview_agordo`, `propose_agordo`) und die Werkzeuge über Marken, Werte und Pfade (`list_aspektoj`, `list_dimensioj`, `resolve`, `validate`, `check_contrast`, `explain`, `list_jugxoj`, `derive_name`) – ein Fragment nennt keine Marke und keinen Wert (AC-7). Die Liste gilt dreifach: in der Brücke (`list` und `call`), in `kuruEkranojn` für jede eingespeiste Brücke, im Bau-Gespräch (schreibende Werkzeuge nie). Der Kindprozess bekommt die Standardumgebung des SDK (keine Anbieter-Schlüssel), sein stderr geht zeilenweise ins Log. | `mcp-kliento.ts`, `rondoj.ts`, `agento.ts` | angewandt |
| D-64 | D-S037-03-5 | Lücken des Agenten | Ein umzäunter Block ```` ```mankoj ```` mit einer JSON-Liste (oder JSON-Zeilen) `{speco, nomo, ekzemplo, propono}`; er wird vor dem Herauslesen des Markups entfernt. Je Lauf ein `Manko` (C-7 unverändert) je Art und Name: `ofteco` = Zahl der Screens, die ihn nennen (je Screen einmal über alle Runden), `taskoj` = deren Slugs, `celo` aus der Art (`ero` → `eroj-rondo-6/7`, `sxablono` → `muster-rondo-2`, `ilo` → `gvidanto`). | `agento.ts` | angewandt |
| D-65 | D-S037-03-6 | Plananfrage | Ohne Werkzeuge, höchstens zwei Anfragen: die zweite bei mehr als fünf Screens (D-38) oder einem sonst ungültigen Plan (mit den Problemen); ein zweiter zu langer Plan wird auf die ersten fünf gekürzt, Kanten zu weggelassenen entfernt, beides in `notoj`; ein zweiter sonst ungültiger Plan → `haltigo: "eraro"`, Probleme in `notoj`, keine Runde. Slugs werden normalisiert (`slugDe`). Namensliste: Slugs aus den Namen fest, Titel = Name (oder der des Agenten), Zweck vom Agenten (sonst der Name), nur Kanten zwischen den Namen; mehr als fünf, doppelte oder leere Slugs → `NevalidaEnigo` vor Schätzung und Anfrage (Pfad `/ekranoj`). | `agento.ts`, `rondoj.ts` | angewandt |
| D-66 | D-S037-03-7 | Runden und D-26 | Runde 1 baut alle Screens, jede weitere nur die nicht grünen (mit Fragment und Befunden); grüne werden weder neu gebaut noch neu bewertet und in späteren Runden mit `verdaEkde` fortgeschrieben. Sind alle Screens vor Runde 3 grün, endet der Lauf; die übrigen Runden bis `MAKS_RONDOJ` werden als fortgeschriebene Runden angehängt (der Bericht hat so immer eine „Runde 3“), `faritajRondoj` nennt die gebauten. Ein angehaltener Lauf wird nicht aufgefüllt. | `rondoj.ts` | angewandt |
| D-67 | D-S037-03-8 | Befunde und Restbefunde | `Trovo { regulo, loko, mesagxo, sugesto, kialo }` aus: `check_usage`-Fehlern (Regulo-Name und kialo), Lücken der Bewertung (`Taksado.mankoj`, deutsche Texte je Art), axe je Render, `axe-nekontrolita`, Navigation (`navigado-mankanta`, `navigado-morta`), dazu K1/K5 allgemein, wenn keine Lücke sie erklärt. Hinweise (`warning`/`info`) bleiben in `malobservoj`, nicht in den Befunden. `restantaj` = Befunde der nicht grünen Screens der letzten gebauten Runde, dazu `nicht-gebaut` für Screens ohne Stand. | `rondoj.ts` | angewandt |
| D-68 | D-S037-03-9 | Halt | `CostLimitReached` → `max-tokens`, `DayLimitReached` → `tagolimo` (per `instanceof`, sonst per Name), jeder andere Fehler im Modellteil → `eraro`; die Meldung (ohne Stack) in `notoj`, die Runde mit den bis dahin gebauten Screens wird noch geprüft und behalten; nichts wird geworfen. Geworfen werden nur Eingabeprobleme (`NevalidaEnigo`) und die Modellwache (`MalpermesitaModelo`) – Bedienfehler, Exit 2 im cli. | `rondoj.ts`, `kostoj.ts` | angewandt |
| D-69 | D-S037-03-10 | Schätzung | `taksiKostojn` mit den Konstanten `TOKENOJ_EKRANO_RONDO_F` 40 000, `TOKENOJ_EKRANO_RONDO_0` 2 000, `TOKENOJ_PLANO` 5 000 (Reihe K, Quelle im Kommentar); alle Tokens zum höheren Preis von Ein- und Ausgabe (vorsichtig, keine Aufteilung); Zahl der Screens offen → 5. Sichtbar vor der ersten Anfrage: erste Logzeile, Haken `EkranojDeps.takso`, `rezulto.takso`; `taksoPorEnigo` für das cli (D-37 fragt vor `kuruEkranojn`). | `kostoj.ts`, `rondoj.ts` | angewandt |
| D-70 | D-S037-03-11 | Naht zu S037-04 | `EkranojDeps.eligo?: EkranojEligo { dokumento?, bildigita?, rondo?, fino? }` (additiv); ohne sie schreibt der Lauf nichts, ein Dokument ist das Fragment in einer schlichten Seite ohne Marke (`simplaDokumento`). `RondoEkrano` trägt additiv `fragmento`, `fakto` (D-33), `malhelpoj`, `trovoj`; `EkranojRezulto` additiv `takso`, `faritajRondoj`, `notoj`. `deps.marko` ruft S037-03 nicht auf. | `tipoj.ts`, `rondoj.ts` | angewandt |
| D-71 | D-S037-03-12 | Ohne Renderer | Fakten aus dem Markup (`statikaFakto`, kleiner deterministischer Leser): Bewertung, `check_usage` und Navigation laufen, ohne Render ist axe nie geprüft – kein Screen wird grün (Befund `axe-nekontrolita`). Fehler des Renderers bei einem Screen → Notiz und Fakten aus dem Markup. | `fakto-statika.ts`, `rondoj.ts` | angewandt |
| D-72 | D-S037-03-13 | `check_usage`-Instanzen (D-32) | Nur Ero-Instanzen, gelesen wie nordstelo (Props nach Skemo typisiert, benannte Slots, Label, nächster `fm-*`-Vorfahr als Container, Sprache); keine Sxablono-Instanzen (bräuchte die Regionen aus `get_sxablono`; offen für später). `get_ero` einmal je Name und Lauf (auch Fehltreffer); ohne Ero kein Aufruf; ein Fehler des Werkzeugs → Verletzung `check-usage-unavailable` (Fehler, sichtbar, nie grün). | `instancoj.ts` | angewandt |
| D-73 | D-S037-03-14 | Grenzen des Gesprächs | Wie nordstelo: 24 Werkzeugaufrufe je Gespräch, 20 000 Zeichen je Werkzeugantwort, Temperatur 0,2, Anfrage-Timeout `min(angegeben, 180 000 ms)` (`PETO_TEMPOLIMO`); 429 und Wiederholungen bleiben in `chatCompletion`. Nichts angehoben, keine neue Grenze außer den Werten der Quell-Spec. | `agento.ts` | angewandt |
| D-74 | D-S037-03-15 | Variante 0 (D-34) | Ohne Werkzeuge, ohne Systemtext, ohne Prompt und Liste des Gvidanto, ohne `check_usage`; der Auftrag endet mit `PROMPT_0` (gleicher Text wie nordstelo); das Fragment ist das ganze Dokument und geht unverändert an den Renderer. | `agento.ts`, `rondoj.ts` | angewandt |
| D-75 | D-S037-03-16 | Zusätzliche Datei | `src/fakto-statika.ts` neben den fünf genannten Modulen (im Paket, eigene Zone). | ekranoj | angewandt |
| D-76 | D-S037-04-1 | Screens unter `file://` (D-24) | Das Eroj-Bündel des Markenbaus (Make-Kit `element.js`: ES-Modul ohne Importe, definiert jede Ero beim Laden) wird einmal je Lauf als **klassisches Skript** `marko/ekranoj-eroj.js` geschrieben (`klasikaSkripto`: letztes `export { … }` entfernt, Rumpf in einer strikten Funktion, Kopfkommentar „Generated“) und mit `<script src="../marko/ekranoj-eroj.js">` geladen, die Stile mit `<link rel="stylesheet">`. Grund: Chromium verweigert `<script type="module" src>` unter `file://`, klassische Skripte und Stylesheets nicht (lokal geprüft: `customElements.get("fm-butono")` definiert, Hintergrund der Hauptaktion komuna `rgb(27, 27, 27)`, provo `rgb(98, 65, 154)`). Das Bündel inline wie die Vitrino hätte 1,4 MB in jedem Screen und jeder Runde bedeutet (≈ 30 MB je Lauf). Ist das Bündel nicht eigenständig (Importe, `import.meta`), entsteht keine Datei und eine Notiz im Bericht. Das Fragment bleibt markenfrei. | `konstruo.ts`, `eligo.ts` | angewandt |
| D-77 | D-S037-04-2 | Markenbau im Lauf | `Marko.konstrui(<out>/marko)` gibt `MarkoKonstruo { css, skripto? }` mit Pfaden relativ zu `marko/` zurück (absolute Pfade darin werden relativ gelesen). `kuruEkranojn` ruft ihn **einmal je Lauf**, nach der Schätzung und vor der ersten Anfrage, nur für Variante F (D-34) und nur mit `eligo`; danach der neue, additive Haken `EkranojEligo.komenco({ enigo, varianto, lingvo, bildigilo, marko? })`. Ein fehlschlagender Markenbau wird geworfen (Einrichtungsfehler, vor jeder Anfrage). | `rondoj.ts`, `tipoj.ts` | angewandt |
| D-78 | D-S037-04-3 | Rahmen | Kopfkommentar „Generated by @fundamento/ekranoj“; `<html lang data-fm-aspekto="<marke>" data-fm-color-scheme="light">`, Viewport-Meta, Titel; im `body` zuerst `<p data-ekranoj-kadro><a href="<radiko>superrigardo.html">Zur Übersicht</a></p>` (en: „To the overview“), dann das Fragment wörtlich zwischen `<!-- ekranoj:fragmento -->` und `<!-- /ekranoj:fragmento -->`. `radiko` = `../` in `ekranoj/`, `../../` in `rondoj/<n>/`. Kein Zeitstempel. Zwei Marken unterscheiden sich in einem Screen nur in `data-fm-aspekto` (Test). Variante 0: das Dokument des Agenten unverändert, nur der Rücklink nach `<body…>`; ein Fragment ohne Dokument kommt in eine Seite ohne Marke. | `konstruo.ts` | angewandt |
| D-79 | D-S037-04-4 | Renderer | Seiten werden von der Platte geöffnet: der Haken `dokumento` schreibt `rondoj/<n>/<slug>.html` vor dem Rendern und gibt `dosiero` mit, so prüft jede Runde auch `file://`; ohne `dosiero` `setContent`. Nur `file:`, `data:`, `blob:`, `about:` erlaubt, alles andere abgebrochen. Je Aspekto hell und dunkel, Kontrast Standard (D-39), Medien und `data-fm-*` wie nordstelo; je Modus erst das Foto (erste Aspekto), dann axe mit den WCAG-2.2-A/AA-Tags und `.exclude("[data-ekranoj-kadro]")`; danach wird der Rahmen entfernt und das Light-DOM und der ARIA-Snapshot gelesen. `bytes` = Text des Agenten. `goto` 30 000 ms wie nordstelo, nichts darüber. Kein Warten auf eine benannte Ero (das klassische Skript definiert vor dem Body), nur `document.fonts.ready` und zwei Frames. | `bildigilo.ts` | angewandt |
| D-80 | D-S037-04-5 | Ohne Browser | `kreiBildigilon()` gibt `undefined`, wenn `playwright` oder `@axe-core/playwright` nicht ladbar ist oder Chromium nicht startet, mit genau einer Logzeile „Kein Browser: …“; der Aufrufer reicht dann keinen `bildigilo` weiter. Bericht: genau ein Satz („Kein Browser verfügbar: keine Bildschirmfotos, axe nicht geprüft, kein Screen kann grün werden.“), axe-Spalten „nicht geprüft“, in `raporto.json` `axe.hela/malhela = null`, `bildigilo: false`, keine Fotos; nie grün (D-04). | `bildigilo.ts`, `eligo.ts` | angewandt |
| D-81 | D-S037-04-6 | Navigation mit dem Link-Ero (Befund 1 aus S037-07) | `navigado` additiv: `NavigadoOpcioj.ligilaAtributoj` (Tag → Prop mit dem Ziel), `celoDeElemento` (`href` gewinnt, sonst die Prop). Vorgabe ist der dokumentierte Rückfall `LIGILAJ_ATRIBUTOJ = { "fm-ligilo": "to" }`. Im Lauf liest `ligilajAtributojDe(faktoj, legi)` die Karte aus der Skemo über MCP (`get_ero`): eine Ero mit `a11y.role = "link"` und genau einer Pflicht-String-Prop trägt dort ihr Ziel; eine lesbare Skemo überschreibt den Rückfall. Dieselbe Regel wie nordstelo `faktojPorNavigado` (S037-13 prüft die Gleichheit). Die gespeicherten Fakten bleiben ein treuer DOM-Zwilling (nichts umgeschrieben, Test). `EroSkemo` additiv `rolo`, `props[].required`. Berührt S037-03-Dateien nur additiv (`instancoj.ts`, `rondoj.ts`). | `navigado.ts`, `instancoj.ts`, `rondoj.ts` | angewandt, Abgleich mit Kette B in S037-13 |
| D-82 | D-S037-04-7 | Schreiben des Ordners | `eligoDe({ commit? })` schreibt während des Laufs (Dokumente, Fotos, Runden) und am Ende alles noch einmal aus dem Ergebnis – so ist auch ein Teillauf vollständig, und die fortgeschriebenen Runden (D-26) haben Dateien. Endscreen = letzte Runde mit Fragment; Fotos je Render überschrieben (letzter gerenderter Stand). JSON mit sortierten Schlüsseln (`stabilaJson`), Lauf-ID = Ordnername (`raporto.json` `id`, Titel von `raporto.md`); sonst keine Zeit im Inhalt. | `eligo.ts` | angewandt |
| D-83 | D-S037-04-8 | `raporto.json` | Felder: `id`, `enigo {frazo, marko, varianto, lingvo, maksTokenoj, commit?, ekranoj?}`, `bildigilo`, `plano`, `ekranoj[] {slug, titolo, celo, dosiero?, verda, verdaEkde?, bildoj?}`, `elementoj[] {tag, nombro, ekranoj}`, `rondoj[] {n, farita, navigado {kvoto, mankantajKantoj, mortajLigiloj}, ekranoj{slug: {k, total, mankoj, k7 {bytes}, malobservoj, axe {hela, malhela}, navigado, verda, verdaEkde?, malhelpoj}}}`, `restantaj`, `mankoj`, `peno {inputTokens, outputTokens, requests, toolCalls, ms, bytes}`, `kosto {usd?}`, `haltigo` (`null` ohne Halt), `haltigoTeksto`, `faritajRondoj`, `dauxroMs`, `takso?`, `notoj`. Unbekannter Preis: `usd` fehlt (nie 0, nie `null`), so dass `mezuri` (S037-09) auf Tokens × Preis zurückfällt. | `eligo.ts` | angewandt |
| D-84 | D-S037-04-9 | Navigation je Runde im Bericht | Der Anteil des Ablaufs je Runde wird aus den Screens der Runde nach D-28 berechnet (`fluaNavigado`: geplante Kanten minus fehlende minus tote); `neatingeblaj` steht nicht im Bericht (die Übersicht verlinkt jeden gebauten Screen). | `eligo.ts` | angewandt |
| D-85 | D-S037-04-10 | `test:browser` | Eigene Konfiguration `vitest.browser.config.ts` (nur `src/**/*.browser.test.ts`), baut vorher ekranoj-Abhängigkeiten und das cli; die echten Marken baut `fm projekcioj build --celo css,make-kit` (komuna; provo mit `packages/modelo/test/fixtures/valid/aspekto-provo/fundamento.config.json`) aus dem cli dieses Checkouts – keine neue Paket-Abhängigkeit. Zeitgrenzen 120 000 ms = Testgrenze der Eroj-Playwright-Suite (`packages/eroj/playwright.config.ts`), keine Wiederholung. Die Standard-Suite schließt `*.browser.test.ts` aus. Läuft aus `/tmp/s037-a` (Messsperre). | `vitest*.config.ts`, `package.json` | angewandt |
| D-86 | D-S037-04-11 | Übersicht | Schlichtes semantisches HTML ohne getippte Ero-Namen oder Props, gleicher Kopf wie die Screens (Marke und Eroj geladen); je geplantem Screen eine Kachel mit Titel (Link, wenn gebaut), Zweck, Stand (grün / nicht grün / nicht gebaut) und dem hellen Foto; Link auf `raporto.md`. | `konstruo.ts` | angewandt |
| D-87 | D-S037-04-12 | Renderer-Attrappe | `test-doubles/bildigilo.ts` (S037-03) liest die Elemente jetzt aus den Fragment-Markierungen, damit der Rücklink des Rahmens auch in Attrappen-Läufen kein Fakt ist (wie der echte Renderer). | Tests | angewandt |
| D-88 | D-S037-04-13 | Roter Commit | Module nur mit Typen, Abhängigkeiten, Lockfile, Konfigurationen und das Skript `test:browser` schon im roten Commit, damit auch `test:browser` an der fehlenden Funktion rot ist und nicht an fehlenden Paketen. | Commits | angewandt |
| D-89 | D-S037-05-1 | Testbarkeit des Befehls | `ekranojKomando(anstatauxoj?: Partial<EkranojMedio>)`; `EkranojMedio` bündelt alles außerhalb des Befehls (`legiEnv`, `tty`, `demandi`, `chat`, `gvidanto`, `taksilo`, `marko`, `bildigilo`, `markoNomo`, `nun`, `commit`); nicht gegebene Teile sind die echten (`realaMedio()`), der angemeldete Befehl ist `ekranojKomando()`. Tests ersetzen alles Schwere, der Rauchtest nur das Modell und die `.env`. Der Lauf selbst ist immer das echte `kuruEkranojn`. | `commands/ekranoj.ts` | angewandt |
| D-90 | D-S037-05-2 | D-30 umgesetzt | `@fundamento/ekranoj` und `@fundamento/nordstelo` nur per `await import()` in `run` bzw. in den echten Abhängigkeiten; ihre Typen nur als `import type` (entfällt beim Übersetzen). metiejo, modelo und projekcioj statisch – `fm` lädt sie für andere Befehle ohnehin. Wächtertest AC-11 grün; Fehlerprobe: ein statischer Import von nordstelo macht ihn rot (2 von 4). | `commands/ekranoj.ts` | angewandt |
| D-91 | D-S037-05-3 | DOM-Typen von nordstelo im cli (Risiko §6) | Kein DOM-`lib` im cli und kein lokaler Typ-Ersatz: der dynamische Import ist über die erzeugten `.d.ts` von nordstelo typisiert, `skipLibCheck: true` (Basis) prüft deren DOM-abhängige Deklarationen nicht, und das einzige genutzte Symbol `ekranoTaksilo` hat DOM-freie Typen (Modelo, NordsteloFile, Kriterio, `Taksilo` von ekranoj). `tsc --noEmit` im cli sauber. | cli | angewandt |
| D-92 | D-S037-05-4 | `--max-tokens` ohne Angabe | 250 000 Tokens (`EKRANOJ_MAKS_TOKENOJ`) = Scheibe eines Abnahmelaufs (D-25, ≈ 0,05 $); niedriger als jede Grenze der Messung, nichts angehoben. | `commands/ekranoj.ts` | angewandt |
| D-93 | D-S037-05-5 | Reihenfolge der Prüfungen | Aufruf → `kontroliEnigon` (ohne die Regel `gvidanto-missing`: den Gvidanto startet der Befehl selbst erst nach der Bestätigung) → `.env` (`<baseDir>/.env` ohne `--env`) → `providerOf` + `kontroliModelon` (Exit 2) → Schätzung (stdout, mit `--json` stderr) → Bestätigung. Die Schätzung steht danach noch einmal als erste Logzeile des Laufs (stderr). | `commands/ekranoj.ts` | angewandt |
| D-94 | D-S037-05-6 | Marke einer Konfiguration | Name aus `aspekto.json` des letzten Aspekto-Pakets von `projectModeloSource(<config>)` (das eigene; komuna steht immer vorn), ohne `--config` komuna (`markoNomoDe`). Der Gvidanto bekommt `--config <absoluter Pfad>` oder keine (Modelo des Repos). | `commands/ekranoj.ts` | angewandt |
| D-95 | D-S037-05-7 | Markenbau | `buildProjekcioj({ outDir: <out>/marko, source, celoj: ["css", "make-kit"] })` direkt in `marko/` (kein Kopieren, Hinweis S037-04: ≈ 7,6 MB weniger); `css/fundamento.css`, Bündel `make-kit/<marke>/dist/element.js`, sonst das erste vorhandene. Ungültige Modelo → Fehler vor der ersten Anfrage → Exit 2. | `commands/ekranoj.ts` | angewandt |
| D-96 | D-S037-05-8 | Ordner und Ledger | Ohne `--out`: `<baseDir>/.fundamento/ekranoj/<JJMMTT-HHMM>-<slug>` in UTC (wie `laufId` der Messung), Slug = die ersten drei Wörter des Satzes (`slugDe`, ≤ 40 Zeichen), bei Gleichstand `-2`, `-3` …; Ledger ohne `--ledger` `<baseDir>/.fundamento/ekranoj/anfragoj.json` (D-21) mit `Pordisto`/`LIMOJ` wie `pnpm nordstelo`. | `commands/ekranoj.ts` | angewandt |
| D-97 | D-S037-05-9 | Exit-Codes | 0, wenn mindestens eine Runde gebaut ist (`faritajRondoj > 0`, auch beim Halt an `--max-tokens`); 1, wenn kein Screen gebaut wurde (auch Halt bei der Plananfrage), Bericht trotzdem verlinkt; 2 für Aufruffehler (`UsageError`: Optionen, Satzanzahl, `--max-tokens`, fehlende Konfiguration) und Einrichtung (Eingabe, `.env`, Modell, nicht bestätigt, Fehler beim Start von Gvidanto, Bewertung oder Markenbau). | `commands/ekranoj.ts` | angewandt |
| D-98 | D-S037-05-10 | Rückfrage im Terminal (D-37) | „Lauf starten? [j/N]“ auf stderr; ja = `j`, `ja`, `y`, `yes`; alles andere startet nichts, Exit 2. | `commands/ekranoj.ts` | angewandt |
| D-99 | D-S037-05-11 | Untermodus `mankoj` bis S037-06 | Ist das erste Argument genau `mankoj`, ist es der Untermodus (D-29), nie ein Satz; bis S037-06 endet er mit einem Aufruffehler (Exit 2) ohne `.env`-Zugriff und ohne Anfrage. | `commands/ekranoj.ts` | angewandt, S037-06 ersetzt den Rumpf |
| D-100 | D-S037-05-12 | Schlüssel | Jede Logzeile, Fehlermeldung und die Zusammenfassung laufen durch `provider.redact`; der Schlüssel lebt nur im `Provider`; der Gvidanto-Kindprozess erbt keine Schlüssel (D-63). Test: Schlüssel der `.env`-Attrappe weder in stdout/stderr noch in einer geschriebenen Datei. | `commands/ekranoj.ts` | angewandt |
| D-101 | D-S037-05-13 | Exportzeile in `nordstelo/src/index.ts` | Biome (`organizeImports`) sortiert die `export *`-Zeilen: die eine neue Zeile steht nach `./agent.js` statt am Ende. Abweichung vom Wortlaut „angehängt“, weiterhin genau eine Zeile. | `nordstelo/src/index.ts` | angewandt |
| D-102 | D-S037-05-14 | Rezept und Option `tasko` des Adapters (C-8) | `ekranoTaksilo({ modelo, katalogo, kriterioj?, tasko? })`: `scoreBoth({ facts: fakto, tasko: { id = name = [<tasko>/]<slug>, kriterioj: kriterioj[slug] ?? [] }, variant, modelo }, katalogo).nova` → `{ k, total, mankoj: gaps }`; `sxablono`/`eroj` des Speicher-Tasko leer (von `score()` nicht gelesen). Gleich dem Rezept von `taksiloDeKatalogo` (S037-07, `score()` mit `pezoj` und Tor `multmarkeco.kriterioj`) und `taksiloPorMezuro` (S037-08). Die additive Option `tasko` benennt den Tasko wie `taskoDe` der Messung, damit Kriterien-Lücken (`<ablauf>/<screen>: …`) in beiden Berichten gleich lauten. | `nordstelo/src/ekrano-taksilo.ts` | angewandt |
| D-103 | D-S037-05-15 | Roter Commit | Befehls- und Adaptermodul nur mit Typen, Abhängigkeiten und Lockfile schon im roten Commit, `cli.ts` und `index.ts` erst im grünen (so ist auch „`fm --help` nennt ekranoj“ rot). | Commits | angewandt |
| D-104 | D-S037-06-1 | K1 unter `file://` (Befund 1 aus S037-05) | axe-core lädt vor jedem Lauf nur noch die Medien vor: `AxeBuilder(…).options({ preload: { assets: ["media"] } })` vor `withTags` (`AXE_ANTAUXSXARGO`). Das CSSOM braucht in axe-core 4.13.0 nur `css-orientation-lock`, eine experimentelle Regel, die die WCAG-Tags nie laufen lassen (axe schließt `experimental` ohne ausdrückliche Nennung aus); die Medien braucht `no-autoplay-audio` (wcag2a) – sie bleiben. Verworfen: Konsole nur bis zum ersten axe-Lauf sammeln (verlöre echte Fehler beim Umschalten hell/dunkel) und die CORS-Meldung herausfiltern (hängt am Wortlaut von Chromium). So bleiben alle echten Konsolenfehler sichtbar, und die Ergebnisse gleichen dem Render von nordstelo. Keine Zeitgrenze gesetzt. | `bildigilo.ts` | angewandt |
| D-105 | D-S037-06-2 | Naht im roten Commit | Der rote Commit `6c256265` enthält die Option `importiAxe` (wie `importi` für Playwright, ohne Verhaltensänderung), damit der browserfreie Test eine axe-Attrappe einsetzen kann, die der Vorlade-Regel von axe-core folgt (`test-doubles/retumilo.ts`). Rot zusätzlich in echtem Chromium (`test:browser`: Konsolenzeile „Access to XMLHttpRequest at 'file:///…/marko/css/fundamento.css' … blocked by CORS policy“). | Tests | angewandt |
| D-106 | D-S037-06-3 | Quellen einer Lücke je Lauf (C-7) | K5-Lücken (`rebuilt-ero`, `raw-value`) und `check_usage`-Fehler nur aus dem **letzten Stand** jedes Screens (was der Agent in einer späteren Runde mit vorhandenen Mitteln löste, war keine Lücke von Fundamento); `suggest_ero` ohne Treffer und Lücken des Agenten aus allen Runden. `ofteco` je Lauf = Zahl der Screens mit der Lücke, `taskoj` = deren Slugs; `check-usage-unavailable` (Werkzeug nicht erreichbar) ist keine Lücke. | `mankoj.ts`, `rondoj.ts` | angewandt |
| D-107 | D-S037-06-4 | Regeln für Art, Ziel, Vorschlag | Art: `rebuilt-ero` → `ero` („Ero für <tag>“); `raw-value` einer Layout-Eigenschaft (`margin*`, `padding*`, `gap`, `row-gap`, `column-gap`, `width`, `height`, `min-/max-width/height`, `inset*`, `top/right/bottom/left`) → `sxablono` („Layoutmittel für <eigenschaft>“), jede andere Gestaltungseigenschaft → `ero` („Gestaltung über <eigenschaft>“); `check_usage` → `ero` („Regulo <name>“, nur Ero-Instanzen, D-72); `suggest_ero` ohne Treffer → `ero` (Name = gesuchtes Ziel); Agent → wie gemeldet. Ziel immer aus der Art: `ero` → `eroj-rondo-6/7`, `sxablono` → `muster-rondo-2`, `ilo` → `gvidanto` (ein Ziel in der Eingabe wird überschrieben). Vorschlag: der des Agenten, sonst ein fester Satz je Quelle (Kopfkommentar von `mankoj.ts`). Gleiche Lücke = gleiche Art und gleicher Name ohne Groß-/Kleinschreibung und Leerraum. | `mankoj.ts` | angewandt |
| D-108 | D-S037-06-5 | `suggest_ero` ohne Treffer | Keine `suggestion`, keine `candidates` und keine Grenze, die auf eine andere Ero verweist; eine Grenze mit `action: "ask-human"` zählt als Lücke (am echten Gvidanto gesehen: „Fundamento hat noch keine Schrittanzeige, eine Person entscheidet“). Fehlerhülle oder Unlesbares ist kein Fehltreffer. Die Grenzregel kam nach einem Rauchtest gegen den echten Gvidanto in den grünen Commit; ihre zwei Prüfungen waren vor der Änderung rot (`expected false to be true`, `/tmp/s037-logs/s037-06-rot-grenze.log`). | `mankoj.ts` | angewandt |
| D-109 | D-S037-06-6 | Erfassen der `suggest_ero`-Aufrufe | Eine beobachtende Brücke um den Gvidanto je Screen-Bau in `rondoj.ts` (Antwort unverändert durchgereicht); `agento.ts` bleibt unverändert. Für den Abgleich gewünschter Werkzeuge merkt sich der Lauf die Namen **aller** gelisteten Werkzeuge (vor dem Filter der Bauwerkzeuge): ein gewünschtes Werkzeug, das der Gvidanto hat, ist keine Lücke. | `rondoj.ts` | angewandt |
| D-110 | D-S037-06-7 | Beispiel des Agenten | Das `ekzemplo` aus dem `mankoj`-Block bleibt so, wie der Agent es schrieb (Vertrag von S037-03); ohne Beispiel `<slug>.html`. | `mankoj.ts` | angewandt |
| D-111 | D-S037-06-8 | Zusammenführen über Läufe | `kunigiMankojn(ordner)`: jeder Ordner ist ein Laufordner (mit `mankoj.json`) oder enthält welche (rekursiv, sortiert; nicht in Laufordner hinein, nicht in `marko/`, `node_modules/`, `.git/`); derselbe Lauf zweimal zählt einmal. Aufgaben werden `<Lauf>/<Screen>` (Lauf = Pfad relativ zum Elternordner des genannten Ordners), vereinigt und sortiert; Beispiel und eigener Vorschlag vom ersten Lauf in dieser Ordnung – das Ergebnis hängt nicht von der Reihenfolge der Ordner ab. Fehler werden alle gesammelt, dann `MankojEraro` mit `Problemo[]` (`folders-missing`, `folder-missing`, `run-missing`, `mankoj-invalid`, `manko-invalid`); zusammengeführt wird dann nichts. | `mankoj.ts` | angewandt |
| D-112 | D-S037-06-9 | Tabelle | Spalten `\| # \| Art \| Lücke \| Anzahl \| Aufgaben \| Beispielstelle \| Vorschlag \| Ziel \|` (die Kennzahl hat `\| # \| Art \| Lücke \| Anzahl \|`, erweitert); Art = `speco`; `\|` und Zeilenumbrüche in Zellen maskiert; leere Liste = eine Zeile „keine Lücke“. Jeder Lauf zeigt seine Tabelle in `raporto.md` („Lücken (Teil 3)“, additiv in `eligo.ts`). | `mankoj.ts`, `eligo.ts` | angewandt |
| D-113 | D-S037-06-10 | Untermodus `fm ekranoj mankoj` | Nur `--out` und `--json`; jede Option eines Laufs (`--ja`, `--ekranoj`, `--config` …) → Aufruffehler (Exit 2). Keine Ordner → Aufruffehler (Exit 2). Probleme der Ordner → je Problem eine Zeile `Pfad Regel: Meldung Vorschlag` auf stderr, Exit 2, nichts geschrieben. Ausgabe: Kopfzeile und Tabelle; `--out` schreibt die Liste zusätzlich als JSON mit sortierten Schlüsseln (`stabilaJson`) und nennt die Datei; `--json` druckt `{ "mankoj": […] }`. Keine `.env`, kein Modell, kein Gvidanto. Der Test von S037-05 („mankoj“ ohne Ordner) erwartet jetzt den Aufruffehler des Untermodus. | `commands/ekranoj.ts` | angewandt |
| D-114 | D-S037-06-11 | Korrekturen an Tests im grünen Commit | Im grünen Commit `4d7a1b27`: erwartete Reihenfolge eines `mankojDeKuro`-Tests (Byte-Ordnung: „Gestaltung …“ vor „Layoutmittel …“), `new MarkoDouble("komuna")` (Argument fehlte), die Gvidanto-Attrappe als Funktion statt Klasse (der Modelo-Wächter `test-setup.test.ts` „has no `await` in a module-level statement“ las die Methode als Modulebene) und die zwei Prüfungen von D-108. Kein Test wurde abgeschwächt. | Tests | angewandt |
| D-115 | D-S037-06-12 | Clean-Room im Adapter-Test von S037-05 | Der Modelo-Check `check:clean-room` (AK-07) fand in `packages/nordstelo/src/ekrano-taksilo.test.ts` einen Hex-Wert, der als Fingerabdruck einer Vergleichsmarke gelistet ist (Modelo-Suite ab `a74125cf` rot: 6 Clean-Room-Tests). Kleine Korrektur in der Kette A (eigener, erfundener Wert; der Test braucht nur irgendeinen rohen Farbwert): `25932e8b` (grün); der rote Stand ist der bestehende Commit `a74125cf`. | `nordstelo/src/ekrano-taksilo.test.ts` | angewandt |
| D-116 | D-S037-06-13 | Grenzen-Suche `audit-ac4` neu | `$W/audit-ac4` ist jetzt ein Node-Skript (das Bash/awk-Original von S037-01 bleibt als `audit-ac4.s037-01-alt`): `awk -v` wertet Escapes aus, so wurde `Budget\(` zu einer offenen Klammer („illegal primary“). Drei Teile: Treffer (Muster von Spec 035 AC-4 und R-4), „geändert in bestehenden Dateien“ (Zahlen der entfernten und der hinzugefügten Zeilen eines Hunks verschieden, oder eine Zeile mit Grenzbezug entfernt – muss leer sein) und „neue Grenzen“ mit Urteil gegen die vergleichbare Grenze, deren Wert aus dem Basis-Commit gelesen wird (gleich/darunter, nie darüber); Ergebnis „sauber“ = Exit 0. Fehlerprobe in einem Probe-Repo: `timeout: 30_000 → 45_000` und `BILDIGO_TEMPOLIMO = 60_000` → „NICHT sauber“ (Zahl geändert; DARÜBER). | Schutzwerkzeug | angewandt |
| D-117 | D-S037-06-14 | PR A nicht als Entwurf | Im Repo gibt es keine Regel, die Entwürfe verlangt (`.github/workflows` ohne Bedingung auf `draft`); PR A wird regulär geöffnet, nicht gemergt, kein Auto-Merge. | PR A | angewandt |
| D-118 | D-S037-06-15 | Erste Füllung der Lückenliste | Aus den Rauchläufen mit Attrappen-Modell (kein Modellaufruf): `fm ekranoj mankoj /tmp/s037-logs/smoke /tmp/s037-logs/s037-04-smoke`. Die Läufe von S037-04/05 entstanden vor S037-06 und tragen nur die Lücken des Agenten (leer); aussagekräftig ist nur der Lauf von S037-06. S037-12 ersetzt die Liste durch die Läufe von S037-10. | plan.md | angewandt |
| D-119 | D-S037-07-1 | Inhalt des Katalogs „ganzer Ablauf“ | Fünf Abläufe in der Reihenfolge der Lieferliste 2.1, 17 Screens, 26 geplante Kanten: `anmelden-und-konto` (anmelden, registrieren, passwort-vergessen, konto; 6 Kanten), `liste-filter-detail` (standards-liste, standard-detail, standard-verlauf; 4), `formular-in-schritten` (antrag-angaben, antrag-termin, antrag-pruefen, antrag-bestaetigt; 6), `einstellungen-konto` (allgemein, benachrichtigungen, team; 6), `uebersicht-kennzahlen` (kennzahlen, kennzahl-detail, kennzahlen-bericht; 4). Eher 3–4 als 5 Screens wegen D-25; Inhalte erfunden und neutral, Texte deutsch und englisch. | `nordstelo/src/ablauf/katalogo.ts` | angewandt |
| D-120 | D-S037-07-2 | Kennungen | Slugs sind die Kennungen (D-23), Ablauf- und Screen-Slugs in einem Namensraum eindeutig; der Ablauf „Einstellungen“ heißt `einstellungen-konto`, weil `einstellungen` schon eine Aufgabe im Katalog der Modelo ist. | `katalogo.ts` | angewandt |
| D-121 | D-S037-07-3 | Was „gültig“ über die Spec hinaus heißt | `validiKatalogon` verlangt zusätzlich je Screen ein Kriterium, das Variante 0 entscheidet (sonst K6 in 0 `null`), und je Screen eine aus- und eine eingehende Kante (sonst misst D-05 an ihm nichts; daher die Kante `antrag-bestaetigt → antrag-angaben`). Regeln `ablauf-task-count`, `ablauf-screen-count`, `ablauf-slug-duplicate`, `ablauf-criterion-missing`, `ablauf-criterion-variant-0` plus die Regeln von `validiPlanon` unter `/taskoj/<i>…`. | `katalogo.ts` | angewandt |
| D-122 | D-S037-07-4 | Tasko im Speicher (D-23) | `taskoDe(tasko, ekrano)`: `id` = `name` = `<ablauf>/<screen>`, Kriterien `<ablauf>/<screen>/<n>`; Sxablono und Eroj je Screen nur als Hinweis, über `checkNordstelo` gegen die Modelo geprüft; `kriteriojDe(tasko)` liefert die Kriterien je Slug für den Adapter (C-8). Nichts in `ids.lock.json` oder `data/**`. | `katalogo.ts` | angewandt |
| D-123 | D-S037-07-5 | Zweck eines Elements | Über die ARIA-Rolle: `role`-Attribut, sonst die Rolle der Skemo (`a11y.role`), sonst die implizite Rolle des nativen Elements – so finden F und 0 dieselben Zwecke. | `sxablonoj-samaj.ts` | angewandt |
| D-124 | D-S037-07-6 | Signatur je Zweck | F: Ero-Tag und die Enum-Props, nach denen die Skemo das Aussehen gestaltet (`parts.*.by`), fehlende mit dem Default, sortiert; Sxablono oder unbekanntes `fm-*` nur der Tag. 0 und native Elemente: Tag und sortierte Klassen. Kein Prop-Name getippt. | `sxablonoj-samaj.ts` | angewandt |
| D-125 | D-S037-07-7 | Welche Zwecke, welcher Vertreter | Hauptnavigation (äußerste `navigation` mit den meisten Links; nur im Schattenbaum → Namen der Sxablonoj), Seitenkopf (erste Überschrift), Hauptaktion (erster `button` außerhalb der Navigation mit `type=submit`, sonst der erste), Formularfeld `kampo:<art>`, `listo` und `tabelo` getrennt, Statusmeldung (`status`/`alert`). | `sxablonoj-samaj.ts` | angewandt |
| D-126 | D-S037-07-8 | Formel D-06 | Ein Zweck zählt ab zwei Screens und ist einheitlich, wenn alle Vorkommen eine Signatur tragen; `kvoto = einheitliche / gezählte`, 1, wenn kein Zweck zweimal vorkommt (Abweichung braucht zwei Stellen). | `sxablonoj-samaj.ts` | angewandt |
| D-127 | D-S037-07-9 | Links eines Ero für D-05 | `faktojPorNavigado`: eine Ero mit Skemo-Rolle `link` trägt ihr Ziel in ihrer einen Pflicht-String-Prop (`fm-ligilo to=…`); in einer Kopie der Fakten als `href` gesetzt. Gespeicherte Fakten unverändert. Abgleich mit Kette A durch D-81 und den Test `0651b957`. | `poentoj.ts` | angewandt |
| D-128 | D-S037-07-10 | Zusammenfassung je Ablauf | `sumo.total` = Mittel über die **geplanten** Screens (nicht gebaut = 0, wie Spec 030 D-12); `sumo.k` je Kriterium über die gebauten; Navigation und Muster eigene Spalten, nie im Total. | `poentoj.ts` | angewandt |
| D-129 | D-S037-07-11 | Bewertung bis zum Adapter | Attrappe `taksiloDeKatalogo` nach dem Rezept C-3/C-8 (unverändertes `score()` mit Gewichten und Tor aus dem Katalog der Modelo); später durch `ekranoTaksilo` ersetzt (D-150), `poentoj.json` gleich geblieben. | Tests | angewandt, ersetzt |
| D-130 | D-S037-07-12 | Fixtures | Von Hand gebaute Fakten für `liste-filter-detail` (F Runde 1 mit fehlender Kante, totem Link und abweichender Hauptaktion, Runde 3 behoben; 0 Runde 1 nativ); erwartetes `poentoj.json` schon im roten Commit, Kernwerte von Hand nachgerechnet (Navigation 0,5 → 1, Muster 0,75 → 1, F 100, 0 44,4). Kein Modelllauf. | Fixtures | angewandt |
| D-131 | D-S037-07-13 | Roter Commit | Die drei Module nur mit ihren Typen, Abhängigkeit und Lockfile schon im roten Commit, damit die Tests an fehlenden Funktionen scheitern. | Commits | angewandt |
| D-132 | D-S037-07-14 | Abhängigkeitszeile | `"@fundamento/ekranoj": "workspace:*"` zwischen `@axe-core/playwright` und `@fundamento/eroj`, dieselbe Zeile wie S037-05 auf A → nach dem Neuaufsetzen aus dem Diff von B verschwunden (kein Konflikt). | `nordstelo/package.json`, Lockfile | angewandt |
| D-133 | D-S037-07-15 | Gewichte gelesen, nicht kopiert | `legiKatalogon()` über `readNordstelo(defaultModeloSource().dataDir)`; Test: gleich der Datei, und keine Quelle unter `src/ablauf/` nennt das Gewichtswort oder einen Gewichtswert. | `poentoj.ts` | angewandt |
| D-134 | D-S037-08-1 | Ort der Argumente von `--art` | Eigenes Modul `cli-ablauf.ts`; `cli.ts` gibt jeden Aufruf mit `--art` vor seinem eigenen `parseArgs` dorthin; der bisherige Pfad bleibt Zeichen für Zeichen gleich (Diff: Import, Weiche, zwei Hilfezeilen). Unbekannter Wert → Aufruffehler, Exit 2. | `nordstelo/src/cli.ts`, `cli-ablauf.ts` | angewandt |
| D-135 | D-S037-08-2 | Reihenfolge der Prüfungen | Argumente → Einstellungen → `.env` → `providerOf` → Modellwache D-19 → erst dann Gvidanto, Markenbau, Chromium → Lauf; `kuriAblaufon` prüft das Modell als erste Anweisung erneut. | `cli-ablauf.ts`, `kuro.ts` | angewandt |
| D-136 | D-S037-08-3 | Eine Tokengrenze für die Messung | Ein metiejo-`Budget(--max-tokens)`; jeder Lauf bekommt einen Chat-Wrapper (`kunKomunaBudgxeto`) und den Rest als `maksTokenoj`; ist die Grenze erreicht, startet der nächste Lauf nicht („nicht gestartet (Tokengrenze)“). | `kuro.ts` | angewandt |
| D-137 | D-S037-08-4 | Reihenfolge der Läufe | Katalogreihenfolge, je Ablauf F vor 0, dann Wiederholungen (D-25): eine Grenze mitten in der Messung lässt vollständige F/0-Vergleiche zurück. | `kuro.ts` | angewandt |
| D-138 | D-S037-08-5 | D-39 Marken | Nicht eingeengt: nordstelos unveränderter Renderer (vier `ASPEKTOJ` × hell/dunkel × Kontrast Standard/hoch); der Adapter behält nur Kontrast Standard (8 Renders je Screen), hoher Kontrast wird mitgerendert und verworfen (Zeit, keine Kosten); `concurrency: 1`; ein Foto (komuna hell). | `cli-ablauf.ts` | angewandt, **zu bestätigen** |
| D-139 | D-S037-08-6 | Markenbau der Messung | Einmal je Messung `buildProjekcioj` mit der cxiuj-Konfiguration nach `<id>/projekcioj`; `Marko.konstrui` kopiert nur `css/fundamento.css` in den Laufordner. | `cli-ablauf.ts` | angewandt |
| D-140 | D-S037-08-7 | Bewertung in Schleife und Bericht | Eine Bewertung je Aufgabe für die Schleife von ekranoj und den Bericht; zuerst `taksiloPorMezuro` (`scoreBoth(…).nova`), seit `07585b5e` `ekranoTaksilo` (D-150). | `raporto.ts` | angewandt |
| D-141 | D-S037-08-8 | Bericht aus gespeicherten Daten | Der Bericht bewertet die gespeicherten Fakten jeder Runde neu (`legiKuron` + `poentiKuron`, D-33) – dieselbe Funktion `raporto(dir)` für Lauf und Nachbau; grün und „grün seit Runde n“ aus `kuro.json`. | `raporto.ts` | angewandt |
| D-142 | D-S037-08-9 | Ablage | `<out>/<JJJJMMTT-HHMM>` (UTC), darin `<ablauf>/<F\|0>/<ripeto>/` als ekranoj-Laufordner; `skribiRondojn` ergänzt nur, was ekranoj nicht schrieb; JSON sortiert, keine Zeitstempel im Inhalt. | `kuro.ts`, `raporto.ts` | angewandt |
| D-143 | D-S037-08-10 | Vergleiche | F gegen 0 je Ablauf in Runde 1 und 3, Runde 1 gegen 3 je Ablauf und Variante, je Screen; Median bei Wiederholungen; fehlt Runde 3, steht „–“ mit dem Halt; \|Δ Total\| ≤ 16,7 mit „≈“ (innerhalb der Streuung). | `raporto.ts` | angewandt |
| D-144 | D-S037-08-11 | Last | `os.loadavg()` und Kerne vor/nach jedem Lauf in `kuro.json`; „Last > Kerne“ → Dauer markiert und nicht verglichen. | `kuro.ts`, `raporto.ts` | angewandt |
| D-145 | D-S037-08-12 | Kosten | $ je Lauf und Summe mit `kostoOf`; ohne Preis „Kosten unbekannt“, nie 0; Schätzung = Summe von `taksoPorEnigo` über alle Läufe. | `kuro.ts`, `raporto.ts` | angewandt |
| D-146 | D-S037-08-13 | Standardwerte | `--max-tokens` 2 000 000 (Messpunkt-Scheibe D-25), `--ripetoj` 1, `--out` `.fundamento/nordstelo/ablauf`, `--ledger` = `--out`; nichts angehoben. | `cli-ablauf.ts` | angewandt |
| D-147 | D-S037-08-14 | Fehler eines Laufs | Halt „eraro“ mit Meldung und Tokens, die Messung geht weiter; Exit 1 nur, wenn kein Lauf eine Runde gebaut hat. | `kuro.ts`, `cli-ablauf.ts` | angewandt |
| D-148 | D-S037-08-15 | Echte Abhängigkeiten | ekranoj, Gvidanto, Renderer und projekcioj per dynamischem `import()`; `chatModelDe` mit `Pordisto(LIMOJ…)` unverändert; kein `eligo` von ekranoj (die Messung rendert selbst). | `cli-ablauf.ts` | angewandt |
| D-149 | D-S037-08-16 | `mankoj.json` der Messläufe | `skribiRondojn` legt `stabilaJson(rezulto.mankoj)` in jeden gestarteten Laufordner (nur wenn keins da ist), Orte `<id>/<ablauf>/<F\|0>/<n>/<screen>` – `fm ekranoj mankoj <Messordner>` findet die Messläufe. | `kuro.ts` | angewandt |
| D-150 | D-S037-08-17 | Bewertung nach S037-05 | Messung und Tests von S037-07 bewerten über `ekranoTaksilo({ modelo, katalogo, kriterioj: kriteriojDe(tasko), tasko: tasko.slug })`; die Attrappe `taksiloDeKatalogo` entfällt. Commit ohne roten Vorgänger, weil sich keine Zahl ändert (`poentoj.json` F und 0 unverändert getroffen). | `raporto.ts`, Tests | angewandt |
| D-151 | D-S037-09-1 | Playwright-MCP-Server der Agenten | Zählen nicht als Messwerkzeug (beide Sitzungen halten dauernd einen offen, die Sperre wäre nie frei); die Browser, die sie öffnen, zählen. | Wächter | angewandt |
| D-152 | D-S037-09-2 | Eigener Lauf blockiert sich nicht | `mezuri` meldet sich unter `.fundamento/spec037/mezuri.aktiv/<pid>` an; Wächter und `mezuri` nehmen seinen Prozessbaum aus; der Befehl läuft mit `--cwd` unter `/tmp/s037-*`. Ausschluss über PID und Arbeitsverzeichnis, nie über Namen. | Wächter | angewandt |
| D-153 | D-S037-09-3 | `git fetch` im gemeinsamen Git-Verzeichnis | Plan-Prüfung alle 60 s aus lokalen Refs, `fetch` nur alle 300 s, ohne Auto-Maintenance und mit `GIT_OPTIONAL_LOCKS=0` – weniger Schreibzugriffe neben der Sitzung von Spec 036. | Wächter | angewandt |
| D-154 | D-S037-09-4 | Marker im plan von Spec 036 | Treffer = „Messung … läuft“ oder „läuft“ in einem Abschnitt mit „Messung“ im Titel; Refs mit `036` im Namen; nicht lesbar = Treffer. | Wächter | angewandt |
| D-155 | D-S037-09-5 | Fenster und unklare Fälle | Frei = 300 s am Stück ohne Treffer; unbekanntes Arbeitsverzeichnis = Treffer; `/private/tmp` = `/tmp`; Lauf-IDs in `kosten`/`mezuri` sind keine Treffer. | Wächter | angewandt |
| D-156 | D-S037-09-6 | Startbedingung von `mezuri` | `frei` **und** frisch (≤ 210 s) **und** eine eigene Probe jetzt ohne Treffer; ein beendeter Wächter hinterlässt „belegt“. | `mezuri` | angewandt |
| D-157 | D-S037-09-7 | Buchung | Werte aus `raporto.json` zuerst, Befehlszeilenwerte füllen Lücken, sonst Tokens × 0,20 $/Mio.; anderes Modell → nicht gebucht (`kosten` Exit 4). | `mezuri` | angewandt |
| D-158 | D-S037-09-8 | Wo „gestört“ steht | Ledger `laeufe.tsv` je Lauf (fremde Messung, Markierung); `kostoj.tsv` mit Last und fremder Messung; „Last > Kerne, Zeitwerte nicht vergleichbar“ bei 1-min-Last über den Kernen. | Ledger | angewandt |
| D-159 | D-S037-09-9 | Selbsttest | Umgebungsvariablen dürfen Intervall, Fenster und fetch-Abstand nur senken; Selbsttest mit eigenem Zustand und Proben unter `/tmp/s037-*`. | Wächter | angewandt |
| D-160 | D-S037-10-1 | `--max-tokens` der Modellläufe | Werte von D-25 übernommen (250 000 je Abnahme, 2 000 000 Messpunkt); metiejo `Budget.ensure()` bricht vor einer Überschreitung ab (gesehen: Halt bei 213 397 bzw. 1 977 650). Nichts gesenkt, nichts angehoben. | Läufe | angewandt |
| D-161 | D-S037-10-2 | Schätzung vor dem Start | Abnahme: Probeaufruf ohne `--ja` (druckt die Schätzung, Exit 2 vor jeder Anfrage): 0,049 $ ≤ 0,05 $. nordstelo hat keinen Probemodus: Schätzung in der ersten Logzeile (0,3528 $ ≤ 0,40 $); die Grenze sichert die Scheibe. | Läufe | angewandt |
| D-162 | D-S037-10-3 | Warten auf „frei“ | Ein eigenständiger Hintergrundjob reserviert, wartet auf `frei`, startet den Wächter bei Bedarf neu, versucht nach Exit 5 erneut (jeder Versuch im Prüfprotokoll), bucht, prüft mit `pruefen` und schreibt einen Fertig-Marker; Frist 2026-11-01T08:00Z. Gebraucht: 66 min Warten. | Läufe | angewandt |
| D-163 | D-S037-10-4 | Buchung des Messpunkts | Ohne `--raporto` an `mezuri` (der Ordner entsteht erst beim Start, Befund S037-08-1); danach `kosten buchen` aus `sumo` des Berichts mit Dauer, Commit, Last und fremder Messung aus `laeufe.tsv`. | Ledger | angewandt |
| D-164 | D-S037-10-5 | Gestörten Messpunkt wiederholen? | Nein: Messpunkt-Scheibe verbraucht (0,39553 $), die Reserve 0,10 $ trägt keinen F-Ablauf (≈ 0,28 $), die Scheibe Wiederholung gehört 2.5. Nichts umgewidmet. | Läufe | angewandt, **zu bestätigen** |
| D-165 | D-S037-10-6 | Messpunkt nach Störungsbeginn abbrechen? | Nein, zu Ende laufen lassen und „gestört“ markieren (D-158); ein Abbruch hätte ausgegebene Tokens wertlos gemacht, ohne die Überschneidung ungeschehen zu machen. | Läufe | angewandt |
| D-166 | D-S037-10-7 | Lückenliste | Über alle Läufe einschließlich Rauchtest `261031-s037-06-k1`; zusätzlich eine Liste nur über Variante F, weil die K5-Lücken der Variante 0 Absicht sind (Befund S037-10-7). | Lückenliste | angewandt |
| D-167 | D-S037-10-8 | AC-7 im echten Lauf | Ein leerer Fragment-Diff zwischen zwei Modellläufen ist nicht zu erwarten; geprüft: Rahmenattribut, Farbliterale in allen Fragmenten (0), Markenfarben in den Fotos und der zufällige Fall gleichen HTMLs (zwei leere Fragmente, verschiedene Hintergründe). Strenger Nachweis bleibt `test:browser` (T3710). | Abnahme | angewandt |
| D-168 | D-S037-10-9 | Commit der Läufe | Abnahmen auf PR-A-Kopf `5a912063` (`/tmp/s037-a`), Messpunkt auf PR-B-Kopf `07585b5e` (`/tmp/s037-b`), beide gebaut und neuer als alle Quellen. | Läufe | angewandt |
| D-169 | D-S037-11-1 | Probe ohne offenen PR von 036 | Kein PR von Spec 036 (offen, geschlossen oder gemergt); der einzige gepushte Branch `origin/261031-spec-036-t1-abnahme` (`e49b4002`) geht als „Teil 1 (Branch, ohne PR)“ in die verbindliche Kette. | Konfliktprüfung | angewandt |
| D-170 | D-S037-11-2 | Vorschau mit lokalen 036-Branches | Lokale, ungepushte 036-Branches im gemeinsamen Git-Verzeichnis nur über Refs gelesen (`merge-tree`, `diff`, `show`), als Vorschau mit Zeitstempel; zählt nicht als Prüfung gegen PRs. | Konfliktprüfung | angewandt |
| D-171 | D-S037-11-3 | Teil-6-Skript auf einer Kopie | `scripts/neutrale-namen/{codemod,rules}.mjs` aus dem Ref in ein eigenes Verzeichnis kopiert und nur gegen eine Kopie von PR B ausgeführt (über `/private/tmp`, Befund S037-11-3); Ergebnis gilt als „Skript noch nicht im PR“, zu wiederholen auf dem PR-Stand. | Konfliktprüfung | angewandt |
| D-172 | D-S037-11-4 | Konflikt in der Vorschau | `CHANGELOG.md` (036 Teil 1 gegen 036 Teil 6) im Scratch-Worktree mit „beide Einträge behalten“ aufgelöst, damit der Endstand mit `check:privat` prüfbar war. | Konfliktprüfung | angewandt |
| D-173 | D-S037-11-5 | R-8 | Kein Neustart: in keinem Lauf war ein Job rot; `.fundamento/spec037/r8.tsv` nicht angelegt. | CI | angewandt |
| D-174 | D-S037-12-1 | 2.5 ohne Teil 5 von Spec 036 | `origin/main` = `f2b5a058` (nach `git fetch` am 2026-10-31 um 14:00Z), kein PR von Spec 036 → Teil 5 nicht gemergt → 2.5 „Blockiert“ mit Anleitung; kein Scratch-Worktree `/tmp/s037-main2`, keine Reservierung, Scheibe Wiederholung (0,40 $) unberührt. | 2.5 | angewandt, **zu bestätigen** |
| D-175 | D-S037-12-2 | Platz von D-59 in der Nummernfolge | D-59, direkt nach den Entscheidungen von S037-02: sie entstand aus deren Befund und galt vor S037-03, das sie umsetzte (D-60). | plan | angewandt |
| D-176 | D-S037-12-3 | Vorläufige IDs im Text | In plan.md und tasks.md durch D-nn ersetzt; die Spalte „vorläufig“ und die Zuordnungstabelle behalten die alten IDs, die Beitragsdateien bleiben unverändert und so auffindbar. | plan, tasks | angewandt |
| D-177 | D-S037-12-4 | Nummern in tasks.md | Bestehende T3701–T3736 bleiben (D-46); Arbeiten ohne eigene Zeile bekommen T3737 ff. (S037-08: `mankoj.json` je Messlauf, Navigationstest, Umstellung auf `ekranoTaksilo`; S037-12: Neuaufsetzen von B). Keine Umnummerierung bestehender Zeilen. | tasks | angewandt |
| D-178 | D-S037-12-5 | SHAs der Kette B in tasks.md | Das Neuaufsetzen von B auf den letzten Doku-Commit von A gibt den B-Commits neue SHAs, die ein Commit auf A nicht kennen kann (B baut auf ihm auf). tasks.md und dieser plan nennen die SHAs auf dem Stand `5a912063` (S037-08) mit Titel; die neuen SHAs stehen im PR-Text von #132 und in der Beitragsdatei von S037-12. Gleicher Titel = gleicher Patch (A änderte seitdem nur `specs/037-agenten-ekranoj/`). | tasks, PR B | angewandt, **zu bestätigen** |
| D-179 | D-S037-12-6 | Bewertung der Lieferliste | Streng: „teilweise“, wenn ein Lieferpunkt nicht im vollen Umfang vorliegt – 1.7 (Schätzung 3–4-fach zu niedrig), 1.8 (Tokengrenze, kein Screen grün), 2.4 (3 von 8 Teilläufen, gestört); 2.5 „blockiert“. | Bericht | angewandt |
| D-180 | D-S037-12-7 | AC-13 | „teilweise“: jeder Start war laut Prüfprotokoll frei, aber der Messpunkt überschnitt sich ab 13:49:32Z mit einer Messung von Spec 036 (gestört markiert, D-165), und provo bzw. der Messpunkt starteten 31 s bzw. 87 s nach Prozessen von 036, die nur `mezuri` sah (Befund S037-10-3). | Bericht | angewandt |
| D-181 | D-S037-12-8 | Messanleitung für den Maintainer | Befehle direkt im Checkout `/Users/thorstenjankowski/n8n-compose/20260918_fundamento-ds` (der Maintainer entscheidet selbst, ob Spec 036 misst); Branches per `git switch --detach origin/<branch>` (keine lokalen Branches, B wird mit `--force-with-lease` neu geschrieben). Reservierung und Buchung über das Schutzwerkzeug sind angegeben, damit das Ledger vollständig bleibt; der Weg im Stil des Laufs (Scratch-Worktree, `mezuri`) steht daneben. | Messanleitung | angewandt |
| D-182 | D-S037-12-9 | Nachprobe gegen bewegte 036-Refs | Seit S037-11 haben sich die lokalen 036-Branches `t1-abnahme` (`ff20545f`, 55 Dateien) und `t6-neutrale-namen` (`fd27376b`, 43 Dateien) bewegt. Paarweise `git merge-tree --write-tree` gegen den Kopf von PR B (enthält A): alle fünf lokalen 036-Branches sauber, Überschneidung weiter nur `ci.yml` und `workflow.test.ts` (t6). Die Kettenprobe von S037-11 bleibt gültig; „Später prüfen“ gilt weiter. | Konfliktprüfung | angewandt |
| D-183 | D-S037-12-10 | Wächter weiterlaufen lassen | `gardisto` (PID 61094) bleibt an; S037-12 beendet keinen laufenden Prozess. Er liest Refs und `fetch`t nur alle 5 min; abschalten mit `/tmp/s037-werkzeug/gardisto stopp`, wenn keine Messung mehr geplant ist. | Wächter | angewandt |
| D-184 | D-S037-13-1 | Antwort ohne Markup (Befund S037-10-1) | Eine Antwort ohne Markup (leer oder nur ein `mankoj`-Block) wird einmal in derselben Unterhaltung ohne Werkzeuge nachgefragt (`REDEMANDO_F`/`REDEMANDO_0`) – eine Anfrage unter dem Budget des Laufs, keine neue Grenze; bleibt auch die zweite leer, steht `leere-antwort` als erster Hinderungsgrund, der Screen ist nie grün (auch wenn die leere Seite gut bewertet würde), der Befund hat Regel, Ort und Grund; eine Logzeile; die Runde läuft weiter, der Screen zählt als gebaut. | ekranoj `agento.ts`, `rondoj.ts` | angewandt |
| D-185 | D-S037-13-2 | Rohantwort ablegen | Nur bei leerem Bau: beide Antworten in `rondoj/<n>/<slug>.respondo.txt` über den neuen, additiven Haken `EkranojEligo.respondo`; `eligoDe({ redakti })` schwärzt vor dem Schreiben, die cli reicht `provider.redact` durch. Nicht jede Antwort: Größe und Schlüsselrisiko. | ekranoj `eligo.ts`, cli | angewandt |
| D-186 | D-S037-13-3 | Wert der Schätzkonstante F (Befund S037-10-2) | 70 000 Tokens je Screen-Runde: abnahme-komuna verbrauchte 213 397 Tokens für Plan + 3 gebaute Screen-Runden (≈ 69 500, provo gleich); nicht der Messpunkt-Wert ≈ 176 000 (vier Marken, mehr Werkzeugaufrufe, andere Last). Schätzwert, keine Grenze (`audit-ac4`: „Schätzwert, keine Grenze“). Rot-Test: die Schätzung für Plan + 3 Screen-Runden deckt die gemessenen 213 397. Folge: die Schätzung sagt jetzt vor dem Start, dass 250 000 für zwei Screens × 3 Runden (≈ 425 000) und 2 000 000 für vier Abläufe (≈ 3 024 000) nur Teilergebnisse tragen; nichts angehoben. | ekranoj `kostoj.ts` | angewandt, **zu bestätigen** |
| D-187 | D-S037-13-4 | Befunde S037-10-6 und -7 mitnehmen | Klein und testbar, also rot/grün: `RondoEkrano.portitaEl` und „übernommen aus R<n>“ in `raporto.md`/`raporto.json`; Variante 0 ohne Bewertungslücken (K5) in `mankoj.json` (die Messung erbt das über `rezulto.mankoj`). Der Log-Teil von S037-10-6 war kein Fehler: „Runde 2: registrieren gebaut“ stammt aus Variante 0 (nicht grün, ohne Werkzeuge neu gebaut). | ekranoj `rondoj.ts`, `eligo.ts`, `mankoj.ts` | angewandt |
| D-188 | D-S037-13-5 | Echter Gvidanto in der cli-Suite | Der Test ersetzt nur die Fabrik `gvidanto` und startet dieselbe Verdrahtung mit dem gebauten Einstieg (`node packages/cli/dist/index.js mcp [--config]` über `konektiGvidanton`): die registrierte Fabrik löst `../index.js` relativ zum Befehlsmodul auf, unter Vitest aus den Quellen ist das die TypeScript-Datei. Bewerter und Markenbau echt, wo das Kriterium davon handelt (AC-6, AC-7). | cli-Tests | angewandt |
| D-189 | D-S037-13-6 | AC-7 integriert | Zwei Läufe mit echtem Markenbau (projekcioj `css`, `make-kit`) für komuna und provo; jedes Fragment (Screens und Runden) byte-gleich; Tokenwerte aus der `marko/css/fundamento.css` jedes Laufs gelesen, nicht getippt; dazu Farbliterale, `--fm-`-Rohwerte, `style` und Markennamen. Die Grenze 5 (V-2) steht im AC-6-Test als Wert der Spec, nicht abgeleitet. | cli-Tests | angewandt |
| D-190 | D-S037-13-7 | AC-10 über den gebauten Stand | `arkitekturo.test.ts` liest auch `dist/**` (`.js`, `.d.ts`); in `.d.ts` zählt jede Angabe als Typ-Import; jede Quelle muss gebaut sein. `vitest.config.ts` baut außerhalb von turbo das Paket selbst mit (`--filter=@fundamento/ekranoj...`), damit `dist` frisch ist; die Mutationsläufe setzen `TURBO_HASH`, damit die veränderte Ausgabe bleibt. | ekranoj-Tests | angewandt |
| D-191 | D-S037-13-8 | Dokumente als Test | `packages/ekranoj/src/doku.test.ts` (Vorbild `metiejo/src/docs-024.test.ts`): AC-1 (Hash, plan und tasks daneben), AC-15 (Abschnitte, V-1 bis V-4, D-01 bis D-13) und die Form von AC-16 (Bericht am Ende, beide PR-Links, Merge-Position, Schritte fortlaufend); der Inhalt bleibt Durchsicht. | ekranoj-Tests | angewandt |
| D-192 | D-S037-13-9 | AC-11 Ende zu Ende in nordstelo | Das echte `kuruEkranojn` mit Gvidanto im Prozess (`connectGvidanto`, der echte MCP-Server), echtem Bewerter und einem Renderer, der die gespeicherten Fakten von `liste-filter-detail` abspielt (Runde n → gespeicherte Runde n, sonst die letzte davor); `Date.now` eingefroren (K7 ms). Erwartetes JSON einmal aus dem Lauf erzeugt und als `test/fixtures/ablauf/integra-raporto.json` committet (eine Datei: jeder Ordner dort ist für `poentoj.test.ts` ein gespeicherter Ablauf). | nordstelo-Tests (PR B) | angewandt |
| D-193 | D-S037-13-10 | Nicht verdoppelt | Unbekanntes `--art` und die Modellwache der Messung sind schon gedeckt (`cli-ablauf.test.ts` › „refuses an unknown --art with a usage error, exit 2, nothing read or built“, „exits 2 before any request when the .env names another model (D-19)“; `kuro.test.ts` › „refuses another model before any request: no folder, no dependency, no run (D-19)“). | – | angewandt |
| D-194 | D-S037-13-11 | SHAs der Kette B aus S037-13 | Wie D-178: tasks und plan nennen die B-Commits auf dem Stand von A `5f184b93` (vor diesem Doku-Commit); nach dem Neuaufsetzen stehen die neuen SHAs im PR-Text von #132 und in der Beitragsdatei S037-13. | tasks, PR B | angewandt, **zu bestätigen** |
| D-195 | D-S037-13-12 | Korrektur eines Tests | Der Wächter der Modelo (`src/ci/test-setup.test.ts`, kein `await` auf Modulebene) meldete die Marken-Attrappe des neuen cli-Tests; eigener Test-Commit `5f184b93`, keine Umschreibung gepushter Geschichte. Der noch ungepushte B-Test-Commit wurde einmal geändert (erwartetes JSON als Datei statt Ordner), vor jedem Push. | Tests | angewandt |
| D-196 | D-S037-13-13 | Lieferpunkt 1.7 | Jetzt „erledigt“: Schätzung aus gemessenen Werten, die gedruckte Schätzung sagt vor dem Start, ob die Grenze den Lauf trägt; Zähler und Grenze halten. Der höhere Wert des Messpunkts ist eine andere Last und wird mit 2.5 nachgemessen. | Bericht | angewandt |

## Entwurf: Bewertung Navigation (D-05) und Muster (D-06)

Aus S037-07 (T3723), übernommen von S037-12. Umsetzung: D-05 in `packages/ekranoj/src/navigado.ts` (D-22, D-28), D-06 in `packages/nordstelo/src/ablauf/sxablonoj-samaj.ts` (D-123 bis D-126).

**Wozu zwei Spalten neben der Kennzahl.** K1–K6 bewerten jeden Screen für sich. Ein ganzer Ablauf kann in jedem Screen gut sein und trotzdem als Ganzes scheitern: Screens, die einander nicht erreichen, und Screens, die dieselbe Aufgabe jedes Mal anders lösen. D-05 und D-06 messen genau das – deterministisch aus den gespeicherten Fakten, ohne Modellurteil. Sie stehen als eigene Spalten neben dem Total und gehen nie in es ein: die Gewichte der Kennzahl bleiben, wie sie im Katalog der Modelo stehen, und die Werte „ganzer Ablauf“ bleiben mit den Seitenwerten der Kennzahl vergleichbar.

**D-05 Navigation vollständig.** Gemessen wird gegen den Plan: jede geplante Kante (Screen → Screen) muss als Verweis im Fragment des Agenten stehen (der Rahmen fügt nur den Rücklink zur Übersicht hinzu und zählt nicht, D-27). `Anteil = max(0, vorhandene geplante Kanten − tote Verweise) / geplante Kanten`; 1, wenn nichts geplant und nichts tot ist. Tote Verweise ziehen ab, weil ein Link ins Leere schlimmer ist als ein fehlender: er verspricht einen Weg, den es nicht gibt. Ungeplante Kanten zwischen geplanten Screens sind erlaubt und zählen nicht. Ein Screen ist `kompleta`, wenn er gebaut ist, alle seine geplanten Ziele verlinkt und keinen toten Verweis hat; erreichbar ist, was die Übersicht verlinkt, und was man von dort entlang vorhandener Verweise erreicht. Eine Umsetzung (ekranoj, `navigado`), zwei Nutzer: die Schleife von `fm ekranoj` (D-04) und die Messung in nordstelo. Ein Link mit dem Link-Ero der Modelo (`fm-ligilo`, Ziel in der Prop `to`) zählt wie ein `href`: beide Wege lesen Rolle und Ziel-Prop aus der Skemo (D-81, D-127; Test `0651b957` verlangt Gleichheit).

**D-06 Gleiche Muster für gleiche Zwecke.** Ein Design-System soll dafür sorgen, dass dieselbe Absicht überall gleich aussieht. Je Screen werden die Zwecke bestimmt – Hauptnavigation, Seitenkopf, Hauptaktion, Formularfeld je Eingabeart, Liste, Tabelle, Statusmeldung – und zwar über ARIA-Rollen: das `role`-Attribut, sonst die Rolle, die die Skemo dem Ero gibt, sonst die implizite Rolle des nativen Elements. So finden Variante F und Variante 0 dieselben Zwecke, und der Vergleich F gegen 0 ist fair. Je Zweck wird eine Signatur gebildet: in Variante F der Ero-Tag mit den Enum-Props, nach denen die Skemo das Aussehen gestaltet (fehlende Werte mit ihrem Default), bzw. der Name der Sxablono, die einen Zweck nur im Schattenbaum trägt; in Variante 0 der native Tag mit den sortierten Klassen. Ein Zweck zählt, wenn er auf mindestens zwei Screens vorkommt, und ist einheitlich, wenn alle Vorkommen dieselbe Signatur tragen. `Anteil = einheitliche / gezählte Zwecke`; 1, wenn kein Zweck zweimal vorkommt, denn erst zwei Stellen können voneinander abweichen. Nichts davon ist getippt: Prop-Namen, Defaults und Rollen kommen aus der Modelo, sodass neue Eroj und Props ohne Codeänderung mitgemessen werden.

**Grenzen (bewusst).** Die Hauptaktion ist der erste absendende Knopf außerhalb der Navigation, sonst der erste – eine Seite mit „Abbrechen“ vor „Speichern“ ohne `type=submit` wird falsch gelesen. Ein Datumsfeld als `fm-datelektilo` und als `fm-kampo kind=date` fallen in verschiedene Zwecke (die Abweichung wird dann nicht als uneinheitlich gezählt – die Messung irrt in die nachsichtige Richtung). Statusmeldungen und Leerzustände teilen die Rolle `status`. Da F gegen 0 und Runde 1 gegen Runde 3 mit derselben Regel verglichen werden, verschieben diese Grenzen beide Seiten gleich.

**Im ersten Messpunkt (S037-10).** `anmelden-und-konto`: Navigation F 0 → 0,67 → 0,33 (Runde 1 → 2 → 3; Variante 0 durchgehend 0,83), Muster F 0,5, 0 0,75 – F löst gleiche Zwecke über die Screens hinweg seltener gleich als 0. Das ist ein Messwert, kein Fehler der Formel; er ist Eingang für Muster-Runde 2.

## Befunde

IDs `S037-<Ticket>-<n>` (Nummer des Befunds im Beitrag des Tickets). Stand: **erledigt** (im Lauf behoben), **offen** (Vorschlag für den Maintainer bzw. eine spätere Runde), **Hinweis** (kein Handlungsbedarf).

### Befund Tabu

- **S037-02-1 `packages/modelo/src/workspace.test.ts` – erledigt (D-59, D-60, `d944ff68`).** Der Test „has exactly the five Phase-1 packages, … the Nordstelo (Spec 030) and komuna-0-2 (Spec 029)“ vergleicht die Ordner unter `packages/` mit der festen Liste `PACKAGES`; mit dem neuen Paket `packages/ekranoj` (V-1) war er rot (`expected [ 'agordilo', 'aspekto-komuna', …(10) ] to deeply equal [ 'agordilo', 'aspekto-komuna', …(9) ]`, `+ "ekranoj"`). Nach §2.8 der Implementierungs-Spec liegt die Datei in `packages/modelo/**` außerhalb des einen Worts von D-15; die Produkt-Spec nennt sie nicht als tabu. **Vorschlag (umgesetzt nach Orchestrator-Entscheidung D-59):** eine Zeile `ekranoj: "@fundamento/ekranoj",` in `PACKAGES` (alphabetisch nach `cli`), Graubereich wie D-15; ekranoj steht schon auf `0.2.0`. Modelo danach 4147/4147. Passt, falls der Maintainer die Grauzone anders zieht, in Spec 036 Teil 6 (Aufräumen). **Zu bestätigen.**
- S037-03 bis S037-12: kein weiterer Bedarf in einer Tabu-Datei.

### Manko Gvidanto

Geprüft in S037-06 (3.2): die Werkzeugliste `TOOL_NAMES` in `packages/mcp/src/schemas.ts` (nur gelesen; 23 Werkzeuge, davon 12 als Bauwerkzeuge angeboten) gegen das, was der Ablauf brauchte (S037-03 bis S037-06). Kein Code in `packages/mcp`; jeder Befund ist ein Vorschlag für eine Gvidanto-Runde nach Spec 036 (nicht deren Teil 6). Alle **offen**.

- **MG-1 Kein Werkzeug nennt Layoutmittel (S037-06, 3.2).** Die zwölf Bauwerkzeuge nennen Eroj, Sxablonoj, Tokens, Reguloj und Begriffe, aber keines sagt, womit ein Fragment Abstände, Reihen, Spalten oder Regionen ordnet, ohne Werte zu schreiben. Ein Agent greift dann zu `style=` (K5 `raw-value`, z. B. `margin`, `gap`) oder baut Gerüste aus nackten `div`. Die Lückenliste zählt solche Werte als `sxablono`-Lücke „Layoutmittel für <Eigenschaft>“. **Vorschlag:** Lesewerkzeug `list_arangxoj` (Layoutmittel mit Zweck, Props und Beispiel) oder `list_sxablonoj`/`get_sxablono` um die Regionen mit ihren Layout-Props erweitern; dazu ein Satz im Prompt `gvidanto`.
- **MG-2 `check_usage` nimmt kein Markup (S037-03).** Jeder prüfende Client baut Instanzen aus dem Markup selbst und liest dafür die Skemo jeder Ero (D-32; ekranoj und nordstelo je für sich). **Vorschlag:** `check_markup` (Fragment als Text → Instanzen wie nordstelo → Urteil von `check_usage`, Antwort mit den Instanzen).
- **MG-3 Die Antwort von `get_ero` ist groß, `brief` reicht nicht für Instanzen (S037-03).** `brief` liefert Achsen und Pflicht-Props, aber nicht alle Props mit Art/Werten, keine Slots und keine Rolle – genau das brauchen Instanzen und die Navigation. **Vorschlag:** `get_ero` mit `fields: ["props", "slots", "a11y"]` oder `brief` um Slots und Rolle erweitern. **Bestätigt durch S037-10:** jede Anfrage schickt das ganze Gespräch mit allen Werkzeugantworten erneut, real ≈ 176 000 Tokens je Screen-Runde in Variante F (Befund S037-10-2); kürzere Antworten senken die Kosten direkt.
- **MG-4 Kein Werkzeug nennt die Link-Ero und ihre Ziel-Prop (S037-04).** ekranoj und nordstelo leiten aus der Skemo ab: Rolle `link` und genau eine Pflicht-String-Prop (heute `fm-ligilo` › `to`) – eine Heuristik auf beiden Seiten (D-81, D-127). **Vorschlag:** `get_ero` nennt die Ziel-Prop einer Navigations-Ero ausdrücklich (z. B. `navigation: { target: "to" }`), oder `list_eroj` filtert nach Rolle.
- **MG-5 Keine Sxablono-Instanzen aus Markup (S037-03, D-72).** `check_usage` nimmt `sxablonoj` (Regionen, Pflicht-Regionen, eine Hauptaktion, Landmarken einmal je Seite), aber kein Werkzeug sagt, woran man eine Sxablono-Instanz im Markup erkennt; ekranoj prüft darum nur Ero-Instanzen, die Seitenregeln laufen nie. **Vorschlag:** `get_sxablono` nennt je Region ein Erkennungsmerkmal (Landmarke/Attribut), oder `check_markup` (MG-2) leitet auch Sxablono-Instanzen ab.
- **MG-6 `suggest_ero` ohne Treffer sagt nicht, was nahe liegt (S037-06).** Ohne Treffer kommt `suggestion: null` – der Agent erfährt nicht, ob sein Ziel nur anders heißt oder ob es wirklich keine Ero gibt; die Lückenliste kann beides nicht trennen. **Vorschlag:** bei fehlendem Treffer die nächsten Ziele/Schlüsselwörter mitliefern (`nearest`). (In den echten Läufen von S037-10 kam kein Fehltreffer vor.)

### Sonstige

| ID | Befund | Datei / Ort | Vorschlag | Stand | Ziel / Teil von 036 |
|---|---|---|---|---|---|
| S037-02-2 | `$W/audit-ac4` brach ab (`awk: illegal primary …`, `Budget(` ohne Escape); Grenzen für S037-02/03 von Hand geprüft. | Schutzwerkzeug `/tmp/s037-werkzeug/audit-ac4` | Node-Skript statt awk | erledigt (D-116, S037-06) | – |
| S037-04-1 | `fm-ligilo` im Fließtext neben `fm-butono` verletzt axe `target-size` (komuna hell und dunkel); in Navigationen braucht er `placement="standalone"`, die Uzo der Ero sagt das nicht. | Modelo-Daten der Ero `ligilo` (für 037 tabu); Rauchtest `/tmp/s037-logs/s037-04-smoke/261031-1230-standards/` | Ein Satz in der Uzo von `ligilo` | offen | Eroj-Runde 6/7 (nach 036) |
| S037-04-2 | `marko/` mit der ganzen Ausgabe von `fm projekcioj build` ≈ 7,6 MB je Lauf. | `packages/cli/src/commands/ekranoj.ts` | nur `--celo css,make-kit` | erledigt (D-95, S037-05) | – |
| S037-05-1 | K1 = 0 in jedem echten Lauf: axe-core lud die Stylesheets unter `file://` per XMLHttpRequest vor, Chromium blockierte das, die Konsolenzeile landete in den Fakten – kein Screen konnte grün werden. | `packages/ekranoj/src/bildigilo.ts` | axe lädt nur Medien vor | erledigt (`6c256265` rot, `b5e9b25a` grün, D-104) | – |
| S037-05-2 | nordstelo zählt `<h1>` im Fragment als nachgebaute Ero (K5 0,8). | Rückmeldung der Runde | Agent nimmt die Überschrift-Ero (sagt die Rückmeldung schon) | Hinweis | – |
| S037-06-1 | Modelo-Clean-Room rot seit `a74125cf`: Hex-Wert im Adapter-Test steht auf der Fingerabdruck-Liste einer Vergleichsmarke. | `packages/nordstelo/src/ekrano-taksilo.test.ts` | erfundener Wert | erledigt (`25932e8b`, D-115) | – |
| S037-06-2 | Einmal `pkill -f "vitest run"` gegen einen eigenen Lauf; die Vitest-Prozesse von 036 liefen weiter, ein Einfluss ist nicht erkennbar, aber nicht ganz auszuschließen. | Arbeitsweise | nur eigene PIDs beenden | Hinweis | – |
| S037-06-3 | `suggest_ero` „Zeitleiste der Prüfschritte“ → Grenze `ask-human` der Ero `navigado` („noch keine Schrittanzeige“). | Modelo-Daten (tabu) | Ero für eine Schrittanzeige | offen | Eroj-Runde 6/7 |
| S037-06-4 | Messläufe von PR B schrieben kein `mankoj.json`. | `packages/nordstelo/src/ablauf/kuro.ts` | `mankoj.json` je Laufordner | erledigt (`7d0fa453` rot, `46021ce9` grün, D-149) | – |
| S037-07-1 | D-05 übersah Links von `fm-ligilo` (Ziel in `to`, kein `href`) – ein korrekt geschriebener Link zählte als fehlende Kante, der Screen wurde nie grün. | `packages/ekranoj/src/navigado.ts` | Ziel-Prop aus der Skemo lesen | erledigt (`1a3ab821` rot, `0680245a` grün, D-81; B-Test `0651b957`) | – |
| S037-08-1 | `$W/mezuri --raporto` braucht den Pfad vor dem Start, die Lauf-ID der Messung entsteht erst beim Start. | Schutzwerkzeug `mezuri` | „neueste `raporto.json` unter einem Ordner“ oder buchen danach | umgangen (D-163) | – |
| S037-08-2 | Alle 5 Abläufe ≈ 2 142 000 Tokens ≈ 0,43 $ > Scheibe 0,40 $. | Messpunkt | `uebersicht-kennzahlen` weglassen (4 Abläufe ≈ 0,35 $ geschätzt) | erledigt (Einengung in S037-10) | – |
| S037-09-1 | Spec 036 misst lokal (Chromium unter `/tmp/s036-*`); die Sperre war von 10:45Z bis 13:39Z meist belegt. | Zustand | im Hintergrund warten | Hinweis | – |
| S037-09-2 | Messungen von 036 ohne die genannten Werkzeuge (z. B. Zeittests per Vitest ohne Browser) erkennt der Prozess-Scan nicht; 036 hat keinen Marker „Messung läuft“ im plan. | Wächter `/tmp/s037-werkzeug/sperre.mjs` | Marker im plan von 036 vereinbaren; Liste der Werkzeuge erweitern | offen | Absprache mit 036 |
| S037-09-3 | Eigene Befehle mit einem Muster in der Befehlszeile und Arbeitsverzeichnis außerhalb `/tmp/s037-*` setzen das Fenster zurück (vorsichtig, nie zu früh frei). | Wächter | – | Hinweis | – |
| **S037-10-1** | **Leeres Fragment gilt als gebaut (Defekt):** 3 von 14 echten Bauten (komuna/detail R1, provo/liste R1, Messpunkt anmelden F R1) lieferten ein leeres Fragment, obwohl das Werkzeuglimit nicht erreicht war (15, 11, 12 von 24 Aufrufen); der Screen bekommt K1 = 0 („empty page“) und kostet eine ganze Runde; die Rohantwort wird nicht gespeichert. | `packages/ekranoj/src/agento.ts` (`konstruiEkranon`, `eltiriRespondon`) | (a) leeres `fragmento` = Fehlschlag: einmal in derselben Unterhaltung nachfragen („Antworte jetzt nur mit dem Fragment in einem html-Block“), sonst `malhelpoj: ["leere-antwort"]` mit Logzeile; (b) letzte Antwort redigiert als `rondoj/<n>/<slug>.respondo.txt` ablegen. Rot-Test: Chat-Attrappe mit leerer letzter Nachricht bzw. nur einem `mankoj`-Block. | erledigt (`d32e62bb` rot, `069ff999` grün, D-184, D-185) | – |
| **S037-10-2** | **Schätzkonstante F 3–4-fach zu niedrig:** `TOKENOJ_EKRANO_RONDO_F` = 40 000; gemessen ≈ 70 000 je Screen-Runde (Abnahme: Plan + 3 Bauten ≈ 213 000) und ≈ 176 000 (Messpunkt: 1 404 652 Tokens für 8 gebaute Screen-Runden, 62 Anfragen, 153 Werkzeugaufrufe). Folge: keine Abnahme erreicht Runde 3 in 250 000, der Messpunkt deckt 1¼ von 4 Abläufen. | `packages/ekranoj/src/kostoj.ts` | Konstante auf den gemessenen Median setzen (Quelle im Kommentar: S037-10), mit 2.5 nachmessen; Werkzeugantworten kürzen (MG-2, MG-3). Eine Schätzkonstante ist keine Grenze (AC-5: „Schätzwert, keine Grenze“). | erledigt: 70 000 (`73a63449` rot, `b0c6fa28` grün, D-186); mit 2.5 nachmessen | – |
| S037-10-3 | Kurze Testläufe von 036 blieben dem Wächter (60-s-Takt) verborgen: `mezuri` sah um 13:40:42Z/13:41:12Z Prozesse von 036, `sperre.stato` blieb „frei“; provo startete 31 s, der Messpunkt 87 s nach dem letzten gesehenen 036-Prozess. Keine Überschneidung belegt. | Schutzwerkzeug `gardisto`, `mezuri` | Ablehnung durch `mezuri` setzt „belegt seit jetzt“; Takt 10–15 s; `mezuri` prüft im Lauf alle 15 s | offen | – |
| S037-10-4 | Spec 036 begann während des Messpunkts zu messen (13:49:32Z, `/tmp/s036-t1/packages/eroj`): `anmelden-und-konto` 0 (Ende) und `liste-filter-detail` F gestört; umgekehrt kann unsere Last (bis 24,4) die Messung von 036 beeinflusst haben. | Messpunkt | 036 informieren; Werte „gestört“ nicht vergleichen | offen (nicht wiederholt, D-164) | Absprache mit 036 |
| S037-10-5 | Last > Kerne beim Start von komuna (11,58 bei 10 Kernen) und nach `anmelden-und-konto` F (24,4, vermutlich der eigene Renderer: 4 Marken × hell/dunkel je Screen und Runde). | Läufe | Dauern markiert, nicht verglichen | Hinweis | – |
| S037-10-6 | Bericht zeigt nicht neu gebaute Screens wie gebaute (komuna R2/detail zeigt Werte von R1 ohne Hinweis; Log „gebaut“ auch für grüne, nicht angefragte Screens). | `packages/ekranoj/src/eligo.ts`/`rondoj.ts`; B `ablauf/kuro.ts` (Log) | „übernommen aus R<n>“ kennzeichnen; Log „übernommen“ | erledigt im Bericht (`bca52e70` rot, `54ead00b` grün, D-187); das Log war richtig (Variante 0) | – |
| S037-10-7 | Lückenliste enthält K5-Lücken der Variante 0 („Ero für a/h1/button/input“) – Absicht der Vergleichsvariante, keine Lücke des Systems. | `packages/ekranoj/src/mankoj.ts` bzw. B `ablauf/kuro.ts` | in Variante 0 keine K5-Lücken nach `mankoj.json`, oder `kunigiMankojn` überspringt `varianto: "0"` | erledigt: Variante 0 ohne Bewertungslücken (`bca52e70` rot, `54ead00b` grün, D-187); alte Laufordner behalten sie | – |
| S037-10-8 | Kleinigkeiten: Schätzzeile im Abnahme-Log doppelt; Tabelleninhalt in `fm-tabelo` und `fm-titolo` mit `<span slot="label">` in Systemschrift (K2 meldete `markdovido.slot=source`); der Agent verwies auf `edit.html` außerhalb des Plans (toter Verweis). | Abnahme-Läufe | – | Hinweis | – |
| S037-11-1 | Beim Lauf gab es keinen PR von Spec 036; die Tabelle „überschneidende Dateien je PR“ steht je Branch. | Konfliktprüfung | „Später prüfen“ | Hinweis | – |
| S037-11-2 | In der Vorschau kollidieren 036 Teil 1 (`t1-form`) und 036 Teil 6 in `CHANGELOG.md` – 036-intern, mit und ohne 037 identisch. | `CHANGELOG.md` (037 berührt sie nicht) | beide Einträge behalten (036 D-26) | Hinweis | 036 Teil 6 |
| S037-11-3 | Das Teil-6-Skript läuft über den Symlink `/tmp` still mit Exit 0 und tut nichts (Main-Wächter vergleicht `import.meta.url` mit `argv[1]`). | `scripts/neutrale-namen/codemod.mjs` (036, nicht geändert) | aus dem Repo oder über `/private/tmp` starten | Hinweis | 036 Teil 6 |
| S037-12-1 | Lokale 036-Branches haben sich seit S037-11 bewegt (`t1-abnahme` `ff20545f`, `t6-neutrale-namen` `fd27376b`); paarweise Probemerges gegen den Kopf von PR B sauber, Überschneidung weiter nur Graubereich (D-182). | Konfliktprüfung | „Später prüfen“ vor jedem Merge | Hinweis | – |
| S037-13-1 | Mit echtem Gvidanto, echtem Bewerter und Renderer-Attrappe ist ein Fragment nur aus Eroj (Überschrift-Ero, Absatz, `fm-ligilo to` mit `placement="standalone"`) in Runde 1 grün: D-04 ist von Satz bis Bericht erreichbar; die nicht grünen Abnahmen lagen an den Antworten des Agenten. | `packages/cli/src/ekranoj-integra.test.ts` | – | Hinweis | – |
| S037-13-2 | `faktojPorNavigado` ändert für die Modelo des Repos das Ergebnis nicht mehr: `navigado` liest `fm-ligilo to` schon über `LIGILAJ_ATRIBUTOJ` (D-81). Eine lokale Mutation, die den Link-Ero in der Messung übersieht, blieb deshalb grün; erst eine Mutation im Weg der Schleife (`ligilajAtributojDe`) zeigte den Test rot. Die Funktion zählt für eine Modelo mit einem anderen Link-Ero. | `packages/nordstelo/src/ablauf/poentoj.ts`, `packages/ekranoj/src/navigado.ts` | behalten (Modelo-unabhängig); oder den Standard in ekranoj nur ohne Skemo-Karte nehmen | Hinweis | – |
| S037-13-3 | Zwei Wächter halten die Markenwerkstatt vom Agenten fern (Erlaubnisliste in `mcp-kliento.ts`, `ofertotajIloj` in `agento.ts`); eine Mutation an nur einem blieb grün, beide zusammen rot. Absicht (doppelte Sicherung). | ekranoj | – | Hinweis | – |
| S037-13-4 | Der Wächter der Modelo (`src/ci/test-setup.test.ts`) meldete ein `await` auf Modulebene im neuen cli-Test. | `packages/cli/src/ekranoj-integra.test.ts` | Attrappe als Funktion | erledigt (`5f184b93`, D-195) | – |

## Messungen

Alle Modellläufe in S037-10 am 2026-10-31, nur `mistral/ministral-14b-2512`. Jeder Wert mit Lastmittel 1/5/15 min und Kernen vor und nach dem Lauf sowie „fremde Messung ja/nein“ (D-09); Zeitwerte mit Last über der Zahl der Kerne sind markiert und werden nicht verglichen. Ergebnisse liegen unter `/Users/thorstenjankowski/n8n-compose/20260918_fundamento-ds/.fundamento/spec037/` (nicht im Repo).

### Abnahme-Läufe komuna und provo (1.8)

Satz „Eine Verwaltung für Standards mit Liste, Detail, Bearbeiten und Einstellungen“, `--ekranoj liste,detail`, `--max-tokens 250000`, auf `5a912063`; Schätzung vor dem Start „2 Screens × 3 Runden (Variante F) + Plananfrage ≈ 245.000 Tokens, ≈ 0,049 $“.

| | komuna | provo |
|---|---|---|
| Start (UTC) / Prüfprotokoll | 13:39:39Z, frei | 13:41:43Z, frei (nach zwei Ablehnungen) |
| Tokens ein / aus · Anfragen · Werkzeugaufrufe | 210 402 / 2 995 · 12 · 42 | 207 672 / 2 284 · 14 · 49 |
| Kosten · Dauer | 0,042679 $ · 61,9 s | 0,041991 $ · 55,2 s |
| Last vor → nach (1/5/15, 10 Kerne) | 11.58 10.09 12.10 → 8.40 9.40 11.69 (**Last > Kerne**, Dauer nicht vergleichbar) | 6.15 8.59 11.23 → 6.13 8.22 10.92 |
| fremde Messung | nein | nein |
| Runden gebaut / Halt | 2 / Tokengrenze (verbraucht 213 397) | 1 / Tokengrenze in Runde 2 bei liste (verbraucht 209 956) |
| liste | R1 98,8 → R2 100 (K1–K5 = 1, axe 0/0), nicht grün: toter Verweis `edit.html` | **leer** (0 Bytes, K1 = 0, Befund S037-10-1) |
| detail | **leer** in R1 (Befund S037-10-1), R2 nicht neu gebaut | R1 94,9 (K2 0,963, K3 0,7: `uzo-slot-accepts` ×2, `uzo-slot-nesting` an `fm-karto`), Navigation vollständig |
| grün | 0 von 2 | 0 von 2 |
| Übersicht · Bericht | [superrigardo.html](file:///Users/thorstenjankowski/n8n-compose/20260918_fundamento-ds/.fundamento/spec037/abnahme/komuna/superrigardo.html) · [raporto.md](file:///Users/thorstenjankowski/n8n-compose/20260918_fundamento-ds/.fundamento/spec037/abnahme/komuna/raporto.md) | [superrigardo.html](file:///Users/thorstenjankowski/n8n-compose/20260918_fundamento-ds/.fundamento/spec037/abnahme/provo/superrigardo.html) · [raporto.md](file:///Users/thorstenjankowski/n8n-compose/20260918_fundamento-ds/.fundamento/spec037/abnahme/provo/raporto.md) |

**AC-6 (Ordner):** beide Ordner haben die Form – 2 Screens, Übersicht mit Links auf beide Screens und den Bericht, vier Fotos hell/dunkel (1280×900), `raporto.md/json` mit allen Abschnitten inklusive „Lücken (Teil 3)“ und „Halt“, `mankoj.json`. Der Lauf beweist den Ablauf, nicht die Qualität. **AC-7 (Marke):** Rahmen `data-fm-aspekto="provo"` bzw. `komuna`; 0 Farbliterale (Hex, `rgb(`, `hsl(`, `--fm-…:`, `style=`) in allen 6 Fragmentdateien; die Fotos zeigen die Hintergründe und Aktionsfarben der jeweiligen Marke; die beiden zufällig gleichen (leeren) Fragmente komuna/detail und provo/liste rendern mit verschiedenen Markenhintergründen. Strenger Nachweis: `test:browser` (T3710, gleiches HTML, `rgb(27, 27, 27)` gegen `rgb(98, 65, 154)`; D-167).

### F gegen 0 und Runde 1 gegen Runde 3, je Aufgabe und Screen (2.3, 2.4)

Lauf `20261031-1342` auf `07585b5e`, `--taskoj anmelden-und-konto,liste-filter-detail,formular-in-schritten,einstellungen-konto --varianten F,0 --ripetoj 1 --max-tokens 2000000`; Schätzung der cli 1 764 000 Tokens, 0,3528 $. Gesamt 1 950 018 / 27 632 Tokens, 91 Anfragen, 0,39553 $, 607,4 s, Last 6.13 8.22 10.92 → 6.94 9.44 10.69 bei 10 Kernen, **gestört** (fremde Messung ab 13:49:32Z), **Teilergebnis: 3 von 8 Teilläufen**. Bericht: [raporto.md](file:///Users/thorstenjankowski/n8n-compose/20260918_fundamento-ds/.fundamento/spec037/ablauf/messpunkt-1/20261031-1342/raporto.md) (die Messung schreibt keine Übersichtsseite). Marken: komuna, ekzemplo, provo, provo-kompakta × hell/dunkel, Kontrast Standard (D-39); nicht 1:1 mit Seitenwerten der Reihe K vergleichbar.

**Streuung Reihe K: 16,7 Punkte** (Quelle `specs/034-nachlese-12/plan.md`, „Streuung (H 9,8, K 16,7)“); |Δ| bis 16,7 ist mit „≈“ markiert (innerhalb der Streuung).

| Aufgabe | Runde | Total F | Total 0 | Δ F−0 | Navigation F / 0 | Muster F / 0 | gestört |
|---|---|---|---|---|---|---|---|
| anmelden-und-konto | 1 | 73,6 | 41,2 | +32,4 | 0 / 0,83 | 0,5 / 0,75 | F nein · 0 ja (letzte ≈ 90 s) |
| anmelden-und-konto | 3 | 94,5 | 43 | **+51,5** | 0,33 / 0,83 | 0,5 / 0,75 | wie oben |
| liste-filter-detail | 1 | 25,3 (1 von 3 gebaut) | – | – | 0 / – | 1 / – | ja |
| liste-filter-detail | 3 | – (Halt Tokengrenze in Runde 1) | – | – | – | – | – |
| formular-in-schritten, einstellungen-konto | 1, 3 | nicht gestartet (Tokengrenze) | | | | | – |

**Runde 1 gegen Runde 3:** `anmelden-und-konto` F 73,6 → 94,5 (**+20,9**, über der Streuung), 0 41,2 → 43 (+1,8 ≈); Navigation F 0 → 0,67 (R2) → 0,33 (R3).

| Screen (anmelden-und-konto) | F R1 | F R3 | 0 R1 | 0 R3 | Δ F−0 (R3) | grün F |
|---|---|---|---|---|---|---|
| anmelden | 0 (leeres Fragment, S037-10-1) | 83,3 (K4 = 0) | 44,4 | 44,4 ≈ | +38,9 | nein |
| registrieren | 95,8 | 95,8 ≈ | 37 | 44,4 ≈ | +51,4 | ja, seit Runde 1 |
| passwort-vergessen | 99,2 | 99,2 ≈ | 44,4 | 44,4 ≈ | +54,8 | ja, seit Runde 1 |
| konto | 99,5 | 99,7 ≈ | 38,9 | 38,9 ≈ | +60,8 | nein (Navigation unvollständig) |
| **liste-filter-detail** standards-liste | 75,9 (K4 = 0, K3 0,83) | – | – | – | – | nein |
| standard-detail, standard-verlauf | nicht gebaut (Tokengrenze) | | | | | |

In Variante 0 gelten K2/K3 nicht; K4 = K5 = 0 in jeder Runde (keine Eroj), grün nie.

| Teillauf | Runden | Halt | Tokens ein / aus | Anfragen | Werkzeug | Dauer | $ | Last vor → nach (1 min) | gestört |
|---|---|---|---|---|---|---|---|---|---|
| anmelden-und-konto F | 3 | – | 1 404 652 / 12 780 | 62 | 153 | 323,4 s (Last > Kerne) | 0,2835 | 6,56 → 24,4 | nein (Wächter und `mezuri` 13:43–13:48Z ohne Treffer) |
| anmelden-und-konto 0 | 3 | – | 19 450 / 10 783 | 12 | 0 | 175,6 s (Last > Kerne) | 0,006 | 24,4 → 6,91 | ja, etwa die letzten 90 s |
| liste-filter-detail F | 1 | Tokengrenze bei standard-detail | 525 916 / 4 069 | 17 | 43 | 100 s | 0,106 | 6,91 → 6,94 | ja, ganz |
| 5 weitere | 0 | nicht gestartet (verbraucht 1 977 650) | 0 | 0 | 0 | 0 | 0 | – | – |

Die Zeitabschnitte der Störung sind aus den Dauern ab 13:42:39Z abgeleitet (ungefähr); `mezuri` sah 036-Prozesse bei den Proben 13:49:40Z, 13:50:40Z, 13:51:40Z, 13:52:40Z (24, 6, 6, 7 Prozesse, `playwright` und Browser in `/tmp/s036-t1/packages/eroj`). **Einziger ungestörter Messwert: `anmelden-und-konto` Variante F;** seine Dauer ist wegen Last > Kerne nicht vergleichbar. Nicht wiederholt (D-164).

### Wiederholung auf dem dann aktuellen `main` (2.5)

**Blockiert** (D-174): `origin/main` ist am Ende des Laufs `f2b5a058` (nach `git fetch` 2026-10-31T14:00Z), Spec 036 hat keinen PR, Teil 5 ist nicht gemergt. Kein Lauf, keine Kosten; Scheibe Wiederholung 0,40 $ unberührt. Anleitung, Befehl und Schätzung: Abschnitt „Blockiert“ und „Messanleitung“ › Teil 2.5. Einen zweiten Stand zum Vergleich gibt es deshalb nicht; Bezugswert für die Wiederholung ist `anmelden-und-konto` F/0 oben.

## Prüfprotokoll Messsperre

Jede Freigabeentscheidung vor einem Modelllauf (D-08, AC-13), Abschrift von `.fundamento/spec037/pruefprotokoll.tsv` (alle 5 Zeilen; Wächter `gardisto`, Probe von `mezuri` direkt vor dem Start):

| Zeit (UTC) | Lauf | Stand (seit, Alter) | Treffer Prozesse | Treffer plan 036 | Last 1/5/15 | Kerne | Entscheidung | Grund |
|---|---|---|---|---|---|---|---|---|
| 13:39:39Z | abnahme-komuna | frei (13:39:27Z, 12 s) | 0 | 0 | 11.58 10.09 12.10 | 10 | frei – Lauf startet | frei seit 13:39:27Z, keine Treffer |
| 13:40:42Z | abnahme-provo | frei (13:39:27Z, 14 s) | 7 | 0 | 8.40 9.40 11.69 | 10 | belegt – abgelehnt | 7 Messprozesse jetzt (playwright, browser) |
| 13:41:12Z | abnahme-provo | frei (13:39:27Z, 45 s) | 3 | 0 | 7.28 9.03 11.47 | 10 | belegt – abgelehnt | 3 Messprozesse jetzt (playwright) |
| 13:41:43Z | abnahme-provo | frei (13:39:27Z, 15 s) | 0 | 0 | 6.15 8.59 11.23 | 10 | frei – Lauf startet | frei seit 13:39:27Z, keine Treffer |
| 13:42:39Z | messpunkt-ablauf | frei (13:39:27Z, 11 s) | 0 | 0 | 6.13 8.22 10.92 | 10 | frei – Lauf startet | frei seit 13:39:27Z, keine Treffer |

Läufe (`.fundamento/spec037/laeufe.tsv`):

| Lauf | Zweck | Start → Ende (UTC) | Dauer | Exit | Commit | Last vor → nach | Kerne | fremde Messung | Markierung | gebucht | Log |
|---|---|---|---|---|---|---|---|---|---|---|---|
| abnahme-komuna | 1.8 komuna | 13:39:39Z → 13:40:41Z | 61,9 s | 0 | `5a912063` | 11.58 10.09 12.10 → 8.40 9.40 11.69 | 10 | nein | Last > Kerne, Zeitwerte nicht vergleichbar | ja 0,042679 $ | `/tmp/s037-logs/abnahme-komuna.log` |
| abnahme-provo | 1.8 provo | 13:41:43Z → 13:42:38Z | 55,2 s | 0 | `5a912063` | 6.15 8.59 11.23 → 6.13 8.22 10.92 | 10 | nein | ok | ja 0,041991 $ | `/tmp/s037-logs/abnahme-provo.log` |
| messpunkt-ablauf | 2.4 Messpunkt | 13:42:39Z → 13:52:47Z | 607,4 s | 0 | `07585b5e` | 6.13 8.22 10.92 → 6.94 9.44 10.69 | 10 | **ja** | **gestört** | danach mit `kosten buchen` aus dem Bericht (D-163) | `/tmp/s037-logs/messpunkt-ablauf.log` |

Verlauf der Sperre (Wächter, `sperre.tsv`): belegt 10:45:47Z, frei 11:10:56Z, belegt 11:17:58Z, frei 11:29:04Z, belegt 11:46:45Z, frei 11:52:49Z, belegt 12:13:20Z, **frei 13:39:27Z**, belegt 13:49:32Z (Prozesse von 036 in `/tmp/s036-t1-form`, `/tmp/s036-1.4-ac3`, `/tmp/s036-t1`); am Ende von S037-12 (14:00Z) weiter „belegt seit 13:49:32Z“. Die Treffer um 13:40:42Z/13:41:12Z (gestartet 13:40:44Z, nach dem Ende von komuna) sah nur `mezuri`, nicht der Wächter (Befund S037-10-3). Bewertung AC-13: D-180.

## Modellkosten

Nur `ministral-14b-2512`, eigenes Ledger `kostoj.tsv` unter `/Users/thorstenjankowski/n8n-compose/20260918_fundamento-ds/.fundamento/spec037/` (D-10), Scheiben nach D-11. **Summe 0,4802 $ von 1,00 $.** Kein 429, keine Tagesgrenze.

| Lauf-ID | Zweck | Modell | Anfragen | Tokens ein / aus | Kosten $ | Dauer | Commit | Last vor / nach | Kerne | fremde Messung |
|---|---|---|---|---|---|---|---|---|---|---|
| abnahme-komuna | 1.8 komuna | ministral-14b-2512 | 12 | 210 402 / 2 995 | 0,042679 | 61,9 s | `5a912063` | 11.58 10.09 12.10 / 8.40 9.40 11.69 | 10 | nein |
| abnahme-provo | 1.8 provo | ministral-14b-2512 | 14 | 207 672 / 2 284 | 0,041991 | 55,2 s | `5a912063` | 6.15 8.59 11.23 / 6.13 8.22 10.92 | 10 | nein |
| messpunkt-ablauf | 2.4 Messpunkt | ministral-14b-2512 | 91 | 1 950 018 / 27 632 | 0,39553 | 607,4 s | `07585b5e` | 6.13 8.22 10.92 / 6.94 9.44 10.69 | 10 | ja |
| **Summe** | | | **117** | **2 368 092 / 32 911** | **0,4802** | | | | | |

`/tmp/s037-werkzeug/kosten stand` (2026-10-31, 14:00Z):

```
Scheibe abnahme: gebucht 0.08467 $ · reserviert 0.00 $ · Obergrenze 0.10 $
Scheibe messpunkt: gebucht 0.39553 $ · reserviert 0.00 $ · Obergrenze 0.40 $
Scheibe wiederholung: gebucht 0.00 $ · reserviert 0.00 $ · Obergrenze 0.40 $
Scheibe reserve: gebucht 0.00 $ · reserviert 0.00 $ · Obergrenze 0.10 $
Summe gebucht 0.4802 $ · offen reserviert 0.00 $ · belegt 0.4802 $ von 1.00 $ · Modell nur ministral-14b-2512
```

Übrig 0,5198 $: Wiederholung 0,40 $ (für 2.5), Reserve 0,10 $, Rest der Scheiben Abnahme 0,01533 $ und Messpunkt 0,00447 $.

## Lückenliste

Über alle Läufe (Teil 3, 3.1), Eingabe für Eroj-Runde 6/7, Muster-Runde 2 und den Gvidanto; erzeugt mit `fm ekranoj mankoj <ordner…>` (`packages/ekranoj/src/mankoj.ts`). Jeder Lauf schreibt seine Lücken nach `mankoj.json` und als Tabelle in `raporto.md`.

**Quellen je Lauf (C-7, D-106):** K5-Lücken der Bewertung im letzten Stand eines Screens (`rebuilt-ero`, `raw-value`), `check_usage`-Fehler im letzten Stand, `suggest_ero`-Aufrufe ohne Treffer (D-108), Lücken aus dem ```` ```mankoj ````-Block des Agenten; gewünschte Werkzeuge, die der Gvidanto hat, fallen weg.

**Feste Regeln (D-107):** Art – `rebuilt-ero` → `ero`; `raw-value` einer Layout-Eigenschaft → `sxablono`, sonst `ero`; `check_usage` → `ero`; `suggest_ero` ohne Treffer → `ero`; Agent → wie gemeldet. Ziel aus der Art – `ero` → `eroj-rondo-6/7`, `sxablono` → `muster-rondo-2`, `ilo` → `gvidanto`. Über Läufe: Anzahl summiert, Aufgaben `<Lauf>/<Screen>` vereinigt, Reihenfolge Anzahl absteigend, dann Name (D-111).

**Ergebnis der echten Läufe (S037-10, ersetzt die erste Füllung aus Rauchläufen von S037-06):**

```
cd /Users/thorstenjankowski/n8n-compose/20260918_fundamento-ds
S=.fundamento/spec037
node /tmp/s037-a/packages/cli/dist/index.js ekranoj mankoj $S/abnahme/komuna $S/abnahme/provo $S/ablauf/messpunkt-1 /tmp/s037-logs/smoke/261031-s037-06-k1 --out $S/mankoj-alle.json
```

Alle Läufe – 7 Lücken aus 4 Ordnern (`.fundamento/spec037/mankoj-alle.json`); Spalte „Ziel“ = Ziel nach D-107, Spalte „gilt für“ = Einordnung durch S037-12:

| # | Art | Lücke | Anzahl | Aufgaben | Beispielstelle | Vorschlag | Ziel | gilt für |
|---|---|---|---|---|---|---|---|---|
| 1 | ero | Ero für a | 4 | messpunkt-1/20261031-1342/anmelden-und-konto/0/1/{anmelden, konto, passwort-vergessen, registrieren} | anmelden.html: a nachgebaut | Eine Ero für a anbieten oder suggest_ero und den Gvidanto auf die bestehende Ero führen lassen. | eroj-rondo-6/7 | **kein Ziel** – Variante 0 ohne Eroj (Absicht, S037-10-7) |
| 2 | ero | Ero für h1 | 4 | wie 1 | anmelden.html: h1 nachgebaut | wie 1 | eroj-rondo-6/7 | **kein Ziel** – Variante 0 |
| 3 | ero | Ero für button | 3 | …/anmelden-und-konto/0/1/{anmelden, passwort-vergessen, registrieren} | anmelden.html: button nachgebaut | wie 1 | eroj-rondo-6/7 | **kein Ziel** – Variante 0 |
| 4 | ero | Ero für input | 3 | wie 3 | anmelden.html: input nachgebaut | wie 1 | eroj-rondo-6/7 | **kein Ziel** – Variante 0 |
| 5 | ero | Regulo uzo-slot-accepts | 2 | messpunkt-1/20261031-1342/liste-filter-detail/F/1/standards-liste, provo/detail | standards-liste.html: fm-tabelo „Standards“ | Die Regulo blieb bis zur letzten Runde verletzt: eine passende Variante der Ero anbieten oder den Vorschlag der Regulo im Gvidanto schärfen. | eroj-rondo-6/7 | **Eroj-Runde 6/7** (`fm-tabelo`, `fm-karto`) |
| 6 | ero | Regulo uzo-slot-nesting | 2 | wie 5 | standards-liste.html: fm-plenstato „Noch keine Standards. Lege den ersten an.“ | wie 5 | eroj-rondo-6/7 | **Eroj-Runde 6/7** (`fm-plenstato`, `fm-karto`) |
| 7 | ilo | list_arangxoj | 2 | 261031-s037-06-k1/{detail, liste} (Rauchtest, Attrappen-Modell) | Abstand zwischen Titel und Text | Lesewerkzeug, das die Layoutmittel nennt | gvidanto | **Gvidanto** (MG-1); aus keinem echten Lauf |

Nur Variante F (`.fundamento/spec037/mankoj-nur-F.json`, D-166) – 3 Lücken: `uzo-slot-accepts` ×2 (`fm-tabelo`, `fm-karto`) → Eroj-Runde 6/7; `uzo-slot-nesting` ×2 (`fm-plenstato`, `fm-karto`) → Eroj-Runde 6/7; `list_arangxoj` ×2 (nur Rauchtest) → Gvidanto.

**Lesart:** Aus den echten Läufen kam kein `mankoj`-Block des Agenten und kein `suggest_ero`-Fehltreffer; alle echten Lücken sind verbliebene Regulo-Verstöße an Slots. **Muster-Runde 2:** keine Lücke mit diesem Ziel in den echten Läufen – Kandidaten sind MG-1 (Layoutmittel) und der Muster-Wert von D-06 (F 0,5 gegen 0 0,75 in `anmelden-und-konto`). Weitere Kandidaten für Eroj-Runde 6/7 aus den Befunden: Uzo von `ligilo` (S037-04-1), Schrittanzeige (S037-06-3). Die Liste ist dünn, weil der Messpunkt nur 1¼ Abläufe deckt (Befund S037-10-2); 2.5 sollte sie füllen.

## Konfliktprüfung und Merge-Position

S037-11 (2026-10-31, 12:30–12:45Z), Nachprobe S037-12 (14:00Z, D-182). `origin/main` = `f2b5a0585b772dc4cd83eb672a4bd956242610a8` (unverändert seit dem Start, Basis von 036 und 037); kein Teil von Spec 036 ist auf `main`, der Fall „`main` hat sich bewegt“ trifft nicht zu.

### PRs

| PR | Nummer | Basis | Kopf | CI (letzter Lauf auf Code-Stand) | Stand |
|---|---|---|---|---|---|
| A „Spec 037 – Ablauf Screens“ | [#131](https://github.com/thojank/fundamento/pull/131) | `main` | der Doku-Commit von S037-12 (Code-Stand `5a912063`) | [41200798254](https://github.com/thojank/fundamento/actions/runs/41200798254) auf `5a912063`: success, 15/15 | offen, kein Entwurf, nicht gemergt, kein Auto-Merge |
| B „Spec 037 – Messung“ | [#132](https://github.com/thojank/fundamento/pull/132) | `261031-spec-037-ekranoj` (#131) | auf den Doku-Commit von S037-12 neu aufgesetzt; vorher `07585b5e` (aktueller Kopf und SHAs im PR-Text, D-178) | [41201263661](https://github.com/thojank/fundamento/actions/runs/41201263661) auf `07585b5e`: success, 15/15 | offen, kein Entwurf, nicht gemergt, gestapelt auf #131 |

### PRs und Branches von Spec 036

| Suche | Ergebnis |
|---|---|
| `gh pr list --state open --search "Spec 036 in:title"` / `--state all --search "036"` | keine 036-PRs (offen, geschlossen oder gemergt); 14:00Z erneut: keine |
| gepushte 036-Branches | `origin/261031-spec-036-t1-abnahme` `e49b4002` (Doku-Gerüst Teil 1, kein PR) |
| lokale, ungepushte 036-Branches (nur Refs gelesen) | S037-11: `t1-form` `8f5e56ff`, `t1-figma` `119518c6`, `t1-assistent` `3f594d56`, `t6-neutrale-namen` `95b3bd61`; S037-12: `t1-abnahme` lokal `ff20545f`, `t6-neutrale-namen` `fd27376b` (bewegt), übrige unverändert; Teil 2a/2b, 3, 4, 5 existieren noch nicht |

**Reihenfolge von 036** (plan von 036, „Merge-Reihenfolge mit Konfliktprüfung“): Teil 1 → 2a → 2b → ②b-2 → ②b-3 → ②b-4 → ②b-5 → ③ (Teil 5) → Teil 3 → Teil 4 → **Teil 6** (vorher auf dem dann aktuellen `main` durch erneutes Ausführen des Skripts neu aufgesetzt, 036 D-33). „Nach Teil 5“ heißt für 037 deshalb: **nach dem letzten der Teile 1–5 in der 036-Reihenfolge (Teil 4), vor Teil 6.**

### Überschneidende Dateien

PR A = `origin/main...origin/261031-spec-037-ekranoj` (63 Dateien), PR B = `…-ekranoj...…-mezuro` (28 Dateien).

| 036-Stand | Dateien | ∩ PR A | ∩ PR B |
|---|---|---|---|
| Teil 1 Doku `origin/…-t1-abnahme` `e49b4002` (gepusht, kein PR) | 3 | – | – |
| Teil 1 Doku lokal `ff20545f` (S037-12) | 55 | – | – |
| Teil 1 Form/G5 `t1-form` `8f5e56ff` (lokal) | 29 | – | – |
| Teil 1 Figma `t1-figma` `119518c6` (lokal) | 8 | – | – |
| Teil 1 Assistent `t1-assistent` `3f594d56` (lokal) | 17 | – | – |
| Teil 6 `t6-neutrale-namen` `95b3bd61` → `fd27376b` (lokal) | 39 → 43 | `.github/workflows/ci.yml`, `packages/modelo/src/ci/workflow.test.ts` (Graubereich) | – |

Nur der Graubereich überschneidet sich, wie erwartet.

**Graubereich-Dateien (AC-3):**

| Datei | 037 (PR A) | 036 (wo berührt) | Probemerge |
|---|---|---|---|
| `pnpm-lock.yaml` | +34 Zeilen (Importer `packages/ekranoj`, `packages/cli`, `packages/nordstelo`) | in keinem 036-Branch | – |
| `.github/workflows/ci.yml` | ein Wort `ekranoj` in der `unit`-Matrix | 036 Teil 6 (lokal): Schritt „Check: Privat“ | sauber, automatisch; Endstand enthält beides |
| `packages/modelo/src/ci/workflow.test.ts` | ein Wort `ekranoj` in `UNIT_PACKAGES` | 036 Teil 6 (lokal): Eintrag `check:privat` in `CHECK_STEPS` | sauber, automatisch; Endstand enthält beides |
| `packages/modelo/src/workspace.test.ts` | eine Zeile `ekranoj` (D-59) | in keinem 036-Branch | – |
| `CHANGELOG.md` | nicht berührt | 036 Teil 1 (`t1-form`) und Teil 6 | Konflikt nur 036-intern (S037-11-2) |

PR B berührt keine Graubereich-Datei.

### Probemerges (`git merge-tree --write-tree`)

**Verbindlich (gepushte Stände, S037-11; Log `/tmp/s037-logs/s037-11-merge-tree.log`):**

| Schritt | Basis | Kopf | Ergebnis |
|---|---|---|---|
| 1 | `origin/main` `f2b5a058` | 036 Teil 1 (Branch, ohne PR) `e49b4002` | sauber |
| 2 | Schritt 1 | PR A `5a912063` | sauber |
| 3 | Schritt 2 | PR B `07585b5e` | sauber |
| 4 | Schritt 3 | 036 Teil 6 | entfällt: kein PR, kein gepushter Branch |
| Gegenprobe | `main` → A → B → 036 Teil 1 | | sauber, gleicher Endbaum (Reihenfolge ohne Einfluss) |

**Vorschau (lokale 036-Branches, S037-11 12:34Z, D-170; Log `/tmp/s037-logs/s037-11-merge-tree-vorschau.log`):** `main` → Teil 1 Doku → `t1-form` → `t1-figma` → `t1-assistent` → **PR A** → **PR B**: jeder Schritt sauber; → 036 Teil 6 `95b3bd61`: Konflikt `CHANGELOG.md` (036-intern, mit und ohne 037 dieselben Blobs), `ci.yml` und `workflow.test.ts` automatisch sauber; Endstand mit Matrix `[agordilo, cli, ekranoj, mcp, metiejo, modelo, nordstelo]` **und** Schritt „Check: Privat“.

**Nachprobe (S037-12, 14:00Z, D-182):** paarweise gegen den Kopf von PR B `07585b5e` (enthält A): `t1-abnahme` `ff20545f`, `t1-form`, `t1-figma`, `t1-assistent`, `t6-neutrale-namen` `fd27376b` – alle sauber. Seitdem änderte A nur `specs/037-agenten-ekranoj/` (keine Datei von 036).

**Auflösungswege** (wenn Teil 2–5 dazukommen): Lockfile nicht von Hand mischen, `pnpm install` neu erzeugen und committen; CI-Matrix, `workflow.test.ts`, `workspace.test.ts` – beide Wörter bzw. Zeilen behalten; `CHANGELOG.md` – beide Einträge behalten; erzeugte Dateien von 036 (036 D-26) berührt 037 nicht.

### Teil-6-Skript (`scripts/neutrale-namen/codemod.mjs`)

**Skript noch nicht im PR** (nur auf dem lokalen Branch `261031-spec-036-t6-neutrale-namen`). Trotzdem in S037-11 auf einer Kopie geprobt (D-171), Scratch-Worktree danach gelöscht:

| Probe | Ergebnis |
|---|---|
| a) Kopie von PR B `07585b5e`, Trockenlauf | 3 794 Dateien, 748 würden sich ändern, **0 davon 037-Dateien** |
| b) dieselbe Kopie, echter Lauf | 749 Dateien geändert; `git status --porcelain -- <037-Pfade>` **leer**; keine Graubereich-Datei von 037 geändert |
| c) zweiter Lauf `--check` | Exit 0 (idempotent) |
| d) Endstand der Vorschau (mit A, B, Teil 6) | 748/749 Änderungen, 0 in 037-Dateien |
| e) `check:privat` von 036 (Suche nach dem Wort aus R-12) auf d) | vor dem Skript Exit 1 (749 Dateien, **keine aus 037**); nach dem Skript **Exit 0, 0 Treffer** |

Das Skript hat in 037 nichts umzubenennen, die Prüfung von 036 bleibt mit 037 grün.

### Später prüfen (sobald PRs von 036 existieren, vor jedem Merge)

1. `gh pr diff <nr> --name-only` ∩ Dateien von PR A/B.
2. Skript aus dem PR von Teil 6 auf einer Kopie von PR B (bzw. von `main` nach A/B) ausführen; `git status --porcelain -- packages/ekranoj packages/cli/src/commands/ekranoj.ts packages/cli/src/ekranoj.test.ts packages/nordstelo/src/ablauf packages/nordstelo/test/fixtures/ablauf packages/nordstelo/src/ekrano-taksilo.ts packages/nordstelo/src/ekrano-taksilo.test.ts specs/037-agenten-ekranoj` muss leer sein.
3. `pnpm check:privat` auf dem Endstand grün.
4. Kette `main` → 036 Teil 1 … Teil 4 → A → B → Teil 6 mit `git merge-tree --write-tree` wiederholen.

### Merge-Position (Q-2)

**PR A und dann PR B nach dem letzten Teil von 036 Teil 1–5 (in der 036-Reihenfolge Teil 4), vor 036 Teil 6.** Gründe:

1. Keine Datei von 037 überschneidet sich mit Teil 1 (alle Spuren) außer im Graubereich; alle Probemerges mit 037 sind sauber, der Endbaum hängt nicht von der Reihenfolge Teil 1 ↔ 037 ab.
2. Die einzigen gemeinsamen Dateien mit Teil 6 (`ci.yml`, `workflow.test.ts`) mergen automatisch; jedes Wort bleibt erhalten.
3. Teil 6 wird nach 036 D-33 ohnehin zuletzt auf das dann aktuelle `main` neu aufgesetzt und das Skript erneut ausgeführt; liegt 037 dann auf `main`, deckt dieser Lauf 037 mit ab (Probe: 0 Änderungen in 037, `check:privat` grün).
4. Spec 037 misst auf „Spec 036 bis Teil 5“ (Wiederholung 2.5); die Messung braucht die Eroj-Arbeit von Teil 5 vor dem Merge von 037.
5. Teile 2–5 von 036 existieren noch nicht; in deren spec/plan/tasks kommt keiner der 037-Pfade vor. Ein Konflikt ist höchstens im Lockfile zu erwarten (neu erzeugen).

## Messanleitung

Alle Befehle im Checkout des Maintainers `/Users/thorstenjankowski/n8n-compose/20260918_fundamento-ds` (der Lauf selbst hat dort nie Branch gewechselt, installiert oder gebaut). Vorher den eigenen Arbeitsstand sichern (`git status`), danach mit `git switch -` zurück. Branches werden losgelöst ausgecheckt (`--detach`, D-181), weil Branch B mit `--force-with-lease` neu geschrieben wird. Nur `mistral/ministral-14b-2512` ist erlaubt; ein anderes Modell in `.env` endet mit Exit 2 vor jeder Anfrage; der Schlüssel wird nie ausgegeben.

**Ohne Kosten ansehen (Ergebnisse des Laufs):** Abnahme komuna file:///Users/thorstenjankowski/n8n-compose/20260918_fundamento-ds/.fundamento/spec037/abnahme/komuna/superrigardo.html · provo file:///Users/thorstenjankowski/n8n-compose/20260918_fundamento-ds/.fundamento/spec037/abnahme/provo/superrigardo.html · Messpunkt file:///Users/thorstenjankowski/n8n-compose/20260918_fundamento-ds/.fundamento/spec037/ablauf/messpunkt-1/20261031-1342/raporto.md

**Kostenschätzung mit den gemessenen Werten (Befund S037-10-2, behoben in S037-13, D-186):** die Schätzung, die `fm ekranoj` und die Messung vor dem Start drucken, rechnet jetzt mit 70 000 Tokens je Screen-Runde in Variante F (Abnahme gemessen); der Messpunkt brauchte ≈ 176 000 (mehr Werkzeugaufrufe). Preis 0,20 $ je 1 Mio. Tokens (ein und aus). Die Grenze `--max-tokens` hält immer (Halt vor der Anfrage, Teilbericht, Exit 0).

### Teil 1 und 3 – `fm ekranoj` (PR A)

```sh
cd /Users/thorstenjankowski/n8n-compose/20260918_fundamento-ds
git status
git fetch origin
git switch --detach origin/261031-spec-037-ekranoj
pnpm install --frozen-lockfile && pnpm build

# komuna (Standard), zwei Screens
node packages/cli/dist/index.js ekranoj "Eine Verwaltung für Standards mit Liste, Detail, Bearbeiten und Einstellungen" \
  --ekranoj liste,detail --env .env --max-tokens 250000 --ja

# provo: gleicher Satz, andere Marke
node packages/cli/dist/index.js ekranoj "Eine Verwaltung für Standards mit Liste, Detail, Bearbeiten und Einstellungen" \
  --ekranoj liste,detail --config packages/modelo/test/fixtures/valid/aspekto-provo/fundamento.config.json \
  --env .env --max-tokens 250000 --ja

# Lückenliste über alle eigenen Läufe
node packages/cli/dist/index.js ekranoj mankoj .fundamento/ekranoj

git switch -
```

Erwartet:

- Erste Zeile vor jeder Anfrage: `Schätzung: 2 Screens × 3 Runden (Variante F) + Plananfrage ≈ 425.000 Tokens, ≈ 0,085 $ (mistral/ministral-14b-2512); über der Grenze von 250.000 Tokens – der Lauf hält vorher an und liefert ein Teilergebnis.` (seit S037-13 mit dem gemessenen Wert, D-186). **Gemessen** (S037-10): nach Plan und 3 Bauten ≈ 213 000 Tokens (0,043 $) – mit 250 000 endet der Lauf nach Runde 1–2 an der Tokengrenze (Teilbericht). Drei volle Runden mit 2 Screens brauchen ≈ 425 000–450 000 Tokens ≈ 0,09 $ (`--max-tokens 450000` – eine Entscheidung des Maintainers; der Lauf hat keine Grenze angehoben). Ohne `--ekranoj` plant der Agent bis zu 5 Screens (Schätzung ≈ 1 055 000 Tokens ≈ 0,21 $). Eine Antwort ohne Markup wird einmal nachgefragt; bleibt sie leer, steht `leere-antwort` im Bericht und die Rohantworten liegen redigiert in `rondoj/<n>/<slug>.respondo.txt`.
- Am Ende zwei Links: `Übersicht: file:///Users/thorstenjankowski/n8n-compose/20260918_fundamento-ds/.fundamento/ekranoj/<JJMMTT-HHMM>-eine-verwaltung-fuer/superrigardo.html` und `Bericht: file:///…/raporto.md` (provo in einem eigenen Ordner, in derselben Minute mit Suffix `-2`). Die Übersicht verlinkt jeden Screen; jeder Screen hat oben „Zur Übersicht“. provo-Screens tragen `data-fm-aspekto="provo"`.
- `fm ekranoj mankoj …` druckt die Tabelle `| # | Art | Lücke | Anzahl | Aufgaben | Beispielstelle | Vorschlag | Ziel |`; mit `--out <datei>` zusätzlich JSON.
- Echtes Chromium (für Fotos und axe) muss lokal installiert sein (`pnpm --filter @fundamento/eroj exec playwright install chromium`); ohne Browser gibt es keine Fotos, einen Satz im Bericht und keinen grünen Screen.

### Teil 2 – Messung „ganzer Ablauf“ (PR B)

```sh
cd /Users/thorstenjankowski/n8n-compose/20260918_fundamento-ds
git fetch origin
git switch --detach origin/261031-spec-037-mezuro
pnpm install --frozen-lockfile && pnpm build
node packages/nordstelo/dist/cli.js --art ablauf \
  --taskoj anmelden-und-konto,liste-filter-detail,formular-in-schritten,einstellungen-konto \
  --varianten F,0 --ripetoj 1 --max-tokens 2000000 \
  --out .fundamento/spec037/ablauf/messpunkt-2 --ledger .fundamento/spec037 \
  --env .env --json
git switch -
```

Erwartet: erste Logzeile „Schätzung: 8 Läufe, 3024000 Tokens, 0.6048 $; Grenze 2000000 Tokens.“ (seit S037-13 mit 70 000 je Screen-Runde F, D-186; vorher 1 764 000); Bericht `file:///Users/thorstenjankowski/n8n-compose/20260918_fundamento-ds/.fundamento/spec037/ablauf/messpunkt-2/<JJJJMMTT-HHMM>/raporto.md` und `raporto.json`; neu bauen ohne Modell mit `raporto(dir)` aus `packages/nordstelo/dist/ablauf/raporto.js`. **Gemessen** (S037-10): Variante F eines Ablaufs mit 4 Screens ≈ 1,4 Mio. Tokens ≈ 0,28 $ (3 Runden, früh grüne Screens nicht neu gebaut), Variante 0 ≈ 30 000 Tokens ≈ 0,006 $ – **mit 2 000 000 Tokens (0,40 $) wird etwa ein Ablauf F + 0 vollständig, der zweite nur angefangen.** Alle vier Abläufe vollständig: ≈ 4,5–5,7 Mio. Tokens ≈ 0,9–1,15 $ (über jeder Scheibe von D-11). Die Befunde S037-10-1 und S037-10-2 sind in S037-13 behoben.

### Teil 2.5 – Wiederholung auf dem dann aktuellen `main`

Erst nach dem Merge von Spec 036 bis einschließlich Teil 5 (in der 036-Reihenfolge bis Teil 4) und nachdem PR A auf das neue `main` und PR B auf PR A neu aufgesetzt sind (Schritte 4–6 im Bericht). Nur, wenn Spec 036 gerade nicht lokal misst (R-10). Befehl und Schätzung: Abschnitt „Blockiert“.

## Blockiert

### 2.5 Wiederholung auf dem dann aktuellen `main` (blockiert, D-174)

**Grund:** Teil 5 von Spec 036 ist nicht gemergt. Am Ende des Laufs (2026-10-31, 14:00Z, nach `git fetch origin`) ist `origin/main` = `f2b5a058` (Merge #129, Basis dieses Laufs); Spec 036 hat keinen PR, ihre Teile 2–5 existieren noch nicht. Kein Lauf, keine Kosten, keine Reservierung; Scheibe Wiederholung 0,40 $ frei.

**Vorher behoben (S037-13):** Befund S037-10-1 (leeres Fragment gilt als gebaut – jetzt eine Nachfrage, sonst `leere-antwort`, D-184) und Befund S037-10-2 (Schätzkonstante 70 000, D-186), rot/grün in PR A.

**Anleitung für den Maintainer** (nach den Schritten 4–6 im Bericht; Wächter optional: `/tmp/s037-werkzeug/gardisto stand` zeigt, ob 036 misst – nach einem Neustart des Rechners `gardisto start`; `/tmp` überlebt den Neustart nicht immer):

```sh
cd /Users/thorstenjankowski/n8n-compose/20260918_fundamento-ds
git status                                    # eigenen Stand sichern
git fetch origin
git log --oneline f2b5a058..origin/main       # muss die Teile 1–5 von Spec 036 zeigen
git switch --detach origin/261031-spec-037-mezuro   # PR B, neu aufgesetzt auf A, A auf dem neuen main
pnpm install --frozen-lockfile && pnpm build

W=/tmp/s037-werkzeug
$W/kosten reservieren wiederholung-ablauf "2.5 Wiederholung" 0,40
sysctl -n vm.loadavg; sysctl -n hw.ncpu       # Last vor dem Lauf (D-09)
node packages/nordstelo/dist/cli.js --art ablauf \
  --taskoj anmelden-und-konto,liste-filter-detail,formular-in-schritten,einstellungen-konto \
  --varianten F,0 --ripetoj 1 --max-tokens 2000000 \
  --out .fundamento/spec037/ablauf/wiederholung-1 --ledger .fundamento/spec037 \
  --env .env --json
sysctl -n vm.loadavg                          # Last nach dem Lauf
# Buchung aus .fundamento/spec037/ablauf/wiederholung-1/<id>/raporto.json (sumo: Anfragen, Tokens, $):
$W/kosten buchen wiederholung-ablauf ministral-14b-2512 <anfragen> <tokens-ein> <tokens-aus> <usd> <dauer-s> <commit> \
  "<last-vor 1 5 15>" "<last-nach 1 5 15>" <kerne> <ja|nein>
$W/kosten stand
git switch -
```

Im Stil des Laufs (Sperrprüfung, Prüfprotokoll, Last und Buchung automatisch über `mezuri`, Arbeitsverzeichnis muss unter `/tmp/s037-*` liegen):

```sh
P0=/Users/thorstenjankowski/.purple-code/worktrees/fundamento-wt-mvw886bqcbepzgxf/repos/fundamento
M=/Users/thorstenjankowski/n8n-compose/20260918_fundamento-ds; S=$M/.fundamento/spec037; W=/tmp/s037-werkzeug
git -C $P0 fetch origin
git -C $P0 worktree add --detach /tmp/s037-main2 origin/261031-spec-037-mezuro
(cd /tmp/s037-main2 && pnpm install --frozen-lockfile && pnpm build) > /tmp/s037-logs/s037-main2-build.log 2>&1
$W/kosten reservieren wiederholung-ablauf "2.5 Wiederholung" 0,40
nohup $W/mezuri wiederholung-ablauf "2.5 Wiederholung" --cwd /tmp/s037-main2 -- \
  node /tmp/s037-main2/packages/nordstelo/dist/cli.js --art ablauf \
  --taskoj anmelden-und-konto,liste-filter-detail,formular-in-schritten,einstellungen-konto \
  --varianten F,0 --ripetoj 1 --max-tokens 2000000 \
  --out $S/ablauf/wiederholung-1 --ledger $S --env $M/.env --json > /tmp/s037-logs/wiederholung-ablauf.mezuri 2>&1 &
# Exit 5 = Sperre nicht frei → später erneut; danach buchen wie D-163 (kosten buchen aus raporto.json → sumo)
# Aufräumen: git -C $P0 worktree remove /tmp/s037-main2
```

**Schätzung (ehrlich):** Die Messung druckt vor dem Start seit S037-13 3 024 000 Tokens ≈ 0,60 $ für vier Abläufe (70 000 je F-Screen-Runde, D-186; vorher 1 764 000 ≈ 0,35 $, Befund S037-10-2) – über der Grenze 2 000 000, also ein Teilergebnis. Nach den gemessenen Werten von S037-10 (≈ 176 000 Tokens je F-Screen-Runde, ≈ 1,4 Mio. Tokens ≈ 0,28 $ für `anmelden-und-konto` F, ≈ 0,006 $ für dessen Variante 0) trägt die Scheibe von **0,40 $ höchstens einen F-Ablauf mit 4 Screens und seine Variante 0**; der zweite Ablauf wird nur angefangen, die übrigen starten nicht (Teilbericht, Exit 0). Für einen sauberen Vergleich mit dem einzigen ungestörten Wert des ersten Messpunkts empfiehlt sich `--taskoj anmelden-und-konto` (≈ 1,43 Mio. Tokens ≈ 0,29 $). Beide Stände kommen in den Bericht (Abschnitt „Messungen“ › 2.5).

### 2.4 Rest des ersten Messpunkts (nicht gemessen, Budget)

Nicht gemessen: `liste-filter-detail` F Runde 2/3 (standard-detail und standard-verlauf nie gebaut) und 0; `formular-in-schritten` F/0; `einstellungen-konto` F/0; `uebersicht-kennzahlen` (schon in S037-08 ausgeschlossen, S037-08-2). **Grund:** Tokengrenze 2 000 000 (= Scheibe 0,40 $) nach 1 977 650 Tokens erreicht. **Schätzung für den Rest:** ≈ 3 × (1,1–1,4 Mio. F + 30 000 für 0) ≈ 3,4–4,3 Mio. Tokens ≈ 0,68–0,86 $ – passt in keine verbleibende Scheibe (Wiederholung 0,40 $ gehört 2.5, Reserve 0,10 $). **Befehl, falls der Maintainer Budget freigibt** (je Ablauf eine Reservierung; Präfix und Scheibe legt der Maintainer fest, das Werkzeug kennt nur `abnahme-`, `messpunkt-`, `wiederholung-`, `reserve-`):

```sh
cd /Users/thorstenjankowski/n8n-compose/20260918_fundamento-ds
W=/tmp/s037-werkzeug
$W/kosten reservieren <praefix>-liste-filter-detail "2.4 Rest" 0,40
node packages/nordstelo/dist/cli.js --art ablauf --taskoj liste-filter-detail --varianten F,0 --ripetoj 1 \
  --max-tokens 2000000 --out .fundamento/spec037/ablauf/messpunkt-2 --ledger .fundamento/spec037 --env .env --json
# danach kosten buchen aus .fundamento/spec037/ablauf/messpunkt-2/<id>/raporto.json → sumo (Befund S037-10-2 ist seit S037-13 behoben)
```

### Sonst

Keine weiteren Einträge. (Erledigt im Lauf: Modelo-Suite auf Branch A, S037-02 → `d944ff68`, D-59; „PR B wartet auf PR A“, S037-08 → #132.)

## Bericht

**Stand 2026-10-31 (S037-13, letztes Ticket).** Zwei PRs offen, keiner gemergt, keiner Entwurf, kein Auto-Merge: PR A [#131](https://github.com/thojank/fundamento/pull/131) (Basis `main`) und PR B [#132](https://github.com/thojank/fundamento/pull/132) (gestapelt auf #131, neu aufgesetzt auf den Doku-Commit von S037-13). `main` hat sich nicht bewegt (`origin/main` = `f2b5a058`, Merge #129); Spec 036 hat keinen PR. **Keine Budgets und keine Grenzen angehoben.** Modellkosten **0,4802 $ von 1,00 $**, nur `ministral-14b-2512`, eigenes Ledger. Lieferliste: **16 erledigt, 2 teilweise (1.8, 2.4), 0 offen, 1 blockiert (2.5)**. Abnahmekriterien: 15 erfüllt, AC-13 teilweise; jedes AC hat einen Test oder einen Prüfnachweis (Abschnitt „Testabdeckung“). S037-13: Befunde S037-10-1, -2, -6, -7 rot/grün behoben, integrierte Testsuite (cli, ekranoj, nordstelo), jede neue Prüfung an einer lokalen Mutation rot gesehen. Plan: https://github.com/thojank/fundamento/blob/261031-spec-037-ekranoj/specs/037-agenten-ekranoj/plan.md · Aufgaben: https://github.com/thojank/fundamento/blob/261031-spec-037-ekranoj/specs/037-agenten-ekranoj/tasks.md

### PRs je Teil

| Teil | PR | Basis | Kopf | CI-Stand (Lauf) | rot → grün |
|---|---|---|---|---|---|
| 1, 3, `specs/037-agenten-ekranoj/` | #131 https://github.com/thojank/fundamento/pull/131 | `main` (`f2b5a058`) | Doku-Commit von S037-13 (Code-Stand `5f184b93`) | grün 15/15 auf `5a912063`: [41200798254](https://github.com/thojank/fundamento/actions/runs/41200798254); auf dem Doku-Kopf von S037-12 `8dc670fd`: [41209238357](https://github.com/thojank/fundamento/actions/runs/41209238357) **15/15**; auf dem Code-Stand von S037-13 `5f184b93`: [41213019006](https://github.com/thojank/fundamento/actions/runs/41213019006) **success, 15/15**; auf dem Doku-Kopf von S037-13: im Hintergrund beobachtet (`/tmp/s037-logs/pr-131-ci-s13.log`, Stand im PR-Text) | Tabelle unten |
| 2 | #132 https://github.com/thojank/fundamento/pull/132 | `261031-spec-037-ekranoj` (#131) | neu aufgesetzt auf den Doku-Commit von S037-13, Kopf im PR-Text (vorher `1ae9894f`, davor `07585b5e`) | grün 15/15 auf `07585b5e`: [41201263661](https://github.com/thojank/fundamento/actions/runs/41201263661); auf `1ae9894f`: [41209342665](https://github.com/thojank/fundamento/actions/runs/41209342665) **15/15**; auf dem neuen Kopf: im Hintergrund beobachtet (`/tmp/s037-logs/pr-132-ci-s13.log`, Stand im PR-Text) | Tabelle unten |

**Rote und grüne Commits je Lieferpunkt:**

| PR | Lieferpunkt | rot | grün |
|---|---|---|---|
| A | 1.2, 1.5 Paket, Plan, Navigation, Grün, Modellwache; CI-Platz (D-15) | `f3137c13` | `999cf1c7` |
| A | Graubereich `workspace.test.ts` (D-59) | roter Stand `999cf1c7` | `d944ff68` |
| A | 1.2, 1.3, 1.5, 1.7 MCP-Client, Agent, Instanzen, Runden, Kosten | `f2fa007a` | `795a0b98` |
| A | 1.4, 1.6, 1.9 Rendern, Ausgabe, Markenfreiheit; Navigation mit `fm-ligilo` (S037-07-1) | `1a3ab821` | `0680245a` |
| A | 1.1, 1.7 Befehl `fm ekranoj`, Bewertungs-Adapter | `a74125cf` | `aba52f19` |
| A | 1.4 K1 unter `file://` (S037-05-1) | `6c256265` | `b5e9b25a` |
| A | Modelo-Clean-Room im Adapter-Test (S037-06-1) | roter Stand `a74125cf` | `25932e8b` |
| A | 3.1 Lückenliste `mankoj` | `74681016` | `4d7a1b27` |
| A | 1.3 Antwort ohne Markup (S037-10-1) | `d32e62bb` | `069ff999` |
| A | 1.7 Schätzung aus Messwerten (S037-10-2) | `73a63449` | `b0c6fa28` |
| A | 1.6, 3.1 übernommene Werte, Lücken der Variante 0 (S037-10-6, -7) | `bca52e70` | `54ead00b` |
| A | Tests gegen das integrierte Ergebnis (nur Tests, je an einer lokalen Mutation rot) | – | `efdaf90d`, `854cfad4`, `46cba39b`, `5f184b93` |
| A | Doku (spec, plan, tasks, Bericht) | – | `736a17cd`, `a6558e6a`, `48b1bd60`, `2d644fc7`, `cac6f213`, `a4270d0f`, `5a912063`, `8dc670fd`, Doku-Commit von S037-13 |
| B | 2.1, 2.2 Katalog, Muster, Bewertung | `f460e1ef` | `f7a58882` |
| B | 2.3 Lauf `--art ablauf` und Bericht | `8061cc29` | `53933318` |
| B | 2.3/3.1 `mankoj.json` je Messlauf | `7d0fa453` | `46021ce9` |
| B | 2.2 Navigation in ekranoj und Messung gleich | roter Stand = auf `5a912063` neu aufgesetzter Branch | `0651b957` |
| B | 2.2 Bewertung über `ekranoTaksilo` (keine Zahl geändert) | – (D-150) | `07585b5e` |
| B | AC-11 Ende zu Ende, Gleichlauf C-8/D-05, Katalogzahlen (nur Tests, je an einer lokalen Mutation rot) | – | `394acab6` (Stand auf A `5f184b93`, D-194) |

SHAs der Kette B bis S037-12 auf dem Stand `5a912063`, der Test-Commit von S037-13 auf `5f184b93`; nach jedem Neuaufsetzen tragen dieselben Patches neue SHAs (Liste im PR-Text #132, D-178, D-194). Tests (S037-13): A auf `5f184b93` ekranoj 134/134, cli 105/105, nordstelo 75/75, Modelo 4147/4147, Wächtertest Spec 035 AC-11 4/4, `pnpm build` 9/9, `pnpm lint` 20/20, `test:browser` 3/3 (lokal, echtes Chromium, 16,81 s); B nordstelo 130/130, ekranoj 134/134, cli 105/105, Modelo 4147/4147, `pnpm lint` 20/20. Kein Test ruft einen Anbieter oder das Netz; kein `.only`/`.skip`.

**Messanleitung je PR:** im plan, Abschnitt „Messanleitung“ (Checkout `/Users/thorstenjankowski/n8n-compose/20260918_fundamento-ds`, `cd`, `git switch --detach origin/<branch>`, `pnpm install --frozen-lockfile && pnpm build`, Befehle, `file://`-Links, Kosten mit gemessenen Werten). Einstieg ohne Kosten: file:///Users/thorstenjankowski/n8n-compose/20260918_fundamento-ds/.fundamento/spec037/abnahme/komuna/superrigardo.html · file:///Users/thorstenjankowski/n8n-compose/20260918_fundamento-ds/.fundamento/spec037/abnahme/provo/superrigardo.html · file:///Users/thorstenjankowski/n8n-compose/20260918_fundamento-ds/.fundamento/spec037/ablauf/messpunkt-1/20261031-1342/raporto.md

### Lieferliste

| # | Lieferpunkt | Stand | Grund | PR |
|---|---|---|---|---|
| 1.1 | Eingabe: Satz, Marke (`--config`), optional ≤ 5 Screens | erledigt | `fm ekranoj "<Satz>" [--config] [--ekranoj]`; 6 Namen → Exit 2 ohne Anfrage (V-2) | #131 |
| 1.2 | Plan ≤ 5 Screens mit Zweck und Kanten, als Datei | erledigt | `validiPlanon`, `plano.json`; zu langer Agentenplan einmal neu angefragt, dann gekürzt (D-38) | #131 |
| 1.3 | Bauen nur über die MCP-Werkzeuge | erledigt | 12 Bauwerkzeuge, Markenwerkstatt nie angeboten; AC-10-Test (auch über `dist`); Befund S037-10-1 behoben (Nachfrage, sonst `leere-antwort`, D-184) | #131 |
| 1.4 | Prüfen: `check_usage`, axe hell/dunkel, K1–K7 deterministisch | erledigt | K1 unter `file://` korrigiert (S037-05-1); kein Modell als Richter | #131 |
| 1.5 | Verbessern ≤ 3 Runden oder bis grün, Restabweichungen mit Regel und Grund | erledigt | AC-8-Test; echte Läufe mit Rückmeldung je Runde | #131 |
| 1.6 | Ausgabe: Screens, Übersicht, Fotos hell/dunkel, Bericht | erledigt | Ordner nach AC-6 in beiden Abnahmen und im integrierten Test; S037-10-6 behoben („übernommen aus R<n>“) | #131 |
| 1.7 | Kosten: Schätzung vor dem Start, Zähler, `--max-tokens` | erledigt | Zähler und Grenze halten (Halt vor der Anfrage, Teilbericht); Schätzung seit S037-13 aus gemessenen Werten (70 000 je F-Screen-Runde, D-186, D-196), sie sagt vor dem Start, ob die Grenze den Lauf trägt; mit 2.5 nachmessen | #131 |
| 1.8 | Abnahme-Läufe komuna und provo mit Modell, Last | **teilweise** | beide gelaufen, Ordner vollständig, provo trägt provo; Halt an der Tokengrenze 250 000 nach 2 bzw. 1 Runde, 0 von 2 Screens grün, je ein leeres Fragment (S037-10-1) | #131 |
| 1.9 | Markenfreiheit | erledigt | rein (Attrappe) und in echtem Chromium (`test:browser`, T3710); im echten Lauf 0 Farbliterale in den Fragmenten | #131 |
| 2.1 | Aufgabenart „ganzer Ablauf“, 5 Aufgaben mit 3–5 Screens | erledigt | `katalogo.ts`, 17 Screens, 26 Kanten | #132 |
| 2.2 | Bewertung je Screen K1–K7, Navigation (D-05), Muster (D-06), begründet | erledigt | `poentoj.ts`, `sxablonoj-samaj.ts`, Begründung im Abschnitt „Entwurf“ | #132 |
| 2.3 | Vergleiche F/0, Runde 1/3 | erledigt | `raporto.ts`, deterministisch aus gespeicherten Daten (AC-11) | #132 |
| 2.4 | Erster Messpunkt Reihe K, Streuung Spec 034 | **teilweise** | 3 von 8 Teilläufen (Tokengrenze 2 000 000 = 0,40 $), ab 13:49:32Z gestört durch eine Messung von 036; vollständig nur `anmelden-und-konto` (F +51,5 über 0 in Runde 3, F +20,9 von Runde 1 zu 3); Streuung 16,7 im Bericht | #132, plan |
| 2.5 | Wiederholung auf dem dann aktuellen `main` | **blockiert** | Spec 036 Teil 5 nicht gemergt (`main` = `f2b5a058`); Befehl, Pfade und Schätzung im Abschnitt „Blockiert“ | – |
| 3.1 | Lückenliste über alle Läufe | erledigt | `mankoj.json` je Lauf, `fm ekranoj mankoj`; Liste aus den echten Läufen im Abschnitt „Lückenliste“ (dünn, weil 2.4 nur teilweise) | #131, plan |
| 3.2 | Mankoj Gvidanto | erledigt | MG-1 bis MG-6 mit Vorschlag, kein Code in `packages/mcp` | plan |
| Q-1 | `spec.md` byte-gleich, `plan.md`, `tasks.md` | erledigt | SHA-256 gleich (Prüfungen unten) | #131 |
| Q-2 | Konfliktprüfung gegen 036 und Merge-Position | erledigt | kein PR von 036; Probemerges gegen den gepushten und die lokalen 036-Branches sauber, Teil-6-Skript ohne Änderung an 037; „Später prüfen“ bleibt | plan |
| Q-3 | Bericht im Format von Spec 035 | erledigt | dieser Abschnitt | plan |

**Zahl:** 16 erledigt, 2 teilweise, 0 offen, 1 blockiert.

### Befunde

Vollständig im Abschnitt „Befunde“ (Datei, Grund, Vorschlag, Stand, passender Teil von 036). **Befund Tabu:** S037-02-1 `workspace.test.ts` – erledigt über D-59 (zu bestätigen). **Manko Gvidanto:** MG-1 bis MG-6 offen (Gvidanto-Runde nach Spec 036, nicht Teil 6). **Sonstige (31):** 12 erledigt, 1 umgangen, 13 Hinweise, 5 offen (S037-13 hat S037-10-1, -2, -6, -7 erledigt und S037-13-1 bis -4 ergänzt):

| Befund | Inhalt | Was der Maintainer tun kann |
|---|---|---|
| S037-10-1, -2, -6, -7 | Leeres Fragment, Schätzkonstante, übernommene Werte, Variante-0-Lücken. | erledigt in S037-13 (rot/grün in PR A, D-184 bis D-187); 2.5 misst mit den Korrekturen. |
| S037-10-3 | Wächter übersah kurze 036-Läufe (60-s-Takt). | Werkzeug: Ablehnung durch `mezuri` setzt „belegt“, Takt 10–15 s. |
| S037-10-4 | 036 maß während des Messpunkts; Wechselwirkung in beide Richtungen möglich. | 036 informieren; gestörte Werte nicht vergleichen. |
| S037-13-2 | `faktojPorNavigado` ist für die Modelo des Repos ohne Wirkung (ekranoj liest `fm-ligilo to` selbst). | behalten (zählt für eine Modelo mit anderem Link-Ero) oder vereinfachen. |
| S037-09-2 | Messungen von 036 ohne Browser erkennt der Wächter nicht; kein Marker im plan von 036. | Marker „Messung läuft“ mit 036 vereinbaren. |
| S037-04-1, S037-06-3 | Uzo von `ligilo` (`placement="standalone"`), fehlende Schrittanzeige. | Eroj-Runde 6/7. |

### Entscheidungen

V-1 bis V-4 und D-01 bis D-13 angewandt; D-14 bis D-39 aus der Implementierungs-Spec angewandt; **D-40 bis D-196 aus dem Lauf** (Tabelle „Entscheidungen aus dem Lauf“ mit Zuordnung der vorläufigen IDs; 157 Einträge). Alle sind vom Maintainer zu bestätigen; **ausdrücklich zur Bestätigung gestellt:** **D-12/D-14** (Identität je Befehl statt `git config`), **D-27** (Navigation im Fragment, Rahmen nur Rücklink), **D-40** (Upstream-Einträge des Branches), **D-59/D-60** (`workspace.test.ts` als Graubereich), **D-138** (D-39 nicht eingeengt, hoher Kontrast mitgerendert), **D-164** (gestörter Messpunkt nicht wiederholt), **D-174** (2.5 blockiert), **D-178**/**D-194** (SHAs der Kette B nach dem Neuaufsetzen nur im PR-Text), **D-186** (Schätzkonstante 70 000).

### Messungen

- **Abnahme 1.8:** komuna 210 402 / 2 995 Tokens, 12 Anfragen, 0,042679 $, 61,9 s (Last > Kerne), Halt nach 2 Runden; provo 207 672 / 2 284 Tokens, 14 Anfragen, 0,041991 $, 55,2 s, Halt in Runde 2; beide Ordner nach AC-6, provo mit provo (AC-7), 0 grün.
- **Messpunkt 2.4 (gestört, Teilergebnis):** `anmelden-und-konto` F gegen 0 Runde 1 +32,4, Runde 3 **+51,5**; F Runde 1 → 3 **+20,9** (über der Streuung 16,7), 0 +1,8 ≈; Navigation F 0 → 0,33, 0 0,83; Muster F 0,5, 0 0,75. `liste-filter-detail` nur F Runde 1 (25,3, 1 von 3 Screens). Je Screen im Abschnitt „Messungen“. Einziger ungestörter Wert: `anmelden-und-konto` F; dessen Dauer nicht vergleichbar (Last bis 24,4 bei 10 Kernen).
- **Streuung Spec 034:** Reihe K 16,7 (`specs/034-nachlese-12/plan.md`).
- **Wiederholung 2.5:** blockiert, kein zweiter Stand.

### Lückenliste

Echte Läufe: `uzo-slot-accepts` ×2 (`fm-tabelo`, `fm-karto`) und `uzo-slot-nesting` ×2 (`fm-plenstato`, `fm-karto`) → **Eroj-Runde 6/7**; `list_arangxoj` (nur Rauchtest) → **Gvidanto** (MG-1); keine Lücke mit Ziel **Muster-Runde 2** (Kandidaten: MG-1, Muster-Wert D-06). Vier K5-Lücken aus Variante 0 sind Absicht der Vergleichsvariante (S037-10-7). Tabelle im Abschnitt „Lückenliste“.

### Kosten

Ledger `/Users/thorstenjankowski/n8n-compose/20260918_fundamento-ds/.fundamento/spec037/kostoj.tsv`: abnahme-komuna 0,042679 $, abnahme-provo 0,041991 $, messpunkt-ablauf 0,39553 $ – **Summe 0,4802 $ ≤ 1,00 $**, 117 Anfragen, 2 368 092 / 32 911 Tokens, nur `ministral-14b-2512`. Scheiben: Abnahme 0,08467/0,10 $, Messpunkt 0,39553/0,40 $, Wiederholung 0/0,40 $, Reserve 0/0,10 $.

### Neustarts bekannter Zeittests (R-8)

Keine. In den Läufen 41200798254 und 41209238357 (#131) sowie 41201263661 und 41209342665 (#132) war kein Job rot (je 15/15); Läufe auf den Köpfen von S037-13 im PR-Text; M5 p90 0 ms (Grenze 50 ms), Ableitung median 146,7 bzw. 145,0 ms (gerechnet 94,8 bzw. 93,2 ms, Grenze 150 ms), Gegenproben wie verlangt rot. `.fundamento/spec037/r8.tsv` nicht angelegt. Für die neuen Köpfe nach S037-12 gilt R-8 frisch (höchstens ein Neustart je PR, Kopf und Job über `/tmp/s037-werkzeug/r8`).

### `main`

`origin/main` = `f2b5a058` am Ende des Laufs (2026-10-31, 14:00Z, nach `git fetch`): **nicht bewegt.** Kein Teil von Spec 036 auf `main`.

### Merge-Position und Konfliktprüfung

**Nach Spec 036 Teil 1–5 (in deren Reihenfolge zuletzt Teil 4), vor Teil 6; PR A vor PR B.** Kein PR von 036 vorhanden; verbindliche Kette `main` → 036 Teil 1 (Branch) → A → B sauber und reihenfolgeunabhängig; Vorschau mit den lokalen 036-Branches sauber bis auf einen 036-internen Konflikt in `CHANGELOG.md` (beide Einträge behalten); Nachprobe gegen die seitdem bewegten 036-Branches sauber (D-182). Überschneidung nur Graubereich (`ci.yml`, `workflow.test.ts` mit 036 Teil 6, automatisch gemergt). Teil-6-Skript (noch nicht im PR) auf einer Kopie von PR B: 0 Änderungen in 037-Dateien, `check:privat` danach grün. Einzelheiten und „Später prüfen“ im Abschnitt „Konfliktprüfung und Merge-Position“.

### Prüfungen vor dem letzten Push (S037-12)

- **AC-1:** `shasum -a 256 specs/037-agenten-ekranoj/spec.md` = `0780c57eb387b9aa34d98ea31bab223fe92f8f3e52af0a3a19b3db877deaed89` (gleich der Quelle).
- **AC-3 (Tabu):** `git diff --name-only origin/main...HEAD` (A, 63 Dateien) ohne Pfad unter `packages/metiejo/`, `packages/modelo/src/gvidanto/`, `packages/modelo/src/eroj/`, `packages/modelo/data/`, `packages/eroj/`, `packages/vortaro/`, `packages/mcp/`, `packages/projekcioj/`; Graubereich genau `pnpm-lock.yaml`, `.github/workflows/ci.yml`, `packages/modelo/src/ci/workflow.test.ts`, `packages/modelo/src/workspace.test.ts`; `CHANGELOG.md`, `THIRD_PARTY_NOTICES.md`, Wurzel-`package.json`, `turbo.json`, `pnpm-workspace.yaml` unberührt. `git diff --name-only origin/261031-spec-037-ekranoj...HEAD` (B, 28 Dateien): nur `packages/nordstelo/src/ablauf/**`, `packages/nordstelo/test/fixtures/ablauf/**` und `packages/nordstelo/src/cli.ts` (+5); keine Graubereich-Datei.
- **AC-5 (Grenzen, `/tmp/s037-werkzeug/audit-ac4`):** A `origin/main..HEAD` (Basis `f2b5a058`, 154 Treffer): „2 Geändert in bestehenden Dateien (0)“; „3 Neue Grenzen und Zeitlimits (12)“ – `EKRANOJ_MAKS_TOKENOJ = 250000` (gleich D-25), `maksIlojVokoj = 24`, `maksIlaRezulto = 20000`, `PETO_TEMPOLIMO = 180000` (gleich nordstelo `agent.ts`), `BILDIGO_TEMPOLIMO = 30000` (gleich nordstelo `render.ts`), `MAKS_EKRANOJ = 5`, `MAKS_RONDOJ = 3` (V-2, V-3), `testTimeout`/`hookTimeout = 120000` ×2 (gleich Eroj-Playwright), `TOKENOJ_*` 40 000/2 000/5 000 (Schätzwerte, keine Grenze); **„Ergebnis: sauber – nichts angehoben, keine bestehende Grenze geändert“**. B (nur gelesen) `origin/261031-spec-037-ekranoj..origin/261031-spec-037-mezuro` (Basis `5a912063`): Teil 2 leer, Teil 3 `ABLAUF_MAKS_TOKENOJ = 2000000` (gleich D-25 Messpunkt); **sauber**. Ausgaben `/tmp/s037-logs/s037-12-audit-ac4-{a,b}.txt`.
- **AC-14:** `/tmp/s037-werkzeug/pruefen --diff origin/main..HEAD` (A) und `--diff origin/261031-spec-037-ekranoj..HEAD` (B) vor jedem Push „sauber“ (Zeilen, Pfade, Nachrichten, Autor und Committer jedes Commits – nur die Noreply-Adresse); `pruefen --datei` auf `plan.md`, `tasks.md`, der Commit-Nachricht und beiden PR-Texten sauber.
- **Tests ohne Fokus/Überspringen:** `grep -rn "\.only(\|\.skip(" packages/ekranoj/src packages/cli/src packages/nordstelo/src` in A und B ohne Treffer.

### Testabdeckung (S037-13)

Jedes Abnahmekriterium hat einen Test (Datei › Name) oder einen Prüfnachweis. `cli/…/ekranoj-integra.test.ts` = `packages/cli/src/ekranoj-integra.test.ts` (Befehl über seine Fabrik, Skript-Agent, Renderer-Attrappe, **echter Gvidanto** `fm mcp` aus `dist` als Kindprozess, echter Bewerter und Markenbau, wo das Kriterium davon handelt); `nordstelo/…/integra.test.ts` = `packages/nordstelo/src/ablauf/integra.test.ts` (PR B, echtes `kuruEkranojn`, Gvidanto im Prozess, gespeicherte Fakten).

| AC | Test (Datei › Name) oder Nachweis |
|---|---|
| AC-1 | `packages/ekranoj/src/doku.test.ts` › „copies the spec byte for byte and keeps plan and tasks beside it (AC-1)“; Hash zusätzlich im Abschnitt „Prüfungen“ |
| AC-2 | nicht automatisierbar: Nachweis im plan, Bericht › „PRs je Teil“ (#131 Basis `main`, #132 gestapelt auf #131, keiner gemergt; `gh pr view`) |
| AC-3 | nicht automatisierbar: Nachweis im plan, Bericht › „Prüfungen vor dem letzten Push“ (Tabu-Suche über `git diff --name-only`) und Abgrenzung › „Tatsächlich berührte Dateien“ |
| AC-4 | nicht automatisierbar (Arbeitsweise): Nachweis in tasks.md (rot/grün-SHAs mit „Beleg rot“) und in der Mutationstabelle unten für reine Test-Commits |
| AC-5 | nicht automatisierbar: Nachweis im plan, Bericht › „Prüfungen vor dem letzten Push“ (`audit-ac4`, S037-13 erneut „sauber“) |
| AC-6 | `cli/…/ekranoj-integra.test.ts` › „builds at most five screens into the folder of §2.4, the overview links every screen and the report has every section“ und › „asks the real Gvidanto: its tools, its prompt, get_ero and check_usage answer from the Modelo“; `packages/ekranoj/src/eligo.test.ts` › „writes every file of the layout“, › „links every screen and the report from the overview, and every link resolves“, › „writes the report with every section of Lieferliste 1.6“; `packages/cli/src/ekranoj.test.ts` › „builds the screens and ends with file:// links to the overview and the report (US-1, AC-6)“; `packages/ekranoj/src/bildigilo.browser.test.ts` › „opens the overview via file://: Eroj defined, every screen and the report linked (AC-6)“ (`test:browser`) |
| AC-7 | `cli/…/ekranoj-integra.test.ts` › „writes byte-identical fragments for komuna and provo, without colour literal, raw --fm- value or token value of either brand“; `packages/ekranoj/src/eligo.test.ts` › „gives byte-identical fragments and screens that differ only in the brand“; `packages/ekranoj/src/bildigilo.browser.test.ts` › „shows the brand: the same fragment, another computed colour of an Ero part (AC-7)“ (`test:browser`) |
| AC-8 | `cli/…/ekranoj-integra.test.ts` › „runs exactly three rounds with a scorer that is never green, and reports every remaining deviation with rule, place and reason“; `packages/ekranoj/src/rondoj.test.ts` › „runs exactly three rounds when the scorer is never green, and every remaining finding is a deviation with regulo and kialo“, › „stops after round 2 when all screens are green then, and carries round 3 forward marked green since round 2“ |
| AC-9 | `cli/…/ekranoj-integra.test.ts` › „stops at --max-tokens with a partial report that names the stop, exits 0 and prints the file:// links“; `packages/cli/src/ekranoj.test.ts` › „prints the estimate and exits 2 without --ja when there is no terminal (D-37)“, › „passes --max-tokens through: a run stopped at the limit reports partly and exits 0 (AC-9)“; `packages/ekranoj/src/rondoj.test.ts` › „stops before the request that would pass --max-tokens, keeps the partial result and names the reached round“, › „computes the estimate before the first request and hands it out first“; `packages/ekranoj/src/kostoj.test.ts` › „covers what the acceptance run komuna spent on a plan and three screen-rounds (S037-10 Befund 2)“ |
| AC-10 | `packages/ekranoj/src/arkitekturo.test.ts` › „imports nothing of nordstelo, mcp, eroj or the Gvidanto, and the Modelo for types only“, › „builds every source, and the built output (dist) imports none of them either (S037-13)“, › „depends on none of them in package.json“, › „finds every forbidden form in a sample (the check can fail)“ |
| AC-11 | `nordstelo/…/integra.test.ts` › „gives the same records and the same report twice, equal to the committed expected JSON“, › „scores the same facts with the same K1–K5 through fm ekranoj's adapter and the measurement's, K6 only with criteria“, › „computes the same navigation in ekranoj's loop (Skemo over the Gvidanto) and in the measurement (Modelo)“, › „reports the navigation of the real loop unchanged in the measurement's report“, › „plans every run, screen and estimate of a whole measurement from the catalogue (only „5 Aufgaben, 3–5 Screens“ is fixed)“; `packages/nordstelo/src/ablauf/katalogo.test.ts` › „has the five flows of the source spec, in its order, with 3 to 5 screens each“; `poentoj.test.ts` › „measures the navigation through ekranoj: a missing edge and a dead link (D-05)“; `raporto.test.ts` › „is rebuilt from the stored records byte for byte (determinism, AC-11)“; `kuro.test.ts` › „reports F against 0 and round 1 against round 3 per flow and per screen, from the fixtures (AC-11)“ |
| AC-12 | nicht automatisierbar: Nachweis im plan, Abschnitt „Modellkosten“ (Ledger, nur `ministral-14b-2512`, je Lauf Tokens, Kosten, Dauer, Commit, Last). Die Modellwache selbst ist getestet: `packages/ekranoj/src/gardo.test.ts` › „refuses any other provider or model with a structured error and no key“, `cli/…/ekranoj-integra.test.ts` › „refuses another model of the .env with exit 2 before any request and before the Gvidanto“, `packages/nordstelo/src/ablauf/cli-ablauf.test.ts` › „exits 2 before any request when the .env names another model (D-19)“ |
| AC-13 | nicht automatisierbar: Nachweis im plan, Abschnitt „Prüfprotokoll Messsperre“ (teilweise, D-180) |
| AC-14 | nicht automatisierbar: Nachweis im plan, Bericht › „Prüfungen vor dem letzten Push“ (`pruefen` über Diffs, Commits, PR-Texte). Am Lauf getestet: `cli/…/ekranoj-integra.test.ts` › „writes the key of the .env into no file of the run and prints it nowhere“, `packages/cli/src/ekranoj.test.ts` › „never prints or writes the key of the .env“, › „keeps the raw answers of a build without markup, redacted, and marks the screen (S037-10 Befund 1)“ |
| AC-15 | `packages/ekranoj/src/doku.test.ts` › „holds the decisions to confirm, Blockiert and the Lückenliste in plan.md (AC-15)“; Inhalt: Durchsicht des plans |
| AC-16 | `packages/ekranoj/src/doku.test.ts` › „ends with the Bericht: both PR links, the merge position with the conflict check, the maintainer's steps in order (AC-16)“ (Form); Inhalt nicht automatisierbar: Nachweis im plan, Abschnitt „Konfliktprüfung und Merge-Position“ |

V-2 (≤ 5 Screens) zusätzlich: `cli/…/ekranoj-integra.test.ts` › „refuses six screen names with exit 2: no request, no Gvidanto, no folder“. `--art ablauf` (unbekannte Art, anderes Modell) ist schon durch `cli-ablauf.test.ts` und `kuro.test.ts` gedeckt (D-193).

**Mutationsnachweis der neuen Tests** (lokal, nicht committet, danach zurückgesetzt; Logs `/tmp/s037-logs/s037-13-mutationen-{a,a2,b,doku}.log`):

| # | Test | Mutation | rote Zeile |
|---|---|---|---|
| M1 | AC-6 Ordner | `MAKS_EKRANOJ = 6` (`ekranoj/src/plano.ts`) | `AssertionError: expected '' to match /gekürzt auf die ersten 5/` |
| M2a | echter Gvidanto | Prompt des Gvidanto nicht gelesen (`rondoj.ts`) | `expected { role: 'system', …(1) } to deeply equal { role: 'system', …(1) }` |
| M2b | echter Gvidanto | beide Wächter der Markenwerkstatt aus (`mcp-kliento.ts`, `agento.ts`) | `expected [ 'describe', 'list_dimensioj', …(21) ] to not include 'save_agordo'` |
| M3 | AC-7 integriert | Rahmen schreibt die Marke ins Fragment (`konstruo.ts`) | `ekranoj/detail.html: expected '<i data-a="provo"></i><main>…' to be '<i data-a="komuna"></i><main>…'` |
| M4 | AC-8 integriert | `MAKS_RONDOJ = 2` | `expected 2 to be 3` |
| M5 | AC-9 integriert | Halt an `--max-tokens` endet mit Exit 1 (cli) | `expected { code: 1, …(1) } to deeply equal { code: +0, stderr: Any<String> }` |
| M6 | V-2 | Eingabeprobleme ignoriert (cli) | `expected 'Probe der Schwärzung: ‹Schlüssel›\nGv…' to contain '/ekranoj plan-too-many-screens'` |
| M7 | Modellwache | Wache der cli aus | `expected +0 to be 2` |
| M8 | Schlüssel | keine Schwärzung (cli) | `expected 'Probe der Schwärzung: attrappe-schlue…' to contain 'Probe der Schwärzung: ‹Schlüssel›'` |
| M9 | AC-10 `dist` | `import "@fundamento/nordstelo"` in `dist/rondoj.js` | `expected [ { file: 'dist/rondoj.js', …(2) } ] to deeply equal []` (`"rule": "forbidden-import"`) |
| M10 | AC-10 `dist` | `dist/kostoj.d.ts` gelöscht | `expected [ 'kostoj.d.ts' ] to deeply equal []` |
| M11 | AC-1 | ein Byte an `spec.md` | `expected 'b31a85be8e29674ad0fb883b1c6d3b1476070…' to be '0780c57eb387b9aa34d98ea31bab223fe92f8…'` |
| M12 | AC-15 | Abschnitt „Blockiert“ umbenannt | `expected '' not to be ''` |
| M13 | AC-16 | Schritt 3 der Maintainer-Liste als 4 | `expected [ 1, 2, 4, 4, 5, 6, 7, 8, 9, 10 ] to deeply equal [ 1, 2, 3, 4, 5, 6, 7, 8, 9, 10 ]` |
| B-M1 | AC-11 Determinismus | Zufallswert in `lauf.json` (`kuro.ts`) | `expected { …(45) } to deeply equal { …(45) }` (`"commit": "abc1234-0.91…"` gegen `"abc1234-0.19…"`) |
| B-M2 | AC-11 erwartetes JSON | `STREUUNG_REIHE_K = 16.8` | `- "reiheK": 16.7 / + "reiheK": 16.8` |
| B-M3 | K1–K5 gleich | Adapter bewertet K4 mit Kriterien anders (`ekrano-taksilo.ts`) | `expected [ 'F R1 standards-liste K4', …(5) ] to deeply equal []` |
| B-M4b | Navigation gleich | Schleife erkennt den Link-Ero nicht (`ekranoj/src/instancoj.ts`, ekranoj neu gebaut) | `expected { kvoto: 0.25, …(4) } to deeply equal { kvoto: 0.5, …(4) }` |
| B-M5 | Navigation im Bericht | jeder Screen „kompleta“ (`poentoj.ts`) | `+ "F R1 standard-detail kompleta", + "F R2 standard-detail kompleta"` |
| B-M6 | Katalogzahlen | Schätzung zählt nur den letzten Lauf (`kuro.ts`) | `expected 'Schätzung: 10 Läufe, 18000 Tokens, 0.…' to match /^Schätzung: 10 Läufe, 3672000 Tokens/` |

Ohne Wirkung blieben (und sind Befunde, keine Lücke der Tests): M2 (nur einer der zwei Wächter der Markenwerkstatt aus – der andere hält, S037-13-3), B-M4 (Messung übersieht den Link-Ero – der Standard von ekranoj liest ihn trotzdem, S037-13-2), und ein erster M9 (Zeile hinter dem Kommentar `//# sourceMappingURL` angehängt – Fehler der Mutation, wiederholt als eigene Zeile). Das erwartete JSON von B lag beim Mutationslauf noch unter `integra/raporto.json`; seither `integra-raporto.json` (gleiche Prüfung, D-192).

### Prüfungen vor dem letzten Push (S037-13)

- **AC-1:** SHA-256 von `spec.md` unverändert `0780c57e…deaed89` (auch als Test, `doku.test.ts`).
- **AC-3 (Tabu):** `git diff --name-only origin/main...HEAD` (A) ohne Tabu-Pfad; neue oder geänderte Dateien von S037-13 nur unter `packages/ekranoj/**`, `packages/cli/src/{commands/ekranoj.ts,ekranoj.test.ts,ekranoj-integra.test.ts}` und `specs/037-agenten-ekranoj/`; Graubereich unverändert die vier Dateien. B: nur `packages/nordstelo/src/ablauf/**`, `packages/nordstelo/test/fixtures/ablauf/**`, `packages/nordstelo/src/cli.ts`.
- **AC-5:** `audit-ac4 origin/main..HEAD PR-A` → „2 Geändert in bestehenden Dateien (0)“, „3 Neue Grenzen und Zeitlimits (12)“, `TOKENOJ_*` als „Schätzwert, keine Grenze“ (jetzt 70 000), **„Ergebnis: sauber – nichts angehoben, keine bestehende Grenze geändert“** (`/tmp/s037-logs/s037-13-audit-ac4-a.txt`). Die Nachfrage bei leerer Antwort ist eine Anfrage im bestehenden Budget, keine neue Grenze; kein Zeitlimit neu oder geändert.
- **AC-14:** `pruefen --staged`, `--datei` (jede Commit-Nachricht, plan, tasks, PR-Texte) und `--diff` beider Spannen „sauber“; Autor und Committer nur die Noreply-Adresse.
- **Tests:** kein `.only`/`.skip` in `packages/{ekranoj,cli,nordstelo}/src`.

### Prüfung gegen die Abnahmekriterien

| AC | Ergebnis | Beleg |
|---|---|---|
| AC-1 | erfüllt | SHA-256 oben; `plan.md`, `tasks.md` daneben |
| AC-2 | erfüllt | #131 von `main` `f2b5a058` (= `main` beim Start, unverändert), #132 gestapelt auf #131 und auf dessen letzten Kopf neu aufgesetzt (`--force-with-lease`); keiner gemergt |
| AC-3 | erfüllt | Prüfungen oben; Graubereich-Dateien einzeln im Abschnitt „Konfliktprüfung“ und in „Tatsächlich berührte Dateien“ |
| AC-4 | erfüllt, mit vier begründeten Sonderfällen | jede Codeänderung mit rotem Vorgänger (tasks.md, „Beleg rot“), auch die drei Korrekturen von S037-13; reine Test-Commits von S037-13 je an einer lokalen Mutation rot (Abschnitt „Testabdeckung“); Sonderfälle: `d944ff68` und `25932e8b` (roter Stand = bestehender Commit `999cf1c7` bzw. `a74125cf`), `0651b957` (roter Stand = neu aufgesetzter Branch), `07585b5e` (keine Verhaltensänderung, D-150); ein Test von `53933318` kam mit dem grünen Commit und wurde an einer lokalen Mutation rot gesehen |
| AC-5 | erfüllt | `audit-ac4` A und B „sauber“ |
| AC-6 | erfüllt | integrierter Test mit echtem Gvidanto, Bewerter und Markenbau (T3746), Attrappen-Tests (T3703, T3711) und echte Abnahme komuna (Ordner mit 2 Screens, Übersicht über `file://`, Fotos hell/dunkel, Bericht nach 1.6); Qualität nicht grün (1.8 teilweise) |
| AC-7 | erfüllt | `test:browser` (T3710, gleiches HTML, verschiedene berechnete Farben), integrierter Test mit echtem Markenbau komuna/provo (T3746) und echte Abnahme provo (D-167) |
| AC-8 | erfüllt | T3702 (Attrappe nie grün → genau 3 Runden, jede Abweichung mit Regel und Grund), durch den Befehl mit echtem Gvidanto T3746 |
| AC-9 | erfüllt | T3702/T3704 (Halt vor der Anfrage, Teilbericht, Exit 0), durch den Befehl mit echtem Gvidanto T3746; Schätzung aus Messwerten (T3741/T3744); in allen drei echten Läufen bestätigt |
| AC-10 | erfüllt | `packages/ekranoj/src/arkitekturo.test.ts` (Modulgraph der Quellen und seit S037-13 des gebauten `dist`, Negativproben) |
| AC-11 | erfüllt | `poentoj.test.ts`, `kuro.test.ts`, `raporto.test.ts` (gleiche Fakten → gleiches Ergebnis, Bericht byte-gleich neu gebaut, F/0 und R1/R3); Ende zu Ende mit dem echten `kuruEkranojn` und Gleichlauf beider Wege `integra.test.ts` (T3749) |
| AC-12 | erfüllt | 0,4802 $ ≤ 1,00 $, nur `ministral-14b-2512`, eigenes Ledger, jeder Lauf mit Tokens, Kosten, Dauer, Commit, Last (Abschnitt „Modellkosten“) |
| AC-13 | **teilweise** | Prüfprotokoll vor jedem Start „frei“; der Messpunkt überschnitt sich ab 13:49:32Z mit einer Messung von 036 (als „gestört“ markiert, nicht verglichen), und zwei Starts lagen 31 s bzw. 87 s nach 036-Prozessen, die nur `mezuri` sah (D-180, S037-10-3) |
| AC-14 | erfüllt | `pruefen` über beide Diffs, Commits (inkl. Autor/Committer), PR-Texte, Logs und Berichte sauber |
| AC-15 | erfüllt | Abschnitte „Entscheidungen, vom Maintainer zu bestätigen“ (V-1 bis V-4, D-01 bis D-183), „Blockiert“, „Lückenliste“ (echte Läufe) |
| AC-16 | erfüllt | dieser Bericht: PR-Links, Merge-Position mit Konfliktprüfung, Schritte in Reihenfolge |

Abdeckungskarte AC → Test und Mutationsnachweis: Abschnitt „Testabdeckung (S037-13)“ oben.

### Was der Maintainer tun soll, in Reihenfolge

1. **Bericht lesen**, „Blockiert“ ansehen; V-1 bis V-4, D-01 bis D-196 bestätigen oder ändern – zuerst die ausdrücklich gestellten (D-12/D-14, D-27, D-40, D-59/D-60, D-138, D-164, D-174, D-178, D-186, D-194).
2. **Korrekturen aus S037-13 durchsehen:** Befunde S037-10-1 (Nachfrage, sonst `leere-antwort`), S037-10-2 (Schätzkonstante 70 000, D-186), S037-10-6/-7 sind rot/grün in PR A behoben; D-184 bis D-196 bestätigen.
3. **Abnahme:** die Übersichten des Laufs über `file://` öffnen und durchklicken (Links oben); bei Bedarf `fm ekranoj` mit komuna und provo selbst laufen lassen (Messanleitung Teil 1, ≈ 0,04–0,09 $ je Lauf).
4. **Spec 036 Teil 1 → 2a → 2b → Teil 5 (②b-2 … ③) → Teil 3 → Teil 4 mergen** (036-Reihenfolge). Sobald 036-PRs existieren: „Später prüfen“ (Abschnitt „Konfliktprüfung“) vor dem nächsten Schritt.
5. **PR A #131 auf das neue `main` aufsetzen** (lassen): bei Konflikt im Lockfile `pnpm install` neu erzeugen; in `ci.yml`, `workflow.test.ts`, `workspace.test.ts` beide Wörter bzw. Zeilen behalten. CI abwarten (R-8 einmal für bekannte Zeittests).
6. **PR B #132 auf den neuen Kopf von A aufsetzen** (`--force-with-lease`), CI abwarten.
7. **Wiederholungsmessung 2.5** starten (Abschnitt „Blockiert“, Scheibe 0,40 $: realistisch ein Ablauf F + 0; empfohlen `--taskoj anmelden-und-konto`), beide Stände im plan vergleichen.
8. **PR A #131 mergen, danach PR B #132** (dessen Basis springt dann auf `main`).
9. **Spec 036 Teil 6 auf das neue `main` neu aufsetzen:** Skript erneut ausführen (036 D-33), `pnpm check:privat` grün, `CHANGELOG.md` mit beiden Einträgen, prüfen, dass der Diff von Teil 6 keine 037-Datei enthält; zuletzt mergen.
10. Wächter abschalten, wenn keine Messung mehr geplant ist: `/tmp/s037-werkzeug/gardisto stopp`.
