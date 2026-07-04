import { useState, useId, useCallback, useEffect } from "react";
import {
  Box,
  Typography,
  HceFormModal,
  TextInput,
  SelectField,
  EvaScale,
  TriagePriorityDisplay,
  SearchComboInput, // SearchComboInput: motivo de ingreso
  hceColors,
  hceTypography,
  UiDisketteIcon,
  CloseIcon,
  UiSearchIcon,
  Checkbox,
  HceModal,
  UiWarningIcon,
  MultiSelect,
  RadioGroup,
} from "@hce/design-system";
import type {
  TriagePriority,
  SearchOption,
  SearchMode,
} from "@hce/design-system";
// import { buscarDiagnosticoMock } from "./mock/triage.mock";
import { Grid, IconButton } from "@mui/material";
import { usePatient } from "./hooks/usePatient";
import { useCatalog } from "./hooks/useCatalog";
import { useTriage } from "./hooks/useTriage";
import { useUser } from "shell/UserContext";
import { CSI_GENDER } from "./config/endpoints";
import type { CatalogTimeUnit } from "./types/catalog.types";
import type {
  TriageFormRequest,
  Gender,
  EstimatedAgeGroup,
} from "./types/triage.types";

const TRIAGE_LEVEL_MAP: Record<TriagePriority, number> = {
  I: 1,
  II: 2,
  III: 3,
  IV: 4,
};


// ─── Opciones de principio activo (antihistamínicos) ─────────────────────────

// const PRINCIPIOS_ACTIVOS_OPTIONS = [
//   { value: "loratadina", label: "Loratadina" },
//   { value: "cetirizina", label: "Cetirizina" },
//   { value: "fexofenadina", label: "Fexofenadina" },
//   { value: "desloratadina", label: "Desloratadina" },
//   { value: "levocetirizina", label: "Levocetirizina" },
//   { value: "difenhidramina", label: "Difenhidramina" },
//   { value: "clorfenamina", label: "Clorfenamina" },
//   { value: "clemastina", label: "Clemastina" },
//   { value: "mometasona", label: "Mometasona" },
//   { value: "fluticasona", label: "Fluticasona" },
//   { value: "budesonida", label: "Budesonida" },
//   { value: "pseudoefedrina", label: "Pseudoefedrina" },
//   { value: "fenilefrina", label: "Fenilefrina" },
// ];

// ─── Subcomponente: cabecera colapsable de sección ───────────────────────────

function SectionHeader({
  title,
  expanded,
  onToggle,
}: {
  title: string;
  expanded: boolean;
  onToggle: () => void;
}) {
  return (
    <Box
      component="button"
      type="button"
      onClick={onToggle}
      aria-expanded={expanded}
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        width: "100%",
        px: 3,
        py: 1.25,
        backgroundColor: hceColors.primary.blue[600],
        borderRadius: "8px",
        border: "none",
        cursor: "pointer",
        outline: "none",
        "&:focus-visible": {
          outline: `2px solid #ffffff`,
          outlineOffset: "-3px",
        },
      }}
    >
      <Typography
        sx={{
          color: "#fff",
          fontFamily: hceTypography.fontFamily,
          fontWeight: 600,
          fontSize: "0.9rem",
        }}
      >
        {title}
      </Typography>
      <Box
        sx={{
          color: "#fff",
          fontSize: "18px",
          lineHeight: 1,
          transform: expanded ? "rotate(180deg)" : "rotate(0deg)",
          transition: "transform 220ms",
        }}
      >
        ▾
      </Box>
    </Box>
  );
}

// ─── Subcomponente: par label + input en columna ─────────────────────────────

function FieldCol({
  label,
  children,
  flex = 1,
}: {
  label: string;
  children: React.ReactNode;
  flex?: number | string;
}) {
  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: "4px", flex }}>
      <Typography
        sx={{
          fontFamily: hceTypography.fontFamily,
          fontSize: "0.72rem",
          fontWeight: 600,
          color: hceColors.neutro.black[400],
        }}
      >
        {label}
      </Typography>
      {children}
    </Box>
  );
}

// ─── Subcomponente: toggle switch ────────────────────────────────────────────

function Toggle({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  const id = useId();
  return (
    <Box
      component="label"
      htmlFor={id}
      sx={{
        display: "flex",
        alignItems: "center",
        gap: 1.5,
        cursor: "pointer",
      }}
    >
      <Box
        component="input"
        id={id}
        type="checkbox"
        checked={checked}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
          onChange(e.target.checked)
        }
        sx={{ display: "none" }}
      />
      <Box
        onClick={() => onChange(!checked)}
        sx={{
          width: 44,
          height: 24,
          borderRadius: "12px",
          backgroundColor: checked
            ? hceColors.primary.blue[600]
            : hceColors.neutro.black[300],
          position: "relative",
          cursor: "pointer",
          transition: "background-color 220ms",
          flexShrink: 0,
        }}
      >
        <Box
          sx={{
            position: "absolute",
            top: 2,
            left: checked ? 20 : 2,
            width: 20,
            height: 20,
            borderRadius: "50%",
            backgroundColor: "#ffffff",
            transition: "left 220ms",
            boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
          }}
        />
      </Box>
      <Typography
        sx={{
          fontFamily: hceTypography.fontFamily,
          fontSize: "0.82rem",
          color: hceColors.neutro.black[600],
        }}
      >
        {label}
      </Typography>
    </Box>
  );
}

// ─── Subcomponente: campo numérico con sufijo ─────────────────────────────────

