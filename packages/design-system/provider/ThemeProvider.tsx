import { ThemeProvider } from "@mui/material/styles"
import CssBaseline from "@mui/material/CssBaseline"
import { theme } from "../theme/theme"

import { ReactNode } from "react"

interface Props {
 children: ReactNode
}

export const DSProvider = ({ children }: Props) => {

 return (

  <ThemeProvider theme={theme}>
    <CssBaseline />
    {children}
  </ThemeProvider>

 )

}