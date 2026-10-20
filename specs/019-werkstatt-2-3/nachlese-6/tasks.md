# Spec 019 ④ – Nachlese 6 – Aufgaben

**Plan:** [`plan.md`](plan.md). Die Hashes aller Commits stehen in **einer** Zeile der Messungen.

## Nachlese 6

**Branch:** `261020-nachlese-6-116ba2` (von `main` `ac5deb3`) · Aufgaben ab T1961.

### A – Rot zuerst
- [x] **T1961 Tests** Projekcioj: `kampo` je `kind` mit Beispielwert, Datum mit Grenzen; Kialo einmal; Werkstatt-Bündel nur mit `package.json` als `data:`-URL (`datumoj.test.ts`); Make Kit ohne CJS (`make-kit.test.ts`, `publish.test.ts`). Modelo: `--aspekto` gelesen, nur für alirebleco, in der Hilfe (`run.test.ts`); ein fremdes Paket gemessen, ein Fehler mit Paketnamen (`alirebleco/index.test.ts`); Pins der falschen Freunde (`suggest-ero.test.ts`); Doku-Test (`docs.test.ts`). Rot in `92a630b` (Projekcioj 14, Modelo 5; die Pins und die Ablehnung neben `--config` sind schon grün).

### B – Grün
- [x] **T1962 N6-1** `VITRINO_KAMPO_KINDS`, Zeilen je `kind` in `eroMarkup` (D-01).
- [x] **T1963 N6-2** `CheckOptions.aspekto`, `--aspekto` in `run.ts`, `checkOwnAspekto` (D-02).
- [x] **T1964 N6-3** `regulojKialoj` (D-03), Plugin `fm-provided-files` im Werkstatt-Bündel (D-04), Make Kit nur ESM (D-05).
- [x] **T1965 N6-4** Pins (Abweichung 3).

### C – Abschluss
- [x] **T1966 Doku** plan, tasks, README (`check:alirebleco --aspekto`, Make Kit ESM).
- [x] **T1967 CI** grün (Lauf 39346192486, `bd41898`).

### Messungen

| Was | Wert |
|---|---|
| Commits | rot `92a630b`, grün `bd41898` (Hash des grünen Stands, CI grün); dieser Eintrag im Folgecommit |
| CI | Lauf 39346192486 (`bd41898`, alle acht Jobs grün, Wanduhr 7:27): `checks` 1:03, `unit` 5:15, `projekcioj` 3:42 / 3:34, `eroj` 2:51 / 1:34, `alirebleco-eroj` 4:11, `rendered-checks` 7:23 |
| Größen | Vitrino 8,11 → 5,88 MB, Make Kit 2,38 → 1,56 MB (plan, Größen) |
| Tests lokal | Modelo 3 602, Projekcioj 738, CLI 72, MCP 322 – je Paket allein grün; `pnpm lint` grün; `check:parity`, `check:vitrino` (43, mit der Werkstatt ohne eingebettete Schemata), `check:make-kit` (5), `check:quickstart`, `check:release` grün; `require()` des ES-Moduls `dist/element.js` unter Node 24 liefert 65 Exporte |
| Konfliktfrei mit Spec 019 | `f72c618`, `b7e3aeb`: Doku-Test vor den Block von Nachlese 5, Satz zum Make Kit in die Zeile von `check:make-kit`, Dateiende wie auf `main` – Probe-Merge von `main` + #88 + #86 ohne Konflikt; CI Lauf 39352981491 (`b7e3aeb`, alle acht Jobs grün, Wanduhr 9:05) |
