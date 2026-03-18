import React, { useState } from "react"
import { createRoot } from "react-dom/client"
import { addons, types } from "@storybook/manager-api"
import { create } from "@storybook/theming/create"

const STORAGE_KEY = "sb_hce_auth"
const VALID_USER  = "admin"
const VALID_PASS  = "admin"

// ─── Paleta del proyecto (variante oscura) ──────────────────────────
const C = {
  primary:      "#1E4FA3",
  primaryDark:  "#153B7A",
  primaryLight: "#EEF2F9",
  secondary:    "#6FB23F",
  surface:      "#FFFFFF",
  surfaceLight: "#F5F7FA",
  background:   "#F7F9FC",
  textPrimary:  "#374151",
  textSecond:   "#6B7280",
  border:       "#E5E7EB",
  sidebarBg:    "#F3F4F6",   // sidebar gris claro original
}

// ─── Tema Storybook con paleta del proyecto ─────────────────────────
addons.setConfig({
  theme: create({
    base:            "light",
    brandTitle:      "Storybook — Proyecto HCE",
    brandUrl:        "javascript:void(0)",

    // Colores de la UI
    colorPrimary:    C.primary,
    colorSecondary:  C.primary,

    // App shell
    appBg:           C.sidebarBg,
    appContentBg:    C.surface,
    appPreviewBg:    C.background,
    appBorderColor:  C.border,
    appBorderRadius: 8,

    // Toolbar
    barBg:           C.primary,
    barTextColor:    "rgba(255,255,255,0.85)",
    barSelectedColor: C.secondary,
    barHoverColor:   "#FFFFFF",

    // Inputs
    inputBg:         C.surface,
    inputBorder:     C.border,
    inputTextColor:  C.textPrimary,
    inputBorderRadius: 6,

    // Texto global
    textColor:        C.textPrimary,
    textInverseColor: C.surface,
    textMutedColor:   C.textSecond,

    // Fuente del proyecto
    fontBase:   "'Montserrat', 'Segoe UI', sans-serif",
    fontCode:   "'Fira Mono', monospace",
  }),
})

// ─── Botón cerrar sesión en toolbar ────────────────────────────────
addons.register("hce/logout", () => {
  addons.add("hce/logout/tool", {
    type:  types.TOOL,
    title: "Cerrar sesión",
    match: () => true,
    render: () => (
      <button
        title="Cerrar sesión"
        onClick={() => {
          sessionStorage.removeItem(STORAGE_KEY)
          window.location.reload()
        }}
        style={{
          display:         "flex",
          alignItems:      "center",
          gap:             6,
          background:      "transparent",
          border:          "1px solid rgba(255,255,255,0.5)",
          borderRadius:    6,
          color:           "#FFFFFF",
          cursor:          "pointer",
          fontSize:        12,
          fontWeight:      600,
          padding:         "4px 10px",
          margin:          "0 6px",
          fontFamily:      "'Montserrat', sans-serif",
          transition:      "all 0.2s",
        }}
        onMouseEnter={e => {
          e.currentTarget.style.background      = "rgba(255,255,255,0.15)"
          e.currentTarget.style.borderColor     = "#FFFFFF"
        }}
        onMouseLeave={e => {
          e.currentTarget.style.background      = "transparent"
          e.currentTarget.style.borderColor     = "rgba(255,255,255,0.5)"
        }}
      >
        ⏻ Cerrar sesión
      </button>
    ),
  })
})

