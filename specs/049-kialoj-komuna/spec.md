# Spec 049: Gründe für komuna (Kialoj für 75 Entscheidungen)

**Status:** Entwurf zur Freigabe · **Erstellt:** 2026-11-11 · **Basis:** aktuelles `main` nach dem Merge von PR #162 (Spec 048 NE-1b, `6374f18f`) · **Zielpfad im Repo:** `specs/049-kialoj-komuna/{spec,plan,tasks,bericht}.md`, `luecken.json`

**Regel 0** gilt. Keine Budgets, Grenzen, Schwellen, Zeitlimits oder Toleranzen anheben. **Kein neuer Kern-Token.** **Nichts mergen.** Rote Tests zuerst. Kein Sprachmodell über eine API (0 $). Nur die Marken des Repos. Das Wort aus R-12 von Spec 035 und der Name des privaten Schriften-Repos stehen in keiner neuen Zeile. Es gelten `standards/global/delivery.md` und `testing.md`.

## Overview

Die Referenzmarke `komuna` soll für jede Entscheidung einen eigenen Grund (Kialo) tragen. Nach Spec 048 bleiben in komuna **75 Entscheidungen ohne Grund** in 11 Gruppen (`specs/048-nodredaktilo-grupoj-kialoj/luecken.json`). Spec 049 schließt diese Lücken:

