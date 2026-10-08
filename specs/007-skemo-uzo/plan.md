# Plan – Spec 007: Uzo, der Gebrauch eines Ero

**Spec:** [`spec.md`](spec.md) · **Research:** [`research.md`](research.md) (Abschnitt „Messungen“ von diesem Plan ergänzt) · **Datenmodell:** [`data-model.md`](data-model.md) · **Verträge:** [`contracts/mcp-tools.md`](contracts/mcp-tools.md) · **Aufgaben:** [`tasks.md`](tasks.md) · **Constitution:** v2.0 bindend, in dieser Spec auf **v2.1** erweitert (D-11) · **Rahmen:** [`docs/vojmapo.md`](../../docs/vojmapo.md) Zeile 3c · **Stand:** vom Maintainer geprüft am 2026-10-08, Entscheidungen eingearbeitet (Abschnitt „Offene Punkte – entschieden“); Stufe A freigegeben · **Datum:** 2026-10-08 · **Basis:** `main` @ `8d1870e`

Dieser Plan legt den technischen Entwurf von Spec 007 fest. Er trennt, was vor der Abnahme von Spec 003 laufen darf und was erst danach. Die Umbenennung F1 plant er als eigenen Strang mit eigenem PR. Der Entwurf wird gegen jeden Artikel der Constitution v2.0 geprüft. Die Fragen an den Maintainer stehen am Ende unter „Offene Punkte für den Maintainer“. Umgesetzt wird erst nach der Freigabe von Plan und Aufgaben.

## Zusammenfassung

Die Skemo sagt, wie ein Ero gebaut ist. Die Uzo sagt, wie es gebraucht wird. Spec 007 führt die Uzo als eigene Datenart ein und zieht sie am `butono` durch alle Ebenen (Art. IX):

1. **Modelo:** `data/eroj/<ero>/uzo.json` mit eigenem Schema, eigener Id (`uzo_`) und Validierung (A1–A7). Fünf neue Reguloj, darunter drei Text-Regeln. Text-Regeln sind fest oder anpassbar. Eine Aspekto überstimmt eine anpassbare Regel über `tavoloj.lingvo.overrides` mit einer Jugxo. Die Uzo kommt in den Export.
2. **Gvidanto (MCP):** `get_ero` liefert die Uzo und mit `brief: true` eine generierte Kurzfassung unter einer gemessenen Obergrenze (A8). `suggest_ero` kennt Grenzen und Alternativen (A9). `check_usage` prüft Grenzen, Slots, Layout und Text (A10). Der Prompt bekommt eine Regel für `ask-human`.
3. **Projekcioj:** Make-Kit-`guidelines/`, Vitrino und Figma-Beschreibung tragen die Uzo. Was Figma nicht tragen kann, wird gemessen und als Manko geführt (A12).
4. **Begriff:** Constitution v2.1 mit **Uzo** in der Terminologio, Ontologio-Eintrag mit „Gebrauch“ und „usage“ (A13).

Keine neue Abhängigkeit und kein neues Paket.

## Technischer Kontext

| Punkt | Wert |
|---|---|
| Sprache, Laufzeit | TypeScript 7, Node ≥ 24, unverändert |
| Neue Abhängigkeiten | keine |
| Neue Pakete | keine (Art. XI) |
| Speicher | Git; `packages/modelo/data/eroj/butono/uzo.json`; erzeugte Artefakte wie bisher nicht eingecheckt |
| Tests | Vitest (Schema, Validierung, Gvidanto, MCP, Projekcioj), Fixtures unter `packages/modelo/test/fixtures/invalid/`; Rot vor jeder Umsetzung, beobachtet und im Commit festgehalten |
| Leistung | `get_ero`, `suggest_ero`, `check_usage` unter 100 ms je Aufruf wie bisher (`packages/mcp/src/e2e/perf.test.ts`) |
| Größe | `get_ero butono` heute 21 053 Bytes kompakt; Kurzfassung im Entwurf 1 661 Bytes (research.md, Messungen) |
| Randbedingungen | Byte-identischer Export über zwei Builds (AK-10); keine Celo-Namen im Export (AK-12); kein Web-Begriff im Modelo (Art. VIII) |

## Constitution Check (Tor vor dem Entwurf)

| Tor | Ergebnis |
|---|---|
| Neue Datenart bekommt ihren Spec-Ordner vor der Umsetzung (Lehre aus Spec 005) | erfüllt: Spec, Research, Plan und Aufgaben liegen vor, umgesetzt ist nichts |
| Versionsnummer gegen die Basis geprüft (Lehre aus Spec 005) | erfüllt: `main` @ `8d1870e` trägt v2.0; die offenen PRs #41, #42 und #44 ändern die Constitution nicht. Nächste freie Nummer: **v2.1**. Vor dem Merge erneut prüfen (T010) |
| Durchstich an einem Ero (Art. IX) | erfüllt: nur `butono` |
| Höchstens drei neue Pakete (Art. XI) | erfüllt: null |

## Voraussetzung Spec 003: was vorher laufen darf und was erst danach

