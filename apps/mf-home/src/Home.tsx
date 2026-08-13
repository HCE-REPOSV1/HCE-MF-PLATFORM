import { useNavigate } from "react-router-dom";
import { useUser } from "shell/UserContext";
import {
  Box,
  Typography,
  Button,
  Stethoscope,
  FileText,
  Building2,
  ClipboardList,
  HceConfigIcon,
  HceStarIcon,
  CarruselHome,
  HCEQuickAccess,
  hceColors,
  hceTypography,
} from "@hce/design-system";
import type { LucideIcon } from "@hce/design-system";

// ─── Imágenes del carrusel ────────────────────────────────
// Agrega imágenes JPG/PNG/WebP en src/assets/carousel/ y se cargan automáticamente
const carouselModules = import.meta.glob<{ default: string }>(
  "./assets/carousel/*.{jpg,jpeg,png,webp}",
  { eager: true },
);
const CAROUSEL_IMAGES: string[] = Object.values(carouselModules).map(
  (m) => m.default,
);

// Fallback: si no hay imágenes en la carpeta, usa la imagen original
import clinicBg from "./assets/clinic-bg.jpg";
import { useTranslation } from "@hce/i18n-core";
import { useEffect } from "react";
import { registerHomeNamespace } from "./i18n";
const IMAGES = CAROUSEL_IMAGES.length > 0 ? CAROUSEL_IMAGES : [clinicBg];

// ─── Módulos disponibles ──────────────────────────────────
type Module = {
  Icon: LucideIcon;
  label: string;
  description: string;
  path: string;
  permission: string;
};

// ─────────────────────────────────────────────────────────
export default function Home() {
  const navigate = useNavigate();
  const { hasPermission } = useUser();

  const { t } = useTranslation("home");
  useEffect(() => {
    registerHomeNamespace();
  }, []);

  // Rutas absolutas relativas al shell — deben coincidir con las anidadas bajo
  // "/home" en mf-shell/src/App.tsx (emergencia/*, hospital/*, ambulatorio/*, auditoria/*).
  const MODULES: Module[] = [
    {
      Icon: FileText,
      label: t("quickLinks.Emergency.title"),
      description: t("quickLinks.Emergency.description"),
      path: "/home/emergencia",
      permission: "emergency:module",
    },
    {
      Icon: Stethoscope,
      label: t("quickLinks.Ambulatory.title"),
      description: t("quickLinks.Ambulatory.description"),
      path: "/home/ambulatorio",
      permission: "ambulatorio:module",
    },
    {
      Icon: Building2,
      label: t("quickLinks.Hospital.title"),
      description: t("quickLinks.Hospital.description"),
      path: "/home/hospital",
      permission: "hospital:module",
    },
    {
      Icon: ClipboardList,
      label: t("quickLinks.Audit.title"),
      description: t("quickLinks.Audit.description"),
      path: "/home/auditoria",
      permission: "auditoria:module",
    },
  ];
  // DEBUG temporal — abre DevTools > Console para ver los códigos reales de MAC
  //console.log('[Home] permisos MAC →', permisos)

  const canAccess = (codigo: string): boolean => hasPermission(codigo);

  return (
    <Box
      sx={{
        p: { xs: 2, sm: 3 },
        display: "flex",
        flexDirection: "column",
        gap: 2.5,
        minHeight: "100%",
      }}
    >
      {/* ── Bienvenida ────────────────────────────────────── */}
      <Typography sx={{
        fontFamily: hceTypography.fontFamily,
        fontSize:   "0.85rem",
        fontWeight: 600,
        color:      "var(--ds-color-primary, #0043a5)",
      }}>
        {t('description')}
      </Typography>

      {/* ── Carrusel ──────────────────────────────────────── */}
      <CarruselHome
        images={IMAGES}
        height={300}
        autoPlaySeconds={6}
        objectFit="contain"
      />

      {/* ── Cabecera Accesos Rápidos ───────────────────────── */}
      <Box
        sx={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 1,
          mt: 0.5,
        }}
      >
        {/* Izquierda */}
        <Box>
          <Typography sx={{
            fontFamily: hceTypography.fontFamily,
            fontWeight: 700,
            fontSize:   "1.35rem",
            color:      "var(--ds-color-secondary, #0043a5)",
            lineHeight: 1.2,
          }}>
           {t('quickLinks.title')}
          </Typography>
          <Typography sx={{
            fontFamily: hceTypography.fontFamily,
            fontSize:   "0.82rem",
            color:      "var(--ds-color-text-interactive, #6b7280)",
            mt:         "2px",
          }}>
            {t('quickLinks.description')}
          </Typography>
        </Box>

        {/* Derecha — botones */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, pt: "2px" }}>
          <Button
            size="sm"
            label={t('reorderButton')}
            startIcon={<HceConfigIcon size={14}color={hceColors.neutro.white[50]}/>}
            color={"var(--ds-color-interactive, #0043a5)"}
          />
          <Button
            variant="outlined"
            size="sm"
            label={t('customizeButton')}
            startIcon={<HceStarIcon size={14}color={"var(--ds-color-interactive, #0043a5)"}/>}
            color={"var(--ds-color-interactive, #0043a5)"}
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
              color:       "var(--ds-color-interactive, #0043a5)",
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
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "1fr",
            sm: "repeat(2, 1fr)",
            md: "repeat(3, 1fr)",
            lg: "repeat(4, 1fr)",
          },
          gap: 2,
          alignItems: "stretch",
        }}
      >
        {MODULES.map(({ Icon, label, description, path, permission }) => {
          const enabled = canAccess(permission);
          return (
            <HCEQuickAccess
              key={path}
              icon={<Icon size={24} />}
              title={label}
              description={description}
              disabled={!enabled}
              onAcceder={() => navigate(path)}
              labelBtn={t('quickLinks.AccessButton')} 
            />
          );
        })}
      </Box>
    </Box>
  );
}
