/**
 * Method-parameter extractors: for one source file, which documented Bot API
 * params can each method actually put on the wire?
 *
 * This is the companion to the type extractors in `bot-api-fidelity.mjs`. That
 * half answers "if Telegram sends this object, can we decode it?". This half
 * answers "if a caller wants to pass this documented argument, can they?".
 * They are different questions, and a package can pass one and fail the other:
 * `sendMessage` exists in all three frameworks, yet `SendPollOptions` in node
 * declares 19 of the 34 params the docs list for `sendPoll`.
 *
 * What counts as "can send" is measured from the request call itself, not from
 * the parameter list, because that is the expression that becomes the HTTP
 * body. Each language has one dominant shape and a few real variants:
 *
 * - node    `this.request<T>("wire", options as unknown as Record<...>)`,
 *           an object literal, or a `payload` local assembled field by field.
 *           The `options` type is either a named interface (resolved through
 *           `fieldsOf`, so an `extends` clause counts) or an inline
 *           `{ chat_id: number; ... }` block.
 * - go      `b.Request(ctx, "wire", opts, &res)` with `opts *types.XOptions`,
 *           where the sendable keys are that struct's `json:"..."` tags; or a
 *           positional method building `map[string]any{"chat_id": chatID}` and
 *           adding `payload["caption"] = caption` under guards.
 * - python  `clean_payload(chat_id=chat_id, question=question, ...)` inside an
 *           `async def` whose keyword-only arguments are already wire-named.
 *           No Bot API method in the package uses `**kwargs`, which is what
 *           makes the signature trustworthy; `partial` flags it if one starts
 *           to.
 *
 * Deliberately NOT guessed: an unresolvable expression yields `partial: true`
 * rather than a best-effort key list. A silently wrong extractor is worse than
 * a flagged blind spot, because the ratchet in `compareBaseline` would bank the
 * error as accepted truth.
 *
 * Zero dependencies: Node 22+ built-ins only, per the repo NFR-1 policy.
 *
 * @module
 */

import { bodyBrace, matchDelim } from './bot-api-source.mjs';

/**
 * The identifier a language names a Bot API method with.
 *
 * @param {string} wire Documented method name, e.g. `sendPhoto`.
 * @param {'node'|'go'|'python'} lang Package key.
 * @returns {string} `sendPhoto` | `SendPhoto` | `send_photo`.
 */
export function methodIdentifier(wire, lang) {
  if (lang === 'node') return wire[0].toLowerCase() + wire.slice(1);
  if (lang === 'go') return wire[0].toUpperCase() + wire.slice(1);
  return wire.replace(/([A-Z])/g, (c) => `_${c.toLowerCase()}`).replace(/^_/, '');
}

/**
 * Inverse of {@link methodIdentifier}, used to key extraction output by the
 * documented name. Documented method names are camelCase with no digit or
 * acronym runs, so first-letter casing is exactly reversible — and for node,
 * whose identifier is the wire name unchanged, it needs none.
 *
 * @param {string} name Declared identifier.
 * @param {'node'|'go'|'python'} lang Package key.
 * @returns {string} Documented method name.
 */
export function identifierToWire(name, lang) {
  if (lang === 'node') return name;
  if (lang === 'go') return name[0].toLowerCase() + name.slice(1);
  return name.replace(/_([a-z0-9])/g, (_, c) => c.toUpperCase());
}

/**
 * Splits an argument or entry list at separators sitting at bracket depth 0.
 *
 * @param {string} text Source fragment between the delimiters.
 * @param {string} [separators] Characters that split, default `,`.
 * @returns {string[]} One entry per top-level segment, trimmed.
 */
function splitEntries(text, separators = ',') {
  const out = [];
  let current = '';
  let depth = 0;
  for (const ch of text) {
    if ('([{<'.includes(ch)) depth += 1;
    else if (')]}'.includes(ch) || ch === '>') depth = Math.max(0, depth - 1);
    current += ch;
    if (depth === 0 && separators.includes(ch)) {
      if (current.trim() !== '') out.push(current.trim().replace(/[,;]$/, '').trim());
      current = '';
    }
  }
  if (current.trim() !== '') out.push(current.trim());
  return out;
}

