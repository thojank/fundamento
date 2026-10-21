# Briefing P0 – Nachlese 8: Befunde der Abnahme Spec 020, Release 0.2.0 – 2026-10-21 (Nachtlauf)

- **Von:** Claude, im Auftrag des Maintainers.
- **Regel 0** gilt unverändert:
  1. Den Weg nehmen, den das Repo schon geht.
  2. Sonst die kleinste Änderung, festgehalten in plan.md.
  3. Nie Tokens, Regulo-Semantik oder die Constitution ändern.
  4. Nie eine Grenze aufweichen, um grün zu werden.
- **Ablage:** `specs/022-nachlese-8/`. Dieses Briefing ist die Spec und wird unverändert als `briefing.md` kopiert; plan.md und tasks.md kommen dazu.
- **Quelle:** das Abnahme-Ergebnis `/Users/thorstenjankowski/n8n-compose/20260918_fundamento-ds/.fundamento/spec020/ergebnis-2026-10-21.md` (Project: `specs/020-sxablonoj-1/ergebnis-2026-10-21.md`). Die Nummern der Befunde (G-1, F-8 …) stammen von dort.
- **Basis:** `main` nach dem Merge von #90 bis #94. **Erst prüfen:** `git log origin/main` muss den HEAD von #94 enthalten (`9fdb114` oder dessen Merge). Sonst nicht beginnen, sondern im Bericht melden.
- **Arkitekturo-Vertrag** (ab 0.1.0) gilt: keine Umbenennung von Props, Slots, Achsen, Ereignissen oder Tags.
- Rote Tests zuerst. Bericht je PR im bekannten Format.

## Entscheidungen des Maintainers (stehen fest)
- **Release 0.2.0** statt 0.1.1. 0.1.1 wird nicht veröffentlicht; ihr CHANGELOG-Abschnitt geht in 0.2.0 auf.
- Die Namen sxelo, pagxo, formularo, filtrilo, kodbloko, markdovido und redaktilo sind bestätigt.
- **G-1 wird vor 0.2.0 behoben** (PR ①).
- Die Regeltexte erscheinen in der Vitrino auf Deutsch (PR ③).

## Drei PRs
| PR | Inhalt | Branch | Basis | Release |
|---|---|---|---|---|
| ① | Gvidanto und Plugin-Name, Vorbereitung 0.2.0 | `261021-nachlese-8-gvidanto-<suffix>` | `main` | **0.2.0** |
| ② | Figma und Vitrino | `261021-nachlese-8-darstellung-<suffix>` | `main` | danach |
| ③ | Regeltexte deutsch | `261021-nachlese-8-germana-<suffix>` | `main` | danach |

② und ③ sind unabhängig von ①. Wenn sie dieselben Dateien berühren, stapeln und das im Bericht sagen.

## ① Gvidanto, Plugin-Name, 0.2.0
1. **G-1: falscher Freund im Wortinneren.**
   - „Ich brauche ein Formular für die Anmeldung“ ergibt heute avizo, weil „meldung“ in „Anmeldung“ trifft.
   - Ein Schlüsselwort trifft nur als ganzes Wort oder als **Ende eines Kompositums**, und als Kompositum-Ende nur, wenn der Rest davor selbst ein Wort ist. „Anmeldung“ ist kein „An“ + „Meldung“ im Sinn der Liste.
   - Prüfe, wie die vorhandenen Pins der falschen Freunde (Nachlese 6, „-karten“) gebaut sind, und nimm denselben Weg (Regel 0.1). Wenn der einfachste sichere Weg eine Liste von Ausnahmen ist, ist das in Ordnung. Dann gehört „Anmeldung“ hinein, und der Test listet alle Treffer im Wortinneren aus den Testsätzen, damit weitere sichtbar werden.
   - **Roter Test:** „Ich brauche ein Formular für die Anmeldung“ ergibt formularo. „Formular für die Anmeldung mit Token“ ergibt weiter formularo. „Zeig eine Meldung, dass gespeichert wurde“ ergibt weiter avizo.
2. **D-11: Füllwörter am Anfang.**
   - Die Sxablono-Erkennung am ersten Wort bleibt, wie beschlossen. Vorher werden Füllwörter am Satzanfang übersprungen: „ich brauche“, „ich möchte“, „ich will“, „wir brauchen“, „bitte“, „baue“, „bau mir“, „erstelle“, „zeig mir“, „mach“, „gib mir“, „I need“, „please“, „build“, „create“, „make“, „show me“.
   - Die Liste steht als Daten im Modelo und nicht im Code. Prüfe, ob es dafür schon einen Ort gibt (Regel 0.1).
   - **Roter Test:** Jeder Sxablono-Dialog aus Spec 020 bekommt eine Fassung mit „Ich brauche …“ und eine mit „Bitte …“, und alle treffen dasselbe Sxablono.
