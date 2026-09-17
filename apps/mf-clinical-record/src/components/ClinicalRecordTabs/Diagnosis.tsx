import { useCallback, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  AddCircleIcon,
  hceColors,
  IconButton,
  LoadingOverlay,
  RadioGroup,
  SearchComboInput,
  SegmentedToggle,
  UiTrashIcon,
  type SearchMode,
  type SearchOption,
} from "@hce/design-system";
import "./Diagnosis.css";
import {
  EditModeProvider,
  useFieldEditMode,
} from "../../context/EditModeContext";
import { PERMISSIONS_CLINICAL_RECORD } from "../../config/permissions";
import { useClinicalRecordForm } from "../../context/ClinicalRecordFormContext";
import { useUser } from "shell/UserContext";
import { useCatalog } from "../../hooks/useCatalog";
import { useDiagnosis } from "../../hooks/useDiagnosis";
import type { CatalogCie } from "../../types/Catalog.type";
import type {
  DiagnosisApiItem,
  DiagnosisClassification,
  DiagnosisDirection,
} from "../../types/Diagnosis.type";

interface DiagnosisProps {
  readOnly?: boolean;
  encounterId?: number;
}

export const Diagnosis = ({
  readOnly = false,
  encounterId,
}: DiagnosisProps) => {
  return (
    <EditModeProvider
      tabWriteCode={PERMISSIONS_CLINICAL_RECORD.diagnosis.write}
    >
      <DiagnosisContent readOnly={readOnly} encounterId={encounterId} />
    </EditModeProvider>
  );
};

// Indicador visual de clasificación (Presuntivo/Repetitivo/Definitivo) en la
// tabla de "Diagnóstico actuales" — es un estado de solo lectura (no hay
// endpoint documentado para cambiar la clasificación de un diagnóstico ya
// registrado), por eso NO se usa el átomo Checkbox interactivo del design
// system acá: se reutilizan sus mismos tokens de color para el mismo look,
// sin implicar que sea clickeable.
const StatusBox = ({ active }: { active: boolean }) => (
  <span
    className="hce-diagnosis__status-box"
    aria-hidden="true"
    style={{
      border: `2px solid var(--ds-color-secondary, ${hceColors.primary.green[500]})`,
      backgroundColor: active
        ? `var(--ds-color-secondary, ${hceColors.primary.green[500]})`
        : `var(--ds-color-secondary-light, ${hceColors.primary.green[300]})`,
    }}
  >
    {active && (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="#ffffff"
        strokeWidth={3}
        strokeLinecap="round"
        strokeLinejoin="round"
        width={18}
        height={18}
      >
        <polyline points="5 13 10 18 19 7" />
      </svg>
    )}
  </span>
);

