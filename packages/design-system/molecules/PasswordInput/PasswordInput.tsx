import { useState }                       from "react"
import { InputAdornment, IconButton }      from "@mui/material"
import VisibilityOutlinedIcon             from "@mui/icons-material/VisibilityOutlined"
import VisibilityOffOutlinedIcon          from "@mui/icons-material/VisibilityOffOutlined"
import { TextInput }                       from "../../atoms/TextInput/TextInput"
import { baseColors }                      from "../../tokens/base.tokens"
import type { ReactNode }                  from "react"

interface Props {
  label:        string
  value:        string
  onChange:     (value: string) => void
  placeholder?: string
  startIcon?:   ReactNode
  fullWidth?:   boolean
}

export function PasswordInput({
  label,
  value,
  onChange,
  placeholder,
  startIcon,
  fullWidth = true,
}: Props) {
  const [show, setShow] = useState(false)

  const eyeButton = (
    <InputAdornment position="end">
      <IconButton
        onClick={() => setShow((v) => !v)}
        edge="end"
        size="small"
        sx={{ color: baseColors.textSecondary }}
      >
        {show
          ? <VisibilityOffOutlinedIcon sx={{ fontSize: 20 }} />
          : <VisibilityOutlinedIcon   sx={{ fontSize: 20 }} />
        }
      </IconButton>
    </InputAdornment>
  )

  return (
    <TextInput
      label={label}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      startIcon={startIcon}
      fullWidth={fullWidth}
      type={show ? "text" : "password"}
      endAdornment={eyeButton}
    />
  )
}
