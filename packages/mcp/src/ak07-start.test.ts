// Spec 035 Befund 1.3 (AK-07): the start compiles each part of the Modelo schema once per process.
// Reading the config, validating the Modelo and compiling the tool schemas ask one Ajv instance;
// one instance each compiled the parts they share again on every start of the server.

import { createModeloAjv, type ModeloAjv } from "@fundamento/modelo";
import { afterEach, describe, expect, it, vi } from "vitest";
import { loadServed } from "./load.js";
import { createFundamentoServer } from "./server.js";
import { EKZEMPLO_CONFIG } from "./test-doubles/client.js";

afterEach(() => {
  vi.restoreAllMocks();
});

describe("the start of the server (Spec 035 Befund 1.3, AK-07)", () => {
  it("reads the config, validates the Modelo and compiles the tools with one Ajv instance", () => {
    // The class every Ajv instance of the Modelo inherits compile and getSchema from.
    const ajvClass: ModeloAjv = Object.getPrototypeOf(Object.getPrototypeOf(createModeloAjv()));
    const compile = vi.spyOn(ajvClass, "compile");
    const getSchema = vi.spyOn(ajvClass, "getSchema");

    const served = loadServed({ config: EKZEMPLO_CONFIG });
    createFundamentoServer(served, { transport: "stdio" });

    expect(served.report.errors).toEqual([]);
    expect(compile).toHaveBeenCalled();
    const instances = new Set([...compile.mock.contexts, ...getSchema.mock.contexts]);
    expect(instances.size).toBe(1);
  });
});
