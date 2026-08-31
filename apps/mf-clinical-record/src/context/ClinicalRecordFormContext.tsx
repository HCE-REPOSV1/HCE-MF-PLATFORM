// ClinicalRecordFormContext.tsx
import { createContext, useContext, useRef, useCallback, useState } from 'react';

type TabId = string;

interface ClinicalRecordFormContextValue {
  registerTabData: (tabId: TabId, data: unknown) => void;
  getTabData: (tabId: TabId) => unknown;
  getAllData: () => Record<TabId, unknown>;
  isTabDirty: (tabId: TabId) => boolean;
  dirtyTabs: Set<TabId>;
}

const ClinicalRecordFormContext = createContext<ClinicalRecordFormContextValue | null>(null);

export function ClinicalRecordFormProvider({ children }: { children: React.ReactNode }) {
  // useRef para no re-renderizar todo el árbol en cada tecla
  const dataRef = useRef<Record<TabId, unknown>>({});
  const [dirtyTabs, setDirtyTabs] = useState<Set<TabId>>(new Set());

  const registerTabData = useCallback((tabId: TabId, data: unknown) => {
    dataRef.current[tabId] = data;
    setDirtyTabs(prev => new Set(prev).add(tabId));
  }, []);

  const getTabData = useCallback((tabId: TabId) => dataRef.current[tabId], []);
  const getAllData = useCallback(() => dataRef.current, []);
  const isTabDirty = useCallback((tabId: TabId) => dirtyTabs.has(tabId), [dirtyTabs]);

  return (
    <ClinicalRecordFormContext.Provider
      value={{ registerTabData, getTabData, getAllData, isTabDirty, dirtyTabs }}
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