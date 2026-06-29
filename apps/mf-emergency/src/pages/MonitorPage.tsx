import { useState, useCallback, lazy, Suspense } from "react";
import {
  Box,
  hceClinicalColors,
  hceSpacing,
  hceBorderRadius,
  hceShadows,
  MonitoActionBar,
  EmergencyPagination,
  BedAvailabilityDrawer,
} from "@hce/design-system";
import { MOCK_PATIENTS, PAGE_SIZE } from "../mock/patients.mock";
// import { TriajeModal } from "../components/TriajeModal";
import { AsignarMedicoModal } from "../components/AsignarMedicoModal";
import type { PatientRowData, GenericTableColumn } from "@hce/design-system";
import type { Medico } from "../mock/medicos.mock";
import type { TriajeForm } from "triage/Triage";
import {GenericTable} from "@hce/design-system"




const MONITOR_DSK_COLUMNS: GenericTableColumn<PatientRowData>[]  = [
  {
    key: "priority",
    header: "Prioridad",
    type: "priority",
    field: "priority",
    width: 70,
    align: "center",
    clickable: true,
  },
  {
    key: "box",
    header: "Box",
    type: "box",
    field: "box",
    width: 80,
    align: "center",
    clickable: true,
  },
  {
    key: "document",
    header: "N.Documento",
    type: "text",
    field: "document",
    width: 100,
    align: "left",
  },
  {
    key: "patient",
    header: "Paciente",
    type: "patient-name",
    field: "patient.name",
    width: 180,
    align: "left",
    clickable: true,
    cellSx: {
      padding: "0 12px",
    },
  },
  {
    key: "age",
    header: "Edad",
    type: "text",
    field: "age",
    width: 55,
    align: "center",
  },
  {
    key: "sex",
    header: "Sexo",
    type: "text",
    field: "sex",
    width: 55,
    align: "center",
  },
  {
    key: "doctor",
    header: "Médico",
    type: "doctor",
    field: "doctor",
    width: 160,
    align: "left",
  },
  {
    key: "lab",
    header: "Lab",
    type: "clinical-status",
    field: "lab",
    clinicalIcon: "lab",
    width: 50,
    align: "center",
  },
  {
    key: "img",
    header: "Img",
    type: "clinical-status",
    field: "img",
    clinicalIcon: "img",
    width: 50,
    align: "center",
  },
  {
    key: "indication",
    header: "Indc. Med.",
    type: "clinical-status",
    field: "indication",
    clinicalIcon: "indication",
    width: 50,
    align: "center",
  },
  {
    key: "interconsult",
    header: "Interc.",
    type: "clinical-status",
    field: "interconsult",
    clinicalIcon: "interconsult",
    width: 50,
    align: "center",
  },
  {
    key: "attentionCode",
    header: "Atención",
    type: "attention-code",
    field: "attentionCode",
    width: 90,
    align: "left",
  },
  {
    key: "info",
    header: "Info",
    type: "info-button",
    width: 50,
    align: "center",
  },
]

const Triage = lazy(() => import("triage/Triage"));

export default function MonitorPage() {
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(
    null,
  );
  const [triajeOpen, setTriajeOpen] = useState(false);
  const [medicoOpen, setMedicoOpen] = useState(false);

  const totalPages = Math.ceil(MOCK_PATIENTS.length / PAGE_SIZE);

  const paginatedRows: PatientRowData[] = MOCK_PATIENTS.slice(
  (currentPage - 1) * PAGE_SIZE,
  currentPage * PAGE_SIZE,
);



  const handlePatientClick = useCallback((row: PatientRowData) => {
    setSelectedPatientId((prev) => (prev === row.id ? null : row.id));
  }, []);

  const handlePriorityClick = useCallback((row: PatientRowData) => {
    console.info("[MonitorPage] Abrir triaje solo lectura:", row);
  }, []);

  const handleBoxClick = useCallback((row: PatientRowData) => {
    const stage = row.box.stage;

    if (stage === "WAITING") {
      console.info(
        "[MonitorPage] Paciente aún no cuenta con atención. Comunicarse con el counter de emergencia.",
        row,
      );
      return;
    }

    if (stage === "SALA_D") {
      console.info("[MonitorPage] Abrir asignación de BOX:", row);
      return;
    }

    console.info("[MonitorPage] Abrir cambio de BOX:", row);
  }, []);

  const handleInfo = useCallback((row: PatientRowData) => {
    console.info("[MonitorPage] Info del paciente:", row);
  }, []);

  return (
    <>
      <Box
        sx={{
          inset: 0,
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
              onTriaje={() => setTriajeOpen(true)}
              onAsignarMedicos={() => setMedicoOpen(true)}
              onReportes={() => console.info("[MonitorPage] Reportes")}
              onDisponibilidad={() =>
                console.info("[MonitorPage] Disponibilidad de camas")
              }
            />
          </Box>

          <Box sx={{ flex: 1, overflow: "hidden", minHeight: 0 }}>
            <GenericTable
                  rows={paginatedRows}
                  columns={MONITOR_DSK_COLUMNS}
                  getRowId={(row) => row.id}
                  onPatientClick={handlePatientClick}
                  onPriorityClick={handlePriorityClick}
                  onBoxClick={handleBoxClick}
                  onInfo={handleInfo}
                />
            {/* <EmergencyPatientTable rows={paginatedRows} header={HEADER_COLUMNS} /> */}
          </Box>

          <Box
            sx={{
              flexShrink: 0,
              backgroundColor: hceClinicalColors.surfaceBg,
              borderRadius: hceBorderRadius.lg,
              boxShadow: hceShadows.card,
              border: `1px solid ${hceClinicalColors.border}`,
            }}
          >
            <EmergencyPagination
              totalItems={MOCK_PATIENTS.length}
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={(page) => {
                setCurrentPage(page);
                setSelectedPatientId(null);
              }}
            />
          </Box>
        </Box>
      </Box>

      <BedAvailabilityDrawer />

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
            onClose={() => setTriajeOpen(false)}
            onGuardar={(form:TriajeForm) => {
              console.info("[MonitorPage] Triaje guardado:", form);
              // TODO: llamar a POST /api/triaje con los datos del form
            }}
          />
        </Suspense>
      )}

      {/* Modal de Asignar Médico */}
      <AsignarMedicoModal
        open={medicoOpen}
        onClose={() => setMedicoOpen(false)}
        paciente={
          selectedPatientId
            ? MOCK_PATIENTS.find((p) => p.id === selectedPatientId)?.patient
                .name
            : undefined
        }
        onAsignar={(medico: Medico) => {
          console.info("[MonitorPage] Médico asignado:", medico);
          // TODO: llamar a POST /api/pacientes/{selectedPatientId}/medico con medico.id
        }}
      />
    </>
  );
}
