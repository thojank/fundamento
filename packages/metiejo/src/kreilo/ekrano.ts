// The entry questions of the Kreilo (Spec 033 S3, Weg A) as a screen of Eroj: what the brand stands
// for and for whom (fm-tekstareo), its character as five sliders between opposites (fm-glitilo with
// the poles as min-label and max-label), what is already fixed (fm-kampo), inspiration images
// (fm-alsxutilo) with the confirmation of Amendment v2.5. After the proposal the link „Weiter zum
// Assistenten“ appears when the person must first read a sentence of the inspiration (Spec 036,
// D-95: no browser). Pure.

import { KONFIRMO_TEKSTO } from "../asistanto/averto.js";
import { escapeHtml, jsonIsland, screenDocument } from "../html.js";
import { KREILO } from "./kreilo.js";

export function kreiloScreen(input: {
  name: string;
  label: string;
  rev: number;
  /** Spec 033 S6: the estimate of Weg A and of the turn that chooses the lead colour. */
  takso?: { vojo: string; kreilo: string };
}): string {
  const name = input.name;
  const sliders = KREILO.paroj
    .map(
      (paro) =>
        `<fm-glitilo name="${escapeHtml(paro.nomo)}" min="-2" max="2" step="1" value="0" data-mt-paro="${escapeHtml(paro.nomo)}">${escapeHtml(paro.maldekstre)} oder ${escapeHtml(paro.dekstre)}?<span slot="min-label">${escapeHtml(paro.maldekstre)}</span><span slot="max-label">${escapeHtml(paro.dekstre)}</span></fm-glitilo>`,
    )
    .join("\n");
  const body = `<fm-sxelo>
<span slot="brand">Markenassistent</span>
<span slot="principal">Neue Marke ${escapeHtml(input.label)}</span>
<fm-avizo slot="notices" intent="warning" id="mt-asistanto-meldung" hidden></fm-avizo>
<fm-pagxo>
<fm-titolo slot="title" level="1" focusable>Erzähl mir von deiner Marke</fm-titolo>
<fm-teksto slot="subtitle">Aus deinen Antworten mache ich einen Vorschlag für jeden Schritt. Du siehst ihn sofort, passt ihn im Chat oder im Studio an und gibst jeden Schritt frei.</fm-teksto>
<fm-ligilo slot="actions" to="/asistanto/${encodeURIComponent(name)}" placement="standalone">Ohne Einstiegsfragen weiter</fm-ligilo>
<section class="mt-kreilo">
<fm-tekstareo name="celo" rows="5" data-mt-kreilo-celo>Was soll die Marke repräsentieren, und für wen?</fm-tekstareo>
<fm-titolo level="2">Wie ist ihr Charakter?</fm-titolo>
${sliders}
<fm-titolo level="2">Was ist schon festgelegt?</fm-titolo>
<fm-kampo name="farbe" data-mt-kreilo-farbe placeholder="#a0522d">Farbe (Hex, falls schon gewählt)</fm-kampo>
<fm-kampo name="schrift" data-mt-kreilo-schrift placeholder="zum Beispiel Inter">Schrift (Name, falls schon gewählt)</fm-kampo>
<fm-titolo level="2">Inspiration</fm-titolo>
<fm-alsxutilo name="inspiro" accept=".png,.jpg,.jpeg,.webp,.svg,.pdf" multiple data-mt-kreilo-inspiro>Bilder, die die Stimmung zeigen</fm-alsxutilo>
<fm-markobutono name="rajtoj-inspiro" value="ja" data-mt-kreilo-rajtoj>${escapeHtml(KONFIRMO_TEKSTO)}</fm-markobutono>
${
  input.takso === undefined
    ? ""
    : `<fm-teksto kind="caption" data-mt-takso-vojo>Schätzung für den Weg bis 100 % (mit zwei Wünschen im Chat) ${escapeHtml(input.takso.vojo)}</fm-teksto><fm-teksto kind="caption" data-mt-takso-kreilo>Ohne festgelegte Farbe und ohne Inspiration wählt das Modell die Leitfarbe, dazu ${escapeHtml(input.takso.kreilo)}</fm-teksto>`
}
<fm-butono emphasis="high" data-mt-kreilo-sendi>Vorschlag machen</fm-butono>
<fm-ligilo to="/asistanto/${encodeURIComponent(name)}/gvidkoloro" placement="standalone" data-mt-kreilo-weiter hidden>Weiter zum Assistenten</fm-ligilo>
</section>
</fm-pagxo>
</fm-sxelo>
<script type="application/json" id="mt-kreilo">${jsonIsland({ marko: name })}</script>`;
  return screenDocument({
    title: `Markenassistent – Einstiegsfragen – ${name}`,
    body,
    root: {
      "data-mt-sxtupo": "asistanto-komenco",
      "data-mt-marko": name,
      "data-mt-rev": String(input.rev),
      "data-mt-scheme": "light",
    },
  });
}
