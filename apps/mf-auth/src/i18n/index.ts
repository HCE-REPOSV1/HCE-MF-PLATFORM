import { i18n } from "@hce/i18n-core";
import { ENDPOINTS } from "../config/endpoints";
import { FALLBACK_AUTH_ES } from "./fallback";

let registered: Promise<void> | null = null;

/**
 * Trae el namespace "auth" para CADA idioma del manifest (`i18n/locales`),
 * no solo el activo -- así useLocaleSwitch() cambia de idioma al instante,
 * sin fetch ni parpadeo, mismo comportamiento que antes con los JSON
 * bundleados. Escala solo con el manifest: un idioma nuevo en el backend
 * aparece acá sin tocar este archivo.
 *
 * Si el servicio de i18n está caído (ni siquiera el manifest responde), cae
 * a un mini-bundle ES embebido en este mismo paquete (ver ./fallback.ts) --
 * el login es la pantalla más crítica de todo HCE, nadie debe quedar sin
 * poder loguearse por una caída puntual de este servicio.
 */
export function registerAuthNamespace(): Promise<void> {
  if (registered) return registered;

  registered = (async () => {
    let locales: Array<{ code: string }>;
    try {
      const res = await fetch(ENDPOINTS.i18n.locales);
      if (!res.ok) throw new Error(`i18n/locales respondió ${res.status}`);
      locales = await res.json();
    } catch (err) {
      console.error("[mf-auth i18n] no se pudo obtener el manifest de idiomas, usando fallback embebido:", err);
      i18n.addResourceBundle("es", "auth", FALLBACK_AUTH_ES);
      return;
    }

    await Promise.all(
      locales.map(async ({ code }) => {
        try {
          const res = await fetch(ENDPOINTS.i18n.publicNamespace(code, "auth"));
          if (!res.ok) return; // idioma sin bundle de auth todavía -- se omite, no rompe el resto
          const data = await res.json();
          i18n.addResourceBundle(code, "auth", data);
        } catch (err) {
          console.error(`[mf-auth i18n] no se pudo cargar auth/${code}:`, err);
        }
      }),
    );
  })();

  return registered;
}
