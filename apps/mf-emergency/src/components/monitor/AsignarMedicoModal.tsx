import { useEffect, useState } from "react";
import {
  HceFormModal,
  HceModal,
  SelectField,
  hceColors,
  hceTypography,
  RadioGroup,
  UiCheckedIcon,
  UiWarningIcon,
  Box,
  Typography,
} from "@hce/design-system";
import { useUser } from "shell/UserContext";
import { useSedeUuid } from "../../hooks/useSedeUuid";
import {
  getAssignmentCandidates,
  getReassignmentCandidates,
  assignPractitioner,
  HttpError,
  type AssignmentCandidate,
} from "../../services/practitionerAssignment.service";
import { useEmergencyNamespaceReady } from "../../i18n";
import { useTranslation } from "@hce/i18n-core";

// ─── Props ────────────────────────────────────────────────────────────────────

export interface AsignarMedicoModalProps {
  open: boolean;
  onClose: () => void;
  /** Callback al confirmar (ya asignado/reasignado en backend) — usar para refetchear el monitor. */
  onAsignar: (payload: { encounterId: number; username: string }) => void;
}

// ─── Componente ───────────────────────────────────────────────────────────────

export function AsignarMedicoModal({
  open,
  onClose,
  onAsignar,
}: AsignarMedicoModalProps) {
  const namespaceReady = useEmergencyNamespaceReady();
  const { t } = useTranslation("emergency");
  const { user } = useUser();
  const sedeUuid = useSedeUuid();

  const [encounterId, setEncounterId] = useState("");
  const [modo, setModo] = useState(true);

  const [candidatosAsignar, setCandidatosAsignar] = useState<
    AssignmentCandidate[]
  >([]);
  const [candidatosReasignar, setCandidatosReasignar] = useState<
    AssignmentCandidate[]
  >([]);

  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);
  const [mostrarExito, setMostrarExito] = useState(false);
  const [sinPermiso, setSinPermiso] = useState(false);

  // Cada apertura arranca siempre en modo "Asignar" y limpia estado de intentos previos.
  useEffect(() => {
    if (open) {
      setModo(true);
      setEncounterId("");
      setError(null);
      setMostrarExito(false);
      setSinPermiso(false);
    }
  }, [open]);

  // Carga ambas listas (asignar/reasignar) en paralelo al abrir — cambiar de modo
  // después no requiere un nuevo fetch, el toggle es instantáneo.
  useEffect(() => {
    if (!open || !sedeUuid) return;

    const currentSedeUuid = sedeUuid;
    let cancelled = false;

    async function cargarCandidatos() {
      setCargando(true);
      setError(null);
      setEncounterId("");

      try {
        const [asignacion, reasignacion] = await Promise.all([
          getAssignmentCandidates(currentSedeUuid),
          getReassignmentCandidates(currentSedeUuid),
        ]);

        if (cancelled) return;

        setCandidatosAsignar(asignacion);
        setCandidatosReasignar(reasignacion);
      } catch (err: unknown) {
        if (cancelled) return;

        setCandidatosAsignar([]);
        setCandidatosReasignar([]);
        setError(err instanceof Error ? err.message : String(err));
      } finally {
        if (!cancelled) setCargando(false);
      }
    }

    cargarCandidatos();

    return () => {
      cancelled = true;
    };
  }, [open, sedeUuid]);

  const handleModoChange = (value: boolean | string) => {
    const nuevoModo = value === true || value === "true";
    if (nuevoModo === modo) return;

    setEncounterId("");
    setError(null);
    setModo(nuevoModo);
  };

  const candidatos = modo ? candidatosAsignar : candidatosReasignar;

  const selectOptions = candidatos.map((paciente) => ({
    value: String(paciente.encounter_id),
    label: paciente.patient_name,
  }));

  // Solo tiene sentido en modo Reasignar: muestra quién es el médico ya asignado
  // al paciente elegido.
  const candidatoSeleccionado = !modo
    ? candidatosReasignar.find(
        (paciente) => String(paciente.encounter_id) === encounterId,
      )
    : undefined;

  async function handleConfirmar() {
    if (!encounterId || !user?.username) return;
    setEnviando(true);
    setError(null);
    try {
      await assignPractitioner(Number(encounterId), {
        ad_username: user.username,
        user_modify: user.username,
      });
      setMostrarExito(true);
    } catch (err: unknown) {
      // 404 = practitioner no encontrado / no registrado como médico (is_physician) — ver
      // PractitionerLookupTypeOrmRepository en ms-bs-core-encounter.
      if (err instanceof HttpError && err.status === 404) {
        setSinPermiso(true);
      } else {
        setError(err instanceof Error ? err.message : String(err));
      }
    } finally {
      setEnviando(false);
    }
  }

  function handleAceptarExito() {
    setMostrarExito(false);
    if (encounterId && user?.username) {
      onAsignar({ encounterId: Number(encounterId), username: user.username });
    }
    onClose();
  }

  const formVisible = !mostrarExito && !sinPermiso;

  const action = modo
    ? t("AsignarMedicoModal.actionAssigned")
    : t("AsignarMedicoModal.actionReassigned");

  const OPTIONS = [
    { value: true, label: t("AsignarMedicoModal.assign") },
    { value: false, label: t("AsignarMedicoModal.reassign") },
  ];

  if (!namespaceReady) {
    return (
      <Box sx={{ p: 4, display: "flex", justifyContent: "center" }}>
        Cargando...
      </Box>
    );
  }

  return (
    <>
      {formVisible && (
        <HceFormModal
          open={open}
          onClose={onClose}
          title={t("AsignarMedicoModal.title")}
          borderNone={true}
          iconClose={false}
          maxWidth={400}
          primaryButton={{
            label: enviando
              ? modo
                ? t("AsignarMedicoModal.assigning")
                : t("AsignarMedicoModal.reassigning")
              : modo
                ? t("AsignarMedicoModal.assign")
                : t("AsignarMedicoModal.reassign"),
            onClick: handleConfirmar,
            color: "var(--ds-color-interactive-button , #0043a5)",
            disabled: !encounterId || cargando || enviando,
          }}
          secondaryButton={{
            label: t("AsignarMedicoModal.cancel"),
            onClick: onClose,
            color: "var(--ds-color-interactive, #0043a5)",
          }}
          buttonAlign="center"
          testId="mf-emergency-assign-doctor-modal"
        >
          {/* El HceModal acepta children opcionales — aquí metemos el select */}
          <Box sx={{ textAlign: "left", mt: 1 }}>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "10px",
                margin: "0 20px",
              }}
            >
              <RadioGroup
                legend={t("AsignarMedicoModal.assignmentTypeLegend")}
                options={OPTIONS}
                value={modo}
                onChange={handleModoChange}
                disabled={cargando || enviando}
                testId="mf-emergency-assign-doctor-mode"
              />

              <SelectField
                label={t("AsignarMedicoModal.patientListLabel")}
                value={encounterId}
                onChange={setEncounterId}
                options={selectOptions}
                placeholder={
                  cargando
                    ? t("AsignarMedicoModal.loadingPatientsPlaceholder")
                    : selectOptions.length === 0
                      ? t("AsignarMedicoModal.noPatientsPlaceholder")
                      : t("AsignarMedicoModal.selectPatientPlaceholder")
                }
                disabled={cargando || selectOptions.length === 0}
                menuMaxHeight={280}
                testId="mf-emergency-assign-doctor-patient"
              />

              {candidatoSeleccionado && (
                <Typography
                  sx={{
                    fontFamily: hceTypography.fontFamily,
                    fontSize: "0.8rem",
                    color: hceColors.neutro.black[400],
                  }}
                >
                  {t("AsignarMedicoModal.currentPhysicianLabel")}{" "}
                  <strong>{candidatoSeleccionado.practitioner_name}</strong>
                </Typography>
              )}

              {error && (
                <Typography
                  sx={{
                    fontFamily: hceTypography.fontFamily,
                    fontSize: "0.8rem",
                    color: hceColors.alert.error[600],
                  }}
                >
                  {error}
                </Typography>
              )}
            </div>
          </Box>
        </HceFormModal>
      )}

      {/* Éxito — un solo botón, cierra todo y recarga la grilla (via onAsignar). */}

      <HceModal
        maxWidth={400}
        open={mostrarExito}
        title={t("AsignarMedicoModal.successTitle", { action: action })} //{`Paciente ${modo ? "asignado" : "reasignado"} correctamente`}
        icon={<UiCheckedIcon />}
        confirmButton={{
          label: t("AsignarMedicoModal.accept"),
          onClick: handleAceptarExito,
        }}
        testId="mf-emergency-assign-doctor-success-modal"
      />

      {/* Sin permisos — el usuario logueado no está registrado como médico (is_physician). */}
      <HceModal
        maxWidth={400}
        open={sinPermiso}
        title={t("AsignarMedicoModal.noPermissionTitle")}
        description={t("AsignarMedicoModal.noPermissionDescription")}
        icon={<UiWarningIcon />}
        confirmButton={{
          label: "Aceptar",
          onClick: () => setSinPermiso(false),
        }}
        testId="mf-emergency-assign-doctor-no-permission-modal"
      />
    </>
  );
}
