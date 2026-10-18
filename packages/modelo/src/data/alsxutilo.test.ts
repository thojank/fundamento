// The alsxutilo data (Spec 015 ②; G1–G4, section ②, plan ② D-03, D-04): the file input in the
// repo Modelo — chooses one or more files to send with a form and states which files are allowed.
// The platform's own file input is its core (the a11y role it is heard as: button); the button
// that chooses is a composed butono with the ikono upload, every chosen file a row with its name,
// its size and a composed butono that removes it; the dropzone is an addition for the pointer
// (dropzone keys the border and the room around the button, dragover is a state). The words of
// the Modelo name the button, the dropzone, every remove, the number of files and the two errors
// (a11y.texts with placeholders). The field Reguloj are widened to it (E5); the new Regulo
// file-constraints-stated is checked through the existing Slot-Constraint (help empty ⇒ accept
// empty) and a text rule on the help. The kampo closes its boundary file here.

import { describe, expect, it } from "vitest";
import { variantKeys } from "../eroj/inventories.js";
import { boundToken, combinationsOf } from "../eroj/skemo-rules.js";
import { evaluateUsage } from "../eroj/usage.js";
import { briefOf } from "../gvidanto/eroj.js";
import { suggestEro } from "../gvidanto/suggest-ero.js";
import { loadModelo } from "../load/load-modelo.js";
import { defaultModeloSource } from "../load/source.js";

const { modelo } = loadModelo(defaultModeloSource());
if (modelo === undefined) throw new Error("the repo Modelo must load");
const eroNamed = (name: string) => modelo.eroj.find((entry) => entry.ero.name === name);
const alsxutilo = eroNamed("alsxutilo");
const skemo = alsxutilo?.skemo;
const uzo = alsxutilo?.uzo;
const skemoOrThrow = () => {
  if (skemo === undefined) throw new Error("missing");
  return skemo;
};
const named = (name: string) => modelo.reguloj.find((regulo) => regulo.name === name);
const rulesOf = (result: ReturnType<typeof evaluateUsage>) =>
  result.violations.map((violation) => [violation.issue.rule, violation.issue.severity]);
const judge = (props: Record<string, string | number | boolean>, texts: Record<string, string>) =>
  evaluateUsage(modelo, [{ ero: "alsxutilo", props, label: "Lebenslauf", texts, lingvo: "de" }]);
const suggest = (goal: string) => {
  const result = suggestEro(modelo, { goal });
  if (!result.ok) throw new Error(`suggest_ero ${goal} failed`);
  return result.output;
};

