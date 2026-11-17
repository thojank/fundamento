# Spec 058 – Bericht (MP-2c: Marke beschreiben, mit KI auswerten, ansprechend zeigen)

Stand 2026-11-17, Entwurf aus MAW-5.1 (T10); die Platzhalter füllt der Schritt nach Push, PR und dem einen `workflow_dispatch`. Quellen: [`spec.md`](spec.md), [`plan.md`](plan.md), [`tasks.md`](tasks.md) (PR-Text, geänderte ältere Tests, gepflanzte Fehler, Befunde). Bilder außerhalb des Repos unter `/Users/thorstenjankowski/n8n-compose/20260918_fundamento-ds/.fundamento/spec058/bilder/`.

## 1. PR, Commit, CI

- PR: **⟨PLATZHALTER: PR-Link⟩** · Commit: **⟨PLATZHALTER: Hash⟩** · Dispatch-Lauf (genau einer): **⟨PLATZHALTER: Lauf-Link, Ergebnis⟩**

| Job | PR-Lauf | Dispatch | Notiz |
|---|---|---|---|
| Affected packages (betroffen) | ⟨PLATZHALTER⟩ | ⟨PLATZHALTER⟩ | |
| Build, lint and Modelo checks | ⟨PLATZHALTER⟩ | ⟨PLATZHALTER⟩ | kein Schema, keine Abhängigkeit |
| Unit tests (metiejo) | ⟨PLATZHALTER⟩ | ⟨PLATZHALTER⟩ | alle `*-058`, 054–056 |
| Unit tests (modelo) | ⟨PLATZHALTER⟩ | ⟨PLATZHALTER⟩ | bekannt wackelnd: `ci/turbo-inputs.test.ts` (Hook-Zeitgrenze) |
| Unit tests (cli · ekranoj · nordstelo · agordilo · mcp) | ⟨PLATZHALTER⟩ | ⟨PLATZHALTER⟩ | |
| Unit tests (Projekcioj, Shards) | ⟨PLATZHALTER⟩ | ⟨PLATZHALTER⟩ | |
| Timing checks | ⟨PLATZHALTER⟩ | ⟨PLATZHALTER⟩ | lokal nicht beurteilt |
| Rendered Eroj / Alirebleco / Vitrino / Make Kit / Quickstart | ⟨PLATZHALTER⟩ | ⟨PLATZHALTER⟩ | nichts unter `packages/eroj/**` geändert |

## 2. Bilder (Modell-Double, 0 $; Chromium 153, 2100×1250)

`pnpm exec turbo run build --filter=@fundamento/metiejo`, `pnpm --filter @fundamento/nodredaktilo build`, dann `pnpm --filter @fundamento/nodredaktilo exec tsx scripts/bilder-058.ts --ziel /Users/thorstenjankowski/n8n-compose/20260918_fundamento-ds/.fundamento/spec058/bilder`. Metiejo im Prozess aus `dist`, Temp-Arbeitsordner, erfundenes Pinterest-Board, Schriften offline (Ersatzschrift in den Bildern). Nach QA-Lauf 1 endet das Skript **grün** (Exit 0, 86 Prüfungen) mit einem Befund: die Kantenmessung nach „Anordnen“ ist dort Befund statt Prüfung (B4). Die 16 Bilder stammen aus diesem Lauf.

