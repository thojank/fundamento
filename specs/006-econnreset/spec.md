# Spec 006 – ECONNRESET: Keep-Alive und eine blockierte Client-Loop

**Branch:** `006-econnreset` · **Status:** Befund belegt, Produktfrage und Testaufbau offen · **Constitution:** keine Änderung · **Erstellt:** 2026-10-06 · **Voraussetzung:** `main` ab `4fd3e94`

## Zweck

`src/resources-http.test.ts > the HTTP transport > serves the tools` fiel in CI wiederholt mit `TypeError: fetch failed` → `read ECONNRESET { errno: -104, syscall: 'read' }`, immer 1 failed | 113 passed (114). Der Fehler sitzt auf `main`: #31 fasst `packages/mcp` nicht an und fiel trotzdem, auf demselben Commit gab es auch einen grünen Lauf.

Diese Spec hält die belegte Ursache fest und trennt zwei Fragen, die der Befund aufwirft:

1. **Produktfrage:** Soll der HTTP-Server seine Keep-Alive-Politik ändern? Der Mechanismus trifft nicht nur den Test, sondern jeden Client, dessen Event-Loop lange genug blockiert.
2. **Testaufbau:** Wie bleibt der Test aussagekräftig, ohne dass er an der Last des CI-Runners hängt?

Beide sind offen. Diese Spec entscheidet sie nicht, sie legt fest, was vor einer Entscheidung belegt ist.

## Befund (belegt)

Messung und Belege in `research.md`. Kurz:

1. Nach jeder Antwort startet der Server je Socket einen Keep-Alive-Timer: `keepAliveTimeout` 5000 ms, plus 1 s, die Node intern aufschlägt.
2. Die Event-Loop des **Clients** blockiert synchron länger als diese rund 6 s. Solange sie blockiert, kann undici seinen eigenen Leerlauf-Timer nicht ausführen und den Socket nicht verwerfen.
3. Der Server schließt den Socket nach Ablauf seines Timers.
4. Die Loop des Clients läuft wieder. undici schreibt die nächste Anfrage auf den Socket aus dem Pool. Die Anfrage erreicht den Request-Handler nie. Der Client liest `read ECONNRESET`.

Woher die Blockade kommt:

- **Fassung von #34 (Verbindung im `beforeAll`):** Der MCP-Client (`@modelcontextprotocol/client` 2.0.0, `outputValidator`) kompiliert beim ersten `callTool()` nach `tools/list` die `outputSchema`s **aller** Tools synchron mit ajv. Das dauerte lokal 93 ms und in grünen CI-Läufen 670 bis 1640 ms. Die roten Läufe auf #34 brauchten für den Test 7745 bis 9393 ms.
- **Fassung von `main` (Verbindung zur Sammelzeit):** Die Blockade liegt vor dem Test, zwischen `connect()` und `listTools()`. Gemessen wurden 1749 ms Loop-Lag in diesem Abschnitt und 18 908 ms in der Importphase. Der rote Test auf #31 dauerte 175 ms.

Widerlegt ist damit:

- **Die Sammelzeit als Ursache.** In der Fassung von #34 liegen zwischen `connect()` und `listTools()` in CI 1 bis 5 ms, und der Test fiel trotzdem.
- **Die gemeinsame Loop als Bedingung.** Mit dem echten `fundamento-mcp --http` als eigenem Prozess und einem echten SDK-Client führen 6 s Blockade im Client-Prozess in 6 von 6 Läufen zu ECONNRESET.

## Nicht im Scope

- Den Lauf wiederholen, bis er grün ist. Den Test überspringen oder mit `retry` versehen.
- `keepAliveTimeout` setzen, damit ein Test grün wird. Das wäre eine Antwort auf die Produktfrage, nicht auf den Test.
- Ein natürlich roter Lauf mit Messpunkten. Er fehlt, alle fünf natürlichen Messläufe waren grün. Das ist eine Einschränkung, keine Aufgabe: Die Probe und die Gegenprobe beantworten die Frage.

