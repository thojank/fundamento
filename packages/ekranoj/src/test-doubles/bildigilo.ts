// A renderer double (C-6 `Bildigilo`): no browser. The facts are the elements of the agent
// fragment (inside the frame's markers, else between <body> and </body>; the frame's back-link is
// never a fact, D-27), rendered light and dark without axe findings (or with the findings a test
// gives), photos are empty. Records every document.

import { fragmentoEl } from "../konstruo.js";
import type {
  Bildigilo,
  BildigoRezulto,
  EkranaDokumento,
  FaktoElemento,
  Varianto,
} from "../tipoj.js";
import { bildigo } from "./faktoj.js";

export class BildigiloDouble implements Bildigilo {
  readonly dokumentoj: {
    dokumento: EkranaDokumento;
    aspektoj: readonly string[];
    varianto: Varianto;
  }[] = [];
  fermita = false;
  readonly #axe: (slug: string) => { id: string; nodes: number }[];

  constructor(axe: (slug: string) => { id: string; nodes: number }[] = () => []) {
    this.#axe = axe;
  }

  async render(
    dokumento: EkranaDokumento,
    opcioj: { aspektoj: readonly string[]; varianto: Varianto },
  ): Promise<BildigoRezulto> {
    this.dokumentoj.push({ dokumento, aspektoj: opcioj.aspektoj, varianto: opcioj.varianto });
    const body =
      fragmentoEl(dokumento.html) ??
      /<body[^>]*>([\s\S]*)<\/body>/i.exec(dokumento.html)?.[1] ??
      dokumento.html;
    const elements: FaktoElemento[] = [];
    for (const trovo of body.matchAll(/<([a-z][a-z0-9-]*)([^>]*)>/g)) {
      const attrs: Record<string, string> = {};
      for (const attr of (trovo[2] ?? "").matchAll(/([a-z-]+)="([^"]*)"/g)) {
        attrs[attr[1] ?? ""] = attr[2] ?? "";
      }
      elements.push({ tag: trovo[1] ?? "", attrs, parent: -1, text: "" });
    }
    const axe = this.#axe(dokumento.slug);
    return {
      fakto: {
        lingvo: "de",
        bytes: body.length,
        elements,
        aria: [],
        console: [],
        renders: [bildigo("light", axe), bildigo("dark", axe)],
      },
      bildoj: { hela: new Uint8Array(), malhela: new Uint8Array() },
    };
  }

  async close(): Promise<void> {
    this.fermita = true;
  }
}
