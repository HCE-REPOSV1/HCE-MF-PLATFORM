import "./SideNav.css"

type Props = {
  children:   React.ReactNode
  collapsed?: boolean
  isMobile?:  boolean
  onToggle:   () => void
}

export function SideNav({ children, collapsed = false, isMobile = false, onToggle }: Props) {
  return (
    <div className={`jarvis-sidenav ${collapsed ? "collapsed" : ""}`}>

      {/* Botón colapsar — solo en desktop */}
      {!isMobile && (
        <button className="jarvis-sidenav-toggle" onClick={onToggle} title={collapsed ? "Expandir sidebar" : "Colapsar sidebar"}>
          <svg
            width="14" height="14" viewBox="0 0 14 14"
            fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
          >
            {collapsed
              ? <><polyline points="5,2 10,7 5,12" /></>
              : <><polyline points="9,2 4,7 9,12" /></>
            }
          </svg>
        </button>
      )}

      <div className="jarvis-sidenav-content">
        {children}
      </div>

    </div>
  )
}