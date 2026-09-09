import { useEffect, useState } from "react";
import { i18n } from "@hce/i18n-core";
import { apiFetch } from "shell/ApiClient";
import { ENDPOINTS } from "../config/endpoints";

const NAMESPACE = "clinical-record";

// Caché por idioma — evita volver a pedir el mismo idioma dos veces, pero
// permite pedir idiomas NUEVOS a medida que el usuario cambia (a diferencia
// del singleton único de antes, que solo se resolvía una vez para siempre).
const registeredByLocale = new Map<string, Promise<void>>();

/**
 * Trae el namespace "clinical-record" SOLO para el idioma indicado (por
 * defecto el actualmente activo) y lo registra vía addResourceBundle.
 *
 * A diferencia de la versión anterior, ya NO trae el manifest completo de
 * idiomas ni el resto de namespaces por idioma — evita 1 fetch (el
 * manifest) + N-1 fetches de idiomas que el usuario puede no llegar a usar
 * nunca en la sesión.
 */
export function registerClinicalRecordNamespace(
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
        `[mf-clinical-record i18n] no se pudo cargar ${NAMESPACE}/${locale}:`,
        err,
      );
      // No cachear el fallo — permite reintentar en una próxima llamada
      registeredByLocale.delete(locale);
      throw err;
    }
  })();

  registeredByLocale.set(locale, promise);
  return promise;
}

/**
 * Hook para gatear el render hasta que el namespace del IDIOMA ACTUAL
 * terminó de cargar. Se vuelve a disparar cada vez que `i18n.language`
 * cambia (siempre que el componente que lo usa se re-renderice con
 * `useTranslation`, que es el uso normal), trayendo el bundle del idioma
 * nuevo bajo demanda si todavía no está en caché.
 *
 *   const namespaceReady = useClinicalRecordNamespaceReady();
 *   // ... resto de hooks del componente, sin condicionar nada por esto ...
 *   if (!namespaceReady) return <LoadingState />;
 */
export function useClinicalRecordNamespaceReady(): boolean {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    console.log("consumiendo clinical record i18n");
    let cancelled = false;
    setReady(false);
    registerClinicalRecordNamespace(i18n.language)
      .then(() => {
        if (!cancelled) setReady(true);
      })
      .catch(() => {
        // No bloquear la UI para siempre por un fetch fallido
        if (!cancelled) setReady(true);
      });
    return () => {
      cancelled = true;
    };
  }, [i18n.language]);

  return ready;
}
