import { HceHeader } from "@hce/design-system";

interface Sucursal {
  id: string | number;
  nombre: string;
}

interface HeaderProps {
  sede?: string;
  sucursales?: Sucursal[];
  onSedeCambiada?: (id: string | number) => void;
  userName?: string | undefined;
  userRole?: string | undefined;
  userPhotoUrl?: string | undefined;
  onLogout?: () => void;
  onMenuClick?: (() => void) | undefined;
  floating?: boolean;
}

export default function Header({
  sede,
  sucursales,
  onSedeCambiada,
  userName,
  userRole,
  userPhotoUrl,
  onLogout,
  onMenuClick,
}: HeaderProps) {
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
        userPhotoUrl={userPhotoUrl ?? undefined}
        onLogout={onLogout}
        onMenuClick={onMenuClick}
      />
    </div>
  );
}
