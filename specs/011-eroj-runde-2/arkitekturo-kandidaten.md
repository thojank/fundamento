# Kandidaten für Fundamento

Eigene Bausteine der Arkitekturo-Web-UI (L6, Entscheidung F-4), die Fundamento (Make Kit `@fundamento/make-kit-komuna@0.1.0-next.3`, sieben Eroj) heute nicht hat. Sie nutzen ausschließlich `--fm-*`-Variablen des gepinnten Kits (keine Rohwerte, keine eigenen `--fm-*`-Definitionen) und können später nach Fundamento wandern. Nichts davon ist aus Fundamento kopiert.

**Format (bindend, T5.7):** je Baustein ein Abschnitt `### ark-<name>` mit **Zweck**, **Verwendete Variablen**, **API**, **Barrierefreiheit** und **Abgrenzung zu vorhandenen Eroj**. Die Stile eines Bausteins stehen in genau einer Datei `ark-<name>.css` unter `packages/ui/src/web/` (gemeinsame Bausteine in `blocks/`, Bausteine einer Ansicht in deren Ordner, dort per `@import url("./ark-<name>.css");` am Anfang der Ansichts-CSS eingebunden). `packages/ui/test/kandidaten.test.ts` prüft: Jede Datei `ark-*.css` hat hier einen Abschnitt, jeder Abschnitt eine Datei, und die Liste „Verwendete Variablen“ stimmt genau mit den `var(--fm-…)` der Datei überein.

Jedes Ticket schreibt nur in seinen Abschnitt.

## Bausteine aus ARK-7.2

### ark-shell

- **Zweck:** Rahmen jeder Seite: Sprunglink zum Inhalt, Kopfzeile mit Anwendungsname, angemeldetem Principal (Name, Rollen, Mandant, Badge „Agent“) und Abmelden, Hauptnavigation, Hinweisbereich und `main`.
- **Verwendete Variablen:** `--fm-border-subtle-color`, `--fm-border-subtle-style`, `--fm-border-subtle-width`, `--fm-color-background-default`, `--fm-color-background-raised`, `--fm-color-link-rest`, `--fm-color-text-default`, `--fm-color-text-muted`, `--fm-elevation-layer-toast`, `--fm-font-lineheight-label-2`, `--fm-font-size-label-2`, `--fm-font-weight-semibold`, `--fm-layout-container-max`, `--fm-spacing-large`, `--fm-spacing-medium`, `--fm-spacing-small`, `--fm-spacing-xsmall`, `--fm-typography-headline-4-font-family`, `--fm-typography-headline-4-font-size`, `--fm-typography-headline-4-font-weight`, `--fm-typography-headline-4-line-height`
- **API:** `createShell({ navItems, onLogout, homeHref? })` → `{ root, nav, main, notices, setUser(me | null), setContent(node) }`. Kinder: `ark-nav` und der Inhalt der Ansicht in `main`. Abmelden ist ein Kit-Button (`emphasis=low`).
- **Barrierefreiheit:** Landmarken `header`, `nav`, `main` (`id=ark-main`, `tabindex=-1`); Sprunglink setzt den Fokus, ohne die Hash-Route zu ändern; Hinweisbereich mit `aria-live=polite`; „Angemeldet als“ als visuell verborgener Text.
- **Abgrenzung zu vorhandenen Eroj:** Kein Ero vorhanden (Fundamento Phase 4 „Navigation“). Nutzt `fm-butono` für Abmelden; baut kein Ero nach.

### ark-nav

- **Zweck:** Hauptnavigation mit Kennzeichnung der aktuellen Seite und optionalem Zähler je Eintrag (z. B. Versionen in Prüfung).
- **Verwendete Variablen:** `--fm-border-width-strong`, `--fm-color-navigation-hover`, `--fm-color-navigation-rest`, `--fm-color-navigation-selected`, `--fm-color-navigation-text-rest`, `--fm-color-navigation-text-selected`, `--fm-color-status-info-subtle`, `--fm-color-status-info-text`, `--fm-focus-offset`, `--fm-font-lineheight-label-2`, `--fm-font-size-label-2`, `--fm-font-weight-bold`, `--fm-font-weight-semibold`, `--fm-radius-full`, `--fm-radius-role-control`, `--fm-size-icon-medium`, `--fm-size-target-min`, `--fm-spacing-small`, `--fm-spacing-xsmall`, `--fm-typography-label-1-font-family`, `--fm-typography-label-1-font-size`, `--fm-typography-label-1-font-weight`, `--fm-typography-label-1-line-height`
- **API:** `createNav(items: { key, label, href }[], label?)` → `{ root, setActive(key | null), setCount(key, count | null, description?) }`.
- **Barrierefreiheit:** `nav` mit `aria-label`; aktuelle Seite mit `aria-current="page"` und zusätzlich fett und unterstrichen (nicht nur Farbe); Zähler mit gesprochener Beschreibung („1 Version in Prüfung“), Ziffer `aria-hidden`; Mindestzielgröße `--fm-size-target-min`.
- **Abgrenzung zu vorhandenen Eroj:** `fm-ligilo` ist ein einzelner Link ohne Zustand „aktuelle Seite“ und ohne Zähler; die Navigation ist ein eigener Baustein (Fundamento Phase 4 „Navigation“). Native `<a>` mit Navigations-Tokens `--fm-color-navigation-*`.

