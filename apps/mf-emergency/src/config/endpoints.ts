const AG_WEB_EMERGENCY = import.meta.env.VITE_APIGW_CNL_WEB_EMERGENCY
const AG_CLN_CROSS = import.meta.env.VITE_APIGW_CLN_CROSS
const CSI_GENDER = import.meta.env.VITE_CSI_GENDER




if (!AG_WEB_EMERGENCY) throw new Error('[mf-emergency] VITE_APIGW_CNL_WEB_EMERGENCY no está configurado')
if (!AG_CLN_CROSS) throw new Error('[mf-emergency] VITE_APIGW_CLN_CROSS no está configurado')
if (!CSI_GENDER) throw new Error('[mf-emergency] VITE_CSI_GENDER no está configurado')

export { CSI_GENDER };
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

  practitionerAssignment: {
    /** Pacientes activos con encounter activo y SIN médico (ATND) asignado todavía. */
    assignmentCandidates: (locationUuid: string, page = 1, limit = 20) =>
      `${AG_WEB_EMERGENCY}/api/v1/emergency-monitor/assignment-candidates?location_uuid=${locationUuid}&page=${page}&limit=${limit}`,
    /** Pacientes activos con médico (ATND) asignado, sin alta médica ni administrativa. */
    reassignmentCandidates: (locationUuid: string, page = 1, limit = 20) =>
      `${AG_WEB_EMERGENCY}/api/v1/emergency-monitor/reassignment-candidates?location_uuid=${locationUuid}&page=${page}&limit=${limit}`,
    /** Asigna/reasigna el médico (ATND) del encounter — mismo endpoint para ambos modos. */
    assign: (encounterId: number | string) =>
      `${AG_WEB_EMERGENCY}/api/v1/encounter/${encounterId}/assign-practitioner`,
  },
  catalogs: {
    ActivePrinciples: () => `${AG_CLN_CROSS}/api/v1/catalogs/active-principles`,
    ActivePrinciplesSearch: (text: string) =>
      `${AG_CLN_CROSS}/api/v1/catalogs/active-principles/search?text=${encodeURIComponent(text)}`,
    IdentifierTypes: (entityType: string) =>
      `${AG_CLN_CROSS}/api/v1/catalogs/identifier-types?entity_type=${encodeURIComponent(entityType)}`,
    TimeUnits: () => `${AG_CLN_CROSS}/api/v1/catalogs/time-units`,
    AgeGroups: () => `${AG_CLN_CROSS}/api/v1/catalogs/age-groups`,
    CodeSystemValues: (codeSystemId: string | number) =>
      `${AG_CLN_CROSS}/api/v1/catalogs/code-system-values?code_system_id=${codeSystemId}`,
  },

  encounter: {
    /** Obtener los datos de un paciente por su ID. */
    patientInfo: (encounterId: number) =>
      `${AG_WEB_EMERGENCY}/api/v1/encounter/${encounterId}/patient-summary`,


    allergyInfo:(encounterId:number)=>
       `${AG_WEB_EMERGENCY}/api/v1/encounter/${encounterId}/allergy-declaration`,

    updateAllergy:(encounterId:number)=>
      `${AG_WEB_EMERGENCY}/api/v1/encounter/${encounterId}/allergy-declaration`,


  },

  /** i18n — manifest público; namespace "emergency" protegido (requiere sesión) */
  i18n: {
    locales:   `${AG_CLN_CROSS}/api/v1/i18n/locales`,
    namespace: (locale: string, namespace: string) => `${AG_CLN_CROSS}/api/v1/i18n/${locale}/${namespace}`,
  },

} as const
