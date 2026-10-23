# Spec 027 – Aufgaben

**Spec:** [`spec.md`](spec.md) · **Plan:** [`plan.md`](plan.md) · **Branch:** `261023-spec-027-nach-usersthor-232ca8` (von `main` `2e05a4f`, nach #108). Aufgaben ab T2701.

### A – Messen und rot zuerst
- [x] **T2701 Messungen in Figma** M1–M9 (M10, M11 während der Umsetzung) in der neuen leeren Datei „Fundamento Spec 027 Messung“ (plan, Tabelle). Danach das Double:
  - ein füllendes Kind zählt in einer umschließenden Mutter (M2/M3),
  - Instanzen mit Ebenen, Tausch und gelöster Breite (M4b, M9),
  - Slots (M4c–M7),
  - nummerierte Namen (M8).

  `plugin-double-messung-027.test.ts` stellt die Messungen nach. Mit dem Plugin von `main` bleiben alle 434 Figma-Tests grün.
- [x] **T2702 Bildvergleich** `test-doubles/bild.ts`, Basis `bild-main.json` aus dem Plugin von `main` im selben Double (933 Varianten, 40 Sets).
- [x] **T2703 Rote Tests** in sechs Dateien:
  - `plugin-bauformen-texte`: B-2, B-4, B-5
  - `plugin-bauformen-dehnung`: B-1
  - `plugin-bauformen-eigenschaften`: B-3, B-6, B-7, B-9, Name, Dauer
  - `plugin-bauformen-sxablonoj`: B-8
  - `plugin-bauformen-bild`: Abnahme 3
  - Doku-Test

  Rot in `77ec42a`: 86 Tests in vier Dateien und der Doku-Test. Schon grün waren die Messungen im Double, der Bildvergleich (gegen sich selbst), „ein Inhalts-Ero umschließt weiter“, der zweite Lauf der Sxablonoj und B-5 für die `karto`, deren Texte schon umbrachen.

### B – Grün
- [x] **T2704 B-2:** `text.color` am Text des Felds, wo kein Platzhalter gebunden ist (`unless`); die Zahl des `glitilo` als Feld gebunden; Stellvertreter und `no-results` in `color.text.default`; die Freigabe des getippten Texts gilt weiter, wo der Platzhalter steht (`unlessOf`).
- [x] **T2705 B-1/B-5:** `STRETCH`, `shape`, `settle` mit Stempel `breite`; `fit` und der Separator kennen die Form; die Anteile von `glitilo` und `mezurilo` und die Spalten des `tabelo` nach der Messung; die gebundene Breite des `dialogo` auf der Variante; `stretch` im Plan aus der Uzo. Die Zeilenprüfung nimmt die höhere `invalid`-Variante hin.
- [x] **T2706 B-3/B-4:** `switchHelpAndError`, `connectTexts`, `propertiesCount`; der Avatar löst nur noch die Verbindung zum Label.
- [x] **T2707 B-6:**
  - das `ikono` zuerst, danach an seinem Platz im Rahmen und im Bericht;
  - `drawIconInstance` (die Ikono-Variante in der Größe des Ero, M11), `connectIconSlots`;
  - die Slots als Plan-`toggles`;
  - `icon-end` des `butono`, `icon-start` des `signeto`.
- [x] **T2708 B-7, B-9:** Zielgröße des Auslösers; das Icon `edit` des `lokredaktilo`, Freigabe entfernt.
- [x] **T2709 B-8:** `placeSxablonoj` neu: Komponenten, Set `sxelo` (6 Varianten), Slots mit einer Eigenschaft je Region, Tokens der Teile; Plan mit `parts`, `width`, `variants`.
- [x] **T2710 Name, ID, Dauer:** „Fundamento Bauformen …“, `fundamento-bauformen-‹Hash›`, `ms` und „Lauf in … s.“.
- [x] **T2711 Double schneller (B-14):**
  - Größe und Lage ab dem ersten Knoten aufwärts, der nicht füllt;
  - ein Cache für die natürliche Breite;
  - Variablen über den Index.
- [x] **T2712 Bestehende Tests nachgezogen**, wo sie die gewollten Änderungen festnagelten:
  - Plugin-ID und -Name (`plugin-name`, `figma-cxiuj`, `lingvo`, Metiejo `eksporto`);
  - Toggles und Icons des `butono` (`figma.test`);
  - die Sxablonoj als Komponenten (`plugin-sxablonoj`, `nachlese-8-darstellung`);
  - die gefüllte Fläche des `dialogo`, die Spalte des `mezurilo`;
  - die Eigenschaften von `avizo`, `tabelo`, `atributlisto`, `navigado`, `langetaro`, `butono`, `avataro`;
  - die Icon-Instanz des `ligilo`;
  - die Knotenzahl des `butono` (15 statt 8 je Variante);
  - der Abbruch nach dem `ikono`;
  - der Rahmentest mit dem `butono` statt einem dehnbaren Set (B-10).

  In den roten Tests nachgezogen:
  - B-4 zählt die `label`-Eigenschaft ohne Ebene als benannte Ausnahme (Spec 011 ⑤);
  - Texte und Bild nur für die Sets der Eroj;
  - beim `datelektilo` geht der Auslöser von den 400 ab;
  - `WANTED`/`STRETCHED` mit Grund.

### C – Abschluss
- [x] **T2713 Doku:** plan (Zusammenfassung, Messungen in Figma, D-01–D-11, Abweichungen 1–6, B-10–B-14, O-1–O-4, Messanleitung), tasks, Vojmapo, README.
- [x] **T2714 Messungen:** unten; Bericht im PR.

### Messungen

| Was | Wert |
|---|---|
| Commits | rot `77ec42a`, grün im Folgecommit (Hash im PR) |
| Rot gemessen | 86 Tests in vier Dateien + Doku-Test |
| Plugin-Lauf im Double (Median aus 5) | `main` 0,50 s / zweiter Lauf 0,36 s; Spec 027 0,68 s / 0,45 s, 0 Schreibzugriffe; vier Marken 0,59 → 0,78 s |
| Bildvergleich | 933 Varianten: 841 gleich, 51 gewollt (B-2, B-7, B-9), 41 Folge von B-1/B-5 |
| Grün gemessen | siehe PR |
