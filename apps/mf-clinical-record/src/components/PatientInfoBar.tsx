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
import {  useState } from "react";
import type { ClinicalRecordPatient } from "../types/Patient.type";

import PatientInfoModal from "./PatientInfoModal";

import { AllergyModal } from "./AllergyModal";
import { useTranslation } from "@hce/i18n-core";



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
  const { t } = useTranslation("clinical-record");
  
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
          <Box sx={{ p: 1 }}>{t('actions.loadingPatient')}</Box>
        ) : error ? (
          <Box sx={{ p: 1 }}>{t('actions.patientLoadError')}</Box>
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

            <PatientField
              label={t('patient.patient')}
              value={patient?.fullName ?? "-"}
            />

            <PatientField
              label={t('patient.gender')}
              value={patient?.gender ?? "-"}
            />

            <PatientField
              label={t('patient.age')}
              value={patient?.ageDisplay ?? "-"}
            />

            <PatientField
              label={t('patient.document')}
              value={`${patient?.documentType ?? "-"} ${patient?.documentNumber ?? "-"}`}
            />

            <PatientField
              label={t('patient.bloodType')}
              value={patient?.bloodType ?? "-"}
            />

            <PatientField
              label={t('patient.specialty')}
              value={patient?.specialty ?? "-"}
            />

            <PatientField
              label={t('patient.allergies')}
              value={
                <StatusBadge
                  label={patient?.hasAllergies ? t('patient.hasAllergies') : t('patient.noAllergies')}
                  variant={patient?.hasAllergies ? "error" : "info"}
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
                tooltip={t('actions.info')}
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
