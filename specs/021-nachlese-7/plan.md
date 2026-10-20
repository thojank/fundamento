# Nachlese 7 – Rückmeldung aus Arkitekturo (0.1.0 im Einsatz) – Plan

**Spec:** [`briefing.md`](briefing.md) (das Briefing vom 2026-10-20, unverändert kopiert) · **Quelle:** die Kandidaten- und die Nutzungsdatei aus Arkitekturo (Anforderung, kein Code übernommen) · **Basis:** `main` nach #89 (`0fcce4c`) · **Regel 0** gilt: der Weg, den das Repo schon geht, sonst die kleinste Änderung mit Eintrag hier; nie eine Grenze aufweichen, um grün zu werden. Kein neues Ero, keine Token-Änderung, keine neue Regulo; keine Umbenennung von Props, Slots, Achsen, Ereignissen oder Tags, die die Nutzungsdatei nennt.

## ① Fehler (0.1.1)

**Branch:** `261020-nachlese-7-fehler-116ba2` (von `main` `0fcce4c`) · **Datum:** 2026-10-20 · **Stand:** zur Abnahme (Messanleitung unten); veröffentlicht wird erst nach der Abnahme.

### Zusammenfassung

1. **A-1 `dialogo` zeigt seine Meldung.** Die Stilregel `:where([part="message"]:not(:has(slot:not(:empty))))` fragte das Slot-Element, das im Schattenbaum immer leer ist – jede Meldung war unsichtbar, nur über `aria-describedby` im Zugänglichkeitsbaum. Jetzt setzt der Render `hidden` am Absatz aus `#filled("message")` (die Zuweisung, wie bei `avizo` und `karto`), und `aria-describedby` steht nur, solange die Meldung da ist. Die Regel ist `:where([part="message"][hidden]) { display: none; }`.
2. **A-2 `createElement` für alle 32 Eroj.** `menuo` gab dem Host im Konstruktor eine `id` (die Kennung des Ankers, über `#overlayBindTrigger` an seinem eigenen Auslöser), `konsileto` setzte dort `popover` und `role`. Beides geschieht jetzt beim Einhängen bzw. im Render; der Konstruktor schreibt nichts mehr an den Host.
3. **A-3 Guidelines = Element.** Der Satz zu den Einträgen eines Slots und die Beispiele schreiben die Form, die das Element liest – wie die Vitrino (`optionTexts`): Tabs von `langetaro` als Kinder ohne `slot` (`<data value="express">Express</data>`), Einträge von `navigado` als direkte Links (`<a href="/express" data-page="express">Express</a>`), Ebenen von `spuro` als Links, die letzte als Text; `pagxigilo` zeichnet seine Seiten selbst und nimmt keine Einträge. `elektilo`, `elekto` und `kompletigilo` bleiben bei `<data slot="options" …>`.
4. **A-4 ein Satz je Ziel in `Guidelines.md`.** Die Doppel kamen nicht aus den use-instead-Regeln, sondern aus dem Filter nach Rolle: `dialog` tragen `dialogo` und `sxvebilo`, `combobox` tragen `elektilo` und `kompletigilo`. Der Satz zur Bestätigung nennt nur das modale Dialogo, der zur langen Liste nur das Elektilo; das Feld mit Vorschlägen hat seinen eigenen Satz. Ein Test verbietet zwei Sätze mit gleichem Anfang und verschiedenem Ero.
5. **A-5 Beispiele mit Hilfe und Fehler.** Die Texte eines benannten Slots in den Beispielen der Jugxoj (`help`, `error`, `message`, `reason`, `reason-help`, `value-text`) stehen jetzt als `<span slot="…">` im Markup; vorher fielen sie weg. Betroffen: `alsxutilo`, `dialogo`, `kampo`, `markobutono`, `mezurilo`, `tekstareo`.
6. **A-6 `tabelo` lässt eine native `<caption>` stehen.** Ist der Slot leer, gilt die vorhandene Caption und benennt die Tabelle (auch die Region); nur eine Caption, die das Element selbst geschrieben hat (`data-fm-caption`), folgt einem geleerten Slot.
7. **A-7 `avizo` nach `dismiss`.** Skemo (Beschreibung von `dismissible`), Uzo (`purpose`) und Guideline sagen: das Element versteckt sich, bleibt im Dokument und gibt den Fokus weiter; die Anwendung entfernt es, wenn sie will. Die Guideline hat dafür den Abschnitt „Dismiss“ mit einem Beispiel. Kein Verhalten geändert.
8. **A-8 Release 0.1.1 vorbereitet.** Alle Pakete und die Modelo-Version auf `0.1.1`, `AGORDILO_VERSION` mit; die Beispielmarken `provo` und `provo-kompakta` neu abgeleitet (nur die Versionsstempel ändern sich); `CHANGELOG.md` mit „0.1.1 – Fehlerbehebungen“ (A-1 bis A-7). Die CJS-Entfernung bleibt bei 0.2.0. Veröffentlicht wird nach der Abnahme über `release.yml` (dry-run, dann publish).

