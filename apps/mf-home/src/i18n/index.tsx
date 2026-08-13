import { i18n } from "@hce/i18n-core";
import es from "./es/home.json";
import en from "./en/home.json";

let registered = false;

export function registerHomeNamespace() {
  console.log('[home namespace] llamando registerHomeNamespace, registered =', registered);
  if (registered) return;

  console.log('[home namespace] antes de addResourceBundle, i18n:', i18n);

  try {
    i18n.addResourceBundle("es", "home", es);
    i18n.addResourceBundle("en", "home", en);
    console.log('[home namespace] addResourceBundle OK');
  } catch (err) {
    console.error('[home namespace] ERROR en addResourceBundle:', err);
  }

  registered = true;
}