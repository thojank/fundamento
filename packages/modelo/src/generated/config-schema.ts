/**
 * GENERATED FILE - DO NOT EDIT.
 * Source: packages/modelo/schema/config.schema.json
 * Regenerate: pnpm --filter @fundamento/modelo generate:types
 */

/**
 * Project configuration (Spec 001, D-07). It selects Aspekto packages and nothing else; it is not part of the Modelo. The reference Aspekto is stated only in the Modelo (core.referenceAspekto).
 */
export interface FundamentoConfigJson {
  $schema?: string;
  /**
   * Aspekto packages to include besides the reference Aspekto: a path relative to this file, or an npm package name resolved from this file's directory.
   */
  aspektoj: string[];
  /**
   * Fingerprint lists of benchmark Aspektoj that check:clean-room reads, as paths relative to this file. Each list holds hashes only and names its own source (Spec 004, FR-15).
   */
  markoSpuroj?: string[];
}
