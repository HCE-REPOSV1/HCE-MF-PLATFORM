/**
 * ---------------------------------------------------------
 * Component: IconButton
 * Author: Design System
 * Description:
 * Botón icon-only genérico. Acepta cualquier ReactNode como
 * ícono → molecule (envuelve MUI IconButton + ícono externo).
 *
 * Uso:
 *   import InfoIcon from "@mui/icons-material/Info"
 *   <IconButton icon={<InfoIcon />} onClick={handleClick} />
 * ---------------------------------------------------------
 */
import MuiIconButton from "@mui/material/IconButton"
import type { ReactNode } from "react"

interface Props {
  /** Ícono a mostrar dentro del botón */
  icon:      ReactNode
  onClick?:  () => void
  disabled?: boolean
  size?:     "small" | "medium" | "large"
}

export const IconButton = ({ icon, onClick, disabled, size = "medium" }: Props) => {
  return (
    <MuiIconButton onClick={onClick} disabled={disabled} size={size}>
      {icon}
    </MuiIconButton>
  )
}
