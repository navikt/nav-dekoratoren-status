import {
  buildPublicDecoratorUrl,
  directDecoratorOrigin,
  isLocalDecorator,
} from "./decorator-config";
import { csrMedModulerTeamName, decoratorParams } from "./decorator-params";
import { csrUtenModulerClientUrl } from "./csr-uten-moduler";
import type { IntegrasjonsHelse } from "./statussjekk";

const decoratorTarget = isLocalDecorator
  ? directDecoratorOrigin
  : "Dekoratørens offentlige ingress";

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
      detalj: `Fikk ikke kontakt med ${decoratorTarget} (/env)`,
    };
  }
}

async function sjekkCsrUtenModuler(): Promise<IntegrasjonsHelse> {
  const path = "csr-uten-moduler";
  const label = "CSR uten moduler";
  try {
    await sjekkClientScript();
    return { path, label, status: "ok" };
  } catch {
    return {
      path,
      label,
      status: "feil",
      detalj: `Fikk ikke kontakt med ${decoratorTarget} (client.js)`,
    };
  }
}

function sjekkClientScript(): Promise<void> {
  return new Promise((resolve, reject) => {
    const preload = document.createElement("link");
    preload.rel = "preload";
    preload.as = "script";
    preload.href = csrUtenModulerClientUrl();

    const timeout = setTimeout(
      () => ferdig(new Error("CLIENT_SCRIPT_TIMEOUT")),
      10_000,
    );

    function ferdig(error?: Error) {
      clearTimeout(timeout);
      preload.onload = null;
      preload.onerror = null;
      preload.remove();
      if (error) reject(error);
      else resolve();
    }

    preload.onload = () => ferdig();
    preload.onerror = () => ferdig(new Error("CLIENT_SCRIPT_LOAD_FAILED"));
    // Classic scripts load without CORS; preload checks the same resource without executing it.
    document.head.appendChild(preload);
  });
}

export async function sjekkCsrIntegrasjoner(): Promise<IntegrasjonsHelse[]> {
  return Promise.all([sjekkCsrMedModuler(), sjekkCsrUtenModuler()]);
}
