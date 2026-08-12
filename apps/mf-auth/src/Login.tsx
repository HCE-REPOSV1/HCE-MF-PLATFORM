import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  TextInput,
  PasswordInput,
  SelectField,
  Button,
  CSFLoading,
  HceModal,
  hceColors,
  UiWarningIcon,
  DoctorIcon,
  ForgotPasswordIcon,
  UiIsotipoClinicaIcon,
} from "@hce/design-system";
import { login } from "shell/AuthService";

// ─── Wallpaper ────────────────────────────────────────────
// Se importa como ?raw para inlinarlo como data URL.
// Con module federation los asset URLs del remoto no resuelven contra el host,
// por eso se embebe directamente en el bundle — sin dependencia de servidor.
// Para cambiar el fondo: copiar el nuevo SVG en src/assets/ y actualizar solo este import.
import wallpaperRaw from "./assets/patron-fondo.svg?raw";
import { useTranslation } from "@hce/i18n-core";
import { registerAuthNamespace } from "./i18n";
import { AUTH_ERROR_CODES, resolveStatusError } from "./i18n/errorCodes";
const wallpaper = `data:image/svg+xml;utf8,${encodeURIComponent(wallpaperRaw)}`;

// ─── Empresa fija ─────────────────────────────────────────
// Disabled en el login — pre-seleccionada, no editable
const EMPRESA_VALUE = "clinica-san-felipe";
const EMPRESA_OPTION = [{ value: EMPRESA_VALUE, label: "Clínica San Felipe" }];

interface LoginProps {
  onSuccess?: (sede: string) => void;
}

