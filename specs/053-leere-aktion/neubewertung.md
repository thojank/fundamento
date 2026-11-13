# Spec 053 – Neubewertung von M-1 mit geschärftem `label-required` – Bericht

Stand 2026-11-13, Ticket LA-2.2. Branch `261113-leere-aktion-ist-rot-la-32abef`, gemessen auf `433b40b4` mit den noch nicht committeten Änderungen von LA-1.1 unter `packages/` (darum steht in [`daten/neubewertung/last.txt`](daten/neubewertung/last.txt) `433b40b4-dirty(packages)`). Quellen: [`spec.md`](spec.md), [`technische-spec.md`](technische-spec.md), [`tasks.md`](tasks.md), die gespeicherten M-1-Fragmente von Spec 050 in [`../050-mvp-probelauf/daten/m1/`](../050-mvp-probelauf/daten/m1/) und die Neubewertung von Spec 052 in [`../052-k8-interspacoj/daten/neubewertung/m1/`](../052-k8-interspacoj/daten/neubewertung/m1/). Es lief **kein Modell**, **kein Browser** und es gab **keinen Netzzugriff**. An `specs/050-*` und `specs/052-*` wurde nichts geändert, sie werden nur gelesen.

**Kurz:** Mit der geschärften Prüfung sind **0 von 4** F-Screens grün (in 052: 4 von 4). Der Grund ist auf allen vier Screens allein `check_usage`: Jeder hat mindestens einen neuen Fehler `label-required`. Variante 0 bleibt bei **0 von 4**, mit denselben Gründen wie in 052. Außer den neuen `label-required`-Fehlern, K3, `total` und der Lücke `regulo/label-required` ist jeder Wert byte-gleich zu 052.

## 1. Wie gemessen wurde

„052“ meint die Werte in `specs/052-k8-interspacoj/daten/neubewertung/m1/` (gerendert auf dem Stand von Spec 052). „053“ meint die Werte, die dieses Skript daraus und aus dem unveränderten Markup von M-1 mit dem Build dieses Branches berechnet.

| Schritt | Befehl | Ergebnis |
|---|---|---|
| Build | `pnpm build` | Exit 0, 10 von 10 Aufgaben (aus dem Turbo-Cache, der Stand von LA-1.1 war schon gebaut; `packages/modelo/dist/eroj/usage.js` enthält die neue Meldung) |
| Selbstprüfung (c) | `node specs/053-leere-aktion/neubewertung.mjs --ohne-schaerfung` | Exit 0, `ohne-schaerfung: 8 Screens, grün F 4/4 (anmelden,konto,passwort-vergessen,registrieren), 0 0/4 (-); gleich 052; nichts geschrieben` |
| AC-16, AC-17 | `node specs/053-leere-aktion/neubewertung.mjs` | Exit 0, `selbstpruefung: (a) ok, (b) ok, (c) … gleich 052`, letzte Zeile `neubewertung: 8 Screens, grün F 0/4 (-), 0 0/4 (-)` |
| `--roh` (Q-8) | `node specs/053-leere-aktion/neubewertung.mjs --roh <M-1-Laufordner> --out /tmp/s053-2` | Exit 0, Hinweis `--roh … ignored (Spec 053 reads no raw facts, Q-8)`, sonst gleiche Ausgabe |
| Determinismus | ein weiterer Lauf mit `--out /tmp/s053-3`, dann `diff -r specs/053-leere-aktion/daten/neubewertung /tmp/s053-2` und `… /tmp/s053-3` | alle 8 `fakto.json` **und** `last.txt` byte-gleich (`last.txt` enthält keine Last und keine Zeit) |
| AC-18 | `node specs/050-mvp-probelauf/pruefen.mjs --daten specs/053-leere-aktion/daten/neubewertung --ohne-bericht` | Exit 0, `grün: m1 F 0/4 - · m1 0 0/4 -`, „Abweichungen 0, Struktur 0“ |
| AC-18 | `node specs/050-mvp-probelauf/pruefen.mjs --daten specs/053-leere-aktion/daten/neubewertung --bericht specs/053-leere-aktion/neubewertung.md` | Exit 0, „bericht.md stimmt“ |
| Tabellen | `node specs/053-leere-aktion/neubewertung.mjs --tabellen` | die Tabellen in Abschnitt 3 |
| Gegenproben | `neubewertung.mjs --basis <präparierte Kopie>` | je Exit 1, nichts geschrieben (Abschnitt 5) |

