import React, { useState } from "react"

const STORAGE_KEY = "sb_jarvis_auth"
const VALID_USER  = "admin"
const VALID_PASS  = "admin"

function isAuthenticated() {
  return localStorage.getItem(STORAGE_KEY) === "true"
}

export function LoginGate({ children }: { children: React.ReactNode }) {
  const [authed, setAuthed]   = useState(isAuthenticated)
  const [user, setUser]       = useState("")
  const [pass, setPass]       = useState("")
  const [error, setError]     = useState("")
  const [loading, setLoading] = useState(false)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setTimeout(() => {
      if (user === VALID_USER && pass === VALID_PASS) {
        localStorage.setItem(STORAGE_KEY, "true")
        setAuthed(true)
      } else {
        setError("Usuario o contraseña incorrectos")
      }
      setLoading(false)
    }, 400)
  }

  if (authed) return <>{children}</>

  return (
    <div style={styles.overlay}>
      <div style={styles.card}>

        {/* Logo / marca */}
        <div style={styles.logo}>
          <div style={styles.logoIcon}>J</div>
          <span style={styles.logoText}>Jarvis Design System</span>
        </div>

        <p style={styles.subtitle}>Storybook — acceso restringido</p>

        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.field}>
            <label style={styles.label}>Usuario</label>
            <input
              style={styles.input}
              type="text"
              value={user}
              onChange={e => { setUser(e.target.value); setError("") }}
              placeholder="admin"
              autoFocus
              autoComplete="username"
            />
          </div>

          <div style={styles.field}>
            <label style={styles.label}>Contraseña</label>
            <input
              style={styles.input}
              type="password"
              value={pass}
              onChange={e => { setPass(e.target.value); setError("") }}
              placeholder="••••••"
              autoComplete="current-password"
            />
          </div>

          {error && <p style={styles.error}>{error}</p>}

          <button
            type="submit"
            style={{ ...styles.button, opacity: loading ? 0.7 : 1 }}
            disabled={loading}
          >
            {loading ? "Verificando..." : "Ingresar"}
          </button>
        </form>
      </div>
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  overlay: {
    position:        "fixed",
    inset:           0,
    display:         "flex",
    alignItems:      "center",
    justifyContent:  "center",
    backgroundColor: "#0f172a",
    zIndex:          99999,
    fontFamily:      "'Inter', 'Segoe UI', sans-serif",
  },
  card: {
    backgroundColor: "#1e293b",
    border:          "1px solid #334155",
    borderRadius:    12,
    padding:         "40px 36px",
    width:           340,
    boxShadow:       "0 25px 50px rgba(0,0,0,0.5)",
  },
  logo: {
    display:        "flex",
    alignItems:     "center",
    gap:            10,
    marginBottom:   8,
    justifyContent: "center",
  },
  logoIcon: {
    width:           36,
    height:          36,
    borderRadius:    8,
    backgroundColor: "#3b82f6",
    color:           "#fff",
    display:         "flex",
    alignItems:      "center",
    justifyContent:  "center",
    fontWeight:      800,
    fontSize:        18,
  },
  logoText: {
    color:      "#f1f5f9",
    fontSize:   16,
    fontWeight: 700,
  },
  subtitle: {
    textAlign:    "center",
    color:        "#64748b",
    fontSize:     13,
    marginBottom: 28,
    marginTop:    4,
  },
  form: {
    display:       "flex",
    flexDirection: "column",
    gap:           16,
  },
  field: {
    display:       "flex",
    flexDirection: "column",
    gap:           6,
  },
  label: {
    color:      "#94a3b8",
    fontSize:   13,
    fontWeight: 500,
  },
  input: {
    backgroundColor: "#0f172a",
    border:          "1px solid #334155",
    borderRadius:    8,
    color:           "#f1f5f9",
    fontSize:        14,
    padding:         "10px 12px",
    outline:         "none",
    transition:      "border-color 0.2s",
  },
  error: {
    color:      "#f87171",
    fontSize:   13,
    margin:     0,
    textAlign:  "center",
  },
  button: {
    backgroundColor: "#3b82f6",
    border:          "none",
    borderRadius:    8,
    color:           "#fff",
    cursor:          "pointer",
    fontSize:        14,
    fontWeight:      600,
    padding:         "11px",
    marginTop:       4,
    transition:      "background-color 0.2s",
  },
}
