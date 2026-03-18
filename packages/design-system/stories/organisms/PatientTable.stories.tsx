import type { Meta, StoryObj } from "@storybook/react"
import React from "react"
import { PatientTable } from "../../organisms/PatientTable/PatientTable"
import type { PatientRowData } from "../../molecules/PatientRow/PatientRow"
import { injectEmergencyTokens } from "../../tokens/emergency.tokens"

injectEmergencyTokens()

const HEADER = [
  { label: "Prioridad",   width: 70,  align: "center" as const },
  { label: "Box",         width: 80,  align: "center" as const },
  { label: "Paciente",    width: 180, align: "left"   as const },
  { label: "Edad",        width: 55,  align: "center" as const },
  { label: "Sexo",        width: 55,  align: "center" as const },
  { label: "N.Documento", width: 100, align: "left"   as const },
  { label: "Médico",      width: 160, align: "left"   as const },
  { label: "Lab",         width: 50,  align: "center" as const },
  { label: "Img",         width: 50,  align: "center" as const },
  { label: "Indc.Med",    width: 50,  align: "center" as const },
  { label: "Interc.",     width: 50,  align: "center" as const },
  { label: "Atención",    width: 90,  align: "left"   as const },
  { label: "Info",        width: 50,  align: "center" as const },
]

const ROWS: PatientRowData[] = [
  {
    id: "E001", priority: 1, box: { status: "urgent", label: "Box 1" },
    patient: { name: "Carlos Mendoza" }, age: 67, sex: "M", document: "8.765.432",
    doctor: "Dr. Torres", lab: "urgent", img: "alert", indication: "ok",
    interconsult: "empty", attentionCode: "E097001",
  },
  {
    id: "E002", priority: 2, box: { status: "active", label: "Box 3" },
    patient: { name: "María García López" }, age: 34, sex: "F", document: "15.234.567",
    doctor: "Dra. Ramírez", lab: "ok", img: "empty", indication: "alert",
    interconsult: "empty", attentionCode: "E097002",
  },
  {
    id: "E003", priority: 3, box: { status: "active", label: "Box 5" },
    patient: { name: "Juan Pérez" }, age: 45, sex: "M", document: "12.345.678",
    doctor: "Dr. Rodríguez", lab: "alert", img: "ok", indication: "empty",
    interconsult: "ok", attentionCode: "E097003",
  },
  {
    id: "E004", priority: 4, box: { status: "waiting", label: "Espera" },
    patient: { name: "Ana Martínez" }, age: 28, sex: "F", document: "20.111.222",
    doctor: "Dr. Silva", lab: "empty", img: "empty", indication: "empty",
    interconsult: "empty", attentionCode: "E097004",
  },
  {
    id: "E005", priority: "none", box: { status: "tp", label: "TP" },
    patient: { name: "Luis Hernández" }, age: 52, sex: "M", document: "7.654.321",
    doctor: "Dra. Castro", lab: "ok", img: "ok", indication: "ok",
    interconsult: "empty", attentionCode: "E097005",
  },
]

const meta: Meta = {
  title:      "Organisms/PatientTable",
  parameters: { layout: "fullscreen" },
}
export default meta

export const Default: StoryObj = {
  render: () => <PatientTable rows={ROWS} header={HEADER} />,
}

export const Vacia: StoryObj = {
  render: () => <PatientTable rows={[]} header={HEADER} />,
}
