// Make Kit Celo (Spec 003, FR-11, plan D-14, contracts/projekcioj §6). One self-contained package
// per Aspekto: the Eroj as a bundle, the Aspekto's CSS and Tailwind theme, and `guidelines/`
// generated from the Modelo, the Reguloj with their kialoj and the Jugxoj — not one hand-written
// line (Art. VII). No hex value anywhere: the guidelines name tokens and classes, never values, so
// a model reading them cannot copy a colour out of the system.
//
// `MAKE_KIT_CELO` writes the sources; `buildMakeKits` additionally bundles them with Vite (ESM and
// CJS) and writes the type declarations, so the package can be packed and installed (AK-08).

import { execFileSync } from "node:child_process";
import { mkdirSync, writeFileSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, join } from "node:path";
import {
  type DtcgType,
  defaultModeloSource,
  isNoTarget,
  type Jugxo,
  type LoadedEro,
  type Modelo,
  type ModeloSource,
  nomRegulo,
  type Regulo,
} from "@fundamento/modelo";
import { type Celo, type CeloInput, celoInputOf, type GeneratedFile } from "../../build.js";
import { aspektoStylesheet } from "../css/css.js";
import { componentName, reactSource } from "../react/react.js";
import { themeBlock } from "../tailwind/tailwind.js";
import { elementSource } from "../web-component/element-template.js";
import { namesOf, stylesheetOf } from "../web-component/web-component.js";

/** `@fundamento/make-kit-komuna` (Q2: published under the dist-tag `next`). */
export function makeKitName(aspekto: string): string {
  return `@fundamento/make-kit-${aspekto}`;
}

const DIR = "make-kit";

/** The Aspektoj a kit is built for: the values of the aspekto Dimensio. */
function aspektojOf(modelo: Modelo): string[] {
  return (
    modelo.dimensioj
      .find((dimensio) => dimensio.name === "aspekto")
      ?.valoroj.map((valoro) => valoro.name) ?? []
  );
}

const tokenVariable = (name: string) => nomRegulo("css").derive(name);

function tailwindClass(name: string, type: DtcgType): string | undefined {
  const key = nomRegulo("tailwind").derive(name, type);
  if (isNoTarget(key)) return undefined;
  const utility = key.startsWith("--color-")
    ? "bg"
    : key.startsWith("--spacing-")
      ? "p"
      : key.startsWith("--radius-")
        ? "rounded"
        : undefined;
  return utility === undefined ? undefined : `${utility}${key.slice(key.indexOf("-fm-"))}`;
}

