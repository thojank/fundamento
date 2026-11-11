# Spec 049 – Aufgaben (Gründe für komuna: 24 Reguloj, 75 Entscheidungen)

**Spec:** [`spec.md`](spec.md) · **Plan:** [`plan.md`](plan.md) (mit Nachtrag 049) · **Basis:** `origin/main` `6374f18f` · **Branch:** `261111-spec-049-grnde-fr-komun-c9d179`

Vier Tickets, ein Strang (Spec: „höchstens 5 Tickets, ein PR“): `KIA-1.1 → KIA-2.1 → KIA-3.1 → KIA-4.1`. Commits lokal mit dem Präfix `Spec 049 KIA-x.y: …`; gepusht wird nur in KIA-4.1, genau einmal. Je Ticket ein Abschnitt unten: erledigte Punkte, Rot→Grün-Beleg, Befunde `F-KIA<n>-k`, Entscheidungen `D-…`. Diffs gegen `origin/main`, nicht gegen das lokale `main`.

**Maintainer-Entscheidungen 2026-11-11** (verbindlich, Einzelheiten im Nachtrag von `plan.md`): alle 24 Zeilen aus §5 freigegeben (☐ = frei); **B-1 → (A)** (nur der rot gemeldete Eintrag `describe/standard` der 038-Fixtures wird nach dem 047-Verfahren fortgeschrieben, eigener Commit in KIA-2.1); **B-2** (AC-9 prüft das echte Default-Verhalten: mit komuna und ohne Aspekto vorhanden, mit ekzemplo nicht) und **B-3** (`checks/regularo/index.test.ts` leitet die Zahl aus Kern- + Paket-Reguloj ab, Änderung in KIA-2.1) freigegeben; **Q-5** bleibt Folgeaufgabe.

| Ticket | Inhalt | Stand |
|---|---|---|
| KIA-1.1 | Spec-Ordner; drei rote Tests (`grafeo-kialo-049`, `regularo-komuna-049`, `explain-049`) | erledigt (rot aus dem erwarteten Grund; kein bestehender Test geändert; Entscheidungen D-KIA1-1 bis D-KIA1-6 im Nachtrag von `plan.md`) |
| KIA-2.1 | 24 Ids, `packages/aspekto-komuna/reguloj.json`, `NOT_CHECKABLE`, erzwungene Änderung `checks/regularo/index.test.ts` (B-3), 038-Fixture `describe/standard` (B-1 A), alles grün | gestoppt an F-KIA2-2 (T4-Kialo nennt „Figma“, AK-12 rot); F-KIA2-1 gelöst |
| KIA-3.1 | `bilder`-Lauf, `luecken.json` (049), Bericht-Entwurf, Diff-Suche §8 | offen |
| KIA-4.1 | Ein PR, ein Push, ein `workflow_dispatch`, CI je Job in Bericht und PR-Text | offen |

## KIA-1.1 im Einzelnen

