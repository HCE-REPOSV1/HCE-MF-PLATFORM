import MuiIconButton from "@mui/material/IconButton"
import InfoIcon from "@mui/icons-material/Info"

interface Props {
  onClick?: () => void
}

export const IconButton = ({ onClick }: Props) => {
  return (
    <MuiIconButton onClick={onClick}>
      <InfoIcon />
    </MuiIconButton>
  )
}