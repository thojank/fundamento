# Spec 043 – Nachbesserung 042: Warten auf „geladen“, Vorschau-Rahmen, Übernahme WebKit

**Status:** Auftrag für eine Sitzung im Spec-Modus · **Erstellt:** 2026-11-06, 08:45 · **Basis:** aktuelles `main` (`f027522`, nach #149, #150, #151) · **Zielpfad:** `specs/043-nachbesserung-042/spec.md`

**Regel 0** gilt. **Keine Budgets, Grenzen, Schwellen, Zeitlimits, Abfrageintervalle oder Toleranzen anheben** (auch keine `timeout-minutes`, keine `retries`, keine expect- oder Test-Timeouts). **Nichts mergen.** Rote Tests zuerst. Keine Schlüssel. Nur die Marken des Repos. Das Wort aus R-12 von Spec 035 und der Name des privaten Schriften-Repos in keiner neuen Zeile. Kein Sprachmodell. Es gilt `standards/global/delivery.md` und `testing.md`.

**Begrenzung der Laufzeit (bindend):** höchstens **4 Tickets**, **ein PR**, ein Push, danach genau **ein** `workflow_dispatch`-Lauf, kein Push danach, kein Neustart. Je Wackel-Test höchstens **30** lokale Wiederholungen, danach Befund mit Trefferquote. Spec 038 Lauf 2 läuft parallel (nur `packages/nordstelo`); diese Dateien nicht ändern.

## Worum es geht
Nach dem Merge von #150 ist `main` an anderer Stelle rot als vorher (Lauf 42180054807, `f027522`):

| Test | Browser | Fehler |
|---|---|---|
| `zweitfarbe-036.spec.ts:121` › Assistent „Leitfarbe und Akzente“ und › Schnellstart-Farbschritt | **Chromium** | `geladen-042.ts:54` `seiteBereit`: Merkmal da, neues Dokument da, aber `readyState` bleibt 5 s „interactive“ |
| `buehne-navigation-042.spec.ts:200` (neu aus #150) | Firefox | rot |
| `metiejo-036-uebernahme.spec.ts:67` und `:89` (4.1, 4.2) | WebKit | `TypeError: fetch failed` – in 3 von 3 Läufen seit dem 06.11. |

Ursache der ersten Zeile ist sehr wahrscheinlich **N-8** aus Spec 042: Nach dem Neuladen der Seite wird die Navigation des Vorschau-Rahmens abgebrochen (`NS_BINDING_ABORTED`) und erst einen `stato`-Takt später (~3–4 s) neu angefragt. Solange der Rahmen lädt, ist das Hauptdokument nicht „complete“. Die Härtung aus #150 wartet auf „complete“ des Hauptdokuments und gibt nach 5 s auf. Vorher war der Test nur in Firefox gelegentlich rot; jetzt auch in Chromium.

N-8 ist auch für Nutzer sichtbar: Die Vorschau erscheint nach dem Neuladen erst nach einem Takt.

## Was gebaut wird
1. **N-8 im Produkt beheben (Metiejo):** Wird die Navigation eines Vorschau-Rahmens abgebrochen oder ist er nach dem Laden der Seite leer bzw. auf altem `rev`, fordert die Seite ihn **sofort** neu an, nicht erst im nächsten `stato`-Takt. Der Takt (3 s) bleibt unverändert. Roter Test zuerst: nach dem Neuladen hat der Rahmen „Jetzt“ innerhalb der Standard-Wartezeit (5 s) das neue `rev` und ist geladen, in allen drei Browsern.
2. **`seiteBereit` in `packages/eroj/test/geladen-042.ts`:** nicht auf `readyState === "complete"` des Hauptdokuments warten, solange Rahmen laden, sondern auf das Merkmal der Seite und `readyState !== "loading"`; die Rahmen prüft `rahmenBereit` getrennt (Muster aus `testing.md`). Keine längere Wartezeit.
3. **`buehne-navigation-042.spec.ts` (Firefox):** Ursache aus dem Trace des Laufs 42180054807 (Artefakt `testberichte-eroj-2-*`). Liegt sie in N-8, erledigt Punkt 1 sie. Sonst Fix nach `testing.md` oder Befund mit Trefferquote.
4. **Übernahme WebKit `fetch failed`:** Trace lesen. Ist es die Port-Kollision N-3 (Port aus `workerIndex % n`), Ports so vergeben, dass sie sich nicht überschneiden (Muster aus `testing.md`). Ist es ein Reset an einem POST: POST über eigene Verbindung (`connection: close`), nie wiederholen.

## Abgrenzung
- Frei: `packages/metiejo/src/**` nur für Punkt 1; `packages/eroj/test/geladen-042.ts`, `buehne-navigation-042.spec.ts`, `zweitfarbe-036.spec.ts`, `metiejo-036-uebernahme.spec.ts`, Test-Hilfen daneben; `specs/043-nachbesserung-042/**`.
- Tabu: jede Grenze, jedes Zeitlimit, der `stato`-Takt, Retries; `.github/**`; Root-Dateien; `packages/nordstelo/**`, `packages/mcp/**`, `packages/modelo/**`.

## Tickets (≤ 4, ein Strang)
T1 N-8 Produkt (1) · T2 `seiteBereit` und Navigationstest (2, 3) · T3 Übernahme WebKit (4) · T4 PR, ein Dispatch, Bericht.

## Abnahme
- Im Dispatch-Lauf sind `zweitfarbe-036`, `buehne-036`, `buehne-navigation-042` und `metiejo-036-uebernahme` in allen drei Browsern grün.
- Diff-Suche: kein Zeitlimit, keine Schwelle, kein `retries`, kein `waitForTimeout` neu; `stato`-Takt unverändert.
- Nach dem Merge: drei Läufe auf `main` hintereinander grün (Maintainer).

## Bericht
Kurz: PR-Link, CI je Job, Tabelle Befund → Ursache → Fix, was der Maintainer tut. Dann stoppen.
