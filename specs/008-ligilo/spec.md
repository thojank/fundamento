# Spec 008 – Ligilo: der Link

**Branch:** `008-ligilo` · **Status:** Entwurf, vor der Umsetzung geschrieben · **Constitution:** kein Amendment (Terminologio bekommt den Ero-Namen wie bei `butono`, keine neue Begriffsart) · **Erstellt:** 2026-10-12 · **Voraussetzung:** Spec 007 Stufe B auf `main` (c0901e3) · **Phase:** 4 (Eroj in der Breite) · **Zielpfad im Repo:** `specs/008-ligilo/spec.md`

## Zweck

Der `butono` sagt seit Spec 007 selbst, was er nicht ist: Navigation ist eine Grenze mit `action: ask-human`, weil Fundamento keinen Link hat. Ein Agent, der „Zur Übersicht" braucht, bekommt heute die richtige Antwort – frag einen Menschen – und bleibt stehen. Diese Spec schließt die Grenze: Es gibt ein zweites Ero, `ligilo` (Link), und die Grenze des `butono` wird von `ask-human` zu `use-instead: ligilo`.

Der Satz, den diese Spec belegen soll:

> Ein Agent, der einen Weg zu einer anderen Ansicht braucht, bekommt von Fundamento einen Link mit Begründung – und keinen Button, der nur so aussieht.

Zweites Ero nach dem Durchstich (Art. IX): Jede Projekcio, die `butono` trägt, trägt `ligilo` auf demselben Weg. Was für `butono` generiert wird, wird für `ligilo` generiert; kein zweiter Mechanismus.

## Nicht im Scope

