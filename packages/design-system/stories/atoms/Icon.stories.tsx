import type { Meta, StoryObj } from "@storybook/react"
import React from "react"
import {
  Monitor, Users, BarChart, Settings, LayoutDashboard, ClipboardList,
  BedDouble, Scissors, CalendarDays, Stethoscope, FileText, Building2,
  Syringe, Heart, Pill, Plus, Activity, Bandage, Asterisk, FlaskConical,
  Thermometer, User, Lock,
} from "../../atoms/Icon/Icon"

const ALL_ICONS = [
  { name: "Monitor",        icon: Monitor },
  { name: "Users",          icon: Users },
  { name: "BarChart",       icon: BarChart },
  { name: "Settings",       icon: Settings },
  { name: "LayoutDashboard",icon: LayoutDashboard },
  { name: "ClipboardList",  icon: ClipboardList },
  { name: "BedDouble",      icon: BedDouble },
  { name: "Scissors",       icon: Scissors },
  { name: "CalendarDays",   icon: CalendarDays },
  { name: "Stethoscope",    icon: Stethoscope },
  { name: "FileText",       icon: FileText },
  { name: "Building2",      icon: Building2 },
  { name: "Syringe",        icon: Syringe },
  { name: "Heart",          icon: Heart },
  { name: "Pill",           icon: Pill },
  { name: "Plus",           icon: Plus },
  { name: "Activity",       icon: Activity },
  { name: "Bandage",        icon: Bandage },
  { name: "Asterisk",       icon: Asterisk },
  { name: "FlaskConical",   icon: FlaskConical },
  { name: "Thermometer",    icon: Thermometer },
  { name: "User",           icon: User },
  { name: "Lock",           icon: Lock },
]

function IconGallery() {
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 24, padding: 16 }}>
      {ALL_ICONS.map(({ name, icon: Icon }) => (
        <div key={name} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6, width: 80 }}>
          <Icon size={28} />
          <span style={{ fontSize: 11, color: "#666", textAlign: "center" }}>{name}</span>
        </div>
      ))}
    </div>
  )
}

const meta: Meta = {
  title:      "Atoms/Icons",
  tags:       ["autodocs"],
  parameters: { layout: "fullscreen" },
}
export default meta

export const Gallery: StoryObj = {
  render: () => <IconGallery />,
}
