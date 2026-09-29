import { afterEach, describe, expect, it, vi } from "vitest";

describe("SSR uten moduler configuration", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
    vi.resetModules();
  });

  it("uses service discovery when running in Nais dev-gcp", async () => {
    vi.stubEnv("NAIS_CLUSTER_NAME", "dev-gcp");
    const { ssrUtenModulerUrl } = await import("./ssr-uten-moduler");
    expect(ssrUtenModulerUrl).toBe("http://nav-dekoratoren.personbruker/ssr");
  });

  it("uses service discovery when running in Nais prod-gcp", async () => {
    vi.stubEnv("DECORATOR_ENV", "prod");
    vi.stubEnv("NAIS_CLUSTER_NAME", "prod-gcp");
    const { ssrUtenModulerUrl } = await import("./ssr-uten-moduler");
    expect(ssrUtenModulerUrl).toBe("http://nav-dekoratoren.personbruker/ssr");
  });

  it("uses the public prod-ingress outside Nais when configured for prod", async () => {
    vi.stubEnv("DECORATOR_ENV", "prod");
    vi.stubEnv("NAIS_CLUSTER_NAME", "");
    const { ssrUtenModulerUrl } = await import("./ssr-uten-moduler");
    expect(ssrUtenModulerUrl).toBe("https://www.nav.no/dekoratoren/ssr");
  });

  it("uses the public dev-ingress outside Nais when configured for dev", async () => {
    vi.stubEnv("NAIS_CLUSTER_NAME", "");
    const { ssrUtenModulerUrl } = await import("./ssr-uten-moduler");
    expect(ssrUtenModulerUrl).toBe(
      "https://dekoratoren.ekstern.dev.nav.no/ssr",
    );
  });

  async function requestedUrl(teamName?: string) {
    if (teamName !== undefined)
      vi.stubEnv("SSR_UTEN_MODULER_TEAM_NAME", teamName);
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        headAssets: "",
        header: "",
        footer: "",
        scripts: "",
      }),
    });
    vi.stubGlobal("fetch", fetchMock);
    const { fetchSsrUtenModulerFragments } = await import("./ssr-uten-moduler");
    await fetchSsrUtenModulerFragments();
    expect(fetchMock).toHaveBeenCalledWith(expect.any(URL), {
      cache: "no-store",
    });
    return fetchMock.mock.calls[0][0] as URL;
  }

  it("sends nav-dekoratoren-status-ssr.navno by default on SSR uten moduler", async () => {
    const url = await requestedUrl();
    expect(url.searchParams.get("teamName")).toBe(
      "nav-dekoratoren-status-ssr.navno",
    );
    expect(url.searchParams.has("decoratorModulerVersion")).toBe(false);
  });

  it("sends an invalid teamName for the negative variant", async () => {
    const url = await requestedUrl("MittTeam");
    expect(url.searchParams.get("teamName")).toBe("MittTeam");
  });

  it("omits teamName for the missing-consumer variant", async () => {
    const url = await requestedUrl("");
    expect(url.searchParams.has("teamName")).toBe(false);
  });
});
