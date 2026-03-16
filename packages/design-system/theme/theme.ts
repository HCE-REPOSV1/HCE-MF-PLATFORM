/**
 * ---------------------------------------------------------
 * File: theme.ts
 * Author: Gregorovichz Carlos Rossi
 * Created: 09-03-2026
 * Description:
 * Definición del tema global de la aplicación utilizando
 * Material UI (MUI). Este archivo centraliza los estilos
 * visuales del Design System, permitiendo mantener
 * consistencia visual en todos los microfrontends.
 *
 * Responsabilidades:
 * - Definir la paleta de colores corporativa
 * - Configurar tipografía global
 * - Estandarizar estilos de componentes MUI
 * - Mantener consistencia visual entre aplicaciones
 *
 * Arquitectura:
 * Este theme es consumido por el ThemeProvider en el
 * microfrontend shell o en cada microfrontend.
 *
 * Ejemplo de uso:
 *
 * import { ThemeProvider } from "@mui/material/styles"
 * import { theme } from "./theme"
 *
 * <ThemeProvider theme={theme}>
 *    <App />
 * </ThemeProvider>
 *
 * Tecnologías:
 * - React
 * - Material UI (MUI v5+)
 * - TypeScript
 * ---------------------------------------------------------
 */
import { createTheme } from "@mui/material/styles";
/**
 * Theme principal del Design System
 */
export const theme = createTheme({
  /**
   * Paleta de colores corporativa
   */
  palette: {
    /**
     * Color primario de la marca
     */
    primary: {
      main: "#1E4FA3",
    },
    /**
     * Colores secundarios utilizados en botones
     * acciones positivas y elementos destacados
     */
    secondary: {
      main: "#6FB23F",
      light: "#8BCB5A",
      dark: "#5AA12E",
      contrastText: "#ffffff",
    },
    /**
     * Color de fondo general de la aplicación
     */
    background: {
      default: "#F7F9FC",
    },
  },
  /**
   * Configuración global de bordes
   */
  shape: {
    borderRadius: 8,
  },
  /**
   * Tipografía corporativa
   */
  typography: {
    /**
     * Fuente base del sistema
     */
    // fontFamily: "'Poppins', sans-serif",
    // fontFamily: "'Inter', sans-serif",
    fontFamily: "'Montserrat', sans-serif",
    fontSize: 14, 
    
    h1: {
      fontSize: "2rem",
      fontWeight: 600,
      letterSpacing: "-0.02em" // Poppins se ve muy profesional con un tracking ajustado
    },
    h4: {
      fontSize: "1.25rem",
      fontWeight: 600,
      letterSpacing: "-0.01em"
    },
    button: {
      fontWeight: 500,
      textTransform: "none"
    },
  },
  /**
   * Personalización de componentes de Material UI
   * para alinearlos con el Design System
   */
  // theme.ts (Adición en el objeto components)
  components: {
    MuiButton: {
      styleOverrides: {
        /**
         * Estilo base aplicado a todos los botones
         */
        root: {
          borderRadius: 8,
          textTransform: "none", // evita uppercase automático
        },
      },
    },
    MuiTable: {
      styleOverrides: {
        root: {
          backgroundColor: "#ffffff",
          borderRadius: "12px",
          overflow: "hidden",
          boxShadow: "0px 2px 12px rgba(0, 0, 0, 0.05)",
        },
      },
    },
    MuiTableHead: {
      styleOverrides: {
        root: {
          backgroundColor: "#F7F9FC", // Un tono grisáceo suave para diferenciar la cabecera
          "& .MuiTableCell-root": {
            color: "#4A5568",
            fontWeight: 700,
            textTransform: "uppercase",
            fontSize: "0.75rem",
            letterSpacing: "0.05em",
            borderBottom: "2px solid #E2E8F0",
          },
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: {
          padding: "16px",
          borderColor: "#EDF2F7",
          color: "#2D3748",
          fontSize: "0.875rem",
        },
      },
    },
    MuiTableRow: {
      styleOverrides: {
        root: {
          "&:hover": {
            backgroundColor: "#F1F5F9", // Efecto hover sutil
            transition: "background-color 0.2s ease",
          },
          "&:last-child td": {
            borderBottom: 0,
          },
        },
      },
    },
    MuiPagination: {
      styleOverrides: {
        root: {
          "& .MuiPagination-ul": {
            gap: "8px", // Espaciado entre números
          },
        },
      },
    },
    MuiPaginationItem: {
      styleOverrides: {
        root: {
          borderRadius: "8px", // Match con el borderRadius global
          fontWeight: 500,
          color: "#4A5568",
          "&.Mui-selected": {
            backgroundColor: "#1E4FA3", // Tu color primario
            color: "#ffffff",
            "&:hover": {
              backgroundColor: "#163d7e",
            },
          },
          "&:hover": {
            backgroundColor: "#EDF2F7",
          },
        },
        // Estilo para las flechas (prev/next)
        previousNext: {
          backgroundColor: "#ffffff",
          border: "1px solid #E2E8F0",
          "&:hover": {
            backgroundColor: "#F7F9FC",
          },
        },
      },
    },
  },
});
