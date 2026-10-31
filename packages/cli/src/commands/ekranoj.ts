// `fm ekranoj "<Satz>"` (Spec 037, Lieferliste 1.1): one sentence and one brand become up to five
// linked, self-checked screens. Red state: the shape of the injected dependencies only.

import type { Bildigilo, ChatModel, GvidantoKonekto, Marko, Taksilo } from "@fundamento/ekranoj";
import type { Provider } from "@fundamento/metiejo";

export interface EkranojMedio {
  legiEnv(dosiero: string): Readonly<Record<string, string | undefined>> | undefined;
  tty(): boolean;
  demandi(demando: string): Promise<boolean>;
  chat(e: {
    provider: Provider;
    ledger: string;
    log: (linio: string) => void;
  }): ChatModel | Promise<ChatModel>;
  gvidanto(e: {
    config: string | undefined;
    log: (linio: string) => void;
  }): Promise<GvidantoKonekto>;
  taksilo(e: { config: string | undefined }): Taksilo | Promise<Taksilo>;
  marko(e: { config: string | undefined; marko: string }): Marko | Promise<Marko>;
  bildigilo(e: { log: (linio: string) => void }): Promise<Bildigilo | undefined>;
  markoNomo(config: string | undefined): string;
  nun(): Date;
  commit(): string | undefined;
}
