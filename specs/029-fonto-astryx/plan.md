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

## ②a Abgleichstabelle

**Basis:** `main` nach #109 (`d29a520`) · **Branch:** `261023-spec-029-2a-abgleich-826849` · **Datum:** 2026-10-23 · **Stand:** entschieden am 24.10. ([Entscheidungen vom 24.10.](#entscheidungen-vom-2410)). **Nur plan und Daten, kein Umbau:** Kein Skemo, kein Token, keine Projekcio ist geändert.

### Zusammenfassung

1. **Daten:** [`abgleich.json`](abgleich.json) hält für jedes der 40 Eroj das Gegenstück in der Fonto mit Quellpfad und sechs Zeilen, eine je Aspekt:
   - Achsen und Werte
   - Größen
   - Zustände
   - Anatomie und Slots
   - Verhalten (Tastatur, ARIA)
   - Muster und Grenzen

   Jede Zeile hat einen Vorschlag – **übernehmen**, **anpassen** oder **behalten** – mit Begründung und das Feld `entscheidung` des Maintainers (seit 24.10. gefüllt, Ausnahmen als `auflage`). Die Tabellen unten zeigen dieselben Zeilen mit ihrem Vorschlag.
2. **Zahlen:** 240 Zeilen: 27 übernehmen, 72 anpassen, 141 behalten.

   | Aspekt | übernehmen | anpassen | behalten |
   |---|---|---|---|
   | Achsen und Werte | 0 | 30 | 10 |
   | Größen | 11 | 2 | 27 |
   | Zustände | 2 | 14 | 24 |
   | Anatomie und Slots | 9 | 19 | 12 |
   | Verhalten (Tastatur, ARIA) | 4 | 2 | 34 |
   | Muster und Grenzen | 1 | 5 | 34 |

   „Behalten“ heißt meist: Fundamento hat dasselbe schon, oder eine Regulo oder Grenze mit Kialo spricht dagegen (Amendment v2.4, Bedingung 5: Regeln haben Vorrang).
3. **Muster:** 14 Zeilen M-1 bis M-14 vor den Eroj, darunter die vier der Spec:
   - **M-1** Grund für deaktivierte Elemente: anpassen (Slot `disabled-reason`, das Element bleibt fokussierbar)
   - **M-2** Status-Modell der Felder: anpassen (`intent` mit Warnung und Erfolg, Ort `message-position`, kein Tooltip als Ort)
   - **M-3** Zweck-Achse des dialogo: übernehmen (`dismiss` mit `free`, `guarded`, `explicit`)
   - **M-4** Adaptive Darstellung: behalten, bis die Gattung Blatt (BottomSheet) mit Eroj-Runde 6 da ist
4. **Fehlende Gattungen:** 45 Gattungen der Fonto ohne Gegenstück:
   - 33 für Eroj-Runde 6, vorn die für den Nordstern wichtigen (Schrittanzeige, Seitenpanel, Blatt, Gruppe von Kontrollkästchen, Segmentschalter)
   - 5 für die Sxablonoj (Templates, später)
   - 6 sind kein Ero (Anordnung, Verhalten)
   - der Toast bleibt nach E6 eine Grenze
5. **Achsen:** Neue Achsen tragen Namen von Fundamento, nie den Bezeichner der Fonto: `corner`, `frame`, `months`, `readout`, `indicator-side`, `justify`, `spread`, `tone`, `lines`, `label-side`, `dismiss`, `message-position` (`lines` statt des Vorschlags `rules`, ②a-6). Wo Fundamento den Namen schon führt (`size`, `emphasis`, `intent`, `density`, `kind`, `summary`), bleibt er, auch an einem Ero, das die Achse neu bekommt; nur Werte und Anzahl richten sich nach der Fonto. Ein Test prüft beides.

### Entscheidungen vom 24.10.

Der Maintainer hat am 24.10. (10:37) entschieden: „alles wie empfohlen“ ([`briefing-a-2026-10-24.md`](briefing-a-2026-10-24.md), unverändert kopiert). In [`abgleich.json`](abgleich.json) ist deshalb bei allen 254 Zeilen (240 der Eroj, 14 Muster) `entscheidung` gleich dem Vorschlag (②a-1): 30 übernehmen, 74 anpassen, 150 behalten (die Eroj 27/72/141, die Muster 3/2/9). Wo der Maintainer etwas dazu sagt, steht es als `auflage` an der Zeile, an 14 Zeilen:

| Punkt | Entscheidung | Zeilen (`auflage`) |
|---|---|---|
| ②a-2 | `large` bei elekto, markobutono, sxaltilo bleibt **ein Release lang als Alias auf `medium`**, als veraltet markiert (Warnung im Gvidanto und in der Konsole), danach entfällt es | A-elekto-2, A-markobutono-2, A-sxaltilo-2 |
| ②a-3 | die acht Grenzen **wie in den Zeilen vorgeschlagen**; die Syntax-Hervorhebung kommt mit den Syntaxfarben in ②b (①-2), nicht schon mit ① | M-1 (tooltip-on-disabled), A-datelektilo-1 (multiple-months), A-elektilo-4 (grouped-options), A-langetaro-4 (many-tabs), A-ligilo-6 (download), A-spuro-6 (collapsed-middle), A-tekstareo-1 (character-count), A-kodbloko-6 (syntax-highlighting) |
| ②a-4 | **Fortschritt wird ein eigenes Ero, in Eroj-Runde 6**; der mezurilo bleibt der Stand | A-mezurilo-5 |
| ②a-5 | die Grenze **skeleton bleibt**, neu entschieden in Eroj-Runde 6 | A-plenstato-6 |
| ②a-6 | die Namen der neuen Achsen **angenommen, außer `rules` → `lines`** (Verwechslung mit den Reguloj); in `achsen` von A-tabelo-1 steht `lines` | A-tabelo-1 |

Vorschlag und Begründung jeder Zeile bleiben, wie sie am 23.10. standen; die Tabellen unten zeigen sie. Wo eine Begründung durch eine Auflage überholt ist (A-tabelo-1 nennt noch `rules`, A-kodbloko-6 die Syntaxfarben „aus ①“), gilt die Auflage. ②b setzt die Zeilen um.

### Fonto (gepinnt)

| | |
|---|---|
| Name | Astryx |
| Lizenz | MIT, Copyright (c) Meta Platforms, Inc. and affiliates. |
| Pakete | `@astryxdesign/core@0.7.4`, `@astryxdesign/theme-neutral@0.7.4` (theme-neutral verlangt core genau 0.7.4) |
| Integrity core | `sha512-zd/XfUw8OH8Dj65w6cPYamMXgb11P7oIgrlXgyBGaHXKJi3aedkU17Q+lERgv7YL3Bv4/UKPMqKL/QZkvoay1w==` |
| Integrity theme-neutral | `sha512-IoGRxRpcAWao4jNL+HsV0t3rlCWeV4EYrzP54iRRRXEzU21XxMdBt+B63y+n/84mBkzyB38vGK/BuYkRbVDBtw==` |
| Repo | `https://github.com/facebook/astryx`, Tag `v0.7.4` |
| Commit | `704757fd827c6fa00a71af80b06d5da99d155e45` |

Gelesen habe ich nur diese beiden Tarballs, geprüft gegen die Integrity der Registry, außerhalb des Repos. Aus `packages/core/src` in `@astryxdesign/core` kamen:
- je Komponente die Doku-Daten (`*.doc.mjs`): Props mit Typ und Standard, Anatomie, Hinweise zur Barrierefreiheit
- die Verträge (`*.spec.md`): Zustände, Tastatur, ARIA

theme-neutral brauchte ②a nicht; es ist die Quelle für ①. Kein anderes System und keine fremde Marke wurde gelesen.

Ins Repo kommen nur Namen von Komponenten und Props als Herkunft (Art. VII in der Fassung v2.4: Fonto-ID und Quellpfad). Keine Werte, keine Texte der Doku: Jede Begründung ist neu geschrieben. Ein Test prüft, dass `abgleich.json` keine Farbe und keine Länge enthält.

### Wie die Tabelle zu lesen ist

- **übernehmen:** Der Wert, die Achse oder das Verhalten der Fonto kommt so, wie er ist, unter unseren Namen.
- **anpassen:** Wir übernehmen den Kern, aber geändert: anderer Name, weniger Werte, ohne den Teil, der eine Regulo verletzt. Was genau, steht in der Begründung.
- **behalten:** Fundamento bleibt, wie es ist. Entweder deckt es die Fonto schon ab, oder eine Regulo oder Grenze mit Kialo spricht dagegen.
- Verweise wie „M-2“ zeigen auf die Muster-Zeilen. „Grenze … (ask-human)“ nennt eine Grenze der Uzo, über die bisher der Maintainer entscheidet. Einige Zeilen schlagen vor, eine solche Grenze zu entscheiden; sie sind in O-3 gesammelt.
- Die Namen der Fonto (`variant`, `isDisabled` …) stehen nur in der Spalte „Fonto“ und dienen als Herkunft.

### Muster

Die Muster der Spec stehen als eigene Zeilen vor den Eroj; die Zeilen der Eroj verweisen auf sie.

| ID | Muster | Eroj | Fundamento | Fonto | Vorschlag | Begründung |
|---|---|---|---|---|---|---|
| M-1 | Grund für deaktivierte Elemente | `kampo`, `tekstareo`, `elektilo`, `listelektilo`, `plurelektilo`, `kompletigilo`, `datelektilo`, `glitilo`, `elekto`, `markobutono`, `sxaltilo`, `alsxutilo`, `butono`, `faldilo`, `menuo`, `langetaro`, `konsileto` | „deaktiviert“ ohne Grund; der butono wird von der Tastatur übersprungen; Grenze tooltip-on-disabled (ask-human) | `disabledMessage` an 19 Feldern: Tooltip bei Hover und Fokus, das Element bleibt mit aria-disabled fokussierbar | **anpassen** | Wer nicht weiß, warum etwas gesperrt ist, bleibt stecken. Übernehmen als Text-Slot `disabled-reason` an jedem Ero mit `disabled`: Das Element bleibt fokussierbar (aria-disabled, aria-describedby), der Grund erscheint im konsileto. Ohne Grund bleibt es wie heute. Entscheidet die Grenze tooltip-on-disabled. |
| M-2 | Gemeinsames Status-Modell der Felder | `kampo`, `tekstareo`, `elektilo`, `listelektilo`, `plurelektilo`, `kompletigilo`, `datelektilo`, `glitilo`, `elekto`, `markobutono`, `sxaltilo`, `alsxutilo` | Boolean `invalid` und Slot `error` unter dem Feld | Status mit 3 Arten (Fehler, Warnung, Erfolg) und Meldung; Ort der Meldung mit 3 Werten (am Feld, darunter, Tooltip); Fehler wird sofort, Warnung und Erfolg höflich angesagt | **anpassen** | Warnung und Erfolg fehlen uns. Übernehmen: Achse `intent` mit `neutral`, `success`, `warning`, `danger` an allen Feldern (Namen wie avizo und insigno); `invalid` bleibt als Kurzform für `danger`. Ort der Meldung mit eigenem Namen `message-position`: `joined` (am Feld) und `below`. Den Tooltip als Ort nicht: Die Meldung muss sichtbar sein (Reguloj error-not-color-only, error-says-what-to-do). |
| M-3 | Zweck-Achse des dialogo | `dialogo` | Der dialogo schließt mit Escape; ein Klick auf den Hintergrund ist nicht geregelt | Zweck mit 3 Werten: Info (Escape und Klick daneben schließen), Formular (nur Escape), Pflicht (nichts schließt nebenbei, Rolle alertdialog); dasselbe bei Seitenpanel und Blatt | **übernehmen** | Ein Formular verliert sonst Eingaben durch einen Klick daneben, und eine Pflichtfrage darf nicht verschwinden. Werte und Anzahl übernehmen, Namen nach unserem Vortaro: Achse `dismiss` mit `free`, `guarded`, `explicit`. `explicit` setzt die Rolle alertdialog. |
| M-4 | Adaptive Darstellung | `listelektilo`, `plurelektilo`, `datelektilo`, `menuo`, `sxvebilo`, `dialogo` | Aufklapplisten und Overlays sind auf jeder Breite verankert; die Dimensio viewport ändert nur Werte | Darstellung verankert, als Blatt von unten oder adaptiv (Blatt bei schmaler Breite und grobem Zeiger); Datum auch nativ | **behalten** | Das Blatt von unten (BottomSheet) ist eine eigene Gattung und kommt erst mit Eroj-Runde 6. Ohne sie gibt es nichts, wohin die Darstellung wechseln könnte. Vorschlag: in ②b nichts bauen und die Achse mit der Gattung einführen. |
| M-5 | Laden in Feldern | `kampo`, `tekstareo`, `elektilo`, `listelektilo`, `plurelektilo`, `kompletigilo`, `datelektilo`, `glitilo`, `elekto`, `markobutono`, `sxaltilo`, `alsxutilo` | Laden nur am butono und am kompletigilo | `isLoading` an fast allen Feldern, mit Spinner und aria-busy | **übernehmen** | Ein Schalter, der speichert, oder ein Feld, das prüft, braucht einen sichtbaren Zustand. Boolean `loading` an allen Feldern, wie am butono. |
| M-6 | Löschen-Knopf im Feld | `kampo`, `elektilo`, `listelektilo`, `plurelektilo`, `datelektilo`, `kompletigilo` | Löschen nur im kampo der Art search und im plurelektilo | `hasClear` an Text, Zahl, Auswahl, Datum und Vorschlagsfeld; beim Zeitraum standardmäßig an | **übernehmen** | Einen Wert zu leeren, ist bei Auswahl und Datum sonst umständlich. Boolean `clearable`, mit dem Namen „{label} leeren“ für Hilfsmittel. |
| M-7 | Optional statt Pflicht markieren | `kampo`, `tekstareo`, `elektilo`, `listelektilo`, `plurelektilo`, `kompletigilo`, `datelektilo`, `glitilo`, `elekto`, `markobutono`, `sxaltilo`, `alsxutilo` | Pflichtfelder sind markiert (Regulo required-marked) | Markierung „optional“ oder „Pflicht“, je nach Vorgabe des Formulars | **behalten** | Zwei Markierungen wären zwei Wege. Die Vorgabe je Formular gehört zur Sxablono formularo, also zu den Templates. |
| M-8 | Verborgene Beschriftung | `kampo`, `tekstareo`, `elektilo`, `listelektilo`, `plurelektilo`, `kompletigilo`, `datelektilo`, `glitilo`, `elekto`, `markobutono`, `sxaltilo`, `alsxutilo` | Grenze no-visible-label (not-supported), Regulo field-label-visible | `isLabelHidden` an allen Feldern | **behalten** | Die Regulo gewinnt (Amendment v2.4, Bedingung 5): Ein Feld ohne sichtbare Beschriftung verliert, wer den Platzhalter überschreibt. |
| M-9 | Hilfe hinter einem Icon an der Beschriftung | `kampo`, `tekstareo`, `elektilo`, `listelektilo`, `plurelektilo`, `kompletigilo`, `datelektilo`, `glitilo`, `elekto`, `markobutono`, `sxaltilo`, `alsxutilo` | Hilfe steht als ein Satz im Slot `help` (Regulo help-is-one-sentence) | `labelTooltip`: Info-Icon mit Tooltip an der Beschriftung | **behalten** | Was man zum Ausfüllen braucht, steht sichtbar da; ein Tooltip ist auf Touch schwer zu erreichen. |
| M-10 | Icon-Größe aus dem Zusammenhang | `ikono`, `butono`, `ligilo`, `signeto` | Die Größe des Icons ist im Skemo des Ero gebunden (Teil `icon`, `size` nach der Größe des Ero) | Ein Icon ohne Größe nimmt die Größe aus dem umgebenden Knopf oder Feld | **behalten** | Wir haben dasselbe Ergebnis über die Bindung im Skemo; sie ist maschinenlesbar und gilt in Figma ebenso. |
| M-11 | Tooltip als Prop an Steuerelementen | `butono`, `ligilo`, `avataro`, `konsileto` | Tooltips nur über den konsileto mit `for` | `tooltip` an Knopf, Link und Avatar | **behalten** | Ein Weg je Aufgabe (Art. XIII). Der konsileto trägt seine Regulo tooltip-text-short; ein Prop am Knopf wäre ein zweiter Ort. |
| M-12 | Erhebung als Prop | `butono`, `avizo`, `karto` | Erhebung gehört zur Fläche (Rollen der Grundlagen) | `elevation` mit 4 Stufen an Knopf, Banner und Karte | **behalten** | Die Stufen der Erhebung kommen mit ① in die Grundlagen. Ein Ero trägt sie über seine Fläche, nicht als Prop. |
| M-13 | Breite je Ero | `kampo`, `tekstareo`, `elektilo`, `listelektilo`, `plurelektilo`, `kompletigilo`, `datelektilo`, `glitilo`, `elekto`, `markobutono`, `sxaltilo`, `alsxutilo`, `butono` | Breite und Abstand gehören dem Container (Regulo spacing-owned-by-container); `full-width` am butono | `width` an fast jeder Komponente | **behalten** | Die Regulo gewinnt. Breiten setzt der Container, in Figma die Instanz (Spec 027). |
| M-14 | Aktion, die selbst lädt | `butono`, `sxaltilo`, `markobutono` | Das Ero meldet ein Ereignis; `loading` setzt die Anwendung | Die Komponente zeigt „lädt“, solange die übergebene Aktion läuft | **behalten** | Das ist eine Frage der React-Projektion, nicht des Skemo. Die Web Components bleiben bei Ereignissen. |

