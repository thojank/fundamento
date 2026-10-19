# Spec 016 – Agordilo Stufe 1 (Werkstatt) – Plan

**Spec:** [`spec.md`](spec.md) (Fassung vom 2026-10-17, unverändert kopiert) · **Briefing:** `briefing-p0-2026-10-18.md` (Maintainer-Ordner, nicht kopiert) · **Basis:** `main` (`7a05c6e`), eigener Branch, nicht gestapelt (der Agordilo berührt keine Eroj) · **Regel 0** (12.10.) gilt: der Weg, den das Repo schon geht (Art. XI), sonst die kleinste Änderung mit Eintrag hier; Tokens, Regulo-Semantik und Constitution nie ändern; nie eine Grenze aufweichen, um grün zu werden.

Drei PRs, gestapelt: ① Bibliothek von `main`, ② Werkstatt in der Vitrino von ①, ③ Gvidanto und Doku von ②.

## ① Bibliothek

**Branch:** `261018-spec-016-agordilo-f027c6` (nach dem Merge von #76 auf `main` rebased, nach #78 und #79 erneut auf `ef3c8db`; CI auf den fünf Jobs) · **Datum:** 2026-10-18/19 · **Stand:** abgenommen am 2026-10-19 (Messung D1–D4); der Maintainer merged nach grüner CI.

### Zusammenfassung

1. **Neues Paket `packages/agordilo` (`@fundamento/agordilo`)** – die Bibliothek, die Werkstatt (②), CLI und Gvidanto (③) gemeinsam nutzen (W-23): Agordo lesen (G4), Paletten in OKLCH ableiten (G3), das vollständige Paket schreiben (G1, G2), mit den vorhandenen Checks prüfen (G5), Verstöße mit Ursache und einem Vorschlag erklären (G6), Raporto schreiben. Einzige Abhängigkeit: `@fundamento/modelo` (D-01).
2. **Agordo** als `$defs/Agordo` im einen Modelo-Schema (D-02): `name`, `leitfarbe` (Hex oder `oklch()`), `zusatzfarben.success|warning|danger|info`, `neutral.toenung` 0–1, `regler.helligkeit|kontrast` −1…1, `regler.saettigung` 0–2, `schriften.display|body|code` (Fonto wie `aspekto.json#/fonts`), dazu `owner`, `license`, `aspiroj`, `jugxoj` (Abweichung 4). Eine Agordo ohne `leitfarbe` ergibt `schema-violation` an `agordo.json#/leitfarbe` mit Vorschlag.
3. **Kalibrierung** (D-04): `packages/agordilo/data/calibration.json`, an komuna **gemessen** – je Stufe der sechs Paletten der WCAG-Kontrast gegen `neutral.0` im hellen und gegen `neutral.1000` im dunklen Modus und die relative Buntheit zur Bezugsstufe; ein Test vergleicht Datei und Messung bytegenau (`pnpm --filter @fundamento/agordilo calibrate` schreibt sie neu).
4. **Ableitung** (D-05–D-07): je Stufe die Helligkeit L, die das Ziel trifft, bei H und C der Quelle; Gamut-Mapping durch Verringern von C; **der Ton zuerst** (mindestens 40 % der verlangten Buntheit, sonst verschiebt sich L und das Ziel wird verfehlt – gemeldet, nicht verschwiegen); Standardtöne der Statusfarben zur Leitfarbe gedreht (Regel in D-06); Regler mit Böden aus `kontrastSojloj`.
5. **Paket** (D-11): `aspekto.json` mit Herkunft (`agordilo`: Agordo, Version, Struktur mit SHA-256), `aspekto/<name>` mit **jedem** Token des Vortaro (die sechs Paletten neu, alles andere wie die Struktur), die Konjunktions-Sets von komuna mit unveränderten Rollen, `ids.lock.json` (deterministische IDs, D-03), `$themes.json`, die Glyphen von komuna, `jugxoj.json` (wenn die Agordo Jugxoj nennt), `raporto.json`, `raporto.md`.
6. **Prüfungen** (D-08, D-09): Modelo-Validierung und Alirebleco-Auswertung auf dem im Speicher komponierten Modelo – KontrastParoj in allen 72 Kombinationen, `kontrastSojloj`, `contrast-reserve`, `text-hierarchy`, `state-distinct`, `surface-order` und jede andere automatische Regulo, Aspiroj nur, wenn die Agordo welche nennt, APCA als Hinweis. Fest/anpassbar nach D-08; Export verweigert bei fester Regel oder anpassbarer ohne Jugxo (G6).
7. **CLI** (D-13): `fm agordilo derive <agordo.json> --out <ordner>` und `fm agordilo check <ordner>`, mit `--help`, `--json`, Exit-Codes 0/1/2.
8. **Beispiel `provo`** (D-14): `packages/modelo/test/fixtures/valid/aspekto-provo/` (Agordo, Konfiguration, abgeleitetes Paket). `fm modelo validate --aspekto` grün, `check:alirebleco` und `check:ikonaro` messen provo als dritte bekannte Aspekto (W2, Warnung), 0 fehlgeschlagene Paar-Auswertungen.
9. **Modelo, kleinste Änderungen:** Schema (`Agordo`, `AgordoColor`, `AgordoJugxo`, `AspektoAgordilo`, `AspektoFile.agordilo`), Typen neu generiert; `color.ts` um `oklchComponentsOf`, `oklchColor`, `inSrgbGamut`, `deltaEOklab`; `documentSchemaIssues`; `RULE_IDS` 160 → 162 (`agordo-jugxo-fixed`, `raporto-out-of-sync`); `KNOWN_ASPEKTO_FIXTURES` += `provo`; Kommentar des festen ULID-Quells.

### Entwurfsentscheidungen

#### D-01 Paket, Grenzen, keine neue Abhängigkeit
`@fundamento/agordilo` hängt nur an `@fundamento/modelo`. Die Farbumrechnung (OKLCH ↔ sRGB, WCAG, APCA, ΔE) ist die der Checks (`checks/alirebleco/color.ts`, `metrics.ts`, colorjs.io seit Spec 002 Abhängigkeit des Modelo): eine Farbmathematik im Repo (Art. XI), um vier kleine Funktionen erweitert. Die **Ableitung** – Zielsuche, Gamut-Mapping über C, Tonregel, Regler, Kalibrierung – ist eigene Logik (Art. V); Leonardo war nur Benchmark für das Prinzip, kein Code, keine Werte. Reine Module unter `src/`, die I/O-Kante (Struktur lesen, Kalibrierungsdatei, Paket schreiben, SHA-256) unter `src/node/`.

#### D-02 Die Agordo im einen Schema
`$defs/Agordo` im Modelo-Schema (das eine handgeschriebene Schema, TS-Typen generiert), weil `aspekto.json#/agordilo/agordo` sie als Herkunft trägt (G1) und so dieselbe Prüfung gilt. `readAgordo` prüft mit Ajv über `documentSchemaIssues` (neu exportiert: ein Dokument gegen eine Def; ein fehlendes Mitglied steht an seinem eigenen Pfad, der Vorschlag nennt es) und liest dann die Farben (`parseAgordoColor`: `#rgb`, `#rrggbb`, `oklch(L C H)` mit L als Zahl oder Prozent).

#### D-03 IDs ohne Zufall
`derive` vergibt die IDs mit dem ULID-Generator des Modelo (`createIdGenerator`) über `fixedUlidSource(AGORDILO_EPOCH, fnv1a(name))` im Namensraum aus den Buchstaben des Namens (2–8, `provo` → `provo`). Reihenfolge: DimensioValoro, Sets (Haupt-Set, Konjunktions-Sets), Jugxoj. Die IDs hängen nur am Namen: Wer die Farben einer Marke ändert, behält ihre IDs. Zwei Läufe sind bytegleich (Test in der Bibliothek und über die CLI).

#### D-04 Kalibrierung an komuna
Je Palette eine Bezugsstufe: `accent.700` (die Leitfarbe, M1), `success|warning|danger|info.600` (`color.status.*.basic` hell), bei `neutral` die bunteste Stufe. Je Stufe: `light` (Kontrast gegen `neutral.0`, hell aufgelöst), `dark` (gegen `neutral.1000`, dunkel aufgelöst – so trägt `neutral.950` den Wert des Konjunktions-Sets von komuna), `chroma` (relativ zur Bezugsstufe). Je Palette: Ton und Buntheit der Bezugsstufe (der Standardton einer Statuspalette). Vier Nachkommastellen, kanonisches JSON. **Quellen der Buntheit:** `accent` = C der Leitfarbe, `neutral` = `toenung` × C der Leitfarbe × 0,25 (komuna entspricht ≈ 0,35), Status = C von komuna; eine Zusatzfarbe gibt nur den Ton (G4: „eigener Farbton“). Jede Stufe: C = Quelle × Profil × `saettigung`.

#### D-05 Eine Stufe in OKLCH, der Ton zuerst
`solveStep`: Bisektion über L ∈ [0,1], bei jedem L das größte C ≤ verlangtem C im sRGB-Gamut (Bisektion über C), Kontrast mit `WCAG2_METRIC` der Checks gegen Weiß bzw. Schwarz. Bleiben am Ziel mindestens **40 %** der verlangten Buntheit (`TONE_KEEP`), steht die Stufe auf ihrem Ziel. Sonst verschiebt sie L von ihrem Ziel zur Spitze des Gamuts ihres Tons, bis 40 % passen, und verfehlt das Ziel – sichtbar im Raporto (G6: kein Raten). Gemessen: mit 50 % verletzen helles Gelb und Cyan feste Regeln (`state-distinct`, `contrast-reserve`, Gelb auch `contrast-below-threshold` in `contrast=high`), mit 40 % bleibt bei Gelb eine anpassbare (`palette-aligned` an `accent.900`), Cyan ist sauber (O-4). Geschrieben wird gamma-sRGB mit vier Nachkommastellen; der erreichte Kontrast wird danach gemessen.

#### D-06 Standardtöne der Statusfarben (die Regel aus G4)
Ohne `zusatzfarben.<status>` nimmt eine Statuspalette den gemessenen Ton von komuna (Stufe 600: success 150°, warning 69°, danger 27°, info 240°) und dreht ihn um **ein Fünftel** des Winkels, um den die Leitfarbe vom Akzentton von komuna (255°) abweicht, auf dem kürzeren Weg, **höchstens 10°**. Eine Leitfarbe unter C 0,02 hat keinen Ton und dreht nichts. Bei komunas eigener Leitfarbe ist die Drehung 0 (M1); der Status bleibt als Status erkennbar.

#### D-07 Regler
Auf der logarithmischen Kontrastskala u = ln t / ln 21 (t gegen Weiß; ein dunkles Ziel wird gespiegelt, t·t′ = 21): `kontrast` k als S-Kurve um die Mitte mit Exponent 1 + 0,5·k, `helligkeit` h als Potenz 1 + 0,5·h (heller = weniger Kontrast gegen Weiß); beide halten die Enden (1:1, 21:1) und wirken im Verhältnis zum Abstand von den Enden, sodass die Stufen nahe Weiß nicht zusammenfallen (eine erste Fassung mit linearer Verschiebung ließ `neutral.25/50/100` kollabieren: `surface-order`, `surface-distinct`). **Böden:** Hat eine Stufe eine Schwelle aus `kontrastSojloj` (3, 4,5, 7 über alle Valoroj) gegen Weiß oder Schwarz erreicht, bleibt sie mit der Reserve der Regulo `contrast-reserve` (5 %) darüber. `saettigung` ist der Faktor auf C aller Paletten.

#### D-08 Feste und anpassbare Regeln (Vorschlag, O-3)
Fest – Export verweigert, auch mit Jugxo: alles, was eine Person schützt oder die Messung selbst (README „What an Aspekto decides“): die WCAG-Schwellen der KontrastParoj (`contrast-below-threshold`, `kontrastSojloj`), `contrast-reserve`, `state-distinct`, der Fokusring, `touch-target-min`, `srgb-gamut`, Schema und Vollständigkeit. **Anpassbar** – Export mit Jugxo: die Struktur, die eine Marke anders abstufen darf (Art. VI „Wenige Invarianten sind fest“): `text-hierarchy`, `surface-order`, `surface-distinct`, `palette-even`, `palette-aligned`. Die Liste steht als `ADJUSTABLE_RULES` in der Bibliothek, die Reguloj selbst bleiben unverändert (Regel 0.3).

#### D-09 Ursache und ein Vorschlag (G6)
Je Verstoß: die Tokens des Befunds (Subjekt, Paar, im Text genannte Tokens) über ihre Alias-Kette zu den abgeleiteten Stufen. **Ursache:** (a) eine Stufe hält ihren Ton nur neben ihrem Ziel (L, erreichter Kontrast, Ziel); (b) der Ton ist bei diesem Farbton nirgends zu halten; (c) die Regler haben das Ziel verschoben; (d) bei `palette-aligned`/`palette-even` mit Stufen auf Ziel: die Rampe, die heraussteht, ihr L gegen die anderen – bei diesem Ton und dieser Buntheit verlangt dasselbe Kontrastziel eine andere Helligkeit; (e) sonst: die feste Rollenzuordnung. **Ein Vorschlag:** eine dunklere Leitfarbe mit Wert (die größte Buntheit, bei der alle Akzentstufen Ton und Ziel halten, gezeigt als `accent.700` bei dieser Buntheit), ein Reglerwert (`neutral.toenung`, `regler.saettigung`, `regler.helligkeit|kontrast` auf 0), „Target not reachable at this hue“ oder die Grenze `role-remap`. Test: Wer den Vorschlag für helles Gelb übernimmt (`#665000`), hat keinen Verstoß mehr.

#### D-10 Jugxoj
Die Agordo nennt sie: `jugxoj: [{ regulo, kialo, date, name }]`. Der Agordilo schreibt jeden zu einer bekannten, anpassbaren Regulo als Jugxo ins Paket (`jugxoj.json`: `deviation-recorded`, `ref.regulo` = ID der Regulo, `aspekto`, `kialo`, `date`; der Name steht im `context`, das Jugxo-Schema kennt kein Namensfeld – Abweichung 9). Ein Jugxo deckt jeden Verstoß seiner Regulo. Eine feste Regulo ergibt `agordo-jugxo-fixed`, eine unbekannte `regulo-unknown`; beide verweigern den Export.

#### D-11 Das Paket
Haupt-Set aus dem Kern-Set: Tokens nur mit `$type`/`$value` (ein Override trägt keine IDs und keine Beschreibungen), Gruppen-Typen bleiben, die sechs Paletten neu (`srgb` mit `hex`), `font.family.<rolle>` mit der Familie aus `schriften` vor dem Fallback des Kerns. Die Konjunktions-Sets von komuna (`+color-scheme/dark`) mit unveränderten Rollen, ihre Paletten-Literale (`neutral.950` dunkel) mit dem dunklen Ziel neu. `aspekto.json`: `owner`/`license` aus der Agordo (sonst „<name> (derived by the Agordilo)“ und `proprietary`), `idNamespace`, `fonts` (die Schriften der Agordo, für die übrigen Rollen die von komuna), `ikonoj` und die Glyphen samt `LICENSE` von komuna, `aspiroj` nur aus der Agordo, `agordilo` (Version, Struktur: Vortaro-Version, Bezugs-Aspekto, SHA-256 über Kern-Sets und komuna-Paket in kanonischem JSON, Agordo). `$themes.json` ist das Fragment, das das komponierte Modelo ableitet (`deriveThemeFragment`).

#### D-12 Raporto
`raporto.json`: `summary` (Export erlaubt, Paar-Auswertungen bestanden/verletzt, Verstöße fest/anpassbar/gedeckt, Hinweise), `checks` (je Regel: fest/anpassbar, bestanden, Zahl), `violations` (Regel, Regulo, fest, Subjekt, Pfad, Kombination, Befund, Ursache, Vorschlag, Jugxo), `jugxoj`, `palettes` (je Stufe Wert, Ziel, erreicht, auf Ziel, Ton gehalten, Buntheit verlangt → gehalten), `kontrastParoj` (je Paar und Ergebnis einmal, mit Zahl der Kombinationen, Wert, Schwelle, APCA), `hints` (APCA, verfehlte Aspiroj, Stufen neben dem Ziel). Ortsfrei (Paketpfade relativ), nur aus Agordo und Paket berechnet: `fm agordilo check` baut ihn bytegleich nach. `raporto.md` ist dieselbe Information lesbar (je Paar der schlechteste Wert).

#### D-13 CLI
`fm agordilo derive <agordo.json> --out <ordner> [--json]`: Exit 0 geschrieben, 1 Agordo ungültig oder Export verweigert (nichts geschrieben; jeder Verstoß mit Ursache und Vorschlag), 2 Aufruffehler (auch: `--out` ist weder leer noch ein früher abgeleitetes Paket). Ein erlaubter Export ersetzt den Ordner ganz (keine Reste früherer Jugxoj). `fm agordilo check <ordner> [--json]`: Exit 0, wenn die Prüfungen bestehen und der mitgelieferte Bericht gleich ist, sonst 1 (`raporto-out-of-sync`). Muster der bestehenden Befehle (`args.ts`, `command.ts`, `formatIssue`).

#### D-14 `provo` als bekannte Aspekto
Die Beispiel-Agordo `provo` (erfundene Werte: Violett `#6b4fa0`, Info-Ton `oklch(0.55 0.12 225)`, Tönung 0,4, Regler 0,1/0,1/1,1, Archivo als Display-Schrift) liegt mit Konfiguration und abgeleitetem Paket unter `packages/modelo/test/fixtures/valid/aspekto-provo/` und steht in `KNOWN_ASPEKTO_FIXTURES` neben ekzemplo: der Weg von Nachlese 3 W2 (Regel 0.1). `check:alirebleco` misst sie als externe Aspekto (Fehler wären Warnungen `contrast-external-aspekto`), `check:ikonaro` prüft ihre Glyphen. Ein Test der Bibliothek verlangt, dass die Fixture bytegleich der Ableitung ist; regenerieren mit `pnpm fm agordilo derive packages/modelo/test/fixtures/valid/aspekto-provo/agordo.json --out packages/modelo/test/fixtures/valid/aspekto-provo/aspekto-provo`.

### Arkitekturo-Abdeckung

| Artikel / Festlegung | Wie ① ihn trägt |
|---|---|
| Art. I (Modelo-first), G1 | Die Ableitung ist ein Schreibvorgang; das Paket ist Modelo-Daten, die Herkunft steht in `aspekto.json#/agordilo` |
| Art. IV, G1 | `aspekto/<name>` belegt jeden Token des Kerns (Test über alle Kern-Tokens); nichts erbt zur Laufzeit |
| Art. V, G3, E3 | Eigene Ableitung; Leonardo nur Benchmark; die Farbmathematik der Checks wiederverwendet |
| Art. VI, G6 | Fest/anpassbar (D-08); ein Jugxo mit Kialo, Datum und Name je Abweichung, im Paket |
| Art. X | Rot zuerst (`f00db43`); die Checks sind die der CI, nicht kopiert |
| Art. XI | Ein neues Paket (Phase 7); keine neue Abhängigkeit; kein zweiter Mechanismus (Schema, ULID, W2, `deriveThemeFragment`) |
| G2, E2 | Rollen und Zuordnung aus Kern und komuna unverändert; nur die sechs Paletten neu |
| G5 | KontrastParoj alle Modi, `kontrastSojloj`, `text-hierarchy`, `state-distinct`, `surface-order`, Aspiroj der Agordo, APCA als Hinweis |
| G8 | `fm agordilo derive|check`; `fm modelo validate --aspekto` grün für provo |
| E8 | „ciferecigo“ steht in keinem Beispiel (B-3: nur im Erweiterungsschlüssel des Set-Formats) |

### Abweichungen von der Spec

1. **Bezugsfläche** (G3): Die Spec nennt `neutral.0`/`neutral.1000` und in Klammern „jeweils die Fläche, die `color.background.default` im Modus bindet“; in komuna bindet `background.default` aber `neutral.50` (hell) und `neutral.900` (dunkel). Genommen: `neutral.0`/`neutral.1000` – die Anker Weiß und Schwarz, sodass jedes Ziel ein Leuchtdichteziel ist; der Kontrast gegen `background.default` prüfen die KontrastParoj ohnehin (O-5).
2. **Reihenfolge in G3:** L wird mit dem bereits ins Gamut abgebildeten C gesucht, nicht erst L und dann C verringert – sonst verfehlt die Stufe ihr Ziel nach dem Abbilden um 1–2 % (gemessen: Gelb `accent.700` 7,76 → 7,65:1).
3. **Der Ton zuerst** (D-05): G3 sucht L zum Ziel, G6 nennt den Fall „ohne ihren Ton zu verlieren“; die Ableitung hält den Ton (40 %) und verfehlt dafür das Ziel – gemeldet.
4. **Felder der Agordo über G4 hinaus:** `owner`, `license` (Pflichtfelder von `aspekto.json`), `aspiroj` (G5: nur, wenn die Agordo welche nennt), `jugxoj` (G6, D-5).
5. **Zusatzfarben geben nur den Ton** (G4 „eigener Farbton“); die Buntheit kommt aus der Kalibrierung.
6. **Die Kalibrierung misst auch das Buntheitsprofil** je Stufe (relativ zur Bezugsstufe), nicht nur die Kontrastziele – ohne Profil würden die hellen Stufen so bunt wie die Mitte. Folge: M1 liegt für `accent` nahe 0.
7. **`provo` liegt als Modelo-Fixture**, nicht als eigenes Paket (D-14, W2).
8. **Glyphen:** Das Paket trägt die Glyphen von komuna mit (`check:ikonaro` verlangt sie von jeder bekannten Aspekto); G4 nennt sie nicht.
9. **Name im Jugxo** steht im `context` (D-10).
10. **Raporto auf Englisch** (Sprache des Codes und der Meldungen); die Spec-Dokumente auf Deutsch.

### Befunde / Mankoj

- **B-1 `palette-aligned` gegen Kontrastziele:** komuna richtet ihre Rampen an OKLCH-L aus (0,95, 0,92, 0,86 … je Stufe, alle Paletten gleich), die Spec verlangt Kontrastziele je Stufe. Für komunas Töne fällt beides zusammen; bei satten Tönen verlangt dasselbe Kontrastziel ein anderes L (WCAG-Leuchtdichte und OKLCH-Helligkeit trennen sich mit Ton und Buntheit): Rot und Violett verletzen in M2 `palette-aligned` (0,02) an fünf Stufen, ohne dass eine Stufe ihr Ziel verfehlt. Anpassbar, also mit Jugxo exportierbar; der Vorschlag nennt die Buntheit, bei der die Rampe hält. Keine Regulo geändert (Regel 0.3), O-8.
- **B-2 Das Neutralprofil von komuna** ist ungleichmäßig (25 und 150 bläulich, 50/100/200 fast grau) – die Flächen raised und sunken sind getönt. Die Kalibrierung trägt das in jede abgeleitete Neutralpalette.
- **B-3 E8:** „ciferecigo“ erscheint in keinem Beispiel, aber im Erweiterungsschlüssel `com.ciferecigo.fundamento`, den jedes Set des Formats trägt (Schema). Kein Manko; festgehalten, weil E8 „nirgends“ sagt.
- **B-4 Größe des Berichts:** `raporto.json` von provo 209 KB (345 Paar-Einträge, 108 APCA-Hinweise), `raporto.md` 54 KB (O-10).
- **B-5 Tempo (Vorstufe zu M3):** eine Ableitung mit allen Prüfungen dauert in Node 1,6–2,1 s (Validierung und Alirebleco über 144 Kombinationen, komuna und die neue Aspekto); die Paletten allein siehe Messungen. Für ② (unter 150 ms im Browser) heißt das: Paletten live, Prüfung entprellt (die Spec lässt das zu), ggf. nur die Kombinationen der neuen Aspekto.
- **B-6 Tonschwelle:** 50 % → Gelb und Cyan verletzen feste Regeln (Export auch mit Jugxo gesperrt); 40 % → Gelb nur `palette-aligned` (anpassbar), Cyan sauber (D-05, O-4).
- **B-7 Fingerabdruck:** Jede Änderung an Kern-Sets oder am komuna-Paket ändert `structure.sha256`; dann muss provo neu abgeleitet werden (der Frische-Test sagt, wie). Das ist gewollt (G1: Herkunft), kostet aber einen Lauf je Vortaro-Änderung.
- **B-8 Browser (②):** `src/node/` nutzt `node:fs` und `node:crypto`; der Einstieg exportiert beides mit. ② braucht einen Einstieg ohne die Kante (die reinen Module sind es bereits).
- **B-10 CI-Dauer:** Job „Build, test, lint and Modelo checks“ in Lauf 39158336356 (`0b14851`) 12:39, in Lauf 39159638652 (`e98b5f9`) 12:58; der Test-Schritt 11:20 bzw. 11:42. Vergleich mit Spec 015 ① (Lauf 39127146926, `1e9e5f2`: Job 11:20, Test-Schritt 10:23) – die Läufer streuen stark (`main` 39152793200: 9:01). Je Suite gegen 015 ①: Projekcioj 700 s statt 622 s, Modelo 402 s statt 315 s, CLI 305 s statt 229 s (darin die sechs Agordilo-Tests), MCP 295 s statt 224 s; die Agordilo-Suite selbst 117 s, nach dem Fix 96 s (lokal 10 s). Rund 1:20 mehr Test-Schritt durch ein Paket, das je Ableitung das ganze Modelo prüft. Der Fix `e98b5f9` lässt die Tests seltener ableiten (Bibliothek vier statt sieben Ableitungen; der Determinismus der Bibliothek gegen die eingecheckte Fixture eines früheren Laufs, zwei frische Läufe vergleicht der CLI-Test; der veraltete Bericht an einer Kopie der Fixture). Der Job liegt damit über der 12-Minuten-Marke aus Spec 015 B-12; die Aufteilung ist dort entschieden (015 O-4, erster Commit in 015 ②).
- **B-11 Flake auf `main`:** `sxvebilo.spec.ts:53` („Escape closes it and returns the focus …“, `aria-expanded` wird ohne `expect.poll` gelesen) fiel im Shard 2 dieses Laufs (Chromium) und schon auf `main` (Lauf 39152793200, Firefox). Kein Bezug zu ①; der Job wurde neu gestartet, der Test nicht verändert (Regel 0.4). Kandidat für eine Nachlese.
- **B-9 Helles Gelb `#F5C400`** (Abnahme 3): Verstoß `palette-aligned` an `accent.900` (anpassbar) – die Stufe hält ihren Ton nur bei L 0,298 (13,76:1 statt 14,61:1). Vorschlag: dunklere Leitfarbe `#665000`. Export ohne Jugxo verweigert, mit Jugxo erlaubt; mit dem Vorschlag kein Verstoß.

- **B-12 (Rebase auf `main` nach #76)** Mit Spec 015 ② kam der Ikonaro-Name `upload` nach `main`; die eingecheckte `provo` war vorher abgeleitet und hatte keine Glyphe dafür (`check:ikonaro` rot, der Determinismus-Vergleich mit der Fixture rot) – genau der Fall von B-7. Neu abgeleitet mit `fm agordilo derive`: es ändern sich nur `ikonoj/upload.svg` (neu) und in `aspekto.json` die Herkunft der Glyphe und der SHA-256 der Struktur; Paletten, Sets, `raporto.json`/`raporto.md` bytegleich, 6 408 von 6 408 Paar-Auswertungen, 0 Verstöße.

### Offen (für den Maintainer)

- **O-1 Namen „Agordo“ und „Raporto“** (E9): so gebaut (`Agordo` im Schema, `raporto.json`/`raporto.md`, `Raporto` im Code). **Vorschlag: bestätigen.** Die Ontologio-Einträge (Schema `laboro`) folgen mit ③. **Entschieden (Maintainer, Abnahme am 2026-10-19): bestätigt.**
- **O-2 Die Regel der Standardtöne** (D-06: ein Fünftel des Winkels, höchstens 10°). **Vorschlag: so lassen**; ② macht sie sichtbar. **Entschieden (Maintainer, Abnahme am 2026-10-19): wie vorgeschlagen.**
- **O-3 Fest und anpassbar** (D-08). **Vorschlag: so**, als Liste in der Bibliothek; eine Kennzeichnung in `reguloj.json` wäre eine Änderung der Regulo-Semantik und gehört in eine eigene Spec. **Entschieden (Maintainer, Abnahme am 2026-10-19): wie vorgeschlagen.**
- **O-4 Tonschwelle 40 %** (D-05, B-6). **Vorschlag: 40 %.** **Entschieden (Maintainer, Abnahme am 2026-10-19): wie vorgeschlagen.**
- **O-5 Bezugsfläche** `neutral.0`/`neutral.1000` statt `background.default` (Abweichung 1). **Vorschlag: so.** **Entschieden (Maintainer, Abnahme am 2026-10-19): wie vorgeschlagen.**
- **O-6 Zusätzliche Felder der Agordo** (`owner`, `license` mit Standard `proprietary`, `aspiroj`, `jugxoj`). **Vorschlag: so**; die Werkstatt (②) trägt sie im URL-Fragment mit. **Entschieden (Maintainer, Abnahme am 2026-10-19): wie vorgeschlagen.**
- **O-7 provo als bekannte Aspekto** in `KNOWN_ASPEKTO_FIXTURES` – wie ekzemplo als Warnung (O-32 aus Nachlese 3 gilt mit). **Vorschlag: so.** **Entschieden (Maintainer, Abnahme am 2026-10-19): wie vorgeschlagen.**
- **O-8 `palette-aligned` gegen Kontrastziele** (B-1): (a) so lassen, satte Töne brauchen einen Jugxo; (b) die Kalibrierung je Ton anpassen; (c) die Schwelle der Regulo prüfen. **Vorschlag: (a)** für Stufe 1, Entscheidung mit den Messungen aus ②. **Entschieden (Maintainer, Abnahme am 2026-10-19): (a)**; entschieden wird mit den Messungen aus ②. Gemessen (D4): Gelb `#F5C400` auf `provo` meldet `palette-aligned`, dazu `state-distinct` und `surface-distinct` aus den Reglern von `provo`, Vorschlag `#675100` – Ursache und Vorschlag wandern mit den Reglern.
- **O-9 Neutraltönung** (`toenung` 1 = ein Viertel der Buntheit der Leitfarbe, komuna ≈ 0,35). **Vorschlag: so.** **Entschieden (Maintainer, Abnahme am 2026-10-19): wie vorgeschlagen.**
- **O-10 Umfang von `raporto.json`** (B-4): alle Paar-Ergebnisse oder nur das schlechteste je Paar. **Vorschlag: alle** (G5: „je Regel und Paar“). **Entschieden (Maintainer, Abnahme am 2026-10-19): wie vorgeschlagen.**

### M1 – Kalibrierung (ΔE OKLab × 100, komunas Leitfarbe gegen komuna)

Agordo: `leitfarbe` `#375479` (Ton und Buntheit von `accent.700`), `neutral.toenung` 0,35 (komunas Tönung nach D-04), sonst Standard. Gemessen je Stufe (73 Stufen, davon `neutral.950` dunkel aus dem Konjunktions-Set), `pnpm --filter @fundamento/agordilo mezuroj`.

| Palette | Stufen | ΔE max | ΔE Mittel |
|---|---|---|---|
| neutral | 18 | 0,98 | 0,09 |
| accent | 11 | 0,07 | 0,05 |
| success | 11 | 1,93 | 0,49 |
| warning | 11 | 1,38 | 0,57 |
| danger | 11 | 0,58 | 0,16 |
| info | 11 | 2,02 | 0,64 |

**Abweichungen über ΔE 5:** keine. Die größten (≥ 1): `info.900` 2,02, `info.800` 2,00, `success.900` 1,93, `success.800` 1,91, `info.950` 1,49, `warning.400` 1,38, `info.700` 1,37, `warning.300` 1,03, `success.950` 1,02, `neutral.950` dunkel 0,98 – alle aus dem Tondrift von komuna an den dunklen Enden (komuna dreht info 240° → 252°, success 150° → 142°, warning 75° → 60°), den die Regel mit einem Ton je Palette nicht nachzeichnet, und beim dunklen `neutral.950` aus dem Ton (komuna 260°, Leitfarbe 255°).

### M2 – Robustheit (zehn Leitfarben)

Je Leitfarbe eine Agordo nur mit `leitfarbe`, abgeleitet und geprüft (6 408 Paar-Auswertungen je Aspekto; zehn Ableitungen mit Prüfung 16,5 s).

| Leitfarbe | Wert | Paare bestanden | Paare verletzt | Verstöße fest | Verstöße anpassbar | Regeln | Export | Vorschlag |
|---|---|---|---|---|---|---|---|---|
| Rot | `#d7263d` | 6 408 | 0 | 0 | 5 | palette-aligned 5 | nur mit Jugxo | Leitfarbe `#903237` (C 0,127 statt 0,209) |
| Orange | `#f28c28` | 6 408 | 0 | 0 | 0 | – | ja | – |
| Gelb (hell) | `#f5c400` | 6 408 | 0 | 0 | 1 | palette-aligned 1 (`accent.900` neben dem Ziel) | nur mit Jugxo | dunklere Leitfarbe `#665000` (C 0,090 statt 0,172; bis 0,161 hält) |
| Grün | `#2e8b57` | 6 408 | 0 | 0 | 0 | – | ja | – |
| Cyan | `#00b8d9` | 6 408 | 0 | 0 | 0 | – | ja | – |
| Blau | `#1e5bd8` | 6 408 | 0 | 0 | 0 | – | ja | – |
| Violett | `#7b3fbf` | 6 408 | 0 | 0 | 5 | palette-aligned 5 | nur mit Jugxo | Leitfarbe `#653f97` (C 0,140 statt 0,192) |
| sehr dunkel | `#1a1033` | 6 408 | 0 | 0 | 0 | – | ja | – |
| sehr hell | `#e8f4ff` | 6 408 | 0 | 0 | 0 | – | ja | – |
| ungesättigt | `#7a7f85` | 6 408 | 0 | 0 | 0 | – | ja | – |

Zum Vergleich mit Tonschwelle 50 % (D-05): Orange 1 anpassbar; Gelb 90 verletzte Paar-Auswertungen, 11 feste (`contrast-below-threshold` 5, `state-distinct` 4, `contrast-reserve` 2) und 4 anpassbare Verstöße; Cyan 3 feste (`state-distinct` 2, `contrast-reserve` 1) und 1 anpassbarer.

M3 (Tempo im Browser) folgt mit ②.

## ② Werkstatt

**Branch:** `261019-spec-016-werkstatt-197e67` (von `main` `8ac1934`, nach dem Merge von #82; CI auf den sieben Jobs) · **Datum:** 2026-10-19 · **Stand:** zur Abnahme (Messanleitung in plan ③).

### Zusammenfassung

1. **Modus „Werkstatt“** neben „Ansehen“ (D-01): ein Schalter im Kopf der Vitrino, `data-fm-modus` am Root, `modus=werkstatt` im Fragment – ein Link führt direkt in die Werkstatt. Die Abschnitte des Ansehen-Modus, deren Zahlen zur Bauzeit für komuna gemessen wurden (Paletten, Rollen, Gebrauch, Kontrastmatrix, Regularo, Abdeckung, Gegenüberstellung), sind in der Werkstatt verborgen; die Abschnitte der Eroj bleiben und folgen dem Entwurf. Die Aspekto-Schalter ruhen, der Root trägt die Referenz (komuna), über die der Entwurf abgeleitet wird.
2. **Dieselbe Bibliothek im Browser** (D-02, D-03): die Vitrino bettet eine zweite Datums-Insel `fm-werkstatt` ein – die Struktur (Kern und komuna, aus den Dateien des Builds, mit dem Fingerabdruck, den `fm agordilo derive` als Herkunft schreibt), die Kalibrierung und die zwei Schemata – und den Agordilo selbst, über den neuen Einstieg `@fundamento/agordilo/browser` mit Vite zu einem Modul gebündelt (`fm-vitrino-werkstatt-skripto`). Keine zweite Ableitung, keine zweite Prüfung.
3. **Panel** (D-04): Name, Leitfarbe (Farbwähler und Textfeld, Hex oder `oklch()`), vier Zusatzfarben mit „Standard“, Neutral-Tönung, Helligkeit, Kontrast, Sättigung. Eroj, wo es eines gibt (`kampo`, `markobutono`, `butono`, `elektilo`, `dialogo`, `insigno`, `faldilo`); die Regler sind das native `input type=range` mit Label und Wertanzeige, der Farbwähler `input type=color`, das Kontrastziel `input type=number` – Kandidaten (Offen O-3).
4. **Live-Ableitung** (D-05): bei jeder Eingabe `derivePalettes` (die Paletten allein), die sechs Paletten als Custom Properties am Root gesetzt (Namen über die NomRegulo `cssVariable`); die Rollen sind im CSS-Celo `var()`-Aliasse, also folgen alle Abschnitte und alle Eroj sofort, in jeder Dimensio. **Prüfung entprellt** (D-06, D-07): 400 ms nach der letzten Änderung `deriveAspekto` – Modelo-Validierung und Alirebleco über alle Kombinationen – und der Raporto wie aus der CLI.
5. **Prüfbericht live** (D-08): Zähler bestanden/verletzt und fest/anpassbar/gedeckt (`insigno`), je Verstoß Regel, Fundstelle, Ursache und **ein** Vorschlag; „Vorschlag übernehmen“ setzt den Patch `apply` in die Agordo; „Zum Ero“ springt zum Abschnitt des Ero, dessen Skemo ein Token des Paars bindet, sonst zur Stufe der Palette; APCA als Hinweise in einem `faldilo`; eine höfliche Live-Region (`role=status`, `aria-live=polite`) sagt den Bericht an, nicht jeden Reglerschritt.
6. **Paletten-Ansicht** (D-09): sechs Tabellen mit Stufe, Farbe, Wert, Ziel und erreichtem Kontrast; das Kontrastziel je Stufe überschreibbar (`ziele` in der Agordo), eine überschriebene Stufe markiert (`data-fm-superskribita`) und einzeln rücksetzbar.
7. **Export-Sperre und Jugxo** (D-11): feste Regel verletzt → Download gesperrt mit Grund; anpassbare Regel ohne Jugxo → gesperrt, bis der `dialogo` (Begründung Pflicht, Datum, Name) einen Jugxo je Regel in die Agordo schreibt; „Agordo herunterladen“ liefert `agordo.json`. Die Vitrino schreibt keine Datei (E7).
8. **Teilen** (D-10): `#agordo=…` (deflate-raw, base64url) im Fragment, neben `modus=werkstatt` und den Dimensioj.
9. **Gegenüberstellung** (D-12): Entwurf neben komuna oder ekzemplo (wählbar), dieselben Ero-Abschnitte als Klone, dieselben Modi vom Root gespiegelt.
10. **Gleichheit Browser–CLI** (D-06): der Test lädt provo's Agordo in die Werkstatt und vergleicht den Raporto mit dem der eingecheckten Fixture (`fm agordilo derive`), Wert für Wert – gleich.
11. **M3** (unten) und **Barrierefreiheit** (D-13): axe über die Werkstatt in vier Kombinationen, Tastatur, Live-Region.
12. **Kleinste Änderungen daneben:** Modelo – Schema `AgordoZieloj` (`Agordo.ziele`), `provideModeloSchemas`; Agordilo – `ziele` in der Ableitung (`overridden` am Schritt und im Raporto), `apply` am Verstoß, `browser.ts`, `referenceStructureFiles`, `fingerprintDocuments`; Projekcioj – `CeloInput.files`, Abhängigkeit `@fundamento/agordilo`, DOM-Lib für das Browser-Modul.

### Entwurfsentscheidungen

#### D-01 Ein Modus, kein Celo (E4)
Das Skript der Vitrino (`skripto.ts`) schaltet weiter nur Attribute: `data-fm-modus`, die Schalter, `hidden` an den Abschnitten mit `data-fm-modus-only`. Was die Werkstatt rechnet, lebt im gebündelten Modul (`werkstatt.ts`) und spricht mit dem Skript über `fmVitrino` (Fragment-Teil setzen und lesen, Modus). Beim Betreten merkt sich das Skript die Aspekto und setzt die Referenz, beim Verlassen stellt es sie zurück und das Modul entfernt seine Custom Properties.

#### D-02 Die Struktur aus dem Build, auf Kern und Referenz reduziert
`CeloInput.files` trägt die gelesenen Modelo-Dateien; `referenceStructureFiles` behält den Kern und das Referenzpaket (komuna) und verwirft jede weitere Aspekto des Builds – `fm agordilo derive` leitet über genau diese Dokumente ab, darum stimmen Browser und CLI Wert für Wert. Der Fingerabdruck ist derselbe SHA-256 (`fingerprintOf`); jeder Pfad ist relativ zum Modelo-Wurzelverzeichnis, das Paketverzeichnis verliert seinen Maschinenpfad – die Vitrino ist eine Datei, die wandert. Ein Modelo ohne Referenz-Aspekto hat keine Werkstatt (Schalter deaktiviert).

#### D-03 Bündeln mit Vite, die node-Kante als Stubs, die Schemata bereitgestellt
`werkstatt-bundle.ts` bündelt `dist/celoj/vitrino/werkstatt.js` in einem Kindprozess mit Arbeitsverzeichnis Paketwurzel (bytegleich, wie die Make Kits), einmal je Prozess. Der Modelo-Index exportiert auch seine I/O-Kante (`checks/run`, `load/source` …); ein Plugin ersetzt jedes node-Builtin durch ein Modul mit denselben Namen, dessen Funktionen beim Aufruf werfen – der reine Weg ruft keine. Was der Modelo beim Laden liest (seine Version aus `package.json`, die Schemata) adressiert er mit `new URL(…, import.meta.url)`; Vite inlined diese Dateien im Bibliotheks-Build als `data:`-URL, und der Stub `readFileSync` dekodiert, was er bekommt. Die Schemata gibt die Vitrino zusätzlich explizit mit (`provideModeloSchemas`), damit der Weg nicht an einem Bundler-Verhalten hängt (B-3).

#### D-04 Eroj, wo es eines gibt; native Regler als Kandidaten
`kampo` (Name, Farbtexte, Datum und Name des Jugxo), `markobutono` (Standard je Zusatzfarbe), `butono` (Download, Jugxo, Vorschlag, Sprung, Rücksetzen), `elektilo` (Referenz), `dialogo` mit `reason="required"` (Jugxo), `insigno` (Zähler, fest/anpassbar), `faldilo` (APCA). Kein Ero für einen Regler, einen Farbwähler oder ein Dezimalfeld (`kampo kind=number` nimmt nur ganze Zahlen): `input type=range` mit `label` und `output`, `input type=color`, `input type=number` – jeweils mit Label, in der Tabelle unsichtbar beschriftet.

#### D-05 Der Live-Weg: Custom Properties, kein neues Stylesheet
Eine abgeleitete Aspekto unterscheidet sich von der Struktur nur in den sechs Paletten und den Schriftnamen (E6). Das CSS-Celo schreibt Rollen als `var()`-Referenzen auf die Paletten-Stufen; darum genügt es, je Änderung die 73 Stufen (und `neutral.950` dunkel, wenn der Modus dunkel ist) als Inline-Eigenschaften am Root zu setzen – alles folgt in derselben Kaskade wie komuna. Beim Wechsel des Farbschemas werden die modus-spezifischen Werte neu gesetzt (MutationObserver auf die Dimensio-Attribute). Ein zur Laufzeit erzeugtes Stylesheet wäre ein zweiter Weg zu denselben Werten.

#### D-06 Der Prüfweg: `deriveAspekto` wie die CLI
Die Prüfung komponiert das Paket über der Struktur im Speicher, validiert das Modelo und wertet die Alirebleco aus – derselbe Aufruf wie in `fm agordilo derive`, mit demselben Raporto (`raporto.json` bytegleich nach `serializeRaporto`; der Test vergleicht Objekt mit Datei). Nur der Dateiname des Pakets fehlt: die Werkstatt schreibt nichts.

#### D-07 Entprellt, weil über 150 ms (M3)
Die Ableitung der Paletten dauert im Browser Millisekunden, die Prüfung Sekunden (unten); die Spec lässt bei über 150 ms die Prüfung entprellen, die Ableitung nicht. Entprellt sind die Prüfung (400 ms) und das Schreiben des Fragments (300 ms); die Ableitung läuft bei jedem `input`-Ereignis. Während der Prüfung steht der Hauptfaden (B-2, O-1).

#### D-08 Vorschlag als Patch, Sprung über die Skemo
Die Erklärung (`explain.ts`) gibt neben dem Satz den Patch der Agordo zurück, wenn der Vorschlag eine Änderung der Agordo ist (`apply`: `leitfarbe`, `neutral.toenung`, `regler.*`, `ziele.* = null`); „Ziel nicht erreichbar bei diesem Farbton“ und `role-remap` haben keinen. Der Patch steht im Raporto am Verstoß (provo hat keine Verstöße – die Fixture bleibt bytegleich). Der Sprung: die erste Skemo, in deren Text ein Token des Paars (Vorder-, Hintergrund, aux) steht, ist der Abschnitt; eine Paletten-Stufe springt zu ihrer Zeile; sonst zu den Paletten.

#### D-09 `ziele`: ein Ziel je Stufe, die Böden bleiben
`ziele["<palette>.<stufe>"] = { hell, dunkel }` (Schema `AgordoZieloj`, Werte 1…21). Ein überschriebenes Ziel ersetzt das kalibrierte Ziel nach den Reglern (die Regler lassen es in Ruhe), die Böden aus `kontrastSojloj` gelten weiter (`floored`, dieselbe Funktion wie bei den Reglern): eine Stufe, die in komunas Kalibrierung 4,5:1 erreicht, bleibt mit der Reserve darüber. Der abgeleitete Schritt trägt `overridden`, der Raporto auch; ein Verstoß, den ein überschriebenes Ziel verursacht, nennt das als Ursache und schlägt vor, das Ziel zurückzunehmen (`apply: { ziele: { … : null } }`).

#### D-10 Das Fragment
`modus=werkstatt`, die Dimensioj, dann `agordo=<deflate-raw, base64url>` (CompressionStream des Browsers; die Tests komprimieren mit `node:zlib`). Das Skript der Vitrino schreibt das Fragment weiterhin an einer Stelle; das Werkstatt-Modul setzt seinen Teil über `fmVitrino.setFragmentPart`, liest ihn beim Laden und bei jedem `hashchange` (dedupliziert gegen das zuletzt Geschriebene). Nur die zuletzt gültige Agordo wird geschrieben.

#### D-11 Export und Jugxo (G6, E5)
Nach dem Raporto: feste Regel verletzt → `Agordo herunterladen` und `Jugxo eintragen` gesperrt, der Grund nennt die Regeln; anpassbare ohne Jugxo → Download gesperrt, der Dialog offen; sonst frei. Der Dialog ist ein `dialogo` mit Pflicht-Begründung, Datum (`kampo kind=date`) und Name (`kampo`, beide Pflicht, der Dialog sperrt die Bestätigung bis sie gefüllt sind); bestätigt schreibt er je ungedeckter anpassbarer Regel einen Jugxo in die Agordo (ältere Jugxoj derselben Regel ersetzt) und prüft sofort. Der Download ist die Agordo (`agordo.json`, zwei Leerzeichen, Zeilenumbruch), nicht das Paket.

#### D-12 Gegenüberstellung mit demselben Stylesheet
Zwei Container `data-fm-side="draft|reference"` tragen die Dimensio-Attribute des Root und je eine Aspekto; das Stylesheet der Vitrino wird zur Laufzeit einmal mit `[data-fm-side]` statt `:root` eingefügt, sodass jede Seite ihre Aspekto in den Modi des Root zeigt; der Entwurf bekommt dieselben Inline-Eigenschaften wie der Root. Die Ero-Abschnitte werden beim ersten Betreten geklont (ohne `id` und `data-fm-opens`). Die Kriterientabelle aus Spec 004 bleibt im Ansehen-Modus (Abweichung 3).

#### D-13 Barrierefreiheit
Jedes Bedienelement hat einen Namen (Label, `aria-label` an den Ziel-Feldern); die Live-Region sagt nur den fertigen Bericht an; die Sprungziele bekommen `tabindex=-1`; axe über die Werkstatt in hell/dunkel × default/high ohne Befund.

### Arkitekturo-Abdeckung

| Artikel / Festlegung | Wie ② ihn trägt |
|---|---|
| Art. I, G1 | Die Werkstatt rechnet über den Modelo-Dateien der Struktur; der Download ist eine Agordo, das Paket schreibt die CLI |
| Art. II | Custom-Property-Namen über `cssVariable` (NomRegulo), nie von Hand |
| Art. V, E3 | Dieselbe Bibliothek, gebündelt; kein fremder Code |
| Art. VIII | Keine zweite Berechnung im Browser: Paletten und Prüfung aus `@fundamento/agordilo`, bytegleich mit der CLI |
| Art. X | Rot zuerst (`fa77de1`); axe und Tastatur im Browser |
| Art. XI | Ein Modus der Vitrino (E4), kein neues Celo, kein neues Ero, keine Token-Änderung, keine Regulo-Semantik |
| G6, E5 | Sperre bei fester Regel, Jugxo bei anpassbarer, Kialo im Dialog |
| G7 | Panel, Live, Gegenüberstellung, Bericht, Paletten, Fragment, Download |
| E7 | Die Vitrino schreibt keine Datei |

### Abweichungen von der Spec

1. **`ziele` als Feld der Agordo:** G7 nennt das Überschreiben eines Kontrastziels je Stufe, G4 kennt dafür kein Feld; es ist neu, mit Schema und Böden (D-09).
2. **Vorschlag auch als Daten** (`apply`), damit „ein Klick übernimmt“ ohne Satz-Parsen auskommt; der Satz bleibt der eine Vorschlag (D-08).
3. **Gegenüberstellung** zeigt dieselben Ero-Abschnitte nebeneinander (G7 „gleiche Eroj, gleiche Modi“), nicht die Kriterientabelle aus Spec 004; die bleibt im Ansehen-Modus (D-12).
4. **Die statischen Abschnitte** der Vitrino sind in der Werkstatt verborgen: ihre Zahlen sind zur Bauzeit für komuna gemessen und gälten nicht für den Entwurf; die Werkstatt zeigt Paletten und Bericht des Entwurfs (D-01).
5. **Schriften** stehen nicht im Panel (die Liste des Briefings nennt sie nicht); eine Agordo mit `schriften` aus dem Fragment behält sie, die Live-Ableitung setzt `font.family.*`.
6. **Zwei kleinste Änderungen am Modelo:** `provideModeloSchemas` (D-03) und das Schema `AgordoZieloj` (D-09).

### Befunde / Mankoj

- **B-1 Größe der Vitrino:** 8,1 MB statt 6,1 MB (Build `core + ekzemplo`): das Bündel des Agordilo mit Modelo, Ajv und colorjs.io 1,26 MB, die Insel `fm-werkstatt` (Struktur, Kalibrierung, Schemata) 0,69 MB. Die Datei bleibt eine Datei ohne Netz.
- **B-2 Prüfung im Hauptfaden:** eine Prüfung dauert im Browser rund 1,05 s (M3, Median); solange steht die Seite. Entprellt nach D-07; ein Worker aus demselben Bündel wäre der nächste Schritt (O-1).
- **B-3 Vite inlined Dateien:** `new URL(…, import.meta.url)` des Modelo (Schema, Konfigurations-Schema, `package.json`) landet als `data:`-URL im Bündel; die Schemata stehen damit zweimal in der Vitrino (Bündel und Insel). Der explizite Weg (`provideModeloSchemas`) bleibt der tragende.
- **B-4 `kampo kind=number`** nimmt nur ganze Zahlen (Spec 011 ①); ein Kontrastziel braucht zwei Nachkommastellen – natives `input type=number` (D-04).
- **B-5 Klone und Warnungen:** die Klone der Ero-Abschnitte lösen eine Warnung `fm-ikono: name is required` aus (ein Ikono ohne Namen in einem Abschnitt der Vitrino); keine Fehler.
- **B-6 Lint:** die Warnung `DESIGN` in `web-component.test.ts` ist älter (Nachlese 5 B-10), nicht angefasst.
- **Mankoj:** keine neuen.

### Offen (für den Maintainer)

- **O-1 Prüfung im Worker** (B-2): ein Worker aus demselben Bündel hielte die Regler während der Prüfung flüssig; nicht gebaut, weil `file://`-Worker aus Blob-URLs nicht in jedem Browser laufen. Vorschlag: so lassen, messen (M3), bei Bedarf in Stufe 2.
- **O-2 `ziele` nach den Reglern** (D-09): das überschriebene Ziel ersetzt das Ziel nach Helligkeit/Kontrast, die Böden gelten. Alternative: vor den Reglern (die Regler verschieben auch das überschriebene Ziel). Vorschlag: so.
- **O-3 Native Regler als Kandidaten** (D-04): `input type=range`, `input type=color`, `input type=number` – Kandidaten für Eroj (Regler, Farbwähler, Dezimalfeld) in Stufe 2.
- **O-4 Standardname des Entwurfs** `entwurf`, Leitfarbe komunas `accent.700`. Vorschlag: so.
- **O-5 Fixture-Builds ohne Referenz-Aspekto** haben keine Werkstatt (D-02). Vorschlag: so.

### M3 – Tempo (Ableitung plus Prüfung bei einer Regleränderung)

Gemessen über 50 Änderungen des Reglers Helligkeit (−1 … 1), je Änderung Ableitung (Paletten und Custom Properties) und Prüfung (`deriveAspekto`), `fmWerkstatt.measure(50)` im Test „M3“ von `packages/eroj/test/vitrino.check.ts` (die Zeile steht im stderr des Laufs und als Annotation).

| Wo | Ableitung Median | Ableitung p95 | Prüfung Median | Prüfung p95 | Beides Median | Beides p95 |
|---|---|---|---|---|---|---|
| Mac (Chromium headless, Lauf von P0 auf dem Rechner des Maintainers, 2026-10-19) | 46,5 ms | 64,4 ms | 1 053,9 ms | 1 087,5 ms | 1 099,2 ms | 1 134,8 ms |
| CI (Chromium headless, GitHub-Runner, Lauf 39310455722, `7c1828d`) | 68,1 ms | 104,7 ms | 1 373,3 ms | 1 433,6 ms | 1 441,3 ms | 1 511,8 ms |

**Ziel unter 150 ms:** die Ableitung liegt darunter, die Prüfung weit darüber – also ist die Prüfung entprellt, die Ableitung nicht (D-07).

**Nachmessen (Mac):**

```sh
pnpm build
pnpm --filter @fundamento/eroj exec playwright test --config playwright.vitrino.config.ts -g "M3"
# die Zeile „M3 (chromium): Ableitung median … Prüfung median …“ steht im stderr
```

Oder in der Vitrino selbst: `pnpm fm projekcioj build --out .fundamento/projekcioj`, `.fundamento/projekcioj/vitrino/index.html#modus=werkstatt` öffnen und in der Konsole `fmWerkstatt.measure(50)` aufrufen – das Ergebnis sind zwei Reihen in Millisekunden.

## ③ Gvidanto und Doku

**Branch:** `261019-spec-016-gvidanto-197e67` (gestapelt auf ② `261019-spec-016-werkstatt-197e67`) · **Datum:** 2026-10-19 · **Stand:** zur Abnahme; nach dem Merge von ② auf `main` rebasen.

### Zusammenfassung

1. **`preview_agordo`** (G9, D-01): neues MCP-Werkzeug, lesend (`readOnlyHint`), das neunzehnte. Eingabe `{ agordo }` (das Schema ist `#/$defs/Agordo` des Modelo), Ausgabe der Raporto des Agordilo ohne die Paarliste – Zusammenfassung, Prüfungen, Verstöße mit Ursache, einem Vorschlag, dem Patch `apply` und der **Kialo der Regulo**, Jugxoj, Hinweise gezählt (APCA, andere) –, dazu der **Eigenkontrast der Leitfarbe** gegen Weiß und Schwarz und die sechs Paletten kurz (Quelle mit Ton, Buntheit, Herkunft; je Stufe Wert, Ziel, erreicht). `writes: false`. Abgeleitet wird wie bei `fm agordilo derive` über Kern und komuna.
2. **Beispiel-Dialog als e2e-Test** (Abnahme 6): „Ich will eine Marke mit #F5C400 als Hauptfarbe.“ → ein Verstoß mit Wert, Vorschlag einer dunkleren Leitfarbe (OKLCH-L kleiner), Kialo aus `reguloj.json`; der Vorschlag angewandt ergibt keinen Verstoß (`packages/mcp/src/e2e/s016-agordo.test.ts`).
3. **Prompt `gvidanto`** Regel 15: eine Marke aus einer Farbe → `preview_agordo`, Werte, Ursache, Vorschlag und Kialo weitergeben, `apply` probieren, keinen Export versprechen, den der Bericht verweigert.
4. **Ontologio** (O-1, bestätigt 2026-10-19): `Agordo` (Markenrezept) und `Raporto` (Prüfbericht) im Schema `laboro`, mit eo/en/de, Definition und Beziehungen zu Agordilo, Aspekto, Regulo, Jugxo, KontrastParo.
5. **README** „Eine Marke in fünf Minuten“: Werkstatt öffnen, Leitfarbe wählen, Bericht lesen, Agordo herunterladen, `fm agordilo derive`, Aspekto in die Konfiguration – mit allen Pfaden und Befehlen; MCP-Abschnitt mit `preview_agordo` und 19 Werkzeugen.
6. **Figma mit `provo`** (G10, Abnahme 4, D-03): der bestehende Weg trägt – eine Konfiguration mit ekzemplo und provo (`packages/modelo/test/fixtures/valid/aspekto-provo/fundamento.tri.config.json`), gebaut mit `fm projekcioj build --config …`, gibt der Sammlung `aspekto` die Modi komuna, ekzemplo, provo; jede markenabhängige Variable hat einen Wert in provo, die Komponenten-Sets sind dieselben (Test `figma-provo.test.ts`). Keine Codeänderung an der Figma-Projektion.
7. **Vojmapo:** Phase 7 → Werkstatt Stufe 1 erledigt (bis zur Abnahme von ② und ③), der alte Text der Zeile bleibt als „Stand vorher“; Abschnitt „Reihenfolge (Stand 2026-10-19)“ nach der Roadmap vom 19.10., darunter die Reihenfolge vom 17.10. als Konservierung.

### Entwurfsentscheidungen

#### D-01 Der Raporto, nicht eine zweite Antwort
`preview_agordo` ruft `deriveAspekto` der Bibliothek – dieselbe Funktion wie CLI und Werkstatt – und gibt den Raporto weiter. Weggelassen werden die Paarliste (`kontrastParoj`, 345 Einträge bei provo; die Zusammenfassung zählt sie) und die Paketpfade der Verstöße; hinzu kommen die Kialo je Verstoß (aus den Reguloj des bedienten Modelo), der Eigenkontrast der Leitfarbe und die Paletten kurz. Struktur und Kalibrierung werden beim ersten Aufruf gelesen und gehalten; ein Aufruf kostet die Prüfung (lokal 1–2 s).

#### D-02 Die Eingabe ist die Agordo des Schemas
Das Eingabeschema verweist auf `#/$defs/Agordo`: ein Client sieht jedes Feld. Ein fehlendes Pflichtfeld meldet darum die Eingabeprüfung des Servers (`mcp-input-invalid`, Pfad `preview_agordo/agordo`, die Meldung nennt das Feld); eine Farbe, die das Muster erfüllt, deren Helligkeit aber außerhalb 0…1 liegt, meldet `readAgordo` an ihrem Pfad (`agordo#/leitfarbe`).

#### D-03 Figma: Konfiguration statt Sonderweg
Die Figma-Projektion gibt der Sammlung `aspekto` je Aspekto des Modelo einen Modus (F27); eine Konfiguration, die ekzemplo und provo nennt, genügt. Die neue Datei liegt neben provo (`fundamento.tri.config.json`, „tri“ = drei), die bestehende `fundamento.config.json` von provo bleibt unverändert (nur provo).

#### D-04 Der Eigenkontrast der Leitfarbe
Die Spec lässt den Agenten sagen: „Die Primäraktion erreicht mit diesem Gelb als Fläche hinter weißem Text keine 4,5:1.“ Der Agordilo setzt die Leitfarbe aber nicht als Fläche ein, er leitet `accent.700` am Kontrastziel ab (Ton und Buntheit der Leitfarbe, dunkler). Damit der Agent beides sagen kann, nennt die Antwort den Eigenkontrast der Leitfarbe (`leitfarbe.onWhite`, `onBlack`) neben dem, was die Ableitung daraus macht (Abweichung 1).

### Dialog vorher/nachher

Vorher (vor ③): kein Werkzeug; ein Agent hätte `check_contrast` auf Tokens der bedienten Marke rufen können, nicht auf eine Farbe, die noch keine Marke ist.

Nachher, gemessen (lokal, 2026-10-19): `preview_agordo { agordo: { name: "flava", leitfarbe: "#F5C400" } }` →

- `leitfarbe`: `#f5c400`, auf Weiß **1,64:1**, auf Schwarz 12,78:1 – als Fläche hinter weißem Text weit unter 4,5:1.
- `exportable: false`; 6 408 von 6 408 Paar-Auswertungen bestanden; 0 feste, 1 anpassbarer Verstoß.
- Verstoß `palette-aligned` an `color.palette.accent.900`: „At step 900 the ramps … differ by 0.021 in OKLCH lightness, above 0.02 …“; Ursache: `accent.900` hält den Ton der Leitfarbe nur bei L 0,298, 13,76:1 statt 14,61:1; **Vorschlag: „Use the darker lead colour #665000 (hue 90.4°, chroma 0.0901 instead of 0.1716 …)“**, `apply: { leitfarbe: "#665000" }`; Kialo der Regulo: „A role picks a step number, not a colour. …“
- Mit `#665000`: `exportable: true`, keine Verstöße, die Leitfarbe selbst 7,74:1 auf Weiß.

### Abweichungen von der Spec

1. **Eigenkontrast statt „Primäraktion auf Gelb“** (D-04): die Spec erwartet im Dialog einen Kontrastverstoß der Primäraktion; die Ableitung lässt ihn nicht entstehen (sie dunkelt die Stufe ab). Gemeldet wird der Verstoß, den es gibt (`palette-aligned`), und der Wert der Leitfarbe als Fläche.
2. **`apply` und Kialo** in der Ausgabe – über G9 hinaus, damit ein Agent den Vorschlag prüfen kann, ohne Text zu zerlegen.
3. **Eine neue Konfigurationsdatei** in der Fixture von provo (D-03).

### Befunde / Mankoj

- **B-1 `check:alirebleco` nimmt kein fremdes Paket:** er misst die bekannten Fixtures (ekzemplo, provo, `KNOWN_ASPEKTO_FIXTURES`). Für eine eigene Marke trägt `fm agordilo check` dieselbe Alirebleco-Auswertung; Abnahme 2 misst darum provo mit `check:alirebleco` und eine eigene Marke mit `fm agordilo check`. Kandidat: `check:alirebleco --aspekto <dir>`.
- **B-2 Antwortgröße:** die Antwort für das Gelb ist rund 16 KB (ohne Paarliste); mit Paarliste wären es über 200 KB.
- **B-3 Dauer:** ein Aufruf dauert die Prüfung des Agordilo (lokal 1–2 s, beim ersten zusätzlich das Lesen der Struktur); die AK-07-Budgets der übrigen Werkzeuge sind unberührt (`pnpm perf` grün).
- **Mankoj:** keine neuen.

### Offen (für den Maintainer)

- **O-1 Paarliste in `preview_agordo`** (B-2): weglassen (so gebaut) oder als Option `pairs: true`. Vorschlag: so lassen.
- **O-2 `check:alirebleco --aspekto <dir>`** (B-1): Vorschlag: Kandidat für Spec 019 oder eine Nachlese.
- **O-3 Name `fundamento.tri.config.json`** (D-03). Vorschlag: so.

### Messanleitung (Abnahme 1–6)

Alle Befehle im Repository-Wurzelverzeichnis (`/Users/thorstenjankowski/n8n-compose/20260918_fundamento-ds`, der Checkout des Maintainers; nach dem Merge von ② und ③ auf `main`), nach `pnpm install` und `pnpm build`.

**1. Werkstatt (Abnahme 1, Stufe 1 in fünf Minuten).**

```sh
pnpm fm projekcioj build --out .fundamento/projekcioj
open "/Users/thorstenjankowski/n8n-compose/20260918_fundamento-ds/.fundamento/projekcioj/vitrino/index.html#modus=werkstatt"
```

Leitfarbe wählen (Farbwähler oder Textfeld), Name setzen, Regler bewegen, Farbschema und Kontrast im Kopf umschalten; der Prüfbericht steht rechts neben dem Panel. Mit provo vorbelegt (Werkstatt-Link mit Agordo im Fragment):

```
/Users/thorstenjankowski/n8n-compose/20260918_fundamento-ds/.fundamento/projekcioj/vitrino/index.html#modus=werkstatt&aspekto=komuna&agordo=RY_NasMwEIRfxUwvCSj-CUkPuvVSKKSkh9xKD7Ii20tkyUirFif43YtSSm47szvLNzc4NRpITMF_ewj4H2cCJD6yLlYdaSYmn6Io2EQuvLPzGgKWtHExJ9_fTlkb4k6FNjtPz-2uUzUErikqvt59B3kDuc5Dwl-sHlZ1ud8Xddlsi-12v8Yi4EzioGy-ZG9ccj1kXe4WgWB6m7luGIy11F8Mcd41AhfvOKj4L6MyzNTfs03ZLAJRD4E6_iM4U5ysmvPYqZHsDImXoAe6t3-0Or4eNk3ZQCD6FHS2BuYpyqrqiYfUltqP1XF01Ka4Oc2TqR5vgjlT5EBtYtVaA8khmQwSaOII-YmDYoevZVl-AQ
```

**2. CLI (Abnahme 2).** Dieselbe Agordo (provo) zweimal ableiten, vergleichen, prüfen:

```sh
pnpm fm agordilo derive packages/modelo/test/fixtures/valid/aspekto-provo/agordo.json --out .fundamento/provo-1
pnpm fm agordilo derive packages/modelo/test/fixtures/valid/aspekto-provo/agordo.json --out .fundamento/provo-2
diff -r .fundamento/provo-1 .fundamento/provo-2 && echo bytegleich
pnpm fm agordilo check .fundamento/provo-1
pnpm fm modelo validate --aspekto .fundamento/provo-1
pnpm check:alirebleco          # misst provo als bekannte externe Aspekto (W2), 0 fehlgeschlagene Auswertungen
pnpm check:parity
```

Für eine eigene Agordo (aus der Werkstatt heruntergeladen) dieselben Befehle mit ihrem Pfad; `check:alirebleco` nimmt kein fremdes Paket (B-1), `pnpm fm agordilo check <ordner>` trägt dieselbe Auswertung.

**3. Gelb-Fall (Abnahme 3).**

```
/Users/thorstenjankowski/n8n-compose/20260918_fundamento-ds/.fundamento/projekcioj/vitrino/index.html#modus=werkstatt&aspekto=komuna&agordo=q1bKS8xNVbJSSstJLEtU0lHKSc0sSUssSgKJKbuZOpsYGCjVAgA
```

Erwartet: ein Verstoß `palette-aligned` (anpassbar) mit Ursache und Vorschlag `#665000`; „Agordo herunterladen“ gesperrt mit Grund; „Jugxo eintragen“ öffnet den Dialog (Begründung, Datum, Name), danach ist der Download frei; „Vorschlag übernehmen“ setzt `#665000`, kein Verstoß. Feste Regel: in der Werkstatt Neutral-Tönung 0,4, Helligkeit 0,1, Kontrast 0,1, Sättigung 1,1 setzen (die Regler von provo) → `state-distinct` (fest), Download und Jugxo gesperrt. Dasselbe in der CLI:

```sh
printf '%s\n' '{ "name": "flava", "leitfarbe": "#F5C400" }' > .fundamento/flava.json
pnpm fm agordilo derive .fundamento/flava.json --out .fundamento/flava   # Exit 1, nichts geschrieben, Ursache und Vorschlag je Verstoß
```

**4. Figma mit `provo` (Abnahme 4).**

```sh
pnpm fm projekcioj build --config packages/modelo/test/fixtures/valid/aspekto-provo/fundamento.tri.config.json --out .fundamento/projekcioj-provo
```

Dann das Plugin aus `.fundamento/projekcioj-provo/figma/` in der Figma-Datei laufen lassen (wie in den Figma-Messungen der Specs 014/015). Siehe „In Figma zu messen“.

**5. M1–M3 (Abnahme 5):** M1 und M2 in plan ①, M3 in plan ② (Tabelle und Nachmessen am Mac).

**6. `preview_agordo` (Abnahme 6).** Im Harness des Maintainers (Claude Code):

```sh
claude mcp add fundamento -- pnpm --dir /Users/thorstenjankowski/n8n-compose/20260918_fundamento-ds -s fm mcp
```

und fragen: „Ich will eine Marke mit #F5C400 als Hauptfarbe.“ Ohne Agent, direkt über die Werkzeugfunktion:

```sh
node --input-type=module -e 'const t = await import("/Users/thorstenjankowski/n8n-compose/20260918_fundamento-ds/packages/mcp/dist/tools.js"); const l = await import("/Users/thorstenjankowski/n8n-compose/20260918_fundamento-ds/packages/mcp/dist/load.js"); console.log(JSON.stringify(t.TOOLS.preview_agordo(l.loadServed(), { agordo: { name: "flava", leitfarbe: "#F5C400" } }).output, null, 2));'
```

Erwartet: die Antwort aus „Dialog vorher/nachher“.

### In Figma zu messen

Grüne Tests sind für Figma keine Abnahme. Mit dem Plugin aus `.fundamento/projekcioj-provo/figma/` (Build oben), in der Testdatei (Version vorher sichern):

1. Die Sammlung `aspekto` hat drei Modi: komuna, ekzemplo, provo.
2. Der Modus provo auf einem Rahmen (nicht auf einem Set) stellt alle Sets um: `butono` primär im Violett von provo, Flächen leicht getönt, Überschriften in Archivo.
3. Hell/dunkel und hoher Kontrast funktionieren in provo wie in komuna (Moduswechsel der Sammlungen `color-scheme`, `contrast`).
4. Ein zweiter Lauf schreibt nichts (Bericht ohne `updated`).
