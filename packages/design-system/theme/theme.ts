import { createTheme } from "@mui/material/styles"

export const theme = createTheme({

  palette: {

    primary: {
      main: "#1E4FA3"
    },

    secondary: {
      main: "#6FB23F",
      light: "#8BCB5A",
      dark: "#5AA12E",
      contrastText: "#ffffff"
    },

    background: {
      default: "#F7F9FC"
    }

  },

  shape: {
    borderRadius: 8
  },

  typography: {
    fontFamily: "Roboto",
    h1: {
      fontSize: "28px",
      fontWeight: 600
    }
  },

  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          textTransform: "none"
        }
      }
    }
  }

})