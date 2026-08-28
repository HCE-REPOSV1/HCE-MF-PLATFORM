import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  TextInput,
  PasswordInput,
  SelectField,
  Button,
  LoadingOverlay,
  HceModal,
  HceLanguageSwitch,
  hceColors,
  UiWarningIcon,
  DoctorIcon,
  ForgotPasswordIcon,
  useCompanyBranding,
  type HceLocaleOption,
} from "@hce/design-system";
import { login } from "shell/AuthService";
import { i18n as i18nInstance, useLocaleSwitch, isValidLocale } from "@hce/i18n-core";
import { ENDPOINTS } from "./config/endpoints";

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
interface LoginProps {
  onSuccess?: (sede: string) => void;
}

export default function Login({ onSuccess }: LoginProps) {
  const navigate = useNavigate();
  const {
    Isotype: CompanyIsotype,
    selectValue: companyValue,
    displayName: companyName,
  } = useCompanyBranding();
  const companyOptions = [{ value: companyValue, label: companyName }];

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

  // Idiomas disponibles para el selector del login — vienen del manifest
  // del backend (i18n/locales, público), no de una lista hardcodeada.
  const [locales, setLocales] = useState<HceLocaleOption[]>([]);
  useEffect(() => {
    fetch(ENDPOINTS.i18n.locales)
      .then((res) => (res.ok ? res.json() : Promise.reject(res.status)))
      .then(setLocales)
      .catch((err) => console.error("[mf-auth] no se pudo obtener i18n/locales:", err));
  }, []);
  const switchLocale = useLocaleSwitch();
  const handleLocaleChange = (code: string) => {
    if (isValidLocale(code)) switchLocale(code);
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        backgroundImage: `url(${wallpaper})`,
        backgroundSize: "cover",
        backgroundColor: "var(--ds-color-primary-light)",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        position: "relative",
      }}
    >
      {/* ── Selector de idioma — flotante, esquina superior derecha.
          HceLanguageSwitch está pensado para el azul institucional del
          header (texto/ícono blanco) -- acá el fondo es el wallpaper claro
          del login, así que se envuelve en el mismo azul a modo de "chip"
          para mantener contraste. ── */}
      {locales.length > 0 && (
        <Box
          sx={{
            position: "absolute",
            top: 16,
            right: 16,
            zIndex: 2,
            backgroundColor: "var(--ds-color-interactive, #003d96)",
            borderRadius: "999px",
          }}
        >
          <HceLanguageSwitch
            locales={locales}
            activeLocale={i18nInstance.language}
            onLocaleChange={handleLocaleChange}
            testId="mf-auth-language-switch"
          />
        </Box>
      )}

      {/* ── Loading overlay — cubre la pantalla mientras espera la API ── */}
      <LoadingOverlay
        open={loading}
        message={t('login.msgLoading')}
      />

      {/* ── Modal: cuenta bloqueada (codigo 7) ── */}
      <HceModal
        open={blockedModal}
        title={t('errors.accountBlockedTitle')}
        description={blockedMessage}
        icon={<UiWarningIcon size={28} />}
        iconBgColor={"var(--ds-color-interactive)"}
        confirmButton={{
          label: t('common:actions.accept'),
          onClick: () => setBlockedModal(false),
        }}
        testId="mf-auth-login-blocked-modal"
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
            backgroundColor: "var(--ds-color-interactive-button, #89C93D)",
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-start",
            padding: "23px 23px 14px 11px",
            gap: "10px",
            zIndex: 2,
          }}
        >
          <CompanyIsotype size={106} color="white" />
        </Box>

        {/* ── Tarjeta ── */}
        <Box
          sx={{
            backgroundColor: hceColors.neutro.white[50],
            border: `1.5px solid ${"var(--ds-color-interactive)"}`,
            borderRadius: "16px",
            pt: "3.9rem",
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
              fontWeight: 700,
              fontSize: "1.375rem",
              color: "var(--ds-color-interactive)",
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
              fontWeight: 700,
              fontSize: "1.375rem",
              color: "var(--ds-color-interactive)",
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
              color: "var(--ds-color-interactive)",
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
              value={companyValue}
              onChange={() => {}}
              options={companyOptions}
              disabled
              testId="mf-auth-login-company"
            />

            {/* Usuario */}
            <TextInput
              label={t("login.usernameInput")}
              value={usuario}
              onChange={handleUsuarioChange}
              placeholder={t("login.usernamePlaceholder")}
              startIcon={<DoctorIcon size={18} />}
              error={hasError}
              testId="mf-auth-login-username"
            />

            {/* Contraseña */}
            <PasswordInput
              label={t("login.passwordInput")}
              value={password}
              onChange={handlePasswordChange}
              placeholder={t("login.passwordPlaceholder")}
              startIcon={<ForgotPasswordIcon size={18} />}
              error={hasError}
              testId="mf-auth-login-password"
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

            <Box sx={{ mt: 1.0 }}>
              <Button
                label={t("login.submitButton")}
                onClick={handleLogin}
                fullWidth
                color={"var(--ds-color-interactive-button)"}
                sx={{px: "30px", py: "12px", fontFamily: "var(--ds-font-family)"}}
                testId="mf-auth-login-submit"
              />
            </Box>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
