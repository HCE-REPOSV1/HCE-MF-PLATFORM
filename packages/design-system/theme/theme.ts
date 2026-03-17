/**
 * ---------------------------------------------------------
 * File: theme/theme.ts
 * Description:
 * Tema MUI base del Design System Jarvis.
 * Consume baseTokens — no define valores crudos aquí.
 * Todos los colores, tamaños y tipografía vienen de
 * tokens/base.tokens.ts.
 * ---------------------------------------------------------
 */
import { createTheme }  from "@mui/material/styles"
import {
  baseColors,
  baseTypography,
  baseBorderRadius,
} from "../tokens/base.tokens"

export const theme = createTheme({
  palette: {
    primary: {
      main:  baseColors.primary,
      dark:  baseColors.primaryDark,
      light: baseColors.primaryLight,
    },
    secondary: {
      main:         baseColors.secondary,
      light:        baseColors.secondaryLight,
      dark:         baseColors.secondaryDark,
      contrastText: baseColors.surface,
    },
    background: {
      default: baseColors.background,
      paper:   baseColors.surface,
    },
    text: {
      primary:   baseColors.textPrimary,
      secondary: baseColors.textSecondary,
    },
    divider: baseColors.border,
  },

  shape: {
    borderRadius: parseInt(baseBorderRadius.lg),
  },

  typography: {
    fontFamily: baseTypography.fontFamily,
    fontSize:   baseTypography.fontSize,
    h1: {
      fontSize:      baseTypography.size.h1,
      fontWeight:    baseTypography.weight.semibold,
      letterSpacing: baseTypography.letterSpacing.tight,
    },
    h4: {
      fontSize:      baseTypography.size.h4,
      fontWeight:    baseTypography.weight.semibold,
      letterSpacing: baseTypography.letterSpacing.tight,
    },
    button: {
      fontWeight:    baseTypography.weight.medium,
      textTransform: 'none',
    },
  },

  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius:  baseBorderRadius.lg,
          textTransform: 'none',
        },
      },
    },
    MuiTable: {
      styleOverrides: {
        root: {
          backgroundColor: baseColors.surface,
          borderRadius:    baseBorderRadius.xl,
          overflow:        'hidden',
          boxShadow:       '0px 2px 12px rgba(0,0,0,0.05)',
        },
      },
    },
    MuiTableHead: {
      styleOverrides: {
        root: {
          backgroundColor: baseColors.surfaceLight,
          '& .MuiTableCell-root': {
            color:         baseColors.textSecondary,
            fontWeight:    baseTypography.weight.bold,
            textTransform: 'uppercase',
            fontSize:      baseTypography.size.xs,
            letterSpacing: baseTypography.letterSpacing.wide,
            borderBottom:  `2px solid ${baseColors.border}`,
          },
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: {
          padding:     '16px',
          borderColor: baseColors.border,
          color:       baseColors.textPrimary,
          fontSize:    baseTypography.size.sm,
        },
      },
    },
    MuiTableRow: {
      styleOverrides: {
        root: {
          '&:hover': {
            backgroundColor: baseColors.surfaceLight,
            transition:      'background-color 0.2s ease',
          },
          '&:last-child td': {
            borderBottom: 0,
          },
        },
      },
    },
    MuiPagination: {
      styleOverrides: {
        root: {
          '& .MuiPagination-ul': { gap: '8px' },
        },
      },
    },
    MuiPaginationItem: {
      styleOverrides: {
        root: {
          borderRadius: baseBorderRadius.lg,
          fontWeight:   baseTypography.weight.medium,
          color:        baseColors.textSecondary,
          '&.Mui-selected': {
            backgroundColor: baseColors.primary,
            color:           baseColors.surface,
            '&:hover': { backgroundColor: baseColors.primaryDark },
          },
          '&:hover': { backgroundColor: baseColors.surfaceLight },
        },
        previousNext: {
          backgroundColor: baseColors.surface,
          border:          `1px solid ${baseColors.border}`,
          '&:hover':       { backgroundColor: baseColors.background },
        },
      },
    },
  },
})
