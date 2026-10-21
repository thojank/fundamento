# Briefing P0 – Nachlese 7: Rückmeldung aus Arkitekturo (0.1.0 im Einsatz) – 2026-10-20

- **Von:** Claude, im Auftrag des Maintainers.
- **Regel 0** gilt.
- **Ablage:** `specs/021-nachlese-7/`. Dieses Briefing ist die Spec und wird unverändert als `briefing.md` kopiert; plan.md und tasks.md kommen dazu.
- **Nummern:** 020 ist für die Sxablonoj reserviert.
- **Quelle:** Kandidaten- und Nutzungsdatei aus Arkitekturo. Sie sind nur Anforderung, kein Code wird übernommen.
  - `/Users/thorstenjankowski/n8n-compose/20261014_arkitekturo/packages/ui/KANDIDATEN-FUER-FUNDAMENTO.md`, Abschnitt „Lücken in vorhandenen Eroj“
  - `/Users/thorstenjankowski/n8n-compose/20261014_arkitekturo/docs/fundamento-nutzung-0.1.0.md`, Abschnitt „Wo Guideline oder Element anders geantwortet haben“
- **Basis:** `main` nach dem Nachtrag-PR zu Spec 019.
- **Zwei PRs:**
  - ① Fehler → Release **0.1.1**, Branch `261020-nachlese-7-fehler-<suffix>`, von `main`
  - ② Ergänzungen → Teil von **0.2.0**, Branch `261020-nachlese-7-ergaenzungen-<suffix>`, gestapelt auf ①
- Rote Tests zuerst.
- Kein neues Ero, keine Token-Änderung, keine neue Regulo.

**Arkitekturo-Vertrag (ab 0.1.0):** Keine Umbenennung von Props, Slots, Achsen, Ereignissen oder Tags, die die Nutzungsdatei nennt. Eine Ergänzung darf Bestehendes nicht brechen.

## ① Fehler (0.1.1)
1. **A-1 `dialogo` zeigt `message` nie an.**
   - Die Regel `:has(slot:not(:empty))` prüft den `<slot>` selbst. Die Sichtbarkeit muss an den zugewiesenen Knoten hängen: die JS-Sichtbarkeit aus `#filled("message")`, die das Element schon setzt.
   - Prüfe alle Eroj auf dasselbe Muster (`slot:not(:empty)`, `slot:empty`) und behebe es dort gleich.
   - **Roter Test im Browser:** Ein `dialogo` mit `message` zeigt den Satz sichtbar, und `aria-describedby` zeigt auf sichtbaren Text.
2. **A-2 `menuo` wirft bei `document.createElement`.**
   - Kein Attribut am Host im Konstruktor; die Anker-Kennung kommt erst in `connectedCallback`.
   - Prüfe **alle 32** Eroj mit einem Test: `document.createElement(tag)` wirft nicht, danach `append` und Rendern funktionieren.
3. **A-3 Guidelines ≠ Element:**
   - `langetaro.md` (Slot `tabs`) und `navigado.md` (Slot `items`) beschreiben die Form des Elements: Kinder ohne `slot` bzw. direkte `<a>`-Kinder.
   - Ein Test vergleicht jedes Markup-Beispiel der Guidelines mit dem Element. Jedes Beispiel muss rendern, ohne dass ein Kind unsichtbar bleibt.
4. **A-4 Widersprüchliche Doppel in `Guidelines.md`:**
   - „Every confirmation … is a `<Dialogo>`“ und „… is a `<Sxvebilo>`“; „A choice of one among many … `<Elektilo>`“ und „… `<Kompletigilo>`“.
   - Ursache in der Erzeugung aus den use-instead-Regeln finden. Je Ziel darf nur **ein** Satz entstehen, der das richtige Ero nennt.
   - Ein Test verbietet zwei Sätze mit gleichem Anfang und verschiedenem Ero.
   - Prüfe, ob der Gvidanto dieselbe Doppelung hat (gleiche Quelle). Wenn ja, alle Dialoge vorher und nachher, mit Jugxo bei Kippung.
