# Spec 033 – Aufgaben

**Spec:** [`spec.md`](spec.md) · **Plan:** [`plan.md`](plan.md). Aufgaben ab T3301.

## S1 – Amendment v2.5, Markenmodell, Ablauf, Chat, Freigabe, Kroniko

**Branch:** `261029-spec-033-s1-markenassistent` (von `main` `05f122dc`, nach #110, #111, #113).

### A – Rot zuerst
- [x] **T3301 Tests** in sieben Dateien:
  - Modelo `src/data/facetoj.test.ts`: zwölf Facetoj mit ID, Gewicht und Kialo, jedes Token in genau einer, Modi als Dimensioj, die beiden Regeln.
  - Doku-Test: Spec unverändert, Constitution v2.5 wörtlich, Begriffe, plan und tasks.
  - Metiejo `src/asistanto/kroniko.test.ts`, `stato.test.ts`, `iloj.test.ts`, `babilo.test.ts`, `servilo-asistanto.test.ts`.

  Rot in `7a6f7bb`: Modelo 2 (facetoj lädt nicht, Constitution 2.4), Doku 1; Metiejo 5 Dateien laden nicht (Module fehlen).

### B – Grün
- [x] **T3302 Amendment v2.5:** Art. VI, Terminologie Kroniko und Asistanto, Historie, Ontologio (Kroniko, Asistanto, Faceto); Doku-Tests der Versionen nachgezogen (2.4 → 2.5), Zahl der Begriffe 22 → 24.
- [x] **T3303 Markenmodell:** Schema `FacetojFile`, `Faceto`, `KronikoEro`, `FacetoId`; Entität `faceto` (`fac`); `data/facetoj.json` mit zwölf IDs (`pnpm id:new faceto --count 12`); `facetoj.ts` mit `facetojOfToken`, `checkFacetoj`; Regeln `faceto-token-unassigned`, `faceto-token-twice` (Katalog 192 → 194).
- [x] **T3304 Kroniko und Zustände:** `kroniko.ts`, `stato.ts` (D-02, D-03).
- [x] **T3305 Werkzeuge und Chat:** `iloj.ts` (D-04), `babilo.ts`, `ki.ts` aus `nordstelo` übernommen (Nordstelo nutzt es weiter, 58 Tests grün).
- [x] **T3306 Server und Bildschirm:** `/asistanto/<marke>[/<faceto>]`, `/api/marko/<marke>/(stato|asistanto|faceto|fremda|konfirmo)`, Kroniko in `setDraft`, beim Anlegen und beim Export; Hinweis vor dem Export auf „Fertig“ und im Studio (`averto.ts`); Link „Assistent“ im Studio; Client-Skript mit Chat, Aktionen, Bestätigung und Abgleich über `rev`; `readKi` beim Start.
- [x] **T3307 Probeläufe** (plan): Mistral `ministral-14b-2512`, OpenRouter Nemotron `:free`; Befund B-1 (leere Antwort) mit Test zuerst rot behoben.

### C – Abschluss
- [x] **T3308 Doku:** plan (Amendment, D-01–D-07, Probeläufe, Abweichungen 1–3, B-1–B-4, O-1–O-4, Messanleitung), tasks, Vojmapo, README.

### Messungen

| Was | Wert |
|---|---|
| Commits | rot `7a6f7bb`, grün im Folgecommit (Hash im PR) |
| Rot gemessen | Modelo 2 + Doku 1, Metiejo 5 Dateien |
| Grün gemessen | Modelo 181 Dateien / 3880 Tests; Metiejo 23 Dateien / 227 Tests (davon Assistent 34); Nordstelo 7 / 58; Lint sauber |
| Probeläufe | Mistral 11 026 Tokens, 27,8 s, ≈ 0,0022 $; Nemotron `:free` 13 396 Tokens, 226,5 s, 0 $ |