describe("alsxutilo in the repo Modelo (section ②, G1, G2)", () => {
  it("lives in data/eroj/alsxutilo/skemo.json, the first of thirty-two Eroj", () => {
    expect(alsxutilo?.file).toBe("modelo/data/eroj/alsxutilo/skemo.json");
    expect(modelo.eroj).toHaveLength(32);
    expect(modelo.eroj[0]?.ero.name).toBe("alsxutilo");
  });

  it("has accept, max-size, multiple and dropzone beside the props of a field; the states of the kampo without readonly, plus dragover; label, help and error", () => {
    expect(
      skemo?.props.map((prop) => [prop.name, prop.kind, prop.required ?? false, prop.default]),
    ).toEqual([
      ["accept", "string", false, undefined],
      ["max-size", "number", false, undefined],
      ["multiple", "boolean", false, false],
      ["dropzone", "boolean", false, false],
      ["required", "boolean", false, false],
      ["disabled", "boolean", false, false],
      ["invalid", "boolean", false, false],
      ["name", "string", false, undefined],
    ]);
    expect(skemo?.states).toEqual(["rest", "hover", "focus", "disabled", "invalid", "dragover"]);
    expect(skemo?.slots).toEqual([
      { name: "label", default: true, text: true },
      { name: "help", text: true },
      { name: "error", text: true },
    ]);
    // dropzone keys the border and the room around the button: an axis beside the state.
    expect(variantKeys(skemoOrThrow())).toEqual(["dropzone", "state"]);
    expect(combinationsOf(skemoOrThrow(), ["dropzone", "state"])).toHaveLength(12);
  });

  it("names its parts: the field's label, mark, help and error; the dropzone with its border and hint; the composed button; the list of files; ring, box and motion — no new token (E1)", () => {
    expect(Object.keys(skemo?.parts ?? {})).toEqual([
      "label",
      "required-mark",
      "dropzone",
      "border",
      "drop-hint",
      "choose",
      "help",
      "error",
      "file-list",
      "file-name",
      "file-size",
      "remove",
      "focus-ring",
      "box",
      "motion",
    ]);
    const kampo = eroNamed("kampo")?.skemo;
    for (const part of ["required-mark", "help", "error", "focus-ring", "motion"]) {
      expect(skemo?.parts[part], part).toEqual(kampo?.parts[part]);
    }
    expect(skemo?.parts.dropzone).toEqual({
      fill: { by: ["state"] },
      "inline-padding": { by: ["dropzone"] },
      gap: { fixed: "spacing.small" },
      radius: { fixed: "radius.role.surface" },
    });
    expect(skemo?.parts.border).toEqual({
      color: { by: ["state"] },
      width: { fixed: "border.width.default" },
      stroke: { by: ["dropzone", "state"] },
    });
    expect(skemo?.parts.choose).toEqual({ height: { fixed: "size.control.medium" } });
    expect(skemo?.parts.remove).toEqual({ size: { fixed: "size.control.small" } });
    const bound = (part: string, property: string, when: Record<string, string>) =>
      boundToken(skemoOrThrow(), part, property, when)?.token;
    // The dropzone: dashed at rest, solid while files are dragged over it, on the sunken ground.
    expect(bound("border", "stroke", { dropzone: "true", state: "rest" })).toBe("stroke.dashed");
    expect(bound("border", "stroke", { dropzone: "true", state: "hover" })).toBe("stroke.dashed");
    expect(bound("border", "stroke", { dropzone: "true", state: "dragover" })).toBe("stroke.solid");
    expect(bound("dropzone", "fill", { state: "rest" })).toBe("color.background.default");
    expect(bound("dropzone", "fill", { state: "dragover" })).toBe("color.background.sunken");
    // Without a dropzone there is no border and no room around the button.
    expect(bound("border", "stroke", { dropzone: "false", state: "dragover" })).toBe("none");
    expect(bound("dropzone", "inline-padding", { dropzone: "false" })).toBe("none");
    expect(bound("dropzone", "inline-padding", { dropzone: "true" })).toBe("spacing.large");
    expect(bound("border", "color", { state: "invalid" })).toBe("color.status.danger.border");
    expect(bound("border", "color", { state: "dragover" })).toBe("color.border.strong");
    expect(bound("label", "color", { state: "disabled" })).toBe("color.text.disabled");
  });

  it("is heard as the platform's file input (role button) named by its label, described by help and error; the words of the Modelo with placeholders (G5)", () => {
    expect(skemo?.a11y).toEqual({
      role: "button",
      name: ["slot:label"],
      description: ["slot:help", "slot:error"],
      states: {
        required: ["aria-required"],
        invalid: ["aria-invalid"],
        disabled: ["aria-disabled"],
      },
      keys: ["Space", "Enter"],
      texts: {
        required: { de: "erforderlich", en: "required" },
        "choose-name": { de: "Datei auswählen", en: "Choose file" },
        "drop-hint-name": { de: "oder hierher ziehen", en: "or drop it here" },
        "remove-name": { de: "{file} entfernen", en: "Remove {file}" },
        "file-list-count": { de: "Ausgewählte Dateien: {count}", en: "Files chosen: {count}" },
        "accept-invalid": {
          de: "{file} hat eine Art, die hier nicht geht: Wähle {accept}.",
          en: "{file} is a kind not allowed here: choose {accept}.",
        },
        "max-size-invalid": {
          de: "{file} ist zu groß: Wähle eine Datei bis {max-size}.",
          en: "{file} is too large: choose a file up to {max-size}.",
        },
      },
    });
  });

  it("has the constraint of the kampo's error and the Slot-Constraint of file-constraints-stated (help empty ⇒ accept empty)", () => {
    expect(skemo?.constraints?.map((constraint) => [constraint.when, constraint.allowed])).toEqual([
      [{ "slot:error": "filled" }, { invalid: ["true"] }],
      [{ "slot:help": "empty" }, { "prop:accept": ["empty"] }],
    ]);
    expect(skemo?.constraints?.[1]?.kialo).toContain("file-constraints-stated");
  });

  it("knows the goal upload with the words of G3, citing file-constraints-stated", () => {
    expect(skemo?.goals).toEqual([
      {
        goal: "upload",
        keywords: {
          en: ["upload", "file", "files", "attachment", "attachments", "pdf", "document"],
          de: ["upload", "hochladen", "datei", "dateien", "anhang", "anhänge", "pdf", "dokument"],
        },
        props: {},
        regulo: "file-constraints-stated",
      },
    ]);
  });
});

