import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import { BrowserRouter } from "react-router-dom"
import "./index.css"
import Hospital from "./Hospital"

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <Hospital />
    </BrowserRouter>
  </StrictMode>
)
