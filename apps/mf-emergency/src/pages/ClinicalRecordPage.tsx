
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
import { useEffect, useState } from "react";
import { MedicalRecordPanel } from "../components/MedicalRecordPanel";
import { AllergyModal } from "../components/clinical-record/AllergyModal";
import { PatientField } from "../components/clinical-record/PatientField";
import { PatientDetailsModal } from "../components/clinical-record/PatientDetailsModal";
import { useLocation } from "react-router-dom";
import type { MonitorTableRow } from "../types/monitor.table.types";
import { usePatientRecord } from "../hooks/usePatientRecord";
import { useTranslation } from "@hce/i18n-core";
import { useCatalog } from "../hooks/useCatalog";

const patient2: ClinicalRecordPatient = {
  patientId: "1",
  fullName: "Sofía González Pérez",
  gender: "Femenino",
  ageDisplay: "19 Años",
  documentType: "DNI",
  documentNumber: "80001234",
  bloodType: "A+",
  specialty: "Oncología",

  doctorName: "Neymar Sanchez",
  attentionCode: "087999",
  clinicalHistoryNumber: "087999",
  insuranceName: "Rimac",
  insuranceProduct: "EPS",
  email: "santivea@gmail.com",
  phone: "966420859",
  address: "Av. Gregorio Escobedo 650, Jesús María",

  hasAllergies: true,
};

export default function ClinicalRecordPage() {


 const { state } = useLocation();

  const patient = state?.patient as MonitorTableRow ;

  const [allergyDetailsOpen, setAllergyDetailsOpen] =
    useState(false);

  const [patientDetailsOpen, setPatientDetailsOpen] =
    useState(false);

  const [openMedicalHistory, setOpenMedicalHistory] =
    useState(false);

  const { t, i18n } = useTranslation("triage");

  const localeLabelKey =
    i18n.resolvedLanguage === "en"
      ? "display_en"
      : i18n.resolvedLanguage === "pt"
        ? "display_pt"
        : "display_es";


    const {
   
    fetchIdentifierTypes,
    fetchAgeGroups,
    loadingIdentifierTypes,
    loadingAgeGroups,
  } = useCatalog();

  const {
    data: patientRecord,
    loading,
    error,
    refetch,
  } = usePatientRecord(patient?.patient_id);

  console.log(
    "Paciente proveniente del monitor:",
    patient,
  );
  console.log("Información completa del endpoint:", patientRecord);

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

  const fullName = patientRecord
  ? [
      patientRecord.first_name,
      patientRecord.last_name_father,
      patientRecord.last_name_mother,
    ]
      .filter(Boolean)
      .join(" ")
  : "-";

  const primaryIdentifier =
  patientRecord?.identifiers?.find(
    (identifier) => identifier.is_primary,
  ) ?? patientRecord?.identifiers?.[0];

  const calculateAge = (birthDate?: string) => {
  if (!birthDate) return null;

  const birth = new Date(`${birthDate}T00:00:00`);
  const today = new Date();

  let age =
    today.getFullYear() - birth.getFullYear();

  const monthDifference =
    today.getMonth() - birth.getMonth();

  if (
    monthDifference < 0 ||
    (monthDifference === 0 &&
      today.getDate() < birth.getDate())
  ) {
    age--;
  }

  return age;
};

const age = calculateAge(patientRecord?.birth_date);

 useEffect(() => {
    const loadData = async () => {
      try {
        const results = await Promise.all([
         
          fetchIdentifierTypes("patient"),
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
              .map((g) => ({ value: g.code, label: String(g[localeLabelKey as keyof typeof g] ?? g.display_es) }))
        }

        if (ageGroups && Array.isArray(ageGroups)) {
        
            ageGroups
              .filter((g) => g.is_active)
              .sort((a, b) => a.sort_order - b.sort_order)
              .map((g) => ({ value: g.code, label: String(g[localeLabelKey as keyof typeof g] ?? g.display_es) }))
          
        }

       
        if (identifierTypes && Array.isArray(identifierTypes)) {
       
            identifierTypes
              .filter((t) => t.is_active)
              .sort((a, b) => a.sort_order - b.sort_order)
              .map((t) => ({ value: t.code, label: String(t[localeLabelKey as keyof typeof t] ?? t.display_es) }))
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
                backgroundColor: "var(--ds-color-interactive-button, #0043a5)",
                color: hceColors.neutro.white[50],
              }}
            >
              <User size={24} />
            </Avatar>

            <PatientField label="Paciente:" value="Sofía González Pérez" />

            <PatientField label="Género:" value="Femenino" />

            <PatientField label="Edad:" value="19 Años" />

            <PatientField label="Tipo y N.Documento:" value="DNI - 80001234" />

            <PatientField label="G. Sanguíneo:" value="A+" />

            <PatientField label="Especialidad:" value="Oncología" />

            <PatientField
              label="Alergias:"
              value={
                <StatusBadge
                  label="Presenta alergias"
                  variant="error"
                  clickable
                  onClick={() => setAllergyDetailsOpen(true)}
                />
              }
            />

            <Box
              sx={{
                display: "flex",
                justifyContent: "flex-end",
              }}
            >
              <InfoButton onClick={() => setPatientDetailsOpen(true)} />
            </Box>
          </Box>
        </DataCard>
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
        patient={patient2}
        onClose={() => setPatientDetailsOpen(false)}
      />

      <AllergyModal
        open={allergyDetailsOpen}
        onClose={() => setAllergyDetailsOpen(false)}
      />
    </Box>
  );
}

         
