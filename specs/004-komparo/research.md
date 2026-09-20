# Research – Spec 004, Etappe A

**Stand:** 2026-09-20 · **Gilt für:** Etappe A (komuna 2, Vitrino, Constitution v1.7, Clean-Room-Fingerprints) · **Clean Room (Art. V):** Für diese Sitzung wurde nichts von Adobe Spectrum geöffnet, geladen oder installiert. Gelesen wurde allein [`research/benchmark-spectrum.md`](../../research/benchmark-spectrum.md) (Konzepte und Kennzahlen, keine Werte, keine Namen). Alle Zahlen unten stammen aus Fundamentos eigenen Daten, gemessen mit Fundamentos eigenen Funktionen.

## 1. Wie gemessen wurde

Alle Kennzahlen dieser Datei sind mit den bestehenden Funktionen des Repos berechnet, nicht mit Fremdwerkzeugen:

- `loadModelo(defaultModeloSource())` für komuna, `projectModeloSource(<ekzemplo-config>)` für komuna + ekzemplo;
- `evaluateAlirebleco(modelo, { collect: true })` für jede KontrastParo × Kombination (63 Paare × 72 Kombinationen = 4 536 Messungen je Aspekto);
- `oklchLightness(value)` für jede OKLCH-Helligkeit;
- `buildRezolvojJson(modelo)` für die aufgelösten Rollen je Kombination.

Wiederholbar: die Messung wird in Etappe A als Skript `packages/modelo/src/metrikoj/` festgeschrieben (T002), damit Plan, Vitrino und späterer Bericht dieselben Zahlen verwenden.

## 2. Ist-Stand komuna (2026-09-20, vor komuna 2)

### 2.1 Kontrast-Reserve

Reserve = `wcagWert / bindendeSchwelle − 1`. Gemessen über alle 4 536 Messungen; der Median liegt bei **+109 %**, das Minimum bei **+3,6 %**.

| Rang | Reserve | Wert / Schwelle | Kombination | KontrastParo |
|---|---|---|---|---|
| 1 | +3,6 % | 7,25 / 7 | `contrast=high`, `color-scheme=light` | `status-success-on-basic` |
| 2 | +4,2 % | 4,68 / 4,5 | `contrast=default`, `color-scheme=light` | `text-muted-on-background-sunken` |
| 3 | +7,3 % | 7,51 / 7 | `contrast=high`, `color-scheme=light` | `status-info-on-basic` |

36 der 4 536 Messungen liegen unter +5 %, 54 unter +10 %. Betroffen sind genau drei Paare; alle drei im hellen Farbschema. Der kleinste Wert im dunklen Schema liegt bei +10,3 %: die schwache Stelle ist heute **hell**, nicht dunkel.

### 2.2 Flächenfolge

OKLCH-Helligkeit der vier Flächenrollen (Standard-Dichte, -Viewport, -Motion, `contrast=default`):

| Aspekto / Schema | sunken | canvas | default | raised | Abstände |
|---|---|---|---|---|---|
| komuna / light | 0,945 | 0,975 | **1,000** | **1,000** | 0,030 · 0,025 · **0,000** |
| komuna / dark | **0,000** | **0,000** | 0,200 | 0,280 | **0,000** · 0,200 · 0,080 |
| ekzemplo / light | 0,945 | 0,975 | 0,997 | 0,997 | 0,030 · 0,022 · **0,000** |
| ekzemplo / dark | 0,169 | 0,169 | 0,200 | 0,280 | **0,000** · 0,031 · 0,080 |

Zwei Befunde, beide in beiden Aspektoj:

1. **Zwei Flächen fallen zusammen.** Hell sind `background.default` und `background.raised` identisch, dunkel `background.sunken` und `background.canvas`. Die Regulo `surface-order` verlangt heute nur die Reihenfolge (`≤`), keinen Abstand; Gleichstand besteht sie.
2. **Reine Endpunkte als Fläche.** komuna nutzt hell reines Weiß (L = 1,000) und dunkel reines Schwarz (L = 0,000). Damit ist der Dunkelmodus an den Flächen eine Spiegelung, kein eigener Entwurf; für Text auf Schwarz verschenkt es Reserve und auf OLED-Geräten ist reines Schwarz unruhig.

Der Befund „sunken ohne Tiefe" ist aus Phase 3 bekannt (Q4, mit Anforderung in `docs/vojmapo.md` für Phase 7 vermerkt); Etappe A löst ihn früher, weil die Vitrino ihn sichtbar macht.

### 2.3 Dunkelmodus heute

