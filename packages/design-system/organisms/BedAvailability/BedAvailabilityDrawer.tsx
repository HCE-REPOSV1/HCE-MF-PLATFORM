import { useState, useEffect } from "react"
import "./BedAvailabilityDrawer.css"

export function BedAvailabilityDrawer() {

  const [open, setOpen] = useState(false)

  useEffect(() => {

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false)
      }
    }

    if (open) {
      window.addEventListener("keydown", handleKeyDown)
    }

    return () => {
      window.removeEventListener("keydown", handleKeyDown)
    }

  }, [open])


  return (
    <>
      <div
        className="bed-floating-button"
        onClick={() => setOpen(true)}
      >
        🛏 Ver disponibilidad de camas
      </div>

      <div className={`bed-drawer ${open ? "open" : ""}`}>
        <div className="bed-drawer-header">
          <span>Disponibilidad de camas</span>
          <button onClick={() => setOpen(false)}>✕</button>
        </div>

        <div className="bed-drawer-content">
          {/* Aquí irá el módulo de camas */}
        </div>
      </div>

      {open && (
        <div
          className="drawer-overlay"
          onClick={() => setOpen(false)}
        />
      )}
    </>
  )
}