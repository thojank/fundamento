// Types of knapp-vitest.mjs for TypeScript consumers (the Vitest configs and the tests in
// packages/modelo). Structural, so scripts/ needs no vitest of its own.

/** The hooks of Vitest's Reporter both implement (Vitest's types stay with Vitest). */
interface Hooks {
  onInit(vitest: unknown): void;
  onTestRunEnd(testModules: readonly unknown[], unhandledErrors: readonly unknown[]): void;
}

export declare class KnappVitest implements Hooks {
  constructor(options: { protokoll: string; schreiben?: (text: string) => void });
  /** Relative to the root of the Vitest config. */
  readonly protokoll: string;
  onInit(vitest: unknown): void;
  onTestCaseResult(testCase: unknown): void;
  onTestRunEnd(testModules: readonly unknown[], unhandledErrors: readonly unknown[]): void;
}

export declare class JunitVitest implements Hooks {
  constructor(options: { datei: string });
  /** Relative to the root of the Vitest config. */
  readonly datei: string;
  onInit(vitest: unknown): void;
  onTestRunEnd(testModules: readonly unknown[], unhandledErrors: readonly unknown[]): void;
}

export declare function vitestAusgabe<R>(
  name: string,
  standard: readonly R[],
  env?: Readonly<Record<string, string | undefined>>,
): { reporters: Array<R | KnappVitest | JunitVitest>; includeTaskLocation?: true };
