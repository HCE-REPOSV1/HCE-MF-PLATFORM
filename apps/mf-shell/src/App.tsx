/**
 * ---------------------------------------------------------
 * Component: App
 * Author: Gregorovichz Carlos Rossi
 * Created: 09-03-2026
 * Description:
 * Componente raíz de la aplicación encargado de definir
 * las rutas principales del sistema utilizando React Router.
 *
 * Responsabilidades:
 * - Definir las rutas públicas y privadas de la aplicación
 * - Gestionar la navegación inicial
 * - Delegar el renderizado de la aplicación al Layout principal
 *
 * Arquitectura:
 * En una arquitectura de microfrontends, el componente App
 * actúa como punto de entrada del routing del Shell o de
 * cada microfrontend.
 *
 * Flujo de navegación:
 *
 * "/"       → Login (Pantalla de autenticación)
 * "/*"      → Layout (Contenedor principal de la aplicación)
 *
 * Tecnologías:
 * - React
 * - React Router
 * - Microfrontend Architecture
 *
 * ---------------------------------------------------------
 */
import { Routes, Route } from "react-router-dom"
import Login from "./pages/Login"
import Layout from "./Layout"
import Home from "home/Home"
import Patient from "patient/Patient"

/**
 * Componente raíz de la aplicación
 */
function App() {
  return (
    /**
     * Definición de rutas principales
     */

    <Routes>

      {/* Login */}
      <Route path="/" element={<Login />} />

      {/* Layout principal */}
      <Route path="/*" element={<Layout />}>

        <Route path="home" element={<Home />} />
        <Route path="patients" element={<Patient />} />

      </Route>

    </Routes>

  )
}

export default App