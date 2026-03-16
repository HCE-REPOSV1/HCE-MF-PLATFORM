import { useState, useEffect } from "react"
import "./BedAvailabilityDrawer.css"

// ─── Tipos ────────────────────────────────────────────────
type BoxOccupied = {
  label:    string
  status:   "ocupado"
  priority: number | "none"
  patient:  string
  age:      number | string
  sex:      string
  doctor:   string
}

type BoxFree = {
  label:  string
  status: "disponible" | "mantenimiento"
}

type BoxData = BoxOccupied | BoxFree

type WaitingPatient = {
  id:      string
  name:    string
  age:     number | string
  sex:     string
  doctor:  string
  type:    "espera" | "tp"
}

// ─── Data derivada de patients.mock.ts ───────────────────
const BOXES: BoxData[] = [
  { label: "Box 1",  status: "ocupado", priority: 1, patient: "Vera, Alejandro",    age: 58, sex: "M", doctor: "Dr. Muñoz"      },
  { label: "Box 2",  status: "ocupado", priority: 1, patient: "Mardones, Carolina", age: 34, sex: "F", doctor: "Dr. Pérez"      },
  { label: "Box 3",  status: "ocupado", priority: 2, patient: "Díaz, Francisca",    age: 48, sex: "F", doctor: "Dr. Medina"     },
  { label: "Box 4",  status: "ocupado", priority: 2, patient: "Fuentes, Roberto",   age: 67, sex: "M", doctor: "Dra. Sandoval"  },
  { label: "Box 5",  status: "ocupado", priority: 3, patient: "Núñez, Patricia",    age: 72, sex: "F", doctor: "Dr. Reyes"      },
  { label: "Box 6",  status: "ocupado", priority: 3, patient: "Herrera, Felipe",    age: 19, sex: "M", doctor: "Dr. Vega"       },
  { label: "Box 7",  status: "ocupado", priority: 3, patient: "Soto, Marcelo",      age: 38, sex: "M", doctor: "Dr. Mendoza"    },
  { label: "Box 8",  status: "ocupado", priority: 4, patient: "Villalobos, Jorge",  age: 44, sex: "M", doctor: "Dra. Contreras" },
  { label: "Box 9",  status: "ocupado", priority: 4, patient: "Riquelme, Andrea",   age: 29, sex: "F", doctor: "Dr. Flores"     },
  { label: "Box 10", status: "ocupado", priority: 4, patient: "Poblete, Rodrigo",   age: 76, sex: "M", doctor: "Dr. Silva"      },
  { label: "Box 11", status: "ocupado", priority: 3, patient: "González, Raúl",     age: 61, sex: "M", doctor: "Dra. Campos"    },
  { label: "Box 12", status: "ocupado", priority: 4, patient: "Salinas, Verónica",  age: 37, sex: "F", doctor: "Dr. Ibáñez"     },
  { label: "Box 13", status: "disponible"    },
  { label: "Box 14", status: "disponible"    },
  { label: "Box 15", status: "mantenimiento" },
]

const WAITING: WaitingPatient[] = [
  { id: "p04", name: "Espinoza, Valentina", age: 28, sex: "F", doctor: "Dr. Castillo",    type: "espera" },
  { id: "p08", name: "Castro, Daniela",     age: 51, sex: "F", doctor: "Dra. Rojas",      type: "espera" },
  { id: "p13", name: "Araya, Tomás",        age: 55, sex: "M", doctor: "Dra. Gutiérrez",  type: "espera" },
  { id: "p16", name: "Bravo, Constanza",    age: 22, sex: "F", doctor: "Dr. Ortega",      type: "espera" },
  { id: "p17", name: "Lagos, Cristóbal",    age: 33, sex: "M", doctor: "Dra. Valenzuela", type: "espera" },
  { id: "p05", name: "Morales, Eduardo",    age: 45, sex: "M", doctor: "Dra. Torres",     type: "tp"     },
  { id: "p10", name: "Pizarro, Sofía",      age: 63, sex: "F", doctor: "Dr. Alvarado",    type: "tp"     },
  { id: "p14", name: "Paredes, Isabel",     age: 41, sex: "F", doctor: "Dr. Ramírez",     type: "tp"     },
]

