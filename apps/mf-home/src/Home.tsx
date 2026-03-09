import { DataTable, Pagination } from "@jarvis/design-system/"
import { Typography, Box } from "@mui/material"
import DashboardLayout from "./layouts/DashboardLayout"

const columns = [
  { field: "patient", header: "Paciente" },
  { field: "age", header: "Edad" },
  { field: "doctor", header: "Doctor" }
]

const rows = [
  { patient: "Henry Vidal", age: "30", doctor: "Adulto" },
  { patient: "Juan Perez", age: "45", doctor: "Pediatría" }
]

export default function Home() {
  return (
   <DashboardLayout>

      <Typography variant="h4" sx={{ mb: 4 }}>
        Monitor de Emergencia
      </Typography>

      <Box sx={{ width: "100%" }}>
        <DataTable columns={columns} rows={rows} />
      </Box>

      <Box sx={{ mt: 3 }}>
        <Pagination page={1} total={10} onChange={() => {}} />
      </Box>

    </DashboardLayout>
  )
}