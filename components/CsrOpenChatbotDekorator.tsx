"use client";

import {
  getParams,
  injectDecoratorClientSide,
  openChatbot,
} from "@navikt/nav-dekoratoren-moduler";
import { decoratorParams } from "../lib/decorator-params";
import {
  csrDecoratorTransport,
  getDecoratorEnvProps,
} from "../lib/decorator-config";
import { IntegrationPage } from "./IntegrationPage";

export function CsrOpenChatbotDekorator() {
  return (
    <IntegrationPage
      title="openChatbot"
      description="openChatbot() setter chatbotVisible=true og klikker på chatbotens knapp i den rendrede headeren/footeren, dersom den finnes."
      integrationVariant="csr-med-moduler"
      rendering="klient"
      transport={csrDecoratorTransport}
      backHref="/parametre"
      backLabel="Tilbake"
      initialStatus="initializing"
      observe={async () => {
        await injectDecoratorClientSide({
          ...getDecoratorEnvProps(),
          params: { ...decoratorParams, chatbot: true, chatbotVisible: false },
        });
        await ventPaDekoratoren();
        openChatbot();
        await ventPaChatbotVisible();
      }}
    >
      <p data-testid="app-content">openChatbot er testet.</p>
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
  throw new Error("CSR_OPEN_CHATBOT_TIMEOUT");
}

async function ventPaChatbotVisible() {
  const deadline = Date.now() + 10_000;
  while (Date.now() < deadline) {
    const params = await getParams();
    if (params?.chatbotVisible === true) {
      return;
    }
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
  throw new Error("CSR_OPEN_CHATBOT_CHATBOT_VISIBLE_IKKE_SATT");
}
