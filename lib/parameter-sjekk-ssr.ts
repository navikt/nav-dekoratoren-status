import {
  buildCspHeader,
  fetchDecoratorHtml,
  fetchDecoratorReact,
  getDecoratorVersionId,
  type DecoratorParams,
} from "@navikt/nav-dekoratoren-moduler/ssr";
import { decoratorParams } from "./decorator-params";
import { decoratorEnvProps } from "./decorator-config";
import {
  analyticsQueryParamsTestCases,
  analyticsRedactFilterTestCases,
  availableLanguagesTestCases,
  breadcrumbTestCases,
  chatbotTestCases,
  chatbotVisibleTestCases,
  contextTestCases,
  feedbackTestCases,
  languageTestCases,
  logoutUrlTestCases,
  logoutWarningTestCases,
  originTestCases,
  pageTypeTestCases,
  redirectOnUserChangeTestCases,
  redirectToAppTestCases,
  redirectToUrlTestCases,
  redirectToUrlLogoutTestCases,
  shareScreenTestCases,
  utilsBackgroundTestCases,
} from "./parameter-testcases";
import type { TestRad } from "./test-rad";

type ParameterTestCase = {
  id: string;
  navn: string;
  beskrivelse: string;
};

function breadcrumbVerdi(
  testCase: (typeof breadcrumbTestCases)[number],
): string {
  if (testCase.breadcrumbs.length === 0) return "(tom liste)";
  return testCase.breadcrumbs.map((b) => `"${b.title}" → ${b.url}`).join(" | ");
}

function sprakVerdi(
  testCase: (typeof availableLanguagesTestCases)[number],
): string {
  if (testCase.availableLanguages.length === 0) return "(tom liste)";
  return testCase.availableLanguages
    .map((sprak) => `${sprak.locale} → ${sprak.url}`)
    .join(" | ");
}

async function kjorSsrParameterTester<T extends ParameterTestCase>(
  idPrefix: string,
  parameter: string,
  testCases: readonly T[],
  hentVerdi: (testCase: T) => string,
  byggParams: (testCase: T) => Partial<DecoratorParams>,
): Promise<TestRad[]> {
  return Promise.all(
    testCases.map(async (testCase): Promise<TestRad> => {
      const verdi = hentVerdi(testCase);
      const id = `ssr-${idPrefix}-${testCase.id}`;

      try {
        await fetchDecoratorReact({
          ...decoratorEnvProps,
          params: { ...decoratorParams, ...byggParams(testCase) },
        });
        return {
          id,
          parameter,
          testcase: testCase.navn,
          beskrivelse: testCase.beskrivelse,
          verdi,
          somForventet: true,
        };
      } catch (error) {
        return {
          id,
          parameter,
          testcase: testCase.navn,
          beskrivelse: testCase.beskrivelse,
          verdi,
          somForventet: false,
          feilmelding: error instanceof Error ? error.message : "Ukjent feil",
        };
      }
    }),
  );
}

export function kjorSsrAnalyticsQueryParamsTester(): Promise<TestRad[]> {
  return kjorSsrParameterTester(
    "analytics-query-params",
    "analyticsQueryParams",
    analyticsQueryParamsTestCases,
    (testCase) => testCase.analyticsQueryParams.join(", "),
    (testCase) => ({ analyticsQueryParams: testCase.analyticsQueryParams }),
  );
}

export function kjorSsrAnalyticsRedactFilterTester(): Promise<TestRad[]> {
  return kjorSsrParameterTester(
    "analytics-redact-filter",
    "analyticsRedactFilter",
    analyticsRedactFilterTestCases,
    (testCase) => testCase.analyticsRedactFilter.join(", "),
    (testCase) => ({ analyticsRedactFilter: testCase.analyticsRedactFilter }),
  );
}

export function kjorSsrBreadcrumbTester(): Promise<TestRad[]> {
  return kjorSsrParameterTester(
    "breadcrumbs",
    "breadcrumbs",
    breadcrumbTestCases,
    breadcrumbVerdi,
    (testCase) => ({ breadcrumbs: testCase.breadcrumbs }),
  );
}

export function kjorSsrAvailableLanguagesTester(): Promise<TestRad[]> {
  return kjorSsrParameterTester(
    "available-languages",
    "availableLanguages",
    availableLanguagesTestCases,
    sprakVerdi,
    (testCase) => ({ availableLanguages: testCase.availableLanguages }),
  );
}

export function kjorSsrChatbotTester(): Promise<TestRad[]> {
  return kjorSsrParameterTester(
    "chatbot",
    "chatbot",
    chatbotTestCases,
    (testCase) => String(testCase.chatbot),
    (testCase) => ({ chatbot: testCase.chatbot }),
  );
}

