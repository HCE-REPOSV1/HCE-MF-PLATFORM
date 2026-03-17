import { Outlet } from "react-router-dom"
import { Header, Footer }  from "@jarvis/design-system"
import { useIsMobile }          from "./hooks/useIsMobile"
import { getFormattedDateTime, getShortDateTime } from "./utils/date"
import { useState, useEffect }  from "react"

export default function HomeLayout() {
  const isMobile = useIsMobile()
  const [date, setDate] = useState(isMobile ? getShortDateTime() : getFormattedDateTime())

  useEffect(() => {
    const update = () => setDate(isMobile ? getShortDateTime() : getFormattedDateTime())
    update()
    const id = setInterval(update, 60000)
    return () => clearInterval(id)
  }, [isMobile])

  const user = JSON.parse(sessionStorage.getItem("jarvis_user") ?? "{}") as { name?: string; role?: string }

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh" }}>
      <Header
        date={date}
        site="SEDE CENTRAL"
        userName={user.name}
        userRole={user.role}
      />
      <main style={{ flex: 1, overflow: "auto" }}>
        <Outlet />
      </main>
      <Footer />
    </div>
  )
}