describe("the Uzo of the alsxutilo (section ②, G2)", () => {
  it("states the purpose; typed text is the kampo's; progress and preview ask, the camera is not supported", () => {
    expect(uzo?.purpose).toBe(
      "Lets a person choose one or more files to send with a form, and states which files are allowed.",
    );
    expect(uzo?.instead.map((entry) => [entry.goal, entry.ero])).toEqual([["text-input", "kampo"]]);
    expect(uzo?.boundary.map((entry) => [entry.case, entry.action])).toEqual([
      ["upload-progress", "ask-human"],
      ["image-preview", "ask-human"],
      ["camera-capture", "not-supported"],
    ]);
    for (const entry of [...(uzo?.instead ?? []), ...(uzo?.boundary ?? [])]) {
      expect(entry.kialo).toMatch(/because/);
    }
  });

  it("stands in a form among the fields, composes the butono and the ikono; the label is a duty", () => {
    expect(uzo?.composes.containers.map((container) => container.name)).toEqual(["form", "dialog"]);
    expect(uzo?.composes.with.map((entry) => entry.ero)).toEqual(["kampo", "butono", "ikono"]);
    expect(uzo?.slots.label).toEqual({ accepts: ["text"], required: true, max: 1, nesting: 0 });
    // The dropzone row and long file names wrap; the button never (it is the butono).
    expect(uzo?.layout).toEqual({ size: "container", wrap: "allowed" });
    expect(eroNamed("ikono")?.uzo?.composes.with.map((entry) => entry.ero)).toContain("alsxutilo");
  });

  it("the field Reguloj are widened to it (E5) and the new Regulo is its own text rule on the help", () => {
    expect(uzo?.content.map((entry) => [entry.regulo, entry.fixed, entry.of, entry.check])).toEqual(
      [
        [
          "field-label-names-the-datum",
          false,
          undefined,
          {
            kind: "not-words",
            words: {
              de: ["hochladen", "auswählen", "anhängen"],
              en: ["upload", "choose", "attach"],
            },
          },
        ],
        ["error-says-what-to-do", true, "slot:error", { kind: "min-words", count: 3 }],
        ["help-is-one-sentence", false, "slot:help", { kind: "max-sentences", count: 1 }],
        ["file-constraints-stated", false, "slot:help", { kind: "min-words", count: 2 }],
      ],
    );
    for (const name of [
      "field-label-visible",
      "field-label-names-the-datum",
      "error-says-what-to-do",
      "error-not-color-only",
      "required-marked",
      "help-is-one-sentence",
      "spacing-owned-by-container",
    ]) {
      expect(named(name)?.appliesTo?.eroj, name).toContain("alsxutilo");
    }
    for (const name of ["placeholder-not-label", "placeholder-is-example"]) {
      expect(named(name)?.appliesTo?.eroj, name).not.toContain("alsxutilo");
    }
    const regulo = named("file-constraints-stated");
    expect(regulo?.appliesTo).toEqual({ eroj: ["alsxutilo"] });
    expect(regulo?.checkability).toBe("automatic");
    expect(regulo?.kialo).toContain("makes the mistake twice");
    expect(modelo.reguloj.filter((entry) => entry.name === "file-constraints-stated")).toHaveLength(
      1,
    );
  });

  it("the brief names dropzone as the axis and the label as the duty, and stays under 750", () => {
    if (alsxutilo === undefined) throw new Error("missing");
    const brief = briefOf(alsxutilo);
    expect(brief.axes.map((axis) => axis.name)).toEqual(["dropzone"]);
    expect(brief.required).toEqual({ props: [], slots: ["label"] });
    expect(Math.ceil(JSON.stringify(brief).length / 3)).toBeLessThanOrEqual(750);
  });

  it("the kampo closes its boundary file here; the Ikonaro carries upload, not mirrored", () => {
    const file = eroNamed("kampo")?.uzo?.boundary.find((entry) => entry.case === "file");
    expect(file?.action).toBe("use-instead");
    expect(file?.ero).toBe("alsxutilo");
    const upload = modelo.ikonaro?.find((ikono) => ikono.name === "upload");
    expect(upload?.mirror).toBeUndefined();
    expect(eroNamed("ikono")?.skemo.props[0]?.values).toContain("upload");
  });
});

