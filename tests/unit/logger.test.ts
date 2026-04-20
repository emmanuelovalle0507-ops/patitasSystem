import { describe, it, expect, vi, beforeEach } from "vitest";
import { logger } from "@/lib/logger";

describe("logger", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("loggea error con stack serializado", () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    logger.error({ err: new Error("boom"), route: "/test" }, "fallo");
    expect(spy).toHaveBeenCalled();
    const out = spy.mock.calls[0].join(" ");
    expect(out).toContain("fallo");
  });

  it("loggea info sin lanzar sin contexto", () => {
    const spy = vi.spyOn(console, "log").mockImplementation(() => {});
    logger.info("hola");
    expect(spy).toHaveBeenCalled();
  });
});