### Abgleich je Ero

Je Ero sechs Zeilen: Achsen und Werte, Größen, Zustände, Anatomie und Slots, Verhalten (Tastatur, ARIA), Muster und Grenzen. Die Quelle steht unter dem Namen, relativ zu `packages/core` im Paket.

#### `alsxutilo` ↔ FileInput

Quelle: `src/FileInput/FileInput.doc.mjs`

| ID | Aspekt | Fundamento | Fonto | Vorschlag | Begründung |
|---|---|---|---|---|---|
| A-alsxutilo-1 | Achsen und Werte | `accept`, `max-size`, `multiple`, `dropzone` (Boolean), `required`, `disabled`, `invalid`, `name` | `accept`, `maxSize`, `maxFiles`, `isMultiple`, `mode` (2 Werte: Feld oder Ablagefläche), `isLoading`, `status`, `disabledMessage` | **anpassen** | Die Höchstzahl der Dateien fehlt uns und wird als Zahl `max-files` übernommen. `dropzone` deckt die zwei Darstellungen der Fonto schon ab und bleibt Boolean. Status und Grund für „deaktiviert“ kommen aus den Mustern M-1 und M-2. |
| A-alsxutilo-2 | Größen | keine Größenachse | keine Größenachse, nur eine Breite | **behalten** | Beide Systeme kennen keine Größenstufen. Die Breite gehört dem Container (Regulo spacing-owned-by-container). |
| A-alsxutilo-3 | Zustände | rest, hover, focus, disabled, invalid, dragover | dazu Laden, Warnung und Erfolg | **anpassen** | Status nach M-2 (Warnung, Erfolg) und Laden nach M-5. Beim Prüfen großer Dateien ist „lädt“ ein echter Zustand. |
| A-alsxutilo-4 | Anatomie und Slots | label, required-mark, dropzone, drop-hint, choose, help, error, file-list, file-name, file-size, remove | Beschriftung, Beschreibung, Ablagefläche, Upload-Icon, Platzhalter, Dateiname, Löschen, Spinner, Statusmeldung | **anpassen** | Das Upload-Icon in der Ablagefläche übernehmen; `upload` steht schon im Ikonaro. Die übrigen Teile decken sich, unsere Liste ist feiner. |
| A-alsxutilo-5 | Verhalten (Tastatur, ARIA) | Rolle button, Space und Enter, aria-required, aria-invalid, aria-disabled | natives Dateifeld mit Beschriftung, Ablagefläche per Tastatur bedienbar; deaktiviert mit Grund bleibt fokussierbar | **behalten** | Tastatur und Rollen sind gleichwertig. Nur der Grund für „deaktiviert“ ändert das Verhalten, und der steht als M-1 für alle Eroj. |
| A-alsxutilo-6 | Muster und Grenzen | Grenzen upload-progress und image-preview (ask-human), camera-capture (not-supported) | Prüfung von Typ, Größe und Anzahl mit Statusmeldung; kein Fortschritt, keine Bildvorschau | **behalten** | Die Fonto deckt Fortschritt und Vorschau auch nicht ab. Unsere Grenzen bleiben, bis der Maintainer sie entscheidet. Die Vorschau gehört zur fehlenden Gattung Thumbnail. |

#### `apartigilo` ↔ Divider

Quelle: `src/Divider/Divider.doc.mjs`

| ID | Aspekt | Fundamento | Fonto | Vorschlag | Begründung |
|---|---|---|---|---|---|
| A-apartigilo-1 | Achsen und Werte | `orientation` horizontal \| vertical, `decorative` | `orientation`, `variant` mit 2 Stärken, `label`, `isFullBleed` | **anpassen** | Zwei Stärken der Linie sind sinnvoll, etwa zwischen Abschnitten und innerhalb einer Karte. Wir nennen die Achse nach unserem Vortaro `emphasis` mit `low` und `high`; die Werte richten sich nach der Anzahl der Fonto. |
| A-apartigilo-2 | Größen | keine Größe | keine Größe; `isFullBleed` hebt den Innenabstand des Containers auf | **behalten** | Ob eine Linie bis an den Rand geht, bestimmt der Container (Regulo spacing-owned-by-container), nicht das Ero. |
| A-apartigilo-3 | Zustände | rest | rest | **behalten** | Eine Linie hat keine Zustände, in beiden Systemen. |
| A-apartigilo-4 | Anatomie und Slots | line, box | Linie und optionale Beschriftung in der Mitte | **behalten** | Unsere Grenze labelled-line (ask-human) begründet: Eine Linie mit Wort ist eine Überschrift. Die Beschriftung bleibt offen, bis der Maintainer die Grenze entscheidet (O-3). |
| A-apartigilo-5 | Verhalten (Tastatur, ARIA) | Rolle separator, dekorativ ohne Rolle | separator mit aria-orientation, beschriftet über aria-labelledby | **behalten** | Die Semantik ist gleich. Eine Beschriftung käme nur mit der Grenze aus der Zeile davor. |
| A-apartigilo-6 | Muster und Grenzen | Abstand zwischen Geschwistern gehört dem Container | Linie trennt auch interaktive Bereiche in einem Layout | **behalten** | Die Fonto ergänzt kein Muster, das uns fehlt. Unsere Regel für Abstände bleibt. |

#### `atributlisto` ↔ MetadataList

Quelle: `src/MetadataList/MetadataList.doc.mjs`

| ID | Aspekt | Fundamento | Fonto | Vorschlag | Begründung |
|---|---|---|---|---|---|
| A-atributlisto-1 | Achsen und Werte | `layout` columns \| stacked \| auto, `label` | `columns` (eine, mehrere oder Zahl), Beschriftung vorn oder oben, `orientation`, `maxNumOfItems`, `title` | **anpassen** | Unsere drei Werte von `layout` decken Beschriftung vorn, oben und automatisch ab. Neu übernehmen: die Höchstzahl sichtbarer Einträge als Zahl `max-entries` mit „mehr anzeigen“. Mehrspaltigkeit ist Sache des Containers. |
| A-atributlisto-2 | Größen | keine Größe | keine Größe; Breite der Beschriftung einstellbar | **behalten** | Die Breite der Beschriftung folgt dem Raster der Sxablonoj, nicht einem Prop des Ero. |
| A-atributlisto-3 | Zustände | rest | rest; aufgeklappt, wenn Einträge verborgen sind | **anpassen** | Mit `max-entries` kommt der Zustand „aufgeklappt“ hinzu, mit aria-expanded am Knopf. |
| A-atributlisto-4 | Anatomie und Slots | term, value, list, box; Slot entries | Titel, Beschriftung, Wert, Aufklapp-Knopf | **anpassen** | Den Titel als Slot `heading` und den Teil `more` übernehmen. Begriff und Wert decken sich. |
| A-atributlisto-5 | Verhalten (Tastatur, ARIA) | Rolle list, Name aus `label`, Text „keine Angabe“ für leere Werte | Beschreibungsliste ohne eigene Tastatur | **behalten** | Gleichwertig. Unser Leertext bleibt. |
| A-atributlisto-6 | Muster und Grenzen | Grenze nested (not-supported) | flache Liste | **behalten** | Die Fonto verschachtelt auch nicht; unsere Grenze bleibt mit ihrer Kialo. |

#### `avataro` ↔ Avatar

Quelle: `src/Avatar/Avatar.doc.mjs`

| ID | Aspekt | Fundamento | Fonto | Vorschlag | Begründung |
|---|---|---|---|---|---|
| A-avataro-1 | Achsen und Werte | `name`, `picture`, `size` small \| medium \| large, `decorative` | Bild, Ersatzbild, Name, Alt-Text, 5 benannte Größen, Form mit 3 Werten (rund, abgerundet, eckig), Status, Tooltip, Link | **anpassen** | Die Form übernehmen, um Personen (rund) von Teams oder Dingen (eckig) zu unterscheiden. Name nach unserem Vortaro: Achse `corner` mit `round`, `soft`, `square`. Status, Tooltip und Link nicht (siehe Zeilen 4 und 6). |
| A-avataro-2 | Größen | 3 Stufen | 5 Stufen | **übernehmen** | Anzahl der Fonto: zwei Stufen mehr, für dichte Listen und Profilköpfe. Werte `x-small` bis `x-large`; jede Stufe bekommt Ero-Tokens für alle Marken. |
| A-avataro-3 | Zustände | rest | rest; als Link oder Knopf auch hover und focus | **behalten** | Ein Avatar, der etwas tut, ist bei uns ein ligilo oder butono mit Avatar darin. So bleibt eine Bedeutung je Ero. |
| A-avataro-4 | Anatomie und Slots | image, initials | Foto, Initialen, Standard-Icon, Statuspunkt | **anpassen** | Das Standard-Icon ohne Namen übernehmen; der Name des Icons kommt aus Phosphor (Spec: Ikonaro bleibt Phosphor). Der Statuspunkt bleibt unsere Grenze presence-dot (ask-human). |
| A-avataro-5 | Verhalten (Tastatur, ARIA) | Rolle img mit Namen, dekorativ aria-hidden | img mit Namen, ohne Namen dekorativ (presentation, aria-hidden) | **behalten** | Rolle und Name decken sich; ohne Namen ist das Bild in beiden Systemen Schmuck. |
| A-avataro-6 | Muster und Grenzen | Grenzen avatar-group und presence-dot (ask-human); konsileto zeigt den Namen | Tooltip mit dem Namen standardmäßig an | **behalten** | Ein Weg für Tooltips: der konsileto mit `for` (Art. XIII). Die Gruppe steht als fehlende Gattung AvatarGroup in der Liste. |

#### `avizo` ↔ Banner

Quelle: `src/Banner/Banner.doc.mjs`

| ID | Aspekt | Fundamento | Fonto | Vorschlag | Begründung |
|---|---|---|---|---|---|
| A-avizo-1 | Achsen und Werte | `intent` info \| success \| warning \| danger, `dismissible` | `status` mit denselben 4 Bedeutungen, `isDismissable`, `container` (Karte oder Band), `elevation`, `collapsible`, `icon` | **anpassen** | Werte und Anzahl stimmen schon. Neu übernehmen: die Wahl zwischen Karte im Inhalt und Band über die ganze Breite oben auf der Seite, als Achse `frame` mit `card` und `band`. Elevation nicht (M-12). |
| A-avizo-2 | Größen | keine Größe | keine Größe | **behalten** | Eine Meldung nimmt die Breite ihres Ortes; Stufen bringen ihr nichts. |
| A-avizo-3 | Zustände | rest | rest; aufgeklappt oder zugeklappt bei langer Beschreibung | **behalten** | Lange Details stehen bei uns im Slot `details`, aufklappbar mit einem faldilo darin. Ein eigener Zustand wäre ein zweiter Weg. |
| A-avizo-4 | Anatomie und Slots | surface, icon, accent, heading, message, details, actions, dismiss | Rahmen, Statusfläche, Icon, Titel, Beschreibung, Aktion, Schließen, Inhaltsfläche | **behalten** | Die Teile decken sich; `accent` ist unsere farbige Kante. |
| A-avizo-5 | Verhalten (Tastatur, ARIA) | Rolle status für alle Werte | alert für Warnung und Fehler, status für Info und Erfolg | **übernehmen** | Warnungen und Fehler sollen sofort angesagt werden. Die Rolle folgt dem `intent`: warning und danger → alert. |
| A-avizo-6 | Muster und Grenzen | Grenzen toast (not-supported, E6) und stacked-notices (ask-human) | Banner bleibt stehen; Toast ist ein eigenes Ero der Fonto | **behalten** | Die Fonto bestätigt unsere Trennung: Was stehen bleibt, ist ein avizo. Der Toast bleibt nach E6 außen vor (siehe Liste der fehlenden Gattungen). |

#### `butono` ↔ Button, IconButton

Quelle: `src/Button/Button.doc.mjs`, `src/IconButton/IconButton.doc.mjs`

| ID | Aspekt | Fundamento | Fonto | Vorschlag | Begründung |
|---|---|---|---|---|---|
| A-butono-1 | Achsen und Werte | `emphasis` high \| medium \| low, `intent` neutral \| danger, `type`, `full-width`, `loading`, `disabled`, `label` | `variant` mit 4 Werten (primär, sekundär, ghost, destruktiv), `elevation`, `isLoading`, `isIconOnly`, `width`, `tooltip`, `href` | **behalten** | Dieselben vier Erscheinungen haben wir auf zwei Achsen: high, medium, low und high mit danger (Art. II, v2.2, Jugxo zur Umbenennung). Elevation, Tooltip, Breite und Link nicht: M-11, M-12, M-13 und die Grenze navigation. |
| A-butono-2 | Größen | small \| medium \| large | 3 Stufen | **behalten** | Gleiche Anzahl; die Werte heißen wie bei uns. |
| A-butono-3 | Zustände | rest, hover, pressed, focus, disabled, loading | dieselben; Laden auf Wunsch unterbrechbar | **behalten** | Gleich. Ein unterbrechbares Laden ist Sache der Anwendung. |
| A-butono-4 | Anatomie und Slots | Slots label, icon-start, icon-end; Icon-Knopf über `label` | Icon, Beschriftung, Endinhalt (Icon oder Badge), Spinner; eigener IconButton | **anpassen** | Den Endinhalt erweitern: `icon-end` nimmt auch ein insigno auf, etwa einen Zähler. Der Icon-Knopf bleibt ein butono mit `label` (Regulo label-required), kein eigenes Ero. |
| A-butono-5 | Verhalten (Tastatur, ARIA) | Enter, Space; deaktiviert wird übersprungen; Laden mit aria-busy | Laden behält den Fokus; deaktiviert mit Tooltip bleibt fokussierbar (aria-disabled) | **anpassen** | Mit Grund für „deaktiviert“ bleibt der Knopf fokussierbar und sagt den Grund an (M-1). Ohne Grund bleibt es wie heute. |
| A-butono-6 | Muster und Grenzen | Grenzen navigation (use-instead ligilo), form-in-slot, multi-line-label; Reguloj one-primary-per-container, destructive-not-primary-color | Knopf mit `href`; höchstens eine primäre Aktion je Ansicht | **behalten** | Unsere Regulo link-navigates-button-acts trennt Ziel und Aktion; die Fonto rät dasselbe. Die Regel zur primären Aktion deckt sich. |

#### `datelektilo` ↔ DateInput, DateRangeInput, Calendar

Quelle: `src/DateInput/DateInput.doc.mjs`, `src/DateRangeInput/DateRangeInput.doc.mjs`, `src/Calendar/Calendar.doc.mjs`

| ID | Aspekt | Fundamento | Fonto | Vorschlag | Begründung |
|---|---|---|---|---|---|
| A-datelektilo-1 | Achsen und Werte | `mode` single \| range, `value`, `value-start`, `value-end`, `min`, `max`, `disabled-dates`, `required`, `readonly`, `invalid`, `expanded` | zwei Komponenten; Zahl der Monate (1 oder 2), Wochenbeginn, Format, Vorauswahlen, Löschen, kürzeste und längste Spanne, Darstellung | **anpassen** | Übernehmen: die Zahl der sichtbaren Monate als Achse `months` mit `1` und `2` (entscheidet die Grenze multiple-months), die Spannen `min-span` und `max-span` für den Zeitraum und Löschen nach M-6. Wochenbeginn und Format kommen bei uns aus der Sprache. |
| A-datelektilo-2 | Größen | keine Größe | 3 Stufen | **übernehmen** | Ein Datumsfeld steht oft in einer Zeile mit kampo und elektilo und braucht deren Höhe. Achse `size` wie beim kampo. |
| A-datelektilo-3 | Zustände | rest, hover, focus, disabled, readonly, invalid | dazu Laden, Warnung, Erfolg | **anpassen** | Status nach M-2 (Warnung, Erfolg) und Laden nach M-5. |
| A-datelektilo-4 | Anatomie und Slots | label, required-mark, surface, border, text, trigger, calendar, month, prev, next, weekday, cell, day, selected, in-range, today, outside-day, help, error | dazu Löschen-Knopf, Leiste mit Vorauswahlen, Wochennummern auf Wunsch | **anpassen** | Den Löschen-Knopf übernehmen (M-6). Vorauswahlen bleiben die Grenze presets (ask-human), Wochennummern nicht. |
| A-datelektilo-5 | Verhalten (Tastatur, ARIA) | Pfeile, PageUp/PageDown, Home/End, Enter, Escape (Raster nach APG) | dieselbe Tastatur; auf Touch der native Picker | **behalten** | Die Tastatur ist gleich. Der native Picker auf Touch ist adaptive Darstellung und steht unter M-4. |
| A-datelektilo-6 | Muster und Grenzen | Grenze time-of-day (use-instead kampo time) | eigene Komponenten für Uhrzeit und für Datum mit Uhrzeit | **behalten** | Die Uhrzeit hat der kampo seit Spec 025. Datum mit Uhrzeit steht als DateTimeInput in der Liste der fehlenden Gattungen. |

