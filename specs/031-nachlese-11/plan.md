# Nachlese 11 – Was die Nordstern-Kennzahl gefunden hat – Plan

**Briefing:** [`briefing.md`](briefing.md) (Fassung vom 2026-10-24, unverändert kopiert; SHA-256 `d6b62bb8…c0b6ff28f`) · **Basis:** gestapelt auf #112 (Spec 030, `721743f`), weil #112 noch offen ist · **Regel 0** gilt: der Weg, den das Repo schon geht, sonst die kleinste Änderung mit Eintrag hier. **Keine Budgets angehoben. Keine Änderung an der Optik der Eroj.** Getrennt von Spec 029 (Sitzung A).

**Branch:** `261024-nachlese-11-fehler-und-gewicht-d66050` (von `261023-spec-030-nordstern-826849`) · **Datum:** 2026-10-24 · **Stand:** gebaut, Messpunkt nach den Korrekturen vorhanden, Abnahme offen.

### Zusammenfassung

1. **B-7, `fm-tabelo` blockiert nie.**
   - Eine `<table>` ohne `slot="content"` ist der Inhalt, wenn sie die einzige ist und kein Inhalt im Slot steht. Das Element setzt dann `slot="content"`, und die Tabelle erscheint.
   - Sonst bleibt sie unsichtbar. Die Konsole sagt einmal: `fm-tabelo: 2 table element(s) without slot="content" are not shown; one table per element, the caption as text without a slot, the table written <table slot="content">`.
   - Die Beschriftung liest nie den Text einer Tabelle. Das war die Schleife (Ursachen).
   - Browser-Test in Chromium, Firefox und WebKit, mit dem gemessenen Fall (`<span slot="caption">` und Tabelle ohne Slot).
2. **B-2, Standard-Slot.** Skemo, Web Component, React, Make-Kit-Guidelines und Gvidanto sagen jetzt dasselbe:
   - Der Standard-Slot `label` nimmt Inhalt ohne `slot`-Attribut. `slot="label"` meint denselben Slot, wie beim Standard-Bereich der Sxablonoj seit Spec 020.
   - `get_ero` nennt `projekcioj.webComponent.defaultSlot`.
   - Die Slot-Tabelle der Guidelines listet jeden Slot des Skemo und markiert den Standard-Slot. Ein Satz sagt, wie er gefüllt wird: `<fm-kampo>…</fm-kampo>`.
   - **Konformitätstest für alle 40 Eroj und 5 Sxablonoj**:
     - Slots und Props am lebenden Element im Browser
     - Ereignisse aus dem Quelltext der Web Component
     - React aus der Hülle
     - Guidelines und Gvidanto aus ihrer Ausgabe

     Was er fand, ist behoben: In 15 Skemoj und in der Sxablono `formularo` fehlten Ereignisse, die das Element schon auslöst. Drei Eroj boten einen Standard-Slot an, den ihr Skemo nicht kennt.
3. **B-6, Seitenfläche.** `fundamento.css` und jede Marken-Datei setzen an `:where(:root)` die Fläche `color.background.canvas` und die Textfarbe `color.text.default`.
   - Gesagt wird es im Quickstart der README, in `setup.md` und in `Guidelines.md` des Make Kit.
   - Eine Seite, die nur `fundamento.css` und die Eroj lädt, besteht `color-contrast` in allen Marken, Schemata und Kontrasten. Der Browser-Test prüft das in den Marken seines Builds, der Lauf in allen vier.
4. **B-3, Schemata für drei Anbieter.** `tools/list` liefert jedes Eingabeschema mit einem Objekt an der Wurzel.
   - Die Alternativen der Datei stehen als Satz in der Beschreibung, etwa „Give exactly one of: `name` or `id`.“.
   - Der Server prüft jeden Aufruf weiter gegen die Datei.
   - Ein Test prüft alle 23 Werkzeuge gegen die dokumentierten Einschränkungen von Anthropic, OpenAI und Mistral, ohne Netz.
   - `nordstelo` braucht seinen Umweg `flattenSchema` nicht mehr.
5. **② Gewichtung.**
   - Markenfähigkeit ist ein Tor (`multmarkeco`, K4 und K5).
   - K5 zählt 25; K1, K4 und K6 je 16,67, K2 und K3 je 12,5.
   - Die Gewichte der Spec 030 stehen als `pezojAntauxaj` daneben. Jede Bewertung, jeder Bericht und der Verlauf der Metiejo zeigen beide.
   - Die 120 gespeicherten Ergebnisse des ersten Laufs sind neu bewertet. Die alte Gewichtung gibt jede gespeicherte Zahl wieder (0 abweichend).
