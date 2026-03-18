import type { StorybookConfig } from "@storybook/react-vite"
import path from "path"

const config: StorybookConfig = {
  stories: ["../stories/**/*.stories.@(ts|tsx)"],
  addons: [
    "@storybook/addon-essentials",
    "@storybook/addon-interactions",
  ],
  framework: {
    name: "@storybook/react-vite",
    options: {},
  },
  viteFinal: async (config) => {
    config.resolve ??= {}
    config.resolve.alias = {
      ...config.resolve.alias,
      // Mismo alias que usan los MF apps
      "@jarvis/design-system": path.resolve(__dirname, ".."),
      "@design-system":        path.resolve(__dirname, ".."),
    }
    return config
  },
}

export default config