1. Zuerst wird die vorläufige Definition aus 048 bestätigt oder korrigiert (F-1, F-T2-1 bis F-T2-5). **Erledigt in dieser Spec-Phase**, siehe [Bestätigte Definition](#bestätigte-definition).
2. Die Gründe kommen in das Format, das es schon gibt: eine **Regulo mit `appliesTo.tokens`**, hier im Aspekto-Paket `packages/aspekto-komuna/reguloj.json` mit `aspekto: "komuna"`.
3. Die Satzvorschläge stehen je Gruppe als Tabelle in der [technischen Spec](./technical-spec.md#5-vorschläge-zur-abnahme-je-gruppe). Der Maintainer gibt sie dort frei, bevor er „Go“ drückt. Der Bau schreibt nur freigegebene Texte.
4. Danach wird gemessen: Das Skript `bilder` aus 048 läuft erneut, mit Bericht „Entscheidungen ohne Grund“ vorher und nachher je Gruppe.

Das stützt Glied 1 des Ziels: eine Marke auf hohem Niveau, deren Entscheidungen begründet und für Agenten abfragbar sind (Art. VI, Art. VII).

## Problem Statement

- Der Node-Editor zeigt in komuna bei 75 Entscheidungen „fehlt“. Ein Agent, der `explain` für `font.weight.semibold` oder `radius.role.control` fragt, bekommt für komuna keinen Grund.
- Die 048-Definition ordnet einen Teil davon fraglich ein (Befunde F-1, F-T2-1 bis F-T2-5). Ohne Klärung würde man Gründe für Dinge schreiben, die gar keine Entscheidungen sind, oder echte Lücken übersehen.
- **Neuer Befund F-049-1:** 64 der 75 Lücken sind **feste Kern-Werte** aus `packages/vortaro/sets/core.json`. komuna überschreibt sie nicht. Sie gelten im Paket-Graphen als Entscheidung, weil `grafeoDePaket` jeden festen Wert als `enigo` führt. Das ist F-1 verallgemeinert: Es betrifft alle festen Skalen, nicht nur Farbpaletten. Nur **11** sind Alias-Rollen (`color.syntax.*` 5, `radius.role.*` 5, `border.width.strong` 1). Die 5 Syntaxfarben überschreibt komuna im Dunkelmodus.

## Bestätigte Definition

Der Maintainer hat die Befunde aus 048 am 2026-11-11 so entschieden:

| Befund | Frage | Entscheidung | Folge für die komuna-Liste |
|---|---|---|---|
| **F-1 / F-T2-1 / F-049-1** | Sind feste Skalenwerte (Palette, Gewichte, Laufweite, Größen, Ebenen …) Entscheidungen? | **Ja, aber die Einheit ist die Skala oder Familie**, nicht der einzelne Wert. Eine Regulo je Skala gibt jedem Wert der Skala denselben eigenen Grund. | 64 Tokens werden zu **13 Skalen-Entscheidungen**. `knotenartDe` bleibt unverändert. |
| **Reichweite** | Kern-Grund für alle Marken oder Grund nur für komuna? | **Nur komuna** (`aspekto: "komuna"`). Die Zahlen von ekzemplo und provo bleiben exakt gleich. Ein späterer Lauf kann Gründe in den Kern heben. | Keine Änderung an Kern-Daten. |
| **F-T2-2** | provo `radius.small` (`gestalto`) ist Mechanik ohne Begründungszeile. | Nur provo. Notiz für NE-2, **keine Wirkung auf komuna**. | Keine. |
| **F-T2-3** | `border.width.strong` ist ein Alias in `form/palette`, inhaltlich eine Rolle. | **Echte Lücke.** Er bekommt einen eigenen Grund als Rolle. Die Einsortierung in der Palette bleibt ein NE-2-Befund. | 1 Rollen-Entscheidung. |
| **F-T2-4** | `color.syntax.*` zeigt „fehlt“, obwohl die Kette (Palettenstufe) einen Grund trägt. | **Echte Lücken.** Der geerbte Paletten-Grund erklärt nur die Stufe, nicht die Wahl des Farbtons. | 5 Rollen-Entscheidungen. |
| **F-T2-5** | Ein einziger Ero-Verweis macht eine Rolle zur Entscheidung (`color.syntax.keyword`). | **Bleibt so.** Ein Ero-Verweis reicht als Kriterium. Jede Syntaxfarbe bekommt einen eigenen Grund. | Wie F-T2-4. |
| **Alias-Rollen `radius.role.*`** | Erben sie nur, oder sind sie gewählt? | **Echte Lücken.** Warum Bedienelemente `medium` und Flächen `large` bekommen, ist genau die Rollen-Entscheidung aus dem Konzept. | 5 Rollen-Entscheidungen. |

### Bereinigte Liste für komuna

Alle 75 Einträge aus 048 bleiben echte Lücken. Keiner fällt aus der Definition. Sie verteilen sich auf **24 Entscheidungen** (24 neue Reguloj):

| Gruppe (048) | Tokens | Entscheidungen | Art |
|---|---:|---:|---|
| `bewegung/palette` | 5 | 2 (Dauer 0, Kurven) | Skala |
| `elevation/rollen` | 6 | 1 (Ebenen) | Skala |
| `farbe/rollen/color/syntax` | 5 | 5 | Rolle |
| `form/palette` | 4 | 2 (Randbreiten-Skala; `border.width.strong` als Rolle) | Skala + Rolle |
| `form/rollen` | 7 | 6 (5 `radius.role.*`; Strichart) | Rolle + Skala |
| `raum/palette` | 8 | 1 (Größen) | Skala |
| `raum/rollen` | 9 | 3 (Spalten, Umbrüche, Container) | Skala |
| `schrift/palette/family` | 3 | 1 | Skala |
| `schrift/palette/lineheight` | 6 | 1 | Skala |
| `schrift/palette/tracking` | 13 | 1 | Skala |
| `schrift/palette/weight` | 9 | 1 | Skala |
| **Summe** | **75** | **24** (13 Skalen, 11 Rollen) | |

**Freigegebener Zielstand:** komuna **0** Entscheidungen ohne Grund (vorher 75). ekzemplo **156** und provo **160** bleiben unverändert.

## User Stories

- **US-1 (Maintainer):** Als Maintainer will ich je Gruppe einen Satzvorschlag mit Belegen sehen (Token, Wert, Eroj, berührende Reguloj, Jugxoj, Aspiroj) und ihn freigeben, ändern oder verwerfen, bevor etwas in die Daten geht.
- **US-2 (Agent):** Als Agent will ich mit `explain` für einen komuna-Token (z. B. `font.weight.semibold`, Assignment `aspekto=komuna`) den Grund der Wahl als Regulo mit Kialo bekommen.
- **US-3 (Brandmanager im Node-Editor):** Als Brandmanager will ich in komuna bei keiner Entscheidung mehr „fehlt“ sehen, sondern den Grund. Bei Übernahmen will ich den geerbten Grund mit Verweis auf die Quelle sehen.
- **US-4 (Maintainer):** Als Maintainer will ich messen, wie die Zahl „Entscheidungen ohne Grund“ je Gruppe von vorher nach nachher fällt, und sicher sein, dass ekzemplo und provo unverändert bleiben.

## Acceptance Criteria

### Definition und Freigabe
- **AC-1** Die bestätigte Definition steht in `specs/049-kialoj-komuna/spec.md` (Tabelle oben). Für komuna ist kein Eintrag der 75 aus der Liste gefallen.
- **AC-2** Jede der 24 Reguloj hat einen vom Maintainer **freigegebenen** Wortlaut (Name, Statement, Kialo, Tokens) aus der technischen Spec, Abschnitt 5. Nicht freigegebene oder verworfene Einträge werden **nicht** geschrieben. Ihre Tokens bleiben „fehlt“ und werden im Bericht genannt.

### Daten
- **AC-3** Die Gründe liegen ausschließlich in `packages/aspekto-komuna/reguloj.json` (neue Datei, Schema `RegulojFile`). Jede Regulo hat `aspekto: "komuna"`, `checkability: "manual"`, `appliesTo.tokens` und einen deutschen `kialo`. Jede Id steht in `packages/aspekto-komuna/ids.lock.json` und wurde mit `pnpm id:new regulo` vergeben.
- **AC-4** Jede neue Regulo steht einzeln mit Grund in `NOT_CHECKABLE` in `packages/modelo/src/data/regularo-repo.test.ts` (D-19-Wächter). Das ist die einzige Änderung an einem bestehenden Test, sie wird im PR-Text gelistet.
- **AC-5** Kein neuer Kern-Token. Keine Änderung an `packages/vortaro/**`, `packages/modelo/data/**`, an den Sets, `deveno.json`, `jugxoj.json` und `aspekto.json` von komuna, an `aspekto-komuna-0-2` sowie an ekzemplo- und provo-Daten oder -Fixtures.

### Tests (rot zuerst, dann grün)
- **AC-6** Im komuna-Paket-Graphen zeigt **keine** Entscheidung mehr `begruendungDe(...).montro === "fehlt"`. Genauer: so viele, wie nach AC-2 nicht freigegeben wurden. Jeder der 75 Tokens aus `specs/048-…/luecken.json` (komuna) hat `kialoDe(...).fonto === "propra"` mit dem Kialo der freigegebenen Regulo.
- **AC-7** ekzemplo und provo: Die Liste der Entscheidungen ohne Grund ist **id-gleich** mit `specs/048-…/luecken.json` (156 / 160). Die Zahlen werden aus der Datei abgeleitet, nicht fest eingetragen.
- **AC-8** Kein Token außerhalb der 75, der vorher einen eigenen Kialo hatte, bekommt einen anderen. Der Vergleich läuft je Knoten vorher/nachher. Neu hinzukommende **geerbte** Gründe bei Übernahmen sind erlaubt und werden im Bericht gezählt.
- **AC-9** Gvidanto (Art. VII): `explain({ token: "font.weight.semibold", assignment: { aspekto: "komuna" } })` nennt die Regulo `komuna-schriftgewichte` mit ihrem Kialo. Mit `aspekto: "ekzemplo"` und ohne Aspekto erscheint sie nicht (Test in `packages/modelo/src/gvidanto/`).
- **AC-10** `pnpm fm modelo validate` ist gültig. Die Vertrags-Fixtures aus Spec 038 (`packages/mcp/test/fixtures/kontrakto/**`, `kontrakto-038.test.ts`) bleiben **byte-gleich grün**, ohne Neuerzeugung. Die Tests aus 047 und 048 (`packages/metiejo/src/grafeo*-04{7,8}.test.ts`) bleiben grün und unverändert.

### Messung und Bericht
- **AC-11** `pnpm --filter @fundamento/nodredaktilo bilder --ziel /Users/thorstenjankowski/n8n-compose/20260918_fundamento-ds/.fundamento/spec049 --luecken specs/049-kialoj-komuna/luecken.json` läuft mit Exit 0. Bilder und `messung.json` liegen **außerhalb** des Repos.
- **AC-12** `specs/049-kialoj-komuna/bericht.md` enthält:
  - je Gruppe „Entscheidungen ohne Grund“ vorher (048) und nachher, für komuna und zur Kontrolle für ekzemplo und provo;
  - geerbt und „kein Grund in der Kette“, vorher und nachher;
  - PR-Link und CI je Job;
  - eine Liste der Reguloj (Name → Tokens);
  - was der Maintainer als Nächstes tut.

### Lieferung
- **AC-13** Höchstens 5 Tickets, **ein PR** gegen `main`, ein Push, danach genau **ein** `workflow_dispatch`, kein Push danach. Höchstens 30 lokale Wiederholungen je wackligem Test. Bekannt rot und fremd: `packages/eroj/test/zweitfarbe-036`, `modelo turbo-inputs`. Am Ende ist der PR offen, die CI ausgewertet und ein kurzer Bericht geschrieben. Dann stoppen.

## User Flow

1. **Spec-Phase (jetzt):** Der Maintainer liest die Tabellen in `technical-spec.md` §5 und gibt je Gruppe frei. Er ändert Sätze direkt in der Tabelle oder markiert einen Eintrag als verworfen. Erst dann drückt er „Go“.
2. **T1, rote Tests:**
   - `grafeo-kialo-049` (metiejo), Anforderungen AC-6 bis AC-8;
   - `regularo-komuna-049` (modelo), Anforderungen AC-3, AC-4 und AC-9.
   - Lauf beobachten, rot aus dem erwarteten Grund (keine `reguloj.json`), dann committen.
3. **T2, Daten:**
   - Ids vergeben und `reguloj.json` aus den freigegebenen Tabellen schreiben;
   - `NOT_CHECKABLE`-Einträge ergänzen;
   - Tests grün; `fm modelo validate`, Kontrakt 038 sowie 047/048 grün.
4. **T3, Messung:**
   - `bilder` laufen lassen, `luecken.json` (049) schreiben;
   - Bericht vorher/nachher je Gruppe; Diff-Suche wie in 048.
5. **T4, Lieferung:**
   - PR, ein Push, ein Dispatch;
   - CI je Job in Bericht und PR-Text. Stopp.

## Scope

### Enthalten
- 24 Reguloj für komuna in `packages/aspekto-komuna/reguloj.json`, dazu die Id-Einträge.
- `NOT_CHECKABLE`-Einträge für genau diese Reguloj.
- Neue Tests: Graph (metiejo), Paket-Reguloj und `explain` (modelo).
- Messung mit dem unveränderten Skript `bilder`, `luecken.json` (049), Bericht.

### Nicht enthalten
- Gründe für ekzemplo und provo (156 / 160 bleiben).
- Gründe im Kern (Regulo ohne `aspekto`), auch wenn die Werte Kern-Werte sind. Das ist ein späterer Lauf.
- Änderungen an `knotenartDe`, `kialoDe`, `begruendungDe` oder an der Leinwand (NE-2).
- Änderungen an Werten. Kein Token ändert seinen Wert, kein neuer Token.
- Ablehnungen als eigener Knotentyp (Konzept §6.4).
- Der Markenassistent schreibt Gründe mit (Konzept §4.3.2).

## Edge Cases

- **Muster trifft mehr als die Lücke.** `font.tracking.scale.*` oder `size.scale.*` treffen auch Stufen, die schon einen Grund aus `deveno.json` haben. `deveno` gewinnt im Graphen (`grafeo.ts:402`), diese Tokens behalten ihren Grund (AC-8 prüft das). Wo eine Regulo nur einzelne Tokens meint, nennt sie die Ids einzeln.
- **Ältere Regulo trifft denselben Token.** Im Graphen gewinnt die Regulo mit der kleinsten Id. Neue Ids sind jünger, eine bestehende Regulo behält also Vorrang. Für die 75 Tokens trifft heute keine Regulo (erhoben). Taucht doch eine auf, ist das ein Befund, kein Grund zum Umsortieren.
- **Übernahmen bekommen neu einen geerbten Grund** (z. B. `font.tracking.headline.1` → `font.tracking.scale.600`). Das ist erwünscht und wird im Bericht als Verschiebung von „kein Grund in der Kette“ zu „geerbt“ gezählt.
- **Ein Vertrags-Fixture aus 038 ändert sich.** `list_reguloj` und `explain` ohne Aspekto filtern Aspekto-Reguloj heraus, deshalb ist keine Änderung zu erwarten. Wird ein Fixture trotzdem rot: stoppen und berichten. **Nie neu erzeugen.**
- **Fonto-Skript schreibt komuna neu** (`scripts/fonto-astryx/schreiben.mjs`). Es überschreibt nur Sets, `deveno.json` und `jugxoj.json`, nicht `reguloj.json` und nicht `ids.lock.json`. Die Gründe überleben einen Neulauf.
- **Ein Satz wird verworfen.** Seine Tokens bleiben „fehlt“. Der Test erwartet die Zahl nach AC-2, der Bericht nennt sie.
- **`fm modelo validate` lehnt eine Paket-Regulo ab** (z. B. Name schon vergeben, Muster ohne Treffer). Dann den Namen bzw. das Muster korrigieren, keine Prüfung lockern.

## Gvidanto (Art. VII): neue Fragen mit Beispiel-Dialog

Nach Spec 049 beantwortet der Gvidanto zusätzlich: „Warum hat komuna diesen Wert oder diese Rollenwahl?“ für alle 75 Tokens.

> **Agent:** `explain { "token": "radius.role.control", "assignment": { "aspekto": "komuna" } }`
> **Gvidanto:** … `reguloj`: `komuna-rundung-bedienelement` (manual, aspekto komuna): „Bedienelemente nehmen die mittlere Rundung …“ (Kialo wie freigegeben).

Ohne `aspekto` oder mit `aspekto: "ekzemplo"` erscheint diese Regulo nicht (AC-9).

## Grundlage (nur lesen)

- `specs/048-nodredaktilo-grupoj-kialoj/{bericht,spec,plan,tasks}.md`, `luecken.json`
- `/Users/thorstenjankowski/n8n-compose/20260918_fundamento-ds/.fundamento/konzepte/kialoj-konzept.md`
- `.specify/memory/constitution.md` Art. VI (Regularo kun Kialoj) und VII (Agenta Dokumentado)