function NumericField({
  label,
  value,
  onChange,
  readOnly = false,
}: {
  label: string;
  value: string;
  onChange?: (v: string) => void;
  suffix: string;
  readOnly?: boolean;
}) {
  return (
    <FieldCol label={label}>
      <Box
        sx={{
          border: `1.5px solid ${hceColors.neutro.black[200]}`,
          borderRadius: "8px",
          width: "100%",
          height: 40,
          display: "flex",
          alignItems: "center",
          boxSizing: "border-box",
          backgroundColor: readOnly ? hceColors.neutro.black[50] : "#ffffff",
          overflow: "hidden",
        }}
      >
        <Box
          component="input"
          type="text"
          inputMode="decimal"
          value={value}
          readOnly={readOnly}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            onChange?.(e.target.value.replace(/[^\d.,]/g, ""))
          }
          sx={{
            px: 1.5,
            border: "none",
            outline: "none",
            fontFamily: hceTypography.fontFamily,
            fontSize: "0.875rem",
            backgroundColor: "transparent",
            color: hceColors.neutro.black[700],
            width: "100%", // Obligatorio para que ocupe todo el espacio asignado
            height: "100%",
            boxSizing: "border-box",
            "&::placeholder": { color: hceColors.neutro.black[300] },
          }}
        />

        {/* {suffix && (
      <Box 
        sx={{ 
          pr: 1.5, 
          fontFamily: hceTypography.fontFamily, 
          fontSize: "0.875rem", 
          color: hceColors.neutro.black[400],
          userSelect: "none"
        }}
      >
        {suffix}
      </Box>
    )} */}
      </Box>
    </FieldCol>
  );
}

// ─── Subcomponente: textarea con contador ─────────────────────────────────────

function TextareaField({
  label,
  value,
  onChange,
  maxLength = 100,
  placeholder = "Ingrese texto",
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  maxLength?: number;
  placeholder?: string;
}) {
  const id = useId();
  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: "4px" }}>
      <Typography
        component="label"
        htmlFor={id}
        sx={{
          fontFamily: hceTypography.fontFamily,
          fontSize: "0.72rem",
          fontWeight: 600,
          color: hceColors.neutro.black[400],
        }}
      >
        {label}
      </Typography>
      <Box
        sx={{
          position: "relative",
          border: `1.5px solid ${hceColors.neutro.black[200]}`,
          borderRadius: "8px",
          backgroundColor: "#fff",
        }}
      >
        <Box
          id={id}
          component="textarea"
          value={value}
          onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
            onChange(e.target.value.slice(0, maxLength))
          }
          maxLength={maxLength}
          placeholder={placeholder}
          rows={3}
          sx={{
            display: "block",
            width: "100%",
            p: "10px 12px",
            border: "none",
            outline: "none",
            resize: "none",
            fontFamily: hceTypography.fontFamily,
            fontSize: "0.875rem",
            color: hceColors.neutro.black[700],
            backgroundColor: "transparent",
            boxSizing: "border-box",
            "&::placeholder": { color: hceColors.neutro.black[300] },
          }}
        />
        <Box
          sx={{
            position: "absolute",
            bottom: 6,
            right: 10,
            fontFamily: hceTypography.fontFamily,
            fontSize: "0.65rem",
            color: hceColors.neutro.black[300],
          }}
        >
          {value.length}/{maxLength}
        </Box>
      </Box>
    </Box>
  );
}

// ─── Estado del formulario ────────────────────────────────────────────────────

interface TriajeForm {
  // Datos del paciente
  tipoDoc: string;
  numeroDoc: string;
  noIdentificado: boolean;
  nombres: string;
  apellidoPaterno: string;
  apellidoMaterno: string;
  fechaNacimiento: string;
  sexo: string;
  grupoEtario: string;
  // Datos clínicos
  modoMotivo: SearchMode;
  motivoQuery: string;
  motivoSelected: SearchOption | null;
  aislamiento: string;
  gestante: string;
  furEnabled: boolean;
  fur: string;
  tiempoEnfermedad: string;
  tiempoUnidad: string;
  comentarios: string;
  // Signos vitales
  traumaShock: boolean;
  noSV: boolean;
  peso: string;
  talla: string;
  frCardiaca: string;
  frRespiratoria: string;
  pSistolica: string;
  pDiastolica: string;
  temperatura: string;
  saturacionO2: string;
  glasgow: { ocular: string; verbal: string; motora: string };
  fast: { cara: string; brazos: string; habla: string; tiempo: string };
  // Alergias
  tieneAlergia: string;
  principioActivo: string;
  alimentos: string;
  otrosAlergias: string;
  // EVA
  dolEva: number | null;
  // Triaje
  prioridad: TriagePriority | null;
}

const INITIAL_FORM: TriajeForm = {
  tipoDoc: "",
  numeroDoc: "",
  noIdentificado: false,
  nombres: "",
  apellidoPaterno: "",
  apellidoMaterno: "",
  fechaNacimiento: "",
  sexo: "",
  grupoEtario: "",
  modoMotivo: "cie_description",
  motivoQuery: "",
  motivoSelected: null,
  aislamiento: "",
  gestante: "",
  furEnabled: false,
  fur: "",
  tiempoEnfermedad: "",
  tiempoUnidad: "HRS",
  comentarios: "",
  traumaShock: false,
  noSV: false,
  peso: "",
  talla: "",
  frCardiaca: "",
  frRespiratoria: "",
  pSistolica: "",
  pDiastolica: "",
  temperatura: "",
  saturacionO2: "",
  glasgow: { ocular: "1", verbal: "1", motora: "1" },
  fast: { cara: "No", brazos: "No", habla: "No", tiempo: "No" },
  tieneAlergia: "",
  principioActivo: "",
  alimentos: "",
  otrosAlergias: "",
  dolEva: null,
  prioridad: null,
};

// ─── Props ────────────────────────────────────────────────────────────────────

