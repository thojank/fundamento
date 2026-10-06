# Spec 006 – ECONNRESET: Keep-Alive und eine blockierte Client-Loop

**Branch:** `006-econnreset` · **Status:** Befund belegt, Produktfrage entschieden (K2, `jug_01M4817FY2CAJEEH6EXPS1QSVJ`) · **Constitution:** keine Änderung · **Erstellt:** 2026-10-06 · **Voraussetzung:** `main` ab `4fd3e94`

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

## Weitere Befunde

**B1 – Das SDK blockiert beim ersten `callTool`, unabhängig von Keep-Alive.** `@modelcontextprotocol/client` 2.0.0 (`ClientResponseCache.outputValidator`, `dist/index.mjs` ab Zeile 2192) kompiliert nach jedem neuen Stand von `tools/list` beim nächsten `callTool()` die `outputSchema`s **aller** gelisteten Tools synchron mit ajv, nicht nur die des aufgerufenen Tools. Gemessen wurden lokal 93 ms und in fünf grünen CI-Läufen 670 bis 1640 ms. In den roten Läufen auf #34 dauerte der ganze Test 7745 bis 9393 ms. Wie viel davon das Kompilieren war, ist **nicht gemessen**, nur dass es über rund 6 s gelegen haben muss, damit der Mechanismus greift. Das trifft jeden Verbraucher dieses SDK gegen diesen Server: Ein Client friert beim ersten Werkzeugaufruf für die Dauer dieses Kompilierens ein, und unter Last kann das länger als `keepAliveTimeout` sein. Fundamento kann das im SDK nicht beheben. Beeinflussen kann es die Größe und Zahl der `outputSchema`s, die es listet. Das ist nicht gemessen und nicht entschieden.

Ein früher `callTool` zum Aufwärmen hilft nicht. Der erste `callTool` nach einem `tools/list` bezahlt das Kompilieren immer, und währenddessen liegt die Leitung aus der vorigen Antwort brach. Ein Aufwärmen verschiebt nur, welcher Aufruf der erste ist. Das ist aus der Messung hergeleitet, nicht gemessen.

**B2 – Eine Prüfung falsch gelesen.** Beim Schreiben dieser Spec liefen `check:vortaro-lint` und `check:clean-room`. Weil die Dateizahl vor und nach dem Commit gleich blieb (653), stand in der ersten Fassung, die beiden Prüfungen läsen `specs/*.md` nicht. Das war falsch. `loadScanTree` listet mit `git ls-files --cached --others` und zählt unversionierte Dateien also mit. Der Scan-Baum enthält beide Dateien dieser Spec. `clean-room` prüft sie auf Benchmark-Pfade und auf Marken-Fingerabdrücke (`.md` steht in `FINGERPRINT_EXTENSIONS`). `vortaro-lint` liest nur Projekcio-CSS und Bezeichner, Markdown gehört nicht zu seinem Gegenstand. Das Maß zeigte nicht an die falsche Stelle, es wurde falsch abgelesen: aus einem Zähler geschlossen statt im Code nachgesehen. Das ist derselbe Fehlertyp wie die Sammelzeit-Erklärung in #34.

**B3 – Eine Eigenschaft des Servers aus dem Protokoll geschlossen.** Der Maintainer begründete die Verwerfung von K3 zunächst mit einer Fallunterscheidung zwischen `POST` und Stream-GET. Streamable HTTP kennt diesen Stream, dieser Server nicht: Jede Anfrage, die kein `POST` ist, beantwortet er mit 405 (`http.ts`, „this stateless server takes POST only“). Die Eigenschaft war aus der Protokollform geschlossen, nicht aus dem Code gelesen. Die Begründung ist aus der Jugxo gestrichen, ohne Ersatz. K3 bleibt verworfen, weil es unbelegt ist, und nur deswegen.

Im selben Briefing standen zwei Behauptungen über den Server, beide aus dem Zweck geschlossen: die Loopback-Bindung und der Stream-GET. Die Loopback-Bindung trifft zu und war als unbelegt gekennzeichnet. Der Stream-GET ist falsch und war als Begründung gesetzt. Gekennzeichnet war die richtige, nicht die falsche.

**B4 – Eine Auflage gegen die falsche Node-Fassung.** Gefordert war, im Teardown `closeIdleConnections()` zu ergänzen, sonst warte `server.close()` auf Leerlauf-Leitungen, die nie von selbst zugehen. Das ging von Node vor 19 aus. Seit Node 19 schließt `server.close()` Leerlauf-Leitungen selbst, und `close()` ruft bereits `closeAllConnections()` auf. Die Auflage war redundant. Gemessen auf Node 24.21 (`research.md` §9): Eine Leerlauf-Leitung hält `close()` nicht auf, mit und ohne `closeAllConnections()`. Eine halb gesendete Anfrage hält `close()` auf, ohne `closeAllConnections()` auch nach 4 s noch. Geprüft wird deshalb dieser Fall, und `closeIdleConnections()` wird nicht hinzugefügt.

