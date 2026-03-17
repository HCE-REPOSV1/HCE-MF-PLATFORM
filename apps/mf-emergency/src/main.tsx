import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import Emergency from './Emergency'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Emergency />
  </StrictMode>,
)
