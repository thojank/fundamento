# Spec 026 – Lingvo – Aufgaben

**Spec:** [`spec.md`](spec.md) · **Plan:** [`plan.md`](plan.md). Die Hashes aller Commits stehen je PR in **einer** Zeile der Messungen. Aufgaben ① zählen ab T2601, ② ab T2631.

## ① Fehler und Build

**Branch:** `261022-spec-026-fehler-und-marken-172dff` (von `main` `5ac57f0`, nach #105).

### A – Rot zuerst
- [x] **T2601 Tests** in sechs Dateien:
  - `datelektilo.spec.ts`: Zeitraum 27.10.–4.11. per Klick über den Monatswechsel. Alle neun Tage nach dem Datum im Monat des Starts und des Endes, die Enden mit gleichem Look innerhalb und außerhalb des Monats, dazu eine Woche Mo–So.
  - `listelektilo.spec.ts`: jede nicht deaktivierte Option per Klick und per Tastatur; „Japan“ verweigert und mit sichtbarer Beschreibung.
  - `vitrino.check.ts`: beides in der Vitrino selbst.
  - `datumoj.test.ts`: eine deaktivierte Option des Beispiels trägt „Nicht verfügbar“.
  - `figma-cxiuj.test.ts`: vier Modi, Grenze, Plugin-ID und -Name nach F-13, Vitrino mit vier Marken.
  - Doku-Test ①.

  Rot in `5b9cdcc`:
  - Projekcioj: 1 Test in `datumoj.test.ts`; `figma-cxiuj.test.ts` lädt nicht ohne Konfiguration.
  - Browser: der neue Test in `datelektilo.spec.ts`; „Japan“ im Vitrino-Check.
  - Doku-Test: 2 Tests.
  - Grün schon im Rot: die Zustände nach Datum (die Logik war richtig, plan ① Ursachen) und der neue Test in `listelektilo.spec.ts` (das Markup im Test trägt die Beschreibung schon).

### B – Grün
- [x] **T2602 Zeitraum:** Der Selektor `outside-day` schließt gewählte Tage aus (D-01). Den CSS-Pin in `web-component.test.ts` nachgezogen.
- [x] **T2603 Japan:** `VITRINO_REGIONS` mit `description: "Nicht verfügbar"` (D-02).
- [x] **T2604 Build:** `fundamento.cxiuj.config.json` (D-03). Plugin-Lauf im Figma-Simulator als Test ergänzt (D-04, grün nachgereicht).

### C – Abschluss
- [x] **T2605 Doku:** plan ① (Ursachen, Review, D-01–D-04, Abweichungen, B-1–B-3, O-1–O-3, Messanleitung), tasks ①, README (ein Befehl), Vojmapo.
- [x] **T2606 Messungen:** unten; Bericht im PR.

### Messungen

| Was | Wert |
|---|---|
| Commits ① | rot `5b9cdcc`, grün `54a0612` |
| Grün gemessen | Modelo 173 Dateien / 3 792 Tests; Projekcioj 32 / 846 (dazu 4 in `figma-cxiuj.test.ts`); Browser (Chromium) 329; `datelektilo.spec.ts` und `listelektilo.spec.ts` in Chromium, Firefox und WebKit 45; Vitrino-Check 55; Alirebleco (Chromium) 211; Lint sauber |
| CI | PR #106, Lauf 39857246437 grün nach zwei Neustarts des Jobs „Rendered checks“: zweimal brach er nach 15 min ab, weil „Playwright browsers“ 9:50 bzw. 10:41 min brauchte (apt auf kaltem Läufer, B-6/O-4 der Nachlese 9, ebenso zwei abgebrochene Läufe auf `main`); im dritten Versuch 19 s, Vitrino-Check 6:08 min. Kein Budget angehoben. |
| Build vier Marken | 10,5 s, 413 Dateien; `aspekto` 4 Modi (Grenze 10); Plugin-ID `fundamento-apply-plan-1c9fd908`; Plugin-Lauf im Simulator 5,9 s |
| Rot gemessen | Projekcioj 1 Test + 1 Datei, Browser 2 Tests (`datelektilo.spec.ts`, Vitrino-Check), Doku 2 Tests |

## ② Lingvo-Schalter

**Branch:** `261022-spec-026-lingvo-und-marken-bui-172dff` (gestapelt auf ①, PR #106).

### A – Rot zuerst
- [x] **T2631 Tests** in acht Dateien:
  - Modelo `src/lingvo/nomoj.test.ts`: alle Namen deutsch und englisch, Check, Beispiele, eindeutig je Sprache, kurz, Gvidanto mit `label`, „Schieberegler“ über Stichwörter.
  - MCP `e2e/s026-lingvo.test.ts`.
  - Projekcioj `src/lingvo.test.ts`: Figma-Beschreibung, Sammlung, Esperanto als Standard, kein Bezeichner übersetzt, Vitrino mit Schalter, Spans und Island.
  - CLI `projekcioj.test.ts` (`--lingvo`).
  - Metiejo `src/lingvo.test.ts`.
  - `vitrino.check.ts` (Schalter im Browser).
  - Doku-Test ② mit der Tabelle aus den Daten.

  Rot in `838d53f` (vor dem Rebase `a5c803c`):
  - Modelo: `nomoj.test.ts` lädt nicht, Doku 1 Test
  - Projekcioj: 6 von 8; grün waren „Esperanto ist Standard“ und „kein Bezeichner übersetzt“, weil `lingvo` noch nichts tat
  - Metiejo: 3
  - MCP: 3
  - CLI: 1

### B – Grün
- [x] **T2632 Daten:** 1 033 Namen in `tradukoj.json` je `de` und `en` (D-05–D-07), `nomoj.ts`, Check in `tradukoIssues`.
- [x] **T2633 Gvidanto:** `label` in `suggest_ero`, `get_ero`, `get_sxablono`, `list_eroj`, `list_sxablonoj`; Ein- und Ausgabeschemas; elf exakte Pins um `label` ergänzt (B-5).
- [x] **T2634 Figma und CLI:** `--lingvo`, Beschreibungen, Sammlung als Plugin-Daten (Simulator um Shared Plugin Data der Sammlung ergänzt), Plugin-ID mit Sprache (Abweichung 4, Test grün nachgereicht) (D-11).
- [x] **T2635 Vitrino:** Schalter, Spans, Island, Fragment, Überschriften (D-08, D-09); Pin `<h2>Gebrauch</h2>` nachgezogen; Namen in den Spalten der Werkstatt als Text (B-11).
- [x] **T2636 Studio und Schnellstart:** `fm-elekto`, Spans, Island, `localStorage` (D-10, B-6).

### C – Abschluss
- [x] **T2637 Doku:** plan ② (Review, D-05–D-11, Tabelle der Namen, Abweichungen 1–5, B-4–B-11, O-4–O-7, Messanleitung), tasks ②, README, Vojmapo.
- [x] **T2638 Messungen:** unten; Bericht im PR.

### Messungen

| Was | Wert |
|---|---|
| Commits ② | rot `838d53f`, grün `c9f5688` (vor dem Rebase auf `69720c5`: rot `a5c803c`, grün `8988254`), Hashes im Folgecommit |
| Rot gemessen | Modelo 1 Datei + 1 Test, Projekcioj 6, Metiejo 3, MCP 3, CLI 1 |
| Namen | 1 033 je Sprache: 40 Eroj, 5 Sxablonoj, 970 Teile/Achsen/Werte/Zustände/Slots/Regionen, 6 Dimensioj, 12 Werte |
| Builds | Esperanto und Deutsch unterscheiden sich nur in `figma/plan.json`, `figma/plugin/code.js`, `figma/plugin/manifest.json` und `projekcioj.json` |
