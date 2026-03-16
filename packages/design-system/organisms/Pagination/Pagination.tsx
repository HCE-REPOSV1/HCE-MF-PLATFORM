import MuiPagination from "@mui/material/Pagination"

interface Props {
  page: number
  total: number
  onChange: (page: number) => void
}

export const Pagination = ({ page, total, onChange }: Props) => {
  return (
    <MuiPagination
      count={total}
      page={page}
      onChange={(_, value) => onChange(value)}
    />
  )
}