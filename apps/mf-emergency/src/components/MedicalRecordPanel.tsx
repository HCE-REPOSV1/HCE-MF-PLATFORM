import { NavTab, NavTabPanel, type NavTabItem } from "@hce/design-system";
import { Box } from "@mui/material";
import { useState } from "react";

export function MedicalRecordPanel({}) {
  const tabs: NavTabItem[] = [
    { label: "Anamnesis y EF", value: "tab_01", disabled: true },
    { label: "Diagnóstico", value: "tab_02" },
    { label: "Indicaciones médicas", value: "tab_03", disabled: true },
    { label: "Kardex de enfermería", value: "tab_04", disabled: true },
    { label: "Laboratorio", value: "tab_05", disabled: true },
    { label: "Imágenes", value: "tab_06", disabled: true },
    { label: "Interconsulta", value: "tab_07", disabled: true },
    { label: "Procedimientos Médicos", value: "tab_08", disabled: true },
    { label: "Evolución", value: "tab_09", disabled: true },
    { label: "Nota de enfermería", value: "tab_10", disabled: true },
  ];
  const [tab, setTab] = useState("tab_02");

  const handleChange = (newValue: string) => {
    setTab(newValue);
  };
  return (
    <Box>
      <NavTab tabs={tabs} value={tab} onChange={handleChange} />
      <NavTabPanel value="tab_02" currentValue={tab}>
        <Box >

        </Box>
      </NavTabPanel>
    </Box>
  );
}