#### `dialogo` ↔ Dialog, AlertDialog

Quelle: `src/Dialog/Dialog.doc.mjs`, `src/AlertDialog/AlertDialog.doc.mjs`

| ID | Aspekt | Fundamento | Fonto | Vorschlag | Begründung |
|---|---|---|---|---|---|
| A-dialogo-1 | Achsen und Werte | `open`, `size` small \| medium, `reason` none \| optional \| required | `variant` (normal, Vollbild), `purpose` mit 3 Werten, Breite, Höhe; eigener AlertDialog | **anpassen** | Die Zweck-Achse übernehmen wir nach M-3. `reason` (Begründungsfeld) bleibt unser eigenes Muster. Das Vollbild wird ein Wert von `size` (nächste Zeile). |
| A-dialogo-2 | Größen | small \| medium | freie Breite und Vollbild | **anpassen** | Einen dritten Wert `full` für lange Formulare und für die schmale Bildschirmbreite übernehmen. Freie Breiten nicht: Die Stufen kommen aus den Container-Tokens. |
| A-dialogo-3 | Zustände | rest | rest | **behalten** | Ein Dialog hat keine eigenen Zustände; Laden zeigt sein Inhalt. |
| A-dialogo-4 | Anatomie und Slots | backdrop, surface, border, heading, message, reason, content, actions | Kopf, Inhalt, Fuß, Hintergrund | **behalten** | Die Teile decken sich; unsere sind feiner und tragen das Begründungsfeld. |
| A-dialogo-5 | Verhalten (Tastatur, ARIA) | Rolle dialog, Escape, Enter | dialog, bei Pflicht alertdialog; Fokus bleibt im Dialog; Escape nach Zweck | **anpassen** | Die Rolle alertdialog und das Verhalten von Escape folgen der Zweck-Achse aus M-3. |
| A-dialogo-6 | Muster und Grenzen | Grenzen drawer (ask-human), nested-dialog (not-supported); Regulo dialog-title-names-the-decision | Seitenpanel und Blatt von unten als eigene Komponenten | **behalten** | Unsere Grenzen bleiben. Drawer und BottomSheet stehen in der Liste der fehlenden Gattungen. |

#### `elektilo` ↔ Selector

Quelle: `src/Selector/Selector.doc.mjs`

| ID | Aspekt | Fundamento | Fonto | Vorschlag | Begründung |
|---|---|---|---|---|---|
| A-elektilo-1 | Achsen und Werte | `value`, `placeholder`, `required`, `invalid`, `size`, `disabled`, `name`, `empty-label` | dazu Nur-Lesen, Suche, Löschen, `variant` (Feld, sekundär, ghost), Darstellung, Start-Icon, Laden | **anpassen** | `readonly` übernehmen; es fehlt nur hier unter den Feldern. Suche bleibt beim listelektilo und kompletigilo, Löschen nach M-6. Den Knopf-Look nicht: Ein Auswahlfeld, das wie ein Knopf aussieht, ist ein menuo. |
| A-elektilo-2 | Größen | small \| medium \| large | 3 Stufen | **behalten** | Drei Stufen in beiden Systemen; die Werte heißen wie bei uns. |
| A-elektilo-3 | Zustände | rest, hover, focus, disabled, invalid | dazu Nur-Lesen, Laden, Warnung, Erfolg | **anpassen** | Nur-Lesen (Zeile 1). Status nach M-2 (Warnung, Erfolg) und Laden nach M-5. |
| A-elektilo-4 | Anatomie und Slots | label, required-mark, surface, border, text, placeholder, indicator, help, error | dazu Start-Icon, Löschen, Status-Icon, Suchzeile, Abschnittsüberschrift, Leerzustand | **anpassen** | Abschnittsüberschriften für Optionsgruppen übernehmen; das entscheidet die Grenze grouped-options (ask-human). Das Start-Icon nicht, wie beim kampo (icon-in-field). |
| A-elektilo-5 | Verhalten (Tastatur, ARIA) | combobox, Pfeile, Enter, Escape | dazu Home/End und Tippen springt zur passenden Option, wie beim nativen Auswahlfeld; nur lesbar bleibt fokussierbar | **übernehmen** | Home/End und Springen per Tippen erwartet jeder vom nativen Auswahlfeld. Kein Widerspruch zu einer Regulo. |
| A-elektilo-6 | Muster und Grenzen | Grenze custom-popup (use-instead listelektilo) | eine Komponente für beides | **behalten** | Wir trennen das native Auswahlfeld (elektilo) vom gestalteten (listelektilo). Die Trennung hält die Uzo eindeutig. |

#### `elekto` ↔ RadioList

Quelle: `src/RadioList/RadioList.doc.mjs`

| ID | Aspekt | Fundamento | Fonto | Vorschlag | Begründung |
|---|---|---|---|---|---|
| A-elekto-1 | Achsen und Werte | `value`, `required`, `invalid`, `size`, `disabled`, `name`, `orientation` | dieselben, dazu `disabledMessage`, `status`, `isOptional` | **behalten** | Die Achsen decken sich; Grund und Status kommen aus M-1 und M-2. |
| A-elekto-2 | Größen | small \| medium \| large | 2 Stufen | **übernehmen** | Anzahl der Fonto: zwei Stufen. `large` entfällt; für Bestehendes gilt ein Übergang (O-2). |
| A-elekto-3 | Zustände | rest, hover, focus, disabled, invalid | dazu Warnung und Erfolg | **anpassen** | Warnung und Erfolg kommen aus dem Status-Modell M-2. |
| A-elekto-4 | Anatomie und Slots | label, option-label, required-mark, help, error, indicator, options | Kopf, Optionen, je Option Beschriftung und Beschreibung | **übernehmen** | Eine Beschreibung je Option übernehmen (Teil `option-description`), etwa für Tarife oder Lieferarten. |
| A-elekto-5 | Verhalten (Tastatur, ARIA) | radiogroup, Pfeile, Space | dasselbe Muster (APG) | **behalten** | Beide folgen dem Muster radiogroup nach APG: Pfeile wählen, Space bestätigt. |
| A-elekto-6 | Muster und Grenzen | Regulo elekto-options-few (höchstens 5); Grenze single-option (not-supported) | für kleine Mengen, alle Optionen sichtbar | **behalten** | Die Fonto rät dasselbe. Unsere Regulo bleibt. |

#### `faldilo` ↔ Collapsible

Quelle: `src/Collapsible/Collapsible.doc.mjs`

| ID | Aspekt | Fundamento | Fonto | Vorschlag | Begründung |
|---|---|---|---|---|---|
| A-faldilo-1 | Achsen und Werte | `open`, `group` | offen, deaktiviert, Seite des Pfeils (Anfang oder Ende), Gruppe | **anpassen** | Die Seite des Pfeils übernehmen, unter eigenem Namen: Achse `indicator-side` mit `start` und `end`. Deaktiviert ebenfalls übernehmen (nächste Zeilen). |
| A-faldilo-2 | Größen | keine Größe | keine Größe | **behalten** | Ein Aufklappbereich nimmt die Breite seines Ortes; Stufen bringen ihm nichts. |
| A-faldilo-3 | Zustände | rest, hover, focus | dazu deaktiviert | **übernehmen** | Ein Abschnitt, der gerade nicht aufgehen darf, braucht „deaktiviert“ mit Grund (M-1). |
| A-faldilo-4 | Anatomie und Slots | summary, indicator, content | Container, Auslöser, Pfeil, Inhalt, Gruppen-Container | **behalten** | Gleich; die Gruppe ist bei uns das Prop `group`. |
| A-faldilo-5 | Verhalten (Tastatur, ARIA) | Rolle group, aria-expanded, Enter und Space | Knopf mit aria-expanded und aria-controls | **behalten** | Beide zeigen den Zustand mit aria-expanded am Auslöser; Enter und Space schalten. |
| A-faldilo-6 | Muster und Grenzen | Grenze nested-disclosure (ask-human) | Gruppe, in der immer nur einer offen ist | **behalten** | `group` deckt das schon. Die Grenze bleibt. |

#### `glitilo` ↔ Slider

Quelle: `src/Slider/Slider.doc.mjs`

| ID | Aspekt | Fundamento | Fonto | Vorschlag | Begründung |
|---|---|---|---|---|---|
| A-glitilo-1 | Achsen und Werte | `min`, `max`, `step`, `value`, `range`, `field` (Boolean), `required`, `disabled`, `readonly`, `invalid` | dazu Ausrichtung, Wertanzeige mit 3 Werten (Tooltip, Text, keine), Markierungen, Mindestabstand der Griffe, Format | **anpassen** | Die Wertanzeige mit drei Werten übernehmen und `field` darin aufgehen lassen, unter eigenem Namen: `readout` mit `none`, `text`, `field`. Den Tooltip nicht: Er verdeckt den Wert beim Ziehen auf Touch, das Eingabefeld leistet mehr. Mindestabstand im Bereich übernehmen. |
| A-glitilo-2 | Größen | keine Größe | keine Größe | **behalten** | Spur und Griff haben feste Maße aus den Tokens; eine Größenachse fehlt in beiden. |
| A-glitilo-3 | Zustände | rest, hover, focus, pressed, disabled, invalid | dazu Warnung und Erfolg | **anpassen** | Warnung und Erfolg kommen aus dem Status-Modell M-2. |
| A-glitilo-4 | Anatomie und Slots | label, required-mark, track, fill, thumb, number, min-label, max-label, help, error | dazu Markierungen, Beschriftung der Markierungen, Tooltip des Werts | **anpassen** | Markierungen ohne Beschriftung übernehmen (Teil `tick`). Beschriftete Markierungen bleiben die Grenze ticks-with-labels (ask-human). |
| A-glitilo-5 | Verhalten (Tastatur, ARIA) | slider, Pfeile, PageUp/PageDown, Home/End | dasselbe Muster (APG), Wert als Text über das Format | **behalten** | Beide folgen dem Muster slider nach APG, mit dem Wert als Text für Hilfsmittel. |
| A-glitilo-6 | Muster und Grenzen | Grenze vertical-track (ask-human); Regulo range-stated | senkrechte Ausrichtung | **behalten** | Die Grenze bleibt, bis der Maintainer sie entscheidet; die Regulo range-stated gilt weiter. |

#### `ikono` ↔ Icon

Quelle: `src/Icon/Icon.doc.mjs`

| ID | Aspekt | Fundamento | Fonto | Vorschlag | Begründung |
|---|---|---|---|---|---|
| A-ikono-1 | Achsen und Werte | `name` (21), `size`, `intent` neutral \| info \| success \| warning \| danger, `label` | Icon, Farbe mit 9 Werten (Texthierarchie, Akzent, Status, erben), Größe, Beschriftung | **behalten** | Die Statusfarben haben wir als `intent`. Die Farben der Texthierarchie bekommt ein Icon, indem es die Farbe seines Textes erbt, wie im butono. Ein zweiter Weg wäre doppelt. |
| A-ikono-2 | Größen | small \| medium \| large | 4 Stufen | **übernehmen** | Anzahl der Fonto: die kleine Stufe `x-small` für Status-Icons im Feld (M-2) und dichte Tabellen. |
| A-ikono-3 | Zustände | rest | rest | **behalten** | Ein Icon hat keine Zustände; die Farbe kommt aus dem Ero, das es trägt. |
| A-ikono-4 | Anatomie und Slots | glyph | Glyphe | **behalten** | Ein Icon ist in beiden Systemen nur seine Glyphe. |
| A-ikono-5 | Verhalten (Tastatur, ARIA) | Rolle img mit Namen; ohne Namen dekorativ | dasselbe | **behalten** | Mit Namen ein Bild, ohne Namen Schmuck: in beiden Systemen dieselbe Regel. |
| A-ikono-6 | Muster und Grenzen | Ikonaro aus Phosphor | eigene Icons je Theme | **behalten** | Die Spec schließt das Icon-Set der Fonto aus; das Ikonaro bleibt Phosphor. |

#### `insigno` ↔ Badge, StatusDot

Quelle: `src/Badge/Badge.doc.mjs`, `src/StatusDot/StatusDot.doc.mjs`

| ID | Aspekt | Fundamento | Fonto | Vorschlag | Begründung |
|---|---|---|---|---|---|
| A-insigno-1 | Achsen und Werte | `intent` neutral \| info \| success \| warning \| danger, `size` small \| medium | 5 Statuswerte und 9 Farbtöne für Kategorien, Icon | **behalten** | Die 5 Statuswerte decken sich. Die Farbtöne für Kategorien gehören zum signeto (Grenze tinted-categories), sonst verwischt der Unterschied, den die Spec in ②b verlangt. |
| A-insigno-2 | Größen | small \| medium | keine Größe | **behalten** | Zwei Stufen braucht die dichte Tabelle; eine Stufe zu streichen, bringt keinen Gewinn. |
| A-insigno-3 | Zustände | rest | rest | **behalten** | Ein Statusetikett ist nicht interaktiv und hat keine Zustände. |
| A-insigno-4 | Anatomie und Slots | surface, border, text; Slots label, description | Icon und Beschriftung | **übernehmen** | Einen Slot `icon-start` übernehmen: Status mit Icon und Text ist nicht nur Farbe. |
| A-insigno-5 | Verhalten (Tastatur, ARIA) | ohne Rolle, Name aus der Beschriftung | ohne Rolle | **behalten** | Das Etikett ist Text in seinem Zusammenhang; eine eigene Rolle braucht es nicht. |
| A-insigno-6 | Muster und Grenzen | Grenzen dot-only (not-supported), brand-badge (ask-human), removable-chip (use-instead signeto) | Statuspunkt mit Text als eigene Komponente | **behalten** | Ein Punkt ohne Text verletzt unsere Grenze dot-only. Mit Text ist er ein insigno; der Punkt wäre ein Wert der Form, kein neues Ero. |

#### `kampo` ↔ TextInput, NumberInput, TimeInput, Field, FieldStatus

Quelle: `src/TextInput/TextInput.doc.mjs`, `src/NumberInput/NumberInput.doc.mjs`, `src/TimeInput/TimeInput.doc.mjs`, `src/Field/Field.doc.mjs`, `src/FieldStatus/FieldStatus.doc.mjs`

| ID | Aspekt | Fundamento | Fonto | Vorschlag | Begründung |
|---|---|---|---|---|---|
| A-kampo-1 | Achsen und Werte | `kind` (9 Arten), `value`, `placeholder`, `required`, `disabled`, `readonly`, `invalid`, `size`, `name`, `min`, `max`, `autocomplete`, `stepper`, `step` | eigene Komponenten für Text, Zahl, Uhrzeit; Löschen, Start-Icon, Laden, Einheit, nur ganze Zahlen, Format | **anpassen** | Übernehmen: Löschen für alle Arten außer password (M-6) und die Einheit als Text `unit` für Zahlen. Eine Komponente mit `kind` bleibt. |
| A-kampo-2 | Größen | small \| medium \| large | 3 Stufen | **behalten** | Drei Stufen in beiden Systemen; die Werte heißen wie bei uns. |
| A-kampo-3 | Zustände | rest, hover, focus, disabled, readonly, invalid | dazu Laden, Warnung, Erfolg | **anpassen** | Status nach M-2 (Warnung, Erfolg) und Laden nach M-5. |
| A-kampo-4 | Anatomie und Slots | label, required-mark, surface, border, text, placeholder, help, error, decrement, increment, clear | dazu Start-Icon, Spinner, Status-Icon, Einheit | **anpassen** | Das Status-Icon im Feld übernehmen: Ein Fehler ist dann nicht nur Farbe (Regulo error-not-color-only). Teil `unit` für die Einheit. Das Start-Icon bleibt die Grenze icon-in-field. |
| A-kampo-5 | Verhalten (Tastatur, ARIA) | textbox, Enter, Pfeile bei Zahlen, Escape leert die Suche | dasselbe; das Mausrad ändert Zahlen | **behalten** | Das Mausrad ändert keinen Wert: Beim Scrollen der Seite ändert sich sonst unbemerkt eine Zahl. |
| A-kampo-6 | Muster und Grenzen | Grenzen reveal-password, time-zone (ask-human), decimal, icon-in-field, no-visible-label (not-supported) | Info-Icon an der Beschriftung, verborgene Beschriftung | **behalten** | Hilfe steht als Satz im Slot `help` (Regulo help-is-one-sentence), nicht hinter einem Icon (M-9). Die verborgene Beschriftung verbietet field-label-visible (M-8). |