6. **③ Messpunkt nach ①:** Lauf `20261024-1201` mit `gpt-4.1-mini`, sonst wie der erste Lauf. Ergebnisse unter „Messpunkte“.

### Ursachen

- **B-7:**
  - `#decorateTable` schreibt den Text des Standard-Slots als `<caption>` in die Tabelle.
  - Eine `<table>` ohne Slot liegt aber selbst im Standard-Slot (dem versteckten Slot der Beschriftung). Ihr Text gehört also zur Beschriftung, die in sie geschrieben wird.
  - Jede Änderung der Beschriftung ändert den Text der Tabelle. Der `MutationObserver` (`characterData`, `subtree`) rendert dann neu, die Beschriftung wächst bei jedem Durchlauf, und das Laden endet nie.
  - Die Tabelle wäre ohnehin nicht zu sehen gewesen, weil der Standard-Slot versteckt ist.
- **B-2:**
  - Das Skemo gibt dem Standard-Slot einen Namen (`label`, `default: true`). Der Name ist der Name des Modelo: `a11y.name: slot:label`, die Schlüssel der Uzo, die Texte, die Eigenschaften in Figma.
  - `get_ero` (`projekcioj.webComponent.slots`) und die Slot-Tabelle der Guidelines haben diesen Namen weitergegeben, als wäre er ein Wert des `slot`-Attributs.
  - Das Element hatte nur einen unbenannten `<slot>`. Die Sxablonoj nehmen ihren Standard-Bereich seit Spec 020 in beiden Formen an (`<slot name="main"></slot><slot></slot>`), die Eroj nicht.
  - Dazu fand der Konformitätstest:
    - 15 Skemoj ohne die Ereignisse, die ihr Element auslöst
    - `ikono`, `avataro` und `apartigilo` mit einem versteckten Standard-Slot, den ihr Skemo nicht kennt
    - eine Slot-Tabelle, die aus der Uzo statt aus dem Skemo kam (beim `karto` fehlte `media`)
- **B-6:**
  - Der CSS-Celo schreibt nur Custom Properties; keine Regel malt die Seite.
  - Die Sxablono `sxelo` malt nur ihre Kopfzeile, nicht die Seite. Plan 030 B-6 sagt etwas anderes; das ist hier richtiggestellt.
- **B-3:**
  - `bundleSchema` hat die Schema-Dateien nur in sich geschlossen gemacht (`$ref` lokal). Ihre Wurzel blieb, wie sie war: `oneOf` bei `get_token`, `explain_regulo`, `get_ero` und `get_sxablono`, `anyOf` bei `check_usage`.
  - Anthropic lehnt `oneOf`, `anyOf` und `allOf` an der Wurzel ab, OpenAI und Mistral dazu `enum` und `not`.

### Entwurfsentscheidungen

#### D-01 B-7: übernehmen, wo es eindeutig ist, sonst sagen
- `#adoptContent` (nur für einen Light-Host mit Inhalts-Slot, also den `tabelo`) setzt `slot="content"` an die einzige Tabelle ohne Slot, wenn kein Inhalt im Slot steht. Das Element setzt dabei das Attribut eines Kindes der Anwendung; das tut der `tabelo` schon mit der Aktion seines leeren Zustands (Nachlese 7 ② B-3).
- Zwei Tabellen ohne Slot oder eine neben einer gesetzten: Das Element entscheidet nicht und warnt einmal mit dem Markup (`warn`, wie die übrigen Warnungen der Eroj).
- `#slotText("")` liest Tabellen und Beschreibungslisten nie mit. Damit kann die Beschriftung die Tabelle nicht mehr ändern, auch im mehrdeutigen Fall.

#### D-02 B-2: der Standard-Slot nimmt beide Formen, wie bei den Sxablonoj
- Regel 0: Die Sxablonoj nehmen ihren Standard-Bereich mit und ohne Namen an. Die Eroj tun jetzt dasselbe: `#adoptDefault` nimmt einem Kind mit `slot="<Name des Standard-Slots>"` das Attribut, beim Verbinden und bei jeder Änderung (`MutationObserver` auf `slot`).
- Kein zweiter, benannter `<slot>` im Shadow DOM: Jede Stelle, die den Standard-Slot liest (Name, Beschriftung, Einträge, Live-Regionen), müsste sonst zwei Slots lesen.
- Das Skemo bleibt unverändert. Es ist die Quelle der Namen. Die Projekcioj sagen jetzt, wie man den Slot füllt:
  - `get_ero`: `projekcioj.webComponent.defaultSlot`
  - Guidelines: die Markierung „(default slot)“ in der Tabelle und der Satz darüber
