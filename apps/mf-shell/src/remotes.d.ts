/**
 * ---------------------------------------------------------
 * File: remotes.d.ts
 * Description:
 * Declaraciones de módulos remotos consumidos via Module Federation.
 * IMPORTANTE: este archivo NO debe tener imports a nivel raíz.
 * Si los tiene, TypeScript lo trata como un módulo y las
 * declaraciones "declare module" dejan de ser ambientales globales.
 * ---------------------------------------------------------
 */

declare module "header/Header" {
  import type { ComponentType } from "react"
  const Header: ComponentType<Record<string, never>>
  export default Header
}

declare module "navigation/Navigation" {
  import type { ComponentType } from "react"
  type NavigationProps = {
    onNavigate: (path: string) => void
    collapsed?: boolean
  }
  const Navigation: ComponentType<NavigationProps>
  export default Navigation
}

declare module "home/Home" {
  import type { ComponentType } from "react"
  const Home: ComponentType<Record<string, never>>
  export default Home
}

declare module "patient/Patient" {
  import type { ComponentType } from "react"
  const Patient: ComponentType<Record<string, never>>
  export default Patient
}

declare module "emergency/Emergency" {
  import type { ComponentType } from "react"
  const Emergency: ComponentType<Record<string, never>>
  export default Emergency
}