3. **F-1: Grenze drawer.**
   - „Seitenleiste, die von rechts hereinfährt“ ergibt heute navigado mit einer Link-Regel. Erwartet ist die Grenze aus Spec 020: eine Rückfrage (ask-human), weil es in Runde 1 kein Sxablono gibt und dialogo `drawer` eine Grenze ist.
   - Bewegungswörter (hereinfahren, einblenden, ausklappen, slide-in, drawer, off-canvas) zusammen mit Seitenleiste oder Panel gehen auf diese Grenze. „Seitenleiste mit Navigation“ ohne Bewegungswort bleibt navigado.
   - Alle Dialoge vorher und nachher vergleichen, jede Kippung mit Jugxo.
4. **F-13: Plugin-Name und Plugin-ID.**
   - Heute haben der normale Build und der Build mit `--config` dieselbe ID `fundamento-apply-plan` und denselben Namen. Figma führt dann den zuerst importierten Code aus.
   - Name **und** ID enthalten künftig die Marken des Builds. Beispiel: Name „Fundamento 0.2.0 (abc1234 · komuna, provo, provo-kompakta)“, ID `fundamento-apply-plan-<kurzer Hash der Aspekto-Liste>`. Der normale Build mit nur komuna behält die bisherige ID, damit vorhandene Importe weiter funktionieren.
   - **Roter Test:** Zwei Builds mit verschiedenen Aspekto-Listen haben verschiedene IDs und Namen. Zwei Builds mit derselben Liste haben dieselbe ID.
5. **Release-Vorbereitung 0.2.0:**
   - Alle Paketversionen und die Modelo-Version von `0.1.1` auf `0.2.0`.
   - Der CHANGELOG-Abschnitt „0.1.1“ wird zu „0.2.0“ zusammengeführt. Er nennt Nachlese 7 (Fehler A-1 bis A-8, Ergänzungen B-1 bis B-10), Spec 020 (fünf Sxablonoj, kodbloko, markdovido, `list_sxablonoj`, `get_sxablono`), Spec 019 und Nachlese 8 ①. Hinweis für Nutzer: Make Kit nur noch als ES-Modul (aus Nachlese 6).
   - **Dry-Run** von `release.yml` mit 0.2.0 grün, das Tag-Ergebnis muss `latest` sein. **Veröffentlicht wird nicht.** Das macht der Maintainer nach der Abnahme von ①.
   - In plan ① steht eine Messanleitung für den Maintainer mit vollständigen Pfaden und `file://`-Links. Sie enthält die Dialoge von G-1, D-11 und F-1 als fertigen Terminal-Block, der in `.fundamento/nachlese8/mess/` schreibt und mit `echo FERTIG` endet.

## ② Figma und Vitrino
1. **Sammlungs-Zuordnung unabhängig vom Build.**
   - Heute entscheidet das Plugin nach den Werten, ob ein Token in `fundamento` oder `aspekto` liegt. Ein Build mit anderer Marken-Liste verschiebt deshalb Variablen zwischen Sammlungen, und der Schutz bricht auf einer vorhandenen Datei ab („365 Variable(n) … aspekto → fundamento: 362“).
   - Die Zuordnung kommt künftig aus dem Vortaro: Was eine Aspekto belegen muss, liegt immer in `aspekto`, auch bei nur einer Marke.
   - Der Schutz bleibt: Eine Verschiebung in einer vorhandenen Datei bricht weiter ab. Sie entsteht nur nicht mehr durch die Wahl des Builds.
   - Für bestehende Dateien wie f10b-5 genügt der Bericht, eine Migration ist nicht verlangt. Nenne im Bericht, was mit f10b-5 passiert.
2. **F-8:** Der Rahmen „Sxablonoj“ (und jeder vergleichbare Schaurahmen) bekommt eine Fläche, die an die Oberflächen-Variable gebunden ist und mit hell und dunkel wechselt.
3. **F-9:** Jedes Sxablono steht in einem eigenen benannten Rahmen und hat sein Layout wie in der Vitrino bei „mittel“:
   - sxelo: Kopf mit Name und Nutzer in einer Zeile, darunter Navigation, Meldungen und Inhalt
   - pagxo: Titel mit Badges, rechts die Aktionen
   - filtrilo: die Felder in einer Zeile, darunter Aktionen und Trefferzahl
   - formularo: Spalte
   - redaktilo: Feld und Vorschau nebeneinander

   Das menuo im Beispiel ist **geschlossen**.
