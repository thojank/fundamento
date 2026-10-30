# Spec 035 – Paket nach den Abnahmen vom 30.10. – Plan

**Spec:** [`spec.md`](spec.md) (Fassung vom 2026-10-30, 23:00, unverändert kopiert; SHA-256 `472d2c443219a5b0c07945756386bd7d88e6a4d8db55ddd652143146f6be264a`) · **Basis:** `main` `367b7a52` (nach #115, #117–#122, #124) · **Regel 0** gilt: der Weg, den das Repo schon geht, sonst die kleinste Änderung mit Eintrag hier. **Keine Budgets und keine Grenzen angehoben. Nichts gemergt.**

**Datum:** 2026-10-30 · **Stand:** Gerüst. Spec wortgleich übernommen, Entscheidungen V-1 bis V-3 und D-01 bis D-14 eingetragen, alle „vorgeschlagen“. Die Teile laufen; Ergebnisse, Messungen und Bericht folgen in eigenen Doku-Commits auf diesem Branch.

**Ablage (D-01):** `spec.md`, `plan.md` und `tasks.md` liegen nur auf dem Branch von Teil 1. Die übrigen PRs verlinken auf diesen plan.

### Branches

Alle neuen Branches von `367b7a52`. Je Branch ein eigener Worktree unter `/tmp/s035-*` (Muster aus Spec 034 D-01), damit Builds und Hintergrundläufe sich nicht stören.

| Worktree | Branch | PR | Inhalt |
|---|---|---|---|
| `/tmp/s035-main` | losgelöst `367b7a52`, gebaut, unverändert | – | Bezug für alle Messungen „vorher“ |
| `/tmp/s035-t1` | `261030-spec-035-t1-pruefungen` (neu) | neu: „Spec 035 Teil 1 – Prüfungen verlässlich“ | 1.2, 1.3 und `specs/035-paket-abnahmen/` |
| `/tmp/s035-125` | `261030-ableitung-kalibriert` (bestehend) | #125 (neu aufgesetzt) | 1.1 |
| `/tmp/s035-t2` | `261029-spec-029-2b1b-status` (bestehend) | #123 (neu aufgesetzt) | 2.1, 2.2 |
| `/tmp/s035-t2-figma` | `261030-spec-035-t2-figma` (neu, vom Kopf von #123) | neu, Basis `261029-spec-029-2b1b-status`: „Spec 035 Teil 2 – Figma-Befunde (gestapelt auf #123)“ | 2.3.1–2.3.4 (D-08) |
| `/tmp/s035-t3` | `261030-spec-035-t3-studio` (neu) | neu: „Spec 035 Teil 3 – Studio“ | 3.1–3.4 |
| `/tmp/s035-t4a` | `261030-spec-035-t4a-markenassistent` (neu) | neu: „Spec 035 Teil 4a – Markenassistent: Recherche und Bilder“ | 4.1, 4.5.6 (D-10) |
| `/tmp/s035-t4b` | `261030-spec-035-t4b-markenassistent` (neu) | neu: „Spec 035 Teil 4b – Markenassistent: Ablauf und Darstellung“ | 4.2–4.4, 4.5.1–4.5.5, 4.6 (D-10) |
| `/tmp/s035-k` | losgelöst am Kopf von #123 nach 2.2 | – | Messung Reihe K |
| `/tmp/s035-vor122` | losgelöst `013f2e59` (erster Elternteil des Merges von #122) | – | AK-07, Profil „vor #122“ |

## Zusammenfassung

### Teil 1 – Prüfungen verlässlich

- **1.1** (#125): –
- **1.2** M5 Gegenprobe 2: –
- **1.3** AK-07: –

### Teil 2 – Felder

- **2.1** #123 neu aufgesetzt, Reihenfolge am Feldrand laut `trailing`: –
- **2.2** Sichtbare Beschriftung, Reihe K: –
- **2.3.1–2.3.4** Figma-Befunde: –

### Teil 3 – Studio

- **3.1–3.4**: –

### Teil 4 – Markenassistent

- **4a** (4.1, 4.5.6): –
- **4b** (4.2–4.4, 4.5.1–4.5.5, 4.6): –
- **4.7** Messung: –

## Entscheidungen, vom Maintainer zu bestätigen

Der Lauf ist unbeaufsichtigt (R-1). Wo die Spec offen lässt, gilt der Vorschlag. Entscheidungen, die im Lauf fallen, kommen als D-15 ff. dazu.

| ID | Frage | Vorschlag | Stand |
|---|---|---|---|
| V-1 | 2.3.4 Schreibgeschützt: welche Füllung? | Eine Regel für alle Felder: wie die Fonto; ist sie dort uneinheitlich, wie `kampo`. | vorgeschlagen |
| V-2 | 4.1 Wie findet Weg C die Farben einer Marke? | Weg C rendert jede gelesene Seite lokal als Bild (Playwright/Chromium, nur auf dem Rechner des Nutzers) und misst wie Weg B nach Fläche, mit mehr Gewicht für Logo und den oberen Bildschirm; CSS-Werte nur ergänzend. Blockiert eine Seite den Abruf (Status, Challenge-Seite), sagt der Assistent das in einem Satz, statt still zu raten. | vorgeschlagen |
| V-3 | 4.3 Form „ganz rund“ und Stufen | Die Form bekommt für Bedienelemente eine Wahl „Pille“ (voll gerundet), erreichbar über Regler und Chat; Karten und Flächen bleiben begrenzt. Ein relativer Wunsch („runder“, „eckiger“) ändert sichtbar, mindestens eine Stufe (Größe hier festgelegt). | vorgeschlagen |
| D-01 | Wo liegen spec, plan, tasks? | `specs/035-paket-abnahmen/` liegt nur im PR von Teil 1. Würde jeder PR `plan.md` ändern, kollidierten die Merges. Die übrigen PRs verlinken auf den plan im Branch von Teil 1; er wird über die Nacht in eigenen Doku-Commits fortgeschrieben, getrennt von roten und grünen Commits. Die Teile schreiben ihre Beiträge zuerst in je eine eigene Datei außerhalb des Repos; ein Doku-Commit am Ende führt sie zusammen. | vorgeschlagen |
| D-02 | 4.5.3 Wie zeigt der Chat Antworten des Modells? | Sicher darstellen: ein kleiner Markdown-Teil (fett, Listen) als Text-Knoten, kein `innerHTML` mit Modellausgabe. | vorgeschlagen |
| D-03 | Reihenfolge bei knappem Budget | 4.7 Weg C (wichtigster Punkt 4.1) → 4.7 Weg A → 2.2 Reihe K. | vorgeschlagen |
| D-04 | 2.2 Bedeutung von `label`, Arkitekturo-Vertrag (Props von 0.2.0), Changeset/CHANGELOG | Bevorzugt eine Lösung ohne Bedeutungswandel: bestehende Nutzungen sehen gleich aus. Ändert sich die Bedeutung von `label`, ist das eine Änderung für Nutzer: Hinweis in `CHANGELOG.md` („Unveröffentlicht“, mit Migrationssatz); auf `367b7a52` gibt es keinen `.changeset/`-Ordner, deshalb gilt der CHANGELOG-Eintrag nach dem im Repo üblichen Verfahren. Welche Lösung gewählt wurde, steht hier nach Teil 2. | vorgeschlagen |
| D-05 | Modellkosten und Umfang von Reihe K | Kosten zum Listenpreis aus `packages/metiejo/data/prezoj.json` (0,20 $ je 1 Mio. Tokens Ein- und Ausgabe). Reihe K einmal mit `--varianten F,0 --ripetoj 1`, `--max-tokens` auf den Restbetrag. Der Umfang von Spec 034 (`--ripetoj 3`) läge mit etwa 0,60 $ über dem Budget. Die Läufe von 4.7 werden zuerst reserviert (Weg C 0,01 $, Weg A 0,02 $). | vorgeschlagen |
| D-06 | 1.3 AK-07 und #123 | Ist die Ursache dieselbe, die #123 behebt (eine gemeinsame Ajv-Instanz je Prozess, `2537e469`), übernimmt Teil 1 diese Stellen byte-gleich; #123 lässt sie unverändert. So bleibt der spätere Merge von #123 trivial. Ist die Ursache eine andere, behebt Teil 1 sie selbst, und der Bericht nennt die Überschneidung. | vorgeschlagen |
| D-07 | `spec.md` wortgleich gegen R-7 und R-12 | AC-1 geht für diese eine Datei vor: `spec.md` ist byte-gleich mit der Quelle, einschließlich der echten Markennamen, eines Messwerts einer echten Marke und des Worts aus R-12. Sie ist die einzige Stelle. plan, tasks, Code, Tests, Fixtures, Commit-Nachrichten, PR-Texte und Bericht bleiben frei davon; echte Marken heißen hier „Marke 1“, „Marke 2“. R-12 gilt als: keine hinzugefügte Zeile in einem Diff gegen `367b7a52` enthält das Wort, außer in `spec.md`. | vorgeschlagen |
| D-08 | 2.3 eigener PR oder in #123? | Ein eigener PR, gestapelt auf #123 (Basis `261029-spec-029-2b1b-status`), wie #123 auf #122 gestapelt war: 2.3 ändert dieselben Skemoj, Generatoren und Figma-Bildbasis wie #123, ein zweiter PR von `367b7a52` hätte sicher Konflikte. AC-2 (je Teil ein PR mit Basis `main`) gilt über #123. Rückfall, falls #123 blockiert: 2.3 von `367b7a52` mit Basis `main`. | vorgeschlagen |
| D-09 | AC-10 Bildgleichheit | Web: Geometrie- und DOM-Tests werden committet; die Pixelgleichheit bestehender Nutzungen ist ein reproduzierbarer Vergleich zwischen zwei Commits auf demselben Rechner und Browser (PNG byte-gleich), Befehl und Ergebnis hier. Figma: über den committeten Bildtest (`plugin-bauformen-bild.test.ts`). Keine PNG-Referenzbilder in der CI (sie unterschieden sich zwischen macOS und Linux). | vorgeschlagen |
| D-10 | Teil 4 in zwei PRs | 4a „Recherche und Bilder“: 4.1 und 4.5.6 (beide brauchen den Decoder über den Browser) mit der neuen optionalen Abhängigkeit. 4b „Ablauf und Darstellung“: 4.2–4.4, 4.5.1–4.5.5, 4.6. | vorgeschlagen |
| D-11 | 4.5.6 JPG und WebP dekodieren | Über denselben optionalen, bei Bedarf geladenen Browser wie Weg C (Chromium dekodiert beide). Ohne Browser wird der Upload angenommen und gespeichert, und der Assistent sagt in einem Satz, dass die Farben dieses Bildes ohne Browser nicht messbar sind. Alternative mit Begründung: ein kleiner Decoder in reinem JavaScript (MIT/BSD/Apache). | vorgeschlagen |
| D-12 | 4.1 Tests von Weg C ohne Browser im Metiejo-Job | Metiejo-Vitest mit Attrappen für Renderer (synthetischer Screenshot) und Lader (scheiternder Import); der Test mit echtem Chromium liegt in der Playwright-Suite der Eroj. Keine übersprungenen Tests. | vorgeschlagen |
| D-13 | 1.1 Bezugswert von #125 | Der Bezugswert der schnellen Runner kommt aus einer committeten Kalibriertabelle (Median der schnellen Runner) und wird von einem Test daran gebunden, rot zuerst. Die Grenze „Median ≤ 150 ms“ bleibt. | vorgeschlagen |
| D-14 | 4.6 Drei Skizzen | Als Beschreibung in diesem plan (Abschnitt „Drei Skizzen“), keine Vitrino-Seite. | vorgeschlagen |

## Entwurfsentscheidungen je Befund

–

## Bildtests als gewollte Änderung neu gesetzt

Jede Bildabweichung, die nicht in dieser Tabelle steht, ist ein Fehler. Ein Commit zu 2.2 setzt nie ein Referenzbild neu.

| Befund | Test / Datei | Komponenten und Zustände | Grund | Commit |
|---|---|---|---|---|
| 2.1 | – | – | – | – |
| 2.3.1 | – | – | – | – |
| 2.3.2 | – | – | – | – |
| 2.3.3 | – | – | – | – |
| 2.3.4 | – | – | – | – |

## Messungen

### AK-07 vorher und nachher

Je vier Läufe im Wechsel (A/B), gleiche Konfiguration, `uptime` je Lauf, Median der Zeile „AK-07 start to first describe“, `CI` nicht gesetzt. Budget 2000 ms unverändert, Ziel ≤ 1900 ms.

–

### Gegenprobe 2 je Runner

–

### Ableitung je Runner (Kalibriertabelle #125)

–

### Kennzahl K nach 2.2

–

### Recherche vorher und nachher (lokal, Zusammenfassung)

Echte Marken nur lokal unter `.fundamento/spec035/marken/` im Checkout des Maintainers; hier nur die Zusammenfassung ohne Bilder und ohne Werte.

–

### Modellkosten

Nur `ministral-14b-2512`, zusammen höchstens 0,50 $. Preis aus `packages/metiejo/data/prezoj.json` (D-05).

| Lauf-ID | Zweck | Anfragen | Tokens ein/aus | Kosten $ | Dauer | Commit |
|---|---|---|---|---|---|---|
| 4.7-weg-c | 4.7 Weg C, synthetische Seite | – | – | reserviert 0,01 | – | – |
| 4.7-weg-a | 4.7 Weg A, `abnahme-weg-a.ts --mit-modell` | – | – | reserviert 0,02 | – | – |
| | **Summe** | | | **0,00 gebucht** | | |

## Abhängigkeiten

–

## Messanleitung

Alles im Checkout des Maintainers `/Users/thorstenjankowski/n8n-compose/20260918_fundamento-ds`.

### Teil 1

–

### Teil 2

–

### Teil 3

–

### Teil 4

–

## Drei Skizzen

–

## Blockiert

–

## Bericht

Folgt am Ende des Laufs.
