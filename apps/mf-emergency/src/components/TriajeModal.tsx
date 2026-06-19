import { useState, useId, useCallback } from "react"
import {
  Box, Typography,
  HceFormModal,
  TextInput, SelectField,
  EvaScale, TriagePriorityDisplay, SearchComboInput, // SearchComboInput: motivo de ingreso
  hceColors, hceTypography,
  UiDisketteIcon, CloseIcon,
  UiSearchIcon,
  Checkbox
} from "@hce/design-system"
import type { TriagePriority, SearchOption, SearchMode } from "@hce/design-system"
import {
  buscarPacienteMock,
  buscarDiagnosticoMock,
} from "../mock/triaje.mock"
import { IconButton } from "@mui/material"

// ─── Opciones de principio activo (antihistamínicos) ─────────────────────────

const PRINCIPIOS_ACTIVOS_OPTIONS = [
  { value: "loratadina",    label: "Loratadina"    },
  { value: "cetirizina",    label: "Cetirizina"    },
  { value: "fexofenadina",  label: "Fexofenadina"  },
  { value: "desloratadina", label: "Desloratadina" },
  { value: "levocetirizina",label: "Levocetirizina"},
  { value: "difenhidramina",label: "Difenhidramina"},
  { value: "clorfenamina",  label: "Clorfenamina"  },
  { value: "clemastina",    label: "Clemastina"    },
  { value: "mometasona",    label: "Mometasona"    },
  { value: "fluticasona",   label: "Fluticasona"   },
  { value: "budesonida",    label: "Budesonida"    },
  { value: "pseudoefedrina",label: "Pseudoefedrina"},
  { value: "fenilefrina",   label: "Fenilefrina"   },
]

// ─── Subcomponente: cabecera colapsable de sección ───────────────────────────

function SectionHeader({
  title,
  expanded,
  onToggle,
}: { title: string; expanded: boolean; onToggle: () => void }) {
  return (
    <Box
      component="button"
      type="button"
      onClick={onToggle}
      aria-expanded={expanded}
      sx={{
        display:         "flex",
        alignItems:      "center",
        justifyContent:  "space-between",
        width:           "100%",
        px:              3,
        py:              1.25,
        backgroundColor: hceColors.primary.blue[600],
        borderRadius:    "8px",
        border:          "none",
        cursor:          "pointer",
        outline:         "none",
        "&:focus-visible": { outline: `2px solid #ffffff`, outlineOffset: "-3px" },
      }}
    >
      <Typography sx={{ color: "#fff", fontFamily: hceTypography.fontFamily, fontWeight: 600, fontSize: "0.9rem" }}>
        {title}
      </Typography>
      <Box
        sx={{
          color:      "#fff",
          fontSize:   "18px",
          lineHeight: 1,
          transform:  expanded ? "rotate(180deg)" : "rotate(0deg)",
          transition: "transform 220ms",
        }}
      >
        ▾
      </Box>
    </Box>
  )
}

// ─── Subcomponente: par label + input en columna ─────────────────────────────

function FieldCol({ label, children, flex = 1 }: { label: string; children: React.ReactNode; flex?: number | string }) {
  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: "4px", flex }}>
      <Typography sx={{ fontFamily: hceTypography.fontFamily, fontSize: "0.72rem", fontWeight: 600, color: hceColors.neutro.black[400] }}>
        {label}
      </Typography>
      {children}
    </Box>
  )
}

// ─── Subcomponente: radio group (Si / No) ────────────────────────────────────

