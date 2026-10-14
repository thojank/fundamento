# Plan – Spec 008: Ligilo, der Link

**Spec:** [`spec.md`](spec.md) (unverändert aus dem Auftrag kopiert) · **Auftrag:** [`briefing-p0-nacht-2026-10-12.md`](briefing-p0-nacht-2026-10-12.md) · **Aufgaben:** [`tasks.md`](tasks.md) · **Vorbild:** `data/eroj/butono/{skemo,uzo}.json`, Spec 007 Stufe B · **Constitution:** v2.2, kein Amendment · **Rahmen:** [`docs/vojmapo.md`](../../docs/vojmapo.md) Zeile 4 · **Datum:** 2026-10-12 (Nachtschicht) · **Basis:** `main` @ `c0901e3` · **Branch:** `261012-spec-008-ligilo-ae9abb`

Dieser Plan legt fest, wie das zweite Ero `ligilo` denselben Weg geht wie `butono` (Art. IX, Art. XI). Wo die Spec eine Entscheidung trifft (E1–E6), gilt sie. Wo sie keine trifft, gilt Regel 0 des Auftrags: der `butono`-Weg; wenn der nicht trägt, die kleinste Änderung, die `ligilo` **und** `kampo` (Spec 009) trägt. Was die Spec anders will, als der Plan es baut, steht unter „Abweichungen von der Spec“; die Spec ist nicht editiert.

## Zusammenfassung

1. **Modelo:** `data/eroj/ligilo/skemo.json` und `uzo.json`; fünf neue Reguloj mit Kialo; zwölf Jugxoj (drei Text-Regeln × approved/rejected × de/en); drei KontrastParoj (`color.link.*` auf `color.background.canvas`); `butono`-Uzo: Grenze `navigation` wird `use-instead: ligilo`. Drei additive Schema-Erweiterungen (D-02, D-04, D-06) und zwei Bindungs-Schlüsselwörter (`inherit`, `none`, D-03) ohne neue Struktur.
2. **Gvidanto:** `suggest_ero` erkennt, dass eine Grenze mit `use-instead: X` und eine Absicht von X dieselbe Antwort sind (D-08); `check_usage` prüft die neue Text-Prüfart `not-instead` (D-07) und die Sprache einer Instanz (D-06); Prompt-Regel 13 für `use-instead`.
3. **Projekcioj:** Web Component rendert nach `a11y.role` ein natives Link-Element (`to` → `href`, D-09); React `Ligilo`; Figma-Set `ligilo` mit `placement × size × state`, Unterstreichung als geschriebener Textwert (D-11); Make-Kit-Guideline `components/ligilo.md`; Vitrino-Abschnitt je Ero (D-12). Parität grün für beide Eroj.
4. **Prüfung:** fünf Fehlerfixtures rot vor der Umsetzung (A7, Nachweis unten), Alirebleco und Internacia für `ligilo` in `komuna` und `ekzemplo`, `brief` gemessen.

Keine neue Abhängigkeit, kein neues Paket, keine neuen Tokens (E1).

## Technischer Kontext

| Punkt | Wert |
|---|---|
| Sprache, Laufzeit | TypeScript 7, Node ≥ 24, unverändert |
| Neue Abhängigkeiten, Pakete | keine |
| Neue Tokens | keine (E1); `color.link.rest|hover|visited`, `typography.label.*`, `size.icon.*`, `size.target.min`, `border.width.default`, `focus.*`, `spacing.small`, `motion.*` reichen |
| Tests | Vitest, Playwright (Chromium im PR, drei Engines auf `main`); Fixtures unter `packages/modelo/test/fixtures/invalid/`; Rot vor Umsetzung, Commit-Hash des roten Stands unten |
| Größe | `get_ero ligilo brief:true` gemessen, Grenze 750 bleibt (M-4 in Spec 007) |

## Entwurfsentscheidungen

### D-01 Zwei Dateien, derselbe Lader, dieselben Ids (A1, A3)

`data/eroj/ligilo/skemo.json` und `uzo.json` wie beim `butono`. Ids per `pnpm id:new ero|skemo|uzo|regulo|jugxo|kontrastParo`. Die Eroj sind im Modelo nach Namen sortiert (`butono`, `ligilo`); jede Stelle, die `modelo.eroj[0]` als „das Ero“ las, wird auf eine Schleife oder eine benannte Suche umgestellt (Figma-Radien, Vitrino, Tests).

### D-02 `a11y.texts`: gehörter Zusatz je boolescher Prop (A1, S4; Spec 009 A1)

Spec 008 nennt `a11y.suffix.external`, Spec 009 nennt `a11y.texts`. Ein Mechanismus für beide: `a11y.texts` ist ein Objekt `{ <boolean-prop>: { <lingvo>: <text> } }` (hier `external: { de: "öffnet extern", en: "opens external" }`, in Spec 009 `required`). Der Schlüssel muss eine boolesche Prop der Skemo sein (`skemo-a11y-invalid`), jede Sprache ist ein ISO-639-1-Code, `de` und `en` sind Pflicht (Internacia). Der Text ist nie sichtbar; er ist das Einzige, was eine Skemo in natürlicher Sprache trägt, und er steht dort, weil Projekcioj ihn **gleich** aussprechen müssen (Web, Figma-Markdown, Make-Guidelines).

Projekcio Web: Ist die Prop wahr, hängt das Element den Text in der Sprache des nächsten `lang`-Vorfahren (Fallback `en`) als `aria-describedby`-Ziel an das Kontroll-Element; das Ziel ist ein `hidden`-Element im Shadow DOM (ein per `aria-describedby` referenzierter versteckter Knoten wird vorgelesen). Entscheidung gegen „visually hidden text“: kein Pixelmaß in der Struktur-CSS (Vortaro-Lint), und der Zusatz ist eine Beschreibung, kein Teil des Namens.

