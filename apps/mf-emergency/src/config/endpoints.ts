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

} as const
