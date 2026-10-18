// Type test of the React wrapper of the pagxigilo (Spec 015 ①, plan ① D-08): props are typed from
// the Skemo; page and total-pages are duties, mode allows button and link. Each line marked as an
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

export const noTotal = (
  // @ts-expect-error total-pages is a duty
  <Pagxigilo page="1" />
);
