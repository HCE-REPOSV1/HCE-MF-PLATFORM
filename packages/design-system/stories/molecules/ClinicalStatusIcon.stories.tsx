import type { Meta, StoryObj } from "@storybook/react"
import ScienceOutlinedIcon from "@mui/icons-material/ScienceOutlined"
import { ClinicalStatusIcon } from "../../molecules/ClinicalStatusIcon/ClinicalStatusIcon"
import { injectEmergencyTokens } from "../../tokens/emergency.tokens"

injectEmergencyTokens()

const meta: Meta<typeof ClinicalStatusIcon> = {
  title:     "Molecules/ClinicalStatusIcon",
  component: ClinicalStatusIcon,
  tags:      ["autodocs"],
  args: { icon: ScienceOutlinedIcon },
}
export default meta
type Story = StoryObj<typeof ClinicalStatusIcon>

export const Alert: Story = {
  args: { status: "alert", tooltipLabel: "Lab pendiente" },
}

export const Ok: Story = {
  args: { status: "ok", tooltipLabel: "Lab completado" },
}

export const Urgent: Story = {
  args: { status: "urgent", tooltipLabel: "Lab urgente" },
}

export const Empty: Story = {
  args: { status: "empty" },
}