### Entwurfsentscheidungen

#### D-01 Sichtbarkeit aus der Zuweisung (A-1)
Ein `<slot>` hat im Schattenbaum keine Kinder; `:empty` trifft ihn immer, egal was ihm zugewiesen ist. Die Zuweisung kennt nur das Skript (`assignedNodes({ flatten: true })`), darum setzt der Render `hidden` – der Weg, den `avizo` (Überschrift, Details, Aktionen) und `karto` schon gehen. `aria-describedby` folgt derselben Abfrage, damit es nie auf einen leeren oder versteckten Absatz zeigt. Das Markup des Schattenbaums bleibt (der Pin in `web-component.test.ts` gilt), der Render nimmt das Attribut weg, wenn keine Meldung da ist.

#### D-02 Nichts an den Host im Konstruktor (A-2)
Die Plattform verlangt, dass ein Element aus `createElement` ohne Attribute aus dem Konstruktor kommt. Sonst **meldet** sie den Fehler (`NotSupportedError` als Fehlerereignis) und gibt ein `HTMLUnknownElement` zurück – sie wirft nicht. Darum prüft der Test je Tag, dass das Ergebnis eine Instanz der registrierten Klasse mit Schattenbaum ist und kein Fehler gemeldet wurde, in Chromium, Firefox und WebKit. Die Bindung des Auslösers (`popover`, `menuo`) läuft in `connectedCallback` und weiter bei `slotchange`. Die Schicht des `konsileto` (`popover="manual"`, `role="tooltip"`) setzt der Render; er läuft beim Einhängen und bei jeder Attributänderung, also auch vor `showPopover` bei einem geparsten `open`.

