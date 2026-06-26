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

export default function Header({
  sede,
  sucursales,
  onSedeCambiada,
  onLogout,
  onMenuClick,
}: HeaderProps) {
  const { user } = useUser();

  // Foto y especialidad: desde el practitioner service cuando está disponible.
  // Si el servicio falla, el avatar muestra iniciales y el rol cae al perfil del AD.
  const { photoUrl, subtitle: practitionerSubtitle } = usePractitioner(user?.username);

  // Nombre: siempre desde /auth/me — inmediato, sin flash en blanco.
  const userName = user?.nombreCompleto;
  // Rol: especialidad del practitioner si es médico, sino su display de rol.
  // Fallback a nombrePerfil del AD si el practitioner service no responde.
  const userRole = practitionerSubtitle ?? user?.nombrePerfil;

  return (
    <div>
      {/* HEADER — flotante visual: borderRadius + sombra prueba de pr*/}
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
