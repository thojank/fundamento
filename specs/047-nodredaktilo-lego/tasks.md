# Spec 047 – Aufgaben (NE-1: den Graphen lesen)

**Spec:** [`spec.md`](spec.md) · **Plan:** [`plan.md`](plan.md) (mit Nachtrag NE-1) · **Basis:** `main` `943cc22f` · **Branch:** `261110-spec-047-node-editor-graph-les-d83783`

Sechs Tickets, ein Strang (Spec: „höchstens 6 Tickets, ein PR“). T1–T5 setzen Engineers um, T6 der Orchestrator nach der QA. Commits lokal mit dem Präfix `Spec 047 T<n>: …`; gepusht wird nur in T6, genau einmal. Je Ticket ein Abschnitt unten: erledigte Punkte, Rot→Grün-Beleg, Befunde `F-T<n>-k`, Entscheidungen `D-…`.

| Ticket | Inhalt | Stand |
|---|---|---|
| T1 | Spec-Ordner; `grafeoDe`, `grafeoDePaket`, Sicht-Logik; `grafeo-047`, `grafeo-neu-047`, `grafeo-kialo-047` | in Arbeit |
| T2 | Paket `nodredaktilo`, React-Insel zugeklappt, Routen `/nodredaktilo/*` und `/api/grafeo`; `abhaengigkeiten-047`; B-1 (b) | offen |
| T3 | Knoten als Eroj, Seitenspalte mit Regel, Kialo und „fehlt“, Herkunftskette und Abhängige | offen |
| T4 | Marken-Tokens auf der Leinwand (hell/dunkel), Bildschirme, Knopf „Graph ansehen“; `grafeo-route-047` | offen |
| T5 | Skript `bilder`, Messung, Lückenliste, Diff-Suche, Bericht-Entwurf | offen |
| T6 | Ein PR, ein Push, ein `workflow_dispatch`, Bericht (Orchestrator) | offen |

## T1 im Einzelnen

- [x] `spec.md` mit `cp` aus `user-provided-product-spec-node-editor-graph-lesen.md`, `cmp` Exit 0; SHA-256 `5853b84d3f852817411ecb6fac10a09fb5844f34643755f0047c19185b7f6636` (gleich der Quelle `.fundamento/spec047/spec.md`, `cmp` Exit 0). Wird nicht editiert.
- [x] `plan.md`: byte-gleiche Kopie der technischen Präzisierung (die ersten 21 756 Byte, `cmp` Exit 0), danach `## Nachtrag NE-1 (Umsetzung)` mit den Tabellen 0.1 und 0.2, der Entscheidung B-1 (b) und der Abhängigkeitstabelle.
- [x] `tasks.md` mit den sechs Tickets.
- [x] Rote Tests zuerst: `packages/metiejo/src/grafeo-047.test.ts`, `grafeo-neu-047.test.ts`, `grafeo-kialo-047.test.ts`, gemeinsame Eingaben in `src/test-doubles/grafeo-047.ts`. Lauf (`FM_AUSGABE=knapp`, `vitest run` der drei Dateien): **3 rot**, je Datei „error outside a test“ – `Error: Cannot find module './grafeo.js' imported from packages/metiejo/src/grafeo-047.test.ts` (ebenso `grafeo-kialo-047.test.ts:9`, `grafeo-neu-047.test.ts:7`); das Modul gibt es noch nicht.

## T2 im Einzelnen

(offen)

## T3 im Einzelnen

(offen)

## T4 im Einzelnen

(offen)

## T5 im Einzelnen

(offen)

## T6 im Einzelnen

(offen)
