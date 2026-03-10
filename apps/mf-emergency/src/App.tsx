/**
 * ---------------------------------------------------------
 * Component: App (standalone)
 * Description:
 * Wrapper para desarrollo standalone del Monitor de Emergencia.
 * Renderiza directamente EmergencyMonitor sin necesitar el shell.
 *
 * Ejecutar con: npm run dev (puerto 5005)
 * ---------------------------------------------------------
 */
import EmergencyMonitor from "./EmergencyMonitor"

export default function App() {
  return <EmergencyMonitor />
}