/**
 * Splits an argument list at commas that sit at bracket depth 0.
 *
 * @param {string} text Contents between the call's parentheses.
 * @returns {string[]} One entry per argument, trimmed.
 */
function splitArgs(text) {
  return splitEntries(text, ',');
}

/**
 * Reads the entries of an object literal or an inline object type.
 *
 * Both are written the same way except for their separators: a literal splits
 * on commas, a type member list on commas, semicolons or plain newlines. The
 * single-line case is what a naive line scan loses, and it is common —
 * `const payload: Record<string, unknown> = { chat_id: chatId, user_id: userId }`
 * sits entirely on one line.
 *
 * @param {string} text Contents between the braces.
 * @param {string} [separators] Split characters, default `,`.
 * @returns {{keys: Set<string>, spreads: string[], unparsed: boolean}}
 */
function literalEntries(text, separators = ',') {
  const keys = new Set();
  const spreads = [];
  let unparsed = false;
  for (const entry of splitEntries(text, separators)) {
    const spread = /^\.\.\.\s*([\w$.]+)/.exec(entry);
    if (spread) {
      spreads.push(spread[1]);
      continue;
    }
    const named = /^(?:readonly\s+)?(["']?)([A-Za-z_$][\w$]*)\1\??\s*:/.exec(entry);
    if (named) {
      keys.add(named[2]);
      continue;
    }
    // ES6 shorthand: `{ name }`, or the tail of `{ chat_id: chatId, title }`.
    if (/^[A-Za-z_$][\w$]*$/.test(entry)) {
      keys.add(entry);
      continue;
    }
    unparsed = true;
  }
  return { keys, spreads, unparsed };
}

/**
 * Wire keys an identifier can carry: a typed parameter, an inline-typed
 * parameter, or a local assembled with `payload.x = ...` / `payload["x"] = ...`.
 *
 * @param {string} name Identifier.
 * @param {Map<string, {keys: Set<string>, type?: string}>} params Signature map.
 * @param {(type: string) => Set<string>|null} resolve Named type to wire keys.
 * @param {string} body Enclosing method body.
 * @returns {{keys: Set<string>, partial: boolean}}
 */
function keysOfIdentifier(name, params, resolve, body) {
  const keys = new Set();
  let partial = false;
  const known = params.get(name);
  if (known) {
    for (const k of known.keys) keys.add(k);
    if (known.type) {
      const resolved = resolve(known.type);
      if (resolved) for (const k of resolved) keys.add(k);
      else partial = true;
    }
  }
  const declared = new RegExp(`\\b(?:const|let|var)\\s+${name}\\b[^=]*=\\s*\\{`).exec(body);
  if (declared) {
    const open = body.indexOf('{', declared.index + declared[0].length - 1);
    const close = matchDelim(body, open);
    if (close === -1) partial = true;
    else {
      const read = literalEntries(body.slice(open + 1, close), ',;\n');
      for (const k of read.keys) keys.add(k);
      if (read.unparsed) partial = true;
      for (const spread of read.spreads) {
        const inner = keysOfIdentifier(spread, params, resolve, body);
        for (const k of inner.keys) keys.add(k);
        partial = partial || inner.partial;
      }
    }
  }
  if (!known && !declared) return { keys, partial: true };
  for (const write of body.matchAll(
    new RegExp(`\\b${name}\\s*(?:\\.([A-Za-z_$][\\w$]*)|\\[\\s*["'](\\w+)["']\\s*\\])\\s*=[^=]`, 'g'),
  )) {
    keys.add(write[1] || write[2]);
  }
  return { keys, partial };
}

/**
 * Reads one payload argument into the wire keys it can carry.
 *
 * @param {string} expr Source text of the argument.
 * @param {Map<string, {keys: Set<string>, type?: string}>} params Parameter map.
 * @param {(type: string) => Set<string>|null} resolve Named type to wire keys.
 * @param {string} body Enclosing method body, for `payload` locals.
 * @returns {{keys: Set<string>, partial: boolean}}
 */
function payloadKeys(expr, params, resolve, body) {
  const keys = new Set();
  let partial = false;
  const text = expr.trim();
  if (text === '') return { keys, partial: true };

  if (text.startsWith('{')) {
    const close = matchDelim(text, 0);
    if (close === -1) return { keys, partial: true };
    const read = literalEntries(text.slice(1, close), ',;\n');
    for (const k of read.keys) keys.add(k);
    partial = read.unparsed;
    for (const spread of read.spreads) {
      const inner = keysOfIdentifier(spread, params, resolve, body);
      for (const k of inner.keys) keys.add(k);
      partial = partial || inner.partial;
    }
    return { keys, partial };
  }

  const ident = /^([A-Za-z_$][\w$]*)(?:\s+as\s+[\s\S]*|\s*:\s*[\s\S]*)?$/.exec(text);
  if (ident) return keysOfIdentifier(ident[1], params, resolve, body);
  return { keys, partial: true };
}

/**
 * Requests made through a wrapper are still requests; only the literal naming
 * the documented method matters, so the call's own name is not matched.
 *
 * @param {string} body Masked method body.
 * @param {string} wire Documented method name.
 * @returns {Array<{args: string}>} One entry per call site.
 */
function requestCallSites(body, wire) {
  const sites = [];
  const quoted = new RegExp(`["'\`]${wire}["'\`]`, 'g');
  for (const match of body.matchAll(quoted)) {
    const open = body.lastIndexOf('(', match.index);
    if (open === -1) continue;
    const close = matchDelim(body, open);
    if (close === -1) continue;
    sites.push({ open, close, args: body.slice(open + 1, close) });
  }
  return sites;
}

/**
 * Finds every `async <name>(...) { <body> }` in a masked TypeScript file.
 *
 * @param {string} masked Masked file text.
 * @returns {Array<{name: string, sig: string, body: string}>}
 */
function typeScriptMethods(masked) {
  const found = [];
  const re = /\basync\s+([A-Za-z_$][\w$]*)\s*(?:<[^<>]*>)?\s*\(/g;
  let match;
  while ((match = re.exec(masked)) !== null) {
    const open = match.index + match[0].length - 1;
    const close = matchDelim(masked, open);
    if (close === -1) break;
    const brace = bodyBrace(masked, close + 1);
    if (brace === -1) break;
    const end = matchDelim(masked, brace);
    if (end === -1) break;
    found.push({ name: match[1], sig: masked.slice(open + 1, close), body: masked.slice(brace + 1, end) });
    re.lastIndex = end;
  }
  return found;
}

/**
 * Maps a TypeScript signature's parameters to what they can carry.
 *
 * An inline `options: { a: number; b?: string }` is read here; a named
 * `options: SendMessageOptions` is recorded as a type for the caller to
 * resolve, because interfaces live in other files.
 *
 * @param {string} sig Signature text between the parentheses.
 * @returns {Map<string, {keys: Set<string>, type?: string}>}
 */
function typeScriptParams(sig) {
  const params = new Map();
  for (const entry of splitArgs(sig)) {
    const named = /^([A-Za-z_$][\w$]*)\??\s*:([\s\S]*)$/.exec(entry);
    if (!named) {
      const bare = /^([A-Za-z_$][\w$]*)/.exec(entry);
      if (bare) params.set(bare[1], { keys: new Set() });
      continue;
    }
    const [, name, rawType] = named;
    const type = rawType.split('=')[0].trim();
    if (type.startsWith('{')) {
      const open = type.indexOf('{');
      const close = matchDelim(type, open);
      params.set(
        name,
        { keys: literalEntries(type.slice(open + 1, close === -1 ? type.length : close), ',;\n').keys },
      );
    } else {
      params.set(name, { keys: new Set(), type: type.replace(/<[\s\S]*$/, '').split('|')[0].trim() });
    }
  }
  return params;
}

/**
 * node: which documented params can each method send?
 *
 * @param {string} masked Masked TypeScript file text.
 * @param {(type: string) => Set<string>|null} [resolve] Named type to wire keys.
 * @returns {Map<string, {keys: Set<string>, partial: boolean}>} By wire name.
 */
export function extractTypeScriptMethodParams(masked, resolve = () => null) {
  const out = new Map();
  for (const method of typeScriptMethods(masked)) {
    const wire = identifierToWire(method.name, 'node');
    const params = typeScriptParams(method.sig);
    const sites = requestCallSites(method.body, wire);
    const keys = new Set();
    let partial = sites.length === 0;
    for (const site of sites) {
      const args = splitArgs(site.args);
      // The wire name is argument 0; the payload follows it, when there is one.
      if (args.length < 2) continue;
      const read = payloadKeys(args.slice(1).join(','), params, resolve, method.body);
      for (const k of read.keys) keys.add(k);
      partial = partial || read.partial;
    }
    out.set(wire, { keys, partial, found: sites.length > 0 });
  }
  return out;
}

/**
 * go: which documented params can each `*Bot` method send?
 *
 * @param {string} masked Masked Go file text, with string bodies preserved
 *   (a `json:"chat_id"` tag and a `payload["chat_id"]` key are both data).
 * @param {(type: string) => Set<string>|null} [resolve] Struct name to json tags.
 * @returns {Map<string, {keys: Set<string>, partial: boolean}>} By wire name.
 */
export function extractGoMethodParams(masked, resolve = () => null) {
  const re = /^[ \t]*func\s+\(\s*\w+\s+\*?(\w+)\s*\)\s+([A-Za-z]\w*)\s*\(/gm;
  const regions = [];
  let match;
  while ((match = re.exec(masked)) !== null) {
    if (match[1] !== 'Bot') continue;
    const open = match.index + match[0].length - 1;
    const close = matchDelim(masked, open);
    if (close === -1) break;
    const sig = masked.slice(open + 1, close);
    const brace = bodyBrace(masked, close + 1);
    if (brace === -1) break;
    const end = matchDelim(masked, brace);
    if (end === -1) break;
    regions.push({ name: match[2], sig, body: masked.slice(brace + 1, end) });
    re.lastIndex = end;
  }

  /** Keys one function body puts on the wire, ignoring what it delegates. */
  const ownKeys = (region) => {
    const keys = new Set();
    let partial = false;
    // An `opts *types.SendPollOptions` parameter contributes its json tags.
    for (const arg of splitArgs(region.sig)) {
      const optsType = /\*?([\w.]*\.)?(\w+Options)\b/.exec(arg);
      if (optsType) {
        const resolved = resolve(optsType[2]);
        if (resolved) for (const k of resolved) keys.add(k);
        else partial = true;
      }
    }
    const entries = (text, from, to) => {
      for (const entry of splitArgs(text.slice(from, to))) {
        const named = /^\s*["'](\w+)["']\s*:/.exec(entry);
        if (named) keys.add(named[1]);
      }
    };
    for (const lit of region.body.matchAll(/map\[\w+\][\w.]*\s*\{/g)) {
      const block = matchDelim(region.body, lit.index + lit[0].length - 1);
      if (block === -1) partial = true;
      else entries(region.body, lit.index + lit[0].length, block);
    }
    // An anonymous payload struct: the json tags are the keys.
    for (const lit of region.body.matchAll(/\bstruct\s*\{/g)) {
      const block = matchDelim(region.body, lit.index + lit[0].length - 1);
      if (block === -1) continue;
      for (const tag of region.body.slice(lit.index + lit[0].length, block).matchAll(/json:"(\w+)/g)) {
        if (tag[1] !== '-' && tag[1] !== ',') keys.add(tag[1]);
      }
    }
    for (const write of region.body.matchAll(/\b(\w+)\s*\[\s*["'](\w+)["']\s*\]\s*=[^=]/g)) keys.add(write[2]);
    return { keys, partial };
  };

  const byName = new Map(regions.map((region) => [region.name, region]));
  const out = new Map();
  for (const region of regions) {
    if (!/^[A-Z]/.test(region.name)) continue;
    const wire = identifierToWire(region.name, 'go');
    const own = ownKeys(region);
    const keys = new Set(own.keys);
    let partial = own.partial;
    // Delegation: a private helper builds part of this method's payload, and
    // sometimes the caller names the key it should be filed under.
    for (const call of region.body.matchAll(/\bb\.([a-z]\w*)\s*\(/g)) {
      const helper = byName.get(call[1]);
      const open = call.index + call[0].length - 1;
      const close = matchDelim(region.body, open);
      const args = close === -1 ? '' : region.body.slice(open + 1, close);
      if (close === -1) partial = true;
      if (helper) {
        for (const k of ownKeys(helper).keys) keys.add(k);
        if (ownKeys(helper).partial) partial = true;
      }
      for (const entry of splitArgs(args)) {
        const literal = /^"([a-z][a-z0-9_]*)"$/.exec(entry.trim());
        if (literal && literal[1] !== wire) keys.add(literal[1]);
      }
    }
    const found = requestCallSites(region.body, wire).length > 0;
    out.set(wire, { keys, partial: partial || !found, found });
  }
  return out;
}

/**
 * python: which documented params can each `Bot` method send?
 *
 * @param {string} masked Masked Python file text (docstrings blanked).
 * @returns {Map<string, {keys: Set<string>, partial: boolean}>} By wire name.
 */
export function extractPythonMethodParams(masked) {
  const lines = masked.split('\n');
  const out = new Map();
  for (let index = 0; index < lines.length; index += 1) {
    const header = /^\s+async\s+def\s+([a-z_]\w*)\s*\(/.exec(lines[index]);
    if (!header) continue;
    const wire = identifierToWire(header[1], 'python');
    // Collect the signature, which may wrap over several lines.
    let depth = (lines[index].match(/\(/g) || []).length - (lines[index].match(/\)/g) || []).length;
    let sig = lines[index].slice(lines[index].indexOf('(') + 1);
    let cursor = index;
    while (depth > 0 && cursor + 1 < lines.length) {
      cursor += 1;
      sig += `\n${lines[cursor]}`;
      depth += (lines[cursor].match(/\(/g) || []).length - (lines[cursor].match(/\)/g) || []).length;
    }
    const bodyStart = cursor + 1;
    let bodyEnd = bodyStart;
    while (bodyEnd < lines.length) {
      const line = lines[bodyEnd];
      if (line.trim() !== '' && !/^[ \t]/.test(line)) break;
      if (/^\s{4}(?:async\s+)?def\s|^\s{4}@/.test(line) && bodyEnd !== bodyStart) break;
      bodyEnd += 1;
    }
    const body = lines.slice(bodyStart, bodyEnd).join('\n');

    const keys = new Set();
    let partial = false;
    for (const entry of splitArgs(sig)) {
      if (entry.includes('**')) partial = true;
      const named = /^([a-z_]\w*)\s*(?::|,|$|=)/.exec(entry.replace(/^\*+/, ''));
      if (!named || named[1] === 'self' || named[1] === 'cls') continue;
      if (/^_/.test(named[1])) continue;
      keys.add(named[1]);
    }
    for (const call of body.matchAll(/\b(?:clean_)?payload\s*\(/g)) {
      const close = matchDelim(body, call.index + call[0].length - 1);
      if (close === -1) {
        partial = true;
        continue;
      }
      for (const entry of splitArgs(body.slice(call.index + call[0].length, close))) {
        const named = /^([a-z_]\w*)\s*=/.exec(entry);
        if (named) keys.add(named[1]);
      }
    }
    for (const write of body.matchAll(/\b(\w+)\s*\[\s*["'](\w+)["']\s*\]\s*=[^=]/g)) keys.add(write[2]);
    for (const lit of body.matchAll(/\b(?:payload|data|params)\s*=\s*\{/g)) {
      const block = matchDelim(body, lit.index + lit[0].length - 1);
      if (block === -1) {
        partial = true;
        continue;
      }
      for (const entry of splitArgs(body.slice(lit.index + lit[0].length, block))) {
        const named = /^\s*["'](\w+)["']\s*:/.exec(entry);
        if (named) keys.add(named[1]);
      }
    }
    const found = requestCallSites(body, wire).length > 0;
    out.set(wire, { keys, partial: partial || !found, found });
  }
  return out;
}
