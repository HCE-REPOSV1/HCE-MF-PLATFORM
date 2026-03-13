import "./SidebarMenu.css"

export interface MenuItem {
  label: string
  path: string
  icon?: React.ReactNode
}

interface Props {
  items: MenuItem[]
  collapsed?: boolean
  onNavigate: (path: string) => void
}

export function SidebarMenu({
  items,
  collapsed = false,
  onNavigate
}: Props) {
  return (
    <nav className="jarvis-sidebar-menu">
      <ul className="jarvis-menu-list">
        {items.map((item) => (
          <li
            key={item.path}
            className="jarvis-menu-item"
            onClick={() => onNavigate(item.path)}
          >
            {/* ICON */}
            {item.icon && (
              <span className="jarvis-menu-icon">
                {item.icon}
              </span>
            )}
            {/* LABEL */}
           <span className="jarvis-menu-label">
            {item.label}
          </span>
          </li>
        ))}
      </ul>
    </nav>
  )
}