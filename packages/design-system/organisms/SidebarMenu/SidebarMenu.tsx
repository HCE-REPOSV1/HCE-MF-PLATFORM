import { useLocation } from "react-router-dom"
import "./SidebarMenu.css"

export interface MenuItem {
  label: string
  path: string
  icon?: React.ReactNode
}

interface Props {
  items:      MenuItem[]
  collapsed?: boolean
  onNavigate: (path: string) => void
}

export function SidebarMenu({ items, onNavigate }: Props) {
  const location = useLocation()

  // Pick the most-specific item that matches the current path
  const activePath = items.reduce<string | null>((best, item) => {
    const matches = location.pathname === item.path
      || location.pathname.startsWith(item.path + "/")
    if (!matches) return best
    if (!best || item.path.length > best.length) return item.path
    return best
  }, null)

  return (
    <nav className="jarvis-sidebar-menu">
      <ul className="jarvis-menu-list">
        {items.map((item) => (
          <li
            key={item.path}
            className={`jarvis-menu-item${item.path === activePath ? " active" : ""}`}
            onClick={() => onNavigate(item.path)}
          >
            {item.icon && (
              <span className="jarvis-menu-icon">{item.icon}</span>
            )}
            <span className="jarvis-menu-label">{item.label}</span>
          </li>
        ))}
      </ul>
    </nav>
  )
}