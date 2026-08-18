import { i18n } from "@hce/i18n-core";
import es from "./es/shell.json";
import en from "./en/shell.json";

let registered = false;

export function registerShellNamespace() {
  console.log('[shell namespace] llamando registerShellNamespace, registered =', registered);
  if (registered) return;

  console.log('[shell namespace] antes de addResourceBundle, i18n:', i18n);

  try {
    i18n.addResourceBundle("es", "shell", es);
    i18n.addResourceBundle("en", "shell", en);
    console.log('[shell namespace] addResourceBundle OK');
  } catch (err) {
    console.error('[shell namespace] ERROR en addResourceBundle:', err);
  }

  registered = true;
}