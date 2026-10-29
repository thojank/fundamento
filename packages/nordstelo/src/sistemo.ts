// The system a run measures (Nachlese 12 ②, Entscheidung O-8): the tool of this checkout – agent,
// limits, rendering, scoring – measures the Eroj, the Gvidanto (MCP server with its Modelo) and the
// CSS Projekcio of another checkout, built at the commit to be measured. So the three measuring
// points of a series differ only in the system, never in the tool.

import { existsSync } from "node:fs";
import { join } from "node:path";

export interface Sistemo {
  root: string;
  /** The built Eroj (`packages/eroj/dist`). */
  erojDist: string;
  /** The MCP server of the checkout: createFundamentoServer and loadServed. */
  mcp: string;
  /** The Projekcioj of the checkout: buildProjekcioj. */
  projekcioj: string;
  /** The Modelo of the checkout: projectModeloSource. */
  modelo: string;
  /** The build with every brand the run renders in. */
  cxiujConfig: string;
}

/** The parts of the system in a built checkout; an unbuilt one is refused by name. */
export function sistemoOf(root: string): Sistemo {
  const sistemo: Sistemo = {
    root,
    erojDist: join(root, "packages/eroj/dist"),
    mcp: join(root, "packages/mcp/dist/index.js"),
    projekcioj: join(root, "packages/projekcioj/dist/index.js"),
    modelo: join(root, "packages/modelo/dist/index.js"),
    cxiujConfig: join(
      root,
      "packages/modelo/test/fixtures/valid/aspekto-provo-kompakta/fundamento.cxiuj.config.json",
    ),
  };
  const missing = (["erojDist", "mcp", "projekcioj", "modelo", "cxiujConfig"] as const)
    .map((part) => sistemo[part])
    .filter((path) => !existsSync(path))
    .map((path) => path.slice(root.length + 1));
  if (missing.length > 0)
    throw new Error(
      `Das System unter ${root} ist nicht gebaut: es fehlt ${missing.join(", ")}. Dort pnpm install && pnpm build.`,
    );
  return sistemo;
}

/** The label of a run: the commit of the tool, and the system's where it is another. */
export function sistemoLabel(tool: string, system: string | undefined): string {
  return system === undefined ? tool : `${tool} (System ${system})`;
}