Die Abnahme von Spec 003 ist offen (M1 Figma-Library, M2 Make Kits, M3 S5-Lauf). M2 und M3 prüfen genau die Ausgaben, die Spec 007 erweitert: die Make-Kit-Guidelines und die Antworten von `get_ero` und `check_usage`, die der prüfende Agent in S5 benutzt. Was diese Ausgaben ändert, wartet daher auf die Abnahme. Sonst nimmt der Maintainer etwas ab, das sich unter ihm verschiebt.

| Stufe | Inhalt | Warum hier | PR |
|---|---|---|---|
| **A – vor der Abnahme** | Fehlerfixtures A11 (rot), Schema `UzoFile`, Entitätstyp `uzo`, Laden und Validierung der Uzo, Warnung „Skemo ohne Uzo“, Web-Begriff-Test, `EroInstance`- und `Tavoloj`-Schema (additiv), Constitution v2.1 und Ontologio-Eintrag | Berührt keine Ausgabe, die M1 bis M3 prüfen: Es gibt noch keine `uzo.json` für `butono`, also bleiben Export, `get_ero`, Guidelines und Figma byte-gleich. `describe_term Uzo` ist eine neue Antwort, keine geänderte | PR „Spec 007 Stufe A“ |
| **F1 – nach der Abnahme** | Umbenennung der Absicht `intent` → `goal` (F1-T00, OP-4), danach `variant` → `emphasis`, `tone` → `intent` | Spec: eigene Aufgabe nach der Abnahme von 003. Sie bricht Figma-Komponente und Make Kits, also genau die Abnahmegegenstände | eigener PR „F1 Achsennamen“ |
| **B – nach der Abnahme und nach F1** | `butono/uzo.json`, neue Reguloj und Jugxoj, geänderte Beispiel-Labels, Export, `get_ero` mit Uzo und `brief`, `suggest_ero`, `check_usage`, Prompt, Make-Kit-Guidelines, Vitrino, Figma-Beschreibung, Manko-Messung, Abnahme-Dialog | Ändert die Ausgaben von M2 und M3. Nach F1, damit neue Beispiele gleich mit den neuen Achsennamen entstehen und nicht zweimal angefasst werden | PR „Spec 007 Stufe B“ |

## Entwurfsentscheidungen

### D-01 Uzo als eigene Datei neben der Skemo (A1, F3)

`data/eroj/<ero>/uzo.json` wird vom selben Lader gelesen wie `skemo.json` (`load/eroj`). `LoadedEro` bekommt ein optionales Feld `uzo`. Der Export bekommt einen Schlüssel `uzoj`, wie `mankoj` mit Spec 005. Eine Uzo ohne Skemo im selben Ordner ist ein Fehler (`uzo-skemo-missing`), eine Skemo ohne Uzo eine Warnung in `check:regularo` (`skemo-uzo-missing`). Neuer Entitätstyp `uzo` mit Präfix `uzo` in `ENTITY_ID_PREFIXES`. Die Id vergibt `pnpm id:new uzo`. Felder in [`data-model.md`](data-model.md) §2.

*Verworfen:* Felder in der Skemo. F3 hat entschieden, dass Gebrauch Wissen eigener Art ist. Eine eigene Datei hält die Skemo zudem so, wie M1 bis M3 sie abnehmen.

### D-02 Text-Regeln sind Reguloj; fest oder anpassbar sagt die Uzo (A7, F2)

Jede Text-Regel ist eine gewöhnliche Regulo in `reguloj.json` mit Statement und Kialo, `appliesTo.eroj: ["butono"]`. Die Uzo verweist auf sie und trägt `fixed` und die deterministische Prüfung (`names-goal`, `verb-and-object`, `not-words`). Daraus folgt dreierlei:
- Jugxo-Beispiele hängen über das bestehende `ekzemplo.regulo` an der Regel. Der bestehende Test „approved ergibt keine Verletzung, rejected genau eine“ deckt die Text-Regeln ohne neuen Mechanismus ab.
- `explain_regulo` und `list_reguloj` erklären die Text-Regeln, ohne dass sie geändert werden.
- Die Eigenschaft `fixed` steht an einer Stelle (Art. I), nämlich in der Uzo und nicht zusätzlich in der Regulo.

Geprüft wird ohne Sprachmodell (D-16 aus Spec 003). „Nennt die Aktion als Verb“ heißt: Das Label enthält ein Schlüsselwort einer Absicht (goal) des Ero. Das ist eine Näherung und steht so im Statement.

**Entscheidung 2026-10-08:** `label-names-action` meldet vorerst nur `severity: warning` und keinen Fehler. Die Schlüsselwortliste würde legitime Verben wie „Senden“ oder „Teilen“ abweisen, solange sie nicht in einer Absicht stehen. Die Stufe steht in der Uzo (`content[].severity`); eine feste Regel ist immer `error`. **Regulo-Kandidat:** eine bessere Prüfung für „nennt die Aktion als Verb“, die ohne Sprachmodell auskommt (etwa eine Verbliste je Sprache im Modelo statt der Absichts-Schlüsselwörter). Danach wird die Regel neu bewertet und erst dann ein Fehler (Art. VI, „Befund wird Regel“).

*Verworfen:* Text-Regeln als eigener Satztyp mit eigener Id in der Uzo. Er bräuchte eigene Jugxo-Verweise, eigene Erklärwerkzeuge und eigene Fixtures. Das wäre eine neue Abstraktion ohne zweiten Nutzer (Art. XI).

