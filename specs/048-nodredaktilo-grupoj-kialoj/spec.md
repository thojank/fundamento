# Spec 048 – Node-Editor NE-1b: Untergruppen je Ero und geerbte Gründe

**Status:** Auftrag für eine Sitzung im Spec-Modus · **Erstellt:** 2026-11-11 · **Basis:** aktuelles `main` (nach #161) · **Zielpfad:** `specs/048-nodredaktilo-grupoj-kialoj/spec.md`

**Regel 0** gilt. **Keine Budgets, Grenzen, Schwellen, Zeitlimits oder Toleranzen anheben.** **Kein neuer Kern-Token.** **Nichts mergen.** Rote Tests zuerst. Keine Schlüssel. Nur die Marken des Repos. Das Wort aus R-12 von Spec 035 und der Name des privaten Schriften-Repos in keiner neuen Zeile. Kein Sprachmodell (0 $). Es gelten `standards/global/delivery.md` und `testing.md`.

**Begrenzung der Laufzeit (bindend):** höchstens **5 Tickets**, **ein PR**, ein Push, danach genau **ein** `workflow_dispatch`-Lauf, kein Push danach, kein Neustart. Je Wackel-Test höchstens **30** lokale Wiederholungen. Bekannt rot und „fremd“: `packages/eroj/test/zweitfarbe-036`, `modelo turbo-inputs`. **Keine Änderung an `packages/modelo/data/**`** (auch kein Jugxo): Die Vertrags-Fixtures aus Spec 038 bleiben dadurch unberührt.

## Hintergrund (nur lesen)
Alle Pfade unter `/Users/thorstenjankowski/n8n-compose/20260918_fundamento-ds/.fundamento/`:
- Konzept Gründe: `konzepte/kialoj-konzept.md` (Abschnitt 7 = Index aller Fundamento-Dokumente)
- Konzept Farbgruppe: `konzepte/ne1b-farbgruppe.md`
- Konzept Node-Editor: `konzepte/node-editor-konzept.md`
- NE-1: `spec047/spec.md`, Bilder `spec047/bilder/`, Messung `spec047/messung.json`; im Repo `specs/047-nodredaktilo-lego/{plan,bericht}.md`, `luecken.json`
- Roadmap: `roadmap/roadmap-2026-11-11.md`

## Worum es geht
NE-1 hat zwei Dinge gezeigt:
1. Die Gruppe `farbe/komponenten` (920 Knoten) ist aufgeklappt unlesbar.
2. Bei 1 852 von 2 115 abgeleiteten Knoten (provo) steht „fehlt“ als Begründung. Ein großer Teil davon ist ein Fehler der Anzeige: Ein Token, der nur übernimmt, braucht keinen eigenen Grund, er erbt ihn über die Kette.

Dieser Lauf behebt beides **ohne ein neues Datum**: nur Zuordnung, Sicht-Logik und Anzeige.

## Was gebaut wird

### A. Dritte Ebene: Untergruppen je Ero
- Regel in der Zuordnungstabelle von `grafeo.ts`: Beginnt ein Token mit `ero.<name>.`, gehört er nach `<achse>/komponenten/<name>`. Gilt für alle Achsen, nicht nur Farbe. `Grupo.patro` trägt die Ebene; das Datenmodell bleibt.
- Aufklappen in Stufen: Achse → Palette / Rollen / Komponenten → Ero-Untergruppen → Knoten.
- **Keine aufklappbare Gruppe zeigt mehr als 60 Knoten auf einmal.** Trifft eine Gruppe die Zahl nicht (z. B. Rollen oder Palette einer Achse), wird sie nach dem nächsten Pfadteil weiter geteilt; die Regel ist allgemein, keine Liste von Namen.
- Ein Klick in der Herkunftskette klappt alle nötigen Ebenen auf.

### B. Geerbte Gründe und drei Knotenarten in der Anzeige
- Neue reine Funktion `kialoDe(grafeo, id)` → `{ fonto: "propra" | "heredita" | "neniu", de?: id, kialo?: string }`: eigener Kialo, sonst die Kette (`devenoDe`) hinauf bis zum ersten Knoten mit Kialo, sonst keiner.
- Einordnung je Knoten, **nur berechnet, nicht gespeichert** (vorläufige Definition, der Maintainer bestätigt sie später):
  - **Entscheidung:** Eingaben und Rollen (ein Token, auf den mindestens ein `ero.*`-Token verweist und der selbst auf Palette oder festen Wert verweist).
  - **Mechanik:** `regulo` ist `paletto` oder `gestalto`.
  - **Übernahme:** alles Übrige (`alias` ohne eigene Entscheidung).
- Seitenspalte:
  - Entscheidung mit Kialo: Grund. Ohne: **„fehlt“** (wie heute).
  - Übernahme: „geerbt von ‹Knoten›“ mit dessen Grund; hat die ganze Kette keinen, „kein Grund in der Kette“ (neutral, kein Warnton).
  - Mechanik: nur die Regel, kein „fehlt“.
- Gruppenknoten zeigen zusätzlich, wie viele **Entscheidungen ohne Grund** sie enthalten (Zahl, wenn > 0).
- Kein Text wird erzeugt. `kialo` kommt weiter nur aus vorhandenen Daten (047 P-8).

### C. Messen
- Skript `bilder` aus 047 erweitert; Ausgabe **außerhalb des Repos** nach `.fundamento/spec048/bilder/` und `.fundamento/spec048/messung.json`:
  - je Marke: Knoten je Art (Entscheidung, Mechanik, Übernahme); Entscheidungen ohne Grund; Übernahmen mit geerbtem Grund; „kein Grund in der Kette“.
  - Vergleich zu 047: „fehlt“ vorher (1 852 / 1 842 / 920) gegen „Entscheidungen ohne Grund“ nachher.
  - größte sichtbare Gruppe je Ebene, Zeit je Aufklappen (Median, Maximum aus 5).
  - Bilder je Marke: zugeklappt, Farbe → Komponenten (Untergruppen), eine Ero-Untergruppe offen mit Seitenspalte „geerbt von“.
- `specs/048-…/luecken.json`: die Entscheidungen ohne Grund, mit id und Gruppe. Das ist die Arbeitsliste für das Schreiben der Gründe.

## Abgrenzung
- **Frei:** `packages/metiejo/src/grafeo*.ts` und ihre `*-048.test.ts`, `packages/nodredaktilo/**`, `specs/048-nodredaktilo-grupoj-kialoj/**`.
- **Tabu:** `packages/modelo/**`, `packages/agordilo/**`, `packages/eroj/**`, `packages/mcp/**`, `.github/**`, Root-Dateien (auch Lockfile: keine neue Abhängigkeit), jede Grenze oder Regel; Bearbeiten auf der Leinwand; Schreiben am Agordo.
- Barrierefreiheit des Editor-Pakets bleibt ausgenommen (Jugxo aus 047).

## Tickets (≤ 5, ein Strang)
T1 Zuordnung dritte Ebene und 60er-Regel, Tests rot/grün · T2 `kialoDe` und Einordnung der Knotenart, Tests rot/grün · T3 Leinwand: Aufklappen in Stufen, Seitenspalte, Zahl an Gruppen · T4 Messung, Bilder, `luecken.json`, Diff-Suche · T5 PR, ein Dispatch, Bericht.

## Abnahme
- Keine Gruppe zeigt aufgeklappt mehr als 60 Knoten, für komuna, ekzemplo und provo (Test, Zahl aus den Daten).
- Jeder Token liegt weiter in genau einer Gruppe; `grafeoDe` zweimal erzeugt ist byte-gleich; ein neuer Token erscheint ohne Codeänderung.
- `kialoDe`: eigener Grund vor geerbtem; die Kette endet an einer Eingabe; Mechanik-Knoten zeigen kein „fehlt“ (Tests).
- Bestehende Tests aus 047 bleiben grün; geändert wird nur, was die neue Ebene zwingend berührt (Liste im PR-Text).
- Bericht nennt je Marke die drei Zahlen vorher/nachher und beantwortet: Trägt die Dreiteilung? Wo ordnet die vorläufige Definition falsch ein (Beispiele)?

## Bericht
Kurz: PR-Link, CI je Job, Bilder (file://-Pfade), Messtabelle, `luecken.json` gezählt je Gruppe, Befunde für NE-2. Dann stoppen.
