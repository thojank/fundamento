# Spec 016 – Agordilo Stufe 1 (Werkstatt) – Plan

**Spec:** [`spec.md`](spec.md) (Fassung vom 2026-10-17, unverändert kopiert) · **Briefing:** `briefing-p0-2026-10-18.md` (Maintainer-Ordner, nicht kopiert) · **Basis:** `main` (`7a05c6e`), eigener Branch, nicht gestapelt (der Agordilo berührt keine Eroj) · **Regel 0** (12.10.) gilt: der Weg, den das Repo schon geht (Art. XI), sonst die kleinste Änderung mit Eintrag hier; Tokens, Regulo-Semantik und Constitution nie ändern; nie eine Grenze aufweichen, um grün zu werden.

Drei PRs, gestapelt: ① Bibliothek von `main`, ② Werkstatt in der Vitrino von ①, ③ Gvidanto und Doku von ②.

## ① Bibliothek

**Branch:** `261018-spec-016-agordilo-f027c6` · **Datum:** 2026-10-18 · **Stand:** gebaut, lokal grün; Abnahme offen.

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
- **B-9 Helles Gelb `#F5C400`** (Abnahme 3): Verstoß `palette-aligned` an `accent.900` (anpassbar) – die Stufe hält ihren Ton nur bei L 0,298 (13,76:1 statt 14,61:1). Vorschlag: dunklere Leitfarbe `#665000`. Export ohne Jugxo verweigert, mit Jugxo erlaubt; mit dem Vorschlag kein Verstoß.

### Offen (für den Maintainer)

- **O-1 Namen „Agordo“ und „Raporto“** (E9): so gebaut (`Agordo` im Schema, `raporto.json`/`raporto.md`, `Raporto` im Code). **Vorschlag: bestätigen.** Die Ontologio-Einträge (Schema `laboro`) folgen mit ③.
- **O-2 Die Regel der Standardtöne** (D-06: ein Fünftel des Winkels, höchstens 10°). **Vorschlag: so lassen**; ② macht sie sichtbar.
- **O-3 Fest und anpassbar** (D-08). **Vorschlag: so**, als Liste in der Bibliothek; eine Kennzeichnung in `reguloj.json` wäre eine Änderung der Regulo-Semantik und gehört in eine eigene Spec.
- **O-4 Tonschwelle 40 %** (D-05, B-6). **Vorschlag: 40 %.**
- **O-5 Bezugsfläche** `neutral.0`/`neutral.1000` statt `background.default` (Abweichung 1). **Vorschlag: so.**
- **O-6 Zusätzliche Felder der Agordo** (`owner`, `license` mit Standard `proprietary`, `aspiroj`, `jugxoj`). **Vorschlag: so**; die Werkstatt (②) trägt sie im URL-Fragment mit.
- **O-7 provo als bekannte Aspekto** in `KNOWN_ASPEKTO_FIXTURES` – wie ekzemplo als Warnung (O-32 aus Nachlese 3 gilt mit). **Vorschlag: so.**
- **O-8 `palette-aligned` gegen Kontrastziele** (B-1): (a) so lassen, satte Töne brauchen einen Jugxo; (b) die Kalibrierung je Ton anpassen; (c) die Schwelle der Regulo prüfen. **Vorschlag: (a)** für Stufe 1, Entscheidung mit den Messungen aus ②.
- **O-9 Neutraltönung** (`toenung` 1 = ein Viertel der Buntheit der Leitfarbe, komuna ≈ 0,35). **Vorschlag: so.**
- **O-10 Umfang von `raporto.json`** (B-4): alle Paar-Ergebnisse oder nur das schlechteste je Paar. **Vorschlag: alle** (G5: „je Regel und Paar“).

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

Folgt in PR ②.

## ③ Gvidanto und Doku

Folgt in PR ③.