#### D-03 Einträge in der Form des Elements (A-3)
`entryMarkup` und `entrySentence` im Make Kit lesen dieselben Merkmale wie `optionTexts` der Vitrino: Rolle `navigation` (Links; mit `parts.separator` die letzte Ebene als Text; mit `parts.ellipsis` keine Einträge), `slot.default` (ohne `slot`-Attribut), sonst der benannte Slot. Der Test rendert jedes ```html-Beispiel und jedes Inline-Beispiel eines Eintrags im Browser. Ein Kind gilt als unsichtbar, wenn kein Slot es nimmt und das Element es auch nicht selbst liest. Selbst lesen heißt: ein Kind im benannten Slot der Einträge, wie die Optionen von `elektilo` und `kompletigilo`, die das Element in seine Liste überträgt.

#### D-04 Ursache der Doppel (A-4)
Das Briefing vermutete die use-instead-Regeln. Die Ursache war `guidelines()`: `dialogLines` und `selectLines` filtern nach Rolle, und seit Spec 014 teilen sich zwei Eroj je eine Rolle. Die Filter schließen jetzt das Popover (`isPopover`) bzw. das Feld mit Vorschlägen (`isSuggest`) aus – derselbe Unterschied, den `dialogName` und `selectName` dort schon machen. `listName` im Satz zur Radiogruppe nimmt ebenso nur das Elektilo; vorher war das nur durch die alphabetische Reihenfolge richtig. **Gvidanto:** Er liest Skemo und Uzo (Ziele, use-instead, Grenzen), nicht `Guidelines.md`; die Doppelung hat er nicht. Keine Antwort geändert, kein Dialog gekippt.

#### D-05 Slot-Texte im Beispiel (A-5)
`exampleBlock` kannte nur Listen (die Optionen). Ein Text eines benannten Slots wird `<span slot="name">…</span>`, ein Text des Standard-Slots bleibt Text; ein Schlüssel, der kein Slot des Skemo ist, fällt weg wie vorher.

#### D-06 Eigene Caption markiert (A-6)
Eine Caption, die das Element anlegt, trägt `data-fm-caption`. Nur sie wird mit dem Slot geleert; eine Caption aus dem Markup bleibt, solange der Slot leer ist. Ein gefüllter Slot gewinnt wie bisher (Spec 011 ④, D-09). Der Name der Region (`aria-label`) ist die geltende Caption.

#### D-07 Der Vertrag von `dismiss`, ausgesprochen (A-7)
`dismiss` ist abbrechbar; danach versteckt sich das Element und gibt den Fokus an das nächste fokussierbare Element. Entfernt die Anwendung das Element schon im Ereignis, sucht es danach seinen Nachbarn aus einem gelösten Knoten – der Fokus ginge irgendwohin. Darum entfernt das Beispiel nach dem Ereignis (`queueMicrotask`), wie Arkitekturo es tut. Ein Browser-Test führt genau das Beispiel aus der Guideline aus: die Meldung ist weg, der Fokus steht auf dem folgenden Knopf.

#### D-08 Version 0.1.1 (A-8)
Neun `package.json` (Wurzel und acht Pakete) und `AGORDILO_VERSION`; die Modelo-Version ist die des Pakets `@fundamento/modelo`, der Kit-Version-Check (`kitVersion`) folgt ihr: ohne Angabe `0.1.1-next.0`, für das Release genau `0.1.1` (`latest`). Die Fixtures `provo` und `provo-kompakta` sind mit `fm agordilo derive` neu abgeleitet; es ändern sich nur `aspekto.json` (Version des Pakets, Vortaro-Version), `raporto.json` und `raporto.md` (Agordilo-Version). Die Beispiele in `release.yml` und `scripts/release-kits.sh` nennen 0.1.1.

### Gefundene Muster

- **A-1** (`slot:not(:empty)`, `slot:empty`): nur im Dialogo; kein anderes Ero und kein anderes Celo nutzt `:empty`. Die anderen Teile mit Slot-Inhalt (Hilfe und Fehler der Felder, Überschrift und Details der Avizo, Kopf und Fuß der Karto) setzen ihre Sichtbarkeit schon aus der Zuweisung.
- **A-2** in weiteren Eroj: **`konsileto`** (`popover` und `role` am Host im Konstruktor) – derselbe Fehler, mit behoben. `sxvebilo` band seinen Auslöser auch im Konstruktor, schrieb dabei aber nichts an den Host, weil es keinen eigenen Auslöser hat; die Bindung läuft jetzt wie beim Menuo beim Einhängen. Der Test über alle 32 Tags findet sonst nichts.
- **A-3** über `langetaro` und `navigado` hinaus: **`spuro`** (gleiche Form wie navigado, letzte Ebene Text) und **`pagxigilo`** (beschrieb Einträge, die er nicht nimmt).
- **A-4:** neben den zwei Doppeln war der Satz zur Radiogruppe („six or more go into an `<Elektilo>` list“) nur zufällig richtig; jetzt bewusst.
- **A-5:** dieselbe Lücke in allen Beispielen mit Texten benannter Slots: `alsxutilo`, `dialogo`, `kampo`, `markobutono`, `mezurilo` neben `tekstareo`.

### Abweichungen

1. **A-2: Das Element wirft nicht, die Plattform meldet.** Das Briefing (wie die Nutzungsdatei) sagt „wirft bei `document.createElement`“. Die Plattform meldet den Fehler und gibt ein unbekanntes Element zurück (D-02). Der erste rote Test prüfte nur auf einen Wurf und war grün; der Test im Rot-Commit prüft Klasse, Schattenbaum und gemeldete Fehler.
2. **A-7: Beispiel nach dem Ereignis.** Der rote Test erwartete `event.currentTarget.remove()` im Ereignis; das bräche die Fokusweitergabe des Elements (D-07). Erwartet wird jetzt das Beispiel mit `queueMicrotask`, dazu ein Browser-Test des Beispiels.
3. **A-1: Prüfung des Textes.** Der rote Test las den Text über den Absatz im Schattenbaum; der enthält nur den Slot, nicht den zugewiesenen Text. Er prüft jetzt den zugewiesenen `span`: sichtbar, mit dem Satz.
4. **A-8: Bytevergleich der Stufe 1.** Der Test „Standard = Stufe 1“ (`stufe2.test.ts`) vergleicht die Prüfsummen der Ableitung mit denen von `main` `ac5deb3`. Die Versionsstempel (`"version"`, `"vortaro"`, `"agordilo"`, „Agordilo 0.1.1 (“) setzt er vor dem Hashen auf 0.1.0 zurück. Verglichen wird die Ableitung, nicht die Release-Nummer. Die Prüfsummen bleiben unverändert.
5. **A-7: Pin der Uzo.** `avizo.test.ts` pinnt `purpose`; der Pin folgt dem neuen Satz.
6. **A-8: Versions-Pins.** Die Tests mit der Version als Literal folgen 0.1.1: `cli` (`--version`), Modelo (`index`, `load-modelo`, `export-modelo`, `build`, `describe-phase1`, `e2e/export`), `release-workflow` (die Formen 0.1.1 → `latest`, 0.1.1-next.N → `next`, abgelehnt 0.2.0 und 0.1.1.1) und `make-kit` (das Release ist genau die Modelo-Version).

### Befunde / Mankoj

- **F-1 Ursache A-4 anders als vermutet** (D-04): der Filter nach Rolle, nicht die use-instead-Regeln.
- **F-2 A-2 ist ein gemeldeter Fehler, kein Wurf** (Abweichung 1). Arkitekturo erzeugt Kit-Elemente seit dem Befund über die registrierte Klasse; das geht weiter, `createElement` geht jetzt auch.
- **F-3 Die Vitrino zeigt im Dialogo das Wort „Nachricht“** (`VITRINO_SLOT_TEXTS.message`, dasselbe Wort wie in Figma), keinen ganzen Satz. Vor 0.1.1 fehlte es; jetzt steht es unter der Überschrift. Ganze Sätze stehen in den Beispielen von `dialogo.md`.
- **Mankoj:** keine. Kein Token fehlt, keines ist geändert.

### Offen (für den Maintainer)

1. **Abnahme ①** nach der Messanleitung.
2. **Release 0.1.1** nach der Abnahme: `release.yml` von Hand starten, zuerst `dry-run` mit Version `0.1.1` (zeigt `--dry-run --tag latest`), dann `publish` mit Version `0.1.1`. Veröffentlicht werden die Make Kits `@fundamento/make-kit-komuna` und `@fundamento/make-kit-ekzemplo` unter `latest`.
3. **Hinweis für Arkitekturo:** unten, nach ② geschrieben.

### Messanleitung

Alle Befehle im Checkout des Maintainers `/Users/thorstenjankowski/n8n-compose/20260918_fundamento-ds` (nach dem Merge von ① auf `main`), nach `pnpm install` und `pnpm build`. **Links immer mit `file://`**, sonst liest macOS das Fragment als Teil des Dateinamens.

