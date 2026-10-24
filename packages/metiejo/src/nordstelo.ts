// The north-star measure in the Metiejo (Spec 030, Verlauf): every run of `pnpm nordstelo` with
// date, commit and model, the figure of Variante F against Variante 0 over time, and for the latest
// run each task with a link to the page the agent built and its screenshot. The history is
// .fundamento/nordstelo/historio.json in the checkout; @fundamento/nordstelo writes it with these
// types. The screen is built of the Eroj like every screen of the Metiejo. Pure.

import { escapeHtml } from "./html.js";

export interface NordsteloKuroTasko {
  tasko: string;
  F?: number;
  "0"?: number;
  /** Paths relative to .fundamento/nordstelo/. */
  pagxo?: string;
  bildo?: string;
}

export interface NordsteloKuro {
  id: string;
  dato: string;
  commit: string;
  anbieter: string;
  modell: string;
  /** Median over the tasks of the medians of the repeats, per variant. */
  kennzahl: { F?: number; "0"?: number };
  /** Median of the spread (max − min) of the repeats, per variant. */
  streuung: { F?: number; "0"?: number };
  tokens: { input: number; output: number };
  /** Why the run stopped early, e.g. at the cost limit. */
  abgebrochen?: string;
  taskoj: NordsteloKuroTasko[];
}

export interface NordsteloHistorio {
  kuroj: NordsteloKuro[];
}

export const NORDSTELO_DIR = [".fundamento", "nordstelo"] as const;

const number = (value: number | undefined): string =>
  value === undefined ? "–" : value.toLocaleString("de-DE", { maximumFractionDigits: 1 });

const fileUrl = (path: string): string =>
  `/nordstelo/dosiero/${path.split("/").map(encodeURIComponent).join("/")}`;

const STYLE = `body { margin: 0; background-color: var(--fm-color-background-canvas); color: var(--fm-color-text-default); font-family: var(--fm-typography-body-1-font-family); }
main { display: flex; flex-direction: column; gap: var(--fm-spacing-large); padding: var(--fm-spacing-xlarge); max-inline-size: 72rem; }
.nordstelo-verlauf { inline-size: 100%; block-size: 12rem; }
.nordstelo-verlauf .f { stroke: var(--fm-color-action-primary-rest); }
.nordstelo-verlauf .nul { stroke: var(--fm-color-border-default); }
.nordstelo-bildo { inline-size: 12rem; border: var(--fm-border-width-default) solid var(--fm-color-border-default); }`;

function course(kuroj: readonly NordsteloKuro[]): string {
  const width = 600;
  const height = 160;
  const step = kuroj.length > 1 ? width / (kuroj.length - 1) : 0;
  const points = (pick: (kuro: NordsteloKuro) => number | undefined) =>
    kuroj
      .map((kuro, index) => {
        const value = pick(kuro) ?? 0;
        return `${Math.round(index * step)},${Math.round(height - (value / 100) * height)}`;
      })
      .join(" ");
  return `<svg class="nordstelo-verlauf" role="img" aria-label="Verlauf der Kennzahl: Variante F gegen Variante 0, 0 bis 100" viewBox="0 0 ${width} ${height}" preserveAspectRatio="none"><polyline class="f" fill="none" stroke-width="3" points="${points((kuro) => kuro.kennzahl.F)}"/><polyline class="nul" fill="none" stroke-width="3" stroke-dasharray="6 4" points="${points((kuro) => kuro.kennzahl["0"])}"/></svg>`;
}

export function nordsteloScreen(historio: NordsteloHistorio): string {
  const kuroj = [...historio.kuroj].sort((a, b) => (a.dato < b.dato ? -1 : 1));
  const head = `<!doctype html><html lang="de"><head><meta charset="utf-8"><title>Nordstern-Kennzahl</title><link rel="stylesheet" href="/css/fundamento.css"><style>${STYLE}</style><script type="module">import "/eroj/define.js";</script></head><body><main>`;
  const title = '<fm-titolo level="1">Nordstern-Kennzahl</fm-titolo>';
  if (kuroj.length === 0) {
    return `${head}${title}<fm-plenstato kind="empty">Noch kein Lauf. Im Checkout: pnpm nordstelo</fm-plenstato></main></body></html>`;
  }
  const newest = [...kuroj].reverse();
  const rows = newest
    .map(
      (kuro) =>
        `<tr><th scope="row">${escapeHtml(new Date(kuro.dato).toLocaleString("de-DE", { timeZone: "UTC" }))} UTC</th><td>${escapeHtml(kuro.commit)}</td><td>${escapeHtml(`${kuro.anbieter} · ${kuro.modell}`)}</td><td>${number(kuro.kennzahl.F)}</td><td>${number(kuro.kennzahl["0"])}</td><td>${number(kuro.streuung.F)} / ${number(kuro.streuung["0"])}</td><td>${number(kuro.tokens.input)} / ${number(kuro.tokens.output)}</td><td>${escapeHtml(kuro.abgebrochen ?? "")}</td></tr>`,
    )
    .join("");
  const runs = `<fm-tabelo>Läufe<table slot="content"><thead><tr><th scope="col">Datum</th><th scope="col">Commit</th><th scope="col">Modell</th><th scope="col">Kennzahl F</th><th scope="col">Kennzahl 0</th><th scope="col">Streuung F / 0</th><th scope="col">Tokens ein / aus</th><th scope="col">Abgebrochen</th></tr></thead><tbody>${rows}</tbody></table></fm-tabelo>`;
  const latest = newest[0] as NordsteloKuro;
  const tasks = latest.taskoj
    .map(
      (tasko) =>
        `<tr><th scope="row">${escapeHtml(tasko.tasko)}</th><td>${number(tasko.F)}</td><td>${number(tasko["0"])}</td><td>${tasko.pagxo === undefined ? "–" : `<a href="${fileUrl(tasko.pagxo)}">Seite</a>`}</td><td>${tasko.bildo === undefined ? "–" : `<img class="nordstelo-bildo" src="${fileUrl(tasko.bildo)}" alt="Bildschirmfoto der Seite zu ${escapeHtml(tasko.tasko)}">`}</td></tr>`,
    )
    .join("");
  const perTask = `<fm-tabelo>Aufgaben des Laufs vom ${escapeHtml(new Date(latest.dato).toLocaleString("de-DE", { timeZone: "UTC" }))} UTC<table slot="content"><thead><tr><th scope="col">Aufgabe</th><th scope="col">F</th><th scope="col">0</th><th scope="col">Seite</th><th scope="col">Bildschirmfoto</th></tr></thead><tbody>${tasks}</tbody></table></fm-tabelo>`;
  return `${head}${title}<fm-teksto>Median über die Aufgaben, je Aufgabe der Median aus den Läufen; F mit Gvidanto, 0 ohne. Durchgezogen F, gestrichelt 0.</fm-teksto>${course(kuroj)}${runs}${perTask}</main></body></html>`;
}