- React: Der Standard-Slot ist `children`, benannte Slots sind Kinder mit `slot`-Attribut, Icon-Slots Props. So war es schon, und der Test hält es fest.
- Ein Ero, dessen Skemo keinen Standard-Slot hat (`ikono`, `avataro`, `apartigilo`), bekommt einen abgelösten Ersatz-Slot statt eines versteckten. Der `lokredaktilo` macht das seit Spec 025 ③ so. Sichtbar ändert sich nichts.

#### D-03 Konformitätstest: am lebenden Element und an der Ausgabe
Gelesen wird jede Seite dort, wo sie sich zeigt:

| Seite | Was | Wie |
|---|---|---|
| Web Component | Slots | im Browser: Ein Kind in jedem Slot des Skemo muss einem Slot des Shadow DOM zugewiesen werden oder dort erscheinen (die Optionen eines Auswahlfelds lesen ihre Kinder aus dem Light DOM). Jeder `<slot>` im Shadow DOM muss im Skemo stehen. Der Standard-Slot wird auch mit seinem Namen probiert. |
| Web Component | Props | `observedAttributes` im Browser |
| Web Component | Ereignisse | `this.dispatchEvent(new …Event("x"))` im erzeugten Quelltext, dazu `input` des Textfelds der Plattform (es geht durch den Shadow DOM, `change` nicht) |
| React | Props, Icon-Slots, `children` | die Props-Schnittstelle der Hülle; die Hülle reicht `ref` und alle übrigen Props an das Element, also hört React dieselben Ereignisse |
| Make Kit | Slots | die Slot-Tabelle der Guidelines, Standard-Slot markiert |
| Gvidanto | Slots, Standard-Slot | `get_ero` |

Ausgenommen sind nur zwei Formen, die keinen Inhalt der Anwendung nehmen:
- die Zeilen-Slots, die die `spuro` je Eintrag anlegt (`name="item-…"`)
- der Slot, in den der `markdovido` sein selbst gebautes Markup legt (`data-fm-own`)

Eine Gegenprobe mit einem erfundenen Slot und einem falschen Standard-Slot im Skemo schlägt an.

#### D-04 B-3: ein Objekt an der Wurzel, die Datei bleibt die Prüfung
- `bundleSchema` legt die Zweige an der Wurzel zusammen:
  - Eigenschaften aller Zweige zusammen
  - `required`, was jeder Zweig verlangt
  - die Alternativen als Satz in der Beschreibung des Schemas und des Werkzeugs
- Der Server validiert weiter gegen die Datei. Beide oder keins von `name` und `id` bleibt also `mcp-input-invalid`; ein Test hält das fest.
- Kein strikter Modus. OpenAI-strict und Anthropic-`strict: true` verlangen jede Eigenschaft als `required`; die Werkzeuge haben aber optionale Eingaben, und der Gvidanto prüft selbst.
- Der Test liest die Regeln aus der Doku der Anbieter (Stand 24.10.):
  - Anthropic „Define tools“: Name `^[a-zA-Z0-9_-]{1,128}$`, `input_schema` vom Typ `object`
  - OpenAI „Structured Outputs – Supported schemas“: „root … must be an object, and not use anyOf“
  - Mistral „Function calling“: die Form von OpenAI

  Mistral dokumentiert keine weitere Einschränkung, deshalb gilt dort die strengere der beiden anderen.

#### D-05 B-6: die Fläche aus den Rollen, ohne Spezifität
- `PAGE_SURFACE` im CSS-Celo: `color.background.canvas` und `color.text.default`. Genau dieses Paar führt der KontrastParo `text-default-on-background-canvas`; die Vitrino nimmt dieselbe Fläche (`VITRINO_SURFACE`).
- Der Block steht in `fundamento.css` und in jeder `fundamento-<aspekto>.css`, also auch in `styles.css` des Make Kit.
- `:where(:root)` hat keine Spezifität. Eine eigene Fläche der Seite, des Rahmens oder der Metiejo gewinnt. Die Eroj ändern sich nicht; alle 340 Browser-Tests in Chromium sind grün.

#### D-06 Das Tor aus dem gespeicherten Befund
Die 120 Ergebnisse sollen ohne neuen Lauf neu bewertet werden. Der Befund (`fakto.json`) misst aber nicht, ob sich eine Seite beim Wechsel verändert. `multmarkeco` liest deshalb aus dem Befund, welchen Schaltern die Seite folgen kann:

