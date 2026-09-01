import { Avatar, Box, DataCardModal, hceColors, PatientField, StatusBadge, User } from "@hce/design-system";
import type { ClinicalRecordPatient } from "../types/Patient.type";
import { useTranslation } from "@hce/i18n-core";

interface PatientInformationModalProps {
  open: boolean
  onClose: () => void
  patient: ClinicalRecordPatient | null
}
export default function PatientInfoModal({
  open,
  onClose,
  patient,
}: PatientInformationModalProps) {
 const { t } = useTranslation("clinical-record");

   if (!patient) return null

  const allergyLabel = patient.hasAllergies
    ? t('patient.hasAllergies')
    : t('patient.noAllergies')

  const allergyVariant = patient.hasAllergies
    ? "error"
    : "info"

  return (
    <DataCardModal
      open={open}
      onClose={onClose}
      showCloseButton
      disableOutsideClose
      maxWidth={320}
  
      backgroundColor={"var(--ds-color-secondary-light, #0043a5)"}
      borderColor={"var(--ds-color-primary, #0043a5)"}
      borderWidth={2}
      borderRadius="10px"
      contentPadding="24px"
      contentAlign="center"
      testId="mf-clinical-record-patient-details-modal"
    >
      <Box>
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 1,
            textAlign: "center",
            mb: 2.5,
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
            value={patient.fullName}
            align="center"
          />

          <StatusBadge
            label={allergyLabel}
            variant={allergyVariant}
            clickable={false}
            sx={{ marginTop: 1 }}
          />
        </Box>

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            columnGap: 3,
            rowGap: 2,
          }}
        >
          <PatientField
           label={t('patient.gender')}
            value={patient.gender}
          />

          <PatientField
            label={t('patient.age')}
            value={patient.ageDisplay}
          />

          <PatientField
            label={t('patient.document')}
            value={[
              patient.documentType,
              patient.documentNumber,
            ]
              .filter(Boolean)
              .join(" - ")}
          />

          <PatientField
            label={t('patient.bloodType')}
            value={patient.bloodType}
          />

          <PatientField
            label={t('patient.doctor')}
            value={patient.doctorName}
          />

          <PatientField
            label={t('patient.specialty')}
            value={patient.specialty}
          />

          <PatientField
            label={t('patient.attentionCode')}
            value={patient.attentionCode}
          />

          <PatientField
            label={t('patient.clinicalHistoryNumber')}
            value={patient.clinicalHistoryNumber}
          />

          <PatientField
            label={t('patient.insurance')}
            value={patient.insuranceName}
          />

          <PatientField
            label={t('patient.product')}
            value={patient.insuranceProduct}
          />

          <PatientField
           label={t('patient.email')}
            value={patient.email}
          />

          <PatientField
            label={t('patient.phone')}
            value={patient.phone}
          />

          <Box sx={{ gridColumn: "1 / -1" }}>
            <PatientField label={t('patient.address')} value={patient.address} />
          </Box>
        </Box>
      </Box>
    </DataCardModal>
  );
}
