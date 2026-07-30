import { Box, Avatar } from "@mui/material";
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
  UiReferenceIcon,
  UiXRaysIcon,
  User,
  type ExtraAction,
} from "@hce/design-system";
import { PatientField } from "../components/PatientField";
import { PatientDetailsModal } from "../components/PatientDetailsModal";
import type { ClinicalRecordPatient } from "../types/clinical.record.types";
import { useState } from "react";
import { MedicalRecordPanel } from "../components/MedicalRecordPanel";

const patient: ClinicalRecordPatient = {
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
      icon: UiReferenceIcon,
      onClick: () => console.log("Abriendo referencia..."),
      disabled: false,
    },
  ];

  const [patientDetailsOpen, setPatientDetailsOpen] = useState(false);
  const [openMedicalHistory, setOpenMedicalHistory] = useState(false);

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
              backgroundColor={hceColors.primary.green[50]}
              borderColor={hceColors.primary.blue[500]}
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
                    backgroundColor: hceColors.primary.green[600],
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
          backgroundColor={hceColors.primary.green[50]}
          borderColor={hceColors.primary.blue[500]}
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
                backgroundColor: hceColors.primary.green[600],
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
                  onClick={() => {
                    console.log("Abrir detalle de alergias");
                  }}
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
        patient={patient}
        onClose={() => setPatientDetailsOpen(false)}
      />
    </Box>
  );
}