function RadioGroup({
  legend, value, onChange, disabled = false,
}: { legend: string; value: string; onChange: (v: string) => void; disabled?: boolean }) {
  const id = useId()
  return (
    <Box
      component="fieldset"
      sx={{
        border:       `1.5px solid ${disabled ? hceColors.neutro.black[200] : hceColors.primary.green[500]}`,
        borderRadius: "8px",
        px:           2,
        py:           1,
        m:            0,
        opacity:      disabled ? 0.5 : 1,
      }}
    >
      <Box
        component="legend"
        sx={{
          px:         1,
          fontFamily: hceTypography.fontFamily,
          fontSize:   "0.72rem",
          fontWeight: 700,
          color:      disabled ? hceColors.neutro.black[400] : hceColors.primary.blue[600],
        }}
      >
        {legend}
      </Box>
      <Box sx={{ display: "flex", gap: 3, mt: "2px" }}>
        {["Si", "No"].map(opt => (
          <Box
            key={opt}
            component="label"
            sx={{ display: "flex", alignItems: "center", gap: 1, cursor: disabled ? "not-allowed" : "pointer", fontFamily: hceTypography.fontFamily, fontSize: "0.875rem" }}
          >
            <input
              type="radio"
              name={id}
              value={opt}
              checked={value === opt}
              onChange={() => !disabled && onChange(opt)}
              disabled={disabled}
              style={{ accentColor: hceColors.primary.green[500] }}
            />
            {opt}
          </Box>
        ))}
      </Box>
    </Box>
  )
}

// ─── Subcomponente: toggle switch ────────────────────────────────────────────

function Toggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  const id = useId()
  return (
    <Box component="label" htmlFor={id} sx={{ display: "flex", alignItems: "center", gap: 1.5, cursor: "pointer" }}>
      <Box
        component="input"
        id={id}
        type="checkbox"
        checked={checked}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) => onChange(e.target.checked)}
        sx={{ display: "none" }}
      />
      <Box
        onClick={() => onChange(!checked)}
        sx={{
          width:           44,
          height:          24,
          borderRadius:    "12px",
          backgroundColor: checked ? hceColors.primary.blue[600] : hceColors.neutro.black[300],
          position:        "relative",
          cursor:          "pointer",
          transition:      "background-color 220ms",
          flexShrink:      0,
        }}
      >
        <Box sx={{
          position:        "absolute",
          top:             2,
          left:            checked ? 20 : 2,
          width:           20,
          height:          20,
          borderRadius:    "50%",
          backgroundColor: "#ffffff",
          transition:      "left 220ms",
          boxShadow:       "0 1px 3px rgba(0,0,0,0.2)",
        }} />
      </Box>
      <Typography sx={{ fontFamily: hceTypography.fontFamily, fontSize: "0.82rem", color: hceColors.neutro.black[600] }}>
        {label}
      </Typography>
    </Box>
  )
}

// ─── Subcomponente: campo numérico con sufijo ─────────────────────────────────

function NumericField({ label, value, onChange, suffix, readOnly = false }: {
  label: string; value: string; onChange?: (v: string) => void; suffix: string; readOnly?: boolean
}) {
  return (
    <FieldCol label={label}>
      <Box sx={{ display: "flex", border: `1.5px solid ${hceColors.neutro.black[200]}`, borderRadius: "8px", overflow: "hidden", height: 40 }}>
        <Box
          component="input"
          type="text"
          inputMode="decimal"
          value={value}
          readOnly={readOnly}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => onChange?.(e.target.value.replace(/[^\d.,]/g, ""))}
          placeholder="—"
          sx={{
            flex:            1,
            px:              1.5,
            border:          "none",
            outline:         "none",
            fontFamily:      hceTypography.fontFamily,
            fontSize:        "0.875rem",
            backgroundColor: readOnly ? hceColors.neutro.black[50] : "#ffffff",
            color:           hceColors.neutro.black[700],
            "&::placeholder": { color: hceColors.neutro.black[300] },
          }}
        />
        <Box sx={{
          px:              1,
          display:         "flex",
          alignItems:      "center",
          backgroundColor: hceColors.neutro.black[50],
          borderLeft:      `1px solid ${hceColors.neutro.black[200]}`,
          fontFamily:      hceTypography.fontFamily,
          fontSize:        "0.72rem",
          fontWeight:      600,
          color:           hceColors.neutro.black[400],
          whiteSpace:      "nowrap",
        }}>
          {suffix}
        </Box>
      </Box>
    </FieldCol>
  )
}

// ─── Subcomponente: textarea con contador ─────────────────────────────────────

