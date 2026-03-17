import { Box, Typography } from "@mui/material"

export default function ReportsPage() {
  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h5" fontWeight={700} color="text.primary">
        Bienvenido
      </Typography>
      <Typography color="text.secondary" mt={1}>
        HCE Ambulatorio / Reportes
      </Typography>
    </Box>
  )
}
