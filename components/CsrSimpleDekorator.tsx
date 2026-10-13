"use client";

import {
  getParams,
  injectDecoratorClientSide,
  setParams,
} from "@navikt/nav-dekoratoren-moduler";
import { decoratorParams } from "../lib/decorator-params";
import {
  csrDecoratorTransport,
  getDecoratorEnvProps,
} from "../lib/decorator-config";
import { IntegrationPage } from "./IntegrationPage";

export function CsrSimpleDekorator() {
  return (
    <IntegrationPage
      title="simple: true"
      description="Dekoratøren initialiseres i nettleseren med simple: true."
      integrationVariant="csr-med-moduler"
      rendering="klient"
      transport={csrDecoratorTransport}
      backHref="/parametre"
      backLabel="Tilbake"
      initialStatus="initializing"
      observe={async () => {
        await injectDecoratorClientSide({
          ...getDecoratorEnvProps(),
          params: { ...decoratorParams, simple: true },
        });
        await ventPaDekoratoren();
        await setParams({ simple: true });
        await ventPaSimpleParameter();
      }}
    >
      <p data-testid="simple-parameter">simple: true</p>
    </IntegrationPage>
  );
}

async function ventPaSimpleParameter() {
  const deadline = Date.now() + 10_000;
  while (Date.now() < deadline) {
    const params = await getParams();
    if (params?.simple === true) {
      return;
    }
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
  throw new Error("CSR_SIMPLE_PARAMETER_NOT_SET");
}

async function ventPaDekoratoren() {
  const deadline = Date.now() + 10_000;
  while (Date.now() < deadline) {
    if (document.querySelector("header")) {
      return;
    }
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
  throw new Error("CSR_SIMPLE_TIMEOUT");
}
