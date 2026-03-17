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

interface Props {
  label:      string
  onClick?:   () => void
  fullWidth?: boolean
  color?:     "primary" | "secondary"
  type?:      "button" | "submit" | "reset"
  disabled?:  boolean
}

export const Button = ({
  label,
  onClick,
  fullWidth = false,
  color     = "primary",
  type      = "button",
  disabled  = false,
}: Props) => {
  return (
    <MuiButton
      variant="contained"
      color={color}
      onClick={onClick}
      fullWidth={fullWidth}
      type={type}
      disabled={disabled}
      sx={{ textTransform: "none", fontWeight: 700, py: "12px", fontSize: "1rem" }}
    >
      {label}
    </MuiButton>
  )
}