import {
  ActionBar,
  AltaMedicaIcon,
  HceHistoryIcon,
  UiBloodTestIcon,
  UiDrugsIcon,
  UiMonitorIcon,
  UiPrescriptionIcon,
  UiPrintingIcon,
  ReferenceIcon,
  UiXRaysIcon,
  Box,
  type ExtraAction,
  Button,
  DisketteIcon,
  hceColors,
  LoadingOverlay,
} from "@hce/design-system";
import { useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import type {
  ClinicalRecordPatient,
  NavigatedPatientState,
} from "./types/Patient.type";
import MedicalHistoryModal from "./components/MedicalHistoryModal";
import PatientInfoBar from "./components/PatientInfoBar";
import {
  ClinicalRecordFormProvider,
  useClinicalRecordForm,
} from "./context/ClinicalRecordFormContext";
import { ClinicalRecordTabs } from "./components/ClinicalRecordTabs";
import { mapToSavePayload } from "./mapper/medicalHistory.mapper";
import { saveHistoryPhysicalExam } from "./services/medicalHistory.service";
import { formatAddress } from "./utils/formatAddress";
import { usePatientRecord } from "./hooks/usePatientRecord";
import { useTranslation } from "@hce/i18n-core";
import { useClinicalRecordNamespaceReady } from "./i18n";

export default function ClinicalRecordPage() {
  const namespaceReady = useClinicalRecordNamespaceReady();

  const { state } = useLocation();
  const navigatedPatient = (state as { patient?: NavigatedPatientState } | null)
    ?.patient;
  const [encounterId] = useState<number | undefined>(
    () => navigatedPatient?.encounter_id ?? undefined,
  );

  const { t } = useTranslation("clinical-record");

  // Nota: age-groups/identifier-types se pidieron acá en algún momento como
  // "precarga", pero fetchAgeGroups/fetchIdentifierTypes (ver useCatalog.tsx)
  // no pasan por createCachedFetcher -- no hay cache de módulo que calentar
  // -- y ningún componente de este árbol lee dataAgeGroups/dataIdentifierTypes
  // (confirmado por grep). Se quitó el fetch muerto; si hace falta ese
  // catálogo en algún lado, hay que llamarlo desde donde realmente se usa.

  const {
    data: patientRecord,
    loading: patientRecordLoading,
    error: patientRecordError,
    refetch: refetchPatientRecord,
  } = usePatientRecord(encounterId);

  const patient = useMemo<ClinicalRecordPatient | null>(() => {
    if (!patientRecord) return null;

    const practitioner = patientRecord.attending_practitioner;

    return {
      patientId: String(patientRecord.patient_id),
      fullName: patientRecord.full_name,
      // gender_display/speciality_display/provider_name/product_name ya vienen
      // resueltos por el backend según Accept-Language -- no hay que traducirlos
      // de nuevo en el cliente (ver apiFetch en mf-shell y usePatientRecord,
      // que refetchea al cambiar de idioma para mantener estos campos al día).
      gender: patientRecord.gender_display || "-",
      ageDisplay: patientRecord.age_display || "-",
      documentType: patientRecord.document_type || "-",
      documentNumber: patientRecord.document_number || "-",
      bloodType: patientRecord.blood_type || "-",
      specialty: practitioner?.speciality_display || "-",
      doctorName: practitioner?.doctor_name ?? "-",
      attentionCode: patientRecord.attention_code ?? "-",
      clinicalHistoryNumber: patientRecord.clinical_history_number ?? "-",
      insuranceName: patientRecord.insurance?.provider_name ?? "-",
      insuranceProduct: patientRecord.insurance?.product_name ?? "-",
      email: patientRecord.email ?? "-",
      phone: patientRecord.phone ?? "-",
      // patientRecord.address es PatientRecordAddress (objeto), no string --
      // formatAddress lo concatena en una sola línea para PatientField.
      address: formatAddress(patientRecord.address),
      hasAllergies: patientRecord.allergy?.declaration?.has_allergies === "S",
    };
  }, [patientRecord]);

  const patientIdNumber = useMemo<number | undefined>(() => {
    const raw = patientRecord?.patient_id ?? navigatedPatient?.patient_id;
    if (raw === undefined || raw === null) return undefined;
    const parsed = typeof raw === "number" ? raw : Number(raw);
    return Number.isNaN(parsed) ? undefined : parsed;
  }, [patientRecord, navigatedPatient]);

  const patientNotIdentified = encounterId === undefined;

  const [openMedicalHistory, setOpenMedicalHistory] = useState(false);

  const LIST_ACTION_BAR: ExtraAction[] = [
    {
      id: "monitor",
      labelTooltip: t("clinicalRecordPage.actionBar.monitor"),
      icon: UiMonitorIcon,
      onClick: () => console.log("Abriendo monitor..."),
      disabled: false,
    },
    {
      id: "laboratorio",
      labelTooltip: t("clinicalRecordPage.actionBar.laboratory"),
      icon: UiBloodTestIcon,
      onClick: () => console.log("Abriendo laboratorio..."),
      disabled: false,
    },
    {
      id: "imagenes",
      labelTooltip: t("clinicalRecordPage.actionBar.imaging"),
      icon: UiXRaysIcon,
      onClick: () => console.log("Abriendo imagenes..."),
      disabled: false,
    },
    {
      id: "receta_alta",
      labelTooltip: t("clinicalRecordPage.actionBar.dischargePrescription"),
      icon: UiPrescriptionIcon,
      onClick: () => console.log("Abriendo receta de alta..."),
      disabled: false,
    },
    {
      id: "alta_medica",
      labelTooltip: t("clinicalRecordPage.actionBar.medicalDischarge"),
      icon: AltaMedicaIcon,
      onClick: () => console.log("Abriendo alta medica..."),
      disabled: false,
    },
    {
      id: "imprimir_reporte",
      labelTooltip: t("clinicalRecordPage.actionBar.printReport"),
      icon: UiPrintingIcon,
      onClick: () => console.log("Abriendo imprimir reporte..."),
      disabled: false,
    },
    {
      id: "indicaciones_actuales",
      labelTooltip: t("clinicalRecordPage.actionBar.currentOrders"),
      icon: UiDrugsIcon,
      onClick: () => console.log("Abriendo indicaciones actuales..."),
      disabled: false,
    },
    {
      id: "historial_atenciones",
      labelTooltip: t("clinicalRecordPage.actionBar.attentionHistory"),
      icon: HceHistoryIcon,
      onClick: () => {
        setOpenMedicalHistory(true);
      },
      disabled: false,
    },
    {
      id: "referencia",
      labelTooltip: t("clinicalRecordPage.actionBar.referral"),
      icon: ReferenceIcon,
      onClick: () => console.log("Abriendo referencia..."),
      disabled: false,
    },
  ];

  function SaveButton() {
    const { getAllData, dirtyTabs, clearDirtyTabs } = useClinicalRecordForm();
    const [saving, setSaving] = useState(false);
    const [saveMessage, setSaveMessage] = useState<{
      text: string;
      isError: boolean;
    } | null>(null);

    // Guardado disparado ESTRICTAMENTE por este click — nada de auto-guardado
    // por cambio de tab ni por inactividad. Un "saver" por grupo de tabs que
    // ya tiene endpoint real; se corren todos en paralelo con
    // Promise.allSettled (nunca Promise.all: que falle uno no debe tumbar a
    // los demás), y solo se limpia dirty de los que efectivamente guardaron.
    //
    // Hoy solo hay un saver real conectado: Anamnesis/EF (POST
    // /encounter/:id/clinical, ver HU09). Diagnóstico e Indicaciones Médicas
    // todavía no tienen endpoint de guardado — sus tabs nunca quedan en
    // dirtyTabs (no llaman registerTabData), así que quedan afuera de este
    // array hasta que se conecten.
    const handleSave = async () => {
      setSaving(true);
      setSaveMessage(null);

      const payload = mapToSavePayload(getAllData());
      const hasHistoryPhysicalExamPayload =
        Boolean(payload.anamnesis) ||
        Boolean(payload.physicalExam) ||
        Boolean(payload.patientBackgrounds?.length) ||
        Boolean(payload.medicationReconciliations?.length);
      const isHistoryPhysicalExamDirty = Array.from(dirtyTabs).some((tabId) =>
        tabId.startsWith("historyPhysicalExam."),
      );

      const savers: { tabPrefix: string; run: () => Promise<void> }[] = [];

      if (isHistoryPhysicalExamDirty && hasHistoryPhysicalExamPayload) {
        if (encounterId === undefined) {
          setSaveMessage({
            text: t("clinicalRecordPage.saveButton.missingEncounter"),
            isError: true,
          });
          setSaving(false);
          return;
        }
        savers.push({
          tabPrefix: "historyPhysicalExam",
          run: () => saveHistoryPhysicalExam(encounterId, payload),
        });
      }

      if (savers.length === 0) {
        setSaveMessage({
          text: t("clinicalRecordPage.saveButton.nothingToSave"),
          isError: false,
        });
        setSaving(false);
        return;
      }

      const results = await Promise.allSettled(
        savers.map((saver) => saver.run()),
      );

      const succeeded: string[] = [];
      const failed: string[] = [];

      results.forEach((result, index) => {
        const { tabPrefix } = savers[index];
        if (result.status === "fulfilled") {
          succeeded.push(tabPrefix);
        } else {
          failed.push(tabPrefix);
          console.error(`[SaveButton] Error guardando ${tabPrefix}:`, result.reason);
        }
      });

      if (succeeded.length > 0) clearDirtyTabs(succeeded);

      setSaveMessage(
        failed.length === 0
          ? { text: t("clinicalRecordPage.saveButton.success"), isError: false }
          : {
              text: t("clinicalRecordPage.saveButton.partialError", {
                tabs: failed.join(", "),
              }),
              isError: true,
            },
      );
      setSaving(false);
    };

    return (
      <Box sx={{ display: "flex", alignItems: "center", gap: "8px" }}>
        {saveMessage && (
          <Box
            sx={{
              fontSize: "13px",
              color: saveMessage.isError
                ? hceColors.alert.error[600]
                : hceColors.primary.green[600],
            }}
          >
            {saveMessage.text}
          </Box>
        )}
        <Button
          startIcon={<DisketteIcon />}
          color={hceColors.primary.green[600]}
          onClick={handleSave}
          disabled={saving}
        >
          {saving
            ? t("clinicalRecordPage.saveButton.saving")
            : t("clinicalRecordPage.saveButton.label")}
        </Button>
      </Box>
    );
  }

  // if (!namespaceReady) {
  //   return (
  //     // <Box sx={{ p: 4, display: "flex", justifyContent: "center" }}>
  //     //   Cargando...
  //     // </Box>

  //   );
  // }

  return (
    <>
      <LoadingOverlay
        open={!namespaceReady && patientRecordLoading}
        message="cargando historia clínica ..."
      />
      <MedicalHistoryModal
        open={openMedicalHistory}
        onClose={() => setOpenMedicalHistory(false)}
        patientId={patientIdNumber}
        notIdentified={patientNotIdentified}
      />

      <Box
        sx={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        }}
      >
        <Box sx={{ width: "100%", p: 2, flexShrink: 0 }}>
          <PatientInfoBar
            patient={patient}
            loading={patientRecordLoading}
            error={patientRecordError}
            notIdentified={patientNotIdentified}
            encounterId={encounterId}
            onAllergySaved={refetchPatientRecord}
          />
        </Box>

        <ClinicalRecordFormProvider>
          <Box
            sx={{
              flex: 1,
              minHeight: 0,
              display: "flex",
              flexDirection: "column",
            }}
          >
            <Box
              sx={{
                display: "flex",
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "0px 16px",
                flexShrink: 0,
              }}
            >
              <Box>
                <ActionBar
                  orientation="horizontal"
                  actions={LIST_ACTION_BAR}
                  closeAction={true}
                />
              </Box>
              <Box>
                <SaveButton />
              </Box>
            </Box>
            <Box sx={{ padding: "16px", minHeight: 0, flex: 1 }}>
              <ClinicalRecordTabs encounterId={encounterId} />
            </Box>
          </Box>
        </ClinicalRecordFormProvider>
      </Box>
    </>
  );
}
