/**
 * Tests for the method-parameter extractors.
 *
 * Every fixture is copied from a shape that actually occurs in this repo,
 * because the point of these extractors is to measure three existing packages,
 * not an idealised one: node writes both `options: XOptions` and inline
 * `options: { ... }`, go mixes `*types.XOptions` structs with positional
 * methods assembling `map[string]any`, and python names its keyword arguments
 * after the wire keys and forwards them through `clean_payload`.
 *
 * Run with: node --test scripts/bot-api-params.test.mjs
 *
 * @module
 */

import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

import {
  extractGoMethodParams,
  extractPythonMethodParams,
  extractTypeScriptMethodParams,
  identifierToWire,
  methodIdentifier,
} from './bot-api-params.mjs';
import { maskCommentsAndStrings } from './bot-api-source.mjs';

/** node masks strings away for the type audit; params must see the wire name. */
const ts = (source) => maskCommentsAndStrings(source, { keepStrings: true });
const go = (source) => maskCommentsAndStrings(source, { templateLiterals: false, keepStrings: true });
const py = (source) => maskCommentsAndStrings(source, { hashComments: true, keepStrings: true });

test('method identifiers round-trip for every documented method', async () => {
  const oracle = JSON.parse(await readFile(new URL('./bot-api-oracle.json', import.meta.url), 'utf-8'));
  for (const wire of Object.keys(oracle.methods)) {
    for (const lang of ['node', 'go', 'python']) {
      assert.equal(
        identifierToWire(methodIdentifier(wire, lang), lang),
        wire,
        `${lang} cannot name ${wire}`,
      );
    }
  }
});

test('node: an options interface supplies the params', () => {
  const masked = ts(`
    export class Bot {
      public async sendPoll(options: SendPollOptions): Promise<Message> {
        return this.request<Message>('sendPoll', options as unknown as Record<string, unknown>);
      }
    }
  `);
  const resolve = (type) => (type === 'SendPollOptions' ? new Set(['chat_id', 'question', 'type']) : null);
  const found = extractTypeScriptMethodParams(masked, resolve).get('sendPoll');
  assert.equal(found.found, true);
  assert.equal(found.partial, false);
  assert.deepEqual([...found.keys].sort(), ['chat_id', 'question', 'type']);
});

test('node: an inline options type is read without any interface', () => {
  const masked = ts(`
    export class Bot {
      public async forwardMessage(options: {
        chat_id: number | string;
        from_chat_id: number | string;
        message_id: number;
      }): Promise<Message> {
        return this.request<Message>('forwardMessage', options as unknown as Record<string, unknown>);
      }
    }
  `);
  const found = extractTypeScriptMethodParams(masked).get('forwardMessage');
  assert.deepEqual([...found.keys].sort(), ['chat_id', 'from_chat_id', 'message_id']);
});

test('node: a payload local built field by field still counts', () => {
  const masked = ts(`
    export class Bot {
      public async setBusinessAccountName(chatId: string, name: string): Promise<true> {
        const payload: Record<string, unknown> = {};
        payload['business_connection_id'] = chatId;
        payload.name = name;
        if (name.length > 64) throw new Error('too long');
        return this.request<true>('setBusinessAccountName', payload);
      }
    }
  `);
  const found = extractTypeScriptMethodParams(masked).get('setBusinessAccountName');
  assert.deepEqual([...found.keys].sort(), ['business_connection_id', 'name']);
});

test('node: a literal payload spreads an options bag', () => {
  const masked = ts(`
    export class Bot {
      public async getUserGifts(userId: number, options: GetUserGiftsOptions = {}): Promise<unknown> {
        return this.request<unknown>('getUserGifts', { user_id: userId, ...options });
      }
    }
  `);
  const resolve = (type) => (type === 'GetUserGiftsOptions' ? new Set(['offset', 'limit']) : null);
  const found = extractTypeScriptMethodParams(masked, resolve).get('getUserGifts');
  assert.deepEqual([...found.keys].sort(), ['limit', 'offset', 'user_id']);
});

test('node: a method that never issues the request is flagged, not scored empty', () => {
  const masked = ts(`
    export class Bot {
      public async doSomethingElse(options: WeirdOptions): Promise<true> {
        return this.otherRequest<WeirdOptions, true>('someOtherWireName', options);
      }
    }
  `);
  const found = extractTypeScriptMethodParams(masked, () => new Set(['a'])).get('doSomethingElse');
  assert.equal(found.found, false);
  assert.equal(found.partial, true);
});

