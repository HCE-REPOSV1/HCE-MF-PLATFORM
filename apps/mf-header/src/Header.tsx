import { useState, useEffect, useMemo } from "react";
import { HceBreadcrumb, HceHeader, HceLanguageSwitch } from "@hce/design-system";
import type { HceLocaleOption } from "@hce/design-system";
import { useUser } from "shell/UserContext";
import { usePractitioner } from "./hooks/usePractitioner";

import { useLocation, useNavigate } from "react-router-dom";
import { i18n, useTranslation, useLocaleSwitch, isValidLocale } from "@hce/i18n-core";
import { useHeaderNamespaceReady } from "./i18n";
import { ENDPOINTS } from "./config/endpoints";

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

type CommittedData =
  | {
      role: string | null;
      prefix: string | null;
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

  useEffect(() => {
    setCommitted(undefined);
  }, [user?.username]);

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

   const { t } = useTranslation("header");
  // useEffect(() => {
  //   registerHeaderNamespace();
  // }, []);
  const prefix = committed?.prefix;
  const userName = prefix
    ? `${prefix} ${user?.nombreCompleto ?? ""}`
    : user?.nombreCompleto;

  const userRole = committed?.role ?? undefined;

  const location = useLocation();
  const navigate = useNavigate();
  const isClinicalRecordView :boolean = location.pathname
    .split("/")
    .filter(Boolean)
    .includes("historiacli");

   const disabledTooltip= isClinicalRecordView
    ? t("labelDisabledSelector")
    : undefined;

  // registerHeaderNamespace() es asíncrono de verdad — sin esperar la
  // promesa, el primer render mostraría las claves crudas (breadcrumb,
  // título, etc.) hasta que addResourceBundle() termine.
  const namespaceReady = useHeaderNamespaceReady();

  const [locales, setLocales] = useState<HceLocaleOption[]>([]);
  useEffect(() => {
    fetch(ENDPOINTS.i18n.locales)
      .then((res) => (res.ok ? res.json() : Promise.reject(res.status)))
      .then(setLocales)
      .catch((err) => console.error("[mf-header] no se pudo obtener i18n/locales:", err));
  }, []);

  const switchLocale = useLocaleSwitch();
  const handleLocaleChange = (code: string) => {
    if (isValidLocale(code)) switchLocale(code);
  };

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

  // Todos los hooks ya corrieron arriba — recién acá se decide qué
  // renderizar según si el namespace terminó de cargar.
  if (!namespaceReady) {
    return null;
  }

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
        sedeDisabled={isClinicalRecordView}
        sedeDisabledTooltip={disabledTooltip}
        userName={userName}
        userRole={userRole}
        userPhotoUrl={photoUrl ?? undefined}
        onLogout={onLogout}
        onMenuClick={onMenuClick}
        title={t("title")}
        labelCloseSesion={t('labelCloseSesion')}
        testId="mf-header"
        extraActions={
          locales.length > 0 && (
            <HceLanguageSwitch
              locales={locales}
              activeLocale={i18n.language}
              onLocaleChange={handleLocaleChange}
              ariaLabel={t('languageSwitch.ariaLabel')}
              testId="mf-header-language-switch"
            />
          )
        }
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
            testId="mf-header-breadcrumb"
          />
        </div>
      )}
    </div>
  );
}