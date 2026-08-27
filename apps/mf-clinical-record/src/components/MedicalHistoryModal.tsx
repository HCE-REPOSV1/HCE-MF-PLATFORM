import { Avatar, Box, DataCard, hceColors, HceFormModal, PatientField, User } from "@hce/design-system";
import { useState } from "react";

export default function MedicalHistoryModal() {
      const [openMedicalHistory, setOpenMedicalHistory] = useState(false);
    
      function handleCloseMedicalHistory() {
        setOpenMedicalHistory(false);
      }

  return (
    <HceFormModal
      open={openMedicalHistory}
      onClose={handleCloseMedicalHistory}
      title="Historial de Atenciones"
      maxWidth="lg"
    >
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
              gridTemplateColumns: "58px 1fr 1fr 1fr 1fr",
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
            <PatientField
              label="Fecha y hora de la atención:"
              value="01/12/2024 - 15:00"
            />
            <PatientField label="Lugar:" value="Emergencia" />
            <PatientField label="Tipo de historia:" value="Electrónica" />
          </Box>
        </DataCard>
        {/* <ClinicalRecordTable />
                    <MedicalRecordPanel /> */}
      </Box>
    </HceFormModal>
  );
}
