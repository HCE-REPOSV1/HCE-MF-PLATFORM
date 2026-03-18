import React, { useState } from "react"
import { createRoot } from "react-dom/client"
import { addons, types } from "@storybook/manager-api"
import { create } from "@storybook/theming/create"

const STORAGE_KEY = "sb_hce_auth"
const VALID_USER  = "admin"
const VALID_PASS  = "admin"

// ─── Tema / nombre del proyecto ────────────────────────────────────
addons.setConfig({
  theme: create({
    base:       "dark",
    brandTitle: "Storybook — Proyecto HCE",
    brandUrl:   "javascript:void(0)",
  }),
})

// ─── Botón de logout en la toolbar ─────────────────────────────────
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
          border:          "1px solid #ef4444",
          borderRadius:    6,
          color:           "#ef4444",
          cursor:          "pointer",
          fontSize:        12,
          fontWeight:      600,
          padding:         "4px 10px",
          margin:          "0 6px",
          fontFamily:      "inherit",
          transition:      "all 0.2s",
        }}
        onMouseEnter={e => {
          const t = e.currentTarget
          t.style.backgroundColor = "#ef4444"
          t.style.color = "#fff"
        }}
        onMouseLeave={e => {
          const t = e.currentTarget
          t.style.backgroundColor = "transparent"
          t.style.color = "#ef4444"
        }}
      >
        ⏻ Cerrar sesión
      </button>
    ),
  })
})

// ─── Login gate ─────────────────────────────────────────────────────
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

  return (
    <div style={{
      display:        "flex",
      alignItems:     "center",
      justifyContent: "center",
      width:          "100%",
      height:         "100%",
      fontFamily:     "'Inter', 'Segoe UI', sans-serif",
    }}>
      <div style={{
        backgroundColor: "#1e293b",
        border:          "1px solid #334155",
        borderRadius:    14,
        padding:         "44px 40px",
        width:           340,
        boxShadow:       "0 25px 60px rgba(0,0,0,0.6)",
      }}>
        {/* Logo */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, justifyContent: "center", marginBottom: 6 }}>
          <div style={{
            width: 38, height: 38, borderRadius: 8,
            backgroundColor: "#3b82f6", color: "#fff",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontWeight: 800, fontSize: 20,
          }}>H</div>
          <span style={{ color: "#f1f5f9", fontSize: 17, fontWeight: 700 }}>
            Proyecto HCE
          </span>
        </div>

        <p style={{ textAlign: "center", color: "#64748b", fontSize: 13, marginTop: 4, marginBottom: 32 }}>
          Storybook — acceso restringido
        </p>

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <label style={{ color: "#94a3b8", fontSize: 13, fontWeight: 500 }}>Usuario</label>
            <input
              type="text"
              value={user}
              onChange={e => { setUser(e.target.value); setError("") }}
              placeholder="admin"
              autoFocus
              autoComplete="username"
              style={{
                backgroundColor: "#0f172a", border: "1px solid #334155",
                borderRadius: 8, color: "#f1f5f9", fontSize: 14,
                padding: "10px 12px", outline: "none",
                width: "100%", boxSizing: "border-box",
              }}
            />
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <label style={{ color: "#94a3b8", fontSize: 13, fontWeight: 500 }}>Contraseña</label>
            <input
              type="password"
              value={pass}
              onChange={e => { setPass(e.target.value); setError("") }}
              placeholder="••••••"
              autoComplete="current-password"
              style={{
                backgroundColor: "#0f172a", border: "1px solid #334155",
                borderRadius: 8, color: "#f1f5f9", fontSize: 14,
                padding: "10px 12px", outline: "none",
                width: "100%", boxSizing: "border-box",
              }}
            />
          </div>

          {error && (
            <p style={{ color: "#f87171", fontSize: 13, margin: 0, textAlign: "center" }}>
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              backgroundColor: "#3b82f6", border: "none", borderRadius: 8,
              color: "#fff", cursor: loading ? "not-allowed" : "pointer",
              fontSize: 14, fontWeight: 600, padding: "12px",
              marginTop: 4, opacity: loading ? 0.7 : 1,
            }}
          >
            {loading ? "Verificando..." : "Ingresar"}
          </button>
        </form>
      </div>
    </div>
  )
}

if (sessionStorage.getItem(STORAGE_KEY) !== "true") {
  const overlay = document.createElement("div")
  overlay.id = "hce-auth-overlay"
  overlay.style.cssText = "position:fixed;inset:0;z-index:999999;background:#0f172a;display:flex;align-items:center;justify-content:center;"
  document.body.appendChild(overlay)

  const root = createRoot(overlay)
  root.render(<LoginScreen onSuccess={() => overlay.remove()} />)
}
