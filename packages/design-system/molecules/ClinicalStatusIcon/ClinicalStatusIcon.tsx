/**
 * ---------------------------------------------------------
 * Component: ClinicalStatusIcon
 * Author: Design System - Emergency Monitor
 * Created: 09-03-2026
 * Description:
 * Ícono de estado para columnas clínicas de la tabla de pacientes:
 * Laboratorio (Lab), Imágenes (Img), Indicación Médica (Indc.Med),
 * e Interconsulta (Interc.)
 * Combina MUI Box + Tooltip + SvgIcon → molecule.
 *
 * Estados disponibles:
 *   alert   → fondo naranja claro, ícono naranja — pendiente/alerta
 *   ok      → fondo verde claro,   ícono verde   — completado/normal
 *   urgent  → fondo rojo claro,    ícono rojo    — urgente
 *   empty   → sin fondo, sin ícono               — sin registro
 *
 * Uso:
 *   import ScienceOutlinedIcon from "@mui/icons-material/ScienceOutlined"
 *   <ClinicalStatusIcon status="ok" icon={ScienceOutlinedIcon} />
 *   <ClinicalStatusIcon status="alert" icon={ScienceOutlinedIcon} tooltipLabel="Lab pendiente" />
 * ---------------------------------------------------------
 */
import { Box, Tooltip } from "@mui/material"
import type { SvgIconComponent } from "@mui/icons-material"
import { emergencyTokens } from "../../tokens/emergency.tokens"

export type ClinicalIconStatus = "alert" | "ok" | "urgent" | "empty"

interface StatusConfig {
  bg:    string
  color: string
  label: string
}

const STATUS_CONFIG: Record<ClinicalIconStatus, StatusConfig> = {
  alert: {
    bg:    emergencyTokens.colors.iconAlertBg,
    color: emergencyTokens.colors.iconAlert,
    label: "Pendiente / Alerta",
  },
  ok: {
    bg:    emergencyTokens.colors.iconOkBg,
    color: emergencyTokens.colors.iconOk,
    label: "Completado",
  },
  urgent: {
    bg:    emergencyTokens.colors.iconUrgentBg,
    color: emergencyTokens.colors.iconUrgent,
    label: "Urgente",
  },
  empty: {
    bg:    "transparent",
    color: "transparent",
    label: "",
  },
}

interface Props {
  /** Estado clínico del estudio */
  status: ClinicalIconStatus
  /** Componente de ícono MUI (SvgIconComponent) */
  icon: SvgIconComponent
  /** Texto descriptivo para el tooltip (opcional, sobreescribe el label por defecto) */
  tooltipLabel?: string
}

export const ClinicalStatusIcon = ({ status, icon: Icon, tooltipLabel }: Props) => {
  const config = STATUS_CONFIG[status]

  if (status === "empty") {
    return <Box sx={{ width: 28, height: 28, flexShrink: 0 }} aria-hidden="true" />
  }

  return (
    <Tooltip
      title={tooltipLabel ?? config.label}
      placement="top"
    >
      <Box
        sx={{
          width:           28,
          height:          28,
          borderRadius:    emergencyTokens.borderRadius.md,
          backgroundColor: config.bg,
          display:         "flex",
          alignItems:      "center",
          justifyContent:  "center",
          flexShrink:      0,
          cursor:          "default",
        }}
        role="img"
        aria-label={tooltipLabel ?? config.label}
      >
        <Icon sx={{ fontSize: 16, color: config.color }} />
      </Box>
    </Tooltip>
  )
}
