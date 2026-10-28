# Spec 029 ①b – Werte je Komponente aus der Fonto, weiße Flächen – Briefing Sitzung A

**Erstellt:** 2026-10-27 · **Gilt für:** #111 (vor dem Merge) · **Zielpfad:** `specs/029-fonto-astryx/briefing-a-1b-2026-10-27.md`

**Regel 0** gilt. **Keine Budgets anheben.** `komuna-0-2` bleibt unverändert und pixelgleich.

## Anlass: Abnahme ① durch den Maintainer (27.10., 22:07) – nicht bestanden
Der Maintainer hat in der Vitrino komuna neben dem Storybook der Fonto (theme-neutral) verglichen: `butono`, `kampo`, `karto`, `dialogo`. Ergebnis: **„passt noch nicht“**, vor allem die Varianten.

**Ursache 1 (Lücke in der Spec, von Claude):** Spec 029 ① sagte „Ero-Tokens bleiben Aliase“. Damit kamen nur Grundlagen und Rollen. Die Fonto legt aber viel vom Aussehen **je Komponente** fest: Overrides der Komponenten im Theme sowie Maße und Stile in den Komponenten selbst.
**Ursache 2:** Entscheidung ①-1 („keine reinweißen Flächen“) macht Seite, Felder und Karten grau. Die Fonto lebt von weißen Flächen.
**Ursache 3:** Varianten und Teile sind ②b und noch nicht gebaut.

## Entscheidungen des Maintainers (27.10., 22:08)
1. **①-1 neu: Weiß ist erlaubt.** Das Aspiro `oklch-l-extreme` gilt für die neue komuna nicht mehr. `komuna-0-2` behält es. Der Kontrast wird weiter vollständig geprüft.
2. **①b kommt in #111, vor dem Merge.** Danach nimmt der Maintainer ① erneut ab.
3. Trennung: **① = wie es aussieht** (alle Werte, auch je Komponente). **② = was es kann** (Varianten, Teile, Verhalten).

## Was ①b tut
### a) Flächen
- Die Flächen der neuen komuna folgen der Fonto, auch Weiß: Seite, Fläche, Karte, Overlay, hell und dunkel.
- Die Jugxoj J1 und J2 werden angepasst oder als aufgehoben markiert, nicht gelöscht. Die Begründung nennt die Entscheidung vom 27.10.

### b) Ero-Tokens aus der Fonto
- Die Ero-Tokens **aller 40 Eroj** bekommen ihre Werte aus der Fonto, soweit es ein Gegenstück gibt (Abgleichstabelle ②a). Quellen in der gepinnten Version 0.7.4:
  1. die Overrides je Komponente im Theme (`components` in theme-neutral, auch `onDark` und `onLight`)
  2. die Stile der Komponenten im Paket core: Radien, Höhen (Elementgrößen), Innenabstände, Ränder, Schriftrollen, Flächen und Schriftfarben je Variante und Zustand, Disabled, Fokus
- Jeder übernommene Wert trägt Herkunft in `deveno.json`, mit Datei und Schlüssel bzw. Stilregel.
- **Abbildung der Varianten**, wo Fundamento die Achse schon hat:

  | Fundamento | Fonto |
  |---|---|
  | `butono` `emphasis=high` | primary |
  | `emphasis=medium` | **secondary** (Fläche, kein Rand, falls die Fonto das so zeichnet) |
  | `emphasis=low` | ghost |
  | `intent=danger` | destructive |

  Für alle übrigen Eroj gilt sinngemäß die Abgleichstabelle. Wo eine Variante bei uns fehlt, ist das ②b, nicht ①b.
- **Beobachtet vom Maintainer, muss danach stimmen:**
  - butono: Form wie die Fonto (im Storybook als Pille), Höhen der Größen wie die Fonto (kompakt), Secondary ohne Rand, Disabled blass in der eigenen Variante
  - kampo: weiß mit feinem Rand, Disabled hell
  - karto: weiß, feiner Rand, leichter Schatten
  - dialogo: Titel in der Größe der Fonto, Abstände und Radius wie die Fonto
- **Regeln gewinnen.** Was eine Regulo verletzt, wird angepasst und als Jugxo festgehalten. Zum Beispiel bleiben Feldränder mindestens 3:1 (WCAG 1.4.11), auch wenn die Fonto heller ist. Die Jugxo-Liste kommt in den Bericht.

### c) Fehler
- **Ein deaktivierter `butono` mit `emphasis=high` zeigt keinen Text mehr** (grauer Balken). Ursache finden und beheben, mit rotem Test im Browser. Der Text eines deaktivierten Elements bleibt sichtbar, blass, aber lesbar.

### d) Vitrino
- Die Beispiele des `butono` und anderer Eroj mit Icon-Slot zeigen **standardmäßig kein Icon**, wie die Fonto und wie Spec 027 B-6 in Figma. Eine eigene Zeile zeigt die Varianten mit Icon.

### e) Vergleich als Werkzeug für die Abnahme
- Lokal, nicht veröffentlicht, nicht in der Vitrino: eine Vergleichsseite, die **je Ero mit Gegenstück** links Fundamento (komuna) und rechts die Fonto aus dem gepinnten Paket zeigt. Beide in hell und dunkel, in Ruhe, Hover, Fokus, Disabled und Loading.
- Dazu eine **Tabelle der gemessenen Stile** je Ero und Variante: Höhe, Innenabstand, Radius, Rand, Flächenfarbe, Schriftfarbe, Schriftgröße. Fundamento gegen Fonto, mit Abweichung und Grund (Jugxo oder ②b).
- Der Code der Fonto läuft dabei nur im lokalen Vergleich, als devDependency in `scripts/fonto-astryx/`, nie in einem Paket von Fundamento.

## Abnahme ①b
1. Der Maintainer vergleicht `butono`, `kampo`, `karto` und `dialogo` erneut, und dazu weitere Eroj nach Wahl, auf der Vergleichsseite. Urteil: Die Werte tragen die Optik der Fonto. Was fehlt, ist nur noch Struktur (②b).
2. `komuna-0-2` ist weiterhin pixelgleich mit `main`.
3. Alle Prüfungen sind grün, die Jugxo-Liste liegt vor.
4. Figma (neue leere Datei) zeigt die neuen Werte.

## Reihenfolge
1. #111 auf `main` nach #112 neu aufsetzen, wie bereits beauftragt.
2. ①b auf #111, rote Tests zuerst.
3. Bericht im bekannten Format, mit Jugxo-Liste und Pfad der Vergleichsseite.
4. #111 wartet auf die erneute Abnahme. Danach #111 → #113 (neu aufgesetzt) → #110 → ②b → ③.

Messanleitung mit vollständigen Pfaden im Checkout `/Users/thorstenjankowski/n8n-compose/20260918_fundamento-ds`, `cd` und `file://`-Links. ciferecigo kommt nirgends vor.
