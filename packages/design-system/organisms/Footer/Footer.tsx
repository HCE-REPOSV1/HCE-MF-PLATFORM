import { Box, Typography } from "@mui/material"
import { baseColors } from "../../tokens/base.tokens"

export function Footer() {
  const year = new Date().getFullYear()

  return (
    <Box
      component="footer"
      sx={{
        width:           "100%",
        py:              "6px",
        px:              3,
        backgroundColor: baseColors.primary,
        display:         "flex",
        alignItems:      "center",
        justifyContent:  "center",
        flexShrink:      0,
        gap:             1,
      }}
    >
      <Typography sx={{
        color:      "rgba(255,255,255,0.6)",
        fontSize:   "0.68rem",
        userSelect: "none",
      }}>
        © {year} Clínica XXXXXXX · Todos los derechos reservados · Sistema HCE v2.0
      </Typography>
    </Box>
  )
}
