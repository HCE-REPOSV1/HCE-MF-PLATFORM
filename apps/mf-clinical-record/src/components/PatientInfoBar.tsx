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

interface PatientInfoBarProps {
  /** Paciente ya localizado, o null mientras carga/si no hay encounter en el router state. */
  patient: ClinicalRecordPatient | null;
  loading?: boolean;
  error?: string | null;
  /** true si no llegó ningún encounter_id por router state — distinto de "cargando" o "error de red". */
  notIdentified?: boolean;
  /** encounter_id real del router state — se reenvía a AllergyModal. */
  encounterId?: number;
  /** Refetch del patient-summary tras guardar una declaración de alergias. */
  onAllergySaved?: () => void | Promise<void>;
}

export default function PatientInfoBar({
  patient,
  loading = false,
  error = null,
  notIdentified = false,
  encounterId,
  onAllergySaved,
}: PatientInfoBarProps) {
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
        testId="mf-clinical-record-patient-info-bar"
      >
        {notIdentified ? (
          <Box sx={{ p: 1 }}>
            No se pudo identificar al paciente. Vuelva al monitor e intente de
            nuevo.
          </Box>
        ) : loading ? (
          <Box sx={{ p: 1 }}>Cargando información del paciente...</Box>
        ) : error ? (
          <Box sx={{ p: 1 }}>Error al cargar la información del paciente</Box>
        ) : (
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

            <PatientField label="Paciente:" value={patient?.fullName ?? "-"} />

            <PatientField label="Género:" value={patient?.gender ?? "-"} />

            <PatientField label="Edad:" value={patient?.ageDisplay ?? "-"} />

            <PatientField
              label="Tipo y N.Documento:"
              value={`${patient?.documentType ?? "-"} - ${patient?.documentNumber ?? "-"}`}
            />

            <PatientField label="G. Sanguíneo:" value={patient?.bloodType ?? "-"} />

            <PatientField label="Especialidad:" value={patient?.specialty ?? "-"} />

            <PatientField
              label="Alergias:"
              value={
                <StatusBadge
                  label={patient?.hasAllergies ? "Presenta alergias" : "Sin alergias"}
                  variant={patient?.hasAllergies ? "error" : "success"}
                  clickable
                  onClick={() => setAllergyDetailsOpen(true)}
                  testId="mf-clinical-record-patient-info-bar-allergy-badge"
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
                onClick={() => setPatientDetailsOpen(true)}
                testId="mf-clinical-record-patient-info-bar-info-button"
              />
            </Box>
          </Box>
        )}
      </DataCard>

      <PatientInfoModal
        open={patientDetailsOpen}
        patient={patient}
        onClose={() => setPatientDetailsOpen(false)}
      />

      <AllergyModal
        open={allergyDetailsOpen}
        onClose={() => setAllergyDetailsOpen(false)}
        encounterId={encounterId}
        onSaveChanges={onAllergySaved}
      />
    </>
  );
}
