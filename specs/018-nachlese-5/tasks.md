# Nachlese 5 – Aufgaben

**Spec:** [`briefing.md`](briefing.md) · **Plan:** [`plan.md`](plan.md). Aufgaben ① zählen ab T1801, ② ab T1901, ③ ab T2001.

## ① CI: `plugin.test.ts` teilen (O-5)

**Branch:** `261019-nachlese-5-ci-f027c6` (von `main` @ `ef3c8db`; nach dem Merge von #77 auf `main` @ `a1dc8b6` rebased – die Hashes sind die nach dem Rebase).

### A – Teilung
- [x] **T1801 Basis** Projekcioj-Suite mit dem JSON-Reporter vor der Teilung: 716 Tests, davon 250 in `plugin.test.ts` (310 s in einer Datei, die Suite 318 s).
- [x] **T1802 Teilung** sieben Testdateien nach Themen, ein Hilfsmodul ohne Tests (plan ① D-01). `24aa569`. Nachher 716 Tests, Namen identisch, keiner übersprungen.

### B – Wackel-Tests (rot zuerst)
- [x] **T1803 Tests** `sxvebilo.spec.ts` Escape wartet auf Zustände, `dialogo.spec.ts` Escape gibt dem Öffner den Fokus wie die Tastatur (plan ① D-02, D-03). Rot `d5a8279`: `sxvebilo` Escape in Firefox 10 von 10 (der Fokus kehrt nicht zum Auslöser zurück).
- [x] **T1804 Fix** `focusout`-Regel der Overlays (`sxvebilo`, `menuo`) im Element-Template. Grün `72534b0`.

### C – Abschluss
- [x] **T1805 Doku** plan ①, tasks ①, Doku-Test.
- [x] **T1806 CI** Zeiten je Job; zwei Projekcioj-Shards reichen (O-1: nein). Die gerenderten Checks lagen über 7 min: axe über die Eroj als eigener Job (plan ① D-04), rot `c667734`, grün im Commit danach.
- [ ] **Aufräumen (älter als dieser Branch):** Biome-Warnung `DESIGN` unbenutzt in `packages/projekcioj/src/celoj/web-component/web-component.test.ts`.

### Messungen

| Was | Wert |
|---|---|
| Commits ① | Teilung `24aa569`; Wackel-Tests rot `d5a8279`, grün `72534b0` |
| Testzahl | Projekcioj vorher 716, nachher 716 (Namen identisch, 0 übersprungen); `plugin.test.ts` 250 → `plugin-lauf` 47, `plugin-variablen` 40, `plugin-sets` 51, `plugin-rahmen-beispiele` 17, `plugin-doppel` 14, `plugin-bauformen-eingabe` 35, `plugin-bauformen-inhalt` 46 = 250 |
| Projekcioj lokal (zehn Kerne) | 318 s → 90 s Wanduhr der Suite; längste Datei `plugin-sets` 82 s |
| Wackel-Tests | `sxvebilo`, `menuo`, `dialogo` zehnfach: je 170 von 170 in Chromium, Firefox und WebKit |
| Tests lokal | Modelo 3 551, Projekcioj 716, MCP 307, CLI 66 grün; Lint und alle Modelo-Checks ohne Fehler; Browser 243 Specs in Chromium, Alirebleco-Check 561, Vitrino 30 |
| CI (Teilung, fünf Jobs) | Lauf 39245801159 (`a4f2c8b`, alle Jobs grün, Wanduhr 8:18): `checks` 1:16, `unit` 3:07, `projekcioj` **3:06 / 3:10** (vorher 9:29 / 1:03), `eroj` 1:51 / 1:58, `rendered-checks` **8:18** (axe 227 s, Vitrino 138 s, Make Kit 45 s, Quickstart 16 s) – über 7 min, daher D-04 |
| CI (sechs Jobs) | Lauf 39247019640 (`ee67be1`, alle Jobs grün, **Wanduhr 4:55**, vorher 9:29 in #79): `checks` 1:07, `unit` 4:37, `projekcioj` 2:51 / 2:29, `eroj` 2:03 / 2:18, `alirebleco-eroj` 4:55, `rendered-checks` 3:11 – kein Job über 7 min; grüner Stand `ee67be1` |
| Rebase auf `main` nach #77 (`a1dc8b6`, 2026-10-19) | ein Konflikt im Doku-Test (Block 016 ① aus #77 und Block Nachlese 5, beide behalten). Lokal: Agordilo 35, MCP 307, CLI 66, Projekcioj 716, Modelo 3 560 grün – `export/build.test.ts` „building twice is byte-identical“ lief im parallelen Gesamtlauf auf zehn Kernen in die 30-s-Grenze, allein 3 von 3 grün (Last; dasselbe wie beim Rebase von #77, seit dort die Agordilo-Suite mitläuft); Lint und alle Modelo-Checks ohne Fehler; Browser 243 Specs in Chromium; CI in der Zeile danach |

## ② Befunde

**Branch:** `261019-nachlese-5-f027c6` (gestapelt auf ① @ `a984699`, PR #80; nach dem Rebase von ① auf `main` @ `a1dc8b6` neu gestapelt). Die Hashes aller Commits stehen in **einer** Zeile der Messungen (nach einem Rebase auf ① dort und hier ersetzen).

### A – Gvidanto (N5-2, O-17, N5-3, O-39)
- [x] **T1901 Vorher** alle Zeichenketten der Dialog-Tests × (ohne, de, en) gegen den Stand von ① aufgenommen (1 488 Zeichenketten, 4 464 Antworten; plan ② „Dialoge vorher/nachher“).
- [x] **T1902 Rot** `suggest-ero.test.ts` (N5-2: A15 de/ohne/en, zwei Eroj im Kopf, eigene Grenze im Attributteil, E-Mail-Adresse; O-17: A16, Kontaktkacheln, falsche Freunde, Pin der nicht trennbaren), `eroj.test.ts` (brief `props`, ≤ 750, größter `kampo`), `dialogo.test.ts`/`sxvebilo.test.ts` (O-39), MCP `s018-nachlese-5.test.ts` (A15, A16, A2, O-39), Doku-Test ②. Rot `2e69906`: Modelo 15, MCP 4.
- [x] **T1903 Grün** `suggest-ero.ts` (`LINKING_WORDS`, `headOf`, Kopf-Ero), `usage.ts` (`goalMatchOf`, `COMPOUND_FIRST_PART_MIN`), `eroj.ts` (`props` im brief), Schema `get_ero.output.json` (additiv), Uzo `dialogo`/`sxvebilo` (drawer), drei Jugxoj (D-06 bis D-09). Grün `ebd678c`.
- [x] **T1904 Nachher** dieselben Zeichenketten gegen den grünen Stand: 33 Antworten geändert, Spec-Dialoge nur A15, A16, Drawer/Seitenpaneel (O-39), „Zeilen mit Seitennummerierung“ (bleibt Rückfrage) – Tabelle in plan ②.

### B – Figma (N5-1, N5-4, N5-5, N5-6, O-41)
- [x] **T1905 Rot** strenges Doppel (entfernter Knoten antwortet nur `removed` und `id`), `plugin-lauf` (N5-1), `plugin-rahmen-beispiele` (jeder Beispielrahmen auf `canvas`), `plugin-bauformen-inhalt` (avataro klein „E“, Verbindung gelöst; `ligilo` `icon-end`), `plugin-bauformen-eingabe` (Vorschlagsreihen FILL), `figma.test` (Plan `oneInitial`, `icons`/`toggles` des `ligilo`), Browser `avataro.spec`. Rot `def2530`: Projekcioj 11 (davon drei bestehende Tests, die einen entfernten Knoten lasen – B-3), Browser 1.
- [x] **T1906 Grün** `plugin.ts` (`recordStart`/`lostSince` geschützt, `groundOf`, `oneInitial`, Reihen FILL, `icon-end`), `figma.ts` (`AVATAR_SIZE_PROP`, `oneInitial`, `iconsOf` `external`, `BOOLEAN_TOGGLES.external`), `element-template.ts` (eine Initiale in der kleinsten Größe), zwei Pins der Label-Vorgaben (D-01 bis D-05). Grün `1868e5b`.

### C – Modelo und Web (O-10, O-14)
- [x] **T1907 Rot** `skemo-rules.test` (Zahl-Prop gültig, boolesch ungültig), `alsxutilo.test` (dritte Constraint, `max-size` ohne Hilfe), MCP `s018` (`check_usage`), Browser `alsxutilo.spec` (Warnung), `pflicht.spec` (Adresse, Webadresse, Datum), `kampo.spec`/`web-component.test` (Textfeld mit `inputmode`). Rot `6f8961a`: Modelo 3, MCP 1, Projekcioj 1, Browser 5.
- [x] **T1908 Grün** `skemo-rules.ts` (`FILLABLE_KINDS`), `usage.ts` (`propStates`), Skemo `alsxutilo` (Constraint, Kialo), `element-template.ts` (Zahl-Props in der Constraint-Lesung; `inputmode`, `#formMismatch`, `#dateOutside`, `#probeMessage`) (D-10, D-11). Grün `1a57683`.

### D – Abschluss
- [x] **T1909 Doku** plan ② (D-01 bis D-11, Dialoge, Abweichungen 1–6, B-3 bis B-10, O-2 bis O-9, In Figma zu messen), tasks ②, Doku-Test.
- [x] **T1910 CI** PR #81, Lauf 39254016800 grün (Zeile CI), grüner Stand `14e0e46`.
- [ ] **Aufräumen (älter als dieser Branch):** Biome-Warnungen in `web-component.test.ts`, `menuo.spec.ts` und Modelo (B-10).

### Messungen

| Was | Wert |
|---|---|
| **Commits** (rot / grün; nach einem Rebase hier ersetzen) | Gvidanto rot `2e69906` grün `ebd678c` · Figma rot `def2530` grün `1868e5b` · Modelo/Web rot `6f8961a` grün `1a57683` · Vitrino-Pin `5a662fc` · Doku im Commit der Messungen |
| `suggest_ero` | A15 „Karte für ein Projekt mit Bild und Titel“ → `karto` (`card`, karte); A16 „Projektkarten“ → `karto` (`card`, karten); „Drawer“ → `dialogo.drawer` `ask-human` mit der Kialo des `sxvebilo` |
| Dialoge | 1 488 Zeichenketten × (ohne, de, en) = 4 464 Antworten: 33 geändert, Spec-Dialoge nur A15, A16, Drawer/Seitenpaneel, „Zeilen mit Seitennummerierung“ (bleibt Rückfrage) |
| `brief` (ceil Bytes/3, Grenze 750) | größter `kampo` 525 → **646**; `butono` 546 → 597, `elektilo` 379 → 466, `kompletigilo` 353 → 465 (`loading: boolean`), `tabelo` 427 → 456 |
| `check_usage` | `alsxutilo` mit `max-size` ohne Hilfe: `ero-prop-constraint` („slot:help=empty, prop:max-size=filled … (file-constraints-stated)“); mit Hilfe gültig |
| `check:regularo` | 59 Reguloj, 199 Jugxoj (+3), 32 Uzoj, 0 Fehler, 0 Warnungen |
| `check:parity` | 32 Eroj, 0 Differenzen, 297 Freigaben |
| Tests lokal | `turbo run test --filter=!@fundamento/eroj --force` (3:23): Modelo 3 571 (vorher 3 551; +20), MCP 312 (307; +5), Projekcioj 722 (716; +6), CLI 66. Im parallelen Gesamtlauf lief `export/build.test.ts` „building twice is byte-identical“ in seine Zeitgrenze von 30 s (Last), allein 12 von 12 grün – nichts angehoben; der Doku-Test war im Lauf rot, weil die Doku danach kam (allein 179 grün) |
| Browser | alle 248 Specs in Chromium (vorher 243 + 5 neue); berührte Specs `pflicht`, `kampo`, `alsxutilo`, `avataro` 72 in Firefox und WebKit; `check:alirebleco-eroj` 561 (drei Engines), `check:vitrino` 30 (Pin `avataro` „E“ in der ersten Reihe, `5a662fc`) – je grün |
| Checks | `pnpm lint` grün (Warnungen älter, B-10); `check:vortaro-lint`, `check:mankoj` (9), `check:alirebleco` (89 KontrastParoj × 72 Kombinationen, 0 Fehler, 2 394 APCA-Warnungen), `check:clean-room`, `check:ikonaro`, `check:release` ohne Fehler |
| CI (PR #81) | Lauf 39254016800 (`14e0e46`, gegen ① @ `3434094`, alle sieben Jobs-Läufe grün, **Wanduhr 4:57**): `checks` 1:02, `unit` 4:54, `projekcioj` 3:27 / 3:27, `eroj` 2:19 / 2:24, `alirebleco-eroj` 3:23, `rendered-checks` 3:47; kein Job über 7 min; grüner Stand `14e0e46` |
| Neu gestapelt auf ① @ `a984699` (nach #77, 2026-10-19) | ohne Konflikt. Lokal: Agordilo 35, MCP 312, CLI 72, Projekcioj 722, Modelo 3 579 grün; Lint und alle Modelo-Checks ohne Fehler, `check:parity` 32 Eroj 0 Differenzen, `check:regularo` 59 Reguloj 199 Jugxoj 0 Warnungen; Browser 248 Specs in Chromium, Alirebleco-Check 561, Vitrino 30; CI in der Zeile danach |

## ③ Release-Weg 0.1.0

**Branch:** `261019-release-010-auftrag-umsetzen-00420d` (von `main` @ `8d6e9ad`, nach dem Merge von #81). Auftrag vom 2026-10-19; kein eigener Spec-Ordner (plan ③).

### A – Rote Tests
- [x] **T2001 Rot** `make-kit.test.ts` (`0.1.0` angenommen; `0.2.0`, `0.1.0.1`, `0.2.0-next.0` abgelehnt mit beiden Formen), `release-workflow.test.ts` (`--print`: `0.1.0` → latest, `0.1.0-next.5`/`-next.9` → next; Trockenlauf; eine Stelle; `release.yml` ohne Tag, Input-Beschreibung mit beiden Formen; `0.2.0`/`0.1.0.1` am Bau abgelehnt), Doku-Pin plan ③ / tasks ③ (`docs.test.ts`). Rot `b71c0f2`: Projekcioj 1, Modelo 6 + Doku 1 (die zwei Ablehnungen am Bau waren schon grün: unverändertes Verhalten, nur gepinnt).

### B – Grün
- [x] **T2002 Grün** `kitVersion` (Gleichheit mit der Version des Modelo, Fehlertext mit beiden Formen), `release-kits.sh` (`tag_for`, `command_for`, `--print` mit `tag:`), `release.yml` (Input-Beschreibung, Schrittname, Kopfkommentar), README-Zeile (plan ③ D-01 bis D-03). Grün `110e894`.

### C – Abschluss
- [x] **T2003 Doku** plan ③, tasks ③, Doku-Test.
- [ ] **T2004 CI** PR, Lauf, grüner Stand (Zeile CI).

### Messungen

| Was | Wert |
|---|---|
| **Commits** | rot `b71c0f2` · grün `110e894` · Doku im Commit der Messungen |
| `scripts/release-kits.sh publish --print`, `FUNDAMENTO_KIT_VERSION=0.1.0` | `version: 0.1.0` · `tag: latest` · je Kit `pnpm publish --tag latest --provenance --access public --no-git-checks` (komuna, ekzemplo) |
| dito, `FUNDAMENTO_KIT_VERSION=0.1.0-next.9` | `version: 0.1.0-next.9` · `tag: next` · je Kit `pnpm publish --tag next --provenance --access public --no-git-checks` |
| `dry-run --print` ohne Version | `version: <modelo>-next.0` · `tag: next` · `pnpm publish --dry-run --tag next …` (unverändert) |
| Probelauf lokal (`dry-run`, echter Bau) | `0.1.0`: beide Kits `"version": "0.1.0"`, `pnpm publish --dry-run --tag latest --provenance --access public --no-git-checks` je Kit durch, 49 Dateien, 289,7 kB / 290,9 kB gepackt, 2,4 MB entpackt · `0.1.0-next.9`: dasselbe unter `--tag next` · `publish` mit `0.2.0`: `exit 1` am Bau („neither the Modelo's version 0.1.0 nor a pre-release of it (expected 0.1.0 or 0.1.0-<Vorabkennung> …)“), kein Publish-Befehl erreicht · `check:release` (`pack`) grün |
| Tests lokal | `turbo run test --filter=!@fundamento/eroj --force` (3:16): Agordilo 35, MCP 312, CLI 72, Projekcioj 723 (vorher 722; +1), Modelo 3 588 (vorher 3 579; +9: acht in `release-workflow.test.ts`, ein Doku-Pin) – alle grün, nichts übersprungen; Eroj nicht berührt (kein Ero, kein Token) |
| Checks | `pnpm lint` grün (Warnungen älter, plan ③ B-3); `check:release` (`pack`) grün |
| CI | folgt |
