import type { Meta, StoryObj } from "@storybook/react"
import { MemoryRouter }  from "react-router-dom"
import { Monitor, Users, BarChart, Settings } from "../../atoms/Icon/Icon"
import { SidebarMenu }   from "../../organisms/SidebarMenu/SidebarMenu"

const ITEMS = [
  { label: "Monitor Emergencia", path: "/emergency",          icon: <Monitor  size={18} /> },
  { label: "Pacientes",          path: "/emergency/patients", icon: <Users    size={18} /> },
  { label: "Reportes",           path: "/emergency/reports",  icon: <BarChart size={18} /> },
  { label: "Configuración",      path: "/emergency/settings", icon: <Settings size={18} /> },
]

const meta: Meta<typeof SidebarMenu> = {
  title:     "Organisms/SidebarMenu",
  component: SidebarMenu,
  tags:      ["autodocs"],
  decorators: [(Story) => (
    <MemoryRouter initialEntries={["/emergency"]}>
      <div style={{ width: 240, border: "1px solid #e5e7eb", borderRadius: 8, overflow: "hidden" }}>
        <Story />
      </div>
    </MemoryRouter>
  )],
}
export default meta
type Story = StoryObj<typeof SidebarMenu>

export const Default: Story = {
  args: {
    items:      ITEMS,
    collapsed:  false,
    onNavigate: (path) => console.log("Navegar a:", path),
  },
}

export const Collapsed: Story = {
  args: {
    items:      ITEMS,
    collapsed:  true,
    onNavigate: (path) => console.log("Navegar a:", path),
  },
  decorators: [(Story) => (
    <MemoryRouter initialEntries={["/emergency"]}>
      <div style={{ width: 72, border: "1px solid #e5e7eb", borderRadius: 8, overflow: "hidden" }}>
        <Story />
      </div>
    </MemoryRouter>
  )],
}
