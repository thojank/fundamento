# Research-Notiz: Figma-Projektion B „Achsen als Modi" – 2026-10-14, 08:40

**Anlass:** Maintainer, 14.10. 08:07: „Bei butono haben wir jetzt 72 Varianten; [ein früherer Kollege] hat es mit Variablen geschafft, eine Komponente mit wesentlich weniger Varianten zu bauen, die dasselbe kann." Benchmark-Quelle (öffentlich, Clean Room Art. V): Konferenzvortrag „Variable Visualizer" (IDS @ Spotify, Bildschirmaufnahme 14.10. 08:00, 2:56 min) und die Produktseite variablevisualizer.com.

## Zielbild-Satz (Maintainer, 14.10. 08:24, in die Vojmapo zu übernehmen)

> **Figma ist Schaufenster, der Prompt ist die Bedienebene.** Ein Entwurf entsteht per Prompt („Login-Screen für Marke XY, nach diesem Vorbild"), Änderungen ebenso; Figma zeigt ihn und lässt ihn nachträglich anfassen – sekundär.

## Was der Benchmark zeigt (Vortrag, 2:08–2:24)

- Eine Variablen-Sammlung `Button` mit **vier Modi**: Default, Hover, Pressed, Disabled – Zustände sind Modi, nicht Varianten.
- Variablen je Teil und Eigenschaft: `button/background`, `button/text`, `button/border`, `button/icon`, `button/padding/horizontal|vertical`, `button/border/radius|width`, `button/opacity`, `button/font/family|weight|size`.
- **Eine** Komponente `Button`, alle Eigenschaften an diese Variablen gebunden; der Zustand wird an der Instanz als Modus gewählt (Panel „Appearance: Button → Disabled").
- Vier Modi = Limit des Professional-Plans je Sammlung. Nur eine Achse (Zustand) als Modus; mehrere Achsen im Ausschnitt nicht gezeigt.
- Werte werden „at build time" in Code aufgelöst – entspricht dem Celo-Prinzip (Art. I: ein Modelo, viele Projekcioj).
- Daneben: Farbskalen-Generator (OKLCH, Schritte, Kontrast-Operator), Mathe-Operator für abgeleitete Zahlenwerte, KI-Assistent, der Sammlungen anlegt und bindet. Für Fundamento sind das Agordilo-Themen (Graph-Bearbeitung → Modelo), nicht Projektions-Themen.

## Übertragung auf Fundamento

Die Skemo trägt die Information schon: `surface.fill by [emphasis, intent, state]` ist genau die Alias-Kette, die Projektion B braucht.

**Mechanik (mehrere Achsen):** Alias-Ketten über Sammlungen.
`butono/fill` (Sammlung `state`, Modi rest/…) → `butono/fill/rest` (Sammlung `intent`, Modi neutral/danger) → `butono/fill/rest/neutral` (Sammlung `emphasis`, Modi high/medium/low) → `color.action.primary.rest` (Sammlung `aspekto`, Modi je Marke). Der Markenwechsel bleibt unverändert am Blatt.

**Variantenzahl:** heute 72 (emphasis 3 × intent 2 × size 3 × state 6).
- Weg (a), Professional-Plan: `state` (6 Werte, > 4 Modi) bleibt Variante; `emphasis`, `intent`, `size` werden Modi → **6 Varianten**.
- Weg (b), Organization-Plan (bis 40 Modi): alles Modi → **1 Variante** (plus ggf. Größen).
- Variablenzahl steigt (für `fill` allein 1 + 6 + 12 = 19 je Ero-Teil-Eigenschaft); dafür schrumpfen Knoten, Plan-Datei und Plugin-Laufzeit.

**Warum es zum Zielbild passt:** Die Bedienebene ist der Agent. Für ihn ist `setExplicitVariableModeForCollection` einfacher als Variantensuche; `emphasis=high` heißt in Code, Skemo und Figma gleich (Art. II wird wörtlicher). Prototyping mit Hover-Varianten braucht ein Schaufenster nicht.

**Was bleibt wie es ist:** Skemo, Uzo, Vortaro, Markenwechsel, Parität als Prinzip (sie lernt: eine Achse kann Modus statt Property sein).

**Offene Fragen, die vor einer Spec gemessen werden müssen:**
1. Wie *schreibt* der Agent Entwürfe nach Figma – Plugin-API (eigenes Plugin), Figma-MCP, Make? Das ist die eigentliche Bedienebene; Projektion B ist nur so gut wie dieser Weg.
2. Vererbung: ein Danger-Button in einem Bereich mit `intent: neutral` braucht einen eigenen Modus am Knoten – trägt der Schreibweg das?
3. Code Connect und Parität bei Modus-Achsen.
4. Plan-Limit (4 Modi) – Entscheidung (a) oder (b).

## Regel „Nichts wegschmeißen" (Maintainer, 14.10. 08:36)

Bei einem Konzeptwechsel wird der bisherige Stand **konserviert, nicht ersetzt**: Projektion A (Varianten) bleibt als eigener Generator baubar und in der Parität gemessen; Projektion B kommt daneben (`figma` / `figma-modoj` oder Schalter in der Config). Erst eine Messung über mehrere Eroj entscheidet, welche Projektion Standard wird; die andere bleibt im Repo, mit Jugxo und Messwerten. Kandidat für die Constitution (Art. XI, Ergänzung): „Ein Konzeptwechsel stellt daneben, er ersetzt nicht; der alte Stand bleibt baubar, gemessen und zurückholbar."

## Einordnung

- **Nicht jetzt bauen.** Phase 5 (Figma-Library), als Spec „Projektion B" mit Vergleichsdatei A gegen B, wenn ≥ 5 Eroj vorhanden sind und der Schreibweg (Frage 1) feststeht.
- Vorarbeit, die sich heute lohnt: Vojmapo-Zielbild-Satz, diese Notiz, Constitution-Kandidat. Alles docs-only.
