import { useEffect, useState } from "react";
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

/**
 * Hook para gatear el render de una página hasta que el namespace
 * "emergency" terminó de cargar. registerEmergencyNamespace() es
 * asíncrono de verdad (dos fetches en cadena antes de addResourceBundle),
 * así que llamarlo sin esperar la promesa deja un instante en el que t()
 * devuelve la clave cruda ("MonitorPage.box.waiting") en vez del texto
 * traducido. Usar así, en el cuerpo del componente, ANTES de cualquier
 * early return (Rules of Hooks):
 *
 *   const namespaceReady = useEmergencyNamespaceReady();
 *   // ... resto de hooks del componente, sin condicionar nada por esto ...
 *   if (!namespaceReady) return <LoadingState />;
 */
export function useEmergencyNamespaceReady(): boolean {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    registerEmergencyNamespace().then(() => {
      if (!cancelled) setReady(true);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  return ready;
}