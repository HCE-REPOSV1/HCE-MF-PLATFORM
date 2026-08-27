import { i18n } from "@hce/i18n-core";
import { apiFetch } from "shell/ApiClient";
import { ENDPOINTS } from "../config/endpoints";

let registered: Promise<void> | null = null;

/**
 * Trae el namespace "header" para CADA idioma del manifest (`i18n/locales`,
 * público -- no requiere sesión) y lo registra vía addResourceBundle. El
 * bundle en sí (`i18n/{locale}/header`) SÍ requiere sesión -- por eso usa
 * `apiFetch` de `shell/ApiClient` (cookie + auto-refresh en 401) en vez de
 * `fetch` directo, mismo patrón que ya usa practitioner.service.ts.
 */
export function registerHeaderNamespace(): Promise<void> {
  if (registered) return registered;

  registered = (async () => {
    let locales: Array<{ code: string }>;
    try {
      const res = await fetch(ENDPOINTS.i18n.locales);
      if (!res.ok) throw new Error(`i18n/locales respondió ${res.status}`);
      locales = await res.json();
    } catch (err) {
      console.error("[mf-header i18n] no se pudo obtener el manifest de idiomas:", err);
      return;
    }

    await Promise.all(
      locales.map(async ({ code }) => {
        try {
          const res = await apiFetch(ENDPOINTS.i18n.namespace(code, "header"));
          if (!res.ok) return;
          const data = await res.json();
          i18n.addResourceBundle(code, "header", data);
        } catch (err) {
          console.error(`[mf-header i18n] no se pudo cargar header/${code}:`, err);
        }
      }),
    );
  })();

  return registered;
}
