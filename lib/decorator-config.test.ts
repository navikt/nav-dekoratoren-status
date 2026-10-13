import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

beforeEach(() => {
  vi.resetModules();
  vi.stubEnv("NODE_ENV", "development");
  vi.stubEnv("LOCAL_DECORATOR_PORT", "8090");
});

afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
  vi.resetModules();
});

describe("local decorator configuration", () => {
  it("defaults to port 8089 when no local port is configured", async () => {
    vi.stubEnv("LOCAL_DECORATOR_PORT", undefined);
    const config = await import("./decorator-config");
    expect(config.getDirectDecoratorOrigin()).toBe("http://localhost:8089");
    expect(config.decoratorEnvProps).toEqual({
      env: "localhost",
      localUrl: "http://localhost:8089",
    });
  });

  it("selects localhost on the server even with prod configuration and Nais variables", async () => {
    vi.stubEnv("DECORATOR_ENV", "prod");
    vi.stubEnv("NAIS_CLUSTER_NAME", "prod-gcp");
    const config = await import("./decorator-config");

    expect(config.decoratorEnvironment).toBe("localhost");
    expect(config.getDecoratorEnvironment()).toBe("localhost");
    expect(config.decoratorEnvProps).toEqual({
      env: "localhost",
      localUrl: "http://localhost:8090",
    });
    expect(config.directDecoratorOrigin).toBe("http://localhost:8090");
    expect(config.ssrUtenModulerUrl).toBe("http://localhost:8090/ssr");
    expect(config.ssrDecoratorTransport).toBe("http://localhost:8090");
    expect(config.csrDecoratorTransport).toBe("http://localhost:8090");
  });

  describe("Next.js local port configuration", () => {
    it("exposes the configured port to browser bundles", async () => {
      const { default: config } = await import("../next.config");
      expect(config.env).toEqual({ LOCAL_DECORATOR_PORT: "8090" });
    });

    it("exposes the default port when unset", async () => {
      vi.stubEnv("LOCAL_DECORATOR_PORT", undefined);
      const { default: config } = await import("../next.config");
      expect(config.env).toEqual({ LOCAL_DECORATOR_PORT: "8089" });
    });

    it.each(["", "abc", "8089/path", "1.5", "0", "-1", "65536"])(
      "rejects invalid development port %s",
      async (port) => {
        vi.stubEnv("LOCAL_DECORATOR_PORT", port);
        await expect(import("../next.config")).rejects.toThrow(
          "LOCAL_DECORATOR_PORT must be an integer between 1 and 65535",
        );
      },
    );

    it("does not expose or use the local port in production builds", async () => {
      vi.stubEnv("NODE_ENV", "production");
      vi.stubEnv("LOCAL_DECORATOR_PORT", "invalid");
      const { default: config } = await import("../next.config");
      expect(config.env).toEqual({});
      expect(config.distDir).toBe(".next");
    });
  });

  it("selects localhost in browser code before hostname-based routing", async () => {
    vi.stubGlobal("window", {
      location: { hostname: "nav-dekoratoren-status.ansatt.nav.no" },
    });
    const config = await import("./decorator-config");

    expect(config.getDecoratorEnvironment()).toBe("localhost");
    expect(config.getDecoratorEnvProps()).toEqual({
      env: "localhost",
      localUrl: "http://localhost:8090",
    });
    expect(config.getDirectDecoratorOrigin()).toBe("http://localhost:8090");
  });

  it("builds local asset and environment URLs with encoded parameters", async () => {
    const config = await import("./decorator-config");
    const csr = await import("./csr-uten-moduler");

    expect(csr.csrUtenModulerClientUrl()).toBe(
      "http://localhost:8090/client.js",
    );
    expect(`${config.getDirectDecoratorOrigin()}/css`).toBe(
      "http://localhost:8090/css",
    );
    expect(config.buildPublicDecoratorUrl("/env", { label: "a & b/æ" })).toBe(
      "http://localhost:8090/env?label=a+%26+b%2F%C3%A6",
    );
    const environmentUrl = new URL(csr.buildDirectCsrEnvironmentUrl());
    expect(environmentUrl.origin).toBe("http://localhost:8090");
    expect(environmentUrl.pathname).toBe("/env");
    expect(environmentUrl.searchParams.get("origin")).toBe(
      "nav-dekoratoren-status",
    );
  });
});

describe("production builds", () => {
  beforeEach(() => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("NAIS_CLUSTER_NAME", "");
    vi.stubEnv("DECORATOR_ENV", "dev");
  });

  it("keeps the shared dev decorator when serving a production build locally", async () => {
    vi.stubGlobal("window", { location: { hostname: "localhost" } });
    const config = await import("./decorator-config");

    expect(config.isLocalDecorator).toBe(false);
    expect(config.getDecoratorEnvProps()).toEqual({ env: "dev" });
    expect(config.directDecoratorOrigin).toBe(
      "https://dekoratoren.ekstern.dev.nav.no",
    );
    expect(config.ssrUtenModulerUrl).toBe(
      "https://dekoratoren.ekstern.dev.nav.no/ssr",
    );
  });

  it("keeps server-side prod selection and its path prefix", async () => {
    vi.stubEnv("DECORATOR_ENV", "prod");
    const config = await import("./decorator-config");

    expect(config.decoratorEnvProps).toEqual({ env: "prod" });
    expect(config.buildPublicDecoratorUrl("/env", {})).toBe(
      "https://www.nav.no/dekoratoren/env",
    );
  });

  it.each([
    ["nav-dekoratoren-status.ansatt.dev.nav.no", "dev"],
    ["nav-dekoratoren-status.ansatt.nav.no", "prod"],
  ])("keeps browser hostname selection for %s", async (hostname, env) => {
    vi.stubGlobal("window", { location: { hostname } });
    const config = await import("./decorator-config");

    expect(config.getDecoratorEnvProps()).toEqual({ env });
    expect(config.getDirectDecoratorOrigin()).toBe(
      env === "prod"
        ? "https://www.nav.no/dekoratoren"
        : "https://dekoratoren.ekstern.dev.nav.no",
    );
  });
});
