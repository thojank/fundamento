# Spec 029 – Fonto Astryx: Grundlagen, Eigenschaften und Doku aus einem offenen System – mit Constitution Amendment v2.4

**Status:** Entwurf · **Constitution:** **Amendment v2.4** (Art. V, Art. VII, Terminologie, Governance) · **Erstellt:** 2026-10-23 · **Voraussetzung:** `main` nach #108 (`2e05a4f8`); ① setzt nach dem Merge von Spec 027 auf · **Zielpfad:** `specs/029-fonto-astryx/spec.md`

**Regel 0** gilt. **Keine Budgets anheben.** **Nichts wegwerfen:** Die heutige komuna bleibt vollständig erhalten.

## Entscheidungen des Maintainers (23.10., 21:56)
1. Die optische Grundlage und die Eigenschaften der Komponenten von **Astryx** (Meta, MIT) werden übernommen. Das spart die eigene Definition der Grundlagen.
2. **Schriften bleiben unsere.** komuna behält ihre Schriften. **provo** bekommt die Schrift von bluna (**Prata**, OFL).
3. komuna bekommt die Optik von Astryx `theme-neutral`.
4. Reihenfolge: a) Grundlagen und Foundation-Seiten, b) Eigenschaften der 40 Eroj, d) Aufbau der Doku je Komponente. **Templates kommen später** und sind nicht Teil dieser Spec.
5. Rechtlich: MIT. Copyright und Lizenztext von Meta werden mitgeführt (`THIRD_PARTY_NOTICES.md`). „Astryx“ und „Meta“ erscheinen im Produkt nicht, nur in der Herkunftsangabe.
6. Unser Aufbau bleibt: Namen auf Esperanto (Art. II), drei Ebenen des Vortaro (Art. IV), alle Prüfungen. Verletzt ein übernommener Wert eine Regulo, **gewinnt die Regulo**, und die Abweichung wird als Jugxo festgehalten.
7. Die heutige komuna bleibt als eigene Aspekto **`komuna-0-2`** erhalten und lässt sich weiter umschalten.
8. Bewertung von Agenten: Die Bewertung bleibt deterministisch (Etappe 11). Ein KI-Richter wird nicht übernommen.

## Constitution Amendment v2.4
**Geänderter Artikel:** Art. V – Pura Cxambro, mit Folgeänderungen in der Terminologie, in Art. VII und in der Governance.

**Grund:** Art. V verbietet bisher jede Übernahme aus fremden Systemen, auch aus solchen mit offener Lizenz. Der Clean Room schützt zu Recht vor proprietärem Material. Bei Systemen, deren Lizenz die Übernahme ausdrücklich erlaubt, verlangsamt er die Arbeit aber ohne Schutzwirkung. Der Maintainer hat am 23.10. entschieden, die Grundlagen aus einem solchen System zu übernehmen.

**Neuer Absatz in Art. V (nach „Benchmark-Aspekto“):**
> **Fonto (offene Quelle).** Ein Design System mit offener, permissiver Lizenz (MIT, Apache-2.0 oder gleichwertig) darf als **Fonto** übernommen werden: Werte, Skalen, Eigenschaften und Zustände von Komponenten, Anatomie, Muster und der Aufbau der Doku. Bedingungen:
> 1. **Gepinnt:** Jede Fonto ist auf eine Version festgelegt, mit Paketname, Version und Commit. Spätere Versionen werden nicht verfolgt, sondern nur durch eine neue Spec übernommen.
> 2. **Herkunft:** Die Fonto steht in `data/fontoj.json` mit Name, Lizenz, Copyright, Version, Commit und dem Umfang der Übernahme. Copyright und Lizenztext stehen in `THIRD_PARTY_NOTICES.md`. Jeder übernommene Wert trägt seine Herkunft (Art. VII).
> 3. **Eigenes Vokabular:** Bezeichner werden nicht übernommen. Namen folgen dem Vortaro (Art. II). Achsen und Werte heißen wie in Fundamento; wo Fundamento keine hat, werden sie neu benannt.
> 4. **Eigene Texte:** Texte der Doku werden neu geschrieben, nicht übersetzt oder kopiert.
> 5. **Regeln haben Vorrang:** Ein übernommener Wert, der eine Regulo verletzt, wird angepasst. Die Abweichung wird als Jugxo mit Bezug auf die Fonto festgehalten.
> 6. **Kein Trittbrett (Art. VI):** Name, Logo und Auftritt der Fonto erscheinen nicht im Produkt. Fundamento gibt sich nicht als die Fonto aus und wirbt nicht mit ihr.
> 7. **Schriften, Icons, Bilder und Logos** der Fonto werden nur übernommen, wenn ihre eigene Lizenz nachgewiesen ist. Ist sie ungeklärt, gilt die Markierung „Name gelesen, Lizenz ungeklärt“ (Art. VII).
>
> Für eine Fonto darf das Quellmaterial dem Coding-Tool vorgelegt werden, nur in der gepinnten Version. Für alles andere gilt der Clean Room unverändert: proprietäre Systeme, Style Guides von Firmen und Marken sowie Systeme ohne nachgewiesene offene Lizenz. Insbesondere dürfen die lokalen Testnachbauten fremder Marken weiterhin nie veröffentlicht werden.

