# Spec 014 – Eroj Runde 3 – Aufgaben

**Spec:** [`spec.md`](spec.md) · **Plan:** [`plan.md`](plan.md). Die Hashes aller Commits stehen je PR in **einer** Zeile der Messungen (nach einem Rebase dort und in der einen Schleife von `src/docs/docs.test.ts` ersetzen).

## ① Grundlage

**Branch:** `261017-spec-014-grundlage-d4f536` (von `main` @ `f6f38f5`) · Aufgaben ① zählen ab T701 (② ab T801, ③ ab T901, ④ ab T1001, ⑤ ab T1101).

### A – Rot zuerst
- [x] **T701 Spec** `specs/014-eroj-runde-3/spec.md` unverändert kopiert: `9a3194f`; Spec-Korrektur des Maintainers (19:54, Phosphor) erneut unverändert kopiert: Hash in den Messungen.
- [x] **T702 Tests** Gewicht (`data/navigado.test.ts`, `data/langetaro.test.ts`), `dialogo.reason-help` (`data/dialogo.test.ts`), `atributlisto layout auto` (`data/atributlisto.test.ts`, Projekcioj), Ikonaro (`contracts/spec014-schema.test.ts`, `data/ikonaro.test.ts`, `checks/ikonaro/index.test.ts` mit drei Fixtures), CI-Pin, README, Doku-Test (`docs/docs.test.ts`), Overlay-Messskript. Rot in `27e472d` (Modelo 28 Tests in 10 Dateien + 2 Suiten, Projekcioj 13 in 4 Dateien).
- [x] **T703 Korrektur Ikonaro (Maintainer 17.10., vor dem Grün)** Phosphor Icons (MIT) statt Lucide: komuna Stil regular, ekzemplo Stil fill, Herkunftsnachweis je Datei, Abbildung `ikonoj.names` im Aspekto-Paket, `check:ikonaro` prüft nur „quadratisch“ (plan ① D-04, Abweichungen 1–2). Rote Tests angepasst; Hash in den Messungen.

### B – Grün
- [x] **T704 Gewicht** Schema `weight`, `navigado`/`langetaro` Bindungen, Web Component (`font-weight` nur im aktuellen Fall), Figma (Schnitt je Aspekto, `fontStyle` an `font/style/semibold`, Schriften des Sets), Browser-Specs (D-01).
- [x] **T705 `reason-help`** Slot, Constraint, Uzo (Warnung), `help-is-one-sentence` ausgeweitet (fünf Eroj), vier Jugxoj `jug_01M55NWNH7K2SQJNZV10P42QS3`–`QS6`, Shadow-Markup (`slot="help"` des `tekstareo`), Browser-Spec (D-02).
- [x] **T706 `layout: auto`** Skemo (dritter Wert, Bindung wie `columns`), Uzo `columns-from`, Schema-Muster `size.container.*`, `uzo-prop-unknown`, Web Component (`#autoLayout`, ResizeObserver, `--fm-size-container-small`), Vitrino, Figma-Variante, React-Typ, Browser-Specs inkl. RTL (D-03).
- [x] **T707 Ikonaro** Schema `Ikono`/`IkonaroFile`/`iko_`, optionale Datendatei im Loader (Schema-Prüfung, IDs, Export), `data/ikonaro.json` (15 Namen; `menu` nach O-2 entfernt, ID stillgelegt), Glyphen komuna (Phosphor regular) und ekzemplo (Phosphor fill) mit Herkunftsnachweis und `ikonoj.names`, `check:ikonaro` (fünf Regeln, RULE_IDS 160, CHECK_NAMES, `pnpm check`, CI-Schritt, README), Ontologio Ikonaro/Ikono (D-04).
- [x] **T708 Tooltip-Kontrast** KontrastParo `text-inverse-on-background-inverse` war deklariert; bestätigt, kein neues Paar (D-05).
- [x] **T709 Overlay-Messung** Skript gelaufen (Chromium 153, Firefox 155, WebKit 26.6), Tabelle und Entscheidung für ④ in plan ① (D-06).

### C – Abschluss
- [x] **T710 Doku** plan ①, tasks ①, Vojmapo Zeile 4, README (Checks-Tabelle, Icon-Satz); Make-Guidelines unverändert (kein neues Ero in ①).
- [ ] **T711 Messungen** unten; Bericht.

### Messungen

| Was | Wert |
|---|---|
| Commits ① | rot `27e472d`, Korrektur Ikonaro `49d4697`, Spec-Korrektur `2b3ba25`, grün *(folgt)* |
| Ikonaro | 15 Namen (Grenze 25), 2 Aspektoj × 15 Glyphen, Phosphor `@phosphor-icons/core` 2.1.1 (MIT), Raster 256 |
| Overlay-Unterstützung | Popover-API und Anchor Positioning vollständig in allen drei Engines; nur `inset-area` (alter Name) fehlt überall |
| CI | *(folgt)* |

## ② Grundbausteine

*(folgt nach dem Merge von ①)*

## ③ Typografie

*(folgt)*

## ④ Overlays

*(folgt)*

## ⑤ Aufklappen

*(folgt)*