### D-03 Überstimmung durch eine Aspekto: Tavolo-Eintrag plus Jugxo (A7)

`aspekto.json#/tavoloj/lingvo/overrides: [{ regulo, jugxo }]`. Die Jugxo trägt `aspekto`, `ref.regulo` und `decision: deviation-recorded`, so wie Abweichungen heute schon festgehalten werden. Eine feste Regel lässt sich nicht überstimmen (`uzo-override-fixed`). Eine Überstimmung ohne passende Jugxo ist ungültig (`uzo-override-jugxo-missing`). Geprüft wird beim Zusammensetzen der Aspekto-Pakete (`compose`), weil externe Pakete erst dort sichtbar sind. In `check_usage` erscheint eine überstimmte Regel als `info` mit der Jugxo-Id und nicht als stilles Weglassen.

*Verworfen:* die Jugxo allein als Überstimmung. Dann wäre „Überstimmung ohne Jugxo“ (Fixture 9 aus A11) nicht ausdrückbar, und die Tavolo als Ort der Marke (Spec, Verhältnis zur Tavolo „Verhalten“) bliebe leer.

### D-04 `EroInstance` wächst additiv (A5, A6, A10)

Drei optionale Felder: `aspekto` (für D-03), `dimensioj` (für `full-width` unter `viewport=compact`) und `slots` (was in einem Slot steht: `text`, `icon` oder `{ ero }`). Bestehende Instanzen, Jugxo-Beispiele und Aufrufe bleiben gültig. `check_usage` prüft `aspekto` und die Dimensio-Namen gegen das Modelo und meldet Unbekanntes als `mcp-input-invalid` mit `allowed`, so wie heute bei Props.

### D-05 `get_ero` wird erweitert, kein neues Werkzeug (A8, A9, Art. XI)

A9 lässt offen, ob die Uzo über ein neues Werkzeug oder über `get_ero` gelesen wird. **Entscheidung: `get_ero` erweitern.**
- `get_ero` liefert ein neues Feld `uzo` (das ganze Objekt, ohne `id`-Verweise auf Ero und Skemo, die schon in der Antwort stehen) oder lässt es weg, wenn das Ero keine Uzo hat.
- `get_ero { name, brief: true }` liefert nur die Kurzfassung (A8): `ero`, `purpose`, Achsen mit Werten und Standard, Pflicht-Props und Pflicht-Slots, `instead` und `boundary`, jeweils ohne Schlüsselwörter und `via`. Die Kurzfassung wird aus Skemo und Uzo erzeugt und nie von Hand geschrieben (Art. VII).

Begründung: Ein Agent, der ein Ero liest, soll den Gebrauch im selben Aufruf bekommen, sonst übersieht er ihn. Ein eigenes Werkzeug `get_uzo` hätte keinen Nutzer, der nicht auch `get_ero` aufruft. Das Werkzeugverzeichnis (`describe`, Vertragstests) wächst nicht. Ein zusätzlicher Parameter ist billiger als ein Werkzeug, das jeder Agent erst finden muss.

### D-06 `suggest_ero` kennt Grenzen und Alternativen (A9)

**Schlüsselwörter ohne Präpositionen (Entscheidung OP-12).** Präpositionen und Allerweltsverben sind keine Schlüsselwörter: `zur`, `zum`, `go`, `open` fallen weg, und aus demselben Grund auch `gehe` und `öffnen`. Navigation trifft über `navigieren`, `übersicht`, `navigate` und `overview`.

**Zusammengesetzte Wörter.** Ohne `zur` träfe „zur Projektübersicht“ (Beispiel-Dialog der Spec) nichts mehr, weil die Wortsuche nur ganze Wörter vergleicht. Für die Schlüsselwörter einer Uzo (`boundary`, `instead`) gilt deshalb zusätzlich: Ein Wort trifft, wenn es auf das Schlüsselwort **endet** und das Schlüsselwort mindestens 6 Zeichen hat. Im Deutschen steht das Grundwort am Ende, so trifft „projektübersicht“ das Schlüsselwort „übersicht“. Die Skemo-Absichten behalten den Vergleich ganzer Wörter, damit sich bestehende Antworten nicht ändern. Diese Folge der Entscheidung OP-12 ist neu und steht als N-1 unten zur Bestätigung.

**Grenze und Absicht zugleich (Entscheidung OP-12).** Geprüft werden alle Uzo-Schlüsselwörter und alle Absichten der Skemoj:
- Trifft nur eine Grenze oder Alternative: `ok` mit `suggestion: null` (oder dem Ero bei `use-instead`) und `boundary: { ero, case, action, kialo }`.
- Trifft nur eine Absicht: unverändert.
- Trifft beides: `ok` mit `action: "ask-human"` und `candidates`, darin die Grenze und die Absicht mit ihrem Kialo. Fundamento entscheidet nicht, welche Lesart gilt; ein Mensch entscheidet.

**Ohne Treffer (Entscheidung OP-6):** Die Fehlerform bleibt (nach F1-T00 `goal-unknown` mit `allowed`). Der `suggestion`-Text sagt, dass Fundamento die Absicht nicht abdeckt und ein Mensch entscheidet.

