"use client";

import {
  getParams,
  injectDecoratorClientSide,
  setAvailableLanguages,
  setBreadcrumbs,
  setParams,
} from "@navikt/nav-dekoratoren-moduler";
import { useEffect, useRef, useState } from "react";
import { decoratorParams } from "../lib/decorator-params";
import { getDecoratorEnvProps } from "../lib/decorator-config";
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
  pageTypeTestCases,
  redirectOnUserChangeTestCases,
  redirectToAppTestCases,
  redirectToUrlTestCases,
  redirectToUrlLogoutTestCases,
  shareScreenTestCases,
  utilsBackgroundTestCases,
} from "../lib/parameter-testcases";
import type { TestRad } from "../lib/test-rad";
import { ParameterBolker } from "./ParameterBolker";

type ParameterTestCase = {
  id: string;
  navn: string;
  beskrivelse: string;
};

type DekoratorParametre = Awaited<ReturnType<typeof getParams>>;

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

async function kjorCsrEnkeltParameterTest<T extends ParameterTestCase>(
  idPrefix: string,
  parameter: string,
  testCase: T,
  hentVerdi: (testCase: T) => string,
  oppdater: (testCase: T) => Promise<void>,
): Promise<TestRad> {
  const verdi = hentVerdi(testCase);
  const id = `csr-${idPrefix}-${testCase.id}`;

  try {
    await oppdater(testCase);
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
}

async function kjorCsrParameterTester<T extends ParameterTestCase>(
  idPrefix: string,
  parameter: string,
  testCases: readonly T[],
  hentVerdi: (testCase: T) => string,
  oppdater: (testCase: T) => Promise<void>,
  parallelt = false,
): Promise<TestRad[]> {
  const kjorTest = (testCase: T) =>
    kjorCsrEnkeltParameterTest(
      idPrefix,
      parameter,
      testCase,
      hentVerdi,
      oppdater,
    );

  if (parallelt) return Promise.all(testCases.map(kjorTest));

  const resultater: TestRad[] = [];
  for (const testCase of testCases) {
    resultater.push(await kjorTest(testCase));
  }
  return resultater;
}

async function sjekkInitParameter<T>({
  id,
  parameter,
  beskrivelse,
  forventet,
  hentVerdi,
  formatterVerdi,
  sammenlign = (a, b) => a === b,
  feilmelding,
}: {
  id: string;
  parameter: string;
  beskrivelse: string;
  forventet: T;
  hentVerdi: (params: DekoratorParametre) => T;
  formatterVerdi: (verdi: T) => string;
  sammenlign?: (a: T, b: T) => boolean;
  feilmelding: (forventet: T, verdi: T) => string;
}): Promise<TestRad> {
  try {
    const verdi = hentVerdi(await getParams());
    const somForventet = sammenlign(verdi, forventet);

    return {
      id,
      parameter,
      testcase: "Satt ved initialisering",
      beskrivelse,
      verdi: formatterVerdi(verdi),
      somForventet,
      ...(somForventet ? {} : { feilmelding: feilmelding(forventet, verdi) }),
    };
  } catch (error) {
    return {
      id,
      parameter,
      testcase: "Satt ved initialisering",
      beskrivelse,
      verdi: "–",
      somForventet: false,
      feilmelding: error instanceof Error ? error.message : "Ukjent feil",
    };
  }
}

type ParametreCsrProps = {
  onStatusChange?: (somForventet: boolean | undefined) => void;
};

export function ParametreCsr({ onStatusChange }: ParametreCsrProps = {}) {
  const [rader, setRader] = useState<TestRad[] | null>(null);
  const startet = useRef(false);
  const onStatusChangeRef = useRef(onStatusChange);
  onStatusChangeRef.current = onStatusChange;

  useEffect(() => {
    onStatusChangeRef.current?.(
      rader ? rader.every((rad) => rad.somForventet) : undefined,
    );
  }, [rader]);

  useEffect(() => {
    if (startet.current) return;
    startet.current = true;

    void (async () => {
      try {
        await injectDecoratorClientSide({
          ...getDecoratorEnvProps(),
          params: {
            ...decoratorParams,
            analyticsQueryParams:
              analyticsQueryParamsTestCases[0]?.analyticsQueryParams ?? [],
            analyticsRedactFilter:
              analyticsRedactFilterTestCases[0]?.analyticsRedactFilter ?? [],
          },
        });
      } catch (error) {
        setRader([
          {
            id: "csr-initialisering",
            parameter: "Dekoratøren",
            testcase: "Initialisering",
            beskrivelse:
              "Dekoratøren kan lastes i nettleseren før de øvrige CSR-testene kjøres.",
            verdi: "–",
            somForventet: false,
            feilmelding: `Kunne ikke laste Dekoratøren: ${
              error instanceof Error ? error.message : "Ukjent feil"
            }`,
          },
        ]);
        return;
      }

      const originResultat = await sjekkInitParameter({
        id: "csr-origin-initialisering",
        parameter: "origin",
        beskrivelse:
          "Dekoratøren tar imot origin ved injectDecoratorClientSide og gjør verdien tilgjengelig via getParams(). Parameteren er ikke ment å endres med setParams() i løpet av økten.",
        forventet: decoratorParams.origin,
        hentVerdi: (params) => params?.origin,
        formatterVerdi: (verdi) => verdi ?? "(ikke satt)",
        feilmelding: (forventet, verdi) =>
          `Forventet origin=${forventet}, fikk ${verdi ?? "(ikke satt)"}`,
      });

      const analyticsQueryParamsResultat = await sjekkInitParameter({
        id: "csr-analytics-query-params-initialisering",
        parameter: "analyticsQueryParams",
        beskrivelse:
          "Dekoratøren tar imot analyticsQueryParams ved injectDecoratorClientSide og gjør verdien tilgjengelig via getParams(). Parameteren er ikke ment å endres med setParams() i løpet av økten.",
        forventet:
          analyticsQueryParamsTestCases[0]?.analyticsQueryParams ?? [],
        hentVerdi: (params) => params?.analyticsQueryParams ?? [],
        formatterVerdi: (verdi) => verdi.join(", ") || "(tom liste)",
        sammenlign: (a, b) => JSON.stringify(a) === JSON.stringify(b),
        feilmelding: (forventet, verdi) =>
          `Forventet analyticsQueryParams=${forventet.join(", ")}, fikk ${verdi.join(", ") || "(tom liste)"}`,
      });

      const analyticsRedactFilterResultat = await sjekkInitParameter({
        id: "csr-analytics-redact-filter-initialisering",
        parameter: "analyticsRedactFilter",
        beskrivelse:
          "Dekoratøren tar imot analyticsRedactFilter ved injectDecoratorClientSide og gjør verdien tilgjengelig via getParams(). Parameteren er ikke ment å endres med setParams() i løpet av økten.",
        forventet:
          analyticsRedactFilterTestCases[0]?.analyticsRedactFilter ?? [],
        hentVerdi: (params) => params?.analyticsRedactFilter ?? [],
        formatterVerdi: (verdi) => verdi.join(", ") || "(tom liste)",
        sammenlign: (a, b) => JSON.stringify(a) === JSON.stringify(b),
        feilmelding: (forventet, verdi) =>
          `Forventet analyticsRedactFilter=${forventet.join(", ")}, fikk ${verdi.join(", ") || "(tom liste)"}`,
      });

      const breadcrumbResultater = await kjorCsrParameterTester(
        "breadcrumbs",
        "breadcrumbs",
        breadcrumbTestCases,
        breadcrumbVerdi,
        (testCase) => setBreadcrumbs(testCase.breadcrumbs),
        true,
      );
      const sprakResultater = await kjorCsrParameterTester(
        "available-languages",
        "availableLanguages",
        availableLanguagesTestCases,
        sprakVerdi,
        (testCase) => setAvailableLanguages(testCase.availableLanguages),
        true,
      );
      const contextResultater = await kjorCsrParameterTester(
        "context",
        "context",
        contextTestCases,
        (testCase) => testCase.context,
        async (testCase) => {
          await setParams({ context: testCase.context });
          await ventPaContext(testCase.context);
        },
      );
      const chatbotResultater = await kjorCsrParameterTester(
        "chatbot",
        "chatbot",
        chatbotTestCases,
        (testCase) => String(testCase.chatbot),
        async (testCase) => {
          await setParams({ chatbot: testCase.chatbot });
          await ventPaParameter("chatbot", testCase.chatbot);
        },
      );
      const chatbotVisibleResultater = await kjorCsrParameterTester(
        "chatbot-visible",
        "chatbotVisible",
        chatbotVisibleTestCases,
        (testCase) => String(testCase.chatbotVisible),
        async (testCase) => {
          await setParams({ chatbotVisible: testCase.chatbotVisible });
          await ventPaParameter("chatbotVisible", testCase.chatbotVisible);
        },
      );
      const feedbackResultater = await kjorCsrParameterTester(
        "feedback",
        "feedback",
        feedbackTestCases,
        (testCase) => String(testCase.feedback),
        async (testCase) => {
          await setParams({ feedback: testCase.feedback });
          await ventPaParameter("feedback", testCase.feedback);
        },
      );
      const languageResultater = await kjorCsrParameterTester(
        "language",
        "language",
        languageTestCases,
        (testCase) => testCase.language,
        async (testCase) => {
          await setParams({ language: testCase.language });
          await ventPaParameter("language", testCase.language);
        },
      );
      const logoutUrlResultater = await kjorCsrParameterTester(
        "logout-url",
        "logoutUrl",
        logoutUrlTestCases,
        (testCase) => testCase.logoutUrl,
        async (testCase) => {
          await setParams({ logoutUrl: testCase.logoutUrl });
          await ventPaParameter("logoutUrl", testCase.logoutUrl);
        },
      );
      const logoutWarningResultater = await kjorCsrParameterTester(
        "logout-warning",
        "logoutWarning",
        logoutWarningTestCases,
        (testCase) => String(testCase.logoutWarning),
        async (testCase) => {
          await setParams({ logoutWarning: testCase.logoutWarning });
          await ventPaParameter("logoutWarning", testCase.logoutWarning);
        },
      );
      const shareScreenResultater = await kjorCsrParameterTester(
        "share-screen",
        "shareScreen",
        shareScreenTestCases,
        (testCase) => String(testCase.shareScreen),
        async (testCase) => {
          await setParams({ shareScreen: testCase.shareScreen });
          await ventPaParameter("shareScreen", testCase.shareScreen);
        },
      );
      const utilsBackgroundResultater = await kjorCsrParameterTester(
        "utils-background",
        "utilsBackground",
        utilsBackgroundTestCases,
        (testCase) => testCase.utilsBackground,
        async (testCase) => {
          await setParams({ utilsBackground: testCase.utilsBackground });
          await ventPaParameter("utilsBackground", testCase.utilsBackground);
        },
      );
      const pageTypeResultater = await kjorCsrParameterTester(
        "page-type",
        "pageType",
        pageTypeTestCases,
        (testCase) => testCase.pageType,
        async (testCase) => {
          await setParams({ pageType: testCase.pageType });
          await ventPaParameter("pageType", testCase.pageType);
        },
      );
      const redirectOnUserChangeResultater = await kjorCsrParameterTester(
        "redirect-on-user-change",
        "redirectOnUserChange",
        redirectOnUserChangeTestCases,
        (testCase) => String(testCase.redirectOnUserChange),
        async (testCase) => {
          await setParams({ redirectOnUserChange: testCase.redirectOnUserChange });
          await ventPaParameter(
            "redirectOnUserChange",
            testCase.redirectOnUserChange,
          );
        },
      );
      const redirectToAppResultater = await kjorCsrParameterTester(
        "redirect-to-app",
        "redirectToApp",
        redirectToAppTestCases,
        (testCase) => String(testCase.redirectToApp),
        async (testCase) => {
          await setParams({ redirectToApp: testCase.redirectToApp });
          await ventPaParameter("redirectToApp", testCase.redirectToApp);
        },
      );
      const redirectToUrlResultater = await kjorCsrParameterTester(
        "redirect-to-url",
        "redirectToUrl",
        redirectToUrlTestCases,
        (testCase) => testCase.redirectToUrl,
        async (testCase) => {
          await setParams({ redirectToUrl: testCase.redirectToUrl });
          await ventPaParameter("redirectToUrl", testCase.redirectToUrl);
        },
      );
      const redirectToUrlLogoutResultater = await kjorCsrParameterTester(
        "redirect-to-url-logout",
        "redirectToUrlLogout",
        redirectToUrlLogoutTestCases,
        (testCase) => testCase.redirectToUrlLogout,
        async (testCase) => {
          await setParams({ redirectToUrlLogout: testCase.redirectToUrlLogout });
          await ventPaParameter(
            "redirectToUrlLogout",
            testCase.redirectToUrlLogout,
          );
        },
      );

      setRader([
        originResultat,
        analyticsQueryParamsResultat,
        analyticsRedactFilterResultat,
        ...breadcrumbResultater,
        ...sprakResultater,
        ...contextResultater,
        ...chatbotResultater,
        ...chatbotVisibleResultater,
        ...feedbackResultater,
        ...languageResultater,
        ...logoutUrlResultater,
        ...logoutWarningResultater,
        ...shareScreenResultater,
        ...utilsBackgroundResultater,
        ...pageTypeResultater,
        ...redirectOnUserChangeResultater,
        ...redirectToAppResultater,
        ...redirectToUrlResultater,
        ...redirectToUrlLogoutResultater,
      ]);

      await setBreadcrumbs([{ title: "Parametertester", url: "/parametre" }]);
      await setAvailableLanguages([]);
      await setParams({ context: "privatperson" });
      await setParams({ chatbot: true });
      await setParams({ chatbotVisible: false });
      await setParams({ feedback: false });
      await setParams({ language: "nb" });
      await setParams({ logoutUrl: "https://www.nav.no" });
      await setParams({ logoutWarning: true });
      await setParams({ shareScreen: true });
      await setParams({ utilsBackground: "white" });
      await setParams({ redirectOnUserChange: false });
      await setParams({ redirectToApp: false });
    })();
  }, []);

  if (!rader) return <p>⏳ Kjører CSR-tester …</p>;
  return (
    <ParameterBolker
      rader={rader}
      storageKey="parametre-csr"
      ekstraBolker={[
        {
          id: "forenklede-visninger",
          tittel: "Forenklede visninger (simple)",
          innhold: (
            <>
              <p>
                Disse parameterne testes i egne visninger fordi de endrer
                hvilke deler av Dekoratøren som rendres.
              </p>
              <p>
                <a href="/parametre/simple-header">
                  Åpne testen for simpleHeader: true
                </a>
              </p>
              <p>
                <a href="/parametre/simple-footer">
                  Åpne testen for simpleFooter: true
                </a>
              </p>
            </>
          ),
        },
        {
          id: "set-params-get-params",
          tittel: "setParams/getParams",
          innhold: (
            <>
              <p>
                Denne funksjonen testes i en egen visning, der Dekoratøren
                initialiseres med <code>simple: true</code> og verdien leses
                tilbake med <code>getParams()</code>.
              </p>
              <a href="/parametre/simple">Åpne testen for simple: true</a>
            </>
          ),
        },
        {
          id: "klikk-callbacks",
          tittel: "onBreadcrumbClick/onLanguageSelect",
          innhold: (
            <>
              <p>
                Disse funksjonene testes i en egen visning, som simulerer
                Dekoratørens postMessage-kontrakt for et breadcrumb-klikk og
                et språkvalg.
              </p>
              <a href="/parametre/klikk-callbacks">
                Åpne testen for onBreadcrumbClick/onLanguageSelect
              </a>
            </>
          ),
        },
        {
          id: "open-chatbot",
          tittel: "openChatbot",
          innhold: (
            <>
              <p>
                Denne funksjonen testes i en egen visning, som verifiserer at{" "}
                <code>chatbotVisible</code> settes til <code>true</code> etter
                kallet.
              </p>
              <a href="/parametre/open-chatbot">Åpne testen for openChatbot</a>
            </>
          ),
        },
      ]}
    />
  );
}

async function ventPaContext(
  forventetContext: (typeof contextTestCases)[number]["context"],
) {
  return ventPaParameter("context", forventetContext);
}

async function ventPaParameter(
  parameter:
    | "context"
    | "chatbot"
    | "chatbotVisible"
    | "feedback"
    | "language"
    | "logoutUrl"
    | "logoutWarning"
    | "shareScreen"
    | "utilsBackground"
    | "redirectOnUserChange"
    | "pageType"
    | "redirectToApp"
    | "redirectToUrl"
    | "redirectToUrlLogout",
  forventetVerdi: string | boolean,
) {
  const deadline = Date.now() + 10_000;
  while (Date.now() < deadline) {
    const params = await getParams();

    if (params?.[parameter] === forventetVerdi) return;
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
  throw new Error(
    `CSR_${parameter.toUpperCase()}_NOT_SET: ${String(forventetVerdi)}`,
  );
}
