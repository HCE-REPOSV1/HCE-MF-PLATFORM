import type { Meta, StoryObj } from "@storybook/react"
import { BoxBadge } from "../../atoms/BoxBadge/BoxBadge"
import { injectEmergencyTokens } from "../../tokens/emergency.tokens"

injectEmergencyTokens()

const meta: Meta<typeof BoxBadge> = {
  title:     "Atoms/BoxBadge",
  component: BoxBadge,
  tags:      ["autodocs"],
}
export default meta
type Story = StoryObj<typeof BoxBadge>

export const Active: Story = {
  args: { status: "active", label: "Box 3" },
}

export const Urgent: Story = {
  args: { status: "urgent", label: "Box 7" },
}

export const Waiting: Story = {
  args: { status: "waiting", label: "Espera" },
}

export const TP: Story = {
  args: { status: "tp", label: "TP" },
}
