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
  import type { componentType } from "react"
  const Header: ComponentType<Record<string, never>>
  export default Header
}
declare module "header/menuConfig" {
  export const menuConfig: MenuConfigItem[]
}

//─── Sidebar ──────────────────────────────────────────
declare module "sidebar/Sidebar" {
  import type { componentType } from "react"
  const Sidebar: ComponentType<Record<string, never>>
  export default Sidebar
}

//─── Footer ──────────────────────────────────────────
declare module "footer/Footer" {
  import type { componentType } from "react"
  const Footer: ComponentType<Record<string, never>>
  export default Footer
}