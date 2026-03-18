import { Box, Typography } from "@jarvis/design-system"

export default function InternadosPage() {
  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h5" fontWeight={700} color="text.primary">
        Bienvenido
      </Typography>
      <Typography color="text.secondary" mt={1}>
        HCE Hospital / Internados
      </Typography>
    </Box>
  )
}
