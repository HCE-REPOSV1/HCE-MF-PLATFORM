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
  LoadingOverlay,
  SectionHeader,
  FieldCol,
  Toggle,
  NumericField,
  TextareaField,
  DatePicker,
  Grid,
  IconButton,
} from "@hce/design-system";
import { useTranslation } from "@hce/i18n-core";
import type {
  TriagePriority,
  SearchOption,
  SearchMode,
} from "@hce/design-system";
// import { buscarDiagnosticoMock } from "./mock/triage.mock";

import { registerTriageNamespace } from "./i18n";
import { usePatient } from "./hooks/usePatient";
import { useCatalog } from "./hooks/useCatalog";
import { useTriage } from "./hooks/useTriage";
import { useTriageFull } from "./hooks/useTriageFull";
import { useUser } from "shell/UserContext";
import { CSI_GENDER } from "./config/endpoints";
import type { CatalogTimeUnit } from "./types/catalog.types";
import type {
  TriageFormRequest,
  Gender,
  EstimatedAgeGroup,
  TriageFullData,
} from "./types/triage.types";
import { PERMISOS_EMERGENCY } from "./config/permisos";
import { usePermiso } from "./hooks/usePermiso";

const TRIAGE_LEVEL_MAP: Record<TriagePriority, number> = {
  I: 1,
  II: 2,
  III: 3,
  IV: 4,
};

const TRIAGE_LEVEL_MAP_REVERSE: Record<number, TriagePriority> = {
  1: "I",
  2: "II",
  3: "III",
  4: "IV",
};

// El backend entrega birth_date en ISO (YYYY-MM-DD); este campo es solo de
// visualización (no se reenvía en el payload de triaje), y debe mostrarse en DD-MM-YYYY.
function formatBirthDate(isoDate: string): string {
  if (!isoDate) return "";
  const [y, m, d] = isoDate.split("-");
  if (!y || !m || !d) return isoDate;
  return `${d}-${m}-${y}`;
}

/** GET /triage/:id/full -> TriajeForm, para precarga en modo lectura. */
function mapTriageFullToForm(full: TriageFullData): Partial<TriajeForm> {
  const {
    triage,
    vitalSign,
    glasgowScale,
    fastScale,
    patient,
    allergyIntolerance,
  } = full;

  return {
    tipoDoc: patient?.document_type ?? "",
    numeroDoc: patient?.document_number ?? "",
    nombres: patient?.first_name ?? "",
    apellidoPaterno: patient?.last_name_father ?? "",
    apellidoMaterno: patient?.last_name_mother ?? "",
    fechaNacimiento: patient?.birth_date
      ? formatBirthDate(patient.birth_date)
      : "",
    sexo: patient?.gender ?? "",
    grupoEtario: patient?.estimated_age_group ?? "",

    motivoQuery: triage.cie_description != null ? triage.cie_description : "",
    aislamiento:
      triage.isolation_required == null
        ? ""
        : triage.isolation_required
          ? "S"
          : "N",
    gestante: triage.is_pregnant == null ? "" : triage.is_pregnant ? "S" : "N",
    furEnabled: Boolean(triage.fur_enabled),
    fur: triage.fur_date?.split("T")[0] ?? "",
    tiempoEnfermedad:
      triage.illness_duration != null ? String(triage.illness_duration) : "",
    tiempoUnidad: triage.illness_duration_unit ?? "",
    comentarios: triage.comments ?? "",

    traumaShock:
      vitalSign?.trauma_shock_flag === true
        ? true
        : vitalSign?.impossible_capture_flag === true
          ? false
          : null,
    peso: vitalSign?.weight_kg != null ? String(vitalSign.weight_kg) : "",
    talla: vitalSign?.height_cm != null ? String(vitalSign.height_cm) : "",
    frCardiaca:
      vitalSign?.heart_rate != null ? String(vitalSign.heart_rate) : "",
    frRespiratoria:
      vitalSign?.respiratory_rate != null
        ? String(vitalSign.respiratory_rate)
        : "",
    pSistolica:
      vitalSign?.systolic_pressure != null
        ? String(vitalSign.systolic_pressure)
        : "",
    pDiastolica:
      vitalSign?.diastolic_pressure != null
        ? String(vitalSign.diastolic_pressure)
        : "",
    temperatura:
      vitalSign?.temperature_c != null ? String(vitalSign.temperature_c) : "",
    saturacionO2:
      vitalSign?.oxygen_saturation != null
        ? String(vitalSign.oxygen_saturation)
        : "",
    glasgow: {
      ocular:
        glasgowScale?.ocular_response != null
          ? String(glasgowScale.ocular_response)
          : "1",
      verbal:
        glasgowScale?.verbal_response != null
          ? String(glasgowScale.verbal_response)
          : "1",
      motora:
        glasgowScale?.motor_response != null
          ? String(glasgowScale.motor_response)
          : "1",
    },
    fast: {
      cara: fastScale?.face_flag ? "Sí" : "No",
      brazos: fastScale?.arm_flag ? "Sí" : "No",
      habla: fastScale?.speech_flag ? "Sí" : "No",
      tiempo: fastScale?.time_flag ? "Sí" : "No",
    },

    tieneAlergia: allergyIntolerance ? allergyIntolerance.has_allergies : "",
    alimentos: allergyIntolerance?.food_allergies ?? "",
    otrosAlergias: allergyIntolerance?.other_allergies ?? "",
    dolEva: triage.pain_scale_eva ?? null,
    prioridad:
      triage.triage_level != null
        ? TRIAGE_LEVEL_MAP_REVERSE[triage.triage_level]
        : null,
  };
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
  // null = sin seleccionar; true = Trauma Shock; false = No es posible tomar signos vitales
  traumaShock: boolean | null;
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
  traumaShock: null,
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
  /** triage_id a precargar en modo "read" (GET /triage/:id/full). Sin esto, "read" no dispara ningún fetch. */
  triageId?: number | string;
}

