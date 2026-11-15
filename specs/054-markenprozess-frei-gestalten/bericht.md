# Spec 054 – Bericht (MP-1: Frei gestalten auf der Leinwand)

Stand 2026-11-15, aus MPFG-5.1 (T8). Ein Commit, ein Push, ein PR; dieser Bericht ist mit den Platzhaltern in Abschnitt 1 committet, die CI-Tabelle steht nach dem Dispatch in der PR-Beschreibung. Quellen: [`spec.md`](spec.md), [`plan.md`](plan.md), [`tasks.md`](tasks.md) (dort auch der **PR-Text-Entwurf**). Bilder und Messung liegen außerhalb des Repos unter `/Users/thorstenjankowski/n8n-compose/20260918_fundamento-ds/.fundamento/spec054/`.

## 1. PR, Commit, Dispatch, CI

- PR: **⟨PLATZHALTER: PR-Link⟩** · Commit: **⟨PLATZHALTER: Hash⟩** · Dispatch-Lauf (genau einer): **⟨PLATZHALTER: Lauf-Link, Ergebnis⟩**
- Lokal vor dem Push: `FM_AUSGABE=knapp pnpm test:betroffen` und `pnpm lint` – Ergebnis in Abschnitt 6.

| Job | Ergebnis | Notiz |
|---|---|---|
| Affected packages (betroffen) | ⟨offen⟩ | |
| Build, lint and Modelo checks | ⟨offen⟩ | |
| Unit tests (metiejo) | ⟨offen⟩ | enthält alle `grafeo-*-054` und die 047/048-Tests |
| Unit tests (modelo) | ⟨offen⟩ | Turbo-Zeitlimit unter Last bekannt und fremd |
| Unit tests (cli · ekranoj · nordstelo · agordilo · mcp) | ⟨offen⟩ | nordstelo: lokal Hook-Zeitlimit unter Last (Abschnitt 6) – hier besonders hinsehen |
| Unit tests (Projekcioj, Shards) | ⟨offen⟩ | |
| Timing checks | ⟨offen⟩ | |
| Rendered Eroj / Alirebleco / Vitrino / Make Kit / Quickstart | ⟨offen⟩ | keine Datei unter `packages/eroj/**` geändert |

## 2. Bilder (Chromium 153, 2100×1250, keine Baselines)

Skript: `pnpm --filter @fundamento/nodredaktilo exec tsx scripts/bilder-054.ts --ziel /Users/thorstenjankowski/n8n-compose/20260918_fundamento-ds/.fundamento/spec054/bilder` (Marke `lumeto`, über die Startseite angelegt). Unterwegs geprüft, sonst Abbruch: Knoten und Phase gezogen (Knoten wandern mit, keine Anfrage), Regler „Tönung“ gezogen (Knoten bleibt), Akzent → Palette gelöst und „zurücksetzen“, Primär auf „Warnung“, Funktionsfarbe und weitere Vorschau über „+ Knoten“, Leinwand hell ohne Neuladen, „Farbe aus dem Knoten“ an der Basis, Stufe nur für dunkel, Neuladen = Startplätze.

