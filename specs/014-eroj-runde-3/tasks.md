# Spec 014 – Eroj Runde 3 – Aufgaben

**Spec:** [`spec.md`](spec.md) · **Plan:** [`plan.md`](plan.md). Die Hashes aller Commits stehen je PR in **einer** Zeile der Messungen (nach einem Rebase dort und in der einen Schleife von `src/docs/docs.test.ts` ersetzen).

## ① Grundlage

**Branch:** `261017-spec-014-eroj-runde-3-d4f536` (von `main` @ `f6f38f5`) · Aufgaben ① zählen ab T701 (② ab T801, ③ ab T901, ④ ab T1001, ⑤ ab T1101).

### A – Rot zuerst
- [x] **T701 Spec** `specs/014-eroj-runde-3/spec.md` unverändert kopiert: `9a3194f`; Spec-Korrektur des Maintainers (19:54, Phosphor) erneut unverändert kopiert: Hash in den Messungen.
- [x] **T702 Tests** Gewicht (`data/navigado.test.ts`, `data/langetaro.test.ts`), `dialogo.reason-help` (`data/dialogo.test.ts`), `atributlisto layout auto` (`data/atributlisto.test.ts`, Projekcioj), Ikonaro (`contracts/spec014-schema.test.ts`, `data/ikonaro.test.ts`, `checks/ikonaro/index.test.ts` mit drei Fixtures), CI-Pin, README, Doku-Test (`docs/docs.test.ts`), Overlay-Messskript. Rot in `27e472d` (Modelo 28 Tests in 10 Dateien + 2 Suiten, Projekcioj 13 in 4 Dateien).
- [x] **T703 Korrektur Ikonaro (Maintainer 17.10., vor dem Grün)** Phosphor Icons (MIT) statt Lucide: komuna Stil regular, ekzemplo Stil fill, Herkunftsnachweis je Datei, Abbildung `ikonoj.names` im Aspekto-Paket, `check:ikonaro` prüft nur „quadratisch“ (plan ① D-04, Abweichungen 1–2). Rote Tests angepasst; Hash in den Messungen.

### B – Grün
- [ ] **T704 Gewicht** Schema `weight`, `navigado`/`langetaro` Bindungen, Web Component (D-01).
- [ ] **T705 `reason-help`** Slot, Constraint, Uzo, Regel ausgeweitet, vier Jugxoj (D-02).
- [ ] **T706 `layout: auto`** `UzoLayout.columns-from`, ResizeObserver (D-03).
- [ ] **T707 Ikonaro** Schema `Ikono`/`IkonaroFile`/`iko_`, optionale Datendatei im Loader, `data/ikonaro.json` (15 Namen; `menu` nach O-2 entfernt, ID stillgelegt), Glyphen komuna (Phosphor regular) und ekzemplo (Phosphor fill) mit Herkunftsnachweis und `ikonoj.names`, `check:ikonaro` mit CI-Pin, Ontologio Ikonaro/Ikono (D-04). *Daten, Glyphen, Schema und Loader stehen; Check und Ontologio folgen.*
- [ ] **T708 Tooltip-Kontrast** KontrastParo `text-inverse-on-background-inverse` (D-05).
- [ ] **T709 Overlay-Messung** Skript, Tabelle in plan ① (D-06).

### C – Abschluss
- [ ] **T710 Doku** plan ①, tasks ①, Vojmapo Zeile 4, README, Make-Guidelines.
- [ ] **T711 Messungen** unten; Bericht.

### Messungen

| Was | Wert |
|---|---|
| Commits ① | rot `27e472d`, Korrektur Ikonaro `49d4697`, Spec-Korrektur *(Hash folgt)*, grün *(folgt)* |
| Ikonaro | 15 Namen (Grenze 25), 2 Aspektoj × 15 Glyphen, Phosphor `@phosphor-icons/core` 2.1.1 (MIT), Raster 256 |
| Overlay-Unterstützung | *(folgt)* |
| CI | *(folgt)* |

## ② Grundbausteine

*(folgt nach dem Merge von ①)*

## ③ Typografie

*(folgt)*

## ④ Overlays

*(folgt)*

## ⑤ Aufklappen

*(folgt)*