Pflicht-Testfälle (T023): „Zur Übersicht“ und „zur Projektübersicht“ ergeben `navigation`. „Zum Warenkorb hinzufügen“ darf **nicht** als Navigation enden. „Weiter zur Kasse“ ergibt die Absicht `confirm`, keine Grenze. Vertrag in [`contracts/mcp-tools.md`](contracts/mcp-tools.md) §2.

### D-07 `check_usage` prüft den Gebrauch (A10)

Neue Regeln im selben Format wie die bestehenden Verstöße (`issue` mit `regulo { id, name, kialo }` und `suggestion`):

| Regel | Quelle | Lösung in `suggestion` |
|---|---|---|
| `uzo-boundary` | eine Grenze über `via` (Slot, Layout, Regulo) | die `action` der Grenze, bei `use-instead` das andere Ero |
| `uzo-slot-accepts`, `uzo-slot-max`, `uzo-slot-nesting` | `slots` | was der Slot aufnimmt |
| `full-width-in-action-bar-or-compact` | `layout.full-width` | Container `action-bar` oder `viewport=compact`, sonst `full-width` weglassen |
| `label-names-action`, `destructive-label-names-object`, `destructive-label-not-generic` | `content` | ein Satz, der die Regel befolgt, aus dem approved-Beispiel der Regel in der Sprache der Instanz |

Die Lösung bei Text-Regeln stammt aus den Daten, aus dem approved-Beispiel derselben Regel und Sprache. Sie wird also nicht erfunden (S3). Eine überstimmte anpassbare Regel ergibt `severity: info` mit der Jugxo-Id (D-03).

### D-08 Obergrenze der Kurzfassung: erst messen, dann festlegen (A8)

Gemessen am 2026-10-08 (research.md, „Messungen“): Die heutige Antwort von `get_ero butono` hat 21 053 Bytes. Eine Kurzfassung aus dem Uzo-Entwurf in data-model §2.3 hat 1 661 Bytes. Gezählt wird ohne Tokenizer, weil keine neue Abhängigkeit dazukommt und der Test deterministisch und offline laufen muss. Das Maß ist **`ceil(Bytes UTF-8 / 3)`**, eine bewusst ungünstige Schätzung für kompaktes JSON. Der Entwurf ergibt damit 554.

**Vorläufige Obergrenze: 750 je Ero.** Festgelegt wird sie in T022 an der erzeugten Kurzfassung: Messwert × 1,25, aufgerundet auf 50, höchstens 800. Messwert und Wert kommen nach `research.md`, „Messungen“, und als Konstante in den Test. Überschreitung bricht den Test (A8). Die Grenze gilt je Ero und nicht für alle zusammen, weil Phase 4 die Zahl der Eroj erhöht, nicht die Kurzfassung eines einzelnen.

### D-09 Kein Web-Begriff in der Uzo (A6, Art. VIII)

Zwei Sicherungen: Das Schema lässt in `layout` nur geschlossene Wortmengen zu. Ein Test prüft außerdem jede Zeichenkette jeder Uzo gegen die CSS-Eigenschaften, Einheiten und DOM-Begriffe, die `check:vortaro-lint` schon führt. Die Liste wird übernommen und nicht neu geschrieben. „Fußleiste“ heißt deshalb `action-bar` und nicht `footer` (OP-7).

### D-10 Projekcioj (A12)

| Celo | Was die Uzo dort wird |
|---|---|
| `get_ero` | ganzes Objekt und Kurzfassung (D-05) |
| Make Kit `guidelines/components/<ero>.md` | Abschnitte „Wofür“, „Nicht dafür“ (instead, boundary mit Kialo und Aktion), „Zusammen mit“, „Slots“, „Layout“, „Text“ (Regeln mit fest/anpassbar und je einem approved/rejected-Beispiel). Generiert, `guidelinesInventory` prüft die Parität |
| Vitrino | Abschnitt Gebrauch je Ero aus denselben Daten (S5) |
| Figma | `purpose` als Beschreibung des Komponentensets, im Plan erzeugt und vom Plugin gesetzt |
| Figma, nicht tragbar | Slot-Regeln, Grenzen, Text-Regeln. Nach Art. VI wird **versucht und gemessen**, bevor eine Manko entsteht: Der Lauf schreibt, was Figma annimmt, und meldet den Rest. Eine Manko ohne Beleg im Wortlaut ist ungültig. Deshalb entstehen die Mankoj erst mit der Messung in echtem Figma (T029), nicht im Plan |

### D-11 Constitution v2.1 und Ontologio in einem Commit (A13)

Die CI vergleicht die Terminologio-Tabelle der Constitution mit der Ontologio (`table-term-missing`, `table-term-extra`) und die Ontologio mit den Entitätstypen des Schemas (`entity-type-missing`, `entity-type-extra`). Tabellenzeile, Ontologio-Begriff und Entitätstyp `uzo` landen daher im selben Commit (T010). Sonst ist ein Zwischenstand rot. Änderungshistorie: „v2.1 (Spec 007) Terminologie um **Uzo** ergänzt (neue Datenart `data/eroj/<ero>/uzo.json` neben der Skemo; Text-Regeln fest oder anpassbar, Überstimmung nur mit Jugxo)“. `docs/docs.test.ts` hält Version und Historie fest, wie bei v2.0.