/** A table of role tokens of one prefix: name, its variable, its Tailwind class and its use. */
function tokenTable(input: CeloInput, prefix: string, utility = true): string {
  const rows = input.modeloJson.tokens
    .filter((token) => token.name.startsWith(prefix) && !token.name.startsWith(`${prefix}palette.`))
    .filter((token) => (token.description ?? "") !== "")
    .map((token) => {
      const css = `\`${tokenVariable(token.name)}\``;
      const tailwind = utility ? (tailwindClass(token.name, token.type as DtcgType) ?? "–") : "–";
      return `| \`${token.name}\` | ${css} | ${tailwind === "–" ? "–" : `\`${tailwind}\``} | ${token.description ?? ""} |`;
    });
  return ["| Token | CSS | Tailwind | Use |", "|---|---|---|---|", ...rows].join("\n");
}

/** The example instances of a Jugxo as one line of HTML, with its kialo. */
function exampleBlock(jugxo: Jugxo, tag: string): string {
  const instances = (jugxo.ekzemplo?.instances ?? [])
    .map((instance) => {
      const attributes = Object.entries(instance.props)
        .map(([key, value]) => (value === true ? ` ${key}` : ` ${key}="${String(value)}"`))
        .join("");
      return `<${tag}${attributes}>${instance.label ?? ""}</${tag}>`;
    })
    .join("\n");
  const verdict = jugxo.decision === "approved" ? "CORRECT" : "WRONG";
  return `**${verdict}** — ${jugxo.kialo}\n\n\`\`\`html\n${instances}\n\`\`\``;
}

function componentGuideline(
  input: CeloInput,
  entry: LoadedEro,
  reguloj: readonly Regulo[],
): string {
  const { tag } = namesOf(entry.ero);
  const name = componentName(entry.ero);
  const skemo = entry.skemo;
  const props = skemo.props
    .map((prop) => {
      const values =
        prop.kind === "enum"
          ? (prop.values ?? []).map((value) => `\`${value}\``).join(", ")
          : prop.kind;
      const fallback = prop.default === undefined ? "–" : `\`${String(prop.default)}\``;
      return `| \`${prop.name}\` | ${values} | ${fallback} | ${prop.description ?? ""} |`;
    })
    .join("\n");
  const intents = (skemo.intents ?? [])
    .map((intent) => {
      const props = Object.entries(intent.props)
        .map(([key, value]) => `\`${key}=${String(value)}\``)
        .join(", ");
      const words = Object.values(intent.keywords).flat().slice(0, 4).join(", ");
      return `| ${intent.intent} | ${words} | ${props} | ${intent.regulo === undefined ? "–" : `\`${intent.regulo}\``} |`;
    })
    .join("\n");
  const rules = reguloj
    .map((regulo) => `- **${regulo.name}** — ${regulo.statement}\n  Why: ${regulo.kialo}`)
    .join("\n");
  const examples = input.modelo.jugxoj
    .filter(
      (jugxo) =>
        jugxo.ekzemplo !== undefined && "ero" in jugxo.ref && jugxo.ref.ero === entry.ero.id,
    )
    .map((jugxo) => exampleBlock(jugxo, tag))
    .join("\n\n");
  const states = skemo.states.map((state) => `\`${state}\``).join(", ");
  return `# ${name}

${entry.ero.description}

Use \`<${name}>\` in React, or the element \`<${tag}>\` in plain HTML. The label is the children of
the component; for an icon-only button set \`label\` as its accessible name.

## Props

| Prop | Values | Default | Meaning |
|---|---|---|---|
${props}

States: ${states}. They come from the browser (hover, press, focus) or from \`disabled\` and
\`loading\`; never style them yourself.

## Which button for which intent

| Intent | Words | Use | Rule |
|---|---|---|---|
${intents}

## Rules

${rules}

## Examples

${examples}
`;
}

function guidelines(input: CeloInput, aspekto: string): GeneratedFile[] {
  const base = `${DIR}/${aspekto}/guidelines`;
  const reguloj = input.modelo.reguloj.filter((regulo) => regulo.appliesTo?.eroj !== undefined);
  const eroj = input.modelo.eroj;
  const dimensioj = input.modelo.dimensioj
    .map(
      (dimensio) =>
        `| \`data-fm-${dimensio.name}\` | ${dimensio.valoroj.map((valoro) => `\`${valoro.name}\``).join(", ")} | \`${dimensio.default}\` |`,
    )
    .join("\n");
  const ruleLines = reguloj.map((regulo) => `- ${regulo.statement}`).join("\n");
  return [
    {
      path: `${base}/Guidelines.md`,
      text: `# Fundamento (${aspekto})

This kit is the design system Fundamento in the Aspekto \`${aspekto}\`. Build screens from its
components and its tokens; never write a colour, a size or a font value yourself.

- Use the components of this kit; do not rebuild them.
- Take every value from a token: Tailwind classes \`*-fm-*\` or the CSS variables \`--fm-*\`.
- Switch brand, colour scheme, contrast, density, viewport and motion with the \`data-fm-*\`
  attributes on \`<html>\`; never with a second stylesheet.
${ruleLines}

Where to look: \`setup.md\` for the imports, \`foundations/\` for the tokens, \`components/\` for
each component.
`,
    },
    {
      path: `${base}/setup.md`,
      text: `# Setup

Import the styles once, then use the components. There is no provider and no theme object.

\`\`\`tsx
import "${makeKitName(aspekto)}/styles.css";
import "${makeKitName(aspekto)}/tailwind.css"; // only with Tailwind v4
import { ${eroj.map((entry) => componentName(entry.ero)).join(", ")} } from "${makeKitName(aspekto)}";
\`\`\`

Set the Dimensioj on \`<html>\`; every value follows without a reload.

\`\`\`html
<html data-fm-color-scheme="dark" data-fm-contrast="high">
\`\`\`

See \`foundations/dimensioj.md\` for the attributes and their values.
`,
    },
    {
      path: `${base}/foundations/color.md`,
      text: `# Colour

Every colour is a role, never a value. Use the class or the variable, never a hex code.

${tokenTable(input, "color.")}
`,
    },
    {
      path: `${base}/foundations/typography.md`,
      text: `# Typography

Type comes as composite tokens: family, size, weight, letter spacing and line height together.

${tokenTable(input, "typography.", false)}

In CSS each field is its own variable, e.g. \`${tokenVariable("typography.label.1")}-font-size\`.
`,
    },
    {
      path: `${base}/foundations/spacing.md`,
      text: `# Spacing, size and radius

${tokenTable(input, "spacing.")}

${tokenTable(input, "size.")}

${tokenTable(input, "radius.")}
`,
    },
    {
      path: `${base}/foundations/dimensioj.md`,
      text: `# Dimensioj

Every Dimensio is an attribute on \`<html>\`; leaving it out means the default.

| Attribute | Values | Default |
|---|---|---|
${dimensioj}

A frame never mixes two values of one Dimensio: the whole document switches together.
`,
    },
    ...eroj.map((entry) => ({
      path: `${base}/components/${entry.ero.name}.md`,
      text: componentGuideline(input, entry, reguloj),
    })),
  ];
}

