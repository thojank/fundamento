# Changelog

Changes of the published packages (the Make Kits `@fundamento/make-kit-<aspekto>`). The release path is `release.yml` (README, `pnpm check:release`).

## 0.2.0 – geplant

- Breaking: Das Make Kit liefert nur noch ESM. `require()` braucht Node ≥ 22.12.
  (Nachlese 6 N6-3, Entscheidung des Maintainers vom 2026-10-20: die CJS-Fassung fällt mit 0.2.0; kein Release vorher.)

## 0.1.1 – Fehlerbehebungen

Fehler, auf die Arkitekturo mit 0.1.0 gestoßen ist (Nachlese 7 ①, `specs/021-nachlese-7/`). Keine Prop, kein Slot, kein Ereignis, kein Tag umbenannt; kein Token geändert.

- A-1 `fm-dialogo`: Die Meldung (`message`) ist sichtbar. Die Stilregel `:has(slot:not(:empty))` prüfte das Slot-Element, das immer leer ist, und versteckte jede Meldung. Jetzt zeigt das Element den Absatz, solange sein Slot gefüllt ist; nur dann zeigt `aria-describedby` darauf.
- A-2 `fm-menuo` und `fm-konsileto`: `document.createElement` liefert das Element. Der Konstruktor schrieb auf den Host (die Kennung des Ankers, `popover`, `role`); das geschieht jetzt beim Einhängen. Alle 32 Elemente sind so getestet.
- A-3 Guidelines: `langetaro.md`, `navigado.md`, `spuro.md` und `pagxigilo.md` schreiben ihre Einträge so, wie das Element sie liest: Tabs als Kinder ohne `slot`, Links als direkte `<a>`-Kinder; der Pagxigilo zeichnet seine Seiten selbst. Jedes Markup-Beispiel der Guidelines rendert ohne unsichtbares Kind.
- A-4 `Guidelines.md`: ein Satz je Ziel. Die Bestätigung nennt nur `<Dialogo>` (nicht auch das Popover), die lange Liste nur `<Elektilo>` (nicht auch das Feld mit Vorschlägen).
- A-5 `tekstareo.md` und alle anderen Guidelines: Die Beispiele zeigen Hilfe und Fehler in den Slots `help` und `error`.
- A-6 `fm-tabelo`: Eine native `<caption>` der Tabelle bleibt stehen, solange der Slot leer ist, und benennt die Tabelle.
- A-7 `fm-avizo`: Guideline und Uzo sagen, dass `dismiss` die Meldung versteckt und im Dokument lässt; die Guideline zeigt, wie eine Anwendung sie entfernt. Das Verhalten ist unverändert.
