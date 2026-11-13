# Spec 050 – MVP-Probelauf messen (Stand nach Spec 046 und 049)

**Status:** Entwurf zur Freigabe · **Erstellt:** 2026-11-12 · **Basis:** `main` nach dem Merge von PR #163 (Spec 049, `de931e40`), mit Spec 046 (PR #159, #160) · **Zielpfad im Repo:** `specs/050-mvp-probelauf/{spec,plan,tasks,bericht}.md`, Messdaten unter `specs/050-mvp-probelauf/daten/`

> Nummer: 050, wenn sie beim Anlegen frei ist. Ist sie durch eine parallele Spec vergeben, wird die nächste freie Nummer genommen und hier nachgetragen.

**Regel 0** gilt. **Keine Budgets, Grenzen, Schwellen, Zeitlimits oder Toleranzen anheben.** Kein Code ändern. **Nichts mergen.** Keine Schlüssel in Logs, Berichten oder Commits. Nur die Marken des Repos. Das Wort aus R-12 von Spec 035 und der Name des privaten Schriften-Repos stehen in keiner neuen Zeile. Es gelten `standards/global/delivery.md` und `testing.md`. **Kein bezahlter Lauf vor der Freigabe dieser Spec.**

## Overview

Glied 3 der Kette heißt: Dasselbe LLM codet mit den Eroj ein MVP. Die Zielkennzahl dafür lautet **„Grüne Screens im MVP-Probelauf (Nordstelo-Abnahme)“**. Bisher gibt es nur Teilmessungen:

- Spec 038 Lauf 4 (Ablauf nachher): **0 grüne Screens** in allen gebauten Abläufen.
- Spec 038 Lauf 5, Abnahme komuna (2 Screens, freier Satz): ministral 1/2 und 0/2. Der Kontrolllauf mit Sonnet 5.5 war **2/2 grün nach Runde 2**.
- Die Lückenliste L5-1 bis L5-4 (Fundamento-Ursachen) ist mit Spec 046 geschlossen. Spec 049 hat komuna für alle 75 Entscheidungen begründet.

Spec 050 misst den Stand nach 046 und 049 **einmal ehrlich**:

- Ablauf `anmelden-und-konto` aus dem Katalog (4 Screens), Marke komuna, Varianten F (Gvidanto über MCP) und 0.
- Modell Claude Sonnet 5.5. ministral läuft als Vergleich mit.
- Ein eigener F-Lauf mit der Marke ekzemplo dient als Kontrolle des Markenwechsels.

Das Ergebnis ist die Zahl grüner Screens und je Screen die übrigen Befunde, getrennt nach **Modell-Ursache** und **Fundamento-Ursache**.

## Problem Statement

- Die Zielkennzahl hat noch keinen belastbaren Wert. Lauf 5 hat nur 2 Screens aus einem freien Satz gemessen, ohne Ablauf aus dem Katalog, ohne K6 und ohne Variante 0 mit Sonnet.
- Ob 046 (L5-1 Standard-Slot, L5-2 `one-primary-per-container`, L5-3 Vorschlag von `uzo-slot-accepts`, L5-4 Kurzprofil `butono`) die Fundamento-Ursachen beseitigt hat, ist nicht gemessen. Sonnet hat die auslösenden Muster in Lauf 5 nicht geschrieben (F-S038-40b-2), ministral schon.
- Ob ein grüner Screen nach einem Markenwechsel grün bleibt, ist offen. Bisher gibt es für andere Marken nur K8, kein „grün“.

## Entscheidungen des Maintainers (2026-11-12)

