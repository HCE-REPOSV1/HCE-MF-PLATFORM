import { i18n } from "@hce/i18n-core";
import { ENDPOINTS } from "../config/endpoints";

let registered: Promise<void> | null = null;

/**
 * Trae el namespace "common" para CADA idioma del manifest (`i18n/locales`,
 * ruta pública) -- el shell lo necesita ANTES de que exista sesión (mf-auth
 * usa `t('common:actions.accept')` en el modal de cuenta bloqueada, y el
 * shell mismo lo monta primero que cualquier microfrontend protegido). Se
 * llama una sola vez desde main.tsx, justo después de initI18n() -- no
 * bloquea el primer render: i18next re-renderiza solo vía
 * `bindI18nStore: 'added removed'` (ver @hce/i18n-core/i18n.ts) apenas
 * cada `addResourceBundle` resuelve.
 *
 * A diferencia de `registerShellNamespace` (namespace "shell", protegido,
 * solo se usa post-login en Layout/sidebar) -- "common" es el único
 * namespace del shell que corre en zona pública, por eso es el único que
 * ya se migró a fetch remoto en este paso.
 */
export function registerCommonNamespace(): Promise<void> {
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
          const res = await fetch(ENDPOINTS.i18n.publicNamespace(code, "common"));
          if (!res.ok) return;
          const data = await res.json();
          i18n.addResourceBundle(code, "common", data);
        } catch (err) {
          console.error(`[mf-shell i18n] no se pudo cargar common/${code}:`, err);
        }
      }),
    );
  })();

  return registered;
}
