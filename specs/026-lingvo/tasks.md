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

Folgt im gestapelten PR auf ①.