**Der Weg.** Je Screen (M-1, Varianten F und 0, Slugs aus den 052-Daten) liest das Skript `fragmento.html` aus Spec 050 und `fakto.json` aus Spec 052 und rechnet zwei Dinge neu:

1. **`malobservoj`** auf dem Weg von M-1 (D-050-14): nordstelos `connectGvidanto()` startet den Gvidanto im Prozess (derselbe MCP-Server wie `fundamento-mcp`, In-Memory-Transport), ekranoj wählt mit `uzKontroliloDe(bridge, await bridge.list())` den Prüfweg `check_markup` und ruft ihn mit dem unveränderten Fragment und `fakto.lingvo`. Das ist auch der Weg von `packages/nordstelo/src/ac8.test.ts`.
2. **K3** (mit `total` und den Lücken `mankoj`) mit nordstelos reinem Bewerter `taksiloPorMezuro` der Aufgabe `anmelden-und-konto` auf den gespeicherten 052-Fakten. K3 zählt die `error`-Funde der Reguloj über dieselbe Modelo; ein Renderer ist dafür nicht nötig.

`fakto` (Renders, axe, K8-Fakten), `kompleta`, `zusatz`, `runde` und `herkunft` kommen aus 052; `herkunft.neubewertung` heißt jetzt „Spec 053: check_markup auf unverändertem fragmento.html, ohne Modell, ohne Rendering“. Grün heißt wie in 052 `decidiVerdon(enigo).verda && zusatz.length === 0`; `verdaEkde` ist bei Grün `runde`, sonst `null`. Geschrieben wird mit nordstelos `stabilaJson` nach `daten/neubewertung/m1/{F,0}/<slug>/fakto.json` (Form `DatenFakto`, wie `pruefen.mjs` sie liest).

**Ohne Modell (AC-19).** Das Skript importiert statisch nur `node:child_process`, `node:fs`, `node:path` und `node:url`. Zur Laufzeit lädt es ausschließlich gebaute Module aus `packages/modelo/dist`, `packages/ekranoj/dist` und `packages/nordstelo/dist` (über `--repo`). Es ruft keinen Agenten, keinen Anbieter und kein Netz; der Gvidanto läuft im Prozess. `git` wird nur lokal für die Commit-Zeile in `last.txt` gelesen.

## 2. Grüne Screens vorher und nachher

```pruefen
m1 F 0/4 -
m1 0 0/4 -
```

| Variante | 052 | 053 | Grund in 053 |
|---|---|---|---|
| F | 4/4 (anmelden, konto, passwort-vergessen, registrieren) | **0/4** | überall nur `check_usage` |
| 0 | 0/4 | 0/4 | wie 052 (anmelden `axe-hela, axe-malhela, K5, K8`; konto `K5, navigado, K8`; passwort-vergessen `K5, K8`; registrieren `K5, K8`) |

Die Grün-Regel für Variante 0 liest `check_usage` nicht (`ekranoj/src/verda.ts`), und die 0-Fragmente enthalten kein `fm-*`-Element: `malobservoj` bleibt leer, K3 bleibt `null`.

## 3. Je Screen

Ein Eintrag in `malobservoj` ist „Regel, Schwere, Pfad, Ort“. `malhelpoj` sind die Gründe von `decidiVerdon` (vorne `zusatz`, hier überall leer).

#### Variante F

