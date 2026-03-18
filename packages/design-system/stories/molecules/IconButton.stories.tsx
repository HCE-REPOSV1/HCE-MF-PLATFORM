import type { Meta, StoryObj } from "@storybook/react"
import React from "react"
import { IconButton } from "../../molecules/IconButton/IconButton"
import { Settings } from "../../atoms/Icon/Icon"

const meta: Meta<typeof IconButton> = {
  title:     "Molecules/IconButton",
  component: IconButton,
  tags:      ["autodocs"],
}
export default meta
type Story = StoryObj<typeof IconButton>

export const Default: Story = {
  args: {
    icon: <Settings size={20} />,
    size: "medium",
  },
}

export const Small: Story = {
  args: {
    icon: <Settings size={16} />,
    size: "small",
  },
}

export const Disabled: Story = {
  args: {
    icon:     <Settings size={20} />,
    disabled: true,
  },
}
