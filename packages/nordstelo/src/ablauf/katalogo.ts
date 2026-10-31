// The catalogue of the task type „ganzer Ablauf“ (Spec 037, Lieferliste 2.1, D-23): five flows of
// three to five linked screens each. Every screen has a slug (its file name and stable id), a title,
// a purpose, the Sxablono and the Eroj a good answer uses, and its acceptance criteria in the kinds
// of the Modelo catalogue (NordsteloKontrolo: aria, named-fields, elemento with an F and a 0
// selector, teksto). The flows are not in the Modelo: no ULIDs, nothing in ids.lock.json or
// data/** (D-01). For `score()` a screen becomes a Tasko in memory only (`taskoDe`); the weights of
// the score stay in the Modelo catalogue and are never copied here. Contents are neutral and
// invented (D-13): „Standard A-12“, „Team Nord“, „Konto 4711“.

import {
  type Kanto,
  MAKS_EKRANOJ,
  type Plano,
  type PlanoEkrano,
  type Problemo,
  validiPlanon,
} from "@fundamento/ekranoj";
import type { Kriterio, NordsteloKontrolo, NordsteloTeksto, Tasko } from "@fundamento/modelo";

/** The number of flows the source spec fixes (Lieferliste 2.1). */
export const ABLAUF_TASKOJ_NOMBRO = 5;
/** Fewest screens of a flow (Lieferliste 2.1); the most is the limit of ekranoj (V-2). */
export const ABLAUF_EKRANOJ_MIN = 3;

/** One acceptance criterion of a screen: the Regulo it stands for, its text and its check. */
export interface AblaufKriterio {
  regulo: string;
  teksto: NordsteloTeksto;
  kontrolo: NordsteloKontrolo;
}

/** One screen of a flow: the plan entry (German) plus English, the expected means and criteria. */
export interface AblaufEkrano extends PlanoEkrano {
  en: { titolo: string; celo: string };
  /** The Sxablono a good answer uses (as in the Modelo catalogue; not scored). */
  sxablono: string;
  /** The Eroj a good answer uses (not scored). */
  eroj: string[];
  kriterioj: AblaufKriterio[];
}

/** One flow: its slug, title and purpose, its screens and the planned edges between them. */
export interface AblaufTasko {
  slug: string;
  titolo: NordsteloTeksto;
  celo: NordsteloTeksto;
  ekranoj: AblaufEkrano[];
  kantoj: Kanto[];
}

const t = (de: string, en: string): NordsteloTeksto => ({ de, en });

// Criteria used on many screens, in the words of the Modelo catalogue.
const namedFields = (): AblaufKriterio => ({
  regulo: "field-label-visible",
  teksto: t("Jedes Feld hat eine sichtbare Beschriftung.", "Every field has a visible label."),
  kontrolo: { kind: "named-fields" },
});
const oneHeading = (): AblaufKriterio => ({
  regulo: "heading-levels-in-order",
  teksto: t("Genau eine Überschrift der ersten Ebene.", "Exactly one first-level heading."),
  kontrolo: { kind: "aria", role: "heading", level: 1, min: 1, max: 1 },
});
const onePrimary = (): AblaufKriterio => ({
  regulo: "one-primary-per-container",
  teksto: t("Genau eine primäre Aktion.", "Exactly one primary action."),
  kontrolo: { kind: "elemento", F: "fm-butono[emphasis=high]", min: 1, max: 1 },
});
const action = (de: string, en: string, name: string): AblaufKriterio => ({
  regulo: "label-names-action",
  teksto: t(de, en),
  kontrolo: { kind: "aria", role: "button", name, min: 1 },
});
const emailField = (): AblaufKriterio => ({
  regulo: "field-label-names-the-datum",
  teksto: t("Ein Feld für die E-Mail-Adresse.", "A field for the email address."),
  kontrolo: { kind: "elemento", F: "fm-kampo[kind=email]", "0": "input[type=email]", min: 1 },
});
const passwordField = (): AblaufKriterio => ({
  regulo: "field-label-names-the-datum",
  teksto: t("Ein Feld für das Passwort.", "A field for the password."),
  kontrolo: {
    kind: "elemento",
    F: "fm-kampo[kind=password]",
    "0": "input[type=password]",
    min: 1,
  },
});
const attributeList = (de: string, en: string): AblaufKriterio => ({
  regulo: "heading-levels-in-order",
  teksto: t(de, en),
  kontrolo: { kind: "elemento", F: "fm-atributlisto", "0": "dl", min: 1 },
});
const namedTable = (de: string, en: string, role = "table"): AblaufKriterio => ({
  regulo: "table-caption-names-the-content",
  teksto: t(de, en),
  kontrolo: { kind: "aria", role, name: ".", min: 1 },
});
const step = (n: number): AblaufKriterio => ({
  regulo: "heading-levels-in-order",
  teksto: t(
    `Die Seite sagt, dass man in Schritt ${n} von 3 ist.`,
    `The page says it is step ${n} of 3.`,
  ),
  kontrolo: { kind: "teksto", pattern: `(schritt|step)\\s*${n}\\s*(von|of|/)\\s*3` },
});
const next = (): AblaufKriterio =>
  action(
    "Ein Knopf führt zum nächsten Schritt.",
    "A button leads to the next step.",
    "weiter|nächst|next|continue",
  );
