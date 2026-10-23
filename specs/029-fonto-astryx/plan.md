# Spec 029 ① – Fonto Astryx: Grundlagen – Plan

**Spec:** [`spec.md`](spec.md) (Fassung vom 2026-10-23, unverändert kopiert; SHA-256 `36ac8edf…bfd30a710a`) · **Basis:** `main` nach dem Merge von Spec 027 (#109, `d29a5206`) · **Regel 0** gilt: der Weg, den das Repo schon geht, sonst die kleinste Änderung mit Eintrag hier. **Kein Budget angehoben.** **Nichts weggeworfen:** die heutige komuna steht unverändert als `komuna-0-2` daneben.

**Branch:** `261023-spec-029-fonto-astryx-grundlagen` (von `main` `d29a5206`) · **Datum:** 2026-10-23 · **Stand:** ① gebaut, Abnahme offen. ②a startet in Sitzung B; ②b und ③ stapeln nach der Entscheidung zu ②a auf diesen Branch.

### Zusammenfassung

| # | Punkt der Spec | Was jetzt gilt |
|---|---|---|
| A | Constitution Amendment v2.4 | Art. V Absatz „Fonto (offene Quelle)“ mit den sieben Bedingungen, Art. VII Herkunft je Wert, Clean-Room-Ausnahme, Terminologie **Fonto**, Änderungshistorie; die Ontologio kennt die Fonto (22. Begriff). |
| B | Fonto gepinnt | `packages/modelo/data/fontoj.json`: astryx, `@astryxdesign/core` und `@astryxdesign/theme-neutral` **0.7.4** mit Integrität, Tag `v0.7.4`, Commit `704757fd827c6fa00a71af80b06d5da99d155e45`. `THIRD_PARTY_NOTICES.md` mit Copyright und MIT-Text. Prüfung **`check:fontoj`** in `pnpm check` und CI. |
| ①1 | komuna-0-2 | Neues Paket `packages/aspekto-komuna-0-2` (Namespace `malnova`): die heutige komuna als vollständiges eigenes Set mit Dunkel-Set, Schriften, Ikonaro und Aspiroj. Im Build mit allen Marken, umschaltbar in Vitrino, Studio (Basis „komuna-0-2“) und Figma (fünfter Modus). **pixelgleich:** in allen 72 Kombinationen jeder der 1 608 Werte wie komuna auf `main` (Test), Bildvergleich der Vitrino unten. |
| ①2 | komuna nach theme-neutral | Farbe, Typografie-Skala (Basis 14, Verhältnis 1,2; Touch und schmal: Basis 16, 1,1736), Abstände, Elementgrößen 28/32/36, Radien 6/10/12/28, Elevation mit dunkler Lichtkante, Fokus 2 px mit 3 px Abstand, Bewegung 125/300/700 ms und die Kurve der Fonto. **Familien bleiben Geist und Geist Mono.** 405 Werte mit Herkunft in `packages/aspekto-komuna/deveno.json`. |
| ①3 | provo mit Prata | `font.family.display` von provo ist `Prata, ui-serif, serif` (OFL-1.1), neu abgeleitet; jeder andere Wert von provo gleich (Test). |
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
| `color.background.inverse` | hell | #0a1317 | neutral.950 |
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
- **B-2 Prata hat nur das Gewicht 400.** Überschriften von provo stehen in 600 bzw. 700; der Browser fettet Prata künstlich. Figma fällt für fehlende Schnitte auf Inter zurück und sagt es.
- **B-3 Generischer Fallback des Agordilo:** Ohne `festgelegt` schreibt die Ableitung `[Prata, system-ui, sans-serif]` – eine Serifenschrift mit serifenlosem Ersatz. provo legt `ui-serif, serif` fest; der Agordilo könnte den Ersatz aus der Kategorie der Schrift nehmen (`tiparoj.json` kennt sie).
- **B-4 Die unvollständige Fixture `aspekto-incomplete`** fällt bei fehlenden Tokens auf die Werte des Kerns zurück, also auf die neue komuna; dort fallen in ekzemplos Palette Ruhe und gedrückt zusammen (`state-distinct`). Die erwarteten Fehler nennen das jetzt mit.
- **B-5 Beratende APCA-Hinweise verschieben sich** (Vitrino, Kontrast, 72 Kombinationen von komuna, beratend, kein Budget): Text (`text-normal`) sinkt von 2358 auf 2286, Ränder (`ui`, Band Lc 45–60) steigen von 36 auf 360, zusammen 2394 → 2646. Die Ränder der Fonto sind heller als die von komuna 0.2; die Regeln heben sie auf 3:1 nach WCAG mit Reserve (J4, J6), das APCA-Band erreichen sie damit nicht überall. Das schlechteste Paar ist `border-inverse-on-background-inverse` mit Lc 30,1. Der Zeuge in `vitrino.check.ts` nennt die neue Zahl. Ob Ränder auch das APCA-Band halten sollen, wäre eine eigene Regel (O-5).
- **B-6 Werkstatt-Ansicht über der neuen komuna** (gefunden von `check:vitrino`, behoben, D-05): Der Entwurf im Standard zeigte die Werte der neuen komuna, ein Regler die von komuna 0.2. Die Werkstatt bringt jetzt das Stylesheet ihrer Struktur mit; Unit-Test in `celoj/vitrino/vitrino.test.ts`.
- **B-7 Rollbereich der Token-Tabelle** (gefunden von axe in `check:vitrino`, behoben): Der rollende Bereich der Tabelle aller Tokens ist mit der Tastatur erreichbar (`role="region"`, `tabindex="0"`, benannt durch die Tabellenüberschrift).

### Offen (für den Maintainer)

- **O-1 Weiße Flächen:** Soll das Aspiro `oklch-l-extreme` von komuna für Flächen fallen oder auf 0 gehen? Dann wären Fläche und Karte weiß wie in der Fonto (Seite 95, Fläche 97,5, Karte 100). Das Aspiro bleibt hier, weil keine Budgets angehoben und keine Ziele gesenkt werden sollen.
- **O-2 Syntax-Farben** (Abweichung 4): mit dem `kodbloko` in ②b, oder eigener Schritt?
- **O-3 Agordilo auf die neue komuna** (D-05): Kalibrierung neu messen, und wohin geht die Leitfarbe einer Marke, wenn der Akzent der Referenz neutral ist – in die Aktionen (wie bisher) oder nur in Akzente und Fokus (wie die Fonto)?
- **O-4 Die Dunkel-Rampen der Fonto** sind an den Enden weniger bunt als die hellen. Fundamento hat eine Rampe je Familie und Modus; komuna nimmt je Stufe die Rampe, die ihre Rollen im Modus brauchen. Soll das Modelo zwei Rampen je Familie kennen?
- **O-5 Ränder und APCA** (B-5): Reicht für Ränder 3:1 nach WCAG mit Reserve (heute die Regel), oder sollen sie auch das beratende APCA-Band Lc 45 halten? Das würde die Ränder von komuna dunkler machen als die der Fonto.

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

**3. provo zeigt Prata.** [file:///Users/thorstenjankowski/n8n-compose/20260918_fundamento-ds/.fundamento/projekcioj-cxiuj/vitrino/index.html#aspekto=provo](file:///Users/thorstenjankowski/n8n-compose/20260918_fundamento-ds/.fundamento/projekcioj-cxiuj/vitrino/index.html#aspekto=provo) – Überschriften in Prata (der Browser lädt die Schrift nicht; ohne installiertes Prata steht ui-serif). Prata: https://github.com/cyrealtype/Prata.

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
