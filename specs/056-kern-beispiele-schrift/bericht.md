# Spec 056 – Bericht (MP-2a: Ausgangslage, Kern, Werte, Beispiele, Schrift)

Stand 2026-11-16, Entwurf aus KBS-4.1 (T8); der Orchestrator füllt die Platzhalter nach Push, PR und dem einen `workflow_dispatch`. Quellen: [`spec.md`](spec.md), [`plan.md`](plan.md), [`tasks.md`](tasks.md) (dort der **PR-Text-Entwurf**, alle geänderten älteren Tests, die Diff-Suche und die gepflanzten Fehler). Bilder außerhalb des Repos unter `/Users/thorstenjankowski/n8n-compose/20260918_fundamento-ds/.fundamento/spec056/bilder/`.

## 1. PR, Commit, CI

- PR: **⟨PLATZHALTER: PR-Link⟩** · Commit: **⟨PLATZHALTER: Hash⟩** · Dispatch-Lauf (genau einer): **⟨PLATZHALTER: Lauf-Link, Ergebnis⟩**

| Job | PR-Lauf | Dispatch | Notiz |
|---|---|---|---|
| Affected packages (betroffen) | ⟨offen⟩ | ⟨offen⟩ | |
| Build, lint and Modelo checks | ⟨offen⟩ | ⟨offen⟩ | kein Schema, keine Abhängigkeit |
| Unit tests (metiejo) | ⟨offen⟩ | ⟨offen⟩ | alle `*-056`, 054/055, 047/048 |
| Unit tests (modelo) | ⟨offen⟩ | ⟨offen⟩ | |
| Unit tests (cli · ekranoj · nordstelo · agordilo · mcp) | ⟨offen⟩ | ⟨offen⟩ | |
| Unit tests (Projekcioj, Shards) | ⟨offen⟩ | ⟨offen⟩ | |
| Timing checks | ⟨offen⟩ | ⟨offen⟩ | lokal nicht beurteilt |
| Rendered Eroj / Alirebleco / Vitrino / Make Kit / Quickstart | ⟨offen⟩ | ⟨offen⟩ | nichts unter `packages/eroj/**` geändert |

## 2. Bilder (Chromium 153, 2100×1250)

`pnpm exec turbo run build --filter=@fundamento/cli --filter=@fundamento/metiejo --filter=@fundamento/nodredaktilo`, dann `pnpm --filter @fundamento/nodredaktilo exec tsx scripts/bilder-056.ts --ziel /Users/thorstenjankowski/n8n-compose/20260918_fundamento-ds/.fundamento/spec056/bilder` (Marke `lumeto`, Temp-Arbeitsordner, Temp-Schriftzwischenspeicher, freier Port; 107 Prüfungen, Abbruch beim ersten Fehler; 0 Seiten- und Konsolenfehler). Der Browser erreicht nur die Metiejo: Fontsource-Dateien kommen nur über `/api/tiparo/…` (der Server holt sie aus npm), die 46 CDN-Anfragen der Vorschau bricht das Skript ab, andere Anfragen nach außen: 0. Übersichtsbilder sind eingepasst, Detailbilder Ausschnitte bei dieser Zoomstufe.