Ontologio: `#Uzo`, `inScheme: terminologio`, `notation: uzo`, `prefLabel { eo: Uzo, en: usage, de: Gebrauch }`, `altLabel { en: [usage rules], de: [Verwendung] }`. **Abgrenzung zu Art. XIII (Entscheidung OP-1):** Der Titel von Art. XIII bleibt. Die Definition endet mit dem Satz „Nicht gemeint ist die Einfachheit der Nutzung des Systems nach Art. XIII (Simpleco de Uzo).“ (en: „Not the ease of use of the system itself, which Art. XIII calls Simpleco de Uzo.“). Beziehungen `partOf #Modelo`, `references #Ero`, `references #Skemo`, `references #Regulo`, `references #Jugxo`, `related #Tavolo`. Ob die Prädikate dafür reichen, prüft T010 gegen `predicates` in `ontologio.json`. Ein neues Prädikat wäre eine eigene Frage an den Maintainer.

### D-12 Gvidanto-Prompt (A9)

Neue Regel 12 in `packages/mcp/prompts/gvidanto.md`: „When `suggest_ero` or `check_usage` answers with `action: ask-human`, pass the kialo to the user and say that Fundamento does not cover this yet. Do not propose a solution of your own.“ Regel 8 nennt die Uzo und `brief`. Der Prompt-Test (`prompt.test.ts`) hält beide Sätze fest.

### D-13 F1 als eigener Strang (Entscheidung F1, Jugxo `jug_01M4DNSD0SV43Y943T21RQF7EM`)

`variant: primary|secondary|tertiary` wird `emphasis: high|medium|low`, `tone: default|danger` wird `intent: neutral|danger`. Betroffen sind (gezählt an `8d1870e`, 68 Dateien mit `variant` oder `tone` als Wort):

| Ort | Was |
|---|---|
| Skemo `butono` | Props, `parts.*.by`, `bindings[].when`, `constraints`, `intents[].props`, Beschreibungen |
| Reguloj | Statements von `one-primary-per-container`, `destructive-not-primary-color` |
| Jugxoj mit `ekzemplo` | 6 Jugxoj, 11 Props in Instanzen |
| Vortaro `core.json` | `$description` von `color.action.danger.*` („butono tone=danger“) |
| `modelo/src` | `eroj/usage.ts`, `eroj/skemo-rules.ts`, `eroj/inventories.ts`, `gvidanto/eroj.ts` (`EroSummary.variants` liest den Prop namens `variant`), `checks/parity/*`, `validate/color-reguloj.ts`, `validate/regularo-enforcement.ts` |
| `projekcioj/src` | Figma-Plan und Plugin, Web Component, Vitrino-Daten, Make Kit |
| Tests und Fixtures | `eroj/test/*`, `mcp/src/e2e/*`, `fixtures/invalid/parity-mismatch`, `invalid/skemo-schema`, `valid/ero-minimal`, `valid/parity-equivalent` |
| Prompt | Regel 8 („Name a variant as get_ero names it“) |
| Constitution | Art. II nennt `variant: primary | secondary | tertiary` als Beispiel; Änderung im F1-PR (OP-3, entschieden) |

Abgeschlossene Specs (`specs/003…`) bleiben unverändert; sie beschreiben den Stand ihrer Zeit. Die Umbenennung ist mechanisch, aber nicht blind: `EroSummary.variants` braucht eine Regel, welcher Prop die Varianten nennt (Vorschlag: der erste Enum-Prop der Skemo, also `emphasis`). **`goal` für die Absicht (Entscheidung OP-4).** Der Prop `intent` (`neutral|danger`) bleibt. Die Absicht heißt überall `goal`: `Skemo.intents` → `goals`, `EroInstance.intent` → `goal`, der Parameter von `suggest_ero` → `goal`, dazu `matched.goal`, `goal-unknown`, `intentOf` → `goalOf`. Die Uzo heißt von Anfang an so (`instead[].goal`, `content[].when.goal`), weil sie in Stufe A neu entsteht (data-model §9). Die Umbenennung gehört zu F1 und läuft als eigene Aufgabe F1-T00 **vor** F1-T01. Erst danach heißen beide Wörter eindeutig.

**Art. II (Entscheidung OP-3):** Der F1-PR ändert das Beispiel in Art. II auf `emphasis: high | medium | low`. Das ist ein eigenes kleines Amendment mit eigener Versionsnummer, bestimmt gegen die Basis des F1-PR (F1-T06).

### D-14 Rot zuerst: die Fehlerfixtures aus A11 vor allem anderen

Neun Fixtures unter `fixtures/invalid/uzo-*`, jede eine Kopie von `valid/ero-minimal` mit genau einem Fehler (data-model §2.2). Der bestehende Fixture-Lauf (`validate/validate-modelo.test.ts` über `modeloValidationFixtures`) nimmt jedes neue Verzeichnis mit `expected-issues.json` automatisch auf. Weil der Lader heute `uzo.json` nicht kennt, meldet er keinen Fehler, und der Lauf ist **rot mit „expected rule uzo-… not reported“**. Dieses Rot wird je Fixture beobachtet und im Commit festgehalten, bevor das Schema entsteht. Die Fixtures 8 und 9 brauchen ein Aspekto-Paket und kommen deshalb aus `valid/aspekto-ekzemplo`.

