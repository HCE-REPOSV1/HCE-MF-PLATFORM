import {
  Avatar,
  Box,
  Button,
  DataCard,
  GenericTable,
  hceColors,
  HceFormModal,
  PatientField,
  User,
  type GenericTableColumn,
} from "@hce/design-system";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import type { medicalHistoryApiData } from "../types/MedicalHistory";
import { useMedicalHistory } from "../hooks/useMedicalHistory";
import { mapMedicalHistoryApiItemToTableRow } from "../mapper/medicalHistory.mapper";
import { registerClinicalRecordNamespace } from "../i18n";

interface MedicalHistoryModalProps {
  open: boolean;
  onClose: () => void;
}
let registered = false;
export default function MedicalHistoryModal({
  open,
  onClose,
}: MedicalHistoryModalProps) {
  const { t } = useTranslation("clinical-record");
  if (!registered) {
    registerClinicalRecordNamespace();
    registered = true;
  }
  const { fetchMedicalHistory } = useMedicalHistory();
  const [rows, setRows] = useState<medicalHistoryApiData[]>([]);
  const [viewDetailMedicalHistory, setViewDetailMedicalHistory] =
    useState(false);
  const columnsTable = useMemo<GenericTableColumn<medicalHistoryApiData>[]>(
    () => [
      {
        key: "record_type",
        header: t(
          "ClinicalRecordTable.dataDatableClinicalRecord.colRecordType",
        ),
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
        header: t(
          "ClinicalRecordTable.dataDatableClinicalRecord.colPractitionerName",
        ),
        type: "text",
        field: "practitioner_name",
        width: 100,
        align: "center",
        clickable: false,
      },
      {
        key: "speciality_name",
        header: t(
          "ClinicalRecordTable.dataDatableClinicalRecord.colSpeciality_name",
        ),
        type: "text",
        field: "speciality_name",
        width: 100,
        align: "center",
        clickable: false,
      },
      {
        key: "admission_datetime",
        header: t(
          "ClinicalRecordTable.dataDatableClinicalRecord.colAdmission_datetime",
        ),
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
        header: t(
          "ClinicalRecordTable.dataDatableClinicalRecord.colSicAttentionId",
        ),
        type: "text",
        field: "sic_attention_id",
        width: 100,
        align: "center",
        clickable: false,
      },
      {
        key: "encounter_class_display",
        header: t(
          "ClinicalRecordTable.dataDatableClinicalRecord.colEncounterClassDisplay",
        ),
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
        header: t(
          "ClinicalRecordTable.dataDatableClinicalRecord.colViewDetail",
        ),
        type: "info-button",
        field: "viewDetail",
        width: 100,
        align: "center",
        clickable: false,
      },
    ],
    [t],
  );

  const loadData = useCallback(async () => {
    const response = await fetchMedicalHistory(57);
    if (!response) return;
    console.log(response);
    const mappedRows = response.map(mapMedicalHistoryApiItemToTableRow);
    // .sort(monitorSortComparator);

    setRows(mappedRows);
  }, [fetchMedicalHistory]);

  useEffect(() => {
    loadData();
  }, [loadData]);
  return (
    <HceFormModal
      open={open}
      onClose={onClose}
      title="Historial de Atenciones"
      maxWidth="lg"
    >
      <Box>
        {/* Barra de información de paciente para Detalle de Historia Médica */}
        {viewDetailMedicalHistory && (
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
        )}
        <GenericTable
          columns={columnsTable}
          rows={rows}
          getRowId={(row) => row.encounter_id.toString()}
        />
      </Box>
      <Button onClick={() => setViewDetailMedicalHistory(false)} />
    </HceFormModal>
  );
}
