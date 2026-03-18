import type { Meta, StoryObj } from "@storybook/react"
import { Badge } from "../../atoms/Badge/Badge"

const meta: Meta<typeof Badge> = {
  title:     "Atoms/Badge",
  component: Badge,
  tags:      ["autodocs"],
}
export default meta
type Story = StoryObj<typeof Badge>

export const Default: Story = {
  args: { value: 5 },
}

export const HighCount: Story = {
  args: { value: 99 },
}
