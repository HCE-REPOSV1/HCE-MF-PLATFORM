import type { Meta, StoryObj } from "@storybook/react"
import { Chip } from "../../atoms/Chip/Chip"

const meta: Meta<typeof Chip> = {
  title:     "Atoms/Chip",
  component: Chip,
  tags:      ["autodocs"],
}
export default meta
type Story = StoryObj<typeof Chip>

export const Default: Story = {
  args: { label: "Activo" },
}

export const LongLabel: Story = {
  args: { label: "Paciente en observación" },
}
