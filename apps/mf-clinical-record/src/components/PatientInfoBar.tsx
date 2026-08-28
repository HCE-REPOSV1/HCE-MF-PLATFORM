import {
  Avatar,
  Box,
  DataCard,
  hceColors,
  InfoButton,
  PatientField,
  StatusBadge,
  User,
} from "@hce/design-system";
import { useState } from "react";
import type { ClinicalRecordPatient } from "../types/Patient.type";
import AllergyModal from "./AllergyModal";
import PatientInfoModal from "./PatientInfoModal";

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

export default function PatientInfoBar({}) {
  const [allergyDetailsOpen, setAllergyDetailsOpen] = useState(false);
  const [patientDetailsOpen, setPatientDetailsOpen] = useState(false);
  return (
    <>
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

      <PatientInfoModal
        open={patientDetailsOpen}
        patient={patient}
        onClose={() => setPatientDetailsOpen(false)}
      />

      <AllergyModal
        open={allergyDetailsOpen}
        onClose={() => setAllergyDetailsOpen(false)}
      />
    </>
  );
}
