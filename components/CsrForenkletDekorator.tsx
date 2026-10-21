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

type Parameter = "simpleHeader" | "simpleFooter";

type Props = {
  parameter: Parameter;
};

const parameterDetails: Record<
  Parameter,
  {
    description: string;
    expectedElement: "header" | "footer";
  }
> = {
  simpleHeader: {
    description:
      "Dekoratøren initialiseres i nettleseren med simpleHeader: true.",
    expectedElement: "header",
  },
  simpleFooter: {
    description:
      "Dekoratøren initialiseres i nettleseren med simpleFooter: true.",
    expectedElement: "footer",
  },
};

export function CsrForenkletDekorator({ parameter }: Props) {
  const details = parameterDetails[parameter];

  return (
    <IntegrationPage
      title={`${parameter}: true`}
      description={details.description}
      integrationVariant="csr-med-moduler"
      rendering="klient"
      transport={csrDecoratorTransport}
      backHref="/parametre"
      backLabel="Tilbake"
      initialStatus="initializing"
      observe={async () => {
        await injectDecoratorClientSide({
          ...getDecoratorEnvProps(),
          params: { ...decoratorParams, [parameter]: true },
        });
        await setParams({
          simple: false,
          simpleHeader: parameter === "simpleHeader",
          simpleFooter: parameter === "simpleFooter",
        });
        await ventPaParameter(parameter);
        await ventPaDekoratoren(details.expectedElement);
      }}
    >
      <p data-testid={`${parameter}-parameter`}>{`${parameter}: true`}</p>
    </IntegrationPage>
  );
}

async function ventPaParameter(parameter: Parameter) {
  const deadline = Date.now() + 10_000;
  while (Date.now() < deadline) {
    const params = await getParams();
    if (params?.[parameter] === true) return;
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
  throw new Error(`CSR_${parameter.toUpperCase()}_PARAMETER_NOT_SET`);
}

async function ventPaDekoratoren(element: "header" | "footer") {
  const deadline = Date.now() + 10_000;
  while (Date.now() < deadline) {
    if (document.querySelector(element)) return;
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
  throw new Error(`CSR_SIMPLE_${element.toUpperCase()}_TIMEOUT`);
}
