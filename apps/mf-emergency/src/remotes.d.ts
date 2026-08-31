//─── Triage ──────────────────────────────────────────
declare module "triage/Triage" {
  import type { ComponentType } from "react";
  import type { SearchMode, SearchOption, TriagePriority } from "@hce/design-system";

  export interface TriajeForm {
    // Datos del paciente
    tipoDoc:          string
    numeroDoc:        string
    noIdentificado:   boolean
    nombres:          string
    apellidoPaterno:  string
    apellidoMaterno:  string
    fechaNacimiento:  string
    sexo:             string
    grupoEtario:      string
    // Datos clínicos
    modoMotivo:       SearchMode
    motivoQuery:      string
    motivoSelected:   SearchOption | null
    aislamiento:      string
    gestante:         string
    furEnabled:       boolean
    fur:              string
    tiempoEnfermedad: string
    tiempoUnidad:     string
    comentarios:      string
    // Signos vitales
    traumaShock:      boolean
    noSV:             boolean
    peso:             string
    talla:            string
    frCardiaca:       string
    frRespiratoria:   string
    pSistolica:       string
    pDiastolica:      string
    temperatura:      string
    saturacionO2:     string
    glasgow:          { ocular: string; verbal: string; motora: string }
    fast:             { cara: string; brazos: string; habla: string; tiempo: string }
    // Alergias
    tieneAlergia:     string
    principioActivo:  string
    alimentos:        string
    otrosAlergias:    string
    // EVA
    dolEva:           number | null
    // Triaje
    prioridad:        TriagePriority | null
  }

  export interface TriageProps {
    open:       boolean
    onClose:    () => void
    onGuardar?: (form: TriajeForm) => void
    /** "read" = solo lectura (botón Prioridad en grilla, precarga con GET /triage/:id/full) | "write" = crear triaje (menú superior). */
    mode?:      "read" | "write"
    /** triage_id a precargar en modo "read" (viene de MonitorTableRow.triage_id). */
    triageId?:  number | string
  }

  const Triage: ComponentType<TriageProps>;
  export default Triage;
}

declare module "clinicalRecord/ClinicalRecord" {
  import type { ComponentType } from "react";

  /**
   * ClinicalRecord no recibe props: lee el paciente/encounter activo del
   * router state (useLocation().state.patient), igual que la antigua
   * ClinicalRecordPage — funciona porque react-router-dom es dependencia
   * compartida (singleton) entre mf-emergency y mf-clinical-record en
   * Module Federation. El navigate("historiacli", { state: { patient: row } })
   * ya existente en MonitorPage sigue siendo quien setea ese state.
   */
  export type ClinicalRecordProps = Record<string, never>;

  const ClinicalRecord: ComponentType<ClinicalRecordProps>;
  export default ClinicalRecord;
}