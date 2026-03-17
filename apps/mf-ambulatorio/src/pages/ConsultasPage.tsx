import { Box, Typography } from "@mui/material"

export default function ConsultasPage() {
  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h5" fontWeight={700} color="text.primary">
        Bienvenido
      </Typography>
      <Typography color="text.secondary" mt={1}>
        HCE Ambulatorio / Consultas
      </Typography>
    </Box>
  )
}