const dateField = (de: string, en: string): AblaufKriterio => ({
  regulo: "field-label-visible",
  teksto: t(de, en),
  kontrolo: { kind: "elemento", F: "fm-datelektilo", "0": "input[type=date]", min: 1 },
});

/** The five flows (Lieferliste 2.1), in the order of the source spec. */
export const ABLAUF_TASKOJ: readonly AblaufTasko[] = [
  {
    slug: "anmelden-und-konto",
    titolo: t("Anmelden und Konto", "Sign-in and account"),
    celo: t(
      "Mitglieder von Team Nord melden sich an, legen ein Konto an, setzen ein vergessenes Passwort zurück und sehen ihr Konto 4711.",
      "Members of Team Nord sign in, create an account, reset a forgotten password and see their account 4711.",
    ),
    ekranoj: [
      {
        slug: "anmelden",
        titolo: "Anmelden",
        celo: "Mit E-Mail und Passwort anmelden; Wege zu „Konto anlegen“ und „Passwort vergessen“.",
        en: {
          titolo: "Sign in",
          celo: "Sign in with email and password; ways to “Create account” and “Forgot password”.",
        },
        sxablono: "formularo",
        eroj: ["kampo", "butono", "ligilo"],
        kriterioj: [
          namedFields(),
          emailField(),
          passwordField(),
          action(
            "Der Knopf nennt die Aktion, etwa „Anmelden“.",
            "The button names the action, such as “Sign in”.",
            "anmeld|einlogg|sign ?in|log ?in",
          ),
        ],
      },
      {
        slug: "registrieren",
        titolo: "Konto anlegen",
        celo: "Ein neues Konto mit Name, E-Mail und Passwort anlegen.",
        en: {
          titolo: "Create account",
          celo: "Create a new account with name, email and password.",
        },
        sxablono: "formularo",
        eroj: ["kampo", "butono", "ligilo"],
        kriterioj: [
          namedFields(),
          emailField(),
          onePrimary(),
          action(
            "Der Knopf nennt die Aktion, etwa „Konto anlegen“.",
            "The button names the action, such as “Create account”.",
            "konto anlegen|registrier|create account|sign ?up",
          ),
        ],
      },
      {
        slug: "passwort-vergessen",
        titolo: "Passwort zurücksetzen",
        celo: "Einen Link zum Zurücksetzen des Passworts an die E-Mail-Adresse senden.",
        en: {
          titolo: "Reset password",
          celo: "Send a link to reset the password to the email address.",
        },
        sxablono: "formularo",
        eroj: ["kampo", "butono", "ligilo"],
        kriterioj: [
          namedFields(),
          emailField(),
          action(
            "Der Knopf nennt die Aktion, etwa „Link senden“.",
            "The button names the action, such as “Send link”.",
            "zurücksetz|senden|reset|send",
          ),
        ],
      },
      {
        slug: "konto",
        titolo: "Mein Konto",
        celo: "Die Angaben von Konto 4711 sehen und sich abmelden.",
        en: { titolo: "My account", celo: "See the details of account 4711 and sign out." },
        sxablono: "pagxo",
        eroj: ["titolo", "atributlisto", "butono"],
        kriterioj: [
          oneHeading(),
          attributeList(
            "Die Angaben stehen als Liste von Begriff und Wert.",
            "The details are a list of term and value.",
          ),
          {
            regulo: "heading-levels-in-order",
            teksto: t("Die Seite nennt das Konto 4711.", "The page names the account 4711."),
            kontrolo: { kind: "teksto", pattern: "4711" },
          },
          {
            regulo: "label-names-action",
            teksto: t("Man kann sich abmelden.", "One can sign out."),
            kontrolo: {
              kind: "aria",
              role: "button|link",
              name: "abmeld|sign ?out|log ?out",
              min: 1,
            },
          },
        ],
      },
    ],
    kantoj: [
      { de: "anmelden", al: "registrieren" },
      { de: "anmelden", al: "passwort-vergessen" },
      { de: "anmelden", al: "konto" },
      { de: "registrieren", al: "anmelden" },
      { de: "passwort-vergessen", al: "anmelden" },
      { de: "konto", al: "anmelden" },
    ],
  },
  {
    slug: "liste-filter-detail",
    titolo: t("Liste mit Filter und Detail", "List with filter and detail"),
    celo: t(
      "Standards wie „Standard A-12“ in einer Liste suchen und filtern, einen Standard im Detail ansehen und seinen Verlauf prüfen.",
      "Search and filter standards such as “Standard A-12” in a list, open one in detail and check its history.",
    ),
    ekranoj: [
      {
        slug: "standards-liste",
        titolo: "Standards",
        celo: "Alle Standards als Tabelle mit Suche und einem Filter nach Status.",
        en: {
          titolo: "Standards",
          celo: "All standards as a table with search and a filter by status.",
        },
        sxablono: "filtrilo",
        eroj: ["kampo", "elektilo", "tabelo", "insigno", "ligilo"],
        kriterioj: [
          {
            regulo: "field-label-visible",
            teksto: t("Ein Suchfeld mit Namen.", "A search field with a name."),
            kontrolo: { kind: "aria", role: "searchbox|textbox", name: "such|search", min: 1 },
          },
          {
            regulo: "field-label-visible",
            teksto: t("Ein Auswahlfeld für den Status.", "A choice field for the status."),
            kontrolo: {
              kind: "elemento",
              F: "fm-elektilo,fm-listelektilo,fm-plurelektilo,fm-elekto",
              "0": "select,input[type=radio]",
              min: 1,
            },
          },
          namedTable("Die Tabelle hat eine Beschriftung.", "The table has a caption."),
          namedFields(),
        ],
      },
      {
        slug: "standard-detail",
        titolo: "Standard A-12",
        celo: "Die Eigenschaften eines Standards; zurück zur Liste und weiter zum Verlauf.",
        en: {
          titolo: "Standard A-12",
          celo: "The properties of one standard; back to the list and on to its history.",
        },
        sxablono: "pagxo",
        eroj: ["titolo", "atributlisto", "insigno", "spuro", "ligilo"],
        kriterioj: [
          oneHeading(),
          attributeList(
            "Die Eigenschaften stehen als Liste von Begriff und Wert.",
            "The properties are a list of term and value.",
          ),
          {
            regulo: "link-label-names-destination",
            teksto: t("Ein Pfad zurück zur Liste.", "A path back to the list."),
            kontrolo: { kind: "aria", role: "navigation", min: 1 },
          },
        ],
      },
      {
        slug: "standard-verlauf",
        titolo: "Verlauf von Standard A-12",
        celo: "Die Änderungen eines Standards in zeitlicher Folge.",
        en: {
          titolo: "History of Standard A-12",
          celo: "The changes of one standard in order of time.",
        },
        sxablono: "pagxo",
        eroj: ["titolo", "tabelo", "ligilo"],
        kriterioj: [
          oneHeading(),
          namedTable(
            "Der Verlauf hat eine Beschriftung, die sagt, was er zeigt.",
            "The history has a caption that says what it shows.",
            "table|list",
          ),
        ],
      },
    ],
    kantoj: [
      { de: "standards-liste", al: "standard-detail" },
      { de: "standard-detail", al: "standards-liste" },
      { de: "standard-detail", al: "standard-verlauf" },
      { de: "standard-verlauf", al: "standard-detail" },
    ],
  },
  {
    slug: "formular-in-schritten",
    titolo: t("Formular in Schritten", "Form in steps"),
    celo: t(
      "Einen Antrag für Team Nord in drei Schritten stellen – Angaben, Termin, Prüfen – und danach eine Bestätigung sehen.",
      "File a request for Team Nord in three steps – details, date, review – and then see a confirmation.",
    ),
    ekranoj: [
      {
        slug: "antrag-angaben",
        titolo: "Schritt 1 von 3: Angaben",
        celo: "Titel und Beschreibung des Antrags eingeben; Pflichtfelder sind markiert.",
        en: {
          titolo: "Step 1 of 3: Details",
          celo: "Enter the title and description of the request; required fields are marked.",
        },
        sxablono: "formularo",
        eroj: ["kampo", "tekstareo", "butono"],
        kriterioj: [
          step(1),
          namedFields(),
          {
            regulo: "required-marked",
            teksto: t("Pflichtfelder sind markiert.", "Required fields are marked."),
            kontrolo: {
              kind: "elemento",
              F: "fm-kampo[required],fm-tekstareo[required]",
              "0": "[required],[aria-required=true]",
              min: 1,
            },
          },
          next(),
        ],
      },
      {
        slug: "antrag-termin",
        titolo: "Schritt 2 von 3: Termin",
        celo: "Das Datum wählen, an dem der Antrag gelten soll.",
        en: { titolo: "Step 2 of 3: Date", celo: "Choose the date the request shall apply from." },
        sxablono: "formularo",
        eroj: ["datelektilo", "butono"],
        kriterioj: [
          step(2),
          dateField("Ein Feld für das Datum.", "A field for the date."),
          namedFields(),
          next(),
        ],
      },
      {
        slug: "antrag-pruefen",
        titolo: "Schritt 3 von 3: Prüfen",
        celo: "Alle Angaben noch einmal sehen und den Antrag absenden.",
        en: {
          titolo: "Step 3 of 3: Review",
          celo: "See all details once more and submit the request.",
        },
        sxablono: "pagxo",
        eroj: ["atributlisto", "butono"],
        kriterioj: [
          step(3),
          attributeList(
            "Die Angaben stehen als Liste von Begriff und Wert.",
            "The details are a list of term and value.",
          ),
          onePrimary(),
          action(
            "Der Knopf nennt die Aktion, etwa „Antrag absenden“.",
            "The button names the action, such as “Submit request”.",
            "absend|einreich|submit|send",
          ),
        ],
      },
      {
        slug: "antrag-bestaetigt",
        titolo: "Antrag eingegangen",
        celo: "Bestätigen, dass der Antrag eingegangen ist, sagen, wie es weitergeht, und einen neuen Antrag anbieten.",
        en: {
          titolo: "Request received",
          celo: "Confirm that the request was received, say what happens next and offer a new request.",
        },
        sxablono: "pagxo",
        eroj: ["avizo", "titolo", "ligilo"],
        kriterioj: [
          oneHeading(),
          {
            regulo: "error-not-color-only",
            teksto: t(
              "Die Bestätigung ist eine Statusmeldung, nicht nur Farbe.",
              "The confirmation is a status message, not colour only.",
            ),
            kontrolo: { kind: "aria", role: "status|alert", min: 1 },
          },
          {
            regulo: "empty-state-says-what-next",
            teksto: t(
              "Die Bestätigung sagt, wie es weitergeht.",
              "The confirmation says what comes next.",
            ),
            kontrolo: { kind: "teksto", pattern: "eingegangen|erhalten|received|submitted" },
          },
        ],
      },
    ],
    kantoj: [
      { de: "antrag-angaben", al: "antrag-termin" },
      { de: "antrag-termin", al: "antrag-angaben" },
      { de: "antrag-termin", al: "antrag-pruefen" },
      { de: "antrag-pruefen", al: "antrag-termin" },
      { de: "antrag-pruefen", al: "antrag-bestaetigt" },
      { de: "antrag-bestaetigt", al: "antrag-angaben" },
    ],
  },
  {
    slug: "einstellungen-konto",
    titolo: t("Einstellungen", "Settings"),
    celo: t(
      "Die Einstellungen von Konto 4711 in drei Bereichen ändern: Allgemein, Benachrichtigungen und Team.",
      "Change the settings of account 4711 in three areas: general, notifications and team.",
    ),
    ekranoj: [
      {
        slug: "einstellungen-allgemein",
        titolo: "Allgemein",
        celo: "Sprache und Anzeigename ändern.",
        en: { titolo: "General", celo: "Change the language and the display name." },
        sxablono: "pagxo",
        eroj: ["titolo", "elekto", "kampo", "navigado", "butono"],
        kriterioj: [
          oneHeading(),
          {
            regulo: "field-label-visible",
            teksto: t("Eine Auswahl der Sprache.", "A choice of the language."),
            kontrolo: {
              kind: "aria",
              role: "combobox|listbox|radiogroup",
              name: "sprache|language",
              min: 1,
            },
          },
          namedFields(),
        ],
      },
      {
        slug: "einstellungen-benachrichtigungen",
        titolo: "Benachrichtigungen",
        celo: "Benachrichtigungen per E-Mail ein- und ausschalten.",
        en: { titolo: "Notifications", celo: "Turn email notifications on and off." },
        sxablono: "pagxo",
        eroj: ["titolo", "sxaltilo", "navigado"],
        kriterioj: [
          oneHeading(),
          {
            regulo: "switch-label-names-the-setting",
            teksto: t(
              "Ein Schalter für die Benachrichtigungen.",
              "A switch for the notifications.",
            ),
            kontrolo: {
              kind: "aria",
              role: "switch|checkbox",
              name: "benachrichtig|mitteilung|notification",
              min: 1,
            },
          },
          namedFields(),
        ],
      },
      {
        slug: "einstellungen-team",
        titolo: "Team",
        celo: "Die Mitglieder von Team Nord mit ihrer Rolle sehen.",
        en: { titolo: "Team", celo: "See the members of Team Nord with their role." },
        sxablono: "pagxo",
        eroj: ["titolo", "tabelo", "insigno", "navigado"],
        kriterioj: [
          oneHeading(),
          namedTable(
            "Die Tabelle der Mitglieder hat eine Beschriftung.",
            "The table of members has a caption.",
          ),
          {
            regulo: "badge-text-short",
            teksto: t(
              "Die Rolle steht als Etikett in der Zeile.",
              "The role is a badge in the row.",
            ),
            kontrolo: { kind: "elemento", F: "fm-insigno,fm-signeto", min: 1 },
          },
        ],
      },
    ],
    kantoj: [
      { de: "einstellungen-allgemein", al: "einstellungen-benachrichtigungen" },
      { de: "einstellungen-allgemein", al: "einstellungen-team" },
      { de: "einstellungen-benachrichtigungen", al: "einstellungen-allgemein" },
      { de: "einstellungen-benachrichtigungen", al: "einstellungen-team" },
      { de: "einstellungen-team", al: "einstellungen-allgemein" },
      { de: "einstellungen-team", al: "einstellungen-benachrichtigungen" },
    ],
  },
  {
    slug: "uebersicht-kennzahlen",
    titolo: t("Übersicht mit Kennzahlen", "Overview with key figures"),
    celo: t(
      "Die Kennzahlen von Team Nord im Überblick sehen, eine Kennzahl im Detail öffnen und einen Bericht für einen Zeitraum erstellen.",
      "See the key figures of Team Nord at a glance, open one in detail and create a report for a period.",
    ),
    ekranoj: [
      {
        slug: "kennzahlen",
        titolo: "Übersicht",
        celo: "Drei Kennzahlen als Karten, eine davon mit Fortschritt zum Ziel.",
        en: {
          titolo: "Overview",
          celo: "Three key figures as cards, one with progress towards its goal.",
        },
        sxablono: "pagxo",
        eroj: ["titolo", "karto", "mezurilo", "ligilo"],
        kriterioj: [
          oneHeading(),
          {
            regulo: "meter-text-states-value",
            teksto: t(
              "Der Fortschritt ist ein Balken mit Wert.",
              "The progress is a bar with a value.",
            ),
            kontrolo: { kind: "aria", role: "meter|progressbar", min: 1 },
          },
          {
            regulo: "heading-levels-in-order",
            teksto: t(
              "Mindestens drei Kennzahlen als Karten.",
              "At least three key figures as cards.",
            ),
            kontrolo: { kind: "elemento", F: "fm-karto", "0": "article", min: 3 },
          },
        ],
      },
      {
        slug: "kennzahl-detail",
        titolo: "Durchlaufzeit",
        celo: "Eine Kennzahl im Detail: ihr Wert je Monat als Tabelle.",
        en: {
          titolo: "Lead time",
          celo: "One key figure in detail: its value per month as a table.",
        },
        sxablono: "pagxo",
        eroj: ["titolo", "tabelo", "spuro"],
        kriterioj: [
          oneHeading(),
          namedTable(
            "Die Werte je Monat haben eine Beschriftung.",
            "The values per month have a caption.",
          ),
          {
            regulo: "meter-text-states-value",
            teksto: t("Die Werte stehen mit Einheit da.", "The values are shown with their unit."),
            kontrolo: { kind: "teksto", pattern: "\\d+\\s*(%|tage|days)" },
          },
        ],
      },
      {
        slug: "kennzahlen-bericht",
        titolo: "Bericht erstellen",
        celo: "Einen Zeitraum wählen und den Bericht der Kennzahlen erstellen.",
        en: {
          titolo: "Create report",
          celo: "Choose a period and create the report of the key figures.",
        },
        sxablono: "formularo",
        eroj: ["datelektilo", "butono"],
        kriterioj: [
          dateField("Ein Feld für den Zeitraum.", "A field for the period."),
          namedFields(),
          action(
            "Der Knopf nennt die Aktion, etwa „Bericht erstellen“.",
            "The button names the action, such as “Create report”.",
            "erstell|export|herunterlad|create|download",
          ),
        ],
      },
    ],
    kantoj: [
      { de: "kennzahlen", al: "kennzahl-detail" },
      { de: "kennzahl-detail", al: "kennzahlen" },
      { de: "kennzahlen", al: "kennzahlen-bericht" },
      { de: "kennzahlen-bericht", al: "kennzahlen" },
    ],
  },
];

