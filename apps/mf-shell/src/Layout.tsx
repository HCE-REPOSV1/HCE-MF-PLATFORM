import "./layout.css"

import { useEffect, useState } from "react"
import { Outlet, useNavigate } from "react-router-dom"

import { useIsMobile } from "./hooks/useIsMobile"
import { getFormattedDateTime, getShortDateTime } from "./utils/date"
import { Header, SideNav } from "@jarvis/design-system"
import Navigation from "navigation/Navigation"

export default function Layout() {

  const navigate = useNavigate()

  const isMobile = useIsMobile()

  const [date, setDate] = useState(
    isMobile ? getShortDateTime() : getFormattedDateTime()
  )

  const [collapsed, setCollapsed] = useState(false)

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
useEffect(() => {

  const updateDate = () => {

    setDate(
      isMobile
        ? getShortDateTime()
        : getFormattedDateTime()
    )

  }

  updateDate()

  const interval = setInterval(updateDate, 60000)

  return () => clearInterval(interval)

}, [isMobile])

  const handleNavigate = (path: string) => {

    navigate(path)

    /* cerrar menu mobile */
    setMobileMenuOpen(false)

  }

  return (

    <div className={`app-layout ${collapsed ? "collapsed" : ""}`}>

      {/* HEADER */}

      <header className="app-header">

        <Header
          title="Monitor de Emergencia"
          date={date}
          site="SEDE CENTRAL"
          onToggleSidebar={() => setMobileMenuOpen(!mobileMenuOpen)}
        />

      </header>


      {/* SIDEBAR */}

      <aside className={`app-sidebar ${mobileMenuOpen ? "open" : ""}`}>

        <SideNav
          collapsed={collapsed}
          onToggle={() => setCollapsed(!collapsed)}
        >

          <Navigation
            collapsed={collapsed}
            onNavigate={handleNavigate}
          />

        </SideNav>

      </aside>


      {/* CONTENT */}

      <main className="app-content">

        <Outlet />

      </main>

    </div>

  )

}