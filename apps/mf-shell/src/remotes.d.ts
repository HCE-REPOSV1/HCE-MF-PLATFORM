/**
 * ---------------------------------------------------------
 * File: remotes.d.ts
 * Description:
 * Declaraciones de módulos remotos consumidos via Module Federation.
 * IMPORTANTE: este archivo NO debe tener imports a nivel raíz.
 * ---------------------------------------------------------
 */

// ─── Shared type for all menuConfig remotes ───────────────
type MenuConfigItem = {
  label:      string
  path:       string
  icon:       import("react").ComponentType<{ size?: number }>
  permission: string
}

// ─── Auth ─────────────────────────────────────────────────
declare module "auth/Login" {
  import type { ComponentType } from "react"
  interface LoginProps { onSuccess?: (sede: string) => void }
  const Login: ComponentType<LoginProps>
  export default Login
}

// ─── Home ─────────────────────────────────────────────────
declare module "home/Home" {
  import type { ComponentType } from "react"
  const Home: ComponentType<Record<string, never>>
  export default Home
}

// ─── Emergency ────────────────────────────────────────────
declare module "emergency/Emergency" {
  import type { ComponentType } from "react"
  const Emergency: ComponentType<Record<string, never>>
  export default Emergency
}
declare module "emergency/menuConfig" {
  export const menuConfig: MenuConfigItem[]
}
declare module "emergency/EmergencyTV" {
  import type { ComponentType } from "react"

  const EmergencyTV: ComponentType<Record<string, never>>

  export default EmergencyTV
}
// ─── Hospital ─────────────────────────────────────────────
declare module "hospital/Hospital" {
  import type { ComponentType } from "react"
  const Hospital: ComponentType<Record<string, never>>
  export default Hospital
}
declare module "hospital/menuConfig" {
  export const menuConfig: MenuConfigItem[]
}

// ─── Ambulatorio ──────────────────────────────────────────
declare module "ambulatorio/Ambulatorio" {
  import type { ComponentType } from "react"
  const Ambulatorio: ComponentType<Record<string, never>>
  export default Ambulatorio
}
declare module "ambulatorio/menuConfig" {
  export const menuConfig: MenuConfigItem[]
}

// ─── Auditoria ────────────────────────────────────────────
declare module "auditoria/Auditoria" {
  import type { ComponentType } from "react"
  const Auditoria: ComponentType<Record<string, never>>
  export default Auditoria
}
declare module "auditoria/menuConfig" {
  export const menuConfig: MenuConfigItem[]
}

//─── Header ──────────────────────────────────────────
declare module "header/Header" {
  import type { ComponentType } from "react"
  interface Sucursal {
    id:     string | number
    nombre: string
  }
  interface HeaderProps {
    sede?:           string
    sucursales?:     Sucursal[]
    onSedeCambiada?: (id: string | number) => void
    onLogout?:       () => void
    onMenuClick?:    () => void
    floating?:       boolean
  }
  const Header: ComponentType<HeaderProps>
  export default Header
}
declare module "header/menuConfig" {
  export const menuConfig: MenuConfigItem[]
}

//─── Sidebar ──────────────────────────────────────────
declare module "sidebar/Sidebar" {
  import type { ComponentType } from "react"
  import type { OpcionMAC } from "@hce/design-system"
  interface SidebarProps {
    multiLevel?:  boolean
    collapsed?:   boolean
    onToggle?:    () => void
    opciones?:    OpcionMAC[]
    currentPath?: string
    onNavigate?:  (vista: string) => void
    onHome?:      () => void
  }
  const Sidebar: ComponentType<SidebarProps>
  export default Sidebar
}

//─── Footer ──────────────────────────────────────────
declare module "footer/Footer" {
  import type { ComponentType } from "react"
  const Footer: ComponentType<Record<string, never>>
  export default Footer
}

