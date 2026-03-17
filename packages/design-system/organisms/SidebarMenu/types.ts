/**
 * Tipos del SidebarMenu
 *
 * Permite definir estructura de navegación
 * reutilizable en cualquier aplicación.
 */

export type MenuItem = {

  /** texto visible del menú */
  label: string

  /** ruta del router */
  path: string

  /** icon opcional */
  icon?: React.ReactNode

  /** submenus opcionales */
  children?: MenuItem[]
}