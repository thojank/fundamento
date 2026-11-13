# Spec 052 – Neubewertung von M-1 ohne Modell – Bericht

Stand 2026-11-13, Ticket K8I-005. Branch `261113-k8-interspacoj-abstnde--c719b4`, gemessen auf `fe6b80dc` (Fix A `71db92e1`, Fix B `961455e2`/`e6fee974`/`929fa854`, Härtung K8I-004b `fe6b80dc`). Quellen: [`spec.md`](spec.md), [`technische-spec.md`](technische-spec.md), [`plan.md`](plan.md), [`tasks.md`](tasks.md), die gespeicherten M-1-Daten von Spec 050 in [`../050-mvp-probelauf/daten/m1/`](../050-mvp-probelauf/daten/m1/). Es lief **kein Modell**, es gab **keinen Netzzugriff**, und an `specs/050-*`, am Spec-050-Werkzeug außerhalb des Repos, an `fm-atributlisto`, an Paket-Quellen, Schwellen, Toleranzen und Zeitlimits wurde nichts geändert.

**Kurz:** Die Kontrolle bestätigt, dass dieser Branch die gespeicherten M-1-Fakten genau so bewertet wie M-1 (K8 byte-gleich, Urteil gleich, F 0/4 und 0 0/4). Neu gerendert wären **4 von 4** F-Screens grün, nicht 3 von 4 wie in der Produkt-Spec vorhergesagt. Der Unterschied ist `konto`: Rest C tritt mit der neuen Messung nicht mehr auf (Abschnitt 5). Variante 0 ändert sich nicht, auch nicht um ein Byte in K8.

## 1. Wie gemessen wurde

Ein Wort vorweg: „gespeichert“ meint die Werte, die M-1 (Spec 050, Lauf `20261113-0243`, Commit `de931e40`) in `specs/050-mvp-probelauf/daten/m1/` abgelegt hat. „Kontrolle“ meint dieselben Fakten, mit dem Code dieses Branches neu bewertet. „Gerendert“ meint: Das Markup von M-1 wird mit dem Build dieses Branches neu im Browser gerendert, neu gemessen und neu bewertet.

| Schritt | Befehl | Ergebnis |
|---|---|---|
| Build | `pnpm build` | 10 von 10 Aufgaben, alle aus dem Turbo-Cache |
| AC-N1 (a) | `node specs/050-mvp-probelauf/pruefen.mjs` | Exit 0, `grün: m1 F 0/4 - · m1 0 0/4 - · m2 F 0/4 - · m2 0 0/4 -`, „Abweichungen 0, Struktur 0, bericht.md stimmt“ |
| AC-N1 (b) | `node specs/052-k8-interspacoj/neubewertung.mjs --roh <M-1-Laufordner> --nur-kontrolle` | Exit 0, „kontrolle: 8 Screens, Abweichungen 0“ |
| AC-N2 | `node specs/052-k8-interspacoj/neubewertung.mjs --roh <M-1-Laufordner>` | Exit 0, „8 Screens, grün F 4/4 (anmelden,konto,passwort-vergessen,registrieren), 0 0/4; verteilita 8“ |
| Gegenprobe | `node specs/050-mvp-probelauf/pruefen.mjs --daten specs/052-k8-interspacoj/daten/neubewertung --ohne-bericht` | Exit 0, `grün: m1 F 4/4 anmelden,konto,passwort-vergessen,registrieren · m1 0 0/4 -`, „Abweichungen 0, Struktur 0“ |
| Determinismus | zwei weitere Läufe mit `--out /tmp/s052-neubewertung-2` bzw. `-3`, dann `diff -r` | alle 8 `fakto.json` und `kontrolle.json` byte-gleich; nur `last.txt` (Last) unterscheidet sich |
| Selbstprüfung | `neubewertung.mjs --selbstpruefung <ordner>` | auf den echten Daten Exit 0; auf zwei präparierten Kopien Exit 5 (Abschnitt 7) |

Der M-1-Laufordner ist `/Users/thorstenjankowski/n8n-compose/20260918_fundamento-ds/.fundamento/spec050/m1/20261113-0243` (nur gelesen, Pfad als Argument, im Code steht er nicht). Je Screen liest das Skript die Datei `<Laufordner>/<herkunft.rondo>.fakto.json`, also Runde 3 aus `herkunft.rondo` der gespeicherten Daten.

**Der Weg der M-1-Messung.** Das Skript rendert jede `fragmento.html` so, wie die Messung „ganzer Ablauf“ es in M-1 tat: ekranoj baut das Dokument mit `simplaDokumento` (die Messung gibt ekranoj kein `eligo.dokumento`, `packages/nordstelo/src/ablauf/kuro.ts` › `eligoDe`), nordstelos `createRenderer` rendert es mit der CSS aller vier Marken der cxiuj-Config und den gebauten Eroj, `bildigiloDeRenderer` behält die Renders mit Kontrast „default“ (4 Marken × hell/dunkel = 8), die K8-Fakten kommen aus dem Browser-Teil `aspektoFaktojEnPagxo` (textgleicher Zwilling in ekranoj), bewertet wird mit `taksiloPorMezuro` und den Kriterien der Aufgabe `anmelden-und-konto`. `malobservoj`, `kompleta` und `zusatz` stammen aus den gespeicherten Daten, denn das Markup ist unverändert. Grün heißt `decidiVerdon(enigo).verda && zusatz.length === 0`.

