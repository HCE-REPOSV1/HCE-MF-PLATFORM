import { useState } from "react";
import { EditModeProvider } from "../../context/EditModeContext";
import { PERMISSIONS_CLINICAL_RECORD } from "../../config/permissions";
import { Box, NavTab } from "@hce/design-system";
import { HistoryPhysicalExam } from "./HistoryPhysicalExam";
// import { DiagnosisPanel } from "./DiagnosisPanel"; // se van agregando a medida que se crean
// ...

const TABS = [
  { label: "Anamnesis y EF", value: "history-physical-exam" },
  { label: "Diagnóstico", value: "diagnosis" },
  { label: "Indicaciones médicas", value: "medical-orders" },
  { label: "Kardex de enfermería", value: "nursing-kardex" },
  { label: "Laboratorio", value: "laboratory" },
  { label: "Imágenes", value: "imaging" },
  { label: "Interconsulta", value: "referral" },
  { label: "Procedimientos Médicos", value: "medical-procedures" },
  { label: "Evolución", value: "progress-notes" },
  { label: "Nota de enfermería", value: "nursing-note" },
];

interface ClinicalRecordTabsProps {
  readOnly?: boolean;
  encounterId?: number;
}

export const ClinicalRecordTabs = ({ readOnly = false, encounterId }: ClinicalRecordTabsProps) => {
  const [activeTab, setActiveTab] = useState(TABS[0].value);

  return (
    <Box sx={{width:"100%"}}>
      <NavTab tabs={TABS} value={activeTab} onChange={setActiveTab} />

      {activeTab === "history-physical-exam" && (
        <EditModeProvider tabWriteCode={PERMISSIONS_CLINICAL_RECORD.historyPhysicalExam.write}>
          <HistoryPhysicalExam readOnly={readOnly} encounterId={encounterId}/>
        </EditModeProvider>
      )}

      {/* {activeTab === "diagnosis" && (
        <EditModeProvider tabWriteCode={PERMISOS_CLINICAL_RECORD.diagnosis.write}>
          <DiagnosisPanel readOnly={readOnly} />
        </EditModeProvider>
      )} */}

      {/* Ir descomentando/agregando cada tab a medida que se cree su panel — recordar pasar readOnly también */}
    </Box>
  );
};