### ark-page

- **Zweck:** Rahmen einer Ansicht: genau eine `h1` (Fokusziel nach jedem Routenwechsel), Badges neben dem Titel, Untertitel, Aktionsleiste und Abschnitte mit `h2`.
- **Verwendete Variablen:** `--fm-color-text-muted`, `--fm-focus-ring-color`, `--fm-focus-ring-style`, `--fm-focus-ring-width`, `--fm-spacing-large`, `--fm-spacing-small`
- **API:** `page({ title, subtitle?, badges?, actions? }, ...children)` → `<section class="ark-page">`; `section(title, ...children)` → Abschnitt mit `h2`.
- **Barrierefreiheit:** Überschriftenhierarchie `h1` → `h2`; `h1` mit `tabindex=-1` für das Fokus-Management des Routers; Fokusring über die Kit-Tokens.
- **Abgrenzung zu vorhandenen Eroj:** Kein Ero vorhanden (Seitenraster). Aktionen sind Kit-Buttons; höchstens einer mit `emphasis=high` je Aktionsleiste.

### ark-table

- **Zweck:** Datentabelle mit Beschriftung, Spaltenköpfen, Zeilenköpfen, leerem Zustand und optional sortierbaren Spalten.
- **Verwendete Variablen:** `--fm-border-subtle-color`, `--fm-border-subtle-style`, `--fm-border-subtle-width`, `--fm-color-background-default`, `--fm-color-background-sunken`, `--fm-color-text-muted`, `--fm-color-text-subtle`, `--fm-font-lineheight-label-1`, `--fm-font-size-label-1`, `--fm-font-weight-semibold`, `--fm-radius-role-surface`, `--fm-spacing-medium`, `--fm-spacing-small`, `--fm-spacing-xsmall`
- **API:** `table({ caption, columns: { key, header, cell(row), sort?, numeric?, rowHeader? }[], rows, empty?, sort?, onSort?, hideCaption? })` → Wrapper `div.ark-table`; `sortRows(rows, compare, direction)` (stabil).
- **Barrierefreiheit:** `<caption>`, `th scope=col`, Zeilenkopf `th scope=row`; Sortierung als native Schaltfläche im Spaltenkopf, Zustand über `aria-sort`; leerer Zustand als Zelle über alle Spalten; breite Tabellen scrollen in einer fokussierbaren Region mit `aria-label`.
- **Abgrenzung zu vorhandenen Eroj:** Kein Ero vorhanden (Fundamento Phase 4 „Daten“).

### ark-dialog

- **Zweck:** Modaler Dialog für Bestätigungen und Entscheidungen mit Pflicht-Begründung (Freigeben, Zurückgeben, Ablehnen, Pflicht setzen, Ausmustern, Befund verwerfen).
- **Verwendete Variablen:** `--fm-border-default-color`, `--fm-border-default-style`, `--fm-border-default-width`, `--fm-color-backdrop`, `--fm-color-background-raised`, `--fm-color-text-default`, `--fm-elevation-shadow-modal`, `--fm-radius-role-surface`, `--fm-size-container-small`, `--fm-spacing-large`, `--fm-spacing-medium`, `--fm-spacing-small`
- **API:** `openDialog({ title, message?, content?, confirmLabel, cancelLabel?, intent?, reason?: "required" | "optional" | "none", reasonLabel?, reasonHelp? })` → `Promise<{ reason, idempotencyKey } | null>`; in Ansichten über `ctx.ask(spec)`.
- **Barrierefreiheit:** Natives `<dialog>` mit `showModal` (Fokusfalle und Escape durch den Browser), `aria-labelledby` auf den Titel; Fokus beim Öffnen auf die Begründung, beim Schließen zurück zum Auslöser; Bestätigen bleibt bei Pflicht-Begründung gesperrt, bis Text eingegeben ist.
- **Abgrenzung zu vorhandenen Eroj:** Kein Ero vorhanden (Fundamento Phase 4 „Feedback“). Schaltflächen sind `fm-butono` (Bestätigen `emphasis=high`, zerstörend `intent=danger`; Abbrechen `emphasis=low`), Begründung ist `ark-textarea`.

