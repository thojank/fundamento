# Nachlese 12 – Aufgaben

**Briefing:** [`briefing.md`](briefing.md) · **Plan:** [`plan.md`](plan.md) · **Branch:** `261029-nachlese-12-m5-vitrino` (von `main` `05f122d`). Aufgaben ab T3401.

### A – Rot zuerst
- [x] **T3401 Tests** in fünf Dateien, rot in `c74266a`:
  - Nordstelo `src/nachlese-12.test.ts`: System eines anderen Checkouts, Bezeichnung, Abbruch über 20 % ohne Seite. Die Datei lädt nicht.
  - Projekcioj `src/celoj/vitrino/nachlese-12.test.ts`: Kontrastpaare einmal, Island kleiner. 3 rot.
  - Eroj `test/vitrino.check.ts`:
    - M5 mit Urteil
    - Gegenprobe 80 ms
    - Urteil mit den CI-Werten
    - gleiche Tabelle in jeder Dichte und Bewegung

    M5 und Gegenprobe rot, die übrigen liefen seriell nicht.
  - `test/m5.ts`: das Urteil (Testhilfe).
  - Doku-Test.

### B – Grün
- [x] **T3402 ② Werkzeug** (D-02), `269b4ff`:
  - `sistemo.ts`
  - `--sistemo`, `--hoechstens-ohne-seite`
  - `providerSchema` für ältere Systeme
  - `mergeLedger` (B-2)
- [x] **T3403 ③ M5** (D-03): `measure()` mit `perChange` und `scriptLongest`; M5 und G5 mit dem Urteil.
- [x] **T3404 ④ Vitrino** (D-04): `kunpremiMezurojn`, `malkunpremiMezurojn`, Island und Client. `datumoj.test.ts` und `bazo.test.ts` nachgezogen.

### C – Messung und Abschluss
- [x] **T3405 ① H und K nach der Fonto** aus `/tmp/n12-main` (`05f122d`):
  - H `20261029-1126`: F 74,2 gegen 0 35,2 (Spec 030: 69 gegen 72,9), 314 Anfragen, ≤ 0,81 $
  - K `20261029-1127`: F 76 gegen 0 33,3 (Spec 030: 74,9 gegen 47,6), 333 Anfragen, 0 $
  - `restaro` je 0 abweichend
- [ ] **T3406 ② Reihe O** mit `/tmp/n12-o-reihe.sh`: drei Messpunkte, Kontingent 1 000 Anfragen am Tag.
- [x] **T3407 Größe und Pixelvergleich der Vitrino:** komuna und ekzemplo 15,1 → 7,7 MB, 16 von 16 Abschnitten pixelgleich.
- [ ] **T3408 M5 in der CI:** mindestens zehn Läufe nach der Änderung, nach Runner-Klasse; Dauer der Vitrino-Jobs vorher und nachher.
- [x] **T3409 Doku:** plan, tasks, Vojmapo.
- [x] **T3410 Zweite Gegenprobe von M5** (Nachtrag des Maintainers vom 29.10.): Stil und Layout von 80 ms ohne langes Skript. Rot in `7d53853`, die Hilfe `stilBlockadeEinbauen` grün. Gemessen: 97 ms je Umschalten, Skripte 9 ms, Perzentil 207 ms.
- [x] **T3411 B-4:** Ein Ergebnis ohne Seite zählt seinen eigenen Aufwand. Rot in `c136046`, grün im Folgecommit.

### Messungen

| Was | Wert |
|---|---|
| Commits | rot `c74266a`, Werkzeug ② `269b4ff`, grün im Folgecommit (Hash im PR) |
| Vitrino-Check lokal | 65 von 65, M5 Skripte 0 ms, Perzentil 0 ms; Gegenprobe Skripte 81 ms, Perzentil 100 ms |
| Unit-Tests | Modelo 3 870, Projekcioj 1 164, MCP 442, Metiejo 193, CLI 76, Agordilo 113, Nordstelo 66 |
