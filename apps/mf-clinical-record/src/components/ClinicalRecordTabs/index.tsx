import { useState } from "react";
import { EditModeProvider } from "../../context/EditModeContext";
import { PERMISSIONS_CLINICAL_RECORD } from "../../config/permissions";
import { Box, NavTab } from "@hce/design-system";
import { HistoryPhysicalExam } from "./HistoryPhysicalExam";
import { useTranslation } from "react-i18next";
import { MedicalInstructions } from "./MedicalInstructions";
import { Diagnosis } from "./Diagnosis";

interface ClinicalRecordTabsProps {
  readOnly?: boolean;
  encounterId?: number;
}

export const ClinicalRecordTabs = ({
  readOnly = false,
  encounterId,
}: ClinicalRecordTabsProps) => {
  const { t } = useTranslation("clinical-record");
  const [activeTab, setActiveTab] = useState("history-physical-exam");

  const TABS = [
    { label: t("tabs.historyPhysicalExam"), value: "history-physical-exam" },
    { label: t("tabs.diagnosis"), value: "diagnosis" },
    { label: t("tabs.medicalOrders"), value: "medical-orders" },
    { label: t("tabs.nursingKardex"), value: "nursing-kardex" },
    { label: t("tabs.laboratory"), value: "laboratory" },
    { label: t("tabs.imaging"), value: "imaging" },
    { label: t("tabs.referral"), value: "referral" },
    { label: t("tabs.medicalProcedures"), value: "medical-procedures" },
    { label: t("tabs.progressNotes"), value: "progress-notes" },
    { label: t("tabs.nursingNote"), value: "nursing-note" },
  ];

  return (
    <Box
      sx={{
        width: "100%",
        display: "flex",
        flexDirection: "column",
        flex: 1,
        minHeight: 0,
        overflow: "hidden",
        height: "100%",
      }}
    >
      <NavTab tabs={TABS} value={activeTab} onChange={setActiveTab} />

      <Box sx={{ flex: 1, minHeight: 0, overflowY: "auto" }}>
        {activeTab === "history-physical-exam" && (
          <EditModeProvider
            tabWriteCode={PERMISSIONS_CLINICAL_RECORD.historyPhysicalExam.write}
          >
            <HistoryPhysicalExam
              readOnly={readOnly}
              encounterId={encounterId}
            />
          </EditModeProvider>
        )}

        {activeTab === "medical-orders" && (
          <EditModeProvider
            tabWriteCode={PERMISSIONS_CLINICAL_RECORD.medicalOrders.write}
          >
            <MedicalInstructions />
          </EditModeProvider>
        )}

        {activeTab === "diagnosis" && (
          <EditModeProvider
            tabWriteCode={PERMISSIONS_CLINICAL_RECORD.diagnosis.write}
          >
            <Diagnosis readOnly={readOnly} encounterId={encounterId} />
          </EditModeProvider>
        )}

        {/* Ir descomentando/agregando cada tab a medida que se cree su panel — recordar pasar readOnly también */}
      </Box>
    </Box>
  );
};
