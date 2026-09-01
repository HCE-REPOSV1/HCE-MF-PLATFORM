import {
  ActionBar,
  AltaMedicaIcon,
  HceHistoryIcon,
  UiBloodTestIcon,
  UiDrugsIcon,
  UiMonitorIcon,
  UiPrescriptionIcon,
  UiPrintingIcon,
  ReferenceIcon,
  UiXRaysIcon,
  Box,
  type ExtraAction,
  Button,
  DisketteIcon,
  hceColors,
} from "@hce/design-system";
import { useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import type {
  ClinicalRecordPatient,
  NavigatedPatientState,
} from "./types/Patient.type";
import MedicalHistoryModal from "./components/MedicalHistoryModal";
import PatientInfoBar from "./components/PatientInfoBar";
import {
  ClinicalRecordFormProvider,
  useClinicalRecordForm,
} from "./context/ClinicalRecordFormContext";
import { ClinicalRecordTabs } from "./components/ClinicalRecordTabs";
import { mapToSavePayload } from "./mapper/medicalHistory.mapper";
import { usePatientRecord } from "./hooks/usePatientRecord";
import { useCatalog } from "./hooks/useCatalog";
import { useTranslation } from "@hce/i18n-core";
import { getLocalizedCatalogDisplay } from "./utils/catalogLocalization";



const CSI_GENDER = 3

export default function ClinicalRecordPage() {
  // registerClinicalRecordNamespace();
  // const { t } = useTranslation("clinical-record");

  // Igual que mf-emergency/pages/ClinicalRecordPage: el monitor navega con
  // navigate("historiacli", { state: { patient: row } }); react-router-dom
  // es dependencia compartida (singleton) en Module Federation, así que este
  // remote puede leer el mismo router state aunque lo renderice mf-emergency.
  const { state } = useLocation();
  const navigatedPatient = (state as { patient?: NavigatedPatientState } | null)
    ?.patient;
  const [encounterId] = useState<number | undefined>(
    () => navigatedPatient?.encounter_id ?? undefined,
  );


 const {  i18n } = useTranslation("clinical-record");
       const {
      fetchAgeGroups,
      fetchIdentifierTypes,
      fetchCodeSystemValues,
      dataCatalogCodeSystemValues: codeSystemValues,

    } = useCatalog();
    

  

  useEffect(() => {
    const loadData = async () => {
      try {
        const results = await Promise.all([
         
          fetchIdentifierTypes("patient"),
          fetchCodeSystemValues(CSI_GENDER),
          fetchAgeGroups(),
        ]);
        const [
          
          identifierTypes,
        
          genders,
          ageGroups,
        ] = results;

        if (genders && Array.isArray(genders)) {
          
            genders
              .filter((g) => g.is_active)
              .sort((a, b) => a.sort_order - b.sort_order)
              .map((g) => ({
                value: g.code,
                label: getLocalizedCatalogDisplay(g, i18n.resolvedLanguage),
              }))
        }

        if (ageGroups && Array.isArray(ageGroups)) {
        
            ageGroups
              .filter((g) => g.is_active)
              .sort((a, b) => a.sort_order - b.sort_order)
              .map((g) => ({
                value: g.code,
                label: getLocalizedCatalogDisplay(g, i18n.resolvedLanguage),
              }))
          
        }

       
        if (identifierTypes && Array.isArray(identifierTypes)) {
       
            identifierTypes
              .filter((t) => t.is_active)
              .sort((a, b) => a.sort_order - b.sort_order)
              .map((t) => ({
                value: t.code,
                label: getLocalizedCatalogDisplay(t, i18n.resolvedLanguage),
              }))
        }

      
      } catch (err) {
        console.error("Error al cargar información", err);
       // setLoadError(t("errors.catalog.loadCatalogs"));
      }
    };

    loadData();
  }, []);




  const {
    data: patientRecord,
    loading: patientRecordLoading,
    error: patientRecordError,
    refetch: refetchPatientRecord,
  } = usePatientRecord(encounterId);

  const patient = useMemo<ClinicalRecordPatient | null>(() => {
    if (!patientRecord) return null;

     const catalogGender = codeSystemValues?.find(
      ({ code, is_active }) =>
        is_active &&
        code.toLowerCase() === patientRecord.gender?.toLowerCase(),
    );

    const practitioner = patientRecord.attending_practitioner;

    return {
      patientId: String(patientRecord.patient_id),
      fullName: patientRecord.full_name,
      gender: getLocalizedCatalogDisplay(
        catalogGender,
        i18n.language,
        patientRecord.gender || "-",
      ),
      ageDisplay: patientRecord.age_display || "-",
      documentType: patientRecord.document_type || "-",
      documentNumber: patientRecord.document_number || "-",
      bloodType: patientRecord.blood_type || "-",
      specialty: getLocalizedCatalogDisplay(
        practitioner
          ? {
              display_es: practitioner.speciality_es,
              display_en: practitioner.speciality_en,
            }
          : null,
        i18n.language,
      ),
      doctorName: practitioner?.doctor_name ?? "-",
      attentionCode: patientRecord.attention_code ?? "-",
      clinicalHistoryNumber: patientRecord.clinical_history_number ?? "-",
      insuranceName: patientRecord.insurance ?? "-",
      insuranceProduct: "-",
      email: patientRecord.email ?? "-",
      phone: patientRecord.phone ?? "-",
      address: patientRecord.address ?? "-",
      hasAllergies: patientRecord.allergy?.declaration?.has_allergies === "S",
    };
  },  [patientRecord, codeSystemValues, i18n.resolvedLanguage]);

  // patient_id "real" para historial/alergias: preferir el que trae el propio
  // patient-summary una vez cargado; si aún no cargó, usar el que venga en el
  // router state (si el llamador ya lo conocía).
  const patientIdNumber = useMemo<number | undefined>(() => {
    const raw = patientRecord?.patient_id ?? navigatedPatient?.patient_id;
    if (raw === undefined || raw === null) return undefined;
    const parsed = typeof raw === "number" ? raw : Number(raw);
    return Number.isNaN(parsed) ? undefined : parsed;
  }, [patientRecord, navigatedPatient]);

  // Distingue "no se pudo determinar qué paciente mostrar" (sin encounter_id
  // en el router state — refresh del navegador, deep link directo, etc.) de
  // un paciente real sin datos que mostrar. Sin esto, PatientInfoBar y
  // MedicalHistoryModal caerían en el mismo camino visual vacío que un
  // paciente sin alergias/historial, lo cual es un riesgo de lectura clínica.
  const patientNotIdentified = encounterId === undefined;

  const LIST_ACTION_BAR: ExtraAction[] = [
    {
      id: "monitor",
      labelTooltip: "Monitor",
      icon: UiMonitorIcon,
      onClick: () => console.log("Abriendo monitor..."),
      disabled: false,
    },
    {
      id: "laboratorio",
      labelTooltip: "Laboratorio",
      icon: UiBloodTestIcon,
      onClick: () => console.log("Abriendo laboratorio..."),
      disabled: false,
    },
    {
      id: "imagenes",
      labelTooltip: "Imagenes",
      icon: UiXRaysIcon,
      onClick: () => console.log("Abriendo imagenes..."),
      disabled: false,
    },
    {
      id: "receta_alta",
      labelTooltip: "Receta de alta",
      icon: UiPrescriptionIcon,
      onClick: () => console.log("Abriendo receta de alta..."),
      disabled: false,
    },
    {
      id: "alta_medica",
      labelTooltip: "Alta medica",
      icon: AltaMedicaIcon,
      onClick: () => console.log("Abriendo alta medica..."),
      disabled: false,
    },
    {
      id: "imprimir_reporte",
      labelTooltip: "Imprimir reporte",
      icon: UiPrintingIcon,
      onClick: () => console.log("Abriendo imprimir reporte..."),
      disabled: false,
    },
    {
      id: "indicaciones_actuales",
      labelTooltip: "Indicaciones actuales",
      icon: UiDrugsIcon,
      onClick: () => console.log("Abriendo indicaciones actuales..."),
      disabled: false,
    },
    {
      id: "historial_atenciones",
      labelTooltip: "Historial de atenciones",
      icon: HceHistoryIcon,
      onClick: () => {
        setOpenMedicalHistory(true);
      },
      disabled: false,
    },
    {
      id: "referencia",
      labelTooltip: "Referencia",
      icon: ReferenceIcon,
      onClick: () => console.log("Abriendo referencia..."),
      disabled: false,
    },
  ];

  const [openMedicalHistory, setOpenMedicalHistory] = useState(false);

  function SaveButton() {
    const { getAllData } = useClinicalRecordForm();
    const [saveMessage, setSaveMessage] = useState<string | null>(null);

    const handleSave = () => {
      const rawData = getAllData();
      // TODO: enviar el payload mapeado al backend cuando el endpoint de
      // guardado esté disponible. No loguear el payload: contiene datos
      // clínicos del paciente (anamnesis, antecedentes, reconciliación).
      mapToSavePayload(rawData);
      // El guardado real todavía no está conectado a un endpoint — avisar
      // explícitamente en vez de dejar que el clic no tenga ningún efecto
      // visible (podría leerse como "ya se guardó").
      setSaveMessage("Guardado aún no disponible — función en desarrollo");
    };

    return (
      <Box sx={{ display: "flex", alignItems: "center", gap: "8px" }}>
        {saveMessage && (
          <Box sx={{ fontSize: "13px", color: hceColors.alert.warning[600] }}>
            {saveMessage}
          </Box>
        )}
        <Button
          startIcon={<DisketteIcon />}
          color={hceColors.primary.green[600]}
          onClick={handleSave}
        >
          Guardar
        </Button>
      </Box>
    );
  }

  return (
    <>
      <MedicalHistoryModal
        open={openMedicalHistory}
        onClose={() => setOpenMedicalHistory(false)}
        patientId={patientIdNumber}
        notIdentified={patientNotIdentified}
      />

      <Box sx={{ width: "100%" }}>
        <Box sx={{ width: "100%", p: 2 }}>
          <PatientInfoBar
            patient={patient}
            loading={patientRecordLoading}
            error={patientRecordError}
            notIdentified={patientNotIdentified}
            encounterId={encounterId}
            onAllergySaved={refetchPatientRecord}
          />
        </Box>

        <ClinicalRecordFormProvider>
          <Box
            sx={{
              display: "flex",
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "0px 16px"
            }}
          >
            <Box>
              <ActionBar
                orientation="horizontal"
                actions={LIST_ACTION_BAR}
                closeAction={true}
              />
            </Box>
            <Box>
              <SaveButton />
            </Box>
          </Box>
          <Box sx={{ padding: "16px" }}>
            <ClinicalRecordTabs encounterId={encounterId}/>
          </Box>
        </ClinicalRecordFormProvider>
      </Box>
    </>
  );
}
