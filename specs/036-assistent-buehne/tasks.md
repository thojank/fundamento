# Spec 036 – Aufgaben

**Spec:** [`spec.md`](spec.md) · **Plan:** [`plan.md`](plan.md) · **Basis:** `main` `f2b5a058`. Aufgaben ab T3601, je Teil A – Rot zuerst, B – Grün, C – Messung und Abschluss. Rote Commits enden auf „(rot)“, grüne auf „(grün)“, gewollte Bildänderungen beginnen mit „Bildtest neu:“, Doku-Commits mit „Spec 036:“. Häkchen mit den SHAs auf den PR-Branches (Teil 1 mit den SHAs nach der Zusammenführung, S36-1.4); offene Aufgaben ohne Häkchen, mit Grund. Entscheidungen als D-nn (vorläufige ID in Klammern), Zuordnung im plan.

## Teil 1 – Fehler aus der Abnahme (#134, `261031-spec-036-t1-abnahme`)

Aus den lokalen Hilfsbranches `…-t1-form`, `…-t1-figma`, `…-t1-assistent` per Cherry-pick zusammengeführt (D-16, D-71 (D-S36-1.4-2)); alte SHAs der Hilfsbranches in den Beiträgen S36-1.1 bis S36-1.4.

### A – Rot zuerst
- [x] **T3601 1.7** G5 auf dem langsamen Runner von Lauf 41140304922 nachgespielt: „Skripte blockieren 61 ms …“ rot – `83cf8bef`
- [x] **T3602 1.2** „eckiger“ von der Pille → 2, Agordilo und MCP `propose_agordo` – `701d83d3`
- [x] **T3603 1.1** Pille nur für einzeilige Bedienelemente: Bildtests Metiejo-Vorschau (`redaktilo`) und Werkstatt, Datentest – `1eab68f4`
- [x] **T3604 1.6** `elekto` nicht gewählt = leerer Ring (Figma-Double, hell/dunkel) – `b0506068`
- [x] **T3605 1.6** Beschriftung von `markobutono`/`sxaltilo` mittig zum Kästchen/Schalter – `2c53a06e`
- [x] **T3606 1.6** Spec 035 D-64: Monatsknöpfe des offenen `datelektilo`-Kalenders mit Größe und Füllung – `f6c23f72`
- [x] **T3607 1.3** Modell-Attrappe: interne Begriffe erreichen die Person; Systemtext nennt die Schritte nicht – `dbbfc753`
- [x] **T3608 1.4** Modell-Attrappe: Schlusssatz des Modells wird übernommen – `4e9815bd`
- [x] **T3609 1.5** Spec 035 D-95: Einstiegsfragen leiten weiter ohne „ohne Browser“ (Chromium, Vitest) – `eab29787`
- [x] **T3610 1.5** Spec 035 D-96: erster Aufbau ohne `freigabeOf` – `e995351d`
- [x] **T3611 1.5** Spec 035 D-99: Skriptbilder ohne zweite kräftige Farbe – `a83ecefa`

### B – Grün
- [x] **T3612 1.7** G5 relativ zur Referenzlast, Grenze 50 ms, Gegenprobe 80 ms × k – `3b8257f8`
- [x] **T3613 1.2** Stufenliste mit `zurueck: 2` in `wuensche.json`; Spec 035 D-83 für Spec 036 geändert – `e39c3ef3`
- [x] **T3614 1.1** Rolle `radius.role.multiline`, Skemoj, Referenzmarken, Fixtures neu abgeleitet, CHANGELOG – `38212e62` (kein „Bildtest neu“-Commit, D-49 (D-S36-1.1-5))
- [x] **T3615 1.6** komuna: Werte des nicht gewählten Kreises auf den Alias des Skemo, deveno bereinigt – `e2bcce1b`
- [x] **T3616 1.6** `label-line` mit `label-strut` an den Variablen des Rings – `91ee07ff`; Bildtest neu `ccee6aab`
- [x] **T3617 1.6** Plan-Feld `monthIcon`, Bindung der Monats-Glyphen – `4776abdd`; Bildtest neu `a44150f0`
- [x] **T3618 1.3** Systemtext aus Daten, Prüfung der Antwort (`nutzersprache.ts`, `data/nutzersprache.json`) – `956e87ec`
- [x] **T3619 1.4** `gelesenSatz` aus dem Ergebnis von `esploro.ts` – `00fc5f05`
- [x] **T3620 1.5** Spec 035 D-95: `notoj` und Link „Weiter zum Assistenten“ – `569cc23f`
- [x] **T3621 1.5** Spec 035 D-96: `ekrano.ts` mit `freigabeOf` – `5bde22b5`
- [x] **T3622 1.5** Spec 035 D-99: Kornblumenblau im Skriptbild, Akzent in der Ausgabe – `ff20545f`

