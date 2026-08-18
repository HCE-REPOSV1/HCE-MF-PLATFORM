import { useState, useEffect, useMemo } from "react";
import { HceBreadcrumb, HceHeader } from "@hce/design-system";
import { useUser } from "shell/UserContext";
import { usePractitioner } from "./hooks/usePractitioner";

import { useLocation, useNavigate } from "react-router-dom";
import { i18n, useTranslation } from "@hce/i18n-core";
import { registerHeaderNamespace } from "./i18n";

interface Sucursal {
  id: string | number;
  nombre: string;
}

interface HeaderProps {
  sede?: string;
  sucursales?: Sucursal[];
  onSedeCambiada?: (id: string | number) => void;
  onLogout?: () => void;
  onMenuClick?: (() => void) | undefined;
  floating?: boolean;
}

// Datos comprometidos para el header — asignados UNA SOLA VEZ por usuario.
// Reglas:
//   - practitioner encontrado Y role_code="doctor" → prefix + especialidad
//   - practitioner no encontrado O role_code≠"doctor" → user.nombrePerfil (auth/me)
type CommittedData =
  | {
      role: string | null; // subtítulo a mostrar (null = ocultar)
      prefix: string | null; // prefijo del nombre (Dr., Dra., etc.) o null
    }
  | undefined;

export default function Header({
  sede,
  sucursales,
  onSedeCambiada,
  onLogout,
  onMenuClick,
}: HeaderProps) {
  const { user } = useUser();
  const {
    data: practitionerData,
    photoUrl,
    subtitle: practitionerSubtitle,
    loading: practitionerLoading,
  } = usePractitioner(user?.username);

  const [committed, setCommitted] = useState<CommittedData>(undefined);

  // Resetear al cambiar de usuario (logout / cambio de cuenta)
  useEffect(() => {
    setCommitted(undefined);
  }, [user?.username]);

  // Commit único cuando el practitioner termina de cargar.
  // Doctor → prefix + especialidad | Otro / no encontrado → user.nombrePerfil (auth/me)
  useEffect(() => {
    if (committed !== undefined) return;
    if (practitionerLoading || !user) return;

    if (practitionerData?.role_code === "doctor") {
      setCommitted({
        role: practitionerSubtitle ?? null,
        prefix: practitionerData.name_prefix?.trim() || null,
      });
    } else {
      setCommitted({
        role: user.nombrePerfil ?? null,
        prefix: null,
      });
    }
  }, [
    committed,
    practitionerLoading,
    user,
    practitionerData,
    practitionerSubtitle,
  ]);

  const prefix = committed?.prefix;
  const userName = prefix
    ? `${prefix} ${user?.nombreCompleto ?? ""}`
    : user?.nombreCompleto;

  const userRole = committed?.role ?? undefined;

  const location = useLocation();
  const navigate = useNavigate();

  const { t } = useTranslation("header");
  useEffect(() => {
    registerHeaderNamespace();
  }, []);

  const BREADCRUMB_LABELS: Record<string, string> = {
    home: t("breadcrumb.home"),
    emergencia: t("breadcrumb.emergency"),
    historiacli: t("breadcrumb.clinicalRecord"),
    hospital: t("breadcrumb.hospital"),
    ambulatorio: t("breadcrumb.ambulatory"),
    auditoria: t("breadcrumb.audit"),
  };

  const breadcrumbItems = useMemo(() => {
    const segments = location.pathname.split("/").filter(Boolean);

    if (segments.length <= 1 && segments[0] === "home") {
      return [];
    }

    return segments.map((segment, index) => {
      const href = `/${segments.slice(0, index + 1).join("/")}`;

      return {
        label: BREADCRUMB_LABELS[segment] ?? segment,
        href,
      };
    });
  }, [location.pathname, t]);

  const showBreadcrumb = breadcrumbItems.length > 0;

  console.log(
    "idioma activo:",
    i18n.language,
    "| namespaces cargados:",
    i18n.reportNamespaces?.getUsedNamespaces?.(),
  );
  console.log("bundle header en:", i18n.getResourceBundle("en", "header"));
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 20,
        width: "100%",
      }}
    >
      <HceHeader
        floating
        sede={sede}
        sucursales={sucursales}
        onSedeCambiada={onSedeCambiada}
        userName={userName}
        userRole={userRole}
        userPhotoUrl={photoUrl ?? undefined}
        onLogout={onLogout}
        onMenuClick={onMenuClick}
        title={t("title")}
        labelCloseSesion={t('labelCloseSesion')}
      />

      {showBreadcrumb && (
        <div style={{ flex: 1, overflow: "auto", padding: "0 0 0 20px" }}>
          <HceBreadcrumb
            items={breadcrumbItems}
            onItemClick={(item) => {
              if (item.href) {
                navigate(item.href);
              }
            }}
          />
        </div>
      )}
    </div>
  );
}
