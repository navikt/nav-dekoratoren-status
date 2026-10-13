import { createElement, isValidElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  addDecoratorUpdateListener,
  buildCspHeader,
  fetchDecoratorHtml,
  fetchDecoratorReact,
  getDecoratorVersionId,
} from "@navikt/nav-dekoratoren-moduler/ssr";
import { injectDecoratorClientSide } from "@navikt/nav-dekoratoren-moduler";

vi.mock("@navikt/nav-dekoratoren-moduler/ssr", () => ({
  fetchDecoratorReact: vi.fn(),
  fetchDecoratorHtml: vi.fn(),
  buildCspHeader: vi.fn(),
  getDecoratorVersionId: vi.fn(),
  addDecoratorUpdateListener: vi.fn(),
}));

vi.mock("@navikt/nav-dekoratoren-moduler", () => ({
  injectDecoratorClientSide: vi.fn(),
  getParams: vi.fn(async () => ({ simple: true })),
  setParams: vi.fn(),
}));

const localProps = { env: "localhost", localUrl: "http://localhost:8090" };

beforeEach(() => {
  vi.resetModules();
  vi.clearAllMocks();
  vi.stubEnv("NODE_ENV", "development");
  vi.stubEnv("LOCAL_DECORATOR_PORT", "8090");
  vi.stubGlobal(
    "fetch",
    vi.fn<typeof fetch>(async () =>
      Response.json({
        headAssets: "",
        header: "",
        footer: "",
        scripts: "",
      }),
    ),
  );
  vi.mocked(fetchDecoratorReact).mockResolvedValue({
    HeadAssets: () => null,
    Header: () => null,
    Footer: () => null,
    Scripts: () => null,
  });
});

afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
  vi.resetModules();
});