test('go: an Options struct supplies json-tagged params', () => {
  const masked = go(`
    func (b *Bot) SendPoll(ctx context.Context, opts *types.SendPollOptions) (*types.Message, error) {
      var msg types.Message
      if err := b.Request(ctx, "sendPoll", opts, &msg); err != nil {
        return nil, err
      }
      return &msg, nil
    }
  `);
  const resolve = (type) => (type === 'SendPollOptions' ? new Set(['chat_id', 'question', 'is_anonymous']) : null);
  const found = extractGoMethodParams(masked, resolve).get('sendPoll');
  assert.equal(found.found, true);
  assert.equal(found.partial, false);
  assert.deepEqual([...found.keys].sort(), ['chat_id', 'is_anonymous', 'question']);
});

test('go: a positional method assembles a map payload', () => {
  const masked = go(`
    func (b *Bot) SendPhoto(ctx context.Context, chatID any, photo any, caption string, replyMarkup *types.InlineKeyboardMarkup) (*types.Message, error) {
      payload := map[string]any{
        "chat_id": chatID,
        "photo":   photo,
      }
      if caption != "" {
        payload["caption"] = caption
      }
      return b.upload(ctx, "sendPhoto", payload, nil)
    }
  `);
  const found = extractGoMethodParams(masked).get('sendPhoto');
  assert.deepEqual([...found.keys].sort(), ['caption', 'chat_id', 'photo']);
});

test('go: a lowercase request helper is still a request', () => {
  const masked = go(`
    func (b *Bot) RepostStory(ctx context.Context, opts *types.RepostStoryOptions) (any, error) {
      return b.requestUnknown(ctx, "repostStory", opts)
    }
  `);
  const resolve = (type) => (type === 'RepostStoryOptions' ? new Set(['story_id', 'chat_id']) : null);
  const found = extractGoMethodParams(masked, resolve).get('repostStory');
  assert.equal(found.found, true);
  assert.deepEqual([...found.keys].sort(), ['chat_id', 'story_id']);
});

test('python: keyword arguments and clean_payload both count', () => {
  const masked = py(`
    class Bot:
        async def send_poll(
            self,
            chat_id: int | str,
            question: str,
            options: Sequence[str],
            *,
            is_anonymous: bool | None = None,
            type: str | None = None,
        ) -> Message:
            """Send a poll.

            Args:
                not_a_param: docstring text only.
            """
            payload = clean_payload(
                chat_id=chat_id,
                question=question,
                options=list(options),
                is_anonymous=is_anonymous,
                explanation_parse_mode=explanation_parse_mode,
            )
            return await self._request("sendPoll", payload)
  `);
  const found = extractPythonMethodParams(masked).get('sendPoll');
  assert.equal(found.found, true);
  assert.deepEqual(
    [...found.keys].sort(),
    ['chat_id', 'explanation_parse_mode', 'is_anonymous', 'options', 'question', 'type'],
  );
});

test('python: a docstring attribute list is not mistaken for params', () => {
  const masked = py(`
    class Bot:
        async def get_me(self) -> User:
            """Get the bot.

            Attributes:
                id: Identifier.
                username: Handle.
            """
            return await self._request("getMe")
  `);
  const found = extractPythonMethodParams(masked).get('getMe');
  assert.deepEqual([...found.keys], []);
  assert.equal(found.partial, false);
});

test('python: **kwargs makes the param set unbounded and is flagged', () => {
  const masked = py(`
    class Bot:
        async def do_it(self, chat_id: int, **kwargs: Any) -> bool:
            return await self._request("doIt", chat_id=chat_id, **kwargs)
  `);
  const found = extractPythonMethodParams(masked).get('doIt');
  assert.equal(found.partial, true);
});

test('extractors ignore doc comments that quote a wire name', () => {
  const masked = ts(`
    export class Bot {
      /**
       * @remarks Telegram API: https://core.telegram.org/bots/api#sendphoto
       * Calls "sendPhoto" internally.
       */
      public async unused(note: string): Promise<true> {
        return true;
      }
    }
  `);
  const found = extractTypeScriptMethodParams(masked).get('unused');
  assert.equal(found.found, false);
});