Abweichung vom Wortlaut des Tickets: Das Ticket nennt `ekranaDokumento`. M-1 hat aber `simplaDokumento` benutzt. `ekranaDokumento` setzt einen Rücklink (`<p data-fm-kadro>`) vor das Fragment und hätte damit ein zusätzliches Element und ein zusätzliches Geschwisterpaar erzeugt. Der Beleg, dass der Weg stimmt: In allen 8 Screens sind `bytes`, `elements`, `aria`, die axe-Befunde je Render, K1 bis K6, `total` und `mankoj` des neu gerenderten Stands **gleich** den gespeicherten M-1-Werten. Festgehalten als D-052-14 in `plan.md`.

**Stabilität.** Das Skript bricht ab (Exit 3), statt zu werten, wenn die Konsole eines Screens nicht leer ist, eine Markenschrift nicht geladen ist (`tiparoj` mit `sxargita: false`), nicht genau 8 Renders mit K8-Fakten vorliegen oder das Rendern fehlschlägt. Es wertet nicht, wenn die Last (1 min) bei ≥ 10 liegt (Exit 4). Keiner dieser Fälle trat ein.

**Last.** Die folgende Tabelle zeigt die Last (1, 5, 15 min) vor und nach jedem Lauf, bei 10 Kernen. Kein anderer Browser-Lauf lief gleichzeitig.

| Lauf | Last vor | Last nach |
|---|---|---|
| 1 (Daten im Repo, `daten/neubewertung/last.txt`) | 5,90 6,14 7,17 | 5,99 6,12 7,11 |
| 2 (`/tmp/s052-neubewertung-2`) | 4,40 5,50 6,77 | 5,38 5,56 6,72 |
| 3 (`/tmp/s052-neubewertung-3`, nach Biome-Formatierung des Skripts) | 4,67 5,38 6,53 | 5,23 5,44 6,49 |

## 2. AC-N1: Kontrolle

**(a)** `pruefen.mjs` von Spec 050 rechnet „grün“ aus den gespeicherten `fakto.json` mit dem gebauten `decidiVerdon` dieses Branches nach: Exit 0, `m1 F 0/4 -` und `m1 0 0/4 -` unverändert, keine Abweichung zu `bericht.md` von Spec 050.

**(b)** `k8()` dieses Branches auf den Roh-Fakten von M-1 (mit `renders[].k8`) ergibt für alle 8 Screens byte-gleich (`stabilaJson`) das gespeicherte `taksado.k8` ohne `plena`. Das Urteil ist in allen 8 Screens gleich (nicht grün). Die Tabelle nennt den SHA-256 von `stabilaJson(k8)`, der für Kontrolle und gespeichert gleich ist; die vollständigen Werte stehen in [`daten/neubewertung/kontrolle.json`](daten/neubewertung/kontrolle.json).

| Variante | Screen | K8 byte-gleich | SHA-256 (Anfang) | grün Kontrolle / gespeichert |
|---|---|---|---|---|
| F | anmelden | ja | `711574a31847` | nein / nein |
| F | konto | ja | `6531d56562e3` | nein / nein |
| F | passwort-vergessen | ja | `47e7f0678d7a` | nein / nein |
| F | registrieren | ja | `711574a31847` | nein / nein |
| 0 | anmelden | ja | `0674e32d4abb` | nein / nein |
| 0 | konto | ja | `5c308fb63119` | nein / nein |
| 0 | passwort-vergessen | ja | `92e6812de392` | nein / nein |
| 0 | registrieren | ja | `b8218a626d55` | nein / nein |

Damit lockert der Branch die Bewertung gespeicherter Fakten nicht: Fakten ohne `verteilita` ergeben dasselbe K8 wie vorher. Die Wirkung von A und B zeigt sich nur beim neuen Rendern.

## 3. `interspacoj` und `kvoto` je Screen, Marke und Schema

Jede Zelle nennt drei Werte: gespeichert (M-1) · Kontrolle (AC-N1 b) · gerendert (AC-N2). `kvoto` ist der Mittelwert der vier K8-Merkmale dieser Kombination. In Variante F ist jedes andere Merkmal (`ersatzschrift`, `nativaj`, `sxablono`) schon in M-1 überall 1; der Unterschied kommt allein aus `interspacoj`.

#### Variante F