export default function Login({ onSuccess }: LoginProps) {
  const navigate = useNavigate();

  const [usuario, setUsuario] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [blockedModal, setBlockedModal] = useState(false);
  const [blockedMessage, setBlockedMessage] = useState("");

  // Solo letras (con acentos y ñ), sin espacios ni caracteres especiales
  const handleUsuarioChange = (value: string) => {
    const limpio = value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚüÜñÑ]/g, "");
    setUsuario(limpio);
  };

  // Sin espacios ni saltos de línea
  const handlePasswordChange = (value: string) => {
    setPassword(value.replace(/\s/g, ""));
  };

  const handleLogin = async () => {
    if (!usuario || !password) {
      setError(t("errors.missingFields"));
      setHasError(true);
      return;
    }
    setError("");
    setHasError(false);
    setLoading(true);
    try {
      const { ok, status, data } = await login(usuario, password);

      if (!ok) {
        const codigo = data?.codigo as number | undefined;
        const mensaje = data?.mensaje as string | undefined;

        // codigo 7 — cuenta bloqueada en AD: mostrar modal (no texto inline)
        if (codigo === 7) {
          setBlockedMessage(t("errors.accountBlocked"));
          setBlockedModal(true);
          return;
        }

        // Resto de errores: texto rojo bajo el formulario.
        // Prioridad: código mapeado > status HTTP > mensaje crudo del backend
        // (fallback temporal, mientras no todos los endpoints tengan código) > genérico.
        const translationKey = codigo ? AUTH_ERROR_CODES[codigo] : undefined;
        const errorMsg = translationKey
          ? t(translationKey)
          : (mensaje ?? t(resolveStatusError(status)));

        setError(errorMsg);
        setHasError(true);
        return;
      }

      // La selección de sede se realiza desde el Header
      const sedes = data?.data?.user?.sucursales ?? [];
      const primerasede = sedes[0]?.idSede ?? "";
      if (onSuccess) {
        await onSuccess(primerasede);
      } else {
        navigate("/home");
      }
    } catch {
      // API Gateway no disponible o sin red
      setError(t("errors.networkError"));
      setHasError(true);
    } finally {
      setLoading(false);
    }
  };

  const { t } = useTranslation("auth");
  useEffect(() => {
    registerAuthNamespace();
  }, []);

  return (
    <Box
      sx={{
        minHeight: "100vh",
        backgroundImage: `url(${wallpaper})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        position: "relative",
      }}
    >
      {/* ── Loading overlay — cubre la pantalla mientras espera la API ── */}
      <CSFLoading
        open={loading}
        overlay
        message={t('login.msgLoading')}
        frameDuration={100}
      />

      {/* ── Modal: cuenta bloqueada (codigo 7) ── */}
      <HceModal
        open={blockedModal}
        title={t('errors.accountBlockedTitle')}
        description={blockedMessage}
        icon={<UiWarningIcon size={28} />}
        iconBgColor={hceColors.primary.blue[600]}
        confirmButton={{
          label: t('common:actions.accept'),
          onClick: () => setBlockedModal(false),
        }}
      />

      {/* ── Tarjeta de login ── */}
      <Box
        sx={{
          position: "relative",
          zIndex: 1,
          width: { xs: "calc(100vw - 20px)", sm: "auto" },
          justifyContent: "center",
          margin: 15,
        }}
      >
        {/* Logo verde con cruz */}
        <Box
          sx={{
            position: "absolute",
            top: -75,
            left: "50%",
            transform: "translateX(-50%)",
            width: 138,
            height: 138,
            borderRadius: "69px",
            backgroundColor: hceColors.primary.green[600],
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-start",
            padding: "23px 23px 14px 11px",
            gap: "10px",
            zIndex: 2,
          }}
        >
          <UiIsotipoClinicaIcon size={106} color="white" />
        </Box>

        {/* ── Tarjeta ── */}
        <Box
          sx={{
            backgroundColor: hceColors.neutro.white[50],
            border: `1.5px solid ${hceColors.primary.blue[600]}`,
            borderRadius: "16px",
            pt: "6rem",
            pb: 5,
            px: { xs: "2.5rem", sm: "2.5rem" },
            width: { xs: "100%", sm: 440 },
            boxShadow:
              "0 8px 28px -6px rgba(24, 39, 75, 0.12), 0 18px 88px -4px rgba(24, 39, 75, 0.14)",
          }}
        >
          {/* Título */}
          <Typography
            sx={{
              textAlign: "center",
              fontWeight: 500,
              fontSize: "1.375rem",
              color: hceColors.primary.blue[600],
              lineHeight: 1.3,
              mb: 1,
            }}
          >
            {/* Historia Clínica Electrónica */}
            {t("login.title")}
          </Typography>
          <Typography
            sx={{
              textAlign: "center",
              fontWeight: 500,
              fontSize: "1.375rem",
              color: hceColors.primary.blue[600],
              lineHeight: 1.3,
              mb: 1,
            }}
          >
            (HCE)
          </Typography>

          {/* Subtítulo */}
          <Typography
            sx={{
              textAlign: "center",
              color: hceColors.primary.blue[600],
              fontSize: "0.875rem",
              mb: 3.5,
            }}
          >
            {t("login.descriptionTitle")}
          </Typography>

          <Box sx={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            {/* Empresa (disabled, pre-seleccionada) */}
            <SelectField
              label={t("login.CompanySelect")}
              value={EMPRESA_VALUE}
              onChange={() => {}}
              options={EMPRESA_OPTION}
              disabled
            />

            {/* Usuario */}
            <TextInput
              label={t("login.usernameInput")}
              value={usuario}
              onChange={handleUsuarioChange}
              placeholder={t("login.usernamePlaceholder")}
              startIcon={<DoctorIcon size={18} />}
              error={hasError}
            />

            {/* Contraseña */}
            <PasswordInput
              label={t("login.passwordInput")}
              value={password}
              onChange={handlePasswordChange}
              placeholder={t("login.passwordPlaceholder")}
              startIcon={<ForgotPasswordIcon size={18} />}
              error={hasError}
            />

            {/* Mensaje de error */}
            {error && (
              <Typography
                sx={{
                  color: hceColors.alert.error[600],
                  fontSize: "0.875rem",
                  mt: -1,
                }}
              >
                {error}
              </Typography>
            )}

            <Box sx={{ mt: 1.5 }}>
              <Button
                label={t("login.submitButton")}
                onClick={handleLogin}
                fullWidth
                color={hceColors.primary.green[600]}
                sx={{ px: "30px", py: "12px" }}
              />
            </Box>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
