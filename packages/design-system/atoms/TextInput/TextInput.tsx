import { type ReactNode }     from "react"
import { Box, Typography, OutlinedInput, InputAdornment } from "@mui/material"
import { baseColors } from "../../tokens/base.tokens"

interface Props {
  label:       string
  value:       string
  onChange:    (value: string) => void
  placeholder?: string
  startIcon?:  ReactNode
  fullWidth?:  boolean
  type?:       string
  endAdornment?: ReactNode
}

export function TextInput({
  label,
  value,
  onChange,
  placeholder,
  startIcon,
  fullWidth = true,
  type = "text",
  endAdornment,
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
      <OutlinedInput
        fullWidth={fullWidth}
        size="small"
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        startAdornment={startIcon
          ? <InputAdornment position="start">{startIcon}</InputAdornment>
          : undefined
        }
        endAdornment={endAdornment}
        sx={{
          borderRadius:    "8px",
          backgroundColor: baseColors.surface,
          fontSize:        "0.875rem",
          "& fieldset":               { borderColor: baseColors.border },
          "&:hover fieldset":         { borderColor: baseColors.primary },
          "&.Mui-focused fieldset":   { borderColor: baseColors.primary },
        }}
      />
    </Box>
  )
}
