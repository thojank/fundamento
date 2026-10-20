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

Folgt im PR ②.

## ③ Inhalt

Folgt im PR ③.
