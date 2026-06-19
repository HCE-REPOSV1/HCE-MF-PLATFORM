import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { Triage } from './Triage.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Triage  open={true}
      onClose={() => {}}
      onGuardar={(data) => console.log(data)}/>
  </StrictMode>,
)
