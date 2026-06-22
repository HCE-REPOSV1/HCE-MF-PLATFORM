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

  // Datos reales del practitioner: nombre con prefijo, especialidad y foto.
  // Se carga solo cuando el username está disponible tras el login.
  const {
    data: practitioner,
    photoUrl: practitionerPhotoUrl,
    subtitle: practitionerSubtitle,
  } = usePractitioner(user?.username);

  // Nombre a mostrar: name_text del practitioner si ya cargó, fallback al nombreCompleto del AD
  const userName = practitioner?.name_text ?? user?.nombreCompleto;
  // Subtítulo: especialidad o rol del practitioner, fallback al perfil del AD
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
        userPhotoUrl={practitionerPhotoUrl ?? undefined}
        onLogout={onLogout}
        onMenuClick={onMenuClick}
      />
    </div>
  );
}
