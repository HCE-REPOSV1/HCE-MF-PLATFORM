/**
 * SidebarMenu
 *
 * Organism del design system encargado
 * de renderizar navegación lateral.
 *
 * Este componente NO depende de microfrontends.
 */

import type { MenuItem } from "./types"
import "./SidebarMenu.css"

type Props = {
  /** items del menú */
  items: MenuItem[]
  /** callback cuando se hace click */
  onNavigate: (path: string) => void
}

export const SidebarMenu = ({ items, onNavigate }: Props) => {

  return (
    <nav className="jarvis-sidebar-menu">
      <ul className="jarvis-menu-list">
        {items.map((item) => (
          <li
            key={item.path}
            className="jarvis-menu-item"
            onClick={() => onNavigate(item.path)}
          >
            {item.icon && (
              <span className="jarvis-menu-icon">
                {item.icon}
              </span>
            )}
            <span className="jarvis-menu-label">
              {item.label}
            </span>
          </li>
        ))}
      </ul>
    </nav>
  )
}