| Screen | Marke | Schema | interspacoj gesp. · Kontr. · gerend. | kvoto gesp. · Kontr. · gerend. |
|---|---|---|---|---|
| anmelden | komuna | hell | 1 · 1 · 1 | 1 · 1 · 1 |
| anmelden | komuna | dunkel | 1 · 1 · 1 | 1 · 1 · 1 |
| anmelden | ekzemplo | hell | 1 · 1 · 1 | 1 · 1 · 1 |
| anmelden | ekzemplo | dunkel | 1 · 1 · 1 | 1 · 1 · 1 |
| anmelden | provo | hell | 0,8571 · 0,8571 · 1 | 0,9643 · 0,9643 · 1 |
| anmelden | provo | dunkel | 0,8571 · 0,8571 · 1 | 0,9643 · 0,9643 · 1 |
| anmelden | provo-kompakta | hell | 0,8571 · 0,8571 · 1 | 0,9643 · 0,9643 · 1 |
| anmelden | provo-kompakta | dunkel | 0,8571 · 0,8571 · 1 | 0,9643 · 0,9643 · 1 |
| konto | komuna | hell | 0,7 · 0,7 · 1 | 0,925 · 0,925 · 1 |
| konto | komuna | dunkel | 0,7 · 0,7 · 1 | 0,925 · 0,925 · 1 |
| konto | ekzemplo | hell | 0,7 · 0,7 · 1 | 0,925 · 0,925 · 1 |
| konto | ekzemplo | dunkel | 0,7 · 0,7 · 1 | 0,925 · 0,925 · 1 |
| konto | provo | hell | 0,5 · 0,5 · 1 | 0,875 · 0,875 · 1 |
| konto | provo | dunkel | 0,5 · 0,5 · 1 | 0,875 · 0,875 · 1 |
| konto | provo-kompakta | hell | 0,6 · 0,6 · 1 | 0,9 · 0,9 · 1 |
| konto | provo-kompakta | dunkel | 0,6 · 0,6 · 1 | 0,9 · 0,9 · 1 |
| passwort-vergessen | komuna | hell | 1 · 1 · 1 | 1 · 1 · 1 |
| passwort-vergessen | komuna | dunkel | 1 · 1 · 1 | 1 · 1 · 1 |
| passwort-vergessen | ekzemplo | hell | 1 · 1 · 1 | 1 · 1 · 1 |
| passwort-vergessen | ekzemplo | dunkel | 1 · 1 · 1 | 1 · 1 · 1 |
| passwort-vergessen | provo | hell | 0,8 · 0,8 · 1 | 0,95 · 0,95 · 1 |
| passwort-vergessen | provo | dunkel | 0,8 · 0,8 · 1 | 0,95 · 0,95 · 1 |
| passwort-vergessen | provo-kompakta | hell | 0,8 · 0,8 · 1 | 0,95 · 0,95 · 1 |
| passwort-vergessen | provo-kompakta | dunkel | 0,8 · 0,8 · 1 | 0,95 · 0,95 · 1 |
| registrieren | komuna | hell | 1 · 1 · 1 | 1 · 1 · 1 |
| registrieren | komuna | dunkel | 1 · 1 · 1 | 1 · 1 · 1 |
| registrieren | ekzemplo | hell | 1 · 1 · 1 | 1 · 1 · 1 |
| registrieren | ekzemplo | dunkel | 1 · 1 · 1 | 1 · 1 · 1 |
| registrieren | provo | hell | 0,8571 · 0,8571 · 1 | 0,9643 · 0,9643 · 1 |
| registrieren | provo | dunkel | 0,8571 · 0,8571 · 1 | 0,9643 · 0,9643 · 1 |
| registrieren | provo-kompakta | hell | 0,8571 · 0,8571 · 1 | 0,9643 · 0,9643 · 1 |
| registrieren | provo-kompakta | dunkel | 0,8571 · 0,8571 · 1 | 0,9643 · 0,9643 · 1 |

#### Variante 0

