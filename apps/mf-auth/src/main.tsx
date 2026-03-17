import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import { BrowserRouter } from "react-router-dom"
import "./index.css"
import Login from "./Login"

// Standalone entry — solo para desarrollo independiente del MF
createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <Login />
    </BrowserRouter>
  </StrictMode>
)
