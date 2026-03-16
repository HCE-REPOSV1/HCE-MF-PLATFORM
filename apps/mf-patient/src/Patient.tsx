import { MOCK_PATIENTS, } from "./mock/patients.mock"
import { PatientTable }from "@design-system/molecules/PatientTable/PatientTable"
import type { PatientRowData } from "@design-system/molecules/PatientRow/PatientRow"
export default function Patient(){
    const paginatedRows: PatientRowData[] = MOCK_PATIENTS
    interface HeaderColumn {
        label: string
        width: number
        align: "center" | "left"
    }
    const HEADER_COLUMNS: HeaderColumn[] = [
        { label: "Prioridad",  width: 70,  align: "center" },
        { label: "Box",        width: 80,  align: "center" },
        { label: "Paciente",   width: 180, align: "left"   },
        { label: "Edad",       width: 55,  align: "center" },
        { label: "Sexo",       width: 55,  align: "center" },
        { label: "N.Documento",width: 100, align: "left"   },
        { label: "Médico",     width: 160, align: "left"   },
        { label: "Lab",        width: 50,  align: "center" },
        { label: "Img",        width: 50,  align: "center" },
        { label: "Indc.Med",   width: 50,  align: "center" },
        { label: "Interc.",    width: 50,  align: "center" },
        { label: "Atención",   width: 90,  align: "left"   },
        { label: "Info",       width: 50,  align: "center" },
    ]
 return (<PatientTable
              rows={paginatedRows}
              maxHeight="100%"
              header={HEADER_COLUMNS}
            />      )
}