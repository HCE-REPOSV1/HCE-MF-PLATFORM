import { Box } from "@mui/material"
import type { ReactNode } from "react"

interface Props {
  children: ReactNode
}
export default function DashboardLayout({ children }: Props) {
  return (
    <Box
      sx={{
        minHeight: "100vh",
        width: "100%",
        display: "flex",
        flexDirection: "column"
      }}
    >

        {/* Content */}
        <Box
          sx={{
            flex: 1,
            padding: 4,
            width: "100%"
          }}
        >
          {children}
        </Box>

      </Box>

    
  )
}