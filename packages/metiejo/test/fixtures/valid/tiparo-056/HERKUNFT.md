# Herkunft der Testschrift (Spec 056, KBS-3.5, Plan D-26)

Eine frei lizenzierte Schrift (SIL Open Font License 1.1) für die Tests `tiparo-legi-056`,
`zip-legi-056` und `schriftdosieroj-056`. Einmal aus npm geholt am 2026-11-16; die Tests lesen nur
diese Dateien und gehen nicht ins Netz.

- Paket: `@fontsource/lato`, Version `5.3.0`, Lizenz `OFL-1.1`
- Adresse: https://registry.npmjs.org/@fontsource/lato/-/lato-5.3.0.tgz
- SHA-256 des Pakets: `50db251f16e9a6c35fe0177b4692b7ec78478b9734c9272d980a75343638aa5c`
- Geholt mit `npm pack @fontsource/lato@5.3.0` in einen Ordner außerhalb des Repos.

| Datei | Aus dem Paket | SHA-256 |
|---|---|---|
| `lato-latin-400-normal.woff2` | `files/lato-latin-400-normal.woff2` | `918b7dc3e2e2d015c16ce08b57bcb64d2253bafc1707658f361e72865498e537` |
| `lato-latin-700-normal.woff2` | `files/lato-latin-700-normal.woff2` | `c447dd7677b419db7b21dbdfc6277c7816a913ffda76fd2e52702df538de0e49` |
| `lato-latin-400-normal.woff` | `files/lato-latin-400-normal.woff` | `f55abc76e10cc86d799a7189e64e3c6e4cc6ced19b2474b1852a808be46232a8` |
| `lato-latin-700-normal.woff` | `files/lato-latin-700-normal.woff` | `98149dd994189af57b3867d308874c7acb05edd3351663ccca860b87044479db` |
| `LICENSE` | `LICENSE` (Lizenztext OFL 1.1, unverändert) | `9648253641ec1d1f8ba2fbe8997909f7bfc48cc38537946f6272321788465b84` |
| `lato-400-700.zip` | gebaut, siehe unten | `fde86afcda680dba89ce5b9d0b583cf430371014eb8f9eb348da146598599cd9` |

`lato-400-700.zip` wurde mit `zip -X -D -9` gebaut (Verfahren Deflate) und enthält drei Einträge:
`lato/lato-latin-400-normal.woff2` (Regular), `lato/lato-latin-700-normal.woff2` (Bold) und
`lato/OFL.txt` (der Lizenztext `LICENSE`, als Datei, die keine Schrift ist).