describe("the Reguloj of the alsxutilo (G4, E5)", () => {
  it("accept without a help breaks the Slot-Constraint; 'PDF, höchstens 5 MB' passes; one word fails file-constraints-stated", () => {
    expect(rulesOf(judge({ accept: ".pdf" }, {}))).toEqual([["ero-prop-constraint", "error"]]);
    expect(rulesOf(judge({ accept: ".pdf" }, { help: "PDF, höchstens 5 MB" }))).toEqual([]);
    expect(rulesOf(judge({ accept: ".pdf" }, { help: "Dokument" }))).toEqual([
      ["file-constraints-stated", "error"],
    ]);
    // Without accept no help is asked for.
    expect(rulesOf(judge({}, {}))).toEqual([]);
  });

  it("the field Reguloj judge it as a kampo: a verb in the label, an error without the state, a short error", () => {
    expect(
      rulesOf(
        evaluateUsage(modelo, [
          { ero: "alsxutilo", props: {}, label: "Lebenslauf hochladen", texts: {}, lingvo: "de" },
        ]),
      ),
    ).toEqual([["field-label-names-the-datum", "error"]]);
    expect(rulesOf(judge({}, { error: "Falsch" }))).toEqual([
      ["ero-prop-constraint", "error"],
      ["error-says-what-to-do", "error"],
    ]);
    expect(rulesOf(judge({ invalid: true }, { error: "Wähle eine PDF-Datei bis 5 MB." }))).toEqual(
      [],
    );
    expect(
      rulesOf(evaluateUsage(modelo, [{ ero: "alsxutilo", props: {}, label: "", texts: {} }])),
    ).toEqual([["field-label-visible", "error"]]);
  });

  it("the Skemo carries what required-marked and error-not-color-only ask for", () => {
    expect(skemo?.parts["required-mark"]).toBeDefined();
    expect(skemo?.a11y.texts?.required).toEqual({ de: "erforderlich", en: "required" });
    expect(skemo?.slots.some((slot) => slot.name === "error" && slot.text === true)).toBe(true);
    expect(skemo?.a11y.states.invalid).toEqual(["aria-invalid"]);
  });
});

describe("suggest_ero of the file input (Gvidanto)", () => {
  it("'Feld für den Lebenslauf als PDF' is the alsxutilo, citing file-constraints-stated (the spec's dialog)", () => {
    const answer = suggest("Feld für den Lebenslauf als PDF");
    expect(answer.suggestion).toEqual({ ero: "alsxutilo", props: {} });
    expect(answer.regulo).toMatchObject({ name: "file-constraints-stated" });
    expect(answer.kialo).toBe(named("file-constraints-stated")?.kialo);
  });

  it("'Datei hochladen' and 'Upload' are the alsxutilo with the kampo's reason; 'Anhang' and 'attachment' too", () => {
    for (const goal of ["Datei hochladen", "Upload"]) {
      const answer = suggest(goal);
      expect(answer.suggestion, goal).toEqual({ ero: "alsxutilo", props: {} });
      expect(answer.boundary, goal).toMatchObject({
        ero: "kampo",
        case: "file",
        action: "use-instead",
      });
    }
    for (const goal of ["Anhang zur Nachricht", "attachment"]) {
      expect(suggest(goal).suggestion, goal).toEqual({ ero: "alsxutilo", props: {} });
    }
  });

  it("'file input' ties the kampo's input with the alsxutilo's file and asks (OP-12, Abweichung)", () => {
    const tie = suggest("file input");
    expect(tie.suggestion).toBeNull();
    expect(tie.action).toBe("ask-human");
    expect(tie.candidates?.map((candidate) => candidate.ero)).toEqual(
      expect.arrayContaining(["kampo", "alsxutilo"]),
    );
  });

  it("progress and a preview ask a person; the camera is not supported", () => {
    expect(suggest("Upload mit Fortschrittsbalken").suggestion).toBeNull();
    const preview = suggest("Vorschau des Bildes");
    expect(preview.suggestion).toBeNull();
    expect(preview.boundary).toMatchObject({
      ero: "alsxutilo",
      case: "image-preview",
      action: "ask-human",
    });
    const camera = suggest("Foto mit der Kamera aufnehmen");
    expect(camera.boundary).toMatchObject({
      ero: "alsxutilo",
      case: "camera-capture",
      action: "not-supported",
    });
  });
});
