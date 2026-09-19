// The Modelo a check runs on: a project composition (--config), a fixture root (--fixture) or the
// repo Modelo with its reference Aspekto (Spec 001, T021).

import type { CheckOptions } from "../contracts/checks.js";
import type { ModeloSource } from "../contracts/modelo.js";
import { defaultModeloSource, fixtureModeloSource, projectModeloSource } from "../load/source.js";

export function checkSource(options: CheckOptions): ModeloSource {
  if (options.config !== undefined) return projectModeloSource(options.config);
  if (options.fixture !== undefined) return fixtureModeloSource(options.fixture);
  return defaultModeloSource();
}
