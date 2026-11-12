# Spec 049 – Bericht (Gründe für komuna: 24 Reguloj, 75 Entscheidungen)

Entwurf aus KIA-3.1 (2026-11-12). Abschnitt 1 wird nach dem einen Push und dem einen Dispatch in einem nur lokalen Commit gefüllt. Quellen: [`spec.md`](spec.md), [`plan.md`](plan.md) (Nachtrag 049), [`tasks.md`](tasks.md). Bilder und Messung liegen außerhalb des Repos unter `/Users/thorstenjankowski/n8n-compose/20260918_fundamento-ds/.fundamento/spec049/`.

## 1. PR, Commit, Dispatch, CI

<!-- PLATZHALTER KIA-4.1: PR-Link, Kopf-Commit, Dispatch-Lauf, CI je Job -->
- PR: _offen_
- Commit (Kopf des einen Pushs): _offen_
- Dispatch-Lauf: _offen_

| Job | Ergebnis | Notiz |
|---|---|---|
| _offen_ | | |

## 2. Bilder (keine Baselines)

Skript `pnpm --filter @fundamento/nodredaktilo bilder --ziel …`, Chromium 153, 1600×1000, hell. Gleiche Ansichten wie 048.

| Marke | zu | farbe-komponenten | ero-offen-geerbt |
|---|---|---|---|
| komuna | [komuna-zu.png](file:///Users/thorstenjankowski/n8n-compose/20260918_fundamento-ds/.fundamento/spec049/bilder/komuna-zu.png) | [komuna-farbe-komponenten.png](file:///Users/thorstenjankowski/n8n-compose/20260918_fundamento-ds/.fundamento/spec049/bilder/komuna-farbe-komponenten.png) | [komuna-ero-offen-geerbt.png](file:///Users/thorstenjankowski/n8n-compose/20260918_fundamento-ds/.fundamento/spec049/bilder/komuna-ero-offen-geerbt.png) |
| ekzemplo | [ekzemplo-zu.png](file:///Users/thorstenjankowski/n8n-compose/20260918_fundamento-ds/.fundamento/spec049/bilder/ekzemplo-zu.png) | [ekzemplo-farbe-komponenten.png](file:///Users/thorstenjankowski/n8n-compose/20260918_fundamento-ds/.fundamento/spec049/bilder/ekzemplo-farbe-komponenten.png) | [ekzemplo-ero-offen-geerbt.png](file:///Users/thorstenjankowski/n8n-compose/20260918_fundamento-ds/.fundamento/spec049/bilder/ekzemplo-ero-offen-geerbt.png) |
| provo | [provo-zu.png](file:///Users/thorstenjankowski/n8n-compose/20260918_fundamento-ds/.fundamento/spec049/bilder/provo-zu.png) | [provo-farbe-komponenten.png](file:///Users/thorstenjankowski/n8n-compose/20260918_fundamento-ds/.fundamento/spec049/bilder/provo-farbe-komponenten.png) | [provo-ero-offen-geerbt.png](file:///Users/thorstenjankowski/n8n-compose/20260918_fundamento-ds/.fundamento/spec049/bilder/provo-ero-offen-geerbt.png) |

## 3. Messung ([messung.json](file:///Users/thorstenjankowski/n8n-compose/20260918_fundamento-ds/.fundamento/spec049/messung.json))

Lokal, ein Lauf des unveränderten Skripts, Exit 0. „vorher“ = Bericht 048, „nachher“ = `messung.json` (049).

| Marke | Entscheidung / Mechanik / Übernahme | Entscheidungen ohne Grund vorher → nachher | geerbt vorher → nachher | kein Grund in der Kette vorher → nachher |
|---|---:|---:|---:|---:|
| komuna | 339 / 0 / 1776 | **75 → 0** | 832 → 909 (+77) | 77 → 0 |
| ekzemplo | 317 / 0 / 1798 | 156 → 156 | 1471 → 1471 | 308 → 308 |
| provo | 222 / 102 / 1809 | 160 → 160 | 1475 → 1475 | 308 → 308 |

Die Knotenarten sind unverändert (`knotenartDe` unberührt). Die 77 Übernahmen, die in 048 „kein Grund in der Kette“ hatten, erben jetzt den Grund einer 049-Regulo (z. B. `font.tracking.headline.1` → `font.tracking.scale.600`). Kein Knoten außerhalb der 75 hat seinen eigenen Kialo geändert (Test `grafeo-kialo-049` (d)). Aufklappen je Ebene 79–95 ms im Median, bis sichtbar komuna 321 ms (048: 334). Eine Messung, kein Budget.

## 4. Lückenliste je Gruppe ([luecken.json](luecken.json))

`luecken.json` (049) ist vom Skript geschrieben. komuna ist `{}`; ekzemplo und provo sind **id-gleich** mit `specs/048-nodredaktilo-grupoj-kialoj/luecken.json` (Vergleich mit `util.isDeepStrictEqual`).

| Gruppe | komuna vorher → nachher | ekzemplo | provo |
|---|---:|---:|---:|
| bewegung/palette | 5 → 0 | 10 → 10 | 10 → 10 |
| elevation/rollen | 6 → 0 | 6 → 6 | 6 → 6 |
| farbe/rollen/color/syntax | 5 → 0 | 5 → 5 | 5 → 5 |
| form/palette | 4 → 0 | 12 → 12 | 8 → 8 |
| form/rollen | 7 → 0 | 8 → 8 | 8 → 8 |
| raum/palette | 8 → 0 | 22 → 22 | 16 → 16 |
| raum/rollen | 9 → 0 | 12 → 12 | 12 → 12 |
| schrift/palette/family | 3 → 0 | 3 → 3 | 3 → 3 |
| schrift/palette/lineheight | 6 → 0 | 6 → 6 | 6 → 6 |
| schrift/palette/tracking | 13 → 0 | 13 → 13 | 13 → 13 |
| schrift/palette/weight | 9 → 0 | 9 → 9 | 9 → 9 |
| übrige Gruppen (nur ekzemplo/provo) | 0 → 0 | 50 → 50 | 64 → 64 |
| **Summe** | **75 → 0** | **156 → 156** | **160 → 160** |

## 5. Die 24 Reguloj (Name → Tokens)

Alle in `packages/aspekto-komuna/reguloj.json`, `aspekto: "komuna"`, `manual`. Ids `reg_01M7610SVZTWGTRP9088GZQ9P9` … `reg_01M7610SW0468972WKNSC1Y3P1` in `packages/aspekto-komuna/ids.lock.json`.

| # | Regulo | Tokens |
|---|---|---|
| B1 | `komuna-dauer-null` | `motion.duration.scale.0` |
| B2 | `komuna-kurven` | `motion.easing.curve.*` |
| E1 | `komuna-ebenen` | `elevation.layer.*` |
| S1–S5 | `komuna-syntax-schluesselwort` · `-name` · `-zeichenkette` · `-zahl` · `-kommentar` | `color.syntax.keyword` · `name` · `string` · `number` · `comment` |
| F1 | `komuna-randbreiten` | `border.width.scale.*` |
| F2 | `komuna-rand-betont` | `border.width.strong` |
| R1–R5 | `komuna-rundung-bedienelement` · `-mehrzeilig` · `-pille` · `-flaeche` · `-tag` | `radius.role.control` · `multiline` · `pill` · `surface` · `tag` |
| R6 | `komuna-strichart` | `stroke.*` |
| G1 | `komuna-groessen` | `size.scale.*` |
| G2 | `komuna-spalten` | `layout.columns.*` |
| G3 | `komuna-umbrueche` | `size.breakpoint.*` |
| G4 | `komuna-container` | `size.container.*` |
| T1 | `komuna-schriftfamilien` | `font.family.*` |
| T2 | `komuna-zeilenhoehen` | `font.lineheight.scale.*` |
| T3 | `komuna-laufweite` | `font.tracking.scale.*` |
| T4 | `komuna-schriftgewichte` | `font.weight.*` |

**Drei Tokens außerhalb der 75 treffen ein Muster:** `size.scale.700`, `size.scale.800`, `motion.easing.curve.smooth`. Sie behalten ihren Grund aus `deveno.json` (`deveno` gewinnt im Graphen); ihr Feld `regulo` nennt jetzt die 049-Regulo. Die Knotenart ist unverändert.

## 6. Befunde und Abweichungen

- **F-049-1 / B-1 (Maintainer 2026-11-11, Option A):** `describe` zählt Paket-Reguloj. Im 038-Fixture war genau `describe/standard` rot und wurde nach dem Verfahren aus 047 fortgeschrieben (eigener Commit `7c38abc8`; Kontroll-Lauf reproduziert alle 114 Einträge byte-gleich). Abweichung: Neben `reguloj.count` und dem Satz ändert sich auch `reguloj.withKialo` (62 → 86); `bytes` bleibt 1882.
- **B-2 (AC-9):** `explain` ohne Aspekto setzt den Default `komuna` ein und nennt die Regulo deshalb. Mit `aspekto: "ekzemplo"` erscheint sie nicht. Der Test prüft dieses Verhalten. `list_reguloj` ohne Aspekto blendet sie weiter aus.
- **B-3:** Die Zahl in `checks/regularo/index.test.ts` wird jetzt aus Kern und Paket-Reguloj abgeleitet (Tabelle in `tasks.md`). Das ist eine zweite Änderung an einem bestehenden Test neben `NOT_CHECKABLE`, entgegen dem Wortlaut von AC-4.
- **B-4:** Der metiejo-Test liest `specs/048-…/luecken.json` nicht, weil `turbo.json` den Pfad für metiejo nicht hasht. Er baut den Vorher-Stand im Speicher; der modelo-Test vergleicht mit der 048-Liste.
- **F-KIA2-1 (Maintainer 2026-11-11):** `fm modelo validate` meldete 48 × `traduko-missing`. `tradukoj.ts` hielt komunas Reguloj wegen ihrer Ids ohne Namensraum für Kern-Texte. Fix außerhalb der ursprünglichen Frei-Liste: `packages/modelo/src/lingvo/tradukoj.ts:72` filtert zusätzlich `regulo.aspekto === undefined`. Dazu kommt der neue Test `tradukoj-049.test.ts` (erst rot, dann grün). `data/tradukoj.json` bleibt unverändert.
- **F-KIA2-2 (Maintainer 2026-11-12):** Der Kialo von T4 nannte ein Design-Werkzeug, was AK-12 (Art. VIII) in Regulo-Texten verbietet. Er wurde zu „…damit Web und Design-Werkzeug dieselbe Zahl verstehen…“ geändert. Die Prüfung bleibt unverändert.
- **F-049-2 / Q-5 (offen):** `packages/aspekto-komuna/package.json` führt `reguloj.json` nicht in `files`. Ein veröffentlichtes npm-Paket trüge die Gründe nicht. Das Repo liest den Ordner direkt, deshalb sind die Tests grün.
- **F-KIA1-2:** Über alle Knoten hatte komuna vor 049 142 Knoten mit `kialoDe` = `neniu`; 048 zählte 77 nur bei Übernahmen. Nachher zeigt `bilder` 0 Übernahmen ohne Grund in der Kette.
- **Lokale Läufe:** Von den 10 betroffenen Paketen sind 9 grün (`--concurrency=1`). In `projekcioj` liefen 2 Tests unter Last in die Zeitgrenze (`komuna-fonto` ①-6, `figma-cxiuj`); allein laufen beide grün. Keine Grenze wurde angehoben.

## 7. Was der Maintainer als Nächstes tut

1. Den PR prüfen (Link in Abschnitt 1), vor allem die 24 Statements. Sie sind aus der Spalte „Wert“ von §5 formuliert und waren nicht Teil der Freigabe: `/Users/thorstenjankowski/.purple-code/worktrees/fundamento-wt-mwccryipy9hehhxi/repos/fundamento/packages/aspekto-komuna/reguloj.json`.
2. Die Code-Änderung außerhalb der Frei-Liste gegenlesen: `/Users/thorstenjankowski/.purple-code/worktrees/fundamento-wt-mwccryipy9hehhxi/repos/fundamento/packages/modelo/src/lingvo/tradukoj.ts:72`.
3. Den lokalen KIA-4.1-Commit (`Spec 049 KIA-4.1: Bericht – PR, CI je Job`, Branch `261111-spec-049-grnde-fr-komun-c9d179`) pushen oder übernehmen.
4. Q-5 entscheiden: `reguloj.json` in `files` von `packages/aspekto-komuna/package.json` aufnehmen (eigener kleiner PR).
5. Die nächsten Gründe planen: ekzemplo (156) und provo (160) nach `/Users/thorstenjankowski/.purple-code/worktrees/fundamento-wt-mwccryipy9hehhxi/repos/fundamento/specs/049-kialoj-komuna/luecken.json`, oder Kern-Gründe in einem eigenen Lauf heben.
