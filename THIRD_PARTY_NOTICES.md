# Third-party notices

Fundamento takes values, scales and the structure of its documentation from the open-source design systems listed here (Constitution Art. V, „Fonto“). Each one is pinned to one version and listed with its provenance in [`packages/modelo/data/fontoj.json`](packages/modelo/data/fontoj.json). Fundamento is not affiliated with, endorsed by or a version of any of them; their names appear only in this notice and in the provenance data.

Fonts and icons are not taken from these systems. Their own licenses are recorded per Aspekto (`aspekto.json`, `fonts` and `ikonoj`).

---

## astryx (`fonto: astryx`)

- Packages: `@astryxdesign/core` 0.7.4, `@astryxdesign/theme-neutral` 0.7.4 (npm)
- Repository: https://github.com/facebook/astryx, tag `v0.7.4`, commit `704757fd827c6fa00a71af80b06d5da99d155e45`
- Taken: token values of the theme `theme-neutral` (colour, typography scale, spacing, element sizes, radii, elevation, focus, motion, syntax colours), mapped onto the Vortaro of the Aspekto `komuna` (Spec 029 ①)
- License: MIT

```
MIT License

Copyright (c) 2026 Meta Platforms, Inc.

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

---

## Playwright (optional runtime dependency, not a Fonto)

- Package: `playwright` 1.63.0 (npm, published 2026-09-04; the release of `@playwright/test` in `packages/eroj`, so installed browsers are shared), an `optionalDependencies` entry of `@fundamento/metiejo` only
- Reason: „Weg C: Seiten lokal rendern und nach Fläche messen, optional“ (Spec 035, Befund 4.1); the same browser decodes uploaded JPG and WebP images (Befund 4.5.6)
- Loaded: only by a dynamic `import()` when Weg C renders its first page or an upload needs decoding; never by the start of the MCP server or of `fm`
- Not shipped: Chromium. Install it when wanted: `pnpm --filter @fundamento/eroj exec playwright install chromium`. Without it Weg C reads the code of a page and says so in one sentence.
- Nothing of it is taken into Fundamento; it runs on the person's machine.
- License: Apache-2.0 (Copyright (c) Microsoft Corporation; full text: https://github.com/microsoft/playwright/blob/v1.63.0/LICENSE)
