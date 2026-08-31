/**
 * Source-text primitives shared by the fidelity audit's extractors.
 *
 * They live here rather than in `bot-api-fidelity.mjs` because the type
 * extractors and the method-parameter extractors (`bot-api-params.mjs`) both
 * need them, and neither should depend on the other: masking a file is a
 * precondition for measuring it, so getting it wrong in two places would mean
 * two subtly different definitions of "what this package declares".
 *
 * Zero dependencies: Node 22+ built-ins only, per the repo NFR-1 policy.
 *
 * @module
 */

/**
 * Replaces the contents of comments and string literals with spaces while
 * preserving line structure, so structural regexes cannot be fooled by markup
 * living inside a doc comment or a docstring.
 *
 * This matters more than it looks: the Python `Message` docstring lists every
 * field under an `Attributes:` section in text that is otherwise identical to a
 * real field declaration, and the TypeScript interfaces carry a one-line doc
 * comment above every property.
 *
 * @param {string} source File text.
 * @param {{hashComments?: boolean, templateLiterals?: boolean, keepStrings?: boolean}} [options]
 *   `hashComments` selects `#` comments and triple-quoted strings (Python);
 *   `templateLiterals` decides whether backticks open a string (TypeScript yes,
 *   Go no); `keepStrings` skips over string bodies without blanking them, which
 *   Go needs because a struct tag *is* the data being read.
 * @returns {string} Same length and same line breaks, with comments/strings blanked.
 */
export function maskCommentsAndStrings(source, options = {}) {
  const { hashComments = false, templateLiterals = true, keepStrings = false } = options;
  const out = source.split('');

  const blank = (from, to) => {
    for (let i = from; i < to && i < out.length; i += 1) {
      if (out[i] !== '\n') out[i] = ' ';
    }
  };

  let i = 0;
  while (i < source.length) {
    const ch = source[i];
    const next = source[i + 1];

    if (hashComments) {
      if (ch === '#') {
        let end = source.indexOf('\n', i);
        if (end === -1) end = source.length;
        blank(i, end);
        i = end;
        continue;
      }
      if ((ch === '"' || ch === "'") && source.startsWith(ch.repeat(3), i)) {
        const fence = ch.repeat(3);
        let end = source.indexOf(fence, i + 3);
        // Backslash escapes work inside triple quotes; honour them so an
        // embedded quote does not close the docstring early.
        while (end !== -1 && source[end - 1] === '\\') {
          end = source.indexOf(fence, end + 3);
        }
        blank(i, end === -1 ? source.length : end + 3);
        i = end === -1 ? source.length : end + 3;
        continue;
      }
    } else {
      if (ch === '/' && next === '/') {
        let end = source.indexOf('\n', i);
        if (end === -1) end = source.length;
        blank(i, end);
        i = end;
        continue;
      }
      if (ch === '/' && next === '*') {
        let end = source.indexOf('*/', i + 2);
        blank(i, end === -1 ? source.length : end + 2);
        i = end === -1 ? source.length : end + 2;
        continue;
      }
    }

    if (ch === '"' || ch === "'" || (templateLiterals && ch === '`')) {
      let j = i + 1;
      while (j < source.length) {
        if (source[j] === '\\') {
          j += 2;
          continue;
        }
        if (source[j] === ch) break;
        // A raw newline ends an ordinary string but not a template literal.
        if (source[j] === '\n' && ch !== '`') break;
        j += 1;
      }
      if (keepStrings) {
        i = Math.min(j + 1, source.length);
        continue;
      }
      blank(i + 1, j);
      i = Math.min(j + 1, source.length);
      continue;
    }

    i += 1;
  }
  return out.join('');
}

/**
 * Index of the brace that closes the block opened at `open`.
 *
 * @param {string} text Masked source text.
 * @param {number} open Index of the opening brace.
 * @returns {number} Index of the matching `}`, or -1 when unbalanced.
 */
export function matchBrace(text, open) {
  return matchDelim(text, open);
}

const PAIRS = { '(': ')', '[': ']', '{': '}' };

/**
 * Index of the delimiter closing the one opened at `open`.
 *
 * @param {string} text Masked source text.
 * @param {number} open Index of an opening `(`, `[` or `{`.
 * @returns {number} Index of the matching closer, or -1 when unbalanced.
 */
export function matchDelim(text, open) {
  const openCh = text[open];
  const want = PAIRS[openCh];
  if (want === undefined) return -1;
  let depth = 0;
  // Nested groups of another kind are balanced among themselves, so only the
  // opener we are matching needs counting.
  for (let i = open; i < text.length; i += 1) {
    const ch = text[i];
    if (ch === openCh) depth += 1;
    else if (ch === want) {
      depth -= 1;
      if (depth === 0) return i;
    }
  }
  return -1;
}

/**
 * Index of the `{` that opens a function body, scanning from `from`.
 *
 * Not the same as `indexOf('{', from)`: a TypeScript return annotation can
 * itself contain a brace block, and `): Promise<{ token: string }> {` would
 * otherwise yield the object type inside the generic. The method body — and
 * therefore every param it puts on the wire — would be silently lost, so the
 * scan skips braces nested inside `<...>`, `(...)` or `[...]`.
 *
 * @param {string} text Masked source text.
 * @param {number} from Index to start scanning, usually just past the `)` that
 *   closes a parameter list.
 * @returns {number} Index of the first depth-0 `{`, or -1 when none is found.
 */
export function bodyBrace(text, from) {
  let angle = 0;
  let round = 0;
  let square = 0;
  for (let i = from; i < text.length; i += 1) {
    const ch = text[i];
    if (ch === '<') angle += 1;
    else if (ch === '>' && text[i - 1] !== '=') angle = Math.max(0, angle - 1);
    else if (ch === '(') round += 1;
    else if (ch === ')') round = Math.max(0, round - 1);
    else if (ch === '[') square += 1;
    else if (ch === ']') square = Math.max(0, square - 1);
    else if (ch === '{' && angle === 0 && round === 0 && square === 0) return i;
  }
  return -1;
}

/** Net bracket/brace/paren delta of one line. */
export function bracketDelta(line) {
  const opened = (line.match(/[{[(]/g) || []).length;
  const closed = (line.match(/[}\])]/g) || []).length;
  return opened - closed;
}

/**
 * Extracts the body of a balanced `{ ... }` block.
 *
 * @param {string} text Masked source text.
 * @param {number} open Index of the opening brace.
 * @returns {{body: string, close: number}|null} Inner text and the closing
 *   index, or null when the block never closes.
 */
export function braceBlock(text, open) {
  const close = matchBrace(text, open);
  if (close === -1) return null;
  return { body: text.slice(open + 1, close), close };
}

/**
 * Splits a comma-separated list at bracket depth 0 only, so a nested object
 * type or a generic argument is never cut in half.
 *
 * @param {string} text Source fragment.
 * @returns {string[]} Top-level entries, trimmed.
 */
export function splitTopLevel(text) {
  const parts = [];
  let depth = 0;
  let current = '';
  for (const ch of text) {
    if ('([{'.includes(ch)) depth += 1;
    else if (')]}'.includes(ch)) depth -= 1;
    if (ch === ',' && depth === 0) {
      parts.push(current.trim());
      current = '';
      continue;
    }
    current += ch;
  }
  if (current.trim() !== '') parts.push(current.trim());
  return parts;
}
