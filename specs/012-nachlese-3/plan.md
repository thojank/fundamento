# Nachlese 3 – Plan

**Spec:** [`briefing.md`](briefing.md) (das Briefing vom 2026-10-17 ist die Spec, unverändert kopiert) · **Basis:** `main` @ `27532e8` (Spec 011 komplett, 17 Eroj) · **Regel 0** (12.10.) gilt: Weg des `butono` zuerst, sonst kleinste Änderung mit Eintrag hier; Tokens, Regulo-Semantik und Constitution unverändert; nie eine Grenze schwächen, um grün zu werden. **Aufgaben, Commits und rote Hashes:** [`tasks.md`](tasks.md).

Zwei PRs, gestapelt: ① Gvidanto (G1–G4) von `main`, ② Werkzeuge (W1–W6) von ①.

## ① Gvidanto

**Branch:** `261017-nachlese-3-gvidanto-e137d7` (von `main` @ `27532e8`) · **Datum:** 2026-10-17.

### Zusammenfassung

1. **G1 (O-28):** „Navigation“ führt zur `navigado`. `ligilo.goals.navigate` verliert `navigation` (en/de) und behält `navigate`/`navigieren`, `overview`/`übersicht`; `navigado.goals.navigate-app` bekommt `navigation` (en/de), `menu`/`menü` (`hauptmenü` stand schon). Jugxo `jug_01M54KXNGAVJ490FY86B10XTT6` (OP-12). Zwei Folgen im Datenbestand (D-01).
2. **G2:** Gleichstand zweier Goals → `ask-human` mit allen Kandidaten (D-02); Antworten ohne Gleichstand bitgleich.
3. **G3:** Check `goal-keyword-shared` in `check:regularo` (Warnung, beide Fundstellen, Ausnahme per Jugxo); heute: keine Doppelung in den Goals (D-03).
4. **G4:** die Grenzen im `brief` ohne Kialo; `butono` 748 → 546, `kampo` 743 → 447; nichts zurückgedreht (D-04).

Kein neues Ero, kein Token, keine Regulo-Semantik, Schema der Modelo-Daten unverändert; das MCP-Schema von `get_ero` (Ausgabe des `brief`, Beschreibung des Parameters) ist angepasst.

### Entwurfsentscheidungen

#### D-01 G1: „Navigation“ zur `navigado`, mit zwei Folgen im Datenbestand (Regel 0.2)

`ligilo/skemo.json`: `navigate` → en `["navigate", "overview"]`, de `["navigieren", "übersicht"]`. `navigado/skemo.json`: `navigate-app` → en `["navbar", "sidebar", "nav", "navigation", "menu"]`, de `["hauptnavigation", "hauptmenü", "seitenleiste", "navigationsleiste", "navigation", "menü"]`. „main menu“ ist zwei Wörter: ein Stichwort trifft nur ein Wort (`wordsOf`), `hauptmenü`/`menu` stehen dafür (Abweichung 1). Der Jugxo trägt die Kialo des Briefings und den Kontext (OP-12: eine Antwort, die stand, ändert sich). Zwei Folgen, beide nötig, damit das Modelo gültig bleibt und der Test des Briefings gilt:
- **`tabelo.boundary.row-actions-menu` gibt `menu`/`menü` ab** (behält `dropdown`, `aktionsmenü`, neu `rowmenu`/`zeilenmenü`): `uzo-boundary-covered` lehnt einen `ask-human`-Fall ab, dessen Stichwort ein Goal eines Ero nennt — mit `menü` als Goal-Wort der `navigado` wäre das Modelo ungültig. Entscheidung für den Maintainer (Abweichung 2, O-29).
- **`insigno.instead.sentence` verliert `erklärung`** (behält `satz`, `hinweis`; en unverändert): der Test des Briefings „Link zur Datenschutzerklärung“ → `ligilo` traf über das Suffix (`erklärung`, ≥ 6 Buchstaben, D-06 von Spec 007) auf „Datenschutzerklärung“ und antwortete `avizo`. Ein Suffix-Treffer auf ein Kompositum ist hier ein falscher Freund (Abweichung 3, O-30).
Ohne beides wäre G1 nicht erfüllbar, ohne eine Grenze zu schwächen (Regel 0.4): die Checks bleiben, die Daten geben nach.

