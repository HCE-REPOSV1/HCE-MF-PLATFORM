import { Footer as HceFooter } from "@hce/design-system";
import { registerFooterNamespace } from "./i18n";
import { useTranslation } from "@hce/i18n-core";
import { useEffect } from "react";
export default function Footer() {
  const year = new Date().getFullYear();
  const { t } = useTranslation("footer");
  useEffect(() => {
    registerFooterNamespace();
  }, []);
  const label = `© ${year} ${t("footer.label")}`
  return <HceFooter copyright={label} />;
}
