# Auftrag Sitzung C – Benchmark Astryx ins Kern-Repo, Fingerprint-Regeln, Ursache `perf`

**Erstellt:** 2026-10-24 · **Voraussetzung:** `main` · **Zielpfad:** `specs/032-benchmark-astryx-kern/briefing.md`

**Regel 0** gilt. **Keine Budgets anheben.**

## ① Datei des Benchmarks ins Kern-Repo
- **Freigabe des Maintainers (24.10.):** `ergebnis/research/benchmark-astryx-2026-10.md` aus `https://github.com/thojank/fundamento-benchmark-astryx` (PR #1, HEAD `a745aea`) wird **unverändert** ins Kern-Repo übernommen, an dieselbe Stelle und in derselben Art wie die Datei des Benchmarks Carbon.
- Aus dem Benchmark-Repo wird **nur diese eine Datei** gelesen, sonst nichts (Art. V).

## ② Fingerprints in der Clean-Room-Prüfung
Ein Probelauf ergab auf `main` 36 Treffer: 29 Schriftnamen im Schriftkatalog der Werkstatt, 6 triviale Grauwerte und 1 Zufallstreffer. Entscheidung des Maintainers (24.10.):
1. **Schriftnamen sind keine Fingerprints.** Nach Art. V ist der Name einer Schriftfamilie Beobachtung, kein Quellmaterial. Die Prüfung nimmt Fingerprints der Art Schriftfamilie aus, für alle Benchmarks.
2. **Triviale Werte zählen nicht.** Ausgenommen sind Reinweiß, Reinschwarz und reine Grautöne (R = G = B), Null-Werte sowie die Werte 0, 1, 2 und 4 px. Die Regel steht als Daten mit Kialo.
3. **Der Zufallstreffer** wird als Jugxo festgehalten, mit Begründung.
4. Werte mit gültigem Fonto-Nachweis bleiben ausgenommen (Amendment v2.4). Das ist erst nach dem Merge von Spec 029 ① (#111) auf `main`; bis dahin stapelt dieser PR darauf oder wartet.
5. Danach laufen die Fingerprints von Carbon und Astryx in `check:clean-room` in der CI mit. **Ergebnis auf `main`: 0 Treffer.**

## ③ Ursache für `perf`
- Der erste, kalte Aufruf von `check_contrast` braucht auf dem Mac des Maintainers 106 bis 123 ms bei einem Budget von 100 ms, auf `main` wie auf Branches. Das ist O-1 aus Nachlese 9, weiter offen.
- **Die Ursache finden, nicht das Budget anheben** (Regel des Maintainers vom 16.10.). Mögliche Ursachen: Laden und Parsen des Modelo beim ersten Aufruf, Aufbau von Indizes, JIT. Messen, Ursache belegen, beheben, zum Beispiel durch vorbereitete Daten im Build oder Laden beim Start des Servers statt beim ersten Aufruf.
- Abnahme: `pnpm perf` grün auf dem Mac des Maintainers, fünf Läufe nacheinander, im Bericht mit Median und Maximum.

## Auftrag P0
- Ein PR von `main`. ② wartet auf den Merge von #111 oder stapelt darauf.
- Rote Tests zuerst. Bericht im bekannten Format.
- Messanleitung mit vollständigen Pfaden im Checkout `/Users/thorstenjankowski/n8n-compose/20260918_fundamento-ds`, `cd` und `file://`-Links.
- ciferecigo kommt nirgends vor.
