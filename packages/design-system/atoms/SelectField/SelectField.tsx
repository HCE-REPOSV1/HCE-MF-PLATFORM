import { Box, Typography, FormControl, Select, OutlinedInput, MenuItem } from "@mui/material"
import { baseColors } from "../../tokens/base.tokens"

interface Option {
  value: string
  label: string
}

interface Props {
  label:       string
  value:       string
  onChange:    (value: string) => void
  options:     Option[]
  placeholder?: string
  fullWidth?:  boolean
}

export function SelectField({
  label,
  value,
  onChange,
  options,
  placeholder = "-Seleccionar Opción-",
  fullWidth   = true,
}: Props) {
  return (
    <Box>
      <Typography component="label" sx={{
        fontSize:   "0.75rem",
        fontWeight: 600,
        color:      baseColors.textSecondary,
        mb:         0.5,
        display:    "block",
      }}>
        {label}
      </Typography>
      <FormControl fullWidth={fullWidth} size="small">
        <Select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          displayEmpty
          input={<OutlinedInput sx={{
            borderRadius:    "8px",
            backgroundColor: baseColors.surface,
            fontSize:        "0.875rem",
            "& fieldset":              { borderColor: baseColors.border },
            "&:hover fieldset":        { borderColor: baseColors.primary },
            "&.Mui-focused fieldset":  { borderColor: baseColors.primary },
          }} />}
          renderValue={(v) => (
            <Typography sx={{
              fontSize: "0.875rem",
              color:    v ? baseColors.textPrimary : baseColors.textSecondary,
            }}>
              {options.find(o => o.value === v)?.label ?? placeholder}
            </Typography>
          )}
        >
          {options.map((opt) => (
            <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>
          ))}
        </Select>
      </FormControl>
    </Box>
  )
}
