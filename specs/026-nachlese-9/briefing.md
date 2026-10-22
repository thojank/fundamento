#101–#103 sind auf main. #104 hat jetzt Konflikte (docs/vojmapo.md, packages/agordilo/fixtures/stufe1-provo.json, aspekto.json von provo und provo-kompakta).

#104 auf main rebasen. Fixtures mit fm agordilo derive neu erzeugen statt von Hand mischen, vojmapo zusammenführen, Ero-Tokens der vier neuen Eroj erzeugen.
B-29 zurücknehmen: Budgets wieder 120 s (fm agordilo derive) und 30 s (Paletten-Reguloj). Wenn das rot wird, rot berichten; die Ursache löst Nachlese 9.
O-1 bis O-16 wie vorgeschlagen.
Danach Nachlese 9 „Tempo“ als eigener PR von main: O-8 (Ero-Tokens in rezolvoj.json nur als Alias-Verweis), Budget des Export-Tests zurück auf 30 s, Ursache finden, warum Ableitung und Export mit den Tokens so stark wachsen und auf dem CI-Rechner zehnmal langsamer sind. Keine Budgets anheben.