### D-03 Bindungs-Schlüsselwörter `inherit` und `none` (E6, A1 `underline`)

Die Skemo kennt für eine Teil-Eigenschaft nur Tokens. Zwei Fälle des `ligilo` brauchen einen Nicht-Token-Wert: `label.typography` bei `placement: inline` **erbt** vom Fließtext (E6), und `underline.width` bei `standalone` ist in `rest` und `visited` **nicht da**. E6 erlaubt dafür „eine Bindung `inherit` (ein Wert, keine neue Struktur)“. Der Plan führt genau zwei solche Werte ein, als Token-Namen in `fixed` oder `bindings[].token`:

- `inherit`: die Eigenschaft kommt vom Container (Web: keine eigene Regel, das Element fließt im Text; Figma: der Textstil des umgebenden Textes, im Komponentenset steht dafür `typography.body.1`, weil ein Set keinen Container hat – siehe D-11).
- `none`: die Eigenschaft ist in dieser Kombination nicht gesetzt (Web: `text-decoration-line: none`, `min-block-size: auto`; Figma: keine Unterstreichung; Parität: kein Wert).

`skemo-token-missing`/`-type` lassen beide durch; `skemo-binding-missing` zählt sie als Bindung. `BINDING_KEYWORDS` steht an einer Stelle (`skemo-rules.ts`), die Projekcioj lesen es von dort.

*Verworfen:* eine neue Teil-Eigenschaft „visibility“ oder ein Token `border.width.none` (E1: kein neuer Token für ein Ero).

### D-04 `wrap: with-text` (A3 Layout)

`UzoLayout.wrap` ist ein Enum (`never | allowed`), kein boolean; die Spec sieht diesen Fall vor („führt der Plan einen dritten Wert ein“). Dritter Wert **`with-text`**: Das Ero bricht nur **mit dem Text** um, in dem es steht; steht es allein, bricht es nie. Damit braucht `wrap` keine Abhängigkeit von `placement` (eine Struktur „wrap je Prop-Wert“ wäre ein zweiter Mechanismus). Durchsetzung in `check_usage` (Grenze `multi-line-label` via `layout: wrap`): Bei `never` ist jeder Umbruch ein Verstoß; bei `with-text` ist er einer, wenn die Instanz **nicht** in einem Container `text` steht (`instance.container !== "text"`). Der Web-Celo liest den Wert ebenfalls: `with-text` heißt, der Host ist `display: inline` (D-09).

### D-05 Die Markierung „extern“ ist das Icon im Slot `icon-end` (A1 Constraints, S4)

Der Plan folgt der Empfehlung der Spec: Das Ero stellt die sichtbare Markierung selbst. Sie ist kein neuer Teil, sondern **der Slot `icon-end`**, den die Projekcio mit einem festen Icon „extern“ belegt, wenn `external: true` ist und der Slot leer ist (Web: Fallback-Inhalt des Slots, Farbe `icon.color` = `label.color`, Größe `icon.size`). Der gehörte Teil ist `a11y.texts.external` (D-02). Die Regulo `external-link-marked` prüft genau das an der Skemo (D-13): eine boolesche Prop `external` verlangt einen Eintrag in `a11y.texts` mit `de` und `en` **und** einen dekorativen Slot `icon-end`. Figma zeichnet das Icon nicht (bestehender Jugxo `jug_01M31TV1V4S3RNBPWSRB2CGEDK`: Figma zeigt, was die Vitrino zeigt; die Vitrino zeigt den externen Link in einer eigenen Spalte, das Icon bleibt bis zu einer Messung in echtem Figma ein Befund, kein Manko ohne Beleg).

### D-06 `EroInstance.lingvo` (A2 Text-Regeln, D-07 in Spec 007)

`check_usage` nimmt die Lösung einer Text-Regel aus dem approved-Beispiel **in der Sprache der Instanz**. Die Sprache wird bisher aus dem Schlüsselwort einer Absicht erraten; ein Link-Label wie „Projektübersicht öffnen“ trifft kein Schlüsselwort (OP-12: `öffnen` ist keins). Additiv kommt `lingvo` (ISO 639-1) an die `EroInstance`: Eine Instanz, die ihre Sprache nennt, bekommt ihr Beispiel in dieser Sprache; die Jugxo-Beispiele der Text-Regeln nennen sie. Ohne `lingvo` bleibt der bisherige Weg (Schlüsselwort, dann generisches Wort, dann `de`).

### D-07 Text-Prüfart `not-instead` für `link-navigates-button-acts` (A2, A3, S3)

Die Regel „ein Link mit Aktions-Label ist ein Verstoß“ ist eine Text-Regel: Das Label nennt eine Absicht, die der `ligilo` nicht bedient. Der `instead`-Eintrag `action` der Uzo trägt diese Schlüsselwörter schon (für `suggest_ero`). Die neue Prüfart `{ "kind": "not-instead" }` liest sie von dort (Art. I: die Wörter stehen einmal): Trifft ein Schlüsselwort eines `instead`-Eintrags das Label, scheitert die Prüfung, und die Lösung heißt „`Use butono instead`“ mit dem Kialo des Eintrags – nicht ein Beispiel-Label. So meldet `check_usage` den Fall `action` mit `use-instead: butono` (S3), über denselben Weg wie jede Text-Regel (Jugxoj approved/rejected, fest, `explain_regulo`).

*Verworfen:* ein eigener Enforcer je Regulo-Name mit fest verdrahteten `butono`-Wörtern (zweite Wortliste, Art. I).

### D-08 `suggest_ero`: Grenze und Absicht, die dasselbe sagen (S1, OP-12)

