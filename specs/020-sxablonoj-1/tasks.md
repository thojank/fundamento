# Spec 020 – Sxablonoj Runde 1 – Aufgaben

**Plan:** [`plan.md`](plan.md). Die Hashes aller Commits stehen in **einer** Zeile der Messungen. Aufgaben ab T2051 (T2001 ff. trägt Nachlese 5 ③).

## ① Grundlage, sxelo und pagxo

**Branch:** `261020-spec-020-grundlage-116ba2` (gestapelt auf Nachlese 7 ②) · Aufgaben ab T2051.

### A – Rot zuerst
- [x] **T2051 Tests:**
  - Modelo (`src/data/sxablonoj.test.ts`): laden, IDs, Validierung, Regionen, Uzo, Grenze heading-with-actions mit Jugxo, Export und Rücklesen, describe_term.
  - Gvidanto (`packages/mcp/src/e2e/s020-sxablonoj.test.ts`): list_sxablonoj, get_sxablono, die Beispiel-Dialoge, check_usage; Werkzeugliste.
  - Projektionen (`src/celoj/sxablonoj.test.ts`): Web, React, Make Kit, Figma-Plan, Vitrino.
  - Figma-Plugin (`plugin-sxablonoj.test.ts`): Beispielrahmen aus Instanzen, zweiter Lauf.
  - Browser (`packages/eroj/test/sxablonoj.spec.ts`): Landmarken, Sprunglink, Fokusziel, axe, RTL, Container.
  - Doku.
  - Rot in `0595564`.

### B – Grün
- [x] **T2052 Schema und Typen** (D-01, D-02): Defs, Wurzel `sxablonoj`, `SCHEMA_DEFS`, generierte Typen.
- [x] **T2053 Laden, IDs, Validierung** (D-03): `files.ts`, `build.ts`, `id-occurrences.ts`, `schema-issues.ts`, `sxablono-rules.ts`, elf Regeln.
- [x] **T2054 Daten** `sxelo`, `pagxo`; Grenze `titolo.heading-with-actions` → pagxo mit Jugxo; Kialo `navigado.shell`.
- [x] **T2055 Export und Import**, MCP-Teilexport, describe_term.
- [x] **T2056 Gvidanto** (D-04, D-05): `sxablonoj.ts`, suggest_ero, check_usage; MCP-Werkzeuge und Schemata, Prompt.
- [x] **T2057 Web** (D-06): `sxablono-template.ts`, `saltligilo` im eigenen Baum, `container-type` in der CSS-Regel.
- [x] **T2058 React und Make Kit** (D-07).
- [x] **T2059 Figma** (D-08): Plan `sxablonoj`, `placeSxablonoj`, Double.
- [x] **T2060 Vitrino** (D-09) und **Parität** (D-10).
- [x] **T2061 Pins** (Abweichungen 2–6).

### C – Abschluss
- [x] **T2062 Doku** spec (Kopie), plan, tasks.
- [x] **T2063 CI** grün (Lauf 39458073636, `15e1220`; Versuch 2 des Jobs „Rendered checks“).

### Messungen

| Was | Wert |
|---|---|
| Commits | rot `0595564`, grün `15e1220` (Hash des grünen Stands, CI grün); dieser Eintrag im Folgecommit |
| CI | Lauf 39458073636 (`15e1220`), Versuch 1: sieben Jobs grün, „Rendered checks“ rot – M5 der Werkstatt 51 ms längste Blockade (ein Long Task) gegen die Grenze 50 ms; lokal zweimal 0 ms. Versuch 2 des Jobs grün (M5 0 ms, 0 Long Tasks). Wanduhr Versuch 1 8:19 (`unit` 6:45, `projekcioj` 3:16 / 3:47, `eroj` 2:27 / 6:09, `alirebleco-eroj` 4:13, `rendered-checks` 8:15, `checks` 1:10) |
| Tests lokal | Modelo 3 623, Projekcioj 769, MCP 363, Eroj 811 (drei Engines), `check:vitrino` 51 – je Paket allein grün; `pnpm lint` und alle `check:*` grün |

## ② formularo und filtrilo

**Branch:** `261020-spec-020-formular-116ba2` (gestapelt auf ①) · Aufgaben ab T2071.