export function kjorSsrChatbotVisibleTester(): Promise<TestRad[]> {
  return kjorSsrParameterTester(
    "chatbot-visible",
    "chatbotVisible",
    chatbotVisibleTestCases,
    (testCase) => String(testCase.chatbotVisible),
    (testCase) => ({ chatbotVisible: testCase.chatbotVisible }),
  );
}

export function kjorSsrFeedbackTester(): Promise<TestRad[]> {
  return kjorSsrParameterTester(
    "feedback",
    "feedback",
    feedbackTestCases,
    (testCase) => String(testCase.feedback),
    (testCase) => ({ feedback: testCase.feedback }),
  );
}

export function kjorSsrLanguageTester(): Promise<TestRad[]> {
  return kjorSsrParameterTester(
    "language",
    "language",
    languageTestCases,
    (testCase) => testCase.language,
    (testCase) => ({ language: testCase.language }),
  );
}

export function kjorSsrLogoutUrlTester(): Promise<TestRad[]> {
  return kjorSsrParameterTester(
    "logout-url",
    "logoutUrl",
    logoutUrlTestCases,
    (testCase) => testCase.logoutUrl,
    (testCase) => ({ logoutUrl: testCase.logoutUrl }),
  );
}

export function kjorSsrLogoutWarningTester(): Promise<TestRad[]> {
  return kjorSsrParameterTester(
    "logout-warning",
    "logoutWarning",
    logoutWarningTestCases,
    (testCase) => String(testCase.logoutWarning),
    (testCase) => ({ logoutWarning: testCase.logoutWarning }),
  );
}

export function kjorSsrShareScreenTester(): Promise<TestRad[]> {
  return kjorSsrParameterTester(
    "share-screen",
    "shareScreen",
    shareScreenTestCases,
    (testCase) => String(testCase.shareScreen),
    (testCase) => ({ shareScreen: testCase.shareScreen }),
  );
}

export function kjorSsrUtilsBackgroundTester(): Promise<TestRad[]> {
  return kjorSsrParameterTester(
    "utils-background",
    "utilsBackground",
    utilsBackgroundTestCases,
    (testCase) => testCase.utilsBackground,
    (testCase) => ({ utilsBackground: testCase.utilsBackground }),
  );
}

export function kjorSsrContextTester(): Promise<TestRad[]> {
  return kjorSsrParameterTester(
    "context",
    "context",
    contextTestCases,
    (testCase) => testCase.context,
    (testCase) => ({ context: testCase.context }),
  );
}

export function kjorSsrOriginTester(): Promise<TestRad[]> {
  return kjorSsrParameterTester(
    "origin",
    "origin",
    originTestCases,
    (testCase) => testCase.origin,
    (testCase) => ({ origin: testCase.origin }),
  );
}

export function kjorSsrPageTypeTester(): Promise<TestRad[]> {
  return kjorSsrParameterTester(
    "page-type",
    "pageType",
    pageTypeTestCases,
    (testCase) => testCase.pageType,
    (testCase) => ({ pageType: testCase.pageType }),
  );
}

export function kjorSsrRedirectOnUserChangeTester(): Promise<TestRad[]> {
  return kjorSsrParameterTester(
    "redirect-on-user-change",
    "redirectOnUserChange",
    redirectOnUserChangeTestCases,
    (testCase) => String(testCase.redirectOnUserChange),
    (testCase) => ({ redirectOnUserChange: testCase.redirectOnUserChange }),
  );
}

export function kjorSsrRedirectToAppTester(): Promise<TestRad[]> {
  return kjorSsrParameterTester(
    "redirect-to-app",
    "redirectToApp",
    redirectToAppTestCases,
    (testCase) => String(testCase.redirectToApp),
    (testCase) => ({ redirectToApp: testCase.redirectToApp }),
  );
}

export function kjorSsrRedirectToUrlTester(): Promise<TestRad[]> {
  return kjorSsrParameterTester(
    "redirect-to-url",
    "redirectToUrl",
    redirectToUrlTestCases,
    (testCase) => testCase.redirectToUrl,
    (testCase) => ({ redirectToUrl: testCase.redirectToUrl }),
  );
}

export function kjorSsrRedirectToUrlLogoutTester(): Promise<TestRad[]> {
  return kjorSsrParameterTester(
    "redirect-to-url-logout",
    "redirectToUrlLogout",
    redirectToUrlLogoutTestCases,
    (testCase) => testCase.redirectToUrlLogout,
    (testCase) => ({ redirectToUrlLogout: testCase.redirectToUrlLogout }),
  );
}