OP-12 (Spec 007) antwortet `ask-human` mit beiden Kandidaten, wenn eine Grenze **und** eine Absicht treffen. „Zur Projektübersicht“ trifft jetzt die Grenze `navigation` des `butono` (`use-instead: ligilo`) und – mit `übersicht` als Wort – die Absicht `navigate` des `ligilo`. Beide sagen `ligilo`; das ist kein Widerspruch. Neue Regel vor OP-12: Nennt die Grenze `use-instead: X` und trifft die Absicht ein Ero X, antwortet `suggest_ero` mit der Absicht (Ero, Props, Regulo) **und** der Grenze (mit ihrem Kialo). Nur wenn Grenze und Absicht auf verschiedene Eroj zeigen, bleibt es bei `ask-human` mit `candidates`. Dasselbe gilt für `instead`-Einträge mit Ero: „Speichern“ trifft `ligilo.instead.action → butono` und die Absicht `confirm` des `butono` → `butono`.

Schlüsselwörter der Absichten des `ligilo` folgen OP-12: keine Präpositionen, keine Allerweltsverben (`zur`, `öffnen`, `go to`, `open` entfallen; Mehrwort-Schlüsselwörter trifft die Wortsuche nie). `navigate`: en `navigate, navigation, overview`, de `navigieren, navigation, übersicht`; `external`: en `website, documentation, external`, de `webseite, dokumentation, extern`. `zurück`/`back` bleiben beim `butono` (`dismiss`); ein Link „Zurück zur Übersicht“ ist Navigation und darf kein Aktions-Label sein – deshalb fehlen `zurück` und `back` in `ligilo.instead.action` (Abweichung 3).

### D-09 Web Component: natives Link-Element nach `a11y.role` (A5, E5)

Die Element-Vorlage kennt heute ein `<button>`. Sie bekommt das Kontroll-Element aus `a11y.role`: `button` → `<button type="button">`, `link` → `<a>`. Celo-Wissen (Art. VIII), nur hier:

| Skemo | Web |
|---|---|
| Prop `to` | Attribut `href` des Link-Elements (E5) |
| Prop `external: true` | `rel="external noopener noreferrer"`; kein `target`: ob ein neues Fenster aufgeht, entscheidet die Anwendung, nicht das Ero. Dazu `aria-describedby` → Text aus `a11y.texts.external` (D-02) und das feste Icon im Slot-Fallback (D-05) |
| Teil `underline`: `width` | `text-decoration-line: underline; text-decoration-thickness: var(…)`; `none` → `text-decoration-line: none` |
| Teil `underline`: `color` | `text-decoration-color: var(…)` |
| `label.typography = inherit` | keine Schriftregel; das Kontroll-Element wird `display: inline; white-space: normal` (es ist Teil des Satzes) |
| `box.height|width = none` | `min-block-size: auto` / `min-inline-size: auto` |
| `uzo.layout.wrap = with-text` | `:host { display: inline }` statt `inline-block`, damit der Link mit dem Text umbricht |
| Zustand `visited`, `focus` | `:visited`, `:focus-visible` als Selektor-Suffix; Reihenfolge rest, visited, focus, hover, pressed, loading, disabled |

Zustände ohne eigene Bindung (Rückfall auf `rest`) erzeugen keine eigene CSS-Regel; so bleibt das Stylesheet des `butono` byte-gleich. Ein `<a>` ohne `href` ist kein Link; fehlt `to`, warnt das Element einmal (wie bei einem ungültigen Enum-Wert) und rendert trotzdem ein `<a>` – `disabled` gibt es nicht (E4, Grenze `disabled-link`). React: `Ligilo` wie `Butono` aus derselben Erzeugung; Navigation fängt eine Anwendung mit `onClick` + `preventDefault` ab, es gibt kein `onNavigate` und keine Router-Abhängigkeit (Art. XI; die Spec nennt `onNavigate` nur als Beispiel).

### D-10 `touch-target-min` gilt für `standalone` über `box` (A1, A2)

Die Spec will keine Kasten-Maße („ein Link ist Text“) **und** eine Mindest-Trefferfläche bei `standalone`. Beides zugleich trägt die Skemo nur über `box.height` und `box.width` **by `[placement]`**: `standalone` → `size.target.min`, `inline` → `none` (D-03). Web: `min-block-size`/`min-inline-size` wie beim `butono`; Figma: `minHeight`/`minWidth` wie beim `butono`. Die Regulo `touch-target-min` bekommt die Ausnahmeklausel für `ligilo` mit `placement: inline` im Statement und im Kialo (WCAG 2.5.8 nimmt Inline-Links aus); ihre Prüfung (Token-Ebene, `size.control.*` ≥ `size.target.min`) ändert sich nicht.

### D-11 Figma: ein Set `ligilo`, Unterstreichung als geschriebener Wert (A5, S5)

Varianten = `placement × size × state` (die Enum-Props, nach denen Teile gebunden sind, wie beim `butono`; `external` ist eine BOOLEAN-Eigenschaft des Plans, die das Plugin heute nicht anlegt – wie `disabled` beim `butono`). Je Variante schreibt der Plan zusätzlich `underline: true|false` aus `underline.width ≠ none`; das Plugin schreibt es als `textDecoration` des Label-Textknotens (ein geschriebener Wert wie `textCase`, keine Variable: Figma bindet Dicke und Farbe einer Unterstreichung an keine Variable). Der Teil `underline` steht deshalb in `FIGMA_NOT_DRAWN` mit einem **neuen Jugxo** (Jugxo-Text: Figma zeichnet die Linie, aber nicht aus dem Token `border.width.default`; Parität meldet `underline.width`/`underline.color` als „not drawn (Jugxo)“ – benannt, nicht still). `label.typography = inherit` wird im Set zu `typography.body.1` (Schrift und Bindung), weil ein Set keinen Container hat; der Modus wechselt damit die Schrift (S5). Die Fokus-Radien (`radius/focus/*`) werden aus dem **ersten Ero mit `box.radius`** abgeleitet, nicht aus `eroj[0]`; ein Ero ohne Radius bekommt keine `radii`. Beschreibung = `uzo.purpose` (erste Zeile des Markdown, Befund B1).