/**
 * The sources of a kit: the elements in one module (the Skemo and the stylesheet inline, so the
 * kit carries no workspace dependency), the React wrapper beside it, and an index that joins them.
 * The wrapper imports the element module, never the index: that keeps the three files in one
 * direction and out of an import cycle (F6).
 */
function sources(input: CeloInput, aspekto: string): GeneratedFile[] {
  const header = `// Generated by fm projekcioj build from the Modelo (Aspekto ${aspekto}); do not edit (Art. I).\n`;
  const elements = input.modelo.eroj
    .map((entry) => {
      const { constant } = namesOf(entry.ero);
      return `const ${constant}_SKEMO = ${JSON.stringify(entry.skemo)} as const;
const ${constant}_CSS = ${JSON.stringify(stylesheetOf(entry.skemo))};
${elementSource({ ...namesOf(entry.ero), ero: entry.ero.name, inline: true })}`;
    })
    .join("\n");
  const defines = input.modelo.eroj
    .map(({ ero }) => `  define${namesOf(ero).className}();`)
    .join("\n");
  return [
    {
      path: `${DIR}/${aspekto}/src/element.ts`,
      text: `${header}${elements}
/** Registers every Ero once. Importing this module already did it; this is the explicit way. */
export function defineEroj(): void {
${defines}
}
`,
    },
    {
      path: `${DIR}/${aspekto}/src/react.ts`,
      text: header + reactSource(input.modelo.eroj, "./element.js"),
    },
    {
      path: `${DIR}/${aspekto}/src/index.ts`,
      text: `${header}export * from "./element.js";
export * from "./react.js";
`,
    },
  ];
}

export const MAKE_KIT_CELO: Celo = {
  name: "make-kit",
  generate(input: CeloInput): GeneratedFile[] {
    const version = `${input.modeloJson.fundamento.version}-next.0`;
    return aspektojOf(input.modelo).flatMap((aspekto) => [
      {
        path: `${DIR}/${aspekto}/package.json`,
        text: `${JSON.stringify(
          {
            name: makeKitName(aspekto),
            version,
            description: `Fundamento Make kit: the Aspekto ${aspekto} with its Eroj, tokens and generated guidelines.`,
            license: "MIT",
            // Provenance checks the repository this package claims to come from (F7).
            repository: {
              type: "git",
              url: "git+https://github.com/thojank/fundamento.git",
              // The generator, not the generated folder: only this path exists in the repository,
              // so the link from npm leads somewhere (K2).
              directory: "packages/projekcioj",
            },
            homepage: "https://github.com/thojank/fundamento#readme",
            type: "module",
            main: "./dist/index.cjs",
            module: "./dist/index.js",
            types: "./dist/index.d.ts",
            exports: {
              ".": {
                types: "./dist/index.d.ts",
                import: "./dist/index.js",
                require: "./dist/index.cjs",
              },
              // Plain HTML: the elements alone, so no bare "react" import has to resolve (F6).
              "./element": {
                types: "./dist/element.d.ts",
                import: "./dist/element.js",
                require: "./dist/element.cjs",
              },
              "./styles.css": "./styles.css",
              "./tailwind.css": "./tailwind.css",
              "./guidelines/*": "./guidelines/*",
              "./package.json": "./package.json",
            },
            files: ["dist", "guidelines", "styles.css", "tailwind.css", "README.md"],
            peerDependencies: { react: ">=18", "react-dom": ">=18" },
            publishConfig: { access: "public", tag: "next" },
            // Tree shaking must keep the registration of the elements and the stylesheets (K1).
            sideEffects: [
              "**/*.css",
              "./dist/element.js",
              "./dist/element.cjs",
              "./dist/index.js",
              "./dist/index.cjs",
            ],
          },
          null,
          2,
        )}\n`,
      },
      {
        path: `${DIR}/${aspekto}/README.md`,
        text: `# ${makeKitName(aspekto)}

The design system Fundamento as a Figma Make kit, in the Aspekto \`${aspekto}\`. Generated from the
Fundamento Modelo; every value is a token, every rule has a reason.

- \`styles.css\` — the tokens as CSS variables, switched by \`data-fm-*\` on \`<html>\`
- \`tailwind.css\` — the same tokens as a Tailwind v4 theme (\`bg-fm-…\`)
- \`guidelines/\` — what Figma Make reads: setup, foundations and one file per component

See \`guidelines/setup.md\`.
`,
      },
      {
        path: `${DIR}/${aspekto}/styles.css`,
        text: aspektoStylesheet(input.modelo, aspekto),
      },
      { path: `${DIR}/${aspekto}/tailwind.css`, text: themeBlock(input) },
      ...sources(input, aspekto),
      ...guidelines(input, aspekto),
    ]);
  },
};