**1. Dialogo mit Meldung (A-1).** Build der Vitrino und öffnen:

```sh
cd /Users/thorstenjankowski/n8n-compose/20260918_fundamento-ds
pnpm fm projekcioj build --out .fundamento/projekcioj
open "file:///Users/thorstenjankowski/n8n-compose/20260918_fundamento-ds/.fundamento/projekcioj/vitrino/index.html#aspekto=komuna"
```

Zum Abschnitt „dialogo“ scrollen, eine Zelle mit „Öffnen“ öffnen: unter der Überschrift steht die Meldung „Nachricht“ (vorher fehlte sie). Im Zugänglichkeitsbaum (Safari: Entwickler → Element → Knoten; Chrome: DevTools → Accessibility) hat der Dialog die Beschreibung „Nachricht“. Die Beispiele mit ganzen Sätzen: `file:///Users/thorstenjankowski/n8n-compose/20260918_fundamento-ds/.fundamento/projekcioj/make-kit/komuna/guidelines/components/dialogo.md`.

**2. createElement (A-2).** In der Konsole derselben Seite:

```js
const menu = document.createElement("fm-menuo");
menu instanceof customElements.get("fm-menuo"); // true (0.1.0: false, Fehler in der Konsole)
document.createElement("fm-konsileto") instanceof customElements.get("fm-konsileto"); // true
```

Der Test über alle 32 Tags: `pnpm --filter @fundamento/eroj exec playwright test test/nachlese-7.spec.ts`.

**3. Guidelines (A-3 bis A-5, A-7).** Im Build von Schritt 1:

```sh
cd /Users/thorstenjankowski/n8n-compose/20260918_fundamento-ds/.fundamento/projekcioj/make-kit/komuna/guidelines
grep -n "Each tab\|Each entry\|Each level\|draws its pages" components/langetaro.md components/navigado.md components/spuro.md components/pagxigilo.md
grep -n "Every confirmation\|A choice of one among many" Guidelines.md
grep -n 'slot="help"\|slot="error"' components/tekstareo.md
sed -n '/## Dismiss/,/^```$/p' components/avizo.md
```

Erwartet: Tabs ohne `slot`, Links als Kinder, je ein Satz zur Bestätigung (`<Dialogo>`) und zur langen Liste (`<Elektilo>`), Hilfe und Fehler im Markup, der Abschnitt „Dismiss“ mit dem Beispiel. Dateien: `file:///Users/thorstenjankowski/n8n-compose/20260918_fundamento-ds/.fundamento/projekcioj/make-kit/komuna/guidelines/Guidelines.md`, `file:///Users/thorstenjankowski/n8n-compose/20260918_fundamento-ds/.fundamento/projekcioj/make-kit/komuna/guidelines/components/langetaro.md`.