| Screen | `malobservoj` 052 | `malobservoj` 053 | K3 052 → 053 | total 052 → 053 | grün 052 → 053 | `malhelpoj` 052 | `malhelpoj` 053 |
|---|---|---|---|---|---|---|---|
| anmelden | `label-names-action` warning `instances#/7` fm-butono | `label-required` error `instances#/0` fm-ligilo<br>`label-names-action` warning `instances#/7` fm-butono<br>`label-required` error `instances#/7` fm-butono | 1 → 0,75 | 100 → 96,9 | **ja** → nein | – | `check_usage` |
| konto | `label-names-action` warning `instances#/5` fm-butono „Abmelden“ | `label-required` error `instances#/0` fm-ligilo<br>`label-names-action` warning `instances#/5` fm-butono „Abmelden“ | 1 → 0,8571 | 100 → 98,2 | **ja** → nein | – | `check_usage` |
| passwort-vergessen | – | `label-required` error `instances#/0` fm-ligilo | 1 → 0,8333 | 100 → 97,9 | **ja** → nein | – | `check_usage` |
| registrieren | – | `label-required` error `instances#/0` fm-ligilo<br>`label-required` error `instances#/8` fm-butono | 1 → 0,7778 | 95,8 → 93,1 | **ja** → nein | – | `check_usage` |

#### Variante 0

| Screen | `malobservoj` 052 | `malobservoj` 053 | K3 052 → 053 | total 052 → 053 | grün 052 → 053 | `malhelpoj` 052 | `malhelpoj` 053 |
|---|---|---|---|---|---|---|---|
| anmelden | – | – | – → – | 44,4 → 44,4 | nein → nein | `axe-hela`, `axe-malhela`, `K5`, `K8` | `axe-hela`, `axe-malhela`, `K5`, `K8` |
| konto | – | – | – → – | 44,4 → 44,4 | nein → nein | `K5`, `navigado`, `K8` | `K5`, `navigado`, `K8` |
| passwort-vergessen | – | – | – → – | 44,4 → 44,4 | nein → nein | `K5`, `K8` | `K5`, `K8` |
| registrieren | – | – | – → – | 44,4 → 44,4 | nein → nein | `K5`, `K8` | `K5`, `K8` |

**Neue Befunde im Wortlaut** (alle `rule: "label-required"`, `severity: "error"`, Regulo `reg_01M2XMV80DG7JCJDTZGE66MGHY`):

- F anmelden `instances#/0` (fm-ligilo): Instance 0 of ligilo has only the label prop "Team Nord", which is never shown, and no icon.
- F anmelden `instances#/7` (fm-butono): Instance 7 of butono has only the label prop "Anmelden", which is never shown, and no icon.
- F konto `instances#/0` (fm-ligilo): Instance 0 of ligilo has only the label prop "Team Nord", which is never shown, and no icon.
- F passwort-vergessen `instances#/0` (fm-ligilo): Instance 0 of ligilo has only the label prop "Team Nord", which is never shown, and no icon.
- F registrieren `instances#/0` (fm-ligilo): Instance 0 of ligilo has only the label prop "Team Nord", which is never shown, and no icon.
- F registrieren `instances#/8` (fm-butono): Instance 8 of butono has only the label prop "Konto speichern", which is never shown, and no icon.

Der Vorschlag (`suggestion`) lautet je nach Ero `Write the label as the text of the element: <fm-butono …>Anmelden</fm-butono>. The label prop names an icon-only button next to its icon.` bzw. `… <fm-ligilo …>Team Nord</fm-ligilo>. The label prop names an icon-only link next to its icon.`

Das ist genau die Erwartung aus AC-8: anmelden Butono und Ligilo; konto Ligilo; passwort-vergessen Ligilo; registrieren Ligilo und Butono. Die sichtbar beschrifteten Knöpfe („Abmelden“ in konto, „Link senden“ in passwort-vergessen) haben keinen Fund `label-required`. Die Hinweise `label-names-action` (anmelden „Anmelden“, konto „Abmelden“) sind byte-gleich zu 052, auch ihre Schwere `warning`. Das leere „Konto speichern“ in registrieren, das `label-names-action` nicht meldet (Ziel-Verb „speichern“), ist jetzt ein Fehler.

**K3 und `total`.** K3 sinkt, weil `label-required` jetzt als Regulo-Fehler zählt; `mankoj` erhält in allen vier F-Screens den Eintrag `{ kind: "regulo", key: "label-required" }` (bei registrieren vor der bestehenden Kriterien-Lücke). K3 gehört nicht zur Grün-Regel; rot werden die Screens allein über `check_usage`. K1, K2, K4, K5, K6 und `taksado.k8` (mit `plena`) sind in allen 8 Screens byte-gleich zu 052.

## 4. Selbstprüfungen

