// context/EditModeContext.tsx
import { createContext, useContext, useMemo, type ReactNode } from "react";
import { useUser } from "shell/UserContext";

interface EditModeContextValue {
  tabWriteCode: string;
  canEditField: (fieldCode: string) => boolean;
}

const EditModeContext = createContext<EditModeContextValue | undefined>(undefined);

interface EditModeProviderProps {
  /** Código de escritura del tab completo, ej: PERMISOS_CLINICAL_RECORD.diagnosis.write */
  tabWriteCode: string;
  children: ReactNode;
}

export const EditModeProvider = ({ tabWriteCode, children }: EditModeProviderProps) => {
  const { hasPermission } = useUser(); // función normal, no hook — se puede llamar dinámicamente

  const value = useMemo<EditModeContextValue>(() => {
    const canEditField = (fieldCode: string): boolean => {
      // El permiso específico del campo manda; si el usuario no lo tiene,
      // se apoya en el permiso de escritura general del tab.
      return hasPermission(fieldCode) || hasPermission(tabWriteCode);
    };

    return { tabWriteCode, canEditField };
  }, [tabWriteCode, hasPermission]);

  return <EditModeContext.Provider value={value}>{children}</EditModeContext.Provider>;
};

const useEditModeContext = (): EditModeContextValue => {
  const ctx = useContext(EditModeContext);

  if (!ctx) {
    if (import.meta.env.DEV) {
      console.warn(
        "[EditModeContext] usado sin EditModeProvider en el árbol — cae a modo lectura por defecto."
      );
    }
    return { tabWriteCode: "", canEditField: () => false };
  }

  return ctx;
};

/** Para campos individuales dentro de un tab (ej: PatientField de "Alergias") */
export const useFieldEditMode = (fieldCode: string): boolean => {
  const { canEditField } = useEditModeContext();
  return canEditField(fieldCode);
};

/** Para saber si el tab completo es editable en general (ej: mostrar candado en NavTab) */
export const useTabEditMode = (): boolean => {
  const { tabWriteCode, canEditField } = useEditModeContext();
  return canEditField(tabWriteCode);
};