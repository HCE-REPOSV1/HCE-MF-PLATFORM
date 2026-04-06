import { useState }       from "react"
import { useNavigate }    from "react-router-dom"
import {
  Box, Typography,
  TextInput, PasswordInput, SelectField, Button,
  baseColors,
  Syringe, Heart, Pill, Plus, Activity,
  Stethoscope, Bandage, Asterisk, FlaskConical, Thermometer,
  User, Lock,
} from "@hce/design-system"
import type { LucideIcon } from "@hce/design-system"
import { ENDPOINTS } from "./config/endpoints"

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

interface Sucursal {
  idSede:      string
  descripcion: string
}

interface LoginProps {
  onSuccess?: (sede: string) => void
}

export default function Login({ onSuccess }: LoginProps) {
  const navigate = useNavigate()

  const [step,       setStep]       = useState<1 | 2>(1)
  const [usuario,    setUsuario]    = useState("")
  const [password,   setPassword]   = useState("")
  const [sucursales, setSucursales] = useState<Sucursal[]>([])
  const [sede,       setSede]       = useState("")
  const [error,      setError]      = useState("")
  const [loading,    setLoading]    = useState(false)

  // ── Paso 1: autenticar credenciales ──────────────────────
  const handleLogin = async () => {
    if (!usuario || !password) {
      setError("Ingresa usuario y contraseña")
      return
    }
    setError("")
    setLoading(true)
    try {
      const res  = await fetch(ENDPOINTS.auth.login, {
        method:      "POST",
        headers:     { "Content-Type": "application/json" },
        credentials: "include",
        body:        JSON.stringify({ username: usuario, password }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data?.message ?? "Credenciales inválidas")
        return
      }
      const sedes: Sucursal[] = data?.data?.user?.sucursales ?? []
      if (sedes.length === 0) {
        setError("Tu usuario no tiene sedes asignadas")
        return
      }
      // Si solo hay una sede, seleccionarla automáticamente
      if (sedes.length === 1) {
        await handleSedeConfirm(sedes[0].descripcion)
        return
      }
      setSucursales(sedes)
      setStep(2)
    } catch {
      setError("No se pudo conectar con el servidor")
    } finally {
      setLoading(false)
    }
  }

  // ── Paso 2: confirmar sede seleccionada ──────────────────
  const handleSedeConfirm = async (sedeDescripcion: string) => {
    if (onSuccess) {
      await onSuccess(sedeDescripcion)
    } else {
      navigate("/home")
    }
  }

  const handleContinuar = async () => {
    if (!sede) {
      setError("Selecciona una sede")
      return
    }
    setError("")
    setLoading(true)
    try {
      await handleSedeConfirm(sede)
    } finally {
      setLoading(false)
    }
  }

  const sedeOptions = sucursales.map(s => ({ value: s.descripcion, label: s.descripcion }))

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

        {/* ── Tarjeta ── */}
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
           Historia Clínica Electrónica
          </Typography>
          {/* Título 2 */}
          <Typography sx={{
            textAlign:  "center",
            fontWeight: 700,
            fontSize:   "1.375rem",
            color:      baseColors.primary,
            lineHeight: 1.3,
            mb:         1,
          }}>
           (HCE)
          </Typography>

          {/* Subtítulo */}
          <Typography sx={{
            textAlign: "center",
            color:     baseColors.primary,
            fontSize:  "0.875rem",
            mb:        3.5,
          }}>
            {step === 1 ? "Inicia sesión para acceder" : "Selecciona tu sede de trabajo"}
          </Typography>

          {/* ── Paso 1: Credenciales ── */}
          {step === 1 && (
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
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
              {error && (
                <Typography sx={{ color: "#c62828", fontSize: "0.8125rem", mt: -1 }}>
                  {error}
                </Typography>
              )}
              <Box sx={{ mt: 0.5 }}>
                <Button
                  label={loading ? "Verificando..." : "Continuar"}
                  onClick={handleLogin}
                  fullWidth
                  color="secondary"
                />
              </Box>
            </Box>
          )}

          {/* ── Paso 2: Selección de sede ── */}
          {step === 2 && (
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
              <SelectField
                label="Sede"
                value={sede}
                onChange={setSede}
                options={sedeOptions}
              />
              {error && (
                <Typography sx={{ color: "#c62828", fontSize: "0.8125rem", mt: -1 }}>
                  {error}
                </Typography>
              )}
              <Box sx={{ mt: 0.5 }}>
                <Button
                  label={loading ? "Ingresando..." : "Ingresar"}
                  onClick={handleContinuar}
                  fullWidth
                  color="secondary"
                />
              </Box>
              <Box sx={{ textAlign: "center" }}>
                <Typography
                  sx={{ color: baseColors.textSecondary, fontSize: "0.8125rem", cursor: "pointer", "&:hover": { color: baseColors.primary } }}
                  onClick={() => { setStep(1); setError(""); setSede("") }}
                >
                  ← Volver
                </Typography>
              </Box>
            </Box>
          )}

        </Box>
      </Box>
    </Box>
  )
}
