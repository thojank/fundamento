// The root of the checkout this package lies in (valid from `src/` and `dist/`): where the .env
// is read (Spec 023, §4.3) and where no brand may ever be written (O-3 of plan ①).

import { fileURLToPath } from "node:url";

export const CHECKOUT_ROOT = fileURLToPath(new URL("../../../", import.meta.url));
