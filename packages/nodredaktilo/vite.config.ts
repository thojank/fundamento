// Spec 047 (NE-1, 2.5): one browser file, dist/leinwand.js, with React, React Flow and dagre inside.
// There is no CSS output (B-2): React Flow's stylesheet comes in as a string (`?inline`) and goes
// into a <style> at mount. The view logic of the Metiejo is taken from its source through an alias
// (D-2): nodredaktilo does not depend on @fundamento/metiejo, which would close a package cycle.

import { fileURLToPath } from "node:url";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

const grafeoSicht = fileURLToPath(new URL("../metiejo/src/grafeo-sicht.ts", import.meta.url));
// Spec 054 (MP-1, T1): the data of the view Gestalten, import-free like grafeo-sicht.ts.
const gestaltenSicht = fileURLToPath(
  new URL("../metiejo/src/grafeo-gestalten-sicht.ts", import.meta.url),
);
// Spec 056 (MP-2a, plan D-4): the rules on the contents of the new nodes, shared with the server;
// its only import is the module above.
const enhavo = fileURLToPath(new URL("../metiejo/src/leinwand-enhavo.ts", import.meta.url));
// Spec 058 (MP-2c, T1): the model-free rules of the evaluation, shared with the server (its only
// imports are the two modules above), and the identifier of a brand name (import-free).
const auswertung = fileURLToPath(new URL("../metiejo/src/leinwand-auswertung.ts", import.meta.url));
const ident = fileURLToPath(new URL("../metiejo/src/ident.ts", import.meta.url));

// biome-ignore lint/style/noDefaultExport: Vite loads its config from the default export.
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@fundamento/metiejo/grafeo": grafeoSicht,
      "@fundamento/metiejo/gestalten": gestaltenSicht,
      "@fundamento/metiejo/enhavo": enhavo,
      "@fundamento/metiejo/auswertung": auswertung,
      "@fundamento/metiejo/ident": ident,
    },
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
