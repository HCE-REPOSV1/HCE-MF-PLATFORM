import { useEffect, useState } from "react";
import { i18n } from "@hce/i18n-core";
import { apiFetch } from "shell/ApiClient";
import { ENDPOINTS } from "../config/endpoints";

const NAMESPACE = "footer";

const registeredByLocale = new Map<string, Promise<void>>();

export function registerFooterNamespace(
  locale: string = i18n.language,
): Promise<void> {
  const cached = registeredByLocale.get(locale);
  if (cached) return cached;

  const promise = (async () => {
    try {
      const res = await apiFetch(ENDPOINTS.i18n.namespace(locale, NAMESPACE));
      if (!res.ok) {
        throw new Error(`i18n/${locale}/${NAMESPACE} respondió ${res.status}`);
      }
      const data = await res.json();
      i18n.addResourceBundle(locale, NAMESPACE, data);
    } catch (err) {
      console.error(
        `[mf-footer i18n] no se pudo cargar ${NAMESPACE}/${locale}:`,
        err,
      );
      registeredByLocale.delete(locale);
      throw err;
    }
  })();

  registeredByLocale.set(locale, promise);
  return promise;
}

export function useFooterNamespaceReady(): boolean {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setReady(false);
    registerFooterNamespace(i18n.language)
      .then(() => {
        if (!cancelled) setReady(true);
      })
      .catch(() => {
        if (!cancelled) setReady(true);
      });
    return () => {
      cancelled = true;
    };
  }, [i18n.language]);

  return ready;
}