### C – Messung und Abschluss
- [x] **T3623** Doku: Spec wortgleich, Gerüst von plan und tasks – `e49b4002` (D-43, D-S36-0.1-9)
- [x] **T3624** Zusammenführung Form/G5 → Figma → Assistent per Cherry-pick, alle 11 Rot/Grün-Paare und beide Bildtest-Commits auf den neuen Eltern erneut belegt (S36-1.4)
- [x] **T3625 1.7** G5 lokal mit `uptime` (grün, Gegenprobe rot) und in der CI (Referenz 64,5 ms, k 1,55, grün)
- [x] **T3626** AC-10 BASIS ↔ `ff20545f` zweimal 1336/1338 (nur `elekto`@komuna, gewollt); Werkzeug `ac10` mit Abschnitten in eigener Ebene (D-70, D-S36-1.4-1)
- [x] **T3627** PR #134, Messanleitung, CI 41218448452 grün 14/14
- [x] **T3628** Doku: Bildschirmfotos der Bühne (D-34) – `31d9cb7c`
- [x] **T3629** Doku: plan, tasks und Bericht konsolidiert (S36-6.3) – dieser Commit „Spec 036: plan, tasks und Bericht konsolidiert“
- [ ] **T3630 1.6** Sichtprüfung im Figma-Desktop-Plugin (leerer Ring, Beschriftung mittig, Monatsknöpfe) – beim Maintainer (Messanleitung Teil 1)
- [ ] **T3631 1.6** Fonto-Fall `elekto.mjs` mit `selected` korrigieren und neu messen – Folgearbeit (D-69, D-S36-1.3-8, zu entscheiden)

## Teil 2a – unbunte Marken und Bildgewicht (#135, `261031-spec-036-t2a-farbrollen`)

### A – Rot zuerst
- [x] **T3632 2.1** Erkennung Weg B/C mit synthetischem Material „Inko“ – `39f7618c`
- [x] **T3633 2.1** Ableitung: Aktionen und Verweise behalten die schwarze Leitfarbe – `7b2a8184`
- [x] **T3634 2.1** Verweis-Regulo: negative Fixture `regulo-link-unbunt-underline` – `71813023`
- [x] **T3635 2.3** Synthetische Seite „Ruvelo“ (Foto als img, background-image, picture), Vitest und Chromium – `805b35a1`

### B – Grün
- [x] **T3636 2.1** Schwellen `unbunt` in `kreilo.json`, Erkennung in `rekono.ts`, `abnahme-weg-c.ts --unbunt` – `9425c03d`
- [x] **T3637 2.1** Rollen einer unbunten Leitfarbe (`agordilo/src/unbunt.ts`) – `c84b7ade`
- [x] **T3638 2.1** Regulo `link-distinct-from-text`, positive Fixture – `2c7ea4f3`, Nachtrag `b2b6bd90`
- [x] **T3639 2.3** Klasse „großes Bild im ersten Bildschirm“, alle Gewichte in `kreilo.json › weg_c` – `2d81d594`

### C – Messung und Abschluss
- [x] **T3640 2.3** Weg C vorher/nachher synthetisch und Marke 2 mit `ministral-14b-2512` (0,00112 $)
- [x] **T3641** AC-10 1338/1338 zweimal (2.1), Metiejo 30/30 (2.3)
- [x] **T3642** PR #135, Messanleitung, CI 41227757180 grün 14/14
- [ ] **T3643 2.1** Hilfetext von `fm agordilo derive` um die unbunte Leitfarbe ergänzen – offen (nicht Teil der Tickets)
- [ ] **T3644 2.1** Pastellakzent als Statusfarbe unbunter Marken – offen (D-87, D-S36-2.1-13, zu entscheiden)

## Teil 2b – Zweitfarbe (#138, `261031-spec-036-t2b-zweitfarbe`, gestapelt auf 2a)

