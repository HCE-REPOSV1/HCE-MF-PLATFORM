// ─── Mock de búsqueda de pacientes por documento ─────────────────────────────
// TODO: reemplazar con llamada a endpoint GET /api/pacientes?tipo={tipo}&numero={numero}

export interface PacienteBuscado {
  nombres:          string
  apellidoPaterno:  string
  apellidoMaterno:  string
  fechaNacimiento:  string
  sexo:             string
}

const PACIENTES_MOCK: Record<string, PacienteBuscado> = {
  "12345678": { nombres: "Alejandro",   apellidoPaterno: "Vera",       apellidoMaterno: "Ríos",      fechaNacimiento: "15/03/1966", sexo: "M" },
  "15789012": { nombres: "Carolina",    apellidoPaterno: "Mardones",   apellidoMaterno: "Lagos",     fechaNacimiento: "22/07/1990", sexo: "F" },
  "11456789": { nombres: "Roberto",     apellidoPaterno: "Fuentes",    apellidoMaterno: "Soto",      fechaNacimiento: "08/11/1957", sexo: "M" },
  "17234567": { nombres: "Valentina",   apellidoPaterno: "Espinoza",   apellidoMaterno: "Muñoz",     fechaNacimiento: "14/05/1996", sexo: "F" },
  "13678901": { nombres: "Eduardo",     apellidoPaterno: "Morales",    apellidoMaterno: "Castillo",  fechaNacimiento: "30/09/1979", sexo: "M" },
  "09345678": { nombres: "Patricia",    apellidoPaterno: "Núñez",      apellidoMaterno: "Andrade",   fechaNacimiento: "02/01/1952", sexo: "F" },
}

export function buscarPacienteMock(numero: string): PacienteBuscado | null {
  return PACIENTES_MOCK[numero.trim()] ?? null
}

// ─── Mock de diagnósticos CIE-10 ─────────────────────────────────────────────
// TODO: reemplazar con GET /api/diagnosticos?q={query}&modo=nombre|cie10

export interface DiagnosticoCIE10 {
  codigo: string
  nombre: string
}

export const DIAGNOSTICOS_MOCK: DiagnosticoCIE10[] = [
  { codigo: "J06.9", nombre: "Infección aguda de vías respiratorias superiores" },
  { codigo: "J18.9", nombre: "Neumonía, no especificada" },
  { codigo: "J20.9", nombre: "Bronquitis aguda, no especificada" },
  { codigo: "A09",   nombre: "Gastroenteritis y colitis de origen infeccioso" },
  { codigo: "K35.8", nombre: "Apendicitis aguda sin peritonitis" },
  { codigo: "K29.7", nombre: "Gastritis, no especificada" },
  { codigo: "I10",   nombre: "Hipertensión esencial (primaria)" },
  { codigo: "I21.9", nombre: "Infarto agudo de miocardio, no especificado" },
  { codigo: "E11.9", nombre: "Diabetes mellitus tipo 2 sin complicaciones" },
  { codigo: "E10.9", nombre: "Diabetes mellitus tipo 1 sin complicaciones" },
  { codigo: "N39.0", nombre: "Infección de vías urinarias, sitio no especificado" },
  { codigo: "N23",   nombre: "Cólico renal, no especificado" },
  { codigo: "R07.4", nombre: "Dolor torácico, no especificado" },
  { codigo: "R51",   nombre: "Cefalea" },
  { codigo: "R55",   nombre: "Síncope y colapso" },
  { codigo: "S06.0", nombre: "Conmoción cerebral" },
  { codigo: "T14.9", nombre: "Traumatismo, no especificado" },
  { codigo: "Z03.8", nombre: "Observación por otras enfermedades sospechosas" },
]

export function buscarDiagnosticoMock(query: string, modo: "nombre" | "cie10"): DiagnosticoCIE10[] {
  const q = query.toLowerCase()
  if (modo === "cie10") {
    return DIAGNOSTICOS_MOCK.filter(d => d.codigo.toLowerCase().startsWith(q))
  }
  return DIAGNOSTICOS_MOCK.filter(d => d.nombre.toLowerCase().includes(q))
}

// ─── Mock de principios activos (alergias) ────────────────────────────────────
// TODO: reemplazar con GET /api/principios-activos?q={query}

export interface PrincipioActivo {
  id:     string
  nombre: string
}

export const PRINCIPIOS_ACTIVOS_MOCK: PrincipioActivo[] = [
  { id: "penicilina",    nombre: "Penicilina" },
  { id: "amoxicilina",   nombre: "Amoxicilina" },
  { id: "ampicilina",    nombre: "Ampicilina" },
  { id: "ibuprofeno",    nombre: "Ibuprofeno" },
  { id: "paracetamol",   nombre: "Paracetamol" },
  { id: "aspirina",      nombre: "Ácido acetilsalicílico (Aspirina)" },
  { id: "diclofenaco",   nombre: "Diclofenaco" },
  { id: "metamizol",     nombre: "Metamizol (Dipirona)" },
  { id: "ceftriaxona",   nombre: "Ceftriaxona" },
  { id: "ciprofloxacino",nombre: "Ciprofloxacino" },
  { id: "metronidazol",  nombre: "Metronidazol" },
  { id: "sulfas",        nombre: "Sulfonamidas" },
  { id: "contraste",     nombre: "Medio de contraste yodado" },
  { id: "latex",         nombre: "Látex" },
]

export function buscarPrincipioActivoMock(query: string): PrincipioActivo[] {
  const q = query.toLowerCase()
  return PRINCIPIOS_ACTIVOS_MOCK.filter(p => p.nombre.toLowerCase().includes(q))
}