### D-12 Make Kit und Vitrino: je Ero, kein Button-Wortlaut (A5)

Make-Kit-`components/<ero>.md` ist schon je Ero generiert; die drei handgeschriebenen Button-Sätze (Label-Satz, Zustände „aus disabled und loading“, Überschrift „Which button for which goal“) werden aus der Skemo erzeugt (Zustände aus den booleschen Props, die auch Zustände sind; Überschrift mit dem Ero-Namen; bei `a11y.role: link` der Satz, dass `to` das Ziel ist). Vitrino: ein Abschnitt **je Ero** (`fm-vitrino-<ero>`) mit Zeilen aus den gebundenen Enum-Props (`styledProps`) und Spalten `rest` + jede boolesche Prop, die ein Zustand ist oder einen `a11y.texts`-Eintrag hat (`butono`: disabled, loading; `ligilo`: external). Das Feld `butono` der Vitrino-Daten wird `eroj: Record<string, string>`; der Uzo-Abschnitt bleibt je Ero. Für `ligilo` ist `to` in der Vitrino der Anker des eigenen Abschnitts.

### D-13 Reguloj (A2) und ihre Prüfung

| Regulo | Prüfbarkeit | Wo |
|---|---|---|
| `link-navigates-button-acts` | automatic, `check_usage` | Text-Regel `not-instead` (D-07), fest |
| `link-not-color-only` | automatic, Skemo-Prüfung (`REGULO_ENFORCERS`) | für jedes Ero mit Teil `underline` und einer Prop `placement` mit Wert `inline`: `underline.width` ist in jedem Zustand gebunden und nicht `none` |
| `link-label-names-destination` | automatic, `check_usage` | Text-Regel `not-words` (hier, klicken, mehr, link / here, click, more, link), fest |
| `external-link-marked` | automatic, Skemo-Prüfung | für jedes Ero mit boolescher Prop `external`: `a11y.texts.external` mit `de` und `en`, dekorativer Slot `icon-end` (D-05) |
| `link-label-not-url` | automatic, `check_usage` | Text-Regel `not-words` (`http`, `https`, `www`), anpassbar, `severity: error` |
| `touch-target-min` | unverändert | Statement und Kialo mit Ausnahmeklausel (D-10) |
| `spacing-owned-by-container` | unverändert | `appliesTo.eroj` += `ligilo` (die Uzo nennt sie) |

Neue Fixtures und Regel-Ids: `skemo-web-term` (ein Prop-, Slot-, Teil- oder Zustandsname ist ein Web-Begriff: `href`, `src`, `rel`, `class`, `style`, `tabindex`, `onclick`, `aria-*`, Elementnamen wie `input`, `a`, `button`, `textarea`; `type`, `disabled`, `name`, `value`, `placeholder`, `required`, `readonly` sind **keine**, weil sie als Prop-Namen plattformneutral lesbar sind – Spec 009 E7 entscheidet `kind` statt `type` für das Feld aus einem anderen Grund), `skemo-a11y-invalid` (D-02), `uzo-boundary-covered` (D-14).

### D-14 `butono`-Uzo nachgezogen; keine Grenze zeigt `ask-human` auf ein Ero, das es gibt (A4)

`navigation` wird `action: use-instead, ero: ligilo`; der Kialo endet mit „Fundamento covers it with ligilo.“ Neue Validierung `uzo-boundary-covered`: Ein `boundary`-Eintrag mit `ask-human` (oder ein `instead`-Eintrag mit `ero: null`), dessen Schlüsselwörter ein Schlüsselwort einer Absicht eines **anderen** Ero sind, ist ungültig – wenn Fundamento das Ero hat, ist die Antwort `use-instead`. Die Fixture `invalid/uzo-boundary-covered` zeigt den alten Zustand (`navigation` als `ask-human` neben einem `ligilo`).

### D-15 Ontologio: Schema `eroj` (A8)

Die Ontologio kennt heute kein `butono`; ihre Schemata sind `terminologio` (Constitution-Tabelle), `modelo` (Entitätstypen) und `principoj`. Ein Ero ist kein Begriff der Terminologie und kein Entitätstyp. Kleinste Änderung, die beide Specs trägt: ein viertes Schema **`eroj`** („Die Eroj des Modelo und ihre Beziehungen“) mit einem Konzept je Ero (`#Butono`, `#Ligilo`; `broader: ["#Ero"]`, `notation` = Ero-Name) und Beziehungen mit dem bestehenden Prädikat `references` in beide Richtungen. Drift-Prüfung: je Ero des Repo-Modelo genau ein Konzept im Schema `eroj` (`ero-concept-missing`/`-extra`). Ein eigenes Prädikat „insteadOf“ wäre eine Frage an den Maintainer (Spec 007 D-11) und steht unter Befunde.

### D-16 Rot zuerst (A7)

Fünf Fixtures vor dem ersten Umsetzungscode, jede eine Kopie von `valid/ero-minimal` plus genau ein Fehler: `skemo-web-term` (`href` statt `to`), `skemo-inline-underline` (`inline` ohne `underline` in `hover`), `skemo-external-unmarked` (`external` ohne `a11y.texts`), `uzo-instead-kialo-missing`, `uzo-boundary-covered`. Der Fixture-Lauf (`validate-modelo.test.ts`) wird rot mit „expected rule … not reported“, und `contracts.test.ts` wird rot, bis die Regel-Ids im Katalog stehen. `uzo-instead-kialo-missing` deckt Spec 007 schon ab (`uzo-kialo-missing` prüft `instead`); ihr Rot wurde durch Mutation beobachtet (Eintrag `/uzo/instead` aus `kialoIssues` entfernt → Fixture meldet nichts) und steht unten.

