import type { NextConfig } from "next";

const isDevelopment = process.env.NODE_ENV === "development";
const localDecoratorPort = process.env.LOCAL_DECORATOR_PORT ?? "8089";

if (
  isDevelopment &&
  (!/^\d+$/.test(localDecoratorPort) ||
    Number(localDecoratorPort) < 1 ||
    Number(localDecoratorPort) > 65535)
) {
  throw new Error(
    "LOCAL_DECORATOR_PORT must be an integer between 1 and 65535",
  );
}

const nextConfig: NextConfig = {
  output: "standalone",
  distDir: isDevelopment ? ".next-dev" : ".next",
  env: isDevelopment ? { LOCAL_DECORATOR_PORT: localDecoratorPort } : {},
};

export default nextConfig;