| Seite | folgt der Marke | dem Farbschema | dem Kontrast |
|---|---|---|---|
| nutzt Fundamento (ein Ero, eine Sxablono oder `var(--fm-…)`) | ja, außer sie setzt selbst `data-fm-aspekto` | ja, außer `data-fm-color-scheme` | ja, außer `data-fm-contrast` |
| ohne Fundamento | nie | mit `prefers-color-scheme: dark` oder `color-scheme: … dark` | mit `prefers-contrast` |

- Ein Rendering zählt, wenn die Seite jedem Schalter folgt, in dem es sich von der Basis (komuna, hell, Standardkontrast) unterscheidet. Die Basis zählt, wenn mindestens ein anderes zählt. „Kann nicht wechseln“ heißt also null.
- K4 = saubere *und* gefolgte Renderings / 16; K5 = K5 × Anteil der gefolgten.
- Eine Seite ohne Fundamento kommt so höchstens auf 4 von 16: ihre eigenen Modi, eine Marke.

#### D-07 Gewichte und beide Gewichtungen als Daten
- Im Katalog stehen:
  - `pezoj` (neu): 16,67 / 12,5 / 12,5 / 16,67 / **25** / 16,67, Summe 100,01. Die Bewertung teilt durch die Summe; K5 zählt also 24,998 %.
  - `pezojAntauxaj`: `nomo` „Spec 030“, die alten Gewichte, mit Kialo
  - `multmarkeco`: `kriterioj` K4 und K5, mit Kialo aus dem Nordstern

  Die Kialo von K5 nennt den Nordstern.
- `scoreBoth` gibt `nova` (mit Tor) und `antauxa` (ohne). Jeder `rezulto.json` trägt beide; `raporto.md` zeigt beide Kennzahlen, beide Streuungen, das Mittel je Kriterium in beiden und den Anteil der Markenfähigkeit.
- Der Verlauf trägt `kennzahlAntauxa` neben `kennzahl`, und die Metiejo zeigt die Spalte „Spec 030 F / 0“.

#### D-08 Erneute Bewertung, ohne die gespeicherten Dateien zu ändern
- `pnpm nordstelo restaro <Lauf>` prüft ein Ergebnis von vor Nachlese 11 gegen die alte Gewichtung, ein neueres gegen beide.
- `--skribi` schreibt `restaro.md` und `restaro.json` neben den Lauf. Im Verlauf setzt es `kennzahl` auf die neue und `kennzahlAntauxa` auf die alte Gewichtung. `rezulto.json`, `fakto.json` und `raporto.md` bleiben unberührt.

#### D-09 K2 behält den Fund „Standard-Slot“
- Ein gespeicherter Befund mit `slot="label"` ist so gerendert worden, wie es damals war: Das Feld hatte keinen Namen. Die Regel bleibt, damit die alte Gewichtung die gespeicherten Zahlen wiedergibt.
- Neue Seiten tragen das Attribut nach dem Rendern nicht mehr, weil das Element es entfernt (D-02). Der Fund kommt dort nicht mehr vor.

### Messpunkte

Alle drei mit OpenAI `gpt-4.1-mini`, Temperatur 0,2, 20 Aufgaben × F und 0 × 3, Deutsch, Kostengrenze 15 000 000 Tokens. Gewichtung Spec 030 = ohne Tor, K5 10; Gewichtung Nachlese 11 = Markenfähigkeit als Tor, K5 25.

| | Ausgangslinie | nach den Korrekturen | nach der Fonto |
|---|---|---|---|
| Lauf | `20261024-0825` (neu bewertet) | `20261024-1201` | folgt nach dem Merge von Spec 029 ① |
| Commit | `7e4ebe7` (Spec 030), Katalog `39a0391` | `39a0391` | – |
| **F gegen 0, Gewichtung Nachlese 11** | **74,8 gegen 38** | **79,6 gegen 35,2** | – |
| F gegen 0, Gewichtung Spec 030 | 71 gegen 74,3 | 75,6 gegen 71,4 | – |
| Streuung F / 0, Nachlese 11 | 11 / 0 | 8,6 / 0 | – |
| Streuung F / 0, Spec 030 | 13,2 / 19,3 | 9,5 / 9,6 | – |
| Tokens ein / aus | 1 543 556 / 62 783 | 1 838 103 / 64 358 | – |
| Tokens je Lauf F, Median (ein / aus) | 24 004 / 210,5 | 27 456 / 233,5 | – |
| Ohne Seite | 2 (`benutzerverwaltung` F-1, F-2) | 0 | – |
| Determinismus (`restaro`) | 120, 0 abweichend | 120, 0 abweichend | – |