/** The flow with this slug. */
export function trovuTaskon(
  slug: string,
  taskoj: readonly AblaufTasko[] = ABLAUF_TASKOJ,
): AblaufTasko | undefined {
  return taskoj.find((tasko) => tasko.slug === slug);
}

/** The plan of a flow as ekranoj takes it (C-1): no plan request in the measurement. */
export function planoDe(tasko: AblaufTasko, lingvo: "de" | "en" = "de"): Plano {
  return {
    celo: tasko.celo[lingvo],
    ekranoj: tasko.ekranoj.map((ekrano) => ({
      slug: ekrano.slug,
      titolo: lingvo === "de" ? ekrano.titolo : ekrano.en.titolo,
      celo: lingvo === "de" ? ekrano.celo : ekrano.en.celo,
    })),
    kantoj: tasko.kantoj.map((kanto) => ({ de: kanto.de, al: kanto.al })),
  };
}

/** The criteria of one screen in the shape of the Modelo; ids are `<flow>/<screen>/<n>`. */
function kriteriojDeEkrano(tasko: AblaufTasko, ekrano: AblaufEkrano): Kriterio[] {
  return ekrano.kriterioj.map((kriterio, index) => ({
    id: `${tasko.slug}/${ekrano.slug}/${index + 1}`,
    regulo: kriterio.regulo,
    teksto: { ...kriterio.teksto },
    kontrolo: { ...kriterio.kontrolo },
  }));
}

