# Aufgaben – Spec 009 Kampo

**Plan:** [`plan.md`](plan.md) (D-01–D-12) · **Datum:** 2026-10-12/13 (Nachtschicht) · **Basis:** Branch von PR #53 (Spec 008), gestapelt · **Branch:** `261012-spec-009-kampo-ae9abb`

**Regel für jede Aufgabe (Art. X):** Rot zuerst, dann Grün; `pnpm build && pnpm test && pnpm lint` und jedes `check:*` grün; Ids nur aus `pnpm id:new`.

## A – Rot zuerst
- [ ] **T001 Fixtures** `invalid/skemo-web-term-part` (Teil `input`), `invalid/uzo-slot-required-missing` (A7, D-12). Rot in Commit: _(Hash)_

## B – Modelo
- [ ] **T002 Schema**: `a11y.description`, Constraint-Schlüssel `slot:<name>`, `UzoContent.of`, Prüfarten `min-words`/`max-sentences`, `EroInstance.texts`; `generate:types`; MCP-Kopien.
- [ ] **T003 Regeln**: `uzo-slot-required-missing`; Slot-Constraints in `skemo-rules.ts` (Validierung) und `usage.ts` (Durchsetzung); Enforcer `required-marked`, `error-not-color-only`, `field-label-visible`, `placeholder-not-label`; Text-Regeln.
- [ ] **T004 Daten**: `kampo/skemo.json`, `uzo.json`, acht Reguloj, sechzehn Jugxoj, drei KontrastParoj, `butono`-Uzo `composes.with kampo`; `data/kampo.test.ts`.
- [ ] **T005 Ontologio** `#Kampo` (Schema `eroj`, Beziehung zu `#Butono`), Zähl-Tests (drei Eroj, `uzoj=3`, Export-Satz, `allowed`-Listen, `knownGoals`).

## C – Gvidanto
- [ ] **T006 `check_usage`** S2 (leeres Label), S3 („Ungültig“), `error` ohne `invalid`, `disabled` + `readonly`, Platzhalter gleich Beschriftung (Warnung).
- [ ] **T007 `suggest_ero`** „Kommentar, mehrere Absätze“ → `multi-line`, `ask-human` (S4); „E-Mail“ → `kampo`, `kind: email`; „Name“ → `kampo`.
- [ ] **T008 `brief` gemessen** je Ero (E5).

## D – Projekcioj
- [ ] **T009 Web Component** Verbund (D-08), React `Kampo` (kontrolliert über `value`, unkontrolliert über das native Element).
- [ ] **T010 Figma** Set `kampo` (D-09).
- [ ] **T011 Make Kit** `components/kampo.md`, Satz in `Guidelines.md` (D-10).
- [ ] **T012 Vitrino, Parität** für drei Eroj.

## E – Eroj im Browser
- [ ] **T013 `kampo.spec.ts`**: Rolle, Name aus Label, Beschreibung help → error, `aria-required`, `aria-invalid`, Fehlertext live, Tab, `disabled` nicht fokussierbar, `readonly` fokussierbar, Stile `size × state`, Zeilenhöhe ≥ 24 px.
- [ ] **T014 Alirebleco** (axe in 8 Kombinationen, Fokusring), **Internacia** (RTL, +35 %/200 % für Label/Hilfe/Fehler, Pseudo-Lokalisierung).

## F – Abschluss
- [ ] **T015 e2e `s009-kampo.test.ts`** S2–S4 und Beispiel-Dialog; **T016** Vojmapo Zeile 4; Bericht.

## Messungen

| Was | Wert |
|---|---|
| `get_ero kampo brief:true`, Bytes / `ceil(Bytes/3)` | _(eintragen)_ |
| Parität | _(eintragen)_ |
| Alirebleco (Eroj) | _(eintragen)_ |
| Rote Fixtures beobachtet in Commit | _(Hash)_ |
