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

const carouselModules = import.meta.glob<{ default: string }>(
  "./assets/carousel/*.{jpg,jpeg,png,webp}",
  { eager: true },
);
const CAROUSEL_IMAGES: string[] = Object.values(carouselModules).map(
  (m) => m.default,
);

import clinicBg from "./assets/clinic-bg.jpg";
import { useTranslation } from "@hce/i18n-core";
import { useHomeNamespaceReady } from "./i18n";

const IMAGES = CAROUSEL_IMAGES.length > 0 ? CAROUSEL_IMAGES : [clinicBg];

type Module = {
  Icon: LucideIcon;
  label: string;
  description: string;
  path: string;
  permission: string;
};

export default function Home() {
  const navigate = useNavigate();
  const { hasPermission } = useUser();

  const { t } = useTranslation("home");

  // registerHomeNamespace() es asíncrono de verdad (fetch al manifest de
  // idiomas + fetch autenticado por namespace) — sin esperar la promesa,
  // el primer render mostraría las claves crudas hasta que
  // addResourceBundle() termine y dispare un re-render solo.
  const namespaceReady = useHomeNamespaceReady();

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

  const canAccess = (codigo: string): boolean => hasPermission(codigo);

  // Todos los hooks ya corrieron arriba — recién acá se decide qué
  // renderizar según si el namespace terminó de cargar.
  if (!namespaceReady) {
    return (
      <Box
        sx={{
          p: { xs: 2, sm: 3 },
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "300px",
        }}
      >
        <Box sx={{ fontSize: "0.9rem", color: "var(--ds-color-text-secondary, #6b7280)" }}>
          Cargando...
        </Box>
      </Box>
    );
  }

  return (
    <>
      <Box
        sx={{
          p: { xs: 2, sm: 3 },
          display: "flex",
          flexDirection: "column",
          gap: 2.5,
          minHeight: "100%",
        }}
      >
        <Typography
          sx={{
            fontFamily: hceTypography.fontFamily,
            fontSize: "0.85rem",
            fontWeight: 600,
            color: "var(--ds-color-primary, #0043a5)",
          }}
        >
          {t("description")}
        </Typography>

        <CarruselHome
          images={IMAGES}
          height={300}
          autoPlaySeconds={6}
          objectFit="contain"
          testId="mf-home-carousel"
        />

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
          <Box>
            <Typography
              sx={{
                fontFamily: hceTypography.fontFamily,
                fontWeight: 700,
                fontSize: "1.35rem",
                color: "var(--ds-color-secondary, #0043a5)",
                lineHeight: 1.2,
              }}
            >
              {t("quickLinks.title")}
            </Typography>
            <Typography
              sx={{
                fontFamily: hceTypography.fontFamily,
                fontSize: "0.82rem",
                color: "var(--ds-color-text-interactive, #6b7280)",
                mt: "2px",
              }}
            >
              {t("quickLinks.description")}
            </Typography>
          </Box>

          <Box
            sx={{ display: "flex", alignItems: "center", gap: 1, pt: "2px" }}
          >
            <Button
              size="sm"
              label={t("reorderButton")}
              startIcon={
                <HceConfigIcon size={14} color={hceColors.neutro.white[50]} />
              }
              color={"var(--ds-color-interactive, #0043a5)"}
              testId="mf-home-reorder-button"
            />
            <Button
              variant="outlined"
              size="sm"
              label={t("customizeButton")}
              startIcon={
                <HceStarIcon
                  size={14}
                  color={"var(--ds-color-interactive, #0043a5)"}
                />
              }
              color={"var(--ds-color-interactive, #0043a5)"}
              testId="mf-home-customize-button"
            />
          </Box>
        </Box>

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
                labelBtn={t("quickLinks.AccessButton")}
                testId={`mf-home-quickaccess-${path.split("/").pop()}`}
              />
            );
          })}
        </Box>
      </Box>
    </>
  );
}