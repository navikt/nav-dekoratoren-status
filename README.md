# nav-dekoratoren-status

Dette er en vedlikeholdbar referanse- og integrasjonsapp for Nav Dekoratøren. Den er ikke en
produksjonsmal. Appen skal stå oppe kontinuerlig i Nais dev og brukes til å verifisere at alle
fire integrasjonsmåtene mot Dekoratøren fungerer som forventet.

## Integrasjoner

| Rute                                 | Hva den demonstrerer                                                  |
| ------------------------------------ | --------------------------------------------------------------------- |
| `/ssr-med-moduler`                   | Server-side rendering med `fetchDecoratorReact` fra modulpakken       |
| `/ssr-uten-moduler`                  | Server-side rendering uten moduler via `/ssr`                         |
| `/csr-med-moduler`                   | Client-side rendering med `injectDecoratorClientSide`                 |
| `/csr-uten-moduler`                  | Client-side rendering med CSS, `/env` og `client.js` uten modulpakken |
| `/parametre`                         | Levende SSR- og CSR-tester av Dekoratør-parametere                    |
| `/parametre/simple`                  | Client-side test av `simple: true` med egen integrasjonsstatus        |
| `/parametre/simple-header`           | Client-side test av `simpleHeader: true` med forenklet header         |
| `/parametre/simple-footer`           | Client-side test av `simpleFooter: true` med forenklet footer         |
| `/parametre/klikk-callbacks`         | Client-side test av `onBreadcrumbClick` og `onLanguageSelect`         |
| `/parametre/open-chatbot`            | Client-side test av `openChatbot`                                     |
| `/parametre/dekorator-oppdateringer` | Server-side test av `addDecoratorUpdateListener`                      |

Forsiden (`/`) viser en samlet statusoversikt for alle fire integrasjonene, med live helsesjekk
mot Dekoratøren ved hvert sidelastet. Bruk denne til rask manuell verifikasjon.

## Miljøer og tilgang

Statusappen er tilgjengelig kun for Nav-ansatte:

| Miljø | Statusapp                                          | Dekoratøren SSR                       | Dekoratøren CSR                          |
| ----- | -------------------------------------------------- | ------------------------------------- | ---------------------------------------- |
| Dev   | `https://nav-dekoratoren-status.ansatt.dev.nav.no` | `http://nav-dekoratoren.personbruker` | `https://dekoratoren.ekstern.dev.nav.no` |
| Prod  | `https://nav-dekoratoren-status.ansatt.nav.no`     | `http://nav-dekoratoren.personbruker` | `https://www.nav.no/dekoratoren`         |

SSR-rutene bruker service discovery i riktig Nais-cluster. CSR-rutene kjører i nettleseren og
bruker derfor Dekoratørens offentlige ingress for miljøet. For SSR uten moduler bruker vi
`teamName=nav-dekoratoren-status.navno` i kallet til `/ssr`. Modulpakken identifiserer selv
opprinnelsen for SSR med moduler.

### Parametertester (`/parametre`)

Siden kjører faktiske kall til Dekoratøren ved hver sidelast: `fetchDecoratorReact` for SSR og
`setBreadcrumbs`/`setAvailableLanguages` etter `injectDecoratorClientSide` for CSR. Den tester
bare verdier som skal fungere. ✅ betyr at parameteren ble godtatt; ❌ betyr et avvik, med
feilmeldingen fra Dekoratøren i detaljtabellen.

Hver parameter vises som en utvidbar Aksel-bolk. Bolkens status er grønn når alle underliggende
testcaser er grønne, og rød når minst én testcase feiler. Detaljtabellen viser testcase, komplett
verdi, feilmelding og en kort forklaring av hva som testes.