1. [01-neue-marke.png](file:///Users/thorstenjankowski/n8n-compose/20260918_fundamento-ds/.fundamento/spec054/bilder/01-neue-marke.png) – direkt nach dem Anlegen: sechs Phasen, Primär „Startwert“, Akzent leer, beide Vorschauen.
2. [02-drei-farben.png](file:///Users/thorstenjankowski/n8n-compose/20260918_fundamento-ds/.fundamento/spec054/bilder/02-drei-farben.png) – Primär `#2f5bff`, Akzent `#c6f135`, Tönung 0,34 (per Regler).
3. [03-stufe-von-hand.png](file:///Users/thorstenjankowski/n8n-compose/20260918_fundamento-ds/.fundamento/spec054/bilder/03-stufe-von-hand.png) – Primär 700 = Farbe aus dem Knoten, Nadel oben, Fußnote „1 angeheftet“.
4. [04-vorschau-hell-dunkel.png](file:///Users/thorstenjankowski/n8n-compose/20260918_fundamento-ds/.fundamento/spec054/bilder/04-vorschau-hell-dunkel.png) – beide Vorschau-Knoten.
5. [05-ansicht-verstehen.png](file:///Users/thorstenjankowski/n8n-compose/20260918_fundamento-ds/.fundamento/spec054/bilder/05-ansicht-verstehen.png) – 047-Ansicht mit „Gestalten | Verstehen“.
6. [06-leinwand-hell.png](file:///Users/thorstenjankowski/n8n-compose/20260918_fundamento-ds/.fundamento/spec054/bilder/06-leinwand-hell.png) – dieselbe Leinwand hell.
7. [07-stufe-dunkel-und-basis.png](file:///Users/thorstenjankowski/n8n-compose/20260918_fundamento-ds/.fundamento/spec054/bilder/07-stufe-dunkel-und-basis.png) – Primär 300 nur dunkel (geteilt, Nadel unten), Basis je Zeile umrandet.
8. [08-akzent-geloest.png](file:///Users/thorstenjankowski/n8n-compose/20260918_fundamento-ds/.fundamento/spec054/bilder/08-akzent-geloest.png) – Akzent-Zeile „nicht verbunden“, Hinweis mit „zurücksetzen“ in der Kopfleiste.
9. [09-liste-knoten.png](file:///Users/thorstenjankowski/n8n-compose/20260918_fundamento-ds/.fundamento/spec054/bilder/09-liste-knoten.png) – offene Liste „+ Knoten“, nach Zweck gruppiert.

**Abweichungen von Zielbild/Mockup (AK-7), mit Grund:** Phasen 1/2/3/6 leer („kommt später“), Marke steht in Phase 4 (Lauf MP-1, Datenmodell T1); kein Knoten „Anteile“ (Auftrag nennt ihn nicht, Katalog „kommt später“), keine Menüs Datei/Bearbeiten, keine Kostenanzeige; die Vorschau zeigt die echte Vorschau der Marke in Knotenbreite und scrollt im Rahmen (das Mockup stellt eine kurze Vorschau nach); Neutral-Feld = helle Neutral 100 aus der Ableitung (B-1); Schalter der Kopfleiste und der Vorschau als `fm-butono`/`fm-ligilo` mit Betonung statt eigener Segmente – der aktive Schalter ist nur an der Betonung erkennbar (in dunkel ist „hell“ gefüllt, „dunkel“ umrandet aktiv; leicht verwechselbar); Marke-Initiale groß; Stufen als native Knöpfe; „×“ an der Kante als `fm-butono`; React-Flow-Hinweis „React Flow“ unten Mitte wie in 047. In Bild 7 trägt die Palette den Auswahlrahmen (der Knoten ist nach dem Klick gewählt). In Bild 8/9 ist „Bearbeiten“ der dunklen Vorschau dunkelblau auf dunkel: Folge der mit Absicht von Hand gesetzten dunklen Stufe Primär 300 `#1d3a99` (kein Urteil auf der Leinwand, AK-12).

## 3. Messung ([messung.json](file:///Users/thorstenjankowski/n8n-compose/20260918_fundamento-ds/.fundamento/spec054/messung.json))

- Primär fünfmal ändern (`#f5c400`, `#2f5bff`, `#7a3e9d`, `#d14b2b`, `#2f5bff`), gemessen in der Seite von `fill+Enter` bis `data-nr-vorschau-rev` = neuer rev, kein `data-nr-vorschau-laedt`, beide festen Vorschauen geladen: **Median 204,8 ms, Maximum 274,9 ms** (274,9 · 204,8 · 265,5 · 191,1 · 163,9). Zwei Rahmen laden je Änderung neu (R-11).
- Bündel `packages/nodredaktilo/dist/leinwand.js`: vorher (aa53d3f4) **635 947 B roh / 170 082 B gzip**, nachher **728 751 B roh / 192 071 B gzip** (+92 804 / +21 989; `gzip -6 -c` wie das Ausgangsmaß). Keine neue Abhängigkeit. Ein Lauf, keine Schwelle.

## 4. Genutzte Schreibwege

`POST /marko` mit `ziel=leinwand` (Startseite, Grundlage immer `leer`) und `POST /api/marko/:name/leinwand` (Farbe, Tönung, Stufe hell/dunkel; ohne Prüfung). `festlegen`, `entwurf`, Studio, Schnellstart unverändert. Verbindungen schreiben nichts (`kabloj` nur lesend auf `/api/leinwand`, `vorschau`, `vorschau.css`).

## 5. Befunde (Einzelheiten und Belege in `tasks.md`)

- **B-1 Neutral:** nur `neutral.toenung`; freie Neutralfarbe nur über Stufen (`grafeo-skribo.ts`; Ableitung `packages/agordilo/src/palettes.ts:159`). Neutral folgt dem wirksamen Primär (D-5).
- **B-2 `festlegen` urteilt:** 409 bei `sekundo-not-action` (`servilo.ts:1253` am Stand aa53d3f4) und bei neu verletzter fester Regel (`:1313`); Leinwand umgeht es mit eigenem Weg, Studio unverändert.
- **B-3:** `sekundo.25/.850/.975` und Stufen außerhalb der Kalibrierung nicht setzbar (422; `palettes.ts:61`, `:311`); Akzent-Stufen bleiben nach „Akzent entfernen“ im Agordo (R-3). Ableitung überschrieb nie eine Stufe von Hand.
- **B-4 Basis ≠ Farbe:** `#f5c400` → accent 700 `#665000`, `#c6f135` → sekundo 700 `#475900`, `#d99a00` → warning 600 `#896000` (`calibration.ts:34`, `palettes.ts:170`); Funktionsfarbe gibt nur den Farbton (D-5).
- **B-5:** ohne Wert von Hand ist keine Stufe geteilt; heller Wert gilt in beiden Schemata außer `neutral.950` (`package.ts:175`, `palettes.ts:373`).
- **D-1:** `fm-formularo` sendet seinen Absende-Knopf nicht (`packages/projekcioj/src/celoj/web-component/sxablono-template.ts:298–305, 324–344`); Inline-Skript im Fall `start` (`sxtupoj.ts:337–347`). **D-2:** `html.ts` Opt-in-Feld `gestaltenHref`. **D-8/R-12:** Art-Rollen in hell kaum unterscheidbar (gefüllt/hohl und Legende tragen).
- **Neu (MPFG-5.1):** Das Studio listet die Palette der Zweitfarbe (`sekundo`) nicht (`studio.ts:527` nutzt `PALETTES`); Akzent-Stufen, die die Leinwand zeigt und setzt, sieht das Studio nicht (Test hält es fest).
- **Neu (MPFG-5.1, behoben):** doppeltes „nicht verbunden“/„noch keine Farbe“ in der Akzent-Zeile (`packages/nodredaktilo/src/gestalten/nodoj/paletro.tsx:124–129`, `:266`).
- Weitere: `oklch` außerhalb sRGB wird beim Speichern einer Stufe abgeschnitten (`sxtupoj.ts:196`); `fm-kampo` meldet „fm-ikono: name is required“ (Eroj); Schreiben eines abgehängten Knotens lädt die Vorschauen einmal neu (neuer rev); nordstelo-Hooks laufen unter Last ins 10-s-Limit (Abschnitt 6).

## 6. Prüfungen (lokal)

- Neue Tests: `grafeo-studio-054` 2/2, `grafeo-urteil-054` 6/6; rot gezeigt mit vier gepflanzten Fehlern (Abschnitt in `tasks.md`).
- `FM_AUSGABE=knapp pnpm test:betroffen`: **rot nur in nordstelo** (3 Hooks im 10-s-Limit beim Verbinden des In-Memory-MCP: `packages/nordstelo/src/ac8.test.ts:156`, `ablauf/integra.test.ts:131`, `neubewertung-053.test.ts:206`); allein 379/379 grün; am Stand `aa53d3f4` unter gleicher Last grün, der langsame Schritt (`loadServed`) ist in beiden Bäumen gleich schnell und nutzt keine Datei dieses Laufs → Lastzeit, nicht angehoben, CI entscheidet. Mit `--continue`: metiejo **809/809**, ekranoj 301/301, modelo nur `turbo-inputs` (bekannt fremd), cli 120/120. `pnpm lint`: grün.
- Nach MPFG-5.1 wiederholt: `test:betroffen` wieder rot nur in nordstelo (dieselben 3 Hooks, sechs Pakete parallel; bekannt als B-13 aus Spec 051). Derselbe Paketsatz nacheinander (`pnpm turbo run test --continue --concurrency=1` mit den sechs Filtern): 15 von 15 Aufgaben grün, davon 12 aus dem Turbo-Cache (metiejo 809/809 aus dem Lauf von MPFG-5.1 auf denselben Eingaben). nordstelo allein 379/379 in 6,9 s. `pnpm lint` grün (22/22).
- Browser-Abnahme (Chromium, 1920×1200, zehn Gruppen: Einstieg, Aussehen, Farben ohne Urteil, Stufe von Hand, Vorschauen, „+ Knoten“, Verschieben, Verbindungen, Ansichten und Schemata, Randfälle): alle bestanden. Notiz daraus, nicht behoben: In 2 von 6 Skriptläufen landete Text, der in den ersten etwa 40 ms nach dem Öffnen des Stufenfelds in „dunkel“ geschrieben wurde, in „hell“ und wurde als heller Wert gespeichert (vermutlich der Autofokus in `packages/nodredaktilo/src/gestalten/nodoj/stufo-kampo.tsx`); in Menschentempo nicht aufgetreten. Die Tab-Reihenfolge läuft erst durch Kanten, Phasen und Knoten und dann durch die Kopfleiste (Barrierefreiheit des Editor-Pakets ist ausgenommen).
- Behoben dabei: `packages/modelo/src/ci/test-setup.test.ts:187` war rot durch `await` auf Modulebene in `vi.mock` von `grafeo-skribo-054.test.ts` (MPFG-3.1) und `grafeo-urteil-054.test.ts`; jetzt `.then`, Zähler weiter wirksam.
- AK-6-Diff-Suche: Befehle und Ausgaben in `tasks.md` („MPFG-5.1: Diff-Suche“): nichts unter modelo/agordilo/eroj/vortaro/mcp/.github, keine Root-Datei, kein Lockfile, kein `package.json`; kein neuer `--fm-`-Name (62 Namen, alle im Kernsatz); kein Zeitlimit, `retries`, Schwelle; `sxtupoj.ts` nur Fall `start`; AK-22 0 Literale; Wort aus R-12 und Name des privaten Schriften-Repos: 0 Treffer in neuen Zeilen, `pnpm check:privat` PASS.

## 7. Zu bestätigen

(a) Belegung ohne `regler.saettigung` (Vorgabe statt unterer Grenze: bei 0 werden Status-/Syntax-Rollen grau, die Anschlussarten nicht mehr unterscheidbar). (b) Katalog-Läufe aus MPFG-1.1: „Anteile“, „Überschrift“, „Rahmen“ → MP-3; „Seite“ → MP-3; „Harte Fälle“ → MP-4. (c) `validaLigo` mit zusätzlicher Vorwärts-Regel (Marke → Farbe → Palette → Vorschau). (d) Art-Rollen in der hellen Leinwand schwer unterscheidbar (R-12 / D-8-Rückfall). (e) „Graph ansehen“ im Studio öffnet jetzt Gestalten. (f) UI-Abweichungen: Kopfleiste `fm-butono`/`fm-ligilo`, Marke-Initiale groß, native Stufen-Knöpfe, „×“ an Kanten als `fm-butono`. (g) Inline-Skript auf der Startseite (D-1).

## 8. Nicht geprüft

Firefox und WebKit; `prefers-reduced-motion`; Netzfehler/5xx beim Speichern im Browser; „aus Material“ in der UI (nur Unit-Test); `ableitung: "fehlt"` im Browser; der Zweig für einen ungültigen gespeicherten Entwurf in `/api/leinwand` (`servilo.ts` ≈ 1654–1665).

## 9. Was der Maintainer jetzt tut

1. Bilder ansehen: `/Users/thorstenjankowski/n8n-compose/20260918_fundamento-ds/.fundamento/spec054/bilder/01-neue-marke.png` bis `09-liste-knoten.png`; Messung `/Users/thorstenjankowski/n8n-compose/20260918_fundamento-ds/.fundamento/spec054/messung.json`.
2. Die Punkte (a)–(g) in Abschnitt 7 bestätigen oder ändern.
3. Den PR ansehen (Branch `261114-spec054-markenprozess-umsetzen-8584b4` gegen `main`; Text aus `specs/054-markenprozess-frei-gestalten/tasks.md`, „PR-Text (Entwurf)“). Nicht mergen, bevor (a)–(g) entschieden sind.
4. Die CI-Tabelle je Job in der PR-Beschreibung lesen (genau ein `workflow_dispatch`-Lauf, kein weiterer Push); die Platzhalter in Abschnitt 1 sind nur lokal gefüllt (Worktree `/Users/thorstenjankowski/.purple-code/worktrees/fundamento-wt-mwgxrmws18mvgk1v/repos/fundamento`).
5. Abnahme im Browser: `fm metiejo`, auf `/` „Auf der Leinwand anlegen“, drei Farben, eine Stufe, Wirkung in beiden Vorschauen (AK-1), dann `/studio/<name>/farbe` (AK-2).
