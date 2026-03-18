import type { Meta, StoryObj } from "@storybook/react"
import React from "react"
import { Table, TableBody } from "@mui/material"
import { PatientRow } from "../../molecules/PatientRow/PatientRow"
import type { PatientRowData } from "../../molecules/PatientRow/PatientRow"
import { injectEmergencyTokens } from "../../tokens/emergency.tokens"

injectEmergencyTokens()

const BASE: PatientRowData = {
  id:            "E001",
  priority:      3,
  box:           { status: "active", label: "Box 3" },
  patient:       { name: "Juan Pérez García" },
  age:           45,
  sex:           "M",
  document:      "12.345.678",
  doctor:        "Dr. Rodríguez",
  lab:           "ok",
  img:           "alert",
  indication:    "empty",
  interconsult:  "empty",
  attentionCode: "E097382",
}

function RowWrapper({ data, isAlternate }: { data: PatientRowData; isAlternate?: boolean }) {
  return (
    <Table size="small" sx={{ minWidth: 1100 }}>
      <TableBody>
        <PatientRow data={data} isAlternate={isAlternate} />
      </TableBody>
    </Table>
  )
}

const meta: Meta = {
  title:      "Molecules/PatientRow",
  tags:       ["autodocs"],
  parameters: { layout: "fullscreen" },
}
export default meta

export const Normal: StoryObj = {
  render: () => <RowWrapper data={BASE} />,
}

export const Alternado: StoryObj = {
  render: () => <RowWrapper data={BASE} isAlternate />,
}

export const Prioridad1: StoryObj = {
  render: () => (
    <RowWrapper
      data={{ ...BASE, priority: 1, box: { status: "urgent", label: "Box 7" } }}
    />
  ),
}

export const Seleccionado: StoryObj = {
  render: () => <RowWrapper data={{ ...BASE, selected: true }} />,
}

export const SinBox: StoryObj = {
  render: () => (
    <RowWrapper
      data={{ ...BASE, priority: 2, box: { status: "waiting", label: "Espera" } }}
    />
  ),
}
