import type { CheckResult } from "../../run.js";

// Test double: always fails with one error and one warning.
export const check = async (): Promise<CheckResult> => ({
  check: "regularo",
  ok: false,
  summary: "1 error, 1 warning",
  errors: [
    {
      rule: "regulo-kialo-missing",
      severity: "error",
      path: "data/reguloj.json#/reguloj/0/kialo",
      message: "Regulo has no kialo.",
      suggestion: "Add a non-empty kialo.",
    },
  ],
  warnings: [
    {
      rule: "contrast-advisory",
      severity: "warning",
      path: "data/kontrastparoj.json#/kontrastParoj/0",
      message: "APCA advisory.",
      suggestion: "Consider a darker foreground.",
    },
  ],
  stats: { reguloj: 1 },
});
