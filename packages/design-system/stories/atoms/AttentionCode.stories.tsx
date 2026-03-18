import type { Meta, StoryObj } from "@storybook/react"
import { AttentionCode } from "../../atoms/AttentionCode/AttentionCode"
import { injectEmergencyTokens } from "../../tokens/emergency.tokens"

injectEmergencyTokens()

const meta: Meta<typeof AttentionCode> = {
  title:     "Atoms/AttentionCode",
  component: AttentionCode,
  tags:      ["autodocs"],
}
export default meta
type Story = StoryObj<typeof AttentionCode>

export const Default: Story = {
  args: { code: "E097382" },
}

export const Short: Story = {
  args: { code: "E001" },
}