## Projektstruktur (Delta)

```
packages/modelo/
  data/eroj/butono/uzo.json                (Stufe B)
  data/reguloj.json, data/jugxoj.json      (Stufe B: 5 Reguloj, ≥ 12 Jugxoj, 2 geänderte Labels)
  data/ontologio.json                      (Stufe A: Begriff Uzo)
  schema/modelo.schema.json                (Stufe A: UzoFile, Uzo, Keywords, EroInstance, Tavoloj)
  src/contracts/entity-ids.ts              (Stufe A: uzo)
  src/eroj/uzo-rules.ts                    (Stufe A: Validierung)
  src/eroj/usage.ts                        (Stufe B: Enforcer)
  src/gvidanto/eroj.ts, suggest-ero.ts, check-usage.ts  (Stufe B)
  test/fixtures/invalid/uzo-*              (Stufe A: 9 Fixtures)
packages/mcp/   src/schemas.ts, prompts/gvidanto.md     (Stufe B)
packages/projekcioj/  celoj/make-kit, celoj/vitrino, celoj/figma  (Stufe B)
.specify/memory/constitution.md            (Stufe A: v2.1)
```

## Abhängigkeiten

Keine neuen. Werkzeuge aus `research/benchmarks.md` (Abschnitt 2026-10-08) werden nicht eingebunden. Darüber entscheidet eine spätere Enportilo-Spec.

## Constitutional Compliance Review

### Artikel I – Modelo-First
Konform. Die Uzo ist ein Eintrag des Modelo mit Id und Schema. Guidelines, Vitrino, Figma-Beschreibung und Kurzfassung werden aus ihr erzeugt. `fixed` steht nur in der Uzo, Statement und Kialo nur in der Regulo (D-02). Eine Absicht steht nur einmal, entweder in `instead` oder in `boundary` (`uzo-goal-twice`).

### Artikel II – Unu Vortaro
Konform für Spec 007: Die Uzo führt keine Namen ein, die eine Projekcio umbenennen müsste. Slot-, Prop- und Ero-Namen werden aus der Skemo übernommen und validiert. **Für F1:** Das Beispiel in Art. II (`variant: primary | secondary | tertiary`) ist nach der Umbenennung veraltet; der F1-PR ändert es mit eigenem Amendment (OP-3, entschieden). Die Regel selbst, ein Name überall, verlangt F1 sogar, weil Figma, CSS und React danach dieselben neuen Namen tragen.

### Artikel III – Masxinlegebleco
Konform und das Ziel der Spec: Ein Agent erfährt per MCP Zweck, Grenze und Alternative, und `describe_term` erklärt den neuen Begriff (A13). Zielablauf: Der prüfende Agent bekommt mit `check_usage` Gebrauchsregeln, die er heute aus eigenen Faustregeln ableiten müsste. Der entwerfende Agent bekommt mit `get_ero brief` weniger und Treffenderes.

### Artikel IV – Nativa Multmarkeco
Konform. Die Uzo ist markenneutral. Eine Marke weicht nur über ihre Tavolo und eine Jugxo ab (D-03), feste Regeln gelten für jede Aspekto. Es gibt keine Vererbung und keine Standardmarke.

### Artikel V – Pura Cxambro
Konform. `research.md` gibt den Benchmark in eigenen Worten wieder, übernimmt weder Contract-Text noch Beispiele, und das Coding-Tool hat die Artikel nicht gesehen. Alle Beispiel-Labels sind eigene. Die Werkzeugbefunde in `research/benchmarks.md` enthalten keine Markenwerte der beobachteten Seite.

### Artikel VI – Regularo kun Kialoj
Konform. Jeder Eintrag in `instead`, `boundary` und `composes` und jede neue Regulo trägt einen Kialo. Fehlt er, ist der Eintrag ungültig (Fixture 3). Die Entscheidungen F1 bis F3 sind als Jugxoj festgehalten. Überstimmungen sind Jugxoj, Ablehnungen eingeschlossen. Was Figma nicht trägt, wird gemessen und als Manko geführt, nicht verschwiegen (D-10). `spacing-owned-by-container` ist ein Regulo-Kandidat mit `checkability: manual`, bis eine Prüfung möglich ist („Befund wird Regel“).

### Artikel VII – Agenta Dokumentado
Konform. Neue Gvidanto-Fragen und der Beispiel-Dialog stehen in der Spec. Der Dialog läuft als automatisierter Test (T030) und als Abnahme in einer frischen Sitzung (M1 dieser Spec). Kurzfassung und Guidelines sind generiert. Keine handgeschriebene Zeile.

### Artikel VIII – Retejo Unue, Movebla Modelo
Konform, mit doppelter Sicherung (D-09): geschlossene Wortmengen im Schema und ein Test gegen CSS- und DOM-Begriffe. Internacia: Text-Regeln haben Beispiele in `de` und `en`, Schlüsselwörter sind je Sprache geführt, und die Uzo enthält keine sichtbaren Texte. „Größe aus dem Inhalt“ und „bricht nicht um“ gelten in jeder Schreibrichtung.