// ─── Pantalla de login ──────────────────────────────────────────────
function LoginScreen({ onSuccess }: { onSuccess: () => void }) {
  const [user, setUser]       = useState("")
  const [pass, setPass]       = useState("")
  const [error, setError]     = useState("")
  const [loading, setLoading] = useState(false)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setTimeout(() => {
      if (user === VALID_USER && pass === VALID_PASS) {
        sessionStorage.setItem(STORAGE_KEY, "true")
        onSuccess()
      } else {
        setError("Usuario o contraseña incorrectos")
        setLoading(false)
      }
    }, 400)
  }

  const inputStyle: React.CSSProperties = {
    backgroundColor: C.surfaceLight,
    border:          `1px solid ${C.border}`,
    borderRadius:    8,
    color:           C.textPrimary,
    fontSize:        14,
    padding:         "10px 12px",
    outline:         "none",
    width:           "100%",
    boxSizing:       "border-box",
    fontFamily:      "'Montserrat', sans-serif",
    transition:      "border-color 0.2s",
  }

  return (
    <div style={{
      display:         "flex",
      alignItems:      "center",
      justifyContent:  "center",
      width:           "100%",
      height:          "100%",
      fontFamily:      "'Montserrat', 'Segoe UI', sans-serif",
    }}>
      <div style={{
        backgroundColor: "#ffffff",
        border:          "1px solid #e2e8f0",
        borderRadius:    14,
        padding:         "44px 40px",
        width:           360,
        boxShadow:       "0 24px 64px rgba(0,0,0,0.4)",
      }}>

        {/* Header del card */}
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div style={{
            width:           52,
            height:          52,
            borderRadius:    12,
            backgroundColor: C.primary,
            color:           "#fff",
            display:         "flex",
            alignItems:      "center",
            justifyContent:  "center",
            fontWeight:      800,
            fontSize:        24,
            margin:          "0 auto 14px",
            boxShadow:       `0 4px 16px rgba(30,79,163,0.3)`,
          }}>H</div>

          <h2 style={{
            margin:        0,
            color:         "#1e293b",
            fontSize:      18,
            fontWeight:    700,
            letterSpacing: "-0.02em",
          }}>
            Proyecto HCE
          </h2>
          <p style={{ margin: "6px 0 0", color: "#64748b", fontSize: 13 }}>
            Storybook — acceso restringido
          </p>
        </div>

        {/* Separador con color primario */}
        <div style={{
          height:       3,
          borderRadius: 2,
          background:   `linear-gradient(90deg, ${C.primary}, ${C.secondary})`,
          marginBottom: 28,
        }} />

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <label style={{ color: "#64748b", fontSize: 12, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>
              Usuario
            </label>
            <input
              type="text"
              value={user}
              onChange={e => { setUser(e.target.value); setError("") }}
              placeholder="admin"
              autoFocus
              autoComplete="username"
              style={{ ...inputStyle, backgroundColor: "#f8fafc", border: "1px solid #e2e8f0", color: "#1e293b" }}
              onFocus={e => { e.currentTarget.style.borderColor = C.primary }}
              onBlur={e  => { e.currentTarget.style.borderColor = "#e2e8f0" }}
            />
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <label style={{ color: "#64748b", fontSize: 12, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>
              Contraseña
            </label>
            <input
              type="password"
              value={pass}
              onChange={e => { setPass(e.target.value); setError("") }}
              placeholder="••••••"
              autoComplete="current-password"
              style={{ ...inputStyle, backgroundColor: "#f8fafc", border: "1px solid #e2e8f0", color: "#1e293b" }}
              onFocus={e => { e.currentTarget.style.borderColor = C.primary }}
              onBlur={e  => { e.currentTarget.style.borderColor = "#e2e8f0" }}
            />
          </div>

          {error && (
            <p style={{ color: "#ef4444", fontSize: 13, margin: 0, textAlign: "center", fontWeight: 500 }}>
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              backgroundColor: loading ? C.primaryDark : C.primary,
              border:          "none",
              borderRadius:    8,
              color:           "#fff",
              cursor:          loading ? "not-allowed" : "pointer",
              fontSize:        14,
              fontWeight:      700,
              padding:         "12px",
              marginTop:       4,
              fontFamily:      "'Montserrat', sans-serif",
              letterSpacing:   "0.02em",
              transition:      "background-color 0.2s",
              boxShadow:       loading ? "none" : `0 4px 12px rgba(30,79,163,0.3)`,
            }}
            onMouseEnter={e => { if (!loading) e.currentTarget.style.backgroundColor = C.primaryDark }}
            onMouseLeave={e => { if (!loading) e.currentTarget.style.backgroundColor = C.primary }}
          >
            {loading ? "Verificando..." : "Ingresar"}
          </button>
        </form>
      </div>
    </div>
  )
}

// ─── Gate ───────────────────────────────────────────────────────────
if (sessionStorage.getItem(STORAGE_KEY) !== "true") {
  const overlay = document.createElement("div")
  overlay.id = "hce-auth-overlay"
  overlay.style.cssText = [
    "position:fixed", "inset:0", "z-index:999999",
    "background:#1E4FA3",
    "display:flex", "align-items:center", "justify-content:center",
  ].join(";")
  document.body.appendChild(overlay)

  const root = createRoot(overlay)
  root.render(<LoginScreen onSuccess={() => overlay.remove()} />)
}
