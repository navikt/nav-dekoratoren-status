import { ParametreOversikt } from "../../components/ParametreOversikt";
import { TestTabell } from "../../components/TestTabell";
import {
  kjorSsrAnalyticsQueryParamsTester,
  kjorSsrAnalyticsRedactFilterTester,
  kjorSsrAvailableLanguagesTester,
  kjorSsrBreadcrumbTester,
  kjorSsrChatbotTester,
  kjorSsrChatbotVisibleTester,
  kjorSsrContextTester,
  kjorSsrCspTester,
  kjorSsrDekoratorVersjonTester,
  kjorSsrFeedbackTester,
  kjorSsrForenkletVisningTester,
  kjorSsrLanguageTester,
  kjorSsrLogoutUrlTester,
  kjorSsrLogoutWarningTester,
  kjorSsrOriginTester,
  kjorSsrPageTypeTester,
  kjorSsrRedirectOnUserChangeTester,
  kjorSsrRedirectToAppTester,
  kjorSsrRedirectToUrlTester,
  kjorSsrRedirectToUrlLogoutTester,
  kjorSsrShareScreenTester,
  kjorSsrUtilsBackgroundTester,
} from "../../lib/parameter-sjekk-ssr";

export const dynamic = "force-dynamic";

export default async function ParametrePage() {
  const [
    analyticsQueryParamsRader,
    analyticsRedactFilterRader,
    breadcrumbRader,
    availableLanguagesRader,
    chatbotRader,
    chatbotVisibleRader,
    feedbackRader,
    languageRader,
    logoutUrlRader,
    logoutWarningRader,
    shareScreenRader,
    utilsBackgroundRader,
    contextRader,
    originRader,
    pageTypeRader,
    redirectOnUserChangeRader,
    redirectToAppRader,
    redirectToUrlRader,
    redirectToUrlLogoutRader,
    forenkletVisningRader,
    cspRader,
    versjonsRader,
  ] = await Promise.all([
    kjorSsrAnalyticsQueryParamsTester(),
    kjorSsrAnalyticsRedactFilterTester(),
    kjorSsrBreadcrumbTester(),
    kjorSsrAvailableLanguagesTester(),
    kjorSsrChatbotTester(),
    kjorSsrChatbotVisibleTester(),
    kjorSsrFeedbackTester(),
    kjorSsrLanguageTester(),
    kjorSsrLogoutUrlTester(),
    kjorSsrLogoutWarningTester(),
    kjorSsrShareScreenTester(),
    kjorSsrUtilsBackgroundTester(),
    kjorSsrContextTester(),
    kjorSsrOriginTester(),
    kjorSsrPageTypeTester(),
    kjorSsrRedirectOnUserChangeTester(),
    kjorSsrRedirectToAppTester(),
    kjorSsrRedirectToUrlTester(),
    kjorSsrRedirectToUrlLogoutTester(),
    kjorSsrForenkletVisningTester(),
    kjorSsrCspTester(),
    kjorSsrDekoratorVersjonTester(),
  ]);

  return (
    <main>
      <p>
        <a href="/">Tilbake til oversikten</a>
      </p>
      <h1>Parametertester</h1>
      <p>
        Tester hvordan Dekoratøren håndterer ulike hjelpefunksjoner og
        parametre.
      </p>
      <ul>
        <li>✅ utfallet var som forventet</li>
        <li>❌ avvik, se feilmelding-kolonnen</li>
      </ul>
      <p>
        <strong>NB!</strong> Statusikonene for SSR og CSR gjelder testene i
        hovedlistene. SSR-testen for <code>addDecoratorUpdateListener</code>{" "}
        kjøres i en egen visning og inngår ikke i SSR-statusen. CSR-testene for
        <code>Forenklede visninger</code>, <code>setParams/getParams</code>,
        <code>onBreadcrumbClick/onLanguageSelect</code> og{" "}
        <code>openChatbot</code> kjøres i egne visninger og inngår ikke i
        CSR-statusen. Gå inn på SSR eller CSR og følg lenkene for å se
        resultatene.
      </p>

      <ParametreOversikt
        ssrRader={[
          ...analyticsQueryParamsRader,
          ...analyticsRedactFilterRader,
          ...breadcrumbRader,
          ...availableLanguagesRader,
          ...chatbotRader,
          ...chatbotVisibleRader,
          ...feedbackRader,
          ...languageRader,
          ...logoutUrlRader,
          ...logoutWarningRader,
          ...shareScreenRader,
          ...utilsBackgroundRader,
          ...contextRader,
          ...originRader,
          ...pageTypeRader,
          ...redirectOnUserChangeRader,
          ...redirectToAppRader,
          ...redirectToUrlRader,
          ...redirectToUrlLogoutRader,
          ...cspRader,
          ...versjonsRader,
        ]}
        ssrEkstraBolker={[
          {
            id: "forenklede-visninger",
            tittel: "Forenklede visninger (simple)",
            somForventet: forenkletVisningRader.every(
              (rad: { somForventet: any }) => rad.somForventet,
            ),
            innhold: <TestTabell rader={forenkletVisningRader} />,
          },
          {
            id: "dekorator-oppdateringer",
            tittel: "addDecoratorUpdateListener",
            innhold: (
              <>
                <p>
                  Lytter etter nye Dekoratør-versjoner slik at en SSR-cache kan
                  ugyldiggjøres.
                </p>
                <a href="/parametre/dekorator-oppdateringer">
                  Åpne testen for addDecoratorUpdateListener
                </a>
              </>
            ),
          },
        ]}
      />
    </main>
  );
}
