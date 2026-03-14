// DataTable.tsx
import { Table, TableBody, TableCell, TableHead, TableRow, Paper } from "@mui/material";

interface Column {
  field: string;
  header: string;
  // Permite pasar una función para renderizar algo complejo (ej. un Chip o un gráfico)
  render?: (value: any, row: any) => React.ReactNode;
}

interface Props {
  columns: Column[];
  rows: any[];
}

export const DataTable = ({ columns, rows }: Props) => {
  return (
    <Paper elevation={0} className="jarvis-table-container" sx={{ borderRadius: '12px', border: '1px solid #E2E8F0' }}>
      <div className="jarvis-table-wrapper">
        <Table stickyHeader className="jarvis-table">
          <TableHead>
            <TableRow>
              {columns.map(col => (
                <TableCell key={col.field}>{col.header}</TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map((row, i) => (
              <TableRow key={row.id || i}>
                {columns.map(col => (
                  <TableCell key={col.field}>
                    {col.render 
                      ? col.render(row[col.field], row) 
                      : row[col.field]}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </Paper>
  );
};