**4. Tabelo mit nativer Caption (A-6).** In der Konsole der Vitrino:

```js
document.body.insertAdjacentHTML("beforeend", '<fm-tabelo id="t"><table slot="content"><caption>Standards des Projekts</caption><tbody><tr><td>STD-1</td></tr></tbody></table></fm-tabelo>');
document.querySelector("#t caption").textContent; // "Standards des Projekts" (0.1.0: "")
```

**5. Release-Vorbereitung (A-8).**

```sh
cd /Users/thorstenjankowski/n8n-compose/20260918_fundamento-ds
pnpm fm --version            # 0.1.1
FUNDAMENTO_KIT_VERSION=0.1.1 sh scripts/release-kits.sh dry-run --print   # --dry-run --tag latest
pnpm check:release
```

`CHANGELOG.md`: `file:///Users/thorstenjankowski/n8n-compose/20260918_fundamento-ds/CHANGELOG.md` (Abschnitt „0.1.1 – Fehlerbehebungen“). Dann `release.yml` in GitHub: erst `dry-run`, nach der Abnahme `publish`, beide mit Version `0.1.1`.

**Figma:** ① ändert nichts, was das Plugin zeichnet (Stilregel und Verhalten der Web-Elemente, Guidelines des Make Kits). Ein Lauf des Plugins ist für ① keine Abnahme; Figma kommt mit ② (B-2, B-4).

### Hinweis für Arkitekturo

Nach ② geschrieben (Briefing, Abnahme „Danach“). Was Arkitekturo um 0.1.0 herum gebaut hat und mit 0.1.1 bzw. 0.2.0 entfallen **kann**. Es gibt keinen Codetransfer: Kein Code geht von hier nach Arkitekturo und keiner von dort hierher. Arkitekturo entscheidet selbst, ob und wann es umstellt. Jede Zeile nennt den Befund der Nutzungsdatei und das, was jetzt das Ero tut.

| Umweg in Arkitekturo (0.1.0) | ab | was das Ero jetzt tut |
|---|---|---|
| Kit-Elemente über `new (customElements.get(tag))()` statt `document.createElement` (Lücke `menuo`) | 0.1.1 (A-2) | `createElement` liefert jedes der 32 Elemente; der Weg über die Klasse bleibt gültig |
| Der Erläuterungssatz der Dialoge fehlte sichtbar (kein Umweg, offene Frage des PR) | 0.1.1 (A-1) | `message` ist sichtbar; `aria-describedby` nur mit Meldung |
| Eigene `<caption>` wurde vom leeren Slot geleert | 0.1.1 (A-6) | die native Caption bleibt, solange der Slot leer ist |
| Entfernen der Avizo per Microtask nach `dismiss` | – (A-7) | bleibt der Weg; die Guideline zeigt genau ihn |
| Native `h1`/`h2` in `ark-page` und `section`, weil `titolo` keinen Fokus nimmt | 0.2.0 (B-1) | `<fm-titolo level="1" focusable>`; `focus()` am Element setzt den Fokus auf die Überschrift |
| Spaltenname „Konformität“ in jeder Zeile der Pflicht-Übersicht | 0.2.0 (B-2) | `<fm-mezurilo label-hidden>`; der Name bleibt für Screenreader |
| Leerzustand der Tabelle nur mit Text | 0.2.0 (B-3) | eine `fm-butono slot="empty"` neben dem Text ist der nächste Schritt |
| Eigene Sperre `busy` gegen eine zweite Wahl im Zeilenmenü | 0.2.0 (B-4) | `<fm-menuo disabled>`: Auslöser gesperrt (`aria-disabled`), das Menü öffnet nicht |
| Pfad der Validierungsfehler als Text („/tags/1: …“) | 0.2.0 (B-5) | `details` nimmt eine Liste und `fm-teksto kind="code"` |
| Problemhinweis ans Ende des Formular-Dialogs gestellt | 0.2.0 (B-6) | `fm-avizo slot="content"` darf oben stehen; der erste Fokus geht auf das erste Feld |
| Enter im Dialog „Metadaten bearbeiten“ bestätigte nichts mehr | 0.2.0 (B-7) | Enter in einem einzeiligen Feld des Inhalts löst `confirm` aus (abbrechbar wie bisher), solange keine Sperre greift |
| Meldung des Befunds an die `message` angehängt | 0.2.0 (B-8) | mehrere `fm-teksto slot="message"` als Absätze |
| `preventDefault` auf dem Host des `saltligilo` | 0.2.0 (B-9) | bleibt gültig und dokumentiert; dazu `focus-only` |
| Native `p` für Absätze mit Badge und Link | 0.2.0 (B-10) | `fm-teksto` mit `fm-ligilo`, `fm-insigno` und `fm-teksto kind="code"` als Kinder; `check_usage` erlaubt es |
| `insigno` „Pflicht“ neutral statt brandfarben | – | bleibt: eine Entscheidung (Grenze `brand-badge`), keine Lücke |