4. **F-10:** Die Namen der Regionen erscheinen nicht als sichtbarer Text. Sie stehen als Ebenennamen in Figma. Wo ein Platzhalter nötig ist, steht ein deutscher Beispielinhalt wie in der Vitrino.
5. **F-11:** redaktilo zeigt die Vorschau als markdovido daneben.
6. **F-12:**
   - kodbloko: Festbreiten-Schrift über die Code-Variable in Textgröße; die Varianten (`copyable` an/aus) unterscheiden sich sichtbar durch den Knopf „Kopieren“.
   - markdovido: zeigt ein Beispiel mit Absatz, Liste und Zitat.
   - Wenn eine Schrift-Variable für Code fehlt, ist das ein **Manko** und kein neuer Token.
7. **Vitrino:**
   - V-1: Abstand zwischen Titel und Badges in pagxo
   - V-2: In sxelo hat die Navigation denselben Einzug wie Kopf und Inhalt
   - V-3: sxelo nimmt in der Vitrino nicht die volle Bildschirmhöhe ein. In der Anwendung bleibt das Verhalten.
   - V-4: Die Vorschau des redaktilo beginnt auf Höhe des Feldes
   - V-5: Das Beispiel des kodbloko ist ein echter Befehl
   - V-6: Das Beispiel des markdovido zeigt Überschrift und Tabelle
8. **Aus der Sammlung:**
   - F-5: Einzug verschachtelter Listen im markdovido
   - F-6: Markdown-Tabelle ohne Namen, also Caption fehlt; Verhalten nach den Regeln der tabelo, ein Manko oder eine Rückfrage, wie in Spec 020 festgelegt
   - N7-F-1: `actions`-Verschachtelung 0 → 1 mit Jugxo, aus dem Bericht zu Nachlese 7 ②
9. **M5-Flake (51 ms):** Die Ursache finden und beheben. **Die Grenze nicht anheben.** Wenn die Ursache außerhalb des Repos liegt, das mit Messungen im Bericht belegen und den Test unverändert lassen.

## ③ Regeltexte deutsch (Entscheidung d)
- **Heute:** Im Abschnitt „Gebrauch“ der Vitrino sind Überschriften deutsch, Zweck, Grenzen, Uzo, Kialo und Regulo-Texte aber englisch.
- **Ziel:** Die Vitrino zeigt diese Texte auf Deutsch. Der Gvidanto antwortet mit `lingvo: "de"` ebenfalls deutsch, sonst wie bisher englisch. Die Guidelines im Make Kit bleiben englisch.
- **Weg:**
  - Prüfe zuerst, wie `lingvo` heute im Modelo und im Vortaro geführt wird (die Schlüsselwörter haben es schon), und nimm denselben Weg (Regel 0.1).
  - Englisch bleibt die Quelle. Deutsch ist eine Übersetzung je Text mit derselben ID.
  - Ein Check meldet jeden Text ohne deutsche Fassung: in ③ als Fehler für alles, was die Vitrino zeigt.
- **Übersetzung:** Du schreibst die deutschen Texte.
  - Begriffe des Vortaro (Ero-Namen, Regulo-Namen, Werte von Props) bleiben unübersetzt.
  - WCAG-Verweise mit ihrem deutschen Titel, wie die offizielle deutsche Übersetzung ihn führt.
  - Stil: kurze Sätze, Aktiv, keine Füllwörter.
- **Für die Abnahme:** In plan ③ steht eine Stichprobe mit 20 Texten, Englisch und Deutsch nebeneinander, als Tabelle. Der Maintainer prüft sie.
- Geschätzter Umfang und Dauer gehören in den Bericht. Wenn ③ den Nachtlauf sprengt, ① und ② zuerst fertig machen und ③ als rot/teilweise melden.

## Entscheidungen, die du NICHT triffst
- Keine neuen Tokens, kein Amendment und keine neue Regulo. Was fehlt, ist ein Manko.
- Kein Veröffentlichen von 0.2.0.
- Keine Migration bestehender Figma-Dateien.
- Kein Code aus Arkitekturo.
- **ciferecigo** kommt nirgends vor.
- Der Ort der Sxablonoj in der Constitution (F-2) gehört zu Etappe 12 und nicht hierher.

## Für die Abnahme vorbereiten
- Je PR eine Messanleitung im plan mit vollständigen Pfaden im Checkout `/Users/thorstenjankowski/n8n-compose/20260918_fundamento-ds`, Links mit `file://`.
- Für Figma (②):
  - Schritt 1: zuerst `pnpm fm projekcioj build --out .fundamento/projekcioj`
  - Schritt 2: danach der Build mit den Testmarken nach `.fundamento/projekcioj-provoj`
  - Schritt 3: das Plugin aus diesem Build neu importieren; dank F-13 erscheint es als eigener Eintrag
  - Schritt 4: in einer **neuen leeren Datei** ausführen
- Erwartete Werte als Tabelle.

## Bericht (je PR)
```
PR <nr> – Nachlese 8 ①/②/③ – Branch – HEAD – CI (Dauer)
Geändert / gekippte Dialoge mit Jugxo / Abweichungen / Befunde / Mankoj / Offen
```