export const DiagnosisContent = ({
  readOnly = false,
  encounterId,
}: DiagnosisProps) => {
  const { t } = useTranslation("clinical-record");
  const { user } = useUser();
  const canEdit = useFieldEditMode(PERMISSIONS_CLINICAL_RECORD.diagnosis.write);
  const canAdd = !readOnly && canEdit;

  const { hasFetched, markFetched } = useClinicalRecordForm();
  const { fetchCatalogCieSearch, loadingCatalogCie } = useCatalog();
  const {
    fetchDiagnosesByEncounter,
    loadingDiagnoses,
    addDiagnosis,
    creatingDiagnosis,
    deactivateDiagnosis,
    updatingStatusDiagnosisId,
  } = useDiagnosis();

  const [diagnoses, setDiagnoses] = useState<DiagnosisApiItem[]>([]);
  const [viewDirection, setViewDirection] =
    useState<DiagnosisDirection>("admission");

  const [direction, setDirection] = useState<DiagnosisDirection>("admission");
  const [classification, setClassification] =
    useState<DiagnosisClassification>("presumptive");
  const [searchMode, setSearchMode] = useState<SearchMode>("cie_description");
  const [searchText, setSearchText] = useState("");
  const [cieOptions, setCieOptions] = useState<SearchOption[]>([]);
  const [cieResults, setCieResults] = useState<CatalogCie[]>([]);
  const [selectedCie, setSelectedCie] = useState<CatalogCie | null>(null);
  const [addError, setAddError] = useState<string | null>(null);

  // Mismo patrón que en HistoryPhysicalExam (hasFetched/markFetched): un
  // encounter sin diagnósticos registrados todavía responde vacío
  // LEGÍTIMAMENTE — sin este guard separado de "hay dato", el efecto
  // reintentaría el fetch cada vez que se entra a esta pestaña.
  useEffect(() => {
    if (hasFetched("diagnosis.byEncounter")) return;
    if (encounterId === undefined) return;
    const validEncounterId = encounterId;
    const load = async () => {
      const data = await fetchDiagnosesByEncounter(validEncounterId);
      markFetched("diagnosis.byEncounter");
      setDiagnoses(data ?? []);
    };
    load();
  }, [encounterId]);

  const directionOptions = useMemo(
    () => [
      {
        value: "admission" as const,
        label: t("diagnosis.direction.admission"),
      },
      {
        value: "discharge" as const,
        label: t("diagnosis.direction.discharge"),
      },
    ],
    [t],
  );

  const classificationOptions = useMemo(
    () => [
      {
        value: "presumptive" as const,
        label: t("diagnosis.classification.presumptive"),
      },
      {
        value: "repetitive" as const,
        label: t("diagnosis.classification.repetitive"),
      },
      {
        value: "definitive" as const,
        label: t("diagnosis.classification.definitive"),
      },
    ],
    [t],
  );

  const cieSearchModes = useMemo(
    () => [
      { value: "cie_description", label: t("diagnosis.searchModes.byName") },
      { value: "cie_code", label: t("diagnosis.searchModes.byCode") },
    ],
    [t],
  );

  const handleCieSearch = useCallback(
    async (query: string, mode: SearchMode) => {
      const column: "cie_description" | "cie_code" =
        mode === "cie_code" ? "cie_code" : "cie_description";
      const results = await fetchCatalogCieSearch(query, column);
      setCieResults(results ?? []);
      setCieOptions(
        (results ?? []).map((item, index) => ({
          value: index,
          label: column === "cie_code" ? item.cie_code : item.cie_description,
          secondary:
            column === "cie_code" ? item.cie_description : item.cie_code,
        })),
      );
    },
    [fetchCatalogCieSearch],
  );

  const handleCieSelect = useCallback(
    (opt: SearchOption) => {
      const selected = cieResults[opt.value as number];
      if (!selected) return;
      setSelectedCie(selected);
      setSearchText(opt.label);
      setCieOptions([]);
    },
    [cieResults],
  );

  const handleSearchModeChange = useCallback((mode: SearchMode) => {
    setSearchMode(mode);
    setSelectedCie(null);
    setCieOptions([]);
  }, []);

  const isAddDisabled =
    !canAdd ||
    creatingDiagnosis ||
    !selectedCie ||
    encounterId === undefined ||
    !user?.username;

  const handleAddDiagnosis = useCallback(async () => {
    if (!selectedCie || encounterId === undefined || !user?.username) return;

    setAddError(null);
    const ok = await addDiagnosis({
      encounter_id: encounterId,
      cie_id: selectedCie.cie_id,
      diagnosis_type: direction,
      classification,
      user_create: user.username,
    });

    if (!ok) {
      setAddError(t("diagnosis.errors.createFailed"));
      return;
    }

    // El POST no documenta el diagnosis_id creado en su response — se
    // vuelve a pedir la lista completa para tener el id real (necesario
    // luego para el PATCH de "Eliminar"), en vez de asumir uno local.
    const refreshed = await fetchDiagnosesByEncounter(encounterId);
    setDiagnoses(refreshed ?? []);

    setSearchText("");
    setSelectedCie(null);
    setCieOptions([]);
    setClassification("presumptive");
  }, [
    selectedCie,
    encounterId,
    user,
    direction,
    classification,
    addDiagnosis,
    fetchDiagnosesByEncounter,
    t,
  ]);

  const handleDeleteDiagnosis = useCallback(
    async (row: DiagnosisApiItem) => {
      if (!user?.username) return;

      setAddError(null);
      const ok = await deactivateDiagnosis(row.diagnosis_id, user.username);
      if (!ok) {
        setAddError(t("diagnosis.errors.deleteFailed"));
        return;
      }

      setDiagnoses((prev) =>
        prev.filter((item) => item.diagnosis_id !== row.diagnosis_id),
      );
    },
    [user, deactivateDiagnosis, t],
  );

  const filteredRows = useMemo(
    () =>
      diagnoses.filter(
        (item) => item.is_active && item.diagnosis_type === viewDirection,
      ),
    [diagnoses, viewDirection],
  );

  return (
    <div className="hce-diagnosis">
      <LoadingOverlay
        open={loadingDiagnoses}
        message={"Cargando información..."}
      />

      {canAdd && (
        <div>
          <h3 className="hce-diagnosis__heading">
            {t("diagnosis.searchTitle")}
          </h3>
          <div className="hce-diagnosis__search-row">
            <RadioGroup
              value={direction}
              onChange={(v) => setDirection(v as DiagnosisDirection)}
              options={directionOptions}
              testId="clinical-record-diagnosis-direction-radio"
            />

            <div className="hce-diagnosis__search-field">
              <span className="hce-diagnosis__search-field-label">
                {t("diagnosis.searchLabel")}
              </span>
              <SearchComboInput
                searchMode={searchMode}
                onSearchModeChange={handleSearchModeChange}
                modes={cieSearchModes}
                value={searchText}
                onChange={(v) => {
                  setSearchText(v);
                  setSelectedCie(null);
                }}
                options={cieOptions}
                onSearch={handleCieSearch}
                onSelect={handleCieSelect}
                loading={loadingCatalogCie}
                placeholder={t("diagnosis.searchPlaceholder")}
                testId="clinical-record-diagnosis-search"
              />
            </div>

            <RadioGroup
              value={classification}
              onChange={(v) => setClassification(v as DiagnosisClassification)}
              options={classificationOptions}
              testId="clinical-record-diagnosis-classification-radio"
            />

            <IconButton
              icon={
                <AddCircleIcon
                  color={
                    isAddDisabled
                      ? hceColors.neutro.black[300]
                      : hceColors.primary.green[600]
                  }
                />
              }
              size="large"
              onClick={handleAddDiagnosis}
              disabled={isAddDisabled}
              testId="clinical-record-diagnosis-add-button"
            />
          </div>
          {addError && (
            <span
              style={{
                display: "block",
                marginTop: 8,
                fontSize: "0.8rem",
                color: hceColors.alert.error[600],
              }}
            >
              {addError}
            </span>
          )}
        </div>
      )}

      <div>
        <h3 className="hce-diagnosis__heading">
          {t("diagnosis.currentTitle")}
        </h3>

        <SegmentedToggle<DiagnosisDirection>
          options={[
            {
              label: t("diagnosis.direction.admission"),
              value: "admission",
            },
            {
              label: t("diagnosis.direction.discharge"),
              value: "discharge",
            },
          ]}
          value={viewDirection}
          onChange={setViewDirection}
          testId="clinical-record-diagnosis-view-direction-toggle"
        />

        <div className="hce-diagnosis__table-wrap" style={{ marginTop: 12 }}>
          <table className="hce-diagnosis-table">
            <thead>
              <tr>
                <th>{t("diagnosis.table.cieCode")}</th>
                <th>{t("diagnosis.table.description")}</th>
                <th>{t("diagnosis.table.presumptive")}</th>
                <th>{t("diagnosis.table.repetitive")}</th>
                <th>{t("diagnosis.table.definitive")}</th>
                <th>{t("diagnosis.table.delete")}</th>
              </tr>
            </thead>
            <tbody>
              {filteredRows.length === 0 ? (
                <tr>
                  <td colSpan={6} className="hce-diagnosis-table__empty">
                    {t("diagnosis.emptyMessage")}
                  </td>
                </tr>
              ) : (
                filteredRows.map((row) => (
                  <tr key={row.diagnosis_id}>
                    <td>{row.cie_code}</td>
                    <td>{row.cie_description}</td>
                    <td>
                      <StatusBox
                        active={row.classification === "presumptive"}
                      />
                    </td>
                    <td>
                      <StatusBox active={row.classification === "repetitive"} />
                    </td>
                    <td>
                      <StatusBox active={row.classification === "definitive"} />
                    </td>
                    <td>
                      {canAdd ? (
                        <button
                          type="button"
                          className="hce-diagnosis__delete-btn"
                          style={{
                            backgroundColor: hceColors.alert.error[600],
                          }}
                          onClick={() => handleDeleteDiagnosis(row)}
                          disabled={
                            updatingStatusDiagnosisId === row.diagnosis_id
                          }
                          aria-label={t("diagnosis.table.delete")}
                          data-testid={`clinical-record-diagnosis-delete-${row.diagnosis_id}`}
                        >
                          <UiTrashIcon color="#ffffff" size={16} />
                        </button>
                      ) : (
                        "-"
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
