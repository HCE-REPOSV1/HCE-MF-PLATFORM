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
import { useState } from "react";
import AllergyModal from "./components/AllergyModal";
import type { ClinicalRecordPatient } from "./types/Patient.type";
import MedicalHistoryModal from "./components/MedicalHistoryModal";
import PatientInfoBar from "./components/PatientInfoBar";
import PatientInfoModal from "./components/PatientInfoModal";
import {
  ClinicalRecordFormProvider,
  useClinicalRecordForm,
} from "./context/ClinicalRecordFormContext";
import { ClinicalRecordTabs } from "./components/ClinicalRecordTabs";
import { mapToSavePayload } from "./mapper/medicalHistory.mapper";

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
  // registerClinicalRecordNamespace();
  // const { t } = useTranslation("clinical-record");

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

  function SaveButton() {
    const { getAllData } = useClinicalRecordForm();

    const handleSave = () => {
      const rawData = getAllData();
      const payload = mapToSavePayload(rawData);
      console.log("MedicalHistorySavePayload:", payload);
    };

    return (
      <Button
        startIcon={<DisketteIcon />}
        color={hceColors.primary.green[600]}
        onClick={handleSave}
      >
        Guardar
      </Button>
    );
  }

  return (
 <>
      <MedicalHistoryModal
        open={openMedicalHistory}
        onClose={() => setOpenMedicalHistory(false)}
      />

      <Box sx={{ width: "100%" }}>
        <Box sx={{ width: "100%", p: 2 }}>
          <PatientInfoBar />
        </Box>

        <ClinicalRecordFormProvider>
          <Box
            sx={{
              display: "flex",
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
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

          <Box sx={{ pt: "15px" }}>
            <ClinicalRecordTabs />
          </Box>
        </ClinicalRecordFormProvider>

        <PatientInfoModal
          open={patientDetailsOpen}
          patient={patient}
          onClose={() => setPatientDetailsOpen(false)}
        />
        <AllergyModal
          open={allergyDetailsOpen}
          onClose={() => setAllergyDetailsOpen(false)}
        />
      </Box>
    </>
  );
}
