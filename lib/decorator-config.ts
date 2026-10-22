import type { DecoratorEnvProps } from "@navikt/nav-dekoratoren-moduler";

export type DecoratorEnvironment = "dev" | "prod" | "localhost";

export const isLocalDecorator = process.env.NODE_ENV === "development";
const localDecoratorOrigin = `http://localhost:${process.env.LOCAL_DECORATOR_PORT ?? 8089}`;

export const decoratorEnvironment: DecoratorEnvironment = isLocalDecorator
  ? "localhost"
  : process.env.DECORATOR_ENV === "prod"
    ? "prod"
    : "dev";

export function getDecoratorEnvironment(
  hostname = typeof window === "undefined"
    ? undefined
    : window.location.hostname,
): DecoratorEnvironment {
  if (isLocalDecorator) {
    return "localhost";
  }

  if (!hostname) {
    return decoratorEnvironment;
  }

  return hostname.endsWith(".ansatt.nav.no") ? "prod" : "dev";
}

export function getDecoratorEnvProps(): DecoratorEnvProps {
  const env = getDecoratorEnvironment();
  return env === "localhost"
    ? { env, localUrl: localDecoratorOrigin }
    : { env };
}

export const decoratorEnvProps = getDecoratorEnvProps();

export function getDirectDecoratorOrigin() {
  if (isLocalDecorator) {
    return localDecoratorOrigin;
  }

  return getDecoratorEnvironment() === "prod"
    ? "https://www.nav.no/dekoratoren"
    : "https://dekoratoren-proxy.ekstern.dev.nav.no";
}

export const directDecoratorOrigin = getDirectDecoratorOrigin();

const kjorerINais =
  !isLocalDecorator &&
  process.env.NAIS_CLUSTER_NAME === `${decoratorEnvironment}-gcp`;

export const ssrDecoratorTransport = isLocalDecorator
  ? localDecoratorOrigin
  : "service discovery";

export const csrDecoratorTransport = isLocalDecorator
  ? localDecoratorOrigin
  : "offentlig dev-ingress";

export const ssrUtenModulerUrl = kjorerINais
  ? "http://nav-dekoratoren-proxy.personbruker/ssr"
  : `${directDecoratorOrigin}/ssr`;

export function buildPublicDecoratorUrl(
  path: string,
  params: Record<string, string>,
) {
  const url = new URL(path.replace(/^\//, ""), `${directDecoratorOrigin}/`);
  Object.entries(params).forEach(([key, value]) =>
    url.searchParams.set(key, value),
  );
  return url.toString();
}