| Screen | Marke | Schema | interspacoj gesp. · Kontr. · gerend. | kvoto gesp. · Kontr. · gerend. |
|---|---|---|---|---|
| anmelden | komuna | hell | 0,8333 · 0,8333 · 0,8333 | 0,2083 · 0,2083 · 0,2083 |
| anmelden | komuna | dunkel | 0,8333 · 0,8333 · 0,8333 | 0,2083 · 0,2083 · 0,2083 |
| anmelden | ekzemplo | hell | 0 · 0 · 0 | 0 · 0 · 0 |
| anmelden | ekzemplo | dunkel | 0 · 0 · 0 | 0 · 0 · 0 |
| anmelden | provo | hell | 0,6667 · 0,6667 · 0,6667 | 0,1667 · 0,1667 · 0,1667 |
| anmelden | provo | dunkel | 0,6667 · 0,6667 · 0,6667 | 0,1667 · 0,1667 · 0,1667 |
| anmelden | provo-kompakta | hell | 0,6667 · 0,6667 · 0,6667 | 0,1667 · 0,1667 · 0,1667 |
| anmelden | provo-kompakta | dunkel | 0,6667 · 0,6667 · 0,6667 | 0,1667 · 0,1667 · 0,1667 |
| konto | komuna | hell | 1 · 1 · 1 | 0,25 · 0,25 · 0,25 |
| konto | komuna | dunkel | 1 · 1 · 1 | 0,25 · 0,25 · 0,25 |
| konto | ekzemplo | hell | 0 · 0 · 0 | 0 · 0 · 0 |
| konto | ekzemplo | dunkel | 0 · 0 · 0 | 0 · 0 · 0 |
| konto | provo | hell | 0,5556 · 0,5556 · 0,5556 | 0,1389 · 0,1389 · 0,1389 |
| konto | provo | dunkel | 0,5556 · 0,5556 · 0,5556 | 0,1389 · 0,1389 · 0,1389 |
| konto | provo-kompakta | hell | 0,5556 · 0,5556 · 0,5556 | 0,1389 · 0,1389 · 0,1389 |
| konto | provo-kompakta | dunkel | 0,5556 · 0,5556 · 0,5556 | 0,1389 · 0,1389 · 0,1389 |
| passwort-vergessen | komuna | hell | 0,6667 · 0,6667 · 0,6667 | 0,1667 · 0,1667 · 0,1667 |
| passwort-vergessen | komuna | dunkel | 0,6667 · 0,6667 · 0,6667 | 0,1667 · 0,1667 · 0,1667 |
| passwort-vergessen | ekzemplo | hell | 0 · 0 · 0 | 0 · 0 · 0 |
| passwort-vergessen | ekzemplo | dunkel | 0 · 0 · 0 | 0 · 0 · 0 |
| passwort-vergessen | provo | hell | 0,1667 · 0,1667 · 0,1667 | 0,0417 · 0,0417 · 0,0417 |
| passwort-vergessen | provo | dunkel | 0,1667 · 0,1667 · 0,1667 | 0,0417 · 0,0417 · 0,0417 |
| passwort-vergessen | provo-kompakta | hell | 0,5 · 0,5 · 0,5 | 0,125 · 0,125 · 0,125 |
| passwort-vergessen | provo-kompakta | dunkel | 0,5 · 0,5 · 0,5 | 0,125 · 0,125 · 0,125 |
| registrieren | komuna | hell | 1 · 1 · 1 | 0,25 · 0,25 · 0,25 |
| registrieren | komuna | dunkel | 1 · 1 · 1 | 0,25 · 0,25 · 0,25 |
| registrieren | ekzemplo | hell | 0 · 0 · 0 | 0 · 0 · 0 |
| registrieren | ekzemplo | dunkel | 0 · 0 · 0 | 0 · 0 · 0 |
| registrieren | provo | hell | 1 · 1 · 1 | 0,25 · 0,25 · 0,25 |
| registrieren | provo | dunkel | 1 · 1 · 1 | 0,25 · 0,25 · 0,25 |
| registrieren | provo-kompakta | hell | 1 · 1 · 1 | 0,25 · 0,25 · 0,25 |
| registrieren | provo-kompakta | dunkel | 1 · 1 · 1 | 0,25 · 0,25 · 0,25 |

In Variante F steigt `interspacoj` überall auf 1, wo es vorher darunter lag. In Variante 0 sind alle drei Werte gleich.

## 4. Grüne F-Screens

**Gemessen: 4 von 4** F-Screens grün (anmelden, konto, passwort-vergessen, registrieren), in Variante 0 weiterhin 0 von 4. In M-1 war es 0 von 4 bzw. 0 von 4.

Die Tabelle zeigt je F-Screen das neue Urteil und alle Kriterien, die `decidiVerdon` prüft.

| Screen | K1 | `check_usage` (Fehler) | axe hell/dunkel | K5 | Navigation | K8 `plena` | grün |
|---|---|---|---|---|---|---|---|
| anmelden | 1 | keiner (1 Hinweis „label-names-action“, Schwere `warning`) | 0 / 0 | 1 | vollständig | ja (`kvoto` 1) | **ja** |
| registrieren | 1 | keiner | 0 / 0 | 1 | vollständig | ja (`kvoto` 1) | **ja** |
| passwort-vergessen | 1 | keiner | 0 / 0 | 1 | vollständig | ja (`kvoto` 1) | **ja** |
| konto | 1 | keiner (1 Hinweis „label-names-action“, Schwere `warning`) | 0 / 0 | 1 | vollständig | ja (`kvoto` 1) | **ja** |

K6 von `registrieren` ist 0,75 (wie in M-1). K6 gehört nicht zur Grün-Regel, darum ist der Screen trotzdem grün.

**Befund F-052-1: Die Vorhersage der Produkt-Spec (3 von 4) trifft nicht zu, gemessen sind 4 von 4.** Die Produkt-Spec erwartete `konto` in komuna, ekzemplo und provo rot wegen Rest C (Überschrift → Liste in `fm-atributlisto`, 17 / 14 / 21 px) und nur in provo-kompakta grün (12,25 px, 0,25 px Abweichung). Gemessen liegt dieses Paar jetzt in allen vier Marken genau auf `spacing.large` (16 / 12 / 20 / 12 px). Die Ursache ist B, nicht ein Eingriff an der Messung für C oder an den Daten: Mit der Flat-Tree-Messung (D-052-01) werden nicht mehr die Kästen von `span[slot=heading]` und `dl` verglichen, sondern die beiden Kästen, die im gerenderten Baum unter `fm-atributlisto` nebeneinanderstehen. Das sind der Überschrift-Block `fm-titolo[part=heading]` und die Liste `div[part=list]`. Abschnitt 5 belegt das im Browser. Nichts an Messung, Skript, Daten oder Schwelle wurde nachgestellt, um eine Zahl zu erreichen.

Die Paare von `konto`, die sich zwischen M-1 und dem neuen Rendern ändern (Elternteil: vorher → nachher, Achse, px M-1 → px neu; hell und dunkel gleich):

