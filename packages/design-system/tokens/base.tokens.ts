/**
 * ---------------------------------------------------------
 * File: tokens/base.tokens.ts
 * Description:
 * Design Tokens base del sistema Jarvis.
 * Fuente única de verdad para todos los valores visuales
 * que aplican globalmente a la plataforma.
 *
 * Regla: ningún componente ni theme debe tener colores,
 * tamaños o valores crudos hardcodeados — siempre deben
 * referenciar estos tokens.
 *
 * Uso como constantes TypeScript:
 *   import { baseTokens } from '@jarvis/design-system'
 *
 * Uso como CSS Variables (inyectar en :root):
 *   import { injectBaseTokens } from '@jarvis/design-system'
 *   injectBaseTokens() // llamar una vez en el entry point
 * ---------------------------------------------------------
 */

// ─────────────────────────────────────────────────────────
// COLORES
// ─────────────────────────────────────────────────────────
export const baseColors = {
  // Marca
  primary:        '#1E4FA3',
  primaryDark:    '#153B7A',
  primaryLight:   '#EEF2F9',

  secondary:      '#6FB23F',
  secondaryLight: '#8BCB5A',
  secondaryDark:  '#5AA12E',

  // Superficies
  surface:        '#FFFFFF',
  surfaceLight:   '#F5F7FA',
  background:     '#F7F9FC',

  // Texto
  textPrimary:    '#374151',
  textSecondary:  '#6B7280',

  // Bordes
  border:         '#E5E7EB',

  // Sidebar
  sidebarBg:      '#F3F4F6',
  sidebarHover:   '#E5E7EB',
  sidebarActive:  '#DBEAFE',
  sidebarText:    '#1F2937',
} as const

// ─────────────────────────────────────────────────────────
// TIPOGRAFÍA
// ─────────────────────────────────────────────────────────
export const baseTypography = {
  fontFamily: "'Montserrat', sans-serif",
  fontSize:   14,

  size: {
    xs:   '12px',
    sm:   '13px',
    base: '14px',
    md:   '16px',
    lg:   '20px',
    xl:   '24px',
    h1:   '2rem',
    h4:   '1.25rem',
  },

  weight: {
    regular:  400,
    medium:   500,
    semibold: 600,
    bold:     700,
  },

  letterSpacing: {
    tight:  '-0.02em',
    normal: '0',
    wide:   '0.05em',
  },
} as const

// ─────────────────────────────────────────────────────────
// ESPACIADO (grid base 4px)
// ─────────────────────────────────────────────────────────
export const baseSpacing = {
  base: 4,
  1:  '4px',
  2:  '8px',
  3:  '12px',
  4:  '16px',
  5:  '20px',
  6:  '24px',
  8:  '32px',
  10: '40px',
  12: '48px',
} as const

// ─────────────────────────────────────────────────────────
// BORDER RADIUS
// ─────────────────────────────────────────────────────────
export const baseBorderRadius = {
  none:   '0px',
  sm:     '4px',
  md:     '6px',
  lg:     '8px',
  xl:     '12px',
  pill:   '50px',
  circle: '50%',
} as const

// ─────────────────────────────────────────────────────────
// SOMBRAS
// ─────────────────────────────────────────────────────────
export const baseShadows = {
  xs:     '0 1px 2px rgba(0,0,0,0.05)',
  sm:     '0 1px 4px rgba(0,0,0,0.08)',
  md:     '0px 2px 12px rgba(0,0,0,0.05)',
  lg:     '0 4px 20px rgba(0,0,0,0.1)',
  table:  '0px 2px 12px rgba(0,0,0,0.05)',
  header: '0 2px 8px rgba(30,79,163,0.15)',
} as const

// ─────────────────────────────────────────────────────────
// Z-INDEX
// ─────────────────────────────────────────────────────────
export const baseZIndex = {
  base:    0,
  raised:  10,
  dropdown: 100,
  sidebar:  200,
  modal:    400,
  overlay:  1050,
  drawer:   1100,
} as const

// ─────────────────────────────────────────────────────────
// OBJETO UNIFICADO
// ─────────────────────────────────────────────────────────
export const baseTokens = {
  colors:       baseColors,
  typography:   baseTypography,
  spacing:      baseSpacing,
  borderRadius: baseBorderRadius,
  shadows:      baseShadows,
  zIndex:       baseZIndex,
} as const

// ─────────────────────────────────────────────────────────
// INYECTOR DE CSS CUSTOM PROPERTIES (:root)
// Genera las variables CSS usadas por componentes CSS-based
// (SidebarMenu, SideNav, Header, etc.)
// Llamar una vez en el entry point de cada microfrontend.
// ─────────────────────────────────────────────────────────
export function injectBaseTokens(): void {
  if (typeof document === 'undefined') return

  const root = document.documentElement
  const c    = baseColors

  // Marca
  root.style.setProperty('--color-primary',       c.primary)
  root.style.setProperty('--color-primary-dark',  c.primaryDark)
  root.style.setProperty('--color-secondary',     c.secondary)

  // Superficies
  root.style.setProperty('--color-surface',       c.surface)
  root.style.setProperty('--color-surface-light', c.surfaceLight)
  root.style.setProperty('--color-background',    c.background)

  // Texto
  root.style.setProperty('--color-text-primary',  c.textPrimary)
  root.style.setProperty('--color-text-secondary',c.textSecondary)

  // Bordes
  root.style.setProperty('--color-border',        c.border)

  // Sidebar
  root.style.setProperty('--jarvis-sidebar-bg',   c.sidebarBg)
  root.style.setProperty('--jarvis-sidebar-hover',c.sidebarHover)
  root.style.setProperty('--jarvis-sidebar-active',c.sidebarActive)
  root.style.setProperty('--jarvis-text-primary', c.sidebarText)
}
