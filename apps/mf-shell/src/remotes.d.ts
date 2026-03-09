/**
 * ---------------------------------------------------------
 * File: remotes.d.ts
 * Author: Gregorovichz Carlos Rossi
 * Created: 09-03-2026
 * Description:
 * Declaraciones de módulos remotos utilizados en la
 * arquitectura de microfrontends mediante Module Federation.
 *
 * Este archivo permite que TypeScript reconozca los módulos
 * expuestos por otros microfrontends que se cargan de forma
 * dinámica en tiempo de ejecución.
 *
 * Contexto Arquitectónico:
 * En una arquitectura de microfrontends, cada aplicación
 * puede exponer componentes que serán consumidos por
 * el microfrontend contenedor (Shell).
 *
 * Estas declaraciones actúan como contratos de tipos
 * para permitir la correcta compilación del proyecto.
 *
 * Tecnologías:
 * - React
 * - TypeScript
 * - Module Federation
 * - Microfrontend Architecture
 *
 * Ejemplo de uso:
 *
 * const Header = React.lazy(() => import("header/Header"))
 *
 * ---------------------------------------------------------
 */
import React from "react"
/**
 * Microfrontend remoto: Header
 *
 * Proporciona el encabezado principal de la aplicación,
 * normalmente contiene logo, usuario autenticado y
 * accesos rápidos.
 */
declare module "header/Header" {
  const Header: React.ComponentType<any>
  export default Header
}
/**
 * Microfrontend remoto: Navigation
 *
 * Responsable del menú de navegación principal de la
 * plataforma. Permite acceder a los distintos módulos
 * funcionales del sistema.
 */
declare module "navigation/Navigation" {
  const Navigation: React.ComponentType<any>
  export default Navigation
}
/**
 * Microfrontend remoto: Home
 *
 * Vista principal o dashboard inicial de la aplicación.
 */
declare module "home/Home" {
  const Home: React.ComponentType<any>
  export default Home
}
/**
 * Microfrontend remoto: Patient
 *
 * Módulo funcional encargado de la gestión de pacientes.
 * Incluye funcionalidades como registro, consulta y
 * actualización de información clínica.
 */
declare module "patient/Patient" {
  const Patient: React.ComponentType<any>
  export default Patient
}