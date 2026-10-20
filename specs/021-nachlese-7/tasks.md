# Nachlese 7 – Aufgaben

**Plan:** [`plan.md`](plan.md). Die Hashes aller Commits stehen in **einer** Zeile der Messungen.

## ① Fehler (0.1.1)

**Branch:** `261020-nachlese-7-fehler-116ba2` (von `main` `0fcce4c`) · Aufgaben ab T2101.

### A – Rot zuerst
- [x] **T2101 Tests** Browser (`packages/eroj/test/nachlese-7.spec.ts`): A-1 Meldung sichtbar und beschreibend, ohne Meldung keine Beschreibung; A-2 `createElement` für alle 32 Tags; A-3/A-5 jedes Markup-Beispiel der Guidelines ohne unsichtbares Kind; A-5 Hilfe und Fehler in `tekstareo.md`; A-6 native Caption. Make Kit (`make-kit.test.ts`): A-4 keine zwei Sätze mit gleichem Anfang und verschiedenem Ero, A-3 Form der Einträge, A-7 Abschnitt „Dismiss“. Modelo: Version 0.1.1 (`workspace.test.ts`), Doku (`docs.test.ts`). Rot in `28992c3` (Browser in Chromium 5 von 6 – grün nur „ohne Meldung keine Beschreibung“ –, Make Kit 6, Modelo 2).

### B – Grün
- [x] **T2102 A-1** Render setzt `hidden` und `aria-describedby` aus `#filled("message")`; Stilregel `[hidden]` (D-01).
- [x] **T2103 A-2** Bindung des Auslösers in `connectedCallback`, Schicht des Konsileto im Render (D-02).
- [x] **T2104 A-3/A-5** `entryMarkup`, `entrySentence`, Slot-Texte in `exampleBlock` (D-03, D-05).
- [x] **T2105 A-4** Filter `dialogLines`, `selectLines`, `listName` (D-04).
- [x] **T2106 A-6** `data-fm-caption`, Name der Region aus der geltenden Caption (D-06).
- [x] **T2107 A-7** Skemo, Uzo, Abschnitt „Dismiss“, Browser-Test des Beispiels (D-07).
- [x] **T2108 A-8** Versionen 0.1.1, Fixtures neu abgeleitet, Pins (D-08, Abweichungen 4–6), `CHANGELOG.md`.

### C – Abschluss
- [x] **T2109 Doku** briefing (Kopie), plan, tasks, CHANGELOG.
- [x] **T2110 CI** grün (Lauf 39433980852, `d94a5de`).

### Messungen

| Was | Wert |
|---|---|
| Commits | rot `28992c3`, grün `d94a5de` (Hash des grünen Stands, CI grün); dieser Eintrag im Folgecommit |
| CI | Lauf 39433980852 (`d94a5de`, alle acht Jobs grün, Wanduhr 6:31): `checks` 1:40, `unit` 6:27, `projekcioj` 3:22 / 3:27, `eroj` 2:20 / 2:18, `alirebleco-eroj` 4:34, `rendered-checks` 6:23 |
| Tests lokal | Modelo 3 610, Projekcioj 747, CLI 72, MCP 340, Agordilo 94, Eroj 763 (drei Engines) – je Paket allein grün; im vollen parallelen Lauf laufen `wunsch.test.ts` und `quickstart.test.ts` in ihre Zeitgrenzen (Last, allein grün); `pnpm lint` und alle `check:*` grün |

## ② Ergänzungen (0.2.0)

Folgt im PR ②.
