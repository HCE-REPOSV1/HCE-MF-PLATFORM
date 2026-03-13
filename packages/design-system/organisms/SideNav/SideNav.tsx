import "./SideNav.css"

type Props = {
  children: React.ReactNode
  collapsed?: boolean
  onToggle: () => void
}

export function SideNav({ children, collapsed = false, onToggle }: Props) {

  return (

    <div className={`jarvis-sidenav ${collapsed ? "collapsed" : ""}`}>

      {/* Collapse button */}

      <button
        className="jarvis-sidenav-toggle"
        onClick={onToggle}
      >
        {collapsed ? "›" : "‹"}
      </button>

      <div className="jarvis-sidenav-content">

        {children}

      </div>

    </div>

  )

}