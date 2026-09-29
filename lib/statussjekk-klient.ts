import { buildPublicDecoratorUrl } from "./decorator-config";
import { csrMedModulerTeamName, decoratorParams } from "./decorator-params";
import { csrUtenModulerClientUrl } from "./csr-uten-moduler";
import type { IntegrasjonsHelse } from "./statussjekk";

async function sjekkCsrMedModuler(): Promise<IntegrasjonsHelse> {
  const path = "csr-med-moduler";
  const label = "CSR med moduler";
  try {
    const url = buildPublicDecoratorUrl("/env", {
      ...decoratorParams,
      teamName: csrMedModulerTeamName,
    });
    const response = await fetch(url, { cache: "no-store" });
    if (!response.ok) throw new Error(`HTTP_${response.status}`);
    return { path, label, status: "ok" };
  } catch {
    return {
      path,
      label,
      status: "feil",
      detalj: "Fikk ikke kontakt med Dekoratørens offentlige ingress (/env)",
    };
  }
}

async function sjekkCsrUtenModuler(): Promise<IntegrasjonsHelse> {
  const path = "csr-uten-moduler";
  const label = "CSR uten moduler";
  try {
    const response = await fetch(csrUtenModulerClientUrl(), {
      cache: "no-store",
    });
    if (!response.ok) throw new Error(`HTTP_${response.status}`);
    return { path, label, status: "ok" };
  } catch {
    return {
      path,
      label,
      status: "feil",
      detalj:
        "Fikk ikke kontakt med Dekoratørens offentlige ingress (client.js)",
    };
  }
}

export async function sjekkCsrIntegrasjoner(): Promise<IntegrasjonsHelse[]> {
  return Promise.all([sjekkCsrMedModuler(), sjekkCsrUtenModuler()]);
}
