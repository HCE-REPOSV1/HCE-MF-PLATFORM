import type { Meta, StoryObj } from "@storybook/react"
import { useState }       from "react"
import { PasswordInput }  from "../../molecules/PasswordInput/PasswordInput"
import { Lock }           from "../../atoms/Icon/Icon"

const meta: Meta<typeof PasswordInput> = {
  title:     "Molecules/PasswordInput",
  component: PasswordInput,
  tags:      ["autodocs"],
  decorators: [(Story) => <div style={{ width: 360 }}><Story /></div>],
}
export default meta
type Story = StoryObj<typeof PasswordInput>

export const Default: Story = {
  args: {
    label:       "Contraseña",
    value:       "",
    placeholder: "Ingrese contraseña",
    onChange:    () => {},
  },
}

export const WithIcon: Story = {
  args: {
    label:       "Contraseña",
    value:       "",
    placeholder: "Ingrese contraseña",
    startIcon:   <Lock size={18} />,
    onChange:    () => {},
  },
}

export const Controlled: Story = {
  render: () => {
    const [v, setV] = useState("")
    return (
      <PasswordInput
        label="Contraseña"
        value={v}
        placeholder="Ingrese contraseña"
        startIcon={<Lock size={18} />}
        onChange={setV}
      />
    )
  },
}
