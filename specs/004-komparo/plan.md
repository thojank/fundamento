# Plan – Spec 004, **Etappe A**: komuna 2, Vitrino, Constitution v1.7

**Spec:** [`spec.md`](spec.md) · **Research:** [`research.md`](research.md) · **Datenmodell:** [`data-model.md`](data-model.md) · **Verträge:** [`contracts/`](contracts/) · **Quickstart:** [`quickstart.md`](quickstart.md) · **Constitution:** v1.6 bindend, in dieser Etappe auf v1.7 erweitert (D-11) · **Rahmen:** [`docs/vojmapo.md`](../../docs/vojmapo.md) Zeile 3b · **Stand:** Entwurf zur Prüfung durch den Maintainer · **Datum:** 2026-09-20 · **Basis:** `main` @ `98b0e10`

Dieser Plan ist die Ausgabe von `/speckit.plan` für **Etappe A** von Spec 004. Er umfasst FR-01 bis FR-09, FR-19 und den vorbereitenden Teil von FR-15. **Etappe B (FR-10 bis FR-14, FR-16 bis FR-18) ist nicht Teil dieses Plans**; sie läuft später in einer eigenen Sitzung im Repo `fundamento-aspekto-komparo`.

**Clean Room dieser Sitzung (FR-03, Art. V):** Für Plan und Aufgaben wurde nichts von Adobe Spectrum geöffnet, geladen oder installiert. Gelesen wurde allein `research/benchmark-spectrum.md` (Konzepte und Kennzahlen). Jede Zahl in diesem Plan stammt aus Fundamentos eigenen Daten (research §2 und §3). komuna 2 entsteht aus den Zielen, nicht aus einem Vorbild.

## Zusammenfassung

Etappe A macht drei Dinge, in dieser Reihenfolge:

