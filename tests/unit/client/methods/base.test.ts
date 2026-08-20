import { describe, it, expect, vi } from "vitest";
import { BaseBotClient } from "../../../../src/client/methods/base.js";
import { TelegramApiError } from "../../../../src/client/types.js";

class ConcreteBotClient extends BaseBotClient {}

describe("BaseBotClient Core HTTP Engine", () => {
  it("throws TypeError on empty token", () => {
    expect(() => new ConcreteBotClient("")).toThrow(TypeError);
    expect(() => new ConcreteBotClient("   ")).toThrow(TypeError);
  });

  it("successfully parses result when response.ok is true", async () => {
    const fakeFetch = vi.fn().mockResolvedValue({
      status: 200,
      json: async () => ({ ok: true, result: { id: 123 } }),
    });
    const client = new ConcreteBotClient("TEST_TOKEN", { fetch: fakeFetch });
    const res = await client.request<{ id: number }>("getMe");
    expect(res).toEqual({ id: 123 });
  });

  it("throws TelegramApiError on 4xx error", async () => {
    const fakeFetch = vi.fn().mockResolvedValue({
      status: 400,
      json: async () => ({ ok: false, error_code: 400, description: "Bad Request" }),
    });
    const client = new ConcreteBotClient("TEST_TOKEN", { fetch: fakeFetch });
    await expect(client.request("sendMessage")).rejects.toThrow(TelegramApiError);
  });

  it("retries on 429 rate limit honoring retry_after", async () => {
    let callCount = 0;
    const fakeFetch = vi.fn().mockImplementation(async () => {
      callCount++;
      if (callCount === 1) {
        return {
          status: 429,
          json: async () => ({
            ok: false,
            error_code: 429,
            description: "Too Many Requests",
            parameters: { retry_after: 0.01 },
          }),
        };
      }
      return {
        status: 200,
        json: async () => ({ ok: true, result: true }),
      };
    });

    const client = new ConcreteBotClient("TEST_TOKEN", { fetch: fakeFetch, baseDelayMs: 1 });
    const res = await client.request<boolean>("test");
    expect(res).toBe(true);
    expect(callCount).toBe(2);
  });

  it("retries on 5xx server errors and throws after 4 attempts", async () => {
    let callCount = 0;
    const fakeFetch = vi.fn().mockImplementation(async () => {
      callCount++;
      return {
        status: 502,
        statusText: "Bad Gateway",
        json: async () => ({ ok: false, error_code: 502 }),
      };
    });

    const client = new ConcreteBotClient("TEST_TOKEN", { fetch: fakeFetch, baseDelayMs: 1 });
    await expect(client.request("test")).rejects.toThrow(TelegramApiError);
    expect(callCount).toBe(4);
  });

  it("redacts the bot token from error messages when the underlying fetch throws", async () => {
    const token = "123456:ABC-DEF1234ghIkl-zyx57W2v1u123ew11";
    const fakeFetch = vi
      .fn()
      .mockRejectedValue(new Error(`request to https://api.telegram.org/bot${token}/getMe failed`));
    const client = new ConcreteBotClient(token, { fetch: fakeFetch, baseDelayMs: 1 });

    let caught: unknown;
    try {
      await client.request("getMe");
    } catch (err) {
      caught = err;
    }

    expect(caught).toBeInstanceOf(TelegramApiError);
    expect((caught as TelegramApiError).message).not.toContain(token);
  });
});