### ark-badge

- **Zweck:** Kurzes Statusetikett mit Text: Lebenszyklus (Entwurf … Zurückgezogen), Pflicht („Pflicht, keine Ausnahmen möglich“), Konformität (konform, Verstöße, nicht geprüft), Schwere (Hinweis, Abweichung, Pflichtverstoß), Befundzustand, „zu groß“ (Zeichen und Schwelle), „Agent“.
- **Verwendete Variablen:** `--fm-border-subtle-style`, `--fm-border-subtle-width`, `--fm-color-action-primary-text`, `--fm-color-background-sunken`, `--fm-color-border-default`, `--fm-color-brand-fill`, `--fm-color-status-danger-border`, `--fm-color-status-danger-subtle`, `--fm-color-status-danger-text`, `--fm-color-status-info-border`, `--fm-color-status-info-subtle`, `--fm-color-status-info-text`, `--fm-color-status-success-border`, `--fm-color-status-success-subtle`, `--fm-color-status-success-text`, `--fm-color-status-warning-border`, `--fm-color-status-warning-subtle`, `--fm-color-status-warning-text`, `--fm-color-text-subtle`, `--fm-radius-full`, `--fm-spacing-small`, `--fm-spacing-xsmall`, `--fm-typography-label-2-font-family`, `--fm-typography-label-2-font-size`, `--fm-typography-label-2-font-weight`, `--fm-typography-label-2-line-height`
- **API:** `badge(text, { tone?: "neutral" | "info" | "success" | "warning" | "danger" | "brand", description? })`; Varianten `stateBadge`, `mandatoryBadge`, `conformanceBadge`, `severityBadge`, `findingStateBadge`, `oversizedBadge(chars, threshold)`, `agentBadge`.
- **Barrierefreiheit:** Zustand nie nur über Farbe: jedes Badge trägt Text; die lange Fassung steht als `title` und als visuell verborgener Text.
- **Abgrenzung zu vorhandenen Eroj:** Kein Ero vorhanden (Fundamento Phase 4 „Feedback“).

### ark-notice

- **Zweck:** Hinweis für Info, Erfolg, Warnung und Fehler; zeigt Problem-Details der REST-API als deutschen Text mit den Validierungsfehlern und ihrem Pfad.
- **Verwendete Variablen:** `--fm-border-default-style`, `--fm-border-default-width`, `--fm-border-width-strong`, `--fm-color-status-danger-border`, `--fm-color-status-danger-weak`, `--fm-color-status-info-border`, `--fm-color-status-info-weak`, `--fm-color-status-success-border`, `--fm-color-status-success-weak`, `--fm-color-status-warning-border`, `--fm-color-status-warning-weak`, `--fm-color-text-default`, `--fm-color-text-muted`, `--fm-font-lineheight-caption`, `--fm-font-size-caption`, `--fm-font-weight-semibold`, `--fm-radius-role-surface`, `--fm-spacing-large`, `--fm-spacing-medium`, `--fm-spacing-small`, `--fm-spacing-xsmall`
- **API:** `notice({ kind: "info" | "success" | "warning" | "error", title?, message?, problem?, onDismiss? })`; in Ansichten über `ctx.notify(notice)`.
- **Barrierefreiheit:** Fehler mit `role=alert`, sonst `role=status`; der Hinweisbereich der Shell ist `aria-live=polite`; Schließen ist ein Kit-Button mit Beschriftung.
- **Abgrenzung zu vorhandenen Eroj:** Kein Ero vorhanden (Fundamento Phase 4 „Feedback“).

### ark-markdown

- **Zweck:** Sichere Darstellung von Markdown-Inhalten (Standards, Vorschläge, Vorschau) mit eigenem Parser: Überschriften ab `h2`, Absätze, Hervorhebungen, Inline-Code, Codeblöcke, Zitate, Listen bis Tiefe 3, Pipe-Tabellen, Trennlinien, Links nur mit sicheren Zielen.
- **Verwendete Variablen:** `--fm-border-default-color`, `--fm-border-default-style`, `--fm-border-default-width`, `--fm-border-strong-color`, `--fm-border-strong-style`, `--fm-border-strong-width`, `--fm-border-subtle-color`, `--fm-border-subtle-style`, `--fm-border-subtle-width`, `--fm-color-background-sunken`, `--fm-color-text-subtle`, `--fm-font-weight-semibold`, `--fm-radius-role-control`, `--fm-radius-small`, `--fm-spacing-large`, `--fm-spacing-medium`, `--fm-spacing-small`, `--fm-spacing-xsmall`
- **API:** `markdownView(source, label?)` → `div.ark-markdown`; darunter `parseMarkdown(text) → MdNode[]` und `renderMarkdown(nodes)` (nur `createElement`/`textContent`).
- **Barrierefreiheit:** Überschriften eine Ebene tiefer als die Seite; Tabellen mit `th scope=col`; Links mit sichtbarer Unterstreichung (Browser-Standard) und `rel="noopener noreferrer"`; Ausrichtung über `data-align`, nicht über Inline-Stil.
- **Abgrenzung zu vorhandenen Eroj:** Kein Ero vorhanden. Links im Fließtext sind native `<a>` (Inhalt ist Daten, kein Navigationselement der Anwendung); `fm-ligilo` bleibt der Navigation vorbehalten.

