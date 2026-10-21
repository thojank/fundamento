# Nachlese 8 – Aufgaben

**Plan:** [`plan.md`](plan.md). Die Hashes aller Commits stehen in **einer** Zeile der Messungen. Aufgaben ab T2201.

## ① Gvidanto, Plugin-Name, 0.2.0

**Branch:** `261021-nachlese-8-gvidanto-116ba2` (von `main` `59ab620`) · Aufgaben ab T2201.

### A – Rot zuerst
- [x] **T2201 Tests:**
  - Modelo (`src/gvidanto/nachlese-8.test.ts`): G-1 (drei Dialoge, Liste der Treffer im Wortinneren), D-11 (Liste als Daten, jeder Sxablono-Dialog mit „Ich brauche“ und „Bitte“), F-1 (fünf Bewegungen, zwei ohne).
  - Projektionen (`plugin-name.test.ts`): F-13.
  - Version 0.2.0 (`workspace.test.ts`), Doku (`docs.test.ts`).
  - Briefing und Abnahme-Ergebnis kopiert.
  - Rot in `a227699`.

### B – Grün
- [x] **T2202 G-1** Maß von O-17 für die Uzo-Einträge (`keywordHitOf`, D-01).
- [x] **T2203 D-11** `data/gvidanto.json`, Schema `Gvidanto`/`GvidantoFile`, Typen, Laden, Export, Import; `leadWordOf` (D-02).
- [x] **T2204 F-1** Grenze `navigado.drawer` mit der Kialo von O-39 (D-03); zwei Jugxoj; alle Dialoge verglichen.
- [x] **T2205 F-13** `pluginManifest` (D-04).
- [x] **T2206 0.2.0** Versionen, `AGORDILO_VERSION`, Fixtures neu abgeleitet, `release.yml`, `release-kits.sh`, CHANGELOG (D-05).
- [x] **T2207 Pins** (Abweichung 4).

### C – Abschluss
- [x] **T2208 Doku** plan (mit Messanleitung), tasks.
- [x] **T2209 Dry-run** `release.yml` mit 0.2.0, Tag `latest` (Lauf 39584022420, `7aa400a`).
- [x] **T2210 CI** grün (Lauf 39583993268, `7aa400a`).

### Messungen

| Was | Wert |
|---|---|
| Commits | rot `a227699`, grün `7aa400a` (Hash des grünen Stands, CI grün); dieser Eintrag im Folgecommit |
| CI | Lauf 39583993268 (`7aa400a`), Versuch 1: alle acht Jobs grün. Wanduhr 10:17 (`unit` 6:28, `projekcioj` 4:03 / 3:01, `eroj` 2:27 / 2:30, `alirebleco-eroj` 5:14, `rendered-checks` 10:13, `checks` 1:22) |
| Dry-run | `release.yml` mit `mode=dry-run`, `version=0.2.0` auf dem Branch: Lauf 39584022420 grün; beide Kits `pnpm publish --dry-run --tag latest --provenance --access public`. Veröffentlicht ist nichts. |
| Tests lokal | Modelo 3 655, MCP 371, Projekcioj 776, Agordilo 94, CLI 72; `pnpm lint`, `fm modelo validate`, `check:regularo`, `check:mankoj`, `check:vortaro-lint`, `check:clean-room`, `check:ikonaro`, `check:alirebleco`, `check:release`, `check:parity`, `check:make-kit`, `check:quickstart` grün |
| Dialoge | 218 Sätze mit `main` `59ab620` verglichen, 8 gekippt (Gekippte Dialoge) |

## ② Figma und Vitrino

Folgt im PR ②.

## ③ Regeltexte deutsch

Folgt im PR ③.
