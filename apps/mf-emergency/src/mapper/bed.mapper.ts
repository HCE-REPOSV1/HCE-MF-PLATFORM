import type { BedAvailabilityItem, BedAvailabilityStatus } from "@hce/design-system"

/** Cama tal como la devuelve GET /encounter/beds/board (ms-cnl-web-hce-encounter). */
export interface BedApiItem {
  bed_id: number
  bed_code: string
  bed_status: string
  bed_status_display?: string | null
  bed_status_color?: string | null
}

// bed_status (ms-bs-core-location, inglés) -> status de negocio que espera BedAvailabilityDrawerV2 (español).
const BED_STATUS_MAP: Record<string, BedAvailabilityStatus> = {
  available:                "disponible",
  occupied:                 "ocupado",
  housekeeping:              "housekeeping",
  maintenance:               "mantenimiento",
  administrative_discharge:  "altaAdministrativa",
}

export function mapBedApiItemToAvailabilityItem(bed: BedApiItem): BedAvailabilityItem {
  return {
    id:     String(bed.bed_id),
    code:   bed.bed_code,
    status: BED_STATUS_MAP[bed.bed_status] ?? bed.bed_status,
    // color_code viene del catálogo (catalog.bed_status) — tiene prioridad sobre `status`
    // en BedAvailabilityDrawerV2, así el color siempre sale de la BD y nunca de un mapeo local.
    color:  bed.bed_status_color ?? undefined,
    ariaLabel: bed.bed_status_display ? `${bed.bed_code} — ${bed.bed_status_display}` : undefined,
  }
}
