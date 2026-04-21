// TODO: reemplazar con GET /api/medicos?especialidad=emergencias&turno=activo

export interface Medico {
  id:           string
  nombre:       string
  especialidad: string
  turno:        string
}

export const MEDICOS_MOCK: Medico[] = [
  { id: "m01", nombre: "Dr. Carlos Muñoz",      especialidad: "Emergencias",     turno: "Mañana"  },
  { id: "m02", nombre: "Dra. Ana Pérez",         especialidad: "Emergencias",     turno: "Mañana"  },
  { id: "m03", nombre: "Dr. Luis Castillo",      especialidad: "Traumatología",   turno: "Mañana"  },
  { id: "m04", nombre: "Dra. Patricia Torres",   especialidad: "Emergencias",     turno: "Tarde"   },
  { id: "m05", nombre: "Dr. Jorge Reyes",        especialidad: "Cardiología",     turno: "Tarde"   },
  { id: "m06", nombre: "Dra. Sandra Vega",       especialidad: "Emergencias",     turno: "Tarde"   },
  { id: "m07", nombre: "Dr. Rodrigo Mendoza",    especialidad: "Neurología",      turno: "Noche"   },
  { id: "m08", nombre: "Dra. Claudia Alvarado",  especialidad: "Emergencias",     turno: "Noche"   },
  { id: "m09", nombre: "Dr. Felipe Contreras",   especialidad: "Cirugía General", turno: "Noche"   },
  { id: "m10", nombre: "Dra. Viviana Flores",    especialidad: "Pediatría",       turno: "Mañana"  },
]

export function getMedicosMock(): Medico[] {
  return MEDICOS_MOCK
}
