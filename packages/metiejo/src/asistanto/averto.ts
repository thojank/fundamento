// The texts of Constitution v2.5, Art. VI „Plattform und Herausgeber“ (Spec 033 S1): the notice of
// possible confusability before every export and publication, and the confirmation when a brand
// builds on a foreign one. Shown by the screens, written to the Kroniko with the export and the
// confirmation. And the warnings of the check as messages (Spec 035, Befund 4.5.4): equal warnings
// with an equal suggestion are one message with the number of the steps they are about.

import type { Problemo } from "../klartext.js";

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

/** A warning of the check as the person reads it: one per suggestion, with what it is about. */
export interface Meldung extends Problemo {
  /** How many warnings this message stands for. */
  anzahl: number;
  /** What each of them is about (the subject and its combination), in their order. */
  betroffen: string[];
}

/** The part of a warning after „bei“: what it is about, without the full stop. */
const subjectOf = (satz: string): string => {
  const at = satz.indexOf(" bei ");
  return (at === -1 ? satz : satz.slice(at + 5)).replace(/\.$/, "");
};

/**
 * The warnings as messages (Spec 035, Befund 4.5.4): warnings of the same rule with the same
 * suggestion – the same change, fixed or not alike – become one message that names their number;
 * the order is the order of their first warning.
 */
export function meldungenOf(probleme: readonly Problemo[]): Meldung[] {
  const groups = new Map<string, Problemo[]>();
  for (const problem of probleme) {
    const key = JSON.stringify([
      problem.regulo,
      problem.vorschlag,
      problem.fest,
      problem.apply ?? null,
    ]);
    const group = groups.get(key);
    if (group === undefined) groups.set(key, [problem]);
    else group.push(problem);
  }
  return [...groups.values()].map((group) => {
    const [first] = group as [Problemo, ...Problemo[]];
    const betroffen = group.map((problem) => subjectOf(problem.satz));
    if (group.length === 1) return { ...first, anzahl: 1, betroffen };
    const at = first.satz.indexOf(" bei ");
    const name = at === -1 ? first.satz.replace(/\.$/, "") : first.satz.slice(0, at);
    const noun = betroffen.every((subject) => subject.includes("palette"))
      ? "Farbstufen"
      : "Stellen";
    return {
      ...first,
      satz: `${name} bei ${group.length} ${noun}.`,
      anzahl: group.length,
      betroffen,
    };
  });
}
