import { useState, useEffect, useMemo } from "react";
import { HceBreadcrumb, HceHeader } from "@hce/design-system";
import { useUser } from "shell/UserContext";
import { usePractitioner } from "./hooks/usePractitioner";

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

  // DEBUG temporal — trazar cada render para ver qué cambia y cuándo.
  console.log("[Header] render", {
    username: user?.username,
    practitionerLoading,
    practitionerData,
    practitionerSubtitle,
    committed,
  })

  // Resetear al cambiar de usuario (logout / cambio de cuenta)
  useEffect(() => {
    console.log("[Header] reset committed — user?.username cambió a", user?.username)
    setCommitted(undefined)
  }, [user?.username])

  // Commit único cuando el practitioner termina de cargar.
  // Doctor → prefix + especialidad | Otro / no encontrado → user.nombrePerfil (auth/me)
  useEffect(() => {
    if (committed !== undefined) {
      console.log("[Header] commit effect — ya hay committed, no hace nada", committed)
      return
    }
    if (practitionerLoading || !user) {
      console.log("[Header] commit effect — esperando", { practitionerLoading, hasUser: !!user })
      return
    }

    if (practitionerData?.role_code === "doctor") {
      console.log("[Header] commit effect — DOCTOR", {
        role_code: practitionerData.role_code,
        name_prefix: practitionerData.name_prefix,
        practitionerSubtitle,
      })
      setCommitted({
        role:   practitionerSubtitle ?? null,
        prefix: practitionerData.name_prefix?.trim() || null,
      })
    } else {
      console.log("[Header] commit effect — FALLBACK (no doctor / sin practitioner)", {
        practitionerData,
        role_code: practitionerData?.role_code,
        nombrePerfil: user.nombrePerfil,
      })
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
    
  
  );
}