### ark-textarea

- **Zweck:** Mehrzeiliges Textfeld (Markdown-Inhalt, Begründungen), das im Kit fehlt („multi-line … not covered yet“).
- **Verwendete Variablen:** `--fm-border-default-color`, `--fm-border-default-style`, `--fm-border-default-width`, `--fm-border-width-strong`, `--fm-color-background-default`, `--fm-color-border-disabled`, `--fm-color-border-strong`, `--fm-color-status-danger-border`, `--fm-color-status-danger-text`, `--fm-color-text-default`, `--fm-color-text-disabled`, `--fm-color-text-muted`, `--fm-font-lineheight-caption`, `--fm-font-size-caption`, `--fm-radius-role-control`, `--fm-spacing-small`, `--fm-spacing-xsmall`, `--fm-typography-body-1-font-family`, `--fm-typography-body-1-font-size`, `--fm-typography-body-1-line-height`, `--fm-typography-code-font-family`, `--fm-typography-code-font-size`, `--fm-typography-code-line-height`, `--fm-typography-label-1-font-family`, `--fm-typography-label-1-font-size`, `--fm-typography-label-1-font-weight`, `--fm-typography-label-1-line-height`
- **API:** `textArea({ label, value?, name?, rows?, required?, disabled?, readonly?, placeholder?, help?, error?, code?, onInput? })` → `{ root, control, value(), setValue(v), setError(message | null), focus() }`.
- **Barrierefreiheit:** Sichtbares `<label for>`; Hilfe und Fehler über `aria-describedby`; Fehler setzt `aria-invalid` und steht als Text (nicht nur roter Rahmen); Pflicht sichtbar markiert und `aria-required`.
- **Abgrenzung zu vorhandenen Eroj:** Ergänzt `fm-kampo` (einzeilig) um die mehrzeilige Eingabe; gleiche Regeln wie das Kit (Label als Nomen, Fehler sagt, was zu tun ist).

### ark-tabs

- **Zweck:** Reiter, z. B. Inhalt, Versionen, Regeln, Geltung, Befunde, Audit im Standard-Detail; der gewählte Reiter steht in der Route (`?tab=`).
- **Verwendete Variablen:** `--fm-border-default-color`, `--fm-border-default-style`, `--fm-border-default-width`, `--fm-border-width-strong`, `--fm-color-brand-fill`, `--fm-color-text-default`, `--fm-color-text-subtle`, `--fm-focus-ring-color`, `--fm-focus-ring-style`, `--fm-focus-ring-width`, `--fm-font-weight-bold`, `--fm-size-target-min`, `--fm-spacing-medium`, `--fm-spacing-xsmall`, `--fm-stroke-solid`, `--fm-typography-label-1-font-family`, `--fm-typography-label-1-font-size`, `--fm-typography-label-1-font-weight`, `--fm-typography-label-1-line-height`
- **API:** `tabs({ label, tabs: { id, label }[], selected, onSelect(id), panel })` → `div.ark-tabs`.
- **Barrierefreiheit:** WAI-ARIA-Tabs-Muster: `tablist`/`tab`/`tabpanel`, `aria-selected`, `aria-controls`, `aria-labelledby`, Roving-Tabindex, Pfeiltasten, Pos1/Ende; gewählter Reiter zusätzlich fett mit Unterstrich.
- **Abgrenzung zu vorhandenen Eroj:** Kein Ero vorhanden; `fm-elekto` ist eine Auswahl in Formularen, kein Ansichtswechsel.

### ark-keyvalue

