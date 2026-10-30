// Spec 029 ②b-1b M-2 (abgleich.json, Muster M-2; entschieden 24.10.): the shared status of the
// fields. Warning and success join the error: `intent` neutral | success | warning | danger at every
// field (names as avizo and insigno), `invalid` stays the short form of danger. The message of a
// warning or a success stands in the text slot `message` (the error keeps its slot), and
// `message-position` places it: `below` the field as today, or `joined` to it. Each status is a
// state of the field (A-*-3) with the border of its intent; the kampo shows a status icon in its
// field (A-kampo-4), so a status is never colour alone (error-not-color-only).

import { describe, expect, it } from "vitest";
import { evaluateUsage } from "../eroj/usage.js";
import { briefOf } from "../gvidanto/eroj.js";
import { loadModelo } from "../load/load-modelo.js";
import { defaultModeloSource } from "../load/source.js";

const { modelo } = loadModelo(defaultModeloSource());
if (modelo === undefined) throw new Error("the repo Modelo must load");
const entryOf = (ero: string) => {
  const entry = modelo.eroj.find((candidate) => candidate.ero.name === ero);
  if (entry === undefined) throw new Error(`${ero} missing`);
  return entry;
};

/** The fields of M-2 (abgleich.json). */
const FIELDS = [
  "kampo",
  "tekstareo",
  "elektilo",
  "listelektilo",
  "plurelektilo",
  "kompletigilo",
  "datelektilo",
  "glitilo",
  "elekto",
  "markobutono",
  "sxaltilo",
  "alsxutilo",
] as const;

const tokensOf = (value: unknown) => Math.ceil(Buffer.byteLength(JSON.stringify(value)) / 3);

describe("Spec 029 ②b-1b M-2: the status of every field", () => {
  it.each(FIELDS)("%s: intent and message-position, the last props", (ero) => {
    const { skemo } = entryOf(ero);
    const names = skemo.props.map((prop) => prop.name);
    expect(names.slice(-2)).toEqual(["intent", "message-position"]);
    const intent = skemo.props.find((prop) => prop.name === "intent");
    expect(intent).toMatchObject({
      kind: "enum",
      values: ["neutral", "success", "warning", "danger"],
      default: "neutral",
    });
    const position = skemo.props.find((prop) => prop.name === "message-position");
    expect(position).toMatchObject({ kind: "enum", values: ["below", "joined"], default: "below" });
  });

  it.each(FIELDS)(
    "%s: the states warning and success, the slot message describing the field",
    (ero) => {
      const { skemo, uzo } = entryOf(ero);
      expect(skemo.states).toContain("warning");
      expect(skemo.states).toContain("success");
      // beside where the field's other texts stand beside it (elekto, markobutono, sxaltilo).
      expect(skemo.slots).toContainEqual(expect.objectContaining({ name: "message", text: true }));
      expect(skemo.a11y.description).toContain("slot:message");
      expect(uzo?.slots.message).toMatchObject({ accepts: ["text"], max: 1 });
      // The message speaks next to the error, never instead of the reason for disabled.
      const description = skemo.a11y.description ?? [];
      if (description.includes("slot:error"))
        expect(description.indexOf("slot:message")).toBe(description.indexOf("slot:error") + 1);
    },
  );

  it.each(FIELDS)("%s: the part message in the colour of its status, caption type", (ero) => {
    const { skemo } = entryOf(ero);
    expect(skemo.parts.message).toEqual({
      color: { by: ["state"] },
      typography: { fixed: "typography.caption" },
    });
    const bound = (state: string) =>
      skemo.bindings.find(
        (binding) =>
          binding.part === "message" &&
          binding.property === "color" &&
          binding.when?.state === state,
      )?.token;
    expect(bound("rest")).toBe("color.text.muted");
    expect(bound("warning")).toBe("color.status.warning.text");
    expect(bound("success")).toBe("color.status.success.text");
  });

  it.each(FIELDS)(
    "%s: what invalid binds to danger, warning and success bind to their own",
    (ero) => {
      const { skemo } = entryOf(ero);
      const danger = skemo.bindings.filter(
        (binding) =>
          binding.when?.state === "invalid" && binding.token.startsWith("color.status.danger."),
      );
      for (const binding of danger) {
        for (const intent of ["warning", "success"]) {
          const twin = skemo.bindings.find(
            (candidate) =>
              candidate.part === binding.part &&
              candidate.property === binding.property &&
              candidate.when?.state === intent &&
              JSON.stringify({ ...candidate.when, state: "invalid" }) ===
                JSON.stringify(binding.when),
          );
          expect(twin?.token, `${binding.part}.${binding.property} ${intent}`).toBe(
            binding.token.replace("color.status.danger.", `color.status.${intent}.`),
          );
        }
      }
    },
  );

  it.each(FIELDS)(
    "%s: a message only with warning or success, invalid only with neutral or danger",
    (ero) => {
      const { skemo } = entryOf(ero);
      expect(skemo.constraints).toContainEqual(
        expect.objectContaining({
          when: { "slot:message": "filled" },
          allowed: { intent: ["success", "warning"] },
        }),
      );
      if (skemo.props.some((prop) => prop.name === "invalid"))
        expect(skemo.constraints).toContainEqual(
          expect.objectContaining({
            when: { invalid: "true" },
            allowed: { intent: ["neutral", "danger"] },
          }),
        );
    },
  );

  it("the kampo shows a status icon in its field, in the colour of its status (A-kampo-4)", () => {
    const { skemo } = entryOf("kampo");
    expect(skemo.parts["status-icon"]).toEqual({
      size: { fixed: "size.icon.small" },
      color: { by: ["state"] },
    });
    const bound = (state: string) =>
      skemo.bindings.find(
        (binding) =>
          binding.part === "status-icon" &&
          binding.property === "color" &&
          binding.when?.state === state,
      )?.token;
    expect(bound("invalid")).toBe("color.status.danger.text");
    expect(bound("warning")).toBe("color.status.warning.text");
    expect(bound("success")).toBe("color.status.success.text");
  });

  it("check_usage: a warning with its message passes; a message without a status, or invalid with success, does not", () => {
    const rules = (props: Record<string, unknown>, texts: Record<string, string> = {}) =>
      evaluateUsage(modelo, [
        { ero: "kampo", props, label: "Benutzername", texts } as never,
      ]).violations.map((violation) => violation.issue.rule);
    expect(rules({ intent: "warning" }, { message: "Der Name ist schon vergeben." })).toEqual([]);
    expect(rules({}, { message: "Der Name ist schon vergeben." })).toContain("ero-prop-constraint");
    expect(rules({ invalid: true, intent: "success" })).toContain("ero-prop-constraint");
  });

  it("the kampo's brief stays under 750 with both axes", () => {
    const brief = briefOf(entryOf("kampo"));
    expect(brief.axes.map((axis) => axis.name)).toEqual(
      expect.arrayContaining(["intent", "message-position"]),
    );
    expect(tokensOf(brief)).toBeLessThan(750);
  });
});
