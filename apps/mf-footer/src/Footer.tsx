import { Footer as HceFooter } from "@hce/design-system";
import { useFooterNamespaceReady } from "./i18n";
import { useTranslation } from "@hce/i18n-core";

export default function Footer() {
  const year = new Date().getFullYear();
  const { t } = useTranslation("footer");

  // registerFooterNamespace() es asíncrono de verdad — sin esperar la
  // promesa, el primer render mostraría la clave cruda en vez del texto.
  const namespaceReady = useFooterNamespaceReady();

  // Todos los hooks ya corrieron arriba — recién acá se decide qué
  // renderizar según si el namespace terminó de cargar.
  if (!namespaceReady) {
    return null;
  }

  const label = `© ${year} ${t("footer.label")}`;
  return <HceFooter copyright={label} testId="mf-footer" />;
}