## Projektstruktur (Delta)

```
specs/008-ligilo/                       spec.md (kopiert), briefing, plan.md, tasks.md
packages/modelo/
  data/eroj/ligilo/skemo.json, uzo.json
  data/eroj/butono/uzo.json              navigation → use-instead ligilo
  data/reguloj.json                      5 neue Reguloj; touch-target-min Klausel; spacing-owned-by-container appliesTo
  data/jugxoj.json                       12 Beispiele + 1 Jugxo (Figma underline)
  data/kontrastparoj.json                3 Paare color.link.* auf background.canvas
  data/ids.lock.json, data/ontologio.json (Schema eroj)
  schema/modelo.schema.json              a11y.texts, wrap with-text, EroInstance.lingvo, check not-instead
  schema/ontologio.schema.json           Schema eroj
  src/eroj/skemo-rules.ts                BINDING_KEYWORDS, skemo-web-term, skemo-a11y-invalid
  src/eroj/uzo-rules.ts                  uzo-boundary-covered
  src/eroj/usage.ts                      not-instead, lingvo, with-text
  src/gvidanto/suggest-ero.ts            D-08
  src/validate/regularo-enforcement.ts   link-not-color-only, external-link-marked
  src/ontologio/check.ts                 ero-concept-missing/-extra
  src/data/ligilo.test.ts                neu
  test/fixtures/invalid/{skemo-web-term,skemo-inline-underline,skemo-external-unmarked,uzo-instead-kialo-missing,uzo-boundary-covered}
packages/mcp/   schema/tools/get_ero.output.json (wrap), prompts/gvidanto.md (Regel 13), src/e2e/s008-ligilo.test.ts
packages/projekcioj/src/celoj/{web-component,react,figma,make-kit,vitrino}
packages/eroj/test/{ligilo.spec.ts, alirebleco.check.ts, internacia.spec.ts, serve.ts}
docs/vojmapo.md                          Zeile 4
```

## Constitutional Compliance Review

- **Art. I Modelo-First:** Skemo und Uzo sind die Quelle; Guidelines, Vitrino, Figma-Beschreibung, `brief` werden erzeugt. Die Aktions-Wörter stehen einmal (`instead.action`, D-07). Die Bindungs-Schlüsselwörter stehen an einer Stelle (D-03).
- **Art. II Unu Vortaro:** `to`, `placement`, `external`, `size` heißen in Web, React, Figma und Guidelines gleich; die Übersetzung `to → href` ist Celo-Wissen der Web-Projekcio (Art. VIII).
- **Art. III Masxinlegebleco:** `get_ero`, `suggest_ero`, `check_usage` tragen das neue Ero; `describe_term ligilo` antwortet aus der Ontologio (D-15).
- **Art. IV Nativa Multmarkeco:** keine Marke in Skemo oder Uzo; `a11y.texts` ist markenneutral und zweisprachig.
- **Art. V Pura Cxambro:** Benchmark der Spec in eigenen Worten; keine Beispiele Dritter. `research.md` entfällt: der Plan trifft keine Entscheidung, die über die Spec hinaus eine Quelle braucht.
- **Art. VI Regularo kun Kialoj:** jede neue Regulo, jeder `instead`/`boundary`/`composes`-Eintrag trägt einen Kialo; eine Grenze, die ein Ero abdeckt, darf nicht `ask-human` sagen (D-14).
- **Art. VII Agenta Dokumentado:** Beispiel-Dialog als e2e-Test (T026) und als Abnahme in frischer Sitzung; Prompt-Regel 13.
- **Art. VIII Retejo Unue:** `to` statt `href` (E5), `skemo-web-term` als Sicherung; `a11y.texts` in `de` und `en`; `inherit`/`none` sind plattformneutrale Wörter.
- **Art. IX Vertikala Tranĉo:** ein Ero durch alle Ebenen; `kampo` folgt in PR B.
- **Art. X Kontrolo:** fünf Fixtures rot zuerst (D-16); Parität für zwei Eroj; Alirebleco und Internacia in beiden Test-Aspektoj.
- **Art. XI Simpleco:** kein Paket, kein Werkzeug, keine neue Datenart. Drei additive Schema-Felder (`a11y.texts`, `lingvo`, `not-instead`), ein Enum-Wert (`with-text`), zwei Schlüsselwörter, ein Ontologio-Schema – jedes mit zwei Nutzern (ligilo und kampo oder ligilo und butono).
- **Art. XII Interoperebleco:** Vortaro unverändert; Figma-Sammlung unverändert (Plugin-Lauf in `f10b-5`).
- **Art. XIII Simpleco de Uzo:** Quickstart unverändert; `fm-ligilo` kommt mit demselben Import.

## Abweichungen von der Spec (Regel 0, Spec nicht editiert)

