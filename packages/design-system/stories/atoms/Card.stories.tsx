import type { Meta, StoryObj } from "@storybook/react"
import React from "react"
import { Card } from "../../atoms/Card/Card"

const meta: Meta<typeof Card> = {
  title:     "Atoms/Card",
  component: Card,
  tags:      ["autodocs"],
}
export default meta
type Story = StoryObj<typeof Card>

export const Default: Story = {
  args: {
    children: (
      <div style={{ padding: 16 }}>
        <p style={{ margin: 0 }}>Contenido de la tarjeta</p>
      </div>
    ),
  },
}
