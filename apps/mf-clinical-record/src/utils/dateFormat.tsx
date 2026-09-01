/**
 * Formatea una fecha ISO a DD/MM/YYYY. Devuelve "—" si la fecha es
 * nula, vacía, o inválida.
 */
export const formatDate = (
  isoDate: string | null | undefined,
): string => {
  if (!isoDate) return "—";
  const date = new Date(isoDate);
  if (Number.isNaN(date.getTime())) return "—";

  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();

  return `${day}/${month}/${year}`;
};

/**
 * Formatea una fecha ISO a DD/MM/YYYY - HH:mm. Devuelve "—" si la
 * fecha es nula, vacía, o inválida.
 */
export const formatDateTime = (
  isoDateTime: string | null | undefined,
): string => {
  if (!isoDateTime) return "—";
  const date = new Date(isoDateTime);
  if (Number.isNaN(date.getTime())) return "—";

  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");

  return `${day}/${month}/${year} - ${hours}:${minutes}`;
};