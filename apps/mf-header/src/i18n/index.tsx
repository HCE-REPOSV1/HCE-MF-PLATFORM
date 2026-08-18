import { i18n } from "@hce/i18n-core";
import es from "./es/header.json";
import en from "./en/header.json";

let registered = false;

export function registerHeaderNamespace() {
  console.log('[header namespace] llamando registerHeaderNamespace, registered =', registered);
  if (registered) return;

  console.log('[header namespace] antes de addResourceBundle, i18n:', i18n);

  try {
    i18n.addResourceBundle("es", "header", es);
    i18n.addResourceBundle("en", "header", en);
    console.log('[header namespace] addResourceBundle OK');
  } catch (err) {
    console.error('[header namespace] ERROR en addResourceBundle:', err);
  }

  registered = true;
}