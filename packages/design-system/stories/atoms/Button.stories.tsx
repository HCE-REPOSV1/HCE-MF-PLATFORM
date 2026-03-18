import type { Meta, StoryObj } from "@storybook/react"
import { Button } from "../../atoms/Button/Button"

const meta: Meta<typeof Button> = {
  title:     "Atoms/Button",
  component: Button,
  tags:      ["autodocs"],
  argTypes: {
    color: { control: "select", options: ["primary", "secondary"] },
    type:  { control: "select", options: ["button", "submit", "reset"] },
  },
}
export default meta
type Story = StoryObj<typeof Button>

export const Primary: Story = {
  args: { label: "Guardar", color: "primary" },
}

export const Secondary: Story = {
  args: { label: "Iniciar Sesión", color: "secondary" },
}

export const FullWidth: Story = {
  args: { label: "Iniciar Sesión", color: "secondary", fullWidth: true },
  decorators: [(Story) => <div style={{ width: 360 }}><Story /></div>],
}

export const Disabled: Story = {
  args: { label: "No disponible", disabled: true },
}
