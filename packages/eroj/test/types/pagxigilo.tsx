// Type test of the React wrapper of the pagxigilo (Spec 015 ①, plan ① D-08): props are typed from
// the Skemo; total-pages is a number, mode allows button and link. Each line marked as an
// expected error must fail to compile; every other line must compile.
import { Pagxigilo } from "@fundamento/eroj/react";

export const valid = (
  <Pagxigilo
    page="5"
    totalPages={10}
    label="Seitenblättern"
    mode="link"
    hrefTemplate="?seite={page}"
    siblings={2}
  />
);

export const minimal = <Pagxigilo page="1" totalPages={3} />;

export const wrongMode = (
  // @ts-expect-error mode allows button and link only
  <Pagxigilo page="1" totalPages={3} mode="tabs" />
);

export const wrongTotal = (
  // @ts-expect-error total-pages is a number (the duty itself is the element's warning, as for every Ero)
  <Pagxigilo page="1" totalPages="ten" />
);