#### `karto` ↔ Card

Quelle: `src/Card/Card.doc.mjs`

| ID | Aspekt | Fundamento | Fonto | Vorschlag | Begründung |
|---|---|---|---|---|---|
| A-karto-1 | Achsen und Werte | `level`, `orientation`, `standalone` | `variant` mit 3 Flächen und 10 Farbtönen, `elevation`, Innenabstand, Breite und Höhe | **anpassen** | Die drei Flächen übernehmen (normal, gedämpft, ohne Fläche), unter eigenem Namen: Achse `tone` mit `default`, `muted`, `none`. Farbtöne, Elevation und Innenabstand nicht (M-12, Dichte-Dimensio). |
| A-karto-2 | Größen | keine Größe | Innenabstand in Stufen | **behalten** | Den Innenabstand regelt die Dimensio density für alle Marken; ein Prop je Karte wäre ein zweiter Weg. |
| A-karto-3 | Zustände | rest | rest | **behalten** | Gleich; die anklickbare Karte ist eine eigene Gattung. |
| A-karto-4 | Anatomie und Slots | Slots heading, media, content, meta, actions | Container und Inhalt | **behalten** | Unsere Slots sind feiner und tragen die Uzo. |
| A-karto-5 | Verhalten (Tastatur, ARIA) | Rolle article, Name aus der Überschrift | Container ohne Rolle | **behalten** | Unsere Semantik ist genauer. |
| A-karto-6 | Muster und Grenzen | Grenzen clickable-card und card-grid (ask-human) | anklickbare und wählbare Karte als eigene Komponenten | **behalten** | Unsere Grenzen bleiben. ClickableCard und SelectableCard stehen in der Liste der fehlenden Gattungen. |

#### `kodbloko` ↔ CodeBlock

Quelle: `src/CodeBlock/CodeBlock.doc.mjs`

| ID | Aspekt | Fundamento | Fonto | Vorschlag | Begründung |
|---|---|---|---|---|---|
| A-kodbloko-1 | Achsen und Werte | `copyable` | Sprache, Titel, Sprachbeschriftung, Zeilennummern, hervorgehobene Zeilen, Diff, Umbruch, Höhe, Größe, Rahmen, Einklappen | **anpassen** | Übernehmen: Zeilennummern (`line-numbers`), Umbruch (`wrap`) und die Sprache als Text für die Beschriftung. Diff bleibt die Grenze diff (ask-human). Syntaxfarben kommen mit ① (Spec ①, Punkt 2). |
| A-kodbloko-2 | Größen | keine Größe | 2 Stufen | **behalten** | Die Größe folgt der Schriftrolle für Code; die Dichte-Dimensio passt sie an. |
| A-kodbloko-3 | Zustände | rest, focus (Scrollbereich) | dazu eingeklappt ab einer Zeilenzahl | **behalten** | Lange Blöcke lassen sich mit einem faldilo einklappen; ein eigener Zustand wäre ein zweiter Weg. |
| A-kodbloko-4 | Anatomie und Slots | surface, text, legend, scroll-ring, announce; Slots label, caption | Kopfleiste, Titel, Zeilennummern, Code, hervorgehobene Zeilen, Kopieren | **anpassen** | Die Teile `line-number` und `highlight` übernehmen. |
| A-kodbloko-5 | Verhalten (Tastatur, ARIA) | Rolle figure, „Kopiert“ wird angesagt | Kopieren wird angesagt | **behalten** | Beide sagen das Kopieren an; die Rolle figure mit Legende ist bei uns genauer. |
| A-kodbloko-6 | Muster und Grenzen | Grenzen diff (ask-human), syntax-highlighting (not-supported) | Diff und Syntaxfarben | **anpassen** | Die Grenze syntax-highlighting entfällt mit den Syntaxfarben aus ①. Diff bleibt offen für den Maintainer. |

#### `kompletigilo` ↔ Typeahead

Quelle: `src/Typeahead/Typeahead.doc.mjs`

| ID | Aspekt | Fundamento | Fonto | Vorschlag | Begründung |
|---|---|---|---|---|---|
| A-kompletigilo-1 | Achsen und Werte | `value`, `placeholder`, `required`, `invalid`, `size`, `disabled`, `name`, `allow-free`, `min-chars`, `expanded`, `loading` | dazu höchste Zahl der Vorschläge, Einträge beim Fokus, Löschen (an), Verzögerung, Start-Icon | **anpassen** | Übernehmen: `max-suggestions` als Zahl und Löschen nach M-6. Die Verzögerung ist Sache der Anwendung. |
| A-kompletigilo-2 | Größen | small \| medium \| large | 3 Stufen | **behalten** | Drei Stufen in beiden Systemen; die Werte heißen wie bei uns. |
| A-kompletigilo-3 | Zustände | rest, hover, focus, disabled, invalid (dazu `loading`) | dazu Warnung und Erfolg | **anpassen** | Warnung und Erfolg kommen aus dem Status-Modell M-2; Laden haben wir schon. |
| A-kompletigilo-4 | Anatomie und Slots | listbox, suggestion, no-results | dazu Gruppenüberschrift, Spinner, Löschen, gewählter Eintrag | **anpassen** | Gruppenüberschriften und einen Spinner im Feld übernehmen. |
| A-kompletigilo-5 | Verhalten (Tastatur, ARIA) | combobox, Pfeile, Enter, Escape | dasselbe Muster (APG) | **behalten** | Beide folgen dem Muster combobox nach APG mit Pfeilen, Enter und Escape. |
| A-kompletigilo-6 | Muster und Grenzen | Grenzen multi-select (use-instead plurelektilo), tags (not-supported) | Mehrfachwahl als eigene Komponente | **behalten** | Gleich getrennt; Tokenizer steht in der Liste der fehlenden Gattungen. |

#### `konsileto` ↔ Tooltip

Quelle: `src/Tooltip/Tooltip.doc.mjs`

| ID | Aspekt | Fundamento | Fonto | Vorschlag | Begründung |
|---|---|---|---|---|---|
| A-konsileto-1 | Achsen und Werte | `for`, `placement` (4 Seiten) | Seite (4), Ausrichtung mit 3 Werten, Verzögerung, Auslöser bei Fokus und Touch | **anpassen** | Die Ausrichtung übernehmen, unter eigenem Namen: `justify` mit `start`, `center`, `end`. Verzögerungen bleiben Motion-Tokens. |
| A-konsileto-2 | Größen | keine Größe | keine Größe | **behalten** | Ein Tooltip nimmt die Breite seines kurzen Texts (Regulo tooltip-text-short). |
| A-konsileto-3 | Zustände | rest | rest | **behalten** | Ein Tooltip ist sichtbar oder nicht; weitere Zustände hat er in beiden Systemen nicht. |
| A-konsileto-4 | Anatomie und Slots | surface, text | Fläche und Text | **behalten** | Fläche und Text decken sich; mehr Teile hat ein Tooltip in beiden Systemen nicht. |
| A-konsileto-5 | Verhalten (Tastatur, ARIA) | Rolle tooltip, Escape schließt | Hover und Fokus, Escape schließt, Touch tippt | **behalten** | Gleich (WCAG 1.4.13). |
| A-konsileto-6 | Muster und Grenzen | Grenze tooltip-on-disabled (ask-human); Regulo tooltip-text-short | Grund für „deaktiviert“ als Tooltip | **anpassen** | Die Grenze tooltip-on-disabled wird mit M-1 entschieden. |

#### `langetaro` ↔ TabList

Quelle: `src/TabList/TabList.doc.mjs`

| ID | Aspekt | Fundamento | Fonto | Vorschlag | Begründung |
|---|---|---|---|---|---|
| A-langetaro-1 | Achsen und Werte | `label`, `selected` | Wert, Größe, Breite mit 2 Werten (Inhalt oder füllen), Trennlinie, Überlauf, Rolle | **anpassen** | Die Breite übernehmen, unter eigenem Namen: `spread` mit `content` und `fill`. Navigation zwischen Seiten bleibt der navigado. |
| A-langetaro-2 | Größen | keine Größe | 3 Stufen | **übernehmen** | Registerkarten stehen oft neben Feldern und Knöpfen; drei Stufen wie dort. |
| A-langetaro-3 | Zustände | rest, hover, focus, disabled | dieselben | **behalten** | Dieselben vier Zustände in beiden Systemen. |
| A-langetaro-4 | Anatomie und Slots | tab, tabs, selected-indicator, list, panel | dazu Überlauf mit Pfeilen, Inhalt am Anfang und Ende | **anpassen** | Den Überlauf übernehmen: Die Leiste scrollt, die gewählte Karte bleibt sichtbar. Das entscheidet die Grenze many-tabs. |
| A-langetaro-5 | Verhalten (Tastatur, ARIA) | tablist, Pfeile, Home/End | Landmarke nav oder tablist | **behalten** | Wir trennen Registerkarten (langetaro) und Navigation (navigado). Das hält die Rollen eindeutig. |
| A-langetaro-6 | Muster und Grenzen | Grenzen many-tabs, manual-activation, vertical-tabs (ask-human), closable-tabs (not-supported) | Menü für weitere Karten | **behalten** | Die übrigen Grenzen bleiben. |

#### `ligilo` ↔ Link

Quelle: `src/Link/Link.doc.mjs`

| ID | Aspekt | Fundamento | Fonto | Vorschlag | Begründung |
|---|---|---|---|---|---|
| A-ligilo-1 | Achsen und Werte | `to`, `placement` inline \| standalone, `external`, `size`, `label` | dazu Unterstreichung, 11 Textgrößen, Gewicht, Farbe, deaktiviert, Download | **behalten** | Inline und eigenständig sowie extern decken sich. Die Unterstreichung regelt bei uns link-not-color-only; Gewicht und Farbe kommen aus der Rolle. |
| A-ligilo-2 | Größen | small \| medium \| large | 11 Textgrößen | **behalten** | Die Größe folgt den Typo-Rollen aus ①; drei Stufen reichen für den Link selbst. |
| A-ligilo-3 | Zustände | rest, hover, pressed, focus, visited | dazu deaktiviert | **behalten** | Unsere Grenze disabled-link (not-supported): Ein Ziel, das nicht erreichbar ist, ist kein Link. |
| A-ligilo-4 | Anatomie und Slots | Slots label, icon-end | Beschriftung, Icon vorn und hinten | **übernehmen** | Einen Slot `icon-start` übernehmen, wie beim butono. |
| A-ligilo-5 | Verhalten (Tastatur, ARIA) | link, Enter, „öffnet extern“ wird angesagt | dasselbe, Hinweis auf neuen Tab | **behalten** | Beide sagen das Verlassen an; unser Text „öffnet extern“ deckt auch den neuen Tab. |
| A-ligilo-6 | Muster und Grenzen | Grenzen button-look, download (ask-human), multi-line-label (not-supported) | Download als Prop | **anpassen** | Download übernehmen und die Grenze download damit entscheiden; das Icon kommt aus Phosphor. |

#### `listelektilo` ↔ Selector, ComplexSelector

Quelle: `src/Selector/Selector.doc.mjs`, `src/ComplexSelector/ComplexSelector.doc.mjs`

| ID | Aspekt | Fundamento | Fonto | Vorschlag | Begründung |
|---|---|---|---|---|---|
| A-listelektilo-1 | Achsen und Werte | `value`, `placeholder`, `required`, `disabled`, `readonly`, `invalid`, `expanded`, `name` | dazu Suche, Löschen, eigene Darstellung der Option, Größe, Darstellung, Laden | **anpassen** | Löschen nach M-6. Suche bleibt beim kompletigilo (Grenze search-in-list). Größe in der nächsten Zeile. |
| A-listelektilo-2 | Größen | keine Größe | 3 Stufen | **übernehmen** | Wie beim elektilo: drei Stufen, damit beide in einer Zeile gleich hoch sind. |
| A-listelektilo-3 | Zustände | rest, hover, focus, disabled, readonly, invalid | dazu Laden, Warnung, Erfolg | **anpassen** | Status nach M-2 (Warnung, Erfolg) und Laden nach M-5. |
| A-listelektilo-4 | Anatomie und Slots | label, required-mark, surface, border, text, placeholder, indicator, listbox, item, icon, description, help, error | dazu Abschnittsüberschrift, Trenner, Leerzustand, Status-Icon | **anpassen** | Abschnittsüberschrift und Trenner übernehmen. |
| A-listelektilo-5 | Verhalten (Tastatur, ARIA) | combobox, Pfeile, Home/End, Enter, Space, Escape | dazu Springen per Tippen | **übernehmen** | Springen per Tippen übernehmen, wie beim elektilo. |
| A-listelektilo-6 | Muster und Grenzen | Grenze search-in-list (use-instead kompletigilo) | auf Touch ein Blatt von unten | **behalten** | Die Grenze bleibt; die adaptive Darstellung steht unter M-4. |

#### `lokredaktilo` ↔ TextInput

Quelle: `src/TextInput/TextInput.doc.mjs`

| ID | Aspekt | Fundamento | Fonto | Vorschlag | Begründung |
|---|---|---|---|---|---|
| A-lokredaktilo-1 | Achsen und Werte | `label`, `value`, `kind` text \| number \| email \| url, `editing`, `disabled`, `readonly`, `invalid`, `name` | kein eigenes Gegenstück; im Bearbeiten-Modus ein Textfeld | **behalten** | Die Fonto hat keinen Inline-Editor; es gibt nichts zu übernehmen. |
| A-lokredaktilo-2 | Größen | keine Größe | Textfeld mit 3 Stufen | **behalten** | Die Größe folgt dem umgebenden Text, nicht einer Stufe. |
| A-lokredaktilo-3 | Zustände | rest, hover, focus, disabled, readonly, invalid | Status des Textfelds | **anpassen** | Im Bearbeiten-Modus gilt der Feldstatus aus M-2. |
| A-lokredaktilo-4 | Anatomie und Slots | text, edit, field, save, cancel, error | – | **behalten** | Die Fonto hat keinen Inline-Editor; unsere Teile bleiben, wie Spec 025 sie gebaut hat. |
| A-lokredaktilo-5 | Verhalten (Tastatur, ARIA) | Enter speichert, Escape bricht ab | – | **behalten** | Kein Gegenstück; unser Verhalten bleibt. |
| A-lokredaktilo-6 | Muster und Grenzen | Grenzen multi-field-edit (use-instead), autosave (ask-human) | – | **behalten** | Kein Gegenstück; die Grenzen bleiben. |

#### `markdovido` ↔ Markdown

Quelle: `src/Markdown/Markdown.doc.mjs`

| ID | Aspekt | Fundamento | Fonto | Vorschlag | Begründung |
|---|---|---|---|---|---|
| A-markdovido-1 | Achsen und Werte | `source`, `start-level` 2–6 | Startebene 1–6, Dichte mit 2 Werten, Breite, Ausrichtung, Streaming, Quellen | **anpassen** | Übernehmen: die Dichte als Achse `density` mit `default` und `compact` (Namen der Dimensio density) und `streaming` für Antworten von Agenten, die nach und nach kommen. Startebene 1 nicht: Die Seite hat ihre eine Überschrift erster Ebene. |
| A-markdovido-2 | Größen | keine Größe | Breite des Inhalts | **behalten** | Die Lesebreite kommt aus der Sxablono, nicht aus dem Ero. |
| A-markdovido-3 | Zustände | rest | dazu Streaming | **übernehmen** | Den Zustand „streamt“ mit aria-busy übernehmen. |
| A-markdovido-4 | Anatomie und Slots | box, quote, indent | Dokument, Überschrift, Absatz, Liste, Codeblock, Zitat, Tabelle, Trenner, Bild | **anpassen** | Codeblöcke als kodbloko und Tabellen als tabelo zeichnen; die Eroj setzen sich zusammen. Bilder bleiben die Grenze images (ask-human). |
| A-markdovido-5 | Verhalten (Tastatur, ARIA) | Rolle document | dasselbe, mit Ankern an Überschriften | **behalten** | Beide geben ein Dokument aus; Anker an Überschriften setzt bei uns die Vitrino. |
| A-markdovido-6 | Muster und Grenzen | Grenzen images (ask-human), html (not-supported) | Zitate mit Quellen | **behalten** | Die Grenzen bleiben. Quellenangaben stehen als Citation in der Liste der fehlenden Gattungen. |

#### `markobutono` ↔ CheckboxInput

