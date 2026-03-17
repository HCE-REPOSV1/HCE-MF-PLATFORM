import { useState, useEffect }                         from "react"
import {
  Box, Drawer, Typography, Tooltip,
  Divider, Accordion, AccordionSummary, AccordionDetails,
  IconButton, Button,
}                                                       from "@mui/material"
import CloseIcon                                        from "@mui/icons-material/Close"
import KingBedOutlinedIcon                              from "@mui/icons-material/KingBedOutlined"
import ExpandMoreIcon                                   from "@mui/icons-material/ExpandMore"
import { emergencyTokens }                              from "../../tokens/emergency.tokens"
import { BedsAvailabilityTab }                          from "../../molecules/BedsAvailabilityTab/BedsAvailabilityTab"
import { PriorityBadge }                                from "../../atoms/PriorityBadge/PriorityBadge"
import type { PriorityLevel }                           from "../../atoms/PriorityBadge/PriorityBadge"

// ─── Tipos internos ───────────────────────────────────────
type BoxOccupied = {
  label:    string
  status:   "ocupado"
  priority: PriorityLevel
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
  id:     string
  name:   string
  age:    number | string
  sex:    string
  doctor: string
  type:   "espera" | "tp"
}

// ─── Data ─────────────────────────────────────────────────
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

const BOX_STATUS_COLOR = {
  disponible:    emergencyTokens.colors.boxActive,
  mantenimiento: emergencyTokens.colors.priority2,
}

const PRIORITY_LABEL: Record<string, string> = {
  "1": "Crítico",
  "2": "Urgente",
  "3": "Moderado",
  "4": "Leve",
}

