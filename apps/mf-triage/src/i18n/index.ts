import { i18n } from "@hce/i18n-core";
import es from "./es/triage.json";
import en from "./en/triage.json";

let registered = false;

export function registerTriageNamespace() {
  console.log('[triage namespace] llamando registerTriageNamespace, registered =', registered);
  if (registered) return;

  console.log('[triage namespace] antes de addResourceBundle, i18n:', i18n);

  try {
    i18n.addResourceBundle("es", "triage", es);
    i18n.addResourceBundle("en", "triage", en);
    console.log('[triage namespace] addResourceBundle OK');
  } catch (err) {
    console.error('[triage namespace] ERROR en addResourceBundle:', err);
  }

  registered = true;
}