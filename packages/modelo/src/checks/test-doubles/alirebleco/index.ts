import type { CheckResult } from "../../run.js";

// Test double: crashes, to exercise the runner's internal-error path.
export const check = async (): Promise<CheckResult> => {
  throw new Error("boom");
};
