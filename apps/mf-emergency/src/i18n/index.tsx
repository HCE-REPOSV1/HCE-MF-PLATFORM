import { i18n } from "@hce/i18n-core";
import { apiFetch } from "shell/ApiClient";
import { ENDPOINTS } from "../config/endpoints";

let registered: Promise<void> | null = null;

/**
 * Trae el namespace "emergency" para CADA idioma del manifest
 * (`i18n/locales`, público) y lo registra vía addResourceBundle. El bundle
 * en sí (`i18n/{locale}/emergency`) requiere sesión -- por eso usa
 * `apiFetch` de `shell/ApiClient` (cookie + auto-refresh en 401).
 */
export function registerEmergencyNamespace(): Promise<void> {
  if (registered) return registered;

  registered = (async () => {
    let locales: Array<{ code: string }>;
    try {
      const res = await fetch(ENDPOINTS.i18n.locales);
      if (!res.ok) throw new Error(`i18n/locales respondió ${res.status}`);
      locales = await res.json();
    } catch (err) {
      console.error("[mf-emergency i18n] no se pudo obtener el manifest de idiomas:", err);
      return;
    }

    await Promise.all(
      locales.map(async ({ code }) => {
        try {
          const res = await apiFetch(ENDPOINTS.i18n.namespace(code, "emergency"));
          if (!res.ok) return;
          const data = await res.json();
          i18n.addResourceBundle(code, "emergency", data);
        } catch (err) {
          console.error(`[mf-emergency i18n] no se pudo cargar emergency/${code}:`, err);
        }
      }),
    );
  })();

  return registered;
}