Alle drei laufen in jedem Lauf **vor** dem Schreiben. Schlägt eine fehl, endet das Skript mit Exit 1 und schreibt nichts.

| Prüfung | Inhalt | Ergebnis auf den echten Daten |
|---|---|---|
| (a) | je Screen: `stabilaJson` der neu berechneten `taksado` ohne K3, `total` und ohne Lücken `regulo/label-required` gleich der 052-`taksado` (ebenso bereinigt); 052 hat diese Lücke nirgends | 8 von 8 gleich |
| (b) | jeder 052-Fund steht byte-gleich (`stabilaJson`) in den neuen `malobservoj`; alles Hinzugekommene hat `rule: "label-required"` und `severity: "error"` | 8 von 8: kein Fund verschwunden oder verändert; 6 neue Funde, alle `label-required`/`error` |
| (c) | dieselbe Pipeline mit den gespeicherten 052-`malobservoj` statt der neuen ergibt je Screen das Grün von 052 | F 4/4, 0 0/4, je Screen gleich 052 |

(c) zeigt, dass die Pipeline 052 genau nachbildet und dass der Unterschied 4/4 → 0/4 allein aus den neuen `malobservoj` kommt (K3 ist dabei schon neu, die Grün-Regel liest K3 nicht).

**Abweichung vom Wortlaut der Implementierungs-Spec (2.6 a):** Dort steht, außer K3 und `total` sei alles byte-gleich, „K1, K2, K4-K6, `k8`, `mankoj`“. `mankoj` ist die Lückenliste des Bewerters und enthält die neue Regulo-Lücke `label-required`; das folgt zwingend aus derselben Änderung wie K3 (LA-2.1 passt aus demselben Grund `gaps` in `anmeldung-F-1/rezulto.json` an). Prüfung (a) lässt deshalb genau diese eine Lücke zu und verlangt, dass 052 sie nirgends hatte; jede andere Lücke muss gleich sein.

## 5. Gegenproben der Selbstprüfungen

Je eine präparierte Kopie der 052-Daten in `/tmp` (per Hand verändert, über `--basis` gelesen, `--out` in einen leeren Ordner):

```text
$ node specs/053-leere-aktion/neubewertung.mjs --basis /tmp/s053-selbst-a --out /tmp/s053-leer-a   # 0/konto: K4 0 → 1
SELBSTPRUEFUNG (a) 0/konto: taksado differs from 052 beyond K3, total and regulo/label-required
neubewertung: self-check failed (1), nothing written                                  (Exit 1, Ordner nicht angelegt)

$ node specs/053-leere-aktion/neubewertung.mjs --basis /tmp/s053-selbst-b --out /tmp/s053-leer-b   # F/anmelden: label-names-action warning → info
SELBSTPRUEFUNG (b) F/anmelden: 052 finding label-names-action instances#/7 disappeared or changed
SELBSTPRUEFUNG (b) F/anmelden: added finding label-names-action/warning instances#/7
neubewertung: self-check failed (2), nothing written                                  (Exit 1, Ordner nicht angelegt)

$ node specs/053-leere-aktion/neubewertung.mjs --basis /tmp/s053-selbst-c --out /tmp/s053-leer-c   # F/konto: gespeichert.verda true → false
SELBSTPRUEFUNG (c) F/konto: without the tightening green true, 052 stored false
neubewertung: self-check failed (1), nothing written                                  (Exit 1, Ordner nicht angelegt)

$ node specs/053-leere-aktion/neubewertung.mjs --basis /tmp/s053-selbst-c --ohne-schaerfung
SELBSTPRUEFUNG (c) F/konto: without the tightening green true, 052 stored false
ohne-schaerfung: 8 Screens, grün F 4/4 (anmelden,konto,passwort-vergessen,registrieren), 0 0/4 (-); ABWEICHUNG von 052; nichts geschrieben   (Exit 1)
```

Ein unbekanntes Argument oder ein fehlender Build (`--repo /tmp`) endet mit Exit 2.

## 6. Angepasste fremde Erwartungen

