# Spec 029 ① – Aufgaben

**Spec:** [`spec.md`](spec.md) · **Plan:** [`plan.md`](plan.md) · **Branch:** `261023-spec-029-fonto-astryx-grundlagen` (von `main` `d29a5206`, nach dem Merge von Spec 027, #109). Aufgaben ab T2901. ②a läuft in Sitzung B; ②b und ③ stapeln auf diesen Branch.

### A – Fonto lesen, messen, rot zuerst
- [x] **T2901 Fonto gepinnt:** `@astryxdesign/core` und `@astryxdesign/theme-neutral` 0.7.4 von npm (Integrität), Tag `v0.7.4` = Commit `704757fd827c6fa00a71af80b06d5da99d155e45`; vier Quelldateien des Themes im Tarball byte-gleich mit dem Commit, LICENSE gleich. Nur Daten gelesen, kein Code der Fonto ausgeführt.
- [x] **T2902 Basis von `main`:** je Kombination ein Hash über alle 1 608 aufgelösten Werte von komuna (`komuna-main.json`), abgeglichen mit `fm modelo export` von `main` (0 Abweichungen); dieselben Hashes für ekzemplo, provo (ohne Schrift) und provo-kompakta (`marken-main.json`, im roten Worktree auf den Daten von `main` erzeugt).
- [x] **T2903 Rote Tests** in 13 Dateien:
  - `projekcioj`: `fonto/komuna-0-2`, `fonto/komuna-fonto`, `celoj/vitrino/bazoj`, `celoj/figma/plugin-name`, `celoj/figma/figma-cxiuj`
  - `modelo`: `checks/fontoj`, `e2e/checks` (Fixtures `fontoj-registro`, `fontoj-deveno`, `clean-room-fonto`), `index`, `contracts`, `ci/workflow`, `docs` (README, Spec 029)
  - `agordilo`: `struktur-029`; `metiejo`: `komuna-0-2`

  Rot in `2b44898f`: 44 Tests in 13 Dateien (gemessen in einem eigenen Worktree auf genau diesem Commit). Schon grün waren: die Basis der anderen Marken (bestätigt sie auf `main`), zwei Strukturtests des Agordilo (die Struktur von `main` ist komuna 0.2) und zwei Studio-Tests, deren Werte auf `main` zufällig stimmen.

### B – Grün
- [x] **T2904 Constitution v2.4** wörtlich nach der Spec; Ontologio mit dem Begriff Fonto (22 Begriffe der Tabelle).
- [x] **T2905 Register und Prüfung:** `packages/modelo/data/fontoj.json` (Schema `FontojFile`), `THIRD_PARTY_NOTICES.md`, `deveno.json` (Schema `DevenoFile`, geladen als `modelo.deveno`), `check:fontoj` mit sechs Regeln (in `pnpm check`, CI, README), `check:clean-room` mit Fonto-Ausnahme.
- [x] **T2906 komuna-0-2:** Paket mit vollständigem Set, Dunkel-Set, Schriften, Ikonaro, Aspiroj; Namespace `malnova`; im Build mit allen Marken.
- [x] **T2907 Werte von komuna:** `scripts/fonto-astryx/schreiben.mjs` (Paletten, Rollen hell/dunkel, Typografie mit Touch und schmal, Größen, Radien, Elevation, Fokus, Bewegung, Deckkraft), Konjunktions-Sets für Dunkel, Breite, Dichte und hohen Kontrast, `deveno.json` mit 405 Werten.
- [x] **T2908 Regeln gewinnen:** Messung mit `fm modelo validate`, `check:alirebleco`, `check:parity` und den Tests der Daten; 45 angepasste Werte (31 Tokens in `anpassoj.json`, die Rundung J8 im Generator), 8 Jugxoj von komuna (`jugxoj.json`); die Jugxo-Liste steht im plan.
- [x] **T2909 provo mit Prata:** `agordo.json` (Schrift und Fallback `ui-serif, serif`), neu abgeleitet; nur die Schrift ändert sich.
- [x] **T2910 Agordilo, Werkstatt, Studio:** `struktur02Files`, `readStructure()` auf komuna 0.2 (Fingerabdruck `554efc71…` wie gespeichert); die Werkstatt der Vitrino derselbe; Studio mit Basis „komuna-0-2“.
- [x] **T2911 Foundation-Seiten** (`celoj/vitrino/bazoj.ts`): acht Abschnitte, Daten je Marke, Suche, Texte deutsch und englisch.
- [x] **T2912 Figma:** Plugin „Fundamento Grundlagen“, ID `fundamento-grundlagen-‹Hash›`; INNER_SHADOW für eine Schicht `inset`.
- [x] **T2913 MCP:** `get_token` nennt die Herkunft eines Werts (`deveno`).
- [x] **T2914 Bestehende Tests nachgezogen**, wo sie Werte der alten komuna festnagelten:
  - Werte und Herkunft: `color.text.default` (neutral.1000), Radien (10/12), Elementgrößen (28/32/36), Typografie (14 px, Gewichte), Schatten (drei Schichten, kaskadiert über `color-scheme`), Sets und Theme-Fragment von komuna, Abdeckung des Dunkelmodus (94/94), Herkunft der Typografie bei schmaler Breite;
  - Plugin-Tests: Geist Bold und die Kreuzung Archivo Bold in den Schriften der vorbereiteten Datei; Plugin-ID und -Name (`plugin-name`, `figma-cxiuj`, `lingvo`, Metiejo `eksporto`, `plugin-bauformen-eigenschaften`);
  - der Bildvergleich von Spec 027 zeichnet mit den Werten von komuna 0.2 (`komuna02PluginCode`) und bleibt unverändert grün;
  - die Kontrastprüfung der Phase 0 und `check_contrast` kennen den Ausweichzweig (aux) wie `check:alirebleco`;
  - die unvollständige Fixture nennt die Folge `state-distinct` (B-4); ekzemplo ist enger als komuna 0.2;
  - Regularo zählt die Jugxoj der Pakete, der Regelkatalog die sechs Regeln von `check:fontoj`, der Workspace das neue Paket.
  - `check:vitrino`: die beratenden APCA-Hinweise der 72 Kombinationen von komuna (2394 → 2646, B-5), der Zeuge für die breite Viewport-Stufe (`--fm-layout-grid-columns`);
  - `internacia.spec.ts`: headline.4 ist in komuna 14 px; die vierfache Überschrift passt in eine Zeile des Dialogs, das Umbrechen belegt die achtfache.
- [x] **T2918 Befunde aus den Prüfungen, behoben:** Info-Rand hell auf Stufe 40 (`wcag2-reserve`, J6); die Werkstatt bringt das Stylesheet ihrer Struktur mit (B-6, Unit-Test in `vitrino.test.ts`); der Rollbereich der Token-Tabelle ist mit der Tastatur erreichbar (B-7, axe).
- [x] **T2915 Befunde als Regeln:** zwei frühere Befunde, die nur als Test bestanden, gewinnen gegen die Fonto (die gewählte dritte Aktion bleibt deckend; kein reines Weiß als Text im Dunkeln, R4), ebenso die Parität (eine Deckkraft je Paint) und Nachlese 8 ② 1 (`neutral.950` bleibt im Dunkel-Set von komuna).

### C – Abschluss
- [x] **T2916 Doku:** plan (Amendment, Fonto, komuna-0-2, Zuordnung, Jugxo-Liste, D-01–D-08, Abweichungen, Befunde, Offen, Compliance, Messungen, Messanleitung), tasks, Vojmapo, README.
- [x] **T2917 Messungen:** im plan; Bericht im PR.

### Messungen

| Was | Wert |
|---|---|
| Commits | rot `2b44898`, grün im Folgecommit (Hash im PR) |
| Rot gemessen | 44 Tests in 13 Dateien |
| Grün gemessen | siehe plan, Messungen |
