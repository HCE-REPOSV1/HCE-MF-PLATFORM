// ClinicalRecordFormContext.tsx
import {
  createContext,
  useContext,
  useRef,
  useCallback,
  useState,
} from "react";

type TabId = string;

interface ClinicalRecordFormContextValue {
  /** Marca el tab como "sucio" (con cambios sin guardar) — usar SOLO cuando
   * el dato cambia por edición real del usuario. */
  registerTabData: (tabId: TabId, data: unknown) => void;
  /** Igual que registerTabData pero NUNCA marca dirty — usar para hidratar
   * datos que llegan del backend (carga inicial), que no son "cambios sin
   * guardar" del usuario. Sin esto, abrir un tab con datos ya guardados lo
   * deja marcado como sucio de entrada (bug real, ver ClinicalRecordTabs). */
  hydrateTabData: (tabId: TabId, data: unknown) => void;
  getTabData: (tabId: TabId) => unknown;
  getAllData: () => Record<TabId, unknown>;
  isTabDirty: (tabId: TabId) => boolean;
  dirtyTabs: Set<TabId>;
  /** Limpia del set de dirty todo tabId cuyo prefijo (antes del primer ".")
   * coincida con alguno de tabPrefixes — se llama tras un guardado exitoso
   * de ese grupo. Ej: clearDirtyTabs(["historyPhysicalExam"]) limpia
   * "historyPhysicalExam.anamnesis", "historyPhysicalExam.physicalExam", etc. */
  clearDirtyTabs: (tabPrefixes: string[]) => void;
  /** Tab activo del ClinicalRecordTabs — vive acá (no local a ese
   * componente) para que SaveButton, hermano de ClinicalRecordTabs en el
   * árbol, pueda saber cuál está activo. */
  activeTab: string;
  setActiveTab: (tabId: string) => void;
  /** ¿Ya se intentó cargar este fetchId desde el backend (haya devuelto
   * datos o no)? Distinto de "hay dato" (getTabData) — un encounter sin
   * anamnesis/examen físico registrado todavía responde vacío/null
   * legítimamente, y sin este tracking separado el guard de los efectos de
   * carga ("if (savedX) return") nunca se cumple, así que se reintenta el
   * fetch cada vez que se remonta el tab (cada vez que se entra a esa
   * sección) — bug real reportado en QA. Usar un fetchId propio, no
   * necesariamente el mismo tabId de los datos (ej. un solo fetch que
   * hidrata 3 claves distintas puede compartir un solo fetchId). */
  hasFetched: (fetchId: string) => boolean;
  markFetched: (fetchId: string) => void;
}

const ClinicalRecordFormContext =
  createContext<ClinicalRecordFormContextValue | null>(null);

const DEFAULT_ACTIVE_TAB = "history-physical-exam";

export function ClinicalRecordFormProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  // useRef para no re-renderizar todo el árbol en cada tecla
  const dataRef = useRef<Record<TabId, unknown>>({});
  const [dirtyTabs, setDirtyTabs] = useState<Set<TabId>>(new Set());
  const [activeTab, setActiveTab] = useState<string>(DEFAULT_ACTIVE_TAB);
  // No necesita ser reactivo (useState) — solo se lee/escribe dentro de
  // efectos, nunca condiciona directamente qué se renderiza.
  const fetchedRef = useRef<Set<string>>(new Set());

  const registerTabData = useCallback((tabId: TabId, data: unknown) => {
    dataRef.current[tabId] = data;
    setDirtyTabs((prev) => new Set(prev).add(tabId));
  }, []);

  const hydrateTabData = useCallback((tabId: TabId, data: unknown) => {
    dataRef.current[tabId] = data;
  }, []);

  const getTabData = useCallback((tabId: TabId) => dataRef.current[tabId], []);
  const getAllData = useCallback(() => dataRef.current, []);
  const isTabDirty = useCallback(
    (tabId: TabId) => dirtyTabs.has(tabId),
    [dirtyTabs],
  );

  const hasFetched = useCallback(
    (fetchId: string) => fetchedRef.current.has(fetchId),
    [],
  );
  const markFetched = useCallback((fetchId: string) => {
    fetchedRef.current.add(fetchId);
  }, []);

  const clearDirtyTabs = useCallback((tabPrefixes: string[]) => {
    setDirtyTabs((prev) => {
      const next = new Set(prev);
      for (const tabId of prev) {
        const prefix = tabId.split(".")[0];
        if (tabPrefixes.includes(prefix)) next.delete(tabId);
      }
      return next;
    });
  }, []);

  return (
    <ClinicalRecordFormContext.Provider
      value={{
        registerTabData,
        hydrateTabData,
        getTabData,
        getAllData,
        isTabDirty,
        dirtyTabs,
        clearDirtyTabs,
        activeTab,
        setActiveTab,
        hasFetched,
        markFetched,
      }}
    >
      {children}
    </ClinicalRecordFormContext.Provider>
  );
}

export function useClinicalRecordForm() {
  const ctx = useContext(ClinicalRecordFormContext);
  if (!ctx)
    throw new Error(
      "useClinicalRecordForm debe usarse dentro de ClinicalRecordFormProvider",
    );
  return ctx;
}