// ─── Helpers ─────────────────────────────────────────────
const PRIORITY_COLOR: Record<number | string, string> = {
  1: "#dc2626",
  2: "#f97316",
  3: "#eab308",
  4: "#22c55e",
  none: "#9ca3af",
}

const PRIORITY_LABEL: Record<number | string, string> = {
  1: "P1", 2: "P2", 3: "P3", 4: "P4", none: "--",
}

// ─── BoxCell: celda de grilla con tooltip ─────────────────
function BoxCell({ box }: { box: BoxData }) {
  const isOccupied     = box.status === "ocupado"
  const isDisponible   = box.status === "disponible"
  const isMaintenance  = box.status === "mantenimiento"

  const color = isOccupied
    ? PRIORITY_COLOR[(box as BoxOccupied).priority]
    : isDisponible
      ? "#16a34a"
      : "#d97706"

  return (
    <div className={`box-cell box-cell--${box.status}`} style={{ "--box-color": color } as React.CSSProperties}>
      <span className="box-cell-label">{box.label}</span>

      {isOccupied && (
        <span className="box-cell-priority" style={{ background: color }}>
          {PRIORITY_LABEL[(box as BoxOccupied).priority]}
        </span>
      )}

      {/* Tooltip */}
      <div className="box-tooltip">
        {isOccupied && (
          <>
            <div className="box-tooltip-name">{(box as BoxOccupied).patient}</div>
            <div className="box-tooltip-row">
              <span>{(box as BoxOccupied).age} años</span>
              <span>·</span>
              <span>{(box as BoxOccupied).sex}</span>
            </div>
            <div className="box-tooltip-row">{(box as BoxOccupied).doctor}</div>
            <div className="box-tooltip-badge" style={{ background: color }}>
              {PRIORITY_LABEL[(box as BoxOccupied).priority]} — Prioridad {(box as BoxOccupied).priority}
            </div>
          </>
        )}
        {isDisponible   && <div className="box-tooltip-free">Disponible</div>}
        {isMaintenance  && <div className="box-tooltip-maint">En mantenimiento</div>}
      </div>
    </div>
  )
}

// ─── WaitingCard: fila del acordeón ──────────────────────
function WaitingCard({ p }: { p: WaitingPatient }) {
  return (
    <div className="bed-card bed-card--espera">
      <div className="bed-card-left">
        <span className="bed-card-number">{p.type === "tp" ? "TP" : "Sala"}</span>
        <span className={`bed-card-badge ${p.type === "tp" ? "bed-badge--tp" : "bed-badge--espera"}`}>
          {p.type === "tp" ? "Triage" : "En espera"}
        </span>
      </div>
      <div className="bed-card-right">
        <span className="bed-card-patient">{p.name}</span>
        <span className="bed-card-meta">{p.age} años · {p.sex} · {p.doctor}</span>
      </div>
    </div>
  )
}

// ─── SummaryCard ──────────────────────────────────────────
function SummaryCard({ label, count, color }: { label: string; count: number; color: string }) {
  return (
    <div className="bed-summary-card">
      <span className="bed-summary-count" style={{ color }}>{count}</span>
      <span className="bed-summary-label">{label}</span>
    </div>
  )
}

