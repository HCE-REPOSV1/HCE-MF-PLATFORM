import { useNavigate }        from "react-router-dom"
import { useUser }            from "shell/UserContext"
import {
  Box, Typography,
  Button,
  Stethoscope, FileText, Building2, ClipboardList,
  HceConfigIcon,HceStarIcon,
  CarruselHome, HCEQuickAccess,
  hceColors, hceTypography,
} from "@hce/design-system"
import type { LucideIcon } from "@hce/design-system"

// ─── Imágenes del carrusel ────────────────────────────────
// Agrega imágenes JPG/PNG/WebP en src/assets/carousel/ y se cargan automáticamente
const carouselModules = import.meta.glob<{ default: string }>(
  "./assets/carousel/*.{jpg,jpeg,png,webp}",
  { eager: true }
)
const CAROUSEL_IMAGES: string[] = Object.values(carouselModules).map(m => m.default)

// Fallback: si no hay imágenes en la carpeta, usa la imagen original
import clinicBg from "./assets/clinic-bg.jpg"
const IMAGES = CAROUSEL_IMAGES.length > 0 ? CAROUSEL_IMAGES : [clinicBg]

// ─── Módulos disponibles ──────────────────────────────────
type Module = {
  Icon:        LucideIcon
  label:       string
  description: string
  path:        string
  permission:  string
}

const MODULES: Module[] = [
  {
    Icon:        FileText,
    label:       "HCE Emergencia",
    description: "Sección que abarca las funciones fundamentales del monitor de emergencia y los relatos de los pacientes.",
    path:        "/emergencia",
    permission:  "emergency:module",
  },
  {
    Icon:        Stethoscope,
    label:       "HCE Ambulatorio",
    description: "Gestión de citas, consultorios y atenciones ambulatorias del sistema de salud.",
    path:        "/ambulatorio",
    permission:  "ambulatorio:module",
  },
  {
    Icon:        Building2,
    label:       "HCE Hospital",
    description: "Control de hospitalización, camas disponibles, ingresos y altas médicas.",
    path:        "/hospital",
    permission:  "hospital:module",
  },
  {
    Icon:        ClipboardList,
    label:       "Auditoría",
    description: "Reportes, trazabilidad de eventos y configuración de parámetros del sistema.",
    path:        "/auditoria",
    permission:  "auditoria:module",
  },
]

// ─────────────────────────────────────────────────────────
export default function Home() {
  const navigate                    = useNavigate()
  const { permisos, hasPermission } = useUser()

  // DEBUG temporal — abre DevTools > Console para ver los códigos reales de MAC
  console.log('[Home] permisos MAC →', permisos)

  const canAccess = (codigo: string): boolean => hasPermission(codigo)

  return (
    <Box sx={{
      p:             { xs: 2, sm: 3 },
      display:       "flex",
      flexDirection: "column",
      gap:           2.5,
      minHeight:     "100%",
    }}>

      {/* ── Bienvenida ────────────────────────────────────── */}
      <Typography sx={{
        fontFamily: hceTypography.fontFamily,
        fontSize:   "0.85rem",
        fontWeight: 600,
        color:      hceColors.primary.blue[500],
      }}>
        Bienvenido a las Historias Clínicas
      </Typography>

      {/* ── Carrusel ──────────────────────────────────────── */}
      <CarruselHome
        images={IMAGES}
        height={300}
        autoPlaySeconds={6}
        objectFit="contain" 
      />

      {/* ── Cabecera Accesos Rápidos ───────────────────────── */}
      <Box sx={{
        display:        "flex",
        alignItems:     "flex-start",
        justifyContent: "space-between",
        flexWrap:       "wrap",
        gap:            1,
        mt:             0.5,
      }}>
        {/* Izquierda */}
        <Box>
          <Typography sx={{
            fontFamily: hceTypography.fontFamily,
            fontWeight: 700,
            fontSize:   "1.35rem",
            color:      hceColors.primary.green[600],
            lineHeight: 1.2,
          }}>
            Accesos Rápidos
          </Typography>
          <Typography sx={{
            fontFamily: hceTypography.fontFamily,
            fontSize:   "0.82rem",
            color:      hceColors.primary.blue[600],
            mt:         "2px",
          }}>
            Secciones más utilizadas del sistema
          </Typography>
        </Box>

        {/* Derecha — botones */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, pt: "2px" }}>
          <Button
            size="sm"
            label="Reordenar"
            startIcon={<HceConfigIcon size={14}color={hceColors.neutro.white[50]}/>}
            color={hceColors.primary.blue[600]}
          />
          <Button
            variant="outlined"
            size="sm"
            label="Personalizar"
            startIcon={<HceStarIcon size={14}color={hceColors.primary.blue[600]}/>}
            color={hceColors.primary.blue[600]}
          />
          {/* <Button
            variant="outlined"
            size="sm"
            startIcon={<HceStarIcon size={14} />}
            sx={{
              fontFamily:  hceTypography.fontFamily,
              fontWeight:  500,
              fontSize:    "0.8rem",
              borderColor: hceColors.primary.blue[300],
              color:       hceColors.primary.blue[600],
              borderRadius: "8px",
              px:          1.5,
              "&:hover": {
                backgroundColor: hceColors.primary.blue[50],
                borderColor:     hceColors.primary.blue[500],
              },
            }}
          >
            Personalizar
          </Button> */}
        </Box>
      </Box>

      {/* ── Grid de cards ─────────────────────────────────── */}
      <Box sx={{
        display:             "grid",
        gridTemplateColumns: {
          xs: "1fr",
          sm: "repeat(2, 1fr)",
          md: "repeat(3, 1fr)",
          lg: "repeat(4, 1fr)",
        },
        gap:       2,
        alignItems: "stretch",
      }}>
        {MODULES.map(({ Icon, label, description, path, permission }) => {
          const enabled = canAccess(permission)
          return (
            <HCEQuickAccess
              key={path}
              icon={<Icon size={24} />}
              title={label}
              description={description}
              disabled={!enabled}
              onAcceder={() => navigate(path)}
            />
          )
        })}
      </Box>

    </Box>
  )
}
