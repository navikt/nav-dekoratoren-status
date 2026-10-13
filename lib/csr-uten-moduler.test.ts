import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

describe("CSR uten moduler URL", () => {
  beforeEach(() => {
    vi.stubEnv("NODE_ENV", "production");
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.resetModules();
  });

  it("includes encoded parameters but no teamName (Origin-header identifiserer automatisk)", async () => {
    const { buildDirectCsrEnvironmentUrl } = await import("./csr-uten-moduler");
    const url = new URL(buildDirectCsrEnvironmentUrl());
    expect(url.searchParams.get("teamName")).toBeNull();
    expect(url.searchParams.get("context")).toBe("privatperson");
    expect(url.searchParams.get("origin")).toBe("nav-dekoratoren-status");
  });

  it("preserves the Dekoratøren path prefix in prod", async () => {
    vi.stubEnv("DECORATOR_ENV", "prod");
    const { buildDirectCsrEnvironmentUrl } = await import("./csr-uten-moduler");
    expect(buildDirectCsrEnvironmentUrl()).toContain(
      "https://www.nav.no/dekoratoren/env?",
    );
  });

  it("uses the production Dekoratøren environment on the prod ansatt ingress", async () => {
    const { getDecoratorEnvironment } = await import("./decorator-config");
    expect(
      getDecoratorEnvironment("nav-dekoratoren-status.ansatt.nav.no"),
    ).toBe("prod");
  });
});