**Terminologie:** neuer Begriff **Fonto** (Esperanto „Quelle“): ein Design System mit offener Lizenz, aus dem Fundamento gepinnt und mit Herkunftsangabe übernimmt.

**Art. VII (Herkunftsnachweis):** Jeder übernommene Wert hat als Herkunft die Fonto-ID und den Quellpfad (Datei, Schlüssel).

**Clean-Room-Prüfung:** Die Fingerprint-Prüfung gegen Benchmark-Aspektoj nimmt Werte mit gültigem Fonto-Nachweis aus. Für alle anderen bleibt sie unverändert.

**Migration:**
- `data/fontoj.json` und `THIRD_PARTY_NOTICES.md` anlegen; erste Fonto: Astryx, `@astryxdesign/core` und `@astryxdesign/theme-neutral` in der Version zu core **0.7.4**, Commit eintragen.
- Eine Prüfung `check:fontoj` meldet einen Fehler, wenn ein Wert mit Fonto-Herkunft auf eine Fonto ohne Eintrag oder ohne Lizenztext zeigt.
- Änderungshistorie in der Governance ergänzen.
- Der Benchmark Carbon (Art. V, Benchmark-Aspekto) bleibt unverändert.

## ① Grundlagen (erster PR, setzt auf main nach Spec 027 auf)
1. **komuna-0-2 erhalten:** Die heutige komuna wird unverändert als Aspekto `komuna-0-2` kopiert, mit allen Werten, Schriften und Ero-Tokens. Sie steht im Build mit allen Marken (`fundamento.cxiuj.config.json`) und lässt sich in Vitrino, Studio und Figma umschalten. Ein Paritätstest zeigt: `komuna-0-2` ist pixelgleich mit komuna vor dieser Spec.
2. **komuna nach theme-neutral:**
   - **Farbe:** Rollen für Fläche, Text, Icon, Rahmen, Akzent und Status, hell und dunkel, mit der Hierarchie der Flächen (Seite → Fläche → Karte → Overlay) und hohem Kontrast. Übernommen werden die Werte von theme-neutral, verteilt auf unsere Grundlagen und Rollen; Ero-Tokens bleiben Aliase.
   - **Typografie:** Skala über Basis und Verhältnis wie in der Fonto, inklusive Anpassung bei Touch und schmaler Breite. **Familien bleiben die von komuna.**
   - **Abstände, Elementgrößen, Radien, Elevation, Fokus, Motion:** Werte und Stufen der Fonto, in den Einheiten von Fundamento.
   - **Syntax-Farben** für kodbloko, falls die Fonto sie hat.
   - **Datenvisualisierung:** nicht Teil dieser Spec. Fehlt sie in der Fonto, wird ein Manko-Kandidat notiert.
   - Fundamentos Dimensioj bleiben (Farbschema, Kontrast, Dichte, Bewegung, Bildschirmbreite). Wo die Fonto für eine Dimension keine Werte hat, etwa für Dichte, leitet P0 sie aus der Skala ab und begründet das im plan.
3. **provo mit Prata:** Die Schriftfamilie von provo wird Prata (OFL), nach der Regel für Schriften in Art. V, mit Fallback. Die übrigen Werte von provo bleiben.
4. **Regeln gewinnen:** Alle Prüfungen laufen für alle Marken (komuna, komuna-0-2, ekzemplo, provo, provo-kompakta). Wo ein Wert der Fonto eine Regulo verletzt, wird er angepasst und als Jugxo festgehalten. **Liste dieser Jugxoj im Bericht.**
5. **Foundation-Seiten in der Vitrino**, mit eigenem Text und auch mit dem Lingvo-Schalter:
   - Tokens: alle Tokens, durchsuchbar, mit Ebene, Wert je Marke und Modus, Herkunft
   - Farbe
   - Elevation
   - Form (Radien)
   - Abstände
   - Typografie
   - Motion
   - Icons

   Gliederung und Art der Darstellung nach der Fonto, zum Beispiel Skalen als Muster, Paare hell/dunkel und Kontrastangaben. Jede Seite zeigt die gewählte Marke.

