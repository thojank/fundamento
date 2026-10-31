// Types of rules.mjs for TypeScript consumers (the tests in packages/modelo, the readers of S36-5.2).

export interface OldNames {
  readonly word: string;
  readonly extensionKey: string;
  readonly schemaBase: string;
  readonly ontologioBase: string;
  readonly fontRepoName: string;
  readonly fontRepoFull: string;
}

export declare function oldNames(): OldNames;

export declare const NEW_NAMES: {
  readonly extensionKey: "fundamento";
  readonly schemaPrefix: "urn:fundamento:schema:";
  readonly ontologio: "urn:fundamento:ontologio";
  readonly fontRepoVariable: "FM_TIPAROJ_REPO";
  readonly privateFolder: "fundamento-tiparoj-privataj";
  readonly privateAspekto: "privates Aspekto-Paket";
  readonly placeholder: "privata";
  readonly placeholderHost: "privata.example";
};

export declare function composedWordExpression(): string;
export declare function schemaUrn(path: string): string;
export declare function isTestFile(path: string): boolean;

export interface Rule {
  readonly id: string;
  readonly description: string;
  apply(text: string, path: string): { text: string; count: number };
}

export declare function rules(): readonly Rule[];
export declare const RULE_IDS: readonly string[];
export declare function mapText(
  text: string,
  path: string,
): { text: string; counts: Record<string, number> };
export declare function mapIdentifiers(text: string): string;

export interface Generator {
  readonly id: string;
  readonly manifest: string;
  readonly script: string;
  readonly command: readonly string[];
  readonly outputs: readonly string[];
}

export declare const GENERATORS: readonly Generator[];
export declare const EXCEPTIONS_FILE: string;
