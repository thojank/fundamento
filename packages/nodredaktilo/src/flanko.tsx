// Spec 047 (NE-1, 2.5): the side panel `#nr-flanko`. It explains the selected node from the graph's
// data alone: its value in the current scheme with the other scheme small below (P-7), its
// mechanism (`[data-nr-regulo]`) and its reason (`[data-nr-kialo]`, "fehlt" where the data has
// none, P-8). For a derived node it lists the chain of origin down to an input
// (`[data-nr-deveno]`), for an input what depends on it (`[data-nr-dependanto]`, then the
// transitive count in `[data-nr-dependantoj-sumo]`). An entry's click selects that node.

import {
  dependantojDe,
  devenoDe,
  type Grafeo,
  type Nodo,
  type Speco,
} from "@fundamento/metiejo/grafeo";
import { type MouseEvent, useMemo } from "react";
import { KARTO_NIVELO, type Skemo, specoTeksto, valoroEn } from "./nodoj.js";

export interface FlankoProps {
  grafeo: Grafeo;
  nodo: Nodo;
  skemo: Skemo;
  /** Selects a node of the graph and opens its groups. */
  elekti: (id: string) => void;
  fermi: () => void;
}

const SUBNIVELO = String(Number(KARTO_NIVELO) + 1);

const SKEMO_NOMO: Record<Skemo, string> = { light: "Hell", dark: "Dunkel" };

const abhaengige = (nombro: number): string =>
  nombro === 1 ? "1 Knoten hängt insgesamt davon ab" : `${nombro} Knoten hängen insgesamt davon ab`;

/** The id an entry of a list names, read from its data attribute. */
function celoDe(evento: MouseEvent<HTMLElement>, atributo: string): string | undefined {
  if (!(evento.target instanceof Element)) return undefined;
  return evento.target.closest(`[${atributo}]`)?.getAttribute(atributo) ?? undefined;
}

function Listo({
  ids,
  atributo,
  speco,
  elekti,
}: {
  ids: readonly string[];
  atributo: "data-nr-deveno" | "data-nr-dependanto";
  speco: ReadonlyMap<string, Speco>;
  elekti: (id: string) => void;
}) {
  // One handler on the list (delegation): the fm-butono entries get no React event prop.
  const onClick = (evento: MouseEvent<HTMLOListElement>) => {
    const id = celoDe(evento, atributo);
    if (id !== undefined) elekti(id);
  };
  return (
    // biome-ignore lint/a11y/useKeyWithClickEvents: the clicks come from the fm-butono entries, which carry focus and keys.
    <ol onClick={onClick}>
      {ids.map((id) => (
        <li key={id}>
          <fm-butono {...{ [atributo]: id }} size="small" emphasis="low">
            {id}
          </fm-butono>{" "}
          <fm-insigno size="small">{specoTeksto(speco.get(id) ?? "derivajxo")}</fm-insigno>
        </li>
      ))}
    </ol>
  );
}

export function Flanko({ grafeo, nodo, skemo, elekti, fermi }: FlankoProps) {
  const speco = useMemo(() => new Map(grafeo.nodoj.map((n) => [n.id, n.speco])), [grafeo]);
  const deveno = useMemo(
    () => (nodo.speco === "derivajxo" ? devenoDe(grafeo, nodo.id) : []),
    [grafeo, nodo],
  );
  const dependantoj = useMemo(
    () => (nodo.speco === "enigo" ? dependantojDe(grafeo, nodo.id) : undefined),
    [grafeo, nodo],
  );
  const alia: Skemo = skemo === "dark" ? "light" : "dark";
  const valoro = valoroEn(nodo, skemo);

  const onFermi = (evento: MouseEvent<HTMLElement>) => {
    if (celoDe(evento, "data-nr-fermi") !== undefined) fermi();
  };

  return (
    // biome-ignore lint/a11y/useKeyWithClickEvents lint/a11y/noStaticElementInteractions: the click comes from the fm-butono inside, which carries focus and keys.
    <div onClick={onFermi}>
      <fm-karto id="nr-flanko" data-nr-elektita={nodo.id} level={KARTO_NIVELO}>
        <span slot="heading">{nodo.id}</span>
        <fm-atributlisto slot="content" layout="stacked">
          <dl>
            <dt>{`Wert (${SKEMO_NOMO[skemo]})`}</dt>
            <dd>
              <fm-teksto kind="code" data-nr-valoro={skemo}>
                {valoro ?? "kein Wert"}
              </fm-teksto>
              {valoro === undefined ? null : (
                <fm-teksto kind="caption" emphasis="medium" data-nr-valoro={alia}>
                  {`${SKEMO_NOMO[alia]}: ${valoroEn(nodo, alia) ?? "kein Wert"}`}
                </fm-teksto>
              )}
            </dd>
            <dt>Regel</dt>
            <dd data-nr-regulo="">{nodo.regulo ?? "keine"}</dd>
            <dt>Begründung</dt>
            <dd data-nr-kialo="">
              {nodo.kialo ?? <fm-insigno intent="warning">fehlt</fm-insigno>}
            </dd>
          </dl>
        </fm-atributlisto>
        {nodo.speco === "derivajxo" ? (
          <section>
            <fm-titolo level={SUBNIVELO}>Herkunft</fm-titolo>
            <Listo ids={deveno} atributo="data-nr-deveno" speco={speco} elekti={elekti} />
          </section>
        ) : null}
        {dependantoj === undefined ? null : (
          <section>
            <fm-titolo level={SUBNIVELO}>Hängt davon ab</fm-titolo>
            <Listo
              ids={dependantoj.rektaj}
              atributo="data-nr-dependanto"
              speco={speco}
              elekti={elekti}
            />
            <fm-teksto data-nr-dependantoj-sumo={String(dependantoj.cxiuj)}>
              {abhaengige(dependantoj.cxiuj)}
            </fm-teksto>
          </section>
        )}
        <fm-insigno slot="meta">{specoTeksto(nodo.speco)}</fm-insigno>
        <fm-butono slot="actions" data-nr-fermi="" size="small" emphasis="low">
          Schließen
        </fm-butono>
      </fm-karto>
    </div>
  );
}
