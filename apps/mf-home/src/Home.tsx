import { useNavigate }        from "react-router-dom"
import { useUser }            from "shell/UserContext"
import {
  Box, Typography,
  Stethoscope, FileText, Building2, ClipboardList,
} from "@hce/design-system"
import type { LucideIcon } from "@hce/design-system"
import { baseColors }        from "@hce/design-system"
import clinicBg              from "./assets/clinic-bg.jpg"

// ─── Definición de módulos ────────────────────────────────
type Module = {
  Icon:       LucideIcon
  label:      string
  path:       string
  permission: string
}

const MODULES: Module[] = [
  { Icon: FileText,      label: "HCE Emergencia",  path: "/emergency",   permission: "01" },
  { Icon: Stethoscope,   label: "HCE Ambulatorio", path: "/ambulatorio", permission: "02" },
  { Icon: Building2,     label: "HCE Hospital",    path: "/hospital",    permission: "04" },
  { Icon: ClipboardList, label: "Auditoría",        path: "/auditoria",   permission: "03" },
]

// ─────────────────────────────────────────────────────────
export default function Home() {
  const navigate         = useNavigate()
  const { permisos }     = useUser()

  // Devuelve el indicador del permiso raíz del módulo ('E', 'L', 'O', o '' si no existe)
  const getIndicador = (codigo: string): string =>
    permisos.find(p => p.codigo === codigo)?.indicador ?? ''

  // E = activo, L = lectura (tratar como activo), O = inactivo / sin permiso = deshabilitado
  const canAccess = (codigo: string): boolean => {
    const ind = getIndicador(codigo)
    return ind === 'E' || ind === 'L'
  }

  return (
    <Box
      sx={{
        minHeight:          "100%",
        backgroundImage:    `url(${clinicBg})`,
        backgroundSize:     "cover",
        backgroundPosition: "center",
        display:            "flex",
        alignItems:         "center",
        justifyContent:     "center",
        position:           "relative",
        px:                 3,
        py:                 6,
      }}
    >
      {/* Overlay blanco para atenuar la imagen */}
      <Box sx={{
        position:        "absolute",
        inset:           0,
        backgroundColor: "rgba(255,255,255,0.72)",
      }} />

      {/* Grid de módulos */}
      <Box
        sx={{
          position:            "relative",
          zIndex:              1,
          display:             "grid",
          gridTemplateColumns: {
            xs: "repeat(2, 1fr)",
            md: `repeat(${MODULES.length}, 1fr)`,
          },
          gap:      { xs: 2, md: 3 },
          width:    "100%",
          maxWidth: 900,
        }}
      >
        {MODULES.map(({ Icon, label, path, permission }) => {
          const enabled = canAccess(permission)
          return (
          <Box
            key={label}
            onClick={() => enabled && navigate(path)}
            sx={{
              backgroundColor: enabled ? baseColors.secondary : "#c8c8c8",
              borderRadius:    "14px",
              display:         "flex",
              flexDirection:   "column",
              alignItems:      "center",
              justifyContent:  "center",
              gap:             { xs: 1.5, md: 2.5 },
              py:              { xs: 3.5, md: 5 },
              px:              2,
              cursor:          enabled ? "pointer" : "not-allowed",
              opacity:         enabled ? 1 : 0.55,
              transition:      "transform 0.15s ease, box-shadow 0.15s ease",
              boxShadow:       enabled ? "0 4px 16px rgba(111,178,63,0.3)" : "none",
              "&:hover": enabled ? {
                backgroundColor: baseColors.secondaryDark,
                transform:       "translateY(-4px)",
                boxShadow:       "0 8px 24px rgba(111,178,63,0.4)",
              } : {},
              "&:active": enabled ? { transform: "translateY(0)" } : {},
            }}
          >
            {/* Círculo con ícono */}
            <Box sx={{
              width:           72,
              height:          72,
              borderRadius:    "50%",
              backgroundColor: "rgba(255,255,255,0.25)",
              display:         "flex",
              alignItems:      "center",
              justifyContent:  "center",
            }}>
              <Icon size={36} color="white" strokeWidth={1.5} />
            </Box>

            {/* Etiqueta */}
            <Typography sx={{
              color:      "white",
              fontWeight: 600,
              fontSize:   "0.95rem",
              textAlign:  "center",
              lineHeight: 1.3,
            }}>
              {label}
            </Typography>
          </Box>
        )})}
      </Box>
    </Box>
  )
}
