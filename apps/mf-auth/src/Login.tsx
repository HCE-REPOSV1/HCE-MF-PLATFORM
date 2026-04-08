import { useState }       from "react"
import { useNavigate }    from "react-router-dom"
import {
  Box, Typography,
  TextInput, PasswordInput, SelectField, Button, LoadingOverlay,
  hceColors,
  DoctorIcon, ForgotPasswordIcon, UiIsotipoClinicaIcon,
} from "@hce/design-system"
import { ENDPOINTS } from "./config/endpoints"

// ─── Wallpaper ────────────────────────────────────────────
// Se importa como ?raw para inlinarlo como data URL.
// Con module federation los asset URLs del remoto no resuelven contra el host,
// por eso se embebe directamente en el bundle — sin dependencia de servidor.
// Para cambiar el fondo: copiar el nuevo SVG en src/assets/ y actualizar solo este import.
import wallpaperRaw from "./assets/patron-fondo.svg?raw"
const wallpaper = `data:image/svg+xml;utf8,${encodeURIComponent(wallpaperRaw)}`

// ─── Empresa fija ─────────────────────────────────────────
// Disabled en el login — pre-seleccionada, no editable
const EMPRESA_VALUE  = "clinica-san-felipe"
const EMPRESA_OPTION = [{ value: EMPRESA_VALUE, label: "Clínica San Felipe" }]

interface LoginProps {
  onSuccess?: (sede: string) => void
}

export default function Login({ onSuccess }: LoginProps) {
  const navigate = useNavigate()

  const [usuario,  setUsuario]  = useState("")
  const [password, setPassword] = useState("")
  const [error,    setError]    = useState("")
  const [loading,  setLoading]  = useState(false)
  const [hasError, setHasError] = useState(false)

  const handleLogin = async () => {
    if (!usuario || !password) {
      setError("Ingresa usuario y contraseña")
      setHasError(true)
      return
    }
    setError("")
    setHasError(false)
    setLoading(true)
    try {
      // TODO: quitar el await de espera forzada cuando se confirme que el overlay funciona
      await new Promise(resolve => setTimeout(resolve, 3000))
      const res  = await fetch(ENDPOINTS.auth.login, {
        method:      "POST",
        headers:     { "Content-Type": "application/json" },
        credentials: "include",
        body:        JSON.stringify({ username: usuario, password }),
      })
      const data = await res.json()
      if (!res.ok) {
        const msg = (() => {
          switch (res.status) {
            case 401: return "Usuario o contraseña incorrectos"
            case 403: return "Tu cuenta está bloqueada. Contacta con soporte."
            case 503: return "Servicio no disponible. Intenta en unos momentos."
            case 504: return "El servidor tardó demasiado en responder. Intenta nuevamente."
            default:  return data?.message ?? "Ocurrió un error inesperado"
          }
        })()
        setError(msg)
        setHasError(true)
        return
      }
      // La selección de sede se realiza desde el Header
      const sedes       = data?.data?.user?.sucursales ?? []
      const primerasede = sedes[0]?.descripcion ?? ""
      if (onSuccess) {
        await onSuccess(primerasede)
      } else {
        navigate("/home")
      }
    } catch {
      setError("No se pudo conectar con el servidor")
      setHasError(true)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Box sx={{
      minHeight:            "100vh",
      backgroundImage:      `url(${wallpaper})`,
      backgroundSize:       "cover",
      backgroundPosition:   "center",
      backgroundRepeat:     "no-repeat",
      backgroundColor:      hceColors.primary.blue[50], // fallback mientras carga
      display:              "flex",
      alignItems:           "center",
      justifyContent:       "center",
      position:             "relative",
    }}>

      {/* ── Loading overlay — cubre la pantalla mientras espera la API ── */}
      <LoadingOverlay open={loading} message="Verificando credenciales..." />

      {/* ── Tarjeta de login ── */}
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
          backgroundColor: hceColors.primary.green[600],
          display:         "flex",
          alignItems:      "center",
          justifyContent:  "center",
          boxShadow:       "0 4px 20px rgba(111,178,63,0.45)",
          zIndex:          2,
        }}>
          <UiIsotipoClinicaIcon size={44} color="white" />
        </Box>

        {/* ── Tarjeta ── */}
        <Box sx={{
          backgroundColor: hceColors.neutro.white[100],
          border:          `1.5px solid ${hceColors.primary.blue[600]}`,
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
            color:      hceColors.primary.blue[600],
            lineHeight: 1.3,
            mb:         1,
          }}>
            Historia Clínica Electrónica
          </Typography>
          <Typography sx={{
            textAlign:  "center",
            fontWeight: 700,
            fontSize:   "1.375rem",
            color:      hceColors.primary.blue[600],
            lineHeight: 1.3,
            mb:         1,
          }}>
            (HCE)
          </Typography>

          {/* Subtítulo */}
          <Typography sx={{
            textAlign: "center",
            color:     hceColors.primary.blue[600],
            fontSize:  "0.875rem",
            mb:        3.5,
          }}>
            Inicia sesión para acceder
          </Typography>

          <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>

            {/* Empresa (disabled, pre-seleccionada) */}
            <SelectField
              label="Empresa"
              value={EMPRESA_VALUE}
              onChange={() => {}}
              options={EMPRESA_OPTION}
              disabled
            />

            {/* Usuario */}
            <TextInput
              label="Usuario"
              value={usuario}
              onChange={setUsuario}
              placeholder="Ingrese Usuario"
              startIcon={<DoctorIcon size={18} />}
              error={hasError}
            />

            {/* Contraseña */}
            <PasswordInput
              label="Contraseña"
              value={password}
              onChange={setPassword}
              placeholder="Ingrese contraseña"
              startIcon={<ForgotPasswordIcon size={18} />}
              error={hasError}
            />

            {/* Mensaje de error */}
            {error && (
              <Typography sx={{
                color:    hceColors.alert.error[600],
                fontSize: "0.875rem",
                mt:       -1,
              }}>
                {error}
              </Typography>
            )}

            <Box sx={{ mt: 0.5 }}>
              <Button
                label="Iniciar sesión"
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
