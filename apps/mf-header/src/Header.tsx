import { useState, useEffect, useMemo, useSyncExternalStore } from "react";
import { HceBreadcrumb, HceHeader } from "@hce/design-system";
import { useUser } from "shell/UserContext";
import { usePractitioner } from "./hooks/usePractitioner";
import { pushDebugLog, getDebugLog, subscribeDebugLog } from "./debugLog";

import { useLocation, useNavigate } from "react-router-dom";


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
type CommittedData = {
  role:   string | null  // subtítulo a mostrar (null = ocultar)
  prefix: string | null  // prefijo del nombre (Dr., Dra., etc.) o null
} | undefined




const BREADCRUMB_LABELS: Record<string, string> = {
  home: "Home",
  emergencia:  "Monitor de emergencia",
  historiacli: "Historia clínica",
  hospital: "Hospital",
  ambulatorio: "Ambulatorio",
  auditoria: "Auditoría",
}

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

  const [committed, setCommitted] = useState<CommittedData>(undefined)

  // DEBUG temporal — se muestra en pantalla (no en consola) porque abrir DevTools cambia
  // el timing lo suficiente como para que el bug no se reproduzca. Comparte buffer con
  // usePractitioner.ts (debugLog.ts) para ver los reintentos y el commit en una sola
  // línea de tiempo. Borrar junto con el overlay más abajo una vez resuelto el bug.
  const debugLines = useSyncExternalStore(subscribeDebugLog, getDebugLog)
  pushDebugLog(`Header render user=${user?.username ?? "∅"} loading=${practitionerLoading} role_code=${practitionerData?.role_code ?? "∅"} committed=${committed === undefined ? "undefined" : JSON.stringify(committed)}`)

  // Resetear al cambiar de usuario (logout / cambio de cuenta)
  useEffect(() => {
    pushDebugLog(`Header RESET committed — username cambió a ${user?.username ?? "∅"}`)
    setCommitted(undefined)
  }, [user?.username])

  // Commit único cuando el practitioner termina de cargar.
  // Doctor → prefix + especialidad | Otro / no encontrado → user.nombrePerfil (auth/me)
  useEffect(() => {
    if (committed !== undefined) {
      pushDebugLog(`Header commit effect — ya hay committed, no hace nada`)
      return
    }
    if (practitionerLoading || !user) {
      pushDebugLog(`Header commit effect — esperando (loading=${practitionerLoading} hasUser=${!!user})`)
      return
    }

    if (practitionerData?.role_code === "doctor") {
      pushDebugLog(`Header commit effect — DOCTOR prefix=${practitionerData.name_prefix} subtitle=${practitionerSubtitle}`)
      setCommitted({
        role:   practitionerSubtitle ?? null,
        prefix: practitionerData.name_prefix?.trim() || null,
      })
    } else {
      pushDebugLog(`Header commit effect — FALLBACK role_code=${practitionerData?.role_code ?? "∅"} nombrePerfil=${user.nombrePerfil}`)
      setCommitted({
        role:   user.nombrePerfil ?? null,
        prefix: null,
      })
    }
  }, [committed, practitionerLoading, user, practitionerData, practitionerSubtitle])

  const prefix   = committed?.prefix
  const userName = prefix
    ? `${prefix} ${user?.nombreCompleto ?? ''}`
    : user?.nombreCompleto

  const userRole = committed?.role ?? undefined


  const location = useLocation()
  const navigate = useNavigate()

  const breadcrumbItems = useMemo(() => {
    const segments = location.pathname
      .split("/")
      .filter(Boolean)

    if (segments.length <= 1 && segments[0] === "home") {
      return []
    }

    return segments.map((segment, index) => {
      const href = `/${segments.slice(0, index + 1).join("/")}`

      return {
        label: BREADCRUMB_LABELS[segment] ?? segment,
        href,
      }
    })
  }, [location.pathname])

  const showBreadcrumb = breadcrumbItems.length > 0

  

  return (
    <>
    <div    style={{ display: "flex", flexDirection: "column", gap: 20, width: "100%" }}>
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
      />
    

    
     {showBreadcrumb && (
          <div style={{ flex: 1, overflow: "auto", padding: "0 0 0 20px" }}>
            <HceBreadcrumb
              items={breadcrumbItems}
              onItemClick={(item) => {
                if (item.href) {
                  navigate(item.href)
                }
              }}
            />
          </div>
        )}

    </div>

    {/* DEBUG temporal — overlay visible en pantalla, borrar junto con pushDebugLog
        una vez resuelto el bug del subtítulo. */}
    <div style={{
      position: "fixed",
      bottom: 0,
      left: 0,
      right: 0,
      maxHeight: "35vh",
      overflow: "auto",
      background: "rgba(0,0,0,0.92)",
      color: "#7CFC7C",
      fontFamily: "monospace",
      fontSize: 10,
      lineHeight: 1.4,
      padding: "6px 10px",
      zIndex: 999999,
      whiteSpace: "pre-wrap",
      pointerEvents: "none",
    }}>
      {debugLines.join("\n")}
    </div>
    </>
  );
}
