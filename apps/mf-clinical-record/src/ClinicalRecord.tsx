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
} from "@hce/design-system";
import { useEffect, useMemo, useState } from "react";
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
import { usePatientRecord } from "./hooks/usePatientRecord";
import { useCatalog } from "./hooks/useCatalog";
import { useTranslation } from "@hce/i18n-core";
import { getLocalizedCatalogDisplay } from "./utils/catalogLocalization";
import { registerClinicalRecordNamespace } from "./i18n";

const CSI_GENDER = 3;

let registered = false;

export default function ClinicalRecordPage() {
  if (!registered) {
    registerClinicalRecordNamespace();
    registered = true;
  }

  const { state } = useLocation();
  const navigatedPatient = (state as { patient?: NavigatedPatientState } | null)
    ?.patient;
  const [encounterId] = useState<number | undefined>(
    () => navigatedPatient?.encounter_id ?? undefined,
  );

  const { t, i18n } = useTranslation("clinical-record");
  const {
    fetchAgeGroups,
    fetchIdentifierTypes,
    fetchCodeSystemValues,
    dataCatalogCodeSystemValues: codeSystemValues,
  } = useCatalog();

  useEffect(() => {
    const loadData = async () => {
      try {
        const results = await Promise.all([
          fetchIdentifierTypes("patient"),
          fetchCodeSystemValues(CSI_GENDER),
          fetchAgeGroups(),
        ]);
        const [identifierTypes, genders, ageGroups] = results;

        if (genders && Array.isArray(genders)) {
          genders
            .filter((g) => g.is_active)
            .sort((a, b) => a.sort_order - b.sort_order)
            .map((g) => ({
              value: g.code,
              label: getLocalizedCatalogDisplay(g, i18n.resolvedLanguage),
            }));
        }

        if (ageGroups && Array.isArray(ageGroups)) {
          ageGroups
            .filter((g) => g.is_active)
            .sort((a, b) => a.sort_order - b.sort_order)
            .map((g) => ({
              value: g.code,
              label: getLocalizedCatalogDisplay(g, i18n.resolvedLanguage),
            }));
        }

        if (identifierTypes && Array.isArray(identifierTypes)) {
          identifierTypes
            .filter((t) => t.is_active)
            .sort((a, b) => a.sort_order - b.sort_order)
            .map((t) => ({
              value: t.code,
              label: getLocalizedCatalogDisplay(t, i18n.resolvedLanguage),
            }));
        }
      } catch (err) {
        console.error(t("clinicalRecordPage.errors.loadCatalogs"), err);
      }
    };

    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const {
    data: patientRecord,
    loading: patientRecordLoading,
    error: patientRecordError,
    refetch: refetchPatientRecord,
  } = usePatientRecord(encounterId);

  const patient = useMemo<ClinicalRecordPatient | null>(() => {
    if (!patientRecord) return null;

    const catalogGender = codeSystemValues?.find(
      ({ code, is_active }) =>
        is_active &&
        code.toLowerCase() === patientRecord.gender?.toLowerCase(),
    );

    const practitioner = patientRecord.attending_practitioner;

    return {
      patientId: String(patientRecord.patient_id),
      fullName: patientRecord.full_name,
      gender: getLocalizedCatalogDisplay(
        catalogGender,
        i18n.resolvedLanguage,
        patientRecord.gender || "-",
      ),
      ageDisplay: patientRecord.age_display || "-",
      documentType: patientRecord.document_type || "-",
      documentNumber: patientRecord.document_number || "-",
      bloodType: patientRecord.blood_type || "-",
      specialty: getLocalizedCatalogDisplay(
        practitioner
          ? {
              display_es: practitioner.speciality_es,
              display_en: practitioner.speciality_en,
            }
          : null,
        i18n.resolvedLanguage,
      ),
      doctorName: practitioner?.doctor_name ?? "-",
      attentionCode: patientRecord.attention_code ?? "-",
      clinicalHistoryNumber: patientRecord.clinical_history_number ?? "-",
      insuranceName: patientRecord.insurance ?? "-",
      insuranceProduct: "-",
      email: patientRecord.email ?? "-",
      phone: patientRecord.phone ?? "-",
      address: patientRecord.address ?? "-",
      hasAllergies: patientRecord.allergy?.declaration?.has_allergies === "S",
    };
  }, [patientRecord, codeSystemValues, i18n.resolvedLanguage]);

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
    const { getAllData } = useClinicalRecordForm();
    const [saveMessage, setSaveMessage] = useState<string | null>(null);

    const handleSave = () => {
      const rawData = getAllData();
      mapToSavePayload(rawData);
      setSaveMessage(t("clinicalRecordPage.saveButton.notAvailable"));
    };

    return (
      <Box sx={{ display: "flex", alignItems: "center", gap: "8px" }}>
        {saveMessage && (
          <Box sx={{ fontSize: "13px", color: hceColors.alert.warning[600] }}>
            {saveMessage}
          </Box>
        )}
        <Button
          startIcon={<DisketteIcon />}
          color={hceColors.primary.green[600]}
          onClick={handleSave}
        >
          {t("clinicalRecordPage.saveButton.label")}
        </Button>
      </Box>
    );
  }

  return (
    <>
      <MedicalHistoryModal
        open={openMedicalHistory}
        onClose={() => setOpenMedicalHistory(false)}
        patientId={patientIdNumber}
        notIdentified={patientNotIdentified}
      />

      <Box sx={{ width: "100%" }}>
        <Box sx={{ width: "100%", p: 2 }}>
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
              display: "flex",
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "0px 16px",
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
          <Box sx={{ padding: "16px" }}>
            <ClinicalRecordTabs encounterId={encounterId} />
          </Box>
        </ClinicalRecordFormProvider>
      </Box>
    </>
  );
}