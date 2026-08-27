
import {
  ActionBar,
  AltaMedicaIcon,
  Chip,
  DataCard,
  DataTable,
  hceColors,
  HceFormModal,
  HceHistoryIcon,
  InfoButton,
  StatusBadge,
  UiBloodTestIcon,
  UiDrugsIcon,
  UiMonitorIcon,
  UiPrescriptionIcon,
  UiPrintingIcon,
  ReferenceIcon,
  UiXRaysIcon,
  User,
  Box,
  Avatar,
  type ExtraAction,
} from "@hce/design-system";

import type { ClinicalRecordPatient } from "../types/clinical.record.types";
import { useEffect, useMemo, useState } from "react";
import { MedicalRecordPanel } from "../components/MedicalRecordPanel";
import { AllergyModal } from "../components/clinical-record/AllergyModal";
import { PatientField } from "../components/clinical-record/PatientField";
import { PatientDetailsModal } from "../components/clinical-record/PatientDetailsModal";
import { useLocation } from "react-router-dom";
import type { MonitorTableRow } from "../types/monitor.table.types";
import { usePatientRecord } from "../hooks/usePatientRecord";
import { useTranslation } from "@hce/i18n-core";
import { useCatalog } from "../hooks/useCatalog";
import { CSI_GENDER } from "../config/endpoints";
import { getLocalizedCatalogDisplay } from "../utils/catalogLocalization";


