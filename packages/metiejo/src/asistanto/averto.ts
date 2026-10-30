// The texts of Constitution v2.5, Art. VI „Plattform und Herausgeber“ (Spec 033 S1): the notice of
// possible confusability before every export and publication, and the confirmation when a brand
// builds on a foreign one. Shown by the screens, written to the Kroniko with the export and the
// confirmation.

/** The notice before every export and publication (Constitution v2.5, Art. VI, 2). */
export const AVERTO_EKSPORTO =
  "Hinweis vor Export und Veröffentlichung: Prüfe, ob die Marke mit einer bestehenden Marke verwechselt werden kann (mögliche Verwechselbarkeit, Art. VI). Die Verantwortung für Marken- und Urheberrechte trägst du; Fundamento ist hier Plattform.";

/**
 * The notice for a brand: with a foreign basis (Spec 033 S4: a naming, an upload, a link), it names
 * the foreign brand and that the result stays local – a test rebuild is never published (Art. VI).
 */
export function avertoOf(fremda?: { nomo?: string }): string {
  if (fremda === undefined) return AVERTO_EKSPORTO;
  const which = fremda.nomo === undefined ? "einer bestehenden Marke" : `„${fremda.nomo}“`;
  return `${AVERTO_EKSPORTO} Diese Marke baut auf ${which} auf: Das Ergebnis bleibt lokal und wird nicht veröffentlicht.`;
}

/** The confirmation when a brand builds on a foreign one (Art. VI, 1). */
export const KONFIRMO_TEKSTO =
  "Ich habe die Rechte an dieser Marke oder übernehme die Verantwortung für Marken- und Urheberrechte.";
