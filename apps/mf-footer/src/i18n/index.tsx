import { i18n } from "@hce/i18n-core";
import es from "./es/footer.json";
import en from "./en/footer.json";

let registered = false;

export function registerFooterNamespace() {
  console.log('[footer namespace] llamando registerFooterNamespace, registered =', registered);
  if (registered) return;

  console.log('[footer namespace] antes de addResourceBundle, i18n:', i18n);

  try {
    i18n.addResourceBundle("es", "footer", es);
    i18n.addResourceBundle("en", "footer", en);
    console.log('[footer namespace] addResourceBundle OK');
  } catch (err) {
    console.error('[footer namespace] ERROR en addResourceBundle:', err);
  }

  registered = true;
}