| Paar | Ursache | komuna | ekzemplo | provo | provo-kompakta |
|---|---|---|---|---|---|
| `fm-sxelo`: `fm-navigado[nav]` → `fm-pagxo` (y) | A | 16 → 8 | 12 → 6 | 16 → 8 | 16 → 8 |
| `fm-pagxo`: `fm-insigno[badges]` → `fm-teksto[subtitle]` (y) | B (Flat-Tree, `part=lead`) | 8 → 4 | 11 → 3 | 12 → 4 | 8,88 → 4 |
| `fm-pagxo`: `fm-teksto[subtitle]` → `fm-butono[actions]` (x) | B (`verteilita`, Herkunft `fm-pagxo`) | 930,05 → nicht gezählt | 817,5 → nicht gezählt | 911,58 → nicht gezählt | 957,14 → nicht gezählt |
| `fm-pagxo`: `fm-butono[actions]` → `fm-atributlisto` (y) | B (Flat-Tree, `part=head` → `part=sections`) | 36 → 24 | 35,5 → 20 | 42 → 28 | 31,38 → 20 |
| `fm-atributlisto`: `span[heading]` → `dl` (y) | B (Flat-Tree, Rest C, Abschnitt 5) | 17 → 16 | 14 → 12 | 21 → 20 | 12,25 → 12 |

Bei anmelden, registrieren und passwort-vergessen ändert sich je Kombination genau ein Paar, `fm-sxelo`: `fm-navigado[nav]` → Hauptinhalt (`fm-stako` bzw. `fm-pagxo[main]`), y: 16 → 8 (komuna, provo, provo-kompakta) bzw. 12 → 6 (ekzemplo). Das ist A: Der leere Live-Bereich `notices` nimmt keinen Platz mehr ein. Alle anderen K8-Fakten (`nativaj`, `sondoj`, `tekstoj`, `tiparoj`, `orientiloj`) sind in allen F-Screens gleich den Roh-Fakten von M-1.

Die Abstandsstufen je Marke stehen in `spec.md` (komuna 2/4/8/16/24/40, ekzemplo 2/3/6/12/20/36, provo 2/4/8/20/28/48, provo-kompakta 2/4/8/12/20/32 px). Jeder neue Wert liegt auf einer Stufe.

## 5. Rest C (nur Befund, AC-C1)

Rest C war die Lücke zwischen der Überschrift `span[slot=heading]` und der Liste `<dl>` in `fm-atributlisto`, die in M-1 bei `spacing.large` plus 0,25 bis 1 px lag. Gemessen wurde an einer Kopie von `konto` (F, Runde 3) **mit** Überschrift, in `/tmp/s052-rest-c/kopie/konto.html` (das unveränderte M-1-Fragment, kein Fixture). Das Probe-Skript `/tmp/s052-rest-c/probe.mjs` (nicht eingecheckt) rendert sie wie nordstelo (`documentOf`, CSS der cxiuj-Config, gebaute Eroj, 1280 × 900) und misst drei Abstände je Marke × Schema:

- **Element-Kasten:** von der Unterkante des Inline-Elements `span[slot=heading]` zur Oberkante von `dl` (so hat K8 in M-1 gemessen);
- **Zeilenkasten:** von der Unterkante des Zeilen-Blocks, der die Überschrift trägt (`[part=text]` in `fm-titolo`), zur Oberkante von `dl`;
- **Flat-Tree:** von `fm-titolo[part=heading]` zu `div[part=list]`, den Kästen, die nach D-052-01 jetzt gemessen werden.

Die Tabelle zeigt die Werte in px; hell und dunkel sind gleich.

| Marke | `spacing.large` | Element-Kasten (M-1) | Zeilenkasten | Flat-Tree (neu) | Schrift der Überschrift (Größe / Zeilenhöhe), Höhe des `span` |
|---|---|---|---|---|---|
| komuna | 16 | **17** | 16 | 16 | 14 px / 20 px, 18 px |
| ekzemplo | 12 | **14** | 12 | 12 | 20 px / 25 px, 22 px |
| provo | 20 | **21** | 20 | 20 | 20 px / 25 px, 23 px |
| provo-kompakta | 12 | **12,25** | 12 | 12 | 17 px / 21,25 px, 22 px |

Die Spalte „Element-Kasten“ stimmt genau mit den Werten der Produkt-Spec und den Roh-Fakten von M-1 überein. Der Unterschied zum Zeilenkasten ist der Rest von Zeilenhöhe minus Inhaltshöhe der Schrift unter der Grundlinie, also typografisch.

**Die zwei Erklärungen aus der Spec, gegen die Messung gehalten:**

1. **Ero (Überschrift ohne eigenen Block, Rand oder Typografie-Abstand):** trifft **nicht** zu. Die Überschrift hat einen eigenen Block: `fm-atributlisto` legt sie in `<fm-titolo part="heading">` (`display: block`) mit `margin-block-end: var(--fm-ero-atributlisto-list-gap)`, und dieser Rand ist in jeder Marke genau `spacing.large`.
2. **Messung (Element-Kasten eines Inline-Elements statt Zeilenkasten):** trifft zu. Der `span` ist inline (`display: inline`). Sein Element-Kasten ist kleiner als die Zeile, die ihn trägt, darum lag die gemessene Lücke um 0,25 bis 2 px über dem Rand.

