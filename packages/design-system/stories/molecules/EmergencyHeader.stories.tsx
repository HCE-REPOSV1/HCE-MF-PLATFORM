import type { Meta, StoryObj } from "@storybook/react"
import { EmergencyHeader } from "../../molecules/EmergencyHeader/EmergencyHeader"
import { injectEmergencyTokens } from "../../tokens/emergency.tokens"

injectEmergencyTokens()

const meta: Meta<typeof EmergencyHeader> = {
  title:      "Molecules/EmergencyHeader",
  component:  EmergencyHeader,
  tags:       ["autodocs"],
  parameters: { layout: "fullscreen" },
}
export default meta
type Story = StoryObj<typeof EmergencyHeader>

export const Default: Story = {
  args: {
    title:    "Monitor de Emergencia",
    dateTime: "Lun 18 Mar 2026 — 14:32",
    sede:     "Sede Central",
  },
}

export const SinChips: Story = {
  args: {
    title: "Monitor de Emergencia",
  },
}