### A – Rot zuerst
- [x] **T3645 2.2** Ableitung, Palette/Rollen/Kontrastpaare/Faceto, Regulo mit Fixtures, Projekcioj der Sammlung – `00d56dee`
- [x] **T3646 2.2** Setzen aus Weg A/B/C, Satz bei Nähe, Ablehnung als Aktion, Feld im Schritt (Vitest, Chromium) – `4a6ca1a6`

### B – Grün
- [x] **T3647 2.2** Agordo-Feld `zweitfarbe`, Palette `color.palette.sekundo`, Rollen `color.sekundo.*` in jedem Aspekto, Kontrastpaare, Faceto, Ableitung, Fixture `dukolora` – `930f1732`
- [x] **T3648 2.2** Regulo `sekundo-not-action` – `7005a45d`
- [x] **T3649 2.2** `dukolora` in Sammlung, Projekcioj, Vitrino, CHANGELOG – `42c69b95`; APCA-Zählung – `144286b4`
- [x] **T3650 2.2** Feld „Zweitfarbe“ – `a091bd76`; Weg A und B setzen – `9cdd392c`; zu nah → Satz – `258c9f9f`; Ablehnung – `da8c8169`; Weg C – `7d2da236`; Skript und konfliktarme Stellen – `afe13bc4`; Browsertest – `6ff31655`

### C – Messung und Abschluss
- [x] **T3651** AC-10 1338/1338 zweimal (+80 `dukolora`), Zeilenvergleich der Projekcioj (0 verlorene Zeilen), Metiejo 30/30
- [x] **T3652** PR #138, Messanleitung, CI 41244251101 grün 14/14
- [x] **T3653** D-20 (vollständige Tokens) – bestätigt (Maintainer, 02.11.)

## Teil 3 – Bühne (#136, `261031-spec-036-t3-buehne`)

### A – Rot zuerst
- [x] **T3654 3.1** Bühne zwei Drittel, Seite aus Eroj, hell/dunkel – `de373807`
- [x] **T3655 3.2** Schieber, Umschalter, Übernehmen; Chat zuerst rechts – `ef4a9b78`
- [x] **T3656 3.3** Chat-Leiste und Verlauf – `f0304f62`
- [x] **T3657 3.4** Material/Recherche im Dialog mit Kacheln – `f2404fba`
- [x] **T3658 3.5** Warnrahmen und Satz bei Hover und Fokus – `f2e31346`
- [x] **T3659 3.6** Live-Region und Enter sendet – `32b70c6e`

### B – Grün
- [x] **T3660 3.1** Raster 4/8 aus dem Vortaro, Seite `buehne-<seite>`, Darstellung – `068ea73c`
- [x] **T3661 3.2** überlagerte Rahmen, fm-glitilo/fm-sxaltilo, Übernehmen, Chat-Züge als Vorschlag, Ablehnungssatz aus `freigabeOf` – `3dc5b32b`
- [x] **T3662 3.3** Chat-Leiste – `4e71e79c`
- [x] **T3663 3.4** fm-dialogo, `kaheloj` – `9d7567a5`
- [x] **T3664 3.5** `buehne-pruefung.ts` – `e0efa953`
- [x] **T3665 3.6** `aria-live`, Enter; Tastatur- und axe-Tests in drei Engines – `8c7ab1a9`

### C – Messung und Abschluss
- [x] **T3666 3.7** Weg A mit Modell (`3.7-weg-a`, 0,00128 $) und Material-Lauf; Bildschirmfotos vorher/nachher (im plan, `31d9cb7c`)
- [x] **T3667** axe 0 in drei Engines, AC-10 Metiejo 30/30, PR #136, CI 41230037829 grün 14/14
- [ ] **T3668** Manko E7 (Rest: Chat-Familie als Ero, `aria-valuetext`) – offen, ohne neues Ero nicht lösbar
- [ ] **T3669** B-1 bis B-4 (Chat-Herkunft, Wortlaut, Weg A übernimmt Chat-Vorschläge nicht, Konsolen-Warnungen) – Folgerunde

## Teil 4 – Übernahme aus dem Material (#137, `261031-spec-036-t4-uebernahme`)

### A – Rot zuerst
- [x] **T3670 4.1/4.2** Vorschlag je Schritt mit Herkunft, Offenes benannt (AC-13) – `b32aa43f`
- [x] **T3671 4.1** Neutraltöne – `09cdceef`; Schrift – `2a3aea58`
- [x] **T3672 4.1** Form – `4ca58a98`; Elevation – `51852900`; Dichte – `05bc2492`
- [x] **T3673 4.1** geglättete Ecken echter Bildschirme – `1c40010d`; Grund eines Links – `04f6a266`, `12982db8`

