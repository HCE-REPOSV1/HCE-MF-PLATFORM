import { useState, useEffect } from "react";
import { HceHeader } from "@hce/design-system";
import { useUser } from "shell/UserContext";
import { usePractitioner } from "./hooks/usePractitioner";

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

  // Resetear al cambiar de usuario (logout / cambio de cuenta)
  useEffect(() => {
    setCommitted(undefined)
  }, [user?.username])

  // Commit único cuando el practitioner termina de cargar.
  // Doctor → prefix + especialidad | Otro / no encontrado → user.nombrePerfil (auth/me)
  useEffect(() => {
    if (committed !== undefined) return
    if (practitionerLoading || !user) return

    if (practitionerData?.role_code === "doctor") {
      setCommitted({
        role:   practitionerSubtitle ?? null,
        prefix: practitionerData.name_prefix?.trim() || null,
      })
    } else {
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

  return (
    <div>
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
    </div>
  );
}
