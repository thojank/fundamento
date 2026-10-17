// Spec 014 ① (G4, E11): measures what the three engines Playwright ships support of the Popover
// API and of CSS Anchor Positioning — feature queries and one behaviour each (a popover opens in
// the top layer and closes on Escape; an anchored element sits below its anchor). A measurement,
// not a gate: the result goes into specs/014-eroj-runde-3/plan.md ① as a table, and ④ decides
// between anchor positioning and the simple fallback under the trigger from it (E11).
//
// Usage (from packages/eroj, browsers installed): node scripts/measure-overlay.mjs [--json]

import { chromium, firefox, webkit } from "@playwright/test";

const ENGINES = [
  ["chromium", chromium],
  ["firefox", firefox],
  ["webkit", webkit],
];

const PAGE = `<!doctype html><html lang="de"><head><meta charset="utf-8"><title>Overlay</title>
<style>
  #anchor { anchor-name: --fm-anchor; margin: 40px; inline-size: 120px; block-size: 32px; }
  #anchored { position: fixed; position-anchor: --fm-anchor; position-area: block-end; inline-size: 80px; block-size: 20px; margin: 0; }
  #legacy { position: fixed; position-anchor: --fm-anchor; top: anchor(bottom); left: anchor(left); inline-size: 80px; block-size: 20px; margin: 0; }
</style></head><body>
<button id="trigger" popovertarget="pop">Öffnen</button>
<div id="pop" popover>Ebene</div>
<button id="anchor">Anker</button>
<div id="anchored" popover="manual">Darunter</div>
<div id="legacy" popover="manual">Darunter (anchor())</div>
</body></html>`;

async function measure(name, type) {
  const browser = await type.launch();
  const version = browser.version();
  const page = await browser.newPage();
  await page.setContent(PAGE);
  const supports = await page.evaluate(() => {
    const s = (q) => (typeof CSS !== "undefined" && CSS.supports ? CSS.supports(q) : false);
    return {
      "popover-attribute": "popover" in HTMLElement.prototype,
      showPopover: typeof HTMLElement.prototype.showPopover === "function",
      "popover-open-selector": s("selector(:popover-open)"),
      "anchor-name": s("anchor-name: --a"),
      "position-anchor": s("position-anchor: --a"),
      "position-area": s("position-area: block-end"),
      "inset-area (older name)": s("inset-area: block-end"),
      "anchor() function": s("top: anchor(bottom)"),
      "position-try-fallbacks": s("position-try-fallbacks: flip-block"),
      "anchor-size()": s("width: anchor-size(width)"),
    };
  });
  const behaviour = await page.evaluate(async () => {
    const result = {};
    const pop = document.getElementById("pop");
    try {
      pop.showPopover();
      result["showPopover opens (:popover-open)"] = pop.matches(":popover-open");
    } catch (error) {
      result["showPopover opens (:popover-open)"] = `error: ${String(error)}`;
    }
    const anchor = document.getElementById("anchor");
    for (const id of ["anchored", "legacy"]) {
      const node = document.getElementById(id);
      try {
        node.showPopover();
      } catch {
        // without the popover API the node is simply shown
        node.style.display = "block";
      }
      const a = anchor.getBoundingClientRect();
      const b = node.getBoundingClientRect();
      // position-area: block-end centres the element under the anchor; anchor(left) aligns it.
      const aligned =
        id === "anchored"
          ? Math.abs((b.left + b.right) / 2 - (a.left + a.right) / 2) < 1
          : Math.abs(b.left - a.left) < 1;
      result[`${id === "anchored" ? "position-area" : "anchor()"} places it below the anchor`] =
        Math.abs(b.top - a.bottom) < 1 && aligned
          ? true
          : `no (top ${Math.round(b.top)} vs anchor bottom ${Math.round(a.bottom)}, left ${Math.round(b.left)} vs ${Math.round(a.left)})`;
    }
    return result;
  });
  // Light dismiss: Escape closes an auto popover.
  await page.keyboard.press("Escape");
  const escape = await page.evaluate(() => {
    const pop = document.getElementById("pop");
    return !pop.matches(":popover-open");
  });
  await browser.close();
  return { name, version, supports, behaviour: { ...behaviour, "Escape closes it (light dismiss)": escape } };
}

const results = [];
for (const [name, type] of ENGINES) results.push(await measure(name, type));

if (process.argv.includes("--json")) {
  console.log(JSON.stringify(results, null, 2));
} else {
  const rows = [
    ...Object.keys(results[0].supports).map((key) => [key, ...results.map((r) => r.supports[key])]),
    ...Object.keys(results[0].behaviour).map((key) => [key, ...results.map((r) => r.behaviour[key])]),
  ];
  const cell = (v) => (v === true ? "ja" : v === false ? "nein" : String(v));
  console.log(`| Merkmal | ${results.map((r) => `${r.name} ${r.version}`).join(" | ")} |`);
  console.log(`|---|${results.map(() => "---").join("|")}|`);
  for (const [key, ...values] of rows) console.log(`| ${key} | ${values.map(cell).join(" | ")} |`);
}