### B – Grün
- [x] **T3674 4.1/4.2** Module `enportilo/uebernahme/`, Speicher, Route, Hinweis „Offen“ – `54841d39`, Nachtrag `de1ad57c`
- [x] **T3675 4.1** Neutraltöne – `5b0b0044`; Schrift – `41d9b21e`
- [x] **T3676 4.1** Form – `10e74d20`; Elevation – `6160a6f3`; Dichte – `72412319`
- [x] **T3677 4.1** echte Bildschirme – `68b491f0`; Grund eines Links – `32c0a682`, `a709068f`
- [x] **T3678 4.3** Material-Lauf `abnahme-weg-b.ts` – `9de43b6d`

### C – Messung und Abschluss
- [x] **T3679 4.3** Tabelle je Schritt synthetisch und echte Marken anonym; `4-material-synth` (0,00068 $), `4-material-marken` (0,00134 $)
- [x] **T3680** AC-10 Metiejo 30/30, PR #137, CI 41239739211 grün 14/14
- [ ] **T3681** Weg C und Weg A an `uebernahmeOf` anschließen – offen (D-155, D-S36-3.3-11)
- [ ] **T3682** Schwächen an echten Bildschirmen (große dunkle Flächen als Knopf, Link-Form, Link-Elevation) – Folgerunde

## Teil 5 – Spec 029 zu Ende

### ②b-2 Achsen und Werte (#139, `261031-spec-036-t5-2b2`)

#### A – Rot zuerst
- [x] **T3683** A-elekto-2, A-markobutono-2, A-sxaltilo-2 (zwei Größen, `large` veraltet) – `2aa678c6`
- [x] **T3684** A-elektilo-1, A-markobutono-1 (`readonly`) – `439802cc`; A-sxaltilo-1 (`label-side`) – `3cf0a622`
- [x] **T3685** A-kompletigilo-1, A-alsxutilo-1, A-tekstareo-1 – `65a232bb`; A-plurelektilo-1 (`summary labels`) – `aec47e46`
- [x] **T3686** A-listelektilo-2, A-plurelektilo-2, A-datelektilo-2 (drei Größen) – `f44f389d`; A-kampo-1 (`unit`) – `ce4c36bc`
- [x] **T3687** Größen (ikono, signeto, avataro, pagxigilo, langetaro, dialogo) – `a17b9dd8`; Darstellung (apartigilo, spuro, karto, avataro, avizo) – `85e8547a`
- [x] **T3688** Dichte, Linien, kompakt, label – `dbe195c4`; Anordnung und Zweck (M-3) – `9bba5b29`
- [x] **T3689** summary – `53848952`; max-entries und aufgeklappt – `fc1a211b`; Wertanzeige, Mindestabstand, Spannen – `bd771762`

#### B – Grün
- [x] **T3690** zwei Größen – `5866b3b2`, Nachtrag `d135e904`; Bildtest neu `8deae786`
- [x] **T3691** `readonly` – `42099ed5`; `label-side` – `e9f680b6`; Zahlen – `27eab550`; `summary labels` – `8d6c1a3a`
- [x] **T3692** drei Größen – `0e94ffd4`; Bildtest neu `e6e8f1a6`; `unit` – `29560bd8`
- [x] **T3693** Größen – `bd22ba23`, Bildtest neu `0fcd9f32`; Darstellung – `80856864`, Bildtest neu `8804905c`; Dichte/Linien – `ae6a3889`, Bildtest neu `6722ce5e`
- [x] **T3694** Anordnung und Zweck – `0ac4d373`; summary – `483f3c78`; max-entries – `9beecbe6`; Wertanzeige/Spannen – `1374b55b`
- [x] **T3695** Arkitekturo-Test der Props von 0.2.0 (AC-14) – `d2bb1ea1`; CHANGELOG – `e8fbf716`, `d709a8c6`; Vitrino-Zählung – `55768dc1`