export default function ClinicalRecordPage() {
  const { state } = useLocation();
 const patient =
    (state as { patient?: MonitorTableRow } | null)?.patient;

  const [encounterId] = useState<number | undefined>(
    () => patient?.encounter_id ?? undefined,
  );


  const [allergyDetailsOpen, setAllergyDetailsOpen] =
    useState(false);

  const [patientDetailsOpen, setPatientDetailsOpen] =
    useState(false);

  const [openMedicalHistory, setOpenMedicalHistory] =
    useState(false);


  const {  i18n , t} = useTranslation("emergency");

    const {
      fetchAgeGroups,
      fetchIdentifierTypes,
      fetchCodeSystemValues,
      dataCatalogCodeSystemValue: genders,

    } = useCatalog();

 

 const {
    data: patientRecord,
    loading: patientRecordLoading,
    error: patientRecordError,
    refetch: refetchPatientRecord,
  
  } = usePatientRecord(encounterId);



  useEffect(() => {
    console.log("Paciente del monitor:", patient);
    console.log("Patient record:", patientRecord);
    console.log("Loading:", patientRecordLoading);
    console.log("Error:", patientRecordError);
  }, [
    patient,
    patientRecord,
    patientRecordLoading,
    patientRecordError,
  ]);


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


  const localizedPatientRecord = useMemo<ClinicalRecordPatient | null>(() => {
    if (!patientRecord) return null;

    const catalogGender = genders?.find(
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
        i18n.resolvedLanguage,
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
        i18n.resolvedLanguage,
      ),
      doctorName: practitioner?.doctor_name ?? "-",
      attentionCode: patientRecord.attention_code ?? "-",
      clinicalHistoryNumber: patientRecord.clinical_history_number ?? "-",
      insuranceName: patientRecord.insurance ?? "-",
      insuranceProduct: "-",
      email: patientRecord.email ?? "-",
      phone: patientRecord.phone ?? "-",
      address: patientRecord.address ?? "-",
      hasAllergies:
        patientRecord.allergy?.declaration?.has_allergies === "S",
    };
  }, [patientRecord, genders, i18n.resolvedLanguage]);

 
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


  function handleCloseMedicalHistory() {
    setOpenMedicalHistory(false);
  }

  const handleAllergySaved = async (
    
  ) => {
  
      await refetchPatientRecord();
    
  };

  const columnsMedicalHistory = [
    {
      field: "th",
      header: "Tipo de historia",
      render: (value: string) => <Chip label={value} />,
    },
    { field: "medico", header: "Medico" },
    { field: "especialidad", header: "Especialidad" },
    { field: "fecha", header: "Fecha" },
    { field: "cod_atencion", header: "C. de atención" },
    {
      field: "lugar",
      header: "Lugar",
      render: (value: string) => <Chip label={value} />,
    },
    { field: "ver", header: "Ver" },
  ];

  const rowsMedicalHistory = [
    {
      th: "Física",
      medico: "Tipo de historia",
      especialidad: "Ginecología",
      fecha: "01/12/2024 - 15:00",
      cod_atencion: "E00001",
      lugar: "Emergencia",
      ver: (
        <InfoButton
          tooltip="Ver detalle"
          onClick={() => console.log("open...")}
        />
      ),
    },
    {
      th: "Electrónica",
      medico: "Tipo de historia",
      especialidad: "Ginecología",
      fecha: "01/12/2024 - 15:00",
      cod_atencion: "E00001",
      lugar: "Emergencia",
      ver: (
        <InfoButton
          tooltip="Ver detalle"
          onClick={() => console.log("open...")}
        />
      ),
    },
    {
      th: "Electrónica",
      medico: "Tipo de historia",
      especialidad: "Ginecología",
      fecha: "01/12/2024 - 15:00",
      cod_atencion: "E00001",
      lugar: "Emergencia",
      ver: (
        <InfoButton
          tooltip="Ver detalle"
          onClick={() => console.log("open...")}
        />
      ),
    },
  ];




  return (
    <Box sx={{ width: "100%" }}>
      {/* Modal Historial de atenciones */}
      <Box>
        <HceFormModal
          open={openMedicalHistory}
          onClose={handleCloseMedicalHistory}
          title="Historial de Atenciones"
          maxWidth="md"
        >
          <Box>
            <DataTable
              columns={columnsMedicalHistory}
              rows={rowsMedicalHistory}
            />
          </Box>
          <Box>
            <DataCard
              backgroundColor={"var(--ds-color-secondary-light, #0043a5)"}
              borderColor={"var(--ds-color-primary, #0043a5)"}
              borderWidth={2}
              borderRadius="12px"
              contentPadding="12px 14px"
              contentAlign="left"
              maxWidth="100%"
            >
              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns:
                    "58px 1fr 1fr 1fr 1fr",
                  alignItems: "center",
                  columnGap: 2,
                  width: "100%",
                }}
              >
                <Avatar
                  sx={{
                    width: 42,
                    height: 42,
                    backgroundColor: "var(--ds-color-interactive-button, #0043a5)",
                    color: hceColors.neutro.white[50],
                  }}
                >
                  <User size={24} />
                </Avatar>

                <PatientField label="Especialidad:" value="Ginecología" />
                <PatientField label="Fecha y hora de la atención:" value="01/12/2024 - 15:00" />
                <PatientField label="Lugar:" value="Emergencia" />
                <PatientField label="Tipo de historia:" value="Electrónica" />

              </Box>
            </DataCard>
            <MedicalRecordPanel />
          </Box>
        </HceFormModal>
      </Box>
     <Box sx={{ width: "100%", p: 2 }}>
      {patientRecordLoading ? (
        <Box
          sx={{
            width: "100%",
            minHeight: "82px",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          Cargando información del paciente...
        </Box>
      ) : patientRecordError ? (
        <Box
          sx={{
            width: "100%",
            minHeight: "82px",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          Error al cargar la información del paciente
        </Box>
      ) : patientRecord ? (
        <DataCard
          backgroundColor="var(--ds-color-secondary-light, #0043a5)"
          borderColor="var(--ds-color-primary, #0043a5)"
          borderWidth={2}
          borderRadius="12px"
          contentPadding="12px 14px"
          contentAlign="left"
          maxWidth="100%"
        >
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns:
                "48px 1.25fr 0.7fr 0.55fr 1fr 0.65fr 0.8fr 1fr 38px",
              alignItems: "center",
              columnGap: 2,
              width: "100%",
            }}
          >
            <Avatar
              sx={{
                width: 42,
                height: 42,
                backgroundColor:
                  "var(--ds-color-interactive-button, #0043a5)",
                color: hceColors.neutro.white[50],
              }}
            >
              <User size={24} />
            </Avatar>

            <PatientField
              label={t('ClinicalRecord.patient.patient')}
              value={localizedPatientRecord?.fullName ?? "-"}
            />

            <PatientField
              label={t('ClinicalRecord.patient.gender')}
              value={localizedPatientRecord?.gender ?? "-"}
            />

            <PatientField
              label={t('ClinicalRecord.patient.age')}
              value={localizedPatientRecord?.ageDisplay ?? "-"}
            />

            <PatientField
              label={t('ClinicalRecord.patient.document')}
              value={`${localizedPatientRecord?.documentType ?? "-"} ${localizedPatientRecord?.documentNumber ?? "-"}`}
            />

            <PatientField
              label={t('ClinicalRecord.patient.bloodType')}
              value={localizedPatientRecord?.bloodType ?? "-"}
            />

            <PatientField
              label={t('ClinicalRecord.patient.specialty')}
              value={localizedPatientRecord?.specialty ?? "-"}
            />

            <PatientField
              label={t('ClinicalRecord.patient.allergies')}
              value={
                <StatusBadge
                  label={localizedPatientRecord?.hasAllergies ? t('ClinicalRecord.patient.hasAllergies') : t('ClinicalRecord.patient.noAllergies')}
                  variant={localizedPatientRecord?.hasAllergies ? "error" : "info"}
                  clickable
                  onClick={() =>
                    setAllergyDetailsOpen(true)
                  }
                />
              }
            />

            <Box
              sx={{
                display: "flex",
                justifyContent: "flex-end",
              }}
            >
              <InfoButton
                onClick={() =>
                  setPatientDetailsOpen(true)
                }
                tooltip={t('ClinicalRecord.actions.info')}
              />
            </Box>
          </Box>
        </DataCard>
      ) : null}
    </Box>

      <Box>
        <ActionBar
          orientation="horizontal"
          actions={LIST_ACTION_BAR}
          closeAction={true}
        />
      </Box>

      <PatientDetailsModal
        open={patientDetailsOpen}
        patient={localizedPatientRecord}
        onClose={() => setPatientDetailsOpen(false)}
      />

      <AllergyModal
        open={allergyDetailsOpen}
        encounterId={encounterId}
        onClose={() => setAllergyDetailsOpen(false)}
        onSaveChanges={handleAllergySaved}
      />
    </Box>
  );
}

         