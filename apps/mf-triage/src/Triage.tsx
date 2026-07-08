import { useState, useCallback, useEffect } from "react";
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
  CSFLoading,
  SectionHeader,
  FieldCol,
  Toggle,
  NumericField,
  TextareaField,
  DatePicker,
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

// El backend entrega birth_date en ISO (YYYY-MM-DD); este campo es solo de
// visualización (no se reenvía en el payload de triaje), y debe mostrarse en DD-MM-YYYY.
function formatBirthDate(isoDate: string): string {
  if (!isoDate) return "";
  const [y, m, d] = isoDate.split("-");
  if (!y || !m || !d) return isoDate;
  return `${d}-${m}-${y}`;
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

export function Triage({
  open,
  onClose,
  onGuardar,
  mode = "write",
}: TriajeModalProps) {
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
  const [timeUnitOptions, setTimeUnitOptions] = useState<CatalogTimeUnit[]>([]);
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
    loadingCatalogCie,
    loadingCodeSystemValues,
    loadingCatalogActivePrinciples,
    loadingIdentifierTypes,
    loadingTimeUnits,
    loadingAgeGroups,
  } = useCatalog();
  //Registro de Triaje
  const { createTriage,loading: guardandoTriaje } = useTriage();
  // Overlay unificado: cualquier llamada en curso del formulario (catálogos, búsqueda de
  // paciente, guardado) bloquea la pantalla con el mismo spinner de marca.
  const formBusy =
    guardandoTriaje ||
    buscandoPaciente ||
    loadingCatalogCie ||
    loadingCodeSystemValues ||
    loadingCatalogActivePrinciples ||
    loadingIdentifierTypes ||
    loadingTimeUnits ||
    loadingAgeGroups;
  //Usuario y sede activa (federados desde mf-shell)
  const { user, sedeActual } = useUser();

  const opcionesRadio = [
    { value: "S", label: "Si" },
    { value: "N", label: "No" },
  ];
  const opcionesRadioAlergia = [
    { value: "S", label: "Si" },
    { value: "N", label: "Niega alergias" },
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
        const [
          activePrinciples,
          identifierTypes,
          timeUnits,
          genders,
          ageGroups,
        ] = results;

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
        console.error("Error al cargar información", err);
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
        fechaNacimiento: formatBirthDate(patient.birth_date),
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
            value: d.cie_id,
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
      setSaveError(
        "Debe buscar un paciente por documento antes de guardar el triaje.",
      );
      return;
    }
    if (!form.motivoSelected || !form.prioridad) {
      setSaveError(
        "El motivo de ingreso y la clasificación de triaje son obligatorios.",
      );
      return;
    }
    if (!sedeActual) {
      setSaveError(
        "No se pudo determinar la sede activa. Vuelva a iniciar sesión.",
      );
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
        cie_id: form.motivoSelected.value,
        comments: form.comentarios || undefined,
        isolation_required:
          form.aislamiento === "" ? undefined : form.aislamiento === "S",
        is_pregnant: form.gestante === "" ? undefined : form.gestante === "S",
        fur_enabled: form.furEnabled,
        fur_date: form.furEnabled && form.fur ? form.fur : undefined,
        ...(form.tiempoEnfermedad && illnessDurationUnit
          ? {
              illness_duration: Number(form.tiempoEnfermedad),
              illness_duration_unit: illnessDurationUnit,
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
        systolic_pressure: form.pSistolica
          ? Number(form.pSistolica)
          : undefined,
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
        has_allergies: form.tieneAlergia === "S" ? "S" : "N",
        food_allergies: form.alimentos || undefined,
        other_allergies: form.otrosAlergias || undefined,
        user_create: username,
      },
      allergySubstances: valuePrincipioActivo.map((id) => ({
        active_principle_id: Number(id),
      })),
    };

    const { error } = await createTriage(payload);
    if (error) {
      setSaveError(error);
      return;
    }

    onGuardar?.(form);
    // handleClose();
  }

  function handleClose() {
    setForm(INITIAL_FORM);
    setPacienteNoEncontrado(false);
    setSaveError(null);
    setPatientId(null);
    setValuePrincipioActivo([]);
    onClose();
  }

  return (
    <Box>
      <CSFLoading
        open={formBusy}
        overlay
        message={guardandoTriaje ? "Guardando triaje..." : "Cargando..."}
        frameDuration={100}
      />
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
        maxWidth="md"
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
                  label="No identificado"
                  sideLabel="end"
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
              </Box>
            </Box>

            {/* Campos del paciente */}
            {/* Grid con size={{xs,sm,md}} en vez de flex+minWidth: con flex, cada campo tenía
                un ratio pensado solo para la fila de escritorio, así que al envolver en
                pantalla chica quedaban con anchos dispares y desordenados. Con Grid, cada
                campo pasa a ocupar una fracción prolija y predecible por breakpoint (1 por
                fila en mobile, 2 por fila en tablet), preservando en md las mismas
                proporciones visuales que tenía la fila de escritorio original. */}
            {form.noIdentificado ? (
              <Grid container columns={24} spacing={2} sx={{ width: "100%", alignItems: "flex-end" }}>
                <Grid size={{ xs: 24, sm: 12, md: 4 }}>
                  <FieldCol label="Documento">
                    <TextInput value="NI" disabled onChange={() => {}} />
                  </FieldCol>
                </Grid>
                <Grid size={{ xs: 24, sm: 12, md: 6 }}>
                  <FieldCol label="Número de documento">
                    <TextInput value="XXXXXXXX" disabled onChange={() => {}} />
                  </FieldCol>
                </Grid>
                <Grid size={{ xs: 24, sm: 12, md: 6 }}>
                  <SelectField
                    label="Sexo *"
                    value={form.sexo}
                    onChange={(v) => set("sexo", v)}
                    options={genderOptions}
                    placeholder="-Seleccionar opción-"
                  />
                </Grid>
                <Grid size={{ xs: 24, sm: 12, md: 8 }}>
                  <SelectField
                    label="Grupo etario estimado *"
                    value={form.grupoEtario}
                    onChange={(v) => set("grupoEtario", v)}
                    options={ageGroupOptions}
                    placeholder="-Seleccionar opción-"
                  />
                </Grid>
              </Grid>
            ) : (
              <Grid container columns={24} spacing={2} sx={{ width: "100%", alignItems: "flex-end" }}>
                <Grid size={{ xs: 24, sm: 12, md: 6 }}>
                  <FieldCol label="Nombres">
                    <TextInput
                      value={form.nombres}
                      onChange={(v) => set("nombres", v)}
                      placeholder="Ingrese datos"
                    />
                  </FieldCol>
                </Grid>
                <Grid size={{ xs: 24, sm: 12, md: 5 }}>
                  <FieldCol label="Apellido Paterno">
                    <TextInput
                      value={form.apellidoPaterno}
                      onChange={(v) => set("apellidoPaterno", v)}
                      placeholder="Ingrese datos"
                    />
                  </FieldCol>
                </Grid>
                <Grid size={{ xs: 24, sm: 12, md: 5 }}>
                  <FieldCol label="Apellido Materno">
                    <TextInput
                      value={form.apellidoMaterno}
                      onChange={(v) => set("apellidoMaterno", v)}
                      placeholder="Ingrese datos"
                    />
                  </FieldCol>
                </Grid>
                <Grid size={{ xs: 24, sm: 12, md: 4 }}>
                  <FieldCol label="Fecha de nacimiento">
                    <TextInput
                      value={form.fechaNacimiento}
                      onChange={(v) => set("fechaNacimiento", v)}
                      placeholder="dd-mm-yyyy"
                    />
                  </FieldCol>
                </Grid>
                <Grid size={{ xs: 24, sm: 12, md: 4 }}>
                  <SelectField
                    label="Sexo"
                    value={form.sexo}
                    onChange={(v) => set("sexo", v)}
                    options={genderOptions}
                    placeholder="-Seleccionar opción-"
                  />
                </Grid>
              </Grid>
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

                {/* Aislamiento + Gestante + FUR + Tiempo de enfermedad.
                    columns={24} + size={{xs,sm,md}}, mismo patrón responsivo que "Signos
                    Vitales" — antes usaba size={3} fijo (sin breakpoints), así que no
                    reordenaba en pantallas chicas y las celdas se aplastaban en vez de
                    apilarse/ajustarse como el resto de los campos del form. */}
                <Grid container columns={24} spacing={2}>
                  <Grid size={{ xs: 24, sm: 12, md: 6 }}>
                    <RadioGroup
                      legend="Aislamiento"
                      value={form.aislamiento}
                      options={opcionesRadio}
                      onChange={(v) => set("aislamiento", v)}
                    />
                  </Grid>
                  <Grid size={{ xs: 24, sm: 12, md: 6 }}>
                    <RadioGroup
                      legend="Gestante"
                      value={form.gestante}
                      options={opcionesRadio}
                      onChange={(v) => set("gestante", v)}
                      disabled={form.sexo === "male"}
                    />
                  </Grid>
                  <Grid size={{ xs: 24, sm: 12, md: 6 }}>
                    {/* minWidth:0 (no un valor fijo como 220) — un mínimo fijo mayor al ancho
                        real de la celda del Grid en ciertos breakpoints la desbordaba, tapando
                        "T. de enfermedad". El Toggle mantiene su ancho fijo y el FieldCol con
                        flex:1 1 0 ya se encarga de que el DatePicker ocupe el espacio restante
                        real de la celda, sin forzar un piso que no siempre entra. */}
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "flex-end",
                        gap: 1,
                        width: "100%",
                        minWidth: 0,
                      }}
                    >
                      <Toggle
                        checked={form.furEnabled}
                        disabled={form.sexo === "male"}
                        onChange={(v) => {
                          set("furEnabled", v);
                          if (!v) set("fur", "");
                        }}
                      />
                      <FieldCol label="Fecha FUR" flex="1 1 0">
                        {/* DatePicker: doble método de entrada (escritura manual segmentada +
                            selector de calendario nativo). El value ya es YYYY-MM-DD, formato
                            que exige @IsDateString() en fur_date del backend
                            (ms-bs-core-triage/create-Triage.dto.ts) — sin conversión manual. */}
                        <DatePicker
                          value={form.fur}
                          onChange={(v) => set("fur", v)}
                          disabled={!form.furEnabled || form.sexo === "male"}
                        />
                      </FieldCol>
                    </Box>
                  </Grid>
                  <Grid size={{ xs: 24, sm: 12, md: 6 }}>
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <FieldCol label="T. de enfermedad">
                        <Box sx={{ display: "flex", width: "100%" }}>
                          <Box
                            component="input"
                            type="text"
                            inputMode="numeric"
                            value={form.tiempoEnfermedad}
                            onChange={(
                              e: React.ChangeEvent<HTMLInputElement>,
                            ) =>
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
                  </Grid>
                </Grid>

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
              <Box>
                <Grid
                  container
                  columns={24}
                  spacing={2}
                  sx={{
                    width: "100%",
                    alignItems: "flex-end",
                    mt: 2,
                  }}
                >
                  <Grid size={{ xs: 24, md: 14 }}>
                    <RadioGroup
                      value={form.traumaShock}
                      options={opcionesRadioSignosVitales}
                      onChange={(v) => {
                        set("traumaShock", v);
                      }}
                    />
                  </Grid>
                  <Grid size={{ xs: 8, md: 3 }}>
                    <NumericField
                      label="Peso"
                      value={form.peso}
                      onChange={(v) => set("peso", v)}
                      suffix="Kg"
                      numberType="decimal"
                    />
                  </Grid>
                  <Grid size={{ xs: 8, md: 3 }}>
                    <NumericField
                      label="Talla"
                      value={form.talla}
                      onChange={(v) => set("talla", v)}
                      suffix="cm"
                      numberType="natural"
                    />
                  </Grid>
                  <Grid size={{ xs: 8, md: 4 }}>
                    <NumericField label="IMC" value={imc} suffix="" readOnly />
                  </Grid>
                </Grid>
                {/* Fila 2: Signos */}
                <Grid
                  container
                  columns={12}
                  spacing={2}
                  sx={{
                    width: "100%",
                    alignItems: "flex-end",
                    mt: 2,
                  }}
                >
                  {[
                    { key: "frCardiaca", label: "Fr. Cardiaca", suffix: "LPM", numberType: "natural" as const },
                    {
                      key: "frRespiratoria",
                      label: "Fr. Respiratoria",
                      suffix: "RPM",
                      numberType: "natural" as const,
                    },
                    {
                      key: "pSistolica",
                      label: "P. Sistólica",
                      suffix: "mmHg",
                      numberType: "natural" as const,
                    },
                    {
                      key: "pDiastolica",
                      label: "P. Diastólica",
                      suffix: "mmHg",
                      numberType: "natural" as const,
                    },
                    { key: "temperatura", label: "Temperatura", suffix: "°C", numberType: "decimal" as const },
                    {
                      key: "saturacionO2",
                      label: "Saturación O2",
                      suffix: "%",
                      numberType: "natural" as const,
                    },
                  ].map((f) => (
                    <Grid key={f.key} size={{ xs: 6, sm: 4, md: 2 }}>
                      <NumericField
                        label={f.label}
                        value={form[f.key as keyof TriajeForm] as string}
                        numberType={f.numberType}
                        onChange={(v) =>
                          set(f.key as keyof TriajeForm, v as any)
                        }
                        suffix={f.suffix}
                      />
                    </Grid>
                  ))}
                </Grid>

                {/* Escala de Glasgow + FAST */}

                {/* En pantalla normal (md+) van lado a lado como siempre; en pantallas
                    chicas se apilan en vez de aplastar los dos fieldsets uno junto al otro. */}
                <Box sx={{ display: "flex", flexDirection: { xs: "column", md: "row" }, gap: 2, mt: 2 }}>
                  {/* Glasgow */}
                  <Box
                    component="fieldset"
                    sx={{
                      flex: 1,
                      border: `1.5px solid ${hceColors.primary.green[500]}`,
                      borderRadius: "8px",
                      m: 0,
                    }}
                  >
                    <Box
                      component="legend"
                      sx={{
                        fontFamily: hceTypography.fontFamily,
                        fontSize: "0.75rem",
                        fontWeight: 700,
                        color: hceColors.primary.blue[600],
                      }}
                    >
                      Escala de Glasgow
                    </Box>
                    <Grid
                      container
                      columns={12}
                      spacing={2}
                      sx={{
                        width: "100%",
                        alignItems: "flex-end",
                      }}
                    >
                      {(["ocular", "verbal", "motora"] as const).map((key) => (
                        <Grid key={key} size={{ xs: 12, sm: 6, md: 3 }}>
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
                        </Grid>
                      ))}
                      {/* No estaba envuelto en un Grid item propio — quedaba con el tamaño
                          implícito de MUI Grid v2 en vez de alinearse con sus 3 hermanos. */}
                      <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                        <NumericField
                          label="Resultado"
                          value={String(glasgowTotal)}
                          suffix="pts"
                          readOnly
                        />
                      </Grid>
                    </Grid>
                  </Box>

                  {/* FAST */}
                  <Box
                    component="fieldset"
                    sx={{
                      flex: 1,
                      border: `1.5px solid ${hceColors.primary.green[500]}`,
                      borderRadius: "8px",
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
                    <Grid
                      container
                      columns={12}
                      spacing={2}
                      sx={{
                        width: "100%",
                        alignItems: "flex-end",
                      }}
                    >
                      {(["cara", "brazos", "habla", "tiempo"] as const).map(
                        (key) => (
                          <Grid key={key} size={{ xs: 12, sm: 6, md: 3 }}>
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
                          </Grid>
                        ),
                      )}
                    </Grid>
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
              <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 2 }}>
                <Grid
                  container
                  columns={12}
                  spacing={2}
                  sx={{
                    width: "100%",
                    alignItems: "flex-end",
                  }}
                >
                  <Grid size={{ xs: 12, sm: 4, md: 4 }}>
                    <RadioGroup
                      value={form.tieneAlergia}
                      options={opcionesRadioAlergia}
                      onChange={(v) => {
                        set("tieneAlergia", v);
                      }}
                    />
                  </Grid>

                  <Grid size={{ xs: 12, sm: 8, md: 8 }}>
                    <MultiSelect
                      options={optionsActivePrinciples}
                      label="Principio activo"
                      value={valuePrincipioActivo}
                      onChange={setValuePrincipioActivo}
                    />
                  </Grid>
                </Grid>
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
              <Box sx={{ mt: 2, px: 1 }}>
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