export interface TriajeModalProps {
  open: boolean;
  onClose: () => void;
  onGuardar?: (form: TriajeForm) => void;
  /** "read" = solo lectura (botón Prioridad en grilla) | "write" = crear triaje (menú superior). Default: "write" */
  mode?: "read" | "write";
}

// ─── Componente principal ─────────────────────────────────────────────────────

export function Triage({ open, onClose, onGuardar, mode = "write" }: TriajeModalProps) {
  const readOnly = mode === "read";
  const [form, setForm] = useState<TriajeForm>(INITIAL_FORM);
  const [buscandoPaciente, setBuscandoPaciente] = useState(false);
  const [pacienteNoEncontrado, setPacienteNoEncontrado] = useState(false);

  // Secciones expandibles
  const [expDatosClinicos, setExpDatosClinicos] = useState(true);
  const [expSignosVitales, setExpSignosVitales] = useState(true);
  const [expAlergias, setExpAlergias] = useState(true);
  const [expEva, setExpEva] = useState(true);
  const [expTriaje, setExpTriaje] = useState(true);

  const [optionsActivePrinciples, setOptionsActivePrinciples] = useState<
    { value: string; label: string }[]
  >([]);

  // Opciones de autocomplete
  const [motivoOpts, setMotivoOpts] = useState<SearchOption[]>([]);

  // Opciones de tipo de documento (patient) y unidades de tiempo
  const [tipoDocOptions, setTipoDocOptions] = useState<
    { value: string; label: string }[]
  >([]);
  const [timeUnitOptions, setTimeUnitOptions] = useState<CatalogTimeUnit[]>(
    [],
  );
  const [genderOptions, setGenderOptions] = useState<
    { value: string; label: string }[]
  >([]);
  const [ageGroupOptions, setAgeGroupOptions] = useState<
    { value: string; label: string }[]
  >([]);

  // Paciente vinculado tras la búsqueda por documento (requerido para guardar el triaje)
  const [patientId, setPatientId] = useState<number | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);

  const set = useCallback(
    <K extends keyof TriajeForm>(key: K, val: TriajeForm[K]) => {
      setForm((f) => ({ ...f, [key]: val }));
    },
    [],
  );

  // IMC calculado
  const imc = (() => {
    const p = parseFloat(form.peso.replace(",", "."));
    const t = parseFloat(form.talla.replace(",", ".")) / 100;
    if (p > 0 && t > 0) return (p / (t * t)).toFixed(1);
    return "";
  })();

  // Glasgow total
  const glasgowTotal = ["ocular", "verbal", "motora"].reduce(
    (sum, k) =>
      sum + (parseInt(form.glasgow[k as keyof typeof form.glasgow]) || 0),
    0,
  );

  const [valuePrincipioActivo, setValuePrincipioActivo] = useState<string[]>(
    [],
  );

  //Data de Paciente
  const { fetchPatient } = usePatient();
  //Data de Catalogo
  const {
    fetchCodeSystemValues,
    fetchCatalogCie,
    fetchCatalogActivePrinciples,
    fetchIdentifierTypes,
    fetchTimeUnits,
    fetchAgeGroups,
  } = useCatalog();
  //Registro de Triaje
  // TODO: reactivar createTriage cuando se destape el POST real (ver handleGuardar)
  const { loading: guardandoTriaje } = useTriage();
  //Usuario y sede activa (federados desde mf-shell)
  const { user, sedeActual } = useUser();

  const opcionesRadio = [
    { value: "si", label: "Si" },
    { value: "no", label: "No" },
  ];
  const opcionesRadioSignosVitales = [
    { value: true, label: "Trauma Shock" },
    { value: false, label: "No es posible tomar signos vitales" },
  ];

  useEffect(() => {
    const loadData = async () => {
      try {
        const results = await Promise.all([
          fetchCatalogActivePrinciples(),
          fetchIdentifierTypes("patient"),
          fetchTimeUnits(),
          fetchCodeSystemValues(CSI_GENDER),
          fetchAgeGroups(),
        ]);
        const [activePrinciples, identifierTypes, timeUnits, genders, ageGroups] =
          results;

        if (genders && Array.isArray(genders)) {
          setGenderOptions(
            genders
              .filter((g) => g.is_active)
              .sort((a, b) => a.sort_order - b.sort_order)
              .map((g) => ({ value: g.code, label: g.display_es })),
          );
        }

        if (ageGroups && Array.isArray(ageGroups)) {
          setAgeGroupOptions(
            ageGroups
              .filter((g) => g.is_active)
              .sort((a, b) => a.sort_order - b.sort_order)
              .map((g) => ({ value: g.code, label: g.display_es })),
          );
        }

        if (activePrinciples && Array.isArray(activePrinciples)) {
          const transformerOptions = activePrinciples
            .filter((p) => p.is_active)
            .map(({ active_principle_id, substance_name }) => ({
              value: String(active_principle_id),
              label: substance_name,
            }));
          setOptionsActivePrinciples(transformerOptions);
        }

        if (identifierTypes && Array.isArray(identifierTypes)) {
          setTipoDocOptions(
            identifierTypes
              .filter((t) => t.is_active)
              .sort((a, b) => a.sort_order - b.sort_order)
              .map((t) => ({ value: t.code, label: t.display_es })),
          );
        } else {
          setLoadError(
            "No se pudieron cargar los tipos de documento. Recargue el formulario.",
          );
        }

        if (timeUnits && Array.isArray(timeUnits)) {
          setTimeUnitOptions(
            [...timeUnits]
              .filter((u) => u.is_active)
              .sort((a, b) => a.display_order - b.display_order),
          );
        }
      } catch (err) {
        console.log("Error al cargar información", err);
        setLoadError(
          "No se pudo cargar la información de catálogos. Recargue el formulario.",
        );
      }
    };

    loadData();
  }, []);

  // Buscar paciente por documento
  async function handleBuscarPaciente() {
    if (!form.numeroDoc || !form.tipoDoc) return;
    setPacienteNoEncontrado(false);
    setBuscandoPaciente(true);
    const patient = await fetchPatient(form.numeroDoc, form.tipoDoc);

    if (patient) {
      setPatientId(patient.patient_id);
      setForm((f) => ({
        ...f,
        nombres: patient.first_name,
        apellidoPaterno: patient.last_name_father,
        apellidoMaterno: patient.last_name_mother,
        fechaNacimiento: patient.birth_date,
        sexo: patient.gender,
      }));
    } else {
      setPatientId(null);
      setPacienteNoEncontrado(true);
    }
    setBuscandoPaciente(false);
  }

  // Buscar motivo de ingreso
  async function handleSearchMotivo(query: string, mode: SearchMode) {
    const results = await fetchCatalogCie(query, mode);
    // const results = buscarDiagnosticoMock(query, mode);
    setMotivoOpts(
      results
        ? results.map((d) => ({
            value: d.cie_code,
            label: d.cie_description,
            secondary: d.cie_code,
          }))
        : [],
    );
  }

  async function handleGuardar() {
    if (readOnly) return;

    if (form.noIdentificado) {
      if (!form.sexo || !form.grupoEtario) {
        setSaveError(
          "Para un paciente no identificado debe indicar sexo y grupo etario estimado.",
        );
        return;
      }
    } else if (!patientId) {
      setSaveError("Debe buscar un paciente por documento antes de guardar el triaje.");
      return;
    }
    if (!form.motivoSelected || !form.prioridad) {
      setSaveError("El motivo de ingreso y la clasificación de triaje son obligatorios.");
      return;
    }
    if (!sedeActual) {
      setSaveError("No se pudo determinar la sede activa. Vuelva a iniciar sesión.");
      return;
    }

    const username = user?.username ?? "";
    // El valor real que valida el backend (illness_duration_unit) es exactamente
    // time_unit_name del catálogo — no se traduce ni se hardcodea en el frontend.
    const illnessDurationUnit = timeUnitOptions.find(
      (u) => u.time_unit_code === form.tiempoUnidad,
    )?.time_unit_name;

    const payload: TriageFormRequest = {
      triage: {
        // NN: patient_id se omite — el orquestador lo resuelve vía unidentified_patient
        ...(form.noIdentificado ? {} : { patient_id: patientId }),
        location_id: Number(sedeActual.id),
        triage_level: TRIAGE_LEVEL_MAP[form.prioridad],
        pain_scale_eva: form.dolEva ?? undefined,
        chief_complaint_code: form.motivoSelected.value,//corregir debe ser el cie_id 
        comments: form.comentarios || undefined,
        isolation_required:
          form.aislamiento === "" ? undefined : form.aislamiento === "si",
        is_pregnant: form.gestante === "" ? undefined : form.gestante === "si",
        fur_enabled: form.furEnabled,
        fur_date: form.furEnabled && form.fur ? form.fur : undefined,
        ...(form.tiempoEnfermedad && illnessDurationUnit
          ? {
              illness_duration: Number(form.tiempoEnfermedad),
              illness_duration_unit:
                illnessDurationUnit as TriageFormRequest["triage"]["illness_duration_unit"],
            }
          : {}),
        user_create: username,
      },
      ...(form.noIdentificado
        ? {
            unidentified_patient: {
              gender: form.sexo as Gender,
              estimated_age_group: form.grupoEtario as EstimatedAgeGroup,
            },
          }
        : {}),
      vitalSign: {
        systolic_pressure: form.pSistolica ? Number(form.pSistolica) : undefined,
        diastolic_pressure: form.pDiastolica
          ? Number(form.pDiastolica)
          : undefined,
        heart_rate: form.frCardiaca ? Number(form.frCardiaca) : undefined,
        respiratory_rate: form.frRespiratoria
          ? Number(form.frRespiratoria)
          : undefined,
        oxygen_saturation: form.saturacionO2
          ? Number(form.saturacionO2)
          : undefined,
        temperature_c: form.temperatura
          ? Number(form.temperatura.replace(",", "."))
          : undefined,
        trauma_shock_flag: form.traumaShock,
        user_create: username,
      },
      glasgowScale: {
        ocular_response: Number(form.glasgow.ocular),
        verbal_response: Number(form.glasgow.verbal),
        motor_response: Number(form.glasgow.motora),
        user_create: username,
      },
      fastScale: {
        face_flag: form.fast.cara === "Sí",
        arm_flag: form.fast.brazos === "Sí",
        speech_flag: form.fast.habla === "Sí",
        time_flag: form.fast.tiempo === "Sí",
        user_create: username,
      },
      allergyIntolerance: {
        has_allergies: form.tieneAlergia === "si" ? "S" : "N",
        food_allergies: form.alimentos || undefined,
        other_allergies: form.otrosAlergias || undefined,
        user_create: username,
      },
      allergySubstances: valuePrincipioActivo.map((id) => ({
        active_principle_id: Number(id),
      })),
    };

    console.log("Payload triage/form:", payload);
    // const { error } = await createTriage(payload);
    // if (error) {
    //   setSaveError(error);
    //   return;
    // }

    onGuardar?.(form);
    handleClose();
  }

  function handleClose() {
    setForm(INITIAL_FORM);
    setPacienteNoEncontrado(false);
    setSaveError(null);
    setPatientId(null);
    setValuePrincipioActivo([]);
    onClose();
  }

  const FIELD_ROW = { display: "flex", gap: 2, alignItems: "flex-end" };

  return (
    <Box>
      <HceModal
        maxWidth={460}
        open={pacienteNoEncontrado}
        title="El documento no se ha encontrado."
        description="Le solicitamos ingresar los datos de manera manual."
        icon={<UiWarningIcon />}
        confirmButton={{
          label: "Aceptar",
          onClick: () => setPacienteNoEncontrado(false),
        }}
      />
      <HceModal
        maxWidth={460}
        open={!!loadError}
        title="Error al cargar datos"
        description={loadError ?? ""}
        icon={<UiWarningIcon />}
        confirmButton={{
          label: "Aceptar",
          onClick: () => setLoadError(null),
        }}
      />
      <HceModal
        maxWidth={460}
        open={!!saveError}
        title="No se pudo guardar el triaje"
        description={saveError ?? ""}
        icon={<UiWarningIcon />}
        confirmButton={{
          label: "Aceptar",
          onClick: () => setSaveError(null),
        }}
      />
      <HceFormModal
        open={open}
        title={readOnly ? "Triaje — Solo lectura" : "Triaje"}
        onClose={handleClose}
        closeOnBackdrop={false}
        maxWidth="lg"
        primaryButton={
          readOnly
            ? undefined
            : {
                label: "Guardar triaje",
                onClick: handleGuardar,
                color: hceColors.primary.green[600],
                icon: <UiDisketteIcon size={16} color="#ffffff" />,
                disabled:
                  guardandoTriaje ||
                  (form.noIdentificado
                    ? !form.sexo || !form.grupoEtario
                    : !patientId),
                loading: guardandoTriaje,
              }
        }
        secondaryButton={{
          label: readOnly ? "Cerrar" : "Cancelar",
          onClick: handleClose,
          color: hceColors.primary.blue[600],
          icon: <CloseIcon size={16} color={hceColors.primary.blue[600]} />,
        }}
        buttonAlign="right"
      >
        <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
          {/* ── Sección 1: Datos del paciente ─────────────────────────────── */}
          <Box>
            <Typography
              sx={{
                fontFamily: hceTypography.fontFamily,
                fontWeight: 700,
                fontSize: "0.95rem",
                color: hceColors.primary.blue[600],
                mb: 1.5,
              }}
            >
              Datos del paciente
            </Typography>

            {/* Búsqueda por documento */}
            <Box
              sx={{
                display: "flex",
                alignItems: "flex-end",
                gap: 2,
                p: 2.5,
                backgroundColor: "#f5fcec",
                borderRadius: "10px",
                border: `1.5px solid ${hceColors.primary.green[500]}`,
                mb: 2,
                flexWrap: "wrap",
              }}
            >
              <Box sx={{ flex: "0 0 180px" }}>
                <SelectField
                  label="Tipo de documento *"
                  value={form.tipoDoc}
                  onChange={(v) => set("tipoDoc", v)}
                  options={tipoDocOptions}
                  placeholder="-Seleccionar opción-"
                  disabled={form.noIdentificado}
                />
              </Box>
              <Box sx={{ flex: 1, minWidth: 140 }}>
                <TextInput
                  label="Número de documento"
                  value={form.numeroDoc}
                  onChange={(v) => set("numeroDoc", v)}
                  placeholder="Ingrese documento"
                  disabled={form.noIdentificado}
                />
              </Box>
              {/* Botón buscar  */}

              <Box
                component="button"
                type="button"
                onClick={handleBuscarPaciente}
                disabled={
                  form.noIdentificado ||
                  buscandoPaciente ||
                  !form.tipoDoc ||
                  !form.numeroDoc
                }
                sx={{
                  width: 45,
                  height: 36,
                  borderRadius: "8px",
                  backgroundColor: hceColors.primary.green[500],
                  color: "#ffffff",
                  border: "none",
                  fontFamily: hceTypography.fontFamily,
                  fontWeight: 600,
                  fontSize: "0.82rem",
                  cursor: "pointer",
                  flexShrink: 0,
                  opacity:
                    form.noIdentificado ||
                    buscandoPaciente ||
                    !form.tipoDoc ||
                    !form.numeroDoc
                      ? 0.5
                      : 1,
                  whiteSpace: "nowrap",
                }}
              >
                <IconButton
                  sx={{
                    color: hceColors.neutro.white[50],
                    "&:hover": {
                      backgroundColor: "transparent",
                    },
                  }}
                >
                  <UiSearchIcon size={14}></UiSearchIcon>
                </IconButton>
              </Box>
              <Box
                component="label"
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                  px: 1.5,
                  py: 0.75,
                  border: `1.5px solid ${hceColors.primary.green[500]}`,
                  borderRadius: "8px",
                  backgroundColor: "#ffffff",
                  cursor: "pointer",
                  flexShrink: 0,
                }}
              >
                <Checkbox
                  label=""
                  checked={form.noIdentificado}
                  onChange={(v) => {
                    set("noIdentificado", v);
                    setPatientId(null);
                    setPacienteNoEncontrado(false);
                    if (v) {
                      setForm((f) => ({
                        ...f,
                        tipoDoc: "",
                        numeroDoc: "",
                        nombres: "",
                        apellidoPaterno: "",
                        apellidoMaterno: "",
                        fechaNacimiento: "",
                        sexo: "unknown",
                      }));
                    } else {
                      setForm((f) => ({ ...f, grupoEtario: "", sexo: "" }));
                    }
                  }}
                ></Checkbox>
                <Typography
                  sx={{
                    fontFamily: hceTypography.fontFamily,
                    fontSize: "0.82rem",
                    color: hceColors.primary.blue[600],
                    fontWeight: 500,
                  }}
                >
                  No identificado
                </Typography>
              </Box>
            </Box>

            {/* Campos del paciente */}
            {form.noIdentificado ? (
              <Box sx={FIELD_ROW}>
                <FieldCol label="Documento" flex={1}>
                  <TextInput value="NI" disabled onChange={() => {}} />
                </FieldCol>
                <FieldCol label="Número de documento" flex={1.5}>
                  <TextInput value="XXXXXXXX" disabled onChange={() => {}} />
                </FieldCol>
                <Box sx={{ flex: 1.5 }}>
                  <SelectField
                    label="Sexo *"
                    value={form.sexo}
                    onChange={(v) => set("sexo", v)}
                    options={genderOptions}
                    placeholder="-Seleccionar opción-"
                  />
                </Box>
                <Box sx={{ flex: 2 }}>
                  <SelectField
                    label="Grupo etario estimado *"
                    value={form.grupoEtario}
                    onChange={(v) => set("grupoEtario", v)}
                    options={ageGroupOptions}
                    placeholder="-Seleccionar opción-"
                  />
                </Box>
              </Box>
            ) : (
              <Box sx={FIELD_ROW}>
                <FieldCol label="Nombres" flex={2}>
                  <TextInput
                    value={form.nombres}
                    onChange={(v) => set("nombres", v)}
                    placeholder="Ingrese datos"
                  />
                </FieldCol>
                <FieldCol label="Apellido Paterno" flex={1.5}>
                  <TextInput
                    value={form.apellidoPaterno}
                    onChange={(v) => set("apellidoPaterno", v)}
                    placeholder="Ingrese datos"
                  />
                </FieldCol>
                <FieldCol label="Apellido Materno" flex={1.5}>
                  <TextInput
                    value={form.apellidoMaterno}
                    onChange={(v) => set("apellidoMaterno", v)}
                    placeholder="Ingrese datos"
                  />
                </FieldCol>
                <FieldCol label="Fecha de nacimiento" flex="0 0 160px">
                  <TextInput
                    value={form.fechaNacimiento}
                    onChange={(v) => set("fechaNacimiento", v)}
                    placeholder="dd/mm/yyyy"
                  />
                </FieldCol>
                <Box sx={{ flex: 1.5 }}>
                  <SelectField
                    label="Sexo"
                    value={form.sexo}
                    onChange={(v) => set("sexo", v)}
                    options={genderOptions}
                    placeholder="-Seleccionar opción-"
                  />
                </Box>
              </Box>
            )}
          </Box>

          {/* ── Sección 2: Datos clínicos (colapsable) ────────────────────── */}
          <Box>
            <SectionHeader
              title="Datos clínicos"
              expanded={expDatosClinicos}
              onToggle={() => setExpDatosClinicos((e) => !e)}
            />
            {expDatosClinicos && (
              <Box
                sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 2 }}
              >
                {/* Motivo de ingreso con SearchComboInput */}
                <SearchComboInput
                  label="Motivo de ingreso *"
                  searchMode={form.modoMotivo}
                  onSearchModeChange={(m) => {
                    set("modoMotivo", m);
                    set("motivoQuery", "");
                    set("motivoSelected", null);
                    setMotivoOpts([]);
                  }}
                  value={form.motivoQuery}
                  onChange={(v) => set("motivoQuery", v)}
                  options={motivoOpts}
                  onSearch={handleSearchMotivo}
                  onSelect={(opt) => {
                    set("motivoSelected", opt);
                    set("motivoQuery", opt.label);
                    setMotivoOpts([]);
                  }}
                />

                {/* Aislamiento + Gestante + FUR + Tiempo de enfermedad */}
                <Box
                  sx={{
                    display: "flex",
                    gap: 2,
                    alignItems: "flex-end",
                    flexWrap: "nowrap",
                    width: "100%",
                  }}
                >
                  <RadioGroup
                    legend="Aislamiento"
                    value={form.aislamiento}
                    options={opcionesRadio}
                    onChange={(v) => set("aislamiento", v)}
                  />
                  <RadioGroup
                    legend="Gestante"
                    value={form.gestante}
                    options={opcionesRadio}
                    onChange={(v) => set("gestante", v)}
                    disabled={form.sexo === "male"}
                  />
                  <Box
                    sx={{ display: "flex", alignItems: "flex-end", gap: 1.5 }}
                  >
                    <Toggle
                      label="FUR"
                      checked={form.furEnabled}
                      onChange={(v) => {
                        set("furEnabled", v);
                        if (!v) set("fur", "");
                      }}
                    />
                    <FieldCol label="Fecha FUR" flex="0 0 150px">
                      <TextInput
                        value={form.fur}
                        onChange={(v) => set("fur", v)}
                        placeholder="dd/mm/yyyy"
                        disabled={!form.furEnabled}
                      />
                    </FieldCol>
                  </Box>
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <FieldCol label="T. de enfermedad">
                      <Box sx={{ display: "flex", width: "100%" }}>
                        <Box
                          component="input"
                          type="text"
                          inputMode="numeric"
                          value={form.tiempoEnfermedad}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                            set(
                              "tiempoEnfermedad",
                              e.target.value.replace(/\D/g, ""),
                            )
                          }
                          placeholder="Ej: 12"
                          sx={{
                            flex: 1,
                            minWidth: 0,
                            height: 40,
                            px: 1.5,
                            border: `1.5px solid ${hceColors.neutro.black[200]}`,
                            borderRight: "none",
                            borderRadius: "8px 0 0 8px",
                            outline: "none",
                            fontFamily: hceTypography.fontFamily,
                            fontSize: "0.875rem",
                          }}
                        />

                        <Box
                          sx={{
                            width: "90px",
                            flexShrink: 0,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            px: 1,
                            backgroundColor: hceColors.primary.blue[600],
                            color: "#fff",
                            borderRadius: "0 8px 8px 0",
                            fontFamily: hceTypography.fontFamily,
                            fontWeight: 600,
                            fontSize: "0.78rem",
                            whiteSpace: "nowrap",
                            cursor: "pointer",
                          }}
                          onClick={() => {
                            if (!timeUnitOptions.length) return;
                            const idx = timeUnitOptions.findIndex(
                              (u) => u.time_unit_code === form.tiempoUnidad,
                            );
                            const next =
                              timeUnitOptions[
                                (idx + 1) % timeUnitOptions.length
                              ];
                            set("tiempoUnidad", next.time_unit_code);
                          }}
                        >
                          {timeUnitOptions.find(
                            (u) => u.time_unit_code === form.tiempoUnidad,
                          )?.time_unit_name ?? form.tiempoUnidad}{" "}
                          ▾
                        </Box>
                      </Box>
                    </FieldCol>
                  </Box>
                </Box>

                <TextareaField
                  label="Comentarios"
                  value={form.comentarios}
                  onChange={(v) => set("comentarios", v)}
                  maxLength={100}
                  placeholder="Ingrese comentarios"
                />
              </Box>
            )}
          </Box>

          {/* ── Sección 3: Signos vitales (colapsable) ────────────────────── */}
          <Box>
            <SectionHeader
              title="Signos vitales"
              expanded={expSignosVitales}
              onToggle={() => setExpSignosVitales((e) => !e)}
            />
            {expSignosVitales && (
              <Box sx={{ mt: 2 }}>
                <Box
                  sx={{
                    width: "100%",
                  }}
                >
                  <Grid
                    container
                    columns={24}
                    spacing={2}
                    sx={{
                      width: "100%",
                      alignItems: "flex-end"
                    }}
                  >
                    <Grid size={{xs:24, md:14}}>
                      <RadioGroup
                        value={form.traumaShock}
                        options={opcionesRadioSignosVitales}
                        onChange={(v) => {
                          set("traumaShock", v);
                        }}
                      />
                    </Grid>
                    {/* <Grid size={{ md: 1 }} /> */}
                    <Grid size={{ xs: 8, md: 3 }}>
                      <NumericField
                        label="Peso"
                        value={form.peso}
                        onChange={(v) => set("peso", v)}
                        suffix="Kg"
                      />
                    </Grid>
                    <Grid size={{ xs: 8, md: 3 }}>
                      <NumericField
                        label="Talla"
                        value={form.talla}
                        onChange={(v) => set("talla", v)}
                        suffix="cm"
                      />
                    </Grid>
                    <Grid size={{ xs: 8, md: 4 }}>
                      <NumericField
                        label="IMC"
                        value={imc}
                        suffix="%"
                        readOnly
                      />
                    </Grid>
                  </Grid>
                </Box>

                <Box
                  sx={{
                    display: "flex",
                    flexDirection: "row",
                    gap: 2,
                    width: "100%",
                    alignItems: "flex-end",
                  }}
                >
                  {[
                    { key: "frCardiaca", label: "Fr. Cardiaca", suffix: "lpm" },
                    {
                      key: "frRespiratoria",
                      label: "Fr. Respiratoria",
                      suffix: "rpm",
                    },
                    {
                      key: "pSistolica",
                      label: "P. Sistólica",
                      suffix: "mmHg",
                    },
                    {
                      key: "pDiastolica",
                      label: "P. Diastólica",
                      suffix: "mmHg",
                    },
                    { key: "temperatura", label: "Temperatura", suffix: "°C" },
                    {
                      key: "saturacionO2",
                      label: "Saturación O2",
                      suffix: "%",
                    },
                  ].map((f) => (
                    <Box key={f.key} sx={{}}>
                      <NumericField
                        label={f.label}
                        value={form[f.key as keyof TriajeForm] as string}
                        onChange={(v) =>
                          set(f.key as keyof TriajeForm, v as any)
                        }
                        suffix={f.suffix}
                      />
                    </Box>
                  ))}
                </Box>

                {/* Fila 2: Signos */}
                {/* <Box sx={{ display: "flex", gap: 1.5, flexWrap: "wrap" }}>
                 
                </Box> */}

                {/* Escala de Glasgow + FAST */}
                <Box sx={{ display: "flex", gap: 2 }}>
                  {/* Glasgow */}
                  <Box
                    component="fieldset"
                    sx={{
                      flex: 1,
                      border: `1.5px solid ${hceColors.primary.green[500]}`,
                      borderRadius: "8px",
                      px: 2,
                      py: 1.5,
                      m: 0,
                    }}
                  >
                    <Box
                      component="legend"
                      sx={{
                        px: 1,
                        fontFamily: hceTypography.fontFamily,
                        fontSize: "0.75rem",
                        fontWeight: 700,
                        color: hceColors.primary.blue[600],
                      }}
                    >
                      Escala de Glasgow
                    </Box>
                    <Box sx={{ display: "flex", gap: 1.5, mt: 1 }}>
                      {(["ocular", "verbal", "motora"] as const).map((key) => (
                        <Box key={key} sx={{ flex: 1 }}>
                          <SelectField
                            label={
                              {
                                ocular: "R. Ocular",
                                verbal: "R. Verbal",
                                motora: "R. Motora",
                              }[key]
                            }
                            value={form.glasgow[key]}
                            onChange={(v) =>
                              set("glasgow", { ...form.glasgow, [key]: v })
                            }
                            options={Array.from(
                              {
                                length:
                                  key === "ocular"
                                    ? 4
                                    : key === "verbal"
                                      ? 5
                                      : 6,
                              },
                              (_, i) => ({
                                value: String(i + 1),
                                label: String(i + 1),
                              }),
                            )}
                          />
                        </Box>
                      ))}
                      <NumericField
                        label="Resultado"
                        value={String(glasgowTotal)}
                        suffix="pts"
                        readOnly
                      />
                    </Box>
                  </Box>

                  {/* FAST */}
                  <Box
                    component="fieldset"
                    sx={{
                      flex: 1,
                      border: `1.5px solid ${hceColors.primary.green[500]}`,
                      borderRadius: "8px",
                      px: 2,
                      py: 1.5,
                      m: 0,
                    }}
                  >
                    <Box
                      component="legend"
                      sx={{
                        px: 1,
                        fontFamily: hceTypography.fontFamily,
                        fontSize: "0.75rem",
                        fontWeight: 700,
                        color: hceColors.primary.blue[600],
                      }}
                    >
                      FAST
                    </Box>
                    <Box sx={{ display: "flex", gap: 1.5, mt: 1 }}>
                      {(["cara", "brazos", "habla", "tiempo"] as const).map(
                        (key) => (
                          <Box key={key} sx={{ flex: 1 }}>
                            <SelectField
                              label={
                                {
                                  cara: "Cara",
                                  brazos: "Brazos",
                                  habla: "Habla",
                                  tiempo: "Tiempo",
                                }[key]
                              }
                              value={form.fast[key]}
                              onChange={(v) =>
                                set("fast", { ...form.fast, [key]: v })
                              }
                              options={[
                                { value: "No", label: "No" },
                                { value: "Sí", label: "Sí" },
                              ]}
                            />
                          </Box>
                        ),
                      )}
                    </Box>
                  </Box>
                </Box>
              </Box>
            )}
          </Box>

          {/* ── Sección 4: Declaratoria de alergias (colapsable) ──────────── */}
          <Box>
            <SectionHeader
              title="Declaratoria de alergias"
              expanded={expAlergias}
              onToggle={() => setExpAlergias((e) => !e)}
            />
            {expAlergias && (
              <Box
                sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 2 }}
              >
                <Box
                  sx={{
                    display: "flex",
                    gap: 2,
                    alignItems: "flex-end",
                    flexWrap: "wrap",
                  }}
                >
                  <Box
                    component="fieldset"
                    sx={{
                      border: `1.5px solid ${hceColors.primary.green[500]}`,
                      borderRadius: "8px",
                      px: 2,
                      py: 1,
                      m: 0,
                      flexShrink: 0,
                    }}
                  >
                    <Box component="legend" sx={{ display: "none" }}>
                      Declaratoria
                    </Box>
                    <Box sx={{ display: "flex", gap: 2 }}>
                      {[
                        { value: "si", label: "Si" },
                        { value: "niega", label: "Niega alergias" },
                      ].map((opt) => (
                        <Box
                          key={opt.value}
                          component="label"
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 1,
                            cursor: "pointer",
                            fontFamily: hceTypography.fontFamily,
                            fontSize: "0.875rem",
                          }}
                        >
                          <input
                            type="radio"
                            name="alergia-declaratoria"
                            value={opt.value}
                            checked={form.tieneAlergia === opt.value}
                            onChange={() => set("tieneAlergia", opt.value)}
                            style={{
                              accentColor: hceColors.primary.green[500],
                            }}
                          />
                          {opt.label}
                        </Box>
                      ))}
                    </Box>
                  </Box>
                  <Box sx={{ flex: 1, minWidth: 220 }}>
                    {/* <SelectField
                    label="Principio activo"
                    value={form.principioActivo}
                    onChange={(v) => set("principioActivo", v)}
                    options={PRINCIPIOS_ACTIVOS_OPTIONS}
                    placeholder="-Seleccionar principio activo-"
                  /> */}
                    <MultiSelect
                      options={optionsActivePrinciples}
                      label="Principio activo"
                      value={valuePrincipioActivo}
                      onChange={setValuePrincipioActivo}
                    />
                  </Box>
                </Box>
                <TextareaField
                  label="Alimentos"
                  value={form.alimentos}
                  onChange={(v) => set("alimentos", v)}
                  maxLength={100}
                  placeholder="Describa alergias alimentarias"
                />
                <TextareaField
                  label="Otros"
                  value={form.otrosAlergias}
                  onChange={(v) => set("otrosAlergias", v)}
                  maxLength={100}
                  placeholder="Otros tipos de alergia"
                />
              </Box>
            )}
          </Box>

          {/* ── Sección 5: Escala EVA (colapsable) ───────────────────────── */}
          <Box>
            <SectionHeader
              title="Escala de dolor (EVA)"
              expanded={expEva}
              onToggle={() => setExpEva((e) => !e)}
            />
            {expEva && (
              <Box sx={{ mt: 3, px: 1 }}>
                <EvaScale
                  value={form.dolEva}
                  onChange={(v) => set("dolEva", v)}
                />
              </Box>
            )}
          </Box>

          {/* ── Sección 6: Clasificación de triaje (colapsable) ───────────── */}
          <Box>
            <SectionHeader
              title="Clasificación de triaje"
              expanded={expTriaje}
              onToggle={() => setExpTriaje((e) => !e)}
            />
            {expTriaje && (
              <Box
                sx={{ mt: 2, px: 1, display: "flex", justifyContent: "center" }}
              >
                <TriagePriorityDisplay
                  selected={form.prioridad}
                  onSelect={(p) => set("prioridad", p)}
                />
              </Box>
            )}
          </Box>
        </Box>
      </HceFormModal>
    </Box>
  );
}

export default Triage;
