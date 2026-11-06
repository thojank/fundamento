# Spec 043 – Aufgaben

**Spec:** [`spec.md`](spec.md) · **Plan:** [`plan.md`](plan.md) · **Basis:** `main` `e5057afc`. Genau vier Tickets (Spec, „Tickets“; Anhang C). Rote Commits enden auf „(rot)“, grüne auf „(grün)“; Doku-Commits beginnen mit „Spec 043:“ und sind einzeln. Häkchen mit SHAs.

Ein Strang, ein PR (T1 → T2 → T3 → T4). Lokal nur die geänderten Spec-Dateien, nie zwei Playwright-Suiten gleichzeitig, `FM_AUSGABE=knapp`, je Wackel-Test höchstens 30 Wiederholungen.

| Ticket | Inhalt | Dateien | Stand | rot → grün |
|---|---|---|---|---|
| T1 | N-8 aus Spec 042: abgebrochenen, leeren oder alten Vorschau-Rahmen ereignisgesteuert sofort neu anfordern (D-1 bis D-3); Gerüst `specs/043-nachbesserung-042/` | `specs/043-nachbesserung-042/{spec,plan,tasks}.md`, `packages/eroj/test/buehne-navigation-042.spec.ts` (neuer Test), `packages/metiejo/src/**` (nur N-8) | in Arbeit | – |
| T2 | `seiteBereit` auf `readyState !== "loading"`; Firefox-Fehler im Navigationstest klären (F-2, D-4) | `packages/eroj/test/geladen-042.ts`, `zweitfarbe-036.spec.ts`, `buehne-navigation-042.spec.ts` | offen | – |
| T3 | Übernahme WebKit: N-3-Startmuster, POST mit `connection: close` | `packages/eroj/test/metiejo-036-uebernahme.spec.ts` | offen | – |
| T4 | Diff-Suche, ein PR, ein Push, genau ein `workflow_dispatch`, Bericht | `specs/043-nachbesserung-042/{plan,tasks}.md` | offen | – |

## T1 im Einzelnen

- [x] G-0: Quelle und Kopie 4590 Byte, SHA-256 `b260ae62fbf95cba5a08454d32f5a78e615743ee57369b17cd45789b57701949`, kopiert mit `cp`.
- [ ] G-0 nach dem Commit erneut: `git show HEAD:specs/043-nachbesserung-042/spec.md | shasum -a 256` gleich.
- [ ] Roter Test in `buehne-navigation-042.spec.ts`: Bühne bereit, `page.reload()`, erste Anfrage des Rahmens „Jetzt“ mit `route.abort` abgebrochen, dann `rahmenBereit(page, JETZT, { rev, scheme: "light" })` unter der Standard-Wartezeit – rot in Chromium, Firefox, WebKit.
- [ ] Fix in `packages/metiejo/src/**`, ereignisgesteuert, kein neuer Timer; höchstens eine sofortige Neuanforderung je erwarteter URL; ein richtig geladener Rahmen bekommt keine zweite `src`.
- [ ] Neuer Test grün je Engine (≥ 10, ≤ 30 Wiederholungen), Trefferquoten hier.
- [ ] Bestehender Navigationstest grün je Engine, genau eine `src` je Anlass und Rahmen.
- [ ] `pnpm --filter @fundamento/metiejo test` grün (`stato-041.test.ts`: ein Takt, `3000`).
- [ ] Natürliche N-8-Nachstellung (Firefox, Neuladen direkt nach `sendDraft`, ≤ 30): Trefferquote hier.
- [ ] Diff dieses Tickets ohne neue Wörter der Diff-Suche (Anhang C); einzige Treffer sind die zwei Zeilen der byte-gleich kopierten `spec.md` (Regel 0 und Abnahme, sie zitieren die Wortliste).

## T2 im Einzelnen

- [ ] (offen)

## T3 im Einzelnen

- [ ] (offen)

## T4 im Einzelnen

- [ ] (offen)
