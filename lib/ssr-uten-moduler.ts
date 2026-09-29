import { decoratorParams } from "./decorator-params";
import { ssrUtenModulerUrl } from "./decorator-config";

export { ssrUtenModulerUrl };

export const ssrUtenModulerTeamName =
  process.env.SSR_UTEN_MODULER_TEAM_NAME ?? "nav-dekoratoren-status.navno";

export type SsrUtenModulerFragments = {
  DECORATOR_HEAD_ASSETS: string;
  DECORATOR_HEADER: string;
  DECORATOR_FOOTER: string;
  DECORATOR_SCRIPTS: string;
};

type RawSsrResponse = {
  headAssets: string;
  header: string;
  footer: string;
  scripts: string;
  versionId?: string;
};

function isRawSsrResponse(value: unknown): value is RawSsrResponse {
  if (!value || typeof value !== "object") return false;
  return ["headAssets", "header", "footer", "scripts"].every(
    (key) => typeof (value as Record<string, unknown>)[key] === "string",
  );
}

export async function fetchSsrUtenModulerFragments(): Promise<SsrUtenModulerFragments> {
  const url = new URL(ssrUtenModulerUrl);
  Object.entries(decoratorParams).forEach(([key, value]) =>
    url.searchParams.set(key, value),
  );
  if (ssrUtenModulerTeamName)
    url.searchParams.set("teamName", ssrUtenModulerTeamName);
  const response = await fetch(url, { cache: "no-store" });
  if (!response.ok) throw new Error(`DIRECT_SSR_HTTP_${response.status}`);
  const payload: unknown = await response.json();
  if (!isRawSsrResponse(payload))
    throw new Error("DIRECT_SSR_INVALID_RESPONSE");
  return {
    DECORATOR_HEAD_ASSETS: payload.headAssets,
    DECORATOR_HEADER: payload.header,
    DECORATOR_FOOTER: payload.footer,
    DECORATOR_SCRIPTS: payload.scripts,
  };
}