#### D-02 G2: Gleichstand zweier Goals → ask-human (bitgleich sonst)

`suggest-ero.ts`: die **Stärke** eines Goal-Treffers ist die Zahl der **verschiedenen** Stichwörter der Goals eines Ero, die der Text trifft (dasselbe Wort in zwei Sprachen zählt einmal: „tabs“ en/de). Die erste Ero in Namensordnung antwortet weiter, wenn ihre Stärke anders ist als die jeder anderen getroffenen Ero — so bleibt jede Antwort, die stand, bitgleich. Trifft eine **weitere** Ero gleich stark, antwortet `suggest_ero` mit `action: ask-human`, `suggestion: null`, `matched: null` und `candidates`: eine getroffene Grenze voran (wie bisher, OP-12), dann die Goal-Kandidaten in Ero-Reihenfolge, je mit `ero`, `goal`, `props`, `keyword`, `kialo` und `regulo`. Ein eigener `instead`-Eintrag, der das Goal der ersten Ero umlenkt (Spec 011 ② D-10), bleibt kein Gleichstand und geht seinen Weg. Das Ausgabeschema brauchte keine Erweiterung: `candidates` mit `kind: goal` und optionaler `kialo` gab es seit OP-12. Folgen: „Tabs, um zwischen Liste und Formular zu wechseln“ → ask-human (`elektilo.choose-many` über „liste“, `langetaro.switch-view` über „tabs“, davor die Grenze `elekto.choose-many` → `elektilo`); „Übersicht speichern“ nennt neben der Grenze des `butono` und seinem Goal `confirm` jetzt auch `ligilo.navigate` (Abweichung 4: der bestehende Test erwartete zwei Kandidaten).

#### D-03 G3: `goal-keyword-shared` im `check:regularo`

`checks/regularo/index.ts` liest die Skemoj der Eroj (wie `eroIdsIn`) und sammelt je `<lingvo>:<stichwort>` (NFC, klein) die Fundstellen (`data/eroj/<ero>/skemo.json#/skemo/goals/<i>/keywords/<lingvo>/<j>`); steht ein Wort in den Goals **zweier Eroj**, ist das eine **Warnung** `goal-keyword-shared` mit allen Fundstellen und dem Hinweis, wer antwortet (die erste Ero in Namensordnung, oder eine Person bei Gleichstand). Ausnahme: ein Jugxo, dessen `context` `goal-keyword-shared <lingvo>:<wort>` nennt. Der Check entfernt nichts. `RULE_IDS` += `goal-keyword-shared` (154). **Bestand heute: keine Doppelung** zwischen Goals (gemessen auf `main` und nach G1). Zur Information, nicht Gegenstand des Checks: Wörter, die ein Goal eines Ero und eine Uzo-Grenze oder -Alternative eines anderen Ero teilen — „tabelle“ (`tabelo` Goal, `atributlisto` instead → `tabelo`, stimmig), „liste“ (`elektilo` Goal, `tabelo` Text-Regel), „übersicht“ (`ligilo` Goal, `butono` Grenze → `ligilo`, stimmig), „pages“ (`tabelo` Grenze, `langetaro` instead → `navigado`); sie gehen den Weg von Spec 008 D-08 (Grenze → use-instead = Goal: das Goal antwortet) oder enden als Konflikt (`ask-human`).

#### D-04 G4: Grenzen im `brief` ohne Kialo

`gvidanto/eroj.ts`: `brief.boundary` = `{ case, action, ero? }`; der Typ `GetEroBrief.boundary` ohne `kialo`; `instead` behält seine Kialo. MCP: `schema/tools/get_ero.output.json` (Zweig des `brief`: `boundary.items` ohne `kialo`, `required: ["case", "action"]`, Beschreibung) und `get_ero.input.json` (`brief` nennt: Grenzen ohne Kialo, `get_ero` ohne `brief` liefert sie). Die in Spec 010/011 gekürzten Kialos bleiben gekürzt (O-12-Muster, nichts zurückgedreht).