#### C – Messung und Abschluss
- [x] **T3696** `ac10` ganzzahlig (D-181, D-S36-4.2-1); AC-10 `f2b5a058` ↔ `55768dc1` 1218/1338 (120 gewollt); Kurzprofile < 750; Merge-tree gegen Teil 1 (D-06)
- [x] **T3697** PR #139, CI 41256180779 (Versuch 2 grün nach Abbruch der Infrastruktur)
- [ ] **T3698** A-datelektilo-1 `months` – offen (D-267, D-S36-4.6-16, zu entscheiden; Restarbeit im Beitrag S36-4.5)
- [ ] **T3699** Figma-Messung im Plugin – beim Maintainer

### ②b-3 Anatomie und Slots (#140, `261031-spec-036-t5-2b3`)

#### A – Rot zuerst
- [x] **T3700** Hilfe, Beschreibung der Option – `8f3b9ef8`; Markierungen, Upload-Icon – `e157293b`; Gruppen, Trenner, alle wählen – `e8eae226`
- [x] **T3701** Menü – `b052be43`; Navigation – `dfb54c89`; `max-lines` – `4c9933a1`
- [x] **T3702** Icon am Anfang, insigno am Ende – `57de81a0`; Überschriften, Symbol, Fuß, Schließen – `4f3c3017`; Standard-Symbol, erste/letzte Seite – `fe4d02ec`; Tooltip – `4711accb`; Icon am Host (CI-Befund) – `c37fcbb9`

#### B – Grün
- [x] **T3703** Hilfe – `13cb7aa4`, Bildtest neu `1f86b484`; Markierungen, Upload-Icon – `060dd1ff`, Bildtest neu `23a0fc33`; Gruppen – `d3eda295`
- [x] **T3704** Menü – `1be80caf`; Navigation – `f3788505`; `max-lines` – `91c00be3`; CHANGELOG – `72449609`; Nachträge `a9920537`, `2a79fde7`
- [x] **T3705** Icon am Anfang – `6fb97e82`; Überschriften u. a. – `f7a9bfad`; Symbol, erste/letzte Seite – `b340315e`; Tooltip – `2aa937bf`; CHANGELOG – `fd5904b6`; Nachträge `b4f2daef`, `1bd31f2a`; Icon am Host – `f6c9f061`

#### C – Messung und Abschluss
- [x] **T3706** AC-10 `55768dc1` ↔ `1bd31f2a` 1385/1486 (gewollt), `1bd31f2a` ↔ `f6c9f061` 1214/1214; Kurzprofile < 750
- [x] **T3707** PR #140, CI 41285574442 grün 14/14
- [ ] **T3708** Figma-Messung im Plugin – beim Maintainer

### ②b-4 Verhalten (#141, `261031-spec-036-t5-2b4`)

#### A – Rot zuerst
- [x] **T3709** Rollen nach Status und Zweck – `73b50315`; Streamen – `cd0033d3`; Springen per Tippen, Link im Menü – `2898e343`; Überlauf – `b4ce60a8`
- [x] **T3710** unbekannte Gesamtzahl – `54a4cad5`; Download – `e78757b3`; ausgelassene Mitte – `9744ea14`; Grenze grouped-options – `c200d941`

#### B – Grün
- [x] **T3711** `0206b5a6`, `9d51e1b7`, `242ba1ab`, `499b71b0`, `b3445a8f`, `cf3fe059`, `1b8d3b42`, `acd95072`; CHANGELOG – `47ab8f78`; Nachtrag – `1aa0d4f4`

#### C – Messung und Abschluss
- [x] **T3712** drei Engines 78/78; AC-10 `f6c9f061` ↔ `47ab8f78` 1582/1602 (gewollt); Kurzprofile < 750
- [x] **T3713** PR #141, CI 41298181911 grün 14/14

### ②b-5 kodbloko, Schrift, Form (#142, `261031-spec-036-t5-2b5`)

#### A – Rot zuerst
- [x] **T3714** Ersatzschrift nach Kategorie – `7133d0ae`; signeto/insigno – `9495fee1`; Syntaxfarben – `baf50346`; kodbloko – `980fb666`

#### B – Grün
- [x] **T3715** `cbb90217`, `51b83e49`, `cf838703`, `7bf59913`; CHANGELOG – `f4fff0fb`

#### C – Messung und Abschluss
- [x] **T3716** AC-10 `1aa0d4f4` ↔ `f4fff0fb` 1622/1662 (gewollt); drei Engines `kodbloko-2b5` 18/18; Kurzprofile < 750
- [x] **T3717** PR #142; CI 41310052743 rot an M5 nach einem R-8-Neustart (B-6.1-1)
- [ ] **T3718** Spec 026 O-2 (Look einer deaktivierten Zeile), O-3 (Vitrino-Zeitraum über die Monatsgrenze), glitilo B-5 – offen (D-266, D-S36-4.6-15, zu entscheiden)
- [ ] **T3719** B-6.1-1 (M5 in CI) vor dem Merge – beim Maintainer; B-6.2-1 (403 Kern-Tokens) in #138 erledigt (T3751)