1. [01-neue-marke.png](file:///Users/thorstenjankowski/n8n-compose/20260918_fundamento-ds/.fundamento/spec056/bilder/01-neue-marke.png) – drei leere Text-Knoten links, gestrichelt, blasse Kurven in die Marke, runde Punkte.
2. [02-kern-und-werte.png](file:///Users/thorstenjankowski/n8n-compose/20260918_fundamento-ds/.fundamento/spec056/bilder/02-kern-und-werte.png) – Ausgangslage, Markenkern, drei Werte mit eigenen Kanten; Marke mit Kern, Werten, „Dazu“.
3. [03-fuenf-werte.png](file:///Users/thorstenjankowski/n8n-compose/20260918_fundamento-ds/.fundamento/spec056/bilder/03-fuenf-werte.png) – fünf Werte, Feld weg, der ruhige Satz.
4. [04-text-knoten-alle.png](file:///Users/thorstenjankowski/n8n-compose/20260918_fundamento-ds/.fundamento/spec056/bilder/04-text-knoten-alle.png) – Zielgruppe, Wettbewerb, Persönlichkeit, Tonalität gefüllt; Beispiele und Schrift leer.
5. [05-beispiele-erkannt.png](file:///Users/thorstenjankowski/n8n-compose/20260918_fundamento-ds/.fundamento/spec056/bilder/05-beispiele-erkannt.png) – drei Bilder, sechs Felder mit Anteil, Kante von oben in die Marke, „Primär folgt den Beispielen.“, Primär `#2f5bff` „aus Material“.
6. [06-farbe-uebernommen.png](file:///Users/thorstenjankowski/n8n-compose/20260918_fundamento-ds/.fundamento/spec056/bilder/06-farbe-uebernommen.png) – anderes Feld als Primär, „Primär folgt nicht.“ mit „folgen lassen“, Palette und Vorschau auf neuem rev.
7. [07-pinterest-verweis.png](file:///Users/thorstenjankowski/n8n-compose/20260918_fundamento-ds/.fundamento/spec056/bilder/07-pinterest-verweis.png) – Board-Link als Verweis mit dem Satz, dazu das Bild einer direkten Adresse.
8. [08-schrift-fontsource.png](file:///Users/thorstenjankowski/n8n-compose/20260918_fundamento-ds/.fundamento/spec056/bilder/08-schrift-fontsource.png) – Fraunces und Inter, „Aa“ in Fraunces, Vorschau in beiden Schriften, Skala am Ende.
9. [09-schrift-zip.png](file:///Users/thorstenjankowski/n8n-compose/20260918_fundamento-ds/.fundamento/spec056/bilder/09-schrift-zip.png) – die vier Sätze, „Lato“, „Gefunden: Regular 400, Bold 700. Es fehlt: Italic.“, „1 andere Datei übergangen.“
10. [10-nach-neuladen.png](file:///Users/thorstenjankowski/n8n-compose/20260918_fundamento-ds/.fundamento/spec056/bilder/10-nach-neuladen.png) – alles nach dem Neuladen.
11. [11-verbindung-geloest.png](file:///Users/thorstenjankowski/n8n-compose/20260918_fundamento-ds/.fundamento/spec056/bilder/11-verbindung-geloest.png) – „mutig“ und Beispiele gelöst und blass, Marke ohne sie, „2 Verbindungen gelöst · zurücksetzen“.

**AK 7 im Browser (bindend, nicht in CI):** Start 14 Knoten, 19 Kanten; mit allen sechs Knoten 20 Knoten, 29 Kanten; mit vollen Inhalten ebenso. Jedes Mal: Boxen paarweise ohne Schnitt, jede Kante alle 2 px abgetastet ohne Punkt in einer fremden Box, jedes `d` mit `C`, alle Anschlüsse rund, 7 Farbkanten in ihrer Farbe, alle anderen in der grauen Rolle.

**Höhen (gemessen/Maximum §2.3):** Start: Marke 66/480, Ausgangslage 101/172, Markenkern 147/220, Werte 129/270. Knappe Fälle: Werte mit fünf Werten **269/270**; Zielgruppe drei Felder **259/264**; Wettbewerb drei Zeilen 209/220; Persönlichkeit 127/172; Tonalität sechs Regler 255/300; Beispiele mit zwölf Bildern und acht Feldern **601/640** (mit zusätzlich einem Verweis 663, der Knoten wächst nach unten); Schrift Skala am Ende 324/360, alle drei Regler am Ende **346/360**; Marke am vollsten in diesem Lauf 412/480 (KBS-2.1: 452). Kein Maximum geändert.

## 3. Ergebnis Pinterest-Link

Einmal geprüft (KBS-3.2, ohne Anmeldung, Cookie oder Konto): `https://www.pinterest.com/pinterest/official-news/` → 200 `text/html`, 1,68 MB. Anders als R-8 erwartet, nennt die Seite Bildadressen: 156 verschiedene `i.pinimg.com`-Adressen, davon 155 im JSON von `<script id="__PWS_INITIAL_PROPS__">`, 23 in `<img src>`, eine in `og:image`. Darauf ist nichts gebaut; ein Board-Link bleibt Verweis mit „Bilder von Pinterest bitte herunterladen und hier hochladen“ (Bild 07).

## 4. Ergebnis ZIP

Gelesen mit `node:zlib`, keine Abhängigkeit (`packages/metiejo/src/zip-legi.ts`). Gespeicherte und deflate-gepackte Einträge mit CRC- und Größenprüfung; `__MACOSX/`, versteckte Dateien und Ordner still übergangen, andere Nicht-Schriften gezählt. Unlesbar sind: beschädigt, falsche CRC, verschlüsselt, ZIP64, mehrteilig, andere Verfahren, ein Eintrag über 24 MiB. Abgelegt werden nur die Schriftdateien. Die Fixture `lato-400-700.zip` (Lato, OFL-1.1) ergibt „Gefunden: Regular 400, Bold 700. Es fehlt: Italic.“ und „1 andere Datei übergangen.“ (Test und Bild 09). **Keine Grenze für die Summe der Einträge.**

## 5. Geänderte ältere Tests

| Datei:Zeile | vorher → nachher | Grund |
|---|---|---|
| `packages/metiejo/src/grafeo-anordnung-055.test.ts:124` | Marke `[24, 48, 190, 72, 120]` → `[24, 48, 190, 480, 528]` | `altecoDe` liest `ARANGXO_056`; volle Marke gemessen 452 px (D-16) |
| `packages/nodredaktilo/scripts/bilder-055.ts:305, 418` | `/[QA]/` → `/[QAC]/`, Meldetext | Kurven schreiben `C` (M-1) |
| `packages/nodredaktilo/scripts/bilder-055.ts:404` | 11 → 14 Knoten beim Start | drei feste Text-Knoten |

Dazu an Tests dieses Laufs: `grafeo-anordnung-056.test.ts:78, 90` (dieselbe Anhebung) und `leinwand-sxelo-056.test.ts:441–453` (Routenmodule mit einem fremden Pfad aufgerufen, nachdem der Beispiele-Weg echt wurde). Kein Test aus 047/048, keine Datei unter `packages/eroj/**`.

## 6. Befunde für Spec 057 (was die Auswertung ohne KI nicht leistet)

- **JPG und WebP** brauchen den Browser des Enportilo; ohne ihn gespeichert, aber ohne Farben. Die Leinwand könnte selbst dekodieren.
- **hell/dunkel** nutzt `unbunt.dunkel_bis` (0,35), gedacht für „sehr dunkel“: `#2f5bff` (OKLCH L ≈ 0,55) heißt „hell“, Ablauf 2.3 erwartet „dunkel“ (Bild 05).
- **Pastellgrenze** `unbunt.pastell_ab` (0,8): `#c6f135` ist „hell · bunt“, aber keine Leitfarbe; ein sehr helles Gelbgrün wird nie Primär.
- **Zwei Wege für Schriftdateien:** der Knoten über npm (`/api/tiparo/…`, nur Latin 400/700), die Vorschau über das CDN.
- **ZIP ohne Summengrenze** (Abschnitt 4); „24 MB“ bedeutet MiB (25 165 824 Byte).
- **Aufräumen:** `spuroX` und `ARANGXO_055.spuroj` sind ungenutzt.
- **Abweichungen D-3/D-6:** Inhaltsknoten sind keine Bildo-Knoten; `primaer.seit` als Anker. Die Inhalte stehen nicht im Agordo, Export, Studio und Agenten sehen Kern und Werte nicht.
- Akzent aus „Erkannt“ ohne Dateinamen in `herkunft` (sonst Bildname im Paket). `schrift-privat` mit `bestaetigt`.
- Der Schreibweg der Leinwand beantwortet eine falsch gebaute neue Änderung (unbekannte Rolle, unbekannter Regler, Herkunft an Primär) wie jede falsch gebaute Änderung seit 054 mit 400 `{issues:[{rule:"sxangxo-invalid", …}]}`, nicht mit 422 `{satz}`; nur im API sichtbar.
- Sichtbar in den Bildern: Wettbewerb-Adressen abgeschnitten (`lampenhaus.exa…`, Bild 11); Probezeilen der Schrift mit Auslassungspunkten; mit Größe und Skala am Ende bricht „Standards“ in der Vorschau mitten im Wort (Bild 11); „dazwischen“ der Tonalität sitzt knapp über der nächsten Reglerzeile; die Schrift-Regler „Größe“ und „Gewicht“ zeigen „0,00“, solange kein Wert gesetzt ist (Bild 06).
- Weitere aus den Tickets (Belege in `tasks.md`): Wörter ohne gemeinsame Konstante; zwei Studio-Sätze kopiert; `fm-kampo` lässt `change` nicht aus dem Shadow DOM (älter); `fm-ikono: name is required`-Warnungen (älter); `retejo.ts:21` benennt `15_000` und `:72` schreibt die Zahl weiter selbst.

## 7. Prüfungen (lokal)

- **Korrektur im Produktcode:** `packages/nodredaktilo/src/gestalten/nodoj/schrift-eigene.tsx:85–86` las `--fm-typography-body-font-size` und `--fm-typography-label-font-weight`, die es in der Belegung nicht gibt (der Familienname erbte still); jetzt `--fm-typography-body-2-font-size` und `--fm-font-weight-medium`. Gefunden durch einen neuen Schritt in `bilder-056.ts`, der rot war und jetzt grün ist.
- Neue Tests `abnahme-056` 9/9 und `grafeo-urteil-056` 5/5; rot gezeigt mit 17 gepflanzten Fehlern (A1–A9, U1–U4c in `tasks.md`), jeweils `cmp`-gleich zurückgesetzt.
- eroj in Chromium, je Datei einzeln: `metiejo` 6, `metiejo-036` 2, `metiejo-036-uebernahme` 2, `form-036` 1, `zweitfarbe-036` 5, `buehne-036` 20, `buehne-navigation-042` 2 – alle grün, keine Wiederholung.
- `FM_AUSGABE=knapp pnpm test:betroffen`: rot nur drei Hook-Zeitgrenzen in nordstelo (`ac8.test.ts:156`, `neubewertung-053.test.ts:206`, `ablauf/integra.test.ts:131`). Nacheinander: metiejo 1127/0, cli 120/0, ekranoj 301/0, nordstelo 379/0; rot nur modelo `ci/turbo-inputs.test.ts:679` (Hook-Zeitgrenze), einzeln 8/0. Nichts angehoben.
- `pnpm lint` 22/22; `pnpm check:privat` PASS; `.only(`/`.skip(` nur das alte `context.skip` in `packages/mcp/src/http.test.ts:97`; 047/048 unverändert und grün.
- Diff-Suche gegen `6d34a75a` (Befehle in `tasks.md`): nichts unter den Tabu-Pfaden, keine Root-Datei, kein Lockfile, keine Abhängigkeit, kein neuer `--fm-`-Token, keine neue Zeit, Grenze oder Toleranz (benannt, Wert unverändert: `RETEJO_TEMPOLIMO`, `ANFRAGE_GRENZE`); Wort aus R-12 und Name des privaten Schriften-Repos 0 / 0.
- Bündel `dist/leinwand.js`: 746 121 → **843 439** Byte roh, 195 930 → **218 254** gzip -6; keine Schwelle.
- `bilder-055.ts` läuft mit der geänderten Zeile 404 durch (41 Prüfungen).

## 8. Was der Maintainer jetzt tut

1. Bilder ansehen: `/Users/thorstenjankowski/n8n-compose/20260918_fundamento-ds/.fundamento/spec056/bilder/01-neue-marke.png` bis `11-verbindung-geloest.png`; zum Vergleich `/Users/thorstenjankowski/n8n-compose/20260918_fundamento-ds/.fundamento/spec056/verbindungen.png`.
2. Die offenen Punkte der Produkt-Spec bestätigen oder ändern (`specs/056-kern-beispiele-schrift/spec.md`, „Offene Punkte für den Maintainer“), dazu „hell/dunkel“ für `#2f5bff` und die Pastellgrenze (Abschnitt 6).
3. CI-Tabelle in der PR-Beschreibung lesen (⟨PLATZHALTER: PR-Link⟩; PR-Lauf und genau ein `workflow_dispatch`).
4. Wahlweise, für „Ins private Repo legen“ mit echtem Repo: `FM_TIPAROJ_REPO` in `/Users/thorstenjankowski/.purple-code/worktrees/fundamento-wt-mwie0gl72jrqr7bo/repos/fundamento/.env` setzen.
5. Abnahme im Browser: im Worktree `/Users/thorstenjankowski/.purple-code/worktrees/fundamento-wt-mwie0gl72jrqr7bo/repos/fundamento` bauen und `pnpm --filter @fundamento/nodredaktilo exec tsx scripts/bilder-056.ts --ziel <ordner>` erneut laufen lassen, oder `fm metiejo` und die Abläufe 1–7 von Hand.
6. Folgeaufträge einplanen: Summengrenze für ZIP, Inhalte ins Agordo (nächster Schritt nach diesem Lauf), ein Weg für Schriftdateien, `spuroX` entfernen.
7. Erst nach einem grünen vollen Lauf mergen.
