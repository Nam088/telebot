import { describe, it, expect } from "vitest";
import {
  assertNonEmptyString,
  assertNumber,
  validateToken,
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
});