## Produktfrage (offen)

Der Server ist zustandslos: ein `McpServer` je Anfrage, nur auf 127.0.0.1. Keep-Alive spart einem lokalen Client den TCP-Handschlag und sonst nichts. Dafür schließt der Server Leitungen, die der Client noch für lebendig hält, sobald dessen Loop länger als rund 6 s blockiert. undici wiederholt ein `POST` dann nicht.

Zu entscheiden, jeweils mit Kialo:

- **K1:** `keepAliveTimeout` bleibt bei der Voreinstellung von Node. Der Mechanismus wird als bekannte Eigenschaft geführt.
- **K2:** Der Server hält Leerlauf-Leitungen länger oder unbegrenzt (`keepAliveTimeout = 0`). Die Gegenprobe zeigt: Damit verschwindet ECONNRESET. Offen ist, was ungenutzte Leitungen auf einem Loopback-Server kosten.
- **K3:** Der Server beantwortet jede Anfrage mit `Connection: close`. Das passt zur Zustandslosigkeit und kostet je Anfrage einen Handschlag. Nicht gemessen.

## Testaufbau (offen)

**T1 – Server in einem eigenen Prozess, wie `quickstart.test.ts`.** Gemessen: Das löst den Mechanismus **nicht** auf, weil die Blockade auf der Client-Seite liegt (`research.md` §5). Der Test-Prozess würde nur die Arbeit des Servers los. Ob das die Blockade im CI unter die Schwelle drückt, ist nicht gemessen. Belegt wäre es dann ohnehin nicht.

**T2 – Der Test-Client nutzt keine Leitung wieder.** Ein `fetch` für den `StreamableHTTPClientTransport`, das jede Anfrage auf einer eigenen Verbindung schickt. Das beseitigt die Voraussetzung des Mechanismus auf der Client-Seite, ohne Produktcode. Dafür prüft der Test Keep-Alive dann nicht mehr. Noch nicht gemessen, insbesondere nicht, ob Nodes `fetch` das ohne zusätzliche Abhängigkeit erlaubt.

**T3 – Der Test prüft den Mechanismus ausdrücklich.** Abhängig von der Produktfrage: Bei K2 oder K3 belegt ein Test mit erzwungener Blockade von mehr als 6 s, dass der Server die Leitung hält bzw. nicht wiederverwenden lässt. Die Probe dafür existiert (`mess/econnreset-falsifikation-block6s`).

## Abnahme

Für die Reparatur, die aus der Entscheidung folgt:

1. Die Probe aus `mess/econnreset-falsifikation-block6s` (6 s synchrone Blockade vor `callTool describe`), auf den neuen Stand angewandt, ist grün: lokal und in einem CI-Lauf.
2. Die Probe ist auf dem alten Stand rot. Eine Prüfung, die nie rot war, ist keine Prüfung.
3. Weiter geprüft werden: Bindung an 127.0.0.1, die Tools, `validate.aspektoPath` und die DNS-Rebinding-Abwehr.
4. Ändert die Reparatur Produktcode, hat die Produktfrage vorher eine Jugxo mit Kialo.

## Belege

Vier annotierte Tags mit Grund und Ergebnis im Tag-Text (Art. VI). Die Wegwerf-Zweige sind entfernt, die Commits über die Tags erreichbar:

| Tag | Was | CI-Lauf |
|---|---|---|
| `mess/econnreset-messung-main` | Messung 1 + 5 auf `main` | 37368076646 |
| `mess/econnreset-messung-pr34` | Messung 1 + 5 auf #34, Messpunkte um `callTool` | 37371050199 (Versuche 2–5) |
| `mess/econnreset-falsifikation-block6s` | 6 s Blockade, Keep-Alive unverändert | 37377609398 (rot, wie das Original) |
| `mess/econnreset-falsifikation-block6s-ka0` | 6 s Blockade, `keepAliveTimeout = 0` | 37377611301 (grün) |
