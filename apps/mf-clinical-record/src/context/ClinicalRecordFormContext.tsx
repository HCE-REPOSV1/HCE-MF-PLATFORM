// ClinicalRecordFormContext.tsx
import { createContext, useContext, useRef, useCallback, useState } from 'react';

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
}

const ClinicalRecordFormContext = createContext<ClinicalRecordFormContextValue | null>(null);

const DEFAULT_ACTIVE_TAB = 'history-physical-exam';

export function ClinicalRecordFormProvider({ children }: { children: React.ReactNode }) {
  // useRef para no re-renderizar todo el árbol en cada tecla
  const dataRef = useRef<Record<TabId, unknown>>({});
  const [dirtyTabs, setDirtyTabs] = useState<Set<TabId>>(new Set());
  const [activeTab, setActiveTab] = useState<string>(DEFAULT_ACTIVE_TAB);

  const registerTabData = useCallback((tabId: TabId, data: unknown) => {
    dataRef.current[tabId] = data;
    setDirtyTabs(prev => new Set(prev).add(tabId));
  }, []);

  const hydrateTabData = useCallback((tabId: TabId, data: unknown) => {
    dataRef.current[tabId] = data;
  }, []);

  const getTabData = useCallback((tabId: TabId) => dataRef.current[tabId], []);
  const getAllData = useCallback(() => dataRef.current, []);
  const isTabDirty = useCallback((tabId: TabId) => dirtyTabs.has(tabId), [dirtyTabs]);

  const clearDirtyTabs = useCallback((tabPrefixes: string[]) => {
    setDirtyTabs(prev => {
      const next = new Set(prev);
      for (const tabId of prev) {
        const prefix = tabId.split('.')[0];
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
      }}
    >
      {children}
    </ClinicalRecordFormContext.Provider>
  );
}

export function useClinicalRecordForm() {
  const ctx = useContext(ClinicalRecordFormContext);
  if (!ctx) throw new Error('useClinicalRecordForm debe usarse dentro de ClinicalRecordFormProvider');
  return ctx;
}