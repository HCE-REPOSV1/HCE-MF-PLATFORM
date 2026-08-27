import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import { BrowserRouter } from "react-router-dom"
import { initI18n } from "@hce/i18n-core"
import "./index.css"
import Login from "./Login"

// Standalone entry — solo para desarrollo independiente del MF. En el flujo
// real (Module Federation), mf-shell ya llama initI18n() antes de montar
// este remoto -- initI18n() es no-op en la segunda llamada, así que este
// call es seguro incluso si en el futuro se federa este entry por error.
initI18n({ defaultLocale: import.meta.env.VITE_DEFAULT_LOCALE })

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <Login />
    </BrowserRouter>
  </StrictMode>
)
