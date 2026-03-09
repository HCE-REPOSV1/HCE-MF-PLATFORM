import type { ReactNode } from "react"
import { Box } from "@mui/material"

interface Props {
  children: ReactNode
}

export default function MainLayout({ children }: Props) {
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        minHeight: "100vh",
        width: "100%",
        background: "#f5f6fa"
      }}
    >
      {children}
    </Box>
  )
}