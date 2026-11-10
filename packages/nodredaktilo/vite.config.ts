// Spec 047 (NE-1, 2.5): one browser file, dist/leinwand.js, with React, React Flow and dagre inside.
// There is no CSS output (B-2): React Flow's stylesheet comes in as a string (`?inline`) and goes
// into a <style> at mount. The view logic of the Metiejo is taken from its source through an alias
// (D-2): nodredaktilo does not depend on @fundamento/metiejo, which would close a package cycle.

import { fileURLToPath } from "node:url";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

const grafeoSicht = fileURLToPath(new URL("../metiejo/src/grafeo-sicht.ts", import.meta.url));

// biome-ignore lint/style/noDefaultExport: Vite loads its config from the default export.
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: { "@fundamento/metiejo/grafeo": grafeoSicht },
  },
  // Library mode leaves `process.env.NODE_ENV` in place; the browser has no `process`.
  define: { "process.env.NODE_ENV": JSON.stringify("production") },
  build: {
    outDir: "dist",
    emptyOutDir: true,
    sourcemap: true,
    cssCodeSplit: false,
    lib: {
      entry: fileURLToPath(new URL("src/leinwand.tsx", import.meta.url)),
      formats: ["es"],
      fileName: () => "leinwand.js",
    },
  },
});
