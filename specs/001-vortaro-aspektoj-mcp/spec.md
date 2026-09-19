# Spec 001 – Vortaro mit echten Werten, Aspekto-Pakete, MCP-Server

**Branch:** `001-vortaro-aspektoj-mcp` · **Status:** Ready for /speckit.plan, revidiert 2026-09-19 (Klärungen Q1, Q2, Q4 und K3 aus `plan.md`) · **Constitution:** v1.3 · **Erstellt:** 2026-09-19 · **Voraussetzung:** Spec 000 auf `main` (`6e517c6`), CI grün

## Zweck

Phase 1 macht aus dem Fundament ein benutzbares Token-System. Drei Dinge entstehen: (1) ein vollständiges Vortaro mit echten Werten, gemessen an der Abdeckungs-Checkliste reifer Systeme; (2) die Referenzmarke **Komuna** als erstes Aspekto-Paket plus die Fähigkeit, Aspektoj von außerhalb des Repos einzubinden, nachgewiesen mit der proprietären Marke **ciferecigo** in einem privaten Repo; (3) der MCP-Server als erste Schnittstelle des Systems, über den ein Agent alles fragen kann, was das Modelo weiß.

Diese Spec ist zugleich das **Constitution Amendment auf v1.3** (Artikel IV, V, VI; siehe „Constitution-Änderungen"). Technologieauswahl wie in Spec 000 (`global/tech-stack.md`); der MCP-Server nutzt das offizielle TypeScript-SDK des Model Context Protocol.

## Nicht im Scope

- Eroj, Skemoj, Sxablonoj → Phase 3/4
- Gvidanto als Agent mit eigener Dialogführung → Phase 2; Phase 1 liefert nur die MCP-Werkzeuge, die er braucht
- Generatoren für CSS, Tailwind, Figma, Penpot → ab Phase 5; Phase 1 liefert die Daten und die Namensableitung, keine Dateien
- Enportilo (Brand-Import) → Phase 7; `ciferecigo` wird in Phase 1 von Hand als Aspekto-Paket angelegt, und dieser Vorgang ist der Vorlauf für den Enportilo
- Fontdateien im Kern-Repo; Geist wird referenziert, nicht mitgeliefert → Phase 5 (Asset-Pipeline)
- Icons → Phase 5

---

## Nutzerszenarien

### S1 – Vollständiges Vortaro (Modelo-Autor)

Ein Autor öffnet das Vortaro und findet jede Token-Kategorie, die ein reifes System hat: semantische Farben mit Zuständen, Primitivpaletten in Stufen, Typografie-Rollen als Composites, Abstands- und Größenskalen, Form, Elevation, Bewegung, Layout, Fokus, Opazität. Für jede Kategorie aus `research.md` (Spec 000, §4) gibt es Tokens; die Abdeckung ist als Test formuliert, der fehlschlägt, wenn eine Kategorie leer ist.

*Warum:* Artikel IX. Der Button-Durchstich in Phase 3 darf keine Tokens mehr erfinden müssen; alles, was er braucht, muss hier schon liegen.

### S2 – Komuna als vollständige Referenz (Modelo-Autor, Designer)

`komuna` ist die Referenzmarke von Fundamento: ruhig, neutral, ohne Signaturfarbe, mit der Schrift **Geist** (OFL). Ihre Werte liegen im Kern (`core`), das Set `aspekto/komuna` ist leer, und das Modelo weiß, dass `komuna` die Kern-Referenz ist. In jeder Kombination der sechs Dimensioj hat jeder Token einen Wert; die Alirebleco-Prüfung besteht in allen Kombinationen, in `contrast=high` auf AAA.

*Warum:* Artikel IV. Ohne eine ehrliche, vollständige Referenz lässt sich Vollständigkeit anderer Marken nicht messen.

### S3 – Ein zweiter Aspekto ist vollständig oder ungültig (Modelo-Autor)

Ein Autor legt einen zweiten Aspekto an. Sein Set muss **jeden** Token des Kerns überschreiben; fehlt einer, schlägt die Validierung mit der Liste der fehlenden Tokens fehl (`aspekto-incomplete`). Ein Aspekto darf keine Tokens einführen, die der Kern nicht kennt (Regel aus Spec 000). Er darf zusätzlich Konjunktions-Sets mitbringen (`aspekto/X+color-scheme/dark`, `aspekto/X+contrast/high`, …), die nur die Tokens überschreiben, die sich in dieser Kombination ändern.

*Warum:* Artikel IV. So erbt keine Marke stillschweigend Werte einer anderen. Ein vergessenes Token fällt in der Validierung auf, nicht beim Kunden.

### S4 – Externes Aspekto-Paket (Markeninhaber)

Die Marke `ciferecigo` liegt in einem eigenen privaten Repository (`thojank/fundamento-aspekto-ciferecigo`) mit eigener Lizenz. Sie hat dieselbe Paketstruktur wie `komuna`: `aspekto.json` (Metadaten: Name, Eigentümer, Lizenz, Schriftlizenzhinweis), `sets/` (das Aspekto-Set und Konjunktions-Sets), eigene IDs in einer eigenen `ids.lock.json` mit eigenem Präfix-Namensraum. Ein Fundamento-Projekt bindet sie über eine Konfigurationsdatei ein (`fundamento.config.json`: Liste der Aspekto-Pakete); Validierung, Auflösung, Prüfungen und Export behandeln externe Aspektoj genau wie interne. Die Schrift N27 wird als Familienname mit Fallback-Stack referenziert; keine Fontdatei liegt im Kern-Repo, und der Kern baut ohne das externe Paket.

*Warum:* Artikel IV und V. Eine Unternehmensmarke muss Fundamento nutzen können, ohne etwas offenzulegen, und der Kern darf nie von einer proprietären Marke abhängen. Das ist zugleich das Ziel-Format für den Enportilo (Phase 7): Was er erzeugt, ist genau ein solches Paket.

### S5 – Typografie, die Marken tragen kann (Designer)

Die Typografie-Rollen des Vortaro (Display, Headline in Stufen, Body, Label, Caption, Code, Kicker) sind Composites mit Familie, Größe, Gewicht, Zeilenhöhe, Laufweite und Textumwandlung. Sie sind je Aspekto und je Dimensio überschreibbar: `komuna` nutzt moderate Werte; `ciferecigo` setzt Display-Rollen auf Gewicht 100–200, Zeilenhöhe unter 0,8 und negative Laufweite, Kicker in Versalien mit positiver Laufweite. Beides ist ohne Schemaänderung ausdrückbar, und `viewport` verändert Größen, Zeilenhöhen und Laufweiten; `density` verändert keine Typografie (Regulo `density-affects-layout-only`).

*Warum:* Artikel IV („Adaption in allen Aspekten"). Eine Marke, deren Charakter in der Typografie liegt, ist der harte Testfall für das Token-Schema; Farbe allein beweist nichts.

### S6 – Agent fragt das System (Agent, Entwickler)

Ein Agent verbindet sich mit dem MCP-Server `@fundamento/mcp` und kann ohne Repo-Zugriff:

- die Übersicht abrufen („was gibt es hier": Dimensioj, Aspektoj, Token-Anzahl je Typ, Regeln, Eroj)
- Dimensioj mit Werten, Standard und Priorität auflisten
- Tokens suchen (nach Pfadpräfix, Typ, Rolle) und einen Token mit Beschreibung, Typ, Rohwert und Alias abrufen
- eine Belegung auflösen und für jeden Token Endwert und Herkunft erhalten („warum ist dieser Wert dunkel?")
- Regeln mit Kialo und Jugxoj lesen
- ein Modelo oder ein Aspekto-Paket validieren und das Ergebnis als Issues erhalten
- einen Namen für ein Celo ableiten (`color.action.primary.rest` → CSS/Figma/TypeScript/Tailwind)

Alle Antworten sind JSON mit stabilen Feldnamen; der Server ist in Phase 1 **lesend** (keine Mutation des Modelo).

*Warum:* Artikel III. Der MCP-Server ist die erste Schnittstelle, nicht die letzte; der Gvidanto (Phase 2) und die Design-Agenten (Phase 8) bauen darauf auf.

### S7 – Beispieldialog (Gvidanto-Vorstufe)

Aus den MCP-Antworten allein muss sich dieser Dialog bilden lassen:

> „Was gibt's hier?" → „Fundamento v0.1.0: sechs Dimensioj, zwei Aspektoj (`komuna`, Referenz unter MIT mit Geist; `ciferecigo`, extern, proprietär mit N27), N Tokens in M Typen (Anzahl je Token-Gruppe: color …, typography …, …), K Regeln mit Begründung, eine Jugxo, keine Eroj."
> „Welche Farbe hat primärer Text in ciferecigo im Dark Mode?" → „`color.text.default` = `#f1efe9`, aus Set `aspekto/ciferecigo+color-scheme/dark`, Alias auf `color.palette.neutral.50`."
> „Warum gibt es keine Schatten in ciferecigo?" → „Regel `elevation-flat-brand` (Kialo: Die Marke arbeitet mit Fugen und Linien statt Tiefe; Schatten würden die Flächigkeit brechen). `elevation.*` ist in `aspekto/ciferecigo` auf `none` gesetzt."

*Warum:* Artikel VII. Die Doku ist das Modelo, gelesen durch einen Agenten.

---

## Funktionale Anforderungen

### Vortaro
- FR-01: Abdeckung aller Kategorien aus `research.md` (Spec 000, §4) als Test; jede Kategorie hat mindestens die dort genannten Rollen/Stufen. Erwarteter Umfang: 250–400 Tokens im Kern.
- FR-02: Primitivpaletten als Stufen (`color.palette.<name>.<50…950>`), semantische Farben nur als Aliasse auf Primitive (Regulo `semantic-colors-alias-palette` aus Phase 0 wird erzwungen, nicht nur dokumentiert).
- FR-03: Zustände als eigene Pfadsegmente (`rest`, `hover`, `pressed`, `focus`, `disabled`, `selected`), keine Zustandssuffixe im Namen.
- FR-04: Typografie-Rollen als `typography`-Composites mit `fontFamily`, `fontSize`, `fontWeight`, `lineHeight`, `letterSpacing`, `textTransform` (letzteres als `$extensions`-Feld, da DTCG es nicht kennt; Ableitung als CSS `text-transform`). Rollen mindestens: `display.1–3`, `headline.1–4`, `body.1–2`, `label.1–2`, `caption`, `code`, `kicker`.
- FR-05: `fontFamily`-Tokens tragen einen Stack (`["Geist", "system-ui", "sans-serif"]`); Fontdateien liegen nicht im Kern-Repo. Lizenz und Bezugsquelle je Familie stehen in den Aspekto-Metadaten (FR-11).
- FR-06: `motion`-Tokens: Dauern (`fast`, `medium`, `slow`, `deliberate`) und Easings (`standard`, `emphasized`, `enter`, `exit`); `motion=reduced` setzt Dauern auf `0ms` und Easings auf `linear`.
- FR-07: `layout`-Tokens je `viewport`: Spalten, Gutter, Rand, Container-Maximalbreite; `density` skaliert Spacing und Komponentenhöhen über Aliasse, nicht über neue Werte.
- FR-08: Rollen-Annotationen (`$extensions["com.ciferecigo.fundamento"].role`) für alle Farb-Tokens, und KontrastParoj für jede Text-/UI-auf-Hintergrund-Kombination, die das Vortaro definiert (Regulo `contrast-pairs-declared` wird erzwungen).

### Aspektoj
- FR-09: `komuna` wird die Referenzmarke: Umbenennung des Phase-0-Wertes `neutra` → `komuna` bei unveränderter ID (Nachweis der ID-Stabilität; ein Test prüft, dass die ID gleich blieb und `ids.lock.json` keine neue ID enthält).
- FR-10: Das Modelo markiert genau einen Aspekto als Kern-Referenz (`core.referenceAspekto = "komuna"`); sein Set ist leer, seine Werte liegen im Kern. Jeder andere Aspekto muss vollständig sein: Validierung `aspekto-incomplete` listet fehlende Tokens. Konjunktions-Sets eines Aspekto sind davon ausgenommen (sie überschreiben nur Deltas).
- FR-11: Aspekto-Paket-Format: Ordner mit `aspekto.json` (Schema: `id`, `name`, `owner`, `license` (SPDX oder `proprietary`), `fonts[]` mit `family`, `license`, `source`, `redistributable`), `sets/aspekto/<name>.json` und optionale `sets/aspekto/<name>+<dimensio>/<valoro>.json`, eigene `ids.lock.json` mit Paket-Präfix im ID-Namensraum (`tok_cif_…` o. ä., Plan entscheidet), `$themes.json`-Fragment. `komuna` liegt als `packages/aspekto-komuna` im Kern-Repo und nutzt dasselbe Format.
- FR-12: Einbindung externer Aspektoj über `fundamento.config.json` (Liste von Paketpfaden oder npm-Namen). Validierung, Auflösung, Prüfungen und Export laufen über Kern + alle konfigurierten Aspektoj; der Kern baut und besteht ohne externe Pakete.
- FR-13: `ciferecigo` als externes Paket im privaten Repo `thojank/fundamento-aspekto-ciferecigo`: vollständiges Set, Konjunktions-Sets für `color-scheme/dark` und `contrast/high`, Metadaten mit `license: proprietary`, Font `N27` (`redistributable: false`, Fallback-Stack). Werte laut Anhang A. Das Paket wird von P0 im Kern-Workspace angelegt und dann in das private Repo überführt; im Kern-Repo bleibt nur ein Testfixture mit einem **fiktiven** externen Aspekto (`aspekto-ekzemplo`), damit CI den externen Pfad prüft, ohne ciferecigo zu enthalten.
- FR-14: Die IDs aller Phase-0-Tokens bleiben erhalten; neue Tokens erhalten neue IDs über `id:new`; keine `retired`-IDs in Phase 1.

### MCP-Server
- FR-15: Paket `@fundamento/mcp`, Transport stdio (Standard) und optional HTTP; Start mit `fm mcp` (CLI-Skelett aus Phase 0 wird erweitert) oder `npx @fundamento/mcp`.
- FR-16: Werkzeuge (Tools), alle lesend, mit JSON-Schema für Ein- und Ausgabe: `describe`, `list_dimensioj`, `list_aspektoj`, `search_tokens`, `get_token`, `resolve`, `list_reguloj`, `list_jugxoj`, `validate`, `derive_name`. Ressourcen: `modelo.json`, `modelo.schema.json`, `rezolvoj.json` als lesbare Ressourcen.
- FR-17: Der Server arbeitet auf dem Export (`modelo.json` + konfigurierte Aspektoj), nicht auf dem Quellbaum; er startet in unter zwei Sekunden und antwortet auf `resolve` für eine Belegung in unter 100 ms.
- FR-18: Fehler sind strukturiert (gleiche Issue-Form wie die Prüfungen); unbekannte Dimensio-Werte liefern die erlaubten Werte zurück.

### Constitution-Änderungen (Amendment auf v1.3)
- FR-19: Artikel IV: Aspekto-Vollständigkeit, Kern als Referenz, Aspektoj als Pakete innerhalb oder außerhalb des Repos. Artikel V: proprietäre Schriften je Aspekto erlaubt, referenziert statt mitgeliefert. Artikel VI: Jugxo darf auf einen Constitution-Artikel verweisen. Migration: keine Artefakte betroffen außer der Umbenennung `neutra` → `komuna` (FR-09).

---

## Key Entities (neu oder geändert gegenüber Spec 000)

| Entität | Beschreibung | Wichtige Felder |
|---|---|---|
| **AspektoPakajxo** | Ein Aspekto als Paket | `aspekto.json` (id, name, owner, license, fonts[]), Sets, eigene `ids.lock.json` |
| **Fonto** (Schrift) | Referenz auf eine Schriftfamilie | `family`, `license`, `source`, `redistributable`, Fallback-Stack |
| **Konfiguro** | `fundamento.config.json` | Ausschließlich die Liste der Aspekto-Pakete; der Referenz-Aspekto steht nur im Modelo (`core.referenceAspekto`, FR-10) |
| **Tipografio-Rolo** | `typography`-Composite | Familie, Größe, Gewicht, Zeilenhöhe, Laufweite, Textumwandlung |
| **MCP-Ilo** | Ein MCP-Werkzeug | Name, Eingabe-Schema, Ausgabe-Schema, lesend |

---

## Constraints

- Neue Pakete: `@fundamento/aspekto-komuna`, `@fundamento/mcp`; `packages/vortaro` bleibt der Kern. Höchstens drei neue Pakete (Artikel XI): es sind zwei.
- MCP über das offizielle TypeScript-SDK, keine eigene Protokollimplementierung (Artikel XI).
- Geist unter OFL 1.1 (Quelle in `research.md`); im Kern-Repo nur der Familienname, keine Dateien.
- ciferecigo-Werte (Anhang A) dürfen im Kern-Repo nur in dieser Spec und in `research.md` stehen, nicht in Code, Daten oder Fixtures (Artikel V gilt sinngemäß auch für die eigene proprietäre Marke; das Fixture nutzt erfundene Werte).
- Test-first mit rotem Lauf vor der Implementierung (Jugxo `jug_01M2VRT7KQ77W91MVXB4GXSRZ4`).

---

## Edge Cases

- **Externes Aspekto-Paket fehlt** (Pfad in der Konfiguration existiert nicht): Fehler mit Pfad; der Kern bleibt ohne dieses Paket gültig.
- **Zwei Aspektoj mit gleichem Namen** aus verschiedenen Paketen: Fehler.
- **ID-Kollision** zwischen Kern-Registry und Aspekto-Registry: Fehler; Präfix-Namensräume verhindern das by design, die Validierung prüft es trotzdem.
- **Aspekto überschreibt einen Token mit anderem `$type`**: Fehler (Regel aus Spec 000).
- **Aspekto ohne Konjunktions-Set für `dark`**: gültig; das generische `color-scheme/dark` hängt die semantischen Farben auf andere Stufen der rollenbenannten Kern-Paletten (`neutral`, `accent`, `success`, …) um, und diese Stufen hat der Aspekto vollständig belegt (spätes Binden). Ein Aspekto führt keine eigenen Paletten ein: Eine Marke belegt `accent` mit ihrer Signalfarbe, statt eine Palette nach der Farbe zu benennen (S3).
- **Konjunktions-Set-Approximation in `$themes.json`** (aus Phase 0): Mit zwei Aspektoj wird sie sichtbar. Der Export erzeugt `$themes.json` je Aspekto getrennt (ein Tokens-Studio-/Penpot-Import je Marke), sodass die Approximation innerhalb einer Marke bleibt. Dokumentiert in `research.md`.
- **`viewport` und `density` verschieben nie denselben Token.** `density` betrifft nur Layout-Kompaktheit (Spacing, Komponentenhöhen), `viewport` die Typografie; sonst hinge das Ergebnis von der Prioritätsreihenfolge ab.
- **MCP-Client fragt nach Aspekto, der nicht konfiguriert ist**: Antwort mit Liste der verfügbaren Aspektoj.

---

## Akzeptanzkriterien

- AK-01: Abdeckungstest (FR-01) grün; jede Kategorie aus `research.md` §4 hat Tokens; die Liste der Kategorien steht als Fixture im Test, nicht im Modelo.
- AK-02: `komuna` besteht Alirebleco in allen Kombinationen; in `contrast=high` liegt jedes Text-Paar über 7:1.
- AK-03: Fixture eines unvollständigen Aspekto schlägt mit `aspekto-incomplete` und der Liste fehlender Tokens fehl; Fixture eines vollständigen fiktiven externen Aspekto (`aspekto-ekzemplo`) besteht und wird über `fundamento.config.json` eingebunden.
- AK-04: Die ID von `neutra`/`komuna` ist vor und nach der Umbenennung identisch (Test gegen `ids.lock.json` aus `6e517c6`).
- AK-05: Typografie-Rollen sind in `komuna` und im externen Fixture unterschiedlich belegt (Gewicht, Zeilenhöhe, Laufweite) und in `viewport=compact` verändert, in `density=compact` unverändert; Auflösung mit Herkunft zeigt das je Feld.
- AK-06: MCP-Server startet, alle zehn Werkzeuge antworten mit schema-konformem JSON; ein Integrationstest spielt den Dialog aus S7 mit dem Fixture-Aspekto durch und rechnet jede Aussage aus den Antworten nach.
- AK-07: `resolve` unter 100 ms, Start unter 2 s (gemessen im Test, mit Toleranz für CI).
- AK-08: Kern-Repo enthält keine ciferecigo-Werte außerhalb von Spec und Research (Clean-Room-Prüfung erweitert um eine Allowlist der Dateien, die Markenwerte enthalten dürfen).
- AK-09: `plan.md` mit Compliance Review gegen Constitution v1.3; Penpot-Import je Aspekto dokumentiert (Ergebnis darf „mit Abweichungen" sein).
- AK-10: Byte-identischer Export bei zweimaligem Build, mit und ohne externes Paket.
- AK-11: Keine `[NEEDS CLARIFICATION]` offen.

---

## Anhang A – ciferecigo (Werte für das private Aspekto-Paket)

Quelle: `assets/style.css` der Website ciferecigo.de, Stand 2026-09. Diese Werte gehen **nur** in das private Paket.

| Bereich | Wert |
|---|---|
| Signalfarbe | `#ff5a00` (einzige Akzentfarbe; Aktion, Hervorhebung, Flächen) |
| Ink (Text/Dunkel) | `#10100f` |
| Paper (Hintergrund) | `#deddd8` |
| Light (heller Hintergrund/Text auf Dunkel) | `#f4f2ed` |
| Linie | Ink mit 22 % Deckung |
| Fehler | `#b43112` |
| Dark Mode | Ink `#f1efe9`, Paper/Light `#111110`, Linie Ink 22 %; Signalfarbe unverändert |
| Schrift | N27 (100, 200, 300, 400, 500, 700; Italic 300, 700), proprietär, Fallback `Arial, sans-serif`; Body 18 px / 1,45 |
| Display | Gewicht 100–200, Zeilenhöhe 0,70–0,82, Laufweite −0,065 bis −0,083 em; Betonung durch 700 im selben Satz |
| Kicker/Label | 0,72 rem, Versalien, Laufweite +0,12 em, Gewicht 500 |
| Radius | 0 überall; `full` (999 px) nur für Pill-Aktionen |
| Rahmen | 1 px; Cards als 1-px-Fugen-Grid auf Linienfarbe |
| Elevation | keine; Ausnahme schwebende Signalfläche `0 10px 30px rgba(0,0,0,.28)` |
| Bewegung | Standard `cubic-bezier(.76,0,.24,1)` 650 ms; Hover 300 ms; Hover wechselt Schnitt (kursiv/fett), Pill-Hover rotiert −6° |
| Bild | Graustufen mit Kontrast 1,15–1,3; Signalfarbe als Multiply-Overlay |
| Signatur | Asterisk ✳ als Ornament/Trenner; Top-Leiste `mix-blend-mode: difference` (Sxablono-Verhalten, Phase 4) |

Regeln mit Kialo für das Regularo (im privaten Paket): keine Schatten (Flächigkeit); Hover über Schnittwechsel (Marke spricht über Typografie); genau eine Akzentfarbe (Wiedererkennung); Radius null außer Pills (Kontrast zwischen Fläche und Aktion).

---

## Review-Checkliste

- [x] Alle Anforderungen beschreiben *was* und *warum*, nicht *wie*
- [x] Jede Anforderung ist testbar und einem Akzeptanzkriterium zugeordnet
- [x] Keine offenen `[NEEDS CLARIFICATION]`
- [x] Constitution v1.3 berücksichtigt; Amendment ist Teil dieser Spec (FR-19)
- [x] Nicht-Scope ist explizit
