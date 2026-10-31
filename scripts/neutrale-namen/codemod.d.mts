// Types of codemod.mjs for TypeScript consumers (the tests in packages/modelo, S36-5.2, S36-6.2).

export declare const EXIT_OK: 0;
export declare const EXIT_FAIL: 1;
export declare const EXIT_USAGE: 2;
export declare const HELP: string;

export type RunCommand = (command: readonly string[], cwd: string) => number;

export interface CodemodOptions {
  root: string;
  dryRun?: boolean;
  exceptionsFile?: string | undefined;
  generators?: boolean;
  runCommand?: RunCommand | undefined;
}

export interface CodemodReport {
  root: string;
  dryRun: boolean;
  files: number;
  changed: { path: string; counts: Record<string, number> }[];
  skipped: { exceptions: string[]; generated: string[]; binary: string[]; outside: string[] };
  pathsWithOldName: string[];
  generators: { id: string; command: string; code: number }[];
  generatedChanges: string[];
  left: string[];
}

export interface CodemodIo {
  cwd: string;
  stdout: (text: string) => void;
  stderr: (text: string) => void;
  runCommand?: RunCommand;
}

export declare function trackedFiles(root: string): string[];
export declare function readExceptions(
  file: string,
): { path: string; sha256?: string; kialo: string }[];
export declare function runCodemod(options: CodemodOptions): CodemodReport;
export declare function totals(report: CodemodReport): Record<string, number>;
export declare function failed(report: CodemodReport, check: boolean): boolean;
export declare function formatReport(report: CodemodReport): string;
export declare function main(argv: readonly string[], io: CodemodIo): number;
