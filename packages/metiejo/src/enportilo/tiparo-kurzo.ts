// The family part of the CSS shorthand `font` (Spec 036 Teil 4, Nachbesserung A-3):
// `font: [style] [variant] [weight] [stretch] <size>[/<line-height>] <family-list>`. The family list
// comes last, after the size, and the size may be a function with spaces and commas in it
// (`clamp(2rem, 4vw + 1rem, 3.5rem)`), so the value is read in tokens at the top level – outside
// quotes and brackets – never split at its first comma. A system font (`caption`, `menu` …) or a
// shorthand with nothing after its size names no family.

/** A token of a value at the top level, with where it starts in the value. */
interface Token {
  text: string;
  start: number;
}

/** The tokens of a value: words split at whitespace, `/` and `,` on their own; quotes and brackets kept whole. */
function tokensOf(value: string): Token[] {
  const tokens: Token[] = [];
  let start = -1;
  let depth = 0;
  let quote: string | undefined;
  const end = (at: number): void => {
    if (start >= 0) tokens.push({ text: value.slice(start, at), start });
    start = -1;
  };
  for (let at = 0; at < value.length; at += 1) {
    const char = value[at] ?? "";
    if (quote !== undefined) {
      if (char === "\\") at += 1;
      else if (char === quote) quote = undefined;
      continue;
    }
    if (depth === 0 && /\s/.test(char)) {
      end(at);
      continue;
    }
    if (depth === 0 && (char === "/" || char === ",")) {
      end(at);
      tokens.push({ text: char, start: at });
      continue;
    }
    if (start < 0) start = at;
    if (char === '"' || char === "'") quote = char;
    else if (char === "(") depth += 1;
    else if (char === ")") depth = Math.max(0, depth - 1);
  }
  end(value.length);
  return tokens;
}

/** The whole value is one of these: a system font or a global keyword – a shorthand without a family. */
const WITHOUT_FAMILY =
  /^(caption|icon|menu|message-box|small-caption|status-bar|inherit|initial|unset|revert|revert-layer)$/i;
/** Style, variant, weight and stretch before the size (a weight is a bare number, an oblique angle in deg). */
const BEFORE_SIZE =
  /^(normal|italic|oblique|small-caps|bold|bolder|lighter|(ultra-|extra-|semi-)?(condensed|expanded)|\d*\.?\d+|-?\d*\.?\d+deg)$/i;
/** A size: a length or percentage, a size keyword, or a function call such as clamp(), calc() or var(). */
const SIZE = /^(\d*\.?\d+[a-z%]+|(xx?-|xxx-)?(small|large)|medium|larger|smaller|[a-z-]+\(.*\))$/is;

/**
 * Reads a value as the shorthand `font`: undefined when it is none (no size where the shorthand
 * has one – then it is a plain family list), else the family list after the size and the optional
 * line height, `familioj` undefined when nothing comes after them.
 */
export function fontShorthandOf(value: string): { familioj: string | undefined } | undefined {
  const tokens = tokensOf(value.trim());
  if (tokens.length === 1 && WITHOUT_FAMILY.test(tokens[0]?.text ?? "")) {
    return { familioj: undefined };
  }
  let at = 0;
  while (at < tokens.length && BEFORE_SIZE.test(tokens[at]?.text ?? "")) at += 1;
  const size = tokens[at];
  if (size === undefined || !SIZE.test(size.text) || tokens[at + 1]?.text === ",") return undefined;
  at += 1;
  if (tokens[at]?.text === "/") at += 2;
  const rest = tokens[at];
  const familioj = rest === undefined ? "" : value.trim().slice(rest.start).trim();
  return { familioj: familioj === "" ? undefined : familioj };
}
