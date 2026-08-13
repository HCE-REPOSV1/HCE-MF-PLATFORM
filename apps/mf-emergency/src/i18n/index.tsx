import { i18n } from "@hce/i18n-core";
import es from "./es/emergency.json";
import en from "./en/emergency.json";

let registered = false;

export function registerEmergencyNamespace() {
  console.log('[emergency namespace] llamando registerEmergencyNamespace, registered =', registered);
  if (registered) return;

  console.log('[emergency namespace] antes de addResourceBundle, i18n:', i18n);

  try {
    i18n.addResourceBundle("es", "emergency", es);
    i18n.addResourceBundle("en", "emergency", en);
    console.log('[emergency namespace] addResourceBundle OK');
  } catch (err) {
    console.error('[emergency namespace] ERROR en addResourceBundle:', err);
  }

  registered = true;
}