import type { Meta, StoryObj } from "@storybook/react"
import { MemoryRouter } from "react-router-dom"
import { Header } from "../../organisms/Header/Header"

const meta: Meta<typeof Header> = {
  title:     "Organisms/Header",
  component: Header,
  tags:      ["autodocs"],
  parameters: { layout: "fullscreen" },
  decorators: [(Story) => (
    <MemoryRouter>
      <Story />
    </MemoryRouter>
  )],
}
export default meta
type Story = StoryObj<typeof Header>

export const Default: Story = {
  args: {
    date:     "Martes 18 de Marzo de 2026 · 09:35",
    site:     "SEDE CENTRAL",
    userName: "Gregorovichz Carlos Rossi",
    userRole: "Administrador",
  },
}

export const ConHamburguesa: Story = {
  args: {
    ...Default.args,
    onToggleSidebar: () => alert("Toggle sidebar"),
  },
}

export const SinDatos: Story = {
  args: {},
}
