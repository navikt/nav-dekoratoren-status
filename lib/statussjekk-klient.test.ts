import { afterEach, expect, it, vi } from "vitest";
import { sjekkCsrIntegrasjoner } from "./statussjekk-klient";

afterEach(() => {
  vi.unstubAllGlobals();
});

it("uses the CSR module identity when checking /env", async () => {
  const fetchMock = vi.fn<typeof fetch>(async () => new Response(null, { status: 200 }));
  vi.stubGlobal("fetch", fetchMock);

  await sjekkCsrIntegrasjoner();

  const teamNames = fetchMock.mock.calls
    .map(([input]) => new URL(String(input)))
    .filter((url) => url.pathname.endsWith("/env"))
    .map((url) => url.searchParams.get("teamName"));
  expect(teamNames).toEqual(["nav-dekoratoren-status-csr.navno"]);
});
