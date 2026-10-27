// The limits of a provider (Nachlese 11 ④, Esperanto limoj): settings of the run, requests per
// second and per day. A gate (Pordisto) lets every request of the agent through: it keeps the
// interval of the requests per second and counts the requests of the UTC day in a ledger the run
// keeps beside its results, so a second run on the same day knows what the first used. At the daily
// limit it says so (DayLimitReached); the run then keeps its state and continues the next day with
// the same command. Before the start the run estimates its requests (schaetzung).

import type { ProviderName } from "./agent.js";

export interface Limoj {
  /** Requests per second at most (Mistral free: 0.5). */
  perSekundo?: number;
  /** Requests per UTC day at most (OpenRouter free: 1 000 on the maintainer's account). */
  perTago?: number;
}

/** The limits of the three series (briefing Nachlese 11 ④); --anfragen-sekunde and --anfragen-tag change them. */
export const LIMOJ: Readonly<Record<ProviderName, Limoj>> = {
  mistral: { perSekundo: 0.5 },
  openrouter: { perTago: 1000 },
  openai: {},
};

export class DayLimitReached extends Error {
  constructor(
    readonly provider: string,
    readonly limit: number,
  ) {
    super(
      `Tageslimit ${provider} erreicht (${limit} Anfragen am UTC-Tag). Derselbe Befehl setzt den Lauf am nächsten Tag fort.`,
    );
    this.name = "DayLimitReached";
  }
}

/** The UTC day of a moment, YYYY-MM-DD: the day OpenRouter counts by. */
export const dayOf = (ms: number): string => new Date(ms).toISOString().slice(0, 10);

/** Requests per provider and UTC day; `entries` is what the run stores as anfragoj.json. */
export class AnfragoLedger {
  readonly entries: Record<string, number>;

  constructor(entries: Record<string, number> = {}) {
    this.entries = { ...entries };
  }

  count(provider: string, day: string): number {
    return this.entries[`${provider} ${day}`] ?? 0;
  }

  add(provider: string, day: string): void {
    const key = `${provider} ${day}`;
    this.entries[key] = (this.entries[key] ?? 0) + 1;
  }
}

export interface PordistoClock {
  now(): number;
  sleep(ms: number): Promise<void>;
  /** The provider the ledger counts for. */
  provider?: string;
  /** Called after every request let through, e.g. to store the ledger. */
  counted?(): void;
}

/** The gate of the requests of one provider. */
export class Pordisto {
  #last = Number.NEGATIVE_INFINITY;
  #queue: Promise<void> = Promise.resolve();

  constructor(
    readonly limoj: Limoj,
    readonly ledger: AnfragoLedger,
    readonly clock: PordistoClock = {
      now: () => Date.now(),
      sleep: (ms) => new Promise((done) => setTimeout(done, ms)),
    },
  ) {}

  /** Waits for its turn; throws DayLimitReached once the day's requests are used. */
  pass(): Promise<void> {
    const turn = this.#queue.then(() => this.#pass());
    // One request after the other through the gate, whatever the concurrency of the run.
    this.#queue = turn.catch(() => {});
    return turn;
  }

  async #pass(): Promise<void> {
    const provider = this.clock.provider ?? "";
    const perTago = this.limoj.perTago;
    if (perTago !== undefined && this.ledger.count(provider, dayOf(this.clock.now())) >= perTago)
      throw new DayLimitReached(provider, perTago);
    const perSekundo = this.limoj.perSekundo;
    if (perSekundo !== undefined && perSekundo > 0) {
      const interval = 1000 / perSekundo;
      const wait = this.#last + interval - this.clock.now();
      if (wait > 0) await this.clock.sleep(wait);
    }
    this.#last = this.clock.now();
    this.ledger.add(provider, dayOf(this.#last));
    this.clock.counted?.();
  }
}

export interface Schaetzung {
  anfragoj: number;
  sufficient: boolean;
  message: string;
}

/**
 * The requests the remaining results need: a result of Variante F its requests per F (one per tool
 * round and the answer), a result of Variante 0 one. With a daily limit it says whether today is
 * enough after what today has used.
 */
export function schaetzung(input: {
  jobs: { F: number; "0": number };
  perF: number;
  limoj: Limoj;
  todayUsed: number;
}): Schaetzung {
  const anfragoj = Math.ceil(input.jobs.F * input.perF + input.jobs["0"]);
  const perTago = input.limoj.perTago;
  if (perTago === undefined)
    return {
      anfragoj,
      sufficient: true,
      message: `Geschätzt ${anfragoj} Anfragen; kein Tageslimit.`,
    };
  const left = Math.max(0, perTago - input.todayUsed);
  const sufficient = anfragoj <= left;
  return {
    anfragoj,
    sufficient,
    message: `Geschätzt ${anfragoj} Anfragen; Tageslimit ${perTago}, heute schon ${input.todayUsed} verbraucht: ${
      sufficient
        ? "reicht."
        : `reicht nicht. Der Lauf hält am Limit an und setzt mit demselben Befehl am nächsten Tag fort (etwa ${Math.ceil((anfragoj - left) / perTago) + 1} Tage).`
    }`,
  };
}
