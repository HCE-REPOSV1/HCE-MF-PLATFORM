import type { Meta, StoryObj } from "@storybook/react"
import { ActionBar } from "../../molecules/ActionBar/ActionBar"
import { injectEmergencyTokens } from "../../tokens/emergency.tokens"

injectEmergencyTokens()

const meta: Meta<typeof ActionBar> = {
  title:      "Molecules/ActionBar",
  component:  ActionBar,
  tags:       ["autodocs"],
  parameters: { layout: "fullscreen" },
}
export default meta
type Story = StoryObj<typeof ActionBar>

export const Default: Story = {
  args: {
    onFilter:  () => console.log("Filtrar"),
    onUser:    () => console.log("Usuario"),
    onRefresh: () => console.log("Refresh"),
    onPrint:   () => console.log("Imprimir"),
  },
}
