import type { ComponentType } from "react"

export type MenuConfigItem = {
  label:      string
  path:       string
  icon:       ComponentType<{ size?: number }>
  permission: string
}

export const menuConfig: MenuConfigItem[] = [
    
]