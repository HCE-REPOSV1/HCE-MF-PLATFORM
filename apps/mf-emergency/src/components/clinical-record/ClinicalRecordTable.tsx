import { useEffect, useMemo, useState, useCallback } from "react";
import { registerEmergencyNamespace } from "../../i18n";
import {
  GenericTable,
  hceColors,
  type GenericTableColumn,
} from "@hce/design-system";
import type { clinicalRecordApiData } from "../../types/clinical.record.types";
import { useTranslation } from "react-i18next";
import { useClinicalRecordTable } from "../../hooks/useClinicalRecordTable";
import { mapClinicalRecordApiItemToTableRow } from "../../mapper/clinicalRecord.mapper";

// interface ClinicalRecordTableProps {
//   data: clinicalRecordApiData;
// }

let registered = false;

export function ClinicalRecordTable() {
  const { t } = useTranslation("emergency");

  // Registro síncrono en el body, no en useEffect
  if (!registered) {
    registerEmergencyNamespace();
    registered = true;
  }

  // const PAGE_SIZE = 10;
  // const [currentPage, setCurrentPage] = useState(1);
  const { fetchClinicalRecordTable } = useClinicalRecordTable();
  const [rows, setRows] = useState<clinicalRecordApiData[]>([]);

  const columnsTable = useMemo<GenericTableColumn<clinicalRecordApiData>[]>(
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
    const response = await fetchClinicalRecordTable(57);
    if (!response) return;
    console.log(response);
    const mappedRows = response.map(mapClinicalRecordApiItemToTableRow);
    // .sort(monitorSortComparator);

    setRows(mappedRows);
  }, [fetchClinicalRecordTable]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  return (
    <div>
      <GenericTable
        columns={columnsTable}
        rows={rows}
        getRowId={(row) => row.encounter_id.toString()}
      />
    </div>
  );
}
