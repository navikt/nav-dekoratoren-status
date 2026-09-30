"use client";

import { useEffect, useState } from "react";
import {
  buildDirectCsrEnvironmentUrl,
  csrUtenModulerClientUrl,
} from "../lib/csr-uten-moduler";
import { getDirectDecoratorOrigin } from "../lib/decorator-config";
import { IntegrationPage } from "./IntegrationPage";

export function CsrUtenModulerDekorator() {
  const [origin, setOrigin] = useState<string>();

  useEffect(() => {
    setOrigin(window.location.origin);
    const header = document.createElement("div");
    header.id = "decorator-header";
    document.body.prepend(header);

    const footer = document.createElement("div");
    footer.id = "decorator-footer";
    document.body.append(footer);

    const script = document.createElement("script");
    script.src = csrUtenModulerClientUrl();
    script.async = true;
    script.onerror = () =>
      window.dispatchEvent(new Event("decorator-script-error"));
    document.body.appendChild(script);

    return () => {
      document.getElementById("decorator-header")?.remove();
      document.getElementById("decorator-footer")?.remove();
      script.remove();
    };
  }, []);

  return (
    <>
      <link
        rel="stylesheet"
        href={`${getDirectDecoratorOrigin()}/css`}
      />
      <div id="decorator-env" data-src={buildDirectCsrEnvironmentUrl()} />
      <IntegrationPage
        title="CSR uten moduler"
        description="Dekoratøren er satt inn manuelt med CSS, env og client.js."
        integrationVariant="csr-uten-moduler"
        rendering="klient/HTML-shell"
        transport="offentlig dev-ingress"
        origin={origin}
        initialStatus="initializing"
        observe={async () => waitForDecorator()}
      >
        <p data-testid="app-content">CSR uten moduler er initialisert.</p>
      </IntegrationPage>
    </>
  );
}

async function waitForDecorator() {
  const deadline = Date.now() + 10_000;
  while (Date.now() < deadline) {
    if (document.querySelector("header") && document.querySelector("footer")) {
      return;
    }
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
  throw new Error("DIRECT_CSR_TIMEOUT");
}
