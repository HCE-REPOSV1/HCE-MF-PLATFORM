import type { Meta, StoryObj } from "@storybook/react"
import { Footer } from "../../organisms/Footer/Footer"

const meta: Meta<typeof Footer> = {
  title:     "Organisms/Footer",
  component: Footer,
  tags:      ["autodocs"],
  parameters: { layout: "fullscreen" },
}
export default meta
type Story = StoryObj<typeof Footer>

export const Default: Story = {}