Quelle: `src/CheckboxInput/CheckboxInput.doc.mjs`

| ID | Aspekt | Fundamento | Fonto | Vorschlag | Begründung |
|---|---|---|---|---|---|
| A-markobutono-1 | Achsen und Werte | `checked`, `required`, `invalid`, `size`, `disabled`, `name` | Wert mit drei Werten (an, aus, gemischt), nur lesen, Größe, Icon an der Beschriftung, Beschreibung | **anpassen** | `readonly` übernehmen. Den gemischten Wert nicht: Er ist unsere Grenze indeterminate (not-supported), weil ein Kästchen allein nichts mischt; er gehört zur Gruppe (CheckboxList in der Liste der fehlenden Gattungen). |
| A-markobutono-2 | Größen | small \| medium \| large | 2 Stufen | **übernehmen** | Anzahl der Fonto, wie beim elekto (O-2). |
| A-markobutono-3 | Zustände | rest, hover, focus, disabled, invalid | dazu Nur-Lesen, Laden, Warnung, Erfolg | **anpassen** | Nur-Lesen (Zeile 1). Status nach M-2 (Warnung, Erfolg) und Laden nach M-5. |
| A-markobutono-4 | Anatomie und Slots | label, required-mark, error, indicator; Slots label, error | Kästchen, Beschriftung, Beschreibung, Statusmeldung | **übernehmen** | Einen Slot `help` für die Beschreibung übernehmen, wie bei den übrigen Feldern. |
| A-markobutono-5 | Verhalten (Tastatur, ARIA) | checkbox, Space | dasselbe | **behalten** | Rolle checkbox mit Space in beiden Systemen. |
| A-markobutono-6 | Muster und Grenzen | Grenzen indeterminate (not-supported), checkbox-group (ask-human) | Gruppe als eigene Komponente | **behalten** | Die Grenzen bleiben bis zur Entscheidung über CheckboxList. |

#### `menuo` ↔ DropdownMenu, MoreMenu

Quelle: `src/DropdownMenu/DropdownMenu.doc.mjs`, `src/MoreMenu/MoreMenu.doc.mjs`

| ID | Aspekt | Fundamento | Fonto | Vorschlag | Begründung |
|---|---|---|---|---|---|
| A-menuo-1 | Achsen und Werte | `label`, `placement`, `open`, `disabled` | Einträge (mit Haken, Optionen, Untermenüs, Zielen), Darstellung, Ausrichtung, Pfeil am Auslöser, Kopf und Fuß, Breite | **anpassen** | Die Ausrichtung übernehmen wie beim konsileto (`justify`). |
| A-menuo-2 | Größen | keine Größe; der Auslöser ist ein butono | Größe über den Knopf | **behalten** | Der Auslöser ist ein Knopf und trägt dessen Größe, in beiden Systemen. |
| A-menuo-3 | Zustände | rest, hover, focus, disabled | dieselben | **behalten** | Dieselben vier Zustände in beiden Systemen. |
| A-menuo-4 | Anatomie und Slots | surface, border, item, danger-item; Slots items, trigger | dazu Icon je Eintrag, Abschnittsüberschrift, Trenner, Haken, Untermenü-Pfeil | **anpassen** | Icon je Eintrag, Abschnittsüberschrift und Trenner übernehmen. |
| A-menuo-5 | Verhalten (Tastatur, ARIA) | menu, Pfeile, Home/End, Escape, Enter, Space | Menü-Knopf nach APG, Springen per Tippen; Einträge mit Ziel sind Links | **übernehmen** | Springen per Tippen übernehmen. Ein Eintrag mit Ziel wird ein Link (Regulo link-navigates-button-acts). |
| A-menuo-6 | Muster und Grenzen | Grenzen submenu (not-supported), checkable-items (ask-human) | Untermenüs, Einträge mit Haken, Blatt auf Touch | **behalten** | Die Grenzen bleiben; das Blatt steht unter M-4. |

#### `mezurilo` ↔ ProgressBar

Quelle: `src/ProgressBar/ProgressBar.doc.mjs`

| ID | Aspekt | Fundamento | Fonto | Vorschlag | Begründung |
|---|---|---|---|---|---|
| A-mezurilo-1 | Achsen und Werte | `value`, `min`, `max`, `intent` neutral \| success \| warning \| danger, `label-hidden` | Wert, Maximum, 5 Farben (mit Akzent), unbestimmt, Wertbeschriftung, Markierungen | **behalten** | Unsere 4 Werte decken die Bedeutungen ab; der Akzent der Fonto ist bei uns `neutral`. Unbestimmter Fortschritt ist ein Ladezustand (plenstato). |
| A-mezurilo-2 | Größen | keine Größe | keine Größe | **behalten** | Der Balken nimmt die Breite seines Ortes; Stufen fehlen in beiden. |
| A-mezurilo-3 | Zustände | rest | dazu unbestimmt und deaktiviert | **behalten** | Ein Messbalken zeigt einen Stand, keinen Vorgang (siehe Zeile 5). |
| A-mezurilo-4 | Anatomie und Slots | track, fill, unknown, label, value-text | dazu Markierungen | **behalten** | Die Grenze multi-segment bleibt; Markierungen wären Teilstände. |
| A-mezurilo-5 | Verhalten (Tastatur, ARIA) | Rolle meter | Rolle progressbar | **behalten** | Die Fonto misst Fortschritt, wir einen Stand. Fortschritt ist eine eigene Bedeutung; bei Bedarf ein eigenes Ero (O-4). |
| A-mezurilo-6 | Muster und Grenzen | Grenzen chart, multi-segment (not-supported); Regulo meter-text-states-value | Wertbeschriftung mit Format | **behalten** | Unsere Regulo verlangt den Wert als Text schon. |

#### `navigado` ↔ TopNav, SideNav

Quelle: `src/TopNav/TopNav.doc.mjs`, `src/SideNav/SideNav.doc.mjs`

| ID | Aspekt | Fundamento | Fonto | Vorschlag | Begründung |
|---|---|---|---|---|---|
| A-navigado-1 | Achsen und Werte | `orientation` horizontal \| vertical, `label`, `page` | zwei Komponenten: oben mit Produktname und Bereichen, seitlich mit Abschnitten, Verschachtelung, Einklappen und Ziehen | **anpassen** | Abschnitte mit Überschrift in der senkrechten Navigation übernehmen. Verschachtelung bleibt die Grenze submenu. |
| A-navigado-2 | Größen | keine Größe | Breite der Seitenleiste ziehbar | **behalten** | Die Breite gehört dem sxelo. |
| A-navigado-3 | Zustände | rest, hover, focus | dazu eingeklappt | **behalten** | Die Grenze collapsed-mobile (not-supported) bleibt; die mobile Navigation ist eine fehlende Gattung (MobileNav). |
| A-navigado-4 | Anatomie und Slots | item, items, underline; Slot items | Produkt-Icon und -Name, Einträge, Menü für weitere, Einklappen, Abschnittsüberschrift, Icons | **anpassen** | Teil `section-heading` und einen Slot `icon-start` je Eintrag übernehmen. Produktname und Kopf gehören dem sxelo. |
| A-navigado-5 | Verhalten (Tastatur, ARIA) | navigation, aria-current | dasselbe | **behalten** | Landmarke navigation und aria-current an der aktuellen Seite, in beiden Systemen. |
| A-navigado-6 | Muster und Grenzen | Grenzen submenu, drawer (ask-human), collapsed-mobile (not-supported), breadcrumb (use-instead spuro) | Hauptnavigation ab 5 Zielen seitlich | **behalten** | Die Fonto rät dasselbe wie unsere Uzo; die Grenzen bleiben. |

#### `pagxigilo` ↔ Pagination

Quelle: `src/Pagination/Pagination.doc.mjs`

| ID | Aspekt | Fundamento | Fonto | Vorschlag | Begründung |
|---|---|---|---|---|---|
| A-pagxigilo-1 | Achsen und Werte | `page`, `total-pages`, `label`, `mode` button \| link, `href-template`, `siblings` | 6 Darstellungen (Seiten, Anzahl, kompakt, Punkte, Eingabe, keine), Seitengröße, erste und letzte Seite, unbekannte Gesamtzahl | **anpassen** | Drei Darstellungen übernehmen, unter eigenem Namen: `summary` mit `pages`, `count`, `compact`. Punkte gehören zum Karussell, die Eingabe ist selten. |
| A-pagxigilo-2 | Größen | keine Größe | 2 Stufen | **übernehmen** | Unter dichten Tabellen braucht es eine kleine Stufe. |
| A-pagxigilo-3 | Zustände | rest, hover, focus, disabled | dieselben | **behalten** | Dieselben vier Zustände in beiden Systemen. |
| A-pagxigilo-4 | Anatomie und Slots | item, border, ellipsis, prev, next | dazu erste und letzte Seite, Auswahl der Seitengröße, Anzeige der Anzahl | **anpassen** | Erste und letzte Seite übernehmen. Die Seitengröße bleibt die Grenze page-size-select (ask-human). |
| A-pagxigilo-5 | Verhalten (Tastatur, ARIA) | navigation, aria-current | dasselbe | **behalten** | Landmarke navigation und aria-current an der aktuellen Seite, in beiden Systemen. |
| A-pagxigilo-6 | Muster und Grenzen | Grenzen infinite-scroll, page-size-select (ask-human) | „mehr“ bei unbekannter Gesamtzahl | **übernehmen** | Eine unbekannte Gesamtzahl kommt bei Suchen und Protokollen vor; nur „weiter“ ohne letzte Seite. |

#### `plenstato` ↔ EmptyState, Spinner, Skeleton

Quelle: `src/EmptyState/EmptyState.doc.mjs`, `src/Spinner/Spinner.doc.mjs`, `src/Skeleton/Skeleton.doc.mjs`

| ID | Aspekt | Fundamento | Fonto | Vorschlag | Begründung |
|---|---|---|---|---|---|
| A-plenstato-1 | Achsen und Werte | `kind` loading \| empty | Leerzustand mit Titel, Beschreibung, Icon, Aktionen, Ebene der Überschrift, kompakt; Spinner mit 4 Größen; Platzhalter | **anpassen** | Kompakt als Boolean `compact` übernehmen, für Tabellen und Seitenleisten. Die Ebene der Überschrift folgt der Seite (heading-levels-in-order). |
| A-plenstato-2 | Größen | keine Größe | Spinner in 4 Stufen, Leerzustand kompakt | **anpassen** | Mit `compact` hat der Ladezustand zwei Stufen; mehr braucht ein Zustand für einen Bereich nicht. |
| A-plenstato-3 | Zustände | rest | rest | **behalten** | Lade- und Leerzustand sind selbst Zustände eines Bereichs; mehr gibt es nicht. |
| A-plenstato-4 | Anatomie und Slots | surface, border, indicator, text, actions | Icon, Titel, Beschreibung, Aktionen | **übernehmen** | Einen Slot `heading` und einen Slot `icon` übernehmen; der Leertext sagt dann, was fehlt, und der Titel, wo man ist. |
| A-plenstato-5 | Verhalten (Tastatur, ARIA) | Rolle status | dasselbe | **behalten** | Beide sagen den Zustand höflich mit der Rolle status an. |
| A-plenstato-6 | Muster und Grenzen | Grenze skeleton (not-supported); Regulo empty-state-says-what-next | Platzhalter in Form des Inhalts | **behalten** | Die Grenze bleibt, bis der Maintainer sie entscheidet (O-5). |

#### `plurelektilo` ↔ MultiSelector

Quelle: `src/MultiSelector/MultiSelector.doc.mjs`

| ID | Aspekt | Fundamento | Fonto | Vorschlag | Begründung |
|---|---|---|---|---|---|
| A-plurelektilo-1 | Achsen und Werte | `values`, `filterable`, `max`, `summary` count \| tags, `placeholder`, `required`, `disabled`, `readonly`, `invalid`, `expanded` | Anzeige im Auslöser mit 3 Werten (Anzahl, Beschriftungen, Badges), höchste Zahl der Badges, alle wählen, Suche, Neu anlegen, Größe | **anpassen** | `summary` bekommt den dritten Wert `labels` (Anzahl der Fonto). Übernehmen: `select-all` als Boolean. |
| A-plurelektilo-2 | Größen | keine Größe | 3 Stufen | **übernehmen** | Wie listelektilo und elektilo. |
| A-plurelektilo-3 | Zustände | rest, hover, focus, disabled, readonly, invalid | dazu Laden, Warnung, Erfolg | **anpassen** | Status nach M-2 (Warnung, Erfolg) und Laden nach M-5. |
| A-plurelektilo-4 | Anatomie und Slots | listbox, filter, item, check, clear, tag | dazu Zeile „alle wählen“, Abschnittsüberschrift, Trenner, Leerzustand | **anpassen** | Zeile „alle wählen“ und Abschnittsüberschrift übernehmen. |
| A-plurelektilo-5 | Verhalten (Tastatur, ARIA) | listbox, Pfeile, Home/End, Space, Enter, Escape | combobox mit Mehrfachauswahl | **behalten** | Beide nutzen eine Liste mit Mehrfachauswahl und dieselben Tasten; die Rolle am Auslöser unterscheidet sich, das Ergebnis für Hilfsmittel nicht. |
| A-plurelektilo-6 | Muster und Grenzen | Grenze create-new-value (ask-human) | Neu anlegen | **behalten** | Die Grenze bleibt, bis der Maintainer sie entscheidet. |

#### `saltligilo` ↔ AppShell

Quelle: `src/AppShell/AppShell.doc.mjs`

| ID | Aspekt | Fundamento | Fonto | Vorschlag | Begründung |
|---|---|---|---|---|---|
| A-saltligilo-1 | Achsen und Werte | `to`, `focus-only` | Teil der Seitenhülle, ohne eigene Props | **behalten** | Kein eigenes Gegenstück; unsere Props bleiben. |
| A-saltligilo-2 | Größen | keine Größe | – | **behalten** | Die Fonto hat keinen eigenen Sprunglink; seine Größe folgt der Schrift. |
| A-saltligilo-3 | Zustände | rest, focus | sichtbar beim Fokus | **behalten** | Unsichtbar bis zum Fokus, in beiden Systemen. |
| A-saltligilo-4 | Anatomie und Slots | label, surface, border | Sprunglink der Hülle | **behalten** | Beschriftung und Fläche decken sich mit dem Sprunglink der Hülle. |
| A-saltligilo-5 | Verhalten (Tastatur, ARIA) | link, Enter | dasselbe | **behalten** | Ein Link, der mit Enter zum Inhalt springt, in beiden Systemen. |
| A-saltligilo-6 | Muster und Grenzen | Grenze always-visible (not-supported) | Die Hülle setzt den Sprunglink selbst | **behalten** | Dass der sxelo den saltligilo selbst setzt, gehört zu den Templates; die sind nicht Teil dieser Spec. |

#### `signeto` ↔ Token

Quelle: `src/Token/Token.doc.mjs`

| ID | Aspekt | Fundamento | Fonto | Vorschlag | Begründung |
|---|---|---|---|---|---|
| A-signeto-1 | Achsen und Werte | `mode` static \| selectable \| removable, `selected`, `size` small \| medium, `intent`, `disabled` | Größe (3), Farbe mit Standard und 10 Farbtönen, Icon, Link, Beschreibung, Endinhalt, Entfernen | **behalten** | Unsere Modi decken die Fonto ab. Die Farbtöne bleiben die Grenze tinted-categories (ask-human). |
| A-signeto-2 | Größen | small \| medium | 3 Stufen | **übernehmen** | Anzahl der Fonto: `large` dazu, für Filterleisten auf Touch. |
| A-signeto-3 | Zustände | rest, hover, focus, disabled | dieselben | **behalten** | Dieselben vier Zustände in beiden Systemen. |
| A-signeto-4 | Anatomie und Slots | surface, border, text, remove; Slots label, icon-start | dazu Endinhalt und Beschreibung | **behalten** | Beschreibung und Endinhalt decken unser Slot `label` und der Entfernen-Knopf. |
| A-signeto-5 | Verhalten (Tastatur, ARIA) | Enter, Space, Delete, Backspace; aria-pressed | Entfernen-Knopf mit Namen | **behalten** | Entfernen hat in beiden einen Namen mit der Beschriftung; Delete und Backspace kommen bei uns dazu. |
| A-signeto-6 | Muster und Grenzen | signeto und insigno sehen bisher gleich aus | Token und Badge unterscheiden sich in der Form | **anpassen** | Die Spec verlangt in ②b eine unterscheidbare Form; Vorschlag: die Form über die Radius-Rolle, Werte aus ①. |

#### `spuro` ↔ Breadcrumbs

Quelle: `src/Breadcrumbs/Breadcrumbs.doc.mjs`

