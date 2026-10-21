# Spec 023 – Werkstatt-Konfigurator (Metiejo) – Aufgaben

**Spec:** [`spec.md`](spec.md) · **Plan:** [`plan.md`](plan.md). Die Hashes aller Commits stehen je PR in **einer** Zeile der Messungen. Aufgaben ① zählen ab T2301, ② ab T2331.

## ① Runde 1

**Branch:** `261021-spec-023-runde-1-145b74` (von `main` `59ab620`, nach #94; parallel zu Nachlese 8 ①–③, PR nach dem Rebase auf `main` mit ①).

### A – Rot zuerst
- [x] **T2301 Tests** Metiejo: `env.test.ts` (die sechs Namen, `parseEnv`, `settingsOf` ohne Schlüsselwert, `.env` ignoriert, `.env.example` im Repo gleich `envExampleText()`), `sxtupoj.test.ts` (M-2: je Bildschirm eine Frage, höchstens ein Hauptknopf, Zurück und Weiter, kein Begriff des Vortaro, sxelo/pagxo/formularo, keine nativen Bedienelemente außer Farbwähler und Regler), `marko.test.ts` (Anlegen leer/komuna, ungültiger Name, Entwurf, Speichern mit `historio`, nichts bewegt, nur im Arbeitsordner, Upload nach `fontoj/` mit `.gitignore`), `tiparoj.test.ts` (Katalog mit Herkunft, nur SPDX-Lizenzen, Suche, `fontoOf`, `licencedFonto`, `@font-face` nur https), `privata.test.ts` (gesperrt ohne Variable, Cache außerhalb und ohne Repo-Namen, Push nur privat, öffentlich/unbekannt ohne Push, bare-Repo und Fake), `kontrolo.test.ts` (M-4: Fenster, roh und base64, Fundstelle, CLI Exit 0/1/2), `eksporto.test.ts` (M-3 bytegleich, abgelehnte Agordo, Byte-Check entfernt das Ergebnis, Figma mit eigener ID nach F-13), `servilo.test.ts` (Loopback, Bildschirme, Entwurf, Vorschau-CSS, Prüfung, Speichern, Expertenansicht, Schriftsuche, M-7), `docs.test.ts` (Spec unverändert, plan ①, Bildschirmfotos, Messanleitung, tasks); CLI `metiejo.test.ts` (`fm metiejo --help`, Fehler). Rot in `9357257` (Paket ohne Quellen: Build und Import schlagen fehl; 91 Tests in 9 Dateien plus 3 der CLI).

### B – Grün
- [x] **T2302 Einstellungen** `env.ts`: `ENV_NAMES`, `parseEnv`, `settingsOf`, `readSettings`, `envExampleText`; `.env.example`, `.gitignore` `!.env.example` (Abweichung 1, D-14).
- [x] **T2303 Schriften** `tiparoj.ts`: Katalog, `tiparoFrom`, `searchTiparoj`, `fontoOf`, `licencedFonto`, `fontFaceCss`; `node/tiparoj-import-cli.ts` (`tiparoj:import`), `data/tiparoj.json` (2100 Familien, Herkunft 2026-10-21).
- [x] **T2304 Marke** `marko.ts`: `createMarko`, `readMarko`, `writeDraft`, `saveMarko` mit `historio`, `listMarkoj`, `storeUpload` (D-09, D-10).
- [x] **T2305 Privates Repo** `privata.ts`: `privataState`, `cacheRootOf`, `cacheDirOf`, `syncCache`, `uploadFont` mit Sichtbarkeit zuerst, `listCachedFonts`, `defaultDeps` (gh, git) (D-07).
- [x] **T2306 Byte-Check** `kontrolo.ts` und `node/kontrolo-cli.ts`: `fingerprintsOf`, `findInBuffer`, `knownFonts`, `scanDirs`; `pnpm check:tiparoj` als Wurzelskript, in der `check`-Kette, als CI-Schritt „Check: Tiparoj“ im Job `checks`, Pins in `workflow.test.ts` (D-08, Abweichung 5).
- [x] **T2307 Vorschau und Klartext** `vorschau.ts` (`loadBases`, `startAgordo`, `komunaCss`, `previewCss`, `checkDraft`), `vorschau-korpo.ts` (die Körper je Schritt, die fünf Sxablonoj in drei Breiten), `klartext.ts` (D-02–D-04).
- [x] **T2308 Bildschirme** `sxtupoj.ts` (`SXTUPOJ`, `screen`, `screenInventory`, `klartextHtml`, `exampleScreenInput`), `html.ts` (Dokumente, Layout aus Tokens, Client-Skript) (D-01, D-05, D-06, D-12).
- [x] **T2309 Export und Server** `eksporto.ts` (`exportMarko`: Paket, CSS, Figma, Byte-Check), `servilo.ts` (Routen, Loopback, Entwurf, Vorschau, Prüfung, Speichern, Upload, Expertenansicht, M-7), `start.ts` (`fm metiejo`), CLI `commands/metiejo.ts` (D-11).
- [x] **T2310 Bildschirmfotos** aller neun Schritte und der Varianten (Problem, lizenzierte Schrift, dunkel, voll, gespeichert) in `bildoj/`, aufgenommen in Chromium am laufenden Server (plan ①).

### C – Abschluss
- [x] **T2311 Doku** plan ① (D-01–D-14, Abweichungen 1–11, B-1–B-7, O-1–O-7, Messanleitung), tasks ①, README (Paket, `check:tiparoj`, „Der Konfigurator (Metiejo)“), Vojmapo (8a'').
- [x] **T2312 Rebase** auf `main` `3759b67` mit Nachlese 8 ①–③ (F-13: der Figma-Test ist grün; `metiejo` auf 0.2.0), ohne Konflikt.
- [x] **T2313 Entscheidungen O-1 bis O-7** (22.10.): rote Tests für `FM_MARKEN_DIR`, den Checkout-Schutz und die Schriftdateien aus npm; dann `env.ts` (`markenDirOf`), `marko.ts` (`assertOutsideCheckout`), `tiparoj-npm.ts` (Registry, Tarball, Cache, `herkunto.json`, `@font-face`), `eksporto.ts` (`npm`, `tiparoj.css`), `start.ts`, `kontrolo-cli.ts`, `.gitignore` `marken/`, `.env.example`; plan ① (D-09 neu, D-15, Nachtrag 22.10., Messanleitung mit `FM_MARKEN_DIR`), README.
- [ ] **T2314 PR**, CI grün, Bericht.

### Messungen

| Was | Wert |
|---|---|
| Commits ① | rot `9357257` (nach dem Rebase `5837d4a`), grün `33d9b2c`/`abf4c5c`, Pin `37b2177`, Doku `8fb47e7`; Nachtrag 22.10.: rot `a121f13`, grün (Hash des grünen Stands, CI grün); dieser Eintrag im Folgecommit |
| CI ① | (Lauf, Hash, Jobs und Zeiten) |
| Tests lokal | Metiejo 104 in 10 Dateien grün (nach dem Rebase, mit F-13 und dem Nachtrag 22.10.), Agordilo 11 Dateien, MCP 40 Dateien, CLI 7 Dateien (3 Tests neu), Modelo 161 Dateien grün (Workspace-Pin um `metiejo` ergänzt); `pnpm lint`, `pnpm check:tiparoj` (4 075 Dateien, keine Schrift bekannt) grün |
| Zeiten | `derivationBasis` 114 ms, `deriveAspekto` mit Prüfung 1 620 ms, Vorschau-Stylesheet ≈ 200 ms, Export (Paket, CSS, Figma) ≈ 4 s |
| Katalog | 2 100 von 2 103 Familien, 6 Lizenzen (OFL-1.1 2 059, Apache-2.0 36, UFL-1.0 5, CC0-1.0 1, MIT 1, Unlicense 1), 20 Subsets ohne Zuordnung (B-4) |
| M-4 | `check:tiparoj`: Export mit 33 Dateien und einer bekannten Schrift PASS; ein hineinkopiertes Muster FAIL mit Datei und Schrift, Exit 1 |

## ② Runde 2

Nach dem Merge von ①: Schritt 2 mit Token-Import (ohne KI) und KI-Adapter (Mistral, OpenAI, OpenRouter, Fake), „Beschreib deine Marke in einem Satz“, „Warum?“, Ansicht „Fluss“ mit React Flow. Aufgaben ab T2331.
