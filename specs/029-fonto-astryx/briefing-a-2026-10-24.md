# Spec 029 – Briefing Sitzung A – Entscheidungen vom 24.10.

**Erstellt:** 2026-10-24 · **Gilt für:** #110 (②a), #111 (①), danach ②b und ③ · **Zielpfad:** `specs/029-fonto-astryx/briefing-a-2026-10-24.md`

**Entscheidung des Maintainers (24.10., 10:37): „alles wie empfohlen“.**

## ②a – Abgleichstabelle (#110)
| # | Frage | Entscheidung |
|---|---|---|
| ②a-1 | Wie entscheiden? | **Der Vorschlag jeder Zeile gilt als Entscheidung.** P0 trägt ihn in `entscheidung` ein, außer bei den folgenden Punkten. |
| ②a-2 | `large` bei elekto, markobutono, sxaltilo | **Ein Release lang als Alias auf `medium`, als veraltet markiert** (Warnung im Gvidanto und in der Konsole), danach entfernen. |
| ②a-3 | die acht Grenzen | **wie in den Zeilen vorgeschlagen.** Syntax-Hervorhebung kommt mit den Syntaxfarben in ②b. |
| ②a-4 | Fortschritt als eigenes Ero | **ja, in Eroj-Runde 6** |
| ②a-5 | Grenze Skeleton | **bleibt, neu entschieden in Eroj-Runde 6** |
| ②a-6 | Namen der neuen Achsen | **angenommen, außer `rules` → `lines`** (Verwechslung mit Reguloj) |

## ① – Grundlagen (#111)
| # | Frage | Entscheidung |
|---|---|---|
| ①-1 | Flächen reinweiß? | **nein, das Aspiro `oklch-l-extreme` bleibt** |
| ①-2 | Syntaxfarben | **in ②b, mit dem kodbloko** |
| ①-3 | Agordilo auf die neue komuna | **nach ②b**, als eigener Schritt; **die Leitfarbe einer Marke geht in die Aktionen**, wie bisher |
| ①-4 | zwei Rampen je Familie | **ja, später**, im Querschnitt Q |
| ①-5 | Ränder und APCA | **nein**, es bleibt bei WCAG 3:1 mit Reserve |
| ①-6 | Prata nur 400 | **Überschriften von provo auf 400**, nicht künstlich fett. Noch in #111. |
| ①-7 | Ersatzschrift nach Kategorie | **ja**: Der Agordilo nimmt den Ersatz aus der Kategorie der Schrift (`tiparoj.json`). In ②b. |

## Reihenfolge
1. **#111:** ①-6 nachziehen. Danach wartet #111 auf die Abnahme durch den Maintainer (Vitrino, Figma). Gemergt wird erst danach.
2. **#110:** Entscheidungen eintragen, nach dem Merge von #111 auf `main` neu aufsetzen und mergen lassen.
3. **Nach dem Merge von #111:** Lauf der Nordstern-Kennzahl mit gpt-4.1-mini anstoßen (Messpunkt 3 aus Nachlese 11, Sitzung B), falls Sitzung B ihn nicht selbst startet.
4. **②b**, gestapelt auf ① bzw. `main` nach dem Merge: die beschlossenen Zeilen, ①-2, ①-7, `large` als Alias. Die Vitrino-Befunde aus Spec 025 werden gelöst oder einzeln als offen gemeldet; signeto und insigno werden in der Form unterscheidbar.
5. **③** gestapelt auf ②b.

**Zur Kenntnis:** Die Vitrino mit allen Marken ist 14,9 MB groß. Das ist ein Punkt für 8b (Daten aufteilen, nachladen, Größenbudget), nicht für diese Spec.

Keine Budgets anheben. Rote Tests zuerst. Bericht je PR im bekannten Format.