- Ein Link, der wie ein Button aussieht („Call to Action"). Grenze `button-look` mit `ask-human` (A3). Kandidat für eine spätere Runde, wenn eine Marke ihn braucht.
- Navigationscontainer (Menü, Breadcrumb, Tabs). Der `ligilo` ist der Baustein, der Container kommt in Phase 4 später.
- Ein Link mit Vorschau, Download-Kennzeichnung oder Dateigröße. Grenze `download` mit `ask-human`.
- Router-Anbindung in React (SPA-Navigation). Der React-`Ligilo` rendert ein Ziel; wie eine Anwendung es abfängt, ist Sache der Anwendung (Plan nennt den Weg, z. B. `onNavigate`, ohne eine Router-Abhängigkeit).

## Nutzerszenarien

### S1 – Der Agent bekommt den Link statt einer Absage
`suggest_ero` mit „Zur Projektübersicht" liefert `ligilo` mit Kialo (eine andere Ansicht ist Navigation), nicht mehr `ask-human`.

### S2 – Der Agent schreibt das Label richtig
Ein Agent schreibt „hier klicken" auf einen Link. `check_usage` meldet die feste Text-Regel `link-label-names-destination` mit Kialo und einem Satz, der sie befolgt („Projektübersicht öffnen" oder „Projektübersicht").

### S3 – Der Agent nimmt den Link nicht für eine Aktion
Ein Agent will „Speichern" als Link setzen. `check_usage` meldet den Grenzfall `action` mit `use-instead: butono`.

### S4 – Der Link verlässt die Marke sichtbar und hörbar
Ein Link mit `external: true` zeigt eine Markierung und sagt es dem Screenreader. Das kann keine Marke abschalten (fest), das Aussehen der Markierung kommt aus der Aspekto.

### S5 – Der Chamäleon-Test
Dieselbe Link-Instanz in Figma: Modus komuna → ekzemplo, `color.link.rest` wechselt, die Schrift wechselt, nichts wird neu gebaut. In der Vitrino: Aspekto umschalten, derselbe Link, andere Marke.

## Anforderungen

**A1 – Skemo `ligilo`.** `data/eroj/ligilo/skemo.json`, Ero-Id und Skemo-Id nach Konvention (`ids.lock.json`). Beschreibung: „A link: moves to another view or place. Its label names the destination."

Props:
| Name | Art | Werte / Default | Beschreibung |
|---|---|---|---|
| `to` | string, Pflicht | – | Das Ziel. Plattformneutral benannt (Art. VIII): nicht `href`. Die Web-Projektion übersetzt in `href`. |
| `placement` | enum | `inline` \| `standalone`, Default `inline` | `inline` steht im Fließtext und erbt dessen Typografie; `standalone` steht allein (Fußzeile, Kartenende, Navigation) mit eigener Typografie. |
| `external` | boolean | Default `false` | Das Ziel liegt außerhalb der Anwendung. Erzwingt Markierung (A2, A3). |
| `size` | enum | `small` \| `medium` \| `large`, Default `medium` | Nur bei `placement: standalone` wirksam (Typografie, Icon-Größe). Bei `inline` ohne Wirkung; `check_usage` warnt bei `inline` + explizitem `size`. |
| `label` | string | – | Zugänglicher Name, wenn der Slot `label` leer ist (nur Icon); nie sichtbar. Wie beim `butono`. |

Kein `disabled`: Ein Link, dem man nicht folgen kann, wird nicht als Link gezeigt (Grenze `disabled-link`, A3). Kein `emphasis`, kein `intent` (siehe Nicht im Scope).

Zustände: `rest`, `hover`, `pressed`, `focus`, `visited`. `pressed` bindet dieselben Tokens wie `hover` (Entscheidung E2).

Slots: `label` (default, text), `icon-end` (decorative). Kein `icon-start` (Entscheidung E3).

Teile und Bindungen, nur bestehende Rollen des Vortaro, keine neuen Tokens (Entscheidung E1):
- `label.color` by `[state]`: rest → `color.link.rest`, hover → `color.link.hover`, pressed → `color.link.hover`, visited → `color.link.visited`, focus → `color.link.rest`.
- `label.typography` by `[placement, size]`: inline → erbt (`inherit`-Konzept der Skemo; wenn die Skemo das nicht kennt, führt der Plan es ein und dokumentiert es), standalone small → `typography.label.2`, medium/large → `typography.label.1`.
- `underline`: by `[placement]`: inline → sichtbar in jedem Zustand (Regulo `link-not-color-only`), standalone → sichtbar ab `hover` und `focus`. Dicke `border.width.default`, Farbe `sameAs label.color`.
- `focus-ring`: wie `butono` (`focus.ring`, `focus.offset`, `color.focus.inner`).
- `icon`: `color sameAs label.color`, `size` by `[size]` → `size.icon.*`.
- `box.gap`: `spacing.small` (zwischen Label und Icon). Kein `box.height`, kein `inline-padding`, kein `radius`: Ein Link ist Text, kein Kasten. Mindest-Trefferfläche bei `standalone`: `size.target.min` (Regulo `touch-target-min` gilt nur für `standalone`; `inline` ist von ihr ausgenommen, Kialo: Fließtext kann keine 44 px Zeilen haben, WCAG 2.5.8 nimmt Inline-Links aus).
- `motion`: wie `butono`.

A11y: `role: link`, Name aus `slot:label` oder `prop:label`, Taste `Enter`. Bei `external: true` bekommt der Name einen Zusatz aus der Skemo, zweisprachig (`a11y.suffix.external`: de „öffnet extern", en „opens external"); die Projekcioj hängen ihn unsichtbar an den Namen (Web: visually hidden text oder `aria-describedby`, Plan entscheidet; Figma: im Markdown der Komponente; Make-Guidelines: als Regel).

Goals (für `suggest_ero`): `navigate` (en: go to, open, overview, back to; de: zur, öffnen, übersicht, zurück zu) → `ligilo`; `external` (en: website, docs, external; de: webseite, dokumentation, extern) → `ligilo` mit `external: true`.

Constraints: `external: true` verlangt Slot `icon-end` belegt oder die Markierung kommt aus der Projekcio (Plan entscheidet, ob das Icon Teil des Ero ist – Empfehlung: ja, ein festes Icon „external", das die Projekcio stellt).

**A2 – Reguloj, neu, je mit Kialo:**
- `link-navigates-button-acts` (Prüfbarkeit `automatic` über `check_usage`): Ein Link wechselt die Ansicht oder den Ort, ein Button löst eine Aktion aus. Ein Link mit Aktions-Label (Goal `destructive`, `confirm`, `dismiss` des `butono`) ist ein Verstoß. Kialo: Screenreader kündigen beide verschieden an, die Tastatur bedient sie verschieden (Enter vs. Enter/Space), und der Weg zurück ist verschieden.
- `link-not-color-only` (`automatic` über Skemo-Prüfung: `inline` hat `underline` in jedem Zustand): Ein Link im Fließtext unterscheidet sich vom Text nicht nur durch Farbe. Kialo: WCAG 1.4.1.
- `link-label-names-destination` (`automatic` über `check_usage`, Text-Regel A3): Das Label nennt das Ziel; „hier", „klicken", „mehr", „Link" allein sind Verstöße. Kialo: WCAG 2.4.4, ein Screenreader-Nutzer liest Links als Liste ohne Kontext.
- `external-link-marked` (`automatic` über Skemo-Prüfung): `external: true` ohne sichtbare und hörbare Markierung ist ungültig. Kialo: Ein Wechsel aus der Anwendung ist ein Vertrauensmoment; die Person entscheidet vorher, nicht nachher.

`touch-target-min` bekommt eine Ausnahmeklausel für `ligilo` mit `placement: inline` (Kialo oben); die Klausel steht in der Regulo, nicht im Code.

**A3 – Uzo `ligilo`.** `data/eroj/ligilo/uzo.json`, Pflicht seit Stufe B.
- `purpose`: „Moves to another view or place: it opens an overview, a detail, a document or an outside site."
- `instead`: `action` (keywords aus den `butono`-Goals) → `butono`, Kialo wie `link-navigates-button-acts`.
- `boundary`: `button-look` → `ask-human` (Kialo: Ein Link, der wie ein Button aussieht, wird als Aktion gelesen; ob eine Marke das will, entscheidet ein Mensch); `download` → `ask-human` (Kialo: Ein Download verlässt die Ansicht nicht und braucht eine Kennzeichnung, die Fundamento noch nicht hat); `disabled-link` → `not-supported` (Kialo: Ein Link, dem man nicht folgen kann, ist Text; ein grauer Link verspricht ein Ziel, das es nicht gibt); `multi-line-label` nur für `standalone` → `not-supported` (via `layout: wrap`), für `inline` ist Umbruch mit dem Text erlaubt.
- `composes`: Container `text` (Fließtext, Kialo: Dort steht ein Verweis, wo der Gedanke ihn braucht), `navigation`, `footer`, `card`; `with: ligilo` (Linklisten); `never: action-bar` (Kialo: Die Aktionsleiste hält Aktionen; ein Link dort wird als Aktion gelesen), `never: butono`-Slot. Spacing: Container.
- `slots`: `label` text max 1; `icon-end` icon max 1; nesting 0.
- `layout`: `size: content`, `wrap: inline → with-text, standalone → never`, `full-width: never`. Der Begriff `with-text` ist neu; falls das Schema `wrap` als boolean führt, führt der Plan einen dritten Wert ein und dokumentiert ihn.
- `content` (Text-Regeln, je mit Jugxo approved/rejected, de und en): `link-label-names-destination` fest; `link-label-not-url` anpassbar (Kialo: Eine URL als Label ist für Menschen schwer zu lesen; technische Dokumentation darf sie zeigen – mit Jugxo); `external-link-marked` fest.

**A4 – `butono`-Uzo nachziehen.** Grenze `navigation` wird `action: use-instead`, `ero: ligilo`; Kialo bleibt bis „… works differently." und endet mit „Fundamento covers it with ligilo." Die `ask-human`-Fixture und der Test aus Spec 007 S1 werden auf den neuen Zustand umgestellt; ein Test stellt sicher, dass **kein** `boundary`-Eintrag mehr auf ein Ero zeigt, das es gibt, und dabei `ask-human` sagt (Regel: Wenn Fundamento das Ero hat, ist die Antwort `use-instead`).

**A5 – Projekcioj, Parität.** Alles, was `butono` hat, in derselben Erzeugung:
- Web Component `fm-ligilo` (rendert ein natives Link-Element; `to` → `href`; `external` → Zielmarkierung und `rel`-Sicherheit, Plan nennt die Werte), React `Ligilo`.
- Figma: Komponentenset `ligilo` mit Eigenschaften `placement`, `external`, `state` (`size` nur bei standalone – wie Figma das trägt, entscheidet der Plan; akzeptabel ist `size` als Eigenschaft, die bei `inline` ohne Wirkung ist, wie `type` beim `butono` heute). Beschreibung beginnt mit `purpose` (Befund B1).
- Make-Kit-Guidelines `components/ligilo.md`, generiert, mit Reguloj und Jugxoj.
- Vitrino: Seite `ligilo` mit Zuständen, Gegenüberstellung, Gebrauch.
- MCP: `list_eroj` führt zwei Eroj; `get_ero ligilo` voll und `brief` unter der Obergrenze (750); `suggest_ero`, `check_usage` wie in S1–S3.
- Parität (Art. X) grün für beide Eroj; eine absichtlich abweichende Prop lässt sie scheitern.

**A6 – Alirebleco, Internacia.** Die Prüfungen aus Spec 003 FR-15/FR-16 laufen für `ligilo` in beiden Test-Aspektoj: Rolle, Name (inkl. external-Zusatz in de und en), Tastatur, Fokusring, Kontrast von `color.link.*` auf `color.background.default` und `.canvas` (KontrastParoj deklariert, Regulo `contrast-pairs-declared`); RTL, +35 % Text, Pseudo-Lokalisierung für `standalone`.

**A7 – Rote Tests zuerst, Fehlerfixtures.** Mindestens: Skemo mit `href` statt `to` (Web-Begriff, Art. VIII); `inline` ohne `underline` in einem Zustand; `external: true` ohne Markierung; Uzo-`instead` ohne Kialo; `butono`-Uzo mit `navigation` auf `ask-human` obwohl `ligilo` existiert (A4). Jede Prüfung war einmal rot.

**A8 – Vojmapo, Ontologio.** Phasentabelle Zeile 4 führt Spec 008 und den Satz: „Jedes neue Ero schließt, wo es kann, eine Grenze eines bestehenden Ero (Grenze → use-instead)." Ontologio: `ligilo` als Ero mit Beziehung zu `butono` (instead/boundary in beide Richtungen).

## Gvidanto (Art. VII)

Neue Fragen: „Womit navigiere ich zur Übersicht?", „Darf ein Link ‚hier klicken' heißen?", „Wie zeige ich, dass ein Link nach draußen führt?", „Darf ein Link in die Fußleiste des Dialogs?", „Button oder Link?"

**Beispiel-Dialog als Akzeptanzkriterium:**
> Nutzer: „Ich brauche einen Button, der zur Projektübersicht führt."
> Gvidanto ruft `suggest_ero` auf, bekommt `ligilo` mit Kialo und antwortet: Das ist Navigation, dafür gibt es den Ligilo; zitiert den Kialo; schlägt `placement: standalone` und ein Label vor, das das Ziel nennt. Kein Button.

## Abnahme

1. `get_ero ligilo` liefert Skemo und Uzo; `brief: true` unter 750 Tokens.
2. S1–S4 als Tests gegen den MCP-Server, grün. S5 manuell vom Maintainer (Prüfblatt vor Messung): Figma-Datei, Komponentenset `ligilo`, Modus komuna → ekzemplo wechselt `color.link.rest` und Schrift; Vitrino-Umschaltung dito.
3. Beispiel-Dialog in einer frischen Sitzung wie beschrieben; Abweichung = Befund.
4. A7-Fixtures rot vor, grün nach.
5. Parität grün für zwei Eroj; Alirebleco und Internacia grün in beiden Aspektoj.
6. Make-Kit-Guidelines enthalten `components/ligilo.md` ohne handgeschriebene Zeile; `check:regularo` ohne Warnung `skemo-uzo-missing`.
7. Vojmapo und Ontologio nach A8.

## Entscheidungen (Entscheidungsregeln; gelten, bis der Maintainer widerspricht – kein Ping-Pong)

**E1 – Keine neuen Vortaro-Tokens.** `color.link.rest|hover|visited`, `typography.label.*`, `size.icon.*`, `focus.*` reichen. Fehlt eine Rolle, nimmt P0 die nächstliegende bestehende und führt die fehlende als Manko (Art. VI), nicht als neuen Token.

**E2 – `pressed` ohne eigenes Token.** `pressed` bindet `color.link.hover`. Grund: Ein Link hat keinen gedrückten Zustand, der länger als einen Augenblick sichtbar ist; ein eigener Token wäre eine Rolle ohne Bedeutung. Kandidat für Spec-004-Runde `states-pairwise-distinct`: `pressed = hover` ist dort ausdrücklich erlaubt.

**E3 – Nur `icon-end`.** Das Icon eines Links zeigt, wohin er führt (extern, weiter); das steht hinter dem Wort. Ein `icon-start` wäre ein Symbol vor einem Verweis, das es im Fließtext nicht gibt.

**E4 – Kein Button-Look, kein `disabled`.** Siehe Nicht im Scope und A3. Grund: Beides würde den Satz dieser Spec (Link ≠ Button) in der ersten Runde wieder aufweichen.

**E5 – `to` statt `href`.** Art. VIII: kein Web-Begriff im Modelo. Die Web-Projektion übersetzt.

**E6 – `inline` erbt Typografie.** Ein Link im Satz ist Teil des Satzes. Wenn die Skemo „erben" nicht ausdrücken kann, führt der Plan eine Bindung `inherit` ein (ein Wert, keine neue Struktur) und die Projekcioj übersetzen sie (Web: keine eigene Typografie-Regel; Figma: Textstil des Containers).

## Benchmark (Art. V, öffentliche Quellen, Clean Room)

WCAG 2.2: 1.4.1 (Use of Color), 2.4.4 (Link Purpose in Context), 2.5.8 (Target Size, Ausnahme Inline). WAI-ARIA APG: Pattern „Link". Öffentliche Design-System-Dokumentationen (z. B. GOV.UK Design System „Links", USWDS „Link") für die Unterscheidung Link/Button und die Regel „Label nennt das Ziel". P0 ergänzt `research.md` nur, wenn der Plan eine Entscheidung trifft, die hier nicht steht.