function TextareaField({ label, value, onChange, maxLength = 100, placeholder = "Ingrese texto" }: {
  label: string; value: string; onChange: (v: string) => void; maxLength?: number; placeholder?: string
}) {
  const id = useId()
  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: "4px" }}>
      <Typography component="label" htmlFor={id} sx={{ fontFamily: hceTypography.fontFamily, fontSize: "0.72rem", fontWeight: 600, color: hceColors.neutro.black[400] }}>
        {label}
      </Typography>
      <Box sx={{ position: "relative", border: `1.5px solid ${hceColors.neutro.black[200]}`, borderRadius: "8px", backgroundColor: "#fff" }}>
        <Box
          id={id}
          component="textarea"
          value={value}
          onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => onChange(e.target.value.slice(0, maxLength))}
          maxLength={maxLength}
          placeholder={placeholder}
          rows={3}
          sx={{
            display:    "block",
            width:      "100%",
            p:          "10px 12px",
            border:     "none",
            outline:    "none",
            resize:     "none",
            fontFamily: hceTypography.fontFamily,
            fontSize:   "0.875rem",
            color:      hceColors.neutro.black[700],
            backgroundColor: "transparent",
            boxSizing:  "border-box",
            "&::placeholder": { color: hceColors.neutro.black[300] },
          }}
        />
        <Box sx={{ position: "absolute", bottom: 6, right: 10, fontFamily: hceTypography.fontFamily, fontSize: "0.65rem", color: hceColors.neutro.black[300] }}>
          {value.length}/{maxLength}
        </Box>
      </Box>
    </Box>
  )
}

// ─── Estado del formulario ────────────────────────────────────────────────────

interface TriajeForm {
  // Datos del paciente
  tipoDoc:         string
  numeroDoc:       string
  noIdentificado:  boolean
  nombres:         string
  apellidoPaterno: string
  apellidoMaterno: string
  fechaNacimiento: string
  sexo:            string
  // Datos clínicos
  modoMotivo:      SearchMode
  motivoQuery:     string
  motivoSelected:  SearchOption | null
  aislamiento:     string
  gestante:        string
  furEnabled:      boolean
  fur:             string
  tiempoEnfermedad: string
  tiempoUnidad:    string
  comentarios:     string
  // Signos vitales
  traumaShock:     boolean
  noSV:            boolean
  peso:            string
  talla:           string
  frCardiaca:      string
  frRespiratoria:  string
  pSistolica:      string
  pDiastolica:     string
  temperatura:     string
  saturacionO2:    string
  glasgow:         { ocular: string; verbal: string; motora: string }
  fast:            { cara: string; brazos: string; habla: string; tiempo: string }
  // Alergias
  tieneAlergia:    string
  principioActivo: string
  alimentos:       string
  otrosAlergias:   string
  // EVA
  dolEva:          number | null
  // Triaje
  prioridad:       TriagePriority | null
}

const INITIAL_FORM: TriajeForm = {
  tipoDoc: "", numeroDoc: "", noIdentificado: false,
  nombres: "", apellidoPaterno: "", apellidoMaterno: "", fechaNacimiento: "", sexo: "",
  modoMotivo: "nombre", motivoQuery: "", motivoSelected: null,
  aislamiento: "", gestante: "", furEnabled: false, fur: "", tiempoEnfermedad: "", tiempoUnidad: "horas", comentarios: "",
  traumaShock: false, noSV: false,
  peso: "", talla: "", frCardiaca: "", frRespiratoria: "", pSistolica: "", pDiastolica: "", temperatura: "", saturacionO2: "",
  glasgow: { ocular: "1", verbal: "1", motora: "1" },
  fast:    { cara: "No", brazos: "No", habla: "No", tiempo: "No" },
  tieneAlergia: "", principioActivo: "", alimentos: "", otrosAlergias: "",
  dolEva: null,
  prioridad: null,
}

// ─── Props ────────────────────────────────────────────────────────────────────

export interface TriajeModalProps {
  open:     boolean
  onClose:  () => void
  onGuardar?: (form: TriajeForm) => void
}

// ─── Componente principal ─────────────────────────────────────────────────────

