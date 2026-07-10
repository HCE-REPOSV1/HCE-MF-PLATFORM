// TODO: reemplazar con GET /api/medicos?especialidad=emergencias&turno=activo

export interface Medico {
  id:           string
  nombre:       string
  especialidad: string
  turno:        string
}

export const MEDICOS_MOCK: Medico[] = [
  { id: "m01", nombre: "Carlos Muñoz",      especialidad: "Emergencias",     turno: "Mañana"  },
  { id: "m02", nombre: "Ana Pérez",         especialidad: "Emergencias",     turno: "Mañana"  },
  { id: "m03", nombre: "Luis Castillo",      especialidad: "Traumatología",   turno: "Mañana"  },
  { id: "m04", nombre: "Patricia Torres",   especialidad: "Emergencias",     turno: "Tarde"   },
  { id: "m05", nombre: "Jorge Reyes",        especialidad: "Cardiología",     turno: "Tarde"   },
  { id: "m06", nombre: "Sandra Vega",       especialidad: "Emergencias",     turno: "Tarde"   },
  { id: "m07", nombre: "Rodrigo Mendoza",    especialidad: "Neurología",      turno: "Noche"   },
  { id: "m08", nombre: "Claudia Alvarado",  especialidad: "Emergencias",     turno: "Noche"   },
  { id: "m09", nombre: "Felipe Contreras",   especialidad: "Cirugía General", turno: "Noche"   },
  { id: "m10", nombre: "Viviana Flores",    especialidad: "Pediatría",       turno: "Mañana"  },
]

export function getMedicosMock(): Medico[] {
  return MEDICOS_MOCK
}
