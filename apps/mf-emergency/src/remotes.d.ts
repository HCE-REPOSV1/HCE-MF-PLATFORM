//─── Triage ──────────────────────────────────────────
declare module "triage/Triage" {
  import type { ComponentType } from "react";

  interface TriageProps {
    open: boolean = false;
    onClose: () => void;
    onGuardar: (form: TriajeForm) => void;
  }

  const Triage: ComponentType<any>;
  export default Triage;
}
