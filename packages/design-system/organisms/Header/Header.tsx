/**
 * Header corporativo de la plataforma clínica
 *
 * Buenas prácticas:
 * - Stateless component
 * - UI desacoplada del shell
 * - Consumible por cualquier microfrontend
 */
import "./Header.css"

import { Menu } from "lucide-react"
type Props = {
  title: string
  date: string
  site: string
  onToggleSidebar?: () => void
}

export function Header({
  title,
  date,
  site,
  onToggleSidebar
}: Props) {
  return (
    <header className="jarvis-header">
        <button
          className="jarvis-menu-button"
          onClick={() => onToggleSidebar?.()}
        >
          <Menu size={20}/>
      </button>
      {/* Left */}
      <div className="jarvis-header-title">
        {title}
      </div>
      {/* Right */}
      <div className="jarvis-header-info">
        {date && (
          <div className="jarvis-header-badge">
            {date}
          </div>
        )}
        {site && (
          <div className="jarvis-header-badge">
            {site}
          </div>
        )}
      </div>
    </header>
  )
}