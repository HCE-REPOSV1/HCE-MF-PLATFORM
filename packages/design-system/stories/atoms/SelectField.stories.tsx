import type { Meta, StoryObj } from "@storybook/react"
import { useState }    from "react"
import { SelectField } from "../../atoms/SelectField/SelectField"

const EMPRESAS = [
  { value: "CENTRAL", label: "Sede Central" },
  { value: "NORTE",   label: "Sede Norte"   },
  { value: "SUR",     label: "Sede Sur"     },
]

const meta: Meta<typeof SelectField> = {
  title:     "Atoms/SelectField",
  component: SelectField,
  tags:      ["autodocs"],
  decorators: [(Story) => <div style={{ width: 360 }}><Story /></div>],
}
export default meta
type Story = StoryObj<typeof SelectField>

export const Default: Story = {
  args: {
    label:    "Empresa",
    value:    "",
    options:  EMPRESAS,
    onChange: () => {},
  },
}

export const Controlled: Story = {
  render: () => {
    const [v, setV] = useState("")
    return (
      <SelectField
        label="Empresa"
        value={v}
        options={EMPRESAS}
        onChange={setV}
      />
    )
  },
}