- **Zweck:** Schlüssel-Wert-Liste für Metadaten (Standard, Version, Prüflauf).
- **Verwendete Variablen:** `--fm-color-text-muted`, `--fm-font-lineheight-label-2`, `--fm-font-size-label-2`, `--fm-size-container-small`, `--fm-spacing-large`, `--fm-spacing-small`, `--fm-spacing-xsmall`
- **API:** `keyValueList(items: { key, value }[], label?)` → `dl.ark-keyvalue`; leere Werte zeigen „–“.
- **Barrierefreiheit:** Semantisch `dl`/`dt`/`dd`; optional `aria-label`.
- **Abgrenzung zu vorhandenen Eroj:** Kein Ero vorhanden (Fundamento Phase 4 „Daten“).

### ark-state

- **Zweck:** Lade- und Leerzustand einer Seite oder eines Abschnitts.
- **Verwendete Variablen:** `--fm-border-subtle-color`, `--fm-border-subtle-width`, `--fm-color-brand-fill`, `--fm-color-text-muted`, `--fm-motion-duration-slow`, `--fm-motion-easing-standard`, `--fm-opacity-disabled`, `--fm-radius-full`, `--fm-radius-role-surface`, `--fm-size-icon-small`, `--fm-spacing-large`, `--fm-spacing-small`, `--fm-stroke-dashed`
- **API:** `loadingState(text?)`, `emptyState(text?, ...extra)` → `div.ark-state` mit `data-kind=loading|empty`.
- **Barrierefreiheit:** Laden mit `role=status` und `aria-busy`; die Animation nimmt ihre Dauer aus `--fm-motion-duration-slow`, die das Kit bei reduzierter Bewegung auf 0 setzt; Text statt reinem Indikator.
- **Abgrenzung zu vorhandenen Eroj:** Kein Ero vorhanden (Fundamento Phase 4 „Feedback“).

### ark-form

- **Zweck:** Senkrechtes Formular mit Feldern und Aktionsleiste (Anmeldung, Entwurf, Pin).
- **Verwendete Variablen:** `--fm-size-container-medium`, `--fm-spacing-large`, `--fm-spacing-medium`, `--fm-spacing-small`
- **API:** `form({ label?, onSubmit, fields, actions })` → `form.ark-form` (`novalidate`; `submit` ruft `onSubmit` genau einmal).
- **Barrierefreiheit:** Formular mit `aria-label`; Fehler stehen an den Feldern (Kit-Slot `error`, `ark-textarea`), nicht in Browser-Blasen.
- **Abgrenzung zu vorhandenen Eroj:** Kein Ero vorhanden (Fundamento Phase 4 „Formular“). Felder sind `fm-kampo`, `fm-elektilo`, `fm-elekto`, `fm-markobutono`, `fm-sxaltilo` und `ark-textarea`; Absenden ist `fm-butono type=submit`.

### Lücken im Kit, die ARK-7.2 ohne eigenen Baustein überbrückt

- `fm-kampo` kennt keine verdeckte Eingabe (`kind` nur `text`, `email`, `tel`, `url`, `search`): Die Token-Anmeldung zeigt das Token als Klartext (nur lokale Entwicklung, Q68). Kandidat: `kind=password` oder eine verdeckte Variante.
- Eingabe mit Enter: Das innere `<input>` von `fm-kampo` liegt im Shadow DOM und sendet kein umgebendes `<form>` ab; der Adapter bildet Enter auf `onEnter` ab.

## Bausteine aus ARK-7.3

### ark-filterbar

- **Zweck:** Filterleiste über einer Liste (Katalog): Filterfelder in einer umbrechenden Zeile, Aktionen wie „Filter zurücksetzen“ und eine Statuszeile mit der Trefferzahl („3 von 7 Standards“). Die Filter stehen in der Route; die Leiste ordnet nur an.
- **Verwendete Variablen:** `--fm-border-subtle-style`, `--fm-border-subtle-width`, `--fm-color-background-raised`, `--fm-color-border-subtle`, `--fm-color-text-muted`, `--fm-font-lineheight-caption`, `--fm-font-size-caption`, `--fm-radius-role-surface`, `--fm-size-container-small`, `--fm-spacing-medium`, `--fm-spacing-small`
- **API:** `filterBar({ label, fields, actions? })` → `{ root, setStatus(text) }`; `root` ist `div.ark-filterbar` mit `.ark-filterbar__fields` (Kit-Felder, Raster mit Mindestbreite ein Viertel von `--fm-size-container-small`), `.ark-filterbar__footer` (Status, Aktionen). Ereignisse kommen von den Feldern selbst (`change`, `input`).
- **Barrierefreiheit:** Landmarke `role=search` mit `aria-label`; die Trefferzahl steht in einer `role=status`-Zeile (`aria-live=polite`), damit Screenreader die Wirkung eines Filters hören, ohne dass der Fokus das Feld verlässt; jedes Feld trägt sein sichtbares Label (Kit).
- **Abgrenzung zu vorhandenen Eroj:** Kein Ero vorhanden; nutzt `fm-elektilo` und `fm-kampo kind=search` als Felder und `fm-butono emphasis=low` für das Zurücksetzen. Lücke im Kit: `fm-elektilo` behandelt den Wert `""` als „nichts gewählt“ (deaktivierte Platzhalter-Option); eine Option „Alle“ braucht daher einen eigenen Wert (hier `__all`). Kandidat: eine leere, wählbare Option.

