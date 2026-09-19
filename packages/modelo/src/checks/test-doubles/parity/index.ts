import type { CheckOptions, CheckResult } from "../../run.js";

// Test double: always passes and echoes the options it received in `summary`.
export const check = async (opts: CheckOptions): Promise<CheckResult> => ({
  check: "parity",
  ok: true,
  summary: JSON.stringify(opts),
  errors: [],
  warnings: [],
  stats: { items: 0 },
});
