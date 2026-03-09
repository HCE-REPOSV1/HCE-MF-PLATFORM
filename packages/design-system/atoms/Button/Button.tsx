import MuiButton from "@mui/material/Button"

interface Props {
  label: string
  onClick?: () => void
}

export const Button = ({ label, onClick }: Props) => {

  return (

    <MuiButton
      variant="contained"
      color="secondary"
      onClick={onClick}
      sx={{ textTransform: "none" }}
    >
      {label}
    </MuiButton>

  )

}