**Mittel je Kriterium, Variante F** (0–1; Nachlese 11, in Klammern Spec 030):

| | K1 | K2 | K3 | K4 | K5 | K6 | Markenfähigkeit |
|---|---|---|---|---|---|---|---|
| Ausgangslinie | 0,93 | 0,68 | 0,52 | 0,45 (0,5) | 0,89 (0,94) | 0,48 | 0,95 |
| nach den Korrekturen | 0,98 | 0,74 | 0,58 | 0,7 (0,73) | 0,95 (0,98) | 0,46 | 0,97 |

In Variante 0 sind K4 und K5 mit Tor bei beiden Messpunkten 0: Keine der je 60 Seiten folgt einer Marke oder setzt eine eigene Media-Query (`prefers-color-scheme`, `prefers-contrast`).

**Top-10 der Lücken (Variante F):**

| # | Ausgangslinie | Anzahl | nach den Korrekturen | Anzahl |
|---|---|---|---|---|
| 1 | a11y `color-contrast` | 33 | Regulo `field-label-visible` | 21 |
| 2 | Regulo `field-label-visible` | 14 | erfundenes Attribut `kampo.label` | 18 |
| 3 | a11y `label` | 10 | Regulo `placeholder-not-label` | 13 |
| 4 | Regulo `ero-prop-constraint` | 9 | a11y `label` | 11 |
| 5 | erfundenes Attribut `kampo.label` | 7 | erfundenes Tag `fm-form` | 9 |
| 6 | erfundenes Attribut `elektilo.label` | 5 | Regulo `ero-prop-constraint` | 8 |
| 7 | Regulo `field-label-names-the-datum` | 5 | erfundenes Attribut `elektilo.label` | 7 |
| 8 | Regulo `placeholder-not-label` | 5 | Regulo `destructive-label-names-object` | 4 |
| 9 | Regulo `uzo-slot-accepts` | 5 | Regulo `field-label-names-the-datum` | 4 |
| 10 | erfundenes Tag `fm-form` | 4 | erfundener Wert `tabelo.direction=asc` | 4 |

Gemessen ist damit:
- **B-6 wirkt:** `color-contrast` fällt von 33 Seiten der Variante F auf 0.
- **B-7 wirkt:** `benutzerverwaltung` F von 0 (0–77,1) auf 90,4 (85,9–95,8), kein Ergebnis ohne Seite. Alle drei Seiten schreiben wieder `<fm-tabelo>` mit einer `<table>` ohne Slot; das Element nimmt sie jetzt als Inhalt.
- **Die neue Gewichtung trennt F und 0:** Mit dem Tor liegt F 44,4 Punkte vor 0, ohne Tor 4,2.
- **Die größte Lücke ist weiter die Beschriftung der Felder**, jetzt als `label`-Attribut am `kampo` (Plätze 1–4 und 7). B-2 hat den Slot geschlossen, nicht das Attribut (B-3 unten).
- **Streuung:** Ein Lauf mit 3 Wiederholungen. Ein Teil der Bewegung je Aufgabe ist Streuung des Modells (`anmeldung` F 95,8 → 75, `ausleihe-assistent` mit einem Ergebnis 0). Der Vergleich gilt über den Median der Aufgaben, nicht je Aufgabe.

Die Berichte: `.fundamento/nordstelo/20261024-0825/restaro.md` (Ausgangslinie in beiden Gewichtungen) und `.fundamento/nordstelo/20261024-1201/raporto.md` (Messanleitung).

### Messreihen H, O und K

Nachtrag des Maintainers vom 24.10. (Nachricht und Roadmap vom 24.10.): drei Reihen mit je eigenem Modell. Der Abschnitt ④ des Briefings lag bei der Bearbeitung noch nicht vor; die Datei ist unverändert (SHA-256 wie oben). Er wird unverändert übernommen, sobald er im Briefing steht.

| Reihe | Modell | Wiederholungen |
|---|---|---|
| H | OpenAI `gpt-4.1-mini` | 3 |
| O | OpenRouter `nvidia/nemotron-3-ultra-550b-a55b:free` | 1 (Entscheidung des Maintainers am 24.10.: Ein Lauf mit 3 Wiederholungen bräuchte etwa 40 Mio. Tokens und 1 250 Anfragen, mehr als Kostengrenze und freies Tageskontingent) |
| K | Mistral `ministral-14b-2512` | 3 |