**Abnahme ①:**
- Der Maintainer vergleicht die Vitrino (komuna, hell und dunkel) mit der Fonto in theme-neutral. Urteil: „trägt die Optik der Fonto, mit unseren Schriften“.
- `komuna-0-2` ist pixelgleich mit der alten komuna.
- provo zeigt Prata.
- Alle Prüfungen sind grün; die Jugxo-Liste liegt vor.
- Die Foundation-Seiten sind vollständig.
- Figma mit allen Marken als Modi, in einer neuen leeren Datei.

## ② Eigenschaften der 40 Eroj
**②a – Abgleichstabelle (eigener PR, nur plan und Daten, kein Umbau; darf sofort starten):**
- Für jedes Ero das Gegenstück in der Fonto, mit Achsen, Werten, Größen, Zuständen, Anatomie, Slots, Verhalten (Tastatur, ARIA) und Mustern wie dem Grund für deaktivierte Elemente, dem gemeinsamen Status-Modell der Felder (Status und Ort der Meldung), der Zweck-Achse des dialogo und adaptiver Darstellung.
- Je Zeile ein Vorschlag mit Begründung: **übernehmen**, **anpassen** oder **behalten**.
- Achsennamen bleiben die von Fundamento, etwa `emphasis` statt `variant` (Art. II, v2.2). Nur Werte und Anzahl richten sich nach der Fonto.
- Eine zweite Liste nennt **Gattungen der Fonto, die Fundamento fehlen**. Sie ist der Stoff für Eroj-Runde 6 und wird hier nicht gebaut.
- Der Maintainer entscheidet Zeile für Zeile.

**②b – Umbau (nach der Entscheidung, gestapelt auf ①):**
- Die beschlossenen Zeilen werden umgesetzt: in Skemo, Uzo, Ero-Tokens, Web Component, React, Figma und Gvidanto.
- Neue Achsen und Werte bekommen Ero-Tokens für alle Marken.
- Die Vitrino-Befunde aus Spec 025 (glitilo, datelektilo, listelektilo, plurelektilo, signeto, lokredaktilo) werden dabei gelöst oder einzeln als offen gemeldet.
- signeto und insigno müssen in der Form unterscheidbar sein.

## ③ Aufbau der Doku je Ero (gestapelt auf ②b)
Jede Ero-Seite in der Vitrino bekommt diese Abschnitte, in dieser Reihenfolge, mit eigenem Text und dem Lingvo-Schalter:
1. Zweck
2. Wann nicht, mit Verweis auf das passende Ero
3. Anatomie: benannte Teile, Pflicht oder optional
4. Varianten und Größen
5. Zustände
6. Do/Don't
7. Barrierefreiheit: Rolle, Tastatur, ARIA und die **Kontrastmatrix je Zustand** aus unseren Prüfungen
8. Theming: Ero-Tokens je Teil, Variante und Zustand
9. Beispiele

Die Uzo-Daten im Modelo bekommen die dafür fehlenden Felder, etwa „Wann nicht“, Do/Don't und Tastatur. Der Check meldet eine Lücke als Fehler. Der Gvidanto liefert die neuen Felder aus (`get_ero`).

**Abnahme ② und ③:**
- Der Maintainer entscheidet die Abgleichstabelle.
- Vitrino und Figma zeigen die beschlossenen Eigenschaften.
- Jede Ero-Seite hat alle 9 Abschnitte.
- Alle Prüfungen sind grün, ohne angehobene Budgets.

## Nicht Teil dieser Spec
- Templates
- neue Gattungen (Eroj-Runde 6)
- Datenvisualisierung
- Icons: Das Ikonaro bleibt bei **Phosphor Icons** (MIT): komuna regular, ekzemplo fill, provo-kompakta light (Maintainer 23.10., 22:05). Das Icon-Set der Fonto wird nicht übernommen. Fehlen für neue Eigenschaften Namen im Ikonaro, kommen sie aus Phosphor.
- die Bewertungsschleife mit Agenten (Etappe 11)

## Auftrag P0
- **Vier PRs:**
  - ① von main, nach dem Merge von Spec 027
  - ②a von main, darf sofort starten
  - ②b gestapelt auf ①, nach der Entscheidung zu ②a
  - ③ gestapelt auf ②b
- Die Fonto liest P0 **nur in der gepinnten Version**: npm-Pakete `@astryxdesign/core` 0.7.4 und `@astryxdesign/theme-neutral` in der passenden Version sowie den Repo-Commit dazu. Es werden keine anderen Systeme und keine fremden Marken gelesen.
- Rote Tests zuerst, Bericht im bekannten Format, mit der Jugxo-Liste aus ①-4.
- Messanleitung im plan mit vollständigen Pfaden im Checkout `/Users/thorstenjankowski/n8n-compose/20260918_fundamento-ds`, `cd` und `file://`-Links. Plugin-Namen so, dass sie sich im Menü klar unterscheiden.
- ciferecigo kommt nirgends vor.
