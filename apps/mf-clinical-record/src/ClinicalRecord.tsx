import {
  ActionBar,
  AltaMedicaIcon,
  DataCard,
  hceColors,
  // HceFormModal,
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
  PatientField,
} from "@hce/design-system";
import { useState } from "react";
import AllergyModal from "./components/AllergyModal";
import { PatientDetailsModal } from "./components/PatientDetailsModal";
import type { ClinicalRecordPatient } from "./types/Patient.type";
import MedicalHistoryModal from "./components/MedicalHistoryModal";

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
      icon: ReferenceIcon,
      onClick: () => console.log("Abriendo referencia..."),
      disabled: false,
    },
  ];

  const [allergyDetailsOpen, setAllergyDetailsOpen] = useState(false);

  const [patientDetailsOpen, setPatientDetailsOpen] = useState(false);
  const [openMedicalHistory, setOpenMedicalHistory] = useState(false);

  return (
    <Box sx={{ width: "100%" }}>
      {/* Modal Historial de atenciones */}
      <MedicalHistoryModal
        open={openMedicalHistory}
        onClose={() => setOpenMedicalHistory(false)}
      />
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
        patient={patient}
        onClose={() => setPatientDetailsOpen(false)}
      />

      <AllergyModal
        open={allergyDetailsOpen}
        onClose={() => setAllergyDetailsOpen(false)}
      />
    </Box>
  );
}