// ─── SummaryChip ──────────────────────────────────────────
function SummaryChip({ label, count, color }: { label: string; count: number; color: string }) {
  return (
    <Box sx={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", py: 1.5 }}>
      <Typography sx={{
        fontFamily: emergencyTokens.typography.fontFamily,
        fontSize:   "22px",
        fontWeight: emergencyTokens.typography.weight.bold,
        color,
        lineHeight: 1,
      }}>
        {count}
      </Typography>
      <Typography sx={{
        fontFamily: emergencyTokens.typography.fontFamily,
        fontSize:   "10px",
        color:      emergencyTokens.colors.textSecondary,
        mt:         "4px",
        textAlign:  "center",
      }}>
        {label}
      </Typography>
    </Box>
  )
}

// ─── SummaryGroup: grupo de chips con etiqueta superior ───
function SummaryGroup({ title, flex, children }: { title: string; flex: number; children: React.ReactNode }) {
  return (
    <Box sx={{ flex, display: "flex", flexDirection: "column" }}>
      <Typography sx={{
        fontFamily:    emergencyTokens.typography.fontFamily,
        fontSize:      "9px",
        fontWeight:    700,
        textTransform: "uppercase",
        letterSpacing: "0.08em",
        color:         emergencyTokens.colors.textSecondary,
        textAlign:     "center",
        pt:            "6px",
        pb:            "2px",
        opacity:       0.7,
      }}>
        {title}
      </Typography>
      <Box sx={{ display: "flex", flex: 1 }}>
        {children}
      </Box>
    </Box>
  )
}

// ─── BoxCell ──────────────────────────────────────────────
function BoxCell({ box }: { box: BoxData }) {
  const isOccupied   = box.status === "ocupado"
  const isDisponible = box.status === "disponible"

  const borderColor = isOccupied
    ? emergencyTokens.colors[`priority${(box as BoxOccupied).priority}` as keyof typeof emergencyTokens.colors] as string
    : BOX_STATUS_COLOR[box.status as keyof typeof BOX_STATUS_COLOR]

  const bgColor = isOccupied
    ? `${borderColor}18`
    : isDisponible
      ? `${emergencyTokens.colors.boxActive}12`
      : `${emergencyTokens.colors.priority2}12`

  const tooltipContent = isOccupied ? (
    <Box sx={{ display: "flex", flexDirection: "column", gap: "4px", p: "2px" }}>
      <Typography sx={{ fontFamily: emergencyTokens.typography.fontFamily, fontSize: "13px", fontWeight: 700, color: "#fff" }}>
        {(box as BoxOccupied).patient}
      </Typography>
      <Typography sx={{ fontFamily: emergencyTokens.typography.fontFamily, fontSize: "11px", color: "#d1d5db" }}>
        {(box as BoxOccupied).age} años · {(box as BoxOccupied).sex}
      </Typography>
      <Typography sx={{ fontFamily: emergencyTokens.typography.fontFamily, fontSize: "11px", color: "#d1d5db" }}>
        {(box as BoxOccupied).doctor}
      </Typography>
      <Box sx={{
        mt: "2px", alignSelf: "flex-start",
        px: "8px", py: "2px",
        borderRadius:    emergencyTokens.borderRadius.pill,
        backgroundColor: borderColor,
        fontSize: "10px", fontWeight: 700, color: "#fff",
        fontFamily: emergencyTokens.typography.fontFamily,
      }}>
        P{(box as BoxOccupied).priority} — {PRIORITY_LABEL[String((box as BoxOccupied).priority)]}
      </Box>
    </Box>
  ) : isDisponible ? "Disponible — listo para asignar" : "En mantenimiento"

  return (
    <Tooltip title={tooltipContent} placement="top" arrow>
      <Box sx={{
        display:         "flex",
        flexDirection:   "column",
        alignItems:      "center",
        justifyContent:  "center",
        gap:             "6px",
        p:               "12px 8px 10px",
        borderRadius:    emergencyTokens.borderRadius.lg,
        border:          `2px solid ${borderColor}`,
        borderStyle:     isOccupied ? "solid" : "dashed",
        backgroundColor: bgColor,
        minHeight:       "72px",
        cursor:          "default",
        opacity:         box.status === "mantenimiento" ? 0.6 : 1,
        transition:      "transform 0.15s, box-shadow 0.15s",
        "&:hover":       { transform: "scale(1.03)", boxShadow: emergencyTokens.shadows.card },
      }}>
        <Typography sx={{
          fontFamily: emergencyTokens.typography.fontFamily,
          fontSize:   "12px",
          fontWeight: emergencyTokens.typography.weight.bold,
          color:      emergencyTokens.colors.textPrimary,
        }}>
          {box.label}
        </Typography>

        {isOccupied && <PriorityBadge priority={(box as BoxOccupied).priority} tooltipText="" />}

        {!isOccupied && (
          <Box sx={{
            fontSize:      "9px",
            fontWeight:    700,
            fontFamily:    emergencyTokens.typography.fontFamily,
            color:         borderColor,
            textTransform: "uppercase",
            letterSpacing: "0.04em",
          }}>
            {isDisponible ? "Libre" : "Mant."}
          </Box>
        )}
      </Box>
    </Tooltip>
  )
}

// ─── WaitingRow ───────────────────────────────────────────
function WaitingRow({ p, onAssign }: { p: WaitingPatient; onAssign: (id: string) => void }) {
  const isTP      = p.type === "tp"
  const typeColor = isTP ? emergencyTokens.colors.priority2 : emergencyTokens.colors.boxWaiting
  const typeLabel = isTP ? "Triage" : "En espera"

  return (
    <Box sx={{
      display:         "flex",
      alignItems:      "center",
      gap:             emergencyTokens.spacing[3],
      p:               `${emergencyTokens.spacing[2]} ${emergencyTokens.spacing[3]}`,
      borderRadius:    emergencyTokens.borderRadius.lg,
      backgroundColor: emergencyTokens.colors.rowAlternate,
      border:          `1px solid ${emergencyTokens.colors.border}`,
      borderLeft:      `4px solid ${typeColor}`,
    }}>
      {/* Tipo */}
      <Box sx={{ minWidth: 60 }}>
        <Typography sx={{
          fontFamily:    emergencyTokens.typography.fontFamily,
          fontSize:      emergencyTokens.typography.size.badge,
          fontWeight:    emergencyTokens.typography.weight.bold,
          color:         typeColor,
          textTransform: "uppercase",
          letterSpacing: "0.04em",
        }}>
          {typeLabel}
        </Typography>
      </Box>

      <Divider orientation="vertical" flexItem />

      {/* Info del paciente */}
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography sx={{
          fontFamily:   emergencyTokens.typography.fontFamily,
          fontSize:     emergencyTokens.typography.size.tableCell,
          fontWeight:   emergencyTokens.typography.weight.semibold,
          color:        emergencyTokens.colors.textPrimary,
          whiteSpace:   "nowrap",
          overflow:     "hidden",
          textOverflow: "ellipsis",
        }}>
          {p.name}
        </Typography>
        <Typography sx={{
          fontFamily: emergencyTokens.typography.fontFamily,
          fontSize:   "11px",
          color:      emergencyTokens.colors.textSecondary,
          mt:         "2px",
        }}>
          {p.age} años · {p.sex} · {p.doctor}
        </Typography>
      </Box>

      {/* Botón asignar */}
      <Button
        size="small"
        variant="outlined"
        onClick={() => onAssign(p.id)}
        sx={{
          fontSize:    "10px",
          fontFamily:  emergencyTokens.typography.fontFamily,
          fontWeight:  700,
          py:          "3px",
          px:          "10px",
          minWidth:    "auto",
          whiteSpace:  "nowrap",
          borderColor: emergencyTokens.colors.boxActive,
          color:       emergencyTokens.colors.boxActive,
          borderRadius: emergencyTokens.borderRadius.md,
          textTransform: "none",
          "&:hover": {
            backgroundColor: `${emergencyTokens.colors.boxActive}14`,
            borderColor:     emergencyTokens.colors.boxActive,
          },
        }}
      >
        Asignar Box
      </Button>
    </Box>
  )
}

// ─── PriorityLegend ───────────────────────────────────────
function PriorityLegend() {
  const items = [
    { label: "P1 Crítico",  color: emergencyTokens.colors.priority1 },
    { label: "P2 Urgente",  color: emergencyTokens.colors.priority2 },
    { label: "P3 Moderado", color: emergencyTokens.colors.priority3 },
    { label: "P4 Leve",     color: emergencyTokens.colors.priority4 },
    { label: "Libre",       color: emergencyTokens.colors.boxActive,  dashed: true },
    { label: "Mant.",       color: emergencyTokens.colors.priority2,  dashed: true, dim: true },
  ]
  return (
    <Box sx={{ display: "flex", flexWrap: "wrap", gap: "8px 14px", mt: emergencyTokens.spacing[2] }}>
      {items.map(item => (
        <Box key={item.label} sx={{ display: "flex", alignItems: "center", gap: "5px" }}>
          <Box sx={{
            width:           10,
            height:          10,
            borderRadius:    "50%",
            backgroundColor: item.dashed ? "transparent" : item.color,
            border:          item.dashed ? `2px dashed ${item.color}` : "none",
            opacity:         item.dim ? 0.6 : 1,
          }} />
          <Typography sx={{
            fontFamily: emergencyTokens.typography.fontFamily,
            fontSize:   "10px",
            color:      emergencyTokens.colors.textSecondary,
          }}>
            {item.label}
          </Typography>
        </Box>
      ))}
    </Box>
  )
}

// ─── Componente principal ─────────────────────────────────
export function BedAvailabilityDrawer() {
  const [open, setOpen] = useState(false)

  const ocupados      = BOXES.filter(b => b.status === "ocupado").length
  const disponibles   = BOXES.filter(b => b.status === "disponible").length
  const mantenimiento = BOXES.filter(b => b.status === "mantenimiento").length
  const enEspera      = WAITING.filter(w => w.type === "espera").length
  const enTriage      = WAITING.filter(w => w.type === "tp").length

  const handleAssign = (patientId: string) => {
    const available = BOXES.find(b => b.status === "disponible")
    if (available) {
      console.info(`[BedAvailabilityDrawer] Asignar paciente ${patientId} → ${available.label}`)
    } else {
      console.warn("[BedAvailabilityDrawer] No hay boxes disponibles")
    }
  }

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false) }
    if (open) window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [open])

  return (
    <>
      <BedsAvailabilityTab isActive={open} onClick={() => setOpen(true)} />

      <Drawer
        anchor="right"
        open={open}
        onClose={() => setOpen(false)}
        sx={{
          "& .MuiDrawer-paper": {
            width:         { xs: "100vw", sm: 460 },
            display:       "flex",
            flexDirection: "column",
            overflow:      "hidden",
          },
        }}
      >
        {/* ── Header ── */}
        <Box sx={{
          display:         "flex",
          justifyContent:  "space-between",
          alignItems:      "center",
          px:              emergencyTokens.spacing[4],
          py:              emergencyTokens.spacing[3],
          backgroundColor: emergencyTokens.colors.headerBg,
          flexShrink:      0,
        }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: emergencyTokens.spacing[3] }}>
            <KingBedOutlinedIcon sx={{ fontSize: 24, color: "#fff" }} />
            <Box>
              <Typography sx={{
                fontFamily: emergencyTokens.typography.fontFamily,
                fontSize:   "16px",
                fontWeight: emergencyTokens.typography.weight.bold,
                color:      "#fff",
              }}>
                Disponibilidad de Boxes
              </Typography>
              <Typography sx={{
                fontFamily: emergencyTokens.typography.fontFamily,
                fontSize:   "12px",
                color:      "rgba(255,255,255,0.75)",
                mt:         "2px",
              }}>
                {BOXES.length} boxes · {WAITING.length} pacientes sin box
              </Typography>
            </Box>
          </Box>
          <IconButton onClick={() => setOpen(false)} size="small" sx={{
            color:           "#fff",
            backgroundColor: "rgba(255,255,255,0.12)",
            borderRadius:    emergencyTokens.borderRadius.sm,
            "&:hover":       { backgroundColor: "rgba(255,255,255,0.22)" },
          }}>
            <CloseIcon fontSize="small" />
          </IconButton>
        </Box>

        {/* ── Resumen con grupos etiquetados ── */}
        <Box sx={{
          display:      "flex",
          borderBottom: `1px solid ${emergencyTokens.colors.border}`,
          flexShrink:   0,
        }}>
          {/* Grupo Boxes */}
          <SummaryGroup title="Boxes" flex={3}>
            <SummaryChip label="Ocupados"      count={ocupados}      color={emergencyTokens.colors.priority1}  />
            <Divider orientation="vertical" flexItem />
            <SummaryChip label="Disponibles"   count={disponibles}   color={emergencyTokens.colors.boxActive}  />
            <Divider orientation="vertical" flexItem />
            <SummaryChip label="Mantenimiento" count={mantenimiento} color={emergencyTokens.colors.priority2}  />
          </SummaryGroup>

          <Divider orientation="vertical" flexItem />

          {/* Grupo Pacientes */}
          <SummaryGroup title="Pacientes" flex={2}>
            <SummaryChip label="En espera" count={enEspera} color={emergencyTokens.colors.boxWaiting} />
            <Divider orientation="vertical" flexItem />
            <SummaryChip label="Triage"    count={enTriage} color={emergencyTokens.colors.priority2}  />
          </SummaryGroup>
        </Box>

        {/* ── Contenido scrolleable ── */}
        <Box sx={{
          flex:      1,
          minHeight: 0,           // ← clave para que el scroll funcione en flex
          overflowY: "auto",
          p:         emergencyTokens.spacing[4],
          display:   "flex",
          flexDirection: "column",
          gap:       emergencyTokens.spacing[5],
        }}>

          {/* Grilla de boxes */}
          <Box>
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: emergencyTokens.spacing[3] }}>
              <Typography sx={{
                fontFamily:    emergencyTokens.typography.fontFamily,
                fontSize:      emergencyTokens.typography.size.tableHeader,
                fontWeight:    emergencyTokens.typography.weight.bold,
                textTransform: "uppercase",
                letterSpacing: "0.07em",
                color:         emergencyTokens.colors.textSecondary,
              }}>
                Boxes de Atención
              </Typography>
              <Box sx={{
                px: "10px", py: "2px",
                borderRadius:    emergencyTokens.borderRadius.pill,
                backgroundColor: emergencyTokens.colors.rowAlternate,
                border:          `1px solid ${emergencyTokens.colors.border}`,
                fontSize:        "11px",
                color:           emergencyTokens.colors.textSecondary,
                fontFamily:      emergencyTokens.typography.fontFamily,
              }}>
                {disponibles} disp. / {BOXES.length}
              </Box>
            </Box>

            <Box sx={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: emergencyTokens.spacing[2] }}>
              {BOXES.map(box => <BoxCell key={box.label} box={box} />)}
            </Box>

            <PriorityLegend />
          </Box>

          {/* Acordeón: pacientes sin box */}
          {WAITING.length > 0 && (
            <Accordion
              disableGutters
              elevation={0}
              sx={{
                border:       `1px solid ${emergencyTokens.colors.border}`,
                borderRadius: `${emergencyTokens.borderRadius.lg} !important`,
                "&:before":   { display: "none" },
              }}
            >
              <AccordionSummary
                expandIcon={<ExpandMoreIcon sx={{ color: emergencyTokens.colors.textSecondary }} />}
                sx={{
                  backgroundColor: emergencyTokens.colors.rowAlternate,
                  minHeight:       "48px !important",
                  px:              emergencyTokens.spacing[4],
                  "& .MuiAccordionSummary-content": { alignItems: "center", gap: emergencyTokens.spacing[2], my: "10px" },
                }}
              >
                <Typography sx={{
                  fontFamily:    emergencyTokens.typography.fontFamily,
                  fontSize:      emergencyTokens.typography.size.tableHeader,
                  fontWeight:    emergencyTokens.typography.weight.bold,
                  textTransform: "uppercase",
                  letterSpacing: "0.07em",
                  color:         emergencyTokens.colors.textSecondary,
                }}>
                  Pacientes sin Box
                </Typography>
                <Box sx={{
                  px: "8px", py: "2px",
                  borderRadius:    emergencyTokens.borderRadius.pill,
                  backgroundColor: `${emergencyTokens.colors.boxWaiting}22`,
                  border:          `1px solid ${emergencyTokens.colors.boxWaiting}`,
                  fontSize:        "10px", fontWeight: 700,
                  color:           emergencyTokens.colors.boxWaiting,
                  fontFamily:      emergencyTokens.typography.fontFamily,
                }}>
                  {enEspera} espera
                </Box>
                <Box sx={{
                  px: "8px", py: "2px",
                  borderRadius:    emergencyTokens.borderRadius.pill,
                  backgroundColor: `${emergencyTokens.colors.priority2}22`,
                  border:          `1px solid ${emergencyTokens.colors.priority2}`,
                  fontSize:        "10px", fontWeight: 700,
                  color:           emergencyTokens.colors.priority2,
                  fontFamily:      emergencyTokens.typography.fontFamily,
                }}>
                  {enTriage} triage
                </Box>
              </AccordionSummary>

              <AccordionDetails sx={{ p: emergencyTokens.spacing[3], display: "flex", flexDirection: "column", gap: emergencyTokens.spacing[2] }}>
                {WAITING.map(p => (
                  <WaitingRow key={p.id} p={p} onAssign={handleAssign} />
                ))}
              </AccordionDetails>
            </Accordion>
          )}

        </Box>
      </Drawer>
    </>
  )
}