### Artikel IX – Vertikala Tranĉo
Konform. Nur `butono` bekommt eine Uzo, und zwar durch Modelo, MCP, Make Kit, Vitrino, Figma und Prüfung. Breite folgt in Phase 4 (Vojmapo).

### Artikel X – Kontrolo kaj Konformeco
Konform. Die neun Fehlerfixtures sind die ersten Aufgaben und werden rot beobachtet (D-14). Jede Aufgabe nennt ihr Rot. Prüfung 3 (Regularo) wird strenger: Jedes Beispiel muss auch die Text-Regeln erfüllen. Deshalb werden zwei bestehende Beispiel-Labels geändert (OP-5), statt die Prüfung aufzuweichen. Prüfung 2 (Parität) deckt die Guidelines mit ab.

### Artikel XI – Simpleco
Konform. Kein neues Paket. Kein neues MCP-Werkzeug, `get_ero` wird erweitert (D-05). Text-Regeln nutzen Regulo und Jugxo-Beispiel, statt einen neuen Satztyp einzuführen (D-02). Neu sind eine Datenart (Uzo) und eine Schema-Definition (`Keywords`), die Skemo und Uzo gemeinsam nutzen. Die Uzo selbst hat erst einen Nutzer, `butono`. Sie ist aber keine Abstraktion auf Vorrat, sondern eine Datenart, die die Constitution per Amendment einführt, und Phase 4 ist ihr zweiter Nutzer. Siehe Complexity Tracking.

### Artikel XII – Interoperebleco
Konform. Das Vortaro bleibt unberührt (DTCG). Die Uzo ist Ero-Wissen und kein Token. Make Kit und Figma bekommen sie als generierte Ausgabe. Was ein Celo nicht trägt, wird gemessen (Manko).

### Artikel XIII – Simpleco de Uzo
Konform. `get_ero brief` macht den Einstieg für Agenten kürzer. Für Entwickler und Designer ändert sich an Befehlen und Libraries nichts. Der Quickstart bleibt gleich und wird in T031 erneut ausgeführt. Zum Titel des Artikels: Er bleibt, und die Ontologio-Definition von Uzo grenzt sich von ihm ab (OP-1, entschieden; D-11).

## Complexity Tracking

| Abweichung | Warum nötig | Einfachere Alternative und warum verworfen |
|---|---|---|
| Datenart Uzo mit einem einzigen Nutzer (`butono`) | Art. IX verlangt den Durchstich an einem Ero, und F3 hat die eigene Datei entschieden | Felder in der Skemo: von F3 verworfen; sie hätten zudem die von M1 bis M3 abgenommene Skemo geändert |
| Tavolo-Eintrag `lingvo.overrides`, solange die Tavolo `lingvo` sonst nicht spezifiziert ist | A11 verlangt die Fixture „Überstimmung ohne Jugxo“, und die braucht einen Ort für die Überstimmung | die Jugxo allein (D-03): Dann ist der Fehlerfall nicht ausdrückbar |
| Zwei PRs für Spec 007 plus ein PR für F1 | Die Abnahme von Spec 003 ist offen, und F1 ist nach der Spec eine eigene Aufgabe | ein PR nach der Abnahme: verschiebt auch das Risikolose (Schema, Fixtures, Begriff) ohne Grund |

## Reihenfolge (Orientierung, keine Aufgaben)

1. Stufe A: Fixtures rot → Schema und Id-Typ → Validierung grün → Web-Begriff-Test → Instanz- und Tavolo-Schema → Constitution v2.1 mit Ontologio → PR.
2. Abnahme Spec 003 (M1 bis M3) durch den Maintainer.
3. F1: Umbenennung → PR.
4. Stufe B: Reguloj, Jugxoj und Labels → `butono/uzo.json` → Export → `get_ero` (Uzo, brief, Messung) → `suggest_ero` → `check_usage` → Prompt → Guidelines → Vitrino → Figma und Manko-Messung → Szenarien und Dialog → PR.

## Nachverfolgbarkeit (Anforderung → Entwurf → Aufgaben)

| Anforderung | Entwurf | Aufgaben |
|---|---|---|
| A1 Datenart | D-01 | T001, T010, T011, T012, T016, T020 |
| A2 Zweck, Alternative | D-01, D-06 | T002, T011, T012, T020, T023 |
| A3 Grenze | D-06, D-07 | T003, T011, T012, T020, T023, T024 |
| A4 Beziehungen | D-01 | T011, T012, T019, T020 |
| A5 Slot-Regeln | D-04, D-07 | T004, T011, T012, T014, T024 |
| A6 Layout | D-07, D-09 | T005, T011, T013, T019, T024 |
| A7 Text-Regeln | D-02, D-03 | T006, T007, T008, T009, T011, T012, T014, T015, T019, T021, T024 |
| A8 Kurzfassung | D-05, D-08 | T022 |
| A9 Gvidanto | D-05, D-06, D-12 | T023, T025 |
| A10 check_usage | D-07 | T024 |
| A11 Fixtures | D-14 | T001–T009 |
| A12 Parität | D-10 | T026, T027, T028, T029 |
| A13 Ontologio | D-11 | T010 |
| Amendment | D-11 | T010 |
| F1 | D-13 | F1-T00 bis F1-T06 |
| Abnahme 1–9 | – | T030, T031, M1, M2 |

