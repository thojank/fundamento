import { expect, test } from "@playwright/test";

// Spec 040 T-7: no `page`, so Playwright starts no browser.
test.describe("knapp", () => {
  test("green", () => {
    expect(1 + 1).toBe(2);
  });

  test("red", () => {
    expect(1 + 1).toBe(3);
  });
});