// ─── Componente principal ─────────────────────────────────
export function BedAvailabilityDrawer() {
  const [open,          setOpen]          = useState(false)
  const [waitingOpen,   setWaitingOpen]   = useState(false)

  const ocupados      = BOXES.filter(b => b.status === "ocupado").length
  const disponibles   = BOXES.filter(b => b.status === "disponible").length
  const mantenimiento = BOXES.filter(b => b.status === "mantenimiento").length
  const enEspera      = WAITING.filter(w => w.type === "espera").length
  const enTriage      = WAITING.filter(w => w.type === "tp").length

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false) }
    if (open) window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [open])

  return (
    <>
      <div className="bed-floating-button" onClick={() => setOpen(true)}>
        🛏 Ver disponibilidad de camas
      </div>

      <div className={`bed-drawer ${open ? "open" : ""}`}>

        {/* Header */}
        <div className="bed-drawer-header">
          <div className="bed-drawer-title">
            <span className="bed-drawer-icon">🛏</span>
            <div>
              <div className="bed-drawer-heading">Disponibilidad de Boxes</div>
              <div className="bed-drawer-subheading">{BOXES.length} boxes · {WAITING.length} pacientes sin box</div>
            </div>
          </div>
          <button className="bed-close" onClick={() => setOpen(false)}>✕</button>
        </div>

        {/* Resumen */}
        <div className="bed-summary-row">
          <SummaryCard label="Ocupados"      count={ocupados}      color="#dc2626" />
          <SummaryCard label="Disponibles"   count={disponibles}   color="#16a34a" />
          <SummaryCard label="Mantenimiento" count={mantenimiento} color="#d97706" />
          <SummaryCard label="En espera"     count={enEspera}      color="#6366f1" />
          <SummaryCard label="Triage"        count={enTriage}      color="#f97316" />
        </div>

        {/* Contenido scrolleable */}
        <div className="bed-drawer-content">

          {/* Grilla de boxes */}
          <div className="bed-sector">
            <div className="bed-sector-header">
              <span className="bed-sector-name">Boxes de Atención</span>
              <span className="bed-sector-stats">{disponibles} disp. / {BOXES.length}</span>
            </div>
            <div className="box-grid">
              {BOXES.map(box => <BoxCell key={box.label} box={box} />)}
            </div>
            {/* Leyenda */}
            <div className="box-legend">
              <span className="box-legend-item"><span className="box-legend-dot" style={{ background: "#dc2626" }} />P1</span>
              <span className="box-legend-item"><span className="box-legend-dot" style={{ background: "#f97316" }} />P2</span>
              <span className="box-legend-item"><span className="box-legend-dot" style={{ background: "#eab308" }} />P3</span>
              <span className="box-legend-item"><span className="box-legend-dot" style={{ background: "#22c55e" }} />P4</span>
              <span className="box-legend-item"><span className="box-legend-dot" style={{ background: "#16a34a", opacity: 0.3 }} />Libre</span>
              <span className="box-legend-item"><span className="box-legend-dot" style={{ background: "#d97706", opacity: 0.3 }} />Mant.</span>
            </div>
          </div>

          {/* Acordeón: pacientes sin box */}
          {WAITING.length > 0 && (
            <div className="bed-accordion">
              <button
                className={`bed-accordion-header ${waitingOpen ? "open" : ""}`}
                onClick={() => setWaitingOpen(v => !v)}
              >
                <div className="bed-accordion-title">
                  <span>Pacientes sin Box</span>
                  <div className="bed-accordion-badges">
                    <span className="bed-badge--espera bed-card-badge">{enEspera} espera</span>
                    <span className="bed-badge--tp bed-card-badge">{enTriage} triage</span>
                  </div>
                </div>
                <span className={`bed-accordion-chevron ${waitingOpen ? "open" : ""}`}>▾</span>
              </button>

              <div className={`bed-accordion-body ${waitingOpen ? "open" : ""}`}>
                <div className="bed-sector-list">
                  {WAITING.map(p => <WaitingCard key={p.id} p={p} />)}
                </div>
              </div>
            </div>
          )}

        </div>
      </div>

      {open && <div className="drawer-overlay" onClick={() => setOpen(false)} />}
    </>
  )
}
