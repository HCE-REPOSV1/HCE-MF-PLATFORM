import {
  DataCardModal,
  StatusBadge,
  hceColors,
  Box,
  Avatar,
  User
} from "@hce/design-system"

import { PatientField } from "./PatientField"
import type { ClinicalRecordPatient } from "../../types/clinical.record.types"
import { useTranslation } from "@hce/i18n-core"

interface PatientInformationModalProps {
  open: boolean
  onClose: () => void
  patient: ClinicalRecordPatient | null
}


export function PatientDetailsModal({
  open,
  onClose,
  patient,
}: PatientInformationModalProps) {
   const { t } = useTranslation("emergency");

   if (!patient) return null

  const allergyLabel = patient.hasAllergies
    ? t('ClinicalRecord.patient.hasAllergies')
    : t('ClinicalRecord.patient.noAllergies')

  const allergyVariant = patient.hasAllergies
    ? "error"
    : "info"



  return (
    <DataCardModal
      open={open}
      onClose={onClose}
      showCloseButton
      disableOutsideClose
      maxWidth={304}
      maxHeight="98vh"
      backgroundColor={"var(--ds-color-secondary-light, #0043a5)"}
      borderColor={"var(--ds-color-primary, #0043a5)"}
      borderWidth={2}
      borderRadius="12px"
      contentPadding="24px"
      contentAlign="center"
      testId="mf-emergency-patient-details-modal"
      // headerContent={
      //   <Avatar
      //     src={patient.photoUrl ?? undefined}
      //     sx={{
      //       width: 48,
      //       height: 48,
      //       backgroundColor: hceColors.primary.green[600],
      //       color: hceColors.neutro.white[50],
      //     }}
      //   >
      //     <User size={28} />
      //   </Avatar>
      // }
    >
      <Box>
       <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 1.5,
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
            <User size={30} />
          </Avatar>

          <PatientField
            label={t('ClinicalRecord.patient.patient')}
            value={patient.fullName}
            align="center"
          />

          <StatusBadge
            label={allergyLabel}
            variant={allergyVariant}
            clickable={false}
            sx={{ marginTop: 1 }}
            testId="mf-emergency-patient-details-modal-allergy-badge"
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
           label={t('ClinicalRecord.patient.gender')}
            value={patient.gender}
          />

          <PatientField
            label={t('ClinicalRecord.patient.age')}
            value={patient.ageDisplay}
          />

          <PatientField
            label={t('ClinicalRecord.patient.document')}
            value={[
              patient.documentType,
              patient.documentNumber,
            ]
              .filter(Boolean)
              .join(" - ")}
          />

          <PatientField
            label={t('ClinicalRecord.patient.bloodType')}
            value={patient.bloodType}
          />

          <PatientField
            label={t('ClinicalRecord.patient.doctor')}
            value={patient.doctorName}
          />

          <PatientField
            label={t('ClinicalRecord.patient.specialty')}
            value={patient.specialty}
          />

          <PatientField
            label={t('ClinicalRecord.patient.attentionCode')}
            value={patient.attentionCode}
          />

          <PatientField
            label={t('ClinicalRecord.patient.clinicalHistoryNumber')}
            value={patient.clinicalHistoryNumber}
          />

          <PatientField
            label={t('ClinicalRecord.patient.insurance')}
            value={patient.insuranceName}
          />

          <PatientField
            label={t('ClinicalRecord.patient.product')}
            value={patient.insuranceProduct}
          />

          <PatientField
           label={t('ClinicalRecord.patient.email')}
            value={patient.email}
          />

          <PatientField
            label={t('ClinicalRecord.patient.phone')}
            value={patient.phone}
          />

          <Box sx={{ gridColumn: "1 / -1" }}>
            <PatientField
              label={t('ClinicalRecord.patient.address')}
              value={patient.address}
            />
          </Box>
        </Box>
      </Box>
    </DataCardModal>
  )
}
