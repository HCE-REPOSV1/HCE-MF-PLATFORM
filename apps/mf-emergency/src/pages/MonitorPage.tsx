import { useEmergencyMonitor } from "../hooks/useEmergencyMonitor";
import {
  useState,
  useCallback,
  lazy,
  Suspense,
  useMemo,
  useEffect,
} from "react";
import {
  Box,
  hceClinicalColors,
  hceSpacing,
  MonitoActionBar,
  EmergencyPagination,
  BedAvailabilityDrawerV2,
  HceModal,
  UiStethoscopeIcon,
  UiPrintingIcon,
  UiMedicalRoomIcon,
} from "@hce/design-system";

import { AsignarMedicoModal } from "../components/monitor/AsignarMedicoModal";
import { AditionalInfoModal } from "../components/monitor/AditionalInfoModal";

import { useBedBoard } from "../hooks/useBedBoard";
import { mapBedApiItemToAvailabilityItem } from "../mapper/bed.mapper";

import { UiWarningIcon, type GenericTableColumn } from "@hce/design-system";

import { usePermiso } from "../hooks/usePermiso";
import { PERMISOS_EMERGENCY } from "../config/permisos";
import { useSede } from "../hooks/useSede";

import type { TriajeForm } from "triage/Triage";
import { GenericTable } from "@hce/design-system";

import type {
  MonitorSummary,
  MonitorTableRow,
} from "../types/monitor.table.types";
import type { MonitorApiResponse } from "../types/monitor.api.types";
import {
  mapMonitorApiItemToTableRow,
  mapMonitorApiSummaryToSummary,
} from "../mapper/monitor.mapper";
import { monitorSortComparator } from "../../src/utils/monitorSort";
import { BoxModal } from "../components/monitor/BoxModal";

import { useNavigate } from "react-router-dom";
import { registerEmergencyNamespace } from "../i18n";
import { useTranslation } from "@hce/i18n-core";

const PAGE_SIZE = 10;

const Triage = lazy(() => import("triage/Triage"));

