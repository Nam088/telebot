import { describe, it, expect, vi } from "vitest";
import { BaseBotClient } from "../../../src/client/methods/base.js";
import {
  computeBackoffSeconds,
  isRetryableStatus,
  DEFAULT_RETRY_OPTIONS,
} from "../../../src/client/retry.js";
import { TelegramApiError } from "../../../src/client/types.js";

class ConcreteBotClient extends BaseBotClient {}

describe("Auto-Retry & Flood Control Engine", () => {
  describe("Helper Functions", () => {
    it("computes default exponential backoff progression capped at maxDelaySeconds", () => {
      expect(computeBackoffSeconds(1)).toBe(1);
      expect(computeBackoffSeconds(2)).toBe(2);
      expect(computeBackoffSeconds(3)).toBe(4);
      expect(computeBackoffSeconds(4)).toBe(8);
      expect(computeBackoffSeconds(5)).toBe(16);
      expect(computeBackoffSeconds(6)).toBe(30); // Capped at default 30s
    });

    it("respects custom minDelaySeconds and maxDelaySeconds", () => {
      const opts = { minDelaySeconds: 5, maxDelaySeconds: 20 };
      expect(computeBackoffSeconds(1, opts)).toBe(5);
      expect(computeBackoffSeconds(2, opts)).toBe(10);
      expect(computeBackoffSeconds(3, opts)).toBe(20);
      expect(computeBackoffSeconds(4, opts)).toBe(20);
    });

    it("prioritizes Telegram parameters.retry_after over exponential backoff", () => {
      expect(computeBackoffSeconds(1, {}, 45)).toBe(45);
      expect(computeBackoffSeconds(2, { maxDelaySeconds: 10 }, 15)).toBe(15);
    });

    it("identifies retryable status codes correctly", () => {
      expect(isRetryableStatus(429)).toBe(true);
      expect(isRetryableStatus(500)).toBe(true);
      expect(isRetryableStatus(502)).toBe(true);
      expect(isRetryableStatus(503)).toBe(true);
      expect(isRetryableStatus(504)).toBe(true);
      expect(isRetryableStatus(400)).toBe(false);
      expect(isRetryableStatus(401)).toBe(false);
      expect(isRetryableStatus(404)).toBe(false);

      // Custom status array
      expect(isRetryableStatus(503, [503])).toBe(true);
      expect(isRetryableStatus(429, [503])).toBe(false);
    });
  });

  describe("BaseBotClient Auto-Retry Integration", () => {
    it("invokes onRetry hook with attempt, delayMs, and error on 429 response", async () => {
      const onRetry = vi.fn();
      let callCount = 0;

      const fakeFetch = vi.fn().mockImplementation(async () => {
        callCount++;
        if (callCount === 1) {
          return {
            status: 429,
            json: async () => ({
              ok: false,
              error_code: 429,
              description: "Flood control exceeded",
              parameters: { retry_after: 2 },
            }),
          };
        }
        return {
          status: 200,
          json: async () => ({ ok: true, result: { id: 999 } }),
        };
      });

      const client = new ConcreteBotClient("123:TOKEN", {
        fetch: fakeFetch,
        baseDelayMs: 5,
        retry: {
          maxRetryAttempts: 2,
          onRetry,
        },
      });

      const result = await client.request<{ id: number }>("getMe");
      expect(result).toEqual({ id: 999 });
      expect(callCount).toBe(2);
      expect(onRetry).toHaveBeenCalledTimes(1);
      expect(onRetry).toHaveBeenCalledWith(
        1,
        5, // baseDelayMs used in tests
        expect.any(TelegramApiError),
      );
    });

    it("invokes onRetry hook on 5xx server errors and retries until success", async () => {
      const onRetry = vi.fn();
      let callCount = 0;

      const fakeFetch = vi.fn().mockImplementation(async () => {
        callCount++;
        if (callCount < 3) {
          return {
            status: 503,
            statusText: "Service Unavailable",
            json: async () => ({ ok: false, error_code: 503 }),
          };
        }
        return {
          status: 200,
          json: async () => ({ ok: true, result: "success" }),
        };
      });

      const client = new ConcreteBotClient("123:TOKEN", {
        fetch: fakeFetch,
        baseDelayMs: 2,
        retry: {
          maxRetryAttempts: 3,
          onRetry,
        },
      });

      const result = await client.request<string>("sendMessage");
      expect(result).toBe("success");
      expect(callCount).toBe(3);
      expect(onRetry).toHaveBeenCalledTimes(2);
      expect(onRetry).toHaveBeenNthCalledWith(1, 1, 2, expect.any(TelegramApiError));
      expect(onRetry).toHaveBeenNthCalledWith(2, 2, 2, expect.any(TelegramApiError));
    });

    it("invokes onRetry and handles network fetch errors up to maxRetryAttempts", async () => {
      const onRetry = vi.fn();
      let callCount = 0;

      const fakeFetch = vi.fn().mockImplementation(async () => {
        callCount++;
        if (callCount === 1) {
          throw new Error("Network connection reset");
        }
        return {
          status: 200,
          json: async () => ({ ok: true, result: true }),
        };
      });

      const client = new ConcreteBotClient("123:TOKEN", {
        fetch: fakeFetch,
        baseDelayMs: 1,
        retry: {
          maxRetryAttempts: 2,
          onRetry,
        },
      });

      const res = await client.request<boolean>("getMe");
      expect(res).toBe(true);
      expect(callCount).toBe(2);
      expect(onRetry).toHaveBeenCalledWith(1, 1, expect.any(Error));
    });

    it("allows dynamic runtime reconfiguration via configureRetry", async () => {
      const client = new ConcreteBotClient("123:TOKEN", {
        baseDelayMs: 1,
        retry: { maxRetryAttempts: 1 },
      });

      expect(client.options.retry?.maxRetryAttempts).toBe(1);

      client.configureRetry({
        maxRetryAttempts: 5,
        minDelaySeconds: 2,
        maxDelaySeconds: 50,
      });

      expect(client.options.retry?.maxRetryAttempts).toBe(5);
      expect(client.options.retry?.minDelaySeconds).toBe(2);
      expect(client.options.retry?.maxDelaySeconds).toBe(50);
    });

    it("stops retrying and throws when maxRetryAttempts is exhausted", async () => {
      let callCount = 0;
      const fakeFetch = vi.fn().mockImplementation(async () => {
        callCount++;
        return {
          status: 500,
          statusText: "Internal Server Error",
          json: async () => ({ ok: false, error_code: 500 }),
        };
      });

      const client = new ConcreteBotClient("123:TOKEN", {
        fetch: fakeFetch,
        baseDelayMs: 1,
        retry: { maxRetryAttempts: 2 },
      });

      await expect(client.request("test")).rejects.toThrow(TelegramApiError);
      expect(callCount).toBe(3); // 1 initial attempt + 2 retries = 3
    });
  });
});
