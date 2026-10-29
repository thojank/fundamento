# Nachlese 12 – Messpunkt „nach der Fonto“, Reihe O, Zeittest M5, Größe der Vitrino – Plan

**Briefing:** [`briefing.md`](briefing.md) (Fassung vom 2026-10-29, unverändert kopiert; SHA-256 `d9b851b6…1f7cdb60`) · **Basis:** `main` `05f122d` (nach #110, #111, #113) · **Regel 0** gilt. **Keine Budgets und keine Grenzen angehoben. Keine Änderung an der Optik der Eroj.**

**Branch:** `261029-nachlese-12-m5-vitrino` · **Datum:** 2026-10-29 · **Stand:** ③ und ④ gebaut, H und K gemessen, Reihe O läuft (Messpunkte über mehrere Tage, weil das freie Kontingent 1 000 Anfragen am Tag hat).

### Zusammenfassung

1. **① Messpunkt „nach der Fonto“:**
   - **Reihe H** (`gpt-4.1-mini`, `--max-tokens 2500000`): F 74,2 gegen 0 35,2 (neue Gewichtung), Kosten 0,81 $
   - **Reihe K** (`ministral-14b-2512`): F 76 gegen 0 33,3, 0 $
   - beide auf `main` `05f122d`, mit dem Werkzeug von `main`
2. **② Reihe O mit einem Werkzeug:**
   - Alle drei Messpunkte laufen mit dem Werkzeug dieses Branches (`269b4ff`, eigener Worktree). Gewechselt wird nur das System, mit `--sistemo`: `721743f`, `af6695a`, `05f122d`.
   - Mehr als 20 % ohne Seite beenden die Reihe als „nicht messbar mit diesem Anbieter“ (`--hoechstens-ohne-seite 20`).
3. **③ M5 robust, Grenze 50 ms unverändert:**
   - Das Urteil trennt die Arbeit der Skripte (je Frame, höchstens 50 ms, in jeder Änderung) von der Blockade je Änderung (90. Perzentil über 50 Änderungen, höchstens 50 ms).
   - Zwei Gegenproben, beide rot:
     - künstliche 80 ms Skript in der Werkstatt: Skripte 81 ms, Perzentil 100 ms
     - künstliche 80 ms Stil und Layout ohne langes Skript (Nachtrag des Maintainers): Skripte 9 ms, Perzentil 207 ms
4. **④ Kontrastpaare einmal:**
   - Die Vitrino legt jede Tabelle einmal ab, und jede Kombination verweist darauf.
   - Größe: komuna 10,5 → 6,8 MB, komuna mit ekzemplo (Build der CI) 15,1 → 7,7 MB, alle vier Marken 29,2 → 10,6 MB.
   - 16 von 16 Abschnitten pixelgleich.

### Entwurfsentscheidungen

#### D-01 ① Läufe aus einem sauberen Worktree auf `main`
- H und K laufen aus `/tmp/n12-main` (`05f122d`, gebaut, ohne Änderung): Werkzeug und System sind `main`.
- So stören die Builds dieses Branches die laufenden Messungen nicht.
- Beide Läufe sind mit `restaro --skribi` in beiden Gewichtungen bewertet, je 0 abweichend.

#### D-02 ② Werkzeug dieses Branches, System aus einem anderen Checkout
- `--sistemo <Checkout>` (`sistemo.ts`) nimmt aus einem gebauten Checkout:
  - die gebauten Eroj
  - den MCP-Server mit seinem Modelo (`createFundamentoServer`, `loadServed`)
  - die CSS-Projekcio mit allen Marken
- Werkzeug, Katalog und Bewertung bleiben die dieses Checkouts:
  - Agent mit Pforte, B-9 und erneuten Versuchen
  - Rendern, `restaro`
- Die CSS des Systems geht in einen eigenen Ordner (`projekcioj-<Commit>`), damit ein gleichzeitiger Lauf seine behält.
- Die Bezeichnung eines Laufs nennt beide Commits: „269b4ffe (System 721743fb)“. So setzt ein Lauf nie den Lauf eines anderen Systems fort.
- Ein älteres System (vor Nachlese 11 B-3) hat Schemata mit `oneOf` an der Wurzel. Das Werkzeug legt sie für den Anbieter zusammen (`providerSchema`), wie es das Werkzeug der Spec 030 tat; der Gvidanto prüft weiter gegen sein eigenes Schema.
- Die Kette der drei Messpunkte steht in `/tmp/n12-o-reihe.sh` (Messanleitung, Schritt 2): Fertige Messpunkte überspringt sie, ein pausierter setzt mit demselben Befehl fort, „nicht messbar“ beendet die Reihe.

#### D-03 ③ M5: Skripte hart, Rendern über die Änderungen
Gemessen in 81 CI-Läufen vor der Änderung (siehe M5 unten):
- Die roten Werte (51 bis 65 ms) kamen nur auf langsamen Runnern und nur in 1–2 von 50 Änderungen.
- Die Long Animation Frames dazu haben keine Skripte (`scripts: []`, `blocking` 0–2 ms), nur Stil und Layout.

Das Urteil (`packages/eroj/test/m5.ts`) für M5 und G5:

| Teil | Gemessen | Grenze |
|---|---|---|
| Skripte | längste Arbeit von Skripten in einem Frame (Long Animation Frames, erzwungenes Layout im Skript eingeschlossen), über alle Änderungen | 50 ms, einmal reicht für Rot |
| Rendern | je Änderung die längste Blockade (Long Tasks, der Änderung zugeordnet, in der sie begann); davon das 90. Perzentil über die 50 Änderungen | 50 ms |

- Die Grenze bleibt 50 ms.
- Rot wird es, wenn ein Skript der Werkstatt einmal 50 ms überschreitet oder wenn mehr als jede zehnte Änderung länger blockiert.
- **Gegenprobe 1 (Skript):** Sie baut 80 ms in jeden Auftrag der Werkstatt an ihren Worker ein (`Worker.prototype.postMessage` im Test umhüllt, kein Haken im Produktionscode) und erwartet Rot.
- **Gegenprobe 2 (Stil und Layout, Nachtrag vom 29.10.):** `stilBlockadeEinbauen` in `m5.ts`:
  - Ein Block von `span`-Elementen liegt außerhalb des Bildes und wird verdoppelt, bis eine erzwungene Neuberechnung von Stil und Layout auf diesem Runner mindestens 80 ms kostet.
  - Danach wird er in Achtelschritten verkleinert, solange er 80 ms hält; gemessen 97 ms.
  - Dann schaltet jeder Auftrag an den Worker nur eine Klasse am Block, ohne zu lesen. Die Kosten fallen in die Darstellung des nächsten Frames.
  - Erwartet: rot über das 90. Perzentil, Skripte unter 50 ms. Gemessen: Skripte 9 ms, Perzentil 207 ms.
  - Weil der Block auf dem Runner selbst kalibriert wird, gilt das auf schnellen wie langsamen Runnern.
- `measure()` der Werkstatt liefert dafür `perChange` und `scriptLongest`; die alte Zeile mit „längste Blockade“ bleibt im Log.

#### D-04 ④ Eine Tabelle je Marke, Farbschema und Kontrast
- `kunpremiMezurojn` legt jede verschiedene Tabelle einmal ab (`unikaj`) und je Kombination ihren Index (`al`). Bei komuna sind es 4 Tabellen für 72 Kombinationen.
- Der Client der Vitrino setzt die Tabellen beim Laden wieder ein (eine Stelle in `skripto.ts`); die Anzeige liest wie bisher `datumoj.mezuroj[kombino]`.
- Vorbild ist `regulojKialoj` (Nachlese 6 N6-3: einmal statt in 72 Kombinationen).

### Messpunkte

Gewichtung Spec 030 = ohne Tor, K5 10; Gewichtung Nachlese 11 = Markenfähigkeit als Tor, K5 25. Alle Läufe sind mit dem `restaro` von `main` bewertet (nach O-6 der Nachlese 11).

Kosten in $:
- H mit 0,40 $ Eingabe und 1,60 $ Ausgabe je 1 Mio. Tokens. Gecachte Eingabe zählt das Werkzeug nicht; die Werte sind deshalb obere Grenzen, mit 0,10 $ für den Cache wären sie niedriger.
- K und O laufen in freien Tarifen: 0 $.

| Reihe | Messpunkt | Lauf | F gegen 0, Nachlese 11 | F gegen 0, Spec 030 | Streuung F / 0 (N11 · 030) | Anfragen | Tokens ein / aus | Kosten | ohne Seite |
|---|---|---|---|---|---|---|---|---|---|
| Reihe H | Ausgangslinie | `20261024-0825` | 74,8 gegen 38 | 71,5 gegen 74,3 | 11 / 0 · 13,2 / 19,3 | – (vor ④) | 1 543 556 / 62 783 | ≤ 0,72 $ | 2 |
| Reihe H | nach den Korrekturen | `20261024-1201` | 79,6 gegen 35,2 | 75,6 gegen 71,4 | 8,2 / 0 · 9,5 / 9,6 | – (vor ④) | 1 838 103 / 64 358 | ≤ 0,84 $ | 0 |
| Reihe H | **nach der Fonto** | `20261029-1126` | **74,2 gegen 35,2** | 69 gegen 72,9 | 9,8 / 0 · 11,6 / 2,9 | 314 | 1 768 320 / 63 532 | ≤ 0,81 $ | 0 |
| Reihe K | Ausgangslinie | `20261024-1233` | 66,7 gegen 33,3 | 64,4 gegen 47,6 | 12,9 / 2,7 · 14,7 / 7,2 | – (vor ④) | 2 933 354 / 158 769 | 0 $ | 2 |
| Reihe K | nach den Korrekturen | `20261024-1248` | 75,1 gegen 33,3 | 72,9 gegen 47,6 | 18,5 / 0 · 15,1 / 4,3 | – (vor ④) | 3 261 566 / 148 810 | 0 $ | 1 |
| Reihe K | **nach der Fonto** | `20261029-1127` | **76 gegen 33,3** | 74,9 gegen 47,6 | 16,7 / 0 · 14,8 / 7,8 | 333 | 2 828 072 / 153 502 | 0 $ | 0 |
| Reihe O | Ausgangslinie (System `721743f`) | `20261029-1143` | 68,2 gegen 36,1 | 65,6 gegen 53,6 | – (1 Wiederholung) | 483 (ohne die gescheiterten) | 11 500 479 / 185 886 (B-4: ohne Ersatzzählung) | 0 $ | 5 von 40 (12,5 %) |
| Reihe O | nach den Korrekturen (System `af6695a`) | folgt | – | – | – | – | – | 0 $ | – |
| Reihe O | nach der Fonto (System `05f122d`) | folgt | – | – | – | – | – | 0 $ | – |

Die alten Läufe der Reihe O (`20261024-1422`, `20261027-1500`, `20261027-1535`) mit verschiedenen Werkzeugen ersetzt die neue Reihe (O-8); sie bleiben im Verlauf.

**Mittel je Kriterium, Variante F nach der Fonto** (Nachlese 11):

| | K1 | K2 | K3 | K4 | K5 | K6 | Markenfähigkeit |
|---|---|---|---|---|---|---|---|
| H | 0,98 | 0,74 | 0,63 | 0,55 | 0,96 | 0,42 | 0,97 |
| K | 0,98 | 0,77 | 0,58 | 0,56 | 0,81 | 0,45 | 0,93 |

**Top-10 der Lücken nach der Fonto (Variante F):**

| # | Reihe H | Anzahl | Reihe K | Anzahl |
|---|---|---|---|---|
| 1 | Regulo `field-label-visible` | 19 | Regulo `field-label-visible` | 28 |
| 2 | a11y `label` | 16 | Regulo `placeholder-not-label` | 17 |
| 3 | erfundenes Attribut `kampo.label` | 14 | a11y `label` | 13 |
| 4 | erfundenes Tag `fm-form` | 10 | erfundenes Attribut `kampo.label` | 12 |
| 5 | Regulo `ero-prop-constraint` | 8 | erfundenes Attribut `tekstareo.label` | 10 |
| 6 | Regulo `placeholder-not-label` | 6 | a11y `button-name` | 8 |
| 7 | erfundenes Attribut `elekto.label` | 5 | nachgebautes Ero `h1` | 7 |
| 8 | erfundenes Attribut `elektilo.label` | 4 | Rohwert `margin-top` | 6 |
| 9 | erfundenes Attribut `ligilo.href` | 4 | Regulo `uzo-slot-accepts` | 6 |
| 10 | erfundenes Attribut `alsxutilo.help` | 3 | Regulo `uzo-slot-min` | 6 |

Gemessen ist damit:
- **H nach der Fonto:** F liegt in beiden Gewichtungen unter dem Punkt nach den Korrekturen (Nachlese 11: 79,6 → 74,2). Die Bewegung kommt aus K4 (0,7 → 0,55) mit a11y `label` (16 Mal). Das ist die Beschriftung der Felder als Attribut (B-1 der Nachlese 11), nicht der Kontrast: `color-contrast` kommt in keiner Seite der Variante F von H vor (bei K in einer).
- **K nach der Fonto:** praktisch gleich (75,1 → 76).
- **Die größte Lücke bleibt die Beschriftung der Felder** (`label` als Attribut am `kampo`, `elekto`, `elektilo`, `tekstareo`). Sie ist der nächste Auftrag an Gvidanto und Uzo.
- **Ein Lauf mit 3 Wiederholungen je Reihe:** Bewegungen von wenigen Punkten liegen innerhalb der Streuung (H 9,8, K 16,7).

### M5 vorher und nachher

**Vorher** (81 CI-Läufe mit M5-Zeile, letzte Versuche je Lauf). Der Runner ist an der Ableitung erkannt: schnell unter 110 ms, mittel 110–130 ms, langsam über 130 ms.

| Runner | Läufe | rot (> 50 ms) | längste Blockade |
|---|---|---|---|
| schnell | 23 | 0 | 50 ms |
| mittel | 20 | 0 | 50 ms |
| langsam | 38 | 2 | 55 ms |

Die beiden roten (55 und 54 ms) hatten eine Ableitung von 138,9 und 136,5 ms; der rote Versuch aus #114 (56 ms, später neu gestartet) 143,5 ms. Die übrigen Werte des Briefings (51, 65 ms) stammen aus überschriebenen Versuchen, deren Logs GitHub nicht mehr liefert.

**Nachher:**
- Lokal: Skripte 0 ms, Perzentil 0 ms; Gegenprobe Skripte 81 ms, Perzentil 100 ms.
- CI: siehe PR (mindestens zehn Läufe, nach Runner-Klasse).

### Größe der Vitrino

| Build | vorher (`main`) | nachher | gzip vorher → nachher |
|---|---|---|---|
| komuna allein | 10,50 MB | 6,80 MB | 1,18 → 0,98 MB |
| komuna und ekzemplo (Build der CI) | 15,14 MB | 7,75 MB | 1,43 → 1,03 MB |
| alle vier Marken | 29,15 MB | 10,64 MB | 2,18 → 1,16 MB |

- **Pixelvergleich** des Abschnitts Kontrast, `main` gegen Branch: komuna und ekzemplo × hell/dunkel × Kontrast normal/hoch × Dichte normal/kompakt, 16 von 16 Abschnitten byte-gleich (PNG).
- **Dauer der Vitrino-Jobs in der CI:** siehe PR.

### Abweichungen

1. **③ Weg:** Gewählt ist die Trennung von Skript und Rendern, mit vielen Messungen statt Einzelwert (die 50 Änderungen). Eine Kalibrierung gegen eine Referenzlast habe ich verworfen: Sie bräuchte einen festen Bezugswert, der selbst vom Runner abhängt, und würde die Grenze auf langsamen Runnern praktisch anheben.
2. **③ G5** nutzt dasselbe Urteil. Die Long Tasks fehlen dort nicht je Änderung; jeder zählt als eine der 50 Änderungen, die übrigen mit 0.
3. **② Werkzeug mit Code:**
   - `--sistemo`, `--hoechstens-ohne-seite`, das Zusammenlegen alter Schemata
   - das Zusammenführen des Tagesbuchs bei gleichzeitigen Läufen (B-2)
4. **④ ältere Tests nachgezogen:** `datumoj.test.ts` und `bazo.test.ts` lesen `mezuroj` aus dem Island und setzen die Tabellen jetzt ein wie der Client.

### Befunde / Mankoj

- **B-1, Kosten ohne Cache:** Das Werkzeug zählt gecachte Eingabe-Tokens nicht (`prompt_tokens_details.cached_tokens`). Die Kosten von H sind obere Grenzen.
- **B-2, Tagesbuch bei gleichzeitigen Läufen:**
  - H und K liefen zugleich mit dem Werkzeug von `main`; jeder schrieb das Tagesbuch mit seinem Stand.
  - H stellte 314 Anfragen, eingetragen sind 64.
  - Behoben in diesem Branch (`mergeLedger`); für OpenAI und Mistral ohne Folgen, weil sie kein Tageslimit haben.
- **B-4, Tokens gescheiterter Ergebnisse doppelt gezählt** (seit Spec 030, behoben in diesem Branch):
  - Für ein Ergebnis ohne Seite nahm der Lauf die Änderung des gemeinsamen Budgets während dieses Ergebnisses. Bei drei gleichzeitigen Ergebnissen enthielt sie die Tokens der beiden anderen.
  - Bei der Ausgangslinie O kamen so 7,17 Mio. Tokens auf 5 Zeitüberschreitungen; die Summe von 18,67 Mio. lag über der Kostengrenze, die tatsächlich nicht überschritten war.
  - Jetzt hängt der Agent seinen Aufwand an den Fehler (`effort`), und der Lauf nimmt diesen.
  - Die Kennzahl ist nicht berührt, nur Tokens und Anfragen.
  - Die Läufe der Reihe O mit dem Werkzeug `269b4ff` haben den Fehler noch. Ihre Tokens stehen im Bericht ohne die gescheiterten Ergebnisse, ihre Anfragen ebenso.
- **B-3, `regularo` steht wie die Kontrastpaare 18-fach in der Vitrino** (komuna 0,28 MB). Gleicher Weg möglich; nicht Teil dieses Auftrags (Aufgabe von 8b).

### Offen (für den Maintainer)

- **O-1, Reihe O:** Ergebnis folgt (Messanleitung, Schritt 2); bei mehr als 20 % ohne Seite endet sie als nicht messbar.
- **O-2, Kosten mit Cache:** Soll das Werkzeug `cached_tokens` zählen, damit die Kosten genau sind?

### Messanleitung

Alle Befehle im Checkout des Maintainers.

**1. Die Läufe ansehen.**

```sh
cd /Users/thorstenjankowski/n8n-compose/20260918_fundamento-ds
open "file:///Users/thorstenjankowski/n8n-compose/20260918_fundamento-ds/.fundamento/nordstelo/20261029-1126/restaro.md"
open "file:///Users/thorstenjankowski/n8n-compose/20260918_fundamento-ds/.fundamento/nordstelo/20261029-1127/restaro.md"
pnpm nordstelo restaro .fundamento/nordstelo/20261029-1126
pnpm nordstelo restaro .fundamento/nordstelo/20261029-1127
pnpm fm metiejo --open
```

**2. Reihe O fortsetzen** (dieselbe Kette, am nächsten Tag nach dem Tageswechsel des Kontingents; fertige Messpunkte überspringt sie):

```sh
cd /Users/thorstenjankowski/n8n-compose/20260918_fundamento-ds
/tmp/n12-o-reihe.sh
```

Gibt es `/tmp` nicht mehr, dann nach dem Merge so:

```sh
cd /Users/thorstenjankowski/n8n-compose/20260918_fundamento-ds
git worktree add --detach /tmp/n12-sys-721743fb 721743fb && (cd /tmp/n12-sys-721743fb && pnpm install && pnpm build)
pnpm nordstelo --anbieter openrouter --modell nvidia/nemotron-3-ultra-550b-a55b:free --ripetoj 1 --hoechstens-ohne-seite 20 --sistemo /tmp/n12-sys-721743fb
```

Für `af6695a` und `05f122d` entsprechend.

**3. M5 und die Gegenprobe.**

```sh
cd /Users/thorstenjankowski/n8n-compose/20260918_fundamento-ds
pnpm build
pnpm --filter @fundamento/eroj exec playwright test --config playwright.vitrino.config.ts -g "M5|verdict of M5|G5"
```

Erwartet:
- im Log „M5 Urteil (chromium): Skripte längstens … ms; Blockade je Änderung p90 … ms“
- „M5 Gegenprobe: Skripte blockieren 8x ms in einem Frame …“

**4. Größe der Vitrino.**

```sh
cd /Users/thorstenjankowski/n8n-compose/20260918_fundamento-ds
pnpm fm projekcioj build --config packages/modelo/test/fixtures/valid/aspekto-ekzemplo/fundamento.config.json --out .fundamento/projekcioj-ekzemplo
ls -l .fundamento/projekcioj-ekzemplo/vitrino/index.html
open "file:///Users/thorstenjankowski/n8n-compose/20260918_fundamento-ds/.fundamento/projekcioj-ekzemplo/vitrino/index.html#aspekto=komuna&color-scheme=dark&contrast=high"
```

Erwartet: etwa 7,7 MB. Im Abschnitt „Kontrast“ dieselbe Tabelle in jeder Dichte und Bewegung.
