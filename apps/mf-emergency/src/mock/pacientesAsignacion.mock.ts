// TODO: reemplazar getPacientesSinMedicoMock() por GET /api/pacientes/sin-medico
// TODO: reemplazar getPacientesConMedicoMock() por GET /api/pacientes/con-medico
// Ambos endpoints devuelven complete_name + encounter_id; el de "con médico"
// agrega physician_name (nombre del médico ya asignado, para mostrarlo en el
// modal de reasignación).

export interface PacienteSinMedico {
  complete_name: string
  encounter_id:  number
}

export interface PacienteConMedico extends PacienteSinMedico {
  physician_name: string
}

const PACIENTES_SIN_MEDICO_MOCK: PacienteSinMedico[] = [
  { complete_name: "Rosa Elvira Quispe Mamani",     encounter_id: 1001 },
  { complete_name: "Julio César Fernández Rojas",   encounter_id: 1002 },
  { complete_name: "Mariana Isabel Torres Del Solar", encounter_id: 1003 },
]

const PACIENTES_CON_MEDICO_MOCK: PacienteConMedico[] = [
  { complete_name: "Fernando Gutiérrez Salazar", encounter_id: 2001, physician_name: "Carlos Muñoz" },
  { complete_name: "Lucía Beatriz Cárdenas Vidal", encounter_id: 2002, physician_name: "Ana Pérez" },
  { complete_name: "Miguel Ángel Ramos Chávez",   encounter_id: 2003, physician_name: "Sandra Vega" },
]

export function getPacientesSinMedicoMock(): PacienteSinMedico[] {
  return PACIENTES_SIN_MEDICO_MOCK
}

export function getPacientesConMedicoMock(): PacienteConMedico[] {
  return PACIENTES_CON_MEDICO_MOCK
}