### ark-markdown-editor

- **Zweck:** Markdown-Quelltext mit Live-Vorschau (neue Version, Entwurf bearbeiten): links das mehrzeilige Feld (`ark-textarea`, Code-Schrift), rechts die Vorschau über `ark-markdown`; nebeneinander, wenn Platz ist (je mindestens die Hälfte von `--fm-size-container-medium`), sonst untereinander.
- **Verwendete Variablen:** `--fm-border-subtle-style`, `--fm-border-subtle-width`, `--fm-color-background-raised`, `--fm-color-border-subtle`, `--fm-color-text-muted`, `--fm-radius-role-surface`, `--fm-size-container-medium`, `--fm-spacing-large`, `--fm-spacing-medium`, `--fm-spacing-small`, `--fm-typography-label-1-font-family`, `--fm-typography-label-1-font-size`, `--fm-typography-label-1-font-weight`, `--fm-typography-label-1-line-height`
- **API:** `markdownEditor({ label, value, name?, help?, required?, rows?, previewLabel, previewEmpty, onInput? })` → `{ root, value(), setError(message | null), focus() }`; die Vorschau folgt jedem `input` des Felds.
- **Barrierefreiheit:** Feld mit sichtbarem Label, Hilfe und Fehlertext wie `ark-textarea`; die Vorschau ist ein per `aria-labelledby` benannter Abschnitt („Vorschau“) ohne Live-Region, damit nicht jeder Tastendruck vorgelesen wird; Inhalte nur per DOM-Aufbau (kein `innerHTML`, Link-Schemata begrenzt).
- **Abgrenzung zu vorhandenen Eroj:** Kein Ero vorhanden; `fm-kampo` ist einzeilig und ohne Vorschau. Baut auf den Kandidaten `ark-textarea` und `ark-markdown` auf.

## Bausteine aus ARK-7.4

### ark-diff

- **Zweck:** Zeilen-Diff für Prüfer (Q70, Freigabe-Warteschlange): Unterschied zwischen der gültigen Version und der Version in Prüfung als Tabelle mit alter und neuer Zeilennummer, Markierung (`+`, `−`) und Zeileninhalt als Text; lange unveränderte Abschnitte werden zu einer Zeile „… n unveränderte Zeilen“ zusammengefasst (3 Zeilen Kontext je Änderung). Die Berechnung ist eine reine Funktion ohne Abhängigkeit (`diffLines(alt, neu)` über die längste gemeinsame Teilfolge, Zeilenenden CRLF/CR = LF, Kappung bei 4 000 000 Tabellenzellen: dann wird der geänderte Mittelteil als ganz entfernt und ganz hinzugefügt gezeigt), dazu `diffStats` und `diffSegments`; beides ist mit dem Baustein Kandidat.
- **Verwendete Variablen:** `--fm-border-subtle-color`, `--fm-border-subtle-style`, `--fm-border-subtle-width`, `--fm-color-background-default`, `--fm-color-background-sunken`, `--fm-color-status-danger-subtle`, `--fm-color-status-danger-text`, `--fm-color-status-success-subtle`, `--fm-color-status-success-text`, `--fm-color-text-muted`, `--fm-color-text-subtle`, `--fm-focus-ring-color`, `--fm-focus-ring-style`, `--fm-focus-ring-width`, `--fm-font-family-body`, `--fm-font-family-code`, `--fm-font-lineheight-code`, `--fm-font-size-code`, `--fm-font-weight-semibold`, `--fm-radius-role-surface`, `--fm-spacing-medium`, `--fm-spacing-small`, `--fm-spacing-xsmall`
- **API:** `diffView({ caption, lines, context? })` → `div.ark-diff` (Tabelle `.ark-diff__table`, Zeilen `.ark-diff__row[data-kind=equal|insert|delete|skip]`); Daten aus `diffLines(oldText, newText) → { kind, text, oldNumber, newNumber }[]`, `diffStats(lines) → { inserted, deleted, unchanged }`, `diffSegments(lines, context = 3)`. Keine Ereignisse, keine Slots.
- **Barrierefreiheit:** Natives `<table>` mit sichtbarer `<caption>` (nennt die Vergleichsversion) und Spaltenköpfen `scope=col`; Änderung nie nur über Farbe: sichtbare Markierung `+`/`−` (für Screenreader verborgen) plus visuell verborgenes Wort „hinzugefügt“/„entfernt“/„unverändert“; Zeileninhalt immer als Text (kein HTML, auch nicht `<script>` aus Agentenvorschlägen); breite Diffs scrollen in einer fokussierbaren Region mit `aria-label`; Zeilennummern und Markierung sind nicht markierbar (`user-select: none`), damit Kopieren nur den Inhalt nimmt.
- **Abgrenzung zu vorhandenen Eroj:** Kein Ero vorhanden (Fundamento Phase 4 „Daten“). Ähnelt `ark-table` (Caption, Region), braucht aber Zeilen-Tönung je Art, Code-Schrift und zusammengefasste Abschnitte; ein späteres Tabellen-Ero könnte das über Zeilen-Varianten abdecken. Ein Wort- oder Zeichen-Diff innerhalb einer Zeile ist nicht enthalten.