## Nicht im Scope

- Den Lauf wiederholen, bis er grün ist. Den Test überspringen oder mit `retry` versehen.
- `keepAliveTimeout` setzen, damit ein Test grün wird. Das wäre eine Antwort auf die Produktfrage, nicht auf den Test.
- Ein natürlich roter Lauf mit Messpunkten. Er fehlt, alle fünf natürlichen Messläufe waren grün. Das ist eine Einschränkung, keine Aufgabe: Die Probe und die Gegenprobe beantworten die Frage.

## Produktfrage

Der Server ist zustandslos: ein `McpServer` je Anfrage, nur auf 127.0.0.1. Keep-Alive spart einem lokalen Client den TCP-Handschlag und sonst nichts. Dafür schließt der Server Leitungen, die der Client noch für lebendig hält, sobald dessen Loop länger als rund 6 s blockiert. undici wiederholt ein `POST` dann nicht.

Zu entscheiden, jeweils mit Kialo:

- **K1:** `keepAliveTimeout` bleibt bei der Voreinstellung von Node. Der Mechanismus wird als bekannte Eigenschaft geführt.
- **K2:** Der Server hält Leerlauf-Leitungen länger oder unbegrenzt (`keepAliveTimeout = 0`). Die Gegenprobe zeigt: Damit verschwindet ECONNRESET. Offen ist, was ungenutzte Leitungen auf einem Loopback-Server kosten.
- **K3:** Der Server beantwortet jede Anfrage mit `Connection: close`. Das passt zur Zustandslosigkeit und kostet je Anfrage einen Handschlag. Nicht gemessen.

## Entscheidung

**K2: `keepAliveTimeout = 0`.** Maintainer, 2026-10-06, festgehalten als `jug_01M4817FY2CAJEEH6EXPS1QSVJ`, bezogen auf Art. III. Gegenstand ist die Verlässlichkeit der MCP-Schnittstelle gegenüber ihrem Agenten-Konsumenten (Art. III, Satz 1), nicht Nutzungskomfort. Art. XIII hat eigene Maße (fünf Minuten, eine Minute), an denen sich eine Socket-Politik nicht prüfen lässt. Art. XI ist geprüft und verworfen: Er regelt Bauaufwand, nicht Schnittstellenverhalten.

**Begründung.** Mit der Voreinstellung schließt der Server eine Leitung, die der Client noch im Pool hält, sobald dessen Loop länger als rund 6 s blockiert, und ein `POST` geht verloren. Die Gegenprobe mit `keepAliveTimeout = 0` ist grün, auch mit dem Server in einem eigenen Prozess (`research.md` §4, §5). Der Server ist zustandslos und nur auf Loopback erreichbar. Ungenutzte Leitungen kosten deshalb nur Dateideskriptoren lokaler Clients, und `close()` schließt alle Leitungen.

**Verworfen:**
- **K1**, weil die Voreinstellung den Fehler im Produkt lässt. Er trifft jeden Client, nicht nur den Test (B1).
- **K3**, weil es unbelegt ist.

**Auflage: Loopback-Bindung.** Die Entscheidung setzt voraus, dass der Server nur an `127.0.0.1` bindet. Geprüft am 2026-10-06 (`research.md` §8): `lsof` zeigt einen einzigen lauschenden Socket `127.0.0.1:<port>`, und Verbindungen über die Nicht-Loopback-Adresse der Maschine und über `::1` werden abgelehnt. Ein eigener Test hält das fest. Ein Verbindungsversuch über eine Nicht-Loopback-Adresse muss scheitern.

**Bedingung, unter der K3 wieder richtig wird:** sobald der Server über `127.0.0.1` hinaus erreichbar ist. Dann sind unbegrenzt gehaltene Leitungen fremder Clients ein Ressourcenrisiko und nicht mehr nur Deskriptoren lokaler Clients. K2 gilt dann nicht mehr, und K3 oder ein endliches Limit ist neu zu entscheiden. Der Bindungstest wird in diesem Fall rot und erzwingt die Neuentscheidung.

## Testaufbau

**T1 – Server in einem eigenen Prozess, wie `quickstart.test.ts`.** Gemessen: Das löst den Mechanismus **nicht** auf, weil die Blockade auf der Client-Seite liegt (`research.md` §5). Der Test-Prozess würde nur die Arbeit des Servers los. Ob das die Blockade im CI unter die Schwelle drückt, ist nicht gemessen. Belegt wäre es dann ohnehin nicht.

