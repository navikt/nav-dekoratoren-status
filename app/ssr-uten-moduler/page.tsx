import { IntegrationPage } from "../../components/IntegrationPage";
import { fetchSsrUtenModulerFragments } from "../../lib/ssr-uten-moduler";
import { ssrUtenModulerTeamName } from "../../lib/decorator-params";
import { logTechnicalEvent } from "../../lib/technical-logger";
import {
  isLocalDecorator,
  directDecoratorOrigin,
  ssrDecoratorTransport,
} from "../../lib/decorator-config";

const logTransport = isLocalDecorator
  ? directDecoratorOrigin
  : "service-discovery";

function Fragment({ value }: { value: string }) {
  return <div dangerouslySetInnerHTML={{ __html: value }} />;
}

export default async function SsrUtenModulerPage() {
  logTechnicalEvent(
    "decorator_integration_started",
    "ssr-uten-moduler",
    logTransport,
  );
  try {
    const fragments = await fetchSsrUtenModulerFragments();
    logTechnicalEvent(
      "decorator_ssr_rendered",
      "ssr-uten-moduler",
      logTransport,
    );
    return (
      <>
        <Fragment value={fragments.DECORATOR_HEAD_ASSETS} />
        <Fragment value={fragments.DECORATOR_HEADER} />
        <IntegrationPage
          title="SSR uten moduler"
          description="Dekoratøren er hentet med SSR uten moduler."
          integrationVariant="ssr-uten-moduler"
          rendering="server"
          transport={ssrDecoratorTransport}
          teamName={ssrUtenModulerTeamName}
        >
          <p data-testid="app-content">
            Dekoratøren ble rendret i første HTML-respons.
          </p>
        </IntegrationPage>
        <Fragment value={fragments.DECORATOR_FOOTER} />
        <Fragment value={fragments.DECORATOR_SCRIPTS} />
      </>
    );
  } catch {
    logTechnicalEvent(
      "decorator_integration_failed",
      "ssr-uten-moduler",
      logTransport,
      "SSR_DIRECT_FETCH",
    );
    return (
      <IntegrationPage
        title="SSR uten moduler"
        description="Dekoratøren kunne ikke hentes med SSR uten moduler."
        integrationVariant="ssr-uten-moduler"
        rendering="server"
        transport={ssrDecoratorTransport}
        teamName={ssrUtenModulerTeamName}
        initialStatus="error"
        errorMessage="Dekoratøren kunne ikke lastes"
      />
    );
  }
}
