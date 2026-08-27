import { i18n } from "@hce/i18n-core";
import es from "./es/clinical-record.json";
import en from "./en/clinical-record.json";

let registered = false;

export function registerClinicalRecordNamespace() {
  console.log('[clinical-record namespace] llamando registerClinicalRecordNamespace, registered =', registered);
  if (registered) return;

  console.log('[clinical-record namespace] antes de addResourceBundle, i18n:', i18n);

  try {
    i18n.addResourceBundle("es", "clinical-record", es);
    i18n.addResourceBundle("en", "clinical-record", en);
    console.log('[clinical-record namespace] addResourceBundle OK');
  } catch (err) {
    console.error('[clinical-record namespace] ERROR en addResourceBundle:', err);
  }

  registered = true;
}