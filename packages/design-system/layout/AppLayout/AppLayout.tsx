/**
 * AppLayout
 *
 * Layout principal reusable del sistema.
 * Implementa el patrón "Application Shell".
 *
 * Responsabilidades:
 * - Sidebar
 * - Header
 * - Content
 */

import React from "react"
import "./AppLayout.css"

type Props = {
  header: React.ReactNode
  navigation: React.ReactNode
  children: React.ReactNode
}

export const AppLayout = ({ header, navigation, children }: Props) => {
  return (
    <div className="jarvis-layout">
      {/* Sidebar */}
      <aside className="jarvis-sidebar">
        {navigation}
      </aside>
      {/* Main area */}
      <div className="jarvis-main">
        {/* Header */}
        <header className="jarvis-header">
          {header}
        </header>
        {/* Page content */}
        <main className="jarvis-content">
          {children}
        </main>
      </div>
    </div>
  )
}