- **Ausgangslinie** = Stand von #112 (`721743f`): vor Nachlese 11, ohne Spec 029 ① (#111 nicht gemergt), in einem eigenen Worktree gebaut.
- **Nach den Korrekturen** = `498001e` dieses Branches.
- Kostengrenze 15 Mio. Tokens, Temperatur 0,2, Deutsch.
- Alle Läufe sind mit `restaro --skribi` in beiden Gewichtungen bewertet, je 0 abweichend.

| Reihe | Messpunkt | Lauf | F gegen 0, Nachlese 11 | F gegen 0, Spec 030 | Streuung F / 0 (N11) | Tokens ein / aus | ohne Seite |
|---|---|---|---|---|---|---|---|
| H | Ausgangslinie | `20261024-0825` | 74,8 gegen 38 | 71 gegen 74,3 | 11 / 0 | 1 543 556 / 62 783 | 2 |
| H | nach den Korrekturen | `20261024-1201` | 79,6 gegen 35,2 | 75,6 gegen 71,4 | 8,6 / 0 | 1 838 103 / 64 358 | 0 |
| K | Ausgangslinie | `20261024-1233` | 65,2 gegen 33,3 | 62,9 gegen 47,6 | 13,5 / 2,7 | 2 933 354 / 158 769 | 2 |
| K | nach den Korrekturen | `20261024-1248` | 74,4 gegen 33,3 | 70,7 gegen 47,6 | 16,5 / 0 | 3 261 566 / 148 810 | 1 |
| O | Ausgangslinie | `20261024-1422` | 63,2 gegen 33,3 | 57,5 gegen 46,5 | – (1 Wiederholung) | 15 059 836 / 135 529 | **13 von 40** |
| O | nach den Korrekturen | folgt (freies Tageskontingent) | – | – | – | – | – |
| H, O, K | nach der Fonto | folgt nach Spec 029 ① | – | – | – | – | – |

- **K:**
  - `color-contrast` fällt von 29 Seiten der Variante F auf 0 (B-6).
  - Die Seite, die am `tabelo` hängen blieb (`werkzeugliste` F-2), ist weg (B-7).
  - Ein Ausfall danach ist eine Zeitüberschreitung des Anbieters.
- **O, Ausgangslinie:**
  - 13 von 40 Ergebnissen sind am Anbieter gescheitert und zählen 0 (D-12): sieben Mal Zeitüberschreitung nach 3 Minuten bei Variante 0, sechs Mal „Antwort ohne Nachricht“.
  - Ohne diese Ausfälle (nur zur Einordnung, nicht die Methode): Nachlese 11 F 65,8 (n 15) gegen 0 38,9 (n 12); Spec 030 F 59,4 gegen 0 57,1.
  - Die Ausgangslinie O ist damit schwach belegt.
- **O, Messpunkt nach den Korrekturen:** Er folgt nach dem Tageswechsel des Kontingents. Heute sind etwa 600 der 1 000 freien Anfragen verbraucht (Probe, angehaltener erster Versuch, Ausgangslinie). Der angehaltene erste Versuch mit 3 Wiederholungen liegt außerhalb des Verlaufs unter `/tmp/n11-abgebrochen/`.

### Abweichungen

1. **Konformitätstest geteilt** (D-03): Slots und Props misst der Browser, Ereignisse, React, Guidelines und Gvidanto der Unit-Test. Der rote Test las die Slots noch aus dem Quelltext. Das trägt nicht: Die Auswahlfelder lesen ihre Optionen aus dem Light DOM, Leiste und Menü weisen manuell zu. Nachgezogen in T3105.
2. **Ältere Pins nachgezogen**, weil B-2 sie bewusst ändert:
   - Nachlese 7 ① A-3 erwartete, dass die Guidelines von `langetaro` und `navigado` `slot="tabs"` und `slot="items"` nicht nennen; jetzt nennen sie es als denselben Slot.
   - Nachlese 7 ② B-3 erwartete die Zeile `| \`label\` |` ohne Markierung.
   - `get_ero` (Spec 003) hat `defaultSlot` in den Projekcioj.
3. **Ereignisse nachgetragen, Verhalten unverändert:** Die 15 Skemoj und die `formularo` beschreiben jetzt, was ihr Element schon tut. Dafür hat das Schema `SxablonoSkemo` ein optionales `events`.
4. **B-6 im Browser-Test in zwei Marken** (komuna, ekzemplo: der Build der Browser-Tests), im Lauf in allen vier. Der Wert ist eine Rolle, für jede Marke dieselbe Regel.
5. **Messpunkt in den Checkout des Maintainers geschrieben** (`.fundamento/nordstelo/`, neben die Ausgangslinie), aus diesem Worktree auf dem Commit `39a0391`. Die `.env` habe ich nur gelesen.