## ② Ergänzungen (0.2.0)

**Branch:** `261020-nachlese-7-ergaenzungen-116ba2` (gestapelt auf ① `261020-nachlese-7-fehler-116ba2`) · **Datum:** 2026-10-20 · **Stand:** zur Abnahme; Teil von 0.2.0 (nicht veröffentlicht).

### Zusammenfassung

Nur additiv: neue Props, Slots, die mehr annehmen, oder Verhalten, wo vorher keines war. Kein neues Ero, kein Token, keine Regulo, nichts umbenannt.

| # | Ero | Ergänzung | Skemo / Uzo | Guideline | Vitrino | Figma | Gvidanto | Browser-Test |
|---|---|---|---|---|---|---|---|---|
| B-1 | `titolo` | `focusable`: `tabindex=-1` an der Überschrift im Schattenbaum, `focus()` am Element fokussiert sie | Prop | Props-Tabelle | – (unsichtbar) | – | `get_ero` | ✓ |
| B-2 | `mezurilo` | `label-hidden`: Label weg aus der Sicht, Name bleibt | Prop | Props-Tabelle | Zeile „label-hidden“ | BOOLEAN `label-visible` am Label | `get_ero` | ✓ |
| B-3 | `tabelo` | Slot `empty` nimmt `butono` (nächster Schritt) | Uzo `empty`: text, butono; max 2, nesting 1 | Slots-Tabelle | Zeile „empty mit butono“ | – | `check_usage` | ✓ |
| B-4 | `menuo` | `disabled`: Auslöser gesperrt (`aria-disabled`), öffnet nicht, ein offenes schließt | Prop | Props-Tabelle | Zeile „disabled“ | Variante disabled: Auslöser gesperrt | `get_ero` | ✓ |
| B-5 | `avizo` | `details` nimmt `teksto kind=code` und Listen | Uzo `details`: text, teksto; nesting 1 | Slots-Tabelle | Zeile „details mit Liste und Code“ | – | `check_usage` | ✓ |
| B-6 | `dialogo` | `content` nimmt `avizo`; erster Fokus auf das erste fokussierbare Kind | Uzo `content` + avizo, `composes.with` + avizo; Beschreibung von `open` | Slots, Together with, Props | – | – | `check_usage` | ✓ |
| B-7 | `dialogo` | Enter in einem einzeiligen Feld des Inhalts bestätigt, solange keine Sperre greift | `a11y.keys` + Enter; Beschreibung von `open` | Props-Tabelle | – | – | `get_ero` (keys) | ✓ |
| B-8 | `dialogo` | `message` aus mehreren Absätzen `teksto` | Uzo `message`: text, teksto; ohne max, nesting 1 | Slots-Tabelle | Zeile „message in Absätzen“ | – | `check_usage` | ✓ |
| B-9 | `saltligilo` | `click` abbrechbar (dokumentiert), dazu `focus-only` | Prop | Props-Tabelle | – (Verhalten) | – | `get_ero` | ✓ |
| B-10 | `teksto` | gemischter Fließtext: `ligilo`, `insigno`, `teksto kind=code` als Kinder | Uzo `label`: text, ligilo, insigno, teksto; ohne max, nesting 1; `composes.with` + insigno, teksto | Slots, Together with | Zeile „mit ligilo, insigno, code“ | – | `check_usage` | ✓ |

**Nicht geändert:** `insigno` ohne Brand-Ton – eine Entscheidung, keine Lücke; die Grenze `brand-badge` bleibt.

### Entwurfsentscheidungen