export default function MonitorPage() {
  const canReadTriage = usePermiso(PERMISOS_EMERGENCY.triage.read);
  const canWriteTriage = usePermiso(PERMISOS_EMERGENCY.triage.write);
  const canReadBeds = usePermiso(PERMISOS_EMERGENCY.beds);
  const canEditBox = true;
  const canReadHce = true;
  const canReadInfo = true;

  registerEmergencyNamespace();
  const { t } = useTranslation("emergency");
  
  const createMonitorDskColumns = ({
    canReadTriage,
    canEditBox,
    canReadHce,
    canReadInfo,
    onOpenTriage,
    onOpenHce,
    onOpenBox,
    onOpenInfo,
  }: {
    canReadTriage: boolean;
    canEditBox: boolean;
    canReadHce: boolean;
    canReadInfo: boolean;
    onOpenTriage: (row: MonitorTableRow) => void;
    onOpenHce: (row: MonitorTableRow) => void;
    onOpenBox: (row: MonitorTableRow) => void;
    onOpenInfo: (row: MonitorTableRow) => void;
  }): GenericTableColumn<MonitorTableRow>[] => [
    {
      key: "priority",
      header: t("MonitorPage.dataTableMonitor.colPriority"),
      type: "priority",
      field: "priority",
      width: 100,
      maxWidth: 100,
      align: "center",
      clickable: true,
      // Solo se puede abrir el triaje (modo lectura) desde este campo, y solo si la fila
      // ya tiene un triage_id vinculado — sin eso no hay nada que cargar.
      disabledGetter: (row) =>
        !canReadTriage || row.triage_id == null || row.priority == "none",
      onClick: (row) => onOpenTriage(row),
    },
    {
      key: "box",
      header: t("MonitorPage.dataTableMonitor.colBox"),
      type: "box",
      field: "box",
      width: 100,
      maxWidth: 170,
      align: "center",
      clickable: true,
      disabledGetter: () => !canEditBox,
      onClick: (row) => onOpenBox(row),
    },
    {
      key: "document",
      header: t("MonitorPage.dataTableMonitor.colDocumentNumber"),
      type: "text",
      width: 100,
      valueGetter: (row) =>
        row.is_vip ? row.document_number_masked : row.document_number,
      boldGetter: (row) => row.has_discharge,
    },
    {
      key: "patient",
      header: t("MonitorPage.dataTableMonitor.colPatient"),
      type: "patient-name",
      width: 200,
      align: "left",
      clickable: true,
      valueGetter: (row) =>
        row.is_vip ? row.patient_name_masked : row.patient_name,
      disabledGetter: (row) => !canReadHce || !row.physician_assigned,
      boldGetter: (row) => row.has_discharge,
      onClick: (row) => onOpenHce(row),
      cellSx: {
        padding: "0 12px",
      },
    },
    {
      key: "age",
      header: t("MonitorPage.dataTableMonitor.colAge"),
      type: "text",
      field: "age",
      width: 70,
      maxWidth: 70,
      align: "center",
      boldGetter: (row) => row.has_discharge,
    },
    {
      key: "sex",
      header: t("MonitorPage.dataTableMonitor.colGender"),
      type: "text",
      field: "sex",
      width: 70,
      maxWidth: 70,
      align: "center",
      boldGetter: (row) => row.has_discharge,
    },
    {
      key: "doctor",
      header: t("MonitorPage.dataTableMonitor.colDoctor"),
      type: "text",
      field: "physician_name_display",
      width: 200,
      align: "left",
      boldGetter: (row) => row.has_discharge,
    },
    {
      key: "lab",
      header: t("MonitorPage.dataTableMonitor.colLaboratory"),
      type: "clinical-status",
      field: "lab",
      clinicalIcon: "lab",
      width: 60,
      maxWidth: 60,
      align: "center",
    },
    {
      key: "img",
      header: t("MonitorPage.dataTableMonitor.colImage"),
      type: "clinical-status",
      field: "img",
      clinicalIcon: "img",
      width: 60,
      maxWidth: 60,
      align: "center",
    },
    {
      key: "indication",
      header: t("MonitorPage.dataTableMonitor.colMedicalIndication"),
      type: "clinical-status",
      field: "indication",
      clinicalIcon: "indication",
      width: 70,
      maxWidth: 70,
      align: "center",
    },
    {
      key: "interconsult",
      header: t("MonitorPage.dataTableMonitor.colConsultation"),
      type: "clinical-status",
      field: "interconsult",
      clinicalIcon: "interconsult",
      width: 80,
      maxWidth: 80,
      align: "center",
      clickable: true,
      onClick: (row) => onOpenInfo(row),
    },
    {
      key: "attentionCode",
      header: t("MonitorPage.dataTableMonitor.colAttention"),
      type: "attention-code",
      field: "attention_id",
      width: 90,
      maxWidth: 90,
    },
    {
      key: "info",
      header: t("MonitorPage.dataTableMonitor.colInformation"),
      type: "info-button",
      width: 60,
      maxWidth: 60,
      align: "center",
      clickable: true,
      disabledGetter: (row) => !canReadInfo || row.box.stage === "ESPERA",
      onClick: (row) => onOpenInfo(row),
      tooltip: t("MonitorPage.infoButtonTooltip"),
    },
  ];

  const [currentPage, setCurrentPage] = useState(1);
  const [selectedPatient, setSelectedPatient] =
    useState<MonitorTableRow | null>(null);
  const [triajeOpen, setTriajeOpen] = useState(false);
  const [triajeModo, setTriajeModo] = useState<"read" | "write">("write");
  const [selectedTriageId, setSelectedTriageId] = useState<number | undefined>(
    undefined,
  );
  const [medicoOpen, setMedicoOpen] = useState(false);
  const [infoOpen, setInfoOpen] = useState(false);
  const [boxModalOpen, setBoxModalOpen] = useState(false);
  const [boxModalType, setBoxModalType] = useState<"change" | "assign">(
    "assign",
  );
  const [selectedBoxPatient, setSelectedBoxPatient] =
    useState<MonitorTableRow | null>(null);
  const [disponibilidadOpen, setDisponibilidadOpen] = useState(false);
  const [attentionWarningOpen, setAttentionWarningOpen] = useState(false);
  //const [patientDetailsOpen, setPatientDetailsOpen] = useState(false)

  const navigate = useNavigate();
  const sede = useSede();

  const { beds: bedBoardData, loading: bedBoardLoading } = useBedBoard({
    locationId: sede?.id,
    enabled: disponibilidadOpen,
  });

  const bedBoard = useMemo(
    () => bedBoardData.map(mapBedApiItemToAvailabilityItem),
    [bedBoardData],
  );

  const {
    data: monitorData,
    loading: monitorLoading,
    error: monitorError,
    refetch: refetchMonitor,
  } = useEmergencyMonitor({
    page: currentPage,
    limit: PAGE_SIZE,
  });

  const response = monitorData as MonitorApiResponse | null;

  const rows = useMemo<MonitorTableRow[]>(() => {
    if (!response?.data?.items) return [];

    return response.data.items
      .map(mapMonitorApiItemToTableRow)
      .sort(monitorSortComparator);
  }, [response]);

  const summary = useMemo<MonitorSummary[]>(() => {
    if (!response?.data?.summary) return [];

    return mapMonitorApiSummaryToSummary(response.data.summary);
  }, [response]);

  const meta = response?.data?.meta;

  const totalPages = meta?.totalPages ?? 1;

  useEffect(() => {
    setCurrentPage(1);
  }, [sede?.id]);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(1);
    }
  }, [currentPage, totalPages]);

  const handleOpenTriageWrite = useCallback(() => {
    setTriajeModo("write");
    setTriajeOpen(true);
  }, []);

  const handleOpenAsignarMedicos = useCallback(() => {
    // No requiere paciente preseleccionado: el modal muestra la lista de
    // pacientes disponibles (sin médico, o asignados a otro médico según
    // el modo Asignar/Reasignar) y el usuario elige de ahí.
    setMedicoOpen(true);
  }, []);

  const handleReportes = useCallback(() => {
    console.info("[MonitorPage] Reportes");
  }, []);

  const handleDisponibilidad = useCallback(() => {
    setDisponibilidadOpen(true);
  }, []);

  // MonitoActionBar ya no trae Triaje/Reportes/Disponibilidad hardcodeados
  // (ver MonitoActionBarProps en @hce/design-system) -- cada consumidor arma
  // su propia lista de `actions`. Iconos/tooltips iguales a los que el
  // componente traia fijos antes del refactor (UiStethoscopeIcon/
  // UiPrintingIcon/UiMedicalRoomIcon), para no cambiar nada visualmente.
  //
  // El tipo `MonitoAction` existe en el componente fuente pero el paquete
  // publicado de @hce/design-system no lo reexporta (solo MonitoActionBar),
  // asi que se deriva localmente desde las props del propio componente en
  // vez de importarlo por nombre.
  // type MonitorActionsProp = ComponentProps<typeof MonitoActionBar>["actions"]

  // const monitorActions = useMemo<MonitorActionsProp>(() => [
  //   {
  //     key: "triaje",
  //     icon: <UiStethoscopeIcon size={17} color="currentColor" />,
  //     tooltip: "Triaje",
  //     onClick: handleOpenTriageWrite,
  //     disabled: !canWriteTriage,
  //   },
  //   {
  //     key: "reportes",
  //     icon: <UiPrintingIcon size={17} color="currentColor" />,
  //     tooltip: "Reportes",
  //     onClick: handleReportes,
  //   },
  //   {
  //     key: "disponibilidad",
  //     icon: <UiMedicalRoomIcon size={17} color="currentColor" />,
  //     tooltip: "Disponibilidad de camas",
  //     onClick: handleDisponibilidad,
  //     disabled: !canReadBeds,
  //   },
  // ], [handleOpenTriageWrite, canWriteTriage, handleReportes, handleDisponibilidad, canReadBeds])

  const handlePatientClick = useCallback((row: MonitorTableRow) => {

   // console.info("[MonitorPage] Abrir HCE:", row);

    navigate("historiacli", {
      state: {
        patient: row,
      },
    });
  },[navigate],);

  const handlePriorityClick = useCallback(
    (row: MonitorTableRow) => {
      if (!canReadTriage) {
        console.info("[MonitorPage] No tiene permiso para leer triaje:", row);
        return;
      }
      if (row.triage_id == null) {
        console.info(
          "[MonitorPage] La fila no tiene triaje vinculado todavía:",
          row,
        );
        return;
      }
      if (row.priority == null || row.priority == "none") {
        console.info(
          "[MonitorPage] El paciente no tiene prioridad todavía:",
          row,
        );
        return;
      }

      setSelectedTriageId(row.triage_id);
      setTriajeModo("read");
      setTriajeOpen(true);

      console.info("[MonitorPage] Abrir triaje solo lectura:", row);
    },
    [canReadTriage],
  );

  const handleBoxClick = useCallback((row: MonitorTableRow) => {
    const stage = row.box.stage;

    if (stage === "ESPERA") {
      setAttentionWarningOpen(true);
      return;
    }

    setSelectedBoxPatient(row);

    if (stage === "SALA_D") {
      setBoxModalType("assign");
      setBoxModalOpen(true);
      return;
    }

    setBoxModalType("change");
    setBoxModalOpen(true);
  }, []);

  const handleInfo = useCallback((row: MonitorTableRow) => {
    setInfoOpen(true);
    setSelectedPatient(row);
  }, []);

  const handleSaveAdditionalInfo = useCallback(
    async (updatedPaciente: MonitorTableRow) => {
      console.info("Guardar cambios al cerrar modal:", updatedPaciente);
    },
    [],
  );

  const columns = useMemo(
    () =>
      createMonitorDskColumns({
        canReadTriage,
        canEditBox,
        canReadHce,
        canReadInfo,
        onOpenTriage: handlePriorityClick,
        onOpenHce: handlePatientClick,
        onOpenBox: handleBoxClick,
        onOpenInfo: handleInfo,
      }),
    [
      canReadTriage,
      canEditBox,
      canReadHce,
      canReadInfo,
      handlePriorityClick,
      handlePatientClick,
      handleBoxClick,
      handleInfo,
      t,
    ],
  );

  const actions = [
    {
      key: "Triage",
      icon: <UiStethoscopeIcon size={17} color="currentColor" />,
      tooltip: t("MonitorPage.actions.triage"),
      onClick: canWriteTriage ? handleOpenTriageWrite : undefined,
    },
    {
      key: "Reportes",
      icon: <UiPrintingIcon size={17} color="currentColor" />,
      tooltip: t("MonitorPage.actions.reports"),
      onClick: handleReportes,
    },
    {
      key: "Disponibilidad",
      icon: <UiMedicalRoomIcon size={17} color="currentColor" />,
      tooltip: t("MonitorPage.actions.availability"),
      onClick: canReadBeds ? handleDisponibilidad : undefined,
    },
  ];

  return (
    <>
      <Box
        sx={{
          inset: 0,
          height: "100% !important",
          display: "flex",
          flexDirection: "column",
          backgroundColor: hceClinicalColors.rowAlternate,
          overflow: "hidden",
          zIndex: 1,
        }}
      >
        <Box
          sx={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            height: "100%",
            minHeight: 0,
            overflow: "hidden",
            padding: `${hceSpacing[3]} 52px ${hceSpacing[3]} ${hceSpacing[4]}`,
            gap: hceSpacing[3],
          }}
        >
          {/* Barra de acciones de monitoreo — ancho completo, iconos a la izquierda */}
          <Box sx={{ flexShrink: 0 }}>
            <MonitoActionBar
              tooltipPlacement="bottom"
              orientation="horizontal"
              actions={actions}
              // onTriaje={canWriteTriage ? handleOpenTriageWrite : undefined}
              onAsignarMedicos={handleOpenAsignarMedicos}
              labelBtn={t("MonitorPage.AssignDoctorButton")}
              // onReportes={handleReportes}
              // onDisponibilidad={canReadBeds ? handleDisponibilidad : undefined}
              // actions={monitorActions}
            />
          </Box>

          {/* Área de la tabla — debe crecer/encoger para ocupar TODO el espacio
              vertical restante entre la barra de acciones y la paginación.
              flex:1 + minHeight:0 en toda la cadena de contenedores (incluido
              GenericTable internamente) es lo que evita el hueco en blanco al
              achicar la ventana; antes había un maxHeight="45vh" fijo en
              GenericTable que no tenía relación con el espacio real disponible. */}
          <Box
            sx={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              minHeight: 0,
              overflow: "hidden",
            }}
          >
            {monitorLoading ? (
              <Box sx={{ p: 2 }}>{t("MonitorPage.loadingMonitor")}</Box>
            ) : monitorError ? (
              <Box sx={{ p: 2 }}>
                {t("MonitorPage.errorPrefix")} {monitorError}
              </Box>
            ) : (
              <Box sx={{ flex: 1, minHeight: 0, overflowX: "auto" }}>
                <GenericTable
                  rows={rows}
                  columns={columns}
                  getRowId={(row) => row.id}
                  maxHeight="100%"
                  rowAlertGetter={(row) => row.row_alert_color === "red"}
                />
              </Box>
            )}
          </Box>
          {/* <EmergencyPatientTable rows={paginatedRows} header={HEADER_COLUMNS} /> */}

          <Box
            sx={{
              flexShrink: 0,
            }}
          >
            <EmergencyPagination
              summary={summary}
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={(page) => {
                setCurrentPage(page);
              }}
            />
          </Box>
        </Box>
      </Box>

      {/* Panel de disponibilidad de camas — disparado por handleDisponibilidad (MonitoActionBar) */}
      <BedAvailabilityDrawerV2
        open={disponibilidadOpen}
        onClose={() => setDisponibilidadOpen(false)}
        beds={bedBoard}
        title={
          bedBoardLoading
            ? t("MonitorPage.bedAvailabilityLoading")
            : t("MonitorPage.bedAvailability")
        }
      />

      {/* Modal de Triaje */}
      {/* <TriajeModal
        open={triajeOpen}
        onClose={() => setTriajeOpen(false)}
        onGuardar={(form) => {
          console.info("[MonitorPage] Triaje guardado:", form)
          // TODO: llamar a POST /api/triaje con los datos del form
        }}
      /> */}
      {triajeOpen && (
        <Suspense fallback={null}>
          <Triage
            open={triajeOpen}
            mode={triajeModo}
            triageId={selectedTriageId}
            onClose={() => setTriajeOpen(false)}
            onGuardar={(form: TriajeForm) => {
              // El POST ya ocurrió dentro de Triage.tsx (createTriage) antes de llamar
              // a este callback; acá solo queda refrescar la data del monitor para que
              // el triaje recién guardado se refleje sin esperar al próximo auto-refetch.
              console.info("[MonitorPage] Triaje guardado:", form);
              refetchMonitor();
            }}
          />
        </Suspense>
      )}

      {/* Modal de Asignar Médico — trae su propia lista de pacientes candidatos (endpoints dedicados) */}
      <AsignarMedicoModal
        open={medicoOpen}
        onClose={() => setMedicoOpen(false)}
        onAsignar={({ encounterId, username }) => {
          console.info("[MonitorPage] Asignación médico:", {
            encounterId,
            username,
          });
          // TODO: llamar a POST /api/pacientes/medico con { encounter_id: encounterId, username }
          // y luego refetchMonitor() para reflejar el nuevo physician_name_display.
        }}
      />
      {/* Modal de Información Adicional */}
      <AditionalInfoModal
        open={infoOpen}
        onClose={() => setInfoOpen(false)}
        paciente={selectedPatient ?? undefined}
        onSaveChanges={handleSaveAdditionalInfo}
      />

      {/* Modal de Box */}
      <BoxModal
        open={boxModalOpen}
        onClose={() => setBoxModalOpen(false)}
        paciente={selectedBoxPatient ?? undefined}
        type={boxModalType}
        onSaved={async () => {
          refetchMonitor();
        }}
      />

      {/* Modal de Box - ESPERA */}
      <HceModal
        maxWidth={460}
        open={attentionWarningOpen}
        title={t("MonitorPage.attentionPendingTitle")}
        description={t("MonitorPage.attentionPendingDescription")}
        icon={<UiWarningIcon />}
        confirmButton={{
          label: t("BoxModal.accept"),
          onClick: () => setAttentionWarningOpen(false),
        }}
      />
    </>
  );
}
