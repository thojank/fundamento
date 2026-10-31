# Spec 036 – Markenassistent: Bühne, Farbrollen und Qualität · Spec 029 zu Ende · neutrale Namen – Plan

**Spec:** [`spec.md`](spec.md) (Fassung vom 2026-10-31, unverändert kopiert; SHA-256 `a0cc66beda58be0bcc0a4dcaf28179cd178d4ec3ed79afa51bdddfea1c55acfa`, 12 845 Bytes) · **Basis (BASIS):** `main` `f2b5a058` (`f2b5a0585b772dc4cd83eb672a4bd956242610a8`, „Merge pull request #129“, Spec 035 vollständig; am 2026-10-31 nach `git fetch origin` festgehalten, D-13) · **Regel 0** gilt: der Weg, den das Repo schon geht, sonst die kleinste Änderung mit Eintrag hier. **Keine Budgets und keine Grenzen angehoben. Nichts gemergt.**

**Datum:** 2026-10-31 · **Stand:** Gerüst. Spec wortgleich übernommen; Entscheidungen V-1 bis V-3 (Spec), D-01 bis D-12 (Auftrag) und D-13 bis D-34 (Arbeitsteilung des Laufs) eingetragen, alle „vorgeschlagen“. Die Teile laufen; Ergebnisse, Messungen und Bericht folgen in eigenen Doku-Commits auf diesem Branch.

**Ablage (D-01):** `spec.md`, `plan.md` und `tasks.md` liegen nur auf dem Branch von Teil 1 (`261031-spec-036-t1-abnahme`). Die übrigen PRs verlinken auf diesen plan. Jedes Ticket des Laufs schreibt seinen Beitrag zuerst in eine eigene Datei außerhalb des Repos; ein Doku-Commit am Ende führt sie zusammen.

**Wortregel (R-12, D-14):** Das Wort aus R-12 und der Name des privaten Schriften-Repos stehen nur in der wortgleichen `spec.md`. Hier heißen sie „das Wort aus R-12“ und „das private Schriften-Repo“; echte Marken heißen „Marke 1“, „Marke 2“.

**Commit-Identität (Befund 6.5, D-15):** Vor dem ersten Commit des Laufs ist `user.email` lokal im Repo des Laufs auf `189642209+thojank@users.noreply.github.com` gesetzt (ID über `gh api user`). Nicht global, nicht im Checkout des Maintainers, die Historie bleibt unverändert. Nebenwirkung: Die Einstellung gilt für jeden Worktree dieses Repos (auch für andere Läufe desselben Purple-Workspace), jeweils mit der Noreply-Adresse derselben Person.

### Branches und Worktrees

Alle Branches enthalten BASIS (AC-2). Je Branch ein eigener Worktree unter `/tmp/s036-*` (Muster aus Spec 034/035 D-01). Der unveränderte, gebaute Worktree `/tmp/s036-main` (losgelöst BASIS) ist der Bezug für jede Messung „vorher“.

| Worktree | Branch | Basis / PR-Basis | PR | Befunde |
|---|---|---|---|---|
| `/tmp/s036-main` | losgelöst `f2b5a058`, gebaut, nie geändert | – | – | Bezug „vorher“ |
| `/tmp/s036-t1` | `261031-spec-036-t1-abnahme` | BASIS / `main` | „Spec 036 Teil 1 – Fehler aus der Abnahme“ | 1.1–1.7, `specs/036-assistent-buehne/` |
| `/tmp/s036-t1-form` | `261031-spec-036-t1-form` (lokaler Hilfsbranch, kein PR, nicht gepusht) | BASIS | – | 1.1, 1.2, 1.7 |
| `/tmp/s036-t1-assistent` | `261031-spec-036-t1-assistent` (lokaler Hilfsbranch) | BASIS | – | 1.3, 1.4, 1.5 |
| `/tmp/s036-t1-figma` | `261031-spec-036-t1-figma` (lokaler Hilfsbranch) | BASIS | – | 1.6 |
| `/tmp/s036-t2a` | `261031-spec-036-t2a-farbrollen` | BASIS / `main` | „Spec 036 Teil 2a – Farbrollen: unbunte Marken und Bildgewicht“ | 2.1, 2.3 |
| `/tmp/s036-t2b` | `261031-spec-036-t2b-zweitfarbe` | Kopf von 2a / `261031-spec-036-t2a-farbrollen` (D-18) | „Spec 036 Teil 2b – Farbrollen: Zweitfarbe (gestapelt auf 2a)“ | 2.2 |
| `/tmp/s036-t3` | `261031-spec-036-t3-buehne` | BASIS / `main` | „Spec 036 Teil 3 – Bühne“ | 3.1–3.7 |
| `/tmp/s036-t4` | `261031-spec-036-t4-uebernahme` | BASIS / `main` | „Spec 036 Teil 4 – Übernahme aus dem Material“ | 4.1–4.3 |
| `/tmp/s036-t5-2b2` | `261031-spec-036-t5-2b2` | BASIS / `main` (D-05) | „Spec 036 Teil 5 ②b-2 – Achsen und Werte (Spec 029)“ | ②b-2 |
| `/tmp/s036-t5-2b3` | `261031-spec-036-t5-2b3` | Kopf von ②b-2 / `261031-spec-036-t5-2b2` | „Spec 036 Teil 5 ②b-3 – Anatomie und Slots (gestapelt)“ | ②b-3 |
| `/tmp/s036-t5-2b4` | `261031-spec-036-t5-2b4` | Kopf von ②b-3 / `261031-spec-036-t5-2b3` | „Spec 036 Teil 5 ②b-4 – Verhalten (gestapelt)“ | ②b-4 |
| `/tmp/s036-t5-2b5` | `261031-spec-036-t5-2b5` | Kopf von ②b-4 / `261031-spec-036-t5-2b4` | „Spec 036 Teil 5 ②b-5 – kodbloko, Schrift, Form (gestapelt)“ | ②b-5 |
| `/tmp/s036-t5-3-doku` | `261031-spec-036-t5-3-doku` | Kopf von ②b-5 / `261031-spec-036-t5-2b5` | „Spec 036 Teil 5 ③ – Doku je Ero (gestapelt)“ | ③ |
| `/tmp/s036-t6` | `261031-spec-036-t6-neutrale-namen` | BASIS (oder das neueste `origin/main`, D-33) / `main` | „Spec 036 Teil 6 – neutrale Namen“ | 6.1–6.6 |
| `/tmp/s036-sim` | losgelöst, Arbeitsstand | – | – | Merge-Simulation (AC-15) |

Gestapelte Branches: Bekommt ein unterer Branch neue Commits, nachdem ein oberer begonnen hat, wird der obere vor seinem letzten Push auf den neuen Kopf des unteren neu aufgesetzt; seine roten Commits werden auf den neuen Elternteilen erneut als rot belegt.

## Zusammenfassung je Teil

### Teil 1 – Fehler aus der Abnahme

- **1.1** Pille nur für einzeilige Bedienelemente: –
- **1.2** „Eckiger“ von der Pille auf Stufe 2 (Spec 035 D-83 hier geändert): –
- **1.3** Nutzersprache im Chat: –
- **1.4** Weg C: Satz zu den gelesenen Seiten aus den Daten: –
- **1.5** Reste D-95, D-96, D-99: –
- **1.6** Figma: `elekto`, `markobutono`, `sxaltilo`, D-64 `datelektilo`: –
- **1.7** G5 kalibrieren: –

### Teil 2 – Farbrollen (2a, 2b)

- **2.1 (V-1)** Unbunte Marken: –
- **2.3** Bildgewicht in Weg C: –
- **2.2 (V-2)** Zweitfarbe: –

### Teil 3 – Bühne

- **3.1–3.3** Bühne, Vorher/Nachher-Schieber, Chat-Leiste: –
- **3.4–3.6** Material und Recherche im Dialog, Prüfung auf der Bühne, Tastatur und Screenreader: –
- **3.7** Messung: –

### Teil 4 – Übernahme aus dem Material

- **4.1–4.2** Vorschlag je Schritt mit Herkunft, Nicht-Messbares offen benannt: –
- **4.3** Prüfung mit synthetischen Bildern und lokal mit echten Marken: –

### Teil 5 – Spec 029 zu Ende

- **②b-2** Achsen und Werte: –
- **②b-3** Anatomie und Slots: –
- **②b-4** Verhalten: –
- **②b-5** `kodbloko`, Schrift, Form: –
- **③** Doku je Ero: –

### Teil 6 – Neutrale Namen

- **6.1–6.4** Neutrale Namen, Codemod, Übergang, `check:privat`: –
- **6.5** Commit-Identität: lokal gesetzt (siehe Kopf, D-15); Anleitung für den Maintainer im Bericht.
- **6.6** Privates Schriften-Repo bleibt, wie es ist: –

## Entscheidungen, vom Maintainer zu bestätigen

Der Lauf ist unbeaufsichtigt (R-1). Wo die Spec offen lässt, gilt der Vorschlag. **zu bestätigen** = angewandt, vom Maintainer zu bestätigen; **zu entscheiden** = Abweichung oder offene Frage, bei der der Lauf eine Wahl trifft und die Alternative nennt. Entscheidungen, die im Lauf fallen, stehen zuerst als `D-<Ticket>-<n>` in den Beiträgen der Tickets und kommen bei der Zusammenführung als D-35 ff. dazu (mit Zuordnung der vorläufigen Nummer).

### Vorschläge der Spec (V-1 bis V-3)

| ID | Frage | Vorschlag | Stand |
|---|---|---|---|
| V-1 | 2.1 Unbunte Marken | Eine Marke darf unbunt sein: Die Leitfarbe darf Schwarz bzw. ein sehr dunkles Neutral sein. Aktionen, Verweise und Fokus bleiben prüfbar (Kontrast, Unterscheidbarkeit von Text: Verweise brauchen dann ein zweites Merkmal, z. B. Unterstreichung – die Regel prüft es). Weg B und Weg C erkennen eine unbunte Marke und schlagen das vor, statt eine bunte Nebenfarbe zu nehmen. | vorgeschlagen · **zu bestätigen** |
| V-2 | 2.2 Zweitfarbe der Marke | Eine optionale Zweitfarbe als eigene Palette (Name nach dem Vortaro, z. B. `color.palette.sekundo`) mit wenigen Rollen: Flächen zur Hervorhebung, Illustration, Abzeichen, Diagramme – nicht Aktionen. Additiv: Marken ohne Zweitfarbe sehen pixelgleich aus. Faceto „Leitfarbe und Akzente“ bekommt die Zweitfarbe; Weg A, B und C setzen sie, wenn das Material sie hergibt, sonst bleibt sie leer. Projekcioj und Prüfungen ziehen nach; Vitrino zeigt eine Marke mit Zweitfarbe. | vorgeschlagen · **zu bestätigen** |
| V-3 | Teil 6 Neutrale Namen ohne fremde Domain | Schlüssel der Token-Erweiterung `fundamento`; Schema-IDs `urn:fundamento:schema:<name>`; Ontologie `urn:fundamento:ontologio`; das private Schriften-Repo nur noch über `FM_TIPAROJ_REPO`, Pfade, Archiv- und Ordnernamen neutral. | vorgeschlagen · **zu bestätigen** |

### Vorschläge des Auftrags (D-01 bis D-12)

| ID | Frage | Vorschlag | Stand |
|---|---|---|---|
| D-01 | Wo liegen spec, plan, tasks? | `specs/036-assistent-buehne/` nur im PR von Teil 1; die übrigen PRs verlinken auf diesen plan. Beiträge je Ticket zuerst außerhalb des Repos, ein Doku-Commit führt sie zusammen (wie Spec 035 D-01). | vorgeschlagen · **zu bestätigen** |
| D-02 | Teil 2 in einem oder zwei PRs? | Zwei: 2a = 2.1 unbunt + 2.3 Bildgewicht (Erkennung, Weg B/C, Regeln), 2b = 2.2 Zweitfarbe (Vortaro, Modelo, Projekcioj, Prüfungen, Vitrino). | vorgeschlagen · **zu bestätigen** |
| D-03 | Teil 4 und die Zweitfarbe | Teil 4 von `main`; die Zweitfarbe setzen Weg A/B/C in 2b. Teil 4 schlägt die übrigen Schritte vor (Neutraltöne, Schrift, Form, Elevation, Dichte) und führt die Zweitfarbe in seiner Tabelle mit Verweis auf 2b. Merge 2b vor 4. | vorgeschlagen · **zu bestätigen** |
| D-04 | Teil 4 und die Bühne | Vorschläge laufen über den vorhandenen `propono`-Weg (Spec 035 D-92). Ohne Teil 3 erscheinen sie in den zwei Rahmen „Jetzt“/„Mit dem Vorschlag“, mit Teil 3 auf der Bühne. Kein Stapel nötig; Merge 3 vor 4. | vorgeschlagen · **zu bestätigen** |
| D-05 | Teil 5: Stapel oder von `main`? | Ein Stapel ②b-2 → ②b-3 → ②b-4 → ②b-5 → ③, Basis von ②b-2 ist `main`. Wo ein Unterteil keine Datei mit seinem Vorgänger teilt, darf er von `main` gehen (hier begründet). | vorgeschlagen · **zu bestätigen** |
| D-06 | Teil 1 Punkt 6 (Figma) und ②b-2 berühren `elekto`, `markobutono`, `sxaltilo` | Teil 1 bleibt ein PR und wird zuerst gemergt; ②b-2 setzt nach dem Ende von Teil 1 auf und wird vor dem Push gegen Teil 1 mit `git merge-tree` geprüft. Konflikte hier. | vorgeschlagen · **zu bestätigen** |
| D-07 | Reihenfolge der Modellläufe bei knappem Budget | 1.3 Prüfung der Chat-Antwort (nur Attrappe, kein Modell) → 3.7 Abnahme 1 Weg A `--mit-modell` → 4 Material-Lauf → 2.3 Weg C vorher/nachher (lokal, synthetisch und Marke 2). Reservierung vor jedem Lauf im Ledger. | vorgeschlagen · **zu bestätigen** |
| D-08 | Zählt G5 zu den bekannten Zeittests (R-8)? | Ja, bis 1.7 gemergt ist. | vorgeschlagen · **zu bestätigen** |
| D-09 | Neuer Schlüssel und IDs (V-3) | Erweiterung `fundamento`, Schemata `urn:fundamento:schema:<name>`, Ontologie `urn:fundamento:ontologio`. Das private Schriften-Repo und sein lokaler Ordner werden nicht umbenannt (6.6); das öffentliche Repo erreicht sie nur über `FM_TIPAROJ_REPO` und, falls nötig, `FM_TIPAROJ_DIR`. Neutral benannt werden nur Namen, die das öffentliche Repo selbst erzeugt. | vorgeschlagen · **zu bestätigen** |
| D-10 | Ort der Prüfung `check:privat` | Als weitere Prüfung in `packages/modelo/src/checks/` (`node packages/modelo/dist/checks/run.js privat`) wie `clean-room` und `fontoj`; Skript `pnpm check:privat`; in der CI neben den übrigen Prüfungen. | vorgeschlagen · **zu bestätigen** |
| D-11 | Wo steht der Codemod? | `scripts/neutrale-namen/` (Muster `scripts/fonto-astryx/`), deterministisch und idempotent; ein zweiter Lauf ändert nichts. | vorgeschlagen · **zu bestätigen** |
| D-12 | Mockups der Bühne | Keine eigene Vitrino-Seite und kein HTML-Mockup; die Bühne wird direkt mit vorhandenen Eroj und Sxablonoj gebaut (Skizze 1 aus Spec 035). Bildschirmfotos vorher/nachher hier. | vorgeschlagen · **zu bestätigen** |

### Entscheidungen der Arbeitsteilung (D-13 bis D-34)

| ID | Frage | Vorschlag | Stand |
|---|---|---|---|
| D-13 | BASIS und ein bewegtes `main` | BASIS = `f2b5a058` (`origin/main` nach #129, beim Aufsetzen unverändert bestätigt). Bewegt sich `origin/main` während des Laufs, bleiben die Branches auf BASIS; die Merge-Simulation nennt Konflikte gegen das neue `main` und setzt Teil 6 darauf neu auf. | vorgeschlagen · **zu bestätigen** |
| D-14 | `spec.md` wortgleich gegen R-7 und R-12 | AC-1 geht für diese eine Datei vor (wie Spec 035 D-07): `spec.md` ist byte-gleich mit der Quelle, einschließlich des Worts aus R-12 und des Namens des privaten Schriften-Repos. Das Schutzwerkzeug nimmt nur `specs/036-assistent-buehne/spec.md` von der Marken- und R-12-Regel aus, nie von der Schlüsselregel; `check:privat` führt sie als Ausnahme. | vorgeschlagen · **zu bestätigen** |
| D-15 | Commit-Identität (6.5) | `189642209+thojank@users.noreply.github.com` in der lokalen Konfiguration des Repos des Laufs (gemeinsames Git-Verzeichnis aller Worktrees), vor dem ersten Commit; nicht global, nicht im Checkout des Maintainers, keine Änderung der Historie; gilt für jeden Worktree dieses Repos. | vorgeschlagen · **zu bestätigen** |
| D-16 | Teil 1 parallel | Drei lokale Hilfsbranches (Form/G5, Assistent, Figma) parallel; Zusammenführung per Rebase in der Reihenfolge Form/G5 → Figma → Assistent; rote Commits auf den neuen Elternteilen erneut belegt. | vorgeschlagen · **zu bestätigen** |
| D-17 | Wann starten die Spuren? | Spuren Marke, Assistent und Eroj starten, wenn der PR von Teil 1 steht (sie teilen Dateien mit Teil 1, D-06); Spur Namen startet direkt nach dem Aufsetzen („jederzeit“, Teil 6 wird ohnehin zuletzt neu erzeugt). | vorgeschlagen · **zu bestätigen** |
| D-18 | 2b gestapelt auf 2a | 2b setzt auf 2a auf (gemeinsam: `enportilo/{farboj,rekono,trovo}.ts`, `esploro.ts`, `kreilo.json`). Rückfall, falls 2a blockiert: 2b von BASIS. | vorgeschlagen · **zu bestätigen** |
| D-19 | Teil 4 und Teil 3 | Teil 4 zweigt von BASIS ab (D-03/D-04), wird in der Spur Assistent aber nach Teil 3 bearbeitet; Teil 4 bringt neue Module und berührt gemeinsame Dateien nur mit Verdrahtungszeilen. | vorgeschlagen · **zu bestätigen** |
| D-20 | Zweitfarbe und Art. IV (vollständige Belegung jedes Aspekto) | Die Zweitfarbe wird als vollständige, additive Tokens angelegt; jedes Aspekto im Repo belegt sie. Marken ohne Zweitfarbe verweisen auf vorhandene Werte und sehen pixelgleich aus; das Agordo-Feld bleibt leer, die Oberfläche sagt „keine Zweitfarbe“. Bestehende Ausgabezeilen bleiben byte-gleich, neue Variablen kommen dazu. Abweichung von der technical-spec („keine zusätzlichen Tokens“). Alternative: eine optionale Gruppe plus Amendment von Art. IV. | vorgeschlagen · **zu entscheiden** |
| D-21 | Modellläufe | Reservierungen beim Aufsetzen in der Reihenfolge D-07 (sieben Läufe, zusammen 0,10 $); jedes Ticket fährt seinen Lauf selbst; Listenpreis aus `packages/metiejo/data/prezoj.json`. | vorgeschlagen · **zu bestätigen** |
| D-22 | Braucht es `FM_TIPAROJ_DIR`? | Nein (vorläufig): Kein Code nutzt den Namen des privaten Schriften-Repos als Pfad, der Cache-Ordner trägt einen Hash. Im Bericht: „In der `.env` ist nichts einzutragen.“ Teil 6 prüft das auf seinem Stand erneut. | vorgeschlagen · **zu bestätigen** |
| D-23 | Wie kennen Prüfung und Skript die alten Namen? | `check:privat` vergleicht Hashes von Wörtern und enthält kein Klartext-Wort; Codemod, Leser für alte Namen und Fixtures im alten Format setzen die alten Zeichenketten zur Laufzeit zusammen. Ausnahmen: wortgleiche, per SHA-256 in den Doku-Tests festgehaltene Spec-Kopien und `specs/036-assistent-buehne/spec.md`, je mit Grund; fehlende Dateien der Liste werden toleriert. | vorgeschlagen · **zu bestätigen** |
| D-24 | Das Wort aus R-12 außerhalb der Token-Daten | Der Codemod schreibt auch LICENSE und README (Name des Autors ohne Domain), `docs/vojmapo.md`, ältere nicht wortgleiche plan/tasks/research und Testaussagen (über eine Hilfsfunktion) um. Die Constitution ändert sich als „Constitution Amendment v2.6 (redaktionell)“, hier festgehalten: Version 2.5 → 2.6 mit Eintrag in der Historie; das Beispiel eines Aspekto-Namens wird zu einem neutralen „privates Aspekto-Paket“; kein Grundsatz ändert sich, keine Migration. Alternative: die Constitution auf die Ausnahmeliste bis zu einer eigenen Amendment-Spec. | vorgeschlagen · **zu bestätigen** |
| D-25 | Zuordnung der IDs | Erweiterungsschlüssel `fundamento`; Schemata `urn:fundamento:schema:<pfad>` (z. B. `…:modelo`, `…:config`, `…:mcp:common`); Ontologie `urn:fundamento:ontologio` (Fragmente bleiben). Relative Verweise zwischen Schemadateien gibt es danach nicht (Test). | vorgeschlagen · **zu bestätigen** |
| D-26 | Erzeugte und geteilte Dateien zwischen parallelen PRs | `ids.lock.json`, Gruppe `ero`, Aspekto-Sets, `deveno.json`, erzeugte Schema-Typen und `CHANGELOG.md` werden nie von Hand gemischt, sondern neu erzeugt bzw. mit beiden Einträgen übernommen; das Rezept steht im Bericht. | vorgeschlagen · **zu bestätigen** |
| D-27 | Echte Marken | Eingaben werden an Ort und Stelle gelesen (Markenordner des Maintainers, Adressen unter `.fundamento/spec035/marken/`); Ergebnisse nur unter `.fundamento/spec036/marken/` im Checkout des Maintainers; hier anonym („Marke 1“, „Marke 2“). | vorgeschlagen · **zu bestätigen** |
| D-28 | 6.6 Vergleich der Familien | Über ein Hilfsskript außerhalb des Repos, das in jedem Baum die gebauten Leser von Einstellungen, Cache und bekannten Schriften mit dem Checkout des Maintainers aufruft; die `.env` wird nur an Ort und Stelle gelesen; berichtet werden nur Zahl und „gleich ja/nein“. | vorgeschlagen · **zu bestätigen** |
| D-29 | Größe von Teil 5 | ②b-2, ②b-3 und ③ je in zwei Tickets auf demselben Branch, ②b-4 und ②b-5 je eins; ein PR je Unterteil. Kurzprofile bleiben unter 750 Tokens: neue ③-Felder gehen in die volle Antwort von `get_ero`, ins Kurzprofil nur, wenn gemessen unter 750. | vorgeschlagen · **zu bestätigen** |
| D-30 | AC-10 Pixelgleichheit | Web: reproduzierbarer Vergleich zweier Commits auf demselben Rechner und Chromium, PNG byte-gleich (Werkzeug `ac10` außerhalb des Repos, wie Spec 035 D-09); Figma über den committeten Bildtest; keine PNG-Referenzbilder im Repo. | vorgeschlagen · **zu bestätigen** |
| D-31 | Bekannte Zeittests (R-8) | M5, Gegenprobe 2, Ableitung, G5 (D-08); G5 zählt auf jedem Kopf ohne 1.7. | vorgeschlagen · **zu bestätigen** |
| D-32 | CI und Neustarts | Nur das Sammeln am Ende startet Jobs neu (über das R-8-Ledger); kein Push auf einen Branch, solange dort ein Neustart läuft; Branches werden erst am Ende ihres Tickets gepusht. | vorgeschlagen · **zu bestätigen** |
| D-33 | Teil 6 vor der Übergabe | Teil 6 wird neu aufgesetzt: seine Commits außer dem Skript-Lauf auf das aktuelle `origin/main` übertragen, Skript erneut ausführen, ein Lauf-Commit; in der Merge-Simulation, falls `origin/main` sich bewegt hat, sonst auf dem simulierten Endstand belegt. | vorgeschlagen · **zu bestätigen** |
| D-34 | Bildschirmfotos der Bühne (3.7) | Nur mit einer erfundenen Marke; Ablage in `specs/036-assistent-buehne/bilder/` auf dem Branch von Teil 1, von hier verlinkt. | vorgeschlagen · **zu bestätigen** |

### Entscheidungen aus dem Lauf (D-35 ff.)

–

## Constitutional Compliance Review

Folgt mit der Zusammenführung am Ende des Laufs. Zu prüfen sind mindestens: Art. IV Nativa Multmarkeco (Zweitfarbe als vollständige Belegung jedes Aspekto, D-20), Art. V Pura Cxambro (echte Marken nur lokal, keine Markenwerte im Repo), Art. VI Regularo kun Kialoj (Verweis-Regel mit zweitem Merkmal, Ablehnung der Zweitfarbe als Aktion), Art. X Kontrolo kaj Konformeco (rot vor grün je Befund), Art. XIII Simpleco de Uzo (Nutzersprache im Chat) und Governance (Constitution Amendment v2.6 redaktionell, D-24).

–

## Bildtests als gewollte Änderung neu gesetzt

Jede Bildabweichung, die nicht in dieser Tabelle steht, ist ein Fehler (R-5, AC-10). Je Befund ein eigener Commit „Bildtest neu: …“.

| Befund | Test / Datei | Komponenten und Zustände | Grund | Commit |
|---|---|---|---|---|
| 1.1 | – | – | – | – |
| 1.6 | – | – | – | – |
| ②b-2 | – | – | – | – |
| ②b-3 | – | – | – | – |
| ②b-4 | – | – | – | – |
| ②b-5 | – | – | – | – |

## Messungen

### AC-10 Pixelgleichheit (D-30)

Vergleich zweier Commits auf demselben Rechner und Chromium (`ac10`): Ero-Abschnitte der Vitrino hell und dunkel für jede vorhandene Marke, Beispiel-Markups der bestehenden Tests, Vorschauen der Metiejo mit einer erfundenen Marke; PNG byte-gleich.

| Teil | Commit vorher | Commit nachher | Seiten/Zustände | gleich n/n | Befehl |
|---|---|---|---|---|---|
| 2a | – | – | – | – | – |
| 2b | – | – | – | – | – |
| ②b-2 bis ②b-5 | – | – | – | – | – |

### G5 je Runner (1.7)

–

### Weg C vorher und nachher (2.3, lokal, Zusammenfassung)

Echte Marken nur lokal unter `.fundamento/spec036/marken/` im Checkout des Maintainers; hier nur die Zusammenfassung ohne Bilder und ohne Werte.

–

### Bühne vorher und nachher (3.7, D-34)

–

### Übernahme je Schritt (4.3)

| Schritt | vorher vorgeschlagen | nachher vorgeschlagen | getroffen |
|---|---|---|---|
| Leitfarbe | – | – | – |
| Zweitfarbe | – | – | – |
| Neutraltöne | – | – | – |
| Schrift | – | – | – |
| Form | – | – | – |
| Elevation | – | – | – |
| Dichte | – | – | – |

### Kurzprofile (Teil 5)

–

### `check:privat` und Codemod (Teil 6)

–

### Modellkosten

Nur `ministral-14b-2512`, zusammen höchstens 0,50 $. Preis aus `packages/metiejo/data/prezoj.json` (0,20 $ je 1 Mio. Tokens ein und aus). Reservierungen beim Aufsetzen in der Reihenfolge D-07 (D-21).

| Lauf-ID | Zweck | Anfragen | Tokens ein/aus | Kosten $ | Dauer | Commit |
|---|---|---|---|---|---|---|
| 3.7-weg-a | 3.7 Abnahme 1, Weg A `--mit-modell` | – | – | reserviert 0,02 | – | – |
| 4-material-synth | 4 Material-Lauf, synthetisch | – | – | reserviert 0,02 | – | – |
| 4-material-marken | 4 Material-Lauf, echte Marken lokal | – | – | reserviert 0,02 | – | – |
| 2.3-weg-c-synth-vorher | 2.3 Weg C, synthetisch, vorher | – | – | reserviert 0,01 | – | – |
| 2.3-weg-c-synth-nachher | 2.3 Weg C, synthetisch, nachher | – | – | reserviert 0,01 | – | – |
| 2.3-weg-c-marke2-vorher | 2.3 Weg C, Marke 2 lokal, vorher | – | – | reserviert 0,01 | – | – |
| 2.3-weg-c-marke2-nachher | 2.3 Weg C, Marke 2 lokal, nachher | – | – | reserviert 0,01 | – | – |
| | **Summe** | | | **0,00 gebucht, 0,10 reserviert** | | |

## Messanleitung je Teil

Alles im Checkout des Maintainers `/Users/thorstenjankowski/n8n-compose/20260918_fundamento-ds` (mit `cd`, vollständigen Pfaden und `file://`-Links).

### Teil 1

–

### Teil 2

–

### Teil 3

–

### Teil 4

–

### Teil 5

–

### Teil 6

–

## Merge-Reihenfolge mit Konfliktprüfung

Vorgeschlagen (die Simulation mit `git merge-tree` bestätigt oder ändert sie): Teil 1 → 2a → 2b → ②b-2 → ②b-3 → ②b-4 → ②b-5 → ③ → Teil 3 → Teil 4 → **Teil 6** (vorher auf dem dann aktuellen `main` durch erneutes Ausführen des Skripts neu aufgesetzt). Gründe: Teil 1 ist klein und berührt alle Spuren; 2b vor Teil 4 (D-03) und vor Teil 5 (beide `core.json`); Teil 3 vor Teil 4 (D-04); Teil 6 zuletzt.

Erzeugte oder geteilte Dateien (D-26) werden nicht von Hand gemischt: `packages/modelo/data/ids.lock.json`, Gruppe `ero` in `packages/vortaro/sets/core.json` und Aspekto-Sets, `deveno.json`, `packages/modelo/src/generated/modelo-schema.ts`, `CHANGELOG.md`.

–

## Private Schriften und `.env`

Vorläufig (D-22): Das private Schriften-Repo und sein lokaler Ordner werden nicht umbenannt; das öffentliche Repo erreicht sie nur über `FM_TIPAROJ_REPO`. In der `.env` ist nach heutigem Stand nichts einzutragen. Teil 6 prüft das auf seinem Stand und vergleicht die Liste der Familien vor und nach dem Skript (nur Zahl und „gleich ja/nein“).

–

## Blockiert

–

## Bericht

Folgt am Ende des Laufs (Format wie Spec 035).

### Kopf

–

### PRs je Teil

–

### Messanleitung je Teil

–

### Befunde

–

### Entscheidungen

–

### Messungen

–

### Neustarts bekannter Zeittests (R-8)

–

### `main`

–

### Prüfung gegen die Abnahmekriterien

–

### Merge-Reihenfolge mit Konfliktprüfung

–

### Private Schriften und `.env` (6.6)

–

### Was der Maintainer in welcher Reihenfolge tun soll

–
