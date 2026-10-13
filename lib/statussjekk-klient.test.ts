import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { sjekkCsrIntegrasjoner } from "./statussjekk-klient";
import { csrUtenModulerClientUrl } from "./csr-uten-moduler";

let preload: {
  rel: string;
  as: string;
  href: string;
  crossOrigin: string | null;
  onload: (() => void) | null;
  onerror: (() => void) | null;
  remove: () => void;
};
let appendChild: ReturnType<typeof vi.fn>;
let remove: ReturnType<typeof vi.fn<() => void>>;

beforeEach(() => {
  remove = vi.fn();
  preload = {
    rel: "",
    as: "",
    href: "",
    crossOrigin: null,
    remove,
    onload: null,
    onerror: null,
  };
  appendChild = vi.fn(() => {
    queueMicrotask(() => preload.onload?.());
    return preload;
  });
  vi.stubGlobal("document", {
    createElement: vi.fn(() => preload),
    head: { appendChild },
  });
  vi.stubGlobal(
    "fetch",
    vi.fn<typeof fetch>(async () => new Response(null, { status: 200 })),
  );
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.useRealTimers();
});

it("uses the CSR module identity when checking /env", async () => {
  await sjekkCsrIntegrasjoner();

  const teamNames = vi
    .mocked(fetch)
    .mock.calls.map(([input]) => new URL(String(input)))
    .filter((url) => url.pathname.endsWith("/env"))
    .map((url) => url.searchParams.get("teamName"));
  expect(teamNames).toEqual(["nav-dekoratoren-status-csr.navno"]);
});

it("checks client.js as a classic script resource without fetching or executing it", async () => {
  vi.mocked(fetch).mockImplementation(async (input) => {
    if (String(input).endsWith("/client.js")) {
      throw new TypeError("CORS blocked");
    }
    return new Response(null, { status: 200 });
  });

  const statuses = await sjekkCsrIntegrasjoner();

  expect(statuses.map(({ status }) => status)).toEqual(["ok", "ok"]);
  expect(document.createElement).toHaveBeenCalledWith("link");
  expect(preload.rel).toBe("preload");
  expect(preload.as).toBe("script");
  expect(preload.href).toBe(csrUtenModulerClientUrl());
  expect(preload.crossOrigin).toBeNull();
  expect(appendChild).toHaveBeenCalledWith(preload);
  expect(fetch).toHaveBeenCalledTimes(1);
  expect(remove).toHaveBeenCalledOnce();
  expect(preload.onload).toBeNull();
  expect(preload.onerror).toBeNull();
});

it("reports a failed script load and removes the preload", async () => {
  appendChild.mockImplementation(() => {
    queueMicrotask(() => {
      if (typeof preload.onerror === "function") {
        preload.onerror();
      }
    });
    return preload;
  });

  const statuses = await sjekkCsrIntegrasjoner();

  expect(statuses[1]).toMatchObject({
    status: "feil",
    path: "csr-uten-moduler",
  });
  expect(statuses[1].detalj).toContain("client.js");
  expect(remove).toHaveBeenCalledOnce();
});

it("reports a script load timeout and cleans up event handlers", async () => {
  vi.useFakeTimers();
  appendChild.mockImplementation(() => preload);
  const pending = sjekkCsrIntegrasjoner();

  await vi.advanceTimersByTimeAsync(10_000);
  const statuses = await pending;

  expect(statuses[1].status).toBe("feil");
  expect(remove).toHaveBeenCalledOnce();
  expect(preload.onload).toBeNull();
  expect(preload.onerror).toBeNull();
});