**Die offene Frage `NAMED_SLOTS = []`:** ist beantwortet. Im gebauten `fm-atributlisto` gilt `NAMED_SLOTS = ["heading"]` (`packages/eroj/src/generated/fm-atributlisto.ts:28`); die Überschrift landet im benannten Slot `heading` innerhalb von `fm-titolo[part=heading]`. `NAMED_SLOTS = []` gilt für `fm-titolo` (`packages/eroj/src/generated/fm-titolo.ts:28`): Dort landet der Inhalt im Standard-Slot von `div[part=text][role=heading]`. Weil sich der Projektor seit `de931e40` nur in `sxablono-template.ts` (Fix A, nur Sxablonoj mit Live-Bereich) geändert hat, war das in M-1 genauso; die 17 px von M-1 passen genau zu „Rand 16 px + Inline-Rest 1 px“.

**Folge:** Rest C ist mit B erledigt, ohne Änderung an `fm-atributlisto` und ohne Änderung an der Messung von Inline-Elementen in diesem Ticket. Der Wert ist jetzt der Rand des Ero, so wie D-052-01 den Abstand definiert („gemessen wird, was im gerenderten Baum nebeneinander steht“).

**Vorschlag für eine Folge-Spec (klein):**

- Der Element-Kasten eines Inline-Elements bleibt die Messgröße, wenn zwei Light-DOM-Geschwister **ohne** Shadow-DOM dazwischen nebeneinanderstehen (z. B. ein `<span>` direkt vor einem `<div>` im Markup des Agenten, oder Variante 0). Dort kann derselbe Inline-Rest von 0,25 bis 2 px wieder auftauchen. Zu entscheiden ist, ob K8 für Inline-Elemente den Zeilenkasten misst. Das ist eine Jugxo-Frage (D-052-01, Kialo) und gehört nicht in diesen Lauf.
- Das Fixture `konto-m1` entfernt die Überschrift nur wegen Rest C. Es kann in der Folge-Spec mit Überschrift neu erzeugt werden; nach dieser Messung wäre `interspacoj` = 1 in allen 8 Kombinationen.

## 6. `verteilita`-Paare nach Herkunft

Ein Paar ist `verteilita`, wenn ein Ero oder eine Sxablono den Freiraum verteilt (D-052-01); es zählt dann nicht. Die Tabelle nennt alle `verteilita`-Paare der Neubewertung, getrennt nach Herkunft.

| Herkunft | Art | Screen | Paar (Light-DOM-Indizes) | Achse | Wert je Marke (hell = dunkel) |
|---|---|---|---|---|---|
| `fm-pagxo` | Sxablono (Kopfzeile `part=head`, `justify-content: space-between`) | F `konto` | `8→9` `fm-teksto[subtitle]` → `fm-butono[actions]` | x | komuna 930,05 · ekzemplo 817,5 · provo 911,58 · provo-kompakta 957,14 px |

Das sind 8 Einträge (1 Paar × 4 Marken × 2 Schemata), alle mit `fm-*`-Herkunft. Kein anderer Screen hat ein `verteilita`-Paar.

**Layout-Eroj mit `justify` (Q-6, D-052-07):** In den M-1-Screens kommt kein `fm-vico` und kein `fm-kolumno` mit `justify` vor; es gibt also **kein** `verteilita`-Paar mit Herkunft aus einem Layout-Ero. Die Frage an den Maintainer bleibt trotzdem offen, weil sie in künftigen Läufen auftreten kann: **Sollen Layout-Eroj, deren Verteilung der Agent per Prop `justify` wählt, von `verteilita` ausgenommen werden (das Paar würde dann gemessen)?** Heute gelten sie nach D-052-01 als Ero-Herkunft.

## 7. Variante 0 und Selbstprüfung

**Variante 0 ändert sich nicht.** Für alle 4 Screens ist das neu gerenderte `taksado.k8` (ohne `plena`) byte-gleich zum gespeicherten, und alle K8-Fakten der 8 Renders (`interspacoj`, `nativaj`, `sondoj`, `tekstoj`, `tiparoj`, `orientiloj`) sind gleich den Roh-Fakten von M-1. Kein Paar ist `verteilita`. Die Gründe für „nicht grün“ sind dieselben wie in M-1: anmelden `axe-hela, axe-malhela, K5, K8`; konto `K5, navigado, K8`; passwort-vergessen `K5, K8`; registrieren `K5, K8`.

**Selbstprüfung.** Das Skript endet mit Exit 5 und schreibt nichts, wenn ein `verteilita`-Paar eine Herkunft ohne `fm-` hat oder wenn Variante 0 überhaupt ein `verteilita`-Paar hat. Dass die Prüfung greift, zeigen zwei präparierte Kopien in `/tmp` (Kopie von `daten/neubewertung`, je ein Paar per Hand verändert):