### Befunde / Mankoj

- **B-1, `label` als Attribut:** Agenten schreiben `<fm-kampo label="E-Mail">` (18 Mal, Platz 2) und `<fm-elektilo label="…">` (7 Mal). `label` ist dort kein Prop; am `butono` und an anderen ist es eines (Name der reinen Icon-Form). Kandidat für Gvidanto und Uzo: Die Antwort von `get_ero` für ein Feld sagt, dass die Beschriftung Inhalt ist und kein Attribut.
- **B-2, `fm-form`** (9 Mal): Agenten raten die Sxablono `formularo`. Kandidat für `suggest_ero` und Stichwörter.
- **B-3, `fm-tekstareo` sagt kein `change` nach außen.** Das `change` der Plattform geht nicht durch den Shadow DOM, und das Element löst keins aus. Das Skemo nennt jetzt ehrlich nur `input`. Ein Fehler des Ero, hier nicht behoben (Regel 0, keine Verhaltensänderung im Auftrag).
- **B-4, Uzo des `karto` ohne Regel für `media`:** Die Guidelines zeigen den Slot jetzt mit „–“.
- **B-5, `fm-konsileto`:** Der Quelltext liest `[slot="trigger"]`, das Skemo kennt keinen solchen Slot. Es ist der gemeinsame Code der Overlays und wird nie erreicht; der Konformitätstest misst am Element und sieht das zu Recht nicht.
- **B-6, Fehlermeldungen im Bericht:** „Ohne Seite“ trägt Steuerzeichen und Zeilen aus dem Fehler von Playwright. Das ist in Spec 030 so und nur kosmetisch.
- **B-7, nur 3 von 60 Seiten der Variante F nutzen `fm-sxelo`**, wie im ersten Lauf (B-8 der Spec 030).
- **B-8, Fehler in der Messung seit Spec 030: K2 liest die Bereiche einer Sxablono falsch.**
  - `score.ts` nimmt `Object.keys(regions)`, `regions` ist aber eine Liste. Damit gilt jeder `slot=` an einem Kind von `pagxo`, `formularo`, `sxelo`, `filtrilo` oder `redaktilo` als erfunden, auch ein richtiger.
  - Das bestraft Variante F gerade dann, wenn sie Sxablonoj nutzt.
  - Gemessen mit den Bereichen richtig gelesen (Skript außerhalb des Repos):

    | Lauf | betroffene Ergebnisse | F Nachlese 11 | F Spec 030 | K2 von F |
    |---|---|---|---|---|
    | H Ausgangslinie | 7 | 74,8 → 74,8 | 71 → 71,5 | 0,68 → 0,71 |
    | H nach den Korrekturen | 8 | 79,6 → 79,6 | 75,6 → 75,6 | 0,74 → 0,78 |
    | K Ausgangslinie | 27 | 65,2 → 66,7 | 62,9 → 64,4 | 0,61 → 0,69 |
    | K nach den Korrekturen | 32 | 74,4 → 75,1 | 70,7 → 72,9 | 0,66 → 0,75 |
    | O Ausgangslinie | 5 | 63,2 → 64,8 | 57,5 → 59 | 0,57 → 0,6 |

  - Bei K sind 4 der Top-10-Lücken solche falschen Funde. Nicht behoben, weil die Korrektur die gespeicherten Zahlen der Spec 030 ändert (O-6).

### Offen (für den Maintainer)

- **O-1, entschieden vom Maintainer am 24.10., 16:24:** Markenfähigkeit als Tor, K5 = 25, beide Gewichtungen berichten. Gebaut wie oben; die Zeile „Gewichtung Spec 030“ bleibt in jedem Bericht.
- **O-2, gemessene Markenfähigkeit:** Das Tor liest aus dem Befund, welchen Schaltern eine Seite folgen kann (D-06). Ein Fingerabdruck der gezeichneten Farben je Rendering würde messen, ob sie es tut. Ein neues Feld im Befund trennt aber alte und neue Läufe; Vorschlag erst mit dem nächsten Katalog.
- **O-3, `fm-tekstareo` `change`** (B-3): Soll das Element `change` auslösen wie der `kampo`? Das wäre Verhalten des Ero, eigener PR.
- **O-4, Fund „Standard-Slot“ in K2** (D-09): Ab dem nächsten Katalog entfernen? Bis dahin trifft er nur gespeicherte Befunde.
- **O-5, Messpunkt 3:** nach dem Merge von Spec 029 ① derselbe Befehl wie unten (Schritt 4); auslösen kann Sitzung A oder der Maintainer.
- **O-6, B-8 beheben?** Die Bereiche richtig lesen und alle gespeicherten Läufe mit `restaro --skribi` neu bewerten. Das geht deterministisch, ohne neue Läufe, für alle Reihen gleich; danach gibt die alte Gewichtung die Zahlen der Spec 030 nicht mehr byte-gleich wieder.
- **O-7, Ausgangslinie O:** 13 von 40 Ausfällen am freien Anbieter. Vor dem Merge von #111 wiederholen? Das passt erst nach dem Tageswechsel ins Kontingent, und dann fehlt der Platz für den Messpunkt O nach den Korrekturen am selben Tag.

