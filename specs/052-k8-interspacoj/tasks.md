# Spec 052 – Aufgaben (K8 `interspacoj`: Abstände zwischen Geschwistern)

**Spec:** [`spec.md`](spec.md) · **Technische Spec:** [`technische-spec.md`](technische-spec.md) · **Plan:** [`plan.md`](plan.md) · **Basis:** `origin/main` `c439918f` · **Branch:** `261113-k8-interspacoj-abstnde--c719b4`

Sechs Tickets, ein Strang, streng nacheinander (D-052-08): `K8I-001 → K8I-002 → K8I-003 → K8I-004 → K8I-005 → K8I-006`. Commits lokal mit dem Präfix `Spec 052 K8I-00n: …` (Englisch), immer mit expliziten Pfaden. Kein Push, kein Merge, kein PR in den Tickets. Den einen PR öffnet der Orchestrator nach der QA. Jedes Ticket trägt hier seinen Stand ein: Commits mit SHA, Befehle, Ergebnisse.

| Ticket | Phase | Inhalt | hängt ab von | Stand |
|---|---|---|---|---|
| K8I-001 | 1 Grundlage | Start prüfen (052 frei, Basis-Diff), Spec-Ordner, Jugxo D-052-01, Entscheidungen D-052-02 … -09 | – | erledigt 2026-11-13 |
| K8I-002 | 2 Rote Tests | Rote Tests A und B, Fixtures aus M-1 (`anmelden-m1`, `konto-m1`), Gegenproben (a)–(d), 3c; Typ `verteilita` (V-1) | K8I-001 | offen |
| K8I-003 | 3 Fixes | Fix A: leere Live-Bereiche im Projektor (`data-fm-leer`), Neubau Eroj, Baselines nach D-052-06 | K8I-002 | offen |
| K8I-004 | 3 Fixes | Fix B: Flat-Tree-Messung, `verteilita` nach D-052-01, Zwilling, `k8.ts`, Marker D-052-05 | K8I-003 | offen |
| K8I-005 | 4 Nachweis | Neubewertung M-1 (Kontrolle und gerendert) ohne Modell, `neubewertung.md`, Rest C als Befund | K8I-004 | offen |
| K8I-006 | 5 Tests | Test-Ticket: Gesamtstand, AC-Matrix vollständig, Querschnitt | K8I-005 | offen |

## AC-Zuordnung (AC → Ticket → Test)

Geplante Belege. Datei- und Testnamen stehen fest, sobald das Ticket sie anlegt; K8I-006 füllt die Matrix mit den echten Namen und Ergebnissen.