/** The K6 criteria of every screen of a flow, by slug (for the scorer adapter, C-8). */
export function kriteriojDe(tasko: AblaufTasko): Record<string, Kriterio[]> {
  const kriterioj: Record<string, Kriterio[]> = {};
  for (const ekrano of tasko.ekranoj) kriterioj[ekrano.slug] = kriteriojDeEkrano(tasko, ekrano);
  return kriterioj;
}

/**
 * One screen as a Tasko of the Modelo, in memory only, for `score()` (D-23). The id and the name
 * are `<flow>/<screen>`: stable, no ULID, never written to the Modelo.
 */
export function taskoDe(tasko: AblaufTasko, ekrano: AblaufEkrano): Tasko {
  return {
    id: `${tasko.slug}/${ekrano.slug}`,
    name: `${tasko.slug}/${ekrano.slug}`,
    teksto: { de: ekrano.celo, en: ekrano.en.celo },
    sxablono: ekrano.sxablono,
    eroj: [...ekrano.eroj],
    kriterioj: kriteriojDeEkrano(tasko, ekrano),
  };
}

const problemo = (path: string, rule: string, message: string, suggestion: string): Problemo => ({
  path,
  rule,
  message,
  suggestion,
});

/** Does a criterion decide Variante 0 (an elemento check without a 0 selector does not)? */
const decides0 = (kriterio: AblaufKriterio): boolean =>
  kriterio.kontrolo.kind !== "elemento" || kriterio.kontrolo["0"] !== undefined;

