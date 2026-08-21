import * as crypto from "node:crypto";
import { describe, it, expect } from "vitest";
import {
  assertNonEmptyString,
  assertNumber,
  validateToken,
  validateWebAppData,
  parseWebAppData,
} from "../../../src/utils/validation.js";

describe("Validation Utils Unit Tests", () => {
  it("assertNonEmptyString validates string content", () => {
    expect(() => assertNonEmptyString("valid", "param")).not.toThrow();
    expect(() => assertNonEmptyString("", "param")).toThrow(TypeError);
    expect(() => assertNonEmptyString("   ", "param")).toThrow(TypeError);
    expect(() => assertNonEmptyString(123, "param")).toThrow(TypeError);
  });

  it("assertNumber validates number values", () => {
    expect(() => assertNumber(123, "param")).not.toThrow();
    expect(() => assertNumber(NaN, "param")).toThrow(TypeError);
    expect(() => assertNumber("123", "param")).toThrow(TypeError);
  });

  it("validateToken validates token format", () => {
    expect(() => validateToken("123456:ABC-DEF1234ghIkl-zyx57W2v1u123ew11")).not.toThrow();
    expect(() => validateToken("TEST_TOKEN")).not.toThrow();
    expect(() => validateToken("")).toThrow(TypeError);
  });

  it("validateToken rejects a non-empty string that does not match the bot token format", () => {
    expect(() => validateToken("not-a-real-token")).toThrow(TypeError);
    expect(() => validateToken("123456")).toThrow(TypeError);
  });

  describe("Telegram WebApp validation & parsing", () => {
    const botToken = "123456:ABC-DEF1234ghIkl-zyx57W2v1u123ew11";

    function generateValidInitData(params: Record<string, string>, token: string): string {
      const entries: string[] = [];
      for (const [key, val] of Object.entries(params)) {
        if (key !== "hash") {
          entries.push(`${key}=${val}`);
        }
      }
      entries.sort();
      const checkString = entries.join("\n");
      const secretKey = crypto.createHmac("sha256", "WebAppData").update(token).digest();
      const hash = crypto.createHmac("sha256", secretKey).update(checkString).digest("hex");

      const usp = new URLSearchParams(params);
      usp.set("hash", hash);
      return usp.toString();
    }

    it("validates authentic Telegram WebApp initData", () => {
      const now = Math.floor(Date.now() / 1000);
      const user = JSON.stringify({ id: 1234567, first_name: "Alice", username: "alice" });
      const initData = generateValidInitData(
        {
          query_id: "AAHdF6IQAAAAAN0XohDhrOrc",
          user,
          auth_date: String(now),
        },
        botToken,
      );

      expect(validateWebAppData(initData, botToken)).toBe(true);
    });

    it("rejects tampered WebApp initData", () => {
      const now = Math.floor(Date.now() / 1000);
      const user = JSON.stringify({ id: 1234567, first_name: "Alice" });
      const initData = generateValidInitData(
        {
          query_id: "AAHdF6IQAAAAAN0XohDhrOrc",
          user,
          auth_date: String(now),
        },
        botToken,
      );

      // Tamper user id
      const tampered = initData.replace("1234567", "9999999");
      expect(validateWebAppData(tampered, botToken)).toBe(false);
    });

    it("rejects expired WebApp initData", () => {
      const oldTime = Math.floor(Date.now() / 1000) - 100000; // > 24 hours ago
      const initData = generateValidInitData(
        {
          query_id: "AAHdF6IQAAAAAN0XohDhrOrc",
          auth_date: String(oldTime),
        },
        botToken,
      );

      expect(validateWebAppData(initData, botToken, { maxAgeSeconds: 86400 })).toBe(false);
    });

    it("handles missing parameters and invalid formatting gracefully", () => {
      expect(validateWebAppData("", botToken)).toBe(false);
      expect(validateWebAppData("invalid_query", "")).toBe(false);
      expect(validateWebAppData("auth_date=123", botToken)).toBe(false);
      expect(validateWebAppData("hash=abc", botToken)).toBe(false);
      expect(validateWebAppData("auth_date=invalid&hash=abc", botToken)).toBe(false);
    });

    it("parses WebApp initData correctly into structured object", () => {
      const now = Math.floor(Date.now() / 1000);
      const userObj = { id: 42, first_name: "Bob", username: "bob_dev" };
      const chatObj = { id: -100123, type: "supergroup", title: "Dev Group" };
      const initData = generateValidInitData(
        {
          query_id: "query123",
          user: JSON.stringify(userObj),
          chat: JSON.stringify(chatObj),
          chat_type: "supergroup",
          chat_instance: "inst99",
          start_param: "ref_123",
          can_send_after: "300",
          auth_date: String(now),
        },
        botToken,
      );

      const parsed = parseWebAppData(initData);
      expect(parsed.query_id).toBe("query123");
      expect(parsed.user?.id).toBe(42);
      expect(parsed.user?.first_name).toBe("Bob");
      expect(parsed.chat?.title).toBe("Dev Group");
      expect(parsed.chat_type).toBe("supergroup");
      expect(parsed.chat_instance).toBe("inst99");
      expect(parsed.start_param).toBe("ref_123");
      expect(parsed.can_send_after).toBe(300);
      expect(parsed.auth_date).toBe(now);
      expect(parsed.hash).toBeDefined();
    });
  });
});