### Messanleitung

Alle Befehle im Checkout des Maintainers. Vor dem Merge auf dem Branch, danach auf `main`:

```sh
cd /Users/thorstenjankowski/n8n-compose/20260918_fundamento-ds
git fetch origin && git switch 261024-nachlese-11-fehler-und-gewicht-d66050
pnpm install && pnpm build
```

**1. B-7 und B-6 sehen.** Eine Seite mit Tabelle ohne Slot, im dunklen Schema, ohne eigene Fläche:

```sh
cd /Users/thorstenjankowski/n8n-compose/20260918_fundamento-ds
open "file:///Users/thorstenjankowski/n8n-compose/20260918_fundamento-ds/.fundamento/nordstelo/20261024-1201/benutzerverwaltung/F-1/pagxo.html"
open "file:///Users/thorstenjankowski/n8n-compose/20260918_fundamento-ds/.fundamento/nordstelo/20261024-1201/benutzerverwaltung/F-1/bildo.png"
```

Erwartet: Die Seite lädt, das Bildschirmfoto zeigt die Tabelle. Im Browser-Test sind beide Fälle in drei Engines: `pnpm --filter @fundamento/eroj exec playwright test test/nachlese-11.spec.ts`.

**2. Die Ausgangslinie in beiden Gewichtungen.**

```sh
cd /Users/thorstenjankowski/n8n-compose/20260918_fundamento-ds
pnpm nordstelo restaro .fundamento/nordstelo/20261024-0825
open "file:///Users/thorstenjankowski/n8n-compose/20260918_fundamento-ds/.fundamento/nordstelo/20261024-0825/restaro.md"
```

Erwartet: „120 Ergebnisse erneut bewertet, 0 abweichend.“, dann „Gewichtung Nachlese 11: Kennzahl F 74.8 · Kennzahl 0 38“ und „Gewichtung Spec 030: Kennzahl F 71 · Kennzahl 0 74.3“. Mit `--skribi` schreibt der Befehl `restaro.md` neu und trägt beide Kennzahlen in den Verlauf; das ist schon geschehen.

**3. Der Messpunkt nach den Korrekturen.**

```sh
cd /Users/thorstenjankowski/n8n-compose/20260918_fundamento-ds
open "file:///Users/thorstenjankowski/n8n-compose/20260918_fundamento-ds/.fundamento/nordstelo/20261024-1201/raporto.md"
pnpm nordstelo restaro .fundamento/nordstelo/20261024-1201
pnpm fm metiejo --open
```

In der Metiejo `http://localhost:7301/nordstelo`: beide Läufe, Kennzahl F und 0 der neuen Gewichtung, daneben „Spec 030 F / 0“, die Linie des Verlaufs, je Aufgabe Seite und Bildschirmfoto.

**4. Messpunkt 3 nach dem Merge von Spec 029 ①** (kostet etwa 1,9 Mio. Tokens):

```sh
cd /Users/thorstenjankowski/n8n-compose/20260918_fundamento-ds
git switch main && git pull && pnpm install && pnpm build
pnpm nordstelo --anbieter openai --modell gpt-4.1-mini --max-tokens 15000000
```

Der Schlüssel kommt aus der `.env` des Checkouts und erscheint in keiner Zeile.

**5. B-3, B-2 und die Gewichtung als Tests.**

```sh
cd /Users/thorstenjankowski/n8n-compose/20260918_fundamento-ds
pnpm --filter @fundamento/mcp exec vitest run src/nachlese-11-anbieter.test.ts
pnpm --filter @fundamento/projekcioj exec vitest run src/nachlese-11.test.ts
pnpm --filter @fundamento/eroj exec playwright test test/nachlese-11-konformeco.spec.ts
pnpm --filter @fundamento/nordstelo test
```

Der Katalog mit beiden Gewichtungen und dem Tor: `file:///Users/thorstenjankowski/n8n-compose/20260918_fundamento-ds/packages/modelo/data/nordstelo.json`.
