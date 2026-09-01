import {
  Avatar,
  Box,
  DataCard,
  EmergencyPagination,
  GenericTable,
  hceColors,
  HceFormModal,
  PatientField,
  User,
  type GenericTableColumn,
} from "@hce/design-system";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import type {
  medicalHistoryApiData,
  medicalHistoryApiMeta,
} from "../types/MedicalHistory";
import { useMedicalHistory } from "../hooks/useMedicalHistory";
import { mapMedicalHistoryApiItemToTableRow } from "../mapper/medicalHistory.mapper";
import { registerClinicalRecordNamespace } from "../i18n/index";
import { ClinicalRecordTabs } from "./ClinicalRecordTabs";
import { ClinicalRecordFormProvider } from "../context/ClinicalRecordFormContext";

interface MedicalHistoryModalProps {
  open: boolean;
  onClose: () => void;
  /** patient_id real del encounter activo — sin él no se dispara la carga. */
  patientId?: number;
  /** true si no se pudo identificar al paciente — distingue de "sin historial". */
  notIdentified?: boolean;
}
let registered = false;
export default function MedicalHistoryModal({
  open,
  onClose,
  patientId,
  notIdentified = false,
}: MedicalHistoryModalProps) {
  const { t } = useTranslation("clinical-record");
  if (!registered) {
    registerClinicalRecordNamespace();
    registered = true;
  }
  const [currentPage, setCurrentPage] = useState(1);
  const { fetchMedicalHistory } = useMedicalHistory();
  const [rows, setRows] = useState<medicalHistoryApiData[]>([]);
  const [totalData, setTotalData] = useState<medicalHistoryApiMeta | null>(
    null,
  );
  const [viewDetailMedicalHistory, setViewDetailMedicalHistory] =
    useState(false);
  const columnsTable = useMemo<GenericTableColumn<medicalHistoryApiData>[]>(
    () => [
      {
        key: "record_type",
        header: t("dataDatableMedicalHistory.colRecordType"),
        type: "tag",
        field: "record_type",
        width: 100,
        align: "center",
        clickable: false,
        colorGetter: (row) => {
          switch (row.record_type) {
            case "electronica":
              return hceColors.primary.green[600]; // azul
            case "fisica":
              return hceColors.alert.error[600]; // rojo
          }
        },
      },
      {
        key: "practitioner_name",
        header: t("dataDatableMedicalHistory.colPractitionerName"),
        type: "text",
        field: "practitioner_name",
        width: 100,
        align: "center",
        clickable: false,
      },
      {
        key: "speciality_name",
        header: t("dataDatableMedicalHistory.colSpeciality_name"),
        type: "text",
        field: "speciality_name",
        width: 100,
        align: "center",
        clickable: false,
      },
      {
        key: "admission_datetime",
        header: t("dataDatableMedicalHistory.colAdmission_datetime"),
        type: "datetime",
        field: "admission_datetime",
        width: 100,
        align: "center",
        clickable: false,
        valueGetter: (row) => {
          const d = new Date(row.admission_datetime);
          const date = d.toLocaleDateString("es-PE", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
          });
          const time = d.toLocaleTimeString("es-PE", {
            hour: "2-digit",
            minute: "2-digit",
          });
          return `${date}\n${time}`;
        },
      },
      {
        key: "sic_attention_id",
        header: t("dataDatableMedicalHistory.colSicAttentionId"),
        type: "text",
        field: "sic_attention_id",
        width: 100,
        align: "center",
        clickable: false,
      },
      {
        key: "encounter_class_display",
        header: t("dataDatableMedicalHistory.colEncounterClassDisplay"),
        type: "tag",
        field: "encounter_class_display",
        width: 100,
        align: "center",
        clickable: false,
        colorGetter: (row) => {
          switch (row.encounter_class_display) {
            case "emergencia":
              return hceColors.alert.info[600]; // azul
            case "ambulatorio":
              return hceColors.alert.warning[600]; // rojo
          }
        },
      },
      {
        key: "viewDetail",
        header: t("dataDatableMedicalHistory.colViewDetail"),
        type: "info-button",
        field: "viewDetail",
        width: 100,
        align: "center",
        clickable: true,
        onClick: () => setViewDetailMedicalHistory((prev) => !prev),
      },
    ],
    [t],
  );

  const loadData = useCallback(async () => {
    if (!patientId) return;
    const response = await fetchMedicalHistory(patientId, currentPage);
    if (!response) return;
    const mappedRows = response.data.map(mapMedicalHistoryApiItemToTableRow);

    setRows(mappedRows);
    setTotalData(response.meta);
  }, [fetchMedicalHistory, currentPage, patientId]);

  useEffect(() => {
    if (!open || !patientId) return;
    loadData();
  }, [open, patientId, loadData]);
  const totalPages = totalData?.totalPages ?? 1;
  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(1);
    }
  }, [currentPage, totalPages]);
  return (
    <HceFormModal
      open={open}
      onClose={onClose}
      title="Historial de Atenciones"
      maxWidth="xl"
      secondaryButton={
        viewDetailMedicalHistory
          ? {
              label: "Volver",
              onClick: () => setViewDetailMedicalHistory((prev) => !prev),
            }
          : undefined
      }
      maxHeight="90vh"
      minHeight={viewDetailMedicalHistory ? "80vh" : undefined}
    >
      <Box>
        {/* Barra de información de paciente para Detalle de Historia Médica */}
        {viewDetailMedicalHistory && (
          <>
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
                    backgroundColor:
                      "var(--ds-color-interactive-button, #0043a5)",
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
            {/* Tabs */}
            <Box sx={{ pt: "15px" }}>
              <ClinicalRecordFormProvider>
                <ClinicalRecordTabs readOnly/>
              </ClinicalRecordFormProvider>
            </Box>
          </>
        )}
        {!viewDetailMedicalHistory && notIdentified && (
          <Box sx={{ p: 2 }}>
            No se pudo identificar al paciente. Vuelva al monitor e intente de
            nuevo.
          </Box>
        )}
        {!viewDetailMedicalHistory && !notIdentified && (
          <>
            {" "}
            <GenericTable
              columns={columnsTable}
              rows={rows}
              getRowId={(row) => row.encounter_id.toString()}
            />
            <Box>
              <EmergencyPagination
                summary={[{ label: "Total", value: totalData?.total ?? 0 }]}
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={(page) => {
                  setCurrentPage(page);
                }}
                viewChip={false}
              />
            </Box>{" "}
          </>
        )}
      </Box>
    </HceFormModal>
  );
}
