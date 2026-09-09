import "./layout.css";
import { useState, useEffect, lazy, Suspense } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import {
  HceModal,
  UiWarningIcon,
  hceColors,
  useMediaQuery,
  LoadingOverlay,
} from "@hce/design-system";
import { useUser } from "./context/UserContext";
import { useSidebarOpciones } from "./config/sidebarConfig";
import { useTranslation } from "@hce/i18n-core";
import { useShellNamespaceReady } from "./i18n";

const SIDEBAR_LEFT = 12;
const SIDEBAR_TOP = 12;
const CONTENT_GAP = 8;

const Header = lazy(() => import("header/Header"));
const Sidebar = lazy(() => import("sidebar/Sidebar"));
const Footer = lazy(() => import("footer/Footer"));

function useRemoteNamespaceReady<T extends Record<string, unknown>>(
  importRemoteI18n: () => Promise<T>,
  registerFnName: keyof T,
): boolean {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    importRemoteI18n()
      .then((mod) => {
        console.log("módulo remoto recibido:", mod);
        // Algunos remotes devuelven { default: { ...exports } } por el
        // interop ESM/CJS de Module Federation, otros exponen directo
        // { ...exports } — se contempla ambos casos.
        const resolvedMod = (mod as { default?: T }).default ?? mod;
        const registerFn = resolvedMod[registerFnName] as
          | (() => Promise<void>)
          | undefined;

        if (typeof registerFn !== "function") {
          throw new Error(
            `${String(registerFnName)} no es una función en el módulo remoto`,
          );
        }
        return registerFn();
      })
      .then(() => {
        if (!cancelled) setReady(true);
      })
      .catch((err) => {
        console.error("[AppLayout] error esperando namespace remoto:", err);
        if (!cancelled) setReady(true);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return ready;
}

export default function AppLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const isMobile = useMediaQuery("(max-width: 899px)");

  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [sinSedesModal, setSinSedesModal] = useState(false);
  const [sinPermisosModal, setSinPermisosModal] = useState(false);

  useEffect(() => {
    if (!isMobile) setMobileOpen(false);
  }, [isMobile]);

  const {
    user,
    hasPermission,
    sede,
    setSede,
    logout,
    loading,
    sucursalesDisponibles,
  } = useUser();

  const sidebarOpciones = useSidebarOpciones(hasPermission);
  const sucursales = sucursalesDisponibles;

  useEffect(() => {
    if (!user || loading) return;
    if (user.sucursales.length === 0) {
      setSinSedesModal(true);
      return;
    }
    if (sidebarOpciones.length === 0) {
      setSinPermisosModal(true);
      return;
    }
    setSinPermisosModal(false);
  }, [user, loading, sidebarOpciones]);

  const handleSinSedesAceptar = async () => {
    setSinSedesModal(false);
    await logout();
    window.location.replace("/");
  };

  const handleSinPermisosAceptar = async () => {
    setSinPermisosModal(false);
    await logout();
    window.location.replace("/");
  };

  const handleLogout = async () => {
    await logout();
    window.location.replace("/");
  };

  const closeMobileSidebar = () => setMobileOpen(false);

  const { t } = useTranslation("shell");

  // Namespace propio del shell (labels de sidebar que arma AppLayout)
  const shellReady = useShellNamespaceReady();

  // Namespaces de los remotes montados directamente por el layout —
  // se esperan acá para que Header/Footer no aparezcan salteados/después
  // del resto, sino todos juntos cuando TODO esté listo.
  const headerReady = useRemoteNamespaceReady(
    () => import("header/i18n"),
    "registerHeaderNamespace",
  );
  const footerReady = useRemoteNamespaceReady(
    () => import("footer/i18n"),
    "registerFooterNamespace",
  );

  const allReady = shellReady && headerReady && footerReady;

  // Todos los hooks ya corrieron arriba (Rules of Hooks respetado) — recién
  // acá se decide qué renderizar según si TODO terminó de cargar.
  if (!allReady) {
    return <LoadingOverlay open message="Cargando..." />;
  }

  return (
    <div
      style={{
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        backgroundColor: hceColors.neutro.white[50],
      }}
    >
      <HceModal
        open={sinSedesModal}
        title="Sin sedes asignadas"
        description="Tu usuario no tiene sedes asignadas en el sistema. Por favor contacta con el administrador para que te asignen acceso a una sede."
        icon={<UiWarningIcon size={28} />}
        iconBgColor="#b91c1c"
        confirmButton={{ label: "Aceptar", onClick: handleSinSedesAceptar }}
        testId="mf-shell-no-sedes-modal"
      />

      <HceModal
        open={sinPermisosModal}
        title="Sin permisos de acceso"
        description="Tu usuario no tiene módulos habilitados en el sistema. Por favor contacta con el administrador para que te asignen los permisos correspondientes."
        icon={<UiWarningIcon size={28} />}
        iconBgColor="#b91c1c"
        confirmButton={{ label: "Aceptar", onClick: handleSinPermisosAceptar }}
        testId="mf-shell-no-permisos-modal"
      />

      {isMobile && mobileOpen && (
        <>
          <div
            onClick={closeMobileSidebar}
            data-testid="mf-shell-mobile-sidebar-backdrop"
            style={{
              position: "fixed",
              inset: 0,
              backgroundColor: "rgba(0,0,0,0.45)",
              zIndex: 1299,
            }}
          />
          <div
            style={{
              position: "fixed",
              left: SIDEBAR_LEFT,
              top: SIDEBAR_TOP,
              bottom: SIDEBAR_TOP,
              zIndex: 1300,
              display: "flex",
            }}
          >
            <Suspense fallback={null}>
              <Sidebar
                multiLevel={false}
                collapsed={false}
                onToggle={closeMobileSidebar}
                opciones={sidebarOpciones}
                currentPath={location.pathname}
                onNavigate={(vista) => {
                  closeMobileSidebar();
                  if (vista) navigate(vista);
                }}
                onHome={() => {
                  closeMobileSidebar();
                  navigate("/home");
                }}
                labelHome={t("optHome")}
                titleOptions={t("titleOptions")}
              />
            </Suspense>
          </div>
        </>
      )}

      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "row",
          overflow: "hidden",
          padding: isMobile
            ? `${SIDEBAR_TOP}px 12px 0 12px`
            : `${SIDEBAR_TOP}px 12px 0 ${SIDEBAR_LEFT}px`,
          gap: isMobile ? 0 : CONTENT_GAP,
        }}
      >
        {!isMobile && (
          <Suspense fallback={null}>
            <Sidebar
              multiLevel={false}
              collapsed={collapsed}
              onToggle={() => setCollapsed((prev) => !prev)}
              opciones={sidebarOpciones}
              currentPath={location.pathname}
              onNavigate={(vista) => {
                closeMobileSidebar();
                if (vista) navigate(vista);
              }}
              onHome={() => {
                closeMobileSidebar();
                navigate("/home");
              }}
              labelHome={t("optHome")}
              titleOptions={t("titleOptions")}
            />
          </Suspense>
        )}

        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
            minWidth: 0,
          }}
        >
          <Suspense fallback={null}>
            <Header
              floating
              sede={sede}
              sucursales={sucursales}
              onSedeCambiada={(id) => setSede(String(id))}
              onLogout={handleLogout}
              onMenuClick={
                isMobile ? () => setMobileOpen((prev) => !prev) : undefined
              }
            />
          </Suspense>

          {/* CONTENIDO */}
          <main
            style={{
              flex: 1,
              minHeight: 0,
              overflow: "auto",
              padding: "0 0 0",
              height:"100%"
            }}
          >
            <Outlet />
          </main>
        </div>
      </div>

      <Suspense fallback={null}>
        <Footer />
      </Suspense>
    </div>
  );
}
