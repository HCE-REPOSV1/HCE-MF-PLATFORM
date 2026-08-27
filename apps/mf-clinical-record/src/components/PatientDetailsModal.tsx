import {
  DataCardModal,
  StatusBadge,
  hceColors,
  Box,
  Avatar,
  User,
  PatientField
} from "@hce/design-system"
import type { ClinicalRecordPatient } from "../types/Patient.type"

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
   if (!patient) return null

  const allergyLabel = patient.hasAllergies
    ? "Presenta alergias"
    : "Sin alergias"

  const allergyVariant = patient.hasAllergies
    ? "error"
    : "success"



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
            label="Paciente:"
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
            label="Género:"
            value={patient.gender}
          />

          <PatientField
            label="Edad:"
            value={patient.ageDisplay}
          />

          <PatientField
            label="Tipo y N.Documento:"
            value={[
              patient.documentType,
              patient.documentNumber,
            ]
              .filter(Boolean)
              .join(" - ")}
          />

          <PatientField
            label="G. Sanguíneo:"
            value={patient.bloodType}
          />

          <PatientField
            label="Médico:"
            value={patient.doctorName}
          />

          <PatientField
            label="Especialidad:"
            value={patient.specialty}
          />

          <PatientField
            label="C. de atención:"
            value={patient.attentionCode}
          />

          <PatientField
            label="N° de Historia:"
            value={patient.clinicalHistoryNumber}
          />

          <PatientField
            label="Aseguradora:"
            value={patient.insuranceName}
          />

          <PatientField
            label="Producto:"
            value={patient.insuranceProduct}
          />

          <PatientField
            label="Correo:"
            value={patient.email}
          />

          <PatientField
            label="Celular:"
            value={patient.phone}
          />

          <Box sx={{ gridColumn: "1 / -1" }}>
            <PatientField
              label="Dirección:"
              value={patient.address}
            />
          </Box>
        </Box>
      </Box>
    </DataCardModal>
  )
}