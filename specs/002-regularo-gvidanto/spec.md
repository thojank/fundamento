# Spec 002 – Regularo und Gvidanto (Kern), Ontologio

**Branch:** `002-regularo-gvidanto` · **Status:** Ready for /speckit.plan · **Constitution:** v1.4 (diese Spec ist das Amendment) · **Erstellt:** 2026-09-19 · **Voraussetzung:** Spec 001 auf `main` (`46f23a2`), CI grün

## Zweck

Phase 1 hat gezeigt, was Prüfungen nicht sehen: In der visuellen Abnahme von ciferecigo fielen eine falsch geordnete Fläche, zusammengefallene Textrollen, Aktionszustände ohne Unterschied und eine Warnfläche auf, die nur über einen Umweg Kontrast hielt. Kein Check hatte das gemeldet. Und der Agent, der über MCP gefragt wurde, musste einen Kontrast „nach eigener Rechnung" angeben, weil kein Werkzeug ihn lieferte.

Phase 2 macht Regeln ausführbar und das System erklärbar. Drei Dinge entstehen:

1. **Regularo:** Die Befunde aus Phase 1 werden automatische Kern-Reguloj mit Kialo (Art. VI, „Befund wird Regel"). `komuna` wird repariert, wo es die neuen Reguloj verletzt.
2. **Gvidanto (Kern):** Werkzeuge, mit denen ein Agent jede Warum-Frage aus dem Modelo beantwortet: Herkunft eines Werts samt der Reguloj, die ihn begründen; Kontrast beliebiger Paare; Erklärung einer Regulo; Bedeutung eines Begriffs. Dazu ein MCP-Prompt, der einem Client-Agenten sagt, wie er diese Werkzeuge benutzt.
3. **Ontologio, Stufe 1:** Die Terminologie der Constitution als maschinenlesbare Datei mit stabilen URIs, von CI gegen die Constitution geprüft.

Diese Spec ist zugleich das **Constitution Amendment auf v1.4** (Terminologie, Art. III, VI, VIII; siehe „Constitution-Änderungen").

## Nicht im Scope

- Eroj, Skemoj, Sxablonoj → Phase 3/4. Konformität „eines Screens" prüft der Gvidanto erst, wenn es Eroj gibt; Phase 2 prüft Token-Paare und Reguloj.
- Ein eigenes Sprachmodell im Server. Der Gvidanto ist eine Sammlung deterministischer Werkzeuge, Ressourcen und Prompts; das Schlussfolgern macht der Client-Agent (Claude Code, Cursor, Claude Desktop). Art. XI.
- JSON-LD- oder RDF-Export der Ontologio → Phase 5 (Projekcio). Phase 2 legt nur die Datei an, die das später trivial macht.
- Dimensio `etoso` (kontextabhängige Stimmung zur Laufzeit) → eigene Spec, frühestens nach Phase 3, weil die Laufzeitumschaltung Generatoren braucht (research §9 aus Spec 001).
- APCA als verbindliche Schwelle → Spec 003.
- Weitere Tavoloj (Sprache, Verhalten) eines Aspekto → eigene Spec.
- Remote-Betrieb des MCP-Servers → unverändert nicht im Scope.

---

## Nutzerszenarien

### S1 – Ein Befund wird Regel (Modelo-Autor)

Ein Autor verschiebt in einem Aspekto `background.sunken` auf eine Stufe, die heller ist als `background.canvas`. `fm modelo validate` meldet `surface-order` mit Pfad, Kombination, gemessenen Helligkeiten und einem Vorschlag. Dasselbe gilt, wenn `text.subtle` und `text.muted` in einer Kombination auf denselben Wert fallen (`text-hierarchy`) oder `action.primary.hover` aussieht wie `.rest` (`state-distinct`).

*Warum:* Art. VI, „Befund wird Regel". Keine dieser Eigenschaften ist ein Kontrastproblem; alle drei waren in Phase 1 nur für ein menschliches Auge sichtbar.

### S2 – komuna hält die eigenen Regeln (Modelo-Autor)

Nach Phase 2 verletzt `komuna` keine Kern-Regulo in keiner der 72 Kombinationen. Heute fallen `text.subtle` und `text.muted` unter `contrast=high` zusammen (light und dark); das ist behoben, ohne eine Kontrastschwelle zu senken.

### S3 – Statusflächen dürfen über einen Rand Kontrast halten (Designer)

Eine Marke will eine helle Amber-Warnfläche auf hellem Papier. Die Fläche selbst erreicht 3:1 gegen den Hintergrund nicht, ein Rand in `color.status.warning.border` schon. Die Alirebleco-Prüfung akzeptiert das, weil das KontrastParo eine Alternative kennt, und meldet, welcher Zweig erfüllt ist. Der Text auf der Fläche muss seine eigene Schwelle weiterhin erreichen.

*Warum:* WCAG 1.4.11 verlangt Kontrast für die Grenze eines Bedienelements, nicht zwingend für seine Füllung (research §3). Ohne diese Alternative erzwingt der Kern für warme Marken olivfarbene Warnflächen.

### S4 – Kontrast als Antwort statt als Rechnung (Agent)

Ein Agent fragt: „Darf ich `text.muted` auf `background.sunken` setzen?" Das Werkzeug `check_contrast` liefert je Kombination Verhältnis, Schwelle, bestanden oder nicht, den APCA-Wert als Hinweis und ob das Paar ein deklariertes KontrastParo ist. Der Agent muss nichts selbst rechnen.

### S5 – Warum ist das so? (Designer, Agent)

„Warum ist `text.subtle` in komuna im Dark Mode bei hohem Kontrast so hell?" Das Werkzeug `explain` liefert den Wert, die Alias-Kette mit Set und Paket je Schritt, die Reguloj, die diesen Token betreffen, mit Kialo, die KontrastParoj des Tokens mit ihren Ergebnissen in dieser Kombination und die Jugxoj dazu.

### S6 – Was bedeutet dieser Begriff? (neue Person im Projekt, Agent)

„Was ist ein Aspekto, und wie hängt es mit einer Dimensio zusammen?" Das Werkzeug `describe_term` liefert Definition, Oberbegriff und Beziehungen aus der Ontologio, dazu die Einträge im Modelo, die dieser Begriff bezeichnet (z. B. die geladenen Aspektoj).

### S7 – Gvidanto-Dialog (Akzeptanzkriterium nach Art. VII)

Gegen die Konfiguration `core + aspekto-ekzemplo`:

1. „Was gibt's hier?" → `describe`: Aspektoj, Dimensioj, Token-Anzahl je Gruppe, **Anzahl Reguloj (davon automatisch) und Jugxoj**, und der Hinweis, dass Warum-Fragen mit `explain` beantwortet werden.
2. „Warum ist `color.text.subtle` in komuna, dark, high contrast dieser Wert?" → `explain`: Wert, Kette, Regulo `text-hierarchy` mit Kialo, Kontrast gegen `background.default`.
3. „Darf ich `color.text.muted` auf `color.background.sunken` setzen?" → `check_contrast`: je Kombination bestanden oder nicht, deklariertes Paar ja/nein.
4. „Warum hat die Warnfläche in ekzemplo einen Rand?" → `explain` auf `color.status.warning.border` bzw. das KontrastParo: welcher Zweig erfüllt ist und warum (Kialo des Paars).
5. „Was ist ein Aspekto?" → `describe_term`.

Jede Zahl und jeder Wert der Antworten wird im Test aus den Werkzeug-Ausgaben neu berechnet und mit dem Resolver bzw. der Alirebleco-Prüfung direkt verglichen.

### S8 – Der Client-Agent weiß, wie er fragen soll (Entwickler)

Ein Entwickler registriert den MCP-Server in seinem Agenten. Der Server bietet einen Prompt `gvidanto` an, der festlegt: Werte nur aus Werkzeugen, nie geschätzt; jede Begründung mit Kialo und ID zitieren; bei Unsicherheit `validate` oder `check_contrast` aufrufen. Der Entwickler muss dem Agenten nichts erklären.

---

## Funktionale Anforderungen

### Regularo

- **FR-01 `surface-order`** (automatic): In jeder Kombination jedes Aspekto gilt L(`background.sunken`) ≤ L(`background.canvas`) ≤ L(`background.default`) ≤ L(`background.raised`), in beiden Farbschemata gleich gerichtet. L ist die OKLCH-Helligkeit des aufgelösten Werts. Kialo: Die Flächenhierarchie trägt räumliche Bedeutung; ein Bruch ist für Nutzer sichtbar und für keinen Kontrastcheck.
- **FR-02 `text-hierarchy`** (automatic): In jeder Kombination sind die aufgelösten Werte von `color.text.default`, `.subtle` und `.muted` paarweise verschieden, und ihr Kontrast gegen `background.default` fällt in dieser Reihenfolge (default ≥ subtle ≥ muted). **Ergänzt durch T027 (2026-09-19, Befund der Gvidanto-Abnahme):** Benachbarte Textrollen (default→subtle, subtle→muted) haben in jeder Kombination einen Helligkeitsabstand |ΔL| ≥ `sojlo` in OKLCH, bestimmt nach Komposition; die Schwelle steht als Datenfeld der Regulo (0,05, gemessen in research §8.7). Kialo: Die Textrollen tragen eine Bedeutungsunterscheidung; hoher Kontrast darf sie nicht löschen. Verschieden ist nicht unterscheidbar; eine Hierarchie, die das Auge nicht sieht, existiert nicht.
- **FR-03 `state-distinct`** (automatic): Für jede Aktionsvariante unterscheiden sich `hover`, `pressed` und `selected` in jeder Kombination wahrnehmbar von `rest`. Die Mindestdifferenz (Metrik und Schwelle) legt der Plan fest (research §2). Kialo: Ein Zustand, der aussieht wie der Ruhezustand, gibt keine Rückmeldung.
- **FR-04 `semantic-described`** (automatic): Jeder Rollen-Token (Nicht-Primitiv) im Kern hat eine `$description`, die seinen Einsatz beschreibt, nicht seinen Wert. Kialo: Agenten lesen aus nackten Token-Dateien Werte, aber keine Gründe (research §5).
- **FR-05 Reparatur komuna:** `komuna` erfüllt FR-01 bis FR-04 in allen 72 Kombinationen, ohne eine Schwelle zu senken. Alle Phase-1-Prüfungen bleiben grün. Ob der Kern je Aktionszustand eine eigene Textfarbe braucht (Befund aus ciferecigo, Regel 8), entscheidet der Plan; Bedingung ist nur, dass `komuna` und `ekzemplo` FR-03 erfüllen.
- **FR-06 Statusränder:** Neue Rollen-Tokens `color.status.<s>.border` (Rolle `border`) für `success`, `warning`, `danger`, `info` in Kern, `komuna` und `ekzemplo`.
- **FR-07 KontrastParo mit Alternative:** Ein KontrastParo darf eine Alternative angeben (Arbeitsname `aux`): Das Paar gilt als erfüllt, wenn das Hauptpaar oder das Alternativpaar seine Schwelle erreicht. Die Alirebleco-Prüfung meldet je Kombination, welcher Zweig erfüllt ist, und nennt bei Verletzung beide. Die Paare `status.<s>.basic` auf `background.default` bekommen `status.<s>.border` auf `background.default` als Alternative. Paare für Text sind davon ausgenommen (Schema-Regel).
- **FR-08 Issues zitieren ihre Regulo:** Jede Meldung einer Regulo-Prüfung trägt die Regulo-ID und den Kialo-Text, damit ein Agent den Grund zitieren kann, ohne nachzuschlagen.

### Gvidanto

- **FR-09 `check_contrast`** `{ foreground, background, assignment?, kategorio? }` → je Kombination (oder nur für die angegebene Belegung): Verhältnis, Schwelle aus `kontrastSojloj` für die Kategorie (angegeben oder aus der Rolle abgeleitet), bestanden, APCA-Wert als Hinweis, und ob und unter welcher ID das Paar deklariert ist. Beliebige Paare sind erlaubt, auch nicht deklarierte.
- **FR-10 `explain`** `{ token, assignment? }` → aufgelöster Wert, Alias-Kette mit Set und Paket je Schritt, alle Reguloj, die den Token betreffen (über Rolle, Name oder deklarierten Geltungsbereich), mit Kialo und aktuellem Ergebnis in dieser Belegung, die KontrastParoj des Tokens mit Ergebnis, die Jugxoj zu diesen Reguloj.
- **FR-11 `explain_regulo`** `{ name | id }` → Aussage, Kialo, `checkability`, Geltungsbereich, Anzahl aktueller Verletzungen im servierten Modelo (je Aspekto), Jugxoj.
- **FR-12 `describe_term`** `{ term }` → Eintrag der Ontologio (FR-15) plus die Instanzen im servierten Modelo, wo der Begriff Instanzen hat (z. B. `Aspekto` → geladene Aspektoj, `Regulo` → Anzahl). Unbekannter Begriff: Issue plus bis zu fünf nächste Begriffe.
- **FR-13 Prompt `gvidanto`:** Der Server bietet einen MCP-Prompt an, der den Client-Agenten auf die Arbeitsweise festlegt (S8). Der Text liegt als Datei im Paket `mcp`; ein Test prüft, dass er nur existierende Werkzeugnamen nennt.
- **FR-14 `describe` erweitert:** Satz und Ausgabe nennen Reguloj (gesamt, automatisch) und Jugxoj und verweisen auf `explain`.

### Ontologio

- **FR-15 `packages/modelo/data/ontologio.json`:** Je Begriff der Terminologie (Constitution v1.4, Tabelle) ein Eintrag mit stabiler URI (`https://fundamento.ciferecigo.com/ontologio#<Begriff>`), Begriff (Esperanto, x-Konvention), Bezeichnung auf Englisch und Deutsch, Definition auf Englisch und Deutsch, Oberbegriff, Beziehungen (Name, Zielbegriff). Feldnamen nach SKOS (research §4), damit ein späterer JSON-LD-Export nur einen Kontext braucht. Eigenes JSON Schema.
- **FR-16 Drift-Prüfung:** CI schlägt fehl, wenn die Begriffe der Terminologie-Tabelle in der Constitution und die Einträge der Ontologio nicht übereinstimmen, oder wenn eine Entitätsart des Modelo-Schemas keinen Ontologio-Begriff hat.
- **FR-17 Ressource:** `fundamento://ontologio.json` als MCP-Ressource.

### Querschnitt

- **FR-18 Constitution v1.4** ist ratifiziert (dieser Branch). Migration: keine Artefakte ändern sich außer den in dieser Spec genannten.
- **FR-19 MCP-SDK:** Der Plan bewertet die Migration auf SDK 2.x (Complexity Tracking Spec 001) und entscheidet. Werkzeugverträge aus Spec 001 bleiben unverändert (Feldnamen stabil).

## Key Entities (neu oder geändert)

| Entität | Änderung |
|---|---|
| Regulo | neu: `surface-order`, `text-hierarchy`, `state-distinct`, `semantic-described`; Meldungen tragen ID und Kialo |
| KontrastParo | optional `aux` (Alternativpaar), nicht für Text-Kategorien |
| Token | neu: `color.status.<s>.border` (4) |
| Ontologio-Begriff | neu: URI, Begriff, Bezeichnungen, Definitionen, Oberbegriff, Beziehungen |
| MCP-Werkzeug | neu: `check_contrast`, `explain`, `explain_regulo`, `describe_term` (14 gesamt) |
| MCP-Prompt | neu: `gvidanto` |
| MCP-Ressource | neu: `fundamento://ontologio.json` |

## Constraints

- Höchstens drei neue Pakete (Art. XI); Ziel: keins.
- Keine Schwelle wird gesenkt, um eine Regulo zu erfüllen.
- Keine ciferecigo-Werte im Kern-Repo (unverändert AK-08 aus Spec 001).
- Werkzeuge sind read-only, deterministisch, `additionalProperties: false`, Ausgaben kanonisch sortiert.
- `explain` und `check_contrast` antworten je Aufruf unter 100 ms (Budget wie `resolve`, gemessen in `pnpm perf`).
- Export bleibt byte-identisch über zwei Builds.

## Edge Cases

- Ein Aspekto hat `canvas` = `default` (gleiche Helligkeit): `surface-order` erlaubt Gleichheit (≤).
- Unter `contrast=high` reichen die Stufen einer Rampe nicht für drei verschiedene Textwerte über 7:1: Die Regulo bleibt verletzt, der Aspekto muss eine Stufe ergänzen; der Kern senkt nichts. Die Meldung sagt das.
- `check_contrast` mit einem Token, der keine Farbe ist: Issue, kein Ergebnis.
- `check_contrast` mit einer halbtransparenten Vordergrundfarbe: Komposition über den Hintergrund wie in der Alirebleco-Prüfung.
- Ein KontrastParo mit `aux`, dessen Hauptpaar besteht: Ergebnis „bestanden (Hauptpaar)", die Alternative wird nicht geprüft, aber angezeigt.
- Ein externes Aspekto-Paket verletzt eine neue Kern-Regulo: `fm modelo validate --aspekto` meldet es wie jede andere Verletzung. Die Maintainer-Abnahme von ciferecigo wird mit dem neuen Kern wiederholt (manuell, außerhalb des Repos).
- `describe_term` mit einem deutschen oder englischen Wort („Marke", „brand"): Treffer über die Bezeichnungen.

## Akzeptanzkriterien

- **AK-01** Für FR-01 bis FR-04 je ein positives und ein negatives Fixture mit exaktem `rule`, `path` und Kombination.
- **AK-02** `komuna` und `ekzemplo` bestehen alle Kern-Reguloj in allen 72 Kombinationen; `check:alirebleco` bleibt grün; AK-02 aus Spec 001 (Text ≥ 7:1 unter `contrast=high`) gilt weiter.
- **AK-03** KontrastParo mit `aux`: Fixture „Fläche verfehlt, Rand erfüllt" besteht mit Angabe des Zweigs; Fixture „beide verfehlt" scheitert und nennt beide; ein `aux` auf einem Text-Paar ist ein Schemafehler.
- **AK-04** Parität: Für jedes deklarierte KontrastParo in jeder Kombination liefert `check_contrast` dasselbe Verhältnis und dasselbe Ergebnis wie die Alirebleco-Prüfung.
- **AK-05** `explain` liefert dieselbe Kette wie `resolve`; jeder Kialo-Text stimmt mit `reguloj.json` überein.
- **AK-06** Der S7-Dialog läuft automatisiert gegen den Server; alle Zahlen werden neu berechnet (Mutationstest wie in Spec 001: eine falsche Zahl lässt den Test scheitern).
- **AK-07** Ontologio: Drift-Test gegen die Constitution und gegen das Modelo-Schema, Schema-Validierung, jede URI eindeutig.
- **AK-08** Werkzeugverträge: 14 Werkzeuge, alle mit Ein- und Ausgabeschema, read-only; der Prompt nennt nur existierende Werkzeuge.
- **AK-09** `pnpm perf`: `explain` und `check_contrast` unter 100 ms je Aufruf (lokal, Faktor 3 unter `CI=true`).
- **AK-10** Byte-identischer Export über zwei Builds; `check:clean-room` grün.
- **AK-11** Kein offener `[NEEDS CLARIFICATION]` vor `/speckit.tasks`.

## Constitution-Änderungen (v1.3 → v1.4)

Auf diesem Branch bereits in `.specify/memory/constitution.md` eingetragen:

- **Terminologie:** neu `Tavolo` (Schicht eines Aspekto-Pakets; das Vortaro ist `vida`) und `Ontologio`.
- **Art. III:** Die Terminologie existiert als Ontologio; CI hält Tabelle und Datei synchron; Exporte sind als Wissensgraph lesbar, JSON-LD ist eine Projekcio.
- **Art. VI:** „Befund wird Regel": Befunde menschlicher Abnahmen werden Regulo-Kandidaten und, wo prüfbar, automatische Reguloj. Kontrast ist notwendig, nicht hinreichend.
- **Art. VIII:** „Internacia": logische Richtungen, RTL als Testfall jedes Ero, Textexpansion, keine festen Strings, Formatierung durch die Anwendung, Schriftsysteme je Schrift (ISO 15924).
- **Phasenfolge:** Phase 2 präzisiert.

## Review-Checkliste

- [x] Jede Anforderung ist testbar und hat ein AK.
- [x] Kein Ero, kein Generator, kein neues Paket gefordert.
- [x] Jede neue Regulo hat einen Kialo.
- [x] Gvidanto-Dialog als Akzeptanzkriterium (Art. VII).
- [x] Keine offenen Klärungen; Entscheidungen für den Plan sind benannt (Metrik FR-03, Zustands-Textfarben FR-05, SDK FR-19).
