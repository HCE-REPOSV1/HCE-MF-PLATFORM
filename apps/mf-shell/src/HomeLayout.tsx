import { Outlet } from "react-router-dom"
import { Header, Footer }  from "@hce/design-system"
import { useIsMobile }          from "./hooks/useIsMobile"
import { getFormattedDateTime, getShortDateTime } from "./utils/date"
import { useState, useEffect }  from "react"
import { useUser } from "./context/UserContext"

export default function HomeLayout() {
  const isMobile = useIsMobile()
  const [date, setDate] = useState(isMobile ? getShortDateTime() : getFormattedDateTime())
  const { user, sede, logout } = useUser()

  useEffect(() => {
    const update = () => setDate(isMobile ? getShortDateTime() : getFormattedDateTime())
    update()
    const id = setInterval(update, 60000)
    return () => clearInterval(id)
  }, [isMobile])

  const handleLogout = async () => {
    await logout()
    window.location.replace("/")
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh" }}>
      <Header
        date={date}
        site={sede || "—"}
        userName={user?.nombreCompleto}
        userRole={user?.nombrePerfil}
        onLogout={handleLogout}
      />
      <main style={{ flex: 1, overflow: "auto" }}>
        <Outlet />
      </main>
      <Footer />
    </div>
  )
}
