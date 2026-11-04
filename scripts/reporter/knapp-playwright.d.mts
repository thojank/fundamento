// Types of knapp-playwright.mjs for TypeScript consumers (the Playwright configs and tests of the
// Eroj). Structural, so no package needs @playwright/test to read them.

/** A Playwright reporter description: a name or a module path, and its options. */
export type ReporterDescription =
  | readonly [name: string]
  | readonly [name: string, options: object];

export declare const KNAPP_PLAYWRIGHT: string;

export declare function playwrightAusgabe(
  name: string,
  env?: Readonly<Record<string, string | undefined>>,
): ReporterDescription[];

export declare class KnappPlaywright {
  constructor(options?: {
    protokoll?: string;
    configDir?: string;
    _mode?: string;
    schreiben?: (text: string) => void;
  });
  readonly protokoll: string;
  version(): "v2";
  printsToStdio(): boolean;
}

// biome-ignore lint/style/noDefaultExport: Playwright loads a reporter from the default export.
export default KnappPlaywright;
