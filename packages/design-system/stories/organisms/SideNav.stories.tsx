import type { Meta, StoryObj } from "@storybook/react"
import React, { useState } from "react"
import { MemoryRouter } from "react-router-dom"
import { Monitor, Users, BarChart, Settings } from "../../atoms/Icon/Icon"
import { SideNav }     from "../../organisms/SideNav/SideNav"
import { SidebarMenu } from "../../organisms/SidebarMenu/SidebarMenu"

const ITEMS = [
  { label: "Monitor Emergencia", path: "/emergency",          icon: <Monitor  size={18} /> },
  { label: "Pacientes",          path: "/emergency/patients", icon: <Users    size={18} /> },
  { label: "Reportes",           path: "/emergency/reports",  icon: <BarChart size={18} /> },
  { label: "Configuración",      path: "/emergency/settings", icon: <Settings size={18} /> },
]

function SideNavDemo({ collapsed: initial = false, isMobile = false }) {
  const [collapsed, setCollapsed] = useState(initial)
  return (
    <MemoryRouter initialEntries={["/emergency"]}>
      <div style={{ height: 400, display: "flex" }}>
        <SideNav collapsed={collapsed} isMobile={isMobile} onToggle={() => setCollapsed(c => !c)}>
          <SidebarMenu items={ITEMS} collapsed={collapsed} onNavigate={() => {}} />
        </SideNav>
      </div>
    </MemoryRouter>
  )
}

const meta: Meta = {
  title:     "Organisms/SideNav",
  tags:      ["autodocs"],
  parameters: { layout: "fullscreen" },
}
export default meta

export const Expanded: StoryObj = {
  render: () => <SideNavDemo collapsed={false} />,
}

export const Collapsed: StoryObj = {
  render: () => <SideNavDemo collapsed={true} />,
}

export const Mobile: StoryObj = {
  render: () => <SideNavDemo collapsed={false} isMobile={true} />,
}