### Lücken im Kit, die ARK-7.4 ohne eigenen Baustein überbrückt

- **Datum:** `fm-kampo` kennt keine Datumseingabe (`kind` nur `text`, `email`, `tel`, `url`, `search`). Das Ablaufdatum eines Pins ist daher ein Textfeld im Format `JJJJ-MM-TT` mit Beispiel als Platzhalter; die Ansicht prüft Format, Kalendertag und „in der Zukunft“ selbst (`validatePin`) und schickt das Ende des Tages in UTC. Kandidat: `kind=date` mit Mindestdatum.
- **Prozentanzeige:** Die Pflicht-Übersicht zeigt die Konformität als Zahl („66 % von 3 prüfbaren“) plus Status-Badge; ein Fortschritts-/Messbalken-Ero fehlt. Kandidat: ein Meter-Ero (Wert, Bereich, Text-Alternative), das „nicht geprüft“ anders darstellt als 0 %.
- **Zeilenaktionen:** Mehrere kleine Schaltflächen in einer Tabellenzeile (Geltung: „Auf gültig zurück“, „Pin ändern“, „Entfernen“) sind einzelne `fm-butono size=small`; ein Menü- oder Aktionsgruppen-Ero fehlt.

## Bausteine aus ARK-7.5

Alle drei liegen in `src/web/views/drift/` (eingebunden über `drift.css`) und werden auch von den Ansichten Lauf (`views/check`) und Audit (`views/audit`) genutzt.

### ark-command-hint

- **Zweck:** Ein Befehl, der außerhalb der Oberfläche auszuführen ist, als markierbarer Code mit Beschriftung; im Prüflauf-Ergebnis ohne Lauf: `arkitekturo check --project <key> --dir <pfad>` (Prüfläufe startet die CLI oder ein Agent, Q67).
- **Verwendete Variablen:** `--fm-border-subtle-color`, `--fm-border-subtle-style`, `--fm-border-subtle-width`, `--fm-color-background-sunken`, `--fm-color-text-default`, `--fm-color-text-subtle`, `--fm-font-size-label-2`, `--fm-radius-role-surface`, `--fm-spacing-medium`, `--fm-spacing-small`, `--fm-spacing-xsmall`
- **API:** `commandHint(caption, command)` → `figure.ark-command-hint` mit `figcaption` und `pre > code` (Text nur über `textContent`).
- **Barrierefreiheit:** `figure`/`figcaption` benennen den Befehl; der Code ist normaler, markierbarer Text (`user-select: all` markiert ihn mit einem Klick ganz); breite Befehle scrollen waagrecht statt abgeschnitten zu werden.
- **Abgrenzung zu vorhandenen Eroj:** Kein Ero vorhanden (Code-Darstellung, Fundamento Phase 4 „Inhalt“). Eine Kopier-Schaltfläche wäre ein `fm-butono` daneben; bewusst weggelassen (keine Zwischenablage-Berechtigung nötig).

### ark-source-excerpt

- **Zweck:** Fundstelle eines Befunds: `Datei:Zeile` und der Ausschnitt der Zeile, immer als Text (Inhalte aus Manifesten sind Daten, 9.5).
- **Verwendete Variablen:** `--fm-color-background-sunken`, `--fm-color-text-subtle`, `--fm-font-weight-semibold`, `--fm-radius-role-control`, `--fm-spacing-small`, `--fm-spacing-xsmall`
- **API:** `sourceExcerpt(location, excerpt | null)` → `div.ark-source-excerpt` mit `code.ark-source-excerpt__location` und optional `pre.ark-source-excerpt__line > code`.
- **Barrierefreiheit:** Steht als Zeilenkopf (`th scope=row`) in der Befundtabelle, benennt also die Zeile; lange Pfade und Zeilen brechen um (`overflow-wrap: anywhere`), nichts wird nur abgeschnitten.
- **Abgrenzung zu vorhandenen Eroj:** Kein Ero vorhanden (Code-Ausschnitt, Fundamento Phase 4 „Inhalt“/„Daten“).

