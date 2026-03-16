/**
 * ---------------------------------------------------------
 * Component: Home
 * Author: Gregorovichz Carlos Rossi
 * Created: 09-03-2026
 * Description:
 * Componente responsable de representar la vista principal
 * (Home o Dashboard) de la plataforma Jarvis.
 *
 * Esta página actúa como punto de entrada para los usuarios
 * autenticados dentro del sistema y normalmente contiene
 * información resumida, accesos rápidos a módulos y
 * métricas relevantes del negocio.
 *
 * Responsabilidades:
 * - Mostrar la vista principal del sistema
 * - Servir como punto de acceso a los módulos funcionales
 * - Presentar información general de la plataforma
 *
 * Arquitectura:
 * Este componente forma parte de un microfrontend que es
 * consumido por el Shell mediante Module Federation.
 *
 * Ubicación en la navegación:
 *
 * Layout
 *   └── /home
 *        └── Home Component
 *
 * Tecnologías:
 * - React
 * - Microfrontend Architecture
 * ---------------------------------------------------------
 */

/**
 * Componente Home
 *
 * Representa la página principal de la aplicación.
 */
import { DataTable } from "@design-system"
import { Pagination } from "@design-system"

const columns = [
  { field: "patient", header: "Paciente" },
  { field: "age", header: "Edad" },
  { field: "doctor", header: "Doctor" }
]

const rows = [
  {
    patient: "Henry Vidal",
    age: "30",
    doctor: "Adulto"
  },
  {
    patient: "Juan Perez",
    age: "45",
    doctor: "Pediatría"
  }
]

export default function Home() {

  return (
    <div>
      <h2>Monitor de Emergencia</h2>
      <DataTable
        columns={columns}
        rows={rows}
      />
      <Pagination
        page={1}
        total={10}
        onChange={() => {}}
      />
    </div>
  )
}