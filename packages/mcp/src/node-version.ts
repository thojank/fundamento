// Same as packages/cli/src/node-version.ts (each bin edge stays self-contained).
// Node 24 is required (.nvmrc, engines). Older Node has no `import.meta.main`, so the bin's
// entry guard would be false and the process would exit 0 without any output. The bin checks
// this first, with no other imports, and fails loudly instead (Spec 001 review A).
import { realpathSync } from "node:fs";
import { fileURLToPath } from "node:url";

export const REQUIRED_NODE_MAJOR = 24;

/** A message for a Node version older than 24, or undefined when the version is supported. */
export function nodeVersionProblem(version: string): string | undefined {
  const major = Number.parseInt(version.split(".")[0] ?? "", 10);
  if (Number.isFinite(major) && major >= REQUIRED_NODE_MAJOR) return undefined;
  return `This needs Node ${REQUIRED_NODE_MAJOR} or newer, but runs on Node ${version}.\nInstall and use it, e.g.: nvm install ${REQUIRED_NODE_MAJOR} && nvm use ${REQUIRED_NODE_MAJOR} (the repository's .nvmrc names it).\n`;
}

/** Whether the module at `moduleUrl` is the script node was started with. */
export function isProcessEntry(moduleUrl: string): boolean {
  const script = process.argv[1];
  if (script === undefined) return false;
  try {
    return realpathSync(script) === realpathSync(fileURLToPath(moduleUrl));
  } catch {
    return false;
  }
}