1. **`a11y.texts` statt `a11y.suffix`** (D-02): Spec 009 nennt dieselbe Sache `a11y.texts`; ein Name für beide.
2. **Absichts-Schlüsselwörter ohne Präpositionen und Allerweltsverben** (D-08): `zur`, `öffnen`, `go to`, `open`, `back to` entfallen (OP-12, Spec 007); Mehrwort-Schlüsselwörter trifft die Wortsuche nicht.
3. **`zurück`/`back` fehlen in `instead.action`** (D-08): Sie sind beim `butono` `dismiss`, aber ein Link „Zurück zur Übersicht“ ist Navigation; die Spec zählt `dismiss` zu den Aktions-Labels **und** nennt `zurück zu` als Navigations-Wort – der Plan löst den Widerspruch zugunsten der Navigation.
4. **`external-link-marked` steht nicht unter `content`** (D-13): `content` trägt Text-Prüfungen; diese Regel prüft die Skemo. Sie gilt für `ligilo` (`appliesTo.eroj`) und wird im Modelo durchgesetzt.
5. **`never: action-bar` ist nicht ausdrückbar** (A3): `composes.never` nimmt Eroj, keine Container. Der Ausschluss steht im Kialo des Eintrags `never: butono` („… and not in an action-bar: a bar of actions reads a link as an action“). Ein Container-`never` wäre eine Schema-Erweiterung mit einem Nutzer (Art. XI) – Kandidat, wenn ein zweites Ero sie braucht.
6. **`full-width: never` entfällt** (A3): `layout.<prop>` muss eine boolesche Prop der Skemo sein (`uzo-prop-unknown`); der `ligilo` hat keine. Was es nicht gibt, muss nicht verboten werden.
7. **`box.height`/`box.width` by `[placement]`** (D-10): Die Spec sagt „kein `box.height`“ und verlangt zugleich die Mindest-Trefferfläche bei `standalone`; `none` bei `inline` hält beides.
8. **`link-label-not-url` als `not-words`** (D-13): `http`, `https`, `www` als Wörter statt einer neuen Prüfart „URL-Muster“ – die Wortzerlegung trennt an `:` und `/`, so trifft jede Adresse.
9. **Figma: `size` ist eine Variantenachse auch bei `inline`** (A5, von der Spec als akzeptabel genannt): `label.typography` ist by `[placement, size]`; `inline` bindet für jede Größe `inherit`, so wie `type` beim `butono` ohne Wirkung ist.
10. **Figma-Beschreibung zweisprachiger Zusatz**: Der gehörte Text steht im Uzo-Markdown des Sets (Abschnitt „A11y“), nicht als eigene Eigenschaft; Figma hat dafür kein Feld.

## Befunde / Mankoj (nicht geändert, geführt)

- **B-1 Jugxo für `underline` in Figma** (D-11): P0 hat einen Jugxo angelegt, der die Differenz freigibt (Linie geschrieben, Dicke nicht gebunden). Ein Jugxo ist eine Entscheidung des Maintainers; dieser ist **zur Bestätigung** gestellt. Ohne ihn wäre `check:parity` rot (`underline.width` ohne Figma-Seite).
- **B-2 Externes Icon in Figma** (D-05): nicht gezeichnet (Jugxo Icon, 2026-09-21). Ob Figma eine BOOLEAN-Eigenschaft `external` mit Icon-Sichtbarkeit trägt, ist eine Messung in echtem Figma (Art. VI) – Kandidat für ein Manko nach der Messung in `f10b-5`.
- **B-3 Ontologio-Prädikat für „instead/boundary“** (D-15): `references` in beide Richtungen; ein eigenes Prädikat ist eine Frage an den Maintainer.
- **B-4 `label-required` gilt nur für `butono`**: Der `ligilo` hat denselben Bedarf (Name aus Slot oder Prop), die Spec nennt ihn nicht; axe prüft den Namen am gerenderten Link (`link-name`). Regulo-Kandidat: `label-required` auf `ligilo` ausweiten (Regulo-Semantik → nicht in diesem PR).
- **B-5 `inline`-Icon ohne Abstand**: `box.gap` wirkt bei `display: inline` nicht; das externe Icon steht im Fließtext ohne `spacing.small`. Kandidat: `margin-inline-start` aus `box.gap` für den Inline-Fall (Celo-Wissen), nach Sichtprüfung in der Vitrino.
- **B-6 Figma-Standardlabel „Aktion“** gilt auch für den `ligilo` (`LABEL_DEFAULT`); ein Link liest sich damit falsch. Sichtbarer Text ist eine Entscheidung des Maintainers (F14).

## Abnahme-Messung 2026-10-13 (Maintainer, `messung-abnahme-2026-10-13.md` im Spec-Ordner des Auftrags)

MCP 11/12, Figma 7/9, Vitrino Markenwechsel und Gebrauch grün; ein Blocker, behoben in diesem PR:

- **F-3 (behoben):** `fm-ligilo` zeigte in jedem Zustand einen Rahmen. Ursache: die Strukturregel der Element-Vorlage setzte `border-style: solid` für jedes Ero; der `ligilo` hat keinen Teil `border`, also setzte nichts die Breite, und der Browser zeichnete seinen Anfangswert (`medium`, `currentColor`). Fix: `border-style` steht nur im Stylesheet eines Ero mit Teil `border`. Rot zuerst (Commit `21c255e`): Stylesheet-Test und gerenderter `fm-ligilo` mit `border-width` 0 in rest/hover/focus, in komuna und ekzemplo. Figma braucht nichts: dort gab es den Rahmen nicht.

### Folge-Aufgaben (nicht in #53 geändert)