| AC | Inhalt (kurz) | Ticket | Test bzw. Befehl |
|---|---|---|---|
| AC-A1 | `fm-sxelo`, leeres `notices`: nav → main = `spacing.medium` ± 0,5, 4 Marken × hell/dunkel | K8I-002 (rot), K8I-003 | neue Eroj-Spec in `packages/eroj/test/` (Fall 1), Chromium; K8I-006 auch Firefox und WebKit |
| AC-A2 | Leerer Live-Bereich bleibt im Accessibility-Baum; gefüllt nimmt er Platz ein | K8I-002 (rot), K8I-003 | dieselbe Eroj-Spec (Fälle 2, 3, 4 Sprunglink) |
| AC-A3 | Regel aus `region.live` der Skemo für jede Sxablono mit `live`, kein Name im Element | K8I-002 (rot), K8I-003, K8I-006 | projekcioj-Unit (Liste der Live-Bereiche, Test-Kopie mit `live` an anderem Bereich); Eroj-Spec Fall 5 (`fm-filtrilo`); K8I-006: Menge aus der Modelo abgeleitet |
| AC-A4 | Sxablonoj ohne `live` byte-gleich; betroffene Bilder namentlich, alle anderen pixelgleich | K8I-002 (Guard), K8I-003 | projekcioj-Guard (SHA-256 je Sxablono, auch `inline: true`); Inventur und `cmp`-Vergleich nach D-052-06 in `plan.md` |
| AC-B1 | Paare wie bisher, Abstand zwischen Flat-Tree-Kästen unter dem nächsten gemeinsamen Vorfahren | K8I-002 (rot), K8I-004 | nordstelo `src/k8/interspacoj-052.test.ts` (`konto-m1`, `anmelden-m1`); `faktoj.test.ts` |
| AC-B2 | `verteilita` nur für Eroj und Sxablonoj (alle drei Bedingungen von D-052-01) | K8I-002 (rot), K8I-004 | `interspacoj-052.test.ts` Gegenproben (c), (d1), (d2), (3c): kein Paar `verteilita`; `k8.test.ts` (V-2) |
| AC-B3 | Gegenproben (a)–(d) bleiben rot, jede zuerst rot belegt | K8I-002, K8I-004 | `interspacoj-052.test.ts` mit Selbsttest der gelockerten Fakten (K8I-002); Zwischenstand ohne Bedingung 2 und 3 rot (K8I-004, Build-Log) |
| AC-B4 | Jugxo mit Kialo vor dem Code | **K8I-001** | `plan.md` › D-052-01; Commit K8I-001 liegt vor jedem Code-Commit |
| AC-B5 | Zwilling identisch; gespeicherte Fakten ohne Feld wie bisher | K8I-004, K8I-006 | `zwilling.test.ts` (Fall mit `verteilita`), `gegenprobe.test.ts`, `determinismo.test.ts`; `roh`/`sxablono` byte-gleich (`git diff --exit-code`) |
| AC-C1 | Rest C nur Befund, nichts an `fm-atributlisto` oder Inline-Messung | K8I-005 | `neubewertung.md` › Rest C; Diff-Beleg in K8I-006 |
| AC-N1 | Kontrolle: gespeicherte M-1-Fakten byte-gleich, Urteil F 0/4 | K8I-005 | (a) `node specs/050-mvp-probelauf/pruefen.mjs` Exit 0; (b) `k8()` auf den Roh-Fakten = `taksado.k8` (D-052-09) |
| AC-N2 | Gerendert: wie viele der 4 F-Screens grün (erwartet 3) | K8I-005 | `node specs/052-k8-interspacoj/neubewertung.mjs`; `pruefen.mjs --daten specs/052-k8-interspacoj/daten/neubewertung --ohne-bericht` |
| AC-N3 | Fixture vorher rot, nachher grün (`anmelden-m1`, `konto-m1`) | K8I-002 (rot), K8I-003, K8I-004 | `interspacoj-052.test.ts` (CI-Job `unit (nordstelo)`, D-052-03) |
| AC-N4 | Neue Tests zuerst rot; bestehende Suiten grün außer den drei fremden | K8I-002 … K8I-006 | rote Commits je Paket (K8I-002); Paketläufe K8I-006 |
| AC-N5 | Bericht: gespeichert · Kontrolle · gerendert, `verteilita` nach Herkunft, Variante 0 | K8I-005 | `neubewertung.md`; Selbstprüfung von `neubewertung.mjs` (Exit ≠ 0 bei Agenten-Paar oder `verteilita` in Variante 0) |
| AC-N6 | Sauberer Probelauf nur vorbereitet | K8I-005 | `neubewertung.md` › Befehl, Kostenrahmen, Lastbedingung, „nicht gestartet“ |
| AC-G1 | Keine Schwelle, Toleranz, Grenze, Zeitlimit angehoben | K8I-006 | Test bzw. Diff-Beleg `AUF_STUFO === 0.5`, `k8Plena`; `git diff c439918f -- '**/vitest*.config.ts' '**/playwright*.config.ts' .github turbo.json` |
| AC-G2 | Ein PR vom aktuellen `main`, nichts gemergt | Orchestrator | – |
| AC-G3 | Kein Modell-Lauf | alle | Build-Log je Ticket |
| AC-G4 | PR offen, CI je Job, Bericht, dann Stopp | Orchestrator | – |

## K8I-001 im Einzelnen (Start, Spec-Ordner, Jugxo)

- [x] **Spec-Nummer frei** (2026-11-13): `ls specs/` ohne `052-*`, `gh pr list --state open --json number,title,headRefName` → `[]`, kein Branch mit `052`. Siehe `plan.md` › G-0 Start.
- [x] **Basis:** `HEAD` = `origin/main` = `c439918f96e444004d8d1ed873af899a9ebed8e5`. `git diff --stat de931e40 HEAD -- <fünf Analyse-Dateien>` ist leer. Kein Befund.
- [x] **Kopien mit `cp`:** `spec.md` (20 841 Byte, SHA-256 `707ef74c…f2274`) und `technische-spec.md` (14 904 Byte, SHA-256 `1d18c8bd…4c4cd`), je gleich der Quelle (`cmp` Exit 0). Werden nie editiert.
- [x] **Jugxo D-052-01** (ersetzt D-103 aus `specs/038-gvidanto-agentoj/plan.md`) und D-052-02 bis D-052-09 in `plan.md`.
- [x] Kein Code, kein Test. `specs/038-*` und `packages/modelo/data/jugxoj.json` unverändert.
- [x] `pnpm check:privat` grün (nach `pnpm turbo run build --filter=@fundamento/modelo`, aus dem Turbo-Cache).

### Commits K8I-001

- Spec 052 K8I-001: spec folder, base check and Jugxo D-052-01 (nur `specs/052-k8-interspacoj/{spec,technische-spec,plan,tasks}.md`)

## Geänderte Erwartungen älterer Tests (`testing.md` › „Extending tested pure functions“)

Keine in K8I-001. K8I-003 und K8I-004 tragen hier jede geänderte Erwartung mit Datei:Zeile, vorher/nachher und Grund ein (z. B. durch den Marker D-052-05 oder die kleinere Lücke von A).

| Datei:Zeile | vorher | nachher | Grund | Ticket |
|---|---|---|---|---|
