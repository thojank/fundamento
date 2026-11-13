# Spec 050 – MVP-Probelauf messen – Bericht

**Spec:** [`spec.md`](spec.md) · **Plan:** [`plan.md`](plan.md) · **Messkopf:** `de931e40` (`main` nach #163) · **Stand:** 2026-11-13 · **Daten:** [`daten/`](daten/) · **Gegenprobe:** `node specs/050-mvp-probelauf/pruefen.mjs`

Beide Läufe sind **gestört** (Last während des Laufs, bei M-1 dazu fremde Messung). Der Maintainer hat entschieden, sie nicht zu wiederholen (D-050-19, D-050-22). M-3 ist nicht gelaufen (D-050-23). Jede Zahl unten lässt sich bis zu einer Datei unter `daten/` zurückverfolgen. „Grün“ heißt: `decidiVerdon` des Messkopfs auf den gespeicherten Fakten der letzten gebauten Runde (D-050-13).

## 1. Zielkennzahl

**Grüne Screens im MVP-Probelauf: M-1 F komuna 0/4 (gestört).** Kein Screen war in einer Runde grün (`verdaEkde` überall leer). Bewertet ist Runde 3. Alle vier F-Screens scheitern nur an K8, und dort nur am Merkmal `interspacoj` (Abschnitt „Empfehlung“). Alles andere ist in Runde 3 erfüllt: K1, K5, axe hell und dunkel, Navigation, kein `check_usage`-Fehler.

## 2. Grün je Screen

Quelle: `daten/<zelle>/<F|0>/<slug>/fakto.json`, nachgerechnet mit `decidiVerdon`. K8 = Mittel über 4 Marken × hell/dunkel, `plena` wie geliefert.

| Zelle | V | Screen | Runde | K1 | K2 | K3 | K4 | K5 | K6 | K8 (Quote / `plena`) | Total | axe hell / dunkel | Navigation | `check_usage`-Fehler | `malhelpoj` | grün |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| M-1 | F | anmelden | 3 | 1 | 1 | 1 | 1 | 1 | 1 | 0,9821 / nein | 100 | ok / ok | vollständig | 0 | K8 | nein |
| M-1 | F | registrieren | 3 | 1 | 1 | 1 | 1 | 1 | 0,75 | 0,9821 / nein | 95,8 | ok / ok | vollständig | 0 | K8 | nein |
| M-1 | F | passwort-vergessen | 3 | 1 | 1 | 1 | 1 | 1 | 1 | 0,975 / nein | 100 | ok / ok | vollständig | 0 | K8 | nein |
| M-1 | F | konto | 3 | 1 | 1 | 1 | 1 | 1 | 1 | 0,9063 / nein | 100 | ok / ok | vollständig | 0 | K8 | nein |
| M-1 | 0 | anmelden | 3 | 1 | – | – | 0 | 0 | 1 | 0,1354 / nein | 44,4 | Befund / Befund | vollständig | entfällt | axe-hela, axe-malhela, K5, K8 | nein |
| M-1 | 0 | registrieren | 3 | 1 | – | – | 0 | 0 | 1 | 0,1875 / nein | 44,4 | ok / ok | vollständig | entfällt | K5, K8 | nein |
| M-1 | 0 | passwort-vergessen | 3 | 1 | – | – | 0 | 0 | 1 | 0,0834 / nein | 44,4 | ok / ok | vollständig | entfällt | K5, K8 | nein |
| M-1 | 0 | konto | 3 (aus 2 getragen, F-050-12) | 1 | – | – | 0 | 0 | 1 | 0,132 / nein | 44,4 | ok / ok | nicht vollständig | entfällt | K5, navigado, K8 | nein |
| M-2 | F | anmelden | 3 | 1 | 1 | 1 | 1 | 1 | 1 | 0,8819 / nein | 100 | ok / ok | vollständig | 0 | K8 | nein |
| M-2 | F | registrieren | 3 | 1 | 1 | 1 | 1 | 1 | 0,75 | 0,8989 / nein | 95,8 | ok / ok | vollständig | 0 | K8 | nein |
| M-2 | F | passwort-vergessen | 3 | 1 | 1 | 1 | 0,5 | 1 | 1 | 0,6193 / nein | 91,7 | ok / Befund | vollständig | 0 | axe-malhela, K8 | nein |
| M-2 | F | konto | 3 | 1 | 1 | 0,8889 | 1 | 1 | 0,75 | 0,8992 / nein | 94,4 | ok / ok | vollständig | 1 | check_usage, K8 | nein |
| M-2 | 0 | alle 4 | – | – | – | – | – | – | – | – | – | – | – | – | nicht gebaut (Tokengrenze) | nicht gebaut |

**Ergebnis:** M-1 F 0/4, M-1 0 0/4, M-2 F 0/4, M-2 0 0/4 (4 nicht gebaut). Hinweise (`warning`): `label-names-action` bei M-1 anmelden und konto, M-2 konto (zweimal). Sie halten nicht vom Grün ab.

Bilder (M-1 F, Runde 3, komuna, hell und dunkel, mit `bildigi-fragmentojn.mjs` gegen `de931e40`): `daten/bildoj/m1-F-<slug>-{hela,malhela}.png`. Für M-1 0 und M-2 gibt es keine Bilder (D-050-24; das Werkzeug rendert nur F-Fragmente).

## 3. Verbleibende Befunde je Screen

Letzte Runde, je Regel aus `restantajLauxRegulo` (`daten/<zelle>/<V>/kuro.json`) und `malhelpoj`. Anzahl = Treffer über Marke × Schema. Ursache nach der Regel der Spec (S038-42).

| Screen | Zelle | Regel | Anzahl | Beispiel | Ursache | Beleg |
|---|---|---|---|---|---|---|
| anmelden | M-1 F | K8 `interspacoj` (`k8-interspaco`) | 4 | provo, provo-kompakta: `fm-sxelo > fm-stako`, 16 px | Fundamento | F-050-16 (a), L50-1, L50-2 |
| registrieren | M-1 F | K8 `interspacoj` | 4 | wie anmelden, 16 px | Fundamento | F-050-16 (a), L50-1, L50-2 |
| registrieren | M-1 F | K6 `criterion` (zählt nicht für grün) | 1 | „Der Knopf nennt die Aktion, etwa ‚Konto anlegen‘.“ | Modell | `daten/m1/F/registrieren/fakto.json` → `taksado.mankoj` |
| passwort-vergessen | M-1 F | K8 `interspacoj` | 4 | provo, provo-kompakta: `fm-sxelo > fm-pagxo`, 16 px | Fundamento | F-050-16 (a), L50-1, L50-2 |
| konto | M-1 F | K8 `interspacoj` | 8 | komuna: `fm-pagxo` `subtitle` → `actions` 930,05 px, `actions` → `fm-atributlisto` 36 px; ekzemplo `badges` → `subtitle` 11 px | Fundamento | F-050-16 (b), (c), L50-1 |
| anmelden | M-1 0 | axe `target-size` | 8 | 2 Knoten je Marke und Schema | Modell | `daten/m1/0/anmelden/fakto.json` (Variante 0 ohne Eroj) |
| anmelden, registrieren, passwort-vergessen, konto | M-1 0 | K5 `rebuilt-ero` | 5 / 4 / 4 / 1 | `a`, `button`, `h1`, `input`, `role=alert` von Hand gebaut | Modell | Variante 0 hat keinen Zugang zu Eroj und Gvidanto (D-07); `taksado.mankoj` |
| anmelden, registrieren, passwort-vergessen, konto | M-1 0 | K8 `ersatzschrift`, `nativa`, `interspaco`, `sxablono` | je bis 8 | eigenes Markup ohne Marke (`data-ero="knopf"` u. a.) | Modell | `daten/m1/raporto.json` → `k8` (0: alle vier Merkmale < 1) |
| konto | M-1 0 | `navigado-mankanta` | 1 | kein Verweis `konto → anmelden` (Abmelden nur als Knopf) | Modell | `daten/m1/0/plano.json` (`kantoj`), `daten/m1/0/konto/fragmento.html` |
| anmelden, registrieren, konto | M-2 F | K8 `interspacoj` | je 8 | komuna `fm-sxelo > fm-navigado` 9 px (Trennlinie + `frame`-Abstand); konto `fm-pagxo` 1 023,09 px (`space-between`) | Fundamento | F-050-16 (a)–(c), L50-1, L50-2 |
| passwort-vergessen | M-2 F | K8 `interspacoj` | 8 | `fm-sxelo > fm-navigado` 9 px | Fundamento | F-050-16, L50-1 |
| anmelden, registrieren, konto | M-2 F | K8 `ersatzschrift` | je 8 | `<fm-ligilo slot="brand">Team Nord</fm-ligilo>` ohne `placement` | unklar | F-050-18 (offene Frage 1) |
| passwort-vergessen | M-2 F | axe `color-contrast` (dunkel), K8 `nativa`, K8 `ersatzschrift` | 4 / 8 / 8 | vier rohe `<a>` in `<fm-vico slot="items">` in `fm-navigado` | Fundamento | F-050-17 (kein Befund von `check_markup`, F-B3 aus Spec 046), L50-3 |
| registrieren | M-2 F | K6 `criterion` (zählt nicht) | 1 | „Der Knopf nennt die Aktion …“ | Modell | `daten/m2/F/registrieren/fakto.json` |
| konto | M-2 F | `uzo-slot-nesting` (error) | 1 | `<fm-atributlisto slot="content">` in `fm-karto` | Modell | `modelo/data/eroj/karto/uzo.json` (`content` nimmt `text`/`teksto`, `nesting: 0`; ein Datensatz ist eine `atributlisto` statt einer `karto`); Sonnet setzt die `fm-atributlisto` direkt in die `fm-pagxo`, ohne Befund |
| konto | M-2 F | K6 `criterion` (zählt nicht) | 1 | „Genau eine Überschrift der ersten Ebene.“ | Modell | `daten/m2/F/konto/fakto.json` |
| alle 4 | M-2 0 | nicht gebaut | – | `nekomencita`, `haltigo: max-tokens` | unklar | F-050-15: Messaufbau (ein Budget je Aufruf, D-050-3, R-1), weder Modell- noch Fundamento-Befund (offene Frage 2) |

**Offene Fragen (Ursache „unklar“):**

1. `fm-ligilo` mit Text im Standard-Slot und ohne `placement` erbt die Schrift der Seite. Ist das ein Modellfehler (fehlendes `placement`) oder fehlt in `fm-sxelo` oder der Marke eine Schrift für eingebetteten Linktext? Dazu misst K8 den Text aus `label="…"` (Sonnet) gar nicht, weil er im Schatten-DOM liegt (F-050-18).
2. Ein Budget je Aufruf lässt 0 leer, wenn F es aufbraucht. Ob 0 für ministral künftig einen eigenen Aufruf bekommt, ist eine Frage an den Messaufbau, nicht an Fundamento.
3. `fm-karto` nennt in `uzo.composes.with` eine `titolo` als Überschrift, `slots.heading` nimmt nur Text (F-050-19; nur in M-2 R2, nicht in der letzten Runde).

## 4. Wirkung von Spec 046

Gesucht in allen Fragmenten beider Läufe (`rondoj/<n>/<slug>.html`, F und 0, Runde 1 bis 3); Befunde je Runde über denselben Gvidanto-Pfad wie im Lauf (D-050-26). Die Fragmente der letzten Runde liegen unter `daten/<zelle>/<V>/<slug>/fragmento.html`.

| Lücke | Muster geschrieben? | bemängelt? | Urteil |
|---|---|---|---|
| L5-1 Standard-Slot | M-1 nein. M-2 F ja: `konto` R2/R3 `<fm-atributlisto slot="content">` in `fm-karto` (`daten/m2/F/konto/fragmento.html`), `anmelden` R3 `<a slot="items">` in `fm-navigado`, `passwort-vergessen` R3 `<fm-vico slot="items">` in `fm-navigado` | Kein Fehlbefund für das ausdrücklich benannte Kind (`anmelden` ohne Befund, `konto` ohne `uzo-slot-accepts`). Der verbleibende `uzo-slot-nesting` bei `konto` ist echt (Daten der `karto`). Nebenwirkung: bei `passwort-vergessen` fehlt ein Befund (F-050-17, L50-3). | **wirkt** |
| L5-2 `one-primary-per-container` | nein (M-1, M-2: nie zwei `fm-karto` oder `fm-karto` + `fm-butono emphasis="high"` im selben Behälter) | – | **nicht ausgelöst** |
| L5-3 Vorschlag von `uzo-slot-accepts` | M-2 F `konto` R2: `<fm-titolo slot="heading">` in `fm-karto`; M-1 nein | ja: „The slot heading holds a <fm-titolo>, and it accepts text: put text in the slot heading instead.“ In R3 schreibt ministral `<span slot="heading">`, der Befund ist weg. | **wirkt** |

**L5-4 (nur offline):** `get_ero` mit `name: "butono"`, `lingvo: "de"`, `fields: ["brief", "slots", "constraints"]`, Gvidanto im Prozess auf `de931e40`, Länge der Antwort ÷ 3 aufgerundet: **2 237 Zeichen ≈ 746 Tokens, kein `rest`** (Grenze 750 unverändert, gleich wie Spec 046 D-38).

## 5. Markenwechsel

**M-3 nicht gelaufen (Entscheidung D-050-23).** Die Reservierung `marke-sonnet-ekzemplo` (3,60 $) ist freigegeben. Als Beleg dient K8 je Marke aus M-1. nordstelo rendert jeden Screen in allen vier Marken × hell/dunkel (`daten/m1/raporto.json` → `k8`):

| M-1 F, Runde 3 | komuna | ekzemplo | provo | provo-kompakta |
|---|---|---|---|---|
| K8 (Mittel 4 Screens) | 0,9813 | 0,9813 | 0,9384 | 0,9447 |
| `interspacoj` | 0,925 | 0,925 | 0,7535 | 0,7786 |
| `ersatzschrift`, `nativaj`, `sxablono` | 1 | 1 | 1 | 1 |

komuna und ekzemplo sind in jedem Wert gleich. provo und provo-kompakta verlieren nur am Abstand zwischen `nav` und `main` der `fm-sxelo` (16 px, in diesen Marken keine Stufe; F-050-16 (a)). **Grenze:** Das ist K8, kein „grün“ in einer anderen Marke. Der Weg von `fm ekranoj --config` (Plan vom Modell, kein K6, keine Variante 0) wurde nicht gemessen.

## 6. Vergleich

| Messung | Modell | F grün | 0 grün | Total F / 0 | Aufwand je Screen-Runde F (Tokens ein / aus, Anfragen, Werkzeugaufrufe, Dauer) |
|---|---|---|---|---|---|
| Bezug (Spec 038, `vorher-F`) | ministral | **2/4** (Runde 1) | – | – | je Runde nicht gespeichert; gesamt 971 573 / 13 448, 42, 89; Halt an der Tokengrenze in Runde 2 |
| Lauf 4 (Spec 038, `nachher`) | ministral | 0/4 | 0/4 | R1 93,8 / 41,2 | 97 259 / 1 213, 5,4, 15,7, 69,2 s |
| **M-1** (gestört) | Sonnet 5.5 | **0/4** | 0/4 | R3 99 / 44,4 | 125 669 / 3 202, 4,8, 7,2, 27,7 s |
| **M-2** (gestört) | ministral | 0/4 | nicht gebaut | R3 95,5 / – | 102 710 / 1 231, 19,9, 14,6, 234,7 s (darin 1 910 s Wartezeit nach 429) |

Variante 0 je Screen-Runde: M-1 5 600 / 2 005 Tokens, 1,0 Anfragen, 16,8 s (11 Screen-Runden); Lauf 4 3 609 / 1 068, 1,0, 16,0 s. **F gegen 0:** M-1 F liegt im Total 54,6 Punkte über 0 (R3), wird aber wie 0 nicht grün. Quellen: `daten/<zelle>/<V>/kuro.json` (`peno`, `penoj`), `daten/<zelle>/raporto.json`; Bezug und Lauf 4 aus `specs/038-gvidanto-agentoj`.

## 7. Kosten

| Lauf | Ledger-ID | Tokens ein / aus | gebucht | Δ OpenRouter | gestört |
|---|---|---|---|---|---|
| M-1 | `probe-sonnet-komuna` | 1 569 626 / 60 470 | 3,743952 $ | 3,650128 $ | ja (D-050-19) |
| M-2 | `vergleich-ministral-komuna` | 1 232 523 / 14 776 | 0,249460 $ | – (Mistral-API) | ja (D-050-22) |
| M-3 | `marke-sonnet-ekzemplo` | – | 0 $ (Reservierung 3,60 $ freigegeben, D-050-23) | – | nicht gelaufen |
| **Summe** | | | **3,993412 $ von 8,00 $** | | |

Scheiben (`$W/kosten stand`, `daten/kostoj.tsv`): `probe-` 3,743952 von 4,00 · `vergleich-` 0,249460 von 0,25 · `marke-` 0 von 3,60 (freigegeben) · `wdh-` 0 von 0,15 (nie reserviert). Keine offene Reservierung, keine Scheibe überschritten.

**Zuordnung Ledger-ID ↔ CLI-Lauf-ID (D-050-2):**

| Ledger-ID | CLI-Lauf-ID | Zelle |
|---|---|---|
| `probe-sonnet-komuna` | `kontrolle-probe-sonnet-komuna` (mit `--kontroll-modelo openrouter/anthropic/claude-sonnet-5.5`) | M-1 |
| `vergleich-ministral-komuna` | `vergleich-ministral-komuna` (Modell aus der `.env`) | M-2 |
| `marke-sonnet-ekzemplo` | `kontrolle-marke-sonnet-ekzemplo` (nie benutzt) | M-3 |

## 8. Seitenregel `k8-interspaco` (zählt nicht)

„Mangels Mittel“ (`k8.mankoj` leer, die Modelo hat Abstandsmittel seit Spec 046): **nein** auf allen gebauten Screens (M-1 F und 0 je 4, M-2 F 4); M-2 0 nicht gebaut. Die Abweichungen von `interspacoj` zählen deshalb in K8 (Abschnitt 3).

## 9. CI

<!-- PLATZHALTER CI: wird nach dem Push in einem nur lokalen Commit gefüllt (delivery.md, „Report“) -->

| Job | Ergebnis | Vermerk |
|---|---|---|
| *(PR-Link und Jobs folgen nach dem Push)* | – | `zweitfarbe-036`, `buehne-036`, `modelo turbo-inputs`: bekannt rot, fremd |

## Empfehlung für die Folge-Spec: K8 `interspacoj`

**Was fehlt:** Nicht die Mittel der Modelo, nicht die Antwort des Gvidanto, sondern die **Bewertung K8**: Sie zählt Abstände, die eine Sxablono oder Ero selbst setzt, als Abstände der Seite. Dazu kommt ein Detail in den Eroj (`fm-sxelo`).

1. **Wie K8 rechnet.** `packages/ekranoj/src/aspekto-faktoj.ts` (`walk`) misst für **jedes** Element den Abstand zwischen aufeinanderfolgenden sichtbaren Kindern im Licht-DOM, auch bei `fm-sxelo` oder `fm-pagxo`, deren Kinder in verschiedene Teile im Schatten-DOM gehen. `packages/nordstelo/src/k8/k8.ts` (`interspacoj`) zählt den Anteil der Abstände auf einer Stufe (± 0,5 px). Die Stufen sind die gemessenen Werte der sechs Tokens aus `listArangxoj(modelo).interspacoj` (`spacing.xsmall` … `spacing.xxlarge`). `k8Plena` verlangt 1 in jeder Marke × Schema.
2. **Mittel der Modelo je Marke** (Proben in den Fakten): komuna 2, 4, 8, 16, 24, 40 · ekzemplo 2, 3, 6, 12, 20, 36 · provo 2, 4, 8, 20, 28, 48 · provo-kompakta 2, 4, 8, 12, 20, 32 px. `listArangxoj().mankoj` ist leer: es gibt Mittel (`fm-stako`, `fm-vico`, `fm-kolumno`, `fm-krado`).
3. **Gvidanto.** Die Regel `spacing-owned-by-container` (`modelo/data/reguloj.json`) sagt: „The space between sibling Eroj belongs to their container“. `fm-karto` sagt `spacing.owner: container`. Der Hinweis der Runde zu K8 schickt zu `list_arangxoj` (`packages/ekranoj/src/rondoj.ts`). Sonnet hat `list_arangxoj` nie aufgerufen, nutzt aber ein Mittel richtig: `<fm-stako gap="large">` in `daten/m1/F/anmelden/fragmento.html`. Die Antwort ist richtig, sie kann hier nur nicht helfen.
4. **Eroj und Sxablonoj.** Die Teile von `fm-sxelo` haben feste Abstände (`modelo/data/sxablonoj/sxelo/skemo.json`: `frame.gap` = `spacing.medium`). Die erzeugte Ero blendet nur `brand`, `principal` und `nav` aus. Der leere Teil `notices` bleibt stehen, also liegen zwischen `nav` und `main` zwei Abstände: 2 × 8 = 16 px. In komuna (16 = `large`) und ekzemplo (2 × 6 = 12 = `large`) ist das zufällig eine Stufe, in provo und provo-kompakta nicht. `fm-pagxo` setzt `head` mit `space-between`; der freie Raum bis `actions` (818 bis 1 055 px) zählt als Abstand.
5. **Was Sonnet schrieb.** `daten/m1/F/{anmelden,registrieren,passwort-vergessen}/fragmento.html`: `fm-sxelo` mit `fm-ligilo slot="brand"`, `fm-navigado slot="nav"` und dem Inhalt. Zwischen diesen Kindern setzt Sonnet keinen Abstand. `daten/m1/F/konto/fragmento.html`: Kinder von `fm-pagxo` in `title`, `badges`, `subtitle`, `actions` und eine `fm-atributlisto`. Über alle Marken × Schemata liegt **kein** Abstand unter `fm-navigado`, `fm-formularo`, `fm-stako`, `fm-vico`, `fm-kolumno` oder `dl` daneben (M-1 0 von 112, M-2 0 von 128). Alle Abweichungen liegen unter `fm-sxelo`, `fm-pagxo`, `fm-atributlisto` und `fm-karto` (F-050-16, Log `$S/logs/mvp-3.1-k8-abstaende.log`).

**Folgerung, kein Ergebnis dieser Messung:** Mit L50-1 wäre `interspacoj` in M-1 F für alle vier Screens und Marken 1, und K8 wäre der einzige Grund für „nicht grün“ gewesen. Mit L50-2 allein wären es anmelden, registrieren und passwort-vergessen; konto bliebe an `fm-pagxo` hängen. Eine neue Messung muss das belegen.

**Vorschlag:** L50-1 (Bewertung), L50-2 (`fm-sxelo`), L50-3 (Gvidanto) in [`luecken.json`](luecken.json).

## Gegenprobe (`pruefen.mjs`)

`node specs/050-mvp-probelauf/pruefen.mjs` liest `daten/`, rechnet „grün“ mit `decidiVerdon` aus `packages/ekranoj/dist` nach und vergleicht mit diesem Block. Kein Netz, kein Modell, kein Browser.

```pruefen
m1 F 0/4 -
m1 0 0/4 -
m2 F 0/4 -
m2 0 0/4 -
```

## Was der Maintainer als Nächstes tut

1. PR prüfen (nur `specs/050-mvp-probelauf/**`) und die CI je Job im Platzhalter von Abschnitt 9 nachtragen lassen (Orchestrator, nur lokaler Commit).
2. Über L50-1 bis L50-3 entscheiden ([`luecken.json`](luecken.json)): zuerst L50-1 (Bewertung K8), weil es die Zielkennzahl allein bestimmt hat.
3. Danach eine ungestörte Messung von M-1 planen (Sperre frei, keine parallele Session), damit die Zielkennzahl ohne Vermerk steht.