- **F-1 Figma:** Ein neues Komponentenset entsteht am Ursprung des vorhandenen (gleiche Position); Sets nebeneinander legen oder in eine Section „Fundamento“ (siehe F-2).
- **F-2 Gvidanto:** Antwort auf „Wie schalte ich die Marke in Figma um?“: Modus an der Seite oder am Frame, nie am einzelnen Set (ein Modus am Set gilt nur für das Set; Sets auf „Automatisch“). Prompt oder `describe`.
- **R-9 `suggest_ero`:** `props.external` kommt als Text `"true"` statt als Wahrheitswert; die Props der Absicht werden in `goalHit` zu Strings gemacht (Spec 003) – ein boolescher Prop sollte boolesch bleiben (Vertrag `suggest_ero.output`, EroInstance-Props erlauben boolean).
- **R-10 `brief`:** `required.props` führt `label`, weil es keinen Standard hat; Pflicht ist nur `to`. `label` ist der Ersatzname bei leerem Slot (wie beim `butono`). Kandidat: „Pflicht“ aus der Skemo ausdrücken (ein Prop ohne Standard, den die Uzo nicht als Ersatz kennzeichnet), oder den Ersatznamen in der Skemo markieren.
- **R-1 (bestätigt):** „Mehr zum Datenschutz“ wird von `link-label-names-destination` beanstandet (Wort `mehr`). Die Wortliste trifft auch ein Label, das das Ziel nennt; Kandidat: `mehr`/`more` nur allein oder als Ein-Wort-Label beanstanden (Prüfart `not-words` → `not-only-words`).
- **C8 Textnuance:** Der Vitrino-Satz „Label darf umbrechen“ gilt bei `with-text` nur inline; Satz je Wert ausgeben.

## Nachlese 2026-10-13

Nach #53, Briefing P0 Nachtschicht 13./14.10. Umgesetzt im Nachlese-PR (Basis `main` 72a11e3), jede Zeile mit rotem Test zuerst; was Regulo-Semantik berührt, nur geführt (Regel 0):

- **F-1 Figma, umgesetzt:** Ein Set, das der Lauf anlegt, liegt rechts neben dem letzten vorhandenen Set (rechte Kante + `spacing.xlarge`, 24 px, als fester Wert im Plan `section.gap`); vorgefundene Sets behalten ihren Platz. Der Bericht nennt je Set `placement` (`x`, `y`, `after`, `action: created | moved | kept`). Rot zuerst (Commit `9869170`). Double-Annahmen zur Messung in `f10b-5` stehen im PR.
- **ersetzt durch F-8 (2026-10-14)** – **F-7 Figma (gemessen 2026-10-14 in f10b-5), umgesetzt im eigenen PR:** Nach dem Markenwechsel an der Section (komuna → ekzemplo) wurde das Set `kampo` breiter (Archivo Black) und überlappte `ligilo`; der Abstand kam aus den Breiten im Standardmodus. Entscheidung nach Regel 0 (kleinster Weg, der beide Marken trägt): kein Messen je Modus (das Plugin setzt an der Section keinen Modus, F-2), sondern der Abstand nach einem Set ist mindestens die halbe Breite dieses Sets (`section.reserve` = 0,5 im Plan, `spacing.xlarge` bleibt Untergrenze). Ein vorgefundenes Set, das seinem linken Nachbarn näher steht, rückt einmal nach rechts (`placement.action: spaced`); der nächste Lauf findet genug Platz und behält alles; ein vom Maintainer weit nach rechts gezogenes Set bleibt. Rot zuerst (Commit `7357baa`). Keine Tokens, keine Spec-Änderung.
- **F-8 Figma (gemessen 2026-10-14 in f10b-5), umgesetzt als eigene Commits auf dem Branch von Spec 010 ① (`261014-spec-010-sxaltilo-010092`, nur Plugin):** Nach dem Plugin-Lauf von `1e8a147` (sieben Sets) lag das neue Set `elektilo` auf `ligilo`. Die Reserve von F-7 reicht nicht: das Plugin legte die Sets aus ihrer Reihenfolge und ihren Breiten im Standardmodus, die Breiten ändern sich aber je Markenmodus (Archivo Black ist breiter). Neuer Weg (Entscheidung des Maintainers, Regel 0: „das Werkzeug kann es“): In der Section „Fundamento“ legt das Plugin **einen Frame `Eroj`** an, markiert wie die Section (`frame`), sodass ein zweiter Lauf ihn findet, im Innenabstand der Section; Auto-Layout `layoutMode: HORIZONTAL`, `layoutWrap: WRAP`, `itemSpacing` und `counterAxisSpacing` = `spacing.xlarge` (24 px, `section.gap` im Plan, aus dem Token), `layoutSizingHorizontal`/`layoutSizingVertical: HUG`, keine Füllung, alles, was das Plugin an einem Knoten besitzt, neutral. Alle Sets sind seine Kinder (`layoutPositioning: AUTO`); Sets auf der Seite oder direkt in der Section werden hineinverschoben (wie F-2 sie in die Section verschob), ein neues Set kommt ans Ende. Das Plugin rechnet keine x/y eines Sets mehr, Figma legt sie aus. Bericht: `section: { name, found, created, moved, frame: { name: "Eroj", found, created, wrap } }` (`moved` = jedes Set, das der Lauf außerhalb des Frames fand), je Set `placement: { frame: "Eroj", action: "in-layout" }`. Die Section umschließt den Frame mit Innenabstand – im Modus beim Lauf; eine Section hugt nicht, nach einem Markenwechsel kann der Frame über sie hinausragen bis zum nächsten Lauf. Entfernt: `SET_WIDTH_RESERVE`, `section.reserve` (der Plan trägt jetzt `section.frame`), `gapAfter`, `leftNeighbour`, `ownedSets`, die Aktionen `kept`/`created`/`moved`/`spaced` samt `x`/`y`/`after` im `placement`; die F-7-Tests sind durch F-8-Tests ersetzt (F-1/F-2 bleiben: eine Section, Sets darin, kein Modus an der Section, zweiter Lauf ändert nichts, Beschriftung je Rolle). Rot zuerst (Commit `25e30a5`): zwei Sets mit verschiedener Breite je Modus überlappen in keinem Modus. **Was das Double annimmt (Messung in `f10b-5`):** ein horizontaler Frame mit `layoutWrap: WRAP` legt seine Kinder in ihrer Reihenfolge in Reihen; ein Kind beginnt eine neue Reihe, wenn es über die Innenbreite (Breite minus Innenabstände) hinausreichte; eine Reihe ist so hoch wie ihr höchstes Kind, `counterAxisSpacing` liegt zwischen den Reihen, `itemSpacing` in der Reihe, jedes Kind oben in seiner Reihe. Ein Frame, der in der Breite hugt, hat keine Breite zum Umbrechen: eine Reihe, er wächst mit (ob Figma HUG mit WRAP annimmt, ohne zu werfen, und dann eine Reihe legt, ist die Messung). Lehnt Figma `layoutWrap: WRAP` ab, bricht der Lauf nicht ab (wie eine abgelehnte Schriftbindung, F30): der Frame bleibt eine Reihe ohne Umbruch, `section.frame.wrap` ist `"refused"` (sonst `"WRAP"`), eine Warnung trägt Figmas Wortlaut. Jede Abfrage legt neu aus den aktuellen Größen aus: wächst ein Set, rücken seine Nachbarn ohne neuen Lauf. Das Double schaltet keine Größen je Modus (es löst den ersten Modus auf); der Markenwechsel ist im Test als längere Beschriftungen gezeichnet, die das Double misst. Keine Tokens, keine Spec-Änderung. Nachtrag: Eine feste Breite, die der Maintainer dem Frame gibt (nur so entstehen Reihen – Hug-Breite bricht nie um), bleibt beim nächsten Lauf erhalten; Hug in der Breite schreibt das Plugin nur beim Anlegen des Frames.
- **F-2 Figma, umgesetzt:** Alle Sets liegen in einer Section „Fundamento“ (angelegt, wenn sie fehlt; Sets von der Seite werden hineinverschoben; Innenabstand `spacing.xlarge`). Das Plugin setzt und löscht an der Section nie einen Modus – ein Modus an der Section ist der Markenschalter der Bibliothek, die Sets stehen auf „Automatisch“ (F35). Bericht: `section: { found, created, moved }`.
- **F-2 Gvidanto, umgesetzt:** Prompt-Regel 14: „Wie schalte ich die Marke in Figma um?“ → Modus der Sammlung `aspekto` an der Seite oder an einem Frame/einer Section, nie am einzelnen Set; ein Modus am Set gilt nur für das Set. Geprüft in `prompt.test.ts` und `s008-ligilo.test.ts` (rot `d351096`).
- **M-3 Standardlabel je Ero, umgesetzt:** butono „Aktion“, ligilo „Ziel“, kampo „Beschriftung“, aus der a11y-Rolle (Celo-Wissen, Art. VIII); ein vorgefundenes Set bekommt das Wort beim nächsten Lauf. Entscheidung des Maintainers (F14) als Jugxo `jug_01M4VCG06S4MWFPVPNWMBN9EWF` festgehalten.
- **R-9 `suggest_ero`, umgesetzt:** Props bleiben typisiert (`external: true` als Wahrheitswert); Vertrag `suggest_ero.output` nimmt string, number, boolean – wie `EroInstance.props`. Rot `d351096`.
- **R-10 `brief`, umgesetzt:** `required.props` nennt nur Props, die die Skemo als Pflicht markiert (`SkemoProp.required`, kleinste Änderung: das Feld fehlte); der `ligilo` markiert `to`, sonst keiner. `label` ist der Ersatzname bei leerem Slot, keine Pflicht. Rot `d351096`.
- **R-1 nur dokumentiert:** `link-label-names-destination` sagt in `scope`, dass `not-words` eine Näherung ist (trifft jedes Vorkommen); Kandidat `not-only-words` in der Vojmapo (Phase 6 Lint). Die Prüfart selbst ist Regulo-Semantik (Regel 0.3) und bleibt.
- **C8 Textnuance, umgesetzt (Vitrino):** „Label darf umbrechen (inline), standalone nie.“ je Wert von `wrap`; rot `1382e26`.
- **Offen bleiben:** B-2 externes Icon in Figma (Messung in `f10b-5`), B-4 `label-required` für den `ligilo` (Regulo-Semantik), B-5 Inline-Icon ohne Abstand (Sichtprüfung), `check_usage` bei `inline` + `size` (Regulo-Kandidat).

