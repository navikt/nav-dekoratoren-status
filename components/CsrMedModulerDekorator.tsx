"use client";

import { injectDecoratorClientSide } from "@navikt/nav-dekoratoren-moduler";
import { useEffect } from "react";
import { IntegrationPage } from "./IntegrationPage";
import {
  csrMedModulerTeamName,
  decoratorParams,
} from "../lib/decorator-params";
import { getDecoratorEnvironment } from "../lib/decorator-config";

export function CsrMedModulerDekorator() {
  useEffect(() => {
    injectDecoratorClientSide({
      env: getDecoratorEnvironment(),
      params: { ...decoratorParams, teamName: csrMedModulerTeamName },
    });
    return () => {
      document.getElementById("decorator-header")?.remove();
      document.getElementById("decorator-footer")?.remove();
      document.getElementById("decorator-env")?.remove();
      document
        .querySelectorAll('script[src*="/client.js"]')
        .forEach((el) => el.remove());
      document
        .querySelectorAll('link[href*="/css/client.css"]')
        .forEach((el) => el.remove());
    };
  }, []);

  return (
    <IntegrationPage
      title="CSR med moduler"
      description="Dekoratøren er initialisert i nettleseren med modulpakken."
      integrationVariant="csr-med-moduler"
      rendering="klient"
      transport="offentlig dev-ingress"
      teamName={csrMedModulerTeamName}
      initialStatus="initializing"
      observe={async () => {
        await waitForDecorator();
      }}
    >
      <p data-testid="app-content">CSR med moduler er initialisert.</p>
    </IntegrationPage>
  );
}

async function waitForDecorator() {
  const deadline = Date.now() + 10_000;
  while (Date.now() < deadline) {
    if (document.querySelector("header") && document.querySelector("footer"))
      return;
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
  throw new Error("CSR_MODULES_TIMEOUT");
}
