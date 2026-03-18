import { useState }       from "react"
import { useNavigate }    from "react-router-dom"
import {
  Box, Typography,
  TextInput, PasswordInput, SelectField, Button,
  baseColors,
  Syringe, Heart, Pill, Plus, Activity,
  Stethoscope, Bandage, Asterisk, FlaskConical, Thermometer,
  User, Lock,
} from "@jarvis/design-system"
import type { LucideIcon } from "@jarvis/design-system"

// ─── Background icon map ──────────────────────────────────
type BgIconDef = { Icon: LucideIcon; top: number; left: number; rotate: number }

const BG_ICONS: BgIconDef[] = [
  // Row 1 – top
  { Icon: Activity,    top:  4, left:  3, rotate:   0 },
  { Icon: Stethoscope, top:  4, left: 13, rotate: -10 },
  { Icon: Activity,    top:  3, left: 37, rotate:   0 },
  { Icon: Syringe,     top:  3, left: 55, rotate: -40 },
  { Icon: Stethoscope, top:  4, left: 65, rotate:  15 },
  { Icon: Syringe,     top:  3, left: 79, rotate: -30 },
  { Icon: Heart,       top:  4, left: 90, rotate:   0 },
  // Row 2
  { Icon: Pill,        top: 18, left:  1, rotate:  20 },
  { Icon: Plus,        top: 18, left: 15, rotate:   0 },
  { Icon: Bandage,     top: 18, left: 26, rotate:  10 },
  { Icon: Plus,        top: 18, left: 45, rotate:   0 },
  { Icon: Bandage,     top: 18, left: 62, rotate: -10 },
  { Icon: Pill,        top: 19, left: 72, rotate:  25 },
  { Icon: Plus,        top: 18, left: 82, rotate:   0 },
  { Icon: Bandage,     top: 18, left: 93, rotate:  10 },
  // Row 3
  { Icon: Plus,        top: 34, left:  2, rotate:   0 },
  { Icon: Pill,        top: 35, left: 13, rotate:  15 },
  { Icon: Plus,        top: 34, left: 25, rotate:   0 },
  { Icon: Plus,        top: 34, left: 45, rotate:   0 },
  { Icon: Pill,        top: 35, left: 62, rotate: -20 },
  { Icon: Syringe,     top: 34, left: 73, rotate:  30 },
  { Icon: Plus,        top: 34, left: 84, rotate:   0 },
  // Row 4
  { Icon: FlaskConical,top: 51, left:  2, rotate:  10 },
  { Icon: Asterisk,    top: 51, left: 15, rotate:   0 },
  { Icon: Bandage,     top: 51, left: 26, rotate: -10 },
  { Icon: Plus,        top: 51, left: 45, rotate:   0 },
  { Icon: Asterisk,    top: 51, left: 62, rotate:   0 },
  { Icon: Bandage,     top: 51, left: 72, rotate:  15 },
  { Icon: Plus,        top: 51, left: 83, rotate:   0 },
  { Icon: Thermometer, top: 51, left: 93, rotate:   0 },
  // Row 5
  { Icon: Pill,        top: 68, left:  3, rotate:  25 },
  { Icon: Plus,        top: 68, left: 15, rotate:   0 },
  { Icon: Syringe,     top: 67, left: 26, rotate: -25 },
  { Icon: Plus,        top: 68, left: 45, rotate:   0 },
  { Icon: Pill,        top: 68, left: 62, rotate:  10 },
  { Icon: Syringe,     top: 67, left: 72, rotate:  20 },
  { Icon: Plus,        top: 68, left: 83, rotate:   0 },
  // Row 6 – bottom
  { Icon: Stethoscope, top: 84, left:  2, rotate:   0 },
  { Icon: Plus,        top: 84, left: 36, rotate:   0 },
  { Icon: Pill,        top: 84, left: 57, rotate:  15 },
  { Icon: Syringe,     top: 83, left: 82, rotate: -30 },
]

const EMPRESA_OPTIONS = [
  { value: "CENTRAL", label: "Sede Central" },
  { value: "NORTE",   label: "Sede Norte"   },
]