| ID | Aspekt | Fundamento | Fonto | Vorschlag | Begründung |
|---|---|---|---|---|---|
| A-spuro-1 | Achsen und Werte | `label`, `page` | Trenner, 2 Darstellungen (normal, unterstützend), Menü im Eintrag, Icon | **anpassen** | Die zwei Darstellungen übernehmen, als `emphasis` mit `medium` und `low`. |
| A-spuro-2 | Größen | keine Größe | keine Größe | **behalten** | Ein Pfad nimmt die Schrift seines Ortes; Stufen fehlen in beiden. |
| A-spuro-3 | Zustände | rest, hover, focus | dieselben | **behalten** | Dieselben drei Zustände in beiden Systemen. |
| A-spuro-4 | Anatomie und Slots | item, underline, separator | Pfad, Eintrag, Trenner, Icon | **übernehmen** | Einen Slot `icon-start` am ersten Eintrag übernehmen. |
| A-spuro-5 | Verhalten (Tastatur, ARIA) | navigation, aria-current | dasselbe; Menü im Eintrag nach APG | **behalten** | Landmarke navigation und aria-current am letzten Eintrag, in beiden Systemen. |
| A-spuro-6 | Muster und Grenzen | Grenze collapsed-middle (ask-human) | Menü für ausgelassene Einträge in der Mitte | **anpassen** | Die Mitte mit einem menuo auslassen und die Grenze damit entscheiden. |

#### `sxaltilo` ↔ Switch

Quelle: `src/Switch/Switch.doc.mjs`

| ID | Aspekt | Fundamento | Fonto | Vorschlag | Begründung |
|---|---|---|---|---|---|
| A-sxaltilo-1 | Achsen und Werte | `checked`, `size`, `disabled`, `name` | dazu Laden, Beschreibung, Status, Seite der Beschriftung (2), Abstand der Beschriftung | **anpassen** | Die Seite der Beschriftung übernehmen, unter eigenem Namen: `label-side` mit `start` und `end`. |
| A-sxaltilo-2 | Größen | small \| medium \| large | 2 Stufen | **übernehmen** | Anzahl der Fonto, wie elekto und markobutono (O-2). |
| A-sxaltilo-3 | Zustände | rest, hover, focus, disabled | dazu Laden und Status | **anpassen** | Ein Schalter wirkt sofort; dauert das, zeigt er „lädt“ (M-5). Status nach M-2. |
| A-sxaltilo-4 | Anatomie und Slots | label, surface, indicator | Spur, Griff, Beschriftung, Beschreibung, Spinner, Statusmeldung | **übernehmen** | Slot `help` und den Spinner übernehmen. |
| A-sxaltilo-5 | Verhalten (Tastatur, ARIA) | switch, Space und Enter | dasselbe | **behalten** | Rolle switch mit Space in beiden; Enter erlauben wir zusätzlich. |
| A-sxaltilo-6 | Muster und Grenzen | Grenze three-states (not-supported); Regulo switch-label-names-the-setting | wirkt sofort, sonst Kontrollkästchen | **behalten** | Die Fonto begründet wie unsere Uzo. |

#### `sxvebilo` ↔ Popover

Quelle: `src/Popover/Popover.doc.mjs`

| ID | Aspekt | Fundamento | Fonto | Vorschlag | Begründung |
|---|---|---|---|---|---|
| A-sxvebilo-1 | Achsen und Werte | `label`, `placement`, `open` | Seite, Ausrichtung, Breite, Innenabstand, Rolle, modal, Schließen-Knopf, Schließen bei Klick daneben und Escape | **anpassen** | Die Ausrichtung übernehmen wie beim konsileto (`justify`). |
| A-sxvebilo-2 | Größen | keine Größe | Breite | **behalten** | Die Breite folgt dem Inhalt und den Container-Tokens. |
| A-sxvebilo-3 | Zustände | rest | rest | **behalten** | Offen oder zu ist das Prop `open`; weitere Zustände hat das Overlay nicht. |
| A-sxvebilo-4 | Anatomie und Slots | surface, border, heading, content | Auslöser, Fläche, Inhalt, Schließen | **übernehmen** | Einen Teil `close` übernehmen: Auf Touch gibt es kein Escape. |
| A-sxvebilo-5 | Verhalten (Tastatur, ARIA) | Rolle dialog, Escape | dialog, Fokus bleibt drin und kehrt zurück, Klick daneben schließt | **behalten** | Beide halten den Fokus im Overlay, schließen mit Escape und geben den Fokus zurück. |
| A-sxvebilo-6 | Muster und Grenzen | Grenzen nested-popover (not-supported), drawer (ask-human) | Hover-Karte als eigene Komponente | **behalten** | Die Grenzen bleiben; HoverCard steht in der Liste der fehlenden Gattungen. |

#### `tabelo` ↔ Table

Quelle: `src/Table/Table.doc.mjs`

| ID | Aspekt | Fundamento | Fonto | Vorschlag | Begründung |
|---|---|---|---|---|---|
| A-tabelo-1 | Achsen und Werte | `density` comfortable \| compact, `caption-hidden`, `sort`, `direction` | Dichte mit 3 Werten, Linien mit 4 Werten (Zeilen, Spalten, Gitter, keine), Streifen, Hover, Ausrichtung, Umbruch | **anpassen** | Die Dichte bekommt drei Werte; Namen wie die Dimensio density: `compact`, `default`, `comfortable`. Linien übernehmen, unter eigenem Namen: `rules` mit `rows`, `columns`, `grid`, `none`. |
| A-tabelo-2 | Größen | Dichte statt Größe | Dichte statt Größe | **behalten** | Die Tabelle hat statt einer Größe die Dichte, in beiden Systemen (Zeile 1). |
| A-tabelo-3 | Zustände | rest, hover, focus | dazu gewählte und aufgeklappte Zeilen | **behalten** | Die Grenze row-selection (ask-human) bleibt. |
| A-tabelo-4 | Anatomie und Slots | caption, head, cell, row-header, region, border, sort, sort-indicator; Slots caption, content, empty | dazu Auswahl, Aufklappen, Detailbereich, Fuß, Leerzustand | **anpassen** | Den Fuß übernehmen (Teil `foot`), etwa für Summen. |
| A-tabelo-5 | Verhalten (Tastatur, ARIA) | table, Enter und Space sortieren | aria-sort, aria-selected, aria-expanded | **behalten** | Gleich für Sortieren. |
| A-tabelo-6 | Muster und Grenzen | Grenzen row-selection, row-tint (ask-human), pagination, inline-edit (use-instead), sticky-header (not-supported) | Streifen, feste Spalten, Erweiterungen | **behalten** | Unsere Grenzen bleiben. |

#### `tekstareo` ↔ TextArea

Quelle: `src/TextArea/TextArea.doc.mjs`

| ID | Aspekt | Fundamento | Fonto | Vorschlag | Begründung |
|---|---|---|---|---|---|
| A-tekstareo-1 | Achsen und Werte | `kind` text \| code, `value`, `rows`, `placeholder`, `required`, `disabled`, `readonly`, `invalid`, `size`, `name` | dazu höchste Länge mit Zähler, Rechtschreibprüfung, Start-Icon, Laden | **anpassen** | Die höchste Länge mit Zähler übernehmen (`max-length`) und die Grenze character-count damit entscheiden. |
| A-tekstareo-2 | Größen | small \| medium \| large | 3 Stufen | **behalten** | Drei Stufen in beiden Systemen; die Werte heißen wie bei uns. |
| A-tekstareo-3 | Zustände | rest, hover, focus, disabled, invalid | dazu Nur-Lesen, Laden, Warnung, Erfolg | **anpassen** | Status nach M-2 (Warnung, Erfolg) und Laden nach M-5. |
| A-tekstareo-4 | Anatomie und Slots | label, required-mark, surface, border, text, placeholder, help, error | dazu Zähler, Status-Icon | **übernehmen** | Teil `counter` übernehmen. |
| A-tekstareo-5 | Verhalten (Tastatur, ARIA) | textbox | dasselbe; der Zähler wird angesagt | **behalten** | Rolle textbox in beiden; den Zähler sagen wir mit der Zeile 4 ebenfalls an. |
| A-tekstareo-6 | Muster und Grenzen | Grenzen auto-grow (ask-human), rich-text (not-supported) | – | **behalten** | Die Fonto wächst nicht mit und kennt keinen formatierten Text; unsere Grenzen bleiben. |

#### `teksto` ↔ Text, Code

Quelle: `src/Text/Text.doc.mjs`, `src/Code/Code.doc.mjs`

| ID | Aspekt | Fundamento | Fonto | Vorschlag | Begründung |
|---|---|---|---|---|---|
| A-teksto-1 | Achsen und Werte | `kind` body \| caption \| kicker \| code, `size` 1 \| 2, `emphasis` high \| medium \| low | 9 Typen, 11 Größen, 6 Farben, 4 Gewichte, Zeilen, Tooltip beim Abschneiden, Zahlen gleicher Breite | **anpassen** | `kind` bekommt `label` für Beschriftungen. Übernehmen: `max-lines` mit Tooltip beim Abschneiden und `tabular` für Zahlen in Tabellen. |
| A-teksto-2 | Größen | 1 \| 2 | 11 Größen | **behalten** | Die Stufen kommen aus den Typo-Rollen (①); das Ero wählt die Rolle, nicht die Stufe. |
| A-teksto-3 | Zustände | rest | rest | **behalten** | Text ist nicht interaktiv und hat keine Zustände. |
| A-teksto-4 | Anatomie und Slots | text | Text, Überschrift, Tooltip beim Abschneiden | **anpassen** | Mit `max-lines` kommt der Tooltip dazu. |
| A-teksto-5 | Verhalten (Tastatur, ARIA) | Rolle paragraph | span, p, div oder label | **behalten** | Das Element folgt dem Zweck; bei uns ein Absatz, die Fonto lässt es wählen. |
| A-teksto-6 | Muster und Grenzen | Grenze rich-text (use-instead markdovido) | – | **behalten** | Formatierter Text gehört dem markdovido; die Fonto trennt Text und Markdown ebenso. |

#### `titolo` ↔ Heading

Quelle: `src/Text/Heading.doc.mjs`

| ID | Aspekt | Fundamento | Fonto | Vorschlag | Begründung |
|---|---|---|---|---|---|
| A-titolo-1 | Achsen und Werte | `level` 1–6, `size` (7 Stufen), `focusable` | Ebene, Typ (3 Display-Stufen), Gewicht, Ebene für Hilfsmittel, Farbe, Zeilen | **behalten** | Wir trennen Semantik (`level`) und Optik (`size`) schon; die Fonto braucht dafür eine zweite Ebene. |
| A-titolo-2 | Größen | 7 Stufen | 3 Display-Stufen und Größe aus der Ebene | **behalten** | Die Stufen kommen aus den Typo-Rollen (①). |
| A-titolo-3 | Zustände | rest | rest | **behalten** | Eine Überschrift ist nicht interaktiv und hat keine Zustände. |
| A-titolo-4 | Anatomie und Slots | text | Text | **behalten** | Eine Überschrift ist in beiden Systemen nur ihr Text. |
| A-titolo-5 | Verhalten (Tastatur, ARIA) | heading, aria-level | dasselbe | **behalten** | Rolle heading mit aria-level, in beiden Systemen. |
| A-titolo-6 | Muster und Grenzen | Grenze heading-with-actions (use-instead); Regulo heading-levels-in-order | – | **behalten** | Kopf mit Aktionen gehört der Sxablono pagxo. |

### Fehlende Gattungen

Gattungen der Fonto ohne Gegenstück in Fundamento. Stoff für Eroj-Runde 6, hier nicht gebaut. Hilfsmittel der Fonto ohne eigene Gestalt (Layer, LinkProvider, VisuallyHidden, InternationalizationProvider, MediaTheme, SyntaxTheme, Theme, Overlay, Indicator) und Teile anderer Komponenten (Item, Step, BottomSheetSwitcher, ChatDictationButton) stehen nicht in der Liste.

| # | Fonto | Gattung | Vorschlag | Begründung | Quelle |
|---|---|---|---|---|---|
| 1 | Stepper | Schrittanzeige | Eroj-Runde 6 | Assistenten in mehreren Schritten sind eine Aufgabe des Nordsterns (Spec 030); heute baut ein Agent sie nach. | `src/Stepper/Stepper.doc.mjs` |
| 2 | Drawer | Seitenpanel | Eroj-Runde 6 | Detail zu einer Tabellenzeile ohne Seitenwechsel; entscheidet die Grenzen drawer von dialogo, sxvebilo und navigado. | `src/Drawer/Drawer.doc.mjs` |
| 3 | BottomSheet | Blatt von unten | Eroj-Runde 6 | Voraussetzung für die adaptive Darstellung (M-4). | `src/BottomSheet/BottomSheet.doc.mjs` |
| 4 | CheckboxList | Gruppe von Kontrollkästchen | Eroj-Runde 6 | Entscheidet die Grenze checkbox-group des markobutono; Gegenstück zum elekto. | `src/CheckboxList/CheckboxList.doc.mjs` |
| 5 | SegmentedControl | Segmentschalter | Eroj-Runde 6 | Einfachauswahl aus 2 bis 5 Werten auf engem Raum, etwa Ansicht Liste oder Raster. | `src/SegmentedControl/SegmentedControl.doc.mjs` |
| 6 | ToggleButton | Umschaltknopf | Eroj-Runde 6 | Dauerhafter An-/Aus-Zustand als Knopf, etwa Fett in einer Werkzeugleiste. | `src/ToggleButton/ToggleButton.doc.mjs` |
| 7 | ButtonGroup | Knopfgruppe | Eroj-Runde 6 | Verbundene Aktionen; braucht eine Regel zusammen mit one-primary-per-container. | `src/ButtonGroup/ButtonGroup.doc.mjs` |
| 8 | Toolbar | Werkzeugleiste | Eroj-Runde 6 | Aktionen zu einem Inhaltsbereich; heute baut man sie aus butono und Abstand. | `src/Toolbar/Toolbar.doc.mjs` |
| 9 | ContextMenu | Kontextmenü | Eroj-Runde 6 | Rechtsklick-Aktionen; nur zusätzlich zu einem sichtbaren Weg, sonst nicht erreichbar. | `src/ContextMenu/ContextMenu.doc.mjs` |
| 10 | DateTimeInput | Datum mit Uhrzeit | Eroj-Runde 6 | Termine; heute zwei Felder (datelektilo und kampo time). | `src/DateTimeInput/DateTimeInput.doc.mjs` |
| 11 | Tokenizer | Eingabe mit Schlagworten | Eroj-Runde 6 | Freie Mehrfachwerte wie Empfänger; Grenze tags des kompletigilo. | `src/Tokenizer/Tokenizer.doc.mjs` |
| 12 | InputGroup | Feld mit Vor- und Nachsatz | Eroj-Runde 6 | Währung, Einheit, Domain; teilweise durch `unit` im kampo (A-kampo-1) gedeckt. | `src/InputGroup/InputGroup.doc.mjs` |
| 13 | PowerSearch | Strukturierte Filterleiste | Eroj-Runde 6 | Feld, Operator und Wert als Schlagworte; verwandt mit der Sxablono filtrilo. | `src/PowerSearch/PowerSearch.doc.mjs` |
| 14 | CommandPalette | Befehlspalette | Eroj-Runde 6 | Tastaturzugang zu allen Aktionen; nützlich für Agenten-Werkzeuge, aber ohne Eile. | `src/CommandPalette/CommandPalette.doc.mjs` |
| 15 | HoverCard | Hover-Karte | Eroj-Runde 6 | Vorschau beim Überfahren; Abgrenzung zu konsileto und sxvebilo nötig. | `src/HoverCard/HoverCard.doc.mjs` |
| 16 | ClickableCard | Anklickbare Karte | Eroj-Runde 6 | Entscheidet die Grenze clickable-card der karto. | `src/ClickableCard/ClickableCard.doc.mjs` |
| 17 | SelectableCard | Wählbare Karte | Eroj-Runde 6 | Auswahl mit viel Inhalt je Option, etwa Tarife. | `src/SelectableCard/SelectableCard.doc.mjs` |
| 18 | List | Liste | Eroj-Runde 6 | Einträge mit Icon, Text und Aktion; heute ohne Ero, Agenten bauen sie aus Text. | `src/List/List.doc.mjs` |
| 19 | TreeList | Baumansicht | Eroj-Runde 6 | Hierarchien wie Ordner; eigene Tastatur nach APG. | `src/TreeList/TreeList.doc.mjs` |
| 20 | Timestamp | Zeitangabe | Eroj-Runde 6 | Zeit als lesbarer Text in der gewählten Sprache; passt zum Lingvo-Schalter. | `src/Timestamp/Timestamp.doc.mjs` |
| 21 | AvatarGroup | Avatargruppe | Eroj-Runde 6 | Entscheidet die Grenze avatar-group des avataro. | `src/AvatarGroup/AvatarGroup.doc.mjs` |
| 22 | MobileNav | Mobile Navigation | Eroj-Runde 6 | Entscheidet die Grenze collapsed-mobile des navigado; braucht das Seitenpanel. | `src/MobileNav/MobileNav.doc.mjs` |
| 23 | Outline | Inhaltsverzeichnis | Eroj-Runde 6 | Lange Seiten und Doku; die Vitrino könnte es selbst nutzen. | `src/Outline/Outline.doc.mjs` |
| 24 | Kbd | Tastenkürzel | Eroj-Runde 6 | Kürzel in Menüs und Hilfetexten. | `src/Kbd/Kbd.doc.mjs` |
| 25 | Blockquote | Zitat | Eroj-Runde 6 | Heute nur als Teil `quote` im markdovido. | `src/Blockquote/Blockquote.doc.mjs` |
| 26 | Citation | Quellenangabe | Eroj-Runde 6 | Belege in Antworten von Agenten. | `src/Citation/Citation.doc.mjs` |
| 27 | Thumbnail | Bildvorschau | Eroj-Runde 6 | Entscheidet die Grenze image-preview des alsxutilo. | `src/Thumbnail/Thumbnail.doc.mjs` |
| 28 | Carousel | Karussell | Eroj-Runde 6 | Niedrige Priorität: Inhalte im Karussell werden selten gesehen. | `src/Carousel/Carousel.doc.mjs` |
| 29 | Lightbox | Bildbetrachter | Eroj-Runde 6 | Niedrige Priorität. | `src/Lightbox/Lightbox.doc.mjs` |
| 30 | Timer | Laufende Dauer | Eroj-Runde 6 | Niedrige Priorität. | `src/Timer/Timer.doc.mjs` |
| 31 | Chat | Chat | Eroj-Runde 6 | Familie für Unterhaltungen mit Agenten; eigene Spec wert, wenn der Nordstern es verlangt. | `src/Chat/Chat.doc.mjs` |
| 32 | ChatToolCalls | Werkzeugaufrufe | Eroj-Runde 6 | Gehört zum Chat. | `src/Chat/ChatToolCalls.doc.mjs` |
| 33 | NavHeadingMenu | Menü im Navigationskopf | Eroj-Runde 6 | Gehört zur Navigation oben; Grenze submenu des navigado. | `src/NavMenu/NavMenu.doc.mjs` |
| 34 | NavIcon | Produkt-Icon der Navigation | Sxablono (Templates, später) | Gehört zum Kopf des sxelo. | `src/NavIcon/NavIcon.doc.mjs` |
| 35 | OverflowList | Liste mit Überlauf | kein Ero | Verhalten, kein Ero: gehört in langetaro, spuro und navigado (A-langetaro-4). | `src/OverflowList/OverflowList.doc.mjs` |
| 36 | Toast | Einblendung | Grenze bleibt | Der Maintainer hat den Toast in Spec 015 ausgeschlossen (E6); er bleibt Grenze `toast` des avizo. | `src/Toast/Toast.doc.mjs` |
| 37 | FormLayout | Formularraster | Sxablono (Templates, später) | Die Sxablono formularo deckt das; Templates sind nicht Teil dieser Spec. | `src/FormLayout/FormLayout.doc.mjs` |
| 38 | Layout | Bereiche einer Seite | Sxablono (Templates, später) | sxelo und pagxo decken das. | `src/Layout/Layout.doc.mjs` |
| 39 | Section | Seitenabschnitt | Sxablono (Templates, später) | Gehört zur Sxablono pagxo. | `src/Section/Section.doc.mjs` |
| 40 | Grid | Raster | kein Ero | Anordnung, kein Ero; das Raster kommt aus den Tokens und den Sxablonoj. | `src/Grid/Grid.doc.mjs` |
| 41 | Stack | Stapel | kein Ero | Anordnung, kein Ero; der Abstand gehört dem Container. | `src/Stack/Stack.doc.mjs` |
| 42 | Center | Zentrieren | kein Ero | Anordnung, kein Ero. | `src/Center/Center.doc.mjs` |
| 43 | AspectRatio | Seitenverhältnis | kein Ero | Hilfsmittel für Medien; Teil `media` der karto. | `src/AspectRatio/AspectRatio.doc.mjs` |
| 44 | ScrollableArea | Scrollbereich | kein Ero | Verhalten; der tabelo hat seine Region schon. | `src/ScrollableArea/ScrollableArea.doc.mjs` |
| 45 | Resizable | Ziehbare Bereiche | Sxablono (Templates, später) | Gehört zum sxelo, etwa die Breite der Seitenleiste. | `src/Resizable/Resizable.doc.mjs` |
### Abweichungen