- [x] `spec.md` mit `cp` aus `user-provided-product-spec-kialoj-komuna.md`; `cmp` Exit 0; SHA-256 `153d88a4650f552ce8a54017cb962c44fdad9e4a14f517322257d9ca87bad1ad`. Wird nicht editiert.
- [x] `plan.md`: byte-gleiche Kopie der technischen Spec (die ersten 21 178 Byte, `cmp` Exit 0; SHA-256 der Quelle `37177662694b355437f4bd5135ebcb4e6f93af0befc3992aed7ad2dc7ff9af4e`), danach `## Nachtrag 049 (Umsetzung)` mit den Maintainer-Entscheidungen, B-1 bis Q-5, der Zeilennummern-Tabelle, D-1, D-2, den Test-Entscheidungen D-KIA1-1 bis D-KIA1-6 und „keine neue Abhängigkeit“.
- [x] `tasks.md` mit den vier Tickets.
- [x] Drei neue Testdateien, gegen den Vertrag §2.2 der Implementation Spec (Tabelle Name → `appliesTo.tokens` → 75 Tokens, Präfix `aspekto komuna:`):
  - `packages/metiejo/src/grafeo-kialo-049.test.ts` (AC-6 bis AC-8): komuna-Paket-Graph zweimal über `grafeoDePaket("komuna", …)` – „nachher“ `paketo("komuna")`, „vorher“ dieselben `ModeloFiles` ohne das `reguloj`-Dokument von komunas Paket (im Speicher, Helfer in der Testdatei). Liest weder `specs/**` noch `packages/aspekto-komuna/reguloj.json` über einen Pfad (B-4). Prüft (a) vorher „fehlt“ = die 75 der Tabelle; nachher je Token `kialoDe().fonto === "propra"` mit dem `kialo` der zugeordneten Regulo (nach Name in `buildModelo(files).modelo.reguloj`) und `regulo` endet auf deren Id; (b) nachher 0 „fehlt“; (c) ekzemplo (`grafeoDePaket`) und provo (`grafeoDe`, Fixture-Agordo): „fehlt“-Listen mit und ohne komunas Paket-Reguloj gleich, kein Knoten nennt eine 049-Regulo-Id oder trägt einen 049-Kialo; (d) eigener Kialo ändert sich oder entsteht genau bei den 75, kein anderer eigener Kialo ändert sich; (e) jeder Knoten, der von `neniu` zu `heredita` wechselt, erbt von einem der 75, keiner verliert seinen Grund, `neniu` nachher ≤ vorher. Befunde in Arrays, einmal `toEqual([])`.
  - `packages/modelo/src/data/regularo-komuna-049.test.ts` (AC-3): `reguloj.json` vorhanden, schema-gültig (`RegulojFile`), nach Id sortiert; die Reguloj mit `aspekto === "komuna"` sind genau die 24 Namen, je `manual`, `appliesTo` = `{ tokens: <Tabelle> }`, nicht leerer `kialo`, `scope` beginnt mit `aspekto komuna:`; jedes Muster trifft mindestens einen Token des Modelo; jede Id `{status:"active", type:"regulo"}` in `packages/aspekto-komuna/ids.lock.json`; jeder der 24 Namen genau einmal und keine doppelten Namen im Repo-Modelo und im ekzemplo-Projekt-Modelo; die 75 Tokens der Tabelle = komuna-Liste aus `specs/048-nodredaktilo-grupoj-kialoj/luecken.json`, jede Lücke wird von den Mustern genau ihrer Zeile getroffen.
  - `packages/modelo/src/gvidanto/explain-049.test.ts` (AC-9 mit B-2): ekzemplo-Projekt (Kern + komuna + ekzemplo) wie `explain.test.ts`; für `font.weight.semibold` → `komuna-schriftgewichte` und `radius.role.control` → `komuna-rundung-bedienelement`: mit `aspekto: "komuna"` `via: "token"`, `result: "manual"`, `aspekto: "komuna"`, `kialo` = Kialo der Regulo im Modelo; mit `aspekto: "ekzemplo"` nicht; ohne Zuordnung beginnt die Kombination mit `aspekto=komuna` und die Regulo erscheint (B-2, Kommentar im Kopf der Datei).
