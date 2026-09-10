import { Box } from "@hce/design-system";
import { EditModeProvider } from "../../context/EditModeContext";
import { PERMISSIONS_CLINICAL_RECORD } from "../../config/permissions";

interface DiagnosisProps {
  readOnly?: boolean;
  encounterId?: number;
}

export const Diagnosis = ({
  readOnly = false,
  encounterId,
}: DiagnosisProps) => {
  //   return <Box>Esto es Diagnostico</Box>;
  return (
    <EditModeProvider
      tabWriteCode={PERMISSIONS_CLINICAL_RECORD.historyPhysicalExam.write}
    >
      <DiagnosisContent readOnly={readOnly} encounterId={encounterId} />
    </EditModeProvider>
  );
};

export const DiagnosisContent = ({
  readOnly = false,
  encounterId,
}: DiagnosisProps) => {
  console.log(encounterId);
  return (
    <Box>
      <div>Encounter: {encounterId}</div>
      <div>Readonly: {readOnly}</div>
    </Box>
  );
};