// ─────────────────────────────────────────────────────────
export default function Login() {
  const navigate = useNavigate()

  const [empresa,  setEmpresa]  = useState("")
  const [usuario,  setUsuario]  = useState("")
  const [password, setPassword] = useState("")

  const handleLogin = async () => {
    const res  = await fetch("/mocks/login.json")
    const data = await res.json()
    if (data.success) {
      sessionStorage.setItem("jarvis_user", JSON.stringify(data.user))
      navigate("/home")
    }
  }

  return (
    <Box sx={{
      minHeight:       "100vh",
      backgroundColor: baseColors.primaryLight,
      display:         "flex",
      alignItems:      "center",
      justifyContent:  "center",
      position:        "relative",
      overflow:        "hidden",
    }}>

      {/* ── Iconos médicos de fondo ── */}
      {BG_ICONS.map(({ Icon, top, left, rotate }, i) => (
        <Box
          key={i}
          sx={{
            position:      "absolute",
            top:           `${top}%`,
            left:          `${left}%`,
            transform:     `rotate(${rotate}deg)`,
            color:         "#B8CCE8",
            pointerEvents: "none",
            userSelect:    "none",
          }}
        >
          <Icon size={28} strokeWidth={1.5} />
        </Box>
      ))}

      {/* ── Wrapper de tarjeta ── */}
      <Box sx={{ position: "relative", zIndex: 1, width: { xs: "calc(100vw - 32px)", sm: "auto" } }}>

        {/* Logo verde con cruz */}
        <Box sx={{
          position:        "absolute",
          top:             -44,
          left:            "50%",
          transform:       "translateX(-50%)",
          width:           88,
          height:          88,
          borderRadius:    "50%",
          backgroundColor: baseColors.secondary,
          display:         "flex",
          alignItems:      "center",
          justifyContent:  "center",
          boxShadow:       "0 4px 20px rgba(111,178,63,0.45)",
          zIndex:          2,
        }}>
          <Plus size={44} color="white" strokeWidth={3} />
        </Box>

        {/* ── Tarjeta de login ── */}
        <Box sx={{
          backgroundColor: baseColors.surface,
          border:          `1.5px solid ${baseColors.primary}`,
          borderRadius:    "16px",
          pt:              8,
          pb:              5,
          px:              { xs: 3, sm: 5 },
          width:           { xs: "100%", sm: 440 },
          boxShadow:       "0 8px 40px rgba(30,79,163,0.12)",
        }}>

          {/* Título */}
          <Typography sx={{
            textAlign:  "center",
            fontWeight: 700,
            fontSize:   "1.375rem",
            color:      baseColors.primary,
            lineHeight: 1.3,
            mb:         1,
          }}>
            Historia Clínica Electrónica<br />(HCE)
          </Typography>

          {/* Subtítulo */}
          <Typography sx={{
            textAlign: "center",
            color:     baseColors.textSecondary,
            fontSize:  "0.875rem",
            mb:        3.5,
          }}>
            Inicia sesión para acceder
          </Typography>

          {/* ── Formulario ── */}
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>

            <SelectField
              label="Empresa"
              value={empresa}
              onChange={setEmpresa}
              options={EMPRESA_OPTIONS}
            />

            <TextInput
              label="Usuario"
              value={usuario}
              onChange={setUsuario}
              placeholder="Ingrese Usuario"
              startIcon={<User size={18} color={baseColors.textSecondary} strokeWidth={1.8} />}
            />

            <PasswordInput
              label="Contraseña"
              value={password}
              onChange={setPassword}
              placeholder="Ingrese contraseña"
              startIcon={<Lock size={18} color={baseColors.textSecondary} strokeWidth={1.8} />}
            />

            <Box sx={{ mt: 0.5 }}>
              <Button
                label="Iniciar Sesión"
                onClick={handleLogin}
                fullWidth
                color="secondary"
              />
            </Box>

          </Box>
        </Box>
      </Box>
    </Box>
  )
}