```text
$ node specs/052-k8-interspacoj/neubewertung.mjs --selbstpruefung specs/052-k8-interspacoj/daten/neubewertung
selbstpruefung: 8 verteilita pair(s), 0 error(s)                                   (Exit 0)

$ node specs/052-k8-interspacoj/neubewertung.mjs --selbstpruefung /tmp/s052-selbst-a   # F/konto, dt→dd mit Herkunft "div"
SELBSTPRUEFUNG verteilita without fm-* origin: F/konto komuna/light 13→14 (dt → dd, 16 px, origin div)
selbstpruefung: 9 verteilita pair(s), 1 error(s)                                   (Exit 5)

$ node specs/052-k8-interspacoj/neubewertung.mjs --selbstpruefung /tmp/s052-selbst-b   # 0/anmelden, erstes Paar mit Herkunft "fm-pagxo"
SELBSTPRUEFUNG verteilita in Variante 0: 0/anmelden komuna/light 1→4 (header → section, 16 px, origin fm-pagxo)
selbstpruefung: 9 verteilita pair(s), 1 error(s)                                   (Exit 5)
```

## 8. Härtung K8I-004b (D-052-13)

Nach Fix B kam eine Härtung dazu, die über das ursprüngliche Ticket hinausgeht und K8 nur strenger macht. Ein Agent kann mit deklarativem Shadow-DOM (`<template shadowrootmode>`) ohne Skript und ohne `<style>` im Dokument einen eigenen Shadow-Root mit eigener Verteilung schreiben. Vorher hätte jeder solche Root an einem `fm-*`-Element als Ero-Herkunft gezählt. Jetzt gilt:

- Herkunft Ero/Sxablono nur bei einem **hochgestuften, registrierten** `fm-*`-Element (`:defined`); ein unregistriertes `fm-io` oder ein `fm-*`, dessen Hochstufung fehlschlägt, zählt nicht.
- `<style>` und `<link rel=stylesheet>` ohne Marker `data-nordstelo` zählen auch in jedem offenen Shadow-Root; gibt es eines, ist auf dem Screen kein Paar `verteilita`.

Belegt mit drei Gegenproben, je zuerst rot: (e1) offener Root an einem unregistrierten `fm-io`, (e2) geschlossener Root an `fm-stako` mit `:host`-Verteilung, (e3) offener Root an einem `div`, der eine echte `fm-vico` per `::part(control)` umfärbt. Vorher je `interspacoj` = 1 und das Paar `verteilita`, nachher 0 in allen 8 Kombinationen und kein Paar `verteilita`. Alle anderen Fixtures blieben byte-gleich. Details: `plan.md` › D-052-13, `tasks.md` › K8I-004b. Auf die Neubewertung wirkt die Härtung nicht: Die M-1-Screens haben keine eigenen Stilregeln und nur echte Eroj; das `fm-pagxo`-Paar bleibt `verteilita`.

## 9. Bekannt fremde Ausfälle

Diese Tests sind auf `main` bzw. unabhängig von dieser Spec rot oder wacklig. Sie werden nur berichtet, nicht angefasst. Ein anderer roter Test im selben Paket wäre ein neuer Befund.

| Test | Art | Bezug zu Spec 052 |
|---|---|---|
| `packages/modelo` `ci/turbo-inputs.test.ts:679` | Zeitfenster („Hook timed out in 10000ms“) | keiner, `packages/modelo` unverändert |
| `packages/eroj/test/buehne-036.spec.ts:919` | Test 3.6, Firefox | keiner |
| `packages/ekranoj/src/rondoj.test.ts:733` | wacklig | keiner (in K8I-004 und K8I-004b grün) |
| `vitrino.check.ts:1224` „Ableitung Gegenprobe“ | Zeitmessung der Werkstatt, Median knapp unter der Grenze; auch vor Fix A rot (B-003-4) | keiner (die Werkstatt leitet Paletten ab) |

## 10. Sauberer Probelauf (AC-N6) – vorbereitet, **nicht gestartet**

Der Befehl folgt dem Muster von M-1 in Spec 050 (`specs/050-mvp-probelauf/plan.md` › „Befehle M-1 bis M-3“). Er ist **nicht gestartet**; in diesem Ticket lief kein Modell.

| Feld | Wert |
|---|---|
| Lauf (CLI `--lauf-id`) | `kontrolle-probe-sonnet-komuna` |
| Ledger-ID | `probe-sonnet-komuna` |
| Modell | Sonnet 5.5 über das Kontrollpaar: `--kontroll-modelo openrouter/anthropic/claude-sonnet-5.5` |
| Marke | komuna (`ABLAUF_MARKO`; gerendert in allen 4 Marken × hell/dunkel) |
| Aufgabe, Varianten | `anmelden-und-konto`, F und 0, 1 Wiederholung |
| Kostenrahmen | ≈ 3,75 $ |
| `--max-tokens` | ⌊3,75 $ ÷ 2,40 $ × 10⁶⌋ = 1 562 500, auf 1 000 abgerundet: **1 562 000** (Formel D-050-9, p_eff 2,40 $ je 10⁶ für Sonnet) |
| Commit | `<<COMMIT-SHA-FINAL: Kopf des Branches nach K8I-006 bzw. nach dem Merge eintragen>>` |
| Lastbedingung | Last (1 min) < 10 vor dem Start **und** während des Laufs (Spec 050: ein Lauf mit Last > 10 ist gestört) |
| Fremde Messung | keine: kein anderer Playwright-, Vitest-Browser- oder Messlauf auf der Maschine (Wächter `gardisto stand` zeigt „frei“) |

