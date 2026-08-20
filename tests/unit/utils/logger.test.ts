import { describe, it, expect, vi } from "vitest";
import { Logger } from "../../../src/utils/logger.js";

describe("Logger Unit Tests", () => {
  it("logs at info level by default and honors log level filtering", () => {
    const debugSpy = vi.spyOn(console, "debug").mockImplementation(() => {});
    const infoSpy = vi.spyOn(console, "info").mockImplementation(() => {});
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    const log = new Logger({ level: "info" });
    log.debug("Debug msg");
    log.info("Info msg");
    log.warn("Warn msg");
    log.error("Error msg");

    expect(debugSpy).not.toHaveBeenCalled();
    expect(infoSpy).toHaveBeenCalled();
    expect(warnSpy).toHaveBeenCalled();
    expect(errorSpy).toHaveBeenCalled();

    debugSpy.mockRestore();
    infoSpy.mockRestore();
    warnSpy.mockRestore();
    errorSpy.mockRestore();
  });

  it("suppresses logs when level is silent", () => {
    const infoSpy = vi.spyOn(console, "info").mockImplementation(() => {});
    const log = new Logger({ level: "silent" });
    log.info("Hidden message");
    expect(infoSpy).not.toHaveBeenCalled();
    infoSpy.mockRestore();
  });
});
