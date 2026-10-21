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

**Branch:** `261021-nachlese-8-darstellung-116ba2` (gestapelt auf ①) · Aufgaben ab T2221.

### A – Rot zuerst
- [x] **T2221 Tests:**
  - Projektionen (`figma/nachlese-8-darstellung.test.ts`): Sammlung gleich in beiden Builds, Aufbau der Sxablonoj, Beispiele der Vitrino, Vorschau, menuo zu, codeblock, markdown; im Double: Fläche, Rahmen, Instanzen, `copyable`.
  - Vitrino und Web (`nachlese-8-vitrino.test.ts`): V-1 bis V-6, F-5, M5.
  - Modelo (`data/nachlese-8.test.ts`): N7-F-1.
  - Browser (`packages/eroj/test/nachlese-8.spec.ts`): V-1 bis V-4, F-5, F-6.
  - Doku.
  - Rot in `e626558`.

### B – Grün
- [x] **T2222 Sammlung** aus FR-10 (D-06).
- [x] **T2223 Sxablonoj in Figma** (D-07 bis D-09): Fläche, Aufbau, Beispiele, `open`.
- [x] **T2224 codeblock und markdown** (D-10), Nachtrag zur Jugxo.
- [x] **T2225 Vitrino und Web** (D-11 bis D-13): Teile von sxelo, pagxo, redaktilo; Zeilen umbrechen; Beschriftung der Vorschau; Befehl; Markdown; Dokument-Stylesheet; Caption.
- [x] **T2226 N7-F-1** nesting 1, Jugxo.
- [x] **T2227 M5** (D-14): Messung, keine Übergänge im Bedienbereich, nur geänderte Werte schreiben.
- [x] **T2228 Pins** (Abweichung 7).

### C – Abschluss
- [x] **T2229 Doku** plan (mit Messanleitung), tasks.
- [ ] **T2230 CI** grün.

### Messungen

| Was | Wert |
|---|---|
| Commits | rot `e626558` |
| Tests lokal | Modelo 3 658, MCP 371, Projekcioj 792, Eroj 859 (drei Engines), Agordilo 94, CLI 72, `check:vitrino` 51 (M5 0 ms, 0 Long Tasks), `check:alirebleco-eroj` 561; `pnpm lint`, `pnpm perf` und alle `check:*` grün |
| Dialoge | `suggest_ero`: 218 Sätze wie nach ①; `check_usage`: `actions` mit butono gültig (Jugxo) |
| M5 (Drosselung ×3) | vorher 52 / 59 / 63 ms, 3 / 3 / 3 Long Tasks; nachher 50 / 0 / 0 ms, 1 / 0 / 0 |

## ③ Regeltexte deutsch

Folgt im PR ③.