```sh
W=/Users/thorstenjankowski/n8n-compose/20260918_fundamento-ds/.fundamento/spec050/werkzeug
M=/Users/thorstenjankowski/n8n-compose/20260918_fundamento-ds; S=$M/.fundamento/spec050
R=/Users/thorstenjankowski/.purple-code/worktrees/fundamento-wt-mwexax2207lwdhug/repos/fundamento

# Vorher: git -C $R status --porcelain leer; git -C $R rev-parse HEAD = <<COMMIT-SHA-FINAL>>; pnpm -C $R build;
#         uptime (1 min < 10); S050_REPO=$R $W/gardisto stand → „frei“; $W/kosten stand
S050_REPO=$R $W/mezuri probe-sonnet-komuna "Spec 052 sauberer Probelauf Sonnet komuna" --cwd $R -- \
  pnpm nordstelo --art ablauf --taskoj anmelden-und-konto --varianten F,0 --ripetoj 1 \
  --lauf-id kontrolle-probe-sonnet-komuna --kontroll-modelo openrouter/anthropic/claude-sonnet-5.5 \
  --max-tokens 1562000 --out $S/m1-052 --ledger $S --env $M/.env
```

Hinweise für den Start (nur gelesen, nichts geändert):

- Das Spec-050-Werkzeug ist auf den Worktree von Spec 050 festgelegt (`lib.mjs` `R_050`); laut `lib.mjs` und `sperre.mjs` setzt die Umgebungsvariable `S050_REPO` den eigenen Stand ohne Änderung am Werkzeug (vor dem Start mit `S050_REPO=$R $W/gardisto stand` prüfen). Ohne die Variable endet `mezuri --cwd $R` mit Exit 2.
- **Das Ledger von Spec 050 trägt diesen Lauf nicht.** Die Scheibe `probe-` (4,00 $) ist mit 3,743952 $ gebucht (M-1), der Rest 0,256 $ reicht nicht für 3,75 $; die Kappe 8,00 $ ist mit 3,99 $ belegt. Vor dem Start braucht es eine Entscheidung des Maintainers: eine neue Reservierung bzw. ein eigenes Ledger für Spec 052 (Werkzeug und Ledger liegen außerhalb des Repos und wurden hier nicht angefasst).
- In M-1 verbrauchte F allein 1 546 444 Tokens. Mit 1 562 000 bliebe Variante 0 im ungünstigsten Fall nur ein Rest von rund 15 000 Tokens (Risiko R-1 aus Spec 050: 0 bleibt „nicht gestartet“ oder wird ein Teilergebnis). Wird F früher grün, braucht es weniger Runden. Die Grenze wird nicht angehoben, ohne dass der Maintainer den Kostenrahmen ändert.

## 11. Was der Maintainer als Nächstes tut

1. Diesen Bericht lesen, besonders F-052-1 (4 statt 3 grüne F-Screens) und Abschnitt 5 (Rest C durch B erledigt): `/Users/thorstenjankowski/.purple-code/worktrees/fundamento-wt-mwexax2207lwdhug/repos/fundamento/specs/052-k8-interspacoj/neubewertung.md`.
2. Die Frage aus Abschnitt 6 beantworten: Layout-Eroj mit `justify` von `verteilita` ausnehmen, ja oder nein (D-052-07 in `/Users/thorstenjankowski/.purple-code/worktrees/fundamento-wt-mwexax2207lwdhug/repos/fundamento/specs/052-k8-interspacoj/plan.md`).
3. Entscheiden, ob der Vorschlag aus Abschnitt 5 (Zeilenkasten für Inline-Elemente ohne Shadow-DOM, `konto-m1` mit Überschrift) eine Folge-Spec wird.
4. Den PR prüfen: `<<PR-LINK>>`. CI je Job:

   | Job | Ergebnis | Notiz |
   |---|---|---|
   | `<<CI-TABELLE: vom Orchestrator je Job auszufüllen>>` | | |

5. Für den sauberen Probelauf: Ledger bzw. Reservierung für `probe-sonnet-komuna` (≈ 3,75 $) festlegen, den Commit oben eintragen und den Befehl aus Abschnitt 10 erst starten, wenn Last (1 min) < 10 und keine fremde Messung läuft.
6. Optional zum Nachrechnen ohne Modell, im Repo `/Users/thorstenjankowski/.purple-code/worktrees/fundamento-wt-mwexax2207lwdhug/repos/fundamento` nach `pnpm build`:
   `node specs/052-k8-interspacoj/neubewertung.mjs --roh /Users/thorstenjankowski/n8n-compose/20260918_fundamento-ds/.fundamento/spec050/m1/20261113-0243 --out /tmp/s052-nachrechnen` und `diff -r -x last.txt specs/052-k8-interspacoj/daten/neubewertung /tmp/s052-nachrechnen`.