export function TriajeModal({ open, onClose, onGuardar }: TriajeModalProps) {
  const [form, setForm] = useState<TriajeForm>(INITIAL_FORM)
  const [buscandoPaciente, setBuscandoPaciente] = useState(false)
  const [pacienteNoEncontrado, setPacienteNoEncontrado] = useState(false)

  const [CheckNoIdentificado, setCheckNoIdentificado] = useState(false)

  // Secciones expandibles
  const [expDatosClinicos,    setExpDatosClinicos]    = useState(true)
  const [expSignosVitales,    setExpSignosVitales]     = useState(true)
  const [expAlergias,         setExpAlergias]          = useState(true)
  const [expEva,              setExpEva]               = useState(true)
  const [expTriaje,           setExpTriaje]            = useState(true)

  // Opciones de autocomplete
  const [motivoOpts,  setMotivoOpts]  = useState<SearchOption[]>([])

  const set = useCallback(<K extends keyof TriajeForm>(key: K, val: TriajeForm[K]) => {
    setForm(f => ({ ...f, [key]: val }))
  }, [])

  // IMC calculado
  const imc = (() => {
    const p = parseFloat(form.peso.replace(",", "."))
    const t = parseFloat(form.talla.replace(",", ".")) / 100
    if (p > 0 && t > 0) return (p / (t * t)).toFixed(1)
    return ""
  })()

  // Glasgow total
  const glasgowTotal = ["ocular", "verbal", "motora"].reduce(
    (sum, k) => sum + (parseInt(form.glasgow[k as keyof typeof form.glasgow]) || 0), 0
  )

  // Buscar paciente por documento
  async function handleBuscarPaciente() {
    if (!form.numeroDoc || !form.tipoDoc) return
    setBuscandoPaciente(true)
    setPacienteNoEncontrado(false)
    await new Promise(r => setTimeout(r, 600)) // simula latencia
    const p = buscarPacienteMock(form.numeroDoc)
    if (p) {
      setForm(f => ({ ...f, nombres: p.nombres, apellidoPaterno: p.apellidoPaterno, apellidoMaterno: p.apellidoMaterno, fechaNacimiento: p.fechaNacimiento, sexo: p.sexo }))
    } else {
      setPacienteNoEncontrado(true)
    }
    setBuscandoPaciente(false)
  }

  // Buscar motivo de ingreso
  function handleSearchMotivo(query: string, mode: SearchMode) {
    const results = buscarDiagnosticoMock(query, mode)
    setMotivoOpts(results.map(d => ({ value: d.codigo, label: d.nombre, secondary: d.codigo })))
  }

  function handleGuardar() {
    onGuardar?.(form)
    onClose()
  }

  function handleClose() {
    setForm(INITIAL_FORM)
    setPacienteNoEncontrado(false)
    onClose()
  }

  const FIELD_ROW = { display: "flex", gap: 2, alignItems: "flex-end" }

  return (
    <HceFormModal
      open={open}
      title="Triaje"
      onClose={handleClose}
      closeOnBackdrop={false}
      maxWidth="md"
      primaryButton={{
        label:   "Guardar triaje",
        onClick: handleGuardar,
        color:   hceColors.primary.green[600],
        icon:    <UiDisketteIcon size={16} color="#ffffff" />,
      }}
      secondaryButton={{
        label:  "Cancelar",
        onClick: handleClose,
        color:  hceColors.primary.blue[600],
        icon:   <CloseIcon size={16} color={hceColors.primary.blue[600]} />,
      }}
      buttonAlign="right"
    >
      <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>

        {/* ── Sección 1: Datos del paciente ─────────────────────────────── */}
        <Box>
          <Typography sx={{ fontFamily: hceTypography.fontFamily, fontWeight: 700, fontSize: "0.95rem", color: hceColors.primary.blue[600], mb: 1.5 }}>
            Datos del paciente
          </Typography>

          {/* Búsqueda por documento */}
          <Box
            sx={{
              display:         "flex",
              alignItems:      "flex-end",
              gap:             2,
              p:               2.5,
              backgroundColor: "#f5fcec",
              borderRadius:    "10px",
              border:          `1.5px solid ${hceColors.primary.green[500]}`,
              mb:              2,
              flexWrap:        "wrap",
            }}
          >
            <Box sx={{ flex: "0 0 180px" }}>
              <SelectField
                label="Tipo de documento *"
                value={form.tipoDoc}
                onChange={v => set("tipoDoc", v)}
                options={[
                  { value: "dni",       label: "DNI" },
                  { value: "ce",        label: "Carné de extranjería" },
                  { value: "pasaporte", label: "Pasaporte" },
                ]}
                placeholder="-Seleccionar opción-"
              />
            </Box>
            <Box sx={{ flex: 1, minWidth: 140 }}>
              <TextInput
                label="Número de documento"
                value={form.numeroDoc}
                onChange={v => set("numeroDoc", v)}
                placeholder="Ingrese documento"
              />
            </Box>
            {/* Botón buscar  */}
           
            
            <Box
              component="button"
              type="button"
              onClick={handleBuscarPaciente}
              disabled={buscandoPaciente || !form.tipoDoc || !form.numeroDoc}
              sx={{
                width:           45,
                height:          36,
                borderRadius:    "8px",
                backgroundColor: hceColors.primary.green[500],
                color:           "#ffffff",
                border:          "none",
                fontFamily:      hceTypography.fontFamily,
                fontWeight:      600,
                fontSize:        "0.82rem",
                cursor:          "pointer",
                flexShrink:      0,
                opacity:         (buscandoPaciente || !form.tipoDoc || !form.numeroDoc) ? 0.5 : 1,
                whiteSpace:      "nowrap",
              }}
            >
              <IconButton    
                sx={{
                  color:             hceColors.neutro.white[50],
                  "&:hover": {
                    backgroundColor: 'transparent',
                  },
                }}>
                  <UiSearchIcon
                  size={14}>
                  </UiSearchIcon>
                </IconButton>
            </Box>
            <Box
              component="label"
              sx={{
                display:         "flex",
                alignItems:      "center",
                gap:             1,
                px:              1.5,
                py:              0.75,
                border:          `1.5px solid ${hceColors.primary.green[500]}`,
                borderRadius:    "8px",
                backgroundColor: "#ffffff",
                cursor:          "pointer",
                flexShrink:      0,
              }}
            >
              {/* <Box
                component="input"
                type="checkbox"
                checked={form.noIdentificado}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => set("noIdentificado", e.target.checked)}
                sx={{ accentColor: hceColors.primary.green[500] }}
              /> */}
              <Checkbox
              label=""
              checked = {CheckNoIdentificado}
              onChange={(v) => setCheckNoIdentificado(v)}>

              </Checkbox>
              <Typography sx={{ fontFamily: hceTypography.fontFamily, fontSize: "0.82rem", color: hceColors.primary.blue[600], fontWeight: 500 }}>
                No identificado
              </Typography>
            </Box>
          </Box>

          {pacienteNoEncontrado && (
            <Box sx={{ mb: 1.5, px: 1.5, py: 0.75, backgroundColor: "#fef3cd", borderRadius: "6px", border: "1px solid #f9a825" }}>
              <Typography sx={{ fontFamily: hceTypography.fontFamily, fontSize: "0.8rem", color: "#856404" }}>
                No se encontró paciente con ese documento. Puede ingresar los datos manualmente.
              </Typography>
            </Box>
          )}

          {/* Campos del paciente */}
          <Box sx={FIELD_ROW}>
            <FieldCol label="Nombres" flex={2}>
              <TextInput value={form.nombres} onChange={v => set("nombres", v)} placeholder="Ingrese datos" />
            </FieldCol>
            <FieldCol label="Apellido Paterno" flex={1.5}>
              <TextInput value={form.apellidoPaterno} onChange={v => set("apellidoPaterno", v)} placeholder="Ingrese datos" />
            </FieldCol>
            <FieldCol label="Apellido Materno" flex={1.5}>
              <TextInput value={form.apellidoMaterno} onChange={v => set("apellidoMaterno", v)} placeholder="Ingrese datos" />
            </FieldCol>
            <FieldCol label="Fecha de nacimiento" flex="0 0 160px">
              <TextInput value={form.fechaNacimiento} onChange={v => set("fechaNacimiento", v)} placeholder="dd/mm/yyyy" />
            </FieldCol>
            <Box sx={{ flex: "0 0 120px" }}>
              <SelectField
                label="Sexo"
                value={form.sexo}
                onChange={v => { set("sexo", v); if (v === "M") set("gestante", "") }}
                options={[
                  { value: "M", label: "Masculino" },
                  { value: "F", label: "Femenino" },
                ]}
                placeholder="-"
              />
            </Box>
          </Box>
        </Box>

        {/* ── Sección 2: Datos clínicos (colapsable) ────────────────────── */}
        <Box>
          <SectionHeader title="Datos clínicos" expanded={expDatosClinicos} onToggle={() => setExpDatosClinicos(e => !e)} />
          {expDatosClinicos && (
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 2 }}>

              {/* Motivo de ingreso con SearchComboInput */}
              <SearchComboInput
                label="Motivo de ingreso *"
                searchMode={form.modoMotivo}
                onSearchModeChange={m => { set("modoMotivo", m); set("motivoQuery", ""); set("motivoSelected", null); setMotivoOpts([]) }}
                value={form.motivoQuery}
                onChange={v => set("motivoQuery", v)}
                options={motivoOpts}
                onSearch={handleSearchMotivo}
                onSelect={opt => { set("motivoSelected", opt); set("motivoQuery", opt.label); setMotivoOpts([]) }}
              />

              {/* Aislamiento + Gestante + FUR + Tiempo de enfermedad */}
              <Box sx={{ display: "flex", gap: 2, alignItems: "flex-end", flexWrap: "wrap" }}>
                <RadioGroup legend="Aislamiento" value={form.aislamiento} onChange={v => set("aislamiento", v)} />
                <RadioGroup legend="Gestante" value={form.gestante} onChange={v => set("gestante", v)} disabled={form.sexo === "M"} />
                <Box sx={{ display: "flex", alignItems: "flex-end", gap: 1.5 }}>
                  <Toggle label="FUR" checked={form.furEnabled} onChange={v => { set("furEnabled", v); if (!v) set("fur", "") }} />
                  <FieldCol label="Fecha FUR" flex="0 0 150px">
                    <TextInput value={form.fur} onChange={v => set("fur", v)} placeholder="dd/mm/yyyy" disabled={!form.furEnabled} />
                  </FieldCol>
                </Box>
                <Box sx={{ display: "flex", gap: 0 }}>
                  <FieldCol label="T. de enfermedad" flex="0 0 110px">
                    <Box sx={{ display: "flex" }}>
                      <Box
                        component="input"
                        type="text"
                        inputMode="numeric"
                        value={form.tiempoEnfermedad}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => set("tiempoEnfermedad", e.target.value.replace(/\D/g, ""))}
                        placeholder="Ej: 12"
                        sx={{ flex: 1, height: 40, px: 1.5, border: `1.5px solid ${hceColors.neutro.black[200]}`, borderRight: "none", borderRadius: "8px 0 0 8px", outline: "none", fontFamily: hceTypography.fontFamily, fontSize: "0.875rem", minWidth: 0 }}
                      />
                      <Box sx={{ display: "flex", alignItems: "center", px: 1.5, backgroundColor: hceColors.primary.blue[600], color: "#fff", borderRadius: "0 8px 8px 0", fontFamily: hceTypography.fontFamily, fontWeight: 600, fontSize: "0.78rem", whiteSpace: "nowrap", cursor: "pointer" }}
                        onClick={() => set("tiempoUnidad", form.tiempoUnidad === "horas" ? "días" : form.tiempoUnidad === "días" ? "minutos" : "horas")}
                      >
                        {form.tiempoUnidad} ▾
                      </Box>
                    </Box>
                  </FieldCol>
                </Box>
              </Box>

              <TextareaField label="Comentarios" value={form.comentarios} onChange={v => set("comentarios", v)} maxLength={100} placeholder="Ingrese comentarios" />
            </Box>
          )}
        </Box>

        {/* ── Sección 3: Signos vitales (colapsable) ────────────────────── */}
        <Box>
          <SectionHeader title="Signos vitales" expanded={expSignosVitales} onToggle={() => setExpSignosVitales(e => !e)} />
          {expSignosVitales && (
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 2 }}>

              {/* Checkboxes */}
              <Box
                component="fieldset"
                sx={{ border: `1.5px solid ${hceColors.primary.green[500]}`, borderRadius: "8px", px: 2, py: 1, m: 0 }}
              >
                <Box component="legend" sx={{ px: 1, fontSize: "0.7rem", fontFamily: hceTypography.fontFamily, color: hceColors.neutro.black[400] }}>Condiciones</Box>
                <Box sx={{ display: "flex", gap: 3 }}>
                  {[
                    { key: "traumaShock", label: "Trauma Shock" },
                    { key: "noSV",        label: "No es posible tomar signos vitales" },
                  ].map(opt => (
                    <Box key={opt.key} component="label" sx={{ display: "flex", alignItems: "center", gap: 1, cursor: "pointer", fontFamily: hceTypography.fontFamily, fontSize: "0.875rem" }}>
                      <input
                        type="checkbox"
                        checked={form[opt.key as "traumaShock" | "noSV"]}
                        onChange={e => set(opt.key as "traumaShock" | "noSV", e.target.checked)}
                        style={{ accentColor: hceColors.primary.green[500] }}
                      />
                      {opt.label}
                    </Box>
                  ))}
                </Box>
              </Box>

              {/* Fila 1: Peso, Talla, IMC */}
              <Box sx={FIELD_ROW}>
                <NumericField label="Peso" value={form.peso} onChange={v => set("peso", v)} suffix="Kg" />
                <NumericField label="Talla" value={form.talla} onChange={v => set("talla", v)} suffix="cm" />
                <NumericField label="IMC" value={imc} suffix="%" readOnly />
              </Box>

              {/* Fila 2: Signos */}
              <Box sx={{ display: "flex", gap: 1.5, flexWrap: "wrap" }}>
                {[
                  { key: "frCardiaca",    label: "Fr. Cardiaca",    suffix: "lpm"  },
                  { key: "frRespiratoria",label: "Fr. Respiratoria", suffix: "rpm"  },
                  { key: "pSistolica",    label: "P. Sistólica",    suffix: "mmHg" },
                  { key: "pDiastolica",   label: "P. Diastólica",   suffix: "mmHg" },
                  { key: "temperatura",   label: "Temperatura",     suffix: "°C"   },
                  { key: "saturacionO2",  label: "Saturación O2",   suffix: "%"    },
                ].map(f => (
                  <Box key={f.key} sx={{ flex: "1 1 120px" }}>
                    <NumericField
                      label={f.label}
                      value={form[f.key as keyof TriajeForm] as string}
                      onChange={v => set(f.key as keyof TriajeForm, v as any)}
                      suffix={f.suffix}
                    />
                  </Box>
                ))}
              </Box>

              {/* Escala de Glasgow + FAST */}
              <Box sx={{ display: "flex", gap: 2 }}>
                {/* Glasgow */}
                <Box
                  component="fieldset"
                  sx={{ flex: 1, border: `1.5px solid ${hceColors.primary.green[500]}`, borderRadius: "8px", px: 2, py: 1.5, m: 0 }}
                >
                  <Box component="legend" sx={{ px: 1, fontFamily: hceTypography.fontFamily, fontSize: "0.75rem", fontWeight: 700, color: hceColors.primary.blue[600] }}>
                    Escala de Glasgow
                  </Box>
                  <Box sx={{ display: "flex", gap: 1.5, mt: 1 }}>
                    {(["ocular", "verbal", "motora"] as const).map(key => (
                      <Box key={key} sx={{ flex: 1 }}>
                        <SelectField
                          label={{ ocular: "R. Ocular", verbal: "R. Verbal", motora: "R. Motora" }[key]}
                          value={form.glasgow[key]}
                          onChange={v => set("glasgow", { ...form.glasgow, [key]: v })}
                          options={Array.from({ length: key === "ocular" ? 4 : key === "verbal" ? 5 : 6 }, (_, i) => ({
                            value: String(i + 1), label: String(i + 1),
                          }))}
                        />
                      </Box>
                    ))}
                    <NumericField label="Resultado" value={String(glasgowTotal)} suffix="pts" readOnly />
                  </Box>
                </Box>

                {/* FAST */}
                <Box
                  component="fieldset"
                  sx={{ flex: 1, border: `1.5px solid ${hceColors.primary.green[500]}`, borderRadius: "8px", px: 2, py: 1.5, m: 0 }}
                >
                  <Box component="legend" sx={{ px: 1, fontFamily: hceTypography.fontFamily, fontSize: "0.75rem", fontWeight: 700, color: hceColors.primary.blue[600] }}>
                    FAST
                  </Box>
                  <Box sx={{ display: "flex", gap: 1.5, mt: 1 }}>
                    {(["cara", "brazos", "habla", "tiempo"] as const).map(key => (
                      <Box key={key} sx={{ flex: 1 }}>
                        <SelectField
                          label={{ cara: "Cara", brazos: "Brazos", habla: "Habla", tiempo: "Tiempo" }[key]}
                          value={form.fast[key]}
                          onChange={v => set("fast", { ...form.fast, [key]: v })}
                          options={[{ value: "No", label: "No" }, { value: "Sí", label: "Sí" }]}
                        />
                      </Box>
                    ))}
                  </Box>
                </Box>
              </Box>
            </Box>
          )}
        </Box>

        {/* ── Sección 4: Declaratoria de alergias (colapsable) ──────────── */}
        <Box>
          <SectionHeader title="Declaratoria de alergias" expanded={expAlergias} onToggle={() => setExpAlergias(e => !e)} />
          {expAlergias && (
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 2 }}>
              <Box sx={{ display: "flex", gap: 2, alignItems: "flex-end", flexWrap: "wrap" }}>
                <Box
                  component="fieldset"
                  sx={{ border: `1.5px solid ${hceColors.primary.green[500]}`, borderRadius: "8px", px: 2, py: 1, m: 0, flexShrink: 0 }}
                >
                  <Box component="legend" sx={{ display: "none" }}>Declaratoria</Box>
                  <Box sx={{ display: "flex", gap: 2 }}>
                    {[{ value: "si", label: "Si" }, { value: "niega", label: "Niega alergias" }].map(opt => (
                      <Box key={opt.value} component="label" sx={{ display: "flex", alignItems: "center", gap: 1, cursor: "pointer", fontFamily: hceTypography.fontFamily, fontSize: "0.875rem" }}>
                        <input type="radio" name="alergia-declaratoria" value={opt.value} checked={form.tieneAlergia === opt.value} onChange={() => set("tieneAlergia", opt.value)} style={{ accentColor: hceColors.primary.green[500] }} />
                        {opt.label}
                      </Box>
                    ))}
                  </Box>
                </Box>
                <Box sx={{ flex: 1, minWidth: 220 }}>
                  <SelectField
                    label="Principio activo"
                    value={form.principioActivo}
                    onChange={v => set("principioActivo", v)}
                    options={PRINCIPIOS_ACTIVOS_OPTIONS}
                    placeholder="-Seleccionar principio activo-"
                  />
                </Box>
              </Box>
              <TextareaField label="Alimentos" value={form.alimentos} onChange={v => set("alimentos", v)} maxLength={100} placeholder="Describa alergias alimentarias" />
              <TextareaField label="Otros" value={form.otrosAlergias} onChange={v => set("otrosAlergias", v)} maxLength={100} placeholder="Otros tipos de alergia" />
            </Box>
          )}
        </Box>

        {/* ── Sección 5: Escala EVA (colapsable) ───────────────────────── */}
        <Box>
          <SectionHeader title="Escala de dolor (EVA)" expanded={expEva} onToggle={() => setExpEva(e => !e)} />
          {expEva && (
            <Box sx={{ mt: 3, px: 1 }}>
              <EvaScale value={form.dolEva} onChange={v => set("dolEva", v)} />
            </Box>
          )}
        </Box>

        {/* ── Sección 6: Clasificación de triaje (colapsable) ───────────── */}
        <Box>
          <SectionHeader title="Clasificación de triaje" expanded={expTriaje} onToggle={() => setExpTriaje(e => !e)} />
          {expTriaje && (
            <Box sx={{ mt: 2, px: 1, display: "flex", justifyContent: "center" }}>
              <TriagePriorityDisplay selected={form.prioridad} onSelect={p => set("prioridad", p)} />
            </Box>
          )}
        </Box>

      </Box>
    </HceFormModal>
  )
}
