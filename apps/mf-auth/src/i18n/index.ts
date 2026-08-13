import { i18n } from "@hce/i18n-core";
import es from "./es/auth.json";
import en from "./en/auth.json";

let registered = false;

export function registerAuthNamespace() {
  console.log('[auth namespace] llamando registerAuthNamespace, registered =', registered);
  if (registered) return;

  console.log('[auth namespace] antes de addResourceBundle, i18n:', i18n);

  try {
    i18n.addResourceBundle("es", "auth", es);
    i18n.addResourceBundle("en", "auth", en);
    console.log('[auth namespace] addResourceBundle OK');
  } catch (err) {
    console.error('[auth namespace] ERROR en addResourceBundle:', err);
  }

  registered = true;
}