### ③ Doku je Ero (#143, `261031-spec-036-t5-3-doku`)

#### A – Rot zuerst
- [x] **T3720** Uzo-Felder und `check:dokumentaro` – `961e01dc`; `get_ero` – `318c98c4`; Vitrino-Seite – `5b639bd2`; Inhalte: rot = Stand `7273deea` (120 Platzhalter)

#### B – Grün
- [x] **T3721** `e35c8633`, `1b461611`, `7273deea`
- [x] **T3722** Inhalte in fünf Stapeln – `14a78e1a`, `38f98a8c`, `534aae6c`, `e2032eb8`, `43fb4361` (Prüfung grün); Korrektur – `427f7d94`; CHANGELOG – `b07314e9`

#### C – Messung und Abschluss
- [x] **T3723** `check:dokumentaro` 40/40; Kurzprofile unverändert (kampo 747); `ac10` mit verborgenen Doku-Sektionen (D-283, D-S36-4.8-1); AC-10 1674/1674 zweimal
- [x] **T3724** PR #143, CI 41327296891 grün 14/14
- [ ] **T3725** Felder im Schema als Pflicht – beim Maintainer (D-284, D-S36-4.8-2, zu entscheiden)

## Teil 6 – neutrale Namen (#133, `261031-spec-036-t6-neutrale-namen`)

### A – Rot zuerst
- [x] **T3726 6.2** Codemod-Tests – `ab843e9b`; Formatierer – `a02b1a7e`; Agordilo-Fixtures – `36e6ad19`
- [x] **T3727 6.4** Tests von `check:privat` und Registrierung – `864116b1`; `check:privat` findet 749 Dateien auf BASIS – `d6bd5653`
- [x] **T3728 6.3** Leser für alte und neue Namen – `6c964c43`; Schreiber nur neu, Constitution v2.6 – `11f9c367`, Korrektur `ff4f426a`

### B – Grün
- [x] **T3729 6.2** Codemod und Ausnahmeliste – `68404e74`; Formatierer – `5c1c1aaa`; Generator `agordilo fixtures` – `357c8615`
- [x] **T3730 6.4** `check:privat`, CI-Schritt, `pnpm check` – `72c4b675`
- [x] **T3731 6.3** Leser `contracts/names.ts` – `04ba98db`; formunabhängige Tests – `fd27376b`; CHANGELOG – `95b3bd61`
- [x] **T3732 6.6** Tests mit Attrappen-Repo und -Ordner (ohne Rot, D-22) – `7eaa7858`
- [x] **T3733 6.1** Skript-Lauf „Spec 036 Teil 6: neutrale Namen (Skript-Lauf auf `f2b5a058`)“ – `1445ae90` (vor S36-6.2-B2 `30ae1068`); `check:privat` 0 Treffer, zweiter Lauf 0
- [x] **T3734 6.2** B-6.2-2: Generator `agordilo fixtures` findet jede abgeleitete Fixture aus den Daten (auch `dukolora`) – rot `45179c59`, grün `7a9193ca`, Skript-Lauf neu `1445ae90` (D-326, D-S36-6.2-B2-2)

### C – Messung und Abschluss
- [x] **T3735 6.6** Familien vorher/nachher gleich (5 Familien, 374 Token; Cache 0/0); D-22 bestätigt – nichts in die `.env`
- [x] **T3736 6.3** Byte-Vergleich 542 Dateien (532 gleich nach Abbildung, Rest erklärt)
- [x] **T3737** PR #133, CI 41356924882 grün 14/14 auf `1445ae90` (vorher 41213109051 auf `30ae1068`)
- [x] **T3738 6.5** Anleitung Commit-Identität für den Maintainer im Bericht (Schritt 9)
- [ ] **T3739** Teil 6 vor dem Merge auf dem aktuellen `main` neu aufsetzen (D-33) – beim Maintainer, zuletzt

## Abschluss

