
import {

  hceTypography,
  Box,
  Typography
} from "@hce/design-system"

import type {
  PatientFieldProps,
} from "../../types/clinical.record.types"

const labelSx = {
  fontFamily: hceTypography.fontFamily,
  fontSize: "0.625rem",
  fontWeight: 700,
  color:"var(--ds-color-primary, #0043a5)",
  mb: 0.5,
}

const valueSx = {
  fontFamily: hceTypography.fontFamily,
  fontSize: "0.875rem",
  fontWeight: 400,
  color:"var(--ds-color-primary, #0043a5)",
 // overflowWrap: "anywhere",
}

export function PatientField({
  label,
  value,
  align = "left",
}: PatientFieldProps) {
  return (
    <Box
      sx={{
        minWidth: 0,
        textAlign: align,
      }}
    >
      <Typography sx={labelSx}>
        {label}
      </Typography>

      <Typography sx={valueSx}>
        {value || "-"}
      </Typography>
    </Box>
  )
}