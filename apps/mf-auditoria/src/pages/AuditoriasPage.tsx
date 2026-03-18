import { Box, Typography } from "@jarvis/design-system"

export default function AuditoriasPage() {
  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h5" fontWeight={700} color="text.primary">
        Bienvenido
      </Typography>
      <Typography color="text.secondary" mt={1}>
        Auditoría Médica / Auditorías
      </Typography>
    </Box>
  )
}
