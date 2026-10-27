# Spec 030 – Nordstern-Kennzahl – Aufgaben

**Spec:** [`spec.md`](spec.md) · **Plan:** [`plan.md`](plan.md) · **Branch:** `261023-spec-030-nordstern-826849` (von `main` `d29a520`, nach #109). Aufgaben ab T3001.

### A – Rot zuerst
- [x] **T3001 Tests** in acht Dateien:
  - Modelo `src/nordstelo/katalogo.test.ts`:
    - Entitäten `tasko`/`kriterio` mit `tsk_`/`kri_`, IDs im Lock
    - 20 Aufgaben de/en, 5 Sxablonoj, ≥ 30 Eroj
    - Kriterien mit Regulo, Gewichte K1–K6 mit Kialo
    - `checkNordstelo`, `readNordstelo`
  - Nordstelo `score.test.ts`: K1–K6 einzeln, Variante 0 ohne K2/K3, Determinismus.
  - Nordstelo `report.test.ts`: Median, Streuung, Top-10, Tokens, fehlgeschlagene Läufe.
  - Nordstelo `agent.test.ts`:
    - Anbieter aus der `.env`
    - Schlüssel weder im Log noch im Fehler noch in der Ausgabe
    - F mit Werkzeugen, 0 ohne
    - Kostengrenze
  - Nordstelo `run.test.ts`: Dateien des Laufs, Bericht, Verlauf, Abbruch an der Kostengrenze, kein Schlüssel in einer Datei.
  - Nordstelo `rescore.test.ts`: gespeicherte Ergebnisse beider Varianten, erneut bewertet.
  - Metiejo `src/nordstelo.test.ts`: Ansicht des Verlaufs und Route `/nordstelo`.
  - Doku-Test und CI-Test: Matrix, Root-Skript, der Lauf nicht in der CI.

  Rot in `e78608e`:
  - Nordstelo: 5 Dateien laden nicht.
  - Metiejo: 1 Datei lädt nicht.
  - Modelo: Katalog-Datei lädt nicht, Doku 2, CI 1.

### B – Grün
- [x] **T3002 Katalog** (D-01):
  - Schema: `NordsteloFile`, `Tasko`, `Kriterio`, `NordsteloKontrolo`, `Pezo`, `TaskoId`, `KriterioId`
  - Entitätstypen, ID-Erfassung, drei Regeln `nordstelo-*-unknown`
  - `katalogo.ts`
  - `data/nordstelo.json` mit 20 Aufgaben und 81 Kriterien
  - 101 IDs im Lock
  - Begriffe Tasko und Kriterio in der Ontologio
- [x] **T3003 Paket `@fundamento/nordstelo`:**
  - `facts.ts`, `score.ts` (D-02–D-08)
  - `agent.ts`, `gvidanto.ts` (D-09, D-10)
  - `render.ts` (D-05, D-11)
  - `report.ts`, `run.ts` (D-10, D-12)
  - `cli.ts` mit `--anbieter`, `--modell`, `--max-tokens`, `restaro`
  - Root-Skript `pnpm nordstelo`, Paket in der Unit-Matrix der CI
- [x] **T3004 Metiejo:** `nordstelo.ts` (Typen des Verlaufs, Ansicht), Route `/nordstelo` und `/nordstelo/dosiero/…` (D-13).
- [x] **T3005 Probeläufe:**
  - Mistral: 403 und 429; Entscheidung des Maintainers: `gpt-4.1-mini`, 15 Mio. Tokens
  - OpenAI: Schemata mit `oneOf` (B-3)
  - benannter Standard-Slot (B-2)
- [x] **T3006 Erster Lauf** `20261024-0825` auf `7e4ebe7`, vor dem Merge von Spec 029 ①:
  - 120 Ergebnisse, 1 606 339 Tokens
  - Kennzahl F 71, Kennzahl 0 74,3
  - `restaro`: 0 abweichend
  - sechs Ergebnisse als Fixtures
- [x] **T3007 Nachgezogene Tests:**
  - Präfixe und Zahl der Regeln (`contracts.test.ts`)
  - Paketliste (`workspace.test.ts`)
  - Begriffe des Schemas `modelo` (`ontologio.test.ts`)
  - Unit-Matrix (`workflow.test.ts`)

### C – Abschluss
- [x] **T3008 Doku:**
  - plan: Zusammenfassung, D-01–D-13, Begriffe, erster Lauf, Abweichungen 1–7, B-1–B-8, O-1–O-6, Messanleitung
  - tasks, README, Vojmapo
- [x] **T3009 Messungen:** unten; Bericht im PR.

### Messungen

| Was | Wert |
|---|---|
| Commits | rot `e78608e`, Umsetzung `7e4ebe7` (Commit des ersten Laufs), grün im Folgecommit (Hash im PR) |
| Erster Lauf | `20261024-0825`, `gpt-4.1-mini`; Kennzahl F 71, Kennzahl 0 74,3; Streuung 13,2 / 19,3; 1 543 556 Tokens ein, 62 783 aus |
| Determinismus | 120 Ergebnisse erneut bewertet, 0 abweichend |