| Parameter eller funksjon                 | Testdekning                                                                                                                               | Integrasjon                                                        |
| ---------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------ |
| `analyticsQueryParams`                   | Hviteliste med spørrestrengparametre som beholdes i URL-en for Analytics                                                                  | SSR og CSR (kun ved initialisering, endres ikke med `setParams()`) |
| `analyticsRedactFilter`                  | Filter for spørrestrengparametre som redigeres bort (redaction) fra URL-en for Analytics                                                  | SSR og CSR (kun ved initialisering, endres ikke med `setParams()`) |
| `breadcrumbs`                            | Vanlige nav.no-lenker, tom liste, `handleInApp` og spesialtegn i tittel                                                                   | SSR og CSR                                                         |
| `availableLanguages`                     | Alle støttede språk, tom liste og `handleInApp`                                                                                           | SSR og CSR                                                         |
| `context`                                | `privatperson`, `arbeidsgiver` og `samarbeidspartner`                                                                                     | SSR og CSR                                                         |
| `origin`                                 | Stabilt appnavn brukt til å filtrere sidevisninger i Analytics                                                                            | SSR og CSR (kun ved initialisering, endres ikke med `setParams()`) |
| `pageType`                               | Gyldig sidetype brukt til å kategorisere sidevisninger i Analytics                                                                        | SSR og CSR                                                         |
| `chatbot`                                | `true` og `false`                                                                                                                         | SSR og CSR                                                         |
| `chatbotVisible`                         | `true` og `false`                                                                                                                         | SSR og CSR                                                         |
| `feedback`                               | `true` og `false`                                                                                                                         | SSR og CSR                                                         |
| `language`                               | Alle støttede språk (`nb`, `nn`, `en`, `se`, `pl`, `uk`, `ru`)                                                                            | SSR og CSR                                                         |
| `logoutUrl`                              | Gyldig nav.no-URL                                                                                                                         | SSR og CSR                                                         |
| `logoutWarning`                          | `true` og `false`                                                                                                                         | SSR og CSR                                                         |
| `shareScreen`                            | `true` og `false`, uten å starte skjermdeling                                                                                             | SSR og CSR                                                         |
| `utilsBackground`                        | `white`, `gray` og `transparent`                                                                                                          | SSR og CSR                                                         |
| `redirectOnUserChange`                   | `true` og `false`                                                                                                                         | SSR og CSR                                                         |
| `redirectToApp`                          | `true` og `false`, uten å gjennomføre innlogging                                                                                          | SSR og CSR                                                         |
| `redirectToUrl`                          | Gyldig nav.no-URL, uten å gjennomføre innlogging                                                                                          | SSR og CSR                                                         |
| `redirectToUrlLogout`                    | Gyldig nav.no-URL, uten å gjennomføre utlogging                                                                                           | SSR og CSR                                                         |
| `simple`                                 | Forenklet header og footer, samt tilbakeverdi fra `getParams()`                                                                           | SSR og CSR på `/parametre/simple`                                  |
| `simpleHeader`                           | Forenklet header mens footeren fortsatt finnes, samt tilbakeverdi fra `getParams()`                                                       | SSR og CSR på `/parametre/simple-header`                           |
| `simpleFooter`                           | Forenklet footer mens headeren fortsatt finnes, samt tilbakeverdi fra `getParams()`                                                       | SSR og CSR på `/parametre/simple-footer`                           |
| `onBreadcrumbClick` / `onLanguageSelect` | Simulerer Dekoratørens postMessage-kontrakt for et breadcrumb-klikk og et språkvalg, og verifiserer at callbacken mottar riktig nyttelast | CSR på `/parametre/klikk-callbacks`                                |
| `openChatbot`                            | Verifiserer at `chatbotVisible` settes til `true` etter kallet                                                                            | CSR på `/parametre/open-chatbot`                                   |
| `setParams` / `getParams`                | Setter og leser tilbake CSR-parametere                                                                                                    | CSR                                                                |
| `buildCspHeader`                         | Appens CSP-direktiver beholdes i den sammenslåtte headeren                                                                                | SSR                                                                |
| `getDecoratorVersionId`                  | Dekoratøren returnerer en ikke-tom versjons-id                                                                                            | SSR                                                                |
| `addDecoratorUpdateListener`             | Starter én prosessdelt lytter som registrerer siste observerte Dekoratør-versjon                                                          | SSR på `/parametre/dekorator-oppdateringer`                        |

`level` testes bevisst ikke her: den er sikkerhetssensitiv og ikke ment å være en offentlig
parameter som apper skal kunne sette selv.

Appen har ingen egne autentiserte endepunkter, identitetsoppslag, database, persistent lagring,
cookies eller analytics. Den viser og logger bare statisk teknisk integrasjonsstatus. Ingen
brukerdata eller Dekoratørens auth-data leses, lagres eller logges.

## Lokal utvikling

Installer private pakker med pnpm, GitHub Packages og en token med `read:packages`:

```bash
export NODE_AUTH_TOKEN=...
pnpm install
pnpm dev
```

Lokalt brukes den offentlige dev-ingressen for Dekoratøren. I Nais dev-gcp brukes intern service
discovery for SSR uten moduler. `pnpm typecheck`, `pnpm test` og `pnpm test:e2e` er tilgjengelige
for validering.

## CI og deploy

CI trenger GitHub-secretet `READER_TOKEN` for GitHub Packages.

- **Deploy dev** kjører automatisk ved push til `main`, eller manuelt mot en valgfri branch, tag
  eller SHA. Workflowen bygger og tester endringen, deployer til dev-gcp og venter på en
  vellykket Nais-rollout.
- **Deploy prod** starter automatisk når en push-utløst **Deploy dev** for `main` er grønn, og
  deployer samme commit til prod-gcp. Manuelle devdeployinger trigger ikke prod. Workflowen kan
  også startes manuelt med en eksisterende tag for rollback.

CI og deploy-workflowene kjører alle fire Playwright-integrasjonstestene på GitHub-hostede
runnere mot en lokal bygget statusapp. Chromium installeres med
`pnpm exec playwright install --with-deps chromium`. Dette er trygt for det offentlige repoet,
men verifiserer ikke ansatt-ingressen; rendering og interaksjon der verifiseres manuelt.

En Naisjob-basert post-deploy-sjekk kan senere verifisere integrasjonene fra riktig
Nais-cluster, uten å knytte en intern self-hosted runner til det offentlige repoet.

Prod-promotering etter push til `main` er i dag gated av lokale tester og at `nais apply --wait`
fullfører for dev. Det verifiserer at dev-podden er klar, men ikke brukerreisen gjennom
ansatt-ingressen. Den dekkes manuelt inntil en Naisjob-basert post-deploy-sjekk er på plass.

Rollback skjer ved å starte **Deploy prod** manuelt med forrige fungerende release-tag. Appen har
ingen datamigreringer eller persistent tilstand. Alerting er bevisst ikke konfigurert ennå.
