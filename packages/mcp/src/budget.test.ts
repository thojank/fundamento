// Several server tests compose and validate a whole Modelo (144 combinations) or spawn node; a
// loaded CI runner took 14.5 s for one of them (Spec 001 review A). The budget lives in
// vitest.config.ts; this test keeps it there.

import { expect, it } from "vitest";

it("gives this package's tests a 30 s budget", ({ task }) => {
  expect(task.timeout).toBeGreaterThanOrEqual(30_000);
});