5. **A-5 `tekstareo.md`:** Die Beispiele zu Hilfe und Fehler zeigen die Slots `help` und `error` wirklich. Der Beispiel-Test aus A-3 deckt das mit ab.
6. **A-6 `tabelo` überschreibt eine vorhandene native `<caption>`:** Ist der Slot leer, gilt die vorhandene Caption.
7. **A-7 `avizo` nach `dismiss`:** Guideline und Uzo sagen, dass das Element sich versteckt und nicht entfernt. Die Anwendung entfernt es, wenn sie will; das kommt als Beispiel in die Guideline. Keine Verhaltensänderung, weil der Vertrag gilt.
8. **Release-Vorbereitung 0.1.1:**
   - Alle Paketversionen und die Modelo-Version auf `0.1.1`.
   - CHANGELOG-Abschnitt „0.1.1 – Fehlerbehebungen“ mit A-1 bis A-7.
   - Die CJS-Entfernung bleibt bei 0.2.0.
   - Veröffentlicht wird erst nach der Abnahme durch den Maintainer, über `release.yml` (dry-run, dann publish).

## ② Ergänzungen (0.2.0, nur additiv)
| # | Ero | Ergänzung | Fall in Arkitekturo |
|---|---|---|---|
| B-1 | `titolo` | `focusable` (boolesch): `tabindex=-1` an der Überschrift im Shadow DOM, `focus()` fokussiert sie | Fokus nach Routenwechsel auf die `h1` |
| B-2 | `mezurilo` | `label-hidden` wie `caption-hidden` bei `tabelo`; der Name bleibt für Screenreader | Meter in Tabellenzellen |
| B-3 | `tabelo` | Slot `empty` nimmt auch `butono` (nächster Schritt; Regel empty-state-says-what-next) | Leerzustand mit Aktion |
| B-4 | `menuo` | `disabled`: Auslöser gesperrt, `aria-disabled` | Zeile während eines Schreibvorgangs |
| B-5 | `avizo` | `details` nimmt `teksto kind=code` und eine Liste (`ul`/`ol` mit Text) | Validierungsfehler mit Pfad |
| B-6 | `dialogo` | Slot `content` nimmt auch `avizo`; der erste Fokus geht auf das erste **fokussierbare** Kind | Problemhinweis im Formular-Dialog |
| B-7 | `dialogo` | Enter in einem Feld im `content` löst `confirm` aus, solange keine Sperre greift (`reason=required` leer, ungültiges Feld) | Metadaten-Dialog |
| B-8 | `dialogo` | `message` darf mehrere Absätze aus `teksto` haben | „Befund verwerfen“ mit Fundstelle |
| B-9 | `saltligilo` | Das Ereignis `click` lässt sich abbrechen (`preventDefault` → nur Fokus, kein Fragment), dokumentiert; dazu die Option `focus-only` | Hash-Router |
| B-10 | `teksto` | gemischter Fließtext: `ligilo`, `insigno` und `teksto kind=code` als Kinder (phrasing content). Die Guideline sagt das, und `check_usage` erlaubt es | Absätze mit Badge und Link |

Jede Ergänzung bekommt:
- Skemo- und Uzo-Eintrag
- Guideline
- Vitrino-Zeile, wo sichtbar
- Figma, wo es ein sichtbares Teil ist (B-2, B-4)
- einen Gvidanto-Dialog, wo eine Frage neu beantwortbar wird

**Nicht ändern:** `insigno` ohne Brand-Ton. Das ist eine Entscheidung, keine Lücke (Grenze `brand-badge` bleibt).

## Abnahme
- **①:** Der Maintainer öffnet in der Vitrino einen `dialogo` und sieht den Erläuterungssatz. Ein Test belegt, dass alle 32 Eroj über `createElement` erzeugt werden können. Kein Guideline-Beispiel lässt ein Kind unsichtbar. `Guidelines.md` hat keine Doppel mehr.
- **②:** Je Ergänzung ein Browser-Test. Die Nutzungsdatei von Arkitekturo bleibt gültig (kein Bruch).
- **Danach:** P0 schreibt in plan ① einen Hinweis für Arkitekturo, welche Umwege dort entfallen können. Es gibt keinen Codetransfer; Arkitekturo entscheidet selbst.

## Bericht (je PR)
```
PR <nr> – Nachlese 7 ①/② – Branch – HEAD – CI (Dauer)
Geändert / gefundene Muster (A-1, A-2 in weiteren Eroj) / gekippte Dialoge mit Jugxo / Abweichungen / Befunde / Offen
```