### ark-query-filters

- **Zweck:** Eine umbrechende Zeile von Filterfeldern, deren Werte in der Route stehen (`?state=&severity=&standard=` im Prüflauf-Ergebnis, `?standard=&project=` im Audit); Ändern navigiert, Neuladen behält die Filter.
- **Verwendete Variablen:** `--fm-size-container-small`, `--fm-spacing-medium`
- **API:** `queryFilters(groupLabel, ...fields)` → `div.ark-query-filters` (`role=group`, `aria-label`); Kinder sind Kit-Felder (`selectField` des Adapters).
- **Barrierefreiheit:** Gruppe mit Namen; jedes Feld trägt seine eigene sichtbare Beschriftung (Kit); kein Absenden nötig, die Seite lädt nach der Auswahl neu und setzt den Fokus auf die `h1`.
- **Abgrenzung zu vorhandenen Eroj:** `fm-elektilo` ist ein einzelnes Feld; die Anordnung mehrerer Filter und ihre Bindung an die Route fehlen (Fundamento Phase 4 „Formular“/„Daten“). Baut kein Ero nach.

## Bausteine aus ARK-8.3

Keine neuen Bausteine (keine neue Datei `ark-*.css`). L7 erweitert drei Bausteine aus ARK-7.2 um Optionen, ohne neue `--fm-*`-Variablen:

- **ark-dialog, Formular-Variante:** `openFormDialog({ title, message?, fields, confirmLabel, cancelLabel?, className?, confirmDisabled?, onConfirm(idempotencyKey) → Promise<boolean>, onClose?(confirmed) })` → `{ root, problems, setConfirmDisabled(disabled), close() }`. Natives `<dialog>` mit `showModal`, darin ein `form` (`novalidate`) mit Feldern, Problembereich und Aktionen (Abbrechen, Bestätigen als `type=submit`); bleibt offen, bis `onConfirm` `true` liefert; je Versuch ein frischer Idempotency-Key; Escape und „Abbrechen“ schließen ohne Aktion, der Fokus kehrt zum Auslöser zurück. Genutzt vom Dialog „Metadaten bearbeiten“ (`views/standard/metadata-dialog.ts`). Kandidat für Fundamento: ein Dialog-Ero mit Formular-Slot (Phase 4 „Overlay“); der Bestätigungsdialog von ARK-7.2 wäre dessen einfachster Fall.
- **ark-notice, Aktionen:** Option `actions` (Kinder, z. B. eine Kit-Schaltfläche) vor der Schließen-Schaltfläche; genutzt für den Warnhinweis „Import unbestätigt“ mit „Metadaten bearbeiten“. In `ark-notice.css` nur Anordnung (`--fm-spacing-small`, bereits verwendet).
- **ark-table, leere Zellen:** Eine Zelle ohne Inhalt (`null`, `undefined`, `false`, `""`) zeigt „–“ wie `ark-keyvalue` (QA L6 Punkt 8).

### Lücken im Kit, die ARK-8.3 ohne eigenen Baustein überbrückt

- **Select-Platzhalter mit leerem Wert:** `fm-elektilo` zeigt seinen `placeholder` als zusätzliche, deaktivierte Option, solange der Wert `""` ist. Eine eigene Option „keine Auswahl“ bzw. „Alle“ mit Wert `""` erscheint deshalb doppelt (QA L6 Punkt 4). Überbrückung: interne Werte `__all` (Katalog) und `__none` (Audit) ohne Kit-Platzhalter. Kandidat: eine Option „leere Auswahl“ des Ero (Beschriftung einstellbar, Wert `""`), die den Platzhalter ersetzt statt ihn zu ergänzen.
- **Zahlenfeld:** `fm-kampo` kennt `kind` text, email, tel, url, search, aber keine ganze Zahl. „Vorrang“ (`precedence`) ist ein Textfeld mit Prüfung im Browser (ganze Zahl oder leer). Kandidat: `kind="number"` bzw. ein Ganzzahl-Modus mit Fehlermeldung.
- **Filter als Schalter:** „nur unbestätigte“ im Katalog ist ein `fm-sxaltilo` (wirkt sofort, wie die übrigen Filter); eine Filterleiste mit gemischten Feldern bleibt `ark-filterbar` aus ARK-7.3.