**`get_ero … brief:true`, `ceil(Bytes/3)`, vorher → nachher (Grenze 750):**

| Ero | vorher | nachher |
|---|---|---|
| atributlisto | 254 | 202 |
| avizo | 411 | 309 |
| butono | **748** | **546** |
| dialogo | 404 | 286 |
| elektilo | 512 | 351 |
| elekto | 477 | 375 |
| insigno | 497 | 376 |
| kampo | **743** | **447** |
| langetaro | 499 | 271 |
| ligilo | 493 | 275 |
| markobutono | 462 | 307 |
| mezurilo | 318 | 238 |
| navigado | 539 | 342 |
| plenstato | 287 | 237 |
| sxaltilo | 310 | 218 |
| tabelo | 654 | 340 |
| tekstareo | 422 | 224 |

### Abweichungen vom Briefing

1. **„main menu“ ist kein Stichwort** (D-01): zwei Wörter treffen nie; `hauptmenü` und `menu` stehen dafür.
2. **`tabelo.row-actions-menu` ohne `menu`/`menü`** (D-01): Folge des Checks `uzo-boundary-covered`.
3. **`insigno.sentence` ohne `erklärung`** (D-01): Folge des Suffix-Treffers auf „Datenschutzerklärung“.
4. **„Übersicht speichern“ nennt drei Kandidaten** (D-02): die Grenze des `butono`, sein Goal `confirm` und `ligilo.navigate` (Gleichstand); der Test von Spec 008 ist angepasst, die Reihenfolge (Grenze, dann `butono` zuerst) bleibt.
5. **Zusätzlich:** Testphrase „ein Hamburger-Menü für schmale Bildschirme“ (⑤) → „ein Hamburger für schmale Bildschirme“: „Menü“ ist jetzt das eigene Goal-Wort der `navigado` neben ihrer eigenen Grenze `collapsed-mobile` — ein Konflikt, den eine Person entscheidet (Spec 011 ② D-10), kein Fall für die Grenze allein.

### Befunde / Mankoj

- **B-1 Suffix-Treffer auf Komposita** (D-01): `erklärung` traf „Datenschutzerklärung“, `menü` trifft „Hamburger-Menü“ — die Regel ≥ 6 Buchstaben (Spec 007 D-06, N-1) ist für Kopfnomen gedacht („Projektübersicht“), fängt aber jedes Kompositum. Kandidat: Suffix-Treffer nur für Uzo-Stichwörter, die als Kopfnomen gemeint sind (eine Markierung im Datum), oder eine Mindestlänge des Rests.
- **B-2 Goal-Wörter gegen Uzo-Wörter** (D-03): der Check sieht nur Goals; die Überschneidungen zwischen Goal und Grenze/Alternative (oben) bleiben ungeprüft. Kandidat: dieselbe Warnung über alle Stichwort-Listen, mit Ausnahme der Paare, die Spec 008 D-08 stimmig macht (Grenze → use-instead = Goal).
- **Mankoj:** keine.

### Offen (für den Maintainer)

- **O-29** `tabelo.row-actions-menu` ohne `menu`/`menü` (Abweichung 2) — bestätigen; Alternative: `menü` bleibt beim `tabelo`, dann ist es kein Goal-Wort der `navigado` (gegen G1).
- **O-30** `insigno.sentence` ohne `erklärung` (Abweichung 3) — bestätigen; Alternative: der Test „Link zur Datenschutzerklärung“ ändert seine Phrase.
- **O-31** Die Grenze voran unter den Kandidaten eines Gleichstands (D-02) — bestätigen.

### Messungen

In [`tasks.md`](tasks.md) ①.

## ② Werkzeuge

Folgt in PR ②.
