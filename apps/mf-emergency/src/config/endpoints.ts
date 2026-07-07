const AG_WEB_EMERGENCY = import.meta.env.VITE_APIGW_CNL_WEB_EMERGENCY
if (!AG_WEB_EMERGENCY) throw new Error('[mf-emergency] VITE_APIGW_CNL_WEB_EMERGENCY no está configurado')

export const ENDPOINTS = {

  emergencyMonitor: {
    public: (locationUuid: string, page: number, limit: number) =>
      `${AG_WEB_EMERGENCY}/api/v1/emergency-monitor/public?location_uuid=${locationUuid}&page=${page}&limit=${limit}`,
  },

} as const