1. [01-neue-marke](file:///Users/thorstenjankowski/n8n-compose/20260918_fundamento-ds/.fundamento/spec058/bilder/01-neue-marke.png) · 2. [02-grundlagen](file:///Users/thorstenjankowski/n8n-compose/20260918_fundamento-ds/.fundamento/spec058/bilder/02-grundlagen.png) · 3. [03-uebersicht-ohne-ki](file:///Users/thorstenjankowski/n8n-compose/20260918_fundamento-ds/.fundamento/spec058/bilder/03-uebersicht-ohne-ki.png) · 4. [04-pinterest-vorschau](file:///Users/thorstenjankowski/n8n-compose/20260918_fundamento-ds/.fundamento/spec058/bilder/04-pinterest-vorschau.png) · 5. [05-layout-beispiel](file:///Users/thorstenjankowski/n8n-compose/20260918_fundamento-ds/.fundamento/spec058/bilder/05-layout-beispiel.png) · 6. [06-markenprofil](file:///Users/thorstenjankowski/n8n-compose/20260918_fundamento-ds/.fundamento/spec058/bilder/06-markenprofil.png) · 7. [07-vorschlag-uebernommen](file:///Users/thorstenjankowski/n8n-compose/20260918_fundamento-ds/.fundamento/spec058/bilder/07-vorschlag-uebernommen.png) · 8. [08-marke-titel-hell](file:///Users/thorstenjankowski/n8n-compose/20260918_fundamento-ds/.fundamento/spec058/bilder/08-marke-titel-hell.png) · 9. [09-marke-titel-dunkel](file:///Users/thorstenjankowski/n8n-compose/20260918_fundamento-ds/.fundamento/spec058/bilder/09-marke-titel-dunkel.png) · 10. [10-marke-raster](file:///Users/thorstenjankowski/n8n-compose/20260918_fundamento-ds/.fundamento/spec058/bilder/10-marke-raster.png) · 11. [11-marke-liste](file:///Users/thorstenjankowski/n8n-compose/20260918_fundamento-ds/.fundamento/spec058/bilder/11-marke-liste.png) · 12. [12-komponenten-akzent](file:///Users/thorstenjankowski/n8n-compose/20260918_fundamento-ds/.fundamento/spec058/bilder/12-komponenten-akzent.png) · 13. [13-namen-und-beschreibung](file:///Users/thorstenjankowski/n8n-compose/20260918_fundamento-ds/.fundamento/spec058/bilder/13-namen-und-beschreibung.png) („Namen“ begrenzt, Begründungen einzeilig, Vergleich scrollt im Knoten) · 14. [14-angeordnet](file:///Users/thorstenjankowski/n8n-compose/20260918_fundamento-ds/.fundamento/spec058/bilder/14-angeordnet.png) · 15. [15-ohne-schluessel](file:///Users/thorstenjankowski/n8n-compose/20260918_fundamento-ds/.fundamento/spec058/bilder/15-ohne-schluessel.png) · 16. [16-zwei-aufbauten-nebeneinander](file:///Users/thorstenjankowski/n8n-compose/20260918_fundamento-ds/.fundamento/spec058/bilder/16-zwei-aufbauten-nebeneinander.png). Bilder 08–11 durch Umschalten im Knoten.

**Akzent (AK-3):** sichtbare Stellen mit berechneter Farbe = `--fm-color-sekundo-*`: titel 6/6, raster 6/6, liste 7/7 (hell/dunkel), „Komponenten“ 1. **Höhen** (gemessen/Maximum `ARANGXO_058`): Marke 933/1240, „Namen“ 640/640, Layout-Beispiel 440/440, Schrift 361/361, Vorschau 684/760 (weitere 706/760), Beispiele 525/640, Grundlagen 210/300.

## 3. Echter Durchlauf (Kappe 0,50 $)

**Nicht ausgeführt** (Q-3: kein Agent liest die `.env`). Kosten 0 $, Modell –. Ob das eingerichtete Modell Bilder liest (offener Punkt 3), ist offen. Befehl für den Maintainer: siehe Abschnitt 7, Schritt 2.

## 4. Pinterest ohne Anmeldung (Q-4)

**Nicht gemessen.** Alle Prüfungen nutzen erfundene Seiten (`packages/metiejo/src/test-doubles/pinterest-058/`). Ob die gebauten Adressen `236x`/`736x` bei echten Boards, Pins und `pin.it`-Kurzlinks laden, zeigt erst ein echter Abruf; der Rückfall auf den Verweis mit dem bisherigen Satz ist getestet.

## 5. Geänderte ältere Tests

| Datei:Zeile | vorher → nachher | Grund |
|---|---|---|
| `packages/metiejo/src/grafeo-anschluss-056.test.ts:92` | `"vorschau-hell.en.bildo"` aus „refuses ids that are no port“ entfernt | `<id>.en.bildo` ist jetzt ein Anschluss (MAW-1.1) |

Dazu ein Test dieses Laufs: `vojoj-058.test.ts:115` (Pfad der Profil-Route ersetzt, MAW-4.1). Nichts unter `packages/eroj/**`.

## 6. Befunde

- **B1 – behoben (QA-Lauf 1):** „Namen“ war mit acht Namen 867 px hoch (Maximum 640) und überdeckte in der Startanordnung die Marke. Jetzt ist der Knoten höchstens `altecoDe(…, {stufe: 58})` hoch, der Vorschlag scrollt im Knoten, jede Begründung steht einzeilig (`nodoj/ki-namen.tsx`); gemessen 640/640.
- **B2 – behoben:** Layout-Beispiel 453 → 440/440, Merkmale und Worte scrollen im Knoten (`nodoj/layout-beispiel.tsx`).
- **B3 – behoben:** Schrift 361 px nach „Vorschlag übernehmen“ – der zweizeilige Offline-Satz der Katalogschriften. Schätzung in `ARANGXO_058.alteco.schrift` 360 → 361 (056 unverändert); Startanordnung ohne Überdeckung.
- **B4 – teilweise behoben, Rest Befund:** „Namen“ steht nach „Anordnen“ an der linken Kante der Spalte der Marke (`gestalten/anordnen.ts`), die 5 Kanten in seinen Text-Eingang laufen nicht mehr durch die Marke. Eine Kante bleibt: Beispiele → Bild-Eingang der Marke streift „Namen“ (0,1 px). Keine saubere Lösung ohne Längenangabe; im Skript ist die Kantenmessung nach „Anordnen“ darum ein Befund statt Prüfung (AK-5 verlangt Boxen ohne Überdeckung) – eine bewusst abgeschwächte Prüfung, zu entscheiden vom Maintainer.
- **B5 – behoben:** die erfundenen Pinterest-Seiten heißen `*.html.txt` (Biome parst sie nicht), am selben Ort im Turbo-Hash; `pnpm lint` grün.
- **QA-Lauf 2 (Browser-Durchgang von Hand, Modell-Double):** keine Fehler. Beobachtungen, kein AK verletzt: nach „Anordnen“ mit gefülltem „Namen“ laufen drei Kanten hinter anderen Knoten (Beispiele → „Namen“ liest sich, als speise Beispiele die Marke zweimal; gehört zu B4); ein wachsender Knoten überdeckt Nachbarn bis zum nächsten „Anordnen“; ein neuer Knoten „Namen“ kann außerhalb des Sichtfelds landen; die Seitenspalte zeigt Merkmale als rohe Wörter; „+ Knoten“ nennt die Vorschau weiter „Komponenten · weitere anlegen“. Einzelheiten in `tasks.md`, „QA-Lauf 2“.
- Offene Punkte 1 (erster Aufbau „Großer Titel“) und 5 (Akzent ohne Zweitfarbe grau) wie gebaut; weitere Befunde der Tickets in `tasks.md`, „Befunde“.

## 7. Prüfungen (lokal)

- Quertests (8 Dateien, 32 Tests) grün; je Prüfgruppe ein gepflanzter Fehler (25; ein erster E1 blieb grün und wurde ersetzt), rot gesehen, `cmp`-gleich zurückgesetzt.
- `pnpm --filter @fundamento/nodredaktilo build` direkt: grün.
- eroj in Chromium, je Datei einzeln: buehne-036 20, buehne-navigation-042 2, form-036 1, wackler-040 3, zweitfarbe-036 5, metiejo-036-uebernahme 2, metiejo-036 2, metiejo 6, studio-035 6, stato-041 3, weg-c-bildgewicht-036 3, weg-c 2 – alle grün, keine Wiederholung.
- `FM_AUSGABE=knapp pnpm test:betroffen`: rot nur nordstelo mit Zeitgrenzen (`ablauf/raporto.test.ts:70`, Hooks in `ac8.test.ts`, `neubewertung-053.test.ts`, `ablauf/integra.test.ts`). Nacheinander: cli 120/0, ekranoj 301/0, nordstelo 379/0, metiejo 1351/0, modelo 4978/1 (`ci/turbo-inputs.test.ts:710`, verursacht vom ersten Wächter dieses Tickets; behoben, danach 8/0). Nichts angehoben, nichts wiederholt.
- `pnpm lint`: grün (22/22) nach QA-Lauf 1; ältere Warnungen unverändert (u. a. `komponentoj.ts:42`).
- QA-Lauf 1: Metiejo `*-058` und `*-05[456]*` 665/0, `turbo-inputs.test.ts` 8/0, `bilder-058.ts` Exit 0.
- QA-Lauf 2 (Endstand, nach den Korrekturen): Metiejo ganze Suite 1351/0; eroj in Chromium erneut je Datei einzeln, dieselben zwölf Dateien, alle grün, keine Wiederholung. Nicht wiederholt nach QA-Lauf 1: `pnpm test:betroffen` über cli, ekranoj, nordstelo, modelo.
- Diff-Suche `node specs/058-marke-auswerten/diff-suche.mjs 0f9ada50`: 0 Treffer in allen acht Regeln (Tabu-Pfade, Root/Lockfile, Abhängigkeit, `--fm-`-Token, Grenze/Zeitlimit/`retries`, Schema, `packages/modelo/data`, die zwei Wörter).

## 8. Was der Maintainer jetzt tut

1. Bilder ansehen: `/Users/thorstenjankowski/n8n-compose/20260918_fundamento-ds/.fundamento/spec058/bilder/01-neue-marke.png` bis `16-zwei-aufbauten-nebeneinander.png`.
2. Den echten Durchlauf starten (Schlüssel, `FM_KI_ANBIETER`, `FM_KI_MODELL` in `/Users/thorstenjankowski/.purple-code/worktrees/fundamento-wt-mwjo2nd4wmvyz1cv/repos/fundamento/.env`), im Repo-Wurzelverzeichnis: `pnpm exec turbo run build --filter=@fundamento/metiejo && pnpm --filter @fundamento/nodredaktilo build && pnpm --filter @fundamento/nodredaktilo exec tsx scripts/bilder-058.ts --ziel /Users/thorstenjankowski/n8n-compose/20260918_fundamento-ds/.fundamento/spec058/bilder --echt` – Kosten und Modell hier in Abschnitt 3 eintragen.
3. Über den Rest von B4 entscheiden (Kantenmessung nach „Anordnen“ als Befund statt Prüfung) und die Korrektur der Schrift-Schätzung auf 361 (B3) bestätigen.
4. Offene Punkte 1 und 5 der Produkt-Spec bestätigen oder ändern (`specs/058-marke-auswerten/spec.md`, „Offene Punkte“).
5. Nach Push, PR und dem einen `workflow_dispatch` die Platzhalter in Abschnitt 1 füllen; bei einem bekannten Wackel-Test den Neustart selbst auslösen.
6. Erst nach grünem PR-Lauf und vollem Lauf mergen.
