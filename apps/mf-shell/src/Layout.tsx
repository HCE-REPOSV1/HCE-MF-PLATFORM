/**
 * ---------------------------------------------------------
 * Component: Layout
 * Author: Gregorovichz Carlos Rossi
 * Created: 09-03-2026
 * Description:
 * Layout principal de la aplicación encargado de orquestar
 * los distintos microfrontends que conforman la interfaz
 * de usuario dentro del Shell.
 *
 * Responsabilidades:
 * - Renderizar componentes compartidos (Header y Navigation)
 * - Definir la estructura visual de la aplicación
 * - Gestionar el enrutamiento entre microfrontends
 * - Actuar como contenedor de los módulos funcionales
 *
 * Arquitectura:
 * Este componente forma parte del microfrontend Shell y
 * consume microfrontends remotos expuestos mediante
 * Module Federation.
 *
 * Microfrontends integrados:
 * - Header: Encabezado principal de la aplicación
 * - Navigation: Menú lateral de navegación
 * - Home: Dashboard o vista principal
 * - Patient: Módulo de gestión de pacientes
 *
 * Tecnologías:
 * - React
 * - React Router
 * - Module Federation
 * - Microfrontend Architecture
 *
 * Estructura visual:
 *
 * Layout
 * ├── Header (MF)
 * └── Body
 *     ├── Navigation (MF)
 *     └── Content Area
 *          ├── /home → Home (MF)
 *          └── /patient → Patient (MF)
 *
 * ---------------------------------------------------------
 */
import Header from "header/Header"
import Navigation from "navigation/Navigation"
import Home from "home/Home"
import Patient from "patient/Patient"
import { Routes, Route } from "react-router-dom"
/**
 * Layout principal del Shell
 */
export default function Layout() {
  return (
    <div>
      {/* Microfrontend: Header */}
      <Header />
      {/* Contenedor principal del layout */}
      <div style={{ display: "flex" }}>
        {/* Microfrontend: Menú de navegación lateral */}
        <Navigation />
         {/* Área de contenido dinámico */}
        <div style={{ padding: 20, flex: 1 }}>
          {/* Configuración de rutas de la aplicación */}
          <Routes>
            <Route path="/home" element={<Home />} />
            <Route path="/patient" element={<Patient />} />
          </Routes>
        </div>
      </div>
    </div>
  )
}