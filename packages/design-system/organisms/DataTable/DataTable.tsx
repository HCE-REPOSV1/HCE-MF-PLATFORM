import Table from "@mui/material/Table"
import TableBody from "@mui/material/TableBody"
import TableCell from "@mui/material/TableCell"
import TableHead from "@mui/material/TableHead"
import TableRow from "@mui/material/TableRow"

interface Column {
  field: string
  header: string
}

interface Props {
  columns: Column[]
  rows: any[]
}

export const DataTable = ({ columns, rows }: Props) => {
  return (
    <Table sx={{ width: "100%" }}>
      <TableHead>
        <TableRow>
          {columns.map(col => (
            <TableCell key={col.field}>
              {col.header}
            </TableCell>
          ))}
        </TableRow>
      </TableHead>

      <TableBody>
        {rows.map((row, i) => (
          <TableRow key={i}>
            {columns.map(col => (
              <TableCell key={col.field}>
                {row[col.field]}
              </TableCell>
            ))}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}