## Offene Punkte – entschieden 2026-10-08

Der Maintainer hat Plan und Aufgaben am 2026-10-08 geprüft. Die Entscheidungen sind in Plan, Datenmodell, Vertrag und Aufgaben eingearbeitet. Die Spec-Dateien bleiben unverändert.

| Punkt | Frage | Entscheidung | Wo eingearbeitet |
|---|---|---|---|
| OP-1 | „Uzo“ steht schon im Titel von Art. XIII („Simpleco de Uzo“, dort: Nutzung) | ✅ Der Titel bleibt. Die Ontologio-Definition von Uzo grenzt sich in einem Satz ab | D-11, T010 |
| OP-2 | `ref` der F3-Jugxo | ✅ `artikolo: III` statt `VI`, weil Art. III die Ontologio trägt | `jug_01M4DNSD0SV43Y943T21RQF7EP` in diesem Commit geändert |
| OP-3 | Beispiel in Art. II nach F1 | ✅ wie vorgeschlagen: Änderung im F1-PR mit eigener Versionsnummer | D-13, F1-T06 |
| OP-4 | `intent` zweimal nach F1 | ✅ Der Prop bleibt `intent` (`neutral|danger`). Die Absicht heißt überall `goal` (Skemo `goals`, `EroInstance.goal`, `suggest_ero { goal }`, Uzo `instead[].goal`, `when.goal`). Teil von F1, eigene Aufgabe vor F1-T01 | D-13, data-model §9, F1-T00 |
| OP-5 | „Löschen“ in `…PT1` und `…PT2` | ✅ Beide Labels werden „Projekt löschen“, mit Vermerk in `context` | data-model §8, T021 |
| OP-6 | `suggest_ero` ohne Treffer: Fehler statt `null` | ✅ wie vorgeschlagen: Die Fehlerform bleibt, der `suggestion`-Text sagt „ein Mensch entscheidet“ | D-06, T023 |
| OP-7 | Name für „Fußleiste“ | ✅ `action-bar` | data-model §2.3 |
| OP-8 | Sprachen in A7 | ✅ wie vorgeschlagen: Beispiele in `de` und `en`, Uzo-Texte englisch | data-model §5 |
| OP-9 | Figma-Mankoj erst nach Messung | ✅ wie vorgeschlagen | D-10, T029 |
| OP-10 | Ort für Enportilo Stufe 1 (Befund F38) | ⏳ **noch offen.** In der Entscheidung stand der Platzhalter „[Ort von F38 eintragen]“ ohne Ort. Bis ein Ort genannt ist, bleibt der Werkzeugbefund nur in `research/benchmarks.md` | – |
| OP-11 | Basis-Commit von `research.md` | ✅ wie vorgeschlagen: Research bleibt unverändert | – |
| OP-12 | Navigation gegen Bestätigung | ✅ Keine Präpositionen in Schlüsselwörtern (`zur`, `zum`, `go`, `open` fallen weg). Trifft eine Eingabe Grenze und Absicht, liefert `suggest_ero` beide Kandidaten mit `action: ask-human`. Testfall: „Zum Warenkorb hinzufügen“ darf nicht als Navigation enden | D-06, data-model §2.3, contracts §2, T023 |
| OP-13 | Maß `ceil(Bytes / 3)` | ✅ wie vorgeschlagen | D-08 |
| OP-14 | Phasennummer 3c | ✅ wie vorgeschlagen | Vojmapo |
| OP-15 | Stufe A vor der Abnahme von Spec 003 | ✅ wie vorgeschlagen | Abschnitt „Voraussetzung“ |
| OP-16 | `/speckit.analyze` nicht installiert | ✅ wie vorgeschlagen: Analyse von Hand | tasks.md |
| neu | Prüfung von `label-names-action` | ✅ vorerst nur `severity: warning`, weil die Schlüsselwortliste legitime Verben wie „Senden“ oder „Teilen“ abweisen würde. Regulo-Kandidat für eine bessere Prüfung | D-02, data-model §2.1, §4 |

### Neu aus der Einarbeitung, zur Bestätigung

- **N-1 Zusammengesetzte Wörter (Folge von OP-12).** Ohne `zur` trifft der Beispiel-Dialog der Spec („zur Projektübersicht“) nichts mehr, und Abnahme 4 würde scheitern. D-06 lässt deshalb nur für Uzo-Schlüsselwörter ab 6 Zeichen auch das Wortende gelten („projektübersicht“ trifft „übersicht“). Die Skemo-Absichten vergleichen weiter ganze Wörter. Das betrifft erst Stufe B (T023), nicht Stufe A. *Bitte bestätigen oder eine andere Lösung nennen.*

## Manuelle Abnahme (Maintainer, nach Stufe B)

- **M1 – Beispiel-Dialog in einer frischen Claude-Code-Sitzung** (Abnahme 4): „Ich brauche einen Butono, der zur Projektübersicht führt.“ Erwartet: `suggest_ero`, Kialo zitiert, Navigation als nicht abgedeckt benannt, kein eigener Vorschlag. Abweichungen werden Befund (Art. VI).
- **M2 – S5 an der Vitrino** (Abnahme 3): „Wann nehme ich den Butono nicht?“ liefert dieselben Grenzen wie `get_ero`.
