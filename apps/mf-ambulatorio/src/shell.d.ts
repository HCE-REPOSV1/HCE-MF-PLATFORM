declare module "shell/UserContext" {
  export interface Sucursal {
    idSede:      string
    descripcion: string
  }
  export interface UserProfile {
    userId:          string
    username:        string
    email:           string
    roles:           string[]
    idUsuario:       string
    nombres:         string
    apellidoPaterno: string
    apellidoMaterno: string
    nombreCompleto:  string
    nombrePerfil:    string
    numeroDocumento: string
    idPerfil:        string
    sucursales:      Sucursal[]
    sessionId:       string
  }
  export interface Permiso {
    codigo:    string
    titulo:    string
    indicador: string
  }
  export function useUser(): {
    user:          UserProfile | null
    permisos:      Permiso[]
    sede:          string
    loading:       boolean
    hasPermission: (codigo: string) => boolean
    refetch:       () => Promise<void>
    logout:        () => Promise<void>
    setSede:       (sede: string) => void
  }
}