Die Liste aller Tests und Fixtures, deren erwartete Bewertung die Schärfung ändert (AC-20), steht in [`tasks.md` › „Angepasste fremde Erwartungen (AC-20)“](tasks.md#angepasste-fremde-erwartungen-ac-20). Diese Neubewertung ändert keine davon; sie liest nur.

M-2 (ministral) wird nicht neu bewertet (Non-Goal von LA-2.2).

## 7. Kandidaten für eine Folge-Spec

**(1) Weitere Eroj mit einer nicht angezeigten `label`-Prop.** Geprüft gegen die Skemoj in `packages/modelo/data/eroj/*/skemo.json`: Nur butono und ligilo tragen jetzt `"shown": false`. Diese zehn Eroj haben eine `label`-Prop ohne `shown`, deren Beschreibung sagt, dass sie nur gehört, nicht gesehen wird. `label-required` gilt für sie nicht; der Gvidanto sagt dem Agenten dort nicht `hidden: true`.

| Ero | `required` | Beschreibung der `label`-Prop (Skemo, gekürzt) |
|---|---|---|
| menuo | – | Name des Menüs und seines Auslösers (ein Knopf mit dem Icon `more`), gehört |
| ikono | – | Name des Icons, wo es Bedeutung trägt; ohne ihn dekorativ |
| lokredaktilo | ja | Name des Bearbeiten-Knopfes und des Feldes, gehört |
| langetaro | ja | Name der Tab-Liste, „never shown“ |
| sxvebilo | ja | Name der Ebene, „never shown — a visible title is the heading slot“ |
| navigado | ja | Name der Landmarke (Hauptnavigation) |
| spuro | – | Name der Landmarke (Pfad), „heard, never seen“ |
| pagxigilo | – | Name der Landmarke (Seitenblättern), „heard, never seen“ |
| atributlisto | – | zugänglicher Name der Liste, wenn die Seite mehrere hat |
| templinio | – | zugänglicher Name der Liste, wenn die Seite mehrere Zeitleisten hat |

Zu klären ist je Ero, ob ein Agent dort `label` für sichtbaren Text halten kann (z. B. menuo, sxvebilo) und ob `shown: false` im Skemo reicht, ohne die Regulo zu erweitern.

**(2) Icon im Standard-Slot statt in `icon-start` (Q-2).** Dieses Markup setzt das Icon ohne `slot`-Attribut in den Butono:

- `packages/eroj/test/konsileto.spec.ts:30` und `packages/eroj/test/alirebleco.check.ts:1450`: `<fm-butono … label="Suchen"><fm-ikono name="search"></fm-ikono></fm-butono>`
- `packages/projekcioj/src/celoj/vitrino/datumoj.ts:1341` (Vitrino-Tabelle „auf einer Icon-Schaltfläche“)
- `packages/projekcioj/src/celoj/web-component/element-template.ts:903` und `:1095` (Auslöser von `fm-menuo`: `<fm-butono part="trigger" emphasis="low"><fm-ikono name="more"></fm-ikono></fm-butono>`)

Die Ableitung zählt dieses Kind nicht als gefüllten Icon-Slot. Nachgeprüft mit `check_markup` (Gvidanto im Prozess, dieser Build): `<fm-butono label="Suchen"><fm-ikono name="search"></fm-ikono></fm-butono>` ergibt jetzt `label-required` (error) und `label-names-action` (warning). Keine dieser Stellen läuft durch `check_markup`/`check_usage`, darum ist heute kein Test rot. Richtig wäre `slot="icon-start"`, aber siehe (3).

**(3) Der neue Vorschlagstext stößt auf `uzo-slot-nesting` (Befund aus LA-1.1).** Die Meldung empfiehlt für einen Icon-Knopf „label prop … next to its icon“, also `<fm-butono label="…"><fm-ikono slot="icon-start" …></fm-ikono></fm-butono>`. Genau dieses Markup ergibt schon auf `main` den Fehler `uzo-slot-nesting`, weil die Slots `icon-start`/`icon-end` von butono und ligilo `nesting: 0` haben (`packages/modelo/data/eroj/butono/uzo.json:192-209`, `ligilo/uzo.json:128-143`). Nachgeprüft mit `check_markup` auf diesem Build:

| Markup | Befunde |
|---|---|
| `<fm-butono label="Schließen"><fm-ikono slot="icon-start" name="close"></fm-ikono></fm-butono>` | `uzo-slot-nesting` error (kein `label-required`) |
| `<fm-ligilo to="a.html" label="Start"><fm-ikono slot="icon-start" name="home"></fm-ikono></fm-ligilo>` | `uzo-slot-nesting` error (kein `label-required`) |

Ein Agent, der dem Vorschlag folgt, tauscht also einen Fehler gegen einen anderen. Deshalb trägt die korrigierte approved-Jugxo in LA-1.1 `"slots": { "icon-start": ["icon"] }` statt `[{ "ero": "ikono" }]`. Zu entscheiden ist in einer Folge-Spec, ob `ikono` in `icon-start`/`icon-end` mit `nesting` ≥ 1 erlaubt wird oder ob der Vorschlagstext ein anderes Markup nennt. Für M-1 ist das ohne Wirkung: Kein M-1-Screen hat einen Icon-Knopf.

**(4) Für das Icon-only-Beispiel gibt es keine Markup-Form, die `check_markup` ohne Fehler besteht (Befund aus LA-2.1).** Die korrigierte approved-Jugxo trägt `"icon-start": ["icon"]`. Diese Angabe kann nur ein direkter `check_usage`-Aufrufer machen; `check_markup` liest kein Markup als `"icon"` zurück. Nachgeprüft mit `checkMarkup` auf diesem Build:

| Markup | abgeleiteter Slot | Befunde |
|---|---|---|
| `<fm-butono label="Schließen"><fm-ikono slot="icon-start" name="close"></fm-ikono></fm-butono>` | `[{ "ero": "ikono" }]` | `uzo-slot-nesting` error, siehe (3) |
| `<fm-butono label="Schließen"><svg slot="icon-start" aria-hidden="true"></svg></fm-butono>` | `["text"]` | `uzo-slot-accepts` error |

`label-required` meldet in beiden Fällen nichts; der Icon-Knopf ist im Markup trotzdem rot. Die Renderer von Make Kit und Vitrino schreiben das Beispiel als `<fm-ikono slot="icon-start">` (LA-2.1). Eine Folge-Spec sollte (3) und (4) zusammen lösen.

**(5) Text in `<span slot="label">` zählt für direkte Aufrufer nicht (Befund aus LA-2.1).** Wer Instanzen selbst an `check_usage` oder nordstelos `score()` gibt und den Text des ausdrücklich benannten Standard-Slots nur als `texts.label` übergibt (ohne ihn nach `label` zu übernehmen), bekommt `label-required`, obwohl der Text sichtbar ist: `{ ero: "ligilo", props: { to: "a.html" }, texts: { label: "Details" } }` ergibt den Fund „neither“. Für den butono war das schon vor Spec 053 so, jetzt gilt es auch für den ligilo (Fixture `nordstelo/test/fixtures/ac8/link-ero.json`, siehe `tasks.md`). `check_markup` übernimmt den Text (`<fm-butono><span slot="label">Speichern</span></fm-butono>` ergibt keinen Fund), gerenderte Fakten ebenso. Zu klären ist, ob `label-required` `texts.label` mitzählt oder ob die Ableitung für synthetische Fakten den Text übernimmt.

## 8. Was der Maintainer als Nächstes tut

1. Diesen Bericht lesen, besonders Abschnitt 3 (sechs neue Fehler, F 4/4 → 0/4) und Abschnitt 4 (Abweichung bei `mankoj`).
2. Entscheiden, ob die fünf Punkte aus Abschnitt 7 eine Folge-Spec werden; Punkte 3 und 4 betreffen den Text, den Agenten nach dieser Spec sehen.
3. Optional zum Nachrechnen ohne Modell, nach `pnpm build`:
   `node specs/053-leere-aktion/neubewertung.mjs --out /tmp/s053-nachrechnen && diff -r specs/053-leere-aktion/daten/neubewertung /tmp/s053-nachrechnen` und
   `node specs/050-mvp-probelauf/pruefen.mjs --daten specs/053-leere-aktion/daten/neubewertung --bericht specs/053-leere-aktion/neubewertung.md`.
   Nach dem Commit der Paket-Änderungen nennt `last.txt` einen anderen Commit; die `fakto.json` bleiben gleich.
