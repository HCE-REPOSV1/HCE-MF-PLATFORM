import type { Meta, StoryObj } from "@storybook/react"
import { Box }          from "@mui/material"
import { PriorityBadge } from "../../atoms/PriorityBadge/PriorityBadge"

const meta: Meta<typeof PriorityBadge> = {
  title:     "Atoms/PriorityBadge",
  component: PriorityBadge,
  tags:      ["autodocs"],
}
export default meta
type Story = StoryObj<typeof PriorityBadge>

export const Critico: Story  = { args: { priority: 1 } }
export const Urgente: Story  = { args: { priority: 2 } }
export const Moderado: Story = { args: { priority: 3 } }
export const Leve: Story     = { args: { priority: 4 } }
export const SinPrioridad: Story = { args: { priority: "none" } }

export const Todos: Story = {
  render: () => (
    <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
      <PriorityBadge priority={1} />
      <PriorityBadge priority={2} />
      <PriorityBadge priority={3} />
      <PriorityBadge priority={4} />
      <PriorityBadge priority="none" />
    </Box>
  ),
}
