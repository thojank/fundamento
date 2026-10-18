// Spec 015 ② (O-4 of plan ①): every spec file awaits buildProjections() at the top level, and
// Playwright imports every file once to collect its tests and once more in every worker. Each
// import built every Celo of core + komuna + ekzemplo anew: 36 builds before the first test ran,
// three to five minutes of a shard on the runner (run 39127146926: the loader alone from 12:25:41
// to 12:30:40). The build is the same for every file, so one process builds once.
import { expect, test } from "@playwright/test";
import { buildProjections } from "./serve.js";

test("buildProjections builds once per process: every call resolves to the same output", async () => {
  const first = await buildProjections();
  const second = await buildProjections();
  expect(second.out).toBe(first.out);
  expect(second.input).toBe(first.input);
});
