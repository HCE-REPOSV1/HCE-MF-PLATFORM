import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import { BrowserRouter } from "react-router-dom"
import "./index.css"
import ClinicalRecord from "./ClinicalRecord"

// Standalone entry — solo para desarrollo independiente del MF
createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <ClinicalRecord />
    </BrowserRouter>
  </StrictMode>
)
