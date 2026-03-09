import MuiChip from "@mui/material/Chip"

interface Props {
  label: string
}

export const Chip = ({ label }: Props) => {
  return (
    <MuiChip
      label={label}
      variant="outlined"
      size="small"
    />
  )
}