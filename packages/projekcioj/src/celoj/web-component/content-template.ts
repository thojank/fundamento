// The content Eroj of Spec 020 ③ in the element template: the code block (host codeblock, role
// figure) and the Markdown view (host markdown, role document). Celo knowledge (Art. VIII): which
// element holds which part, how a copy is made and said, how Markdown becomes Eroj. The
// generated code holds no template literal and no backtick (the template inserts it into one).

/**
 * The shadow markup of a code block: the platform's figure, named by its caption (figcaption);
 * the content in pre and code, in a region that scrolls along the line and takes the focus, so a
 * keyboard can scroll it; the copy button (a butono of low emphasis, shown with copyable); the
 * polite live region that says the copy.
 */
export function codeblockMarkup(): string {
  return '<figure part="control"><figcaption part="legend" id="caption"><slot name="caption"></slot></figcaption><div part="region" role="region" tabindex="0" aria-labelledby="caption"><pre part="text"><code><slot></slot></code></pre></div><fm-butono part="copy" emphasis="low" size="small" hidden></fm-butono><span part="announce" class="fm-hidden" role="status" aria-live="polite"></span><span id="fm-texts" hidden></span></figure>';
}

/**
 * The shadow markup of a Markdown view: a column around the default slot. The content is built
 * into the light DOM (the Eroj it uses — a tabelo above all — are styled by the document); the
 * shadow holds the gap between the blocks.
 */
export function markdownMarkup(): string {
  return '<div part="control"><slot></slot></div><span id="fm-texts" hidden></span>';
}

/** The copy of a code block: on a click of its button. */
export const codeblockInit = `    root.querySelector('[part="copy"]')?.addEventListener("click", () => this.#copy());
`;

/** The render of a code block: the button shows with copyable, named in the document's language. */
export const codeblockRender = `    const copy = this.shadowRoot?.querySelector('[part="copy"]');
    if (copy instanceof HTMLElement) {
      // Shown with copyable where the platform has a clipboard (a secure context): a button that
      // copies nothing would promise what it does not do.
      const copyable =
        this.propValue("copyable") === true && typeof navigator !== "undefined" && navigator.clipboard !== undefined;
      if (copy.hidden === copyable) copy.hidden = !copyable;
      const words = TEXTS.copyable;
      const word = !copyable || words === undefined ? "" : (words[this.#lingvo()] ?? words.en ?? "");
      if (copy.textContent !== word) copy.textContent = word;
    }
`;

/** The ways of a code block: copying its content and saying so. */
export const codeblockMethods = `
  /** The content of the block: the text of its default slot. */
  #content(): string {
    const slot = this.shadowRoot?.querySelector("slot:not([name])");
    return slot instanceof HTMLSlotElement
      ? slot
          .assignedNodes({ flatten: true })
          .map((node) => node.textContent ?? "")
          .join("")
      : "";
  }

  /** Copies the content; the live region says it, in the document's language. */
  #copy(): void {
    const announce = this.shadowRoot?.querySelector('[part="announce"]');
    const words = TEXTS["announce-name"];
    const said = words === undefined ? "" : (words[this.#lingvo()] ?? words.en ?? "");
    const clipboard = typeof navigator === "undefined" ? undefined : navigator.clipboard;
    if (clipboard === undefined) return;
    void clipboard.writeText(this.#content()).then(() => {
      if (!(announce instanceof HTMLElement)) return;
      // Emptied first: the same word said twice is heard twice.
      announce.textContent = "";
      requestAnimationFrame(() => {
        announce.textContent = said;
      });
    });
  }
`;

/** The render of a Markdown view: the content follows source and start-level. */
export const markdownRender = `    // Nachlese 8 ② (F-5): the rules of the light DOM, adopted by the document once.
    if (typeof document !== "undefined" && MARKDOWN_DOCUMENT_CSS !== "") {
      if (markdownSheet === undefined) {
        markdownSheet = new CSSStyleSheet();
        markdownSheet.replaceSync(MARKDOWN_DOCUMENT_CSS);
      }
      if (!document.adoptedStyleSheets.includes(markdownSheet)) {
        document.adoptedStyleSheets = [...document.adoptedStyleSheets, markdownSheet];
      }
    }
    this.#markdownRender();
`;

