/**
 * ---------------------------------------------------------
 * Component: Emergency
 * Description:
 * Punto de entrada del microfrontend mf-emergency.
 * Este es el módulo expuesto via Module Federation y
 * consumido por el mf-shell en la ruta /emergency.
 *
 * Exportación Module Federation:
 *   exposes: { "./Emergency": "./src/Emergency.tsx" }
 *
 * Consumo en el shell:
 *   import Emergency from "emergency/Emergency"
 *   <Route path="/emergency" element={<Emergency />} />
 * ---------------------------------------------------------
 */
import EmergencyMonitor from "./EmergencyMonitor"

export default function Emergency() {
  return <EmergencyMonitor />
}
