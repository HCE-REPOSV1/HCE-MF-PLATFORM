import { i18n } from "@hce/i18n-core";
import { apiFetch } from "../services/api.service";
import { ENDPOINTS } from "../config/endpoints";

let registered: Promise<void> | null = null;

/**
 * Trae el namespace "shell" para CADA idioma del manifest (`i18n/locales`,
 * público) y lo registra vía addResourceBundle. El bundle en sí
 * (`i18n/{locale}/shell`) requiere sesión -- por eso usa `apiFetch` propio
 * de mf-shell (cookie + auto-refresh en 401, ver services/api.service.ts;
 * es el mismo módulo que se expone a los demás mf's como `shell/ApiClient`).
 */
export function registerShellNamespace(): Promise<void> {
  if (registered) return registered;

  registered = (async () => {
    let locales: Array<{ code: string }>;
    try {
      const res = await fetch(ENDPOINTS.i18n.locales);
      if (!res.ok) throw new Error(`i18n/locales respondió ${res.status}`);
      locales = await res.json();
    } catch (err) {
      console.error("[mf-shell i18n] no se pudo obtener el manifest de idiomas:", err);
      return;
    }

    await Promise.all(
      locales.map(async ({ code }) => {
        try {
          const res = await apiFetch(ENDPOINTS.i18n.namespace(code, "shell"));
          if (!res.ok) return;
          const data = await res.json();
          i18n.addResourceBundle(code, "shell", data);
        } catch (err) {
          console.error(`[mf-shell i18n] no se pudo cargar shell/${code}:`, err);
        }
      }),
    );
  })();

  return registered;
}
