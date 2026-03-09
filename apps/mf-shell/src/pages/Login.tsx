/**
 * ---------------------------------------------------------
 * Component: Login
 * Author: Gregorovichz Carlos Rossi
 * Created: 09-03-2026
 * Description:
 * Componente responsable de gestionar la autenticación
 * inicial del usuario en la plataforma.
 *
 * Este componente muestra una interfaz simple de login
 * y simula un proceso de autenticación mediante un mock
 * de servicio. Si la autenticación es exitosa, redirige
 * al usuario al módulo principal de la aplicación.
 *
 * Responsabilidades:
 * - Mostrar interfaz de autenticación
 * - Consumir servicio de login (mock)
 * - Gestionar navegación post autenticación
 *
 * Arquitectura:
 * Forma parte de la capa de presentación del Shell o
 * microfrontend principal. Utiliza componentes del
 * Design System corporativo para mantener consistencia
 * visual en toda la plataforma.
 *
 * Flujo de autenticación:
 *
 * Login Page
 *      │
 *      ▼
 * Mock API (/mocks/login.json)
 *      │
 *      ▼
 * success = true
 *      │
 *      ▼
 * Navegación → /home
 *
 * Tecnologías:
 * - React
 * - React Router
 * - Design System
 * ---------------------------------------------------------
 */
import { useNavigate } from "react-router-dom"
import { Button } from "@design-system/atoms/Button/Button"
/**
 * Componente Login
 */
export default function Login() {
  /**
   * Hook de navegación de React Router
   */
  const navigate = useNavigate()
  /**
   * Función que simula el proceso de autenticación
   */
  const login = async () => {
    // Consumo de servicio mock de autenticación
    const res = await fetch("/mocks/login.json")
    const data = await res.json()
    // Si el login es exitoso se redirige al dashboard
    if (data.success) {
      navigate("/home")
    }
  }
  return (
    <div style={{ padding: "40px" }}>
      {/* Título de la plataforma */}
      <h1>Jarvis MF Platform</h1>
      {/* Botón del Design System */}
      <Button
        label="Login"
        onClick={login}
      />
    </div>
  )
}