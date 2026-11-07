# Spec 044 – Aufgaben

**Spec:** [`spec.md`](spec.md) · **Plan:** [`plan.md`](plan.md) · **Basis:** `main` `6a3e55e3`. Höchstens fünf Tickets (Spec, „Begrenzung der Laufzeit“). Rote Commits enden auf „(rot)“, grüne auf „(grün)“; Doku-Commits beginnen mit „Spec 044:“ und stehen allein. Häkchen mit SHAs.

Ein Strang, ein PR (T1 → T2 → T3 → T4 → T5). Lokal nur unter der Maschinen-Sperre (plan.md, A-09), `FM_AUSGABE=knapp`, nie zwei Playwright-Suiten gleichzeitig, je Wackel-Test höchstens 30 Wiederholungen.

| Ticket | Inhalt | Dateien | Stand | rot → grün |
|---|---|---|---|---|
| T1 | Messung vorher, Byte-Fixture vom Stand `main`, roter `stato`-Test; Gerüst `specs/044-pruefung-schnell/` | `specs/044-pruefung-schnell/{spec,plan,tasks}.md`, `packages/metiejo/src/{messung.ts,servilo.ts,vorschau.ts}`, neu `antworten-044.test.ts`, `messung-044.test.ts`, `stato-044.test.ts`, `test-doubles/antworten-044.json` | läuft | – |
| T2 | Geteilter Speicher je Entwurf+`rev` und Marke+`rev`+`propono`, Routen asynchron, `pruefTor` | `packages/metiejo/src/{ableitungen.ts,servilo.ts}`, ggf. `vorschau.ts`, `asistanto/iloj.ts`, neu `ableitungen-044.test.ts` | offen | – |
| T3 | Event-Loop frei (nur falls nach T2 nötig): Worker für die Prüfung, `previewCss` in Teilen | `packages/metiejo/src/{ableitungen.ts,vorschau.ts,servilo.ts}`, neues Worker-Modul, Test gegen `dist/` | offen | – |
| T4 | Byte-Gleichheit, Tests, Messung nachher, Diff-Suche (Test-Ticket) | `packages/metiejo/src/*-044.test.ts`, `specs/044-pruefung-schnell/{plan,tasks}.md` | offen | – |
| T5 | PR, ein Push, genau ein Dispatch, CI-Messung nachher (PR-Kommentar), Bericht | `specs/044-pruefung-schnell/{plan,tasks}.md` (nur vor dem Push) | offen | – |

## T1 im Einzelnen

- [ ] G-0: Quelle und Kopie 4282 Byte, SHA-256 `5bea3ab5a3d8ec94f9ee7fc5b16b55bdb30ffdfbf65ff767ffcab891f71810aa`, kopiert mit `cp`.
- [ ] CI vorher aus den Traces der Läufe 42252367951 und 42180054807 in plan.md.
- [ ] Byte-Fixture `antworten-044.json` auf unverändertem `6a3e55e3`, grün, zwei Läufe stabil, Rot mit geändertem Byte gesehen.
- [ ] Messpunkte nach V-2 in `servilo.ts`/`vorschau.ts`; `antworten-044` bleibt grün.
- [ ] `messung-044.test.ts` (nur Formprüfung).
- [ ] Messung lokal vorher unter der Sperre, Tabelle in plan.md.
- [ ] `stato-044.test.ts` rot.

## T2 im Einzelnen

## T3 im Einzelnen

## T4 im Einzelnen

## T5 im Einzelnen