/** The type declarations of a kit (deterministic text instead of a type build). */
function declarations(input: CeloInput, options: { elementsOnly?: boolean } = {}): string {
  const elements = input.modelo.eroj.map(
    (entry) => `export declare class ${namesOf(entry.ero).className} extends HTMLElement {}`,
  );
  if (options.elementsOnly === true) {
    return `// Generated by fm projekcioj build; do not edit (Art. I).
${elements.join("\n")}
export declare function defineEroj(): void;
`;
  }
  const components = input.modelo.eroj.flatMap((entry) => {
    const name = componentName(entry.ero);
    return [
      `export declare const ${name}: import("react").ForwardRefExoticComponent<`,
      `  ${name}Props & import("react").RefAttributes<HTMLElement>`,
      ">;",
    ];
  });
  return `// Generated by fm projekcioj build; do not edit (Art. I).
${reactSource(input.modelo.eroj, "./element.js", { typesOnly: true })}
${elements.join("\n")}
${components.join("\n")}
export declare function defineEroj(): void;
`;
}

/**
 * Writes every kit under `outDir` and bundles it with Vite in library mode (ESM and CJS, React
 * external), then writes the type declarations. Returns the directory of each Aspekto.
 */
export async function buildMakeKits(
  outDir: string,
  source: ModeloSource = defaultModeloSource(),
): Promise<Record<string, string>> {
  const prepared = celoInputOf(source);
  if (!prepared.ok) {
    throw new Error(
      `The Modelo is invalid (${prepared.errors.length} error(s)); run fm modelo validate.`,
    );
  }
  for (const file of MAKE_KIT_CELO.generate(prepared.input)) {
    const target = join(outDir, file.path);
    mkdirSync(dirname(target), { recursive: true });
    writeFileSync(target, file.text);
  }
  const bundled = await bundleMakeKits(outDir, prepared.input);
  // `bundled` lists files; a kit is the directory two levels above them.
  return Object.fromEntries(
    [...new Set(bundled.map((path) => path.split("/")[1] ?? ""))].map((aspekto) => [
      aspekto,
      join(outDir, DIR, aspekto),
    ]),
  );
}

/**
 * Bundles the kit sources already written under `outDir` (ESM and CJS, React external) and writes
 * the type declarations. Returns the relative directory of each kit.
 */
export async function bundleMakeKits(outDir: string, input: CeloInput): Promise<string[]> {
  const kits: string[] = [];
  for (const aspekto of aspektojOf(input.modelo)) {
    const dir = join(outDir, DIR, aspekto);
    kits.push(
      `${DIR}/${aspekto}/dist/index.js`,
      `${DIR}/${aspekto}/dist/index.cjs`,
      `${DIR}/${aspekto}/dist/index.d.ts`,
      `${DIR}/${aspekto}/dist/element.js`,
      `${DIR}/${aspekto}/dist/element.cjs`,
      `${DIR}/${aspekto}/dist/element.d.ts`,
    );
    bundle(dir);
    writeFileSync(join(dir, "dist", "index.d.ts"), declarations(input));
    writeFileSync(join(dir, "dist", "element.d.ts"), declarations(input, { elementsOnly: true }));
  }
  return kits;
}

/**
 * Bundles one kit in a child process whose working directory is the kit: the bundler writes module
 * paths relative to the working directory, so building the same kit in two places gives the same
 * bytes (AK-02).
 */
function bundle(dir: string): void {
  const vite = createRequire(import.meta.url).resolve("vite");
  const script = `
import { pathToFileURL } from "node:url";
const { build } = await import(pathToFileURL(${JSON.stringify(vite)}).href);
await build({
  configFile: false,
  logLevel: "silent",
  root: ".",
  build: {
    lib: {
      // Two entries: the package (React) and the elements alone, for plain HTML (F6).
      entry: ["src/index.ts", "src/element.ts"],
      formats: ["es", "cjs"],
      fileName: (format, name) => (format === "cjs" ? name + ".cjs" : name + ".js"),
    },
    outDir: "dist",
    emptyOutDir: true,
    minify: false,
    rollupOptions: { external: ["react", "react-dom", "react/jsx-runtime"] },
  },
});
`;
  execFileSync(process.execPath, ["--input-type=module", "-e", script], {
    cwd: dir,
    stdio: "pipe",
  });
}
