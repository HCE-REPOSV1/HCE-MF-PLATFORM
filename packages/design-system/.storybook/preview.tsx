import type { Preview } from "@storybook/react"
import React from "react"
import { DSProvider }       from "../provider/ThemeProvider"
import { injectBaseTokens } from "../tokens/base.tokens"
injectBaseTokens()

const preview: Preview = {
  decorators: [
    (Story) => (
      <DSProvider>
        <Story />
      </DSProvider>
    ),
  ],
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date:  /Date$/i,
      },
    },
    layout: "centered",
  },
}

export default preview
