# Research – Spec 006, ECONNRESET

**Stand:** 2026-10-06 · **Gemessen:** im CI (`ubuntu-latest`, Node aus `.nvmrc`) und lokal (macOS, Node 24.21.0) · **Wie:** Probe in Wegwerf-Zweigen. Sie besteht nur aus Listenern und einem durchgereichten `fetch` und ändert kein Verhalten. Die Zweige sind entfernt, ihr Stand liegt in den Tags `mess/econnreset-*`.

## 1. Die roten Läufe vor der Messung

| CI-Lauf | Commit | Fassung | Dauer „serves the tools“ |
|---|---|---|---|
| 35999002038 | `62a09af` (#31) | `main` | 175 ms |
| 36012438009 | `a7ba401` (#34) | `beforeAll` | 8799 ms |
| 36014222864 | `43c69e0` (#34) | `beforeAll` | 9393 ms |
| 36098626052 | `f94486b` (#34) | `beforeAll` | 9225 ms |
| 36106130928 | `6b15133` (#34, push) | `beforeAll` | 7745 ms |
| 36106135003 | `6b15133` (#34, PR) | `beforeAll` | 9088 ms |

In allen Läufen derselbe Fehler: `TypeError: fetch failed`, `Caused by: Error: read ECONNRESET`, `{ errno: -104, code: 'ECONNRESET', syscall: 'read' }`. Keiner der Logs enthält einen Stacktrace, der den fallenden Aufruf nennt.

## 2. Die Probe

- **Server** (`http.ts`, nur Listener): Grenzwerte (`keepAliveTimeout` 5000, `headersTimeout` 60000, `requestTimeout` 300000). Je Socket werden `open`, `timeout`, `end`, `error` und `close` protokolliert, dazu der Leerlauf seit der letzten Antwort. Je Anfrage die laufende Nummer, der Socket und der Leerlauf vor der Anfrage.
- **Client**: `fetch` unverändert an `StreamableHTTPClientTransport` durchgereicht. Protokolliert werden Beginn, Antwort mit `connection` und `keep-alive`, Fehler mit `cause.code` und die JSON-RPC-Methode.
- **Test**: Zeitstempel bei Rückkehr von `connect()`, vor und nach `listTools()` und vor und nach `callTool describe`.
- **Event-Loop**: `monitorEventLoopDelay`, ausgegeben als größte Verzögerung seit dem letzten Zurücksetzen.

## 3. Messung 1 und 5: natürliche Läufe

| Fassung | CI-Lauf | Test | connect → listTools | Loop-Lag in dem Abschnitt | Kompilieren vor `tools/call#2` |
|---|---|---|---|---|---|
| `main` | 37368076646 | grün | 1749 ms | 1748 ms | — |
| #34 | 37368054129 (2) | grün | 1 ms | 12 ms | 1606 ms |
| #34 | 37371050199 (2) | grün | 5 ms | 12 ms | 1040 ms |
| #34 | 37371050199 (3) | grün | — | — | 670 ms |
| #34 | 37371050199 (4) | grün | — | — | 1147 ms |
| #34 | 37371050199 (5) | grün | — | — | 1118 ms |

Lokal dauert dasselbe Kompilieren 93 ms. Zwei weitere Versuche bekamen keinen Runner („The job was not acquired by Runner of type hosted“). Sie sind keine Messwerte.

Zusätzlich auf `main`: Der GET des Clients (SSE-Stream, 405) startete bei 20504 ms, der Server las ihn erst bei 22272 ms. Die Anfrage lag 1,8 s ungelesen im Socket. In der Importphase betrug der Loop-Lag 18 908 ms.

**Die Quelle der Blockade auf #34:** `@modelcontextprotocol/client` 2.0.0, `ClientResponseCache.outputValidator` (`dist/index.mjs`, ab Zeile 2192). Ändert sich der Stand von `tools/list`, kompiliert der Client beim nächsten `callTool()` die `outputSchema`s aller gelisteten Tools synchron, nicht nur die des aufgerufenen Tools.

## 4. Punkt 2: Probe und Gegenprobe

Im echten Test wird vor `callTool describe` synchron blockiert:

| Stand | Blockade | `keepAliveTimeout` | lokal | CI |
|---|---|---|---|---|
| unverändert | 0 | 5000 | 2/2 grün | — |
| Probe | 6000 ms | 5000 | 2/2 rot | 37377609398 rot |
| Probe | 8000 ms | 5000 | 2/2 rot | — |
| Gegenprobe | 6000 ms | 0 | 2/2 grün | 37377611301 grün (7,3 s gemessen) |
| Gegenprobe | 8000 ms | 0 | 2/2 grün | — |

Die Probe in CI reproduziert das Original exakt: `errno: -104`, `syscall: 'read'`, `1 failed | 113 passed (114)`, nur „serves the tools“. Die Serverseite zeigt, was passiert:

```
client.fetch.start   tools/call#2
server.socket.timeout  (8 ms danach, drei Sockets)
client.fetch.error   tools/call#2  ECONNRESET
server.socket.close  idleSinceLastResponseMs 6104
```

Ein `server.request` für `tools/call#2` gibt es nicht. Die Anfrage erreicht den Handler nie, der Server schließt die Leitung über den Keep-Alive-Timer.

## 5. Server in einem eigenen Prozess

Gemessen, bevor der Testaufbau umgebaut wird, mit zwei Aufbauten:

- **Minimal:** `node:http`-Server als Kindprozess, zwei Leitungen im Pool, synchrone Blockade im Client, danach zwei `POST`.
- **Echt:** `node dist/index.js --http --port <n>` als Kindprozess, `Client` und `StreamableHTTPClientTransport` aus dem SDK, `connect`, `listTools`, synchrone Blockade, `callTool describe`.

| Aufbau | Blockade | Ergebnis |
|---|---|---|
| Minimal | 0 / 4500 ms | 6/6 grün |
| Minimal | 6000 / 8000 / 13000 ms | 9/9 ECONNRESET |
| Echt | 0 ms | 3/3 grün |
| Echt | 6000 / 8000 ms | 6/6 ECONNRESET |

Zur Abgrenzung derselbe Minimal-Aufbau in **einem** Prozess: 5500 ms 3/3 grün, 6000 bis 13000 ms 9/9 ECONNRESET. Mit `keepAliveTimeout = 0` sind 6000 und 8000 ms 6/6 grün. Ohne Blockade, nur mit Leerlauf über `setTimeout` von 3990 bis 5010 ms, bleibt alles grün. Dann verwirft undici die Leitung rechtzeitig.

**Folgerung:** Die gemeinsame Loop ist keine Bedingung. Bedingung ist eine Blockade der Client-Loop von mehr als rund 6 s, während der Client eine Leitung im Pool hält. Ein eigener Server-Prozess beseitigt das nicht.

## 6. Was nicht gemessen wurde

- **Ein natürlich roter Lauf mit Probe.** Alle natürlichen Messläufe waren grün. Dass die Blockade in den roten Läufen über 6 s lag, ist aus deren Testdauern geschlossen, nicht gemessen.
- **Punkt 3, `--no-file-parallelism` bzw. `singleFork`.** Nicht ausgeführt. Andere Testdateien teilen keine Leitung mit diesem Test. Parallelität wirkt nur als CPU-Last, die die Blockade verlängert. Ein grüner Lauf ohne Parallelität hätte nichts unterschieden.
- **Punkt 4, `preload()`.** Nicht gesondert geprüft. #31 fiel mit `loadServed()` ohne `preload()`, also ist `preload()` keine Voraussetzung.
- **K3 und T2 aus `spec.md`.**
