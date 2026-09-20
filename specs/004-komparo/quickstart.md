# Quickstart – Spec 004, Etappe A

Was nach der Etappe möglich ist, in Befehlen. Voraussetzung wie immer: Node 24 (`nvm use`), `pnpm install`, `pnpm build`.

## 1. Die Vitrino ansehen (S1)

```sh
pnpm fm projekcioj build --out .fundamento/projekcioj
open .fundamento/projekcioj/vitrino/index.html        # macOS; sonst im Browser öffnen
```

Eine Datei, kein Server, keine externen Ressourcen. Oben die Schalter: Aspekto, Farbschema, Kontrast, Dichte, Viewport, Motion. Jeder Klick schaltet ohne Neuladen, die Zahlen unter den Farben ändern sich mit. Der Zustand steht im URL-Fragment, ein Screenshot ist damit teilbar.

## 2. Zwei Marken nebeneinander (S2)

```sh
pnpm fm projekcioj build --config packages/modelo/test/fixtures/valid/aspekto-ekzemplo/fundamento.config.json \
  --out .fundamento/projekcioj
```

Mit einem Vergleichsstand zeigt die Kontrastmatrix je Paar auch die Veränderung:

```sh
pnpm fm projekcioj build --config packages/modelo/test/fixtures/valid/aspekto-ekzemplo/fundamento.config.json \
  --bazo specs/004-komparo/mezuroj-main.json --out .fundamento/projekcioj
```

Der Vergleichsstand selbst entsteht mit `pnpm fm modelo mezuroj --out <datei>` auf dem Stand, gegen den verglichen werden soll.

In der Vitrino „Gegenüberstellung" wählen: links komuna, rechts ekzemplo, gleiche Kombination, je Kriterium beide Werte und die Kennzeichnung vorn / gleich / hinten. In Etappe B kommt `komparo` als dritte Wahl dazu, ohne Änderung an der Vitrino.

## 3. Die neuen Reguloj sehen und verstehen

```sh
pnpm -s fm modelo validate --json | jq '.errors[] | {rule, path, message}'   # was eine Regel findet
pnpm -s fm mcp                                                               # oder über den Gvidanto:
#   explain_regulo { "name": "contrast-reserve" }  → Aussage, Kialo, Schwelle, Verstöße je Aspekto
#   explain { "token": "color.background.raised" } → warum dieser Wert, welche Reguloj gelten
```

## 4. Prüfungen

```sh
pnpm check:vitrino        # axe, Umschalten, Gegenüberstellung, echtes fm-butono
pnpm check:alirebleco     # Kontrast aller Paare in allen Kombinationen, jetzt mit Reserve-Regulo
pnpm check:clean-room --spuroj <datei>   # zusätzliche Fingerprintliste eines Benchmark-Aspekto
pnpm check                # alles, in der Reihenfolge der CI
```

## 5. Eine eigene Marke gegen die neuen Ziele prüfen

```sh
pnpm fm modelo validate --aspekto ../fundamento-aspekto-<name>
```

Die acht neuen Reguloj gelten für jede Aspekto. Wer eine Marke ableitet, bekommt die Verstöße mit Messwert, Sollwert und Kialo – und weiß damit, welche Stufe zu verschieben ist.
