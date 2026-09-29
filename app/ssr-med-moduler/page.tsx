import Script from "next/script";
import { fetchDecoratorReact } from "@navikt/nav-dekoratoren-moduler/ssr";
import { IntegrationPage } from "../../components/IntegrationPage";
import { decoratorParams, teamName } from "../../lib/decorator-params";
import { decoratorEnvironment } from "../../lib/decorator-config";
import { logTechnicalEvent } from "../../lib/technical-logger";

export const dynamic = "force-dynamic";

export default async function SsrModulesPage() {
  logTechnicalEvent(
    "decorator_integration_started",
    "ssr-med-moduler",
    "service-discovery",
  );
  try {
    const Decorator = await fetchDecoratorReact({
      env: decoratorEnvironment,
      params: decoratorParams,
    });
    logTechnicalEvent(
      "decorator_ssr_rendered",
      "ssr-med-moduler",
      "service-discovery",
    );
    return (
      <>
        <Decorator.HeadAssets />
        <Decorator.Header />
        <IntegrationPage
          title="SSR med moduler"
          description="Dekoratøren er hentet server-side med modulpakken."
          integrationVariant="ssr-med-moduler"
          rendering="server"
          transport="service discovery"
          teamName={teamName}
        >
          <p data-testid="app-content">
            Dekoratøren ble rendret i første HTML-respons.
          </p>
        </IntegrationPage>
        <Decorator.Footer />
        <Decorator.Scripts loader={Script} />
      </>
    );
  } catch {
    logTechnicalEvent(
      "decorator_integration_failed",
      "ssr-med-moduler",
      "service-discovery",
      "SSR_MODULES_FETCH",
    );
    return (
      <IntegrationPage
        title="SSR med moduler"
        description="Dekoratøren kunne ikke hentes server-side."
        integrationVariant="ssr-med-moduler"
        rendering="server"
        transport="service discovery"
        teamName={teamName}
        initialStatus="error"
        errorMessage="Dekoratøren kunne ikke lastes"
      />
    );
  }
}