1. **Amendment v2.4 noch nicht in der Constitution.** Die Constitution auf `main` ist v2.3. Art. V sagt dort noch „Quellmaterial anderer Systeme wird dem Coding-Tool nicht vorgelegt“. ②a liest die Fonto nach der Entscheidung des Maintainers vom 23.10. und dem Auftrag der Spec („②a darf sofort starten“, „Die Fonto liest P0 nur in der gepinnten Version“).
   - Das Amendment selbst landet mit ①, zusammen mit `data/fontoj.json`, `THIRD_PARTY_NOTICES.md` und `check:fontoj`.
   - ②a bringt keine Werte und keine Texte ins Repo.
2. **Daten bei der Spec, nicht im Modelo.** `abgleich.json` liegt in `specs/029-fonto-astryx/`, weil ②a nichts baut. ②b trägt die beschlossenen Zeilen ins Skemo, in die Uzo und in die Ero-Tokens ein.
3. **Eine Zeile je Aspekt.** Achsen und Werte stehen in einer Zeile, ebenso Anatomie und Slots: sechs Zeilen je Ero, 240 insgesamt. Eine Zeile je Eigenschaft wäre etwa dreimal so lang, ohne mehr zu entscheiden.
4. **Ohne eigenes Gegenstück:**
   - `lokredaktilo`: Die Fonto hat keinen Inline-Editor; genannt ist das Textfeld, das im Bearbeiten-Modus erscheint.
   - `saltligilo`: Die Fonto hat keinen eigenen Sprunglink; genannt ist die Seitenhülle, die ihn setzt.
5. **Ein Gegenstück für zwei Eroj:** `elektilo` und `listelektilo` haben beide den Selector der Fonto zum Gegenstück. Die Fonto hat nur eine Auswahl; wir trennen die native von der gestalteten.
6. **Namen der neuen Achsen sind Vorschläge.** Der Maintainer entscheidet sie mit der Zeile (O-6).

### Befunde / Mankoj

- **B-1, wo Fundamento vorn liegt:**
  - Die Fonto hat keinen Inline-Editor, keinen Sprunglink als Komponente und keinen Messbalken mit der Rolle meter; ihr Fortschrittsbalken ist ein Vorgang, kein Stand.
  - Unsere Grenzen mit Kialo nennen, was ein Agent nicht bauen soll; die Fonto hat dafür Hinweise in Prosa.
- **B-2, Kategorienfarben:** Die Fonto hat 10 Farbtöne für Kategorien an Badge, Token und Karte. Fundamento hat keine Rollen dafür; der signeto führt sie als Grenze tinted-categories. Manko-Kandidat für ①, Farbe, falls die Rollen dort entstehen.
- **B-3, weniger Größen:** Drei Zeilen (A-elekto-2, A-markobutono-2, A-sxaltilo-2) streichen `large`, weil die Fonto zwei Stufen hat. Das bricht jede Nutzung von `large` (O-2).
- **B-4, Laden und Status in allen Feldern:** M-2 und M-5 berühren 12 Eroj. In ②b ist das der größte Block: neue Ero-Tokens für Warnung und Erfolg in allen Marken und Kontrastpaare dazu.
- **B-5, Rollen:** Die Fonto setzt die Rolle der Meldung nach dem Status (A-avizo-5) und die des Dialogs nach dem Zweck (M-3). Beides ändert, was Screenreader ansagen, und gehört in die Kontrastmatrix und die Tastaturtabellen von ③.

### Offen (für den Maintainer)

- **O-1, wie entscheiden:** Vorschlag: eine Liste der IDs je Entscheidung im Briefing für ②b, etwa „übernehmen: A-avizo-5, M-3 …; anders als vorgeschlagen: A-elekto-2 behalten“. P0 trägt sie in `entscheidung` ein; der Test lässt dort `null` oder einen der drei Werte zu. **Entschieden 24.10. (②a-1): der Vorschlag jeder Zeile gilt, Ausnahmen ②a-2 bis ②a-6 (oben).**
- **O-2, gestrichene Werte:** Soll `large` bei elekto, markobutono und sxaltilo sofort entfallen? Oder ein Release lang als Alias auf `medium` bleiben, mit Jugxo und Hinweis im Gvidanto? Vorschlag: Alias für ein Release. **Entschieden 24.10. (②a-2): Alias für ein Release, als veraltet markiert (Warnung im Gvidanto und in der Konsole), danach entfernen.**
- **O-3, Grenzen, die Zeilen entscheiden würden:**
  - tooltip-on-disabled (M-1)
  - multiple-months (A-datelektilo-1)
  - grouped-options (A-elektilo-4)
  - many-tabs (A-langetaro-4)
  - download (A-ligilo-6)
  - collapsed-middle (A-spuro-6)
  - character-count (A-tekstareo-1)
  - syntax-highlighting (A-kodbloko-6, mit ①)

  Weitere Grenzen bleiben laut Vorschlag, die Fonto hat dort etwas: labelled-line, indeterminate, skeleton, diff, presets, ticks-with-labels, vertical-track, create-new-value, row-selection.

  **Entschieden 24.10. (②a-3): wie in den Zeilen vorgeschlagen; die Syntax-Hervorhebung kommt mit den Syntaxfarben in ②b.**
- **O-4, Fortschritt:** Ein eigenes Ero für Fortschritt mit bekannter Dauer (Rolle progressbar), neben dem mezurilo? Vorschlag: Kandidat für Eroj-Runde 6. **Entschieden 24.10. (②a-4): ja, in Eroj-Runde 6.**
- **O-5, Platzhalter in Form des Inhalts:** Die Grenze skeleton des plenstato bleibt nach Vorschlag. Die Fonto hat den Platzhalter. **Entschieden 24.10. (②a-5): bleibt, neu entschieden in Eroj-Runde 6.**
- **O-6, Namen:** die 12 neuen Achsennamen der Zusammenfassung, Punkt 5. **Entschieden 24.10. (②a-6): angenommen, außer `rules` → `lines`.**

### Messanleitung

Im Checkout des Maintainers, vor dem Merge auf dem Branch, danach auf `main`:

```sh
cd /Users/thorstenjankowski/n8n-compose/20260918_fundamento-ds
git fetch origin
git switch 261023-spec-029-2a-abgleich-826849
pnpm install
```

**1. Die Tabelle lesen.** Diesen Plan im Editor oder in der Vorschau öffnen:

```sh
open "file:///Users/thorstenjankowski/n8n-compose/20260918_fundamento-ds/specs/029-fonto-astryx/plan.md"
```

Die Daten: `file:///Users/thorstenjankowski/n8n-compose/20260918_fundamento-ds/specs/029-fonto-astryx/abgleich.json`.

**2. Zeilen nach Vorschlag oder Ero filtern.** Zum Beispiel alle Zeilen „übernehmen“ und alle Zeilen des `dialogo`:

```sh
cd /Users/thorstenjankowski/n8n-compose/20260918_fundamento-ds
node -e 'const d=require("./specs/029-fonto-astryx/abgleich.json");for(const e of d.eroj)for(const z of e.zeilen)if(z.vorschlag==="übernehmen")console.log(z.id, "–", z.begruendung)'
node -e 'const d=require("./specs/029-fonto-astryx/abgleich.json");for(const z of d.eroj.find(e=>e.ero==="dialogo").zeilen)console.log(z.id, z.vorschlag, "–", z.begruendung)'
node -e 'const d=require("./specs/029-fonto-astryx/abgleich.json");for(const z of [...d.muster,...d.eroj.flatMap(e=>e.zeilen)])if(z.auflage)console.log(z.id, z.entscheidung, "–", z.auflage)'
```

**3. Den Pin prüfen.** Integrity und Commit stimmen mit der Tabelle oben überein:

```sh
npm view @astryxdesign/core@0.7.4 dist.integrity
npm view @astryxdesign/theme-neutral@0.7.4 dist.integrity
git ls-remote https://github.com/facebook/astryx.git refs/tags/v0.7.4
```

Erwartet: die beiden Integrity-Werte aus „Fonto (gepinnt)“ und `704757fd827c6fa00a71af80b06d5da99d155e45	refs/tags/v0.7.4`.

**4. Eine Zeile an der Quelle nachsehen** (optional). Die Pfade der Spalte „Quelle“ gelten im Paket:

```sh
mkdir -p /tmp/fonto-astryx-0.7.4 && cd /tmp/fonto-astryx-0.7.4
npm pack @astryxdesign/core@0.7.4 && tar xzf astryxdesign-core-0.7.4.tgz
open "file:///tmp/fonto-astryx-0.7.4/package/src/Dialog/Dialog.doc.mjs"
```

**5. Die Tests.**

```sh
cd /Users/thorstenjankowski/n8n-compose/20260918_fundamento-ds
pnpm --filter @fundamento/modelo exec vitest run src/docs/docs.test.ts -t "Spec 029"
```

Erwartet: 8 Tests grün.

Die Spec: `file:///Users/thorstenjankowski/n8n-compose/20260918_fundamento-ds/specs/029-fonto-astryx/spec.md`.

## ②b-1 – Feld-Muster (M-1, M-2, M-5, M-6)

Auftrag des Maintainers vom 28.10. (21:56): ②b setzt genau die Entscheidungen aus ②a um (`abgleich.json` mit Auflagen), Maßstab „gut genug“, kein Story- oder Pixelabgleich mit dem Storybook der Fonto; Figma prüft der Maintainer bei der Abnahme. Schnitt (Auftrag 29.10.: kleinere PRs nach Themen, den genauen Schnitt legt P0 fest), gestapelt, jeder einzeln abgenommen. M-2 steht in einem eigenen PR ②b-1b: es fasst die zwölf Felder in Modelo, Web und Figma ein zweites Mal an, ②b-1 bleibt so abnehmbar:

| PR | Inhalt | Zeilen aus `abgleich.json` |
|---|---|---|
| ②b-1 Felder | M-5 Laden, M-6 Löschen, M-1 Grund für „deaktiviert“, dazu der Brief mit `flags` | M-1, M-5, M-6 und die Zeilen, die nur darauf verweisen (Löschen bei datelektilo/kompletigilo/listelektilo, A-butono-5, A-faldilo-3, A-konsileto-6) |
| ②b-1b Status | M-2 Status warning/success mit `message-position`, das Status-Icon im kampo | M-2 und die Zeilen, die nur darauf verweisen (Zustände der Felder A-*-3, A-kampo-4) |
| ②b-2 Achsen und Werte | neue Achsen und Größen, `large` als veralteter Alias (elekto, markobutono, sxaltilo), `lines`, Zweck-Achse des dialogo (M-3) | Aspekte „achsen“ und „groessen“ |
| ②b-3 Anatomie und Slots | neue Teile und Slots | Aspekt „anatomie“ |
| ②b-4 Verhalten | Tippen-Springen, Rollen nach Status und Zweck, Überlauf, Download, unbekannte Gesamtzahl, ausgelassene Mitte, Streamen | Aspekt „verhalten“, übrige Musterzeilen |
| ②b-5 kodbloko, Schrift, Form | Syntaxfarben mit dem kodbloko (①-2), Ersatzschrift nach Kategorie (①-7), signeto/insigno unterscheidbar, Vitrino-Befunde aus Spec 025 | A-kodbloko-1/4/6, A-signeto-6 |

### Entwurf

- **M-5 Laden in Feldern** (kampo, tekstareo, elektilo, listelektilo, plurelektilo, kompletigilo, datelektilo, glitilo, elekto, markobutono, sxaltilo, alsxutilo): Boolean `loading` wie am butono. Das Feld bleibt bedienbar (wie der kompletigilo seit Nachlese 4 N-9) und ist beschäftigt (`aria-busy`); beschrieben mit dem Wort des Modelo („lädt“), der kompletigilo weiter in seiner Live-Region. Sichtbar als Teil `spinner`: der Bogen des plenstato in Icongröße (`size.icon.small`) und gedämpfter Schrift (`color.text.muted`), der sich mit den Bewegungsrollen dreht und unter reduzierter Bewegung steht. Figma: BOOLEAN `loading` zeigt den Spinner.

