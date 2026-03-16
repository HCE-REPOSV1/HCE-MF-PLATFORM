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
 */import { useNavigate } from "react-router-dom"
import { useState } from "react"
import { Button } from "@design-system/atoms/Button/Button"

import "./login.css"

export default function Login() {

  const navigate = useNavigate()

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")

  const login = async () => {

    const res = await fetch("/mocks/login.json")
    const data = await res.json()

    if (data.success) {
      navigate("/home")
    }
  }

  return (

    <div className="login-page">

      <div className="login-card">

        <h1 className="login-title">
          Welcome Jarvis Platform!
        </h1>

        <div className="login-form">

          <input
            type="text"
            placeholder="Email or phone"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <Button
            label="Sign In"
            onClick={login}
          />

        </div>

      </div>

    </div>

  )
}