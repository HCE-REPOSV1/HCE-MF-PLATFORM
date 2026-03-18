// ─────────────────────────────────────────────────────────
// @jarvis/design-system — Public API
// ─────────────────────────────────────────────────────────

// ── Themes ────────────────────────────────────────────────
export { theme }          from "./theme/theme"
export { emergencyTheme } from "./theme/emergencyTheme"

// ── Provider ──────────────────────────────────────────────
export { DSProvider } from "./provider/ThemeProvider"

// ── Design Tokens — Base ───────────────────────────────────
export {
  baseTokens,
  baseColors,
  baseTypography,
  baseSpacing,
  baseBorderRadius,
  baseShadows,
  baseZIndex,
  injectBaseTokens,
} from "./tokens/base.tokens"

// ── Design Tokens — Emergency Monitor ─────────────────────
export {
  emergencyTokens,
  emergencyColors,
  emergencyTypography,
  emergencySpacing,
  emergencyBorderRadius,
  emergencyShadows,
  emergencyZIndex,
  emergencyTokensJSON,
  injectEmergencyTokens,
} from "./tokens/emergency.tokens"

// ── MUI Primitives re-exported ─────────────────────────────
export { Box, Typography } from "@mui/material"

// ── Icons ──────────────────────────────────────────────────
export {
  Monitor, Users, BarChart, Settings,
  LayoutDashboard, ClipboardList, BedDouble, Scissors,
  CalendarDays, Stethoscope, FileText, Building2,
  Syringe, Heart, Pill, Plus, Activity,
  Bandage, Asterisk, FlaskConical, Thermometer,
  User, Lock,
} from "./atoms/Icon/Icon"
export type { LucideIcon } from "./atoms/Icon/Icon"

// ── Atoms ─────────────────────────────────────────────────
export { Button }        from "./atoms/Button/Button"
export { Badge }         from "./atoms/Badge/Badge"
export { Chip }          from "./atoms/Chip/Chip"
export { Card }          from "./atoms/Card/Card"
export { PriorityBadge } from "./atoms/PriorityBadge/PriorityBadge"
export { BoxBadge }      from "./atoms/BoxBadge/BoxBadge"
export { AttentionCode } from "./atoms/AttentionCode/AttentionCode"
export { TextInput }     from "./atoms/TextInput/TextInput"
export { SelectField }   from "./atoms/SelectField/SelectField"

// ── Types — Atoms ──────────────────────────────────────────
export type { PriorityLevel } from "./atoms/PriorityBadge/PriorityBadge"
export type { BoxStatus }     from "./atoms/BoxBadge/BoxBadge"

// ── Molecules ─────────────────────────────────────────────
export { ActionBar }           from "./molecules/ActionBar/ActionBar"
export { ActionIconButton }    from "./molecules/ActionIconButton/ActionIconButton"
export { BedsAvailabilityTab } from "./molecules/BedsAvailabilityTab/BedsAvailabilityTab"
export { ClinicalStatusIcon }  from "./molecules/ClinicalStatusIcon/ClinicalStatusIcon"
export { EmergencyHeader }     from "./molecules/EmergencyHeader/EmergencyHeader"
export { EmergencyPagination } from "./molecules/EmergencyPagination/EmergencyPagination"
export { IconButton }          from "./molecules/IconButton/IconButton"
export { InfoButton }          from "./molecules/InfoButton/InfoButton"
export { PatientRow }          from "./molecules/PatientRow/PatientRow"
export { PasswordInput }       from "./molecules/PasswordInput/PasswordInput"

// ── Types — Molecules ──────────────────────────────────────
export type { ClinicalIconStatus } from "./molecules/ClinicalStatusIcon/ClinicalStatusIcon"
export type { PatientRowData }     from "./molecules/PatientRow/PatientRow"
export type { ExtraAction }        from "./molecules/ActionBar/ActionBar"

// ── Organisms ─────────────────────────────────────────────
export { Header }                from "./organisms/Header/Header"
export { Footer }                from "./organisms/Footer/Footer"
export { SideNav }               from "./organisms/SideNav/SideNav"
export { DataTable }             from "./organisms/DataTable/DataTable"
export { Pagination }            from "./organisms/Pagination/Pagination"
export { PatientTable }          from "./organisms/PatientTable/PatientTable"
export { BedAvailabilityDrawer } from "./organisms/BedAvailability/BedAvailabilityDrawer"
export { SidebarMenu }           from "./organisms/SidebarMenu/SidebarMenu"

// ── Types — Organisms ──────────────────────────────────────
export type { MenuItem } from "./organisms/SidebarMenu/types"