Der generische Satz `color-scheme/dark` setzt 74 Rollen um, `color-scheme/dark+contrast/high` weitere 31. komuna selbst trägt im Satz `aspekto/komuna+color-scheme/dark` **genau einen** eigenen Wert (`color.palette.neutral.950`). Der Dunkelmodus ist damit heute eine gemeinsame Umsetzung der Rollen für alle Marken, keine Abstimmung je Marke. Das ist besser als eine Invertierung, aber weniger als ein eigener Entwurf.

### 2.4 Paletten

Sieben Rampen, 72 Palettentokens. `shade` ist eine Alpha-Rampe (transparentes Schwarz, L = 0 in allen Stufen) und aus jeder Helligkeitsmessung auszunehmen.

| Rampe | Stufen | ΔL je 100 Stufeneinheiten (min … max) | max/min |
|---|---|---|---|
| accent, success, warning, info | 50 … 950 (11) | 0,055 … 0,160 | 2,91 |
| danger | 50 … 950 (11) | 0,058 … 0,160 | 2,76 |
| neutral | 0 … 1000 (13) | 0,050 … 0,400 | 8,00 |
| shade | 0 … 50 (4, Alpha) | – | – |

Die Rampen sind **streng monoton** und untereinander **eng ausgerichtet**: bei gleicher Stufennummer weichen die Helligkeiten der fünf Buntrampen um höchstens 0,013 voneinander ab. Die Ausreißer entstehen an zwei Stellen: der Sprung 900 → 950 ist ein halber Schritt (deshalb 0,160 je 100 Einheiten) und die neutralen Endpunkte 0 und 1000 sind reines Weiß und Schwarz (0,400).

### 2.5 Typografie

Größenskala (px): 12 · 14 · 16 · 18 · 20 · 24 · 28 · 32 · 40 · 48 · 56 · 64. Verhältnisse benachbarter Stufen: 1,111 … 1,250, ohne dokumentiertes Verhältnis. Zeilenhöhen fallen mit der Größe (body 1,5 · label/headline 1,25 · display 1,1), Laufweite ist 0 bis Stufe 800 und wird darüber negativ (−0,4 bis −1 px), `caps` +0,6 px. Beides folgt einer Regel, die nirgends aufgeschrieben ist.

### 2.6 Gamut

Alle 72 Palettenwerte liegen im sRGB-Gamut (keine Komponente außerhalb 0 … 1). Das ist heute wahr und nirgends geprüft.

### 2.7 Dimensioj

Alle sechs Dimensioj tragen echte Werte: `contrast=high` setzt 31 Rollen um (dunkel) bzw. eigene Sätze hell, `density` und `viewport` setzen Abstände und Bedienelementgrößen um, `motion=reduced` setzt jede Dauer auf den Sofort-Schritt. Geprüft sind sie heute über `density-affects-layout-only`, `motion-reduced-instant` und `dimensio-sets-alias-only`.

## 3. Ist-Stand ekzemplo (Folgen für FR-04)

| Kennzahl | komuna | ekzemplo |
|---|---|---|
| kleinste Reserve | +3,6 % | +4,1 % |
| Messungen unter +5 % | 36 | 54 |
| Flächen mit Abstand 0 | 2 (hell, dunkel) | 2 (hell, dunkel) |
| eigene Dunkelwerte | 1 Token | 1 Token |

Die drei engsten Paare von ekzemplo sind `status-success-on-basic` (+4,1 %), `text-muted-on-background-sunken` (+4,4 %) und `action-tertiary-text-on-action-tertiary-pressed` (+4,4 %). Jede neue Regulo trifft also beide Aspektoj im Repo; `ciferecigo` liegt außerhalb und wird nach dem Merge neu abgeleitet (wie Spec 003 T028).

## 4. Metriken, die Etappe A braucht

| Metrik | Definition | Heute |
|---|---|---|
| `wcag2-reserve` | `wcagWert / Schwelle − 1` je KontrastParo × Kombination | min +3,6 % |
| `oklch-l-delta` (Flächen) | Helligkeitsabstand benachbarter Flächenrollen | 0,000 an zwei Stellen |
| `oklch-l-extreme` | Abstand einer Flächenrolle zu reinem Weiß/Schwarz | 0,000 an vier Stellen |
| `oklch-l-step` | ΔL je 100 Stufeneinheiten innerhalb einer Rampe | 0,050 … 0,400 |
| `oklch-l-align` | Abweichung der Helligkeit gleicher Stufennummern zwischen Rampen | ≤ 0,013 |
| `srgb-gamut` | jede Komponente in 0 … 1 | erfüllt |
| `type-scale-ratio` | Verhältnis benachbarter Größenstufen | 1,111 … 1,250 |
| `type-rhythm` | Zeilenhöhe und Laufweite fallen monoton mit der Größe | erfüllt |