#### D-01 Wo eine Ergänzung steht
Ein Verhalten steht im Skemo (die Beschreibung eines Props, `a11y.keys`), eine Zusammensetzung in der Uzo (`slots`, `composes.with`). Daraus erzeugt das Make Kit die Guideline (Props-, Slots-Tabelle, „Together with“), und der Gvidanto antwortet daraus (`get_ero`, `check_usage`). Kein Satz steht zweimal.

#### D-02 B-1 Fokus über die Delegation
Alle Eroj hängen ihren Schattenbaum mit `delegatesFocus` an. `tabindex=-1` an der Überschrift (`[part="text"]`, Rolle heading) macht sie zum ersten fokussierbaren Bereich. `focus()` am Host landet dort, die Tab-Reihenfolge bleibt unberührt.

#### D-03 B-2 wie `caption-hidden`
Die Stilregel `:host([label-hidden]) [part="label"]` ist dieselbe Ausblendung wie `.fm-hidden` (abgeschnitten, aus dem Fluss), ohne Größenliteral. `aria-labelledby` des Meters zeigt weiter auf das Label. In Figma ist es ein BOOLEAN-Schalter wie bei `caption-hidden`. Er heißt `label-visible`, weil `label` schon die TEXT-Eigenschaft des Sets ist (`shownAs` im Plan).

#### D-04 B-3 der Knopf zieht um
Der Leerzustand ist ein `fm-plenstato` in der nativen Tabelle (Light DOM); dorthin kann kein Slot des `fm-tabelo` projizieren. Darum zieht die `fm-butono slot="empty"` der Anwendung in die `actions` des Zustands, solange er steht. Kommen Zeilen, zieht sie zurück in den Slot. Es bleibt dasselbe Element, Listener bleiben. Der Text des Zustands ist der Text des Slots ohne den Knopf.

#### D-05 B-4 gesperrt, nicht deaktiviert
`aria-disabled` am Auslöser (eigener wie eingesetzter, und an dessen innerem Control), kein natives `disabled`. Der Auslöser bleibt fokussierbar und sagt, warum nichts aufgeht. `#overlayOpen` öffnet nicht, solange `disabled` gilt, ob über Klick, Taste oder `open`; ein offenes Menü schließt. Gibt der Render die Sperre frei, nimmt er nur zurück, was er selbst gesetzt hat. In Figma zeigt die Variante `state=disabled` den Auslöser-Stellvertreter in den Farben eines gesperrten Eintrags (`item.fill`, `item.color`; der Auslöser im Web ist eine `butono` emphasis low, dieselbe tertiäre Familie), ohne die Maße zu binden: alle Varianten bleiben gleich groß.

#### D-06 B-6 der erste fokussierbare
`#focusFirst` versucht die Kinder des Inhalts der Reihe nach und hört beim ersten auf, das den Fokus hält (`:focus-within`). Eine Meldung (Rolle status oder alert im Schattenbaum) wird gelesen, nicht betreten, und wird übersprungen, auch wenn sie einen Schließen-Knopf hat. Danach wie bisher: Begründung, Bestätigung.

#### D-07 B-7 Enter wie in einem Formular
Ein `keydown` Enter, dessen Ursprung ein einzeiliges `input` in einem Kind des Inhalts ist, ruft `#confirm` auf. Damit gilt die Sperre (Begründung `required` leer, ungültiges Feld), und `confirm` bleibt abbrechbar. Ausgenommen: Mehrzeiliges (die Begründung, `tekstareo`), Kästchen, Schalter, Datei, Bereich, Farbe, eine laufende Eingabe-Komposition. `a11y.keys` nennt Enter, wie beim `kampo`.

#### D-08 B-9 erst der Fokus, dann das Fragment
Der Listener des Elements sitzt am Link im Schattenbaum und läuft vor jedem Listener am Host. Der Fokus ist also gesetzt, bevor die Seite `preventDefault` ruft; das Fragment bleibt dann stehen. `focus-only` macht dasselbe ohne Listener der Seite.

#### D-09 B-5, B-8, B-10 – das Element konnte es schon
Die Absätze in `message`, Liste und Code in `details`, Link, Badge und Code im Fließtext rendert das Element schon richtig (Browser-Tests grün schon im Rot-Commit). Gefehlt hat die Erlaubnis: `check_usage` wies jede dieser Zusammensetzungen ab (`uzo-slot-accepts`, `uzo-slot-max`, `uzo-slot-nesting`). Die Ergänzung ist die Uzo, mit Guideline und Gvidanto daraus.

#### D-10 Vitrino
Eine Funktion `additionRows` hängt an die Tabelle des Ero je eine Zeile für das, was sich zeigt (B-2, B-3, B-4, B-5, B-8, B-10). Die Wörter folgen den Fällen aus Arkitekturo; der Dialog liegt wie alle Dialoge der Vitrino hinter „Öffnen“.