// ─── Componente principal ─────────────────────────────────────────────────────

export function Triage({
  open,
  onClose,
  onGuardar,
  mode = "write",
  triageId,
}: TriajeModalProps) {
 



  

  const readOnly = mode === "read";
  const [form, setForm] = useState<TriajeForm>(INITIAL_FORM);
  const [buscandoPaciente, setBuscandoPaciente] = useState(false);
  const [pacienteNoEncontrado, setPacienteNoEncontrado] = useState(false);
  const [modalPacienteNoEncontrado, setModalPacienteNoEncontrado] =
    useState(false);

  const [disableNombres, setDisableNombres] = useState(true);
  const [disableApellidoPaterno, setDisableApellidoPaterno] = useState(true);
  const [disableApellidoMaterno, setDisableApellidoMaterno] = useState(true);
  const [disableFechaNacimiento, setDisableFechaNacimiento] = useState(true);
  const [disableSexo, setDisableSexo] = useState(true);

  /* Control de permisos */
  const canDatosPacienteTriage = usePermiso(
    PERMISOS_EMERGENCY.triage.campos.datosPaciente,
  );
  const canDatosClinicosTriage = usePermiso(
    PERMISOS_EMERGENCY.triage.campos.datosClinicos,
  );
  const canSignosVitalesTriage = usePermiso(
    PERMISOS_EMERGENCY.triage.campos.signosVitales,
  );
  const canAlergiasTriage = usePermiso(
    PERMISOS_EMERGENCY.triage.campos.alergias,
  );
  const canEvaTriage = usePermiso(PERMISOS_EMERGENCY.triage.campos.eva);
  const canClasificacionTriage = usePermiso(
    PERMISOS_EMERGENCY.triage.campos.clasificacion,
  );

  const [enabledPacienteTriage, setEnabledPacienteTriage] = useState(true);
  const [enabledDatosClinicosTriage, setEnabledDatosClinicosTriage] =
    useState(true);
  const [enabledSignosVitalesTriage, setEnabledSignosVitalesTriage] =
    useState(true);
  const [enabledAlergiasTriage, setEnabledAlergiasTriage] = useState(true);
  const [enabledEvaTriage, setEnabledEvaTriage] = useState(true);
  const [enabledClasificacionTriage, setEnabledClasificacionTriage] =
    useState(true);

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
  const [confirmCloseOpen, setConfirmCloseOpen] = useState(false);

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
    fetchCatalogCieById,
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
  const { createTriage, loading: guardandoTriaje } = useTriage();
  //Precarga del triaje completo (modo lectura)
  const { fetchTriageFull, loading: loadingTriageFull } = useTriageFull();
  // Overlay unificado: cualquier llamada en curso del formulario (catálogos, búsqueda de
  // paciente, guardado) bloquea la pantalla con el mismo spinner de marca.
  const formBusy =
    guardandoTriaje ||
    buscandoPaciente ||
    loadingTriageFull ||
    loadingCatalogCie ||
    loadingCodeSystemValues ||
    loadingCatalogActivePrinciples ||
    loadingIdentifierTypes ||
    loadingTimeUnits ||
    loadingAgeGroups;
  //Usuario y sede activa (federados desde mf-shell)
  const { user, sedeActual } = useUser();

  const { t, i18n } = useTranslation("triage");

  const localeLabelKey =
    i18n.resolvedLanguage === "en"
      ? "display_en"
      : i18n.resolvedLanguage === "pt"
        ? "display_pt"
        : "display_es";


  useEffect(() => {
    registerTriageNamespace();
  }, []);


  const SEARCH_MODES_MOTIVO: { value: string; label: string }[] = [
    { value: "cie_description", label: t('triage.searchModes.motive.name') },
    { value: "cie_code", label: "CIE-10" },
  ];

  const SEARCH_MODES_T_ENFERMEDAD: { value: string; label: string }[] = [
    { value: "minutos", label: t('triage.searchModes.time.minutes') },
    { value: "horas", label: t('triage.searchModes.time.hours') },
    { value: "dias", label: t('triage.searchModes.time.days') },
  ];

  const opcionesRadio = [
    { value: "S", label: t("triage.generic.yes") },
    { value: "N", label: t("triage.generic.no") },
  ];
  const opcionesRadioAlergia = [
    { value: "S", label: t("triage.generic.yes") },
    { value: "N", label: t("triage.allergies.rejects") },
  ];
  const opcionesRadioSignosVitales = [
    { value: true, label: t("triage.vitalSigns.traumaShock") },
    { value: false, label: t("triage.vitalSigns.notPossible") },
  ];

  const [loadingSearchMotivo, setLoadingSearchMotivo] = useState(false);

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
              .map((g) => ({ value: g.code, label: String(g[localeLabelKey as keyof typeof g] ?? g.display_es) })),
          );
        }

        if (ageGroups && Array.isArray(ageGroups)) {
          setAgeGroupOptions(
            ageGroups
              .filter((g) => g.is_active)
              .sort((a, b) => a.sort_order - b.sort_order)
              .map((g) => ({ value: g.code, label: String(g[localeLabelKey as keyof typeof g] ?? g.display_es) })),
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
              .map((t) => ({ value: t.code, label: String(t[localeLabelKey as keyof typeof t] ?? t.display_es) })),
          );
        } else {
          setLoadError(t("errors.catalog.loadIdentifierTypes"));
        }

        if (timeUnits && Array.isArray(timeUnits)) {
          const nuevasOpcionesTimeUnits = [...timeUnits]
            .filter((u) => u.is_active)
            .sort((a, b) => a.display_order - b.display_order);
          setTimeUnitOptions(nuevasOpcionesTimeUnits);
        }
      } catch (err) {
        console.error("Error al cargar información", err);
        setLoadError(t("errors.catalog.loadCatalogs"));
      }
    };

    loadData();
  }, []);

  // Modo lectura (botón Prioridad en grilla): precarga el triaje vinculado.
  useEffect(() => {
    if (!open || !readOnly || !triageId) return;

    let cancelled = false;
    fetchTriageFull(triageId).then(async (full) => {
      if (cancelled) return;
      if (!full) {
        setLoadError(t("errors.loadData.title"));
        return;
      }
      if (full.triage) {
        setEnabledPacienteTriage(false);
        setEnabledDatosClinicosTriage(false);
        setEnabledSignosVitalesTriage(false);
        setEnabledAlergiasTriage(false);
        setEnabledEvaTriage(false);
        setEnabledClasificacionTriage(false);
        setValuePrincipioActivo(
          full.allergySubstances.map((i) => String(i.active_principle_id)),
        );
        full.triage.cie_description = await handleSearchMotivoById(
          full.triage.cie_id!,
        );
      }

      setForm((f) => ({ ...f, ...mapTriageFullToForm(full) }));
    });

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, readOnly, triageId]);

  const RANGOS_NORMALES = {
    frCardiaca: { min: 60, max: 100 },
    frRespiratoria: { min: 12, max: 20 },
    saturacionO2: { min: 95, max: 100 },
    pSistolica: { min: 100, max: 139 },
    temperatura: { min: 36, max: 37.4 },
  };

  useEffect(() => {
    const estaAlterado = (
      valor: string | undefined,
      limites: { min: number; max: number },
    ) => {
      if (!valor) return false;
      const numero = Number(valor);
      return numero < limites.min || numero > limites.max;
    };
    const fcAlterada = estaAlterado(
      form.frCardiaca,
      RANGOS_NORMALES.frCardiaca,
    );
    const frAlterada = estaAlterado(
      form.frRespiratoria,
      RANGOS_NORMALES.frRespiratoria,
    );
    const satAlterada = estaAlterado(
      form.saturacionO2,
      RANGOS_NORMALES.saturacionO2,
    );
    const psAlterada = estaAlterado(
      form.pSistolica,
      RANGOS_NORMALES.pSistolica,
    );
    const tempAlterada = estaAlterado(
      form.temperatura,
      RANGOS_NORMALES.temperatura,
    );

    if (fcAlterada || frAlterada || satAlterada || psAlterada || tempAlterada) {
      form.prioridad = "II";
    } else {
      form.prioridad = null;
    }
  }, [
    form.frCardiaca,
    form.frRespiratoria,
    form.saturacionO2,
    form.pSistolica,
    form.temperatura,
  ]);

  // Buscar paciente por documento
  async function handleBuscarPaciente() {
    if (!form.numeroDoc || !form.tipoDoc) return;
    setPacienteNoEncontrado(false);
    setBuscandoPaciente(true);
    setDisableNombres(true);
    setDisableApellidoPaterno(true);
    setDisableApellidoMaterno(true);
    setDisableFechaNacimiento(true);
    setDisableSexo(true);
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
      setModalPacienteNoEncontrado(true);
      setDisableNombres(false);
      setDisableApellidoPaterno(false);
      setDisableApellidoMaterno(false);
      setDisableFechaNacimiento(false);
      setDisableSexo(false);
      setForm((f) => ({
        ...f,
        nombres: "",
        apellidoPaterno: "",
        apellidoMaterno: "",
        fechaNacimiento: "",
        sexo: "",
      }));
    }
    setBuscandoPaciente(false);
  }

  //Buscar motivo de ingreso por Id ( para modo lectura)
  async function handleSearchMotivoById(id: number) {
    setLoadingSearchMotivo(true);
    try {
      const results = await fetchCatalogCieById(id);
      if (results) {
        set("motivoQuery", results.cie_description);
        return results.cie_description;
      }
    } catch (err) {
      set("motivoQuery", "");
    } finally {
      setLoadingSearchMotivo(false);
    }
  }
  // Buscar motivo de ingreso
  async function handleSearchMotivo(query: string, mode: SearchMode) {
    setLoadingSearchMotivo(true);
    if (query.trim().length < 3) {
      setLoadingSearchMotivo(false);
      setMotivoOpts([]);
      return;
    }
    try {
      const results = await fetchCatalogCie(query, mode);
      setMotivoOpts(
        results
          ? results.map((d) => ({
              value: d.cie_id,
              label: d.cie_description,
              secondary: d.cie_code,
            }))
          : [],
      );
    } catch (err) {
      setMotivoOpts([]);
    } finally {
      setLoadingSearchMotivo(false);
    }
  }

  async function handleGuardar() {
    if (readOnly) return;

    if (form.noIdentificado) {
      if (!form.sexo || !form.grupoEtario) {
        setSaveError(t("errors.validation.unknownPatientMissingFields"));
        return;
      }
    } else if (!patientId) {
      setSaveError(t("errors.validation.mustSearchPatientBeforeSave"));
      return;
    }
    if (!form.motivoSelected || !form.prioridad) {
      setSaveError(t("errors.validation.requiredReasonAndClassification"));
      return;
    }
    if (!sedeActual) {
      setSaveError(t("errors.validation.missingActiveBranch"));
      return;
    }

     

    const username = user?.username ?? "";
    // El valor real que valida el backend (illness_duration_unit) es exactamente
    // time_unit_name del catálogo — no se traduce ni se hardcodea en el frontend.
    const illnessDurationUnit = timeUnitOptions.find(
      (u) => u.time_unit_name === form.tiempoUnidad,
    )?.time_unit_name;

    const payload: TriageFormRequest = {
      triage: {
        // NN: patient_id se omite — el orquestador lo resuelve vía unidentified_patient
        ...(form.noIdentificado ? {} : { patient_id: patientId }),
        location_id: Number(sedeActual.id),
        triage_level: TRIAGE_LEVEL_MAP[form.prioridad],
        pain_scale_eva: form.dolEva ?? undefined,
        cie_id: Number(form.motivoSelected.value),
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
        weight_kg: form.peso ? Number(form.peso) : undefined,
        height_cm: form.talla ? Number(form.talla) : undefined,
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
        // El radio es mutuamente excluyente y admite "sin elegir" (null): solo se envía
        // el flag de la opción efectivamente marcada, nunca ambos ni un false implícito.
        trauma_shock_flag: form.traumaShock === true ? true : undefined,
        impossible_capture_flag: form.traumaShock === false ? true : undefined,
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
      setSaveError(t(error));
      return;
    }

    onGuardar?.(form);
    handleClose();
  }

  function handleClose() {
    setForm(INITIAL_FORM);
    setPacienteNoEncontrado(false);
    setModalPacienteNoEncontrado(false);
    setSaveError(null);
    setLoadError(null);
    setConfirmCloseOpen(false);
    setPatientId(null);
    setValuePrincipioActivo([]);
    onClose();
  }

  /** Botón Cancelar / X del form: en modo lectura no hay nada que perder, cierra directo.
   * En modo escritura, confirma antes de descartar lo escrito (HceModal "confirmCloseOpen"). */
  function handleRequestClose() {
    if (readOnly) {
      handleClose();
      return;
    }
    setConfirmCloseOpen(true);
  }
    

  return (
    <Box>
      <LoadingOverlay
        open={formBusy}
        message={guardandoTriaje ? t("actions.saving") : t("actions.charge")}
      />
      <HceModal
        maxWidth={460}
        open={modalPacienteNoEncontrado}
        title={t("errors.patientNotFound.title")}
        description={t("errors.patientNotFound.description")}
        icon={<UiWarningIcon />}
        confirmButton={{
          label: t("actions.confirm"),
          onClick: () => setModalPacienteNoEncontrado(false),
        }}
      />
      <HceModal
        maxWidth={460}
        open={!!loadError}
        title={t("errors.loadData.title")}
        description={loadError ?? ""}
        icon={<UiWarningIcon />}
        confirmButton={{
          // Sin datos cargados no queda un formulario válido detrás: al confirmar se
          // cierra todo el modal en vez de dejar el form de lectura vacío/roto abierto.
          label: t("actions.confirm"),
          onClick: handleClose,
        }}
      />
      <HceModal
        maxWidth={460}
        open={!!saveError}
        title={t("errors.save.title")}
        description={saveError ?? ""}
        icon={<UiWarningIcon />}
        confirmButton={{
          label: t("actions.confirm"),
          onClick: () => setSaveError(null),
        }}
      />
      <HceModal
        maxWidth={460}
        open={confirmCloseOpen}
        title={t("actions.close.title")}
        description={t("actions.close.description")}
        icon={<UiWarningIcon />}
        confirmButton={{
          label: t("actions.confirm"),
          onClick: () => {
            setConfirmCloseOpen(false);
            handleClose();
          },
        }}
        cancelButton={{
          label: t("actions.cancel.editable"),
          onClick: () => setConfirmCloseOpen(false),
        }}
      />
      <HceFormModal
        // Con loadError seteado no hay datos válidos que mostrar: se oculta el form
        // completo y queda únicamente la alerta de error visible.
        open={open && !loadError}
        title={readOnly ? t("triage.readonly") : t("triage.title")}
        onClose={handleRequestClose}
        closeOnBackdrop={false}
        maxWidth={1050}
        primaryButton={
          readOnly
            ? undefined
            : {
                label: t("actions.save"),
                onClick: handleGuardar,
                color: "var(--ds-color-interactive-button , #0043a5)",
                icon: <UiDisketteIcon size={16} color="#ffffff" />,
                disabled:
                  guardandoTriaje ||
                  (form.noIdentificado
                    ? !form.sexo || !form.grupoEtario
                    : !patientId) ||
                  (pacienteNoEncontrado && !patientId),
                loading: guardandoTriaje,
              }
        }
        secondaryButton={{
          label: readOnly ? t("actions.cancel.readonly") : t("actions.cancel.editable"),
          onClick: handleRequestClose,
          color: "var(--ds-color-interactive, #0043a5)",
          icon: <CloseIcon size={16} color={"var(--ds-color-interactive, #0043a5)"} />,
        }}
        buttonAlign="center"
        buttonsFullWidth
      >
        <Box sx={{ display: "flex", flexDirection: "column", gap: "2.5rem" }}>
          {/* ── Sección 1: Datos del paciente ─────────────────────────────── */}
          <Box>
            <Typography
              sx={{
                fontFamily: hceTypography.fontFamily,
                fontWeight: 700,
                fontSize: "0.95rem",
                color: "var(--ds-color-interactive, #0043a5)",
                mb: 1.5,
              }}
            >
              {t("triage.pacientInfo.title")}
            </Typography>

            {/* Búsqueda por documento */}
            <Box
              sx={{
                display: "flex",
                alignItems: "flex-end",
                gap: "1rem",
                px: 6,
                py: 2.5,
                backgroundColor: "var(--ds-color-secondary-light , #0043a5)",
                borderRadius: "10px",
                border: `1.5px solid ${"var(--ds-color-secondary, #0043a5)"}`,
                mb: 2,
                flexWrap: "wrap",
              }}
            >
              <Box>
                <SelectField
                  label={t("triage.pacientInfo.firstBox.documentType.title")}
                  value={form.tipoDoc}
                  onChange={(v) => set("tipoDoc", v)}
                  options={tipoDocOptions}
                  placeholder={t("triage.pacientInfo.firstBox.documentType.placeholder")}
                  disabled={
                    form.noIdentificado ||
                    !canDatosPacienteTriage ||
                    !enabledPacienteTriage
                  }
                />
              </Box>
              <Box sx={{ flex: 1, minWidth: 140 }}>
                <TextInput
                  label={t("triage.pacientInfo.firstBox.documentNumber.title")}
                  value={form.numeroDoc}
                  onChange={(v) => set("numeroDoc", v)}
                  placeholder={t("triage.pacientInfo.firstBox.documentNumber.placeholder")}
                  disabled={
                    form.noIdentificado ||
                    !canDatosPacienteTriage ||
                    !enabledPacienteTriage
                  }
                />
              </Box>
              {/* Botón buscar  */}
              <IconButton
                sx={{
                  background: "var(--ds-color-interactive-button , #0043a5)",
                  borderRadius: "8px",
                  color: hceColors.neutro.white[50],
                }}
                icon={<UiSearchIcon />}
                onClick={handleBuscarPaciente}
                disabled={
                  form.noIdentificado ||
                  buscandoPaciente ||
                  !form.tipoDoc ||
                  !form.numeroDoc ||
                  !canDatosPacienteTriage ||
                  !enabledPacienteTriage
                }
              ></IconButton>

              <Box
                component="label"
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                  px: "12px",
                  py: "8px",
                  border: `1.5px solid ${"var(--ds-color-secondary, #0043a5)"}`,
                  borderRadius: "8px",
                  backgroundColor: "#ffffff",
                  cursor: "pointer",
                  flexShrink: 0,
                }}
              >
                <Checkbox
                  disabled={!canDatosPacienteTriage || !enabledPacienteTriage}
                  label={t("triage.pacientInfo.firstBox.noIdentifier")}
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
              <Grid
                container
                spacing={2}
                alignItems="flex-start"
                wrap="nowrap"
                sx={{ mt: "20px" }}
              >
                <Grid item xs={12} sm={6} md zeroMinWidth>
                  <FieldCol label={t("triage.pacientInfo.firstBox.documentLabel")}>
                    <TextInput value="NI" disabled onChange={() => {}} />
                  </FieldCol>
                </Grid>
                <Grid item xs={12} sm={6} md zeroMinWidth>
                  <FieldCol label={t("triage.pacientInfo.firstBox.documentNumber.title")}>
                    <TextInput value={t("triage.pacientInfo.firstBox.placeholderDocument")} disabled onChange={() => {}} />
                  </FieldCol>
                </Grid>
                <Grid item xs={12} sm={6} md zeroMinWidth>
                  <SelectField
                    label={t("triage.pacientInfo.secondBox.genderRequired")}
                    value={form.sexo}
                    onChange={(v) => set("sexo", v)}
                    options={genderOptions}
                    placeholder={t("triage.pacientInfo.secondBox.genderPlaceholder")}
                  />
                </Grid>
                <Grid item xs={12} sm={6} md zeroMinWidth>
                  <SelectField
                    label={t("triage.pacientInfo.secondBox.ageGroupRequired")}
                    value={form.grupoEtario}
                    onChange={(v) => set("grupoEtario", v)}
                    options={ageGroupOptions}
                    placeholder={t("triage.pacientInfo.secondBox.genderPlaceholder")}
                  />
                </Grid>
              </Grid>
            ) : (
              <Grid
                container
                spacing={2}
                alignItems="flex-start"
                wrap="nowrap"
                sx={{ mt: "20px" }}
              >
                <Grid item xs={12} sm={6} md zeroMinWidth>
                  <TextInput
                    label={t("triage.pacientInfo.secondBox.firstName.title")}
                    value={form.nombres}
                    onChange={(v) => set("nombres", v)}
                    placeholder={t("triage.pacientInfo.secondBox.firstName.placeholder")}
                    disabled={disableNombres}
                  />
                </Grid>
                <Grid item xs={12} sm={6} md zeroMinWidth>
                  <TextInput
                    label={t("triage.pacientInfo.secondBox.lastName.title")}
                    value={form.apellidoPaterno}
                    onChange={(v) => set("apellidoPaterno", v)}
                    placeholder={t("triage.pacientInfo.secondBox.lastName.placeholder")}
                    disabled={disableApellidoPaterno}
                  />
                </Grid>
                <Grid item xs={12} sm={6} md zeroMinWidth>
                  <TextInput
                    label={t("triage.pacientInfo.secondBox.secondLastName.title")}
                    value={form.apellidoMaterno}
                    onChange={(v) => set("apellidoMaterno", v)}
                    placeholder={t("triage.pacientInfo.secondBox.secondLastName.placeholder")}
                    disabled={disableApellidoMaterno}
                  />
                </Grid>
                <Grid item xs={12} sm={6} md zeroMinWidth>
                  {pacienteNoEncontrado ? (
                    <TextInput
                      label={t("triage.pacientInfo.secondBox.birthDate.title")}
                      value={form.fechaNacimiento}
                      onChange={(v) => set("fechaNacimiento", v)}
                      placeholder={t("triage.pacientInfo.secondBox.birthDate.placeholder")}
                      disabled={disableFechaNacimiento}
                    />
                  ) : (
                    <DatePicker
                      label={t("triage.pacientInfo.secondBox.birthDate.title")}
                      value={form.fechaNacimiento}
                      onChange={(v) => set("fechaNacimiento", v)}
                      disabled={disableFechaNacimiento}
                    />
                  )}
                </Grid>
                {/* md:6 (antes 4) — "-Seleccionar opción-" y "Desconocido" no entraban
                    cómodos en 4/24; se le sacó 1 columna a cada apellido (5→4) en vez de
                    achicar la tipografía del SelectField (rompería consistencia con el
                    resto del form). */}
                <Grid item xs={12} sm={6} md zeroMinWidth>
                  <SelectField
                    label={t("triage.pacientInfo.secondBox.gender.title")}
                    value={form.sexo}
                    onChange={(v) => set("sexo", v)}
                    options={genderOptions}
                    placeholder={t("triage.pacientInfo.secondBox.gender.placeholder")}
                    disabled={disableSexo}
                  />
                </Grid>
              </Grid>
            )}
          </Box>

          {/* ── Sección 2: Datos clínicos (colapsable) ────────────────────── */}
          <Box>
            <SectionHeader
              title={t("triage.clinicInfo.title")}
              expanded={expDatosClinicos}
              onToggle={() => setExpDatosClinicos((e) => !e)}
            />
            {expDatosClinicos && (
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 2,
                  mt: "20px",
                }}
              >
                {/* Motivo de ingreso con SearchComboInput */}
                <SearchComboInput
                  modes={SEARCH_MODES_MOTIVO}
                  loading={loadingSearchMotivo}
                  label={t("triage.clinicInfo.reasonOfAdmission.label")}
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
                  disabled={
                    !canDatosClinicosTriage || !enabledDatosClinicosTriage
                  }
                  placeholder={t("triage.clinicInfo.reasonOfAdmission.placeholder")}
                />

                {/* Aislamiento + Gestante + FUR + Tiempo de enfermedad.
                    columns={24} + size={{xs,sm,md}}, mismo patrón responsivo que "Signos
                    Vitales" — antes usaba size={3} fijo (sin breakpoints), así que no
                    reordenaba en pantallas chicas y las celdas se aplastaban en vez de
                    apilarse/ajustarse como el resto de los campos del form.
                    Columnas desparejas a propósito: FUR tiene Toggle + DatePicker (dos
                    controles) y necesita más ancho que un RadioGroup simple "Sí/No" —
                    con las 4 celdas iguales (6/6/6/6) el DatePicker quedaba pegado al
                    borde de su celda, muy cerca de "Tiempo de enfermedad". */}
                <Grid
                  container
                  spacing={2}
                  alignItems="flex-end"
                  wrap="nowrap"
                  sx={{ mt: "20px" }}
                >
                  <Grid item xs={12} sm={6} md={2} zeroMinWidth>
                    <Box sx={{ width: "100%" }}>
                      <RadioGroup
                        legend={t("triage.clinicInfo.isolation")}
                        value={form.aislamiento}
                        options={opcionesRadio}
                        onChange={(v) => set("aislamiento", v)}
                        disabled={
                          !canDatosClinicosTriage || !enabledDatosClinicosTriage
                        }
                      />
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={6} md={2} zeroMinWidth>
                    <Box sx={{ width: "100%" }}>
                      <RadioGroup
                        legend={t("triage.clinicInfo.pregnant")}
                        value={form.gestante}
                        options={opcionesRadio}
                        onChange={(v) => set("gestante", v)}
                        disabled={
                          form.sexo === "male" ||
                          !canDatosClinicosTriage ||
                          !enabledDatosClinicosTriage
                        }
                      />
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={6} md={5} zeroMinWidth>
                    {/* minWidth:0 (no un valor fijo como 220) — un mínimo fijo mayor al ancho
                    real de la celda del Grid en ciertos breakpoints la desbordaba, tapando
                    "T. de enfermedad". El Toggle mantiene su ancho fijo y el FieldCol con
                    flex:1 1 0 ya se encarga de que el DatePicker ocupe el espacio restante
                    real de la celda, sin forzar un piso que no siempre entra. */}
                    <Grid
                      container
                      spacing={2}
                      alignItems="center"
                      wrap="nowrap"
                    >
                      <Grid item xs={12} sm={4} md={4} zeroMinWidth>
                        <Box
                          sx={{
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                          }}
                        >
                          <Toggle
                            checked={form.furEnabled}
                            disabled={
                              form.sexo === "male" ||
                              !canDatosClinicosTriage ||
                              !enabledDatosClinicosTriage
                            }
                            onChange={(v) => {
                              set("furEnabled", v);
                              if (!v) set("fur", "");
                            }}
                          />
                        </Box>
                      </Grid>
                      <Grid item xs={12} sm={8} md={8} zeroMinWidth>
                        <FieldCol minWidth={10}>
                          <DatePicker
                            label={t("triage.clinicInfo.fur.label")}
                            value={form.fur}
                            onChange={(v) => set("fur", v)}
                            disabled={
                              !form.furEnabled ||
                              form.sexo === "male" ||
                              !canDatosClinicosTriage ||
                              !enabledDatosClinicosTriage
                            }
                          />
                        </FieldCol>
                      </Grid>
                    </Grid>
                  </Grid>
                  <Grid item xs={12} sm={6} md={3} zeroMinWidth>
                    <Box sx={{ width: "100%", minWidth: 0 }}>
                      <FieldCol>
                        <Box sx={{ display: "flex", width: "100%" }}>
                          <SearchComboInput
                            modes={SEARCH_MODES_T_ENFERMEDAD}
                            label={t("triage.clinicInfo.timeOfIllness.label")}
                            onSearchModeChange={(m) => {
                              set("tiempoUnidad", m);
                            }}
                            value={form.tiempoEnfermedad}
                            searchMode={form.tiempoUnidad}
                            onChange={(v) => set("tiempoEnfermedad", v)}
                            onSelect={(opt) => {
                              set("tiempoUnidad", opt.value.toString());
                            }}
                            disabled={
                              !canDatosClinicosTriage ||
                              !enabledDatosClinicosTriage
                            }
                            modePosition="right"
                            placeholder={t("triage.clinicInfo.timeOfIllness.placeholder")}
                          />
                        </Box>
                      </FieldCol>
                    </Box>
                  </Grid>
                </Grid>
                <Box sx={{ mt: "24px" }}>
                  <TextareaField
                    label={t("triage.clinicInfo.comments.label")}
                    value={form.comentarios}
                    onChange={(v) => set("comentarios", v)}
                    maxLength={100}
                    placeholder={t("triage.clinicInfo.comments.placeholder")}
                    disabled={
                      !canDatosClinicosTriage || !enabledDatosClinicosTriage
                    }
                  />
                </Box>
              </Box>
            )}
          </Box>

          {/* ── Sección 3: Signos vitales (colapsable) ────────────────────── */}
          <Box>
            <SectionHeader
              title={t("triage.vitalSigns.title")}
              expanded={expSignosVitales}
              onToggle={() => setExpSignosVitales((e) => !e)}
            />
            {expSignosVitales && (
              <Box>
                <Grid
                  container
                  spacing={2}
                  alignItems="flex-end"
                  wrap="nowrap"
                  sx={{ mt: "20px" }}
                >
                  <Grid item xs={12} sm={6} md={6} zeroMinWidth>
                    <RadioGroup
                      value={form.traumaShock}
                      options={opcionesRadioSignosVitales}
                      onChange={(v) => {
                        set("traumaShock", v);
                      }}
                      disabled={
                        !canSignosVitalesTriage || !enabledSignosVitalesTriage
                      }
                    />
                  </Grid>
                  <Grid item xs={12} sm={3} md={2} zeroMinWidth>
                    <NumericField
                      label={t("triage.vitalSigns.weight.label")}
                      value={form.peso}
                      onChange={(v) => set("peso", v)}
                      suffix={t("triage.vitalSigns.weight.suffix")}
                      numberType="decimal"
                      disabled={
                        !canSignosVitalesTriage || !enabledSignosVitalesTriage
                      }
                    />
                  </Grid>
                  <Grid item xs={12} sm={3} md={2} zeroMinWidth>
                    <NumericField
                      label={t("triage.vitalSigns.height.label")}
                      value={form.talla}
                      onChange={(v) => set("talla", v)}
                      suffix={t("triage.vitalSigns.height.suffix")}
                      numberType="natural"
                      disabled={
                        !canSignosVitalesTriage || !enabledSignosVitalesTriage
                      }
                    />
                  </Grid>
                  <Grid item xs={12} sm={3} md={2} zeroMinWidth>
                    <NumericField
                      label={t("triage.vitalSigns.bmi.label")}
                      value={imc}
                      suffix={t("triage.vitalSigns.bmi.suffix")}
                      readOnly
                      disabled={
                        !canSignosVitalesTriage || !enabledSignosVitalesTriage
                      }
                    />
                  </Grid>
                </Grid>
                {/* Fila 2: Signos */}
                <Grid
                  container
                  spacing={2}
                  alignItems="flex-end"
                  wrap="nowrap"
                  sx={{ mt: "20px" }}
                >
                  {[
                    {
                      key: "frCardiaca",
                      label: t("triage.vitalSigns.heartRate.label"),
                      suffix: t("triage.vitalSigns.heartRate.suffix"),
                      numberType: "natural" as const,
                    },
                    {
                      key: "frRespiratoria",
                      label: t("triage.vitalSigns.respiratoryRate.label"),
                      suffix: t("triage.vitalSigns.respiratoryRate.suffix"),
                      numberType: "natural" as const,
                    },
                    {
                      key: "pSistolica",
                      label: t("triage.vitalSigns.systolic.label"),
                      suffix: t("triage.vitalSigns.systolic.suffix"),
                      numberType: "natural" as const,
                    },
                    {
                      key: "pDiastolica",
                      label: t("triage.vitalSigns.diastolic.label"),
                      suffix: t("triage.vitalSigns.diastolic.suffix"),
                      numberType: "natural" as const,
                    },
                    {
                      key: "temperatura",
                      label: t("triage.vitalSigns.temperature.label"),
                      suffix: t("triage.vitalSigns.temperature.suffix"),
                      numberType: "decimal" as const,
                    },
                    {
                      key: "saturacionO2",
                      label: t("triage.vitalSigns.oxygenSaturation.label"),
                      suffix: t("triage.vitalSigns.oxygenSaturation.suffix"),
                      numberType: "natural" as const,
                    },
                  ].map((f) => (
                    <Grid key={f.key} item xs={12} sm={3} md={2} zeroMinWidth>
                      <NumericField
                        label={f.label}
                        value={form[f.key as keyof TriajeForm] as string}
                        numberType={f.numberType}
                        onChange={(v) => {
                          set(f.key as keyof TriajeForm, v as any);
                        }}
                        suffix={f.suffix}
                        disabled={
                          !canSignosVitalesTriage || !enabledSignosVitalesTriage
                        }
                      />
                    </Grid>
                  ))}
                </Grid>

                {/* Escala de Glasgow + FAST */}

                {/* En pantalla normal (md+) van lado a lado como siempre; en pantallas
                    chicas se apilan en vez de aplastar los dos fieldsets uno junto al otro. */}
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: { xs: "column", md: "row" },
                    gap: 2,
                    mt: "20px",
                  }}
                >
                  {/* Glasgow */}
                  <Box
                    component="fieldset"
                    sx={{
                      flex: 1,
                      border: `1.5px solid ${"var(--ds-color-secondary, #0043a5)"}`,
                      borderRadius: "8px",
                      m: 0,
                      px: 1.5,
                      py: 1.5,
                    }}
                  >
                    <Box
                      component="legend"
                      sx={{
                        fontFamily: hceTypography.fontFamily,
                        fontSize: "0.75rem",
                        fontWeight: 700,
                        color: "var(--ds-color-interactive, #0043a5)",
                      }}
                    >
                      {t("triage.vitalSigns.glasgow.title")}
                    </Box>
                    <Grid
                      container
                      spacing={2}
                      alignItems="flex-end"
                      wrap="nowrap"
                    >
                      {(["ocular", "verbal", "motora"] as const).map((key) => (
                        <Grid key={key} item xs={12} sm={3} md={3} zeroMinWidth>
                          <SelectField
                            disabled={
                              !canSignosVitalesTriage ||
                              !enabledSignosVitalesTriage
                            }
                            label={
                              {
                                ocular: t("triage.vitalSigns.glasgow.ocular"),
                                verbal: t("triage.vitalSigns.glasgow.verbal"),
                                motora: t("triage.vitalSigns.glasgow.motor"),
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
                      <Grid item xs={12} sm={3} md={3} zeroMinWidth>
                        <NumericField
                          label={t("triage.vitalSigns.glasgow.result.label")}
                          value={String(glasgowTotal)}
                          suffix={t("triage.vitalSigns.glasgow.result.suffix")}
                          readOnly
                          disabled={
                            !canSignosVitalesTriage ||
                            !enabledSignosVitalesTriage
                          }
                        />
                      </Grid>
                    </Grid>
                  </Box>

                  {/* FAST */}
                  <Box
                    component="fieldset"
                    sx={{
                      flex: 1,
                      border: `1.5px solid ${"var(--ds-color-secondary, #0043a5)"}`,
                      borderRadius: "8px",
                      m: 0,
                      px: 1.5,
                      py: 1.5,
                    }}
                  >
                    <Box
                      component="legend"
                      sx={{
                        px: 1,
                        fontFamily: hceTypography.fontFamily,
                        fontSize: "0.75rem",
                        fontWeight: 700,
                        color: "var(--ds-color-interactive, #0043a5)",
                      }}
                    >
                      {t("triage.vitalSigns.fast.title")}
                    </Box>
                    <Grid
                      container
                      spacing={2}
                      alignItems="flex-end"
                      wrap="nowrap"
                    >
                      {(["cara", "brazos", "habla", "tiempo"] as const).map(
                        (key) => (
                          <Grid
                            key={key}
                            item
                            xs={12}
                            sm={3}
                            md={3}
                            zeroMinWidth
                          >
                            <SelectField
                              disabled={
                                !canSignosVitalesTriage ||
                                !enabledSignosVitalesTriage
                              }
                              label={
                                {
                                  cara: t("triage.vitalSigns.fast.face"),
                                  brazos: t("triage.vitalSigns.fast.arms"),
                                  habla: t("triage.vitalSigns.fast.speech"),
                                  tiempo: t("triage.vitalSigns.fast.time"),
                                }[key]
                              }
                              value={form.fast[key]}
                              onChange={(v) =>
                                set("fast", { ...form.fast, [key]: v })
                              }
                              options={[
                                { value: t("triage.vitalSigns.fast.no"), label: t("triage.vitalSigns.fast.no") },
                                { value: t("triage.vitalSigns.fast.yes"), label: t("triage.vitalSigns.fast.yes") },
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
              title={t("triage.allergies.title")}
              expanded={expAlergias}
              onToggle={() => setExpAlergias((e) => !e)}
            />
            {expAlergias && (
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 2,
                  mt: "20px",
                }}
              >
                <Grid container spacing={2} alignItems="flex-end" wrap="nowrap">
                  <Grid item xs={12} sm={4} md={4} zeroMinWidth>
                    <RadioGroup
                      disabled={!canAlergiasTriage || !enabledAlergiasTriage}
                      value={form.tieneAlergia}
                      options={opcionesRadioAlergia}
                      onChange={(v) => {
                        set("tieneAlergia", v);
                        if (v == "N") {
                          setValuePrincipioActivo([]);
                          set("alimentos", "");
                          set("otrosAlergias", "");
                        }
                      }}
                    />
                  </Grid>

                  <Grid item xs={12} sm={8} md={8} zeroMinWidth>
                    <MultiSelect
                      disabled={
                        !canAlergiasTriage ||
                        !enabledAlergiasTriage ||
                        form.tieneAlergia == "N"
                      }
                      options={optionsActivePrinciples}
                      label={t("triage.allergies.activePrinciple")}
                      value={valuePrincipioActivo}
                      onChange={setValuePrincipioActivo}
                    />
                  </Grid>
                </Grid>
                <Box sx={{ mt: "20px" }}>
                  <TextareaField
                    label={t("triage.allergies.foods.label")}
                    value={form.alimentos}
                    onChange={(v) => set("alimentos", v)}
                    maxLength={100}
                    placeholder={t("triage.allergies.foods.placeholder")}
                    disabled={
                      !canAlergiasTriage ||
                      !enabledAlergiasTriage ||
                      form.tieneAlergia == "N"
                    }
                  />
                </Box>
                <Box sx={{ mt: "20px" }}>
                  <TextareaField
                    label={t("triage.allergies.others.label")}
                    value={form.otrosAlergias}
                    onChange={(v) => set("otrosAlergias", v)}
                    maxLength={100}
                    placeholder={t("triage.allergies.others.placeholder")}
                    disabled={
                      !canAlergiasTriage ||
                      !enabledAlergiasTriage ||
                      form.tieneAlergia == "N"
                    }
                  />
                </Box>
              </Box>
            )}
          </Box>

          {/* ── Sección 5: Escala EVA (colapsable) ───────────────────────── */}
          <Box>
            <SectionHeader
              title={t("triage.painScale.title")}
              expanded={expEva}
              onToggle={() => setExpEva((e) => !e)}
            />
            {expEva && (
              <Box sx={{ mt: 2, px: 1 }}>
                <EvaScale
                  readOnly={!canEvaTriage || !enabledEvaTriage}
                  value={form.dolEva}
                  onChange={(v) => set("dolEva", v)}
                />
              </Box>
            )}
          </Box>

          {/* ── Sección 6: Clasificación de triaje (colapsable) ───────────── */}
          <Box>
            <SectionHeader
              title={t("triage.classification.title")}
              expanded={expTriaje}
              onToggle={() => setExpTriaje((e) => !e)}
            />
            {expTriaje && (
              <Box
                sx={{ mt: "20px", px: 1, display: "flex", justifyContent: "center" }}
              >
                <TriagePriorityDisplay
                  readOnly={
                    !canClasificacionTriage || !enabledClasificacionTriage
                  }
                  selected={form.prioridad}
                  label={t("triage.classification.boxlabel")}
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