| Frage | Entscheidung | Folge |
|---|---|---|
| Welcher Ablauf mit 5 Screens? | **Keiner der fünf Abläufe hat 5 Screens.** `anmelden-und-konto` und `formular-in-schritten` haben je 4, die übrigen je 3 (`packages/nordstelo/src/ablauf/katalogo.ts`). Gemessen wird **`anmelden-und-konto`**, Ergebnis **X von 4**. | Kein Eingriff in den Katalog. Vergleich mit Bezug (2/4, Runde 1) und Lauf 4 (0/4). Die Zielkennzahl wird als „von 4“ geführt, nicht hochgerechnet. |
| Modell | **Claude Sonnet 5.5** (`openrouter/anthropic/claude-sonnet-5.5`) wie im Kontrolllauf. **ministral-14b-2512 als Vergleich: ja**, F und 0, je ein Lauf. | Mit ministral lässt sich prüfen, ob die Fundamento-Ursachen aus Lauf 5 noch auftreten. |
| Budget | **Harte Kappe 8,00 $**, aufgeteilt auf Scheiben (siehe [Budget](#budget)). ekzemplo bekommt einen **eigenen F-Lauf**. | Für komuna und ekzemplo gibt es je ein Ergebnis „grün“. |
| Was heißt „grün“? | **`decidiVerdon` unverändert** (`packages/ekranoj/src/verda.ts`), einschließlich K8. Die Seitenregel `k8-interspaco` zählt nicht (D-29) und wird getrennt berichtet. | Das Ergebnis bleibt mit Lauf 5 und dem Kontrolllauf vergleichbar. |

## Definition „grün“ je Screen

Ein Screen ist grün, wenn `decidiVerdon` für die **letzte gebaute Runde** `verda: true` liefert. Die Bedingungen:

| Bedingung | Variante F | Variante 0 |
|---|---|---|
| K1 = 1 (Seite rendert, nicht leer) | ja | ja |
| kein `check_usage`-Verstoß mit Schweregrad `error` | ja | entfällt (D-07) |
| axe ohne Befund **hell und dunkel**; fehlt ein Render, gilt das als rot (`axe-nekontrolita`) | ja | ja |
| K5 = 1 | ja | ja |
| Navigation `kompleta` (keine toten Verweise, keine fehlenden geplanten Kanten) | ja | ja |
| `k8.plena`, wenn der Scorer K8 liefert, so gelesen wie geliefert, nicht neu berechnet (D-145) | ja | ja |

- K2 bis K4 und K6 gehen nicht in „grün“ ein. Sie werden je Screen trotzdem berichtet.
- Hinweise (`warning`, `info`) halten einen Screen nicht vom Grün ab. Sie werden als `sugestoj` berichtet.
- Ein Screen, der nicht gebaut wurde (Tokengrenze, Anbieterfehler, Abbruch), ist **nicht grün** und wird als „nicht gebaut“ geführt, nicht als rot.
- Ein Screen, der in einer früheren Runde grün war und dann übernommen wurde, zählt als grün, mit Angabe der Runde (wie in Lauf 5).
- Die Bewertung ist **deterministisch**: nur `decidiVerdon` und die gespeicherten Fakten des Laufs. Es wird nichts nachträglich mit anderen Regeln bewertet und nichts „wohlwollend gelesen“.

## User Stories

- **Als Maintainer** will ich eine Zahl „grüne Screens von 4“ für Sonnet in komuna. Dann weiß ich, ob Glied 3 der Kette trägt.
- **Als Maintainer** will ich je übrigem Befund wissen, ob ihn das Modell oder Fundamento verursacht. Dann weiß ich, ob die nächste Runde Daten und Regeln braucht oder ob die Lösung ein anderes Modell ist.
- **Als Maintainer** will ich sehen, ob die Fixes aus Spec 046 (L5-1 bis L5-3) im Lauf wirken. Dafür muss ministral die auslösenden Muster tatsächlich schreiben.
- **Als Maintainer** will ich sehen, ob dieselbe Aufgabe mit der Marke ekzemplo genauso grün wird. Das ist der erste Beleg dafür, dass der Markenwechsel weich ist.
- **Als Reviewer** will ich einen PR, der nur Doku und Messdaten enthält. Jeder Wert muss bis zu einer Datei unter `daten/` zurückverfolgbar sein.

## Messplan

### Zellen

| # | Lauf-ID | Werkzeug | Marke | Modell | Varianten | Scheibe |
|---|---|---|---|---|---|---|
| M-1 | `probe-sonnet-komuna` | `pnpm nordstelo --art ablauf --taskoj anmelden-und-konto` | komuna | Sonnet 5.5 | F, 0 | `probe-` |
| M-2 | `vergleich-ministral-komuna` | `pnpm nordstelo --art ablauf --taskoj anmelden-und-konto` | komuna | ministral-14b-2512 | F, 0 | `vergleich-` |
| M-3 | `marke-sonnet-ekzemplo` | `pnpm fm ekranoj` mit `--config` des ekzemplo-Aspekto und `--ekranoj anmelden,registrieren,passwort-vergessen,konto` | ekzemplo | Sonnet 5.5 | F | `marke-` |

- Die Reihenfolge ist fest: M-1, dann M-2, dann M-3. Die Läufe laufen **einer nach dem anderen**, ohne Test, Build oder Playwright daneben. Sperre und Wächter laufen wie in Spec 038 Lauf 5.
- Höchstens **3 Runden** je Screen, wie bisher. `--ripetoj 1`.
- **Ein Lauf je Zelle.** Ein schlechtes Ergebnis ist kein Grund für einen zweiten Lauf. Wiederholt wird nur ein **gestörter** Lauf (siehe [Edge Cases](#edge-cases-und-fehlerzustände)), und nur aus der Scheibe `wdh-`.
- **Warum M-3 einen anderen Weg nimmt:** Der Ablauf-Modus von nordstelo speichert „grün“ nur für komuna (`ABLAUF_MARKO = "komuna"` in `packages/nordstelo/src/ablauf/kuro.ts`, D-S038-27-8) und kennt keine Wahl der Marke. Ohne Codeänderung geht ekzemplo daher nur über `fm ekranoj --config`. Dort plant das Modell selbst (Satz = `celo` des Ablaufs, Slugs fest über `--ekranoj`). Es gibt keine K6-Kriterien aus dem Katalog und keine Variante 0. Der Bericht nennt diesen Unterschied ausdrücklich als Grenze des Vergleichs.
- **Zusätzlich ohne Kosten:** K8 je Marke (komuna, ekzemplo, provo, provo-kompakta) aus M-1 und M-2, so wie nordstelo ihn liefert.

### Zielkennzahl

**Grüne Screens im MVP-Probelauf = grüne Screens von M-1, Variante F, komuna: X von 4.** Alle anderen Zahlen sind Kontext: 0 gegen F, ministral gegen Sonnet, ekzemplo gegen komuna.

## Budget

Grundlage ist der Kontrolllauf `kontrolle-komuna` (Lauf 5): 3 Screen-Runden, 304 170 Tokens ein und 7 901 aus, gebucht 0,687350 $. Das sind ≈ 0,23 $ je Screen-Runde. Weil die Screens aus dem Katalog größer sind (ministral im Ablauf ≈ 80 000 statt ≈ 55 000 Tokens je Screen-Runde), wird **0,30 $ je Screen-Runde** angesetzt.

| Scheibe | Zelle | Rechnung höchstens | erwartet | Basis (hart) |
|---|---|---|---|---|
| `probe-` | M-1 F | 4 Screens × 3 Runden × 0,30 $ = 3,60 $ | ≈ 2,10 $ | |
| `probe-` | M-1 0 | 12 × ≈ 0,03 $ = 0,36 $ | ≈ 0,25 $ | **4,00 $** |
| `vergleich-` | M-2 F + 0 | 12 × 80 000 + 12 × 5 000 Tokens × 0,20 $/10⁶ ≈ 0,20 $ | ≈ 0,15 $ | **0,25 $** |
| `marke-` | M-3 F | 4 × 3 × 0,30 $ = 3,60 $ (+ Plan) | ≈ 2,10 $ | **3,60 $** |
| `wdh-` | ein gestörter Lauf von M-2, oder Teilrest | – | 0 | **0,15 $** |
| **Summe** | | | **≈ 4,60 $** | **8,00 $** |

- **Gebucht wird aus Tokens × Listenpreis** (D-S038-31-2, vorsichtig), auch wenn OpenRouter weniger abrechnet (in Lauf 5 nur ≈ 53 %, F-S038-40b-1). Die OpenRouter-Gegenprobe (`GET /api/v1/key`, nur lesend) wird je Lauf als Δ berichtet und nicht umgebucht.
- `--max-tokens` je Lauf wird aus der Scheibe berechnet und **abgerundet**, nie angehoben (Formeln in der [technischen Spec](./technical-spec.md#3-grenzen-je-lauf)).
- Eine Umbuchung zwischen Scheiben gibt es nicht. Ein gestörter Sonnet-Lauf lässt sich aus `wdh-` nicht wiederholen. Er wird als gestört berichtet.

## Ergebnis (Inhalt von `bericht.md`)

1. **Zielkennzahl:** M-1 F komuna X/4, mit der Runde, in der jeder Screen grün wurde.
2. **Tabelle „Grün je Screen“** je Zelle und Variante: Runde, K1 bis K6, K8 (Wert und `plena`), Total, axe hell/dunkel, Navigation, Zahl der `check_usage`-Fehler, `malhelpoj` aus `decidiVerdon`, grün ja/nein.
3. **Tabelle „Verbleibende Befunde je Screen“** (letzte Runde, je Regel aus `restantaj` und `malhelpoj`). Spalten: Screen, Zelle, Regel, Anzahl, Beispiel (Element und Text), **Ursache** (Modell / Fundamento / unklar), **Beleg**.
4. **Wirkung von 046:** für L5-1, L5-2 und L5-3 je eine Zeile. Wurde das auslösende Muster geschrieben (ja/nein, in welcher Zelle)? Wurde es bemängelt (ja/nein)? Urteil: wirkt / nicht ausgelöst / wirkt nicht. L5-4 wird nur offline (Länge des Kurzprofils) geprüft und mit seinem Messweg genannt.
5. **Markenwechsel:** M-3 gegen M-1 F je Screen (grün ja/nein), K8 je Marke aus M-1. Dazu der Hinweis auf den anderen Weg von M-3 (Plan vom Modell, kein K6).
6. **Vergleich:** Bezug 2/4 (Runde 1), Lauf 4 0/4, M-1, M-2. Dazu F gegen 0 (Total) und Aufwand je Screen-Runde (Tokens ein/aus, Anfragen, Werkzeugaufrufe, Dauer).
7. **Kosten:** je Lauf Tokens, gebuchter Betrag, Δ laut OpenRouter, Stand der Scheiben.
8. **Seitenregel `k8-interspaco`** (zählt nicht): je Screen ja/nein, getrennt aufgeführt.
9. **CI:** je Job grün/rot. `zweitfarbe-036`, `buehne-036` und `modelo turbo-inputs` werden als **bekannt rot, fremd** markiert.

### Regel für die Ursache (Modell oder Fundamento)

Die Regel ist dieselbe wie in Spec 038 S038-42, „Modell oder Fundamento“:

- **Fundamento:** Es gibt eine benannte Ursache in Fundamento, zum Beispiel eine Regel, die falsch anschlägt, eine Abweichung zwischen Gvidanto und Eroj, eine fehlende Ero oder ein fehlendes Mittel, ein falscher Vorschlag oder ein Daten-Text. Der Beleg nennt Datei, Regel-ID oder Befund-ID. Das gilt auch dann, wenn das Modell das auslösende Muster geschrieben hat.
- **Modell:** Keine bekannte Fundamento-Ursache, und der Befund folgt aus der Ausgabe des Modells, zum Beispiel ein erfundenes Attribut, ein toter Verweis auf einen nicht geplanten Screen, die falsche Ero für den Zweck oder eine Rundenschleife, die nicht konvergiert. Hilfreich als Beleg: Das andere Modell schreibt dasselbe Muster ohne Befund.
- **unklar:** Keiner der beiden Belege lässt sich führen. Die Einordnung wird **nicht erzwungen**. Jeder Befund mit „unklar“ wird als offene Frage in den Bericht übernommen.
- Jeder Befund mit Ursache „Fundamento“ bekommt eine Zeile in einer neuen Lückenliste **L50-n**, mit Vorschlag für die nächste Spec. Gebaut wird hier nichts.

## Acceptance Criteria

- **AK-1 Freigabe:** Kein bezahlter Lauf startet, bevor diese Spec freigegeben ist. Vor M-1 sind die Modell-IDs und Preise geprüft: öffentliche Liste von OpenRouter, ohne Schlüssel, mit Zeitstempel im Plan.
- **AK-2 Code-Stand:** Gemessen wird auf einem festgehaltenen Commit von `main` nach #163. `pnpm build` ist erfolgreich, `git status --porcelain` ist leer, und `git diff <messkopf>..HEAD -- packages` ist zum Zeitpunkt jedes Laufs leer.
- **AK-3 Läufe:** M-1, M-2 und M-3 liefen je genau einmal (plus höchstens ein Ersatz aus `wdh-` für einen gestörten Lauf). Jeder Lauf ist mit Befehl, Commit, `--max-tokens`, Exit, Dauer, Tokens, Anfragen, Werkzeugaufrufen, Betrag, Last vorher und nachher, 429-Wartezeilen und dem Vermerk gestört ja/nein in `daten/laeufe.tsv` und `daten/kostoj.tsv` belegt.
- **AK-4 Grenzen:** Kein `--max-tokens` liegt über dem aus der Scheibe berechneten Wert. Die Summe der Buchungen liegt ≤ 8,00 $, und jede Scheibe liegt ≤ ihrer Basis. Keine Grenze, Schwelle, Rundenzahl oder Toleranz wurde verändert.
- **AK-5 Grün:** Jede Grün-Angabe im Bericht stammt aus `decidiVerdon` über die gespeicherten Fakten des Laufs. Ein Prüfskript oder ein Test liest `daten/` erneut ein und kommt zu denselben Zahlen (Gegenprobe ohne Netz und ohne Modell).
- **AK-6 Befunde:** Zu jedem nicht grünen Screen gibt es mindestens eine Zeile mit `malhelpoj` oder `restantaj`. Jede Zeile hat eine Ursache (Modell / Fundamento / unklar) und einen Beleg.
- **AK-7 Wirkung 046:** Für L5-1, L5-2 und L5-3 hat der Bericht je ein Urteil: wirkt / nicht ausgelöst / wirkt nicht. Das Urteil stützt sich auf die Fragmente in `daten/`.
- **AK-8 Markenwechsel:** M-3 hat je Screen ein Ergebnis grün ja/nein oder „nicht gebaut“, und der Bericht nennt die Grenze des Vergleichs (anderer Weg).
- **AK-9 Keine Schlüssel:** Vor dem Commit sucht ein Scan über `specs/050-*/**` und die verwendeten Logs nach Schlüsselmustern (`sk-`, `OPENROUTER_API_KEY=`, `MISTRAL_API_KEY=`, Bearer-Kopfzeilen) und findet nichts. Vom Schlüssel wird nur die Länge geprüft.
- **AK-10 PR:** Es gibt genau **einen** PR von `main`. Er ändert nur `specs/050-*/**` und enthält kein `packages/**`, keine Root-Dateien und kein `.github/**`. Es gibt einen Push, die CI wird je Job ausgewertet, und nichts wird gemergt.

## User Flow

1. Der Maintainer gibt diese Spec frei (Go).
2. Vorbereitung ohne Kosten: Messkopf festhalten, Build, Modell-IDs und Preise prüfen, Scheiben im Ledger reservieren, `--max-tokens` je Lauf berechnen und im Plan eintragen.
3. M-1 läuft (Sonnet, komuna, F und 0) und wird ausgewertet. Grün je Screen wird sofort in `plan.md` eingetragen.
4. M-2 läuft (ministral, komuna, F und 0) und wird ausgewertet.
5. M-3 läuft (Sonnet, ekzemplo, F) und wird ausgewertet.
6. Auswertung ohne Kosten: Gegenprobe von „grün“ aus `daten/`, Tabelle der Befunde mit Ursachen, Wirkung von 046, Lückenliste L50-n, Schlüssel-Scan.
7. Ein Commit, ein Push, ein PR. CI je Job auswerten, Bericht nachtragen. Nichts mergen.

## Scope

### Enthalten
- Drei bezahlte Läufe (M-1 bis M-3) nach dem Messplan, dazu höchstens ein Ersatzlauf aus `wdh-`.
- Auswertung, Bericht, Lückenliste L50-n und Messdaten im Repo.
- Ein PR nur mit Doku und Messdaten.

### Nicht enthalten
- Jede Codeänderung, auch an Katalog, Scorer, `decidiVerdon`, Gvidanto, Eroj, Prompts, `ABLAUF_MARKO` und den CLI-Flags.
- Ein fünfter Screen im Katalog (Entscheidung: X von 4).
- Die anderen vier Abläufe, weitere Marken als komuna und ekzemplo, weitere Modelle oder Ersatzmodelle.
- Ein zweiter Versuch wegen eines schlechten Ergebnisses.
- Fixes für Befunde. Sie gehen als L50-n in eine spätere Spec.
- Das Reparieren der bekannten roten Checks `zweitfarbe-036`, `buehne-036` und `modelo turbo-inputs`. Dafür gibt es die parallele Spec „Wacklige Browser-Tests“.

## Edge Cases und Fehlerzustände

| Fall | Verhalten |
|---|---|
| Modell-ID fehlt bei OpenRouter oder der Preis hat sich geändert | Vor M-1 stoppen und den Maintainer fragen. Weder Ersatzmodell noch höhere Kappe. Ein niedrigerer Preis senkt nur die Schätzung, nicht die Scheiben. |
| `--max-tokens` reicht laut CLI-Schätzung nicht für 3 Runden | Trotzdem starten, wenn die Scheibe es zulässt. Die Schätzkonstanten sind auf ministral gemessen (F-S038-40b-3). Was nicht gebaut wird, ist „nicht gebaut“. Die Grenze wird nicht angehoben. |
| Lauf hält an der Tokengrenze | Teilergebnis werten: gebaute Screens normal, die übrigen „nicht gebaut“. Kein Nachlauf. |
| Anbieterfehler, 429-Abbruch, Last > Kerne während des Laufs | Der Lauf gilt als **gestört**. M-2 einmal aus `wdh-` wiederholen, wenn die Scheibe reicht. Gestörte Sonnet-Läufe werden als gestört berichtet und nicht wiederholt. Die Zielkennzahl bleibt dann offen, und der Maintainer entscheidet. |
| 429-Wartezeilen ohne Abbruch (ministral) | Nicht gestört. Zahl und Wartezeit werden berichtet (wie in Lauf 5). |
| Leere Seite (K1 ≠ 1, `malplenajPagxoj`) | Rot, mit Ursache. Kein Ersatzlauf. |
| `fm ekranoj` plant in M-3 andere Kanten oder nicht geplante Screens | Wird normal gewertet (Navigation). Im Bericht steht es als Unterschied des Weges, nicht als Befund gegen die Marke. |
| ekzemplo-Config ist nur ein Test-Fixture (`packages/modelo/test/fixtures/valid/aspekto-ekzemplo`) | Wird so verwendet und benannt. Fehlt etwas für einen echten Lauf: stoppen, als Befund L50-n eintragen, M-3 „nicht gelaufen“. Kein Code. |
| Ein Fix aus 046 wird nicht ausgelöst (Muster nicht geschrieben) | Urteil „nicht ausgelöst“, nicht „wirkt“. |
| Ein Befund passt weder zu Modell noch zu Fundamento | „unklar“ und offene Frage, nicht erzwingen. |
| CI rot in anderen als den drei bekannten Jobs | Log lesen und die Ursache im Bericht festhalten. Da der PR nur Doku enthält, sollte er keinen neuen roten Job auslösen. Kein zweiter Push zur Reparatur außerhalb von `specs/050-*`. |
| Schlüssel taucht in einem Log auf | Das Log kommt nicht ins Repo. Die Fundstelle wird im Bericht ohne den Wert genannt, und der Maintainer wird informiert. |

## Offene Punkte

- **Modellflag in nordstelo:** `pnpm nordstelo` kennt `--modell` und `--kontroll-modelo`. Vor M-1 wird ohne Kosten (`--help`, Quelle lesen) geklärt, welches der beiden das Baumodell im Ablauf-Modus setzt. Lässt sich Sonnet im Ablauf-Modus ohne Code nicht setzen: stoppen und den Maintainer fragen.
- **Größe der Messdaten im PR:** Geplant sind `raporto.json`, Fragmente der letzten Runde je Screen, TSV-Dateien sowie Bilder der letzten Runde hell und dunkel. Wird es zu groß (> 10 MB), kommen nur die Bilder von M-1 ins Repo, die übrigen werden lokal verlinkt.
