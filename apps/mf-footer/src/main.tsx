import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { Footer } from '@hce/design-system'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Footer />
  </StrictMode>,
)