- [x] Roter Lauf beobachtet (nach `pnpm build`; Fehler auf Assertion-Ebene, keine Datei bricht beim Laden ab):
  - `FM_AUSGABE=knapp pnpm --filter @fundamento/metiejo exec vitest run src/grafeo-kialo-049.test.ts`: **5 bestanden, 3 rot** (2,5 s). Rot aus dem erwarteten Grund (es gibt keine Paket-Reguloj von komuna):
    - (a) nachher: `expected [ …(75) ] to deeply equal []` – für jeden der 75 Tokens „no Regulo <name> in the komuna Modelo“;
    - (b) nachher: `expected [ 'border.width.scale.1', …(74) ] to deeply equal []` – 75 „fehlt“ statt 0;
    - (d): `expected [] to deeply equal [ 'border.width.scale.1', …(74) ]` – kein eigener Kialo hat sich geändert.
    - Grün schon vorher: die Tabelle (24 Namen, 75 verschiedene Tokens); (a) vorher („fehlt“ = genau die 75 der Tabelle); (c) beide Fälle (ekzemplo/provo unabhängig, leer wahr, weil es noch keine 049-Regulo gibt); (e) (leer wahr, kein Wechsel).
  - `FM_AUSGABE=knapp pnpm --filter @fundamento/modelo exec vitest run src/data/regularo-komuna-049.test.ts src/gvidanto/explain-049.test.ts`: **5 bestanden, 8 rot** (2,4 s). Rot aus dem erwarteten Grund:
    - `regularo-komuna-049`: „packages/aspekto-komuna/reguloj.json is missing: expected false to be true“; „expected [] to deeply equal [ 'komuna-container', …(23) ]“ (0 Reguloj ≠ 24); „expected [] to have a length of 24 but got +0“ (Ids); „expected [ 'repo: komuna-dauer-null 0×', …(47) ] to deeply equal []“ (Namen je 0× statt 1× in beiden Modelos).
    - `explain-049`: viermal „expected [] to include 'komuna-schriftgewichte' / 'komuna-rundung-bedienelement'“ (mit `aspekto: "komuna"` und ohne Zuordnung).
    - Grün schon vorher: jedes Tabellen-Muster trifft einen Token; Tabelle = komuna-Liste aus 048; jede Lücke genau von ihrer Zeile getroffen; `explain` mit `aspekto: "ekzemplo"` nennt beide Reguloj nicht (2 Fälle).
- [x] Gegenprobe außerhalb des Repos (Wegwerf-Skript gegen `packages/metiejo/dist`, 24 Platzhalter-Reguloj im Speicher mit den Mustern der Tabelle und Ids über allen Kern-Ids): komuna „fehlt“ 75 → 0, eigener Kialo geändert genau bei den 75, jeder der 75 `propra` mit dem Kialo seiner Regulo, kein Wechsel `neniu` → `heredita` außerhalb der 75, `kialoDe` `neniu` über alle Knoten 142 → 0. Die Tests können also allein durch Daten grün werden.
- [x] Unverändert grün (Stichprobe): `grafeo-kialo-048`, `grafeo-kialo-047`, `grafeo-grupoj-048` zusammen **41 bestanden, 0 rot** (6,1 s).
- [x] `pnpm --filter @fundamento/metiejo lint` und `pnpm --filter @fundamento/modelo lint`: grün (`tsc` ohne Fehler; Biome nur alte Warnungen, keine in den neuen Dateien). `pnpm biome check` auf die drei neuen Dateien: sauber.
- [x] `git diff --stat origin/main`: nur die drei neuen Testdateien und `specs/049-kialoj-komuna/`. Kein bestehender Test geändert.

### Befunde

- **F-KIA1-1** `explain-049` ohne Zuordnung ist schon im roten Lauf rot, nicht grün: es erwartet die Regulo (B-2). Ein Test „erscheint nicht“ wäre heute leer wahr und nach KIA-2.1 falsch.
- **F-KIA1-2** In komuna haben vor 049 über alle Knoten 142 keinen Grund in der Kette (`kialoDe` `neniu`, Entscheidungen eingeschlossen); 048 zählte 77 nur bei Übernahmen. Keine Zahl steht im Test; für den Bericht (KIA-3.1).

### Commits

- `5dae0bf8` Spec 049 KIA-1.1: spec folder and the three red tests
- (dieser Commit) Spec 049 KIA-1.1: record the commit in tasks.md

Nach dem Commit: `pnpm check:privat` PASS, `pnpm check:clean-room` PASS; `packages/modelo/src/ci/turbo-inputs.test.ts` allein **8/8** grün (4,1 s), kein ungedeckter `*-049`-Zugriff. Die Suche §8 Schritt 2 (`timeout|threshold|sojlo|limit|toBeLessThan` in hinzugefügten Zeilen) trifft nur Text in `spec.md`/`plan.md` (Regel 0, §8, D-KIA1-5), keine Grenze im Code.

## KIA-2.1 im Einzelnen (gestoppt: Blocker F-KIA2-2)

