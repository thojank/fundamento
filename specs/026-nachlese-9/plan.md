# Nachlese 9 „Tempo“ – Plan

**Briefing:** [`briefing.md`](briefing.md) (der Auftrag des Maintainers vom 2026-10-22, unverändert kopiert; sein erster Teil – #104 rebasen, B-29 zurücknehmen, O-1 bis O-16 – ist in Spec 025 ③ erledigt). **Basis:** `main` `b06ad3f` (Merge von #103, Spec 024 Runde 2). **Branch:** `261022-nachlese-9-tempo-33c3e0` · **Datum:** 2026-10-22 · **Stand:** zur Abnahme.

**Regel 0** gilt: der Weg, den das Repo schon geht, sonst die kleinste Änderung mit Eintrag hier; keine Tokens, keine Regulo-Semantik, keine Constitution geändert; **kein Budget angehoben**.

### Zusammenfassung

1. **Ursache (B-1):** Ableitung und Export sind je Prozess mit den Ero-Tokens nicht langsamer geworden – eine Ableitung braucht 2,1 s wie vor der dritten Ebene (O-1: 2,2 s), ein Export 2,3 s (O-1: 2,0 s), weil Spec 024 ② (B-15) die Mehrarbeit schon aufgefangen hat. Gewachsen sind **Speicher und Datei**: der Export hält 1,25 GB statt 0,64 GB, `rezolvoj.json` des ekzemplo-Exports ist 152 MB statt 31 MB. Der **Faktor 10 ist der Läufer**: Der Unit-Job ließ fünf Suiten mit je drei Vitest-Workern auf den 4 vCPU eines `ubuntu-latest` nebeneinander laufen, dazu die gespawnten `fm` der CLI-Tests – rund 20 Prozesse auf 4 Kernen. Ein Test, der `fm agordilo derive` zweimal, `check` und `validate` spawnt, braucht allein 8 s und brauchte dort 64 bis 126 s – schon am 20.10., lange vor den Ero-Tokens, und für denselben Commit einmal 65 s, einmal 123 s.
2. **Behebung (D-01):** der Unit-Job läuft als Matrix, **ein Läufer je Paket** (`agordilo`, `cli`, `mcp`, `metiejo`, `modelo`) – derselbe Schnitt, den W1 (Nachlese 3) für die Eroj und B-12 (Spec 015 ②) für die Projekcioj gemacht haben.
3. **O-8 (D-02):** `rezolvoj.json` schreibt die Tokens der dritten Ebene (Ero und Sxablono) als **Alias-Verweis** – `id`, `type`, `origin` und `alias` (der Name des Tokens, auf das sie zeigen, im selben Rezolvo) – statt Wert und Kette ein zweites Mal. Verlustfrei: dem Verweis folgen gibt das aufgelöste Token Stück für Stück zurück (`rezolvoTokenOf`, `expandRezolvo`); ein Token der dritten Ebene mit eigenem Wert bleibt ganz. Das Repo: 72 → 36 MB; ekzemplo: 152 → 77 MB; der Export hält 0,88 statt 1,25 GB.
4. **Export-Test wieder 30 s (D-03)**, der Ableitungs-Test bleibt bei 120 s, die Paletten-Reguloj beim geteilten Timeout von 30 s.

### Ursache

**Läufer:** `ubuntu-latest` für ein öffentliches Repo – 4 vCPU, 16 GB. Hier gemessen: 10 Kerne, 32 GB.

**Ein Prozess allein** (`/usr/bin/time -l`, je zwei Läufe, ruhige Maschine; O-1 = `main` nach #100 `8892b28`, vor der dritten Ebene):

| Stand | Tokens | `fm agordilo derive` provo | `fm modelo export` ekzemplo | RSS des Exports | `rezolvoj.json` (ekzemplo, 144 Kombinationen) |
|---|---|---|---|---|---|
| O-1 (`8892b28`) | 376 | 2,2 s (3,3 s CPU) | 2,0 s | 0,64 GB | 31 MB |
| `main` (`b06ad3f`, #103) | 1 408 | 2,0 s (3,0 s CPU) | 2,3 s | 1,25 GB | 152 MB |
| Spec 025 ③ (#104, rebased) | 1 608 | 2,1 s (3,2 s CPU) | 2,5 s | 1,31 GB | 175 MB |
| Nachlese 9 (O-8) | 1 408 | 2,1 s (3,1 s CPU) | 2,2 s | 0,88 GB | 77 MB |

`fm modelo validate` des Repos: 1,2 s (O-1), 1,1 s (`main`), 1,2 s (#104); mit den drei Fixture-Marken 2,0 / 2,0 / 2,2 s. Das CPU-Profil eines Exports auf `main` (2,9 s CPU): 36 % gehen in die Serialisierung der Rezolvoj (`serializeCanonicalJson` 14 %, `sortKeysDeep` 10 %, Garbage Collector 9 %, Schreiben 4 %), der Rest in die Validierung.

**Der Läufer über 45 CI-Läufe** (Unit-Job, 20.10. bis 22.10.; die Zeiten stehen im Log des Jobs):

| Zeitraum | Stand | `derives provo twice` (Budget 120 s) | Export-Test |
|---|---|---|---|
| 20.10., `main` | vor Spec 024, ohne dritte Ebene | 64–80 s | 11–16 s |
| 21.10., `main` | Nachlese 8, Spec 023 | 81–116 s | 19–24 s |
| 22.10., #100 (O-1), Spec 025 ①–③ vor #103 | ohne dritte Ebene | 76–127 s | 16–30 s |
| 22.10., #103 und `main` danach | mit 1 408 Tokens | 65–123 s | 20–36 s |
| 22.10., #104 nach dem Rebase | mit 1 608 Tokens | 106 s | 30,2 s |

Die Ableitung zeigt keinen Trend mit den Tokens; die Zahlen von B-29 (85 s mit 36 Eroj, über 120 s mit 40) stammen von ③ **vor** dem Rebase auf #103, also ohne eine einzige Ero-Token. Der Export ist leicht gewachsen – das ist die Datei. Die Summe der Dateizeiten des Unit-Jobs: 2 527 s im Lauf von O-1 (39709950521), 2 329 s im letzten Lauf von #103 (39807776006) – der Job war vor der dritten Ebene so voll wie danach.

**Dieselbe Last hier nachgestellt** (`pnpm turbo run test` der fünf Pakete mit `--maxWorkers=3` wie auf dem Läufer, `main`): 36 Node-Prozesse, Load 20 bis 32, zusammen bis 8 GB RSS; der Ableitungs-Test 25,4 s, der Export-Test 6,0 s. Die CLI-Suite allein mit drei Workern: 8,0 s und 2,8 s. Unter Last also 3,2- bzw. 2,1-mal so lang – auf 10 Kernen. Auf 4 vCPU teilen sich dieselben Prozesse 2,5-mal weniger Kerne, die je ≈ 1,7-mal langsamer sind (der Start des MCP-Servers: 1,9 s hier, 3,2 s auf dem Läufer): 8 s × 3,2 × 2,5 × 1,7 ≈ 109 s – die gemessenen 64 bis 126 s.

### Entwurfsentscheidungen

#### D-01 Ein Läufer je Paket (B-1, Regel 0.1)
Der Job `unit` bekommt eine Matrix `package: [agordilo, cli, mcp, metiejo, modelo]` und ruft `pnpm turbo run test --filter=@fundamento/${{ matrix.package }}`. So haben es W1 (die Eroj aus dem einen Job) und B-12 (Projekcioj in zwei Shards) gemacht; Budgets, Faktoren und Timeouts bleiben, wie sie sind. `workflow.test.ts` pinnt die Matrix und dass jedes Paket mit Tests einen Platz hat – vorher fand ein neues Paket seinen Weg in den Job von selbst (der Filter nannte, was woanders läuft), jetzt sagt der Test es. Kein Branch-Schutz nennt den alten Jobnamen (geprüft: `main` ist nicht geschützt, keine Rulesets).

#### D-02 O-8: die dritte Ebene als Alias-Verweis
Ein Token der dritten Ebene (`isEroTokenName`: `ero.*` und `sxablono.*`) wird in `rezolvoj.json` zu `{ "alias", "id", "origin", "type" }`, wenn es ein Alias auf ein Token ist, das im selben Rezolvo steht, und wenn dem Verweis folgen exakt das aufgelöste Token ergibt: derselbe Wert, dieselbe Schreibweise (`textTransform`), dieselbe Kette (das Token selbst in seinem Set, dann die Kette des Ziels – oder, wenn das Ziel kein Alias ist, das Ziel in seinem Set), kein `fieldAliases`. Sonst bleibt es ganz – so ein Ero-Token, das eine Marke im Studio auf einen eigenen Wert festlegt. Ein Verweis auf einen Verweis (ein Ero-Token auf ein anderes) wird ebenso geschrieben und beim Lesen weiterverfolgt. Die Prüfung beim Schreiben vergleicht an Ort und Stelle, ohne Kopie (1 232 Tokens × 144 Kombinationen).

Lesen: `@fundamento/modelo` exportiert `isRezolvoAlias`, `rezolvoTokenOf(entry, name)` und `expandRezolvo(entry)`; `RezolvojJson` beschreibt die Datei (`RezolvojEntry`, `RezolvoAlias`). Die Celoj lesen weiter ganze Tokens: `celoInputOf` folgt den Verweisen beim Einlesen (Regel 0.2 – eine Stelle statt jedes Lesers; die Garantie AK-03 der CSS und der Figma-Simulator bleiben wörtlich). `modelo.json#/rezolvo` (der eine eingebettete Rezolvo der Standard-Zuweisung) und das Werkzeug `resolve` des MCP bleiben ganz; die Ressource `fundamento://export/rezolvoj.json` liefert die Bytes des Exports, also die Verweise.

#### D-03 Export-Test 30 s
Der Test „writes the export and one Tokens-Studio folder per Aspekto“ trägt wieder sein eigenes Budget von 30 s statt des Paketbudgets von 60 s (Spec 024 ② B-17, O-9). Er läuft jetzt auf dem Läufer der CLI, ohne die vier anderen Suiten daneben.

### Abweichungen

1. **„Ero-Tokens“ umfasst die Sxablono-Tokens:** die 34 Tokens der Sxablonoj sind dieselbe dritte Ebene (Constitution v2.3) und werden ebenso Verweise.
2. **„Nur als Alias-Verweis“ mit Ausnahme:** ein Token der dritten Ebene, das einen eigenen Wert trägt oder dessen Verweis etwas verlöre, bleibt ganz – sonst wäre die Datei nicht mehr verlustfrei.
3. **„Warum Ableitung und Export mit den Tokens so stark wachsen“:** je Prozess wachsen sie nicht (Tabelle oben); gewachsen sind Speicher und Datei des Exports, und die Zeiten auf dem Läufer hängen an seiner Last, nicht am Commit.

### Befunde / Mankoj

- **B-1 (Ursache, behoben)** Der Unit-Job war überbelegt: fünf Suiten × drei Worker plus gespawnte `fm` auf 4 vCPU. Messungen oben; behoben mit D-01.
- **B-2 (Doku)** B-29 (Spec 025 ③) schrieb den Anstieg der Ableitung den 40 Eroj zu; die Läufe dazu hatten keine Ero-Tokens, und derselbe Test streute auf `main` vorher schon zwischen 64 und 116 s. B-29 ist zurückgenommen (Spec 025 ③, `6c2d8f6`).
- **B-3 (offen, O-1)** `pnpm perf` lokal ohne CI-Faktor: der erste `check_contrast`-Aufruf ohne Zuweisung braucht auf `main` ≈ 101 ms (Budget 100 ms, AK-09), mit den Tokens von #104 107 ms; die übrigen 99 Aufrufe ≈ 8 ms. Der erste Aufruf baut die Überlagerung jeder Kombination über alle Tokens. Auf dem Läufer gilt der Faktor 3 (167 ms von 300 im Lauf von #104) und der Schritt ist grün.
- **B-4 (offen)** `fm modelo validate` mit zwei Paketen derselben Aspekto druckt je überschriebenem Token eine Warnung `set-override-ambiguous` – mit den Tokens von #104 1 605 Warnungen, 1,1 MB (Spec 025 ③ B-31). Die Ausgabe wächst mit jedem Token; eine Zusammenfassung je Set wäre lesbarer.
- **B-5 (offen, O-2)** Der Job „Rendered accessibility“ lief auf `main` nach #103 (Lauf 39808894483, alle drei Engines) in sein Limit von 15 min und wurde abgebrochen; im PR (nur Chromium) 4 bis 6 min. Hier 411 s mit drei Engines.

### Offen (für den Maintainer)

- **O-1 Der erste `check_contrast`-Aufruf (B-3):** Vorschlag: im Modus `names` die Überlagerung nur für die genannten Tokens und ihre Alias-Ketten bilden statt für alle (Ausgaben byteidentisch) – eine eigene kleine Änderung, wenn der lokale Perf-Lauf ohne Faktor grün sein soll.
- **O-2 Alirebleco auf `main` (B-5):** Vorschlag: den Job wie die Eroj in zwei Shards teilen (Playwright `--shard`), statt Budgets anzuheben.
- **O-3 Fünf Läufer statt einem (D-01):** je Läufer kommen Install und Build dazu (≈ 1,5 min); für ein öffentliches Repo kostenlos. Alternative mit weniger Läufern: zwei Gruppen (`modelo` | die übrigen vier) – dann teilen sich wieder vier Suiten einen Läufer, der CLI-Test eingeschlossen. Vorschlag: fünf.

### Messanleitung

Im Repo des Maintainers (`/Users/thorstenjankowski/n8n-compose/20260918_fundamento-ds/`), auf dem Branch dieses PR nach `pnpm install` und `pnpm build`. Der Block misst Ableitung und Export allein, die Größe der Rezolvoj und die Verweisform; er schreibt nach `/Users/thorstenjankowski/n8n-compose/20260918_fundamento-ds/.fundamento/nachlese9/mess/`:

```bash
cd /Users/thorstenjankowski/n8n-compose/20260918_fundamento-ds
M=/Users/thorstenjankowski/n8n-compose/20260918_fundamento-ds/.fundamento/nachlese9/mess
F=packages/modelo/test/fixtures/valid
mkdir -p "$M" && rm -rf "$M"/derive "$M"/export
/usr/bin/time -l pnpm -s fm agordilo derive $F/aspekto-provo/agordo.json --out "$M"/derive > "$M"/derive.txt 2>&1
/usr/bin/time -l pnpm -s fm modelo export --config $F/aspekto-ekzemplo/fundamento.config.json --out "$M"/export > "$M"/export.txt 2>&1
ls -l packages/modelo/dist/rezolvoj.json "$M"/export/rezolvoj.json > "$M"/groessen.txt
node -e 'const r=JSON.parse(require("fs").readFileSync(process.argv[1],"utf8")).rezolvoj[0].tokens;console.log(JSON.stringify(r["ero.butono.surface.fill.emphasis.high.intent.neutral.rest"],null,2))' "$M"/export/rezolvoj.json > "$M"/verweis.json
echo FERTIG
```

Erwartet: in `derive.txt` und `export.txt` je ≈ 2 s `real` (die Zeile `real` steht am Ende), im Export ≈ 0,9 GB `maximum resident set size`; `groessen.txt` ≈ 36 MB (Repo) und ≈ 77 MB (ekzemplo); `verweis.json` hat nur `alias` (`color.action.primary.rest`), `id`, `origin` und `type`. Ergebnisse: [`file:///Users/thorstenjankowski/n8n-compose/20260918_fundamento-ds/.fundamento/nachlese9/mess/`](file:///Users/thorstenjankowski/n8n-compose/20260918_fundamento-ds/.fundamento/nachlese9/mess/).

Auf dem Läufer: im PR die Jobs „Unit tests (cli)“ und „Unit tests (modelo)“ öffnen, Schritt „Test“; die Zeilen `derives provo twice`, `writes the export and one Tokens-Studio folder` und `palette Reguloj hold` nennen ihre Zeit (tasks, Messungen).