/**
 * The ways of a Markdown view (Spec 020 ③, G6): the source as lines, blocks of Eroj, inline text.
 * Only createElement, createTextNode and textContent: no markup of the source is parsed, so
 * nothing of it runs. A link takes https:, http:, mailto: or a relative target; any other is its
 * text. An image is its text (a boundary in round 1). Headings start at start-level; lists nest
 * to depth three.
 */
export const markdownMethods = `
  #markdownShown: string | undefined;
  #markdownLevel = 0;

  #markdownRender(): void {
    const source = String(this.propValue("source") ?? "");
    const start = Number(this.propValue("start-level") ?? "2");
    if (source === this.#markdownShown && start === this.#markdownLevel) return;
    this.#markdownShown = source;
    this.#markdownLevel = start;
    const blocks = this.#markdownBlocks(source.replace(/\\r\\n?/g, "\\n").split("\\n"), start);
    for (const old of [...this.children]) if (old.hasAttribute("data-fm-markdown")) old.remove();
    for (const block of blocks) {
      block.setAttribute("data-fm-markdown", "");
      this.append(block);
    }
  }

  /** Whether the line starts a block of its own (it ends a paragraph). */
  #markdownStarts(lines: readonly string[], index: number): boolean {
    const line = lines[index] ?? "";
    return (
      /^\\s{0,3}(#{1,6})\\s/.test(line) ||
      /^\\s{0,3}(~~~|\\x60\\x60\\x60)/.test(line) ||
      /^\\s{0,3}>/.test(line) ||
      /^\\s*([-*+]|\\d+[.)])\\s+/.test(line) ||
      /^\\s{0,3}([-*_])(\\s*\\1){2,}\\s*$/.test(line) ||
      (line.includes("|") && MARKDOWN_RULE.test(lines[index + 1] ?? ""))
    );
  }

  #markdownBlocks(lines: readonly string[], start: number): HTMLElement[] {
    const out: HTMLElement[] = [];
    // Nachlese 8 ② (F-6): the text of the last heading names the table after it.
    let heading = "";
    let index = 0;
    while (index < lines.length) {
      const line = lines[index] ?? "";
      if (line.trim() === "") {
        index += 1;
        continue;
      }
      const fence = /^\\s{0,3}(~~~|\\x60\\x60\\x60)/.exec(line);
      if (fence !== null) {
        const marker = fence[1] ?? "";
        const body: string[] = [];
        index += 1;
        while (index < lines.length && !(lines[index] ?? "").trim().startsWith(marker)) {
          body.push(lines[index] ?? "");
          index += 1;
        }
        index += 1;
        out.push(this.#markdownCode(body.join("\\n")));
        continue;
      }
      const match = /^\\s{0,3}(#{1,6})\\s+(.*?)\\s*#*\\s*$/.exec(line);
      if (match !== null) {
        const title = document.createElement("fm-titolo");
        title.setAttribute("level", String(Math.min(6, start + (match[1] ?? "#").length - 1)));
        this.#markdownInline(title, match[2] ?? "");
        heading = (title.textContent ?? "").trim();
        out.push(title);
        index += 1;
        continue;
      }
      if (/^\\s{0,3}([-*_])(\\s*\\1){2,}\\s*$/.test(line)) {
        out.push(document.createElement("fm-apartigilo"));
        index += 1;
        continue;
      }
      if (/^\\s{0,3}>/.test(line)) {
        const body: string[] = [];
        while (index < lines.length && /^\\s{0,3}>/.test(lines[index] ?? "")) {
          body.push((lines[index] ?? "").replace(/^\\s{0,3}>\\s?/, ""));
          index += 1;
        }
        const quote = document.createElement("blockquote");
        for (const child of this.#markdownBlocks(body, start)) quote.append(child);
        out.push(quote);
        continue;
      }
      if (line.includes("|") && MARKDOWN_RULE.test(lines[index + 1] ?? "")) {
        const [table, next] = this.#markdownTable(lines, index);
        // A table is named by its caption (the tabelo: never without one): the heading before it,
        // hidden from sight because it stands above already.
        if (heading !== "") {
          table.prepend(document.createTextNode(heading));
          table.setAttribute("caption-hidden", "");
        } else {
          warn("fm-markdovido: a table without a heading before it has no name; put a heading over it (the tabelo is never without a caption).");
        }
        out.push(table);
        index = next;
        continue;
      }
      if (/^\\s*([-*+]|\\d+[.)])\\s+/.test(line)) {
        const [list, next] = this.#markdownList(lines, index, 1);
        out.push(list);
        index = next;
        continue;
      }
      if (/^( {4}|\\t)/.test(line)) {
        const body: string[] = [];
        while (
          index < lines.length &&
          (/^( {4}|\\t)/.test(lines[index] ?? "") || (lines[index] ?? "").trim() === "")
        ) {
          body.push((lines[index] ?? "").replace(/^( {4}|\\t)/, ""));
          index += 1;
        }
        out.push(this.#markdownCode(body.join("\\n").replace(/\\n+$/, "")));
        continue;
      }
      const body: string[] = [line.trim()];
      index += 1;
      while (
        index < lines.length &&
        (lines[index] ?? "").trim() !== "" &&
        !this.#markdownStarts(lines, index)
      ) {
        body.push((lines[index] ?? "").trim());
        index += 1;
      }
      const paragraph = document.createElement("fm-teksto");
      this.#markdownInline(paragraph, body.join(" "));
      out.push(paragraph);
    }
    return out;
  }

  /** A code block of the source: a kodbloko, its text the content. */
  #markdownCode(text: string): HTMLElement {
    const block = document.createElement("fm-kodbloko");
    block.textContent = text;
    return block;
  }

  /** A list and the line after it; a deeper indent nests, to depth three. */
  #markdownList(lines: readonly string[], from: number, depth: number): [HTMLElement, number] {
    const first = /^(\\s*)([-*+]|\\d+[.)])\\s+/.exec(lines[from] ?? "");
    const indent = (first?.[1] ?? "").length;
    const ordered = /\\d/.test(first?.[2] ?? "");
    const list = document.createElement(ordered ? "ol" : "ul");
    let index = from;
    while (index < lines.length) {
      const item = /^(\\s*)([-*+]|\\d+[.)])\\s+(.*)$/.exec(lines[index] ?? "");
      if (item === null || (item[1] ?? "").length < indent) break;
      if ((item[1] ?? "").length > indent && depth < 3 && list.lastElementChild !== null) {
        const [sub, next] = this.#markdownList(lines, index, depth + 1);
        list.lastElementChild.append(sub);
        index = next;
        continue;
      }
      if ((item[1] ?? "").length === indent && /\\d/.test(item[2] ?? "") !== ordered) break;
      // The text of an item is a teksto, so it takes the typography of a paragraph.
      const entry = document.createElement("li");
      const words = document.createElement("fm-teksto");
      this.#markdownInline(words, item[3] ?? "");
      entry.append(words);
      list.append(entry);
      index += 1;
    }
    return [list, index];
  }

  /** The cells of a table row, without the outer pipes. */
  #markdownCells(line: string): string[] {
    return line
      .trim()
      .replace(/^\\|/, "")
      .replace(/\\|$/, "")
      .split("|")
      .map((cell) => cell.trim());
  }

  /** A pipe table: a tabelo around the platform's table, its column headers and alignment. */
  #markdownTable(lines: readonly string[], from: number): [HTMLElement, number] {
    const head = this.#markdownCells(lines[from] ?? "");
    const aligns = this.#markdownCells(lines[from + 1] ?? "").map((cell) =>
      cell.startsWith(":") && cell.endsWith(":")
        ? "center"
        : cell.endsWith(":")
          ? "end"
          : cell.startsWith(":")
            ? "start"
            : "",
    );
    const tabelo = document.createElement("fm-tabelo");
    const table = document.createElement("table");
    table.setAttribute("slot", "content");
    const thead = document.createElement("thead");
    const headRow = document.createElement("tr");
    head.forEach((cell, column) => {
      const th = document.createElement("th");
      th.setAttribute("scope", "col");
      if (aligns[column] !== "" && aligns[column] !== undefined) th.setAttribute("data-align", aligns[column] ?? "");
      this.#markdownInline(th, cell);
      headRow.append(th);
    });
    thead.append(headRow);
    const tbody = document.createElement("tbody");
    let index = from + 2;
    while (index < lines.length && (lines[index] ?? "").includes("|") && (lines[index] ?? "").trim() !== "") {
      const row = document.createElement("tr");
      this.#markdownCells(lines[index] ?? "").forEach((cell, column) => {
        const td = document.createElement("td");
        if (aligns[column] !== "" && aligns[column] !== undefined) td.setAttribute("data-align", aligns[column] ?? "");
        this.#markdownInline(td, cell);
        row.append(td);
      });
      tbody.append(row);
      index += 1;
    }
    table.append(thead, tbody);
    tabelo.append(table);
    return [tabelo, index];
  }

  /** Whether a link target is safe: https, http, mailto or relative (no scheme). */
  #markdownSafe(target: string): boolean {
    const plain = target.replace(/[\\u0000-\\u0020\\u007f]/g, "");
    if (/^(https?:|mailto:)/i.test(plain)) return true;
    return !/^[a-z][a-z0-9+.-]*:/i.test(plain);
  }

  /** The inline text of a block: code, strong, emphasis, links and images, the rest as text. */
  #markdownInline(target: Element, text: string): void {
    let rest = text;
    while (rest !== "") {
      const match = MARKDOWN_INLINE.exec(rest);
      if (match === null) {
        target.append(document.createTextNode(rest));
        return;
      }
      if (match.index > 0) target.append(document.createTextNode(rest.slice(0, match.index)));
      if (match[1] !== undefined) {
        const code = document.createElement("fm-teksto");
        code.setAttribute("kind", "code");
        code.textContent = (match[2] ?? "").trim();
        target.append(code);
      } else if (match[3] !== undefined || match[4] !== undefined) {
        const strong = document.createElement("strong");
        this.#markdownInline(strong, match[3] ?? match[4] ?? "");
        target.append(strong);
      } else if (match[5] !== undefined || match[6] !== undefined) {
        const emphasis = document.createElement("em");
        this.#markdownInline(emphasis, match[5] ?? match[6] ?? "");
        target.append(emphasis);
      } else if (match[7] !== undefined) {
        // An image is its text in round 1 (the boundary images of the Uzo).
        target.append(document.createTextNode(match[7]));
      } else {
        const label = match[9] ?? "";
        const destination = match[10] ?? "";
        if (this.#markdownSafe(destination)) {
          const link = document.createElement("fm-ligilo");
          link.setAttribute("to", destination);
          link.setAttribute("rel", "noopener noreferrer");
          this.#markdownInline(link, label);
          target.append(link);
        } else {
          this.#markdownInline(target, label);
        }
      }
      rest = rest.slice(match.index + match[0].length);
    }
  }
`;

/**
 * The module-level constants of a Markdown view: the patterns of a table rule and of inline text,
 * and the rules of its light DOM (Nachlese 8 ②, F-5), from the indent of the Skemo.
 */
export const markdownConstants = (documentCss: string): string => `
/** The rules of the light DOM (F-5): the indent of a nested list, which ::slotted cannot reach. */
const MARKDOWN_DOCUMENT_CSS: string = ${JSON.stringify(documentCss)};
let markdownSheet: CSSStyleSheet | undefined;
/** The rule under the head of a pipe table. */
const MARKDOWN_RULE = /^\\s*\\|?\\s*:?-+:?\\s*(\\|\\s*:?-+:?\\s*)*\\|?\\s*$/;
/** Inline Markdown: code, strong, emphasis, an image, a link (the backtick spelt as \\x60). */
const MARKDOWN_INLINE =
  /(\\x60+)([\\s\\S]*?)\\1|\\*\\*([\\s\\S]+?)\\*\\*|__([\\s\\S]+?)__|\\*([^*]+?)\\*|_([^_]+?)_|!\\[([^\\]]*)\\]\\(([^)\\s]*)\\)|\\[([^\\]]+)\\]\\(([^)\\s]*)\\)/;
`;
