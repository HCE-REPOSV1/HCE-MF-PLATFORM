import { Box, Typography } from "@hce/design-system"

export default function DashboardPage() {
  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h5" fontWeight={700} color="text.primary">
        Bienvenido
      </Typography>
      <Typography color="text.secondary" mt={1}>
        Auditoría Médica / Dashboard
      </Typography>
    </Box>
  )
}
