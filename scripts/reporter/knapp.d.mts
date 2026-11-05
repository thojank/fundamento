// Types of knapp.mjs for TypeScript consumers (the tests in packages/modelo and packages/eroj).

export declare const KNAPP: "knapp";
export declare const MAX_FEHLER_ZEILEN: 20;
export declare const BERICHTE: "test-reports";

export declare function istKnapp(env?: Readonly<Record<string, string | undefined>>): boolean;
export declare function junitDatei(name: string): string;
export declare function anzeigePfad(path: string): string;
export declare function fehlerZeile(line: {
  readonly datei: string;
  readonly zeile?: number;
  readonly titel: string;
}): string;
export declare function fehlerText(text: unknown): string[];
export declare function summenZeile(sum: {
  readonly bestanden: number;
  readonly rot: number;
  readonly uebersprungen: number;
  readonly wackelig: number;
  readonly ms: number;
  readonly protokoll: string;
}): string;
