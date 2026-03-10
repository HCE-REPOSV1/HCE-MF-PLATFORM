/**
 * ---------------------------------------------------------
 * Component: Button
 * Author: Gregorovichz Carlos Rossi
 * Created: 09-03-2026
 * Description:
 * Wrapper del componente Button de Material UI utilizado
 * dentro del Design System de la aplicación.
 *
 * Objetivos:
 * - Estandarizar el uso de botones en todos los microfrontends
 * - Aplicar estilos consistentes del Design System
 * - Facilitar extensibilidad futura (themes, loading states, icons)
 *
 * Tecnologías:
 * - React
 * - TypeScript
 * - Material UI (MUI)
 *
 * Uso:
 * <Button label="Guardar" onClick={handleSave} />
 *
 * ---------------------------------------------------------
 */
import MuiButton from "@mui/material/Button"
/**
 * Props del componente Button
 */
interface Props {
  /**
   * Texto que se mostrará dentro del botón
   */
  label: string
  /**
   * Función que se ejecuta al hacer click
   */
  onClick?: () => void
}
/**
 * Componente Button
 *
 * Encapsula el botón de Material UI para mantener consistencia
 * visual y funcional dentro del Design System.
 */
export const Button = ({ label, onClick }: Props) => {
  return (
    <MuiButton
      variant="contained"
      color="primary"
      onClick={onClick}
      sx={{ textTransform: "none" }}
    >
      {label}
    </MuiButton>
  )
}