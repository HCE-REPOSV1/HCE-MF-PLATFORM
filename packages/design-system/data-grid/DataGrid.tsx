/**
 * DataGrid
 *
 * Tabla reutilizable para todo el sistema.
 */

import "./DataGrid.css"
type Column = {
  field: string
  headerName: string
}

type Props = {
  columns: Column[]
  rows: any[]
}

export const DataGrid = ({ columns, rows }: Props) => {
  return (
    <table className="jarvis-table">
      <thead>
        <tr>
          {columns.map(col => (
            <th key={col.field}>
              {col.headerName}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((row, i) => (
          <tr key={i}>
            {columns.map(col => (
              <td key={col.field}>
                {row[col.field]}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  )
}