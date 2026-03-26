import { useNavigate }        from "react-router-dom"
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
  { Icon: Stethoscope,   label: "HCE Ambulatorio",  path: "/ambulatorio", permission: "module:ambulatorio" },
  { Icon: FileText,      label: "HCE Emergencia",   path: "/emergency",   permission: "module:emergency"   },
  { Icon: Building2,     label: "HCE Hospital",     path: "/hospital",    permission: "module:hospital"    },
  { Icon: ClipboardList, label: "Auditoria medica", path: "/auditoria",   permission: "module:auditoria"   },
]

// ─────────────────────────────────────────────────────────
export default function Home() {
  const navigate = useNavigate()

  const user = JSON.parse(sessionStorage.getItem("jarvis_user") ?? "{}") as {
    permissions?: string[]
  }
  const permissions  = user.permissions ?? []
  const visibleModules = MODULES.filter(m => permissions.includes(m.permission))

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
            md: `repeat(${visibleModules.length}, 1fr)`,
          },
          gap:      { xs: 2, md: 3 },
          width:    "100%",
          maxWidth: 900,
        }}
      >
        {visibleModules.map(({ Icon, label, path }) => (
          <Box
            key={label}
            onClick={() => navigate(path)}
            sx={{
              backgroundColor: baseColors.secondary,
              borderRadius:    "14px",
              display:         "flex",
              flexDirection:   "column",
              alignItems:      "center",
              justifyContent:  "center",
              gap:             { xs: 1.5, md: 2.5 },
              py:              { xs: 3.5, md: 5 },
              px:              2,
              cursor:          "pointer",
              transition:      "transform 0.15s ease, box-shadow 0.15s ease",
              boxShadow:       "0 4px 16px rgba(111,178,63,0.3)",
              "&:hover": {
                backgroundColor: baseColors.secondaryDark,
                transform:       "translateY(-4px)",
                boxShadow:       "0 8px 24px rgba(111,178,63,0.4)",
              },
              "&:active": { transform: "translateY(0)" },
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
        ))}
      </Box>
    </Box>
  )
}
