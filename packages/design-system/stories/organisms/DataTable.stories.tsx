import type { Meta, StoryObj } from "@storybook/react"
import React from "react"
import { DataTable } from "../../organisms/DataTable/DataTable"
import { Chip } from "../../atoms/Chip/Chip"

const meta: Meta<typeof DataTable> = {
  title:      "Organisms/DataTable",
  component:  DataTable,
  tags:       ["autodocs"],
  parameters: { layout: "fullscreen" },
}
export default meta
type Story = StoryObj<typeof DataTable>

const COLUMNS = [
  { field: "id",      header: "ID" },
  { field: "name",    header: "Nombre" },
  { field: "age",     header: "Edad" },
  { field: "status",  header: "Estado", render: (value: string) => <Chip label={value} /> },
]

const ROWS = [
  { id: "E001", name: "Juan Pérez",    age: 45, status: "Activo" },
  { id: "E002", name: "María García",  age: 32, status: "En espera" },
  { id: "E003", name: "Carlos López",  age: 67, status: "Alta" },
  { id: "E004", name: "Ana Martínez",  age: 28, status: "Activo" },
]

export const Default: Story = {
  args: {
    columns: COLUMNS,
    rows:    ROWS,
  },
}

export const Empty: Story = {
  args: {
    columns: COLUMNS,
    rows:    [],
  },
}
