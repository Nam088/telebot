import { describe, it, expect } from "vitest";
import { buildRequestBody, InputFile } from "../../../src/utils/http.js";

describe("HTTP Utils Unit Tests", () => {
  it("serializes JSON payload when no binary files are provided", () => {
    const { body, headers } = buildRequestBody({ chat_id: 123, text: "hello" });
    expect(headers["Content-Type"]).toBe("application/json");
    expect(JSON.parse(body as string)).toEqual({ chat_id: 123, text: "hello" });
  });

  it("serializes multipart/form-data when InputFile is present", () => {
    const file: InputFile = { data: new Uint8Array([1, 2, 3]), filename: "test.txt" };
    const { body, headers } = buildRequestBody({ chat_id: 123, document: file });
    expect(headers).toBeUndefined();
    expect(body).toBeInstanceOf(FormData);
  });
});
