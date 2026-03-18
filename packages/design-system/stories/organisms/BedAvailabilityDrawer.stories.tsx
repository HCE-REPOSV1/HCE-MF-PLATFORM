import type { Meta, StoryObj } from "@storybook/react"
import { BedAvailabilityDrawer } from "../../organisms/BedAvailability/BedAvailabilityDrawer"
import { injectEmergencyTokens }  from "../../tokens/emergency.tokens"

injectEmergencyTokens()

const meta: Meta<typeof BedAvailabilityDrawer> = {
  title:     "Organisms/BedAvailabilityDrawer",
  component: BedAvailabilityDrawer,
  tags:      ["autodocs"],
  parameters: { layout: "fullscreen" },
}
export default meta
type Story = StoryObj<typeof BedAvailabilityDrawer>

export const Default: Story = {}
