import MuiBadge from "@mui/material/Badge"

interface Props {
  value: number
}

export const Badge = ({ value }: Props) => {
  return (
    <MuiBadge
      badgeContent={value}
      color="primary"
    />
  )
}