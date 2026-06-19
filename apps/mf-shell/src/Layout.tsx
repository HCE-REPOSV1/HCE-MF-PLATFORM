import "./layout.css";
import React, { useState, useEffect, lazy, useMemo } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { useMediaQuery } from "@mui/material";
import {
  HceModal,
  UiWarningIcon,
} from "@hce/design-system";
import { useUser } from "./context/UserContext";
import { usePractitioner } from "./hooks/usePractitioner";

const SIDEBAR_LEFT = 12; // padding izquierdo de la fila central (desktop)
const SIDEBAR_TOP = 12; // padding superior de la fila central
const CONTENT_GAP = 8; // gap entre sidebar y columna de contenido (desktop)

interface Sucursal {
  id: string | number;
  nombre: string;
}

interface RemoteHeaderProps {
  sede: string;
  sucursales: Sucursal[];
  onSedeCambiada: (id: string | number) => void;
  userName: string | undefined;
  userRole: string | undefined;
  userPhotoUrl?: string | undefined;
  onLogout: () => void;
  onMenuClick: (() => void) | undefined;
  floating: boolean;
}

const Header = lazy(
  () =>
    import("header/Header") as Promise<{
      default: React.ComponentType<RemoteHeaderProps>;
    }>,
);
const Sidebar = lazy(
  () =>
    import("sidebar/Sidebar") as Promise<{
      default: React.ComponentType<any>;
    }>,
);
const Footer = lazy(
  () =>
    import("footer/Footer") as Promise<{
      default: React.ComponentType<any>;
    }>,
);
// ─────────────────────────────────────────────────────────
export default function AppLayout() {
  const navigate = useNavigate();
  const location = useLocation();

  // En pantallas < 900px el sidebar se oculta y abre como overlay
  const isMobile = useMediaQuery("(max-width: 899px)");

  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [sinSedesModal, setSinSedesModal] = useState(false);
  const [sinPermisosModal, setSinPermisosModal] = useState(false);

  // Al pasar a desktop, cierra el overlay móvil
  useEffect(() => {
    if (!isMobile) setMobileOpen(false);
  }, [isMobile]);

  const { user, opciones, sede, setSede, logout, loading } = useUser();

  // Datos reales del practitioner: nombre con prefijo, especialidad y foto
  // Se carga solo cuando el username está disponible tras el login
  const {
    data: practitioner,
    photoUrl: practitionerPhotoUrl,
    subtitle: practitionerSubtitle,
  } = usePractitioner(user?.username);

  // Nombre a mostrar: name_text del practitioner si ya cargó, fallback al nombreCompleto del AD
  const displayName = practitioner?.name_text ?? user?.nombreCompleto;
  // Subtítulo: especialidad o rol del practitioner, fallback al perfil del AD
  const displayRole = practitionerSubtitle ?? user?.nombrePerfil;

  useEffect(() => {
    if (!user || loading) return;

    // Sin sedes asignadas → modal + logout
    if (user.sucursales.length === 0) {
      setSinSedesModal(true);
      return;
    }

    // Sin opciones de menú visibles (todas en estado "O") → modal + logout
    if (opciones !== null && opciones.length === 0) {
      setSinPermisosModal(true);
      return;
    }
    // Si llegaron opciones, asegurarse de que el modal no quede abierto por un render intermedio
    setSinPermisosModal(false);

    // Belt-and-suspenders: si sede sigue vacío, selecciona la primera
    if (!sede) {
      setSede(user.sucursales[0].idSede);
    }
  }, [user, loading, opciones, sede, setSede]);

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

  const sucursales = useMemo(() => {
    return (user?.sucursales ?? []).map((s) => ({
      id: s.idSede,
      nombre: s.descripcion,
    }));
  }, [user?.sucursales]);

  return (
    /*
     * Desktop (≥ 900px):
     *  ┌────────────────────────────────────────────────┐
     *  │ [sidebar flotante] │ [header flotante]          │
     *  │                    │────────────────────────────│
     *  │                    │ contenido (Outlet)          │
     *  ├─────────────────────────────────────────────────┤
     *  │ Footer — ancho completo                         │
     *  └─────────────────────────────────────────────────┘
     *
     * Mobile (< 900px):
     *  ┌────────────────────────────────────────────────┐
     *  │ [☰] [header flotante]                          │
     *  │────────────────────────────────────────────────│
     *  │ contenido (Outlet)                              │
     *  ├─────────────────────────────────────────────────┤
     *  │ Footer — ancho completo                         │
     *  └─────────────────────────────────────────────────┘
     *  Al tocar ☰ → sidebar flota sobre el contenido con backdrop
     */
    <div
      style={{
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        backgroundColor: "#f0f4f8",
      }}
    >
      {/* ── Modal: usuario sin sedes asignadas ──────────────────────── */}
      <HceModal
        open={sinSedesModal}
        title="Sin sedes asignadas"
        description="Tu usuario no tiene sedes asignadas en el sistema. Por favor contacta con el administrador para que te asignen acceso a una sede."
        icon={<UiWarningIcon size={28} />}
        iconBgColor="#b91c1c"
        confirmButton={{
          label: "Aceptar",
          onClick: handleSinSedesAceptar,
        }}
      />

      {/* ── Modal: usuario sin permisos de acceso ────────────────────── */}
      <HceModal
        open={sinPermisosModal}
        title="Sin permisos de acceso"
        description="Tu usuario no tiene módulos habilitados en el sistema. Por favor contacta con el administrador para que te asignen los permisos correspondientes."
        icon={<UiWarningIcon size={28} />}
        iconBgColor="#b91c1c"
        confirmButton={{
          label: "Aceptar",
          onClick: handleSinPermisosAceptar,
        }}
      />

      {/* ── SIDEBAR MÓVIL: backdrop + overlay ───────────────────────── */}
      {isMobile && mobileOpen && (
        <>
          {/* Backdrop — click cierra el sidebar */}
          <div
            onClick={closeMobileSidebar}
            style={{
              position: "fixed",
              inset: 0,
              backgroundColor: "rgba(0,0,0,0.45)",
              zIndex: 1299,
            }}
          />
          {/* Sidebar flotante sobre el contenido */}
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
            {/* <HceSidebar
              floating
              multiLevel={false}
              collapsed={false}
              onToggle={closeMobileSidebar}
              opciones={opciones}
              currentPath={location.pathname}
              onNavigate={(vista) => {
                closeMobileSidebar();
                if (vista) navigate(vista);
              }}
              onHome={() => {
                closeMobileSidebar();
                navigate("/home");
              }}
            /> */}
            <Sidebar
              floating
              multiLevel={false}
              collapsed={false}
              onToggle={closeMobileSidebar}
              opciones={opciones}
              currentPath={location.pathname}
              onNavigate={(vista:any) => {
                closeMobileSidebar();
                if (vista) navigate(vista);
              }}
              onHome={() => {
                closeMobileSidebar();
                navigate("/home");
              }}
            ></Sidebar>
          </div>
        </>
      )}

      {/* ── FILA CENTRAL: sidebar (desktop) + columna derecha ───────── */}
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
        {/* SIDEBAR DESKTOP — en flujo normal, oculto en mobile */}
        {!isMobile && (
          // <HceSidebar
          //   floating
          //   multiLevel={false}
          //   collapsed={collapsed}
          //   onToggle={() => setCollapsed((prev) => !prev)}
          //   opciones={opciones}
          //   currentPath={location.pathname}
          //   onNavigate={(vista) => {
          //     if (vista) navigate(vista);
          //   }}
          //   onHome={() => navigate("/home")}
          // />
          <Sidebar
              floating
              multiLevel={false}
              collapsed={collapsed}
              onToggle={() => setCollapsed((prev) => !prev)}
              opciones={opciones}
              currentPath={location.pathname}
              onNavigate={(vista:any) => {
                closeMobileSidebar();
                if (vista) navigate(vista);
              }}
              onHome={() => {
                closeMobileSidebar();
                navigate("/home");
              }}
            ></Sidebar>
        )}

        {/* COLUMNA DERECHA: header + contenido */}
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
            minWidth: 0,
          }}
        >
          {/* HEADER (mf-header) — flotante visual: borderRadius + sombra */}
          <Header
            floating
            sede={sede}
            sucursales={sucursales}
            onSedeCambiada={(id: any) => setSede(String(id))}
            userName={displayName}
            userRole={displayRole}
            userPhotoUrl={practitionerPhotoUrl ?? undefined}
            onLogout={handleLogout}
            onMenuClick={
              isMobile ? () => setMobileOpen((prev) => !prev) : undefined
            }
          />

          {/* CONTENIDO */}
          <main style={{ flex: 1, overflow: "auto", padding: "20px 0 0" }}>
            <Outlet />
          </main>
        </div>
      </div>

      {/* ── FOOTER — ancho completo fuera de la fila ────────────────── */}
      {/* <Footer copyright={copyright} color={hceColors.primary.blue[600]} /> */}
      <Footer/>
    </div>
  );
}
