import type { PatientRecordAddress } from "../types/Patient.type";

/**
 * Concatena PatientSummaryAddressDto (address_line_1, address_line_2,
 * address_district, address_city, address_state, address_country) en una
 * sola línea de texto para mostrarla en PatientInfoModal/PatientField.
 * Omite los segmentos nulos/vacíos. Devuelve "-" si no hay dirección o
 * todos los segmentos vienen vacíos (mismo fallback que el resto de campos
 * mapeados en ClinicalRecord.tsx).
 */
export const formatAddress = (
  address: PatientRecordAddress | null | undefined,
): string => {
  if (!address) return "-";

  const parts = [
    address.address_line_1,
    address.address_line_2,
    address.address_district,
    address.address_city,
    address.address_state,
    address.address_country,
  ].filter((part): part is string => !!part && part.trim() !== "");

  return parts.length > 0 ? parts.join(", ") : "-";
};