**T2 – Der Test-Client nutzt keine Leitung wieder.** Der `StreamableHTTPClientTransport` bekommt ein `fetch`, das jeder Anfrage `connection: close` mitgibt. Gemessen (`research.md` §6):
- Nodes eingebautes `fetch` hält sich daran, ohne zusätzliche Abhängigkeit. Vier Anfragen öffnen vier Sockets.
- Im echten Test mit 6 s künstlicher Blockade vor dem ersten `callTool`: ohne T2 rot wie das Original, lokal 3/3 und in CI. Mit T2 grün, lokal 3/3 und in CI.
- Der Weg über einen eigenen `dispatcher` geht nur über undici-Interna und ist verworfen.

**Auflage, wenn T2 genommen wird:** T2 macht den Test grün, indem es die Bedingung entfernt, unter der der Fehler entsteht. Das ist zulässig, solange der Zweck des Tests ist: „Der Transport bedient die Werkzeuge.“ Danach deckt **kein Test mehr** ab, wie sich der Server gegenüber einem Client verhält, der Leitungen wiederverwendet und dessen Loop länger als `keepAliveTimeout` + 1 s blockiert. Diese Lücke ist bekannt und gemessen, sie wird hier geführt und nicht verschwiegen. Sie schließt sich mit T3, sobald die Produktfrage entschieden ist. Die Probe dafür liegt in `mess/econnreset-falsifikation-block6s` und `mess/econnreset-t2-aus`.

**T2 ist mit der Entscheidung entfallen.** T2 ist gemessen und wirkt (Tags `mess/econnreset-t2-aus`, `mess/econnreset-t2-an`). Es wird nicht gebaut: Mit K2 hält der Server die Leitung, und der Test-Client muss die Wiederverwendung nicht mehr meiden. Damit entfällt auch die Lücke aus der Auflage zu T2. Der Test behält die Wiederverwendung, und T3 prüft den Mechanismus ausdrücklich. Die Tags auf dem Messstand bleiben.

**T3 – Der Test prüft den Mechanismus ausdrücklich.** Abhängig von der Produktfrage: Bei K2 oder K3 belegt ein Test mit erzwungener Blockade von mehr als 6 s, dass der Server die Leitung hält bzw. nicht wiederverwenden lässt. Die Probe dafür existiert (`mess/econnreset-falsifikation-block6s`).

## Abnahme

Für die Reparatur, die aus der Entscheidung folgt:

1. Die Probe aus `mess/econnreset-falsifikation-block6s` (6 s synchrone Blockade vor `callTool describe`), auf den neuen Stand angewandt, ist grün: lokal und in einem CI-Lauf.
2. Die Probe ist auf dem alten Stand rot. Eine Prüfung, die nie rot war, ist keine Prüfung.
3. Weiter geprüft werden: Bindung an 127.0.0.1, die Tools, `validate.aspektoPath` und die DNS-Rebinding-Abwehr.
4. Ändert die Reparatur Produktcode, hat die Produktfrage vorher eine Jugxo mit Kialo (`jug_01M4817FY2CAJEEH6EXPS1QSVJ`).
5. Die Loopback-Bindung hat einen eigenen Test: Ein Verbindungsversuch über eine Nicht-Loopback-Adresse scheitert. Gezeigt wird er rot gegen einen Server ohne Host-Angabe.
6. Eine Leerlauf-Leitung lebt länger als `keepAliveTimeout` + 1 s der Voreinstellung (T3). Rot auf dem alten Stand.
7. Nach `close()` endet der Prozess, auch wenn ein Client eine halb gesendete Anfrage offen hält (B4). Rot ohne `closeAllConnections()` in `close()`, und zwar schnell und lesbar: `close()` läuft gegen eine eigene Frist von 1,5 s und scheitert mit einer Meldung, nicht als Timeout der Suite.

## Belege

Vier annotierte Tags mit Grund und Ergebnis im Tag-Text (Art. VI). Die Wegwerf-Zweige sind entfernt, die Commits über die Tags erreichbar:

| Tag | Was | CI-Lauf |
|---|---|---|
| `mess/econnreset-messung-main` | Messung 1 + 5 auf `main` | 37368076646 |
| `mess/econnreset-messung-pr34` | Messung 1 + 5 auf #34, Messpunkte um `callTool` | 37371050199 (Versuche 2–5) |
| `mess/econnreset-falsifikation-block6s` | 6 s Blockade, Keep-Alive unverändert | 37377609398 (rot, wie das Original) |
| `mess/econnreset-falsifikation-block6s-ka0` | 6 s Blockade, `keepAliveTimeout = 0` | 37377611301 (grün) |
| `mess/econnreset-t2-aus` | Stand `main`, 6 s Blockade, Leitungen wiederverwendet | 37420659402 (rot) |
| `mess/econnreset-t2-an` | Stand `main`, 6 s Blockade, T2 (`connection: close`) | 37420661627 (grün) |
