import { useEffect, useState } from "react";
import { i18n } from "@hce/i18n-core";
import { apiFetch } from "shell/ApiClient";
import { ENDPOINTS } from "../config/endpoints";

const NAMESPACE = "header";

// Caché por idioma — evita volver a pedir el mismo idioma dos veces, pero
// permite pedir idiomas NUEVOS a medida que el usuario cambia (a diferencia
// del singleton único de antes, que solo se resolvía una vez para siempre
// trayendo TODOS los idiomas del manifest de una).
const registeredByLocale = new Map<string, Promise<void>>();

/**
 * Trae el namespace "header" SOLO para el idioma indicado (por defecto el
 * actualmente activo) y lo registra vía addResourceBundle. El bundle en sí
 * (`i18n/{locale}/header`) SÍ requiere sesión -- por eso usa `apiFetch` de
 * `shell/ApiClient` (cookie + auto-refresh en 401) en vez de `fetch`
 * directo, mismo patrón que ya usa practitioner.service.ts.
 *
 * A diferencia de la versión anterior, ya NO trae el manifest completo de
 * idiomas ni el resto de namespaces por idioma — evita 1 fetch (el
 * manifest) + N-1 fetches de idiomas que el usuario puede no llegar a usar
 * nunca en la sesión.
 */
export function registerHeaderNamespace(
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
        `[mf-header i18n] no se pudo cargar ${NAMESPACE}/${locale}:`,
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
 *   const namespaceReady = useHeaderNamespaceReady();
 *   // ... resto de hooks del componente, sin condicionar nada por esto ...
 *   if (!namespaceReady) return <LoadingState />;
 */
export function useHeaderNamespaceReady(): boolean {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setReady(false);
    registerHeaderNamespace(i18n.language)
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