/**
 * The form of the catalogue: five flows, 3–5 screens each, every plan valid for ekranoj
 * (`validiPlanon`: slugs, edges only between own screens), every screen with a criterion and one
 * that decides Variante 0, slugs unique over the whole catalogue. All problems at once.
 */
export function validiKatalogon(taskoj: readonly AblaufTasko[] = ABLAUF_TASKOJ): Problemo[] {
  const problemoj: Problemo[] = [];
  if (taskoj.length !== ABLAUF_TASKOJ_NOMBRO) {
    problemoj.push(
      problemo(
        "/taskoj",
        "ablauf-task-count",
        `Der Katalog hat ${taskoj.length} Aufgaben, die Spec verlangt ${ABLAUF_TASKOJ_NOMBRO}.`,
        "Die fünf Aufgaben der Lieferliste 2.1 führen, keine mehr und keine weniger.",
      ),
    );
  }
  const seen = new Map<string, string>();
  const unique = (slug: string, path: string) => {
    const first = seen.get(slug);
    if (first === undefined) seen.set(slug, path);
    else {
      problemoj.push(
        problemo(
          path,
          "ablauf-slug-duplicate",
          `Der Slug „${slug}“ steht schon unter ${first}.`,
          "Slugs sind die Kennungen: im ganzen Katalog eindeutig wählen.",
        ),
      );
    }
  };
  for (const [i, tasko] of taskoj.entries()) {
    const base = `/taskoj/${i}`;
    unique(tasko.slug, `${base}/slug`);
    const n = tasko.ekranoj.length;
    if (n < ABLAUF_EKRANOJ_MIN || n > MAKS_EKRANOJ) {
      problemoj.push(
        problemo(
          `${base}/ekranoj`,
          "ablauf-screen-count",
          `Die Aufgabe „${tasko.slug}“ hat ${n} Screens, erlaubt sind ${ABLAUF_EKRANOJ_MIN} bis ${MAKS_EKRANOJ}.`,
          "Screens zusammenlegen oder ergänzen.",
        ),
      );
    }
    for (const plano of validiPlanon(planoDe(tasko))) {
      problemoj.push({ ...plano, path: `${base}${plano.path}` });
    }
    for (const [e, ekrano] of tasko.ekranoj.entries()) {
      const path = `${base}/ekranoj/${e}`;
      unique(ekrano.slug, `${path}/slug`);
      if (ekrano.kriterioj.length === 0) {
        problemoj.push(
          problemo(
            `${path}/kriterioj`,
            "ablauf-criterion-missing",
            `Der Screen „${ekrano.slug}“ hat kein Abnahmekriterium.`,
            "Mindestens ein Kriterium (aria, named-fields, elemento, teksto) angeben.",
          ),
        );
      } else if (!ekrano.kriterioj.some(decides0)) {
        problemoj.push(
          problemo(
            `${path}/kriterioj`,
            "ablauf-criterion-variant-0",
            `Kein Kriterium des Screens „${ekrano.slug}“ entscheidet Variante 0.`,
            "Ein Kriterium ohne Ero-Bezug (aria, named-fields, teksto) oder einen 0-Selektor ergänzen.",
          ),
        );
      }
    }
  }
  return problemoj;
}
