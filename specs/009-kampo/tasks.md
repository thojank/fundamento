# Aufgaben – Spec 009 Kampo

**Plan:** [`plan.md`](plan.md) (D-01–D-12) · **Datum:** 2026-10-12/13 (Nachtschicht) · **Basis:** Branch von PR #53 (Spec 008), gestapelt · **Branch:** `261012-spec-009-kampo-ae9abb`

**Regel für jede Aufgabe (Art. X):** Rot zuerst, dann Grün; `pnpm build && pnpm test && pnpm lint` und jedes `check:*` grün; Ids nur aus `pnpm id:new`.

## A – Rot zuerst
- [x] **T001 Fixtures** `invalid/skemo-web-term-part` (Teil `input`), `invalid/uzo-slot-required-missing` (A7, D-12). Rot in Commit `46e7d24` (uzo-slot-required-missing: `valid: true`, Regel-Id unbekannt; skemo-web-term-part durch Mutation).

## B – Modelo
- [x] **T002 Schema**: `a11y.description`, Constraint-Schlüssel `slot:<name>`, `UzoContent.of`, Prüfarten `min-words`/`max-sentences`, `EroInstance.texts`; `generate:types`; MCP-Kopien.
- [x] **T003 Regeln**: `uzo-slot-required-missing`; Slot-Constraints in `skemo-rules.ts` (Validierung) und `usage.ts` (Durchsetzung); Enforcer `required-marked`, `error-not-color-only`, `field-label-visible`, `placeholder-not-label`; Text-Regeln.
- [x] **T004 Daten**: `kampo/skemo.json`, `uzo.json`, acht Reguloj, sechzehn Jugxoj, drei KontrastParoj, `butono`-Uzo `composes.with kampo`; `data/kampo.test.ts`.
- [x] **T005 Ontologio** `#Kampo` (Schema `eroj`, Beziehung zu `#Butono`), Zähl-Tests (drei Eroj, `uzoj=3`, Export-Satz, `allowed`-Listen, `knownGoals`).

## C – Gvidanto
- [x] **T006 `check_usage`** S2 (leeres Label), S3 („Ungültig“), `error` ohne `invalid`, `disabled` + `readonly`, Platzhalter gleich Beschriftung (Warnung).
- [x] **T007 `suggest_ero`** „Kommentar, mehrere Absätze“ → `multi-line`, `ask-human` (S4); „E-Mail“ → `kampo`, `kind: email`; „Name“ → `kampo`.
- [x] **T008 `brief` gemessen** je Ero (E5).

## D – Projekcioj
- [x] **T009 Web Component** Verbund (D-08), React `Kampo` (kontrolliert über `value`, unkontrolliert über das native Element).
- [x] **T010 Figma** Set `kampo` (D-09).
- [x] **T011 Make Kit** `components/kampo.md`, Satz in `Guidelines.md` (D-10).
- [x] **T012 Vitrino, Parität** für drei Eroj.

## E – Eroj im Browser
- [x] **T013 `kampo.spec.ts`**: Rolle, Name aus Label, Beschreibung help → error, `aria-required`, `aria-invalid`, Fehlertext live, Tab, `disabled` nicht fokussierbar, `readonly` fokussierbar, Stile `size × state`, Zeilenhöhe ≥ 24 px.
- [x] **T014 Alirebleco** (axe in 8 Kombinationen, Fokusring), **Internacia** (RTL, +35 %/200 % für Label/Hilfe/Fehler, Pseudo-Lokalisierung).

## F – Abschluss
- [x] **T015 e2e `s009-kampo.test.ts`** S2–S4 und Beispiel-Dialog; **T016** Vojmapo Zeile 4; Bericht.

## Messungen

| Was | Wert |
|---|---|
| `get_ero kampo brief:true`, Bytes / `ceil(Bytes/3)` | 2 124 Bytes / **708** – unter 750 (E5); zum Vergleich butono 570, ligilo 495. Der Verbund trägt drei Slots und sechs Grenzen; die Grenze hält, knapp. |
| Parität (`pnpm check:parity`) | 3 Eroj, 4 Seiten, 0 Differenzen; benannte Freigaben: icon (butono, ligilo), underline (ligilo), placeholder und required-mark (kampo) |
| Alirebleco (Eroj, Chromium) | kampo: 8 Kombinationen (komuna, ekzemplo × light, dark × default, high), je 3 Größen in rest/hover/disabled/readonly plus invalid mit Fehlertext, Fokusring ≥ 3:1 an 4 Feldern |
| Alirebleco (Modelo) | 69 KontrastParoj × 72 Kombinationen; neu: Fehlertext auf `background.sunken`, Fehlerrand und Rand (`ui`) – Werte im Bericht |
| Rote Fixtures beobachtet in Commit | `46e7d24` (T001); Schema `6824b55`; Daten und Regeln `2cafdac`; Projekcioj `b337be6` (je Commit-Text) |
