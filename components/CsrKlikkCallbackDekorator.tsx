"use client";

import {
  injectDecoratorClientSide,
  onBreadcrumbClick,
  onLanguageSelect,
  type DecoratorFetchProps,
} from "@navikt/nav-dekoratoren-moduler";
import { decoratorParams } from "../lib/decorator-params";
import {
  csrDecoratorTransport,
  getDecoratorEnvProps,
} from "../lib/decorator-config";
import { IntegrationPage } from "./IntegrationPage";

const testBreadcrumb = {
  title: "Klikk-callback-test",
  url: "https://www.nav.no/person/kontakt-oss",
  handleInApp: true as const,
};

const testSpraak = {
  locale: "en" as const,
  url: "https://www.nav.no/en",
  handleInApp: true as const,
};

export function CsrKlikkCallbackDekorator() {
  return (
    <IntegrationPage
      title="onBreadcrumbClick / onLanguageSelect"
      description="Dekoratøren varsler appen via postMessage når en breadcrumb eller et språkvalg med handleInApp=true klikkes. Denne testen simulerer Dekoratørens egen postMessage-kontrakt for å verifisere at appens callback-registrering fungerer, uten at det krever et faktisk museklikk i den rendrede headeren/footeren."
      integrationVariant="csr-med-moduler"
      rendering="klient"
      transport={csrDecoratorTransport}
      backHref="/parametre"
      backLabel="Tilbake"
      initialStatus="initializing"
      observe={async () => {
        await injectDecoratorClientSide({
          ...getDecoratorEnvProps(),
          params: {
            ...decoratorParams,
            breadcrumbs: [testBreadcrumb],
            availableLanguages: [testSpraak],
          },
        } satisfies DecoratorFetchProps);
        await ventPaDekoratoren();
        await ventPaBeggeCallbacks();
      }}
    >
      <p data-testid="app-content">
        onBreadcrumbClick og onLanguageSelect er testet.
      </p>
    </IntegrationPage>
  );
}

async function ventPaDekoratoren() {
  const deadline = Date.now() + 10_000;
  while (Date.now() < deadline) {
    if (document.querySelector("header") && document.querySelector("footer")) {
      return;
    }
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
  throw new Error("CSR_KLIKK_CALLBACK_TIMEOUT");
}

async function ventPaBeggeCallbacks() {
  let breadcrumbPayload: unknown;
  let spraakPayload: unknown;

  onBreadcrumbClick((breadcrumb) => {
    breadcrumbPayload = breadcrumb;
  });
  onLanguageSelect((spraak) => {
    spraakPayload = spraak;
  });

  simulerDekoratorMelding("breadcrumbClick", testBreadcrumb);
  simulerDekoratorMelding("languageSelect", testSpraak);

  const deadline = Date.now() + 10_000;
  while (Date.now() < deadline) {
    const breadcrumbOk =
      breadcrumbPayload !== undefined &&
      (breadcrumbPayload as typeof testBreadcrumb).url === testBreadcrumb.url;
    const spraakOk =
      spraakPayload !== undefined &&
      (spraakPayload as typeof testSpraak).locale === testSpraak.locale;

    if (breadcrumbOk && spraakOk) {
      return;
    }
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
  throw new Error("CSR_KLIKK_CALLBACK_IKKE_MOTTATT");
}

function simulerDekoratorMelding(
  event: "breadcrumbClick" | "languageSelect",
  payload: unknown,
) {
  window.postMessage(
    { source: "decorator", event, payload },
    window.location.origin,
  );
}