- [x] **T3740** CI aller elf PRs gesammelt; R-8: #142 M5 einmal neu gestartet, wieder rot (B-6.1-1); #139 Abbruch der Infrastruktur einmal neu gestartet, grün; Kosten 0,00442 $ (S36-6.1)
- [x] **T3741** Merge-Simulation in der vorgeschlagenen Reihenfolge, Teil 6 zuletzt auf dem simulierten Endstand neu gelaufen; Konflikte mit Datei, PRs, Lösung; B-6.2-1, B-6.2-2 (S36-6.2)
- [x] **T3742** plan, tasks und Bericht zusammengeführt, Entscheidungen D-35 ff. (S36-6.3; Nummern mit S36-6.2-B2 und S36-7.1 bis D-347, D-339 (D-S36-7.1-1)) – Doku-Commits `31d9cb7c` und dieser Commit
- [x] **T3743** Doku-Test des Spec-036-Blocks (rot `03c7fe79`, grün mit diesem Commit „Spec 036: Doku-Test und AC-Urteile (grün)“) und Prüfung gegen AC-1 bis AC-15 über alle PRs (S36-7.1)

## QA-Lauf 1 (2026-11-02)

- [x] **T3744 B-QA-1** Teil 4 (#137): Schritt „Zweitfarbe“ liest die Zweitfarbe des Vorschlags – rot `1e0e4bce`, grün `0ed097cb` (D-348, D-349)
- [x] **T3745 B-QA-6** Teil 4 (#137): unlesbares Material in Nutzersprache – rot `2b54e27e`, grün `8c798c40` (D-350)
- [x] **T3746 B-QA-2** 2b (#138): MCP-Ausgabeschemata mit `apply.zweitfarbe` – rot `46ad7cd9`, grün `edbcfa3e` (D-351)
- [x] **T3747 B-QA-3** 2b (#138): Begründung von „Leitfarbe und Akzente“ ohne Spec-Verweis – rot `b662fe6b`, grün `693da0cc`
- [x] **T3748 B-QA-4** 2b (#138): Ablehnung „Zweitfarbe für Knöpfe“ auch ohne Sprachmodell – rot `c3490fe9`, grün `4d5c87ab` (D-352)
- [x] **T3749 B-QA-5** Teil 3 (#136): Prüfsatz auf der Bühne ohne Token-Pfad – rot `cebea8c6`, grün `1414714e` (D-353)
- [x] **T3750** Gepusht (vorwärts), PR-Texte mit Abschnitt „QA-Lauf 1 (2026-11-02)“, CI #136 grün 14/14: 41377076293, #137 grün 14/14: 41377075771, #138 grün 14/14: 41377072490; merge-tree ohne neue Konflikte; simulierter Endstand `8f18540f` mit den Fixes, Server auf 7301 neu (D-355)

## Nachbesserung 02.11. (Maintainer; nachgetragen 2026-11-03)

D-20, D-62, D-108 bestätigt (AC-4 erfüllt). Keine neue Merge-Simulation, nur CI je PR.

- [x] **T3751 B-6.2-1** 2b (#138): Palette `color.palette.sekundo` 12 statt 15 Stufen, 17 Kern-Tokens, Teil 1 + 2b + ②b-5 = 400 – rot `58654b99`, grün `ede4f801`; CI 41689035771 grün 14/14 (D-356 bis D-362)
- [x] **T3752 A-1** Teil 1 (#134): „eckiger“ über `waehle_form` nach der Pille aus `danach.zurueck` – rot `5ddfae84`, grün `2f447449` (D-363 bis D-365)
- [x] **T3753 A-2** Teil 1 (#134): Artikel vor ersetzten Begriffen aus `nutzersprache.json` – rot `074db03e`, grün `4f43d45e`; CI 41681523083 grün 14/14 (D-366 bis D-371)
- [x] **T3754 A-3** Teil 4 (#137): Kurzschreibweise `font` liefert den Familienteil (`fontShorthandOf`) – rot `529a92e7`, grün `242899d4`; CI 41682342445 grün 14/14 (D-372 bis D-375)
- [x] **T3755** plan, tasks und Bericht nachgetragen (Abschnitt „Nachbesserung 02.11.“, AC-4 erfüllt, Zählungen des Rezepts −3, D-376, D-377) – Doku-Commit „Spec 036: Nachbesserung 02.11. im Bericht nachgetragen“
- [ ] **T3756 B-R1-1** Agordo als „die Einstellung“ (Singular) oder Grenze annehmen – beim Maintainer, zu entscheiden (D-369)
