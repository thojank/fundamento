# Spec 029 ① – Fonto Astryx: Grundlagen – Plan

**Spec:** [`spec.md`](spec.md) (Fassung vom 2026-10-23, unverändert kopiert; SHA-256 `36ac8edf…bfd30a710a`) · **Basis:** `main` nach dem Merge von Spec 027 (#109, `d29a5206`) · **Regel 0** gilt: der Weg, den das Repo schon geht, sonst die kleinste Änderung mit Eintrag hier. **Kein Budget angehoben.** **Nichts weggeworfen:** die heutige komuna steht unverändert als `komuna-0-2` daneben.

**Branch:** `261023-spec-029-fonto-astryx-grundlagen` (von `main` `d29a5206`) · **Datum:** 2026-10-23 · **Stand:** ① gebaut, Abnahme offen. ②a startet in Sitzung B; ②b und ③ stapeln nach der Entscheidung zu ②a auf diesen Branch.

**Entscheidungen vom 24.10.** ([`briefing-a-2026-10-24.md`](briefing-a-2026-10-24.md), unverändert kopiert; Maintainer, 10:37: „alles wie empfohlen“): ①-1 bis ①-5 beantworten O-1 bis O-5 (unten), **①-6 ist in diesem PR nachgezogen:** die Überschriften von provo stehen in 400, dem einzigen Gewicht von Prata (B-2). ①-2 und ①-7 kommen in ②b, ①-3 nach ②b, ①-4 im Querschnitt Q. Danach wartet ① auf die Abnahme durch den Maintainer (Vitrino, Figma); gemergt wird erst danach.

### Zusammenfassung

| # | Punkt der Spec | Was jetzt gilt |
|---|---|---|
| A | Constitution Amendment v2.4 | Art. V Absatz „Fonto (offene Quelle)“ mit den sieben Bedingungen, Art. VII Herkunft je Wert, Clean-Room-Ausnahme, Terminologie **Fonto**, Änderungshistorie; die Ontologio kennt die Fonto (22. Begriff). |
| B | Fonto gepinnt | `packages/modelo/data/fontoj.json`: astryx, `@astryxdesign/core` und `@astryxdesign/theme-neutral` **0.7.4** mit Integrität, Tag `v0.7.4`, Commit `704757fd827c6fa00a71af80b06d5da99d155e45`. `THIRD_PARTY_NOTICES.md` mit Copyright und MIT-Text. Prüfung **`check:fontoj`** in `pnpm check` und CI. |
| ①1 | komuna-0-2 | Neues Paket `packages/aspekto-komuna-0-2` (Namespace `malnova`): die heutige komuna als vollständiges eigenes Set mit Dunkel-Set, Schriften, Ikonaro und Aspiroj. Im Build mit allen Marken, umschaltbar in Vitrino, Studio (Basis „komuna-0-2“) und Figma (fünfter Modus). **pixelgleich:** in allen 72 Kombinationen jeder der 1 608 Werte wie komuna auf `main` (Test), Bildvergleich der Vitrino unten. |
| ①2 | komuna nach theme-neutral | Farbe, Typografie-Skala (Basis 14, Verhältnis 1,2; Touch und schmal: Basis 16, 1,1736), Abstände, Elementgrößen 28/32/36, Radien 6/10/12/28, Elevation mit dunkler Lichtkante, Fokus 2 px mit 3 px Abstand, Bewegung 125/300/700 ms und die Kurve der Fonto. **Familien bleiben Geist und Geist Mono.** 405 Werte mit Herkunft in `packages/aspekto-komuna/deveno.json`. |
| ①3 | provo mit Prata | `font.family.display` von provo ist `Prata, ui-serif, serif` (OFL-1.1), neu abgeleitet. **①-6:** die sieben Überschriften-Rollen (`typography.display.1–3`, `typography.headline.1–4`) stehen in 400, dem einzigen Gewicht von Prata (`tiparoj.json`), festgelegt im Agordo von provo; jeder andere Wert von provo gleich (Test). |
| ①4 | Regeln gewinnen | Alle Prüfungen grün für komuna, komuna-0-2, ekzemplo, provo, provo-kompakta. 45 Werte der Fonto angepasst, festgehalten in 7 Jugxoj von komuna (`packages/aspekto-komuna/jugxoj.json`), dazu eine achte für die Rundung auf die Stufen von Fundamento. **Jugxo-Liste unten.** |
| ①5 | Foundation-Seiten | Acht Abschnitte der Vitrino: Tokens (alle 1 608, Suche, Ebene, Wert je Marke hell/dunkel, Herkunft), Farbe, Elevation, Form, Abstände, Typografie, Bewegung, Icons – eigene Texte deutsch und englisch, Lingvo-Schalter, gewählte Marke. |
| F | Figma | Das Plugin heißt **„Fundamento Grundlagen 0.2.0 (‹Build› · ‹Marken›): apply plan“**, ID `fundamento-grundlagen-‹Hash›`, getrennt von „Fundamento Bauformen …“ (027) und „Fundamento 0.2.0 (…)“. Der Build mit allen Marken hat fünf Modi. Eine Schattenschicht, die in einem Modus innen liegt, ist ein INNER_SHADOW. |

**Dauer des Plugin-Laufs** (im selben Double, Median aus fünf Läufen, abwechselnd): siehe [Messungen](#messungen).

### Constitution Amendment v2.4

Der Text der Spec steht wörtlich in `.specify/memory/constitution.md`, Version 2.4 vom 2026-10-23 (freigegeben vom Maintainer am 23.10., 21:56):

- **Terminologie:** Zeile **Fonto** (`packages/modelo/data/fontoj.json`, `THIRD_PARTY_NOTICES.md`); die Ontologio hat den Begriff mit eo/en/de und Definition (`check` der Ontologio: 22 Begriffe der Tabelle).
- **Art. V:** Absatz „Fonto (offene Quelle)“ nach „Benchmark-Aspekto“, die sieben Bedingungen, die Regel zum Quellmaterial (nur gepinnt) und der Satz zur Clean-Room-Prüfung. Die Regel „Quellmaterial anderer Systeme wird dem Coding-Tool nicht vorgelegt“ nennt die Fonto als Ausnahme.
- **Art. VII:** „Jeder aus einer Fonto übernommene Wert hat als Herkunft die Fonto-ID und den Quellpfad (Datei, Schlüssel).“
- **Governance:** Eintrag v2.4 mit Grund und Migration.

Migration, wie in der Spec:
- `data/fontoj.json` (Pfad `packages/modelo/data/fontoj.json`, Schema `FontojFile`) und `THIRD_PARTY_NOTICES.md` angelegt.
- `check:fontoj` meldet `fonto-unknown`, `fonto-unpinned`, `fonto-notice-missing`, `deveno-token-unknown`, `deveno-stale` und `deveno-jugxo-missing` (Fixtures `fontoj-registro`, `fontoj-deveno`).
- `check:clean-room` lässt den `$value` eines Tokens mit gültigem Fonto-Nachweis aus und durchsucht `deveno.json` nicht (Fixture `clean-room-fonto`: der Wert mit Nachweis besteht, der ohne wird gemeldet). Der Benchmark Carbon bleibt unverändert.

### Die Fonto, gepinnt

| | |
|---|---|
| Pakete | `@astryxdesign/core` 0.7.4 (`sha512-zd/XfUw8…oay1w==`), `@astryxdesign/theme-neutral` 0.7.4 (`sha512-IoGRxRpc…BtBtw==`), von npm am 2026-10-23 |
| Repo | https://github.com/facebook/astryx, Tag `v0.7.4` = Commit `704757fd827c6fa00a71af80b06d5da99d155e45` („chore: version packages for v0.7.4 (#7973)“, 2026-10-23 16:28 UTC) |
| Abgleich | `src/neutralTheme.ts`, `neutralPalettes.ts`, `neutralPalettes.generated.ts` und `source.ts` im Tarball sind byte-gleich mit dem Commit; `LICENSE` des Repos gleich der des Pakets |
| Lizenz | MIT, Copyright (c) 2026 Meta Platforms, Inc. |
| Gelesen | die Werte des Themes (`neutralTheme.ts`, aufgelöst in `dist/theme.css`), die Paletten (`neutralPalettes.generated.ts`, als JSON gelesen), die Grundwerte des Core (`src/theme/tokens.stylex.ts`), die Gliederung der Grundlagen-Doku (`packages/cli/assets/docs/*.doc.mjs`, nur Titel) und die Tokens einzelner Komponenten (Button, Feld, Link, Navigation) für die Zuordnung zu Rollen |
| Nicht gelesen | andere Systeme, fremde Marken, andere Versionen; kein Code der Fonto ausgeführt |

Die Werte erzeugt `scripts/fonto-astryx/schreiben.mjs` aus dem Tarball (Aufruf in der Messanleitung); die Anpassungen stehen in `scripts/fonto-astryx/anpassoj.json`. Ein zweiter Lauf auf `main` ergibt dieselben Dateien.

„Astryx“ und „Meta“ stehen nur in der Herkunft: `fontoj.json`, `deveno.json`, `jugxoj.json` (Kontext), `THIRD_PARTY_NOTICES.md`, Constitution-Historie, Spec, plan, tasks. In der Vitrino erscheint die Fonto-ID nur in der Spalte „Herkunft“ der Token-Tabelle (aus den Daten), nie im Text; CSS, Figma-Plan, Make Kits und Gvidanto-Texte nennen sie nicht.

### komuna-0-2

- Paket `packages/aspekto-komuna-0-2`, `@fundamento/aspekto-komuna-0-2`, Aspekto `komuna-0-2`, `idNamespace` `malnova` (Ziffern sind im Namespace nicht erlaubt).
- `sets/aspekto/komuna-0-2.json`: der Kern von `main` als vollständige Belegung (alle 1 608 Tokens, Ero-Tokens als Aliase wie im Kern, `textTransform` des Kickers), ohne IDs und Beschreibungen (`set-override-has-extensions`).
- `sets/aspekto/komuna-0-2+color-scheme/dark.json`: das Dunkel-Set von komuna auf `main`.
- `aspekto.json`: Schriften, Ikonaro (Phosphor regular) und Aspiroj von komuna; `ikonoj/` mit LICENSE.
- Die gemeinsamen Dimensions-Sets des Kerns (Dunkel, Kontrast, Dichte, Breite, Bewegung) sind **unverändert**. Darum löst komuna-0-2 in jeder Kombination auf wie komuna vorher: Test `packages/projekcioj/src/fonto/komuna-0-2.test.ts` gegen `komuna-main.json` (je Kombination ein SHA-256 über Name, Typ und Wert aller 1 608 Tokens, auf `main` erzeugt und mit `fm modelo export` von `main` abgeglichen: 0 Abweichungen).
- Pixelvergleich in der Vitrino: [Messungen](#messungen).

### Werte von komuna

Zuordnung (die vollständige Liste mit Datei, Schlüssel, Wert der Fonto und Art steht je Token in `deveno.json`; die Vitrino zeigt sie in der Token-Tabelle):

| Grundlage | Fundamento | Fonto |
|---|---|---|
| Paletten | `neutral` 0 … 1000, `accent` = neutral (der Akzent der Fonto ist neutral), `success` grün, `warning` gelb, `danger` rot, `info` blau | Rampen der Fonto in Fünferschritten: Stufe *s* von Fundamento = Stufe 100 − *s*/10 der Fonto; 25 als Mitte in OKLab, 975 eine halbe Stufe über 5 hinaus (Schwarz ist Anker). Je Stufe die helle oder die dunkle Rampe der Fonto, je nachdem, welche ihre Rollen in dem Modus nehmen. |
| Rollen hell/dunkel | Flächen, Text, Rahmen, Aktionen, Navigation, Status, Marke, Fokus, Schatten, Hintergrund | die Tokens des Themes (`--color-background-*`, `--color-text-*`, Button-Varianten mit ihren Überlagerungen, Badge- und Banner-Farben, …), Details je Token in `deveno.json` |
| Typografie | Skala 10/12/14/17/20/24/29/35/42 px (+ 50/60/72 weitergerechnet), Rollen nach den Rollen der Fonto (display-1…3, heading-1…4, body, supporting, label, code; kicker = heading-5), Zeilenhöhen je Rolle, Gewichte | `typography.scale {base: 14, ratio: 1.2}`; bei schmaler Breite (`viewport=compact`) die Anpassung für Touch und schmale Breite {base: 16, ratio: 1.1736} |
| Abstände | Skala unverändert (2 … 48 px) | `--spacing-*` der Fonto, gleiche Werte |
| Elementgrößen | `size.control` 28/32/36 px; Dichte kompakt 24/28/32, großzügig 32/36/40 | `--size-element-sm/md/lg`; Dichte abgeleitet |
| Radien | 6 / 10 / 12 / 28 px (small, medium, large, xlarge); Rollen Element 10, Fläche 12 | `--radius-inner/element/container/page` |
| Elevation | raised = low, overlay = med, floating und modal = high; dunkel mit 1 px Lichtkante innen | `--shadow-low/med/high` hell und dunkel |
| Fokus | Ring 2 px in der Farbe der Aktion, Abstand 3 px | `--focus-outline-*` |
| Bewegung | 125 / 300 / 700 / 935 ms, `standard` = cubic-bezier(0.24, 1, 0.4, 1) | `motion {fast: 125, medium: 300, slow: 700}`, `--ease-standard` |
| Deckkraft | deaktiviert 0,5, hover 0,05, gedrückt 0,10 | Button disabled, Überlagerungen |

Nicht übernommen: Schriftfamilie (Figtree, Familien bleiben die von komuna), Icons (Lucide; das Ikonaro bleibt Phosphor), Laufweite (die Fonto hat keine; komuna behält ihre), die dekorativen Familien teal, cyan, purple, pink, orange (Fundamento hat dafür keine Grundlagen), Datenvisualisierung (nicht Teil der Spec; die Fonto hat sie, also kein Manko-Kandidat), Syntax-Farben (Abweichung 4).

### Jugxo-Liste

45 Werte der Fonto sind angepasst, weil eine Regulo, ein Aspiro von komuna oder ein früherer Befund gewinnt; 39 Werte liegen zwischen zwei Stufen von Fundamento und nehmen die nächste. Alle Jugxoj gehören zu komuna (`packages/aspekto-komuna/jugxoj.json`, `decision: deviation-recorded`), jede nennt im Kontext ihre Werte; `deveno.json` nennt je Wert die Jugxo.

**J1 `jug_01M5N89C1TWQ57VAQD0V6V4KR7` – Regulo `surface-distinct`** (5 Werte)

Die Fonto legt Fläche und Karte als reines Weiß auf eine Seite in Stufe 95. Das Aspiro oklch-l-extreme von komuna hält jede Fläche 0,02 von Weiß und Schwarz entfernt, und surface-distinct verlangt 0,02 zwischen benachbarten Flächen. Die Regel gewinnt (Art. V, Fonto 5): die Karte ist die hellste erlaubte Stufe (97,5), die Fläche Stufe 95, die Seite 90, die vertiefte Fläche 85; die inverse Fläche im Dunkeln 97,5 statt Weiß.

| Token | Modus | Fonto | komuna |
|---|---|---|---|
| `color.background.canvas` | hell | #f1f1f1 | neutral.100 |
| `color.background.default` | hell | #ffffff | neutral.50 |
| `color.background.raised` | hell | #ffffff | neutral.25 |
| `color.background.sunken` | hell | #f1f1f1 | neutral.150 |
| `color.background.inverse` | dunkel | #ffffff | neutral.25 |

**J2 `jug_01M5N89C1WQ308F9302JTZRVZE` – Regulo `surface-order`** (2 Werte)

Im Dunkeln liegen bei der Fonto Seite, Karte und vertiefte Fläche auf Stufe 10 unter der Fläche (15). surface-order verlangt sunken ≤ canvas ≤ default ≤ raised, surface-distinct 0,02 Abstand: die Karte ist eine Stufe heller als die Fläche (20), die vertiefte Fläche eine dunkler als die Seite (5).

| Token | Modus | Fonto | komuna |
|---|---|---|---|
| `color.background.raised` | dunkel | #1b1b1b | neutral.800 |
| `color.background.sunken` | dunkel | #1b1b1b | neutral.950 |

**J3 `jug_01M5N89C1WQ308F9302JTZRVZF` – Regulo `text-hierarchy`** (4 Werte)

Das zweite und dritte Textgewicht der Fonto fallen im Dunkeln auf dieselbe Stufe (65), und hell hält das dritte (icon-secondary) auf der vertieften Fläche keine 4,5:1. text-hierarchy verlangt drei unterscheidbare Gewichte mit 0,05 Abstand und fallendem Kontrast, die Alirebleco 4,5:1 mit der Reserve von komuna: hell rücken beide eine Stufe dunkler (20 und 30), dunkel das zweite eine heller (80). Den Text im Dunkeln setzt die Fonto reinweiß; reines Weiß überstrahlt auf dunkler Fläche (Befund R4 von komuna, Halation): Stufe 97,5.

| Token | Modus | Fonto | komuna |
|---|---|---|---|
| `color.text.default` | dunkel | #ffffff | neutral.25 |
| `color.text.subtle` | hell | #474747 | neutral.800 |
| `color.text.subtle` | dunkel | #9e9e9e | neutral.200 |
| `color.text.muted` | hell | #6a6a6a | neutral.700 |

**J4 `jug_01M5N89C1WQ308F9302JTZRVZG` – Art. X** (5 Werte)

Der Feldrahmen der Fonto (border-emphasized: 85 hell, 35 dunkel) hat auf den Flächen 1,0–2,0:1. Ein Rahmen, der ein Feld erkennbar macht, braucht nach WCAG 1.4.11 3:1, für komuna mit 10 % Reserve (Aspiro wcag2-reserve), auf jeder Fläche: hell Stufe 40, dunkel 60; der Rahmen auf der inversen Fläche Stufe 50. Der feine Rahmen der Fonto ist hell 8 % Schwarz, dunkel 10 % Weiß; ein Paint in Figma trägt eine Deckkraft für alle Modi (Parität, Art. X): dunkel 8 % Weiß.

| Token | Modus | Fonto | komuna |
|---|---|---|---|
| `color.border.default` | hell | #d4d4d4 | neutral.600 |
| `color.border.default` | dunkel | #525252 | neutral.400 |
| `color.border.subtle` | dunkel | #ffffff 10.2 % | tint.8 |
| `color.border.inverse` | hell | #525252 | neutral.500 |
| `color.border.inverse` | dunkel | #d4d4d4 | neutral.500 |

**J5 `jug_01M5N89C1WQ308F9302JTZRVZH` – Regulo `state-distinct`** (18 Werte)

Die Fonto zeigt hover und gedrückt mit 5 % und 10 % Überlagerung. Das ändert die Helligkeit um weniger als 0,02; state-distinct verlangt 0,05, und eine Stufe der Fonto hat 0,043. Die Zustände gehen deshalb eine oder zwei Stufen weiter, in der Richtung der Fonto, wo der Kontrast der Schrift es erlaubt, sonst in der anderen; reines Schwarz verbietet das Aspiro oklch-l-extreme, und die zweite Aktion bleibt im Dunkeln gedrückt auf der Stufe von hover, damit weiße Schrift 4,5:1 hält. Die gewählte dritte Aktion ist bei der Fonto eine Überlagerung; eine dauerhafte Wahl ist bei Fundamento eine Fläche (Befund Spec 004): deckend, die Überlagerung der Fonto auf der Fläche.

| Token | Modus | Fonto | komuna |
|---|---|---|---|
| `color.action.primary.hover` | hell | #1a1a1a | neutral.975 |
| `color.action.primary.hover` | dunkel | #f2f2f2 | neutral.150 |
| `color.action.primary.pressed` | hell | #181818 | neutral.975 |
| `color.action.primary.pressed` | dunkel | #f2f2f2 | neutral.200 |
| `color.action.primary.selected` | hell | #181818 | neutral.975 |
| `color.action.primary.selected` | dunkel | #f2f2f2 | neutral.200 |
| `color.action.secondary.hover` | hell | #e4e4e4 | neutral.150 |
| `color.action.secondary.hover` | dunkel | #464646 | neutral.600 |
| `color.action.secondary.pressed` | hell | #d8d8d8 | neutral.200 |
| `color.action.secondary.pressed` | dunkel | #505050 | neutral.600 |
| `color.action.secondary.selected` | hell | #d8d8d8 | neutral.200 |
| `color.action.secondary.selected` | dunkel | #505050 | neutral.600 |
| `color.action.tertiary.selected` | hell | #000000 10.2 % | neutral.150 |
| `color.action.tertiary.selected` | dunkel | #ffffff 10.2 % | neutral.700 |
| `color.action.danger.hover` | hell | #ffc0ba | danger.50 |
| `color.action.danger.hover` | dunkel | #622f2b | danger.900 |
| `color.action.danger.pressed` | hell | #ffbdb7 | danger.25 |
| `color.action.danger.pressed` | dunkel | #6a322f | danger.950 |

**J6 `jug_01M5N89C1WQ308F9302JTZRVZJ` – Regulo `contrast-reserve`** (8 Werte)

Weiß auf den Füllungen der Fonto für Erfolg, Fehler und Info (gerundet auf Stufe 50) hält keine 4,5:1 mit der Reserve von komuna, die Status-Ränder der Fonto (80/85) keine 3:1, und rote Schrift auf roter Fläche im Dunkeln keine 4,95:1. Füllungen und Ränder rücken auf Stufe 40 ihrer Rampe, die rote Schrift im Dunkeln auf 85.

| Token | Modus | Fonto | komuna |
|---|---|---|---|
| `color.status.success.basic` | hell | #198100 | success.600 |
| `color.status.success.border` | hell | #aad4a9 | success.600 |
| `color.status.warning.border` | hell | #e3c36c | warning.600 |
| `color.status.danger.basic` | hell | #c9303a | danger.600 |
| `color.status.danger.text` | dunkel | #ffaea7 | danger.150 |
| `color.status.danger.border` | hell | #ffaea7 | danger.600 |
| `color.status.info.basic` | hell | #0074e2 | info.600 |
| `color.status.info.border` | hell | #a1caff | info.600 |

**J7 `jug_01M5N89C1WQ308F9302JTZRVZK` – Regulo `type-rhythm`** (3 Werte)

Bei Touch und schmaler Breite wächst bei der Fonto die Zeilenhöhe von display-2 zu display-1 und von supporting (14 px) zu body und label (16 px). type-rhythm verlangt in jeder Familie eine mit der Größe fallende Zeilenhöhe: display.1 nimmt 1,2222, body.2 und label.2 nehmen 1,5.

| Token | Modus | Fonto | komuna |
|---|---|---|---|
| `font.lineheight.display.1` | schmal | 1.2381 | 1.2222 |
| `font.lineheight.body.2` | schmal | 1.4286 | 1.5 |
| `font.lineheight.label.2` | schmal | 1.4286 | 1.5 |

**J8 `jug_01M5N89C1WQ308F9302JTZRVZM` – Art. IV** (39 Werte)

Die Fonto hat 21 Stufen je Rampe in Schritten von 5, Fundamento 17 (neutral) und 16; Rollen zeigen auf Stufen (Art. IV, semantic-colors-alias-palette). Ein Wert der Fonto zwischen zwei Stufen von Fundamento (65, 45, 35, 25, die Füllfarben außerhalb der Rampen, Überlagerungen) nimmt die nächste Stufe in ΔE2000; neue Stufen hätten jede Marke geändert. Die durchsichtigen Überlagerungen nehmen die nächste Deckkraft von shade/tint.

| Token | Modus | Fonto | komuna |
|---|---|---|---|
| `color.background.inverse` | hell | aus dem Kern der Fonto (nicht theme-neutral) | neutral.950 |
| `color.text.muted` | dunkel | #9e9e9e | neutral.300 |
| `color.text.disabled` | dunkel | #525252 | neutral.700 |
| `color.link.hover` | hell | #171717 | neutral.900 |
| `color.border.disabled` | dunkel | #525252 | neutral.700 |
| `color.action.primary.disabled` | hell | #8d8d8d | neutral.400 |
| `color.action.primary.disabled` | dunkel | #8b8b8b | neutral.400 |
| `color.action.secondary.rest` | dunkel | #3c3c3c | neutral.700 |
| `color.action.tertiary.hover` | hell | #000000 5.1 % | shade.8 |
| `color.action.tertiary.hover` | dunkel | #ffffff 5.1 % | tint.8 |
| `color.action.danger.rest` | dunkel | #5b2b28 | danger.800 |
| `color.action.danger.text` | hell | #76000c | danger.700 |
| `color.navigation.text.rest` | dunkel | #9e9e9e | neutral.300 |
| `color.shadow.key` | dunkel | #000000 30.2 % | shade.25 |
| `color.shadow.ambient` | hell | #000000 5.1 % | shade.8 |
| `color.shadow.ambient` | dunkel | #ffffff 5.1 % | tint.8 |
| `color.backdrop` | dunkel | #000000 80 % | shade.50 |
| `color.status.success.basic` | dunkel | #64af4c | success.400 |
| `color.status.success.weak` | dunkel | #2b422b | success.800 |
| `color.status.success.subtle` | dunkel | #2b422b | success.800 |
| `color.status.success.text` | hell | #00490b | success.800 |
| `color.status.success.text` | dunkel | #90ca90 | success.300 |
| `color.status.success.border` | dunkel | #6ab26b | success.300 |
| `color.status.warning.basic` | hell | #ffce2f | warning.150 |
| `color.status.warning.basic` | dunkel | #ffce2f | warning.200 |
| `color.status.warning.weak` | dunkel | #453a1c | warning.800 |
| `color.status.warning.subtle` | dunkel | #453a1c | warning.800 |
| `color.status.warning.text` | hell | #4b3900 | warning.700 |
| `color.status.warning.border` | dunkel | #c29900 | warning.300 |
| `color.status.danger.basic` | dunkel | #ff705d | danger.300 |
| `color.status.danger.weak` | dunkel | #5b2b28 | danger.800 |
| `color.status.danger.subtle` | dunkel | #5b2b28 | danger.800 |
| `color.status.danger.text` | hell | #76000c | danger.700 |
| `color.status.danger.border` | dunkel | #fa6762 | danger.400 |
| `color.status.info.basic` | dunkel | #6d9cfe | info.300 |
| `color.status.info.weak` | dunkel | #253c5a | info.800 |
| `color.status.info.subtle` | dunkel | #253c5a | info.800 |
| `color.status.info.text` | hell | #003978 | info.800 |
| `color.status.info.border` | dunkel | #5aa0f8 | info.300 |

### Entwurfsentscheidungen

#### D-01 Keine neuen Tokens, nur neue Werte
komuna bekommt Werte, keine neuen Namen. Jede neue Stufe oder Rolle wäre ein Token des Kerns, den jede Marke belegen muss (Art. IV), und hätte ekzemplo, provo, provo-kompakta und komuna-0-2 geändert. Was zwischen zwei Stufen von Fundamento liegt (die Stufen 65, 45, 35, 25 der Fonto, die Füllfarben außerhalb der Rampen, Überlagerungen von 5 und 80 %), nimmt die nächste Stufe; die Rundung steht als Jugxo und je Wert in `deveno.json` (ΔE2000 meist unter 5, höchstens 7,2 bei den Status-Füllungen).

#### D-02 Konjunktions-Sets statt gemeinsamer Sets
Die gemeinsamen Dimensions-Sets des Kerns gelten für jede Marke und bleiben unverändert (sonst wanderten ekzemplo, provo und komuna-0-2 mit). Was komuna je Dimension anders macht, steht in ihren eigenen Sets: `komuna+color-scheme/dark` (alle Rollen, die Stufen aus der dunklen Rampe der Fonto, Schatten), `komuna+viewport/compact` (Skala für Touch und schmale Breite), `komuna+viewport/expanded` (die Fonto vergrößert nicht), `komuna+density/compact` und `/comfortable` (Elementgrößen eine Stufe kleiner/größer) und `komuna+color-scheme/light+contrast/high`, `komuna+color-scheme/dark+contrast/high` (D-04).

#### D-03 Herkunft als `deveno.json` neben den Sets
Ein Override in einem Set darf keine Fundamento-Erweiterung tragen außer `textTransform` (`set-override-has-extensions`), und die Erweiterung eines Tokens im Kern kennt keine Herkunft. Die Herkunft steht deshalb je Wert in `packages/aspekto-komuna/deveno.json` (Schema `DevenoFile`): Token, Set, Fonto, Datei, Schlüssel, Wert der Fonto, geschriebener Wert, Art (`prenita`, `konvertita`, `kunmetita`, `rundita`, `interpolita`, `derivita`, `adaptita`) und bei einer Anpassung die Jugxo. Das Modelo lädt sie (`modelo.deveno`, `modelo.fontoj`); `check:fontoj` prüft, dass sie zum Set passt.

#### D-04 Hoher Kontrast ist abgeleitet
Die Fonto hat keinen hohen Kontrast. Die gemeinsamen Sets für hohen Kontrast zeigen bei der neuen komuna die Karte und die zweite Aktion gedrückt auf die Stufe der Fläche bzw. der Ruhe und färben die destruktive Aktion kräftig, wo die Fonto sie weich färbt. komuna setzt dort ihre dunklen Stufen und eine weiche destruktive Aktion mit 7:1, in zwei Sets mit drei Bedingungen (ein Set mit zwei Bedingungen stünde gleichauf mit `color-scheme/dark+contrast/high`).

#### D-05 Der Agordilo rechnet weiter auf komuna 0.2
Jede abgeleitete Marke nennt in `aspekto.json` die Struktur, aus der sie stammt (`agordilo.structure.sha256`), und die Kalibrierung des Agordilo ist an komuna 0.2 gemessen. Mit dem neutralen Akzent der Fonto zeigen die Aktionen der neuen komuna auf Grau – eine abgeleitete Marke verlöre ihre Leitfarbe. `readStructure()` baut deshalb die Struktur von komuna 0.2 aus komuna-0-2 nach (`struktur02Files`): Kern mit den Werten von komuna-0-2, Referenzpaket mit dessen Dunkel-Set unter dem Namen und den Set-IDs von komuna. Der Fingerabdruck ist derselbe wie in provo und provo-kompakta gespeichert (`554efc71…`), die Fixtures leiten sich unverändert ab, Werkstatt und Studio-Vorschau rechnen wie vorher. `readStructure("komuna")` liest die neue komuna (O-3). Die Werkstatt der Vitrino schreibt nur, was ein Regler gegenüber ihrer Basis ändert; den Rest zeigte das Stylesheet der neuen komuna (Befund in `check:vitrino`: Radius 10 px im Standard, 8 px bei Faktor 2). Sie bringt deshalb das Stylesheet ihrer Struktur mit (`<style id="fm-werkstatt-bazo-css">`, aus `aspektoStylesheet` über dieselben Dateien, nur unter `data-fm-modus="werkstatt"` und auf der Entwurfsseite); ein Build, dessen komuna die Struktur ist, bekommt es nicht.

#### D-06 Studio: Basis komuna-0-2
Der Startschirm bietet neben „Leer“ und „Beispiel komuna“ jetzt „Beispiel komuna-0-2“: Leitfarbe `#375479` und die Schriften von komuna vor der Fonto. „Beispiel komuna“ nimmt die neue komuna (Leitfarbe `#474747`, der neutrale Akzent).

#### D-07 Foundation-Seiten aus den aufgelösten Kombinationen
`bazoj.ts` misst zur Bauzeit je Marke die Basiskombination hell und dunkel: alle Tokens mit Ebene (Ero-Token am Namen; ein Literal des Kerns ist eine Grundlage, sonst eine Rolle), Wert und Herkunft; die Farbrollen mit Kontrast auf der Fläche; Schatten, Radien, Abstände, Schriftrollen, Bewegung; das Ikonaro. Das Skript füllt beim Wechsel der Marke nur die Zellen, die Suche filtert die Zeilen. Muster (Schatten, Radius, Abstand, Schrift, Bewegung) zeichnen mit den CSS-Variablen der Marke und folgen dem Modus. Texte deutsch im HTML, englisch in `VITRINO_TEKSTOJ`; Esperanto zeigt Deutsch, wie die übrigen Abschnitte.

#### D-08 Plugin-Name und Schatten innen
„Fundamento Grundlagen …“, ID `fundamento-grundlagen-‹FNV der Marken und Sprache›`: komuna allein hatte sonst die ID des Plugins von 027, und Figma führte dessen Code aus (F-13). Eine Schattenschicht, die in irgendeiner Kombination `inset` ist, schreibt das Plugin als INNER_SHADOW (eine Effektart gilt in Figma für alle Modi; in den anderen Modi ist die Schicht durchsichtig).

### Abweichungen

1. **Rundung auf die Stufen von Fundamento (D-01):** 39 Rollenwerte der Fonto liegen zwischen zwei Stufen und nehmen die nächste (Jugxo `…ZVZM`). Am sichtbarsten: Status-Füllungen (#198100 → Stufe 50/40, ΔE 7,2), Status-Text hell (Stufe 25 → 30).
2. **Flächen nicht weiß:** Die Fonto legt Fläche und Karte als reines Weiß auf eine Seite in 95. Das Aspiro `oklch-l-extreme` von komuna (≥ 0,02 von Weiß) und `surface-distinct` lassen die hellste Fläche bei 97,5 enden; Seite 90, Fläche 95, Karte 97,5 (O-1).
3. **Dunkle Overlays deckend:** Die Fonto legt „muted“-Flächen im Dunkeln mit 24 % Deckkraft über die Fläche. Fundamento hat keine farbigen durchsichtigen Stufen; die Rolle nimmt die deckende Fläche, die die Fonto selbst dafür hat (`background-<farbe>`, Stufe 25 der dunklen Rampe).
4. **Syntax-Farben:** Die Fonto hat sie (14 Rollen hell/dunkel), Fundamento hat dafür keine Tokens und der `kodbloko` keine Hervorhebung. Neue Rollen und die Familien purple, orange und teal träfen jede Marke (D-01); Vorschlag: mit dem `kodbloko` in ②b, wenn die Abgleichstabelle ihn betrifft.
5. **Touch und schmale Breite:** Die Fonto passt die Skala an, wenn der Zeiger grob **und** die Breite unter 1024 px ist. Fundamento hat keine Dimension für den Zeiger; die Anpassung gilt für `viewport=compact` (unter 600 px).
6. **Dichte** hat die Fonto nicht; die Elementgrößen gehen eine Stufe der Größenskala nach unten bzw. oben, die Abstände bleiben bei den gemeinsamen Sets.
7. **`modal` = `floating`:** Die Fonto hat drei Schattenstufen, Fundamento vier; beide nehmen die höchste.
8. **Laufweite** behält komuna (Geist); die Fonto setzt keine. Bei 42 px −0,4 px wie vorher bei 40 px.

### Befunde / Mankoj

- **B-1 „Fonto“ ist im Schema doppelt belegt:** `$defs/Fonto` ist seit Spec 001 die Schriftangabe einer Aspekto, `fontoj/` der Ordner hochgeladener Schriften im Studio. Das Fonto-Register heißt im Schema deshalb `FontoSistemo`/`FontojFile`. Vorschlag: die Schriftangabe in einer eigenen Spec in `Tiparo` umbenennen (der Katalog heißt schon `tiparoj.json`).
- **B-2 Prata hat nur das Gewicht 400** (behoben, ①-6). Die Überschriften von provo standen in 500 (display) bzw. 600 (headline); der Browser fettete Prata künstlich, Figma fiel für die fehlenden Schnitte auf Inter zurück. Jetzt legt das Agordo von provo die sieben Überschriften-Rollen fest (`festgelegt`, der Weg des Studio, Spec 024): dieselben Aliase wie die Struktur, nur `fontWeight` auf `{font.weight.regular}`. Neu abgeleitet ändern sich in `sets/aspekto/provo.json` genau diese sieben Gewichte; Ero-Tokens zeigen auf die Rollen und folgen. Tests: jede Rolle in Prata hat in allen 72 Kombinationen ein Gewicht, das Prata hat, die übrigen Rollen behalten ihres (`fonto/komuna-fonto.test.ts`); die Foundation-Seite Typografie zeigt 400 (`celoj/vitrino/bazoj.test.ts`); der Figma-Plan fragt Prata nur als Regular an (`celoj/figma/figma-cxiuj.test.ts`). Die allgemeine Regel – die Ableitung nimmt das nächste Gewicht, das die Schrift hat – gehört zu ①-7 in ②b, wenn der Agordilo `tiparoj.json` liest.
- **B-3 Generischer Fallback des Agordilo:** Ohne `festgelegt` schreibt die Ableitung `[Prata, system-ui, sans-serif]` – eine Serifenschrift mit serifenlosem Ersatz. provo legt `ui-serif, serif` fest; der Agordilo könnte den Ersatz aus der Kategorie der Schrift nehmen (`tiparoj.json` kennt sie). **Entschieden 24.10. (①-7): ja, in ②b.**
- **B-4 Die unvollständige Fixture `aspekto-incomplete`** fällt bei fehlenden Tokens auf die Werte des Kerns zurück, also auf die neue komuna; dort fallen in ekzemplos Palette Ruhe und gedrückt zusammen (`state-distinct`). Die erwarteten Fehler nennen das jetzt mit.
- **B-5 Beratende APCA-Hinweise verschieben sich** (Vitrino, Kontrast, 72 Kombinationen von komuna, beratend, kein Budget): Text (`text-normal`) sinkt von 2358 auf 2286, Ränder (`ui`, Band Lc 45–60) steigen von 36 auf 360, zusammen 2394 → 2646. Die Ränder der Fonto sind heller als die von komuna 0.2; die Regeln heben sie auf 3:1 nach WCAG mit Reserve (J4, J6), das APCA-Band erreichen sie damit nicht überall. Das schlechteste Paar ist `border-inverse-on-background-inverse` mit Lc 30,1. Der Zeuge in `vitrino.check.ts` nennt die neue Zahl. Ob Ränder auch das APCA-Band halten sollen, wäre eine eigene Regel (O-5).
- **B-6 Werkstatt-Ansicht über der neuen komuna** (gefunden von `check:vitrino`, behoben, D-05): Der Entwurf im Standard zeigte die Werte der neuen komuna, ein Regler die von komuna 0.2. Die Werkstatt bringt jetzt das Stylesheet ihrer Struktur mit; Unit-Test in `celoj/vitrino/vitrino.test.ts`.
- **B-7 Rollbereich der Token-Tabelle** (gefunden von axe in `check:vitrino`, behoben): Der rollende Bereich der Tabelle aller Tokens ist mit der Tastatur erreichbar (`role="region"`, `tabindex="0"`, benannt durch die Tabellenüberschrift).
- **B-8 Kern der Fonto-Ausnahme war eine Fixture** (gefunden in Sitzung C, #113, Probe-Merge mit den Fingerprints von Astryx: 53 Treffer; behoben). `check:clean-room` nahm als Kern das erste `vortaro/sets/core.json` des Baums, in sortierter Reihenfolge die Fixture `invalid/alirebleco-high-contrast-fail`. Die 264 Werte von komuna mit `aro: "core"` waren deshalb in `packages/vortaro/sets/core.json` nie ausgenommen; ohne Fingerprints fiel das nicht auf. Ebenso galt jedes Register `data/fontoj.json` im Baum, auch das einer Fixture. Jetzt gehört ein `deveno.json` zum Modelo des nächsten Registers darüber (`data/fontoj.json` oder `packages/modelo/data/fontoj.json`); dieses Register entscheidet seine Fontoj, und `core` ist der Kern daneben (`vortaro/sets/core.json` oder `packages/vortaro/sets/core.json`). Test `checks/clean-room/fonto.test.ts`: Kern und Register einer Fixture zählen nicht; im Repo sind alle 405 Werte in ihrem Set ausgenommen, 264 davon in `packages/vortaro/sets/core.json`. Im Probe-Merge mit #113 sinken die Treffer von 139 auf 86; die 86 stehen in Doku, Skripten und Jugxoj von #111, die die Werte der Fonto zitieren, und gehören zu #113 (Ausnahme je Wert).

### Offen (für den Maintainer)

- **O-1 Weiße Flächen:** Soll das Aspiro `oklch-l-extreme` von komuna für Flächen fallen oder auf 0 gehen? Dann wären Fläche und Karte weiß wie in der Fonto (Seite 95, Fläche 97,5, Karte 100). Das Aspiro bleibt hier, weil keine Budgets angehoben und keine Ziele gesenkt werden sollen. **Entschieden 24.10. (①-1): nein, das Aspiro `oklch-l-extreme` bleibt.**
- **O-2 Syntax-Farben** (Abweichung 4): mit dem `kodbloko` in ②b, oder eigener Schritt? **Entschieden 24.10. (①-2): in ②b, mit dem kodbloko.**
- **O-3 Agordilo auf die neue komuna** (D-05): Kalibrierung neu messen, und wohin geht die Leitfarbe einer Marke, wenn der Akzent der Referenz neutral ist – in die Aktionen (wie bisher) oder nur in Akzente und Fokus (wie die Fonto)? **Entschieden 24.10. (①-3): nach ②b, als eigener Schritt; die Leitfarbe einer Marke geht in die Aktionen, wie bisher.**
- **O-4 Die Dunkel-Rampen der Fonto** sind an den Enden weniger bunt als die hellen. Fundamento hat eine Rampe je Familie und Modus; komuna nimmt je Stufe die Rampe, die ihre Rollen im Modus brauchen. Soll das Modelo zwei Rampen je Familie kennen? **Entschieden 24.10. (①-4): ja, später, im Querschnitt Q.**
- **O-5 Ränder und APCA** (B-5): Reicht für Ränder 3:1 nach WCAG mit Reserve (heute die Regel), oder sollen sie auch das beratende APCA-Band Lc 45 halten? Das würde die Ränder von komuna dunkler machen als die der Fonto. **Entschieden 24.10. (①-5): nein, es bleibt bei WCAG 3:1 mit Reserve.**

### Constitutional Compliance Review

| Artikel | Stand |
|---|---|
| I Modelo-First | konform: Werte in Kern und Paket, Herkunft und Register als Daten des Modelo; Projekcioj generiert |
| II Unu Vortaro | konform: keine Bezeichner der Fonto übernommen, keine neuen Namen |
| III Masxinlegebleco | konform: `modelo.fontoj` und `modelo.deveno` geladen; die Vitrino zeigt die Herkunft; Gvidanto: siehe unten |
| IV Nativa Multmarkeco | konform: komuna-0-2 vollständig, gemeinsame Sets unverändert, komuna je Dimension in eigenen Konjunktions-Sets |
| V Pura Cxambro | geändert durch Amendment v2.4; Fonto gepinnt gelesen, keine anderen Systeme, Clean-Room-Prüfung mit Fonto-Ausnahme |
| VI Regularo kun Kialoj | konform: jede Anpassung eine Jugxo mit Kialo |
| VII Agenta Dokumentado | konform: Herkunft je Wert (Art. VII neu); Gvidanto-Frage „Woher kommt `color.background.default` in komuna?“ → `get_token` nennt das Set, die Vitrino die Fonto mit Schlüssel (O: eigenes MCP-Feld in ②b) |
| VIII Retejo Unue | konform: Werte in Einheiten von Fundamento (px, ms), nichts Web-Spezifisches im Modelo |
| IX Vertikala Tranĉo | Ausnahme mit Grund: die Grundlagen gelten für alle Eroj zugleich (eine Marke), der Durchstich ist die Marke komuna |
| X Kontrolo | konform: rote Tests zuerst (`2b44898f`), alle Prüfungen grün, neue Prüfung `check:fontoj` |
| XI Simpleco | ein neues Paket (aspekto-komuna-0-2); Generator als Skript, keine neue Abstraktion |
| XII Interoperebleco | konform: DTCG; Figma INNER_SHADOW für `inset` |
| XIII Simpleco de Uzo | konform: Marke wechseln in Vitrino, Studio und Figma unverändert |

### Messungen

Gemessen am 24.10. auf dem Mac des Maintainers, in einem Worktree, Branch `261023-spec-029-fonto-astryx-grundlagen`, gegen `main` `d29a5206`.

**Tests** (`turbo run test --concurrency=2 --continue`, 452 s; mit voller Parallelität lief `agordilo/wunsch.test.ts` einmal in die 120-s-Grenze, allein und mit 2 grün):

| Paket | Dateien | Tests |
|---|---|---|
| modelo | 176 | 3817 |
| projekcioj | 43 | 983 (1 übersprungen) |
| mcp | 45 | 436 |
| metiejo | 17 | 187 |
| agordilo | 15 | 113 |
| cli | 7 | 76 |
| eroj (Playwright, drei Engines) | – | 991 (2 übersprungen); davon 3 nach dem Nachziehen von `internacia.spec.ts` einzeln gelaufen |

**Prüfungen** (`pnpm check` einzeln): `lint`, `check:vortaro-lint`, `check:regularo` (60 Reguloj, 222 Jugxoj), `check:mankoj`, `check:clean-room`, `check:ikonaro` (21 × 5 Aspektoj), `check:fontoj` (1 Fonto, 405 Werte, 45 angepasst), `check:make-kit`, `check:quickstart`, `check:release`, `check:tiparoj` grün. `check:parity`: gleichwertig, 659 freigegebene Unterschiede wie auf `main`. `check:alirebleco`: 6408 Bewertungen, alle WCAG-Schwellen gehalten (kleinstes Verhältnis 4,14:1), ekzemplo, provo, provo-kompakta, komuna-0-2 je 0 Fehler; 2646 beratende APCA-Hinweise (`main`: 2394; B-5). `check:alirebleco-eroj` 633/633, `check:vitrino` 56/56.

**`perf`: rot, wie auf `main`.** Der erste von 100 Aufrufen von `check_contrast` (MCP) braucht 107,5 ms bei einem Budget von 100 ms, alle weiteren 6–13 ms (Median 8,5). Auf `main` auf derselben Maschine: 106 und 123 ms beim ersten Aufruf. Der kalte erste Aufruf ist also schon vor Spec 029 über dem Budget; das Budget ist nicht angehoben. Alle anderen Budgets halten (Build 2,6–3,5 s von 10 s, Start 1,85 s von 2 s).

**komuna-0-2 pixelgleich** (`scripts/fonto-astryx/pixelvergleich.mjs`, Vitrino von `main` gegen die Vitrino aller Marken, 43 Abschnitte × 4 Modi): 164 von 172 Bildern gleich. Anders sind die Paletten (die Beschriftung nennt die Marke) und `plenstato` (Animation; `main` gegen `main`: 168 von 172, dieselben vier). Dazu der Bildtest von Spec 027 mit den Werten von komuna 0.2: unverändert grün.

**Werte von komuna-0-2:** je Kombination ein Hash über alle 1608 aufgelösten Werte, 72 von 72 gleich mit komuna von `main`; ekzemplo, provo (ohne Schrift) und provo-kompakta je Kombination gleich mit `main`.

**Dauer des Plugin-Laufs** (Double, Median aus 5 Läufen abwechselnd, ms; der Toast in Figma zeigt die echte Zahl):

| Plan | erster Lauf | zweiter Lauf (auf dem ersten) |
|---|---|---|
| `main`, komuna | 639 | 429 |
| 029, komuna | 633 | 445 |
| `main`, vier Marken | 743 | 486 |
| 029, fünf Marken | 875 | 550 |

**Größen:** `code.js` des Plugins komuna 2 253 660 → 2 352 356 Byte (+4,4 %, dritte Schattenschicht, INNER_SHADOW), alle Marken 2 728 163 → 3 021 981 (+10,8 %, fünfte Marke). Vitrino komuna 6,24 → 7,45 MB (+19 %: Foundation-Seiten, Stylesheet der Werkstatt-Basis 229 kB), alle Marken 11,3 → 14,9 MB (+32 %). Für beide gibt es kein Budget.

**Nachtrag ①-6 (24.10., Briefing A):** im selben Worktree auf dem Branch dieses PR.
- **Rot** `99989cc`: 4 Tests in 4 Dateien.
- **Tests** (`turbo run test --concurrency=2 --continue --force`, 641 s), alle grün:
  - modelo 176 Dateien, 3818 Tests (+1, Briefing)
  - projekcioj 43 Dateien, 985 Tests, 1 übersprungen (+2)
  - mcp 436, metiejo 187, agordilo 113, cli 76
  - eroj 991, 2 übersprungen
- **Prüfungen** einzeln, grün:
  - `lint`, `check:vortaro-lint`, `check:regularo` (60 Reguloj, 222 Jugxoj), `check:mankoj`, `check:clean-room`, `check:ikonaro`
  - `check:fontoj` (1 Fonto, 405 Werte, 45 angepasst), `check:tiparoj`, `check:make-kit`, `check:quickstart`, `check:release`
  - `check:parity`: 0 Unterschiede, 659 freigegebene
  - `check:alirebleco`: 0 Fehler, 2646 beratende APCA-Hinweise wie vorher; die Gewichte von provo ändern keinen Kontrast
  - `check:alirebleco-eroj` 633/633, `check:vitrino` 56/56
- **`perf` rot, wie auf `main`:** Der erste Aufruf von `check_contrast` braucht 118,1 ms, alle weiteren 6,3–13,4 ms (Median 8,7). Das Budget ist nicht angehoben.

### Messanleitung

Alle Befehle im Checkout des Maintainers, auf dem Branch dieses PR:

```sh
cd /Users/thorstenjankowski/n8n-compose/20260918_fundamento-ds
git fetch && git switch 261023-spec-029-fonto-astryx-grundlagen
pnpm install && pnpm build
pnpm fm projekcioj build --out .fundamento/projekcioj
pnpm fm projekcioj build --config packages/modelo/test/fixtures/valid/aspekto-provo-kompakta/fundamento.cxiuj.config.json --out .fundamento/projekcioj-cxiuj
```

**1. Vitrino: komuna gegen die Fonto, hell und dunkel (Abnahme ①, Urteil).**
- Öffnen: [file:///Users/thorstenjankowski/n8n-compose/20260918_fundamento-ds/.fundamento/projekcioj-cxiuj/vitrino/index.html#aspekto=komuna](file:///Users/thorstenjankowski/n8n-compose/20260918_fundamento-ds/.fundamento/projekcioj-cxiuj/vitrino/index.html#aspekto=komuna), dann `#aspekto=komuna&color-scheme=dark`.
- Daneben die Fonto in theme-neutral (Doku-Seite oder Storybook der Fonto, Version 0.7.4).
- Urteil bitte: „trägt die Optik der Fonto, mit unseren Schriften“ – ja/nein, und was fehlt.
- Die Abweichungen 1–3 und die Jugxo-Liste erklären, wo komuna bewusst anders ist (O-1: weiße Flächen).

**2. komuna-0-2 (Abnahme ①, pixelgleich).**
- Umschalten: [file:///Users/thorstenjankowski/n8n-compose/20260918_fundamento-ds/.fundamento/projekcioj-cxiuj/vitrino/index.html#aspekto=komuna-0-2](file:///Users/thorstenjankowski/n8n-compose/20260918_fundamento-ds/.fundamento/projekcioj-cxiuj/vitrino/index.html#aspekto=komuna-0-2) – sieht aus wie komuna bis gestern.
- Bildvergleich gegen `main`:

  ```sh
  cd /Users/thorstenjankowski/n8n-compose/20260918_fundamento-ds
  git worktree add /tmp/fundamento-main main && cd /tmp/fundamento-main && pnpm install && pnpm build && pnpm fm projekcioj build --out /tmp/fundamento-main/.fundamento/projekcioj
  cd /Users/thorstenjankowski/n8n-compose/20260918_fundamento-ds
  node scripts/fonto-astryx/pixelvergleich.mjs /tmp/fundamento-main/.fundamento/projekcioj/vitrino/index.html .fundamento/projekcioj-cxiuj/vitrino/index.html komuna komuna-0-2
  ```

  Erwartet: 164 von 172 Bildern gleich. Anders sind nur die Paletten (je 4336 Pixel: die Beschriftung nennt die Marke, „komuna“ gegen „komuna-0-2“) und `plenstato` (die Animation des Ladezustands; sie ist auch zwischen zwei Läufen von `main` anders: 168 von 172 gleich).

**3. provo zeigt Prata.** [file:///Users/thorstenjankowski/n8n-compose/20260918_fundamento-ds/.fundamento/projekcioj-cxiuj/vitrino/index.html#aspekto=provo](file:///Users/thorstenjankowski/n8n-compose/20260918_fundamento-ds/.fundamento/projekcioj-cxiuj/vitrino/index.html#aspekto=provo) – Überschriften in Prata, **im Gewicht 400, nicht künstlich fett (①-6)**; im Abschnitt Typografie steht bei `typography.display.1` bis `typography.headline.4` das Gewicht 400 (der Browser lädt die Schrift nicht; ohne installiertes Prata steht ui-serif). In Figma, Modus `provo`: die Überschrift des `dialogo` in Prata Regular, ohne Hinweis auf einen fehlenden Schnitt. Prata: https://github.com/cyrealtype/Prata.

provo neu ableiten (Nachvollzug ①-6), erwartet: keine Änderung gegenüber dem Branch:

```sh
cd /Users/thorstenjankowski/n8n-compose/20260918_fundamento-ds
pnpm fm agordilo derive packages/modelo/test/fixtures/valid/aspekto-provo/agordo.json --out packages/modelo/test/fixtures/valid/aspekto-provo/aspekto-provo
git status --short
```

**4. Foundation-Seiten (Abnahme ①).** In derselben Vitrino die Abschnitte Tokens, Farbe, Elevation, Form, Abstände, Typografie, Bewegung, Icons; Marke und Modus oben wechseln, Sprache auf Deutsch/English stellen, in „Token suchen“ z. B. `color.text` tippen.

**5. Figma: alle Marken als Modi, in einer neuen leeren Datei (Abnahme ①).**
1. In Figma eine **neue leere Datei** anlegen, zum Beispiel „Werkhof · Spec 029“.
2. Plugins → Development → Import plugin from manifest → `/Users/thorstenjankowski/n8n-compose/20260918_fundamento-ds/.fundamento/projekcioj-cxiuj/figma/plugin/manifest.json` (Ordner: [file:///Users/thorstenjankowski/n8n-compose/20260918_fundamento-ds/.fundamento/projekcioj-cxiuj/figma/plugin/](file:///Users/thorstenjankowski/n8n-compose/20260918_fundamento-ds/.fundamento/projekcioj-cxiuj/figma/plugin/)).

   Es erscheint als **„Fundamento Grundlagen 0.2.0 (… · komuna, ekzemplo, provo, provo-kompakta, komuna-0-2): apply plan“** – getrennt von „Fundamento Bauformen …“ (027) und „Fundamento 0.2.0 (…)“.
3. „Plan anwenden“. Der Toast endet mit „**Lauf in … s.**“ – diese Zahl bitte notieren (Dauer des Plugin-Laufs; Vergleich im Double unter Messungen).
4. Variables → Sammlung `aspekto`: fünf Modi. Eine Instanz von `dialogo` auf die Seite, im Panel den Modus von `aspekto` auf `komuna-0-2` und zurück stellen; `color-scheme` auf dark: die Fläche zeigt den Schatten mit der Lichtkante innen.
5. Nur komuna: Import aus `/Users/thorstenjankowski/n8n-compose/20260918_fundamento-ds/.fundamento/projekcioj/figma/plugin/manifest.json` in einer zweiten leeren Datei, „Fundamento Grundlagen 0.2.0 (… · komuna)“.

**6. Studio:** `pnpm fm metiejo`, im Startschirm „Beispiel komuna-0-2“ wählen: die Leitfarbe ist das Blau von komuna vor der Fonto.

**Werte neu erzeugen (Nachvollzug):**

```sh
mkdir -p /tmp/fonto && cd /tmp/fonto
npm pack @astryxdesign/core@0.7.4 @astryxdesign/theme-neutral@0.7.4
mkdir core neutral && tar xzf astryxdesign-core-0.7.4.tgz -C core && tar xzf astryxdesign-theme-neutral-0.7.4.tgz -C neutral
cd /Users/thorstenjankowski/n8n-compose/20260918_fundamento-ds
git show main:packages/vortaro/sets/core.json > packages/vortaro/sets/core.json
git show main:packages/aspekto-komuna/sets/aspekto/komuna+color-scheme/dark.json > packages/aspekto-komuna/sets/aspekto/komuna+color-scheme/dark.json
node scripts/fonto-astryx/schreiben.mjs "$PWD" /tmp/fonto && pnpm vortaro:themes
npx biome format --write packages/vortaro/sets/core.json packages/aspekto-komuna
git status --short
```

Erwartet: keine Änderung gegenüber dem Branch.

**Tests und Prüfungen:**

```sh
cd /Users/thorstenjankowski/n8n-compose/20260918_fundamento-ds
pnpm --filter @fundamento/projekcioj exec vitest run src/fonto src/celoj/vitrino/bazoj.test.ts src/celoj/figma/plugin-name.test.ts src/celoj/figma/figma-cxiuj.test.ts
pnpm --filter @fundamento/agordilo exec vitest run src/struktur-029.test.ts src/derive.test.ts
pnpm --filter @fundamento/metiejo exec vitest run src/komuna-0-2.test.ts
pnpm fm modelo validate && pnpm check:fontoj && pnpm check:alirebleco && pnpm check:clean-room
```

Die Spec: `file:///Users/thorstenjankowski/n8n-compose/20260918_fundamento-ds/specs/029-fonto-astryx/spec.md`; dieser Plan: `file:///Users/thorstenjankowski/n8n-compose/20260918_fundamento-ds/specs/029-fonto-astryx/plan.md`.

## ①b – Werte je Komponente aus der Fonto, weiße Flächen (27.10.)

**Anlass:** Abnahme ① des Maintainers am 27.10., 22:07: „passt noch nicht“, vor allem die Varianten (`butono`, `kampo`, `karto`, `dialogo` neben dem Storybook der Fonto). Briefing: [`briefing-a-1b-2026-10-27.md`](briefing-a-1b-2026-10-27.md), unverändert kopiert. #111 steht auf `main` nach #112 (`3dbb482`), neu aufgesetzt; Konflikte nur in Tests, Zählungen und Listen (Spec 030 und Spec 029 nebeneinander).

### Zusammenfassung ①b

| # | Punkt des Briefings | Was jetzt gilt |
|---|---|---|
| a | Weiß erlaubt (①-1 neu) | Das Aspiro `oklch-l-extreme` gilt für komuna nicht mehr (komuna-0-2 behält es). Karte weiß wie die Fonto, Seite 95 wie die Fonto, Fläche 97,5 und vertiefte Fläche 90 (surface-distinct gilt weiter, J1 angepasst, die alte Lage steht in J1); inverse Fläche dunkel weiß; gedrückt und gewählt der ersten Aktion hell Schwarz (J5). Felder und Karten sind über ihre Ero-Tokens reinweiß. |
| b | Ero-Tokens aller 40 Eroj aus der Fonto | 781 Ero-Tokens von komuna haben einen Wert der Fonto, mit 948 Herkunftsangaben in `deveno.json` (680 übernommen, 168 auf eine Stufe gerundet bzw. verrechnet, 93 angepasst) (Datei der Komponente in `packages/core/src`, Element, Eigenschaft, Kombination, Modus). Quelle sind die gemessenen Stile der gepinnten Komponenten mit den Overrides von theme-neutral. Varianten des butono: high/medium/low = primary/secondary/ghost, intent=danger = destructive. 37 Eroj haben Werte; apartigilo, atributlisto und navigado keine (siehe Abweichungen). Nachvollzug: ein zweiter Lauf von Vergleich und Generator schreibt Kern und Herkunft byte-gleich. |
| c | deaktivierter butono high ohne Text | Ursache: J8 rundete `color.action.primary.disabled` auf `neutral.400`, die Stufe von `color.text.disabled` – Fläche und Schrift gleich (1,00:1). Jetzt die eigene Variante blass wie die Fonto: Fläche grau, Schrift weiß (3,15:1, Fonto 3,32:1). Browser-Test: jeder deaktivierte butono mindestens 3:1, hell und dunkel, drei Engines. |
| d | Vitrino ohne Icon | Die Kombinationszeilen zeigen kein Icon; eine Zeile „mit Icon“ zeigt die Varianten (butono high/medium/low/danger, ligilo, signeto je Absicht). |
| e | Vergleichsseite | Lokal, nicht veröffentlicht: `scripts/fonto-astryx/vergleich/` baut beide Seiten (Fundamento komuna aus dem Projekcioj-Build, die Fonto aus den gepinnten Paketen mit React als devDependency nur dort), misst je Ero, Kombination, Zustand (Ruhe, Hover, gedrückt, Fokus, deaktiviert, lädt, ungültig …) und Modus die Eigenschaften, die die Ero-Tokens treiben, und schreibt Bilder, `messungen.json` und die Seite nach `.fundamento/vergleich/`. 331 Fälle, 40 Eroj, 1324 Bilder; die Tabelle nennt bei jeder Abweichung den Grund (`gruende.mjs`, 201 Gründe). |

### Wie die Werte entstehen

1. **Messen** (`vergleich.mjs`): Jede Fall-Datei in `vergleich/faelle/` ordnet einem Teil von Fundamento das Element der Fonto zu (je Eigenschaft, wo Kasten und Text auf verschiedenen Elementen liegen). Gemessen wird auf beiden Seiten dieselbe CSS-Eigenschaft, die das Ero-Token im erzeugten Stylesheet treibt. Farben auch sichtbar: Überlagerung (hover der Fonto als Verlauf), Deckkraft (deaktiviert 50 %) und Untergrund verrechnet. Übergänge der Fonto sind ausgeschaltet, das Reset der Fonto ist geladen.
2. **Ableiten** (`eroj.mjs`): Ein Wert wird, wo es geht, ein Alias – die Rolle, auf die das Ero-Token im Skemo zeigt, dann eine Rolle der passenden Gruppe (Fläche → `color.background.*`, Schrift → `color.text.*`, Rand → `color.border.*`), dann eine Stufe (ΔE2000, „rundita“); Maße auf Tokens von komuna mit genau diesem Wert, sonst ein eigener Wert in px; Schrift auf die Rolle mit Größe und Gewicht der Fonto; Schatten auf die Elevation mit denselben Schichten. komuna ist die Referenzmarke: die hellen Werte stehen im Kern (`packages/vortaro/sets/core.json`), die dunklen im Dunkel-Set von komuna; jede andere Marke belegt jedes Token selbst und bleibt gleich (Tests).
3. **Regeln gewinnen** (`eroj-regeln.mjs`): schreibt, prüft `check:alirebleco` und hält jedes Paar unter der Schwelle in `anpassoj-eroj.json` fest, bis die Prüfung hält.

Nicht übernommen wird: ein Pseudo-Element (`::backdrop`, `::placeholder`), ein Selektor in einen Nachfahren (`::slotted`) oder auf ein anderes Element derselben Art (`[aria-selected]`, die gewählte Kalenderzelle) – außer die Fall-Datei ordnet ihn ausdrücklich zu; ein Teil, der nicht gezeichnet ist (geschlossenes Popover, 0×0, verborgen 1×1); ein Token, das eine Achse nicht trennt, über die die Fonto verschiedene Werte zeigt (die Farbe der Meldung je Status: 12 Tokens, das ist ②b); ein Wert für eine Achse, die die Fonto nicht hat, außer für ihren Standardwert (insigno ohne Größen); Teile, die Fundamento nach der Abgleichstabelle behält (die farbige Kante der avizo).

### Jugxo-Liste ①b

Alle Jugxoj gehören zu komuna (`packages/aspekto-komuna/jugxoj.json`, `decision: deviation-recorded`); jede nennt im Kontext genau ihre Tokens, `deveno.json` je Wert die Jugxo.

| Jugxo | Bezug | Tokens | Inhalt |
|---|---|---|---|
| J1 `jug_01M5N89C1TWQ57VAQD0V6V4KR7` (angepasst) | Regulo `surface-distinct` | 2 | Weiß erlaubt (27.10.): Karte weiß, Fläche 97,5, vertiefte Fläche 90; die alte Lage (wegen des Aspiro) steht in der Begründung. |
| J5 `jug_01M5N89C1WQ308F9302JTZRVZH` (angepasst) | Regulo `state-distinct` | 18 | gedrückt und gewählt der ersten Aktion hell bis Schwarz (seit 27.10. erlaubt). |
| J9 `jug_01M5ZMZSNG2G533GB0RY9HVNSG` | Regulo `state-distinct` | 21 | Hover und gedrückt der Eroj (5 %/10 % Überlagerung der Fonto) fielen gerundet auf die Ruhe: die Rolle des Zustands bleibt. |
| J10 `jug_01M5ZN30KJ3DFY1FXD8K3HHEJ6` | Art. X | 11 | Die Fonto zeichnet keinen Rand: die Breite bleibt, die Farbe ist die Fläche – unsichtbar, in erzwungenen Farben eine Kontur. |
| J11 `jug_01M5ZN8QFKFKBR76C7B320RGJ9` | Art. X | 2 | Deaktiviert lesbar (c): destructive deaktiviert hat bei der Fonto 2,63:1; mindestens 3:1. |
| J12 `jug_01M5ZNJ4SM3XWE76KJ431Y7B3G` | Art. X (WCAG 1.4.11) | 33 | Feld- und Status-Ränder der Fonto unter 3:1: die Rolle mit der KontrastParo bleibt (Briefing: Feldränder mindestens 3:1); ebenso die Kontraste ohne Text der gerenderten Prüfung (Griff und Kontur des sxaltilo, Kontur des insigno, Kante der avizo, Füllung des mezurilo). |
| J13 `jug_01M5ZNMRXQEZY8N0FJ7FVQNG7C` | Art. V | 8 | Das Ero-Token folgt einer nach einer Regulo angepassten Rolle (J3–J7), statt einer anderen Rolle mit dem Wert der Fonto. |
| J14 `jug_01M5ZS3RD8HWV0EWSCGZAHA30K` | Art. X | 8 | KontrastParoj der Eroj unter der Schwelle (glitilo, mezurilo, langetaro im Dunkeln) und Schrift auf der Fläche desselben Teils unter 4,95:1 (Füllungen des insigno): die Fläche rückt auf die nächste Stufe, die hält, oder bleibt auf der Rolle. |
| J15 `jug_01M5ZT2Z2V5GMPZXTDV3BK8PRE` | Regulo `touch-target-min` | 10 | Die Fonto lässt Knöpfe und Griffe unter 24 px (min-width 0): die Rolle mit der Mindest-Zielgröße bleibt (WCAG 2.5.8). |

### Abweichungen ①b

1. **Rundung auf die Stufen von Fundamento:** Farben der Fonto zwischen zwei Stufen (verrechnete Überlagerungen, deaktiviert mit halber Deckkraft, die Status-Flächen im Dunkeln) nehmen die nächste Stufe (195 Werte „rundita“/„kunmetita-rundita“, ΔE2000 in `deveno.json`). Eigene Farbwerte verbietet `color-semantic-literal` (Art. IV).
2. **Kein Rand, aber Kontur:** Wo die Fonto keinen Rand zeichnet (butono, dialogo, insigno …), ist die Randfarbe die Fläche und die Breite bleibt (J10).
3. **Pille im Storybook:** Der Button der Fonto misst in theme-neutral 10 px Radius (`--radius-element`), keine Pille; die Pille ist eine eigene Form-Option der Fonto (`--_button-radius: var(--radius-full)`). komuna nimmt die 10 px. Eine Form-Achse wäre ②b (O-1b-1).
4. **Karte mit Schatten:** Die Card der Fonto ist im Standard flach; der Maintainer sah einen leichten Schatten. Gemessen ist `elevation="low"` – der Schatten `raised` von komuna (O-1b-2).
5. **Felder zeigen Fokus anders:** Die Fonto zeigt den Fokus eines Feldes als dunklen Rand mit innerem Schatten, ohne Ring. komuna behält ihren Fokusring an Feldern (focus-ring-dual-contrast); die Randfarbe im Fokus kommt aus der Fonto.
6. **Knopf nur mit Icon:** Die Fonto zeichnet ihn quadratisch ohne Innenabstand, mit Text 12 px. Das Innenabstands-Token des butono trennt die beiden Formen nicht; mit 12 px liefen die Schließen-Knöpfe über (avizo, Kalender). Der Innenabstand bleibt deshalb auf seiner Rolle; die Form „nur Icon“ ist ②b (O-1b-4).
7. **Zwei Stufen der Schrift:** Die Fonto hat primary und secondary, Fundamento drei Stufen; secondary hat den Wert von muted. Auf medium abgebildet fiele medium auf low (text-hierarchy verlangt drei unterscheidbare Stufen): medium bleibt auf seiner Rolle.
8. **Kein Gegenstück:** apartigilo (die Fonto malt die Linie als Fläche), atributlisto (alles Light-DOM), navigado (Abstand unterscheidet waagerecht und senkrecht, das Token nicht); Teile in Popovern (Vorschläge, Kalenderzellen gewählt, Menüeinträge im Hover) und Dateilisten lassen sich nicht messbar öffnen. Sie stehen in der Tabelle der Vergleichsseite als nicht gemessen.

### Befunde ①b

- **B-1b-1 Beratende APCA-Hinweise steigen** (kein Budget, beratend): Seit komuna Ero-Tokens mit eigenen Werten belegt, prüft `check:alirebleco` neben den 89 deklarierten auch ihre Paare (`eroKontrastParojOf`, 280 Paare). Alle WCAG-Schwellen halten; die beratenden APCA-Hinweise in den 72 Kombinationen von komuna steigen von 2646 auf 8496 (Zeuge in `vitrino.check.ts`).
- **B-1b-2 Figma las Farbe und Maß aus der Rolle:** Die Projektion band den Ero-Token, schrieb Paint und Geometrie aber aus der Rolle – solange jede Marke Aliase führte, war das gleich. Jetzt aus dem Ero-Token (`figma.ts`, vier Stellen); `check:parity` 0 Fehler.
- **B-1b-3 Fonto-Ausnahme des Clean Room parste je Eintrag:** 948 neue Herkunftsangaben hätten den Kern 948-mal geparst (10,7 s, in der vollen Suite über 30 s). Jetzt ein Parse je Set: 2 s.
- **B-1b-4 Eine Deckkraft je Paint auch über Marken:** Im Build mit allen Marken sind die feinen Ränder von komuna (8 % Schwarz) durchsichtig, die der anderen Marken deckend – wie die Karte schon in ① („alpha varies by mode“ im Inventar der Figma-Parität; die Prüfung läuft über das Repo und ist grün).
- **B-1b-5 Der Datei-Dialog im Vitrino-Check blieb aus** (CI-Lauf 40615856463, Versuche 1 und 4): Playwright schaltet das Abfangen des Dialogs erst mit dem ersten Listener ein, neben dem Tastendruck. Die schwerere Vitrino (15 statt 9,4 MB HTML, die 280 Paare je Kombination in `mezuroj`) macht den Renderer langsamer, und auf einem langsamen Renderer gewann der Tastendruck. Lokal bei vierfach gedrosselter CPU sahen 2 von 4 späten Listenern den Dialog, 6 von 6 frühen. Der Listener steht jetzt vor dem Laden der Seite (`vitrino.check.ts`, `alsxutilo.spec.ts`). Kein Budget geändert. Die Versuche 2 und 3 liefen auf um etwa 1,5× langsameren Runnern (Build 11–12 statt 7–8 s): einmal die Job-Grenze von 15 Minuten, einmal M5 mit 151,5 ms bei < 150 ms. Lokal ist M5 vor und nach ①b gleich (Ableitung 71–75 ms, Prüfung ≈ 960 ms).
- **B-1b-6 Der Job der gerenderten Prüfungen lief über seine 15 Minuten** (Entscheidung des Maintainers 28.10.: aufteilen, keine Grenze anheben): CI-Runner kommen in zwei Geschwindigkeiten, Build 7–9 s oder 11–12 s, etwa je zur Hälfte. Auf einem langsamen Runner brauchte der Job aus Make Kit, Quickstart und Vitrino schon am 24.10. 14:34 min (Lauf 40091280058). Nach dem Rebase auf #112 und mit ①b lief er viermal über 15 min, die Vitrino allein 12:47 min, obwohl alle 56 Tests grün waren. Auf schnellen Runnern sind die schweren Vitrino-Tests vor und nach ①b gleich lang (axe der ganzen Seite 24–25 s, dialogo 50–52 s). Die Vitrino ist jetzt in zwei Teile geteilt (`VITRINO_PARTO` in `playwright.vitrino.config.ts`, ein Muster für beide Teile): Die Werkstatt (21 Tests) läuft neben Make Kit und Quickstart, der Rest (35 Tests) im eigenen Job `vitrino`. Auf einem langsamen Runner sind das je etwa 9 min. Ohne `VITRINO_PARTO` läuft die ganze Vitrino, so wie lokal. M5 lag auf langsamen Runnern schon vor ①b bei 135–146 ms (Ableitung) und einmal bei 56 ms (Blockade), mit ①b bei 137–151,5 ms und 0–54 ms. M5 wird durch die Teilung nicht schneller, bleibt knapp und ist nicht angehoben.

### Offen (für den Maintainer) ①b

- **O-1b-1 Form des butono:** ~~10 px wie theme-neutral (jetzt) oder Pille wie im Storybook?~~ **Entschieden 28.10., 17:22:** Der Radius bleibt 10 px (Standard von theme-neutral); die Pille ist keine Aufgabe von ①.
- **O-1b-2 Schatten der Karte:** ~~leicht wie gesehen oder flach?~~ **Entschieden 28.10., 17:22:** leichter Schatten, wie gemessen (`elevation low`).
- **O-1b-4 Knopf nur mit Icon:** ~~eine Form des butono (②b)~~ **Entschieden 28.10., 17:22:** in #111 – Innenabstand wie die Fonto (12 px in jeder Größe), ein Knopf nur mit Icon quadratisch ohne Innenabstand (Abschnitt „①b – Abnahme 28.10., 17:19“).
- **O-1b-3 Status-Farben der Meldung:** Die Fonto färbt Titel und Text einer Meldung je Status; Fundamento hat ein Token für alle Status. Die Achse kommt mit ②b (12 Tokens „uneinheitlich“, im Bericht).

### Messungen ①b

Gemessen am 28.10. in einem Worktree, Branch `261023-spec-029-fonto-astryx-grundlagen` nach dem Neuaufsetzen auf `main` `3dbb482`.

- **Rot:** a), c), d) in `92e9e98`; b) in `8f645c8` (8 von 8); Doku in `ebecd32`.
- **Tests** (`turbo run test --concurrency=2 --continue --force`, 456 s), alle grün: modelo 3837, projekcioj 1158 (1 übersprungen), mcp 442, metiejo 193, agordilo 113, nordstelo 58, cli 76, eroj 1021.
- **Prüfungen** einzeln, grün: `lint`, `check:vortaro-lint`, `check:regularo`, `check:mankoj`, `check:clean-room`, `check:ikonaro`, `check:fontoj`, `check:tiparoj`, `check:make-kit`, `check:quickstart`, `check:release`; `check:parity` 0 Fehler (659 freigegebene wie vorher); `check:alirebleco` 280 Paare × 72, alle WCAG-Schwellen, 8496 beratende APCA-Hinweise (B-1b-1); `check:alirebleco-eroj` 633/633; `check:vitrino` 56/56.
- **`perf` rot wie auf `main`:** der erste Aufruf von `check_contrast` 109,7 ms, alle weiteren 6,8–21,9 ms. Kein Budget angehoben.
- **komuna-0-2** unverändert: die 72 Hashes über alle aufgelösten Werte gleich mit komuna von `main` (`fonto/komuna-0-2.test.ts`); ekzemplo, provo, provo-kompakta je Kombination gleich (`fonto/komuna-fonto.test.ts`).
- **Nachvollzug:** ein zweiter Lauf von Vergleich, Regeln und Generator schreibt Kern und Herkunft byte-gleich.

### Messanleitung ①b

Im Checkout des Maintainers, auf dem Branch dieses PR:

```sh
cd /Users/thorstenjankowski/n8n-compose/20260918_fundamento-ds
git fetch && git switch 261023-spec-029-fonto-astryx-grundlagen && git pull
pnpm install && pnpm build
pnpm fm projekcioj build --config packages/modelo/test/fixtures/valid/aspekto-provo-kompakta/fundamento.cxiuj.config.json --out .fundamento/projekcioj-cxiuj
```

**1. Vergleichsseite (Abnahme ①b).** Lokal, nicht veröffentlicht. Einmal die Fonto als devDependency des Vergleichs installieren, dann Vergleich und Gründe:

```sh
cd /Users/thorstenjankowski/n8n-compose/20260918_fundamento-ds
npm ci --prefix scripts/fonto-astryx/vergleich
node scripts/fonto-astryx/vergleich/vergleich.mjs
node scripts/fonto-astryx/eroj.mjs > /tmp/eroj.json && node scripts/fonto-astryx/vergleich/gruende.mjs /tmp/eroj.json
open "file:///Users/thorstenjankowski/n8n-compose/20260918_fundamento-ds/.fundamento/vergleich/index.html"
```

Die Seite: [file:///Users/thorstenjankowski/n8n-compose/20260918_fundamento-ds/.fundamento/vergleich/index.html](file:///Users/thorstenjankowski/n8n-compose/20260918_fundamento-ds/.fundamento/vergleich/index.html). Je Ero (Sprungmarken oben) links Fundamento, rechts die Fonto, hell und dunkel, in jedem Zustand mit Gegenstück; darunter (aufklappen) die gemessenen Stile – Höhe, Innenabstand, Radius, Rand, Randfarbe, Fläche, Schriftfarbe, Schriftgröße –, oben Fundamento, unten die Fonto, gelb wo sie abweichen, mit Grund. Zuerst `butono`, `kampo`, `karto`, `dialogo`. Die Schrift ist absichtlich verschieden (Geist bei komuna, Figtree bei der Fonto).

**2. Werte neu erzeugen (Nachvollzug).** Nach der Messung, in dieser Reihenfolge; erwartet: keine Änderung gegenüber dem Branch.

```sh
cd /Users/thorstenjankowski/n8n-compose/20260918_fundamento-ds
echo '{}' > scripts/fonto-astryx/anpassoj-eroj.json
node scripts/fonto-astryx/eroj-regeln.mjs
node scripts/fonto-astryx/eroj.mjs > /tmp/eroj.json
npx biome format --write packages/vortaro/sets/core.json packages/aspekto-komuna
git status --short
```

**3. Vitrino und Figma (Abnahme ①b).** [file:///Users/thorstenjankowski/n8n-compose/20260918_fundamento-ds/.fundamento/projekcioj-cxiuj/vitrino/index.html#aspekto=komuna](file:///Users/thorstenjankowski/n8n-compose/20260918_fundamento-ds/.fundamento/projekcioj-cxiuj/vitrino/index.html#aspekto=komuna) – butono ohne Icon, darunter die Zeile „mit Icon“; deaktiviert blass mit lesbarem Text. Figma: wie Punkt 5 der Messanleitung ① in einer **neuen leeren Datei**, Plugin „Fundamento Grundlagen 0.2.0 (… · komuna, ekzemplo, provo, provo-kompakta, komuna-0-2)“; die Varianten des butono, kampo, karto und dialogo zeigen die neuen Werte.

**4. komuna-0-2 pixelgleich:** wie Punkt 2 der Messanleitung ① (`pixelvergleich.mjs`).

**Tests:**

```sh
cd /Users/thorstenjankowski/n8n-compose/20260918_fundamento-ds
pnpm --filter @fundamento/projekcioj exec vitest run src/fonto src/celoj/vitrino/datumoj.test.ts
cd packages/eroj && npx playwright test test/butono.spec.ts --project=chromium
```

## ①b – Abnahme 28.10. (13:03): Befund und Behebung

Befund des Maintainers am Stand `28447a9`, Build mit allen Marken (`fundamento.cxiuj.config.json`), Vitrino `#aspekto=komuna`: 1) butono high deaktiviert (neutral und danger) ohne Text, 2) butono medium weiß mit dunklem Rand, 3) der Knopf des alsxutilo im alten Stil – auf der Vergleichsseite alles im neuen Stil; Radius, Seitengrund, Beispiele ohne Icon und die Zeile „mit Icon“ angekommen; 4) die Spalte „Fundamento hell“ der Vergleichsseite mittelgrau.

### Ursache

- **1–3: Die Vitrino bettet das Element des Make Kits ein, und das Make Kit schrieb die Stile ohne Ero-Tokens.** `make-kit.ts` rief `stylesheetOf(skemo, uzo)` und `lightStylesheetOf(skemo, tag)` ohne den Besitzer auf; ohne ihn liest jede Regel die Rolle des Skemo (`var(--fm-color-text-disabled)`), mit ihm das Ero-Token (`var(--fm-ero-butono-label-color-…)`), wie die Web-Component-Celo und damit `packages/eroj` sie schreiben. Das CSS beider Builds war richtig (`:root` von komuna: `--fm-ero-butono-label-color-emphasis-high-intent-neutral-disabled: var(--fm-color-text-inverse)`; jede andere Marke unter ihrem `data-fm-aspekto`), nur las das Element es nicht. Gemessen in der Vitrino: die Variable löst am Element zu `#ffffff` auf, die Schrift ist `rgb(145,145,145)` auf `rgb(145,145,145)`. Solange jedes Ero-Token auf seine Rolle zeigte, war das gleich; seit ①b nicht mehr. Dasselbe galt für das ausgelieferte Make Kit jeder Marke.
- **4: Das dialogo stand während der ganzen Messung modal offen.** `fm-dialogo` öffnet mit `open` immer über `showModal()`; seine Abdeckung (50 % Schwarz) lag über der Fundamento-Seite, jedes Bild halb so hell (248 → 124, dunkel 38 → 19). Die Fonto misst ihr Dialog inline.
- **Dazu, beim Prüfen gefunden: secondary der Fonto ist durchsichtig, Fundamento nahm eine deckende Fläche.** Die Fonto legt Schwarz 6 % (hell) bzw. Weiß 10 % (dunkel) über das, worauf der Knopf steht. Der Generator verrechnete das mit dem Weiß der Vergleichsseite zu `#f0f0f0` und nahm die Rolle `action.secondary.rest` (`#f1f1f1`) – genau der Seitengrund der Vitrino (`background.canvas`, Stufe 95). Mit Behebung 1 allein wäre der Knopf in der Vitrino nur noch Text gewesen.

### Behebung

- **Make Kit:** Besitzer an beide Aufrufe; die Elemente aller Kits und die Vitrino lesen die Ero-Tokens.
- **Generator (`eroj.mjs`):** Eine durchsichtige Farbe der Fonto, die keine Rolle mit dieser Deckkraft trägt, bleibt durchsichtig – die nächste Stufe der Palette (`shade`, `tint`) derselben Farbe, nicht der mit der Vergleichsseite verrechnete Wert. Sind beide Modi durchsichtig, aber verschieden deckend, gilt eine gemeinsame Deckkraft, die beiden Werten der Fonto am nächsten liegt (Figma: eine Deckkraft je Paint, `parity-alpha-varies-by-mode`). Ergebnis: butono medium (rest, focus, loading; Fläche und Rand), die Initialen des avataro und das nicht gewählte signeto nehmen `color.action.tertiary.hover` – hell Schwarz 8 % (Fonto 6 %), dunkel Weiß 8 % (Fonto 10 %), in beiden Modi dieselbe Rolle; die zwei Sonderwerte im Dunkel-Set entfallen. Hover und gedrückt von medium bleiben auf ihren Rollen (`action.secondary.hover`/`pressed`, J9: die Fonto misst dort denselben Grundwert); sie liegen auf jeder Seite dunkler als die Ruhe (hell auf der Vitrino 222 → 212 → 198).
- **Vergleichsseite:** baut genau den Build der Abnahme (`--config …/fundamento.cxiuj.config.json`) und lädt das Element, das dessen Vitrino einbettet, statt `packages/eroj`; ein modales Ero (`modal: true`, dialogo) öffnet nur für seinen eigenen Fall, ohne den Fokus des Öffnens, sein Bild ist sein Rahmen.
- **Jugxoj:** J9 (Zustände) 21 → 25 (hover und gedrückt von medium, vorher J13); J13 (Rollen) 8 → 4; J14 (Kontrast) 8 → 7 (avataro dunkel entfällt). Herkunft 1353 → 1351 Angaben.
- **Prüfung der Initialen des avataro** (`alirebleco.check.ts`): las die durchsichtige Fläche als deckendes Schwarz (2,26:1); verrechnet jetzt die Fläche mit dem Grund unter dem avataro. Die Schwelle 4,5:1 bleibt.
- **Zeuge der APCA-Hinweise** (`vitrino.check.ts`, beratend): 8496 → 8550; alle WCAG-Schwellen halten.

### Tests ①b-Abnahme

- **Rot** in `c978c7c`: die Vitrino aus `fundamento.cxiuj.config.json` im Browser, komuna hell und dunkel – butono high deaktiviert mit Text ≥ 3:1 (neutral und danger; vorher 1,00:1 hell, 2,95:1 dunkel), butono medium und der Knopf des alsxutilo mit Rand = Fläche und einer eigenen Fläche (vorher Rand `rgb(94,94,94)` auf `rgb(241,241,241)`); die Elemente des Make Kits lesen `--fm-ero-*` (komuna, ekzemplo); die Vergleichsseite baut diesen Build und öffnet das dialogo nur für seinen Fall.
- **Grün:** alle sieben; `check:vitrino` 60/60, `check:alirebleco-eroj` 633/633, Playwright der Eroj 1021/1021, `check:make-kit` 5/5, `check:quickstart` 1/1; Vitest modelo 3838, projekcioj 1161 (+1 übersprungen), mcp 442, metiejo 193, agordilo 113, cli 76, nordstelo 58; `check:parity` 0 Fehler, `check:alirebleco` 0 Fehler (8550 beratend), die übrigen Prüfungen 0 Fehler.

### Messungen ①b-Abnahme

- **komuna-0-2 pixelgleich** (`pixelvergleich.mjs`): gegen den Stand vor der Behebung (`28447a9`, derselbe Inhalt) 196 von 200 Bildern gleich, anders nur `plenstato` (Animation). Ebenso ekzemplo, provo und provo-kompakta je 196 von 200. Gegen `main`: 152 von 172 gleich – anders die Paletten und `plenstato` wie in ①, dazu butono, ligilo und signeto in der Größe, weil ihre Abschnitte seit ①b d) die Zeile „mit Icon“ haben.
- **Vergleichsseite:** Grund der Bilder hell 248 (vorher 124), dunkel 38 (vorher 19), wie die Fonto (255 bzw. 38; die Fonto-Seite ist weiß, Fundamento zeigt `background.default`); 331 Fälle, 40 Eroj.

### Messanleitung ①b-Abnahme

Im Checkout des Maintainers, auf dem Branch dieses PR:

```sh
cd /Users/thorstenjankowski/n8n-compose/20260918_fundamento-ds
git fetch && git switch 261023-spec-029-fonto-astryx-grundlagen && git pull
pnpm install && pnpm build
rm -rf .fundamento/projekcioj-cxiuj
pnpm fm projekcioj build --config packages/modelo/test/fixtures/valid/aspekto-provo-kompakta/fundamento.cxiuj.config.json --out .fundamento/projekcioj-cxiuj
open "file:///Users/thorstenjankowski/n8n-compose/20260918_fundamento-ds/.fundamento/projekcioj-cxiuj/vitrino/index.html#aspekto=komuna"
```

**1. Vitrino:** [file:///Users/thorstenjankowski/n8n-compose/20260918_fundamento-ds/.fundamento/projekcioj-cxiuj/vitrino/index.html#aspekto=komuna](file:///Users/thorstenjankowski/n8n-compose/20260918_fundamento-ds/.fundamento/projekcioj-cxiuj/vitrino/index.html#aspekto=komuna) – butono: high deaktiviert (neutral, danger) mit weißer Schrift auf Grau; medium eine graue Fläche ohne sichtbaren Rand, etwas dunkler als die Seite; alsxutilo: der Knopf „Datei auswählen“ ebenso. Dunkel: `#aspekto=komuna&color-scheme=dark`.

**2. Vergleichsseite:** baut denselben Build selbst (in `.fundamento/vergleich/fm`) und lädt das Element seiner Vitrino.

```sh
cd /Users/thorstenjankowski/n8n-compose/20260918_fundamento-ds
npm ci --prefix scripts/fonto-astryx/vergleich
node scripts/fonto-astryx/vergleich/vergleich.mjs
node scripts/fonto-astryx/eroj.mjs > /tmp/eroj.json && node scripts/fonto-astryx/vergleich/gruende.mjs /tmp/eroj.json
open "file:///Users/thorstenjankowski/n8n-compose/20260918_fundamento-ds/.fundamento/vergleich/index.html"
```

[file:///Users/thorstenjankowski/n8n-compose/20260918_fundamento-ds/.fundamento/vergleich/index.html](file:///Users/thorstenjankowski/n8n-compose/20260918_fundamento-ds/.fundamento/vergleich/index.html) – die Spalte „Fundamento hell“ auf hellem Grund; dialogo als sein Rahmen.

**3. Werte neu erzeugen (Nachvollzug):** wie Punkt 2 der Messanleitung ①b; erwartet: keine Änderung gegenüber dem Branch.

**4. komuna-0-2 pixelgleich:** gegen den Stand vor der Behebung, gleicher Inhalt:

```sh
cd /Users/thorstenjankowski/n8n-compose/20260918_fundamento-ds
git worktree add /tmp/fundamento-vor 28447a9c && cd /tmp/fundamento-vor && pnpm install && pnpm build && pnpm fm projekcioj build --config packages/modelo/test/fixtures/valid/aspekto-provo-kompakta/fundamento.cxiuj.config.json --out /tmp/fundamento-vor/.fundamento/projekcioj-cxiuj
cd /Users/thorstenjankowski/n8n-compose/20260918_fundamento-ds
node scripts/fonto-astryx/pixelvergleich.mjs /tmp/fundamento-vor/.fundamento/projekcioj-cxiuj/vitrino/index.html .fundamento/projekcioj-cxiuj/vitrino/index.html komuna-0-2 komuna-0-2
```

Erwartet: 196 von 200 Bildern gleich, anders nur `plenstato`.

**Tests:**

```sh
cd /Users/thorstenjankowski/n8n-compose/20260918_fundamento-ds/packages/eroj
npx playwright test --config playwright.vitrino.config.ts -g "every brand shows"
cd /Users/thorstenjankowski/n8n-compose/20260918_fundamento-ds
pnpm --filter @fundamento/projekcioj exec vitest run src/celoj/make-kit/make-kit.test.ts src/fonto
```

## ①b – Abnahme 28.10. (17:19): Innenabstand des butono

Befund: Werte und Varianten des butono passen bis auf den Innenabstand. Entscheidung des Maintainers (17:22): „gut genug“ – kein Pixel- oder Story-Abgleich mit dem Storybook der Fonto, kein Vollinventar; ②b setzt nach dem Merge von #111 genau die Entscheidungen aus ②a (#110) um. O-1b-1 (Radius 10 px), O-1b-2 (leichter Schatten) und O-1b-4 (nur Icon) entschieden.

- **Innenabstand:** `ero.butono.box.inline.padding.size.{small,medium,large}` → `spacing.scale.300` (12 px), gemessen an der Fonto (sm, md und lg je 12 px); der Generator hält den Innenabstand des butono nicht mehr fest (`BEHALTEN` nur noch die Kante der avizo). Herkunft: drei Angaben mehr.
- **Nur Icon** (Element, kein Token): fm-butono markiert seinen Knopf mit `data-icon-only`, solange sein Wort leer ist (auch ein später geschriebenes Wort, wie das des alsxutilo); dann ist er quadratisch – die Höhe seiner Größe auf beiden Seiten, aus demselben Ero-Token – ohne Innenabstand.
- **Eroj mit Knöpfen:** Bemaßt ein Ero einen Knopf-Teil, den es aus einem butono zusammensetzt (`size`: remove, edit, trigger, prev, next, increment, decrement, dismiss, clear), nimmt `::part(control)` die Maße des Teils (`inherit`) ohne Innenabstand – alsxutilo, avizo, datelektilo, kampo, lokredaktilo, signeto. Ein Knopf mit Wort, dem das Ero nur die Höhe gibt (clear des plurelektilo, save/cancel des lokredaktilo), behält seinen Innenabstand. Vorher liefen der Auslöser des datelektilo (32 px in 24 px) und die Stepper des kampo über.
- **Tests:** rot in `2257cdc` (Token 12 px; im Browser in drei Engines: 12 px mit Wort in jeder Größe, nur Icon quadratisch ohne Innenabstand mit dem Icon im Knopf; jeder Knopf nur mit Icon in datelektilo, kampo, lokredaktilo, avizo, signeto in seinem Teil, quadratisch, ohne Innenabstand), grün im Folgecommit. Keine Grenze angehoben.

Messanleitung wie „①b – Abnahme 28.10.“ (Vitrino und Vergleichsseite neu bauen); in der Vitrino zeigt der Abschnitt butono die Zeile „mit Icon“, die Abschnitte datelektilo und kampo ihre Knöpfe im Feld.
