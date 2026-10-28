// avataro ↔ Avatar (Abgleich ②a): Größen small/medium/large ↔ sm/md/lg (die Fonto hat fünf Stufen,
// x-small und x-large kommen in Fundamento dazu). Zwei Fälle: Initialen ohne Bild und mit Bild.
// Den Kreis schneidet in der Fonto das Element um Bild und Initialen zu (overflow hidden); dessen
// Radius steht für den Radius von image und initials. Tooltip aus (in Fundamento der konsileto).
const BILD =
  "data:image/svg+xml,%3Csvg xmlns='http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg' viewBox='0 0 16 16'%3E%3Crect width='16' height='16' fill='%23d8dde3'/%3E%3Ccircle cx='8' cy='6' r='3' fill='%23687280'/%3E%3Cpath d='M2 16c1-4 3.5-5.5 6-5.5s5 1.5 6 5.5z' fill='%23687280'/%3E%3C/svg%3E";
export default {
  ero: "avataro",
  quelle: { Avatar: "packages/core/src/Avatar/Avatar.tsx" },
  kombinoj: [
    { fm: {}, fonto: {} },
    { fm: { picture: BILD }, fonto: { src: BILD } },
  ],
  groessen: { small: { size: "sm" }, medium: { size: "md" }, large: { size: "lg" } },
  zustaende: { rest: {} },
  fm: { tag: "fm-avataro", attrs: { name: "Erika Mustermann" } },
  fonto: { comp: "Avatar", props: { name: "Erika Mustermann", tooltip: false } },
  teile: {
    control: "&",
    initials: { "": "[role=img] > div > div", "border-radius": "[role=img] > div:has(> div)" },
    image: { "": "[role=img] > div > img", "border-radius": "[role=img] > div:has(> img)" },
  },
};
