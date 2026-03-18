import type { Meta, StoryObj } from "@storybook/react"
import { useState } from "react"
import { TextInput } from "../../atoms/TextInput/TextInput"
import { User }      from "../../atoms/Icon/Icon"

const meta: Meta<typeof TextInput> = {
  title:     "Atoms/TextInput",
  component: TextInput,
  tags:      ["autodocs"],
  decorators: [(Story) => <div style={{ width: 360 }}><Story /></div>],
}
export default meta
type Story = StoryObj<typeof TextInput>

export const Default: Story = {
  args: {
    label:       "Usuario",
    value:       "",
    placeholder: "Ingrese usuario",
    onChange:    () => {},
  },
}

export const WithIcon: Story = {
  args: {
    label:       "Usuario",
    value:       "",
    placeholder: "Ingrese usuario",
    startIcon:   <User size={18} />,
    onChange:    () => {},
  },
}

export const Controlled: Story = {
  render: () => {
    const [v, setV] = useState("")
    return (
      <TextInput
        label="Nombre"
        value={v}
        placeholder="Escribe aquí..."
        onChange={setV}
      />
    )
  },
}