1. **Ziele vor Werten (FR-01, FR-02), auf zwei Ebenen.** Zehn messbare Qualitätsziele mit Kialo. Sieben davon gelten als **Regulo** für jede Marke, weil sie Zugänglichkeit und Struktur sichern; vier sind **Aspiroj** – Ziele, die komuna sich selbst setzt, prüfbar und begründet, aber ohne Anspruch auf andere Marken („Fluida Marko", D-03). Heute schlagen an: die Kontrast-Reserve als Regulo (kleinster Wert +3,6 %), der Abstand benachbarter Flächen als Regulo (zweimal genau 0) und drei Aspiroj von komuna (reine Endpunkte als Fläche, Reserve 10 %, eigener Dunkelmodus mit 1,3 % Abdeckung). Die Regel kommt zuerst, die Werte danach – der rote Lauf ist das Repo selbst.
2. **komuna 2 (FR-01, FR-04).** Die Werte von komuna werden so weit geändert, wie Reguloj und eigene Aspiroj es verlangen: eigene Stufen für Flächen statt reiner Endpunkte, 57 eigene Dunkelwerte statt der gemeinsamen Umsetzung, drei enge KontrastParoj auf Reserve gebracht. `ekzemplo` zieht dort nach, wo eine **Regulo** es verlangt – nicht bei komunas Aspiroj; `ciferecigo` nach dem Merge außerhalb des Repos.
3. **Vitrino (FR-05 bis FR-09).** Ein neues Celo schreibt eine einzige, eigenständige HTML-Datei: Paletten mit Helligkeitskurve, Flächenfolge, Texthierarchie, Status, Aktionen, echtes `fm-butono`, Kontrastmatrix und Regularo-Ergebnis, alle Dimensioj zur Laufzeit umschaltbar und zwei Aspektoj nebeneinander (in Etappe A komuna ↔ ekzemplo).

Dazu die Verfassungsänderung v1.7 (Art. V, Benchmark-Aspekto) und die Vorbereitung der Clean-Room-Prüfung auf Fingerprints fremder Benchmark-Aspektoj, damit Etappe B nur noch ihre Liste liefern muss.

## Technischer Kontext

| Punkt | Festlegung |
|---|---|
| Sprache, Laufzeit | TypeScript 7, Node 24, pnpm 10.34.5, Turborepo (unverändert) |
| Neue Pakete | keine (Art. XI). Metriken in `@fundamento/modelo`, Vitrino als Celo in `@fundamento/projekcioj` |
| Neue Abhängigkeiten | keine. OKLCH über `oklchLightness` (Spec 002), Kontrast über `evaluateAlirebleco`, Rendern über die vorhandenen Playwright- und axe-Einrichtungen |
| Prüfungen | fünf Kern-Checks unverändert; `check:vitrino` kommt als eigener Schritt dazu (D-09) |
| Leistungsziel | `fm projekcioj build` bleibt unter 10 s (heute 0,6–0,8 s); die Vitrino darf davon höchstens 2 s brauchen; die HTML-Datei bleibt unter 3 MB |
| Umfang | 7 neue Reguloj, 4 Aspiroj für komuna, ~30 geänderte und 57 neue Tokenwerte (eigener Dunkelmodus), 1 neues Celo, 1 neue Prüfung, 1 Verfassungsänderung, 1 neuer Ontologio-Begriff |
| Test-first | Rot vor der Umsetzung ohne Ausnahme; Mutationsprüfung nur für Abnahmetests (Vitrino-Abnahme, Zeitbudgets), wie in Phase 3 |

## Constitution Check (Tor vor dem Entwurf)

| Tor | Ergebnis |
|---|---|
| Constitution v1.6 auf `main` ratifiziert | bestanden; diese Etappe ergänzt Art. V zu v1.7 (D-11), sie bricht ihn nicht |
| ≤ 3 neue Pakete (Art. XI) | bestanden (0) |
| Modelo-First (Art. I) | bestanden: die Vitrino ist eine Projekcio, kein handgepflegtes Dokument; jeder Wert und jede Zahl darin stammt aus dem Modelo |
| Ein Vokabular (Art. II) | bestanden: keine neuen Tokennamen außerhalb der bestehenden Rollen; komuna 2 ändert Werte und ergänzt Palettenstufen |
| Native Mehrmarkenfähigkeit (Art. IV) | bestanden: jede neue Regulo gilt für jede Aspekto; die Folgen für `ekzemplo` und `ciferecigo` sind Teil des Plans (D-05) |
| Clean Room (Art. V) | bestanden: kein Fremdmaterial in dieser Sitzung; die Erweiterung der Fingerprint-Prüfung stärkt den Nachweis (D-10) |
| Regeln mit Gründen (Art. VI) | bestanden: jede der acht Reguloj trägt einen Kialo, jede geht auf einen gemessenen Befund zurück |
| Kontrolle (Art. X) | bestanden: jede Regulo ist automatisch prüfbar; die Vitrino hat eine eigene Prüfung |
| Interoperabilität (Art. XII) | bestanden: die Vitrino nutzt die vorhandenen Celoj (CSS, Make Kit), sie baut keine zweite Projektion |
| Einfachheit der Nutzung (Art. XIII) | bestanden: eine Datei, ein Doppelklick, kein Server |

---

## Entwurfsentscheidungen

### D-01 Etappenschnitt

Etappe A enthält alles, was im Kern-Repo passiert und ohne Kenntnis fremder Werte entstehen muss: die Ziele, komuna 2, die Vitrino, die Verfassungsänderung und die Vorbereitung der Fingerprint-Prüfung. Etappe B (Import, Abbildung, Bericht) läuft in `fundamento-aspekto-komparo`; dieser Plan legt nur die **Schnittstellen** fest, die Etappe B vorfindet:

| Schnittstelle | Festlegung in Etappe A |
|---|---|
| Fingerprints | Dateiform `{ source, fingerprints }`, Quelle über `--spuroj` oder Projekt-Konfiguration (D-10) |
| Vitrino-Gegenüberstellung | arbeitet über beliebige zwei Aspektoj des geladenen Modelo; komparo braucht nur ein gültiges Aspekto-Paket (D-08) |
| Kennzahlen | ein Metriken-Modul mit stabilen IDs, das Regulo, Vitrino und späterer Bericht gemeinsam nutzen (D-12) |
| Vollständigkeit | die neuen Reguloj gelten unverändert auch für komparo; abgeleitete Werte kennzeichnet Etappe B selbst |

### D-02 Die zehn Qualitätsziele (FR-01)

Jedes Ziel nennt: was gemessen wird, warum (Kialo), den heutigen Wert, den Zielwert und **auf welcher Ebene** es gilt – als Regulo für jede Marke oder als Aspiro nur für komuna (D-03). Die Zielwerte sind an den eigenen Daten geprüft (research §2), damit sie erreichbar sind und trotzdem Arbeit verlangen.

| # | Ziel | Messung | Heute (komuna) | Ziel | Ebene | Kialo (Kurzform) |
|---|---|---|---|---|---|---|
| G1 | Kontrast mit Reserve | `wcag2-reserve` je Paar × Kombination | min +3,6 % | **≥ +5 %** | **Regulo** | Eine Schwelle knapp zu treffen heißt, sie bei jeder Schriftglättung, jedem Bildschirm und jeder Alpha-Kante zu verfehlen; Reserve macht die Zusage belastbar. |
| G1b | komunas eigene Reserve | dieselbe Messung | min +3,6 % | **≥ +10 %** | **Aspiro komuna** | Die Referenzmarke soll vormachen, was erreichbar ist, ohne es jeder Marke vorzuschreiben. |
| G2 | Flächen bleiben unterscheidbar | `oklch-l-delta` benachbarter Flächenrollen | 0,000 (zweimal) | **≥ 0,02** | **Regulo** | Wenn zwei Flächen gleich hell sind, trägt nur der Schatten die Schichtung; ohne Schatten (hoher Kontrast, Druck, forced colors) verschwindet sie ganz. Das ist Struktur, nicht Geschmack. |
| G3 | Keine reinen Endpunkte als Fläche | `oklch-l-extreme` je Flächenrolle | 0,000 (viermal) | **≥ 0,02** | **Aspiro komuna** | Reines Weiß und reines Schwarz lassen keinen Platz mehr nach oben oder unten. Eine Marke darf sich trotzdem dafür entscheiden – komuna nicht. |
| G4 | Paletten mit gleichmäßiger Kurve | `oklch-l-step` (ΔL je 100 Stufeneinheiten) | 0,050 … 0,160 | **0,04 … 0,20**, streng monoton | **Regulo** | Eine Rampe ist ein Werkzeug: Wer „eine Stufe dunkler" sagt, muss überall dieselbe Wirkung bekommen. |
| G5 | Rampen untereinander ausgerichtet | `oklch-l-align` | ≤ 0,013 | **≤ 0,02** | **Regulo** | Gleiche Stufennummer, gleiche Helligkeit: sonst wirkt dieselbe Rolle je nach Farbe verschieden schwer. |
| G6 | Alle Werte im sRGB-Gamut | `srgb-gamut` | erfüllt | bleibt erfüllt, geprüft | **Regulo** | Was außerhalb des Gamuts liegt, beschneidet der Browser – dann stimmt der gemessene Kontrast nicht mehr mit dem gezeigten überein. |
| G7 | Skala ist regelmäßig | `type-scale-consistency` (relative Abweichung vom Median) | 7,1 % | **≤ 10 %** | **Regulo** | Eine Skala muss vorhersagbar sein; **welches** Verhältnis eine Marke wählt, ist ihre Sache. |
| G7b | komunas Verhältnisband | `type-scale-ratio` | 1,111 … 1,250 | **1,10 … 1,30**, dokumentiert | **Aspiro komuna** | Die Referenzmarke legt sich auf ein ruhiges Band fest, damit ihre Skala berechenbar bleibt. |
| G8 | Rhythmus folgt der Größe | `type-rhythm` | erfüllt | bleibt erfüllt, geprüft | **Regulo** | Große Zeilen brauchen weniger Durchschuss und engere Laufweite; das ist Lesbarkeit, keine Geschmacksfrage. |
| G9 | Eigener Dunkelmodus | `dimensio-kovrado` für `color-scheme=dark` über `background`, `text`, `action`, `status` | **1,3 %** (ein Palettenwert) | **100 %** (57 Tokens) | **Aspiro komuna** | Ein Dunkelmodus, den alle Marken teilen, ist eine Umsetzung, kein Entwurf. Wer eine starke Basis sein will, bestimmt ihn selbst – vorschreiben lässt er sich nicht. |
| G10 | Echte Werte je Dimensio | `dimensio-kovrado` für jede Dimensio | dark 1,3 %, sonst 0 % | wird **gemessen und gezeigt**, ohne Zielwert | Messgröße | Sichtbar zu machen, wie viel eine Marke selbst bestimmt, ist ehrlicher, als es zu erzwingen: `density`, `viewport` und `motion` darf eine Marke guten Gewissens vom System übernehmen. |

APCA bleibt beratend (Art. X, Jugxo `jug_01M2XKF38358Z6WQH9KARYJ6F3`).

### D-03 Zwei Ebenen: Reguloj und Aspiroj (FR-02, „Fluida Marko")

**Fluida Marko** (Maintainer-Entscheidung 2026-09-20): Marken sind frei. Regeln erzwingen **Zugänglichkeit und Struktur**, nie Geschmack. Was nur für eine Marke gilt, ist ein Ziel dieser Marke – prüfbar, mit eigenem Kialo, aber ohne Anspruch auf andere.

**Ebene 1 – Reguloj** (`data/reguloj.json`, gelten für jede Aspekto):

| Regulo | `appliesTo` | `sojlo` | Prüft |
|---|---|---|---|
| `contrast-reserve` | `roles: [foreground, background, border, focus]` | `{ metric: "wcag2-reserve", min: 0.05 }` | jede KontrastParo × Kombination |
| `surface-distinct` | `tokens: ["color.background.*"]` | `{ metric: "oklch-l-delta", min: 0.02 }` | benachbarte Flächenrollen je Kombination |
| `palette-even` | `tokens: ["color.palette.*"]` | `{ metric: "oklch-l-step", min: 0.04, max: 0.2 }` | Monotonie und Bandbreite je Rampe |
| `palette-aligned` | `tokens: ["color.palette.*"]` | `{ metric: "oklch-l-align", max: 0.02 }` | gleiche Stufennummer über Rampen |
| `srgb-gamut` | `types: ["color"]` | – | jede Komponente in 0 … 1 |
| `type-scale` | `tokens: ["font.size.scale.*"]` | `{ metric: "type-scale-consistency", max: 0.1 }` | **Regelmäßigkeit**: jedes Verhältnis höchstens 10 % vom Median der Skala entfernt, streng monoton – **kein** fester Bereich |
| `type-rhythm` | `tokens: ["font.lineheight.*", "font.tracking.*"]` | – | Monotonie gegen die Größenrolle |

Zwei Ausnahmen mit Kialo in der Regulo selbst: **Alpha-Rampen** (`shade`) fallen aus `palette-even` und `palette-aligned`, **Ankerstufen** (0 = Weiß, 1000 = Schwarz) aus `palette-even`.

`surface-order` (Phase 2) bleibt unverändert: Reihenfolge dort, Abstand in `surface-distinct`.

**Ebene 2 – Aspiroj** (`aspekto.json#/aspiroj`, gelten nur für die Marke, die sie erklärt):

```jsonc
"aspiroj": [
  { "metriko": "wcag2-reserve", "min": 0.10,
    "kialo": "Die Referenzmarke soll vormachen, was erreichbar ist, ohne es anderen vorzuschreiben." },
  { "metriko": "type-scale-ratio", "min": 1.1, "max": 1.3, "appliesTo": { "tokens": ["font.size.scale.*"] },
    "kialo": "Ein ruhiges Band macht die Skala berechenbar." },
  { "metriko": "oklch-l-extreme", "min": 0.02, "appliesTo": { "tokens": ["color.background.*"] },
    "kialo": "Reines Weiß und reines Schwarz lassen keinen Platz mehr nach oben oder unten." },
  { "metriko": "dimensio-kovrado", "dimensio": "color-scheme", "valoro": "dark", "min": 1,
    "appliesTo": { "tokens": ["color.background.*", "color.text.*", "color.action.*", "color.status.*"] },
    "kialo": "Ein Dunkelmodus, den alle Marken teilen, ist eine Umsetzung, kein Entwurf." }
]
```

- **Pflichtfelder:** `metriko`, `kialo`, mindestens eine Schranke (`min` oder `max`). Ohne Kialo ungültig – wie bei Reguloj (Art. VI).
- **Geprüft** wird eine Aspiro nur in den Kombinationen der erklärenden Aspekto.
- **Ausgabe getrennt:** Ein Regulo-Verstoß ist `<regulo-name>`, ein verfehltes Ziel ist `aspiro-missed`; die Zusammenfassung zählt beide getrennt („3 Regulo-Verstöße, 1 verfehltes Entwurfsziel").
- **Schweregrad:** `error` für die erklärende Marke. Begründung: Eine Marke, die sich ein Ziel setzt, soll es nicht unbemerkt verlieren; wer es aufgeben will, streicht oder senkt es sichtbar in `aspekto.json` (und begründet das dort, wo es steht).
- **Negativtest (Fluida Marko):** Eine Fixture-Aspekto mit reinem Weiß als Fläche und einem konstanten Verhältnis von 1,5 **besteht alle Reguloj**. Sie erklärt keine Aspiroj und bekommt deshalb auch keinen `aspiro-missed`.

### D-04 komuna 2: was sich an Werten ändert (FR-01)

Die Reguloj bestimmen die Arbeit, nicht umgekehrt. Aus G1 bis G3 folgt genau dies:

1. **Neue Ankernahe Stufen in der neutralen Rampe.** Die Flächen brauchen eigene Stufen dicht an Weiß und Schwarz, statt die Anker selbst zu belegen. Die Zahl der neuen Stufen ergibt sich aus der Rechnung, nicht aus Geschmack: vier Flächenrollen × zwei Schemata, jede mit ≥ 0,02 Abstand zur Nachbarin und zum Anker.
2. **Flächenrollen neu gezeigt.** Hell: `raised` bekommt eine eigene, hellere Stufe als `default`; dunkel: `sunken` wird dunkler als `canvas`. Damit verschwinden die vier Nullabstände aus research §2.2.
3. **Eigener Dunkelmodus für komuna (G9).** komuna trägt seine Dunkelwerte künftig selbst: **57 Tokens** in `aspekto/komuna+color-scheme/dark` – alle Rollen der Gruppen `background`, `text`, `action` und `status`, die der Dunkelmodus umsetzt (research §2.8; heute ist es genau ein Palettenprimitiv). Der generische Satz `color-scheme/dark` bleibt für alle anderen Marken die gemeinsame Umsetzung; komuna hört auf, sie zu benutzen. Das ist der Unterschied zwischen „umgesetzt" und „abgestimmt", und er ist als `dimensio-kovrado` eine Zahl: 1,3 % heute, 100 % danach.
4. **Drei enge Paare auf Reserve.** `status-success-on-basic` (+3,6 %), `text-muted-on-background-sunken` (+4,2 %) und `status-info-on-basic` (+7,3 %) bekommen Luft, indem die Status-Basisflächen und `color.text.muted` auf benachbarte Rampenstufen gelegt werden. Erwartung: die Änderung an `sunken` aus Punkt 2 hebt das zweite Paar bereits an.
5. **Nichts anderes.** Die Typografie bleibt, wie sie ist (G7, G8 sind heute erfüllt); die Skala wird dokumentiert, nicht neu gerechnet. Paletten behalten ihre Kurve (G4, G5 sind erfüllt); es kommen nur Stufen dazu.

Reihenfolge in der Umsetzung: erst die Regulo (rot), dann die Werte (grün). Jede Wertänderung nennt in der Commit-Nachricht die Regulo, die sie erzwingt.

### D-05 Folgen für die anderen Aspektoj (FR-04)

| Aspekto | Ort | Vorgehen |
|---|---|---|
| `ekzemplo` | Fixture im Repo | zieht dort nach, wo eine **Regulo** es verlangt: drei enge Paare und zwei Nullabstände (research §3). komunas Aspiroj gelten für ekzemplo nicht; die Marke darf reines Weiß und ihren geerbten Dunkelmodus behalten (Fluida Marko). |
| `ciferecigo` | externes, privates Paket | nach dem Merge außerhalb des Repos neu abgeleitet, wie Spec 003 T028; die Aufgabe steht als Nachlauf in `tasks.md` und wird vom Maintainer ausgeführt |
| `komparo` | Etappe B | erbt die Reguloj; abgeleitete Werte kennzeichnet Etappe B selbst (FR-13, FR-14) |

Eine neue Regulo darf nie stillschweigend eine Marke aussperren: Die Aufgabe, die eine Regulo einführt, prüft im selben Lauf beide Aspektoj des Repos. Eine Aspiro darf das umgekehrt nie tun: Sie gilt nur für die Marke, die sie erklärt, und ein Negativtest hält das fest (D-03).

### D-06 Vitrino als Celo mit zweiter Phase (FR-05, FR-09)

Die Vitrino ist eine Projekcio und liegt bei den anderen: `packages/projekcioj/src/celoj/vitrino/`. Sie braucht zwei Dinge, die erst **nach** den anderen Celoj existieren: das fertige CSS (`css/fundamento.css`) und das gebündelte, React-freie Element (`make-kit/<aspekto>/dist/element.js`, Spec 003 F6). Deshalb bekommt der Celo-Vertrag eine zweite, optionale Phase:

```ts
export interface Celo {
  name: string;
  /** Dateien allein aus dem Modelo (rein). */
  generate?(input: CeloInput): GeneratedFile[];
  /** Dateien aus dem, was die anderen Celoj geschrieben haben (nach dem Bündeln). */
  after?(outDir: string, input: CeloInput): GeneratedFile[];
}
```

`buildProjekcioj` ruft erst alle `generate`, bündelt die Make Kits, ruft dann alle `after` und hasht die Ergebnisse in `projekcioj.json` wie jede andere Datei. Der reine Kern bleibt testbar: `vitrinoHtml({ css, elementJs, datumoj })` ist eine Funktion ohne Dateizugriff, `after` liest nur die zwei Artefakte.

Der Parity-Schritt aus Spec 003 behält vorerst seinen eigenen Aufruf; wenn ein dritter Komponist entsteht, wandern beide in `after` (Vermerk im Complexity Tracking).

**Ausgabe:** `vitrino/index.html`, eine Datei, keine externen Ressourcen, byte-gleich bei gleichem Modelo.

### D-07 Inhalt und Daten der Vitrino (FR-06)

Zehn Abschnitte, in dieser Reihenfolge, jeder mit Überschrift und Tabelle statt reiner Farbfläche (axe, WCAG 1.4.1: Farbe ist nie die einzige Information):

1. **Kopf** – Aspekto-Wahl, sechs Dimensio-Schalter, Vergleichsschalter, Modelo-Version.
2. **Paletten** – je Rampe alle Stufen mit Tokenname, Hex und OKLCH-L, dazu die Kurve als erzeugtes SVG.
3. **Flächen** – die vier Rollen übereinander mit L-Wert und gemessenem Abstand zur Nachbarin.
4. **Texthierarchie** – `default`, `subtle`, `muted` auf jeder Fläche, mit Kontrastwert und Reserve.
5. **Status** – vier Status mit Fläche, Text und Rand.
6. **Aktionen** – drei Varianten × zwei Tonarten in allen sechs Zuständen.
7. **`butono`** – echtes `fm-butono`, alle Varianten × Tonarten × Größen × Zustände.
8. **Kontrastmatrix** – jede KontrastParo der aktuellen Kombination mit WCAG-Wert, Schwelle, Reserve, APCA-Wert (beratend) und Ergebnis.
9. **Regularo und Ziele** – jede Regulo mit Kialo und Ergebnis für die aktuelle Kombination (Verstöße mit Pfad), darunter die Aspiroj der gezeigten Marke mit Messwert, Sollwert und Kialo, klar als „Entwurfsziel" bezeichnet.
10. **Eigene Werte je Dimensio (G10)** – je Dimensio-Wert die Abdeckung `dimensio-kovrado` der gezeigten Marke: wie viele der umgesetzten Tokens die Marke selbst bestimmt (research §2.8). Ohne Wertung, als Zahl.

Die Zahlen rechnet der Build, nicht der Browser (sonst gäbe es eine zweite Kontrast-Implementierung, Art. VIII). Sie stehen als JSON-Insel im Dokument, aufgeteilt nach dem, was tatsächlich variiert (Datenmodell in [`data-model.md`](data-model.md)): Paletten je Aspekto, Rollen je Aspekto × Schema × Kontrast, Messungen und Regulo-Ergebnisse je Kombination.

### D-08 Umschalten und Gegenüberstellung (FR-07, FR-08)

- **Umschalten:** Die sechs Dimensioj sind Attribute am `<html>`-Element. Ein Klick setzt das Attribut, das CSS schaltet, dasselbe Ereignis blendet die passende Scheibe der JSON-Insel ein. Kein Framework, kein Nachladen. Damit ist die Vitrino zugleich der erste sichtbare Beleg für Etoso.
- **Gegenüberstellung:** Der Vergleichsschalter stellt zwei Aspektoj nebeneinander (zwei Spalten, jede mit eigenem `data-fm-aspekto` an ihrem Wurzelelement, damit dieselbe Seite beide Marken zeigt). Je Kriterium (die Metriken aus D-02, die WCAG-Bestehensquote, die kleinste Reserve und die Abdeckung je Dimensio) stehen beide Werte und die Kennzeichnung **vorn / gleich / hinten**. Aspiroj stehen dabei nie im Vergleich: Sie gehören einer Marke, ein Vergleich daraus wäre Geschmack gegen Geschmack. Kein Gesamturteil (das gehört zu FR-17 und damit zu Etappe B; die Vitrino hält sich schon jetzt daran).
- In Etappe A sind die beiden Seiten **komuna ↔ ekzemplo**. Die Auswahl ist nicht fest verdrahtet: sie listet die Aspektoj des geladenen Modelo, damit Etappe B nur ihr Paket hinzufügen muss.

### D-09 Prüfung der Vitrino (FR-09, AK-02)

| Eigenschaft | Prüfung | Ort |
|---|---|---|
| byte-gleich bei gleichem Modelo | zwei Builds, gleiche SHA-256 | `projekcioj` (Vitest) |
| keine externen Ressourcen | kein `http(s)://`, kein `src=`/`href=` auf eine Datei | `projekcioj` (Vitest) |
| keine handgepflegten Werte (FR-05) | kein Hex- und kein `oklch(`-Literal in der Vorlage; jede Farbe kommt aus dem Modelo | `projekcioj` (Vitest) |
| alle Inhalte aus FR-06 vorhanden | Abschnitte, Tabellenzeilen je Rolle und Paar | `projekcioj` (Vitest) |
| Umschalten ohne Neuladen | Attribute setzen, berechnete Farbe und Zahlen ändern sich | `eroj` (Playwright, Chromium) |
| Gegenüberstellung | zwei Spalten, beide Werte, Kennzeichnung | `eroj` (Playwright) |
| axe ohne Befund | `@axe-core/playwright` auf die fertige Datei, hell und dunkel, beide Kontraststufen | `eroj` (Playwright) |

Als Kommando: **`pnpm check:vitrino`** (Playwright-Konfiguration wie `check:make-kit` und `check:quickstart`), ein eigener CI-Schritt „Check: Vitrino". Begründung für einen eigenen Schritt statt Einbau in `check:alirebleco-eroj`: Der Lauf braucht einen vorherigen `fm projekcioj build` und misst eine andere Sache; getrennte Schritte sagen im CI-Protokoll, was kaputt ist (und Phase 3 hat gezeigt, was passiert, wenn schwere Läufe im Test-Gate stehen).

### D-10 Clean-Room-Fingerprints mit Herkunft (FR-15, vorbereitend)

Die Prüfung kennt heute eine Liste. Sie bekommt mehrere, jede mit Herkunft:

```jsonc
{ "source": "komparo", "fingerprints": ["<sha256>", "…"] }   // neue Form
{ "fingerprints": ["<sha256>"] }                              // alte Form, Herkunft "repo"
```

- Quellen: die eingebaute Liste des Repos, `--spuroj <datei>` (mehrfach) und `markoSpuroj: [...]` in `fundamento.config.json`, damit CI und Projekte sie ohne Flag nutzen.
- Ein Fund nennt die Herkunft im Text und behält die Regel-ID `clean-room-marko-spuro`.
- Fehlt eine genannte Datei, ist das ein Fehler der Prüfung (`file-missing`), kein stilles Überspringen.
- Negativtest: eine Fixture pflanzt einen Test-Fingerprint einer erfundenen Marke in eine Datei des Prüfbaums; erwartet wird genau ein Fund mit dieser Herkunft. Ein zweiter Fall prüft, dass ohne die Zusatzliste nichts gefunden wird.

Etappe B liefert danach nur noch ihre Datei; das Kern-Repo sieht weiterhin keinen einzigen fremden Wert.

### D-11 Constitution v1.7 (FR-19)

Art. V erhält den Absatz „Benchmark-Aspekto" im Wortlaut aus FR-19. Dazu:

- Änderungshistorie: `v1.7 (Spec 004) Art. V Benchmark-Aspekto: Import fremder Systeme als eigene Aspektoj in getrennten Repos, Kern erhält nur Kennzahlen und Fingerprints`.
- Kein Jugxo nötig: Art. V wird **erweitert**, nicht gebrochen. Der Satz „Quellmaterial anderer Systeme wird dem Coding-Tool nicht vorgelegt" bleibt wörtlich stehen und gilt weiter für jede Sitzung am Kern-Repo – diese Sitzung eingeschlossen.
- Ein Dokumenttest hält die Version, den neuen Absatz und den Historieneintrag fest.

### D-12 Metriken als eigenes Modul (Art. XI)

`packages/modelo/src/metrikoj/` bündelt die zehn Messungen als reine Funktionen mit stabilen IDs (`wcag2-reserve`, `oklch-l-delta`, `oklch-l-extreme`, `oklch-l-step`, `oklch-l-align`, `srgb-gamut`, `type-scale-ratio`, `type-scale-consistency`, `type-rhythm`, `dimensio-kovrado`). Vier Nutzer, eine Rechnung:

1. die Regulo-Durchsetzung (`validate`), 2. die Prüfung der Aspiroj (dieselbe Rechnung, andere Schranke), 3. die Vitrino (Zahlen im Dokument), 4. der Bericht aus Etappe B.

Ohne dieses Modul gäbe es die Rechnung dreimal; mit ihm nennt jede Anzeige dieselbe Zahl wie die Prüfung.

### D-13 Rot zuerst, mit dem Repo als Fixture

Für die Reguloj ist der rote Lauf besonders einfach und besonders ehrlich: Die Regulo wird eingeführt, die Prüfung läuft über das eigene Modelo und **schlägt fehl** – mit genau den drei Befunden aus research §2. Erst danach ändern sich Werte. Für die Metriken gibt es zusätzlich Fixtures mit erfundenen Rampen, damit auch die Grenzfälle (Gleichstand, Ausreißer, Alpha-Rampe) rot laufen, bevor sie grün sind.

### D-14 Begriff für das Entwurfsziel einer Marke (Vorschlag, Entscheidung offen)

`Celo` ist vergeben (Ausgabeziel einer Projekcio, Art. XII), ein zweites „Ziel" daneben würde die Sprache unscharf machen. Vorschlag und Alternativen:

| Vorschlag | Bedeutung | prefLabel de / en | Feld | Bewertung |
|---|---|---|---|---|
| **`Aspiro`** (Empfehlung) | etwas, das man sich selbst vornimmt | Entwurfsziel / brand aspiration | `aspekto.json#/aspiroj` | eigener Wortstamm, keine Kollision, kurz, im Deutschen und Englischen sofort verständlich; „verfehltes Entwurfsziel" liest sich natürlich |
| `Intenco` | Absicht, Vorhaben | Absicht / intention | `#/intencoj` | näher an „Zweck" als an „messbare Latte"; verwechselbar mit der Absicht eines Ero (`intents` im Skemo) |
| `Promeso` | Versprechen | Versprechen / promise | `#/promesoj` | schönes Bild („die Marke verspricht sich selbst etwas"), aber wertender Ton in einer Prüfmeldung |
| `Strebo` | Streben | Streben / striving | `#/streboj` | korrekt, im Deutschen sperrig |

Der Plan schreibt durchgehend **Aspiro**; fällt die Entscheidung anders, ist es eine Umbenennung an vier Stellen (Ontologio, Aspekto-Schema, Prüfmeldung, Vitrino). Eintrag in der Ontologio unter `inScheme: modelo` – wie `Regulo` und `KontrastParo`, also **ohne** Änderung der Terminologie-Tabelle der Constitution.

Offene Frage an den Maintainer: Soll **Fluida Marko** als Grundsatz ebenfalls in die Ontologio (und später in die Constitution), oder bleibt es die Begründung in dieser Spec?

---

## Projektstruktur (Delta zu Phase 3)

```
packages/modelo/
├─ src/metrikoj/                      NEU: zehn Metriken, reine Funktionen (D-12)
├─ src/validate/color-reguloj.ts      + Durchsetzungen (contrast-reserve, surface-distinct, palette-*)
├─ src/validate/token-rules.ts        + srgb-gamut, type-scale, type-rhythm
├─ src/validate/aspiroj.ts            NEU: Prüfung der Aspiroj je Aspekto (D-03)
├─ schema/modelo.schema.json          + AspektoAspiro (aspekto.json#/aspiroj)
├─ data/ontologio.json                + Begriff Aspiro (inScheme: modelo, D-14)
├─ src/checks/clean-room/             + Fingerprintquellen mit Herkunft (D-10)
├─ data/reguloj.json                  + acht Reguloj mit Kialo und Sojlo
packages/vortaro/sets/core.json       komuna 2: ankernahe neutrale Stufen, Flächenrollen, Status
packages/aspekto-komuna/aspekto.json  + aspiroj (vier Ziele mit Kialo)
packages/aspekto-komuna/sets/aspekto/komuna+color-scheme/dark.json   eigener Dunkelmodus, 57 Werte
packages/modelo/test/fixtures/valid/aspekto-ekzemplo/                ekzemplo zieht nach
packages/projekcioj/src/celoj/vitrino/   NEU: Vorlage, Daten, SVG-Kurve, after-Phase
packages/eroj/test/vitrino.check.ts      NEU: axe, Umschalten, Gegenüberstellung
.github/workflows/ci.yml                 + Schritt „Check: Vitrino"
.specify/memory/constitution.md          v1.7 (Art. V)
```

## Abhängigkeiten

Keine neuen. Genutzt werden `colorjs.io` (bereits für OKLCH und APCA), Playwright und `@axe-core/playwright` (bereits für die gerenderten Prüfungen), Vitest, Turborepo.

## Prüfung gegen die Constitution (nach dem Entwurf)

| Artikel | Ergebnis |
|---|---|
| I Modelo-First | Vitrino und Kennzahlen kommen aus dem Modelo; kein Wert wird in der Vorlage gepflegt (durch Test gesichert) |
| II Unu Vortaro | keine neuen Rollen; neue Palettenstufen folgen der bestehenden Namensregel |
| III Maschinenlesbarkeit | die Kennzahlen sind Daten (JSON-Insel, später Bericht), die Anzeige ist eine Projektion davon |
| IV Mehrmarkenfähigkeit | jede Regulo gilt für jede Aspekto; was nur komuna will, ist eine Aspiro und bindet niemanden („Fluida Marko", D-03); die Folgen für ekzemplo und ciferecigo sind eingeplant (D-05) |
| V Clean Room | keine Fremdquelle in dieser Sitzung; die Fingerprint-Prüfung wird stärker (D-10); v1.7 schreibt das Verfahren fest (D-11) |
| VI Regeln mit Gründen | sieben Reguloj und vier Aspiroj, jede mit Kialo aus einem gemessenen Befund; „Befund wird Regel" ist hier wörtlich der Weg – und wo der Befund Geschmack ist, wird er Aspiro statt Regel |
| VII Agentische Dokumentation | der Gvidanto kann nach der Etappe zusätzlich beantworten: „Wie gleichmäßig ist die Palette?", „Wie viel Reserve hat dieses Paar?" – über `explain_regulo` der neuen Reguloj |
| VIII Web-first, Internacia | die Vitrino ist eine HTML-Datei ohne Server; Zahlen werden gerechnet, nicht im Browser nachgebaut |
| IX Vertikaler Durchstich | die Etappe vertieft die vorhandene Schicht, sie verbreitert nichts |
| X Kontrolle | jede neue Regulo ist automatisch; die Vitrino hat eine eigene Prüfung; rot zuerst (D-13) |
| XI Einfachheit | kein neues Paket, keine neue Abhängigkeit, ein Metriken-Modul statt drei Rechnungen |
| XII Interoperabilität | die Vitrino nutzt CSS-Celo und Make-Kit-Bundle, statt eine zweite Projektion zu bauen |
| XIII Einfachheit der Nutzung | eine Datei, ein Doppelklick; der Quickstart beschreibt genau das |

## Complexity Tracking

| Punkt | Warum | Schuld / Nachlauf |
|---|---|---|
| **Zweite Celo-Phase (`after`)** | Die Vitrino braucht Artefakte anderer Celoj (CSS, Element-Bundle). | Der Parity-Schritt aus Spec 003 bleibt vorerst ein Sonderaufruf; beim dritten Komponisten zusammenführen. |
| **JSON-Insel bis ~200 KB** | Der Browser soll nichts nachrechnen (Art. VIII). | Wenn die Datei zu groß wird: Messungen auf die sichtbare Kombination beschneiden und beim Umschalten nachrechnen – dann aber im Build, nicht im Browser. |
| **Achter CI-Schritt** | Gerenderte Prüfungen brauchen Browser und einen vorherigen Build. | CI-Zeit steigt um etwa eine Minute; Phase 3 hat gezeigt, dass schwere Läufe außerhalb des Test-Gates gehören. |
| **Werte in `core.json` statt im Aspekto-Paket** | komuna ist die Referenz; ihre Werte liegen historisch im Kern-Vortaro. | Unverändert aus Phase 1; die Trennung „Kern = Rollen, Aspekto = Werte" bleibt ein Thema für Phase 7. |
| **ciferecigo außerhalb** | Privates Paket, eigener Ort. | Nachlauf nach dem Merge, wie Spec 003 T028; bis dahin ist ciferecigo gegen die neuen Reguloj ungeprüft. |
| **Neuer Begriff `Aspiro`** | Ohne zweite Ebene würde jede Entscheidung von komuna zur Pflicht für jede Marke. | Ein Begriff mehr in Ontologio und Schema; die Terminologie-Tabelle der Constitution bleibt unberührt (D-14). Fällt die Namenswahl anders aus, ist es eine Umbenennung an vier Stellen. |
| **Aspiro-Verstoß ist ein Fehler** | Ein selbst gesetztes Ziel soll nicht unbemerkt verloren gehen. | Wer ein Ziel aufgibt, muss es sichtbar in `aspekto.json` streichen oder senken; das ist gewollt, aber es kann sich bei fremden Marken wie eine Vorschrift anfühlen. Bei Bedarf auf `warning` umstellbar. |
| **57 eigene Dunkelwerte** | komuna bestimmt seinen Dunkelmodus selbst (G9). | Mehr Werte zu pflegen; die generische Umsetzung bleibt für alle anderen Marken der bequeme Weg. |
| **Etappe B offen** | Import und Bericht laufen in einer eigenen Sitzung. | Die vier Schnittstellen aus D-01 sind festgelegt; ändert Etappe B daran etwas, ist es ein Jugxo. |

## Reihenfolge (Orientierung, keine Aufgaben)

1. Constitution v1.7 und Dokumenttest.
2. Metriken-Modul mit Fixtures.
3. Sieben Reguloj, rot über das eigene Modelo und über Fixtures.
4. Aspiroj: Begriff, Schema, Prüfung, getrennte Ausgabe, Negativtest.
5. komuna 2 und ekzemplo grün.
6. Vitrino: Gerüst, Abschnitte, Daten, Umschalten, Gegenüberstellung.
7. Prüfung der Vitrino, CI-Schritt.
8. Fingerprintquellen mit Herkunft und Negativtest.
9. README, Vojmapo, Quickstart, Nachverfolgbarkeit.

## Nachverfolgbarkeit (Anforderung → Entwurf → Aufgaben)

| Anforderung | Entwurf | Aufgaben |
|---|---|---|
| FR-01 | D-02, D-04 | T003, T004, T005, T006 |
| FR-02 | D-03, D-12 | T002, T003, T004, T005 |
| FR-03 | Clean-Room-Hinweis im Kopf, D-13 | gilt für alle Aufgaben |
| FR-04 | D-05 | T006, T015 (Nachlauf ciferecigo, nach dem Merge) |
| FR-05 | D-06 | T007, T008 |
| FR-06 | D-07 | T008, T009, T010 |
| FR-07 | D-08 | T011 |
| FR-08 | D-08 | T011 |
| FR-09 | D-06, D-09 | T007, T012 |
| FR-15 (vorbereitend) | D-10 | T013 |
| FR-19 | D-11 | T001 |
| AK-01 | D-02, D-03, D-04, D-05 | T003, T004, T005, T006 |
| AK-02 | D-07, D-09 | T007 – T012 |
| AK-06 (Teil) | D-10 | T013 |
| AK-08 | D-11 | T001 |
| AK-09 (Teil) | D-07, D-08 | M1 |
| FR-10 – FR-14, FR-16 – FR-18, AK-03 – AK-05, AK-07 | **Etappe B** | nicht in diesem Plan |

## Manuelle Abnahme (Maintainer, nach dem PR)

- **M1 – komuna 2 im Blick:** Der Maintainer öffnet die Vitrino, schaltet alle sechs Dimensioj durch und beurteilt komuna 2 visuell; dann die Gegenüberstellung komuna ↔ ekzemplo. Jeder Befund, den keine Prüfung gefunden hat, wird Regulo-Kandidat mit Kialo (Art. VI) und geht in die nächste Runde.

Ergebnisse kommen in diesen Plan unter „Ergebnisse der manuellen Abnahme".

## Ergebnisse der manuellen Abnahme

**Stand:** offen, nach der Umsetzung.