### Arkitekturo-Vertrag

Geprüft gegen die Tabelle „Ero × genutzte Props, Slots und Achsenwerte“ der Nutzungsdatei: Kein Prop, Slot, Achsenwert, Ereignis oder Tag ist umbenannt oder entfernt; jede vorhandene Form gilt weiter.
- Text in `empty` der Tabelle: wie bisher.
- `message` als ein Text: wie bisher.
- Sechs Felder und ein Problembereich im `content`: wie bisher.
- `preventDefault` am Saltligilo: wie bisher, jetzt dokumentiert.
- `dismiss` der Avizo: unverändert.

Neu ist Verhalten an zwei Stellen, wo vorher keines war:
- **Enter bestätigt im Dialog (B-7).** Der Formular-Dialog, der `confirm` bis zum Erfolg mit `preventDefault` hält, bekommt das Ereignis jetzt auch von Enter, abbrechbar wie vom Knopf.
- **Der erste Fokus überspringt eine Meldung (B-6).**

### Abweichungen

1. **B-5, B-10: `teksto kind=code` heißt in der Uzo `teksto`.** Die Uzo kennt in `accepts` nur Namen von Eroj, `text` und `icon`, keine Props. „kind=code“ steht in der Guideline (Together with) und im Beispiel. Eine Liste (`ul`/`ol` mit Text) ist für `check_usage` Text. Keine Schemaänderung.
2. **B-2: Prüfung im Browser über die Lage.** Der rote Test erwartete `toBeHidden()`. Ein abgeschnittenes Element zählt für Playwright als sichtbar, so wie die Caption mit `caption-hidden`. Der Test prüft jetzt, dass das Label keinen Platz nimmt (die Spur steht oben) und abgeschnitten ist.
3. **B-5: Prüfung über den Zugänglichkeitsbaum.** Der erste Entwurf suchte den Code-Text mit `hasText` an der Rolle code; der Absatz im Schattenbaum enthält nur den Slot. Geprüft wird der Baum (`ariaSnapshot`: listitem, code). Korrigiert vor dem Rot-Commit.
4. **Doku-Test:** Der rote Test verlangte wörtlich „kein Codetransfer“; der Satz heißt richtig „keinen Codetransfer“. Der Test nimmt beide Formen.
5. **Pins der Daten** (`src/data/*.test.ts` von avizo, dialogo, menuo, mezurilo, saltligilo, tabelo, teksto, titolo), **der Figma-Pläne** (mezurilo: Eigenschaften, Inventar, Schalter; titolo: Eigenschaften; Plugin: Vorgaben der Sets) **und der Vitrino-Zählungen** (`datumoj.test.ts` und `check:vitrino`: dialogo, avizo, tabelo, mezurilo, teksto je ein Element mehr; der zweite Auslöser „Weitere Aktionen“ ist der gesperrte): Sie folgen den Ergänzungen, mit einem Kommentar „Nachlese 7 ②“. `check:vitrino` öffnet zusätzlich den Dialog von B-8 (axe) und prüft den gesperrten Auslöser.

### Befunde / Mankoj

- **F-1 `actions` mit nesting 0 (Befund, nicht behoben).** Die Uzo von `dialogo` und `avizo` erlaubt in `actions` den `butono` mit `nesting: 0`. `check_usage` meldet darum jeden Knopf dort als `uzo-slot-nesting`, vor und nach ② gleich. Die Gvidanto-Dialoge von ② lassen `actions` weg. Die Korrektur (nesting 1) kippt Antworten von `check_usage` und ist eine Entscheidung für den Maintainer.
- **Mankoj:** keine. Kein Token fehlt.

### Offen (für den Maintainer)

1. **Abnahme ②:** je Ergänzung ein Browser-Test (`packages/eroj/test/nachlese-7-ergaenzungen.spec.ts`, drei Engines). In der Vitrino stehen die neuen Zeilen bei mezurilo, tabelo, menuo, avizo, dialogo und teksto. In Figma (Version vorher sichern, Plugin bauen und neu importieren, danach die Version wiederherstellen) zeigen der Schalter `label-visible` am mezurilo und der gesperrte Auslöser in `menuo` `state=disabled` die Ergänzungen.
2. **Befund F-1** (nesting der `actions`): korrigieren oder lassen.
3. **Release 0.2.0** mit der CJS-Entfernung (CHANGELOG „0.2.0 – geplant“).
