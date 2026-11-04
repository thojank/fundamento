// The plan of a run (C-1, V-2): at most five screens with file-name slugs, edges only between
// planned screens. `validiPlanon` is pure and returns every problem at once ([] = valid).

import type { Plano, Problemo } from "./tipoj.js";

/** V-2: a run builds at most five screens. */
export const MAKS_EKRANOJ = 5;
/** V-3: at most three rounds of check and improve. */
export const MAKS_RONDOJ = 3;
/** A slug is the file name of a screen: lower-case words of letters and digits joined by `-`. */
export const SLUG_FORMO = /^[a-z0-9]+(-[a-z0-9]+)*$/;

/** The rules `validiPlanon` reports. */
export type PlanoRegulo =
  | "plan-empty"
  | "plan-too-many-screens"
  | "slug-invalid"
  | "slug-duplicate"
  | "text-empty"
  | "edge-unknown-screen"
  | "edge-duplicate";

const problemo = (
  path: string,
  rule: PlanoRegulo,
  message: string,
  suggestion: string,
): Problemo => ({ path, rule, message, suggestion });

/** Every problem of a plan, in document order: purpose, screens, edges. */
export function validiPlanon(plano: Plano): Problemo[] {
  const problems: Problemo[] = [];
  if (plano.celo.trim() === "") {
    problems.push(
      problemo(
        "/celo",
        "text-empty",
        "Der Plan nennt keinen Zweck.",
        "Den Zweck in einem Satz nennen.",
      ),
    );
  }
  if (plano.ekranoj.length === 0) {
    problems.push(
      problemo(
        "/ekranoj",
        "plan-empty",
        "Der Plan hat keinen Screen.",
        "Mindestens einen Screen planen.",
      ),
    );
  } else if (plano.ekranoj.length > MAKS_EKRANOJ) {
    problems.push(
      problemo(
        "/ekranoj",
        "plan-too-many-screens",
        `Der Plan hat ${plano.ekranoj.length} Screens, höchstens ${MAKS_EKRANOJ} sind erlaubt.`,
        `Auf die ${MAKS_EKRANOJ} wichtigsten Screens kürzen.`,
      ),
    );
  }

  const slugs = new Set<string>();
  plano.ekranoj.forEach((ekrano, index) => {
    const at = `/ekranoj/${index}`;
    if (!SLUG_FORMO.test(ekrano.slug)) {
      problems.push(
        problemo(
          `${at}/slug`,
          "slug-invalid",
          `Der Slug „${ekrano.slug}“ ist kein Dateiname der Form a-b-1.`,
          "Kleinbuchstaben und Ziffern, Wörter mit „-“ verbunden.",
        ),
      );
    } else if (slugs.has(ekrano.slug)) {
      problems.push(
        problemo(
          `${at}/slug`,
          "slug-duplicate",
          `Der Slug „${ekrano.slug}“ kommt zweimal vor.`,
          "Jedem Screen einen eigenen Slug geben.",
        ),
      );
    }
    slugs.add(ekrano.slug);
    for (const field of ["titolo", "celo"] as const) {
      if (ekrano[field].trim() === "") {
        problems.push(
          problemo(
            `${at}/${field}`,
            "text-empty",
            `Der Screen „${ekrano.slug}“ hat keinen Text in „${field}“.`,
            field === "titolo" ? "Einen Titel nennen." : "Den Zweck des Screens nennen.",
          ),
        );
      }
    }
  });

  const edges = new Set<string>();
  plano.kantoj.forEach((kanto, index) => {
    const at = `/kantoj/${index}`;
    let known = true;
    for (const end of ["de", "al"] as const) {
      if (!slugs.has(kanto[end])) {
        known = false;
        problems.push(
          problemo(
            `${at}/${end}`,
            "edge-unknown-screen",
            `Die Kante führt ${end === "de" ? "von" : "zu"} „${kanto[end]}“, einem Screen, der nicht im Plan steht.`,
            "Nur geplante Screens verbinden.",
          ),
        );
      }
    }
    const key = `${kanto.de}\u0000${kanto.al}`;
    if (known && edges.has(key)) {
      problems.push(
        problemo(
          at,
          "edge-duplicate",
          `Die Kante von „${kanto.de}“ zu „${kanto.al}“ steht zweimal im Plan.`,
          "Jede Kante einmal planen.",
        ),
      );
    }
    edges.add(key);
  });
  return problems;
}