- [x] `pnpm build` (Cache), dann genau ein Aufruf `pnpm id:new regulo --count 24 --lock packages/aspekto-komuna/ids.lock.json --json`: 24 Ids `reg_01M7610SVZTWGTRP9088GZQ9P9` … `reg_01M7610SW0468972WKNSC1Y3P1`, aufsteigend, in Tabellenreihenfolge B1 … T4 vergeben, alle größer als die größte Kern-Id `reg_01M69KM4J9STWVW0E2VZK64HC8`. Diff von `ids.lock.json`: 96 Zeilen hinzugefügt, 0 entfernt, nur `{"status":"active","type":"regulo"}`.
- [x] `packages/aspekto-komuna/reguloj.json`: 24 Einträge aus §5 (Wegwerf-Skript außerhalb des Repos, D-1/D-2), nach Id sortiert, mit Biome formatiert (`pnpm --filter @fundamento/aspekto-komuna lint` = `biome check .` grün). Kialo-Vergleich (`node verify.mjs <user-provided-technical-spec-kialoj-komuna.md> packages/aspekto-komuna/reguloj.json`: §5-Zeile → vorletzte Zelle, ohne Backticks und ohne abschließendes ` **A**`): **24/24 gleich**.
- [x] `NOT_CHECKABLE` in `packages/modelo/src/data/regularo-repo.test.ts` (nach Zeile 40): 24 Einträge mit dem einheitlichen Text; sonst keine Änderung.
- [x] **Erzwungene Änderung eines bestehenden Tests (B-3):** `packages/modelo/src/checks/regularo/index.test.ts:88` vorher `reguloj: count("reguloj.json", "reguloj"),` → nachher Zeilen 88–98: `(count("reguloj.json", "reguloj") ?? 0) +` Länge von `packages/aspekto-komuna/reguloj.json`, aus der Datei gelesen wie die Jugxoj-Zeile. Grund: `check:regularo` zählt die Paket-Reguloj mit (62 + 24).
- [x] **F-KIA2-1 gelöst (Maintainer-Entscheidung 2026-11-11, Option 2; außerhalb der Frei-Liste):** `packages/modelo/src/lingvo/tradukoj.ts:70` vorher `.filter((regulo) => coreId(regulo.id))` → nachher `:72` `.filter((regulo) => regulo.aspekto === undefined && coreId(regulo.id))`, Doc-Kommentar `:59` → `:59-61`. Neuer Test `packages/modelo/src/lingvo/tradukoj-049.test.ts`: zuerst rot (ohne die Daten im Arbeitsbaum, 2 rot: 4 statt 2 Schlüssel, 2 × `traduko-missing`), danach 2/2 grün; `src/lingvo/` + `nachlese-8-germana` 23/23. `data/tradukoj.json` unverändert. Einzelheiten im Nachtrag von `plan.md`.
- [x] `pnpm fm modelo validate --json | jq -e '.valid == true'` → `true` (0 Befunde).
- [x] Grün, je einzeln (`FM_AUSGABE=knapp`): `regularo-komuna-049` + `explain-049` + `tradukoj-049` 15/15; `regularo-repo` 17/17; `checks/regularo/index` 13/13; `explain` + `nachlese-8-germana` + `nomoj` 23/23; `grafeo-kialo-049` 8/8; metiejo `047` + `048` (alle sechs Dateien) 67/67; `gvidanto-038` grün (mit `kontrakto-038` 40/40); `komuna-fonto` 11/11.
- [x] **B-1 (A):** `kontrakto-038` nach dem Daten-Commit rot mit genau einem Eintrag, `describe/standard`. Verfahren aus 047: Wegwerf-Kopie außerhalb des Repos (`generi.mjs` dort so geändert, dass es `list_arangxoj` und `check_markup` überspringt, die keinen Katalog-Eintrag haben), `node packages/mcp/test/kontrakto/generi.mjs <kopie> <ziel>` → 124 Einträge. Kontrolllauf auf einer zweiten Kopie mit `ids.lock.json` von `origin/main` (`6374f18f`) und ohne `reguloj.json`: **114/114** Katalog-Einträge des Repos byte-gleich; zwischen beiden Läufen unterscheidet sich genau `describe/standard` (123/124 gleich). Im Eintrag ändern sich `reguloj.count` und `reguloj.withKialo` (62 → 86) und der Satz (62 → 86 rules); `bytes` bleibt 1882. Nur `describe.json` übernommen; `index.json`, `tool-names.json`, `input-schemas.json`, Prompt und AC-8 bleiben (ekranoj gleich; vier nordstelo-Fälle weichen schon auf `origin/main`-Daten ab, Spec 046 F-B1, beide Läufe gleich). Danach `kontrakto-038` + `gvidanto-038` 40/40.
- [x] `pnpm check` einmal, schrittweise ohne Kettenabbruch und ohne den Zeitschritt `pnpm perf` (kein Zeittest lokal): `lint`, `check:vortaro-lint`, `check:parity`, `check:regularo`, `check:mankoj`, `check:alirebleco`, `check:clean-room`, `check:ikonaro`, `check:fontoj`, `check:dokumentaro`, `check:privat`, `check:alirebleco-eroj` (657), `check:make-kit`, `check:quickstart`, `check:vitrino` (89), `check:release`, `check:tiparoj`: **alle Exit 0**. `turbo run build test --continue`: Exit 1 – rund 170 Zeitüberschreitungen unter voller Parallel-Last (alle Pakete gleichzeitig, bis 1 600 s je Paket; Stichproben einzeln grün: `cli quickstart` 2/2, modelo `kampo`/`butono`/`parity`/`turbo-inputs` 103/103, nordstelo `raporto` 8/8) und **3 echte Assertion-Fehler, alle AK-12** (F-KIA2-2).
- [ ] `pnpm test:betroffen`: nicht gelaufen (gestoppt an F-KIA2-2).
- [x] `.only(`/`.skip(` in hinzugefügten Zeilen: keine. `timeout|threshold|sojlo|limit|toBeLessThan` in hinzugefügten Zeilen: nur Text in `spec.md`/`plan.md`/`tasks.md`.