const forenkletVisningTestCases = [
  {
    id: "simple",
    parameter: "simple",
    navn: "Forenklet Dekoratør",
    beskrivelse:
      "simple: true skal gi både forenklet header og forenklet footer i server-renderingen.",
    verdi: "simple: true",
    params: { simple: true },
    forventet: { header: true, footer: true },
  },
  {
    id: "simple-header",
    parameter: "simpleHeader",
    navn: "Forenklet header",
    beskrivelse:
      "simpleHeader: true skal gi forenklet header og vanlig footer.",
    verdi: "simpleHeader: true",
    params: { simpleHeader: true },
    forventet: { header: true, footer: true },
  },
  {
    id: "simple-footer",
    parameter: "simpleFooter",
    navn: "Forenklet footer",
    beskrivelse:
      "simpleFooter: true skal gi vanlig header og forenklet footer.",
    verdi: "simpleFooter: true",
    params: { simpleFooter: true },
    forventet: { header: true, footer: true },
  },
] as const;

export async function kjorSsrForenkletVisningTester(): Promise<TestRad[]> {
  return Promise.all(
    forenkletVisningTestCases.map(async (testCase): Promise<TestRad> => {
      try {
        const dekorator = await fetchDecoratorHtml({
          ...decoratorEnvProps,
          params: { ...decoratorParams, ...testCase.params },
        });
        const harHeader = dekorator.DECORATOR_HEADER.includes("<header");
        const harFooter = dekorator.DECORATOR_FOOTER.includes("<footer");
        const somForventet =
          harHeader === testCase.forventet.header &&
          harFooter === testCase.forventet.footer;

        return {
          id: `ssr-${testCase.parameter}-${testCase.id}`,
          parameter: testCase.parameter,
          testcase: testCase.navn,
          beskrivelse: testCase.beskrivelse,
          verdi: testCase.verdi,
          somForventet,
          feilmelding: somForventet
            ? undefined
            : `Forventet header=${testCase.forventet.header}, footer=${testCase.forventet.footer}; fikk header=${harHeader}, footer=${harFooter}`,
        };
      } catch (error) {
        return {
          id: `ssr-${testCase.parameter}-${testCase.id}`,
          parameter: testCase.parameter,
          testcase: testCase.navn,
          beskrivelse: testCase.beskrivelse,
          verdi: testCase.verdi,
          somForventet: false,
          feilmelding: error instanceof Error ? error.message : "Ukjent feil",
        };
      }
    }),
  );
}

export async function kjorSsrCspTester(): Promise<TestRad[]> {
  const appDirectives = {
    "default-src": ["'self'"],
    "connect-src": ["nav-dekoratoren-status.dev.nav.no"],
  };

  try {
    const cspHeader = await buildCspHeader(appDirectives, decoratorEnvProps);
    const inneholderAppensDirektiver =
      cspHeader.includes("default-src 'self'") &&
      cspHeader.includes("connect-src nav-dekoratoren-status.dev.nav.no");

    return [
      {
        id: "ssr-build-csp-header-app-direktiver",
        parameter: "buildCspHeader",
        testcase: "Appens CSP-direktiver",
        beskrivelse:
          "Dekoratørens CSP kan slås sammen med appens default-src og connect-src uten at appens direktiver forsvinner.",
        verdi:
          "default-src: 'self' | connect-src: nav-dekoratoren-status.dev.nav.no",
        somForventet: inneholderAppensDirektiver,
        feilmelding: inneholderAppensDirektiver
          ? undefined
          : `CSP-headeren mangler ett eller flere app-direktiver: ${cspHeader}`,
      },
    ];
  } catch (error) {
    return [
      {
        id: "ssr-build-csp-header-app-direktiver",
        parameter: "buildCspHeader",
        testcase: "Appens CSP-direktiver",
        beskrivelse:
          "Dekoratørens CSP kan slås sammen med appens default-src og connect-src uten at appens direktiver forsvinner.",
        verdi:
          "default-src: 'self' | connect-src: nav-dekoratoren-status.dev.nav.no",
        somForventet: false,
        feilmelding: error instanceof Error ? error.message : "Ukjent feil",
      },
    ];
  }
}

export async function kjorSsrDekoratorVersjonTester(): Promise<TestRad[]> {
  try {
    const versjonsId = await getDecoratorVersionId(decoratorEnvProps);

    return [
      {
        id: "ssr-decorator-version-id",
        parameter: "getDecoratorVersionId",
        testcase: "Gjeldende versjon",
        beskrivelse:
          "Dekoratøren returnerer en versjons-id som kan brukes til å oppdage oppdateringer og invalidere en eventuell HTML-cache.",
        verdi: versjonsId || "(tom versjons-id)",
        somForventet: versjonsId.length > 0,
        feilmelding:
          versjonsId.length > 0
            ? undefined
            : "Dekoratøren returnerte en tom versjons-id",
      },
    ];
  } catch (error) {
    return [
      {
        id: "ssr-decorator-version-id",
        parameter: "getDecoratorVersionId",
        testcase: "Gjeldende versjon",
        beskrivelse:
          "Dekoratøren returnerer en versjons-id som kan brukes til å oppdage oppdateringer og invalidere en eventuell HTML-cache.",
        verdi: "–",
        somForventet: false,
        feilmelding: error instanceof Error ? error.message : "Ukjent feil",
      },
    ];
  }
}