## Messungen

Die Werte stehen in [`tasks.md`](tasks.md) → „Messungen“. Kurz: `get_ero ligilo brief:true` = 1 485 Bytes = **495** nach dem Maß von Spec 007 (Grenze 750 bleibt); Parität 2 Eroj × 4 Seiten ohne Differenz; `check:alirebleco` 66 Paare × 72 Kombinationen grün (Link auf Canvas min 6.12:1); Alirebleco der Eroj 8 Kombinationen je Ero in Chromium; `check:regularo` ohne `skemo-uzo-missing`.

## Offen (für den Maintainer, nicht blockierend)

- **Prüfblatt morgen:** S1–S3 per Harness (`packages/mcp/src/e2e/s008-ligilo.test.ts` ist der automatisierte Teil), Figma-Lauf in `f10b-5` (Set `ligilo`, Beschreibung beginnt mit `purpose`, Moduswechsel wechselt `color/link/rest` und die Schrift über `typography/body/1` bzw. `typography/label/*`), Vitrino-Abschnitt `fm-vitrino-ligilo` mit Spalte `external`.
- **`check_usage` warnt nicht bei `inline` + explizitem `size`** (A1, Prop-Tabelle): Dafür gäbe es keine Regel-Id und keine Regulo; eine Warnung ohne Regulo wäre eine Faustregel im Code (Art. VI). Kandidat: Regulo „prop ohne Wirkung“ als Skemo-Wissen (`size` wirkt nur bei `standalone`), dann in `check_usage`.
- **Drei Engines:** Die Browser-Tests liefen in Chromium (PR-Lauf); Firefox und WebKit laufen auf `main` (CI-Regel).