### Befunde

- **F-KIA2-1** (gelöst, s. o.) 48 × `traduko-missing`: komunas Reguloj galten wegen ihrer Kern-Format-Ids als Kern-Texte.
- **F-KIA2-2 (Blocker)** Der freigegebene Kialo von **T4 `komuna-schriftgewichte`** enthält das Wort **„Figma“** („…, damit Web und Figma dieselbe Zahl verstehen.“). Die AK-12-Prüfung (Art. VIII, `packages/modelo/src/export/celo-mappings.ts:25`, `TEXT_NAMES = ["tailwind", "figma", "penpot", "daisyui"]`) meldet `{ pointer: "/reguloj/85/kialo", needle: "figma" }` im Export `modelo.json`. Rot, auch einzeln: `packages/modelo/src/export/build.test.ts:163` („modelo.json carries none“), `build.test.ts:170` („still trips …“: zwei statt einem Befund) und `packages/modelo/src/e2e/export.test.ts:99`. Eine Celo darf nur ein Satz nennen, der sie in einem typisierten Feld erklärt (Jugxo `ref.celo`, Manko `celo`); eine Regulo hat kein solches Feld. Ein freigegebener Kialo wird nicht umformuliert, die Prüfung bleibt. Optionen für den Maintainer: (1) T4 als ✎ mit einem Satz ohne Celo-Namen (etwa „… damit Web und Design-Werkzeug dieselbe Zahl verstehen.“); (2) T4 ✗ – dann blieben 9 Tokens ohne Grund und der Vertrag der KIA-1.1-Tests (24 Namen, Ziel 0) bräche; (3) Prüfung oder Schema ändern – widerspricht Art. VIII und der Regel „Prüfung nie aufweichen“.

### Commits

- `21468d9c` Spec 049 KIA-2.1: package Reguloj of komuna need no core translation (F-KIA2-1)
- `f58f2c36` Spec 049 KIA-2.1: 24 komuna Reguloj with the approved Kialoj
- `7c38abc8` Spec 049 Nachtrag: Vertrags-Fixture describe fortgeschrieben (Maintainer-Entscheidung 2026-11-11)
- (dieser Commit) Spec 049 KIA-2.1: record the state in tasks.md and plan.md
