/**
 * PageContainer
 *
 * Contenedor estándar para páginas.
 */

import "./PageContainer.css"

type Props = {
  title: string
  children: React.ReactNode
}

export const PageContainer = ({ title, children }: Props) => {
  return (
    <div className="page-container">
      <h1 className="page-title">
        {title}
      </h1>
      <div className="page-content">
        {children}
      </div>
    </div>
  )
}