- **M-6 Löschen-Knopf im Feld** (kampo, elektilo, listelektilo, plurelektilo, datelektilo, kompletigilo): Boolean `clearable`, Teil `clear` (Knopf nur mit Icon `close`, so groß wie das Icon am Ende des Feldes; seit Abnahme #122), sichtbar solange das Feld einen Wert hat und weder deaktiviert noch schreibgeschützt ist, Name „{label} leeren“; ein Druck leert den Wert und sagt die Ereignisse, die das Skemo des Feldes nennt: kampo, kompletigilo und datelektilo input und change; elektilo und listelektilo sagen beim Leeren nur change, wie wenn eine Person wählt (ihr Skemo nennt nur change, eine Auswahl tippt man nicht; Konformitätstest). Der Fokus geht ins Feld zurück. Der kampo der Art search zeigt ihn wie bisher auch ohne `clearable`. Der plurelektilo hatte seinen eigenen („Alle abwählen“ im Panel): dort ist `clearable` standardmäßig wahr und behält seine Wörter. Figma: BOOLEAN `clearable` zeigt den Knopf.

- **M-1 Grund für „deaktiviert“** (Entscheidung 29.10.: im konsileto): Text-Slot `disabled-reason` an jedem Ero mit `disabled` (kampo, tekstareo, elektilo, listelektilo, plurelektilo, kompletigilo, datelektilo, glitilo, elekto, markobutono, sxaltilo, alsxutilo, butono, menuo) und am faldilo, der dafür `disabled` bekommt (A-faldilo-3). Mit Grund bleibt das Element mit Tab erreichbar, ist `aria-disabled` und vom Grund beschrieben; der Grund erscheint in einem eingebetteten konsileto bei Fokus und Überfahren; jede Bedienung wird abgefangen. Ohne Grund wie bisher (übersprungen). Bedingung: ein Grund ohne `disabled` ist ein Widerspruch. Die Grenze tooltip-on-disabled des konsileto ist damit entschieden: sie bleibt (das Uzo-Schema verlangt eine Grenze) mit `not-supported` und verweist auf den Slot. Der langetaro hat kein `disabled` auf Ero-Ebene (nur einzelne Reiter): M-1 greift dort nicht. In Figma ist der Grund ein konsileto der laufenden Seite, keine Ebene des Sets.

### M-5 umgesetzt

- **Modelo:** zwölf Felder mit `loading` (beim kampo nach den Props von 0.2.0, Arkitekturo-Vertrag), `aria-busy`, Wort „lädt“, Teil `spinner` (`size.icon.small`, `color.text.muted`, `spacing.small` als Abstand zur Beschriftung); 36 Ero-Tokens in allen Marken (`pnpm vortaro:ero-tokenoj`), provo und provo-kompakta neu abgeleitet, Stufe-1-Prüfsummen und Fingerabdruck der Struktur neu (wie bei Spec 024/025).
- **Web:** der Bogen hinter Beschriftung und Pflichtmarke in allen sieben Feld-Templates, verborgen bis zum Laden, dreht einmal je `motion.duration.slow`; das Feld bleibt bedienbar (nur der butono sperrt beim Laden). Die Vitrino zeigt jedes Feld in einer Spalte `loading`.
- **Figma:** die Beschriftung jedes Feldes in einer Zeile mit dem Spinner (`label-row`), BOOLEAN `loading`; der Bildvergleich gegen main nennt die Variablen ohne ihre IDs (vom Maintainer am 29.10. bestätigt), Basis vom unveränderten Plugin neu geschrieben, kein Bild geändert.
- **Vergleiche mit main:** komuna-0-2, ekzemplo, provo, provo-kompakta lösen jedes Token von main zum Wert von main auf; nur die neuen (`neu-seit-main.ts`) zählen getrennt.

### M-6 umgesetzt

- **Modelo:** `clearable` bei kampo, elektilo, listelektilo, datelektilo, kompletigilo (am Ende der Props), beim plurelektilo standardmäßig wahr (`clearable="false"` nimmt sein „Alle abwählen“); Teil `clear` bei vier Feldern neu (4 Ero-Tokens); Wort „{label} leeren“/„Clear {label}“. **Verhaltensänderung:** der Löschen-Knopf eines Suchfelds (Spec 025 ①) heißt jetzt nach seiner Beschriftung („Suche“ ergibt weiter „Suche leeren“).
- **Web:** der Knopf erscheint, solange ein Wert da ist und das Feld weder deaktiviert noch schreibgeschützt ist; elektilo neben dem Chevron, datelektilo vor dem Auslöser, listelektilo und kompletigilo am Ende einer neuen Zeile; ein Druck leert, sagt die Ereignisse des Skemo (elektilo, listelektilo nur change) und gibt den Fokus ans Feld.
- **Figma:** `close` am Ende des Controls (vor dem Chevron), Farbe die Beschriftung des butono low, Größe `clear.size`; die Freigabe aus Spec 025 ① gilt nur noch für den plurelektilo (`check:parity` 641 statt 659 freigegebene).
- **Budget Brief 750:** der kampo stand mit M-5 und M-6 bei 758; drei Begründungen im Uzo des kampo (Vorschläge, Wert in der Ansicht, nach Gefühl) gestrafft, englisch und deutsch – jetzt 740. Für M-2 (zwei Achsen, etwa +52) entschied der Maintainer am 29.10.: Boolean-Props stehen im Brief kompakt als Liste von Namen.

### M-1 umgesetzt

- **Modelo:** Text-Slot `disabled-reason` an den 15 Eroj (`a11y.description` nennt ihn, Bedingung „Grund nur mit `disabled`“); der faldilo bekommt `disabled`, den Zustand `disabled` und die Farbe seiner Zusammenfassung nach Zustand (`summary.color.rest/hover/focus/disabled`, `summary.fill.disabled`; 5 Ero-Tokens neu, `summary.color` wird zu `summary.color.rest` mit demselben Wert, auch in `aspekto-komuna/deveno.json`). Die Grenze tooltip-on-disabled des konsileto steht auf `not-supported`.
- **Web:** der Slot wartet unsichtbar im Schattenbaum; erst deaktiviert mit Grund legt das Ero einen stillen konsileto an (`data-fm-silent`: er schreibt keine Beschreibung, das Ero nennt ihn selbst) und setzt den Slot hinein, ohne Grund nimmt es ihn zurück (so trifft kein Selektor der übrigen Tests den Teil `control` des konsileto). Der konsileto sucht sein `for` zuerst im eigenen Schattenbaum. Deaktiviert mit Grund wird das erste gesperrte Bedienelement erreichbar (`aria-disabled` statt `disabled`, bzw. Tab-Stopp für Radio-Zeile, Regler-Daumen und Zusammenfassung), vom Grund beschrieben; der Host fängt Zeiger, Tasten (außer Tab und Escape) und Eingaben ab. Der Zustand „disabled“ der Stile gilt auch dafür (`:is(:disabled, [data-fm-reasoned])`). Der menuo reicht den Slot an seinen eigenen Auslöser-butono weiter. Der faldilo sperrt deaktiviert seine Zusammenfassung (kein Tab-Stopp, kein Umschalten).
- **Figma:** der faldilo hat 8 statt 6 Varianten; im Bildvergleich ist das eine gewollte Änderung (`WANTED`), sonst kein Bild geändert. Kein Set zeichnet den Grund (Wächtertest).
- **Vergleiche mit main:** `neu-seit-main.ts` kennt die 4 neuen Tokens des faldilo und die Umbenennung; die Vergleiche prüfen `summary.color.rest` gegen den Wert von `summary.color` auf main.

### Brief: Boolean-Props kompakt

Entscheidung des Maintainers (29.10.): Im Brief von `get_ero` stehen Boolean-Props, die keine Achse sind, als Namen in `flags` (Skemo-Reihenfolge); `props` nennt die übrigen mit Typ. Das Ausgabeschema von `get_ero` kennt `flags`. Der kampo sinkt von 740 auf 682 (Grenze 750 unverändert) – Platz für die Achsen von M-2. Für MCP-Clients ändert sich die Form des Briefs: wer `props` nach Booleans durchsuchte, liest jetzt `flags`.

## ②b-1 – Abnahme #122 (30.10.): rechter Feldrand

Abnahme des Maintainers: Funktion von M-5, M-6 und M-1 abgenommen, die Optik am rechten Feldrand nicht. Befunde: Web – Löschen-Knopf und Kalender des datelektilo außerhalb des Feldrands, das Feld wird schmaler, sobald der Knopf erscheint; Figma – kampo: Knopf halb über dem Rand, elektilo: Knopf vor dem Text und Pfeil außerhalb, datelektilo: Knopf außerhalb und Kalender fehlt, das ✕ zu groß und zu kräftig, freistehende Instanzen 85–132 px breit; Vitrino – kein Abschnitt Löschen, keine Spalte loading bei datelektilo und listelektilo, required in der Spalte loading; die Ereignisse beim Leeren weichen vom Bericht ab.

### Regel (im Skemo)

- **`trailing`** (neu im Skemo-Schema): die Teile am Ende eines Feldes, von innen nach außen. Ein Feld mit Rahmen (kampo, tekstareo, elektilo, listelektilo, plurelektilo, kompletigilo, datelektilo) zeigt sie im Feld, innerhalb des Rands: Spinner, Löschen-Knopf, dann die Schrittknöpfe des kampo, der Pfeil (`indicator`) oder der Kalender (`trigger`). Das Status-Icon von M-2 kommt in ②b-1b vor den Spinner. Felder ohne Rahmen (glitilo, elekto, markobutono, sxaltilo, alsxutilo) nennen nur den Spinner: er steht am Ende des Feldes – beim glitilo am Ende der Zeile, beim elekto oben rechts in der Gruppe, beim alsxutilo rechts in der Ablagefläche. Bei markobutono und sxaltilo (ohne Rand, die Beschriftung neben dem Control) steht er direkt hinter dem Text der Beschriftung – nach ihrer letzten Zeile, vor einem Fehler darunter –, in Web und Figma gleich; das Skemo hält es als `trailingAfter: "label"` fest (Entscheidung des Maintainers 30.10.). Im Web hält die Beschriftung beim Laden den Platz des Spinners am Ende jeder Zeile frei, der Spinner selbst nimmt in der Zeile keinen: so bricht er nie allein in eine eigene Zeile um (in CI mit anderen Schriften gesehen; der Test prüft jetzt jede Breite von 8 bis 22rem).
- **Das Feld springt nicht:** die Teile liegen über dem Ende des Controls (Web: `[part="end"]`, absolut über der Zeile); das Control hält ihnen Platz frei (`padding-inline-end` + `--fm-end`, gemessen vom Element, sobald sich das Ende ändert). Die Breite des Feldes bleibt gleich, ob der Knopf da ist oder nicht.
- **Größen:** das ✕ ist so groß wie das Icon am Ende des Feldes – beim elektilo und kampo nach Größe wie der Pfeil (`size.icon.*` im Skemo; die Werte in komuna sind von `ero.elektilo.indicator.size` abgeleitet, Herkunft „derivita“ in `deveno.json`), beim listelektilo wie dessen Pfeil, beim datelektilo wie der Kalender. Die Schrittknöpfe des kampo ebenso (vorher `size.control.*`, ragten über den Rand).
- **Ziel bleibt Ziel (WCAG 2.2, 2.5.8):** sichtbar ist das ✕ so groß wie der Pfeil, der Knopf darum bleibt mindestens `size.target.min` groß (neue Eigenschaft `width` am Teil, im Web als quadratisches Minimum, in Figma als `minWidth`/`minHeight` um das mittig stehende Glyph; die Schrittknöpfe des kampo ebenso, in Figma weiter freigegeben wie seit Spec 025). Gefunden beim Gegenprüfen: Knöpfe von 16 px meldet axe als `target-size`-Verstoß, und der butono ragte mit seiner Mindestbreite über seinen Teil hinaus. Der Test dafür war rot, bevor die Ziele kamen (`51a65efc`).
- **Kalender des datelektilo:** `size.target.min` statt `size.control.medium` – die Fonto zeichnet ihn 16 px, komuna hält mit seinem Jugxo die Mindestgröße eines Ziels (`touch-target-min`, 24 px); er steht damit im Feld wie der Pfeil des elektilo.

### Umsetzung

- **Modelo:** `trailing` in den zwölf Skemoj; Ero-Tokens des ✕ bei kampo, kompletigilo und elektilo nach Größe (je 3 statt 1, +6), das Ziel `width` an sechs Knöpfen (+6), datelektilo `trigger.size` und `clear.size` `size.target.min`, listelektilo `clear.size` `size.icon.medium`; Marken, provo, provo-kompakta, Stufe-1-Prüfsummen und Fingerabdruck der Struktur nachgezogen. `neu-seit-main.ts` kennt die geänderten und die entfallenen Tokens (der Vergleich mit main prüft sie gegen den Wert von main).
- **Web:** ein gemeinsames Ende `[part="end"]` in allen Feld-Templates, geordnet nach `trailing` (auch der Knopf, den das Element erst bei Bedarf anlegt); der Spinner nicht mehr in der Beschriftung. `loading` setzt keine Pflichtmarke mehr.
- **Figma:** Spinner, Löschen-Knopf, Pfeil und Kalender im Control, in der Reihenfolge von `trailing`; der Text füllt das Control, das Ende folgt ihm. Der datelektilo verliert seine Zeile `row`: der Kalender steht im Control (ältere Läufe werden umgezogen). Das ✕ in der Größe von Pfeil bzw. Kalender. Jedes Feld-Set steht mindestens 256 px breit (`FIELD_WIDTH`, wie die Fonto ihre Felder zeigt). Bildvergleich: die sieben Felder mit Rahmen sind gewollte Änderungen (`WANTED`, Befund „Abnahme #122“), sonst kein Bild geändert. Nebenbei behoben: ein Rahmen, dessen Ausrichtung schon geschrieben war (ein Kind wurde zuerst geschrieben), richtete sich beim Dehnen nicht neu aus.
- **Vitrino:** Abschnitt „Löschen“ mit kampo, elektilo, listelektilo, kompletigilo, datelektilo in den Spalten mit Wert, leer, disabled, readonly (`clearable`); elektilo und kompletigilo haben kein `readonly` im Skemo (ein Auswahlfeld der Plattform ist nicht schreibgeschützt) – ihre Zelle sagt „kein readonly“ statt eines Attributs, das sie übergehen würden. Spalte loading bei datelektilo und listelektilo; die Spalte loading zeigt kein required mehr (kampo, elektilo, elekto). In der Werkstatt scrollt jede Seite, was breiter ist als ihre Spalte: die breitere Tabelle des datelektilo lag sonst unter der anderen Seite (axe `target-size`).

### Ereignisse beim Leeren

Bericht korrigiert, Verhalten bleibt: elektilo und listelektilo sagen beim Leeren nur change, wie wenn eine Person wählt – ihr Skemo nennt nur change, eine Auswahl tippt man nicht; ein input, das kein Tippen ist, würde Formulare, die auf input hören, ohne Grund auslösen. kampo, kompletigilo und datelektilo sagen input und change (ihr Skemo nennt beide). Der Satz zu M-6 oben nennt das; ein Doku-Test hält ihn.

### Tests

Rot in `61cf5be5`, das Ziel der Knöpfe rot in `51a65efc`, der Spinner hinter dem Text (markobutono, sxaltilo) rot in `b6415047` (Modelo 1, Browser je Engine 1 neu, dazu der bestehende Test des butono): Modelo (`feldrand.test.ts`: `trailing` je Feld, Größen des ✕), Browser (`eroj/test/feldrand.spec.ts`, drei Engines: alles innerhalb des Rands und in der Reihenfolge, gleiche Breite mit und ohne Knopf, ✕ = Pfeil bzw. Kalender, Spinner nicht in der Beschriftung, loading ohne Pflichtmarke), Figma (`figma/feldrand.test.ts`: Reihenfolge im Control, ✕-Breite, Kalender vorhanden, Breite ≥ 240), Vitrino (Abschnitt Löschen, Spalten loading; Browserprüfung in `vitrino.check.ts`), Doku (Satz zu den Ereignissen).

### Messungen

- perf AK-07 (Start bis zum ersten describe), Budget 2000 ms, wird im Bericht jedes Laufs beobachtet, das Budget bleibt (Auftrag 30.10.). Läufe auf dieser Maschine: 1893 ms bei `29708e81`; 1961, 1901, 1906 ms bei `4b43c501`; 1938, 1951, 1984 ms bei `a35ae64b`.
- Gegenmessung main gegen den Zweig, abwechselnd auf derselben Maschine (`a35ae64b` gegen main `04b68b79`, je vier Läufe): main 1947, 1896, 1873, 1869 ms (Median etwa 1880); Zweig 1960, 1971, 1978, 1971 ms (Median etwa 1970). Der Zweig ②b-1 kostet den Start damit etwa 90 ms; die Luft zum Budget ist etwa 30 ms. Das Laden des Modelo ist es nicht (`loadModelo` etwa 100 ms auf beiden Seiten); die Ursache liegt anderswo im Start des MCP-Servers und ist noch nicht gefunden.