Die ersten fünf Metriken rechnen auf OKLCH; die Funktion `oklchLightness` existiert seit Spec 002 und wird wiederverwendet (keine zweite Farbmathematik, Art. XI).

## 5. Vitrino: technische Randbedingungen

- **Eine Datei ohne externe Ressourcen (FR-09).** Das CSS-Celo erzeugt bereits `css/fundamento.css` mit allen Aspektoj und Dimensioj; das Make-Kit-Bundle `make-kit/<aspekto>/dist/element.js` ist reines, React-freies JavaScript, das sich selbst registriert (Spec 003 F6). Beides wird in die HTML-Datei eingebettet, statt etwas Neues zu bauen.
- **Schriften.** Die CSS-Projektion nennt Schriftfamilien, liefert aber keine Dateien; die Vitrino bleibt damit ohne externe Ressource und zeigt die Systemersatzschrift. Für die visuelle Abnahme ist das ausreichend und ehrlich.
- **Zahlen im Dokument.** Kontrastwerte, Reserven und Regulo-Ergebnisse werden zur Bauzeit gerechnet und als JSON-Insel eingebettet; der Browser rechnet nichts nach (sonst gäbe es eine zweite Kontrast-Implementierung, Art. VIII). Größenordnung: 63 Paare × 72 Kombinationen ≈ 4 536 Einträge, mit kurzen Schlüsseln etwa 200 KB, dazu die Rollen- und Palettenwerte je Aspekto.
- **Umschalten ohne Neuladen (FR-07).** Die Attribute `data-fm-*` am `<html>`-Element schalten das CSS; dasselbe Ereignis blendet die passende Scheibe der JSON-Insel ein. Kein Framework, kein Netzwerkzugriff.
- **Byte-Gleichheit (FR-09).** Alle Listen werden kanonisch sortiert (Kombination, dann Paar, dann Token); Zahlen werden mit fester Stellenzahl formatiert, wie in `truncate2` der Alirebleco-Prüfung.
- **axe ohne Befund (FR-09).** Die Vitrino braucht Überschriftenstruktur, Tabellen mit `caption` und `th`, beschriftete Bedienelemente und eine Textalternative für jede Farbfläche: eine Farbe darf nie die einzige Information sein (WCAG 1.4.1), deshalb steht neben jedem Feld der Tokenname und der Messwert.

## 6. Clean-Room-Fingerprints für Benchmark-Aspektoj (FR-15, vorbereitend)

Heute kennt die Prüfung genau eine Fingerprintliste: `packages/modelo/src/checks/clean-room/marko-spuroj.json` (die Werte des privaten Aspekto ciferecigo aus Spec 001, nur als SHA-256). Etappe A verallgemeinert das auf mehrere Quellen mit Herkunft, ohne eine davon zu kennen:

- Eine Fingerprintdatei nennt ihre Quelle: `{ "source": "komparo", "fingerprints": [...] }`. Die bestehende Form ohne `source` bleibt gültig (Herkunft dann `repo`).
- Weitere Dateien kommen über `--spuroj <datei>` (mehrfach) oder über das Projekt-`fundamento.config.json` (`"markoSpuroj": ["…"]`), damit CI sie ohne Flag nutzen kann.
- Ein Fund nennt die Herkunft: „ein Wert des Benchmark-Aspekto komparo steht in einer Datei, die ihn nicht tragen darf".
- Der Negativtest pflanzt einen Test-Fingerprint (ein Wert, der im Repo vorkommt und eigens dafür erfunden ist) und erwartet genau einen Fund mit dieser Herkunft.

Damit kann Etappe B ihre Fingerprintliste liefern, ohne dass der Kern je einen Wert sieht.

## 7. Quellen

Nur Normen und eigene Daten; kein Design-System-Material.

- WCAG 2.2 (W3C Recommendation, 2023-10-05), Erfolgskriterien 1.4.3, 1.4.6, 1.4.11, 1.4.1: https://www.w3.org/TR/WCAG22/
- CSS Color 4, OKLCH: https://www.w3.org/TR/css-color-4/#ok-lab
- APCA bleibt beratend (WCAG 3 hat sein Kontrastverfahren nicht festgelegt) – begründet in Spec 003 research §6.4 und Jugxo `jug_01M2XKF38358Z6WQH9KARYJ6F3`.
- Eigene Messungen dieses Repos, 2026-09-20, Abschnitte 2 und 3.