describe("local decorator consumers", () => {
  it("passes local props to the SSR page and health checks", async () => {
    const { default: page } = await import("../app/ssr-med-moduler/page");
    await page();
    const { sjekkSsrIntegrasjoner } = await import("./statussjekk");

    expect((await sjekkSsrIntegrasjoner()).map(({ status }) => status)).toEqual(
      ["ok", "ok"],
    );
    expect(fetchDecoratorReact).toHaveBeenCalledTimes(2);
    for (const [props] of vi.mocked(fetchDecoratorReact).mock.calls) {
      expect(props).toMatchObject(localProps);
    }
    const [input] = vi.mocked(fetch).mock.calls[0];
    expect(String(input)).toMatch(/^http:\/\/localhost:8090\/ssr\?/);
  });

  it("passes local props to parameter, CSP and version tests", async () => {
    vi.mocked(fetchDecoratorHtml).mockResolvedValue({
      DECORATOR_HEAD_ASSETS: "",
      DECORATOR_HEADER: "<header></header>",
      DECORATOR_FOOTER: "<footer></footer>",
      DECORATOR_SCRIPTS: "",
    });
    vi.mocked(buildCspHeader).mockResolvedValue(
      "default-src 'self'; connect-src nav-dekoratoren-status.dev.nav.no",
    );
    vi.mocked(getDecoratorVersionId).mockResolvedValue("local-version");
    const tests = await import("./parameter-sjekk-ssr");

    await tests.kjorSsrBreadcrumbTester();
    await tests.kjorSsrForenkletVisningTester();
    expect((await tests.kjorSsrCspTester())[0].somForventet).toBe(true);
    expect((await tests.kjorSsrDekoratorVersjonTester())[0].somForventet).toBe(
      true,
    );

    expect(fetchDecoratorReact).toHaveBeenCalled();
    expect(fetchDecoratorHtml).toHaveBeenCalled();
    for (const [props] of [
      ...vi.mocked(fetchDecoratorReact).mock.calls,
      ...vi.mocked(fetchDecoratorHtml).mock.calls,
    ]) {
      expect(props).toMatchObject(localProps);
    }
    expect(buildCspHeader).toHaveBeenCalledWith(expect.any(Object), localProps);
    expect(getDecoratorVersionId).toHaveBeenCalledWith(localProps);
  });

  it("passes local props to the update listener and version lookup", async () => {
    vi.stubGlobal("decoratorOppdateringsstatus", undefined);
    vi.stubGlobal("decoratorOppdateringslytterStartet", undefined);
    vi.mocked(getDecoratorVersionId).mockResolvedValue("local-version");
    const { startDekoratorOppdateringslytter } =
      await import("./decorator-oppdateringslytter");

    expect(await startDekoratorOppdateringslytter()).toMatchObject({
      lytterAktiv: true,
      gjeldendeVersjon: "local-version",
    });
    expect(getDecoratorVersionId).toHaveBeenCalledWith(localProps);
    expect(addDecoratorUpdateListener).toHaveBeenCalledWith(
      localProps,
      expect.any(Function),
    );
  });

  it("passes local props to a CSR parameter integration", async () => {
    vi.stubGlobal("window", { location: { hostname: "localhost" } });
    vi.stubGlobal("document", { querySelector: vi.fn(() => ({})) });
    const { CsrSimpleDekorator } =
      await import("../components/CsrSimpleDekorator");
    const element = CsrSimpleDekorator();
    if (
      !isValidElement<{ observe: () => Promise<void>; transport: string }>(
        element,
      )
    ) {
      throw new Error("Expected an integration page");
    }

    await element.props.observe();

    expect(element.props.transport).toBe("http://localhost:8090");
    expect(injectDecoratorClientSide).toHaveBeenCalledWith(
      expect.objectContaining({
        ...localProps,
        params: expect.objectContaining({ simple: true }),
      }),
    );
  });

  it("renders local CSS and environment URLs in the direct CSR shell", async () => {
    const { CsrUtenModulerDekorator } =
      await import("../components/CsrUtenModulerDekorator");

    const html = renderToStaticMarkup(createElement(CsrUtenModulerDekorator));

    expect(html).toContain('href="http://localhost:8090/css"');
    expect(html).toContain('data-src="http://localhost:8090/env?');
    expect(html).toContain("<dd>http://localhost:8090</dd>");
  });

  it("renders the existing SSR page failure states when localhost is unavailable", async () => {
    vi.mocked(fetchDecoratorReact).mockRejectedValue(
      new Error("Connection refused"),
    );
    vi.mocked(fetch).mockRejectedValue(new Error("Connection refused"));
    const { default: modulesPage } =
      await import("../app/ssr-med-moduler/page");
    const { default: directPage } =
      await import("../app/ssr-uten-moduler/page");

    for (const page of [modulesPage, directPage]) {
      const html = renderToStaticMarkup(await page());
      expect(html).toContain('data-status="error"');
      expect(html).toContain("<dd>http://localhost:8090</dd>");
      expect(html).toContain("Dekoratøren kunne ikke lastes");
    }
  });

  it("reports failures without falling back when the local decorator is unavailable", async () => {
    vi.mocked(fetchDecoratorReact).mockRejectedValue(
      new Error("Connection refused"),
    );
    vi.mocked(fetch).mockRejectedValue(new Error("Connection refused"));
    vi.stubGlobal("document", {
      createElement: () => ({
        remove: vi.fn(),
        onload: null,
        onerror: null,
      }),
      head: {
        appendChild: (preload: HTMLLinkElement) => {
          expect(preload.href).toBe("http://localhost:8090/client.js");
          queueMicrotask(() => {
            if (typeof preload.onerror === "function") {
              preload.onerror.call(preload, new Event("error"));
            }
          });
          return preload;
        },
      },
    });
    const { sjekkSsrIntegrasjoner } = await import("./statussjekk");
    const { sjekkCsrIntegrasjoner } = await import("./statussjekk-klient");

    const statuses = [
      ...(await sjekkSsrIntegrasjoner()),
      ...(await sjekkCsrIntegrasjoner()),
    ];
    expect(statuses.map(({ status }) => status)).toEqual([
      "feil",
      "feil",
      "feil",
      "feil",
    ]);
    expect(statuses[0].detalj).toContain("http://localhost:8090");
    expect(statuses[2].detalj).toContain("http://localhost:8090");
    expect(fetchDecoratorReact).toHaveBeenCalledTimes(1);
    expect(fetchDecoratorReact).toHaveBeenCalledWith(
      expect.objectContaining(localProps),
    );
    expect(fetch).toHaveBeenCalledTimes(2);
    for (const [input] of vi.mocked(fetch).mock.calls) {
      expect(new URL(String(input)).origin).toBe("http://localhost:8090");
    }
  });
});