### A – Rot zuerst
- [x] **T2071 Tests:**
  - Modelo (`src/data/sxablonoj-2.test.ts`): formularo, filtrilo, long-form, filter-bar, das erste Wort.
  - MCP (`s020-sxablonoj-2.test.ts`): die zwei Beispiel-Dialoge, `one`, search einmal.
  - Projektionen (`sxablonoj.test.ts`).
  - Browser (`sxablonoj-2.spec.ts`): submit einmal, ungültiges Feld, search, Umbruch.
  - Doku; Pins von ①.
  - Rot in `c8452e7`.

### B – Grün
- [x] **T2072 Schema** `one`, `children`; Typen.
- [x] **T2073 Daten** formularo, filtrilo; long-form → formularo (Jugxo); filter-bar.
- [x] **T2074 Gvidanto** (D-11, D-12): erstes Wort, spezifischeres Ziel, Grenzen des Sxablono, `children`; Regel `sxablono-region-one`.
- [x] **T2075 Web** (D-13, D-14, D-15): Formular, Suche, Props.
- [x] **T2076 Make Kit, Vitrino, Parität.**
- [x] **T2077 Pins** (Abweichung 3).

### C – Abschluss
- [x] **T2078 Doku.**
- [x] **T2079 CI** grün (Lauf 39465250512, `19db412`).

### Messungen

| Was | Wert |
|---|---|
| Commits | rot `c8452e7`, grün `19db412` (Hash des grünen Stands, CI grün); dieser Eintrag im Folgecommit |
| CI | Lauf 39465250512 (`19db412`), Versuch 1: alle acht Jobs grün. Wanduhr 10:10 (`unit` 6:38, `projekcioj` 2:44 / 3:40, `eroj` 2:21 / 2:09, `alirebleco-eroj` 5:11, `rendered-checks` 10:07, `checks` 1:23) |

## ③ Inhalt

**Branch:** `261020-spec-020-inhalt-116ba2` (gestapelt auf ②) · Aufgaben ab T2081.

### A – Rot zuerst
- [x] **T2081 Tests:**
  - Modelo (`src/data/sxablonoj-3.test.ts`): kodbloko, markdovido, redaktilo, Ziele, Grenzen, rich-text → markdovido.
  - MCP (`s020-sxablonoj-3.test.ts`): die zwei Beispiel-Dialoge, redaktilo in check_usage, list_eroj 34.
  - Projektionen (`sxablonoj.test.ts`): Elemente, kein `innerHTML` aus der Quelle, Make Kit, Figma-Sets, Vitrino.
  - Browser (`sxablonoj-3.spec.ts`): figure, Scroll-Region, Kopieren und Ansage, Markdown aus Eroj, Sicherheitstest, redaktilo.
  - Doku.
  - Rot in `c26497a`.

### B – Grün
- [x] **T2082 Daten** kodbloko, markdovido, redaktilo; `teksto.rich-text` → markdovido (Jugxo); Ontologio; `spacing-owned-by-container`.
- [x] **T2083 Web** (D-21 bis D-25): Hosts `codeblock` und `markdown` (`content-template.ts`), Selektoren und Struktur, redaktilo im Sxablono-Template.
- [x] **T2084 Figma** (D-27): Struktur badge, Freigabe der fünf Teile (Jugxo), Wörter der Sets.
- [x] **T2085 Make Kit, React, Vitrino, Parität** (D-28): Beispiele der Vitrino, Satz zum Umbruch.
- [x] **T2086 Pins** (Abweichungen 2, 3, 5, 6, 7).

### C – Abschluss
- [x] **T2087 Doku** plan (mit Messanleitung), tasks, README.
- [x] **T2088 CI** grün (Lauf 39477922590, `574cfad`).

### Messungen

| Was | Wert |
|---|---|
| Commits | rot `c26497a`, grün `574cfad` (Hash des grünen Stands, CI grün); dieser Eintrag im Folgecommit |
| CI | Lauf 39477922590 (`574cfad`), Versuch 1: alle acht Jobs grün. Wanduhr 10:26 (`unit` 6:44, `projekcioj` 3:18 / 3:58, `eroj` 2:44 / 2:06, `alirebleco-eroj` 6:36, `rendered-checks` 10:21, `checks` 1:00) |
| Tests lokal | Modelo 3 638, Projekcioj 773, MCP 371, Eroj 841 (drei Engines; 2 übersprungen), Agordilo 94, CLI 72, `check:vitrino` 51, `check:alirebleco-eroj` 561 – je Paket allein grün; `pnpm lint`, `pnpm perf` und alle `check:*` grün |
