export interface LocalizedCatalogItem {
  display_es?: string | null;
  display_en?: string | null;
  display_pt?: string | null;
}

/**
 * Obtiene el nombre localizado de un elemento de catálogo.
 * Español se utiliza como respaldo cuando el idioma solicitado no existe.
 */
export function getLocalizedCatalogDisplay(
  item: LocalizedCatalogItem | null | undefined,
  language: string | null | undefined,
  fallback = "-",
): string {
  if (!item) return fallback;

  const normalizedLanguage = language?.toLowerCase().split("-")[0];

  const localizedDisplay =
    normalizedLanguage === "en"
      ? item.display_en
      : normalizedLanguage === "pt"
        ? item.display_pt
        : item.display_es;

  return (
    localizedDisplay ||
    item.display_es ||
    item.display_en ||
    item.display_pt ||
    fallback
  );
}