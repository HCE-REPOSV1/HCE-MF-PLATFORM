const AG_WEB_EMERGENCY = import.meta.env.VITE_APIGW_CNL_WEB_EMERGENCY
if (!AG_WEB_EMERGENCY) throw new Error('[mf-emergency] VITE_APIGW_CNL_WEB_EMERGENCY no está configurado')

export const ENDPOINTS = {

  emergencyMonitor: {
    /** Pantalla pública (TV sala de espera) — sin sesión, respuesta cifrada AES-GCM. */
    public: (locationUuid: string, page: number, limit: number) =>
      `${AG_WEB_EMERGENCY}/api/v1/emergency-monitor/public?location_uuid=${locationUuid}&page=${page}&limit=${limit}`,
    /** Dashboard logueado — requiere sesión (JwtAuthGuard), respuesta plana sin cifrar. */
    porSede: (locationUuid: string, page: number, limit: number) =>
      `${AG_WEB_EMERGENCY}/api/v1/emergency-monitor/por-sede?location_uuid=${locationUuid}&page=${page}&limit=${limit}`,
  },

  // El gateway apigw-cnl-web-emergency (mismo AG_WEB_EMERGENCY) también proxea
  // encounter/* hacia ms-cnl-web-hce-encounter (ver CNL_ENCOUNTER_URL en su .env).
  bedManagement: {
    /** Camas de la sede con color por estado (ocupado/altaAdministrativa/housekeeping/mantenimiento/disponible). */
    board: (locationId: number | string) =>
      `${AG_WEB_EMERGENCY}/api/v1/encounter/beds/board?location_id=${locationId}`,
    /** Solo camas con bed_status=available de la sede. */
    available: (locationId: number | string) =>
      `${AG_WEB_EMERGENCY}/api/v1/encounter/beds/available?location_id=${locationId}`,
    /** Reasignar la cama de un encounter (libera la actual, ocupa la nueva). */
    reassign: () => `${AG_WEB_EMERGENCY}/api/v1/encounter/beds/reassign`,
  },

} as const
